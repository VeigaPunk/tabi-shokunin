# RevLesson — round-31 lesson review (a2w1 falsify, seat RevLesson-2)

**Verdict — the lesson holds on all four reviewed sections, with one minor pointer defect and one adjacent (non-lesson) inconsistency.** Every Gate row was re-verified against primary bytes: all four receipts' URLs, UTC times, HTTP statuses, byte counts and full sha256 digests match the committed bytes files and the registry rows; all 22 quoted spans (4 Gate rows + 18 further spans) are located in the receipt bytes at exactly the cited lines with exactly the claimed word counts (12/25/13/9 for the Gate rows, all ≤25). The selection note matches the w1 drafts and the landed entry row-for-row: all 13 entry rows D1–D13 are verbatim copies (quote + source id) of the mapped kept draft rows, every dropped draft row is accounted for with the stated reason, and the kept/dropped split (5 S119 + 6 S121 + 2 S122; S120 prose-only) is exact. The Assimilation paragraph is accurate against w1/RevAssimDecision.md and the committed assimilation artifacts (118/148/17 ids, 38-row slice, register sha re-hashed unchanged), and the S126-refusal-continuation framing matches the reviewer's closure conditions. The Mistakes section is structurally correct (10 `| M` rows = 10 `### M` subsections, M1–M10, one "Able to fail" bullet each) and substantively accurate: 64/92 backticked pointers resolve mechanically at the lane tip and the rest are shorthands that resolve against their antecedents — except M4's subsection, which cites `scripts/check-gate-mutants.mjs:143` for a line that is actually at `:142` (the M4 table row and M8 say 142 correctly). M10 states the wave-1 counter holes accurately (checked against CritC1Axis.md Q2, pad-live.json, CritC1Counter.md A1–A6). The "Corrections to freeze-time receipts" section is verified, including the T0-tree claim, which I reproduced by tree surgery: the root tree of the freeze commit minus `.ufo/waves/round-31` is exactly `192b06438ee03341904242d8e218f5ee80a307cc`.

Reviewed file: `corpus/lessons/round-31.md` at `486048356f0712e4396588c9dab58cd419243120` (clean scratch clone, porcelain empty). Wave-1 artifacts cited by the lesson resolve at the lane tip `ae15a37ee8aa43964179a676a087604368cd1c41` (the salvage commit that committed the w1 reports); they are not in the tree at 4860483 — see Observation O-4.

## 1. Gate — holds

Receipts: `corpus/evidence/round-31/decision-table/S119.json`…`S122.json` + `bytes/`.

| check | S119 | S120 | S121 | S122 |
|---|---|---|---|---|
| URL matches receipt JSON + SOURCES row | ✓ | ✓ | ✓ | ✓ |
| receipt fetched_at (Gate "receipt FetchS…") | 08:36:13Z ✓ | 08:36:10Z ✓ | 08:36:16Z ✓ | 08:36:21Z ✓ |
| ScribeSourcesRows access 08:36:21Z (Gate "accessed") | ✓ | ✓ | ✓ | ✓ |
| HTTP 200 | ✓ | ✓ | ✓ | ✓ |
| byte count (25,265 / 17,164 / 337,116 / 328,088) | ✓ | ✓ | ✓ | ✓ |
| sha256 bytes == receipt JSON == Gate prefix | f633915d…b207 ✓ | f6d55d1b…6e58 ✓ | 3a33f87b…f755 ✓ | b15c1c0b…a33e ✓ |
| Gate quote in bytes at cited lines, word count exact | 377-378, 12 w ✓ | 137-139, 25 w ✓ | line 67, 13 w ✓ | line 51, 9 w ✓ |

