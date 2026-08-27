import { ExternalLink, CalendarDays, Eye, Clock3, Search } from 'lucide-react'

export interface Tome {
  id: string
  title: string[]
  topic: string
  questionSummary: string
  answer: string[]
  date?: string
  views?: string
  reads?: string
  /** Direct URL to THIS answer on Quora. Filled automatically by
   *  scripts/import-answers.mjs from Matt's export. While null, the book
   *  deep-links the exact question via Quora search + Google fallback. */
  sourceUrl?: string | null
}

export const PROFILE_URL = 'https://www.quora.com/profile/WolfSpirit99'

function quoraSearchUrl(question: string) {
  return 'https://www.quora.com/search?q=' + encodeURIComponent(question)
}
function googleFallbackUrl(question: string) {
  return 'https://www.google.com/search?q=' + encodeURIComponent('site:quora.com WolfSpirit99 ' + question)
}

/**
 * The opened book: leather-bound two-page spread.
 * The right page ALWAYS routes the reader back to this answer's Quora home:
 *  - direct answer URL when known (export)
 *  - otherwise a deep search for the exact question, which lands on the thread.
 */
export default function TomeReader({ tome }: { tome: Tome }) {
  const paragraphs = tome.answer
  const direct = tome.sourceUrl && /^https:\/\/www\.quora\.com\//.test(tome.sourceUrl) ? tome.sourceUrl : null

  return (
    <div className="tome-frame">
      <div className="tome-gutter" aria-hidden="true" />
      <div className="tome-ribbon" aria-hidden="true" />

      {/* LEFT PAGE - question as title, full answer */}
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
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <p className="tome-signoff">— WolfSpirit99</p>
        </div>
      </div>

      {/* RIGHT PAGE - plate + provenance + the way back to the original */}
      <div className="tome-page tome-right">
        <div className="tome-plate">
          <img src="../folio/plate-generic.png" alt="Engraved illustration plate" draggable={false} />
        </div>
        <dl className="tome-meta">
          {tome.date && (
            <div><dt><CalendarDays size={12} /> Written</dt><dd>{tome.date}</dd></div>
          )}
          {tome.views && (
            <div><dt><Eye size={12} /> Viewed</dt><dd>{tome.views} times</dd></div>
          )}
          <div><dt><Clock3 size={12} /> Reading</dt><dd>{tome.reads ?? '8 min'}</dd></div>
        </dl>

        {direct ? (
          <a className="tome-source" href={direct} target="_blank" rel="noopener noreferrer">
            <ExternalLink size={13} />
            <span>Read the original answer on Quora</span>
          </a>
        ) : (
          <>
            <a className="tome-source" href={quoraSearchUrl(tome.questionSummary)} target="_blank" rel="noopener noreferrer"
               title="Opens this exact question on Quora">
              <Search size={13} />
              <span>Open this answer on Quora</span>
            </a>
            <a className="tome-source-sm" href={googleFallbackUrl(tome.questionSummary)} target="_blank" rel="noopener noreferrer">
              exact thread via Google ↗
            </a>
          </>
        )}

        <p className="tome-note">
          {direct
            ? 'Links straight to the original Quora post for this answer.'
            : 'Deep-links to this exact question on Quora; the direct permalink locks in with Matt\u2019s archive export.'}
        </p>
      </div>
    </div>
  )
}
