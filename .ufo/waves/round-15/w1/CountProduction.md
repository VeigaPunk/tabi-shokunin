# CountProduction — USER production round_count 6/10 vs isolated controls (round-15 w1)

Scope: read-only audit of `scripts/check-user-round-contract.mjs` (USER gate) and its committed round evidence. No gate, counter, self-test, browser, or suite was executed; no source edits. Read-only git inspection only (`log`, `ls-files`, `ls-tree`, `show`, `status`, `show --stat`). Tooling: none installed.

Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Gate reads committed HEAD only.

## 1. Observed production state (source-anchored, not re-run)

- Production constants: `scripts/check-user-round-contract.mjs:12` `HARD_BASELINE = 7f506aff…`; `:13` `PSTACK_PIN = 92d700d…`; `:254` default `expect: 10`.
- Production root forced to fixed inputs: `:279` — if `sameRoot(repo, defaultRoot)` and `(baseline !== HARD_BASELINE || expect !== 10 || pstackPin)`, fail `usage` exit 2. So production always runs `expect=10`.
- Order inside `check()`: `:577-578` `checkHistory(...)` first, then `:579` `roundIds(root)`, then `:580` `if (ids.length !== options.expect) fail('round_count', ...)`. Per-round checks (`parseLesson`, `checkSpec`, `checkSwarm`, `parseScore`, `runCount` before/after, `checkReport`, `scanConsequential`, `sameTree`) at `:581-603` and `checkPublic` at `:604` are **never reached** while round_count fails. The "6/10" verdict therefore says nothing about r01–r06 per-round validity.
- `roundIds` (`:315-320`) counts only `corpus/lessons/user-20261015-rNN.md` at HEAD.
- Committed lessons (`git ls-files corpus/lessons | grep user`): r01–r06 only → 6.
- Committed evidence: `corpus/evidence/user-20261015-r01` … `user-20261015-r07` (r07 = 37 files, commit `2676cc8`, "Admit user-20261015-r07 evidence and gate", 2026-10-17, with a `.gitignore` line). No `corpus/lessons/user-20261015-r07.md` exists in any commit (`git log --all -- corpus/lessons/user-20261015-r07.md` empty).
- LOG.md:464-475 records r07 as "executed, unadmitted, recorded without credit"; SCORECARD.md has rows only for r01–r06 (user-round comments at `SCORECARD.md:332-373`); SCORECARD.md:416 and LOG.md:503-504 record `USER_ROUND_CONTRACT verdict=failed finding=round_count` as pre-existing red at base and after.
- Conclusion: the production red is honest. It correctly refuses r07 (orphan evidence, no lesson, no score row, no credit) and the four missing rounds r07–r10 are not present. No defect in the count itself is claimed; the defects below are in the diagnostic and isolated-control surface.

## 2. Defects (ranked)

### D1 (medium, operability / C1) — round_count refusal has no applicability or reason beyond the finding string
- Anchor: `scripts/check-user-round-contract.mjs:580` emits `Found ${ids.length} user rounds, expected ${options.expect}`. The top-level catch at `:1039-1043` prints `USER_ROUND_CONTRACT verdict=failed finding=round_count detail=Found 6 user rounds, expected 10`.
- Missing: which ids are absent (`r07..r10`), which ids exist as evidence without a lesson (`r07`), and that `expect` is the production constant rather than a fixture parameter. The message does not say whether the refusal is applicable to this root (production vs isolated fixture).
- Proposed: keep `finding=round_count` and exit 1 unchanged; extend detail to `expected=10 found=6 missing=r07,r08,r09,r10 orphan_evidence=r07 scope=production|isolated`. Compute orphan evidence from `list(root,'HEAD','corpus/evidence')` filtered by `user-20261015-rNN` and absent lessons. Do not change the count rule (no expect reduction — LOG.md:599-600 forbids it).

### D2 (high, calibration / C1 isolation) — no isolated self-test asserts the round_count refusal
- Anchor: `scripts/check-user-round-contract.mjs:853-1000`. The 29 fixture cases (`:864-966`) plus alias check (`:1020-1027`) cover history, swarm, gate, consequential, SHONEN, pstack, round-script, but **zero** cases exercise `round_count` (`grep round_count` returns only `:580`). Every fixture runs with `--expect 1` (`:985`), so the count-mismatch branch and its exit/finding pair are untested in isolation.
- Proposed isolated cases (run only when a future assignment permits execution):
  - `round_count_zero_lessons` — fixture with zero lessons, `--expect 1` → exit 1, `finding=round_count`.
  - `round_count_extra_lesson` — fixture with two lessons, `--expect 1` → exit 1, `finding=round_count`.
  - `round_count_orphan_evidence_only` — fixture with `corpus/evidence/user-20261015-r02/` and no lesson, `--expect 1` → exit 1 (asserts D1 detail names the orphan once D1 lands).
  - `production_expect_refused` — alias-style `--expect 1` against a copy named as production → exit 2 `usage` (already partly covered by the alias case at `:1022`; keep it separate).

