import { useMemo, useState } from 'react'
import { Info, ArrowLeft } from 'lucide-react'
import { ANSWER_TOMES } from '../answersData'
import TomeReader from './TomeReader'
import type { AnswerBook } from '../types'

const PAGE_STEP = 1.1
const PAGE_INSET = 8
const SKEW = '30deg'

function Book({ book }: { book: AnswerBook }) {
  const depth = PAGE_STEP * (book.pages + 1)
  const pages = useMemo(() => Array.from({ length: book.pages }, (_, idx) => ({ i: idx + 1 })), [book.pages])
  return (
    <div className="book" style={{ width: `${200 + depth + 1.1}px` }} title={book.title.join(' ')}>
      <div className="book-hinge" style={{ width: `${depth + 1}px`, background: book.theme }} />
      <div className="book-layer book-back-cover"
           style={{ background: book.theme, transform: `translateX(${depth}px) skewY(${SKEW})` }} />
      {pages.map(({ i }) => {
        const t = i / book.pages
        return (
          <div key={i} className="book-layer book-page"
               style={{
                 transform: `translateX(${PAGE_STEP * i}px) skewY(${SKEW})`,
                 zIndex: 2 + (book.pages - i),
                 filter: `brightness(${(1 - t * 0.06).toFixed(3)})`,
                 top: `${PAGE_INSET / 2}px`,
                 height: `calc(100% - ${PAGE_INSET}px)`,
               }} />
        )
      })}
      <div className="book-layer book-front-cover"
           style={{ transform: `skewY(${SKEW})`, backgroundImage: `url(${book.cover})` }} />
    </div>
  )
}

export default function BookshelfWindowContent() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const doubled = useMemo(() => [...ANSWER_TOMES, ...ANSWER_TOMES], [])
  const selected = ANSWER_TOMES.find((b) => b.id === selectedId) ?? null

  if (selected) {
    // ====== OPENED BOOK: the reference leather/parchment spread ======
    return (
      <div className="px-4 pb-6 pt-3 sm:px-6">
        <button
          onClick={() => setSelectedId(null)}
          className="mb-3 inline-flex items-center gap-1.5 rounded-lg bg-zinc-800/70 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-zinc-700/70 hover:text-white"
        >
          <ArrowLeft size={12} /> Back to the shelf
        </button>
        <TomeReader tome={selected} />
      </div>
    )
  }

  // ====== SHELF: carousel + index (unchanged look) ======
  return (
    <div className="pb-4 pt-1">
      <div className="mx-auto mb-1 flex max-w-4xl items-center justify-between gap-3 px-5">
        <p className="text-xs leading-relaxed text-zinc-500">
          Full answers live inside these volumes. Click a spine to open the book.
        </p>
        <span className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
          <Info size={11} /> {ANSWER_TOMES.length} volumes · more as the export lands
        </span>
      </div>

      <div className="answers-shelf">
        <div className="marquee-mask" aria-label="Answer volumes marquee">
          <div className="marquee-fade">
            <div className="marquee-track">
              {doubled.map((book, i) => (
                <div key={`${book.id}-${i}`} className="book-wrap"
                     style={{ zIndex: doubled.length - i }}
                     onClick={() => setSelectedId(book.id)}>
                  <Book book={book} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-2 grid max-w-4xl grid-cols-2 gap-2 px-5 sm:grid-cols-3 lg:grid-cols-5">
        {ANSWER_TOMES.map((b) => (
          <button key={b.id} onClick={() => setSelectedId(b.id)}
                  className={`rounded-lg px-3 py-2 text-left transition-colors ${
                    selectedId === b.id ? 'bg-white/15' : 'bg-white/[0.04] hover:bg-white/10'
                  }`}>
            <div className="truncate text-[11px] font-semibold text-zinc-200">{b.title.join(' ')}</div>
            <div className="truncate text-[10px] text-zinc-500">{b.questionSummary}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
