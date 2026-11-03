# R58Scribe — drafts for the L1 (text only; the L1 applies)

Round 58 wave w1, seat R58Scribe, 2026-11-03.
These are **drafts**, not applied edits. This seat did not touch `corpus/SOURCES.md`,
`corpus/knowledge/`, or any lesson file. Everything below is derived from the committed
scout receipts (`.ufo/waves/round-58/scout/reopen-receipt-s153.json`,
`reopen-receipt-s161.json`) and from the staged bytes under
`.ufo/waves/round-58/sources/`.

---

## 1. USED-BY DRAFTS (old → new), text only

The L1 applies these in place with old→new logging (the r55/r56/r57 precedent: "the
used-by column extended in place, old→new logged here" — corpus/lessons/round-55.md).

### S153

OLD (verbatim, cell 11 of `corpus/SOURCES.md` line 167):

```
corpus/knowledge/chrome-cdp-loopback-round-44.md, corpus/lessons/round-44.md, corpus/knowledge/webview2-journey-round-50.md, corpus/lessons/round-50.md, corpus/knowledge/webview2-form-journey-round-51.md, corpus/lessons/round-51.md, corpus/knowledge/webview2-keyevent-typing-round-52.md, corpus/lessons/round-52.md, corpus/knowledge/webview2-keyevent-modifier-chords-round-53.md, corpus/lessons/round-53.md, corpus/knowledge/webview2-modifier-domain-round-54.md, corpus/lessons/round-54.md, corpus/knowledge/webview2-control-keys-round-55.md, corpus/lessons/round-55.md, corpus/knowledge/chromium-control-keys-round-56.md, corpus/lessons/round-56.md, corpus/knowledge/chromium-modifier-chords-round-57.md, corpus/lessons/round-57.md
```

NEW (the OLD cell extended with the r58 C2 knowledge note):

```
corpus/knowledge/chrome-cdp-loopback-round-44.md, corpus/lessons/round-44.md, corpus/knowledge/webview2-journey-round-50.md, corpus/lessons/round-50.md, corpus/knowledge/webview2-form-journey-round-51.md, corpus/lessons/round-51.md, corpus/knowledge/webview2-keyevent-typing-round-52.md, corpus/lessons/round-52.md, corpus/knowledge/webview2-keyevent-modifier-chords-round-53.md, corpus/lessons/round-53.md, corpus/knowledge/webview2-modifier-domain-round-54.md, corpus/lessons/round-54.md, corpus/knowledge/webview2-control-keys-round-55.md, corpus/lessons/round-55.md, corpus/knowledge/chromium-control-keys-round-56.md, corpus/lessons/round-56.md, corpus/knowledge/chromium-modifier-chords-round-57.md, corpus/lessons/round-57.md, corpus/knowledge/chromium-preventdefault-swallow-round-58.md
```

### S161

OLD (verbatim, cell 11 of `corpus/SOURCES.md` line 175):

```
corpus/knowledge/webview2-modifier-domain-round-54.md, corpus/lessons/round-54.md, corpus/knowledge/chromium-control-keys-round-56.md, corpus/lessons/round-56.md, corpus/knowledge/chromium-modifier-chords-round-57.md, corpus/lessons/round-57.md
```

NEW:

```
corpus/knowledge/webview2-modifier-domain-round-54.md, corpus/lessons/round-54.md, corpus/knowledge/chromium-control-keys-round-56.md, corpus/lessons/round-56.md, corpus/knowledge/chromium-modifier-chords-round-57.md, corpus/lessons/round-57.md, corpus/knowledge/chromium-preventdefault-swallow-round-58.md
```

### Notes the L1 must act on for the used-by extension

1. **Both new paths must exist on disk before the registry edit lands**, or the fleet
   census emits `E11 used-by path missing on disk` for the extended rows
   (`scripts/sources-census.sh`, the `usedby` loop that checks `[ -e "$dir/$path" ]`).
   As of this draft, **neither** `corpus/knowledge/chromium-preventdefault-swallow-round-58.md`
   **nor** `corpus/lessons/round-58.md` exists in the lane (verified: no `round-58`
   path under `corpus/knowledge/`; `corpus/lessons/` has no `round-58.md`). The
   knowledge note is the L1's to land.
2. **The r58 lesson file.** Every knowledge note in the registry's used-by cells is
   paired with its round's lesson (`corpus/knowledge/X.md, corpus/lessons/round-N.md`
   — 14 of the 161 rows end in exactly that pair, and both S153 and S161 currently
   end in the r57 pair). The seat spec for this seat names only the knowledge note
   (`corpus/knowledge/chromium-preventdefault-swallow-round-58.md`), so that is what
   the drafts above carry. **Whether to also append `corpus/lessons/round-58.md` is
   the L1's call** — it is the established pairing, and the r58 lesson is being
   written this round anyway (`corpus/lessons/round-58.md ## Mistakes` is named in
   claims.json's `frontierStep.mistakeMining`). Flagging, not deciding.
3. **No new rows.** Both re-opens extend existing rows (S153, S161); they add no
   registry row. The r55 lesson records the same rule for the S083/S162 case: a
   duplicate-URL proposal was dropped and "the contract routed the ground to a
   re-open + used-by extension instead of a duplicate row". The expected census
   END row count therefore stays 161.

---

## 2. GATE TABLE ROW DRAFTS (lesson `## Gate` table)

Shape follows the established lesson table (4 columns: Source | Opened | Command |
Located quote (≤25 words, byte-exact)). Cells that depend on the L1's data pass are
`L1-at-data` placeholders — nothing is invented.

### Row 1 — S153

| Source | Opened | Command | Located quote (≤25 words, byte-exact) |
|---|---|---|---|
| S153 — Chrome DevTools Protocol browser_protocol.json — https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json — RE-OPENED (tenth open; `@master` UNMOVED: 1,423,170 B, sha256 `d6737c31…` == the round-57 re-open digest; `cmp` vs the committed r57 staged copy: no difference) | 2026-11-03 | `curl -sL --max-time 120 -o .ufo/waves/round-58/sources/browser_protocol.json https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json` → 1,423,170 B, sha256 `d6737c31f268ed74e65dde393006dd9c590a713febd2361d734722eb059f31e7` | "Bit field representing pressed modifier keys. Alt=1, Ctrl=2, Meta/Command=4, Shift=8" (`Input.dispatchKeyEvent` → `modifiers`, raw line 14323; 1 hit scoped to the command block, 5 file-wide, one per Input command — byte-exact incl. the `\n` escape, the r56 closure's quote-precision rule applied) |

### Row 2 — S161

| Source | Opened | Command | Located quote (≤25 words, byte-exact) |
|---|---|---|---|
| S161 — W3C UI Events — https://www.w3.org/TR/uievents/ — RE-OPENED (byte-identical to the registered anchor: 920,762 B, sha256 `8ded5eaf…` == the row's recorded digest; `cmp` vs the committed r57 staged copy: no difference) — the located ground for the r58 C2 capability acquisition is the **§4.3.4 default-action / cancelation** section, not the §3.5.1 modifier-attribute block the row carried until now | 2026-11-03 | `curl -sL --max-time 120 -o .ufo/waves/round-58/sources/uievents.html https://www.w3.org/TR/uievents/` → 920,762 B, sha256 `8ded5eaf4f190b13c59582d5e92b81d3585112dde963d71d65d8e5991212b918` | "`<p>Canceling the <a data-link-type="dfn" href="#default-action" id="ref-for-default-action⑤">default action</a> of a <a data-link-type="dfn" href="#keydown" id="ref-for-keydown⑤①"><code>keydown</code></a> event MUST NOT`" + "`\n\t\taffect its respective <a data-link-type="dfn" href="#keyup" id="ref-for-keyup④⑥"><code>keyup</code></a> event`" (one sentence, split at the line wrap into the two byte-exact fragments the page itself wraps at; §4.3.4 "Default actions and cancelable keyboard events", raw lines 5680–5681; 1 hit file-wide each; byte-exact incl. the inline `<a>`/`<code>` markup and the `⑤`/`①`/`④⑥` id glyphs — the r56 closure's quote-precision rule applied) |

### Row 3 — S161, the in-spec `cancelable` ground (recommended additional row)

The scout's §5 gaps 1–2 reported that the §3 list item it recorded as a secondary is
only a cross-reference pointer to the DOM Standard. The scout's final S161 receipt now
also carries `supporting_keydown_cancelable_definition` (raw lines 3745–3752, 5 hits
file-wide, 1 in the keydown-table scope 3732–3765) — **this seat verified that quote
byte-exact too** (`cmp` rc=0, 7 tag-stripped words, declared counts match). This seat
independently located and byte-verified the remaining in-spec grounds in the same staged
bytes (all ≤25 tag-stripped words, `cmp` rc=0). Draft row, same shape:

| Source | Opened | Command | Located quote (≤25 words, byte-exact) |
|---|---|---|---|
| S161 (same re-open, second located ground) — the `cancelable` and Enter-leg anchors | 2026-11-03 | same fetch as row 2 (920,762 B, sha256 `8ded5eaf…`) | "`<th>Cancelable`" + "`\n       <td>Yes`" as ONE two-line block "`<th>Cancelable\n       <td>Yes`" (§3.5.6.1 keydown event definition, raw lines 3751–3752; 6 hits of the two-line block file-wide, 1 in the keydown-table scope — one per event table that declares the property; the two halves alone are NOT unique (20 and 35 hits), so the block is the quotable unit) + "`<p>If this event is canceled, the associated event types MUST NOT be`" + "`\n\t\t\tdispatched, and the associated actions MUST NOT be performed.</p>`" (raw lines 3809–3810; 1 hit file-wide; 21 tag-stripped words) + "`<p>If the key is the <code class="keycap">Enter</code> or <code class="keycap"> </code> (Space) key and the`" + "`\ncurrent focus is on a state-changing element, the default action`" (raw lines 3803–3804; 1 hit file-wide; 21 tag-stripped words) |

### Cells that stay `L1-at-data` placeholders

| Gate cell | value | why |
|---|---|---|
| S153/S161 **used-by** column (the applied old→new edit) | `L1-at-data` | this seat drafts the text; the L1 applies it |
| S153/S161 **anchor** column (the r58 re-open digest appended in place) | `L1-at-data` | the L1's registry edit; the anchor text this seat can supply is quoted in §1 above |
| C2 evidence-tree count (`corpus/evidence/round58` file count at the data revision) | `L1-at-data` | the L1 runs the single live data pass after the freeze commit |
| r58 capability-row / lesson `## Gate` admit-reject prose | `L1-at-data` | the L1's gate |
| census start / end receipts | `L1-at-data` | the L1 runs them (see `census-note.txt`) |

---

## 3. WHAT THIS SEAT VERIFIED (receipts)

- `scribe/gate-quote-verification.json` — per-quote byte-exactness for every quote in
  the scout's two receipts (**9** quote records, including the scout's later-added
  `supporting_keydown_cancelable_definition`), plus a registered-anchor re-check,
  four supplementary anchors, the file-wide-count basis, and one wording nit.
  **9/9 quotes byte-exact; 0 failures; `clean: true`.**
  The audited receipts are the FINAL ones, verified by digest:
  `reopen-receipt-s153.json` sha256 `253154feabdb534d1c04fbe5dbf94285243f921d65db0b1f62cf13716128d12c`,
  `reopen-receipt-s161.json` sha256 `3f1d2f7b3ec0b8841892fa85e10f484bfd9252d668bb10656bcdf93e89c48948`
  (both match the digests the scout's own report states).
- `scribe/census-note.txt` — the frozen manual census grep (161) plus cross-checks.

No corpus file was edited by this seat.
