# Round 30 · w1 · ScribeLesson29Addendum — routed defects 3 and 4 (append-only)

**Verdict.** Both fixes exist as additions-only patches against `061e62024c0523d3c6c7e819506a773ff2cd7d75`,
and nothing else was changed. Defect 3 appends a `## Appended mistake rows — M4 and M5` section to
`corpus/lessons/round-29.md` (+13 lines, hunk `@@ -262,3 +262,16 @@`, 0 removals), giving M4 and M5 the
class · evidence-pointer · captured-by · fix shape that the table above them uses for M1–M3 while leaving
every existing line untouched. Defect 4 appends `### Errata — round-30 scribe addendum` to
`corpus/knowledge/chromium-156-release-pin-recheck.md` (+23 lines, hunk `@@ -116,3 +116,26 @@`, 0 removals),
which marks `:110-111`'s "+10" as superseded by `:117-118`'s +11 and records S110/S115's "10-line" guard as
the 9-line block `156:201-209`, checked against the committed 156 bytes
(`sha256 2a96a97bfb4246b7a23895be7548533ce7adc32286f10df36831e370f8f86102` — the decoded digest S110 itself
records). Both patches reverse-check clean (`git apply --check --reverse` exit 0), and both target files are
byte-identical between the freeze commit and the current lane tip `38891ca`, so they apply unchanged today.
Two defects in the sources surfaced while grounding the rows and are recorded rather than silently copied:
the §M4 prose says "10 surviving mutants" where its own source scores `9 killed / 9 survived` and lists nine
(row M4 states 9 and flags the mismatch), and `:117-118`'s "from 198 on" is loose at the seam — 154:198-199
still sit at +1, the +11 begins at 154:200 / 156:211 (the errata note gives the exact boundary).

## Deliverables

Output dir `.ufo/waves/round-30/w1/ScribeLesson29Addendum/` (paths relative to the lane root):

| file | bytes | lines | sha256 |
|---|---|---|---|
| `patch-round-29-lesson-M4-M5.patch` | 3141 | 21 | `c86fb169009f1bb755a98d1a38594ca03f155cd885f87605e1b028658bbf10ca` |
| `patch-chromium-156-errata-110-117.patch` | 2767 | 31 | `5eea8f686a0f9ee6792d8333fa507fd0052452e6d3e180ee91f39e2de9d2125f` |
| `verification.txt` | 2892 | 44 | `ecd845c82f93e4aa309e1fbb26367e87987aa8c8ac1ec7a73764c617f512e865` |
| `committed-paths.txt` | — | 11 | `b73ec2009bb999e55b22b6217712e58d12d96e089b11ec84fe4cc7772f9571d2` |
| `guard-span-receipt.txt` | 1896 | — | `d68321196459e2dd53f492f9391fb2c18f04c6dc6f3f8d7fa2009c928792995c` |
| `hunks-154-156.diff` | 5920 | — | `9c1f7787a7e381ea1c171a525aea9a83a3f05fdc6c91632bbee572d6caaebf13` |
| `hunks-154-156.headers.txt` | 175 | 8 | `73079f286af6e3249f2e4782198ea35e2a2b32aec46983c2c4d29bfde02adabd` |

Added content: 13 lines in the lesson (264 → 277 lines), 23 in the knowledge entry (118 → 141); removed lines
0 in both patches.

## Commands and exit codes

All git calls are `-C`-named against the scratch clone; the clone top-level is
`/fast/scratch/hyaku/tabi-r30/ScribeLesson29Addendum/clone` (verified `git rev-parse --show-toplevel`), HEAD
`061e62024c0523d3c6c7e819506a773ff2cd7d75`, `git status --porcelain` = 0 lines after checkout.

```text
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"          exit 0
git -C "$S/clone" checkout -q 061e62024c0523d3c6c7e819506a773ff2cd7d75           exit 0  (HEAD = 061e62…)
git -C lane diff --quiet 061e62… 38891ca… -- <round-29.md> <chromium…md>         exit 0  → files identical
  (so a patch based at 061e62 also applies at the current tip 38891ca)
git diff --no-color --no-ext-diff --src-prefix=a/ --dst-prefix=b/ 061e62… \
  -- corpus/lessons/round-29.md                     > patch-round-29-lesson-M4-M5.patch        exit 0
git diff … -- corpus/knowledge/chromium-…md         > patch-chromium-156-errata-110-117.patch   exit 0
git apply --check --reverse <each patch>                                            exit 0 / exit 0
grep -c '^-[^-]' <each patch>                                                      0 / 0  (additions only)
grep '^@@' <each patch>              @@ -262,3 +262,16 @@ / @@ -116,3 +116,26 @@   (both at file end)
diff -u 154…html_form_element.cc 156…html_form_element.cc > hunks-154-156.diff      exit 1  (differs)
sha256sum 156…/html_form_element.cc                                                2a96a97b…6102
```

