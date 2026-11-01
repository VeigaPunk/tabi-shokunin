# Round 46 — tabi (Windows host; fresh-start discipline maintained)

Baseline `fe16cf6631e44ad0962cecf4c7c099b8d72efde5` → freeze `79b297f1d33df8c9b92bc423c2102d6712817662`
→ measured claims `951f70d33d9e3af208fb414e3079680c08dc66ba` → data corrections under the frozen
kill-rule flow (sibling heads racing mid-measurement: `0360b069`-precedent)
`3b8a68dc47b0d578e67dcd0faaf42dd100cdc59a` → `fd44a1b30e607bda0523f9464b6689399cbd651b` → **cited
measured revision `e2d59f729615e1c671ce44d1f4bed28e51f78a4f`** (instrument bytes byte-identical from
freeze to tip: `git diff 79b297f1..e2d59f72 -- scripts/chrome-cdp-loopback-round46.mjs
.ufo/waves/round-46/counters/ .ufo/waves/round-46/controls/` is empty). Two declared claims (C1
operability — the r45 carry-in teardown repair, sourced S155; C2 adjacency — the drifted-ledger
re-pin, the lowest owned axis at 8, nudge inactive since the r45 capability restarted the window).
Both verified under their frozen predicates at the cited measured revision; no axis harmed; no
scalar moved (no rubric authorizes one).

Fresh-start spot-checks (the r41/r42/r43 rejected closures, re-checked in committed bytes this
round): r41's untracked-receipt limb is closed (`git ls-tree HEAD -- corpus/evidence/round41/
playwright-egress/` → receipt.json `7b2ece05` + receipt.witness.json `5930d20f` are blobs at HEAD);
r42's nonce-relabel/synthetic-receipt false-green class stays closed by the committed counter
clause family (this round's counter selftest exercises 16 refusal mutants + 2 benign controls,
verdict clean 18/18); r43's false-green/crash class closed in r45 (D3 crash receipt committed at
`.ufo/waves/round-45/measure/d3-r43-pathtype-crash.json`). Ruled out for r46, with reasons in
`.ufo/waves/round-46/claims.json` `freshStartNote`: Firefox/BiDi moves (surface absent); wave-settled
claims (the r44 L0 line at fleet `.ufo/l0-questions.md:231` is still open — routed around, no wave
clause in any predicate); note/registry-count claims and the census-START receipt alone (do-nothing
reachable — the receipt is carried as protocol work per the carry-in, not declared as an axis
move); the job-object variant as a second claim (same axis and fix family as C1; the keyed
PID-group route was taken because Node has no job-object surface here and a PowerShell Add-Type
wrapper would move the launch outside the instrumented process); re-running r45's receipts as r46
evidence (do-nothing reachable); reading the sweep green while a legacy control happens to show 0
orphans (the red limb is carried by the live legacy control AND the deterministic mechanism
fixture, never by luck).

## Carry-in items from the r45 non-author closure (all addressed)

- **Teardown repair (item 1)** — closed in committed bytes as C1: the runner
  `scripts/chrome-cdp-loopback-round46.mjs` replaces kill-the-main-and-hope with a PID-group kill
  keyed to the launch (unique per-run profile token; pre-launch freshness sweep 0; nonempty
  mid-run census; post-kill sweep to 0 with per-PID kills; the legacy `taskkill /T` recorded with
  its no-op output); red/green receipts at the measured revision; every post-kill sweep reached 0.
  The SCORECARD round-46 block lists the repair explicitly (its C1 row).
- **Census-START receipt (item 3)** — committed in the freeze
  (`.ufo/waves/round-46/measure/census-start.txt`, exit 0, `tabi ok`, the same 21 pre-existing W04
  duplicate-URL warnings disclosed since r43).
- **r46 SCORECARD lists the repair (item 2)** — see the SCORECARD round-46 block, C1 row and the
  capabilities-adjacent note (the repair is an instrument repair, not a new capability row: the
  capability driven is unchanged, its teardown is).
- **L2-floor L0 open (item 4)** — routed around, never treated as answered: the r44 L0 line stands;
  no wave-settled clause appears in any predicate; the round ran L1-inline.

## Gate

| Source | Opened | Command | Located quote (≤25 words) |
|---|---|---|---|
| S155 — Win32_Process class, https://learn.microsoft.com/en-us/windows/win32/cimwin32prov/win32-process | 2026-10-31 | `curl -q -sL --proto =https -o win32-process.html https://learn.microsoft.com/en-us/windows/win32/cimwin32prov/win32-process` → 104,251 B, sha256 `317f30f2b10c2dc7fbfc3e42a76b1cc914189c41e78362682061b85e1558d253` (staged copy committed `.ufo/waves/round-46/sources/win32-process.html`) | CommandLine property: "Command line used to start a specific process, if applicable." (10 words; 1 hit in the raw bytes) |

