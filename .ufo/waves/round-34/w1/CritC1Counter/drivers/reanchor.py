#!/usr/bin/env python3
"""Re-anchor probe: does the frozen counter's lead-anchoring rule (+-2, 4-word
window) anchor a WRONG line, and does it silently drop a wrapped quote?

The frozen counter reads leads.tsv at its BASELINE constant, so the probe runs a
byte-identical copy with only two constants changed (LEADS, BASELINE). Both
substitutions are printed. The lead rows carry REAL sibling text at the real pins.
"""
import json, os, re, shutil, subprocess, sys

S = os.path.dirname(os.path.abspath(__file__))
CLONE = os.path.join(S, 'clone')
LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin'
FLEET = '/home/vgpnk/Projects/shokunin'
BASE = '15dfaccb34601c2d221c78501e2befd8998d600c'
COUNTER = os.path.join(LANE, '.ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs')
TMP = os.path.join(S, 'tmp')

def go(repo, args):
    return subprocess.run(['git', '-C', repo, *args], capture_output=True).stdout

def txt(repo, rev, path):
    return go(repo, ['show', f'{rev}:{path}']).decode('utf-8', 'replace').replace('\r', '')

def git(*a):
    r = subprocess.run(['git', '-C', CLONE, '-c', 'user.name=CritC1Counter',
                        '-c', 'user.email=CritC1Counter@scratch.local', *a],
                       capture_output=True, text=True)
    if r.returncode != 0:
        raise SystemExit(f'git {a}: {r.stderr}')
    return r.stdout.strip()

pins = json.load(open(os.path.join(LANE, '.ufo/waves/round-34/baseline/c1-pins.json')))
w = lambda s: s.split()
def runs(line):
    ws = w(line)
    return [' '.join(ws[j:j + 4]) for j in range(len(ws) - 3)]

triple = None
for lane, pin in pins.items():
    repo = f'{FLEET}/{lane}-shokunin'
    files = [p for p in go(repo, ['ls-tree', '-r', '--name-only', pin]).decode().split('\n')
             if p == 'SKILL.md' or (p.startswith('corpus/knowledge/') and p.endswith('.md'))]
    for path in files:
        ls = txt(repo, pin, path).split('\n')
        for n in range(3, len(ls) - 2):  # 1-based: N = n, decoy n+1, true n+2
            true_line, decoy, cited, prev = ls[n + 1], ls[n], ls[n - 1], ls[n - 2]
            if len(w(true_line)) < 6:
                continue
            shared = [r for r in runs(true_line) if r in decoy]
            if not shared:
                continue
            ws = w(true_line)
            # a 6-word window of the true line that carries the shared 4-word run
            cand = None
            for j in range(len(ws) - 5):
                q = ' '.join(ws[j:j + 6])
                if any(r in q for r in shared) and q not in decoy and q not in prev and q not in cited:
                    cand = q
                    break
            if not cand:
                continue
            if any(r in cited for r in runs(cand)) or any(r in prev for r in runs(cand)):
                continue
            triple = (lane, path, pin, n, cand, shared[0], cited, decoy, true_line)
            break
        if triple:
            break
    if triple:
        break
if not triple:
    raise SystemExit('no triple found')
lane, path, pin, n, quote0, shared, cited_line, decoy_line, true_line = triple
first = quote0.split(' ')[0]
quote = quote0.replace(first + ' ', 'Peak: ', 1) if not quote0.startswith('Peak:') else quote0.replace('Peak: ', 'None: ', 1)
print('TRIPLE', json.dumps({'lane': lane, 'path': path, 'pin': pin, 'cited': n, 'decoy': n + 1,
                            'true': n + 2, 'quote0_verbatim': quote0, 'quote_drifted_one_word': quote,
                            'shared_4word': shared}, indent=1))
print(' cited :', cited_line[:160])
print(' decoy :', decoy_line[:160])
print(' true  :', true_line[:160])

# a wrapped quote with no 4-word run on any single line (+-2)
wrap = None
for lane2, pin2 in pins.items():
    repo = f'{FLEET}/{lane2}-shokunin'
    files = [p for p in go(repo, ['ls-tree', '-r', '--name-only', pin2]).decode().split('\n')
             if p.startswith('corpus/knowledge/') and p.endswith('.md')]
    for path2 in files:
        ls = txt(repo, pin2, path2).split('\n')
        for i in range(2, len(ls) - 2):
            a, b = ls[i], ls[i + 1]
            wa, wb = w(a), w(b)
            if len(wa) < 4 or len(wb) < 4:
                continue
            # quote straddling the wrap: last 2 words of a + first 2 of b
            q = ' '.join(wa[-2:] + wb[:2])
            if len(q.replace(' ', '')) < 20:
                continue
            order = [i + 1 + d for d in (0, -1, 1, -2, 2)]  # 1-based, cited = i+1 (line a)
            neigh = [ls[k - 1] for k in order if 1 <= k <= len(ls)]
            if any(r in nn for nn in neigh for r in runs(q)):
                continue
            if not any(q in nn for nn in neigh):
                wrap = (lane2, path2, pin2, i + 1, q)
                break
        if wrap:
            break
    if wrap:
        break
