#!/usr/bin/env python3
"""Mutation harness for scripts/verify-live-r70.mjs (tabi r70, seat R70Mut2).

Trees (all under S):
  s/   byte-identical copy of the lane's scripts/ + corpus/evidence receipts + forger.mjs
  d/   s/ with the pinned r69 counter replaced by an exit-9 stub (counter-swap probe)
  e/   s/ with the r70 evidence receipt removed (missing-evidence probe, committed c1 shape)
  t/   control drivers: tampered copy of the r69 driver, byte-identical copy of the r69 driver

Every mutant is a single-line edit of verify-live-r70.mjs; the pristine file is never modified.
"""
import os, sys, json, hashlib, subprocess, difflib, shutil, concurrent.futures as cf

S = '/fast/scratch/hyaku/tabi-r70/R70Mut2'
NODE = shutil.which('node') or '/usr/bin/node'
S_PRISTINE_LINE = open(f'{S}/s/scripts/verify-live-r70.mjs').read()

MUTANTS = [
    # name, tree, lineno(1-based), expected old line, new line
    ('M01-digest-frozen-pin', 's', 169,
     "      driverDigest: !!r && r.driverSha256 === driverPin,",
     "      driverDigest: !!r && r.driverSha256 === prof.driverSha256,"),
    ('M02-digest-drop', 's', 169,
     "      driverDigest: !!r && r.driverSha256 === driverPin,",
     "      driverDigest: true,"),
    ('M03-counter-override-pin', 's', 136,
     "  const runCounter = (receipt, expectSha = prof.driverSha256) => {",
     "  const runCounter = (receipt, expectSha = driverPin) => {"),
    ('M04-counter-drop', 's', 176,
     "    if (c.exit !== 0) out.findings.push('counter-' + name);",
     "    if (false) out.findings.push('counter-' + name);"),
    ('M05-evidence-counter-drop', 'e', 146,
     "  if (ev.exit !== 0) out.findings.push('evidence-counter');",
     "  if (false) out.findings.push('evidence-counter');"),
    ('M06-nonce-drop', 's', 168,
     "      nonce: !!r && r.nonce === nonce && r.nonceOnPage === nonce,",
     "      nonce: true,"),
    ('M07-cdp-port-drop', 's', 170,
     "      cdpPort: argvList.includes('--remote-debugging-port=' + cdpPort),",
     "      cdpPort: true,"),
    ('M08-http-port-drop', 's', 171,
     "      httpPort: !!r && typeof r.fixture?.origin === 'string' && r.fixture.origin === 'http://127.0.0.1:' + httpPort,",
     "      httpPort: true,"),
    ('M09-cross-run-drop', 's', 181,
     "    if (!(ra.host?.launchToken && rb.host?.launchToken && ra.host.launchToken !== rb.host.launchToken && ra.nonce !== rb.nonce)) out.findings.push('cross-run-identity');",
     "    if (false) out.findings.push('cross-run-identity');"),
    ('M10-driver-pin-weaken', 's', 125,
     "  if (!/^[0-9a-f]{64}$/.test(driverPin) || out.driverSha256 !== driverPin) { out.findings.push('driver-pin'); return finish(2); }",
     "  if (!/^[0-9a-f]{64}$/.test(driverPin) || out.driverSha256 === null) { out.findings.push('driver-pin'); return finish(2); }"),
    ('M11-counter-pin-drop', 'd', 126,
     "  if (!/^[0-9a-f]{64}$/.test(prof.counterSha256) || out.counterSha256 !== prof.counterSha256) { out.findings.push('counter-pin'); return finish(2); }",
     "  if (!/^[0-9a-f]{64}$/.test(prof.counterSha256) || out.counterSha256 === null) { out.findings.push('counter-pin'); return finish(2); }"),
    ('M12-scratch-guard-weaken', 's', 133, 'sockLen > 107', 'sockLen > 9999'),
    ('M13-no-run-pass', 's', 135,
     "  if (flags.has('no-run')) { out.findings.push('no-run'); out.note = 'no-run control: the target is unreachable without executing the pinned driver'; return finish(1); }",
     "  if (flags.has('no-run')) { out.findings.push('no-run'); out.note = 'no-run control: the target is unreachable without executing the pinned driver'; return finish(0); }"),
    ('M14-override-is-pass', 's', 188,
     "  out.predicate = clean && out.pinSource === 'frozen';",
     "  out.predicate = clean;"),
    ('M15-exit4-collapse', 's', 189,
     "  return finish(out.predicate ? 0 : clean ? 4 : 1);",
     "  return finish(out.predicate ? 0 : clean ? 0 : 1);"),
    ('M16-tap-fingerprint-weaken', 's', 83,
     "          evs.filter((e) => e.type === 'click').map((e) => e.detail).join(','), l.cdpError === null ? null : String(l.cdpError).includes('Position out of bounds')];",
     "          l.cdpError === null ? null : String(l.cdpError).includes('Position out of bounds')];"),
    ('M17-evidence-agreement-drop', 's', 185,
     "  if (fa && fe) { out.agreement.evidence = JSON.stringify(fa) === JSON.stringify(fe); if (!out.agreement.evidence) out.findings.push('evidence-mismatch'); } else out.findings.push('evidence-unmeasurable');",
     "  if (fa && fe) { out.agreement.evidence = true; if (!out.agreement.evidence) out.findings.push('evidence-mismatch'); } else out.findings.push('evidence-unmeasurable');"),
]

