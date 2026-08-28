import { ExternalLink, CalendarDays, Clock3, KeyRound, Search } from 'lucide-react'
import { buildScene, svgDataUri } from '../art/scene'

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

/** chapterize: split the answer text into 2-5 titled chapters */
function chapters(paras: string[], question: string): { head: string; body: string[] }[] {
  if (paras.length < 2) return [{ head: 'The Answer', body: paras }]
  const n = Math.min(5, Math.max(2, Math.round(paras.length / 2)))
  const per = Math.ceil(paras.length / n)
  const openers = [
    'The Opening',
    'The Middle Ground',
    'What Nobody Says',
    'The Turn',
    'The Point Beneath',
    'The Takeaway',
  ]
  const out: { head: string; body: string[] }[] = []
  for (let i = 0; i < paras.length; i += per) {
    out.push({ head: openers[out.length % openers.length], body: paras.slice(i, i + per) })
  }
  return out
}

export default function TomeReader({ tome }: { tome: Tome }) {
  const direct = tome.sourceUrl && /^https:\/\/www\.quora\.com\//.test(tome.sourceUrl) ? tome.sourceUrl : null
  const chs = chapters(tome.answer, tome.questionSummary)

  return (
    <div className="tome-frame">
      <div className="tome-gutter" aria-hidden="true" />
      <div className="tome-ribbon" aria-hidden="true" />

      {/* LEFT PAGE - question as title, full answer in chapters */}
      <div className="tome-page tome-left">
        <div className="tome-kicker">{tome.topic}</div>
        <h3 className="tome-title">{tome.questionSummary}</h3>
        <div className="tome-rule" aria-hidden="true">
          <svg viewBox="0 0 200 10" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 5 H90 M110 5 H200" stroke="#6b5233" strokeWidth="1" opacity="0.55" />
            <path d="M100 1 L104 5 L100 9 L96 5 Z" fill="#6b5233" opacity="0.7" />
          </svg>
        </div>

        <div className="tome-body">
          {chs.map((ch, ci) => (
            <section key={ci} className="tome-chapter">
              <div className="tome-chapter-head">
                <span className="tome-chapter-no">Chapter {['I','II','III','IV','V','VI'][ci] ?? ci + 1}</span>
                <span className="tome-chapter-name">{ch.head}</span>
                <span className="tome-chapter-line" aria-hidden="true" />
              </div>
              {ch.body.map((p, pi) => (
                <p key={pi}>{p}</p>
              ))}
            </section>
          ))}
          <p className="tome-signoff">— WolfSpirit99</p>
        </div>
      </div>

      {/* RIGHT PAGE - paper cover art, provenance, the way back */}
      <div className="tome-page tome-right">
        {/* paper cover art: mini front cover of THIS book */}
        <div className="tome-cover-art" aria-hidden="true">
          <div className="tome-cover-inner">
            <div className="tome-cover-frame" />
            {tome.title.slice(0, 3).map((l, i) => (
              <div key={i} className="tome-cover-line">{l}</div>
            ))}
            <div className="tome-cover-sep" />
            <div className="tome-cover-brand">A WOLF SPIRIT EDITION</div>
          </div>
          <div className="tome-cover-plate">
            <img
              src={tome.plate ?? svgDataUri(buildScene(tome.questionSummary + ' ' + tome.title.join(' ')).plate)}
              alt=""
              draggable={false}
            />
          </div>
        </div>

        <dl className="tome-meta">
          {tome.date && (
            <div><dt><CalendarDays size={12} /> Written</dt><dd>{tome.date}</dd></div>
          )}
          <div><dt><Clock3 size={12} /> Reading</dt><dd>{tome.reads ?? '6 min'}</dd></div>
          <div><dt>§</dt><dd>{chs.length} chapter{chs.length > 1 ? 's' : ''}</dd></div>
        </dl>

        {direct ? (
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
            <p className="tome-permalink-note">
              <KeyRound size={11} />
              Direct permalink unlocks with the archive export.
            </p>
          </>
        )}

        <p className="tome-note">
          {direct
            ? 'Links directly to the original Quora post for this answer.'
            : 'Edition text is this shelf\u2019s rendering of the answer; the verbatim post lives on Quora.'}
        </p>
      </div>
    </div>
  )
}
