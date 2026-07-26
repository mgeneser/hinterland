#!/usr/bin/env python3
"""Build the app icons from one of the festival's illustrations.

    python3 tools/make-icons.py butterfly     # default
    python3 tools/make-icons.py map

Why this exists rather than a one-line ImageMagick call: there is no PIL and no
ImageMagick on this machine, and `sips` cannot flatten transparency onto a chosen
colour — it can only pad. App icons must be fully opaque, because iOS composites
any transparency to black, so the artwork genuinely has to be blended onto a solid
background. Hence a small PNG reader and writer.

Outputs, all opaque:
    icons/icon-180.png            apple-touch-icon — the one iOS home screen uses
    icons/icon-192.png            favicon and manifest
    icons/icon-512.png            manifest, purpose "any"
    icons/icon-maskable-512.png   manifest, purpose "maskable" — extra padding so
                                  Android's circular crop can't clip the artwork
"""

import os
import struct
import sys
import zlib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "icons")

# Their dark-gray token. Cream line art reads strongly on it, and it matches the
# app's own background so the icon and the splash screen agree.
BG = (0x27, 0x24, 0x1B)

SOURCES = {
    # name: (path, fraction of the frame the art should occupy, crop box or None)
    "butterfly": (os.path.join(ROOT, "tools", "butterfly-source.png"), 0.92, None),
    # The map illustration has "MAP" lettered into the bottom of the artwork; an
    # icon shouldn't carry a word, so crop it to the arch above the text.
    "map": (os.path.join(ROOT, "img", "ill-map-source.png"), 0.86, (0.0, 0.0, 1.0, 0.76)),
}


# ── PNG reading ─────────────────────────────────────────────────────────

def read_png(path):
    """Return (width, height, rgba bytearray). 8-bit, non-interlaced only."""
    data = open(path, "rb").read()
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        raise SystemExit("%s is not a PNG" % path)

    idat = bytearray()
    pos, w, h, depth, colour = 8, None, None, None, None
    while pos < len(data):
        (length,) = struct.unpack(">I", data[pos:pos + 4])
        tag = data[pos + 4:pos + 8]
        body = data[pos + 8:pos + 8 + length]
        if tag == b"IHDR":
            w, h, depth, colour, _, _, interlace = struct.unpack(">IIBBBBB", body)
            if depth != 8 or interlace or colour not in (2, 6):
                raise SystemExit("unsupported PNG: depth=%d colour=%d interlace=%d"
                                 % (depth, colour, interlace))
        elif tag == b"IDAT":
            idat += body
        elif tag == b"IEND":
            break
        pos += 12 + length

    channels = 4 if colour == 6 else 3
    raw = zlib.decompress(bytes(idat))
    stride = w * channels

    out = bytearray(w * h * 4)
    prev = bytearray(stride)
    p = 0
    for y in range(h):
        ftype = raw[p]; p += 1
        line = bytearray(raw[p:p + stride]); p += stride
        # Undo the per-scanline filter. bpp is the byte offset to the pixel left.
        bpp = channels
        if ftype == 1:
            for i in range(bpp, stride):
                line[i] = (line[i] + line[i - bpp]) & 0xFF
        elif ftype == 2:
            for i in range(stride):
                line[i] = (line[i] + prev[i]) & 0xFF
        elif ftype == 3:
            for i in range(stride):
                left = line[i - bpp] if i >= bpp else 0
                line[i] = (line[i] + ((left + prev[i]) >> 1)) & 0xFF
        elif ftype == 4:
            for i in range(stride):
                a = line[i - bpp] if i >= bpp else 0
                b = prev[i]
                c = prev[i - bpp] if i >= bpp else 0
                pa, pb, pc = abs(b - c), abs(a - c), abs(a + b - 2 * c)
                pred = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                line[i] = (line[i] + pred) & 0xFF
        elif ftype != 0:
            raise SystemExit("bad filter type %d" % ftype)

        base = y * w * 4
        if channels == 4:
            out[base:base + stride] = line
        else:
            for x in range(w):
                out[base + x * 4:base + x * 4 + 3] = line[x * 3:x * 3 + 3]
                out[base + x * 4 + 3] = 255
        prev = line
    return w, h, out


# ── Scaling and compositing ─────────────────────────────────────────────

