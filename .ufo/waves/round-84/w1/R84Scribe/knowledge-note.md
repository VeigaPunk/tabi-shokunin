source: S219 (WHATWG HTML `showPicker()` steps), S220 (Chromium 155.0.8059.84 `html_input_element.cc`), S221 (CDP Page domain), S222 (CDP DOM domain), S223 (WHATWG `accept` attribute); receipt `corpus/evidence/round84/chromium-showpicker/receipt.json` (sha256 `29347958cfbc2c246af1e89cb2286b8a21fbdbde5d55fd78e69e1bca732cf59c`, 18 legs, nonce `tabi-r84-l1-a5bdb15ec9a7`; driver `scripts/chrome-cdp-showpicker-round84.mjs` sha256 `f436b229df3a9194f074d9489dbeed54a24081afaae3d3027ff46aad4198807e`, pin in `.ufo/waves/round-84/freeze.txt`)
verified-at: 2026-11-08 (round 84, Linux host, Chromium 155.0.8059.84 `--headless=new`, node v24.21.0)
recheck: `node scripts/check-showpicker-r84.mjs --lane <ABS lane> --receipt corpus/evidence/round84/chromium-showpicker/receipt.json --expect-driver-sha256 f436b229df3a9194f074d9489dbeed54a24081afaae3d3027ff46aad4198807e --expect-nonce tabi-r84-l1-a5bdb15ec9a7 --expect-fixture-sha256 64817252bbb79267b6256a0b004b54ea899358d503b878608621be861ff7738a --prior-set .ufo/waves/round-84/controls/c1/prior-set.txt --json` → exit 0, 80 checks

# Programmatic picker generation r84 — the tel/search/text cross-origin SecurityError, with every r83 leg carried

Generation r84 of the held capability `chromium-showpicker-linux` (SCORECARD). Eighteen legs, one
fresh browser per leg; the page fixture is the r83 template plus cross-origin `type=tel` (`#te`),
`type=search` (`#se`) and `type=text` (`#tx`) inputs with buttons `#go12`/`#go13`/`#go14` inside the
child frame. Every law below names the receipt field path that carries it.

## The measured laws

