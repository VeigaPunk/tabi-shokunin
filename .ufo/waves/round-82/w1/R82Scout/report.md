# R82Scout — round 82 / r82 laws: the four source texts

Seat: R82Scout (read-only). Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Sources saved under `.ufo/waves/round-82-seats/R82Scout/sources/` with manifest `FETCH.txt`
(URL | http status | bytes | sha256 per file).

No tooling was installed or upgraded for this seat (all work used pre-installed `curl`,
`python3`, `base64`, `sha256sum`); no pacman/uv/npm transaction was performed. See
"Tooling" at the end.

---

## 1. WHATWG HTML — `showPicker()` SecurityError step and its exact condition

**Source:** `https://html.spec.whatwg.org/multipage/input.html` (HTTP 200, 687 515 bytes,
sha256 `b0202de1c0b422d94d7aa23b4f1b0e3126d9d044bf7076394b6e00451f0fcd16`).
Saved copy: `sources/html-input.html`.

**Locator:** section **4.10.5.4 "Common input element APIs"**, `id=common-input-element-apis`
(found at file line 5552); the `showPicker()` method steps list immediately follows the
`dom-input-showpicker` definition at file line 5827; the SecurityError step itself is
**file lines 5831–5838**. Canonical URL fragment:
`https://html.spec.whatwg.org/multipage/input.html#dom-input-showpicker`
(the ordered steps are inside `#common-input-element-apis`).

**Quote A — the SecurityError step and its exact condition (42 words by `wc -w`; trimmed to two
sub-quotes below, each ≤25 words):**

> "If this's relevant settings object's origin is not same origin with this's relevant settings object's top-level origin, and this is a select element, or this's type attribute is not in the File Upload state or Color state, then throw a "SecurityError" DOMException."

**Quote A1 (condition part, 16 words by `wc -w`):**

> "this's relevant settings object's origin is not same origin with this's relevant settings object's top-level origin"

**Quote A2 (exception part, 18 words by `wc -w`):**

> "this's type attribute is not in the File Upload state or Color state, then throw a "SecurityError" DOMException."

**Quote B — the step that precedes it (the order discriminator), 10 words by `wc -w`:**

> "If this is not mutable, then throw an "InvalidStateError" DOMException."

(`wc -w` counts on the quote text alone.)

