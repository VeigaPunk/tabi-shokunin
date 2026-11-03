#!/usr/bin/env python3
"""r57 quarantine hand-check: quote location ladder (folds f0..f6, frozen in the
round-57 seat spec).

Usage:
  laddr.py --file BIN --fold fN --fragment 'TEXT' [--text TXT]
      print every hit for one fold as "hit <n> line=<L> byte=<B>"

  laddr.py --spec rows.json --out OUTDIR [--text-map map.json]
      run the whole ladder for every row/fragment and emit one JSON per row.

Fold definitions (exactly the frozen list):
  f0 exact substring in raw bytes
  f1 case-insensitive
  f2 whitespace runs collapsed to single spaces
  f3 HTML entities decoded
  f4 HTML tags stripped to text then f2
  f5 f4 + case-insensitive
  f6 backtick/quote/punctuation-stripped then f2

No network access. Reads only the files it is given.
"""
import argparse
import hashlib
import html
import json
import os
import re
import string
import sys

FOLDS = ["f0", "f1", "f2", "f3", "f4", "f5", "f6"]

_WS = re.compile(r"\s+")
_TAGS = re.compile(r"<[^>]*>")
# f6: characters removed as "backtick/quote/punctuation"
_PUNCT = set(string.punctuation) | set("`´‘’“”„‟«»‹›，。、；：？！（）【】《》…—–·")


def _collapse(s: str) -> str:
    return _WS.sub(" ", s)


def _strip_punct(s: str) -> str:
    return "".join(ch for ch in s if ch not in _PUNCT)


def variants(raw: bytes, text: str | None):
    """Return {fold: (haystack, kind)} where kind is 'bytes' or 'str'.

    For a source whose text comes from an extraction step (a PDF text layer)
    the f0 haystack is that text's UTF-8 bytes, not the container bytes: the
    quote lives in the text layer, never in the compressed container.
    """
    srctext = text if text is not None else raw.decode("utf-8", errors="replace")
    ent = html.unescape(srctext)
    notags = _TAGS.sub("", srctext)
    v = {
        "f0": (srctext.encode("utf-8") if text is not None else raw, "bytes"),
        "f1": (srctext.lower(), "str"),
        "f2": (_collapse(srctext), "str"),
        "f3": (ent, "str"),
        "f4": (_collapse(notags), "str"),
        "f5": (_collapse(notags).lower(), "str"),
        "f6": (_collapse(_strip_punct(srctext)), "str"),
    }
    return v


def needle(fold: str, frag: str):
    if fold == "f0":
        return frag.encode("utf-8")
    if fold in ("f1", "f5"):
        return frag.lower()
    if fold == "f2":
        return _collapse(frag)
    if fold == "f3":
        return html.unescape(frag)
    if fold == "f4":
        return _collapse(frag)
    if fold == "f6":
        return _collapse(_strip_punct(frag))
    raise SystemExit(f"unknown fold {fold}")


def hits(raw: bytes, text, fold: str, frag: str):
    """Return list of (line, byte_offset) for every occurrence."""
    hay, kind = variants(raw, text)[fold]
    ndl = needle(fold, frag)
    if not ndl:
        return []
    out = []
    if kind == "bytes":
        start = 0
        while True:
            i = hay.find(ndl, start)
            if i < 0:
                break
            out.append((hay.count(b"\n", 0, i) + 1, i))
            start = i + max(1, len(ndl))
    else:
        start = 0
        while True:
            i = hay.find(ndl, start)
            if i < 0:
                break
            # line and offset are against the folded haystack; for folds that do
            # not preserve offsets (f2/f4/f5/f6) the offset is the folded-text
            # character position, recorded as such in the receipts
            line = hay.count("\n", 0, i) + 1
            out.append((line, i))
            start = i + max(1, len(ndl))
    return out


def raw_hits(raw: bytes, frag: str):
    """Every occurrence across the frozen ladder, ordered by fold."""
    res = {}
    for f in FOLDS:
        h = hits(raw, None, f, frag)
        res[f] = h
    return res


def main(argv):
    ap = argparse.ArgumentParser()
    ap.add_argument("--file")
    ap.add_argument("--fold")
    ap.add_argument("--fragment")
    ap.add_argument("--text")
    ap.add_argument("--spec")
    ap.add_argument("--out")
    ap.add_argument("--text-map")
    a = ap.parse_args(argv)

    if a.file and a.fold and a.fragment is not None:
        raw = open(a.file, "rb").read()
        text = open(a.text, encoding="utf-8").read() if a.text else None
        hs = hits(raw, text, a.fold, a.fragment)
        for n, (line, off) in enumerate(hs):
            print(f"hit {n} line={line} byte={off}")
        return 0

    if a.spec and a.out:
        rows = json.load(open(a.spec, encoding="utf-8"))
        tmap = json.load(open(a.text_map, encoding="utf-8")) if a.text_map else {}
        os.makedirs(a.out, exist_ok=True)
        for row in rows:
            sid = row["id"]
            path = row["bin"]
            text = None
            if sid in tmap:
                text = open(tmap[sid], encoding="utf-8").read()
            raw = open(path, "rb").read()
            frags = []
            for frag in row["fragments"]:
                found = None
                table = {}
                for f in FOLDS:
                    h = hits(raw, text, f, frag)
                    table[f] = len(h)
                    if found is None and h:
                        found = {"fold": f, "hits": len(h),
                                 "where": [{"line": L, "byte": B} for L, B in h[:5]]}
                frags.append({
                    "quote": frag,
                    "fold": found["fold"] if found else None,
                    "located": bool(found),
                    "where": found["where"] if found else None,
                    "hitsPerFold": table,
                    "bytes": len(raw),
                })
            row["fragments"] = frags
            row["sha256"] = hashlib.sha256(raw).hexdigest()
            with open(os.path.join(a.out, sid + ".json"), "w", encoding="utf-8") as fh:
                json.dump(row, fh, ensure_ascii=False, indent=1)
        return 0
    ap.print_help()
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
