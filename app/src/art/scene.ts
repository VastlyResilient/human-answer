// ============================================================
// Procedural engraving-plate generator.
// Every book gets unique, title-driven vintage artwork:
//   - palette + composition seeded from the question text
//   - motif chosen from title keywords (sea, road, night, home...)
//   - pure SVG: sepia line-art scenes + hatch textures, no assets
// ============================================================ */

export interface Palette { ink: string; mid: string; light: string; deep: string; paper: string }

const PALETTES: Record<string, Palette> = {
  sepia: { ink: '#402f1a', mid: '#6b5233', light: '#9a7c4a', deep: '#241a0e', paper: '#efe3c6' },
  ember: { ink: '#4a2410', mid: '#7a3a14', light: '#b06a2a', deep: '#2a1408', paper: '#f0e2c8' },
  dusk:  { ink: '#1c2434', mid: '#33455e', light: '#6a7fa0', deep: '#101622', paper: '#e8e2d0' },
  sage:  { ink: '#26321e', mid: '#425232', light: '#75855c', deep: '#141c10', paper: '#ece4c8' },
  plum:  { ink: '#2c1434', mid: '#5c3464', light: '#8f5f96', deep: '#180a1c', paper: '#eee4d2' },
}

function hash(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function rngFrom(seed: number) {
  let s = seed || 1
  return () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5
    return ((s >>> 0) % 100000) / 100000
  }
}

type RNG = () => number
const pick = <T,>(r: RNG, arr: T[]): T => arr[Math.floor(r() * arr.length) % arr.length]
const range = (r: RNG, a: number, b: number) => a + r() * (b - a)

/* ---------------- motif detection ---------------- */
const MOTIF_WORDS: Record<string, string[]> = {
  sea: ['sea', 'ocean', 'naval', 'ship', 'battleship', 'boat', 'sail', 'war', 'navy', 'submarine', 'pirate', 'wave', 'island', 'fish', 'water'],
  road: ['road', 'career', 'change', 'start', 'journey', 'travel', 'move', 'leave', 'path', 'direction', 'forty', 'restart', 'late'],
  night: ['night', 'star', 'moon', 'dark', 'sleep', 'dream', 'sky', 'insomnia', 'midnight', 'silent'],
  home: ['home', 'family', 'parent', 'kid', 'child', 'mother', 'father', 'son', 'daughter', 'house', 'marriage', 'wife', 'husband', 'baby'],
  loss: ['loss', 'grief', 'die', 'death', 'died', 'dying', 'goodbye', 'funeral', 'missing', 'gone'],
  bond: ['friend', 'neighbor', 'neighbour', 'kindness', 'table', 'community', 'lonely', 'together', 'love', 'help', 'stranger', 'chair'],
  trial: ['fear', 'courage', 'brave', 'risk', 'leap', 'fail', 'mistake', 'regret', 'forgive', 'guilt', 'strong', 'overcome'],
  money: ['money', 'wealth', 'rich', 'salary', 'afford', 'invest', 'save', 'debt', 'poor', 'coffee', 'buy', 'enough'],
  ordinary: ['ordinary', 'gratitude', 'grateful', 'daily', 'day', 'small', 'habit', 'morning', 'appreciate', 'normal', 'rainbow'],
  nature: ['tree', 'forest', 'garden', 'grow', 'plant', 'flower', 'walk', 'mountain', 'river', 'field', 'dog', 'animal', 'bird'],
}

function detectMotif(text: string): string {
  const t = text.toLowerCase()
  let best = 'abstract'
  let bestScore = 0
  for (const [motif, words] of Object.entries(MOTIF_WORDS)) {
    let score = 0
    for (const w of words) if (t.includes(w)) score += w.length > 5 ? 2 : 1
    if (score > bestScore) { best = motif; bestScore = score }
  }
  return best
}

/* ---------------- element builders ---------------- */
const PLATE_W = 560
const PLATE_H = 330
const H0 = 336

