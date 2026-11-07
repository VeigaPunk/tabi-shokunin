# R81Scout — r81 source-law findings (WHATWG HTML, Chromium 155.0.8059.84, CDP DOM.pdl)

Seat: R81Scout (read-only scout). Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Round 81 / wave w1 / capability `chromium-showpicker-linux` generation r81.

All fetched sources are saved under
`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-81-seats/R81Scout/sources/`
with a per-file manifest (`FETCH.txt`: URL, http status, bytes, sha256 of the decoded bytes
and of the raw base64 body) and the exact extracted quotes under `sources/quotes/`
(each quote file holds one verbatim quote; `wc -w` counts are given below and were produced
by `wc -w` on those files).

Tooling: no installs performed. Everything used was preinstalled: `curl`, `base64`,
`python3` (3.14), `sha256sum` (coreutils), `wc`. No pacman/uv/npm action was taken.

---

## 1. WHATWG HTML `showPicker()` — the SecurityError step and its exact condition

* URL: `https://html.spec.whatwg.org/multipage/input.html`
* HTTP status: **200** — 687 515 bytes downloaded (saved as `html_input.html`,
  sha256 `b0202de1c0b422d94d7aa23b4f1b0e3126d9d044bf7076394b6e00451f0fcd16`).
* Document identity: page title `HTML Standard`, "HTML Living Standard — Last Updated 6 November 2026".
* Locator: section **4.10.5.5 `showPicker()`** — anchor `#dom-input-showpicker`;
  in the saved file the definition is at **lines 5827–5840** (`<dfn ... id=dom-input-showpicker data-dfn-type=method>`,
  "The `HTMLInputElement` `showPicker()` and `HTMLSelectElement` `showPicker()` method steps are:").
  The steps are an `<ol>`; the **first** `<li>` is the mutability step (lines 5830–5831),
  the **second** `<li>` is the origin/SecurityError step (lines 5832–5836),
  the third `<li>` is the transient-activation step (line 5841).
* A rendering of the list items (tags stripped, entities unescaped) is what the quotes below are
  taken from; they are verbatim, including the source's own line wrapping.

**Quote 1a — the SecurityError step and its exact condition** (from the second `<li>`,
lines 5835–5836) — **18 words** (`wc -w`):

> this's type attribute is not in the File Upload state or Color state, then throw a
>  "SecurityError" DOMException.

**Quote 1b — the origin half of that condition** (lines 5832–5833) — **17 words**:

> If this's relevant settings object's origin is not same origin with
>  this's relevant settings object's top-level origin

**Quote 1c — the step that comes FIRST** (lines 5830–5831) — **10 words**:

> If this is not mutable, then throw
>  an "InvalidStateError" DOMException.

**Quote 1d — the File/Color exemption note** (lines 5838–5840) — **20 words**:

> File and Color inputs are exempted from this check for historical
>  reason: their input activation behavior also shows their pickers

Full second `<li>` condition, assembled from lines 5832–5836 (for the L1's note text, not a
`wc -w`-limited quote): *origin not same-origin with the relevant settings object's top-level
origin, **and** (this is a select element, **or** this's type attribute is not in the File Upload
state or Color state) → throw a "SecurityError" DOMException.*

---

## 2. Chromium/blink `HTMLInputElement::showPicker` at tag 155.0.8059.84 — check order

* URL: `https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/renderer/core/html/forms/html_input_element.cc?format=TEXT`
* HTTP status: **200** — 135 428 bytes of base64 downloaded → 101 570 bytes decoded
  (saved `html_input_element.cc`, sha256 `405b52c70185820ead77b2338f054eb8220fdc7ef176de671db63c349282e96d`;
  raw base64 sha256 `81b35d96184a983226f888faa5ac4f9a57be7aa882e9bb4b5d6d09650b7f1b10`).
