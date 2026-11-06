# tabi round 71 — non-author verifier spot-check

author: hyaku closure (non-author integrator, @m_zfl)

Date 2026-11-06. Lane-round tabi r71, base `11b00f644f5af1a4f7827da6956732e0b91023a5`, after
`47ffeac32b7ba47a9de945c37e4d0f47ba93d36f`. Report `.ufo/reports/round-71/tabi.md` (fleet repo),
dispatched prompt `.ufo/prompts/tabi-round-71.md`. I did not author this round and changed none of
its files. Every measurement below I ran in this session over committed bytes (`git show
47ffeac3:<path>` piped into jq / Python json / sha256) unless it is marked evidence-verified. I read
lane gate receipts and never executed a lane gate (`check-synthpinch-r71`, `negatives-synthpinch-r71`,
`kill-power`, `verify-live-r71`, `attack-harness`, `evaluate-c2`, `selftest-r71-gates`).

Driver digest (copied from the mutable `.ufo/watchdog.log`, lines 3051 and 3067):
`2026-11-06T18:02:35-03:00 launch tabi round=71 pgid=3100642 driver=hyaku-inline attempt=1` ·
`2026-11-06T19:10:06-03:00 complete tabi round=71; hyaku-inline attempt=1`.

## 1. Step-1 conformance

| Check | Command | Observed | Result |
|---|---|---|---|
| Report committed by lane identity | `git log --format='%an %H %ci' -- .ufo/reports/round-71/tabi.md` | `tabi-shokunin 5fbf5c954010e1bad1b2e0ae2da7b4219e2bc0d4 2026-11-06 19:09:15 -0300` (after the last lane commit 19:08:16, before the completion line 19:10:06) | pass |
| `SHONEN` heading, one line per box | read report lines 136–141 | `## SHONEN` with 4 `[~]` lines, each with a pointer | pass |
| Cited commits exist and are ancestors of `master` | `git cat-file -e <h>^{commit} && git merge-base --is-ancestor <h> master` for `711a38c2`, `04f4330f`, `749a1ab5`, `244505a0`, `64e389f2`, `a6626204`, `47ffeac3`, base `11b00f64` | all 8 `ok`; 7 lane commits authored `tabi-shokunin` 18:30:31–19:08:16 | pass |
| Lane pushed, nothing left | `scripts/hyaku/jj-lane.sh state tabi-shokunin`; `git status --porcelain` | `branch=master local=47ffeac3… remote=47ffeac3… ahead=0 behind=0 head=detached tracked=0 untracked=0`; porcelain empty; `ls-remote origin refs/heads/master` = `47ffeac3…` | pass |
| Prompt carries the template contract | `diff <(sed -n 1,140p .ufo/prompts/tabi-round-71.md) kimi-shokunin/templates/round-prompt.md` | differences are placeholder substitutions only (`{{LANE}}`, `{{ROUND}}`, `{{FLEET_ROOT}}`, `{{AXES}}`); §§1–5 verbatim; §6 hyaku addendum and later run-15 notes follow | pass |
| Marker vs report | — | real report with 7 resolvable commits and committed receipts | not a marker → status `ok` |

No step-1 conformance defect found.

## 2. Per-claim re-check

Frozen claims `.ufo/waves/round-71/claims.json` at `04f4330f`; digests `freeze.txt` at `749a1ab5`
(recorded 18:30:46-03:00). I recomputed sha256 at `47ffeac3` for every instrument the predicates
use: driver `5318780c…22af`, counter `310fac05…`, battery `830bbb0d…`, verifier `61f43596…f333`,
harness `33e1bd1b…`, evaluator `3c3a83dc…`, kill-power `b86fc3d7…`, claims.json `828d5537…` — all
equal to `freeze.txt`. The scored C1 receipt `startedAt` is `2026-11-06T21:30:58.863Z`
(18:30:58-03:00), 12 s after the digest commit, so it is a post-freeze run.

### C1 — coverage (9): capability `chromium-synth-pinch-gesture-linux`, predicate `C1-SYNTHPINCH` (a)–(d)

