# R80Scout — round 80 sources for the `chromium-showpicker-linux` laws

**Seat:** R80Scout (read-only scout) · **Lane:** `/home/vgpnk/Projects/shokunin/tabi-shokunin`
**Base:** `e2e12ca58fe2cdbed4aa97af47793b6cfb5a9350` · **Digests commit D:** `f9ece6562c9448c30f0aabd0726d2ffd5aeeb3d3`
**Chromium under test:** `/usr/bin/chromium` → `Chromium 155.0.8059.84 Arch Linux` (probe-reported `Chrome/155.0.8059.84`)
**Tag used:** `refs/tags/155.0.8059.84` on `chromium.googlesource.com/chromium/src`

All fetched pages/sources are saved under
`.ufo/waves/round-80-seats/R80Scout/sources/` with status/bytes/sha256 in
`.ufo/waves/round-80-seats/R80Scout/sources/FETCH.txt` (22 sources + manifest, 23 rows).
Nothing was written into the walked trees (`.ufo/waves/round-80/`, `corpus/evidence/round80/`) except this
prose report at `.ufo/waves/round-80/w1/R80Scout.md`. No git/jj mutation was run.

**Tooling:** none installed or upgraded. `curl` (system), `node` v24.21.0 (system), `/usr/bin/chromium` 155.0.8059.84 (system) were already present; `/home/vgpnk/.omp/agent/RULES.md` was read first and no package channel was touched (no pacman, no `uv tool`, no `~/.local/bin` write).

---

## 1. WHATWG HTML — `showPicker()` and the SecurityError step

**URL:** https://html.spec.whatwg.org/multipage/input.html
**Saved:** `html-input.html` — status 200, 687515 bytes, sha256 `b0202de1c0b422d94d7aa23b4f1b0e3126d9d044bf7076394b6e00451f0fcd16`
**Locator:** the `showPicker()` algorithm, `<dfn data-dfn-for=HTMLInputElement id=dom-input-showpicker data-dfn-type=method>` (byte offset 657325 in the saved file; published anchor `#dom-input-showpicker`).

**Quote — the SecurityError step and its exact condition (step 2 of the algorithm):**

> "If this's relevant settings object's origin is not same origin with this's relevant settings object's top-level origin, and this is a select element, or this's type attribute is not in the File Upload state or Color state, then throw a "SecurityError" DOMException."

**Quote — the note attached to that step:**

> "File and Color inputs are exempted from this check for historical reason: their input activation behavior also shows their pickers, and has never been guarded by an origin check."

**Quote — the IDL summary of the same method (the cross-origin clause in prose form):**

> "Throws a "SecurityError" DOMException if input is inside a cross-origin iframe, unless input is in the File Upload or Color states."

**Quote — the mutability step immediately preceding it (step 1):**

> "If this is not mutable, then throw an "InvalidStateError" DOMException."

**Quote — the gesture step (step 3):**

> "If this's relevant global object does not have transient activation, then throw a "NotAllowedError" DOMException."

**Supporting — the "supports a picker" concept (`#input-support-picker`, same file):**

> "An input element must support a picker when its type attribute is in the File Upload state."

`mutable` is defined in `form-control-infrastructure.html` (saved as `fci.html`, 200, 466321 bytes, sha256 `49e4b7bccc7793dec36596392aca76db12a88bdb7fe6e68ce2043a005da43185`).

**Reading of the spec text — the exact condition.** The SecurityError fires only when **both** hold:
1. the element's relevant settings object's origin is **not same-origin** with its top-level origin; **and**
2. the element is either a `<select>`, **or** its type attribute is **not** in the File Upload state and **not** in the Color state.

The File/Color exemption is stated twice (note + IDL summary). So for `<input type=file>`, the SecurityError step is **unreachable by construction** — but only for that input type. For **any other type** (`text`, `date`, `number`, …) in a cross-origin iframe, step 2 **does** fire. This is the pivot of finding **F1** below.

---

