# Round 42 — SCORECARD section draft

**DRAFT ONLY.** This seat wrote no byte of `SCORECARD.md`; L1 splices these
blocks into `SCORECARD.md` after WAVE-DONE and after the measurement bindings in
§C1/§C2 below are committed at the measured revision.

Vocabulary is checked against `/home/vgpnk/Projects/shokunin/AXES.md`
§SCORECARD.md contract (fields: axes / capabilities / planned / saturation /
retired) and §Capabilities ("Rows enter only through a round that demonstrates
the capability running"); also `corpus/QUALITY.md` criterion 83 (a round group
states its own derived nudge state with rule and inputs) and criterion 84 (a
capability row names an operation, never a gate or counter).

Provenance: claims frozen at `9b6de3a19de11abdb80e82a1310abc64a40215bb` in
`.ufo/waves/round-42/claims.json`; round-start baseline
`34e177959d1b7ce04afb85a001420e02631ce79e`. Every quoted block below is copied
from `claims.json` verbatim (checked by substring match against the file, see the
seat report); the two discrepancies found while copying are **routed as
findings F1/F2**, not amended into the draft (frozen bytes are never amended).

## Contract-field map for this section

| `AXES.md` §SCORECARD field | Where it lands in the Round 42 section |
|---|---|
| axes | "Axes at round start" line + the held-scores bullet in §Round 42 — capabilities / planned / saturation / retired |
| capabilities | §Round 42 — capabilities (none entered at draft time; the pending `playwright-firefox-loopback-tcp` row is carried commented at the end) |
| planned | the `planned (round 43)` bullet (PENDING — L1 asserts the next round's 1–3 claims) |
| saturation | the `saturation: 8 / window 3` bullet and the nudge derivation in §Round 42 — declared claims |
| retired | the `retired: none` bullet |

## Round 42 — declared claims (frozen before data)

Fresh-start round (third consecutive rejected closure). Claims frozen at
`9b6de3a19de11abdb80e82a1310abc64a40215bb`; round-start baseline
`34e177959d1b7ce04afb85a001420e02631ce79e`.

Axes at round start: depth 9, coverage 9, operability 9, freshness 9,
calibration 9, adjacency 8. Lowest non-retired axis: adjacency (8). Saturation
8 / window 3. The stagnation nudge is **active**: the rule read is `AXES.md`
§The stagnation nudge (every axis at or above the line AND no capability
entered within the window), and its inputs are the six scores above, the
declared saturation 8 / window 3, and the capability table's entry rounds (last
entries 25, 32, 33, 35 — none in rounds 39–41). The lowest-axis obligation is
therefore waived, and C1 is the capability/frontier move; C2 is an independent
instrument repair on the round-41 verifier's routed defects. The claims are
causally separable (`claims.json:causalSeparation`).

| Claim / axis | Counting command | Before (quoted from `claims.json`) | Target |
|---|---|---|---|
| C1 coverage capability — Playwright Firefox loopback TCP observation, admitted on committed bytes with a settled attack wave | `node scripts/measure-c1-round41.mjs --out corpus/evidence/round42/playwright-egress/receipt.json --scratch /fast/scratch/hyaku/tabi-r42/L1-measure/run` | "At baseline 34e177959d1b7ce04afb85a001420e02631ce79e: git ls-tree -r --name-only <baseline> -- corpus/evidence/round42 lists 0 files (control .ufo/waves/round-42/controls/c1-baseline-tree-count.txt); the committed round-41 receipt replayed under a fresh nonce is refused (control .ufo/waves/round-42/controls/c1-r41-replay-refused.json)." — observed: control `c1-baseline-tree-count.txt` records `0` and the command; `c1-r41-replay-refused.json` records `predicate:false`, findings `run-nonce-mismatch`, `witness-nonce-mismatch` (exit 1, `R41_REPLAY_EXIT=1`) | The frozen C1 predicate (verbatim below) true at the measured revision, including receipt + witness **committed** there, battery 6/6, r39/r40/r41 replays refused, and a settled policy-v2 wave ≥ 64 seats with no do-nothing reach. On pass only, the commented capability row at the end is uncommented. |
| C2 calibration — round-41 routed-defect ledger closure (verifier D1–D4), measured by a frozen checker | `node .ufo/waves/round-42/counters/check-routed-defects-round42.mjs --rev <REV> --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --json` | "At baseline 34e177959d1b7ce04afb85a001420e02631ce79e the checker exits 1 with findings r1a-receipt-absent, r1b-witness-absent, r2-supersession-absent, r3-baseline-file-empty, r4-quarantine-absent (red control committed pre-data at .ufo/waves/round-42/controls/c2-baseline-red.json)." — observed: that control records exit 1 with **seven** findings (the five quoted plus `r2-s146-not-rejected`, `r4-slice-absent`; F1 below). At the freeze, `c2-at-freeze.json` (rev `9b6de3a1…`) records `predicate:false`, `findingCount:1`, `r4-quarantine-absent` only — r4 is the by-design residual at freeze | Checker exit 0 at the measured revision: r1a/r1b committed and sha256-bound to the committed r41 measure record; r2 S148 begins `supersedes S146`, remainder ≤ 25 words verbatim from the committed staged HTML, S146 status `rejected`; r3 baseline control committed, nonempty, carrying the ls-tree command and the digit 0; r4 38-id re-adjudication TSV committed, no duplicates, verdicts in enum, every evidence path a committed blob ≥ 200 B |

