---
source: S223 (WHATWG HTML — the file-upload state's `accept` attribute as a hint), S219 (WHATWG HTML `showPicker()` steps — the SecurityError and its File/Color exemption, the "supports a picker" sentence), S216 (the normative algorithm and exception order), S221 (CDP Page domain), S222 (CDP DOM domain); receipt `corpus/evidence/round86/chromium-showpicker/receipt.json` (driver `scripts/chrome-cdp-showpicker-round86.mjs`, pin in `.ufo/waves/round-86/freeze.txt`)
verified-at: 2026-11-08 (round 86, Linux host, Chromium 155.0.8059.84 `--headless=new`)
recheck: `node scripts/check-showpicker-r86.mjs --lane <ABS lane> --receipt corpus/evidence/round86/chromium-showpicker/receipt.json --expect-driver-sha256 5a435da6dae0d2eba1add83e51903ae954801fb67bca6186f2ad5787e94a313d --expect-nonce tabi-r86-l1-4bd89a80f439 --expect-fixture-sha256 94421dc0cceba84082aa3e75d501e14876b7eac6942c809f98f7fef6b774a3a1 --prior-set .ufo/waves/round-86/controls/c1/prior-set.txt --json` → exit 0, 95 checks
---

# Programmatic picker generation r86 — the `accept` token grammar and the same-origin colour arm

Generation r86 of the held capability `chromium-showpicker-linux` (SCORECARD). Thirty legs, one fresh
browser per leg. The r85 note ended with three named frontier items; two are measured here (the third
— a same-element origin comparison — is not constructible in the current loopback fixture and stays
frontier).

## The measured laws

1. **`accept` is a dialog filter, never a validator — for every token form.** Five legs answer the
   programmatic chooser through `DOM.setFileInputFiles` on three page inputs whose `accept`
   attributes are read back from the page (`fixtureInputs` ids `aw`/`am`/`ap`):
   `accept="image/*"` answered with `text/plain` bytes (`sp86-accept-wildcard-text`) and with
   `image/png` bytes (`sp86-accept-wildcard-png`); `accept="image/png, .txt"` (mixed list) answered
   with both (`sp86-accept-mixed-text`, `sp86-accept-mixed-png`); and
   `accept="application/pdf"` — a MIME token matching neither delivered byte — answered with
   `image/png` (`sp86-accept-pdf-token-png`). In every case the delivered file lands in the input's
   `files` list with its bytes, fires trusted `input`+`change`, and the page reads the bytes back
   (`read` event `ret: 'hex:…'`); the `Page.fileChooserOpened` mode is `selectSingle` throughout.
   The r84 extension-token law (`.txt` into `accept=".png"`) is the control. Gated by
   `accept-grammar-law`. The spec agrees about the attribute's nature: it "may be specified to
   provide user agents with a hint of what file types will be accepted".
2. **A same-origin `type=color` `showPicker()` with transient activation returns `undefined`, consumes
   the activation, fires no `input`/`change`, and opens zero FILE choosers**
   (`sp86-same-origin-color-activated`: `showPicker` `{ok:true, ret:'undefined'}`,
   `activationBefore` `{isActive:true, hasBeenActive:true}` → `activationAfter`
   `{isActive:false, hasBeenActive:true}`, `Page.fileChooserOpened` count 0). The spec's sentence for
   this type is "Throws a 'SecurityError' DOMException if input is inside a cross-origin iframe,
   unless input is in the File Upload or Color states" — colour is exempt from the cross-origin
   refusal, and the r84 cross-origin colour leg (returns `undefined`, opens nothing) is its
   counterpart. The zero-open is a FILE-chooser metric: whether Chromium opened a colour popup is not
   recorded.
3. **Carried unchanged from r85** — the same-origin `tel`/`search`/`text` arms (`NotAllowedError`
   without activation, `undefined` + zero file choosers with it), the cross-origin
   `date`/`month`/`week`/`time`/`number`/`range`/`tel`/`search`/`text` `SecurityError`, the
   origin-before-mutability order discriminator, the directory answer with `webkitRelativePath`,
   the extension-token accept answer, `multiple` → `selectMultiple`, the MIME byte answer, and the
   second-chooser payload answer with its non-discriminating shared `backendNodeId`. The r86 counter
   re-derives all of them (95 checks).

## What a receipt of this shape cannot prove

- **Acceptance is not filtering.** `DOM.setFileInputFiles` answers a chooser programmatically; the
  law says `accept` does not filter THAT path. What a user's dialog offers or rejects is not
  measured — headless opens no real dialog — and is not claimed.
- **The colour arm is bounded to the file-chooser metric.** Zero `Page.fileChooserOpened` events do
  not show whether a colour popup appeared; the spec's "Shows any applicable picker UI … If input
  does not support a picker, this method does nothing" makes "no file chooser" the safe reading, and
  nothing stronger is claimed.
- **Three token forms, not the whole grammar.** `audio/*`, `video/*`, multiple MIME tokens and
  whitespace variants are unmeasured; the extension/MIME distinction is measured only for `.png`,
  `image/*`, `application/pdf` and the `image/png, .txt` list.
- **The witness set is six conjunct-scoped mutants**, not every leg-scoped narrowing a mutation
  tester can write.

## Frontier (named, not held)

- A same-element origin comparison (an input reachable from both origins via a `postMessage` proxy) —
  not constructible in the current loopback fixture.
- The remaining `accept` token forms (`audio/*`, `video/*`, multi-MIME lists, whitespace variants)
  answered one leg per form.
- What a `type=color` same-origin call does to the colour popup itself (not a CDP file-chooser
  event) — needs a UI-side probe or a source-side reading of the colour chooser path.