### D3 (medium, calibration) — substring finding match can pass a wrong finding
- Anchor: `:988-989` `output.includes(...'finding=${test.finding}')`. `finding=missing_gate` matches `finding=missing_gate_x`; `finding=round_count` would match any future `finding=round_count_*`.
- Proposed: match `finding=${test.finding}` followed by space or end (`new RegExp('finding=' + escape + '(\\s|$)')`), and also assert `actual_exit`. Affects every isolated control, not only round_count.

### D4 (medium, operability receipt stale) — operability receipt is a byte-identical 4-case artifact credited as current
- Anchor: `corpus/evidence/user-20261015-r01/operability/selftest-receipt.txt` and `corpus/evidence/user-20261015-r07/operability/selftest-receipt.txt`. Both sha256 `77374a717a2f4e38031461ca2a21134063ab5c8b61fffaf25d9031b474a7e65a`; both print `cases=4` (clean, short_swarm, missing_gate, consequential_action).
- Current script `:1030` prints `cases=${cases.length + 1}` over a 29-entry array (`:864-966`), i.e. 30 with alias. The receipt therefore does not describe the current gate. LOG.md:470-473 explicitly credited r01's receipt for operability 6→7 and reused it for r07 ("no new capability").
- Proposed: no retroactive rewrite (historical evidence is immutable). Future operability claim must cite a receipt produced by the current `--self-test` whose `cases=` matches `:1030`, and must carry the round_count cases from D2.

### D5 (low, diagnostic order) — first-failure short circuit hides per-round state in production
- Anchor: `:580` throws before `:581-604`. A production red at `round_count` is the only signal; per-round score, consequential, and public-observation checks for r01–r06 do not run in production. (Isolated `--expect 6` against a non-production copy would exercise them, but the production-alias guard at `:279` only restricts the real root.)
- Proposed (diagnostic only, not a rule change): when `ids.length !== expect`, still run the per-round loop over the ids that do exist and report `round_count` with a `per_round=clean|failed(<finding>)` summary, while keeping exit 1 and finding `round_count`. Otherwise record explicitly in the receipt that per-round checks were skipped by design.

### D6 (low, expect coupling) — `public_observation` requirement keyed to `expect === 10`
- Anchor: `checkPublic` `:572` `if (expect === 10 && found < 1) fail(...)` and `:543-546`. Isolated `--expect 1` skips the requirement silently; production enforces it. `:565-566` `continue` silently skips any capture whose `class` is not `public-observation`, so a mis-classed capture is not counted and not reported.
- Proposed: pass an explicit `requirePublic` flag (true for production, false for isolated) instead of inferring from `expect`; report skipped captures with their class in the detail.

## 3. Constraints checked / no-harm notes

- `LOG.md:599-600` and `SCORECARD.md:416` already forbid reducing `expect` to hide 6/10. Proposals above keep `expect=10` and exit 1.
- Historical evidence (r01–r07 receipts, aggregate, lessons, SCORECARD rows) must not be rewritten; D4 is a forward rule.
- Uncommitted worktree (`git status`): `corpus/QUALITY.md`, `corpus/SOURCES.md` modified; `corpus/evidence/round-15/` untracked; `.ufo/waves/round-15/` untracked. The USER gate reads HEAD, so these do not change the production verdict. Not modified by this audit.

## 4. Commands L1 should run after integration (not run by me)

- `node scripts/check-user-round-contract.mjs` (production; expected `finding=round_count` exit 1 with current 6/10 until D1 changes detail only).
- `node scripts/check-user-round-contract.mjs --self-test` (after D2/D3 land; expected `cases` count to change; old receipts remain historical).
- Isolated expect-count controls only after D2: `node scripts/check-user-round-contract.mjs --repo <fixture> --baseline <hash> --expect 1`.

## 5. Ids / messaging

- Messaged planner `TabiR15` with this report path and D1–D4 summary (exact roster id).
- `MetadataEnforce` and `CounterDiagnostics` are **not** in the live roster; no message sent to them (no invented ids). Counter siblings present in roster: `TabiR15.CountExitMap`, `TabiR15.CountWrongFailure`, `TabiR15.CountShellBoundary`, `TabiR15.CountHistory`, `TabiR15.CountSupported`, `TabiR15.CountFixtureShape`; metadata sibling: `TabiR15.MetadataMissing`. Not messaged in this leaf pass; L1 may route D1–D3 to `TabiR15.CountExitMap` if desired.

## 6. Residual risk / unknowns

- `[UNK]` whether the lane intends r07 to become r07 lesson in a later round; the audit only observes it is absent and uncredited.
- `[UNK]` whether `corpus/evidence/user-20261015-r07/seats/*` hash seats still MATCH; LOG.md:472-473 says yes at `40a6de87f` but I did not re-verify (checks forbidden).
- `[INFERENCE]` D2 test cases will pass with current code because the branch is simple; not executed.