print('WRAP', json.dumps({'lane': wrap[0], 'path': wrap[1], 'cited': wrap[3], 'quote': wrap[4]}))

# build the synthetic leads.tsv (two rows: misanchored + wrapped)
L = '.ufo/waves/round-33/w1/ConnSiblingScan/leads-probe.tsv'
rows = ['lane\tpath:line@commit\tquote\tsweep_caught\treal_overlap\ttopic\tnote',
        f'{lane}\t{path}:{n}@{pin}\t{quote}\tno\tyes\tanchor-probe\tdecoy at cited+1, exact text at cited+2',
        f'{wrap[0]}\t{wrap[1]}:{wrap[3]}@{wrap[2]}\t{wrap[4]}\tno\tyes\twrap-probe\tquote straddles a line wrap']
subprocess.run(['git', '-C', CLONE, 'checkout', '-q', '--force', '--detach', BASE], check=True)
subprocess.run(['git', '-C', CLONE, 'clean', '-q', '-fdx'], check=True)
p = os.path.join(CLONE, L)
os.makedirs(os.path.dirname(p), exist_ok=True)
open(p, 'w').write('\n'.join(rows) + '\n')
rev = None
git('add', '-A')
git('commit', '-q', '--no-verify', '-m', 'probe: synthetic leads file for re-anchor test')
rev = git('rev-parse', 'HEAD')

src = open(COUNTER).read()
patched = src.replace("const BASELINE = '15dfaccb34601c2d221c78501e2befd8998d600c';",
                      f"const BASELINE = '{rev}';")
patched = patched.replace("const LEADS = '.ufo/waves/round-33/w1/ConnSiblingScan/leads.tsv';",
                          f"const LEADS = '{L}';")
assert patched != src and f"'{rev}'" in patched and L in patched
pc = os.path.join(S, 'counter-patched-probe.mjs')
open(pc, 'w').write(patched)
r = subprocess.run(['node', pc, '--list-candidates', '--repo', CLONE, '--fleet', FLEET],
                   capture_output=True, text=True, env={**os.environ, 'TMPDIR': TMP})
open(os.path.join(S, 'probe-list-candidates.tsv'), 'w').write(r.stdout)
keys = [l.split('\t')[0] for l in r.stdout.strip().split('\n') if l]
mis_key = f'{lane}-shokunin@{pin}:{path}:{n + 1}'
true_key = f'{lane}-shokunin@{pin}:{path}:{n + 2}'
wrap_key = f'{wrap[0]}-shokunin@{wrap[2]}:{wrap[1]}:{wrap[3]}'
print('ANCHORED_AT_DECOY (cited+1):', mis_key in keys)
print('ANCHORED_AT_TRUE (cited+2):', true_key in keys)
print('WRAP_LEAD_DROPPED:', wrap_key not in keys)
print('probe rev', rev, 'patched counter', pc)
# also run the real counter-wide evaluate for reanchored/unresolved reporting
r2 = subprocess.run(['node', pc, '--rev', rev, '--repo', CLONE, '--fleet', FLEET, '--json'],
                    capture_output=True, text=True, env={**os.environ, 'TMPDIR': TMP})
j = json.loads(r2.stdout)
print('leadsReanchored', j['leadsReanchored'])
print('leadsUnresolved', j['leadsUnresolved'])
print('candidates', j['candidates'])
json.dump({'triple': {'lane': lane, 'path': path, 'pin': pin, 'cited': n, 'quote': quote,
                      'shared': shared}, 'wrap': wrap[4], 'wrap_key': wrap_key,
           'mis_key': mis_key, 'true_key': true_key,
           'anchored_at_decoy': mis_key in keys, 'anchored_at_true': true_key in keys,
           'wrap_dropped': wrap_key not in keys,
           'leadsReanchored': j['leadsReanchored'], 'leadsUnresolved': j['leadsUnresolved']},
          open(os.path.join(S, 'reanchor-probe.json'), 'w'), indent=1)
subprocess.run(['git', '-C', CLONE, 'checkout', '-q', '--force', '--detach', BASE], check=True)
subprocess.run(['git', '-C', CLONE, 'clean', '-q', '-fdx'], check=True)
print('DONE')
