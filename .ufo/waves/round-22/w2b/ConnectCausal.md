# ConnectCausal — C1 and the unclaimed chronology repair: separable claims, one shared generation node

Seat: `TabiR22-2.ConnectCausal-16` (connector, leaf). Revision under review:
`e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` (landed, pushed). Lane root
`/home/vgpnk/Projects/shokunin/tabi-shokunin`. Read-only static review: no lane
script, browser, REA, service, delegation, seat messaging or VCS mutation was
used. No tool was installed or updated. The only write is this report.

Item (verbatim, `.ufo/waves/round-22/w2b-spec.json:310`):

> Causal separability: is C1 verifiable without the unclaimed chronology repair
> and vice versa? Cross-link findings of row reviewers into one causal picture.

Adjacent item, not answered here (`.ufo/waves/round-22/w2b-spec.json:185`):
`check-review-chronology.mjs (unclaimed conformance repair): selftest design,
actual historical input expected review_scope_gap; does it misclassify any
legitimate review? Exact counterexamples.`

## 1. Axes named

- **A. C1 operability verifiability** — `c1_semantically_checked_lifecycle_rows`
  = 12 failure-capable rows on the finalized round-21 generation, target 0→12.
- **B. W2 chronology-conformance verifiability** — the classifier plus the
  retained review-vs-acquisition record, expected red.
- **C. Causal attribution integrity** — whether a closure can state which
  receipt supports which claim, without smoothing a red into a green.
- **D. No-harm / frozen revision** — no production edit, new browser run,
  coverage, capability or scalar, and no disturbance of `e3cf4e0`.

## 2. Answer

**Both directions hold at the computation level, and both are already visible in
the retained serial receipts.** C1 is green at `e3cf4e0` while the chronology gap
is still red and unrepaired; chronology was green at `0f24164` while C1 was red.
Neither check imports, executes or reads the other's inputs, and neither mutates
the lane. The two claims are therefore separable.

**They are not evidence-independent in one direction.** Both name the same two
round-21 generations. The chronology input's acquisition-side digests are exactly
the finalized-generation digests that only C1 cryptographically verifies; the
chronology checker verifies no supplied digest at all. So C1 corroborates the
chronology record's acquisition identity, while chronology corroborates nothing
about C1. This is a one-way evidential edge, not a dependency: the chronology
verdict is unchanged if C1 fails, and C1's value is unchanged by the gap.

**The contradiction that must be stated, not smoothed:** C1's 12 rows are measured
on the finalized generation (producer `bc11e4…`, receipt `4bc796…`), which
`ReviewChronology.md:23-38,209-215,311-315` and the oracle note lines 91-99 record
as never W2-reviewed. The reviewed generation is the bounded v4 one (producer
`5363d5…`, receipt `323ccd…`). "C1 is verified" therefore means "12 digest-bound
semantic rows on the finalized, never-W2-reviewed generation, supported by L1
serial checks and this author-side W2b falsification" (subject to the in-flight
fitting question in §5.2). It does not mean "12 reviewed rows." Conversely, "the
chronology gap is unrepaired" does not lower
C1's count. A sentence that fuses the two — for example "C1 verified on the
reviewed observations," or "35/35 clean means chronology is repaired" — is false.
The in-flight row findings read at 14:25Z (§5.1) sharpen axis A but do not change
this answer: they are in-generation reseals that expose navigation/binding
failure-capability gaps without falsifying value 12, and none touches the
chronology/generation boundary.

## 3. Evidence

### 3.1 Static dependency separation (disjoint readers)

`measure-c1.mjs` imports only Node builtins (`measure-c1.mjs:5-9`). Its complete
input closure is `EXPECTATIONS_PATH`, `NOTE_PATH`, `PRODUCER_PATH`, `RECEIPT_PATH`,
`EXECUTION_PATH`, and 24 per-case JSON/HTML files (`:13-18`, `:38-41`) — 29 paths,
all under `corpus/evidence/round-21/runtime/`, `corpus/evidence/round-22/`,
`corpus/knowledge/`, `scripts/` and `.ufo/waves/round-21/`. It never reads
`check-review-chronology.mjs`, `debt-expectations.json`,
`historical-chronology-input.json`, `w1-event-history.json` or `history/index.json`.
`filesAt()` is a Git-blob reader limited to `INPUT_PATHS` (`:507-521`).

