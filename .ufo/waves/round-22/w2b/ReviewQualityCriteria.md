# ReviewQualityCriteria — QUALITY criteria ↔ failing-control coverage (round-22, wave w2b)

- **Item:** `corpus/QUALITY.md` round-22 criteria — does each criterion map to a gate/control that *can fail*? Name the criteria with no failing control.
- **Lane:** `/home/vgpnk/Projects/shokunin/tabi-shokunin`
- **Revision reviewed:** `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` ("round-22: repair landing-stage oracle defects found by first positive run; retain W2 cap-refusal chain"), predecessor `0f24164be77e72ba359fe4befdc42d96bc343034`.
- **Method:** static read only. Production files were read through `git -C <lane> show e3cf4e0…:<path>`; **no lane script was executed**, no browser, no install, no delegation, no VCS write to the lane/fleet, no seat messaging. The only bytes I wrote are this report.
- **Author-side falsification, not admission.** Everything below is a recommendation.

---

## 1. Control inventory (what can actually fail at `e3cf4e0`)

Committed executable controls found in the lane at the reviewed revision, with the finding vocabulary each one can emit:

| Control (path) | Failure vocabulary (source of truth) | Notes |
|---|---|---|
| `scripts/check-round-contract.mjs` | `missing_gate`, `missing_score`, `score_mismatch`, `round_count`, `round_sequence`, `short_swarm`, `swarm_evidence`, `report_missing`, `report_commit`, `report_not_after_commit`, `report_shonen`, `history_rewritten`, `shonen_policy`, `evidence_moved`, `public_observation`, `consequential_action`, `selftest_failure`, `witness_failure`, `count_witness_failure`, `could_not_evaluate` (`fail()` at :45) | Scope is **only** `pstack-20261015-rNN` (`roundIds` :339) |
| `scripts/check-user-round-contract.mjs` | same vocabulary + `reason` ∈ `COUNT_REASONS` (:96) | Scope is **only** `user-20261015-rNN` (`roundIds` :421); spec validity delegated to the out-of-lane fleet validator `ufo-swarm-wave.mjs` (:61, invoked :547) |
| `scripts/check-sources.mjs` | `bad_id`, `bad_kind`, `bad_tier`, `bad_status`, `bad_opened`, `bad_recheck`, `bare_anchor`, `duplicate_id`, `duplicate_url`, `malformed_row`, `row_outside_registry`, `tier_inflation`, `rejected_without_flip`, `mined_without_used_by`, `used_by_missing`, `used_by_escape`, `used_by_uncited`, `credential_material` (`evaluate()` :247) | Offline registry shape/tier/date check only |
| `scripts/check-adjacency.mjs` | closed `REASON` set :247 (`sibling_ref_invalid`, `sibling_unresolved`, `sibling_quote_absent`, `ruling_quote_absent`, `l0_line_absent`, `duplicate_row`, …) | `corpus/adjacency.tsv` only |
| `scripts/check-measurement-binding.mjs` | closed `REASON` set :139 (`counter_digest_unrecorded`, `counter_digest_mismatch`, `counted_inputs_undeclared`, `counted_input_changed`, `count_not_reproduced`, `argv_unsupported`, …) | Fires **only** for a manifest that exists |
| `scripts/check-aria-metadata.mjs` | `snapshot_tampered`, `snapshot_unavailable`, mirror-field findings (:94, :101, :109, :263) | Browser cleanup/qualification mirrors |
| `scripts/check-freshness.mjs` | `baseline_pin`, `source_pin`, `target_set`, `content_drift`, `unsafe_file`, `selftest_failure` (byte-frozen) | Freshness anchor |
| `.ufo/waves/round-20/check-wave.mjs` | `wave_null`, `wave_mismatch`, `agent_id_missing`, `snapshot_reconstructed`, `tracked_change`, `out_of_scope`, `input_not_regular`, `snapshot_tampered` (:55) | Registry label + clone-isolation snapshot + reconstructed-snapshot refusal |
| `.ufo/waves/round-22/measure-c1.mjs` + `selftest-c1.mjs` + `fixtures/expected.json` | `semantic_status`, `semantic_error`, `semantic_output`, `semantic_timing`, `semantic_navigation`, `semantic_delayed`, `evidence_binding`, `source_binding`, `input_shape` (:103, :399) | The wave's semantic outcome oracle (44 CLI cases) |
| `.ufo/waves/round-22/check-review-chronology.mjs` + `debt-expectations.json` | `review_scope_gap`, `acquisition_after_review_observation`, `producer_digest_mismatch`, `artifact_scope_mismatch`, `chronology_unavailable`, `event_history_unavailable`, `peer_revival_after_failure`, `routing_broadcast`, `late_failure` (:25) | Review-scope/chronology classifier (17 cases) |
| `.ufo/waves/round-19/{isolation/check-isolation.mjs,measure-c2.mjs,measure-c3.mjs}` | ledger / `run_aborted` / SIGINT-SIGHUP-SIGTERM cases / `direct_return_snapshot_missing_reconstruction_is_not_observation` | Retained but **not** in the round-22 cohort |
| `.ufo/waves/round-20/{counts.mjs,lesson-history.mjs}` | counters (JSON output), `lesson-history.mjs` scope: “lessonDrift only, not complete USER gate” | Counters, not gates |

