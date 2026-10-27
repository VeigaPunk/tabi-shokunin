# Round 29 verifier spot-check

author: hyaku closure (non-author integrator, @m_opus)

Lane round: tabi 29. Before `856fa9e1202179f5cfbd28c1f0efdd4eb1f426bb` → after `f36caf6a12faa14e33ff27efabe09f7d6c1324df`.
Driver digest (`.ufo/watchdog.log`, copied at closure; lines 1465 and 1479 when read):
`2026-10-26T01:05:45-03:00 launch tabi round=29 pgid=25028 driver=hyaku-inline attempt=1`;
`2026-10-26T02:49:05-03:00 complete tabi round=29; hyaku-inline attempt=1`.

## Conformance

- The report `.ufo/reports/round-29/tabi.md` was committed by `tabi-shokunin <tabi@shokunin.local>` in fleet commit `7207ff0b8ad9e16d2f32137146faa6911c86106b` (2026-10-26T02:48:29-03:00). That is after the last lane commit (`f36caf6`, 02:46:51) and before the driver logged completion. The report has a `## SHONEN` heading with four `[~]` lines, one per box; `SHONEN.md` has 4 boxes.
- I checked all 11 cited lane hashes and the baseline (`97be89bc`, `190052c9`, `59e8167a`, `35045d7d`, `32008a45`, `e1e3a15f`, `9cc92b08`, `ab080992`, `dcfb7a3c`, `2cb31aa6`, `f36caf6a`, plus `856fa9e1`). For each, `git cat-file -t` → `commit` and `git merge-base --is-ancestor <hash> refs/heads/master` holds. Every commit in `856fa9e..f36caf6` is authored by `tabi-shokunin`.
- `scripts/hyaku/jj-lane.sh state` → `branch=master local=f36caf6a… remote=f36caf6a… ahead=0 behind=0 head=detached tracked=0 untracked=0`. `git status --porcelain` → 0 lines. `git ls-remote origin refs/heads/master` → `f36caf6a…`.
- The prompt `.ufo/prompts/tabi-round-29.md` was committed in `9b8717e1`. Its lines 1–140 differ from `kimi-shokunin/templates/round-prompt.md` only in filled placeholders (`diff` shows 22 changed lines, all `{{…}}` substitutions). It contains sections 1–5, the L2 floor, push scope, the L0 channel and the five child-lane items, followed by hyaku addendum §6.
- Wave accounting: `w1-results.json` has `seats=44` and 44 results; `w2-results.json` has `seats=39` and 39 results. Every result name has a `w1/<name>.md` or `w2/<name>.md` report: a loop over `.results[].name` found no missing file. This fixes round-28 routed defect 4.
- Census: I ran `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` at closure. It exited 0 with `tabi ok`, 18 W04 duplicate-URL warnings (16 pre-existing, plus S114 and S115). Its stdout is byte-identical to the committed `.ufo/waves/round-29/measure/census-end.txt` apart from the capture's trailing `exit=0` line. This fixes round-28 routed defect 5.
- Defects (status-neutral): none at the step-1 level. Content defects are listed under routed defects below.

## Claim re-checks

Gate standard (Closure consequence) applies: all three claims rest on lane-owned counters or self-tests (`check-s106-evidence.mjs`, `check-selfassessment.mjs`, `check-release-pins.mjs`). I did **not** execute any lane script. Each claim is **evidence-verified**: I checked the committed self-test tallies, the counter outputs, the revision each was measured at and the counter digests. Each claim is also **re-measured** by plain git/sha256sum/grep/curl re-derivation over committed bytes and live sources. Four read-only non-author seats I dispatched (C1, C2, C3, discernment) ran these checks. Their outputs are summarised below.

### C1 operability — s106 self-test repair (exit 1 ReferenceError → clean 7/7)

- `git diff 856fa9e f36caf6 -- scripts/check-s106-evidence.mjs` (+15/−4), static read:
  - The `existsSync` import is added (after:38). Before, it was used at :267 without being imported.
  - The runner's hard-coded `out[c.field] === false` (before:301) becomes `out[c.field] === c.fieldValue`, guarded by `hasOwnProperty` (after:307-312). `fieldValue` is `true` for match and `false` for mismatch/sha/anchor.
  - The mismatch fixture now commits its receipt (`d.commit()` at after:203).
  - Case ids: 7 → the same 7, including both revision cases.
