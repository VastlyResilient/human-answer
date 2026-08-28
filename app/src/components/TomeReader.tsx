import { useMemo, useState } from 'react'
import { ExternalLink, CalendarDays, Clock3, KeyRound, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { artFor } from '../art/scene'

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

function chapters(paras: string[]): Chapter[] {
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

/* ---- page model: each page = one chapter's paragraphs (left) ---- */
interface Page {
  kind: 'chapter' | 'art+meta'
  chapter?: Chapter
  chapterIndex?: number
}

export default function TomeReader({ tome }: { tome: Tome }) {
  const art = artFor(tome.questionSummary + ' ' + tome.title.join(' '))
  const chs = useMemo(() => chapters(tome.answer), [tome.answer])
  const [pageIdx, setPageIdx] = useState(0)
  const [flipDir, setFlipDir] = useState<1 | -1>(1)

  // page 0 = cover/title page (right = art + meta). Pages 1..N = chapters.
  const totalPages = chs.length + 1
  const page: Page = pageIdx === 0
    ? { kind: 'art+meta' }
    : { kind: 'chapter', chapter: chs[pageIdx - 1], chapterIndex: pageIdx - 1 }

  function go(dir: 1 | -1) {
    setFlipDir(dir)
    setPageIdx((v) => {
      const n = v + dir
      if (n < 0) return 0
      if (n > totalPages - 1) return totalPages - 1
      return n
    })
  }

  const direct = tome.sourceUrl && /^https:\/\/www\.quora\.com\//.test(tome.sourceUrl) ? tome.sourceUrl : null

  return (
    <div className="tome-frame">
      <div className="tome-gutter" aria-hidden="true" />
      <div className="tome-ribbon" aria-hidden="true" />

      {/* LEFT PAGE - tap = previous chapter */}
      <div
        className="tome-page tome-left tome-page-flippable"
        onClick={() => go(-1)}
        role="button"
        aria-label="Previous page"
        title="Previous chapter"
      >
        <div className="tome-kicker">{tome.topic}</div>
        <h3 className="tome-title">{tome.questionSummary}</h3>
        <div className="tome-rule" aria-hidden="true">
          <svg viewBox="0 0 200 10" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 5 H90 M110 5 H200" stroke="#6b5233" strokeWidth="1" opacity="0.55" />
            <path d="M100 1 L104 5 L100 9 L96 5 Z" fill="#6b5233" opacity="0.7" />
          </svg>
        </div>

        {page.kind === 'art+meta' ? (
          <div className="tome-body">
            <p className="tome-firstline">
              {tome.answer[0]?.slice(0, 220)}
              {tome.answer[0] && tome.answer[0].length > 220 ? '…' : ''}
            </p>
            <p className="tome-flip-hint">Chapters begin on the facing page &rarr;</p>
          </div>
        ) : (
          <div className={`tome-body tome-flip-${flipDir === 1 ? 'fwd' : 'back'}`} key={pageIdx}>
            {page.kind === 'chapter' && (
              <>
                <div className="tome-chapter-head">
                  <span className="tome-chapter-no">Chapter {['I','II','III','IV','V','VI'][page.chapterIndex!] ?? page.chapterIndex! + 1}</span>
                  <span className="tome-chapter-name">{page.chapter!.head}</span>
                  <span className="tome-chapter-line" aria-hidden="true" />
                </div>
                {page.chapter!.body.map((p, pi) => <p key={pi}>{p}</p>)}
              </>
            )}
            {pageIdx === totalPages - 1 && <p className="tome-signoff">— WolfSpirit99</p>}
          </div>
        )}

        {/* page footer */}
        <div className="tome-pageno">{pageIdx === 0 ? 'i' : pageIdx} · {totalPages - 1} ch.</div>
      </div>

      {/* RIGHT PAGE - tap = next chapter */}
      <div
        className="tome-page tome-right tome-page-flippable"
        onClick={() => go(1)}
        role="button"
        aria-label="Next page"
        title="Next chapter"
      >
        {page.kind === 'art+meta' ? (
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
              <div><dt>§</dt><dd>{chs.length} chapter{chs.length > 1 ? 's' : ''}</dd></div>
            </dl>
          </>
        ) : (
          /* right page on chapter views: show the plate + next-chapter teaser */
          <div className="tome-right-chapter">
            <div className="tome-plate">
              <img src={art.plate} alt="" draggable={false} />
            </div>
            <div className="tome-next-teaser">
              <ChevronRight size={13} />
              <span>{pageIdx < totalPages - 1 ? 'Next chapter' : 'End of the book'}</span>
            </div>
            <dl className="tome-meta">
              <div><dt>§</dt><dd>Chapter {page.chapterIndex! + 1} of {chs.length}</dd></div>
              <div><dt>«</dt><dd>Tap left page to go back</dd></div>
            </dl>
          </div>
        )}

        {/* routing block stays visible on the right page always */}
        {page.kind === 'art+meta' && (
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

        {/* flip arrows */}
        <button
          className="tome-flip-arrow tome-flip-left"
          onClick={(e) => { e.stopPropagation(); go(-1) }}
          aria-label="Previous chapter"
          disabled={pageIdx === 0}
        >
          <ChevronLeft size={16} />
        </button>
        <button
          className="tome-flip-arrow tome-flip-right"
          onClick={(e) => { e.stopPropagation(); go(1) }}
          aria-label="Next chapter"
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
