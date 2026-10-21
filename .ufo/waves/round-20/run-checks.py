#!/usr/bin/env python3
"""Run the frozen historical clean cohort and round20 selftests in private clones.
The inherited USER production failure is not rerun to confirm a reported error.
Usage: python3 .ufo/waves/round-20/run-checks.py FULL_REV NEW_OUTPUT_JSON
"""
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile
from datetime import datetime, timezone

LANE = Path(__file__).resolve().parents[3]
FLEET = LANE.parent
NODE = '/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node'
ENV = dict(os.environ, PATH=str(Path(NODE).parent) + ':' + os.environ['PATH'])

def git(path, *args):
    return subprocess.check_output(['git', '-C', str(path), *args], env=ENV).decode().strip()

def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def clone(source, target, revision, branch):
    subprocess.run(['git', 'clone', '--quiet', '--no-hardlinks', str(source), str(target)], env=ENV, check=True)
    subprocess.run(['git', '-C', str(target), 'switch', '--quiet', '--detach', revision], env=ENV, check=True)
    subprocess.run(['git', '-C', str(target), 'branch', '-f', branch, revision], env=ENV, check=True)
    subprocess.run(['git', '-C', str(target), 'switch', '--quiet', branch], env=ENV, check=True)

if __name__ == '__main__':
    if len(sys.argv) != 3 or not re.fullmatch('[0-9a-f]{40}', sys.argv[1]):
        raise SystemExit('usage: run-checks.py FULL_REV NEW_OUTPUT_JSON')
    revision, output = sys.argv[1], Path(sys.argv[2]).resolve()
    if output.exists():
        raise SystemExit('refusing existing output')
    prior = json.loads((LANE / '.ufo/waves/round-19/final/harm-at-measured.json').read_text())
    result = {'schema': 'tabi-round20-serial-checks-v1', 'revision': revision,
              'startedAt': datetime.now(timezone.utc).isoformat(), 'runs': [], 'errors': [],
              'producerPath': '.ufo/waves/round-20/run-checks.py', 'producerSha256': digest(__file__),
              'skipped': [{'gate': 'check-user-round-contract-production', 'knownExit': 1,
                           'reason': 'inherited reported failure; no rerun to confirm; history and gate not changed'}]}
    scratch = Path(tempfile.mkdtemp(prefix='tabi-r20-checks-'))
    try:
        fleet = scratch / 'fleet'
        clone(FLEET, fleet, prior['fleetRevision'], 'r20-fleet')
        lane = fleet / 'tabi-shokunin'
        clone(LANE, lane, revision, 'master')
        for name, pin in prior['siblingPins'].items():
            clone(FLEET / name, fleet / name, pin['tip'], pin['ref'])
        result['sandbox'] = {'fleetRevision': prior['fleetRevision'], 'siblingPins': prior['siblingPins'],
                             'statusBefore': git(lane, 'status', '--porcelain=v1', '-uall')}
        cohort = []
        for item in prior['runs']:
            if item['gate'] == 'check-user-round-contract-production':
                continue
            cohort.append({'gate': item['gate'], 'argv': item['argv'], 'expectedExit': item['exit'],
                           'producerPath': item['producer']['path'], 'kind': 'historical'})
        for name, path, flag in [('lifecycle', '.ufo/waves/round-20/measure-c1.mjs', '--selftest'),
                                 ('wave-provenance', '.ufo/waves/round-20/check-wave.mjs', '--selftest')]:
            cohort.append({'gate': name, 'argv': [NODE, path, flag], 'expectedExit': 0,
                           'producerPath': path, 'kind': 'round20'})
        for gate in cohort:
            argv = [str(fleet) if value == str(FLEET) else value for value in gate['argv']]
            row = dict(gate, argv=argv, producerSha256=digest(lane / gate['producerPath']))
            try:
                run = subprocess.run(argv, cwd=lane, env=ENV, capture_output=True, timeout=1200)
                row.update(exit=run.returncode, stdout=run.stdout.decode(errors='replace'),
                           stderr=run.stderr.decode(errors='replace'))
            except subprocess.TimeoutExpired as error:
                row.update(exit=None, stdout=(error.stdout or b'').decode(errors='replace'),
                           stderr=(error.stderr or b'').decode(errors='replace'), timedOut=True)
            row['pass'] = row['exit'] == row['expectedExit']
            result['runs'].append(row)
            print(row['gate'], row['exit'], 'expected', row['expectedExit'], flush=True)
        result['sandbox']['statusAfter'] = git(lane, 'status', '--porcelain=v1', '-uall')
        result['verdict'] = 'clean' if all(row['pass'] for row in result['runs']) else 'failed'
    except Exception as error:
        result['errors'].append(str(error))
        result['verdict'] = 'could-not-evaluate'
    finally:
        shutil.rmtree(scratch)
        result['completedAt'] = datetime.now(timezone.utc).isoformat()
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(json.dumps(result, indent=2) + '\n')
    raise SystemExit({'clean': 0, 'failed': 1, 'could-not-evaluate': 2}[result['verdict']])
