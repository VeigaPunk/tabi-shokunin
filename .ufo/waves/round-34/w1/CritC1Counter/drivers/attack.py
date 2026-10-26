#!/usr/bin/env python3
"""C1 attack: cheapest junk commits scored with the frozen counter."""
import json, os, re, subprocess, sys

S = os.path.dirname(os.path.abspath(__file__))
CLONE = os.path.join(S, 'clone')
LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin'
FLEET = '/home/vgpnk/Projects/shokunin'
BASE = '15dfaccb34601c2d221c78501e2befd8998d600c'
COUNTER = os.path.join(LANE, '.ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs')
BASE_DIR = os.path.join(LANE, '.ufo/waves/round-34/baseline')

def git(*a, allow=False):
    r = subprocess.run(['git', '-C', CLONE, '-c', 'user.name=CritC1Counter',
                        '-c', 'user.email=CritC1Counter@scratch.local',
                        '-c', 'commit.gpgsign=false', *a],
                       capture_output=True, text=True)
    if r.returncode != 0 and not allow:
        raise SystemExit(f'git {a}: {r.stderr}')
    return r.stdout.strip()

def put(rel, text):
    p = os.path.join(CLONE, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, 'w', encoding='utf-8').write(text)

def get(rel):
    return open(os.path.join(CLONE, rel), encoding='utf-8').read()

def commit(msg):
    git('add', '-A')
    git('commit', '-q', '--no-verify', '-m', msg)
    return git('rev-parse', 'HEAD')

def reset():
    git('checkout', '-q', '--force', '--detach', BASE)
    git('clean', '-q', '-fdx')

def score(name, rev):
    r = subprocess.run(['node', COUNTER, '--rev', rev, '--repo', CLONE,
                        '--fleet', FLEET, '--json'], capture_output=True, text=True,
                       env={**os.environ, 'TMPDIR': os.path.join(S, 'tmp')})
    out = os.path.join(S, name + '.json')
    open(out, 'w').write(r.stdout)
    open(os.path.join(S, name + '.stderr'), 'w').write(r.stderr)
    j = json.loads(r.stdout) if r.stdout.strip().startswith('{') else {}
    summ = {k: j.get(k) for k in ('predicate', 'candidates', 'mapped', 'screened',
                                  'unaccounted', 'newMapped', 'screenFindings')}
    summ['exit'] = r.returncode
    summ['adjacency'] = (j.get('adjacency') or {}).get('verdict')
    summ['adjFindings'] = (j.get('adjacency') or {}).get('findings')
    print(name, json.dumps(summ, ensure_ascii=False)[:1200])
    open(os.path.join(S, name + '.summary.json'), 'w').write(json.dumps(summ, indent=1) + '\n')
    return j

def window(text, must=None, lo=4, hi=20):
    """verbatim whole-word substring of text (single-space joined), 4..hi words, >=20 non-space."""
    w = text.split()
    for n in range(hi, lo - 1, -1):
        for i in range(0, len(w) - n + 1):
            q = ' '.join(w[i:i + n])
            if q.replace(' ', '') and len(q.replace(' ', '')) >= 20 and q in text:
                if must is None or re.search(r'\b' + must + r'\b', q):
                    return q
    raise SystemExit('no window for %r must=%r' % (text, must))

# ---- frozen candidate data -------------------------------------------------
j1 = json.load(open(os.path.join(BASE_DIR, 'c1-J1-do-nothing.json')))
unaccounted = list(j1['unaccountedKeys'])
cands = {}
for line in open(os.path.join(BASE_DIR, 'c1-candidates.tsv'), encoding='utf-8'):
    k, s, t = line.rstrip('\n').split('\t')
    cands[k] = (s, t)

def keyparts(k):
    m = re.match(r'^(.+)-shokunin@([0-9a-f]{40}):(.+):([0-9]+)$', k)
    return m.group(1), m.group(2), m.group(3), int(m.group(4))

