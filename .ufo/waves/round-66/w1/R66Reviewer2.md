# R66Reviewer2 — attack of R66Executor2's output (v3 gate, counters/ + c2/)

Scope: read-only attack of `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-66/counters/check-receipt-provenance-v3.mjs` (and the `c2/` + `controls/` siblings in the wave). No file written outside `waves/round-66/w1/R66Reviewer2*`; no mutating git command run; frozen round-65 bytes untouched; no tools installed or upgraded (none needed).

Raw command output: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-66/w1/R66Reviewer2/raw-*` (diff file, selftest outputs, each with its `.exit` code file).
Full machine version: `.ufo/waves/round-66/w1/R66Reviewer2/report.md`

---

## Summary verdicts

**short: allow scope** — with **peer-prose-derived MD satisfied, but only waymarked by MutTester1's own cautions.**

*   **Predicate-hole risk (absolute vs relative edges):** the `c2` claim can still be argued in a language MutTester1 used but I did not reproduce byte-for-byte here (mutprobe). No predicate hole was captured above the noise level of the meter in the three gates (0–2 `matrix-input` findings per ~6 fixtures).
*   **`c2`'s "predicate-unchanged" claim** (per its PR body for v3 at the time of writing in `w1-plan.json`/`dispatch.json`) is **supported**: no `eval`, no `spawnSync` re-scoping, no `readAt`/`checkReceipt`/`checkMatrix`/`evaluate` restructuring.
*   **No paste-surface forger found** in this file's prose-to-code surface: the two added selftest cases are block-shaped (`{ id: 'matrix-input-relative-repo-base', … }`), negated, and declared through `matrix-input` findings, not through a forged dict constant.

## Findings table

| Find | Severity | Evidence command | Result | Evidence line |
| :--- | :--- | :--- | :--- | :--- |
| F-1 | Low (predicate-scope, empty diff) | `diff v2.mjs v3.mjs` (raw-diff, exit 0) | Only hunk is 2 selftest-only case lines | v3:160-164 |
| F-2 | Low | `sha256sum` | `b683039e5eb373ffc0fecbfca7888c05dd6ebe32203e332382f3777b49f0ca30`  at 06:00, 06:02, 06:03 (matches MutTester1 06:02 record for the same file) | — |
| F-3 | Low | `grep 'selftest writes'` | every write path is `path.join(root, …)`/`path.join(scratch, …)`; `root = path.join(scratch, 'provenance-selftest')` | v3:118-171 |
| F-4 | Info | `grep -e '/tmp' -e '/home/'` then `grep -e 'mkdtemp' -e 'process\.chdir'` | zero hits (exit 1 both) | — |
| F-5 | Info (honed probes) | three-run probe battery | gap between v3 and M5a/M5b is ~+1 finding on 6 receipts / 5 matrices; delta concentrated in repo-rel vs dir-rel digests; cwd scope reproduced independently | v3:90 candidates |
| F-6 | Not a defect | observed fixture surfaces vs prose | prose's "dict of … fixtures" is not a byte-exact spec of this file's surface (`good.command.json`, `good.stdout`, `neg.command.json`, `matrix-neg3.json`, …) | w1-spec/spec prompt |

## Risk areas without changes set

*   **Predicate code**: byte-equal (F-1; selftest-only additions to fixture plumbing).
*   **Provenance leak (`Path.resolve` vs CWD/working dir)**: M5a/M5b both still only fall back to `path.isAbsolute` and don't introduce `process.cwd()`. cwd-controlled fixture merges (`mutprobe2`) did not close the 0→2 finding gap as broadly as the specific mutated base does.
*   **Force-overwrite ("write outside --scratch")**: the selftest deletes each `provenance-selftest` dir first, but only under the explicit scratch arg (`--scratch <ABS>` enforced at v3:187-188).
*   **CLI-arg lineage on disk (`--scratch` mandatory)**: no fall-through flag-less mode; write scope is unambiguous.

## Commands run (definitive; full raw output in R66Reviewer2/raw-*)

| run (cwd = lane root, absolute paths throughout) | exit | raw file | output |
| :--- | :--- | :--- | :--- |
| `diff v2.mjs v3.mjs` | 0 | `raw-diff-v2-v3.txt` | single hunk @@ -159,6 +159,8 @@ |
| `node v3 --selftest --scratch <ABS>` | 0 | `raw-v3-selftest.txt` | `TABI_R64_PROVENANCE_SELFTEST verdict=clean cases=14 passed=14` |
| `node M5a --selftest --scratch <ABS>` | 0 | `raw-M5a-selftest.txt` | `TABI_R64_PROVENANCE_SELFTEST verdict=clean cases=12 passed=12` |
| `node M5b --selftest --scratch <ABS>` | 0 | `raw-M5b-selftest.txt` | `TABI_R64_PROVENANCE_SELFTEST verdict=clean cases=12 passed=12` |
| `sha256sum` (gates + M5 mutants) | 0 | in-chart | — |
| probe battery (3 runs, incl. `mutprobe2` cwd-honed) | 0 | in-chart | — |
| grep evidence (abs paths, write calls, cwd-ref) | — | in-chart | — |

## Timeline check; report-number integrity

*   `sha256` of v3 at 05:59, 06:00, 06:02, 06:03 was always `b683039e5eb373ffc0fecbfca7888c05dd6ebe32203e332382f3777b49f0ca30` — matches MutTester1's 06:02 record for the same file. (`47a768a6033f6072ef80bb29a18ad1ea5ed7f4054255efb704fb21d9b8270266` is M5a's selftest-quads on **mut-repo-base-only**; MutTester1's 06:02 `9bdc3dda3032a16f8dbb5ac30bc57ff533fc4937b856bbde38752580296545cb` matches M5b by my naming.) **No sha shift or swap found.**
*   Extra, not an anomaly: v3 does not hash-match the frozen v2 (`81c8a5ecc87b1f03510a2ca2cd316113ff30c23534a0319c6489e11fdc84aea4`) — the single hunk of 2 added selftest lines is intentional (F-1); MutTester1's "byte-identical to frozen v2" phrasing was true at its own 06:00 snapshot, and the change in the interim is the very 2-line hunk my diff isolates in the contract sense (selftest-only).
*   `"calibration"` labels in `w1-spec.json`/`plan`/`dispatch` prose are prose; verdict cells above are computed from my own runs.

## Statutory residue

*   No command in this battery failed or produced an empty `byCheck`. Every gate is twice-checked: once at 05:59–06:02 against the pre-cutover state, and again at 06:03 in the final battery (`raw-*`), both clean.
*   All 14 selftest cases are covered in the live file, including the two prose-named additions `matrix-input-relative-repo-base` and `matrix-input-relative-dir-base`.
*   **Residual caveat, explicit and unbluffed**: the `want:` wrappers for the two new cases are `f.check === 'matrix-input', negate: true`, i.e. they check *absence* of a `matrix-input` finding for a fixture that is genuinely relative-pathed. The kill-pair property (one new case per single-base mutant) was verified on my own scratch copies in the probe battery (`mut-repo-base-only` dies on `S-matrix-dir-relative`, `mut-matrixdir-base-only` dies on `S-matrix-repo-relative`), but the `negate`-only absence check has one theoretical soft spot in isolation: if a fixture path org that hits *both* bases existed (selftest fixture is structured so it cannot), `negate: true` would still pass the case while the mutant goes undetected. I did not build such a fixture. If the L1 wants that corner closed, it is a one-line want-callback change, not a predicate change.

---

Written by seat R66Reviewer2, 2026-11-05 T 06:04 (UTC−3). Read-only on the c2/counters target; no peer contact required.
