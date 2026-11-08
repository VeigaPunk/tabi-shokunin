# R85Scout — round 85 w1: source-located laws for the same-origin / no-picker / activation-order triad

Seat: R85Scout (coverage axis, read-only scout). Lane `tabi-shokunin`.
Scope of this report: **locate and quote** the two primary sources that the frozen r85 laws rest on
(WHATWG HTML `showPicker()` steps; Chromium 155.0.8059.84 `HTMLInputElement::showPicker`), state
whether the chain makes the same-origin/activated `tel`/`search`/`text` case a silent no-op **by
TYPE** or by an **explicit early return**, and say whether the frozen r85 laws match the located
text. No predicate, counter, pin, prior, threshold or kill rule is proposed for amendment here; the
sources are attacked, not the instruments.

No tool was installed or upgraded by this seat (no pacman / uv / cargo / npm actions).

---

## 0. Fetched sources — URL, status, bytes, sha256

All Chromium fetches use `?format=TEXT` (base64) and are base64-decoded; both the base64 payload
and the decoded file are hashed so either can be re-verified.

| # | URL | status | bytes (payload) | sha256 (payload) | decoded bytes | sha256 (decoded) |
|---|---|---|---|---|---|---|
| S1 | `https://html.spec.whatwg.org/multipage/input.html` | 200 | 687515 | `b0202de1c0b422d94d7aa23b4f1b0e3126d9d044bf7076394b6e00451f0fcd16` | — (html) | same as payload |
| S2 | `https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/renderer/core/html/forms/html_input_element.cc?format=TEXT` | 200 | 135428 (b64) | `81b35d96184a983226f888faa5ac4f9a57be7aa882e9bb4b5d6d09650b7f1b10` | 101570 | `405b52c70185820ead77b2338f054eb8220fdc7ef176de671db63c349282e96d` |
| S3 | `…/refs/tags/155.0.8059.84/third_party/blink/renderer/core/html/forms/text_field_input_type.cc?format=TEXT` | 200 | 51344 (b64) | `2a5b3341df4b9c6e84a5ff80beee1f8bd33d1cf52c85ecf3d4a03d9b060e611c` | 38506 | `e0bf97761d2685875dae4949332a3c5627ebb72e8c3f5cec1f7f2f06e4692b5a` |
| S4 | `…/refs/tags/155.0.8059.84/third_party/blink/renderer/core/html/forms/input_type_view.cc?format=TEXT` | 200 | 11136 (b64) | `7a1d1448381d509d4bf984ccb32efefdd1570e2e35930707f37211f889e87005` | 8351 | `c382c7c17659a89a40289edb1b9adf30562aaa3a121b3172826967cc0bc79586` |
| S5 | `…/refs/tags/155.0.8059.84/third_party/blink/renderer/core/frame/local_frame.cc?format=TEXT` | 200 | 240040 (b64) | `d5a9eacaef62ae4cd0873fefa83050c2ddb406f501819fd31cc5813c01e83898` | 180028 | `f314885f156e923a88eed7087b00c99aa0f55d13787aebb15398fc88fa5a9d7f` |
| S6 | `…/refs/tags/155.0.8059.84/third_party/blink/renderer/core/page/chrome_client_impl.cc?format=TEXT` | 200 | 80532 (b64) | `b61dcba97a3ef4e772784213f45a7c0d487259175ef5ea3454736afdde96b481` | 60397 | `dadba3147698c005dd3a40345589cb6d9b64ff73c21a1b719c23fe96cc834eee` |
| S7 | `…/refs/tags/155.0.8059.84/third_party/blink/renderer/core/html/forms/file_input_type.cc?format=TEXT` | 200 | — (b64) | `7e9e63771a18bb7ef8c3310ec97583722f3d21b864fbad2a5a35eb343340e552` | 23415 | `f96265db986a6119ef805a2d74ccd505ad6eade08b6fccf5e110685f8ee9f705` |
| S8 | `…/refs/tags/155.0.8059.84/third_party/blink/public/web/web_autofill_client.h?format=TEXT` | 200 | 9384 (b64) | `26f25e0add500fb255270f14732fc9dc57ca711b91c85fa134b34b29f0cfcef0` | 7037 | `203b75bfad8951718ca2ae521aa3ed025b663a307f0b045fda93f91a81f01263` |
| S9 | `…/refs/tags/155.0.8059.84/components/autofill/content/renderer/autofill_agent.cc?format=TEXT` | 200 | 126456 (b64) | `4f000adf3b4fcda1087c8275f5e1f8d8eb003bc26fb672a9c2af2c78935535e5` | 94841 | `8bf7bba4d9cf66a18c4e88dcd3d93d630820f083a1337a5f0cf49e2993e73106` |
| S10 | `https://raw.githubusercontent.com/whatwg/html/main/source` | 200 | 8096625 | `79758127c6aa3856e8d9036de0c1df17a8bfcf5aa96d886a2b6a6435661fb375` | — (bikeshed source) | same as payload |

