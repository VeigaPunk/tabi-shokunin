FINDINGS

# R77Scout — independent re-open of S208–S212 and the next frontier source

**Seat:** R77Scout (leaf; no subagent dispatch)  
**Lane:** `/home/vgpnk/Projects/shokunin/tabi-shokunin`  
**Base:** `1320d428f0c0957b46d6969b59c122fd69199331` · **Digests commit D:** `dcdf582add5871535dee5ebc07560b020017cf2d`  
**Judged on:** coverage, depth · **Milestone:** Independently open S208–S212 and locate the next frontier source  
**Machine-readable manifest:** `.ufo/waves/round-77-seats/R77Scout/r77scout-source-manifest.json`  
**Fetched copies:** `.ufo/waves/round-77-seats/R77Scout/sources/` (11 files)

**Verdict in one line:** the five Chromium sources are byte-identical to the L1's staged copies and every
claim the note and the lesson draw from them is substantively true, but eight citation-precision defects
were found — one genuine off-by-one (S212's mined range stops one line short of the field it names), one
truncated quote, one cross-row mis-attribution, one incomplete reading of a `||` disjunct, three note/row
scope mismatches, and one lesson-draft scope mismatch. **The L1 applied seven of the eight while this seat
was still verifying; all seven are confirmed closed in the working tree (§7). One item remains: the lesson
still cites S210 line 224, which sits outside the widened mined ranges (§8).**

---

## 1. Independent re-open of S208–S212

Fetched this session, this seat, with no reuse of the L1's staged bytes:

```bash
curl -sS "https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/<path>?format=TEXT" -o raw.b64
base64 -d raw.b64 > dec/<file>
```

`?format=TEXT` returns base64; `base64 -d` produced the decoded files. Every fetch returned HTTP 200
(`curl -w 'http=%{http_code}'` re-probe at 2026-11-07T12:00:54-03:00: DOM.pdl 46100 B, inspector_dom_agent.cc
170680 B, file_input_type.cc 31220 B, inspector_page_agent.cc 105740 B, Page.pdl 82548 B — all `http=200`).

| Row | Path (tag `155.0.8059.84`) | Access time | Lines | sha256 (decoded) | `cmp` vs L1-staged |
|---|---|---|---|---|---|
| S208 | `third_party/blink/public/devtools_protocol/domains/DOM.pdl` | 2026-11-07T11:56:50-03:00 | 1022 | `50c460459e502a0a75a07de32e0589126c737a62f14c6b969df73009f958f702` | **exit 0 IDENTICAL** |
| S209 | `third_party/blink/renderer/core/inspector/inspector_dom_agent.cc` | 2026-11-07T11:56:51-03:00 | 3642 | `e7c983b4b00f47757dbb29c69a129693b8ac61a2e0e60643aa124bbae203c84f` | **exit 0 IDENTICAL** |
| S210 | `third_party/blink/renderer/core/html/forms/file_input_type.cc` | 2026-11-07T11:56:50-03:00 | 650 | `f96265db986a6119ef805a2d74ccd505ad6eade08b6fccf5e110685f8ee9f705` | **exit 0 IDENTICAL** |
| S211 | `third_party/blink/renderer/core/inspector/inspector_page_agent.cc` | 2026-11-07T11:56:51-03:00 | 2003 | `1dd744b58227f8bfac00afdb153a9b71a451494178713a3ba8f14956af49a8cf` | **exit 0 IDENTICAL** |
| S212 | `third_party/blink/public/devtools_protocol/domains/Page.pdl` | 2026-11-07T11:56:50-03:00 | 1795 | `e944a3b19fa2c87b4ed0a84cca85b16b127618725394496ba046a2dfdf9405be` | **exit 0 IDENTICAL** |

All five line counts, digests and byte content match the L1's `FETCH.txt` exactly
(`.ufo/waves/round-77/sources/FETCH.txt`, fetched 2026-11-07T05:52:52-05:52:57-03:00). **The staging is sound:
the note rests on the bytes it claims.**

`cmp` command and exit codes (run in this seat's scratch, `dec/<file>` vs
`.ufo/waves/round-77/sources/<file>`): `cmp` exit **0** for all five; aggregate `ALL_CMP_IDENTICAL_EXIT=0`.

Host build confirmed for the note's `verified-at:` line: `/usr/bin/chromium --version` → `Chromium 155.0.8059.84 Arch Linux` (exit 0).

## 2. Every cited line located and quoted

Line numbers below are the **actual** line numbers in the decoded files. Each quote is ≤ 25 words.

**S212 — `Page.pdl:1279-1288` (interception).** Located as stated.
- `Page.pdl:1280` — "When file chooser interception is enabled, native file chooser dialog is not shown."
- `Page.pdl:1281` — "Instead, a protocol event `Page.fileChooserOpened` is emitted."
- `Page.pdl:1282` — "command setInterceptFileChooserDialog"; `:1288` — "experimental optional boolean cancel".

**S212 — `Page.pdl:1294-1303` (the event).** Located, but the range is one line short — see **F1**.
- `Page.pdl:1298` — "experimental FrameId frameId"
- `Page.pdl:1301-1302` — "selectSingle" / "selectMultiple"
- `Page.pdl:1303` — "# Input node id. Only present for file choosers opened via an `<input type=\"file\">` element."
- `Page.pdl:1304` — "experimental optional DOM.BackendNodeId backendNodeId"  ← **outside the cited range**

**S208 — `DOM.pdl:681-691`.** Located exactly; range is correct and complete.
- `DOM.pdl:682` — "command setFileInputFiles"; `:685` — "array of string files"
- `DOM.pdl:687` — "optional NodeId nodeId"; `:689` — "optional BackendNodeId backendNodeId"
- `DOM.pdl:691` — "optional Runtime.RemoteObjectId objectId"

**S209 — `inspector_dom_agent.cc:1806-1810, 1812-1815`.** Located exactly.
- `inspector_dom_agent.cc:1809` — "return protocol::Response::ServerError(\"Node is not a file input element\");"
- `inspector_dom_agent.cc:1815` — "To<HTMLInputElement>(node)->SetFilesFromPaths(paths);"

**S211 — `inspector_page_agent.cc:1899-1913` (event) and `:1949-1956` (interception).** Located exactly.
- `inspector_page_agent.cc:1909-1910` — "multiple ? protocol::Page::FileChooserOpened::ModeEnum::SelectMultiple : …::SelectSingle"
- `inspector_page_agent.cc:1953` — "// Cancel file chooser only if interception is enabled."
- `inspector_page_agent.cc:1954` — "cancel_file_chooser_.Set(enabled && cancel.value_or(false));"

**S210 — `file_input_type.cc:181-188` (activation), `:200-210` (probe), `:465-481` (dispatch), `:533-556` (paths).**
- `file_input_type.cc:183` — "\"File chooser dialog can only be shown with a user activation.\";"
- `file_input_type.cc:203-204` — "probe::FileChooserOpened(document.GetFrame(), &input, input.Multiple(),"
- `file_input_type.cc:207` — "SetFilesAndDispatchEvents(nullptr);"
- `file_input_type.cc:479` — "GetElement().DispatchCancelEvent();"
- `file_input_type.cc:536-537` — "if (paths.empty())" / "return;"
- `file_input_type.cc:552-554` — "FileChooserFileInfoList first_file_only;" / "first_file_only.push_back(std::move(files[0]));"

**Note citations.** All eleven line references in
`corpus/knowledge/chromium-file-chooser-runtime-round-77.md` were located; each resolves to the claimed
construct. Two of them are cited from the **wrong row** and one **range stops one line short** (F1, F3, F5).

## 3. Findings (eight, all minor; none falsifies a measured leg)

**F1 — off-by-one, S212's mined range excludes the field it names.** `grep -n backendNodeId dec/Page.pdl` → exit 0,
**one hit only: line 1304**. The note (line 25) and the SOURCES S212 anchor cell both cite
`1294-1303` while claiming "optional `backendNodeId`". Line 1303 is only the *comment*; the field is declared
at 1304. The range must be **1294-1304**. (The note's quoted comment text is correctly at 1303; only the
field's declaration falls outside.)

**F2 — truncated quote presented as verbatim.** Note line 22 quotes the cancel flag as
"cancels the dialog by emitting relevant events (if any) in addition to not showing it". `Page.pdl:1285-1286`
reads "If true, cancels the dialog by emitting relevant events (if any)" / "in addition to not showing it
**if the interception is enabled**". The trailing clause is dropped without an ellipsis, and it is the clause
that carries the condition. Quote 1285-1286 in full or mark the elision.

**F3 — cross-row mis-attribution.** Note line 29 (under the S211 heading, range
`inspector_page_agent.cc:1899-1913`) says "the probe is called with `input.Multiple()`".
`grep -n 'Multiple()' dec/inspector_page_agent.cc` → **exit 1, no match**; the call site is
`file_input_type.cc:203` (S210's file, inside S210's cited 200-210). The mode mapping itself
(`1909-1910`) is correctly in the S211 range; only the probe-call clause belongs to S210.

**F4 — incomplete reading of a disjunct.** Note line 36 and the S210 anchor cell both say input+change fires
"only when `SetFiles` changed the list". `file_input_type.cc:469` is
`if (SetFiles(files) || force) {` — there is a second disjunct. `force` is `force_change_event_`
(`:466`), set at `:498` only under `RuntimeEnabledFeatures::FilePickerEventsFixEnabled() && HasConnectedFileChooser()`.
**The measured legs are unaffected** — on the CDP path `SetFilesFromPaths` reaches `FilesChosen` with no native
chooser connected, so `HasConnectedFileChooser()` is false and `force` stays false [INFERENCE from the source
path; the flag's runtime state was not read]. But the sentence as written overstates what line 469 says.

**F5 — the note cites S210 lines the row does not declare as mined.** Note line 89 cites `S210 525-532`
(`SetFilesFromDirectory`, `file_input_type.cc:525-533`). The S210 row's scope cell declares mined
"174-212, 465-481 and 533-556" and its anchor cell lists only `181-188, 200-210, 465-481, 533-556`.
**525-532 falls in none of those ranges** (it sits between 481 and 533). Either widen the row's declared
mined ranges to cover 525-533 or re-file the citation.

**F6 — the S210 row names a function no mined range covers.** The S210 scope cell lists `FilesChosen` among
the covered constructs, but `FilesChosen` spans `file_input_type.cc:483-508`, which lies outside
174-212, 465-481 and 533-556. The row's anchor cell correspondingly cites no `FilesChosen` lines. Either
add the range to the mined list (483-508 — it holds the `force_change_event_` site at 498 and
`CreateFileList` at 502) or drop the name from the scope cell.

**F7 — the lesson draft cites three more S210 ranges outside the row's declared mined ranges.**
`corpus/lessons/round-77.md` quotes S208–S212 too, and it is *more* precise than the note about one
thing (see "checked and sound" below) but repeats the scope gap:
- line 108-109 cites "the native chooser's params, **224**" — `file_input_type.cc:224` is
  `params.accept_types = CollectAcceptTypes(input);`
- line 109 cites "the directory path's, **530**" — `file_input_type.cc:530` is
  `params.accept_types = CollectAcceptTypes(GetElement());`
- line 113-114 cites "`force_change_event_`, S210 **496-499**" — `file_input_type.cc:496-499` is the
  `FilePickerEventsFixEnabled() && HasConnectedFileChooser()` guard and the assignment.

All three lines are **outside** S210's declared ranges (174-212, 465-481, 533-556) — 224 and 496-499 sit
in the 212-465 and 481-533 gaps, 530 likewise. The quoted text is correct; the *row's* declared scope is
too narrow for what the note and the lesson both cite. Fixing F5 and F6 by widening S210's mined ranges
should cover 224, 496-499, 525-533 and 530 as well.

**F8 — the lesson's exclusion claims re-checked and CONFIRMED (not a defect; recorded so the L1 knows it
was tested).** Lesson line 89-90 excludes `page_handler.cc` as "S203 already holds it; no file-chooser path
in it". I re-fetched it at tag 155.0.8059.84 (after five HTTP 503s from googlesource, then success):
sha256 `768a47e82d54c7646b58df863fbd8b5aaa1576f0324c749a6567ecb2dad3d4ac`, 2,781 lines — **byte-identical
to S203's recorded sha256 and to the r76 verifier spot-check's `768a47e8…d4ac` / 2,781**.
`grep -i filechooser` returns exactly 2 hits, both a back-forward-cache reason, not a chooser path:
- `page_handler.cc:2365` — "case BackForwardCacheDisable::DisabledReasonId::kFileChooser:"
- `page_handler.cc:2367` — "ContentFileChooser;"
`grep -i InterceptFileChooser` returns **0** hits. The exclusion is correct.

I also fetched the real `file_chooser.cc` — note the path in the lesson's exclusion list is wrong:
`third_party/blink/renderer/core/file_chooser.cc` **404s**; the file lives at
`third_party/blink/renderer/core/html/forms/file_chooser.cc` (sha256
`1f203063fa454ab56093b4e771e1e858d135adf754ae13d47863ae4da2f29abf`, 159 lines). It contains **0**
occurrences of "accept" — no accept filtering anywhere on the CDP path, which independently corroborates
the lesson's rejection of "`accept` filters what `setFileInputFiles` sets".

**Not findings (checked and sound):** every quote's wording is verbatim where quoted; the note's measured
table (15 legs) contains no source-cited line that I could not locate; the note's novelty sentence checks
out — `git grep -liE 'file ?chooser|setFileInputFiles|fileChooserOpened|setInterceptFileChooserDialog|webkitdirectory|showPicker' 1320d428 -- corpus/knowledge | wc -l` → **0** at base, and the wider `upload` grep hits exactly one note, `corpus/knowledge/webbridge-plugin-anatomy.md:85` — "returns file path not base64) · `network` (:25) · `upload` (:26) ·", which is the `upload` plugin verb and measures nothing about file inputs.

### The lesson draft (`corpus/lessons/round-77.md`) — every quote located

S208–S212 are quoted in **three** places, not two. I verified the lesson draft's seven located quotes; all
resolve to the claimed line and all are verbatim:

| Row | Lesson's quoted line | Actual decoded line | Verbatim? |
|---|---|---|---|
| S208 | 681 | `  # Sets files for the given file input element.` | yes |
| S209 | 1809 | `    return protocol::Response::ServerError("Node is not a file input element");` | yes |
| S210 | 183 | `        "File chooser dialog can only be shown with a user activation.";` | yes |
| S210 | 536-537 | `  if (paths.empty())` / `    return;` | yes |
| S210 | 479 | `    GetElement().DispatchCancelEvent();` | yes |
| S211 | 1953 | `  // Cancel file chooser only if interception is enabled.` | yes |
| S212 | 1280-1281 | "When file chooser interception is enabled, native file chooser dialog is not shown. Instead, a protocol event `Page.fileChooserOpened` is emitted." | yes |

Other lesson claims verified: its "before the append" grep —
`git show 1320d428:corpus/SOURCES.md | grep -c 'DOM.pdl\|inspector_dom_agent\|file_input_type\|inspector_page_agent'` → **0**,
exactly as stated; its three control names `forge-belief-directory-multiple`, `forge-belief-empty-list-clears`
and `forge-belief-accept-filters` all exist in `controls/c1/controls-c1.mjs`, `controls-run.out` and
`controls-summary.json`. And on the point where the note is wrong, **the lesson is right**: lesson line 102
says "the probe is called with `input.Multiple()` (S210 203)" — the correct attribution — while the note
puts the same clause under S211 (F3). Fix the note; the lesson needs no change there.

## 4. Frontier source (one) — Puppeteer's CDP answer to a file chooser

The lane holds **no** Puppeteer source row: `grep -c 'puppeteer-v' corpus/SOURCES.md` → **0**; no row names
`ElementHandle.ts`, `FileChooser.ts` or a Puppeteer `src/` path. The only Puppeteer row is S011, a blog post.
So this is genuinely new ground for the lane.

- **URL:** `https://github.com/puppeteer/puppeteer/blob/puppeteer-v25.16.0/packages/puppeteer-core/src/cdp/ElementHandle.ts`
- **Raw:** `https://raw.githubusercontent.com/puppeteer/puppeteer/puppeteer-v25.16.0/packages/puppeteer-core/src/cdp/ElementHandle.ts`
- **Tag / commit:** `puppeteer-v25.16.0` → commit `a207faf527ce4305b33a6c0f9706b090c21c115e` (published 2026-10-22T11:49:08Z; `packages/puppeteer-core` version 25.16.0)
- **Access time:** 2026-11-07T11:57:46-03:00 (HTTP 200, 6124 bytes; re-probe 2026-11-07T12:00:58-03:00 → `http=200`, 6124 B)
- **sha256:** `c86ed958566f5c94136bac9c90ba3c167b2221e652dc917f70e202ba2225c445` · **220 lines**
- **Located quote (24 words), `ElementHandle.ts:135-136`:** "DOM.setFileInputFiles does not actually update the files in that case, so the solution is to eval the element value to a new FileList directly."
- **Second quote (19 words), `ElementHandle.ts:139-140`:** "XXX: These events should converted to trusted events. Perhaps do this in `DOM.setFileInputFiles`?"

**What it teaches.** An independent, widely-deployed CDP client confirms the round-77 note's sharpest
finding from the *other* direction: an empty file list does **not** update the input, so Puppeteer bypasses
the protocol entirely and sets `element.files` from a page-side `DataTransfer`, dispatching its own
`input`/`change` — events it explicitly marks as *not* trusted (`XXX: These events should converted to
trusted events`). It also shows the addressing the note recommends (`DOM.describeNode` →
`DOM.setFileInputFiles` with **both** `objectId` and `backendNodeId`, `:153-162`), asserts that multiple
uploads require the `multiple` attribute (`:113-116`), and — in `common/FileChooser.ts:63-70` /
`:75-86`, the companion fetched alongside — routes `accept()` through `uploadFile` and implements `cancel()`
as an in-page `dispatchEvent(new Event('cancel'))`, i.e. an untrusted cancel, never a protocol cancel.

Three consequences for the lane:

1. **Independent corroboration of the `pick-empty` leg.** The note records `[]` as "a no-op, not a clear";
   Chromium's own `paths.empty()` early return (`file_input_type.cc:536-537`) says the same, and Puppeteer
   says the same from the client side. Three independent sources, one behaviour.
2. **It names the exact shape the lane's degenerate checks must reject.** Puppeteer's empty-file fallback
   produces `input`/`change` with `isTrusted == false` and no chooser event — the same signature the
   round-77 degenerate cases (`degenerate-page-stub`, `degenerate-eval-trigger`) already encode. A receipt
   claiming an upload must be able to distinguish "Puppeteer-style fallback" from "real chooser answer".
3. **A caveat that must travel with the row.** Puppeteer v25.16.0 pins Chrome `156.0.8078.47`
   (`packages/puppeteer-core/src/revisions.ts:11`, fetched 2026-11-07T11:58:40-03:00, sha256
   `5871e4017598db07f00f37b4eaba88e951e30a00b327aa6ea873d5254a1d2bc4`) — **not** the lane's Chromium
   `155.0.8059.84`. This row documents *client-side protocol usage*, not 155 server behaviour; it must not
   be used to ground a claim about what Chromium 155 does.

### Proposed SOURCES row (11 cells, no `|` inside any cell)

| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |
|---|---|---|---|---|---|---|---|---|---|---|
| S213 | Puppeteer v25.16.0 CDP `ElementHandle.uploadFile` (answering a file chooser) — https://github.com/puppeteer/puppeteer/blob/puppeteer-v25.16.0/packages/puppeteer-core/src/cdp/ElementHandle.ts | code | A | how a production CDP client answers a file chooser: `DOM.setFileInputFiles` addressed by `objectId` and `backendNodeId`, the empty-array no-op and its in-page fallback, and the `multiple` assertion; client-side usage, pinned to Chrome 156.0.8078.47, NOT the lane's Chromium 155.0.8059.84 | tag `puppeteer-v25.16.0`, commit `a207faf527ce4305b33a6c0f9706b090c21c115e`; `cdp/ElementHandle.ts:106-163` (uploadFile), `:133-137` (zero-length comment), `:138-151` (in-page fallback), `:153-162` (`DOM.describeNode` then `DOM.setFileInputFiles`); companion `common/FileChooser.ts:63-86`; fetched 2026-11-07 from raw.githubusercontent.com | an empty file list leaves the input untouched, so a client sets files in page script and dispatches untrusted `input`/`change`; a chooser answer is addressed by node, and multiple uploads require the `multiple` attribute | mined | 2026-11-07 | on-release | corpus/knowledge/chromium-file-chooser-runtime-round-77.md |

(Suggested only: the L1 owns the SOURCES.md edit. I made no git mutation — `git -C <lane> status --porcelain`
shows only `M SCORECARD.md`, `M SKILL.md`, `M corpus/knowledge/chromium-file-chooser-runtime-round-77.md` and
untracked `.ufo/waves/round-77-seats/`, `.ufo/waves/round-77/scored/before/`, `.ufo/waves/round-77/w1.ready`,
`.ufo/waves/round-77/w1.ready.dispatched`, `.ufo/waves/round-77/w1/R77Exec4/` — **all pre-existing or other
seats' work; none of it is mine.**)

## 5. Consistency of the note's own measured claims vs. the sources

Cross-checking the note's measured table against the source paths, the mechanism fits every leg:

| Leg | Source mechanism that predicts it | Line |
|---|---|---|
| `pick-same` → one trusted `cancel`, no `input`/`change` | `SetFiles` compares sources; unchanged list ⇒ `DispatchCancelEvent()` | `file_input_type.cc:469,479` |
| `pick-empty` → nothing at all | `SetFilesFromPaths` returns immediately on an empty vector | `file_input_type.cc:536-537` |
| `pick-first-only` → only `files[0]` | non-`multiple` input keeps the first path only | `file_input_type.cc:551-554` |
| `not-file-input` → `-32000` "Node is not a file input element" | `DynamicTo<HTMLInputElement>` + `FormControlType() != kInputFile` ⇒ `ServerError` | `inspector_dom_agent.cc:1806-1809` |
| `script-click` → no chooser | no transient activation ⇒ warning + return, no probe | `file_input_type.cc:181-188` |
| `intercept-cancel` → event **and** one `cancel` | suppressed **and** cancelled ⇒ `SetFilesAndDispatchEvents(nullptr)` ⇒ `DispatchCancelEvent()` | `file_input_type.cc:205-209`, `:442-443,479` |
| `dir-mode` → `selectSingle` | the probe is passed `input.Multiple()`, and `webkitdirectory` does not imply `multiple` | `file_input_type.cc:203` |
| `accept-ignored` | no accept filtering on this path | `file_input_type.cc:535-555` |

One note-level caveat worth carrying into the lesson: the note's own sentence "`accept` filters nothing over
CDP" is an **absence** claim supported by reading `SetFilesFromPaths` end to end (no accept handling on the
CDP path) — it is correct as far as the source goes, but it is not a positive statement in the protocol
contract; the PDL says nothing about `accept`. Flag as such if the lesson quotes it as a protocol fact.

## 6. Seat-output compliance

- All JSON output and all fetched copies are under `.ufo/waves/round-77-seats/R77Scout/` only
  (`r77scout-source-manifest.json`, `sources/` with 11 files: the 5 Chromium sources, the 4 Puppeteer files,
  and the two re-checked exclusion files `ph.cc` and `fc.cc`). That directory is a **sibling** of the
  counter's walked tree `.ufo/waves/round-77`, so nothing I wrote can enter another seat's verdict.
  Verified: `grep -rl 'tabi-chrome-cdp-filechooser-r77' .ufo/waves/round-77-seats/R77Scout/` → **exit 1, clean**;
  the walked tree is `.ufo/waves/round-77` + `corpus/evidence/round77`.
- Containment was checked by replaying the counter's own walk rule over my two walked-tree files: both are
  **skipped as prose** (neither is `.json`, and neither begins with `{`/`[`), so neither can become a
  `prior-set-complete` finding nor an `prior-set-unparsable` refusal.
- This prose report is the only file written under `.ufo/waves/round-77/w1/R77Scout/`.
- No git/jj mutation, commit or push anywhere: read-only `git -C <lane> status/log/show/rev-parse` only.
- No tool was installed or upgraded this session (nothing needed installing; `curl`, `base64`, `python3` and
  `jq`/`node` were already present).
- Scratch: `/fast/scratch/hyaku/tabi-r77/R77Scout/` (working copies, `raw/` base64, `dec/`, `pup/`,
  `pup.tree.json`); removed on exit per the seat's scratch rule. `disk-guard.sh status` was consulted before
  the fetches (exit 0).

## 7. Status after the L1's fixes (re-read from the working tree)

The L1 applied my findings to the working tree while I was still verifying. I re-read the bytes and
confirmed each one:

| Finding | Status | Evidence in the working tree |
|---|---|---|
| F1 off-by-one | **FIXED** | S212's mined range now reads `1294-1304` |
| F2 truncated quote | **FIXED** | note now: "experimental — 1285-1286 verbatim: \"If true, cancels the dialog by emitting relevant events (if any) / in addition to not showing it if the interception is enabled\"" |
| F3 mis-attribution | **FIXED** | note now attributes the probe to "the S210 side (`file_input_type.cc:203-204`)" |
| F4 incomplete disjunct | **FIXED** | note now reads "`if (SetFiles(files) || force)` (469)" and adds ":483-508" for `FilesChosen` / `force_change_event_` (498), noting it needs a *connected* chooser |
| F5, F6 scope | **FIXED** | S210's mined ranges are now `174-212, 465-481, 483-508 and 525-556`; the anchor cell covers `FilesChosen` and `SetFilesFromDirectory` |
| F7 scope (lesson) | **PARTIALLY FIXED — one line outstanding** | see below |
| F8 exclusion re-check | **NO ACTION NEEDED** | the exclusion stands; only the lesson's *path* for `file_chooser.cc` is wrong |
| S213 | **ADDED** | 11 cells, Chrome-156 caveat in the scope cell, sha256 `c86ed958…445`, 220 lines, anchor cites 134-135 and 139 — both correct lines |

**The one residual (F7):** `corpus/lessons/round-77.md:109` still cites **S210 line 224** for the accept
claim ("accept types go only to the native chooser's params, 224"), and 224 still falls in the 212-465 gap
of the widened ranges — the other two lesson cites (530, 496-499) are now covered. The cited text is
correct (`file_input_type.cc:224` is `params.accept_types = CollectAcceptTypes(input);`); only the row's
declared scope misses it. Two ways to close it: add 224 (or the 213-235 `OpenPopupView` params block) to
S210's mined ranges and anchor cell, or drop "224" from the lesson's sentence and cite the accept-params
block by range. **This is the only item of my eight still open, and only the L1 can make it** — I am not
the integration owner and made no edit to SOURCES.md.

I re-checked every remaining S210 citation against the widened ranges; all are covered except 224:
`525-533` COVERED, `189-191` COVERED, `203` COVERED, `536-537` COVERED, `533-556` COVERED,
`465-481` COVERED, `496-499` COVERED.

The note now also reports the `webkitdirectory` directory leg as measured by R77Exec3 this wave
(`probe-run-{1,2,3}.json` plus a `nondir` control, all present in `.ufo/waves/round-77-seats/R77Exec3/`).
Its mechanism claim cites S210 525-533, which is covered, and `NewFileChooser(params)->EnumerateChosenDirectory()`
is indeed at `file_input_type.cc:532`. I did not audit R77Exec3's receipts — that is another seat's lane.

## 8. What the L1 should do with this

Seven of the eight are already applied and verified (§7). **One item remains:**

1. **F7 residual — the only open item.** `corpus/lessons/round-77.md:109` cites **S210 line 224**, which
   is still outside S210's widened ranges (the 212-465 gap). Close it either by adding 224 (or the
   213-235 `OpenPopupView` params block) to S210's mined ranges and anchor cell, or by dropping "224" from
   the lesson's sentence and citing the accept-params block by range. The cited text is correct; only the
   row's declared scope misses it.

Two smaller points that remain the L1's call, neither a defect in the sources:

2. **F8 path** — the lesson's exclusion list names `file_chooser.cc`; if it is named by path anywhere, the
   path is `third_party/blink/renderer/core/html/forms/file_chooser.cc`, not
   `third_party/blink/renderer/core/file_chooser.cc` (which 404s).
3. Optional deeper follow-up I did **not** take (out of this seat's scope): Chromium's own DevTools web test
   for `DOM.setFileInputFiles` / `fileChooserOpened` under `third_party/blink/web_tests/` would be a
   *server-authoritative* counterpart to Puppeteer's client-side view. I did not locate such a test path
   this session, so I make no claim about it.

**Unknowns left open:** (a) `RuntimeEnabledFeatures::FilePickerEventsFixEnabled()` and
`FileColorPickerConsumeActivationEnabled()` runtime values in this build — read only from source, never
observed; (b) whether `HasConnectedFileChooser()` is false on the CDP path is [INFERENCE] from the call
graph, not a measurement; (c) the existence and location of a Chromium upstream web test for this surface is
unresolved.
