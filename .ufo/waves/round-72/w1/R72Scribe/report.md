DONE

# R72Scribe — round 72 w1: pinch knowledge note (r72) + S179 registry row

Seat: draft (1) a round-72 successor knowledge note on `Input.synthesizePinchGesture` that adds
what the r72 receipts show and what S179 sources, and (2) one S179 registry row in S178's column
shape. Both are drafted, every number in them is re-derivable from the commands below, and the
one thing this seat found that the lane did not have is the exact, per-run cause of the leg (c)
honest stop. No product file, no lane-root file, no control, no claim was edited.

## Deliverables

| path (relative to the lane) | size | sha256 | role |
|---|---|---|---|
| `.ufo/waves/round-72/w1/R72Scribe/knowledge-note.md` | 16800 B | `e595022c…77dc` | the r72 note draft |
| `.ufo/waves/round-72/w1/R72Scribe/sources-row.md` | 3138 B | `1bfca31e…71dc` | S179 replacement-candidate row + delta table |
| `.ufo/waves/round-72/w1/R72Scribe/measure.py` | 7399 B | `f3dc1457…c7bd` | the only producer of the numbers |
| `.ufo/waves/round-72/w1/R72Scribe/numbers.json` / `numbers.txt` | 9473 B | `ca058315…e902` (JSON) | `measure.py` output (stdout + JSON) |
| `.ufo/waves/round-72/w1/R72Scribe/report.md`, `.ufo/waves/round-72/w1/R72Scribe.md` | — | — | this report |

`measure.py` reads seven receipts (the scored one, `controls/c1/smoke{1,2,3,5,6}`, and
`w1/R72Exec1/receipt.json`) and the three scored JSONs (`c1-counter-a`, `c1-negatives-a`,
`c1-kill-power-a`), plus `SCORECARD.md`. It writes nothing outside `--out`.

## What I executed, and what I only read

- **Ran:** `measure.py` (my own read-only analysis), `node scripts/check-synthpinch-r72.mjs
  --list-checks`, `sha256sum`, `base64 -d | sha256sum`, `grep`/`wc`/`sed` facts, read-only
  `git log/show/status`, and JSON reads of other seats' outputs.
- **Did not run:** the driver, the counter on any receipt, the battery, or kill power. Every
  runtime number below is therefore a *re-derivation from receipts and scored outputs that
  already exist*, not a new execution. The note's `recheck:` line is unexecuted by me.

## Findings

**F1 — the exact cause of the leg (c) honest stop is receipt-dependent, and it splits 3/4.**
`negatives-synthpinch-r72.mjs:159` mutates `evsOf(r,'in',wheel)[0].clientX += 2`; the counter's
tolerance is `Math.abs(clientX − 400) <= 1` (`check-synthpinch-r72.mjs:204`). The first `in`
wheel's `clientX` is 400 on smoke1/smoke2/smoke5 and **399** on the scored run, smoke3, smoke6
and R72Exec1's run:

| run | nonce | first `in` wheel | mutant | \|mutant − 400\| | `wheel-anchor` fires | case |
|---|---|---|---|---|---|---|
| scored | `tabi-r72-l1-5a690aee` | (399,299) | 401 | 1 | no | **fails** |
| smoke1 | `tabi-r72-smoke1-219a38fe` | (400,300) | 402 | 2 | yes | passes |
| smoke2 | `tabi-r72-smoke2-7d37a089` | (400,300) | 402 | 2 | yes | passes |
| smoke3 | `tabi-r72-smoke3-f3157b99` | (399,300) | 401 | 1 | no | fails |
| smoke5 | `tabi-r72-smoke5-dbf7ff68` | (400,300) | 402 | 2 | yes | passes |
| smoke6 | `tabi-r72-smoke6-c367df2c` | (399,300) | 401 | 1 | no | fails |
| R72Exec1 | `tabi-r72-exec1-3f9a1c7b` | (399,300) | 401 | 1 | no | fails |

Evidence: `numbers.json → smokes.*.firstInAnchor`; scored failure record
`.ufo/waves/round-72/scored/c1-negatives-a.json` → `{"case":"in-wheel-anchor-2px","class":"refuse",
"expect":"wheel-anchor","counterLine":204,"exit":0,"findingIds":[],"isolated":false,"ok":false}`.
The counter is correct here; the mutant cannot express "2 px off" because it adds a constant to
a value that is already −1 px. A r73 battery must set an absolute coordinate (`AT.x + 2`) or
assert the mutated value is still out of tolerance before accepting the case as a refusal.

