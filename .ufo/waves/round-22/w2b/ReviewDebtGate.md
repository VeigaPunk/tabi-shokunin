# ReviewDebtGate — review-chronology classifier, its debt gate, and the retained historical input

Item: `check-review-chronology.mjs` (unclaimed conformance repair). Lane: `tabi-shokunin`, wave `tabi-r22-w2b`.
Revision reviewed: `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` (post-crash repair).
Production read via `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show e3cf4e0d30bb835532ff44b118c5ad52e09eb76d:<path>`.
Author-side falsification. This report is a recommendation, not an admission.

## 0. Method and what was actually run

Private throwaway clone `/tmp/tabi-r22-w2b-ReviewDebtGate` (`git clone` of the lane, `git checkout e3cf4e0`), deleted after the run.
Nothing in the lane, the fleet, the sibling lanes or the lane's VCS state was written or mutated. No browser, no REA,
no services, no delegation, no seat messaging. Only this report file was written, plus throwaway files under `/tmp`.

Commands executed (node = `v24.21.0`, the lane's own `scripts/webmcp-lifecycle-*.mjs` runtime; the lane's pinned interpreter
`/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node` was used by `run-checks.py`):

| Command (cwd = throwaway clone) | Exit | Result |
|---|---|---|
| `node .ufo/waves/round-22/check-review-chronology.mjs --selftest` | 0 | `verdict: pass`, 17/17 cases pass |
| `node .ufo/waves/round-22/check-review-chronology.mjs .ufo/waves/round-22/historical-chronology-input.json` | 1 | `verdict: review_scope_gap`, `finding: review_scope_gap` |
| 23 counterexample inputs `/tmp/ce*`, `/tmp/r-*` (below) | 0/1/2 | table in §4, §5 |
| `node /tmp/defect/check-review-chronology.mjs --selftest` (mutant, `/tmp` only) | 0 | mutant still 17/17 → §6 M5 |
| `node /tmp/defect/check-review-chronology.mjs …/historical-chronology-input.json` (mutant) | 2 | mutant flips the retained verdict → §6 M5 |

Not run (honest gaps): the full lane cohort `run-checks.py` (it clones the fleet and mutates sandboxes; out of this item's
scope) — its two chronology rows were instead read from the lane's own receipts (§2.3). No `measure-c1.mjs` run, no browser,
no REA, no `git write` of any kind.

## 1. Verdict

The wave's two headline claims about this classifier **hold** and are reproducible from the retained record:

* the committed selftest passes 17/17 (exit 0);
* the actual retained historical input yields `review_scope_gap` (exit 1) with findings
  `[review_scope_gap, producer_digest_mismatch, artifact_scope_mismatch, acquisition_after_review_observation, event_history_unavailable]`,
  and that input is faithful to the retained record (§2.2).

**But the classifier is not review-safe.** Two High findings show it both (a) rejects legitimate reviews for reasons
belonging to *other seats* and (b) certifies a record whose reviewed seat failed. Both are the exact defects the retained
W1 attack named (F2, F4, F6) and that the post-crash repair left in place. The debt gate itself
(`debt-expectations.json`) binds **no retained identifier** and, as a mutation experiment shows, cannot detect a
regression that targets the retained W2 debt.

Findings: 2 High, 5 Medium, 3 Low. Smallest counterexample + preserving positive + smallest fix for each.

## 2. What is verified true

### 2.1 Selftest and historical input (reproduced)

* `--selftest` → exit 0, `verdict: pass`, 17 cases, 0 failures.
* `historical-chronology-input.json` → exit 1, `verdict: review_scope_gap`,
  `scope.status: gap`, `producer_digest_match: false`, `artifact_scope_match: false`,
  `acquisition_completed_not_after_review_observation: false`, `review_clock_role: review_observation_upper_bound`.
  The lane's cohort expectation (`run-checks.py:122-127`, `expectedMetrics {verdict, finding} = review_scope_gap`) is met.

### 2.2 The historical input is faithful to the retained record (not manufactured)

Verified by hashing blobs out of git, not by trusting the file's prose note:

