import json, re, hashlib, pathlib

root = pathlib.Path('/fast/scratch/hyaku/tabi-r29/CritAdmission/tipclone')
receipt = json.loads((root / 'corpus/evidence/round-29/release-pins/receipt.json').read_text())
STABLE = receipt['stable']
sources = (root / 'corpus/SOURCES.md').read_text().split('\n')
ROW_RE = re.compile(r'^ {0,3}\|\s*(S\d{3,})\s*\|')
rows = {}
for line in sources:
    m = ROW_RE.match(line)
    if not m:
        continue
    cells = [c.strip() for c in line.split('|')]
    if len(cells) != 13:
        print('BADCELLS', m.group(1), len(cells))
        continue
    rows[cells[1]] = dict(source=cells[2], anchor=cells[6], teaches=cells[7], recheck=cells[10])

def norm(s):
    return re.sub(r'\s+', ' ', s.strip())

def block_in(old, new):
    n = len(old)
    if n == 0:
        return True
    for i in range(len(new) - n + 1):
        if new[i:i + n] == old:
            return True
    return False

def anchor_has_range(anchor, a, b):
    tok = str(a) if a == b else f'{a}-{b}'
    pat = re.escape(tok) if a == b else re.escape(tok).replace(r'\-', r'\s*-\s*')
    return re.search(r'(?<![0-9])' + pat + r'(?![0-9])', anchor) is not None

def digests(text):
    full = re.findall(r'(?<![0-9a-f])([0-9a-f]{64})(?![0-9a-f])', text)
    abbr = re.findall(r'(?<![0-9a-f])([0-9a-f]{8})(?:\u2026|\.\.\.)([0-9a-f]{4})(?![0-9a-f])', text)
    return [('full', f) for f in full] + [('abbr', p, s) for p, s in abbr]

BR = root / 'corpus/evidence/round-29/release-pins/bytes'
out = []
for e in receipt['rows']:
    rid = e['id']
    r = rows[rid]
    verd = []
    f4fail = []
    sha_ok = True
    for f in e['files']:
        ob = (BR / f['old_tag'] / f['path']).read_bytes()
        nb = (BR / STABLE / f['path']).read_bytes()
        if hashlib.sha256(ob).hexdigest() != f['old_sha256'] or hashlib.sha256(nb).hexdigest() != f['new_sha256']:
            sha_ok = False
        if f['old_status'] == 404:
            verd.append('holds' if (f['new_status'] == 404 and b'NOT_FOUND' in nb) else 'drifted')
            continue
        if f['new_status'] == 404:
            verd.append('drifted')
            continue
        olines = ob.decode().split('\n')
        nlines = [norm(x) for x in nb.decode().split('\n')]
        hold = True
        for a, b in f['ranges']:
            if not anchor_has_range(r['anchor'], a, b):
                f4fail.append((f['path'], a, b))
            if not block_in([norm(x) for x in olines[a - 1:b]], nlines):
                hold = False
        verd.append('holds' if hold else 'drifted')
    ds = digests(r['source'] + ' ' + r['anchor'])
    f5 = 'no-digest' if not ds else any(
        (d[0] == 'full' and d[1] == f['old_sha256']) or
        (d[0] == 'abbr' and f['old_sha256'].startswith(d[1]) and f['old_sha256'].endswith(d[2]))
        for d in ds for f in e['files'])
    verdict = 'holds' if all(v == 'holds' for v in verd) else 'drifted'
    out.append((rid, verdict, e.get('superseded_by'), f4fail, f5, sha_ok, len(e['files']), verd))

print(f"{'row':5} {'byteverdict':11} {'superseded':11} {'f4fail':6} {'f5':9} {'sha':4} files")
for o in out:
    print(f"{o[0]:5} {o[1]:11} {str(o[2]):11} {len(o[3]):<6} {str(o[4]):9} {str(o[5]):4} {o[6]}")
print('holds=', sum(1 for o in out if o[1] == 'holds'), 'drifted=', sum(1 for o in out if o[1] == 'drifted'))
print('verdict vs supersede mismatch:', [(o[0], o[1], o[2]) for o in out if (o[1] == 'holds') != (o[2] is None)])
print('f4 fails:', [o[0] for o in out if o[3]])
print('f5 fails:', [o[0] for o in out if o[4] is False])
print('sha fails:', [o[0] for o in out if not o[5]])