### C1 — frozen predicate (verbatim, `claims.json:C1.predicate`)

> The counting command exits 0 on a fresh nonce with driver exit 0, counter exit 0, predicate true and empty findings AND the produced receipt.json and receipt.witness.json are committed at the measured revision AND node scripts/measure-c1-round41.mjs --battery reports all six cases pass (five contamination vectors exit 2 with environment-loader-contamination, clean probe exit 0) AND direct counter v4 replay of the committed r39, r40 and r41 receipts each refuses (nonzero exit) AND the round's validated policy-v2 wave settled with WAVE-DONE over at least 64 seats and no settled seat report demonstrates a do-nothing reach of this predicate (a forgery or counter hole that produces exit 0 without a browser run).

### C1 — frozen kill rule (verbatim, `claims.json:C1.killRule`)

> If any settled seat demonstrates a do-nothing reach, or any control refuses, or the receipt bytes are not committed at the measured revision, the claim is not admitted: no capability row enters the SCORECARD table, coverage holds its score, and the finding is routed to the next round. The predicate, kill rule and counting command are frozen before any seat scores; they are never amended after wave data.

Admission is conditional on the whole sentence: a green live run alone is a
measurement, not an admission (see §C1 frozen-before-data live state).

### C2 — frozen predicate (verbatim, `claims.json:C2.predicate`)

> At the measured revision the checker exits 0: (r1a) corpus/evidence/round41/playwright-egress/receipt.json is a committed blob of at least 1000 bytes whose sha256 equals receiptSha256 in the committed .ufo/waves/round-41/measure/c1-measure.json and whose bytes parse as JSON; (r1b) receipt.witness.json likewise equals witnessSha256 and parses; (r2) corpus/SOURCES.md at the revision carries row S148 whose teaches cell begins `supersedes S146` and whose remainder is a verbatim substring of the committed .ufo/waves/round-41/sources/node-cli-v24.21.0.html of at most 25 words, and row S146's status cell is `rejected`; (r3) .ufo/waves/round-41/controls/c1-baseline-noop.out is a committed nonempty blob recording the ls-tree counting command and the digit 0; (r4) .ufo/waves/round-42/quarantine/re-adjudication.tsv is committed with exactly the 38 identifiers of the committed .ufo/waves/round-42/quarantine/slice-ids.txt, no duplicates, every verdict in {present, absent, misbound, partial, unreachable}, and every evidence path a committed blob of at least 200 bytes.

### C2 — frozen kill rule (verbatim, `claims.json:C2.killRule`)

> No post-data predicate amendment. Any mutation seat that greens a weakened checker copy without the real repairs, or any accepted fabricated/empty evidence, refuses admission the same way: calibration holds its score and the hole is routed.

### C1 — frozen-before-data live state (measurement, not admission)

