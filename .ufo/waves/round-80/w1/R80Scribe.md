# R80Scribe — round 80, wave w1

## Behavior

Read-only scribe seat. Drafted the three documents the round's leg (d) and C2 need, under
`.ufo/waves/round-80-seats/R80Scribe/`; wrote nothing into the walked trees except this prose report
(and its twin `w1/R80Scribe/report.md`), ran no instrument, committed nothing, and issued no
mutating git/jj command. Evidence base: `claims.json`, `freeze.txt`, the six instrument scripts'
bytes, the three pre-freeze probes, the scored outputs, commits `bf5ba377` → `a1b14284`, the r79
note and lesson, and the scout's staged source bytes.

## Artifacts

- `.ufo/waves/round-80-seats/R80Scribe/knowledge-note.md` — `corpus/knowledge/chromium-showpicker-runtime-round-80.md`:
  provenance trio first, eight generation-r80 laws each with the receipt field path that carries it,
  a source-order paragraph that keeps the r79 spec-vs-Chromium disagreement open, a paragraph
  reconciling r79's "one activation buys one picker" with r80's "two calls both succeed", Limits
  (picker UI, the unmeasured `SecurityError` refusal and its reachability, activation source,
  `backendNodeId`, answered bytes, the 0 ms deferred bracket, the replay/forgery bound, the
  laws-vs-admissibility split, the sibling declarative path), and the frontier.
- `.ufo/waves/round-80-seats/R80Scribe/sources-rows.md` — four contract-v1 rows for the sources the
  scout opened (S216, S218, S212, S208). All four fetches are byte-identical to the r77/r79 ones, so
  the rows are **re-openings**: same ids, no new id minted, registry stays 218 rows (verified:
  `grep -c '^| S[0-9]\{3\} |' corpus/SOURCES.md` → 218). Each row carries a located quote (18, 6, 20,
  8+5 words) and a ≤25-word `teaches`. A re-opening log line is included for the registry's bullet
  section, plus the two files fetched but not registered (`html_input_element.h`, `.idl`) with the
  reason.
- `.ufo/waves/round-80-seats/R80Scribe/lesson.md` — `corpus/lessons/round-80.md`: `## Gate`
  (four re-opened sources with quotes, admitted note, five rejects with flip conditions), `## Mistakes`
  (six rows: `ordering`, `baseline`, `exemption`, `survivor`, `count-vs-verdict`, `inadmissible-base`,
  plus the r79 `scope` class carried and still holding), and `## Corrections — round 79 routed
  defects` naming the four landing places.

## Gates the drafts are shaped to

- `lesson.md` carries the three literal triples `check-record-drift-r80.mjs` `numberTriples()`
  requires in `corpus/lessons/round-80.md` — `battery 102/102`, `kill power 80/80`, `57 checks`, which
  are the post-D8 scored outputs' shapes — with the three earlier red snapshots kept as a dated record.
- `sources-rows.md` keeps the registry at 218 rows and mints no id.
- `knowledge-note.md` leads with `source:` / `verified-at:` / `recheck:` and cites only what the
  receipt's fields and the frozen counter carry.
- No draft contains the counter's `SCHEMA` literal (`scripts/check-showpicker-r80.mjs:44`) — verified
  by grep over the three drafts, so none of them can poison a walked-tree walk if copied.

## Findings (verbatim, with read timestamps)

1. **A prose report inside the walked tree made the scored receipt inadmissible — and D8 fixed the
   check.** At 19:34:09 the counter reported `verdict findings`, `checkCount 57`, one finding
   `prior-set-unparsable`, detail: "files in the round-80 wave/evidence trees that carry the schema and
   do not parse (refused, not skipped):
   /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-80/w1/R80Exec3/report.md,
   /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-80/w1/R80Exec3.md". Both were prose
   files carrying the counter's `SCHEMA` literal (`scripts/check-showpicker-r80.mjs:44`) that do not
   parse as JSON. The receipt's own replay sims were all `refused: false`, so the two files were the
   whole finding. D8 `a1b14284` scoped the check to `.json` files or files starting with `{`, and the
   post-D8 counter is clean (19:36:21, `checkCount 57`, `findings []`). The files are still in the
   walked tree and are now harmless; the seat rules still say prose reports belong in
   `.ufo/waves/round-80-seats/<seat>/`.
