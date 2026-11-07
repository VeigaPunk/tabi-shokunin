CONFIRMED

# R73Scribe — independent re-derivation of the r73 knowledge note and lesson Gate

Seat `R73Scribe`, tabi round 73, wave w1, leaf member (no dispatch). Lane
`/home/vgpnk/Projects/shokunin/tabi-shokunin`, base `d7ff9f190260d91a1e675f474b7abf79960cdfd4`,
digests commit D `3409ab53b905d12d0866c6c93373e1c9887eda10`. Nothing outside
`.ufo/waves/round-73/w1/R73Scribe/` and the seat-named trailer `.ufo/waves/round-73/w1/R73Scribe.md`
was written; no git/jj mutation, no browser run, no product code touched, no tool installed.

## Behaviour

Re-derived, from committed bytes only, every number and every quoted line in
`corpus/knowledge/chromium-synth-pinch-gesture-runtime-round-73.md`, then drafted the lesson Gate for
S180–S183. Verdict: the note **holds** — all four table rows reproduce at the precision the note
prints, the deviation figure reproduces exactly, the anchor counts reproduce exactly, and all four
quotes are byte-verbatim against files whose sha256 match `FETCH.txt`. Five findings below are
wording/precision issues and one record-keeping gap; none falsifies a note claim.

## Commands and exits

| command | exit | result |
|---|---|---|
| `python3 .ufo/waves/round-73/w1/R73Scribe/rederive.py --json rederive.json` | 0 | 40 leg sums (9 smokes + the (a) receipt) + summary + citation check → `rederive.out.txt` |
| `sha256sum .ufo/waves/round-73/sources/*.cc` | 0 | `c00b3bf7…`, `5f43b8a5…`, `31a6868e…`, `146aa4c1…` = `FETCH.txt` lines 3-6 |
| `node scripts/check-synthpinch-r73.mjs --list-checks` | 0 | 98 check ids |
| `python3 -c "len(json.load(scored/c1-counter-a.json)['checks'])"` | 0 | 98, `checkCount` 98, `verdict` `clean`, `findings` `[]` |
| `node -e '<spot-check one-liner>'` (gate-draft.md) | 0 | prints the four leg sums, targets and scales |
| `find .ufo/waves/round-73 -name '*.b64' \| wc -l` | 0 | `0` (F5) |
| `git log --oneline -1 -- corpus/knowledge/…round-73.md` | 0 | `ae2628af` (note tracked) |

## Re-derived numbers (population: 9 PRE smokes + the (a) receipt)

| leg | factor | wheels | Σ deltaY × scale (9 smokes) | note | raw Σ (9 smokes) | note |
|---|---|---|---|---|---|---|
| in | 2 | 16–17 | −69.3147614 … −69.3146760 (all print −69.3147) | −69.3147 | −49.960071 … −48.888261 | −49.960 … −48.888 |
| out | 0.5 | 16–17 | 69.3147071 … 69.3147260 | +69.3147 | 50.738701 … 51.375694 | +50.739 … +51.376 |
| clamp | 0.5 | 16–17 | 69.3147122 … 69.3147379 | +69.3147 | 69.314712 … 69.314738 | +69.315 |
| default | 1.5 | 8–9 | −40.5465219 … −40.5464789 | −40.5465 | −32.814266 … −32.568925 | −32.814 … −32.569 |

- Largest deviation from `−100 ln(scaleFactor)` over the **36** smoke leg sums: **4.207024e-05**
  (`smoke7/in`) — the note says 4.2×10⁻⁵. Including the (a) receipt, 4.332306e-05 (`A/in`); the note
  predates (a), so its population statement stands.
- First `in` wheel clientX: 400 ×6, 399 ×3. First `default`: 400 ×7, 399 ×2. Both exact. Across all
  wheels of the nine smokes, `in` is 399/400 = 57/94 and `default` 40/38; **401 never occurs** in
  r73, so the absolute battery anchors 402/398 sit outside the ±1 band on every run.
- (a) receipt `in` leg: raw −48.917832, weighted −69.3147614, target −69.3147181;
  `clamp` 1→1 with weighted 69.3147146.

## Gates

- **Every note claim either reproduces or is labelled.** 21 statements checked: 15 agree outright,
  6 agree with a wording or precision correction (rows 6, 10, 11, 14, 17, 21 → F1–F4). No
  statement is contradicted by the data. (The note is not claim-for-claim falsifiable in one
  respect: its reading-order sentence is not checkable from bytes — recorded in note-review §6.)
