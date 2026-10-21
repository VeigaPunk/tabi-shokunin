# ExecMeasureC1-4 — C1 decision counter

**Verdict:** Revised the counter around the predeclared 27-decision inventory. It resolves REV to a canonical commit, reads only validated regular tree blobs with isolated Git settings, reproduces the pinned harness from a temporary clone at that commit, and emits `{rev, c1_validation_decisions, decisions, runtime, counterSha256}`. It credits only distinct probe IDs bound to one exact SKILL row, a successful same-family control, verified receipt/case/fixture digests, and an anchored source-body token.

## Files changed

- `.ufo/waves/round-19/measure-c1.mjs` — decision counter, pinned reproduction runner, and `--self-test [--no-reproduce]` mode. `--no-reproduce` is rejected outside self-test mode.
- `corpus/evidence/round-19/selftests/c1.json` — retained no-reproduction self-test receipt.
- This report is the only direct LANE write.

## Exact retained evidence

- Probe: `node /fast/scratch/tabi-r19/ExecMeasureC1-4/.ufo/waves/round-19/measure-c1.mjs --self-test --no-reproduce`. Observed `allPass:true`, `case_count:15`, `negative_shape_count:14`; exit 0. Receipt SHA-256 `49785750548e0bd6b9f79c8ec1216e9c5b33f5cb651199d0c8b40296f281b035`.
- The 14 negative shapes retained with expected exit/reason assertions: duplicate probe IDs reject every owner; missing SKILL row; wrong token range; source-body SHA mismatch; source opened earlier; committed/fresh receipt mismatch; producer SHA mismatch; non-Completed control; cross-family control; missing heading; case-file digest mismatch; fixture digest mismatch; non-commit REV; and replacement-object poisoning. The positive inventory credited 27/27 fixture decisions.
- Probe: `node /fast/scratch/tabi-r19/ExecMeasureC1-4/.ufo/waves/round-19/measure-c1.mjs 66251bfc1aef393e4aec599e950a8deb867736bb`. Observed stdout `{"rev":"66251bfc1aef393e4aec599e950a8deb867736bb","c1_validation_decisions":0,"decisions":[],"runtime":null,"counterSha256":null}`; exit 0.
- Counter SHA-256 `a5126e5e5423e8e370aa60c67ece3253431662717550e934b986c04f7e2b7858`; self-test receipt SHA-256 above records its producer identity. Runtime reported by the test runner: Node `v24.21.0`.
- The actual browser reproduction path was not exercised in this wave: baseline B has neither the decision inventory nor target SKILL heading, so its verified result is zero without launching Chromium. The self-test intentionally uses temporary Git repositories and the explicit `--no-reproduce` mode.

## Integration dependency / risk

The current LANE harness receipt builder records `casesFilesSha256` but does not yet serialize fixture hashes (`scripts/webmcp-validation-round19.mjs:1200-1206`); its fixture server's `served` hashes are not added to the receipt. The revised counter requires a receipt fixture digest map (`fixturesFilesSha256`, `fixtureFilesSha256`, `fixturesSha256`, or `servedFixtures`) and will reject a reproduced/committed receipt without one. I notified L1. PLAN.md:27 still names the superseded `c1_validation_rows` interface; I notified L1 that integration must update the shared reference. No harness or other unassigned production file was changed. No tools were installed. No build, lint, formatter, or broad test suite was run.

## Isolation

- Clone: `/fast/scratch/tabi-r19/ExecMeasureC1-4`
- Branch: `r19/ExecMeasureC1-4`
- Base: `66251bfc1aef393e4aec599e950a8deb867736bb`
- L1 integration-base commit after copying current LANE bytes: `cb6de4537ff2a737bb877e8b8f8a3e6eb79327e5`
- Final implementation commit: `ede2bbc42cac127d05aee79d202943524a453c0d`
- Changed paths:
  - `.ufo/waves/round-19/measure-c1.mjs`
  - `corpus/evidence/round-19/selftests/c1.json`
