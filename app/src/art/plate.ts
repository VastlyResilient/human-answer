// ============================================================
// Procedural engraving-plate generator — unique image per page.
// Seeded from book id + question + page index, so every page of
// every book gets a DIFFERENT, theme-matched vintage plate.
// ============================================================ */
import { detectMotif } from './scene'

interface Palette { ink: string; mid: string; light: string; paper: string }

const PALETTES: Palette[] = [
  { ink: '#3a2a16', mid: '#6b5233', light: '#9a7c4a', paper: '#efe3c6' },
  { ink: '#45230f', mid: '#7a3a14', light: '#b06a2a', paper: '#f0e2c8' },
  { ink: '#1a2330', mid: '#33455e', light: '#6a7fa0', paper: '#e8e2d0' },
  { ink: '#24301c', mid: '#425232', light: '#75855c', paper: '#ece4c8' },
  { ink: '#2c1434', mid: '#5c3464', light: '#8f5f96', paper: '#eee4d2' },
]

function hash(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) }
  return h >>> 0
}
function rng(seed: number) {
  let s = seed || 1
  return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000 }
}
type R = () => number
const range = (r: R, a: number, b: number) => a + r() * (b - a)
const pick = <T,>(r: R, a: T[]) => a[Math.floor(r() * a.length) % a.length]

const W = 560, H = 330

