# ConnectScope — sibling-overlap scan: round-22 oracle/chronology artifacts vs sibling/fleet scheduler and wave-review tooling

Seat: `TabiR22-2.ConnectScope-16` (connector). Item: do tabi round-22 oracle/chronology artifacts
duplicate or contradict sibling lanes' scheduler/wave-review tooling? Static review only.

- Reviewed revision: `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` (lane `tabi-shokunin`, HEAD at scan).
- Method: `git show`/`git ls-tree`/`git grep`/`git cat-file` reads of the reviewed revision and the
  fleet; Python JSON parses; `sha256sum` over blobs. No lane script was executed; no clone created;
  no browser, network, REA, install, or VCS write. Worktree files (untracked `w2b/`, `checks-at-e3cf4e0.json`)
  are labelled as worktree data, not as reviewed-revision bytes.
- Fleet state read at scan: `~/.local/state/shokunin-hyaku/wave-cap` = `320`;
  `.ufo/reports/round-22/` holds 11 sibling reports, no `tabi.md`; `MANIFEST.json` has tabi rows
  through round 21 only; the watchdog-format `.ufo/state/tabi.round` still reads `1` and is unused by
  the active hyaku driver, which logged `launch tabi round=22` at 11:47 local.

## 1. Tooling inventory (what the artifacts are being compared to)

Fleet scheduler / closure surface:

| Tool | Path:line | Invariant |
|---|---|---|
| seat gate | `scripts/hyaku/wave-slot.sh:79-84` | grant iff `live + pending + seats <= CAP`; header `:6-9` already records substrate refusals at a 100-job limit |
| seat estimator | `scripts/hyaku/wave-live.py` (called `wave-slot.sh:61-66`) | global metadata-tail estimate, not per-session occupancy |
| lane driver | `scripts/hyaku/inline.sh:107-126` | `verify` needs `report_of` on `.ufo/reports/round-<n>/<lane>.md`; uncommitted lane paths are only a WARN (`:126`) |
| round-close predicate | `scripts/shokunin-watchdog.sh:140-150` | report content (SHONEN + `MIN_REPORT_BYTES`), not existence |
| protocol law | `PROTOCOL.md:117-122`, `:146-151` | report lands last, cited hash must be a committed lane HEAD; worktree-only changes do not count |
| cross-lane report gate | `.ufo/waves/aggregator-r11/cross-lane-gate.mjs:62,159-166` | report body ≥1024 B, cited commits resolve |

Sibling per-lane wave-review tooling:

| Tool | Path:line | Invariant |
|---|---|---|
| wave accounting | `tameshi-shokunin/tools/wave-accounting.py:76,92,98,109,117,131-137` | unique members/agents, no replacement, `MEMBERSHIP_MISMATCH`, claimed totals == observed, persisted `bundle_sha256` checked |
| wave runner | `kama-shokunin/.ufo/waves/round-22/run.py:22-28` | external `--recipe`; measurement requires a clean committed tree |
| receipt provenance | `mado-shokunin/.ufo/waves/round-18/receipt-check.py:27-35,147-158` | `measured_commit` ancestor of read revision; tool bytes at read revision → else `STALE` |
| wave spec | `lore-shokunin/.ufo/waves/round-93/validate_wave_spec.py:28,59-75,90` | `parent-only-after-actual-results`; per-seat `report_receipt` bound to result evidence |
| frozen case set | `kake-shokunin/.ufo/waves/round-22/matrix.py:15-18` | case names copied into code, "not a file glob" |
| oracle self-pin | `mori-shokunin/.ufo/waves/round-22/oracle-reconcile.py:23` | oracle records `requirements_sha256`, `fixture_builder_sha256`, `oracle_sha256` |

