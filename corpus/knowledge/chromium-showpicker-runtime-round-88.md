---
source: S223 (WHATWG HTML — the file-upload state's `accept` attribute as a hint), S219 (WHATWG HTML `showPicker()` steps — the SecurityError and its File/Color exemption), S216 (the normative algorithm), S221/S222 (CDP Page/DOM domain, carried); receipt `corpus/evidence/round88/chromium-showpicker/receipt.json` (driver `scripts/chrome-cdp-showpicker-round88.mjs`, pin in `.ufo/waves/round-88/freeze.txt`)
verified-at: 2026-11-08 (round 88, Linux host, Chromium 155.0.8059.84 `--headless=new`)
recheck: `node scripts/check-showpicker-r87.mjs --lane <ABS lane> --receipt corpus/evidence/round88/chromium-showpicker/receipt.json --expect-driver-sha256 7c54e786d78d455b955e822deb4bf0419b85c4859c5287c27380d6b568389e5f --expect-nonce tabi-r87-l1-3dd4b0802d67 --expect-fixture-sha256 10e444f7fb840b6e132b4570794d3a0ed6f5db0781ca490a986685505e8d94c4 --prior-set .ufo/waves/round-87/controls/c1/prior-set.txt --json` → exit 0, 99 checks
---

# Programmatic picker generation r88 — MIME parameters, case variants, combined lists

Generation r88 of the held capability `chromium-showpicker-linux` (SCORECARD). Thirty-seven legs, one
fresh browser per leg. Round 87 measured seven token forms and named three of the remainder as
frontier: `IMAGE/PNG` (case variant), `image/png;q=0.9` (MIME parameter) and `audio/*,video/*`
(combined media-type list). This generation measures those three, one page input each.

## The measured laws

1. **`accept` is not a validator on a programmatic answer — now over the ten token forms.** Every leg
   delivers a file through `DOM.setFileInputFiles` to an input whose raw `accept` attribute is read
   back from the page (`fixtureInputs`), and in every case the delivered file lands in the input's
   `files` list with its bytes, fires trusted `input`+`change`, and the page reads the bytes back
   (`read` event `ret: 'hex:…'`); `Page.fileChooserOpened` carries `selectSingle`. The new legs
   (this generation):
   - `accept="IMAGE/PNG"` (upper-case variant) answered with `image/png` bytes — `sp88-accept-case-png` (input `ac`);
   - `accept="audio/*,video/*"` (combined media-type list, no space after the comma) answered with
     `text/plain` — `sp88-accept-audiovideo-text` (`au`);
   - `accept="image/png;q=0.9"` (MIME parameter) answered with `image/png` —
     `sp88-accept-mimeparam-png` (`amc`).
   The r86/r87 forms (`image/*`, `image/png, .txt`, `application/pdf`, `audio/*`, `video/*`,
   `image/png,application/pdf`, the whitespace variant) and the r84 extension-token law
   (`.txt` into `accept=".png"`) are the controls; the whole matrix is gated by
   `accept-grammar-law`. The spec's own word for the attribute is "hint": it "may be specified to
   provide user agents with a hint of what file types will be accepted". What a user's DIALOG would
   offer or refuse is not measured by this receipt.
2. **Carried unchanged from r86** — the same-origin `tel`/`search`/`text` arms, the cross-origin
   `date`/`month`/`week`/`time`/`number`/`range`/`tel`/`search`/`text` `SecurityError`, the
   origin-before-mutability order discriminator, the directory answer with `webkitRelativePath`,
   `multiple` → `selectMultiple`, the second-chooser payload answer, and the same-origin
   `type=color` activated arm (`undefined`, activation consumed, no input/change, zero file
   choosers). The r88 counter re-derives all of them (99 checks).

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

## Limits the wave established (r88)

- **The pins are declaration-level in the counter.** `driver-pin` and `fixture-hash` compare receipt
  fields to the CLI pins; the counter never opens the instrument bytes. R87Sentinel re-derived the
  fixture (`10e444f7…`) and child (`bbb22189…`) hashes from the pinned driver + the r78 template +
  this receipt's nonce/child port, so the fixture is verifiable out-of-band, not by the counter.
- **Per-leg attribute copies are not separately witnessed.** The accept fact binds through the
  top-level `fixtureInputs` snapshot (copied from the first leg's read); the honest receipt has 0/34
  divergent per-leg copies, but a per-leg copy can disagree with no finding.
- **The comma/whitespace normalization rules are not on the staged page.** They live on the two
  linked pages the Scout opened; the whitespace leg measures the raw attribute string and nothing
  about a user agent's tokenisation.
- **The delivered bytes still carry an r83 marker** — the PNG body ends `tabi-r83-png\n` and the
  text body is `tabi-r83-answer-alpha\n`, under the r88 file names `tabi-r88-b.png` /
  `tabi-r88-a.txt`. The names and hashes are what the counter binds; the content marker is inherited
  fixture bytes, not a wrong-generation artifact. The r88 driver writes the `tabi-r88-*` names;
  the r87 driver wrote `tabi-r87-*` — the r88 counter binds the r88 names.

## Frontier (named, not held)

- The parser's whitespace/comma normalization read from the DOM rather than the raw string.
- A same-element origin comparison (an input reachable from both origins via a `postMessage` proxy)
  — not constructible in the current loopback fixture.
- What a `type=color` same-origin call does to the colour popup itself (not a CDP file-chooser
  event) — needs a UI-side probe or a source-side reading of the colour chooser path.