Observed 2026-10-28 from `.ufo/waves/round-42/measure/c1-measure.json`
(`c1-measure.exit` → `MEASURE_EXIT=0`): `driverExit` 0, `counterExit` 0,
`counter.predicate` true, `counter.findings` `[]`, `nonceMatches` true,
`receiptSha256`
`3984455276a5b54a0a7652fc76923eb46d446f0630556d6775abc7c1fd317b7e`,
`witnessSha256`
`163f4eba7f8b6c93daa0e5742b0ade81ee16ff716cc27bc578fb76795a57d339`.
Receipt (`corpus/evidence/round42/playwright-egress/receipt.json`): nonce
`94c0f0ef…e21ab`, two runs — 126 and 134 samples, first-to-last sample spans
16,356 ms and 17,790 ms, identical `firstShotSha256`
`252cafa6e9b2f656be8c1107fc5fa2714cc50124d50a902c2a09beb39709be12`,
`browserVersion` 157.0, `egressNonLoopback` 0, `survivors` 0, both runs
`portClosed:true`. Battery control `.ufo/waves/round-42/controls/c1-battery-r42.json`
records 6/6 cases pass (forger-r39-verbatim, forger-r41-retargeted, node-path,
ld-preload, esm-loader each exit 2 `environment-loader-contamination`; clean
exit 0). Replay controls: `c1-r39-replay-r42` exit 1, `c1-r40-replay-r42` exit 1,
`c1-r41-replay-refused` exit 1.

The committed-bytes leg is **not** met at draft time:
`git status --porcelain -- corpus/evidence/round42` → `?? corpus/evidence/round42/`;
`git ls-tree -r --name-only HEAD -- corpus/evidence/round42 | wc -l` → 0. The
wave is dispatched but not settled (no `w1-results.json`, no WAVE-DONE). Under
the frozen predicate this block changes no verdict: C1 remains **pending**, no
capability row, no coverage score change.

### C2 — frozen-before-data live state

`.ufo/waves/round-42/controls/c2-at-freeze.json` (rev `9b6de3a1…`):
`predicate:false`, `findingCount:1`, finding `r4-quarantine-absent`
(`.ufo/waves/round-42/quarantine/re-adjudication.tsv not committed at REV`);
`c2-at-freeze.exit` → `C2_AT_FREEZE_EXIT=1`. `.ufo/waves/round-42/quarantine/slice-ids.txt`
is committed at HEAD with 38 lines; `re-adjudication.tsv` is absent from both
HEAD and the worktree. Consequently C2 is **pending**, calibration holds 9, and
no numeric score moves without a later rubric.

## Round 42 — waves and seats

**PENDING — filled by L1 after WAVE-DONE; never padded, dead seats recorded and
never replaced.**

- Declared dispatch (not a settled count): one policy-v2 wave `w1`,
  `.ufo/waves/round-42/w1-dispatch.json` `counts` = spawn 64 / resume 0 /
  total 64; `w1.ready` names the dispatch, `w1.ready.dispatched` =
  `1793201876.0697021`. This is the queue, not the result.
- Settled seats, role mix, dead/incomplete seats, WAVE-DONE: **PENDING** —
  source `.ufo/waves/round-42/w1-results.json`, summarized by
  `node .ufo/waves/round-42/parse-w1-results.mjs .ufo/waves/round-42/w1-results.json`
  (total, roles, dead, emptyOutput, noVerdictLine, per-seat `VERDICT`).
- Per-seat reports: `.ufo/waves/round-42/w1/<SeatName>/report.md`: **PENDING**.
- A seat's own `VERDICT ok` is not admission evidence; the C1 kill rule is
  evaluated over settled seat reports, including the attack seats.

## Round 42 — capabilities / planned / saturation / retired

- **capabilities:** none entered at draft time. `AXES.md` §Capabilities: "Rows
  enter only through a round that demonstrates the capability running"; the C1
  predicate is not yet satisfied (receipt uncommitted, wave unsettled). The
  pending row for `playwright-firefox-loopback-tcp` is carried **commented** at
  the end of this section and is uncommentable only on full C1 pass. On
  admission it lands in a `### Capabilities — round 42` table (round-32/35
  practice), with last cell `42`.
- **axes:** held at the round-start scores — depth 9, coverage 9, operability 9,
  freshness 9, calibration 9, adjacency 8. No axis was harmed by either claim:
  C1 is coverage-scoped, C2 is calibration-scoped, and neither edits an
  instrument another axis rests on. No numeric score changes without a rubric
  (the discipline of rounds 35–41); a passing predicate is recorded as met, not
  as a scalar bump.
- **planned (round 43):** PENDING — L1 names 1–3 claims, each with its target
  axis or capability; this seat asserts no planned item.
- **saturation:** 8 / window 3 (unchanged). If C1 is admitted, the capability
  row restarts the stagnation window (round 43 = position 1).
- **retired:** none — no axis is saturated past usefulness and none is a wrong
  fit.

