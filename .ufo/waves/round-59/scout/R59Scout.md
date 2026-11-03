# R59Scout — S153 / S161 re-open for C2 (round 59, wave w1)

Read-only recon. **Both registered rows re-opened: they HOLD, no drift.** `S153` @master is UNMOVED against the r58 staged copy; `S161` is byte-identical to the registered anchor and the r58 staged copy. No browser was launched, no live data run was attempted, and nothing under `corpus/` was written.

## 1. Fetch guard (R57-S3, binding)

| field | S153 | S161 |
|---|---|---|
| url | `https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json` | `https://www.w3.org/TR/uievents/` |
| http_code | 200 | 200 |
| num_redirects | 0 | 0 |
| url_effective | `https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json` | `https://www.w3.org/TR/uievents/` |
| content_type | `text/plain; charset=utf-8` | `text/html; charset=utf-8` |
| size (bytes) | 1423170 | 920762 |
| final host == cited host | YES (`raw.githubusercontent.com`) | YES (`www.w3.org`) |
| refused | False | False |

Both fetches returned 200 with **zero redirects**, so the final host is the cited host by construction (`raw.githubusercontent.com`, `www.w3.org`); neither fetch was refused. `fetched_at` timestamps recorded in receipts are taken from the UTC download time (`2026-11-03T20:56:10Z` for S153, `2026-11-03T20:56:01Z` for S161).

Exact curl commands for reproduction:
- S161: `curl -sS --max-time 120 -o .ufo/waves/round-59/sources/uievents.html https://www.w3.org/TR/uievents/`
- S153: `curl -sS --max-time 120 -o .ufo/waves/round-59/sources/browser_protocol.json https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json`

## 2. Byte comparison — MOVED or UNMOVED

| source | fresh bytes | fresh sha256 | cmp vs r58 staged | registry anchor |
|---|---|---|---|---|
| S153 | 1423170 | `d6737c31f268ed74e65dde393006dd9c590a713febd2361d734722eb059f31e7` | **identical** | **same** (r56/r57/r58 re-open digest) |
| S161 | 920762 | `8ded5eaf4f190b13c59582d5e92b81d3585112dde963d71d65d8e5991212b918` | **identical** | **same** (r54-r58 re-open digest) |

**S153 verdict: @master UNMOVED.** 1,423,170 B, sha256 `d6737c31f268ed74e65dde393006dd9c590a713febd2361d734722eb059f31e7` == the round-56/57/58 re-open digest recorded in the registry cell and == the r58 staged copy (`cmp`: no difference). Relative to the 2026-10-31 original open digest `f60f0c02...` (1,421,620 B) the bytes carry the already-disclosed drift; **no new drift this round**.

**S161 verdict: byte-identical.** 920,762 B, sha256 `8ded5eaf4f190b13c59582d5e92b81d3585112dde963d71d65d8e5991212b918` == the registered anchor and the r58 staged copy (`cmp`: no difference). No drift.

## 3. S161 — getModifierState contract and CapsLock/latching ground

Every quote below is the exact byte span recorded in `reopen-receipt-s161.json`: sliced out of the staged bytes, tested byte-exact in the raw bytes, tag-stripped, and checked against the <= 25-word bound.

### 3.1 The `getModifierState(keyArg)` method definition and return contract

1. **Definition site (normative `<dl>` entry):**
   - Raw line: **3327**
   - Enclosing section: §3.5.1 Interface `KeyboardEvent` (heading raw line 3138, `data-level="3.5.1.1"`, `id="idl-keyboardevent"`)
   - Dfn attributes: `data-dfn-for="KeyboardEvent" data-dfn-type="method" data-export id="dom-keyboardevent-getmodifierstate"`
   - Tag-stripped quote: `getModifierState(keyArg)` (1 word, 1 hit in enclosing span, 1 hit file-wide for this markup)
   - Classification: **definition site** (`id="dom-keyboardevent-getmodifierstate"`)