def crop(w, h, px, box):
    """box is (l, t, r, b) as fractions of width/height."""
    l, t, r, b = box
    x0, y0 = int(w * l), int(h * t)
    x1, y1 = int(w * r), int(h * b)
    nw, nh = x1 - x0, y1 - y0
    out = bytearray(nw * nh * 4)
    for y in range(nh):
        src = ((y0 + y) * w + x0) * 4
        out[y * nw * 4:(y + 1) * nw * 4] = px[src:src + nw * 4]
    return nw, nh, out


def resize(w, h, px, nw, nh):
    """Box-average downscale — good enough for flat illustration, and avoids the
    jaggies a nearest-neighbour sample would leave on the line work."""
    out = bytearray(nw * nh * 4)
    for y in range(nh):
        sy0, sy1 = y * h // nh, max(y * h // nh + 1, (y + 1) * h // nh)
        for x in range(nw):
            sx0, sx1 = x * w // nw, max(x * w // nw + 1, (x + 1) * w // nw)
            r = g = b = a = n = 0
            for sy in range(sy0, sy1):
                row = sy * w * 4
                for sx in range(sx0, sx1):
                    i = row + sx * 4
                    al = px[i + 3]
                    # Weight colour by alpha so transparent pixels don't drag
                    # the edges toward black.
                    r += px[i] * al; g += px[i + 1] * al; b += px[i + 2] * al
                    a += al; n += 1
            o = (y * nw + x) * 4
            if a:
                out[o] = min(255, r // a); out[o + 1] = min(255, g // a)
                out[o + 2] = min(255, b // a); out[o + 3] = a // n
            else:
                out[o + 3] = 0
    return out


def compose(size, art_w, art_h, art, fill):
    """Centre the art on an opaque `size` square filled with BG."""
    canvas = bytearray()
    for _ in range(size * size):
        canvas += bytes((BG[0], BG[1], BG[2], 255))

    # Scale so the longer side occupies `fill` of the square.
    scale = size * fill / max(art_w, art_h)
    nw, nh = max(1, int(art_w * scale)), max(1, int(art_h * scale))
    small = resize(art_w, art_h, art, nw, nh)

    ox, oy = (size - nw) // 2, (size - nh) // 2
    for y in range(nh):
        for x in range(nw):
            i = (y * nw + x) * 4
            al = small[i + 3]
            if not al:
                continue
            o = ((oy + y) * size + (ox + x)) * 4
            for c in range(3):
                canvas[o + c] = (small[i + c] * al + canvas[o + c] * (255 - al)) // 255
    return canvas


# ── PNG writing ─────────────────────────────────────────────────────────

def chunk(tag, data):
    return (struct.pack(">I", len(data)) + tag + data
            + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF))


def write_png(path, size, rgba):
    rows = bytearray()
    for y in range(size):
        rows.append(0)                      # filter: none
        for x in range(size):
            i = (y * size + x) * 4
            rows += rgba[i:i + 3]           # opaque, so drop alpha entirely
    png = (b"\x89PNG\r\n\x1a\n"
           + chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0))
           + chunk(b"IDAT", zlib.compress(bytes(rows), 9))
           + chunk(b"IEND", b""))
    open(path, "wb").write(png)
    print("  %-30s %d×%d  %d KB" % (path.replace(ROOT + "/", ""), size, size,
                                          len(png) // 1024))


if __name__ == "__main__":
    which = sys.argv[1] if len(sys.argv) > 1 else "butterfly"
    if which not in SOURCES:
        raise SystemExit("choose one of: %s" % ", ".join(SOURCES))
    src, fill, box = SOURCES[which]
    if not os.path.exists(src):
        raise SystemExit("missing source: %s" % src)

    os.makedirs(OUT, exist_ok=True)
    w, h, px = read_png(src)
    if box:
        w, h, px = crop(w, h, px, box)
    print("source: %s (%d×%d), art fills %d%%" % (which, w, h, fill * 100))

    for size in (180, 192, 512):
        write_png(os.path.join(OUT, "icon-%d.png" % size), size,
                  compose(size, w, h, px, fill))
    # Maskable needs the art inside the safe circle, so shrink it further.
    write_png(os.path.join(OUT, "icon-maskable-512.png"), 512,
              compose(512, w, h, px, fill * 0.68))
