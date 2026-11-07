#!/usr/bin/env python3
"""Builds .ufo/waves/round-81/w1-spec.json (tabi round 81, one v1 wave of 11 seats).
Reads the freeze facts (D, pins, nonce) from committed files so nothing is hand-transcribed.
QUALITY 146/151: every item must carry the seat-output rule (JSON outputs and receipts under
.ufo/waves/round-81-seats/<name>/, never inside the walked trees); the builder refuses a spec in
which any item lacks it.  `python3 build-spec.py --selfcheck` shows the refusal on a crafted item."""
import json, pathlib, re, sys
L = '/home/vgpnk/Projects/shokunin/tabi-shokunin'
R = L + '/.ufo/waves/round-81'
W = R + '/w1'
SEATS = L + '/.ufo/waves/round-81-seats'
SC = '/fast/scratch/hyaku/tabi-r81'
SEAT_RULE_MARK = 'SEAT-OUTPUT RULE'

def seat_rule(name):
    return (f"{SEAT_RULE_MARK}: write every JSON output, receipt or crafted receipt ONLY under {SEATS}/{name}/ "
            f"(mkdir -p it); never write a .json, a receipt or any file containing the receipt schema string under {R}/ "
            f"or {L}/corpus/evidence/round81/ -- those are the counter's walked trees and a file there changes other seats' verdicts. "
            f"Your prose report alone goes to {W}/{name}/report.md.")

def check_items(items):
    bad = [it['name'] for it in items if seat_rule(it['name']) not in it['prompt']]
    if bad:
        raise SystemExit('REFUSED: items without the seat-output rule: ' + ', '.join(bad))

if '--selfcheck' in sys.argv:
    good = {'name': 'SelfGood', 'prompt': 'x ' + seat_rule('SelfGood')}
    crafted = {'name': 'SelfBad', 'prompt': 'write your receipt to ' + W + '/SelfBad/receipt.json'}
    check_items([good]); print('accepted: [SelfGood]')
    try:
        check_items([good, crafted])
        print('NOT REFUSED (the check is broken)'); sys.exit(1)
    except SystemExit as e:
        print(e); sys.exit(0)

DIRECTIVE = pathlib.Path('/home/vgpnk/.agents/skills/godspeed/directive.md').read_text()
FZ = pathlib.Path(R + '/freeze.txt').read_text()
pins = dict((p, h) for h, p in re.findall(r'^([0-9a-f]{64})  (\S+)$', FZ, re.M))
PIN_DRV = pins['scripts/chrome-cdp-showpicker-round81.mjs']
PIN_CTR = pins['scripts/check-showpicker-r81.mjs']
PIN_BAT = pins['scripts/negatives-showpicker-r81.mjs']
PIN_KP = pins['scripts/kill-power-r81.mjs']
PIN_ST = pins['scripts/selftest-r81-gates.mjs']
PIN_DRIFT = pins['scripts/check-record-drift-r81.mjs']
D = pathlib.Path(R + '/scored/digests-commit.txt').read_text().split()[0]
D12 = D[:12]
NA = 'tabi-r81-l1-' + D12
EV = L + '/corpus/evidence/round81/chromium-showpicker/receipt.json'
C1D = R + '/controls/c1'
PS = C1D + '/prior-set.txt'
CTR = f'node {L}/scripts/check-showpicker-r81.mjs --lane {L}'

