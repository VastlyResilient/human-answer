import { useCallback, useRef, useState } from 'react'
import VideoBackground from './components/VideoBackground'
import GlitchBanner from './components/GlitchBanner'
import DesktopIcons from './components/DesktopIcons'
import Taskbar from './components/Taskbar'
import WindowLayer from './windows/WindowLayer'
import { MENU_BAR_HEIGHT } from './layoutConstants'
import type { WinKind, WindowState } from './types'

export default function App() {
  const [windows, setWindows] = useState<WindowState[]>([])
  const zTop = useRef(20)

  const open = useCallback((kind: WinKind, title: string, payload?: unknown) => {
    setWindows((prev) => {
      const existing = prev.find((w) => w.kind === kind)
      if (existing) {
        const z = ++zTop.current
        return prev.map((w) =>
          w.kind === kind ? { ...w, minimized: false, zIndex: z } : w,
        )
      }
      const vw = window.innerWidth
      const vh = window.innerHeight
      const wWidth = Math.min(vw - 40, 1080)
      const wHeight = Math.min(vh - 140, 700)
      const n = prev.length
      const x = Math.max(20, (vw - wWidth) / 2 + ((n % 3) - 1) * 48)
      const y = Math.max(MENU_BAR_HEIGHT + 8, (vh - wHeight) / 2 - 24 + (n % 2) * 28)
      const z = ++zTop.current
      return [
        ...prev,
        { id: `${kind}-${Date.now()}`, kind, title, zIndex: z, x, y, minimized: false, maximized: false },
      ]
    })
  }, [])

  const close = useCallback((id: string) => setWindows((prev) => prev.filter((w) => w.id !== id)), [])

  const focus = useCallback((id: string) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, zIndex: ++zTop.current } : w)))
  }, [])

  const minimize = useCallback((id: string) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, minimized: true } : w)))
  }, [])

  const toggleMaximize = useCallback((id: string) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, maximized: !w.maximized } : w)))
  }, [])

  const restore = useCallback((kind: WinKind) => {
    setWindows((prev) => prev.map((w) => (w.kind === kind ? { ...w, minimized: false, zIndex: ++zTop.current } : w)))
  }, [])

  return (
    <div className="relative min-h-screen w-screen overflow-x-hidden bg-black sm:h-screen sm:overflow-hidden">
      <VideoBackground />
      <div className="pointer-events-none absolute inset-0 bg-black/25" />

      <GlitchBanner />
      <DesktopIcons onOpen={open} />
      <Taskbar windows={windows} onOpen={open} onFocus={focus} onRestore={restore} onClose={close} />

      <WindowLayer
        windows={windows}
        onClose={close}
        onFocus={focus}
        onMinimize={minimize}
        onToggleMaximize={toggleMaximize}
        openPayload={open}
      />
    </div>
  )
}
