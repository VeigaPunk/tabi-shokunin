# Round 59 — LOG.md entry skeleton + corpus/README.md row (DRAFT for the L1)

Seat R59Scribe, round 59 wave w1, 2026-11-03. **DRAFT ONLY — this seat wrote nothing in
`corpus/`.** The L1 integrates.

---

## 1. `LOG.md` — round-59 entry skeleton

**Where it lands.** `LOG.md` is cumulative and append-only in practice: the round-58 entry is
the last block (`## Round 58 (2026-11-03, Linux host) — claims C1 adjacency (v18 meter, both
routed kills) + C2 coverage capability (preventDefault swallow on keydown)`), with a short
bulleted body (baseline → freeze → data → work commit; the two claims; the attack wave; the
findings routed; SOURCES; mistakes mined; assimilation; wave shape). The round-59 entry is
appended below it in the same shape.

**Cells the L1 fills are marked `L1-at-data`.** Nothing below is invented: every number the
L1 must supply is flagged, and every number this seat *did* measure is given with its
receipt.

```
## Round 59 (2026-11-03, Linux host) — claims C1 adjacency (v19 meter, the r58 routed
defects A4/A5 + N1/N2 + the NEW kagi/kake/kama browser-ground screen) + C2 coverage
capability (the CapsLock DELIVERY BOUNDARY — a measured negative on the latch)

- Baseline `4e7fb89d` -> claims freeze `L1-at-data` -> instrument freeze `L1-at-data` (code
  only: v19 meter, r59 rebind tool, C2 runner driver sha `L1-at-data`, C2 counter sha
  `L1-at-data`) -> C1 data `L1-at-data` -> C2 live receipt + counter green at the data
  revision -> work commit (this entry's block).
- C1 (adjacency, the lowest owned axis, 8): the round-open v18 meter measured RED at the
  baseline (exit 1, 4 findings: lane-screen-head-mismatch kasegi-shokunin, kengaku-shokunin,
  souji-shokunin, tsukuroi-shokunin; receipt
  `.ufo/waves/round-59/controls/c1-meter-v18-at-round-open.json`). The v19 generation
  absorbs the r58 closure's routed defects A4/A5 (the screened set is derived from the map,
  not from the delta-named lanes) + N1 (a findings-mismatch row in harness-guard) + N2
  (malformed-suffix selftest fixtures) and adds the NEW screened surface D8 demands: the
  kagi/kake/kama browser-ground screen. Ledgers re-bound at ONE fresh sibling-head snapshot
  (`.ufo/waves/round-59/adj/rebind-snapshot.json`). GREEN at `L1-at-data`: exit 0, predicate
  true, findingCount 0, counts {roster 20, mapRows 16, auditRows 16, deltaLanes 20,
  bgScreenSiblings 20}. Selftest `L1-at-data` cases, allPass true; kills
  `.ufo/waves/round-59/mutant-meter/M1-kill.json` .. `M5-kill.json` (each names the mutant
  sha, the failing case ids, verdict KILLED; a SURVIVED verdict is disclosed and routed,
  never smoothed). New-surface proof at the data revision:
  `grep -c 'kagi-shokunin' corpus/adjacency-host-delta-r59.tsv` >= 1, likewise
  'kake-shokunin' and 'kama-shokunin'. Adjacency score held at 8 unless the rubric
  authorizes otherwise.
- C2 (coverage, capability `chromium-keyevent-delivery-boundary-linux`, first-working 59) —
  the r57 planned residual EXECUTED AND CLOSED AS A MEASURED NEGATIVE ON THE LATCH: the live
  Chromium 155 receipt (nonce `L1-at-data`, driver sha `L1-at-data`, teardown 0 survivors,
  both ports closed) with `L1-at-data` per-step PNGs; the BOUNDARY measured from BOTH sides —
  the CapsLock events (key `CapsLock`, code `CapsLock`, windowsVirtualKeyCode 20, no text,
  keyDown+keyUp TWICE) DELIVER to the page with the full shape (key, code, keyCode 20,
  cancelable true, defaultPrevented false) on every recorded event, while the PAGE's own
  getModifierState('CapsLock') reads FALSE on EVERY recorded event — down, up, and every
  subsequent nonce letter; the frozen r59 counter green (exit 0, predicate true, findings [],
  couldNotEvaluate []); exactly one /echo AND exactly one /echo2 (the D4 positive control:
  the same Ctrl+Enter chord on the second, swallow-free form DOES submit); cross-refusals
  symmetric (the r59 counter on the committed r58 receipt and the r58 counter on the committed
  r59 receipt, both exit 1 schema-wrong-first). The negative is the finding: it separates
  "the event was never delivered" from "the event was delivered but the modifier state cannot
  be set over this channel" — CDP's Input.dispatchKeyEvent `modifiers` field is a four-bit
  field (Alt=1/Ctrl=2/Meta=4/Shift=8 per S153) with NO CapsLock bit, so the caps latch is
  not settable over CDP on this surface. Coverage score held at 9 — a capability-only claim;
  see the capability-vs-axis statement (D10) in the SCORECARD block.
  NOTE (the L1's pre-data restatement, disclosed in claims.json's preDataCorrection): the
  ORIGINAL frozen C2 asserted a latch sequence (false -> true -> held -> false) that is
  UNREACHABLE on this surface; the restatement replaced it with the measured-negative
  delivery-boundary claim before any data run. No post-data change.
- Attack wave (R59Reviewer, R59Critic, R59MutMeter, R59MutCounter, R59Sentinel, R59Probes,
  R59Connector): `L1-at-data` — the seat verdicts, with every survivor and every refusal
  reported verbatim, never smoothed.
- Findings routed (none smoothed): `L1-at-data` — the round's routed list, each with its
  receipt.
- SOURCES: registry 161 -> 162 (S162 is a NEW row opened this round — the GetEventModifiers
  bit-mapping ground, `content/browser/devtools/protocol/input_handler.cc`; S153 and S161
  re-opened this round, both byte-identical to their registered anchors: S161 920,762 B
  sha256 `8ded5eaf…`, S153 1,423,170 B sha256 `d6737c31…`, both fetch guards clean with
  `num_redirects 0` and final host == cited host); used-by extended in place old->new for
  S153 and S161 and set for the new S162 row (the lesson's Sources & frontier block, and
  `.ufo/waves/round-59/scribe/usedby-oldnew.txt` carries the exact cell strings). Knowledge
  notes 74 -> 75 (`chromium-capslock-boundary-round-59.md`). Census start AND end exit 0
  (22 pre-existing W04); `node scripts/check-sources.mjs` -> SOURCES_GATE verdict=clean
  rows=162 findings=0.
- Mistakes mined this round (lesson rows): `L1-at-data` — mined from this round's seats,
  instruments and the r58 closure's routed defects D3/D6/D8.
- Carry-in performed (r58 non-author closure, all ten routed defects): D1 (page-vs-block
  cross-check) and D2 (step-plan check) -> the C2 counter generation; D4 (the s4 positive
  control) -> the C2 runner generation; D5 (A4/A5) + N1 + N2 + D8 (the new screened surface)
  -> the C1 v19 generation; D3 and D6 -> corrections of record in the round-59 lesson
  (appended entries, never in-place edits — draft text in
  `.ufo/waves/round-59/scribe/corrections-of-record-draft.md`); D9 -> QUALITY.md criterion 111
  with the red-before receipt `.ufo/waves/round-59/probes/d9-red-before-defaultprevented.txt`
  (draft text in `.ufo/waves/round-59/scribe/quality-and-scorecard-drafts.md`); D10 -> the
  SCORECARD capability-vs-axis statement (same draft file); D7 -> seat evidence cited from
  the `.ufo/waves/round-59/w1/R59*.md` files, never from `w1-results.json`.
- Assimilation: none - `considerthese/` absent (checked 2026-11-03); adoption stays CLOSED by
  the L0 `tabi | round-57` (the register's one-row quote-column shift awaits campaign
  regeneration).
- Wave shape: ONE v1 wave w1 of 13 seats (`L1-at-data` — the role mix, the attack share, the
  settled count; the planner seat is the L1, which the validator rejects as a swarm role).
  Residual: `L1-at-data`.
```

