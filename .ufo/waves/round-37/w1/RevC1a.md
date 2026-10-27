# RevC1a — independent C1 re-derivation (tabi round 37, w1)

seat: RevC1a · round: tabi 37 (attempt 1), wave w1 · frozen contract: `99437d29de036415a9f2d0524343617a3b19988a` (`claims.json`) · measured REV: `ed8ccfc00ad3784bc424aa118e056f8edf4ee803`

## Scope and method

Re-derived all three C1 falsifier legs from scratch, without reusing any frozen-run artifact: (1) frozen v5 honest-state run at the measured REV; (2) self-built decoy-note fixture run under v5 and v4; (3) self-built reordered-pins fixture run under v5 and v4. Instruments extracted from the freeze commit itself (`git show 99437d29:…`), sha256-recorded below; every run in a fresh scratch clone under `/fast/scratch/hyaku/tabi-r37/w1/RevC1a/` with `TMPDIR` pointed inside it; no lane or sibling repo was mutated (read-only git only; fixture commits after `rev-parse --show-toplevel == $D` assertion).

- v5 sha256 `9c6289b70d67bb6da1bf5578e66ccfa2c40ea33c307adb33c454dc7bdd91752c` — equals `claims.json:frozenDigests.c1`.
- v4 sha256 `8a223faf5e109fc05dac1373a4a4979b65f9ec2ffef40f86ae9bf40ba1aad385` (round-36 path at the freeze).
- Pins blob at REV `.ufo/waves/round-36/baseline/c1-delta-pins.json` (1109 bytes): sha256 `810193620393f6e8b76faac4b606977508198de1b9ffd00d3a7440e8f1910655`, computed by me over `git show ed8ccfc0:<path>` — equals v5's embedded `DELTA_PINS_SHA256`.
- Tooling: node v24.21.0 preinstalled; **nothing installed** (operator 2026-10-19 authorization unused).

Fixture-base note: `run-controls.sh` built its fixtures on the then-master TIP, which the J3 receipt records as `ed8ccfc0`; I did the same (detached). Master has since advanced one commit to `f76da09`, and `git diff --stat ed8ccfc0..f76da09` shows 22 files, +2864/−0, all under `.ufo/waves/round-37/` — zero bytes changed under `corpus/`, `scripts/`, or the round-34/36 pins the counters read, so the base choice is provably immaterial for every path v4/v5 read at REV.

## Results (all raw JSON in `runs.json` + `*.json` here)

| # | Run | Exit | Predicate | Key evidence | Frozen receipt | Agreement |
|---|---|---|---|---|---|---|
| 1 | v5 honest @ `ed8ccfc0` (lane) | 0 | **true** | `deltaPinsSha256 81019362…`; adjacency clean 16/16; completeness.unaccounted 0 (candidates 383); drift 307/307 audited, 0 findings, 0 stale (observed 304 unchanged / 3 moved); delta.total 0, unaccounted 0 | `c1r37-J3-honest-v5` (exit 0, true, `ed8ccfc0`) | **agree** |
| 2 | v5 @ decoy fixture `c48c46ff` | 0 | **true** | pins digest still bound; 307/307, 0 findings — canonical `verbatim at :748` clause parses the truthful note | `c1r37-J2-decoy-note-v5` (exit 0, true) | **agree** |
| 3 | v4 @ decoy fixture `c48c46ff` | 1 | **false** | `auditFindings: [{row 6, audit-moved-wrong-relocation, ":585"}]`, coverage 306/307 — v4's first-`:<digits>` regex (v4.mjs:438) grabs the decoy token | `c1r37-J2-decoy-note-v4` (exit 1, false) | **agree** |
| 4 | v5 @ reorder fixture `c5ec9fdc` | 2 | refused | `…c1-delta-pins.json at c5ec9fdc… sha256 ef7ca6acc016… != frozen 810193620393…` (B1 digest-binding refusal) | `c1r37-J1-pins-reorder-v5` (exit 2, "sha256 ef7ca…") | **agree** — my full refusal digest extends the receipt's truncated prefix byte-for-byte |
| 5 | v4 @ reorder fixture `c5ec9fdc` | 0 | **true** | 307/307, 0 findings — v4 has no pins digest check (v4.mjs:370-374 parses JSON only), so semantically-identical unfrozen pins ride through | `c1r37-J1-pins-reorder-v4` (exit 0, true) | **agree** |

5/5 comparisons agree with the frozen before-data receipts. My fixture commit ids necessarily differ from the frozen ones (`c48c46ff` vs `f8c0f42d`, `c5ec9fdc` vs `c7f0b424` — fresh commit timestamps), but content fidelity is proven: the reorder fixture's pins blob digest `ef7ca6acc01605cd9e24116ae948bea7f29ea3ebf4ef78a2149e4bace259f7c4` reproduces the frozen attack bytes exactly, and the decoy edit is the same single-row recipe (asserted exactly 1 matching row).

## Corroborated target items (claim C1)

- **B1 pins digest-binding**: v5 refuses non-frozen pins bytes at exit 2 (run 4) while admitting the frozen pins (runs 1-2); v4 admits the same unfrozen bytes (run 5). The routed round-36 defect 1 is repaired as claimed.
- **B2 canonical moved-note parsing**: v5 admits the truthful decoy-token note (run 2); v4 refuses the identical bytes (run 3) with the exact routed mechanism (`audit-moved-wrong-relocation` at the decoy `:585`). Routed defect 3 repaired as claimed.
- **B3 predicate sentence**: byte-identical (295 chars) across claims.json `claims[C1].predicate`, the v5 header comment, and the `PREDICATE_SENTENCE` const. Routed defect 4's v5-side alignment holds. (The third named site, `receipt.predicateSentence`, is produced by the after-measurement, which has not run yet at w1; the v5 code echoes the same constant.)
- Honest floor at the measured REV is true with `deltaPinsSha256 81019362…` as the ticket expected.

No kill-rule condition observed: v5 does not refuse the honest state, refuses every non-frozen pins byte tested, and admits the truthful decoy-note fixture.

## Residual risk / gaps

- Fixtures were re-derived, not bit-identical commits (timestamps); behavior agreed in 5/5 runs and the reorder attack tree is byte-identical, so residual risk is negligible.
- I did not re-run the v5 honest leg twice for timing variance, and I did not exercise C2 (out of my lane).
- `deltaPinsSha256` match was additionally cross-checked against my own `sha256sum` of the pins blob, not just v5's self-report.

VERDICT ok — independent re-derivation agrees with all five frozen C1 receipts (J1 v4/v5, J2 v4/v5, J3); v5 predicate true at REV with pins digest `81019362…`, v5 refuses reordered pins (exit 2, digest mismatch), v4 admits them (exit 0); v4 refuses the truthful decoy note (exit 1, audit-moved-wrong-relocation `:585`), v5 admits it (exit 0); predicate sentence byte-identical at all three checkable sites.
