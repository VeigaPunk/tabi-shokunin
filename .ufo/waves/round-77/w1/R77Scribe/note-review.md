# Round-77 note review — independent re-derivation of the measured table and every citation

Status: **AGREE** with every measured statement in
`corpus/knowledge/chromium-file-chooser-runtime-round-77.md`. No table row and no
measured sentence is contradicted by the receipts. Six live findings remain
(two factual/sourcing in the S213 addition, three exactness/wording, one
provenance); four defects that were live in the HEAD copy were fixed by a
concurrent edit while this review ran (§7 records them, so a judge reading HEAD
does not mistake them for my findings).

## 1. Target, provenance, and the concurrent edit

- Review target (working tree): `corpus/knowledge/chromium-file-chooser-runtime-round-77.md`,
  sha256 `3713426e58a7d1358f9446e69031d6576921a100e50c9351f21e49a6890ab219`,
  mtime `2026-11-07T15:08:42.061Z` (= 12:08:42 -03:00) — `sha256sum` / `stat`, exit 0;
  recorded in `.ufo/waves/round-77-seats/R77Scribe/state-and-extras.json`.
- HEAD (commit `eedaa802`) copy: sha256
  `3217605856b3f268464a405b4e11a4fc608c16b461a61fe8946df95a3ccb4945`
  (`git show HEAD:corpus/knowledge/chromium-file-chooser-runtime-round-77.md | sha256sum`, exit 0).
- `git status --porcelain` at review time lists `M SCORECARD.md`, `M SKILL.md`,
  `M corpus/SOURCES.md`, `M corpus/knowledge/chromium-file-chooser-runtime-round-77.md`
  (plus untracked wave/seat paths); `git diff --stat` shows the note changed
  47 lines and `corpus/SOURCES.md` +5/-1 (exit 0). The edit is not mine; this seat
  wrote only `.ufo/waves/round-77-seats/R77Scribe/` and
  `.ufo/waves/round-77/w1/R77Scribe/`.
- Timeline (`git log -1 --format='%h %cd'`, exit 0): freeze `b51afa7f` 11:48:05;
  digests commit D `dcdf582a` 11:48:10; scored run `ec89a40e` 11:55:55; dispatch
  `eedaa802` 11:56:09. My first read of the note captured the HEAD bytes; the
  working tree changed at 12:08. The review below targets the working-tree bytes.
- `corpus/lessons/round-77.md` is unmodified from HEAD (sha256
  `b53e8be21ac915d29b2c020335be6cc4955445ed4c5cd679425add02d62413ef`,
  mtime `2026-11-07T13:54:54Z`; `git status` does not list it).

## 2. Method and commands

- `node /fast/scratch/hyaku/tabi-r77/R77Scribe/derive-final.mjs` — reads the 16
  honest prior receipts listed by
  `.ufo/waves/round-77/controls/c1/prior-set.txt` plus
  `corpus/evidence/round77/chromium-file-chooser/receipt.json` (17 receipts),
  re-derives per-leg page events, file lists, reads, chooser events, errors,
  send ids and `stateAfter`, normalises the upload path and the session
  `RemoteObjectId`, and writes
  `.ufo/waves/round-77-seats/R77Scribe/derivation.json`. **exit 0**.
- `node /fast/scratch/hyaku/tabi-r77/R77Scribe/check-note2.mjs` — 25 named
  assertions (the 13 table rows, the four global receipt fields and the
  chooser-node law) over the same 17 receipts = 425 instances; output
  `.ufo/waves/round-77-seats/R77Scribe/note-checks.json`. **exit 0,
  "ALL STATEMENTS PASS ON ALL 17 HONEST+A RECEIPTS"**.
- Read payload exactness: every `hex:` read is recomputed with
  `crypto.createHash('sha256')` and compared with the receipt's
  `upload.files[name].sha256`; the only non-hex read is `pick-missing`
  (`error:NotFoundError`) — check inside the same run, **exit 0**.
