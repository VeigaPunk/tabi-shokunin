# tabi — round 98

L1 `TabiR98`. Base `020ce05f` (lane tip at round start; rounds 93-97 closed admitted). ONE claim — C1
coverage, the new capability `client-oopif-uploadmodes-linux` (on a file input inside a cross-site iframe,
Playwright 1.65.0's event trust follows what is passed: a path gives trusted `input`/`change` on a launched
browser and on `connectOverCDP` `isLocal`, a payload object gives untrusted ones on launched, default and
`isLocal` browsers alike; Puppeteer 25.16.0 `launch` gives trusted events like `connect`; the files land
with name, size, type and readable bytes; Playwright `isLocal` with an absent path throws ENOENT `stat`;
Puppeteer's absent-path phantom rejects `Blob.text()` with `NotFoundError`) — worded as the conjunction of
its counter's checks with the launch/connect process named as a driver-pin fact, frozen with its executed
controls in commit `b92b161d` (`claims.json.frozenAt` 01:20:48 -03:00) before the scored run (`172bc0a1`,
started 01:20) and before the wave `.ready` was written (01:21:53).

## Gate

### Sources — opened this round

- **S240** (admit, tier A, `mined`) — Playwright `packages/playwright-core/src/server/dom.ts` at tag
  `v1.65.0`, https://raw.githubusercontent.com/microsoft/playwright/v1.65.0/packages/playwright-core/src/server/dom.ts
  (accessed 2026-11-09 01:05 -03:00 by the L1, HTTP 200, 49,422 B, sha256 `65cb43c91893`, staged in the
  freeze commit as `.ufo/waves/round-98/sources/dom.ts`). Line 779: "await
  this._page.delegate.setInputFilePaths(progress, retargeted, localPathsOrDirectory);" (4 words by
  `wc -w`), inside the branch opened at line 768 on `localPaths`/`localDirectory`; lines 786-787 the else
  branch "injected.setInputFiles(node, files), filePayloads!));". It teaches the PLA/PLL (trusted) versus
  PLAB/PLB/PLLB (untrusted) split.
- **S241** (admit, tier A, `mined`) — Chromium Blink `third_party/blink/renderer/core/fileapi/file_error.cc`
  at tag `155.0.8059.84`,
  https://raw.githubusercontent.com/chromium/chromium/155.0.8059.84/third_party/blink/renderer/core/fileapi/file_error.cc
  (accessed 2026-11-09 01:06 -03:00, HTTP 200, 12,165 B, sha256 `2b5ea5565093`, byte-identical to the `main`
  copy fetched at 01:05; staged `.ufo/waves/round-98/sources/file_error.cc`). Lines 55-57:
  `kNotFoundErrorMessage` "A requested file or directory could not be found at the time an operation was
  processed." (16 words). It grounds the PUR read.
- **S242** (admit, tier A, `mined`) — Puppeteer `packages/puppeteer-core/src/node/ChromeLauncher.ts` at tag
  `puppeteer-v25.16.0`,
  https://raw.githubusercontent.com/puppeteer/puppeteer/puppeteer-v25.16.0/packages/puppeteer-core/src/node/ChromeLauncher.ts
  (accessed 2026-11-09 01:05 -03:00, HTTP 200, 10,415 B, sha256 `ba077ef522e7`, staged). Lines 90-93
  "return argument.startsWith('--remote-debugging-');" and 278-280 "headless === 'shell' ? '--headless' :
  '--headless=new',". It grounds the PUA launch leg's DevTools port and headless mode.
- **S238** re-opened (no row change): `fileUploadUtils.ts` v1.65.0 sha256 `96dd5ef0713d`, identical to the r97
  staged copy; line 62 still the not-collocated branch. `used-by` unchanged (`status`/`recheck`/`used-by`
  old→new: none).

### Rejected as rows (reasons; flip conditions)

- Puppeteer `BrowserLauncher.ts` @ puppeteer-v25.16.0 (20,531 B, sha256 `4b83ff9c9bba`, staged): the headless
  argument mapping the claim needs is in ChromeLauncher.ts (S242); BrowserLauncher.ts carries the generic
  launch flow with no claim-bearing line. Flip: a claim on Puppeteer's launch timeout/pipe/`handleSIG*`
  behaviour.
- Playwright `chromium.ts` @ v1.65.0 as its own row (sha256 `59286d443f29`, unchanged since r97): lines
  371-378 show Playwright's launch passes `--headless` and refuses `--remote-debugging-pipe` but not a port;
  the note records that as context. Same rejection as r97 (companion to S238). Flip: a claim on Playwright's
  launch arguments themselves (e.g. a headed or `chromium-headless-shell` leg).

### Assimilation / considerthese

Assimilation: none (this round's claim draws on no `merge/tabi/` theme). No `considerthese/` directory in
this lane.

## Mistakes

1. **Class: a new instrument that composes paths under a caller's scratch dir, written without the path
   budget the driver introduced.** Evidence: the r98 driver sets `TMPDIR=<scratch>/t` (so Playwright's launch
   profile stays under the scratch dir and the sweeps reach it). The live-killer harness, written the same
   hour, nested its runs at `<scratch>/kl/K-exit-XXXXXX/run-frozen/driver/t`; chromium's singleton socket
   under that TMPDIR exceeded the 108-byte `sun_path`, every browser failed to start, and the first freeze
   run of the harness ended `setup` for both the frozen and the neutralised counter
   (`.ufo/waves/round-98/controls/livekillers-first-run.json`). Captured-by: the counter's exit-3 → `setup`
   mapping (r95/r96), so it was refused as a host failure and not scored as a kill or a survival; nothing
   caught it before the run. Fix: the harness uses one-letter directory names
   (`scripts/livekillers-client-oopif-uploadmodes-round98.mjs` lines 47-49, 57), and declared limit 7 states
   the budget. **Shown able to fail:** long names → rc 2 `setup` (first run, committed); short names → rc 0,
   3/3 killers (`controls/livekillers.json`); the launch-fail control (`controls/counter-setup-launchfail.json`,
   a 90-byte `--scratch`) reproduces the failure mode on demand.
2. **Class: a wave seat role the validator does not know.** Evidence: the first `ufo-swarm-wave.mjs run`
   on the w1 spec returned `{"schema":"ufo-swarm-wave-error-v1","code":"unknown_role","message":"items[6].role
   \"labrat\" is not a swarm role"}` (rc 1; the error file was overwritten by the passing re-run — the text
   is quoted here from the L1's terminal). Captured-by: the validator (it refused before any `.ready`). Fix:
   the hypothesis probe rides a `revenger` seat. Not counted as a shown fix: the validator already was the
   check.