The lane's *global* git config sets `diff.mnemonicPrefix=true`
(`git config --show-origin --get-all diff.mnemonicPrefix` → `file:/home/vgpnk/.config/git/config true`), so a
bare `git diff` emitted `c/`/`w/` prefixes; the delivered patches were regenerated with explicit
`--src-prefix=a/ --dst-prefix=b/` so the L1's tooling sees the ordinary form.

## What the patches add

**Defect 3 — `corpus/lessons/round-29.md` (append only).** One blank line, a heading
`## Appended mistake rows — M4 and M5 (round 30, 2026-10-26; append-only, seat ScribeLesson29Addendum)`,
five lines of orientation that name the prose origins (`§M4` opens `:226`, `§M5` opens `:243`, checked in the
committed file), and a table with columns `# | Class | Evidence pointer | Captured by | Fix`:

- **M4** — `vacuous` (secondary `survivor`). Pointers: `CritC3Gaming.md:58` (§S1), `:78` (§S14),
  `CritSemanticDrift.md:27` (§1), `MutC3.md:42` (score `9 killed / 9 survived of 18`, survivors `:44-56`),
  `RevC3Code.md:22` (M1), `:31` (M2). Captured-by: `none`; criterion 69 (`QUALITY.md:374`) asks for paired
  controls, and the criterion drafted from this row is 73 (`QUALITY.md:394`, added `e1e3a15`, whose lesson
  pointer is `round-29.md#mistakes M4`). Fix: not landed in round 29 (C3 frozen), w2 verifies the stronger
  sentence on its own data, next round counter v2 (anchor-derived span sets, exact-path binding, population
  id set, self-supersession refusal, 404 rows judged on status + first line).
- **M5** — `stale-premise`. Pointers: `CritSemanticDrift.md:154` (§4 — six fetches, six digests, only
  `request_id` differs), `SOURCES.md:108` (S094 anchors one 404 body sha256 `9d640282…8b19` as if it were a
  property of the URL), `receipt.json:754-756` (S094 `new_sha256 604d9798…4868` normalised vs
  `raw_new_sha256 03016b0d…a056`). Captured-by `none`; fix landed via the receipt's `normalization` field and
  the w2 re-fetch applying the same replacement, with the red state being that same digest pair.

**Defect 4 — `corpus/knowledge/chromium-156-release-pin-recheck.md` (append only).** One blank line plus
`### Errata — round-30 scribe addendum (2026-10-26; append-only, seat ScribeLesson29Addendum)` and two
bullets:

1. `:110-111` ("+10 because of a second one-line change above it") **superseded by `:117-118`** (+11), with
   the measurement that decides it: `diff -u` of the two committed byte files gives
   `@@ -123,6 +123,7 @@` (one added line, `is_connected_nested_form_(false),` at 156:124) and
   `@@ -197,6 +198,16 @@` (ten added lines: the guard plus blank 210). Delta is 0 above 156:124, +1 from
   156:124 through 156:200, +11 from 156:211 (`// Success.…`, which is 154:200). The note also says where
   `:117-118` is loose: 154:198 and 154:199 still sit +1, because the ten-line insertion starts after
   154:199.
2. **S110's guard is 9 lines, not 10.** `SOURCES.md:124` (S110) says "a 10-line detached-document guard
   inserted at 201-209"; `:129` (S115) says "a 10-line guard added at 201-210". The committed 156 bytes put
   `:201-202` as the two comment lines, `:203` `if (!form_->GetDocument().IsActive()) {`, `:204-208` the
   five-line `return std::move(done_callback).Run(...)`, `:209` `}` — nine lines; `:210` is the blank tenth
   line of the insertion hunk and `:211` resumes `// Success.`.

## Grounds

