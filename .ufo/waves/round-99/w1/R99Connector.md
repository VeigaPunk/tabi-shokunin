# R99Connector — C1 overlap and contradiction scan (round 99, w1)

Read-only. Sources: own-lane `corpus/knowledge/*.md`, `corpus/README.md`, `plans/round-99.md`; sibling
lanes' `corpus/knowledge/`; the frozen counter and committed artifacts. No browser, no instrument run,
no installs, no lane edits outside this file. The r99 knowledge note is tracked and post-freeze
(commit `75a8a6f7`).

## Hits

### H1 — the frozen plan's universal negative is false (contradict; correction owed)
`plans/round-99.md:23-26`: "No lane instrument has ever put two files into one input, called
`setInputFiles` with an untyped payload, or read an upload with `arrayBuffer()`/`FileReader`
(`git grep … -- 'scripts/client-oopif-*round9[5-8].mjs'`: no hit; …)".
Two of the three conjuncts are contradicted by committed lane artifacts:
- `corpus/knowledge/chromium-file-chooser-runtime-round-77.md:67`: "| pick-multiple | click the
  `multiple` input, `[a.txt, b.bin]` | selectMultiple, node 7 | both files, b.bin typed
  `application/octet-stream`, both reads exact |".
- `.ufo/waves/round-77/controls/c1/smoke1.receipt.json` `legs[3]`: `setParams.files` = both absolute
  paths; `stateAfter.m` = `[["tabi-a.txt",11,"text/plain"],["tabi-b.bin",5,"application/octet-stream"]]`;
  `events[13]`/`[14]` trusted `input`/`change` with both files.
- `scripts/chrome-cdp-filechooser-round77.mjs:182` `ret = 'hex:' + hex(await f.arrayBuffer());`
  (same at `scripts/chrome-cdp-filechooser-round78.mjs:185`; r78 repeats the leg at `:221`). A lane
  instrument read an upload with `arrayBuffer()` before r99. Further: r81's directory answer delivers
  two files into one input (`chromium-showpicker-runtime-round-81.md:34-37`).
The supporting grep is scoped to `scripts/client-oopif-*round9[5-8].mjs` and cannot see the r77/r78
chooser instruments. What is new in r99 is the client-library surface (refusal, payload trust, untyped
name→type, dual reads with a digest), not the first two-file landing or first `arrayBuffer()` read.
Correction owed: yes (append-only prose; the plan is frozen — move below).

### H2 — r77's "first path" practice bullet is narrower than it reads (correction owed)
`corpus/knowledge/chromium-file-chooser-runtime-round-77.md:100`: "A single input silently keeps only
the first path". True for the raw path it measured — `legs[5]` pick-first-only (files `[b.bin, a.txt]`)
→ `stateAfter.s` = `[["tabi-b.bin",5,"application/octet-stream"]]`. False for the client APIs C1
measures: PLBN errors `locator.setInputFiles: Error: Non-multiple file input can only accept single
file`, PUCN errors `Multiple file uploads only work with <input type=file multiple>`; both inputs `[]`,
no event (counter `:87`,`:90`). Correction owed: yes — scope the bullet to
`DOM.setFileInputFiles`/chooser-answer; the r99 note's "Do not rely on 'the first file wins'"
(`client-oopif-uploadsets-round-99.md:45`) is the client-side counterpart.

### H3 — r98 "payloads land as given" is typed-payload-scoped (agree; no correction)
`client-oopif-uploadmodes-round-98.md:51`: "Payload objects land as given: name, the passed `mimeType`
as `File.type`, the exact bytes." Its limits (`:90-91`: "one file per call, no `multiple`, UTF-8 text
buffers and `text/plain` only"; plan r98 limit 4: "other MIME types are unmeasured") declare untyped
payloads out of scope. C1 PLBX (no `mimeType`, `.png` → `image/png`) and PLBM p2 (`.tabi99` →
`application/octet-stream`) extend it; nothing measured is falsified. The r99 note already states the
fallback chain (`:49-52`, S238:80/S246/S247).