2. **The 19:29 battery and kill power were red because the base receipt was refused, not because the
   cases were wrong.** `counter-a.json` (19:28:41): `verdict findings`, one finding
   `replay-event-timeline` — `gapMatched 1 = gapNeed 1` against prior #1, `ownGaps 4`.
   `battery-a.json` (19:28:44): `cases 103`, `failed 100`; the only three passing cases were
   `replay-event-timeline`, `replay-gap-only-refuse`, `replay-at-threshold-refuse` — exactly the
   refusal cases. `killpower-a.json` (19:29:18): `mutants 81, killed 80, survived 1, crashed 0`,
   survivor `replay-gap-threshold-loose`, detail "the battery still exits 0". D6 `045fccc5` made the
   replay rule pair-based (`refused: np > 0 && absMatched >= absNeed`), removing the gap side from the
   refusal; the post-D8 kill-power run is 80 mutants / 80 killed / 0 survivors / 0 crashed.
3. **The digests chain is D3 → D4 → D5 → D6 → D8; the assignment's D (`f9ece656`) is four commits
   stale.** D4 `b2560829` re-pinned `scripts/check-record-drift-r80.mjs` (`6958ca31…` → `53491bf8…`);
   D5 `53ecca84` re-pinned `scripts/negatives-showpicker-r80.mjs` (`fe91f6be…` → `87bb405d…`) and
   reworked the replay bracket; D6 `045fccc5` made the replay rule pair-based; D8 `a1b14284` scoped the
   unparsable-receipt check and re-pinned the counter, battery and kill-power. Each updated
   `freeze.txt` and `claims.json` together; at 19:36 all ten pins in `freeze.txt` re-derived from the
   committed bytes (checked with `sha256sum`). The claims name the nonce as `tabi-r80-l1-<first 12 of
   D>`, so it moved with D; the post-D8 receipt is `tabi-r80-l1-a1b142849e91` (7 legs, `failures []`,
   `finishedAt 2026-11-07T22:36:18.986Z`, fixture sha256 `171c94c2…`).
4. **The drift counter cannot see verdicts, and its required literals move with the scored outputs.**
   `numberTriples()` builds `'battery ' + cases + '/' + cases`, `'kill power ' + mutants + '/' +
   killed`, `checks + ' checks'`. Across four scored runs in twenty minutes the same string
   "battery 103/103" covered 1 failure (19:22), 100 failures (19:29) and a clean 102-case run
   (19:36, after D6/D8 removed a case). The lesson draft carries the post-D8 literals (`battery
   102/102`, `kill power 80/80`, `57 checks`) and states the failures beside them; if the scored
   outputs move again before landing, the L1 must re-sync that paragraph.
5. **The scored outputs were being rewritten while read.** `killpower-a.json` was truncated mid-write
   at 19:34:12 (`SyntaxError: Unexpected end of JSON input`) and completed at 19:35:01; the post-D8
   set was written 19:36:21-19:36:54. A truncated JSON is not a zero and not a pass; any seat reading
   the scored outputs must re-read them after the writer settles.
6. **Final observed state (post-D8, 19:36):** counter `verdict clean`, `checkCount 57`, `findings []`;
   battery `cases 102`, `failed 0`, `cleanVerdict clean`, coverage `declared 57, covered 57,
   uncovered [], unknown []`; kill power `mutants 80, killed 80, survived 0, crashed 0`, no unapplied.
   This is the only state in the round where all three agree, and it exists only after D6 and D8.

## Out of scope / not done

- No commit, push, or jj/git mutation; no driver, counter, battery, kill-power or selftest run; no
  writes under `.ufo/waves/round-80/` or `corpus/evidence/round80/` other than this prose report.
- No edit to `SOURCES.md`, `SCORECARD.md`, `LOG.md`, `SKILL.md` or `corpus/lessons/` — the L1 lands
  the drafts.
- The lesson has no wave-findings section: the wave had not settled at write time and the drafts do
  not invent wave results.
- The note cites `SKILL.md ## Round 80 gate registry`, which does not exist yet (it is leg (d)'s
  landing); the L1 must land the registry with the note.
- The `R80Exec3` files are another seat's artifacts; I report them and leave them in place.

## Tooling

No installs or upgrades; pacman untouched (host-wide pause respected). Only `node` v24.21.0 (read-only
JSON inspection), `sha256sum`, `git log/show/status` (read-only) and the harness's read/grep were used.
Scratch root `/fast/scratch/hyaku/tabi-r80/R80Scribe/` was created empty and deleted before yield; no
receipts were copied into it.

## Limits of this report

- I re-ran no instrument: every number is read from committed bytes or from the scored outputs at the
  stated timestamps, and the lane moved five times (D3 → D8) while the drafts were written.
- The intermediate driver versions exist only as the probes' `driverSha256` fields (`9b803fef…` for
  probe1, `d5c058a7…` for probe2, `cb93935c…` for probe3); the intermediate sources are not committed,
  so the `ordering` and `baseline` rows rest on the probe receipts' own field values.
- The `baseline` row's counterfactual ("a baseline frozen there would have written `opened = []`") is
  marked as such; the observed facts are probe1's zero choosers and probe2's one.
