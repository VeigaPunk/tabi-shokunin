# RevengeCounterIntent — why round-15's C1 counter moved after its measurement

Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Read-only slice. `measure.mjs` was **not executed** by this seat
(the reproduction below is static reasoning over counter code + recorded receipt bytes, per assignment). No tool installs or
updates were performed.

## Verdict

- **Why it changed:** C1 and C2 share one counter file. C2's consumer-only repair at `9fd8bca` (05:59:13) rewrote
  `.ufo/waves/round-15/measure.mjs` (+26/−9, five hunks) *after* C1's after-run at `b7cf044` (05:51) and after the 05:48
  `27dfd98` pin. File identity moved `sha256 3ee59de0…` → `dd9c8675…`; C1's own evaluated path moved only in one shared
  helper (`caseLineList`), whose new grammar is provably inert on the shipped USER receipt.
- **Does HEAD reproduce C1's recorded after-count at `b7cf044`?** **Yes: 1**, with the same diagnostics payload and
  `c1_production=blocked_round_count_6_of_10`. The same is true at the delivered `36240c7` and at current HEAD `e38d259`,
  because the receipt and the USER checker are byte-identical across all of them. The r15 defect is **attribution/identity,
  not a count divergence**.
- **What a manifest should have pinned:** per-claim counter digest (C1 had none; C2 did), the measured *and* delivered
  revision, the per-claim counted inputs, and the argv/countField — so a whole-blob drift is surfaced as
  `counter_changed_since_measurement` and then **adjudicated by `--reproduce`**, not assumed.

## 1. Evidence chain — bytes and revisions

Linear ancestry, verified with `git rev-list --parents -1` for each:

| revision | time (-0300) | `measure.mjs` blob | `measure.mjs` sha256 | role |
|---|---|---|---|---|
| `7054a5e` | 04:37 | — (pre-round-15 spelling) | — | C1 **before** revision; USER receipt absent (`git cat-file -e` → `fatal: path … exists on disk, but not in '7054a5e'`) |
| `27dfd98` | 05:48:36 | `f85f39c7a0f3c4c2e7c35d78ebaffbdf9f572a63` | `3ee59de095750e08fc719ed19eb5baea02caf443df05479d24897783240fe384` | C1 `counterCodeRevision` in `measurements.json`; recorded as revision only |
| `b7cf044` | 05:51:01 | `f85f39c7…` (**same blob**) | `3ee59de0…` (**same bytes**) | C1 **measured** revision; adds `count-after-c1.json`, `user-diagnostics.json` |
| `9fd8bca` | 05:59:13 | `912f5176e994845b81c6b453b3fa4b7609641a70` | `dd9c8675ab9bbc91c20f501a90f898197d046d2586f12d2389a564385281251d` | C2 consumer repair; **first commit that carries `count-after-c1.json`** |
| `36240c7` | 06:00:34 | `912f5176…` | `dd9c8675…` | **delivered** HEAD of round 15; adds `measurements.json` |
| `e38d259` | 10:28:30 | `912f5176…` | `dd9c8675…` | current HEAD; adds only the verifier spot-check lesson |

Exact digests re-derived this session:
`git show <rev>:.ufo/waves/round-15/measure.mjs | sha256sum` → `3ee59de0…` at `27dfd98`/`b7cf044`, `dd9c8675…` at
`9fd8bca`/`36240c7`/`HEAD`; `git rev-parse <rev>:…` → blob ids as tabled. Worktree copy equals HEAD
(`git status --porcelain -- .ufo/waves/round-15/measure.mjs` empty, `sha256sum` `dd9c8675…`).

What `measurements.json` recorded (`corpus/evidence/round-15/measurements.json`, committed at `36240c7`):

- top level: `measuredRevision b7cf044…`, `executedCodeRevision 27dfd98…`, `baseline 7054a5e…`;
- `claims.C1.counterCodeRevision 27dfd98…`, **no `counterSha256`**, after argv
  `node .ufo/waves/round-15/measure.mjs b7cf044… --claim C1`, `count [0,1]`;
- `claims.C2.counterCodeRevision 9fd8bca…`, `counterSha256 dd9c8675…`, `initialFailedCounter count-after-c2.json`.

The asymmetry is the defect: the author bound C2's counter to bytes because C2 had to be re-run; C1's counter was left as a
commit id that (correctly, but unusably at HEAD) denotes the pre-repair bytes.

## 2. Why the counter moved after measurement