Tabi round-22 artifacts compared: `measure-c1.mjs`, `selftest-c1.mjs`, `fixtures/expected.json`,
`check-review-chronology.mjs`, `debt-expectations.json`, `historical-chronology-input.json`,
`historical-review-contrast.json`, `review-snapshot.json`, `run-checks.py`, `checks-pre-w2-0f24164.json`,
`checks-at-e3cf4e0.json` (worktree), `w1-event-history.json`, and the W2/W2b wave records
(`w2-spec.json`, `w2-validation.json`, `w2/swarm-registry.json`, `w2-spawn-result.json`,
`w2-cap-refusal-*.json`, `w2-attempt*-result.json`, `w2-retry-slots.json`, `w2-capacity-events.json`,
plus untracked `w2b-*`).

## 2. Answer to the item

- **No implementation duplication of sibling lane tools.** Tabi's checkers are lane-private
  (`tabi-round22-*` schemas), and no sibling lane consumes them: `grep -rl` over
  `kake|kama|mori|mado|tsukuroi|kagi|kaidoku` round-22 wave dirs for `measure-c1.mjs`,
  `check-review-chronology`, `tabi-round22`, or tabi's round-22 path returned nothing.
- **No schema break on the shared harness format.** `w2-validation.json:2` and
  `w2b-validation.json` use `ufo-swarm-wave-dispatch-v1` (the schema used by 18+ lanes) and stay in
  the policy band (`waveMinLanes 64`..`waveMaxLanes/hardCeiling 100`, `w2-validation.json:4-14`);
  `w2b` declares 65 seats, inside the band.
- **Chronology direction is compatible.** Tabi requires measurement ≤ review observation
  (`check-review-chronology.mjs:226-228`); `mado receipt-check.py:27-35` requires
  `measured_commit` ≤ read revision and `lore validate_wave_spec.py:28` requires parent receipts only
  after results. I found no sibling rule in the opposite direction.
- **Contradictions do exist at the seams** — six, below. The two load-bearing ones are the wave
  admission receipts claiming capacity that the substrate refused (F1) and the round's only 35/35
  receipt plus the whole non-author wave being worktree-only against the fleet's "lands last" law (F2).

## 3. Findings

### F1 — Scheduler "granted" vs substrate "refused": tabi's wave receipts record both, no gate reconciles them
Class: contradiction with shared scheduler semantics; duplication of sibling wave-accounting purpose
without its claimed-vs-observed invariant.

Evidence (reviewed revision):
- `.ufo/waves/round-22/w2-retry-slots.json:3-9,15-21,...` — 7 slot receipts, attempts 3-9, each
  `acquireStdout: "granted lane=tabi wave=r22-w2 seats=64 live=<115-159> pending=<...> cap=320"` and
  `releaseStdout: "released lane=tabi wave=r22-w2"`.
- `.ufo/waves/round-22/w2-cap-refusal-01..09,11..14.json` — 13 refusal receipts, attempts 1-9,11-14,
  every one `spawnedSeats: 0`, reason `whole64 payload refused at100-job cap; no replacement seats`.
- `.ufo/waves/round-22/w2-spawn-result.json:1-8` — `details.results: []`, no `attempt`/`at`.
- `.ufo/waves/round-22/w2-validation.json:16-20` — `counts.spawn: 64` (declared), registry 64 members
  all `agentId: null` (`:25-30`).
- Scheduler: `scripts/hyaku/wave-slot.sh:79-84` grants on a global estimate; its own header `:6-9`
  records the 100-job refusals. State file says `cap=320`.
- No gate consumes the divergence: the cohort built at `run-checks.py:110-145` (35 rows) contains none
  that read the W2/W2b wave records; `checks-at-e3cf4e0.json` (worktree) is `verdict: clean`, 35/35.

Smallest counterexample: the 7 grants + 13 refusals are simultaneous evidence that `granted` did not
imply spawnable, while `w2-validation.json:17` reports 64 spawns. A reader who takes the validation
count (the only committed count) concludes 64 seats ran; the committed chain instead supports 0 seats
across 14 attempts.

Preserving positive: `w2-capacity-events.json` records the same failure typed (`spawnedSeats: 0`,
`disposition`), and `checks-pre-w2-0f24164.json` is committed — the evidence is retained, only
unconsumed. Sibling `tameshi tools/wave-accounting.py:109,117` would have flagged this class as
`MEMBERSHIP_MISMATCH`/`TOTAL_MISMATCH`; tabi has no equivalent membership/outcome bundle.