function sun(r: R, cy: number, p: Palette, night: boolean) {
  const cx = range(r, W * 0.22, W * 0.78), rad = range(r, 18, 30)
  let s = ''
  if (night) {
    s += `<circle cx='${cx}' cy='${cy}' r='${rad}' fill='none' stroke='${p.mid}' stroke-width='2'/>`
    s += `<circle cx='${cx - rad * 0.4}' cy='${cy - rad * 0.3}' r='${rad * 0.85}' fill='${p.paper}' opacity='0.95'/>`
  } else {
    s += `<circle cx='${cx}' cy='${cy}' r='${rad}' fill='none' stroke='${p.mid}' stroke-width='2'/>`
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2
      s += `<line x1='${cx + Math.cos(a) * (rad + 4)}' y1='${cy + Math.sin(a) * (rad + 4)}' x2='${cx + Math.cos(a) * (rad + 13)}' y2='${cy + Math.sin(a) * (rad + 13)}' stroke='${p.light}' stroke-width='1.2'/>`
    }
  }
  return { s, cx }
}
function stars(r: R, n: number, p: Palette) {
  let s = ''
  for (let i = 0; i < n; i++) {
    const x = range(r, 12, W - 12), y = range(r, 12, H * 0.5)
    if (r() < 0.4) s += `<path d='M${x - 3} ${y} H${x + 3} M${x} ${y - 3} V${y + 3}' stroke='${p.mid}' stroke-width='1'/>`
    else s += `<circle cx='${x}' cy='${y}' r='${range(r, 0.8, 1.6)}' fill='${p.mid}'/>`
  }
  return s
}
function birds(r: R, n: number, p: Palette) {
  let s = '', x = range(r, W * 0.15, W * 0.6), y = range(r, H * 0.14, H * 0.3)
  for (let i = 0; i < n; i++) {
    s += `<path d='M${x - 5} ${y} Q${x - 2} ${y - 4} ${x} ${y} Q${x + 2} ${y - 4} ${x + 5} ${y}' fill='none' stroke='${p.mid}' stroke-width='1.1'/>`
    x += range(r, 12, 22); y += range(r, -6, 8)
  }
  return s
}
function hills(r: R, baseY: number, rows: number, p: Palette) {
  let s = ''
  for (let i = 0; i < rows; i++) {
    const y = baseY + i * range(r, 14, 24)
    const p1 = range(r, W * 0.2, W * 0.45), p2 = range(r, W * 0.55, W * 0.8)
    s += `<path d='M0 ${y + 8} Q${W * 0.2} ${y - range(r, 4, 14)} ${p1} ${y} T${p2} ${y - range(r, 2, 10)} T${W} ${y + 6}' fill='none' stroke='${p.mid}' stroke-width='1.3' opacity='${1 - i * 0.18}'/>`
  }
  return s
}
function waves(r: R, baseY: number, rows: number, p: Palette) {
  let s = ''
  for (let i = 0; i < rows; i++) {
    const y = baseY + i * 16
    let d = `M0 ${y}`
    for (let x = 0; x < W; x += 46) d += ` Q${x + 23} ${y - 7} ${x + 46} ${y}`
    s += `<path d='${d}' fill='none' stroke='${p.mid}' stroke-width='1.2' opacity='${1 - i * 0.16}'/>`
  }
  return s
}
function ship(r: R, waterY: number, p: Palette) {
  const x = range(r, W * 0.3, W * 0.6), s = range(r, 0.8, 1.15)
  return `<g transform='translate(${x} ${waterY}) scale(${s})'>` +
    `<path d='M-28 0 L28 0 L19 12 L-19 12 Z' fill='none' stroke='${p.ink}' stroke-width='1.8'/>` +
    `<line x1='0' y1='0' x2='0' y2='-36' stroke='${p.ink}' stroke-width='1.8'/>` +
    `<path d='M2 -34 L24 -6 L2 -6 Z' fill='${p.paper}' stroke='${p.ink}' stroke-width='1.4'/>` +
    `<path d='M-2 -28 L-19 -6 L-2 -6 Z' fill='none' stroke='${p.ink}' stroke-width='1.4'/>` +
    `</g>`
}
function tree(r: R, baseY: number, p: Palette, bare: boolean) {
  const x = range(r, W * 0.16, W * 0.84), h = range(r, 44, 70)
  let s = `<path d='M${x} ${baseY} L${x} ${baseY - h}' stroke='${p.ink}' stroke-width='2.4'/>`
  if (bare) {
    s += `<path d='M${x} ${baseY - h} L${x - 14} ${baseY - h - 16} M${x} ${baseY - h} L${x + 13} ${baseY - h - 18} M${x} ${baseY - h * 0.7} L${x - 10} ${baseY - h * 0.7 - 13} M${x} ${baseY - h * 0.75} L${x + 11} ${baseY - h * 0.8 - 10}' fill='none' stroke='${p.ink}' stroke-width='1.6'/>`
  } else {
    s += `<circle cx='${x}' cy='${baseY - h - 12}' r='${range(r, 16, 23)}' fill='none' stroke='${p.mid}' stroke-width='1.6'/>`
  }
  return s
}
function house(r: R, baseY: number, p: Palette) {
  const x = range(r, W * 0.28, W * 0.55), w = range(r, 44, 58), h = range(r, 30, 40)
  let s = `<rect x='${x}' y='${baseY - h}' width='${w}' height='${h}' fill='none' stroke='${p.ink}' stroke-width='1.8'/>`
  s += `<path d='M${x - 6} ${baseY - h} L${x + w / 2} ${baseY - h - 22} L${x + w + 6} ${baseY - h} Z' fill='none' stroke='${p.ink}' stroke-width='1.8'/>`
  s += `<rect x='${x + w / 2 - 7}' y='${baseY - h * 0.55}' width='14' height='${h * 0.55}' fill='${p.paper}' stroke='${p.ink}' stroke-width='1.2'/>`
  s += `<path d='M${x + w * 0.78} ${baseY - h - 20} q6 -8 0 -16 q-5 -7 1 -13' fill='none' stroke='${p.light}' stroke-width='1.3'/>`
  return s
}
function figure(r: R, baseY: number, p: Palette) {
  const x = range(r, W * 0.4, W * 0.6)
  return `<g stroke='${p.ink}' stroke-width='1.8' fill='none'>` +
    `<circle cx='${x}' cy='${baseY - 26}' r='3.4'/>` +
    `<line x1='${x}' y1='${baseY - 22}' x2='${x}' y2='${baseY - 8}'/>` +
    `<line x1='${x}' y1='${baseY - 8}' x2='${x - 5}' y2='${baseY}'/>` +
    `<line x1='${x}' y1='${baseY - 8}' x2='${x + 5}' y2='${baseY}'/>` +
    `<line x1='${x}' y1='${baseY - 18}' x2='${x - 6}' y2='${baseY - 10}'/>` +
    `<line x1='${x}' y1='${baseY - 18}' x2='${x + 7}' y2='${baseY - 12}'/>` + `</g>`
}
function rainbow(r: R, baseY: number, p: Palette) {
  const cx = W / 2
  let s = ''
  for (let i = 0; i < 3; i++)
    s += `<path d='M${cx - 90 + i * 12} ${baseY} A${90 - i * 12} ${90 - i * 12} 0 0 1 ${cx + 90 - i * 12} ${baseY}' fill='none' stroke='${p.light}' stroke-width='1.6' opacity='${0.75 - i * 0.18}'/>`
  return s
}
function fence(r: R, baseY: number, p: Palette) {
  let s = ''
  for (let i = 0; i < 6; i++) {
    const x = W * 0.12 + i * ((W * 0.76) / 5)
    s += `<line x1='${x}' y1='${baseY}' x2='${x}' y2='${baseY - range(r, 14, 20)}' stroke='${p.mid}' stroke-width='1.4'/>`
  }
  s += `<line x1='${W * 0.1}' y1='${baseY - 12}' x2='${W * 0.9}' y2='${baseY - 14}' stroke='${p.mid}' stroke-width='1.1'/>`
  return s
}
function road(r: R, horizonY: number, p: Palette) {
  const fx = range(r, W * 0.4, W * 0.6)
  let s = `<path d='M${W * 0.3} ${H + 4} C${W * 0.34} ${horizonY + 90}, ${fx - 10} ${horizonY + 40}, ${fx - 6} ${horizonY}' fill='none' stroke='${p.mid}' stroke-width='1.6'/>`
  s += `<path d='M${W * 0.72} ${H + 4} C${W * 0.66} ${horizonY + 90}, ${fx + 12} ${horizonY + 40}, ${fx + 8} ${horizonY}' fill='none' stroke='${p.mid}' stroke-width='1.6'/>`
  return s
}
function frame(p: Palette) {
  return `<rect x='6' y='6' width='${W - 12}' height='${H - 12}' fill='none' stroke='${p.mid}' stroke-width='1.5'/>` +
         `<rect x='11' y='11' width='${W - 22}' height='${H - 22}' fill='none' stroke='${p.mid}' stroke-width='0.6' opacity='0.6'/>`
}

