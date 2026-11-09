---
source: S227 (CDP `Target.setAutoAttach` at Chromium tag 155.0.8059.84 — auto-attach covers "targets directly related to this one (for example, iframes or workers)"), S228 (Chromium `docs/process_model_and_site_isolation.md` at tag 155.0.8059.84 — site-per-process locks each process to one site), S229 (WHATWG HTML §7.1.1 "obtain a site" — no registrable domain → (scheme, host)), S230 (Playwright `crPage.ts` v1.65.0 — an OOPIF is "already attached in the parent session"), S221 (CDP `Page.fileChooserOpened` — the event's `frameId`/`mode`/`backendNodeId`), S222 (CDP `DOM.setFileInputFiles` — takes `files` + a node id, no accept/directory parameter); receipt `corpus/evidence/round92/chromium-crosssite-iframe-chooser/receipt.json` (driver `scripts/chrome-cdp-iframe-chooser-round92.mjs`, sha256 pin `0feca90ba0272d92d3444d1b23bf0e85a089946408fe52e383e8ddf740321688` in `.ufo/waves/round-92/controls/instrument-sha256.txt`)
verified-at: 2026-11-08 (round 92, Linux host, Chromium 155.0.8059.84 `--headless=new`; scored run `.ufo/waves/round-92/scored/c1-live.json`, nonce `tabi-r92-live-63a66abf7529`, verdict `clean`, 93 checks)
recheck: `node scripts/check-iframe-chooser-round92.mjs --lane <ABS lane> --expect-driver-sha256 0feca90ba0272d92d3444d1b23bf0e85a089946408fe52e383e8ddf740321688 --receipt corpus/evidence/round92/chromium-crosssite-iframe-chooser/receipt.json --expect-nonce tabi-r92-live-63a66abf7529 --json` → exit 0, `verdict: clean`, 93 checks
---

# The cross-site iframe's chooser session — where the event arrives, and where the answer must go

Capability `chromium-crosssite-iframe-chooser-linux` (new, first-working round 92). Round 91 measured
*which element* a `postMessage` proxy could open a picker for; it did not measure *which CDP session*
carries a chooser opened inside an iframe. Round 92 measures that surface and separates two cases that
look alike on the page and differ in the browser's target model: an iframe on a **different site**
(`localhost` vs the parent's `127.0.0.1`) gets **its own target and its own session**, while an iframe
on the **same site, other port** (`127.0.0.1:<child>`) has **no target of its own** and shares the
parent's session.

## The fixture

One parent document at `http://127.0.0.1:<http>/parent.html` holds one iframe `#c` (500×300 at
120,90) whose child document at `http://<childHost>:<child>/child.html` carries one file input `#s`
(160×50 at 30,40) plus a `click` recorder and a `files` reader. Six legs: arms **X** (child host
`localhost`) and **S** (child host `127.0.0.1`), three repetitions each, one fresh browser and profile
per leg, run in the order X-1, S-1, X-2, S-2, X-3, S-3. Per leg the driver: attaches to the tab with
`flatten:true`, enables `Page.setInterceptFileChooserDialog` on the page session, calls
`Target.setAutoAttach {autoAttach:true, waitForDebuggerOnStart:false, flatten:true}` **on the page
session**, navigates, enables interception on every attached `iframe` session, reads `#s`'s rect,
clicks its centre with `Input.dispatchMouseEvent` (pressed + released) **on the page session**,
collects `Page.fileChooserOpened` for 1500 ms across all sessions, answers the first one with
`DOM.setFileInputFiles` **on the session the event arrived on**, then reads the child's `files` and
clicks. Receipt ports: http 18971, child 18972, cdp 18973 (`ports`).

## The measured decision table (every cell is a receipt field)

| observation | arm X — child `localhost` (different site) | arm S — child `127.0.0.1` (same site, other port) | receipt path |
|---|---|---|---|
| attached `iframe` targets on the page session | 1 | 0 | `legs[i].attached[]` (`type`/`targetId`) |
| `iframe` targets in `Target.getTargets` | 1, URL = child URL (`http://localhost:18972/child.html?leg=X-n`), targetId = attached targetId | 0 | `legs[i].browserIframeTargets[]`, `legs[i].iframeTargets[0].url` |
| iframe target's `targetId` **==** child frame id | yes (`09967663…`, `C4953AD3…`, `12663303…`) | — | `legs[i].iframeTargets[0].targetId` == `legs[i].childFrameId` |
| `iframe` target's `parentFrameId` (recorded, not cross-checked against the parent's frame id) | `8A46A594…`, `D3B0F2FD…`, `25975C70…` | — | `legs[i].iframeTargets[0].parentFrameId` |
| `Page.fileChooserOpened` count | 1 | 1 | `legs[i].choosers[]` |
| session the chooser arrived on | the **iframe** session | the **page** session | `legs[i].choosers[0].session` |
| chooser's `frameId` | the child frame id (== iframe targetId) | the child frame id (read from the page session's `Page.getFrameTree` child frame) | `legs[i].choosers[0].frameId` |
| chooser's `mode` / `backendNodeId` | `selectSingle` / 2 | `selectSingle` / 5 | `legs[i].choosers[0]` |
| answer session, and its error | iframe session, `null` | page session, `null` | `legs[i].answer` |
| child input's `files` after the answer | `[["tabi-r92-answer.txt", 22]]` | `[["tabi-r92-answer.txt", 22]]` | `legs[i].childFiles` |
| child `click` records; click point (viewport) | one, `target:"s"`, `isTrusted:true`; `x:230, y:155` | one, `target:"s"`, `isTrusted:true`; `x:230, y:155` | `legs[i].childClicks`, `legs[i].click` |
| leg error / `failures` | `null` / `[]` | `null` / `[]` | `legs[i].error`, `failures` |

