#!/usr/bin/env python3
"""K6: refused-route rows on set-B leads whose sibling line never names tabi
(the sibling side names nothing; only the tabi side names the sibling)."""
import json, os, re, subprocess

S = os.path.dirname(os.path.abspath(__file__))
CLONE = os.path.join(S, 'clone')
LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin'
FLEET = '/home/vgpnk/Projects/shokunin'
BASE = '15dfaccb34601c2d221c78501e2befd8998d600c'
COUNTER = os.path.join(LANE, '.ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs')
BD = os.path.join(LANE, '.ufo/waves/round-34/baseline')
TMP = os.path.join(S, 'tmp')

def git(*a):
    r = subprocess.run(['git', '-C', CLONE, '-c', 'user.name=CritC1Counter',
                        '-c', 'user.email=CritC1Counter@scratch.local', *a],
                       capture_output=True, text=True)
    if r.returncode != 0:
        raise SystemExit(f'git {a}: {r.stderr}')
    return r.stdout.strip()

def put(rel, text):
    p = os.path.join(CLONE, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, 'w', encoding='utf-8').write(text)

def get(rel):
    return open(os.path.join(CLONE, rel), encoding='utf-8').read()

def window(text, must=None, lo=4, hi=20):
    w = text.split()
    for n in range(hi, lo - 1, -1):
        for i in range(0, len(w) - n + 1):
            q = ' '.join(w[i:i + n])
            if len(q.replace(' ', '')) >= 20 and q in text and (must is None or re.search(r'\b' + must + r'\b', q)):
                return q
    raise SystemExit('no window %r %r' % (text[:80], must))

j1 = json.load(open(os.path.join(BD, 'c1-J1-do-nothing.json')))
un = list(j1['unaccountedKeys'])
setof, cands = {}, {}
for line in open(os.path.join(BD, 'c1-candidates.tsv'), encoding='utf-8'):
    k, s, t = line.rstrip('\n').split('\t')
    setof[k], cands[k] = s, t

def kp(k):
    m = re.match(r'^(.+)-shokunin@([0-9a-f]{40}):(.+):([0-9]+)$', k)
    return m.group(1), m.group(2), m.group(3), int(m.group(4))

git('checkout', '-q', '--force', '--detach', BASE)
git('clean', '-q', '-fdx')
DECL = 'Round-34 scratch note (junk): kaidoku, kagi, kake, kotoba, mori and kama keep their own ground.'
sel, used = [], set()
for k in [x for x in un if setof[x] == 'B' and not re.search(r'\btabi\b', cands[x], re.I)]:
    lane = kp(k)[0]
    if lane in used:
        continue
    used.add(lane)
    sel.append(k)
    if len(sel) == 3:
        break
print('K6 picks', sel)
sk = get('SKILL.md').rstrip('\n') + '\n' + DECL + '\n'
put('SKILL.md', sk)
dl = sk.split('\n').index(DECL) + 1
rows = []
for i, k in enumerate(sel):
    lane, pin, path, ln = kp(k)
    tq = window(DECL, must=lane, lo=4, hi=20)
    rows.append('\t'.join(['r34-noname-%d' % i, lane, k, window(cands[k], lo=5),
                           'SKILL.md:%d' % dl, tq, 'refused-route', '-', tq]))
    print('  row', lane, 'sibling_quote names tabi?', bool(re.search(r'\btabi\b', window(cands[k], lo=5), re.I)),
          '| tabi_quote', tq)
put('corpus/adjacency.tsv', get('corpus/adjacency.tsv').rstrip('\n') + '\n' + '\n'.join(rows) + '\n')
rest = [k for k in un if k not in sel]
put('corpus/adjacency-screen-skill.tsv',
    'sibling_ref\treason\tsurface\tquote\tnote\n' +
    '\n'.join('%s\tnot-browser-sense\t-\t%s\tattack' % (k, window(cands[k])) for k in rest) + '\n')
git('add', '-A')
git('commit', '-q', '--no-verify', '-m', 'attack K6: refused-route rows on leads whose sibling line never names tabi')
rev = git('rev-parse', 'HEAD')
r = subprocess.run(['node', COUNTER, '--rev', rev, '--repo', CLONE, '--fleet', FLEET, '--json'],
                   capture_output=True, text=True, env={**os.environ, 'TMPDIR': TMP})
open(os.path.join(S, 'K6-setB-refused-route.json'), 'w').write(r.stdout)
open(os.path.join(S, 'K6-setB-refused-route.stderr'), 'w').write(r.stderr)
j = json.loads(r.stdout)
print('K6', json.dumps({k: j.get(k) for k in ('predicate', 'mapped', 'screened', 'unaccounted',
                                              'newMapped', 'newMappedRows')}, ensure_ascii=False))
print('exit', r.returncode, 'rev', rev, 'adjacency', j['adjacency']['verdict'])
git('checkout', '-q', '--force', '--detach', BASE)
git('clean', '-q', '-fdx')
