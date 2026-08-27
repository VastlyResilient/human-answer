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
    () =>
      Array.from({ length: book.pages }, (_, idx) => {
        const i = idx + 1
        const t = i / book.pages
        return { i, t }
      }),
    [book.pages],
  )

  return (
    <div className="book" style={{ width: `${200 + depth + 1.1}px` }}>
      <div
        className="book-hinge"
        style={{ width: `${depth + 1}px`, background: book.theme }}
      />
      <div
        className="book-layer book-back-cover"
        style={{ background: book.theme, transform: `translateX(${depth}px) skewY(${SKEW})` }}
      />
      {pages.map(({ i, t }) => (
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
      ))}
      <div
        className="book-layer book-front-cover"
        style={{ transform: `skewY(${SKEW})`, backgroundImage: `url(${book.cover})` }}
      />
    </div>
  )
}

export default function BookshelfWindowContent({ embedded = false }: { embedded?: boolean }) {
  const [selected, setSelected] = useState<AnswerBook | null>(null)

  // duplicate the set like the reference so the loop is seamless
  const doubled = useMemo(() => [...BOOKS, ...BOOKS], [])

  function buildTrack() {
    return doubled.map((book, i) => (
      <div
        key={`${book.id}-${i}`}
        className="book-wrap"
        style={{ zIndex: doubled.length - i }}
        onClick={() => setSelected(book)}
      >
        <Book book={book} />
      </div>
    ))
  }

  return (
    <div className={embedded ? 'px-2 pb-4 pt-2' : 'px-2 py-4'}>
      {/* Header strip */}
      <div className="mx-auto mb-1 flex max-w-3xl items-center justify-between gap-3 px-3">
        <p className="text-xs leading-relaxed text-zinc-500">
          Preview editions themed on Matt&rsquo;s most profound answers. Click a spine.
        </p>
        <span className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
          <Info size={11} /> Preview library
        </span>
      </div>

      {/* Marquee */}
      <div className="answers-shelf">
        <div className="marquee-mask" aria-label="Answer volumes marquee">
        <div className="marquee-fade">
            <div className="marquee-track">{buildTrack()}</div>
          </div>
        </div>
      </div>

      {/* Detail card */}
      {selected && (
        <div className="mx-auto mt-2 max-w-3xl rounded-xl p-5 sm:p-6"
             style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[#DA3F23]">
                {selected.topic} · Preview edition
              </span>
              <h3 className="mt-1 text-xl font-semibold tracking-tight text-white">
                {selected.title.join(' ')}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-300">{selected.takeaway}</p>
              <p className="mt-2 text-xs text-zinc-500">
                Full text publishes when Matt&rsquo;s Quora archive export lands — nothing here is
                written for him.
              </p>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="rounded-lg bg-zinc-800/70 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-zinc-700/70 hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