* review scope (25 artifacts, receipt `323ccd59…`) == the 25 blobs at `1b5f449ad15525d281fda4558aeef1086f1e4a65` — **25/25 byte-equal**.
* acquisition scope (25 artifacts, receipt `4bc79636…`) == the 25 blobs at `e3cf4e0…` — **25/25 byte-equal**.
* `review.producer_sha256` `5363d576…` == `sha256(.ufo/waves/round-21/history/webmcp-lifecycle-v4.mjs)`; the bounded producer is cited by 26 of 58 W2 reports.
* `acquisition.producer_sha256` `bc11e4d6…` == `sha256(scripts/webmcp-lifecycle-round21.mjs)` and == `runtime-execution-finalized.json:producerSha256`.
* `review.observed_at` `2026-10-21T13:49:02.529912+00:00` == `.ufo/waves/round-21/w2-returns.json:readAt` (with `allActorQuiescenceCertified: false`).
* `acquisition.started_at/finished_at` == `runtime-execution-finalized.json:startedAt/finishedAt` (`13:51:46.597742` → `13:51:58.460511`).
* All 25 finalized and all 25 bounded artifacts are frozen in `preservation-baseline.json` (25 + 25 entries), so these bytes cannot drift.

So `review_scope_gap` is the correct verdict for the retained pair: different producer, different bytes at the same logical
paths, and the finalized acquisition finished 2m56s **after** the W2 snapshot clock. The verdict does not rest on the
classifier's judgement; it rests on three independent digest/clock facts.

### 2.3 Cohort receipts

`checks-pre-w2-0f24164.json` (committed at `e3cf4e0`) records `chronology22-selftest` exit 0 pass and
`historical-review-scope-red` exit 1 pass (35 runs, 33 pass; the two failures `oracle22-selftest` and `c1-after` are the
defects `e3cf4e0` repairs). The lane's working-tree `checks-at-e3cf4e0.json` (read-only, not committed at `e3cf4e0`) is
`verdict: clean`, 35/35, with the same two rows passing. One canonical implementation exists: `grep` for `review_scope_gap`
over `*.mjs/*.js/*.py` returns only `check-review-chronology.mjs` and its invocation in `run-checks.py`.

## 3. Conformance against the retained W1 stable expectations (executed)

`.ufo/waves/round-22/w1/AttackChronology.md` §6 (R1–R8) is the retained expectation table for this exact classifier.
Executed against the committed `e3cf4e0` classifier:

| Case | W1 expectation | Committed classifier (executed) | Status |
|---|---|---|---|
| R1 retained W2 vs final | exit 1 `review_scope_gap` + 3 findings | exit 1, same findings (§2.1) | **met** |
| R2 both bounded | exit 0 (label `claims_consistent_at_upper_bound`) | exit 0, label `matched_supplied_scope` | verdict met, **label not met** (F2/F5) → M1 |
| R3 observed inside final window | exit 1 | exit 1 `review_scope_gap` (`/tmp/r-r3-in-window-final.json`) | met |
| R4 observed after window | exit 0 | exit 0 (`/tmp/r-r4-after-window-final.json`) | met |
| R5 receipt-start clock | exit 1 | exit 1 (`/tmp/r-r5-receipt-start.json`) | met |
| R6 git author date as clock | exit 2 `clock_source_not_admissible` | **exit 0** `matched_supplied_scope` (`/tmp/r-r6-author-date-clock.json`) | **not met** → M3 |
| R7 failed seat in history | exit 2 `review_not_completed` | **exit 0** `matched_supplied_scope` (`/tmp/r-r7-failed-seat.json`) | **not met** → H2 |
| R8 sub-second ordering | exit 1 | exit 1 (`/tmp/r-r8-subsecond-order.json`) | met |

Four of eight W1 expectations are still open after the repair. The repair fixed the *shape* of the rule (finish, not start;
exact digests) but not the two claims that matter most for a review gate: whose seat is being judged, and what the clock proves.

## 4. Findings

Severity order. Every finding names the revision/path/line, a smallest counterexample with a preserving positive, and the
smallest fix. "Legitimate review" below means: a review record whose scope is exactly the acquired artifacts, produced by
the same producer, observed after the acquisition completed, with no anomaly in **its own** seat.

