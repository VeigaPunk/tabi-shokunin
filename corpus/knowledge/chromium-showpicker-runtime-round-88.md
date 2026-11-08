---
source: S223 (WHATWG HTML — the file-upload state's `accept` attribute as a hint), S219 (WHATWG HTML `showPicker()` steps — the SecurityError and its File/Color exemption), S216 (the normative algorithm), S221/S222 (CDP Page/DOM domain, carried); receipt `corpus/evidence/round88/chromium-showpicker/receipt.json` (driver `scripts/chrome-cdp-showpicker-round88.mjs`, pin in `.ufo/waves/round-88/freeze.txt`)
verified-at: 2026-11-08 (round 88, Linux host, Chromium 155.0.8059.84 `--headless=new`)
recheck: `node scripts/check-showpicker-round88.mjs --lane <ABS lane> --receipt corpus/evidence/round88/chromium-showpicker/receipt.json --expect-driver-sha256 8c015fa4ea541c25cf1e0c5ba35b28ee94c11dcb4aaa8bf1baf191ecbe49b9b4 --expect-nonce tabi-r88-l1-86f1dcec --expect-fixture-sha256 8f93405128f1b0286549c470ff2e849e861af2a79b3d3cccea32dd9f27231a35 --prior-set .ufo/waves/round-88/controls/c1/prior-set.txt --json` → exit 0, 102 checks
---

# Programmatic picker generation r88 — MIME parameters, case variants, combined lists

Generation r88 of the held capability `chromium-showpicker-linux` (SCORECARD). Thirty-seven legs, one
fresh browser per leg. Round 87 measured seven token forms and named three of the remainder as
frontier: `IMAGE/PNG` (case variant), `image/png;q=0.9` (MIME parameter) and `audio/*,video/*`
(combined media-type list). This generation measures those three, one page input each.

## The measured laws

1. **`accept` is not a validator on a programmatic answer — now over ten attribute-string values,
   nine of them in-grammar.** Every leg
   delivers a file through `DOM.setFileInputFiles` to an input whose raw `accept` attribute is read
   back from the page (`fixtureInputs`), and in every case the delivered file lands in the input's
   `files` list with its bytes, fires trusted `input`+`change`, and the page reads the bytes back
   (`read` event `ret: 'hex:…'`); `Page.fileChooserOpened` carries `selectSingle`. The new legs
   (this generation):
   - `accept="IMAGE/PNG"` (upper-case variant) answered with `image/png` bytes — `sp88-accept-case-png` (input `ac`);
   - `accept="audio/*,video/*"` (combined media-type list, no space after the comma) answered with
     `text/plain` — `sp88-accept-audiovideo-text` (`au`);
   - `accept="image/png;q=0.9"` answered with `image/png` — `sp88-accept-mimeparam-png` (`amc`).
     The spec's token list admits only "A valid MIME type string with no parameters" (byte 425136),
     and the mimesniff definition excludes `;`, so this value is **not** an `accept` grammar form:
     it is a non-conforming attribute value whose behaviour the spec leaves unspecified. The leg
     therefore measures a stronger thing than a grammar form — even a value the grammar rejects
     does not filter a programmatic answer.
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
   choosers). The r88 counter re-derives all of them (102 checks).

## What a receipt of this shape cannot prove

- **Acceptance is not filtering.** `DOM.setFileInputFiles` answers a chooser programmatically; the
  law says `accept` does not filter THAT path. What a user's dialog offers or rejects is not
  measured — headless opens no real dialog — and is not claimed.
- **Ten attribute-string values, nine of them in-grammar.** The case variant (`IMAGE/PNG`) is in
  grammar ("ASCII case-insensitive match", byte 424423) and the combined list (`audio/*,video/*`)
  is in grammar (the comma-split rule, byte 425894); `image/png;q=0.9` is out of grammar by the
  spec's own wording (byte 425136). The parser's whitespace/comma normalization read from the DOM,
  and the full WHATWG "unique security error" ordering for every type, stay unmeasured.
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
  fixture (`8f93405128f1…`) and child (`2ac1101032b4…`) hashes from the pinned driver + the r78 template +
  this receipt's nonce/child port, so the fixture is verifiable out-of-band, not by the counter.
- **Per-leg attribute copies are not separately witnessed.** The accept fact binds through the
  top-level `fixtureInputs` snapshot (copied from the first leg's read); the honest receipt has 0/37
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
