# R57Scribe — round 57 wave w1 — frontier sources for C2 (S153 + S161 re-open)

Seat: `R57Scribe` (scribe) · lane: `tabi-shokunin` · wave: round 57 w1 (the only v1 wave)
Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin` · baseline `ef43ececde883cc0368c6c7cfbabe30ef937b717`
Host: linux 7.2.11-arch1-1 x64 · fetch time `2026-11-03T18:56:58Z` (UTC)

## What this seat did

Re-opened the two registered rows C2 rests on (`claims.json` → `frontierStep.sourcesReopened`),
parsed the fresh bytes for the located ground, and wrote the receipts in the shape of
`scripts/check-source-reopen-receipt.mjs`. **Nothing else was touched**: no edit to
`corpus/SOURCES.md`, no knowledge note, no lesson, no data, no git/jj mutation, no commit.

Artifacts written (all under the seat's named paths):

| Path | What |
|---|---|
| `.ufo/waves/round-57/sources/browser_protocol.json` | S153 fresh bytes (1,423,170 B) |
| `.ufo/waves/round-57/sources/uievents.html` | S161 fresh bytes (920,762 B) |
| `.ufo/waves/round-57/scribe/reopen-receipt-s153.json` | per-source receipt, schema `tabi-source-reopen-v1` |
| `.ufo/waves/round-57/scribe/reopen-receipt-s161.json` | per-source receipt, schema `tabi-source-reopen-v1` |
| `.ufo/waves/round-57/scribe/reopen-receipt-round-57.json` | combined round receipt (same shape, both rows) |
| `.ufo/waves/round-57/scribe/gate-quote-verification.json` | byte-exactness proof for every Gate quote (per quote: bytes, word count, file-wide vs scoped occurrences, first raw line) |
| `.ufo/waves/round-57/w1/R57Scribe.md` | this summary |

No tool was installed or upgraded this seat (nothing was needed; `curl`, `node`, `python3` and
`git` were already present). Per the operator rule of 2026-10-19, nothing is recorded because
nothing was changed.

## Receipt shape

The receipt shape is the one `scripts/check-source-reopen-receipt.mjs` documents in its header:
`schema: "tabi-source-reopen-v1"`, `rows[]` each carrying `id`, `url`, `fetched_at`,
`verdict`, `held_quote`, `located_quote`, `bytes`, `sha256`, `bytes_path`, plus the
`anchor_*` disclosure fields the r56 receipt used, and a `summary` with
`reopened / resolved / unresolved`.

**The frozen gate refuses these receipts by design.** That gate is pinned to
`RECEIPT_PATH = corpus/evidence/round-25/freshness/reopened.json` and
`EXPECTED_IDS = [S013,S015,S016,S020,S023,S024]` — it would report `f6-count-mismatch
(unexpected row id S153)` and `reopened != 6`. **L1 ruling (2026-11-03):** the pinned gate is a
round-25-scoped freshness gate (those pins are that round's set by design), and authoring a
round-57 variant would be instrument proliferation for no new check — so **no new instrument is
required or authored**. The gate's own row predicates were re-implemented against the fresh
bytes in scratch (`f3-fetched-date`, `f4-fetch-digest` incl. the byte-count check,
`f5-unresolved` incl. the held-vs-located quote equality and the located-in-bytes check,
`f6-count-mismatch` incl. `summary.reopened` / `summary.resolved` / `summary.unresolved`) and all
three receipts score **0 findings** — that scratch re-implementation is the verification of
record, and the L1 independently re-verifies the located quotes against the staged bytes at
integration (the L1 gate).

---

## Source 1 — S153 (Chrome DevTools Protocol `browser_protocol.json`)

**Command**

```
curl -sL --max-time 120 -o .ufo/waves/round-57/sources/browser_protocol.json \
  https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json
