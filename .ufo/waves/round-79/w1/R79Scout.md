# R79Scout — scoped findings (round 79, w1)

**Seat:** R79Scout (read-only scout; leaf member, no dispatch).
**Scope executed:** open and quote four sources with exact locators — WHATWG `showPicker()`, MDN
`HTMLInputElement.showPicker()`, Chromium blink `HTMLInputElement::showPicker` at tag 155.0.8059.84,
and CDP `Runtime.evaluate`'s `userGesture` parameter; save each under
`.ufo/waves/round-79-seats/R79Scout/sources/` with sha256 and http status in `FETCH.txt`; report
URL/status/bytes/sha256/locator/quote; flag any claim a quote does not support.

**Verdict:** FINDINGS. All four sources opened and quoted. **Two claims in the lane's own records are
not supported by the quotes** (one is false as written, one is an inference the receipt cannot carry).
Both are flagged below with the exact counter-evidence. Nothing committed, pushed, or mutated; the
frozen predicate, counter, pins, priors, thresholds and kill rule were read only.

---

## 1. Sources opened (all four)

Full digests, byte counts, statuses and the complete quote list are in
`.ufo/waves/round-79-seats/R79Scout/sources/FETCH.txt`. Every source was fetched **twice** by
independent HTTP GETs and the two fetches were byte-identical.

| id | source | url | status | bytes | sha256 (decoded) |
|---|---|---|---|---|---|
| S216 | WHATWG HTML — input element `showPicker()` | `https://html.spec.whatwg.org/multipage/input.html` | 200 | 687515 | `b0202de1c0b422d94d7aa23b4f1b0e3126d9d044bf7076394b6e00451f0fcd16` |
| S217 | MDN — `HTMLInputElement.showPicker()` | `https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/showPicker` | 200 | 171971 | `db037377f1fbc1ba8b83ff8226d58a663589d2040b6d1f334c870c8945b966ed` |
| S218 | Chromium 155.0.8059.84 — `html_input_element.cc` | `…/+/refs/tags/155.0.8059.84/third_party/blink/renderer/core/html/forms/html_input_element.cc?format=TEXT` | 200 | 135428 wire → 101570 decoded, 2818 lines | `405b52c70185820ead77b2338f054eb8220fdc7ef176de671db63c349282e96d` |
| S219 | CDP `Runtime.evaluate` `userGesture` | `…/v8/v8/+/712e1808de2d7416f1276d0deb1ee4ac978132b8/include/js_protocol.pdl?format=TEXT` | 200 | 94320 wire → 70738 decoded, 1848 lines | `678fd97bf64779f0a82dba9e02cc00ab21b18eaec6570b10f7bbd63512cc84f0` |

### The four requested quotes (verbatim, ≤25 words each)

**S216 — WHATWG, `input.html` line 5841-5843** (the `showPicker()` method steps, third step):

> "If this's relevant global object does not have transient activation, then throw a "NotAllowedError" DOMException."

**S216 — WHATWG, `input.html` line 5828-5829** (the method steps, first step):

> "If this is not mutable, then throw an "InvalidStateError" DOMException."

**S216 — WHATWG, `input.html` lines 5832-5836** (the method steps, second step):

> "then throw a "SecurityError" DOMException."

**S216 — WHATWG, `input.html` lines 5848-5853** (the "To show the picker, if applicable" sub-algorithm):

> "Consume user activation given element's relevant global object."

**S217 — MDN, `showPicker.html` line 1650** (Exceptions → NotAllowedError DOMException):

> "Thrown if not explicitly triggered by a user action such as a touch gesture or mouse click (the picker requires Transient activation)."

**S218 — Chromium, `html_input_element.cc` lines 2673-2676** (`HTMLInputElement::showPicker`):

> "if (!LocalFrame::HasTransientUserActivation(frame)) { exception_state.ThrowDOMException( DOMExceptionCode::kNotAllowedError, "HTMLInputElement::showPicker() requires a user gesture.");"

**S218 — Chromium, `html_input_element.cc` lines 2666-2669** (the mutability step):

> "if (!isMutable()) { exception_state.ThrowDOMException( DOMExceptionCode::kInvalidStateError, "HTMLInputElement::showPicker() cannot be used on immutable controls.");"

**S219 — CDP, `js_protocol.pdl` lines 1541-1542** (`domain Runtime` (line 1041) → `command evaluate`
(line 1520) → parameters):

> "# Whether execution should be treated as initiated by user in the UI."
> "optional boolean userGesture"

### Path corrections (independently re-derived; both agree with the lane's r79 rows)

- **S218 path.** The implementation is at `third_party/blink/renderer/core/html/forms/`. Both
  `third_party/blink/renderer/modules/html/` and `third_party/blink/renderer/core/html/` return 404 at
  this tag.
