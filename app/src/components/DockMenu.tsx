import { BookOpen, User, Newspaper, Send, Library } from 'lucide-react'
import type { WindowState } from '../types'

interface DockMenuProps {
  onOpen: (kind: WindowState['kind'], title: string) => void
}

const items = [
  { kind: 'about' as const, label: 'About Matt', icon: User },
  { kind: 'answers' as const, label: "Matt's Answers", icon: Library },
  { kind: 'column' as const, label: 'Living Column', icon: Newspaper },
  { kind: 'ask' as const, label: 'Ask Matt', icon: Send },
]

export default function DockMenu({ onOpen }: DockMenuProps) {
  return (
    <div className="fixed bottom-5 left-1/2 z-[15] -translate-x-1/2">
      <div
        className="flex items-center gap-1 rounded-2xl px-2 py-2 shadow-2xl"
        style={{
          background: 'rgba(10, 10, 10, 0.92)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(14px)',
        }}
      >
        <span className="mr-2 hidden items-center gap-1.5 pl-2 text-zinc-500 sm:flex" title="The shelf">
          <BookOpen size={13} />
          <span className="text-[11px] uppercase tracking-widest">Read</span>
        </span>
        {items.map(({ kind, label, icon: Icon }) => (
          <button
            key={kind}
            onClick={() => onOpen(kind, label)}
            title={label}
            className="flex flex-col items-center gap-1 rounded-xl px-3.5 py-2 text-zinc-400 transition-colors hover:bg-zinc-800/70 hover:text-white"
          >
            <Icon size={17} />
            <span className="text-[10px] leading-none">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