### H1 — High — Event-history findings are wave-wide and gate the review verdict; the input has no review↔seat binding

**Where.** `.ufo/waves/round-22/check-review-chronology.mjs` at `e3cf4e0`:
`:146-153` (the three event findings), `:268-271` (they set `verdict = 'event_history_anomaly'`, `exit = 1`),
`:214-233` (`classify` reads `input.review` for producer/clock/scope only — **no seat field exists anywhere in the schema**),
`:210` (`scope_limit` says "wake/dispatch authority … not assessed").
`debt-expectations.json` cases `peer_revival_after_failure`, `routing_broadcast`, `late_failure` pin the behaviour.

**Smallest counterexample** (`/tmp/ce/v1-other-seat-failure-peer-message.json`; review and acquisition fully matched,
same producer `5363d576…`, identical 25-artifact scope, finished `13:07:14.124522` ≤ observed `13:49:02.529912`,
`event_history` = `[{seat:'B',type:'failure',status:'failed'},{seat:'B',type:'message',actor:'C'}]`):

```
exit=1  verdict=event_history_anomaly  finding=peer_revival_after_failure  scope.status=matched
```

**Preserving positive** (`/tmp/ce/v0-positive-base.json` — same record, `event_history: []`):

```
exit=0  verdict=matched_supplied_scope  finding=review_scope_match  scope.status=matched
```

The review's own scope is `matched` in both runs; only an unrelated seat's failure flips the exit code. Same shape for
`/tmp/ce/v2-broadcast.json` (`routing_broadcast`, exit 1) and `/tmp/ce/v9-late-failure.json` (`late_failure`, exit 1).
`/tmp/ce2-w10-supplied-review-seat-ignored.json` adds `review.seat: 'TabiR22-2.ReviewDebtGate'` to the v1 record: the
verdict is **unchanged** (exit 1) — the classifier reads no seat field, so a caller cannot scope the history even if it wants to.

**Why this is a false positive and not a style point.** A 65-seat wave runs concurrently; the retained history
`.ufo/waves/round-22/w1-event-history.json` holds 72 assistant-error events across 64 seats and 7 peer messages. Any seat
failure followed by any message to that seat condemns *every* review in the wave. The classifier's own `scope_limit`
(`:210`) states that "wake/dispatch authority … [is] not assessed", while `:146-153`/`:268-271` make wake/routing facts
gating. The document and the behaviour disagree.

**Smallest fix.** Add an optional `review.seat` to the input schema and compute `:146-153` over that seat's events only
(events for other seats → `event_history_unavailable` for the review, with the wave-level facts moved to a separate
non-gating `fleet_findings` field). Keep the wave-wide findings visible, but out of the review's exit code.

### H1a — High — `peer_revival_after_failure` fires on peer *contact* and misses the *actual* revival

**Where.** `:146-147`: `… ['message','activity'].includes(event.type.toLowerCase()) && nonempty(event.actor) && event.actor !== seat`.

**Smallest counterexample.** `/tmp/ce/v10-seat-self-revival.json` — the failed seat itself resumes
(`[{seat:'A',type:'failure',status:'failed'},{seat:'A',type:'activity',actor:'A'}]`) → **exit 0 `matched_supplied_scope`**: no finding.
The same history with `actor:'B'` (a peer message *to* the failed seat, `/tmp/ce/v1-…`) → exit 1 `peer_revival_after_failure`.

**Preserving positive.** The v10 record is the preserving one for the *review* (its scope matched); it is the counterexample
for the *anomaly* — a seat that revived after failing is not flagged at all, while a peer touching a failed seat is.

**Smallest fix.** Require the later event to be the failed seat's own resumed activity (`event.actor === seat`) for the
revival relation, and keep peer contact as a separate, differently named relation (`peer_contact_after_failure`).

### H2 — High — A failed seat's record still certifies a positive (retained W1 F6/R7, unfixed)

**Where.** `check-review-chronology.mjs:130-153` (`eventHistory` → findings) and `:268-271`; the input carries no seat (`:214-233`),
so the classifier cannot know which seat the review represents.