- Guard span, from `corpus/evidence/round-29/release-pins/bytes/156.0.8078.47/third_party/blink/renderer/core/html/forms/html_form_element.cc`
  (1761 lines, digest above; `guard-span-receipt.txt` prints 199-214 with absolute numbers, plus the 154↔156
  mapping): `201` and `202` comments, `203` the `if`, `204`-`208` the return, `209` the closing brace, `210`
  a one-byte blank line, `211` the first `// Success.` line. `201..209` inclusive = 9.
- Shift: `154:198  }` ↔ `156:199  }` (+1); `154:199` blank ↔ `156:200` blank (+1);
  `154:200  // Success. Now we can either submit the form or focus the submit button.` ↔ `156:211` same text
  (+11). The whole-file `diff -u` (`hunks-154-156.diff`, exit 1) has eight hunks, the two above the guard's
  neighbourhood being the only ones before it — `hunks-154-156.headers.txt`.
- M4 row numbers: `MutC3.md:42` prints verbatim `Score: **9 killed / 9 survived** of 18 mutants (10 listed
  check points covered; 6 extra sub-point mutants marked *(extra)*).`; the file has nine numbered survivor
  items (`:44-56`); `QUALITY.md:394` prints `73. A counter frozen for a claim is attacked before freezing by
  a seat that did not write`; `QUALITY.md:374` prints criterion 69.
- M5 row numbers: `SOURCES.md:108` is the S094 row; `receipt.json:754` prints `"new_sha256":
  "604d97983ea428e85f90186c8c8daee9e0bb226132b7075be266266110764868"`, `:756` prints `"raw_new_sha256":
  "03016b0d4b5175446c24f72c845afeec449867018302f55cb767ebf6b2d7a056"`, and the same object carries the
  `normalization` field naming `<per-request id removed>`.
- Committed-ness: all eleven evidence paths named in the appended text exist at
  `061e62024c0523d3c6c7e819506a773ff2cd7d75` (`git cat-file -e 061e62…:<path>` returned 0 for each; the
  list and verdicts are in `committed-paths.txt`).

## Findings (recorded, not repaired — append-only scope)

1. **§M4's survivor count contradicts its own source.** `corpus/lessons/round-29.md:231` says "10 surviving
   mutants"; `MutC3.md:42` scores `9 killed / 9 survived` and the nine named survivors at `:44-56` are f1,
   f2-traversal, f3-absent, f4-bounds, f4-anchor-token, s1-prefix, s1-tag, notfound-status, notfound-body.
   No committed file was found that says 10 (`grep -rn "10 surviv"` hits only `:231`). The appended row
   states 9 and names the discrepancy inline; the prose line itself is untouched, as instructed.
2. **`:117-118`'s shift boundary is approximate.** "+11 from 154:198 on" does not hold for 154:198-199
   (both +1); the +11 starts at 154:200 / 156:211. The appended errata note gives the exact seam instead of
   repeating the loose boundary.
3. **`:110-111`'s mechanism sentence is wrong in kind, not only in value:** a "second one-line change"
   explains a +1 on top of a nine-line guard (+10 total only if the blank line 210 were not counted), but
   the insertion hunk itself is ten lines, so the correct net below the guard is +11.
4. **Base drift, harmless here.** The assignment describes the lane tip as `061e62`; the checkout is at
   `38891ca` (one later commit). The two patched files are byte-identical at both revisions (exit 0 on
   `git diff --quiet`), so the patches are base-correct either way; recorded because the contract names
   `061e62` as the base.

## Limits / out of scope

- I did not run `check-gate-mutants.mjs`, `check-frontier-admission.mjs`, any self-test, linter, formatter or
  build; none of the C1/C2 numbers are claimed here.
- I did not fetch the network for anything: the chromium claims are checked against committed bytes, not a
  live refetch, which is the boundary the errata note respects.
- The M4/M5 rows do not re-audit the underlying w1 attack reports beyond confirming the pointer resolves and
  the quoted section/score lines exist; their verdicts (`unresolved=0` reachable, 9 survivors) are the
  sources' own words, cited by line.
- No lane tracked file, lane git index, lane jj state, fleet repo or `shokuknow` tree was written; the lane
  worktree received only this report and the seat output directory.
- Scratch `/fast/scratch/hyaku/tabi-r30/ScribeLesson29Addendum` (clone + tmp under `TMPDIR`) was removed
  after every receipt above was copied into the output dir.
- No tool installs or upgrades were needed.