- `sha256sum`, `wc -l`, `nl -ba` over `.ufo/waves/round-77/sources/` and
  `.ufo/waves/round-77-seats/R77Scout/sources/ElementHandle.ts` — exit 0.
- `/usr/bin/chromium --version` → `Chromium 155.0.8059.84 Arch Linux`, exit 0.
- Receipt fields quoted below are at `corpus/evidence/round77/chromium-file-chooser/receipt.json`
  line anchors: nonce `:3`, driver digest `:5`, `not-file-input` error `:772`,
  `pick-same` cancel `:1285`, `pick-missing` read `:1576`,
  `intercept-cancel` cancel `:2113`, `intercept-off` cancel `:2209`,
  chooser events `:2943` and following, `dir-mode` chooser `:3006-3013`,
  selectMultiple/node 7 `:2952-2959`.

## 3. The measured table — all 13 rows agree

Each row is checked on the 9 pre-freeze smokes, the 4 probes, the 3 shape probes
and the scored receipt; the per-row assertion names are in `note-checks.json`.
Chooser events are bound to legs by `afterSendId == leg.triggerSendId`
(the receipts do not carry a `leg` field on `cdpEventLog`; binding by send id is
the driver's own law, `scripts/chrome-cdp-filechooser-round77.mjs:422`).

| Note row (working-tree line) | Derivation | Verdict |
|---|---|---|
| pick-single (`:63`) | chooser `selectSingle`, `backendNodeId` 5 (`receipt.json:2943-2950`); `input`+`change` trusted with `[tabi-a.txt,11,text/plain]`; read `hex:746162692d616c7068610a` = `tabi-alpha\n`, 11 bytes (sha256 equals `upload.files["tabi-a.txt"]`) | **AGREE** |
| pick-multiple (`:64`) | `selectMultiple`, node 7 (`:2952-2959`); `stateAfter.m` = `[["tabi-a.txt",11,"text/plain"],["tabi-b.bin",5,"application/octet-stream"]]`; both reads exact (`hex:746162692d616c7068610a`, `hex:00010203ff`) | **AGREE** |
| pick-same (`:65`) | chooser `selectSingle`; exactly one `cancel`, `isTrusted:true`, `act:false` (`:1285-1290`), no `input`/`change`; selection kept | **AGREE** |
| pick-first-only (`:66`) | `change` with `[["tabi-b.bin",5,"application/octet-stream"]]` only; `stateAfter.s` = b.bin only | **AGREE** |
| pick-missing (`:67`) | `change` with `[["tabi-missing.txt",0,"text/plain"]]`; read `ret:"error:NotFoundError"` (`:1576`); `setError:null` | **AGREE** |
| pick-empty (`:68`) | chooser opens; no `input`/`change`/`cancel`; `setResult:{}`; `stateAfter.s` keeps the missing-file selection | **AGREE** |
| dir-mode (`:69`) | `selectSingle`, node 14 (`:3006-3013`); no `setFileInputFiles` (`setSendId:null`); only the trusted pointer/click sequence, no file event | **AGREE** (see F4 for "the click only") |
| accept-ignored (`:70`) | `selectSingle`, node 18; `stateAfter.k` = `[["tabi-a.txt",11,"text/plain"]]` | **AGREE** |
| forward-click (`:71`) | five trusted button events (`target:"f"`), forwarded `click@s` `isTrusted:false`, `x=y=0`, `act:true`; chooser `selectSingle`, node 5; then trusted `input`/`change`/read | **AGREE** |
| script-click (`:72`) | no chooser; one `click@s` `isTrusted:false`, `act:false`; `elapsedMs` 1801–1827 (≈1.5 s wait) | **AGREE** |
| not-file-input (`:73`) | `setError {code:-32000, message:"Node is not a file input element"}` (`:772`); zero page events for the leg | **AGREE** |
| intercept-cancel (`:74`) | chooser `selectSingle` + one trusted `cancel` (`:2113-2120`); selection unchanged | **AGREE** |
| intercept-off (`:75`) | no chooser; one trusted `cancel` (`:2209-2216`), 0.4–7.6 ms after the click across the 17 receipts; `act:false` | **AGREE** |

Global statements, all 17 receipts:

- 15 legs in plan order; 79 events; 11 ≥50 ms gaps; 10 `Page.fileChooserOpened`
  events, all with the recorded main frame id; one `Page.frameNavigated` whose
  url is exactly `origin + "/?run=" + nonce` — `note-checks.json` (425/425).
- Every `input`/`change`/`cancel` event is `isTrusted:true` with `act:false`
  (`act` is `navigator.userActivation.isActive`, fixture source
  `scripts/chrome-cdp-filechooser-round77.mjs:169`) — 17/17.
- `backendNodeIds` 5 / 7 / 14 / 18 for `#s` / `#m` / `#d` / `#k` in every opening
  leg, 17/17; every receipt's embedded `legShape` is byte-identical (one group of
  17 in `derivation.json`).
