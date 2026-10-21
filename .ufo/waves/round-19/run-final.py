#!/usr/bin/env python3
"""Run the frozen 23-gate cohort + four new self-tests in faithful private clones.
Usage: python3 .ufo/waves/round-19/run-final.py FULL_REV NEW_OUTPUT_JSON
Never mutates the live lane/fleet. Exit 0 iff all historical exits equal baseline and
new self-tests exit 0; exit 1 mismatch; exit 2 evaluator failure. Output retains argv,
streams, SHA-256 of streams and producer blobs, revision and sandbox status.
"""
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
from datetime import datetime, timezone

LANE = Path(__file__).resolve().parents[3]
FLEET = LANE.parent
NODE = '/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node'
ENV = dict(os.environ, PATH=str(Path(NODE).parent) + ':' + os.environ['PATH'])

def stamp():
    return datetime.now(timezone.utc).isoformat()

def sha(data):
    return hashlib.sha256(data).hexdigest()

def git(path, *args):
    return subprocess.check_output(['git', '-C', str(path), *args], env=ENV).decode().strip()

def clone(source, target, rev, branch):
    subprocess.run(['git', 'clone', '--quiet', '--no-hardlinks', str(source), str(target)],
                   env=ENV, check=True)
    subprocess.run(['git', '-C', str(target), 'switch', '--quiet', '--detach', rev], env=ENV, check=True)
    subprocess.run(['git', '-C', str(target), 'branch', '-f', branch, rev], env=ENV, check=True)
    subprocess.run(['git', '-C', str(target), 'switch', '--quiet', branch], env=ENV, check=True)

if __name__ == '__main__':
    if len(sys.argv) != 3 or not __import__('re').fullmatch('[0-9a-f]{40}', sys.argv[1]):
        raise SystemExit('usage: run-final.py FULL_REV NEW_OUTPUT_JSON')
    rev, output = sys.argv[1], Path(sys.argv[2]).resolve()
    if output.exists():
        raise SystemExit('refusing existing output')
    baseline = json.loads((LANE / '.ufo/waves/round-19/harm-baseline.json').read_text())
    result = {'schema': 'tabi-round19-final-suite-v1', 'revision': rev, 'startedAt': stamp(),
              'producerPath': '.ufo/waves/round-19/run-final.py',
              'producerSha256': sha(Path(__file__).read_bytes()), 'gates': [], 'errors': []}
    root = Path(tempfile.mkdtemp(prefix='tabi-r19-final-', dir='/fast/scratch'))
    try:
        fleet = root / 'fleet'
        clone(FLEET, fleet, baseline['sandbox']['fleetRevision'], 'r19-fleet')
        lane = fleet / 'tabi-shokunin'
        clone(LANE, lane, rev, 'master')
        for name, pin in baseline['sandbox']['siblingPins'].items():
            clone(FLEET / name, fleet / name, pin['tip'], pin['ref'])
        result['sandbox'] = {'fleetRevision': baseline['sandbox']['fleetRevision'],
                             'siblingPins': baseline['sandbox']['siblingPins'],
                             'laneStatusBefore': git(lane, 'status', '--porcelain=v1', '-uall')}
        cohort = [dict(g, kind='historical', expectedExit=g['exit']) for g in baseline['gates']]
        for name, path in [('c1', '.ufo/waves/round-19/measure-c1.mjs'),
                           ('c2', '.ufo/waves/round-19/measure-c2.mjs'),
                           ('c3', '.ufo/waves/round-19/measure-c3.mjs'),
                           ('isolation', '.ufo/waves/round-19/isolation/check-isolation.mjs')]:
            cohort.append({'gate': name + '-self-test', 'argv': [NODE, path, '--self-test'],
                           'producerPath': path, 'expectedExit': 0, 'kind': 'new'})
        for gate in cohort:
            argv = [str(fleet) if x == str(FLEET) else x for x in gate['argv']]
            row = {'gate': gate['gate'], 'kind': gate['kind'], 'argv': argv,
                   'expectedExit': gate['expectedExit'], 'producerPath': gate['producerPath'],
                   'producerSha256': sha((lane / gate['producerPath']).read_bytes())}
            try:
                run = subprocess.run(argv, cwd=lane, env=ENV, capture_output=True, timeout=1200)
                row.update(exit=run.returncode, stdout=run.stdout.decode(errors='replace'),
                           stderr=run.stderr.decode(errors='replace'), stdoutSha256=sha(run.stdout),
                           stderrSha256=sha(run.stderr), timedOut=False)
            except subprocess.TimeoutExpired as error:
                row.update(exit=None, timedOut=True, stdout=(error.stdout or b'').decode(errors='replace'),
                           stderr=(error.stderr or b'').decode(errors='replace'))
            row['pass'] = row['exit'] == row['expectedExit'] and not row['timedOut']
            result['gates'].append(row)
            print(gate['gate'], row['exit'], 'expected', row['expectedExit'], flush=True)
        result['sandbox']['laneStatusAfter'] = git(lane, 'status', '--porcelain=v1', '-uall')
        result['historicalEqual'] = sum(g['pass'] for g in result['gates'] if g['kind'] == 'historical')
        result['newClean'] = sum(g['pass'] for g in result['gates'] if g['kind'] == 'new')
        result['verdict'] = 'clean' if all(g['pass'] for g in result['gates']) else 'failed'
    except Exception as error:
        result['errors'].append(str(error))
        result['verdict'] = 'could-not-evaluate'
    finally:
        result['completedAt'] = stamp()
        shutil.rmtree(root)
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(json.dumps(result, indent=1) + '\n')
    raise SystemExit({'clean': 0, 'failed': 1, 'could-not-evaluate': 2}[result['verdict']])
