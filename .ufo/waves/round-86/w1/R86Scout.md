# R86Scout — WHATWG HTML `input.html` sources for the accept-attribute and colour-exemption laws

Seat: `R86Scout` (scout, read-only leaf; no subagents dispatched).
Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin` · round 86 · wave `w1` · nonce `tabi-r86-l1-4bd89a80f439`.
Axis judged: **coverage**. Milestone: *open the sources for the accept-attribute and colour-exemption laws*.

Nothing in this report proposes amending a predicate, counter, pin, prior, threshold or kill rule.
Everything below is a source citation plus what it does and does not license for the frozen r86 laws.

---

## 0. The fetched source (one fetch, three quotes)

| field | value |
|---|---|
| URL | `https://html.spec.whatwg.org/multipage/input.html` |
| fetch status | **HTTP/2 200** (`curl -sS -I -L`), `content-type: text/html; charset=utf-8` |
| content-length / bytes downloaded | **687515** bytes (header `content-length: 687515`; `size_download=687515`) |
| sha256 | **`b0202de1c0b422d94d7aa23b4f1b0e3126d9d044bf7076394b6e00451f0fcd16`** |
| last-modified / etag | `Fri, 06 Nov 2026 22:04:01 GMT` / `"6aee4ed1-a7d9b"` |
| fetched copy (this seat) | `/fast/scratch/hyaku/tabi-r86/R86Scout/sources/whatwg-input.html` (scratch removed at yield, per bounds) |
| byte-identical lane copy (pre-existing) | `.ufo/waves/round-86/sources/whatwg-input.html` — **same sha256 `b0202de1…f0fcd16`** (independently re-fetched here; the lane's stored copy is corroborated, not assumed) |

All three quotes below come from that one page, so this metadata applies to each of (1), (2), (3).
Word counts are `wc -w` of the exact quote file (`wc -w` counts whitespace-separated tokens; the
quotes are stored one-per-file so the count is reproducible, not eyeballed).

Verbatim-ness was machine-checked, not read off: each quote string was tested as an exact
substring of the tag-stripped, entity-decoded page text (`True` for all six quote files below).

---

## 1. The `accept` attribute sentence — a **hint**, not a validator

**Quote (20 words, `wc -w`):**

> The accept attribute may be specified to provide user agents with a hint of what file types will be accepted.

* **Locator:** WHATWG HTML §4.10.5.1.17 “File Upload state (`type=file`)”, the paragraph that
  defines the `accept` content attribute (`<dfn … id=attr-input-accept>`).
  Page anchor `https://html.spec.whatwg.org/multipage/input.html#file-upload-state-(type=file)`;
  the `accept` dfn anchor `#attr-input-accept`.
  **Local lines 4066–4068** of the fetched file (`4066` = the `<p>The <dfn …>accept</code></dfn>` opener,
  `4067` = “attribute may be specified to provide user agents with a hint of what file types will be”,
  `4068` = “accepted.</p>”).
* **Verbatim check:** exact substring of the tag-stripped page — **True**.

**Two supporting sentences from the same section (same fetch, same sha256):**

* **Q1b (20 words)** — line 4088–4089, §4.10.5.1.17:
  > User agents should prevent the user from selecting files that are not accepted by one (or more) of these tokens.
* **Q8 (21 words)** — line 4080–4084, §4.10.5.1.17:
  > User agents may use the value of this attribute to display a more appropriate user interface than a generic file picker.
* **Q9 (17 words)** — line 4119–4121, §4.10.5.1.17 (the security warning):
  > even if the user is not hostile and the user agent fully obeyed the accept attribute's requirements

**What it grounds — one measured r86 leg:** `sp86-accept-pdf-token-png`.
Measured in the frozen scored receipt (`corpus/evidence/round86/chromium-showpicker/receipt.json`,
fixture `94421dc0…4a3a1`, driver `5a435da6…13d`, 30 legs, `failures: []`):
the input `ap` carries `accept="application/pdf"` (read back from the page, `fixtureInputs` →
`{id:'ap', type:'file', accept:'application/pdf'}`), it is answered with `tabi-r86-b.png`
(`image/png`, 21 bytes) through `DOM.setFileInputFiles`, and the receipt records
`stateAfter.ap = [["tabi-r86-b.png", 21, "image/png", ""]]`, trusted `input@ap` + `change@ap`,
page-read `hex:89504e470d0a1a0a746162692d7238332d706e670a`, and exactly **1**
`Page.fileChooserOpened` (`selectSingle`). The frozen counter’s `accept-grammar-law`
(`scripts/check-showpicker-r86.mjs:680`) is **True**, and the whole counter run is
`verdict: "clean"`, `checkCount: 95`, `findings: []`, exit **0** (re-run here read-only against the
committed receipt with the frozen driver/fixture/nonce pins and the frozen prior set).
The normative hinge is that `accept` is *addressed to the user agent as a hint for the picker UI* —
which is why it cannot be a validator on a programmatically delivered answer.

**What it does NOT ground (one thing):** it does not ground that a **human picking a disallowed
file in a real dialog** would be refused. Q1b is a *SHOULD* scoped to “prevent the **user from
selecting**” — it constrains the picker’s user-selection surface, not the `input` element’s
file list. The spec page also contains **zero** occurrences of `setFileInputFiles` and **zero**
occurrences of `fileChooserOpened` (grep over the fetched copy: `0` / `0`), so no sentence on this
page can ground the CDP answer path or the file-chooser metric itself; only the hint/dialog
wording can ground that `accept` is not a validator.

---

## 2. The `showPicker()` step that exempts **File Upload** and **Color** from the SecurityError

**Quote (18 words, `wc -w`):**

> this's type attribute is not in the File Upload state or Color state, then throw a "SecurityError" DOMException.

* **Locator:** WHATWG HTML §4.10.5.4 “Common `input` element APIs”, the `showPicker()` method
  steps (the `HTMLInputElement.showPicker()` / `HTMLSelectElement.showPicker()` step list),
  step 2 (the cross-origin guard). Page anchor
  `https://html.spec.whatwg.org/multipage/input.html#common-input-element-apis`; method anchor
  `#dom-input-showpicker` (dfn at line 5827).
  **Local lines 5832–5836** (5832–5834 carry the origin condition, 5835 the File Upload / Color
  exemption, 5836 the `"SecurityError" DOMException`).
* **Verbatim check:** exact substring of the tag-stripped page — **True**.

**Companion note in the same step list (same fetch):**

* **Q2b (12 words)** — line 5838–5840, the `<p class=note>` immediately after that step:
  > File and Color inputs are exempted from this check for historical reason
  (full note continues: “…their input activation behavior also shows their pickers, and has never
  been guarded by an origin check.”)

**What it grounds — one measured leg (r86 receipt):** `sp84-cross-origin-color`, present in the
**same** frozen r86 scored receipt (the r86 driver runs the r84/r85 legs plus the six new r86
ones; 30 legs total). Measured: the cross-origin child’s own script calls `showPicker()` on the
`type=color` input `co` → `childResult = {ok: true, ret: "undefined"}`, **0**
`Page.fileChooserOpened`, parent cross-access `SecurityError`, 5 trusted child events
(`pointerdown/mousedown/pointerup/mouseup/click@go5`), `childLate: 0`. The contrast set in the
same receipt is the direct reading of the exemption’s shape: `sp84-cross-origin-month`,
`-week`, `-time`, `-number`, `-range`, `-tel`, `-search`, `-text` all record
`{ok: false, name: 'SecurityError'}` — only the **File Upload / Color** pair is exempt.
The frozen counter encodes exactly this contrast (`scripts/check-showpicker-r86.mjs:338`
`CHILD_RESULT_LAW['sp84-cross-origin-color'] = {ok:true, ret:'undefined'}` versus
lines 336–346 for the SecurityError legs).

**What it does NOT ground (one thing):** it does **not** ground the r86 *new* colour arm.
`sp86-same-origin-color-activated` is **same-origin**, so the origin condition of this step is
false and the exemption clause is never exercised by any of the six new r86 legs — the r86
addition measures a *picker-support* question, not the cross-origin guard. Two further gaps this
step leaves open (observations, not proposals): (a) the receipt contains **no cross-origin
file-input leg at all** — the cross-origin file case appears only as `sp84-cross-origin-nonfile`,
whose target is `dt` (`type=date`), i.e. a *non*-file input, so the **File Upload** half of the
exemption is exercised in the receipt only for Color; (b) the step says nothing about pickers,
CDP events or activation, so it grounds none of the colour arm’s measured facts about
`Page.fileChooserOpened`, `input`/`change`, or activation consumption.

---

## 3. “Shows any applicable picker UI” / “does not support a picker”

**Quote 3a (15 words, `wc -w`):**

> Shows any applicable picker UI for input, so that the user can select a value.

* **Locator:** §4.10.5.4 “Common `input` element APIs”, the IDL description of
  `input.showPicker()` (the `<dt><code>input.showPicker()</code><dd>` entry, `id=dom-input-showpicker-dev`).
  Page anchor `https://html.spec.whatwg.org/multipage/input.html#dom-input-showpicker-dev`.
  **Local lines 5596–5597** (5596 = the `<dt>` entry opener, 5597 = the sentence).
* **Verbatim check:** exact substring of the tag-stripped page — **True**.

**Quote 3b (11 words, `wc -w`):**

> If input does not support a picker, this method does nothing.

* **Locator:** §4.10.5.4, the sentence immediately following 3a, linked to
  `#input-support-picker` (`id=common-input-element-apis:input-support-picker`).
  **Local lines 5599–5600**.
* **Verbatim check:** exact substring of the tag-stripped page — **True**.

**Three supporting sentences from the same page (same fetch, same sha256):**

* **Q6 (7 words)** — line 5845, the last step of the `showPicker()` method steps:
  > Show the picker, if applicable, for this.
* **Q5 (9 words)** — line 5855–5856, in “To show the picker, if applicable for an input or select element”:
  > If element does not support a picker, then return.
* **Q4 (8 words)** — line 5854, the step immediately above it:
  > Consume user activation given element's relevant global object.
* **Q7 (17 words)** — line 1466–1467, §4.10.5.1 (`#input-support-picker`, line 1463):
  > An input element must support a picker when its type attribute is in the File Upload state.
  (the following non-normative note at line 1470 lists “Date, Month, Week, Time, Local Date and
  Time, and Color states” among types “typical browser implementations show such picker UI for”).

**What it grounds — one measured r86 leg:** `sp86-same-origin-color-activated`.
Measured in the frozen scored receipt: `showPicker = {ok: true, ret: "undefined"}`;
`activationBefore = {isActive: true, hasBeenActive: true}` →
`activationAfter = {isActive: false, hasBeenActive: true}` (consumed);
**0** `Page.fileChooserOpened` (the `cdpEventLog` for that leg holds only `Page.frameNavigated`);
**0** `input`/`change` page events (only the five trusted `pad` pointer/mouse events);
`stateAfter.cos = []`. The frozen counter’s `same-origin-color-law`
(`scripts/check-showpicker-r86.mjs:686`) is **True** and `no-selection-law` (line 710) is **True**.
3a + 3b + Q6/Q5/Q4 are what make that observation legible: `showPicker()` *shows an applicable
picker*, activation is consumed whatever happens next, and where there is no picker the method
does nothing — so an `undefined` return with zero file-chooser events and no `input`/`change` is
the spec-shaped outcome, not an anomaly.

**What it does NOT ground (one thing):** it does **not** ground that the colour arm opened *no UI
at all*. “Applicable picker UI” is not what `Page.fileChooserOpened` measures — that CDP event is
a **FILE**-chooser metric, and the spec’s own picker-support note lists **Color** among the states
for which implementations show picker UI (line 1470). So the zero in this leg is evidence about
*file* choosers only; the colour popup is outside the metric, exactly as the counter’s own
comment on the law says (“the colour popup is not measured”). The spec sentence cannot close that
scope — the measurement’s own scoping does.

---

## 4. Coverage notes for the L1 (observations only — no instrument change proposed)

1. **The three laws have direct, checkable source anchors**, each pinned to one file digest:
   `accept` = hint (§4.10.5.1.17, lines 4066–4068, plus the “should prevent the user from
   selecting” SHOULD at 4088–4089); File Upload/Color exemption (§4.10.5.4, lines 5832–5840);
   picker-UI semantics (§4.10.5.4, lines 5596–5600 and 5845–5856, plus `#input-support-picker`
   at 1463–1467).
2. **The one claim the new r86 colour arm cannot make from this page** is any statement about a
   *popup*; `Page.fileChooserOpened` is file-scoped by construction, and the spec lists Color as
   a picker-UI state. The r86 law is correctly worded as a FILE-chooser metric (0 events) — the
   source confirms the wording is the right one.
3. **The `accept` law’s scope is the dialog-hint, not a validator** — and the page contains no CDP
   vocabulary at all (0 hits for `setFileInputFiles`, 0 for `fileChooserOpened`), so the r86
   measurement is a *Chromium* fact that this spec page can only *license*, never *entail*.
4. **The receipt’s cross-origin coverage** touches the Color half of the exemption
   (`sp84-cross-origin-color`) but not the **File Upload** half — there is no cross-origin
   `type=file` leg in the 30-leg r86 receipt (the `sp84-cross-origin-nonfile` target is `dt`,
   a `type=date` input). Recording this as a scope observation for the record.

---

## 5. Tools and provenance

| tool | version | channel | reason |
|---|---|---|---|
| `curl` | 8.23.0 (OpenSSL 3.6.5) | pre-installed (pacman) — **no install, no update performed** | fetching `input.html` |
| `node` | v24.21.0 | pre-installed | running the frozen counter read-only |
| `python3` | 3.14.8 | pre-installed | verbatim-substring checks, receipt inspection |

No package was installed or upgraded in this seat (no `pacman`, no `uv tool`, no `npm -g`); the
update-safety gate was not engaged because no transaction was needed.

**Commands run (all read-only; nothing in the lane tree, `.ufo/state` or `.scratch/` was modified):**
`curl -I/-o` on the WHATWG URL (scratch), `sha256sum` on the fetched copy and the lane’s stored
copy, `wc -w` on the quote files, a python3 verbatim-substring check of each quote against the
tag-stripped page, and one read-only run of the frozen counter
`scripts/check-showpicker-r86.mjs --lane … --receipt corpus/evidence/round86/chromium-showpicker/receipt.json
--expect-driver-sha256 5a435da6…13d --expect-nonce tabi-r86-l1-4bd89a80f439
--expect-fixture-sha256 94421dc0…4a3a1 --prior-set .ufo/waves/round-86/controls/c1/prior-set.txt --json`
→ `verdict: "clean"`, `checkCount: 95`, `findings: []`, exit **0**; `accept-grammar-law`,
`same-origin-color-law`, `no-selection-law`, `accept-answer-law`, `accept-mime-answer-law` all **True**.
No git/jj command of any kind was run; no fixture repo was created.

**Scratch:** `/fast/scratch/hyaku/tabi-r86/R86Scout/` (fetched source + the 12 one-quote-per-file
word-count files) — **removed before yield**, per the lane bounds. The digest that identifies the
source (`b0202de1c0b422d94d7aa23b4f1b0e3126d9d044bf7076394b6e00451f0fcd16`) is recorded above and
matches the lane’s pre-existing `.ufo/waves/round-86/sources/whatwg-input.html`, so no fetched
copy was left behind and no copy was written into the lane’s corpus.
