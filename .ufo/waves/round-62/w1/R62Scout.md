# R62Scout — S165 source audit and baseline witness sweep

Axes: coverage, source freshness, calibration. High confidence in located source facts; bounded negative-search confidence for baseline novelty.

## Located source evidence

Reopened https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events at **2026-11-04T15:22:13.123184+00:00**, HTTP 200, final URL unchanged. Fetch operation: Python `urllib.request.urlopen(url, timeout=60)` followed by `response.read()`; operation exit 0 (no subprocess exit implied). Response Last-Modified: Wed, 04 Nov 2026 00:58:19 GMT. Raw body: 188114 bytes, SHA256 **1c034e35fa1bd57154ca19af3760343c7f1ea86fc9229a194659d409bcd10bc7**. Independently refetched bytes equal staged `.ufo/waves/round-62/sources/s165-mdn.html` by SHA256. Staged mtime is not represented as an original fetch timestamp.

Exact section: [Determining button states](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events#determining_button_states), staged/fresh lines 1978–2039. Header columns at 1987–1989: Device Button State / button / buttons. Located table-row quote (8 whitespace-separated words): **“Right Mouse, Pen barrel button | 2 | 2”** (pipes render cell boundaries, not source punctuation), lines 2014–2016. The source text itself is the three cells `Right Mouse, Pen barrel button`, `2`, `2`.

**Admissible claim:** S165 documents right-mouse/pen-barrel changed-button value `button=2` and right-button-state mask `buttons=2`. This supports interpretation of page-side values in C2, not the existence or correctness of a particular browser run. The source note at 2037 distinguishes changed-button identity from held-button state; do not imply every pointer event has button 2.

**Rejected overclaim:** “MDN proves contextmenu fires at press with buttons 2 and cancellation succeeds across browsers.” This table specifies values, not cross-browser contextmenu dispatch timing, event ordering, cancellation, trust, or pointer identity. **Flip:** only browser/build/OS-scoped page-event receipts with sequence, timestamps, held-state and defaultPrevented observations can support the corresponding scoped timing claim; independent browser-specific observations would be required before broadening. No timing evidence was run by this seat. MDN is explicitly rejected as proof of cross-browser contextmenu timing.

Durable evidence directory: `.ufo/waves/round-62/w1/R62Scout/`: `fetch.json`, `s165-refetch.html`, `located-section.txt`, `commands.json`, `baseline-sweep.txt`, `baseline-lane-authored-sweep.txt`, `baseline-primary-pointer.json`, `instrument-hashes.json`.

## Baseline sweep

Baseline **57b29bade4b05b03cdb8fa151daec90ac9b1a29c**; freeze **1ec5eb3fc8cd17f696a7b7f03617bf69a6a5c2a4** supplied as input, not mutated. `claims.json` and `instrument-pins.json` were read first. All six current instrument/snapshot hashes matched their supplied pins; exact expected and observed SHA256 values are recorded in `instrument-hashes.json`. No instrument executed or edited.

Exact argv, stdout/stderr and exit codes for historical Git operations are in `commands.json`. Every Git command names `-C /home/vgpnk/Projects/shokunin/tabi-shokunin`.

1. `git -C LANE ls-tree -r --name-only BASELINE`: exit 0, 21228 paths.
2. `git -C LANE grep -n -I -i -E` with separate `-e` patterns `secondary`, `right.button`, `contextmenu`, `"button"[[:space:]]*:[[:space:]]*2`, `"buttons"[[:space:]]*:[[:space:]]*2`, `button:[[:space:]]*['\"]right`, `button[[:space:]]*===[[:space:]]*2`, at BASELINE over `scripts`, `corpus/knowledge`, `corpus/evidence`: exit 0, 77 matching lines before full snapshot exclusion. Initial exclusions: node_modules, vendor, vendored, sources, source, bytes, snapshots directory globs.
3. Same search additionally excluding `**/*.html`, `**/*.htm`, `**/*@*`, `**/release-pins/**`: exit 0, 13 matching lines. All are unrelated secondary rate limits/fleet source metadata or a browser-extension permission listing (`contextMenus`), not page-side secondary-button witnesses. The initial search's extra hits were fetched documentation HTML and vendored/fetched `WebMCPView.ts@...` snapshots; they are not counted as lane-authored evidence. No candidate witness was discarded merely because it was HTML: initial HTML hits were source snapshots.
4. Targeted historical grep for `pointerdown|pointerup|dispatchMouseEvent|pointerlog|button:|buttons:` over r61 driver and receipt: exit 0. `scripts/chrome-cdp-loopback-round61.mjs:275,280` dispatches **left** press/release, held masks 1→0. Historical `git show BASELINE:corpus/evidence/round61/chromium-pointer-domain/receipt.json`: exit 0; page `ptrlog` records mouse pointerdown button 0/buttons 1 and pointerup button 0/buttons 0, stable pointerId 1, trusted true. Receipt event locations include 640 and 650. This is a primary-pointer witness, not a secondary-button witness.

**Observed:** no page-side secondary-button witness found in this bounded baseline scripts/knowledge/receipts sweep. **Inference:** C2's page-side secondary-button domain is not duplicated by those baseline artifacts. This is not semantic proof of global absence or a claim about excluded third-party source payloads.

LSP: `read xd://lsp` returned **No such tool**; no semantic server was available through that device. Historical Git grep is explicitly literal fallback, not symbol/reference proof. No exported contract was changed.

## Operation ledger and limits

Initial setup command with nonexistent scratch cwd failed before execution (no process exit code). Corrected absolute-path mkdir/hash/stat command exited 0; staged SHA and size above observed. It also listed the source directory. Source reads/grep are tool operations, not fabricated shell exit codes. Scratch created only at `/fast/scratch/hyaku/tabi-r62/R62Scout`; removed using `shutil.rmtree` after copying durable evidence, with absence observed. No clone, browser, listener, installed tool, production edit, SOURCES edit, or VCS mutation. Browser survivor/port checks are not applicable: no browser/service started. The finite setup command was inadvertently registered as a supervised service by its name and exited 0 immediately.

No build/lint/format or C1/C2 scored checks executed. No outside-admission status claimed. Unanswered keyup/kaidoku overlap remains unanswered; uncertain split-declared kaidoku lines remain contested-open. Only C1/C2 exist; certification is evidence support, not another claim.

Report: .ufo/waves/round-62/w1/R62Scout.md
