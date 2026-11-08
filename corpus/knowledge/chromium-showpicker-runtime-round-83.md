source: S219 (WHATWG HTML `showPicker()` steps), S220 (Chromium 155.0.8059.84 `html_input_element.cc`), S221 (CDP Page domain), S222 (CDP DOM domain), S223 (WHATWG `accept` attribute); receipt `corpus/evidence/round83/chromium-showpicker/receipt.json` (driver `scripts/chrome-cdp-showpicker-round83.mjs`, pin in `.ufo/waves/round-83/freeze.txt`)
verified-at: 2026-11-08 (round 83, Linux host, Chromium 155.0.8059.84 `--headless=new`)
recheck: `node scripts/check-showpicker-r83.mjs --lane <ABS lane> --receipt corpus/evidence/round83/chromium-showpicker/receipt.json --expect-driver-sha256 <pin> --expect-nonce <receipt nonce> --expect-fixture-sha256 <receipt fixture sha256> --prior-set .ufo/waves/round-83/controls/c1/prior-set.txt --json` → exit 0, 74 checks

# Programmatic picker generation r83 — number/range SecurityError, multiple mode, accept MIME, second-chooser answer

Generation r83 of the held capability `chromium-showpicker-linux` (SCORECARD). Fifteen legs, one fresh
browser per leg; the page fixture is the round-82 template plus cross-origin `type=number` (`#nu`)
and `type=range` (`#rg`) inputs with buttons `#go9`/`#go10`, a `multiple` file input (`#m`) leg, an
`accept-image/png` MIME answer leg, and a second-chooser answer leg. Every law below names the
receipt field path that carries it.

## The measured laws

1. **Cross-origin `type=number` and `type=range` inputs throw the SecurityError** — the same exact
   message as `type=date` (`legs[10..11].childResult`), and no chooser opens. The r82 frontier is now
   core: the non-file branch is not date/month/week/time-specific either.
2. **A `multiple` file input answered through `DOM.setFileInputFiles` opens `selectMultiple`**
   (`legs[12]`: `Page.fileChooserOpened` mode `selectMultiple`) **and accepts the answer**
   (`legs[12].stateAfter.m` carries the file). This closes the `mode-single-only` gap: the
   `selectMultiple` branch of `mode-law` is exercised by a leg for the first time.
3. **A real PNG answered into an `accept=".png"` input is accepted with its bytes**
   (`legs[13].stateAfter.k`, `read` ret `hex:` + PNG hex). Together with the r81/r82 `.txt`
   acceptance, the token grammar holds both the extension and MIME forms as hints, not validators.
4. **The SECOND chooser's answer delivers its payload, but the id does not attribute it.** `legs[14]`
   opens two choosers with the SAME `backendNodeId` (`firstChooserBackendNodeId ===
   secondChooserBackendNodeId`), then answers the last event with distinct bytes
   (`tabi-r83-second.txt`); the input delivers THOSE bytes (`legs[14].stateAfter.s`, `read` ret hex).
   Measured limit (R83Review2 + R83Exec2): answering `evs[0]` instead of the last event delivers
   byte-identical files and the frozen law still passes, and every id-equality conjunct is droppable
   with the battery still exiting 0 — the shared id carries no attribution. The law is a
   payload/state law plus an id-equality clause.
5. **The r82 seven laws are carried forward.** Cross-origin `type=color` exempt; `type=month`/`week`/
   `time` SecurityError; the origin-before-mutability order discriminator; directory expansion with
   `webkitRelativePath`; `.txt` into `accept=".png"` accepted; click-while-open opens a second chooser
   with the same `backendNodeId`.

## What a receipt of this shape cannot prove

- The receipt records the browser's own event stream; it does not prove WHY Chromium exempts color
  or why number/range throw (the same black-box discrimination as r81–r82).
- Remaining input types (`tel`, `search`, `text`) are carried from S219 enumeration, not measured.
- The shared `backendNodeId` is browser-assigned and non-discriminating: the frozen law cannot tell
  which of the two chooser events was answered (R83Exec2's `evs[0]` answer passes). Byte equality
  is a property of the payload, not of the event.

## Frontier (named, not held)

- `type=tel`/`search`/`text` cross-origin legs.
- A second answer leg whose bytes differ between first and second answers (id + bytes double attribution).
- The full `accept` token grammar (extensions vs MIME vs `image/*` vs mixed lists).

## Erratum (round 84, append-only — the frozen law text above is not rewritten)

The r83 non-author spot-check (`corpus/lessons/round-83-verifier-spotcheck.md`, routed defects 1–2)
found law 3 and the "real PNG" sentence overstated against the committed receipt. Corrected of record:

1. **Law 3's accept token.** The answered input is `#k`, whose marker attribute is
   `accept=".png"` — an EXTENSION token (`receipt.fixtureInputs`, `legs[8]`/`legs[13]`). `#accept`
   (`accept="image/png"`, the MIME token) is targeted by NO leg of the r83 receipt; `image/png` in
   the law is the delivered file's media type, not an `accept` token the leg exercised. The
   MIME-token and `image/*` branches stay frontier (`R83Scout.md` §5.1;
   `R83Scribe/knowledge-note.md:61-64`).
2. **"A real PNG".** The delivered bytes are the 8-byte PNG signature `89 50 4e 47 0d 0a 1a 0a`
   followed by the 13-byte ASCII marker `tabi-r83-png\n` (`legs[13].uploadPng.hex
   89504e470d0a1a0a746162692d7238332d706e670a`), not a decodable PNG image. The measured law is
   byte-acceptance of a non-empty file, not image validity.
3. **The law-count sentence.** "The r82 seven laws are carried forward" names five clauses; the r84
   counter carries eight law checks (`gesture`, `activation`, `mode`, `cross-origin-nonfile`,
   `order`, `webkitdirectory-answer`, `accept-answer`, `click-while-open`) plus the r83 additions.
   The number was a label, not a count of distinct checks.

Generation r84 measures the frontier this note named (`type=tel`/`search`/`text`, every carried leg)
— see `corpus/knowledge/chromium-showpicker-runtime-round-84.md`.