### H4 — README r98 phantom read names only `Blob.text()` (narrower; no correction)
`corpus/README.md:1311-1312`: "phantom (`size 0`, `text/plain`) rejects `Blob.text()` with
`NotFoundError` and Blink's message." C1 PUAM gets the same class/message from `arrayBuffer()` and
`FileReader.readAsArrayBuffer`, on a client-launched browser; r77 already recorded `arrayBuffer()`
rejecting `NotFoundError` (r77 note `:70`). r98 limit 3 declares the other reads unmeasured; the r99
coverage row (`README.md:1332-1345`) names the wider set. No statement contradicted.

### H5 — the r99 note's relation block is incomplete (correction owed)
`client-oopif-uploadsets-round-99.md:89-91`: "Extends … round-98 … and … round-97 …; contradicts
neither." True for r97/r98 as worded, but it omits the r77/r78 precedent (H1) and does not scope its
own first-file bullet against the raw path (H2). The headline (`:7`) and README (`:1336-1339`) refusal
law is measured on the connect arms only (PLBN default `connectOverCDP`, PUCN `connect`); the note's
Limits carry launch-vs-connect as a driver-pin fact, so this is calibration, not a false law.
Correction owed: yes — one §Relation append carrying H1 + H2 + "(on the measured connect arms)".

### Cleared (checked, no contradiction)
- r97 producer table `client-oopif-uploadfile-round-97.md:94` and point 4 `:46`: agree — PUAM
  (`launch`, phantom, trusted) and PUCM/PUCN extend the r97 path arms; r97 limit 5 scopes one per call.
- r96 wave observation `client-oopif-filechooser-round-96.md:65` (`uploadFile` fills an OOPIF input;
  Playwright `chromium.launch` also fills): agree.
