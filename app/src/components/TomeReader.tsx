import { useMemo, useState } from 'react'
import { ExternalLink, CalendarDays, Clock3, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { artFor } from '../art/scene'
import { uniquePlate } from '../art/plate'

export interface Tome {
  id: string
  title: string[]
  topic: string
  questionSummary: string
  answer: string[]
  date?: string
  views?: string
  reads?: string
  plate?: string
  sourceUrl?: string | null
  preview?: boolean
}

export const PROFILE_URL = 'https://www.quora.com/profile/WolfSpirit99'

function googleQuestionUrl(question: string) {
  return 'https://www.google.com/search?q=' + encodeURIComponent('site:quora.com "' + question + '"')
}

interface Chapter { head: string; body: string[] }

function buildChapters(paras: string[]): Chapter[] {
  if (paras.length < 2) return [{ head: 'The Answer', body: paras }]
  const n = Math.min(5, Math.max(2, Math.round(paras.length / 2)))
  const per = Math.ceil(paras.length / n)
  const names = ['The Opening', 'The Middle Ground', 'What Nobody Says', 'The Turn', 'The Takeaway']
  const out: Chapter[] = []
  for (let i = 0; i < paras.length; i += per) {
    out.push({ head: names[out.length % names.length], body: paras.slice(i, i + per) })
  }
  return out
}

/* ---- paginate a chapter's body into page-sized chunks (no overflow) ---- */
const PAGE_BUDGET = 300 // chars per page — gives each answer 2-3 spreads

function paginateParas(paras: string[]): string[][] {
  const pages: string[][] = []
  let cur: string[] = []
  let curLen = 0
  for (const p of paras) {
    const words = p.split(/\s+/)
    let chunk = ''
    for (const w of words) {
      const add = (chunk ? ' ' : '') + w
      if (curLen + chunk.length + add.length <= PAGE_BUDGET) {
        chunk += (chunk ? ' ' : '') + w
      } else {
        if (chunk) { cur.push(chunk); curLen += chunk.length }
        if (cur.length) { pages.push(cur); cur = []; curLen = 0 }
        chunk = w
      }
    }
    if (chunk) { cur.push(chunk); curLen += chunk.length }
  }
  if (cur.length) pages.push(cur)
  return pages.length ? pages : [['…']]
}

interface ContentPage {
  chapterIndex: number
  chapterName: string
  isChapterStart: boolean
  text: string[]
}

export default function TomeReader({ tome }: { tome: Tome }) {
  const art = artFor(tome.questionSummary + ' ' + tome.title.join(' '))
  const chs = useMemo(() => buildChapters(tome.answer), [tome.answer])

  const spreads = useMemo<ContentPage[]>(() => {
    const out: ContentPage[] = []
    chs.forEach((ch, ci) => {
      paginateParas(ch.body).forEach((text, i) => {
        out.push({ chapterIndex: ci, chapterName: ch.head, isChapterStart: i === 0, text })
      })
    })
    return out
  }, [chs])

  const totalPages = spreads.length + 1 // + cover
  const [pageIdx, setPageIdx] = useState(0)
  const [flipDir, setFlipDir] = useState<1 | -1>(1)
  const isCover = pageIdx === 0
  const content = isCover ? null : spreads[pageIdx - 1]

  function go(dir: 1 | -1) {
    setFlipDir(dir)
    setPageIdx((v) => Math.min(totalPages - 1, Math.max(0, v + dir)))
  }

  const direct = tome.sourceUrl && /^https:\/\/www\.quora\.com\//.test(tome.sourceUrl) ? tome.sourceUrl : null
  // unique image seed per page (cover uses the painted plate; content uses procedural)
  const pageSeed = `${tome.id}·${tome.questionSummary.slice(0, 60)}·page${pageIdx}`

  return (
    <div className="tome-frame">
      <div className="tome-gutter" aria-hidden="true" />
      <div className="tome-ribbon" aria-hidden="true" />

      {/* ===== LEFT PAGE — question (cover) or chapter text ===== */}
      <div
        className="tome-page tome-left tome-page-flippable"
        onClick={() => go(-1)}
        role="button"
        aria-label="Previous page"
        title="Previous page"
      >
        <div className="tome-kicker">{tome.topic}</div>

        {isCover ? (
          <>
            <h3 className="tome-title">{tome.questionSummary}</h3>
            <div className="tome-rule" aria-hidden="true">
              <svg viewBox="0 0 200 10" preserveAspectRatio="none" aria-hidden="true">
                <path d="M0 5 H90 M110 5 H200" stroke="#6b5233" strokeWidth="1" opacity="0.55" />
                <path d="M100 1 L104 5 L100 9 L96 5 Z" fill="#6b5233" opacity="0.7" />
              </svg>
            </div>
            <div className="tome-body">
              <p className="tome-firstline">
                {tome.answer[0]?.slice(0, 200)}
                {tome.answer[0] && tome.answer[0].length > 200 ? '…' : ''}
              </p>
              <p className="tome-flip-hint">The answer, chaptered, begins on the facing pages &rarr;</p>
            </div>
          </>
        ) : (
          <div className={`tome-body tome-flip-${flipDir === 1 ? 'fwd' : 'back'}`} key={pageIdx}>
            {content!.isChapterStart ? (
              <div className="tome-chapter-head">
                <span className="tome-chapter-no">Chapter {['I','II','III','IV','V','VI'][content!.chapterIndex] ?? content!.chapterIndex + 1}</span>
                <span className="tome-chapter-name">{content!.chapterName}</span>
                <span className="tome-chapter-line" aria-hidden="true" />
              </div>
            ) : (
              <div className="tome-continued">…continued</div>
            )}
            {content!.text.map((p, pi) => <p key={pi}>{p}</p>)}
            {pageIdx === totalPages - 1 && <p className="tome-signoff">— WolfSpirit99</p>}
          </div>
        )}

        <div className="tome-pageno">{isCover ? 'i' : pageIdx} · {spreads.length} pp.</div>
      </div>

      {/* ===== RIGHT PAGE — image pertaining to this page ===== */}
      <div
        className="tome-page tome-right tome-page-flippable"
        onClick={() => go(1)}
        role="button"
        aria-label="Next page"
        title="Next page"
      >
        {isCover ? (
          <>
            <div className="tome-cover-art">
              <div className="tome-cover-inner">
                <div className="tome-cover-frame" />
                {tome.title.slice(0, 3).map((l, i) => (
                  <div key={i} className="tome-cover-line">{l}</div>
                ))}
                <div className="tome-cover-sep" />
                <div className="tome-cover-brand">A WOLF SPIRIT EDITION</div>
              </div>
              <div className="tome-cover-plate">
                <img src={art.plate} alt="" draggable={false} />
              </div>
            </div>
            <dl className="tome-meta">
              {tome.date && <div><dt><CalendarDays size={12} /> Written</dt><dd>{tome.date}</dd></div>}
              <div><dt><Clock3 size={12} /> Reading</dt><dd>{tome.reads ?? '6 min'}</dd></div>
              <div><dt>§</dt><dd>{spreads.length} page{spreads.length > 1 ? 's' : ''} · {chs.length} ch.</dd></div>
            </dl>
          </>
        ) : (
          <div className="tome-right-chapter">
            <div className="tome-plate">
              <img src={uniquePlate(pageSeed)} alt={`Engraved plate for chapter ${content!.chapterIndex + 1}`} draggable={false} />
            </div>
            <div className="tome-next-teaser">
              <ChevronRight size={13} />
              <span>{pageIdx < totalPages - 1 ? 'Next page' : 'End of the book'}</span>
            </div>
            <dl className="tome-meta">
              <div><dt>§</dt><dd>Chapter {content!.chapterIndex + 1} · {content!.chapterName}</dd></div>
              <div><dt>«</dt><dd>Tap left page to go back</dd></div>
            </dl>
          </div>
        )}

        {isCover && (
          direct ? (
            <>
              <a className="tome-source" href={direct} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={13} />
                <span>Read this exact answer on Quora</span>
              </a>
              <p className="tome-permalink-note">Linked straight to the original post.</p>
            </>
          ) : (
            <>
              <a className="tome-source" href={googleQuestionUrl(tome.questionSummary)} target="_blank" rel="noopener noreferrer">
                <Search size={13} />
                <span>Find this exact question</span>
              </a>
              <a className="tome-source-sm" href={PROFILE_URL} target="_blank" rel="noopener noreferrer">
                or open Matt&rsquo;s profile ↗
              </a>
            </>
          )
        )}

        <button
          className="tome-flip-arrow tome-flip-left"
          onClick={(e) => { e.stopPropagation(); go(-1) }}
          aria-label="Previous page"
          disabled={pageIdx === 0}
        >
          <ChevronLeft size={16} />
        </button>
        <button
          className="tome-flip-arrow tome-flip-right"
          onClick={(e) => { e.stopPropagation(); go(1) }}
          aria-label="Next page"
          disabled={pageIdx >= totalPages - 1}
        >
          <ChevronRight size={16} />
        </button>

        <div className="tome-pageno tome-pageno-right">
          {pageIdx + 1} / {totalPages}
        </div>
      </div>
    </div>
  )
}
