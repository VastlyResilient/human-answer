import { useMemo, useState } from 'react'
import { Search, ArrowLeft, BookOpen, Library } from 'lucide-react'
import { ANSWER_TOMES } from '../answersData'
import TomeReader from './TomeReader'
import type { AnswerBook } from '../types'

const PAGE_SIZE = 60
const PAGE_STEP = 1.1
const PAGE_INSET = 8
const SKEW = '30deg'

/* ---------- per-book generated cover (correct title on every spine) ---------- */
function xmlEsc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export function svgCover(t: { title: string[]; theme: string }): string {
  const W = 200, H = 286
  const lines = t.title.slice(0, 3)
  const longest = lines.reduce((m, l) => Math.max(m, l.length), 0)
  const fs = longest <= 8 ? 24 : longest <= 12 ? 20 : longest <= 16 ? 16 : longest <= 22 ? 13 : 11
  const startY = 84
  const lh = Math.round(fs * 1.5)

  const titleEls = lines
    .map((l, i) => {
      const y = startY + i * lh
      return `<text x="${W / 2}" y="${y}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="${fs}" letter-spacing="1" fill="#f2ecdd" stroke="#000000" stroke-width="0.6" paint-order="stroke">${xmlEsc(l)}</text>`
    })
    .join('')

  const gradId = 'g' + Math.abs(t.theme.split('').reduce((a, c) => a + c.charCodeAt(0), 0))
  const lastY = startY + (lines.length - 1) * lh + 34

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
    `<defs>` +
    `<linearGradient id="${gradId}" x1="0" y1="0" x2="0.4" y2="1">` +
    `<stop offset="0" stop-color="#241a10"/><stop offset="0.55" stop-color="#171009"/><stop offset="1" stop-color="#0c0806"/>` +
    `</linearGradient>` +
    `<filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2"/><feColorMatrix type="saturate" values="0"/></filter>` +
    `</defs>` +
    `<rect width="${W}" height="${H}" fill="url(#${gradId})"/>` +
    `<rect width="${W}" height="${H}" filter="url(#n)" opacity="0.05"/>` +
    `<rect x="7" y="7" width="${W - 14}" height="${H - 14}" fill="none" stroke="rgba(242,236,221,0.5)" stroke-width="1.5"/>` +
    `<rect x="11" y="11" width="${W - 22}" height="${H - 22}" fill="none" stroke="rgba(242,236,221,0.18)" stroke-width="0.75"/>` +
    titleEls +
    `<rect x="${W / 2 - 22}" y="${lastY}" width="44" height="1" fill="rgba(242,236,221,0.55)"/>` +
    `<text x="${W / 2}" y="${H - 34}" text-anchor="middle" font-family="Georgia, serif" font-size="8.5" letter-spacing="2.5" fill="rgba(233,222,200,0.8)">A WOLF SPIRIT</text>` +
    `<text x="${W / 2}" y="${H - 22}" text-anchor="middle" font-family="Georgia, serif" font-size="8.5" letter-spacing="2.5" fill="rgba(233,222,200,0.8)">EDITION</text>` +
    `</svg>`

  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg)
}

function Book({ book }: { book: AnswerBook & { title: string[] } }) {
  const depth = PAGE_STEP * (book.pages + 1)
  const pages = useMemo(() => Array.from({ length: book.pages }, (_, idx) => ({ i: idx + 1 })), [book.pages])
  const cover = useMemo(() => svgCover(book), [book.title.join(' ')])

  return (
    <div className="book" style={{ width: `${200 + depth + 1.1}px` }} title={book.questionSummary}>
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
           style={{ transform: `skewY(${SKEW})`, backgroundImage: `url("${cover}")` }} />
    </div>
  )
}

export default function BookshelfWindowContent() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)

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
  const shelfSet = useMemo(() => {
    const top = ANSWER_TOMES.slice(0, 10)
    return [...top, ...top]
  }, [])

  if (selected) {
    return (
      <div className="px-4 pb-6 pt-3 sm:px-6">
        <button
          onClick={() => setSelectedId(null)}
          className="mb-3 inline-flex items-center gap-1.5 rounded-lg bg-zinc-800/70 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-zinc-700/70 hover:text-white"
        >
          <ArrowLeft size={12} /> Back to the archive ({filtered.length} answers)
        </button>
        <TomeReader tome={selected} />
        {selected.preview && (
          <p className="mx-auto mt-3 max-w-3xl text-center text-[11px] leading-relaxed text-zinc-600">
            Opening passage &mdash; Quora truncates feed previews. The complete verbatim text goes
            in with the full-text pass; the link above already points at this exact answer.
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
            onChange={(e) => { setQuery(e.target.value); setPage(0) }}
            placeholder="Search the archive..."
            aria-label="Search answers"
            className="h-9 w-64 rounded-lg bg-zinc-800/70 pl-8 pr-3 text-sm text-white placeholder-zinc-500 transition-colors focus:outline-none focus:ring-1 focus:ring-zinc-500"
          />
        </div>
      </div>

      {!query && (
        <div className="answers-shelf">
          <div className="marquee-mask" aria-label="Featured answer volumes marquee">
            <div className="marquee-fade">
              <div className="marquee-track">
                {shelfSet.map((book, i) => (
                  <div key={`${book.id}-${i}`} className="book-wrap"
                       style={{ zIndex: shelfSet.length - i }}
                       onClick={() => setSelectedId(book.id)}>
                    <Book book={book} />
                  </div>
                ))}
              </div>
            </div>
          </div>
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
