# R61Scout — round 61 / wave w1 — source opens (S164) and re-opens (S153, S161)

- Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`
- Seat: `R61Scout` (leaf; no subagent dispatch, no background jobs, no VCS mutation)
- Date: 2026-11-03
- Frozen authority read first and in full: `.ufo/waves/round-61/claims.json` (163-row census; C2 sourced claim names S164 and re-opens S153; no amendment made here).
- Write scope used: `.ufo/waves/round-61/sources/`, `.ufo/waves/round-61/w1/R61Scout.md`, `.ufo/waves/round-61/w1/R61Scout/report.md` (identical content), plus `/fast/scratch/hyaku/tabi-r61/R61Scout` (removed at yield).

## Verdicts

| item | verdict | evidence |
|---|---|---|
| S164 open | FETCHED, HTTP 200, 0 redirects, 948,439 B, sha256 `ed503a5e...18b8`; staged and quoted | `s164-fetch-receipt.json`, `s164-quotes.json` |
| S153 re-open | BYTE-IDENTICAL to the registered anchor (1,423,170 B, sha256 `d6737c31...31e7`); Input dispatch description re-located | `s153-reopen-receipt.json`, `s153-quotes.json` |
| S161 re-open | BYTE-IDENTICAL to the registered anchor (920,762 B, sha256 `8ded5eaf...b918`); keydown row re-located | `s161-reopen-receipt.json`, `s161-quotes.json` |
| Proposed S164 row | Passes `scripts/check-sources.mjs` in a scratch copy of the lane: rows 163 -> 164, verdict clean, exit 0; pipe-injection negative control fails `malformed_row` (exit 1) | `s164-proposed-row.txt`, `s164-row-gate.txt` |

Revision served by `/TR/pointerevents/`: **Pointer Events Level 4, W3C Working Draft, 08 October 2026** (dated this-version URL `/TR/2026/WD-pointerevents4-20261008/`; canonical `/TR/pointerevents4/`). The latest Recommendation is Pointer Events Level 3.

## R57-S3 fetch guard receipts

Every fetch was made with `curl -q -sS -L` to an absolute staged path, then byte-counted and digested from the staged bytes. `num_redirects` and `url_effective` are curl's own; the final host is checked against the cited host.

| source | cited URL | final URL | redirects | HTTP | bytes | sha256 | host match | receipt |
|---|---|---|---|---|---|---|---|---|
| S164 | https://www.w3.org/TR/pointerevents/ | https://www.w3.org/TR/pointerevents/ | 0 | 200 | 948439 | `ed503a5e0a6becf0898c0156bec45f0491132dab75cbebb73a14552e9e3318b8` | True | `.ufo/waves/round-61/sources/s164-fetch-receipt.json` |
| S153 | https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json | https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json | 0 | 200 | 1423170 | `d6737c31f268ed74e65dde393006dd9c590a713febd2361d734722eb059f31e7` | True | `.ufo/waves/round-61/sources/s153-reopen-receipt.json` |
| S161 | https://www.w3.org/TR/uievents/ | https://www.w3.org/TR/uievents/ | 0 | 200 | 920762 | `8ded5eaf4f190b13c59582d5e92b81d3585112dde963d71d65d8e5991212b918` | True | `.ufo/waves/round-61/sources/s161-reopen-receipt.json` |

All three receipts carry `flags: []` and `guardOk: true`: HTTP 200, identity body, no redirect hop, final host equal to the cited host, staged bytes below the 25 MB cap.

## 1. NEW ROW S164 — W3C Pointer Events

### 1.1 Which revision and level the served bytes name

The fetched URL `https://www.w3.org/TR/pointerevents/` returned HTTP 200 with `num_redirects = 0`: the alias itself serves the current Working Draft, and the page declares its own canonical target as `/TR/pointerevents4/`. The page says Level 4, Working Draft, 08 October 2026; it also states that its previous REC-equivalent lineage's latest Recommendation is Level 3.

#### `revision-level` — raw line 866

Location: h1 id="title" + h2 id="subtitle"

```text
    <h1 id="title" class="title">Pointer Events</h1> <h2 id="subtitle" class="subtitle">Level 4</h2>
```

Note: The page names its own level: Pointer Events Level 4

sha256(quote) = `3b72d2f5b24b0a83fbbab3aadcce090f1c91a210fd459b8d336102289c363d39`

#### `revision-status-date` — raw line 867

Location: p id="w3c-state"

```text
    <p id="w3c-state"><a href="https://www.w3.org/standards/types#WD">W3C Working Draft</a> <time class="dt-published" datetime="2026-10-08">08 October 2026</time></p>
```

Note: W3C Working Draft, 08 October 2026

sha256(quote) = `efe6536e20ba0deed92b2adb38bf9f3bc7bc282c4d7999d58c916bf421012f1b`

#### `revision-this-version` — raw line 872

Location: dd under dt "This version:" (raw 871)

```text
                  <a class="u-url" href="https://www.w3.org/TR/2026/WD-pointerevents4-20261008/">https://www.w3.org/TR/2026/WD-pointerevents4-20261008/</a>
```

Note: The dated WD URL this snapshot corresponds to