S1 is the URL named in the assignment. S10 is the WHATWG bikeshed source for the same prose and was
used only as an independent cross-check of the sentence text; **all quoted WHATWG words are
byte-verbatim in S1** (checked by tag-stripping the cited line ranges and substring-matching, and
re-confirmed against S10).

The `refs/tags/155.0.8059.84` tree resolves (200) — the tag exists upstream, so S2–S9 are the exact
155.0.8059.84 sources.

---

## 1. WHATWG HTML — `showPicker()` steps (source S1)

Locator for all of §1: `https://html.spec.whatwg.org/multipage/input.html`
(anchor `#dom-input-showpicker` for the method steps, `#show-the-picker,-if-applicable` for the
"show the picker" algorithm, `#input-support-picker` for the picker-support definition).
Line numbers are lines of the fetched S1 file (687515 bytes, sha256 `b0202de1…f0fcd16`).

**W1 — mutability step, first in the list** (S1 lines 5830–5831):

> If this is not mutable, then throw an "InvalidStateError" DOMException.

`wc -w` = **10**

**W2 — origin condition of the SecurityError step** (S1 lines 5832–5833):

> If this's relevant settings object's origin is not same origin with this's relevant settings object's top-level origin

`wc -w` = **17**

**W3 — the SecurityError step itself** (S1 lines 5835–5836):

> this's type attribute is not in the File Upload state or Color state, then throw a "SecurityError" DOMException.

`wc -w` = **18**

**W4 — the File/Color exemption note attached to that step** (S1 lines 5838–5840):

> File and Color inputs are exempted from this check for historical reason: their input activation behavior also shows their pickers

`wc -w` = **20**
(The note continues "…and has never been guarded by an origin check." — omitted to stay ≤25 words.)

**W5 — the transient-activation step** (S1 lines 5841–5843):

> If this's relevant global object does not have transient activation, then throw a "NotAllowedError" DOMException.

`wc -w` = **15**

**W6 — the last step of the method** (S1 line 5845):

> Show the picker, if applicable, for this.

`wc -w` = **7**

### 1a. ORDER of the WHATWG steps (as written)

Reading S1 lines 5830–5845 as one ordered list, the method steps are:

1. **not mutable → InvalidStateError** (W1, 5830–5831)
2. **origin ≠ top-level origin (and not a `select`, and type not File Upload/Color) → SecurityError** (W2+W3, 5832–5836), with the **File/Color exemption note** (W4, 5838–5840)
3. **no transient activation → NotAllowedError** (W5, 5841–5843)
4. (`select` not being rendered → NotSupportedError) (S1 5843–5845)
5. **Show the picker, if applicable, for this.** (W6, 5845)

So in the spec: **mutability is checked BEFORE origin, and origin BEFORE activation.**

### 1b. The "show the picker, if applicable" algorithm (the TYPE gate)

Locator: S1 lines 5848–5856, anchor `#show-the-picker,-if-applicable`.

**W7 — the explicit early return for types with no picker** (S1 lines 5855–5856):

