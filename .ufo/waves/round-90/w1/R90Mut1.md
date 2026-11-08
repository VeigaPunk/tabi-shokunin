# R90Mut1 — independent mutation sweep

Seat: mutation tester (leaf). Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`, base `a9f1da08`,
wave `w1`, round 90. Scored receipt nonce `tabi-r90-l1-e573334c78fa`, receipt sha256
`be8a5c38a8f3a6d9edb469f8867b1448a6f120654337a4b31bffa5dfb7d1f4f9`, driver pin
`ac5a7a5e…c8d`, fixture pin `5fb1f0f7…ac8`.

The instrument changed **twice during this seat** (freeze re-issued 11:36:19 and 11:40:10). The
sweep is therefore reported on two byte-sets, each keyed by its own sha256, and the freeze drift
itself is a finding below. Receipts: `.ufo/waves/round-90/w1/R90Mut1/` (`sweep-A-*`, `sweep-B-*`,
`baselines.json`, `hashes.txt`).

## 0. Result

**Sweep A — seat-start byte-set** (counter `1d3dfb0b`, drift `32a3595d`, battery on disk
`6dc63daf`; 225 cases): **38 mutants — 29 killed, 9 survived, 0 crashed, 0 unapplied.**

**Sweep B — re-issued freeze** (counter `b54cba19`, battery `2f11fffc`, drift `bd33d158`;
226 cases): **31 mutants re-scored — 27 killed, 4 survived, 0 crashed.** Seven A counter anchors and
seven A drift anchors no longer exist because the lane rewrote those clauses; the live conjuncts
were re-attacked with eight retargeted drift mutants and three retargeted counter mutants.

Live survivors (B): **`m06` settle-order adjacency**, **`m12` send-log order**, **`n-c03` settle
eval params in the ordered sequence** — each has a witness receipt that the pristine counter refuses
and the mutant accepts (real acceptance gaps, named in §6). **`m19`** survives only because the
per-leg shape still refuses its witness (shadowed, not an acceptance gap).

## 1. Byte-sets, detectors, and the freeze drift

| role | sweep A | sweep B (current) |
|---|---|---|
| counter | `1d3dfb0b…` | `b54cba19…` |
| battery | `6dc63daf…` (disk; freeze said `06c67275…`) | `2f11fffc…` |
| drift gate | `32a3595d…` | `bd33d158…` |
| kill power | not used | not used |
| battery cases | 225 | 226 |

Pins are recorded in `R90Mut1/hashes.txt`. Three calibration facts about the pins:

1. **At seat start the battery pin was already stale.** `freeze.txt` named
   `06c67275…` for `scripts/negatives-showpicker-round90.mjs`, but the on-disk file was
   `6dc63daf…` (mtime 11:10:51, untracked per `git status --porcelain`). The `06c67275…` bytes were
   not found anywhere in the lane or under `/fast/scratch/hyaku` (240 s `find` cap); sweep A was
   scored against the bytes actually on disk. The counter and drift pins *did* match disk.
2. **The lane re-issued the freeze mid-seat**: counter → `6f65a0d4` (11:31), battery → `2f11fffc`
   (11:30), drift → `bd33d158` (11:36), freeze rewritten 11:36:19; then counter → `b54cba19` and
   kill/selftest → `17175f0b`/`19122bee` at 11:40, freeze rewritten 11:40:10. Sweep B was read
   after 11:47 and its recorded source hashes equal the 11:40 freeze exactly.
3. **The 11:30 battery added exactly one settle-related case**,
   `send-log-settle-on-plain-leg` (line 192), which is what kills the unexpected-settle weakening
   on the new bytes. No case was added for the three gaps that survive B (§6).

Detectors used:

- **Counter mutants**: each mutant is a copy of the counter beside a pristine copy of the battery,
  scored by the frozen battery (recursive-walk prohibited by the battery's `--work`; `--first-failure`
  used only to stop a killed run early; survivors ran all cases). A mutant is *killed* when the
  battery exits 1, *survived* when it exits 0.
- **Drift mutants**: the pristine gate and the mutant gate are run on a fixture lane whose evidence
  makes exactly the targeted statement red (pristine exit 1, `failed == [target]`) and on a green
  fixture (8/0) and the real lane (8/0) as specificity controls. *Killed* = mutant reports the
  target green on the red fixture.
- **Selftest mutants**: the instrument's own `--selftest` is run from a lane-shaped copy; the probe
  renames the finding id the assertion claims to bind (`schema` → `schema-r`, `plan-calls` →
  `plan-calls-r`). Pristine must exit 1, the mutant must exit 0 → *killed*.
- **Witnesses**: one concrete receipt per counter survivor, built from the scored receipt, run on
  pristine and mutant. A survivor is a *real acceptance gap* only if pristine refuses and the mutant
  is clean.

Baselines (all exit 0): A — counter clean at **107 checks**, battery **225/225, 0 failed, 107/107
coverage**, drift **8 claims / 0 mismatches**, green fixture 8/0. B — counter clean at **107
checks**, battery **226/226, 0 failed, 107/107**, drift **8/0**, green fixture 8/0. The 16+16 red
fixtures each isolated exactly the intended statement (`sweep-A-fixtures.json`,
`sweep-B-fixtures.json`).

## 2. Sweep A — the 38 mutants (seat-start bytes)

`expected detector` is the frozen battery case, the red fixture lane, or the id-rename probe.

| # | mutant | clause weakened / flipped | outcome | detector output |
|---|---|---|---|---|
| 1 | m01-settle-count-two-ok | settle-call count: exactly one (→ `<1`) | survived | battery exit 0 |
| 2 | m02-settle-count-disabled | settle-call count (→ never) | survived | battery exit 0 |
| 3 | m03-settle-expr-prefix-match | settle call: distinct expression (→ prefix) | killed | case `schema`; direct plan-calls on the honest receipt |
| 4 | m04-settle-order-any-position | settle-order (→ any position) | killed | case `plan-calls-settle-order` |
| 5 | m05-settle-order-adjacent-either-side | settle-order (→ adjacent either side) | killed | case `plan-calls-settle-order` |
| 6 | m06-settle-order-any-later | settle-order (→ anywhere later) | **survived** | battery exit 0 |
| 7 | m07-settle-order-flip-before | settle-order flipped (must precede) | killed | case `schema`; direct plan-calls |
| 8 | m08-unexpected-settle-two-ok | unexpected-settle (→ allows one) | **survived** | battery exit 0 |
| 9 | m09-unexpected-settle-disabled | unexpected-settle (→ never) | **survived** | battery exit 0 |
| 10 | m10-unexpected-settle-flip | unexpected-settle flipped | killed | case `schema`; direct plan-calls |
| 11 | m11-wants-method-only | wants-sequence (params dropped) | killed | case `plan-calls` |
| 12 | m12-wants-order-dropped | wants-sequence (order dropped) | **survived** | battery exit 0 |
| 13 | m13-wants-flip | wants-sequence flipped | killed | case `schema`; direct plan-calls |
| 14 | m14-settle-sequence-entry-dropped | wants-sequence (settle call not in sequence) | **survived** | battery exit 0 |
| 15 | m15-domread-raw-dropped | domRead raw accept string | killed | case `accept-domread-law-raw` |
| 16 | m16-domread-tokens-dropped | domRead parsed token list | killed | case `accept-domread-law` |
| 17 | m17-domread-answer-dropped | domRead answer bytes | killed | case `accept-domread-law-bytes` |
| 18 | m18-domread-state-dropped | domRead input state | killed | case `accept-domread-law-state` (id-discriminating: still refused by `leg-*`/`no-selection-law`, expected id absent) |
| 19 | m19-domread-readcount-loosened | domRead exactly-one read (→ ≥1) | survived | battery exit 0 |
| 20 | m20-domread-tokens-uppercase-flip | domRead ASCII-lowercased tokens flipped | killed | case `schema`; direct accept-domread-law |
| 21 | m21-sft-first-status-only | selftest first case binds `schema` id | killed | id-rename probe 1/0 |
| 22 | m22-sft-second-status-only | selftest second case binds `plan-calls` id | killed | id-rename probe 1/0 |
| 23 | m23-sft-ok-true | selftest verdict is the conjunction | killed | id-rename probe 1/0 |
| 24 | m24-sft-exit-zero | selftest exit follows the verdict | killed | id-rename probe 1/0 |
| 25 | m25-drift-sweep-tapi-drop | stmt1: correction names `tapi-` | killed | f1b target false→true |
| 26 | m26-drift-sweep-replay-drop | stmt1: correction names `replayConsistency` | killed | f1c target false→true |
| 27 | m27-drift-narrowing-live-drop | stmt2: no live citation | killed | f2a target false→true |
| 28 | m28-drift-narrowing-points-loose | stmt2: two corrected rows, both real | killed | f2b target false→true |
| 29 | m29-drift-census-words-bound-drop | stmt3: quote ≤ 25 words | survived | f3a target false→false (equivalent; §5) |
| 30 | m30-drift-census-223-guard-drop | stmt3: 224 not contradicted by 223 | killed | f3b target false→true |
| 31 | m31-drift-leak-removes-drop | stmt4: fixture tree removed | killed | f4a target false→true |
| 32 | m32-drift-leak-asserts-drop | stmt4: absence+decoy asserted | killed | f4b target false→true |
| 33 | m33-drift-revision-predates-drop | stmt5: run predates later writes | killed | f5a target false→true |
| 34 | m34-drift-gate-kill-selftest-drop | stmt6: kill power has `--selftest` | killed | f6a target false→true |
| 35 | m35-drift-quality-cites-drop | stmt7: QUALITY 161 cites gate | killed | f7a target false→true |
| 36 | m36-drift-scorecard-stray-drop | stmt8: no stray `selftest 10/10` | killed | f8b target false→true |
| 37 | m37-drift-scorecard-bad-drop | stmt8: seven swept tallies at 9/9 | killed | f8a target false→true |
| 38 | m38-drift-selftest-okc-drop | drift selftest okC causal-detail | killed | selftest probe 1/0 (own selftest 0) |

Mutant hashes: every mutant's sha256 and the pristine sha256 are in `sweep-A-counter.json`,
`sweep-A-drift.json`, `sweep-A-selftest.json`; the mutation text is in `sweep-A-harness.mjs`.

## 3. Sweep A — survivors, clauses, witnesses

| survivor | weakened clause | witness (built from the scored receipt) | pristine → mutant | class |
|---|---|---|---|---|
| m06 | settle read must be **immediately** after the settle `__state()` (`settleIx === stateIx + 1`) | `w06`: insert one allowed `window.__inputs()` eval between `__state()` and the settle read (settleIx = stateIx+2) | `plan-calls` → clean | **real gap** |
| m08 | no `window.__inputs(true)` may appear on a non-domread leg | `w08`: append one `__inputs(true)` eval to `sp84-accept-answer` | `plan-calls` → clean | **real gap** |
| m09 | same clause, check disabled | `w09`: same witness | `plan-calls` → clean | **real gap** |
| m12 | the send-log plan sequence is **ordered** (multiset kept) | `w12`: swap the showPicker trigger and `DOM.setFileInputFiles` on `sp84-accept-answer`, fix ids/`afterSendId` | `plan-calls` → clean | **real gap** |
| m14 | the settle call is **in the ordered plan sequence** (its `returnByValue` params bound) | `w14`: drop `returnByValue` from the settle eval's params | `plan-calls` → clean | **real gap** |
| m01 | settle-call count exactly one (2+ allowed) | `w01`: duplicate the settle eval on a domread leg | `plan-calls` → `plan-calls` | equivalent/shadowed: the ordered-sequence equality still refuses every count≠1 witness |
| m02 | settle-call count disabled | `w02`: same witness | `plan-calls` → `plan-calls` | equivalent/shadowed |
| m19 | domRead exactly one `read` event (→ ≥1) | `w19`: duplicate the `read` event on `sp89-accept-domread-png` | `leg-…`+`accept-domread-law` → `leg-…` | equivalent/shadowed: the per-leg frozen shape refuses the extra event |
| m29 | drift quote ≤ 25 words | f3a (census marker missing, quote intact) | statement red → red | equivalent: see §5 |

Witness receipts and outputs: `sweep-A-witnesses.json`. Kill-case verification (the mutant run on
the exact battery case receipt, showing the expected id or the honest-receipt extras):
`sweep-A-kill-case-verification.json`.

## 4. Sweep B — re-issued freeze (current bytes)

Counter/drift anchors that no longer exist (the clause was rewritten or removed) are listed as
superseded, not scored: **counter** m01, m02, m03, m08, m09, m10, m14-as-written; **drift** m25,
m26, m27, m29, m31, m32, m33. The live conjuncts were re-attacked: `n-c01`/`n-c02` (the
unexpected-settle clause now lives in `evalAllowed`), `n-c03` (settle-call params in the sequence),
and `n-d1…n-d8` (the new statements 1–5 conjuncts).

| mutant | clause | outcome | detector output |
|---|---|---|---|
| m04-settle-order-any-position | settle-order any position | killed | case `plan-calls-settle-order` |
| m05-settle-order-adjacent-either-side | settle-order either side | killed | case `plan-calls-settle-order` |
| m06-settle-order-any-later | settle-order adjacency | **survived** | battery exit 0 (226 cases) |
| m07-settle-order-flip-before | flip | killed | case `schema`; direct plan-calls |
| m11-wants-method-only | params dropped | killed | case `plan-calls` |
| m12-wants-order-dropped | order dropped | **survived** | battery exit 0 |
| m13-wants-flip | flip | killed | case `schema`; direct plan-calls |
| n-c03-settle-sequence-params-drop | settle call in sequence with exact params | **survived** | battery exit 0 |
| m15-domread-raw-dropped | raw accept string | killed | case `accept-domread-law-raw` |
| m16-domread-tokens-dropped | token list | killed | case `accept-domread-law` |
| m17-domread-answer-dropped | answer bytes | killed | case `accept-domread-law-bytes` |
| m18-domread-state-dropped | input state | killed | case `accept-domread-law-state` |
| m19-domread-readcount-loosened | exactly-one read | survived | battery exit 0 (shadowed, §6) |
| m20-domread-tokens-uppercase-flip | lowercased tokens flip | killed | case `schema`; direct accept-domread-law |
| n-c01-allowlist-settle-any-leg | settle read allowed on every leg | killed | **new case `send-log-settle-on-plain-leg`** |
| n-c02-allowlist-settle-none | settle read refused everywhere (flip) | killed | case `schema`; direct send-log-allowlist |
| m28 | stmt2 two corrected rows | killed | g2b target false→true |
| m30 | stmt3 223 guard | killed | g3b target false→true |
| m34 | stmt6 kill `--selftest` | killed | g6a target false→true |
| m35 | stmt7 QUALITY cites | killed | g7a target false→true |
| m36 | stmt8 stray 10/10 | killed | g8b target false→true |
| m37 | stmt8 seven tallies | killed | g8a target false→true |
| m38 | drift selftest okC | killed | selftest probe 1/0 |
| n-d1-sweep-plans-conjunct | stmt1: plan pointer named | killed | g1d target false→true |
| n-d2-narrowing-live-conjunct | stmt2: no live citation | killed | g2a target false→true |
| n-d3-census-annot-conjunct | stmt3: annotation = measured count | killed | g3c target false→true |
| n-d4-leak-deadbranch-conjunct | stmt4: dead branch leaves fixture present | killed | g4a target false→true |
| n-d5-leak-pin-conjunct | stmt4: witness pins frozen drift bytes | killed | g4b target false→true |
| n-d6-leak-named-conjunct | stmt4: correction names witness | killed | g4c target false→true |
| n-d7-revision-time1-conjunct | stmt5: `SCORECARD.md` (10:19:34) | killed | g5b target false→true |
| n-d8-revision-time2-conjunct | stmt5: `SKILL.md` (10:19:40) | killed | g5c target false→true |

All normal-mode drift mutants kept the green fixture and the real lane at **0 mismatches**; the
drift selftest mutants kept their own `--selftest` green (0) and were killed only by the id-rename /
fixture-perturbation probe. Receipts: `sweep-B-counter.json`, `sweep-B-drift-scored.json`,
`sweep-B-fixtures.json`, `sweep-B-harness.mjs`.

## 5. Calibration notes

- **Flips die on the first battery case (`schema`), not on a targeted negative.** A counter that
  refuses the honest receipt makes every refusal case carry extra `plan-calls`/`accept-domread-law`
  findings, and the battery's first case rejects extras. These are kills by the must-accept side.
- **`m18` is an id-discriminating kill, not an acceptance kill.** The weakened gate still refuses
  the bad receipt (`leg-…`, `no-selection-law`) but no longer emits `accept-domread-law`; the case
  fails on the missing expected id. This is exactly the battery's contract, and worth remembering
  when reading "killed": it does not always mean the bytes were accepted.
- **`m29` is a tautological guard.** The word count is computed from an exact regex match of a fixed
  sentence (`"tokens consist of … ASCII whitespace"`), so `words ∈ {17, −1}`; `words > 0` already
  fails when the quote is absent. `words <= 25` can never be the sole false conjunct — no fixture can
  kill it. The r90 rewrite replaced it with `words === 17` plus an annotation-equality check, which
  *is* falsifiable (`g3c`), so this class is closed on the current bytes.
- **Shadowed clauses are not coverage.** m01/m02 are fully shadowed by the sequence equality: any
  extra/missing settle eval changes `got` vs `want`. m19 is shadowed by the per-leg frozen shape.
  Both are equivalent mutants as programs, even though the battery has no case for the clause alone.
- **The three live gaps are all "the negative case tests the wrong weakening":** the battery tests a
  settle swapped *before* the state read (not one moved merely *later*), a param difference in the
  intercept/trigger (not a pure reorder), and the settle call's *presence* (not its params).
- **The new allowlist clause is covered:** `n-c01` is killed by the added
  `send-log-settle-on-plain-leg` case, so sweep A's m08/m09 gap is closed on B.

## 6. Sweep B — the four survivors

| survivor | clause it weakens | witness | pristine → mutant | class |
|---|---|---|---|---|
| m06 | settle read **immediately** after the settle `__state()`; `>= stateIx` allows any later slot | `w06` (one extra allowed `__inputs()` eval between state and settle) | `plan-calls` → clean | **real gap** |
| m12 | the send-log plan sequence is **ordered** | `w12` (trigger and `setFileInputFiles` swapped; ids consistent) | `plan-calls` → clean | **real gap** |
| n-c03 | the settle call is **in the ordered sequence with exact params** (`returnByValue:true`) | `w14` (settle eval without `returnByValue`) | `plan-calls` → clean | **real gap** |
| m19 | domRead exactly-one `read` event | `w19` (duplicated read event) | `leg-sp89-accept-domread-png`+`accept-domread-law` → `leg-…` | shadowed equivalent |

Witness outputs on the current bytes are in `sweep-B-counter.json` (`witnesses` arrays). Each real
gap is a concrete receipt that scores **clean** under the mutated gate and is refused under the
frozen gate; none is a flip of the honest receipt.

## 7. Live-lane observations (not fixed by this seat)

1. **The instruments moved twice under the wave** (§1). Any reader of a kill/survive table must key
   it to a hash; the freeze file's own battery pin was inconsistent with disk at seat start.
2. **Transient stray receipts in the walked tree.** At 11:40:40 a sibling seat
   (`R90Scribe`) wrote six schema receipts (`forgeA`–`forgeF`: settle-before-mark, settle-read
   before-settle-mark, non-domread-carries-call, double-settle-call, `returnByValue:false`,
   settle-read-not-after-settle-state) under `.ufo/waves/round-90/w1/R90Scribe/`. During that window,
   any unexempted counter run on the live lane refused with `prior-set-complete` (observed directly;
   this is the prior-set walk doing its job). The files were gone/renamed by 11:45; the live lane is
   clean again (counter 107/clean, battery 226/0 at 11:50). Sweep B used a sandbox lane with a fixed
   walk to keep scoring independent of that churn.
3. Those forge classes coincide with the gaps this sweep names (settle order/params, non-domread
   carrier, duplicate settle). They are external evidence for the same surface; this seat did not
   read or reuse them in its mutants.

## 8. Reproduction

```sh
# baseline A (counter clean, 107 checks; exit 0)
node "$LANE/scripts/check-showpicker-round90.mjs" --lane "$LANE" \
  --receipt "$LANE/corpus/evidence/round90/chromium-showpicker/receipt.json" \
  --expect-driver-sha256 ac5a7a5e…c8d --expect-nonce tabi-r90-l1-e573334c78fa \
  --expect-fixture-sha256 5fb1f0f7…ac8 \
  --prior-set "$LANE/.ufo/waves/round-90/controls/c1/prior-set.txt" --json
