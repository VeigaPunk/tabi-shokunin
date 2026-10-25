# RevLesson — review of corpus/lessons/round-24.md against committed bytes

Lane: tabi round 24, wave 2. Reviewed revision: `ad125e85c235e1c4ec6a08e398bd64da01f68a08` (lane tip). All commands were read-only (git show/ls-tree/log/status, node gates on a shared clone in scratch, fleet census on scratch copies). The lesson file is being edited live by a concurrent process: findings 1 and 2 below target the **committed** bytes at `ad125e8`; the live file already carries some of the corrections.

## Severity ranking

### HIGH-1 — C2 "after: 0" and "git status --porcelain empty at the round-24 tip" do not reproduce at the tip
- Observation: `git status --porcelain` in the lane at tip returns **5 untracked paths**: `.ufo/waves/round-24/gen-w2.mjs`, `w2-dispatch.err`, `w2-dispatch.json`, `w2-spec.json`, `w2/` (wave-2 dispatch artifacts; `.gitignore` covers only `.ufo/waves/*/scratch/`).
- The shipped counter is worktree-sensitive for m3: in the scratch clone (clean) added exactly those 5 paths, `node scripts/check-selfassessment.mjs --rev ad125e8 --json` reports `mismatches: 1` (`m3-unlanded-paths`, claimed "landed", observed 6), exit 0, `clean: false`. The same run on the truly clean clone reports `mismatches: 0`.
- The committed receipts contradict the "0" headline: `corpus/evidence/round-24/c2-tip.json` and `c2-measurements.json` both record `mismatches: 1` (m3, observed 4) at `before.after.rev = b973fde`, i.e. the tip receipt is a 1-mismatch receipt. SCORECARD.md §"Round 24 — executed disposition" claims "5 → 0 mismatches … tip counts none" without disclosing that the zero depends on a clean worktree; QUALITY criterion 65 says such a class "is measured with a clean tree and says so" — the SCORECARD and the lesson do not say so.
- The lesson Corrections row "`git status --porcelain` empty at the round-24 tip" is not reproducible at the tip as observed (5 paths). The m3 class fires on the round's own wave-2 harness artifacts — the "0 at tip" claim is state-dependent, not revision-bound.

### HIGH-2 — Id-collision claim is contradicted by the artifacts it cites (S104/S105 are staged, not free)
- `claims.json`/lesson: "staged ids S102–S249, intersection 2 (S102/S103, already landed), candidate ids S104/S105 free (`.ufo/waves/round-24/assimilation/`)".
- The cited artifacts say the opposite of "free": `staged-ids.txt` contains S104 and S105; `next-free-ids.txt` starts at S250; `union-ids.txt` is S001–S249. The staged rows themselves (`/home/vgpnk/Projects/shokuknow/merge/tabi/SOURCES.append.md` rows 9–10) assign **different sources** to S104/S105 (Chrome DevTools agent Configuration; auto-connect). The lane's S104/S105 (web.dev bfcache; Page.pdl) will shadow the staged rows when shokuknow merges.
- `ScoutCollisionIds.md` (`:34-37`, `:42`) defines "no collision" only against the committed lane registry and states the staged rows are out of scope. The lesson's "candidate ids S104/S105 free (…assimilation/)" does not reflect this; the artifact the lesson cites says the next free ids are S250+, not S104/S105. This is an honesty gap in the gate-table prose (the two SOURCES rows are fresh vs the registry but reuse ids staged by the expansion corpus).

### MED-1 — M1's "31 mismatches / 24 superseded" is not reproducible; "eight script names" is wrong
- Pre-fix counter (`f6f7f45:scripts/check-selfassessment.mjs` — the pre-`b973fde` version) run in the scratch clone:
  - `--rev f6f7f45` → mismatches 27, superseded 22 (89 could-not-evaluate).
  - `--rev b973fde` → mismatches 22, superseded 26.
  - `--rev ad125e8` → mismatches 23, superseded 38 (82 could-not-evaluate).
  - None of the committed revisions produce 31/24. The "first tip run" number is quoted verbatim from the fleet report (`.ufo/reports/round-24/tabi.md:71-72`) with no captured receipt; I could not reproduce it on any committed revision. The defect *class* (section-wide cross-product) does reproduce: at `ad125e8` line 1192 pairs check-sources (26) against `round-evidence-audit` (13), `check-adjacency` (57), `check-measurement-binding` (76), etc.
- "eight script names × eight tally lines": the corrections block's prologue itself names `scripts/check-selfassessment.mjs` as a ninth script name (it is a tally line's own subject at `:1192`), so the section carries 9 script names × 8 tally lines = 72 pairs, not 64. The "eight × eight" framing undercounts the cross-product.

### MED-2 — S105 "82548 bytes decoded" is wrong; S104 quote is not verbatim in the committed bytes
- `corpus/evidence/round-24/sources/page.pdl` is 61,911 bytes (1,795 lines), sha256 `e944a3b1…`; 82,548 is the base64 transfer size (61,911 × 4/3 = 82,548). The lesson's Gate row and the SOURCES S105 row both say "82548 bytes decoded". (Live file is being corrected to "61911 bytes decoded from a 82548-byte base64 transfer".)
- The S104 quote at "line 2531" is not present verbatim: the committed byte at line 2531 is `Loading the previous page is <em>essentially instant</em>, because …` — the lesson's string (no `<em>`) does not `grep` in the bytes (exit 1). Quote is de-markup'd, not byte-exact. Same issue in the entry's §1 blockquote. Line numbers themselves are correct (2531, 1345, 1706, 1713, 2893, 2511 all verified).

