#!/usr/bin/env python3
"""Serial, immutable-revision checks after all round22 seats return.
Known-red USER production is deliberately excluded; historical gate fixtures run
only in a disposable pinned fleet, never mutating the lane index or jj state.
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
ENV = {'PATH': str(Path(NODE).parent) + ':' + os.environ['PATH'],
       'HOME': os.environ['HOME'], 'LANG': 'C', 'GIT_CONFIG_NOSYSTEM': '1',
       'GIT_CONFIG_GLOBAL': '/dev/null', 'GIT_NO_REPLACE_OBJECTS': '1',
       'GIT_NO_LAZY_FETCH': '1', 'GIT_TERMINAL_PROMPT': '0'}
BASE = '5f585773258b33d2d514b00cd0b0775333578db6'


def git(root, *args):
    return subprocess.check_output(['git', '-C', str(root), *args], env=ENV).decode().strip()


def clone(source, target, revision, branch):
    subprocess.run(['git', 'clone', '--quiet', '--no-hardlinks', str(source), str(target)], env=ENV, check=True)
    subprocess.run(['git', '-C', str(target), 'switch', '--quiet', '--detach', revision], env=ENV, check=True)
    subprocess.run(['git', '-C', str(target), 'branch', '-f', branch, revision], env=ENV, check=True)
    subprocess.run(['git', '-C', str(target), 'switch', '--quiet', branch], env=ENV, check=True)


def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


if __name__ == '__main__':
    if len(sys.argv) != 3 or not re.fullmatch('[0-9a-f]{40}', sys.argv[1]):
        raise SystemExit('usage: run-checks.py FULL_REV NEW_OUTPUT_JSON')
    revision, output = sys.argv[1], Path(sys.argv[2]).resolve()
    if output.exists():
        raise SystemExit('refusing existing output')
    cohort_bytes = subprocess.check_output(['git', '-C', str(LANE), 'show',
                                           revision + ':.ufo/waves/round-19/final/harm-at-measured.json'], env=ENV)
    historical = json.loads(cohort_bytes)
    result = {'schema': 'tabi-round22-serial-checks-v1', 'revision': revision, 'baseline': BASE,
              'startedAt': datetime.now(timezone.utc).isoformat(), 'runs': [], 'errors': [],
              'producerPath': '.ufo/waves/round-22/run-checks.py', 'producerSha256': digest(__file__),
              'cohortSource': '.ufo/waves/round-19/final/harm-at-measured.json',
              'cohortSourceSha256': hashlib.sha256(cohort_bytes).hexdigest(),
              'skipped': [{'gate': 'check-user-round-contract-production', 'knownExit': 1,
                           'reason': 'reported inherited failure; not rerun; original history/gate unchanged'}]}
    scratch = Path(tempfile.mkdtemp(prefix='tabi-r22-checks-'))
    try:
        fleet = scratch / 'fleet'
        clone(FLEET, fleet, historical['fleetRevision'], 'r22-fleet')
        lane = fleet / 'tabi-shokunin'
        clone(LANE, lane, revision, 'master')
        for name, pin in historical['siblingPins'].items():
            clone(FLEET / name, fleet / name, pin['tip'], pin['ref'])
        result['sandbox'] = {'fleetRevision': historical['fleetRevision'], 'siblingPins': historical['siblingPins'],
                             'statusBefore': git(lane, 'status', '--porcelain=v1', '-uall')}
        frozen = json.loads((lane / '.ufo/waves/round-22/preservation-baseline.json').read_text())
        tree = {}
        for entry in subprocess.check_output(['git', '-C', str(lane), 'ls-tree', '-r', '-z', revision], env=ENV).split(b'\0'):
            if entry:
                metadata, path = entry.split(b'\t', 1)
                mode, kind, oid = metadata.decode().split()
                tree[path.decode()] = (mode, oid)
        mismatches = [item['path'] for item in frozen['files']
                      if tree.get(item['path']) != (item['mode'], item['gitBlob'])]
        prefixes = {}
        for path in frozen['mutableDocs']:
            if path != 'corpus/SOURCES.md':
                before = subprocess.check_output(['git', '-C', str(lane), 'show', BASE + ':' + path], env=ENV)
                prefixes[path] = (lane / path).read_bytes().startswith(before)
        changed = git(lane, 'diff', '--name-status', '--no-renames', BASE, revision).splitlines()
        allowed_new = ('.ufo/waves/round-22/', 'corpus/evidence/round-22/',
                       'corpus/knowledge/webmcp-lifecycle-oracle-round-22.md', 'corpus/lessons/round-22.md')
        scope_errors = [line for line in changed if line.split('\t', 1)[0] not in ('A', 'M')
                        or '/clones/' in line or (line.split('\t', 1)[1] not in frozen['mutableDocs']
                        and not (line.startswith('A\t') and line.split('\t', 1)[1].startswith(allowed_new)))]
        def source_rows(text):
            return {cells[1].strip(): cells for line in text.splitlines()
                    if re.match(r'^\|\s*S\d{3,}\s*\|', line) for cells in [line.split('|')]}
        sources_before = source_rows(subprocess.check_output(['git', '-C', str(lane), 'show', BASE + ':corpus/SOURCES.md'], env=ENV).decode())
        sources_after = source_rows((lane / 'corpus/SOURCES.md').read_text())
        source_errors = []
        if sources_before.keys() != sources_after.keys():
            source_errors.append('row_set')
        for key, cells in sources_before.items():
            after_cells = sources_after.get(key, [])
            if key == 'S101' and len(after_cells) == len(cells):
                if cells[:11] + cells[12:] != after_cells[:11] + after_cells[12:]:
                    source_errors.append(key + ':immutable_cells')
                if after_cells[11].strip() != cells[11].strip() + ', corpus/knowledge/webmcp-lifecycle-oracle-round-22.md':
                    source_errors.append(key + ':used_by')
            elif cells != after_cells:
                source_errors.append(key)
        result['preservation'] = {'baseline': BASE, 'files': len(frozen['files']), 'mismatches': mismatches,
                                  'prefixes': prefixes, 'scopeErrors': scope_errors, 'sourceErrors': source_errors,
                                  'gitlinks': [path for path, value in tree.items() if value[0] == '160000']}
        if mismatches or not all(prefixes.values()) or scope_errors or source_errors or result['preservation']['gitlinks']:
            raise RuntimeError('historical preservation or changed-path scope failed')
        cohort = []
        for item in historical['runs']:
            if item['gate'] != 'check-user-round-contract-production':
                cohort.append({'gate': item['gate'], 'argv': item['argv'], 'expectedExit': item['exit'],
                               'producerPath': item['producer']['path'], 'kind': 'historical'})
        for name, path in [('oracle22-selftest', '.ufo/waves/round-22/measure-c1.mjs'),
                           ('chronology22-selftest', '.ufo/waves/round-22/check-review-chronology.mjs'),
                           ('lifecycle21-selftest', '.ufo/waves/round-21/measure-c1.mjs'),
                           ('lifecycle20-selftest', '.ufo/waves/round-20/measure-c1.mjs'),
                           ('wave20-selftest', '.ufo/waves/round-20/check-wave.mjs')]:
            cohort.append({'gate': name, 'argv': [NODE, path, '--selftest'], 'expectedExit': 0,
                           'producerPath': path, 'kind': 'finite-selftest'})
        cohort.append({'gate': 'historical-review-scope-red',
                       'argv': [NODE, '.ufo/waves/round-22/check-review-chronology.mjs',
                                '.ufo/waves/round-22/historical-chronology-input.json'],
                       'expectedExit': 1, 'producerPath': '.ufo/waves/round-22/check-review-chronology.mjs',
                       'kind': 'actual-retained-scope',
                       'expectedMetrics': {'verdict': 'review_scope_gap', 'finding': 'review_scope_gap'}})
        counter = '.ufo/waves/round-22/measure-c1.mjs'
        for name, target, count, verdict in [('before', BASE, 0, 'baseline'), ('after', revision, 12, 'clean')]:
            cohort.append({'gate': 'c1-' + name, 'argv': [NODE, counter, target], 'expectedExit': 0,
                           'producerPath': counter, 'kind': 'measurement',
                           'expectedMetrics': {'c1_semantically_checked_lifecycle_rows': count, 'verdict': verdict}})
        for name, path, metric in [('lifecycle21-after', '.ufo/waves/round-21/measure-c1.mjs', 'c1_lifecycle_observations'),
                                    ('lifecycle20-after', '.ufo/waves/round-20/measure-c1.mjs', 'c1_lifecycle_decisions')]:
            cohort.append({'gate': name, 'argv': [NODE, path, revision], 'expectedExit': 0,
                           'producerPath': path, 'kind': 'no-harm', 'expectedMetrics': {metric: 12, 'verdict': 'clean'}})
        for name, target, knowledge in [('before', BASE, 40), ('after', revision, 41)]:
            cohort.append({'gate': 'curation-' + name, 'argv': [NODE, '.ufo/waves/round-20/counts.mjs', target],
                           'expectedExit': 0, 'producerPath': '.ufo/waves/round-20/counts.mjs', 'kind': 'census',
                           'expectedMetrics': {'rows': 101, 'knowledge': knowledge,
                                               'tiers': {'A': 88, 'B': 4, 'C': 9},
                                               'statuses': {'mined': 73, 'queued': 19, 'rejected': 9}}})
        cohort.append({'gate': 'lesson-history-only', 'argv': [NODE, '.ufo/waves/round-20/lesson-history.mjs', revision],
                       'expectedExit': 0, 'producerPath': '.ufo/waves/round-20/lesson-history.mjs', 'kind': 'no-harm',
                       'expectedMetrics': {'refused': ['corpus/lessons/round-18.md', 'corpus/lessons/round-19.md']}})
        for gate in cohort:
            argv = [str(fleet) if value == str(FLEET) else value for value in gate['argv']]
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
