// Motif detection -> maps each answer to its themed historic artwork pair.
// All artwork AI-generated in a consistent 19th-century literary style.

export type Motif =
  | 'sea' | 'road' | 'night' | 'home' | 'loss'
  | 'bond' | 'trial' | 'money' | 'ordinary' | 'nature' | 'abstract'

const MOTIF_WORDS: Record<Motif, string[]> = {
  sea: ['sea', 'ocean', 'naval', 'ship', 'battleship', 'boat', 'sail', 'war', 'navy', 'submarine', 'pirate', 'wave', 'island', 'water', 'military', 'gun', 'tank', 'ww1', 'ww2', 'warship'],
  road: ['road', 'career', 'change', 'start', 'journey', 'travel', 'move', 'leave', 'path', 'direction', 'forty', 'restart', 'late', 'quit', 'new job'],
  night: ['night', 'star', 'moon', 'dark', 'sleep', 'dream', 'sky', 'insomnia', 'midnight', 'quiet'],
  home: ['home', 'family', 'parent', 'kid', 'child', 'mother', 'father', 'son', 'daughter', 'house', 'marriage', 'wife', 'husband', 'baby', 'raise'],
  loss: ['loss', 'grief', 'die', 'death', 'died', 'dying', 'goodbye', 'funeral', 'missing', 'gone', 'alone'],
  bond: ['friend', 'neighbor', 'neighbour', 'kindness', 'table', 'community', 'lonely', 'together', 'love', 'help', 'stranger', 'chair', 'married', 'relationship'],
  trial: ['fear', 'courage', 'brave', 'risk', 'leap', 'fail', 'mistake', 'regret', 'forgive', 'guilt', 'strong', 'overcome', 'hard', 'struggle', 'bridge'],
  money: ['money', 'wealth', 'rich', 'salary', 'afford', 'invest', 'save', 'debt', 'poor', 'coffee', 'buy', 'enough', 'price', 'cost'],
  ordinary: ['ordinary', 'gratitude', 'grateful', 'daily', 'small', 'habit', 'morning', 'appreciate', 'normal', 'rainbow', 'little thing'],
  nature: ['tree', 'forest', 'garden', 'grow', 'plant', 'flower', 'walk', 'mountain', 'river', 'field', 'dog', 'animal', 'bird'],
  abstract: [],
}

export function detectMotif(text: string): Motif {
  const t = ' ' + text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ') + ' '
  let best: Motif = 'abstract'
  let bestScore = 0
  ;(Object.keys(MOTIF_WORDS) as Motif[]).forEach((motif) => {
    let score = 0
    for (const w of MOTIF_WORDS[motif]) {
      // whole-word match with word boundaries - prevents 'war' matching inside
      // 'wardrobe' and stops high-frequency words from dominating every book
      const re = new RegExp('\\b' + w.replace(/\s/g, '\\s+') + '(s|es)?\\b')
      if (re.test(t)) score += w.length > 5 ? 2 : 1
    }
    if (score > bestScore) { best = motif; bestScore = score }
  })
  return best
}

export interface BookArt { motif: Motif; cover: string; plate: string }

const VISUAL_MOTIFS: Motif[] = ['sea', 'road', 'night', 'home', 'loss', 'bond', 'trial', 'money', 'ordinary', 'nature']

export function artFor(text: string): BookArt {
  let motif = detectMotif(text)
  if (motif === 'abstract') {
    // no keyword hit: seed-pick a visual motif so art stays varied, deterministic per answer
    const h = hash(text)
    motif = VISUAL_MOTIFS[h % VISUAL_MOTIFS.length]
  }
  return {
    motif,
    cover: `./art/cover-${motif}.jpg`,
    plate: `./art/plate-${motif}.jpg`,
  }
}
