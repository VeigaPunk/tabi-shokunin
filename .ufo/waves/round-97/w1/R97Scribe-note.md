---
source: S237 (Puppeteer `packages/puppeteer-core/src/cdp/ElementHandle.ts` at tag `puppeteer-v25.16.0` — `uploadFile` zero-files branch lines 138-150 assigns `element.files` and dispatches script-built `input`/`change` events; lines 158-162 send `DOM.setFileInputFiles` on the handle's own client; staged `.ufo/waves/round-97/sources/ElementHandle.ts`), S238 (Playwright `packages/playwright-core/src/server/fileUploadUtils.ts` at tag `v1.65.0` — `filesExceedUploadLimit` stats each path (line 32), and the not-collocated branch (line 62) calls it (line 65) and reads the files into buffers; staged `.ufo/waves/round-97/sources/fileUploadUtils.ts`), read with `chromium.ts` v1.65.0 lines 162-163 (`connectOverCDP` sets `_isBrowserCollocatedWithServer = false` unless `isLocal`; staged `.ufo/waves/round-97/sources/chromium.ts`)
verified-at: 2026-11-09 (round 97, Linux host, Chromium 155.0.8059.84 `--headless=new`, puppeteer-core 25.16.0, playwright-core 1.65.0; scored run `.ufo/waves/round-97/scored/c1-live.json`, nonce `tabi-r97-live-152ce8256675`, verdict `clean`, 232 checks, 0 findings, rc 0)
recheck: `node scripts/check-client-oopif-uploadfile-round97.mjs --lane <ABS lane> --expect-driver-sha256 09f0c2fe2895ee0e035e8107995873328ce74f4e4d6d1ab3c8efd455b8c9e4eb --receipt corpus/evidence/round97/client-oopif-uploadfile/receipt.json --expect-nonce tabi-r97-live-152ce8256675 --json` → exit 0, `verdict: clean`, 229 checks (receipt mode on the committed receipt, sha256 `6c948131…6763`; no browser). The claim's counting command is the `--live` form in `plans/round-97.md` §Counting command, which needs an npm install of the two pinned clients (`mkdir -p D && cd D && npm init -y && npm install puppeteer-core@25.16.0 playwright-core@1.65.0`).
---

# Uploading to a file input in a cross-site iframe: the direct-set path fills it in both clients, but the events differ

Capability `client-oopif-uploadfile-linux` (new, first-working round 97). Round 96 measured the chooser path
and found Puppeteer's `waitForFileChooser` times out on a cross-site iframe ([client-oopif-filechooser-round-96.md](client-oopif-filechooser-round-96.md)).
Round 97 measures the path that does not open a chooser: setting the input's files directly.

## The law in one sentence

*Measured (24/24 legs, 3 reps × 8 arms, scored run):* with Puppeteer 25.16.0 attached over CDP,
`(await frame.$('#s')).uploadFile(answer)` on a **cross-site** child frame resolves and leaves `#s` holding
`[["tabi-r97-answer.txt", 22]]`, and `#s`'s listeners see exactly `input` trusted, `change` trusted — the same as
on a **same-site** child; with Playwright 1.65.0 over the default `connectOverCDP`, `frame.locator('#s').setInputFiles(answer)`
also fills `#s` on both sites, but `#s`'s listeners see exactly `input` untrusted, `change` untrusted; with
`connectOverCDP(url, {isLocal: true})` the same call's events are trusted.

## What the scored run shows (receipt `corpus/evidence/round97/client-oopif-uploadfile/receipt.json`)

Fixture: parent `http://127.0.0.1:<http>/parent.html` with one file input `#pp` and one iframe; child
`http://<host>:<child>/child.html` with one file input `#s` and `input`, `change`, `click` listeners that record
`[type, isTrusted]`. Each leg runs in its own `/usr/bin/chromium --headless=new` that the client attaches to (24 distinct browser ids across the 24 legs).

| arm | client | child host | iframe targets | call | `#s` after | `#s` events (exact) |
|---|---|---|---|---|---|---|
| PUX ×3 | Puppeteer | `localhost` (cross) | 1 (child URL) | `uploadFile(answer)` | `[[answer, 22]]` | `input` T, `change` T |
| PUS ×3 | Puppeteer | `127.0.0.1` (same) | 0 | `uploadFile(answer)` | `[[answer, 22]]` | `input` T, `change` T |
| PUC ×3 | Puppeteer | `localhost` (cross) | 1 | `uploadFile(answer)` then `uploadFile()` | `[]` | `input` T, `change` T, `input` U, `change` U |
| PUM ×3 | Puppeteer | `localhost` (cross) | 1 | `uploadFile(<absent path>)` | `[["tabi-r97-missing.txt", 0]]` | `input` T, `change` T |
| PLX ×3 | Playwright, default `connectOverCDP` | `localhost` (cross) | 1 | `setInputFiles(answer)` | `[[answer, 22]]` | `input` U, `change` U |
| PLS ×3 | Playwright, default | `127.0.0.1` (same) | 0 | `setInputFiles(answer)` | `[[answer, 22]]` | `input` U, `change` U |
| PLL ×3 | Playwright, `{isLocal: true}` | `localhost` (cross) | 1 | `setInputFiles(answer)` | `[[answer, 22]]` | `input` T, `change` T |
| PLM ×3 | Playwright, default | `localhost` (cross) | 1 | `setInputFiles(<absent path>)` | `[]` | none; call ends `Error`, `ENOENT: no such file or directory, stat '<driver scratch>/tabi-r97-missing.txt'` |

Every leg: the parent's `#pp` is `[]`; the client lists exactly the frames `[parent, child]`; DevTools reports
`Chrome/155.0.8059.84`; no `click` on `#s`; `failures` is empty. Counts: 9 legs trusted (PUX, PUS, PLL), 6 untrusted
(PLX, PLS), 3 clear-path (PUC), 3 phantom (PUM), 3 ENOENT (PLM). The iframe target list has one entry on each of the
18 cross-site legs and none on the 6 same-site legs.

## Practitioner rules

1. **A direct set does not need a file chooser.** In the measured setup a cross-site iframe's file input is filled
   by Puppeteer `uploadFile(path)` (PUX, 3/3) and by Playwright `setInputFiles(path)` (PLX, 3/3). The r96 chooser
   timeout (`waitForFileChooser`, 3000 ms) was not re-measured here; do not read PUX as a fix for the chooser path
   on other builds.
2. **Check `event.isTrusted` before you trust what a listener saw.** With Playwright's default `connectOverCDP`,
   the input and change events on the element are untrusted (PLX, PLS). With `{isLocal: true}` they are trusted
   (PLL). Puppeteer's set path is trusted (PUX, PUS).
3. **Puppeteer's clear path fires untrusted events.** `uploadFile()` with no files (PUC) empties `#s` (`[]`) and
   dispatches a trusted `input`/`change` pair for the set, then an untrusted pair for the clear. A listener that
   gates on `isTrusted` sees the clear as untrusted.
4. **`isLocal: true` is a claim about where the browser runs.** The source's account (chromium.ts 162-163,
   fileUploadUtils.ts 62) is that without `isLocal` Playwright treats the browser as not collocated with the
   server and sends the file bytes rather than the paths. This round measured only a browser on the same host
   (`localhost`, `127.0.0.1`). A remote browser is unmeasured; do not set `isLocal` for one on the strength of this note.