## 2. Chromium / blink — `HTMLInputElement::showPicker` at tag 155.0.8059.84

**URL:** https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/renderer/core/html/forms/html_input_element.cc?format=TEXT
**Saved:** `html_input_element.cc` — status 200, 101570 bytes, sha256 `405b52c70185820ead77b2338f054eb8220fdc7ef176de671db63c349282e96d`
**Locator:** lines 2650–2682, function `HTMLInputElement::showPicker(ExceptionState&)` (file bytes 101570; `grep -n` line numbers as fetched).

**Locator correction worth recording:** the path `third_party/blink/renderer/core/html/html_input_element.cc` (the pre-2025 location, and the path a naive locator reaches for) returns **404** at this tag — saved as `PROBE-404-html_input_element.cc`, status 404, 233 bytes, sha256 `49465b9625a22ab717a107f9ecfa0fd19bfae405a45bf6c8c8d86bd7a7b11703`. The file lives under `…/core/html/forms/`. The CDP `.pdl` files likewise moved: they are now at `third_party/blink/public/devtools_protocol/domains/*.pdl`, not `…/devtools_protocol/*.pdl` (the old `domains/` tree itself 404s at this tag).

**Quote — the whole function, in source order (cross-origin → mutability → gesture → consume → open):**

> "void HTMLInputElement::showPicker(ExceptionState& exception_state) {
>   LocalFrame* frame = GetDocument().GetFrame();
>   if (FormControlType() != FormControlType::kInputFile &&
>       FormControlType() != FormControlType::kInputColor && frame) {
>     if (!frame->IsSameOrigin()) {
>       exception_state.ThrowSecurityError(
>           "showPicker() called from cross-origin iframe.");
>       return;
>     }
>   }
>   if (!isMutable()) {
>     exception_state.ThrowDOMException(
>         DOMExceptionCode::kInvalidStateError,
>         "HTMLInputElement::showPicker() cannot be used on immutable controls.");
>     return;
>   }
>   if (!LocalFrame::HasTransientUserActivation(frame)) {
>     exception_state.ThrowDOMException(
>         DOMExceptionCode::kNotAllowedError,
>         "HTMLInputElement::showPicker() requires a user gesture.");
>     return;
>   }
>   LocalFrame::ConsumeTransientUserActivation(frame);
>   input_type_view_->OpenPopupView();
> }"

The three checks in **source order** are therefore:

| # | Source line | Check | Thrown |
|---|---|---|---|
| 1 | 2657–2664 | cross-origin (`!frame->IsSameOrigin()`), **guarded by** `FormControlType() != kInputFile && != kInputColor` | `SecurityError` |
| 2 | 2666–2671 | mutability (`!isMutable()`) | `InvalidStateError` |
| 3 | 2673–2678 | gesture (`!LocalFrame::HasTransientUserActivation(frame)`) | `NotAllowedError` |

**Quote — the source's own cross-origin comment (lines 2654–2656):**

> "In cross-origin iframes it should throw a "SecurityError" DOMException except on file and color. In same-origin iframes it should work fine."

**Quote — the mutability predicate (lines 2642–2648):**

> "bool HTMLInputElement::isMutable() {
>   return !IsDisabledFormControl() &&
>          !(input_type_->SupportsReadOnly() && IsReadOnly());
> }"

**Quote — the `IsSameOrigin` helper actually used (`local_frame.cc`, lines 4453–4460):**

> "bool LocalFrame::IsSameOrigin() {
>   const SecurityOrigin* security_origin = GetSecurityContext()->GetSecurityOrigin();
>   const SecurityOrigin* top_security_origin = Tree().Top().GetSecurityContext()->GetSecurityOrigin();
>   return security_origin->IsSameOriginWith(top_security_origin);
> }"

This is the key semantic: Chromium compares the frame's origin against the **top** frame's origin — the same top-level-origin comparison the spec makes — and it is evaluated on **the element's own frame**, i.e. the *callee's* frame, not the caller's.

