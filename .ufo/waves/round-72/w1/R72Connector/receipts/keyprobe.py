#!/usr/bin/env python3
"""Path-key duplicate probe for tabi SOURCES chromium rows.

Two keys per row: the lane's own normalizeUrl key (query kept) and a
path-only key (scheme/host/ref/query stripped). Shows which rows are
duplicates under each key, so a blind spot in the lane census is measured,
not asserted.
"""
import re, sys, pathlib

src = pathlib.Path(sys.argv[1]).read_text(encoding='utf-8', errors='replace')
rows = []
for line in src.splitlines():
    if not line.startswith('| S'):
        continue
    cells = [c.strip() for c in line.strip().strip('|').split('|')]
    if len(cells) < 3:
        continue
    rid, source = cells[0], cells[1]
    m = re.search(r'(https?://[^ |]+)', source)
    if not m:
        continue
    url = m.group(1).rstrip(')')
    rows.append((rid, url))

def lane_key(url):
    v = re.sub(r'#[^ ]*$', '', url).rstrip('/')
    v = re.sub(r'^[A-Za-z]+://', '', v)
    v = re.sub(r'^www\.', '', v, flags=re.I)
    i = v.find('/')
    return v if i < 0 else v[:i].lower() + v[i:]

def path_key(url):
    v = re.sub(r'^https?://', '', url)
    v = re.sub(r'^[^/]+/', '', v)            # host out
    v = re.sub(r'^\+/', '', v)               # googlesource '+/' form
    v = re.sub(r'^refs/tags/[^/]+/', '', v)
    v = re.sub(r'^main/', '', v)
    v = re.sub(r'[?#].*$', '', v)
    return v

for name, fn in (('lane-key(query kept)', lane_key), ('path-key(query stripped)', path_key)):
    seen, dup = {}, []
    for rid, url in rows:
        k = fn(url)
        if k in seen:
            dup.append((rid, seen[k], k))
        else:
            seen[k] = rid
    print(f'## {name}: pairs={len(dup)}')
    for rid, prev, k in dup:
        print(f'  {rid} duplicates {prev}: {k}')
    hit = [r for r, u in rows if 'touchpad_pinch_event_queue' in u]
    print(f'  S179-family rows under this key: {hit or "none"}')
