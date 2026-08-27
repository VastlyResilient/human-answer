# The Human Answer — cinematic intro build (Phase 0.5)

The public front door for Matt's (WolfSpirit99) owned platform: an animated,
scroll-driven story built on the "Mostar city" cinematic template, ending in the
working parts — Ask Matt queue, subscribe capture, archive stub.

**Live:** https://vastlyresilient.github.io/human-answer/

## Files that matter
| File | Role |
|---|---|
| `index.html` | The whole page structure (cinematic rig + post-scroll rail) |
| `styles.css` | Theme + all scroll animation styling |
| `script.js` | Animation engine, slider, forms |
| `assets/OggText-Medium.woff2` | Display serif (vendored: origin CDN sends no CORS header) |
| `import-answers.py` | Converts Matt's answer files into the categorized Answers page |
| `research/matt-dossier.md` | Phase-0 research: what is verified vs unknown about Matt |
| `research/DESIGN-BRIEF.md` | How each Mostar component maps to The Human Answer |
| `GAPS.md` | Everything missing from Matt/Bobby before this is a "real" launch |

## Everyday workflows (non-technical)

### Update the site
Edit `index.html` (text is plain HTML), then push to `main`. GitHub Pages
republishes automatically within ~1 minute. Nothing else to do.

### Read questions people submitted via Ask Matt
Submissions currently store **in the reader's own browser** (localStorage key
`ha_ask_queue`) because no email provider is connected yet. To read them on a
given browser: open the site, press F12 → Console, type
`JSON.parse(localStorage.ha_ask_queue)` and press Enter. Connecting the email
provider (see GAPS.md #5) replaces this with a real inbox.

### Import Matt's real Quora answers onto the Answers page
1. Put each answer in `inputs/answers/` - one `.txt` or `.md` file per answer:
   first line = the question, everything below = the answer text. Optional header
   at the top sets topic/date/views/url:
   ```
   ---
   topic: Family
   date: 2021-03-04
   views: 128000
   url: https://www.quora.com/How-do-I...
   ---
   ```
   (A single `.json` array of `{question, body, topic, ...}` objects also works -
   that matches the shape of Quora's own account data export.)
2. `python3 import-answers.py` -> rebuilds `answers.html` grouped by topic,
   kept as PREVIEW + noindex until reviewed.
3. Read the diff. If it looks right: `python3 import-answers.py --publish-real`,
   then commit+push like any other update.

### Swap the animated wallpaper
Replace the `src="…mp4"` value on the `<video class="wall-video">` line in
`index.html`. The static sky photo underneath stays as the fallback/loading frame.

### Re-run the verification harness
```
node qa-probe.cjs                       # tests the local file
SITE_URL=https://vastlyresilient.github.io/human-answer/ node qa-probe.cjs
```
It scrubs every scroll stage and asserts the exact animation values.

## Deliberately NOT here yet (by design, per build spec)
Real answers, real bio, real name, photo bylines, email sync, Railway hosting —
each blocked on a listed item in `GAPS.md`. Nothing on the site pretends otherwise.