**Quote — the gesture helpers (`local_frame.cc`, lines 3068–3078):**

> "bool LocalFrame::HasTransientUserActivation(const LocalFrame* frame) {
>   return frame && frame->Frame::HasTransientUserActivation();
> }"

> "bool LocalFrame::ConsumeTransientUserActivation(
>     LocalFrame* frame,
>     UserActivationUpdateSource update_source) {
>   return frame && frame->ConsumeTransientUserActivation(update_source);
> }"

**Activation window (`third_party/blink/public/common/frame/user_activation_state.h`, saved `uas.h`, 200, 7361 bytes, sha256 `9f3bd773bcb32aef5474153e4057f39c78f094765028440ab80bfcde3f067eb0`):**

> "inline constexpr base::TimeDelta kActivationLifespan = base::Seconds(5);"

**Supporting — the picker actually opens in `FileInputType::OpenPopupView` (`file_input_type.cc`, lines 197–237):**

> "void FileInputType::OpenPopupView() {
>   HTMLInputElement& input = GetElement();
>   Document& document = input.GetDocument();
>   bool suppressed = false;
>   bool canceled = false;
>   probe::FileChooserOpened(document.GetFrame(), &input, input.Multiple(), &suppressed, &canceled);
>   if (suppressed) {
>     if (canceled) {
>       SetFilesAndDispatchEvents(nullptr);
>     }
>     return;
>   }"

and, in the same function:

> "bool is_directory =
>         input.FastHasAttribute(html_names::kWebkitdirectoryAttr);
>     if (is_directory)
>       params.mode = FileChooserParams::Mode::kUploadFolder;
>     else if (input.FastHasAttribute(html_names::kMultipleAttr))
>       params.mode = FileChooserParams::Mode::kOpenMultiple;
>     else
>       params.mode = FileChooserParams::Mode::kOpen;"

**Supporting — the select path (`html_select_element.cc`, lines 1810–1833):** `HTMLSelectElement::showPicker` has **no** file/color exemption and checks cross-origin first, exactly matching the spec's "this is a select element" disjunct:

