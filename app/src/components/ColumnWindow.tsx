import { Newspaper } from 'lucide-react'
import Typewriter from './Typewriter'
import { useMemo } from 'react'

export default function ColumnWindow() {
  const blocks = useMemo(() => [
    { text: 'The Living Column runs on reader questions. Each week, one question gets the full treatment: researched, answered straight, credited to the asker by first name unless they ask to stay dark.', className: 'text-sm leading-relaxed text-zinc-300' },
    { text: 'Three rules govern every column: the direct answer comes first, the story underneath carries it, and nothing ships padded. If an answer needs ten words, it gets ten words.', className: 'text-sm leading-relaxed text-zinc-400' },
    { text: 'Submissions are currently paused. Questions reach Matt through his Quora inbox.', className: 'text-sm leading-relaxed text-zinc-500' },
  ], [])
  return (
    <div className="px-6 py-6 sm:px-10 sm:py-8">
      <div className="flex items-center gap-2" style={{ color: '#DA3F23' }}>
        <Newspaper size={15} />
        <span className="text-xs font-semibold uppercase tracking-[0.22em]">The heartbeat</span>
      </div>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">The Living Column</h2>
      <div className="mt-5 max-w-2xl border-l-2 pl-4" style={{ borderColor: 'rgba(218,63,35,0.45)' }}>
        <Typewriter blocks={blocks} speed={7} />
      </div>
    </div>
  )
}