Admit/reject on the round's own outputs (L1 gate; the outside non-author spot-check remains the
closure's duty): ADMIT — S155 (raw-fetched, quote verified verbatim, staged, load-bearing for C1's
enumeration surface); ADMIT — the teardown repair demonstration (live red: the legacy control's 16
orphans + no-op tree kill; green: keyed recovery to sweep 0 and three repaired full runs at sweep
0; counter clean on committed bytes, selftest 18/18, r45-receipt cross-refusal 8 findings); ADMIT —
the adjacency re-pin (meter v6 green at the cited measured revision: 10 unchanged + 6
sibling-absent, 0 stale, 0 moved; red at the baseline: 28 findings). REJECT — the first meter run
at `951f70d3` (`lane-screen-head-mismatch`: shokunin-reverse-engineering advanced its head between
ledger regeneration and the meter run) and the second at `fd44a1b3` (audit-missing: correction 2
had rebound kama's map ref without regenerating the audit ledger; kasegi advanced) — both
corrected as data under the frozen kill-rule flow and re-measured at `e2d59f72`; REJECT — the
first counter selftest run (18 cases, 1 passed: the counter's `keyedSweep` check read
`Array.isArray(td.keyedSweep || {}).rounds`, always falsy) — fixed before the freeze and covered
by the selftest itself; REJECT — the first mechanism-fixture run (the fixture's helpers exited 9
at spawn: Node treats an unknown `--tabi-r46-token` argument as an invalid option; token moved to
a positional argument) — fixed before the freeze; the two pre-data catches are the third and
second Mistakes below.

## Measurements (counting commands, paste-able)

- C1 (operability — the teardown repair, sourced S155):
  - Live red: `node .ufo/waves/round-46/controls/legacy-teardown-control-r46.mjs --browser edge
    --out <receipt> --scratch <dir>` → exit 0, `orphansAfterLegacyTeardown: 16`,
    `legacyTreeKillExit: 128` ("process not found"), recovery `finalSweepCount: 0` (receipt
    `measure/c1-legacy-edge.json`; pre-freeze pilot control `controls/c1-legacy-pilot-edge.json`
    shows the same 16-orphan shape).
  - Mechanism red+green: `node .ufo/waves/round-46/controls/teardown-mechanism-fixture.mjs
    <out.json>` → exit 0, `survivorsCount: 1` after the no-op tree kill, `mechanismRed: true`,
    `postKeyedKillSweepCount: 0`, `mechanismGreen: true` (receipt `measure/c1-mech-redgreen.json`;
    repro `controls/c1-mech-pilot.json`).
  - Repaired live runs: `node scripts/chrome-cdp-loopback-round46.mjs --browser edge …` → exit 0
    (Edg/156.0.4314.50, invocation-bound, `midRunSweepCount: 16`, `postKillSweepCount: 0`, PNG
    8,229 B sha `4e2c50b4…`); repro run fresh launch-key `edge-profile-a8a4ad8890b4` with a
    byte-identical screenshot; `--browser chrome` → exit 0 (Chrome/156.0.8078.74, mid-run 10,
    sweep 0, PNG 8,360 B sha `151fb3cb…`). Evidence committed as explicit files
    (`corpus/evidence/round46/{edge-cdp,chrome-cdp}/`); blob equality of the counter-scored bytes
    verified at the cited revision (`git hash-object` == `git ls-tree` blob for all four files).
  - Counter: `node .ufo/waves/round-46/counters/chrome-cdp-receipt-r46.mjs <receipt> --shot <png>
    --runner scripts/chrome-cdp-loopback-round46.mjs` → exit 0 on all three receipt byte sets
    (`measure/c1-counter-edge.json`, `measure/c1-counter-chrome.json`,
    `measure/c1-counter-edge-repro.json`); cross-refusal vs the r45 committed receipt → exit 1,
    8 findings (`controls/c1-counter-refuses-r45-receipt.json`); `--selftest` → verdict=clean
    18/18 (`measure/c1-counter-selftest.json`).
  - Before state: at the baseline `fe16cf66` no keyed sweep exists in any instrument
    (`git grep -c Win32_Process fe16cf66 -- scripts` → 0) and `git ls-tree fe16cf66 --
    corpus/evidence/round46` lists 0 files.
- C2 (adjacency — the re-pin, lowest owned axis):
  - Before: `node .ufo/waves/round-46/counters/c1-adjacency-host-v6.mjs --rev fe16cf66… --repo
    <lane> --fleet <fleet>` → exit 1, 28 findings (16 audit-missing, 12 roster-lane-uncovered;
    control `controls/c2-meter-red-at-baseline.json`); the r45 audit ledger
    (`corpus/adjacency-host-audit-r45.tsv` at the r45 measured rev `0360b069`) records 9 stale +
    1 moved + 6 sibling-absent.
  - After: same command at `e2d59f72…` → exit 0, predicate true, 0 findings, counts `{roster:16,
    mapRows:16, auditRows:16, deltaLanes:12}` (receipt `measure/c2-meter-green-at-measured.json`);
    `grep -c '^stale' corpus/adjacency-host-audit-r46.tsv` → 0; `grep -c '^moved'
    corpus/adjacency-host-audit-r46.tsv` → 0; `--selftest` → verdict=clean 16/16
    (`measure/c2-meter-selftest.json`).
  - The 10 drifted rows re-pinned at recorded snapshot heads (kake ×5 to `1772f82c`, kagi ×2 to
    `bc2f3fd6`, kumitate to `89cbd998`, kama to `22b9c16d`), each quote cell the FULL current line
    located at the pinned rev (verified by the meter's full-line equality at the snapshot head,
    which equals the pinned rev for every re-pinned row); the 6 sibling-absent rows stay honestly
    absent; delta-r46 regenerated at the snapshot (12 lanes, 14 hit lines, every disposition
    carried from r45 by exact quote match).
- Registry: `grep -c '^| S[0-9]' corpus/SOURCES.md` 154 → 155. Knowledge: `ls corpus/knowledge/*.md
  | wc -l` 62 → 63. Evidence: `git ls-tree fe16cf66… -- corpus/evidence/round46 | wc -l` → 0; at
  `e2d59f72…` → 4.

## Mistakes

| Class | Evidence | Captured-by | Fix / status |
|---|---|---|---|
| ledger key drift in a data correction (process, caught at measure) | correction 2 (`fd44a1b3`) rebound kama's map ref to the new head `22b9c16d` without regenerating the audit ledger keyed by sibling_ref — the meter read `audit-missing` for exactly that row | the v6 meter's own P1 key check at the re-measure | correction 3 (`e2d59f72`) regenerates map refs, audit keys and delta rows at ONE fresh snapshot; the flow is now "rebind → regenerate both ledgers → commit → meter" in a single step, recorded here for the next racing-head round |
| selftest expectation drift on a strict counter (instrument dev, caught pre-freeze) | first counter selftest run scored 1/18: the counter's keyedSweep presence check read `Array.isArray(td.keyedSweep \|\| {}).rounds` — `Array.isArray` returns a boolean, `.rounds` on it is undefined, so the check was always falsy; two more cases expected finding sets the mutated code does not actually produce | the counter selftest itself (case honest-green went red) | check repaired to `!td.keyedSweep \|\| !Array.isArray(td.keyedSweep.rounds)`; the two expectations corrected to the findings the mutations really cause (one-check-one-finding, criterion 76); final selftest verdict=clean 18/18 before the freeze |
| fixture helpers crashed at spawn (instrument dev, caught pre-freeze) | the mechanism fixture's helpers exited code 9 instantly: Node's CLI parser treats the unknown option `--tabi-r46-token=…` as an invalid argument, so the helpers never existed and the first "red" run had survivors 0 | the fixture's own pre-kill census (count 1, not 3) | token moved to a POSITIONAL argument (`tabi46tok=<token>`); the fixture then reproduced the orphan class deterministically (2/2 pre-freeze pilots, 1/1 post-freeze run) |
| shared gate is host-bound (legacy instrument, found at integration) | `scripts/check-adjacency.mjs` exits 2 `could_not_evaluate` (`git_failed`, status=spawn) on this host: `minimalEnv()` (`:307-309`) rebuilds PATH by splitting on `:` and keeping only entries starting with `/` — the old Linux convention — so on Windows the rebuilt PATH is empty and git.exe cannot spawn | the integration no-harm run (receipt `measure/c2-check-adjacency-hostbound.json`) | recorded with cause, not silently patched (no frozen byte amended post-data); for every row this round changed, the quote-at-pinned-rev duty is carried by the v6 meter's full-line equality at the pinned rev (strictly stronger than the gate's substring check); the gate's host-portable PATH repair routes to a later round |
| mined from r45 per the §2b duty: the teardown-orphan class itself | three re-parented msedge orphan trees survived the r45 runner's `taskkill /T` with `chromeTerminated: true` truthful about the main child only (r45 round-close) | the r45 scratch-deletion failure (hygiene failing loudly) | closed this round as C1 in committed bytes with live red (16 orphans) and green (sweep 0) receipts; the SCORECARD round-46 block lists the repair explicitly |

## Census

Start (2026-10-31, round open): `bash <fleet>/scripts/sources-census.sh validate --root <fleet> tabi`
→ exit 0, `tabi ok`, 21 pre-existing W04 duplicate-URL warnings (same set r43/r44/r45 disclosed);
receipt COMMITTED in the freeze (`.ufo/waves/round-46/measure/census-start.txt` — the r45 carry-in
item; r45 had none). End (round close): same command → exit 0 (receipt
`.ufo/waves/round-46/measure/census-end.txt`). `node scripts/check-sources.mjs` clean at the
integration tip (S155's used-by note and lesson land in the same commit).

## Assimilation

`considerthese/` does not exist in the lane repo (checked 2026-10-31). Shokuknow register not
reachable from this host. Assimilation: none — shokuknow unreachable.