> "void HTMLSelectElement::showPicker(ExceptionState& exception_state) {
>   Document& document = GetDocument();
>   LocalFrame* frame = document.GetFrame();
>   if (frame) {
>     if (!frame->IsSameOrigin()) {
>       exception_state.ThrowSecurityError(
>           "showPicker() called from cross-origin iframe.");
>       return;
>     }
>   }
>   if (IsDisabledFormControl()) {
>     exception_state.ThrowDOMException(DOMExceptionCode::kInvalidStateError, …"

**Supporting — no already-open guard in the input path.** `HTMLInputElement::showPicker` contains no `HasOpenedPopup()` / `IsPickerVisible()` check; the only `HasOpenedPopup()` use in the file is at line 352 in `ShouldHaveFocusAppearance` ("Don't draw focus ring for an input that has its popup open."), unrelated to `showPicker`. `InputTypeView::OpenPopupView()` is an empty body (`input_type_view.cc` line 135), i.e. the base has no guard, and `FileInputType::OpenPopupView` has none either.

**Supporting — the trusted `input`+`change` dispatch after the CDP answer (`file_input_type.cc`, lines 465–481):**

> "void FileInputType::SetFilesAndDispatchEvents(FileList* files) {
>   bool force = force_change_event_;
>   force_change_event_ = false;
>   if (SetFiles(files) || force) {
>     GetElement().DispatchInputEvent();
>     GetElement().DispatchChangeEvent();
>   } else {
>     GetElement().DispatchCancelEvent();
>   }
> }"

---

## 3. CDP `Page.setInterceptFileChooserDialog` and `Page.fileChooserOpened` (Page.pdl at the tag)

**URL:** https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/public/devtools_protocol/domains/Page.pdl?format=TEXT
**Saved:** `Page.pdl` — status 200, 61911 bytes, sha256 `e944a3b19fa2c87b4ed0a84cca85b16b127618725394496ba046a2dfdf9405be`
**Locator:** `Page.pdl` lines 1282–1304 (domain `Page`).

**Quote — the command (lines 1282–1288):**

> "command setInterceptFileChooserDialog
>     parameters
>       boolean enabled
>       # If true, cancels the dialog by emitting relevant events (if any)
>       # in addition to not showing it if the interception is enabled
>       # (default: false).
>       experimental optional boolean cancel"

**Quote — the event (lines 1294–1304):**

> "# Emitted only when `page.interceptFileChooser` is enabled.
>   event fileChooserOpened
>     parameters
>       # Id of the frame containing input node.
>       experimental FrameId frameId
>       # Input mode.
>       enum mode
>         selectSingle
>         selectMultiple
>       # Input node id. Only present for file choosers opened via an `<input type="file">` element.
>       experimental optional DOM.BackendNodeId backendNodeId"

**Reading.** `Page.setInterceptFileChooserDialog {enabled:true}` is the switch that makes `Page.fileChooserOpened` fire at all ("Emitted only when `page.interceptFileChooser` is enabled"). The event's `mode` enum is **`selectSingle` | `selectMultiple` only** — there is no `selectFolder`/directory member, which is why a `webkitdirectory` input is reported as `selectSingle` even though `FileInputType::OpenPopupView` internally sets `FileChooserParams::Mode::kUploadFolder` (§2 quote). The `backendNodeId` is the handle the ANSWER path needs; it is documented as present only for `<input type="file">`.

---

## 4. CDP `DOM.setFileInputFiles` (DOM.pdl at the tag)

**URL:** https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/public/devtools_protocol/domains/DOM.pdl?format=TEXT
**Saved:** `DOM.pdl` — status 200, 34575 bytes, sha256 `50c460459e502a0a75a07de32e0589126c737a62f14c6b969df73009f958f702`
**Locator:** `DOM.pdl` lines 681–691.

**Quote — the command:**

> "# Sets files for the given file input element.
>   command setFileInputFiles
>     parameters
>       # Array of file paths to set.
>       array of string files
>       # Identifier of the node.
>       optional NodeId nodeId
>       # Identifier of the backend node.
>       optional BackendNodeId backendNodeId
>       # JavaScript object id of the node wrapper.
>       optional Runtime.RemoteObjectId objectId"

**Reading.** `backendNodeId` is a first-class parameter of `DOM.setFileInputFiles`, so the ANSWER leg's "answer the `Page.fileChooserOpened` event's `backendNodeId`" is a documented, first-class operation — not a workaround.

**Supporting — the renderer-side implementation (`third_party/blink/renderer/core/inspector/inspector_dom_agent.cc`, lines 1795–1817):**

> "protocol::Response InspectorDOMAgent::setFileInputFiles(
>     std::unique_ptr<protocol::Array<String>> files,
>     std::optional<int> node_id,
>     std::optional<int> backend_node_id,
>     std::optional<String> object_id) {
>   Node* node = nullptr;
>   protocol::Response response =
>       AssertNode(node_id, backend_node_id, object_id, node);
>   if (!response.IsSuccess())
>     return response;
>   auto* html_input_element = DynamicTo<HTMLInputElement>(node);
>   if (!html_input_element ||
>       html_input_element->FormControlType() != FormControlType::kInputFile) {
>     return protocol::Response::ServerError("Node is not a file input element");
>   }
>   Vector<String> paths;
>   for (const String& file : *files)
>     paths.push_back(file);
>   To<HTMLInputElement>(node)->SetFilesFromPaths(paths);
>   return protocol::Response::Success();
> }"

**Supporting — the browser-side handler (`content/browser/devtools/protocol/dom_handler.cc`, saved `dom_handler.cc`, 200, 1829 bytes, sha256 `42abef340e07a26ac2046a01cf58f5c305e61d572c4270826430a72249324081`; `DOMHandler::SetFileInputFiles` at lines 42–56):**

