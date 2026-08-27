#!/usr/bin/env python3
"""
import-answers.py - The Human Answer
Turns Matt's real Quora answers (.txt/.md files, or one .json array) into
categorized entries on answers.html.

USAGE
  1. Drop answer files into inputs/answers/   (one answer per file)
       - First non-empty line = the QUESTION
       - Rest = the ANSWER text
       - Optional front matter:
           ---
           topic: Family
           date: 2021-03-04
           views: 128000
           url: https://www.quora.com/...
           ---
     Or one .json file containing an array of {question, body/topic/date/views/url}.
  2. Preview locally (rebuilt page stays PREVIEW + noindex):
       python3 import-answers.py
  3. After Bobby reviews the diff, publish publicly:
       python3 import-answers.py --publish-real

Never pushes anywhere - git commit/push stays a human decision.
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, "inputs", "answers")
OUT = os.path.join(ROOT, "answers.html")
FRONT = re.compile(r"^---\s*\n(.*?)\n---\s*\n", re.S)

def slug_topic(t):
    return "-".join(re.findall(r"[a-z0-9]+", t.lower())) or "general"

def parse_file(path):
    raw = open(path, encoding="utf-8").read().strip()
    meta = {}
    m = FRONT.match(raw)
    if m:
        for line in m.group(1).splitlines():
            if ":" in line:
                k, v = line.split(":", 1)
                meta[k.strip().lower()] = v.strip()
        raw = raw[m.end():]
    lines = raw.splitlines()
    while lines and not lines[0].strip():
        lines.pop(0)
    if len(lines) < 2:
        return None
    question = lines[0].strip()
    paras = [p.strip() for p in "\n".join(lines[1:]).split("\n\n") if p.strip()]
    if not paras:
        return None
    return {
        "question": question,
        "body_paras": paras,
        "topic": meta.get("topic") or meta.get("category") or "General",
        "date": meta.get("date", ""),
        "views": meta.get("views", ""),
        "url": meta.get("url", ""),
        "source_file": os.path.basename(path),
    }

def load_answers():
    items = []
    if not os.path.isdir(SRC):
        return items
    for name in sorted(os.listdir(SRC)):
        path = os.path.join(SRC, name)
        try:
            if name.endswith(".json"):
                data = json.load(open(path, encoding="utf-8"))
                if isinstance(data, dict):
                    data = data.get("answers", [])
                for d in data:
                    d.setdefault("topic", "General")
                    d.setdefault("source_file", name)
                    d.setdefault("body_paras", [d.get("body", "")])
                    items.append(d)
            elif name.endswith((".txt", ".md")):
                a = parse_file(path)
                if a:
                    items.append(a)
        except Exception as e:
            print("  !! skipped %s: %s" % (name, e))
    print("Loaded %d answers from inputs/answers/" % len(items))
    return items

def fmt_views(v):
    try:
        n = int(str(v).replace(",", "").replace("+", ""))
        return ("%.1fM views" % (n / 1e6)) if n >= 1e6 else ("%dK views" % round(n / 1e3))
    except Exception:
        return ""

def esc(s):
    return str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

def card(a):
    label = "FROM QUORA"
    if a.get("views"):
        label += " \u00b7 " + fmt_views(a["views"])
    parts = []
    for i, para in enumerate(a["body_paras"]):
        cls = "direct" if i == 0 else ""
        txt = esc(para).replace("\n", "<br />")
        parts.append('<p class="%s">%s</p>' % (cls, txt))
    paras_html = "\n      ".join(parts)
    link = ""
    if a.get("url"):
        link = ' <a href="%s" target="_blank" rel="noopener">original &#8599;</a>' % esc(a["url"])
    date_bit = "<span>Answered %s</span>" % esc(a["date"]) if a.get("date") else ""
    return (
        '    <article class="answer-card" data-answer>\n'
        '      <span class="sample-tag">%s</span>\n'
        '      <h3>%s</h3>\n'
        '      %s\n'
        '      <div class="answer-meta"><span>Topic: %s</span>%s%s</div>\n'
        '    </article>'
    ) % (label, esc(a["question"]), paras_html, esc(a["topic"]), date_bit, link)

def build_sections(answers):
    topics = {}
    for a in answers:
        topics.setdefault(a["topic"], []).append(a)
    blocks = []
    for t in sorted(topics, key=lambda x: (-len(topics[x]), x.lower())):
        tid = "t-" + slug_topic(t)
        cards = "\n\n".join(card(a) for a in
                            sorted(topics[t], key=lambda a: str(a.get("date", "")), reverse=True))
        n = len(topics[t])
        word = "ENTRY" if n == 1 else "ENTRIES"
        blocks.append((
            '  <section class="topic-section" id="%s">\n'
            '    <div class="topic-head">\n'
            '      <h2>%s</h2>\n'
            '      <span class="topic-count">%d %s</span>\n'
            '    </div>\n\n%s\n  </section>'
        ) % (tid, esc(t), n, word, cards))
    return "\n\n".join(blocks)

TEMPLATE_HEAD = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Answers by Topic \u2014 The Human Answer</title>
  <meta name="description" content="Every answer organized by topic: the question, the direct answer up top, the lived story underneath." />
%(robots_meta)s
  <link rel="icon" href="data:," />
  <meta property="og:title" content="Answers by Topic \u2014 The Human Answer" />
  <link rel="canonical" href="https://vastlyresilient.github.io/human-answer/answers.html" />
  <link rel="stylesheet" href="styles.css" />
  <script src="script.js" defer></script>
</head>
<body class="answers-body">
<main class="answers-wrap">
  <header class="answers-header">
    <a class="site-logo" href="index.html">The Human Answer</a>
    <a class="back-home" href="index.html">&larr; Back to the bridge</a>
  </header>

  <h1 class="answers-title">Matt&#8217;s answers, by topic%(chip)s</h1>
  <p class="answers-sub">Every published answer from the Quora archive &mdash; grouped by category, question as asked, direct answer first, story underneath.</p>

  <form class="archive-search" aria-label="Search answers">
    <label class="visually-hidden" for="q">Search answers</label>
    <input id="q" type="text" autocomplete="off" placeholder="Search questions&hellip;" />
  </form>
  <p class="search-note" id="search-note" role="status"></p>

"""

