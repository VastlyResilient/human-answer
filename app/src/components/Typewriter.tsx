import { useEffect, useRef, useState } from 'react'

interface TypewriterProps {
  /** keyed blocks: [{text, className}] typed sequentially */
  blocks: { text: string; className?: string }[]
  speed?: number
  startDelay?: number
  onDone?: () => void
}

export default function Typewriter({ blocks, speed = 9, startDelay = 120, onDone }: TypewriterProps) {
  const [rendered, setRendered] = useState<string[]>(() => blocks.map(() => ''))
  const doneRef = useRef(false)

  useEffect(() => {
    setRendered(blocks.map(() => ''))
    doneRef.current = false
    let cancelled = false
    let blockIdx = 0
    let charIdx = 0

    function tick() {
      if (cancelled || blockIdx >= blocks.length) return
      const current = blocks[blockIdx].text
      charIdx += Math.random() < 0.18 ? 2 : 1
      if (charIdx >= current.length) {
        charIdx = current.length
        setRendered((prev) => {
          const next = [...prev]
          next[blockIdx] = current
          return next
        })
        blockIdx += 1
        charIdx = 0
        setTimeout(tick, 140) // small pause between paragraphs
      } else {
        setRendered((prev) => {
          const next = [...prev]
          next[blockIdx] = current.slice(0, charIdx)
          return next
        })
        setTimeout(tick, speed)
      }
      if (blockIdx >= blocks.length && !doneRef.current) {
        doneRef.current = true
        onDone?.()
      }
    }

    const t = setTimeout(tick, startDelay)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(blocks)])

  const activeIndex = rendered.findIndex((t, i) => t.length < blocks[i].text.length)

  return (
    <>
      {blocks.map((b, i) => (
        <p key={i} className={b.className ?? ''}>
          {rendered[i]}
          {i === activeIndex && <span className="type-caret" aria-hidden="true" />}
        </p>
      ))}
    </>
  )
}