def sha(p):
    return hashlib.sha256(open(p, 'rb').read()).hexdigest()

def generate():
    made = []
    for name, tree, lineno, old, new in MUTANTS:
        p = f'{S}/{tree}/scripts/verify-live-r70.mjs'
        src = open(p).read()
        ls = src.split('\n')
        if old not in ls[lineno - 1]:
            raise SystemExit(f'{name}: line {lineno} mismatch: {ls[lineno-1]!r}')
        if old not in new and new not in old and name != 'M12-scratch-guard-weaken':
            pass  # substring replacement is fine
        if name == 'M12-scratch-guard-weaken':
            assert ls[lineno - 1].count('sockLen > 107') == 1
            ls[lineno - 1] = ls[lineno - 1].replace('sockLen > 107', 'sockLen > 9999')
        else:
            ls[lineno - 1] = new
        mut = '\n'.join(ls)
        d = [x for x in difflib.unified_diff(src.split('\n'), mut.split('\n'), lineterm='', n=0)
             if (x.startswith('+') or x.startswith('-')) and not x.startswith(('+++', '---'))]
        if len(d) != 2:
            raise SystemExit(f'{name}: diff is not single-line: {d}')
        out = f'{S}/{tree}/scripts/mut-{name}.mjs'
        open(out, 'w').write(mut)
        made.append({'name': name, 'tree': tree, 'file': out, 'sha256': sha(out),
                     'pristine_sha256': sha(p), 'diff': d})
    return made

# ---------- detectors ----------
FSHA = sha(f'{S}/s/forger.mjs')
EV69 = f'{S}/s/corpus/evidence/round69/chromium-synth-scroll-gesture/receipt.json'
EV70 = f'{S}/s/corpus/evidence/round70/chromium-synth-tap-gesture/receipt.json'
FROZEN69 = '13ea3f8ae67fb7761a94c4763e575c9ee487905dd9b405d916d55fca562abce3'
LONG = S + '/x/' + 'L' * 60

def det(name, tree, args, env=None, expected=None, live=False, variant='committed'):
    return {'det': name, 'tree': tree, 'args': args, 'env': env or {},
            'expected': expected, 'live': live, 'variant': variant}