> "Response DOMHandler::SetFileInputFiles(
>     std::unique_ptr<protocol::Array<std::string>> files,
>     std::optional<DOM::NodeId> node_id,
>     std::optional<DOM::BackendNodeId> backend_node_id,
>     std::optional<String> in_object_id) {
>   if (!allow_file_access_)
>     return Response::ServerError("Not allowed");
>   if (host_) {
>     for (const std::string& file : *files) {
>       ChildProcessSecurityPolicyImpl::GetInstance()->GrantReadFile(
>           host_->GetProcess()->GetID(), base::FilePath::FromUTF8Unsafe(file));
>     }
>   }
>   return Response::FallThrough();
> }"

**Reading.** The command requires the target to be a `kInputFile` input (server error otherwise), the browser side must have `allow_file_access` (the `--allow-file-access-from-files`-style devtools flag; `Not allowed` otherwise), and it grants read access to the named paths for the renderer process before falling through to the renderer agent, which calls `SetFilesFromPaths` → `FileInputType::SetFilesAndDispatchEvents` → `DispatchInputEvent()` + `DispatchChangeEvent()` (§2 quote). Those dispatches are the source of the trusted `input`+`change` pair.

---

## 5. Flags — claims the quotes do NOT support

### F1 (HIGH) — "page script cannot construct the spec's SecurityError case" is **false** as written; the sources make it reachable.

`claims.json` (`C1.limit`, last sentence) states:

> "The cross-origin legs prove the child's own script opens its own picker and that the parent cannot reach the child document; they do NOT prove the spec's SecurityError step is reachable, because page script cannot construct it."

The quotes contradict the causal clause. The spec's SecurityError step (§1) fires when the element's relevant settings object's origin is not same-origin with the **top-level** origin **and** the element is a select **or** its type is not File Upload/Color. Chromium's implementation (§2) tests the **element's own frame** against the **top** frame via `LocalFrame::IsSameOrigin()`, with the File/Color exemption. Both are conditions on the *callee element's* type and frame — **not** on who calls it. So the cross-origin **child's own script** calling `showPicker()` on a **non-file** input inside itself hits the SecurityError branch. The child's own script is page script.

Measured on the target binary (`/usr/bin/chromium` 155.0.8059.84, `--headless=new`, parent `127.0.0.1:18761`, child `127.0.0.1:18762`, cross-origin by port), evaluating **inside the child's own execution context** (child context id 3, origin `http://127.0.0.1:18762`, `window.top !== window`):

| call (from the child's own script) | result |
|---|---|
| `document.getElementById('text').showPicker()` — `<input type=text>` | `SecurityError` — "showPicker() called from cross-origin iframe." |
| `document.getElementById('text_disabled').showPicker()` — `<input type=text disabled>` | `SecurityError` — "showPicker() called from cross-origin iframe." (mutability **not** reached) |
| `document.getElementById('file').showPicker()` — `<input type=file>` | `NotAllowedError` — "requires a user gesture." (SecurityError correctly skipped: File Upload exemption) |
| `document.getElementById('file_disabled').showPicker()` — `<input type=file disabled>` | `InvalidStateError` — "cannot be used on immutable controls." (exemption skipped the cross-origin branch) |

**Positive control — same origin, `<input type=text disabled>`, evaluated in the parent:** `InvalidStateError` — "cannot be used on immutable controls."

Parent-side cross-access in the same run: `contentDocument === null`, `contentWindow.document` → `SecurityError`. So the *parent cannot reach the child document* is **confirmed**; the *child cannot construct the SecurityError case* is **refuted** for every non-file, non-select input type.

**Raw JSON:** `.ufo/waves/round-80-seats/R80Scout/probes/discriminating-orders.json` (5 cases + frame facts + the two source orders it tests); probe script `probes/probe-discriminating.mjs`.

**Scope of the defect.** The claim's *conclusion* (the r80 cross-origin legs do not prove the SecurityError step is reachable) survives, but its *reason* does not, and the reason is what a reader would carry away. More importantly, the r80 fixture as built **cannot** reach the SecurityError branch on a file input, because the File Upload exemption removes it — so the r80 cross-origin legs prove something weaker than "the SecurityError path was exercised". The `sp80-cross-origin` leg exercises the *exemption*, not the error.

The r80 driver header comment says the disabled child input "discriminates Chromium's cross-origin-before-mutability order from the spec's" (`scripts/chrome-cdp-showpicker-round80.mjs` line 12–13). **That discrimination also fails as built:** the child's `dis` input is `<input type=file disabled>`, so the File Upload exemption skips the cross-origin branch entirely and Chromium falls through to the mutability check → `InvalidStateError`, exactly as the **spec** orders it (spec step 1 = mutability, step 2 = cross-origin). Measured: the disabled **file** input in the cross-origin child yields `InvalidStateError`; the disabled **text** input in the same cross-origin child yields `SecurityError` (Chromium's cross-origin-first order). Only the *non-file* disabled input discriminates the two orders. The r80 fixture has no non-file disabled input in the cross-origin frame, so **the order is not discriminated by the current legs**.