**Smallest counterexample** (`/tmp/r-r7-failed-seat.json`): bounded scope matched exactly (producer `5363d576…` both sides,
25 artifacts, receipt `323ccd59…`), clock fine (`13:07:14.124522` ≤ `13:49:02.529912`), and `event_history` =
`[{seat:'SemanticNaNativeSubmit',type:'failure',status:'failed',actor:'provider'}]`:

```
exit=0  verdict=matched_supplied_scope  finding=review_scope_match
```

**Preserving positive.** The same record with `event_history: []` (`/tmp/ce/v0-positive-base.json`) → exit 0 as well — i.e. the
failed seat changes nothing, in either direction.

**Retained support.** `.ufo/waves/round-21/w2-failures.json` retains `SemanticNaNativeSubmit` among the failed W2 seats, and
the lane's own disposition (recorded in `w1/AttackChronology.md` F6) is "partial analysis is not a completed semantic
review". W1's stable expectation (R7) was exit 2 `review_not_completed`. The committed classifier returns exit 0
`matched_supplied_scope` for exactly that record.

**Smallest fix.** Same as H1 (a `review.seat` binding), plus: if that seat's first terminal event is a failure, return
exit 2 `review_not_completed` instead of a positive.

### M1 — Medium — The clock role is inert: an upper bound is treated as an exact clock, so the positive over-claims (W1 F2/R2 label)

**Where.** `:222-223` (role whitelist → `reviewObservedAt`), `:226-228` (`chronologyMatch = acquisitionFinishedAt <= reviewObservedAt`),
`:249-252` (the positive branch), `:185` (`review_clock_role` is echoed only).

**Smallest counterexample.** `/tmp/ce/v0-positive-base.json` (role `review_observation_upper_bound`) and
`/tmp/ce/v6-review-return-role.json` (role `review_return`) — identical records, identical verdicts:

```
v0: exit=0 matched_supplied_scope   role=review_observation_upper_bound
v6: exit=0 matched_supplied_scope   role=review_return
```

The only difference in the whole output is the echoed role string.

**Why that is wrong, not merely redundant.** Under the upper-bound role the read time `R` satisfies `R ≤ U` (the snapshot
readAt is a bound on reads). The checker's positive condition is `F ≤ U` (acquisition finish before the bound), which does
**not** imply `F ≤ R`: the reads may have happened before the acquisition finished. So the positive is not established by the
supplied clock; only its *refutation* is (`U < F` ⇒ the read could not have seen the artifacts). W1 F2's stable expectation
was exactly this ("never supports a coverage positive by itself"; label `claims_consistent_at_upper_bound`, `final_reviewed: false`).
The retained clock is an upper bound in fact: `w2-returns.json` carries `allActorQuiescenceCertified: false`.

**The debt gate pins the defect.** `debt-expectations.json` case `exact_pre_review_artifact_positive` asserts
`exit: 0`, `finding: review_scope_match`, `scope.review_clock_role: review_observation_upper_bound` — a future fix that
refuses or relabels upper-bound positives **fails the selftest**. The gate is load-bearing against the repair it should permit.

**Smallest fix.** For `clock_role === 'review_observation_upper_bound'`: `U < F` → exit 1 `review_scope_gap` (refutation);
`U ≥ F` → exit 2 `chronology_unavailable` (no conclusion). If the exit-0 positive must stay, relabel it
`claims_consistent_at_upper_bound` and add `coverage_certified: false` / `final_reviewed: false`, then update the selftest
case accordingly.

### M2 — Medium — Exact artifact-set equality rejects a legitimate partial-scope review

**Where.** `:104-111` (`scopesEqual`: path + receipt digest + **length equality** + elementwise digest equality), `:237`
(`artifact_scope_mismatch`), `:243-251` (`review_scope_gap`).

**Smallest counterexample** (`/tmp/ce/v3-subset-scope.json`): review scope = the first 2 of the acquisition's 25 artifacts,
every digest byte-correct; producer equal; clocks fine.

```
exit=1  verdict=review_scope_gap  findings=[review_scope_gap, artifact_scope_mismatch]
```