# three set-A candidates from three different siblings
picks = [k for k in unaccounted if cands[k][0] == 'A' and keyparts(k)[0] in ('kake', 'kotoba', 'mori')]
sel = []
seen = set()
for k in picks:
    lane = keyparts(k)[0]
    if lane in seen:
        continue
    seen.add(lane)
    sel.append(k)
    if len(sel) == 3:
        break
print('SELECTED', sel)
rest = [k for k in unaccounted if k not in sel]
print('REST to screen', len(rest))

SCREEN_HDR = 'sibling_ref\treason\tsurface\tquote\tnote\n'

def screen_rows(keys, reason='not-browser-sense'):
    out = []
    for k in keys:
        out.append('%s\t%s\t-\t%s\tattack' % (k, reason, window(cands[k][1])))
    return SCREEN_HDR + '\n'.join(out) + '\n'

MAP = 'corpus/adjacency.tsv'
mapbase = get(MAP)

# ---- K1: junk declaration at SKILL.md EOF, refused-route rows, junk screens --
reset()
skill = get('SKILL.md')
DECL = 'Round-34 scratch note (junk): kama, kake, kotoba and mori keep their own browser ground.'
skill2 = skill.rstrip('\n') + '\n' + DECL + '\n'
put('SKILL.md', skill2)
dline = skill2.split('\n').index(DECL) + 1
TQ = 'kama, kake, kotoba and mori keep their own browser ground'
assert dline and DECL.startswith('Round-34')
rows = []
for i, k in enumerate(sel):
    lane, pin, path, ln = keyparts(k)
    rows.append('\t'.join(['r34-junk-%d' % i, lane, k, window(cands[k][1], lo=5),
                           'SKILL.md:%d' % dline, TQ, 'refused-route', '-', TQ]))
put(MAP, mapbase + '\n'.join(rows) + '\n')
# 63 junk screens + one padded junk screen row on an already-mapped candidate (kama row 11 line)
put('corpus/adjacency-screen-skill.tsv', screen_rows(rest))
k1 = commit('attack K1: EOF junk declaration + refused-route rows + junk screens')
score('K1-eof-junk-decl', k1)

# ---- K1b: same but the padded screen row is added to K1 ----------------------
reset()
skill = get('SKILL.md')
skill2 = skill.rstrip('\n') + '\n' + DECL + '\n'
put('SKILL.md', skill2)
put(MAP, mapbase + '\n'.join(rows) + '\n')
padded = screen_rows(rest)
mappedkey = [k for k in cands if k not in unaccounted][0]
padded += '%s\tbogus-reason\t-\t%s\tpadded junk\n' % (mappedkey, window(cands[mappedkey][1]))
put('corpus/adjacency-screen-skill.tsv', padded)
k1b = commit('attack K1b: K1 plus a junk screen row for an already-mapped candidate')
score('K1b-padded-screen', k1b)
print('MAPPEDKEY', mappedkey)

# ---- K2: declaration in a brand-new file, SKILL.md untouched ----------------
reset()
JUNKF = 'corpus/r34-junk-decl.md'
put(JUNKF, DECL + '\n')
rows2 = []
for i, k in enumerate(sel):
    lane, pin, path, ln = keyparts(k)
    rows2.append('\t'.join(['r34-junkf-%d' % i, lane, k, window(cands[k][1], lo=5),
                            '%s:1' % JUNKF, TQ, 'refused-route', '-', TQ]))
put(MAP, mapbase + '\n'.join(rows2) + '\n')
put('corpus/adjacency-screen-skill.tsv', screen_rows(rest))
k2 = commit('attack K2: declaration in a new junk file, SKILL.md untouched')
score('K2-new-junk-file', k2)
assert 'Round 34' not in get('SKILL.md')

# ---- K3: near-duplicate declaration (one char changed from a baseline line) --
reset()
skill_lines = get('SKILL.md').split('\n')
base_set = set(x.strip() for x in skill_lines)
nd = []
lanes_seen = []
for k in [x for x in unaccounted if cands[x][0] == 'A']:
    ln_m = keyparts(k)[0]
    if ln_m not in lanes_seen:
        lanes_seen.append(ln_m)