Smallest fix: one typed attempt ledger (attempt, `at`, payload sha256, grant line, refusal or
`spawnedSeats`, disposition) covering attempts 1..N, plus one serial gate row that requires
`observed spawnedSeats` to reconcile with the declared seats (an all-refused chain is a valid red,
not a pass). Record the substrate's per-session 100-job refusal as a grant-invalidating event.

Axes/surfaces: OPERABILITY + verification; no depth/corpus content touched.

### F2 — Lane-local 35/35 and the whole w2b wave are worktree-only; the fleet closes rounds on committed report bytes
Class: contradiction with fleet scheduler/protocol durability; divergence from the 11 sibling lanes
that filed committed round-22 reports.

Evidence:
- `git -C tabi-shokunin status --porcelain=v1 -uall` → 67 `??` paths at scan (before this report
  existed), including
  `.ufo/waves/round-22/checks-at-e3cf4e0.json` (490,406 B), `w2b-spec.json`, `w2b-validation.json`,
  `w2b-spawn-result.json`, `w2b-cap-refusal-01..11.json`, and all `w2b/*.md` seat reports.
- `git show e3cf4e0:.ufo/waves/round-22/checks-at-e3cf4e0.json` → `fatal: path … exists on disk, but not
  in 'e3cf4e0…'` (exit 128). The only 35/35 receipt for the reviewed revision is not in the revision.
- `.ufo/reports/round-22/` holds `kagi.md` … `tsukuroi.md` (11 files, 2.6–20.7 KB), no `tabi.md`.
- `PROTOCOL.md:117-122` — "A lane report lands last … Landed means committed, so changes that exist only
  in a working tree do not count for the round"; `:146-151` — the report path is the driver's completion
  signal. `scripts/hyaku/inline.sh:126` only WARNs on uncommitted lane paths.

Smallest counterexample: a `verify` against the fleet report path can succeed while
`checks-at-e3cf4e0.json` and the entire non-author W2b wave remain untracked; a later `git clean`, a
respawn (PROTOCOL.md:185-189 allows a revert of uncommitted lane changes), or the next round's tree
sweep can lose them, and a reader at the cited hash cannot see the
evidence that admitted the round.

Preserving positive: the W1 repair chain did commit its receipts
(`checks-pre-w2-0f24164.json`, `post-crash-repair.json`, attempt/refusal files 01-09/11-14), and 11
sibling lanes committed round-22 reports. The lane knows the pattern; the repaired checkpoint's receipt
and the fresh wave are the exception.

Smallest fix: commit `checks-at-e3cf4e0.json`, the `w2b` wave records and `w2b/` reports before the
fleet report; cite that lane HEAD in `.ufo/reports/round-22/tabi.md`. Optionally have
`run-checks.py` assert a clean lane status at end (precedent `kama run.py:26-27`).

Axes/surfaces: contract/verification durability; no runtime surface.

### F3 — Serial-check oracle inputs come from the candidate revision (self-referential), unlike sibling external-recipe or persisted-digest gates
Class: duplication of sibling wave-review purpose with a weaker trust root.

Evidence:
- `run-checks.py:48-55` reads the cohort from `revision:.ufo/waves/round-19/final/harm-at-measured.json`
  and only *records* `cohortSourceSha256` (`:55`); no expected-constant comparison.
- `run-checks.py:68-76` reads `preservation-baseline.json` from the cloned candidate and compares the
  candidate tree against that same baseline; `:110-114` builds the expected gate cohort from that
  candidate's `historical['runs']`; `BASE` is a constant inside the same script (`:24`).
- Sibling trust roots: `kama run.py:22-28` (external recipe + clean tree),
  `tameshi tools/wave-accounting.py:131-137` (persisted `bundle_sha256`, mismatch → exit 2),
  `mado receipt-check.py:147-158` (`NOT_ANCESTOR`/`SHA_MISMATCH`/`STALE` across revisions).

