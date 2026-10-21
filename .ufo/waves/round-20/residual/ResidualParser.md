# ResidualParser — C1 counter `measure-c1.mjs` static review

**Seat**: `TabiR20.ResidualParser`
**Revision reviewed**: `ac10319843f718489a10b89a8d2a568879aaf980` (HEAD, clean for all counted paths)
**Baseline**: `c49929430d996b016dde2e3a3a5be380f3433fdb`
**Method**: static only. No counter, selftest, gate, build or test was executed. No files were written except this report. No installs or updates were performed.

**Axes named**: canonical heading selection · LC-prefix row recognition · strict full anchor clause · precise scope literal · baseline/after exit-credit · counted-input set · note / manifest / SKILL / README consistency · binding values.

## Verdict

Not admissible as-is. At HEAD the counter has an undeclared identifier that throws on every run where the manifest and note both exist, so the clean count of 12 cannot be produced. Every other axis is statically consistent: the pinned source, the manifest, the note's corrected table, the SKILL mirror, the registry rows and the four counted inputs agree. The binding values in the w2 `ReviewBindingInputs.md` are stale.

## Findings, by severity

### F1 — High, blocking: `SEPARATOR_ROW` is referenced but never declared

- **Evidence.** `parseRegistry`, `measure-c1.mjs:536`: `.filter((line) => !SEPARATOR_ROW.test(line))`. The file contains no declaration of `SEPARATOR_ROW` (grep shows one occurrence). The identifier audit found no other undeclared identifier that is a real code reference; the other flagged tokens are inside strings or comments.
- **Cause.** `git diff 4ae99816 ac10319 -- .ufo/waves/round-20/measure-c1.mjs` removes `const SEPARATOR_ROW = /^\|(\s*:?-+:?\s*\|)+\s*$/;` in hunk `@@ -97,13 +98,12 @@` and leaves the call site in place.
- **Reach.** `main` → `evaluate` → `evaluateComplete` → `parseRegistry` runs whenever the manifest and note are both present. `corpus/SOURCES.md` has 102 `|` lines under `## Registry` (header, separator, 100 data rows), so the filter callback runs and throws `ReferenceError`. Nothing catches it: `evaluate`, `evaluateComplete` and `main` have no try/catch. The CLI therefore exits 1 with a stack trace and no JSON record. That breaks the documented exit classes, where exit 1 means "evaluated with findings" and comes with a record.
- **Unaffected path.** Baseline (manifest and note both absent) returns from `evaluate` before `parseRegistry`, so the baseline count of 0 with exit 0 still holds.
- **Selftest (inference, not executed).** The registry fixture (`selftest-c1.mjs:294-298`) includes data rows. The case loop catches the throw (`selftest-c1.mjs:434-438`) and records `threw ...`, so the selftest should report `verdict=failed`. A green selftest would not show that the CLI works.
- **Minimal fix.** Restore the declaration with the literal from the 4ae99816 version, `const SEPARATOR_ROW = /^\|(\s*:?-+:?\s*\|)+\s*$/;`, next to `REGISTRY_SECTION_END`. Replication with that regex matches exactly one separator line among the 102 table lines.

### F2 — High (binding evidence): the w2 binding values are stale at HEAD

- `ReviewBindingInputs.md` §3.1 records values measured at checkpoint `4ae99816`: counter sha256 `fab3bde4…`, `measuredRevision` `4ae99816…`, blobs SOURCES `07f5d2e4…`, decisions `f5a55b3d…`, note `f8a86143…`, source `cd7efa45…`.
- At HEAD, three inputs and the counter changed. The source did not.

  | Path | At 4ae99816 | At HEAD ac10319 |
  |---|---|---|
  | `measure-c1.mjs` | blob `5af9654f`, sha256 `fab3bde4…` | blob `1e879e13`, sha256 `4bcab53a77929ab9dcb5a11cb60cb92db3e74ad1315964fed7a0aa9d8f1b313c` (worktree and HEAD identical) |
  | `corpus/SOURCES.md` | `07f5d2e4…` | `be9992e4813e12744256d5ca72c40e7017e9f9be` |
  | `lifecycle/decisions.json` | `f5a55b3d…` | `61b0ce7f15e5fca72d417a8dfeb5f06641e8d58f` |
  | `sources/html_form_element.cc` | `cd7efa45…` | `cd7efa45834bfce0697b06c7092f16d084c4eb55` (unchanged; sha256 `8c8d6796…` verified) |
  | `knowledge/webmcp-completion-lifecycle-round-20.md` | `f8a86143…` | `48341fb7a3f7995663c2414f7044ff0c479f5564` |