- All 22 spans verified by script (`check_quotes.py`, exit 0, FAILS: 0): normalized-substring presence in the receipt bytes and containment in the cited line window; RFC quotes wrap across the cited line ranges (377-378, 384-385, 137-139) and sit inside them; HTML quotes found at the exact cited lines (e.g. S121:67, S122:51). Every claimed word count matches (12, 25, 13, 9, 17, 10, 11, 2, 13, 12, 8, 19, 8, 8, 20, 10).
- S121's dual-identity disclosure is accurate: ScribeSourcesRows.md:25 records its own fetch at 08:36:21Z, 337,116 B, sha256 `ae5e1812e43a380b…6084c18` (same byte count, different raw sha than the receipt) — the Gate's "raw bytes differ per response, normalised text identical" is exactly what the artifacts show. For S119/S120/S122 the registry seat's own fetch is byte-identical to the receipt (same sha, same 08:36:21Z) — ScribeSourcesRows.md rows 24/26/27.
- "Fetched twice per receipt seat": FetchS119.md — two GETs 63 s apart, byte-identical (fetch table rows 1/2); FetchS121.md — two fetches, identical normalised text (15,503 chars); FetchS122.md — two GETs 89 s apart, byte-identical (`cmp` exit 0); FetchS120.md — two fetch rows.
- "Re-fetched three times 130 s apart by w1 ExecLiveStability with identical normalised text": `ExecLiveStability/live-stability.tsv` — 3 fetches per page at 08:38:05/08:40:15/08:42:26 (130 s / 131 s gaps), `norm_eq_f1` = yes on all 12 rows, raw sha for the RFCs identical to the receipt.
- Registry rows: SOURCES.md:133-136 — tier A, status `mined`, used-by `corpus/knowledge/rate-signal-decision-table.md` (last column verified for all four), recheck cells 365d/365d/90d/90d — matching the lesson's Status section ("365d for the RFCs, 90d for the GitHub pages").
- "S120 sources no row … cited in the entry's prose for §4 and §7.2": entry has no S120 row (verified by row extraction) and carries both prose citations.

## 2. Selection note — holds

Mechanical match (`check_entry_rows.py`, exit 0, FAILS: 0): every entry row is a verbatim copy (quote + source id) of the mapped kept draft row, and every quote is located in its source's receipt bytes.

| entry row | ← draft row | verbatim+src | quote in bytes |
|---|---|---|---|
| D1 | ScribeRowsRobots D1 | ✓ | ✓ |
| D2 | ScribeRowsRobots D3 | ✓ | ✓ |
| D3 | ScribeRowsRobots D4 | ✓ | ✓ |
| D4 | ScribeRowsRobots D5 | ✓ | ✓ |
| D5 | ScribeRowsRobots D6 | ✓ | ✓ |
| D6 | ScribeRowsGitHubLimits D1 | ✓ | ✓ |
| D7 | ScribeRowsGitHubLimits D2 | ✓ | ✓ |
| D8 | ScribeRowsGitHubLimits D3 | ✓ | ✓ |
| D9 | ScribeRowsGitHubLimits D7 | ✓ | ✓ |
| D10 | ScribeRowsGitHubLimits D8 | ✓ | ✓ |
| D11 | ScribeRowsGitHubLimits D9 | ✓ | ✓ |
| D12 | ScribeRowsGitHubPractice D1 | ✓ | ✓ |
| D13 | ScribeRowsGitHubPractice D3 | ✓ | ✓ |

- Robots D2 dropped "as a second row on one number": the draft's D2 quotes the *other* five-redirect sentence ("…reached within five consecutive redirects … MUST be fetched, parsed, and its rules followed") — same bound, second row; the note's description is accurate.
- GitHubLimits drops match the reasons: D4 (installation minimum repeats 5,000 — draft D4 threshold `5,000 requests`, same number as kept D3), D5 (`GITHUB_TOKEN`, Actions-only), D6 (installation ceiling 12,500), D10 (content creation — outside an observation-only province), D11 (OAuth token minting), D12 (LFS). Retry D1/D2 dropped as specimen values — entry has no S120 row. Practice D2 dropped (same one-minute sentence kept once under S121 as entry D6).
- Practice D1 kept "as `stop`, 0 remaining": draft D1's decision was "wait"; entry D12 is `stop` with threshold `0 requests` — the note discloses the rewrite.
- `(derived)` marker: entry D7–D11 (declared limits) carry it; D6/D12/D13 (directives: "wait", "you should not make another request", "wait at least one second") do not — matches the note and the entry's own rule paragraph.
- Counts: 5 + 6 + 2 = 13 = D1–D13 ✓; "five from S119, six from S121, two from S122" ✓.