### F2 (MEDIUM) — "the child's own script opens its own picker (no SecurityError)" is true only because of the File Upload exemption, and the fixture's `dis` leg does not prove the order.

Per F1, the child's file input reaching a picker is the **exemption** firing, not a demonstration that cross-origin is harmless. The spec's own note is explicit that File/Color were "never been guarded by an origin check" — i.e. the file case is the *historical exception*, not the general rule. Any record that reads the r80 cross-origin leg as "cross-origin is fine" inverts the spec.

### F3 (MEDIUM) — "a disabled input in the cross-origin frame throws InvalidStateError and does not consume the activation" holds only for the **file** input; for a non-file disabled input the cross-origin branch fires first and the error is `SecurityError`.

Measured, same runs: `file_disabled` (file, disabled, cross-origin) → `InvalidStateError`; `text_disabled` (text, disabled, cross-origin) → `SecurityError`. The r80 law as worded ("a disabled input in the cross-origin frame") does not pin the input type, so it is under-specified: for a non-file input the law as stated is false on this binary. The activation half of the law does hold and is independently confirmed: after the failed call on the disabled file input the child's `navigator.userActivation.isActive` was still `true` (`{"isActive":true,"hasBeenActive":true}`), and a subsequent `showPicker()` on the enabled file input in the same activation window succeeded (`ok: true`), consistent with §2's ordering — the `SecurityError`/`InvalidStateError` returns happen **before** `LocalFrame::ConsumeTransientUserActivation(frame)` (line 2679), so a failed call does not consume the activation.

### F6 (HIGH) — the discriminating measurement, MEASURED (not merely sourced)

The r80 fixture cannot discriminate Chromium's check order from the spec's, because every cross-origin input in it is `type=file` and the exemption removes the cross-origin branch. The following five-case measurement **does** discriminate, and it is the natural first leg of the r81 frontier.

Setup: `/usr/bin/chromium` 155.0.8059.84 `--headless=new`; parent `http://127.0.0.1:18761`, child `http://127.0.0.1:18762` (different port ⇒ different origin); child confirmed cross-origin (`window.top !== window` in the child, `contentDocument === null` and `contentWindow.document` → `SecurityError` in the parent); the child's calls are evaluated **in the child's own execution context** (context id 3).
**Raw JSON:** `.ufo/waves/round-80-seats/R80Scout/probes/discriminating-orders.json`; script `probes/probe-discriminating.mjs`.

| case | call site | input | observed | expectation met |
|---|---|---|---|---|
| A | child's own script | cross-origin `<input type=text>` | `SecurityError` — "showPicker() called from cross-origin iframe." | yes |
| **B** | **child's own script** | **cross-origin `<input type=text disabled>`** | **`SecurityError`** — "showPicker() called from cross-origin iframe." (**mutability not reached**) | yes |
| C | parent (same-origin control) | `<input type=text disabled>` | `InvalidStateError` — "cannot be used on immutable controls." | yes |
| D | child's own script | cross-origin `<input type=file>` | `NotAllowedError` — "requires a user gesture." | yes (exemption skips SecurityError) |
| E | child's own script | cross-origin `<input type=file disabled>` | `InvalidStateError` — "cannot be used on immutable controls." | yes (exemption skips SecurityError) |