### MED-3 — claims.json frozen "before: 4" disagrees with the measured 5; revisions block is empty
- `claims.json` C2 `before: 4` ("three stale `--selftest` 12/12 figures … one unlanded-path mismatch"); the shipped counter measures 5 (four m1: `:410` check-sources 25→26 plus `:1138/1139/1151` 12→13; one m3). `c2-baseline.json` and `c2-measurements.json` record 5. The lesson and SCORECARD correctly say 5→0, but the frozen claim value (4) is never reconciled; `claims.json` `revisions` is empty, so the revision of the before-value is undisclosed.

### MED-4 — M2's evidence command does not reproduce
- Lesson M2: "`grep -c 'CASE'` → 13". `grep -c 'CASE' scripts/check-selfassessment.mjs` → **4** at both tip and `f6f7f45` (the "CASE" hits are the comment, the CASES constant, and two loop/console lines). The 13 comes from `--selftest` output (`cases=13 passed=13`), not from that grep. The stated command is wrong; the underlying claim (SKILL row said cases=12, corrected to 13) is true (verified at `f6f7f45` and tip).

### LOW-1 — citations that do not resolve as written
- "Census: `scripts/sources-census.sh validate --root … tabi`": `scripts/sources-census.sh` does not exist in the lane (verified `git ls-tree -r ad125e8` and `find`); the script lives at `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh` (fleet repo). The cens's exit-0/103-rows/16-W04 claims do reproduce when run correctly (fleet root + lane).
- M1 "Raw run: the `mismatches=31 superseded=24` output quoted in the round report's Work performed": `.ufo/reports/round-24/tabi.md` has a "Work performed" section (line 8) and the 31/24 sentence (`:71-72`), but the quoted "`mismatches=31 superseded=24` output" string does not appear there; the report writes it as prose ("produced 31 mismatches, 24 'superseded'"). No raw JSON receipt of the 31/24 run is committed anywhere I could find.

### LOW-2 — minor counts
- Corrections row "the composition (66 empty numeric files …)" vs the verifier's own classification (67 empty numeric-named files) — the lesson's committed Com is 67 (the 66 figure existed in an earlier worktree state; the live file already says 67). 66+4+2+1 = 73 < 89; the remainder is untracked seat scratch (deleted), consistent but not enumerated.
- "Four lane self-tests rewrite tracked receipts" (`corpus/evidence/round-19/selftests/{c1,c3,isolation,c2}.json`): files exist and are committed; the receipts are webmcp-validation/invoke-counter receipts. The w1 prototype observed the three of them modified mid-wave (`ExecMismatchProto.md:37`). No current `scripts/check-*.mjs` writes them; the claim is a mid-wave observation, not reproducible from the tip's own code paths — recorded as carried, not verified mechanically here.

## Verified true (sweep)
- Baseline `<573c99e…>` exists; tip `ad125e8…`; all cited commits (`43e9bb5`, `9e52cb2`, `7ac9fff`, `03c1b4d`, `c90dffd`) exist and match the described roles.
- 1,034 committed scratch paths / 25.7 MB at `573c99e`; 0 at tip; `.gitignore:5` carries `.ufo/waves/*/scratch/`; deletion commit `9e52cb2` removes 1,035 paths (1,034 scratch + empty `w2-record.err`); cited scratch blob resolves at `573c99e`.
- Auditor evidence-keyed matrix reproduces: `--selftest --rev 03c1b4d… --round 22 --round-cap 128` → baselineFindings 7, classes 6, cases 6, passed 6, clean (matches the "Not corrected, because it reproduces" block; the wave-1 prototype 4/3/3-of-6 is a genuine prototype divergence).
- `check-sources --self-test` → cases=26; `check-freshness --self-test` → cases=12; `check-selfassessment --selftest` → cases=13 passed=13, case `m1-ambiguous-association-is-not-counted` present, cases=13; `check-gate-registry --selftest` → cases=22 passed=22; tip gates: nonconformant 0 (14 gates), mismatches 0 on a clean tree.
- C1: baseline 3 nonconformant (`e1-missing-row` for check-adjacency, check-measurement-binding, round-evidence-audit) → tip 0; c1 receipts agree.
- Census tip/baseline: 103 → 105 rows, 16 W04 warnings both, no new duplicate URL, exit 0 (reproduced on a scratched baseline fleet root and on the live lane).
- SKILL §"Round 24 — gate registry conformance" exists; the restated canonical rows carry the eight fields; `selfassessment-counter` row now says cases=13 passed=13.
- SCORECARD `:410`, `:1138`, `:1139`, `:1151` stale figures + the corrections block are present; the counter reports them superseded (5 at tip).
- `before.exit` 1 at `03c1b4d` → 128 at `7ac9fff`/`c90dffd`/`573c99e` (defect 5 "does not reproduce" verified).
- LOG.md:1664 reads 12/12 and is bound to `03c1b4d` (post-landing corrections block follows) — the Open/carried item is accurate.
- "Assimilation: none" is in the round report (`:152-153`); entry file exists and cites both rows.
- `--disable-back-forward-cache` history (round-17 probes) supports the entry's U1/U2 framing.

## Residual risk / verification gaps
- The 31/24 M1 count: could not be reproduced on any committed revision; no committed raw receipt exists. If it was a mid-session worktree state, the lesson should say the raw output is unreproducible rather than quoting it as evidence.
- The m3/clean-tree coupling makes C2's "0" a property of a clean checkout, not of the revision; this is under-disclosed.
- S104/S105 id reuse vs shokuknow staged rows is an un-merged risk; the collision check's published verdict is registry-only.
- Baseline census run used the live census script (fleet) against a scratch baseline tree; exit 0 reproduced. The "at round start" wording (script state at baseline) is not distinguishable from a current-script run.

## Tooling installed
None (no installs/updates performed; node gates run from the existing repo; census ran from the existing fleet script).