**Preserving positive** (`/tmp/ce/v0-positive-base.json`, all 25) → exit 0 `matched_supplied_scope`.

**Why this can be a false positive.** The lane's own record says the scope is not a per-inspector claim:
`historical-chronology-input.json:provenanceNote` — "Review scope is the retained historical bounded acquisition cited by W2
reports, **not a claim every reviewer inspected every listed file**". And `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md:100`
requires "exact artifact **identity**", not set equality. A reviewer that inspected two cases and cited the exact digests of
those two satisfies identity but is reported under the same label as a byte conflict, and the label says *mismatch*.

**Smallest fix.** Compare pairwise on the intersection: a shared path with a different digest stays `artifact_scope_mismatch`
(refutation); a strict subset with all shared digests equal becomes a distinct finding, e.g. `artifact_scope_incomplete`
(coverage gap, not identity conflict).

### M3 — Medium — No clock-source admissibility: a git author date certifies a review (W1 F4/R6, unfixed)

**Where.** `:52-90` (`instant` accepts any RFC3339 instant with an offset), `:222` (role labels are self-declared),
`:249-252` (positive granted).

**Smallest counterexample** (`/tmp/r-r6-author-date-clock.json`): observed_at `2026-10-21T11:16:49-03:00` (= `14:16:49Z`,
the author date of commit `2d5eaaa`, per `w1/AttackChronology.md` §2), role `review_return`, final scope, final producer.

```
exit=0  verdict=matched_supplied_scope
```

**Preserving positive.** `/tmp/ce/v0-positive-base.json` with the genuine harness capture `13:49:02.529912+00:00` → exit 0 as well.
The two are indistinguishable to the classifier, although one is a settable commit date and the other is a harness readAt.

**Smallest fix.** Require the input to declare a clock **source** (`review.clock_source` ∈ an enumerated set such as
`harness_capture`, `file_mtime`) and refuse unknown/absent sources with exit 2 `clock_source_not_admissible`; add that finding
to `FINDING_ORDER`.

### M4 — Medium — An exit-1 anomaly is masked by an exit-2 unavailability in the exit code

**Where.** `:249-271` (verdict precedence: `scopeGap` → `producer_digest_unavailable` → `chronology_unavailable` →
`artifact_scope_unavailable` → `event_history_unavailable` → `event_history_anomaly`).

**Smallest counterexample** (`/tmp/ce2-w6-anomaly-plus-unavailable.json`): the v1 record with `review.producer_sha256: null`:

```
exit=2  verdict=producer_digest_unavailable
findings=[producer_digest_unavailable, peer_revival_after_failure]
```

The hard anomaly is present in `findings` but the exit code says "could not evaluate". A gate that reads only the exit code
(see `run-checks.py:158-165`, which keys on `exit` and `expectedMetrics`) sees an inconclusive result where a violation exists.

**Smallest fix.** Make the exit code reflect the highest-severity finding present (anomaly ⇒ exit 1 even when another input
field is unavailable), or add a distinct exit code and have the cohort assert on `findings` as well as `exit`.

### M5 — Medium — The debt gate binds no retained record: a regression aimed at the retained W2 debt still passes the selftest

**Where.** `.ufo/waves/round-22/debt-expectations.json` (all 17 cases), consumed by
`check-review-chronology.mjs:327-357` (`selftest`).

**Evidence.** `grep -c` over `debt-expectations.json`: `5363d576` → 0, `bc11e4d6` → 0, `13:49:02` → 0, `13:51:46` → 0,
`4bc79636` → 0, `323ccd59` → 0, `1b5f449` → 0, `2d5eaaa` → 0. Every case uses placeholders (`aaaaaaaa…`, `bbbbbbbb…`,
`dddddddd…`, `eeeeeeee…`) and the synthetic instants `12:00:00Z` / `11:59:00Z` / `12:00:01Z`.

**Decisive experiment** (run only in `/tmp/defect`, never in the lane): a copy of the classifier was patched so that the gap
is suppressed exactly for the retained producer digest `5363d576…` — i.e. a classifier that is specifically wrong about the
retained W2 pair, and right about every synthetic case:

