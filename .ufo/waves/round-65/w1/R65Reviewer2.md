# R65Reviewer2 — C2 attack reviewer report

Target: `.ufo/waves/round-65/counters/check-receipt-provenance-v2.mjs` (matrix-input binding), built
by R65Executor2, frozen at round-65 commit 4a3481048cb3afd0d6068fdbc1421dfec4f06084.
Full attack table: `.ufo/waves/round-65/w1/R65Reviewer2/c2-attacks.md`.

## Predicate
v2 admits a receipt directory at REV iff every receipt passes the v1 checks AND every matrix's named
input resolves to a file whose sha256 equals the matrix's pinned sha256 — verified against the code:
resolve (absolute as-is, then repo-first+matrixdir-first for relative), first `statSync(c).isFile()`
hit, `sha256(file) !== pin` → `input digest mismatch`, no hit → `input absent: <path>`. Matches the
frozen C2 predicate sentence. v1 CHECK_IDS, receipt checks, CLI and exit codes unchanged (diff vs
base v1 = header, checkMatrix signature+body+evaluate pass-through, selftest binding cases).

## Under-refusal (all six refused correctly; v1 false greens confirmed on 2k1 and 2k4b)
- 2k1 relative repo-escape path: v1 exit 0 accepted / v2 exit 1 `input absent: ../../…receipt.json` — killed.
- 2k2 `…/indeed-escape/receipt.json` (`..` out of repo): v2 exit 1 refused (absent; v1 only flagged matrix-command).
- 2k3 uppercase-hex pin (same true digest): v2 exit 1; refusal via the pre-existing lowercase-HEX64
  format gate (`no input path+sha256`), the digest-mismatch branch is unreachable for uppercase (nit R-1).
- 2k3b same-shape lowercase wrong pin: v2 exit 1 `input digest mismatch` — decisive proof of the digest compare.
- 2k4b symlink to a different-digest file: v1 exit 0 accepted / v2 exit 1 `input digest mismatch` — killed.
- 2k5 input is a directory: v2 exit 1 `input absent: …/dir-as-input` (isFile gate).
- 2k6 / 1k3b absolute dead path (also with cwd-relative `--repo .`): v2 exit 1 `input absent`.

## Over-refusal (all admitted correctly)
- OR-1 official c1-honest (absolute pinned receipt, pin c6ab6a58…): exit 0, checked 2, matrices 1, failures 0.
- OR-2A symlink resolving to the pinned digest: exit 0 — symlink pass-through kept, matches v1 read semantics.
- OR-3 repo-first relative pin (`.ufo/waves/round-64/controls/scored/smoke/receipt.json`): exit 0 with a consistent matrix pair receipt.
- OR-4 real r64 scored population, `--rev e3f521…`, `--require-committed --min-receipts 12`: exit 0, checked 15, failures 0, both from a scratch clone and from the lane path directly.
- OR-6B my honest mirror with `input.path` rewritten to repo-relative `c1-honest/honest-240.command.json` (fixture placed at a clone-root sibling so the same rel path exists): exit 0 — repo-first relative resolution accepted.

## Selftest / frozen-copy checks
- v2 `--selftest` (wave copy and frozen counters copy): `verdict=clean cases=12 passed=12` (9 base regression cases kept, 3 new binding cases — absent/digest/bound).
- v1 base selftest at 58ed8c7a: 9/9 — regression set intact.
- CLI edges preserved: absent `--dir` exit 2 with usage JSON; relative `--selftest --scratch` exit 2.
- Frozen copy on frozen controls: c1-fab exit 1 byCheck `{matrix-input: 3}`; r64 scored exit 0;
  c1-honest exit 0. Positive controls stay green on the frozen bytes.

## Defects / residuals
1. R-1 (nit): uppercase-hex pinned input refused with `no input path+sha256` inside `matrix-input`
   (v2 line 82-84 HEX64 pre-gate). Exit and check id correct; text differs from the new detailing.
   Behavior safe; flag for claim-text wording.
2. R-2 (residual): the lane's c1-fab acquired a third matrix `fab-selector-matrix.json` after the
   executor recorded the wave evidence, so frozen copy on the prepared c1-fab yields 3 `matrix-input`
   findings while the claim's kill rule text says "exactly the two". Fix is wording or a fixture trim.
3. R-3 (declared, not a regression): v2 binding reads the tree like v1 `readAt`; a pinned input at an
   older REV binds to current tree bytes, not the past commit. Same scope as v1's other checks; no action.
