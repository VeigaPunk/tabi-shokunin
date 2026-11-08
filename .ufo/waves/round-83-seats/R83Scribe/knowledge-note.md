source: S219 (WHATWG HTML `showPicker()` steps), S220 (Chromium 155.0.8059.84 `html_input_element.cc`), S221 (CDP `Page.pdl`), S222 (CDP `DOM.pdl`), S223 (WHATWG `accept` attribute), S224 (WHATWG `multiple` attribute), S225 (Chromium `file_input_type.cc`), S226 (Chromium `file_chooser.mojom`), S227 (Chromium `inspector_dom_agent.cc` AssertNode), S228 (Chromium `dom_node_ids.h`/`.cc`); receipt `corpus/evidence/round83/chromium-showpicker/receipt.json` (the final-nonce run, sha256 `7b465a0bcf6d0187fa0d4e3aa1298b93e7f7bef19c9edc4a5348317375afc05f`; the earlier first-freeze run is `3f9bbb60651d6f10a589561cd9638c4b5107517d770abf815c0991dd95a2bc9c` and carries the same law surface); driver `scripts/chrome-cdp-showpicker-round83.mjs`, pin in `.ufo/waves/round-83/freeze.txt`)
verified-at: 2026-11-08 (round 83, Linux host, Chromium 155.0.8059.84 `--headless=new`, node v24.21.0)
recheck: `node scripts/check-showpicker-r83.mjs --lane <ABS lane> --receipt corpus/evidence/round83/chromium-showpicker/receipt.json --expect-driver-sha256 70b522cc896f4a9b89320d58313b56519499566256cb0b7dd0b3a8aac1944fce --expect-nonce <the receipt's own run nonce> --expect-fixture-sha256 <the receipt's own fixture sha256> --prior-set .ufo/waves/round-83/controls/c1/prior-set.txt --json` → exit 0, 74 checks

# Programmatic picker generation r83 — number/range under the SecurityError, the multiple mode, the accept tokens, and the byte-attributed second chooser

Generation r83 of the held capability `chromium-showpicker-linux` (SCORECARD). Fifteen legs, one fresh
browser per leg; the page fixture is the round-82 template plus cross-origin `type=number` (`#nu`) and
`type=range` (`#rg`) inputs with buttons `#go9`/`#go10`, plus three inputs the r82 fixture already
declared but no leg targeted (`#multiple`, `#accept` with `accept="image/png"`, `#secondtag`). Every law
below names the receipt field path that carries it.

Two scored runs exist for this generation and they agree on every law: the first-freeze run (nonce
minted at `4cdf4def`, receipt sha256 `3f9bbb60…`) and the final-nonce run at the same driver pin
(receipt sha256 `7b465a0b…`). Values below are from the final-nonce run; where a per-run number differs
between the two, the first-freeze value is given in parentheses. Run-specific values — ports, fixture
sha256, `backendNodeId` assignment, nonce — are not law and must never be quoted as constants.

## The measured laws

1. **Cross-origin `type=number` and `type=range` inputs throw the SecurityError, and no chooser opens.**
   `legs[10].childResult` and `legs[11].childResult` are `{ok:false, name:'SecurityError',
   message:"Failed to execute 'showPicker' on 'HTMLInputElement': showPicker() called from cross-origin
   iframe."}` — the same message as `type=date` (`legs[0]`) and `type=month`/`week`/`time`
   (`legs[3..5]`). `legs[10].cdpEventLog` and `legs[11].cdpEventLog` carry one `Page.frameNavigated`
   and **zero** `Page.fileChooserOpened`; `legs[10..11].parentCrossAccess` is
   `{contentDocument:null, windowDocument:'SecurityError'}`; each child records exactly five trusted
   events on its own button (`pointerdown@go9`, `mousedown@go9`, `pointerup@go9`, `mouseup@go9`,
   `click@go9`; `go10` for range) and `legs[10..11].childLate = 0`; the frozen child state is
   `nuValue:''`, `rgValue:'50'`. The spec's exemption set is {File Upload, Color} (S219), so neither
   type is exempt and the runtime matches the source. Counter: `sp83-cross-origin-number-law`,
   `sp83-cross-origin-range-law`, `intercept-law`, `leg-sp83-cross-origin-number`,
   `leg-sp83-cross-origin-range`.

