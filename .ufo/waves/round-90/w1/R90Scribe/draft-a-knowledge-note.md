# Draft A — round-90 knowledge-note body (settle-call binding)

**Status: DRAFT for L1 integration. Not written to the lane. Independent of the live
`corpus/knowledge/chromium-showpicker-runtime-round-90.md`, which I read at 11:39 while the lane
was mid-re-freeze (D4).**

Measured basis (all re-run by me on the live bytes, not copied from the lane's records):
receipt `corpus/evidence/round90/chromium-showpicker/receipt.json` (schema
`tabi-chrome-cdp-showpicker-r90`, nonce `tabi-r90-l1-e573334c78fa`, driver sha256
`ac5a7a5e5653…`, fixture sha256 `5fb1f0f7806c…`, 41 legs, `failures: []`);
counter exit 0 / `clean` / 107 checks; battery 226 cases / 0 failed / coverage 107/107;
kill power 76 mutants / 76 killed / 0 survived / 0 crashed / 0 unapplied;
drift 8 statements / 0 mismatches; before-control 8 / 7 mismatches.

---

## Body

### The measured law

**A DOM read a claim binds is bound by the CALL that produced it.** Each of the four domread
legs re-reads the page at settle with a distinct expression, `window.__inputs(true)`,
immediately after the settle `window.__state()` evaluate. The counter's `plan-calls` check
requires exactly one such call on a domread leg, in that position, and the `send-log-allowlist`
check refuses the expression on every other leg. A leg that carries the `domRead` data without
the call is refused with `plan-calls`.

The four legs and their bound token lists are unchanged from r89: `accept="image/*"` ←
`text/plain`; `accept="image/png, .txt"` ← `image/png`; `accept="image/png,application/pdf"` ←
`text/plain`; `accept="  image/png ,  .txt  "` ← `image/png`.

### What a receipt of this shape cannot prove

- **The distinct expression is a lane convention.** It binds the CALL the fixture made; it does
  not prove the browser parsed `accept`, and the parser normalization stays the fixture's
  (comma-split, ASCII-trimmed, ASCII-lowercased).
- **Acceptance is not filtering.** `DOM.setFileInputFiles` answers a chooser programmatically;
  what a user's dialog offers is unmeasured.
- **The colour arm is bounded to the file-chooser metric.** Zero `Page.fileChooserOpened` events
  do not show whether a colour popup appeared.
- **The counter reads a receipt.** A forger who shifts every page event by a constant offset
  escapes the replay rule; the limit sentence prints the computed `absNeed` values.
- **Secure-context state is not recorded** (`http://127.0.0.1:<port>` is potentially trustworthy).
- **The delivered bytes still carry the r83 marker** under the r90 file names
  (`tabi-r90-a.txt`, `tabi-r90-b.png`; the body is `tabi-r83-answer-alpha\n` / `tabi-r83-png\n`);
  the counter binds names, sizes, types, hex and hashes, never the content marker.

### Limits the wave established (r90)

- **`plan-calls` binds shape, not semantics.** A call with the same expression and a different
  `returnByValue` value would be refused (params are compared) — measured: exit 1 with
  `plan-calls` on `sp89-accept-domread-text:sequence`. But a receipt that carries both a forged
  `domRead` and a forged call passes; the call is one more thing a forger must forge.
- **The settle-call requirement covers the four domread legs only.** The 37 carried legs keep the
  r89 plan; their data bindings are unchanged.
- **The `domRead` data binding is unchanged**, so the r89 narrowings (fixture tokenization,
  per-leg mirrors unenforced, driver-observed settle) still apply to the data side.
- **The call's POSITION is anchored to the FIRST `window.__state()` evaluate in the send log,
  not to the settle-marked one.** The counter locates the anchor with
  `log.findIndex(c => c.params.expression === 'window.__state()')` and requires the settle call to
  sit at `anchor + 1`. It never correlates that index with the `window.__setLeg("settle")` mark or
  with the leg's `marks` array. (Sibling seats reached this family first: R90Review2 F7 — "the
  state anchor is expression-only" — and R90Review1 §5's calibration note, "`stateIx` is the
  **first** `window.__state()` in the leg… a driver reorder that inserted an earlier probe
  `__state()` would false-refuse". My two receipts below are INDEPENDENT CONFIRMATIONS of that
  family on the final D3/D4 bytes, with two constructions the siblings did not build.) Two
  receipts I built and measured pass clean (exit 0, 107 checks, no findings) on the live D3
  counter bytes:
  - **`forgeF`** — insert an EXTRA `window.__state()` evaluate before the honest settle one and
    put `__inputs(true)` immediately after the INSERTED one: the settle read is no longer
    immediately after the settle-marked state read, yet `settleIx === stateIx + 1` still holds
    because `findIndex` returns the inserted call. Clean.
  - **`forgeB`** — move the whole (`window.__state()`, `window.__inputs(true)`) pair to sit
    immediately after `DOM.setFileInputFiles`, i.e. BEFORE the `window.__setLeg("settle")` mark:
    the settle read then happens before the settle, and the check is clean. (The `want`/`got`
    ordered-plan comparison still holds because it filters the send log to
    `DOM.setFileInputFiles`/`Runtime.evaluate`-of-target/`__inputs(true)` and ignores the
    `__setLeg`/`__state()` calls.)
  What the counter really binds is "one `__inputs(true)` call, one slot after the first
  `__state()` evaluate" — a shape, not a settle-position. Nothing in the battery or the kill
  power list covers this family: the battery's `plan-calls-settle-order` case SWAPS the two
  calls (which does trip the check), and the kill-power mutants `settle-order-any` /
  `settle-want-dropped` / `settle-want-always` / `settle-allow-any` mutate the check's own
  source, not a receipt.
