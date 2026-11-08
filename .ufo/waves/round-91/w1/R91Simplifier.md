# R91Simplifier — r91 instrument family: YAGNI / dead-weight review

Seat: read-only simplifier, round 91 wave `w1`. Lane `tabi-shokunin`, base `b1d8f07b`.
No lane file was edited. Deletions made: **none** (the six instruments are frozen by
`.ufo/waves/round-91/freeze.txt`; every recommendation is a next-freeze candidate). I propose no
amendment to any predicate, counter, pin, prior, threshold or kill rule; where a recommendation
would change a check set or the receipt schema it is marked **schema**.

Axes: operability (a reader can tell what is measured and what is not), measurement integrity
(no clause is carried that cannot decide), reviewability (one authority per fact).

## 1. Preserved contract — verified, not assumed

The six instrument bytes on disk are exactly the D3 freeze pins (`.ufo/waves/round-91/freeze.txt:1-6`):

| instrument | sha256 |
|---|---|
| `scripts/chrome-cdp-showpicker-proxy-round91.mjs` | `343eb0f2…e33015` |
| `scripts/check-showpicker-proxy-round91.mjs` | `f2f052f2…edb03e` |
| `scripts/negatives-showpicker-proxy-round91.mjs` | `6475f056…fe78cb` |
| `scripts/kill-power-proxy-round91.mjs` | `570cffbf…845910` |
| `scripts/selftest-r91-gates.mjs` | `988c18e5…577bc26` |
| `scripts/check-record-drift-round91.mjs` | `e2e51c6b…2ffda3` |

Measured this seat (read-only runs, scratch under `/fast/scratch/hyaku/tabi-r91/R91Simplifier/`):

* counter over the scored receipt: `clean`, **checkCount 30**, 0 findings (driver/fixture/nonce pins as in `claims.json`).
* battery: **44 cases, 0 failed** (positive control green).
* counter `--selftest`: `ok:true` (`firstOk`, `secondOk`).
* drift `--selftest`: `ok:true`, **8 cases**, `cleanFailed: []`.
* scored receipt identity: nonce `tabi-r91-l1-1d073adc0b8d`, driver `343eb0f2…`, 15 legs,
  `fixture.same.sha256 === fixture.child.sha256 === 01380a98…`, `stateAfterDismiss === parentState`
  in **15/15** legs, `interceptResult === interceptError === null` in **15/15** legs.
* kill power (32 mutants) was **not** re-run here (32 × 44 counter spawns); the wave receipts are
  the evidence for 32/0/0/0. Structural claims below are read from the source.

## 2. Priority list (what to fix first)

**P1 — measurement integrity**

