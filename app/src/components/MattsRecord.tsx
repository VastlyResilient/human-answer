import { useEffect, useState } from 'react'
import { Eye, PenLine, CalendarClock, Mic, Info, ExternalLink, User, Library, Newspaper, MessageCircle, Trophy } from 'lucide-react'
import { PROFILE_URL } from './TomeReader'

const STATS = [
  { icon: Eye, head: 'LIFETIME VIEWS', big: 'MILLIONS', sub: 'OF PEOPLE REACHED', note: ['Organic visibility.', 'Earned trust.'] },
  { icon: PenLine, head: 'PUBLISHED ANSWERS', big: '1,000+', sub: 'ANSWERS SHARED', note: ['Depth over noise.', 'Signal over volume.'] },
  { icon: CalendarClock, head: 'WRITING IN PUBLIC', big: '11 YRS', sub: 'OF CONSISTENT WRITING', note: ['Through every cycle.', 'Still showing up.'] },
  { icon: Mic, head: 'AUTHENTIC VOICE', big: 'ONE VOICE', sub: 'NEVER OUTSOURCED', note: ['My ideas. My words.', 'Always.'] },
]

const NAV = [
  { icon: User, label: 'About Matt' },
  { icon: Library, label: "Matt's Answers" },
  { icon: Trophy, label: 'Track Record', active: true },
  { icon: Newspaper, label: 'Living Column' },
  { icon: MessageCircle, label: 'Ask Matt' },
]

export default function MattsRecord() {
  const [stamp, setStamp] = useState('—')
  useEffect(() => {
    const d = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    setStamp(`UPDATED: ${d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`)
  }, [])
  return (
    <div className="rec-root">
      {/* inner sidebar */}
      <aside className="rec-side">
        <div className="rec-avatar">
          <img src="../folio/wolf-pixel.jpg" alt="wolfspirit99 pixel avatar" draggable={false} />
        </div>
        <div className="rec-avatar-name">wolfspirit99</div>
        <nav className="rec-nav">
          {NAV.map(({ icon: Icon, label, active }) => (
            <button key={label} className={`rec-nav-btn${active ? ' is-active' : ''}`} type="button">
              <Icon size={14} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* main panel */}
      <div className="rec-main">
        <div className="rec-os-tag">THE HUMAN ANSWER OS v1.0</div>
        <div className="rec-kicker">THE RECORD SO FAR</div>
        <h2 className="rec-title">
          A TRACK RECORD<br />
          <em>WORTH QUOTING.</em>
        </h2>
        <p className="rec-lede">
          The real leverage isn't hype &mdash; it's consistent, high-signal answers over time.
          Numbers don't lie. Here's mine.
        </p>

        {/* STATUS bracket box */}
        <div className="rec-status">
          <div className="rec-status-label">STATUS</div>
          <div className="rec-status-dot" aria-hidden="true" />
          <div className="rec-status-online">ONLINE</div>
          <div className="rec-status-sub">WRITING IN PUBLIC<br />SINCE 2013</div>
        </div>

        {/* stat cards */}
        <div className="rec-grid">
          {STATS.map(({ icon: Icon, head, big, sub, note }) => (
            <div key={head} className="rec-card">
              <div className="rec-card-head">
                <span className="rec-card-icon"><Icon size={14} /></span>
                <span className="rec-card-title">{head}</span>
              </div>
              <div className="rec-card-big">{big}</div>
              <div className="rec-card-sub">{sub}</div>
              <div className="rec-card-dots" aria-hidden="true">· · · · · · · ·</div>
              <div className="rec-card-note">{note[0]}<br />{note[1]}</div>
            </div>
          ))}
        </div>

        {/* verification strip */}
        <div className="rec-verify">
          <div className="rec-verify-left">
            <span className="rec-verify-i"><Info size={15} /></span>
            <p>
              VERIFICATION SYSTEM: When an export is received, each stat is matched to a
              verified source on Quora. We don&rsquo;t round up. We don&rsquo;t guess. We document.
            </p>
          </div>
          <a className="rec-verify-btn" href={PROFILE_URL} target="_blank" rel="noopener noreferrer">
            VIEW SOURCE ON QUORA <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* status bar */}
      <div className="rec-taskbar">
        <div className="rec-pane">READY.</div>
        <div className="rec-pane">DATA VERIFIED. <span className="rec-green" aria-hidden="true" /></div>
        <div className="rec-pane rec-pane-right">{stamp}</div>
      </div>
    </div>
  )
}
