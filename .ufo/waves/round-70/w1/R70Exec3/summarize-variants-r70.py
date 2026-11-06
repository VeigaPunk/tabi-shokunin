#!/usr/bin/env python3
"""R70Exec3: summarize probe-tap-variants-r70.mjs receipts into one table + JSON.

Reads every receipts/*.json beside this script (or the paths given), derives the facts the
report cites, and prints one row per variant. Read-only: it never touches receipts.
"""
import glob
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
PATHS = sys.argv[1:] or sorted(glob.glob(os.path.join(HERE, 'receipts', '*.json')))


def gaps(events):
    downs = [e for e in events if e['type'] == 'pointerdown']
    return [round(downs[i + 1]['ts'] - downs[i]['ts'], 1) for i in range(len(downs) - 1)]


def op_view(d):
    view = []
    for o in d['ops']:
        m = o['method']
        if m.startswith(('Emulation.', 'Page.', 'Runtime.', 'Browser.')):
            continue
        view.append({'method': m, 'ok': o['ok'], 'cdpError': (o.get('cdpError') or {}).get('message'),
                     'durationMs': o['durationMs'], 'params': o['params']})
    return view


rows = []
for p in PATHS:
    d = json.load(open(p))
    o = d['observed']
    env = d['env']
    rows.append({
        'variant': d['variant'],
        'file': os.path.basename(p),
        'sha256': __import__('hashlib').sha256(open(p, 'rb').read()).hexdigest(),
        'infraOk': d['infraOk'],
        'chrome': d['host']['chromium'],
        'protocol': d['host']['protocolVersion'],
        'chromiumVersion': d['host'].get('product'),
        'pre': [x['method'] if isinstance(x, dict) else x for x in d.get('pre', [])],
        'ops': op_view(d),
        'envBefore': {k: env['before'][k] for k in ('maxTouchPoints', 'ontouchstart', 'anyPointerCoarse')},
        'envAfterPre': {k: env['afterPre'][k] for k in ('maxTouchPoints', 'ontouchstart', 'anyPointerCoarse', 'pointerCoarse', 'innerWidth', 'vvScale')},
        'seqTypes': o['seqTypes'],
        'clickDetails': o['clickDetails'],
        'dblclickEvents': o['dblclickEvents'],
        'dblFired': o['dblFired'],
        'mousedownDetails': o['mousedownDetails'],
        'pressReleaseTsDeltaMs': [g['tsDeltaMs'] for g in o['pressRelease']],
        'pressReleaseWallDeltaMs': [g['wallDeltaMs'] for g in o['pressRelease']],
        'downDownGapsMs': gaps(d['events']),
        'pointerTypes': o['pointerTypes'],
        'pointerIds': o['pointerIds'],
        'buttonsSeq': o['buttonsSeq'],
        'targets': o['targets'],
        'allTrusted': o['allTrusted'],
        'failures': d['failures'],
        'teardown': d['teardown'],
    })

rows.sort(key=lambda r: r['variant'])
for r in rows:
    print('%-34s infra=%-5s pre=%-2d seq=%-3d clicks=%-9s dbl=%d/%d gaps=%-22s pids=%-10s ops=%s' % (
        r['variant'], r['infraOk'], len(r['pre']), len(r['seqTypes']),
        str(r['clickDetails']), r['dblclickEvents'], r['dblFired'],
        str(r['downDownGapsMs']), str(r['pointerIds']),
        ';'.join(('%s%s' % (x['method'].split('.')[-1], '' if x['ok'] else '!=' + str(x['cdpError']))) for x in r['ops'])))
out = os.path.join(HERE, 'summary.json')
with open(out, 'w') as f:
    json.dump(rows, f, indent=1, sort_keys=True)
print('\nreceipts: %d -> %s' % (len(rows), out))