- `note-checks.json`: 25 statements × 17 receipts = 425/425, exit 0.

## 4. Protocol section — citation-by-citation

All line numbers are checked with `nl -ba` against
`.ufo/waves/round-77/sources/` (sha256 and line counts match `FETCH.txt`).

| Note citation (working-tree line) | Source check | Verdict |
|---|---|---|
| `Page.pdl:1279-1288` (`:22`) | command block 1279-1288; 1280-1281 the quoted sentence | AGREE |
| `1285-1286` verbatim cancel flag (`:24-25`) | 1285 "If true, cancels the dialog by emitting relevant events (if any)" / 1286 "in addition to not showing it if the interception is enabled" | AGREE |
| `:1294-1304`, `frameId` 1298, `mode` 1301-1302, comment 1303, field 1304 (`:25-28`) | exact (`Page.pdl:1298,1301,1302,1303,1304`) | AGREE (fixed concurrently; §7) |
| `DOM.pdl:681-691` (`:29`) | 682 command, 685 files, 687/689/691 the three selectors | AGREE |
| `inspector_page_agent.cc:1899-1913`, `1909-1910` (`:30-31`) | exact | AGREE |
| `file_input_type.cc:203-204` for `input.Multiple()` (`:31-32`) | 203 `probe::FileChooserOpened(..., input.Multiple(),` / 204 `&suppressed, &canceled);` | AGREE |
| `:1949-1956`, quote at `1953` (`:32-33`) | exact | AGREE |
| `file_input_type.cc:181-188`, quote at 183 (`:34-35`) | exact | AGREE |
| `:200-210` (`:36-37`) | 203 probe, 206-207 `if (canceled) SetFilesAndDispatchEvents(nullptr)` | AGREE |
| `:465-481`, `469`, `479` (`:37-38`) | 469 `if (SetFiles(files) || force) {`; 479 `GetElement().DispatchCancelEvent();` | AGREE |
| `:483-508`, `498` (`:39-40`) | 483 `FilesChosen`, 498 `force_change_event_ = true;`, 496-497 `FilePickerEventsFixEnabled() && HasConnectedFileChooser()`, 508 closing brace | AGREE |
| `:525-533` (`:41-42`) | 525 `SetFilesFromDirectory`, 532 `NewFileChooser(params)->EnumerateChosenDirectory();`, 533 close | AGREE |
| `:533-556`, `536-537`, `552-554` (`:43-44`) | 536-537 and 552-554 exact; the function `SetFilesFromPaths` starts at **535** (533 is the preceding brace, 534 blank) | AGREE on content; range start loose (F5) |
| `inspector_dom_agent.cc:1806-1810`, `1809`, `1812-1815` (`:45-47`) | exact | AGREE |
| S213 `134-135`, `139` (`:48-52`) | `.ufo/waves/round-77-seats/R77Scout/sources/ElementHandle.ts:134,135,139`; sha256 `c86ed958…c445`, 220 lines | AGREE on location; quote boundaries (F3) |
| `S210 189-191` inference (`:78`) | `file_input_type.cc:189-191` (`FileColorPickerConsumeActivationEnabled`) | AGREE; labelled inference, flag state unread |