Smallest counterexample: a candidate revision that edits `.ufo/waves/round-19/final/harm-at-measured.json`
(dropping the failing runs), updates its digest entry in `preservation-baseline.json`, and adds that
path to the baseline's `mutableDocs` list produces a green `run-checks.py`: `mismatches` (`:75-76`),
`prefixes` (`:78-81`) and `scopeErrors` (`:82-87`) all read candidate bytes, and the baseline is read
from the candidate (`:68`). The script's own `BASE` constant (`:24`) is candidate bytes as well.

Preserving positive: `measure-c1.mjs:22-23,392,414` hard-pins its expectations and producer digests, so
the lane already has the pin pattern and applies it to the oracle; `checks-pre-w2-0f24164.json` and
`checks-at-e3cf4e0.json` both record `cohortSourceSha256 dc947014d18e9495…`, i.e. the anchor is present
as evidence but not enforced.

Smallest fix: pin `preservation-baseline.json` sha256 and `cohortSourceSha256` as constants in
`run-checks.py` (or require them as arguments) and fail on mismatch. One constant each; no new schema.

Axes/surfaces: verification trust root; no production content.

### F4 — The oracle's control set (`fixtures/expected.json`) is unpinned, was edited in the same commit as the oracle, and the gate checks only exit 0
Class: contradiction with the sibling frozen-case/digest convention; masked-negative risk.

Evidence:
- `selftest-c1.mjs:26` loads `fixtures/expected.json` with no digest or frozen name list;
  `:409` iterates `EXPECTED.cases`; `:460-465` derives the verdict from `passed === reports.length`
  only (no minimum case count).
- `e3cf4e0` changed that file `cfe81b47…` → `b1380a0b…` (sha256) and changed
  `measure-c1.mjs`/`selftest-c1.mjs` in the same commit; `post-crash-repair.json` filesBefore/After
  records both digests and defect D3 records an expected finding changed after a failing positive.
- `run-checks.py:115-121` expects `--selftest` exit 0 with no `expectedMetrics` for
  `oracle22-selftest`; `checks-at-e3cf4e0.json` shows `observedMetrics: None` for that row.
- Sibling conventions: `kake matrix.py:15-18` freezes case names in code; `mori oracle-reconcile.py:23`
  records requirements/fixture-builder/oracle digests. `measure-c1.mjs:22,392` pins *its* expectations,
  so the inconsistency is internal to tabi.

Smallest counterexample: delete the two controls added by the repair (`native-landing-errors`,
`native-landing-wrong-query`) from `fixtures/expected.json`; `selftest-c1.mjs` exits 0 at 42/42 and the
`oracle22-selftest` row still passes. The "44/44 with two new failure-capable controls" claim is then
not retrievable from any gate output.

Preserving positive: the mutated expectation for `native-submits-empty` is load-bearing —
`selftest-c1.mjs:382-390` compares the emitted finding id and fails on a mismatch — so the file is a
real oracle, not a pass-through; only its identity is unpinned.

Smallest fix: pin `fixtures/expected.json` sha256 (and a frozen case-name/count tuple) in
`selftest-c1.mjs`, or add `expectedMetrics: {cases: 44, passed: 44}` to the `oracle22-selftest` row.

Axes/surfaces: verification failure-capability; no corpus/depth change.

### F5 — Chronology checker: unpinned selftest expectations, and its event schema cannot consume the lane's own retained W1 census
Class: duplication of sibling provenance purpose without a pin; integration gap between two of the
round's own chronology artifacts.

Evidence:
- `check-review-chronology.mjs:13` reads `debt-expectations.json` for `--selftest`; no digest pin
  (contrast `measure-c1.mjs:22,392`). `run-checks.py:116,120` asserts exit 0 only.
- Input event schema requires `seat` + `type` (`check-review-chronology.mjs:120-125`) and classifies
  `agent://all`/`route:"broadcast"` as an anomaly (`:148-152`, selftest case `routing_broadcast` →
  exit 1 in `debt-expectations.json`).