2. **A `multiple` file input answered through `DOM.setFileInputFiles` opens `selectMultiple` and the
   answer lands.** `legs[12].cdpEventLog` holds `Page.fileChooserOpened` with
   `params.mode = 'selectMultiple'` and one positive `params.backendNodeId` (13 here; 12 in the
   first-freeze run); `legs[12].answer.setParams` names one path and that same id, `setResult = {}`,
   `setError = null`; `legs[12].stateAfter.m` is `[["tabi-r83-a.txt",22,"text/plain",""]]` and its
   single `read` event's `ret` is `hex:746162692d7238332d616e737765722d616c7068610a` (the 22-byte
   `tabi-r83-answer-alpha` payload). `mode-law` derives the expected mode from the frozen
   `fixtureInputs`: `m` has `multiple:true`, every other targeted input does not, and no leg before r83
   targeted it — the `selectMultiple` branch of `mode-law` is exercised for the first time here.
   Counter: `multiple-mode-law`, `mode-law`, `leg-sp83-multiple-mode`.
   *Bound, and not bound:* the law checks the answer's file list, the upload record, the state and the
   **count** of `read` events — not the `read` `ret`. A receipt whose `multiple-mode` read carries
   `ret:'hex:00'` still scores clean 74/74 (measured); the sibling answer laws pin their `ret` and fail
   the same forgery. The multi-file retention branch that S225 guards (`SetFilesFromPaths` keeps every
   path only when `multiple` is set) is also unexercised: this leg answers with exactly one path.

3. **A PNG file answered into an `accept=".png"` input is accepted and its bytes are delivered.**
   `legs[13].cdpEventLog` holds one `Page.fileChooserOpened` with `mode = 'selectSingle'`;
   `legs[13].answer` delivers `tabi-r83-b.png`; `legs[13].uploadPng` is
   `{name:'tabi-r83-b.png', size:21, sha256:'575d88a4154ed4f5cc7e9d1f6fe9a508c31f08c934a6c99f0b8596920e947050',
   hex:'89504e470d0a1a0a746162692d7238332d706e670a'}`; `legs[13].stateAfter.k` is
   `[["tabi-r83-b.png",21,"image/png",""]]`; the single `read` event's `ret` is `hex:` + that hex.
   Together with the r82 `.txt`-into-`accept=".png"` law (`legs[8]`, still carried: `stateAfter.k` is
   `[["tabi-r83-a.txt",22,"text/plain",""]]`), the answer path is unfiltered in both directions — a
   conforming name and a non-conforming one are both accepted, which is what S223's "hint" wording
   predicts. Counter: `accept-mime-answer-law`, `accept-answer-law`.
   *Naming, measured:* this leg's input is `#k`, whose attribute is `accept=".png"` — an **extension**
   token. The fixture's `accept="image/png"` input (`#accept`) is targeted by no leg, so the "MIME"
   in the leg's name is the delivered file's media type (`image/png`), not a MIME token inside
   `accept`. The MIME-token and `image/*` branches of the grammar stay unmeasured.

