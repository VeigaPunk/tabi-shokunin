# R98Revenger — protocol-level hypothesis probe (C1, round 98)

Milestone: protocol-level hypothesis probe. Leaf member, no commits, no git mutation, no subagents.

## Hypothesis (as stated in the assignment)
On Playwright 1.65.0 the trusted/untrusted split follows the input kind, not the attach mode. PLA and PLL send
`DOM.setFileInputFiles` over CDP and dispatch no script events; PLAB/PLB/PLLB never send `DOM.setFileInputFiles`
and instead evaluate the injected `setInputFiles`.

**Verdict on hypothesis: SURVIVED** for the mechanism and the input-kind split, with one clause narrowed (see
"Caveat on 'no script events'"). Puppeteer arms (PUA, PUR) were probed too; they also send `DOM.setFileInputFiles`
for both path and missing-path inputs.

## Setup
- Client deps (own install, npm registry, default channel): `npm install --no-audit --no-fund puppeteer-core@25.16.0
  playwright-core@1.65.0` into a scratch dir (26 packages added). No system tool installed; no pacman/uv/npm -g.
- Probe: `.ufo/waves/round-98/w1/R98Revenger-probe.mjs` (copy of `/fast/scratch/hyaku/tabi-r98/R98Revenger/probe.mjs`).
  Same fixture shape as the frozen driver: parent `127.0.0.1:33651/parent.html?leg=…` with `#pp` + iframe; cross-site
  child `localhost:33652/child.html?leg=…` with `#s` and input/change/click listeners recording `[type, isTrusted]`.
  CDP port 33653. Chromium `/usr/bin/chromium` (155.0.8059.84), TMPDIR `/fast/scratch/hyaku/tabi-r98/R98Revenger/t`.
  One rep, each arm its own process and own browser. Launch arms via `client.launch`; connect arms via a runner-started
  `chromium --headless=new --remote-debugging-port=33653` + `connect`/`connectOverCDP`.
