import { ExternalLink, CalendarDays, Eye, Clock3 } from 'lucide-react'

export interface Tome {
  id: string
  title: string[]
  topic: string
  questionSummary: string
  answer: string[]
  date?: string
  views?: string
  reads?: string
}

export const PROFILE_URL = 'https://www.quora.com/profile/WolfSpirit99'

/**
 * The opened book: leather-bound two-page spread per the reference image.
 * Left page = the question (as the page title) + the full answer text.
 * Right page = engraved plate + metadata + the source link.
 */
export default function TomeReader({ tome }: { tome: Tome }) {
  const paragraphs = tome.answer
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

      {/* RIGHT PAGE - plate + provenance */}
      <div className="tome-page tome-right">
        <div className="tome-plate">
          <img src="./folio/plate-generic.png" alt="Engraved illustration plate" draggable={false} />
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
        <a
          className="tome-source"
          href={PROFILE_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          <ExternalLink size={13} />
          <span>Read it where it lives &mdash; on Quora</span>
        </a>
        <p className="tome-note">
          Edition text is the full answer as published on this shelf. Verbatim
          Quora wording lands with Matt&rsquo;s archive export.
        </p>
      </div>
    </div>
  )
}
