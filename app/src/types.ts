export interface WindowState {
  id: string
  title: string
  kind: 'answers' | 'about' | 'column' | 'ask' | 'book'
  zIndex: number
  x?: number
  y?: number
}

export interface AnswerBook {
  id: string
  title: string[]
  theme: string            // css gradient fallback / spine color
  cover: string            // /covers/*.jpg artwork
  topic: string
  takeaway: string         // direct-answer style line (format example framing)
  pages: number
}
