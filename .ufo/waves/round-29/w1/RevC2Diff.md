# RevC2Diff — C2 counter change review (round-29 w1)

**Verdict: PASS on all four checks.** The doc binding is applied in both the SCORECARD and LOG windows, the two new crossdoc cases fail on the old matcher and pass on the new (receipts confirmed AND independently reproduced), nothing else in the counter changed, and a fresh rerun of the frozen counter on a clean shared clone at 856fa9e reports `mismatches=6` with byte-identical findings to the baseline receipt.

## 1. Diff scope — nothing else in the counter changed

Command (exit 0):
```
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin diff 856fa9e1202179f5cfbd28c1f0efdd4eb1f426bb 97be89bc66139eb45526a04af59a35dccc006eb9 -- scripts/check-selfassessment.mjs
```
`1 file changed, 29 insertions(+), 6 deletions(-)`. Exactly four hunks, nothing else:

1. `m1Findings` (SCORECARD window, line 239): `citesLine(g.lineText || "", f.line)` → `citesLine(g.lineText || "", "SCORECARD.md", f.line)`.
2. `citesLine` (lines 267–276): signature `(text, line)` → `(text, doc, line)`; regex capture group 1 becomes the document name (`(LOG|SCORECARD)` instead of non-capturing); new guard `` if (`${match[1]}.md` !== doc) return false; ``; group indices reindexed correctly (`first = Number(match[2])`, `last = Number(match[3] || match[2])`); range containment `first <= line && line <= last` unchanged. Comment cites QUALITY 70 / round-28 verifier routed defect 3.
3. `m1LogFindings` (LOG window, line 332): `citesLine(text, f.line)` → `citesLine(text, "LOG.md", f.line)`.
4. Two new CASES appended: `m1-scorecard-crossdoc-citation-not-superseded` (exit 1, class `m1-selftest-tally`; stale scorecard tally cited as `LOG.md:5`) and `m1-log-crossdoc-citation-not-superseded` (exit 1, class `m1-selftest-tally`; stale log tally corrected with `supersedes SCORECARD.md:6`).

Call-site census on the frozen bytes: `citesLine` occurs only at the definition (line 269) and the two call sites (239, 332) — no third caller left on the old two-arg signature. Same-document clearing behavior is untouched (the unrelated-citation cases still behave identically in both receipts below).

## 2. New cases fail on old matcher, pass on new

Committed receipts (read verbatim):
- `.ufo/waves/round-29/baseline/c2-red-before-selftest.txt`: `SELFASSESSMENT_SELFTEST verdict=failed cases=22 passed=20`; the only two FAIL lines are `m1-scorecard-crossdoc-citation-not-superseded` and `m1-log-crossdoc-citation-not-superseded` (both `expected_exit=1 exit=0` — the old matcher let the cross-document citation clear the stale tally).
- `.ufo/waves/round-29/baseline/c2-after-fix-selftest.txt`: `SELFASSESSMENT_SELFTEST verdict=clean cases=22 passed=22`, `exit=0`; both crossdoc cases PASS with `exit=1`.

Independent reproduction (not just receipt reading):
- Extracted old matcher: `git show 856fa9e...:scripts/check-selfassessment.mjs` → sha256 `9bc6feb7207b6a1a3861c0c8f2804d481351c8c8a08f90b45903692932054d3f`.
- Spliced the two new cases verbatim into that old copy (scratch hybrid) → `node hybrid --selftest`: `SELFASSESSMENT_SELFTEST verdict=failed cases=22 passed=20`, runner exit 3, and the only two FAIL lines are exactly the two crossdoc cases with `exit=0` — matches the red receipt. (Exit 3 is the runner's own selftest-failure code, `process.exit(out.ok ? 0 : 3)` at line 787 of the frozen script; the red receipt records no exit code, so no contradiction.)
- Frozen counter `--selftest` rerun: `SELFASSESSMENT_SELFTEST verdict=clean cases=22 passed=22`, exit 0 — matches the after-fix receipt.

## 3. Frozen counter rerun on clean clone at 856fa9e → mismatches=6, same six findings

- Frozen bytes: `git show 97be89b...:scripts/check-selfassessment.mjs` → sha256 `728128008e2242b635bda30a28313de20b06d381d7855f11f18fa5043ba560c4` — **matches the sha256 pinned in claims.json**.
- One shared clone (the seat's single live clone): `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin $S/clean856 && git -C $S/clean856 checkout 856fa9e...` → `rev-parse HEAD` = `856fa9e1202179f5cfbd28c1f0efdd4eb1f426bb`, `status --porcelain` empty (0 lines).
- Frozen script copied outside the clone; CLI supports `--repo <dir> --rev <ref> [--json]` (documented "(tests)" mode, usage line 68).
- Run:
  ```
  node $S/frozen-selfassessment.mjs --repo $S/clean856 --rev 856fa9e1202179f5cfbd28c1f0efdd4eb1f426bb --json
  ```
  → `counter_exit=1` (failed, correct at baseline), `jq '.mismatches'` = **6**.
- Byte comparison: `cmp` vs `.ufo/waves/round-29/baseline/c2-before-frozen-counter-cleanbase.json.txt` differs only by the baseline receipt's trailing `exit=1` line (`diff` = `1213a1214 > exit=1`); the JSON payload itself is byte-identical.
- The six mismatch rows from my rerun (doc, line, script, claimed, observed) match the claims.json `before` list exactly:
  1. `SCORECARD.md:410` — `scripts/check-sources.mjs` 25 vs 26
  2. `SCORECARD.md:1138` — `scripts/round-evidence-audit.mjs` 12 vs 13
  3. `SCORECARD.md:1139` — `scripts/round-evidence-audit.mjs` 12 vs 13
  4. `SCORECARD.md:1151` — `scripts/round-evidence-audit.mjs` 12 vs 13
  5. `SCORECARD.md:1439` — `scripts/check-selfassessment.mjs` 17 vs 20
  6. `LOG.md:221` — `scripts/check-freshness.mjs` 8 vs 12

## Residual notes (non-blocking)

- My rerun used `--repo` per the item; the claims' countingCommand runs the counter in-checkout. Equivalent here: the clone worktree is exactly 856fa9e with clean status.
- The `findings` array in the JSON is the full tally census (including `claimed==observed`, `couldNotEvaluate`, and `superseded:true` rows); `mismatches` counts only non-superseded rows with `observed != null` and `claimed != observed` — consistent with the six-row before-list.
- No tooling installed (none needed: node, git, jq present). Scratch `/fast/scratch/hyaku/tabi-r29/RevC2Diff` removed after receipts were copied.

Receipts copied into this output dir: `RevC2Diff-c2-rerun.json`, `RevC2Diff-frozen-selftest.txt`, `RevC2Diff-hybrid-selftest.txt`.
