import { useRef, useState } from 'react'
import type { WinKind, WindowState } from '../types'
import AboutWindow from '../components/AboutWindow'
import ColumnWindow from '../components/ColumnWindow'
import AskMattChat from '../components/AskMattChat'
import BookshelfWindowContent from '../components/BookshelfWindowContent'
import MattsRecord from '../components/MattsRecord'

interface WindowLayerProps {
  windows: WindowState[]
  onClose: (id: string) => void
  onFocus: (id: string) => void
  onMinimize: (id: string) => void
  onToggleMaximize: (id: string) => void
  openPayload: (kind: WinKind, title: string, payload?: unknown) => void
}

interface DragState {
  id: string
  offX: number
  offY: number
}

export default function WindowLayer(props: WindowLayerProps) {
  const { windows, onClose, onFocus, onMinimize, onToggleMaximize } = props
  const [drag, setDrag] = useState<DragState | null>(null)
  const dragRef = useRef<DragState | null>(null)

  function startDrag(e: React.PointerEvent, w: WindowState) {
    if (w.maximized) return
    // window control buttons live inside the title bar; never treat their
    // presses as drags (pointer capture would eat their click events)
    if ((e.target as HTMLElement).closest('button')) return
    const rect = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect()
    const d = { id: w.id, offX: e.clientX - rect.left, offY: e.clientY - rect.top }
    setDrag(d)
    dragRef.current = d
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  function moveDrag(e: React.PointerEvent) {
    const d = dragRef.current
    if (!d) return
    const el = document.querySelector<HTMLElement>(`[data-window-id="${d.id}"]`)
    if (!el) return
    el.style.left = `${Math.max(-200, e.clientX - d.offX)}px`
    el.style.top = `${Math.max(8, e.clientY - d.offY)}px`
  }

  function endDrag() {
    setDrag(null)
    dragRef.current = null
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-20">
      {windows.filter((w) => !w.minimized).map((w) => {
        const geo = w.maximized
          ? { left: 6, top: 42, width: 'calc(100vw - 12px)', height: 'calc(100vh - 96px)' }
          : undefined
        return (
          <div
            key={w.id}
            data-window-id={w.id}
            role="dialog"
            aria-label={w.title}
            className={`pointer-events-auto absolute flex flex-col overflow-hidden rounded-xl shadow-2xl ${drag?.id === w.id ? 'select-none' : ''}`}
            style={{
              left: geo ? geo.left : w.x,
              top: geo ? geo.top : w.y,
              width: geo ? geo.width : 'min(1080px, calc(100vw - 40px))',
              height: geo ? geo.height : undefined,
              maxHeight: geo ? undefined : 'min(78vh, 760px)',
              minHeight: 340,
              zIndex: w.zIndex,
              background: 'rgba(10, 10, 10, 0.92)',
              border: '1px solid rgba(255,255,255,0.09)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 30px 80px rgba(0,0,0,0.55)',
            }}
            onPointerDown={() => onFocus(w.id)}
          >
            {/* Title bar */}
            <div
              className="group flex flex-shrink-0 cursor-grab items-center justify-between px-3 py-2 active:cursor-grabbing"
              style={{
                background: 'linear-gradient(180deg, rgba(58,58,60,0.72), rgba(26,26,28,0.9))',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
              }}
              onPointerDown={(e) => startDrag(e, w)}
              onPointerMove={moveDrag}
              onPointerUp={endDrag}
              onDoubleClick={() => onToggleMaximize(w.id)}
            >
              <div className="flex items-center gap-2">
                {/* real browser-window buttons */}
                <button
                  aria-label={`Close ${w.title}`}
                  onClick={() => onClose(w.id)}
                  className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#ff5f57] transition-colors hover:bg-[#ff8a84]"
                >
                  <svg viewBox="0 0 10 10" className="h-2 w-2 opacity-0 transition-opacity group-hover:opacity-70">
                    <path d="M2.5 2.5 L7.5 7.5 M7.5 2.5 L2.5 7.5" stroke="#4d0000" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </button>
                <button
                  aria-label={`Minimize ${w.title}`}
                  onClick={() => onMinimize(w.id)}
                  className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#febc2e] transition-colors hover:bg-[#ffd47a]"
                >
                  <svg viewBox="0 0 10 10" className="h-2 w-2 opacity-0 transition-opacity group-hover:opacity-70">
                    <path d="M2.5 5 H7.5" stroke="#663c00" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </button>
                <button
                  aria-label={w.maximized ? `Restore ${w.title}` : `Maximize ${w.title}`}
                  onClick={() => onToggleMaximize(w.id)}
                  className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#28c840] transition-colors hover:bg-[#5fdd73]"
                >
                  <svg viewBox="0 0 10 10" className="h-2 w-2 opacity-0 transition-opacity group-hover:opacity-70">
                    <path d="M3 3 L7 7 M7 3 L7 7 L3 7" fill="none" stroke="#0a4d14" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <span className="ml-2 select-none text-xs font-medium tracking-tight text-zinc-300">{w.title}</span>
              </div>
              <span className="hidden select-none pr-1 text-[10px] uppercase tracking-[0.2em] text-zinc-600 sm:block">
                the human answer os
              </span>
            </div>

            {/* Body */}
            <div className={`min-h-0 flex-1 ${w.kind === 'answers' ? 'overflow-hidden' : 'overflow-y-auto'}`}>
              <WindowBody kind={w.kind} windowId={w.id} openPayload={props.openPayload} />
            </div>

            {/* status bar */}
            <div
              className="flex flex-shrink-0 items-center justify-between px-3 py-1 text-[10px] text-zinc-600"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              <span>{w.title}</span>
              <span>{w.maximized ? 'maximized' : 'floating'} · double-click title bar to toggle</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function WindowBody({ kind, openPayload }: { kind: WinKind; windowId: string; openPayload: WindowLayerProps['openPayload'] }) {
  switch (kind) {
    case 'about':
      return <AboutWindow />
    case 'answers':
      return <BookshelfWindowContent />
    case 'column':
      return <ColumnWindow />
    case 'ask':
      return <AskMattChat />
    case 'record':
      return <MattsRecord />
    default:
      return null
  }
}