`git diff --stat b7cf044 9fd8bca -- .ufo/waves/round-15/measure.mjs` → `1 file changed, 26 insertions(+), 9 deletions(-)`.
Five hunks (`git diff -U0 … | grep '^@@'`):

1. `@@ -67 +67,3 @@` — comment about `SELFTEST\b` matching the `ARIA_METADATA_SELFTEST` prefix;
2. `@@ -127 +129,3 @@` — comment on pass-predicates in refusal payloads;
3. `@@ -334 +338 @@ function caseLineList(text)` — **the only hunk on a function C1 calls**:
   `\bSELFTEST\b` → `SELFTEST\b` (`.ufo/waves/round-15/measure.mjs:334` at `27dfd98`, `:338` at HEAD);
4. `@@ -548,0 +553,9 @@ function acceptedValue(value)` and `@@ -554,0 +568 @@ / -560 +574 @@ function findingIdsOfValue(value)` —
   new `isFailedFinding()` filter; reachable only through `allFindingIds` at `:578`, which is called only from the C2 arms
   (`:1119`, `:1172`); static check: no call in `countC1` (`awk 'NR>=725 && NR<=950' … | grep -n 'allFindingIds'` → no match);
5. `@@ -1001,5 +1015,8 @@ export function countC2(...)` — new ARIA summary-line/token parsing.

Sequence reconstructed from `git log` and the commit graph:

- 05:48:36 `27dfd98` commits the counter state C1's after-run would use.
- 05:51:01 `b7cf044` commits the evidence wave, including `count-after-c1.json` (C1=1, exit 0) and the receipt.
- 05:56:xx the worktree `measure.mjs` mtime is rewritten (`ls -la .ufo/waves/round-15/measure.mjs` → `05:56`).
- 05:59:13 `9fd8bca` commits that rewrite (blob `912f5176…`/`dd9c8675…`) and, in the same commit, the already-produced
  `count-after-c1.json` (`git show --stat 9fd8bca` lists it as `A`). The commit message is
  `round-15: parse actual ARIA evidence without changing outcomes`; the LOG entry (`LOG.md:928-953`) states the repair was
  triggered by the **C2** failure: *"The C2 consumer actually failed exit1/count0 … The scoped consumer-only repair … Only
  the affected C2 revision counter is re-executed"*, and *"C1 retains its actual 0→1 at b7cf044; C1 parser behavior was not
  changed by the C2 repair."* (`LOG.md:953`).
- 06:00:34 `36240c7` adds `measurements.json` **after** the counter had already changed, so the manifest was authored around
  a two-version counter without recording either version's digest for C1.

`[INFERENCE]` The 05:51 after-run itself used the `3ee59de0…` bytes (mtime 05:56 postdates it and no commit touched the file
between `27dfd98` and `b7cf044`). This inference is not load-bearing: §3 shows the newer bytes produce the identical result
on the same receipt, so the recorded number is valid under either version. What cannot be inferred from the artifacts is
*which* bytes actually ran — the counter never records its own identity (§5).

## 3. Does HEAD's `countC1(b7cf044)` reproduce 1? — code reasoning

`countC1` (`measure.mjs:725-941`) has exactly one tree read: `read.file(C1_RECEIPT)` at `:744`, i.e. receipt bytes **at the
measured revision**; the checker source is read via `reader(pin.codeRevision).file(C1_CHECKER)` at `:764`. It never reads
itself, never reads HEAD, and `c1Output` (`:1373-1386`) emits no counter path/digest — only `c1_receipt_path`/`c1_checker_path`.

Input bytes at `b7cf044`, `36240c7`, `HEAD` (all identical):

- receipt `corpus/evidence/round-15/user-diagnostics.json` sha256 `b79686adbabbac2f79861143ac7cf1ffc5c1ed2f4ad9b02d7b6e3f0782201158`
  (three-way `git show … | sha256sum`); committed first at `b7cf044` and never modified.
- checker `scripts/check-user-round-contract.mjs` blob `ce89e692d601ad39e88d7f037ede34a31ad87f25` at
  `27dfd98`/`b7cf044`/`9fd8bca`/`36240c7`/`HEAD`; sha256 `f9be3a726c3d58d1cff07ffe260fb71a37f4bc156b5f8df8bf6be98b15518e7b`
  = receipt `codeSha256`.
- `git diff --name-only b7cf044 36240c7 -- corpus/evidence/round-15/user-diagnostics.json scripts/check-user-round-contract.mjs .ufo/waves/round-15/measure.mjs`
  → `.ufo/waves/round-15/measure.mjs` only.