`check-review-chronology.mjs` imports only `fs`, `os`, `path`, `url` (`:5-10`); it
reads `debt-expectations.json` for its selftest (`:12`, `:325`) and one
caller-supplied JSON path (`:297`). It has no `spawn`, no Git access, and no
reference to `measure-c1.mjs`, `semantic-expectations.json` or any C1 input.
Both CLIs are lane-read-only; their selftests write only under `mkdtemp`
directories and remove them.

Reader intersection: **empty**. The only shared items are data values
(`bc11e4…`, `4bc796…`, `5363d5…`, `323ccd…`), not files read by the other check.

### 3.2 Two-way independence is already exercised in the receipts

Cohort rows from `.ufo/waves/round-22/checks-pre-w2-0f24164.json` and
`.ufo/waves/round-22/checks-at-e3cf4e0.json`:

| Checkpoint | `chronology22-selftest` | `historical-review-scope-red` | `oracle22-selftest` | `c1-after` |
|---|---|---|---|---|
| `0f24164` | exit 0, pass (17/17) | exit 1, expected, pass | exit 1, **fail** (41/42; positive failed) | value 0, exit 1, **fail** |
| `e3cf4e0` | exit 0, pass (17/17) | exit 1, expected, pass | exit 0, pass (44/44) | value 12, clean, exit 0 |

At `0f24164` the chronology gates passed while C1 was red; the pre-repair
`c1-after` findings were exactly `semantic_error na-native-submit:post:page-errors`
and `semantic_navigation na-native-submit:post:url` (the D1/D2 defects in
`.ufo/waves/round-22/post-crash-repair.json:21-34`). At `e3cf4e0` C1 is green while
the chronology record returns the **same five findings** as before
(`review_scope_gap`, `producer_digest_mismatch`, `artifact_scope_mismatch`,
`acquisition_after_review_observation`, `event_history_unavailable`). The gap was
not repaired, so C1's green did not consume a chronology repair.

The baseline row is not a semantic zero. `c1-before` runs the same gate at BASE
`5f58577`, where `semantic-expectations.json` and the round-22 gate do not exist,
so the oracle returns `baseline` 0 (`checks-at-e3cf4e0.json` `c1-before`;
`measure-c1.mjs:382-384`). The 0→12 is an instrument-availability delta on an
unchanged 12-row population, as the note states (lines 16-18), not evidence that
the reviewed generation lacked semantics. This matters for attribution, not for
the separability of the two checks.

The C1 repair itself touched only `measure-c1.mjs`, `selftest-c1.mjs` and
`fixtures/expected.json` (`post-crash-repair.json:68-77`; `git diff --name-status
0f24164 e3cf4e0` shows 36 added/modified files, none of them the chronology
checker or its inputs). The chronology files at `e3cf4e0` hash byte-identically to
the `0f24164` review snapshot: checker `9e3f976c…`, debt expectations `8e0ab966…`,
input `aef7416d…` (`review-snapshot.json:12,17,27`). The C1 files do not:
`76b47edd→47176aed`, `be5d362c→985aa9c7`, `cfe81b47→b1380a0b`
(`post-crash-repair.json:68-77`). This is a second asymmetry: chronology's current
bytes were frozen at the declared review boundary; C1's were changed after it and
stand on W2b plus L1 serial evidence.

### 3.3 The shared node is generation identity, and it is verifiable without either check's verdict

Independent read-only hashing over `git show e3cf4e0:PATH` (exit 0):