- The lane's retained W1 census `w1-event-history.json` (168,802 B) has 64 seats whose events use
  `kind`/`line`/`at`/`from`/`broadcast`, with transcript `sha256` per seat — no `seat`/`type`/`route`/
  `recipient` fields, and 0 broadcast events. It cannot be supplied as `event_history` without a
  semantic remap.
- `historical-chronology-input.json` has no `event_history`, so the expected red run necessarily emits
  `event_history_unavailable` (observed in `checks-at-e3cf4e0.json`: findings
  `[review_scope_gap, producer_digest_mismatch, artifact_scope_mismatch, acquisition_after_review_observation, event_history_unavailable]`).

Smallest counterexample: delete the `routing_broadcast`/`peer_revival_after_failure` cases from
`debt-expectations.json`; the remaining cases still pass and the selftest exits 0, so the anomaly
taxonomy is contract-by-file. Separately, the 64-seat census — the W1 repair's own evidence — cannot
exercise the event-history half of the checker at all against real data.

Preserving positive: `run-checks.py:122-127` behaviorally pins the *input* (`historical-chronology-input.json`
must yield `review_scope_gap`, exit 1), and `review-snapshot.json:17-18` pins `debt-expectations.json`
at `8e0ab966…` for the 0f24164 boundary (it is unchanged at e3cf4e0). The ledger of real facts is solid;
the selftest contract and the census adapter are the gaps.

Smallest fix: pin the `debt-expectations.json` digest in the checker (constant) or as an
`expectedMetrics` digest on the gate row; add a documented census→`event_history` mapping (or a small
adapter fixture) and one case fed from the 64-seat census; decide explicitly whether a routine
`agent://all` broadcast is an anomaly (currently yes by selftest, contrary to harness messaging, and
unexercised on retained real data).

Axes/surfaces: chronological verification; no new acquisition.

### F6 — W2 attempt chain is internally unlabeled, so no sibling accounting tool could order it
Class: duplication of wave-accounting surface with missing identity keys.

Evidence: 13 refusal receipts (attempts 1-9,11-14, each with `attempt`/`at`/`spawnedSeats`); 9
`w2-attempt*-result.json` files, of which attempts 02-09 have **no** `attempt`/`at` keys and only
attempt 11 does; 7 retry-slot entries (attempts 3-9); `w2-spawn-result.json` has neither `attempt` nor
`at`. Attempt 10 has no receipt of its own: it exists only as free text in
`w2-cap-refusal-11.json:16` ("attempt 10 by dead TabiR22 is unrecorded: slot granted 16:10:37Z, kernel
died 16:10:51Z before any result; no seat transcripts exist, so 0 seats spent").

Smallest counterexample: an attempt-ordered reader cannot tell which attempt `w2-spawn-result.json`
belongs to, and attempt 10 is recoverable only from a `note` string inside another attempt's refusal —
not from any `attempt` field or ledger row, so the 14-attempt total is prose, not a join.
Preserving positive: `w2-cap-refusal-*.json` do carry `attempt`, `at`, `spawnedSeats`; the attempt-10
note states the exact grant and death times; and the w2b chain is complete (refusals 1-11 plus the
attempt-12 spawn). The facts exist; the fix is a join, not new data.
Smallest fix: add `attempt`/`at` to `w2-spawn-result.json` (and attempt numbers to the 02-09 results),
carry attempt 10 as a typed row, or emit the single ledger proposed in F1.

Axes/surfaces: accounting/verification; no production content.

## 4. Explicit non-findings (checked, no contradiction)

- Shared harness schema `ufo-swarm-wave-dispatch-v1` / `ufo-swarm-registry-v1`: tabi conforms
  (`w2-validation.json:2`, `w2b-validation.json`); policy band 64-100 respected.
- `review-snapshot.json` pinning `reviewedRevision: 0f24164` while checks run at `e3cf4e0`: not a stale
  binding — its `scope` text says "Any later changes get separate L1 serial evidence and fresh
  non-author closure", and `post-crash-repair.json` carries the later digests. (That later evidence is
  the worktree-only set in F2.)