sha256(quote) = `f5d7c6fae3c0ea78994846b740750f57b76e875bdbcc89892f8ac979d45a2a75`

#### `revision-latest-recommendation` — raw line 887

Location: dt "Latest Recommendation:"

```text
        <dt>Latest Recommendation:</dt><dd><a href="https://www.w3.org/TR/pointerevents3">https://www.w3.org/TR/pointerevents3</a></dd>
```

Note: The latest Recommendation is Pointer Events Level 3, not this Level 4 WD

sha256(quote) = `f66522ffd090557e4b82087fce07e56ef1491709b74519d24ee27338199a0e38`

### 1.2 `pointerType` — IDL declaration and definition

The WebIDL is markup-interleaved in the raw bytes, so the raw line is quoted verbatim and the declaration's textContent is stated separately. The declaration is inside `<pre class="idl def" id="webidl-1641249507">`, in the `PointerEvent` interface block (`<span data-idl="" class="idlAttribute" ... data-title="pointerType" data-dfn-for="PointerEvent">`).

#### `idl-pointerType` — raw line 1623

Location: pre id="webidl-1641249507", span data-idl class="idlAttribute" data-title="pointerType" data-dfn-for="PointerEvent"

```text
    readonly        attribute<span class="idlType"> <a data-link-type="interface" href="https://webidl.spec.whatwg.org/#idl-DOMString">DOMString</a></span>   <a class="internalDFN idlName" data-link-type="attribute" href="#dom-pointerevent-pointertype" id="ref-for-dom-pointerevent-pointertype-1"><code>pointerType</code></a>;</span><span data-idl="" class="idlAttribute" id="idl-def-pointerevent-isprimary" data-title="isPrimary" data-dfn-for="PointerEvent">
```

textContent / normalized: `readonly attribute DOMString pointerType;`

Note: WebIDL declaration in the PointerEvent interface; textContent is `readonly attribute DOMString pointerType;`

sha256(quote) = `cdeeb7425e5be824bd00b80904d13e7772ac64493f443e186d03186b28542831`

#### `dfn-pointerType-dt` — raw line 1697

Location: dfn id="dom-pointerevent-pointertype"

```text
                    <dt><dfn data-export="" data-dfn-type="attribute" id="dom-pointerevent-pointertype" data-idl="attribute" data-title="pointerType" data-dfn-for="PointerEvent" data-type="DOMString" data-lt="pointerType" data-local-lt="PointerEvent.pointerType" tabindex="0" aria-haspopup="dialog"><code>pointerType</code></dfn></dt>
```

Note: Definition site anchor for pointerType

sha256(quote) = `86320d95b565aafce3203e7501eb666ad06f987b5ff0a50cc835b58ef5721f46`

#### `dfn-pointerType-prose` — raw line 1699

Location: dd of dfn id="dom-pointerevent-pointertype" (raw 1697-1699)

```text
                            <p>Indicates the device type that caused the event (such as mouse, pen, touch). If the user agent is to <a href="#dfn-fire-a-pointer-event" class="internalDFN" data-link-type="dfn" id="ref-for-dfn-fire-a-pointer-event-1">fire a pointer event</a> for a mouse, pen/stylus, or touch input device, then the value of <code>pointerType</code> <em class="rfc2119">MUST</em> be according to the following table:</p>
```

Note: Definition prose: device type that caused the event, naming mouse, pen, touch; the value set is normative via the table (raw 1705-1707)

sha256(quote) = `d48ec5248b4bf19d987f8faf5d695755e4337b009f4f2136249918447b901207`

#### `pointerType-value-mouse` — raw line 1705

Location: table id="pointer-type-table" row 1

```text
                                    <tr><td>Mouse</td><td><code>mouse</code></td></tr>
```

Note: Mouse -> mouse

sha256(quote) = `9c5ce2c20a09be6d76b39f1b16e903cc3ecf77c6217bd4b4a99a54f8c32d6ce8`

#### `pointerType-value-pen` — raw line 1706

Location: table id="pointer-type-table" row 2

```text
                                    <tr><td>Pen / stylus</td><td><code>pen</code></td></tr>
```

Note: Pen / stylus -> pen

sha256(quote) = `2f15f049a0c2c8d4b689e1793eeab212f516f33d51f247e714cdae3df608c19f`

#### `pointerType-value-touch` — raw line 1707

Location: table id="pointer-type-table" row 3

```text
                                    <tr><td>Touch contact</td><td><code>touch</code></td></tr>
```

Note: Touch contact -> touch

sha256(quote) = `cce4932ecf7b8f538018c5d25cfea09c3bef74a79ee11188bd15a33daa7e57dc`

The value set is normative through `table id="pointer-type-table"` (raw 1700-1709): `mouse`, `pen`, `touch`. The prose sentence names the same devices with "such as", so the table, not the prose, fixes the values; an undetectable device MUST yield the empty string (raw 1710).

### 1.3 `pointerId` — IDL declaration and definition

#### `idl-pointerId` — raw line 1613

Location: pre id="webidl-1641249507", span data-idl class="idlAttribute" data-title="pointerId" data-dfn-for="PointerEvent"