Predicate-by-predicate evaluation at `b7cf044` under HEAD code (each item re-derived from the committed receipt with
`grep`/`node` text analysis, not by running the counter):

| # | check (anchor at HEAD) | recorded / observed value | outcome |
|---|---|---|---|
| 1 | `raw = read.file(C1_RECEIPT)` `:744` | present (added `b7cf044`), unchanged since | `present=true` |
| 2 | receipt label `:757-760` | `schema=tabi-round15-user-diagnostics-v1` → matches `/user/i` and `/diagnostic|reason/i` | pass |
| 3 | `validateCommitPin` `:669-691`, called `:763` | `codeSha256` 64-hex; `revision 27dfd98…` resolvable and ancestor of `b7cf044` (`b7cf044` parent = `27dfd98`); checker digest at `27dfd98` **and** at `b7cf044` = `f9be3a72…` | no `checker_source` / `receipt_revision` / `checker_stale` |
| 4 | shell audits `:766-776` over checker source at `27dfd98` | source bytes unchanged since `27dfd98`; `runCount` body passes `analyzeRunCount` (`:632-642`) | no `run_count_*`, `shell_execution` |
| 5 | selfTest shape/exit `:780-791` | `exit 0`, `stdout` 12 247 bytes, `stderr ""` | pass |
| 6 | summary `:786`, `MIN_SELFTEST_CASES=6` `:179` | line 43: `USER_ROUND_CONTRACT_SELFTEST verdict=clean cases=42 fixtures=32 alias=1 committedCounts=6 countWitness=1 diagnosticWitness=1 reasonControls=1` → cases 42 ≥ 6 and ≥ emitted 42 | pass |
| 7 | case-line parse `:783-795` | 42 case lines, 42 parsed, 42 `result=PASS`, 0 `FAIL`; `caseLines.length === cases.length` | no `malformed_case_line`, `self_test_red` |
| 8 | per-case vocab `:804-840` | distinct `expected_finding` ∈ {clean, consequential_action, history_rewritten, missing_gate, score_mismatch, short_swarm, usage} — all in `USER_FINDINGS` (`:195-216`); 0 PASS with `expected_exit≠actual_exit`; all `expected_reason` ids ∈ `COUNT_REASONS` (`:183-189`) and equal the emitted `reason` | pass |
| 9 | coverage floors `:843-848` | `reasonAssertions=8` (6 distinct: after/before_count_mismatch, counting_command_failed, counting_revision_mismatch, score_not_improved, unsupported_counting_command×3); `applicable=3`, `notApplicable=39`; `markerApplicability=3`; `isolatedCli=8` (all 8 reason lines `isolation=cli`); `negativeReason=8` (all `expected_exit≠0`) | pass |
| 10 | marker tuple `:849-880` | `applicable` rows: `marker_applicable=1`,`no_marker=1`; `not_applicable` rows: `marker_applicable=0`,`marker_outcome=not-applicable`,`no_marker=na` | pass |
| 11 | production `:913-937` | `exit 1`; `outputOf` (`:297-300`) joins stdout+stderr, so the verdict on **stderr** counts: `USER_ROUND_CONTRACT verdict=failed finding=round_count detail=Found 6 user rounds, expected 10`; `USER_EXPECTED` (`:178`) = exit 1 / `round_count` / 6/10; no `verdict=clean` | `production=blocked_round_count_6_of_10` |
| 12 | `result.count = errors.length === 0 ? 1 : 0` `:939` | no error added by 1–11 | **1** |

The single reachable code delta (hunk 3) is inert **on this receipt**: applying both filters to the receipt's stdout yields
42 vs 42 lines and an empty difference set. The newly matching raw line is the summary
`USER_ROUND_CONTRACT_SELFTEST … cases=42 …`; it fails `caseLineList`'s second conjunct `/(?:^|\s)(?:name|case)=/` because
`cases=` is not `case=` (`measure.mjs:335-341`). Hence `caseLines.length` stays 42, equal to `selftestCases` output, and the
`malformed_case_line` branch (`:785-787`) is not entered.

Therefore the HEAD counter emits for `b7cf044` the same payload as the recorded after-run — `c1_truthful_diagnostics 1`,
`c1_receipt 1`, identical `c1_diagnostics`, `c1_production blocked_round_count_6_of_10`, exit 0. The same holds at
`36240c7` and at `e38d259`: revision only feeds `reader(...)` and the ancestor check, both of which see identical bytes.