Top-level receipt fields: `schema` `tabi-chrome-cdp-iframe-chooser-r92`; `nonce`
`tabi-r92-live-63a66abf7529`; `chromium` `Chromium 155.0.8059.84 Arch Linux`; `crossHost`
`localhost`; `reps` 3; `answer` `{name:"tabi-r92-answer.txt", size:22}`; `generatedAt`
`2026-11-08T23:02:33.400Z`; each leg's `browserVersion` reads `Chrome/155.0.8059.84`. The counter's
93 checks decompose exactly: 8 receipt-level + 1 leg-set check, then per leg 5 common arm/URL checks
and 6 chooser/answer/child checks, plus 4 X-only and 2 S-only target checks — 9 + 3×15 (X) + 3×13
(S) = 93.

## The operational rule for automation authors

1. **Enable interception on every session you might receive a chooser on**: the page session *and*
   each attached `iframe` session (`Page.setInterceptFileChooserDialog {enabled:true}`).
2. **Enumerate the cross-site frames with flatten auto-attach on the page session**:
   `Target.setAutoAttach {autoAttach:true, waitForDebuggerOnStart:false, flatten:true}`. A cross-site
   iframe arrives as an attached target of type `iframe`; a same-site iframe never does (S227: the
   auto-attach covers targets "directly related to this one (for example, iframes or workers)").
3. **Learn the frame's identity from `Target.getTargets`**: the cross-site iframe's `targetId` is the
   child frame id itself, and its URL is the child URL (S230: Playwright's Chromium client treats an
   OOPIF as "already attached in the parent session" and identifies it by `frame.id === targetId`).
   Why `localhost` is cross-site and another port of `127.0.0.1` is not: neither host has a
   registrable domain, so each site is (scheme, host) with the port dropped (S229, the WHATWG
   "obtain a site" fallback), and desktop site-per-process locks each renderer to one site (S228) —
   only the cross-site child becomes its own frame target.
4. **Click on the page session** — `Input.dispatchMouseEvent` at the input's viewport centre — then
   **read which session the `Page.fileChooserOpened` arrived on**; do not assume.
5. **Answer on that same session**: `DOM.setFileInputFiles {files:[<path>], backendNodeId:<the event's
   backendNodeId>}` (S221: the event carries the `backendNodeId` the answer needs; S222: the command
   takes file paths and a node id only). The recorded `backendNodeId` differs by arm (2 in X, 5 in S);
   the receipt does not say whether that difference is a session-scoping effect. Then read the result
   in the child document — `files` reads `[[name, size]]`.

The one-line rule: *the chooser session follows the frame's target model, and the answer must be sent
on the session the chooser arrived on.*

## Limits (copied verbatim from `plans/round-92.md` §Declared limits)

1. One Chromium build (155.0.8059.84, Arch Linux package), `--headless=new` only; headed mode,
   other builds and other OSes are unmeasured.
2. "Different site" is realised only as `localhost` vs `127.0.0.1` (no registrable domain); the
   claim does not measure process ids — the `iframe` target is Chromium's own target model, not a
   pid observation.