## 5. Practice and Limits

- Practice "page-stub upload … untrusted events and no chooser event": 
  `degenerate-page-stub.receipt.json` — 0 `Page.fileChooserOpened`, 16
  `input`/`change` all `isTrusted:false` (`state-and-extras.json`). AGREE.
- Practice "a `userGesture:true` script click opens a real chooser but its click
  is untrusted": `degenerate-eval-trigger.receipt.json` — 10 chooser events,
  13 clicks all `isTrusted:false`, 12 of them `act:true`. AGREE.
- Practice "re-selecting … expect cancel", "single input keeps the first path",
  "`[]` is a no-op", "missing path is a 0-byte File", "`accept` filters nothing":
  all four are the `pick-same` / `pick-first-only` / `pick-empty` /
  `pick-missing` / `accept-ignored` rows above. AGREE.
- Limits "`webkitdirectory` with a DIRECTORY path … 0-4 ms … one `File` per
  regular file, nested included, `webkitRelativePath` rooted at the basename;
  0 second chooser events": `R77Exec3/probe-run-{1,2,3}.json` give
  `commandLatencyMs` 4 / 4 / 1, `fileCount` 3, `rels`
  `d-…/a-first.txt`, `d-…/b-two.bin`, `d-…/sub/three-deep.txt`,
  `secondChooserAfterSet` 0, `verdict:"HOLDS"`, `failures:[]`; the `nondir`
  control is `probe-run-nondir.json` (`fileCount` 1, `rels:[""]`,
  `verdict:"MEASURED"`). AGREE.
- Limits "headful would show a native picker", "drag-and-drop … `showPicker()`
  … not part of this capability": no receipt exists; correctly marked
  not measured. **Not verified, not counted as passed.**
- Limits last line: the counter's per-prior `limit` block is in
  `.ufo/waves/round-77/claims.json` (checked: the `limit` field is present and
  the scored counter prints 19 entries with absNeed 40 / gapNeed 9). AGREE.

## 6. Live findings (working-tree bytes)

**F1 (factual, header).** `:1` lists `S213` and says
"opened 2026-11-07, round 77, before the freeze". `corpus/SOURCES.md:227`
records S213 fetched at `2026-11-07T12:07:51-03:00`; freeze `b51afa7f` is
11:48:05 and D `dcdf582a` 11:48:10 (`git log -1`, exit 0). S213 is ~20 min
after D, so "before the freeze" is false for it, and the parenthetical names
only the five Chromium files, not the Puppeteer file. Proposed wording:
"source: S208–S212 (opened 2026-11-07, before the freeze) and S213
(client-side corroboration, opened 2026-11-07T12:07:51-03:00, after the freeze;
not a claim source)".

**F2 (sourcing).** `:53-54` says "this tag pins Chrome 156.0.8078.47". The
staged Puppeteer file contains no `156.0` string
(`grep -n '156\.0' …/R77Scout/sources/ElementHandle.ts` → no match, exit 1;
`state-and-extras.json` `versionStringInFile:false`). Proposed: cite the tag's
revision file (e.g. `packages/puppeteer-core/src/revisions.ts`) or drop the
number; the "not this lane's Chromium 155.0.8059.84" caveat can stay.

**F3 (verbatim).** `:48-49` quotes "the zero-length array is a special case,
it seems that / `DOM.setFileInputFiles` does not actually update the files in
that case". The source at 134 begins "The zero-length" (capital T) and line 135
continues ", so" after "case"; the note lower-cases the first letter, uses "/"
for the line join and drops ", so" without an ellipsis. Proposed: reproduce the
two lines verbatim (or mark the join and the truncation), e.g.
"The zero-length array is a special case, it seems that DOM.setFileInputFiles
does not actually update the files in that case, so …". Minor.

