import { Library, User, Newspaper, MessageCircle, Globe, Bookmark } from 'lucide-react'
import type { WinKind } from '../types'

interface DesktopIconsProps {
  onOpen: (kind: WinKind, title: string) => void
}

const icons = [
  { kind: 'about' as const, label: 'About Matt', icon: User },
  { kind: 'answers' as const, label: "Matt's Answers", icon: Library },
  { kind: 'column' as const, label: 'Living Column', icon: Newspaper },
  { kind: 'ask' as const, label: 'Ask Matt', icon: MessageCircle },
]

export default function DesktopIcons({ onOpen }: DesktopIconsProps) {
  return (
    <>
      {/* top-left group under the banner */}
      <div className="absolute left-6 top-16 z-10 flex flex-col gap-5">
        {icons.map(({ kind, label, icon: Icon }) => (
          <button
            key={kind}
            onDoubleClick={() => onOpen(kind, label)}
            onClick={() => onOpen(kind, label)}
            className="group flex w-20 flex-col items-center gap-1.5 rounded-lg p-2 text-center transition-colors hover:bg-white/10 focus:outline-none focus-visible:bg-white/10"
          >
            <Icon size={26} strokeWidth={1.5} className="text-zinc-100 drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)]" />
            <span className="text-[11px] leading-tight text-zinc-100 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* quiet corner links */}
      <div className="absolute bottom-16 right-6 z-10 hidden flex-col items-end gap-2 sm:flex">
        <a
          href="https://www.quora.com/profile/WolfSpirit99"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-md bg-black/40 px-3 py-1.5 text-xs text-zinc-300 backdrop-blur-sm transition-colors hover:text-white"
        >
          <Globe size={12} /> quora.com/WolfSpirit99
        </a>
        <span className="flex items-center gap-1.5 rounded-md bg-black/40 px-3 py-1.5 text-[11px] text-zinc-500 backdrop-blur-sm">
          <Bookmark size={11} /> The Human Answer &middot; est. 2026
        </span>
      </div>
    </>
  )
}