2. **Normative return value contract (prose):**
   - Raw lines: **3333–3334**
   - Tag-stripped quote: `Returns true if it is a modifier key and the modifier is activated, false otherwise.` (15 words, 1 hit in enclosing span, 1 hit file-wide)
   - Classification: **prose** (normative return value contract for `getModifierState`)
   - Significance for C2: Grounds the boolean return value expectation — `true` when the modifier is activated, `false` otherwise.

3. **WebIDL interface method declaration:**
   - Raw line: **3160**
   - Tag-stripped quote: `boolean getModifierState(DOMString keyArg);` (3 words, 1 hit file-wide)
   - Classification: **definition site** (WebIDL method declaration)

4. **Parameter `keyArg` specification & cross-reference:**
   - Raw lines: **3339–3340**
   - Tag-stripped quote: `A modifier key value. Valid modifier keys are defined in the Modifier Keys table in [UIEvents-Key].` (16 words, 1 hit in enclosing span, 1 hit file-wide)
   - Classification: **cross-reference** (points externally to `[UIEvents-Key]` for the Modifier Keys table)

### 3.2 Modifier-key list/table entry covering CapsLock

1. **`EventModifierInit` dictionary member definition:**
   - Raw line: **3569**
   - Dfn attributes: `data-dfn-for="EventModifierInit" data-dfn-type="dict-member" data-export id="dom-eventmodifierinit-modifiercapslock"`
   - Tag-stripped quote: `modifierCapsLock, of type boolean, defaulting to false` (7 words, 1 hit in enclosing span, 1 hit file-wide)
   - Classification: **definition site** (`id="dom-eventmodifierinit-modifiercapslock"`)

2. **`EventModifierInit` `modifierCapsLock` getModifierState contract (prose):**
   - Raw lines: **3571–3575**
   - Tag-stripped quote: `Initializes the event object’s key modifier state such that calls to the getModifierState() or getModifierState() when provided with the parameter CapsLock must return true.` (24 words, 1 hit in enclosing span, 1 hit file-wide)
   - Classification: **prose** (normative initializer contract connecting `modifierCapsLock` to `getModifierState("CapsLock")`)

3. **`EventModifierInit` WebIDL dictionary member:**
   - Raw line: **3487**
   - Tag-stripped quote: `boolean modifierCapsLock = false;` (4 words, 1 hit file-wide)
   - Classification: **definition site** (WebIDL dictionary member)

4. **§4.3.1 Modifier keys state activation prose (head):**
   - Raw lines: **4790–4791**
   - Tag-stripped quote: `Other modifiers are activated depending on their state such as CapsLock, NumLock, or ScrollLock.` (14 words, 1 hit file-wide)
   - Classification: **prose** (§4.3.1 explanation of modifier state activation vs held keys)

5. **§4.3.1 Modifier keys state change on keydown prose (tail):**
   - Raw lines: **4791–4792**
   - Tag-stripped quote: `Change in the state happens when the modifier key is being pressed down.` (13 words, 1 hit file-wide)
   - Classification: **prose** (§4.3.1 timing explanation that modifier state toggle occurs on keydown)

6. **§7.3.3 Fixed virtual key codes table entry:**
   - Raw lines: **6370–6372**
   - Tag-stripped quote: `CapsLock 20` (2 words, 1 hit in table)
   - Classification: **table entry** (§7.3.3 Fixed virtual key codes table; maps CapsLock to virtual key code 20)
   - Significance for C2: Grounds `windowsVirtualKeyCode: 20` for CapsLock in CDP `Input.dispatchKeyEvent`.

7. **`NumLock` parallel entries:**
   - Raw line 3491: `boolean modifierNumLock = false;` (4 words, definition site)
   - Raw line 3601: `modifierNumLock, of type boolean, defaulting to false` (7 words, definition site `id="dom-eventmodifierinit-modifiernumlock"`)
   - Raw lines 3603–3607: `Initializes the event object’s key modifier state such that calls to the getModifierState() or getModifierState() when provided with the parameter NumLock must return true.` (24 words, prose)

8. **`modifier key` definition in §12 Glossary:**
   - Raw line: **7525**
   - Tag-stripped quote: `modifier key` (2 words, 1 hit, definition site `id="modifier-key"`)

