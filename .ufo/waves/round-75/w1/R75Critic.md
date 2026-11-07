FINDINGS

# R75Critic — attack on `.ufo/waves/round-75/claims.json` (C1, coverage)

Scope: read-only attack of the frozen claims at
`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-75/claims.json`
(sha256 `b6b4183e…8f57`, digest re-verified against `freeze.txt` — `sha256sum` OK, all 7 pins match).
No instrument was edited; no git/jj mutation; every forged object was built in
`/fast/scratch/hyaku/tabi-r75/R75Critic/` and scored with the pinned bytes
(`scripts/check-dragdrop-r75.mjs` `9b370790…9270`, `scripts/negatives-dragdrop-r75.mjs`
`9df82b2e…0721`, `controls/c1/kill-power-r75.mjs` `c227da00…b68f`,
`scripts/chrome-cdp-dragdrop-round75.mjs` `d604552e…8105` — re-hashed, match).
Node v24.21.0; no installs. Scratch deleted.

---

## (1) Can a do-nothing producer meet legs (a)–(c) as frozen?

**Yes. Measured end-to-end, with zero browser execution.**

Method: `forge.mjs` (beside this report) takes a committed PRE receipt, rewrites only the
identity fields the counter binds to the run — nonce (which also drives `nonceOnPage`,
`serverLog[*].run`, `Page.navigate` `?run=`, and the ready expression), `fixture.sha256`
(recomputed from the pinned driver's `DRAGDROP-FIXTURE` template beside the counter),
`host.launchToken`, `host.devtoolsListening.url`/`browserId` and the matching `stderrHead`
substring — and re-times the 17 events by `+0.3 × seq` ms (max 5.1 ms; all values stay on the
0.1 ms grid; leg marks untouched, so every event stays inside its leg window).

| leg | command (abbrev.; full text in `commands.md`) | result |
|---|---|---|
| (a) counter | `node scripts/check-dragdrop-r75.mjs --receipt forgery-receipt-ramp17.json --expect-driver-sha256 d604…8105 --expect-nonce tabi-r75-l1-57f28cf128e6 <16 PRE --prior>` | **exit 0**, `clean`, 146 checks, `timeline.maxAbs 0.0588`, `maxGap 0.125` (`counter-ramp.json`) |
| (c) battery | `node scripts/negatives-dragdrop-r75.mjs --real forgery-receipt-ramp17.json … --laundered ×3` | **exit 0**, `allOk true`, 254/254, `failed []`, `coverageGap []` (`battery-ramp17.json`) |
| (c) kill power | `node controls/c1/kill-power-r75.mjs --lane … --real forgery-receipt-ramp17.json …` | **exit 0**, `holds true`, force-true 146/146, semantic 40/40, `survivors []`, `crashed []` (`killpower-ramp17.json`) |

That construction is **inside** the declared limit on its face: it is exactly “a forger who
relabels a receipt (nonce with fixture hash, launch token, DevTools browser id, driver-pin
field, producer verdict) and re-times its events”, and it is the same shape as the pre-freeze
`limit-nonuniform-retime` control (`controls/c1/controls-c1.mjs:57`, exit 0 in
`controls-summary.json`). In fact it rewrites *fewer* fields than the limit lists: the
driver-pin field and the producer verdict are already correct on a PRE receipt, so they need
no rewrite.

Forgery classes, and whether each is inside the declared limit:

1. **Relabel + full re-time (above)** — inside. Passes (a), (b) would pass for the same reason
   with the (a) receipt as 17th prior, and (c) as measured.
2. **Relabel + minimal re-time (9 of 17 events, +0.1 ms on `at` only)** — inside the counter's
   blind spot but **outside** the limit's recipe (it moves only 9 of 34 timestamp fields).
   Counter **exit 0 clean** (`counter-9b.json`), but the battery **exit 1, allOk false**: the
   receipt sits at the refusal boundary, so the battery's own one-field mutations
   (`event-types-ts-string`, `source-lifecycle-no-end`) push the pair-match fraction to 0.5 and
   draw an extra `replay-event-timeline` finding (`battery-min9.json`, `failed` =
   those two cases). Leg (c) therefore fails for it.
3. **A receipt fabricated from nothing** — inside the limit (third clause). Not built: the
   relabel in (1) is strictly cheaper.
4. **Modified driver, pin field rewritten / native mouse with the send log rewritten** — both
   reduce to (3): every check the counter runs is a function of receipt bytes; `driverSha256`
   is compared to the *frozen* digest, and `fixture.sha256` is recomputed from the pinned
   driver source, so a modified producer only has to write those two fields.
   **Inside.**

So legs (a)–(c) are reachable by a producer that never launches Chromium. That is not a hidden
defect: the limit says the counter is not an execution oracle, and the `limit-nonuniform-retime`
control is a declared witness. What *is* undeclared is F3 below.

---

## (2) Is the limit sentence complete and honest about what the counter reads?

The replay test is `check-dragdrop-r75.mjs:179-190`: refusal iff
`matchedPairs/na >= 0.5 || matchedGaps/|gaps| >= 0.75`, where pairs are matched on **both**
`ts` and `at` within `< 0.05` ms (`:184`), gaps are the ≥50 ms differences of `at` in the
*candidate* (`:186`), and `na`/`|gaps|` are the candidate's own counts. With the frozen shape
the counter pins 17 events and ≥6 gaps (`:191`), and every committed receipt has 8.

**Counts — exact.** Measured on the committed smoke1 (17 events, 8 gaps):

- 8 moved events → `maxAbs 0.5294` → **refused**, sole finding `replay-event-timeline`
  (`counter-8moves.json`, exit 1).
- 9 moved events → `maxAbs 0.4706` → **not refused** (`counter-9b.json`, exit 0).
- 9 moved events with the gap multiset preserved (both endpoints of every gap moved) →
  `maxAbs 0.4706` but `maxGap 1.0` → **refused** (`counter-9nogap3.json`, exit 1).

So “more than half” = 9 of 17 and “more than a quarter” = 3 of 8 are the exact integer
boundaries, and both clauses are separately necessary — the conjunction in the sentence is
right. [INFERENCE] The event bound is structural, not luck: an unmatched candidate is either a
moved event that found no prior, or an unmoved event whose own prior was consumed by an earlier
*moved* candidate, so `unmatched ≤ moved` and `matched ≥ 17 − k`; escape needs
`17 − k < 8.5`. 8 events cannot escape.

**Two inexactnesses in the sentence** (the source of F1/F2):

- “move by **>= 0.05 ms**” is not the operative threshold. `event-time-quantum`
  (`:196`) pins every `ts`/`at` to a 0.1 ms grid (`|v*10−round(v*10)| ≤ 1e-4`), so a
  0.05–0.0999 ms move cannot be written at all; the real boundary is **≥ 0.1 ms**. My accepted
  forgery moves 0.1 ms. The stated 0.05 is conservative, not wrong, but it is not the boundary
  the counter draws.
- “more than half of the **event times**” is exact only if “event time” means an *event*. A
  pair is matched only if **both** `ts` and `at` are within 0.05 ms, so moving a single field
  breaks the match. My counter-clean forgery moves only the `at` field of 9 events — **9 of 34
  numeric time fields (26.5 %)**. Read as “time fields”, the sentence is false: fewer than half
  escaped.

Also confirmed, so not defects: a whole-timeline shift does not escape (gap multiset is
shift-invariant; 100 ms shift → `maxAbs 0`, `maxGap 1.0`, refused — `shift100.json`), and the
`0.3 ms per event` ramp does both (clean, above). The honest-pair measurement is exact as
claimed: 13 receipts, 156 ordered pairs, `maxAbs 0`, `maxGap 0.25` (histogram 120/32/4 = 0/1/2
of 8), `honestPairsRefused 0`, `ownGapCounts` all 8, `firstChosenGapThreshold 0.5` with
`refusedAtFirstChosenGapThreshold 0`
(`lesson-proof/timeline-honest-pairs.json`).

---

## (3) Is C1 named by the surface it moves, and is `sourced` true?

**Coverage naming — true at base `c19a520fdfa574a5c082b09130b7dbfcdd1e99eb`.**

- `git grep -c '^| `chromium-drag-intercept-linux` |' c19a520f -- SCORECARD.md` → no output,
  **exit 1** (0 matches).
- `git grep -inE '^\|.*(drag|dispatchDragEvent|setInterceptDrags)' c19a520f -- SCORECARD.md`
  → empty, **exit 1**: no row covers the family.
- `git grep -rilE '\bdrag' c19a520f -- corpus/knowledge | wc -l` → **0**: no knowledge note.
- `git grep -l '"schema": "tabi-chrome-cdp-dragdrop' c19a520f | wc -l` → **0**: no earlier
  generation of this capability.
- The only “drag” at base is prose in the round-63 *planned* list (“pointer capture /
  drag-over-loopback”, SCORECARD.md:3506 at base) — a plan, not a row, and it names a different
  surface. The row name `chromium-drag-intercept-linux` moves exactly the commands the receipt
  exercises (`Input.setInterceptDrags`, `Input.dispatchDragEvent`, the `Input.dragIntercepted`
  event).

**`sourced` — true, line by line against the staged S196–S200**
(`.ufo/waves/round-75/sources/`, FETCH.txt timestamps 01:36:31–01:36:38, digests match
`corpus/SOURCES.md:210-214`):

- `Input.pdl:265-268` `setInterceptDrags` (“Prevents default drag and drop behavior and instead
  emits `Input.dragIntercepted` events”) ✓; `:332-336` the event ✓; `:69-75` `DragData` with the
  mask comment “Copy = 1, Link = 2, Move = 16” at **:74** ✓; `:78-94` `dispatchDragEvent` with
  `type ∈ {dragEnter, dragOver, drop, dragCancel}` and **no `dragLeave`** ✓.
- `input_handler.cc:1578-1624` `StartDragging` ✓, `.SetDragOperationsMask(drag_operations_mask)`
  at **:1616** ✓; `:1626-1627` `SetInterceptDrags` ✓; `:1437`/`:1467-1551`
  `DispatchDragEvent`: `drop` → `DragTargetDragOver` :1508, `DragTargetDrop` :1524,
  `DragSourceSystemDragEnded` :1526, `DragSourceEndedAt` :1527; `dragCancel` → only
  `DragSourceSystemDragEnded` + `DragSourceEndedAt(kNone)` :1538-1546; “Unexpected event
  type” :1548-1550 ✓ (matches the counter's `ERR_BAD`, `check-dragdrop-r75.mjs:59`).
- `web_frame_widget_impl.cc:709-751` `DragTargetDrop`: no `current_drag_data_` → return :718;
  `kNone` → `DragTargetDragLeave` :737 ✓; `:783-792` `DragSourceSystemDragEnded` → `CancelDrag`
  ✓; `:1472-1475` `CancelDrag` clears `current_drag_data_` ✓; `:1500-1515`
  `DragTargetDragEnterOrOver` early return ✓.
- `drag_controller.cc:254-272` `DragExited` `kTypesReadable` :259 then `kNumb` :265 ✓;
  `:274-300` `PerformDrop` `kReadable` :292 ✓; `:845-880` `TryDHTMLDrag` `kTypesReadable` :853 ✓.
- `data_transfer.cc:352-354` `getData` returns empty unless `CanReadData()` ✓; `:606-615`
  `CanReadTypes`/`CanReadData` (readable or writable only) ✓.

Precision note (not a falsification): the counter's `trust-law`, `coordinate-law`,
`no-native-session` and `source-lifecycle` are measurement claims; the note puts their evidence
in its **Measured** table, and its Limits section admits only the `drag@src` ordering as
measured-not-sourced. The `sourced` field does not claim those four, so the field is true as
written.

---

## (4) Is the `priorSet` sentence true at the freeze parent?

**True, verified against the repository at `d71951a78f5fa1a6672359c815e85a7f297bc8db`.**

- `git grep -l '"schema": "tabi-chrome-cdp-dragdrop-r75"' d71951a7 -- '*.json'` → **25 files**
  (`raw25.txt`, 25 lines).
- Of those, top-level `.schema` is `tabi-chrome-cdp-dragdrop-r75` in **16** and
  `tabi-check-dragdrop-r75` in **9** (the `pf-smoke1..9.counter.json` outputs, carrying the
  string only inside `priorSet`) — parsed per file at that commit (`top16.txt`).
- `diff top16.txt <(grep -v '^#' controls/c1/prior-set.txt | sort)` → **empty**
  (`prior16.txt`); exactly the 3 degenerates + 4 probes + 9 smokes, in the frozen order.
- `prior-set.txt` itself hashes to the freeze digest `4d85dfb2…0db7` ✓.

Chain: `git log -1 --format='%H %P' b1ddabc5` → parent `d71951a7` ✓ (`claims.json` is that
commit); `57f28cf`’s parent is `b1ddabc5` ✓; `git grep -l 'tabi-r75-l1-57f28cf128e6'
57f28cf…` → **exit 1**, 0 files ✓ (nonce absent at D); `freeze.txt` recorded 02:47:42, receipt
written 02:48 ✓.

Independently re-scored the committed leg-(a) receipt
(`corpus/evidence/round75/chromium-drag-intercept/receipt.json`, sha256
`6ecc2560…1761`): **exit 0, clean, 146 checks, 0 findings, maxAbs 0, maxGap 0.25, priorSet 16**
(`counter-committed-a-by-critic.json`) — matches `scored/c1-counter-a.json` and the honest-run
profile (honest maxAbs is 0 for all 156 honest pairs). Leg (c) outputs as claimed: battery
`allOk true` 254/254, kill power `holds true` 146/146 + 40/40, `scored/c1-*.exit` all `0`.

---

## Findings (what the claim should change; nothing here blocks C1)

- **F1 — limit, move quantum.** “>= 0.05 ms” is not the boundary: `event-time-quantum`
  (`check-dragdrop-r75.mjs:196`) forces a 0.1 ms grid, so the smallest escaping move is
  **0.1 ms**; 0.05–0.0999 ms is unwritable. Evidence: `counter-9b.json` (0.1 ms moves, exit 0).
- **F2 — limit, unit of “event times”.** “More than half of the event times” is exact per
  event (9/17) but not per timestamp: matching needs both `ts` and `at` within 0.05 ms
  (`:184`), so 9 moved `at` values = **9 of 34** time fields suffice. Evidence:
  `forgery-receipt-min9.json`, `counter-9b.json` (exit 0).
- **F3 — limit, scope.** The sentence scopes only the counter. In fact the battery and kill
  power are receipt-only too: kill power **holds:true** on the relabelled receipt
  (`killpower-ramp17.json`). Legs (a)–(c) therefore carry no execution assurance at all; only
  the driver run itself (and leg (b)’s cold run) is outside the forgery surface, and neither is
  attested by any instrument. This should be stated next to the limit.
- **F4 — boundary confirmation (not a defect).** The two clauses are separately necessary:
  9 moved events with every gap preserved is refused (`maxAbs 0.4706`, `maxGap 1.0`,
  `counter-9nogap3.json`, exit 1). The sentence’s “and” is load-bearing and correct.

## Impacted axes

- **coverage** (C1’s axis): **not harmed** — the capability is new at base, the surface is
  named by it, and the sources support the note and the counter’s laws. C1 can verify.
- **calibration**: the limit sentence is where the defect sits — it under-describes the
  forger’s cheapest escape (F1/F2) and over-describes its cost if read as timestamp fields;
  and it leaves the battery/kill power outside the stated scope (F3).

## Smallest safe correction

Replace the limit clause with the measured boundary, without touching the predicate,
counter, pins, priors, thresholds or kill rule:

> The counter reads a receipt; it is not an execution oracle. With the frozen shape (17 events,
> 8 gaps ≥ 50 ms) not refused: a forger who relabels a receipt (nonce and everything the nonce
> drives, fixture hash, launch token, DevTools browser id) and re-times its events on the
> 0.1 ms grid so that at least 9 of the 17 events no longer pair with a prior event
> (both `ts` and `at` within 0.05 ms are required, so moving either field counts) and at least
> 3 of the 8 ≥ 50 ms gaps no longer match; 8 moved events are refused (abs 0.529) and 9 moved
> events with all gaps preserved are refused (gap 1.0). Neither the battery nor kill power is
> an execution oracle either: kill power holds on such a relabelled receipt. Also not refused:
> a receipt fabricated from nothing that satisfies every check; and the relabel of any receipt
> outside PRE (PRE is the schema enumeration at the freeze parent).

No other change is proposed; the instruments, predicate and controls are not attacked.

## Receipts (beside this report)

`counter-ramp.json`, `battery-ramp17.json`, `killpower-ramp17.json`,
`forgery-receipt-ramp17.json` (the (a)→(c) forgery); `counter-9b.json`, `battery-min9.json`,
`forgery-receipt-min9.json` (the boundary forgery that passes (a) and fails (c));
`counter-9nogap3.json`, `forgery-receipt-9moves-0gaps.json` (the gap-clause witness);
`counter-committed-a-by-critic.json` (independent score of the committed (a) receipt);
`raw25.txt`, `top16.txt`, `prior16.txt` (prior-set enumeration); `forge.mjs`, `score.mjs`;
`commands.md` (every command with its exit code).