**F4 (wording).** `:69` "the click only" for `dir-mode`: the page records five
trusted pointer/click events (`pointerdown`, `mousedown`, `pointerup`, `mouseup`,
`click`), not one. Proposed: "the pointer/click sequence only (no
`input`/`change`/`cancel`)". Minor.

**F5 (exactness).** `:43` and `:41`/SOURCES S210 use `:533-556` for
`SetFilesFromPaths`, but the function is declared at 535; 533 is the closing
brace of `SetFilesFromDirectory` and 534 is blank. The cited lines 536-537 and
552-554 are exact. Proposed: `:535-556` (the same range in the lesson's accept
bullet). Minor.

**F6 (provenance).** S213's bytes are staged only at
`.ufo/waves/round-77-seats/R77Scout/sources/ElementHandle.ts`
(sha256 `c86ed958…c445`, 220 lines, matches `SOURCES.md:227`), not in
`.ufo/waves/round-77/sources/`, and `FETCH.txt` has no S213 row (it lists five
Chromium files). The note does not say where the Puppeteer bytes live.
Proposed: copy the file into `sources/` and append a FETCH row, or name the
scout path in the note. (Read-only seat: I did not move it.)

## 7. Defects that were live in the HEAD copy and were fixed concurrently

These are recorded so they are not attributed to the current bytes:

1. HEAD `:25` had `:1294-1303` while the `backendNodeId` field is at 1304; the
   working tree has `:1294-1304` and names the field at 1304 (`:25-28`).
2. HEAD's S211 bullet attributed "the probe is called with `input.Multiple()`"
   to S211; the working tree cites `file_input_type.cc:203-204` (`:31-32`).
3. HEAD's measured heading said "identical in every per-leg field"; the working
   tree says "every per-leg `legShape` entry is byte-identical across all 16
   runs" (`:56`), which is the accurate form: `elapsedMs` varies (e.g.
   pick-single 316–351 ms, script-click 1801–1827 ms in
   `derivation.json` `checks.elapsedMs`), and the session `RemoteObjectId`
   varies; every `legShape` and every other recorded per-leg field is identical
   across the 17 receipts once those are normalised (one group of 17 in
   `derivation.json` `checks.semanticGroups`).
4. HEAD's cancel-flag quote omitted "if the interception is enabled" without an
   ellipsis; the working tree quotes 1285-1286 and includes it.

Evidence: `git diff -U2 -- corpus/knowledge/chromium-file-chooser-runtime-round-77.md`
(exit 0), reproduced in §1's hashes and in
`.ufo/waves/round-77-seats/R77Scribe/state-and-extras.json`.

## 8. Not verified / labelled

- The `[inference]` about `FileColorPickerConsumeActivationEnabled` (`:78`) is
  labelled; the flag's state is not in any receipt, so the cause is not measured
  (the value, `act:false`, is). I did not run the build to read the flag.
- Headful behaviour, drag-and-drop file delivery and `showPicker()` have no
  receipts; the note marks them not measured. Not counted.
- The exploration history in the Limits (the earlier non-returning directory
  call) is superseded by the R77Exec3 paragraph in the same section; the
  superseding receipts were verified above.

## 9. Evidence

- `.ufo/waves/round-77-seats/R77Scribe/derivation.json` — per-leg derivation for
  17 receipts, equality groups, elapsed ranges, event/gap/chooser counts.
- `.ufo/waves/round-77-seats/R77Scribe/note-checks.json` — 425/425 assertions.
- `.ufo/waves/round-77-seats/R77Scribe/state-and-extras.json` — hashes, mtimes,
  S213 staged bytes/quotes, R77Exec3 outcomes, degenerate facts, cancel delays,
  commands and exits.
- `.ufo/waves/round-77-seats/R77Scribe/gate-quotes.json` — lesson quote check
  (see `gate-review.md`).
