---
source: S219 (WHATWG HTML `showPicker()` steps), S220/S218 (Chromium 155.0.8059.84 `html_input_element.cc`), S216 (the normative algorithm and its exception order), S221 (CDP Page domain), S222 (CDP DOM domain); receipt `corpus/evidence/round85/chromium-showpicker/receipt.json` (24 legs, sha256 `c22f90f7…1e56a`, nonce `tabi-r85-l1-620623a43f74`; driver `scripts/chrome-cdp-showpicker-round85.mjs` sha256 `1690c63d…ab8ee`, pin in `.ufo/waves/round-85/freeze.txt`)
verified-at: 2026-11-08 (round 85, Linux host, Chromium 155.0.8059.84 `--headless=new`, node v24.21.0)
recheck: `node scripts/check-showpicker-r85.mjs --lane <ABS lane> --receipt corpus/evidence/round85/chromium-showpicker/receipt.json --expect-driver-sha256 1690c63d14447a08ea9fe915a49d317e2953c5fb08e064e8f160a100089ab8ee --expect-nonce tabi-r85-l1-620623a43f74 --expect-fixture-sha256 0b0129377711954ddae722a7ad6db8f00f5eb94759ef45786f21b6eede3d252a --prior-set .ufo/waves/round-85/controls/c1/prior-set.txt --json` → exit 0, verdict `clean`, 87 checks, 0 findings
---

# Programmatic picker generation r85 — the same-origin arms: the error is origin-determined, the picker is not