**Case B is the discriminator.** Chromium reports `SecurityError` for a cross-origin **disabled** non-file input, i.e. its cross-origin check at line 2657 precedes its mutability check at line 2666. The spec orders them the other way (step 1 mutability → step 2 cross-origin), so the spec would report `InvalidStateError` for the identical call. Case C is the positive control that pins the mutability error to the mutability path, and cases D/E show the file/color exemption removing the cross-origin branch entirely — which is precisely why the r80 file-only legs cannot discriminate, and why the r80 `sp80-cross-origin` leg exercises the **exemption** rather than the SecurityError path.

Cases A and B together are the direct refutation of the "page script cannot construct it" wording: the child's own script — page script — constructs the SecurityError case for any non-file, non-select input type.

### F4 (LOW, corroborating) — the two `Runtime.evaluate {userGesture:true}` calls and the deferred-timer law are consistent with the source, and the "no already-open guard" claim is supported.

Measured on the target binary: two `Runtime.evaluate` calls with `userGesture:true` on the same file input **both** returned `{"id":"f","ok":true}` and produced **two** `Page.fileChooserOpened` events (`chooserEventsDelta: 2`, both `mode: "selectSingle"`, same `backendNodeId`), so no already-open guard blocks the second call. The source agrees: `HTMLInputElement::showPicker` has no `HasOpenedPopup()`/`IsPickerVisible()` check (§2), and `FileInputType::OpenPopupView` has none.

The deferred case: a trusted CDP click on a child button whose handler defers `showPicker()` through `setTimeout(…, 0)` returned `{"id":"f","ok":true}` and opened a chooser — consistent with `kActivationLifespan = base::Seconds(5)` (`uas.h`) keeping the transient activation live across the macrotask hop. Note the flip side, also measured: after the successful deferred call the child's activation was `{"isActive":false,"hasBeenActive":true}` — i.e. the success path **does** consume the transient activation (line 2679), matching the two-successive-`userGesture` observation.

### F5 (LOW) — the ANSWER leg's "exact bytes and fires trusted `input`+`change`" is supported by the source chain and reproduced.

`Page.fileChooserOpened` carries `backendNodeId`; `DOM.setFileInputFiles` accepts `backendNodeId`; the browser handler grants read access to the paths; the renderer agent requires a `kInputFile` node and calls `SetFilesFromPaths`; `FileInputType::SetFilesAndDispatchEvents` dispatches `input` then `change`. Measured: answering the event's `backendNodeId` with `DOM.setFileInputFiles` on a 23-byte file delivered `{"len":1,"name":"upload.txt","size":23}` to the input and fired `{"type":"input","isTrusted":true,"id":"f"}` followed by `{"type":"change","isTrusted":true,"id":"f"}` — both `isTrusted: true`, matching the claim.

**One caveat on "exact bytes":** `DOM.setFileInputFiles` transfers the **path**; the browser grants the renderer read access to that path and the renderer re-reads it (`SetFilesFromPaths`). The claim "delivers the exact bytes" is true of the delivered `File` (name/size/type), but the mechanism is path-based, so byte-identity is a property of the file on disk at answer time, not a byte payload carried by CDP. A record that says "CDP carries the bytes" would be wrong; "the exact bytes are delivered" is right.

---

## 6. Source-order summary (the three checks, per the tag)

