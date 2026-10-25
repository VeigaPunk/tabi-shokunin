# Exec03 — round-28 C2 audit: LOG.md:221 false-clear and the required citation behavior

Seat: Exec03 (leaf, item 3). Wave: tabi-r28-w1. Lane root:
`/home/vgpnk/Projects/shokunin/tabi-shokunin`. No lane tracked files changed;
read-only git; no builds/tests/formatters per wave contract; no tool installs
(RULES.md read; nothing installed; pacman untouched). Writes: this report and
scratch under `.ufo/waves/round-28/scratch/Exec03/` (untracked, ignored).

## Frozen claim cited (observation)

`tabi-shokunin/.ufo/waves/round-28/claims.json` C2 (calibration):
"Repair scripts/check-selfassessment.mjs m1 supersession so a correction only
clears the exact stale tally it cites, not an unrelated later line/paragraph";
metric `selfassessment_mismatches_and_cases`; counting command
`node scripts/check-selfassessment.mjs --rev <REV> --json`; after: "LOG.md:221
appears as a mismatch unless an exact-line correction cites it"; killRule: "If
any unrelated correction still clears LOG.md:221, claim misses"; failureCapable:
"selftest fixture with a correction citing another line must retain mismatch;
exact citation fixture must supersede." Motivating evidence:
`corpus/lessons/round-27-verifier-spotcheck.md:15` (false-clear: claimed 8,
observed 12, superseded=true though the paragraph does not cite line 221) and
`:46-47` ("enforces citation to the superseded line ... add committed regression
coverage for unrelated paragraph/citation").

## Measured state at tip (observation)

Command (the frozen counting command, at baseline HEAD = `eb23c0b`):

```
node scripts/check-selfassessment.mjs --rev HEAD --json
```

Result: `mismatches=1`, `superseded=10`, `clean=false`; the m1 LOG.md finding
at line 221 is reported `claimed: 8, observed: 12, superseded: true` for
`scripts/check-freshness.mjs`. The false-clear the frozen claim names is still
present at tip. The only counted mismatch is `m3-unlanded-paths` (40 porcelain
paths — the untracked round-28 wave files; transient, unrelated to C2). The
oracle tally `node scripts/check-freshness.mjs --self-test` prints
`FRESHNESS_SELFTEST verdict=clean cases=12` (exit 0), reproducing observed=12.
`node scripts/check-selfassessment.mjs --selftest` passes 17/17 (`cases=17`).

## Mechanism of the false-clear (code read + analysis)

`scripts/check-selfassessment.mjs:316-328` (m1LogFindings supersession) marks
finding `f` superseded when a later paragraph (a) names `f.script`, (b)
matches `/supersed|correct/i`, (c) matches `/:\d+/`, (d) has
`statedTallyNumbers(text).includes(f.observed)`. Defect: criterion (c) only
tests that the paragraph contains **any** `:N` token — never that `N` equals
`f.line` (inference from the code).

Which paragraph clears LOG.md:221 (analysis, scratch tool
`.ufo/waves/round-28/scratch/Exec03/m1-supersession-audit.mjs`, replicating the
file's regexes): paragraph starting at LOG.md line 265, 183 lines (265–447),
names `scripts/check-freshness.mjs` once (line 272), contains "Corrected" (line
266), tally shape "12-case" (line 275), and its only `:N` tokens come from
timestamps — `05:16:28Z` yields `:16`, `:28` (line 269). It never cites line
221. This matches the round-26 falsification record exactly: "marks the real
`LOG.md:221` stale selftest mention superseded by a later 183-line paragraph
that does not cite line 221" (LOG.md:1931-1932).

## Exact-line projection (analysis)

Same scratch tool compares the loose predicate against an exact-line predicate
(paragraph must contain a `:N` token equal to the finding's line, plus (a)/(b)/(d)):

| Finding (doc:line) | loose superseded? | exact superseded? | exact-citing paragraph |
|---|---|---|---|
| LOG.md:221 (freshness 8 vs 12) | yes | **no** | — (none cites :221) |
| LOG.md:335 (freshness 4 vs 12) | yes | yes | @1904 (cites :335) |
| LOG.md:391 (freshness 4 vs 12) | yes | yes | @1904 (cites :391) |
| LOG.md:1090 (sources 66 vs 26) | yes | yes | @1904 (cites :1090) |
| LOG.md:1103 (sources 66 vs 26) | yes | yes | @1904 (cites :1103) |
| LOG.md:1664 (audit 12 vs 13) | yes | yes | @1845 (cites :1664) |
| SCORECARD.md:410 (sources 25 vs 26) | yes | yes | @1192 (cites :410) |
| SCORECARD.md:1138/1139/1151 (audit 12 vs 13) | yes | yes | @1192 (cites :1138,:1139,:1151) |

Under exact-line semantics the only finding that flips is LOG.md:221: it
becomes an unsuperseded mismatch (claimed 8, observed 12), giving the nonzero
m1 count the claim targets. All current legitimately superseded mentions survive
because their correction paragraphs cite the exact lines.

## Precise citation behavior the frozen claim requires

1. A later correction paragraph may supersede a stale tally finding **only** if
   the paragraph's line citation equals the finding's own line (`f.line`). A
   citation to any different line must not clear the finding (killRule:
   unrelated correction must not clear LOG.md:221).
2. The other three predicates stay as-is: same `f.script` name, a correction
   marker, and the oracle-correct number in a tally shape (no weakening, and
   the failed frozen predicate is retained).
3. For LOG.md:221 at tip: it must be reported `superseded: false` and counted as
   an m1 mismatch (claimed 8 vs observed 12) — no later paragraph cites line 221.
4. Selftest must contain both: a red unrelated-citation case (correction citing
   another line retains the mismatch) and a green exact-citation control
   (correction citing the tally line supersedes). The green control already
   exists (`m1-log-stale-then-corrected`, `CASES` lines 505-514, cites
   LOG.md:6 = its tally line); the wrong-number red control exists
   (`m1-log-wrong-number-correction`, lines 515-524). The missing red
   unrelated-citation case is delivered by sibling Exec22's fixture
   (`.ufo/waves/round-28/scratch/exec22-unrelated-citation-case.mjs`): a
   correction citing line 8 must leave the stale line-6 tally counted -> exit 1.
5. Implementation surface (design note only — no code changed here): in
   `m1LogFindings` replace `/:\d+/.test(text)` (line 325) with extraction of
   cited line numbers and require `f.line` to be among them. The parallel
   SCORECARD-window predicate (`m1Findings`, line 239) shares the identical
   `/:\d+/` looseness; it is currently benign because existing correction rows
   cite the right lines, but should be aligned to the same exact-line rule.

## Residual risks / notes

- Timestamp tokens (`05:16:28Z` -> numbers 16, 28) satisfy a naive numeric
  equality; recommend recognizing citations only in the documented `:LINE`
  reference form (e.g. `LOG.md:(\d+)`) to avoid accidental matches (risk, not
  observed today).
- `m3` reads live porcelain rather than binding its count to `--rev`
  (LOG.md:1934-1935); while the round-28 wave files are untracked it reports 40
  paths. Out of C2 scope (m1 only), but it keeps tip `mismatches` non-zero even
  after the C2 fix until wave files land.
- Header comment `scripts/check-selfassessment.mjs:8` says "17 isolated cases";
  CASES (15 build cases) + 2 refusal cases = 17 (observation; stale wording).
  Adding the red case makes the selftest 18 cases.

## Files changed

1. `.ufo/waves/round-28/w1/Exec03.md` (this report).
2. `.ufo/waves/round-28/scratch/Exec03/m1-supersession-audit.mjs` (read-only
   analysis tool, scratch only). No tracked lane file touched; negative claim
   supported by the writes list above.

## Evidence commands

- `node scripts/check-selfassessment.mjs --rev HEAD --json` (observation).
- `node scripts/check-freshness.mjs --self-test` (observation, oracle=12).
- `node scripts/check-selfassessment.mjs --selftest` (observation, 17/17).
- `node .ufo/waves/round-28/scratch/Exec03/m1-supersession-audit.mjs`
  (analysis; labels inference where judgment, raw data from the files).
- `node --input-type=module -e '...'` diagnostics: paragraph-265 boundaries and
  trigger tokens; paragraph-1904 exact citations; SCORECARD exact comparison
  (observation/analysis).