### Notes for the L1

1. **Every `L1-at-data` cell is a real gap, not a stylistic marker.** This seat cannot know
   the freeze commit, the data revision, the driver's sha, the counter's sha, the nonce, the
   PNG count, the selftest case count, the kill verdicts, the seat verdicts or the census
   end — all of those are produced by the L1's data pass or by other seats' reports.
   **Do not let a `L1-at-data` marker be landed unfilled.**
2. **The C1 counts are the L1's corrected ones.** `claims.json` was corrected **pre-data**
   (disclosed in its `preDataCorrection` field, 2026-11-03): `bgScreenSiblings` 19 -> **20**
   and `deltaLanes` 16 -> **20** (`roster 20`, `mapRows 16`, `auditRows 16` unchanged). The
   skeleton above carries the **corrected** numbers. If the L1's meter's own re-derivation
   differs, the meter's numbers are authoritative and the L1 must say so in the entry — never
   a silent reconciliation.
3. **The D10 pointer is in the C2 bullet**, so the LOG and the SCORECARD cannot drift apart
   on whether the coverage score moved.
4. **Round-58 bytes are not edited** — the round-59 entry is appended below the round-58 block.

---

## 2. `corpus/README.md` — 'Round 59 coverage addition' table row draft

**Where it lands.** `corpus/README.md` is the corpus index. The pattern is established: a
`## Round NN coverage addition — <one-line subject> (YYYY-MM-DD, <host>)` heading, then a
three-column table `| Note | Holds | Sources |`, then a closing line about the registry and
the census. The round-58 addition is the last one
(`## Round 58 coverage addition — preventDefault swallow on keydown (2026-11-03, Linux host)`,
with the row for `knowledge/chromium-preventdefault-swallow-round-58.md` and the closing
line "Registry UNCHANGED 161 -> 161 (S153 and S161 used-by extended old->new, see the
round-58 lesson). Census start AND end exit 0 (22 pre-existing W04)."). The round-59
addition is appended below it.