export function uniquePlateSvg(seedText: string): string {
  const seed = hash(seedText)
  const r = rng(seed)
  const motif = detectMotif(seedText)
  const p = pick(r, PALETTES)
  const horizon = range(r, H * 0.5, H * 0.62)
  const night = motif === 'night' || r() < 0.15
  let scene = ''

  switch (motif) {
    case 'sea':
      scene += sun(r, horizon - 40, p, false).s
      scene += birds(r, Math.round(range(r, 2, 4)), p)
      scene += ship(r, horizon + 6, p)
      scene += waves(r, horizon + 14, 4, p)
      break
    case 'road':
      scene += sun(r, horizon - 60, p, false).s
      scene += hills(r, horizon, 2, p)
      scene += road(r, horizon, p)
      scene += figure(r, H - 30, p)
      scene += birds(r, 3, p)
      break
    case 'night':
      scene += stars(r, 14, p)
      scene += sun(r, H * 0.3, p, true).s
      scene += hills(r, horizon + 6, 2, p)
      scene += tree(r, horizon + 40, p, true)
      break
    case 'home':
      scene += sun(r, horizon - 50, p, false).s
      scene += house(r, horizon + 40, p)
      scene += tree(r, horizon + 46, p, false)
      scene += fence(r, horizon + 52, p)
      break
    case 'loss':
      scene += sun(r, horizon - 30, p, true).s
      scene += tree(r, horizon + 30, p, true)
      scene += birds(r, 4, p)
      scene += hills(r, horizon + 10, 2, p)
      break
    case 'bond':
      scene += house(r, horizon + 42, p)
      scene += fence(r, horizon + 50, p)
      scene += tree(r, horizon + 44, p, false)
      scene += sun(r, horizon - 60, p, false).s
      break
    case 'trial':
      scene += stars(r, 8, p)
      scene += `<path d='M0 ${horizon + 20} L${W * 0.42} ${horizon - 30} L${W * 0.46} ${H - 40} L0 ${H - 40} Z' fill='${p.paper}' stroke='${p.mid}' stroke-width='1.4'/>`
      scene += figure(r, horizon - 26, p)
      scene += waves(r, horizon + 60, 3, p)
      break
    case 'money':
      scene += sun(r, horizon - 46, p, false).s
      scene += hills(r, horizon, 3, p)
      scene += fence(r, H - 46, p)
      break
    case 'ordinary':
      scene += rainbow(r, horizon + 40, p)
      scene += house(r, H - 40, p)
      scene += hills(r, horizon + 10, 1, p)
      break
    case 'nature':
      scene += sun(r, horizon - 50, p, false).s
      scene += hills(r, horizon, 3, p)
      scene += tree(r, H - 34, p, false)
      scene += birds(r, 3, p)
      break
    default: {
      const cx = range(r, W * 0.35, W * 0.65), cy = range(r, H * 0.3, H * 0.5)
      for (let i = 1; i <= 4; i++)
        scene += `<circle cx='${cx}' cy='${cy}' r='${i * range(r, 22, 30)}' fill='none' stroke='${p.mid}' stroke-width='1.1' opacity='${1 - i * 0.16}'/>`
      scene += stars(r, 10, p)
      scene += hills(r, horizon + 10, 2, p)
    }
  }

  return `<svg xmlns='http://www.w3.org/2000/svg' width='${W}' height='${H}' viewBox='0 0 ${W} ${H}'>` +
    `<defs><filter id='ht'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/><feColorMatrix type='saturate' values='0'/></filter></defs>` +
    `<rect width='${W}' height='${H}' fill='${p.paper}'/>` + scene +
    `<rect width='${W}' height='${H}' filter='url(#ht)' opacity='0.10'/>` + frame(p) + `</svg>`
}

export function uniquePlate(seedText: string): string {
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(uniquePlateSvg(seedText))
}
