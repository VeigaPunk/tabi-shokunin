HOLDS

Seat R77Exec3, tabi round 77 w1 — frontier probe: `DOM.setFileInputFiles([<dir>])` on a webkitdirectory input (Chromium 155.0.8059.84, `--headless=new`, `/usr/bin/chromium`).

## Axes (godspeed)

1. Does the command answer at all, and how fast (vs the L1's ~60 s no-answer observation)?
2. Does the page receive `input`+`change`, and with what payload (count, nesting, `webkitRelativePath`)?
3. Does answering re-enter the chooser (a second `Page.fileChooserOpened`), i.e. is enumeration itself intercepted?
4. Control contrast: the same directory path on a non-directory input.

## Verdict

**HOLDS — 3/3 runs.** The command answered in 0–4 ms (budget 20 s; hypothesis bar 5 s), the page received trusted `input`+`change`, and `input.files` held exactly the 3 regular files including the nested one, each with a non-empty `webkitRelativePath` rooted at the directory's basename. The ~60 s no-answer was not reproduced.

## Method

- Probe script (own, new; launch/teardown plumbing copied from the lane driver `scripts/chrome-cdp-filechooser-round77.mjs` unchanged — scratch validation incl. the 107-byte SingletonSocket bound, XDG sandbox, argv, detached spawn, `/json/list` poll, needle sweep, port+curl closure proof): retained copy `.ufo/waves/round-77-seats/R77Exec3/probe-dir-setfiles-r77.mjs` (scratch original removed with the scratch dir).
- Fixture: loopback 127.0.0.1 page with `<input type=file id=s>` and `<input type=file id=d webkitdirectory>`; window capture-phase listeners record every pointer/mouse/click/input/change/cancel with `isTrusted`, `navigator.userActivation.isActive`, and a full file snapshot `{name, size, type, webkitRelativePath}`.
- Flow per run: `Page.enable` + `Runtime.enable` + `Page.setInterceptFileChooserDialog{enabled:true}` → navigate → real mouse click (`Input.dispatchMouseEvent` mousePressed+mouseReleased) on the target input → wait `Page.fileChooserOpened` → `DOM.setFileInputFiles{files:[<dir>], backendNodeId:<event's>}` with a 20 s per-command budget → watch the page up to 12 s for `input`/`change`, read final `input.files`. Every CDP message (send/response/timeout/event) and every page event is in the per-run receipts (`cdps`, `page.events`).
- Directory under test: 3 regular files, one nested: `a-first.txt` (6 B), `b-two.bin` (5 B), `sub/three-deep.txt` (7 B), freshly written under each run's scratch.
- Runs (each `node probe-dir-setfiles-r77.mjs --scratch <dir> --out <receipt> --variant <dir|nondir> --http-port <p> --cdp-port <p+1> --nonce <n>`, all exit 0, teardown clean — 0 sweep rounds, 0 survivors, both ports `closed`, both curls exit 7):
  1. `probe-run-1.json`, variant `dir`, nonce `tabi-r77-exec3-dir1` — command answered 4 ms; chooser 4 ms after release; change seen; 3 files, rels `d-270df46b7c0a/{a-first.txt, b-two.bin, sub/three-deep.txt}`; `.outcome.filesMatchPlan` true; 0 second choosers; `cleanRun` true.
  2. `probe-run-2.json`, variant `dir`, nonce `tabi-r77-exec3-dir2` — answered 4 ms; chooser 2 ms; 3 files under `d-0784e6f6ff7a/`; same booleans true.
  3. `probe-run-3.json`, variant `dir`, nonce `tabi-r77-exec3-dir3` — answered 1 ms; chooser 0 ms; 3 files under `d-661b3657d2c7/`; same booleans true.
  4. `probe-run-nondir.json`, variant `nondir` (control), nonce `tabi-r77-exec3-nondir` — answered 0 ms.
- Aggregate: `.ufo/waves/round-77-seats/R77Exec3/probe-receipt.json`.

## Evidence detail

- Page payload (run 1, `page.events` seq 6–7, `page.finalState.d`): `input` then `change`, both `isTrusted: true`, files `{a-first.txt, 6, text/plain}`, `{b-two.bin, 5, application/octet-stream}`, `{three-deep.txt, 7, text/plain}` with rels `d-270df46b7c0a/a-first.txt`, `d-270df46b7c0a/b-two.bin`, `d-270df46b7c0a/sub/three-deep.txt` — the nested file keeps its subdirectory component, i.e. a real recursive enumeration, not a flat listing.
- `input.value` on the directory input becomes the fakepath of the first enumerated file: `C:\fakepath\a-first.txt` (run 1 `page.finalState.dRel`).
- Timing: `Page.fileChooserOpened` 0–4 ms after the mouseReleased send (`.chooser.openedAfterReleaseMs` per run); `DOM.setFileInputFiles` responses 0–4 ms (`.setFiles.latencyMs`); change observed 152–159 ms after the set by 150 ms watch sampling (`.watch.changedAtWatchMs`), and page timestamps put `input` ~33 ms after the click (run 1 `ts` 112.5 vs click 79.4). Nothing approaches 5 s, let alone 60 s.
- No re-entrancy: zero further `Page.fileChooserOpened` events during the 12 s watch in all runs (`.watch.chooserEventsDuringWatch` = []). Enumeration is not itself intercepted — consistent with the interception point being chooser *opening* only: `inspector_page_agent.cc:1899-1912` (`FileChooserOpened` = suppress + emit) and `:1949-1956` (`setInterceptFileChooserDialog` sets only `suppress_file_chooser_`/`cancel_file_chooser_`) in `.ufo/waves/round-77/sources/`.
- Mechanism grounding (staged sources): `DOM.setFileInputFiles` → `HTMLInputElement::SetFilesFromPaths` (`inspector_dom_agent.cc:1795-1816`); a webkitdirectory input routes `paths[0]` to `FileInputType::SetFilesFromDirectory` (`file_input_type.cc:540-542`), which builds a `kUploadFolder` chooser with `selected_files=[dir]` and calls `EnumerateChosenDirectory()` (`:525-532`); `FilesChosen` → `CreateFileList` builds `webkitRelativePath` from the base dir (`:483-508`, `:346-349`).
- Secondary observation: `navigator.userActivation.isActive` is `true` during the click but already `false` at `input`/`change` time (run 1 events seq 5 vs 6) — engine-dispatched file-input events carry `isTrusted: true` but consume the click's transient activation.
- Control (nondir): the same directory path on the plain single-file input answers equally fast (0 ms) and fires `input`+`change`, but the input gets ONE `File` entry named after the directory (`d-808e3755d416`), `size` 53 (the directory inode's stat size), `type` "", `webkitRelativePath` "", `value` `C:\fakepath\d-808e3755d416` — no enumeration, exactly the non-directory branch of `SetFilesFromPaths` (`file_input_type.cc:545-554`: one `CreateFileChooserFileInfoNative` per path, first-only when not `multiple`).

## Proposed note paragraph (Limits/frontier for `corpus/knowledge/chromium-file-chooser-runtime-round-77.md`)

> Frontier, measured by R77Exec3's probe (3 runs + 1 non-directory control; receipts `.ufo/waves/round-77-seats/R77Exec3/probe-receipt.json`, per-run JSONs beside it): an intercepted `kUploadFolder` chooser is answerable with the same primitive as a `kOpen` one. After a real mouse click on a `webkitdirectory` input under `Page.setInterceptFileChooserDialog`, `DOM.setFileInputFiles([<dir>])` on the event's `backendNodeId` answers in 0–4 ms (budget 20 s) — the earlier ~60 s no-answer observation did not reproduce — and the page receives trusted `input`+`change` with one `File` per regular file under `<dir>`, recursively (3/3, nested `sub/three-deep.txt` included), each with a non-empty `webkitRelativePath` rooted at the directory's basename; `input.value` becomes the first file's fakepath. No second `fileChooserOpened` fires: only chooser *opening* is intercepted (`inspector_page_agent.cc:1899-1912`), so the directory enumeration behind `SetFilesFromDirectory` (`file_input_type.cc:525-543`) runs to completion untouched. Caveat for drivers: the same directory path given to a non-directory file input does NOT enumerate — it becomes a single `File` named after the directory with empty `webkitRelativePath`, empty type and the directory inode's stat size (`file_input_type.cc:545-554`), so `webkitdirectory` must be matched to the target input. `userActivation.isActive` is already false by `input`/`change` time even though the trigger click carried transient activation.

## Bounds compliance

- JSON outputs only under `.ufo/waves/round-77-seats/R77Exec3/` (probe-receipt.json, probe-run-1/2/3.json, probe-run-nondir.json, probe script copy): verified by `ls` — 6 files, nothing else written in the lane except this report at `.ufo/waves/round-77/w1/R77Exec3/report.md` and its identical copy at `.ufo/waves/round-77/w1/R77Exec3.md` (both named by the seat spec; prose only). No writes near `corpus/evidence/round77/`.
- No git/jj mutations; no installs (disk-guard checked before the pass: `/fast/scratch/hyaku` 49% used, 412.9G free). Chromium and node only.
- Scratch `/fast/scratch/hyaku/tabi-r77/R77Exec3/` (run1, run2, run3, rundir) removed at the end; SingletonSocket bound respected (86 B, checked per run by the script's `validateScratch`).

## Risks / open items (not judged here)

- The L1's ~60 s no-answer is unexplained by these runs; if it used a different flow (e.g. no interception, a stale `backendNodeId`, or the directory path before any chooser opened), that path may still hang. These receipts only refute the hypothesis as stated (intercept + opened chooser + directory input).
- Non-regular entries (symlinks, fifos) under the directory were not probed; the note paragraph claims only regular-file behavior.
