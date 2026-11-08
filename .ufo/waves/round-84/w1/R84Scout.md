# R84Scout — round 84 / w1: the showPicker() origin step, the Chromium origin-before-mutability check, and the `accept` token grammar

Seat: **R84Scout** (scout, read-only; leaf member — no subagent dispatch).
Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Base named in the brief: `a5d6ffbf`; freeze commit `84ebfa95`; identity commit `d90b7f55` (D `a5bdb15ec9a7`).
Milestone: *open the sources for the tel/search/text SecurityError and the accept token grammar.*
Axis judged: **coverage**.

Fetched bytes lived under `$HYAKU_SCRATCH/tabi-r84/R84Scout/sources/` (default `/fast/scratch/hyaku`); they
were deleted before this report was written. The durable receipts are
`w1/R84Scout-FETCH.txt` (URL | status | wire bytes | wire sha256 | decoded bytes | decoded sha256) and the
quote→byte-offset table in §4 below. No SOURCES row was appended; `corpus/SOURCES.md` is untouched. No git
command in this seat mutated anything (`git status --porcelain`, `git diff`, `git log`, `git show` only).
No tool was installed or upgraded this round (nothing needed).

---

## 0. The three requested answers, up front

| # | Question | Answer | Source | r84 measurement agrees? |
|---|----------|--------|--------|---------------------------|
| 1 | WHATWG `showPicker()` — the cross-origin iframe step and the `file`/`color` exemption | The `SecurityError` step fires when the element's relevant settings object's origin is **not same origin with its top-level origin** and the element is a select or its `type` is **not in the File Upload state or Color state**; File and Color inputs are **exempted from that check** | S219 (§4.10.5.4) | **Yes** — legs 12–14 (`tel`/`search`/`text`) each threw `SecurityError` and opened no chooser; the carried `color` leg is exempt. One caveat: the *order* of the spec's steps differs from Chromium (§2). |
| 2 | Chromium 155.0.8059.84 `html_input_element.cc` — the origin check that runs before the mutability check | `HTMLInputElement::showPicker` runs the origin check **first** (`FormControlType() != kInputFile && … != kInputColor` → `frame->IsSameOrigin()` → `ThrowSecurityError`), and only then `!isMutable()` → `InvalidStateError`, then the gesture check | S220 (lines 2652–2682) | **Yes, and it is the reason the order law exists** — the spec orders mutability *first*, Chromium orders origin *first*. The r84 order-law leg matches Chromium, not the spec's step order. |
| 3 | The `accept` attribute's token grammar | `accept` must be a **set of comma-separated tokens**, each an **ASCII case-insensitive match** for exactly one of: `"audio/*"`, `"video/*"`, `"image/*"`, a **valid MIME type string with no parameters**, or a string **whose first character is U+002E FULL STOP** (an extension). Duplicates are disallowed; the UA must split the value **on commas** | S223 (§4.10.5.1.17) | **Partly** — the r84 legs exercise **only the extension-token branch** (`accept=".png"`). The MIME-token (`image/png`) and `image/*` forms are **not** enumerated by any leg, exactly as the r83 Erratum and the r84 lesson's rejected claim state. See §5 for the one place where the *counter's own comment* still carries the pre-correction phrasing. |

---

## 1. WHATWG HTML — `showPicker()`, the cross-origin iframe step and the File/Color exemption

**URL:** `https://html.spec.whatwg.org/multipage/input.html`
**HTTP:** 200 · `content-length: 687515` · `last-modified: Fri, 06 Nov 2026 22:04:01 GMT` · `etag: "6aee4ed1-a7d9b"`
**bytes:** 687 515 · **sha256:** `b0202de1c0b422d94d7aa23b4f1b0e3126d9d044bf7076394b6e00451f0fcd16`
**Locator:** § **4.10.5.4 "Common input element APIs"** (`id=common-input-element-apis`, raw line 5552);
the method steps are the `<ol>` at raw lines **5829–5841**, under the `dom-input-showpicker` dfn (line 5827).
Canonical fragment: `https://html.spec.whatwg.org/multipage/input.html#dom-input-showpicker`.
This is the **living** page (S219's row records the same 687 515 B and the same `b0202de1c0b4…` prefix on
2026-11-07): **the bytes are unchanged since the r83 fetch** — no drift.

### Q1 — the cross-origin iframe step, part 1: the origin comparison (23 words by `wc -w`)

> If this's relevant settings object's origin is not same origin with this's relevant settings object's top-level origin, and this is a select element,

