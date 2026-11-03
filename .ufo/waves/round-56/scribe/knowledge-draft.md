# Chromium control-domain key events on the Linux host — round 56 (DRAFT)

> DRAFT for the L1. Every number that depends on the live Chromium run is `<<DATA>>` and is
> filled by the L1 after the data pass. Static text is copied from the frozen claim
> (`.ufo/waves/round-56/claims.json`, C2) and from the round-56 source re-opens
> (`.ufo/waves/round-56/scribe/source-gate.md`, `.ufo/waves/round-56/scribe/reopen-receipt-round-56.json`).
> This file lives in the wave dir; the L1 lands it as `corpus/knowledge/chromium-control-keys-round-56.md`.

- source: S083 (WHATWG HTML Standard, form control infrastructure — constraints and form
  submission, https://html.spec.whatwg.org/multipage/form-control-infrastructure.html, re-opened
  2026-11-03, 466,321 B, sha256 `2e70de253aa945567c94ec95bb343de523fc28ea5f390b5f8e1bea801302b3b8`
  — the registry anchor's round-55 raw digest `dc7c3088…` at the same byte count no longer
  matches, so the anchor cell needs the round-56 digest appended), S153 (Chrome DevTools
  Protocol `json/browser_protocol.json`, https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json,
  re-opened 2026-11-03, 1,423,170 B, sha256
  `d6737c31f268ed74e65dde393006dd9c590a713febd2361d734722eb059f31e7` — the `@master` ref moved
  from the anchored `f60f0c02…` at 1,421,620 B, so the anchor cell needs the round-56 digest
  appended) and S161 (W3C UI Events, KeyboardEvent modifier attributes,
  https://www.w3.org/TR/uievents/, re-opened 2026-11-03, 920,762 B, sha256
  `8ded5eaf4f190b13c59582d5e92b81d3585112dde963d71d65d8e5991212b918` — byte-identical to the
  registered anchor). The located ground, verbatim in the staged bytes:
  **S083** §4.10.22.2 *Implicit submission*: `hitting the "enter" key while a text control is
  <a id=implicit-submission:focused href=interaction.html#focused>focused</a> implicitly submits`
  (the sentence continues `the form`); **S153** `Input.dispatchKeyEvent` → parameter
  `modifiers`: `Bit field representing pressed modifier keys. Alt=1, Ctrl=2, Meta/Command=4,
  Shift=8\n(default: 0).`, with the `text`, `code` and `key` parameters in the same command entry;
  **S161** §3.5.1 *Interface KeyboardEvent*, attribute `ctrlKey`:
  `<code>true</code> if the <code class="keycap">Control</code> (control) key modifier`, with
  `shiftKey`, `altKey` and `metaKey` alongside.
- verified-at: 2026-11-03, live run on the Linux host's Chromium 155 headless surface (loopback
  CDP, throwaway profile) — browser build string `<<DATA>>`, nonce `<<DATA>>`, receipt
  `corpus/evidence/round56/chromium-control-keys/receipt.json` (sha256 `<<DATA>>`), counter
  `.ufo/waves/round-56/counters/chromium-receipt-r56.mjs` (exit `<<DATA>>`, findings
  `<<DATA>>`, couldNotEvaluate `<<DATA>>`), driver `scripts/chrome-cdp-loopback-round56.mjs`
  (pinned digest `<<DATA>>`), evidence tree `<<DATA>>` files under
  `corpus/evidence/round56/chromium-control-keys/` (six per-step PNGs + the receipt), counter
  selftest `<<DATA>>`/`<<DATA>>` at the freeze commit, cross-refusals: the r55 webview2 counter
  on the r56 receipt refuses (schema mismatch) and the r56 counter on the r55 webview2 receipt
  refuses.
- recheck: on the next runner-generation round, or on any Chromium-class runtime change to the
  Input-domain key contract or to DOM keyboard-event behavior. All three anchors are byte-pinned,
  so spec/protocol drift is detectable by sha256: S161 is currently byte-identical to its anchor,
  while S083 and S153 have moved and their located ground was re-verified verbatim in the fresh
  bytes (grep counts: S083 1, S153 1 scoped to the `dispatchKeyEvent` block, S161 1).

## The surface C2 measures (copied from the frozen claim, not restated)

Claim C2 (`claims.json`, axis coverage, capability `chromium-keyevent-control-keys-linux`):

> On the Linux host's Chromium 155 headless surface (loopback CDP, throwaway profile) the form
> fixture's control-domain key leg runs with page-side DOM witnesses: End re-anchors the caret
> with the NEGATIVE EDIT WITNESS (field value unchanged), Backspace deletes exactly the last
> character with exact restore, Tab moves focus field->field2 witnessed by
> document.activeElement, and one Enter keyDown from the tabbed-to field drives the implicit
> submission witnessed server-side and client-side. The frozen counter scores the committed
> receipt green with 0 findings.

