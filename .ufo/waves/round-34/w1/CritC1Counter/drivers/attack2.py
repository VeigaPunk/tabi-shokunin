#!/usr/bin/env python3
"""C1 attack driver 2: near-duplicate declarations, set-B refused-route rows,
screen-vs-frozen-evidence contradiction, gate detail for contested-open,
and the lead re-anchoring primitive probe."""
import json, os, re, subprocess, sys

S = os.path.dirname(os.path.abspath(__file__))
CLONE = os.path.join(S, 'clone')
LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin'
FLEET = '/home/vgpnk/Projects/shokunin'
BASE = '15dfaccb34601c2d221c78501e2befd8998d600c'
COUNTER = os.path.join(LANE, '.ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs')
BASE_DIR = os.path.join(LANE, '.ufo/waves/round-34/baseline')
LEADS = os.path.join(LANE, '.ufo/waves/round-33/w1/ConnSiblingScan/leads.tsv')
TMP = os.path.join(S, 'tmp')
os.makedirs(TMP, exist_ok=True)

def sh(cmd, **kw):
    r = subprocess.run(cmd, capture_output=True, text=True, **kw)
    if r.returncode != 0:
        raise SystemExit(f'{cmd}: {r.stderr[:800]}')
    return r.stdout

def git(*a, allow=False):
    cmd = ['git', '-C', CLONE, '-c', 'user.name=CritC1Counter',
           '-c', 'user.email=CritC1Counter@scratch.local',
           '-c', 'commit.gpgsign=false', *a]
    r = subprocess.run(cmd, capture_output=True, text=True)
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
                       env={**os.environ, 'TMPDIR': TMP})
    open(os.path.join(S, name + '.json'), 'w').write(r.stdout)
    open(os.path.join(S, name + '.stderr'), 'w').write(r.stderr)
    j = json.loads(r.stdout) if r.stdout.strip().startswith('{') else {}
    summ = {k: j.get(k) for k in ('predicate', 'candidates', 'mapped', 'screened',
                                  'unaccounted', 'newMapped', 'screenFindings')}
    summ['exit'] = r.returncode
    summ['adjacency'] = (j.get('adjacency') or {}).get('verdict')
    summ['adjRows'] = (j.get('adjacency') or {}).get('rows')
    summ['adjFindings'] = (j.get('adjacency') or {}).get('findings')
    summ['newMappedRows'] = j.get('newMappedRows')
    print(name, json.dumps(summ, ensure_ascii=False)[:1500])
    open(os.path.join(S, name + '.summary.json'), 'w').write(json.dumps(summ, indent=1) + '\n')
    return j

def window(text, must=None, lo=4, hi=20):
    w = text.split()
    for n in range(hi, lo - 1, -1):
        for i in range(0, len(w) - n + 1):
            q = ' '.join(w[i:i + n])
            if len(q.replace(' ', '')) >= 20 and q in text:
                if must is None or re.search(r'\b' + must + r'\b', q):
                    return q
    raise SystemExit('no window for %r must=%r' % (text, must))

j1 = json.load(open(os.path.join(BASE_DIR, 'c1-J1-do-nothing.json')))
unaccounted = list(j1['unaccountedKeys'])
cands, order = {}, []
for line in open(os.path.join(BASE_DIR, 'c1-candidates.tsv'), encoding='utf-8'):
    k, s, t = line.rstrip('\n').split('\t')
    cands[k] = (s, t)
    order.append(k)

def keyparts(k):
    m = re.match(r'^(.+)-shokunin@([0-9a-f]{40}):(.+):([0-9]+)$', k)
    return m.group(1), m.group(2), m.group(3), int(m.group(4))

SCREEN_HDR = 'sibling_ref\treason\tsurface\tquote\tnote\n'
MAP = 'corpus/adjacency.tsv'
mapbase = get(MAP)
DECL = 'Round-34 scratch note (junk): kama, kake, kotoba and mori keep their own browser ground.'
TQ = 'kama, kake, kotoba and mori keep their own browser ground'
revs = {}

