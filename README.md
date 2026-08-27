# The Human Answer — cinematic intro build (Phase 0.5)

The public front door for Matt's (WolfSpirit99) owned platform: an animated,
scroll-driven story built on the "Mostar city" cinematic template, ending in the
working parts — Ask Matt queue, subscribe capture, archive stub.

**Live:** https://vastlyresilient.github.io/human-answer/

## What this is now
Matt's desktop - a fullscreen cinematic "retro OS" overview of The Human Answer:
- CRT glitch banner "WolfSpirit99 ONLINE" over the animated wallpaper
- Desktop icons + taskbar with real window behavior (close / minimize / maximize / drag)
- **About Matt** window (typewriter reveal; personality, humor, craft - nothing invented)
- **Matt's Answers** window: animated bookshelf of 10 preview editions (titled covers,
  each with the question it stands for + the spine of the answer)
- **Living Column** window
- **Ask Matt** chatbot (local style engine, streaming, memory, honest identity)

## Dev
- Source: `app/` (Vite + React + TS + Tailwind + lucide-react)
- Build & publish: `cd app && npm run build && cp -r dist/* ..`
- Local probe: `node qa-v2-probe.cjs` (needs `python3 -m http.server 8903` in repo root)
- Real Quora answers still await Matt's export (see GAPS.md) -> import-answers.py + KB grounding.
