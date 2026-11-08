# Draft C — round-90 SCORECARD section wording (claim table + capability row)

**Status: DRAFT for L1 integration. Not written to the lane.** Read of the live SCORECARD at
11:39; the lane was mid-edit (D4 `85c4191706b3`).

The live round-90 section is already close to final. Below is the wording I would land, with the
reason for each deviation from what is live, plus a wording defect list.

## Claim table

### C1 row — `Before → after` column

Live:
> base: no r90 receipt → exit 2 `receipt-unreadable`; the r89 scored receipt under the r90
> counter → exit 1 with `schema` and `plan-calls` on all four domread legs; after: the scored
> receipt → exit 0 `clean`, 107 checks

My measurement of the live bytes:

- after: `node scripts/check-showpicker-round90.mjs --lane <ABS lane> --receipt
  corpus/evidence/round90/chromium-showpicker/receipt.json --expect-driver-sha256
  ac5a7a5e56537acc8f61058059294c5f343b236de9b52b8d691995f1e6c49c8d --expect-nonce
  tabi-r90-l1-e573334c78fa --expect-fixture-sha256
  5fb1f0f7806c8f099976078f3f03c9e08d6814346cc29fdccd022f4037bd7ac8 --prior-set
  .ufo/waves/round-90/controls/c1/prior-set.txt --json` → **exit 0, `clean`, 107 checks, 0
  findings.** Agrees with live.
- before (the r89 scored receipt under the r90 counter): exit 1 with **35** finding ids, not
  2. The two the live cell names (`schema`, `plan-calls`) are both present — `plan-calls` does
  carry all four domread legs (`sp89-accept-domread-{text,png,multimime,whitespace}:settle-order`,
  `:sequence`, `:answer-files`) — but the cell reads as if those were the findings. The other
  33 are the expected r89-vs-r90 identity findings (`nonce-shape`, `nonce-expected`,
  `driver-pin`, `fixture-hash`), the per-leg `leg-*` ids, the law ids
  (`webkitdirectory-answer-law`, `accept-answer-law`, `multiple-mode-law`,
  `accept-mime-answer-law`, `accept-grammar-law`, `accept-domread-law`,
  `second-chooser-answer-law`) and `prior-set-complete`. The live cell should say "exit 1 with
  35 findings including `schema` and `plan-calls` on all four domread legs" so a reader is not
  told the control produced two findings.
- base: I did not run the base worktree (no r90 receipt there). The live cell's "exit 2
  `receipt-unreadable`" is consistent with the counter's source: an unreadable receipt path is
  `fatal({verdict:'unreadable', findings:[{id:'receipt-unreadable'}]}, 2)`
  (`scripts/check-showpicker-round90.mjs:169`). Not independently re-measured by me.

Proposed C1 `Before → after`:
> base: no r90 receipt → exit 2 `receipt-unreadable`; the r89 scored receipt under the r90
> counter → exit 1 with 35 findings including `schema` and `plan-calls` (all four domread legs:
> `settle-order`, `sequence`, `answer-files`); after: the scored receipt → exit 0 `clean`, 107
> checks

### C2 row — `Before → after` column

Live:
> before (base `a9f1da08` worktree): **7 mismatches** (`scored/drift-before.json`); after:
> **0** of 8 (`scored/drift-a.json`)

My measurement of the live bytes: `scored/drift-before.json` = `claims 8, mismatches 7, failed
[r89-claim-sweep, r89-narrowing-pointers, r89-census-attribution, r89-leak-enforcement,
r89-revision-naming, gate-selftest, quality161-sweep]`; `scored/drift-a.json` = `claims 8,
mismatches 0, failed []`; and my own run of `node scripts/check-record-drift-round90.mjs --lane
<ABS lane> --json` → exit 0, 8 claims, 0 mismatches. Agrees with live; keep as is.

### C2 row — the C2 statement is itself narrower than its `type`

The live C2 row header reads "the six r89 spot-check routed defects". The lane's own
`plans/round-90.md` §Wave corrections records: "Five of the six §7 defects are counted; §7
defect 6 (report author date) is not lane-measurable and three self-checks stand in. The frozen
`type` sentence overstates the set; the SCORECARD row and the lesson carry the narrowed
statement." — but the live SCORECARD row header still says "the six r89 spot-check routed
defects". The row should name the narrowed set, e.g. "the six r89 spot-check routed defects
(five counted + three self-checks; §7 defect 6, the report author date, is not lane-measurable)".

### Claim-table heading — "sourced"

Live C1 row: "(sourced: S224/S223/S219 carried and re-opened)". The `corpus/SOURCES.md`
round-90 search-log entry (line 317) and the staged bytes under
`.ufo/waves/round-90/sources/` now support the re-opening claim (I verified both staged sha256s
against the values the entry names). Agrees.

## Capability row

