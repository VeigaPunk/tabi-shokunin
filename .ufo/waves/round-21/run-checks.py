#!/usr/bin/env python3
"""After all seats return, verify one pinned revision in disposable Git clones.
Never rerun the inherited known-red USER production gate merely to confirm it.
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
BASE = 'e7cf11a810003d4a65cc85bd265f2c17dd65b738'

def git(root, *args):
    return subprocess.check_output(['git', '-C', str(root), *args], env=ENV).decode().strip()

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
    historical = json.loads((LANE / '.ufo/waves/round-19/final/harm-at-measured.json').read_text())
    result = {'schema': 'tabi-round21-serial-checks-v1', 'revision': revision, 'baseline': BASE,
              'startedAt': datetime.now(timezone.utc).isoformat(), 'runs': [], 'errors': [],
              'producerPath': '.ufo/waves/round-21/run-checks.py', 'producerSha256': digest(__file__),
              'cohortSource': '.ufo/waves/round-19/final/harm-at-measured.json',
              'cohortSourceSha256': digest(LANE / '.ufo/waves/round-19/final/harm-at-measured.json'),
              'skipped': [{'gate': 'check-user-round-contract-production', 'knownExit': 1,
                           'reason': 'inherited reported failure; not rerun; history and gate unchanged'}]}
    scratch = Path(tempfile.mkdtemp(prefix='tabi-r21-checks-'))
    try:
        fleet = scratch / 'fleet'
        clone(FLEET, fleet, historical['fleetRevision'], 'r21-fleet')
        lane = fleet / 'tabi-shokunin'
        clone(LANE, lane, revision, 'master')
        for name, pin in historical['siblingPins'].items():
            clone(FLEET / name, fleet / name, pin['tip'], pin['ref'])
        result['sandbox'] = {'fleetRevision': historical['fleetRevision'], 'siblingPins': historical['siblingPins'],
                             'statusBefore': git(lane, 'status', '--porcelain=v1', '-uall')}
        identity_paths = [
            '.ufo/waves/round-21/measure-c1.mjs', '.ufo/waves/round-21/selftest-c1.mjs',
            '.ufo/waves/round-21/fixtures/expected.json', '.ufo/waves/round-21/fixtures/positive-ordered.json',
            'scripts/webmcp-lifecycle-round21.mjs', 'corpus/evidence/round-21/runtime/receipt.json',
            'corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md', 'SKILL.md', 'corpus/SOURCES.md',
            '.ufo/waves/round-21/source-opening.json', '.ufo/waves/round-21/sources/html_form_element.cc',
            '.ufo/waves/round-21/sources/html_form_element.cc.base64.gz',
            '.ufo/waves/round-21/fixtures/source-carrier.gz', '.ufo/waves/round-21/runtime-execution-finalized.json',
        ]
        result['artifactSha256'] = {path: digest(lane / path) for path in identity_paths}
        cohort = []
        for item in historical['runs']:
            if item['gate'] != 'check-user-round-contract-production':
                cohort.append({'gate': item['gate'], 'argv': item['argv'], 'expectedExit': item['exit'],
                               'producerPath': item['producer']['path'], 'kind': 'historical'})
        for name, path, flag in [('lifecycle21-selftest', '.ufo/waves/round-21/measure-c1.mjs', '--selftest'),
                                 ('lifecycle20-selftest', '.ufo/waves/round-20/measure-c1.mjs', '--selftest'),
                                 ('wave20-selftest', '.ufo/waves/round-20/check-wave.mjs', '--selftest')]:
            cohort.append({'gate': name, 'argv': [NODE, path, flag], 'expectedExit': 0,
                           'producerPath': path, 'kind': 'finite-selftest'})
        counter = '.ufo/waves/round-21/measure-c1.mjs'
        for name, target, count, verdict in [('before', BASE, 0, 'baseline'), ('after', revision, 12, 'clean')]:
            cohort.append({'gate': 'c1-' + name, 'argv': [NODE, counter, target], 'expectedExit': 0,
                           'producerPath': counter, 'kind': 'measurement',
                           'expectedMetrics': {'c1_lifecycle_observations': count, 'verdict': verdict}})
        cohort.append({'gate': 'lifecycle20-after', 'argv': [NODE, '.ufo/waves/round-20/measure-c1.mjs', revision],
                       'expectedExit': 0, 'producerPath': '.ufo/waves/round-20/measure-c1.mjs', 'kind': 'no-harm',
                       'expectedMetrics': {'c1_lifecycle_decisions': 12, 'verdict': 'clean'}})
        for name, target, rows, knowledge in [('before', BASE, 100, 38), ('after', revision, 101, 40)]:
            cohort.append({'gate': 'curation-' + name, 'argv': [NODE, '.ufo/waves/round-20/counts.mjs', target],
                           'expectedExit': 0, 'producerPath': '.ufo/waves/round-20/counts.mjs', 'kind': 'census',
                           'expectedMetrics': {'rows': rows, 'knowledge': knowledge}})
        for gate in cohort:
            argv = [str(fleet) if v == str(FLEET) else v for v in gate['argv']]
            row = dict(gate, argv=argv, producerSha256=digest(lane / gate['producerPath']))
            try:
                run = subprocess.run(argv, cwd=lane, env=ENV, capture_output=True, timeout=1200)
                row.update(exit=run.returncode, stdout=run.stdout.decode(errors='replace'), stderr=run.stderr.decode(errors='replace'))
            except subprocess.TimeoutExpired as error:
                row.update(exit=None, stdout=(error.stdout or b'').decode(errors='replace'), stderr=(error.stderr or b'').decode(errors='replace'), timedOut=True)
            row['pass'] = row['exit'] == row['expectedExit']
            if 'expectedMetrics' in row:
                try:
                    row['observedMetrics'] = json.loads(row['stdout'])
                    row['pass'] = row['pass'] and all(row['observedMetrics'].get(k) == v for k, v in row['expectedMetrics'].items())
                except (ValueError, AttributeError):
                    row['pass'] = False
            result['runs'].append(row)
            print(row['gate'], row['exit'], 'expected', row['expectedExit'], 'pass', row['pass'], flush=True)
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
