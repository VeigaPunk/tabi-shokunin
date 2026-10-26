import re, json, os
HERE = os.path.dirname(os.path.abspath(__file__))
raw = open(os.path.join(HERE, '..', 'bytes', 'ratelimit-headers-11.txt'), encoding='utf-8').read()
entry = open(os.path.join(HERE, '..', 'rate-limit-policy-fields.md'), encoding='utf-8').read()
def collapse(s): return re.sub(r'\s+', ' ', s).strip()
lines = entry.split('\n')
body = '\n'.join(lines[15:])
stripped = re.sub(r'```[\s\S]*?```', ' ', body)
stripped = re.sub(r'`[^`]*`', ' ', stripped)
flat = collapse(stripped)
quotes = []
for m in re.finditer(r'"([^"]{1,600}?)"|“([^”]{1,600}?)”', flat):
    q = collapse(m.group(1) if m.group(1) is not None else m.group(2))
    if len(q.split()) >= 4: quotes.append(q)
# headings in raw
heads = []
for i, l in enumerate(raw.split('\n'), 1):
    if re.match(r'^(\d+(\.\d+)*\.|Appendix [A-Z]\.)\s{1,3}\S', l) or l.strip() in ('FAQ', 'Status of This Memo', 'Abstract', 'Copyright Notice'):
        heads.append((i, l.strip()))
def section(ln):
    cur = 'preamble'
    for hl, title in heads:
        if hl <= ln: cur = title
        else: break
    return cur
def locate(q):
    pat = r'\s+'.join(re.escape(t) for t in q.split())
    hits = []
    for m in re.finditer(pat, raw):
        span = raw[m.start():m.end()]
        if collapse(span) != collapse(q): continue
        hits.append((raw.count('\n',0,m.start())+1, raw.count('\n',0,m.end())+1))
    return hits
rows = []
for q in quotes:
    hits = locate(q)
    rows.append({"quote": q, "words": len(q.split()), "hits": hits, "section": section(hits[0][0]) if hits else "NOT FOUND"})
open('quote-table.json','w').write(json.dumps(rows, indent=1, ensure_ascii=False))
md = ["# Quote table — `rate-limit-policy-fields.md` against `draft-ietf-httpapi-ratelimit-headers-11`",
      "",
      "Fetched bytes: `bytes/ratelimit-headers-11.txt`, 67097 bytes, sha256 `d6016dd0db5a33ba3f1e6b6f4c84e9b5ecc00986822d5212bab831f6c2d1d412`.",
      "Line numbers are 1-based in the raw fetched text; located span given as start-end line.",
      "Every span is contiguous in the whitespace-collapsed text and is the only occurrence of that span in the file unless the occurrences column says otherwise.",
      "",
      "| # | Section | Draft lines | Words | Quote | Occurrences |",
      "|---|---|---|---|---|---|",
      ]
for i, r in enumerate(rows, 1):
    q = r["quote"].replace('|', '\\|')
    spans = ", ".join(f"{a}-{b}" if a != b else str(a) for a, b in r["hits"])
    md.append(f"| {i} | {r['section'].replace('|','\\|')} | {spans} | {r['words']} | {q} | {len(r['hits'])} |")
open('/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-30/w1/ScribeEntryRateLimitFields/quotes.md','w').write("\n".join(md) + "\n")
print("\n".join(md))