- **Quote/gate integrity.** All four staged sources hash to the `FETCH.txt` digests; all four
  quoted fragments match the exact source line (`rederive.json:.citations[*].stripped_equal` true);
  line counts 143/187/318/5,822 match `wc -l`. Gate draft carries URL, access date (2026-11-06),
  line-located quotes of ≤8 words each, plus one admit and one reject with runnable spot-checks.
- **Not re-run (deliberately).** No Chromium launch, no driver, no counter/battery execution. The
  seat's job is re-derivation from receipts; re-running would measure host stability, not the
  note's claims, and is the L1's/scored legs' business.

## Findings

- **F1 (substantive, wording).** The identity `Σ deltaY × scale = −100 ln(scaleFactor)` holds
  against the **commanded** `scaleFactor`, not against the achieved page-scale change. Witness: the
  clamp leg is `1 → 1` on all ten receipts yet sums to +69.3147 (= −100 ln 0.5); measured against
  the achieved ratio the deviation is the full 69.3147. The note is not wrong (its table labels the
  clamp factor "0.5 at scale 1") but two prose sentences read as if the sum tracked realised zoom.
  This matters because `wheel-delta-law` (`check-synthpinch-r73.mjs:246`) uses the frozen
  `scaleFactor` while `leg-*-scale`/`scale-agreement` (`:224,:233,:234`) are what check zoom.
- **F2 (citation precision).** `S182 web_input_event_conversion.cc:127-134` — function spans
  **128-135**; `FrameScale (lines 56-65)` — function spans **57-65** (line 56 is `namespace {`). The
  same off-by-one is copied into `corpus/SOURCES.md:196`. Quoted lines (`:62`, `:132`) are correct,
  so both pointers resolve.
- **F3 (data presentation).** "the scale-weighted sums do not [vary]" — measured spread is up to
  8.54e-5 absolute (1.2e-6 relative, `in`) against raw spreads up to 1.072. True at the note's
  printed precision; "do not" is stronger than the data.
- **F4 (epistemic label).** Body: "Still inference: that `InputEventsScaleForEmulation()` is 1";
  Limits: "the emulation factor is measured as 1". The measurement excludes a *constant* unmodelled
  divisor beyond ≈1e-7 relative (per-leg means +4.6e-9 … −2.1e-7, every leg sign-splitting, s.e.
  2.7e-8…1.1e-7), and the driver's `Emulation.setDeviceMetricsOverride` (`:296`) has no `scale`
  parameter — but the ChromeClient implementation was not read, so "inference, bounded near 1 by
  the measurement" is the defensible phrasing.
- **F5 (record-keeping, not a note claim).** QUALITY 67 wants `bytes_path`, `decoded_sha256` **and**
  the transfer's `encoded_sha256`. Decoded half is satisfied; encoded half is not — no `.b64` was
  kept under round 73 (`find` → 0; round 72 kept one) and `encoded_sha256` appears in neither
  `FETCH.txt` nor `SOURCES.md`. Advisory to the integration owner; I did not edit the rows.

Additional discriminating evidence produced for F1 (a receipt that the note does not contain):
over the (a) receipt's `in` leg, only the per-event recorded scale reproduces the law.

| divisor hypothesis | Σ deltaY × divisor | vs −69.314718 |
|---|---|---|
| each event's own `visualViewport.scale` | −69.314761 | −6.2e-07 (relative) |
| previous event's scale | −66.454515 | +4.13% |
| leg-end scale | −97.835699 | −41.1% |
| 1 | −48.917832 | +29.4% |

## Touched surfaces

Only: `.ufo/waves/round-73/w1/R73Scribe/{rederive.py,rederive.json,rederive.out.txt,note-review.md,gate-draft.md,report.md}`
and the seat-named trailer `.ufo/waves/round-73/w1/R73Scribe.md` (copy of this report). Scratch
`/fast/scratch/hyaku/tabi-r73/R73Scribe/` created and deleted. No installs.

## Out of scope

Legs (a)/(b)/(c) execution, the capability row and the knowledge-note admission decision (L1's),
the battery/kill-power instruments, S179 verification (the source is not staged in round 73; I
re-read its r72 quote only), and any live `recheck` run.
