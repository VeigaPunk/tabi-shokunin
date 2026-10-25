# Exec17 — C1 do-nothing baseline control

## Scope and claims

This is a read-only control report for the baseline C1 gate. Frozen claims are at `.ufo/waves/round-28/claims.json`, baseline `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4`; exact frozen C1 declaration is: “add S106 receipt revision binding with matching/mismatching cases, retain missing-source CNE” (claims.json C1). The independent motivating evidence is `corpus/lessons/round-27-verifier-spotcheck.md:15-17,46-47`.

## Observations (commands and outputs)

- `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse --verify eb23c0b84668afc48ebab8bd7e4a8a4457407cc4 && git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse --short HEAD && git -C /home/vgpnk/Projects/shokunin/tabi-shokunin status --porcelain | head -20` → baseline resolves; HEAD short ID `eb23c0b`; no status output. `git log -8` identifies HEAD as “round-27 verifier spot-check”.
- `node scripts/check-s106-evidence.mjs --selftest` from lane root → `S106_SELFTEST verdict=clean cases=5 passed=5`, exit 0. Individual observed cases: clean fixture valid (0), SHA mismatch invalid (1), anchor off-by-one invalid (1), missing bytes CNE (2), missing receipt CNE (2). Thus the frozen baseline count is 5, below target 7.
- `node scripts/check-s106-evidence.mjs --selftest --json` → `cases: 5`, `passed: 5`, `ok: true`, exit 0; confirms same case count in JSON format.
- `node scripts/check-s106-evidence.mjs --rev eb23c0b84668afc48ebab8bd7e4a8a4457407cc4 --json` → revision echo is the requested baseline; receipt `corpus/evidence/round-26/sources/s106.json` present; `sha_match`, `anchor_located`, `anchor_unique`, `byte_count_match`, and `valid` all true; exit 0. This establishes baseline's target receipt is accepted, but not that its receipt binds the revision (the output has no receipt-revision field).
- Source inspection `scripts/check-s106-evidence.mjs:87-143,160-213` confirms receipt parsing requires URL/hash/bytes path/count/anchor and does not require a revision field; existing five fixture cases include missing-bytes and missing-receipt CNE controls.
- `git -C ... merge-base --is-ancestor ef8aa4a3256cc6462a60d850d7ea21277aecd2a1 eb23c0b84668afc48ebab8bd7e4a8a4457407cc4` → round-27-final `ef8aa4a` is ancestor. `git log --oneline ef8aa4a..eb23c0b` shows only baseline spot-check commit, and `git show --stat eb23c0b` shows only the round-27 verifier-spotcheck lesson changed. Thus the C1 baseline script did not change in the final spot-check commit.

## Result

**Measured no-change control; no implementation performed.** At the frozen baseline the selftest has five passing cases and runtime target gate is valid. These controls establish the starting observations only; they do not establish the desired revision-binding behavior. In particular, runtime validity is not proof of revision identity enforcement.

## Risks / blockers

No implementation-path blocker for this control. This seat was explicitly assigned a do-nothing control, and the task contract prohibited repairing production code. I did not run builds, linters, formatters, or tests beyond the explicitly requested gate selftest and baseline gate/selfassessment observations. `node --version` returned `v24.21.0`. No tools installed or updated.

## Evidence distinctions

- **Observation:** commands and script source described above.
- **Inference:** selftest lacks revision mismatch/matching cases because only the five listed IDs appear in its CASES array, and receipt parsing does not require revision identity.
- **Unknown:** whether any separate parent-session/future integration alters the baseline; no such claim is made here.