- **Review scope:** 25/25 artifacts in `historical-chronology-input.json` resolve
  to `.ufo/waves/round-21/history/runtime-v4/*`; producer `5363d576…` matches
  `history/webmcp-lifecycle-v4.mjs`; receipt `323ccd59…` matches
  `history/runtime-v4/receipt.json` (and the `1b5f449` blob).
- **Acquisition scope:** 25/25 artifacts resolve to
  `corpus/evidence/round-21/runtime/*` at `e3cf4e0`; producer `bc11e4d6…` matches
  `scripts/webmcp-lifecycle-round21.mjs`; receipt `4bc79636…` matches the corpus
  receipt.
- **C1 binding:** 12/12 `fixtureSha256` pins in
  `corpus/evidence/round-22/semantic-expectations.json` match the final HTML;
  12/12 receipt `evidence.sha256` pins match the final raw JSON; receipt and
  execution digests match (`runtime-execution-finalized.json:20-46`).

So the chronology record is substantively resolvable (not fabricated), and C1's
inputs are the finalized generation. The identity of the two generations is
established before either verdict is consulted.

### 3.4 One-way corroboration and the specificity limit of the red verdict

`measure-c1.mjs` recomputes every final digest inside its per-case binding checks
and blocks all credit on any global finding (`:480-488`). The chronology checker
only shape-checks the supplied scopes (`check-review-chronology.mjs:80-101`) and
string-compares them (`:103-111`); its own `scope_limit` says "supplied producer
identity, artifact paths/digests … only" (`:210`). `producerMatch`, `scopeMatch`
and `chronologyMatch` are computed from supplied values (`:218-231`), and the gap
verdict is `producerMatch === false || scopeMatch === false || chronologyMatch ===
false` (`:243-252`).

Consequence: an acquisition scope with arbitrary different digests still yields
`review_scope_gap`. The red verdict is robust to scope falsity but does not by
itself identify the finalized generation; C1's digest verification is what anchors
that identification. This is the exact causal asymmetry: `chronology.acquisition
⊂ C1-verified final digests` as data, never as a computation edge.

### 3.5 The wake half has no machine-checkable retained input

- `historical-chronology-input.json` deliberately omits `event_history`
  (`:233`); the observed result has `event_history.status = unavailable` and the
  `event_history_unavailable` finding at both checkpoints.
- `debt-expectations.json` still binds **zero** retained identifiers: a grep for
  `5363d576|bc11e4d6|323ccd59|4bc79636|13:49:02|13:51:46|1b5f449|2d5eaaa`
  returns 0 matches across its 17 synthetic cases. `AttackChronology.md:164` (F8)
  therefore remains open after the three added controls; the positive case uses
  placeholder `aaaa…/bbbb…/cccc…` digests.
- `w1-event-history.json` is schema `tabi-r22-owned-wave-observed-events-v1` with
  a `seats[]` array of `agentId/modelChanges/errors/...`, not the flat
  `{seat,type,status,actor}` events `eventHistory()` requires
  (`check-review-chronology.mjs:113-123`). Feeding it would return exit 2
  `input_shape` (`:215-217`). No runner row feeds it (`run-checks.py` contains no
  `event_history` reference).
- `w1-outcomes.json:3-6,19` states 64 fresh seats, 64 completed stop snapshots,
  0 dead seats, 72 assistant error events, `allActorQuiescenceCertified:false` —
  a snapshot, not terminal history.

So the W1 wake/routing half of the "unclaimed chronology repair" is independent of
C1 but is also unverified on retained data: only synthetic cases
(`peer_revival_after_failure`, `routing_broadcast`, `late_failure`) exercise the
classifier, while the real wake surface remains prose (`w1/WakeHistory.md`) and
closure text (`round21-closure.json` → `verification.wave_conformance_debt`).

### 3.6 The revision-label collision