- `sha256(git show <rev>:scripts/check-s106-evidence.mjs)` = `1a01256e…5eb3` at both `ab080992` and `f36caf6`. `git diff ab080992 f36caf6 -- scripts/` is empty, so the measured revision equals the tip for this script.
- Committed evidence:
  - `baseline/s106-selftest.txt` (`97be89b`): `ReferenceError: existsSync is not defined` at :267, `exit=1`, no tally. Line 267 matches only the 856fa9e bytes.
  - `measure/c1-s106-selftest.txt` (`dcfb7a3`): `S106_SELFTEST verdict=clean cases=7 passed=7`, `exit=0`.
  - `measure/c1-s106-rev.json.txt`: `rev ab080992…`, `valid: true`, `revision_match: true`.
  - `corpus/evidence/round-29/s106-selftest/mutation.txt`: the mutant replaces the revision comparison with `true` and gives `measured-revision-bytes-mismatch … FAIL`, `verdict=failed cases=7 passed=6`, exit 3. Its diff's pre-image context matches the committed script byte-for-byte.
  - Junk control `baseline/c1-control-case-deletion.txt`: clean 5/5. It misses the frozen N≥7 target, as declared.
- Plain re-derivation of the production inputs at `ab080992`: `sha256(corpus/evidence/round-26/sources/content-features-154.0.8037.97.cc)` = `9b93fe64…6c44`, 73952 bytes. This equals the receipt values and is the same at `measured_rev` `0c666adc…`. The anchor is at line 187 and `grep -c` → 1.
- The SKILL.md round-29 registry row records `cases=7, passed=7`, which matches the observed capture.
- Disclosed gaps that still remain: the sha-drop, anchor-uniqueness and byte-count mutants survive (`w1/MutC1Baseline.md` §5-6).
- **Verdict: improved** (verifies: before and after both evidenced; the repair is shown able to fail).

### C2 calibration — self-assessment mismatches 6 → 0 under a doc-bound counter

- The counter digest is `728128008e22…60c4` (frozen) at `97be89bc`, `ab080992`, `2cb31aa6` and `f36caf6`.
- Static read of `citesLine(text, doc, line)` (:269-276): it returns false when the cited `<DOC>.md` differs from the finding's document, so a `SCORECARD.md:N` citation cannot clear a `LOG.md:N` finding. This fixes round-28 routed defect 3.
- Before: `baseline/c2-before-frozen-counter-cleanbase.json.txt` (rev 856fa9e) reports `mismatches: 6`: `SCORECARD.md:410`, `:1138`, `:1139`, `:1151`, `:1439` and `LOG.md:221`.
- Controls:
  - Red-before self-test: 20/22, with exactly the two cross-document cases failing.
  - After the fix: 22/22.
  - Cross-document junk control: the old counter gives 0 and the frozen counter gives 6.
- Plain re-derivation:
  - `git diff 856fa9e f36caf6 -- SCORECARD.md LOG.md` has 0 deletion lines (+45/+37), so the change is append-only.
  - All 6 stale lines are byte-identical at unchanged line numbers.
  - Each stale line has a same-document correction stating the observed tally: `SCORECARD.md:1463` → `:410` (26/26); `:1464` → `:1138-1139`, `:1151` (13/13); `:1465` → `:1439` (22/22); `LOG.md:2007` "Correction (supersedes LOG.md:221)" with `cases: 12`.
- After:
  - `measure/c2-selfassessment-rev.json.txt` at `ab080992`: `mismatches=0`, `counted=[]`.
  - `measure/c2-selfassessment-rev-ledger-tip.json.txt` at `2cb31aa6`: `mismatches=0`.
  - `2cb31aa..f36caf6` touches only those two measure files, so the reading carries over to the tip.
  - The bytes added after `ab080992` (the ledger paragraph) contain no tally shapes.
- The disclosed before-value provenance issue (5 in-tree vs 6 in a clean clone) does not affect the claim. The frozen predicate specifies the clean-checkout reading, and the target is 0.
- **Verdict: improved**. The SCORECARD score stays 9; the count moved 6 → 0.

### C3 freshness — 23 on-release rows re-opened at Chromium 156.0.8078.47 (unresolved 23 → 0)

- The counter digest is `567637200b05…3770` at `97be89b`, `ab080992`, `2cb31aa6` and `f36caf6`. `git log 97be89b..f36caf6 -- scripts/check-release-pins.mjs` → no commits, so the counter was frozen before the data landed.
- Population as an id set:
  - The counter's rule (source cell `refs/tags/<tag>` older than stable, `recheck == on-release`) applied to `SOURCES.md` at 856fa9e gives 23 ids. This set is identical to the receipt ids.
  - An anchor-inclusive rule gives 24 (adds S044, whose source cell is a devtools-frontend commit). The closure re-check found S044's live spans unchanged at the 156 devtools commit, so the exclusion hides coverage, not drift.
