# R92ExecProbe — limit-5 probe (H): answering on the other session

Declared limit 5 (plans/round-92.md): "Answering on the OTHER session (e.g. the page
session in X) is not measured; the claim is where the event arrives and that answering
on that session works, not that another session fails." This probe tests the directional
implication behind H without touching lane instruments.

## Setup
- Probe script: `.ufo/waves/round-92/w1/R92ExecProbe-probe.mjs` (copy of the pinned
  driver's runLeg fixture, answer section replaced)
- Results: `.ufo/waves/round-92/w1/R92ExecProbe-results.json`
- Ports: http 19301, child 19302, cdp 19303 — no Chromium remains on 19303 after run
- Command:
  `node /fast/scratch/hyaku/tabi-r92/R92ExecProbe/probe.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin --nonce tabi-r92-probe-1933 --scratch /fast/scratch/hyaku/tabi-r92/R92ExecProbe --out /fast/scratch/hyaku/tabi-r92/R92ExecProbe/out.json --http-port 19301 --child-port 19302 --cdp-port 19303 --reps 3 --cross-host localhost`
  exit 0, 6 legs, 0 failures, 24.8s. Fresh browser+profile per leg, Chromium
  155.0.8059.84, arm X = child `localhost`, arm S = child `127.0.0.1`.
- Tooling: none installed. Node v24.21.0, system Chromium 155.0.8059.84 as-is.

## Procedure (per leg)
1. Click `#s` centre on the page session; collect `Page.fileChooserOpened` (1500 ms).
2. X arm: send `DOM.setFileInputFiles` with the chooser's `backendNodeId` on the PAGE
   session (the other session); record the answer error; read child `files`.
3. Then answer on the IFRAME session (the session the chooser arrived on); record error.
4. S arm: no iframe session exists (0 attached `iframe` targets); record `files` before
   any answer, then answer on the page session as a control.

## Results (3 reps)
- X-1/X-2/X-3: chooser arrived on the iframe session (backendNodeId 2 each leg).
  Page-session answer error in all 3 reps: `"Node is not a file input element"`;
  child `files` afterwards: `[]` in all 3 reps. Subsequent iframe-session answer error:
  `null` in all 3; final child `files`: `[["tabi-r92-answer.txt", 22]]` all 3.
- S-1/S-2/S-3: chooser arrived on the page session (backendNodeId 5 each leg); no iframe
  session to answer on. Page-session (chooser-session) answer error `null` all 3;
  final child `files`: `[["tabi-r92-answer.txt", 22]]` all 3; clicks served.

## H verdict
**H confirmed, 3/3 reps (X arm):** `DOM.setFileInputFiles` on the page session with the
iframe session's `backendNodeId` errors ("Node is not a file input element") and does NOT
deliver the file (child `files` `[]`); the iframe-session answer then works cleanly.
S arm: no iframe session exists to answer on (vacuous half of H, as stated). The
cross-session answer fails precisely because the backendNodeId is session-scoped — it
does not resolve to a file input on the other session.

## Claim impact
**VERDICT C1: neutral.** H is declared limit 5, explicitly outside the claim; the probe
shows the "other session fails" behaviour the limit disclaims measuring, and nothing in
the probe contradicts any predicate clause — all legs reproduced the driver's positive
outcome (chooser session, answer session, file delivery, click) on the session the
predicate names. The probe falsifies no wording and no number.

Report paths (relative to `/home/vgpnk/Projects/shokunin/tabi-shokunin`):
Report: .ufo/waves/round-92/w1/R92ExecProbe.md