```
HTMLInputElement::showPicker(ExceptionState&)   html_input_element.cc:2652
  1. cross-origin  (2657)  -> SecurityError      [skipped for kInputFile / kInputColor]
  2. mutability    (2666)  -> InvalidStateError
  3. gesture       (2673)  -> NotAllowedError
  4. ConsumeTransientUserActivation(frame) (2679)
  5. input_type_view_->OpenPopupView()      (2681) -> FileInputType::OpenPopupView
                                                   -> probe::FileChooserOpened(...)  (suppressed under CDP interception)
                                                   -> FileChooserParams (kUploadFolder / kOpenMultiple / kOpen)
```

Spec order (§1) is **mutability → cross-origin → gesture**; Chromium's is **cross-origin → mutability → gesture**. The two orders are indistinguishable on a file input (exemption removes the cross-origin branch) and distinguishable only on a **non-file** input, where Chromium yields `SecurityError` and the spec yields `InvalidStateError`.

---

## 7. Residual unknowns / not established here

- The **browser-process** side of `Page.setInterceptFileChooserDialog` (which content-layer component flips the interception flag and emits `Page.fileChooserOpened`) was not pinned to a specific file at this tag; `page_handler.cc`, `devtools_instrumentation.cc`, `devtools_agent_host_impl.cc`, `render_frame_devtools_agent_host.cc` and `web_contents_impl.cc` were all fetched and saved but contain no `FileChooserOpened`/`fileChooserOpened` string (grep-clean). The renderer-side `probe::FileChooserOpened` hook is likewise not located at this tag (the `third_party/blink/renderer/core/probe/` tree has no such symbol in `core_probes.{h,cc}`), and `third_party/blink/renderer/core/loader/filechooser.h` 404s. The **protocol contract** (Page.pdl §3) is authoritative for the event's shape and is fully quoted above; the emission site's exact file is **unresolved**.
- `Page.setInterceptFileChooserDialog`'s `cancel` parameter and the `Page.fileChooserOpened` `mode` value for `webkitdirectory` were **not** measured (no `selectFolder` exists in the enum; the internal `kUploadFolder` is a `FileChooserParams` detail that the CDP event does not expose).
- The `Runtime.evaluate {userGesture:true}` → transient-activation plumbing was exercised only **behaviorally** (both calls succeeded, activation present); the specific inspector-side code path was not located at this tag (`content/browser/devtools/protocol/runtime_handler.cc` 404s; the domain handlers at this tag live in `content/browser/devtools/protocol/` and the runtime agent under `third_party/blink/renderer/core/inspector/`, but the `userGesture` plumbing was not isolated to a specific line).
- Chromium's `webkitdirectory` → `selectSingle` reporting was **not** measured directly (my probes used a plain file input); it is inferred from the Page.pdl enum having no directory member plus `FileInputType::OpenPopupView`'s `kUploadFolder`, both quoted above. The r80 driver measures it; I did not.
- `LocalFrame::IsSameOrigin()` compares against `Tree().Top()`, i.e. the **top** frame, whereas the spec says "top-level origin" — these coincide for the r80 fixture's single-level iframe, but a **nested** cross-origin frame (cross-origin grandchild) would exercise a difference between Chromium's `Tree().Top()` and any per-parent reading. Not measured here.

---

## 8. Files

**Saved sources + manifest:** `.ufo/waves/round-80-seats/R80Scout/sources/` (22 files) and `sources/FETCH.txt` (status / bytes / sha256 / name / URL per row).
**Report (this file):** `.ufo/waves/round-80/w1/R80Scout.md`
**Probe scripts + raw probe output (committed under the seat dir, never the walked trees):** `.ufo/waves/round-80-seats/R80Scout/probes/`
— `discriminating-orders.json` (**the raw JSON for the F6 discriminating measurement**), `probe-discriminating.mjs` (its script), `probe2.json`, `probe-laws.mjs`, `probe-order.mjs`, `probe-securityerror.mjs`.

Scratch root `/fast/scratch/hyaku/tabi-r80/R80Scout/` was used for the working copies and **deleted** before yield; every artifact above was copied into the seat dir first.

**No mutating git/jj command was run. No file in the walked trees was written except this report.**