- Bytes: all 80 (row, tag, path) blobs at `f36caf6` match the receipt digests. `bytes/` holds 46 files (23 paths × 2 tags), and `refetch/` holds 23 records with the receipt ids.
- **Independent live refetch** (`curl …googlesource.com/…?format=TEXT | base64 -d | sha256sum`):
  - S033, S062 and S106 (holds) and S042, S080 and S100 (drifted) at both tags: 16 file×tag fetches, all HTTP 200, 16/16 equal to the receipt digests and the committed bytes.
  - An exact-substring span recomputation over all 23 rows gives holds=16 and drifted=7 {S042, S071, S078, S080, S081, S096, S100}, which is the reported set.
  - S094: the normalised live 156 body is byte-identical to the committed body.
- Trigger S108: a live `chromiumdash … fetch_releases?channel=Stable&platform=Linux&num=3` returns 1802 bytes, sha256 `90abf2c3…fe33`. This equals the committed `chromiumdash-stable-linux.json`. Element 0 is `version 156.0.8078.47`, `previous_version 155.0.8059.84`, and the chromium hash is `1d17a2e2…`, the commit named in S109–S115.
- S109–S115: each has `NF==13`, tier A and status `mined`. Each `teaches` opens with `supersedes S0NN —`, mapping S042→S109, S071→S110, S078→S111, S080→S112, S081→S113, S096→S114 and S100→S115 (the same as the receipt's `superseded_by`).
- Committed counter reading: `measure/c3-release-pins-rev.json.txt` (rev `ab080992`) and `c3-release-pins-ledger-tip.txt` (rev `2cb31aa6`) both give `population=23 resolved=23 unresolved=0 holds=16 drifted=7`, exit 0. The before reading `baseline/c3-before.json` gives unresolved=23.
- The counter's disclosed weaknesses still stand (receipt-derived re-fetch records, population as a count rather than an id set). The live refetch and the id-set comparison above settle the claim without relying on them.
- **Verdict: improved** (freshness 8 → 9 in SCORECARD).

### Other axes

`git diff 856fa9e f36caf6 -- SCORECARD.md` contains only appended lines (0 deletions) and no capability rows ("capabilities unchanged (gates are counters)"). `PROVINCE.md` and `SHONEN.md` did not change. Every corpus file change is an addition. The w2 sweep `w2/ExecNoHarm.md` found no gate that was green at baseline and red at the tip.

## Axis verdicts

| Axis | Verdict | Evidence |
|---|---|---|
| operability | improved | C1: self-test exit 1 ReferenceError → clean 7/7 (committed capture at `ab080992`, script byte-identical at tip); mutant 6/7 shows the repair can fail |
| calibration | improved | C2: frozen doc-bound counter 6 → 0; 6 same-document append-only corrections re-derived by plain grep |
| freshness | improved | C3: 23/23 rows resolved; 16 holds and 7 drifts recomputed from bytes; 16/16 live refetches equal the committed digests; S108 trigger live-identical |
| depth | unchanged | no claim; existing entries changed only by appended recheck notes |
| coverage | unchanged | no claim; the new summary entry is the C3 record (counted under the expansion trend) |
| adjacency | unchanged | `PROVINCE.md` unchanged; `w1/ConnSiblings.md` absorbed nothing |

**Admitted**: all three claims verify and no axis is harmed.

## Discernment spot-check

| Item | Decision | Re-opened source | Agree/disagree | Reason |
|---|---|---|---|---|
| S108 Chromium Dash Stable/Linux | admit | live `chromiumdash.appspot.com/fetch_releases?channel=Stable&platform=Linux&num=3` → 1802 bytes, sha256 `90abf2c3…fe33` | agree | Byte-identical to the committed capture. The Gate quote (element 0 `version 156.0.8078.47`, previous `155.0.8059.84`) appears verbatim once. A feed has no VCS revision, so a timestamp plus digest plus committed copy is the right anchor. |
| S111 `html_form_element.cc` @156 (supersedes S078) | admit | live Gitiles `?format=TEXT`, base64-decoded → sha256 `2a96a97b…6102`, 1761 lines | agree | The `:201-202` comment is verbatim and the `:207-208` message pieces are present. The decoded digest equals the anchor and the committed bytes. The tag resolves to `1d17a2e2…`. The quote is 17 words. |
| S109 / S112 / S113 @156 | admit | live Gitiles, decoded | agree | `:567`, `:46` and `:1077` are exact. Each digest equals its anchor. Quotes are 10, 2 and 5 words. |
| Reject: a 156-pinned row for each of the 16 holding rows | reject | `CORPUS.md` §SOURCES rule 4 ("Expansion is knowledge, not rows"); counter population `:178` | agree | A held row teaches nothing new, and the receipt is the re-verification record. The refusal is scope discipline and is labelled as such. |
| Reject: superseding row for S045 | reject (knowledge note instead) | frozen C3 predicate (`claims.json` at `97be89b`); counter `:249-252`; `SOURCES.md:59`; note `webmcp-invocation-round-17.md:146-148` | agree | S045's `teaches` is not falsified at 156; only its witness changed (`document.modelContext`). Supersession is required only for drifted rows. The flip condition is recorded. |

New-row quote check: for S108 and S111 (with S109, S112 and S113 as extra checks), each Gate quote is ≤25 words (`wc -w`: 1, 17, 10, 2, 5). Each quote is present at the stated location in the live decoded source. Each anchor names an exact line and revision. Census: `sources-census.sh validate … tabi` exits 0 with `tabi ok`.

## Trends

- Expansion: **improved**. `corpus/knowledge/chromium-156-release-pin-recheck.md` is a new admitted entry on ground the coverage map did not hold (the Chromium 156 source state, including the post-fill detached-document guard). It opens with `source:`/`verified-at:`/`recheck:` (lines 3–5). It cites S108–S115, all `mined`, and each of those rows lists the entry in `used-by`. The coverage map gains a row (`corpus/README.md:619-630`). Registry: 107 → 115 rows.
- Quality: **improved**. 23 stale-due rows were re-verified against live bytes. 7 drifted rows were superseded by stronger 156-pinned rows. The 7 citing entries and the S045 contract change are marked with appended notes. Wave-2 accuracy defects were corrected by errata. Nothing was found false and left unmarked.
- Discernment: **improved**. The outside sample agrees with the gate on admits and rejects. The round-28 closure's disagreements and this round's counter overreach became lessons M1, M2 and M4. The new QUALITY criteria 71–73 each cite them (`git show e1e3a15:corpus/QUALITY.md`, lines 383–399).

## Routed defects (tabi, next round)

1. `corpus/knowledge/chromium-156-release-pin-recheck.md:3` cites all 23 re-opened rows in `source:`, but their `used-by` cells omit the entry (e.g. `SOURCES.md:47` S033, `:55` S041, `:59` S045, `:85` S071, `:92` S078). Rule 2 allows an in-place `used-by` change logged old→new; append the path and log the change.
2. `corpus/lessons/round-29.md:20`: S114's Gate quote reuses S111's detached-document comment, which does not ground S114's `teaches` (the navigation sentinel). S110 and S115 likewise quote only the new guard. Add a quote that grounds each row's own `teaches`. S110/S115's quote "The document was detached while filling out the form" spans two C++ literals (`:207-208`) and is not a contiguous substring of the source; say so wherever it is quoted.
3. `corpus/lessons/round-29.md:48,57-59`: the "one row per mistake" table lists only M1–M3. M4 (`:226`) and M5 (`:243`) appear only as prose. Add their table rows.
4. `corpus/knowledge/chromium-156-release-pin-recheck.md:110` vs `:117`: the first errata bullet says the line shift is +10 and the later correction says 11. The later bullet is right and the earlier one still stands unmarked. Append a note marking `:110` superseded. Also: the S110 anchor "guard inserted at 201-209" describes a 10-line insertion whose guard block is 9 lines (201–209, blank line at 210). This is disclosed in the lesson; fix it when the row is next superseded.
5. Report and C3 predicate wording: "23 on-release rows pinned to 154.0.8037.97" does not name the population rule (the source cell carries a src tag). S044 and its same-URL twin S068 name the tag only through a DEPS-selected devtools commit and are silently excluded. Name the rule, and decide whether counter v2 should include DEPS-pinned rows.
6. S044's anchor cites `front_end/panels/application/WebMCPModel.ts:128-139, 249-258`. That path returns 404 at devtools `66df492…` and at `bf69d041…`; the file in that directory is `WebMCPView.ts`. This defect predates the round; correct it in a superseding row.
7. Carry-over from the lane's own disclosure: counter v2 for `check-release-pins.mjs` (an id-set population, fetch provenance for re-fetch records, complete span filing), and s106 self-test fixtures for sha-drop, anchor-uniqueness and byte-count (the surviving mutants in `w1/MutC1Baseline.md` §5-6).

## Operator note (SHONEN)

Boxes 1, 2 and 4 carry resolvable repo pointers (`SKILL.md:697`, `:1598-1617`, `:2532-2545`; `corpus/knowledge/multi-step-journey.md`; `PROVINCE.md:3-19`) that a non-author could check. Box 3 rests on 23 lane-dispatched seats running the procedure from item text alone; those seats are not non-author, so it still needs a non-author executor run. Promotion is operator-owned, and no `[x]` was written.