| # | Where | Finding | Recommendation |
|---|---|---|---|
| X-1 | `claims.json` `C1.pins` / `C2.pins` vs `freeze.txt:1-6` | The two pin tables **already disagree** for the two instruments touched after D1: claims say `selftest-r91-gates.mjs = e151c99a…` and `check-record-drift-round91.mjs = 466496e1…`; freeze.txt and the bytes on disk say `988c18e5…` and `e2e51c6b…`. `freezeHistory` D2/D3 name both files as changed, so the two tables cannot both be the measurement-time and the current identity, and neither is labelled. The observable defect is that they disagree and nothing compares them. | Do **not** edit a pin. Label the claims table (measured-at vs current) and derive one from the other at the next freeze, plus a read-only cross-check (claims pins == freeze pins) that goes red on disagreement. |
| X-2 | `.ufo/waves/round-91/freeze.txt:10`, `.ufo/waves/round-91/freeze.sh:19-21` | The freeze comment claims “the scored nonce is `tabi-r91-l1-12cbe8a0267f`” (the **D3** digest). The scored receipt, `claims.json` and `expectations.json` all use `tabi-r91-l1-1d073adc0b8d`. `freeze.sh` recomputes `DIGEST` and rewrites that sentence on every re-freeze, so each later freeze manufactures a nonce that was never scored. A reader following freeze.txt scores with the wrong nonce and gets exit 1. | `freeze.sh` should append only `# digest <d>`; the scored nonce has exactly one owner (claims/expectations, already correct in `freezeHistory`). One-line script change, no predicate impact. |
| G-4 | `scripts/selftest-r91-gates.mjs:29,43` | The runner records `checkCount` (30 / 44 / 32 / 8) into `gates[]` but `clean = gates.every(g => g.exit === 0)` ignores it. A battery that silently shrinks (or a counter that loses checks) still passes the gate. The count column is write-only. | Compare the recorded counts with `expectations.json` (add `checks:30, cases:44, mutants:32, drift:8`) and fail on mismatch. Until then the claimed counts are not gated. |
| N-1 | `scripts/check-showpicker-proxy-round91.mjs:206` | `host-node` is the **only check with zero negative coverage**: no battery case (`negatives-showpicker-proxy-round91.mjs:38-83`) and no kill-power mutant (`kill-power-proxy-round91.mjs:37-70`). A regression in that branch is unmeasured in both directions. | Add one case `{ id:'host-node', mutate: r => { r.host.node='v99.0.0' } }` and one mutant (`… === HOST.nodeMajor` → `true`). Both change the frozen case/mutant counts → next freeze. |
| N-2 | `scripts/negatives-showpicker-proxy-round91.mjs:46-48` | `fixture-pins` has three arms; the battery mutates parent and same only. The `fx.child.sha256 === expectChild` arm (`check-showpicker-proxy-round91.mjs:201`) has no independent negative, and the bundled kill-power mutant removes all three arms at once, so it is killed by the parent/same pin cases and does not prove the child arm is live. A dead child arm would stay green everywhere. | Add `{ id:'fixture-child-pin', expect:'fixture-pins', mutate: r => { r.fixture.child.sha256='b'.repeat(64) } }`. |
| K-1 | `scripts/kill-power-proxy-round91.mjs:88-90` | A battery **crash** is scored `killed`: only `status===0 && j.ok===true` means survived; exit 2 / timeout / unparseable stdout also land in `killed`, inflating kill power with harness failures. The `crash` bucket covers only mutant application/`node --check`. | Treat battery exit ∉ {0,1} or missing JSON as `crash`; kill power then fails instead of silently counting the failure as a kill. |
| K-2 | `scripts/kill-power-proxy-round91.mjs:35` | The tool reads the counter from disk and never checks it against the frozen pin. Mutating whatever bytes are present is reported against the claim. | Accept `--expect-counter-sha256` (the style already used for the driver) and refuse on mismatch. |
| K-3 | `scripts/kill-power-proxy-round91.mjs:3-4` vs `:88` | The header says a mutant must fail “the case whose expected finding the mutant removed”; the code only requires *some* case to fail (`j.ok === true`). A mutant that breaks an unrelated case is credited as killed. | Give each mutant an `expectCase` and require that case to be the red one. |
| N-3 | `scripts/negatives-showpicker-proxy-round91.mjs:101` | `ok = r.status === 1 && ids.includes(c.expect)` is “at least”: a case is green if unrelated checks also fire. `results` already carries the full `findings` array, so the assertion is free. | Record `extra = ids.filter(i => i !== c.expect)` and fail a case whose mutation produced findings outside its declared set. Converts “at least” to “exactly” without touching the frozen counter. |
| C-8 | `scripts/check-showpicker-proxy-round91.mjs:427-430` | `host-argv`'s `profile` slot is **self-referential**: `profile` is read out of `l.argv` and then placed into `want`, so `same(a, want)` cannot constrain the `--user-data-dir` path. The only live assertion is `path.basename(profile).startsWith('profile')`. A run reusing a shared profile passes. | Pin the path shape: for plan index *i*, assert `path.basename(path.dirname(profile)) === 'leg-' + String(i+1).padStart(2,'0')` (or record `legDir` in the receipt and compare). Removes a wildcard slot from a 17-slot argv pin. |

