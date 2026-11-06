# tabi round 70 — non-author verifier spot-check

author: hyaku closure (non-author integrator, @m_zfl)

Date 2026-11-06. Lane-round tabi r70, base `90b9ff045542651fb59814fe32f73fee0d1d8243`, after
`b12a93cf0bb294b46739274b859fed6315a9b844`. Report `.ufo/reports/round-70/tabi.md` (fleet repo),
dispatched prompt `.ufo/prompts/tabi-round-70.md`. I did not author this round and changed none of
its files. Every measurement below I ran in this session over committed bytes unless it is marked
evidence-verified. I read lane gate receipts and never executed a lane gate (`check-synthtap-r70`,
`verify-live-r70`, `negatives-synthtap-r70`, `selftest-r70-gates`).

Driver digest (copied from the mutable `.ufo/watchdog.log`, lines 3018 and 3050):
`2026-11-06T16:21:44-03:00 launch tabi round=70 pgid=1974779 driver=hyaku-inline attempt=1` ·
`2026-11-06T17:57:07-03:00 complete tabi round=70; hyaku-inline attempt=1`.

## 1. Step-1 conformance

| check | command | observed | result |
|---|---|---|---|
| report committed by lane identity | `git log --format='%an %ae %H %ci' -- .ufo/reports/round-70/tabi.md` (fleet) | `tabi-shokunin tabi@shokunin.local d4ece04b… 2026-11-06 17:56:31 -0300`: after the cited tip `b12a93cf` (17:54:50) and before the 17:57:07 completion line | pass |
| SHONEN heading, one line per box | report `## SHONEN`; `git show b12a93cf:SHONEN.md \| grep -c -E '^\s*- \[[ x~]\]'`; `git diff --stat 90b9ff04 b12a93cf -- SHONEN.md` | heading present with 4 `[~]` lines, each with a pointer; SHONEN.md has 4 boxes and is unchanged | pass |
| cited commits exist and are ancestors of `master` | `git cat-file -t <h>` and `git merge-base --is-ancestor <h> master` for b5d77c4c, 7c42ef25, 2cde310f, 6444c12c, 0ff5134e, 63dcf7c2, bbdbf62f, b12a93cf, 90b9ff04 | 9/9 `commit`, 9/9 ancestor | pass |
| lane pushed, no leftovers | `scripts/hyaku/jj-lane.sh state …/tabi-shokunin`; `git status --porcelain`; `git ls-remote origin refs/heads/master` | `local=remote=b12a93cf… ahead=0 behind=0 head=detached tracked=0 untracked=0`; porcelain empty; remote `b12a93cf…` | pass |
| round commits by lane identity | `git log --format='%h %an %ae %cI' 90b9ff04..b12a93cf` | 8 commits, all `tabi-shokunin tabi@shokunin.local` | pass |
| prompt carries the template contract | `grep -n '^## ' .ufo/prompts/tabi-round-70.md` | §1 MISSION/AXES, §2 claims, §2b frontier, §3 L2 floor, §4 report contract (SHONEN rule at :118, :521), §5 commit/push, §6 hyaku addendum, §7 scratch | pass |
| instruments frozen before scored runs | `git show b12a93cf:<f> \| sha256sum` and `git log 90b9ff04..b12a93cf -- <f>` for the 10 entries in `.ufo/waves/round-70/freeze.txt` | all 10 digests equal the freeze; the only commit touching them is `b5d77c4c` (pre-freeze), plus `7c42ef25` for claims.json; scored receipt `startedAt 20:31:04Z` (17:31:04-03) comes after the freeze record (17:30:49-03) | pass |
| wave dispatched and settled | `jq '{seats, n:(.results\|length)}' .ufo/waves/round-70/w1-results.json` | 12 seats, 12 result rows | pass (rows carry no `status` field; r69 R4 still open, orchestrator-owned) |

Status: **ok**. The report is real, the work is checkable, and every commit landed and was pushed.

## 2. Per-claim re-check

### C1 — coverage (9): capability `chromium-synth-tap-gesture-linux`, predicate `C1-SYNTHTAP-LIVE`

