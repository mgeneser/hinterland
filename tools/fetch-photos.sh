#!/bin/bash
# Download each artist's press photo from hinterlandiowa.com and shrink it to a
# 320px thumbnail so the whole set is ~1 MB and can be precached for offline use.
#
# Uses macOS `sips` — no image libraries needed. Run from the repo root:
#   bash tools/fetch-photos.sh
#
# Re-run this if the festival swaps a photo. Output: img/<slug>.jpg

set -uo pipefail
cd "$(dirname "$0")/.."
mkdir -p img
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

slugs=$(curl -sL "https://www.hinterlandiowa.com/lineup" \
  | grep -oE 'href="/artist/[^"]*"' | sed 's|href="/artist/||; s|"||' | sort -u)

ok=0; fail=0
for slug in $slugs; do
  if [ -s "img/$slug.jpg" ]; then
    ok=$((ok + 1)); continue
  fi

  url=$(curl -sL --max-time 20 "https://www.hinterlandiowa.com/artist/$slug" \
    | grep -oE '<meta content="[^"]+" property="og:image"' \
    | head -1 | sed -E 's/<meta content="//; s/" property="og:image"//')

  if [ -z "$url" ]; then
    echo "  no photo: $slug"; fail=$((fail + 1)); continue
  fi

  if ! curl -sL --max-time 30 "$url" -o "$tmp/$slug.src"; then
    echo "  download failed: $slug"; fail=$((fail + 1)); continue
  fi

  # Square crop to 320px, JPEG — small enough to precache, big enough for retina cards.
  if sips -s format jpeg -s formatOptions 72 -Z 320 "$tmp/$slug.src" \
       --out "img/$slug.jpg" >/dev/null 2>&1; then
    ok=$((ok + 1))
    printf '  %-30s %s KB\n' "$slug" "$(( $(wc -c < "img/$slug.jpg") / 1024 ))"
  else
    echo "  convert failed: $slug"; fail=$((fail + 1))
  fi
done

echo
echo "$ok photos in img/ ($fail failed) — $(du -sh img | cut -f1) total"
