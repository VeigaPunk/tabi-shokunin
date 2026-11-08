# R85Exec3 — round 85 / w1 — C2 witness families + C1 forgery controls

Seat: R85Exec3 (leaf executor). Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin` @ base `c574d593`.
Freeze: `5c1961525e83efe2682cab389b8995d67c0ab4f0`, D `dbecb1a18905`, nonce `tabi-r85-l1-dbecb1a18905`.
Read-only on the lane: **no lane file was created, modified or deleted. No git/jj mutation was run. No packages installed.**

Every number below was measured in this session. Nothing is quoted from another seat's report.

---

## 1. C2 — witness-families-r85.mjs, the counting command

```
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/witness-families-r85.mjs \
  --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --work /fast/scratch/hyaku/tabi-r85/R85Exec3/w --json
```

**Measured exit code: 0.** Wall time 129.28 s.

Summary block, verbatim from stdout:

```json
"before": { "families": 6,
  "survivors": ["cross-access-dropped","cross-childseq-dropped","cross-childact-before-dropped"],
  "killed": 3, "crashed": [], "unapplied": [] },
"after":  { "families": 6, "survivors": [], "killed": 6, "crashed": [], "unapplied": [] }
```

### Per-family outcome (both generations)

| family | before (r84 counter × r84 battery) | after (r85 counter × r85 battery) |
|---|---|---|
| `cross-message-unpinned` | killed — 1 failed, first `cross-origin-tel-message` | killed — 2 failed, first `cross-origin-tel-message` |
| `cross-childlate-dropped` | killed — 1 failed, first `cross-origin-text-late` | killed — 2 failed, first `cross-origin-text-late` |
| `cross-access-dropped` | **survived** — exit 0, 162 cases, 0 failed | killed — 1 failed, first `cross-tel-crossaccess` |
| `cross-childseq-dropped` | **survived** — exit 0, 162 cases, 0 failed | killed — 1 failed, first `cross-tel-childseq` |
| `cross-childact-after-dropped` | killed — 1 failed, first `cross-origin-search-activation` | killed — 2 failed, first `cross-origin-search-activation` |
| `cross-childact-before-dropped` | **survived** — exit 0, 162 cases, 0 failed | killed — 1 failed, first `cross-tel-childact-before` |

Before survivor list: `cross-access-dropped, cross-childseq-dropped, cross-childact-before-dropped` (3).
After survivor list: **none** (0). Killed 6/6, crashed 0, unapplied 0.

This matches the frozen C2 leg (a) exactly: before survivors 3, after survivors 0, exit 0. The runner's own exit predicate (`after.survivors == 0 && after.crashed == 0 && after.unapplied == 0 && before.survivors >= 1`) is satisfied.

---

## 2. C2 before-state, reproduced independently by hand

Method: a COPY of `scripts/check-showpicker-r84.mjs` was made per family under
`/fast/scratch/hyaku/tabi-r85/R85Exec3/m/<family>/` and the verbatim frozen
`scripts/negatives-showpicker-r84.mjs` was copied beside it, so the battery's
`path.join(HERE, 'check-showpicker-r84.mjs')` resolved to the weakened copy.
Each weakening was applied by hand to the exact conjunct, not via the witness runner:

- `cross-message-unpinned`: `same(ex.childResult, CHILD_RESULT_LAW[extra])` → `isObj(ex.childResult) && ex.childResult.ok === … && …name === …name`
- `cross-childlate-dropped`: ` && ex.childLate === 0,` → `,`
- `cross-access-dropped`: `same(ex.parentCrossAccess, { contentDocument: null, windowDocument: 'SecurityError' })` → `isObj(ex.parentCrossAccess)`
- `cross-childseq-dropped`: `same(arr(ex.childEvents).map(…), CHILD_EVENT_SHAPE[extra].seq)` → `arr(ex.childEvents).length === 5`
- `cross-childact-after-dropped`: `same(ex.childActivationAfter, CHILD_ACT_LAW[extra][1])` → `isObj(ex.childActivationAfter)`
- `cross-childact-before-dropped`: `same(ex.childActivationBefore, CHILD_ACT_LAW[extra][0])` → `isObj(ex.childActivationBefore)`

Each patched counter was then scored by the frozen r84 battery against the frozen
r84 receipt (`--expect-driver-sha256 f436b229…8807e`, `--expect-nonce tabi-r84-l1-31fc14c29f84`,
`--expect-fixture-sha256 da8178f1…b5df18`, `--prior-set .ufo/waves/round-84/controls/c1/prior-set.txt`).

| family | battery exit | cases | failed | outcome | failing case id(s) |
|---|---|---|---|---|---|
| `cross-message-unpinned` | 1 | 162 | 1 | **noticed** | `cross-origin-tel-message` |
| `cross-childlate-dropped` | 1 | 162 | 1 | **noticed** | `cross-origin-text-late` |
| `cross-access-dropped` | 0 | 162 | 0 | **NOT noticed (survives)** | — |
| `cross-childseq-dropped` | 0 | 162 | 0 | **NOT noticed (survives)** | — |
| `cross-childact-after-dropped` | 1 | 162 | 1 | **noticed** | `cross-origin-search-activation` |
| `cross-childact-before-dropped` | 0 | 162 | 0 | **NOT noticed (survives)** | — |

**The r84 battery notices 3 of 6 families** (`cross-message-unpinned`,
`cross-childlate-dropped`, `cross-childact-after-dropped`) and misses the same 3 the witness
runner reports as before-survivors. The independent hand-edit path and the runner agree; the
3-survivor before-state is not an artifact of the runner's own patch machinery.

Note a discriminating detail: the family weakenings are *weaker* than the r84 case-level
witnesses. `cross-origin-tel-message` in the r84 battery only rewrites `childResult.message`,
which the fully-pinned `same(...)` catches; after the family weakening the message pin is gone
and only `ok`/`name` remain, yet the case still fails — because the weakened form now also
demands `name === CHILD_RESULT_LAW[extra].name` where the r84 case's rewrite sets
`message` in place of a proper error; the battery's own `leg-*` shape check supplies the
second failure in the r85 generation (2 failed vs 1 before). So the before-kills come from the
r84 per-case witnesses, not from the family-specific case ids that exist only in r85.

---

## 3. C1 forgery controls

All three runs scored with the frozen r85 counter
`scripts/check-showpicker-r85.mjs` (pin `6239abdf…318a`), driver pin `1690c63d…b8ee`,
`--expect-nonce tabi-r85-l1-dbecb1a18905`, `--expect-fixture-sha256 9b71a949…db5d`,
`--prior-set .ufo/waves/round-85/controls/c1/prior-set.txt`. No lane file was written; the
copies and the mutated priors live under scratch only.

### 3a. Baseline (scored receipt unchanged)

- exit **0**, verdict `clean`, `checkCount` **87**, findings `[]`.
- Confirms the frozen instrument accepts the frozen scored receipt in this session and gives
  the reference `limit` block.

### 3b. Forgery: every page event `ts`/`at` shifted by a constant **+2.0 ms**

Copy of `corpus/evidence/round85/chromium-showpicker/receipt.json` with, for every leg and
every `pageEvents` element, `ts = round((ts+2.0)*10)/10` and `at = round((at+2.0)*10)/10`.
Leg `marks` were deliberately **not** moved (the driver's retimed must-accept case does the
same). Identity fields, launch tokens, devtools ids, server logs untouched.

- exit **0**, verdict `clean`, `checkCount` **87**, findings `[]` → **the shifted receipt is
  ACCEPTED. No ids fire.**
- `limit` block, verbatim:

```json
"limit": {
 "sentence": "refuse when absMatched >= ceil(0.5 * prior events); the escape minimum is priorEvents - absNeed + 1 moved events. The gap side is reported, not a refusal: this driver's fixed waits reproduce gap durations across honest runs, so a gap match is a driver artifact. A forger who moves fewer events but shifts EVERY event by a constant offset escapes this rule — that is the limit.",
 "tolerance": 0.05,
 "gapMin": 50,
 "ownEvents": 76,
 "ownGaps": 3,
 "perPrior": [
  {
   "priorEvents": 76,
   "priorGaps": 2,
   "absMatched": 0,
   "gapMatched": 0,
   "absNeed": 38,
   "gapNeed": 2,
   "escapeEvents": 39,
   "refused": false
  }
 ]
}
```

Baseline `limit` for comparison: `absMatched: 2` (the two accidental near-coincidences the
instrument tolerates), everything else identical. The +2.0 ms shift drives `absMatched` to
**0** against `absNeed` **38**; the refusal threshold is `absMatched >= 38`, so the forgery is
**9.5× under** the threshold. This is exactly the escape the frozen sentence names, and the
escape minimum is **39 moved events** (`priorEvents 76 − absNeed 38 + 1`). A +2.0 ms constant
shift moves all 76 events but keeps every *inter-event delta*, so `pairMatch` inside `TOL =
0.05 ms` finds nothing: the constant shift is strictly *stronger* as an evasion than moving
the minimum 39 events would be, because moving 39 leaves 37 events still matching and
`absNeed` is 38 — it would *just* miss. At `escapeEvents = 39` a forger must move at least 39
of 76, i.e. `absMatched ≤ 37 < 38`.

Measured consequence for the predicate: the frozen `limit` sentence is **true as written**,
and the scoring path's `accept-retimed` case (delta **+1.0**, `negatives-showpicker-r85.mjs:253`)
is the same escape at a 1.0 ms constant offset. The forgery detector is a *pair-match* over
absolute times, not a delta/signature check, which is why one constant offset defeats it
across the whole receipt.

### 3c. Forgery: the PRIOR receipt with the scored nonce

Copy of `.ufo/waves/round-85/controls/c1/probes/prior1.json` (nonce `tabi-r85-prior3-a1`,
24 legs, 76 page events, same driver pin) with `nonce` rewritten to `tabi-r85-l1-dbecb1a18905`
and the standard `rewriteNonce` propagation (serverLog/childServerLog `run` fields,
`Page.navigate` URLs, `Runtime.evaluate` expressions mentioning the old nonce,
`Page.frameNavigated` urls). Driver pin was already equal (same driver), so `driver-pin`
does **not** fire; the fixture hash and everything else was left at the prior's values.

- exit **1**, verdict `findings`, `checkCount` **87**
- **finding ids that fire: `fixture-hash`, `replay-event-timeline`, `replay-launch-token`, `replay-devtools-url`** (exactly 4)
- `limit` for this run: `priorEvents 76, priorGaps 2, absMatched 76, absNeed 38, gapMatched 2,
  gapNeed 2, escapeEvents 39, refused: true` → **the replay rule refuses at 76/76 matched
  (threshold 38)**.

Interpretation: replay protection is not defeated by rewriting the nonce. `absMatched 76`
saturates, and the three identity-token checks (`launchToken`, `devtools browserId`,
`fixture.sha256` which the prior cannot match because the fixture differs) fire independently.
So the prior-replay hole is closed **provided the forger does not also shift the timeline**;
combining 3c with 3b is the residual: rewrite the nonce **and** shift every event by a constant
⇒ `replay-event-timeline` stops firing, and only `fixture-hash` / `replay-launch-token` /
`replay-devtools-url` remain as identity-token defenses (a forger who also fabricates
tokens/ids and a fixture hash would clear them). This is the same `limit` the frozen sentence
publishes, and it is the C1 `limit` block's own text.

### Retained evidence, exact

| control | exit | verdict | checkCount | finding ids |
|---|---|---|---|---|
| baseline scored receipt | 0 | clean | 87 | `[]` |
| every page event +2.0 ms | 0 | clean | 87 | `[]` |
| prior nonce → scored nonce | 1 | findings | 87 | `fixture-hash, replay-event-timeline, replay-launch-token, replay-devtools-url` |

Per-run `limit` numbers (ownEvents, ownGaps, absMatched/absNeed, gapMatched/gapNeed,
escapeEvents, refused) are in the `limit` blocks quoted above; baseline and +2.0 ms share
`ownEvents 76 / ownGaps 3 / absNeed 38 / gapNeed 2 / escapeEvents 39`.

---

## 4. Risk / calibration notes

1. **The +2.0 ms constant shift is accepted by design, not by defect.** The frozen `limit`
   sentence states it; the `accept-retimed` must-accept case at delta +1.0 pins the behavior
   as *intended*. So C1's replay rule is a *copy-of-the-timeline* detector, and its coverage
   is: identical times → refused; constant-shifted times → accepted; ≥39 events moved
   non-constantly → refused. Worth stating in the C1 predicate prose if it is not already:
   the `limit` block only names "shifts EVERY event by a constant offset", it does not name
   the minimum displacement at which a *non-constant* forgery trips, which is the same 39.
2. **Before-kill attribution.** The 3 before-kills come from r84 per-case witnesses
   (`cross-origin-tel-message`, `cross-origin-text-late`,
   `cross-origin-search-activation`), all of which are *pre-existing* r84 cases; the six new
   r85 family cases (`cross-tel-*`) only fire in the after generation. So "3 of 6 families
   survive the frozen r84 battery" is true, and the r84 battery's teeth on those three are
   incidental (case-level field rewrites) rather than family-specific. This does not weaken
   C2 — after is 0/6 with the six dedicated cases — but the *before* number is not evidence
   that the r84 battery was family-aware.
3. **`cross-message-unpinned` and `cross-childlate-dropped` after-runs show 2 failures vs 1
   before.** The extra failure is the r85 `leg-*`/shape check reacting to the same mutation;
   the `firstFailure` is the same case id in both generations. Consistent, not contradictory.
4. **Run-window and battery timing.** The witness runner took 129 s (12 counter×battery runs,
   two of them the 162-case batteries at ~35 s per 6-family sweep and ~20 s each for the
   survivors). No crash, no timeout: `crashed: []`, `unapplied: []`.
5. **Fixture hash difference is load-bearing for 3c.** `prior1.fixture.sha256 =
   ba71ea58…a273` ≠ scored `9b71a949…db5d`, so `fixture-hash` fires independently of the
   replay rule. A forger who copies the *scored* receipt and only shifts times (3b) has a
   matching fixture hash and is accepted; a forger who replays the *prior* (3c) is caught
   even before the replay rule by the fixture pin.
6. **Not measured here / outside this seat:** the 175-case C1 battery exit, coverage 87/87,
   kill power 58 mutants, and the 9 selftest gates. Those are other seats' legs; this report
   does not assert them.

---

## 5. Hygiene

- Lane writes: **none**. `git status`-equivalent inspection was not needed and no mutating
  git/jj command was run.
- Scratch: `/fast/scratch/hyaku/tabi-r85/R85Exec3/` (driver `drv.mjs`, `w/` runner work dirs,
  `m/<family>/` patched counters + battery copies + `battery.json`, `f/` forgery copies +
  `forgery-result.json`). **Deleted at the end of this session.**
- Installs: **none** (no `uv tool`, `npx`, `~/.local/bin` or pacman transaction was run;
  pacman is paused host-wide anyway).
- No subagent was dispatched; no `labrat` probe was needed.
