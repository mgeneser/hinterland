#!/usr/bin/env python3
"""Generate the app icons — a retro cut-stripe sunset over a ridge.

No image libraries on this machine, so this writes PNGs by hand via zlib.
Run from the repo root:  python3 tools/make-icons.py
"""

import math
import os
import struct
import zlib

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "icons")

BG = (0x1B, 0x17, 0x14)
SUN = (0xE8, 0x73, 0x4A)
SUN_HI = (0xF2, 0xA0, 0x5E)
RIDGE = (0x2E, 0x26, 0x21)
RIDGE_FAR = (0x3D, 0x33, 0x2C)


def shade(px, py, n):
    """Colour for one pixel, in a 0..1 normalised space."""
    x = px / n
    y = py / n

    # Ridges along the bottom, drawn far-to-near.
    far = 0.70 + 0.045 * math.sin(x * math.pi * 2.1 + 0.6)
    near = 0.80 + 0.055 * math.sin(x * math.pi * 1.4 + 3.1)
    if y >= near:
        return RIDGE
    if y >= far:
        return RIDGE_FAR

    # Sun disc, with horizontal cut stripes across its lower half.
    dx = x - 0.5
    dy = y - 0.46
    if dx * dx + dy * dy <= 0.30 * 0.30:
        if y > 0.46:
            band = int((y - 0.46) / 0.052)
            if band % 2 == 1:
                return BG
        return SUN_HI if y < 0.34 else SUN

    return BG


def render(n):
    """Return raw RGB scanlines with PNG filter bytes, supersampled 2x."""
    rows = bytearray()
    ss = 2
    for py in range(n):
        rows.append(0)  # filter type: none
        for px in range(n):
            r = g = b = 0
            for oy in range(ss):
                for ox in range(ss):
                    c = shade(px + (ox + 0.5) / ss, py + (oy + 0.5) / ss, n)
                    r += c[0]
                    g += c[1]
                    b += c[2]
            k = ss * ss
            rows += bytes((r // k, g // k, b // k))
    return bytes(rows)


def chunk(tag, data):
    return (struct.pack(">I", len(data)) + tag + data
            + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF))


def write_png(path, n):
    header = struct.pack(">IIBBBBB", n, n, 8, 2, 0, 0, 0)  # 8-bit truecolour
    png = (b"\x89PNG\r\n\x1a\n"
           + chunk(b"IHDR", header)
           + chunk(b"IDAT", zlib.compress(render(n), 9))
           + chunk(b"IEND", b""))
    with open(path, "wb") as fh:
        fh.write(png)
    print("wrote %s (%d×%d, %d bytes)" % (path, n, n, len(png)))


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for size in (180, 192, 512):
        write_png(os.path.join(OUT, "icon-%d.png" % size), size)
