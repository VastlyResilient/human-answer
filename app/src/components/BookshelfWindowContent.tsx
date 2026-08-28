import { useMemo, useState } from 'react'
import { Search, ArrowLeft, ArrowRight, ArrowLeft as Back, BookOpen, Library } from 'lucide-react'
import { ANSWER_TOMES } from '../answersData'
import { artFor } from '../art/scene'
import TomeReader from './TomeReader'
import type { AnswerBook } from '../types'

const PAGE_SIZE = 60
const PAGE_STEP = 1.1
const PAGE_INSET = 8
const SKEW = '30deg'

function Book({ book, index }: { book: AnswerBook & { answer: string[] }; index: number }) {
  const depth = PAGE_STEP * (book.pages + 1)
  const pages = useMemo(() => Array.from({ length: book.pages }, (_, idx) => ({ i: idx + 1 })), [book.pages])
  const art = artFor(book.questionSummary + ' ' + book.title.join(' '))

  return (
    <div className="book" style={{ width: `${200 + depth + 1.1}px` }} title={book.questionSummary}>
      <div className="book-hinge" style={{ width: `${depth + 1}px`, background: art.motif === 'sea' ? '#0e1a30' : book.theme }} />
      <div className="book-layer book-back-cover"
           style={{ background: `linear-gradient(150deg, rgba(0,0,0,0.55), rgba(0,0,0,0.8)), url('${art.cover}') center/cover`, transform: `translateX(${depth}px) skewY(${SKEW})` }} />
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
      {/* real painted cover art + title band */}
      <div className="book-layer book-front-cover"
           style={{ transform: `skewY(${SKEW})`, backgroundImage: `url('${art.cover}')` }}>
        <div className="book-cover-titleband">
          <div className="book-cover-titlelines">
            {book.title.slice(0, 3).map((l, i) => <div key={i}>{l}</div>)}
          </div>
          <div className="book-cover-brand">A WOLF SPIRIT EDITION</div>
        </div>
      </div>
    </div>
  )
}

export default function BookshelfWindowContent() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)
  const [shelfIndex, setShelfIndex] = useState(0)

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return ANSWER_TOMES
    return ANSWER_TOMES.filter(t =>
      t.questionSummary.toLowerCase().includes(needle) ||
      t.answer.join(' ').toLowerCase().includes(needle))
  }, [query])

  const pageItems = useMemo(
    () => filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE),
    [filtered, page],
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const selected = ANSWER_TOMES.find((b) => b.id === selectedId) ?? null

  // featured shelf: fixed window of 12, navigable by arrows
  const SHELF_WINDOW = 12
  const shelfBooks = useMemo(() => {
    const arr = filtered.slice(shelfIndex, shelfIndex + SHELF_WINDOW)
    return arr
  }, [filtered, shelfIndex])
  const canShelfLeft = shelfIndex > 0
  const canShelfRight = shelfIndex + SHELF_WINDOW < filtered.length
  const shiftShelf = (dir: 1 | -1) => setShelfIndex((v) => Math.min(Math.max(0, filtered.length - SHELF_WINDOW), Math.max(0, v + dir * 6)))

  if (selected) {
    const idx = filtered.findIndex((b) => b.id === selected.id)
    return (
      <div className="px-4 pb-6 pt-3 sm:px-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <button onClick={() => setSelectedId(null)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800/70 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-zinc-700/70 hover:text-white">
            <Back size={12} /> Archive ({filtered.length})
          </button>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <button
              onClick={() => { const n = filtered[idx - 1]; if (n) setSelectedId(n.id) }}
              disabled={idx <= 0}
              className="rounded-md bg-white/5 px-2.5 py-1 transition-colors hover:bg-white/10 disabled:opacity-30">
              &larr; Prev book
            </button>
            <span>{idx + 1} / {filtered.length}</span>
            <button
              onClick={() => { const n = filtered[idx + 1]; if (n) setSelectedId(n.id) }}
              disabled={idx >= filtered.length - 1}
              className="rounded-md bg-white/5 px-2.5 py-1 transition-colors hover:bg-white/10 disabled:opacity-30">
              Next book &rarr;
            </button>
          </div>
        </div>
        <TomeReader tome={selected} />
        {selected.preview && (
          <p className="mx-auto mt-3 max-w-3xl text-center text-[11px] leading-relaxed text-zinc-600">
            Opening passage &mdash; Quora truncates feed previews; the full text pass completes these. The link above is this exact answer.
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-shrink-0 flex-wrap items-center justify-between gap-3 px-5 pt-3">
        <div className="flex items-center gap-2">
          <Library className="text-[#DA3F23]" size={15} />
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-300">
            Matt&rsquo;s answers &mdash; the archive
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-white/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
            {filtered.length} {filtered.length === 1 ? 'answer' : 'answers'}
          </span>
        </div>
        <div className="relative">
          <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(0); setShelfIndex(0) }}
            placeholder="Search the archive..."
            aria-label="Search answers"
            className="h-9 w-64 rounded-lg bg-zinc-800/70 pl-8 pr-3 text-sm text-white placeholder-zinc-500 transition-colors focus:outline-none focus:ring-1 focus:ring-zinc-500"
          />
        </div>
      </div>

      {/* navigable shelf */}
      {!query && (
        <div className="relative">
          <button
            onClick={() => shiftShelf(-1)}
            disabled={!canShelfLeft}
            aria-label="Scroll shelf left"
            className="shelf-arrow shelf-arrow-left">
            <ArrowLeft size={16} />
          </button>

          <div className="answers-shelf">
            <div className="marquee-fade">
              <div className="shelf-track-static">
                {shelfBooks.map((book, i) => (
                  <div key={book.id} className="book-wrap"
                       style={{ zIndex: shelfBooks.length - i, marginRight: 'calc(-1 * var(--book-overlap))' }}
                       onClick={() => setSelectedId(book.id)}>
                    <Book book={book} index={shelfIndex + i} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => shiftShelf(1)}
            disabled={!canShelfRight}
            aria-label="Scroll shelf right"
            className="shelf-arrow shelf-arrow-right">
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-3">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {pageItems.map((b) => (
            <button key={b.id} onClick={() => setSelectedId(b.id)}
                    className="group rounded-xl px-3.5 py-3 text-left transition-colors bg-white/[0.035] hover:bg-white/[0.09] border border-white/[0.06] hover:border-white/20">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-[12.5px] font-medium text-zinc-200 group-hover:text-white">
                    {b.questionSummary}
                  </div>
                  <div className="mt-1 truncate text-[11px] text-zinc-500">
                    {b.answer[0]?.slice(0, 80)}…
                  </div>
                </div>
                <BookOpen size={13} className="mt-0.5 flex-shrink-0 text-zinc-600 group-hover:text-[#DA3F23]" />
              </div>
            </button>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 py-4 text-xs text-zinc-400">
            <button onClick={() => setPage((v) => Math.max(0, v - 1))} disabled={page === 0}
                    className="rounded-md bg-white/5 px-3 py-1.5 transition-colors hover:bg-white/10 disabled:opacity-30">
              &larr; Prev
            </button>
            <span>Page {page + 1} of {totalPages}</span>
            <button onClick={() => setPage((v) => Math.min(totalPages - 1, v + 1))} disabled={page >= totalPages - 1}
                    className="rounded-md bg-white/5 px-3 py-1.5 transition-colors hover:bg-white/10 disabled:opacity-30">
              Next &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
