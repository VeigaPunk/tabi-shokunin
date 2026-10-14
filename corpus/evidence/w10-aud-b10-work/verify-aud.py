#!/usr/bin/env python3
"""TABI lane B8-1 verifier — full-event digests per cell/rep + rep equality.

Reads the raw journey.json (all events incl. redirect hops, which CDP reports
under one requestId), strips timing fields, and compares rep1 vs rep2.
Also prints the hop chains per cell for reading.
"""
import json
import os
import re
import sys

ROOT = '/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/w9-tabi-b91/runs'
CELLS = ['replay-guard-skip', 'replay-consumed-pre', 'replay-consumed-post', 'replay-unknown-token',
         'replay-terminus', 'double-apply-fresh-token', 'replay-307']
STRIP = {'atMs', 'atRelMs', 'atUTC', 'duration', 'ts', 'wallTime'}


def strip(o):
    if isinstance(o, dict):
        return {k: strip(v) for k, v in o.items() if k not in STRIP}
    if isinstance(o, list):
        return [strip(v) for v in o]
    return o


def digest(rec):
    # kind-separated: hops (req events, in arrival order) + wire status sequence +
    # client status sequence + failure record + facts. Inter-kind arrival order
    # (wire vs resp) is excluded — it flips across reps (see note).
    lines = []
    for r in rec['requests']:
        hops = []
        wires = []
        resps = []
        fails = []
        for e in r['events']:
            k = e['kind']
            if k == 'req':
                rf = e.get('redirectFrom')
                hops.append('%s %s%s' % (e['method'], e['url'], ' <- %s' % rf['status'] if rf else ''))
            elif k == 'wire':
                wires.append(str(e['statusCode']))
            elif k == 'resp':
                resps.append(str(e['status']))
            elif k == 'failed':
                fails.append('%s canceled=%s' % (e['errorText'], e['canceled']))
        lines.append('hops: ' + ' | '.join(hops))
        if wires:
            lines.append('  wire: ' + ' '.join(wires))
        if resps:
            lines.append('  resp: ' + ' '.join(resps))
        if fails:
            lines.append('  failed: ' + ' '.join(fails))
    f = rec.get('facts')
    if f:
        for k in sorted(f):
            if k == 'net':
                continue
            lines.append('fact %s %s' % (k, json.dumps(strip(f[k]), sort_keys=True)))
    return lines


def chains(rec):
    out = []
    for r in rec['requests']:
        hops = []
        for e in r['events']:
            if e['kind'] == 'req':
                hops.append('%s %s' % (e['method'], e['url']))
            elif e['kind'] == 'wire':
                hops[-1] += ' -> wire %s' % e['statusCode']
            elif e['kind'] == 'resp' and not hops[-1].endswith('resp'):
                hops[-1] += ' -> resp %s' % e['status']
            elif e['kind'] == 'failed':
                hops[-1] += ' -> failed %s' % e['errorText']
        out.extend(hops)
    return out


ok = True
report = []
for cell in CELLS:
    lines = []
    for rep in (1, 2, 3):
        p = os.path.join(ROOT, cell, 'rep%d' % rep, 'journey.json')
        if not os.path.exists(p):
            lines.append('MISSING rep%d journey.json' % rep)
            ok = False
            continue
        rec = json.load(open(p))
        if rec.get('error'):
            lines.append('rep%d journey error: %s' % (rep, rec['error'][:120]))
            ok = False
            continue
        lines.append('rep%d digest sha=%s lines=%d' % (
            rep,
            __import__('hashlib').sha256('\n'.join(digest(rec)).encode()).hexdigest()[:16],
            len(digest(rec))))
    a = os.path.join(ROOT, cell, 'rep1', 'journey.json')
    b = os.path.join(ROOT, cell, 'rep2', 'journey.json')
    verdict = 'n/a'
    if os.path.exists(a) and os.path.exists(b):
        da, db = digest(json.load(open(a))), digest(json.load(open(b)))
        if da == db:
            verdict = 'IDENTICAL'
        else:
            verdict = 'DIFFERS'
            ok = False
            for i, (x, y) in enumerate(zip(da, db)):
                if x != y:
                    lines.append('  first diff L%d: %s || %s' % (i, x, y))
                    break
            if len(da) != len(db):
                lines.append('  length %d vs %d' % (len(da), len(db)))
    report.append('%-22s %s | %s' % (cell, verdict, ' ; '.join(lines)))

print('== rep-to-rep digest (full event chains + client facts, timings stripped) ==')
print('\n'.join(report))
print('ALL_IDENTICAL' if ok else 'DIVERGENCES_PRESENT')

print()
print('== hop chains per cell (rep1, from journey.json) ==')
for cell in CELLS:
    p = os.path.join(ROOT, cell, 'rep1', 'journey.json')
    if not os.path.exists(p):
        continue
    rec = json.load(open(p))
    print('### %s' % cell)
    for h in chains(rec):
        print('   ', h)