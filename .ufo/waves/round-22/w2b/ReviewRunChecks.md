# ReviewRunChecks — run-checks.py cohort design (round 22, wave w2b)

- Item: `run-checks.py` cohort design — expected exits/metrics, sandbox isolation, preservation predicates, skipped USER gate; and the `checks-pre-w2-0f24164.json` (33/35) vs `checks-at-e3cf4e0.json` (35/35) comparison.
- Reviewed revision: `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` (landed, pushed). Production read with `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show e3cf4e0d…:<PATH>`.
- Method: **static only**. No lane script was executed (no `run-checks.py`, no `measure-c1.mjs`, no `selftest-c1.mjs`, no gate script). No browser, no installs, no delegation, no VCS mutation of the lane/fleet. All commands were read-only (`git show`, `git diff`, `git ls-tree`, `git cat-file`, `git status`, `git rev-parse`, `grep`, `python3` for JSON/digest arithmetic).
- Tooling: no installation was required for this item; none was performed.
- Line numbers below are for the files **at revision `e3cf4e0d…`** (`.ufo/waves/round-22/run-checks.py` is byte-identical at `0f24164…` and `e3cf4e0…`: sha256 `c501034d2a2fd4d5a4b7f33ef30f0a3c0f24db636c7c9d0bf1c4ef05618e68cd`, confirmed equal to the committed blob).

---

## 0. Headline answer to the comparison question

**Yes — every behavioural difference between the two receipts is explained by the repair alone; every other difference is non-behavioural noise. No third cause is visible.** Evidence:

`git diff --name-status 0f24164be77e72ba359fe4befdc42d96bc343034 e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` touches **only `.ufo/waves/round-22/`** — three modified oracle files (`measure-c1.mjs`, `selftest-c1.mjs`, `fixtures/expected.json`) and 33 **added** evidence artifacts (`checks-pre-w2-0f24164.json`, `post-crash-repair.json`, `review-snapshot.json`, `selftest-*.json`, `w2-*.json`, `w2-cap-refusal-*.json`, `w2/swarm-registry.json`). **No production code, no `corpus/`, no `scripts/` path differs between the two measured revisions.** So the only input change available to the cohort is the 9-line oracle repair.

Per-gate diff of the two receipts (35 gates, identical gate list and order; A pass 33/35, B pass 35/35):

| gate(s) | A (0f24164) | B (e3cf4e0) | explanation |
|---|---|---|---|
| `oracle22-selftest` | exit 1, `cases=42 passed=41` | exit 0, `cases=44 passed=44` | **repair.** The pre-repair oracle reported `semantic_error na-native-submit:post:page-errors` + `semantic_navigation na-native-submit:post:url` on the *positive* case (defects D1/D2 in `post-crash-repair.json`); the repair fixes both and adds the two mutation cases (`native-landing-errors`, `native-landing-wrong-query`) → 42→44 cases. |
| `c1-after` | exit 1, `value=0`, `verdict=failed`, 12 rows (all `counted:false`) | exit 0, `value=12`, `verdict=clean`, 12 rows (all `counted:true`) | **repair**, same cause. The population is unchanged: the same 12 retained round-21 cases are read in both receipts (12 rows, 12 distinct ids in both). |
| `c1-before` | pass | pass | only `producerSha256` changed (`76b47edd…`→`47176aed…`, the repaired `measure-c1.mjs`); measured against BASE `5f58577…` it is `verdict=baseline` in both. |
| `lifecycle21-after`, `lifecycle20-after`, `curation-after`, `lesson-history-only` | pass | pass | only the embedded `revision` string / `argv` target changed; the metric payloads are identical (`c1_lifecycle_observations=12`, `c1_lifecycle_decisions=12`, `rows=101 knowledge=41 tiers/statuses` unchanged, `refused=[round-18.md, round-19.md]` unchanged). |
| `check-adjacency-production` | pass | pass | only the scratch path in `--fleet` (`/tmp/tabi-r22-checks-czu409ht` → `-r5w_g3_1`); `ADJACENCY verdict=clean rows=10 verified=10` byte-identical. |
| `check-round-contract-count-witness`, `check-user-round-contract-witness`, `check-user-round-contract-count-witness`, `check-user-round-contract-diagnostic-witness` | pass | pass | only the witness scripts' **runtime-derived** identifiers changed (`baseline=`, `measured-against=`, `--pstack-pin`, temp repo path, `code_revision=`); the verdict lines (`result=PASS`, `exit=0 verdict=clean`) are unchanged. |
| `check-aria-metadata-check` | pass | pass | only the `absPath` of the sandbox copy differs; all digests (`sha256`, `bytes`) identical. |
| `lifecycle21-selftest` | pass | pass | only the temporary fixture revision id inside the selftest's own JSON differs. |
| other 18 gates | pass | pass | no difference at all. |

