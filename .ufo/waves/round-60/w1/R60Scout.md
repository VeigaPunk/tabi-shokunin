# R60Scout — S161 Re-open and S163 Source Open for C2 Ground (round 60, wave w1)

- **Seat:** R60Scout (scout)
- **Role:** Source recon for C2's sourced ground (S161 re-open and S163 new open)
- **Round / Wave:** Round 60, Wave w1 (tabi-shokunin)
- **Access Date:** 2026-11-03
- **Receipts Written:**
  - `.ufo/waves/round-60/sources/s161-reopen-receipt.json` (sha256 `13067854d04ea2866782b5aac07282cb5e85cd9abb7d812d7ae6de804b0edd41`)
  - `.ufo/waves/round-60/sources/s163-fetch-receipt.json` (sha256 `46512fd8e76cf97d2b778b3fb941f0c37e5241afca688f4babfafbb21af6912b`)
- **Staged Sources:**
  - `.ufo/waves/round-60/sources/uievents.html` (920,762 B, sha256 `8ded5eaf4f190b13c59582d5e92b81d3585112dde963d71d65d8e5991212b918`)
  - `.ufo/waves/round-60/sources/dom.html` (2,714,595 B, sha256 `9b797e186fca784bce79a6d627e4e7827c3d9dd1aadf529265c61768b43a2153`)

---

## 1. Fetch Guard (R57-S3 Binding Guard)

Both fetches executed via `curl -sSL` capturing final URL, redirect count, HTTP status code, download size, and SHA-256 digest:

| Guard Field | S161 (`uievents.html`) | S163 (`dom.html`) |
|---|---|---|
| Requested URL | `https://www.w3.org/TR/uievents/` | `https://dom.spec.whatwg.org/` |
| Final URL (`url_effective`) | `https://www.w3.org/TR/uievents/` | `https://dom.spec.whatwg.org/` |
| Final Host (`finalHost`) | `www.w3.org` | `dom.spec.whatwg.org` |
| Final Host == Cited Host | **YES** (`www.w3.org`) | **YES** (`dom.spec.whatwg.org`) |
| Redirect Count (`numRedirects`) | `0` | `0` |
| HTTP Status (`httpStatus`) | `200` | `200` |
| Byte Count (`bytes`) | `920,762` | `2,714,595` |
| SHA-256 (`sha256`) | `8ded5eaf4f190b13c59582d5e92b81d3585112dde963d71d65d8e5991212b918` | `9b797e186fca784bce79a6d627e4e7827c3d9dd1aadf529265c61768b43a2153` |
| Refused | `False` | `False` |

---

## 2. S161 Re-open Verdict & Anchor Comparison

- **Registered S161 Anchor:** `920,762 B`, sha256 `8ded5eaf4f190b13c59582d5e92b81d3585112dde963d71d65d8e5991212b918` (registered in `corpus/SOURCES.md` row S161 and staged across rounds 54–59).
- **Round-60 Fresh Fetch:** `920,762 B`, sha256 `8ded5eaf4f190b13c59582d5e92b81d3585112dde963d71d65d8e5991212b918`.
- **Verdict:** **byte-identical** (UNMOVED). Zero drift against registered anchor and zero drift against previous round staged copies.

---

## 3. S161 Keydown Cancelable Ground

In the staged `uievents.html` bytes, the UI Events event-type summary table and definition tables were audited:

### 3.1 Event-Type Table (Section 3.1 "List of Event Types", `id="event-types-list"`, line 2108)

The table `<table class="event-sequence-table">` spans lines 2122–2437.
Header row (lines 2124–2131):
- Col 1: `Event Type` (line 2125)
- Col 2: `Sync / Async` (line 2126)
- Col 3: `Bubbling Phase` (line 2127)
- Col 4: `Trusted event target types` (line 2128)
- Col 5: `DOM Interface` (line 2129)
- Col 6: `Cancelable` (line 2130)
- Col 7: `Default Action` (line 2131)

The `keydown` row is located at lines 2221–2228:
- Line 2222: `<td><a data-link-type="dfn" href="#keydown" id="ref-for-keydown"><code>keydown</code></a>`
- Line 2223: `<td style="text-align:center">Sync`
- Line 2224: `<td style="text-align:center">Yes`
- Line 2225: `<td style="text-align:center">Element`
- Line 2226: `<td style="text-align:center"><code class="idl"><a data-link-type="idl" href="#keyboardevent" id="ref-for-keyboardevent③">KeyboardEvent</a></code>`
- Line 2227: `<td style="text-align:center">Yes`
- Line 2228: `<td>Varies: trigger ...`

**Result:**
The table row explicitly states `Yes` in the `Cancelable` column (line 2227) for `keydown`.
- **Quote 1 (Row cols 1–6):**
  - Raw lines: **2222–2227** (reported line: **2227**)
  - Tag-stripped quote: `keydown Sync Yes Element KeyboardEvent Yes`
  - Word count: **6 words** (≤ 25 words bound)
  - Classification: **table entry** (Section 3.1 List of Event Types, keydown row cols 1–6, Cancelable column is Yes)
- **Quote 2 (Cancelable cell):**
  - Raw line: **2227**
  - Tag-stripped quote: `Yes`
  - Word count: **1 word**
  - Classification: **table cell** (Section 3.1 List of Event Types, keydown row Cancelable column)

