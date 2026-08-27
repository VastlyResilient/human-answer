import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import type { WindowState } from '../types'
import BookshelfWindowContent from '../components/BookshelfWindowContent'

interface WindowLayerProps {
  windows: WindowState[]
  onClose: (id: string) => void
  onFocus: (id: string) => void
}

interface DragState {
  id: string
  offsetX: number
  offsetY: number
}

export default function WindowLayer({ windows, onClose, onFocus }: WindowLayerProps) {
  const [drag, setDrag] = useState<DragState | null>(null)
  const layerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!drag) return
    function onMove(e: PointerEvent) {
      if (!drag) return
      const el = document.querySelector<HTMLElement>(`[data-window-id="${drag.id}"]`)
      if (el) {
        el.style.left = `${Math.max(8, e.clientX - drag.offsetX)}px`
        el.style.top = `${Math.max(8, e.clientY - drag.offsetY)}px`
      }
    }
    function onUp() { setDrag(null) }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [drag])

  return (
    <div ref={layerRef} className="pointer-events-none fixed inset-0 z-20">
      {windows.map((w) => (
        <div
          key={w.id}
          data-window-id={w.id}
          role="dialog"
          aria-label={w.title}
          className="pointer-events-auto absolute w-[min(980px,calc(100vw-24px))] overflow-hidden rounded-xl shadow-2xl"
          style={{
            left: w.x,
            top: w.y,
            zIndex: w.zIndex,
            background: 'rgba(10, 10, 10, 0.92)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(18px)',
          }}
          onPointerDown={() => onFocus(w.id)}
        >
          {/* Retro title bar */}
          <div
            className="flex cursor-grab items-center justify-between px-4 py-2.5 active:cursor-grabbing"
            style={{
              background: 'linear-gradient(180deg, rgba(64,64,64,0.65), rgba(28,28,28,0.85))',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}
            onPointerDown={(e) => {
              const el = e.currentTarget.parentElement!
              const rect = el.getBoundingClientRect()
              setDrag({ id: w.id, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top })
              onFocus(w.id)
            }}
          >
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#DA3F23]" />
              <span className="h-3 w-3 rounded-full bg-zinc-500" />
              <span className="h-3 w-3 rounded-full bg-zinc-700" />
              <span className="ml-2 select-none text-xs font-medium tracking-tight text-zinc-300">{w.title}</span>
            </div>
            <button
              onClick={() => onClose(w.id)}
              aria-label={`Close ${w.title}`}
              className="rounded p-1 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X size={14} />
            </button>
          </div>

          {/* Body */}
          <div className="max-h-[min(74vh,720px)] overflow-y-auto">
            <WindowBody kind={w.kind} />
          </div>
        </div>
      ))}
    </div>
  )
}

function WindowBody({ kind }: { kind: WindowState['kind'] }) {
  if (kind === 'answers') return <BookshelfWindowContent embedded />
  if (kind === 'about') return <AboutBody />
  if (kind === 'column') return <ColumnBody />
  if (kind === 'ask') return <AskBody />
  return null
}

import { User, Newspaper, Send } from 'lucide-react'

function AboutBody() {
  return (
    <div className="px-6 py-6 sm:px-10 sm:py-8">
      <div className="flex items-center gap-2 text-[#DA3F23]">
        <User size={16} />
        <span className="text-xs font-semibold uppercase tracking-widest">Who is writing</span>
      </div>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">Matt — the human behind the answers</h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
        Years of public answers on Quora under <span className="text-zinc-200">WolfSpirit99</span>, now being collected somewhere permanent.
        Every answer here leads with lived experience — the story, the mistake, the detail you can only know from being in the room.
      </p>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-500">
        The full biography, verified stats and photos land when Matt approves them. Nothing invented in the meantime.
      </p>
      <a
        href="https://www.quora.com/profile/WolfSpirit99"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-zinc-800/70 px-4 py-2 text-sm text-zinc-200 transition-colors hover:bg-zinc-700/70 hover:text-white"
      >
        Original profile on Quora ↗
      </a>
    </div>
  )
}

function ColumnBody() {
  return (
    <div className="px-6 py-6 sm:px-10 sm:py-8">
      <div className="flex items-center gap-2 text-[#DA3F23]">
        <Newspaper size={16} />
        <span className="text-xs font-semibold uppercase tracking-widest">The heartbeat</span>
      </div>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">The Living Column</h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
        You send the question. The strongest one gets the full treatment every week — researched, answered straight, credited to you by first name unless you opt out.
      </p>
      <ul className="mt-5 space-y-2 text-sm text-zinc-400">
        <li>· Direct answer in the first breath</li>
        <li>· The lived story underneath</li>
        <li>· No synthesis, no windup, no fluff</li>
      </ul>
    </div>
  )
}

function AskBody() {
  const [sent, setSent] = useState(false)
  return (
    <div className="px-6 py-6 sm:px-10 sm:py-8">
      <div className="flex items-center gap-2 text-[#DA3F23]">
        <Send size={16} />
        <span className="text-xs font-semibold uppercase tracking-widest">Your question</span>
      </div>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">Ask Matt</h2>
      {sent ? (
        <p className="mt-4 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300">
          Queued locally in this preview build — inbox sync lands with the email provider.
        </p>
      ) : (
        <form
          className="mt-4 flex max-w-md flex-col gap-3"
          onSubmit={(e) => { e.preventDefault(); setSent(true) }}
        >
          <input placeholder="Your name (optional)" aria-label="Your name" className="rounded-lg bg-zinc-800/70 px-4 py-2.5 text-sm text-white placeholder-zinc-500 transition-colors focus:outline-none focus:ring-1 focus:ring-zinc-500" />
          <input required type="email" placeholder="Email (required)" aria-label="Email" className="rounded-lg bg-zinc-800/70 px-4 py-2.5 text-sm text-white placeholder-zinc-500 transition-colors focus:outline-none focus:ring-1 focus:ring-zinc-500" />
          <textarea required rows={4} placeholder="What do you want to know?" aria-label="Question" className="resize-none rounded-lg bg-zinc-800/70 px-4 py-2.5 text-sm text-white placeholder-zinc-500 transition-colors focus:outline-none focus:ring-1 focus:ring-zinc-500" />
          <button type="submit" className="self-start rounded-lg bg-white px-5 py-2 text-sm font-semibold text-black transition-colors hover:bg-zinc-100 active:bg-zinc-200">
            Send it
          </button>
        </form>
      )}
    </div>
  )
}