```

exit 0 · **bytes 1,423,170** · **sha256 `d6737c31f268ed74e65dde393006dd9c590a713febd2361d734722eb059f31e7`**

**Drift verdict vs the registered anchor: BYTE-IDENTICAL — `@master` did NOT move.**

The registry anchor cell for S153 carries **two** digests (the r56 in-place anchor-cell append,
the N4-disclosed pattern): the 2026-10-31 `@master` fetch `f60f0c02…` at 1,421,620 B, and the
round-56 RE-OPEN (2026-11-03) digest `d6737c31…` at 1,423,170 B. The comparison anchor named in
the seat brief — and the anchor this round is measured against — is the **r56 re-open anchor
(1,423,170 B, `d6737c31…`)**. The fresh fetch reproduces it exactly:

```
cmp .ufo/waves/round-57/sources/browser_protocol.json \
    .ufo/waves/round-56/sources/browser_protocol.json   -> no difference
```

So: **not moved** relative to r56 (the anchor the brief names). Relative to the *original*
2026-10-31 open digest `f60f0c02…` (1,421,620 B) the bytes are still the already-disclosed r56
drift — **no new drift this round**. Both facts are recorded in the receipt's
`anchor_drift_detail`; nothing is fudged and no number was silently rewritten.

**Located ground, verified IN THE FRESH BYTES (JSON parsed, not grepped)**

JSON path of the located ground:

```
$.domains[?(@.domain=='Input')].commands[?(@.name=='dispatchKeyEvent')]
    .parameters[?(@.name=='modifiers')].description
```

* the `Input.dispatchKeyEvent` command entry sits at **raw line 14307**; its `parameters` array
  spans **raw lines 14309–14409**;
* the `modifiers` description is at **raw line 14323** — **exactly one** hit inside that command
  block;
* **5 hits file-wide** (raw lines 14300, 14323, 14484, 14594, 14661), one per Input command that
  declares a `modifiers` parameter — `dispatchDragEvent` (14300), `dispatchKeyEvent` (14323),
  `dispatchMouseEvent` (14484), `dispatchTouchEvent` (14594),
  `emulateTouchFromMouseEvent` (14661). Each attribution was made by searching **within each
  command's own byte span**, so the identical literal is attributed to its owner, not to the first
  file-wide occurrence.

**The parameter descriptions the runner legs use** (all present in the fresh bytes, each
file-unique and one hit inside the `dispatchKeyEvent` block):

| Parameter | Type | JSON path suffix | raw line (param / description) |
|---|---|---|---|
| `type` | string, enum `keyDown`/`keyUp`/`rawKeyDown`/`char` | `…parameters[?(@.name=='type')].description` | 14311 / 14312 |
| `modifiers` | integer, optional | `…parameters[?(@.name=='modifiers')].description` | 14322 / **14323** |
| `text` | string, optional | `…parameters[?(@.name=='text')].description` | 14334 / 14335 |
| `unmodifiedText` | string, optional | `…parameters[?(@.name=='unmodifiedText')].description` | 14340 / 14341 |
| `keyIdentifier` | string, optional | `…parameters[?(@.name=='keyIdentifier')].description` | 14346 / 14347 |
| `code` | string, optional | `…parameters[?(@.name=='code')].description` | 14352 / 14353 |
| `key` | string, optional | `…parameters[?(@.name=='key')].description` | 14358 / 14359 |
| `windowsVirtualKeyCode` | integer, optional | `…parameters[?(@.name=='windowsVirtualKeyCode')].description` | 14364 / 14365 |
| `nativeVirtualKeyCode` | integer, optional | `…parameters[?(@.name=='nativeVirtualKeyCode')].description` | 14370 / 14371 |

The `modifiers` bit field the whole chord domain rests on: **`Alt=1, Ctrl=2, Meta/Command=4,
Shift=8`** — i.e. Control=2, Alt=1, Meta=4, Shift=8, exactly the bits C2's chord leg names.

**Located quote the lesson Gate will carry (≤25 words, BYTE-EXACT — the `\\n` is the two-character
JSON escape `\`+`n` as it appears in the raw bytes, not a line break):**

```
"Bit field representing pressed modifier keys. Alt=1, Ctrl=2, Meta/Command=4, Shift=8\\n(default: 0)."
```

(11 words as the escaped description string; the raw literal with the surrounding
`"description": ` and trailing comma is 12 words.)

Supporting quotes the Gate may carry for the runner legs (each byte-exact, each ≤25 words):

```
"Unique DOM defined string value describing the meaning of the key in the context of active\\nmodifiers, keyboard layout, etc (e.g., 'AltGr') (default: \"\")."      (24 words, line 14359)
"Unique DOM defined string value for each physical key (e.g., 'KeyA') (default: \"\")."                                                                (14 words, line 14353)
"Text as generated by processing a virtual key code with a keyboard layout. Not needed for\\nfor `keyUp` and `rawKeyDown` events (default: \"\")"                        (23 words, line 14335)
"Text that would have been generated by the keyboard if no modifiers were pressed (except for\\nshift). Useful for shortcut (accelerator) key handling (default: \"\")."      (25 words, line 14341)
```

---

## Source 2 — S161 (W3C UI Events — KeyboardEvent modifier attributes)

**Command**

```
curl -sL --max-time 120 -o .ufo/waves/round-57/sources/uievents.html https://www.w3.org/TR/uievents/
```

exit 0 · **bytes 920,762** · **sha256 `8ded5eaf4f190b13c59582d5e92b81d3585112dde963d71d65d8e5991212b918`**

**Drift verdict vs the registered anchor: BYTE-IDENTICAL (`same`).**

The row's recorded digest is `8ded5eaf…` at 920,762 B; the fresh fetch reproduces it exactly, and
`cmp` against the committed r56 staged copy shows no difference. No drift to disclose.

**Located ground — the four boolean attribute definitions, re-located in the fresh bytes**

The definitions live under §3.5.1 (`data-level="3.5.1" id="interface-keyboardevent"`, raw line
3123); the r54 cell's "§5.3" was corrected of record in round 55 (D54-2) and the fresh bytes
carry no 5.3 heading — confirmed again this round.

| Attribute | `id=` anchor line | quote line | grep hits (whole file) |
|---|---|---|---|
| `ctrlKey` | `id="dom-keyboardevent-ctrlkey"` — 3261 | **3264** | 1 |
| `shiftKey` | `id="dom-keyboardevent-shiftkey"` — 3270 | 3273 | 1 |
| `altKey` | `id="dom-keyboardevent-altkey"` — 3279 | **3282** | 1 |
| `metaKey` | `id="dom-keyboardevent-metakey"` — 3288 | **3291** | 1 |

The r56 spot-check pinned `ctrlKey` at line 3264 — re-located at **3264** again (the page did not
move). `altKey` and `metaKey` are re-located at 3282 and 3291.

**Located quotes the lesson Gate will carry (≤25 words, BYTE-EXACT, markup retained):**

```
ctrlKey  (line 3264)  <code>true</code> if the <code class="keycap">Control</code> (control) key modifier
shiftKey (line 3273)  <code>true</code> if the shift (<code class="keycap">Shift</code>) key modifier was
altKey   (line 3282)  <code>true</code> if the <code class="keycap">Alt</code> (alternative) (or
                       <code class="glyph">"Option"</code>) key modifier was active.