**Draft heading:**

```
## Round 59 coverage addition — the CapsLock delivery boundary (2026-11-03, Linux host)
```

**Draft table row** (the `Holds` and `Sources` cells carry the same information density as
the round-58 row — the measured model, what is grounded in what, and the limits; the cells
marked `L1-at-data` are the L1's to fill from the live run):

```
| `knowledge/chromium-capslock-boundary-round-59.md` | The Linux host's Chromium 155 surface
carries the KEYS-EVENT DELIVERY-BOUNDARY measurement for CapsLock — the r57 planned residual
executed and honestly closed as a MEASURED NEGATIVE on the latch. The boundary is measured
from BOTH sides: a CapsLock keyDown+keyUp (key `CapsLock`, code `CapsLock`,
windowsVirtualKeyCode 20, no text, TWICE) DELIVERS to the page with the full shape (key,
code, keyCode 20, cancelable true, defaultPrevented false) on every recorded event, while
the page's own `getModifierState('CapsLock')` reads FALSE on EVERY recorded event — down,
up, and every subsequent nonce letter. The negative is the finding: it separates "the event
was never delivered" from "the event was delivered but the modifier state cannot be set over
this channel" — CDP's `Input.dispatchKeyEvent` `modifiers` field is a four-bit field
(Alt=1/Ctrl=2/Meta=4/Shift=8) with NO CapsLock bit, so the caps latch is not settable over
CDP on this surface. The disclosed CDP injection limit: the TEXT is driver-controlled, but
both the DELIVERED SHAPE and the MODIFIER STATE are page-visible (the page's own record and
its own `getModifierState` call, never a driver-side flag). The D4 positive control closes
the r58 s4 gap: the same Ctrl+Enter chord on a second, swallow-free form DOES submit (exactly
one /echo AND exactly one /echo2), so "no submit" on form 1 is separable from "this chord
never submits here". The r59 counter's D1/D2 checks close R58-S1/D2: the page keylog's
(key, cancelable, defaultPrevented) is cross-checked against the recorded block BY VALUE
(not positionally), and the receipt's recorded steps must equal the driver's declared step
plan exactly. Limits named: `L1-at-data`. | S161 (W3C UI Events — the `getModifierState(keyArg)`
DEFINITION SITE at raw 3327; §4.3.1 "Modifier keys" at raw 4791 for the state-activation
prose, which is PROSE in a normative section — there is NO `<dfn>` for the string "CapsLock";
§7.3.3 at raw 6370–6371 for the CapsLock virtual key code 20; per the D9 definition-site
sweep, `probes/d9-green-capslock.txt` records the per-term classifications and the note
cites S161 only for what S161 defines — S161 defines NO toggle state machine, the terms
"latch" and "toggle" are ABSENT from its specification text, and the `modifierCapsLock` dfn at
raw 3569 is a DIFFERENT term — the `EventModifierInit` initializer, not the latch), S153
(Chrome DevTools Protocol `browser_protocol.json` — `Input.dispatchKeyEvent`'s `key` (raw
14358) / `code` (raw 14352) / `windowsVirtualKeyCode` (raw 14364) / `text` (raw 14334)
parameter descriptions; the four-bit `modifiers` field at raw 14323), S162 (Chromium
source, `content/browser/devtools/protocol/input_handler.cc` — the `GetEventModifiers`
DEFINITION at raw 92, whose four branches map the CDP bit field onto exactly Alt/Ctrl/Meta/
Shift and have no CapsLock branch; the file contains ZERO CapsLock occurrences, so S162 is
NOT CapsLock ground; NEW row, opened this round).
```

**Draft closing line** (the same shape as the round-58 addition's closing line):

```
Registry 161 -> 162 (S162 NEW this round — the GetEventModifiers bit-mapping ground;
S153 and S161 re-opened byte-identical and their used-by extended old->new, see the
round-59 lesson). Census start AND end exit 0 (22 pre-existing W04).
```

### Notes for the L1

1. **The `Holds` cell must be filled from the live run, not from the claim text.** The
   paragraph above is written to describe the **frozen claim's** measured model, which is
   what the receipt will show if the claim verifies. If the live run differs, the row follows
   the live run — the README describes what was measured, not what was intended. The
   `L1-at-data` limits cell is where the note's own limits paragraph lands.
2. **The D9 constraint applies to this row too.** The `Sources` cell's S161 clause is worded
   to hold **either** way — it cites S161 for the `getModifierState` ground and points at the
   sweep receipt for the CapsLock-latch question. The independent reading (this seat, against
   the staged bytes) is that S161 states the latch model in **normative prose** (§4.3.1) and
   defines **no** toggle state machine — so the row says "PROSE in a normative section and
   NOT a `<dfn>`-marked term definition", and names S161's absence of the terms "latch" and
   "toggle". If `probes/d9-green-capslock.txt` classifies it differently, the row follows the
   probe. **Do not let the row imply S161 grounds a CapsLock latch SEMANTIC if the sweep
   says the definition site is absent.**
3. **The knowledge note's path must exist on disk before the registry edit lands.** The
   census's `usedby` loop checks that each used-by path exists on disk
   (`scripts/sources-census.sh`) and emits `E11 used-by path missing on disk` otherwise. The
   round-59 used-by extension names two new paths —
   `corpus/knowledge/chromium-capslock-boundary-round-59.md` and
   `corpus/lessons/round-59.md` — so **both must exist** before the L1 edits `SOURCES.md`.
4. **ONE NEW REGISTRY ROW: 161 -> 162.** S162 (the GetEventModifiers bit-mapping ground) is
   opened this round, so the row count moves to 162; S153 and S161 are re-opens that extend
   existing rows. The closing line says so. **Do not** write "Registry UNCHANGED 161 -> 161"
   — that was the pre-restatement expectation and it is now wrong.
5. **THE ROW DESCRIBES A MEASURED NEGATIVE.** The `Holds` cell's subject is the delivery
   BOUNDARY, not a working CapsLock modifier. The `Holds` cell must not imply the surface
   latches CapsLock.