- **S219 path — the brief's premise is wrong.** There is **no `Runtime.pdl`** in the Chromium tree at
  tag 155.0.8059.84. Verified by listing `third_party/blink/public/devtools_protocol/domains/` at the
  tag: **52** `.pdl` files, none named `Runtime.pdl` (also checked at `refs/heads/main`: 53 files, still
  none). The Runtime domain is a V8 domain; the file is `include/js_protocol.pdl` in the V8 repo at the
  revision Chromium 155.0.8059.84 pins. Chain: `DEPS` line 348 `'v8_revision':
  '712e1808de2d7416f1276d0deb1ee4ac978132b8'`; `DEPS` line 3344-3345 fetches `src/v8` from
  `chromium_git + '/v8/v8.git'` at that revision; `third_party/inspector_protocol/inspector_protocol.gni`
  line 387 `v8_inspector_js_protocol = v8_path_prefix + "/include/js_protocol.pdl"`. This matches the
  lane's own r79 Scribe correction.

---

## 2. Flag: the spec's refusal order is NOT the implementation's order

**Confidence: high** (both orders quoted from the sources above).

The committed note `corpus/knowledge/chromium-showpicker-runtime-round-79.md` line 35 says:

> "The spec's steps state the same order (S218); MDN names the three exception classes and the
> transient-activation requirement (S217)."

**That is false as written.** The two orders differ in their first two steps:

| step | WHATWG (S216) | Chromium (S218) |
|---|---|---|
| 1 | not mutable → **InvalidStateError** (line 5828) | cross-origin → **SecurityError** (lines 2657-2664) |
| 2 | cross-origin → **SecurityError** (line 5832) | not mutable → **InvalidStateError** (lines 2666-2671) |
| 3 | no transient activation → **NotAllowedError** (line 5841) | no transient activation → **NotAllowedError** (lines 2673-2677) |

Chromium checks the **cross-origin rule first**; the spec checks **mutability first**. The two are
transposed, not "the same order".

This is observable, not pedantic: for a **disabled, non-file, non-color input inside a cross-origin
iframe**, the spec requires `InvalidStateError` and Chromium throws `SecurityError`. (Chromium's
cross-origin step exempts file and color inputs — `FormControlType() != kInputFile && … !=
kInputColor` — matching the spec's File/Color exemption, so the exemption agrees; only the *order*
diverges.)

The same transposition appears inside the lane's seat files, which list the two orders correctly and
then call them identical — `.ufo/waves/round-79-seats/R79Scribe/knowledge-note.md` describes Chromium as
"checks the cross-origin rule (file and color exempt), then `!isMutable()`", then says "The spec states
the same order (S216: mutability, then cross-origin, then transient activation)".

**Note what is *not* wrong.** `corpus/SOURCES.md` S216 states the spec's own order correctly ("not
mutable → InvalidStateError, cross-origin → SecurityError with file/color exempt, no transient
activation → NotAllowedError"). The Scribe's *frontier* item is also correct as scoped: it asks whether
the **gesture** check precedes the **mutability** check, and on that pair the spec and Chromium do
agree (mutability before gesture in both). The defect is the broad "the same order" claim.

**Suggested correction (append-only, per the round's convention):** name the claim, state that the spec
orders mutability before cross-origin while Chromium orders cross-origin before mutability, and give
the cross-origin + disabled + non-file/color input as the observable divergence.

---

## 3. Flag: law 3's "isActive never becomes true" is not what the receipt shows

**Confidence: high** (source order + the counter's own frozen activation values).

`.ufo/waves/round-79-seats/R79Scribe/knowledge-note.md` and `lesson.md` assert:

> "the activation check is satisfied and `hasBeenActive` flips, but `isActive` never becomes true, so
> the state is not the state a real click grants."

and the rejected-claim entry adds:

> "Flip: a measurement showing `isActive === true` after a `userGesture` evaluation."

**The receipt cannot show that, and the source contradicts it.** Three facts, all in the frozen
instrument and the pinned sources:

1. **The receipt's `activationAfter` is sampled *after* `showPicker()` consumed the activation.**
   `scripts/chrome-cdp-showpicker-round79.mjs` line 378 (`rec.activationAfter = …`) runs after the
   trigger at lines 337-345 and after `ConsumeTransientUserActivation` has already fired.
2. **Chromium consumes the transient activation inside the successful call** — `html_input_element.cc`
   line 2679 `LocalFrame::ConsumeTransientUserActivation(frame);`, after the gate at 2673 and before
   `input_type_view_->OpenPopupView();` at 2681. The spec's normative form is the same (S216 lines
   5848-5853: "Consume user activation given element's relevant global object.").
3. **`navigator.userActivation.isActive` reports exactly the gate's predicate** — `user_activation.cc`
   lines 41-45: `isActive()` returns `LocalFrame::HasTransientUserActivation(frame)`, the same call
   `showPicker()` gates on.

Therefore: in leg `sp-cdp-gesture` the call **succeeded** (`showPicker.ok === true`). A successful call
is only reachable if `HasTransientUserActivation(frame)` was **true at that moment** — otherwise line
2673 throws `NotAllowedError`. So `isActive` **was** true during the call, and the `isActive:false` in
`activationAfter` is the *post-consumption* reading, exactly like every other successful leg in the
counter's frozen table (`sp-click-then-show`, `sp-multiple-show`, `sp-cancel-armed`, `sp-show-twice`
all read `{isActive:false,hasBeenActive:true}` after).