| measure | command (mine) | observed |
|---|---|---|
| receipt before | `git show 90b9ff04:corpus/evidence/round70/chromium-synth-tap-gesture/receipt.json` | absent at base |
| receipt after | `sha256sum <receipt>` at b12a93cf | `0a51f3a6…d631`, equals the report |
| driver pin | receipt `.driverSha256`; `git show b12a93cf:scripts/chrome-cdp-synthtap-round70.mjs \| sha256sum` | both `704efab8…9577` |
| host | receipt `.host` | Chromium 155.0.8059.84 Arch Linux, CDP 1.3, `--headless=new` |
| producer | receipt `.cdpSendLog \| map(.method)` grouped | `Input.synthesizeTapGesture` ×7; no `dispatchMouseEvent` or `dispatchTouchEvent` |
| delivery per leg | receipt `.events` grouped by `leg,type,detail,pointerType` | mouse / hold: 1 click each (`detail:1`); double: 2 clicks, both `detail:1`; `dblclick` 0; default and touch: pointer(touch) + touchstart/touchend, no click; zero: no events; every event `isTrusted:true` |
| hold timing | pointerdown→pointerup `ts` per leg | mouse 58→108 (50 ms), hold 1358→1758 (400 ms), touch 6924→6974 (50 ms) |
| outside leg | `.legs[] \| select(.name=="outside") .cdpError` | `-32602 "Position out of bounds"` |
| (a) counter, evidence-verified | `scored/c1-counter-a.exit`, `c1-counter-a.json` | `exit 0`; `verdict clean`, 84 checks, findings [] |
| (b) live runs, evidence-verified | `scored/c1-verify-live-L1.{exit,json}`; `w1/R70Exec1/verify.{exit,json}` | L1 exit 0, predicate true, `pinSource frozen`, `agreement {crossRun:true, evidence:true}`, runs 12 351 / 12 397 ms, nonces `…4b1c940e20-a` / `…b9376c05cb-b`, ports 35509 / 41049; R70Exec1 exit 0, runs 12 368 / 12 380 ms, nonces `…c0940d9c31-a` / `…9d98733c71-b`. Every nonce differs from the scored `tabi-r70-scored-8a468fd6` |
| (c) battery, evidence-verified | `scored/c1-negatives-a.{exit,json}` | exit 0, `refusedForExpectedReason 95`, `failed []`, `checkIds 84`, `coverageGap []`, `positiveOk true` |
| (d) row and note | `git show b12a93cf:SCORECARD.md \| grep -c chromium-synth-tap-gesture-linux`; `grep -c S175 corpus/knowledge/chromium-synth-tap-gesture-runtime-round-70.md` | 3; 4 |
| knowledge | `git ls-tree -r --name-only <rev> corpus/knowledge \| wc -l` | 82 → 83 |

The reported values match the evidence: no receipt (counter exit 2) became clean on 84 checks, and
(a)–(d) hold at the tip. Leg (d) was false at `bbdbf62f`, as R70Critic recorded; the row landed
at `b12a93cf`, and the kill rule is judged at the lane tip.

R70Critic ruled C1 "FALSIFIED". That ruling is about the live verifier as an execution oracle,
not about the capability. Two same-user attacks green the real verifier with frozen pins: an
inherited `NODE_OPTIONS` preload (`verify-live-r70.mjs:158` spawns with no `env` option), and a
driver swap between the pin read (:122) and the spawn (:158). Both are reproduced in
`w1/R70Critic/receipts/c1-{env,toctou}-verifier.json`, exit 0. This refutes the frozen `limit`
sentence. It does not show that a scored run was forged. The scored and seat runs have none of the
attack's signatures: the runs take ~12 s each (the swap attack's runs took 24–26 ms), the nonces
and ports are verifier-drawn and all distinct, and the receipt is internally coherent with S175
(default → touch) and the PDL. R70Critic's own clean run, R70Exec1 (own driver and counter as
well), and R70Exec3 (48 variant runs) corroborate the physical capability. AXES admits a
capability row through a round that demonstrates it running, and this round does.

**Axis verdict: coverage — improved.** Re-measured: receipt digest, driver pin, producer log,
per-leg delivery, hold timings, outside error, run nonces and timings, row and note presence,
knowledge count. Evidence-verified: counter, battery, the L1 and R70Exec1 live verifier verdicts,
and the gate self-test (`scored/selftest-r70-gates.out`: `clean=true cases=7 failed=none`,
`exit=0`; registry rows at `SKILL.md:3154-3159`).

### C2 — operability (9): live re-derivation for `chromium-synth-scroll-gesture-linux`, predicate `C2-LIVE-R69`