- Skip of `check-user-round-contract-production` (`run-checks.py:56-57`): the producer and its inputs
  are frozen in `preservation-baseline.json` (`scripts/check-user-round-contract.mjs`,
  `corpus/lessons/round-1{7,8,9}.md`), and the skip is declared with the historical exit — a weaker
  but honest exemption. It does not re-run the gate at the candidate revision; noted, not graded.
- `run-checks.py` itself invoked from the worktree: `checks-at-e3cf4e0.json` records
  `producerSha256 c501034d…c501034d`, equal to the e3cf4e0 blob, so the executed bytes matched the
  reviewed revision at that run.

## 5. Out of scope (not graded here)

Author authenticity/injection resistance; the correctness of the 12 lifecycle rows or of the WebMCP
semantics; seat report prose and verdicts; whether C1's 0→12 target is the right claim; browser
behaviour, coverage, capability, promotion; any fleet or sibling-lane mutation.

## 6. Unrun checks (honest)

- Did not execute `measure-c1.mjs`, `selftest-c1.mjs`, `check-review-chronology.mjs`, `run-checks.py`,
  `wave-slot.sh`, `wave-live.py`, `inline.sh`, the fleet `cross-lane-gate.mjs`, or any sibling tool.
  Exit codes below are for the read commands only.
- All "smallest counterexample" constructions above are static: I did not apply the mutants or run the
  checkers. Each names the bytes that would be read, so it is executable by a successor without
  inference.
- Did not read the 65 w2b seat reports' content (names/sizes only); did not validate W2b seat verdicts.
- Did not open a browser, REA session, network, or any credential surface; no installs.

Exercised read commands (all from the lane or fleet, no writes):
`git show <rev>:<path>` (many, exit 0; one deliberate absent-path probe exit 128 for
`checks-at-e3cf4e0.json`), `git ls-tree -r` (exit 0), `git status --porcelain=v1 -uall` (exit 0,
67 lines), `git grep` (exit 0), `git cat-file -t 07a46044…` in the fleet (exit 0; commit exists, no
`scripts/check-user-round-contract.mjs` in that tree), `sha256sum` over blobs (exit 0), Python JSON
parses (exit 0). Two of my own ad-hoc Python snippets initially mis-read stdin/None (my errors, no
lane implication); their corrected reruns are the cited results.

## 7. One bounded move (UFO-FSD connector output)

- Axes affected: **OPERABILITY** (failure-capable verification rows) and the **verification surface**;
  no harm to depth content (12→12), scalar 8, corpus population, coverage, capability, or promotion.
- Proposed move: label this work post-w2b and add **one** serial gate row, `wave-outcome-reconcile`,
  plus **one** digest pin, both over already-committed artifacts and no new run:
  1. reconcile declared wave size (`w2-spec.json` items / `w2-validation.json` counts) against observed
     receipts (refusal `spawnedSeats`, `w2-spawn-result.details.results`, retry grants) and require a
     complete attempt chain — it must RED on today's tree (validation claims 64 spawns while every
     observed receipt reports 0 spawned seats, and `w2-spawn-result.json` carries no attempt id);
  2. pin `fixtures/expected.json` and `debt-expectations.json` sha256 so the control/oracle contracts
     cannot move inside the same commit as the tool.
- Why this is the smallest non-obvious move: it converts the round's already-retained, currently
  unconsumed divergence evidence into a checker that fails today and passes only after the receipt
  chain is committed and labeled — the exact seam where the lane's private oracle/chronology tooling
  meets the fleet scheduler, and where sibling waves have accounting that this lane lacks.
- Risks: author-side self-blessing of the pin values; mitigated by committing the w2b receipts and
  publishing both digests in the round report for a non-author check, and by the gate's demonstrated
  red on the current tree. Second risk: scope creep past C1 — keep it as a conformance/no-harm row,
  not a new claim or capability.
- Verification: run the new row on `e3cf4e0` (expect exit 1 on the attempt-chain reconciliation) and on
  a receipt-committed successor (expect exit 0); confirm the existing 35 rows and the c1 metric
  (`c1_semantically_checked_lifecycle_rows` 12 at e3cf4e0, 0 at BASE) are unchanged.
