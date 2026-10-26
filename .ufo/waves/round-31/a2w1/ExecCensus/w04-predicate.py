#!/usr/bin/env python3
"""Independent reimplementation of sources-census.sh W04 (and E04 candidate groups).
url_of() mirrors scripts/sources-census.sh:600-607: find https?://[^space|]+,
strip #fragment, strip ONE trailing slash, drop scheme, lowercase host only.
W04 is printed for a row when its URL was seen earlier and its (url,scope) pair was not."""
import re, collections, sys
reg, out = sys.argv[1], sys.argv[2]
def url_of(s):
    m = re.search(r'https?://[^\s|]+', s)
    if not m: return ""
    u = m.group(0)
    u = re.sub(r'#\S*$', '', u)
    if u.endswith('/'): u = u[:-1]
    u = re.sub(r'^[A-Za-z]+://', '', u)
    i = u.find('/')
    return (u[:i].lower() + u[i:]) if i >= 0 else u.lower()
seen_url, seen_pair, predicted = set(), set(), set()
rows = 0
for ln in open(reg, encoding='utf-8'):
    if not re.match(r'^\|\s*S\d{3,}\s*\|', ln): continue
    c = [x.strip() for x in ln.split('|')]
    rid, u, sc = c[1], url_of(c[2]), c[5]
    rows += 1
    if u:
        if u in seen_url and (u, sc) not in seen_pair: predicted.add(rid)
        seen_url.add(u); seen_pair.add((u, sc))
reported = set()
for ln in open(out, encoding='utf-8'):
    m = re.match(r'^\S+\tW04\t(S\d+)', ln)
    if m: reported.add(m.group(1))
print(f"rows parsed: {rows}")
print(f"predicted W04: {len(predicted)}  observed W04: {len(reported)}  equal: {predicted == reported}")
print(f"predicted-not-observed: {sorted(predicted - reported)}")
print(f"observed-not-predicted: {sorted(reported - predicted)}")
print("observed ids:", " ".join(sorted(reported)))