```text
    readonly        attribute<span class="idlType"> <a data-link-type="interface" href="https://webidl.spec.whatwg.org/#idl-long">long</a></span>        <a class="internalDFN idlName" data-link-type="attribute" href="#dom-pointerevent-pointerid" id="ref-for-dom-pointerevent-pointerid-1"><code>pointerId</code></a>;</span><span data-idl="" class="idlAttribute" id="idl-def-pointerevent-width" data-title="width" data-dfn-for="PointerEvent">
```

textContent / normalized: `readonly attribute long pointerId;`

Note: WebIDL declaration in the PointerEvent interface; textContent is `readonly attribute long pointerId;`

sha256(quote) = `4819ad3ac233768217b2acb19b9778754fbc45b23ea708acdfe77ce67516b5c6`

#### `dfn-pointerId-dt` — raw line 1630

Location: dfn id="dom-pointerevent-pointerid"

```text
                    <dt><dfn data-export="" data-dfn-type="attribute" id="dom-pointerevent-pointerid" data-idl="attribute" data-title="pointerId" data-dfn-for="PointerEvent" data-type="long" data-lt="pointerId" data-local-lt="PointerEvent.pointerId" tabindex="0" aria-haspopup="dialog"><code>pointerId</code></dfn></dt>
```

Note: Definition site anchor for pointerId

sha256(quote) = `a2698d2983410f5132b21b89bfff8d106cfe6ae743f45f2de89b9ba5dc8f0734`

#### `dfn-pointerId-prose` — raw line 1632

Location: dd of dfn id="dom-pointerevent-pointerid" (raw 1630-1632)

```text
                            <p>A unique identifier for the pointer causing the event.  <a data-link-type="dfn" href="https://infra.spec.whatwg.org/#user-agent">user agents</a> <em class="rfc2119">MAY</em> reserve a generic <a data-link-type="idl" data-lt="pointerId" href="#dom-pointerevent-pointerid" class="internalDFN" id="ref-for-dom-pointerevent-pointerid-2"><code>pointerId</code></a> value of <code>0</code> or <code>1</code> for the primary mouse pointer. The <a data-link-type="idl" data-lt="pointerId" href="#dom-pointerevent-pointerid" class="internalDFN" id="ref-for-dom-pointerevent-pointerid-3"><code>pointerId</code></a> value of <code>-1</code> <em class="rfc2119">MUST</em> be reserved and used to indicate events that were generated by something other than a pointing device.
```

Note: Definition prose incl. reserved -1 for events generated by something other than a pointing device

sha256(quote) = `229904ac19ca8fdc1db99cd93d8028675369a61d9bae43548b2511e646a3efef`

Key normative facts in the quoted definition: the value is a unique identifier for the pointer causing the event; `0` or `1` MAY be reserved for the primary mouse pointer; `-1` MUST be reserved for events generated by something other than a pointing device; active-pointer ids must be unique within the top-level browsing context and must not be influenced by another one.

### 1.4 `pointerdown` — event definition

Section 3.3.3, `section id="pointerdown"`, `h4 id="x3-3-3-pointerdown"`, `dfn id="dfn-pointerdown"`. The event-definition table and the normative firing sentence follow.

#### `pointerdown-section-heading` — raw line 2226

Location: section id="pointerdown", h4 id="x3-3-3-pointerdown", dfn id="dfn-pointerdown"

```text
            <section id="pointerdown"><div class="header-wrapper"><h4 id="x3-3-3-pointerdown"><bdi class="secno">3.3.3 </bdi><dfn data-dfn-type="event" id="dfn-pointerdown" tabindex="0" aria-haspopup="dialog" data-export="">pointerdown</dfn></h4><a class="self-link" href="#pointerdown" aria-label="Permalink for Section 3.3.3"></a></div>
```

Note: Section 3.3.3 pointerdown

sha256(quote) = `132932b0e9746b2ed42eba65a95fa982a2cd4765dd09e45d5e1c8d90f30e8bea`

#### `pointerdown-event-definition-table` — raw lines 2232-2245

Location: section id="pointerdown" > table class="event-definition" (raw 2229), rows raw 2232-2245

```text
                        <th>Type</th>
                        <td><strong><code>pointerdown</code></strong></td>
                    </tr>
                    <tr>
                        <th>Interface</th>
                        <td><a data-link-type="idl" data-lt="PointerEvent" href="#dom-pointerevent" class="internalDFN" id="ref-for-dom-pointerevent-17"><code>PointerEvent</code></a></td>
                    </tr>
                    <tr>
                        <th>Bubbles</th>
                        <td>Yes</td>
                    </tr>
                    <tr>
                        <th>Cancelable</th>
                        <td>Yes</td>
                    </tr>
```

Note: Event table: Type pointerdown (2232-2233), Interface PointerEvent (2236-2237), Bubbles Yes (2240-2241), Cancelable Yes (2244-2245), Composed Yes (2248-2249)

sha256(quote) = `ea6c43291a9674887219a81c789d4a129865b4826240ebc97288a77792843bd2`

#### `pointerdown-definition-prose` — raw line 2261

Location: section id="pointerdown" paragraph raw 2261

