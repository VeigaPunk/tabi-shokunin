# Round 36 L1 state (attempt 1 — interrupted mid-round at budget; resume here)

## Done and committed (verify before reuse)
- freeze `2e7b7a8920bff47fae6f75c3d06e48e37767099e` (landed, pushed): claims.json, counters
  (c1-adjacency-sweep-v4.mjs, c2-firefox-bidi-v2.mjs), baseline/ (c1-delta-pins.json,
  c1-delta-candidates.tsv, c1-drift-audit-build.mjs, controls.mjs + all J-receipts +
  controls-summary.json, census-start.txt), measure.sh, corpus/adjacency-screen-drift.tsv
  (307 rows: 304 unchanged / 3 moved / 0 stale; moved = kaidoku SKILL.md 585->748, 621->784,
  652->815).
- `e6959879c87f2504e699c00c5e4ab869b4effb20`: D11 correction append (entry + README corrections
  block, routed defect 1) + w1 spec/dispatch/ready/chunks and w1 seat evidence landed so far.
- Claims (frozen): C1 adjacency — drift-verification meter split (completeness unaccounted==0,
  drift auditCoverage==307==total, auditFindings==0, staleFindings==0, delta.unaccounted==0,
  delta.screenFindings==0). C2 operability — v2 counter admits honest r35 evidence (16/16,
  egress 0) AND refuses the committed battery (boundary-15 false, wrong-binary refused,
  wsnorm-clone refused, duplicate-run refused; c2-J6 instrument reads >=1 egress without
  DNS-off).
- Controls all behaved as designed: c1-J1 do-nothing FALSE (no ledger), c1-J2/J3/J4 forgeries
  FALSE, c1-J5 honest-floor TRUE; c2-J1 regression TRUE, battery refused, boundary binds.
- C1 counter at the freeze tip already reads predicate TRUE (verified in scratch clone).
- w1 (33 seats) spawned 06:29:47 by inline dispatcher; w1-results.json not yet written.

## Remaining (in order)
1. Wait for WAVE-DONE w1 / w1-results.json; integrate seat findings (fix any ledger row a
   seat shows mis-audited; regenerate via c1-drift-audit-build.mjs and re-measure).
2. Wave 2 (falsify, >=32 attack items) — spec from w1 output; dispatch via a second
   <wave>.ready; wait WAVE-DONE.
3. Integrate: land S125 on-release cell WITH the four companion evidence files (routed
   defect, ExecS125 seat dir if it produced them); land S142 row + method entry
   (ScribeSrcGitDocs drafts); lesson round-36.md (ScribeLesson draft + this state);
   SCORECARD axes/planned rows; LOG.md; LOG entry for every landed change.
4. Run .ufo/waves/round-36/measure.sh <TIP> .ufo/waves/round-36/measure <FREEZE>; commit
   measure/ outputs; census-end validate; misroot sweep (git status --porcelain at fleet
   root); SHONEN.
5. Report .ufo/reports/round-36/tabi.md via fleet-commit.sh --as tabi; jj-lane.sh push;
   verify ls-remote prints final lane hash.

## Notes
- kama pin transcription error was caught pre-freeze by the controls run (39-char constant
  failed resolveCommit); lesson draft names it. Frozen counter reads PINS from itself;
  delta heads from c1-delta-pins.json.
- C1 v4 counter BASELINE = 11c64b96f357de106c30a71c5e21ca44a3eacdc0 (round-start tip);
  C2 v2 BASELINE = 2d2c8a77428f9c95c3cd0eb4a3bbf0c6fb4ab684 (r34 baseline, for S-row
  registry comparison).
- Do NOT re-run controls.mjs — receipts are frozen; re-running overwrites them.