5. **Puppeteer does not throw for an absent path.** `uploadFile('<absent>')` resolves (PUM, 3/3) and leaves a
   zero-byte `File` named with the path's basename, with trusted events. The counter measures `#s.files` only.
   What a form submission or `FileReader` does with that file is unmeasured.
6. **Playwright throws for an absent path on the non-`isLocal` path.** `setInputFiles('<absent>')` (PLM, 3/3) ends
   `ENOENT ... stat '<path>'`, with `#s` empty and no event. The message matches the `stat` call in
   `filesExceedUploadLimit` (S238 line 32, called at line 65). The `isLocal: true` case with an absent path is unmeasured.

## Why (source account, not what the counter checks)

- Puppeteer's clear path: S237 lines 138-150 set `element.files = new DataTransfer().files` and call
  `element.dispatchEvent(new Event('input'…))` and `…('change')` in script; script-dispatched events are untrusted.
  That is the sources' reading of the U events in PUC. The `uploadFile` comment at staged line 118 says "confirm
  that they exist", but no existence check follows it in the staged bytes (the only `exist`/`stat`/`ENOENT`
  match in that file is that comment); the zero-byte phantom in PUM is consistent with a missing path reaching
  `DOM.setFileInputFiles` unchecked. That is inference from the staged bytes; the counter measures the outcome only.
