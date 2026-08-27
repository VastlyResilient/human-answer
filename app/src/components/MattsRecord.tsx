import { Trophy, TrendingUp, FileText, Users, BadgeCheck, Info } from 'lucide-react'

const PROFILE = 'https://www.quora.com/profile/WolfSpirit99'

export default function MattsRecord() {
  const leverage = [
    { icon: TrendingUp, stat: 'Millions', label: 'Lifetime answer views', note: 'client-reported — verify against export' },
    { icon: FileText, stat: '1,000+', label: 'Published answers', note: 'scale of the archive' },
    { icon: Users, stat: '11 yrs', label: 'Writing in public', note: 'span of the account' },
    { icon: Trophy, stat: 'One voice', label: 'Never outsourced', note: 'every answer his own hand' },
  ]
  return (
    <div className="px-6 py-6 sm:px-10 sm:py-8">
      <div className="flex items-center gap-2" style={{ color: '#DA3F23' }}>
        <Trophy size={15} />
        <span className="text-xs font-semibold uppercase tracking-[0.24em]">The record so far</span>
      </div>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">A Track Record Worth Quoting</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
        The leverage numbers behind the shelf. Stats marked below get hardened
        into exact figures the moment Matt&rsquo;s Quora export lands &mdash; nothing
        here is inflated for effect.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {leverage.map(({ icon: Icon, stat, label, note }) => (
          <div key={label} className="rounded-xl px-4 py-4"
               style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Icon size={16} style={{ color: '#DA3F23' }} />
            <div className="mt-2 text-2xl font-semibold tracking-tight text-white">{stat}</div>
            <div className="text-xs font-medium text-zinc-300">{label}</div>
            <div className="mt-1 text-[10px] uppercase tracking-wider text-zinc-600">{note}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-start gap-2 rounded-lg px-4 py-3 text-xs leading-relaxed text-zinc-500"
           style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.12)' }}>
        <Info size={13} className="mt-0.5 flex-shrink-0" />
        <p>
          Verification badge system is wired: when the export arrives, each stat
          flips from <BadgeCheck size={11} className="inline text-zinc-500" /> reported
          to <BadgeCheck size={11} className="inline text-[#DA3F23]" /> verified with its
          source row. We do not round up, we do not guess.
        </p>
      </div>

      <a href={PROFILE} target="_blank" rel="noopener noreferrer"
         className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-zinc-800/70 px-4 py-2 text-sm text-zinc-200 transition-colors hover:bg-zinc-700/70 hover:text-white">
        See the record in the wild on Quora ↗
      </a>
    </div>
  )
}