function elSun(r: RNG, W: number, cy: number, p: Palette, night: boolean) {
  const cx = range(r, W * 0.25, W * 0.75)
  const rad = range(r, 20, 34)
  let s = ''
  if (night) {
    s += `<circle cx='${cx}' cy='${cy}' r='${rad}' fill='none' stroke='${p.mid}' stroke-width='2'/>`
    s += `<circle cx='${cx - rad * 0.35}' cy='${cy - rad * 0.25}' r='${rad * 0.8}' fill='${p.paper}' opacity='0.95'/>`
  } else {
    s += `<circle cx='${cx}' cy='${cy}' r='${rad}' fill='none' stroke='${p.mid}' stroke-width='2'/>`
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2
      s += `<line x1='${cx + Math.cos(a) * (rad + 4)}' y1='${cy + Math.sin(a) * (rad + 4)}' x2='${cx + Math.cos(a) * (rad + 12)}' y2='${cy + Math.sin(a) * (rad + 12)}' stroke='${p.light}' stroke-width='1.2'/>`
    }
  }
  return s
}

function elStars(r: RNG, W: number, H: number, p: Palette, n: number) {
  let s = ''
  for (let i = 0; i < n; i++) {
    const x = range(r, 12, W - 12), y = range(r, 12, H * 0.5)
    if (r() < 0.4) s += `<path d='M${x - 3} ${y} H${x + 3} M${x} ${y - 3} V${y + 3}' stroke='${p.mid}' stroke-width='1'/>`
    else s += `<circle cx='${x}' cy='${y}' r='${range(r, 0.8, 1.6)}' fill='${p.mid}'/>`
  }
  return s
}

function elBirds(r: RNG, W: number, H: number, p: Palette, n: number) {
  let s = ''
  let x = range(r, W * 0.15, W * 0.6)
  let y = range(r, H * 0.14, H * 0.3)
  for (let i = 0; i < n; i++) {
    s += `<path d='M${x - 5} ${y} Q${x - 2} ${y - 4} ${x} ${y} Q${x + 2} ${y - 4} ${x + 5} ${y}' fill='none' stroke='${p.mid}' stroke-width='1.1'/>`
    x += range(r, 12, 22); y += range(r, -6, 8)
  }
  return s
}

function elHills(r: RNG, W: number, baseY: number, p: Palette, rows: number) {
  let s = ''
  for (let i = 0; i < rows; i++) {
    const y = baseY + i * range(r, 14, 24)
    const p1 = range(r, W * 0.2, W * 0.45), p2 = range(r, W * 0.55, W * 0.8)
    s += `<path d='M0 ${y + 8} Q${W * 0.2} ${y - range(r, 4, 14)} ${p1} ${y} T${p2} ${y - range(r, 2, 10)} T${W} ${y + 6}' fill='none' stroke='${p.mid}' stroke-width='1.3' opacity='${1 - i * 0.18}'/>`
  }
  return s
}

function elWaves(r: RNG, W: number, baseY: number, p: Palette, rows: number) {
  let s = ''
  for (let i = 0; i < rows; i++) {
    const y = baseY + i * 16
    let d = `M0 ${y}`
    for (let x = 0; x < W; x += 46) d += ` Q${x + 23} ${y - 7} ${x + 46} ${y}`
    s += `<path d='${d}' fill='none' stroke='${p.mid}' stroke-width='1.2' opacity='${1 - i * 0.16}'/>`
  }
  return s
}

function elRoad(r: RNG, W: number, horizonY: number, p: Palette) {
  const forkX = range(r, W * 0.4, W * 0.6)
  let s = `<path d='M${W * 0.3} ${H0} C${W * 0.34} ${horizonY + 90}, ${forkX - 10} ${horizonY + 40}, ${forkX - 6} ${horizonY}' fill='none' stroke='${p.mid}' stroke-width='1.6'/>`
  s += `<path d='M${W * 0.72} ${H0} C${W * 0.66} ${horizonY + 90}, ${forkX + 12} ${horizonY + 40}, ${forkX + 8} ${horizonY}' fill='none' stroke='${p.mid}' stroke-width='1.6'/>`
  s += `<line x1='${forkX - 6}' y1='${horizonY + 4}' x2='${forkX - 4}' y2='${horizonY + 40}' stroke='${p.light}' stroke-width='0.8' stroke-dasharray='4 5'/>`
  s += `<line x1='${forkX + 8}' y1='${horizonY + 4}' x2='${forkX + 6}' y2='${horizonY + 40}' stroke='${p.light}' stroke-width='0.8' stroke-dasharray='4 5'/>`
  return s
}

