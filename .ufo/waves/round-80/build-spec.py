#!/usr/bin/env python3
"""Builds .ufo/waves/round-80/w1-spec.json (tabi round 80, one v1 wave of 12 seats).
Reads the freeze facts (D, pins, nonce) from committed files so nothing is hand-transcribed.
QUALITY 146/151: every item must carry the seat-output rule (JSON outputs and receipts under
.ufo/waves/round-80-seats/<name>/, never inside the walked trees); the builder refuses a spec in
which any item lacks it.  `python3 build-spec.py --selfcheck` shows the refusal on a crafted item."""
import json, pathlib, re, sys
L = '/home/vgpnk/Projects/shokunin/tabi-shokunin'
R = L + '/.ufo/waves/round-80'
W = R + '/w1'
SEATS = L + '/.ufo/waves/round-80-seats'
SC = '/fast/scratch/hyaku/tabi-r80'
SEAT_RULE_MARK = 'SEAT-OUTPUT RULE'

def seat_rule(name):
    return (f"{SEAT_RULE_MARK}: write every JSON output, receipt or crafted receipt ONLY under {SEATS}/{name}/ "
            f"(mkdir -p it); never write a .json, a receipt or any file containing the receipt schema string under {R}/ "
            f"or {L}/corpus/evidence/round80/ -- those are the counter's walked trees and a file there changes other seats' verdicts. "
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
PIN_DRV = pins['scripts/chrome-cdp-showpicker-round80.mjs']
PIN_CTR = pins['scripts/check-showpicker-r80.mjs']
PIN_BAT = pins['scripts/negatives-showpicker-r80.mjs']
PIN_KP = pins['scripts/kill-power-r80.mjs']
PIN_ST = pins['scripts/selftest-r80-gates.mjs']
PIN_DRIFT = pins['scripts/check-record-drift-r80.mjs']
D = pathlib.Path(R + '/scored/digests-commit.txt').read_text().split()[0]
D12 = D[:12]
NA = 'tabi-r80-l1-' + D12
EV = L + '/corpus/evidence/round80/chromium-showpicker/receipt.json'
C1D = R + '/controls/c1'
PS = C1D + '/prior-set.txt'
CTR = f'node {L}/scripts/check-showpicker-r80.mjs --lane {L}'

COMMON = f"""# Target
Tabi round 80, one v1 wave w1. L1 TabiR80 holds the planner seat and is the sole integration owner. Lane {L}; base e2e12ca58fe2cdbed4aa97af47793b6cfb5a9350. Claims FROZEN in {R}/claims.json; instrument digests in {R}/freeze.txt, digests commit D = {D}. Never propose amending the predicate, counter, pins, priors, thresholds or kill rule; attack them.
C1 coverage, capability `chromium-showpicker-linux` generation r80: `HTMLInputElement.showPicker()` under `Page.setInterceptFileChooserDialog` on Chromium 155.0.8059.84 --headless=new (/usr/bin/chromium). One fresh browser per leg (7 legs); the page fixture is the r78 driver's template plus a neutral `#pad` div (transient activation via a real CDP click), a disabled `<input type=file id=dis>`, and a cross-origin iframe (`127.0.0.1:<http>` parent, `127.0.0.1:<child>` child). Measured laws the counter binds: a `webkitdirectory` input and an `accept=".png"` input both open a `selectSingle` chooser; two calls each with `Runtime.evaluate {{userGesture:true}}` BOTH succeed and open two pickers (no already-open guard); a call deferred through `setTimeout(…,0)` from a trusted click's handler succeeds while the activation is live; a cross-origin child's own script opens its own picker (no SecurityError) while the parent cannot reach the child document (`contentDocument === null`, `contentWindow.document` throws SecurityError) — so page script cannot construct the spec's SecurityError case; a disabled input in the cross-origin frame throws InvalidStateError and does not consume the activation; the programmatic trigger ANSWERED with `DOM.setFileInputFiles` on the event's `backendNodeId` delivers the exact bytes and fires trusted `input`+`change`.
C2 calibration: record drift — `{L}/scripts/check-record-drift-r80.mjs` counts mismatches between the lane's records and the committed bytes: the round-79 non-author spot-check's routed defects 1-4 (append-only directional corrections) plus a self-drift leg that reads the round's OWN numbers from the committed scored outputs. Before 17 mismatches, after 0.
Counting command: {CTR} --receipt <receipt> --expect-driver-sha256 {PIN_DRV} --expect-nonce <nonce> --expect-fixture-sha256 <fixture sha256 of that receipt> --prior-set {PS} [--prior ...] [--tree-exempt-sha256 <hex>] --json
Predicate C1-SHOWPICKER-R80: (a) L1 post-D scored run, nonce {NA}, counter exit 0 clean (57 checks) with the committed prior set, receipt {EV}; (b) cold-run acceptance: every committed cold run after D exits 0 clean under the counter with its own nonce and the committed prior set — target ZERO honest refusals in at least 4 fresh cold runs; (c) battery exit 0 allOk (103 cases, coverageGap []) AND kill power holds (81 mutants, 0 survivors, 0 crashed) on the (a) receipt; (d) capability row first-working round 80 for generation r80 + note {L}/corpus/knowledge/chromium-showpicker-runtime-round-80.md citing the new rows + SKILL gate registry + `node {L}/scripts/selftest-r80-gates.mjs --lane {L} --work <scratch> --json` exit 0.
C2-RECORDDRIFT-R80: `node {L}/scripts/check-record-drift-r80.mjs --lane {L} --json` exits 0 with mismatches 0 (before: exit 1, 17 mismatches, {R}/lesson-proof/c2-before.json); every stale statement is still present (append-only) and a directional correction names it with the corrected value; the self-drift leg's numbers equal the committed scored outputs; `node {L}/scripts/check-capability-status.mjs --json` exits 0 with mismatches 0 and provisional 1.
# Bounds
Read-only seats return findings; no seat commits, pushes, or runs a mutating git/jj command anywhere. Never write into the walked trees ({R}, {L}/corpus/evidence/round80). Scratch root: {SC}/<your seat name>/ (mkdir -p it, delete it before you yield, receipts copied into your seat dir first). /tmp is for files under 50 MB only. Tooling authorization (operator, 2026-10-19): you may install or upgrade tools that help the task; read /home/vgpnk/.omp/agent/RULES.md first (official channels, update-safety gate, record tool/version/channel/reason in your report). PACMAN GUARD: all pacman transactions are PAUSED host-wide; install via `uv tool`/`npx`/an official binary in ~/.local/bin, or file an L0 question. Never mutate host sysctls. Every `Report:` trailer path is relative to {L} — write it at {L}/<that path>. Never message agent://all; message only the L1 (TabiR80) by id.
"""

def item(name, role, axes, milestone, body):
    return {'name': name, 'role': role, 'axes': axes, 'milestone': milestone,
            'prompt': DIRECTIVE + '\n# Assignment\n' + body + '\n' + COMMON + '\n' + seat_rule(name) + '\n'}

items = [
    item('R80Exec1', 'executor', ['coverage'],
         'Leg (b): two independent cold runs of the frozen driver, scored by the frozen counter',
         f"""Run the frozen driver TWICE with fresh nonces and score each receipt:
`node {L}/scripts/chrome-cdp-showpicker-round80.mjs --lane {L} --nonce tabi-r80-cold1-{D12} --scratch {SC}/R80Exec1 --out {SEATS}/R80Exec1/cold1.json --http-port 18960 --cdp-port 18961 --child-port 18962`
then the same with `--nonce tabi-r80-cold2-{D12}` / `cold2.json` / ports 18963/18964/18965.
Score each: `{CTR} --receipt <receipt> --expect-driver-sha256 {PIN_DRV} --expect-nonce <its nonce> --expect-fixture-sha256 <its fixture.sha256> --prior-set {PS} --prior {EV} --json`.
Also re-run the counter on the scored receipt {EV} with `--prior <your cold1>` to prove the prior set still accepts it.
Record every exit code and finding id in {SEATS}/R80Exec1/ledger.txt. A refusal is a finding to report, never to hide: name the exact finding id and the field it names."""),
    item('R80Exec2', 'executor', ['coverage'],
         'Leg (b): two more cold runs on different ports, plus a cold run under a scratch path containing a space',
         f"""Run the frozen driver twice more (nonces `tabi-r80-cold3-{D12}`, `tabi-r80-cold4-{D12}`, ports 18966/18967/18968 and 18969/18970/18971) into {SEATS}/R80Exec2/, score both with the frozen counter (same command shape as the context, `--prior {EV}`), and additionally run ONE of them with `--scratch` under a path with a space in it (e.g. `{SC}/R80Exec2/scratch with space`) to test the driver's absolute-path handling.
Report per-run: nonce, exit, verdict, checkCount, findings, and the fixture sha256. Any honest refusal is a leg (b) failure: report it with the finding id and the receipt path."""),
    item('R80Exec3', 'executor', ['coverage'],
         'Frontier probe (not a claim): the answer path on a webkitdirectory input and on an accept-constrained input, and the picker-already-open boundary with a real click',
         f"""Write a probe (your own file under {SEATS}/R80Exec3/, never in scripts/) that reuses the frozen driver's plumbing by copying it and changing ONLY the leg list, then answer:
1. `showPicker()` on `#d` (webkitdirectory) after a trusted `#pad` click, then ANSWER the chooser with `DOM.setFileInputFiles([<a directory path>])`: what does the input's file list become, and does `webkitRelativePath` appear?
2. The same on `#k` (accept=".png") answered with a `.txt` file: is the file accepted or refused (state + events)?
3. A real click on `#s` while a `showPicker()`-opened chooser is still pending on the same input: does a second chooser event fire, and does the click's own picker open?
Paste the raw per-leg JSON into {SEATS}/R80Exec3/probe.json and state each answer with the exact field path. Do not claim these as capability legs; they are frontier evidence for r81."""),
    item('R80Review1', 'reviewer', ['coverage'],
         'Attack C1 legs (a)-(d): re-run the counting command, re-derive the pins, hunt false greens',
         f"""Independently re-run `{CTR} --receipt {EV} --expect-driver-sha256 {PIN_DRV} --expect-nonce {NA} --expect-fixture-sha256 <from the receipt> --prior-set {PS} --json` and re-derive every pin in `{R}/freeze.txt` from the committed bytes. Then attack: (i) is any check satisfiable by a receipt that did NOT run the r80 legs (e.g. the r79 showpicker receipt)? (ii) does `cross-origin-law` prove the child's own script opened the picker, or could a parent-side call produce the same receipt? (iii) can a forged receipt pass `answer-law` by writing the expected hex without the file being delivered? (iv) does `deferred-law` bind the timer's call to the click's activation, or only the result? (v) is `twice-gesture-law` able to distinguish two real calls from one call recorded twice? For each, name the exact check, the field it reads, and a concrete forgery attempt with its result. Write {SEATS}/R80Review1/report.md."""),
    item('R80Review2', 'reviewer', ['operability'],
         'Attack the battery and kill power: cases that pass for the wrong reason, brackets that do not bracket',
         f"""Read `{L}/scripts/negatives-showpicker-r80.mjs` and `{L}/scripts/kill-power-r80.mjs`. For each of these, decide and MEASURE: (1) does every refusal case fail for the id it names, or can a case pass because a collateral check fired (check the `alsoAllowed` lists against the counter's actual output)? (2) the replay bracket: does `replay-at-threshold-refuse` / `replay-below-threshold-accept` actually cross at the arithmetic threshold (print absMatched/absNeed for both)? (3) the kill-power mutant list: are any mutants semantic no-ops (a rewrite that cannot change behaviour)? (4) are the `alsoAllowed` lists hiding a real finding? Run the battery and kill power yourself (scratch under {SC}/R80Review2) and report every disagreement with a command and its output."""),
    item('R80Critic', 'critic', ['calibration'],
         'Falsify the claims: the limit sentence, the axis naming, the no-work control, and the C2 self-drift leg',
         f"""Falsify, do not summarize. (1) C1's limit sentence: a forger who rewrites the identity fields and moves events — print the exact escape minimum from the counter's `limit` block and test a forgery at that boundary. (2) The axis: is the r80 generation a coverage move (new surface elements: the cross-origin frame, the answer path, the deferred trigger) or quality work on the r79 instrument? Name the sentence in AXES.md that decides it. (3) The no-work control: does the r79 showpicker receipt under the r80 counter fail for the right reasons, and would a do-nothing round (no new driver) pass any leg? (4) C2: is `check-record-drift-r80.mjs` counting the claim, or can it be satisfied by writing the correction strings without the truth? Try a reversed correction and a stale-removed variant in a scratch copy of the lane and report the exits. Write {SEATS}/R80Critic/report.md."""),
    item('R80Mut1', 'mutation-tester', ['coverage'],
         'Independent conjunct-level mutants of the r80 counter beyond the frozen 81',
         f"""Write your own mutant set (do not reuse `{L}/scripts/kill-power-r80.mjs`'s list): at least 40 semantic edits of `{L}/scripts/check-showpicker-r80.mjs`, each a real weakening of a rule (drop a conjunct, flip a comparison, widen a tolerance, accept an extra value, skip a binding). Run the frozen battery (`{L}/scripts/negatives-showpicker-r80.mjs`) against each mutant in a scratch copy (copy the counter AND the battery into {SC}/R80Mut1/mut-<n>/, never edit the lane's files). Report every SURVIVOR with the mutation text and the reason the battery misses it; that survivor is a routed defect for r81 unless you also show the witness that kills it. Commit your mutant list and results as JSON under {SEATS}/R80Mut1/."""),
    item('R80Scout', 'scout', ['coverage'],
         'Open the sources for the r80 laws: the spec\'s SecurityError step, Chromium\'s check order, and the CDP answer command',
         f"""Open and quote, with the exact locator and a <=25-word verbatim quote each:
1. WHATWG HTML `showPicker()` — the SecurityError step and its exact condition — https://html.spec.whatwg.org/multipage/input.html
2. Chromium/blink `HTMLInputElement::showPicker` at tag 155.0.8059.84 (chromium.googlesource.com with ?format=TEXT, base64-decode): the cross-origin condition, the mutability check and the gesture check, in source order.
3. CDP `Page.setInterceptFileChooserDialog` and `Page.fileChooserOpened` in Page.pdl at the same tag.
4. CDP `DOM.setFileInputFiles` in DOM.pdl at the same tag.
Save each fetched page/source under {SEATS}/R80Scout/sources/ with its sha256 and http status in `FETCH.txt`, and report for each: URL, status, bytes, sha256, locator, quote. Flag any claim the quote does NOT support — in particular whether the source makes the SecurityError step reachable from page script at all."""),
    item('R80Scribe', 'scribe', ['depth'],
         'Draft the knowledge note, the SOURCES rows and the lesson Gate/Mistakes sections',
         f"""Draft (do NOT commit) three things under {SEATS}/R80Scribe/:
1. `knowledge-note.md`: `corpus/knowledge/chromium-showpicker-runtime-round-80.md` in the lane's house style (read `{L}/corpus/knowledge/chromium-showpicker-runtime-round-79.md`): provenance trio first (`source:`, `verified-at:`, `recheck:`), the generation-r80 measured laws with the receipt field paths that carry them, the Limits section (what a receipt cannot prove, including the SecurityError reachability question), and the frontier list.
2. `sources-rows.md`: SOURCES.md rows in the contract v1 shape (id, source, kind, tier, scope, anchor, teaches, status, opened, recheck, used-by) for the four sources R80Scout opens — each with a located quote and a <=25-word `teaches`.
3. `lesson.md`: `corpus/lessons/round-80.md` with a `## Gate` (candidates, admitted, rejected with flip conditions) and a `## Mistakes` table (class · evidence · captured-by · fix) mining at least one mistake from THIS round's instrument history (the deferred leg's arm-before-click ordering, the chooser baseline captured after the click, the battery's content-exemption omission, the kill-power survivors) and one carried from r79.
Write prose only; the L1 lands it."""),
    item('R80Connector', 'connector', ['adjacency'],
         'Sibling-overlap scan: does any sibling lane own the cross-origin-frame / user-activation ground?',
         f"""Scan every sibling `PROVINCE.md` under /home/vgpnk/Projects/shokunin/*-shokunin/ (pin each head with `git -C <repo> rev-parse HEAD` at scan time) for ground that overlaps: cross-origin iframe behaviour, transient/sticky user activation, `showPicker`, file-chooser answering, CDP `DOM.setFileInputFiles`. Report per lane: relation (none/adjacent/contested), the `path:line` whose text carries the quote, and tabi's side of the boundary. A contested row is reported for the integrator, never absorbed. Also check whether any sibling already holds a cross-origin-frame or user-activation capability row or knowledge note (grep their `SCORECARD.md` and `corpus/knowledge/`)."""),
    item('R80Probe', 'executor', ['calibration'],
         'One falsifiable probe: is transient activation per-frame-tree (does the child frame\'s click make the PARENT\'s isActive true)?',
         f"""Hypothesis H: user activation is per-frame-tree, so a trusted click inside the cross-origin iframe makes the PARENT window's `navigator.userActivation.isActive` true, and the child's successful `showPicker()` consumes it tree-wide (the parent's `isActive` returns false). Test it with the frozen driver's plumbing copied into {SEATS}/R80Probe/ (never edit the lane's scripts): one leg that clicks the child's `#go`, reads the parent's `isActive` BEFORE the child's showPicker runs (a page-side mark in the child, read via the child context) and AFTER, plus the child's own `isActive`. Report the exact values and whether H is CONFIRMED or REFUTED. One probe, one verdict, raw JSON committed."""),
    item('R80Drift', 'executor', ['calibration'],
         'C2 controls: the reversed-correction and stale-removed controls, and the before/after re-derivation',
         f"""Build the C2 control receipts in a scratch MIRROR of the lane (never write the lane): copy the lane's SCORECARD.md, LOG.md, SKILL.md, corpus/lessons/round-79.md and `.ufo/waves/round-80/scored/*.json` into {SC}/R80Drift/mirror/tabi-shokunin/ at the same relative paths, then:
1. reverse one correction pair in the mirror's SCORECARD (`battery 88/88 → battery 90/90` becomes `battery 90/90 → battery 88/88`) and run `node {L}/scripts/check-record-drift-r80.mjs --lane <mirror> --json` — record exit and the failed ids;
2. remove one stale statement from the mirror's LOG and re-run — record exit and the failed ids;
3. move one truth value (edit the mirror's `scored/battery-a.json` cases from 103 to 104) and re-run — record exit and the failed ids.
Commit the three outputs as JSON under {SEATS}/R80Drift/. State for each whether the control proves the counter binds direction and truth, or only presence."""),
]
check_items(items)
spec = {'wave': 'w1',
        'milestone': 'Round80 post-freeze: cold runs, frontier probes, false-green hunts, battery review, falsification, mutants, sources, note, sibling scan, activation probe, C2 controls; 12 seats, 4 attack roles',
        'reportDir': '.ufo/waves/round-80/w1',
        'context': COMMON,
        'items': items}
pathlib.Path(R + '/w1-spec.json').write_text(json.dumps(spec, indent=1) + '\n')
print(json.dumps({'spec': R + '/w1-spec.json', 'items': len(items), 'roles': sorted({i['role'] for i in items}), 'D': D, 'nonceA': NA}, indent=1))
