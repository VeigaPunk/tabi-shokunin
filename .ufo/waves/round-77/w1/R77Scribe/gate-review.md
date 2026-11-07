# Round-77 gate review — S208–S212 quotes, lines and anchors, plus the S213 addition

Status: **PASS on all seven lesson quotes** — each occurs at its stated line(s)
and is ≤25 words; after the 12:08 `corpus/SOURCES.md` edit every one of the five
rows' anchors resolves to the source. Residual defects are documentary: the
lesson's 13-vs-16 receipt arithmetic (it contradicts its own 16/16 line), the
`Mistakes row 6` cross-reference (the repair row is the seventh, and it is
orphaned after `## Census`), the `S210 224` citation outside the row's mined
lines, and the post-freeze S213 addition not being reflected in the lesson.

## 1. Method

- Quotes: whitespace-normalised (comment `# ` stripped per line) substring
  search over the stated source window; first-line check; word count split on
  whitespace. Output `.ufo/waves/round-77-seats/R77Scribe/gate-quotes.json`;
  command `python3` over `.ufo/waves/round-77/sources/` (exit 0,
  "all found: True all <=25: True").
- Lines and anchors: `nl -ba` over the five staged sources and the two Puppeteer
  lines (exit 0). sha256 and `wc -l` recomputed and compared with
  `.ufo/waves/round-77/sources/FETCH.txt` (exit 0).
- Row metadata and scope/anchor cells read from `corpus/SOURCES.md:222-227`
  (working tree; the S210/S212 cells changed at 12:08:14, see §4).

## 2. Per-row quote check (lesson `## Gate` → `### Sources — new rows`)

| Row | Lesson quote | Stated line(s) | Found there | Words | ≤25 |
|---|---|---|---|---|---|
| S208 | "Sets files for the given file input element." | 681 | yes — `DOM.pdl:681` "  # Sets files for the given file input element." | 8 | yes |
| S209 | "return protocol::Response::ServerError(\"Node is not a file input element\");" | 1809 | yes — `inspector_dom_agent.cc:1809` verbatim | 8 | yes |
| S210 | "File chooser dialog can only be shown with a user activation." | 183 | yes — `file_input_type.cc:183` verbatim (inside the `AddConsoleMessage` call at 184-186) | 11 | yes |
| S210 | "if (paths.empty()) return;" | 536-537 | yes — `file_input_type.cc:536` "if (paths.empty())" + 537 "return;" (two-line quote; the lesson joins them) | 3 | yes |
| S210 | "GetElement().DispatchCancelEvent();" | 479 | yes — `file_input_type.cc:479` verbatim | 1 | yes |
| S211 | "// Cancel file chooser only if interception is enabled." | 1953 | yes — `inspector_page_agent.cc:1953` verbatim | 9 | yes |
| S212 | "When file chooser interception is enabled, native file chooser dialog is not shown. Instead, a protocol event `Page.fileChooserOpened` is emitted." | 1280-1281 | yes — `Page.pdl:1280` + 1281 (comment lines; the quote is the text after `# ` and spans the two lines) | 20 | yes |

No quote is misattributed to a different file, and every quote is inside the
range its row names. The S210/S212 quotes at 479, 536-537, 1280-1281 are exactly
the lines the row anchors name.

## 3. Per-row anchor match (row cells vs source)

| Row (`corpus/SOURCES.md`) | Row anchor / scope | Source check | Match |
|---|---|---|---|
| S208 (`:222`) | scope+anchor `681-691` (the command, its files array and its three node selectors) | `DOM.pdl:681` comment, `682` `command setFileInputFiles`, `685` `array of string files`, `687` `NodeId`, `689` `BackendNodeId`, `691` `RemoteObjectId` | **yes** |
| S209 (`:223`) | scope `1795-1817`; anchor `1806-1810` (refusal at 1809), `1812-1815` (paths to `SetFilesFromPaths`) | `inspector_dom_agent.cc:1795` function start, `1806-1810` refusal, `1809` message, `1812-1815` paths, `1817` close | **yes** |
| S210 (`:224`) | scope `174-212, 465-481, 483-508, 525-556`; anchor `181-188`, `200-210`, `465-481`, `483-508`, `525-533`, `533-556` | `file_input_type.cc`: 181-188 activation return, 183 quote; 200-210 probe + suppressed/cancelled; 465-481 `SetFilesAndDispatchEvents`, 469 condition, 479 cancel; 483-508 `FilesChosen`, 496-498 `force_change_event_`; 525-533 `SetFilesFromDirectory`; 533-556 `SetFilesFromPaths` (function at 535, 536-537 empty list, 552-554 `files[0]`) | **yes**, with the 533-start looseness in §5 |
| S211 (`:225`) | scope+anchor `1899-1913` and `1949-1956` (comment 1953) | `inspector_page_agent.cc:1899-1913` `FileChooserOpened` (1909-1910 mode), `1949-1956` `setInterceptFileChooserDialog` (1953 comment) | **yes** |
| S212 (`:226`) | scope `1279-1288` and `1294-1304`; anchor "frameId at 1298, mode 1301-1302, comment 1303, field 1304" | `Page.pdl:1279-1288`; `1294-1304`; 1298 `FrameId frameId`; 1301-1302 `selectSingle`/`selectMultiple`; 1303 comment; 1304 `backendNodeId` | **yes** (current bytes; the HEAD row said `1294-1303`, fixed at 12:08:14) |