function elTree(r: RNG, W: number, baseY: number, p: Palette, bare = false) {
  const x = range(r, W * 0.18, W * 0.82)
  const h = range(r, 46, 72)
  let s = `<path d='M${x} ${baseY} L${x} ${baseY - h}' stroke='${p.ink}' stroke-width='2.4'/>`
  if (bare) {
    s += `<path d='M${x} ${baseY - h} L${x - 14} ${baseY - h - 16} M${x} ${baseY - h} L${x + 13} ${baseY - h - 18} M${x} ${baseY - h * 0.7} L${x - 10} ${baseY - h * 0.7 - 13} M${x} ${baseY - h * 0.75} L${x + 11} ${baseY - h * 0.8 - 10}' fill='none' stroke='${p.ink}' stroke-width='1.6'/>`
  } else {
    s += `<circle cx='${x}' cy='${baseY - h - 12}' r='${range(r, 17, 24)}' fill='none' stroke='${p.mid}' stroke-width='1.6'/>`
  }
  return s
}

function elHouse(r: RNG, W: number, baseY: number, p: Palette) {
  const x = range(r, W * 0.3, W * 0.55)
  const w = range(r, 44, 58), h = range(r, 30, 40)
  let s = `<rect x='${x}' y='${baseY - h}' width='${w}' height='${h}' fill='none' stroke='${p.ink}' stroke-width='1.8'/>`
  s += `<path d='M${x - 6} ${baseY - h} L${x + w / 2} ${baseY - h - 22} L${x + w + 6} ${baseY - h} Z' fill='none' stroke='${p.ink}' stroke-width='1.8'/>`
  s += `<rect x='${x + w / 2 - 7}' y='${baseY - h * 0.55}' width='14' height='${h * 0.55}' fill='${p.paper}' stroke='${p.ink}' stroke-width='1.2'/>`
  s += `<path d='M${x + w * 0.78} ${baseY - h - 20} q6 -8 0 -16 q-5 -7 1 -13' fill='none' stroke='${p.light}' stroke-width='1.3'/>`
  return s
}

function elShip(r: RNG, W: number, waterY: number, p: Palette) {
  const x = range(r, W * 0.3, W * 0.62)
  const s = range(r, 0.8, 1.1)
  let out = `<g transform='translate(${x} ${waterY}) scale(${s})'>`
  out += `<path d='M-26 0 L26 0 L18 12 L-18 12 Z' fill='none' stroke='${p.ink}' stroke-width='1.8'/>`
  out += `<line x1='0' y1='0' x2='0' y2='-34' stroke='${p.ink}' stroke-width='1.8'/>`
  out += `<path d='M2 -32 L22 -6 L2 -6 Z' fill='${p.paper}' stroke='${p.ink}' stroke-width='1.4'/>`
  out += `<path d='M-2 -26 L-18 -6 L-2 -6 Z' fill='none' stroke='${p.ink}' stroke-width='1.4'/>`
  out += `</g>`
  return out
}

function elFigure(r: RNG, W: number, baseY: number, p: Palette) {
  const x = range(r, W * 0.4, W * 0.6)
  return `<g stroke='${p.ink}' stroke-width='1.8' fill='none'>` +
    `<circle cx='${x}' cy='${baseY - 26}' r='3.4'/>` +
    `<line x1='${x}' y1='${baseY - 22}' x2='${x}' y2='${baseY - 8}'/>` +
    `<line x1='${x}' y1='${baseY - 8}' x2='${x - 5}' y2='${baseY}'/>` +
    `<line x1='${x}' y1='${baseY - 8}' x2='${x + 5}' y2='${baseY}'/>` +
    `<line x1='${x}' y1='${baseY - 18}' x2='${x - 6}' y2='${baseY - 10}'/>` +
    `<line x1='${x}' y1='${baseY - 18}' x2='${x + 7}' y2='${baseY - 12}'/>` +
    `</g>`
}