| Leg | Re-check | Observed | Matches report |
|---|---|---|---|
| before | `git show 47ffeac3:.ufo/waves/round-71/controls/c1/donothing-no-receipt.exit` | `2` | yes |
| (a) | `scored/c1-counter-a.exit`; `jq '{verdict,checkCount,findings}' scored/c1-counter-a.json` | `0`; `clean`, 87, `[]` | yes |
| (a) receipt | `sha256` of `corpus/evidence/round71/chromium-synth-pinch-gesture/receipt.json` | `19e3c5b6377eaba100b856a9b6f491da8aa354f6a24adec340ba662f32171ab6`; `driverSha256` = frozen driver | yes |
| **(b)** | `jq '{verdict,checkCount,findings}' w1/R71Exec1/counter.json`; Python count of `events[].leg` in `w1/R71Exec1/receipt.json` | `findings`, 87, `[{"id":"event-leg-domain","detail":"events outside the frozen legs: 1"}]`; 575 events, legs `in 17, out 17, clamp 17, default 9, touch 53, slow 179, zero 282, end 1`; the `end` event is seq 575, `wheel`, `ctrlKey:true`, `deltaY:0`, scale 1.5 (a trailing zero-scale wheel). Same driver digest, own nonce `tabi-r71-exec1-7f6bc402`. The scored receipt has 571 events and no `end` event | yes — **leg (b) false** |
| (c) | `jq` over `scored/c1-negatives-a.json`, `scored/c1-kill-power-a.json` | `cases 107, refusedForExpectedReason 107, isolatedCases 98, allOk true, coverageGap []`; `unmutatedExit 0, mutants 87, killed 87, holds true`; both `.exit` files `0` | yes |
| (d) | `git ls-tree` / SCORECARD diff | knowledge note committed; SCORECARD `## Round 71` says "Capabilities (this round): none admitted" | yes |

Verdict: **not verified — honest stop**, re-measured. The kill rule fires on leg (b) as frozen and
nothing was amended (claims.json digest unchanged). The lane reports this itself; I agree.

### C2 — operability (9): execution-bound live verifier `verify-live-r71`, predicate `C2-EXEC-BOUND` (a)–(d)

| Leg | Re-check (jq over committed summaries) | Observed | Matches report |
|---|---|---|---|
| before | `controls/c2/pre-r70/summary.json`, `pre-r70.eval.json` | verifier `verify-live-r70.mjs`, falsePass 4 (A-env-tap, A-env-scroll, B-swap-tap, C-swap-run-b-tap all `FALSE-PASS` exit 0), positives ok; eval `holds:false` | yes |
| before (r70 bytes under r71 name) | `donothing-r70-bytes.eval.json` | falsePass 4, `holds:false` | yes |
| (a) | `scored/c2-harness-L1/summary.json` rows; `scored/c2-eval-L1.json`; `.exit` files | P-tap 0 HONEST-PASS, P-scroll 0 HONEST-PASS, A-env-tap 2 REFUSED `env-injection`, A-env-scroll 2 REFUSED `env-injection`, B-swap-tap 0 HONEST-PASS, C-swap-run-b-tap 1 REFUSED `snapshot-mutated`+`run-b-wall-floor`+`run-b-stdout-mismatch`; falsePass 0, notLanded 0, `holds:true`; eval exit 0, harness exit 0 | yes |
| (b) | `w1/R71Exec2/harness/summary.json`, `w1/R71Exec2/eval.json` | identical row classes and findings; falsePass 0, notLanded 0, `holds:true` | yes |
| (c) | `scored/c2-verify-live-r71-synthscroll-r69.json`, `…-synthtap-r70.json` (+ R71Exec2 `live-*.json`) | `predicate:true, exit:0, pinSource:frozen`; driver/counter digests equal to the `freeze.txt` pins (`13ea3f8a…`, `c1b3763c…`; `704efab8…`, `a2ed7619…`); `.exit` files `0` | yes |
| (d) | `blanket-accept.eval.json`, `blanket-refuse.eval.json`, `controls/c2/no-run.exit` | blanket-accept notLanded 2 `holds:false`; blanket-refuse notLanded 2, positivesOk false, `holds:false`; no-run `1` | yes |