- Puppeteer's set path: S237 lines 158-162 send `DOM.setFileInputFiles` on the handle's own client, which is the
  source of the trusted events in PUX/PUS/PUC/PUM. (Trust is the sources' account; the counter reads only the flag.)
- Playwright's default path: S238 line 62 treats the browser as not collocated and reads the files into buffers,
  dropping the local paths; that is the sources' account of why PLX/PLS events are untrusted and why PLM's error is
  a `stat` error. The counter checks the outcome, not the code path.

## Changes from round 96

- r96's "ElementHandle.uploadFile fills an OOPIF input 3/3; a seat observation, not a counted law" (rule 1 and the
  wave-observation list) is now counted: PUX 3/3 with trusted events.
- r96's "Playwright 1.65.0 handles the cross-site case through its public API" is still true for the chooser
  (PWX). r97 adds that the same API's default path fills cross-site inputs with untrusted events.
- r96's limit "uploadFile is outside the counted claim" holds for r96 only. Round 97 counts `uploadFile` on
  `connect` (Puppeteer) with one file, not on `launch`.

## Limits (`plans/round-97.md` §Declared limits 1-7)

One Chromium build (155.0.8059.84, `--headless=new`); headed mode, other builds and OSes are unmeasured.
Two client versions, each attached to a running browser (`connect` / `connectOverCDP`, Playwright with and without
`isLocal`); `launch`, Playwright's `connect` (browser server) and remote hosts are unmeasured; transitive
dependencies are not hashed. "Different site" is `localhost` vs `127.0.0.1` only. "Trusted" means the flag seen by
listeners on `#s` itself. One file, input without `multiple` or `webkitdirectory`; Playwright payload objects,
multiple files, directories, the 50 MB limit and `ElementHandle.setInputFiles` / `FileChooser` are unmeasured.
The mechanism is the sources' account; the counter checks behaviour. `--receipt` mode is forgeable; the claim's
count is `--live`.

## Sources

- S237: Puppeteer `packages/puppeteer-core/src/cdp/ElementHandle.ts`, tag `puppeteer-v25.16.0`; lines 138-150, 158-162.
  Staged: `.ufo/waves/round-97/sources/ElementHandle.ts`.
- S238: Playwright `packages/playwright-core/src/server/fileUploadUtils.ts`, tag `v1.65.0`; lines 31-32, 62-65.
  Staged: `.ufo/waves/round-97/sources/fileUploadUtils.ts`.
- `packages/playwright-core/src/server/chromium/chromium.ts` v1.65.0, lines 162-163. Staged: `.ufo/waves/round-97/sources/chromium.ts`.
- Pinned library identity (receipt): puppeteer-core 25.16.0 `lib/puppeteer/cdp/ElementHandle.js`, sha256 `162b7199…9b7c96`;
  playwright-core 1.65.0 `lib/coreBundle.js`, sha256 `4ef83305…63f7f1` (the same bundle r96 cites).

## Pointers

- Plan and claim: `plans/round-97.md` §Claim (predicate `C1-CLIENT-OOPIF-UPLOADFILE-R97`), §Controls, §Declared limits.
- Scored run: `.ufo/waves/round-97/scored/c1-live.json` (rc 0, `findings: []`, outcomes as above).
- Committed receipt: `corpus/evidence/round97/client-oopif-uploadfile/receipt.json` (sha256 `6c948131…6763`).
- Controls: `.ufo/waves/round-97/controls/rc.txt`.
- Pre-freeze probes: `.ufo/waves/round-97/probes/probe0.out`, `probe1.out` (not counted).