## 3. Assimilation (§10) — holds

Cross-checked against `.ufo/waves/round-31/w1/RevAssimDecision.md` (F-R1…F-R6) and the committed artifacts:

- Refusal continuation + URL identity (F-R1): paragraph states staged S126 stays refused, flip condition = register fix or operator ruling ✓; S121's URL is the staged S126 URL, opened by document with own fetch/bytes/quotes ✓ (receipts verified in §1).
- Id drift recorded as routed, not self-cleared (F-R2): cites `.ufo/waves/round-27/w1/RevStagedProvenance.md:405-406` — pointer verified (S126/native-messaging drift content present).
- Id doctrine (F-R4): "staged S119–S122 are unrelated rows" — `assimilation/staged-ids` contains S119–S129; RevAssimDecision O6/F-R4: staged S121/S122 are Chromium json5 rows ✓. "Numbering is the lane's own append order, by document" ✓.
- Numbers re-measured: `reg-ids` = 118 lines ✓; `staged-ids` = 148 ✓; `collisions` = 17 ids, S102–S118 ✓; `quarantine-slice` = 38 rows ✓; register sha256 re-hashed today: `5afe1810a6c3d62f37987b575a954f5b1197daa23005d4bb2f1d982f64bad833` = `5afe1810…d833` unchanged ✓.
- Guard proof: `.ufo/waves/round-31/w1/ExecAssimGuard/guard-proof.txt` — WIDE `^ {0,3}\|…S[0-9]{3,}` vs NARROW column-zero patterns with the indented `  | S102 |` fixture ✓ (the paragraph's example is the fixture's literal text).
- Class distinction (F-R5): S187/S199 as campaign-local work files, S203 a different document ✓ (matches RevAssimDecision).

## 4. Mistakes — holds, one minor pointer defect

**Structure:** 10 `| M` table rows = 10 `### M` subsections, ids M1–M10 in both ✓; 10 "Able to fail" bullets ✓.

**Pointer resolution** (`check_pointers.py`): 64/92 backticked path tokens resolve mechanically (file exists, cited line within file length) against lane root / `.ufo/waves/round-31[/baseline|/measure]` / `.ufo/waves/round-30[/w2]`. The 28 non-mechanical tokens are: git/grep commands (not pointers), shorthands that resolve against their antecedent (`:143`, `:152`, `:167`, `rfc9309.txt:384-385`, `rfc6585.txt:145`, `gh-*.html`, `rejected.md`, `.exit`, `adjacency.tsv`, `external-class-fixture-v2.md:510`, `w1/CritC1Axis/*`) — all verified to exist — and the six bare `receipts/…` tokens, which exist under `.ufo/waves/round-31/w1/ScribeLessonMistakes/receipts/` but are cited without naming that seat dir (cosmetic, D-c below).

