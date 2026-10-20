# AttackUserProduction — C1 USER production red and diagnostic witness (round-15 w2)

## Attacked bytes

- Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`
- Revision: `72dcf031b9da24796b718517ea575f21e4f7caae`, baseline `7054a5e1068538349b4dbb0d291c2fe8643802f2`
- Snapshot: `.ufo/waves/round-15/build-snapshot.json`
- `scripts/check-user-round-contract.mjs` sha256 `abf174c31db616c78bf52cb6f520bcdb7c42ebd4f2a84e867455e66519b60a3d`
- Verification: `git show HEAD:scripts/check-user-round-contract.mjs | sha256sum` returns the same digest, so the attacked bytes are exactly the committed HEAD and snapshot bytes.

Read-only: no gate, selftest, counter, browser, or suite was executed; no source edits; no tools installed. Node was used only to split/count source strings.

**Observed drift during this pass.** At 05:36:43 the worktree USER script became uncommitted-modified (now sha256 `f9be3a726c3d58d1cff07ffe260fb71a37f4bc156b5f8df8bf6be98b15518e7b`); `.ufo/waves/round-15/measure.mjs` likewise moved from snapshot `62e98fa8…` to `8663dd4c…`, and the C2 files also moved. The build snapshot now describes HEAD, not the worktree. Findings below are against the snapshot/HEAD bytes `abf174c3`. The uncommitted worktree contains an apparent guard fix (string measurement shows `split` parts 2), but those bytes are not the snapshot, are uncommitted, and were not executed or certified here. Any C1 receipt must name the bytes actually committed.

## F1 — blocker: the shipped diagnostic witness can never pass because its guard counts its own declaration

Evidence in HEAD bytes:

- `scripts/check-user-round-contract.mjs:429` — real guard: `const masked = spec.kind === 'grep' && result.status === 1;`
- `scripts/check-user-round-contract.mjs:859` — `const MASK_GUARD = "const masked = spec.kind === 'grep' && result.status === 1;";` — the search value contains the searched literal verbatim.
- `scripts/check-user-round-contract.mjs:953-956` — `split(MASK_GUARD)` over the whole source, then `if (guardParts.length !== 2) fail('could_not_evaluate', 'Mask guard appears …')`.
- `scripts/check-user-round-contract.mjs:940` `runDiagnosticWitness`, `:1039` `--diagnostic-witness`, `:1267` the self-test calls it, `:1287` the green summary, `:1294` CLI dispatch.

Observed string facts: the exact literal occurs twice (lines 429 and 859), so `split` returns 3 parts. Consequence [INFERENCE, deterministic]: `--diagnostic-witness` exits 2 with `USER_ROUND_CONTRACT verdict=could-not-evaluate finding=could_not_evaluate detail=Mask guard appears 2 times in the evaluator source`; `--self-test` aborts at line 1267 before printing `USER_ROUND_CONTRACT_SELFTEST verdict=clean …` (line 1287). The C1 receipt contract requires `selfTest` exit 0 plus that clean summary (snapshot `.ufo/waves/round-15/measure.mjs:35-70`, condition 3; `:678` `self_test_not_green`), so C1 cannot count 1 from the delivered bytes. The build instruction itself requires a unique replacement and treats a duplicate as could-not-evaluate (`.ufo/waves/round-15/w1/CounterDiagnostics.md:141`); the implementation makes the duplicate permanent.

Bounded correction: make the search value non-self-matching, e.g. concatenate the trailing `;` (`"const masked = spec.kind === 'grep' && result.status === 1" + ';'`) or anchor it to the two-space indentation and line boundaries. The uncommitted worktree already does the anchored form (`MASK_STATEMENT`/`MASK_GUARD` at 860-861, `split` parts 2 by string measurement); if adopted, commit it, re-pin the snapshot digest, and produce a fresh receipt — do not reuse a receipt bound to `abf174c3`.

## F2 — medium: reason absence is not asserted, so non-counting refusals may gain a reason silently

- `scripts/check-user-round-contract.mjs:781-785`: `receiptMatches` treats `expected.reason === undefined` as a wildcard.
- `scripts/check-user-round-contract.mjs:1205-1222`: `reasonField` prints `expected_reason` only when defined; cases without it never compare the observed reason.
- Docstring `:84-91` promises that findings outside the counting contract pass no reason and keep their historical line. The 32 fixture cases for `short_swarm`, `missing_gate`, `consequential_action`, `history_rewritten`, etc. do not assert that absence, and the measure probe does not check it either (snapshot `.ufo/waves/round-15/measure.mjs:740-775`).

A regression that attached, for example, `reason=score_not_improved` to a `missing_gate` or `history_rewritten` refusal would still PASS every delivered case. The reason-bearing side is asserted; the no-reason side is only described. Bounded correction: compare totally, `observed.reason === (expected.reason ?? null)`. Every delivered expectation is already `null` or an explicit id, so no case changes. This gap survives the in-flight edit (still line 784).

## F3 — low: synthetic `actual_exit` in aggregate case lines

`scripts/check-user-round-contract.mjs:1265` (count witness), `:1273` (diagnostic witness), and `:1243` (reason negative control) publish `expected_exit=0 actual_exit=${boolean ? 0 : 1}`. No child process returned that value; it is a derived predicate. The measure probe's `expected_exit == actual_exit` check is therefore vacuous for those three lines, although their `result=` still derives from actual receipts, so this is not a false green. Correction: use a distinct token (`control_exit`/`aggregate_result`) or bind `actual_exit` to a real spawn. The in-flight edit adds `predicate=synthesized_exit_finding` to the diagnostic summary but leaves the count-witness line synthetic.

## Production red and retained debt (observed)

- Production still demands ten rounds: `scripts/check-user-round-contract.mjs:274` default `expect: 10`, `:301-303` production guard rejecting overrides, `:602` `round_count`, `:1297-1300` catch/failure line.
- Only committed production receipt is `corpus/evidence/round-14/executions/userProduction.json`: exit 1, stderr `USER_ROUND_CONTRACT verdict=failed finding=round_count detail=Found 6 user rounds, expected 10`, measured revision `f942c62580b1af7268645414bab102e6e7dff8d6`.
- No round-15 production receipt exists. `corpus/evidence/round-15/` holds only `metadata/expected-fixtures.json`, `metadata/mirror-contract.json`, `misroot-recovery.json`, `source-index.json`; `corpus/evidence/round-15/user-diagnostics.json` is absent, so the snapshot probe returns `count=0, present=false` via the missing-receipt branch (`.ufo/waves/round-15/measure.mjs:632-636`, receipt path `:149`).
- `SCORECARD.md` has user rows r01-r06 only and no round-15 scalar row. `corpus/lessons/round-15.md:9` keeps production “honest failed6/10”, and `:48` retains r07 survivor replay, user-record freezing, IPv6/environment/hooks/PATH and external-validator pin as uncredited. The probe pins `USER_EXPECTED = {6,10}` (`.ufo/waves/round-15/measure.mjs:167`) and credits production only as `blocked_round_count_6_of_10` (`:840-856`). No source or doc found calling production green.
- APPEND_ONLY risk check for the uncommitted round-15 doc edits: at HEAD each of `SKILL.md` (140872→146670 bytes), `corpus/QUALITY.md` (4965→5956), `corpus/README.md` (30797→32045) is a byte prefix of its worktree file; `LOG.md`, `SCORECARD.md`, `PROVINCE.md` are unchanged. Static prefix compare only (no gate run), so committing those edits keeps the production refusal on `round_count` rather than `history_rewritten`.

Conclusion: the honest 6/10 red and the survivor/user-record debt are preserved in the delivered bytes, and no full green is claimed. C1's 0→1 is unverified for lack of a receipt and, on the snapshot bytes, unverifiable green because F1 forces `--self-test` to could-not-evaluate. Temporal limit: L1 must produce the receipt from re-pinned, committed bytes.

## Commands L1 should run (not run here)

1. On snapshot/HEAD bytes: `node scripts/check-user-round-contract.mjs --diagnostic-witness` — expected from source: exit 2, `USER_ROUND_CONTRACT verdict=could-not-evaluate finding=could_not_evaluate detail=Mask guard appears 2 times in the evaluator source`. This is the falsification receipt for F1.
2. After adopting and committing a guard correction: `node scripts/check-user-round-contract.mjs --diagnostic-witness` then `node scripts/check-user-round-contract.mjs --self-test` — expected exit 0, 42 `SELFTEST` lines, summary `USER_ROUND_CONTRACT_SELFTEST verdict=clean cases=42 fixtures=32 alias=1 committedCounts=6 countWitness=1 diagnosticWitness=1 reasonControls=1`.
3. `node scripts/check-user-round-contract.mjs` — expected exit 1, `verdict=failed finding=round_count detail=Found 6 user rounds, expected 10`, and no clean line.
4. Write `corpus/evidence/round-15/user-diagnostics.json` from actual runs, commit it, then `node .ufo/waves/round-15/measure.mjs <revision> --claim C1`; expect `c1_truthful_diagnostics=0` until the receipt exists, and 1 only if every C1 condition holds.

## Confidence and limits

- F1: observed byte counts and direct call path; the runtime exit is [INFERENCE] but deterministic for `abf174c3`. Not executed, per contract.
- F2/F3: observed source semantics.
- I did not execute the fixtures; a static walk of the count-witness, diagnostic-witness, and negative-control paths found no other blocker besides F1. No non-author verification, C1 admission, or measure outcome is certified.
