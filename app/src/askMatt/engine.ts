import { KB, FALLBACKS } from './knowledge'

export interface ChatMessage {
  role: 'user' | 'matt'
  text: string
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9' ]/g, ' ')

/** score every KB entry against the message; return best when confident enough */
export function retrieve(message: string): { entryId: string; answer: string } | null {
  const msg = norm(message)
  if (msg.trim().length < 2) return null
  let best: { id: string; answer: string; score: number } | null = null
  for (const entry of KB) {
    let score = 0
    for (const kw of entry.keywords) {
      if (msg.includes(kw)) score += kw.includes(' ') ? 3 : 2
      else {
        const stem = kw.endsWith('s') ? kw.slice(0, -1) : kw
        if (stem.length >= 4 && (msg.includes(stem) || msg.includes(stem + 's'))) score += 1.5
      }
    }
    if (!best || score > best.score) best = { id: entry.id, answer: entry.answer, score }
  }
  if (!best || best.score < 1.5) return null
  return { entryId: best.id, answer: best.answer }
}

export function fallback(): string {
  return FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)]
}

/**
 * Memory-aware reply: short follow-ups like "why?" or "tell me more" keep the
 * thread by re-serving the last answer's story half.
 */
export function reply(message: string, history: ChatMessage[]): { text: string; topic: string | null } {
  const hit = retrieve(message)
  if (hit) return { text: hit.answer, topic: hit.entryId }

  const trimmed = message.trim().toLowerCase()
  const wantsMore = ['more', 'why', 'go on', 'continue', 'elaborate', 'tell me more'].some(
    (p) => trimmed === p || trimmed.startsWith(p),
  )
  if (wantsMore) {
    const lastMatt = [...history].reverse().find((m) => m.role === 'matt')?.text ?? ''
    if (lastMatt) {
      const paras = lastMatt.split('\n\n')
      const tail = paras.slice(1).join('\n\n') || paras[0]
      return { text: tail, topic: null }
    }
  }

  return { text: fallback(), topic: null }
}

export const GREETING =
  "Matt's desk. The kettle is on, the inbox is open. What are you carrying today?\n\n(An AI answering in his style - direct answers first, stories underneath. It owns up to that if you ask.)"
