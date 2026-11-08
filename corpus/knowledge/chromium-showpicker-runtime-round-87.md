---
source: S223 (WHATWG HTML — the file-upload state's `accept` attribute as a hint), S219 (WHATWG HTML `showPicker()` steps — the SecurityError and its File/Color exemption), S216 (the normative algorithm), S221/S222 (CDP Page/DOM domain, carried); receipt `corpus/evidence/round87/chromium-showpicker/receipt.json` (driver `scripts/chrome-cdp-showpicker-round87.mjs`, pin in `.ufo/waves/round-87/freeze.txt`)
verified-at: 2026-11-08 (round 87, Linux host, Chromium 155.0.8059.84 `--headless=new`)
recheck: `node scripts/check-showpicker-r87.mjs --lane <ABS lane> --receipt corpus/evidence/round87/chromium-showpicker/receipt.json --expect-driver-sha256 7c54e786d78d455b955e822deb4bf0419b85c4859c5287c27380d6b568389e5f --expect-nonce tabi-r87-l1-3dd4b0802d67 --expect-fixture-sha256 10e444f7fb840b6e132b4570794d3a0ed6f5db0781ca490a986685505e8d94c4 --prior-set .ufo/waves/round-87/controls/c1/prior-set.txt --json` → exit 0, 99 checks
---

# Programmatic picker generation r87 — the remaining `accept` token forms

Generation r87 of the held capability `chromium-showpicker-linux` (SCORECARD). Thirty-four legs, one
fresh browser per leg. Round 86 measured three token forms and named the rest of the grammar as
frontier; this generation measures four more, one page input each.

## The measured laws

1. **`accept` is not a validator on a programmatic answer — now over seven token forms.** Every leg
   delivers a file through `DOM.setFileInputFiles` to an input whose raw `accept` attribute is read
   back from the page (`fixtureInputs`), and in every case the delivered file lands in the input's
   `files` list with its bytes, fires trusted `input`+`change`, and the page reads the bytes back
   (`read` event `ret: 'hex:…'`); `Page.fileChooserOpened` carries `selectSingle`. The new legs
   (this generation):
   - `accept="audio/*"` answered with `image/png` bytes — `sp87-accept-audio-png` (input `aa`);
   - `accept="video/*"` answered with `text/plain` bytes — `sp87-accept-video-text` (`av`);
   - `accept="image/png,application/pdf"` (multi-MIME, no space after the comma) answered with
     `text/plain` — `sp87-accept-multimime-text` (`a2`);
   - `accept="  image/png ,  .txt  "` (whitespace variant) answered with `image/png` —
     `sp87-accept-whitespace-png` (`aws`).
   The r86 forms (`image/*`, `image/png, .txt`, `application/pdf`) and the r84 extension-token law
   (`.txt` into `accept=".png"`) are the controls; the whole matrix is gated by
   `accept-grammar-law`. The spec's own word for the attribute is "hint": it "may be specified to
   provide user agents with a hint of what file types will be accepted". What a user's DIALOG would
   offer or refuse is not measured by this receipt.
2. **Carried unchanged from r86** — the same-origin `tel`/`search`/`text` arms, the cross-origin
   `date`/`month`/`week`/`time`/`number`/`range`/`tel`/`search`/`text` `SecurityError`, the
   origin-before-mutability order discriminator, the directory answer with `webkitRelativePath`,
   `multiple` → `selectMultiple`, the second-chooser payload answer, and the same-origin
   `type=color` activated arm (`undefined`, activation consumed, no input/change, zero file
   choosers). The r87 counter re-derives all of them (99 checks).

## What a receipt of this shape cannot prove

- **Acceptance is not filtering.** `DOM.setFileInputFiles` answers a chooser programmatically; the
  law says `accept` does not filter THAT path. What a user's dialog offers or rejects is not
  measured — headless opens no real dialog — and is not claimed.
- **Seven token forms, not the whole grammar.** MIME parameters (`image/png;q=0.9`), case variants
  (`IMAGE/PNG`), combined `audio/*,video/*` lists and the full WHATWG "unique security error"
  ordering for every type stay unmeasured.
- **The whitespace leg measures the raw attribute string**, not a parsed token list: the counter
  compares the page's `accept` string exactly, so parser normalization is not inferred from it.
- **The colour arm is bounded to the file-chooser metric.** Zero `Page.fileChooserOpened` events do
  not show whether a colour popup appeared; nothing stronger is claimed.
- **The counter reads a receipt.** Its printed `limit` names the escape: a forger who shifts every
  page event by a constant offset passes the replay rule. Provenance is bound by the driver pin, the
  fixture sha and the nonce; the browser's own execution is not re-derived.
- **Secure-context state is not recorded.** The fixture is `http://127.0.0.1:<port>` (a
  potentially-trustworthy origin); nothing here measures a non-secure-context page.

## Frontier (named, not held)

- `accept` MIME parameters and case variants (`IMAGE/PNG`, `image/png;q=0.9`).
- Combined media-type lists (`audio/*,video/*`) and the parser's whitespace/comma normalization
  read from the DOM rather than the raw string.
- A same-element origin comparison (an input reachable from both origins via a `postMessage` proxy)
  — not constructible in the current loopback fixture.
- What a `type=color` same-origin call does to the colour popup itself (not a CDP file-chooser
  event) — needs a UI-side probe or a source-side reading of the colour chooser path.