```text
                <p>The  <a data-link-type="dfn" href="https://infra.spec.whatwg.org/#user-agent">user agent</a> <em class="rfc2119">MUST</em> <a href="#dfn-fire-a-pointer-event" class="internalDFN" data-link-type="dfn" id="ref-for-dfn-fire-a-pointer-event-4">fire a pointer event</a> named <a data-link-type="idl" data-lt="pointerdown" href="#dfn-pointerdown" class="internalDFN" id="ref-for-dfn-pointerdown-11"><code>pointerdown</code></a> when a pointer enters the <a href="#dfn-active-buttons-state" class="internalDFN" data-link-type="dfn" id="ref-for-dfn-active-buttons-state-2">active buttons state</a>.
```

Note: Normative firing condition: MUST fire pointerdown when a pointer enters the active buttons state

sha256(quote) = `6a7481d992312591c5503f522b3780b77daed06d5f35b9ca8efcdfd5c77362ed`

The table's `Cancelable` row is `Yes` (raw 2244-2245), and its `Context (trusted events)` row (raw 2252-2255) names `Event.target : topmost event target`; the prose fixes the firing condition to entering the active buttons state; the note at raw 2262 records that pointerdown/pointerup are not fired for all the same circumstances as mousedown/mouseup.

### 1.5 `isTrusted` in the staged bytes — explicit verdict

**Present, but not defined.** The exact token `isTrusted` occurs **3 times** in the staged bytes, at raw lines 3822, 3937 and 3992. Each occurrence is an `<a>` whose href is `https://dom.spec.whatwg.org/#dom-event-istrusted`, wrapping `<code>isTrusted</code>`; all three are in prose about re-dispatched coalesced/predicted events and about populating the lists. The spec never declares or defines the attribute. The absence of a definition is recorded here as a finding, not a fetch failure: S164 grounds the `PointerEvent` interface and cross-references the DOM Standard for `isTrusted`.

#### `isTrusted-mention` — raw line 3822

Location: body prose cross-reference to DOM Standard

```text
<a data-link-type="attribute" href="https://dom.spec.whatwg.org/#dom-event-istrusted"><code>isTrusted</code></a>
```

Note: isTrusted appears only as a cross-reference to https://dom.spec.whatwg.org/#dom-event-istrusted; this spec does not define it

sha256(quote) = `dd7cc0876e4d1847cc8fd67ade5e634672adafde13a7d3d902bf7c39854b263a`

#### `isTrusted-mention` — raw line 3937

Location: body prose cross-reference to DOM Standard

```text
<a data-link-type="attribute" href="https://dom.spec.whatwg.org/#dom-event-istrusted"><code>isTrusted</code></a>
```

Note: isTrusted appears only as a cross-reference to https://dom.spec.whatwg.org/#dom-event-istrusted; this spec does not define it

sha256(quote) = `dd7cc0876e4d1847cc8fd67ade5e634672adafde13a7d3d902bf7c39854b263a`

#### `isTrusted-mention` — raw line 3992

Location: body prose cross-reference to DOM Standard

```text
<a data-link-type="attribute" href="https://dom.spec.whatwg.org/#dom-event-istrusted"><code>isTrusted</code></a>
```

Note: isTrusted appears only as a cross-reference to https://dom.spec.whatwg.org/#dom-event-istrusted; this spec does not define it

sha256(quote) = `dd7cc0876e4d1847cc8fd67ade5e634672adafde13a7d3d902bf7c39854b263a`

## 2. RE-OPEN S153 — CDP `browser_protocol.json`

Registered anchors (S153 row, latest recorded re-open in round 57): **1,423,170 B**, sha256 `d6737c31f268ed74e65dde393006dd9c590a713febd2361d734722eb059f31e7`, `@master`.

Fresh fetch today: **1,423,170 B**, sha256 `d6737c31f268ed74e65dde393006dd9c590a713febd2361d734722eb059f31e7` -> **BYTE-IDENTICAL**. No anchor edit is made in the registry (round-60 routed defect R1); this re-open is recorded here for the round lesson and used-by only.

The re-opened file proves the Input domain and its dispatch descriptions:

#### `input-domain` — raw line 14108

Location: domain object

```text
            "domain": "Input",
```

textContent / normalized: `"domain": "Input"`

Note: The Input protocol domain declaration

sha256(quote) = `f0b2b1e73b4e15bb1d71d998b5db9c9d4301407c44a4cb9ff72a7c60b5113dad`

#### `input-command-name` — raw line 14307

Location: command object name

```text
                    "name": "dispatchKeyEvent",
```

textContent / normalized: `"name": "dispatchKeyEvent",`

Note: Input.dispatchKeyEvent

sha256(quote) = `2fa48d3f9570e51803aabd6a2ba385daa81c526e05e8f22cb5aaf492e2c8f9ad`

#### `input-dispatch-description` — raw line 14308

Location: command object description

```text
                    "description": "Dispatches a key event to the page.",
```

textContent / normalized: `"description": "Dispatches a key event to the page.",`

Note: Input-domain dispatch event description for the key event command

sha256(quote) = `ae17df2a5b2ff4694ab9d31bb9c9cdef6c8b332af4e1341f205c51c5327af7ca`