**Content spot-checks of load-bearing pointers (all verified):**
- M1: `scripts/check-selfassessment.mjs:172-179` carries the `…_SELFTEST` summary-line anchor; regression case `v2-oracle-reads-summary-line-not-first-cases-token` at `:685-693`; `baseline/m8-proof/old-oracle-selftest.txt` reads `cases=29 passed=28`, exit 3, with the single FAIL line exactly as quoted (`CASE id=v2-oracle-reads-summary-line-not-first-cases-token expected_exit=0 exit=1 expected=- actual=m1-selftest-tally FAIL`, line 21); `old-oracle.mjs` sha256 = `bfc9682b692339acfd1647bbddca7a1569c1410968aa742ad2ae8e5ed3962855` ✓; `receipts/frozen-vs-old-oracle.diff` = 6 hunks, 19 removed / 9 added, drops `lineOnly` (3 hits) and deletes `v2-readme-no-section-fallback` (1 hit) ✓ — the Limit paragraph's three-change-revert description is exact. Round-30's own row `corpus/lessons/round-30.md:344` is the round-30 M8 row covering the same m1 misread ✓.
- M2: `git show 96a2d1a3:scripts/check-selfassessment.mjs` — `readBlob(repo, rev,` at :402 (`"SCORECARD.md"`) and :405 (`"LOG.md"`), and the only `SKILL.md`/`corpus/README.md` strings at :606/:617 (fixture receipts) ✓ (`receipts/baseline-window-absence.txt` reproduces exactly this); the nine stale tallies match `receipts/t0-mismatch-set.txt` line-for-line (claimed/observed pairs identical, `couldNotEvaluate 103`); `baseline/c2-J1-do-nothing.json` mismatches 9 + `.exit` `exit=1` ✓; superseding figures present at baseline (`96a2d1a3` SCORECARD:1192 sources 26, :1465 selfassessment 22) ✓.
- M3: `SCORECARD.md:1523` carries the stale "mismatches 0" sentence ✓; `git grep -n 1523 9505a10 -- SCORECARD.md LOG.md SKILL.md corpus/README.md corpus/QUALITY.md` → empty, exit 1 ✓ (`receipts/freeze-1523.txt`); the freeze commit appends `## Round 31 — corrections` (SCORECARD:1560) citing :1439/:1465/:1486 and SKILL.md:2578 "Correction (round 31, supersedes `SKILL.md:2545`)" ✓ — "corrects :1439, :1465, :1486 and SKILL.md:2545 only" is exact; at REV `grep -c 'SCORECARD.md:1523' SCORECARD.md` = 1 (the appended disposition correction, SCORECARD:1566 section) — the able-to-fail check passes.
- M4: `check-frontier-admission.mjs:174` is literally `if (!/^(https:\/\/|file:\/\/)/.test(url)) return null;` and `:175` the `spawnSync("curl", ["-sS", "-L", …])` with no `-q`/proto pin ✓; `check-decision-table.mjs:194-213` hermetic curl ✓; case `live-offhost-redirect` at `:360` and in the frozen self-test receipt (`baseline/c1-counter-selftest.txt:30`: `CASE id=live-offhost-redirect expected_exit=1 exit=1 admitted=0 reason=l1-live PASS`) ✓; `check-selfassessment.mjs:167` env forward ✓; QUALITY.md ends at criterion `79.` at the freeze and `81.` at REV (80/81 appended under "## Round 31 additions") ✓. **Defect D-a:** the subsection (and its Able-to-fail bullet) cites `scripts/check-gate-mutants.mjs:143` for `const dir = join(work, runId)` — the actual line is **142**; the M4 table row (`:142,152`) and M8 (`:142`) are correct, so the lesson disagrees with itself by one line.
- M5: `MutC1Beyond.md:5` defect header (22 mutants beyond the catalogue), `:63` a kill pinned by reason only, `:70` "Fifteen new fault rows are available" ✓; `CritC1CasesPinsB.md:79-95` supersession-weakening defect section ✓; `CritC1CasesPinsA.md:52-66` prefix-only reason match (`f3-bytes absent-and-renamed` passes 29/29) ✓.
- M6: `CritC2Fabrication.md:177` label test, `:185` F2 (S116 refetch by the entry author), `:186` F3 (same git blob) ✓; red state `corpus/evidence/round-30/frontier/refetch/` holds the two labels (S116.json, S117.json) ✓.
- M7: `SKILL.md:2474` states `(cli_cases=36, helpers=4)` ✓; TALLY_PATTERNS `:122-127` uses `\bcases` ✓; `baseline/c2-T0-reading.json` contains no finding for line 2474 (0 hits) ✓; `ExecC2Oracle/oracle.tsv` data-row 2 is the aria row with "oracle could-not-evaluate … cli_cases=36" ✓ (file line 3; header is row 1); `receipts/oracle-coverage-rows.tsv` carries the same row ✓; gate prints the shape at `check-aria-metadata.mjs:2983-2986` (clean) and `:2320` (blocked, `cli_cases=0`) ✓.
- M8: claims.json has exactly ten controls (C1 J1–J5, C2 J1–J4 + gateEditJunk), all work-fixtures ✓; round-30 M7 at `corpus/lessons/round-30.md:297` asks verbatim for "one junk per observable before freezing" ✓.
- M9: `ConnFrontierConsistency.md:25-40` lists the six defects with the same line pointers the lesson repeats ✓; at REV `corpus/README.md:37` reads "(C2–C6)", `:644` "C3 and C6", `:182` the canonical label ✓; `adjacency.tsv` row 6 has `ruling_ref` = `-` and mid-sentence truncated quote cells ✓; `PolicyBoundaries.md:27` exists ✓; the reader-facing grep red state returns hits (`README.md:216` carries the drifted label) ✓.
- M10 — accurate against wave 1: CritC1Axis.md Q2 (line 22, verdict "defect (high)") built the pad control "in a scratch clone at the freeze commit (`9505a10e…`, counter sha256 `d15f3bd7…` = `frozenDigests`)": ten rows, all the same RFC 9309 quote (the 12-word "The crawlers SHOULD follow at least five consecutive redirects…" sentence), same threshold `5 redirects`, one new registry row S119; `CritC1Axis/pad-live.json`: `live: true`, population 10, admitted 10, failing 0, clean ✓. CritC1Counter A1–A6 match the lesson's list exactly: A1 unit mismatch (60 requests quoted, Threshold `60 days`), A2 inverted bound ("No more than 90 seconds" vs Threshold `at least 90 seconds`), A3 status code `429` as threshold, A4 pronoun "one" → 1, A5 RFC number 6585, A6 TOC section number 2.2 — all admitted live ✓. "n1 compares only the numeric token … only the row id is unique" matches CritC1Counter.md:7/:69 ✓. The mitigation paragraph (row-by-row wave-2 reading as evidence beside the counter) matches the entry's QUALITY-80 framing ✓.