Live:
> | `chromium-showpicker-linux` (generation r90) | As r89, and now: each of the four DOM-read
> legs' send log carries a distinct `Runtime.evaluate` of `window.__inputs(true)` immediately
> after the settle `window.__state()` evaluate, and the counter's `plan-calls` requires that call
> there, forbids it on every other leg, and compares it in the ordered plan sequence — so a
> receipt that carries the parsed token list without the call (or with the plain read) is
> refused | `corpus/evidence/round90/chromium-showpicker/receipt.json`;
> `corpus/knowledge/chromium-showpicker-runtime-round-90.md` | 79 |

Two wording defects, both of which I measured on the live bytes:

1. **"the counter's `plan-calls` requires that call there, forbids it on every other leg"** —
   the other-leg limb is enforced by `send-log-allowlist`, not `plan-calls`. Measured: a receipt
   carrying `window.__inputs(true)` on `sp84-accept-answer` is refused with
   `send-log-allowlist: sp84-accept-answer:expression`; `plan-calls` does not fire for the call
   (the `plan-calls` finding on my forged receipt was `dismiss-id`, an artifact of my own
   id-renumbering). The current counter's `evalAllowed` returns
   `p.kind === 'showpicker-domread'` for that expression, and
   `scripts/check-showpicker-round90.mjs:553` is where it lives. The lane already recorded this
   in `plans/round-90.md` §Wave corrections ("R90Review1 item 5 … the 'forbids it on every
   other leg' limb is enforced by `send-log-allowlist` (D3), not by `plan-calls`").
2. **"immediately after the settle `window.__state()` evaluate"** — the counter anchors on the
   FIRST `window.__state()` evaluate in the send log
   (`log.findIndex(c => c.params.expression === 'window.__state()')`) and requires the settle
   call at `anchor + 1`. It never correlates that index with the `window.__setLeg("settle")`
   mark. I built two receipts that pass clean (exit 0, 107 checks, 0 findings) on the live
   counter bytes:
   - `forgeF`: an EXTRA `window.__state()` inserted before the honest settle one, with
     `__inputs(true)` after the INSERTED one — the settle read is then NOT immediately after the
     settle-marked state read, yet the check is clean.
   - `forgeB`: the whole (`__state()`, `__inputs(true)`) pair moved to sit right after
     `DOM.setFileInputFiles`, i.e. BEFORE `window.__setLeg("settle")` — the settle read happens
     before the settle, and the check is clean.
   The honest receipt satisfies the stronger reading, so the capability is real on the measured
   bytes; but the row as worded asserts a binding the counter does not enforce.

Proposed capability row:
> | `chromium-showpicker-linux` (generation r90) | As r89, and now: each of the four DOM-read
> legs' send log carries a distinct `Runtime.evaluate` of `window.__inputs(true)` immediately
> after the settle `window.__state()` evaluate, and the counter requires that call there
> (`plan-calls`), refuses it on every other leg (`send-log-allowlist`), and compares it in the
> ordered plan sequence — so a receipt that carries the parsed token list without the call (or
> with the plain read) is refused. Measured bound: the call must sit one slot after the FIRST
> `window.__state()` evaluate in the send log; the counter does not tie that anchor to the
> `window.__setLeg("settle")` mark, so the settle POSITION is a shape, not a settle-mark
> correspondence | `corpus/evidence/round90/chromium-showpicker/receipt.json`;
> `corpus/knowledge/chromium-showpicker-runtime-round-90.md` | 79 |

## Narrowings paragraph

The live narrowings block lists five items and is accurate against my measurements except that
it should add the sixth, measured item:

> (6) the settle-call requirement binds the call's SHAPE and its slot after the first
> `window.__state()` evaluate, not its correspondence to the settle mark; a receipt whose settle
> read sits before `window.__setLeg("settle")`, or after an inserted extra `__state()`, is
> refused by nothing (`plan-calls` clean, 107 checks).

## Scored line

Live:
> Scored (r90): 107 checks, battery 226/226, kill power 76/76, selftest 11/11, record drift
> 7 → 0, leak witness dead-branch red. C1 verdict **NOT VERIFIED** (axis miss, reported); C2
> **VERIFIED**. — Digests: D4 85c4191706b3, nonce tabi-r90-l1-e573334c78fa. 107 checks, battery
> 226 cases, kill power 76 mutants.

My measurements: battery `scored/battery-a.json` = 226 cases / 0 failed / coverage 107/107
(agrees); kill power `scored/killpower-a.json` = 76 mutants / 76 killed / 0 survived / 0 crashed
/ 0 unapplied (agrees; my own independent kill-power run on the live bytes also returned 76/76
with 0 survived in 291 s); drift `scored/drift-a.json` = 8 / 0 and `scored/drift-before.json` =
8 / 7 (agrees). `scored/selftest.json` was 0 bytes when I read it at 11:39 (the lane was
writing it); I did not re-measure the selftest runner myself.

The live C1 verdict **NOT VERIFIED** (axis miss, reported) is the lane's own call, recorded in
`plans/round-90.md` §Wave corrections, and is consistent with the wave's rule that a receipt
whose driver change is a single argument the fixture discards moves a CHECKER obligation, not
the coverage surface. I do not dispute it; my finding is orthogonal (it is about what the
counter's `plan-calls` check binds, not about which axis moved).
