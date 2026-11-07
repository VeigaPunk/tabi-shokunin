FINDINGS

# tabi r72 (attempt 2) — attack on `claims.json` C1 and on the L1's honest-stop reading

critic: R72Critic (wave w1, seat 10/10). Read-only over the lane; every mutation ran on copies in
`/fast/scratch/hyaku/tabi-r72/R72Critic/` (deleted at the end). No lane file, no production file,
no git write. The frozen claim, counter, battery, kill-power control and pins were never touched: at HEAD
`cfa92fa2` all five still hash to `freeze.txt` (`sha256sum`), and
`git diff --stat 7366d45c..HEAD` over those paths changes none of them; the only post-freeze
change under `scripts/` is the *addition* of the non-pinned `scripts/selftest-r72-gates.mjs`
(`cfa92fa2`). The lane meanwhile committed the S179 row, the r72 note and the SCORECARD/lessons
blocks (cf. §3).

Bottom line: **the L1's honest-stop reading is correct and I could not falsify it.** Leg (c) is a
real failure of the frozen predicate as written. What the attack did falsify is the claim's
*independence structure* (legs (a)–(c) are satisfiable by replaying a pre-freeze receipt) and the
sufficiency of its pre-freeze certification (the 218-case battery was frozen on one receipt while
a case in it is a coin flip). Both are findings for the next generation, not amendments.

---

## 1. Is the leg (c) red a real failure of the frozen predicate? **HOLDS — real, as written**

Command (the assignment's, frozen bytes):

```
node scripts/negatives-synthpinch-r72.mjs \
  --real corpus/evidence/round72/chromium-synth-pinch-gesture/receipt.json \
  --expect-driver-sha256 d007adecd4525116eaa8f55f6fe676f523e2d264d300bbc5fa9ce376eabf7877 \
  --work /fast/scratch/hyaku/tabi-r72/R72Critic/n \
  --laundered .ufo/waves/round-72/controls/c1/degenerate-dispatch-wheel.receipt.json \
  --laundered .ufo/waves/round-72/controls/c1/degenerate-set-scale.receipt.json \
  --laundered .ufo/waves/round-72/controls/c1/degenerate-skip-touch.receipt.json --json
```

**exit 1** (14.55 s). Summary in `receipts/battery-real-a.json`:
`positiveOk true` (the pinned counter is exit 0 clean, 94 checks, on the same receipt),
`passed 217/218`, `failed ["in-wheel-anchor-2px"]`, `allOk false`, `coverageGap []`.
The single failing row: `wheel-anchor` expected, **counter exit 0, `findingIds []`**, i.e. the
counter accepts the mutated receipt. The L1's own committed run agrees:
`scored/c1-negatives-a.json` `passed 217 cases 218 failed ["in-wheel-anchor-2px"] allOk false`,
`scored/c1-negatives-a.exit` = `1`.

Kill power on the same receipt is the second conjunct of leg (c) and is also false:
`scored/c1-kill-power-a.json` `unmutatedExit 1`, `holds false`, `scored/c1-kill-power-a.exit` = `1`
(lane-measured; I did not re-run it — a false battery conjunct already makes the conjunction
false, so a re-run could not change the leg).

The arithmetic, at frozen lines:

| fact | evidence |
|---|---|
| anchor constant `AT = {x:400,y:300}` | `scripts/check-synthpinch-r72.mjs:33` |
| the check accepts `|clientX−400| ≤ 1` on `in`/`clamp`/`default` wheels | `scripts/check-synthpinch-r72.mjs:204` |
| the case adds **+2 to the observed value** | `scripts/negatives-synthpinch-r72.mjs:159` (`[0].clientX += 2`) |
| the scored receipt's first `in` wheel is at 399 (offsets across the leg: {−1,0}) | receipt `events[0]` = seq 1, `leg in`, `wheel`, `clientX 399` |
| so the mutated value is 401 and `|401−400| = 1 ≤ 1` | consequence of the three rows above |
| a +1 mutation is an explicit **must-accept** | `scripts/negatives-synthpinch-r72.mjs:223` |

So the counter is behaving exactly as frozen; the case is mis-classified: a wheel one pixel off
the anchor is legal under the frozen `wheel-anchor` law, and the mutated receipt is
indistinguishable from an honest one. Any reading under which leg (c) passes is post-hoc:

- *literal exit code* → 1, fails.
- *“`allOk true, coverageGap empty`” as the operative criterion* → `allOk false`, fails.
- *“run the battery on a receipt where it passes (smoke1)”* → the predicate says “on the (a)
  receipt”; substituting a receipt is not a reading, and it is exactly the replay hole in §2
  (the pre-freeze smoke1 receipt passes the pinned counter verbatim, exit 0).
- *“reclassify the case as a must-accept, so the battery is really green”* → changes an
  instrument's required output after the freeze, which frozen kill rule 1 forbids (“never
  amended”), and still leaves the declared command exiting 1.

