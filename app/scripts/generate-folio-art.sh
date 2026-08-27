#!/usr/bin/env bash
# generate-folio-art.sh - Matt's Answers folio plates
#
# Generates the engraved interior plates + leather frame for the tome reader
# via Meta "muse-image" on OpenRouter (image mode).
#
# Usage:
#   export OPENROUTER_API_KEY=sk-or-...
#   bash generate-folio-art.sh
#
# Output: app/public/folio/*.png  (plates + frame used by TomeReader.tsx)

set -euo pipefail
: "${OPENROUTER_API_KEY:?Set OPENROUTER_API_KEY first (https://openrouter.ai/keys)}"

OUT="$(dirname "$0")/../public/folio"
mkdir -p "$OUT"

gen() { # $1 outfile  $2 prompt
  echo "-> $1"
  curl -s https://openrouter.ai/api/v1/chat/completions \
    -H "Authorization: Bearer $OPENROUTER_API_KEY" \
    -H "Content-Type: application/json" \
    -d "$(jq -n --arg p "$2" '{
      model: "meta/muse-image",
      messages: [{role:"user", content:$p}]
    }')" | jq -r '.choices[0].message.images[0].image_url.url' \
    | sed 's|^data:image/[a-z]*;base64,||' | base64 -d > "$OUT/$1"
}

gen leather-frame.png "Ornate ancient leather-bound book cover seen perfectly flat from directly above, filling the entire frame edge to edge, weathered dark brown leather with embossed corner filigree and a central recessed panel, brass corner protectors slightly worn, no text, no letters, no border margins, seamless background texture"
gen plate-generic.png "Antique steel-engraving style illustration on aged cream parchment, sepia ink, fine crosshatching: a quiet domestic still life of a wooden chair by a window with morning light, no text, no letters, no frame, single centered artwork"
echo "done -> $OUT"
