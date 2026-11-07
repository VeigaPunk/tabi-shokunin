#!/usr/bin/env python3
"""R73Connector duplicate-URL scan (read-only).

Reads the primary URL of every SOURCES.md row (first http(s) URL in the row,
trailing punctuation stripped) for tabi and for all 20 sibling lanes, then
reports:

  1. intra-registry duplicate URLs in tabi (the sources-census W04 class);
  2. cross-lane URLs shared between tabi and any sibling;
  3. whether the four r73 rows S180-S183 duplicate any URL anywhere, and
     whether any sibling registry carries a third_party/blink URL at all.

Usage: dup-url-scan.py [<fleet root>]
Exit 0 always (this is a measurement, not a gate).
"""
import glob
import os
import re
import sys

root = sys.argv[1] if len(sys.argv) > 1 else "/home/vgpnk/Projects/shokunin"
row_re = re.compile(r"\|\s*(S\d+)\s*\|")
url_re = re.compile(r"https?://[^\s|)>\]]+")


def rows(path):
    out = {}
    with open(path, encoding="utf-8", errors="replace") as fh:
        for num, line in enumerate(fh, 1):
            if not line.startswith("| S"):
                continue
            m = row_re.match(line)
            if not m:
                continue
            u = url_re.search(line)
            if u:
                out.setdefault(u.group(0).rstrip(".,;"), []).append((m.group(1), num))
    return out


tabi_path = os.path.join(root, "tabi-shokunin/corpus/SOURCES.md")
tabi = rows(tabi_path)
sibs = sorted(
    p for p in glob.glob(os.path.join(root, "*-shokunin/corpus/SOURCES.md"))
    if "tabi-shokunin" not in p
)

total_rows = sum(len(v) for v in tabi.values())
print(f"tabi registry: {total_rows} rows with a URL, {len(tabi)} unique URLs")

dups = {u: v for u, v in tabi.items() if len(v) > 1}
print(f"intra-tabi duplicate-URL groups (W04 class): {len(dups)}")
for u, v in sorted(dups.items(), key=lambda kv: kv[1][0][1]):
    print(f"  DUP {v} {u}")

print(f"\nsiblings scanned: {len(sibs)}")
shared = []
blink = []
for p in sibs:
    S = rows(p)
    lane = p.split("/")[-3]
    for u, v in tabi.items():
        if u in S:
            shared.append((lane, v, u, S[u]))
            if "third_party/blink" in u:
                blink.append((lane, v, u, S[u]))
print(f"URLs shared between tabi and siblings: {len(shared)}")
for lane, v, u, sv in sorted(shared):
    print(f"  SHARED {lane} tabi={v} sibling={sv} {u}")
print(f"URLs containing third_party/blink shared with any sibling: {len(blink)}")

print("\nrows S180-S183:")
for rid in ("S180", "S181", "S182", "S183"):
    owners = [(u, v) for u, v in tabi.items() if any(r == rid for r, _ in v)]
    for u, v in owners:
        cross = [lane for lane, tv, tu, sv in shared if tu == u]
        print(f"  {rid} tabi_rows={v} cross_lane_dups={cross or 'none'} url={u}")