COMMON = f"""# Target
Tabi round 81, one v1 wave w1. L1 TabiR81 holds the planner seat and is the sole integration owner. Lane {L}; base c27e8406e6a2dc3cafcff030c9224cf8a14e3464. Claims FROZEN in {R}/claims.json; instrument digests in {R}/freeze.txt, digests commit D = {D}. Never propose amending the predicate, counter, pins, priors, thresholds or kill rule; attack them.
C1 coverage, capability `chromium-showpicker-linux` generation r81: `HTMLInputElement.showPicker()` under `Page.setInterceptFileChooserDialog` on Chromium 155.0.8059.84 --headless=new (/usr/bin/chromium). One fresh browser per leg (6 legs): (1) a cross-origin iframe's own `type=date` input throws SecurityError "showPicker() called from cross-origin iframe." and opens nothing; (2) the SAME call on a DISABLED `type=date` input is SecurityError cross-origin but InvalidStateError same-origin (Chromium checks the origin before mutability; the spec orders mutability first) — the order discriminator; (3) `DOM.setFileInputFiles` naming a DIRECTORY answers a `webkitdirectory` input: its files arrive with `webkitRelativePath` set and trusted input+change fire; (4) a `.txt` answered into an `accept=".png"` input is ACCEPTED (accept filters the dialog, not a programmatic answer); (5) a REAL CLICK on an input whose picker is already open opens a SECOND chooser.
C2 calibration: record drift — `{L}/scripts/check-record-drift-r81.mjs` counts mismatches between the lane's records and the committed bytes: the ten routed defects the round-80 non-author spot-check owed to r81 (append-only directional corrections) plus a self-drift identity leg (nonce/D) and a numbers leg. Before 12 mismatches, after 0.
Counting command: {CTR} --receipt <receipt> --expect-driver-sha256 {PIN_DRV} --expect-nonce <nonce> --expect-fixture-sha256 <fixture sha256 of that receipt> --prior-set {PS} [--prior ...] [--tree-exempt-sha256 <hex>] --json
Predicate C1-SHOWPICKER-R81: (a) L1 post-D scored run, nonce {NA}, counter exit 0 clean (56 checks) with the committed prior set, receipt {EV}; (b) cold-run acceptance: every committed cold run after D exits 0 clean under the counter with its own nonce and the committed prior set — target ZERO honest refusals in at least 3 fresh cold runs; (c) battery exit 0 allOk (62 cases, coverage.uncovered []) AND kill power holds (46 mutants, 0 survivors, 0 crashed) on the (a) receipt; (d) capability row generation r81 + note {L}/corpus/knowledge/chromium-showpicker-runtime-round-81.md citing the new rows + SKILL gate registry + `node {L}/scripts/selftest-r81-gates.mjs --lane {L} --work <scratch> --json` exit 0.
C2-RECORDDRIFT-R81: `node {L}/scripts/check-record-drift-r81.mjs --lane {L} --json` exits 0 with mismatches 0 (before: exit 1, 12 mismatches, {R}/lesson-proof/c2-before.json); every stale statement is still present (append-only) and a directional correction names it with the corrected value; the self-drift identity leg reads the final nonce/D; the numbers leg equals the committed scored outputs.
# Bounds
Read-only seats return findings; no seat commits, pushes, or runs a mutating git/jj command anywhere. Never write into the walked trees ({R}, {L}/corpus/evidence/round81). Scratch root: {SC}/<your seat name>/ (mkdir -p it, delete it before you yield, receipts copied into your seat dir first). /tmp is for files under 50 MB only. Tooling authorization (operator, 2026-10-19): you may install or upgrade tools that help the task; read /home/vgpnk/.omp/agent/RULES.md first (official channels, update-safety gate, record tool/version/channel/reason in your report). PACMAN GUARD: all pacman transactions are PAUSED host-wide; install via `uv tool`/`npx`/an official binary in ~/.local/bin, or file an L0 question. Never mutate host sysctls. Every `Report:` trailer path is relative to {L} — write it at {L}/<that path>. Never message agent://all; message only the L1 (TabiR81) by id.
"""

def item(name, role, axes, milestone, body):
    return {'name': name, 'role': role, 'axes': axes, 'milestone': milestone,
            'prompt': DIRECTIVE + '\n# Assignment\n' + body + '\n' + COMMON + '\n' + seat_rule(name) + '\n'}

