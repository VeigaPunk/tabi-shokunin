# tabi — round 96

L1 `TabiR96`. Base `b16b3aa1` (lane tip at round start; rounds 92-95 closed admitted). ONE claim — C1
coverage, the new capability `client-oopif-filechooser-linux` (Puppeteer 25.16.0's
`page.waitForFileChooser` never resolves for a chooser opened inside a cross-site iframe, even when a
second CDP connection proves the chooser opened there, while it resolves same-site; Playwright 1.65.0's
`filechooser` event resolves and fills the child for both) — worded as the conjunction of its counter's
checks, frozen with its controls in commit `ba611b22` (`claims.json.frozenAt` 23:47:33 -03:00) before the
scored run (`75fe36dc`, started 23:48) and before the wave `.ready` was written (23:49:53).

## Gate

### Sources — opened this round

- **S236** (admit, tier A, `mined`) — Puppeteer `packages/puppeteer-core/src/cdp/Page.ts` at tag
  `puppeteer-v25.16.0`,
  https://raw.githubusercontent.com/puppeteer/puppeteer/puppeteer-v25.16.0/packages/puppeteer-core/src/cdp/Page.ts
  (accessed 2026-11-08 23:29 -03:00 by the L1, HTTP 200, 43,820 B, sha256 `e7f2f6b8ea8b`, staged in the
  freeze commit as `.ufo/waves/round-96/sources/Page.ts` with `sha256.txt`). Lines 339 and 361:
  "const clientEmitter = new EventEmitter(this.#primaryTargetClient);" …
  "clientEmitter.on('Page.fileChooserOpened', this.#onFileChooser.bind(this));" (10 words by `wc -w`
  over both quoted statements). Lines 561-562 enable `Page.setInterceptFileChooserDialog` on the same
  `#primaryTargetClient`. It teaches why the PPX/PPW legs time out: the listener and the interception
  live on the page's primary session only, and Chromium reports an OOPIF's chooser on the iframe's
  session (r92-r95). The installed dist file `lib/puppeteer/cdp/Page.js` (sha256 `31a522df…`, pinned by
  the counter) carries the same wiring at lines 273, 289 and 445.
- **Reject (not a new row)** — Playwright `crPage.ts` v1.65.0 as a second row for the per-session
  listener: already registered as S230 (r92 wave scout, same commit `a1f35e19…`); a second row would
  duplicate it. Flip: none needed — S230 is cited by the note.

Status/recheck/used-by changes: S236 is a new row (none → `mined`, 90d, used-by the r96 note). No
existing row is edited (append-only). Search-log entry appended (`corpus/SOURCES.md`, round-96 line).

Assimilation: none (no `merge/tabi/` theme taken this round). considerthese: no `considerthese/`
directory in this lane.

## Mistakes

1. **Class: a setup-refusal path that never returns.** Evidence: the first run of the r96 freeze
   controls (pre-guard instrument bytes) stopped at control 11 (`--scratch /proc/tabi-r96-unwritable`):
   no rc line for controls 11-12, the control script killed by its 600 s bound
   (`.ufo/waves/round-96/controls/rc-firstrun-hung.txt`). Root cause, measured: `timeout 5 node -e
   "require('fs').mkdirSync('/proc/tabi-r96-x',{recursive:true})"` → rc 124 on Node 24.21 (recursive
   mkdir spins on a `/proc` path), while a chmod-500 parent gives `EACCES` at once. The r95 counter has the
   same `mkdirSync(scratch, {recursive: true})` line, so R95Sentinel's routed "unwritable scratch exits
   rc 1" item hid a worse case: a hang. Captured-by: the r96 control itself (built to answer that routed
   item) — but only because the control script had an outer time bound; the counter had none.
   Fix: counter and driver now refuse (`setup`, rc 2) unless the scratch's nearest existing ancestor is a
   writable directory, before any recursive mkdir; control 11 runs under `timeout 60` in two forms.
   **Shown able to fail:** on pre-guard bytes the same control never returned (the hung run above); on the
   frozen bytes both forms return rc 2 `setup` in well under a second (`controls/rc.txt`
   `setup-unwritable-scratch-proc rc=2`, `setup-unwritable-scratch-ro rc=2`). With the guard removed, the
   bounded control would print rc 124, not 2.
2. **Class: a line-anchored edit applied at a guessed line number.** Evidence: three times this round the
   L1 anchored an edit to a line number it had not just read — in the counter (caught by the edit tool's
   syntax warning and a re-read), in this lesson (caught by re-reading the edit echo), and in
   `controls/run-controls.sh`, where the replacement silently overwrote control 10 (`receipt path is a
   directory`): a shell script has no syntax gate that would notice. The L1 stopped the run that followed,
   re-read the script, restored control 10 and removed the duplicate control 11 before the run whose
   `rc.txt` is committed. Captured-by: none mechanical (the L1's re-read). Fix:
   `.ufo/waves/round-96/mined/check-control-labels.sh` checks the committed `rc.txt` against
   `mined/expected-control-labels.txt` (the 15 labels the plan's §Controls table implies), and the L1 reads
   a range in the same turn before any line-anchored edit. **Shown able to fail:** on the committed
   `rc.txt` → rc 0 (`mined/labels-committed.txt`); on the same file with the control-10 line removed (what
   the clobbered script would have produced, `mined/rc-without-control10.txt`) → rc 1 `MISSING
   setup-receipt-dir` (`mined/labels-mutant.txt`).
