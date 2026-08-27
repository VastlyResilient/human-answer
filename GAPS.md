# GAPS.md - The Human Answer (verified build state 2026-08-27)

Every item below blocks or degrades part of the final spec. Nothing here can be invented
(hard rule 1) - each needs a human input from Bobby/Matt.

## Blockers for Phase-1 completion (spec §11 checklist)
1. **Matt's real name + permission to use it** - site currently uses "Matt" + "WolfSpirit99"
   (aka). Spec §4 says stop if real name not provided. STOPPED: brand lockup uses the site name,
   Person schema carries first name + handle only. NEEDS: legal name + explicit OK.
2. **Quora data export / answer corpus** - dossier has topics/top-answers/voice = UNKNOWN;
   permitted searches surfaced zero answer content. All sample copy on the site is labeled
   "Format example" - none of it is Matt's writing. NEEDS: Quora settings -> account data
   download, dropped into the repo inputs folder.
3. **Headshot / photos** - byline-with-photo design (§8) not built; placeholder-free layout
   used instead. NEEDS: real photo files.
4. **Domain name** - none provided. Deployed to GitHub Pages as evidence host; Railway deploy
   (§7) awaits a project invite/token or domain decision. NEEDS: domain + hosting pick.
5. **Email provider** - Ask Matt + subscribe forms queue locally (localStorage) with visible
   honest status notes. NEEDS: Buttondown/ConvertKit/etc. choice -> wire the queue to it.
6. **Column cadence confirmation** - site copy says "weekly" and spec default is Fridays;
   NOT confirmed by Matt/Bobby. Copy avoids naming a weekday until confirmed.
7. **Credentials/bio facts** - none verified beyond handle + profile URL. The "~11M views"
   claim is client-reported and appears NOWHERE on the site; needs export proof before use.

## Flagged risks
- **Ogg Medium licensing** (commercial face) vendored from the supplied URL per instructions -
  verify license covers this use before charging money / custom domain.
- **Wallpaper autonomy**: the animate wallpaper swap lives inside the sky layer driven by the
  spec's scroll filters. Any wallpaper swap later = replace one <video> src line.
- **sameAs candidates unverified**: youtube.com/@wolfspirit99, x.com/WSpirit99,
  deviantart.com/wolfspirit99 were found in SERPs but are gaming/art accounts whose identity
  was NOT confirmed - deliberately not linked; confirm with Matt before ever adding.


## Ask Matt chatbot (added 2026-08-27)
The chat window runs a LOCAL style-engine (no API, no server): it answers in the
voice of WolfSpirit99's public writing (direct answer first, lived-story framing,
dry humor) from an original knowledge base of ~11 topic areas, and it explicitly
tells any asker "I am an AI in his style - not the man himself." It is NOT yet
grounded in his verbatim Quora answers because those require the archive export
(blocker #2 above). When the export lands: (a) replace KB entries one-for-one with
his actual wording, or (b) switch the engine to a BYO-key model call with the
export injected as retrieval context. The UI, streaming, and memory are already built.


## Archive harvest (2026-08-27, authorized logged-in session)
947 answers captured (947 unique permalinks, 5/5 spot-check verified, no Quora warnings).
SHIPPED: every answer is a book in the archive browser with its TRUE permalink
(`sourceUrl`) — the exact-answer link the site always promised.
REMAINING: feed previews are truncated by Quora (~465 chars median); full verbatim
texts need either (a) parsing the 23MB answers-feed-full.html expansion payloads,
(b) a Matt-authorized logged-in per-URL pass, or (c) the official export. Preview
passages are labeled as such in the UI.
