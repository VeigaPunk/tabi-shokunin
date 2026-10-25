# Scribe03 — Round 28 source-gate audit

## Frozen scope and axes

Read `.ufo/waves/round-28/claims.json` (line 14): claims explicitly disclaim source admission; no sourced claim this round unless an already-open source is explicitly reopened and cited. Thus a source gate requiring one admitted plus one rejected source and a per-round opened S-row exceeds the frozen claims' present scope; do not quietly imply a coverage/source-admission claim. If the orchestrator nevertheless requires that gate, the existing feasible candidate is S106, not a newly discovered source.

Relevant axes: depth/calibration are the frozen claims C1/C2; source admission/rejection is explicitly not claimed. The gate result is therefore **not met / unknown**, not a pass. No admission or rejection decision was made in this audit.

## Feasible source and gate evidence

S106 is an already-open source in `corpus/SOURCES.md:120`: the exact Chromium 154.0.8037.97 Gitiles URL and narrow feature-default scope. The prior opening artifact `.ufo/waves/round-25/w1/ScoutOpenS106.md:26-33` identifies the quote and decoded lines 186–187; `.ufo/waves/round-26/sources/s106.json:1-18` records transfer/decoded hashes and anchor. Those are historical openings, **not round-28 opening execution**. Reopen the same version-pinned URL only if a source gate is explicitly required, and record fresh fetch/result, bytes/digest, located anchor/quote and artifact; do not claim this audit reopened it.

For a possible reject, S125 is only a historical lead: `corpus/lessons/round-27.md:27,30-40` records round-27 refusal and the quarantine slice. It is not a round-28 fresh opening or source-specific rejection. No admitted-plus-rejected pair for round 28 is evidenced by inspected artifacts.

The registry structure checker is not an opening/admission gate: `scripts/check-sources.mjs:9` states it cannot see whether a source was opened; its `evaluate` checks registry shape, status, citation paths, etc. (`:247-362`), not actual source access or admission judgment. Existing `corpus/SOURCES.md` includes S106, but that alone cannot prove this round's opening.

## Evidence and limits

Observed commands and results:

- `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse HEAD` → `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4`, equal to the frozen baseline.
- `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin status --porcelain=v1` → `?? .ufo/waves/round-28/`; no tracked changes observed at inspection.
- `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show eb23c0b84668afc48ebab8bd7e4a8a4457407cc4:corpus/SOURCES.md | grep -cE '^\\|[[:space:]]*S[0-9]{3,}[[:space:]]*\\|'` → `107` registry rows (baseline observation; this is not a current-round opening count).
- Read `/home/vgpnk/.omp/agent/RULES.md`; no tool install/update was performed. PACMAN was not invoked.

Search sweep: `grep` over `.ufo/waves/round-28` for `S106|admitted|reject|opened this round` found source-gate discussion in Crit08, Exec01/05/08/11/14/20/24, Scribe04/05, plus unrelated frozen dispatch/spec references; the only report explicitly discussing a feasible S-row and reject lead was Scribe05. The wave directory listing at inspection contained Scribe05 and executor/critic artifacts but no Scribe01/Scribe08 reports. This is an inspection-scoped negative, not proof no later artifact will appear. I did not fetch any source, execute gate counters, make admission/rejection judgments, or validate peer implementation results.

## Finding

S106 is the feasible already-open source to cite if an explicit reopen is authorized; round-27 S125 is a historical reject lead, not current-round evidence. The frozen claims do not claim source admission, and this audit establishes neither a fresh per-round opening nor an admitted/rejected pair. Any source gate required beyond that is incomplete/unknown pending actual opening and judgment. No source claim is promoted here.

## Artifact paths

- Report: `.ufo/waves/round-28/w1/Scribe03.md`
- Frozen claims: `.ufo/waves/round-28/claims.json`
- Feasible prior S106 opening: `.ufo/waves/round-25/w1/ScoutOpenS106.md`
- S106 receipt: `corpus/evidence/round-26/sources/s106.json`
- Historical S125 refusal: `corpus/lessons/round-27.md:27,30-40`
- Prior defect evidence: `corpus/lessons/round-27-verifier-spotcheck.md:15-17,46-47`