`runtime-execution-finalized.json:3` pins `"revision": "1b5f449…"`, and
`semantic-expectations.json:13` repeats it, with `"measuredRevision":
"uncommitted"` (`:15`; checked by `measure-c1.mjs:85-91`). At `1b5f449`, the
committed `corpus/evidence/round-21/runtime/receipt.json` is `323ccd…` — the
**reviewed bounded generation** — not `4bc796…`. The finalized bytes first appear
in delivered ancestry at `2d5eaaa` (`ReviewChronology.md:33-38`). The revision
token is therefore the run-time HEAD, not the artifact-bearing revision.

This is not a defect in either check: `measuredRevision:"uncommitted"` is honest
and C1 binds bytes by digest. It is the one textual node where the two chains
touch, and it is a live misreading hazard for a closure sentence such as "C1
measured the reviewed revision `1b5f449`."

## 4. Findings

Severity is for this item only. "Actual bug" means a check returns a wrong or
unsupported result; "verification gap" means the check may be right but the
receipt does not establish it; "wording" means the record invites a false reading.
Each finding's "smallest fix" is a diagnostic requirement, not a proposal; §6
contains the single bounded proposed move.

### F1 — High, verification/reporting: the 35/35 verdict mixes a positive claim with an expected-red row

`run-checks.py:122-127` registers `historical-review-scope-red` with
`expectedExit: 1` and `expectedMetrics {verdict, finding}`; `:164` computes one
cohort `verdict: 'clean'` from `all(row['pass'])`. At `e3cf4e0` the cohort reports
35/35 clean, but one of the 35 `pass:true` rows is the reproduction of the
chronology gap, not its repair.

