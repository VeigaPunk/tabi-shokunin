# R66Scribe2 — scoped findings (round 66, w1)

Full report: `.ufo/waves/round-66/w1/R66Scribe2/report.md` (commands, exit codes, limits).

Drafts (prose only, nothing in `corpus/`):
- `.ufo/waves/round-66/w1/R66Scribe2/knowledge-provenance-relative-input-r66.md` — calibration entry; `verified-at` is the lane base `2816adb359a50c2fd83fa975e39f0650aa189984`; `source:` cites the v2 gate and both mutants, with `S-next` for the L1; `recheck:` is the v2 selftest command (no v3 file exists in the tree).
- `.ufo/waves/round-66/w1/R66Scribe2/mistakes-r66.md` — Mistakes table, four rows (number-drift, scope, citation drift, stale-premise), each with file:line evidence.

Key observations:
- M5a and M5b differ from v2 only at `check-receipt-provenance-v2.mjs:90`; both pass 12/12 (`controls/mutants/*.selftest.txt:1`; re-run exit 0).
- No v2 selftest case resolves a relative matrix input (`:136`, `:159`, `:160`, `:161`).
- Proposed `rel-input-repo-only` kills M5a and `rel-input-dir-only` kills M5b; probe in scratch: v2 14/14 exit 0; each mutant 13/14 exit 1.
- Committed `R65Executor1/selftest.stdout:4` reads 46 cases; live run `controls/v22-selftest-r66.json:4` reads 47; the counter has the 47th case at `c1-adjacency-host-v22.mjs:770`.
- r65 Gate rows S140/S141 read `Reject` (`R65Scribe/round-65.md:17-18`); registry status is `mined` (`corpus/SOURCES.md:154-155`).

Lane HEAD observed at `4bea87d5…`, not the base. No tools installed. Scratch removed at exit.
