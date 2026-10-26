import re
col = lambda s: re.sub(r'\s+', ' ', s).strip()
row = col(open('/home/vgpnk/Projects/shokuknow/merge/tabi/knowledge/corpus/knowledge/host-rate-limit-header-set-r16.md', encoding='utf-8').read())
src = col(open('/home/vgpnk/Projects/shokuknow/merge/tabi/SOURCES.append.md', encoding='utf-8').read())
spans = [
 "the host states plainly that its own budget headers can be inaccurate",
 "the publisher says the same",
 "some routes are limited per guild, so the same route can be throttled for one caller and not another",
 "This row adds a second real host's set, published in the same shape a lane would meet it on the wire",
 "the signal set a real host returns, as opposed to the status code alone",
 "the signal set a real host returns",
 "the same shape a lane would meet it on the wire",
 "\u00a7\"Rate Limits\" (the header table and the per-guild exception)",
 "recheck: 90d (vendor documentation pages change without a version marker) (not run in this round)",
 "A host discloses its budget in `X-RateLimit-Limit`",
 "and some routes are limited per guild so \"you may encounter 429s\"",
]
bad = 0
for s in spans:
    s = col(s); n = len(s.split())
    where = 'row' if s in row else ('sources' if s in src else None)
    ok = where and n <= 25
    bad += 0 if ok else 1
    print(f"{'OK  ' if ok else 'FAIL'} n={n:2} in={where or '-':7} :: {s[:100]}")
print('spans', len(spans), 'failures', bad)
