#!/usr/bin/env python3
"""R72Scribe: every number quoted in knowledge-note.md / sources-row.md / report.md comes
from this script (or from the shell commands listed in report.md). Read-only over the lane.

  python3 measure.py --lane /home/vgpnk/Projects/shokunin/tabi-shokunin --out numbers.json
"""
import argparse, glob, hashlib, json, math, os, sys
from collections import Counter

ap = argparse.ArgumentParser()
ap.add_argument('--lane', required=True)
ap.add_argument('--out', required=True)
a = ap.parse_args()

LANE = os.path.abspath(a.lane)
SCORED_RECEIPT = 'corpus/evidence/round72/chromium-synth-pinch-gesture/receipt.json'
SMOKES = sorted(glob.glob(os.path.join(LANE, '.ufo/waves/round-72/controls/c1/smoke*.receipt.json')))
OTHER_RUNS = ['.ufo/waves/round-72/w1/R72Exec1/receipt.json']  # another seat's independent run, read not run
LAW_LEGS = ['in', 'out', 'clamp', 'default']


def load(rel):
    with open(os.path.join(LANE, rel), 'rb') as f:
        b = f.read()
    return json.loads(b), hashlib.sha256(b).hexdigest()


def wheels(d, leg):
    return [e for e in d['events'] if e.get('leg') == leg and e.get('type') == 'wheel']


def leg(d, name):
    return next(l for l in d['legs'] if l['name'] == name)


def span(w):
    return round(w[-1]['ts'] - w[0]['ts'], 3) if w else None


def law(d, n):
    return sum(e['deltaY'] * e['scale'] for e in wheels(d, n))


def per_run(rel):
    d, sha = load(rel)
    out = {'receipt': rel, 'receiptSha256': sha, 'nonce': d.get('nonce'),
           'legs': {}, 'law': {}}
    for L in d['legs']:
        w = wheels(d, L['name'])
        out['legs'][L['name']] = {
            'events': len([e for e in d['events'] if e.get('leg') == L['name']]),
            'wheels': len(w),
            'scaleBefore': L['scaleBefore']['page'], 'scaleAfter': L['scaleAfter']['page'],
            'wheelSpanMs': span(w), 'elapsedMs': L['elapsedMs'], 'cdpError': L['cdpError'],
        }
    for n in LAW_LEGS:
        f = leg(d, n)['scaleAfter']['page'] / leg(d, n)['scaleBefore']['page']
        req = next(p for p in d['plan'] if p['name'] == n)['params']['scaleFactor']
        out['law'][n] = {'sumDeltaYTimesScale': law(d, n),
                         'minus100lnRealized': -100 * math.log(f),
                         'minus100lnRequested': -100 * math.log(req),
                         'devVsRequested': abs(law(d, n) + 100 * math.log(req)),
                         'devVsRealized': abs(law(d, n) + 100 * math.log(f)),
                         'realizedFactor': f}
    return out, d


scored, d = per_run(SCORED_RECEIPT)

anchor = {}
for n in ['in', 'default', 'clamp']:
    w = wheels(d, n)
    c = Counter((e['clientX'], e['clientY']) for e in w)
    anchor[n] = {'wheels': len(w), 'coords': {f'{k[0]},{k[1]}': v for k, v in sorted(c.items())},
                 'maxAbsDx': max(abs(e['clientX'] - 400) for e in w),
                 'maxAbsDy': max(abs(e['clientY'] - 300) for e in w),
                 'offAnchor': sum(1 for e in w if abs(e['clientX'] - 400) or abs(e['clientY'] - 300))}

zero = wheels(d, 'zero')
zero_stats = {
    'wheels': len(zero),
    'allDeltaYZero': all(e['deltaY'] == 0 for e in zero),
    'deltaYValues': sorted(set(e['deltaY'] for e in zero)),
    'allCtrl': all(e['ctrlKey'] is True for e in zero),
    'allDeltaMode0': all(e['deltaMode'] == 0 for e in zero),
    'allTrusted': all(e['isTrusted'] is True for e in zero),
    'coords': sorted(set(f"{e['clientX']},{e['clientY']}" for e in zero)),
    'spanMs': span(zero),
    'meanCadenceMs': round((zero[-1]['ts'] - zero[0]['ts']) / (len(zero) - 1), 3),
    'legElapsedMs': leg(d, 'zero')['elapsedMs'],
    'cdpError': leg(d, 'zero')['cdpError'],
    'cdpResult': leg(d, 'zero')['cdpResult'],
}