for lane in lanes_seen:
    for i, l in enumerate(skill_lines):
        if l.strip() and re.search(r'\b%s\b' % lane, l) and len(l.split()) >= 5:
            cand_line = l[:-1] + ('.' if l[-1] != '.' else ',')  # one trailing char changed
            if cand_line.strip() not in base_set:
                nd.append((lane, i + 1, l, cand_line))
                break
    if len(nd) >= 3:
        break
print('NEARDUP sources', [(x[0], x[1]) for x in nd])
put('SKILL.md', '\n'.join(skill_lines[:-1] + [x[3] for x in nd] + ['']))
nl = get('SKILL.md').split('\n')
rows3 = []
have = {x[0] for x in nd}
sel3 = [k for k in sel if keyparts(k)[0] in have]
for i, k in enumerate(sel3):
    lane, pin, path, ln = keyparts(k)
    ln_no = nl.index([x for x in nd if x[0] == lane][0][3]) + 1
    tq = window(nl[ln_no - 1], must=lane, lo=4, hi=15)
    rows3.append('\t'.join(['r34-neardup-%d' % i, lane, k, window(cands[k][1], lo=5),
                            'SKILL.md:%d' % ln_no, tq, 'refused-route', '-', tq]))
put(MAP, mapbase + '\n'.join(rows3) + '\n')
put('corpus/adjacency-screen-skill.tsv', screen_rows([k for k in unaccounted if k not in sel3]))
k3 = commit('attack K3: near-duplicate tabi declaration lines (one char changed)')
j3 = score('K3-near-duplicate-decl', k3)

# ---- K4: same-surface screen pointing at an unrelated boundary --------------
reset()
other = [k for k in rest if keyparts(k)[0] == 'kake' and 'field-performance-cwv' in k][0]
sk = get('SKILL.md').rstrip('\n') + '\n' + DECL + '\n'
put('SKILL.md', sk)
dl4 = sk.split('\n').index(DECL) + 1
rows4 = []
for i, k in enumerate(sel):
    lane, pin, path, ln = keyparts(k)
    rows4.append('\t'.join(['r34-junk-%d' % i, lane, k, window(cands[k][1], lo=5),
                             'SKILL.md:%d' % dl4, TQ, 'refused-route', '-', TQ]))
put(MAP, mapbase + '\n'.join(rows4) + '\n')
srow = '%s\tsame-surface\t%s\t%s\tmismatched boundary\n' % (
    other, 'crawler-discipline-vs-publishing', window(cands[other][1]))
put('corpus/adjacency-screen-skill.tsv', screen_rows([k for k in rest if k != other]) + srow)
k4 = commit('attack K4: same-surface screen citing an unrelated kake boundary')
j4 = score('K4-same-surface-mismatch', k4)

# ---- K5: contested-open with no fleet L0 line -------------------------------
reset()
fleet_head = subprocess.run(['git', '-C', FLEET, 'rev-parse', 'HEAD'], capture_output=True, text=True).stdout.strip()
put('SKILL.md', get('SKILL.md').rstrip('\n') + '\n' + DECL + '\n')
dl = len(get('SKILL.md').split('\n')) - 1
k = sel[0]
lane, pin, path, ln = keyparts(k)
rows5 = ['\t'.join(['r34-contested', lane, k, window(cands[k][1], lo=5),
                    'SKILL.md:%d' % dl, TQ, 'contested-open',
                    'fleet@%s:.ufo/l0-questions.md:99999' % fleet_head, TQ])]
put(MAP, mapbase + '\n'.join(rows5) + '\n')
put('corpus/adjacency-screen-skill.tsv', screen_rows(rest))
k5 = commit('attack K5: contested-open with no fleet L0 line')
score('K5-contested-no-l0', k5)

reset()
print('DONE')