```
node /tmp/defect/check-review-chronology.mjs --selftest          → exit 0, 17/17 pass
node /tmp/defect/check-review-chronology.mjs …historical-chronology-input.json → exit 2 (was 1)
```

The selftest cannot see the regression. The retained debt is exercised only by the separate cohort row
`historical-review-scope-red` (`run-checks.py:122-127`) over the hand-authored `historical-chronology-input.json`.

**Residual, and why it is not fully closed.** That input is faithful today (§2.2, verified against git blobs), but nothing in
the gate recomputes it from the retained record: `run-checks.py` clones the lane, runs the checker on the file as committed,
and compares to a hard-coded expectation. A coordinated edit of the input file and the expectation would produce a green
gate over a false record. The frozen artifacts (`preservation-baseline.json`, 25 + 25 entries) stop byte drift; they do not
stop the input file from being edited.

**Smallest fix.** Add the retained cases R1/R2/R4 to `debt-expectations.json` using the exact retained digests and instants
(the table already exists in `w1/AttackChronology.md` §6), or add one cohort row that recomputes
`historical-chronology-input.json`'s two scopes from `git show` blobs and asserts equality before running the classifier.

### L1 — Low — `instant()` caps fractional seconds at 9 digits; RFC 3339 permits any count

**:54** — `(?:\.(\d{1,9}))?`. `/tmp/ce2-w11-10-digit-fraction.json` (observed `…T13:49:02.5299121234+00:00`) → **exit 2
`chronology_unavailable`**; a 7-digit fraction (`/tmp/ce/v7-12-digit-fraction.json`, filename is a generator misnomer) → exit 0.
Preserving positive: any ≤9-digit fraction (`/tmp/ce/v0-positive-base.json`). Fix: `(\d+)` with an explicit, documented
truncation to nanoseconds (the comparison is already `BigInt`-based at `:88-90`, so truncation is exact).

### L2 — Low — An unrecognised `clock_role` silently discards a usable `observed_at`

`:222-223`. `/tmp/ce/v5-unknown-clock-role.json` (role `review_observed_at`, otherwise identical to the passing positive) →
**exit 2 `chronology_unavailable`**; preserving positive `/tmp/ce/v6-review-return-role.json` → exit 0. A label the classifier
does not know silently discards evidence that was perfectly parseable. Fix: report `review_clock_role: null` with a distinct
finding (e.g. `clock_role_unknown`) and keep the chronology, or enumerate the role names actually used by the lane.

### L3 — Low — The 12 retained identity contrasts are bound to no gate

`.ufo/waves/round-22/historical-review-contrast.json` (12 cases, `reviewedHistoricalInvocationId` vs `finalInvocationId`,
`invocationSame: false` for each) is referenced by `LOG.md:1565` and by nothing else — `grep -rn "historical-review-contrast"`
over `*.py/*.mjs/*.md` returns only that LOG line. It is evidence with no executor. Fix: one cohort row asserting the 12
`invocationSame: false` facts against the retained blobs, or state in the file that it is a retained reading with no gate.

## 5. Counterexample index (all executed, all in `/tmp`, never in the lane)

