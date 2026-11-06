#!/usr/bin/env python3
"""R70Exec3: compare the two full probe passes (receipts/ vs receipts2/) field by field.

Both passes use the same probe script revision (receipts2) except that the first pass grew
variants while it ran; each receipt records probeSha256. Prints one line per variant with
OK/DIFF and the differing fields. Exit 1 if any DIFF (so the report can cite exit 0).
"""
import glob
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SEMANTIC = ['seqTypes', 'clickDetails', 'dblclickEvents', 'dblFired', 'mousedownDetails',
            'pointerTypes', 'pointerIds', 'buttonsSeq', 'targets', 'allTrusted']
# Timing fields are real measurements and legitimately jitter under scheduler noise; compare
# them with a tolerance and report the drift, do not fail on it.
TIMING = ['pressReleaseTsDeltaMs', 'downDownGapsMs']
TIMING_TOL_MS = 25.0
TIMING_TOL_FRAC = 0.20


def load(d, name):
    p = os.path.join(HERE, d, name + '.json')
    if not os.path.exists(p):
        return None
    return json.load(open(p))


def derived(receipt):
    ev = receipt['events']
    downs = [e for e in ev if e['type'] == 'pointerdown']
    ups = [e for e in ev if e['type'] == 'pointerup']
    d = {
        'seqTypes': receipt['observed']['seqTypes'],
        'clickDetails': receipt['observed']['clickDetails'],
        'dblclickEvents': receipt['observed']['dblclickEvents'],
        'dblFired': receipt['observed']['dblFired'],
        'mousedownDetails': receipt['observed']['mousedownDetails'],
        'pressReleaseTsDeltaMs': [g['tsDeltaMs'] for g in receipt['observed']['pressRelease']],
        'downDownGapsMs': [round(downs[i + 1]['ts'] - downs[i]['ts'], 1) for i in range(len(downs) - 1)],
        'pointerTypes': receipt['observed']['pointerTypes'],
        'pointerIds': receipt['observed']['pointerIds'],
        'buttonsSeq': receipt['observed']['buttonsSeq'],
        'targets': receipt['observed']['targets'],
        'allTrusted': receipt['observed']['allTrusted'],
        'opStatus': [(o['method'], o['ok'], (o.get('cdpError') or {}).get('message')) for o in receipt['ops']
                     if o['method'].startswith('Input.')],
        'infraOk': receipt['infraOk'],
        'probeSha256': receipt['probeSha256'],
    }
    return d


names = sorted({os.path.basename(p)[:-5] for p in glob.glob(os.path.join(HERE, 'receipts2', '*.json'))})
bad = 0
hashes = set()
for n in names:
    a, b = load('receipts', n), load('receipts2', n)
    if a is None or b is None:
        print('%-34s MISSING pass1=%s pass2=%s' % (n, a is not None, b is not None))
        bad += 1
        continue
    da, db = derived(a), derived(b)
    hashes.add(db['probeSha256'])
    diffs = [f for f in SEMANTIC if da[f] != db[f]]
    if da['opStatus'] != db['opStatus'] or da['infraOk'] is not db['infraOk']:
        diffs.append('opStatus/infraOk')
    drift = []
    for f in TIMING:
        if len(da[f]) != len(db[f]):
            diffs.append(f + ':count')
            continue
        for x, y in zip(da[f], db[f]):
            tol = max(TIMING_TOL_MS, TIMING_TOL_FRAC * max(abs(x), abs(y)))
            if abs(x - y) > tol:
                diffs.append(f)
                break
            if abs(x - y) > 0.05:
                drift.append('%s:%s->%s' % (f, x, y))
    if diffs:
        bad += 1
        print('%-34s DIFF %s' % (n, ', '.join(diffs)))
        for f in sorted(set(diffs)):
            if f in SEMANTIC:
                print('    %s: pass1=%s pass2=%s' % (f, da[f], db[f]))
    else:
        print('%-34s OK  ops=%s clicks=%s dbl=%d gaps=%s%s' % (
            n, ';'.join(x[0].split('.')[-1] + ('' if x[1] else '!') for x in db['opStatus']),
            db['clickDetails'], db['dblclickEvents'], db['downDownGapsMs'],
            ('  [timing drift within tol: ' + ';'.join(drift) + ']') if drift else ''))
print('\nvariants=%d semantic_or_tolerance_diffs=%d pass2_probe_sha256=%s' % (len(names), bad, sorted(hashes)))
sys.exit(1 if bad else 0)