#### `modifiers-description` — raw line 14300

Location: command parameter modifiers description

```text
                            "description": "Bit field representing pressed modifier keys. Alt=1, Ctrl=2, Meta/Command=4, Shift=8\n(default: 0).",
```

Note: The bit field pinned by the round-56/57 re-opens: Alt=1, Ctrl=2, Meta/Command=4, Shift=8; 5 file-wide hits at raw 14300/14323/14484/14594/14661

sha256(quote) = `4875567d3db84a10594f8a2cd851d9dcfe7e9a7cf9e7b24e23da57c891694a1e`

#### `input-command-name-mouse` — raw line 14458

Location: command object name

```text
                    "name": "dispatchMouseEvent",
```

textContent / normalized: `"name": "dispatchMouseEvent",`

Note: Input.dispatchMouseEvent

sha256(quote) = `7a18942c6b274044374a9997379b6216482f57670334c4860e1d2172a46d7fc9`

#### `input-dispatch-description-mouse` — raw line 14459

Location: command object description

```text
                    "description": "Dispatches a mouse event to the page.",
```

textContent / normalized: `"description": "Dispatches a mouse event to the page.",`

Note: Input-domain dispatch description for the mouse event command

sha256(quote) = `7deac885668a2d99dd303f830aa9555398290235e679b75338a110a249cf08d7`

#### `input-command-name-touch` — raw line 14570

Location: command object name

```text
                    "name": "dispatchTouchEvent",
```

textContent / normalized: `"name": "dispatchTouchEvent",`

Note: Input.dispatchTouchEvent

sha256(quote) = `ba1ff4054ad0db385c5fd21c8bfcc52ebe79b9f100655432e6b33341ae7e7859`

#### `input-dispatch-description-touch` — raw line 14571

Location: command object description

```text
                    "description": "Dispatches a touch event to the page.",
```

textContent / normalized: `"description": "Dispatches a touch event to the page.",`

Note: Input-domain dispatch description for the touch event command

sha256(quote) = `dceb0390cdae5a5d22d17ff7f3212d68b96fca786f6fc158175ea09d83a8ec96`

The modifiers description still appears 5 times file-wide (raw 14300, 14323, 14484, 14594, 14661), one per Input dispatch command, matching the round-57 re-open observation.

## 3. RE-OPEN S161 — W3C UI Events

Registered anchor: **920,762 B**, sha256 `8ded5eaf4f190b13c59582d5e92b81d3585112dde963d71d65d8e5991212b918` (W3C page served 2026-11-02; round-57 and round-60 re-opens both byte-identical).

Fresh fetch today: **920,762 B**, sha256 `8ded5eaf4f190b13c59582d5e92b81d3585112dde963d71d65d8e5991212b918` -> **BYTE-IDENTICAL**.

#### `keydown-row` — raw lines 2222-2227

Location: Section 3.1 List of Event Types, keydown row (raw 2222-2227)

```text
       <td><a data-link-type="dfn" href="#keydown" id="ref-for-keydown"><code>keydown</code></a>
       <td style="text-align:center">Sync
       <td style="text-align:center">Yes
       <td style="text-align:center">Element
       <td style="text-align:center"><code class="idl"><a data-link-type="idl" href="#keyboardevent" id="ref-for-keyboardevent③">KeyboardEvent</a></code>
       <td style="text-align:center">Yes
```

Note: keydown row cells: keydown | Sync | Yes (Cancelable) | Element | KeyboardEvent | Yes (Composed)

sha256(quote) = `351d8c9dc52bf85bb3ff1bea3067e8f48217b2a1efccffc7f8e0e84eebee2326`

#### `keydown-cancelable-cell` — raw line 2224

Location: keydown row, Cancelable column

```text
       <td style="text-align:center">Yes
```

textContent / normalized: `Yes`

Note: Cancelable = Yes

sha256(quote) = `44440bd6f63aa4970a2211333d6a569e08bd9004bb774ef9018263735ae73353`

#### `ctrlkey-definition` — raw line 3264

Location: dfn id="dom-keyboardevent-ctrlkey" definition

```text
					<code>true</code> if the <code class="keycap">Control</code> (control) key modifier
```

Note: Byte-identical anchor still locates the ctrlKey definition at the registered line

sha256(quote) = `fa99a3667c960870bb6a0c9a7e553c761396f306c03485c29bd58516985839cb`

Because the bytes are identical to the registered anchor, line numbers from the registered receipts remain valid; the keydown row is the six cells at raw 2222-2227 and its Cancelable cell is `Yes` at raw 2224.

## 4. PROPOSED S164 registry row (11 columns, census-safe)

Ready to insert inside the Registry table immediately after S163 (real `corpus/SOURCES.md` line 177). It contains no literal or escaped pipe character in any cell; `opened` is today's ISO date; `recheck` is `on-release`; tier A is scoped to the `PointerEvent` interface surface; `used-by` is a dash because the row is `queued` and the L1 owns the knowledge note.

