# ScoutChronologyEvidence — round-22 artifact ordering

- Seat: `TabiR22-2.ScoutChronologyEvidence-16` (w2b, scout leaf; author-side falsification, not non-author admission).
- Review revision: `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` (landed, pushed). Prior checkpoint `0f24164be77e72ba359fe4befdc42d96bc343034`; baseline `5f585773258b33d2d514b00cd0b0775333578db6`.
- Claimed order (verbatim from this seat's dispatched item, `.ufo/waves/round-22/w2b-spec.json:230`): **claim-classification (before measurement), ruling, integration, review-snapshot, W2 refusals, post-crash repair, checks.**
- Mode: static, read-only. No lane script executed (no `run-checks.py`, `measure-c1.mjs`, `selftest-c1.mjs`, `check-review-chronology.mjs`); no git/jj writes; no browser; no installs or upgrades.
- Axes used: (1) chronology consistency of recorded times, (2) self-sufficiency of the ordering evidence inside the reviewed revision.
- Convention: all times converted to UTC. The lane's local clock is `-03:00`; git renders `%aI/%cI` in that offset, so commit times below are converted. All cited tracked files' working-tree bytes equal the `e3cf4e0` blobs (verified, 0 diffs), so cited line numbers are revision bytes.

## Verdict

The claimed order holds for five of the seven positions by recorded time and fails in three places.

| # | Artifact | Recorded time (UTC) | Claimed position | Holds? |
|---|---|---|---|---|
| 1 | `claim-classification.json:3` | 2026-10-21T14:57:22.507224 | first, before measurement | yes (first C1 evaluation is 16:30:18.257) |
| 2 | `classification-ruling.json:2` | 2026-10-21T14:58:02.702488 | after claim, before integration | yes |
| 3 | `integration-changes.json` (no time field), commit `0f24164` | file mtime 15:15:29.932; committer 15:35:37; **author 14:51:39** | third | yes by mtime/committer; **no by author time (F2)** |
| 4 | `review-snapshot.json:3` | 2026-10-21T15:36:22.194968 | fourth, before W2 validation/dispatch | yes (44/44 digests resolve at `0f24164`) |
| 5 | W2 refusals `w2-cap-refusal-01…09,11…14` | 15:41:19.140879 … 16:36:56.660489 | fifth, before repair | yes by time; **crash is mid-chain (F5)** |
| 6 | `post-crash-repair.json:3` | 2026-10-21T16:38:20.829585 | sixth, before checks | yes (commit `e3cf4e0` 16:38:27) |
| 7a | `checks-pre-w2-0f24164.json:5` | **16:30:18.257338 → 16:31:28.882079** | **checks last; filename claims "pre-w2"** | **no (F1)** |
| 7b | `checks-at-e3cf4e0.json:5` (untracked) | 16:38:34.099745 → 16:39:42.036350 | checks last | yes (F4: untracked) |

Direct answer to the item: **`checks-pre-w2-0f24164.json`**. Its name claims a pre-W2 position, but its own recorded run is 48 m 59 s after the first W2 refusal, 19 m 27 s after the recorded host kernel death, and 8 m 03 s *before* the post-crash repair record it is claimed to follow.

## Findings

### F1 (primary) — `checks-pre-w2-0f24164.json` claims a position its recorded time refutes

Observed (`e3cf4e0` bytes):
- `.ufo/waves/round-22/checks-pre-w2-0f24164.json:5` `"startedAt": "2026-10-21T16:30:18.257338+00:00"`; `:1338` `"verdict": "failed"`; `:1339` `"completedAt": "2026-10-21T16:31:28.882079+00:00"`.
- First W2 refusal: `.ufo/waves/round-22/w2-cap-refusal-01.json:3` `"at": "2026-10-21T15:41:19.140879+00:00"` (attempt 1). First dispatch file: `w2-spawn-result.json` mtime 15:40:56.453027.
- Refusal immediately before the check: `w2-cap-refusal-12.json:3` `16:30:11.854287` (6.403 s before `startedAt`); immediately after: `w2-cap-refusal-13.json:3` `16:33:56.590481` (+3 m 38.333 s).
- Recorded host kernel death: `w2-cap-refusal-11.json:16` — “slot granted 16:10:37Z, kernel died 16:10:51Z before any result”.
- Repair record: `post-crash-repair.json:3` `16:38:20.829585`, i.e. 8 m 02.572 s after the check started; its own discovery command (`:7`) is the command that produced `checks-pre-w2-0f24164.json`.
- The review boundary it was run against: `review-snapshot.json:3` `15:36:22.194968` + `:4` `reviewedRevision 0f24164` — 53 m 56 s before the check.

So the artifact’s actual position is **post-crash, mid-W2-refusals, pre-repair (the “discovery” run)**, not “pre-w2” and not the final “checks” slot. Under the claimed order it is 8 minutes too early to be “checks”; under its own filename it is 49 minutes too late to be pre-W2.

Interpretation boundary: “pre-w2” can only be defended vacuously (“before any W2 seat existed” — there were zero seats), or as a mislabel for “pre-w2b” (W2b’s payload is `w2b-spec.json`, mtime 16:40:54.966, after this check). No prose in the lane states either reading; `grep -rn 'pre-w2'` over `.ufo/waves/round-22` and `.ufo/reports` returns only the filename and its two references (`post-crash-repair.json:7`, `w2b-spec` scout item text).

- Smallest counterexample: `checks-pre-w2-0f24164.json` name vs `startedAt` 16:30:18.257338Z, with the first refusal at 15:41:19.140879Z and the repair at 16:38:20.829585Z.
- Preserving positive: `checks-at-e3cf4e0.json` carries a revision-qualified name (no positional claim), its `startedAt` 16:38:34.099745Z follows commit `e3cf4e0`’s committer time 16:38:27Z by 7.1 s, and its `completedAt` 16:39:42.036350Z is the last recorded round-22 event before the W2b payload (`w2b-spec.json` 16:40:54.966Z). The W2b chain is also monotone: spec 16:40:54.966 < validation 16:41:02.836 < first refusal 16:41:02.918.
- Smallest fix: do not rewrite `e3cf4e0`. In the closure/report, cite it as “discovery cohort run mid-W2-refusals at 16:30:18Z, before the repair”. If the name must stay durable, add a post-w2b commit that either renames it to `checks-before-repair-0f24164.json` or adds `"phase": "post-crash, mid-w2-refusals, pre-repair"` / `"nameBasis"` fields, updating the reference at `post-crash-repair.json:7` and the W2b item text. No retroactive credit either way.

### F2 — integration has no in-artifact time; the commit’s author time precedes the ruling it implements

Observed:
- `.ufo/waves/round-22/integration-changes.json:1-2` has no `at`/`createdAt`; first key is `"changes"`. Its file mtime is 15:15:29.932253.
- `git show -s --format='%H %aI %cI' 0f24164` → author `2026-10-21T11:51:39-03:00` = **14:51:39Z**, committer `2026-10-21T12:35:37-03:00` = 15:35:37Z.
- Contained recorded times, all later than the author time: `claim-classification.json:3` 14:57:22.507 (+5 m 43.507 s), `classification-ruling.json:2` 14:58:02.702 (+6 m 23.702 s), `w1-returns.json:4` `readAt` 15:33:51.021 (+42 m 12.021 s), `w1-outcomes.json:15` `observedThrough` 15:34:39.137 (+43 m 00.137 s).
- `.jj` is present and the commit carries `change-id xpmnrsqtrolsontvxxwptqqqsntkspqy`; author/committer diverge only for this commit (other recent commits differ by ≤5 min).

Inference (marked): jj preserves a change’s original author timestamp across amends, while the committer timestamp is set at export; the 44-minute gap is consistent with a change created at 14:51:39 and amended until 15:35:37. This is **not evidence of backdating** and not a tree-falsification — every contained artifact’s newest recorded time is ≤ the committer time, and a scan of all 130 tracked round-22 paths (59 JSON carrying timestamps) found no artifact first committed before its own newest recorded event time (sole flag is the provider-written 429 reset text `2026-10-27T09:47:39.273Z` in `w1-event-history.json`, a future quota reset, not an event).

- Smallest counterexample: author `14:51:39Z` < `classification-ruling.json:2` `14:58:02.702Z`, although `0f24164` contains that ruling.
- Preserving positive: committer `15:35:37Z` is after every contained recorded time and before `review-snapshot.json:3` `15:36:22.195`; `e3cf4e0` author = committer = 16:38:27, after its newest content (`post-crash-repair.json:3` 16:38:20.830).
- Smallest fix: add to `integration-changes.json` an explicit `"at"` (usable value: 2026-10-21T15:15:29.932Z, its actual write time) and `"commit": "0f24164…"`, `"commitCommitterAt": "2026-10-21T15:35:37Z"`; in prose, never cite the jj author date as the integration time. Post-w2b commit only.

### F3 — refusal series has 13 receipts for 14 attempts; refusal-11’s `at` is a copied dispatch time

Observed:
- Files exist for attempts 01–09 and 11–14 (13 files). Attempt 10 has no own receipt; it exists only as the `note` at `w2-cap-refusal-11.json:16` (“attempt 10 by dead TabiR22 is unrecorded: slot granted 16:10:37Z, kernel died 16:10:51Z”).
- `w2-cap-refusal-11.json:3` `"at": "2026-10-21T16:28:27.783022+00:00"` is byte-identical to `w2-attempt11-result.json:3`, while the refusal file’s mtime is 16:28:38.183821 (10.401 s later). The `at` is the attempt/dispatch time, not the record-write time; attempt 1’s `w2-spawn-result.json` likewise has no `at` at all.
- Consequence: “14 whole-payload refusals” is not self-evidencing from the numbered receipt series; it needs the prose note in a later record.

- Smallest counterexample: attempt numbers 1…14 vs 13 files (10 absent).
- Preserving positive: attempt numbers and `at` values are strictly increasing across all 13 receipts; paired `w2-attemptNN-result.json` files exist for attempts 2–9 and 11 and precede their normalized refusal receipts (03–09 within 4–8 ms; 02 by 39.4 s; 11 shares the same `at` and the refusal file is written 10.4 s later).
- Smallest fix: add a structured, clearly-labelled `unrecordedAttempts: [{attempt: 10, slotGrantedAt: 16:10:37Z, kernelDiedAt: 16:10:51Z, result: null, spawnedSeats: 0}]` to `w2-cap-refusal-11.json` (or a `w2-attempt-ledger.json`), and add `recordedAt` beside `at` on each refusal so dispatch time and write time are distinguishable. Do not invent a result for attempt 10.

### F4 — the 35/35 receipt is outside the reviewed revision

Observed: `git status --porcelain=v1 -uall` lists `?? .ufo/waves/round-22/checks-at-e3cf4e0.json`; `git cat-file -e e3cf4e0:…` fails. sha256 `8f4679ad20d02e6b58078ce4bb346de7c0f503e25cd1ba61e615825fc8a1fbe9`. Its `startedAt` (16:38:34.099745) is 7.1 s after the commit, so it can never be inside that revision. The review brief cites it as the 35/35 serial receipt.

This is not a time contradiction (the position is forced), but a reviewer restricted to `git show e3cf4e0:PATH` cannot verify the clean cohort from committed bytes; the same is true of all `w2b-*` receipts (untracked) and the W2b item text that carries this seat’s claimed order.

- Preserving positive: `checks-pre-w2-0f24164.json` *is* committed at `e3cf4e0` (blob present; working-tree bytes identical to the blob).
- Smallest fix: commit `checks-at-e3cf4e0.json` in a post-w2b-labeled commit and cite its digest in the closure; or, if no further commit is allowed, state explicitly in the closure that the 35/35 receipt is uncommitted and cite the digest above.

### F5 — the crash is inside the W2 refusal chain, not after it

Observed:
- `w2b-spec.json:3` (and `w2b-validation.json:427`) states: “14 whole-payload cap refusals, 0 seats; its host session then died.”
- `w2-cap-refusal-11.json:16` records the kernel death at **16:10:51Z**, after attempt 10’s slot grant at 16:10:37Z and before attempt 11.
- Attempts 11–14 (`w2-cap-refusal-11.json:4`, `12:4`, `13:4`, `14:4`: `"dispatcher": "TabiR22-2"`; `w2-attempt11-result.json:4`: `"TabiR22-2 (session-3 replacement)"`) are at 16:28:27.783022, 16:30:11.854287, 16:33:56.590481, 16:36:56.660489 — all after the death.
- Attempts 01–09 carry no `dispatcher` field, so the split is attributable for the post-crash half only by time plus the explicit dispatcher field.

Therefore at most 10 refusals precede the crash (attempts 1–9 receipts + attempt 10 slot-granted/kernel-death), and **4 of the 14 refusals are post-crash**. The sentence cannot be read as “all 14 refusals, then the host session died”. It also explains F1: the 16:30 check is necessarily post-crash.

- Smallest counterexample: death `16:10:51Z` vs refusals 11–14 at `16:28:27`–`16:36:56`.
- Preserving positive: `w2-spawn-result.json`/`w2-cap-refusal-01` show attempt 1 at 15:41:19.141, and `w2-cap-refusal-09` at 16:07:16.305 — a genuinely pre-crash block exists.
- Smallest fix: correct the narrative in the closure (and any post-w2b documentation) to “10 recorded attempts before the crash (attempt 10 slot-granted 16:10:37Z, kernel death 16:10:51Z), then 4 post-crash refusals by `TabiR22-2` (16:28:27–16:36:56Z); 0 seats.” **Do not alter** `w2b-spec.json`/`w2b-validation.json` bytes: their payload digest `d81e11a150571b5c77ec80e9c7c205afdd01e4a282c5b14f40c0bd4cd220e18e` (`w2b-spawn-result.json:4`) is the dispatch identity.

## Preserving positives / integrity checks (all observed)

1. Review-snapshot digests: all **44/44** `review-snapshot.json` paths match `git show 0f24164:<path>` SHA-256 and byte count (0 mismatches). The snapshot was not written from later bytes.
2. Working tree vs snapshot: exactly **3** mismatches — `measure-c1.mjs`, `selftest-c1.mjs`, `fixtures/expected.json` — precisely the three files in `post-crash-repair.json` `filesBefore`/`filesAfter`. `filesBefore` **3/3** match `0f24164` blobs and `filesAfter` **3/3** match `e3cf4e0` blobs (6/6). No silent post-snapshot mutation.
3. All tracked round-22 JSON working-tree bytes equal `e3cf4e0` blobs (**0** diffs), so every cited line number is revision content.
4. No tracked round-22 artifact is first committed before its own newest recorded event time (all 130 tracked paths scanned; 59 JSON carry timestamps); the one flag is the provider-written 429 reset text noted in F2.
5. Named order is monotone elsewhere: classification 14:57:22.507 < ruling 14:58:02.702 < integration write 15:15:29.932 < review-snapshot 15:36:22.195 < first refusal 15:41:19.141 < last refusal 16:36:56.660 < repair 16:38:20.830 < final checks start 16:38:34.100 (completed 16:39:42.036).
6. `review-snapshot.json:227` “Frozen before W2 validation/dispatch” is supported: snapshot 15:36:22.194968 < `w2-spec.json` mtime 15:36:22.195290 < `w2/swarm-registry.json` `createdAt` 15:36:22.221Z < `w2-validation.json` mtime 15:36:22.225952 < first dispatch file 15:40:56.453 < first refusal 15:41:19.141.
7. `claim-classification.json:4` `"beforeMeasurement": true` is supported for the C1 metric: no artifact records a C1 evaluation before 14:57:22.507; the first C1 evaluations are `c1-before`/`c1-after` inside `checks-pre-w2-0f24164.json` (`:760` and following, run 16:30:18.257→16:31:28.882). Earlier metric mentions are declarations only (`baseline.json:3-4`, W1 spec/validation context, `fixtures/expected.json`).
8. Metric receipts are internally consistent with the repair story: pre-repair `c1-after` value 0, exit 1, findings `semantic_error` + `semantic_navigation`; post-repair `c1-after` value 12, exit 0, clean; `oracle22-selftest` 41/42 failed vs `selftest-repair-sandbox.json` 44/44 clean. `run-checks.py` producer sha256 `c501034d…` matches `review-snapshot` and both receipts. (Read from receipts; not rerun.)

## Unrun / unverified

- No lane script was executed (static review only): `run-checks.py`, `measure-c1.mjs`, `selftest-c1.mjs`, `check-review-chronology.mjs` and all gates are unverified by execution; findings rely on recorded bytes.
- No jj command executed; the author-date explanation in F2 is inferred from `.jj`, the `change-id` header, and the 44-minute author/committer gap.
- “pre-w2” intent (pre-dispatch vs pre-w2b) is not documented anywhere in the lane; both readings are given in F1.
- Whether the L1’s “checks” means both receipts or only the final one is unstated; under either reading at least one contradiction remains.
- Author authenticity of untracked `w2b-*` payloads is out of scope (malicious-author authenticity not attacked).
- Internal per-gate durations are not independently replayable from the receipts (`runs` carry exit/stdout, not per-gate timings).

## Commands exercised (read-only; exit 0 unless stated)

| Command (abridged) | Exit |
|---|---|
| `git -C <lane> log --format='%H %cI %aI %s' -n 12` | 0 |
| `git show -s --format='%H%ncommit:%cI%nauthor:%aI%n%s' 0f24164 / e3cf4e0 / 5f58577` | 0 |
| `git ls-tree -r --name-only <rev> -- .ufo/waves/round-22` (5f58577, 0f24164, e3cf4e0) | 0 |
| `git cat-file -p 0f24164` / `git cat-file -p e3cf4e0` | 0 |
| `git cat-file -e <rev>:<path>` presence probes (integration/claim/snapshot paths) | 0 (present/absent as reported) |
| `git status --porcelain=v1 -uall` (shows `?? checks-at-e3cf4e0.json`, `?? w2b-*`) | 0 |
| Python SHA-256 comparison, snapshot vs `0f24164` blobs (44 paths) | 0 |
| Python SHA-256 comparison, working tree vs `review-snapshot` (44 paths) | 0 |
| Python SHA-256 comparison, `filesBefore`/`filesAfter` vs both revisions (6 paths) | 0 |
| Python SHA-256 comparison, all tracked round-22 JSON vs `e3cf4e0` blobs | 0 |
| Python scan, introducing commit time vs newest recorded time (130 paths) | 0 |
| Python timestamp extraction over all round-22 JSON (top-level + nested) | 0 |
| `grep -rn` for ordering claims / `pre-w2` / `16:10` / dispatcher fields | 0 (matches) |
| `sha256sum run-checks.py measure-c1.mjs selftest-c1.mjs fixtures/expected.json checks-at-e3cf4e0.json w2b-*` | 0 |
| `date -u +%FT%TZ` | 0 |
| One Python heredoc reading `selftest-*.json` mis-typed `cases` as list | **1** (harness error; retried with the correct type, exit 0) |

No packages installed or upgraded.

Report: .ufo/waves/round-22/w2b/ScoutChronologyEvidence.md