The counter's own frozen values (`scripts/check-showpicker-r79.mjs` lines 149-158) already show this:
`sp-cdp-gesture` is `[{isActive:false,hasBeenActive:false},{isActive:false,hasBeenActive:true}]` —
the *before* sample is taken before the gesture exists at all, and the *after* sample is taken after
the consumption. Neither sample observes the window in which `isActive` was true.

**So the conclusion "isActive never becomes true, so the state is not the state a real click grants" is
unsupported.** What the receipt supports is weaker and different: *the CDP gesture satisfies the
transient-activation gate and the call consumes that activation* — which is the same consumption a
real click's activation undergoes. The two paths are not distinguishable at the sampled points.

**The stated flip condition is achievable and would settle it.** A leg that runs
`Runtime.evaluate {userGesture:true}` with an expression that does **not** call `showPicker()`, then
samples `isActive`, would observe `isActive === true` (the activation is live until something
consumes it) and would directly compare the CDP-gesture state with the post-click state
`sp-click-then-show.activationBefore = {isActive:true,hasBeenActive:true}`. That single extra
measurement separates "treated as initiated by the user" (S219's own wording) from "not the same state
a real click grants" — and it is the measurement the current leg shape cannot make, because
`showPicker()` consumes the very activation it would have to observe.

Note the S219 wording quoted above remains accurate and is *not* in question: "treated as initiated by
user in the UI" is the protocol's own phrasing, and it is genuinely weaker than "initiated by the user".
The over-reach is in claiming the receipt *proves* the weaker state, not in quoting the protocol.

---

## 4. Supporting mechanism for law 9 (`backendNodeId`) — a stronger reason than the records give

**Confidence: high** (three pinned sources).

The records say the id is "browser-assigned" and must never be a literal (QUALITY 150). The pinned
sources supply the actual mechanism, which is worth carrying into the note:

- `Page.pdl` lines 1294-1304: `event fileChooserOpened` … `experimental optional DOM.BackendNodeId
  backendNodeId` — "Input node id. Only present for file choosers opened via an `<input type="file">`
  element."
- `inspector_page_agent.cc` lines 1899-1913: the event is filled with
  `element ? std::optional<int>(element->GetDomNodeId()) : std::nullopt);`
- `dom_node_ids.cc` lines 48-61 (`IdForNode`) and 21-26 (`NextId`): the id is a **lazily assigned,
  process-global monotonic counter** — `if (id == kInvalidDOMNodeId) { id = NextId(); … }` over
  `DOMNodeId g_last_id = 0;` — i.e. the Nth node the renderer process ever asks to identify.
  `IdentifiersFactory::IntIdForNode` (`identifiers_factory.cc` lines 119-121) is the same value space:
  `return node->GetDomNodeId();`.

So the reported id is **not a function of the element** but of *how many nodes were id-assigned before
it in that renderer process* — which is why the same input reports different ids under different
trigger paths (the click path assigns ids to more nodes first). This is a strictly better justification
for the "never a literal" rule than "browser-assigned": it is a **process-ordering artifact**, not an
identity.

Also confirmed, and it supports the mode law: `inspector_page_agent.cc` lines 1907-1910 map the
`multiple` flag to `ModeEnum::SelectMultiple` / `SelectSingle`; the flag comes from
`file_input_type.cc` line 203 `probe::FileChooserOpened(document.GetFrame(), &input, input.Multiple(),`
and `HTMLInputElement::Multiple()` (`html_input_element.cc` line 1817-1818) is
`FastHasAttribute(html_names::kMultipleAttr)`. The mode therefore derives from the element's own
`multiple` attribute — i.e. **from the page-measured input**, as the law claims.

And the interception laws: `inspector_page_agent.cc` lines 1906-1912 emit `fileChooserOpened` only when
`suppress_file_chooser_.Get() || enable_file_chooser_opened_event_.Get()`; the driver calls `Page.enable`
without the experimental `enableFileChooserOpenedEvent` flag, so with interception off **no** CDP event
fires — the source supports law 6. Line 1954 `cancel_file_chooser_.Set(enabled && cancel.value_or(false));`
and `Page.pdl` lines 1279-1288 ("Intercept file chooser requests and transfer control to protocol
clients…", `experimental optional boolean cancel`) support law 7's armed `cancel:true`.

---

## 5. Claims the quotes do **not** support (summary)

| # | claim (location) | verdict | evidence |
|---|---|---|---|
| 1 | "The spec's steps state the same order (S218)" — `corpus/knowledge/chromium-showpicker-runtime-round-79.md` line 35 | **false** | spec: mutability→cross-origin→gesture (`input.html` 5828/5832/5841); Chromium: cross-origin→mutability→gesture (`html_input_element.cc` 2657/2666/2673). Transposed, observable for a disabled non-file/color input in a cross-origin iframe. |
| 2 | "`isActive` never becomes true, so the state is not the state a real click grants" — `.ufo/waves/round-79-seats/R79Scribe/knowledge-note.md`, `lesson.md` | **unsupported inference** | the after-sample is taken post-consumption (driver line 378); Chromium consumes at `html_input_element.cc` 2679; `isActive()` ≡ the gate predicate (`user_activation.cc` 41-45). A successful `sp-cdp-gesture` call proves `isActive` was true during it. |
| 3 | the brief's premise "CDP `Runtime.evaluate`'s `userGesture` parameter in **Runtime.pdl** at the same tag" | **wrong path** (already corrected in the lane's r79 rows) | no `Runtime.pdl` in the Chromium tree at the tag (52 `.pdl` files, none Runtime); the file is V8's `include/js_protocol.pdl` at DEPS `v8_revision` `712e1808de2d421`… `712e1808de2d7416f1276d0deb1ee4ac978132b8` |

No claim in the frozen claims.json, the counter, the pins, the priors, the thresholds or the kill rule
was found unsupported; those were read only.

---

## 6. What I did not verify (open gaps)

- **The `NotSupportedError` step** (S216 lines 5844-5845) — a select-element refusal; out of scope
  this round, and no `HTMLSelectElement.showPicker()` leg exists.
- **The cross-origin `SecurityError` path** — the rule is stated by S216 and S218, but the fixture is
  same-origin loopback, so no leg measures it. My finding in §2 predicts a *divergence* from the spec
  specifically when cross-origin and disabled coincide; that combination is unmeasured.
- **Whether headless auto-cancels the native dialog** (law 6's page `cancel` with interception off) —
  a headless-runtime behaviour, not carried by these four sources; the spec's `cancel` event (S216,
  "fire an event named cancel at element") supports the event, not the headless auto-cancel.
- **Blink's `V8InspectorClient::beginUserGesture` implementation** — I did not locate its file at this
  tag (candidate paths under `third_party/blink/renderer/core/inspector/` returned 404). The
  conclusion in §3 does not depend on it: it follows from the successful call plus the gate's own
  predicate. The V8-side chain is `v8-runtime-agent-impl.cc` line 387 `if
  (userGesture.value_or(false)) scope.pretendUserGesture();` → `injected-script.cc` lines 1079-1083
  `m_inspector->client()->beginUserGesture();`.
- **Whether the `isActive`-after-a-`userGesture`-evaluation leg exists** in any prior/probe — the
  counter's frozen table shows only `before`/`after` samples, and none observes the live window.

---

## 7. Files written (seat-scoped only)

- `.ufo/waves/round-79-seats/R79Scout/sources/` — the four target sources plus supporting pinned
  sources, and `FETCH.txt` with URL / http status / bytes / sha256 / locator / quote for each.
- `.ufo/waves/round-79/w1/R79Scout.md` and `.ufo/waves/round-79/w1/R79Scout/report.md` — this report.

Nothing was written into `.ufo/waves/round-79/controls/`, `.ufo/waves/round-79/scored/`,
`.ufo/waves/round-79/lesson-proof/`, `.ufo/waves/round-79/claims.json` or
`corpus/evidence/round79/`. Scratch root `/fast/scratch/hyaku/tabi-r79/R79Scout/` was created for one
read-only `/json/protocol` cross-check and **deleted** before yield.

**Tooling:** no tool was installed, upgraded or removed. Fetching used only the system `curl`,
`base64` and `sha256sum`. `/usr/bin/chromium` (155.0.8059.84) was launched once, read-only, on
`--remote-debugging-port=9224` with a scratch `--user-data-dir`, solely to read the browser's own
`/json/protocol` as an independent cross-check of the `Runtime.evaluate` parameter list; it was killed
and its scratch profile removed. No pacman transaction was attempted (host-wide pacman guard is PAUSED).