DETS = {
 'norun': det('norun', 's', ['--profile', 'synthscroll-r69', '--scratch', S + '/x/a1', '--no-run', '--json'],
              expected={'exit': 1, 'findings': ['no-run']}),
 'replay': det('replay', 's', ['--profile', 'synthscroll-r69', '--scratch', S + '/x/a2',
              '--driver', f'{S}/s/forger.mjs', '--driver-sha256', FSHA, '--json'],
              env={'FORGER_MODE': 'replay', 'FORGER_SOURCE': EV69},
              expected={'exit': 1, 'findings': ['run-a-nonce', 'run-b-nonce']}),
 'rewrite': det('rewrite', 's', ['--profile', 'synthscroll-r69', '--scratch', S + '/x/a3',
              '--driver', f'{S}/s/forger.mjs', '--driver-sha256', FSHA, '--json'],
              env={'FORGER_MODE': 'rewrite', 'FORGER_SOURCE': EV69},
              expected={'exit': 1, 'findings': ['run-a-cdpPort', 'run-a-httpPort', 'cross-run-identity']}),
 'rwfull-lie': det('rwfull-lie', 's', ['--profile', 'synthscroll-r69', '--scratch', S + '/x/a4',
              '--driver', f'{S}/s/forger.mjs', '--driver-sha256', FSHA, '--json'],
              env={'FORGER_MODE': 'rewrite-full', 'FORGER_SOURCE': EV69, 'FORGER_CLAIM_SHA': FROZEN69},
              expected={'exit': 1, 'findings': ['run-a-driverDigest', 'run-b-driverDigest']}),
 'rwfull-honest': det('rwfull-honest', 's', ['--profile', 'synthscroll-r69', '--scratch', S + '/x/a5',
              '--driver', f'{S}/s/forger.mjs', '--driver-sha256', FSHA, '--json'],
              env={'FORGER_MODE': 'rewrite-full', 'FORGER_SOURCE': EV69},
              expected={'exit': 1, 'findings': ['counter-a', 'counter-b']}),
 'scratch-long': det('scratch-long', 's', ['--profile', 'synthscroll-r69', '--scratch', LONG,
              '--driver', f'{S}/s/forger.mjs', '--driver-sha256', FSHA, '--json'],
              env={'FORGER_MODE': 'replay', 'FORGER_SOURCE': EV69},
              expected={'exit': 2, 'findings': ['scratch-path-too-long']}, variant='adapted-committed'),
 'tap-no-evidence': det('tap-no-evidence', 'e', ['--profile', 'synthtap-r70', '--scratch', S + '/x/a6',
              '--driver', f'{S}/s/forger.mjs', '--driver-sha256', FSHA, '--json'],
              env={'FORGER_MODE': 'replay', 'FORGER_SOURCE': EV70},
              expected={'exit': 1, 'findings': ['evidence-counter']}, variant='committed-shape(c1/donothing-live-no-evidence)'),
 'tap-rewrite': det('tap-rewrite', 's', ['--profile', 'synthtap-r70', '--scratch', S + '/x/a7',
              '--driver', f'{S}/s/forger.mjs', '--driver-sha256', FSHA, '--json'],
              env={'FORGER_MODE': 'rewrite', 'FORGER_SOURCE': EV70},
              expected={'exit': 1, 'findings': ['run-a-cdpPort', 'run-a-httpPort', 'cross-run-identity']}),
 'counter-swap': det('counter-swap', 'd', ['--profile', 'synthscroll-r69', '--scratch', S + '/x/a8',
              '--driver', f'{S}/s/forger.mjs', '--driver-sha256', FSHA, '--json'],
              env={'FORGER_MODE': 'replay', 'FORGER_SOURCE': EV69},
              expected={'exit': 2, 'findings': ['counter-pin']}, variant='derived(counter swapped)'),
 'degenerate': det('degenerate', 's', ['--profile', 'synthscroll-r69', '--scratch', S + '/x/a9',
              '--driver', f'{S}/s/forger.mjs', '--driver-sha256', FSHA, '--json'],
              env={'FORGER_MODE': 'degenerate', 'FORGER_DRIVER': f'{S}/s/scripts/chrome-cdp-synthscroll-round69.mjs',
                   'FORGER_DEG': 'js-scroll'},
              expected={'exit': 1, 'findings': ['counter-a', 'counter-b']}, live=True),
 'tampered': det('tampered', 's', ['--profile', 'synthscroll-r69', '--scratch', S + '/x/b1',
              '--driver', f'{S}/t/tampered-r69.mjs', '--driver-sha256', FROZEN69, '--json'],
              expected={'exit': 2, 'findings': ['driver-pin']}, live=True),
 'override': det('override', 's', ['--profile', 'synthscroll-r69', '--scratch', S + '/x/b2',
              '--driver', f'{S}/t/copy-r69.mjs', '--driver-sha256', FROZEN69, '--json'],
              expected={'exit': 4, 'findings': []}, live=True),
}

MAP = [('M01-digest-frozen-pin', 'rwfull-lie'), ('M02-digest-drop', 'rwfull-lie'),
       ('M03-counter-override-pin', 'rwfull-honest'), ('M04-counter-drop', 'rwfull-honest'),
       ('M05-evidence-counter-drop', 'tap-no-evidence'), ('M06-nonce-drop', 'replay'),
       ('M07-cdp-port-drop', 'rewrite'), ('M08-http-port-drop', 'rewrite'),
       ('M09-cross-run-drop', 'rewrite'), ('M10-driver-pin-weaken', 'tampered'),
       ('M11-counter-pin-drop', 'counter-swap'), ('M12-scratch-guard-weaken', 'scratch-long'),
       ('M13-no-run-pass', 'norun'), ('M14-override-is-pass', 'override'),
       ('M15-exit4-collapse', 'override'), ('M16-tap-fingerprint-weaken', 'tap-rewrite'),
       ('M17-evidence-agreement-drop', 'degenerate')]