"Absence" evidence for the criteria I call uncontrolled is a token sweep over `scripts/` and `.ufo/waves/round-1[6-9]/`, `.ufo/waves/round-2*/` counters for the criterion's own vocabulary: `opinion`, `inference`, `consecutive`, `cadence`, `evidence class`, `IDL`, `unforgeable`, `snapshot date`, `row-count gap`, `sole support` → **zero hits** in every control except where noted.

---

## 2. Criterion → control map (58 criteria, `corpus/QUALITY.md` at `e3cf4e0`)

`C` = a control exists that can fail on the criterion. `P` = partially controlled (a named sub-clause is enforced, the rest is not). `—` = no control in the lane can fail on it.

| # | QUALITY.md line | Criterion (short) | Control that can fail | Status |
|---|---|---|---|---|
| 1 | :3 | claim falsifiable or marked opinion | none (`opinion` 0 hits) | **—** |
| 2 | :4 | claim carries a measured source anchor | `check-round-contract.mjs:360 parseScore`, `check-user-round-contract.mjs:484`, `check-sources.mjs:247` (registry rows only) | P |
| 3 | :6 | observation / inference / unknown separated | none (`inference` 0 hits) | **—** |
| 4 | :7 | errata are append-only blocks | `check-round-contract.mjs:305 checkHistory` → `APPEND_ONLY` :25 (prefix compare) | C |
| 5 | :8 | a rejection is kept, not silently dropped | `check-round-contract.mjs:346 parseLesson` (≥1 `- rejected:` + reason → `missing_gate`), user gate :428 — **pstack/user lessons only** | P |
| 6 | :10 | gate pins inputs, refuses symlink/non-regular, self-test asserts refusals | `check-freshness.mjs:56/:117`, `check-wave.mjs:89 readRegularBytes` → `input_not_regular`, frozen digest pinning | C |
| 7 | :13 | aggregate lands in the round's LOG entry in the same integration commit | `check-round-contract.mjs:668` `missing_score` (LOG lacks the round id) — “same commit”/“retired with reason” unenforced | P |
| 8 | :16 | reject verified ≥3 consecutive rounds pinned once, spot-check cadence | none (`consecutive`, `cadence` 0 hits) | **—** |
| 9 | :19 | seat route alias resolves to a real binding before dispatch | out-of-lane validator `ufo-swarm-wave.mjs` relayed at `check-user-round-contract.mjs:547` → `short_swarm` (user rounds only) | P |
| 10 | :22 | no admission while an earlier round's lesson is missing | none for the tabi series: `roundIds` :339 (pstack) / :421 (user) never enumerate `corpus/lessons/round-N.md`; `round-20/lesson-history.mjs` is lessonDrift-only | **—** |
| 11 | :26 | coverage/index map lists every note or states snapshot date + exact open row-count gap | none (only the append-only prefix of `corpus/README.md` is checked) | **—** |
| 12 | :29 | source tier A/B; tier C never sole support | `check-sources.mjs:247` (`bad_tier`, `tier_inflation`, `bad_opened`) — **no** “≥1 opened A/B supporting row”, **no** “C never sole support” rule | P |
| 13 | :30 | check a corpus path against `protectedPath` before writing | `check-round-contract.mjs:168 protectedPath` + census `:251` → `history_rewritten`; user gate :226 | C (post-hoc) |
| 14 | :31 | distillation preserves the evidence class of its source | none (`evidence class` 0 hits) | **—** |
| 15 | :36 | tier definitions live in canonical `CORPUS.md` | none (no control reads that pointer; `check-sources.mjs` carries its own tier list) | **—** |
| 16 | :42 | historical protection separates baseline paths from future lessons; narrow validated policy | `check-round-contract.mjs:251 censusEntries`, `:208 checkShonenPolicy` → `shonen_policy`; user gate :391 | C |
| 17 | :48 | runtime negative control: complete case-input manifest, producer's real rejection cause, positive control, aggregate after worker restart | `scripts/aria-loopback-round13.mjs` records `workerRestarts` (:647) as a *field*; no gate validates the manifest/causal attribution | **—** |
| 18 | :54 | browser cleanup summary agrees with a complete nonempty worker-proof set | `check-aria-metadata.mjs:381 evaluateCleanup` + `CLEANUP_MIRROR_FIELDS` :101 | C |
| 19 | :60 | historical count expression is data, never authority to invoke a shell | `check-user-round-contract.mjs:451` closed `TREE_COUNT`/`GREP_COUNT` grammar, `:502 runCount`, self-test `count_malicious_shell_refused` | C |
| 20 | :65 | mirrors compared against authenticated underlying proofs; independent CLI expectations | `check-aria-metadata.mjs:94/263` → `snapshot_tampered`, mirror-field findings | C |
| 21 | :72 | negative counting control asserts its diagnostic reason, not any `score_mismatch` | `check-user-round-contract.mjs:96 COUNT_REASONS`, `:105 fail(reason)`; self-test `expected_reason` + `applicability`/`marker_outcome` | C |
| 22 | :78 | count binds counter blob sha256 + counted inputs, re-run at delivered HEAD (`--reproduce`) | `check-measurement-binding.mjs:139/565` — **fires only for an existing manifest**; no round-22 manifest exists (see F3) | P |
| 23 | :85 | browser-API observation names object/build/flags/secure-context, checks current spec text | none (`IDL` 0 hits; `corpus/knowledge/browser-surface-census.md` is prose) | **—** |
| 24 | :91 | hypothesised API path checked against spec IDL in the writing round; no negative gloss until checked | none | **—** |
| 25 | :97 | counter executing measured-revision code adds counter-owned probes | `selftest-measurement-binding.mjs:337` `COUNTER_CONST`/`COUNTER_STRING` injection arms | C |
| 26 | :102 | run claim cites a committed receipt with argv, producer digest, revision, exit | `check-measurement-binding.mjs:452 manifestProblems` for bound claims; prose run claims unchecked; the wave's own receipt is uncommitted at `e3cf4e0` (see F4) | P |
| 27 | :107 | probe described by the finite shapes it defeats; no absolute words | none (`unforgeable` appears only as a self-disclaimer in `round-20/check-wave.mjs:3`) | **—** |
| 28 | :112 | every evidence pointer resolves as committed bytes; no `/tmp`-only root | `check-user-round-contract.mjs:257 pointerResolves` + `:247 committedBlob` (SHONEN evidence lines only) | P |
| 29 | :117 | gate's implicit anchor is the lane tip | `check-round-contract.mjs:114 laneTip` + `lane_tip_*` self-test cases; user gate :160 | C |
| 30 | :126 | receipt records producer path+sha256; cited only when the digest equals the registered blob | `check-measurement-binding.mjs:400 blobSha256` + manifest validation | P |
| 31 | :131 | correction to a sha-pinned note names that frozen path/line in an append-only index row | `corpus/README.md` is append-only-checked, but nothing requires a correction row to exist | **—** |
| 32 | :134 | sibling scope overlap dispositioned in a committed `adjacency.tsv` row with resolvable quotes | `check-adjacency.mjs:218 COLUMNS`, `:222 DISPOSITIONS`, `:247 REASON` | C |
| 33 | :140 | superseding source row removes the falsified premise from **every** cell | `check-sources.mjs` `rejected_without_flip` inspects the `teaches` cell only | P |
| 34 | :143 | prose count carries its counting command against the named revision | `check-round-contract.mjs:515 runCount`, user gate `:502` (SCORECARD rows only) | P |
| 35 | :147 | no-harm receipt binds the complete gate set and executed gate bytes to the measured revision | `.ufo/waves/round-19/final/harm-at-measured.json` is *consumed* by `round-22/run-checks.py:45-50` (digest recorded), but no gate validates its contents | **—** |
| 36 | :151 | rerun evidence retains full SHA-256 digests and the artifacts they hash | `check-aria-metadata.mjs:94/147 ANCHORS` (browser-evidence subset) | P |
| 37 | :154 | self-test claim cites a committed receipt under `corpus/evidence/` with argv, exit, stdout, producer identity | `corpus/evidence/round-21/selftest-c1.json` exists; no gate validates its fields | **—** |
| 38 | :157 | quote presence ≠ source identity; URL transformation binding | `check-sources.mjs` is offline (no fetch); `round-18/measure-c1.mjs` recheck receipts cover round-18 rows only | P |
| 39 | :161 | response-body digest re-derived from retained bytes; quote offset re-derived | same as 38; `round-18/recheck-fetch.mjs` is a one-off producer | P |
| 40 | :166 | download/artifact predicate scans every new file under artifact roots; per-run nonce | `scripts/webmcp-invoke-round19.mjs` (H4) + `round-19/measure-c2.mjs` uuid-artifact mutant | C |
| 41 | :174 | signal-abort claim enumerates **each** signal (SIGINT/SIGHUP/SIGTERM) | `round-19/measure-c2.mjs:1202` loops `['SIGINT','SIGHUP']`, `:944` `run_aborted` marker, `:1508` SIGHUP arm | C (round-19 tool) |
| 42 | :180 | a revision-input refusal claim enumerates each refused shape and its reason token | `check-adjacency.mjs:247` closed reason vocabulary; claim-side enumeration is prose | P |
| 43 | :187 | LOG/SCORECARD count line re-derived by command, command+output recorded in the same commit | `check-round-contract.mjs:360` + user gate `:484` (SCORECARD rows only); `round-19/measure-c3.mjs:113 checkD1` is hardcoded to criteria 33–39 / `LOG.md:1059`. **Round-22 LOG prose counts are unchecked → see F1** | P |
| 44 | :194 | every registry file has a non-null `wave` equal to the spec's | `round-20/check-wave.mjs:55/134` → `wave_null`/`wave_mismatch`; round-22 used a one-off `dispatch-label-check.json` | P |
| 45 | :201 | concurrent writers prove clone isolation via a committed ledger | `round-19/isolation/check-isolation.mjs`; `round-20/check-wave.mjs` `tracked_change`/`out_of_scope`; `round-19/measure-c3.mjs:344-367` (ledger, tracked diff, reconstruction refusal) | C (round-19/20 tools) |
| 46 | :209 | integration-time change to a seat-authored expectation recorded with the original and reason; full case set re-run | `.ufo/waves/round-22/integration-changes.json` records it, but nothing fails when it is missing | **—** |
| 47 | :214 | type-level rejection claim names input shapes and checks conversion branches | none | **—** |
| 48 | :219 | reconstructed return-time status is not an observed snapshot | `round-20/check-wave.mjs:51/166` → `snapshot_reconstructed`; `round-19/measure-c3.mjs:358` | C |
| 49 | :224 | refines 40/44/46 explanatory text only | inherits 40/44 (46 itself is **—**) | P |
| 50 | :229 | source-only decision table separates callsite from downstream effect | none | **—** |
| 51 | :235 | task-return barrier ≠ all-actor quiescence; scope return claims to observed facts | `round-20/check-wave.mjs:3-8` (self-disclaimer only); `round-22/check-review-chronology.mjs:25` `peer_revival_after_failure` | P |
| 52 | :242 | strict invocation→observation→action ordering | `round-22/measure-c1.mjs` `semantic_timing` (`pre-action-dispatch-post-sequence`, `invocation-sequence`) + selftest cases | C (wave-local) |
| 53 | :250 | navigation can destroy the document → unavailable (null), not an empty list | `round-22/measure-c1.mjs` `semantic_navigation` `url-missing`; `round-21/measure-c1.mjs` `note_missing` | C (wave-local) |
| 54 | :257 | source association checked in the **first** `source:` line | `round-22/measure-c1.mjs:399` `source_binding` `canonical-S101-first-line`; `round-21/measure-c1.mjs:96` | C (oracle-local) |
| 55 | :263 | structural consistency is not a semantic oracle | `round-22/measure-c1.mjs` + `selftest-c1.mjs` (44 cases, `semantic_*` findings) | C |
| 56 | :269 | outcome oracle persists independent expected status/output/window; coherent negative cases; baseline zero ≠ absence | `round-22/selftest-c1.mjs` + `fixtures/expected.json` (44 cases incl. `wrong-success-nonce`, `native-landing-errors`, `producer-bytes-unpinned`, `raw-case-hash-unpinned`) | C |
| 57 | :276 | review scope content-addressed and chronology-bound | `round-22/check-review-chronology.mjs:25` `review_scope_gap`/`acquisition_after_review_observation`; red case `historical-review-scope-red` (exit 1) in the cohort | C |
| 58 | :284 | first-terminal failure snapshot ≠ complete final seat history | `round-22/check-review-chronology.mjs:25` `peer_revival_after_failure`, `late_failure`, `event_history_unavailable` | C (wave-local classifier) |

