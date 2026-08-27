import { useCallback, useState } from 'react'
import VideoBackground from './components/VideoBackground'
import SignUpCard from './components/SignUpCard'
import DockMenu from './components/DockMenu'
import WindowLayer from './windows/WindowLayer'
import type { WindowState } from './types'

let zCounter = 20

export default function App() {
  const [windows, setWindows] = useState<WindowState[]>([])

  const openWindow = useCallback((kind: WindowState['kind'], title: string) => {
    setWindows((prev) => {
      const existing = prev.find((w) => w.kind === kind)
      if (existing) {
        zCounter += 1
        return prev.map((w) =>
          w.kind === kind ? { ...w, zIndex: zCounter } : w,
        )
      }
      zCounter += 1
      const count = prev.length
      return [
        ...prev,
        { id: `${kind}-${Date.now()}`, kind, title, zIndex: zCounter,
          x: 40 + ((count * 36) % 180), y: 60 + ((count * 28) % 120) },
      ]
    })
  }, [])

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id))
  }, [])

  const focusWindow = useCallback((id: string) => {
    zCounter += 1
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, zIndex: zCounter } : w)))
  }, [])

  return (
    <div className="relative min-h-screen w-screen overflow-x-hidden bg-black sm:h-screen sm:overflow-hidden">
      <VideoBackground />
      <div className="relative z-10 flex min-h-screen w-full items-center justify-center py-6 sm:py-0">
        <SignUpCard onOpen={openWindow} />
      </div>
      <DockMenu onOpen={openWindow} />
      <WindowLayer windows={windows} onClose={closeWindow} onFocus={focusWindow} />
    </div>
  )
}