Locator: raw HTML line **5832**, bytes **658296–659427** in `whatwg-input.html`.

### Q2 — the cross-origin iframe step, part 2: the type-state condition and the thrown exception (18 words by `wc -w`)

> this's type attribute is not in the File Upload state or Color state, then throw a "SecurityError" DOMException.

Locator: raw HTML line **5835**, bytes **659537–660246**.

Q1+Q2 together are the whole of step 2 (42 words, quoted in two ≤25-word pieces for the budget).

### Q3 — the spec's own exemption note (20 words by `wc -w`)

> File and Color inputs are exempted from this check for historical reason: their input activation behavior also shows their pickers,

Locator: raw HTML line **5838**, bytes **660374–660705** (the `<p class=note>` immediately after step 2).

**This is the direct answer to (1): the exemption set is exactly {File Upload, Color}.**
`tel`, `search` and `text` are in neither state, so the cross-origin `SecurityError` applies to all three —
which is what legs 12–14 measured.

**Coverage caveat worth recording (source-text observation, not a claim change).** The step-2 sentence as
written mixes `,` and `or` such that a bare precedence reading yields
`(origin-mismatch AND is-select) OR (type-not-in-file-or-color)`, which would throw for a *same-origin*
`type=text`. The note (Q3) is what disambiguates it: the exemption is from *the origin check*, so the
intended reading is `origin-mismatch AND (is-select OR type-not-in-file-or-color)`. Chromium implements
exactly that reading (§2). The r84 measurement is on the intended reading; the spec's own prose, not the
measurement, is where the ambiguity lives.

**A second source-text detail the measurement does not distinguish.** The spec compares against the
**top-level** origin, not the parent frame's. Chromium's `frame->IsSameOrigin()` does the same — see §2.1
— so the two agree, and the r84 fixture (a direct cross-origin child of the top document) cannot
discriminate a nested "same-origin with parent, cross-origin with top" case. That remains unmeasured; it is
a *source-consistent* gap, not a disagreement.

### Does r84 agree with this source text?

**Yes for the exemption set and the SecurityError.** Receipt `corpus/evidence/round84/chromium-showpicker/receipt.json`
(`nonce tabi-r84-l1-a5bdb15ec9a7`, `driverSha256 f436b229…`, `fixture sha256 64817252…`) carries:

```
legs[12] sp84-cross-origin-tel    | {"ok": false, "name": "SecurityError", "message": "Failed to execute 'showPicker' on 'HTMLInputElement': showPicker() called from cross-origin iframe."} | choosers 0
legs[13] sp84-cross-origin-search | {"ok": false, "name": "SecurityError", "message": "Failed to execute 'showPicker' on 'HTMLInputElement': showPicker() called from cross-origin iframe."} | choosers 0
legs[14] sp84-cross-origin-text   | {"ok": false, "name": "SecurityError", "message": "Failed to execute 'showPicker' on 'HTMLInputElement': showPicker() called from cross-origin iframe."} | choosers 0
```

Zero `Page.fileChooserOpened` on each (the "opens nothing" half of the claim), and
`parentCrossAccess = {contentDocument: null, windowDocument: "SecurityError"}` on each — the parent cannot
reach the child document, so the child frame really is cross-origin to the top. The carried
`sp84-cross-origin-color` leg is `{ok: true, ret: "undefined"}` with 0 choosers, i.e. exempt per Q3 (Chromium
proceeds past the origin gate, consumes the transient activation, and opens a *color* picker, which is not a
file chooser — hence no `Page.fileChooserOpened`).

The `SecurityError` *message* is Chromium's own string, so the legs discriminate the Chromium branch
(`html_input_element.cc:2661`), not the spec text. The spec text supplies the *prediction* (which types are
exempt); the measurement confirms it for `tel`/`search`/`text`.

---

## 2. Chromium 155.0.8059.84 — `html_input_element.cc`, the origin check before the mutability check

**URL:** `https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/renderer/core/html/forms/html_input_element.cc?format=TEXT`
**HTTP:** 200 · **wire bytes:** 135 428 (base64) · **wire sha256:** `81b35d96184a983226f888faa5ac4f9a57be7aa882e9bb4b5d6d09650b7f1b10`
**decoded:** 101 570 bytes, 2 818 lines · **decoded sha256:** `405b52c70185820ead77b2338f054eb8220fdc7ef176de671db63c349282e96d`
S220's row records "fetched 135,428 B base64, decoded 2,818 lines, sha256 405b52c70185" — **identical**, so
the tag-pinned file has not changed.

