# MutSpanCases — mutation probe of the frozen C1 counter v3 with isolated receipt copies

Seat: MutSpanCases, tabi round-40 w1 (attempt 2). Subject under test: `.ufo/waves/round-40/counters/c1-sample-span-v3.mjs`, sha256 `0b452eac242803532d81cc2c01025b08ce3b704c74129f8912e7ad2002ef253c` (identical to `claims.json: frozenDigests`). The counter was run directly as the detector, from its committed path, with receipt copies under an explicit scratch root. No counter/wrapper/driver byte was modified; no browser was launched (this seat mutates receipts, not the live invocation — C1's counting command is out of scope here).

## Setup
- Scratch root: `/fast/scratch/hyaku/tabi-r40/MutSpanCases/` (created explicitly, removed at exit).
- Invocation nonce (fresh 64-hex, one for all cases so nonce is never the variable): `08559f185ee5cb1dce9f1523ae055814381999fa7304c146719428d670b99c12`.
- Baseline positive built from a copy of `corpus/evidence/round-39/playwright-egress/receipt.json` following the frozen selftest convention in `scripts/selftest-measure-c1-round40.mjs`: `schema='tabi-pw-firefox-egress-receipt-r40'`, `refused=false`, `runNonce=<N>` at top and on both runs, samples respaced `t=start+i*150` (run1: 9 samples, span 1200 ms; run2: 8 samples, span 1050 ms), `ss`/`proc` surfaces `ticks=1, nonLoopback=0, unavailable=false`, same for `finalSweep`, `survivors=0`, `survivorPids=[]`, `portClosed=true`. The pristine round-39 receipt has no `runNonce` field at all (v2 driver emitted none) and spans 799 ms / 701 ms.
- Every mutant = baseline + exactly one change; the round-39 case is a byte copy (`e894f1d5950eeff25dbf98fb3f951ab2eea8484f2049b88b25252bf45ff8f493`).

## Cases and observed results
Command shape (one per case, cwd `/home/vgpnk/Projects/shokunin/tabi-shokunin`, full commands preserved in `evidence/runs/<case>.cmd`):

```
node .ufo/waves/round-40/counters/c1-sample-span-v3.mjs <case.json> --nonce 08559f185ee5cb1dce9f1523ae055814381999fa7304c146719428d670b99c12
```

| # | case | single mutation point | expected | observed exit | observed findings | verdict |
|---|------|----------------------|----------|---------------|-------------------|---------|
| 1 | baseline-positive | none (detector control) | exit 0 | **0** | `[]` (`predicate:true`) | pass |
| 2 | span-999ms | run1 samples respaced to first-to-last span **exactly 999 ms** | exit 1 + `run1-sample-span` | **1** | `["run1-sample-span"]` | killed |
| 3 | span-1000ms | run1 span **exactly 1000 ms** | exit 0 (predicate is ≥1000 ms, inclusive) | **0** | `[]` (`predicate:true`) | boundary correct |
| 4 | dup-timestamp | `runs[0].samples[4].t := runs[0].samples[3].t` | exit 1 + `run1-sample-order` | **1** | `["run1-sample-order"]` | killed |
| 5 | missing-timestamp | delete `runs[0].samples[4].t` key | exit 1 + `run1-sample-order` | **1** | `["run1-sample-order"]` | killed |
| 6 | missing-ss | delete `runs[0].samples[1].ss` key | exit 1 + `run1-sample2-ss-unavailable` | **1** | `["run1-sample2-ss-unavailable"]` | killed |
| 7 | round39-pristine | none (committed bytes, fresh nonce) | exit 1, refused | **1** | `["schema","run-nonce-mismatch","run1-sample-span","run2-sample-span"]` | refused |

Representative observed stdout (case 2): `{"schema":"tabi-r40-c1-measured-v3", … ,"receiptSha256":"770917aa7ede388495b8c3966918be2ca2115716ea09e4cee3464c034b5654a6","nonceMatched":true,"predicate":false,"findings":["run1-sample-span"]}`, exit 1 — exactly one finding, proving single-point isolation (run2 untouched: 8 samples, span 1050 ms, no findings). The observed `receiptSha256` equals the case file's recorded `inputShaBefore`/`inputShaAfter`, tying the scored bytes to the preserved mutant. Full stdout per case: `evidence/runs/<case>.stdout`.

## Integrity evidence
- Per-case input sha256 before == after every counter run (the counter never writes its input): `summary.json.allInputFilesUnmodified=true`, per-case `inputShaBefore`/`inputShaAfter` recorded.
- Committed inputs re-hashed after the whole session, unchanged and equal to `claims.json` frozenDigests: counter `0b452eac…`, wrapper `a0e564c7…`, driver `1f8a15f0…`, selftest `5a0b702d…`; round-39 receipt `e894f1d5…`.
- `git status --porcelain -- scripts corpus` → empty (no tracked file touched anywhere).

## Harness correction (recorded for honesty)
The first suite run was invalid for cases 2–3 only: the builder's `rebase()` mutated the shared baseline dict instead of the per-case deepcopy, so `span-999ms.json` saved unmutated (its input sha256 was byte-identical to `baseline-positive.json` — `12258cb3…` — which exposed it) and `span-1000ms.json` carried a 999 ms span. Fixed to `rebase(rcpt, …)`, wiped `cases/`+`runs/`, re-copied the pristine receipt, re-ran the whole suite clean. All numbers above come from the clean run; the invalid pass is discarded.

## Coverage reading
- 999/1000 bracket the span predicate exactly: refused below 1000, accepted at 1000 — no off-by-one survivor. Exactly-1000 ms acceptance is contract-correct (predicate ">=1000ms"), not a surviving mutant.
- Duplicate and missing timestamps both land on `runN-sample-order` (`t<=prev` and `!Number.isFinite(t)` respectively); the span check is not the detector for either, and in both files the span is still ≥1000 so no co-finding fires.
- Surface absence by missing key is refused identically to the frozen selftest's explicit `unavailable:true` mutants — `usable()` demands finite `ticks>0`, so an absent `ss`/`proc` key cannot score.
- Zero surviving mutants across the assigned span/timestamp/surface space; the stale-receipt refusal (case 7) reproduces the recorded control `round39-replay-v3` (same four findings), corroborated here on an isolated byte copy.

## Limitations
- Detector exercised directly at receipt level; the `measure-c1-round40.mjs` wrapper and live Firefox driver were not invoked (seat scope: isolated receipt copies; also avoids any external interaction).
- Mutants ride on the real round-39 observation payload with synthetic-but-plausible epoch-ms timestamps; only run1 is mutated per case, so run2 always stays valid.
- Not mutated here: survivors, `portClosed`, `firstShotSha256` identity across runs, owned tree, nonzero `nonLoopback`, r40-schema acceptance of the nonce-bound flow (covered by the frozen selftest or outside this seat's case list).
- No tools installed (`~/.omp/agent/RULES.md` read; node v24.21.0 / python3 already present; nothing needed). No edits to shokuknow, corpus, or any sibling lane; scratch removed before yield.

## Evidence (paths relative to `tabi-shokunin/`)
- Summary with hashes + judgments: `.ufo/waves/round-40/w1/MutSpanCases/evidence/summary.json`
- Case receipts: `.ufo/waves/round-40/w1/MutSpanCases/evidence/cases/*.json` (7 files)
- Per-case command/exit/stdout/stderr: `.ufo/waves/round-40/w1/MutSpanCases/evidence/runs/*`
- Mutation builder: `.ufo/waves/round-40/w1/MutSpanCases/evidence/mutate_cases.py`

VERDICT ok — span-999ms/dup-timestamp/missing-timestamp/missing-ss all killed with exactly the expected single finding; span-1000ms correctly accepted (≥1000 ms inclusive); pristine round-39 receipt refused (schema + nonce + both spans); zero surviving mutants; zero committed-input mutations.
