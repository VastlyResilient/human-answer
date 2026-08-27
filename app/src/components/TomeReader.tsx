import { ExternalLink, CalendarDays, Eye, Clock3, KeyRound } from 'lucide-react'

export interface Tome {
  id: string
  title: string[]
  topic: string
  questionSummary: string
  answer: string[]
  date?: string
  views?: string
  reads?: string
  /** Direct URL to THIS answer on Quora. Set automatically by
   *  scripts/import-answers.mjs once Matt's export lands. */
  sourceUrl?: string | null
}

export const PROFILE_URL = 'https://www.quora.com/profile/WolfSpirit99'

/**
 * Opened book. Routing policy (verified against live Quora):
 *  - With a real permalink (sourceUrl): one click opens THIS exact answer.
 *  - Without it: we link Matt's PROFILE - the one destination that verifiably
 *    lands logged-out visitors on his page. We do NOT fake per-answer links:
 *    Quora redirects fabricated search URLs to its homepage, and inventing
 *    answer slugs would 404. The permalink wires in one command via the import
 *    script (Quora -> Settings -> Privacy -> Download data).
 */
export default function TomeReader({ tome }: { tome: Tome }) {
  const direct = tome.sourceUrl && /^https:\/\/www\.quora\.com\//.test(tome.sourceUrl) ? tome.sourceUrl : null

  return (
    <div className="tome-frame">
      <div className="tome-gutter" aria-hidden="true" />
      <div className="tome-ribbon" aria-hidden="true" />

      {/* LEFT PAGE */}
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
          {tome.answer.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <p className="tome-signoff">— WolfSpirit99</p>
        </div>
      </div>

      {/* RIGHT PAGE */}
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
            <span>Read this exact answer on Quora</span>
          </a>
        ) : (
          <>
            <a className="tome-source" href={PROFILE_URL} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={13} />
              <span>Open Matt&rsquo;s Quora profile</span>
            </a>
            <p className="tome-permalink-note">
              <KeyRound size={11} />
              This book&rsquo;s one-click link to the <em>exact</em> answer unlocks
              with Matt&rsquo;s archive export (it carries every permalink). His
              profile above is the verified way in today.
            </p>
          </>
        )}

        <p className="tome-note">
          {direct
            ? 'Links directly to the original Quora post for this answer.'
            : 'Edition text is this shelf\u2019s full rendering of the answer; the verbatim post lives on Matt\u2019s profile.'}
        </p>
      </div>
    </div>
  )
}