# baseline A (battery: 225 cases, 0 failed, 107/107)
node "$LANE/scripts/negatives-showpicker-round90.mjs" --lane "$LANE" --real <receipt> <pins> \
  --prior-set <prior-set> --work <scratch> --json
# baseline A (drift: 8 claims, 0 mismatches)
node "$LANE/scripts/check-record-drift-round90.mjs" --lane "$LANE" --json
# a counter mutant: copy the mutant counter and a pristine battery into one dir, run the battery
# a drift mutant: run the mutant gate on fixtures/<name> (pristine exit 1 with failed==[target])
# a selftest mutant: run --selftest from a lane-shaped copy; probe with the finding id renamed
```

The harnesses (`sweep-A-harness.mjs`, `sweep-B-harness.mjs`) contain every `from`/`to` edit verbatim,
the fixture edits, the witness constructions, and the scoring rules. Mutant and pristine sha256 per
mutant are in the JSON receipts.

## 9. Limits

- Verdicts are **battery-relative** and **fixture-relative**: a survivor means the frozen detector
  did not notice the weakened clause, not that the clause is unimportant (four survivors are real
  acceptance gaps; the rest are shadowed or tautological).
- Sweeps A and B are different predicates on different bytes; only B describes the current freeze.
  The counter and drift gate changed again at 11:40; no measurement here covers later bytes.
- No kill-power list was used, and no mutant, predicate, counter, pin, prior, threshold or kill rule
  was proposed for amendment.
- No tool was installed or upgraded. No git/jj mutation was issued. The scratch tree
  `/fast/scratch/hyaku/tabi-r90/R90Mut1` was deleted after the receipts above were copied.