**F2 — the law must be measured against the requested factor; the clamp leg proves it.**
Scored run (`numbers.json → scored.law`): `in` −69.314710658 vs −69.314718056 (dev 7.4e-6),
`out` 69.314708131 (9.9e-6), `clamp` 69.314719200 (1.1e-6), `default` −40.546515115 (4.3e-6) —
all against `−100 ln(requested scaleFactor)`. The clamp leg's realized factor is 1, so against
the realized factor its deviation is 69.31. The frozen counter compares to
`FROZEN.params.scaleFactor` (`check-synthpinch-r72.mjs:209`), which is the only comparison that
survives a clamped receipt.

**F3 — wheel counts vary run to run while the sums do not; the source explains it.**
Seven runs: `in` 16,17,17,17,16,17,17 · `out` 16,16,17,17,16,17,16 · `clamp`
16,16,16,16,17,16,16 · `default` 9,8,9,8,9,9,8 · `zero` 281,282,282,282,282,282,282; `in` sums
stay in −69.31467…−69.314739, `default` in −40.546506…−40.546524 (`numbers.json → smokes`).
Mechanism, sourced: `QueueEvent` coalesces a queued update onto the last queued one
(`.ufo/waves/round-72/sources/touchpad_pinch_event_queue.cc:113-128`) and dispatches one wheel at
a time awaiting ack (`:166-170`); because `f(s1*s2)=f(s1)+f(s2)` (`:34`), coalescing changes the
count and preserves the sum. Consequence for the lane: r71's "16 `wheel`" was one sample, and a
counter that pinned an exact count would flake; the r72 counter's `[min, sign]`
(`check-synthpinch-r72.mjs:51-63`) is the right shape.

**F4 — the ±1 px anchor jitter is host rounding, quantified.** Scored receipt: `in` 17 wheels at
(399,299)×4, (400,299)×5, (399,300)×3, (400,300)×5 — 12 of 17 off-anchor, max |dx| = max |dy| =
1; `default` 9 wheels, 6 off, max 1; `clamp` 16/16 exactly (400,300); never 2 px
(`numbers.json → anchor`). The note states ±1 as a host fact rather than slack, which is what
makes F1 a battery defect and not a counter defect.

**F5 — the `out` leg's wheels are not at the anchor at all, in two regimes.** Wheels 1-11 at
(599-600, 449-450) = anchor × 1.5 ± 1 px while the scale falls 1.9688 → 1.3347; wheels 12-17 ride
(630,473) → (798,599) while `clientX × pageScale` stays 799.06-799.63 ≈ 800 = `anchor.x × 2`
(`numbers.json → outSweep`). Nothing in the receipt identifies the transform; S179:56 only
forwards the gesture position. This is why `wheel-anchor` is scoped to `in`/`clamp`/`default`
(`check-synthpinch-r72.mjs:203`): an out-leg anchor check would fail on a correct run.

**F6 — the zero leg is an update stream, not an end event.** 282 wheels, every `deltaY` exactly
0, `deltaMode:0`, `ctrlKey:true`, all at (533,400), mean cadence 16.64 ms, span 4675.7 ms, no CDP
response in 4000 ms, leg elapsed 4706 ms (`numbers.json → zero`). Sourced: a delta is computed
only for `kGesturePinchUpdate` (S179:41-46), a begin never becomes a wheel (S179:172-193), an end
becomes at most one zero-delta wheel with phase `kPhaseEnded` (S179:199-203). Where `100·log(0)`
is neutralised before the page reads 0 is **not** in S179 — stated in the note as inference.

**F7 — S179 contains no page-scale term.** `grep -ci 'page[_. ]*scale'` on the staged file prints
0 (exit 1), so `Σ(deltaY × pageScale) = −100 ln(scaleFactor)` is a host measurement and the note
says so in its Limits section. The committed S179 row already carries the same limit in other
words ("it does not say how page scale enters the delivered deltaY").

**F8 — only the leg sum is exact; the running sum lags the page's scale reading.** Comparing the
running Σ(deltaY × scale) after wheel *i* with −100 ln(scale_i / leg-start scale): `in` 13/17
within 0.01 (first match at wheel 3; the first two wheels precede the reading's rise), `out`
16/17, `default` 8/9, `clamp` 0/16; the leg's last wheel carries the tail (0.101, 0.139, 2.351,
69.315) (`numbers.json → perEventTracking`). This explains why the frozen check is one
comparison per leg and not one per event.

## Conflicts (verbatim)

**K-1 — an S179 row already exists.** `corpus/SOURCES.md:193`, committed in `cfa92fa2`
(the registry now has 179 rows; `grep -c '^| S' corpus/SOURCES.md` = 179), before this seat was dispatched:

