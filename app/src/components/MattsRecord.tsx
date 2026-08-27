import { useEffect, useState } from 'react'
import { Eye, PenLine, CalendarClock, Mic, Info, ExternalLink, User, Library, Newspaper, MessageCircle, Trophy } from 'lucide-react'
import { PROFILE_URL } from './TomeReader'

const STATS = [
  { icon: Eye, head: 'LIFETIME VIEWS', big: 'Millions', sub: 'OF PEOPLE REACHED', note: ['Organic visibility.', 'Earned trust.'] },
  { icon: PenLine, head: 'PUBLISHED ANSWERS', big: '1,000+', sub: 'ANSWERS SHARED', note: ['Depth over noise.', 'Signal over volume.'] },
  { icon: CalendarClock, head: 'WRITING IN PUBLIC', big: '11 yrs', sub: 'OF CONSISTENT WRITING', note: ['Through every cycle.', 'Still showing up.'] },
  { icon: Mic, head: 'AUTHENTIC VOICE', big: 'One voice', sub: 'NEVER OUTSOURCED', note: ['My ideas. My words.', 'Always.'] },
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
    setStamp(`UPDATED ${d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase()} · ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`)
  }, [])

  return (
    <div className="rec-root">
      <div className="rec-aurora" aria-hidden="true" />
      <div className="rec-scanlines" aria-hidden="true" />

      {/* ---- inner Win98 titlebar (decorative chrome) ---- */}
      <div className="rec-titlebar" aria-hidden="true">
        <span className="rec-tb-icon"><Trophy size={11} /></span>
        <span className="rec-tb-text">track_record.exe — Track Record</span>
        <span className="rec-tb-btns">
          <span className="rec-tb-btn">_</span>
          <span className="rec-tb-btn">□</span>
          <span className="rec-tb-btn rec-tb-x">×</span>
        </span>
      </div>

      {/* ---- body grid ---- */}
      <div className="rec-body">
        {/* sidebar */}
        <aside className="rec-side">
          <div className="rec-avatar">
            <img src="../folio/wolf-pixel.jpg" alt="wolfspirit99 emblem" draggable={false} />
            <span className="rec-avatar-ring" aria-hidden="true" />
          </div>
          <div className="rec-avatar-name">wolfspirit99</div>
          <nav className="rec-nav">
            {NAV.map(({ icon: Icon, label, active }) => (
              <button key={label} type="button" className={`rec-nav-btn${active ? ' is-active' : ''}`}>
                <Icon size={13} strokeWidth={1.75} />
                <span>{label}</span>
              </button>
            ))}
          </nav>
          <div className="rec-side-foot">EST. 2013</div>
        </aside>

        {/* main */}
        <div className="rec-main">
          <div className="rec-os-tag">THE HUMAN ANSWER OS <span>v1.0</span></div>

          <div className="rec-kicker"><span className="rec-kicker-dash" />THE RECORD SO FAR</div>
          <h2 className="rec-title">
            A track record<br /><em>worth quoting.</em>
          </h2>
          <p className="rec-lede">
            The real leverage isn&rsquo;t hype &mdash; it&rsquo;s consistent, high-signal answers
            over time. Numbers don&rsquo;t lie. Here&rsquo;s mine.
          </p>

          {/* sunken status well with corner ticks */}
          <div className="rec-status">
            <span className="rec-corner tl" aria-hidden="true" />
            <span className="rec-corner tr" aria-hidden="true" />
            <span className="rec-corner bl" aria-hidden="true" />
            <span className="rec-corner br" aria-hidden="true" />
            <div className="rec-status-label">STATUS</div>
            <div className="rec-status-online"><span className="rec-status-dot" />Online</div>
            <div className="rec-status-sub">Writing in public<br />since 2013</div>
          </div>

          {/* classic groupbox with cut legend */}
          <div className="rec-groupbox">
            <span className="rec-group-legend">PERFORMANCE LEDGER</span>
            <div className="rec-grid">
              {STATS.map(({ icon: Icon, head, big, sub, note }) => (
                <div key={head} className="rec-card">
                  <div className="rec-card-head">
                    <span className="rec-card-icon"><Icon size={13} strokeWidth={1.75} /></span>
                    <span className="rec-card-title">{head}</span>
                  </div>
                  <div className="rec-card-big">{big}</div>
                  <div className="rec-card-sub">{sub}</div>
                  <div className="rec-card-rule" aria-hidden="true" />
                  <div className="rec-card-note">{note[0]}<br />{note[1]}</div>
                </div>
              ))}
            </div>
          </div>

          {/* recessed verification field */}
          <div className="rec-verify">
            <div className="rec-verify-left">
              <span className="rec-verify-i"><Info size={14} /></span>
              <p>
                <strong>Verification system.</strong> When an export is received, each stat is matched
                to a verified source on Quora. We don&rsquo;t round up. We don&rsquo;t guess. We document.
              </p>
            </div>
            <a className="rec-verify-btn" href={PROFILE_URL} target="_blank" rel="noopener noreferrer">
              View source on Quora <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>

      {/* ---- sunken status bar ---- */}
      <div className="rec-taskbar">
        <div className="rec-pane"><span className="rec-panedot ok" />Ready</div>
        <div className="rec-pane"><span className="rec-panedot ok" />Data verified</div>
        <div className="rec-pane rec-pane-right">{stamp}</div>
      </div>
    </div>
  )
}