Generation r85 of the held capability `chromium-showpicker-linux` (SCORECARD). Twenty-four legs, one
fresh browser per leg. The r84 generation ended with eighteen legs and named its own frontier: a
same-origin `type=tel`/`search`/`text` trigger "for contrast with the cross-origin path". Six legs
close it — three **without** transient activation and three **after** a real trusted click on the
neutral `#pad` div — on parent-page inputs `#tes`/`#ses`/`#txs` (`<input type="tel">`,
`<input type="search">`, `<input type="text">`, 120x40 at left 100/300/500, top 750; `fixtureInputs`
ids `tes`/`ses`/`txs`, carried in all 24 legs' `fixtureInputs` and in the top-level `fixtureInputs`).
Every law below names the receipt field path that carries it.

## The measured laws

1. **Same-origin WITHOUT transient activation throws `NotAllowedError`, on all three types.**
   `legs[18..20].showPicker` (legs `sp85-same-origin-tel`, `-search`, `-text`) is
   `{ok:false, name:'NotAllowedError', message:"Failed to execute 'showPicker' on 'HTMLInputElement':
   HTMLInputElement::showPicker() requires a user gesture."}` — the byte-identical message the
   cross-origin arms do **not** throw. The activation read is frozen at
   `{isActive:false, hasBeenActive:false}` on both sides of the call
   (`legs[18..20].activationBefore` and `.activationAfter`), `pageEvents` is empty (zero trusted
   events, `legs[18..20].pageEvents`), and `cdpEventLog` carries **zero**
   `Page.fileChooserOpened`. Counter: the per-leg shape ids `leg-sp85-same-origin-tel` /
   `-search` / `-text`, and `gesture-law`, which pins the parent `showPicker` outcome for every leg
   against `SP_LAW`.

2. **Same-origin WITH transient activation returns `undefined` and opens NO chooser.** After a
   trusted click on `#pad` (`legs[21..23].priorClick` = `{at:[360,40], wantTarget:'pad'}`,
   `priorPressId` 15, `priorReleaseId` 16, `priorClickElement` `'pad'`), the activation read is
   `{isActive:true, hasBeenActive:true}` at the call (`legs[21..23].activationBefore`) and is
   **consumed** by it (`legs[21..23].activationAfter` = `{isActive:false, hasBeenActive:true}`), and
   `showPicker` is `{ok:true, ret:'undefined'}` (`legs[21..23].showPicker`) — no exception, no
   chooser: `cdpEventLog` carries **zero** `Page.fileChooserOpened` on each of the three, and
   `firstChooserBackendNodeId` is `null` on each. The five page events are the trusted
   `#pad` click (`legs[21..23].pageEvents`: `pointerdown@pad`, `mousedown@pad`, `pointerup@pad`,
   `mouseup@pad`, `click@pad`, every one `isTrusted:true` and `act:true`), and `stateAfter` is empty
   (`{s:[], m:[], d:[], k:[], dis:[], disd:[], sValue:''}`) — no selection, no `input`/`change`
   event. Counter: the new law `same-origin-no-picker-law` (checks
   `showPicker.ok === true && showPicker.ret === 'undefined'` **and** the zero
   `Page.fileChooserOpened` count on the three `-activated` legs), plus the per-leg shape ids
   `leg-sp85-same-origin-{tel,search,text}-activated` and the `no-selection-law` sweep.

3. **The error is origin-determined, given activation and a held-constant type attribute.** The
   cross-origin arms call `showPicker()` from inside the child frame's own trusted click handler
   (`go12`/`go13`/`go14`; `legs[12..14].childEvents` = five trusted events on that leg's own
   button), so their activation read is `{isActive:false, hasBeenActive:false}` →
   `{isActive:true, hasBeenActive:true}` (`legs[12..14].childActivationBefore` /
   `.childActivationAfter`), and their outcome is the SecurityError
   `"showPicker() called from cross-origin iframe."` (`legs[12..14].childResult`). The same-origin
   arms, activation held constant by the `#pad` click, return `undefined` and open nothing. Three
   distinct recorded outcomes over the measured surface — `NotAllowedError` (same-origin, no
   activation), `undefined` + zero choosers (same-origin, activation), `SecurityError`
   (cross-origin, activation) — for one type attribute. This is the contrast the r84 note said the
   instrument could not produce.

4. **Every r84 law is carried, and the counter's growth is exactly the six new legs plus one law.**
   The r85 plan is the r84 plan's eighteen legs (same names, same order, same targets) plus the six
   `sp85-*` arms at `legs[18..23]`. The committed counter run
   (`.ufo/waves/round-85/scored/counter-a.json`, `verdict:clean`, `checkCount:87`) decomposes as
   **34** structural/binding ids + **3** `leg-*` meta ids (`leg-marks`, `leg-order`, `leg-records`)
   + **24** per-leg shape ids + **26** `*-law` ids; the r84 counter (80 checks) decomposes as
   34 + 3 + 18 + 25. The difference is exactly **+6** per-leg ids (`leg-sp85-same-origin-{tel,
   search,text}` and the three `-activated` forms) and **+1** law id
   (`same-origin-no-picker-law`); no r84 law id is lost (the set difference of the two `checks` maps
   is the seven new ids only). The r84 laws still hold on the r85 receipt, each re-derived on the
   same field: the cross-origin `type=color` exemption (`legs[2].childResult` =
   `{ok:true, ret:'undefined'}`), the `date`/`month`/`week`/`time`/`number`/`range`/`tel`/`search`/
   `text` SecurityError (`legs[0], [3..5], [10..14].childResult`, one byte-identical message), the
   origin-before-mutability order discriminator (`legs[6].showPicker` = `InvalidStateError`
   "cannot be used on immutable controls." same-origin, while `legs[1].childResult` is the
   SecurityError cross-origin on the *same* disabled `type=date` element), the directory answer with
   `webkitRelativePath` (`legs[7].stateAfter.d` = `[["inner-a.txt",19,"text/plain",
   "tabi-r85-dir/inner-a.txt"], ["inner-b.png",18,"image/png","tabi-r85-dir/inner-b.png"]]`),
   `accept=".png"` accepting a `.txt` (`legs[8].stateAfter.k` = `[["tabi-r85-a.txt",22,"text/plain",
   ""]]`), `multiple` → `selectMultiple` (`legs[15].stateAfter.m`, the chooser event's `mode` is
   `selectMultiple`), the accept-MIME byte answer (`legs[16].stateAfter.k` = `[["tabi-r85-b.png",21,
   "image/png",""]]`, the `read` event's `ret` = `hex:89504e470d0a1a0a746162692d7238332d706e670a`),
   the second-chooser payload answer with its non-discriminating shared `backendNodeId`
   (`legs[17]`: `firstChooserBackendNodeId === secondChooserBackendNodeId` (18/18), choosers 1 → 2,
   `stateAfter.s` = `[["tabi-r85-second.txt",28,"text/plain",""]]`, `stateAfter.sValue` =
   `C:\fakepath\tabi-r85-second.txt`), the click-while-open law (`legs[9]`: choosers 1 → 2, element
   `s`), and the no-selection law (`stateAfter` empty on every non-answer leg).

5. **The delivered "PNG" is still a signature plus a marker, and the marker still names r83.**
   `legs[16].uploadPng` is `{name:'tabi-r85-b.png', size:21, sha256:'575d88a4…', hex:'89504e470d0a1a0a
   746162692d7238332d706e670a'}` and the `read` event's `ret` is that hex. Decoded, the 21 bytes are
   the **8-byte PNG signature** `89 50 4e 47 0d 0a 1a 0a` followed by the **13-byte ASCII marker**
   `tabi-r83-png\n` — the marker names r83 because the driver's *content* strings are pinned to the
   r83 bytes while the file *names* are r85 (names are not pinned). The law is byte-acceptance of
   a non-empty file, not image validity; nothing in this generation proves an image input accepts a
   decodable image. The same holds for the answer bytes: `legs[8].upload` /
   `legs[15].upload` carry `tabi-r85-a.txt`, 22 bytes, sha256 `bc9965f1…`, whose hex
   `746162692d7238332d616e737765722d616c7068610a` is `tabi-r83-answer-alpha\n`.

6. **The replay limit is the counter's own, and it is printed beside the threshold.** The scored
   run's `limit` block: `tolerance 0.05`, `gapMin 50`, `ownEvents 76`, `ownGaps 2`; the single prior
   (`.ufo/waves/round-85/controls/c1/prior-set.txt` → `controls/c1/probes/prior1.json`, sha256
   `d6ab237f…` for the prior *file*, prior nonce `tabi-r85-prior3-a1` — a *different* nonce from the
   receipt's, 24 legs, 76 page events) gives `priorEvents 76, priorGaps 2, absMatched 0, gapMatched 0,
   absNeed 38, gapNeed 2, escapeEvents 39, refused false`. The escape minimum is 39 moved events;
   the printed sentence says a constant translation of every event still escapes, and it does —
   measured: a copy of the scored receipt with **every** `pageEvents[].ts` and `.at` shifted by
   `+2.0` still passes `replay-event-timeline` (`checks['replay-event-timeline'] === true`) with
   `absMatched 0`, `refused false` (the copy's only finding is `prior-set-complete`, because a
   receipt under test outside the walked trees makes the in-tree receipt count as unlisted). The gap
   side is reported, never a refusal, because this driver's fixed waits reproduce gap durations
   across honest runs.

## What a receipt of this shape cannot prove

- **The two sides are different ELEMENTS in different frames.** The same-origin arms are the
  parent-page `#tes`/`#ses`/`#txs`; the cross-origin arms are the child-frame `#te`/`#se`/`#tx`. The
  claim is "same type attribute, activation held constant, origin varied", never "same element".
  The fixture cannot vary origin with one element: there is no input reachable from both origins in
  this loopback pair.
- **The activation contrast is not a 2x2.** Every cross-origin leg invokes `showPicker()` from
  inside the child's click handler (`go12`/`go13`/`go14`); the child script has no non-gesture call
  path, so the (cross-origin, no-activation) cell is never measured. The cross-origin arms are
  therefore "origin-determined *given activation*", which is exactly what law 3 says and exactly
  what the frozen claim's `type` sentence says when read with the plan's declared limits.
- **"No picker exists for these types" is an inference, not a recorded field.** What is recorded
  is `showPicker()` returned `{ok:true, ret:'undefined'}` and the `Page.fileChooserOpened` count is
  0. The receipt has no picker-capability field; the zero-open expectation is a hardcoded name set
  in the counter (`NO_PICKER`), and the receipt does not show whether Chromium returned early for
  the type or failed to find a popup view. The frozen claim's parenthetical "(no picker exists for
  these types)" is prose, not a measurement.
- **The receipt records the browser's own event stream; it does not prove WHY Chromium applies one
  origin gate to all nine measured non-file types, nor why `type=color` is exempt** (S219's
  exemption set is {File Upload, Color}; agreement with the source is not derivation).
- **The `accept` token grammar is still not enumerated.** The answered input is `#k` with
  `accept=".png"` (an **extension** token); the MIME-token branch is the `accept-mime-answer` byte
  law only, `image/*` and mixed lists are unexercised. The r83 erratum and the r84 note record the
  same reject; r85 does not move it.
- **The replay rule is relational-to-tolerance, not absolute.** A forger who shifts every page
  event by a constant escapes `replay-event-timeline` by design (law 6). Any downstream consumer
  quoting "counter clean at 87" as replay-proofing must attach that disclosure.
- **The receipt's fixture prose is not re-derived.** `fixture.patch.{style,body,inputs,state}` are
  recorded strings nothing re-derives, and `fixture.child.sha256` is only shape-checked (64 hex) —
  never compared to an expected child hash — so the field naming the cross-origin half of the
  fixture, which carries every `SecurityError` law, is unpinned as a field. The fixture is pinned
  transitively instead, by the driver pin plus the nonce plus the port-bound child origin.
- **The shared `backendNodeId` of the second chooser remains non-discriminating** — the bytes
  attribute the answer, never the chooser event that consumed it — and a consistent relabel is
  inside the frozen limit by design.
- **`fixture.sha256` and `fixture.child.sha256` are per-run by construction** (the run nonce and
  the child port are substituted into both), so neither can be a cross-run pin; the only
  run-invariant identity the receipt carries is the driver pin. The scored receipt's fixture hash is
  `0b0129377…d252a` for the D2 nonce; the D1 receipt's was `9b71a949…2db5d` — the same fixture
  content under a different nonce and port.
- **Browser identity is the whole of `host.chromium` / `cdpProduct` / `cdpProtocolVersion`**
  (`Chromium 155.0.8059.84`, `Chrome/155.0.8059.84`, `1.3`); nothing here bounds another build.

## Frontier (named, not held)

- The `accept` grammar as a token matrix — `image/png` as a MIME token, `image/*`, and a mixed
  list — each answered programmatically with a conforming and a non-conforming file, one leg per
  token form.
- A **same-element** origin comparison: one input reachable from both origins (e.g. via a
  `postMessage` proxy or a re-parented frame), so that origin alone varies while the element, the
  type attribute and the activation all stay constant. Not constructible in the current loopback
  fixture.
- The (cross-origin, **no**-activation) cell: a cross-origin `showPicker()` call made *outside* a
  gesture, so that the origin gate is measured against the activation gate rather than with
  activation held constant. The child frame's script has no such path today.
- What a same-origin activated `type=color` call returns (the color arm is measured cross-origin
  only in this generation), and whether the "no picker" outcome for `tel`/`search`/`text` is a
  type early-return or a missing popup view — a DevTools-side probe of the input's picker class
  would separate them.
- A translation-invariant replay statistic (a gap-sequence hash) beside `absMatched`, so a
  constant-offset copy of a prior stops escaping the replay rule.