Verdict: the case is a battery defect (its stated intent, “2 px off the anchor”, is not achieved
by a relative +2 from a value already at −1), but that does not make leg (c) true. The honest
stop holds. The correct target for the next generation is the **case**, not the counter.

Test of that correction (next generation, not proposed for this claim): set the first `in` wheel
to `AT.x + 2 = 402` instead of `+= 2`; on three receipts with different honest first-wheel values
the counter refuses with exactly `wheel-anchor`, exit 1:

```
scored receipt (399→402)  counter exit 1  ['wheel-anchor']
smoke1        (400→402)  counter exit 1  ['wheel-anchor']
smoke3        (399→402)  counter exit 1  ['wheel-anchor']
```

Receipt-invariant, still pins the band edge against the untouched +1 must-accept at :223.

## 2. Can a do-nothing / look-alike producer meet legs (a)–(c)? **FALSIFIED — yes, by replay**

Three runs, no driver executed at any point (my scratch paths):

| forgery | transform | result |
|---|---|---|
| **zero-edit replay** | `cp` of the pre-freeze `smoke1.receipt.json`, **no edits** | counter **exit 0**, `clean`, 94 checks, nonce `tabi-r72-smoke1-219a38fe` (`receipts/zeroedit.counter.json`). The scored-nonce shape is not required by any check. |
| **forged-a** (stands in for leg (a)) | smoke1 + the nonce rewritten in all 6 occurrences + the two self-declared wall-clock stamps moved post-freeze (`receipts/forgery.py`) | counter **exit 0 clean** (`receipts/forged-a.counter.json`); battery **exit 0**, `218/218`, `allOk true` (`receipts/battery-forged-a.json`); kill power **exit 0**, `holds true`, 94/94 force-true + 12/12 semantic, `survivors []` (`receipts/killpower-forged-a.summary.json`, 456 s) |
| **forged-b** (stands in for leg (b)) | smoke2 + nonce → `tabi-r72-exec1-4b7e0d92` | counter **exit 0 clean** (`receipts/forged-b.counter.json`) |

The transform is not exotic: the battery ships it. `nonce-shape`
(`scripts/negatives-synthpinch-r72.mjs:69-72`) already rewrites `nonce`, `nonceOnPage`,
`serverLog[].run`, the `Page.navigate` URL and the ready expression in four lines.

Why nothing catches it: the only per-run identity is `nonce`; `driverSha256` is a field inside
the receipt (`driver-pin`, `scripts/check-synthpinch-r72.mjs:111`); the only time check is
`run-window` (`scripts/check-synthpinch-r72.mjs:118`), which constrains the *span* of the
self-declared `startedAt`/`finishedAt`, not their position relative to the freeze. No check reads
git, the process table, a port, or an external clock.

Consequence: leg (a)'s “the L1 runs the pinned driver once” and leg (b)'s “with its own nonce”
are assertions, not measurements. The claim's `limit` (“the counter reads a receipt; it is not an
execution oracle”) declares the general gap; the `(b)` wording presents nonce novelty as
independence, and that is false. The `doNothingControl` set (no receipt → exit 2; r71 receipt →
exit 1) omits the one look-alike that passes: a **same-generation pre-freeze receipt**.

