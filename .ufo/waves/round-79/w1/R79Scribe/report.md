# R79Scribe — round 79 wave w1 report

Seat: `R79Scribe` (scribe, read-only). Lane `tabi-shokunin`, base
`24c821895f31f9dcb66ac2f357bc947818b0408c`, digests commit D `80830674d421e97bb1c01c836bfbb3dc49687dbc`.
No commits, no pushes, no mutating git/jj commands, no writes into the walked trees
(`.ufo/waves/round-79`, `corpus/evidence/round79`). No tools installed.

## Delivered (drafts, not landed — the L1 is the integration owner)

1. `.ufo/waves/round-79-seats/R79Scribe/knowledge-note.md` — `corpus/knowledge/chromium-showpicker-runtime-round-79.md`
   in the lane's house style: provenance trio (`source:`, `verified-at:`, `recheck:`) **first**, then
   the title. Nine measured laws, each with the receipt field path that carries it; the source
   paragraph (S216-S219, including the spec's "show the picker" sub-algorithm that consumes the
   activation); the Limits section (what a receipt of this shape cannot prove, with the replay rule's
   own numbers: own 37 events / 2 gaps, per prior 37 events / **1** gap, `absNeed 19`, `gapNeed 1`,
   escape 19 events + 1 gap); the frontier list.
2. `.ufo/waves/round-79-seats/R79Scribe/sources-rows.md` — four SOURCES.md rows in the file's 11-column
   contract v1 shape (S216 spec, S217 MDN, S218 Chromium source, S219 CDP Runtime), each with a
   re-located quote and a `teaches` of 21/19/19/19 words (≤ 25). Includes a verification table
   (http, bytes, sha256 prefix, quote location) and the S219 path correction.