```
| S179 | Chromium 155.0.8059.84 touchpad pinch event queue source — https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/components/input/touchpad_pinch_event_queue.cc?format=TEXT | code | A | how the browser turns a touchpad pinch update into the synthetic ctrl+wheel event a page sees at this tag: deltaY from the update's scale, sign, ctrl modifier, precise-pixel units; not Blink's page-scale handling of that wheel and not the synthetic gesture itself (S177) | decoded lines 31-44 (design notes; delta_y = 100.0f * log(scale) on PinchUpdate), 39-40 (wheel deltaY sign inverted; Math.exp(-deltaY/100) converts back), 53-60 (kControlKey added; kScrollByPrecisePixel; delta_x 0); .ufo/waves/round-72/sources/touchpad_pinch_event_queue.cc sha256 4930d51770c81cf1b6195f111f67cd65b6f46efc59328d276aed973c7ff38f73; fetched 2026-11-06 | each pinch update becomes one ctrl+wheel whose deltaY is -100 ln(update scale), so a page can sum wheel deltas to recover the gesture's scale factor; it does not say how page scale enters the delivered deltaY | mined | 2026-11-06 | on-release | corpus/knowledge/chromium-synth-pinch-gesture-runtime-round-72.md, corpus/lessons/round-72.md |
```

My `sources-row.md` is therefore a **replacement candidate**, not a new row: it adds S179:113-128
(coalescing) and S179:166-224 (single in-flight dispatch, phase mapping) to the anchor cell, the
239-line count and fetch timestamp, and the additive identity as the reason the sum survives
coalescing. Its `used-by` keeps `corpus/lessons/round-72.md`, which the committed row cites. If
the L1 keeps the committed row, my file is discardable — its added anchors are a convenience, not
a correction. No claim, predicate or digest is touched by either version.

**K-2 — a round-72 note also already exists.** `corpus/knowledge/chromium-synth-pinch-gesture-runtime-round-72.md`
(79 lines, `cfa92fa2`). My draft is a superset; two claims in it differ from mine in *method*, not
value:

```
The same held on the five pre-freeze smoke receipts (the frozen counter's
`wheel-delta-law` check, ±0.5, was clean 5/5). **Inference, not sourced:** Blink delivers the
wheel's deltaY divided by the page scale it applies. S179 does not cover that step. Per event,
deltaY × scale equals −100 ln(scale ÷ previous event's scale) within 0.01 for 11 of 17 `in`,
16 of 17 `out` and 8 of 9 `default` wheels on the scored receipt; the misses sit where two
wheels record the same handler-time scale, so the handler-time reading can lag a wheel and
only the per-leg sum is exact here.
```

My test is the running sum against the leg-start scale (13/17, 16/17, 8/9, 0/16 — F8); the
committed test is the previous-event ratio. Both agree on the conclusion (only the leg sum is
exact) and neither contradicts the other's quantities. The committed note's other checkable
numbers reproduce exactly on this receipt: 17/17/16/9/282 wheels, Σ = −48.992 / 51.316 / 69.315
/ −32.572, Σ×scale = −69.3147 / 69.3147 / 69.3147 / −40.5465, 12 of 17 and 6 of 9 off-anchor,
`lateAfterClose` 42 (`receipt.json` top-level field — read, `42`).

**K-3 — leg (b) is recorded as clean by the L1 but was not in my dispatch status.** The committed
`SCORECARD.md` round-72 block says "(b) R72Exec1 cold run, counter exit 0 clean
(`w1/R72Exec1/counter.json`)", while my dispatch status listed only (a) and (c). What exists at
read time: `.ufo/waves/round-72/w1/R72Exec1/counter.json` → `verdict: clean`, `checkCount: 94`,
`nonce: tabi-r72-exec1-3f9a1c7b`; that directory contains no `*.exit` file (`ls` glob exit 2), so
the exit code is recorded only inside the JSON, and the receipt
(`w1/R72Exec1/receipt.json`, sha256 `41975cb3…a8d349c`) is not the (a) receipt. I corroborate
leg (b) as *another seat's artifact*, and I do not claim it as measured by me.

## Gates

