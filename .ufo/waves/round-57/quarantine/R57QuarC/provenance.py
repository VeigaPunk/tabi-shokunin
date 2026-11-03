#!/usr/bin/env python3
"""R57QuarC: provenance search for fragments that the cited source does not carry.

Scans one or more read-only roots (campaign artifacts, lane knowledge) for the
fragments under the same frozen fold ladder f0..f6 and reports file/line/byte.

Usage: provenance.py --fragments frags.json --root DIR [--root DIR ...] --out OUT.json
"""
import argparse
import json
import os
import sys

import importlib.util
spec = importlib.util.spec_from_file_location(
    "qc", os.path.join(os.path.dirname(os.path.abspath(__file__)), "quarantine-check.py"))
qc = importlib.util.module_from_spec(spec)
spec.loader.exec_module(qc)

SKIP_DIRS = {".git", "node_modules", "__pycache__", ".ruff_cache", ".venv"}
MAXBYTES = 25 * 1000 * 1000


def walk(root):
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for fn in filenames:
            p = os.path.join(dirpath, fn)
            try:
                if os.path.getsize(p) > MAXBYTES:
                    continue
            except OSError:
                continue
            yield p


def main(argv):
    ap = argparse.ArgumentParser()
    ap.add_argument("--fragments", required=True)
    ap.add_argument("--root", action="append", required=True)
    ap.add_argument("--out", required=True)
    a = ap.parse_args(argv)
    frags = json.load(open(a.fragments, encoding="utf-8"))  # {key: text}
    hits = {k: [] for k in frags}
    scanned = skipped = 0
    for root in a.root:
        for p in walk(root):
            try:
                raw = open(p, "rb").read()
            except OSError:
                skipped += 1
                continue
            try:
                text = raw.decode("utf-8")
            except UnicodeDecodeError:
                try:
                    text = raw.decode("gb18030")
                except UnicodeDecodeError:
                    skipped += 1
                    continue
            if "\x00" in text:
                skipped += 1
                continue
            scanned += 1
            var = qc.variants(text)
            for key, frag in frags.items():
                table, first = qc.locate(raw, text, frag, var)
                if first is None:
                    continue
                h = table[first]
                hits[key].append({
                    "file": p, "fold": first, "hits": table[first + "_n"],
                    "where": h[:3],
                })
    out = {"roots": a.root, "filesScanned": scanned, "filesSkipped": skipped,
           "fragments": len(frags), "hits": hits}
    json.dump(out, open(a.out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    for k, v in hits.items():
        print(f"{k}: {len(v)} file(s)")
        for h in v[:6]:
            print(f"   {h['file']} fold={h['fold']} line={h['where'][0]['line']} "
                  f"byte={h['where'][0]['byte']}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
