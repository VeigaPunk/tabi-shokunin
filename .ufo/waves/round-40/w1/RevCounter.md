# RevCounter — round-40 w1 findings summary

Full report: `.ufo/waves/round-40/w1/RevCounter/report.md` (evidence: `replay-stdout.json`, `replay-stderr.txt`, `fresh-nonce.txt`).

1. **Frozen counter re-run on round-39 receipt**: frozen bytes of `.ufo/waves/round-40/counters/c1-sample-span-v3.mjs` (sha256 `0b452eac…2ef253c`) against `corpus/evidence/round-39/playwright-egress/receipt.json` (sha256 `e894f1d5…ff8f493`) with fresh nonce `c3fe6250…e7fa26` → **exit 1**, `predicate:false`, `nonceMatched:false`, findings exactly `["schema","run-nonce-mismatch","run1-sample-span","run2-sample-span"]`. Reproduced exit 1 with a second fresh nonce.
2. **Independent span recompute** (jq on raw timestamp arrays): run1 9 samples, 1793120278610−1793120277811 = **799 ms**; run2 8 samples, 1793120280715−1793120280014 = **701 ms**; both strictly increasing. Matches the logged 799/701 ms in `corpus/knowledge/playwright-firefox-session-bound-tcp-round-39.md` and the claims `before` clause. No mismatch.
3. **Bytewise checks**: all four `frozenDigests` entries match both the worktree and the `07e99cf1e2f67c5679aa5ba1ccb19a8f59b228e4` blobs; `claims.json` and both control receipts are byte-identical to the freeze commit; C1 predicate sentence identical (sha256 `75ce0b72…48fe7448`) across claims.json, the counter's PREDICATE constant, and the control receipt; my replay output is byte-identical (normalized) to the committed control `c1-round39-replay-v3.json`.
4. **Mismatches: none.**

```
VERDICT ok — round-39 receipt refused by frozen counter exactly as frozen; spans and logs agree; freeze integrity intact
```