> If element does not support a picker, then return.

`wc -w` = **9**

The algorithm's own order (S1 5852–5856): transient-activation → return; not mutable → return;
**Consume user activation**; **not support a picker → return**; then the File-Upload branch.

**W8 — what "supports a picker" means** (S1 lines 1465–1466):

> Whether an input element supports a picker depends on the type attribute state and implementation-defined behavior.

`wc -w` = **16**

**W9 — the only type that MUST support a picker** (S1 lines 1466–1467):

> An input element must support a picker when its type attribute is in the File Upload state.

`wc -w` = **17**

The adjacent note (S1 1468–1474) lists the types typical implementations show picker UI for:
Date, Month, Week, Time, Local Date and Time, Color states; elements with a suggestions source
element; File Upload; and `select`. **`tel`, `search` and `text` are not in that list.**

**W10 — the IDL description of the same method** (S1 lines 5599–5600):

> If input does not support a picker, this method does nothing.

`wc -w` = **11**

---

## 2. Chromium 155.0.8059.84 — `HTMLInputElement::showPicker` (source S2)

Locator for all of §2: `https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/renderer/core/html/forms/html_input_element.cc`
(`?format=TEXT`, base64-decoded; decoded sha256 `405b52c70185820ead77b2338f054eb8220fdc7ef176de671db63c349282e96d`,
101570 bytes). Line numbers are lines of the decoded file.

The whole function is lines 2652–2682 (block sha256 of lines 2652–2682 =
`87ce9bba3059cb6456702d22d780333e24868dcdb8bcf4ccc589d7bd2df6bae4`, 1147 bytes).

**C1 — the origin check (the FIRST thing the function does)** (S2 lines 2657–2664):

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

`wc -w` = **23**

**C2 — the mutability check** (S2 lines 2666–2671):

```
if (!isMutable()) {
    exception_state.ThrowDOMException(
        DOMExceptionCode::kInvalidStateError,
        "HTMLInputElement::showPicker() cannot be used on immutable controls.");
    return;
  }
```

`wc -w` = **14**

**C3 — the activation check** (S2 lines 2673–2678):

```
if (!LocalFrame::HasTransientUserActivation(frame)) {
    exception_state.ThrowDOMException(
        DOMExceptionCode::kNotAllowedError,
        "HTMLInputElement::showPicker() requires a user gesture.");
    return;
  }
```

`wc -w` = **12**

**C4 — the exact NotAllowedError message string in that source** (S2 line 2676) — **the answer to
assignment item (3)**:

> "HTMLInputElement::showPicker() requires a user gesture."

`wc -w` = **5**

(For completeness, the sibling literals in the same function: `"showPicker() called from
cross-origin iframe."` — S2 line 2661, `wc -w` = **5**; and `"HTMLInputElement::showPicker() cannot
be used on immutable controls."` — S2 line 2669.)

**C5 — the tail: activation is consumed, then the type's view is opened** (S2 lines 2679–2681):

```
LocalFrame::ConsumeTransientUserActivation(frame);

  input_type_view_->OpenPopupView();
```

`wc -w` = **2**

### 2a. What "same origin" means here (source S5)

**C6** (S5 `local_frame.cc` lines 4453–4460):

```
bool LocalFrame::IsSameOrigin() {
  const SecurityOrigin* security_origin =
      GetSecurityContext()->GetSecurityOrigin();
  const SecurityOrigin* top_security_origin =
      Tree().Top().GetSecurityContext()->GetSecurityOrigin();

  return security_origin->IsSameOriginWith(top_security_origin);
}
```

`wc -w` = **16**

So Chromium's origin check compares the **frame's** origin against the **top frame's** origin —
the same comparison the spec words as "relevant settings object's origin … top-level origin" (W2).

### 2b. What happens for input types with no picker (sources S3, S4, S6, S7, S8, S9)