## 4. Row metadata, digests, staging

- All five rows (`corpus/SOURCES.md:222-226`): kind `code`, tier `A`, status
  `mined`, opened `2026-11-07`, recheck `on-release`, used-by the round-77 note
  and this lesson. S213 (`:227`): kind `code`, tier `A`, status `mined`, opened
  `2026-11-07`, recheck `on-release`, used-by the round-77 note only.
- Decoded sha256 / line counts recomputed and equal to `FETCH.txt`:
  `DOM.pdl` 1022 `50c46045…f702`; `inspector_dom_agent.cc` 3642
  `e7c983b4…c84f`; `file_input_type.cc` 650 `f96265db…f705`;
  `inspector_page_agent.cc` 2003 `1dd744b5…49a8cf`; `Page.pdl` 1795
  `e944a3b1…05be` (`sha256sum`/`wc -l`, exit 0).
- The lesson's "All fetched … between 05:52:52 and 05:52:57 -03:00" matches
  `FETCH.txt` (five rows); the lesson's line counts and digest prefixes match the
  five files.
- S213 (post-freeze): staged only at
  `.ufo/waves/round-77-seats/R77Scout/sources/ElementHandle.ts`, sha256
  `c86ed958566f5c94136bac9c90ba3c167b2221e652dc917f70e202ba2225c445`, 220 lines
  — equal to the row's values. It is absent from
  `.ufo/waves/round-77/sources/` and from `FETCH.txt`. The row's fetch time is
  `2026-11-07T12:07:51-03:00`, after D (`dcdf582a`, 11:48:10).

## 5. Residual defects

**D1 (arithmetic, self-contradiction).** `corpus/lessons/round-77.md:6` says
"the 13 pre-freeze receipts (3 shape probes, 4 probes, 9 smokes)". 3+4+9 = 16,
and line 96 of the same lesson says "16/16 honest pre-freeze runs (3 shape
probes, 4 probes, 9 smokes)". `prefreeze-summary.json` has `receipts: 13` with
rows p1-p4 + smoke1-9 (4+9), and `prior-set.txt` has 16 receipt lines before the
three degenerates (3+4+9). Proposed: "the 16 honest pre-freeze receipts
(3 shape probes, 4 probes, 9 smokes), 13 of them in the pre-freeze gate pass".

**D2 (cross-reference, and a misplaced row).** `:10` says the repaired
attempt-1 artefact is "(Mistakes row 6)". The Mistakes table (`:121-128`) has
six rows; row 6 (`:128`) is the round-76 carry-over, not the repair. The repair
is the row at `:136` — which sits **after** the `## Census` section (`:133-135`),
so it is not part of the table block at all (markdown: the table ends at `:128`,
and `:136` starts a headerless table after a heading). Proposed: move the
attempt-2 row up under `:128` and change the reference to "Mistakes row 7" (or
"the attempt-2 row").

**D3 (scope mismatch).** `:109` cites "accept types go only to the native
chooser's params, 224". The S210 row's mined lines are `174-212, 465-481,
483-508, 525-556` (`corpus/SOURCES.md:224`), so 224 is outside the declared
scope (it was outside the pre-edit scope too). The content at 224 is correct —
`file_input_type.cc:224` is `params.accept_types = CollectAcceptTypes(input);`
inside `OpenPopupView` — so the fix is to extend the row's scope to include 224
(or re-anchor the sentence to a mined line). The other accept citation, 530, is
inside the current 525-556 scope.

**D4 (precision, same class as the fixed note heading).** `:96` says "measured
identically in every per-leg field on 16/16 honest pre-freeze runs". `legShape`
and every recorded per-leg field are identical across the 16 (+ the scored
receipt) once `elapsedMs` and the session `RemoteObjectId` are excluded; the
timings are not identical (e.g. `elapsedMs` pick-single 316–351 ms,
script-click 1801–1827 ms in `derivation.json`). Proposed: "identical in every
per-leg `legShape` field (timings excluded)".

**D5 (range start).** `:108` cites `SetFilesFromPaths (S210 533-556)`; the
function is declared at 535 (533 is the preceding closing brace, 534 blank).
The cited 536-537 and 552-554 are exact. Proposed `:535-556` (same as note
finding F5).

