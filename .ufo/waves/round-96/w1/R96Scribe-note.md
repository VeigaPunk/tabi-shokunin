---
source: S236 (Puppeteer `packages/puppeteer-core/src/cdp/Page.ts` at tag `puppeteer-v25.16.0`, staged `.ufo/waves/round-96/sources/Page.ts`, sha256 `e7f2f6b8ea8b…`: lines 338-362 `#setupPrimaryTargetListeners` (the listener emitter is built on `#primaryTargetClient` at line 339; `Page.fileChooserOpened` is bound on it at line 361), lines 470-495 `#onFileChooser`, lines 538-578 `waitForFileChooser` (`Page.setInterceptFileChooserDialog` is sent on `#primaryTargetClient` at lines 560-567)), read with S230 (Playwright `crPage.ts` v1.65.0, registry row cites lines 636-637 only: an out-of-process iframe is attached from the parent session and its frame id equals its target id; the per-frame chooser-listener account is NOT in any staged round-96 artifact, see Limits), S213 and S215 (client-side API pages), S221 and S222 (CDP Page and DOM domains at tag 155.0.8059.84), and the round-92 and round-95 notes
verified-at: 2026-11-08 (round 96, Linux host, Chromium 155.0.8059.84 `--headless=new`; scored run `.ufo/waves/round-96/scored/c1-live.json`, nonce `tabi-r96-live-c1225d318ea6`, verdict `clean`, 165 checks, 0 findings)
recheck: `node scripts/check-client-oopif-chooser-round96.mjs --lane <ABS lane> --expect-driver-sha256 4020e57ef865e5eed506796238bb981bb4dbcb226e8fe80eb52728585ce63b91 --receipt corpus/evidence/round96/client-oopif-filechooser/receipt.json --expect-nonce tabi-r96-live-c1225d318ea6 --json` → exit 0, `verdict: clean`, 163 checks (receipt mode, re-run in round 96 by the scribe seat; the two live-only checks `driver-exit` and `ports-bound` make the scored `--live` count 165). The claim's counting command is the `--live` form in `plans/round-96.md` §Counting command.
---

# Puppeteer's `waitForFileChooser` misses a cross-site iframe's chooser; Playwright's `filechooser` event does not

Capability `client-oopif-filechooser-linux` (new, first-working round 96). Rounds 92-95 measured what
Chromium does with a cross-site iframe's file chooser over raw CDP. Round 96 measures what two production
CDP client libraries do with the same page. A practitioner uploading files into an iframe through one of
these libraries needs the second measurement, not the first.

## The law in one sentence

*Measured (15/15 legs, 3 reps × PPX, PPW, PPS, PWX, PWS; Chromium 155.0.8059.84 `--headless=new`, Linux;
puppeteer-core 25.16.0 and playwright-core 1.65.0, each attached to an already-running browser):* with a
parent page holding file input `#pp` and one iframe whose child holds file input `#s`, Puppeteer's
`page.waitForFileChooser({timeout: 3000})` ends in `TimeoutError` ("Waiting for `FileChooser` failed:
3000ms exceeded") and the child's `#s` stays empty in all 6 legs where the child is cross-site
(`localhost`, against the parent's `127.0.0.1`); in the 3 of those legs where a second raw CDP connection
attached to the iframe target and enabled interception there, that connection saw exactly one
`Page.fileChooserOpened`. On a same-site child (`127.0.0.1`) the same Puppeteer call resolves, and its
answer fills `#s` with the answer file in 3/3. Playwright's `page.waitForEvent('filechooser', {timeout:
3000})` resolves for the cross-site and the same-site child alike (6/6 across PWX and PWS), and
`setFiles` fills the child's `#s` with the answer file in each.

## What the scored run shows (receipt `corpus/evidence/round96/client-oopif-filechooser/receipt.json`)

Fixture: parent `http://127.0.0.1:<http>/parent.html` with `#pp`; iframe to `http://<childHost>:<child>/child.html`
with `#s`; a trusted click on `#s`; answer file `tabi-r96-answer.txt` (22 bytes). Fresh browser and profile per leg.

