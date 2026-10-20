# DraftSkill — round 16 report (scribe, author-side advice)

## Behavior
Drafted the append-only SKILL.md section `## Round 16 — native WebMCP observation and measurement binding (2026-10-20)` at `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-16/drafts/DraftSkill.md`. It contains:
- a C1 measurement-binding decision table (question → evidence → command → verdict rule);
- a C1 gate registry row (`measurement-binding`: entry, exit map 0/1/2, finding and could-not-evaluate reasons, self-invocation, pinned values, write scope), matching the PLAN §C1 contract;
- a WebMCP C2 decision table (question → evidence → command → verdict rule) covering the flag-off/flag-on surface, declarative and imperative registration, lifecycle, secure context, CDP invocation, and spec-vs-observed divergence;
- scope limits and the routed-defect-3 pointer to `corpus/lessons/round-15-verifier-spotcheck.md` §Erratum (`## Erratum to the round-14 verifier wording`, lines 90-101).

## Gates
None run. This seat is a scribe; it executed no gate, selftest, counter, or browser. Every command in the draft is a registry entry for L1 to run after integration.

## Touched surfaces
- Written: `.ufo/waves/round-16/drafts/DraftSkill.md` (owned draft), this report.
- Read only: `.ufo/waves/round-16/PLAN.md`, `SKILL.md:1764-1829`, `corpus/lessons/round-15-verifier-spotcheck.md` (lines 1-125), `corpus/README.md` frontier rows (:35, :181, :194), `corpus/SOURCES.md` S020 row, `corpus/evidence/round-15/measurements.json` (path confirmed only), and `.ufo/waves/round-16/w1/spec.json` / `validation.json` (to confirm peer work-item text).
- Not touched: `SKILL.md`, LOG.md, SCORECARD.md, corpus knowledge/evidence, scripts, probes.

## Out of scope / left for L1
- `PENDING` values: all probe-derived and gate-derived values (flag matrix results, harness receipt cases, lifecycle triggers, secure-context rule, CDP invoke presence, manifest counter digests, `--legacy` exit, selftest line and case count). The draft marks each one; none is asserted as observed.
- L1 pre-probe values from PLAN.md §C2 (Chromium 154.0.8037.97, Playwright 1.64.0, Node v24.21.0, `document.modelContext` with flags, `WebMCP.toolsAdded` payload) are cited as *L1-reported*. This seat did not re-observe them.
- S020 re-open and any new SOURCES rows: L1 only, after a seat opens the source (access date 2026-10-20, ≤25-word located quote). The draft quotes no spec text.
- The SKILL.md append point is after line 1829. The draft does not edit SKILL.md.

## Findings
1. The gate contract is written in PLAN §C1 but `scripts/check-measurement-binding.mjs` does not exist yet (`scripts/` listing at the time of writing shows no such file). The registry row is therefore a contract, not an observed command. The draft says so.
2. The C2 frontier text in `corpus/README.md:35`, `:181`, `:194` still says "chromium 152 — unprobed". The probe target is 154.0.8037.97. The draft leaves the historical line unedited and records 154 as the observed build, as the round-16 plan requires.
3. Routed defect 3 has a concrete target: the erratum section in the round-15 lesson, lines 90-101. The draft points to it and restates only the corrected sentence (Node minimum enforced by the historical spec; exact equality never enforced).
4. The round-15 `measurements.json` path (`corpus/evidence/round-15/measurements.json`) exists, so the `--legacy` command in the draft resolves on disk. Its expected exit 1 is a PLAN statement, not an observed result.

## Tools
None installed or updated by this seat.

## Ownership
Single owned file written, plus this report. No subagent dispatched. No commits.

## Handoff checks for L1
- After BindCore and BindSelftest land: run `node scripts/check-measurement-binding.mjs --self-test`, `--check`, `--legacy`; confirm the exit codes and the reason set match the registry row.
- After WebmcpHarness and the probes land: fill every `PENDING` cell from committed receipts and probe JSON; re-open S020 before any row is cited.
- Integrate the draft into `SKILL.md` append-only after line 1829; keep the frontier line in `corpus/README.md` unedited.