| leg | state | evidence |
|---|---|---|
| (a) scored run, counter exit 0 | holds | `corpus/evidence/round72/chromium-synth-pinch-gesture/receipt.json` sha256 `ac2245cf…60b9`; `scored/c1-counter-a.json` `verdict clean`, `checkCount 94`; `scored/c1-counter-a.exit` content `0`; driver `scored/c1-driver-scored.exit` `0` |
| (b) R72Exec1 cold run | not mine to assert | `w1/R72Exec1/counter.json` clean/94, no `.exit` file (K-3) |
| (c) battery + kill power | **fails** | `scored/c1-negatives-a.exit` `1`: 217/218, `failed: ["in-wheel-anchor-2px"]`, 207 refuse + 8 must-accept + 3 laundered, 164 isolated over 84 ids, `allOk false`; `scored/c1-kill-power-a.json`: 106 mutants (94 force-true + 12 semantic), 106 killed, `survivors []`, `holds false`, `unmutatedExit 1` (kill-power's own definition, `kill-power-r72.mjs:11`) |
| (d) capability row + note | not admitted | grep -c of `^\| \`chromium-synth-pinch-gesture-linux\` \|` over `SCORECARD.md` = 0 (exit 1); the committed note exists, the capability is withheld |

Per the frozen kill rule this is an honest stop on (c); nothing here amends the claim.

## Touched surfaces

- **Wrote** (7 files + the published copy): `.ufo/waves/round-72/w1/R72Scribe/{knowledge-note.md,
  sources-row.md, measure.py, numbers.json, numbers.txt, measure.err (empty), report.md}` and
  `.ufo/waves/round-72/w1/R72Scribe.md` (a byte-identical copy of report.md). Nothing else.
- **Read-only**: `corpus/SOURCES.md`, `corpus/knowledge/*round-7[12].md`, `scripts/check-synthpinch-r72.mjs`,
  `scripts/negatives-synthpinch-r72.mjs`, `scripts/chrome-cdp-synthpinch-round72.mjs`,
  `.ufo/waves/round-72/{claims.json,freeze.txt,sources/**,scored/**,controls/c1/**,w1/R72Exec1/**}`,
  `corpus/evidence/round72/**`, `SCORECARD.md`, read-only `git log/show/status`.
- **No** git/jj mutation, no commit, no push, no lane-root or fleet-root file, no edit under
  `scripts/`, `corpus/`, `.ufo/waves/round-72/controls`, no tool install, no pacman.
- **Scratch**: none created — nothing this seat did needed a temp dir, so nothing to delete.

## Out of scope / not done

- Did not run the driver, the counter on a receipt, the battery or kill power (no execution
  claims in either draft).
- Did not integrate: `corpus/knowledge/*` and `corpus/SOURCES.md` are the L1's to change; my
  drafts sit in the wave dir.
- Did not propose or draft any amendment to the frozen claim, its counter, pins or kill rule.
- Did not test the r73 battery fix (K-1/F1 shape) or `deviceScaleFactor ≠ 1`, headed Chromium.

## Commands (with exit codes)

| # | command | exit |
|---|---|---|
| 1 | `python3 measure.py --lane /home/vgpnk/Projects/shokunin/tabi-shokunin --out numbers.json` (in the R72Scribe dir) | 0 |
| 2 | `node scripts/check-synthpinch-r72.mjs --list-checks` → 94 ids | 0 |
| 3 | grep -c of `^\| \`chromium-synth-pinch-gesture-linux\` \|` over `SCORECARD.md` → `0` | 1 (no match) |
| 4 | `grep -ci 'page[_. ]*scale' .ufo/waves/round-72/sources/touchpad_pinch_event_queue.cc` → `0` | 1 (no match) |
| 5 | `wc -l < .ufo/waves/round-72/sources/touchpad_pinch_event_queue.cc` → `239` | 0 |
| 6 | `sed -n '39,40p' <S179> \| sed 's\|^  // \|\|' \| wc -w` → `22` (the ≤25-word quote) | 0 |
| 7 | `base64 -d <.ufo/…/touchpad_pinch_event_queue.cc.b64 \| sha256sum` → `4930d517…8f73`, equal to `sha256sum` of the staged `.cc` | 0 |
| 8 | `cat .ufo/waves/round-72/sources/FETCH.txt` → `HTTP 200`, decoded sha256 `4930d517…8f73`, `lines 239` | 0 |
| 9 | grep -c of `^\| S` over `corpus/SOURCES.md` → `179`; grep -c of `^\| S179` → `1` | 0, 0 |
| 10 | python split of my row and of `corpus/SOURCES.md:13` → 11 cells each, no `\|` inside a cell | 0 |
| 11 | `git -C <lane> log --oneline -3` → `cfa92fa2`, `b78608f6`, `7366d45c` | 0 |
| 12 | `git -C <lane> status --porcelain` → only untracked `.ufo/waves/round-72/w1*` entries | 0 |
| 13 | `git -C <lane> show --stat cfa92fa2` → SOURCES.md, `corpus/knowledge/…round-72.md`, SCORECARD, lesson, SKILL, QUALITY | 0 |
| 14 | JSON read of `scored/c1-{counter,negatives,kill-power}-a.json` + the `.exit` files | 0 |
| 15 | JSON read of `w1/R72Exec1/{counter.json,receipt.json}` + `ls *.exit` (glob) | 0, 2 |

## Limits of this report

- Everything runtime is re-derived from the L1's and R72Exec1's receipts; a receipt that was
  already wrong would be re-derived wrong in the same way.
- The drafts are unintegrated: two canonical files (`corpus/SOURCES.md:193`, the r72 note) were
  written by the L1 before this seat ran, and K-1/K-2 record the overlap instead of hiding it.
- The note's `recheck:` line is a claim about future executability; this seat did not run it.