```text
| S164 | W3C Pointer Events — https://www.w3.org/TR/pointerevents/ | spec | A | the `PointerEvent` interface surface only: `pointerType` and its value set, `pointerId`, and the `pointerdown` event definition, on the page served at /TR/pointerevents/ (canonical /TR/pointerevents4/) | Level 4 W3C Working Draft 08 October 2026 — `<h2 id="subtitle">Level 4</h2>` raw 866, `<p id="w3c-state">W3C Working Draft ... 08 October 2026</p>` raw 867, this version /TR/2026/WD-pointerevents4-20261008/ raw 872, latest Recommendation /TR/pointerevents3 raw 887; `readonly attribute DOMString pointerType` at raw 1623 with dfn `dom-pointerevent-pointertype` raw 1697-1710 and the value table rows mouse/pen/touch raw 1705-1707; `readonly attribute long pointerId` at raw 1613 with dfn `dom-pointerevent-pointerid` raw 1630-1632; `pointerdown` section 3.3.3 raw 2226 with event table Type pointerdown, Interface PointerEvent, Cancelable Yes raw 2232-2245; `isTrusted` occurs 3 times only as cross-references to the DOM Standard raw 3822/3937/3992; staged .ufo/waves/round-61/sources/s164-pointerevents.html, 948,439 B, sha256 ed503a5e0a6becf0898c0156bec45f0491132dab75cbebb73a14552e9e3318b8 | A learner can read a pointer event's device class (mouse, pen or touch), its per-pointer integer id (with -1 reserved for non-pointing sources), and the cancelable pointerdown firing condition from one dated document instead of inferring them from browser behaviour | queued | 2026-11-03 | on-release | — |
```

Structural evidence (scratch copy of the lane, read-only gate):

| run | command | result | exit |
|---|---|---|---|
| baseline (no row) | `node scripts/check-sources.mjs --root <scratch-root>` | `verdict=clean rows=163 tiers=A:147,B:7,C:9 status=queued:15,mined:138,rejected:10 findings=0` | 0 |
| with S164 row | same | `verdict=clean rows=164 tiers=A:148,B:7,C:9 status=queued:16,mined:138,rejected:10 findings=0` | 0 |
| negative control (one pipe injected into the scope cell) | same | `FINDING id=malformed_row fleet=E01 row=S164 detail=fields_14`, verdict failed | 1 |
| instrument self-test | `node scripts/check-sources.mjs --self-test` | `SOURCES_SELFTEST verdict=clean cases=26`, all PASS | 0 |

The real registry was also read with the gate (no writes): `verdict=clean rows=163 tiers=A:147,B:7,C:9 status=queued:15,mined:138,rejected:10 findings=0`, exit 0 — consistent with the frozen census control of 163 rows.

## 5. Commands and exit codes

Shell runs with `errexit`; a failing command is reported with its measured status via `|| RC=$?`.

| # | command | exit |
|---|---|---|
| 1 | `python3 /fast/scratch/hyaku/tabi-r61/R61Scout/fetch_guard_r61.py` (three guarded fetches in parallel; per-fetch receipts written) | 0 |
| 2 | `wc -c` and `sha256sum` on the three staged files | 0 |
| 3 | `node scripts/check-sources.mjs` (real registry, read-only) | 0 |
| 4 | `node scripts/check-sources.mjs --self-test` | 0 |
| 5 | `node scripts/check-sources.mjs --root <scratch-root>` (baseline, no S164) | 0 |
| 6 | `node scripts/check-sources.mjs --root <scratch-root>` (S164 inserted) | 0 |
| 7 | `node scripts/check-sources.mjs --root <scratch-root>` (pipe-injected negative control) | 1 |
| 8 | naive `cat row >> corpus/SOURCES.md` experiment on the scratch copy | 0 (gate) — but `rows=163` and `grep S164 = 1`: the row was silently glued to the last line, see D2 |

The full gate transcript is `s164-row-gate.txt`.

## 6. sha256 pins

### 6.1 Files

| file | bytes | sha256 |
|---|---|---|
| `.ufo/waves/round-61/sources/s164-pointerevents.html` | 948439 | `ed503a5e0a6becf0898c0156bec45f0491132dab75cbebb73a14552e9e3318b8` |
| `.ufo/waves/round-61/sources/s153-browser-protocol.json` | 1423170 | `d6737c31f268ed74e65dde393006dd9c590a713febd2361d734722eb059f31e7` |
| `.ufo/waves/round-61/sources/s161-uievents.html` | 920762 | `8ded5eaf4f190b13c59582d5e92b81d3585112dde963d71d65d8e5991212b918` |
| `.ufo/waves/round-61/sources/s164-fetch-receipt.json` | 1135 | `49f4051a76db16f7b5c2bf8dbfda9910363e43a4ff28f83971c7c0ab6f160679` |
| `.ufo/waves/round-61/sources/s153-reopen-receipt.json` | 1370 | `335679d38adc11a808e22534ceca4251382fca11462a3acdc7a22299ecd9448e` |
| `.ufo/waves/round-61/sources/s161-reopen-receipt.json` | 1107 | `5296bc8c02b1ac072dac73f14e2f911d3232b3dd9cbd94300003658f240c7aad` |
| `.ufo/waves/round-61/sources/s164-quotes.json` | 14334 | `cc408504a34a9ee9665c8e899396e52dd0ccfdde107b1d7ada96b2e339bcd5f3` |
| `.ufo/waves/round-61/sources/s153-quotes.json` | 4073 | `bdec6e75b9d90551bc18cccbd9aefeb9d9bc4311ca0f4bcf724cff0200b19dbf` |
| `.ufo/waves/round-61/sources/s161-quotes.json` | 2082 | `3f27a07f17aedd8673167c5b4b7a26c2e2a7da5821ef4ea31cf36113ee5c3afa` |
| `.ufo/waves/round-61/sources/s164-proposed-row.txt` | 1492 | `681cf2dae35004b065414dab6d547e615eba14c5ed23546fed43e0e10ff88f06` |
| `.ufo/waves/round-61/sources/s164-row-gate.txt` | 4113 | `7a567f1d8d04adfa4c22682061dff7d6b8536b36b66cb30df83500c744f28415` |

