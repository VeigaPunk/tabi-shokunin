#!/usr/bin/env python3
"""Builds .ufo/waves/round-79/w1-spec.json (tabi round 79, one v1 wave of 12 seats).
Reads the freeze facts (D, pins, nonce) from committed files so nothing is hand-transcribed.
QUALITY 146/151: every item must carry the seat-output rule (JSON outputs and receipts under
.ufo/waves/round-79-seats/<name>/, never inside the walked trees); the builder refuses a spec in which
any item lacks it.  `python3 build-spec.py --selfcheck` shows the refusal on a crafted item."""
import json, pathlib, re, sys
L = '/home/vgpnk/Projects/shokunin/tabi-shokunin'
R = L + '/.ufo/waves/round-79'
W = R + '/w1'
SEATS = L + '/.ufo/waves/round-79-seats'
SC = '/fast/scratch/hyaku/tabi-r79'
SEAT_RULE_MARK = 'SEAT-OUTPUT RULE'

def seat_rule(name):
    return (f"{SEAT_RULE_MARK}: write every JSON output, receipt or crafted receipt ONLY under {SEATS}/{name}/ "
            f"(mkdir -p it); never write a .json, a receipt or any file containing the receipt schema string under {R}/ "
            f"or {L}/corpus/evidence/round79/ -- those are the counter's walked trees and a file there changes other seats' verdicts. "
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
PIN_DRV = pins['scripts/chrome-cdp-showpicker-round79.mjs']
PIN_CTR = pins['scripts/check-showpicker-r79.mjs']
PIN_BAT = pins['scripts/negatives-showpicker-r79.mjs']
PIN_KP = pins['scripts/kill-power-r79.mjs']
PIN_ST = pins['scripts/selftest-r79-gates.mjs']
PIN_DRIFT = pins['scripts/check-record-drift-r79.mjs']
D = pathlib.Path(R + '/scored/digests-commit.txt').read_text().split()[0]
D12 = D[:12]
NA = 'tabi-r79-l1-' + D12
EV = L + '/corpus/evidence/round79/chromium-showpicker/receipt.json'
C1D = R + '/controls/c1'
PS = C1D + '/prior-set.txt'
CTR = f'node {L}/scripts/check-showpicker-r79.mjs --lane {L}'
E1 = SEATS + '/R79Exec1/receipt.json'

COMMON = f"""# Target
Tabi round 79, one v1 wave w1. L1 TabiR79 holds the planner seat and is the sole integration owner. Lane {L}; base 24c821895f31f9dcb66ac2f357bc947818b0408c. Claims FROZEN in {R}/claims.json; instrument digests in {R}/freeze.txt, digests commit D = {D}. Never propose amending the predicate, counter, pins, priors, thresholds or kill rule; attack them.
C1 coverage, capability `chromium-showpicker-linux` (NEW): `HTMLInputElement.showPicker()` under `Page.setInterceptFileChooserDialog` on Chromium 155.0.8059.84 --headless=new (/usr/bin/chromium). One fresh browser per leg (10 legs); the page fixture is the r78 driver's template plus a neutral `#pad` div (transient activation via a real CDP click) and a disabled `<input type=file id=dis>`. Measured laws the counter binds: showPicker without transient activation throws NotAllowedError "requires a user gesture" and opens nothing (interception on or off); one activation buys exactly one picker (a second call throws the same NotAllowedError); `Runtime.evaluate {{userGesture:true}}` satisfies the requirement (isActive stays false, hasBeenActive becomes true); a successful call consumes isActive; a disabled input throws InvalidStateError "cannot be used on immutable controls" and does NOT consume the activation; with interception on the chooser event fires with mode selectSingle/selectMultiple from the page-measured input; with interception off no CDP event fires and the native dialog is auto-cancelled (page `cancel`); an armed `cancel:true` fires the chooser event AND the page `cancel`; showPicker never selects files and fires no pointer/input/change event; the browser-assigned backendNodeId is reported (nodeReport) and never required to be a literal (QUALITY 150).
C2 calibration: record drift — `{L}/scripts/check-record-drift-r79.mjs` counts mismatches between the lane's self-assessment records (SCORECARD r78 row, SKILL r78 registry, LOG round-78 entry, the filed r78 report, the r78 claims.json leg (b) path, the nodeReport sentence) and the committed bytes; before 7 mismatches, after 0.
Counting command: {CTR} --receipt <receipt> --expect-driver-sha256 {PIN_DRV} --expect-nonce <nonce> --expect-fixture-sha256 <fixture sha256 of that receipt> --prior-set {PS} [--prior ...] [--tree-exempt-sha256 <hex>] --json
Predicate C1-SHOWPICKER-R79: (a) L1 post-D scored run, nonce {NA}, counter exit 0 clean (56 checks) with the committed prior set, receipt {EV}; (b) cold-run acceptance: every committed cold run after D exits 0 clean under the counter with its own nonce and the committed prior set — target ZERO honest refusals in at least 4 fresh cold runs; (c) battery exit 0 allOk (87 cases, coverageGap []) AND kill power holds (0 survivors, 0 crashed) on the (a) receipt; (d) capability row first-working round 79 + note {L}/corpus/knowledge/chromium-showpicker-runtime-round-79.md citing S216-S219 + SKILL gate registry + `node {L}/scripts/selftest-r79-gates.mjs --lane {L} --work <scratch> --json` exit 0.
C2-RECORDDRIFT-R79: `node {L}/scripts/check-record-drift-r79.mjs --lane {L} --json` exits 0 with mismatches 0 (before: exit 1, 7 mismatches, {R}/lesson-proof/c2-before.json); every stale statement is still present (append-only) and a correction names it with the corrected value; `node {L}/scripts/check-capability-status.mjs --json` exits 0 with mismatches 0 and provisional 1.
# Bounds
Read-only seats return findings; no seat commits, pushes, or runs a mutating git/jj command anywhere. Never write into the walked trees ({R}, {L}/corpus/evidence/round79). Scratch root: {SC}/<your seat name>/ (mkdir -p it, delete it before you yield, receipts copied into your seat dir first). /tmp is for files under 50 MB only. Tooling authorization (operator, 2026-10-19): you may install or upgrade tools that help the task; read /home/vgpnk/.omp/agent/RULES.md first (official channels, update-safety gate, record tool/version/channel/reason in your report). PACMAN GUARD: all pacman transactions are PAUSED host-wide; install via `uv tool`/`npx`/an official binary in ~/.local/bin, or file an L0 question. Never mutate host sysctls. Every `Report:` trailer path is relative to {L} — write it at {L}/<that path>. Never message agent://all.
"""

def item(name, role, axes, milestone, body):
    return {'name': name, 'role': role, 'axes': axes, 'milestone': milestone,
            'prompt': DIRECTIVE + '\n# Assignment\n' + body + '\n' + COMMON + '\n' + seat_rule(name) + '\n'}

items = [
    item('R79Exec1', 'executor', ['coverage'],
         'Leg (b): two independent cold runs of the frozen driver, scored by the frozen counter',
         f"""Run the frozen driver TWICE with fresh nonces and score each receipt:
`node {L}/scripts/chrome-cdp-showpicker-round79.mjs --lane {L} --nonce tabi-r79-cold1-{D12} --scratch {SC}/R79Exec1 --out {SEATS}/R79Exec1/cold1.json --http-port 18950 --cdp-port 18951`
then the same with `--nonce tabi-r79-cold2-{D12}` / `cold2.json` / ports 18952/18953.
Score each: `{CTR} --receipt <receipt> --expect-driver-sha256 {PIN_DRV} --expect-nonce <its nonce> --expect-fixture-sha256 <its fixture.sha256> --prior-set {PS} --prior {EV} --json`.
Also re-run the counter on the scored receipt {EV} with `--prior <your cold1>` to prove the prior set still accepts it.
Record every exit code and finding id in {SEATS}/R79Exec1/ledger.txt. A refusal is a finding to report, never to hide: name the exact finding id and the field it names."""),
    item('R79Exec2', 'executor', ['coverage'],
         'Leg (b): two more cold runs on different ports, plus a cold run under a different scratch HOME',
         f"""Run the frozen driver twice more (nonces `tabi-r79-cold3-{D12}`, `tabi-r79-cold4-{D12}`, ports 18954/18955 and 18956/18957) into {SEATS}/R79Exec2/, score both with the frozen counter (same command shape as the context, `--prior {EV}`), and additionally run ONE of them with `TMPDIR` and `HOME` unchanged but `--scratch` under a path with a space in it (e.g. `{SC}/R79Exec2/scratch with space`) to test the driver's absolute-path handling.
Report per-run: nonce, exit, verdict, checkCount, findings, and the fixture sha256. Any honest refusal is a leg (b) failure: report it with the finding id and the receipt path."""),
    item('R79Exec3', 'executor', ['coverage'],
         'Frontier probe (not a claim): showPicker on the webkitdirectory and accept inputs, and the double-call boundary',
         f"""Write a probe (your own file under {SEATS}/R79Exec3/, never in scripts/) that reuses the frozen driver's plumbing by copying it and changing ONLY the leg list, then answer:
1. `showPicker()` on `#d` (webkitdirectory) after a trusted `#pad` click with interception on: does the chooser event fire, and with which mode?
2. The same on `#k` (accept=".png"): mode?
3. Two showPicker calls with `Runtime.evaluate {{userGesture:true}}` and NO page click: does the second throw, and with which name?
4. `showPicker()` on `#s` inside a `setTimeout(…, 0)` scheduled from a trusted click's handler (activation still live?): ok or NotAllowedError?
Paste the raw per-leg JSON into {SEATS}/R79Exec3/probe.json and state each answer with the exact field path. Do not claim these as capability legs; they are frontier evidence for r80."""),
    item('R79Exec4', 'executor', ['operability'],
         'Routed defect 3a: the 21 R78Mut1 survivors as battery cases for the r78 counter (new file, frozen r78 bytes untouched)',
         f"""The round-78 mutation run left 21 semantic mutants of `scripts/check-filechooser-r78.mjs` alive (`{L}/.ufo/waves/round-78-seats/R78Mut1/semantic-mutants-cur.json`, `results[].outcome == "survived"`). Build `{L}/scripts/negatives-filechooser-r79.mjs`: a battery that IMPORTS nothing from the r78 battery but reuses its case harness shape (read `{L}/scripts/negatives-filechooser-r78.mjs`), carries the r78 battery's cases by invoking it for the base coverage, and adds ONE case per survivor that makes the weakened check fail with a named finding id. Then a kill-power run over the 21 mutants (`{L}/.ufo/waves/round-78/controls/c1/kill-power-r78.mjs` is the harness) must report 0 survivors.
Constraints: do NOT edit `scripts/check-filechooser-r78.mjs` or `scripts/negatives-filechooser-r78.mjs` (frozen r78 bytes; their pins are in `{R}/../round-78/freeze.txt`). Your new file is r79 work. Report the 21 mutant names, the case that kills each, and the kill-power summary in {SEATS}/R79Exec4/report.md + `killpower-r79.json`."""),
    item('R79Review1', 'reviewer', ['coverage'],
         'Attack C1 legs (a)-(d): re-run the counting command, re-derive the pins, hunt false greens',
         f"""Independently re-run `{CTR} --receipt {EV} --expect-driver-sha256 {PIN_DRV} --expect-nonce {NA} --expect-fixture-sha256 <from the receipt> --prior-set {PS} --json` and re-derive every pin in `{R}/freeze.txt` from the committed bytes. Then attack: (i) is any check satisfiable by a receipt that did NOT run showPicker (e.g. the r78 file-chooser receipt)? (ii) does `gesture-law` bind the exact error class AND message, or only `ok`? (iii) can a forged receipt pass `activation-law` by copying the honest transitions while its own trigger never ran? (iv) does `no-selection-law` prove the absence of selection or only the absence of a state change? (v) is `plan-calls` able to distinguish a real trigger send from a replay of the same expression? For each attack, construct the forged receipt under {SEATS}/R79Review1/ and run the counter on it; report the exit code and finding ids. A surviving forgery is a HIGH finding."""),
    item('R79Review2', 'reviewer', ['operability'],
         'Attack the battery and kill power: cases that pass for the wrong reason, brackets that do not bracket',
         f"""Read `{L}/scripts/negatives-showpicker-r79.mjs` and `{L}/scripts/kill-power-r79.mjs`. For each of these, decide and MEASURE: (1) does every refusal case fail for the id it names, or can a case pass because a collateral check fired (check the `alsoAllowed` lists against the counter's actual output)? (2) the replay sweep: does the crossing happen at the arithmetic threshold, and is the sweep's `otherIds` filter hiding a real finding? (3) the kill-power mutant list: are any mutants semantic no-ops (a rewrite that cannot change behaviour)? (4) the `unbracketed` list: is each entry genuinely unbracketed, or is a bracket constructible? Run the battery and kill power yourself (scratch under {SC}/R79Review2) and report every disagreement with a command and its output."""),
    item('R79Critic', 'critic', ['calibration'],
         'Falsify the claims: the limit sentence, the axis naming, the no-work control, and the C2 counter',
         f"""Falsify, do not summarize. (1) C1's limit sentence: a forger who rewrites the identity fields and moves events — print the exact escape minimum from the counter's `limit` block and test a forgery at that boundary. (2) The axis: is `chromium-showpicker-linux` a coverage move (a new surface element: the programmatic trigger path and its gesture law) or is it quality work on the r77/r78 file-chooser instrument? Name the sentence in AXES.md that decides it. (3) The no-work control: does the r78 file-chooser receipt under the r79 counter fail for the right reasons, and would a do-nothing round (no new driver) pass any leg? (4) C2: is `check-record-drift-r79.mjs` counting the claim, or can it be satisfied by writing the correction strings without the truth matching? Construct a control where the correction text is present but the truth is wrong, run the counter, and report the exit code. HIGH findings must name the file:line and the command."""),
    item('R79Mut1', 'mutation-tester', ['coverage'],
         'Independent semantic mutants of the r79 counter beyond the frozen 70',
         f"""Write your own mutant set (do not reuse `{L}/scripts/kill-power-r79.mjs`'s list): at least 40 semantic edits of `{L}/scripts/check-showpicker-r79.mjs`, each a real weakening of a rule (drop a conjunct, flip a comparison, widen a tolerance, accept an extra value, skip a binding). Run the frozen battery (`{L}/scripts/negatives-showpicker-r79.mjs`) against each mutant in a scratch copy (copy the counter AND the battery into {SC}/R79Mut1/mut-<n>/, never edit the lane's files). Report every SURVIVOR with the mutation text and the reason the battery misses it; that survivor is a routed defect for r80 unless you also show the witness that kills it. Commit your mutant list and results as JSON under {SEATS}/R79Mut1/."""),
    item('R79Scout', 'scout', ['coverage'],
         'Open the sources for the showPicker law: HTML spec, MDN, Chromium source, CDP Runtime.evaluate',
         f"""Open and quote, with the exact locator and a <=25-word verbatim quote each:
1. WHATWG HTML `showPicker()` (the gesture requirement, the InvalidStateError for non-mutable controls, the SecurityError for cross-origin) — https://html.spec.whatwg.org/multipage/input.html
2. MDN `HTMLInputElement.showPicker()` — https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/showPicker
3. Chromium/blink `HTMLInputElement::showPicker` (or `ShowPicker`) source at the pinned tag 155.0.8059.84 (chromium.googlesource.com with ?format=TEXT, base64-decode; the r78/r79 sources use this pattern).
4. CDP `Runtime.evaluate`'s `userGesture` parameter in Runtime.pdl at the same tag.
Save each fetched page/source under {SEATS}/R79Scout/sources/ with its sha256 and http status in `FETCH.txt`, and report for each: URL, status, bytes, sha256, locator, quote. Flag any claim the quote does NOT support."""),
    item('R79Scribe', 'scribe', ['depth'],
         'Draft the knowledge note, the SOURCES rows and the lesson Gate/Mistakes sections',
         f"""Draft (do NOT commit) three things under {SEATS}/R79Scribe/:
1. `knowledge-note.md`: `corpus/knowledge/chromium-showpicker-runtime-round-79.md` in the lane's house style (read `{L}/corpus/knowledge/chromium-file-chooser-runtime-round-78.md`): provenance trio first (`source:`, `verified-at:`, `recheck:`), the measured laws with the receipt field paths that carry them, the Limits section (what a receipt cannot prove), and the frontier list. Cite S216-S219 (the rows R79Scout opens).
2. `sources-rows.md`: four SOURCES.md rows in the contract v1 shape (id, source, kind, tier, scope, anchor, teaches, status, opened, recheck, used-by) for the spec, MDN, the Chromium source and the CDP Runtime.pdl — each with a located quote and a <=25-word `teaches`.
3. `lesson.md`: `corpus/lessons/round-79.md` with a `## Gate` (candidates, admitted, rejected with flip conditions, spot-check placeholder) and a `## Mistakes` table (class · evidence · captured-by · fix) mining at least one mistake from THIS round's instrument history (read `{R}/controls/` and the L1's notes in `{R}/README.md` if present) and one carried from r78.
Write prose only; the L1 lands it."""),
    item('R79Connector', 'connector', ['adjacency'],
         'Sibling-overlap scan: does any sibling lane own the showPicker/gesture ground?',
         f"""Scan every sibling `PROVINCE.md` under /home/vgpnk/Projects/shokunin/*-shokunin/ (20 lanes; pin each head with `git -C <repo> rev-parse HEAD` at scan time) for ground that overlaps: programmatic file-picker invocation, `showPicker`, transient user activation, gesture requirements of web APIs, file-chooser interception. Report per lane: relation (none/adjacent/contested), the `path:line` whose text carries the quote, and tabi's side of the boundary. A contested row is reported for the integrator, never absorbed. Also check whether any sibling already holds a `showPicker` capability row or knowledge note (grep their `SCORECARD.md` and `corpus/knowledge/`)."""),
    item('R79Labrat', 'labrat', ['calibration'],
         'One falsifiable probe: does the gesture check precede the mode/immutable checks?',
         f"""Hypothesis H: `showPicker()` evaluates the gesture requirement BEFORE the mutability and mode checks, so a disabled input with NO transient activation throws NotAllowedError (not InvalidStateError), and a `multiple` input with no activation throws NotAllowedError (not a mode error). Test it with the frozen driver's plumbing copied into {SEATS}/R79Labrat/ (never edit the lane's scripts): two legs, (1) `#dis` with no prior click and no userGesture, (2) `#m` with no prior click and no userGesture. Report the exact `showPicker` object for each and whether H is CONFIRMED or REFUTED. If REFUTED, name the observed order. One probe, one verdict, raw JSON committed."""),
]
check_items(items)
spec = {'wave': 'w1',
        'milestone': 'Round79 post-freeze: leg (b) cold runs, frontier probes, the r78 survivors as battery cases, false-green hunts, battery/kill review, falsification, independent mutants, sources, note drafting, sibling overlap, one labrat probe; 12 seats, 5 attack roles (reviewer x2, critic, mutation-tester, labrat), L1 planner',
        'reportDir': '.ufo/waves/round-79/w1',
        'context': COMMON,
        'items': items}
pathlib.Path(R + '/w1-spec.json').write_text(json.dumps(spec, indent=1) + '\n')
print(json.dumps({'spec': R + '/w1-spec.json', 'items': len(items), 'roles': sorted({i['role'] for i in items}), 'pins': {'driver': PIN_DRV, 'counter': PIN_CTR, 'battery': PIN_BAT, 'killpower': PIN_KP, 'selftest': PIN_ST, 'drift': PIN_DRIFT}, 'D': D, 'nonceA': NA}, indent=1))
