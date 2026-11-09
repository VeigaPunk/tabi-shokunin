# tabi — round 97

L1 `TabiR97`. Base `607c8b02` (lane tip at round start; rounds 92-96 closed admitted). ONE claim — C1
coverage, the new capability `client-oopif-uploadfile-linux` (on a file input inside a cross-site iframe,
Puppeteer 25.16.0 `uploadFile` fills it with trusted `input`/`change` events, Playwright 1.65.0
`setInputFiles` over a default `connectOverCDP` fills it with untrusted ones and with `isLocal: true` with
trusted ones; Puppeteer's clear fires untrusted events; an absent path is a resolved 0-byte phantom in
Puppeteer and ENOENT in Playwright) — worded as the conjunction of its counter's checks, frozen with its
executed controls in commit `4a4e15e3` (`claims.json.frozenAt` 00:24:35 -03:00) before the scored run
(`be9487f6`, started 00:24) and before the wave `.ready` was written (00:25:46).

## Gate

### Sources — opened this round

- **S237** (admit, tier A, `mined`) — Puppeteer `packages/puppeteer-core/src/cdp/ElementHandle.ts` at tag
  `puppeteer-v25.16.0`,
  https://raw.githubusercontent.com/puppeteer/puppeteer/puppeteer-v25.16.0/packages/puppeteer-core/src/cdp/ElementHandle.ts
  (accessed 2026-11-09 00:12 -03:00 by the L1, HTTP 200, 6,124 B, sha256 `c86ed958566f`, staged in the
  freeze commit as `.ufo/waves/round-97/sources/ElementHandle.ts`). Lines 158-161: "await
  this.client.send('DOM.setFileInputFiles', {" … "objectId: this.id," … "files," (7 words by `wc -w`).
  Lines 138-150: the zero-files branch assigns `element.files = new DataTransfer().files` and dispatches
  `new Event('input', …)` / `new Event('change', …)` under the comment "XXX: These events should converted
  to trusted events". Line 118 "Locate all files and confirm that they exist." is followed by path
  resolution only (119-131). It teaches the PUX/PUS/PUM/PUC outcomes. The installed dist
  `lib/puppeteer/cdp/ElementHandle.js` is pinned by the counter (sha256 `162b7199…`).
- **S238** (admit, tier A, `mined`) — Playwright `packages/playwright-core/src/server/fileUploadUtils.ts` at
  tag `v1.65.0`,
  https://raw.githubusercontent.com/microsoft/playwright/v1.65.0/packages/playwright-core/src/server/fileUploadUtils.ts
  (accessed 2026-11-09 00:15 -03:00 by the L1, HTTP 200, 3,437 B, sha256 `96dd5ef0713d`, staged as
  `.ufo/waves/round-97/sources/fileUploadUtils.ts`). Line 62: "if
  (!frame._page.browserContext._browser._isBrowserCollocatedWithServer) {" (2 tokens by `wc -w`; one
  statement). Lines 63-74 read each path into a buffer and set `localPaths = undefined`. Read with
  `chromium.ts` v1.65.0 lines 162-163 ("if (!options.isLocal)" / "browser._isBrowserCollocatedWithServer
  = false;"; HTTP 200, 24,127 B, sha256 `59286d443f29`, staged beside it). It teaches the PLX/PLS/PLL/PLM
  outcomes. The same logic is in the pinned `lib/coreBundle.js` (sha256 `4ef83305…`) at lines 21219-21256
  (`prepareFilesForUpload`) and 52379-52380 (`if (!params2.isLocal)`), read by the L1 with `sed -n` on the
  pinned install.
- **S239** (admit, tier A, `mined`; post-wave, not a claim input) — Playwright
  `packages/injected/src/injectedScript.ts` at tag `v1.65.0`,
  https://raw.githubusercontent.com/microsoft/playwright/v1.65.0/packages/injected/src/injectedScript.ts
  (accessed 2026-11-09 00:39 -03:00 by the L1, HTTP 200, 85,112 B, sha256 `ff78c2368acf`, staged as
  `.ufo/waves/round-97/sources/injectedScript.ts`). Lines 1027-1028: "input.files = dt.files;" …
  "input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));" (11 words by `wc -w`);
  `change` the same way at line 1029. Opened after the wave to close R97Connector's citation gap (S238
  covers buffer preparation, not the dispatch); R97Scout row 13 and R97Critic2 (bundle decode) located the
  same lines. It grounds the r97 note's mechanism sentence only; C1 was frozen and scored before it.
- **Reject (not a new row)** — `chromium.ts` v1.65.0 as its own row: its one relevant statement (lines
  162-163) is quoted in S238's anchor; a separate row would teach nothing S238 does not. Flip: a later claim
  that rests on another part of `chromium.ts` (e.g. `connectOverCDP` headers or `noDefaults`).
- **Reject (not a new row)** — Playwright `crPage.ts` v1.65.0 (re-opened: HTTP 200, 59,431 B, sha256
  `918f0f9beed3`, the same bytes as S230): lines 343-351 (`setInputFilePaths` → `DOM.setFileInputFiles` on
  the frame's session) and 445 (the per-frame-session `Page.fileChooserOpened` listener). Same URL as S230;
  a second scope would be a W04 duplicate. Its lines ground the r96 note's appended correction (r96
  spot-check D1). Flip: none needed for a row.

Status/recheck/used-by changes: S237, S238 and S239 are new rows (none → `mined`, 90d, used-by the r97 note).
No existing row is edited (append-only). Search-log entries appended (`corpus/SOURCES.md`, the two round-97 lines: pre-freeze and post-wave).

r96 spot-check §6: D1 answered by appended corrections to `corpus/knowledge/client-oopif-filechooser-
round-96.md` and `corpus/lessons/round-96.md` (crPage.ts line 445 + coreBundle.js line 39325 as the
listener's ground; the reject flip text). D3 answered in this round's instrument (whole-tree sha256 per
client; freeze control 7: a comment-only edit to `CdpSession.js` that kept every r96 pin now fails `libs`,
`controls/counter-tampered-tree-live.json`). D2/D4 carried in SCORECARD Planned.

Assimilation: none (no `merge/tabi/` theme taken this round). considerthese: no `considerthese/`
directory in this lane.

## Mistakes

1. **Class: a line-anchored edit applied at a guessed line number (recurrence of r96 mistake 2).**
   Evidence: while hardening the driver's launch wait, the L1 anchored a replace to line 240 of
   `scripts/client-oopif-uploadfile-round97.mjs` after reading only an elided outline of it; line 240 was
   the `} else {` that opens the Playwright branch, and the edit overwrote it with the fetch loop. The
   edit echo showed the damage; the L1 restored the line (the file's snapshot tag returned to the
   pre-edit value) and re-anchored after a `grep -n`. Captured-by: the r96 fix was a process rule ("read
   a range in the same turn before any line-anchored edit") plus a label check for control scripts; neither
   binds a JS instrument, and the rule did not bind the L1. A first candidate fix — `node --check` on every
   instrument — **does not fail on this mutant**: the overwritten `{`/`}` stay balanced, so the mutant
   parses (`.ufo/waves/round-97/mined/syntax-mutant.txt` rc 0, same as the committed bytes in
   `syntax-committed.txt`). Fix: `.ufo/waves/round-97/mined/check-driver-positive.sh` — after any driver
   edit, one positive rep must exit 0 with zero leg failures before the freeze (the freeze controls'
   positive run is the same gate at full reps). **Shown able to fail:** on the committed driver → rc 0,
   `failures=0` (`mined/positive-committed.txt`); on the misanchored mutant
   (`mined/driver-misanchored-mutant.mjs`, the exact overwrite reconstructed) → rc 1, `failures=4`, every
   Playwright leg "Cannot read properties of undefined (reading 'goto')" (`mined/positive-mutant.txt`,
   `mined/mutant-driver.out`).
2. **Class: a host-load launch window treated as a law failure risk.** Evidence: the first full driver run
   (`.ufo/waves/round-97/probes/probe-a.json`) lost 2 of 24 legs to `devtools endpoint never answered`
   under load1 ≈ 31, with the r96 6 s launch window. Captured-by: the r95/r96 driver exit 3 → counter
   `setup` mapping (a launch failure is never scored as a law finding) — so the class was caught, not
   missed; what it cost was the run. Fix: a 15 s launch window and a port-release wait between legs
   (driver comments; `probe-b.json` 24/24 under the same host). Not counted as shown-to-fail: the window
   change has no failing-before control that does not depend on host load.

## Wave w1 (12 seats; every seat filed; artifacts in `.ufo/waves/round-97/w1/`; `w1-results.json`)

Dispatched by the inline handoff (`w1.ready` 00:25:46; orchestrator WAVE-DONE, all 12 settled). Roles:
executor ×3, critic ×3, mutation-tester ×1, reviewer ×1, sentinel ×1, scout ×1, scribe ×1, connector ×1;
attack share (reviewer+critic+mutation-tester) 5/12 = 42 %. Dead seats: 0. Verdicts: 10 neutral, 2
`falsifies-wording` (R97Scribe F1: process clauses are driver-pin facts; R97Sentinel: "whole installed
package tree" / "lockfile integrity" identity wording) → `plans/round-97.md` §Post-wave amendment A1 items
1-6; counter, driver and numbers unchanged. Independent `--live` runs, all clean: R97Exec1 ×2 (232),
R97Exec2 default (232) and `--reps 10` (736, 80 legs), R97Reviewer (232), R97Sentinel baseline ×2 (232).
R97Critic3: seven forged receipts all rc 1; a two-listener probe reproduces the trust split. R97Mut: 83
mutants, 9 survivors (3 battery gaps with verified killers, 3 equivalent, 3 live-only); its
`R97Mut-results.json` header totals (`survived: 0`) are stale from its first, mis-rooted sweep — the
per-mutant verdicts (9 SURVIVED) and its report are authoritative (seat-artifact defect, recorded, not
edited). R97Sentinel: a behaviour-changing transitive `ws` patch is caught by the legs; a comment-only
transitive edit, a forged transitive lock entry and an added empty directory score clean.

## Leads (not rows this round)

R97Exec3: Playwright `chromium.launch` → trusted events; `isLocal` + absent path → the same ENOENT `stat`
message; Puppeteer `launch` = PUX; the phantom entry's page read rejects; payload objects → untrusted.
R97Scout (seat-opened, not re-opened by the L1): pptr.dev `ElementHandle.uploadFile` ("This will not
validate whether the file paths exists."), puppeteer #10053 / PR #5733, playwright PR #38614 (`isLocal`),
obscura #384 (a non-Chromium CDP server firing untrusted events). R97Sentinel: hash the transitive closure
and the root lock, record `node --version`. R97Mut: battery cases M40/M42/M66, live killers M75-M77.
