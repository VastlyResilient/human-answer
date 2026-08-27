import { useState } from 'react'
import { Eye, EyeOff, Chrome, Apple, Twitter } from 'lucide-react'
import Logo from './Logo'
import type { WindowState } from '../types'

interface SignUpCardProps {
  onOpen: (kind: WindowState['kind'], title: string) => void
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 12 12" className="h-3 w-3 text-black" aria-hidden="true">
      <path d="M2 6.2 L4.8 9 L10 3.2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function SignUpCard({ onOpen }: SignUpCardProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const socialButton =
    'flex flex-1 items-center justify-center rounded-lg bg-zinc-800/60 py-2 text-zinc-300 transition-colors hover:bg-zinc-700/60 hover:text-white'

  return (
    <div className="mx-4 flex max-w-4xl flex-col overflow-hidden rounded-2xl shadow-2xl sm:h-[660px] sm:flex-row">
      {/* Left column - form */}
      <div
        className="flex w-full flex-col px-6 py-8 sm:w-1/2 sm:px-10 sm:py-10"
        style={{ background: 'rgba(10, 10, 10, 0.92)' }}
      >
        <div className="flex items-center gap-2">
          <Logo size={36} />
          <span className="text-lg font-semibold tracking-tight" style={{ color: '#DA3F23' }}>
            NovaDesk
          </span>
        </div>

        <div className="mt-8 flex flex-col gap-5 sm:mt-auto">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Sign up</h1>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
              Set up your profile and jump in right now.
            </p>
          </div>

          <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Input Email"
              aria-label="Email"
              className="w-full rounded-lg bg-zinc-800/70 px-4 py-2.5 text-sm text-white placeholder-zinc-500 transition-colors focus:outline-none focus:ring-1 focus:ring-zinc-500"
            />

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose Password"
                aria-label="Password"
                className="w-full rounded-lg bg-zinc-800/70 px-4 py-2.5 pr-11 text-sm text-white placeholder-zinc-500 transition-colors focus:outline-none focus:ring-1 focus:ring-zinc-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-300"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <label className="flex cursor-pointer items-start gap-2.5">
              <input
                type="checkbox"
                className="sr-only"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <span
                aria-hidden="true"
                className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-colors ${
                  agreed ? 'border-white bg-white' : 'border-zinc-600 bg-transparent'
                }`}
              >
                {agreed && <CheckIcon />}
              </span>
              <span className="text-xs leading-relaxed text-zinc-400">
                I Agree On The{' '}
                <a href="#" onClick={(e) => e.preventDefault()} className="text-zinc-200 underline underline-offset-2 transition-colors hover:text-white">
                  Rules
                </a>{' '}
                &amp;{' '}
                <a href="#" onClick={(e) => e.preventDefault()} className="text-zinc-200 underline underline-offset-2 transition-colors hover:text-white">
                  Privacy Notice
                </a>
              </span>
            </label>

            <button
              type="submit"
              className="w-full rounded-lg bg-white py-2.5 text-sm font-semibold text-black transition-colors hover:bg-zinc-100 active:bg-zinc-200"
            >
              Launch Account
            </button>
          </form>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-zinc-700/60" />
            <span className="text-xs text-zinc-500">or join us via</span>
            <div className="h-px flex-1 bg-zinc-700/60" />
          </div>

          <div className="flex gap-2.5">
            <button type="button" aria-label="Continue with Google" className={socialButton}>
              <Chrome size={15} />
            </button>
            <button type="button" aria-label="Continue with Apple" className={socialButton}>
              <Apple size={15} />
            </button>
            <button type="button" aria-label="Continue with Twitter" className={socialButton}>
              <Twitter size={15} />
            </button>
          </div>

          <p className="text-center text-xs text-zinc-500">
            Already Hold An Account?{' '}
            <a href="#" onClick={(e) => e.preventDefault()} className="font-medium text-zinc-200 transition-colors hover:text-white">
              Enter
            </a>
          </p>
        </div>

        {/* menu row inside left column bottom */}
        <nav aria-label="Site pages" className="mt-6 flex items-center gap-4 border-t border-zinc-700/50 pt-4 text-xs">
          <button onClick={() => onOpen('answers', "Matt's Answers — The Shelf")} className="text-zinc-400 transition-colors hover:text-white">Answers</button>
          <button onClick={() => onOpen('about', 'About Matt')} className="text-zinc-400 transition-colors hover:text-white">About</button>
          <button onClick={() => onOpen('column', 'The Living Column')} className="text-zinc-400 transition-colors hover:text-white">Column</button>
          <button onClick={() => onOpen('ask', 'Ask Matt')} className="text-zinc-400 transition-colors hover:text-white">Ask Matt</button>
        </nav>
      </div>

      {/* Right column - glass brand panel */}
      <div
        className="hidden items-center justify-center sm:flex sm:w-1/2"
        style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div style={{ marginTop: -70 }}>
          <Logo size={34} />
        </div>
      </div>
    </div>
  )
}
