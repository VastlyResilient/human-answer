import { useMemo, useState } from 'react'
import { Info } from 'lucide-react'
import { BOOKS } from '../booksData'
import type { AnswerBook } from '../types'

const PAGE_STEP = 1.1
const PAGE_INSET = 8
const SKEW = '30deg'

function Book({ book }: { book: AnswerBook }) {
  const depth = PAGE_STEP * (book.pages + 1)
  const pages = useMemo(
    () => Array.from({ length: book.pages }, (_, idx) => ({ i: idx + 1 })),
    [book.pages],
  )
  return (
    <div className="book" style={{ width: `${200 + depth + 1.1}px` }} title={book.title.join(' ')}>
      <div className="book-hinge" style={{ width: `${depth + 1}px`, background: book.theme }} />
      <div
        className="book-layer book-back-cover"
        style={{ background: book.theme, transform: `translateX(${depth}px) skewY(${SKEW})` }}
      />
      {pages.map(({ i }) => {
        const t = i / book.pages
        return (
          <div
            key={i}
            className="book-layer book-page"
            style={{
              transform: `translateX(${PAGE_STEP * i}px) skewY(${SKEW})`,
              zIndex: 2 + (book.pages - i),
              filter: `brightness(${(1 - t * 0.06).toFixed(3)})`,
              top: `${PAGE_INSET / 2}px`,
              height: `calc(100% - ${PAGE_INSET}px)`,
            }}
          />
        )
      })}
      <div
        className="book-layer book-front-cover"
        style={{ transform: `skewY(${SKEW})`, backgroundImage: `url(${book.cover})` }}
      />
    </div>
  )
}

export default function BookshelfWindowContent() {
  const [selected, setSelected] = useState<AnswerBook | null>(null)
  const doubled = useMemo(() => [...BOOKS, ...BOOKS], [])

  return (
    <div className="pb-4 pt-1">
      <div className="mx-auto mb-1 flex max-w-4xl items-center justify-between gap-3 px-5">
        <p className="text-xs leading-relaxed text-zinc-500">
          Preview editions built around Matt&rsquo;s most profound answer territory. Click a volume
          for its question and the answer&rsquo;s spine.
        </p>
        <span className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
          <Info size={11} /> Preview library
        </span>
      </div>

      <div className="answers-shelf">
        <div className="marquee-mask" aria-label="Answer volumes marquee">
          <div className="marquee-fade">
            <div className="marquee-track">
              {doubled.map((book, i) => (
                <div
                  key={`${book.id}-${i}`}
                  className="book-wrap"
                  style={{ zIndex: doubled.length - i }}
                  onClick={() => setSelected(book)}
                >
                  <Book book={book} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Card index grid below the shelf - every volume browsable at once */}
      <div className="mx-auto mt-2 grid max-w-4xl grid-cols-2 gap-2 px-5 sm:grid-cols-3 lg:grid-cols-5">
        {BOOKS.map((b) => (
          <button
            key={b.id}
            onClick={() => setSelected(b)}
            className={`rounded-lg px-3 py-2 text-left transition-colors ${
              selected?.id === b.id ? 'bg-white/15' : 'bg-white/[0.04] hover:bg-white/10'
            }`}
          >
            <div className="truncate text-[11px] font-semibold text-zinc-200">{b.title.join(' ')}</div>
            <div className="text-[10px] text-zinc-500">{b.topic}</div>
          </button>
        ))}
      </div>

      {selected && (
        <div className="mx-auto mt-3 max-w-4xl rounded-xl p-5 sm:p-6"
             style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: '#DA3F23' }}>
                {selected.topic} · preview edition
              </span>
              <h3 className="mt-1 truncate text-xl font-semibold tracking-tight text-white">
                {selected.title.join(' ')}
              </h3>
              <p className="mt-3 text-[13px] uppercase tracking-wide text-zinc-500">The question it answers</p>
              <p className="mt-1 text-sm font-medium leading-relaxed text-zinc-200">{selected.questionSummary}</p>
              <p className="mt-3 text-[13px] uppercase tracking-wide text-zinc-500">The spine of the answer</p>
              <p className="mt-1 text-sm leading-relaxed text-zinc-300">{selected.takeaway}</p>
              <p className="mt-3 text-xs leading-relaxed text-zinc-600">
                Full verbatim answers publish when Matt&rsquo;s Quora archive export lands &mdash;
                nothing here is written for him.
              </p>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="flex-shrink-0 rounded-lg bg-zinc-800/70 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-zinc-700/70 hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
