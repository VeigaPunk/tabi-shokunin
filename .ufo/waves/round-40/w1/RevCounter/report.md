# RevCounter — Tabi round 40 w1 (attempt 2)

Date: 2026-10-27. Freeze commit: `07e99cf1e2f67c5679aa5ba1ccb19a8f59b228e4` (superseding pre-data freezes). Baseline: `a1b1e939048885d2793759b7f49b10c5c820d70d`. Fleet HEAD at review time: `c925d9230c3f7908152fad7bc0f0dd1cdd9af45f`.

Scope of this seat: re-run the frozen C1 receipt counter over the committed round-39 receipt and inspect its exact findings; independently recompute both sample spans from the timestamp arrays and compare with the logged 799 ms / 701 ms; bytewise check the predicate sentence, the control receipt, and the frozen digests. No claim verdict by assertion; everything below is an observed command/output.

## 1. Frozen counter / runner bytes — digest check

For each file pinned in `round-40/claims.json` → `frozenDigests`, compared three ways: worktree file sha256, `git show 07e99cf1e2f67c5679aa5ba1ccb19a8f59b228e4:<path>` blob sha256, and the digest recorded in claims.json.

| path | worktree = frozen blob = claims digest |
|---|---|
| `scripts/playwright-firefox-egress-round39.mjs` | `1f8a15f00a85c7a88214a768dbf89e4bc54a01893cd9158ecb0ac6396994545b` — all three identical |
| `scripts/measure-c1-round40.mjs` | `a0e564c7d18bf75d709a6105119a7849a6f78d3364b24f12a3d26981d4ca0735` — all three identical |
| `scripts/selftest-measure-c1-round40.mjs` | `5a0b702d90c37628ff03168112ab585c8a60e6981cc22f6fcbb6a52313995d82` — all three identical |
| `.ufo/waves/round-40/counters/c1-sample-span-v3.mjs` | `0b452eac242803532d81cc2c01025b08ce3b704c74129f8912e7ad2002ef253c` — all three identical |

Bytewise `cmp` of worktree vs freeze-commit blob, all IDENTICAL (no diff output):
`.ufo/waves/round-40/claims.json` (worktree sha256 `3e304b2c55d03f20aa6b1ad6e8f86ceec80dfa5ec9f41d58ce98f9d55ebe0246`), `.ufo/waves/round-40/controls/c1-round39-replay-v3.json`, `.ufo/waves/round-40/controls/c1-measure-selftest-v2.json`.

Worktree dirty state (`git status --porcelain` over `scripts`, `.ufo/waves/round-40`, `corpus/evidence/round-39`): only untracked `w1.ready.dispatched` and `w1/ScoutQuarantine*/` lane dirs. None of the pinned files are dirty.

## 2. Re-run of the frozen counter over the round-39 receipt

Command (observed; counter executed from a scratch copy of the freeze-commit blob, bytewise the frozen bytes):

```
N=$(openssl rand -hex 32)   # c3fe6250237b7240d9abf7aaf817939a9309a74712233de1f50f7dbf59e7fa26
node <frozen blob c1-sample-span-v3.mjs> corpus/evidence/round-39/playwright-egress/receipt.json --nonce "$N"
```

Observed: **exit=1**, stdout (evidence: `replay-stdout.json` in this folder; stderr empty):

```json
{"schema":"tabi-r40-c1-measured-v3","predicateSentence":"…frozen sentence…","receiptSha256":"e894f1d5950eeff25dbf98fb3f951ab2eea8484f2049b88b25252bf45ff8f493","nonceMatched":false,"predicate":false,"findings":["schema","run-nonce-mismatch","run1-sample-span","run2-sample-span"]}
```

- `receiptSha256` `e894f1d5…ff8f493` equals the sha256 of the committed `corpus/evidence/round-39/playwright-egress/receipt.json` (13261 bytes) — the counter scored exactly the committed receipt bytes.
- Findings are exactly what the frozen predicate implies: receipt `schema` is `tabi-pw-firefox-egress-receipt-v2` (counter requires `tabi-pw-firefox-egress-receipt-r40`); top-level and per-run `runNonce` are `null` (≠ fresh nonce → `run-nonce-mismatch`); both runs fail the ≥1000 ms span clause.
- A second run with a different fresh 64-hex nonce (`deadbeef…01`) reproduced **exit=1** — refusal is nonce-independent, i.e. genuinely fail-closed for this receipt.

## 3. Independent span recompute from timestamp arrays

Extracted with jq straight from the receipt (no counter code involved):

```
run1: n=9 first=1793120277811 last=1793120278610 span_ms=799  strictly_increasing=true runNonce=null
run2: n=8 first=1793120280014 last=1793120280715 span_ms=701  strictly_increasing=true runNonce=null
```

Comparison with the logged values in `corpus/knowledge/playwright-firefox-session-bound-tcp-round-39.md` L26–30 ("the committed timestamps span 799 ms in run1 and 701 ms in run2, while the receipt declares 1560 ms and 1461 ms"): **799 == 799, 701 == 701 — no mismatch.** Both spans are <1000 ms, matching the claims.json `before` clause and producing the two `run{i}-sample-span` findings. Sample counts (9, 8) are ≥8 and strictly increasing, so those clauses correctly do not fire.

## 4. Predicate sentence, control receipt — bytewise

- `jq -r '.claims[]|select(.id=="C1")|.predicate' .ufo/waves/round-40/claims.json`, `jq -r .predicateSentence` of my replay stdout, and of the committed control `.ufo/waves/round-40/controls/c1-round39-replay-v3.json` all hash to `75ce0b72c07f91c4e0784a61efa04e0a003273f4323614e633571f1f48fe7448` — `cmp` identical pairs: claims == counter PREDICATE == control predicateSentence.
- Full-object comparison: `jq -S` of my replay stdout vs the committed control receipt → **byte-identical** (`cmp` silent). The committed control receipt is a faithful record of the frozen counter run against the committed receipt, matching its stated result "exit 1; run-nonce-mismatch plus schema and both sample-span findings".

## 5. Mismatches

None. All four checks (frozen digests, counter re-run findings, independent span recompute, predicate/control bytewise identity) agree with the frozen claims.json and its recorded controls.

## Limitations

- This lane exercised the receipt-scoring unit (`c1-sample-span-v3.mjs`, the scorer invoked by the wrapper for the round39-replay control). The live browser path of `scripts/measure-c1-round40.mjs` (two fresh Firefox runs, nonce-bound receipt production) was not executed here; the wrapper's own selftest control is recorded in `controls/c1-measure-selftest-v2.json` and is out of this seat's item.
- Scratch `/fast/scratch/hyaku/tabi-r40/RevCounter/` was deleted after evidence was copied into this folder. No tool installs were made (none needed; PACMAN guard respected). No git/jj mutation, no writes outside this lane folder and scratch.

## Evidence in this folder

- `report.md` — this report.
- `replay-stdout.json` — full stdout of the frozen-counter re-run (fresh nonce `c3fe6250…e7fa26`), exit 1.
- `replay-stderr.txt` — empty (counter wrote nothing to stderr).
- `fresh-nonce.txt` — the invocation nonce used.

```
VERDICT ok round39-replay-refusal reproduced exit 1 with exact findings [schema,run-nonce-mismatch,run1-sample-span,run2-sample-span]; spans independently recomputed 799ms/701ms matching logs; predicate sentence, control receipt and all four frozen digests bytewise identical to freeze 07e99cf; no mismatch found
```