def run_verifier(tree, script_name, d, who, uniq=False):
    script = f'{S}/{tree}/scripts/{script_name}'
    env = os.environ.copy()
    env.update(d['env'])
    args = list(d['args'])
    if uniq:
        code = {'pristine': 'P', 'restored': 'R'}.get(who, who.split('-')[0])
        tag = f"{d['det'][:3]}{code}"
        scratch = f'{S}/x/{tag}'
        try:
            i = args.index('--scratch')
            args[i + 1] = scratch
        except ValueError:
            pass
    else:
        args = list(d['args'])
    t0 = __import__('time').time()
    try:
        p = subprocess.run([NODE, script] + args, capture_output=True, text=True, env=env,
                           timeout=420, cwd=S)
        raw_out, raw_err, rc = p.stdout, p.stderr, p.returncode
    except subprocess.TimeoutExpired as e:
        raw_out, raw_err, rc = (e.stdout or ''), (e.stderr or ''), 'timeout'
    wall = round(__import__('time').time() - t0, 2)
    try:
        j = json.loads(raw_out)
    except Exception:
        j = None
    rec = {'detector': d['det'], 'who': who, 'tree': tree, 'script': script, 'exit': rc,
           'wallS': wall, 'predicate': j.get('predicate') if j else None,
           'findings': j.get('findings') if j else None,
           'pinSource': j.get('pinSource') if j else None,
           'runs': [{k: r.get(k) for k in ('name', 'exit', 'counterExit', 'wallMs', 'nonce')} for r in (j.get('runs') or [])] if j else None,
           'stderr_tail': raw_err[-400:] if rc not in (0, 1, 2, 4) or not j else '',
           'expected': d['expected'], 'variant': d['variant'],
           'raw_stdout': raw_out if not j else None}
    if d['expected'] is not None:
        ids = rec['findings'] or []
        rec['holds'] = (rec['exit'] == d['expected']['exit']
                        and all(f in ids for f in d['expected']['findings']))
    return rec

def main():
    os.makedirs(f'{S}/results', exist_ok=True)
    os.makedirs(f'{S}/x', exist_ok=True)
    if '--generate' in sys.argv or True:
        made = generate()
        json.dump(made, open(f'{S}/results/mutants.json', 'w'), indent=1)
        print(f'generated {len(made)} mutants, single-line diffs verified')
        for m in made:
            print(m['name'], m['sha256'][:12], m['pristine_sha256'][:12])
    phase = sys.argv[1] if len(sys.argv) > 1 else 'fast'
    live_dets = {'tampered', 'override', 'degenerate'}
    if phase == 'fast':
        dets = [k for k in DETS if k not in ('tampered', 'override', 'degenerate')]
        jobs = [(dets, None)]
    else:
        dets = sorted(live_dets)
        jobs = None

    results = []
    if phase == 'fast':
        for dn in dets:
            d = DETS[dn]
            base = run_verifier(d['tree'], 'verify-live-r70.mjs', d, 'pristine')
            results.append(base)
            for mn, mdet in MAP:
                if mdet == dn:
                    rec = run_verifier(d['tree'], f'mut-{mn}.mjs', d, mn)
                    results.append(rec)
            restored = run_verifier(d['tree'], 'verify-live-r70.mjs', d, 'restored')
            results.append(restored)
    else:
        # live detectors in parallel; pristine, mutants, restored per detector
        tasks = []
        for dn in dets:
            d = DETS[dn]
            tasks.append((dn, 'pristine', None, d))
            for mn, mdet in MAP:
                if mdet == dn:
                    tasks.append((dn, mn, mn, d))
            tasks.append((dn, 'restored', None, d))
        with cf.ThreadPoolExecutor(max_workers=4) as ex:
            futs = {ex.submit(run_verifier, DETS[dn]['tree'],
                              'verify-live-r70.mjs' if mn is None else f'mut-{mn}.mjs', d, who, True): (dn, who)
                    for dn, who, mn, d in tasks}
            for f in cf.as_completed(futs):
                results.append(f.result())
    results.sort(key=lambda r: (r['detector'], {'pristine': 0, 'restored': 2}.get(r['who'], 1), r['who']))
    out = f'{S}/results/{phase}.json'
    json.dump(results, open(out, 'w'), indent=1)
    print(f'wrote {out} ({len(results)} invocations)')
    for r in results:
        print(f"{r['detector']:16s} {r['who']:22s} exit={r['exit']} pred={r['predicate']} "
              f"wall={r['wallS']:6.2f} holds={r.get('holds')} findings={','.join(r['findings'] or [])[:120]}")

if __name__ == '__main__':
    main()