`tel`, `search` and `text` are `TelephoneInputType` / `SearchInputType` / `TextInputType`
(`telephone_input_type.h:38`, `search_input_type.h:39`, `text_input_type.h:38`), all
`BaseTextInputType` (`base_text_input_type.h:42`) → `TextFieldInputType`
(`text_field_input_type.h:42`, which implements **both** `InputType` and `InputTypeView`).
Neither `BaseTextInputType`, `SearchInputType`, `TelephoneInputType` nor `TextInputType` overrides
`CreateView` or `OpenPopupView` (grep over the four headers/sources: no hits).

**C7 — the view for those types is the input type itself** (S3 `text_field_input_type.cc` lines 132–134):

```
InputTypeView* TextFieldInputType::CreateView() {
  return this;
}
```

`wc -w` = **6**

**C8 — the only popup that type can open** (S3 `text_field_input_type.cc` lines 799–806):

```
void TextFieldInputType::OpenPopupView() {
  if (GetElement().IsDisabledOrReadOnly() ||
      GetElement().IsBaseAppearanceCombobox()) {
    return;
  }
  if (ChromeClient* chrome_client = GetChromeClient())
    chrome_client->OpenTextDataListChooser(GetElement());
}
```

`wc -w` = **17**

**C9 — the default (no-op) view for every type that does not override it** (S4
`input_type_view.cc` line 135):

> void InputTypeView::OpenPopupView() {}

`wc -w` = **3**

**C10 — where that request ends up** (S6 `chrome_client_impl.cc` lines 1388–1394):

```
void ChromeClientImpl::OpenTextDataListChooser(HTMLInputElement& input) {
  NotifyPopupOpeningObservers();
  if (auto* fill_client =
          AutofillClientFromFrame(input.GetDocument().GetFrame())) {
    fill_client->OpenTextDataListChooser(WebInputElement(&input));
  }
}
```

`wc -w` = **14**

and the embedder interface it calls (S8 `web_autofill_client.h` line 72):

> virtual void OpenTextDataListChooser(const WebInputElement&) {}

`wc -w` = **5**

and the content-side implementation (S9 `autofill_agent.cc` lines 1025–1037), whose first act is:

> void AutofillAgent::OpenTextDataListChooser(const WebInputElement& element) {

`wc -w` = **5** — followed by `ShowSuggestions(element, AutofillSuggestionTriggerSource::kOpenTextDataListChooser, …)`.

**C11 — the only path that produces a CDP file chooser** (S7 `file_input_type.cc` lines 197–204):

```
void FileInputType::OpenPopupView() {
  HTMLInputElement& input = GetElement();
  Document& document = input.GetDocument();

  bool suppressed = false;
  bool canceled = false;
  probe::FileChooserOpened(document.GetFrame(), &input, input.Multiple(),
```

`wc -w` = **3** for the quoted fragment
(`probe::FileChooserOpened(document.GetFrame(), &input, input.Multiple(),` — `wc -w` = **3**).

`probe::FileChooserOpened` appears in exactly one of the fetched form-control sources
(`file_input_type.cc`); `grep -ln 'probe::FileChooserOpened' *.cc` over the fetched set returns
only that file. It is what surfaces as the CDP `Page.fileChooserOpened` event the r85 driver
counts (`scripts/chrome-cdp-showpicker-round85.mjs:427`).

---

## 3. THE ANSWER: silent no-op by TYPE, or by an explicit early return?

**Chromium (the implementation the r85 receipt actually measures): by TYPE — there is NO explicit
early return.**

`HTMLInputElement::showPicker` (S2 2652–2682) contains exactly three `return` statements, and all
three are the **throw** paths of the three checks (C1 SecurityError, C2 InvalidStateError, C3
NotAllowedError). There is no "does this type support a picker" test anywhere in the function, and
no early return between the activation check and the popup call: after C3 the code runs
`LocalFrame::ConsumeTransientUserActivation(frame);` and then unconditionally
`input_type_view_->OpenPopupView();` (C5, lines 2679–2681).

The "no chooser" outcome for `tel`/`search`/`text` therefore falls out of **which type's view is
dispatched**, not out of a guard:

* the view is the input type itself (`TextFieldInputType::CreateView()` returns `this`, C7);
* that view's only popup is `TextFieldInputType::OpenPopupView()` (C8), which asks the embedder for
  the **text data list / autofill suggestion** dropdown (C10 → S8 → S9), i.e. a *datalist* popup,
  not a picker;
* the file chooser — the thing that becomes the CDP `Page.fileChooserOpened` event the r85 driver
  counts — is reachable only from `FileInputType::OpenPopupView()` (C11), a different type.

So: **same-origin + activation on `tel`/`search`/`text` returns `undefined` and opens no chooser
because the type has no chooser view — by TYPE dispatch, not by an explicit early return.**

**The spec, by contrast, does have an explicit early return, and it is also type-keyed:** W7
("If element does not support a picker, then return.", S1 5855–5856), with "supports a picker"
defined by type state (W8/W9, S1 1465–1467) and the IDL description repeating it (W10, S1
5599–5600).

**Consequence for the wording of the r85 law:** the two sources agree on the *observable*
outcome and disagree on the *mechanism*. The frozen law's phrasing "no picker exists for these
types" is a faithful description of the **spec** (W8/W9 + the 1468–1474 note) and a faithful
description of the **Chromium dispatch** (C7/C8/C11); but a reader who takes "no picker exists" as
describing a guard inside `showPicker()` would be wrong about Chromium's code — there is none
(C5 is unconditional). [INFERENCE, high confidence: derived from the absence of any such branch in
S2 2652–2682 plus the type dispatch in S3; the "no picker" wording in the frozen law is not
thereby falsified, only its implied mechanism.]

**One coverage caveat the sources make visible (measured, not inferred):** Chromium's text-type
path *does* issue an embedder request (`OpenTextDataListChooser` → autofill suggestions, C10/C12).
That request is **not** a file chooser and does **not** produce `Page.fileChooserOpened`, so the
r85 metric ("ZERO choosers open", counted as `Page.fileChooserOpened` events — driver line 427)
cannot distinguish "no popup of any kind was requested" from "no *file* chooser was opened". The
r85 legs' fixture inputs (`<input type="tel" id="tes">`, `search`, `text`, per the receipt's
`fixture.patch.body`) carry no `list` attribute and the fixture contains no `<datalist>`, so in
this fixture there is no datalist popup to open either — the measurement is consistent with the
sources. This is stated as a scope observation about what the metric proves; **no instrument change
is proposed**.

---

## 4. Do the frozen r85 laws match the located sources?

The three frozen laws (claims.json C1) and the located evidence:

### Law A — same-origin WITHOUT transient activation → `NotAllowedError`

* Chromium: C3 (S2 2673–2678) throws `DOMExceptionCode::kNotAllowedError` with the literal
  `"HTMLInputElement::showPicker() requires a user gesture."` (C4).