4. **The SECOND chooser is answerable, and the attribution is its bytes, not its id.**
   `legs[14].clickWhileOpenChoosersBefore = 1`, `legs[14].clickWhileOpenChoosersAfter = 2`,
   `legs[14].cdpEventLog` holds two `Page.fileChooserOpened` events whose `params.backendNodeId` are
   equal (`13`/`13` here, `12`/`12` in the first-freeze run; `firstChooserBackendNodeId ===
   secondChooserBackendNodeId`), and the answer's `setParams.backendNodeId` is that same second-event
   id. The delivered file is `tabi-r83-second.txt` (28 bytes, sha256
   `6c386abf519b1814e48779ec7d338af2728726bae85fd4a5eee867011129f26b`): `legs[14].stateAfter.s` is
   `[["tabi-r83-second.txt",28,"text/plain",""]]`, `legs[14].stateAfter.sValue` is
   `C:\fakepath\tabi-r83-second.txt`, the single `read` `ret` is that file's hex, and
   `stateAfterDismiss` equals `stateAfter` (the post-hoc `{cancel:true}` did not retract the answer).
   Counter: `second-chooser-answer-law`, `click-while-open-law`, `plan-calls` (the answer must address
   the **last** chooser event), `leg-sp83-second-chooser-answer`.
   *Limit, measured:* relabelling the id consistently at all four sites (both chooser events, the
   answer's `setParams`, and the `DOM.setFileInputFiles` entry of `cdpSendLog`) to `999` still scores
   clean 74/74 — the shared-id ambiguity is inside the frozen limit ("backendNodeId relabel inside
   limit by design"), and the byte attribution proves which bytes landed, never which chooser consumed
   them. An **inconsistent** relabel (answer and events only, send log untouched) fails `plan-calls`,
   which is what binds the id to the recorded call.

5. **The carried laws are eight named checks, not seven.** The claims and the round's prose call the
   carried set "the r82 seven laws"; the counter carries eight law checks, and the receipt holds each of
   them: `gesture-law` (`legs[7..9].showPicker = {ok:true, ret:'undefined'}`, no gesture flag),
   `activation-law` (per-leg frozen transitions, e.g. `legs[0]` `{isActive:false,hasBeenActive:false}` →
   `{isActive:true,hasBeenActive:true}`, `legs[2]` colour `{false,false}` → `{false,true}`),
   `mode-law`, `cross-origin-nonfile-law` (`legs[0]`), `order-law` (cross-origin disabled date
   `SecurityError` at `legs[1]` versus same-origin disabled date `InvalidStateError` at `legs[6]`),
   `webkitdirectory-answer-law` (`legs[7].stateAfter.d` carries `webkitRelativePath`
   `tabi-r83-dir/inner-a.txt` and `…/inner-b.png`), `accept-answer-law` (`legs[8]`),
   `click-while-open-law` (`legs[9]`: `1 → 2` choosers, both one id — `12` here, `13` in the
   first-freeze run — no answer, empty state). The r82 note itself numbers five laws (its fifth bundling
   the click-while-open observation), so neither "five" nor "seven" is the counter's count; the honest
   statement is the eight check ids and the receipt paths above.

## Provenance

- Driver `scripts/chrome-cdp-showpicker-round83.mjs`, sha256 `70b522cc896f4a9b89320d58313b56519499566256cb0b7dd0b3a8aac1944fce`
  (equals the receipt's `driverSha256` and the freeze pin — the one pin that never moved across the
  round's freeze amendments). Fifteen legs, one fresh browser per leg; the final-nonce run uses ports
  `http 19440 / cdp 19441 / child 19442` and `fixture.sha256 = 7784c9dece0f5c7ad1911733281a8bd7337a8a5588799cbda9acc02f9a9e55fa`
  (the first-freeze run used `19340-19342` and `e86ceb42…`). Both fixture hashes are **per-run by
  construction**: the page embeds the run nonce and the child port, so `fixture.sha256` is
  `7784c9de…` here and `e86ceb42…` in the first-freeze run, and `fixture.child.sha256` is
  `4f6d73dab664…` here against `f2b5b8a1…` there. Neither can be a cross-run pin.
- Counter `scripts/check-showpicker-r83.mjs` (pin `7b9f9ec4…`), 74 checks, decomposed exactly: 53
  literal `check('…')` ids, one template call `check('leg-' + name)` expanded over the 15 legs, and 6
  loop-built cross-origin ids (`sp83-cross-origin-{color,month,week,time,number,range}-law`) — 53 + 15
  + 6 = 74. The pre-amendment counter (sha256 `a89c2dbe…`) carried 72.
  Battery `scripts/negatives-showpicker-r83.mjs` (pin `12c09cc1…`): 153 cases, 0 failed, coverage
  `{declared 74, covered 74, uncovered [], unknown []}`. Kill power `scripts/kill-power-r83.mjs` (pin
  `09c2202d…`): 50 mutants, 50 killed, 0 survived, 0 crashed. Gate self-test
  `scripts/selftest-r83-gates.mjs` (pin `2d922c84…`): 9/9.
- Replay limit as printed by the counter: `ownEvents 61, ownGaps 2`; the prior
  (`.ufo/waves/round-83/controls/c1/probes/prior1.json`, sha256 `dfeba0d3…`, nonce `tabi-r83-probe`,
  15 legs, 61 page events) gives `priorEvents 61, priorGaps 1, absNeed 31, escapeEvents 31,
  refused false` for this receipt. The escape minimum is 31 moved events; a constant translation of
  every event still escapes, and the sentence says so.
- Pins: `.ufo/waves/round-83/freeze.txt`; all six files re-hashed here and byte-identical to their
  freeze lines. `claims.json` `digestsCommit` is the **sha256 of `freeze.txt` itself**
  (`b6496e6f5d4f0fda40e8bafc366f872cdd363400261282a80d391f034856ee40`), not a git object id — the
  same 64-hex string does not resolve as a commit in this lane, and it moves with every freeze
  amendment (`4cdf4def` → `c016710129da…`, `27d5451b` → `6ff35c28…`, `5d6c34f0` → `9d90392aca79…`,
  `615c97a1` → `b6496e6f…`). The lane identity nonce is `tabi-r83-l1-b6496e6f5d4f`; the receipt's
  run nonce is whatever the driver was given (the final-nonce run uses the identity nonce itself, the
  first-freeze run used `c016710129da`). The counter must be given **the receipt's** value as
  `--expect-nonce`; given any other it reports exit 1 with `nonce-expected` as its only false check
  (measured, 73/74 true).

## Limits — what a receipt of this shape cannot prove

- The receipt records the browser's own event stream; it does not prove *why* Chromium exempts color or
  refuses number/range. The source (S219's exemption step, S220's file/color guard) and the measurement
  agree, but agreement is not derivation: no leg varies a factor that would separate "exempt because
  the type is file/color" from any other predicate that happens to hold for these types in this build.
- Remaining input types (`tel`, `search`, `text`) are carried from S219's enumeration, not measured.
  Eight cross-origin legs cover date, disabled date, color, month, week, time, number, range.
- The `multiple` answer is single-path: the retention branch for N>1 paths (`SetFilesFromPaths`) is not
  exercised, and `multiple-mode-law` does not bind the delivered bytes.
- The `accept` grammar is measured at two points only (`.png` accepted with a PNG payload; `.txt`
  accepted into `.png`). No leg carries an `accept` with a MIME token, `image/*`, or a mixed list — the
  fixture declares `accept="image/png"` on `#accept` and no leg targets it.
- The second-chooser attribution is a property of one answer pair. A consistent id relabel is inside the
  frozen limit; the bytes are the only discriminator, and they distinguish the *answer*, not the chooser
  that consumed it.
- `fixture.sha256` and `fixture.child.sha256` cannot be cross-run pins (the run nonce and the child
  port are substituted into both). The only run-invariant identity the receipt carries is the driver
  pin; the fixture and child documents are re-hashed per run and compared to operator-supplied values.
- Browser identity is the whole of `host.chromium` / `cdpProduct` / `cdpProtocolVersion`
  (`Chromium 155.0.8059.84`, `Chrome/155.0.8059.84`, `1.3`); nothing here bounds another build.
- The delivered "PNG" is a 8-byte PNG signature plus the 13-byte ASCII marker `tabi-r83-png\n`. The
  counter checks its bytes and sha256; nothing in this generation proves an image input accepts a
  *decodable* image.

## Frontier (named, not held)

- `type=tel`, `type=search`, `type=text` cross-origin legs (the rest of S219's enumeration).
- An `accept` token-grammar leg set: a MIME token (`accept="image/png"`), `image/*`, and a mixed list,
  each answered with a conforming and a non-conforming file — and the page-read hex pinned in the law
  for every answer leg, not just three of five.
- A `multiple` answer carrying **two** paths, to take the retention branch and to test whether
  `mode: selectMultiple` survives more than one file.
- A second-chooser answer whose two choosers are on **different** inputs (distinct `backendNodeId`s), to
  separate "bytes attribute the answer" from "the id was shared anyway".
- A translation-invariant replay statistic (e.g. a gap-sequence hash) beside `absMatched`, so the
  constant-offset copy of a prior stops escaping the replay rule.
