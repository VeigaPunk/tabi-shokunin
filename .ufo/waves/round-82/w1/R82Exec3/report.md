# R82Exec3 — second-chooser frontier probe (not a capability claim)

Probe driver: `.ufo/waves/round-82-seats/R82Exec3/probe-r82exec3.mjs`
Raw evidence: `.ufo/waves/round-82-seats/R82Exec3/probe.json` (per-leg raw JSON + answers)
Full plumbing receipt: `.ufo/waves/round-82-seats/R82Exec3/probe-receipt.json`

## Method

Copied the frozen driver verbatim (`scripts/chrome-cdp-showpicker-round82.mjs`,
sha256 `2085c2a78a2bc87208404ca6d477964ed8aa29eea52cd31b92a94fe88cc373f1`,
matches `.ufo/waves/round-82/freeze.txt`) and changed ONLY:
- `SCHEMA` → `tabi-r82exec3-second-chooser-r82`
- `FIXTURE_SOURCE` → absolute lane path (probe lives outside `scripts/`)
- nonce regex → `tabi-r82exec3-[a-z0-9-]{4,48}` (frozen driver requires `tabi-r82-`; this is a launcher guard, not plumbing)
- `LEGS` → 2 probe legs (same `showpicker-click-while-open` trigger: prior pad click at
  [360,40], `showPicker()` on `#s`, real CDP click on `#s` centre while first chooser pending)
- added one `probe-second-answer` branch after the stock click block: snapshots all
  `Page.fileChooserOpened` events (`cdpEventLog`), then sends `DOM.setFileInputFiles`
  with `tabi-r82-a.txt` to either the 2nd (`probeWhich:'second'`) or 1st
  (`probeWhich:'first'`) chooser's `backendNodeId`, records `setError/setResult`,
  `stateAfterAnswer` (`window.__state()`) and `eventsAfterAnswer` (`window.__events`).

Run: `node probe-r82exec3.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin
--nonce tabi-r82exec3-probe-001 --scratch /fast/scratch/hyaku/tabi-r82/R82Exec3/scratch
--out /fast/scratch/hyaku/tabi-r82/R82Exec3/receipt/probe-receipt.json
--http-port 19291 --cdp-port 19292 --child-port 19293`
Chromium 155.0.8059.84 `--headless=new` (`/usr/bin/chromium`), Node `v26.9.0`.
Driver exit 0, `failures: []`, both legs `errors: []`. One fresh browser per leg, as frozen.
No tools installed/upgraded (pacman guard respected; only `node`+`python3`+`/usr/bin/chromium` used).

## Q1 — Second chooser's backendNodeId and answerability

In `probe.json`:

- `rawPerLegJson[0] / probeChoosers[1].backendNodeId` = **11**
- `rawPerLegJson[0] / probeChoosers[0].backendNodeId` = **11** (identical; same `frameId`, same `mode` `selectSingle`)
- `rawPerLegJson[0] / cdpEventLog.fileChooserOpened` = `[{params:{mode:selectSingle, backendNodeId:11}}, {params:{mode:selectSingle, backendNodeId:11}}]`

**Answer: the second `Page.fileChooserOpened` carries the SAME `backendNodeId` as the
first (11), not a new one.** (Leg 2 independently: 12 and 12.)

`DOM.setFileInputFiles` on the SECOND event's id (`rawPerLegJson[0] / probeAnswer`):

- `probeAnswer.setParams.backendNodeId` = 11, `probeAnswer.setError` = `null`, `probeAnswer.setResult` = `{}`
- `probeAnswer.stateAfterAnswer.s` = `[["tabi-r82-a.txt", 22, "text/plain", ""]]` — `#s` holds the file
- `probeAnswer.eventsAfterAnswer` ends `…, {type:"input",target:"s",isTrusted:true}, {type:"change",target:"s",isTrusted:true}`; `stateAfter.s` and `stateAfterDismiss.s` agree.

**Answer: YES, answering the second chooser delivers files to `#s` — state shows the
file and trusted `input`+`change` fire on `#s`.**

## Q2 — Answering the FIRST chooser while the second is pending

In `probe.json`:

- `rawPerLegJson[1] / probeChoosers` = `[{backendNodeId:12}, {backendNodeId:12}]`
- `rawPerLegJson[1] / probeAnswer.setError` = `null`, `probeAnswer.setResult` = `{}`
  (`setParams.backendNodeId` = 12, `chooserIndex` = 0, `which` = `"first"`)
- `probeAnswer.stateAfterAnswer.s` = `[["tabi-r82-a.txt", 22, "text/plain", ""]]`,
  trusted `input@s` + `change@s` present; `errors` = `[]`.

**Answer: answering the FIRST chooser while the second is pending SUCCEEDS — no error,
no failure, no race observed.** Because both events share one `backendNodeId`, answering
"first" vs "second" is indistinguishable at the CDP layer; either id delivers the file
to `#s` with trusted `input`+`change`. No second file delivery, no dropped event.

## Caveats

- Frontier evidence for r82, NOT capability legs; no prior-set/counter claims made.
- `DOM.setFileInputFiles` returns `{}` on success in both legs — success is witnessed by
  page state/events, not the CDP reply alone.
- Scratch was removed after receipt copy per bounds; seat files are the three under
  `.ufo/waves/round-82-seats/R82Exec3/`.

Report: .ufo/waves/round-82/w1/R82Exec3/report.md