**Quote C — the File/Color exemption note (spec's own words), 25 words by `wc -w`:**

> "File and Color inputs are exempted from this check for historical reason: their input activation behavior also shows their pickers, and has never been guarded by an origin check."

**Quote D — the IDL-side summary of the same three exceptions (spec §4.10.5.4), 21 words:**

> "Throws a "SecurityError" DOMException if input is inside a cross-origin iframe, unless input is in the File Upload or Color states."

### Order discriminator — what the spec actually says

**The spec orders MUTABILITY FIRST, ORIGIN SECOND.** In the ordered list at
`html-input.html:5830-5838` the steps run:

1. `If this is not mutable, then throw an "InvalidStateError" DOMException.`  (line 5831)
2. `If this's relevant settings object's origin is not same origin with … top-level origin … then throw a "SecurityError" DOMException.` (lines 5832–5838)
3. `If this's relevant global object does not have transient activation, then throw a "NotAllowedError" DOMException.` (lines 5841–5843)

So the spec's ordering is **mutable → origin → activation**. A disabled input inside a
cross-origin iframe would, under the spec text, raise `InvalidStateError` (step 1 fires first).
Chromium's implementation (item 2) checks origin first. This is a genuine spec/Chromium
divergence and it is exactly the r82 order discriminator: the two orders produce *different*
exception names for the same call.

---

## 2. Chromium/Blink `HTMLInputElement::showPicker` at tag 155.0.8059.84

**Source:** `https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/renderer/core/html/forms/html_input_element.cc?format=TEXT`
(HTTP 200; base64 body 135 428 bytes sha256 `81b35d96184a983226f888faa5ac4f9a57be7aa882e9bb4b5d6d09650b7f1b10`;
base64-decoded body 101 570 bytes sha256 `405b52c70185820ead77b2338f054eb8220fdc7ef176de671db63c349282e96d`).
Saved copy: `sources/html_input_element.cc`.

**Locator:** function `HTMLInputElement::showPicker(ExceptionState&)`, file lines **2652–2681**
(guard block at 2657–2665, mutability check 2666–2671, gesture check 2673–2678).
`isMutable()` is defined just above at lines 2643–2648.

**Cross-origin condition (Quote E, 11 words by `wc -w`, source lines 2657–2663):**

> "if (!frame->IsSameOrigin()) { exception_state.ThrowSecurityError( "showPicker() called from cross-origin iframe."); return; }"

Full enclosing condition (source lines 2657–2659), verbatim:

```
  if (FormControlType() != FormControlType::kInputFile &&
      FormControlType() != FormControlType::kInputColor && frame) {
    if (!frame->IsSameOrigin()) {
```

**Mutability check (Quote F, 14 words by `wc -w`, source lines 2666–2670):**

> "if (!isMutable()) { exception_state.ThrowDOMException( DOMExceptionCode::kInvalidStateError, "HTMLInputElement::showPicker() cannot be used on immutable controls."); return; }"

**Gesture check (Quote G, 16 words by `wc -w`, source lines 2673–2677):**

> "if (!LocalFrame::HasTransientUserActivation(frame)) { exception_state.ThrowDOMException( DOMExceptionCode::kNotAllowedError, "HTMLInputElement::showPicker() requires a user gesture."); return; }"

**Source order in Chromium (verified by line numbers):**

| order | source lines | check | exception |
|---|---|---|---|
| 1 | 2657–2665 | cross-origin (`!frame->IsSameOrigin()`), **exempted for `kInputFile` and `kInputColor`** | `SecurityError` — "showPicker() called from cross-origin iframe." |
| 2 | 2666–2671 | mutability (`!isMutable()`) | `InvalidStateError` — "…cannot be used on immutable controls." |
| 3 | 2673–2678 | transient user activation | `NotAllowedError` — "…requires a user gesture." |

**Chromium order = ORIGIN FIRST, MUTABILITY SECOND** — the *reverse* of the spec's
mutability-first ordering. This confirms the r82 order discriminator: on a **disabled**
`type=date` input, Chromium throws `SecurityError` when cross-origin and `InvalidStateError`
when same-origin, while the spec text would throw `InvalidStateError` in both cases.

Two supporting details:

* `isMutable()` (lines 2643–2648) is `!IsDisabledFormControl() && !(input_type_->SupportsReadOnly() && IsReadOnly())`
  — a **disabled** control is immutable, hence the `InvalidStateError` path.
* `LocalFrame::IsSameOrigin()` (fetched separately from
  `third_party/blink/renderer/core/frame/local_frame.cc`, tag 155.0.8059.84, lines 4453–4460)
  compares the frame's own security origin with the **top-level** frame's security origin
  (`IsSameOriginWith(top_security_origin)`), i.e. the same top-level comparison the spec
  makes (`relevant settings object's origin` vs `top-level origin`).

---

## 3. CDP `DOM.setFileInputFiles` in DOM.pdl at tag 155.0.8059.84

**Source:** `https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/public/devtools_protocol/domains/DOM.pdl?format=TEXT`
(HTTP 200; base64 body 46 100 bytes sha256 `8fc257c54f6475c27f52a7c4656dda98b24c41381edf0ea729c8a6e948301c2d`;
base64-decoded body 34 575 bytes sha256 `50c460459e502a0a75a07de32e0589126c737a62f14c6b969df73009f958f702`).
Saved copy: `sources/dom.pdl`.

**Locator:** `command setFileInputFiles`, DOM domain, **file lines 681–691** (comment at 681,
`command` at 682, `parameters` at 683).

**Quote H — parameters, 23 words by `wc -w`, source lines 681–691:**

> "command setFileInputFiles parameters # Array of file paths to set. array of string files optional NodeId nodeId optional BackendNodeId backendNodeId optional Runtime.RemoteObjectId objectId"

Verbatim source lines 680–691:

```
  # Sets files for the given file input element.
  command setFileInputFiles
    parameters
      # Array of file paths to set.
      array of string files
      # Identifier of the node.
      optional NodeId nodeId
      # Identifier of the backend node.
      optional BackendNodeId backendNodeId
      # JavaScript object id of the node wrapper.
      optional Runtime.RemoteObjectId objectId
```

**Parameters:** exactly four — `files` (required, `array of string`), `nodeId` (optional
`NodeId`), `backendNodeId` (optional `BackendNodeId`), `objectId` (optional
`Runtime.RemoteObjectId`). One is required; the other three are alternative ways to name the
target node.

**Does it mention `accept` or directories?** **No — neither.**
* `grep -ci accept dom.pdl` → **0** (case-insensitive, whole file).
* `grep -ci directory dom.pdl` → **0** (case-insensitive, whole file).
The only file-typing vocabulary in the command is the free-form `files` string array; there is
no `accept` filter, no MIME/extension filtering parameter, and no directory flag.

**Corroboration at the implementation layer** (same tag):
`content/browser/devtools/protocol/dom_handler.cc`
(`https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/content/browser/devtools/protocol/dom_handler.cc?format=TEXT`,
HTTP 200, decoded 1829 bytes sha256 `42abef340e07a26ac2046a01cf58f5c305e61d572c4270826430a72249324081`;
saved copy `sources/dom_handler.cc`). `DOMHandler::SetFileInputFiles` (lines 42–56) only
(a) rejects with `ServerError("Not allowed")` when `!allow_file_access_`, (b) grants read
access to each named path via `ChildProcessSecurityPolicyImpl::GrantReadFile`, and (c) falls
through. **No accept check, no extension check, no directory check appears there either.**

**Where `accept` *does* appear in the CDP surface** (relevant contrast, same tag):
`third_party/blink/public/devtools_protocol/domains/Page.pdl`
(HTTP 200, decoded 61 911 bytes sha256 `e944a3b19fa2c87b4ed0a84cca85b16b127618725394496ba046a2dfdf9405be`;
saved copy `sources/page.pdl`):
* `experimental type FileFilter extends object` with `optional string name` and
  `optional array of string accepts` — lines 677–681. **`accept` is a dialog-side filter
  type, not a `setFileInputFiles` parameter.**
* `command setInterceptFileChooserDialog` — line 1282, parameters `boolean enabled`,
  `experimental optional boolean cancel`.

---

## 4. WHATWG HTML `accept` attribute — hint/filter, not a validator

**Source:** same spec page as item 1 (`sources/html-input.html`).
**Locator:** the `accept` attribute definition lives in **§4.10.5.1.17 "File Upload state
(type=file)"**, `id=attr-input-accept` at file line 4066; the normative sentences are at file
lines **4067–4068** (hint), **4088–4089** (user-agent SHOULD), and the "may use the value …
to display a more appropriate user interface" sentence just above.

**Quote I — the attribute is a hint, 20 words by `wc -w` (file lines 4067–4068):**

> "The accept attribute may be specified to provide user agents with a hint of what file types will be accepted."

**Quote J — the only normative sentence, and what it constrains, 20 words by `wc -w` (file lines 4088–4089):**

> "User agents should prevent the user from selecting files that are not accepted by one (or more) of these tokens."

**Quote K — the UI-scoping sentence, 27 words by `wc -w` (file lines 4082–4084, trimmed):**

> "User agents may use the value of this attribute to display a more appropriate user interface than a generic file picker."

**Is `accept` normative validation?** **No.**
* The word "may" governs whether the attribute is specified at all; its stated purpose is
  "**a hint of what file types will be accepted**" — the spec itself calls it a hint.
* The single normative sentence is a **SHOULD addressed to user agents** and is scoped to
  "**the user from selecting files**" — i.e. it constrains the **dialog / user selection UI**,
  not the value model of the control. There is **no MUST** anywhere in the `accept` section
  that forbids a file being set on the element by other means.
* The spec never says a non-matching file must be *rejected*; it says the user agent *should
  prevent the user from selecting* such files, and *may* use the value to offer a more
  appropriate picker.
* Corollary, and the reason this matters for r82: the `accept` attribute is **not** a
  validator applied to a programmatically-supplied file list. Nothing in the spec, nothing in
  `DOM.pdl`, and nothing in `DOMHandler::SetFileInputFiles` re-checks `accept` against files
  delivered by `DOM.setFileInputFiles`. A `.txt` answered into an `accept=".png"` input is
  therefore not contradicted by any of these three sources.

---

## Flags — claims the quotes do NOT support (and where they do)

1. **"The spec orders mutability before the origin check" — SUPPORTED, and this is a real
   divergence.** Spec §4.10.5.4 lists `InvalidStateError` (not mutable) as step 1 and the
   `SecurityError` origin check as step 2; Chromium (lines 2657–2671) checks origin first.
   The r82 order discriminator therefore rests on a genuine spec-vs-Chromium mismatch, not on
   a misreading. **Do not** treat Chromium's order as a spec-conformance claim in either
   direction: the spec does not explicitly say "the origin check is skipped when the element
   is immutable" — it only *orders* the steps, and a plain reading of an ordered list means
   the first failing step throws.

2. **"Chromium checks the origin before mutability" — SUPPORTED verbatim** by the source
   order (origin guard at 2657–2665 precedes `!isMutable()` at 2666).

3. **"SecurityError 'showPicker() called from cross-origin iframe.' and opens nothing" —
   PARTIALLY supported.** The exact message string is verbatim in the source, and the
   `return;` after the throw means no picker is opened — both supported. But note the
   exemption: the origin check is skipped entirely for `kInputFile` and `kInputColor`
   (lines 2657–2658). A cross-origin `type=file` input therefore does **not** throw
   `SecurityError` from this path; any r82 leg that asserts a cross-origin `type=file` input
   throws `SecurityError` would be **wrong**. The r82 legs as written use `type=date`, which
   is not exempted, so leg (1) and leg (2) are consistent with the source.

4. **"the SAME call on a DISABLED `type=date` input is SecurityError cross-origin but
   InvalidStateError same-origin" — SUPPORTED by the source order**, given
   `isMutable()` returns false for a disabled control (lines 2643–2648). The quote supports
   the *mechanism*; it does not itself prove the runtime behaviour (that is the fixture's
   job, not the law's).

5. **"`DOM.setFileInputFiles` naming a DIRECTORY answers a `webkitdirectory` input … files
   arrive with `webkitRelativePath` set" — NOT SUPPORTED by any quote here.** `DOM.pdl`
   contains **zero** occurrences of "accept" and **zero** of "directory"; `dom_handler.cc`
   shows only a read-access grant per path. `webkitRelativePath` semantics live in the
   file-input/`FileList` machinery, not in the CDP schema. Nothing in these sources
   establishes directory semantics for `setFileInputFiles`. If the r82 note asserts CDP-level
   directory support, it needs a citation from the file-input/`webkitdirectory` code path, not
   from DOM.pdl.

6. **"a `.txt` answered into an `accept=".png"` input is ACCEPTED (accept filters the
   dialog, not a programmatic answer)" — SUPPORTED, and the `accept` quotes in item 4 are
   the right ones to cite.** `accept` is "a hint"; its only normative sentence constrains
   what the *user* may select; `DOM.pdl` has no `accept` parameter; and
   `DOMHandler::SetFileInputFiles` performs no accept/extension check. Note the precise
   scope of the support: the sources show that **no layer re-validates `accept` against a
   programmatic answer**, which is what the claim needs. They do **not** by themselves
   assert the positive outcome ("the .txt is accepted") — the DOM/accept spec text is about
   the *dialog*, so the *positive* half of the claim remains a runtime observation.

7. **"`DOM.setFileInputFiles` mentions accept or directories" — FALSE, and this is the
   sharper version of flag 5.** The schema's only relevant parameter is a flat
   `array of string files` ("Array of file paths to set."). Any r82 note claiming the CDP
   command "takes an accept filter" or "has a directory flag" is refuted by the file itself.

8. **"a REAL CLICK on an input whose picker is already open opens a SECOND chooser" — NOT
   in scope of these four sources.** `DOM.pdl`/`Page.pdl` define the interception command
   (`Page.setInterceptFileChooserDialog`, `boolean enabled`, optional `boolean cancel`) but
   say nothing about re-entrancy or a second chooser. That claim needs the file-chooser
   interception implementation, not the protocol schema.

9. **Spec copy is the living standard (unversioned).** `html.spec.whatwg.org/multipage/input.html`
   serves the current WHATWG HTML; the fetch is a 2026-11-07 snapshot with the sha256 above.
   Any r82 note citing "the HTML spec" should carry that digest or a dated
   `commit-snapshots/` URL, since the living text can change under the note.

10. **CDP DOM.pdl path changed.** For tag 155.0.8059.84 the DOM.pdl lives at
    `third_party/blink/public/devtools_protocol/domains/DOM.pdl`. The commonly cited
    `third_party/devtools-protocol/pdl/domains/DOM.pdl` returns **404** in this tree (the
    protocol definitions were absorbed into `third_party/blink/public/devtools_protocol/`;
    `third_party/inspector_protocol` here contains only the generator, templates and
    `pdl.py`, no `.pdl` files). A note citing the old path at this tag would be
    unverifiable-as-written.

---

## Fetch manifest (summary)

| # | URL | status | bytes (decoded) | sha256 (decoded) |
|---|---|---|---|---|
| 1 | `https://html.spec.whatwg.org/multipage/input.html` | 200 | 687 515 | `b0202de1c0b422d94d7aa23b4f1b0e3126d9d044bf7076394b6e00451f0fcd16` |
| 2 | `https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/renderer/core/html/forms/html_input_element.cc?format=TEXT` | 200 | 101 570 | `405b52c70185820ead77b2338f054eb8220fdc7ef176de671db63c349282e96d` |
| 3 | `https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/public/devtools_protocol/domains/DOM.pdl?format=TEXT` | 200 | 34 575 | `50c460459e502a0a75a07de32e0589126c737a62f14c6b969df73009f958f702` |
| 4 | same tree, `third_party/blink/public/devtools_protocol/domains/Page.pdl?format=TEXT` | 200 | 61 911 | `e944a3b19fa2c87b4ed0a84cca85b16b127618725394496ba046a2dfdf9405be` |
| 5 | same tree, `content/browser/devtools/protocol/dom_handler.cc?format=TEXT` | 200 | 1 829 | `42abef340e07a26ac2046a01cf58f5c305e61d572c4270826430a72249324081` |
| 6 | same tree, `third_party/blink/renderer/core/frame/local_frame.cc?format=TEXT` | 200 | (read for `IsSameOrigin`) | not saved to seat dir (supporting read only) |

Full manifest with raw-base64 digests: `.ufo/waves/round-82-seats/R82Scout/sources/FETCH.txt`.

`chromium.googlesource.com` intermittently returned **HTTP 503** on this network; every
successful fetch above was obtained after retry loops, and all four primary sources are
recorded with their **200** status.

## Tooling

No installs or upgrades were performed by this seat — no pacman transaction, no `uv tool`
install, no binary dropped into `~/.local/bin`. Everything used (`curl`, `python3`,
`base64`, `sha256sum`, `grep`, `wc`) was already present on the host. Nothing was written
outside `.ufo/waves/round-82-seats/R82Scout/sources/`, this report path, and the seat's own
scratch dir (removed before yielding).
