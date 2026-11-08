---
source: S224 (WHATWG HTML §2.3.8 — the set of comma-separated tokens), S223 (WHATWG HTML — the file-upload state's `accept` attribute as a hint), S219 (WHATWG HTML `showPicker()` steps — the SecurityError and its File/Color exemption), S216 (the normative algorithm), S221/S222 (CDP Page/DOM domain, carried); receipt `corpus/evidence/round89/chromium-showpicker/receipt.json` (driver `scripts/chrome-cdp-showpicker-round89.mjs`, pin in `.ufo/waves/round-89/freeze.txt`)
verified-at: 2026-11-08 (round 89, Linux host, Chromium 155.0.8059.84 `--headless=new`)
recheck: `node scripts/check-showpicker-round89.mjs --lane <ABS lane> --receipt corpus/evidence/round89/chromium-showpicker/receipt.json --expect-driver-sha256 76b69b4f691d24c8c94a92897e33635d2386b9191f5aaa66640515dc998bd2d0 --expect-nonce tabi-r89-l1-7bde5e6c2f2d --expect-fixture-sha256 69acad5754e0effb480771dd68197c26815bf0aabd4e76afe63ce09ca462c5ed --prior-set .ufo/waves/round-89/controls/c1/prior-set.txt --json` → exit 0, 107 checks
---

# Programmatic picker generation r89 — the DOM-parsed token list

Generation r89 of the held capability `chromium-showpicker-linux` (SCORECARD). Forty-one legs, one
fresh browser per leg. Round 88 left one accept-law frontier open: the parser's
whitespace/comma normalization read from the DOM rather than the raw string. Every leg of every
earlier generation read the raw `accept` attribute string from the page (`fixtureInputs`); no leg
read the parsed form. This generation measures the parsed form: each of the four new legs re-reads
`window.__inputs()` on the page at settle (`domRead`), and the counter binds BOTH the raw string
AND the DOM-parsed token list.

## The measured laws

1. **`accept` is not a validator on a programmatic answer — now over a DOM-parsed token list
   (the four legs are fixture-emulated tokenization, not Chromium's parser).** Every leg delivers
   a file through `DOM.setFileInputFiles` to an input whose DOM-parsed token list is read back
   from the page at settle (`domRead`), and in every case the delivered file lands in the input's
   `files` list with its bytes, fires trusted `input`+`change`, and the page reads the bytes back
   (`read` event `ret: 'hex:…'`); `Page.fileChooserOpened` carries `selectSingle`. The new legs
   (this generation), each on a page input whose raw `accept` AND parsed tokens are bound:
   - `accept="image/*"` answered with `text/plain` — `sp89-accept-domread-text` (input `aw`,
     tokens `["image/*"]`);
   - `accept="image/png, .txt"` answered with `image/png` — `sp89-accept-domread-png` (`am`,
     tokens `["image/png", ".txt"]`);
   - `accept="image/png,application/pdf"` answered with `text/plain` —
     `sp89-accept-domread-multimime` (`a2`, tokens `["image/png", "application/pdf"]`);
   - `accept="  image/png ,  .txt  "` (whitespace variant) answered with `image/png` —
     `sp89-accept-domread-whitespace` (`aws`, tokens `["image/png", ".txt"]`).
   The fixture's tokenization is comma-split, ASCII-whitespace-trimmed and ASCII-lowercased —
   the WHATWG §2.3.8 "set of comma-separated tokens" delimited (a token is separated from the
   next by a single U+002C COMMA, neither beginning nor ending with ASCII whitespace, optionally
   surrounded by it). What the fixture does NOT do varies with the input: two legs deliver a
   `text/plain` file onto a token list that does not admit it (`image/*`, `image/png,application/pdf`),
   which strengthens rather than narrows the law — even a token mismatch does not filter a
   programmatic answer. The spec's own word for the attribute is "hint": it "may be specified to
   provide user agents with a hint of what file types will be accepted". What a user's DIALOG
   would offer or refuse is not measured by this receipt.
2. **Carried unchanged from r88** — the same-origin `tel`/`search`/`text` arms, the cross-origin
   `date`/`month`/`week`/`time`/`number`/`range`/`tel`/`search`/`text` `SecurityError`, the
   origin-before-mutability order discriminator, the directory answer with `webkitRelativePath`,
   `multiple` → `selectMultiple`, the second-chooser payload answer, the same-origin `type=color`
   activated arm, and the ten r88 attribute-string values (nine in-grammar). The r89 counter
   re-derives all of them (107 checks).

## What a receipt of this shape cannot prove

- **Acceptance is not filtering.** `DOM.setFileInputFiles` answers a chooser programmatically; the
  law says `accept` does not filter THAT path. What a user's dialog offers or rejects is not
  measured — headless opens no real dialog — and is not claimed.
- **The token list is the fixture's normalization, not Chromium's internal tokenization.** The
  page fixture splits on commas, trims every `String.trim()` character and lowercases with
  `toLowerCase()`; the counter compares that output to a constant. No leg measures Chromium's
  own parsing.
- **The settle re-read is driver-observed, not counter-enforced.** The counter binds the
  `domRead` array's two fields on the target entry; it does not require a `Runtime.evaluate`
  with `window.__inputs()` in the send log (R89Review2 F1).
- **The whitespace leg measures the fixture's split-and-trim emulation.** `"  image/png ,  .txt  "`
  → `["image/png", ".txt"]` exercises only the fixture's trim on space characters; ASCII-set
  membership (tab/newline/form-feed/CR probes) and Unicode divergence (`trim()` strips NBSP,
  `toLowerCase()` is Unicode-aware) are unmeasured, and the spec's empty-token rule is unexercised.
- **The colour arm is bounded to the file-chooser metric.** Zero `Page.fileChooserOpened` events do
  not show whether a colour popup appeared; nothing stronger is claimed.
- **The counter reads a receipt.** Its printed `limit` names the escape: a forger who shifts every
  page event by a constant offset passes the replay rule; the limit sentence prints the computed
  `absNeed` values and `limit.replayConsistency` asserts the printed math agrees with the
  threshold. Provenance is bound by the driver pin, the fixture sha and the nonce; the browser's
  own execution is not re-derived.
- **Secure-context state is not recorded.** The fixture is `http://127.0.0.1:<port>` (a
  potentially-trustworthy origin); nothing here measures a non-secure-context page.

## Limits the wave established (r89)

- **The pins are declaration-level in the counter.** `driver-pin` and `fixture-hash` compare receipt
  fields to the CLI pins; the counter never opens the instrument bytes. R89Review1 re-derived the
  fixture (`69acad57…`) and child (`7d15ea82…`) hashes from the pinned driver + the r78 template +
  this receipt's nonce/child port, so the fixture is verifiable out-of-band, not by the counter.
- **Per-leg attribute copies are not separately witnessed.** The accept fact binds through the
  top-level `fixtureInputs` snapshot plus each domread leg's own `domRead`; the per-leg
  `fixtureInputs` mirrors are unenforced on every leg including the four domread legs (the honest
  receipt has 0/41 divergent copies, but a divergent copy passes).
- **The delivered bytes still carry an r83 marker** — the PNG body ends `tabi-r83-png\n` and the
  text body is `tabi-r83-answer-alpha\n`, under the r89 file names `tabi-r89-b.png` /
  `tabi-r89-a.txt`. The names, sizes, types, hex and hashes are what the counter binds; the
  content marker is inherited fixture bytes, not a wrong-generation artifact.
- **The replay limit block asserts its own arithmetic.** `limit.replayConsistency` is a computed
  boolean in the `limit` block (not a numbered check), and the kill-power mutant that perturbs
  the replay index is its battery witness.

## Frontier (named, not held)

- A same-element origin comparison (an input reachable from both origins via a `postMessage` proxy)
  — not constructible in the current loopback fixture.
- What a `type=color` same-origin call does to the colour popup itself (not a CDP file-chooser
  event) — needs a UI-side probe or a source-side reading of the colour chooser path.
- A settle-evaluate requirement on domread legs (the counter would have to require the `window.__inputs()` evaluate in `plan-calls`).