items = [
    item('R81Exec1', 'executor', ['coverage'],
         'Leg (b): two independent cold runs of the frozen driver, scored by the frozen counter',
         f"""Run the frozen driver TWICE with fresh nonces and score each receipt:
`node {L}/scripts/chrome-cdp-showpicker-round81.mjs --lane {L} --nonce tabi-r81-cold1-{D12} --scratch {SC}/R81Exec1 --out {SEATS}/R81Exec1/cold1.json --http-port 19260 --cdp-port 19261 --child-port 19262`
then the same with `--nonce tabi-r81-cold2-{D12}` / `cold2.json` / ports 19263/19264/19265.
Score each: `{CTR} --receipt <receipt> --expect-driver-sha256 {PIN_DRV} --expect-nonce <its nonce> --expect-fixture-sha256 <its fixture.sha256> --prior-set {PS} --prior {EV} --json` (the scored receipt {EV} may not exist yet when you run; if so use `--prior {C1D}/probes/tabi-r81-probe2.json` instead and say so).
Also re-run the counter on the scored receipt {EV} with `--prior <your cold1>` if it exists, to prove the prior set still accepts it.
Record every exit code and finding id in {SEATS}/R81Exec1/ledger.txt. A refusal is a finding to report, never to hide: name the exact finding id and the field it names."""),
    item('R81Exec2', 'executor', ['coverage'],
         'Leg (b): a third cold run, plus a cold run under a scratch path containing a space',
         f"""Run the frozen driver twice more (nonces `tabi-r81-cold3-{D12}`, `tabi-r81-cold4-{D12}`, ports 19266/19267/19268 and 19269/19270/19271) into {SEATS}/R81Exec2/, score both with the frozen counter (`--prior {C1D}/probes/tabi-r81-probe2.json`), and additionally run ONE of them with `--scratch` under a path with a space in it (e.g. `{SC}/R81Exec2/scratch with space`) to test the driver's absolute-path handling.
Report per-run: nonce, exit, verdict, checkCount, findings, and the fixture sha256. Any honest refusal is a leg (b) failure: report it with the finding id and the receipt path."""),
    item('R81Exec3', 'executor', ['coverage'],
         'Frontier probe (not a claim): is the SECOND chooser (click-while-open) answerable, and does it carry the same backendNodeId?',
         f"""Write a probe (your own file under {SEATS}/R81Exec3/, never in scripts/) that reuses the frozen driver's plumbing by copying it and changing ONLY the leg list, then answer:
1. On the click-while-open leg, the second `Page.fileChooserOpened` event: what is its `backendNodeId` relative to the first, and does `DOM.setFileInputFiles` on the SECOND event's id deliver files to `#s` (state + input/change events)?
2. Does answering the FIRST chooser while the second is pending succeed, fail, or race?
Paste the raw per-leg JSON into {SEATS}/R81Exec3/probe.json and state each answer with the exact field path. Do not claim these as capability legs; they are frontier evidence for r82."""),
    item('R81Review1', 'reviewer', ['coverage'],
         'Attack C1 legs (a)-(d): re-run the counting command, re-derive the pins, hunt false greens',
         f"""Independently re-run `{CTR} --receipt {C1D}/probes/tabi-r81-probe2.json --expect-driver-sha256 {PIN_DRV} --expect-nonce tabi-r81-probe2 --expect-fixture-sha256 <from the receipt> --prior-set {PS} --json` and re-derive every pin in `{R}/freeze.txt` from the committed bytes. Then attack: (i) is any check satisfiable by a receipt that did NOT run the r81 legs (e.g. the r80 showpicker receipt)? (ii) does `cross-origin-nonfile-law` prove the CHILD's own script threw, or could a parent-side call produce the same receipt? (iii) does `order-law` really discriminate the order, or can one call produce both errors? (iv) does `webkitdirectory-answer-law` bind the directory answer to the delivered bytes, or only to the state text? (v) does `click-while-open-law` distinguish two real choosers from one event recorded twice? For each, name the exact check, the field it reads, and a concrete forgery attempt with its result. Write {SEATS}/R81Review1/report.md."""),
    item('R81Review2', 'reviewer', ['operability'],
         'Attack the battery and kill power: cases that pass for the wrong reason, mutants that are no-ops',
         f"""Read `{L}/scripts/negatives-showpicker-r81.mjs` and `{L}/scripts/kill-power-r81.mjs`. For each of these, decide and MEASURE: (1) does every refusal case fail for the id it names, or can a case pass because a collateral check fired (check the `alsoAllowed` lists against the counter's actual output)? (2) are any of the four extra cases (`order-law-message`, `activation-before`, `cross-nonfile-chooser`, `cross-nonfile-result`) redundant with an existing case? (3) the 46 frozen mutants: are any semantic no-ops (a rewrite that cannot change behaviour)? (4) are the `alsoAllowed` lists hiding a real finding? Run the battery and kill power yourself (scratch under {SC}/R81Review2) and report every disagreement with a command and its output."""),
    item('R81Critic', 'critic', ['calibration'],
         'Falsify the claims: the limit sentence, the axis naming, the no-work control, and the C2 identity leg',
         f"""Falsify, do not summarize. (1) C1's limit sentence: a forger who rewrites the identity fields and moves events — print the exact escape minimum from the counter's `limit` block and test a forgery at that boundary. (2) The axis: is the r81 generation a coverage move (new surface elements: the non-file SecurityError, the order discriminator, the directory answer, the accept answer, the second chooser) or quality work on the r80 instrument? Name the sentence in AXES.md that decides it. (3) The no-work control: does the r80 receipt under the r81 counter fail for the right reasons (`{C1D}/nowork.json`), and would a do-nothing round (no new driver) pass any leg? (4) C2: is `check-record-drift-r81.mjs` counting the claim, or can it be satisfied by writing the correction strings without the truth? Try a reversed correction and a stale-removed variant in a scratch copy of the lane and report the exits. Write {SEATS}/R81Critic/report.md."""),
    item('R81Mut1', 'mutation-tester', ['coverage'],
         'Independent conjunct-level mutants of the r81 counter beyond the frozen 46',
         f"""Write your own mutant set (do not reuse `{L}/scripts/kill-power-r81.mjs`'s list): at least 40 semantic edits of `{L}/scripts/check-showpicker-r81.mjs`, each a real weakening of a rule (drop a conjunct, flip a comparison, widen a tolerance, accept an extra value, skip a binding). Run the frozen battery (`{L}/scripts/negatives-showpicker-r81.mjs`) against each mutant in a scratch copy (copy the counter AND the battery into {SC}/R81Mut1/mut-<n>/, never edit the lane's files). Report every SURVIVOR with the mutation text and the reason the battery misses it; that survivor is a routed defect for r82 unless you also show the witness that kills it. Commit your mutant list and results as JSON under {SEATS}/R81Mut1/."""),
    item('R81Scout', 'scout', ['coverage'],
         'Open the sources for the r81 laws: the spec\'s SecurityError step, Chromium\'s check order, the CDP answer command, and the accept attribute',
         f"""Open and quote, with the exact locator and a <=25-word verbatim quote each (count the words with `wc -w` and state the count):
1. WHATWG HTML `showPicker()` — the SecurityError step and its exact condition — https://html.spec.whatwg.org/multipage/input.html
2. Chromium/blink `HTMLInputElement::showPicker` at tag 155.0.8059.84 (chromium.googlesource.com with ?format=TEXT, base64-decode): the cross-origin condition, the mutability check and the gesture check, in source order.
3. CDP `DOM.setFileInputFiles` in DOM.pdl at the same tag (chromium.googlesource.com ?format=TEXT): its parameters and whether it mentions accept or directories.
4. WHATWG HTML `accept` attribute — whether it is a hint/filter rather than a validator — https://html.spec.whatwg.org/multipage/input.html
Save each fetched page/source under {SEATS}/R81Scout/sources/ with its sha256 and http status in `FETCH.txt`, and report for each: URL, status, bytes, sha256, locator, quote, word count. Flag any claim the quote does NOT support — in particular whether the spec orders mutability before the origin check (the r81 order discriminator) and whether `accept` is normative validation."""),
    item('R81Scribe', 'scribe', ['depth'],
         'Draft the knowledge note, the SOURCES rows and the lesson Gate/Mistakes/Corrections sections',
         f"""Draft (do NOT commit) three things under {SEATS}/R81Scribe/:
1. `knowledge-note.md`: `corpus/knowledge/chromium-showpicker-runtime-round-81.md` in the lane's house style (read `{L}/corpus/knowledge/chromium-showpicker-runtime-round-80.md`): provenance trio first (`source:`, `verified-at:`, `recheck:`), the generation-r81 measured laws with the receipt field paths that carry them, the Limits section (what a receipt cannot prove), and the frontier list.
2. `sources-rows.md`: SOURCES.md rows in the contract v1 shape (id, source, kind, tier, scope, anchor, teaches, status, opened, recheck, used-by) for the four sources R81Scout opens — each with a located quote and a <=25-word `teaches`.
3. `lesson.md`: `corpus/lessons/round-81.md` with a `## Gate` (candidates, admitted, rejected with flip conditions), a `## Mistakes` table (class · evidence · captured-by · fix) mining at least one mistake from THIS round's instrument history (the `fl()` non-file crash on a date input, the click-while-open event index no-op, the prior-set file read as JSON), and a `## Corrections` table covering the ten r80 routed defects with the stale statement quoted and the correction naming the truth (the r80 battery 102/102, kill power 80/80, D10 93172ba9, the D9 nonce/D sweep, the dead pointers, the Gate quote counts 14 and 7, the `DOM.setFileInputFiles` typo, the six-delta control count, the end-census re-run, the battery binding).
Write prose only; the L1 lands it."""),
    item('R81Connector', 'connector', ['adjacency'],
         'Sibling-overlap scan: does any sibling lane own the cross-origin-frame / user-activation / accept-filter ground?',
         f"""Scan every sibling `PROVINCE.md` under /home/vgpnk/Projects/shokunin/*-shokunin/ (pin each head with `git -C <repo> rev-parse HEAD` at scan time) for ground that overlaps: cross-origin iframe behaviour, transient/sticky user activation, `showPicker`, file-chooser answering, `DOM.setFileInputFiles`, the `accept` attribute, `webkitdirectory`. Report per lane: relation (none/adjacent/contested), the `path:line` whose text carries the quote, and tabi's side of the boundary. A contested row is reported for the integrator, never absorbed. Also check whether any sibling already holds a cross-origin-frame or user-activation capability row or knowledge note (grep their `SCORECARD.md` and `corpus/knowledge/`)."""),
    item('R81Drift', 'executor', ['calibration'],
         'C2 controls: the reversed-correction, stale-removed and nonce-swapped controls, and the before/after re-derivation',
         f"""Build the C2 control receipts in a scratch MIRROR of the lane (never write the lane): copy the lane's SCORECARD.md, LOG.md, SKILL.md, corpus/QUALITY.md, corpus/lessons/round-81.md (if it exists), corpus/lessons/round-80.md, corpus/knowledge/chromium-showpicker-runtime-round-80.md and `.ufo/waves/round-80/scored/*.json` + `.ufo/waves/round-81/scored/*.json` + `.ufo/waves/round-81/claims.json` into {SC}/R81Drift/mirror/tabi-shokunin/ at the same relative paths, then:
1. reverse one correction pair in the mirror's lesson (`battery 102/102` becomes `battery 80/80` or a wrong truth) and run `node {L}/scripts/check-record-drift-r81.mjs --lane <mirror> --json` — record exit and the failed ids;
2. remove one stale statement from the mirror's SCORECARD and re-run — record exit and the failed ids;
3. change one record's `tabi-r81-l1-<hex>` to a superseded hex and re-run — record exit and the failed ids.
Commit the three outputs as JSON under {SEATS}/R81Drift/. State for each whether the control proves the counter binds direction and truth, or only presence."""),
]
check_items(items)
spec = {'wave': 'w1',
        'milestone': 'Round81 post-freeze: cold runs, frontier probes, false-green hunts, battery review, falsification, mutants, sources, note, sibling scan, C2 controls; 11 seats, 3 attack roles',
        'reportDir': '.ufo/waves/round-81/w1',
        'context': COMMON,
        'items': items}
pathlib.Path(R + '/w1-spec.json').write_text(json.dumps(spec, indent=1) + '\n')
print(json.dumps({'spec': R + '/w1-spec.json', 'items': len(items), 'roles': sorted({i['role'] for i in items}), 'D': D, 'nonceA': NA}, indent=1))