* **Path caveat (important for the L1's fetcher):** at this tag the file lives at
  `third_party/blink/renderer/core/html/forms/html_input_element.cc`.
  `third_party/blink/renderer/core/html/html_input_element.cc` returns **404** — the
  `forms/` subdirectory was split out before this tag.
* Locator: `void HTMLInputElement::showPicker(ExceptionState&)` — **lines 2650–2682**;
  the cross-origin test is lines 2657–2664, the mutability test lines 2666–2671,
  the gesture test lines 2673–2678, the picker open line 2681.
* `isMutable()` is defined immediately above at lines 2643–2648
  (`!IsDisabledFormControl() && !(input_type_->SupportsReadOnly() && IsReadOnly())`),
  so a **disabled** input is immutable → InvalidStateError branch.

**Quote 2a — the cross-origin failure message** (line 2661) — **5 words**:

> showPicker() called from cross-origin iframe.

**Quote 2b — the cross-origin test** (line 2659) — **3 words**:

> if (!frame->IsSameOrigin()) {

**Quote 2g — the file/colour exemption guard wrapping that test** (lines 2657–2658) — **10 words**:

> FormControlType() != FormControlType::kInputFile &&
>       FormControlType() != FormControlType::kInputColor && frame) {

**Quote 2c — the mutability failure message** (line 2669) — **7 words**:

> HTMLInputElement::showPicker() cannot be used on immutable controls.

**Quote 2d — the mutability test** (line 2666) — **3 words**:

> if (!isMutable()) {

**Quote 2e — the gesture test** (line 2673) — **3 words**:

> if (!LocalFrame::HasTransientUserActivation(frame)) {

**Quote 2f — the gesture failure message** (line 2676) — **5 words**:

> HTMLInputElement::showPicker() requires a user gesture.

**Source order, as read from the file (this is the whole point of the r81 order discriminator):**

| # | check | lines | outcome |
|---|-------|-------|---------|
| 1 | cross-origin (`!frame->IsSameOrigin()`), skipped for `kInputFile` / `kInputColor` | 2657–2664 | **SecurityError** `"showPicker() called from cross-origin iframe."` |
| 2 | mutability (`!isMutable()`) | 2666–2671 | **InvalidStateError** `"…cannot be used on immutable controls."` |
| 3 | transient user activation (`!HasTransientUserActivation`) | 2673–2678 | **NotAllowedError** `"…requires a user gesture."` |

Origin semantics for check 1 come from `LocalFrame::IsSameOrigin()` — `local_frame.cc`
(sha256 `f314885f156e923a88eed7087b00c99aa0f55d13787aebb15398fc88fa5a9d7f`), which compares the
frame's security origin with `Tree().Top()`'s origin — i.e. the **top-level** origin, matching the
spec's wording.

---

## 3. CDP `DOM.setFileInputFiles` in DOM.pdl at the same tag

* URL: `https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/public/devtools_protocol/domains/DOM.pdl?format=TEXT`
* HTTP status: **200** — 46 100 bytes of base64 → 34 575 bytes decoded (saved `dom.pdl`,
  sha256 `50c460459e502a0a75a07de32e0589126c737a62f14c6b969df73009f958f702`;
  raw base64 sha256 `8fc257c54f6475c27f52a7c4656dda98b24c41381edf0ea729c8a6e948301c2d`).
* **Path caveat:** at this tag the CDP domain `.pdl` files live under
  `third_party/blink/public/devtools_protocol/domains/`. Both
  `third_party/blink/renderer/core/inspector/dom.pdl` and
  `content/browser/devtools/protocol/dom.pdl` return **404**.
* Locator: `DOM` domain, `command setFileInputFiles` — **lines 681–691** of `dom.pdl`.

**Quote 3a — the command's own description** (line 681) — **9 words**:

> # Sets files for the given file input element.

**Quote 3b — the `files` parameter** (line 685) — **4 words**:

> array of string files

Full parameter list (lines 682–691), verbatim:

```
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

**Does DOM.pdl mention `accept` or directories? No — neither.**
`grep -c -i accept dom.pdl` → **0**; `grep -c -i director dom.pdl` → **0**;
`grep -c setFileInputFiles dom.pdl` → 1 (the command above). The only "file" wording in the
command is `files` ("Array of file paths to set") — paths, not MIME types, not directory semantics.

**Where the command actually lands** — `third_party/blink/renderer/core/inspector/inspector_dom_agent.cc`
(sha256 `e7c983b4b00f47757dbb29c69a129693b8ac61a2e0e60643aa124bbae203c84f`),
`InspectorDOMAgent::setFileInputFiles` at lines 1795–1818:

* **Quote 3f** (line 1807) — **8 words**:
  > return protocol::Response::ServerError("Node is not a file input element");
* **Quote 3d** (lines 1813–1814) — **7 words**:
  > for (const String& file : *files)
  >     paths.push_back(file);
* **Quote 3e** (line 1816) — **1 word**:
  > To<HTMLInputElement>(node)->SetFilesFromPaths(paths);

So the CDP surface is: *paths in, node selector, no accept, no directory flag*; the browser-side
"is this a directory / does accept apply" decision is entirely Chromium's, in
`third_party/blink/renderer/core/html/forms/file_input_type.cc`
(sha256 `f96265db986a6119ef805a2d74ccd505ad6eade08b6fccf5e110685f8ee9f705`):

* `FileInputType::SetFilesFromPaths` (line 535): if the input has `webkitdirectory` it calls
  `SetFilesFromDirectory(paths[0])` (**Quote 5b**, lines 540–541, **4 words**:
  > if (input.FastHasAttribute(html_names::kWebkitdirectoryAttr)) {
  >     SetFilesFromDirectory(paths[0]);
  ), otherwise it builds the file list directly with **no accept check anywhere**.
* `CollectAcceptTypes` is called from exactly two places, lines 224 and 530 — both in the
  *file-chooser* paths (`OpenPopupView`, `SetFilesFromDirectory`), i.e. accept is consumed when a
  chooser is opened, not when files are set programmatically.
* `CreateFileList` (line 301) computes `relative_path` and calls `File::CreateWithRelativePath`
  (line 352) when a `base_dir` is present — that is where `webkitRelativePath` comes from.
* `SetFilesAndDispatchEvents` (line 465) dispatches the UA-generated `input` then `change` events.

For completeness on the interception half of the coverage:
`third_party/blink/public/devtools_protocol/domains/Page.pdl` (sha256 `e944a3b19fa2c87b4ed0a84cca85b16b127618725394496ba046a2dfdf9405be`),
`command setInterceptFileChooserDialog` at line 1282 — **Quote 3c** (lines 1278–1279), **10 words**:

> Intercept file chooser requests and transfer control to protocol clients.

---

## 4. WHATWG HTML `accept` attribute — hint/filter, not validator

* URL: `https://html.spec.whatwg.org/multipage/input.html` (same fetch as item 1)
* HTTP status **200**, sha256 `b0202de1c0b422d94d7aa23b4f1b0e3126d9d044bf7076394b6e00451f0fcd16`.
* Locator: attribute `accept` — anchor `#attr-input-accept`; in the saved file the definition
  `<dt><code><var>accept</var></code>` is at **line 4066**, the prose runs **lines 4067–4089**.

**Quote 4a — the attribute's own characterisation** (lines 4067–4068) — **18 words**:

> attribute may be specified to provide user agents with a hint of what file types will be
>  accepted.

**Quote 4b — what a UA may do with it** (lines 4080–4081) — **21 words**:

> User agents may use the value of this attribute to display a more appropriate user interface
>  than a generic file picker.

**Quote 4c — the strongest requirement on the attribute, and its scope** (lines 4088–4089) — **20 words**:

> User agents should prevent the user from selecting files that are not accepted by one (or more)
>  of these tokens.

`accept` is therefore: a **hint** to the UA (the spec's own word), used to shape the *chooser UI*,
and a SHOULD-level duty on the UA about **what the user may select**. There is **no** normative
requirement anywhere in the section that a *file already set on the control* must match the
attribute, and no MUST anywhere in it.

---

## Flags — claims the quotes do NOT support, and the ones they do

1. **The r81 order discriminator is SUPPORTED by both sources.**
   The spec's `showPicker()` steps put **mutability first** (quote 1c, first `<li>`, InvalidStateError)
   and the **origin check second** (quotes 1a/1b, second `<li>`, SecurityError).
   Chromium's implementation does the opposite: the cross-origin test (quote 2b) precedes the
   mutability test (quote 2d) — origin first, mutability second. So a **disabled `type=date`
   input in a cross-origin iframe throws SecurityError** in Chromium 155, whereas a spec-ordered
   implementation would have thrown InvalidStateError first. Same-origin disabled input hits
   quote 2c → **InvalidStateError** (`isMutable()` is false for a disabled control, lines 2643–2648).
   Leg (2) of the coverage is therefore grounded in source, not merely asserted.
   - Caveat to state in the knowledge note: the spec's second step only reaches SecurityError for
     a control that is *not* in the File Upload or Color state (quote 1a) — `type=date` qualifies,
     but `type=file` and `type=color` are exempted (quote 1d / Chromium quote 2g). The exemption is
     consistent between spec and Chromium; do not generalise "cross-origin ⇒ SecurityError".

2. **`accept` is NOT normative validation — SUPPORTED.**
   Quote 4a calls it a *hint*; quote 4b is a *may* about the UI; quote 4c is a *should* about **the
   user's selection**. No MUST binds the attribute to the control's file list. Combined with
   Chromium: `accept` is consumed only by the chooser paths (`CollectAcceptTypes` at
   file_input_type.cc lines 224 and 530), while `SetFilesFromPaths` — the path a programmatic
   answer takes — never consults it. So the r81 claim "**accept filters the dialog, not a
   programmatic answer**" is supported by the sources.
   - Precision flag: the correct phrasing is "the spec's accept requirement is a SHOULD on the
     UA about user selection in the chooser", *not* "the spec says accept is unenforced".
     Writing "normative validation" anywhere in the note would be unsupported.

3. **CDP `DOM.setFileInputFiles` says nothing about `accept` or directories — SUPPORTED.**
   Quote 3b is `array of string files`; the pdl contains zero occurrences of "accept" and zero of
   "director". Any note claiming "CDP validates accept" or "CDP has a directory flag" is
   unsupported by DOM.pdl.
   - Corroboration that the *behaviour* is Chromium's, not the protocol's: `setFileInputFiles`
     → `SetFilesFromPaths` → (webkitdirectory present) `SetFilesFromDirectory` → browser-side
     `EnumerateChosenDirectory` (`file_chooser.cc`), or (no webkitdirectory) direct file-list
     construction with no accept check.

4. **Leg (3) caveat worth putting in the note: the directory answer is asynchronous and goes
   through the browser.** `DOM.setFileInputFiles` naming a *directory* on a `webkitdirectory`
   input does not synchronously produce files in the renderer: `SetFilesFromDirectory` (file_input_type.cc
   line 525) opens a chooser with `Mode::kUploadFolder` and calls `EnumerateChosenDirectory`,
   which round-trips to the browser and returns via `FileChooser::DidChooseFiles` →
   `FilesChosen(files, base_directory)`. The `webkitRelativePath` values and the `input`/`change`
   events therefore arrive **asynchronously** — a fixture that reads the file list synchronously
   after the CDP call will observe an empty list. That is a fixture-timing hazard, not a counter
   defect; flag it to the L1 so the driver's wait condition is on the events, not on the CDP reply.

5. **Not covered by these four sources** (state as unknown, do not assert): the exact behaviour of
   a **real click** on an input whose picker is already open (leg 5, second chooser). The
   relevant symbols exist in the fetched sources — `FileInputType::IsPickerVisible`
   (file_input_type.cc line 240), `InputTypeView::OpenPopupView` / `IsPickerVisible`
   (input_type_view.cc lines 135, 143), `HTMLInputElement::IsPickerVisible` (html_input_element.cc
   line 2684) — and `FileInputType::OpenPopupView` (line 197) shows no "picker already open"
   early-out, but the *end-to-end* second-chooser behaviour under
   `Page.setInterceptFileChooserDialog` was not exercised here and must not be quoted as evidence.

6. **Chromium version cross-check:** the local `/usr/bin/chromium` reports
   `Chromium 155.0.8059.84`, matching the `refs/tags/155.0.8059.84` tree used for every fetch
   above. No `?format=TEXT` fetch fell back to `main`.

## Files written by this seat

* `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-81-seats/R81Scout/sources/`
  — `FETCH.txt` (manifest) + 10 fetched sources (decoded + raw base64) + `quotes/` (20 verbatim
  quote files, one per quote, each `wc -w`-countable).
* `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-81/w1/R81Scout/report.md` — this report.
* `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-81/w1/R81Scout.md` — same findings, report-trailer path.

Nothing was written under `.ufo/waves/round-81/` (other than the two report paths named by this
seat's spec) or `corpus/evidence/round81/`; no `.json`/receipt was produced. Scratch root
`/fast/scratch/hyaku/tabi-r81/R81Scout/` was deleted before yield. No git/jj command was run;
no host tool was installed.
