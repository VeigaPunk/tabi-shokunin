#!/usr/bin/env python3
"""R75Scribe: check every row of the r75 note's measured table against the raw receipts.
The note's DT-view column is (types | text/plain | dropEffect | effectAllowed); the receipts
also carry text/x-tabi data and item counts, reported separately."""
import json, glob, os

LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin'
P = ([f'{LANE}/.ufo/waves/round-75/controls/c1/smoke{i}.receipt.json' for i in range(1, 10)]
     + [f'{LANE}/.ufo/waves/round-75/controls/c1/probe/p{i}.receipt.json' for i in range(1, 5)]
     + [f'{LANE}/corpus/evidence/round75/chromium-drag-intercept/receipt.json'])

S = {'dz': '', 'nz': '', 'drops': 0, 'starts': 0}
def st(dz='', nz='', drops=0, starts=0):
    return {'dz': dz, 'nz': nz, 'drops': drops, 'starts': starts}

# rows transcribed from corpus/knowledge/chromium-drag-intercept-runtime-round-75.md
NOTE = [
    ('intercept-on', [], [], st()),
    ('press', [('pointerdown', 'src', False), ('mousedown', 'src', False)], [('-', None, None, None), ('-', None, None, None)], st()),
    ('move-start', [('dragstart', 'src', False), ('pointercancel', 'src', False)],
     [('text/plain+text/x-tabi', 'tabi-drag', 'none', 'copyMove'), ('-', None, None, None)], st(starts=1)),
    ('move-far', [], [], st(starts=1)),
    ('enter-dz', [('drag', 'src', False), ('dragenter', 'dz', True)],
     [('text/plain+text/x-tabi', '', 'none', 'copyMove'), ('text/plain+text/x-tabi', '', 'copy', 'copyMove')],
     st(starts=1)),
    ('over-dz', [('dragover', 'dz', True)],
     [('text/plain+text/x-tabi', '', 'copy', 'copyMove')], st(starts=1)),
    ('drop-dz', [('drag', 'src', False), ('dragover', 'dz', True), ('drop', 'dz', True), ('dragend', 'src', False)],
     [('text/plain+text/x-tabi', '', 'none', 'copyMove'), ('text/plain+text/x-tabi', '', 'copy', 'copyMove'),
      ('text/plain+text/x-tabi', 'tabi-drag', 'copy', 'copyMove'), ('text/plain+text/x-tabi', '', 'copy', 'copyMove')],
     st(dz='tabi-drag|x1', drops=1, starts=1)),
    ('release', [('pointerup', 'dz', False), ('mouseup', 'dz', False)], [('-', None, None, None), ('-', None, None, None)],
     st(dz='tabi-drag|x1', drops=1, starts=1)),
    ('ext-enter-nz', [('dragenter', 'nz', False)],
     [('text/plain', '', 'copy', 'copy')], st(dz='tabi-drag|x1', drops=1, starts=1)),
    ('ext-drop-nz', [('dragover', 'nz', False), ('dragleave', 'nz', False)],
     [('text/plain', '', 'copy', 'copy'), ('text/plain', '', 'none', 'copy')],
     st(dz='tabi-drag|x1', drops=1, starts=1)),
    ('ext-enter-dz', [('dragenter', 'dz', True)],
     [('text/plain', '', 'copy', 'copy')], st(dz='tabi-drag|x1', drops=1, starts=1)),
    ('ext-cancel', [], [], st(dz='tabi-drag|x1', drops=1, starts=1)),
    ('ext-drop-dz', [], [], st(dz='tabi-drag|x1', drops=1, starts=1)),
    ('bad-type', [], [], st(dz='tabi-drag|x1', drops=1, starts=1)),
]

def main():
    receipts = [(os.path.basename(p), json.load(open(p))) for p in P]
    bad = 0
    for name, r in receipts:
        for legname, wantEv, wantDt, wantState in NOTE:
            evs = [e for e in r['events'] if e['leg'] == legname]
            gotEv = [(e['type'], e['target'], e['defaultPrevented']) for e in evs]
            if gotEv != wantEv:
                print(f'FAIL {name} {legname}: events {gotEv} != {wantEv}'); bad += 1
            gotDt = [(( '+'.join(e['types']) if e['types'] else '-'), e['plain'], e['dropEffect'], e['effectAllowed']) for e in evs]
            if gotDt != wantDt:
                print(f'FAIL {name} {legname}: dtview {gotDt} != {wantDt}'); bad += 1
            leg = [l for l in r['legs'] if l['name'] == legname][0]
            if leg['stateAfter'] != wantState:
                print(f'FAIL {name} {legname}: state {leg["stateAfter"]} != {wantState}'); bad += 1
        # coordinates named in the table
        ds = [e for e in r['events'] if e['type'] == 'dragstart'][0]
        pc = [e for e in r['events'] if e['type'] == 'pointercancel'][0]
        if (ds['x'], ds['y']) != (150, 120):
            print(f'FAIL {name}: dragstart at {ds["x"]},{ds["y"]} != 150,120'); bad += 1
        if (pc['x'], pc['y']) != (0, 0):
            print(f'FAIL {name}: pointercancel at {pc["x"]},{pc["y"]} != 0,0'); bad += 1
        # note's prose: ONE dragIntercepted with the given items and mask
        inter = [e for e in r['cdpEventLog'] if e['method'] == 'Input.dragIntercepted']
        want = {'items': [{'mimeType': 'text/plain', 'data': 'tabi-drag'},
                          {'mimeType': 'text/x-tabi', 'data': 'x1'}], 'dragOperationsMask': 17}
        if len(inter) != 1 or inter[0]['params']['data'] != want:
            print(f'FAIL {name}: intercept log {json.dumps([i["params"] for i in inter])[:200]}'); bad += 1
        # note's prose: bad-type error
        bt = [l for l in r['legs'] if l['name'] == 'bad-type'][0]
        err = bt['cdpError']
        err = json.loads(err) if isinstance(err, str) else err
        if not isinstance(err, dict) or err.get('code') != -32602 or "Unexpected event type 'dragLeave'" not in err.get('message', ''):
            print(f'FAIL {name}: bad-type cdpError {bt["cdpError"]}'); bad += 1
        # the drop row's x1 custom field
        drop = [e for e in r['events'] if e['type'] == 'drop'][0]
        if drop['custom'] != 'x1':
            print(f'FAIL {name}: drop custom {drop["custom"]!r}'); bad += 1
    print(f'receipts={len(receipts)} rows_per_receipt={len(NOTE)} failures={bad}')
    print('VERDICT:', 'every note table row reproduces on every receipt' if bad == 0 else 'MISMATCH')

if __name__ == '__main__':
    main()
