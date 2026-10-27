#!/usr/bin/env python3
"""MutSpanCases: mutation-test frozen C1 counter c1-sample-span-v3.mjs with isolated receipt copies.

Baseline positive construction mirrors the frozen selftest convention in
scripts/selftest-measure-c1-round40.mjs (schema r40, runNonce everywhere, samples
respaced start+i*150, surfaces usable). Each mutant then changes exactly one point.
Never touches committed inputs; all artifacts live under the explicit scratch root.
"""
import copy, hashlib, json, os, subprocess, sys

ROOT = '/home/vgpnk/Projects/shokunin/tabi-shokunin'
COUNTER = os.path.join(ROOT, '.ufo/waves/round-40/counters/c1-sample-span-v3.mjs')
PRISTINE = os.path.join(ROOT, 'corpus/evidence/round-39/playwright-egress/receipt.json')
S = '/fast/scratch/hyaku/tabi-r40/MutSpanCases'
CASES = os.path.join(S, 'cases')
RUNS = os.path.join(S, 'runs')
NONCE = open(os.path.join(S, 'nonce.txt')).read().strip()
assert len(NONCE) == 64 and all(c in '0123456789abcdef' for c in NONCE)

sha = lambda p: hashlib.sha256(open(p, 'rb').read()).hexdigest()

original = json.load(open(PRISTINE))
positive = copy.deepcopy(original)
positive['schema'] = 'tabi-pw-firefox-egress-receipt-r40'
positive['refused'] = False
positive['runNonce'] = NONCE
for r in positive['runs']:
    r['refused'] = False
    r['runNonce'] = NONCE
    start = r['samples'][0]['t']
    for i, smp in enumerate(r['samples']):
        smp['t'] = start + i * 150
        for k in ('ss', 'proc'):
            smp[k]['unavailable'] = False
            smp[k]['ticks'] = 1
            smp[k]['nonLoopback'] = 0
    for k in ('ss', 'proc'):
        r['finalSweep'][k]['unavailable'] = False
        r['finalSweep'][k]['ticks'] = 1
        r['finalSweep'][k]['nonLoopback'] = 0
    r['survivors'] = 0
    r['survivorPids'] = []
    r['portClosed'] = True

def rebase(rcpt, run_idx, deltas):
    start = rcpt['runs'][run_idx]['samples'][0]['t']
    for smp, d in zip(rcpt['runs'][run_idx]['samples'], deltas):
        smp['t'] = start + d

r1 = positive['runs'][0]
mutants = []

def save(name, obj):
    p = os.path.join(CASES, name + '.json')
    with open(p, 'w') as f:
        json.dump(obj, f)
    return p

cases = []

# case 0: detector control — the mutated-free positive baseline must pass.
p = save('baseline-positive', copy.deepcopy(positive))
cases.append((p, ['baseline-positive', 'exit0', []]))

# case 1: 999 ms first-to-last span in run1 (all else valid).
m = copy.deepcopy(positive)
rebase(m, 0, [0, 124, 249, 374, 499, 624, 749, 874, 999])
p = save('span-999ms', m)
cases.append((p, ['span-999ms', 'exit1', ['run1-sample-span']]))

# case 2: exactly 1000 ms first-to-last span in run1 (boundary: >=1000 must pass).
m = copy.deepcopy(positive)
rebase(m, 0, [0, 125, 250, 375, 500, 625, 750, 875, 1000])
p = save('span-1000ms', m)
cases.append((p, ['span-1000ms', 'exit0', []]))

# case 3: duplicate timestamp in run1.
m = copy.deepcopy(positive)
m['runs'][0]['samples'][4]['t'] = m['runs'][0]['samples'][3]['t']
p = save('dup-timestamp', m)
cases.append((p, ['dup-timestamp', 'exit1', ['run1-sample-order']]))

# case 4: missing timestamp in run1.
m = copy.deepcopy(positive)
del m['runs'][0]['samples'][4]['t']
p = save('missing-timestamp', m)
cases.append((p, ['missing-timestamp', 'exit1', ['run1-sample-order']]))

# case 5: missing observation surface (ss key absent) in run1 sample 2.
m = copy.deepcopy(positive)
del m['runs'][0]['samples'][1]['ss']
p = save('missing-ss', m)
cases.append((p, ['missing-ss', 'exit1', ['run1-sample2-ss-unavailable']]))

# case 6: valid round-39 receipt, pristine bytes, fresh nonce.
cases.append((os.path.join(CASES, 'round39-pristine.json'),
              ['round39-pristine', 'exit1',
               ['schema', 'run-nonce-mismatch', 'run1-sample-span', 'run2-sample-span']]))

results = []
for path, (name, want_exit, want_findings) in cases:
    before = sha(path)
    cmd = ['node', COUNTER, path, '--nonce', NONCE]
    proc = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True)
    after = sha(path)
    try:
        out = json.loads(proc.stdout)
    except Exception:
        out = None
    open(os.path.join(RUNS, name + '.exit'), 'w').write(str(proc.returncode))
    open(os.path.join(RUNS, name + '.stdout'), 'w').write(proc.stdout)
    open(os.path.join(RUNS, name + '.stderr'), 'w').write(proc.stderr)
    open(os.path.join(RUNS, name + '.cmd'), 'w').write(
        'cd %s && %s\n' % (ROOT, ' '.join(cmd)))
    got = out.get('findings') if isinstance(out, dict) else None
    results.append({
        'case': name,
        'cmd': ' '.join(cmd),
        'exit': proc.returncode,
        'predicate': out.get('predicate') if isinstance(out, dict) else None,
        'findings': got,
        'wantExit': int(want_exit[4:]),
        'wantFindings': want_findings,
        'findingsExactMatch': got == want_findings,
        'inputShaBefore': before,
        'inputShaAfter': after,
        'inputUnmodified': before == after,
    })

summary = {
    'schema': 'tabi-r40-c1-mutation-span-cases-v1',
    'counterSha256': sha(COUNTER),
    'nonce': NONCE,
    'pristineCommittedSha256': sha(PRISTINE),
    'results': results,
    'allInputFilesUnmodified': all(r['inputUnmodified'] for r in results),
}
json.dump(summary, open(os.path.join(S, 'summary.json'), 'w'), indent=1)
print(json.dumps(summary, indent=1))