Expected after-state (frozen): counter exit 0, predicate true, findings `[]`, couldNotEvaluate
`[]`; evidence tree >= 7 files; counter selftest `<<DATA>>`/`<<DATA>>` at the freeze commit;
cross-refusals symmetric (the r55 webview2 counter refuses the r56 receipt; the r56 counter
refuses the r55 webview2 receipt). Expected before-state (frozen, the do-nothing control): the
baseline evidence tree is EMPTY and the counter refuses an absent receipt with `receipt-missing`.

## Witness list (page-side DOM + server side), one row per leg

| leg | key dispatched | page-side witness | server-side witness | ground |
|---|---|---|---|---|
| End (caret anchor) | `key: "End"`, `code: "End"`, keyDown+keyUp, no `text` | the field's DOM value read back UNCHANGED — the NEGATIVE EDIT WITNESS | none (no request) | S153 `dispatchKeyEvent` `key`/`code` parameters; S161 `key`/`code` semantics |
| Backspace (edit) | `key: "Backspace"`, `code: "Backspace"`, keyDown+keyUp, no `text` | field value == nonce minus EXACTLY its last character, then the value witnessed RESTORED | none (no request) | S153 `dispatchKeyEvent` (`key`, `code`, `text` parameters) |
| Tab (focus) | `key: "Tab"`, `code: "Tab"`, keyDown+keyUp, no `text` | the page's OWN `document.activeElement` moves `field` -> `field2` | none (no request) | S153 `dispatchKeyEvent` `key`/`code` parameters |
| Enter (implicit submission) | ONE keyDown WITH `text` `\r`, dispatched FROM the tabbed-to field | the implicit submission navigates the document (the keylog dies with it — disclosed asymmetry, the SUBMISSION is the witness) | the form fixture's server log records the submit request within 5 s, and the echo page renders client-side | **S083** §4.10.22.2: the implicit submission fires a click at the form's DEFAULT BUTTON, the first submit button in tree order; **S161** `ctrlKey`/`shiftKey`/`altKey`/`metaKey` are the DOM booleans the page-side recorder captures against **S153**'s modifier bit field (Alt=1, Ctrl=2, Meta/Command=4, Shift=8) |

## The ground, in the three sources' own words

- **S083** — the Enter leg's contract: the form fixture's submit button is load-bearing, because
  the implicit submission's default action is a click at the form's default button (the first
  submit button in tree order). Quote (§4.10.22.2, staged bytes line 2589): `hitting the "enter"
  key while a text control is <a id=implicit-submission:focused href=interaction.html#focused>focused</a>
  implicitly submits` — grep count 1 in the round-56 staged bytes.
- **S153** — the transport contract: the CDP `Input.dispatchKeyEvent` command's `modifiers`
  parameter is a bit field (`Alt=1, Ctrl=2, Meta/Command=4, Shift=8`), and the same command entry
  carries the `key`, `code` and `text` parameters the control leg dispatches. Quote
  (`Input.dispatchKeyEvent` → `modifiers`, staged bytes line 14323): `Bit field representing
  pressed modifier keys. Alt=1, Ctrl=2, Meta/Command=4, Shift=8\n(default: 0).` — grep count 1
  inside the `dispatchKeyEvent` command block (5 across the whole `@master` file, in four sibling
  Input commands).
- **S161** — the DOM end of the same contract: `KeyboardEvent` carries the readonly boolean
  `ctrlKey` / `shiftKey` / `altKey` / `metaKey` attributes, so the page-side recorder's booleans
  are spec-grounded against S153's bits. Quote (§3.5.1, `ctrlKey` definition, staged bytes line
  3264): `<code>true</code> if the <code class="keycap">Control</code> (control) key modifier` —
  grep count 1; the `shiftKey` / `altKey` / `metaKey` definitions sit alongside (lines 3273 /
  3282 / 3291) and the IDL that names all four booleans is at lines 6058-6070.

## Scope honesty

- This note records what the three re-opened sources say and what the C2 run measured. It does
  NOT claim the Linux Chromium surface is the webview2 surface: round 55 ran on the Windows host
  with the Edge WebView2 runtime, and this host cannot run the webview2 surface at all. The
  capability row is a NEW, narrower one (`chromium-keyevent-control-keys-linux`), and the r55
  webview2 capability row stays as it stands.
- A "control-domain key leg works here" statement is NOT a claim that the same leg works on any
  other Chromium build; the anchors are byte-pinned and the build string is `<<DATA>>`.
- If the live run fails any leg, this note's `verified-at` block records the RED state; no
  witness is weakened to make it green.