metaKey  (line 3291)  <code>true</code> if the meta (<code class="keycap">Meta</code>) key modifier was
```

The `<code class="keycap">` markup and the `<code class="glyph">"Option"</code>` markup are
carried verbatim, with the page's own tab indentation and line wrapping (the r56 closure's
quote-precision rule — routed defect 7). The `altKey` definition is split across lines 3282–3283
in the page's own wrapping; the two-line segment occurs exactly once in the file.

## Quote-precision check (byte-exact, no normalisation)

Every quote above was re-extracted **from the files** and matched as an exact byte substring
(no tag-stripping, no whitespace collapsing, no re-quoting):

* S153 `modifiers` literal — **1** occurrence inside the `dispatchKeyEvent` byte span
  (5 file-wide, one per Input command), 117 B / 12 words;
* S153 `type` / `key` / `code` / `text` / `unmodifiedText` / `keyIdentifier` /
  `windowsVirtualKeyCode` / `nativeVirtualKeyCode` description literals — **1** occurrence each,
  file-wide and inside the block;
* S161 `ctrlKey` / `shiftKey` / `altKey` / `metaKey` definition segments — **1** occurrence each,
  file-wide;
* each receipt row's `held_quote == located_quote` and is byte-exact in the stored bytes.

## For the L1 — registry and gate follow-ups (no action taken here)

1. **Registry change (old→new, L1 applies; the N4 in-place anchor-cell pattern).** If the L1
   records the re-open, S153's anchor cell gains
   `RE-OPENED 2026-11-03 (round 57): @master UNMOVED — fresh fetch 1,423,170 B, sha256 d6737c31… == the round-56 re-open digest; the dispatchKeyEvent modifiers description re-verified verbatim in the fresh bytes (1 hit scoped to the command block, 5 across the whole file, one per Input command: dispatchDragEvent/dispatchKeyEvent/dispatchMouseEvent/dispatchTouchEvent/emulateTouchFromMouseEvent)`.
   S161's anchor cell gains
   `RE-OPENED 2026-11-03 (round 57): byte-identical to the registered anchor — 920,762 B, sha256 8ded5eaf…; the ctrlKey/altKey/metaKey/shiftKey boolean attribute definitions re-located at lines 3264 / 3282 / 3291 / 3273 (§3.5.1), grep 1 each`.
   The `used-by` cell should extend `old→new` to the round-57 lesson and knowledge note, as the
   r56 round did.
2. **No round-57 source-reopen gate variant — ruled by the L1 (2026-11-03, in reply to this
   seat).** The L1's ruling: the pinned `scripts/check-source-reopen-receipt.mjs` is a
   round-25-scoped freshness gate (`RECEIPT_PATH`/`EXPECTED_IDS` are that round's set by
   design), and authoring a round-57 variant would be instrument proliferation for no new check.
   **The verification of record is this seat's scratch re-implementation of the frozen gate's
   row predicates, which scored 0 findings on all three receipts** (f3-fetched-date,
   f4-fetch-digest incl. byte count, f5-unresolved incl. held==located and located-in-bytes,
   f6-count-mismatch incl. the three summary counters). The L1 independently re-verifies the
   located quotes against the staged bytes at integration (grepping the byte-exact quotes
   itself) — that double-check is the L1 gate. The receipts stand as written; no new instrument
   is required and none was authored.
3. **The staged bytes must be committed together with the receipts** — accepted by the L1.
   Each receipt's `bytes_path` points at `.ufo/waves/round-57/sources/…`; the two source files
   and the receipts land in the same commit.
4. **Registry edits stay with the L1** — the L1 applies them itself with old→new logging in the
   lesson; the suggested anchor-cell text in this report is advice only, and this seat edited
   neither `corpus/SOURCES.md` nor the knowledge directory nor any lesson.
5. **No failure, no follow-up needed on drift:** both fetches succeeded, both located grounds
   hold, nothing was improvised.

## Out of scope for this seat (declared, not silently skipped)

* The §2b frontier duty — the 38-row quarantine hand-check of the shokuknow absent-defect
  register, verdict per row, **ADOPT NOTHING** — belongs to the `R57QuarA`–`R57QuarD` seats
  (`.ufo/waves/round-57/quarantine/`). This seat wrote nothing there and adopted nothing.
* The C2 counter (`chromium-receipt-r57.mjs`) and the modifier-chord runner
  (`scripts/chrome-cdp-loopback-round57.mjs`) are other seats' artifacts. Observed for
  cross-reference only: the runner file was present at read time with sha256
  `26da87bbfcc2eb7034f6815fd48430ce6bd8a12bf5ba21ae766950a840893b7d` — **not a frozen value**,
  the runner seat still owns it and the L1 pins `<FROZEN-DRIVER-SHA>` at the FREEZE commit.
* `corpus/SOURCES.md`, the knowledge directory and the lessons are L1-owned; this seat edited
  none of them.

## Bounds honoured

Writes only under `.ufo/waves/round-57/sources/`, `.ufo/waves/round-57/scribe/` and
`.ufo/waves/round-57/w1/` in the lane. Scratch root `/fast/scratch/hyaku/tabi-r57/R57Scribe/`
was used for the locator/validator scripts and **deleted on exit**. No git or jj mutation was run
anywhere (`git` was used read-only: `ls-files`, `status`). Nothing was written under the fleet
root, `/home/vgpnk/Projects/shokuknow`, `.ufo/state/`, `.ufo/watchdog.log`, the fleet's
`templates/` or `scripts/`. The shokuknow campaign tools were never invoked.
