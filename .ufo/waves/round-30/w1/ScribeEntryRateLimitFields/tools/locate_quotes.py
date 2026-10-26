import re, json, os
HERE = os.path.dirname(os.path.abspath(__file__))
raw = open(os.path.join(HERE, '..', 'bytes', 'ratelimit-headers-11.txt'), encoding='utf-8').read()
lines = raw.split('\n')
def normalise(t): return re.sub(r'\s+', ' ', t).strip()
def locate(q):
    toks = q.split()
    pat = r'\s+'.join(re.escape(t) for t in toks)
    hits = []
    for m in re.finditer(pat, raw):
        # line numbers: raw has no hyphenation inside these spans? verify join with single spaces equals q
        span = raw[m.start():m.end()]
        if normalise(span) != normalise(q):
            continue
        start = raw.count('\n', 0, m.start()) + 1
        end = raw.count('\n', 0, m.end()) + 1
        hits.append([start, end])
    return hits
quotes = [l.strip() for l in open(os.path.join(HERE, 'quotes.txt'), encoding='utf-8') if l.strip()]
res = []
for q in quotes:
    res.append({"quote": q, "words": len(q.split()), "hits": locate(q)})
print(json.dumps(res, indent=1, ensure_ascii=False))