- r92 limit `chromium-crosssite-iframe-chooser-round-92.md:116` ("one iframe, one file input, one
  parent page"): r99 keeps one iframe/one parent input, child gains `#m`; r92's limit names multiple
  iframes, not multiple inputs. Extension, not contradiction.
- r98 practitioner 1/2 trust rule, the r97 note's round-98 correction, README r97 correction block
  `:1317-1330`: agree (PLLP path trusted; PLBX/PLBM payload untrusted).

## Sibling lanes (read-only)
- No sibling Puppeteer/Playwright upload note: `grep -rln -i 'puppeteer|playwright-core'` over
  `/home/vgpnk/Projects/shokunin/*/corpus/knowledge/` (excluding tabi) → empty (rc 1, no match).
- `mado-shokunin/corpus/knowledge/mime-magic-sniff-r95.md:25` "Data is the second step, not the first.
  The name lookup runs first …" — adjacent (name-before-bytes), different resolver and object: GLib
  2.90.1 `g_content_type_guess` vs Playwright's Node-side `mime` 4.1.0 (S238:80, S246, S247) producing
  `File.type`. Do not cite mado for a `File.type` statement; no correction owed.
- `mado-shokunin/corpus/knowledge/xdg-mime-default-resolution-r92.md:23` scopes itself to output
  resolution ("Out of scope: … MIME sniffing"); no overlap.
- Remaining sibling "file input" hits are false positives in non-upload senses: kagi
  `openbao-audit-device-custody.md:43` (`sys/audit-hash/file input=<nonce>`), kumitate
  `ops-watchers.md:285` ("Handoff-file input shape"), kaidoku `2026-10-13-r2-asar-deep-obsidian.md:60`
  ("12 MB JSON file input").

## Verdict basis (C1)
- Instrument vs predicate: `scripts/check-client-oopif-uploadsets-round99.mjs:83-90` restates each
  arm's `files`/`events`/`reads`; `:260-261` requires the exact `ENOENT: no such file or directory,
  stat '<missingPath>'`; `:266` compares every events list exactly; `:211-214` bind
  `driver-exit`/`ports-bound`/`missing-bound`/`tmpdir-bound`; `:92` exempts only
  `driver-exit`/`failures` under limit 8. In the parts read, no check is narrower than the frozen
  sentence (a full counter audit is the critics' lane, not this seat's).
- Scored run `.ufo/waves/round-99/scored/c1-live.json`: `verdict: "clean"`, `checkCount: 282`,
  `launchFailed: []`, `driverRun.status: 0`, outcomes `trustedMulti` 6 / `untrustedPayload` 6 /
  `refusedMultiple` 6 / `enoent` 3 / `phantomUnreadable` 3. Receipt
  `corpus/evidence/round99/client-oopif-uploadsets/receipt.json` sha256 `ed4b21299a42…b845e3`,
  `driverSha256` = pin `98efdc12…b89f8`, 24 legs with no `error`, `failures: []`, `tmpdirAtLoad`
  basename `t`, `missingExists: false`, ports 32901/32902/32903.
- This seat ran no `--live` and started no browser; no run ended `setup`. H1 is claim prose (§Claim
  "Surface moved"), not an instrument-vs-predicate gap and not a leg-level statement, so it does not
  meet the stated falsifies-wording rule; nothing re-derived differs (24 legs, 282 checks). Neutral.

## Proposed move (one, bounded; no instrument/claim/control change)
Append one block to `corpus/knowledge/client-oopif-uploadsets-round-99.md` §Relation:
```
## Correction — round 99 (append-only; R99Connector A1/A2)
1. The plan's "no lane instrument has ever put two files into one input ... or read an upload with
   arrayBuffer()" (plans/round-99.md:23-26) is false for the raw-CDP chooser instruments: r77
   pick-multiple put [a.txt, b.bin] into #m (trusted input/change; b.bin application/octet-stream;
   scripts/chrome-cdp-filechooser-round77.mjs:182 arrayBuffer read; receipt legs[3]); r78 repeats it
   (:221, :185); r81's directory answer delivers two files. Read r99's novelty as the client-library
   surface (refusal, payload trust, name→type, dual reads + digest).
2. r77's "A single input silently keeps only the first path" (:100) is the raw DOM.setFileInputFiles
   path; Playwright/Puppeteer refuse the second file client-side (r99 PLBN/PUCN) and set nothing.
   The r99 "do not rely on the first file wins" bullet (:45) applies to the client APIs only.
```
Placement alternative: per the r98 precedent, L1 may append (2) to the r77 note as a "Correction —
round 99" block and keep (1) in the r99 note; either is one prose append, no scored artifact bytes.
Axes: calibration (false universal negative; unscoped bullet) and adjacency (r77↔r99 same input,
different producer; first-path-wins inversion). Coverage axis untouched.
Risks: the r99 note is an admitted record, so the append rewrites its bytes; the lane's precedent is
append-only corrections (r97/r98 blocks). Do not phrase r77/r78 as client-library evidence — they are
raw-CDP chooser instruments; `DOM.setFileInputFiles` is the protocol call, not the client API.
Verification: the counting command in `--receipt` mode (same receipt/nonce/driver pin) → exit 0
unchanged; re-read r77 receipt `legs[3]`/`legs[5]` and script `:182`/`:185` after the append; the
note-registry docs gate is unaffected (path unchanged).

## Commands run (read-only)
`grep`/`sed`/`read` over the paths above; `python3` JSON reads of `claims.json`, the scored JSON, the
r99 and r77 receipts (rc 0); `git ls-files --error-unmatch` on the three r77 artifacts (rc 0);
`git log/show` on `27685238`/`75a8a6f7` (rc 0); sibling `grep -rln` → empty (rc 1, no match); scratch
root `/fast/scratch/hyaku/tabi-r99/R99Connector` created and removed, no files (`ls -d` after removal
→ rc 2, absent); no browser, no port, no chromium process started.

VERDICT C1: neutral