### 6.2 Quotes (sha256 of the exact quoted substring in the staged bytes)

| source | quote | raw line(s) | sha256(quote) |
|---|---|---|---|
| S164 | `revision-level` | 866 | `3b72d2f5b24b0a83fbbab3aadcce090f1c91a210fd459b8d336102289c363d39` |
| S164 | `revision-status-date` | 867 | `efe6536e20ba0deed92b2adb38bf9f3bc7bc282c4d7999d58c916bf421012f1b` |
| S164 | `revision-this-version` | 872 | `f5d7c6fae3c0ea78994846b740750f57b76e875bdbcc89892f8ac979d45a2a75` |
| S164 | `revision-latest-recommendation` | 887 | `f66522ffd090557e4b82087fce07e56ef1491709b74519d24ee27338199a0e38` |
| S164 | `idl-pointerType` | 1623 | `cdeeb7425e5be824bd00b80904d13e7772ac64493f443e186d03186b28542831` |
| S164 | `dfn-pointerType-dt` | 1697 | `86320d95b565aafce3203e7501eb666ad06f987b5ff0a50cc835b58ef5721f46` |
| S164 | `dfn-pointerType-prose` | 1699 | `d48ec5248b4bf19d987f8faf5d695755e4337b009f4f2136249918447b901207` |
| S164 | `pointerType-value-mouse` | 1705 | `9c5ce2c20a09be6d76b39f1b16e903cc3ecf77c6217bd4b4a99a54f8c32d6ce8` |
| S164 | `pointerType-value-pen` | 1706 | `2f15f049a0c2c8d4b689e1793eeab212f516f33d51f247e714cdae3df608c19f` |
| S164 | `pointerType-value-touch` | 1707 | `cce4932ecf7b8f538018c5d25cfea09c3bef74a79ee11188bd15a33daa7e57dc` |
| S164 | `idl-pointerId` | 1613 | `4819ad3ac233768217b2acb19b9778754fbc45b23ea708acdfe77ce67516b5c6` |
| S164 | `dfn-pointerId-dt` | 1630 | `a2698d2983410f5132b21b89bfff8d106cfe6ae743f45f2de89b9ba5dc8f0734` |
| S164 | `dfn-pointerId-prose` | 1632 | `229904ac19ca8fdc1db99cd93d8028675369a61d9bae43548b2511e646a3efef` |
| S164 | `pointerdown-section-heading` | 2226 | `132932b0e9746b2ed42eba65a95fa982a2cd4765dd09e45d5e1c8d90f30e8bea` |
| S164 | `pointerdown-event-definition-table` | 2232-2245 | `ea6c43291a9674887219a81c789d4a129865b4826240ebc97288a77792843bd2` |
| S164 | `pointerdown-definition-prose` | 2261 | `6a7481d992312591c5503f522b3780b77daed06d5f35b9ca8efcdfd5c77362ed` |
| S164 | `isTrusted-mention` | 3822 | `dd7cc0876e4d1847cc8fd67ade5e634672adafde13a7d3d902bf7c39854b263a` |
| S164 | `isTrusted-mention` | 3937 | `dd7cc0876e4d1847cc8fd67ade5e634672adafde13a7d3d902bf7c39854b263a` |
| S164 | `isTrusted-mention` | 3992 | `dd7cc0876e4d1847cc8fd67ade5e634672adafde13a7d3d902bf7c39854b263a` |
| S153 | `input-domain` | 14108 | `f0b2b1e73b4e15bb1d71d998b5db9c9d4301407c44a4cb9ff72a7c60b5113dad` |
| S153 | `input-command-name` | 14307 | `2fa48d3f9570e51803aabd6a2ba385daa81c526e05e8f22cb5aaf492e2c8f9ad` |
| S153 | `input-dispatch-description` | 14308 | `ae17df2a5b2ff4694ab9d31bb9c9cdef6c8b332af4e1341f205c51c5327af7ca` |
| S153 | `modifiers-description` | 14300 | `4875567d3db84a10594f8a2cd851d9dcfe7e9a7cf9e7b24e23da57c891694a1e` |
| S153 | `input-command-name-mouse` | 14458 | `7a18942c6b274044374a9997379b6216482f57670334c4860e1d2172a46d7fc9` |
| S153 | `input-dispatch-description-mouse` | 14459 | `7deac885668a2d99dd303f830aa9555398290235e679b75338a110a249cf08d7` |
| S153 | `input-command-name-touch` | 14570 | `ba1ff4054ad0db385c5fd21c8bfcc52ebe79b9f100655432e6b33341ae7e7859` |
| S153 | `input-dispatch-description-touch` | 14571 | `dceb0390cdae5a5d22d17ff7f3212d68b96fca786f6fc158175ea09d83a8ec96` |
| S161 | `keydown-row` | 2222-2227 | `351d8c9dc52bf85bb3ff1bea3067e8f48217b2a1efccffc7f8e0e84eebee2326` |
| S161 | `keydown-cancelable-cell` | 2224 | `44440bd6f63aa4970a2211333d6a569e08bd9004bb774ef9018263735ae73353` |
| S161 | `ctrlkey-definition` | 3264 | `fa99a3667c960870bb6a0c9a7e553c761396f306c03485c29bd58516985839cb` |