**"Corrections to freeze-time receipts" — verified:**
- `baseline/README-receipts.md` m8-proof row says "28/30"; the receipt says `cases=29 passed=28` ✓ (the discrepancy the section corrects is real); MutC2Counter.md:30 — m3 `m3-lineonly-ignored` KILLED by `v2-readme-no-section-fallback` ✓.
- `c2-T0-reading.json` names `befe2a3f96f451e1fe797c3cab5f4c8dcf670f99`; `git cat-file -t` in the lane fails ("could not get object info") ✓ not a lane commit. **Tree equality reproduced:** rebuilding the freeze commit's root tree with `.ufo/waves/round-31` removed (git mktree over `9505a10^{tree}` → `.ufo` → `.ufo/waves` chains) yields `192b06438ee03341904242d8e218f5ee80a307cc` — exact match; the tree object exists in the lane and no lane commit carries it (`git log --all --format='%H %T'` finds none) — exactly as the section states.

## Defects

- **D-a (minor, in the lesson) — M4 subsection off-by-one.** `corpus/lessons/round-31.md` M4 subsection evidence and Able-to-fail bullets cite `scripts/check-gate-mutants.mjs:143` for `const dir = join(work, runId)`; grep shows that line at **:142** (`152:    env: { ...process.env, … }` is correct). The M4 table row and M8 evidence cite :142 — internal inconsistency; a reader following the subsection lands one line early.
- **D-b (minor, adjacent — the entry, not the lesson) — recheck cadence contradiction.** Entry `corpus/knowledge/rate-signal-decision-table.md` header: "recheck: **180d** for S119 and S120 …; 90d for S121 and S122". Registry SOURCES.md:133-134: S119/S120 recheck **365d**; :135-136: 90d. The lesson's Status section states 365d/90d and is accurate against the registry; the entry header contradicts it. Flagged for the entry's owner seat; the lesson needs no change.
- **D-c (cosmetic) — bare `receipts/…` pointers.** The six receipt files exist only under `.ufo/waves/round-31/w1/ScribeLessonMistakes/receipts/`; the lesson cites them as `receipts/<name>` without the seat dir. All six verified present with the claimed content.