### 3.2 Keydown Definition Table (Section 3.5.6.1 `id="event-type-keydown"`, line 3732)

In the definition table `<table class="event-definition">` (lines 3733–3800):
- Line 3751: `<th>Cancelable`
- Line 3752: `<td>Yes`
- Raw lines: **3751–3752**
- Tag-stripped quote: `Cancelable Yes`
- Word count: **2 words**
- Classification: **table entry** (Section 3.5.6.1 keydown definition table, Cancelable property)

### 3.3 Default Actions & Cancelable Keyboard Events (Section 4.3.4, line 5679)

- Raw lines: **5680–5681**
- Tag-stripped quote: `Canceling the default action of a keydown event MUST NOT affect its respective keyup event`
- Word count: **15 words**
- Classification: **prose** (Section 4.3.4 Default actions and cancelable keyboard events)

---

## 4. S163 (DOM Standard) Event.cancelable Ground

In the staged `dom.html` (single page DOM Standard, 22,322 lines), occurrences of the `cancelable` attribute on interface `Event` were located and classified into three required categories:

### 4.1 Definition Sites

1. **Dfn and Getter Steps:**
   - Raw lines: **1449–1451** (reported line: **1450**)
   - Section: §2.2 Interface `Event`
   - Markup: `<dfn class="dfn-paneled idl-code" data-dfn-for="Event" data-dfn-type="attribute" data-export id="dom-event-cancelable"><code>cancelable</code></dfn>`
   - Tag-stripped quote: `The bubbles and cancelable attributes must return the values they were initialized to.`
   - Word count: **13 words** (≤ 25 words bound)
   - Classification: **definition site** (`id="dom-event-cancelable"` getter steps)
   - Normative meaning: Grounds that `event.cancelable` returns the boolean value initialized on the event object.

2. **WebIDL Interface Declaration:**
   - Raw line: **1032**
   - Section: §2.2 Interface `Event` IDL block
   - Tag-stripped quote: `readonly attribute boolean cancelable;`
   - Word count: **4 words**
   - Classification: **definition site** (WebIDL Event interface attribute declaration)

### 4.2 Prose

3. **Event.cancelable Developer Summary:**
   - Raw line: **1165** (span 1165–1166)
   - Section: §2.2 Interface `Event` summary description
   - Tag-stripped quote: `Returns true or false depending on how event was initialized.`
   - Word count: **10 words** (≤ 25 words bound)
   - Classification: **prose** (Section 2.2 Event interface description)

### 4.3 Cross-References

4. **Set the Canceled Flag Algorithm (preventDefault):**
   - Raw lines: **1454–1457** (reported line: **1455**)
   - Section: §2.2 `set the canceled flag` algorithm
   - Tag-stripped quote: `if event’s cancelable attribute value is true and event’s in passive listener flag is unset, then set event’s canceled flag, and do nothing otherwise.`
   - Word count: **24 words** (≤ 25 words bound)
   - Classification: **cross-reference** (set the canceled flag algorithm referencing cancelable)

5. **DispatchEvent Return Contract:**
   - Raw lines: **1911–1912** (reported line: **1911**)
   - Section: §2.8 Dispatching events
   - Tag-stripped quote: `if either event’s cancelable attribute value is false or its preventDefault() method was not invoked; otherwise false.`
   - Word count: **17 words** (≤ 25 words bound)
   - Classification: **cross-reference** (dispatchEvent algorithm referencing cancelable)

6. **IDL Index Reference:**
   - Raw line: **15857**
   - Section: IDL Index
   - Tag-stripped quote: `attribute for Event, in § 2.2`
   - Word count: **6 words**
   - Classification: **cross-reference** (IDL index)

---

## 5. Artifact Ledger

| Path | Bytes | SHA-256 | Description |
|---|---|---|---|
| `.ufo/waves/round-60/sources/uievents.html` | 920,762 | `8ded5eaf4f190b13c59582d5e92b81d3585112dde963d71d65d8e5991212b918` | Staged W3C UI Events specification |
| `.ufo/waves/round-60/sources/dom.html` | 2,714,595 | `9b797e186fca784bce79a6d627e4e7827c3d9dd1aadf529265c61768b43a2153` | Staged WHATWG DOM Standard |
| `.ufo/waves/round-60/sources/s161-reopen-receipt.json` | 2,505 | `13067854d04ea2866782b5aac07282cb5e85cd9abb7d812d7ae6de804b0edd41` | S161 re-open receipt with guard and quotes |
| `.ufo/waves/round-60/sources/s163-fetch-receipt.json` | 2,702 | `46512fd8e76cf97d2b778b3fb941f0c37e5241afca688f4babfafbb21af6912b` | S163 fetch receipt with guard and classified quotes |
| `.ufo/waves/round-60/w1/R60Scout.md` | - | - | This report |

---

## 6. Peer Coordination

- Delivered notification to `agent://R60Scribe`:
  `READY sources/s163-fetch-receipt.json sources/s161-reopen-receipt.json`
- Both receipts validated: all quotes ≤ 25 words, byte-verified against staged copies.
- No unrun checks or remaining gaps in S161 or S163 evidence.