**Answer to the item — criteria with no failing control (18):** 1, 3, 8, 10, 11, 14, 15, 17, 23, 24, 27, 31, 35, 37, 46, 47, 50 — plus the un-enforced remainder of 2, 5, 7, 12, 22, 26, 28, 30, 33, 34, 36, 38, 39, 42, 43, 44, 45, 49, 51.

---

## 3. Findings (severity order)

### F1 — HIGH — criterion 43: the round-22 LOG count line is stale in the very revision under review, and no control can fail on it

- **Criterion:** `corpus/QUALITY.md:187` — “A LOG or SCORECARD count line (criteria, rows, cases, correction items, or sibling counts) is re-derived by a command run against the content it counts at the revision about to be committed, before that commit is made; the command and its output are recorded in the same integration commit. A count copied from prose, an older lesson, or a prior line is a finding.”
- **Revision/path/line:** `LOG.md:1561-1562` at `e3cf4e0`: “Independent CLI expectations were authored for`42` semantic controls and`17` chronology/history controls. They are not yet exercised.”
- **Same-commit artifacts that disagree:** `.ufo/waves/round-22/fixtures/expected.json` → **44** cases; `.ufo/waves/round-22/selftest-repair-sandbox.json` → `"cases":44,"passed":44`. The two cases added by this very repair are `native-landing-errors` and `native-landing-wrong-query` (diff of `.ufo/waves/round-22/selftest-pre-repair-0f24164.json` `"cases":42` vs `selftest-repair-sandbox.json` `"cases":44`) and both are *semantic* controls (they assert `semantic_navigation` findings on the landing stage — the defect the repair fixed).
- **Introduced by the reviewed revision:** at `0f24164` the file had 42 cases, so “42” was then correct; `git diff --stat 0f24164 e3cf4e0` shows `fixtures/expected.json` (+22), `measure-c1.mjs` (+12), `selftest-c1.mjs` (+12) changed and **`LOG.md` unchanged**. The sibling number “17” *is* re-derivable (`len(.ufo/waves/round-22/debt-expectations.json['cases']) == 17`), which is the preserving positive for the same sentence.
- **Why no control fires:** `scripts/check-round-contract.mjs:360 parseScore` parses only `<!-- pstack-round:… -->` blocks in `SCORECARD.md`; `scripts/check-user-round-contract.mjs:484` the user-wave equivalents; the only criteria-count re-derivation is `round-19/measure-c3.mjs:113 checkD1`, hardcoded to criteria 33–39 and `LOG.md:1059`. Nothing reads a round-22 LOG prose count.
- **Smallest counterexample:** keep every committed byte as-is at `e3cf4e0`; a reader who re-derives the count of the committed semantic CLI expectations gets **44**, the LOG says **42**, and all 35 cohort controls still exit 0 (`checks-at-e3cf4e0.json`, 35 runs, all `pass:true`).
- **Preserving positive:** keep the “17 chronology/history controls” clause and its artifact `debt-expectations.json` (17 cases) exactly as they are; keep `selftest-repair-sandbox.json` (44/44) as the recorded run of the expectation set.
- **Smallest fix:** append (never edit — `LOG.md` is append-only per `scripts/check-round-contract.mjs:25`) a correction block to the round-22 LOG section stating “semantic CLI expectations: 44 (44 = 42 pre-repair + 2 landing-stage semantic controls added by the `e3cf4e0` repair)”, and record the re-derivation command and its output in the same commit, e.g. `python3 -c "import json;print(len(json.load(open('.ufo/waves/round-22/fixtures/expected.json'))['cases']))"` → `44` and `…debt-expectations.json…` → `17`. Long term, one check that compares a LOG prose count against the artifact it counts would close criterion 43 for all rounds.