**P2 — dead logic, duplicated authority, dead parameters**

| # | Where | Finding | Recommendation |
|---|---|---|---|
| D-1 | `chrome-cdp-showpicker-proxy-round91.mjs:85` | The singleton-socket length loop is hard-coded `i <= 15` while the plan is `LEGS` (`:167`); adding/removing a leg silently skips/overruns the check. | Hoist `LEG_COUNT`/use `LEGS.length` (move the block below `LEGS`, it is currently in TDZ) so one constant governs both. |
| D-2 | `chrome-cdp-showpicker-proxy-round91.mjs:277` | Of the three sweep needles `[legDir, runCrashDb, 'profile-' + launchToken]`, two can never match: `runCrashDb` is a subpath of `legDir`, and `launchToken` never appears in any path or argv (the profile dir is `<legDir>/profile`). The sweep is effectively one needle. | Either drop the two dead needles or name the profile dir `profile-<launchToken>` so the token is a real isolation handle. |
| D-3 | `chrome-cdp-showpicker-proxy-round91.mjs:239,395` | `interceptResult` / `interceptError` are declared but **never written** (the `Page.setInterceptFileChooserDialog` response is discarded); both are null in 15/15 receipt legs and no clause reads them. `interceptSendId` is written but never bound. | Capture the send result into the two fields, or remove them. Bind `interceptSendId` to the log entry the way `directSendId`/`postSendId`/`dismissSendId` are bound. |
| D-4 | `chrome-cdp-showpicker-proxy-round91.mjs:517` + `check-showpicker-proxy-round91.mjs:400` | `stateAfterDismiss = parentState` is a copy of the value read immediately before, and the counter re-checks it against `[]`. On any driver-produced receipt the clause can never fire unless the `parentState` clause already fired (15/15 equal). | Read `PARENT_STATE` a second time after the dismiss send (what the name promises), or delete the field and clause at the next schema bump (**schema**). |
| D-5 | `chrome-cdp-showpicker-proxy-round91.mjs:378,383-388` | `evalValue(expression, extra = {})`: `extra` is never supplied (12 call sites, all single-argument); `evalInContext` is a near-copy of it. | `const evalInContext = (ctx, expr) => evalValue(expr, { contextId: ctx })`, delete the duplicate. Behaviour identical. |
| D-9 | `chrome-cdp-showpicker-proxy-round91.mjs:281-283` | The child document is built twice with identical arguments (`sameHtml = childHtml(PARENT_ORIGIN)`, `childHtmlPage = childHtml(PARENT_ORIGIN)`), so `sameSha256 === childSha256` by construction (true in the scored receipt) and the two separate `--expect-same-sha256` / `--expect-child-sha256` pins carry one value. | Build it once (`const childDoc = childHtml(PARENT_ORIGIN)`), serve it at both paths, and state in the comment that the equality is the same-element law, not independent evidence. Keep both pins (frozen CLI). |
| C-3 | `check-showpicker-proxy-round91.mjs:447-453` | `reproduced` can never decide the verdict: if `priors.length >= 2 && priorBad.length === 0`, every prior compared equal and `reproduced` is necessarily true; if it is false, `priorBad` is non-empty and the check fails anyway. | Delete the variable and the `&& reproduced` conjunct (keep it in the detail string if wanted). Behaviour identical. |
| C-4 | `check-showpicker-proxy-round91.mjs:213` | `legs.length === PLAN.length` inside `leg-records` is subsumed by `plan-frozen` (`:210` compares the full tuple arrays; a length difference already fails there). | Drop the length conjunct; `plan-frozen` is the sole length authority. |
| C-5 | `check-showpicker-proxy-round91.mjs:212` | `leg-order` is a strict subset of `plan-frozen`: the name sequence is one field of the tuples plan-frozen compares, so `leg-order` can only fail when `plan-frozen` fails. It survives only as attribution for the battery's `plan-order` case. | Keep only if per-check attribution is wanted; otherwise fold the name list into `plan-frozen`'s detail and delete the check (the battery case then expects `plan-frozen`). |
| C-7 | `check-showpicker-proxy-round91.mjs:234` | `isObj(el.parent.elements) === false` is dead: `arr()` maps every non-array to `[]`, so any value passing `arr(...).length === 1` is an array, for which `isObj` is already false. | Keep `arr(el.parent.elements).length === 1 && arr(...)[0].id === 'ps' …`. |
| C-9 | `check-showpicker-proxy-round91.mjs:62` | `JSON.stringify(out, selftestAsJson ? null : null, …)` — both arms are `null`. | `JSON.stringify(out, null, selftestAsJson ? 1 : 0)`. |
| G-2 | `selftest-r91-gates.mjs:9,11` | `fileURLToPath` import and `const SELF` are unused (only `tools()` is used). | Delete both. |
| G-3 | `selftest-r91-gates.mjs:26` | `run(name, cmd, args, timeout = 600000)` — the `timeout` parameter is never overridden; all five calls pass four arguments. The battery and kill power have very different runtimes and get the same 600 s. | Delete the parameter, or set the two slow gates explicitly instead of inheriting a default that hides the difference. |
| G-5 | `selftest-r91-gates.mjs:37-41` | The runner runs the drift gate's `--selftest` but never the drift counter over the lane, so the runner's `clean` says nothing about the eight statements it advertises. This is deliberate (D2: the earlier drift-over-lane gate was circular with the artifact the drift gate reads). | Record the tradeoff in the header/claims (“the runner does not measure C2”), or run the counter after the artifact is written and accept one extra ordering step. No change proposed for r91. |
| R-1 | `check-record-drift-round91.mjs:42` | `export function statements` has no importer in the lane (only the three internal calls at `:165,:174,:194`; `--revision` is not used by any caller either). | Drop `export`. |
| R-2 | `check-record-drift-round91.mjs:10,21,199-200` | `--revision` is parsed and echoed into the payload; no statement and no caller uses it. A caller can believe the gate measured at that revision. | Remove the flag and payload field, or implement it (`git show <rev>:path`); today it is a no-op one keystroke from a false claim. |
| R-3 | `check-record-drift-round91.mjs:67` | The `note-plan-calls-claim` guard tests `/plan-calls\`? check now:/`, a phrase that does not occur in the note (verified). It pins wording, not the defect; the live assertion is the `send-log-allowlist` presence check above it. | Delete the arm, or assert the semantic the note now carries at `corpus/knowledge/chromium-showpicker-runtime-round-90.md:22` (“`send-log-allowlist`, not `plan-calls`”). |
| R-4 | `check-record-drift-round91.mjs:130-132` | Statement 8 takes `Object.keys(claims).slice(0, 3)` and requires `ids.length <= 3`, so a fourth claim is silently ignored: 4 claims + 3 SCORECARD rows is green. | Drop the slice and fail when the claim count exceeds the asserted maximum (or compare the full sets). |