TEMPLATE_TAIL = """

  <footer class="hand-footer">
    <p class="hand-line">Hand-set by a human, imperfectly, on purpose.</p>
    <small style="color:rgba(253,241,225,0.5)">&copy; 2026 Matt &middot; The Human Answer &middot; <a href="https://www.quora.com/profile/WolfSpirit99" target="_blank" rel="noopener" style="color:rgba(253,241,225,0.75)">original archive on Quora &#8599;</a></small>
  </footer>
</main>
<script>
  (function () {
    var input = document.getElementById("q");
    var note = document.getElementById("search-note");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-answer]"));
    var sections = Array.prototype.slice.call(document.querySelectorAll(".topic-section"));
    function render() {
      var needle = input.value.trim().toLowerCase();
      var shown = 0;
      cards.forEach(function (card) {
        var hit = !needle || card.textContent.toLowerCase().indexOf(needle) !== -1;
        card.style.display = hit ? "" : "none";
        if (hit) shown++;
      });
      sections.forEach(function (sec) {
        var any = sec.querySelectorAll('[data-answer]:not([style*="display: none"])').length;
        sec.style.display = any ? "" : "none";
      });
      note.textContent = needle ? shown + " of " + cards.length + " entries match \\u201c" + input.value.trim() + "\\u201d" : "";
    }
    input.addEventListener("input", render);
  })();
</script>
</body>
</html>
"""

def main():
    publish_real = "--publish-real" in sys.argv
    answers = load_answers()
    if not answers:
        print("No answers found in inputs/answers/ - leaving answers.html untouched.")
        sys.exit(1)
    chip = "" if publish_real else '<span class="preview-chip">PREVIEW &middot; NOT YET PUBLISHED</span>'
    robots_meta = "" if publish_real else '<meta name="robots" content="noindex, nofollow" />'
    html = TEMPLATE_HEAD % {"robots_meta": robots_meta, "chip": chip} \
         + build_sections(answers) \
         + TEMPLATE_TAIL
    open(OUT, "w", encoding="utf-8").write(html)
    mode = "REAL (indexed)" if publish_real else "PREVIEW (noindex)"
    print("Wrote answers.html [%s] with %d answers in %d topics."
          % (mode, len(answers), len(set(a["topic"] for a in answers))))
    if not publish_real:
        print("Review the diff, then run with --publish-real to make it public-facing.")

if __name__ == "__main__":
    main()