## 7. Deviations from the seat spec

- None in write scope: no fleet-root file, no sibling lane, no `.ufo/state/`, no corpus registry edit, no git/jj mutation.
- The seat names two report paths (`.ufo/waves/round-61/w1/R61Scout/report.md` and the Report trailer path `.ufo/waves/round-61/w1/R61Scout.md`); both were written with identical content.
- The structural gate test used a 73 MB scratch copy of `corpus/` plus the two `.ufo` paths that existing rows cite as used-by; the scratch root is removed at yield, so the test is reproducible from the commands in `s164-row-gate.txt`, not from retained fixture bytes.
- No package manager ran (pacman paused); no tool was installed or upgraded. The fetch used the host's `curl` through `python3`.

## 8. Defects and gaps found

1. **The frozen C2 sourced claim overstates S164 for `isTrusted`.** `claims.json` says S164 grounds "the PointerEvent interface (pointerType values, pointerId, isTrusted)". The staged bytes mention `isTrusted` exactly 3 times and define it 0 times; all three are cross-references to the DOM Standard. The knowledge note must either cite the DOM Standard for `isTrusted` (note that S163 is scoped to `Event.cancelable`, not to `isTrusted`) or state that `isTrusted` is out of S164's scope. This is a REPORT finding; the claims file is not amended.
2. **`corpus/SOURCES.md` has no trailing newline.** Appending a registry row with `cat row >> corpus/SOURCES.md` glues the row onto the final Search-log bullet. Observed on the scratch copy: the gate still printed `verdict=clean rows=163` and exit 0, while `grep S164` found the text mid-line. A silent row loss. Integration must insert inside the Registry table (after S163, line 177), never append at EOF.
3. **Literal-grep verification of the WebIDL is unsafe on this page.** `grep -c 'readonly attribute DOMString pointerType'` returns 0 because the declaration is interleaved with markup (raw 1623); the textContent is `readonly attribute DOMString pointerType;`. Any receipt that proves presence by literal grep must normalize tags or quote the raw line; otherwise it records a false absence.
4. **S164 is a Working Draft, not a Recommendation.** Level 4 WD dated 2026-10-08; the page's own `Latest Recommendation` link is Level 3. The row states the WD status and scopes tier A to the interface surface, with `recheck = on-release`.
5. **`pointerType`'s value set is normative only in the table.** The definition prose says "such as mouse, pen, touch"; the MUST is satisfied only via `table id="pointer-type-table"` (raw 1705-1707). A check that reads the prose alone is under-grounded.
6. **The W3C alias can move.** `/TR/pointerevents/` served the WD with zero redirects today, but it is an alias for the current level; the canonical `/TR/pointerevents4/` and the dated `/TR/2026/WD-pointerevents4-20261008/` are the stable identities recorded in the row.

## 9. Remaining unknowns

- Whether W3C republishes `/TR/pointerevents/` before the next recheck; the row pins today's bytes and sets `on-release`.
- Whether the L1 promotes S164 from `queued` to `mined` after writing the C2 knowledge note; that decision also selects the used-by path and is outside this seat.
- The lane still has no registry row whose scope covers `isTrusted` itself; whether to widen S163's use or open a separate DOM-Standard row is an L1 decision, not a scout edit.

## 10. Receipt and quote file index

- `.ufo/waves/round-61/sources/s164-fetch-receipt.json`
- `.ufo/waves/round-61/sources/s153-reopen-receipt.json`
- `.ufo/waves/round-61/sources/s161-reopen-receipt.json`
- `.ufo/waves/round-61/sources/s164-quotes.json`
- `.ufo/waves/round-61/sources/s153-quotes.json`
- `.ufo/waves/round-61/sources/s161-quotes.json`
- `.ufo/waves/round-61/sources/s164-proposed-row.txt`
- `.ufo/waves/round-61/sources/s164-row-gate.txt`
- `.ufo/waves/round-61/sources/s164-pointerevents.html`
- `.ufo/waves/round-61/sources/s153-browser-protocol.json`
- `.ufo/waves/round-61/sources/s161-uievents.html`

No file in `corpus/` was written: the S164 row above is a proposal for the L1.