| arm | library | child host (site) | wait outcome | child `#s` after | parent `#pp` after | browser-level iframe targets | witness (raw CDP on the iframe target) |
|---|---|---|---|---|---|---|---|
| PPX-1..3 | Puppeteer | `localhost` (cross) | `TimeoutError`, `Waiting for \`FileChooser\` failed: 3000ms exceeded` | `[]` | `[]` | 1, url = child | none |
| PPW-1..3 | Puppeteer | `localhost` (cross) | same as PPX | `[]` | `[]` | 1, url = child | one `fileChooserOpened` per leg: mode `selectSingle`, `backendNodeId` 2, `frameId` = iframe target id |
| PPS-1..3 | Puppeteer | `127.0.0.1` (same site) | resolves, `isMultiple()` false | `[["tabi-r96-answer.txt",22]]` | `[]` | 0 | none |
| PWX-1..3 | Playwright | `localhost` (cross) | resolves, `isMultiple()` false, `element()` id `s` | `[["tabi-r96-answer.txt",22]]` | `[]` | 1, url = child | none |
| PWS-1..3 | Playwright | `127.0.0.1` (same site) | resolves, `isMultiple()` false, `element()` id `s` | `[["tabi-r96-answer.txt",22]]` | `[]` | 0 | none |

Every leg: DevTools `/json/version` Browser `Chrome/155.0.8059.84`; client browser string `Chrome/155.0.8059.84`
(Puppeteer) or `155.0.8059.84` (Playwright); client frame list exactly `[parent URL, child URL]`; exactly one
recorded click, `[["s", true]]` (trusted); 15 distinct browser ids.

Witness values (PPW legs): `backendNodeId` = 2 in PPW-1, PPW-2 and PPW-3 (the pre-freeze probe `probe0.out` also
saw 2). The intercept target id equals the iframe target id in each leg: `F06343F6FBFE8B95AE611D5A1EC257E5`,
`B97D11131B9C6D9CA6948C8CA2D798D7`, `0B2EE83DE89E2245D66D0A56C21FB0B2`. Exactly one event per PPW leg.

Scored run: `.ufo/waves/round-96/scored/c1-live.json`: verdict `clean`, 165 checks, `findings: []`, driver exit 0,
15 legs, outcomes 6 timeouts (PPX, PPW) and 9 choosers (PPS, PWX, PWS). Receipt sha256 `aad4611df158…5fb635d`;
the corpus copy is byte-identical to `.ufo/waves/round-96/scored/live-receipt.json`.

Pinned libraries (receipt `libs`, counter `LIBS`): `puppeteer-core` 25.16.0, integrity `sha512-VA5Pf54N…IJw==`,
`lib/puppeteer/cdp/Page.js` sha256 `31a522df…07e7a0`; `playwright-core` 1.65.0, integrity `sha512-vNSKgH6Y…+lA==`,
`lib/coreBundle.js` sha256 `4ef83305…63f7f1`.

## Why (the source's account; the mechanism itself is not measured)

- Puppeteer 25.16.0 builds its file-chooser listener on the page's primary target session only:
  `#setupPrimaryTargetListeners` creates the emitter on `#primaryTargetClient` (S236 line 339) and binds
  `Page.fileChooserOpened` on it (line 361).
- `waitForFileChooser` enables `Page.setInterceptFileChooserDialog` on that same primary client (lines 560-567).
- `#onFileChooser` (lines 470-495) resolves the frame from `event.frameId`, but it only receives events that the
  primary client delivers to it.
- Reading the receipt against that source: a chooser that Chromium reports on the iframe's own session would not
  reach the Puppeteer listener, and the wait would time out. [INFERENCE: the PPX legs do not observe the iframe
  session, so this is consistent with the receipt, not shown by it.] The witness legs show that Chromium does report
  one chooser on the iframe session when interception is enabled there.
- Playwright: the round's claim cites S230 for a per-frame-session listener. The staged evidence does not contain
  that account. S230's registry row records only `_handleFrameTree` (lines 636-637). The round measured Playwright's
  behaviour; it did not source Playwright's mechanism.

## Practical rules for a practitioner automating uploads (what is measured, and what is not)

1. Puppeteer `page.waitForFileChooser()` did not return a chooser for an `<input type=file>` inside a cross-site iframe
   in any of 6 legs on this Chromium build (3 reps, 3000 ms). The failure is silent: a `TimeoutError` and an unchanged
   input. Check the target input's `files` after each upload; a timeout is not proof that nothing was attempted.
2. Puppeteer `page.waitForFileChooser()` did return a chooser, and its `accept` filled the input, for a same-site
   iframe (`127.0.0.1` child under a `127.0.0.1` parent, another port) in 3/3 legs.
