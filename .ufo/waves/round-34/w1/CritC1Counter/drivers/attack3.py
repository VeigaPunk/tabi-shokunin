#!/usr/bin/env python3
"""K7: a 'new' declaration that is a verbatim old line moved from PROVINCE.md into
SKILL.md (the counter's isNew is per file, not per text)."""
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

j1 = json.load(open(os.path.join(BD, 'c1-J1-do-nothing.json')))
un = list(j1['unaccountedKeys'])
cands, setof = {}, {}
for line in open(os.path.join(BD, 'c1-candidates.tsv'), encoding='utf-8'):
    k, s, t = line.rstrip('\n').split('\t')
    cands[k], setof[k] = t, s

def kp(k):
    m = re.match(r'^(.+)-shokunin@([0-9a-f]{40}):(.+):([0-9]+)$', k)
    return m.group(1), m.group(2), m.group(3), int(m.group(4))

def window(text, must=None, lo=4, hi=20):
    w = text.split()
    for n in range(hi, lo - 1, -1):
        for i in range(0, len(w) - n + 1):
            q = ' '.join(w[i:i + n])
            if len(q.replace(' ', '')) >= 20 and q in text and (must is None or re.search(r'\b' + must + r'\b', q)):
                return q
    raise SystemExit('no window')

git('checkout', '-q', '--force', '--detach', BASE)
git('clean', '-q', '-fdx')
import glob
prov = []
for fp in sorted(glob.glob(os.path.join(CLONE, '**', '*.md'), recursive=True)):
    rel = os.path.relpath(fp, CLONE)
    if rel.startswith('.') or rel.startswith('corpus/adjacency'):
        continue
    prov.extend(get(rel).split('\n'))
skill = get('SKILL.md').split('\n')
skill_set = {x.strip() for x in skill}
picks, moved = [], []
used = set()
for k in [x for x in un if setof[x] == 'A']:
    lane = kp(k)[0]
    if lane in used:
        continue
    for l in prov:
        if not (l.strip() and re.search(r'\b%s\b' % lane, l) and len(l.split()) >= 5 and l.strip() not in skill_set):
            continue
        try:
            window(l, must=lane, lo=4, hi=25)
        except SystemExit:
            continue
        picks.append(k)
        moved.append(l)
        used.add(lane)
        break
    if len(picks) == 3:
        break
print('MOVED lines for', [kp(k)[0] for k in picks])
put('SKILL.md', '\n'.join(skill[:-1] + moved + ['']))
nl = get('SKILL.md').split('\n')
rows = []
for i, k in enumerate(picks):
    lane, pin, path, ln = kp(k)
    ln_no = nl.index(moved[i]) + 1
    tq = window(nl[ln_no - 1], must=lane, lo=4, hi=25)
    rows.append('\t'.join(['r34-moved-%d' % i, lane, k, window(cands[k], lo=5),
                           'SKILL.md:%d' % ln_no, tq, 'refused-route', '-', tq]))
put('corpus/adjacency.tsv', get('corpus/adjacency.tsv').rstrip('\n') + '\n' + '\n'.join(rows) + '\n')
rest = [k for k in un if k not in picks]
put('corpus/adjacency-screen-skill.tsv',
    'sibling_ref\treason\tsurface\tquote\tnote\n' +
    '\n'.join('%s\tnot-browser-sense\t-\t%s\tattack' % (k, window(cands[k])) for k in rest) + '\n')
git('add', '-A')
git('commit', '-q', '--no-verify', '-m', 'attack K7: declarations are old PROVINCE.md lines moved into SKILL.md')
rev = git('rev-parse', 'HEAD')
r = subprocess.run(['node', COUNTER, '--rev', rev, '--repo', CLONE, '--fleet', FLEET, '--json'],
                   capture_output=True, text=True, env={**os.environ, 'TMPDIR': TMP})
open(os.path.join(S, 'K7-moved-declaration.json'), 'w').write(r.stdout)
j = json.loads(r.stdout)
print('K7', json.dumps({k: j.get(k) for k in ('predicate', 'unaccounted', 'mapped', 'screened',
                                              'newMapped', 'newMappedRows')}, ensure_ascii=False))
print('exit', r.returncode, 'rev', rev)
git('checkout', '-q', '--force', '--detach', BASE)
git('clean', '-q', '-fdx')