## Round 42 — trend verdicts

**PLACEHOLDERS.** A verdict is written only from settled wave output and the
measured revision; `improved` before WAVE-DONE is the round-41 defect.

| Trend | Verdict | Evidence |
|---|---|---|
| expansion | PENDING (L1 after WAVE-DONE) | Candidate: C1's capability row is a repertoire entry, not knowledge expansion; no knowledge note is claimed by round 42. |
| quality | PENDING (L1 after WAVE-DONE) | Candidate: C2 closes routed defects D1–D4 over committed bytes with red/green controls; battery 6/6 and three replay refusals are the instrument side. |
| discernment | PENDING (L1 after WAVE-DONE) | Only an outside non-author spot-check counts (`LEARNING.md:37-43`); dispatched seats do not qualify, so at most this stays `unchanged` unless the operator's spot-check runs. |

## Findings routed while drafting (frozen bytes not amended)

- **F1 — C2 before-state enumeration is shorter than its own control.**
  `claims.json:C2.beforeState` lists five findings; the committed
  `.ufo/waves/round-42/controls/c2-baseline-red.json` records exit 1 with seven
  (`r2-s146-not-rejected` and `r4-slice-absent` are omitted from the sentence).
  The draft quotes the frozen sentence and states the control's actual seven
  beside it. Route: next round's C2 text; the frozen bytes are not amended.
- **F2 — measured live state sits inside the "declared" table in the current
  `SCORECARD.md` round-42 block.** The landed block's C1 target cell carries
  "measured 2026-10-28: exit 0, spans 16,356/17,790 ms", which is a measurement
  outcome inside a pre-data declaration. This draft moves it into a separate
  §C1 frozen-before-data live state block that states explicitly it changes no
  verdict. Route: L1's splice; no amendment to `claims.json`.
- **F3 — the global `## Capabilities` table still reads "— none yet —"**
  (`SCORECARD.md:381-387`) although per-round capability tables carry rows
  (rounds 16, 17, 25, 32, 35). A reader of that table alone derives "no
  capability ever" — the nudge input. Not fixed here (append-only discipline,
  draft only); route to L1.

## PENDING CAPABILITY ROW — do not uncomment before admission

Parser note (why this is shaped as a bare row inside a comment): the
`check-selfassessment.mjs` m4 input `capabilityRounds()` does not strip HTML
comments or fences — it reads any table row under a header cell matching
"First-working round" and any prose "First-working round: N". A commented row
written as a full table with that header would register round 42 as a capability
entry and silently reset a later round's stagnation window. This block therefore
carries the row **without** that header and without the colon form, so the m4
input ignores it while it is pending.

```
<!-- capability row, C1 admission only:
| playwright-firefox-loopback-tcp | Observe a loopback browser session's TCP sockets on both `ss` and `/proc/net/tcp` with a nonce-bound, loader-clean, witness-attested receipt | `corpus/evidence/round42/playwright-egress/receipt.json` + `receipt.witness.json` committed at the measured revision (receipt sha256 `3984455276a5b54a0a7652fc76923eb46d446f0630556d6775abc7c1fd317b7e`, witness `163f4eba7f8b6c93daa0e5742b0ade81ee16ff716cc27bc578fb76795a57d339`), scored by `.ufo/waves/round-41/counters/c1-session-bound-v4.mjs` (digest `cd71a59efa575fc260c4e487b7d52f69a9cd9f3b98bc6d4333abdb9a0cff126a`) through `.ufo/waves/round-42/measure/c1-measure.json`; controls `.ufo/waves/round-42/controls/c1-battery-r42.json` (6/6), `c1-r39-replay-r42.json` / `c1-r40-replay-r42.json` / `c1-r41-replay-refused.json` (exit 1 each), `c1-baseline-tree-count.txt` (0 at baseline) | 42 |
-->
```

Uncomment instructions for L1: (1) confirm every C1 predicate leg at the
measured revision, including WAVE-DONE and no do-nothing reach; (2) replace the
`## Capabilities` placeholder only if the lane also closes F3, otherwise place
the row in a new `### Capabilities — round 42` table with the standard header
`| Capability | What it can now do | Evidence pointer | First-working round |`;
(3) keep the last cell `42` so the nudge window restarts; (4) do not uncomment
on a live-run-only pass — the kill rule names the committed-bytes and
no-do-nothing conditions.