### 3.3 Absence analysis: precision on latch/toggle semantics in S161

1. **`Modifier Keys table`:** **ABSENT from S161.**
   - S161 raw lines 3340 and 7531 explicitly cite `[UIEvents-Key]` (`https://www.w3.org/TR/uievents-key/#keys-modifier`) for the Modifier Keys table. S161 itself does not contain the table.
2. **The term `latch`:** **ABSENT from S161.**
   - Zero occurrences of the string `latch` exist anywhere in `uievents.html` (grep count = 0).
3. **The term `toggle`:** **ABSENT from specification text.**
   - The word `toggle` appears 4 times in `uievents.html`, but **all 4 occurrences are in client-side HTML/JavaScript UI functions** for interactive definition panels (`toggleDfnPanel(dfn)` at lines 9439, 9453, 9460, and `panel.classList.toggle(...)` at line 9728). Zero occurrences exist in specification prose, tables, or WebIDL.
4. **CapsLock toggle / latch state machine:** **ABSENT from S161.**
   - While §4.3.1 states in prose that CapsLock is activated depending on state and that "Change in the state happens when the modifier key is being pressed down", S161 defines **no state machine**, no state transition diagram, no persistence invariant across intervening alphanumeric keystrokes, and no release (keyUp) independence contract.
   - **Conclusion for C2 freeze wording and D9 sweep:** The latch sequence (`false -> true -> held across letters -> false`) is grounded in DOM `KeyboardEvent.getModifierState('CapsLock')` returning the active state and §4.3.1's prose description of state activation on keydown, but the concrete toggle state retention across intervening keystrokes is browser/OS platform behavior, NOT an explicit state machine formalized in S161.

## 4. S153 — `Input.dispatchKeyEvent` parameter descriptions

Located in `browser_protocol.json` within command `Input.dispatchKeyEvent` (domain `Input`, command block raw lines 14307–14410):

1. **`modifiers`:**
   - Raw line: **14323**
   - Type: `integer`, `optional: true`
   - Description literal: `"description": "Bit field representing pressed modifier keys. Alt=1, Ctrl=2, Meta/Command=4, Shift=8\n(default: 0).",`
   - Tag-stripped words: 12 words
   - Occurrences: 1 inside `dispatchKeyEvent` block; 5 file-wide across sibling Input commands (`dispatchDragEvent`, `dispatchKeyEvent`, `dispatchMouseEvent`, `dispatchTouchEvent`, `emulateTouchFromMouseEvent`)
   - Classification: parameter description

2. **`text`:**
   - Raw line: **14335**
   - Type: `string`, `optional: true`
   - Description literal: `"description": "Text as generated by processing a virtual key code with a keyboard layout. Not needed for\nfor `keyUp` and `rawKeyDown` events (default: \"\")",`
   - Tag-stripped words: 23 words (note the upstream typo `for\nfor`)
   - Occurrences: 1 inside `dispatchKeyEvent` block; 1 file-wide for this exact description
   - Classification: parameter description

3. **`code`:**
   - Raw line: **14353**
   - Type: `string`, `optional: true`
   - Description literal: `"description": "Unique DOM defined string value for each physical key (e.g., 'KeyA') (default: \"\").",`
   - Tag-stripped words: 14 words
   - Occurrences: 1 inside `dispatchKeyEvent` block; 1 file-wide
   - Classification: parameter description

4. **`key`:**
   - Raw line: **14359**
   - Type: `string`, `optional: true`
   - Description literal: `"description": "Unique DOM defined string value describing the meaning of the key in the context of active\nmodifiers, keyboard layout, etc (e.g., 'AltGr') (default: \"\").",`
   - Tag-stripped words: 24 words
   - Occurrences: 1 inside `dispatchKeyEvent` block; 1 file-wide
   - Classification: parameter description

5. **`windowsVirtualKeyCode`:**
   - Raw line: **14365**
   - Type: `integer`, `optional: true`
   - Description literal: `"description": "Windows virtual key code (default: 0).",`
   - Tag-stripped words: 7 words
   - Occurrences: 1 inside `dispatchKeyEvent` block; 1 file-wide
   - Classification: parameter description