**D6 (cross-file sync).** `:96`'s sentence and the Admitted bullet say the note
"cites S208–S212"; the working-tree note also cites S213
(`corpus/knowledge/…:1,48-54`), a client-side Puppeteer row fetched at
12:07:51, after the freeze. Proposed: add "S213 is client-side corroboration,
not a claim source" to the lesson, or scope the note's header as in note
finding F1.

**D7 (wording).** `:7` says "the three degenerate drivers"; there is one driver
(`scripts/chrome-cdp-filechooser-round77.mjs`) with
`--degenerate page-stub|eval-trigger|swap-files` (`:7,82-83`), run three times
(`controls/c1/degenerate-*.args.txt`). Proposed: "the three degenerate driver
runs (one driver, three `--degenerate` modes)".

## 6. Lesson claims checked against the receipts (beyond the Gate)

- "Round 76 was admitted … C1 verifies, coverage improved, calibration
  unchanged, 0 disagreements": `corpus/lessons/round-76-verifier-spotcheck.md:72`
  ("Ruled **calibration unchanged**") and the axes table at `:89-93`; the
  routed-defect list matches the lesson's five routed defects. **AGREE.**
- "a fresh driver run → counter clean 183": `scored/c1-counter-a.json`
  `verdict:"clean"`, `checkCount:183`, `findings:[]`, limit block 19 entries
  with absNeed 40 / gapNeed 9. **AGREE.**
- "the battery 336/336 `allOk` on that run": `scored/c1-negatives-a.json`
  `cases:336`, `passed:336`, `allOk:true`, `launderedCases:3`, `checkIds:183`;
  `prefreeze-summary.json` rows p1-p4 and smoke1-9 each 336/336. **AGREE.**
- "`controls-c1.mjs` `allOk` rc 0": `controls/c1/controls-summary.json`
  `allOk:true`, 20 results, 0 bad; `controls-run.out` ends `allOk=true`.
  **AGREE.**
- "the full pre-freeze gate pass re-run over the final bytes":
  `run-prefreeze-gates.out` shows counter=0 battery=0 for p1-p4 and smoke1-9 and
  killpower=0 for smoke1-9. **AGREE.**
- "207 rows at base": `git show 1320d428:corpus/SOURCES.md | grep -cE
  '^ {0,3}\| S[0-9]{3,} '` → 207; `census/start.txt` ends `exit=0`. **AGREE.**
- "QUALITY 145–148" (and 149): `corpus/QUALITY.md:1010-1018` has 145, 146, 147,
  148, 149. **AGREE.**
- Red states: `lesson-proof/counter-pass1/pf-*.counter.json` — 12 of 13 refuted
  by `event-types`, smoke1 clean; `lesson-proof/attempt2-battery-fresh-receipt-pass1.json`
  `failed:["accept-prior-tol-out-0.051"]` with the exact quoted error
  "bracket misplaced: abs 2 (need 40) gap 4 (need 9) want 0 / <9";
  `prefreeze-pass1/pf-p2.battery.json` and `pf-smoke2.battery.json` fail the
  gap-bracket cases; `pf-smoke2.killpower.out` `holds:false`; 
  `killpower-trial1-smoke1-pipe-truncation.json` `crashed` 40 mutants plus the
  unmutated run classified `crashed` = 41, `mutants:253`, `killed:213`;
  `build-spec-refusal.txt` "REFUSED: items without the seat-output rule".
  **AGREE.**
- "183 force-true + 70 semantic, 0 survivors, 0 crashed":
  `scored/c1-kill-power-a.json` `forceTrue.mutants:183`,
  `semantic.mutants:70`, `mutants:253`, `killed:253`, `holds:true`,
  `survivors:[]`, `crashed:[]`. **AGREE.**

## 7. S213 (post-freeze addition)

- Quote 1: `ElementHandle.ts:134-135` — source "The zero-length array is a
  special case, it seems that / DOM.setFileInputFiles does not actually update
  the files in that case, so". The note's quote lower-cases "the", joins with
  "/" and drops ", so" without an ellipsis (note finding F3).
- Quote 2: `:139` — "// XXX: These events should converted to trusted events."
  The note quotes "XXX: These events should converted to trusted events" and
  attributes it to 139. **AGREE.**
- The row's "lines 134-135 and 139; 220 lines; sha256 c86ed958…" matches the
  staged copy. The "this tag pins Chrome 156.0.8078.47" claim has no anchor in
  the staged file (`grep '156\.0'` → no match; `state-and-extras.json`
  `versionStringInFile:false`) — note finding F2.

## 8. Verdict

- Gate (the assignment's question): **PASS** — seven quotes, all found at the
  stated lines, all ≤25 words; five row anchors resolve (S212 after the 12:08
  fix). Nothing in the S208–S212 rows is misquoted.
- Residual documentary defects: D1–D7 above (lesson arithmetic/cross-reference/
  scope/precision/wording and the S213 sync). None falsifies a measured claim or
  changes the frozen predicate.
- The S213 addition is verifiable against the scout-staged bytes; its two
  sourcing/boundary issues are note findings F1–F3/F6.