**Caveat (why "outcomes unchanged" is input-specific):** the regex broadening is a real grammar change. A USER selftest
line that embeds `SELFTEST` with `name=`/`case=` and `result=` (e.g. inside a failure detail) would newly enter
`caseLineList`; if it fails the integer parse in `selftestCases`, `caseLines.length !== cases.length` turns into
`malformed_case_line` → `count 0`. Neutrality is proven for the shipped 42-line receipt, not for the USER grammar in general.
This is the exact sense in which the spot-check's "runs a different counter" (`corpus/lessons/round-15-verifier-spotcheck.md:120`)
is right at the identity level and wrong if read as a count-level claim.

## 4. Divergences found

1. **Spot-check vs outcome.** `round-15-verifier-spotcheck.md:120` says re-running the cited C1 argv at HEAD "runs a
   different counter" — true; it does not say the count differs, and it does not. The routed requirement ("Record the
   counter digest per claim, and say which counter revision reproduces each receipt") is exactly the missing field.
2. **LOG precision.** `LOG.md:953` "C1 parser behavior was not changed by the C2 repair" is true for the shipped receipt,
   not for the parser grammar (§3 caveat). `e38d259` did not revise it.
3. **Scorecard omission.** `SCORECARD.md:680` binds C1 to `probe code27dfd98` with no digest, while the adjacent C2 row
   (`SCORECARD.md:681`) carries `probe code 9fd8bca…`; `SCORECARD.md:685-686` ("gate code executed at 27dfd98; the gates are
   byte-identical at measured b7cf044") is true for the *checkers*, but the sentence is about gates, not the counter, and
   leaves the counter's HEAD-side identity unaddressed.
4. **Self-identity gap.** `countC1` reads only the receipt (`:744`); `c1Output` (`:1373-1386`) publishes receipt/checker paths
   but no counter path or digest. So *no* re-run of the counter can attribute its number to the bytes that produced it — the
   binding must be external. This is the structural reason the defect was only catchable by a non-author spot-check.

## 5. What a binding manifest should have pinned (round-15 C1)

Minimal binding that would have caught both routed defects at the time:

```json
{ "schema": "tabi-measurement-binding-v1", "round": 15,
  "baseline": "7054a5e1068538349b4dbb0d291c2fe8643802f2",
  "claims": [ { "id": "C1", "axis": "operability",
    "counter": {
      "path": ".ufo/waves/round-15/measure.mjs",
      "sha256": "3ee59de095750e08fc719ed19eb5baea02caf443df05479d24897783240fe384",
      "argv": ["node", ".ufo/waves/round-15/measure.mjs", "{REV}", "--claim", "C1"],
      "countField": "c1_truthful_diagnostics" },
    "countedInputs": ["corpus/evidence/round-15/user-diagnostics.json",
                      "scripts/check-user-round-contract.mjs"],
    "measuredRevision": "b7cf0446a31014a81b4882857c90c565ebc14210",
    "deliveredRevision": "36240c70ee114347a79abb91cacab6c63044ce36",
    "before": { "revision": "7054a5e1068538349b4dbb0d291c2fe8643802f2", "count": 0 },
    "after":  { "revision": "b7cf0446a31014a81b4882857c90c565ebc14210", "count": 1 } } ] }
```

Consequence of each pinned field, against the round-16 gate vocabulary:

- `counter.sha256` — `--check --at b7cf044` clean; `--check --at 36240c7` (delivered) →
  **`counter_changed_since_measurement`** with detail `3ee59de0…@b7cf044` vs `dd9c8675…@36240c7`. Without the digest there is
  nothing to compare, which is precisely why r15 could ship a two-version counter.
- `countedInputs` — the diff over `measuredRevision..deliveredRevision` restricted to inputs + counter path is only
  `.ufo/waves/round-15/measure.mjs`; the receipt and checker do not appear → **no `counted_input_changed`**, i.e. the drift is
  confined to the counter. (Verified above: receipt `b79686ad…`, checker `f9be3a72…` unchanged.)
- `argv` + `countField` + `--reproduce` — re-running `{REV}→36240c7` re-parses the same receipt and returns
  `c1_truthful_diagnostics=1`, equal to `after.count` → **`count_not_reproduced` does not fire**. This is what upgrades the
  digest mismatch from "unexplained change" to "semantically neutral for this claim, demonstrated".
- `measuredRevision` vs `deliveredRevision` + ancestry — measured is an ancestor of delivered (`b7cf044` → `9fd8bca` →
  `36240c7`); a manifest that recorded only `b7cf044` and was checked at HEAD could not express that the *delivered* tree was
  two commits later (defect 2 at `round-15-verifier-spotcheck.md:121`).
- `before`/`after` counts at their *own* revisions — reproduces the 0 (baseline receipt absent; `git cat-file -e` fatal) and
  the 1 independently of the shared `measuredRevision` field.

Why not a function-body pin instead of the whole blob: `countC1`'s reachable closure includes `caseLineList`,
`selftestCases`, `validateCommitPin`, `analyzeRunCount`/`functionBody`/`codeOnly`, and the constants
`C1_RECEIPT`/`C1_CHECKER`/`USER_EXPECTED`/`MIN_SELFTEST_CASES`/`COUNT_REASONS`/`USER_FINDINGS`/`SHELL_*`. Any such closure is
author-declared and can omit a dependency (the r15 repair touched `caseLineList`, a helper shared with C2); a whole-blob
digest cannot be under-declared, and `--reproduce` supplies the semantic adjudication the digest cannot. Note the cost: with
a shared counter file, every C2-only repair will (correctly) raise `counter_changed_since_measurement` for C1 — the
round-16 contract's answer is to re-run and compare, not to narrow the pin.

Invariant that r15 violated: *a recorded count is attributable to (counter bytes, input bytes, measured revision), and the
delivered revision lies inside the checked range.* r15 satisfied the first half only by commit id (C1) and never checked the
second at all.

## 6. Confidence

- Reproduction = 1 under HEAD code at `b7cf044`, `36240c7`, `e38d259`: **high** — every predicate is evaluated against
  byte-identical inputs (three-way sha256) and the only reachable delta was statically replayed over the exact receipt text.
- "The 05:51 run used `3ee59de0…`": **medium-high, `[INFERENCE]`** from mtime/commit graph; irrelevant to the result.
- "C1 parser behavior unchanged in general": **refuted**; only input-specific neutrality holds (§3 caveat).
- Not verified by this seat: any actual counter execution, any gate/selftest run, browser, census or counter. All findings
  are from `git` object reads plus text analysis of committed artifacts.

## Commands run (observed outputs summarized above)

```
git -C …/tabi-shokunin log --format='%h %ad %s' --date=iso -- .ufo/waves/round-15/measure.mjs scripts/measure.mjs scripts/check-measurement-binding.mjs
  → 9fd8bca / 27dfd98 / 72dcf03
git merge-base --is-ancestor b7cf044 HEAD; b7cf044 36240c7; 36240c7 HEAD   → 0 / 0 / 0
for r in 72dcf03 27dfd98 9fd8bca b7cf044 36240c7 HEAD; do git show "$r:.ufo/waves/round-15/measure.mjs" | sha256sum; done
  → 62e98fa8… / 3ee59de0… / dd9c8675… / 3ee59de0… / dd9c8675… / dd9c8675…
git rev-parse <rev>:.ufo/waves/round-15/measure.mjs  → f85f39c7… (27dfd98,b7cf044); 912f5176… (9fd8bca,36240c7,HEAD)
git diff --stat b7cf044 9fd8bca -- .ufo/waves/round-15/measure.mjs  → 1 file changed, 26 insertions(+), 9 deletions(-)
git diff -U0 b7cf044 9fd8bca -- .ufo/waves/round-15/measure.mjs | grep '^@@'  → five hunks listed in §2
git diff --name-only b7cf044 36240c7 -- <C1 receipt> <USER checker> .ufo/waves/round-15/measure.mjs  → measure.mjs only
git show {b7cf044,36240c7,HEAD}:corpus/evidence/round-15/user-diagnostics.json | sha256sum  → b79686ad… ×3
git show {27dfd98,b7cf044,36240c7,HEAD}:scripts/check-user-round-contract.mjs | sha256sum  → f9be3a72… ×4
git rev-parse <rev>:scripts/check-user-round-contract.mjs  → ce89e692… at every revision
git cat-file -e 7054a5e:corpus/evidence/round-15/user-diagnostics.json  → fatal: … not in '7054a5e' (receipt absent)
node -e '…parse receipt /tmp/c1-selftest-stdout.txt…'  → 42 case lines under both filters, difference set empty;
  42 PASS / 0 FAIL; 8 reason assertions over 6 distinct reasons, all isolation=cli and expected_exit≠0;
  applicability 3 applicable / 39 not_applicable; marker_applicable 3 / 0
grep -n "USER_ROUND_CONTRACT_SELFTEST" /tmp/c1-selftest-stdout.txt  → line 43: verdict=clean cases=42 …
node -e '…read measurements.json…'  → C1 counterCodeRevision 27dfd98, no counterSha256; C2 counterSha256 dd9c8675…
```
