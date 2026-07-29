#!/bin/bash
# Generate the share QR once, at build time.
#
# The app's URL never changes, so encoding a QR at runtime is pointless work —
# and a subtly wrong encoder produces a code that looks fine and doesn't scan,
# which is worse than none. This fetches a known-good PNG and ships it as a
# static asset: precached like everything else, so it still works with no signal.
#
# Verify it actually decodes before shipping (see README).
#   bash tools/make-qr.sh
set -euo pipefail
cd "$(dirname "$0")/.."

URL="https://mgeneser.github.io/hinterland/"
OUT="img/qr.png"

# Level M error correction and a generous quiet zone: this gets scanned off a
# phone screen at arm's length, sometimes in the dark, sometimes smudged.
curl -sfL --get \
  --data-urlencode "data=$URL" \
  --data-urlencode "size=600x600" \
  --data-urlencode "ecc=M" \
  --data-urlencode "qzone=2" \
  --data-urlencode "format=png" \
  "https://api.qrserver.com/v1/create-qr-code/" -o "$OUT"

echo "wrote $OUT ($(wc -c < "$OUT") bytes)"
sips -g pixelWidth -g pixelHeight "$OUT" 2>/dev/null | tail -2