**P3 — verbatim dead weight**

| # | Where | Finding | Recommendation |
|---|---|---|---|
| D-6 | `chrome-cdp-showpicker-proxy-round91.mjs:275` | `rec.answer.hex` is the answer bytes in hex; the counter checks `name/size/sha256` only. The bytes now live in two forms in every receipt. | Drop `hex`; keep `sha256` (or vice versa, not both). |
| D-7 | `chrome-cdp-showpicker-proxy-round91.mjs:320,493` | `sweepRounds` and `chooserWaitMs` are recorded and never read. In the scored receipt `chooserWaitMs` is 2002-2020 ms on the 10 legs with no chooser and exactly 0 on the 5 legs that opened one, i.e. it is the loop-cap marker; nothing checks that split. | Bind `chooserWaitMs` to the law (`choosers.length > 0` ⇒ near 0; `=== 0` ⇒ near `OPEN_WAIT_MS`) and `sweepRounds < SWEEP_MAX_ROUNDS`, or drop them (**schema** to drop). |
| D-8 | `chrome-cdp-showpicker-proxy-round91.mjs:442,453` | `parentPadElement` / `childPadElement` record the click target (“pad”/“cpad” in the receipt) and no clause reads them; the proof that the click landed on the intended target is indirect (event stream only). | Assert `parentPadElement === 'pad'` / `childPadElement === 'cpad'` on the legs that declare the pad. One line each. |
| C-1 | `check-showpicker-proxy-round91.mjs:188` | 21 of 78 `LEG_KEYS` are never read outside the exact-key check (list below), and `interceptResult`/`interceptError` are never even written. | See C-2 for the cheap bindings; trim the rest at a schema bump. |
| C-2 | `check-showpicker-proxy-round91.mjs:188` | Unread fields that are cheap to bind: `interceptSendId`, `replySendId`, `proxySendId`, `proxyLogSendId` (each has a written id that nothing cross-checks against `cdpSendLog`), `parentSha256/sameSha256/childSha256` per leg (only leg 0 feeds `receipt.fixture`), `cdpProduct/cdpProtocolVersion` per leg (only leg 0 feeds `host`), `actionAt`, and receipt-level `failures` (never read). | One-line laws: each send id equals the `cdpSendLog` entry for its method/expression; `legs.every(l => l.sameSha256 === receipt.fixture.same.sha256 …)`; `legs.every(l => l.cdpProduct === host.cdpProduct)`; `r.failures.length === 0`. |
| G-1 | `selftest-r91-gates.mjs:2` | “runs the six instruments” — there are five `run()` calls (`:37-41`); claims `freezeHistory.D2` itself says “the five instrument gates”. | Say five and name them. |
| X-3 | `claims.json` `C2.legs.c`, `SCORECARD.md` r91 C2 row | Both say the drift `--selftest` has “10 causal cases”; the artifact and the code have **8** (`check-record-drift-round91.mjs:153-162`, `w1/r91exec3-drift-selftest.json` cases=8, re-measured here). | State 8, or add the two missing injections (the §8 items 4/6 arms are deliberately excluded, so 8 is the honest number). |
| X-4 | `claims.json` `C1.legs.c` | “gate runner green (six gates)” vs the runner's five gates (and five is what `freezeHistory.D2` says). | Record five; this is claim text, not a predicate, but it is the same stale numeral as G-1. |
| M-1 | `check-showpicker-proxy-round91.mjs:393-397` | The answer facts are written three times: the driver's `'tabi-r91-answer-alpha\n'` (`driver:272`), the counter's `['tabi-r91-answer.txt', 22, 'text/plain']` and `sha256(Buffer.from('tabi-r91-answer-alpha\n'))`. The counter can derive the first two from the already-pinned `l.answer` descriptor. | Compare `l.childState` to `[[l.answer.name, l.answer.size, 'text/plain']]`; leave the literal only in the driver (the descriptor itself is separately pinned to name/size/sha256). |
| M-2 | `check-showpicker-proxy-round91.mjs:134-160` | The `expr` table is a hand copy of the driver's expression constants (`driver:141-162`), including the click coordinates (`360,820`, `490,60`) and the fallback origins `19901/19903` (`:132-133`). Drift is loud (`send-log-allowlist`/`plan-calls` go red), so this is a maintenance cost rather than a silent risk — except the fallback origins, which are overwritten before use and only matter if `ports.http` is non-integer (then `ports-declared` also fails). | Emit the expression table in the receipt and pin it, or at minimum share the coordinate constants. No change required now. |