- Smallest counterexample: a closure sentence "35/35 clean at `e3cf4e0`, therefore
  the chronology repair is verified" — the row's own `kind:
  'actual-retained-scope'`, `expectedExit: 1` and observed `review_scope_gap`
  contradict the second clause.
- Preserving positive: attribution is still possible from the receipt, because
  each row keeps `exit`, `observedMetrics` and `pass` (`run-checks.py:146-158`).
- Smallest fix: add `polarity: 'positive' | 'expected-red'` to each cohort row and
  an `expectedRed` count to the result (three lines, no behavior change), or state
  the polarity explicitly in the closure. Do not cite 35/35 as conformance.

### F2 — Medium, verification gap: the actual chronology gate pins only two fields

`run-checks.py:127` pins `{verdict: review_scope_gap, finding: review_scope_gap}`,
and `:158` checks only `observedMetrics.get(k) === v` for the supplied keys. The
observed JSON contains the whole causal vector, but the gate would pass a
classifier that returned the same two fields and omitted
`producer_digest_mismatch`, `artifact_scope_mismatch` and
`acquisition_after_review_observation`.

- Smallest counterexample: a checker regression that maps every scope difference
  to `review_scope_gap` without emitting the three specific reasons still passes
  the gate; the report's causal claim would then be unsupported.
- Preserving positive: the current five-finding vector is identical at both
  checkpoints and is stored verbatim in `observedMetrics`.
- Smallest fix: add `findings: [review_scope_gap, producer_digest_mismatch,
  artifact_scope_mismatch, acquisition_after_review_observation,
  event_history_unavailable]` to `expectedMetrics`. No checker edit.

### F3 — Medium, coverage debt: the selftest does not bind the retained pair

`debt-expectations.json` has 0 retained identifiers across 17 cases (grep count 0).
`AttackChronology.md:164` F8 is only partly closed by the three added controls.

- Smallest counterexample: a classifier that returns exit 0
  `matched_supplied_scope` for the retained pair would pass all 17 synthetic cases.
- Preserving positive: the separate `historical-review-scope-red` row catches the
  retained pair (exit 1), so the real record is not unprotected — the selftest just
  cannot detect a regression that still happens to pass the real row.
- Smallest fix: add one case built from the exact retained scopes and clocks; its
  expected output is already fixed by F2's vector.

### F4 — Medium, unexercised arm: the W1 wake half has no retained input

See §3.5. `w1-event-history.json` cannot be fed to the checker (schema mismatch),
and no gate projects it into the flat event schema.

- Smallest counterexample: a regression in `peer_revival_after_failure` or
  `late_failure` semantics passes every gate, because no retained event input is
  ever classified.
- Preserving positive: the synthetic event cases pass (17/17), so the code path
  works; the missing piece is retained-input binding.
- Smallest fix: project `w1-event-history.json` into the flat
  `{seat,type,status,actor,timestamp}` array and add one runner row with pinned
  findings, or mark the wake arm "unverified on retained data" in the closure.

### F5 — Low, wording: `1b5f449` means different artifact bytes in the two chains

See §3.6. At `1b5f449` the corpus receipt is `323ccd…` (reviewed), not `4bc796…`
(finalized). The final acquisition ran at that HEAD with the producer uncommitted
(`runtime-execution-finalized.json:3,5,15`).

- Smallest counterexample: "C1 measured the reviewed revision `1b5f449`" is false
  at the artifact level; the reviewed bytes are bounded, the measured bytes are
  finalized and uncommitted at that revision.
- Preserving positive: `measuredRevision:"uncommitted"` and the digest pins make
  the correct reading recoverable; the proposed generation-swap probe makes it
  failure-capable.
- Smallest fix: one sentence in the oracle note/closure distinguishing the
  run-time HEAD from the artifact-bearing revision. No data change: editing the
  expectations would change the pinned `4a693dce…` digest and force a re-measure.

### F6 — Note (C1-internal, row-review cross-link): the landing absent-vs-empty contract is code, not data

`measure-c1.mjs:115-130` hardcodes `stage === 'post' && id === 'na-native-submit'`
to require `errors`/`nonce`/`submits` to be absent. The expectation file still
says `errors: []`, so the "absent, not empty" rule cannot be expressed in the
pinned data and a second landing-like case would need another special case.

- This is independent of chronology and belongs to the `RepairLandingErrors` /
  `RepairMaskedFixture` row reviewers, not to the separability claim.
- Smallest fix (not proposed here): encode absence in the expectation (for example
  `errors: null` = key must be absent) and delete the case-ID branch; requires
  re-pinning the expectations digest and a fresh 12-row measurement.

## 5. One causal picture, including the row reviewers

```
round-21 generation identity (the shared node)
├── bounded v4: producer 5363d5…, receipt 323ccd…, 25 artifacts
│     └── W2 review scope (observed 13:49:02Z) ──► chronology.review
├── finalized: producer bc11e4…, receipt 4bc796…, 25 artifacts
│     ├── C1: 12 rows, 12/12 fixture pins, 12/12 receipt pins ──► value 12
│     └── acquisition 13:51:46–13:51:58Z ──► chronology.acquisition
└── one-way data edge: chronology.acquisition digests ∈ C1-verified final digests
    chronology verdict: review_scope_gap (producer + scope + finish-after-observation)
    no computation edge in either direction
