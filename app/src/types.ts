export type WinKind = 'about' | 'answers' | 'column' | 'ask' | 'book' | 'record'

export interface WindowState {
  id: string
  kind: WinKind
  title: string
  zIndex: number
  x: number
  y: number
  minimized: boolean
  maximized: boolean
}

export interface AnswerBook {
  id: string
  title: string[]
  theme: string
  cover: string
  topic: string
  questionSummary: string
  takeaway: string
  pages: number
}
