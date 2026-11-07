FINDINGS

# R77Scribe — independent re-derivation of the round-77 note and the lesson Gate

## Behaviour

Read-only seat. I re-derived, from the raw receipts with `node`/`python3`, the
per-leg page events, file lists, reads, chooser events, errors and `stateAfter`
for the 9 pre-freeze smokes, the 4 probes, the 3 shape probes and the scored
receipt (17 receipts in all), and checked the working-tree note, the SOURCES rows
S208–S213 and the lesson against that derivation and against the staged sources.
I wrote no product code, no instrument, no note/SOURCES/SCORECARD/SKILL byte, and
ran no git/jj mutation (only `git show/log/diff/status/rev-parse`). I installed
no tools. Scratch (`/fast/scratch/hyaku/tabi-r77/R77Scribe/`) was removed before
the final yield; the evidence JSON it produced was copied to
`.ufo/waves/round-77-seats/R77Scribe/` first.

Unexpected repo changes during the seat (not mine, adapted to):
`git status --porcelain` shows `M SCORECARD.md`, `M SKILL.md`, `M corpus/SOURCES.md`,
`M corpus/knowledge/chromium-file-chooser-runtime-round-77.md` and untracked peer
seat/wave paths. The note and SOURCES were edited at 12:08:14/12:08:42 -03:00,
**after** the freeze (`b51afa7f` 11:48:05), D (`dcdf582a` 11:48:10) and the
scored run (`ec89a40e` 11:55:55) (`git log -1 --format='%h %cd'`, exit 0). My
first read captured the HEAD bytes; the review targets the working-tree bytes
(note sha256 `3713426e…ab219`; HEAD copy `3217605…4945`; `sha256sum`, exit 0).

## Gates — measured

- **Measured table.** 25 named assertions (the 13 note rows, 15-leg/79-event/
  10-chooser/one-navigation checks, the trust/activation law and the
  backendNodeId law) × 17 receipts = **425/425 pass**, `node
  .../check-note2.mjs` **exit 0** ("ALL STATEMENTS PASS ON ALL 17 HONEST+A
  RECEIPTS"). Evidence `round-77-seats/R77Scribe/note-checks.json`.
- **Per-leg identity.** One `legShape` group of 17 and one semantic group of 17
  after excluding `elapsedMs` and the session `RemoteObjectId`; `elapsedMs`
  varies (pick-single 316–351 ms, script-click 1801–1827 ms) —
  `round-77-seats/R77Scribe/derivation.json` `checks`.
- **Read exactness.** Every `hex:` read recomputes to the receipt's
  `upload.files[name].sha256`; the only non-hex read is `pick-missing`
  `error:NotFoundError` (`corpus/evidence/round77/chromium-file-chooser/receipt.json:1576`);
  check exit 0.
- **Lesson Gate.** Seven quotes over S208–S212 all occur at the stated lines and
  are ≤25 words (`8/8/11/3/1/9/20` words); all five row anchors resolve to the
  staged sources (`gate-quotes.json`; `nl -ba` exit 0). Source digests and line
  counts recomputed equal `FETCH.txt`: `DOM.pdl` 1022 `50c46045…f702`,
  `inspector_dom_agent.cc` 3642 `e7c983b4…c84f`, `file_input_type.cc` 650
  `f96265db…f705`, `inspector_page_agent.cc` 2003 `1dd744b5…49a8cf`, `Page.pdl`
  1795 `e944a3b1…05be` (`sha256sum`/`wc -l`, exit 0).
- **S213 (post-freeze addition).** Staged copy
  `.ufo/waves/round-77-seats/R77Scout/sources/ElementHandle.ts` sha256
  `c86ed958…c445`, 220 lines = `corpus/SOURCES.md:227`; quotes at 134-135 and
  139 verified; `156.0` absent from the file (`grep` exit 1).
- **New Limits paragraph.** `R77Exec3/probe-run-{1,2,3}.json`:
  `commandLatencyMs` 4/4/1, `fileCount` 3, nested `sub/three-deep.txt` included,
  `webkitRelativePath` rooted at the directory basename, `secondChooserAfterSet`
  0, `verdict:"HOLDS"`, `failures:[]`; `nondir` control `MEASURED`. The note's
  paragraph is supported.
- **Host.** `/usr/bin/chromium --version` → `Chromium 155.0.8059.84
  Arch Linux`, exit 0; receipt `host.argv[0]` `/usr/bin/chromium`, headless true;
  `Emulation.setDeviceMetricsOverride` 1280×900 DSF 1 — note `verified-at` and
  the receipt agree.

## Findings

Note (working-tree bytes):
- **F1** `corpus/knowledge/chromium-file-chooser-runtime-round-77.md:1` lists
  S213 and says "opened … before the freeze"; S213 was fetched
  `2026-11-07T12:07:51-03:00` (`corpus/SOURCES.md:227`), after D (11:48:10).
  Proposed: scope S208–S212 to "before the freeze" and mark S213 client-side,
  post-freeze, not a claim source.
- **F2** `:53-54` "this tag pins Chrome 156.0.8078.47" has no anchor in the
  staged Puppeteer file (`grep '156\.0'` → no match); cite the tag's revision
  file or drop the number.
- **F3** `:48-49` S213 quote: source begins "The" (capital), line 135 continues
  ", so"; the note lower-cases, joins with "/" and truncates without an
  ellipsis. Minor verbatim.
- **F4** `:69` dir-mode "the click only": the page records five trusted
  pointer/click events, no file event. Proposed "the pointer/click sequence
  only".
- **F5** `:43` (and `:41`) S210 `:533-556`: `SetFilesFromPaths` is declared at
  535 (533 is the preceding brace); cited 536-537/552-554 are exact. Proposed
  `:535-556`.
- **F6** S213's bytes are staged only under the R77Scout seat dir, absent from
  `.ufo/waves/round-77/sources/` and `FETCH.txt`; the note names no path.
  Proposed: stage a copy and add a FETCH row, or name the scout path.

Lesson (`corpus/lessons/round-77.md`, unmodified from HEAD):
- **D1** `:6` "the 13 pre-freeze receipts (3 shape probes, 4 probes, 9 smokes)"
  — 3+4+9=16 and `:96` says "16/16"; `prefreeze-summary.json` receipts 13 =
  p1-p4+smoke1-9; `prior-set.txt` has 16 receipt lines before the degenerates.
- **D2** `:10` "Mistakes row 6" is the round-76 carry-over (`:128`); the
  attempt-2 repair is the row at `:136`, which also sits **after** `## Census`
  (`:133-135`) and therefore outside the Mistakes table. Proposed: move it under
  the table and cite row 7.
- **D3** `:109` cites S210 `224`, outside the S210 row's mined lines
  (`174-212, 465-481, 483-508, 525-556`, `corpus/SOURCES.md:224`); content at
  `file_input_type.cc:224` is correct.
- **D4** `:96` "identically in every per-leg field" — true for `legShape` and
  every recorded field except `elapsedMs`/session id; same precision class the
  note heading fixed.
- **D5** `:108` `SetFilesFromPaths (S210 533-556)` — function at 535 (same as
  F5).
- **D6** `:96` and the Admitted bullet say the note cites S208–S212; the note now
  also cites S213. Add the client-side scope or sync the note.
- **D7** `:7` "the three degenerate drivers" — one driver with three
  `--degenerate` modes (`scripts/chrome-cdp-filechooser-round77.mjs:7,82-83`;
  `controls/c1/degenerate-*.args.txt`).

Fixed concurrently (recorded so HEAD readers do not attribute them to the
current bytes): the note's HEAD `:1294-1303` (now 1294-1304 with the field at
1304), the S211/`input.Multiple()` attribution (now S210 203-204), the
"identical in every per-leg field" heading (now `legShape` byte-identical), the
incomplete cancel-flag quote (now 1285-1286 with the condition); SOURCES S210
scope and S212 range edited at 12:08:14. Evidence: `git diff -U2` (exit 0),
`state-and-extras.json`.

