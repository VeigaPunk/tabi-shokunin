# RevAddenda — round-30 w2 — append-only audit of the round-29 fixes at 072af95

## Verdict

Attacked the five-path append-only claim (`git diff 061e62024c0523d3c6c7e819506a773ff2cd7d75 072af95fe2822f0785a6ff88a578e2142dd258e5 -- corpus/lessons/round-29.md corpus/knowledge/chromium-156-release-pin-recheck.md corpus/knowledge/webmcp-invocation-round-17.md corpus/README.md corpus/QUALITY.md`) and the content of the appended round-29 fixes: the M4/M5 lesson rows against the §M4/§M5 prose, the chromium errata's +10→+11 correction and 9-line guard span against the committed 154/156 bytes, the S080/S081 citing fix, and the population-rule id lists against SOURCES.md and the counter's own parse. **Holds, with one minor defect.** The diff is genuinely additions-only (0 deletion lines); every M4/M5 line-number citation verifies against the 061e6202 bytes; the +11 headline, the guard 201-209 span, S080/S081 reciprocity, and the population rule (23 = the named 23, mirrored through the counter's own parse) all verify. The defect: the chromium errata places the first hunk's added line at `156:124` where the committed bytes put it at `156:**126**`, and its "+1 from 156:124" seam is false at 156:124-125 — contradicting the hunk header the errata itself quotes, and falling exactly in the span-arithmetic class criterion 78 (added in the same commit) polices. Three minor observations: S109-S115 (on-release, pinned *at* stable) are omitted from both exclusion enumerations; round-30.md has 6 mistake rows but only 4 subsections (criterion 77; outside my five paths); the round-30 w1 receipts the lesson/errata cite are not committed at 072af95 (they land at lane HEAD af0664e).

All reads were `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show/ls-tree/diff/grep/log` at pinned revisions (lane HEAD has moved to af0664e and the lane worktree is not clean, so nothing was read from the worktree). No lane file, index, or jj state was touched. No tools installed; no network fetches (all evidence is committed bytes); no C1/C2 counter runs (not this seat's claim).

## 1. Additions-only — HOLDS

```
git -C <lane> diff 061e6202 072af95 -- corpus/lessons/round-29.md \
  corpus/knowledge/chromium-156-release-pin-recheck.md \
  corpus/knowledge/webmcp-invocation-round-17.md corpus/README.md corpus/QUALITY.md
  → exit 0; 169 lines (receipt: .ufo/waves/round-30/w2/RevAddenda/r29-fix.diff)
grep -c '^-'  → 5     # all five are '--- a/<path>' file headers (lines 3, 66, 96, 137, 151)
grep -c '^+'  → 134   # 5 '+++ b/' headers + 129 content additions
```
Zero deletion lines inside hunks. Per-file hunks: QUALITY.md `@@ -396,3 +396,58 @@` (criteria 74-79), README.md `@@ -628,3 +628,25 @@` (round-30 section), chromium-156 `@@ -116,3 +116,36 @@` (errata + population rule), webmcp-17 `@@ -146,3 +146,9 @@` (S044 anchor correction), round-29.md `@@ -262,3 +262,16 @@` (M4/M5 rows).

## 2. lesson-29 M4/M5 rows vs prose — HOLDS

Prose anchors at 061e6202 (`git show 061e6202:corpus/lessons/round-29.md | sed -n '226p;231p;243p'`, exit 0):
- `:226` = `### M4 — a counter's predicate sentence claimed more than its code enforced (this round)`; `:243` = `### M5 — Gitiles 404 bodies are not reproducible bytes` — the appended intro's ":226 / :243" is correct.
- `:231` = `(10 surviving mutants: f1, f2 traversal, f3 absent, f4 bounds/token, s1 prefix/tag, 404 status/body)` — names nine items (f1; f2-traversal; f3-absent; f4-bounds; f4-token; s1-prefix; s1-tag; 404-status; 404-body). The M4 row's correction ("the §M4 prose at :231 says '10 surviving mutants' and names nine") is itself correct.

Every line-number citation in the M4 row, read at 061e6202 (all matched):
- `.ufo/waves/round-29/w1/CritC3Gaming.md:58` = `### S1 — 156 bytes may be a copy of 154 and the counter calls it \`holds\``; `:78` = `### S14 — the claimed target output, from the committed tree, with no network`.
- `.ufo/waves/round-29/w1/CritSemanticDrift.md:27` = `## 1. Counterexample A — same bytes, same revision, two verdicts (subset filing)`.
- `.ufo/waves/round-29/w1/MutC3.md:42` = `Score: **9 killed / 9 survived** of 18 mutants (10 listed check points covered; 6 extra sub-point mutants marked *(extra)*).`; `:44-56` = the survivors section listing exactly nine (f1-old-tag, f2-path-traversal, f3-bytes-absent, f4-range-bounds, f4-anchor-token, s1-supersession-prefix, s1-supersession-tag, notfound-status, notfound-body).
- `.ufo/waves/round-29/w1/RevC3Code.md:22` = `### M1 · Medium — anchorHasRange single-line tokens bind inside version strings, dates and hex runs …`; `:31` = `### M2 · Medium — no file-coverage enforcement; a multi-file row resolves on a benign subset …`.
- `corpus/QUALITY.md:374` = criterion 69 (its text includes "A self-test includes both the matching-source and divergent-source controls" — the "paired controls" the row and prose attribute to it); `:394` = criterion 73. The row's `added \`e1e3a15\`` resolves: `git log -1 e1e3a15` → `e1e3a15f2db10c135739e0ee7e81ce63a02facf6 round-29: wave-1 evidence (44 seat reports, pin entries/drafts, attack receipts), lesson, QUALITY 71-73, README frontier` (exit 0).
- M4 Fix cell matches the prose fix (not landed in round 29 / C3 frozen; w2 re-fetch verification; counter v2 next round with anchor-derived span sets, exact-path binding, population id set, self-supersession refusal, 404 rows judged on status + first line).

M5 row citations (all matched):
- `CritSemanticDrift.md:154` = `## 4. Counterexample C — the absence row's \`f6\` is self-certifying, not an agreement check`; §4's body contains the six-fetches/six-digests table (`Six independent fetches, three per tag`), so the pointer grounds the claim.
- `corpus/SOURCES.md:108` = the S094 row, carrying `body sha256 9d640282763185d862683fc9f41bea0e42783725a1e344ff193e0cc05bdc8b19` (the row's `9d640282…8b19`).
- `corpus/evidence/round-29/release-pins/receipt.json:754-756` = `"new_sha256": "604d9798…4868"` / `"raw_new_sha256": "03016b0d…a056"` — exactly the pair the row quotes.

## 3. Chromium errata: +10 vs +11 — headline HOLDS; one line-attribution DEFECT

The committed pair is unchanged between 061e6202 and 072af95 (`git diff 061e6202 072af95 -- corpus/evidence/round-29/release-pins/bytes/` → empty), so the errata measured the bytes I read.

Verified correct:
- `sha256sum` of the committed 156 bytes = `2a96a97bfb4246b7a23895be7548533ce7adc32286f10df36831e370f8f86102` — the digest the errata cites; `wc -l` = 1761 lines.
- `diff -u 154.cc 156.cc` → exit 1; hunk headers exactly as the errata quotes: `@@ -123,6 +123,7 @@` and `@@ -197,6 +198,16 @@`; the second hunk adds ten lines (guard + blank 210).
- Guard span byte-by-byte: 156:201-202 the two comment lines, :203 `if (!form_->GetDocument().IsActive()) {`, :204-208 the five-line `return std::move(done_callback).Run(...)`, :209 `}`, :210 blank, :211 `  // Success. Now we can either submit the form or focus the submit button.` — the 9-line guard 201-209 holds, and criterion 78's "nine plus the blank at 210" arithmetic holds.
- Seam mappings: 154:198 (`  }`) → 156:199; 154:199 (blank) → 156:200; 154:200 (`// Success. …`) → 156:211, i.e. +11 from 154:200 on. The errata's "+11" headline, its supersession of `:110-111` (which reads "the file's line delta at that point is +10 because of a second one-line change above it") by `:117-118`, and its criticism of :117-118's "from 198 on" as loose at the seam all verify. The errata's S110/S115 characterizations match SOURCES.md:124 ("10-line detached-document guard inserted at 201-209") and :129 ("10-line guard added at 201-210").

**F1 · defect (minor) — errata misplaces the first hunk's added line by 2.** The errata says "`@@ -123,6 +123,7 @@` adds one line (`is_connected_nested_form_(false),`, **156:124**)" and "Above 156:124 the delta is 0, from **156:124** through 156:200 it is +1". The committed bytes say otherwise (`grep -n '' 156.cc | sed -n '121,130p'`; same for 154.cc):

```
154.cc: 124 did_finish_parsing_children_(false),   156.cc: 124 did_finish_parsing_children_(false),
154.cc: 125 is_in_reset_function_(false),          156.cc: 125 is_in_reset_function_(false),
154.cc: 126 rel_list_(MakeGarbageCollected<…       156.cc: 126 is_connected_nested_form_(false),   ← the added line
                                                   156.cc: 127 rel_list_(MakeGarbageCollected<…
```
The added line sits at **156:126**; delta is 0 through 156:125 (154:125 = 156:125), the insertion occupies 156:126, and the +1 offset starts at old 126 / new 127. The errata's own quoted hunk header (+ as the 4th of 7 new lines from 123) contradicts its 156:124 claim. No downstream claim is affected (the +11 headline, the guard span, and the 198-211 mappings are all correct), and no other corpus file repeats the number (`git grep -n '156:124' 072af95 -- corpus/` → only the errata's own lines 126-127 of the file). Per the lane's own criterion 78 ("a span that does not add up is corrected, not repeated") this warrants an appended correction.

## 4. S080/S081 citing — HOLDS

- `chromium-156-release-pin-recheck.md:83` (unchanged by the append) = `(S100 → S115). S080 and S081 have no citing knowledge entry.` — the superseded line exists as the errata describes.
- The entry's `source:` line (`:3`) names S080 and S081 among the 23 re-opened rows.
- SOURCES.md at tip: S080 and S081 `used-by` cells = `corpus/knowledge/chromium-156-release-pin-recheck.md` (both were `—` before, per round-30.md §`used-by` changes, which logs old→new for all 23 rows).
- All 23 re-opened rows' used-by cells at tip name the entry: loop over S033 S034 S041 S042 S045 S062 S064 S071 S074 S077 S078 S079 S080 S081 S093 S094 S096 S097 S098 S099 S100 S105 S106 → `used-by-ok=23 missing:none`.

## 5. Population rule — HOLDS

- `scripts/check-release-pins.mjs:178` = `const population = rows.filter((r) => r.recheck === "on-release" && r.tags.some((t) => cmpVersion(t, stable) < 0));` — the errata's pointer is exact, and its restatement ("`recheck == on-release` and a source cell carrying `refs/tags/<A.B.C.D>/` below Stable") matches the code: `parseRegistry` takes tags from `cells[2]` (the source cell) via `TAG_RE = /refs\/tags\/(\d+\.\d+\.\d+\.\d+)\//g` and recheck from `cells[10]`.
- Mirrored parse (same regex, same cells) over SOURCES.md: at 061e6202 → 115 rows, 89 on-release, **population 23, exactly the named 23** (no extras, none missing); at 072af95 → 118 rows, 90 on-release (S118 is the new on-release row; its source cell is a devtools-frontend commit URL, no tag → still outside), **population still 23**. Tag distribution among on-release rows: 23 × `154.0.8037.97` + 7 × `156.0.8078.47`. All 118 rows are well-formed (13 split parts), so `parseRegistry`'s `cells.length !== 13` filter drops nothing. The lesson's "23 of 89 `on-release` rows" (measured at 061e6202) is correct.
- The nine excluded rows verify against SOURCES.md: S036, S044, S068, S088, S089, S090 all carry the devtools-frontend commit `66df492aaa0129d090937e933dd44c5389ab24d2` in their source cells with no `refs/tags/` (all six `recheck = on-release` confirmed), and S004, S028, S035 are `main`-branch URLs (`on-release` confirmed).

**F2 · observation (minor) — the exclusion enumerations omit the at-stable class.** S109-S115 are `on-release` (row tails verified), tagged `156.0.8078.47` = `--stable`, hence excluded by the rule's "below Stable" clause — and they are Chromium-release-coupled. They appear in neither the errata's "Not selected and not re-opened by this entry:" list nor the lesson §Release-pin population rule's "by name" list (whose scoping qualifier — "coupled to the Chromium release" — S109-S115 also satisfy). Under criterion 79's letter ("every class the rule excludes named and counted") the enumeration is incomplete; the selecting rule and the 23-count are unaffected. The errata's sentence additionally drops the lesson's scoping qualifier, so read literally it would also owe the ~50 uncoupled on-release rows it does not mention.

## 6. Adjacent observations (outside the five audited paths, flagged for their owners)

- **F3 · minor:** `corpus/lessons/round-30.md` violates criterion 77 (added in this same commit): the mistakes table has six rows (M1-M6) but only four subsections (`### M1`-`### M4`); M5 and M6 have no subsection. By 77's own recipe: `grep -c '^| M[0-9]'` = 6 vs `grep -c '^### M[0-9]'` = 4. Noticed while verifying the README pointer; README's "(lesson round-30 M5)" itself resolves (M5 = the CritC1Counter cwd-leak mistake, matching the README's description).
- **F4 · bookkeeping:** at the audited tip 072af95, `.ufo/waves/round-30/w1/` has 0 tracked files, so the round-30 lesson's and errata's w1 citations (`ScribeUsedBy23.md`, `ScribePopulationRule/population-split.json`, `CritC1Counter.md`, `SentinelFetchScope.md`, `CritC2Counter.md`, `ScribeMistakes/`) dangle at that revision; all are tracked at lane HEAD af0664e and exist on disk. The appended M4/M5 rows' round-29 citations do resolve at 061e6202.

## 7. webmcp-invocation-round-17.md addition — receipt-backed (no independent refetch)

The S044 anchor correction's checkable claims verify against the committed S118 receipts at `corpus/evidence/round-30/s118/`: `WebMCPModel.ts@66df492` and `@bf69d041` are byte-identical, 8,553 B, sha256 `c23d575e90f0e23b4d29010e3e0a062dd30d55976c83d3d0a88790191f08b632` (matching S036/S118's recorded digest); `panels-application.dir@66df492.json` lists 85 entries containing exactly `WebMCPView.ts`, `WebMCPView.test.ts`, `WebMCPTreeElement.ts`, `webMCPView.css` (no `WebMCPModel.ts`); `DEPS.154.0.8037.97.lines420-425.txt` line 424 = `'devtools_frontend_revision': '66df492aaa0129d090937e933dd44c5389ab24d2',`; `fetches.tsv` records HTTP 404 for `front_end/panels/application/WebMCPModel.ts` at both commits (two 404 bodies with different nonce digests — consistent with M5's lesson). Not independently re-fetched over the network.

## Residual risk / verification gaps

- Old `used-by` cells (the "old" column of round-30.md's table) were not verified against 061e6202 for all 23 rows — only the new cells at tip (all 23) and S080/S081's old=`—` (consistent with `:83`). RevUsedByChange is exporting both revisions of SOURCES.md.
- The webmcp addition's network claims rest on the committed receipts, not an independent refetch by this seat.
- The C1/C2 counters were not run here (not this seat's claim; measurement belongs to the executor seats per claims.json's measurementRule).

## Hygiene

Writes: this report, `.ufo/waves/round-30/w2/RevAddenda/r29-fix.diff` (audit receipt), scratch `/fast/scratch/hyaku/tabi-r30/RevAddenda/` and two small `/tmp` files (all removed after use). No lane tracked file, index, or jj state touched; no installs; no network fetches.
