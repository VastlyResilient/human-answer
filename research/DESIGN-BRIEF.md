# DESIGN BRIEF — The Human Answer × Mostar cinematic theme

## FONT DECISION (updated after QA)
The spec's Ogg Medium CDN sends NO Access-Control-Allow-Origin header, so @font-face from any
deployed origin is hard-blocked by browsers. The file was vendored to assets/OggText-Medium.woff2
(byte-identical, woff2 signature verified). NOTE: Ogg is a commercial typeface - licensing must be
confirmed before production/commercial launch (see GAPS.md).

## Asset decision
The Mostar spec loads 7 scene PNG layers + 1 display font remotely. The client supplied ONE
animated wallpaper (mp4, CloudFront, 26.6MB) to "swap in". Mapping: the video takes the SKY /
farthest-background slot (z 0), sitting ON TOP of the sky PNG, which is kept underneath as the
instant-paint frame and as fallback if the video fails to load. Both receive the same blur /
brightness scroll choreography so frames 2-3 read identically to the reference page.

Prefers-reduced-motion: video is paused (it is ambient motion, not scrubbed content) and the
static sky shows instead. Per ui-visual-verification skill: scrubbed canvases stay usable
under RM; decorative autoplay is suppressed.

## Component mapping (Mostar -> Human Answer)
| Mostar element | Human Answer |
|---|---|
| Header logo "Bosnia and Herzegovina" | "The Human Answer" (brand) |
| Nav Intro/Bridge/Bazaar/Routes | Home / Column / Answers / Ask Matt (pixel-scrolled targets, see below) |
| Hero title MOSTAR | "The Human Answer" (two-line lockup, clamp() sizing because the string is ~2x longer than MOSTAR at 14rem) |
| intro-copy + 3 pills | Positioning promise + ask-style search bar (Home-page hero per HA spec s8) + 3 truth pills |
| Story panel 1 (bridge) | "Lived first, written second." - the editorial policy panel; facts = 0% AI-signed / 100% expanded (policy truths, not unverifiable stats) |
| Story panel 2 (bazaar) | "The Living Column keeps the light on." + "Read this week's column" pill |
| Sights slider (5 cards x3 clones) | Format examples & roadmap cards, every one KICKER-labeled (Format example / Ask Matt / Philosophy / Roadmap) so nothing reads as a real Matt quote - no fabrication allowed (hard rule 1) |
| Sight pin icons | kept, same URLs |
| post-rig flow | #answers archive stub, #ask submission form (localStorage queue, provider TBD), subscribe capture, about teaser, human-authorship footer |

## Navigation special case
Anchors inside the sticky 3700px rig resolve to the wrong physical location, so nav targets are
driven by JS scrollTo at choreography pixels (Home=0, Column~2050, Answers~3660, Ask Matt ->
post-rig element). href fallbacks retained for no-JS.

## Typography
Ogg Medium loads from the given CloudFront URL for all display type. Body falls to the spec's
own stack (system-ui on macOS). Hero/story sizes converted from fixed rem to clamps so the
longer strings hold the reference proportions (deviation documented, animation geometry untouched).

## Honesty engineering
- Search submits -> jumps to the archive/slider and flashes matching cards. No fake result counts.
- Ask Matt stores submissions locally with a visible status note saying reviewer-inbox sync
  activates when the email provider is chosen (GAPS.md item).
- Language switcher rendered but disabled with explanatory title (one language exists today).
- Unverified handle candidates (YouTube/X/DeviantArt wolfspirit99 gaming accounts) are NOT
  linked anywhere on the site.