### F2 — HIGH — criterion 22: the wave's own C1 counter has no measurement-binding manifest, so the binding control cannot fire on it

- **Criterion:** `corpus/QUALITY.md:78` — a count binds the counter blob sha256 at its measured revision and its declared counted inputs and is re-run at the delivered HEAD via `scripts/check-measurement-binding.mjs --check <manifest> --at <delivered HEAD> --reproduce`; “A revision-only pin, or a digest of a counter committed after the measured revision, is a finding (`counter_digest_unrecorded` / `counter_digest_mismatch`), never a pass.”
- **Revision/path/line:** committed manifests exist for rounds 16–21 (`corpus/evidence/round-16/measurement-binding.json`, `…/round-17/…`, `.ufo/waves/round-18|19|20|21/measurement-binding.json`) — **none for round-22**. The wave's counter is `.ufo/waves/round-22/measure-c1.mjs` (metric `c1_semantically_checked_lifecycle_rows`, `METRIC` const :22, `EXPECTATIONS_SHA256` :23, `PRODUCER_SHA256` :24, `INPUT_PATHS` :38). Those constants pin the counter's *inputs*; nothing binds the counter *blob* to a measured revision.
- **Why no control fires:** `scripts/check-measurement-binding.mjs:565 evaluateClaim` only evaluates claims present in a manifest; with no round-22 manifest the gate has nothing to refuse. The cohort ran it only for the round-16 and round-17 manifests (`checks-at-e3cf4e0.json` runs `check-measurement-binding-check-r16-…` and `…r17-…`).
- **Smallest counterexample:** edit `.ufo/waves/round-22/measure-c1.mjs` so the 12 retained rows are scored with a laxer expectation, or re-point `EXPECTATIONS_SHA256`/`PRODUCER_SHA256`; the counter still prints a clean `value:12` and no gate in the lane can say “counter_digest_unrecorded”. (Contrast: the round-21 manifest binds `.ufo/waves/round-21/measure-c1.mjs` sha256 `8d992423…` with explicit `countedInputs` — the shape to copy.)
- **Preserving positive:** leave `.ufo/waves/round-21/measurement-binding.json` and its bound counter digest untouched; the round-22 counter's existing `EXPECTATIONS_SHA256`/`PRODUCER_SHA256` self-pins stay as they are.
- **Smallest fix:** add `.ufo/waves/round-22/measurement-binding.json` with one claim (`id: "C1"`, `countField: "c1_semantically_checked_lifecycle_rows"`, `counter.argv: ["node",".ufo/waves/round-22/measure-c1.mjs","{REV}"]`, `counter.sha256` = the committed blob digest, `countedInputs` = the 17 paths already exported as `INPUT_PATHS` at `measure-c1.mjs:38`) and run `scripts/check-measurement-binding.mjs --check .ufo/waves/round-22/measurement-binding.json --at <delivered HEAD> --reproduce` in the cohort. The gate already refuses `counter_digest_unrecorded`/`counter_digest_mismatch`/`counted_input_changed`, so the new manifest is the only missing piece.

