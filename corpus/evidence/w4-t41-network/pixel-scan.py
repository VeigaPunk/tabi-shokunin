#!/usr/bin/env python3
"""Count marker-colored pixels in a PNG (no deps). Supports non-interlaced 8-bit PNG, color types 0/2/4/6.
usage: pixel-scan.py <png> <r> <g> <b> [tolerance]"""
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
            assert depth == 8 and interlace == 0, f"unsupported depth={depth} interlace={interlace}"
            assert ctype in (0, 2, 4, 6), f"unsupported color type {ctype}"
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
    path, r, g, b = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4])
    tol = int(sys.argv[5]) if len(sys.argv) > 5 else 0
    w, h, ch, pix = read_png(path)
    count = 0
    for i in range(0, len(pix), ch):
        if ch in (0,):
            if abs(pix[i] - r) <= tol and abs(pix[i] - g) <= tol and abs(pix[i] - b) <= tol:
                count += 1
        else:
            pr, pg, pb = pix[i], pix[i + 1], pix[i + 2]
            if abs(pr - r) <= tol and abs(pg - g) <= tol and abs(pb - b) <= tol:
                count += 1
    print(f"{path}: {w}x{h} ch={ch} pixels_matching=({r},{g},{b}) tol={tol} -> {count}")


if __name__ == "__main__":
    main()