## Touched surfaces

- `.ufo/waves/round-77-seats/R77Scribe/derivation.json` (sha256 `b8ca9860…cf84`)
- `.ufo/waves/round-77-seats/R77Scribe/note-checks.json` (`1f8b25b3…006b`)
- `.ufo/waves/round-77-seats/R77Scribe/gate-quotes.json` (`291f2626…a35a`)
- `.ufo/waves/round-77-seats/R77Scribe/state-and-extras.json` (`8d6406eb…a439`)
- `.ufo/waves/round-77/w1/R77Scribe/note-review.md`
- `.ufo/waves/round-77/w1/R77Scribe/gate-review.md`
- `.ufo/waves/round-77/w1/R77Scribe/report.md`
- `.ufo/waves/round-77/w1/R77Scribe.md` (the seat's `Report:` trailer path)

Nothing else was written; no `.json` was written under `.ufo/waves/round-77/`,
`corpus/evidence/round77/` or any sibling seat dir.

## Out of scope / not run

- The counter, driver, battery and kill power were **not** re-run: that is not a
  scribe's job and the assignment forbids decorating the report with re-runs.
  The committed scored outputs were read instead (`scored/c1-counter-a.json`
  clean 183; `c1-negatives-a.json` 336/336 allOk; `c1-kill-power-a.json` 253/253,
  holds true, survivors [], crashed []).
- Headful behaviour, drag-and-drop files and `showPicker()` remain unmeasured
  and are labelled so in the note; not counted as passed.
- The note/SOURCES/SCORECARD/SKILL edits are the L1's concurrent integration
  work, not this seat's; I neither propose nor perform edits to them.
- Product code, the judge, commits, pushes and sibling repos were untouched.

## Commands and exits

- `node .../derive-final.mjs` → exit 0 (writes `derivation.json`).
- `node .../check-note2.mjs` → exit 0, 425/425.
- `python3` gate-quote check → exit 0, "all found: True all <=25: True".
- `sha256sum` / `wc -l` / `nl -ba` / `grep` / `stat` / `git show|log|diff|status`
  → exit 0 for every cited check (S213 `grep` exit 1 by design: no `156.0` in
  the file).
- `/usr/bin/chromium --version` → exit 0.