* Spec: W5 (S1 5841–5843), the third method step.
* Receipt: legs `sp85-same-origin-tel` / `-search` / `-text` → `NotAllowedError`, message
  `"Failed to execute 'showPicker' on 'HTMLInputElement': HTMLInputElement::showPicker() requires a user gesture."`,
  0 `Page.fileChooserOpened` events, activation `{isActive:false,hasBeenActive:false}` before and
  after (activation never granted, so never consumed — consistent with C3 returning **before**
  C5's `ConsumeTransientUserActivation`).
* **MATCH.** (The `"Failed to execute 'showPicker' on 'HTMLInputElement': "` prefix is not in the
  source literal — the source string is exactly C4's five words; the prefix is added by Blink's
  DOMException binding layer. [INFERENCE, high confidence — the source literal has no prefix and
  the receipt has one, so the prefix is added outside `html_input_element.cc`.] The frozen
  `GESTURE_ERR` constant in `scripts/check-showpicker-r85.mjs:233` equals the receipt's full
  message, so the counter pins the *composed* string, which is consistent.)

### Law B — same-origin WITH activation → `showPicker()` returns `undefined`, ZERO choosers open

* Chromium: C5 (S2 2679–2681) consumes the activation and dispatches to the type's view; for
  `tel`/`search`/`text` that is C8 → C10 (datalist/autofill request), never the file-chooser path
  C11. The function returns `void`, so the JS result is `undefined`.
* Spec: W6 + W7 (explicit return when the type does not support a picker) + W8/W9 (type-keyed) +
  W10 (IDL: "this method does nothing").
* Receipt: legs `sp85-same-origin-tel-activated` / `-search-activated` / `-text-activated` →
  `{"ok": true, "ret": "undefined"}`, 0 `Page.fileChooserOpened` events, activation
  `{isActive:true,hasBeenActive:true}` **before** and `{isActive:false,hasBeenActive:true}`
  **after** — i.e. the activation *was* granted and *was consumed*, which is exactly C5's
  `ConsumeTransientUserActivation` before `OpenPopupView()`. This is positive evidence that the
  chain reached line 2681 and returned undefined rather than short-circuiting earlier.
* **MATCH** — for the file-chooser metric; §3's caveat bounds what "ZERO choosers open" proves.

### Law C — cross-origin → `SecurityError`

* Chromium: C1 (S2 2657–2664) throws `SecurityError` with the literal
  `"showPicker() called from cross-origin iframe."`; the exemption is by *type*
  (`kInputFile` / `kInputColor` are skipped), matching W3's "File Upload state or Color state" and
  the W4 note.
* Spec: W2 + W3 (second method step) + W4 (exemption note).
* Receipt: `sp84-cross-origin-tel` / `-search` / `-text` → `SecurityError`, message
  `"Failed to execute 'showPicker' on 'HTMLInputElement': showPicker() called from cross-origin iframe."`.
* **MATCH**, and the exact SecurityError literal is load-bearing for the C2 witness family
  `cross-message-unpinned` (which rewrites `childResult.message` to a bare `'SecurityError'` — see
  `scripts/negatives-showpicker-r85.mjs:238`), so the string is worth pinning by hand: it is
  `"showPicker() called from cross-origin iframe."` (S2 line 2661), not the composed
  `"Failed to execute …"` form.

### Law-order note (a real source-level divergence between spec and Chromium)

* Spec order: mutability (W1) → origin (W2/W3) → activation (W5).
* Chromium order: **origin (C1) → mutability (C2) → activation (C3)**.

Observable consequence: a **cross-origin AND disabled** input yields `SecurityError` in Chromium
(S2 2659 fires before 2666) but would yield `InvalidStateError` under the spec's written order.
The r85 receipt shows exactly Chromium's order —
`sp84-cross-origin-nonfile-disabled` → `SecurityError` (not `InvalidStateError`), while
`sp84-same-origin-nonfile-disabled` → `InvalidStateError`. The r85 laws' phrase "the SecurityError
is origin-determined" is true of Chromium's *first* check and of the spec's second step; the
six new r85 legs are all same-origin and mutable, so the divergence does not touch them. Stated as
an observation only.

---

## 5. Evidence actually read in the lane (not a claim)

* Scored receipt `corpus/evidence/round85/chromium-showpicker/receipt.json`, sha256
  `c22f90f70cc6d510c074d777f19580fe3796aef073ab1eb255dd746a1a41e56a`, 375073 bytes, 24 legs,
  `nonce tabi-r85-l1-620623a43f74`, `finishedAt 2026-11-08T07:39:53.619Z`; identical to `HEAD`
  (`git diff HEAD -- <path>` empty). Legs and per-leg values are quoted in §4.
* `scripts/check-showpicker-r85.mjs` — `GESTURE_ERR` (line 233), the `NO_PICKER` set (line 146),
  the per-leg expected showPicker values (lines 256–261), the activation expectations (lines
  282–287), the chooser-count law (`opens !== want`, line 649–652) and the
  `same-origin-no-picker-law` check (lines 654–657, asserting `ret === 'undefined'` **and** zero
  `Page.fileChooserOpened` events for the three activated legs).
* `scripts/chrome-cdp-showpicker-round85.mjs` — the chooser metric is
  `cdpEventLog.filter(e => e.method === 'Page.fileChooserOpened').length` (line 427), and the
  file-chooser interception is armed per leg via `Page.setInterceptFileChooserDialog` (line 433).
* `scripts/negatives-showpicker-r85.mjs:238–243` — the six r85 refusal cases
  (`cross-tel-message-unpinned`, `cross-tel-childlate`, `cross-tel-crossaccess`,
  `cross-tel-childseq`, `cross-tel-childact-after`, `cross-tel-childact-before`), all bound to
  `sp84-cross-origin-tel-law`.
* `.ufo/waves/round-85/scored/counter-a.json` — `verdict: clean`, `checkCount: 87`,
  `findings: []`, `priorSet: 1`, and `nodeReport` listing the six `sp85-same-origin-*` legs with
  no node findings.
* `.ufo/waves/round-85/scored/witness-a.json` — C2: `before.survivors` =
  `["cross-access-dropped","cross-childseq-dropped","cross-childact-before-dropped"]` (3 of 6),
  `after.survivors` = `[]` (0 of 6), `crashed: []`, `unapplied: []` in both generations.

### One factual state note for the integrator

The assignment's brief names nonce `tabi-r85-l1-dbecb1a18905` and D `dbecb1a18905`. In the tree
those are **D1, already superseded**: `.ufo/waves/round-85/claims.json` now carries
`"nonce": "tabi-r85-l1-620623a43f74"` and `frozenAt` text
"freeze.txt sha256 620623a43f74 (D2; D1 dbecb1a18905 superseded by the drift-counter family-case
mapping fix recorded in plans/round-85.md §Re-freeze history)"; `freeze.txt` itself is sha256
`620623a43f747cfadf13e24b4501bfd8b8fff43cefa7c97aa1bee67c5a3c6906`; the committed receipt and the
frozen counting command both use `tabi-r85-l1-620623a43f74`; and `git log` shows the D2 re-freeze in
commit `c8876299` (parent `5c196152`, base `c574d593`). The brief's D1/nonce are therefore stale
relative to the lane; every source/law statement above was checked against the **D2** state. This is
reported as an observation, not a change.