### Q4 — the origin check, which runs FIRST (23 words by `wc -w`)

```
  if (FormControlType() != FormControlType::kInputFile &&
      FormControlType() != FormControlType::kInputColor && frame) {
    if (!frame->IsSameOrigin()) {
      exception_state.ThrowSecurityError(
          "showPicker() called from cross-origin iframe.");
      return;
    }
  }
```

Locator: `third_party/blink/renderer/core/html/forms/html_input_element.cc` @ tag 155.0.8059.84,
**lines 2657–2664**, bytes **96260–96546** of the decoded file. `HTMLInputElement::showPicker` spans
lines **2652–2682**.

Two things are visible in one quote, and both matter for the claim:

* the guard `FormControlType() != kInputFile && … != kInputColor` — **file and color never enter the origin
  check at all**, which is Chromium's implementation of the spec's exemption note (Q3);
* `frame->IsSameOrigin()` is the origin test.

### Q5 — the mutability check, which runs SECOND (14 words by `wc -w`)

```
  if (!isMutable()) {
    exception_state.ThrowDOMException(
        DOMExceptionCode::kInvalidStateError,
        "HTMLInputElement::showPicker() cannot be used on immutable controls.");
    return;
  }
```

Locator: same file, **lines 2666–2671**, bytes **96547–96751**. The gesture check follows at lines 2673–2678.

**Q4 precedes Q5 in the source.** That is the source-level statement of the "origin-before-mutability"
discriminator the r84 counter checks as `order-law`, and it is exactly the reading the r81 source flip asked
for ("a source reading that shows Chromium's branch order at this tag").

### 2.1 Corroborating fetch — what `IsSameOrigin()` compares against

`https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/renderer/core/frame/local_frame.cc?format=TEXT`
→ wire 240 040 B (base64) `d5a9eacaef62ae4cd0873fefa83050c2ddb406f501819fd31cc5813c01e83898`;
decoded 180 028 B, 4 599 lines, `f314885f156e923a88eed7087b00c99aa0f55d13787aebb15398fc88fa5a9d7f`.

`LocalFrame::IsSameOrigin()` (lines 4453–4460) compares the frame's own security origin with
**`Tree().Top()`'s** security origin — i.e. the **top-level** origin, matching the spec's "top-level origin"
wording in Q1, not the parent frame's origin. (Read-only supporting fetch, not a registry row.)

### 2.2 Corroborating fetch — the `select` branch of the spec step

`…/third_party/blink/renderer/core/html/forms/html_select_element.cc?format=TEXT` → wire 115 240 B (base64)
`66510d2d177ab6202c233477b65d1192b7c59e5a658861652b7282c6a1a4363d`; decoded 86 429 B,
`c7498d99eac696cb2ce8a0993080c0492ad7accbaf4b689c21cc10379908d19e`.

`HTMLSelectElement::showPicker` (lines 1810–1847) throws the same `SecurityError` on `!frame->IsSameOrigin()`
with **no** file/color exemption — the select half of the spec's step-2 condition, unimplemented differently
from the input half, exactly as the spec's "this is a select element, or …" reads.

### Does r84 agree with this source text?

**Yes for the branch order, and the measurement is the reason the r84 `order-law` check has content.**
Receipt, the two halves of the discriminator:

```
legs[1]  sp84-cross-origin-nonfile-disabled  childResult = SecurityError ("showPicker() called from cross-origin iframe.")
legs[6]  sp84-same-origin-nonfile-disabled  showPicker = {"ok": false, "name": "InvalidStateError",
        "message": "Failed to execute 'showPicker' on 'HTMLInputElement': HTMLInputElement::showPicker() cannot be used on immutable controls."}
```

Same call (a *disabled* `type=date` input, `showPicker()`), two origins, two different exceptions — the
page-observable consequence of Q4 preceding Q5.

**And here is the one place where r84 does NOT match the spec text — by design, and it must not be read as
a spec conformance claim.** The spec orders the steps: step 1 is *"If this is not mutable, then throw an
`InvalidStateError`"* (10 words; raw line **5830**, bytes **657685–658284**), step 2 is the origin
`SecurityError`.
Chromium checks the origin first. So a spec-literal reading would give `InvalidStateError` for
`legs[1]`; Chromium gives `SecurityError`, and the measurement follows Chromium.