All 5 parameters are within the declared 25-word bound (12, 23, 14, 24, 7 words) and are located byte-exact in the raw bytes.

## 5. Artifacts and verification

| path | sha256 | bytes |
|---|---|---|
| `.ufo/waves/round-59/sources/browser_protocol.json` | `d6737c31f268ed74e65dde393006dd9c590a713febd2361d734722eb059f31e7` | 1423170 |
| `.ufo/waves/round-59/sources/uievents.html` | `8ded5eaf4f190b13c59582d5e92b81d3585112dde963d71d65d8e5991212b918` | 920762 |
| `.ufo/waves/round-59/scout/reopen-receipt-s153.json` | `9e12ae4c2c8109b0964dfc621763824f7cf0ab181824a872a55763c51810c38d` | 11690 |
| `.ufo/waves/round-59/scout/reopen-receipt-s161.json` | `db250d138e6655314ba0607726a7da0e322901fe5d35fb98f890bdc40ffec915` | 39085 |
| `.ufo/waves/round-59/scout/reopen-verify.json` | `4e3b00a6fe2dd371466b9d32c5cf07e8bd968c9163b92c48384798e95fe26804` | 15421 |

### Verification outcome:
- `reopen-verify.json`: **93 checks, 0 failed, pass=True**.
  - Verified: valid JSON parsing, schema `tabi-source-reopen-v1`, `f3-fetched-date` ISO-8601 UTC format, `f4-fetch-digest` matching staged bytes, `f4-bytes-count` matching staged size.
  - Verified R57-S3 fetch guard compliance: final host == cited host (`raw.githubusercontent.com`, `www.w3.org`), `num_redirects: 0`, `url_effective` == cited URL, `content_type` recorded, `size_download` matches byte count.
  - Verified `f5-held-equals-located` and quote presence in stored bytes.
  - Verified all `locatiions` / `locations` quotes are <= 25 tag-stripped words and byte-exact at the declared raw line numbers.
  - Verified `cmp` against `.ufo/waves/round-58/sources/` staged copies: both are **byte-identical**.
- Sentinel check simulation (`probe-check-scout-receipts.mjs`): **0 findings, predicate: true**.

## 6. Commands executed and outcomes

1. `curl -sS --max-time 120 -w "..." -o uievents.html https://www.w3.org/TR/uievents/`: HTTP 200, 0 redirects, 920762 B. Outcome: SUCCESS.
2. `curl -sS --max-time 120 -w "..." -o browser_protocol.json https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json`: HTTP 200, 0 redirects, 1423170 B. Outcome: SUCCESS.
3. `sha256sum uievents.html browser_protocol.json`: verified hashes match registered anchors. Outcome: SUCCESS.
4. `cmp` vs `.ufo/waves/round-58/sources/`: verified both files are byte-identical to previous round. Outcome: SUCCESS.
5. Python exploration and quote verification: located raw lines, verified tag-stripped word counts (all <= 25 words), classified each site. Outcome: SUCCESS.
6. `build_receipts.py`: generated candidate receipts conforming to both prompt schema and `tabi-source-reopen-v1`. Outcome: SUCCESS.
7. `verify_receipts.py`: ran 93 checks with 0 failures (`pass=True`). Outcome: SUCCESS.
8. Sentinel probe check: `findingCount: 0, predicate: true`. Outcome: SUCCESS.

## 7. Unknowns

- Whether Chromium 155 headless on Linux synchronizes CapsLock modifier state with any host X11/Wayland display server or maintains an internal synthetic toggle state when running with `--headless`. The loopback CDP fixture uses synthetic CDP `Input.dispatchKeyEvent` events with `key="CapsLock"`, `code="CapsLock"`, `windowsVirtualKeyCode=20`, which directly triggers Blink's internal modifier state tracker. This is verified by C2's live run pass, not spec recon.
- No unknowns remain regarding S153 or S161 source evidence: both files are completely verified, byte-identical to registry anchors, and all requested quotes are located and classified.
