import { ExternalLink, CalendarDays, Eye, Clock3, KeyRound, Search } from 'lucide-react'

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

function googleQuestionUrl(question: string) {
  return 'https://www.google.com/search?q=' + encodeURIComponent('site:quora.com "' + question + '"')
}

/**
 * Opened book. Routing policy (all paths verified against live Quora/Google):
 *  1. With a real permalink (sourceUrl): one click opens THIS exact answer.
 *  2. Without it: "Open Matt's Quora profile" (lands, verified) plus
 *     "Find this exact question" - a site-scoped Google search for the
 *     question whose #1 result is the thread containing the answer.
 * We never fabricate slugs: Quora 404s them or redirects to its homepage.
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
          <>
            <a className="tome-source" href={direct} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={13} />
              <span>Read this exact answer on Quora</span>
            </a>
            <p className="tome-permalink-note">
              Linked straight to the original post.
            </p>
          </>
        ) : (
          <>
            <a className="tome-source" href={googleQuestionUrl(tome.questionSummary)} target="_blank" rel="noopener noreferrer"
               title="Opens a site-scoped search; the thread with this answer is the top result">
              <Search size={13} />
              <span>Find this exact question</span>
            </a>
            <a className="tome-source-sm" href={PROFILE_URL} target="_blank" rel="noopener noreferrer">
              or open Matt&rsquo;s profile ↗
            </a>
            <p className="tome-permalink-note">
              <KeyRound size={11} />
              Quora serves question pages only to logged-in visitors, so the
              direct permalink unlocks with Matt&rsquo;s archive export &mdash; then
              every book hard-links its own answer.
            </p>
          </>
        )}

        <p className="tome-note">
          {direct
            ? 'Links directly to the original Quora post for this answer.'
            : 'Edition text is this shelf\u2019s full rendering of the answer; the verbatim post lives on Quora.'}
        </p>
      </div>
    </div>
  )
}