- Logs: Playwright `DEBUG=pw:protocol`; Puppeteer `NODE_DEBUG=puppeteer*` (see note below: `DEBUG` does not enable
  Puppeteer's protocol logger; the first attempt with `DEBUG='puppeteer:protocol:*'` produced no protocol lines).

Commands run (exit codes):
```
TMPDIR=…/t DEBUG=pw:protocol node probe.mjs PLA   > pla-out.json  2> pla.log    -> rc 0   (first trial)
for a in PLA PLAB PLB PLLB PLL: DEBUG=pw:protocol node probe.mjs $a > pw-$a.json 2> pw-$a.log   -> rc 0 each
for a in PUA PUR: DEBUG='puppeteer:protocol:*' node probe.mjs $a                                  -> rc 0 (no protocol lines)
for a in PUA PUR: NODE_DEBUG='puppeteer*' node probe.mjs $a > pu-$a.json 2> pu-$a.log            -> rc 0 each
pgrep -f "remote-debugging-port=33653"  -> empty (NO_CHROMIUM_LEFT) after each batch
```

## Per-leg results (leg-level outcome; all legs resolved, no runner error)

| leg | lib / mode / input | `DOM.setFileInputFiles` sends (session) | `Runtime.callFunctionOn` invoking injected `setInputFiles` | #s files | #s events `[type,isTrusted]` | read |
|---|---|---|---|---|---|---|
| PLA | pw / launch / path | 1 (iframe session `554E…`, target type `iframe`) | 0 | `[probe-answer.txt,22,text/plain]` | input,true / change,true | ok, answer bytes |
| PLAB | pw / launch / payload | 0 | 1 (`injected.setInputFiles(`) | `[tabi-r98-payload.txt,29,text/plain]` | input,false / change,false | ok, payload bytes |
| PLB | pw / connect (isLocal false) / payload | 0 | 1 | `[tabi-r98-payload.txt,29,text/plain]` | input,false / change,false | ok, payload bytes |
| PLLB | pw / connect (isLocal true) / payload | 0 | 1 | `[tabi-r98-payload.txt,29,text/plain]` | input,false / change,false | ok, payload bytes |
| PLL | pw / connect (isLocal true) / path | 1 (iframe session `3A48…`, target type `iframe`) | 0 | `[probe-answer.txt,22,text/plain]` | input,true / change,true | ok, answer bytes |
| PUA | pptr / launch / path | 1 (iframe session `1D78…`, target type `iframe`), files `[…/probe-answer.txt]` | 0 (Puppeteer sends no injected setInputFiles) | `[probe-answer.txt,22,text/plain]` | input,true / change,true | ok, answer bytes |
| PUR | pptr / connect / missing | 1 (iframe session `DE99…`, target type `iframe`), files `[…/tabi-r98-missing.txt]` | 0 | `[tabi-r98-missing.txt,0,text/plain]` | input,true / change,true | `err NotFoundError` + the frozen message |

Counts are over full protocol logs of single-arm processes (each log has one LEG-START/LEG-END pair; no cross-leg mixing).
The `Runtime.evaluate` that defines the injected bundle (including its `setInputFiles` method) appears once per Playwright
leg; it is a definition, not a call, and is excluded from the counts. Matching was done by the string
`injected.setInputFiles(` inside `Runtime.callFunctionOn` sends for Playwright and by `DOM.setFileInputFiles` sends for both.

Trimmed logs (only LEG markers, `DOM.setFileInputFiles`, injected `setInputFiles` calls, iframe `attachedToTarget`):
- `R98Revenger-pw-PLA.txt`, `R98Revenger-pw-PLAB.txt`, `R98Revenger-pw-PLB.txt`, `R98Revenger-pw-PLLB.txt`, `R98Revenger-pw-PLL.txt`
- `R98Revenger-pu-PUA.txt`, `R98Revenger-pu-PUR.txt`
Results: `R98Revenger-results.json` (the seven leg objects as the probe printed them).

## Does the predicted leg-level shape hold?
Yes, for all seven legs: the observed #s state matches the frozen predicate's per-arm statement
(PUA/PLA/PLL trusted path arms with the 22-byte answer; PLAB/PLB/PLLB untrusted payload arms with the 29-byte payload;
PUR trusted events with the NotFoundError read). The probe did not reproduce the frozen missing-path Playwright leg PLLM
(not in the assignment's list); it was not run.

## Observations beyond the hypothesis
1. **Input kind, not attach mode, selects the path.** PLA (launch, path) and PLL (connect, path) both use
   `DOM.setFileInputFiles` on the iframe session and get trusted events. PLAB (launch, payload), PLB (connect, payload)
   and PLLB (connect, payload) use the injected `setInputFiles` and get untrusted events. The launch/connect split does
   not change the path (PLA vs PLL, and PLAB vs PLB/PLLB), so the split tracks input kind. This is the hypothesis as
   stated. Note the Playwright `isLocal` flag was not tested as a separate variable beyond PLB vs PLLB (both payload,
   both injected, both untrusted), which is consistent with it not changing the path.
2. **Upload session is the iframe's.** For every `DOM.setFileInputFiles` send, the `sessionId` belongs to a
   `Target.attachedToTarget` event with `targetInfo.type = "iframe"` (Playwright PLA, PLL; Puppeteer PUA, PUR). The page
   session is not used for the upload.
3. **Puppeteer never calls the injected path.** Both Puppeteer arms (path and missing path) use `DOM.setFileInputFiles`
   and no `Runtime.callFunctionOn` invokes `setInputFiles` (0 for both). Puppeteer sends the absolute path unchanged, and
   Chromium resolves it: for the existing file it reads the answer, for the missing file it creates the phantom entry
   and the read rejects with `NotFoundError`. The missing-path trusted events on PUR are therefore the browser's own
   events for the path it was given. (Playwright's `DOM.setFileInputFiles` path for PLLM was not probed.)

## Caveat on "dispatch no script events"
The assignment's hypothesis says PLA and PLL "dispatch no script events". The probe does not show a script dispatch on
the path arms, and their listeners recorded `isTrusted: true`, which means the events are browser-generated, not
script-dispatched. The clause is consistent with the data but the logs do not directly test it: a `dispatchEvent` string
appears once in every Playwright leg, but that is inside the injected bundle definition, present in every leg
including PLL, so it does not discriminate. [INFERENCE] The untrusted events on the payload arms come from the injected
`setInputFiles` dispatching synthetic `input`/`change` events; the full function body is not in the protocol log (the
`callFunctionOn` carries a function reference, 835 bytes per send), so this mechanism is not observed directly.

## Note on Puppeteer logging
`DEBUG='puppeteer:protocol:*'` produced no protocol lines (the process log held only LEG markers). Puppeteer's
`common/Debug.js` in 25.16.0 reads `NODE_DEBUG` (Node `util.debuglog`) or `window.__PUPPETEER_DEBUG`. The rerun with
`NODE_DEBUG='puppeteer*'` produced 232 and 253 lines. Puppeteer's SEND/RECV prefix in those logs is
`puppeteer:protocol:SEND ►`.

## Limits of this probe
- One rep, one Chromium, one host, cross-site localhost under 127.0.0.1, headless only (same as the frozen claim's limit 1).
- PLLM and the Puppeteer launch-with-missing-path arm were not probed (not in the assignment's list).
- No counting command was run here; this is a probe, not the frozen scored run. The frozen counter was not executed.
- The probe ran in its own scratch under `/fast/scratch/hyaku/tabi-r98/R98Revenger`, removed before yield.

## Confidence
High for the per-leg protocol counts and the trusted/untrusted results on this host (logs saved). Medium for the
"no script events" clause (inferred from the injected-bundle structure and the observed trusted flags, not from a
direct log of the dispatch). Frozen predicate itself: no falsification by this probe.

VERDICT C1: neutral