This is a property of the frozen predicate, not a fact about the L1's run: the scored receipt is
a genuine post-freeze run (`startedAt 2026-11-06T23:34:10.952Z`, 9 s after the freeze commit's
`20:34:01-03:00`, committed at `b78608f6 20:38:55-03:00`, 573 events vs smoke1's 570). I found no
evidence of replay in the lane.

Smallest safe correction (generation r73, not this claim): add
`--not-before 2026-11-06T23:34:01Z` to the counter and reject a receipt byte-identical to any
pre-freeze receipt. That closes the zero-edit replay only; a determined forger can edit a
timestamp, so leg (a)/(b) still need the r71-R2 verifier hand-off (out-of-band observation of the
driver process or its port), which the claim routes on and does not claim. Until then, a fresh
nonce is not evidence of independence and should not be cited as such.

## 3. Is the surface new ground, and does the surface name the axis? **axis HOLDS; “new ground” FALSIFIED**

| question | evidence | verdict |
|---|---|---|
| axis named by the surface | `grep -c '^| `chromium-synth-pinch-gesture-linux` |' SCORECARD.md` → `0` (exit 1); the only synth rows are scroll `SCORECARD.md:3649` and tap `SCORECARD.md:3670` | **HOLDS**: the missing capability row is a coverage item (0→1), exactly as the claim says |
| surface is new ground | `corpus/knowledge/chromium-synth-pinch-gesture-runtime-round-71.md` exists (round 71 measured the same command, legs, anchor); the r72 note is a successor (`corpus/knowledge/…-round-72.md`, committed at `cfa92fa2`, cites S179 5×, and itself states the capability is still withheld at line 11; `SCORECARD.md:3697` records the r72 honest stop, capability row count still 0) | **FALSIFIED**: the ground was worked at r71 and withheld on leg (b), not unexplored. r72's new content is S179's delta law plus a new instrument generation (94 vs 87 checks; 218 vs 107 cases) |
| S179 provenance | staged `sha256 4930d517…8f73` equals `sources/FETCH.txt` and `SOURCES.md:193`; `delta_y = 100.0f * log(scale)` at lines 33–44, sign note at 39–40, control key / precise-pixel at 53–60; registry `178 → 179` (`git show 4e4ac080:corpus/SOURCES.md | grep -c '^| S[0-9]'` = 178 vs 179 now) | **HOLDS**: the row and the note's citation are honest; the claim's `limit` correctly scopes S179 to `100 log(scale)` and marks the `deltaY × pageScale` division as a host measurement |
| province | `grep -cin pinch PROVINCE.md` → `0`, but the domain owns browser interaction/CDP session discipline (`PROVINCE.md:6-14`); no conflict, no absorption | **HOLDS** |

So: an admitted row would be a legitimate coverage entry, but it must be recorded as a
*re-derivation of withheld ground on generation r72*, not as expansion. The claim's own `type`
(“re-claim on a new generation”) says this; the `surface` prose is nearly the r71 surface plus
S179 and should not be read as new ground.

## 4. Was the pre-freeze repetition honest, and was one-receipt battery certification a process defect? **5/5 HOLDS; process defect CONFIRMED**

5/5 counter-clean is honest, verified independently:

- my own counter runs on the five completed smokes: `smoke1…6` → **exit 0 each** (clean, 94 checks);
- the lane's `smoke-counter-summary.json` rows match the receipts by nonce and by receipt name
  (`smoke1.counter.json` nonce `tabi-r72-smoke1-219a38fe`, receipt `smoke1.receipt.json`, …);
- counter mtimes `20:32:09–20:32:10` precede `freeze.txt` at `20:34:00`; smoke4 is the disclosed
  driver exit 2 (`free-port precheck: port 41704 busy`), no receipt, not counted;
- the claim's pre-freeze figures reproduce: battery on smoke1 `218/218`, `163 isolated`
  (`negatives-battery-smoke1.json`, 20:30:25); kill power on smoke1 `holds true`, and the
  before-cases control shows exactly the two named survivors
  (`kill-power-smoke1-before-cases.json`: `M-teardown-sweep-dropped`, `M-degenerate-loose-null`).

But the repetition covered the **counter only**. The battery was certified on one receipt. I ran
it on every smoke and on both post-freeze receipts:

| receipt | first `in` wheel offset | battery | failed |
|---|---|---|---|
| smoke1 | 0 (clientX 400) | exit 0, 218/218 | — |
| smoke2 | 0 | exit 0, 218/218 | — |
| smoke5 | 0 | exit 0, 218/218 | — |
| smoke3 | −1 (399) | **exit 1**, 217/218 | `in-wheel-anchor-2px` |
| smoke6 | −1 (399) | **exit 1**, 217/218 | `in-wheel-anchor-2px` |
| scored (a) | −1 (399) | **exit 1**, 217/218 | `in-wheel-anchor-2px` |
| R72Exec1 | −1 (399) | **exit 1**, 217/218 (`w1/R72Exec1/negatives-b.json`) | `in-wheel-anchor-2px` |

4 of 7 receipts red, always the same case, and the outcome tracks one bit: whether the driver's
first `in` wheel landed at 400 or 399. The driver's honest offsets are {−1, 0} on both the scored
receipt and smoke1, so this case was a coin flip at freeze time. `lessons/round-72.md` Mistake
row 1 records the defect itself, so the honesty is not in question — the *rule* was missing.

**Process defect: yes.** Freezing a 218-case battery's required exit on a single receipt, while
its sibling counter was repeated 5×, certifies a sample, not a law. The rule that would have
caught it, in order of cost:

1. **Case invariance (the direct fix):** a refusal case must mutate to a value outside the
   counter's declared tolerance **measured from the law's constant** (`AT`, `scaleFactor`, ratios),
   never relative to the observed sample value; any case whose verdict depends on the sample is a
   must-accept. `in-wheel-anchor-2px` becomes `clientX = AT.x + 2`.
2. **Receipt-set certification:** before the freeze, run the full battery *and* kill power on every
   completed pre-freeze receipt, and freeze only if every one is green; record the per-receipt
   matrix in `forgeryControls`. This alone catches r72 with data already on disk at 20:32
   (`lesson-proof/battery-smoke3.json`, `battery-smoke6.json` are the post-freeze proof).
3. **Say what was repeated:** `forgeryControls` juxtaposes “5 completed smoke runs, counter 5/5
   clean” with “battery on smoke1: 218/218”, which reads as if the instrument set were repeated
   5×. It was not.
4. **Bind (a)/(b) to post-freeze execution** (§2), so the three receipt-reading legs cannot be
   satisfied by a committed pre-freeze file.

## 5. Scope note on kill power in the scored receipt

`scored/c1-kill-power-a.json` reports `106/106 killed` but `holds false`, because `killed` is
simply “battery exit 1” and the unmutated battery already exits 1. On this receipt the exit-code
metric is vacuous; the discriminating record is `failedCases`, and it does hold up: all 94
force-true mutants gain new failed cases (I checked: 94/94, none equal to the unmutated set), and
M5's row shows the `producer-verdict-*` cases. So no kill-power information was lost, but “all 106
mutants killed” must not be cited as kill power on the scored receipt — the leg is false, and the
control's own `holds` is the only sound summary.

---

## Receipts (beside this file)

`receipts/forgery.py` · `receipts/zeroedit.counter.json` · `receipts/forged-a.counter.json` ·
`receipts/forged-b.counter.json` · `receipts/battery-real-a.json` ·
`receipts/battery-forged-a.json` · `receipts/battery-smoke-sweep.json` ·
`receipts/killpower-forged-a.summary.json` · `receipts/killpower-scored-a.summary.json` ·
`receipts/smoke1.counter-critic.json`

Scratch `/fast/scratch/hyaku/tabi-r72/R72Critic/` removed after the copies above were made.

Report: .ufo/waves/round-72/w1/R72Critic.md
