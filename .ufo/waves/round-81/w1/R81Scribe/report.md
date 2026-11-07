# R81Scribe — round 81 w1 report

Seat: scribe (read-only). Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`, base
`c27e8406e6a2dc3cafcff030c9224cf8a14e3464`, digests commit D
`a2183a93362259cb574ef3d03b565ee6d2c26599`, scored nonce `tabi-r81-l1-a2183a933622`. No commit, no
push, no mutating git/jj command, no write into `.ufo/waves/round-81/` or
`corpus/evidence/round81/` except this prose report.

## Behavior

Drafted the three prose artifacts the L1 lands, under
`.ufo/waves/round-81-seats/R81Scribe/`:

1. `knowledge-note.md` — the draft of `corpus/knowledge/chromium-showpicker-runtime-round-81.md` in
   the r80 house style: the provenance trio first (`source:`, `verified-at:`, `recheck:`), eight
   measured laws each with the receipt field paths that carry it, a Limits section (what a receipt of
   this shape cannot prove), and a six-item frontier list. Values were read from the scored receipt
   `corpus/evidence/round81/chromium-showpicker/receipt.json` (`finishedAt 2026-11-07T23:14:54.313Z`,
   fixture sha256 `d9129edd…a1703`, 6 legs, 0 failures) and cross-checked against the frozen law
   constants in `scripts/check-showpicker-r81.mjs`; the `recheck:` command carries the freeze driver
   pin `e35e63c1…c669` and the receipt's own fixture hash.
2. `sources-rows.md` — the four rows R81Scout opens (S219, S220, S222, S223) in contract v1 shape,
   each with a located verbatim quote and its `wc -w` count (18 / 14 / 8 / 18), the fetch facts, and
   a `teaches` cell of 13 / 18 / 23 / 21 words. It also records the row defects found while
   verifying (below).
3. `lesson.md` — the draft of `corpus/lessons/round-81.md`: `## Gate` (the four sources with quotes
   and counts, the note admitted, six rejected claims with flip conditions), `## Mistakes` (four
   rows mined from this round's instrument history), `## Corrections` (the ten r80 routed defects in
   a table with the stale statement quoted and the truth named, plus the self-drift identity leg).

Verification performed (read-only, no instrument rerun): every lesson-dependent expression of
`scripts/check-record-drift-r81.mjs` was evaluated against the draft text — **12/12 conditions
pass**; the lane-side prerequisites the same counter reads were checked and hold (below). The
scored outputs were read, not produced.

Two targeted demonstrations were run in scratch to make two Mistakes rows observed rather than
asserted:

- `node -e 'Array.from(null, x=>x)'` → `TypeError: object null is not iterable` (the `fl()` crash the
  driver's `t.files ? … : []` guard prevents).
- the frozen counter with a JSON document at the `--prior-set` path → exit 2, verdict `unreadable`,
  finding `prior-unreadable`, detail `…/{: ENOENT` (the prior set is a newline-delimited path list,
  not a receipt).

## Gates

- **C2 (record drift).** Before: `lesson-proof/c2-before.json`, 12 claims, 12 mismatches. The draft
  lesson satisfies all 12 lesson-dependent conditions (end census, D9 sweep, both dead pointers, the
  Gate quote counts, the frozen-claim annotation, the capability typo, the control count, D10, the
  battery binding, the r81 identity, the r81 numbers). Lane-side prerequisites verified present and
  correct: `end-green.txt` (`census exit=0`), `c1-nowork.json` (34 findings incl. `schema`),
  `scored/cold-runs.txt` (4 entries, all paths exist), `battery-bound-a.json` (`receipt.sha256` =
  the r80 receipt's sha256, 102 cases, 0 failed), `QUALITY.md` criterion 159 (`wc -w` + quote count),
  and every r81 nonce citation in SCORECARD/LOG/SKILL is the final `tabi-r81-l1-a2183a933622`.
- **C1 (coverage).** The scored outputs are clean: counter verdict `clean`, 56 checks, 0 findings;
  battery 62 cases, 0 failed, `coverage.uncovered []`; kill power 46 mutants, 46 killed, 0 survived,
  0 crashed; selftest `clean: true`, 9/9. The note's laws reproduce the scored receipt's values.
- **Pins.** `freeze.txt` lists the driver `e35e63c1…c669` (the scored receipt's `driverSha256`
  matches) and the counter `0d69659c…a0c0`; the selftest's `pins-match-freeze` gate is `ok: true`.

## Touched surfaces

- `.ufo/waves/round-81-seats/R81Scribe/knowledge-note.md` (new, prose)
- `.ufo/waves/round-81-seats/R81Scribe/sources-rows.md` (new, prose)
- `.ufo/waves/round-81-seats/R81Scribe/lesson.md` (new, prose)
- `.ufo/waves/round-81-seats/R81Scribe/battery-pass1.json` and `battery-pass2.json` (copies of the
  L1's pre-freeze battery passes, kept as the Mistakes evidence; the L1 should copy them to
  `.ufo/waves/round-81/lesson-proof/` before landing)
- `.ufo/waves/round-81/w1/R81Scribe.md` and `.ufo/waves/round-81/w1/R81Scribe/report.md` (this
  report, both paths the seat spec names)
- scratch `/fast/scratch/hyaku/tabi-r81/R81Scribe/` (created, deleted before yielding; the two
  demonstration outputs were transient)

## Out of scope

No product code, no instrument edit, no commit, no push, no mutating git/jj command. No file was
written into the counter's walked trees except this prose report. No tool was installed or upgraded.

## Findings (report, do not silently reconcile)

1. **The frozen claims' leg (c) says `coverage.unknown []`; the committed battery reports four
   unknowns.** `scored/battery-a.json` (and the selftest's battery gate) carry
   `coverage.unknown: ["order-law-message","activation-before","cross-nonfile-chooser",
   "cross-nonfile-result"]` — the four extra cases' names are not the counter's check ids, and the
   battery's `unknown` is `covered \ declared`. The battery still exits 0 (`failed === 0 &&
   uncovered.length === 0`), so the predicate as written in the ticket ("battery exit 0 allOk, 62
   cases, coverage.uncovered []") holds; the claims.json wording does not. Either the report states
   `unknown` as measured, or the four cases are renamed to declared ids. The frozen claims are not
   editable.
2. **QUALITY 159's green-state sentence names counts the draft Gate does not carry.** Criterion 159
   says "the r81 Gate rows state 6 and 23 words with their line/paragraph locators". The draft Gate
   states 8 words for S222 ("Sets files for the given file input element.") and 18 for S223
   ("attribute may be specified to provide user agents with a hint of what file types will be
   accepted."), both measured with `wc -w`. If the lane wants the criterion's numbers, S222 can
   quote the `files` parameter comment "Array of file paths to set." (line 684, 6 words); no 23-word
   S223 quote was located in the accept paragraph. Otherwise criterion 159's sentence needs the
   measured numbers before the lesson lands.
3. **S222's committed anchor has a wrong line count and a one-line-off locator.** The row says
   "decoded 1,3xx lines"; the staged `dom.pdl` decodes to 34,575 B / **1,022 lines**. The locator
   "lines 682-691" omits the command's comment line 681. The base64 size and sha256 are correct.
4. **R81Scout's staged source copies for S220 and S222 are error bodies.** Both
   `.ufo/waves/round-81-seats/R81Scout/sources/html_input_element.cc.b64` and `dom.pdl.b64` are
   233-byte `NOT_FOUND: Requested entity was not found` bodies (sha256 `0375d4dc…` and `1018e256…`),
   not source. The real `dom.pdl` is the L1's `.ufo/waves/round-81/sources/dom.pdl` (sha256
   `50c46045…`); the Chromium source was fetched for this draft at the same tag (HTTP 200, 135,428 B,
   sha256 `405b52c7…`, matching S220's row). The scout's report must not claim those two fetches
   succeeded.
5. **The r80 claims' no-work count is stale.** The frozen r80 claims say the no-work control exits 1
   with "30 findings"; the committed `c1-nowork.json` carries **34** findings (incl. `schema`). The
   drift counter only requires `schema` and ≥5, so the correction is in the lesson text, not the
   counter.
6. **The r81 driver's header says "four additions" but the code asserts five patches**
   (`PATCH_STYLE`, `PATCH_BODY`, `PATCH_FL_TO`, `PATCH_INPUTS_TO`, `PATCH_STATE_TO`). The note says
   five; the header comment is the stale side.
7. **The r80 knowledge note still cites D9** (`211962dccb61…` at lines 9 and 20). That is expected
   under append-only records; the lesson's correction row 2 names it. No rewrite.

## Artifact paths

- `.ufo/waves/round-81-seats/R81Scribe/knowledge-note.md`
- `.ufo/waves/round-81-seats/R81Scribe/sources-rows.md`
- `.ufo/waves/round-81-seats/R81Scribe/lesson.md`
- `.ufo/waves/round-81-seats/R81Scribe/battery-pass1.json`, `battery-pass2.json`
- `.ufo/waves/round-81/w1/R81Scribe.md` (this report; a copy at `w1/R81Scribe/report.md`)