Verdict: **verified on the frozen predicate**, evidence-verified (committed harness and evaluator
outputs; the verifier, harness and evaluator bytes re-hashed equal to the freeze). Measured
movement: false passes 4 → 0 on the four named attacks with both positives intact. Recorded
limits (not amendments): R71Critic receipt hand-off and `process.execPath` (named in the SCORECARD
correction), R71Review2 N1 `NODE_COMPILE_CACHE` and F2 (summary not bound to the verifier digest),
R71Mut2 9/11 hardening mutants surviving with 0 false passes — the attacks prove the layers in
combination only.

### No axis harmed

`git diff 11b00f64 47ffeac3 -- SCORECARD.md` is one appended `## Round 71` block (+19 lines, 0
deletions): no axis score changes, coverage and operability held at 9, two named correction entries
(r70 C1 limit; r71 C2 limit). Whole-round diff outside `.ufo/waves`: 13 files, +13 584 / −2; the
only deletions are the S173/S174 `used-by` cells in `corpus/SOURCES.md`, an in-place change the
corpus contract allows and the lesson logs old → new. Counts at base → after:
`grep -c '^| S[0-9]' corpus/SOURCES.md` 175 → 178; `corpus/knowledge/*.md` 83 → 84. Gate
evidence: `scored/selftest-r71-gates.out` ends `clean=true cases=8 failed=none` / `exit=0`; SKILL.md
`## Round 71 gate registry` carries rows for `check-synthpinch-r71` and `verify-live-r71`;
`scored/gate-registry-64e389f2.json` lists 5 missing rows (pre-existing R6).

## 3. Per-axis verdicts

| Axis | Verdict | Basis |
|---|---|---|
| coverage | unchanged | C1 honest stop: leg (b) red, capability withheld, score held at 9; nothing harmed |
| operability | improved | C2 verified: falsePass 4 → 0, positives intact, independent seat reproduces |
| depth | unchanged | no claim; knowledge note admitted (see expansion) |
| freshness | unchanged | no claim; r69/r70 capabilities re-derived live through C2 |
| calibration | unchanged | no claim; the round reports its own falsified leg and two limit corrections |
| adjacency | unchanged | no claim; R71Connector reports kama ground, not absorbed; `PROVINCE.md` unchanged |

Round: **not admitted** (C1 does not verify) — `rejected-honest-stop`; status `ok`.

## 4. Discernment spot-check (`corpus/lessons/round-71.md` `## Gate`)

Sources re-opened live: `curl https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/content/common/input/<file>?format=TEXT | base64 -d`
(the first S176 fetch returned a transient non-base64 body; the retry returned HTTP 200).

| Item | Decision | Re-opened source | Agree/disagree | Reason |
|---|---|---|---|---|
| `corpus/knowledge/chromium-synth-pinch-gesture-runtime-round-71.md` | admit | S177 (187 lines, sha256 `67ab6a4b…d9f2`, equal to the staged copy) lines 160–172; scored receipt legs | agree | `kPixelsNeededToDoubleOrHalve = 200` at :160 with the inverse for `scale_factor < 1.0f`; receipt event spans in/out/clamp 242/243/242 ms vs (s−1)·200/800 = 250 ms, default 126 vs 125, slow 925 vs 1000 (frame-quantised); clamp `deltaY` sum 69.31474 vs 100·ln 2 = 69.31472; `unit` (scale 1) delivers 0 events, matching the early finish at :88; touch leg 1.5 → 1.5 |
| "An omitted `gestureSourceType` makes a touch gesture" (for pinch) | reject | S176 (54 lines, sha256 `4f7fd101…3e8`) lines 29–39; receipt `default` leg | agree | :29–30 resolve `kDefaultInput` through `target->GetDefaultSyntheticGestureSourceType()`; the scored `default` leg is 9 trusted ctrl+wheel events with scale 1 → 1.5, no touch events |
| "`scaleFactor` is any positive or zero number" (0 usable) | reject | S177 :29, :162–172; receipt `zero` leg | agree | :29 `DCHECK_GT(params().scale_factor, 0.0f)`; at 0 the inverse is 1/0, so `CalculateEndTime` has no finite stop time; the `zero` leg has `cdpError: no-response-4000ms`, 282 wheels all `deltaY 0`, scale unchanged |
| "A touch pinch zooms the page" | reject | S178 (199 lines, sha256 `3b5253ce…`) :117–119, :127; receipt `touch`/`slow` legs | agree | two pointers pressed at `anchor.x()` moving in opposite directions; touch leg 53 pointer/touch events, slow leg 179, `scaleBefore`=`scaleAfter`=1.5 on this desktop configuration |