- **Gate effect.** `scripts/check-measurement-binding.mjs` on a binding with `measuredRevision` 4ae99816, evaluated at HEAD, would report `counter_changed_since_measurement` (blob at REV ≠ recorded sha256) and `counted_input_changed` for SOURCES, decisions, note and counter. `--reproduce` would also fail, because F1 makes the after-arm exit non-zero.
- **Ordering.** The F1 fix changes the counter bytes again. The final binding digest must be taken from the fixed counter, at a `measuredRevision` where the four inputs and the counter are as recorded.
- **Shape is right.** The proposed JSON fields match the gate: `countedInputs`, `measuredRevision`, `before`/`after`, and `counter.{path,sha256,argv,countField}`. `COUNT_FIELD` accepts `c1_lifecycle_decisions`, and the argv `["node", ".ufo/waves/round-20/measure-c1.mjs", "{REV}"]` passes `argvSupported`. Only the values are stale.
- **Derived set confirmed.** The CLI reads exactly `MANIFEST_PATH`, `NOTE_PATH`, `SOURCE_PATH` and `REGISTRY_PATH`, which are the four paths in the w2 derived set. All four are mode-100644 blobs at HEAD. The counter does not read itself at REV.

### F3 — Medium: no guard around evaluation in the CLI

- `main` calls `evaluate(files)` with no try/catch. Only `git()` catches spawn errors, so any future runtime fault escapes as exit 1 with no JSON record. The fix is a contract decision: a new could-not-evaluate reason would change the closed `CLI_REASON` list, which the header calls a contract change. Not required to fix F1. Left to L1.

### F4 — Low (latent): LC-row recognition has blind spots

- `LC_ROW = /^\|\s*LC/` (line 100) only matches pipe-first rows at column 0. GFM permits up to three leading spaces before the pipe, and pipe-less rows. Such a row inside the corrected section would not be counted, so a stale duplicate of that shape would escape `table_row_extra`.
- Current content has none of these. The note and SKILL contain 24 LC rows in total, all pipe-first at column 0, 12 in each section. The note states that Markdown grammar is not graded, so this is a documented limit.

### F5 — Low (latent): quote check is looser than the note's stated rule

- The note's Method says each quote is a literal substring of one source line. `checkDecision` tests `pinnedSpanText(...).includes(quote)` on the joined multi-line span, so a quote containing `\n` would pass.
- All 12 current quotes are single-line (checked), so there is no present false admission.

## Axis results (static)