## Observations (not defects)

- **O-1:** "130 s apart" for the ExecLiveStability refetches — actual gaps 130 s and 131 s (rounding).
- **O-2:** M9's item-label list reproduces ConnFrontierConsistency.md:25-40 verbatim, including that report's label variants ("rate/rights real-site records" at README:216/PROVINCE:10; shortened "real-site rate/rights" forms at :282-285/:302-305/:331-332) — the variation is the drift being described, and the lesson attributes the list to the round-30 report.
- **O-3:** M2's Limit wording "hits only PATH/HOME filtering, git config pinning, TMPDIR setting and fixture spawns" — the 9505a10 `process.env` grep hits fall into those categories (plus NODE_PATH loops / GIT_-prefix filtering in fixture scripts); no hit reads a tally from an ambient variable, so the Limit's conclusion (env forward latent, not exploited) holds.
- **O-4:** The w1 artifacts the lesson cites (CritC1Axis.md, CritC1Counter.md, ExecC2Oracle/, FetchS*/…, ScribeLessonMistakes/receipts/) are not in the tree at the reviewed rev 4860483; they were committed by the salvage commit ae15a37 (`git ls-tree` count at 4860483: 0 for those paths; present at ae15a37 and in the working tree). Pointers resolve at the lane tip and will resolve at closure; a reader at 4860483 alone cannot follow them.

## Commands and exit codes

```
S=/fast/scratch/hyaku/tabi-r31/RevLesson
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone" && \
  git -C "$S/clone" checkout -q 486048356f0712e4396588c9dab58cd419243120   # exit 0; HEAD = 4860483; porcelain empty
sha256sum …/bytes/S119.txt S120.txt S121.html S122.html                    # exit 0; all four == receipt JSONs
python3 $S/check_quotes.py        # exit 0, "FAILS: 0"  (22/22 spans located, word counts exact)
python3 $S/check_pointers.py      # exit 0, 64 resolved / 28 shorthand (triaged above)
python3 $S/check_content.py       # exit 0, 6 FAILs → all adjudicated as checker assumptions except D-a
python3 $S/check_entry_rows.py    # exit 0, "FAILS: 0"  (13/13 entry rows verbatim vs drafts, in bytes)
grep -c '^| M' / …/^### M …       # 10 / 10
git -C "$S/clone" diff --numstat 96a2d1a3 4860483 -- corpus/SOURCES.md     # 4 0 (append-only)
grep -c 'SCORECARD.md:1523' SCORECARD.md                                  # 1
git -C "$S/clone" grep -n 1523 9505a10 -- SCORECARD.md LOG.md SKILL.md corpus/README.md corpus/QUALITY.md   # exit 1, empty
git -C "$S/clone" cat-file -t befe2a3f96f451e1fe797c3cab5f4c8dcf670f99     # fatal (not a lane object) — as stated
git -C "$S/clone" cat-file -t 192b06438ee03341904242d8e218f5ee80a307cc     # tree
git mktree chain over 9505a10^{tree} minus .ufo/waves/round-31            # = 192b06438ee03341904242d8e218f5ee80a307cc (exact)
sha256sum /home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md
  # 5afe1810a6c3d62f37987b575a954f5b1197daa23005d4bb2f1d982f64bad833 (read-only)
```

No tool was installed or upgraded (none needed); no pacman transaction; no subagent dispatched; no lane tracked file, index or jj state written; scratch under `/fast/scratch/hyaku/tabi-r31/RevLesson/` (clone + check scripts, copied to the output dir). No network fetch was made by this seat (all Gate verification is against committed bytes; the live-page predicate belongs to the C1 counter seats).