3. `.ufo/waves/round-79-seats/R79Scribe/lesson.md` — `corpus/lessons/round-79.md` with `## Gate`
   (four source candidates, admitted note, six rejected items each with a flip condition, a
   `### Spot check (placeholder)` section), a six-row `## Mistakes` table (four mined from **this**
   round's instrument history, two carried from r78), the six r78 corrections C2 counts, and three new
   corrections for this round's own records.

## Findings

1. **C2 leg (b) is not bound by the counter — `vacuous` (highest severity).** The five
   `*-stale-present` claims are satisfied by the correction text itself: `sc-78-battery-corrected`
   requires `398/398` in `SCORECARD.md`, and `sc-78-battery-stale-present` then finds that same
   occurrence. Proof: a mirror of the lane with the **original** stale rows deleted (`SCORECARD.md`
   line 3846, `SKILL.md` line 3226, `LOG.md` line 3814) and the corrections kept still reports
   `claims 20 mismatches 0`, every `*-stale-present` `ok:true`
   (`.ufo/waves/round-79-seats/R79Scribe/c2-vacuity.json`). The frozen predicate is not amended; the
   fix (scope each presence claim to the record that carries the statement) is named in the lesson's
   Mistakes table. As frozen, C2 leg (b) "every stale statement is still present" is unproven by the
   instrument — the statements do survive today, but the counter would not notice if they did not.
2. **One battery, three numbers.** `claims.json` leg (c) says "87 cases"; the committed lesson's fix
   column said "88 cases"; the committed scored battery ran **90**
   (`.ufo/waves/round-79/scored/c1-negatives-a.json`: `cases 90`, coverage `declared 56 covered 56`).
   The frozen claims state 87, so leg (c) as frozen is not literally satisfied by the committed
   battery. Recorded, not edited (claims are frozen; the kill rule is the judge's to read).
3. **`unfiled-evidence`.** The committed lesson's first Mistakes row cites
   `.ufo/waves/round-79/lesson-proof/kp-run1.json` (30 survivors of 70); the directory holds only
   `c1-nowork.json`, `c2-before.json`, `c2-after.json`. Either the run output is filed before the row
   stands or the row is withdrawn.
4. **`message-polarity`.** `check-record-drift-r79.mjs` prints its failure text as the `detail` of a
   passing claim — e.g. `{"id":"sc-78-nonce-stale-present","ok":true,"detail":"the stale nonce is no
   longer in SCORECARD.md"}` (`lesson-proof/c2-before.json`). A reader sees a contradiction.
5. **S219's path is not `Runtime.pdl`.** At tag 155.0.8059.84 the Blink
   `third_party/blink/public/devtools_protocol/domains/` directory lists 52 `.pdl` files and none is
   `Runtime.pdl`; Runtime is a V8 domain, carried by `v8/include/js_protocol.pdl` at the DEPS
   `v8_revision` `712e1808de2d7416f1276d0deb1ee4ac978132b8` (`DEPS` line 348). The drafted row says so
   in `source` and `scope`, so a later reader does not chase a file that does not exist at the tag.
6. **New measured fact, stronger than r78's.** In one generation the same pinned driver reports
   `backendNodeId` **3** for `#s` and **3** for `#m` under `showPicker()`, and **5** for `#s` under a
   real click (`nodeReport`). The id is a function of the trigger path, not of the element — a literal
   pin would be wrong in both directions. This is the note's law 9 and the lesson's flip condition for
   the rejected "the id identifies the input" item.
7. **Mid-wave gaps (expected, not defects yet).** `scored/cold-runs.txt` and
   `scored/c1-killpower-a.json` are absent at 18:15; C1 legs (b) and (c) cannot be read until the
   executors land the cold runs and the L1 runs kill power. The committed scored counter output is
   clean (56 checks, `findings []`).
8. **The committed knowledge note was below the predicate's own citation bar.** It cites S216-S218
   only (leg (d) says S216-S219) and puts the title before the provenance trio, unlike the r78 note.
   The draft fixes both and adds the source-order detail (the spec's sub-algorithm consumes the
   activation) and the trigger-path id law.

## Gates run by this seat (all read-only)

- Re-fetched all four sources on 2026-11-07 and re-located every quote: S216 200/687,515 B
  `b0202de1c0b4…`; S217 200/171,971 B `db037377f1fb…`; S218 200/135,428 B base64 → 2,818 lines
  `405b52c70185…`; S219 200/94,320 B base64 → 1,848 lines `678fd97bf647…`. S216-S218 hashes match the
  committed rows, so the sources have not moved since the L1's fetch.
- C2 counter on a mirror with the **draft lesson** in place: `claims 20 mismatches 0` — landing the
  draft preserves every string C2 counts (`Correction — round 78 record drift`, `32 carried R77Mut1
  witnesses`, `31`, `9 Mistakes rows`, `8`, both r78 path strings, `pick-multiple`, `L1-cold1`).
- C2 counter on the deletion mirror: `claims 20 mismatches 0` (finding 1).
- Read-only inspection of the scored receipt, `scored/c1-counter-a.json`, `scored/c1-negatives-a.json`,
  `lesson-proof/{c1-nowork,c2-before,c2-after}.json`, the counter and drift-counter sources.

Not run (deliberately): the C1 counter, battery, kill power and selftest against the lane — not this
seat's assignment, and rerunning them would only decorate the report.

## Touched surfaces

Written: `.ufo/waves/round-79-seats/R79Scribe/{knowledge-note.md,sources-rows.md,lesson.md,c2-vacuity.json}`,
`.ufo/waves/round-79/w1/R79Scribe.md`, `.ufo/waves/round-79/w1/R79Scribe/report.md`.
Nothing else in the lane was modified. Scratch `/fast/scratch/hyaku/tabi-r79/R79Scribe/` deleted after
copying the one evidence file into the seat dir.

## Out of scope / not claimed

- No verdict on C1 or C2: the drafts are inputs to the L1's landing, and the predicate, counter, pins,
  priors, thresholds and kill rule are untouched (attacked, never amended).
- No spot check: the `### Spot check (placeholder)` section is the verifier's to fill.
- No claim about the picker UI, cross-origin `SecurityError`, `HTMLSelectElement.showPicker()`, or the
  `NotSupportedError` step — all named as limits/frontier in the note.