The lane's own records already hold this correctly and r84 carries it unchanged:
`corpus/knowledge/chromium-showpicker-runtime-round-81.md:22-24` ("Chromium checks the origin before
mutability; **the spec orders mutability first**"), `round-81.md:34-37` (reject "the order discriminator
proves the spec's order is wrong" — "S219's step order is the spec's, not a defect"), and
`corpus/knowledge/chromium-showpicker-runtime-round-84.md:31-33` (the order discriminator is carried as a
Chromium fact, not a spec claim). **Nothing in the r84 record claims spec-order conformance**, so there is no
drift here — this is a confirmation, and it is the correct confirmation.

---

## 3. The `accept` attribute's token grammar

**URL:** the same `https://html.spec.whatwg.org/multipage/input.html` (S223's row — same file, different
section). **Locator:** § **4.10.5.1.17 File Upload state (type=file)** — the `<h6 id="file-upload-state-(type=file)">`
at raw line 4004, and the `accept` attribute's own `<dfn id=attr-input-accept>` at raw line **4066**
(the only `id=attr-input-accept` in the document — the attribute is defined exactly once).
Canonical fragment: `https://html.spec.whatwg.org/multipage/input.html#attr-input-accept`.

### Q6 — the grammar's opening: a set of comma-separated tokens (21 words by `wc -w`)

> If specified, the attribute must consist of a set of comma-separated tokens, each of which must be an ASCII case-insensitive match

Locator: raw HTML line **4070**, bytes **423775–424203**.

### Q7 — the extension-token form (12 words by `wc -w`)

> A string whose first character is a U+002E FULL STOP character (.)

Locator: raw HTML line **4073**, bytes **424812–424878** — the last `<dt>` of the five-form list whose other
entries are `"audio/*"`, `"video/*"`, `"image/*"` and "A valid MIME type string with no parameters"
(8 words, line 4073, bytes 424488–424744).

### Q8 — the splitting rule (10 words by `wc -w`)

> the user agent must split the attribute value on commas.

Locator: raw HTML line **4077**, bytes **425297–425515**. The same paragraph adds that duplicates are
disallowed (19 words: "The tokens must not be ASCII case-insensitive matches for any of the other tokens
(i.e. duplicates are not allowed)." — line 4075, bytes 424962–425245).

### Q9 — the "hint" framing the r83 erratum leans on (18 words by `wc -w`)

> attribute may be specified to provide user agents with a hint of what file types will be accepted.

Locator: raw HTML line **4067**, bytes **423664–423764** — the sentence introducing the `accept` dfn.

And the normative sentence about user selection (20 words, line 4088, bytes 425976–426090): "User agents
should prevent the user from selecting files that are not accepted by one (or more) of these tokens." —
a SHOULD about **the user's selection in the dialog**, not a validation rule on the element's file list.
The r81 lesson already leans on this: reject "`accept` filters a programmatic answer" (`round-81.md:40-42`).

### Does r84 agree with this source text?

**Yes on the branch r84 measured, and the source text explains exactly why the answer law holds.**
The answered input is `#k`, whose `accept` attribute is **`.png`** — by Q7, the *extension* token form.
The r83 Erratum (`corpus/knowledge/chromium-showpicker-runtime-round-83.md`, `## Erratum (round 84…)`, item 1)
and the r84 lesson's rejected claim both state this correction, and the r84 receipt confirms it:
`fixtureInputs` entry `{ id: "k", type: "file", accept: ".png" }`.

The `image/png` string in the r84 "accept-MIME" leg is the **delivered file's media type**, not an `accept`
token. No r84 leg exercises a MIME-token accept or an `image/*` accept: the only other `accept`-bearing
input, `#accept` (`accept="image/png"`), lives in the **cross-origin child document** and is targeted by no
leg; the parent's accept-bearing input is only `#k`.

So: r84's accept coverage = the **extension-token branch only** (and the "hint, not validator" behaviour
that Q9's "hint" framing and the 4088 SHOULD support). The **MIME-token** and **`image/*`** branches remain
unenumerated. The r84 lesson's rejected claim — "`accept` validates by extension — one extension token
(`.png`) measured; the MIME-token and `image/*` forms are unexercised" — is exactly what the source text and
the receipt support.

---

## 4. Quote → locator table (every quote byte-verified against the fetched bytes)

`wc -w` was run on the quote text alone (one quote per line, no markup).

| # | File | Raw line(s) | Byte range | Words (`wc -w`) |
|---|------|-------------|------------|------------------|
| Q1 | `whatwg-input.html` | 5832 | 658296–659427 | 23 |
| Q2 | `whatwg-input.html` | 5835 | 659537–660246 | 18 |
| Q3 | `whatwg-input.html` | 5838 | 660374–660705 | 20 |
| Q4 | `chromium-html_input_element-155.cc` | 2657–2664 | 96260–96546 | 23 |
| Q5 | `chromium-html_input_element-155.cc` | 2666–2671 | 96547–96751 | 14 |
| Q6 | `whatwg-input.html` | 4070 | 423775–424203 | 21 |
| Q7 | `whatwg-input.html` | 4073 | 424812–424878 | 12 |
| Q8 | `whatwg-input.html` | 4077 | 425297–425515 | 10 |
| Q9 | `whatwg-input.html` | 4067 | 423664–423764 | 18 |
| — | `whatwg-input.html` (MIME form) | 4073 | 424488–424744 | 8 |
| — | `whatwg-input.html` (no-duplicates) | 4075 | 424962–425245 | 19 |
| — | `whatwg-input.html` (user-selection SHOULD) | 4088 | 425976–426090 | 20 |

Verification method (all "exact" = the quote re-extracted from the fetched bytes is byte-identical after
tag-stripping and whitespace-collapsing): a tag-aware normaliser was run over the fetched HTML, mapping every
normalised character back to its raw byte offset; each quote was then located in the normalised stream and
its raw byte range re-extracted and compared. All twelve ranges round-trip exactly.

Commands (representative; all ran from the scratch sources dir):

```
$ curl -sS -L -D headers-whatwg.txt -o whatwg-input.html 'https://html.spec.whatwg.org/multipage/input.html'
$ curl -sS -L -D headers-chromium.txt -o chromium-html_input_element-155.txt \
    'https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/renderer/core/html/forms/html_input_element.cc?format=TEXT'
$ base64 -d chromium-html_input_element-155.txt > chromium-html_input_element-155.cc
$ wc -c whatwg-input.html chromium-html_input_element-155.txt chromium-html_input_element-155.cc
  687515 chromium-html_input_element-155.txt → 135428 chromium-html_input_element-155.cc → 101570
$ sha256sum …
  b0202de1c0b422d94d7aa23b4f1b0e3126d9d044bf7076394b6e00451f0fcd16  whatwg-input.html
  81b35d96184a983226f888faa5ac4f9a57be7aa882e9bb4b5d6d09650b7f1b10  chromium-html_input_element-155.txt
  405b52c70185820ead77b2338f054eb8220fdc7ef176de671db63c349282e96d  chromium-html_input_element-155.cc
$ wc -w <quote-file>…        # one quote per file
  18 20 23 21 12 10 18 23 14 …
```

---

## 5. Coverage findings for the integrator (observations; no claim, pin, counter or prior is proposed for change)

1. **The three source rows the r84 record leans on re-open byte-identically.** S219/S223 (living WHATWG page,
   687 515 B, `b0202de1c0b4…`) and S220 (tag-pinned `html_input_element.cc`, base64 135 428 B → 101 570 B /
   2 818 lines, `405b52c70185…`) match their registry rows exactly, so the r84 "carried rows re-opened"
   statement is verifiable, not asserted. **No new SOURCES row is warranted** and none was appended.

2. **The r84 claim's `legs 12..14` labelling is correct.** In the receipt's zero-based `legs` array,
   indices 12/13/14 are `sp84-cross-origin-tel` / `-search` / `-text`; all 15 r83 legs are carried
   (set difference of the two receipts' leg names is empty in that direction) and the three new legs are the
   only additions. The counter's `LEG_ORDER`/`plan-frozen` checks bind that order.

3. **The spec's `SecurityError` step is ambiguous in its own prose** (Q1+Q2 read as one sentence admit a bare
   precedence reading that would throw for a same-origin `type=text`); the exemption note Q3 is the
   disambiguator, and Chromium implements the intended reading. The r84 measurement is on the intended
   reading. This is a **source-text** observation; the lane's `accept`/`showPicker` laws are unaffected.

4. **The spec compares against the top-level origin and Chromium does too** (`LocalFrame::IsSameOrigin()` →
   `Tree().Top()`), but the r84 fixture has a single cross-origin level, so a nested
   "same-origin-with-parent, cross-origin-with-top" frame is **not** discriminated by the r84 legs. Source-
   consistent, unmeasured. The same one-level limit applies to the `select` element branch (Q1's "this is a
   select element"), which no r84 leg touches at all — `html_select_element.cc` has no file/color exemption
   and so throws in the same cross-origin situation.

5. **The accept token grammar is still only one branch deep in the measurement** (§3): extension token
   `.png` measured; MIME token `image/png` and `image/*` unmeasured. The r83 Erratum, the r84 lesson's
   rejected claim and the r84 knowledge note's "what a receipt of this shape cannot prove" all say this
   correctly.

6. **One wording drift inside the frozen r84 counter, for the integrator's awareness only.** The counter's
   comment above the `sp84-accept-mime-answer` check reads *"the accept-MIME answer: a real PNG answered
   into an accept=".png" input is accepted and delivers its bytes (the accept token grammar: extension vs MIME
   vs image/\*)"* (`scripts/check-showpicker-r84.mjs:585-586`). The leg's own text is accurate (the input
   carries `.png`), but the parenthetical names the three token forms as if the grammar were enumerated, while
   the leg exercises **only the extension branch** — precisely the wording the r83 spot-check routed as
   defect 1 and the r83 Erratum corrected *in the records*. The correction is present in the records
   (r83 knowledge note `## Erratum` item 1; r84 lesson row 1 and its rejected claim; the r84 knowledge
   note's "not enumerated" line), so **the record is correct**; the frozen counter's comment still carries
   the pre-correction phrasing. The counter is pinned (`e88e9fc7a7f5…`) and must not be edited — this is
   reported, not proposed for change.

7. **Everything else about the r84 accept rows holds.** `fixtureInputs` entry `k` carries `accept: ".png"`;
   the `#accept` input with `accept="image/png"` is in the cross-origin child document and is targeted by no
   leg; `image/png` in the r84 laws is the delivered file's media type (`PNG.type`), not an accept token.

---

## 6. Commands run (all read-only; nothing in the lane tree was modified by this seat)

```
$ git -C /home/vgpnk/Projects/shokunin/tabi-shokunin status --porcelain     # read-only
$ git -C … log --oneline -3 ; git -C … show HEAD:.ufo/waves/round-84/freeze.txt | sha256sum
  a5bdb15ec9a78b86035cce91bd5e61ec38360c1102b4c6d1ca9c5142536db0fe   # matches the brief's D a5bdb15ec9a7
$ sha256sum scripts/{chrome-cdp-showpicker-round84,check-showpicker-r84,negatives-showpicker-r84,kill-power-r84,selftest-r84-gates,check-record-drift-r84}.mjs
  f436b229df3a9194f074d9489dbeed54a24081afaae3d3027ff46aad4198807e  scripts/chrome-cdp-showpicker-round84.mjs   # = freeze.txt
  e88e9fc7a7f5f4ca47c2aca40b77cf6d93a0347dfdf5f60e427ba036b3d315a7  scripts/check-showpicker-r84.mjs           # = freeze.txt
  828dfcb7b0d4c467341411f3fd211682add7294474d910d426f0aab415103cba  scripts/negatives-showpicker-r84.mjs       # = freeze.txt (HEAD)
  b38fa9845d5fefff679412f5722edcde8ce95f00e61c65350e8cc1bbaa7edb87  scripts/kill-power-r84.mjs                 # = freeze.txt
  0f4d6ec0bad8c66b0251fe86ea96e72fadc4635b2f7464439ecbefdc67630b48  scripts/selftest-r84-gates.mjs            # = freeze.txt
  31a3b0f4ca8e6f4fe719c0120203c00837edb235540b4e1a82eadb3530330fcf  scripts/check-record-drift-r84.mjs          # = freeze.txt
```

Note for the integrator (not a claim change, and not this seat's to resolve): the **working tree** copy of
`scripts/negatives-showpicker-r84.mjs` hashes `42fcfedc164fbe2185a52a720b0cfa788abd9e98a609757723de54eb7296e431`,
while `HEAD` and `freeze.txt` both carry `828dfcb7b0d4…`; the uncommitted delta is the three new leg mutators
plus three new law cases (`cross-origin-tel-law`, `cross-origin-search-law`, `cross-origin-text-law`) and the
matching `LEG_ALSO` entries. That is the r84 battery-coverage repair the lesson's Mistakes table describes,
still uncommitted at the time of this report. Reported so the integrator sees the working-tree pin state; no
edit is proposed here.

Scratch (`/fast/scratch/hyaku/tabi-r84/R84Scout/`) was removed after the receipts above were copied into the
wave dir. No commit was made.
