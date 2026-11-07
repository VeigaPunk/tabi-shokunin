#!/usr/bin/env python3
"""R75Scribe: independent re-derivation of the r75 note's measured table and laws
from the raw receipts, without reading the counter's SHAPE table."""
import json, sys, os, hashlib

LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin'
SMOKES = [f'{LANE}/.ufo/waves/round-75/controls/c1/smoke{i}.receipt.json' for i in range(1, 10)]
PROBES = [f'{LANE}/.ufo/waves/round-75/controls/c1/probe/p{i}.receipt.json' for i in range(1, 5)]
A = f'{LANE}/corpus/evidence/round75/chromium-drag-intercept/receipt.json'
DEGEN = [f'{LANE}/.ufo/waves/round-75/controls/c1/degenerate-{n}.receipt.json'
         for n in ('native-mouse', 'no-intercept', 'script-events')]

def load(p):
    with open(p) as f:
        return json.load(f)

def dtv(e):
    if e['types'] is None:
        return '-'
    return '|'.join([ '+'.join(e['types']), e['plain'], e['custom'],
                      str(e['dropEffect']), str(e['effectAllowed']), str(e['items']) ])

def derive(r):
    out = []
    for l in r['legs']:
        leg = l['name']
        evs = [e for e in r['events'] if e['leg'] == leg]
        out.append({
            'leg': leg,
            'cmd': l['cmd'],
            'events': [f"{e['type']}@{e['target']} dp={e['defaultPrevented']} "
                       f"xy={e['x']},{e['y']} dt={dtv(e)}" for e in evs],
            'cdpError': l['cdpError'],
            'stateAfter': l['stateAfter'],
            'sentData': l['sentData'],
        })
    return out

def main():
    receipts = [(os.path.basename(p), load(p)) for p in SMOKES + PROBES + [A]]
    shapes = []
    for name, r in receipts:
        shapes.append((name, json.dumps(r['legShape'], sort_keys=True)))
    same = len({s for _, s in shapes}) == 1
    print(f'binding: receipts={len(receipts)} (9 smokes + 4 probes + (a)) legShape_identical={same}')

    print('\n=== per-leg derivation (smoke1; identical in all receipts) ===')
    for row in derive(receipts[0][1]):
        print(f"[{row['leg']}] cmd={row['cmd']} err={row['cdpError']} state={json.dumps(row['stateAfter'])}")
        for e in row['events']:
            print('    ', e)

    # table cells, checked against every receipt
    print('\n=== law checks over every scored receipt ===')
    fails = []
    for name, r in receipts:
        ev = r['events']
        for e in ev:
            if e['isTrusted'] is not True:
                fails.append((name, 'untrusted', e['type']))
            if e['types'] is not None and any(t.startswith('chromium/') for t in e['types']):
                fails.append((name, 'chromium-type', e['type']))
        # effectAllowed law: dragstart uses source mask 17; every other drag event uses the
        # dispatched leg's mask (17 for INTERCEPTED, 1 for EXT)
        masks = {}
        for l in r['legs']:
            p = l['params'] or {}
            if l['cmd'] == 'Input.dispatchDragEvent':
                d = l['sentData'] if l['sentData'] is not None else p.get('data')
                if l['sentData'] is None and p.get('data') != 'INTERCEPTED':
                    d = p.get('data')
                masks[l['name']] = d['dragOperationsMask'] if isinstance(d, dict) else None
        mname = {1: 'copy', 2: 'link', 16: 'move', 17: 'copyMove'}
        for e in ev:
            if e['type'] not in ('dragstart', 'drag', 'dragenter', 'dragover', 'dragleave', 'drop', 'dragend'):
                continue
            want = 17 if e['type'] == 'dragstart' else masks.get(e['leg'])
            if want is None or e['effectAllowed'] != mname.get(want):
                fails.append((name, 'effectAllowed', e['type'], e['leg'], e['effectAllowed'], want))
        # readable-data law: text data non-empty only in dragstart and drop
        for e in ev:
            if e['types'] is None:
                continue
            readable = (e['plain'] != '' or e['custom'] != '')
            if e['type'] in ('dragstart', 'drop'):
                if e['plain'] == '':
                    fails.append((name, 'drop-or-dragstart-empty', e['type'], e['leg']))
            elif readable:
                fails.append((name, 'readable-outside-drop', e['type'], e['leg']))
        # coordinates: every event except pointercancel sits at its leg's point; dragstart at press point
        legpt = {l['name']: (l['params'] or {}).get('x'), }
        legpt = {l['name']: ((l['params'] or {}).get('x'), (l['params'] or {}).get('y')) for l in r['legs']}
        press = legpt['press']
        for e in ev:
            if e['type'] == 'pointercancel':
                if (e['x'], e['y']) != (0, 0):
                    fails.append((name, 'pointercancel-not-0,0', e['leg']))
                continue
            want = press if e['type'] == 'dragstart' else legpt.get(e['leg'])
            if (e['x'], e['y']) != want:
                fails.append((name, 'coord', e['type'], e['leg'], (e['x'], e['y']), want))
    print('law failures:', len(fails))
    for f in fails[:20]:
        print('  ', f)

    print('\n=== event count per receipt / dragIntercepted payload / bad-type error ===')
    for name, r in receipts:
        inter = [e for e in r['cdpEventLog'] if e['method'] == 'Input.dragIntercepted']
        bad = [l for l in r['legs'] if l['name'] == 'bad-type'][0]
        print(f"{name}: events={len(r['events'])} intercepts={len(inter)} "
              f"payload={json.dumps(inter[0]['params']['data']) if inter else None} "
              f"badtype_err={bad['cdpError']!r}")

    print('\n=== stateAfter per leg (smoke1) vs note "State after" column ===')
    for row in derive(receipts[0][1]):
        print(f"  {row['leg']}: {json.dumps(row['stateAfter'])}")

    print('\n=== degenerate control receipts: chromium/* markers ===')
    for p in DEGEN:
        d = load(p)
        marks = sorted({t for e in d['events'] if e['types'] for t in e['types'] if t.startswith('chromium/')})
        ents = [e['type'] + '@' + (e['target'] or '?') for e in d['events'] if e['type'] == 'dragenter']
        inter = [e for e in d.get('cdpEventLog', []) if e['method'] == 'Input.dragIntercepted']
        print(f"  {os.path.basename(p)}: deg={d['degenerate']} marker_types={marks} "
              f"dragenters={ents[:6]} intercepts={len(inter)} trusted_all={all(e['isTrusted'] for e in d['events'])}")

    print('\n=== driver/nonce binding ===')
    for name, r in receipts:
        print(f"  {name}: nonce={r['nonce']} driver={r['driverSha256'][:12]} pred={r['predicate']} hyp={r['dragHypothesis']}")

if __name__ == '__main__':
    main()