3. Playwright `page.waitForEvent('filechooser')` plus `chooser.setFiles()` filled a cross-site (`localhost`) child's
   `#s` in 3/3 legs, and a same-site child's in 3/3 legs. In both libraries the wait was armed before the click that
   opened the chooser (S215 states the same arming rule for the API).
4. UNMEASURED in this round: Puppeteer `ElementHandle.uploadFile` for an out-of-process input. S213 describes
   `uploadFile` as needing no chooser, but its pinned tag is Chromium 156.0.8078.47, not this lane's 155.0.8059.84, and
   this round did not run it. Do not infer from this note that `uploadFile` works (or fails) for a cross-site iframe.
   Also unmeasured: a longer Puppeteer wait, a later chooser event, Puppeteer's frame-level APIs, headed mode, and
   `puppeteer.launch` / `chromium.launch`.
5. Raw CDP answers: round 95 (`chromium-oopif-backendnode-misdelivery-round-95.md`) measured that an out-of-process
   chooser's `backendNodeId` must be answered on the session that reported it. Round 96 did not answer over raw CDP;
   the witness only enabled interception and read the event.
6. Do not generalise "cross-site" beyond `localhost` against `127.0.0.1`. The round never measured other site pairs.

## Declared limits (`plans/round-96.md` §Declared limits 1-6, in substance)

1. One Chromium build (155.0.8059.84, Arch Linux `/usr/bin/chromium`, the host's `chromium-flags.conf`), `--headless=new`
   only. Headed mode, other builds and other OSes are unmeasured.
2. Two client versions only (puppeteer-core 25.16.0, playwright-core 1.65.0), each attached to an already-running
   browser (`connect` / `connectOverCDP`). Their own launch paths are unmeasured. The lockfile integrity and one file's
   sha256 per package are pinned; the rest of the installed tree is trusted as npm extracted it.
3. "Different site" means only `localhost` against `127.0.0.1`.
4. The Puppeteer cross-site outcome is "the wait times out at 3000 ms". A longer wait, a later chooser event,
   `ElementHandle.uploadFile` and Puppeteer's frame-level APIs are not measured. The witness proves a chooser opened in the
   iframe only on PPW legs, where a second connection enabled interception on the iframe session. On PPX legs nothing
   enables interception there, so the round states the timeout and the empty child, and does not state whether a
   chooser opened there.
5. The mechanism (primary-session listener and interception, S236) is the source's account; the counter checks behaviour,
   not which code path produced it.
6. `--receipt` mode reads a file that a forger can write; the claim's counting command is `--live`, and the host's same-UID
   process space is trusted. `--reps` other than 3 measures other legs. The claim is the default.

## Evidence pointers

- `.ufo/waves/round-96/scored/c1-live.json` (verdict, 165 checks, `findings: []`); `.ufo/waves/round-96/scored/c1-live.rc`
  (0); `.ufo/waves/round-96/scored/live-receipt.json` (sha256 `aad4611d…`, identical to the corpus copy).
- `corpus/evidence/round96/client-oopif-filechooser/receipt.json`: the 15 legs, `libs`, `answer`, `ports`.
- `.ufo/waves/round-96/controls/rc.txt` and the `counter-*.json` / `battery.json` beside it (pre-freeze controls: base
  no-work rc 128; r95 receipt rc 1; positive rc 0; forgery battery rc 0; wrong site rc 1; wrong library rc 1; six setup
  refusals rc 2; no chromium left over).
- `.ufo/waves/round-96/probes/probe0.out` and `probe-a.json` (pre-freeze observations; the same PPX/PPW timeout and PPW witness).
- `.ufo/waves/round-96/sources/Page.ts` (S236, sha256 `e7f2f6b8ea8b…`).

## Sources

S236 (Puppeteer `Page.ts`, tag `puppeteer-v25.16.0`), S230 (Playwright `crPage.ts`, v1.65.0; frame-tree rows only, see
Why), S213 (Puppeteer `ElementHandle.uploadFile`, tag pins Chromium 156), S215 (Puppeteer `waitForFileChooser` API page),
S221 (CDP `Page.fileChooserOpened`, `setInterceptFileChooserDialog`), S222 (CDP `DOM.setFileInputFiles`), S227-S229
(round 92: auto-attach, site-per-process, site definition), S231-S235 (round 95: backendNodeId minting and the file
input shadow tree).