| measure | command (mine) | observed |
|---|---|---|
| command before | `git cat-file -e 90b9ff04:scripts/verify-live-r70.mjs` | absent (matches the reported base `MODULE_NOT_FOUND`) |
| command after | `git show b12a93cf:scripts/verify-live-r70.mjs \| sha256sum` | `99442a2c…76b8`, equals the freeze; touched only by `b5d77c4c` |
| (a) L1, evidence-verified | `scored/c2-verify-live-L1.{exit,json}` | exit 0, predicate true, `pinSource frozen`, findings []; evidence `corpus/evidence/round69/…/receipt.json` sha256 `587100d9…7f8` (the r69 receipt's digest from the r69 closure); runs 10 416 / 10 380 ms, nonces `tabi-r69-live-38a1343737-a` / `-433da9b82c-b` |
| (b) independent seat, evidence-verified | `w1/R70Exec2/verify.json` | predicate true, `pinSource frozen`, findings [] |
| (c) controls, evidence-verified | `jq '.rows[] .holds' controls/summary.json \| sort \| uniq -c` | 31 true, `failing []` |

The reported before (exit 1) → after (exit 0, predicate true) matches. Before this round the r69
capability had only a form-only receipt counter (r69 R1). It now has a runnable command that
executes the frozen driver twice live and refuses the rewritten replay that the r69 counter
accepts (`controls/c2/r69-counter-accepts-rewrite` exit 0 vs `forger-rewrite` exit 1). This is the
artifact that AXES names as operability's signal. The R70Critic env bypass and R70Review2 F1
(evidence leg binds bytes at a path, not provenance) limit how strongly the command proves the
capability. They do not remove the command. I agree with R70Critic's HOLDS-WITH-LIMIT.
**Axis verdict: operability — improved.**

### No axis harmed

`git diff --numstat 90b9ff04 b12a93cf | awk '$2>0'`: only `corpus/SOURCES.md` loses lines (3 2).
Those lines are the S173/S174 `used-by` extensions, an in-place change that CORPUS.md allows and the
lesson `## Gate` logs old→new. SCORECARD.md `21 0` (append-only round-70 block), SKILL.md `9 0`,
LOG.md `9 0`, QUALITY.md `4 0`, README.md `5 0`; PROVINCE.md and SHONEN.md are unchanged. No earlier
score was lowered and no entry was rewritten. Calibration: the frozen C1 `limit` sentence
overclaimed. The lane did not let it stand: the SCORECARD round-70 block carries a calibration
note that reports the refutation, and lesson Mistakes row 4 records it. No SCORECARD or SHONEN entry
contradicts repo state, so calibration is unchanged, not harmed.

## 3. Per-axis verdicts

| axis | claim | verdict |
|---|---|---|
| coverage | C1 | improved |
| operability | C2 | improved |
| adjacency | — | unchanged |
| depth | — | unchanged |
| freshness | — | unchanged |
| calibration | — | unchanged |

Every declared claim verifies and no axis is harmed: **admitted**. Neither claim is exploratory.

## 4. Discernment spot-check (`corpus/lessons/round-70.md` `## Gate`)

| item | decision | re-opened source | agree/disagree | reason |
|---|---|---|---|---|
| `corpus/knowledge/chromium-synth-tap-gesture-runtime-round-70.md` (S175, S174, S173) | admit | live Gitiles `…/155.0.8059.84/content/common/input/synthetic_tap_gesture.cc?format=TEXT`, base64-decoded; committed receipt | agree | decoded bytes sha256 `ac27658f…d331`, 134 lines, equal to the staged digest; lines 22-25 rewrite `kDefaultInput` to `kTouchInput`; lines 100-109 release at once for `duration_ms == 0`, otherwise `WAITING_TO_RELEASE`; the receipt's default leg equals its touch leg, and the measured holds are 50/400 ms |
| "`tapCount:2` performs a double-click" (S173 Input.pdl:326) | reject | live Gitiles `…/Input.pdl?format=TEXT`, base64-decoded (sha256 `5bbc6e23…6e3d`, equal to the S173 row's staged digest); receipt double leg | agree | line 326 reads "Number of times to perform the tap (e.g. 2 for double tap, default: 1)"; the receipt has 2 clicks, both `detail:1`, and 0 `dblclick`. The flip condition is well-posed. R70Exec3's `setEmitTouchEventsForMouse` double-click is correctly kept as a scope limit, not a contradiction |
| "an omitted source uses the platform's preferred input" for taps (Input.pdl:328-329) | reject | same decoded PDL; decoded S175:22-26 | agree | PDL :328-329 says "queries the platform for the preferred input type"; S175 unconditionally rewrites default to touch at this tag, and the receipt agrees |
| "a synthetic touch tap clicks" | reject | receipt default/touch legs; `w1/R70Exec3` summary in the lesson | agree | 0 clicks on both touch legs; R70Exec3's 24 variants × 2 never click. The verdict is scoped to this host, with a flip condition |

New SOURCES row re-opened: **S175**. Lesson quote 1 (lines 24-25, "params().gesture_source_type =
content::mojom::GestureSourceType::kTouchInput;", one statement) is on decoded lines 24-25. Quote 2
"if (params().duration_ms == 0) {" (6 words) is on decoded line 100. Both are ≤25 words and located.
No W04 duplicate fires for S175.

Census: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` → exit 0,
`tabi ok …/corpus/SOURCES.md`, W04 cross-scope duplicate warnings only (S058…S173). Rows 174 → 175
(`grep -c '^| S[0-9]'` at base and after).

Result: 4/4 agree, both sides of the gate sampled.

## 5. Trend verdicts

- **expansion — improved.** Knowledge 82 → 83 on ground no prior tabi note held
  (`Input.synthesizeTapGesture` delivery); SOURCES 174 → 175 (S175 tier A, mined); capability row
  `chromium-synth-tap-gesture-linux`.
- **quality — improved.** The admitted r69 capability re-verified live on today's host. The C2
  runs are counter-clean, and their evidence fingerprint agrees with the committed r69 receipt
  (`587100d9…7f8`), so a stale entry re-verified and no admitted entry failed its re-check.
  QUALITY 131–132 were added, each with a Mistakes row behind it.
- **discernment — improved.** My outside check agrees 4/4 with the gate's admit and three rejects;
  the rejects set runtime and source against the PDL with flip conditions. The lane recorded its own
  attack seats' refutation of the C1 limit sentence instead of claiming past it. Both new QUALITY
  criteria are grounded in mined mistakes.

## 6. Routed defects (status-neutral; the lane fixes them next round unless marked otherwise)

- R1 `verify-live-r70` is not an execution oracle against same-user tampering: it inherits
  `NODE_OPTIONS` (no `env` on the spawn at :158), and the pin is read at :122 before the spawn
  (TOCTOU). Both profiles are affected. `wallMs` is recorded but never checked (R70Review2 F4), and
  the evidence leg binds bytes at a path, not provenance (F1). The lane's r71 plan is the right
  repair: private snapshot, re-hash after the runs, sanitised env, wall-time floor, and a negative
  for each.
- R2 The frozen claims.json C1 `limit` sentence is falsified. Per §Evidence standard, it needs a
  named correction entry appended next round. The SCORECARD calibration note and lesson Mistakes
  row 4 report it, but no correction entry names it.
- R3 `check-synthtap-r70` is form-only: R70Review1 FG1–FG16 craft receipts that pass it, and
  R70Mut1 shows 21/31 mutants surviving the battery. QUALITY 132 proves id coverage, not kill
  power; isolate each negative.
- R4 Both frozen drivers lack a child-exit listener. A Chromium launch failure (socket path >
  TMPDIR + 45 bytes) makes them wait ~240 s (R70Exec4). The verifier guard is exact only for
  symlink-free paths.
- R5 Adjacency carry-overs, not absorbed: kama `none → adjacent` (R70Connector), the kotoba
  two-sided label disagreement (r69 R5, L0 `tabi | round-69`), and 9 of 20 sibling heads moved
  since the r69 matrix snapshot.
- R6 Carried: 5 pre-existing missing registry rows (r69 R6). `w1-results.json` rows carry no
  per-seat `status`; this is routed to the hyaku orchestrator, which writes that file (r69 R4).
- New L0 `tabi | round-70` (is same-user env/TOCTOU tampering in scope for live-verifier
  admission?) is open for the operator. This closure graded C1 on the demonstrated capability,
  not on oracle strength.
- Operator note: SHONEN box 2 ("At least one end-to-end domain task executed and logged in
  LOG.md") looks checkable by a non-author. This pass re-read the scored tap receipt's producer
  log, per-leg events and timings, and `LOG.md` `## Round 70` at `b12a93cf:3711`. Box 4 remains as
  noted at r69. Promotion is operator-owned; no `[x]` was written.