| File | Exit | Verdict / finding | Purpose |
|---|---|---|---|
| `/tmp/ce/v0-positive-base.json` | 0 | `matched_supplied_scope` | preserving positive for H1/H1a/M2/M3/L1/L2 |
| `/tmp/ce/v1-other-seat-failure-peer-message.json` | 1 | `peer_revival_after_failure` | **H1** |
| `/tmp/ce/v2-broadcast.json` | 1 | `routing_broadcast` | **H1** |
| `/tmp/ce/v3-subset-scope.json` | 1 | `review_scope_gap` / `artifact_scope_mismatch` | **M2** |
| `/tmp/ce/v4-no-event-history.json` | 2 | `event_history_unavailable` | endorsed by `knowledge:99-101`; not a finding |
| `/tmp/ce/v5-unknown-clock-role.json` | 2 | `chronology_unavailable` | **L2** |
| `/tmp/ce/v6-review-return-role.json` | 0 | `matched_supplied_scope` | **M1** (role inert) |
| `/tmp/ce/v7-12-digit-fraction.json` | 0 | (filename is a generator misnomer: the content carries a **7**-digit fraction → parsed) | control for **L1** |
| `/tmp/ce/v9-late-failure.json` | 1 | `late_failure` | **H1** |
| `/tmp/ce/v10-seat-self-revival.json` | 0 | `matched_supplied_scope` | **H1a** |
| `/tmp/ce2-w6-anomaly-plus-unavailable.json` | 2 | `producer_digest_unavailable` (+ anomaly in `findings`) | **M4** |
| `/tmp/ce2-w10-supplied-review-seat-ignored.json` | 1 | `peer_revival_after_failure` | H1 (no seat binding) |
| `/tmp/ce2-w11-10-digit-fraction.json` | 2 | `chronology_unavailable` | **L1** |
| `/tmp/r-r3-in-window-final.json` | 1 | `review_scope_gap` | R3 conformance ✓ |
| `/tmp/r-r4-after-window-final.json` | 0 | `matched_supplied_scope` | R4 conformance ✓ |
| `/tmp/r-r5-receipt-start.json` | 1 | `review_scope_gap` | R5 conformance ✓ |
| `/tmp/r-r6-author-date-clock.json` | 0 | `matched_supplied_scope` | **M3** |
| `/tmp/r-r7-failed-seat.json` | 0 | `matched_supplied_scope` | **H2** |
| `/tmp/r-r8-subsecond-order.json` | 1 | `review_scope_gap` | R8 conformance ✓ |

## 6. Residual risk and verification gaps

* **The classifier's positive is an upper-bound claim, and nothing in the output says so.** `verdict: matched_supplied_scope`
  plus `scope_limit` (`:210`) is honest in wording but the exit code 0 is still a green light; M1's fix should make the
  bound explicit in the payload.
* **`checks-at-e3cf4e0.json` is not committed at `e3cf4e0`**; it exists only in the lane working tree. The review boundary
  describes it as a receipt for this revision; it is not part of the revision under review. Read-only, not written by me.
* **Not run:** the lane's full `run-checks.py` cohort (fleet clone + sandbox mutation), `measure-c1.mjs`, `selftest-c1.mjs`,
  the 35-row receipt generation. Only the two chronology rows are in scope here and they were run directly and read from the
  lane's receipts.
* **Not assessed (out of scope by the review boundary):** malicious-author authenticity, browser semantics, wake/dispatch
  authority, event-history completeness, whether the retained W2 reports are good reviews. The classifier explicitly does
  not assess these (`:210`); the findings above stay inside "does this classifier misclassify a review record".
* **Post-w2b work is not reviewed here:** this report covers the committed revision `e3cf4e0` only; later repairs are
  labelled post-w2b and are out of the boundary.
* **Tooling:** no installs, no upgrades were needed for this item (`node v24.21.0`, the version already pinned by the lane,
  was sufficient). Nothing to record against the operator tooling directive.

## 7. Recommended order of work (smallest first)

1. Add `review.seat` to the input schema and scope `:146-153` to that seat; move wave-wide findings to a non-gating
   `fleet_findings` field. (Closes H1, H1a, and enables H2.)
2. With a seat binding, return exit 2 `review_not_completed` when that seat's first terminal event is a failure. (Closes H2.)
3. Make the upper-bound role refute-only, or relabel the positive and add `coverage_certified: false`. Update the
   `exact_pre_review_artifact_positive` selftest case in the same commit. (Closes M1, and removes the gate's resistance to
   the fix.)
4. Enumerate a clock source and refuse unknown sources. (Closes M3.)
5. Split `artifact_scope_incomplete` from `artifact_scope_mismatch`. (Closes M2.)
6. Make the exit code reflect the highest-severity finding. (Closes M4.)
7. Add the retained cases R1/R2/R4 to `debt-expectations.json`, or a cohort row that recomputes the historical input from
   git blobs. (Closes M5.)
8. `instant()` fractional-digit cap; unknown-role reporting; a gate for `historical-review-contrast.json`. (L1, L2, L3.)