function elRainbow(r: RNG, W: number, baseY: number, p: Palette) {
  const cx = W / 2
  let s = ''
  for (let i = 0; i < 3; i++) {
    s += `<path d='M${cx - 90 + i * 12} ${baseY} A${90 - i * 12} ${90 - i * 12} 0 0 1 ${cx + 90 - i * 12} ${baseY}' fill='none' stroke='${p.light}' stroke-width='1.6' opacity='${0.75 - i * 0.18}'/>`
  }
  return s
}

function elFence(r: RNG, W: number, baseY: number, p: Palette) {
  let s = ''
  for (let i = 0; i < 6; i++) {
    const x = W * 0.12 + i * ((W * 0.76) / 5)
    s += `<line x1='${x}' y1='${baseY}' x2='${x}' y2='${baseY - range(r, 14, 20)}' stroke='${p.mid}' stroke-width='1.4'/>`
  }
  s += `<line x1='${W * 0.1}' y1='${baseY - 12}' x2='${W * 0.9}' y2='${baseY - 14}' stroke='${p.mid}' stroke-width='1.1'/>`
  return s
}

function elFrame(W: number, H: number, p: Palette) {
  return `<rect x='6' y='6' width='${W - 12}' height='${H - 12}' fill='none' stroke='${p.mid}' stroke-width='1.5'/>` +
         `<rect x='11' y='11' width='${W - 22}' height='${H - 22}' fill='none' stroke='${p.mid}' stroke-width='0.6' opacity='0.6'/>`
}

/* ---------------- scene assembly ---------------- */
export interface SceneArt { plate: string; medallion: string; motif: string }