**Selftest duplication (explicitly asked)**

`check-showpicker-proxy-round91.mjs:17-70` duplicates the battery twice:

* case 2 (`:44-60`, decision at `:56`) is a **literal duplicate** of `negatives-showpicker-proxy-round91.mjs:76` — same leg `sp91-xo-proxy-file-noact`, same mutation `{...l.proxy, ok:true, ret:'undefined'}`, same expected id `proxy-law`.
* case 1 (`:30-42`, decision at `:39`) duplicates the intent of `negatives:50` (`r.schema = 'not-the-schema'` → `schema`) with a fabricated carrier receipt.

The drift gate's `--selftest` (`check-record-drift-round91.mjs:139-190`) is **not** duplicated by any other script. Recommendation: keep one authority. Either drop the counter's `--selftest` (and the runner's `counter-selftest` gate) or replace its two cases with cases the battery cannot express hermetically (receipt-unreadable / prior-unreadable exit 2). Either choice moves the claims' gate list, so it is a next-freeze decision.

## 3. Duplicated authorities: loud versus silent

| Duplicated fact | Copies | Drift detection |
|---|---|---|
| 15-leg plan | `driver:167-183` `LEGS` ↔ `counter:114-131` `PLAN` | loud (`plan-frozen`) |
| CDP expression strings | `driver:141-162` ↔ `counter:134-160` `expr` | loud (`send-log-allowlist`, `plan-calls`) |
| Receipt/leg field sets | driver literals (`:237-261`, `:185-193`) ↔ `counter:187-188` | loud (`receipt-fields`, `leg-records`) |
| Host/viewport/schema | `driver:40,43` ↔ `counter:76-78` | loud (`schema`, `host-chromium`, `host-argv`) |
| Answer text/size/name | `driver:272,275` ↔ `counter:393-397` | loud, but three copies (M-1) |
| Mutant source strings | `kill-power:37-70` ↔ counter source | loud (`unapplied` → exit 1) |
| Battery expected ids | `negatives:38-83` ↔ `counter` check ids | loud (case fails) |
| **Instrument pins** | `claims.json C1/C2.pins` ↔ `freeze.txt:1-9` ↔ `expectations.json` | **silent — already drifted (X-1)** |
| **Scored nonce** | `freeze.txt:10` ↔ `claims.json`/`expectations.json`/receipt | **silent — already false (X-2)** |
| same/child fixture shas | `driver:281-283` builds the child document twice; same shas `01380a98…` in the receipt and both CLI pins | structural, not a defect: both origins serve one template, so the two pin flags are one value by construction. Recommendation is only to build it once (`const childDoc = childHtml(PARENT_ORIGIN)`) and say why in the comment. |

The two silent rows are the only ones where a reader can be misled without a red gate. They are the
header of the priority list.

## 4. Deletion candidates, ranked (all are next-freeze; no edit made)

1. `freeze.sh:19-21` scored-nonce sentence (X-2) — one line, no predicate touched.
2. `selftest-r91-gates.mjs:9,11,26` unused import/`SELF`/`timeout` (G-2, G-3).
3. `check-showpicker-proxy-round91.mjs:447-453` `reproduced` conjunct (C-3) and `:213` length conjunct (C-4) — behaviour-identical deletions.
4. `check-showpicker-proxy-round91.mjs:62` `? null : null` (C-9).
5. `chrome-cdp-showpicker-proxy-round91.mjs:281-283` duplicate `childHtml` call (D-9), `:378` unused `extra` + duplicate `evalInContext` (D-5), `:277` dead sweep needles (D-2).
6. `check-record-drift-round91.mjs:42` `export`, `:21` `--revision`, `:67` dead phrase arm (R-1..R-3).
7. `chrome-cdp-showpicker-proxy-round91.mjs:239,395` never-written intercept result/error (D-3).
8. **Schema**: drop `stateAfterDismiss` + clause (D-4), `answer.hex` (D-6), `chooserWaitMs`/`sweepRounds` if unasserted (D-7), and the 21 unread `LEG_KEYS` (C-1). Each requires a receipt-shape change and therefore a re-score; not recommended inside r91.

Not worth deleting: the `leg-order` check (C-5) and `LEG_KEYS`' unread keys still serve
attribution and anti-forgery shape pinning respectively — they are low-value, not zero-value.
`census-start.txt`/`census-end.txt` were out of scope.

## 5. Evidence

```
# pins on disk == freeze.txt:1-6
sha256sum scripts/{chrome-cdp-showpicker-proxy,check-showpicker-proxy,negatives-showpicker-proxy,kill-power-proxy,selftest-r91-gates,check-record-drift}-round91.mjs

# baseline behaviour (read-only)
node scripts/check-showpicker-proxy-round91.mjs --lane $PWD --receipt corpus/evidence/round91/chromium-showpicker-proxy/receipt.json \
  --expect-driver-sha256 343eb0f2… --expect-nonce tabi-r91-l1-1d073adc0b8d --expect-parent-sha256 a6ecf367… \
  --expect-same-sha256 01380a98… --expect-child-sha256 01380a98… --prior-set .ufo/waves/round-91/controls/c1/prior-set.txt --json
# -> clean 30 []

HYAKU_SCRATCH=/fast/scratch/hyaku/tabi-r91/R91Simplifier node scripts/check-showpicker-proxy-round91.mjs --selftest --json
# -> ok:true firstOk:true secondOk:true ids=[lane,law,proxy-law,prior-set]

node scripts/negatives-showpicker-proxy-round91.mjs … --work /fast/scratch/hyaku/tabi-r91/R91Simplifier/battery --json
# -> cases 44 failed 0 ok true

HYAKU_SCRATCH=… node scripts/check-record-drift-round91.mjs --selftest --json
# -> ok:true cases 8 cleanFailed []
```

Coverage audit (static, over the frozen bytes): 30 check ids; battery cases expect 29 of them
(all but `host-node`); 32 kill-power mutants cover 24 ids (no mutant for `lane`, `nonce-shape`,
`receipt-fields`, `ports-declared`, `host-chromium`, `host-node`); 78 `LEG_KEYS`, 21 unread
(`actionAt`, `childPadError`, `childSha256`, `chooserWaitMs`, `crossError`, `crossResult`,
`directError`, `directResult`, `dismissError`, `dismissResult`, `interceptError`,
`interceptResult`, `interceptSendId`, `parentPadError`, `parentSha256`, `postError`, `postResult`,
`proxyLogSendId`, `proxySendId`, `replySendId`, `sameSha256`), of which `interceptResult` and
`interceptError` are never written.

Scratch `/fast/scratch/hyaku/tabi-r91/R91Simplifier/` was created for these runs and is removed
before yield; nothing was written outside this report.

## 6. Tradeoffs / what I deliberately did not attack

* The counter's strict `LEG_KEYS`/`RECEIPT_KEYS` shape is a forgery guard, so “unread” fields are
  not all dead weight; I separate the two never-written fields and the four unbound send ids from
  the merely unmeasured ones.
* `stateAfterDismiss` and the `leg-order` check are redundant only for driver-produced receipts /
  when `plan-frozen` is present; a forged receipt can still exercise them. Removing them narrows
  defence in depth, which is why they are P2, not P1.
* The gate runner not running the drift counter over the lane (`G-5`) is deliberate (D2: the
  earlier ordering was circular with the artifact the drift gate reads). I record the tradeoff —
  the runner's “clean” says nothing about the eight drift statements — and propose no change.
* No predicate, threshold, prior, kill rule or pin value is proposed for amendment; X-1/X-2 are
  duplication defects (two authorities for one fact), and the fix is to derive or cross-check, not
  to move a pin.