The `skipped` block is byte-identical in both receipts (same gate, same `knownExit: 1`, same reason string).

Binding check on the "before" side: the A receipt's `c1-after` row records `producerSha256 = 76b47edd9eb30ff64554ef0238ffcea70312059318f9c86cc64231fea7acc447`, which equals the sha256 of the **committed** pre-repair blob `git show 0f24164…:.ufo/waves/round-22/measure-c1.mjs`. So the "0" of 0→12 is bound to the committed pre-repair producer, and the A receipt itself is committed at `e3cf4e0…` (sha256 `c996047688972def738dd84cd6656b0378144b1bebd542e69d143d22ceb585a0`).

**However**, the cohort itself never re-derives that "0" (see S8), and the "35/35" artifact is not part of the reviewed revision (see S5).

---

## 1. Findings by severity

### S1 — Medium — The oracle's falsification coverage is asserted only by exit code; the case inventory and the expectation file are unbound

- **Where**: `.ufo/waves/round-22/run-checks.py:115-121` (gate registration, `expectedExit: 0`, **no** `expectedMetrics`), `:148` (`row = dict(gate, argv=argv, producerSha256=digest(lane / gate['producerPath']))`), `:154-160` (metrics parsed only when `expectedMetrics` is present).
- **What the gate really runs**: `measure-c1.mjs:527-531` spawns `.ufo/waves/round-22/selftest-c1.mjs` with `stdio:'inherit'`; that driver reads its expectations from `.ufo/waves/round-22/fixtures/expected.json` (`selftest-c1.mjs:26`) and sets `process.exitCode = passed === reports.length ? 0 : 1` (`selftest-c1.mjs:465`).
- **Evidence that this matters here**: the repair commit changed the expectation file and the driver *as well as* the oracle — `git show --numstat e3cf4e0…` → `measure-c1.mjs 9/3`, `selftest-c1.mjs +12`, `fixtures/expected.json +22`. The receipt binds **only** `measure-c1.mjs` (`producerSha256 47176aed…` in B, `76b47edd…` in A). Neither `selftest-c1.mjs` nor `fixtures/expected.json` has a digest anywhere in the receipt, and the cohort never asserts the selftest's `cases`/`passed` counts.
- **Smallest counterexample (with preserving positive)**: delete every mutation case from `fixtures/expected.json`, leaving only `"positive"`. `selftest-c1.mjs` then prints `cases:1 passed:1`, exits 0 → `oracle22-selftest` passes; `c1-after` still reports `value=12 verdict=clean`; the whole receipt still reads `verdict: clean`, `35/35`, while the oracle has **zero** failure-capable cases. (The same holds for loosening one case's `finding` to `null` with `value:12, exit:0` — `selftest-c1.mjs:375-393` only requires `ids.includes(expected.finding)`.)
  **Preserving positive**: today the selftest genuinely exercises 44 cases and passes 44/44 (`checks-at-e3cf4e0.json` → `oracle22-selftest` stdout `{"verdict":"clean","cases":44,"passed":44}`), and the A receipt shows it *can* fail (`cases:42 passed:41`, exit 1) — so the gate is not vacuous today.
- **Smallest fix**: give the `oracle22-selftest` row `expectedMetrics: {'cases': 44, 'passed': 44, 'verdict': 'clean'}` (the selftest's stdout is exactly that JSON) and record a second digest for the two supporting files (e.g. `supportSha256: {'selftest-c1.mjs': …, 'fixtures/expected.json': …}`). This keeps 35/35 green today and pins the coverage count.

### S2 — Medium — The headline metric is checked as a scalar only: "12" is never bound to the 12 canonical case ids, distinctness, or counted-ness

- **Where**: `run-checks.py:128-132` — `expectedMetrics: {'c1_semantically_checked_lifecycle_rows': count, 'verdict': verdict}` with `count=12`; comparison at `:158` (`row['observedMetrics'].get(k) == v`).
- **Evidence**: the B receipt's `c1-after` stdout carries the full row set — 12 rows, 12 distinct ids, 12 with `counted:true` — but the checker asserts none of that.
- **Smallest counterexample (with preserving positive)**: make `measure-c1.mjs` push the same row twice (`rows.push(row)` twice) → `value` is still 12 and `verdict` still `clean` → `c1-after` passes; the wave's claim "12 failure-capable semantic-oracle rows" would then be false while the receipt says clean. Same for counting a row whose `semanticMatch` was never evaluated.
  **Preserving positive**: the receipt contains everything needed — today `{r.id for r in rows}` is exactly the 12 canonical ids and all 12 are `counted:true`, so a row-level postcondition is satisfiable without changing any outcome.
- **Smallest fix**: add a per-row postcondition to the `c1-after` row — `sorted(r['id'] for r in rows) == <the 12 canonical ids>` and `all(r['counted'] for r in rows)` — keeping the scalar assertions as they are. (This is the cohort-side counterpart of the "population 12→12" wording; the population is currently pinned only by the separate `lifecycle21-after` gate `c1_lifecycle_observations == 12`.)

### S3 — Medium — The sandbox self-mutation predicate is computed but never enforced; the fleet and sibling clones have no predicate at all

- **Where**: `run-checks.py:67` (`'statusBefore': git(lane, 'status', '--porcelain=v1', '-uall')`), `:163` (`result['sandbox']['statusAfter'] = git(lane, …)`), `:164` (`result['verdict'] = 'clean' if all(row['pass'] for row in result['runs'])`).
- **Evidence**: `statusAfter` is written and **never read** — no comparison exists anywhere in the file, and the verdict is computed over `result['runs']` only. The fleet clone (`:61`) and the six sibling clones (`:64-65`) have **no** status check at all.
- **Smallest counterexample (with preserving positive)**: any cohort gate that writes into its `cwd` (the sandbox lane) — the gate scripts contain such writes (`scripts/check-round-contract.mjs:774,783-784,797,821`, `scripts/check-aria-metadata.mjs:1673,1759,1994-1995`) — leaves the sandbox dirty; the receipt would still say `verdict: clean` and would even *record* the dirt in `statusAfter` without failing. The same gap hides a mutation of the fleet or a sibling clone.
  **Preserving positive**: in both receipts `sandbox.statusBefore == ''` and `sandbox.statusAfter == ''`, so the predicate currently holds; adding the comparison changes no outcome.
- **Smallest fix**: after the run loop, `if result['sandbox']['statusAfter'] != result['sandbox']['statusBefore']: raise RuntimeError('sandbox-mutated')`, and record/compare `git status --porcelain` for `fleet/` and each `fleet/<sibling>/` too.

### S4 — Medium — The lane sandbox keeps a push-capable `origin` pointing at the real lane, contradicting the module's own isolation claim

- **Where**: `run-checks.py:3-5` (docstring: *"historical gate fixtures run only in a disposable pinned fleet, **never mutating the lane index or jj state**"*), `:31-35` (`clone()` — `git clone` sets `origin=<source>`; `git branch -f <branch> <revision>`), `:63` (`clone(LANE, lane, revision, 'master')`).
- **Smallest counterexample (with preserving positive)**: a cohort gate (or any future gate added to the cohort) that runs `git push` with `cwd=lane` pushes the sandbox `master` — force-set to the revision at `:34` — into the **real** lane. Re-running the cohort at an older revision after the lane advanced would therefore move the real lane's `master` backwards. No current gate pushes (I grepped the seven gate scripts: no `push` occurrence), so this is latent, not an active mutation.
  **Preserving positive**: with the push URL removed, nothing observable changes — `statusBefore`/`statusAfter` stay `''`, all 35 gate outcomes are unaffected.
- **Smallest fix**: in `clone()`, immediately after the clone, run `git -C <target> remote set-url --push origin /dev/null` (or `git remote remove origin`), so no sandbox clone can write to a real repository.

### S5 — Medium — The "35/35" artifact for the reviewed revision is not in the revision: the comparison baseline is committed, the "after" receipt is not

- **Where**: `git ls-tree e3cf4e0… .ufo/waves/round-22/checks-at-e3cf4e0.json` → **absent**; `git status --porcelain=v1 -uall` → `?? .ufo/waves/round-22/checks-at-e3cf4e0.json` (sha256 `8f4679ad20d02e6b58078ce4bb346de7c0f503e25cd1ba61e615825fc8a1fbe9`). By contrast `checks-pre-w2-0f24164.json` **is** committed at `e3cf4e0…` (sha256 `c996047688972def738dd84cd6656b0378144b1bebd542e69d143d22ceb585a0`).
- **Consequence**: the 33/35 → 35/35 transition that the wave narrative rests on is evidenced by a file that exists only in a dirty worktree. Nothing inside revision `e3cf4e0…` binds it, and a reader who has only the revision cannot re-derive or authenticate it. (The wave's own `w2b` receipts — `w2b-*.json` — are untracked for the same reason.)
- **Smallest counterexample (with preserving positive)**: `git clone` the lane at `e3cf4e0…` and look for the receipt → it is absent; the claim "35/35 at e3cf4e0" is unverifiable from the revision.
  **Preserving positive**: the A receipt is committed and its `producerSha256` matches the committed pre-repair producer blob, so the *before* side is already bound; only the *after* side needs the same treatment.
- **Smallest fix** (post-w2b commit, per the wave's own labelling rule — `e3cf4e0…` is read-only for me): commit `checks-at-e3cf4e0.json` (and, if the wave wants it attested, the `w2b-*` receipts) under the round-22 evidence path, or record `{path, sha256}` for each in a committed manifest.

### S6 — Low/Medium — The skipped USER production gate: the skip is defensible for this revision, but the receipt's `verdict: clean` cannot be distinguished from "everything verified", and the known-red *reason* is never reproduced

- **Where**: `run-checks.py:56-57` (`skipped`), `:111-114` (gate excluded from the cohort), `:164` (verdict over `runs` only). Already raised in round-22 w1 (`AttackRevision.md` F15); restated here with new evidence and a sharper disposition.
- **New evidence — the known red is a *lesson-history drift*, not a generic red**: the retained round-19 observation for that gate is `finding=history_rewritten detail=Pstack bytes changed: A corpus/lessons/round-18.md` (`.ufo/waves/round-19/final/harm-at-measured.json`, run `check-user-round-contract-production`), and the gate's drift predicate is `pstackDrift`/`lessonDrift` over `PSTACK_PATHS` (`scripts/check-user-round-contract.mjs:77-86,333-352`), where `corpus/lessons` is one of the watched paths. The retained substitute gate `lesson-history-only` (`run-checks.py:143-145`, `.ufo/waves/round-20/lesson-history.mjs`) checks a **different** predicate (it asserts refusal of `round-18.md`/`round-19.md`); it never evaluates the USER gate's pin `92d700d6…` or its `PSTACK_PATHS`, so it does not stand in for the skipped gate.
- **I checked whether the skip hides a round-22 change — it does not, for this revision**:
  - `corpus/lessons/` is byte-identical between BASE `5f58577…` and `e3cf4e0…` (no `corpus/lessons/round-22.md` exists; the allowance at `run-checks.py:83-84` was never used), and the whole `BASE..e3cf4e0` change set is `M` on `LOG.md, SCORECARD.md, SKILL.md, corpus/QUALITY.md, corpus/README.md, corpus/SOURCES.md` plus `A` on `corpus/evidence/round-22/semantic-expectations.json`, `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md` and 130 `.ufo/waves/round-22/*` files. `reports/`, `corpus/evidence/pstack-20261015/`, `scripts/check-round-contract.mjs`, `scripts/check-freshness.mjs`, `SHONEN.md` are untouched.
  - The gate's append-only contract is anchored at `HARD_BASELINE 7f506aff…`, i.e. *older* than the cohort's `BASE 5f58577…` anchor. I verified the prefix chain **HB → BASE → REV holds for all six `APPEND_ONLY` docs** (`LOG.md, SCORECARD.md, SKILL.md, PROVINCE.md, corpus/QUALITY.md, corpus/README.md`): `True` for `HB→BASE`, `True` for `BASE→REV`, `True` for `HB→REV`. So the cohort's BASE-anchored prefix predicate implies the gate's stricter round-1-anchored predicate at this revision.
  - `corpus/SOURCES.md` (which round 22 **did** modify) is neither in `protectedPath` nor in `APPEND_ONLY` (`scripts/check-user-round-contract.mjs:226-235,77`), so the round-22 S101 edit cannot trip the skipped gate.
- **Residual defect**: the receipt still reports a bare `verdict: clean` while one production gate was never run, and the only record of its state is the number `knownExit: 1` with a prose reason; the *finding* (`history_rewritten`) that justifies the skip is not asserted anywhere, so a future round could flip the gate's reason (or its exit) and the cohort would not notice.
- **Smallest counterexample (with preserving positive)**: if round 22 had added `corpus/lessons/round-22.md`, the skipped gate would have changed its drift set and the receipt could not tell. It did not, so today's skip is sound.
- **Smallest fix**: (a) give the receipt a scope-distinguishing field, e.g. `verdict: 'clean-with-known-red'` or `verdictScope: '34/35 cohort rows verified; 1 known-red production gate skipped'`, and (b) when the gate is next run, assert the *reason* too (`expectedExit: 1` plus a pinned `finding: 'history_rewritten'`) instead of trusting the inherited number.

### S7 — Low — The preservation baseline is read from the revision under test (self-referential); the hole is closed for this round only by the changed-path scope rule

- **Where**: `run-checks.py:68` (`frozen = json.loads((lane / '.ufo/waves/round-22/preservation-baseline.json').read_text())`) — the list of 4865 protected `(path, mode, gitBlob)` triples comes from the tree being validated. `:75-76` compares them against the tree at `revision`.
- **Status**: `preservation-baseline.json` is **not** in its own `frozen['files']` list (verified), so it is not self-pinned. The hole is nevertheless closed for this round: the file is `A` in the `BASE..e3cf4e0` diff, and `scope_errors` (`:85-87`) treats any later `M` to a path that is neither in `mutableDocs` nor an `A` under `allowed_new` as a failure — so modifying the baseline breaks the scope check and fails the run.
- **Smallest counterexample (with preserving positive)**: a future round that (a) edits a protected file and (b) re-pins its blob id inside its own round's `preservation-baseline.json` would pass `:75-76`; it would only be stopped by the scope rule of that round, which depends on `allowed_new` continuing to list only *new* round directories.
  **Preserving positive**: today `mismatches` is empty, `scopeErrors` is empty, `sourceErrors` is empty, `gitlinks` is empty, and every `prefixes` value is `true` in both receipts.
- **Smallest fix**: read the baseline from the anchor commit instead of the tree under test — `git show BASE:.ufo/waves/round-22/preservation-baseline.json` — or add the baseline file itself to `frozen['files']` so it is pinned like any other protected file.

### S8 — Low — The cohort's "before" control measures a *different population* (oracle absent), so the cohort itself never re-derives the "0" of 0→12

- **Where**: `run-checks.py:129-132` — `c1-before` runs the **repaired** producer against `BASE 5f58577…` and expects `{'c1_semantically_checked_lifecycle_rows': 0, 'verdict': 'baseline'}`. The `baseline` verdict is produced by `measure-c1.mjs:384` (`if (!expectationsPresent && !notePresent) return result([], [], 0, 'baseline', 0)`) — i.e. **the oracle inputs do not exist at BASE**, so the "0" is an *oracle-absent* zero, not "the same oracle over the same population yields 0".
- **Consequence**: the wave's headline "0→12 over the SAME retained round21 observations" is **not** independently re-derived by the 35-gate cohort. It is supported by the **committed A receipt** (`checks-pre-w2-0f24164.json`, `c1-after` at `0f24164…` → `value=0 verdict=failed`, 12 rows, 12 distinct ids, all `counted:false`), whose `producerSha256` matches the committed pre-repair blob. That is adequate evidence, but the dependency is asymmetric and invisible in the B receipt.
- **Smallest counterexample (with preserving positive)**: if the pre-repair oracle had produced `value=12` over the same population, the A receipt would show `value=12` and the 0→12 claim would be false — the B cohort would still say 35/35 either way, because nothing in it depends on the A receipt's content.
- **Smallest fix**: add a cohort row that runs the **pre-repair** producer (pinned by blob id `76b47edd…`, e.g. `git show 0f24164…:.ufo/waves/round-22/measure-c1.mjs`) against the same population and expects `value 0 / verdict failed`; or add an assertion in the B receipt that the A receipt's `c1-after` row is present with `value == 0` and `rows == 12`.

---

## 2. Checked and *not* a defect (negative results worth recording)

1. **Sandbox clone mechanics** — `git clone --no-hardlinks` (`:32`) avoids hardlink aliasing of the real lane's objects; `git switch --detach` + `branch -f` + `switch` (`:33-35`) puts the clone at the exact revision; `scratch` is created with `tempfile.mkdtemp` (`:58`) and removed in `finally` (`:169`). Output writing is guarded by `if output.exists(): raise SystemExit('refusing existing output')` (`:46-47`) — no silent overwrite.
2. **Producer digest binding of the checker itself** — `result['producerSha256'] = digest(__file__)` (`:53`) equals the sha256 of the committed blob at `e3cf4e0…` (`c501034d…`), and the worktree copy is byte-identical, so the receipt is attributable to the committed checker.
3. **Expected-exit inheritance is not laundering** — the 22 historical rows take `expectedExit` from the round-19 measured cohort; a gate that regresses would produce `exit != expectedExit` and fail loudly. The one red in the cohort is *deliberate* (`historical-review-scope-red`, `:122-127`, expects exit 1 **and** pinned metrics `verdict/finding = review_scope_gap`) — a genuine positive control proving the harness can detect red.
4. **Preservation predicates are mutually reinforcing, not duplicated-but-blind** — `mismatches` (`:75-76`, blob-level pin of 4865 files), `prefixes` (`:77-81`, append-only for the six mutable docs), `scope_errors` (`:82-87`, changed-path allow-list incl. the `/clones/` tripwire), `source_errors` (`:88-104`, `corpus/SOURCES.md` row-set + immutable-cell comparison with the S101 `used_by` special case), `gitlinks` (`:107`, no submodules) — any failure raises at `:108-109` and the run reports `could-not-evaluate` (exit 2) rather than a false `clean`.
5. **Adjacency coverage in the sandbox is not reduced** — the sandbox fleet pins only 6 of the ~21 sibling repos in `/home/vgpnk/Projects/shokunin`, but `scripts/check-adjacency.mjs` does **not** enumerate the fleet directory (no `readdirSync`; it resolves only siblings named in the lane's map file), and the sandbox result `ADJACENCY verdict=clean rows=10 verified=10` is byte-identical to the round-18/19/20/21 real-fleet observations (`rows=10 verified=10`). `verified == rows` means every referenced sibling was present in the sandbox.
6. **The repair did not weaken the independent expectations** — the `fixtures/expected.json` diff is purely **additive** (two new mutation cases), and the one changed expectation (`native-submits-empty`: `semantic_navigation` → `semantic_status`) corrects a masked negative exactly as `post-crash-repair.json` D3 states. The two new cases are backed by two mutation probes recorded in `post-crash-repair.json` (`43/44 failed` for each disabled check).
7. **No gate in the cohort pushes or writes to the real lane** — verified by grepping the seven gate scripts for `push`/`writeFileSync` targets; all writes target temp fixture roots.

---

## 3. Residual risk and verification gaps (honest)

- **No lane script was executed.** Every statement above about runtime behaviour is derived from the recorded receipts (A and B), the committed sources at `e3cf4e0…`, and read-only git plumbing. I did **not** re-run `run-checks.py`, `measure-c1.mjs`, `selftest-c1.mjs`, or any gate; I cannot independently confirm the receipts' stdout beyond what they record, and I cannot confirm that the receipts were produced by the committed checker binary other than by the matching `producerSha256`.
- The counterexamples in S1, S2, S3, S4, S7 are **static constructions**; none was executed (execution of lane scripts is out of scope for this item). Each is stated with the preserving positive that holds today, so the smallest fix can be validated by re-running the cohort once (which the parent L1 owns).
- `checks-at-e3cf4e0.json` is untracked, so a future lane-side commit could change it without changing the revision; my S5 fix is the only durable binding.
- I did not audit `w2b-spec.json` / `w2b-validation.json` / the cap-refusal chain beyond confirming they are untracked artifacts added between the two measured revisions; the W2/W2b chronology and cap-refusal semantics are other seats' scope.
- The skipped USER production gate remains **unexecuted** at this revision by design; my assessment that the skip is sound rests on the input-level analysis in S6 (lesson set unchanged, `reports/` and the pstack paths unchanged, HB→BASE→REV append-only prefix chain verified) — not on a rerun.

---

## 4. Summary for the parent

- The 33/35 → 35/35 transition is **fully explained by the repair**: the only production-relevant delta between the two measured revisions is the 9-line `measure-c1.mjs` landing fix (+ the two new mutation cases); every other field difference is revision strings, scratch paths, or witness-derived hashes.
- The cohort's real weaknesses are **not** in the repair but in the harness: the oracle's falsification coverage is unpinned (S1), the headline metric is a bare scalar (S2), the sandbox-mutation predicate is computed and never enforced (S3), the sandbox keeps a push-capable remote to the real lane (S4), the "35/35" receipt is outside the revision (S5), and the skipped USER gate's justification is asserted rather than demonstrated (S6).
- None of S1–S5 contradicts the wave's claim of a repaired 0→12 metric; they bound how strongly the cohort can support that claim (coverage count unpinned, row identity unpinned, artifact unbound).

Report: .ufo/waves/round-22/w2b/ReviewRunChecks.md
