# SHONEN — tabi-shokunin (probation checklist)

Seed checklist (verbatim shape per PROTOCOL.md; `<name>` -> tabi):

- [x] SKILL craft — `SKILL.md` holds real decision tables / error patterns /
  checklists for the domain, every rule citing a source (verifier: TABI-B4,
  scribe, non-author; corroborated by the TABI-R3-4 executor test)
  evidence: `SKILL.md@452bc514d387` — approval table (§Approval table,
  finalized, C1–C6 + A1–A12 + never-set), evidence ladder (§Evidence ladder,
  3 rungs with measured anchors), error patterns (`pkill -f` self-match,
  netlog≠HAR, `::marker` counting, `-1` sentinel), checklists (§Runbook
  13 steps, §Record envelope 9 items), every rule §Pins-cited; scribe re-ran
  §Pins (8/8 note shas match) + approval counts (6/12) 2026-10-14;
  `executor-test-sufficiency.md` §1 steps 0–13 SUFFICIENT + §4
- [x] End-to-end task — one domain task executed start-to-finish and logged
  (verifier: TABI-B4, scribe, non-author)
  evidence: `multi-step-journey.md` §1–§2, §7 — 4-page loopback journey
  (navigate → link → link → fill+submit) with 6 per-step captures × 2 cold
  runs byte-identical + 2 warm runs, cleanup + port closure proven per run;
  scribe re-hashed all 9 methodology files + run1 PNGs 2026-10-14 — all
  match; logged in `LOG.md` round-3 entry
- [x] No-oral-context — a fresh agent can execute the instructions from
  `SKILL.md` alone (verifier: TABI-R3-4, the document-only executor lane;
  scribe re-derived its pins)
  evidence: `executor-test-sufficiency.md` §0 (declared condition: only
  `SKILL.md` read; round-2 scripts never opened) + §4 verdict SUFFICIENT —
  every copy-paste command ran unmodified, two independent runs, closure
  proven; gaps G1–G5 named, errata E1–E5 applied in `SKILL.md@452bc514d387`
  (count definition, two-click delta); scribe re-ran its methodology pins +
  compare.tsv (10 yes / 3 expected NO) 2026-10-14
- [x] PROVINCE accuracy — `PROVINCE.md` matches observed reality; no
  cross-domain bleed (verifier: TABI-B4, scribe, non-author)
  evidence: re-runs 2026-10-14 — manifest↔skill `1.11.3` (`grep '"version"'
  kimi.plugin.json` → :4), substrate paths resolve, refusal-route targets
  exist (revenger/kaidoku/kake/kagi), daemon pid 3934817 on 10086 matches
  the recorded round-2 state change; round-3 notes cite `PROVINCE.md:4-19`
  and held the loopback-only anti-claim (`plans/round-3.plan.md:8`);
  out-of-province items kept as unknowns, not absorbed (approval U4/U5)

Header pins: PROTOCOL.md lines 419-428 (seed), lines 430 (mark spec).
