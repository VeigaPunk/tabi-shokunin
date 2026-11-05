#!/usr/bin/env python3
"""Round 65 pre-freeze do-nothing controls (tabi lane).

Runs the frozen round-62 v21 adjacency meter and the round-64 v1 receipt gate on the
round-65 forgeries and writes one tabi-command-receipt-v1 per control into this
directory. Each receipt binds its stdout by sha256 and every input by the sha256 of its
bytes at --rev (`git show <rev>:<path>`), so a reader can re-derive the row from the
committed bytes. Run ONLY after the fixtures it names are committed; pass --rev.

usage: dn-controls-r65.py --rev <40-hex> [--lane <abs>] [--fleet <abs>]
"""
import argparse, hashlib, json, os, subprocess, sys

ap = argparse.ArgumentParser()
ap.add_argument('--rev', required=True)
ap.add_argument('--lane', default='/home/vgpnk/Projects/shokunin/tabi-shokunin')
ap.add_argument('--fleet', default='/home/vgpnk/Projects/shokunin')
args = ap.parse_args()

OUT_REL = '.ufo/waves/round-65/controls'
V21 = '.ufo/waves/round-62/counters/c1-adjacency-host-v21.mjs'
V1 = 'scripts/check-receipt-provenance.mjs'
SNAP = '.ufo/waves/round-62/c1/snapshot-r62.tsv'
AUDIT = 'corpus/adjacency-host-audit-r62.tsv'
DELTA_DUP = '.ufo/waves/round-65/controls/c2-fixtures/delta-dup-contradiction.tsv'
DELTA_R62_CONFLICT = '.ufo/waves/round-62/w1/R62Reviewer/real-conflicting-delta.tsv'
FAB_DIR = '.ufo/waves/round-65/controls/c1-fab'

def git(*a):
    return subprocess.run(['git', '-C', args.lane, *a], capture_output=True, check=False)

def at_rev(path):
    r = git('show', f'{args.rev}:{path}')
    if r.returncode != 0:
        raise SystemExit(f'input absent at rev: {path}')
    return hashlib.sha256(r.stdout).hexdigest()

def run(name, argv, inputs):
    p = subprocess.run(argv, cwd=args.lane, capture_output=True)
    out = p.stdout
    so = f'{name}.stdout'
    with open(os.path.join(args.lane, OUT_REL, so), 'wb') as f:
        f.write(out)
    rec = {
        'schema': 'tabi-command-receipt-v1',
        'name': name,
        'argv': argv,
        'cwd': args.lane,
        'exit': p.returncode,
        'stdoutFile': so,
        'stdoutSha256': hashlib.sha256(out).hexdigest(),
        'inputs': [{'path': i, 'sha256': at_rev(i)} for i in inputs],
        'rev': args.rev,
    }
    with open(os.path.join(args.lane, OUT_REL, f'{name}.command.json'), 'w') as f:
        json.dump(rec, f, indent=1)
        f.write('\n')
    print(name, 'exit', p.returncode, 'stdout', len(out), 'bytes')

meter = lambda delta: ['node', V21, '--repo', '.', '--rev', args.rev, '--fleet', args.fleet,
                       '--snapshot', SNAP, '--audit', AUDIT, '--delta', delta, '--json']
run('c1-dn-a-v21-forgery-dup', meter(DELTA_DUP), [V21, SNAP, AUDIT, DELTA_DUP])
run('c1-dn-b-v21-forgery-r62', meter(DELTA_R62_CONFLICT), [V21, SNAP, AUDIT, DELTA_R62_CONFLICT])
run('c2-dn-v1-forgery-dir', ['node', V1, '--dir', FAB_DIR, '--repo', '.', '--rev', args.rev,
                             '--require-committed', '--min-receipts', '12', '--json'],
    [V1])