- **The "forbids it on every other leg" limb is enforced by `send-log-allowlist`, not by
  `plan-calls`** — the current counter's `evalAllowed` returns
  `p.kind === 'showpicker-domread'` for the expression. Measured: a receipt with the call on
  `sp84-accept-answer` is refused with `send-log-allowlist: sp84-accept-answer:expression`,
  NOT with `plan-calls` (the `plan-calls` finding on that receipt is a `dismiss-id` artifact of
  my own id-renumbering, not the call). This attribution divergence was found first by
  R90Review1 (item 5 and its m2/m14 mutation matrix: on the D3 bytes both are "refused by
  `send-log-allowlist` only; `plan-calls` passes") and is already recorded in the lane's
  `plans/round-90.md` §Wave corrections. My measurement independently confirms it on the final
  D3/D4 bytes; what remains open is that the knowledge note and the SCORECARD capability row
  still carry the old attribution.

### Frontier (named, not held)

- A same-element origin comparison (an input reachable from both origins via a `postMessage`
  proxy) — not constructible in the current loopback fixture.
- What a `type=color` same-origin call does to the colour popup itself (not a CDP file-chooser
  event) — needs a UI-side probe or a source-side reading of the colour chooser path.

---

## Divergences vs. the live `corpus/knowledge/chromium-showpicker-runtime-round-90.md` (read 11:39)

| # | live note says | my measurement | severity |
|---|---|---|---|
| D1 | "`plan-calls` … (2) forbids that expression in every other leg's send log" — attributes BOTH limbs to `plan-calls` | the other-leg limb fires as `send-log-allowlist`; `plan-calls` never fires for it | wording (lane already recorded it in `plans/round-90.md` §Wave corrections; the note still carries the old attribution) |
| D2 | limits section does not mention the settle-position anchoring at all | the anchor is the FIRST `__state()` evaluate; `forgeF` and `forgeB` both score clean | **material — the note's "measured law" says "immediately after the settle `window.__state()` evaluate", which the counter does not enforce** |
| D3 | "The delivered bytes still carry the r83 marker under the r89 file names" | the r90 receipt's delivered names are `tabi-r90-a.txt` / `tabi-r90-b.png` / `tabi-r90-second.txt` / `tabi-r90-dir` — r90 names, not r89 names. The MARKER content is still r83 (`tabi-r83-answer-alpha\n`). | factual slip (stale carry-over from the r89 note, which correctly said "under the r89 file names") |
| D4 | front-matter `recheck:` line uses `<pin>` / `<scored nonce>` / `<receipt fixture sha256>` placeholders | the r89 note spelled out the three real digests; the r90 note does not. The pins ARE known: driver `ac5a7a5e5653…`, nonce `tabi-r90-l1-e573334c78fa`, fixture `5fb1f0f7806c…` | reproducibility (the r89 note's convention was better) |
| D5 | "the same fixture and the same laws as r89" | true for the fixture TEMPLATE, but the r90 fixture sha256 (`5fb1f0f7806c…`) differs from r89's (`69acad5754e0…`) because the delivered file names and the nonce differ; "the same fixture" reads as byte-identity | minor wording |
| D6 | "one fresh browser per leg" | true: 41 distinct `--user-data-dir` values across 41 legs | agrees |
| D7 | "the counter's `plan-calls` requires that call on domread legs (exactly one, in that position)" | "exactly one" and "in that position" ARE enforced on the honest receipt, but "that position" means "one slot after the first `__state()`", not "after the settle-marked state read" | see D2 |
| D8 | the note does not say WHICH check enforces each limb | `plan-calls` (domread legs), `send-log-allowlist` (other legs) | see D1 |
| D9 | frontier section | agrees with `plans/round-90.md` §Frontier carried and with the r89 note | agrees |
| D10 | `verified-at:` line: "Chromium 155.0.8059.84 `--headless=new`" | receipt `host.chromium` = "Chromium 155.0.8059.84 Arch Linux", `cdpProduct` = "Chrome/155.0.8059.84"; leg argv carries `--headless=new` | agrees |
| D11 | "Forty-one legs" | 41 legs, `failures: []` | agrees |