outw = wheels(d, 'out')
out_sweep = {'coords': [f"{e['clientX']},{e['clientY']}" for e in outw],
             'xTimesScale': [round(e['clientX'] * e['scale'], 2) for e in outw],
             'yTimesScale': [round(e['clientY'] * e['scale'], 2) for e in outw],
             'deltaY': [round(e['deltaY'], 6) for e in outw]}

smokes = {}
for p in SMOKES + [os.path.join(LANE, r) for r in OTHER_RUNS]:
    rel = os.path.relpath(p, LANE)
    r, _ = per_run(rel)
    smokes[rel if os.path.basename(p) == 'receipt.json' else os.path.basename(p)] = {
        'in': r['legs']['in']['wheels'], 'out': r['legs']['out']['wheels'],
        'clamp': r['legs']['clamp']['wheels'], 'default': r['legs']['default']['wheels'],
        'zero': r['legs']['zero']['wheels'],
        'nonce': r['nonce'], 'receiptSha256': r['receiptSha256'],
        'firstInAnchor': list(Counter((e['clientX'], e['clientY'])
                                     for e in wheels(json.load(open(p)), 'in')).keys())[0],
        'law': {n: round(v['sumDeltaYTimesScale'], 6) for n, v in r['law'].items()},
    }


def jload(rel):
    with open(os.path.join(LANE, rel)) as f:
        return json.load(f)


counter = jload('.ufo/waves/round-72/scored/c1-counter-a.json')
bat = jload('.ufo/waves/round-72/scored/c1-negatives-a.json')
kill = jload('.ufo/waves/round-72/scored/c1-kill-power-a.json')
fail = [r for r in bat['results'] if r['case'] == 'in-wheel-anchor-2px'][0]

scorecard_hits = 0
with open(os.path.join(LANE, 'SCORECARD.md')) as f:
    for line in f:
        if line.startswith('| `chromium-synth-pinch-gesture-linux` |'):
            scorecard_hits += 1

track = {}
for n in LAW_LEGS:
    w = wheels(d, n)
    s0 = leg(d, n)['scaleBefore']['page']
    cum = 0.0
    rows = []
    for i, e in enumerate(w, 1):
        cum += e['deltaY'] * e['scale']
        rows.append({'i': i, 'cum': cum, 'ref': -100 * math.log(e['scale'] / s0),
                     'dev': abs(cum + 100 * math.log(e['scale'] / s0))})
    track[n] = {'startScale': s0, 'within0.01': sum(1 for r in rows if r['dev'] <= 0.01),
                'wheels': len(rows), 'worstDev': max(r['dev'] for r in rows),
                'firstMatching': next((r['i'] for r in rows if r['dev'] <= 0.01), None),
                'tailDev': rows[-1]['dev'], 'events': rows}

res = {
    'lane': LANE,
    'perEventTracking': {n: {k: v for k, v in t.items() if k != 'events'} for n, t in track.items()},
    'scored': scored,
    'host': {'chromium': d['host']['chromium'], 'cdpProduct': d['host']['cdpProduct'],
             'viewport': d['fixture']['viewport'], 'anchor': d['fixture']['anchor']},
    'driverSha256': d.get('driverSha256'),
    'predicate': d.get('predicate'), 'synthPinchHypothesis': d.get('synthPinchHypothesis'),
    'anchor': anchor,
    'zero': zero_stats,
    'outSweep': out_sweep,
    'smokes': smokes,
    'counter': {'verdict': counter['verdict'], 'checkCount': counter['checkCount'],
                'findings': len(counter['findings'])},
    'battery': {k: bat[k] for k in ('refuseCases', 'mustAcceptCases', 'launderedCases', 'passed',
                                    'isolatedCases', 'idsWithIsolatedCase', 'failed',
                                    'checkIds', 'allOk', 'positiveOk')},
    'failedCase': fail,
    'killPower': {'mutants': kill['mutants'], 'killed': kill['killed'], 'holds': kill['holds'],
                  'forceTrue': kill['forceTrue'], 'semantic': kill['semantic'],
                  'survivors': kill['survivors'], 'unmutatedExit': kill['unmutatedExit']},
    'capabilityRowCount': scorecard_hits,
}
with open(a.out, 'w') as f:
    json.dump(res, f, indent=1)
print(json.dumps(res, indent=1))
