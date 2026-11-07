# SOURCES.md rows — round 79 (contract v1 shape)

Four rows, ready to append to `corpus/SOURCES.md` after the last row (S218 at base; S219 is new).
Column order is the file's own header: `id | source | kind | tier | scope | anchor | teaches | status |
opened | recheck | used-by`. Each `teaches` is ≤ 25 words (counted below the table). Every quote was
re-located by this seat on 2026-11-07 from the live bytes, not copied from the L1's draft.

| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |
|---|---|---|---|---|---|---|---|---|---|---|
| S216 | WHATWG HTML — the input element's `showPicker()` method steps — https://html.spec.whatwg.org/multipage/input.html#dom-input-showpicker | spec | A | the normative `showPicker()` algorithm for input elements: the exception order (not mutable → `InvalidStateError`, cross-origin → `SecurityError` with file/color exempt, no transient activation → `NotAllowedError`, unrendered select → `NotSupportedError`) and the "show the picker" sub-algorithm that repeats the guards and consumes the activation; living standard, not a browser | §4.10.5.1.1 at 2026-11-07 (fetched 687,515 B, sha256 b0202de1c0b422d94d7aa23b4f1b0e3126d9d044bf7076394b6e00451f0fcd16); located quotes: "If this is not mutable, then throw an \"InvalidStateError\" DOMException." and "If this's relevant global object does not have transient activation, then throw a \"NotAllowedError\" DOMException." and, in the sub-algorithm, "Consume user activation given element's relevant global object." | the normative order of the refusals, and that showing the picker consumes the activation — the law the measured driver reproduces | mined | 2026-11-07 | 90d | corpus/knowledge/chromium-showpicker-runtime-round-79.md |
| S217 | MDN `HTMLInputElement.showPicker()` reference — https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/showPicker | docs | A | the client-facing contract of `showPicker()`: its three exception classes and the transient-activation requirement; not Chromium behaviour | page `HTMLInputElement.showPicker()` Exceptions section at 2026-11-07 (fetched 171,971 B, sha256 db037377f1fbc1ba8b83ff8226d58a663589d2040b6d1f334c870c8945b966ed); located quotes: "InvalidStateError DOMException Thrown if the element is not mutable…" and "NotAllowedError DOMException Thrown if not explicitly triggered by a user action such as a touch gesture or mouse click (the picker requires Transient activation)." | names the three exception classes and states the picker requires transient activation from a touch gesture or mouse click | mined | 2026-11-07 | 90d | corpus/knowledge/chromium-showpicker-runtime-round-79.md |
| S218 | Chromium 155.0.8059.84 Blink `HTMLInputElement` source (`showPicker`) — https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/renderer/core/html/forms/html_input_element.cc?format=TEXT | code | A | `HTMLInputElement::showPicker` at this tag: the check order, the exact exception messages, and the activation consumption before the popup opens; only lines 2652-2682 are mined; not runtime delivery | tag 155.0.8059.84, lines 2652-2682 (fetched 135,428 B base64, decoded 2,818 lines, sha256 405b52c70185820ead77b2338f054eb8220fdc7ef176de671db63c349282e96d); located quotes: "HTMLInputElement::showPicker() cannot be used on immutable controls." and "HTMLInputElement::showPicker() requires a user gesture." and "LocalFrame::ConsumeTransientUserActivation(frame);" immediately before "input_type_view_->OpenPopupView();" | the implementation's exact messages and the order: mutability, activation, then ConsumeTransientUserActivation before OpenPopupView — one activation buys one picker | mined | 2026-11-07 | 90d | corpus/knowledge/chromium-showpicker-runtime-round-79.md |
| S219 | Chromium 155.0.8059.84's pinned V8 `js_protocol.pdl` (the CDP Runtime domain) — https://chromium.googlesource.com/v8/v8/+/712e1808de2d7416f1276d0deb1ee4ac978132b8/include/js_protocol.pdl?format=TEXT | code | A | the `Runtime.evaluate` command's `userGesture` parameter at the V8 revision Chromium 155.0.8059.84 pins; only lines 1541-1542 are mined; the Runtime domain is carried by this file (the Blink `third_party/blink/public/devtools_protocol/domains/` directory at the tag has no `Runtime.pdl`); not runtime delivery | tag 155.0.8059.84 → DEPS `v8_revision` 712e1808de2d7416f1276d0deb1ee4ac978132b8 (DEPS line 348); fetched 2026-11-07, http 200, 94,320 B base64 → 1,848 lines, sha256 678fd97bf64779f0a82dba9e02cc00ab21b18eaec6570b10f7bbd63512cc84f0; decoded lines 1541-1542: "# Whether execution should be treated as initiated by user in the UI." / "optional boolean userGesture" | `Runtime.evaluate`'s `userGesture` flag means "treated as initiated by user in the UI" — the switch the `sp-cdp-gesture` leg pulls | mined | 2026-11-07 | 90d | corpus/knowledge/chromium-showpicker-runtime-round-79.md |

## Verification of the rows (this seat, 2026-11-07)

| id | http | bytes | sha256 (first 12) | re-located quote |
|---|---|---|---|---|
| `S216` | 200 | 687,515 | `b0202de1c0b4` | the three steps above, in the `showPicker()` algorithm text; the sub-algorithm's "Consume user activation…" follows the `NotSupportedError` step |
| `S217` | 200 | 171,971 | `db037377f1fb` | Exceptions list: `InvalidStateError`, `NotAllowedError`, `SecurityError` in that order |
| `S218` | 200 | 135,428 base64 → 2,818 lines | `405b52c70185` | lines 2664-2668 (`InvalidStateError`), 2673-2676 (`NotAllowedError`), 2678 (`ConsumeTransientUserActivation`), 2680 (`OpenPopupView`) |
| `S219` | 200 | 94,320 base64 → 1,848 lines | `678fd97bf647` | lines 1541-1542 inside `command evaluate`'s parameters |

Three notes the L1 should keep with the rows:

1. **S219's path is not `Runtime.pdl`.** The wave brief calls it "the CDP Runtime.pdl"; at tag
   155.0.8059.84 the Blink domains directory lists 52 `.pdl` files and none is `Runtime.pdl` — the
   Runtime domain is a V8 domain, carried by `v8/include/js_protocol.pdl` at the revision the
   Chromium DEPS pins. The row's `source` and `scope` say so, so a later reader does not go looking
   for a file that does not exist at the tag. The V8 revision is not a tag: it is the exact commit
   `712e1808de2d7416f1276d0deb1ee4ac978132b8` from `DEPS` line 348, which is the right pin for a
   source that moves independently of Chromium's tag.
2. **S216's anchor is a living standard.** The hash dates the row; the `recheck` is 90d and the row
   says "living standard" so nobody reads the hash as a tag pin.
3. **S218's `sha256` is of the decoded file**, matching the r77/r78 rows' convention (the base64
   transport bytes hash differently). The same convention is used for S219.

## teaches word counts (≤ 25)

- S216: "the normative order of the refusals, and that showing the picker consumes the activation —
  the law the measured driver reproduces" — 21 words.
- S217: "names the three exception classes and states the picker requires transient activation from a
  touch gesture or mouse click" — 19 words.
- S218: "the implementation's exact messages and the order: mutability, activation, then
  ConsumeTransientUserActivation before OpenPopupView — one activation buys one picker" — 19 words.
- S219: "`Runtime.evaluate`'s `userGesture` flag means \"treated as initiated by user in the UI\" —
  the switch the `sp-cdp-gesture` leg pulls" — 19 words.
