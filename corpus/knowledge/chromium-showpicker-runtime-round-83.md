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
4. **The SECOND chooser is answerable by its bytes, not its id.** `legs[14]` opens two choosers with
   the SAME `backendNodeId` (`firstChooserBackendNodeId === secondChooserBackendNodeId`), then answers
   the last event with distinct bytes (`tabi-r83-second.txt`); the input delivers THOSE bytes
   (`legs[14].stateAfter.s`, `read` ret hex). Answering by id cannot discriminate; the delivered bytes
   are the attribution.
5. **The r82 seven laws are carried forward.** Cross-origin `type=color` exempt; `type=month`/`week`/
   `time` SecurityError; the origin-before-mutability order discriminator; directory expansion with
   `webkitRelativePath`; `.txt` into `accept=".png"` accepted; click-while-open opens a second chooser
   with the same `backendNodeId`.

## What a receipt of this shape cannot prove

- The receipt records the browser's own event stream; it does not prove WHY Chromium exempts color
  or why number/range throw (the same black-box discrimination as r81–r82).
- Remaining input types (`tel`, `search`, `text`) are carried from S219 enumeration, not measured.
- The shared `backendNodeId` is browser-assigned; byte attribution is a property of this answer
  pair, not a general guarantee for every chooser pair.

## Frontier (named, not held)

- `type=tel`/`search`/`text` cross-origin legs.
- A second answer leg whose bytes differ between first and second answers (id + bytes double attribution).
- The full `accept` token grammar (extensions vs MIME vs `image/*` vs mixed lists).