export function buildScene(seedText: string): SceneArt {
  const seed = hash(seedText)
  const r = rngFrom(seed)
  const motif = detectMotif(seedText)
  const palName = pick(r, Object.keys(PALETTES))
  const p = PALETTES[palName]
  const W = PLATE_W, H = PLATE_H
  const horizon = range(r, H * 0.52, H * 0.62)
  const night = motif === 'night' || r() < 0.15

  let scene = ''
  switch (motif) {
    case 'sea':
      scene += elSun(r, W, horizon - 40, p, false)
      scene += elBirds(r, W, H * 0.2, p, Math.round(range(r, 2, 4)))
      scene += elShip(r, W, horizon + 6, p)
      scene += elWaves(r, W, horizon + 14, p, 4)
      break
    case 'road':
      scene += elSun(r, W, horizon - 60, p, false)
      scene += elHills(r, W, horizon, p, 2)
      scene += elRoad(r, W, horizon, p)
      scene += elFigure(r, W * 0.42, H - 30, p)
      scene += elBirds(r, W, H * 0.18, p, 3)
      break
    case 'night':
      scene += elStars(r, W, H, p, 14)
      scene += elSun(r, W, H * 0.3, p, true)
      scene += elHills(r, W, horizon + 6, p, 2)
      scene += elTree(r, W * 0.8, horizon + 40, p, true)
      break
    case 'home':
      scene += elSun(r, W, horizon - 50, p, false)
      scene += elHouse(r, W, horizon + 40, p)
      scene += elTree(r, W * 0.16, horizon + 46, p, false)
      scene += elFence(r, W, horizon + 52, p)
      break
    case 'loss':
      scene += elSun(r, W, horizon - 30, p, true)
      scene += elTree(r, W * 0.6, horizon + 30, p, true)
      scene += elBirds(r, W, H * 0.22, p, 4)
      scene += elHills(r, W, horizon + 10, p, 2)
      break
    case 'bond':
      scene += elHouse(r, W * 0.92, horizon + 42, p)
      scene += elFence(r, W, horizon + 50, p)
      scene += elTree(r, W * 0.12, horizon + 44, p, false)
      scene += elSun(r, W * 0.88, horizon - 60, p, false)
      break
    case 'trial':
      scene += elStars(r, W, H, p, 8)
      scene += `<path d='M0 ${horizon + 20} L${W * 0.42} ${horizon - 30} L${W * 0.46} ${H - 40} L0 ${H - 40} Z' fill='${p.paper}' stroke='${p.mid}' stroke-width='1.4'/>`
      scene += elFigure(r, W * 0.44, horizon - 26, p)
      scene += elWaves(r, W, horizon + 60, p, 3)
      break
    case 'money':
      scene += elSun(r, W, horizon - 46, p, false)
      scene += elHills(r, W, horizon, p, 3)
      scene += elFence(r, W, H - 46, p)
      break
    case 'ordinary':
      scene += elRainbow(r, W, horizon + 40, p)
      scene += elHouse(r, W * 0.95, H - 40, p)
      scene += elHills(r, W, horizon + 10, p, 1)
      break
    case 'nature':
      scene += elSun(r, W, horizon - 50, p, false)
      scene += elHills(r, W, horizon, p, 3)
      scene += elTree(r, W * 0.7, H - 34, p, false)
      scene += elBirds(r, W, H * 0.2, p, 3)
      break
    default: {
      const cx = range(r, W * 0.35, W * 0.65), cy = range(r, H * 0.3, H * 0.5)
      for (let i = 1; i <= 4; i++) {
        scene += `<circle cx='${cx}' cy='${cy}' r='${i * range(r, 22, 30)}' fill='none' stroke='${p.mid}' stroke-width='1.1' opacity='${1 - i * 0.16}'/>`
      }
      scene += elStars(r, W, H, p, 10)
      scene += elHills(r, W, horizon + 10, p, 2)
    }
  }

  const defs =
    `<defs>` +
    `<filter id='hatch'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/><feColorMatrix type='saturate' values='0'/></filter>` +
    `</defs>`

  const plate =
    `<svg xmlns='http://www.w3.org/2000/svg' width='${W}' height='${H}' viewBox='0 0 ${W} ${H}'>` +
    defs +
    `<rect width='${W}' height='${H}' fill='${p.paper}'/>` +
    scene +
    `<rect width='${W}' height='${H}' filter='url(#hatch)' opacity='0.10'/>` +
    elFrame(W, H, p) +
    `</svg>`

  /* medallion for the cover: roundel vignette, cream-on-dark */
  const M = 150
  const mR = M / 2 - 8
  const mp: Palette = { ink: '#f2ecdd', mid: 'rgba(242,236,221,0.7)', light: 'rgba(255,138,61,0.9)', deep: '#000', paper: 'transparent' }
  let med = `<circle cx='${M / 2}' cy='${M / 2}' r='${mR}' fill='none' stroke='rgba(242,236,221,0.5)' stroke-width='1.4'/>`
  med += `<clipPath id='mc'><circle cx='${M / 2}' cy='${M / 2}' r='${mR - 4}'/></clipPath>`
  const mh = M / 2 + 6
  med += `<g clip-path='url(#mc)'>`
  med += `<line x1='0' y1='${mh}' x2='${M}' y2='${mh}' stroke='rgba(242,236,221,0.55)' stroke-width='1.2'/>`
  med += `<circle cx='${M / 2 + (seed % 30) - 15}' cy='${mh - range(r, 14, 30)}' r='${range(r, 9, 15)}' fill='none' stroke='rgba(255,138,61,0.9)' stroke-width='1.6'/>`
  med += elStars(rngFrom(seed ^ 7), M, mh, mp, 7)
  med += elHills(rngFrom(seed ^ 13), M, mh, mp, 2)
  med += `</g>`

  return { plate, medallion: med, motif }
}

export function svgDataUri(svg: string): string {
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg)
}
