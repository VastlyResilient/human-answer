import { Library, User, Newspaper, MessageCircle, Trophy } from 'lucide-react'
import type { WinKind, WindowState } from '../types'
import { MENU_BAR_HEIGHT } from '../layoutConstants'

interface TaskbarProps {
  windows: WindowState[]
  onOpen: (kind: WinKind, title: string) => void
  onFocus: (id: string) => void
  onRestore: (kind: WinKind) => void
  onClose: (id: string) => void
}

const items: { kind: WinKind; label: string; icon: typeof User }[] = [
  { kind: 'about', label: 'About Matt', icon: User },
  { kind: 'answers', label: "Matt's Answers", icon: Library },
  { kind: 'record', label: 'Track Record', icon: Trophy },
  { kind: 'column', label: 'Living Column', icon: Newspaper },
]

export default function Taskbar({ windows, onOpen, onFocus, onRestore, onClose }: TaskbarProps) {
  const isOpen = (kind: WinKind) => windows.find((w) => w.kind === kind)
  const topZ = Math.max(0, ...windows.filter((w) => !w.minimized).map((w) => w.zIndex))

  return (
    <div
      className="fixed inset-x-0 z-[400] flex items-stretch justify-between px-3 py-1.5"
      style={{
        bottom: 0,
        height: 48,
        background: 'rgba(8, 8, 10, 0.88)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(14px)',
      }}
    >
      {/* launcher cluster */}
      <div className="flex items-center gap-1">
        {items.map(({ kind, label, icon: Icon }) => {
          const w = isOpen(kind)
          const active = w && !w.minimized && w.zIndex === topZ
          return (
            <button
              key={kind}
              title={w ? (w.minimized ? `Restore ${label}` : `Focus ${label}`) : `Open ${label}`}
              onClick={() => {
                if (!w) onOpen(kind, label)
                else if (w.minimized) onRestore(kind)
                else onFocus(w.id)
              }}
              className={`relative flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs transition-colors ${
                active ? 'bg-white/15 text-white' : 'text-zinc-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon size={14} />
              <span className="hidden md:inline">{label}</span>
              {w && (
                <span
                  role="button"
                  aria-label={`Close ${label}`}
                  className={`ml-0.5 rounded-full p-0.5 transition-colors hover:bg-[#DA3F23]/80 ${
                    active ? 'bg-white/25' : 'bg-white/10'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (w) onClose(w.id)
                  }}
                >
                  <svg viewBox="0 0 8 8" width="6" height="6"><path d="M1 1 L7 7 M7 1 L1 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="flex items-center pr-1 text-[10px] uppercase tracking-[0.22em] text-zinc-600">
        WolfSpirit99 · The Human Answer
      </div>
    </div>
  )
}
