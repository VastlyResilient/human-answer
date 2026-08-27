import { Sparkles, Brain, Feather, GraduationCap } from 'lucide-react'
import Typewriter from './Typewriter'
import { useMemo } from 'react'

export default function AboutWindow() {
  const blocks = useMemo(() => [
    { text: "Matt writes the way people actually talk when the cameras are off - plainly, with a dry wit that sneaks up on you. Under the handle WolfSpirit99 he has spent years answering strangers' questions on Quora about family, work, loss, money and starting over - the kind of questions you type into a search bar at 1 a.m.", className: 'text-sm leading-relaxed text-zinc-300' },
    { text: 'His habits of mind are easy to spot once you read a few answers: give the point away in the first two sentences; earn the rest with something that actually happened; never punch down; treat a stranger\'s bad day like it matters, because it does. He is allergic to filler phrases - no \"great question,\" no throat-clearing.', className: 'text-sm leading-relaxed text-zinc-300' },
    { text: 'There is humor in the margins of almost everything he writes - the self-deprecating kind, aimed at himself first. And there is craft: answers get cut like short stories, each one ending sooner than you expect.', className: 'text-sm leading-relaxed text-zinc-400' },
    { text: 'That is also the rule of this site: nothing published here pretends to be him until he says it is. The full verified biography, the view counts worth printing, the photos - they land when his archive export does. Until then, everything here is built around his ideas, clearly labeled.', className: 'text-sm leading-relaxed text-zinc-500' },
  ], [])

  const traits = [
    { icon: Feather, label: 'Plainspoken', note: 'no jargon armor' },
    { icon: Brain, label: 'Lived-first', note: 'story before sermon' },
    { icon: Sparkles, label: 'Dryly funny', note: 'aimed at himself' },
    { icon: GraduationCap, label: 'Generous', note: 'answers to teach, not flex' },
  ]

  return (
    <div className="px-6 py-6 sm:px-10 sm:py-8">
      <div className="flex items-center gap-2" style={{ color: '#DA3F23' }}>
        <span className="text-xs font-semibold uppercase tracking-[0.22em]">Who is writing</span>
      </div>

      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
        Matt <span className="text-zinc-500">·</span>{' '}
        <span className="text-zinc-400">the human behind the answers</span>
      </h2>

      <div className="mt-5 max-w-2xl border-l-2 pl-4" style={{ borderColor: 'rgba(218,63,35,0.45)' }}>
        <Typewriter blocks={blocks} speed={7} />
      </div>

      <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {traits.map(({ icon: Icon, label, note }) => (
          <div
            key={label}
            className="rounded-xl px-4 py-3"
            style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <Icon size={16} style={{ color: '#DA3F23' }} />
            <div className="mt-2 text-sm font-semibold text-zinc-200">{label}</div>
            <div className="text-xs text-zinc-500">{note}</div>
          </div>
        ))}
      </div>

      <a
        href="https://www.quora.com/profile/WolfSpirit99"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-7 inline-flex items-center gap-1.5 rounded-lg bg-zinc-800/70 px-4 py-2 text-sm text-zinc-200 transition-colors hover:bg-zinc-700/70 hover:text-white"
      >
        Original profile on Quora ↗
      </a>
    </div>
  )
}
