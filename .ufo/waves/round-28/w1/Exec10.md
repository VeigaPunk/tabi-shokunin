# Exec10 — C2 adversarial fixture design

## Scope and frozen claim

Read frozen claims at `.ufo/waves/round-28/claims.json` (absolute path `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-28/claims.json`), baseline `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4`. This report addresses C2 only; no implementation files changed and no tests/builds/linters/formatters were run. Tooling authorization was read from `/home/vgpnk/.omp/agent/RULES.md`; no tool was installed or updated.

## Adversarial fixture

Add a selftest fixture in `scripts/check-selfassessment.mjs` (exclusive implementation ownership is not assumed here) with two distinct stale tally paragraphs/lines for the same gate, each claiming 12 while its oracle reports 13. The later correction paragraph must name that gate, use a correction marker, state the correct tally (`cases: 13`), and cite only the *second* stale line, e.g. `Correction (supersedes LOG.md:7): scripts/check-fixture.mjs ... cases: 13`. Assert the first stale finding remains unsuperseded and counted, while the second is superseded. This specifically catches the current `/:\d+/` existence check: it sees some line citation in the correction and can clear either stale finding, without checking that the cited line equals `f.line`.

Keep/add a positive control where the sole stale tally is explicitly cited by the exact line number and is superseded, plus a negative control where a correction cites a different stale tally line and the target finding remains a mismatch. The existing fixture helpers `logDoc` and cases `m1-log-stale-then-corrected` / `m1-log-wrong-number-correction` provide the local pattern (source lines 430–441 and 496–523). Existing implementation is in `m1LogFindings` lines 309–328; its cited-line predicate currently accepts any `:\\d+` (lines 323–326), establishing the attack surface from inspected source.

## Evidence / limitations

- Observation: frozen C2 expressly requires a red unrelated-citation case and positive exact-citation control; frozen C1/C2 report locations are as above.
- Observation: prior independent report `corpus/lessons/round-27-verifier-spotcheck.md:15–17,46–47` identifies the `LOG.md:221` false-clear and routes exact-citation repair.
- Observation: inspected `LOG.md:221` is the freshness `cases=8` tally; this is the concrete false-clear target named by the prior report.
- No command-backed selftest or current revision measurement was performed in this report; runtime outcome is therefore unknown, not asserted.
- Sweep: only the frozen claim, cited prior evidence, LOG excerpt, and relevant selfassessment source ranges were read. No repository-wide search, git command, or LSP request was made; absence claims beyond those inspected ranges are not made.
- Exact report path: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-28/w1/Exec10.md`.
