# Exec15 — round-28 C2 citation behavior audit

Seat: scoped C2 auditor; read-only against lane source/docs. Report written at the assigned path only. No tracked files changed, no installs, no delegation, and no scratch artifacts needed. No builds, linters, formatters, or tests were run beyond the explicitly relevant counter/oracle measurements below.

## Frozen requirement

Frozen claims: `.ufo/waves/round-28/claims.json:12` (C2). The exact condition is that only a correction citing the **exact stale tally line** may supersede it. Its controls require a red unrelated-citation case and positive exact-citation case; `LOG.md:221` must remain a mismatch without an exact correction. This is not satisfied by a later paragraph merely containing *some* `:N` token. The citation must resolve to the finding's line (`f.line`), not just be present; the existing script/same-script association, later-than condition, correction marker, and correct tally remain required as well.

## Findings and retained evidence

- **Observed:** `node scripts/check-selfassessment.mjs --rev HEAD --json` ran at frozen baseline `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4` and returned `rev` equal to that hash, `mismatches=1`, `clean=false`. Its `LOG.md:221` finding is `claimed=8`, `observed=12`, `superseded=true`; this is the known false-clear. It also returned `m3-unlanded-paths` as the counted mismatch (`observed=14`), so this command's total mismatch does not establish C2's intended m1 mismatch independently.
- **Observed:** `node scripts/check-freshness.mjs --self-test` printed `FRESHNESS_SELFTEST verdict=clean cases=12` and exited 0. This establishes the current runnable oracle tally used by the cited line.
- **Observed sweep:** `grep ':221\\b' LOG.md` found only references in the falsification discussion at lines 1931–1932, not an exact correction bullet. `LOG.md:221` itself says the freshness self-test has 8 cases. The unrelated later correction block at `LOG.md:1904-1925` cites other lines and supplies 12; it does not cite 221.
- **Observed source defect:** `scripts/check-selfassessment.mjs:319-327` applies supersession using later paragraph, same script, `/supersed|correct/i`, `/` colon-number existence `/:\\d+/`, and oracle tally membership. The citation predicate does not compare the cited number with `f.line`. Therefore unrelated citation tokens can clear the stale item. `:321-326` also applies the paragraph-wide checks, so a token elsewhere in the paragraph can satisfy the current loose predicate.
- **Observed tests present in baseline source:** `scripts/check-selfassessment.mjs:496-523` has stale, correction, and wrong-number LOG cases. The positive fixture cites `LOG.md:6` for a stale fixture line 6; there is no separate mismatching-citation case in this range. Frozen C2 explicitly asks for both a negative unrelated-line citation and positive exact-line citation.
- **Observed prior evidence:** `corpus/lessons/round-27-verifier-spotcheck.md:15` documents the prior `mismatches=0`, `clean=true`, `superseded=10` false-clear despite `LOG.md:221`'s 8 vs 12 mismatch; lines 46–47 request restoring the citation check and revision binding for the separate S106 issue.

## Risks / blockers

The checked-out lane is the frozen baseline commit. It reproduces the unsound supersession predicate, so this is an audit result, not a repair. C2 assignment directs this seat to report only and forbids production edits. Actual isolated fixture behavior for wrong-citation versus exact-citation was not executed in this seat; source inspection and prior independent defect reports support the defect diagnosis, while the new test outcome remains unknown until the owner implements and runs the assigned selftest. No tool installs/updates occurred.

Evidence distinction: all bullets above are direct tool observations except the consequence that an unrelated correction *can* clear `LOG.md:221`, which is an inference from the inspected predicate and the observed correction/citation layout, corroborated by the prior report at `round-27-verifier-spotcheck.md:15`.
