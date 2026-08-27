import { useEffect, useRef, useState } from 'react'
import { SendHorizonal, RotateCcw } from 'lucide-react'
import { GREETING, reply, type ChatMessage } from '../askMatt/engine'

const STORE_KEY = 'ha_ask_matt_history_v1'

function loadHistory(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (raw) return JSON.parse(raw) as ChatMessage[]
  } catch {}
  return [{ role: 'matt', text: GREETING }]
}

export default function AskMattChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(loadHistory)
  const [draft, setDraft] = useState('')
  const [streamingText, setStreamingText] = useState<string | null>(null)
  const [thinking, setThinking] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const messagesRef = useRef(messages)
  const busyRef = useRef(false)
  const queueRef = useRef<string[]>([])

  messagesRef.current = messages

  useEffect(() => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(messages.slice(-40))) } catch {}
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [messages, streamingText])

  async function streamAnswer(history: ChatMessage[], messageText: string) {
    busyRef.current = true
    const nextHistory = [...history, { role: 'user' as const, text: messageText }]
    setMessages(nextHistory)
    setThinking(true)

    await new Promise((r) => setTimeout(r, 450 + Math.random() * 400))
    const { text: answerText } = reply(messageText, nextHistory)
    setThinking(false)
    setStreamingText('')

    for (let i = 0; i < answerText.length; i++) {
      if (i % 3 === 0) await new Promise((r) => setTimeout(r, 12))
      setStreamingText(answerText.slice(0, i + 1))
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
    }
    setStreamingText(null)
    const finalHistory = [...nextHistory, { role: 'matt' as const, text: answerText }]
    setMessages(finalHistory)

    busyRef.current = false
    const queued = queueRef.current.shift()
    if (queued) void streamAnswer(finalHistory, queued)
  }

  function send() {
    const text = draft.trim()
    if (!text) return
    if (busyRef.current) {
      queueRef.current.push(text) // never drop a reader's question
      setDraft('')
      return
    }
    setDraft('')
    void streamAnswer(messagesRef.current, text)
  }

  function reset() {
    queueRef.current = []
    if (!busyRef.current) setMessages([{ role: 'matt', text: GREETING }])
    try { localStorage.removeItem(STORE_KEY) } catch {}
  }

  return (
    <div className="flex h-[min(64vh,620px)] flex-col">
      <div className="flex flex-shrink-0 items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: '#DA3F23' }}>Ask Matt</span>
          <p className="mt-0.5 text-[11px] text-zinc-500">an AI answering in Matt&rsquo;s public style - it owns up to that if asked</p>
        </div>
        <button onClick={reset} title="Clear conversation" aria-label="Clear conversation" className="rounded-md p-2 text-zinc-500 transition-colors hover:bg-white/10 hover:text-white">
          <RotateCcw size={14} />
        </button>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
        {messages.map((m, i) => (
          <Bubble key={i} role={m.role} text={m.text} />
        ))}
        {thinking && (
          <div className="flex gap-1.5 pl-1" aria-label="Matt is thinking">
            {[0, 1, 2].map((d) => (
              <span key={d} className="chat-dot h-1.5 w-1.5 rounded-full bg-zinc-500" style={{ animationDelay: `${d * 0.18}s` }} />
            ))}
          </div>
        )}
        {streamingText !== null && <Bubble role="matt" text={streamingText} streaming />}
      </div>

      <div className="flex flex-shrink-0 items-end gap-2 px-4 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              send()
            }
          }}
          rows={1}
          placeholder="Ask about starting over, fear, loss, money, family..."
          aria-label="Message"
          className="max-h-28 min-h-[42px] flex-1 resize-none rounded-lg bg-zinc-800/70 px-4 py-2.5 text-sm text-white placeholder-zinc-500 transition-colors focus:outline-none focus:ring-1 focus:ring-zinc-500"
        />
        <button
          onClick={send}
          disabled={!draft.trim()}
          aria-label="Send message"
          className="flex h-[42px] w-[46px] items-center justify-center rounded-lg bg-white text-black transition-colors hover:bg-zinc-100 active:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <SendHorizonal size={16} />
        </button>
      </div>
    </div>
  )
}

function Bubble({ role, text, streaming = false }: { role: ChatMessage['role']; text: string; streaming?: boolean }) {
  const isMatt = role === 'matt'
  const paras = text.split('\n\n')
  return (
    <div className={`flex ${isMatt ? '' : 'justify-end'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${isMatt ? '' : 'rounded-br-sm bg-white/95'}`}
        style={
          isMatt
            ? { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }
            : undefined
        }
      >
        {isMatt && (
          <div className="mb-1 flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: '#DA3F23' }}>WolfSpirit99</span>
            {streaming && <span className="type-caret" />}
          </div>
        )}
        {paras.map((p, i) => (
          <p key={i} className={`whitespace-pre-wrap text-sm ${i ? 'mt-2' : ''} leading-relaxed ${isMatt ? 'text-zinc-200' : 'text-black'}`}>
            {p}
          </p>
        ))}
      </div>
    </div>
  )
}