def screens(keys):
    return SCREEN_HDR + '\n'.join('%s\tnot-browser-sense\t-\t%s\tattack' % (k, window(cands[k][1]))
                                  for k in keys) + '\n'

# ---- K3b: near-duplicate declaration lines, three lanes ----------------------
reset()
skill_lines = get('SKILL.md').split('\n')
base_set = {x.strip() for x in skill_lines}
nd, sel3 = [], []
lane_used = set()
for k in [x for x in unaccounted if cands[x][0] == 'A']:
    lane = keyparts(k)[0]
    if lane in lane_used:
        continue
    for i, l in enumerate(skill_lines):
        if l.strip() and re.search(r'\b%s\b' % lane, l) and len(l.split()) >= 5:
            near = l[:-1] + ('.' if l[-1] != '.' else ',')
            if near.strip() not in base_set:
                nd.append((lane, l, near))
                sel3.append(k)
                lane_used.add(lane)
                break
    if len(nd) == 3:
        break
print('NEARDUP', [(x[0], x[1][:60]) for x in nd], 'rows', len(nd))
put('SKILL.md', '\n'.join(skill_lines[:-1] + [x[2] for x in nd] + ['']))
nl = get('SKILL.md').split('\n')
rows3 = []
for i, k in enumerate(sel3):
    lane, pin, path, ln = keyparts(k)
    near = [x for x in nd if x[0] == lane][0][2]
    ln_no = nl.index(near) + 1
    tq = window(nl[ln_no - 1], must=lane, lo=4, hi=15)
    rows3.append('\t'.join(['r34-neardup-%d' % i, lane, k, window(cands[k][1], lo=5),
                            'SKILL.md:%d' % ln_no, tq, 'refused-route', '-', tq]))
put(MAP, mapbase + '\n'.join(rows3) + '\n')
put('corpus/adjacency-screen-skill.tsv', screens([k for k in unaccounted if k not in sel3]))
revs['K3b'] = commit('attack K3b: near-duplicate declarations (one char changed), three lanes')
score('K3b-neardup-predicate', revs['K3b'])

# ---- K1 rebuild (headline) ---------------------------------------------------
reset()
sk = get('SKILL.md').rstrip('\n') + '\n' + DECL + '\n'
put('SKILL.md', sk)
dl = sk.split('\n').index(DECL) + 1
sel = []
seen = set()
for k in [x for x in unaccounted if cands[x][0] == 'A']:
    lane = keyparts(k)[0]
    if lane in seen:
        continue
    seen.add(lane)
    if lane in ('kake', 'kotoba', 'mori'):
        sel.append(k)
rows = []
for i, k in enumerate(sel):
    lane, pin, path, ln = keyparts(k)
    rows.append('\t'.join(['r34-junk-%d' % i, lane, k, window(cands[k][1], lo=5),
                           'SKILL.md:%d' % dl, TQ, 'refused-route', '-', TQ]))
put(MAP, mapbase + '\n'.join(rows) + '\n')
rest = [k for k in unaccounted if k not in sel]
put('corpus/adjacency-screen-skill.tsv', screens(rest))
revs['K1'] = commit('attack K1: EOF junk declaration + refused-route rows + junk screens')
score('K1-eof-junk-decl', revs['K1'])
# contradiction stats on the accepted ledger
lead_real = {}
for line in open(LEADS, encoding='utf-8'):
    f = line.rstrip('\n').split('\t')
    if f[0] == 'lane' or len(f) < 5:
        continue
    lead_real[f'{f[0]}-shokunin@{f[1].split("@")[1]}'] = f[4]
