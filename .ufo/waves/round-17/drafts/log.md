## 2026-10-20 — round-17 (hyaku, attempt 1)

Baseline `5859243183c4d7ac5429dfdb8a73ce0d9a43d583` (clean; `.ufo/waves/round-17/PLAN.md:3-5`).
Measured revision `<<HASH>>`. Motivating evidence: round-16 outside spot-check routed defects 1-5
(`corpus/lessons/round-16-verifier-spotcheck.md:146-152`); the jj audit and trial of this lane
(`.ufo/waves/hyaku/jj-w1/reports/JjAuditTabi.md:44` F1, `:95` F3, `:184` F6;
`.ufo/waves/hyaku/jj-w1/reports/JjTrialTabi.md`); and the frontier row "tool invocation as committed
evidence" (`corpus/README.md:301-303`) against the round-16 note "No tool is invoked in the receipt"
(`corpus/knowledge/webmcp-chromium-loopback-round-16.md:127`).

- C1 operability 8 (lowest tie): jj-safe lane-tip anchoring of `scripts/check-round-contract.mjs`,
  `scripts/check-user-round-contract.mjs` and `scripts/check-measurement-binding.mjs` (+ selftest).
  Motivation: under jj, git HEAD can name an empty commit on no branch that both gates certify
  (`JjAuditTabi.md:44` F1); HEAD can carry never-committed working-copy content that the gates read
  (`JjAuditTabi.md:95` F3). Gates now resolve `refs/heads/` lane tip once per process
  (`PLAN.md:56-81`). Counter `node .ufo/waves/round-17/measure-c1.mjs REV`:
  `c1_anchor_safe` `<<C1_BEFORE>>` at `5859243` → `<<C1_AFTER>>` at `<<HASH>>`; entries
  `<<C1_ENTRIES>>`; sensitivity arm C `<<C1_ARMC>>` (`PLAN.md:87-106`).
  Not fixed in code: `check-freshness --witness HEAD` acceptance (`JjAuditTabi.md:184` F6), because
  `scripts/check-freshness.mjs` is byte-frozen (`PLAN.md:44-48`); recorded as a why-not plus a SKILL
  registry rule `--witness "$(git rev-parse --verify refs/heads/master)"` (`PLAN.md:46-48`).
- C2 coverage 9 + capability `webmcp-cdp-invocation`: WebMCP tool invocation over CDP as committed
  evidence on Chromium 154.0.8037.97 loopback (`/usr/bin/chromium`; `PLAN.md:6`). Motivation:
  `corpus/README.md:301-303` (open: "tool invocation as committed evidence"); integrator ruling that
  tabi owns live browser/CDP page observation including the WebMCP page-tool surface
  (`corpus/lessons/round-16-verifier-spotcheck.md:138-142`). Harness `scripts/webmcp-invoke-round17.mjs`;
  receipt `corpus/evidence/round-17/webmcp-invoke/receipt.json`: `<<C2_SUMMARY>>` (cases
  `<<C2_CASES>>`; `PLAN.md:111-125`); note `corpus/knowledge/webmcp-invocation-round-17.md`; sources
  `<<C2_SOURCES>>` (S041+ opened this round, `PLAN.md:29`). Counter `node .ufo/waves/round-17/measure-c2.mjs REV`:
  `c2_invocation_held` 0 → `<<C2_AFTER>>`; negative probes `<<C2_PROBES>>` (`PLAN.md:131-133`).
- C3 adjacency 8 (lowest tie): checked sibling-overlap map `corpus/adjacency.tsv` + checker
  `scripts/check-adjacency.mjs`. Records the integrator CDP ruling (`corpus/lessons/round-16-verifier-spotcheck.md:138-142`)
  and the kaidoku CDP overlap previously reported, not absorbed (`corpus/knowledge/webmcp-chromium-loopback-round-16.md:131-140`),
  plus sweep-found overlaps. Counter `node .ufo/waves/round-17/measure-c3.mjs REV`:
  `c3_adjacency_verified` 0 → `<<C3_AFTER>>` (rows `<<C3_ROWS>>`; rows re-verified by the counter,
  not the checker; `PLAN.md:135-153`).
- Routed defects (`corpus/lessons/round-16-verifier-spotcheck.md:146-157`):
  1. unrooted liar probe (`:148`) → `corpus/evidence/round-17/routed/liar/` `<<ROUTED1>>`.
  2. pre-hardening gate receipts (`:149`) → `corpus/evidence/round-17/routed/binding-hardened/` `<<ROUTED2>>`.
  3. delivered-HEAD receipt (`:150`) → same dir `<<ROUTED3>>`; the round-17 delivered-tip receipt lands at round end.
  4. census U3 pointer (`:151`, `corpus/knowledge/browser-surface-census.md:188`) → `corpus/README.md`
     index row `<<ROUTED4>>`.
  5. integrator ruling (`:152`) → C3 row and PROVINCE append `<<ROUTED5>>`.
  Also: "unforgeable" overstated finite liar probes in the round-16 report → QUALITY criterion `<<QUALITY>>`
  (`PLAN.md:169`).
- Census before/after (`scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi`):
  before rows 40, A31/B4/C5, mined33/queued2/rejected5 (`PLAN.md:6-7`; equal to round-16 close,
  `corpus/lessons/round-16-verifier-spotcheck.md:109`); after `<<CENSUS_AFTER>>`.
- Wave 1: seats `<<SEAT_COUNTS>>` per `PLAN.md:171-196`; wave 1 = build + first falsifiers.
  Failed or rate-limited seats: `<<SEAT_FAILURES>>`.
- No-harm (re-verification at `<<HASH>>`): ROUND_CONTRACT `<<RC>>`; USER `<<USER>>` (round-16 USER
  was 6/10, pre-existing, `LOG.md:998`); freshness `--worktree` `<<FRESH>>`; SOURCES gate `<<SRC>>`;
  census validate `<<CENSUS_EXIT>>`. `ROUND_SCRIPT_CURRENT_SHA256` pair updated by L1 at integration
  only (`PLAN.md:83-86`).
- History kept, not rewritten: `<<HISTORY>>` (pre-hardening receipts retained as history per routed
  defect 2; a failing earlier WebMCP receipt kept as `receipt-first-run-failed.json` if one exists,
  `PLAN.md:126-127`).
- Author verdicts: `<<VERDICTS>>`.
- Tools installed/updated: `<<TOOLS>>`. pacman transactions were paused host-wide by orchestrator
  ruling 2026-10-20 (`.ufo/waves/round-17/w1/spec.json` context); no pacman use is recorded here.