3. Auto-attach is the page session's `Target.setAutoAttach {autoAttach:true,
   waitForDebuggerOnStart:false, flatten:true}` only; non-flatten mode and browser-level discovery
   are unmeasured.
4. The chooser is intercepted (`Page.setInterceptFileChooserDialog`) and answered programmatically;
   no dialog UI is observed. "Exactly one" means within the 1500 ms window after the click.
5. Answering on the OTHER session (e.g. the page session in X) is not measured; the claim is where
   the event arrives and that answering on that session works, not that another session fails.
6. The counter in `--receipt` mode reads a file: a forger who writes a whole consistent receipt
   passes that mode. The claim's counting command is `--live`.

## What is NOT measured

- **No process identity and no registrable-domain site pair**: no pid, no process-per-site
  observation; `iframe` target ⇔ site is Chromium's target model, not a measured process layout, and
  the only site pair is `localhost` vs `127.0.0.1` (limit 2).
- **No cross-session answer failure**: answering in X on the page session is untested, so the claim
  says the event arrives on the iframe session and answering *there* works — not that the other
  session fails (limit 5). The battery's `x-answer-on-page` case is a forged-receipt case, not a
  live one.
- **No native dialog**: the chooser is intercepted and answered programmatically; no dialog UI is
  observed (limit 4).
- **No headful, no other build, no other OS** (limit 1); **no non-flatten auto-attach, no
  browser-level discovery** (limit 3); **no receipt-level forgery resistance in `--receipt` mode**
  (limit 6 — the claim's counting command is `--live`).
- **No timing beyond the window**: "exactly one chooser" means one within 1500 ms of the click; a
  second, later chooser is outside the claim (limit 4).
- **One fixture shape**: one iframe, one file input, one parent page; nested frames, multiple
  iframes, sandboxed/cross-origin-restricted frames, and non-file inputs are unmeasured.
- **The 1500 ms window and the "across all sessions" collection are driver behaviour, not
  counter-enforced fields**: the counter binds the chooser array the driver wrote
  (`chooser-count`, `chooser-session`, `chooser-frame`), not the collection interval itself.
- **The counter binds no `backendNodeId`, no chooser `mode` and no click coordinates**: those are
  recorded in the receipt and read here, but `check-iframe-chooser-round92.mjs` inspects only the
  chooser's count, session and `frameId` (plus `answer.session`/`answer.error`).

## Wave probes beyond the claim (round-92 w1; not part of the predicate)

- **Answering on the other session fails (limit 5, probed, still outside the claim).** R92ExecProbe
  (`.ufo/waves/round-92/w1/R92ExecProbe-results.json`, 3 reps, fresh browser each): in arm X,
  `DOM.setFileInputFiles` sent on the PAGE session with the iframe chooser's `backendNodeId` (2)
  returned `Node is not a file input element` and the child's `files` stayed `[]` in 3/3 reps; the
  same call on the iframe session then delivered `[["tabi-r92-answer.txt", 22]]` in 3/3. The error
  text says id 2 resolved on the page session to some node that is not a file input, which is
  consistent with `backendNodeId` being scoped to the reporting session's document tree
  [INFERENCE — the node it resolved to was not read]; in practice rule 5 is a "must" on this build.
- **Stability and the window.** R92Critic2 (`.ufo/waves/round-92/w1/R92Critic2.md`): a 10-rep run
  (20 legs) of the pinned driver scored clean at 289 checks, two further `--live` runs scored clean
  at 93, and a 5000 ms observation window on three X legs saw exactly one chooser per leg, on the
  iframe session, none between 1500 and 5000 ms.


## Correction (round 94; appended, the text above is not rewritten)

The §Wave probes reading "consistent with `backendNodeId` being scoped to the reporting session's
document tree [INFERENCE]" is superseded: Blink resolves a `backendNodeId` in the id map of the
renderer PROCESS that receives the command (r93 S231/S232; r94 S233/S234). The page-session
`Node is not a file input element` came from a collision with the parent renderer's own id 2 (r93),
and with a padded child the same call misses (`No node found for given backend id`, r94
`corpus/knowledge/chromium-oopif-backendnode-collision-round-94.md`).

## Correction — round 95 (append-only; R95Connector)

Lines 127-131 ("Answering on the other session fails … `Node is not a file input element`") hold for the
r92 fixture, whose parent page owns no file input. Round 95 shows the page-session
`DOM.setFileInputFiles(B)` can return **no error** and fill one of the PARENT's own file inputs when the
parent renderer holds a file input at id B (`corpus/knowledge/chromium-oopif-backendnode-misdelivery-round-95.md`,
leg P286-1). Line 105's limit ("answering in X on the page session is untested") is stale: rounds 93, 94
and 95 measured it (error, collision/miss, misdelivery).