```

Row-level consequences:

- Every `RowOutcome`/`RowTrace` finding is **generation-scoped**. C1's 12 rows are
  bound by the final `fixtureSha256` and receipt `evidence.sha256` values (12/12
  each, verified in §3.3). A row verdict copied from a W2 report is not admissible
  evidence for C1: all 58 W2 reports are bounded-scope and zero cite any finalized
  pin (`ReviewChronology.md:23-38,209-215`), and the bounded per-case nonces, invocation
  IDs and windows differ for all 12 rows (`ReviewChronology.md:121-170`). Concrete
  example: bounded `na-click` windows are 255/542, final are 252/547; bounded
  `na-delayed` is 254/754, final 252/755 (values re-read from the two receipts).
- Windows alone do **not** discriminate the generations: the expectations pin only
  `minMs/maxMs` 250/10000 and 500/10000 (`semantic-expectations.json:40-41` and the
  analogous blocks), which both generations satisfy. The discriminator is the
  final `fixtureSha256` (and the receipt/execution digest pins). Row reviewers
  therefore must cite the final per-case digest or nonce, not a window range or a
  W2 report.
- Rows most exposed to a generation mix-up: `na-native-submit` (landing
  `?q=<nonce>` plus absent old-document keys; final fixture `c95abb9c…`),
  `na-delayed` (release-before-response ordering; final after-window 755 ms), and
  the two autosubmit controls (terminal before the pre-action marker). These are
  the first rows a swapped-generation run would break semantically, after the
  fixture pins already fail.
- Conversely, a final-generation row defect lowers C1 no matter what chronology
  says; no chronology outcome can compensate. That is the clean partition the row
  reviewers (`RowOutcome01-12` / `RowTrace01-12`) should use: their findings affect
  A only; chronology findings affect B only; generation identity affects the
  interpretation of both but is verified upstream by digest arithmetic.

### 5.1 In-flight row findings at read time (structural cross-link)

At 14:25Z the w2b directory held 49 files, including `RowOutcome02/03/04/06/07/09/11`
and `RowTrace01-06` (mtimes 14:18–14:25; these are in-flight outputs and may be
revised before L1 integration). Read as data, their common structure is:

| Seat | Row | Defect class | Contradictory raw counted | Value 12 on retained bytes falsified |
|---|---|---|---|---|
| RowOutcome02 F1 | `na-click` | navigation guard window-scoped | yes | no (stated) |
| RowOutcome03 F1 | `na-requestsubmit` | post-observation navigation ignored | yes | no (stated) |
| RowOutcome04 | `na-native-submit` | navigation axis not failure-capable | yes (3 mutants) | no (stated) |
| RowOutcome06 F1 | `na-remove` | navigation + case identity | yes | no (stated) |
| RowOutcome07 F1 | `na-reject` | binding surface (nonce/fixture content, server log) | yes (4) | not claimed |
| RowOutcome09 | `na-delayed` | delayed snapshot `submits`/document fields unchecked | yes | no (stated) |
| RowOutcome11 | `auto-positive` | navigation/order/binding dimensions | yes (5) | no (stated) |
| RowTrace03 | `na-requestsubmit` | no mismatch | — | — |
| RowTrace04 | `na-native-submit` | static trace only | — | — |

Causal placement:

- **All of these mutations are in-generation.** Each reseals the receipt and the
  execution record inside the finalized generation exactly as the lane's own
  selftest reseals (`RowOutcome04` §1 step 2; `RowOutcome07` §1; `RowOutcome09`
  §0.1). None swaps to the bounded v4 generation, cites
  `historical-chronology-input.json`, or depends on the chronology verdict.
  They are therefore **A-axis** findings, not B-axis findings.
- **They do not change the separability answer.** Even if every row-level gap is
  confirmed, C1's final-generation measurement and the chronology gap remain
  independent liabilities. The closure should carry both: "value 12 on retained
  bytes, with navigation/binding failure-capability gaps exposed by W2b" and
  "review scope gap, unrepaired."
- **They are not fixed by the generation-swap probe, and the probe is not fixed by
  them.** The reviewers' navigation gaps call for a whole-trail navigation guard
  (`measure-c1.mjs:236-312` only examines `navEvents[0]` and the
  `[after.start, post)` window); their delayed/binding gaps call for added
  fields. The probe adds a different control: cross-generation substitution. The
  reviewers' resealing technique is the same technique the probe reuses across
  generations — a compatible synthesis, not a competing proposal.
- The reviewers explicitly do **not** claim the retained corpus is wrong; e.g.
  RowOutcome02: "This does not show the metric value 12 to be false for the
  retained bytes as they stand"; RowOutcome03: "I make no claim that the retained
  corpus is wrong"; RowOutcome06: "The metric's *value* (12) is therefore not
  falsified by this attack." The contested object is failure-capability, which is
  exactly what the round's C1 claim asserts.

### 5.2 Adjacent in-flight critic findings (cross-linked, not adjudicated)

Two critic reports present at 14:25Z bear on how the C1 claim may be worded; neither
changes the separability answer.

- **CriticRepairFitting (D1):** it argues that the landing special case
  (`measure-c1.mjs:117,129`) reinterprets the byte-unchanged pinned `errors: []`
  as "recorder absent," that this is the one repair which decides 0 vs 12, and
  that it is fitting rather than a genuine instrument fix. This is an **A-axis**
  question (whether 12 is a legitimate semantic count) and is entirely
  in-generation; it does not involve the chronology record. This report does not
  adjudicate it — §4 F6 flags the same code/data asymmetry without ruling on
  fitting. The separability conclusion is unchanged either way: if D1 is upheld,
  the closure should say "value 12 under the repaired landing rule," not an
  unqualified semantic count; if it is rejected, value 12 stands as measured.
- **CriticReviewScope F1:** it reports that a committed artifact allegedly labels
  the author-side w2b wave as the "non-author review" of the repair. If confirmed,
  that is exactly the attribution fusion §2 warns against: w2b is author-side
  falsification, not non-author admission. I did not independently verify the
  artifact or the label; the L1 should resolve it before any closure wording.

## 6. Proposed move (one, bounded)

**Run a generation-swap negative control once at `e3cf4e0` in a throwaway clone and
retain the receipt; change no lane file and make no new revision.**

The probe uses the chronology arm's own retained bounded bytes as the mutation
input, so it tests exactly the confound the gap creates: a fully resealed reviewed
generation offered to the C1 oracle.

Recipe (for the L1/closure; I did not execute it):

1. `git clone --no-hardlinks <lane> /tmp/tabi-r22-genswap` and detach at
   `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d`.
2. Replace the 25 acquisition artifacts listed in
   `runtime-execution-finalized.json:20-46` with the byte-identical retained v4
   files from `.ufo/waves/round-21/history/runtime-v4/<basename>`.
3. Make the mutant coherent: set the v4 receipt's `producer.sha256` to `bc11e4…`
   (so the producer envelope passes and the failure isolates artifact generation),
   then reseal exactly as `selftest-c1.mjs:63-77` does — recompute each receipt
   case `evidence.sha256`, the execution `artifacts` map and `receiptSha256`.
   Do not touch `semantic-expectations.json`, the note, the producer file or the 12
   expectation rows.
4. Commit in the throwaway clone and take the full 40-hex revision (the oracle
   rejects short revisions, `measure-c1.mjs:507-511`).
5. Run `node .ufo/waves/round-22/measure-c1.mjs <mutant-rev>`; require exit 1,
   `value: 0`, `verdict: "failed"`, and `evidence_binding` present. Static reading:
   the 12 final `fixtureSha256` pins mismatch the v4 HTML, so each case adds
   `case-identity-or-fixture`; `blocked` then zeroes value (`measure-c1.mjs:480-488`).
   Record the exact finding details rather than assuming them; the v4 envelope
   (environment/cleanup) may add further `evidence_binding` details.
6. Preserving positive in the same clone: run `measure-c1.mjs e3cf4e0` (expect exit
   0, value 12, clean — already observed in `checks-at-e3cf4e0.json`), and run
   `node .ufo/waves/round-22/selftest-c1.mjs` (expect 44/44, exit 0).
7. Retain the mutant revision, the 25 replacement digests, both JSON outputs and
   command exit codes as a post-w2b receipt (for example
   `.ufo/waves/round-22/w2b/c1-generation-swap.json`). No lane commit.

Why this is the right move and not a row-specific fit: the existing selftest
mutations (`raw-unpinned`, `acquisition-unpinned`, `producer-bytes-unpinned`) break
internal digest links and therefore test digest plumbing. The generation swap is
**coherently resealed**: every internal digest agrees, and only the independent
expectation pins reject it. That makes the note's claim "cryptographic
self-consistency is necessary, not an outcome oracle" failure-capable across
generations, and it proves C1's 12 rows cannot be borrowed from the reviewed
generation. It is orthogonal to the D1/D2/D3 row defects, so it does not increase
fitting risk on row semantics. It is also complementary to the in-flight row
findings in §5.1: those are all in-generation mutations, so the cross-generation
control is the one surface they do not cover.

## 7. Affected axes

- **A (C1 operability): improved evidence, metric unchanged.** The 12-row claim
  gains a failure-capable control over generation substitution; value, target,
  population and scalar stay 12/12 and 8.
- **B (chronology): untouched.** No repair, no reclassification, no new claim; the
  gap remains red exactly as recorded.
- **C (attribution): improved.** The closure gets a mechanical separation witness
  instead of a code-reading assertion, and a reason not to cite 35/35 as repair.
- **D (no-harm): preserved.** No production edit, no new browser run, no coverage,
  capability, promotion or install; the lane revision is unchanged.

## 8. Risks

- **Mutant coherence.** If the receipt evidence, execution artifact map or
  `receiptSha256` is not resealed, the probe fails on plumbing rather than
  generation semantics. Use the `resealAcquisition` recipe; record which detail
  fired.
- **Producer-field choice.** Leaving the v4 receipt's `producer.sha256` at
  `5363d5…` makes the envelope fail first; rewriting it to `bc11e4…` isolates the
  per-case fixture pins. The receipt should state which variant was run; running
  both is cheap and distinguishes envelope from artifact binding.
- **Environment drift.** If the v4 receipt's `environment` or `cleanup` differs
  from the pinned expectations, additional `evidence_binding` details appear. That
  is still a rejection, but the receipt must not overclaim a fixture-only cause.
- **Retention dependency.** The probe needs `history/runtime-v4/`; all 25 files are
  pinned in `preservation-baseline.json` (verified: 25 v4 files in the 4865-file
  frozen list) and the serial runner aborts on any preservation mismatch
  (`run-checks.py:109`), so the dependency is guarded.
- **Scope limit.** The probe proves generation binding, not row semantic
  correctness, not review coverage, and not non-author admission. It is
  author-side evidence, like the rest of W2b.
- **Process cost.** One throwaway clone and two measurement runs; no lane revision,
  no browser, no installs. If the round forbids even that, the honest fallback is
  to report §3 as static-only and not claim a failure-capable separation.

## 9. Verification exercised

Read-only commands; the hashing, diff and parse commands exited 0, and the
retained-identifier grep exited 1 because it found no matches (no lane script was
executed):

- `git -C <lane> show e3cf4e0:<path> | sha256sum` for `measure-c1.mjs`,
  `selftest-c1.mjs`, `fixtures/expected.json`, `run-checks.py`,
  `check-review-chronology.mjs`, `debt-expectations.json`,
  `historical-chronology-input.json`, `w1-event-history.json`.
- Python hashing over `git show` blobs: 25/25 review artifacts against
  `history/runtime-v4`, 25/25 acquisition artifacts against the corpus paths, 2/2
  producer digests, 12/12 expectation fixture pins against final HTML, 12/12
  receipt evidence pins against final raw, receipt and producer digests.
- `git diff --stat 0f24164 e3cf4e0` and `git diff --name-status 0f24164 e3cf4e0`:
  36 files; only `measure-c1.mjs`, `selftest-c1.mjs` and `fixtures/expected.json`
  among the checked files changed; chronology files unchanged.
- JSON parsing of `checks-pre-w2-0f24164.json` and `checks-at-e3cf4e0.json`:
  35 rows each; the four gate outcomes in §3.2; the pre-repair findings and the
  identical five-finding chronology vector.
- Read-only ingestion of the in-flight w2b reports present at 14:25Z
  (`RowOutcome02/03/04/06/07/09/11`, `RowTrace01-06`) as data for §5.1. No
  execution and no endorsement of numbers that may still be revised before L1
  integration.

Not run: `measure-c1.mjs`, `selftest-c1.mjs`, `check-review-chronology.mjs`,
`run-checks.py`, any browser, REA, service or install. The proposed probe's outcome
is a static prediction; if the L1 runs it, its receipt — not this report — is the
evidence.

Report: .ufo/waves/round-22/w2b/ConnectCausal.md