---

## 6. Answers in one line each

1. **WHATWG `showPicker()` steps** — W1 (mutability/InvalidStateError), W2+W3 (origin/SecurityError),
   W4 (File-Color exemption note), W5 (transient activation/NotAllowedError), W6 (show the picker);
   spec order **mutability → origin → activation**; the type gate is W7 ("If element does not
   support a picker, then return."), with picker support defined by type state (W8/W9) and the IDL
   saying the method "does nothing" (W10).
2. **Chromium 155.0.8059.84 `HTMLInputElement::showPicker`** — origin check first (C1, exempts
   file/color), then mutability (C2), then activation (C3), then consume-activation + unconditional
   `input_type_view_->OpenPopupView()` (C5). For types with no picker the view is the input type
   itself (C7) and its only popup is the datalist/autofill request (C8 → C10 → C12); the file
   chooser lives only in `FileInputType::OpenPopupView()` (C11).
3. **Exact NotAllowedError message string in that source** — `"HTMLInputElement::showPicker()
   requires a user gesture."` (S2 line 2676; 5 words). The receipt's message carries Blink's
   binding prefix `"Failed to execute 'showPicker' on 'HTMLInputElement': "` in front of it.
4. **Silent no-op by TYPE or explicit early return?** — **By TYPE in Chromium** (no early return
   exists in `showPicker()`; the no-op is the type's dispatched view), **by an explicit early return
   in the spec** (W7). The r85 laws match the located sources on all three observable outcomes;
   the one nuance worth carrying forward is that the "ZERO choosers" metric counts CDP
   `Page.fileChooserOpened` only, and Chromium's text-type path does issue a non-file-chooser
   datalist/autofill request (C10/C12) that the metric cannot see.