1. **Cross-origin `type=tel`, `type=search` and `type=text` inputs throw the SecurityError and open
   nothing.** `legs[12].childResult`, `legs[13].childResult` and `legs[14].childResult` are
   `{ok:false, name:'SecurityError', message:"Failed to execute 'showPicker' on 'HTMLInputElement':
   showPicker() called from cross-origin iframe."}` — the byte-identical message the r83 legs
   `sp83-cross-origin-nonfile` (`legs[0]`, `type=date`), `-month`/`-week`/`-time` (`legs[3..5]`) and
   `-number`/`-range` (`legs[10..11]`) carry. Each of the three legs has **zero**
   `Page.fileChooserOpened` in `cdpEventLog` and zero `pageEvents`; `parentCrossAccess` is
   `{contentDocument:null, windowDocument:'SecurityError'}`; `childEvents` is exactly five trusted
   events on that leg's own button (`legs[12]` `pointerdown@go12 … click@go12`, `legs[13]` `…@go13`,
   `legs[14]` `…@go14`, every entry `isTrusted:true` and `act:true`); `childLate` is 0; the child's
   own activation read goes `{isActive:false, hasBeenActive:false}` →
   `{isActive:true, hasBeenActive:true}` (`childActivationBefore`/`childActivationAfter`); and the
   frozen child state is `teValue:''`, `seValue:''`, `txValue:''` (`childState`). Counter:
   `sp84-cross-origin-tel-law`, `sp84-cross-origin-search-law`, `sp84-cross-origin-text-law`, plus
   the per-leg `leg-sp84-cross-origin-tel`/`-search`/`-text` shape checks.
   This closes the input-type surface the r83 note named as frontier ("`type=tel`/`search`/`text`
   cross-origin legs"), on the **error** only: the legs measure the SecurityError and the absence of
   a chooser, never a dialog's contents.

2. **Every r83 leg is carried, unchanged in substance.** The r84 plan is the r83 plan's fifteen legs
   (`sp83-*` → `sp84-*`, same order, same targets) plus the three new legs inserted at
   `legs[12..14]`, which push `sp84-multiple-mode`, `sp84-accept-mime-answer` and
   `sp84-second-chooser-answer` to `legs[15..17]`. Diffing the two committed receipts leg-for-leg
   (`jq` over `corpus/evidence/round83/chromium-showpicker/receipt.json` and
   `corpus/evidence/round84/chromium-showpicker/receipt.json`), all fifteen carried legs agree on
   `childResult`, on the `Page.fileChooserOpened` count, on the `read` event's `ret` hex and on the
   child's value fields. The **only** differences are the run-prefixed byte strings the driver
   substitutes: `tabi-r83-a.txt`→`tabi-r84-a.txt`, `tabi-r83-b.png`→`tabi-r84-b.png`,
   `tabi-r83-second.txt`→`tabi-r84-second.txt`, `tabi-r83-dir/`→`tabi-r84-dir/`, and the
   corresponding `C:\fakepath\…` value. The carried laws therefore still hold:
   `webkitdirectory-answer-law` (`legs[7].stateAfter.d` carries `webkitRelativePath`
   `tabi-r84-dir/inner-a.txt` and `…/inner-b.png`); `accept-answer-law` (`legs[8].stateAfter.k` is
   `[["tabi-r84-a.txt",22,"text/plain",""]]` — a `.txt` into an `accept=".png"` input, accepted);
   `click-while-open-law` (`legs[9]`: `clickWhileOpenChoosersBefore` 1 → `…After` 2, no answer, empty
   state); `multiple-mode-law` (`legs[15].stateAfter.m` is
   `[["tabi-r84-a.txt",22,"text/plain",""]]`, `Page.fileChooserOpened` mode `selectMultiple`);
   `accept-mime-answer-law` (`legs[16].stateAfter.k` is `[["tabi-r84-b.png",21,"image/png",""]]`);
   `second-chooser-answer-law` (`legs[17]`: `firstChooserBackendNodeId === secondChooserBackendNodeId`
   (15/15), `clickWhileOpenChoosersBefore` 1 → `…After` 2, `stateAfter.s` is
   `[["tabi-r84-second.txt",28,"text/plain",""]]`, `stateAfter.sValue` is
   `C:\fakepath\tabi-r84-second.txt`); and the r82-carried set of eight law checks —
   `gesture-law`, `activation-law`, `mode-law`, `cross-origin-nonfile-law`, `order-law`,
   `webkitdirectory-answer-law`, `accept-answer-law`, `click-while-open-law` — all still present.

3. **The counter's own check count decomposes exactly, and the growth is only the three new legs.**
   `check-showpicker-r84.mjs` at its freeze pin declares 80 checks, and the committed scored run
   (`jq -r '.checks|keys[]'` over `.ufo/waves/round-84/scored/counter-a.json`) splits them as
   **34** structural/binding ids + **3** `leg-*` meta ids (`leg-marks`, `leg-order`, `leg-records`)
   + **18** per-leg shape ids (`leg-<legname>`, one per leg) + **25** `*-law` ids. The r83 counter
   (74 checks) splits the same way as 34 + 3 + 15 + 22. The difference is therefore exactly +3 leg
   ids and +3 law ids — the `sp83-cross-origin-{color,month,week,time,number,range}-law` family
   becomes the nine-member `sp84-cross-origin-{color,month,week,time,number,range,tel,search,text}-law`
   family, and the sixteen non-per-type `*-law` ids are carried unchanged. The r83 note's "the r82
   seven laws are carried forward" sentence names five clauses and the counter carries eight r82
   check ids; the honest statement is the check ids, not the prose number.

4. **The delivered "PNG" is still a signature plus a marker, and r84 delivers r83's exact bytes.**
   `legs[16].uploadPng` is `{name:'tabi-r84-b.png', size:21, sha256:'575d88a4…', hex:
   '89504e470d0a1a0a746162692d7238332d706e670a'}` and the single `read` event's `ret` is that hex.
   Decoded, the 21 bytes are the **8-byte PNG signature** `89 50 4e 47 0d 0a 1a 0a` followed by the
   **13-byte ASCII marker** `tabi-r83-png\n` — the marker still names r83 because the driver's
   content strings are pinned to the r83 bytes (the file *names* are r84; the names are not pinned).
   The law is byte-acceptance of a non-empty file, not image validity, and nothing in this
   generation proves an image input accepts a decodable image.

5. **The replay limit is the counter's own, and it is printed beside the threshold.** The scored run's
   `limit` block: `ownEvents 61, ownGaps 8`; the single prior
   (`.ufo/waves/round-84/controls/c1/prior-set.txt` → `controls/c1/probes/prior1.json`, sha256
   `968844b3…` for the prior-set file, prior nonce `tabi-r84-probe4` — a *different* nonce from the
   receipt's, 18 legs, 61 page events) gives `priorEvents 61, priorGaps 3, absMatched 0,
   gapMatched 0, absNeed 31, gapNeed 3, escapeEvents 31, refused false`. The escape minimum is 31
   moved events; a constant translation of every event still escapes, and the printed sentence says
   so. The gap side is reported, never a refusal, because this driver's fixed waits reproduce gap
   durations across honest runs.

## What a receipt of this shape cannot prove

- **The receipt carries no input-type evidence for the three new legs.** `grep -c 'type="tel"'` over
  the receipt returns 0 (same for `type="search"` and `type="text"`); the receipt's `fixtureInputs`
  array holds only the seven **page-side** descriptors (`s`, `m`, `d`, `k`, `f`, `dis`, `disd` — no
  `te`/`se`/`tx`), and the counter's `fixture-descriptors` check compares against that same
  page-side list. The child's input types live only in the driver's `CHILD_HTML`, whose sha256 the
  receipt records (`fixture.child.sha256` = `c34d33e5…`) but which the counter only regex-checks
  (`fixture-hash` compares `r.fixture.sha256` to the operator-supplied `--expect-fixture-sha256` and
  validates `r.fixture.child.sha256` as 64 hex — it never compares the child hash to an expected
  value, and there is no `--expect-child-fixture-sha256` flag). So a driver that wired `#go12` to a
  `type=date` element while leaving `target:'te'` honest would still produce a receipt that passes
  every gate. What law 1 establishes is: *the element the leg's target id pointed at* threw the
  exact cross-origin SecurityError and opened nothing. That the element was `type=tel` is the
  harness's wiring, not the instrument's measurement — the same black-box discrimination limit as
  r81–r83, and the reason the three new law checks are per-leg rather than one shared check.
- The receipt records the browser's own event stream; it does not prove WHY Chromium applies one
  origin gate to all nine measured non-file types, nor why `type=color` is exempt (S219's exemption
  set is {File Upload, Color}; agreement with the source is not derivation).
- The three new legs show no chooser opens and no selection exists. They do not show what a
  same-origin `tel`/`search`/`text` picker would open, because those inputs have no picker on this
  platform — a same-origin contrast leg is not measured.
- The `accept` token grammar is still not enumerated: the answered input is `#k` with
  `accept=".png"` (an **extension** token), `#accept` (`accept="image/png"`) is targeted by no leg,
  and the MIME-token and `image/*` branches stay frontier (the r83 note's `## Erratum`).
- The shared `backendNodeId` of the second chooser remains non-discriminating — the bytes attribute
  the answer, never the chooser event that consumed it — and a consistent relabel is inside the
  frozen limit by design.
- `fixture.sha256` and `fixture.child.sha256` are per-run by construction (the run nonce and the
  child port are substituted into both), so neither can be a cross-run pin; the only run-invariant
  identity the receipt carries is the driver pin.
- Browser identity is the whole of `host.chromium` / `cdpProduct` / `cdpProtocolVersion`
  (`Chromium 155.0.8059.84`, `Chrome/155.0.8059.84`, `1.3`); nothing here bounds another build.
- The instrument family is pinned to one byte-set. Measured at the **freeze pin**
  (`828dfcb7…` for `scripts/negatives-showpicker-r84.mjs`), the battery cannot cover the three new
  legs at all — see the r84 lesson's `## Mistakes`.

## Frontier (named, not held)

- A same-origin `type=tel`/`search`/`text` trigger (error or silent no-op) for contrast with the
  cross-origin path, and a type readback in `childState` so the input type is receipt-carried
  evidence rather than driver wiring.
- The full `accept` token grammar against a programmatic answer: a MIME token (`accept="image/png"`),
  `image/*`, and a mixed list, each answered with a conforming and a non-conforming file.
- A second answer leg whose bytes differ between first and second answers (id + bytes double
  attribution).
- A `multiple` answer carrying **two** paths, to take the retention branch and to test whether
  `mode: selectMultiple` survives more than one file.
- A translation-invariant replay statistic (a gap-sequence hash) beside `absMatched`, so a
  constant-offset copy of a prior stops escaping the replay rule.