### F3 — MEDIUM — criterion 10/11: nothing ties a round's LOG section to its lesson file or to a coverage-map row

- **Criterion:** `corpus/QUALITY.md:22` (“A round is not admitted while an earlier round's lesson is missing …; a lesson deferral names the closing round and its closing surface”) and `:26` (“A coverage/index map either lists every current note or states its snapshot date and the exact open row-count gap in the same commit as each admit.”).
- **Revision/path/line:** `LOG.md:1496` opens `## Round22 — finite lifecycle outcome oracle and honest review scope`, and `LOG.md:1545`+ records executed waves, at `e3cf4e0`. `corpus/lessons/` at `e3cf4e0` holds `round-1.md … round-21.md` (plus `training-round-11.md`) — **there is no `corpus/lessons/round-22.md`**, and no deferral statement names a closing round or closing surface (`git show e3cf4e0:LOG.md | grep -i deferr` returns only two round-3 depth-priority lines, `LOG.md:1060,1077`).
- **Why no control fires:** `scripts/check-round-contract.mjs:339 roundIds` matches only `corpus/lessons/pstack-20261015-r\d{2}.md`; `scripts/check-user-round-contract.mjs:421 roundIds` only `corpus/lessons/user-20261015-r\d{2}.md`; `.ufo/waves/round-20/lesson-history.mjs` enumerates only lessons *changed since the pin* and labels itself “scope: lessonDrift only, not complete USER gate”. `corpus/README.md` is only append-only-prefix-checked (`APPEND_ONLY` :25); no control reads its rows.
- **Smallest counterexample:** the present state is the counterexample — a round with an executed, measured, LOG-sectioned wave and no lesson file, with all 35 cohort controls green. A second, still smaller one: add one more `corpus/knowledge/*.md` note and no `corpus/README.md` row; nothing fails.
- **Preserving positive (and it is currently satisfied):** I re-derived the coverage map at `e3cf4e0` — 41 knowledge notes exist and all 41 have a `| \`knowledge/…md\` |` row in `corpus/README.md` (0 missing), so criterion 11's first branch holds *today*; and `corpus/lessons/round-21.md` exists with its `## Gate` section. Both must stay that way.
- **Smallest fix:** one check that enumerates `corpus/lessons/round-N.md` against the round numbers that `LOG.md` opens and fails `missing_lesson` when a round section has no lesson file (or when a deferral block names no closing round/surface), plus one check that every `corpus/knowledge/*.md` has a README row. Both are small additions to `scripts/check-user-round-contract.mjs` (which already owns `corpus/lessons` traversal) or a new `scripts/check-quality-controls.mjs`.

### F4 — MEDIUM — criterion 26/35/37: prose run and self-test claims are not tied to committed receipts, and the wave's own receipt is uncommitted at the reviewed revision

- **Criterion:** `corpus/QUALITY.md:102` (run claim cites a committed receipt recording argv, producer digest, revision, exit), `:147` (no-harm receipt binds the complete gate set and executed gate bytes to the measured revision), `:154` (self-test claim cites a committed receipt under `corpus/evidence/` with argv, exit, stdout, producer identity).
- **Revision/path/line:** `git -C <lane> ls-files --error-unmatch .ufo/waves/round-22/checks-at-e3cf4e0.json` → *“did not match any file(s) known to git”*, while `.ufo/waves/round-22/checks-pre-w2-0f24164.json` **is** tracked. The 35/35 cohort receipt that the wave's own outcome rests on is therefore not a committed receipt at `e3cf4e0`; it is produced *after* the commit (`.ufo/waves/round-22/run-checks.py:46-49` writes to a caller-supplied path and refuses an existing file), so it can only enter the tree in a later commit.
- **Why no control fires:** `scripts/check-measurement-binding.mjs:452 manifestProblems` validates manifests, not prose; `scripts/check-round-contract.mjs` parses only pstack SCORECARD rows; `round-22/run-checks.py:45-50` *reads* `.ufo/waves/round-19/final/harm-at-measured.json` and records its digest, but nothing validates that receipt's gate set or gate bytes; `corpus/evidence/round-21/selftest-c1.json` is never validated by a gate.
- **Smallest counterexample:** delete the tracked `.ufo/waves/round-22/checks-pre-w2-0f24164.json` from the tree (or edit its argv/exit fields) — no control fails, and the round-22 claim "33/35" in `LOG.md` would still read as supported.
- **Preserving positive:** keep `checks-pre-w2-0f24164.json` byte-identical and keep the recorded producer digests (`producerSha256` per run) as they are.
- **Smallest fix:** commit the final cohort receipt (`checks-at-<tip>.json`, or a `final/` copy) as part of the round's integration commit and add one assertion to `run-checks.py` that the receipt it just wrote is byte-identical to the blob committed at the tip (or, minimally, that `git cat-file -e <tip>:<receipt path>` resolves) before the round claims admission; and add a check that each `corpus/evidence/**/selftest-*.json` receipt carries argv/exit/stdout/producer digest.

### F5 — MEDIUM — criterion 12: `check-sources.mjs` cannot fail on “tier C never sole support”

- **Criterion:** `corpus/QUALITY.md:29` — “an admitted external claim cites ≥1 opened corpus/SOURCES.md row of tier A or B for its scope; tier C never sole support”.
- **Revision/path/line:** `scripts/check-sources.mjs:247 evaluate()` checks tier *validity* (`bad_tier`), `tier_inflation` (tier A + kind `community`), `bad_opened`, `bare_anchor`, `rejected_without_flip`, and that a `mined` row has a `used_by` path that exists and contains the row id (`inspectUsedBy` :203). It never compares tiers of supporting rows for one claim. Current registry at `e3cf4e0`: 101 rows — A:88, B:4, C:9 — and all nine C rows are `rejected`, so no mined C row exists *today*.
- **Smallest counterexample:** flip the tier cell of any of the three **mined** tier-B rows to `C` (every other cell left valid). `check-sources.mjs` still exits 0 — `tier_inflation` fires only for A+`community`, and `mined_without_used_by` still passes because `used_by` is unchanged — while that claim's sole support has become a tier-C row, exactly what criterion 12 forbids.
- **Preserving positive:** keep the nine rejected tier-C rows and their `REJECTED:`/`flip:` cells as they are; keep every mined row's `used_by` path and its cited row id (that is what `used_by_uncited` currently protects).
- **Smallest fix:** generalise the pattern the round-22 oracle already implements: for each `mined` row, read the `source:` line of the note(s) in its `used_by` path and require at least one row id there to be tier A or B — `round-22/measure-c1.mjs:399` already does exactly this for S101 (`source_binding`, `canonical-S101-first-line`).

### F6 — MEDIUM — criteria 38/39: no control re-derives a fetched body digest or quote offset for rows admitted after round-18

- **Criterion:** `corpus/QUALITY.md:157` and `:161`.
- **Revision/path/line:** `scripts/check-sources.mjs` is offline by construction (no fetch, no digest of a body). The only digest/offset re-derivation in the lane is the round-18 pair `.ufo/waves/round-18/recheck-fetch.mjs` + `.ufo/waves/round-18/measure-c1.mjs` (`RECEIPT_DIR = 'corpus/evidence/round-18/source-recheck'`, `BASELINE_ELIGIBLE_ROWS = 51`), i.e. a round-18-scoped, historical counter. It is not in the round-22 cohort (`checks-at-e3cf4e0.json` lists no round-18 counter run).
- **Smallest counterexample:** replace the anchor quote of a mined tier-A row in `corpus/SOURCES.md` with text that does not appear on the cited page, leaving every cell structurally valid; `check-sources.mjs` exits 0 (it never opens the URL) and no cohort control reads the recheck receipts.
- **Preserving positive:** keep `corpus/evidence/round-18/source-recheck/*` receipts and the S101 own-work row's Git-object binding as they are.
- **Smallest fix:** add a `--recheck <dir>` mode to `check-sources.mjs` that re-derives each mined row's response-body digest and quote offset from the retained bytes under `corpus/evidence/round-18/source-recheck/` (the same arithmetic `round-18/measure-c1.mjs` performs) and fails `digest_unrederived` / `quote_absent`, then run it for the rows admitted in rounds 19–22.

### F7 — LOW — the lane's two round-contract gates never read the lane's own round series

- **Criterion cluster:** 4, 5, 7, 10, 13, 16, 43, 44 (all the “round contract” obligations).
- **Revision/path/line:** `scripts/check-round-contract.mjs:339` (`pstack-20261015-rNN`) and `scripts/check-user-round-contract.mjs:421` (`user-20261015-rNN`). No gate enumerates `corpus/lessons/round-N.md`, the `## RoundNN` sections of `LOG.md`, or the tabi-round `SCORECARD.md` rows. The only tabi-round protection is a byte-freeze (`protectedPath` :168 / user gate :226, `corpus/lessons/round-\d+\.md`) which prevents *changing* an existing lesson but never checks that a lesson exists, is well-formed, or carries a `## Gate` with an admit/reject/spot-check (`parseLesson` :346 is applied only to pstack lessons).
- **Smallest counterexample:** the reviewed revision itself — `LOG.md` has a `## Round22` section with executed waves and measurements, and `corpus/lessons/round-22.md` does not exist (see F3).
- **Preserving positive:** the pstack/user gates keep passing unchanged (their 33/35 → 35/35 receipts must not regress).
- **Smallest fix:** extend `roundIds` in one gate with a `corpus/lessons/round-N.md` series and apply the existing `parseLesson` shape (`## Gate`, `axis:`, `consequential-external-actions: none`, ≥1 admit, ≥1 reject with reason, exactly one non-author spot-check) plus a LOG-entry presence check — the machinery already exists at :346 and :668.

### F8 — LOW — prose-only criteria with no control and no scheduled owner

Criteria **1, 3, 8, 11, 14, 15, 17, 23, 24, 27, 31, 35, 37, 46, 47, 50** are conventions kept by review only. The token sweep for their own vocabulary over every control in the lane returned zero hits (`opinion`, `inference`, `consecutive`, `cadence`, `evidence class`, `IDL`, `snapshot date`, `row-count gap`, `sole support`). Consequences worth naming: nothing stops a future distillation from restating a source-code reading as an observed host behavior (14), nothing stops an unchecked API hypothesis from acquiring a negative gloss in a census/README row (23/24), and nothing stops a probe description from using absolute words (27) — the last one is exactly the class of defect that criterion 27 was written to prevent after round 16.
**Smallest counterexample:** append one sentence to a `corpus/knowledge/*.md` note asserting “Chromium’s `navigator.modelContext` does not exist” with no spec check — every control stays green.
**Preserving positive:** `corpus/knowledge/browser-surface-census.md` currently carries the `navigator.modelContext` hypothesis with an explicit *unchecked-hypothesis* label; keep that label.
**Smallest fix (generic, one file):** add `corpus/QUALITY.controls.tsv` — one row per criterion number → controlling path:line (or `prose:`) — and one check that fails `criterion_uncontrolled` when a criterion in `corpus/QUALITY.md` has no row, or when a row names a path/line that no longer exists. This makes the coverage of this report machine-checkable instead of prose, and is the single smallest change that converts the 16 prose-only criteria into tracked debt.

---

## 4. Residual risk and verification gaps (honest)

- **Nothing was executed.** No lane script, gate, counter or selftest was run in this review; every statement about a control's behaviour is read from its committed source at `e3cf4e0`. The counterexamples above are static arguments from code paths, not observed failures.
- **The 35/35 cohort numbers were taken from a receipt, not reproduced.** `.ufo/waves/round-22/checks-at-e3cf4e0.json` is **not** in the lane index at `e3cf4e0` (`git ls-files --error-unmatch` → no match); its contents (35 runs, all `pass:true`, `oracle22-selftest` 44/44, `chronology22-selftest` 17 cases, `c1-before` value 0 / `c1-after` value 12) are quoted, not verified by me. The tracked sibling `checks-pre-w2-0f24164.json` (33/35) is the only committed cohort receipt at that revision.
- **Historical controls are not in this round's cohort.** The round-18/19 counters that back criteria 25, 38–41, 45, 48 were read but not re-run; their verdicts are as recorded in their own rounds.
- **My coverage verdicts are reading-based.** “No control” for the 16 prose criteria rests on the token sweep over `scripts/` and the round-16…round-22 counters; a control that encodes the same requirement under different vocabulary could exist and be missed by a keyword search. I checked the full executable inventory (all `#!/usr/bin/env` files under the lane at `e3cf4e0`) rather than only the named scripts, so the sweep covered every committed control, but the *vocabulary* of a rule remains a judgment.
- **Out-of-lane dependency.** `scripts/check-user-round-contract.mjs:61` delegates spec/route validation to `/home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs`, which I did not read (outside the lane, and the fleet is read-only for this wave). Criterion 9's true coverage therefore cannot be settled from the lane alone.
- **Adjacency is fleet-dependent.** `check-adjacency.mjs` was run in the cohort against a fleet clone; its `ruled`/`contested-open` rows resolve against sibling lanes I did not open.
- **Scope discipline.** I attacked only “criterion → failing control” coverage. The round-22 repair's *behaviour* (the landing-stage oracle fix, the C1 metric 0→12, the 12-row population) is covered by other w2b seats; this report makes no claim about whether the repair is correct beyond the count-line inconsistency in F1.

---

## 5. Recommendation

1. **Fix F1 in the same commit family as the next round-22 integration** (append-only LOG correction + recorded re-derivation command/output) — it is a one-paragraph change against a criterion the wave already invokes.
2. **Add the round-22 measurement-binding manifest (F2)** and run the binding gate with `--reproduce` at the delivered HEAD; this is the only criterion-22 obligation for a wave that publishes a new counter.
3. **Decide the lesson/coverage-map policy for the tabi round series (F3/F7)** — either extend an existing gate to `corpus/lessons/round-N.md`, or record an explicit deferral that names the closing round and closing surface, as criterion 10 already requires.
4. **Commit the final cohort receipt (F4)** before any admission claim that cites it.
5. **Add `corpus/QUALITY.controls.tsv` + one check (F8)** so that “criterion with no failing control” becomes a machine-reported fact rather than a reviewer's table; the 16 prose-only criteria are then tracked debt with owners instead of invisible convention.

Report: `.ufo/waves/round-22/w2b/ReviewQualityCriteria.md`
