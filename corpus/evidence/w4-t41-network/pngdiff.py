#!/usr/bin/env python3
"""Diff two same-size non-interlaced 8-bit PNGs (no deps): count differing pixels, bbox, sample colors.
usage: pngdiff.py <a.png> <b.png>"""
import struct
import sys
import zlib


def read_png(path):
    data = open(path, "rb").read()
    assert data[:8] == b"\x89PNG\r\n\x1a\n", "not a PNG"
    pos = 8
    idat = b""
    width = height = depth = ctype = None
    while pos < len(data):
        length, ctag = struct.unpack(">I4s", data[pos:pos + 8])
        chunk = data[pos + 8:pos + 8 + length]
        if ctag == b"IHDR":
            width, height, depth, ctype, comp, filt, interlace = struct.unpack(">IIBBBBB", chunk)
            assert depth == 8 and interlace == 0
            assert ctype in (0, 2, 4, 6)
        elif ctag == b"IDAT":
            idat += chunk
        elif ctag == b"IEND":
            break
        pos += 12 + length
    raw = zlib.decompress(idat)
    ch = {0: 1, 2: 3, 4: 2, 6: 4}[ctype]
    stride = width * ch
    out = bytearray()
    prev = bytearray(stride)
    p = 0
    for _ in range(height):
        f = raw[p]; p += 1
        line = bytearray(raw[p:p + stride]); p += stride
        if f == 1:
            for i in range(ch, stride):
                line[i] = (line[i] + line[i - ch]) & 0xFF
        elif f == 2:
            for i in range(stride):
                line[i] = (line[i] + prev[i]) & 0xFF
        elif f == 3:
            for i in range(stride):
                a = line[i - ch] if i >= ch else 0
                line[i] = (line[i] + ((a + prev[i]) >> 1)) & 0xFF
        elif f == 4:
            for i in range(stride):
                a = line[i - ch] if i >= ch else 0
                b = prev[i]
                c = prev[i - ch] if i >= ch else 0
                pa, pb, pc = abs(b - c), abs(a - c), abs(a + b - 2 * c)
                pr = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                line[i] = (line[i] + pr) & 0xFF
        out += line
        prev = line
    return width, height, ch, bytes(out)


def main():
    a, b = sys.argv[1], sys.argv[2]
    w1, h1, ch1, pa = read_png(a)
    w2, h2, ch2, pb = read_png(b)
    assert w1 == w2 and h1 == h2 and ch1 == ch2, f"size/format mismatch: {w1}x{h1}x{ch1} vs {w2}x{h2}x{ch2}"
    diff = 0
    x0 = y0 = 10 ** 9
    x1 = y1 = -1
    samples = []
    for y in range(h1):
        for x in range(w1):
            i = (y * w1 + x) * ch1
            if pa[i:i + 3] != pb[i:i + 3]:
                diff += 1
                x0 = min(x0, x); y0 = min(y0, y); x1 = max(x1, x); y1 = max(y1, y)
                if len(samples) < 8:
                    samples.append((x, y, tuple(pa[i:i + 3]), tuple(pb[i:i + 3])))
    print(f"{a} vs {b}: {w1}x{h1} ch={ch1}")
    print(f"differing_pixels={diff} bbox=({x0},{y0})-({x1},{y1})")
    for s in samples:
        print(f"  sample x={s[0]} y={s[1]} a={s[2]} b={s[3]}")


if __name__ == "__main__":
    main()