New SOURCES row re-opened: **S177** — lesson quote "if (params().scale_factor == 1.0f) {" (line 88)
is 6 words, ≤25, present at line 88 of the live decoded file; "const int kPixelsNeededToDoubleOrHalve
= 200;" present at line 160. S176 quotes at :29–30 and :34–36 and S178 quotes at :117/:119 and :127
also resolve at the cited lines. All three live digests equal the committed staged copies.

Census: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` → exit 0,
`tabi ok …/corpus/SOURCES.md`; 25 `W04` cross-scope duplicate-URL warnings, no errors.

Spot-check result: 1 admit + 3 rejects sampled, 4/4 agree.

## 5. Trend verdicts

- **expansion: improved** — knowledge 83 → 84 on ground the lane did not hold (pinch delivery,
  zero-scale queue wedge), citing mined rows S176–S178 (registry 175 → 178); the admit agrees under
  the outside spot-check. No capability entered (C1 withheld).
- **quality: improved** — the r69 and r70 capabilities re-derived live today through a verifier
  that the four named attacks no longer green (L1 and R71Exec2); the owed r70 C1 limit correction
  landed (r70 R2); no admitted entry failed its re-check here.
- **discernment: improved** — the outside spot-check agrees with the gate on the admit and all three
  rejects; QUALITY 133–134 each trace to a `## Mistakes` row with a committed fail proof
  (`lesson-proof/mislabeled-summary.json`, `controls/c2/blanket-accept.eval.json`).

## 6. Routed defects (status-neutral; the lane fixes them next round unless marked otherwise)

- **R1 (C1 counter)** — `check-synthpinch-r71` assumes every event ends inside its leg; a gesture
  that never ends (scale 0) leaks a wheel past the `end` relabel (`w1/R71Exec1/counter.json`).
  Also R71Review1's 15 receipt-level false greens and R71Mut1's 24 executed killing cases, plus a
  must-accept case class. Re-claim the capability only on a new frozen generation.
- **R2 (C2 verifier)** — receipt bytes not re-bound between load (`verify-live-r71.mjs:189`) and
  counter spawn (`:205`); children run a same-user-writable `process.execPath`; `NODE_COMPILE_CACHE`
  absent from the refused list; the harness summary is not bound to the verifier digest (R71Review2
  F2); one attack per hardening layer (R71Mut2).
- **R3 (sources scope)** — S173/S174 are scoped to the scroll command yet cited for pinch lines
  (R71Scout): revise the row scope or add rows.
- **R4 (carry-over r70 R6)** — 5 missing gate-registry rows (`check-gate-registry --rev 64e389f2`)
  and `w1-results.json` rows carrying no per-seat `status`.
- **R5 (carry-over r70 R1/R3)** — the evidence leg binds bytes at the path, not provenance (r70 F1);
  R70Review1 FG1–FG16 on the tap counter remain open.
- **Operator note (not a lane defect)** — SHONEN boxes 2 (end-to-end task: receipt legs and LOG
  entry re-derived above) and 4 (PROVINCE unchanged; connector absence with positive control) look
  checkable by a non-author; boxes 1 and 3 need a non-author execution of the written instructions.
  Promotion stays operator-owned.