| Axis | Result | Evidence |
|---|---|---|
| Canonical heading selection | PASS | One original heading (note:25) and one corrected heading (note:108). The corrected section holds 12 LC rows that equal the manifest rendering as a multiset. The 12 historical rows lie only in the original section (note:29–40, as cited in README:458 and SKILL). SKILL corrected rows (SKILL:2269 onward) equal the manifest rendering. |
| LC-prefix row recognition | PASS (current), latent F4 | 24 LC rows total, 12 + 12, none outside a section. |
| Strict full anchor clause | PASS | S096 `html_form_element.cc:174-328,729-758,818-842` parses to `[[174,328],[729,758],[818,842]]`. S100 `html_form_element.cc:174-328,635-842` parses to `[[174,328],[635,842]]`. Exactly one clause per anchor. All 12 spans are covered: LC11 787–815 ⊂ 635–842 and LC12 818–830 ⊂ 818–842. |
| Precise scope literal | PASS | Manifest `scope` equals `MANIFEST_SCOPE` exactly: `source-only Chromium 154.0.8037.97; no new runtime observation in round 20`. The note's Evidence-class line states the same. `RUNTIME_WORDING` applies to decision text only, and no decision text hits it. |
| Baseline / after exit credit | PASS on reading; after-arm blocked by F1 | Baseline: neither note, manifest nor counter exists at c49929 (`ls-tree` empty), so the early return gives count 0, exit 0. Exit 0 implies exactly 12 entries, because missing, duplicate and unknown ids each produce findings. The count is emitted alongside findings but not admitted, which matches the note's "scalar credit requires exit 0 and expected count". |
| Counted-input set | PASS | Four paths, equal to the w2 derived set (see F2). |
| Source identity | PASS | sha256 of `corpus/evidence/round-20/sources/html_form_element.cc` is `8c8d6796…`, 1740 lines, blob `cd7efa45`. |
| Decision quotes | PASS | All 12 are literal substrings of their pinned spans. Lines: LC01@182, LC02@197, LC03@251, LC04@217, LC05@220, LC06@228, LC07@266, LC08@295, LC09@311, LC10@326, LC11@810, LC12@829. |
| Note claims about source lines | PASS (spot-checked) | invocation_id_ at 178; error return 196–198; assignments 204–210; `Run(result)` at 266; reset 267–270; pseudo-state 271–274; not-running return 295–296; `ReportException` 322; `else if (!should_submit)` 807; programming-error literal 810; `base::ok(String())` 829; `submitFromJavaScript` 834–842; early returns at 639, 647, 659, 679. |
| Registry rows | PASS | One `## Registry` (SOURCES:11). 100 data rows, each with 11 cells, so no stray pipes. S096 (row 110) and S100 (row 114) are `mined`, `used-by` names the note, S100 `teaches` begins `supersedes S096 —`, and both anchors carry `decoded sha256 8c8d6796…`. |
| SKILL mirror | PASS (not counted) | Corrected rows equal the manifest rendering. |
| README | PASS | Round-20 row at README:440 registers the note. Cited correction index (README:458) matches the note and SKILL line ranges. |
| Binding gate shape | PASS (shape) | See F2. |
| Binding values | FAIL (stale) | See F2. |
| CLI at HEAD | FAIL | See F1. |

## Static replication

An inline script read the five files and replicated the counter's checks without writing anything. Passes: manifest keys, scope, source record, schema; 12 pinned ids with effective source and spans; quotes in span and word counts; no runtime tokens; note corrected rows and SKILL rows equal to the manifest rendering; registry columns, S096 and S100 rows, anchors, status, `used-by` and `teaches`; span coverage. The only failure is the undeclared identifier in F1.

## Verification performed (read-only)

- `git rev-parse HEAD` → `ac10319843f718489a10b89a8d2a568879aaf980`.
- `git ls-tree HEAD` for the five paths (all regular); `git status --short` for the five paths (clean).
- `sha256sum` of the worktree counter and `git show HEAD:…` (both `4bcab53a…`).
- `git diff --stat` and `git diff -U2` between `4ae99816` and HEAD for the counter.
- `git merge-base --is-ancestor`: `4ae99816`, `e0b5d02a` and `c4992943` are all ancestors of HEAD.
- `ls -d` on cited receipts and probe notes: all present. `corpus/lessons/round-20.md` is absent, as expected until closeout.
- Raw reads and greps of the source and counter at the line ranges above.

## Gaps

- Nothing executed. The F1 conclusion rests on a deterministic undeclared-identifier read, the diff, and the identifier audit. The selftest result is inferred.
- The post-fix counter output (exit 0, count 12) is predicted by replication, not observed.
- The fixed counter's sha256 does not exist yet, so the binding digest cannot be recorded until the fix commit exists.

## Checks for main after the fix (not run by this seat)

1. `node .ufo/waves/round-20/measure-c1.mjs --selftest` → expect `verdict=clean`.
2. `node .ufo/waves/round-20/measure-c1.mjs c49929430d996b016dde2e3a3a5be380f3433fdb` → expect baseline, count 0, exit 0.
3. `node .ufo/waves/round-20/measure-c1.mjs <fix-revision>` → expect clean, count 12, exit 0. Blobs: SOURCES `be9992e4…`, decisions `61b0ce7f…`, source `cd7efa45…`, note `48341fb7…`, unless the fix commit changes them.
4. Re-derive `measurement-binding.json` from the fixed counter bytes and the four blobs at the fix revision. Discard all `4ae99816` and `fab3bde4` values from `ReviewBindingInputs.md`. Then run `scripts/check-measurement-binding.mjs --check … --reproduce` at the delivered revision.

Report: .ufo/waves/round-20/residual/ResidualParser.md