setA_screened = [k for k in rest if cands[k][0] == 'A']
setB_screened = [k for k in rest if cands[k][0] == 'B']
realover = [k for k in setB_screened if k.split(':')[-1] and any(v == 'yes' for kk, v in lead_real.items())]
stats = {'screened_total': len(rest), 'screened_setA_naming_tabi': len(setA_screened),
         'screened_setB': len(setB_screened)}
# lead real_overlap column is per-row; join on the exact lead key
leads_rows = []
for line in open(LEADS, encoding='utf-8'):
    f = line.rstrip('\n').split('\t')
    if f[0] == 'lane' or len(f) < 7:
        continue
    leads_rows.append({'lane': f[0], 'ref': f[1], 'real_overlap': f[4], 'quote': f[2]})
by_key = {}
for r in leads_rows:
    by_key[f"{r['lane']}-shokunin@{r['ref'].split('@')[1]}"] = r['real_overlap']
stats['screened_setB_real_overlap_yes'] = sum(1 for k in setB_screened if by_key.get(k) == 'yes')
print('SCREEN-STATS', json.dumps(stats))

# ---- K6: set-B candidates that never name tabi + refused-route ---------------
reset()
noname = [k for k in unaccounted if cands[k][0] == 'B' and not re.search(r'\btabi\b', cands[k][1], re.I)]
sel6, seen6 = [], set()
for k in noname:
    lane = keyparts(k)[0]
    if lane in seen6:
        continue
    seen6.add(lane)
    sel6.append(k)
    if len(sel6) == 3:
        break
print('K6 picks', sel6)
sk6 = get('SKILL.md').rstrip('\n') + '\n' + DECL + '\n'
put('SKILL.md', sk6)
dl6 = sk6.split('\n').index(DECL) + 1
rows6 = []
for i, k in enumerate(sel6):
    lane, pin, path, ln = keyparts(k)
    rows6.append('\t'.join(['r34-noname-%d' % i, lane, k, window(cands[k][1], lo=5),
                            'SKILL.md:%d' % dl6, TQ, 'refused-route', '-', TQ]))
put(MAP, mapbase + '\n'.join(rows6) + '\n')
rest6 = [k for k in unaccounted if k not in sel6]
put('corpus/adjacency-screen-skill.tsv', screens(rest6))
revs['K6'] = commit('attack K6: set-B lines that never name tabi, refused-route')
score('K6-setB-refused-route', revs['K6'])

# ---- K5 gate detail: contested-open without a fleet L0 line -----------------
reset()
fleet_head = sh(['git', '-C', FLEET, 'rev-parse', 'HEAD']).strip()
sk5 = get('SKILL.md').rstrip('\n') + '\n' + DECL + '\n'
put('SKILL.md', sk5)
dl5 = sk5.split('\n').index(DECL) + 1
k0 = sel[0]
lane, pin, path, ln = keyparts(k0)
row5 = '\t'.join(['r34-contested', lane, k0, window(cands[k0][1], lo=5),
                  'SKILL.md:%d' % dl5, TQ, 'contested-open',
                  'fleet@%s:.ufo/l0-questions.md:99999' % fleet_head, TQ])
put(MAP, mapbase + row5 + '\n')
put('corpus/adjacency-screen-skill.tsv', screens([k for k in unaccounted if k != k0]))
revs['K5'] = commit('attack K5: contested-open with no fleet L0 line')
score('K5-contested-no-l0', revs['K5'])
gate_out = subprocess.run([LANE + '/scripts/check-adjacency.mjs', '--at', revs['K5'],
                           '--repo', CLONE, '--fleet', FLEET],
                          capture_output=True, text=True).stdout
open(os.path.join(S, 'K5-gate.txt'), 'w').write(gate_out)
print('K5 GATE:', gate_out.strip().split('\n')[0],
      [l for l in gate_out.split('\n') if 'finding' in l])

json.dump(revs, open(os.path.join(S, 'revs.json'), 'w'), indent=1)
reset()
print('DONE', revs)
