# R84Mut1 — independent conjunct-level mutation sweep of `scripts/check-showpicker-r84.mjs`

Seat R84Mut1, round 84, wave w1. Scope: author a mutant set that is **not** the frozen
`scripts/kill-power-r84.mjs` list, apply each edit to the counter's own source, and run the
**frozen** battery against each mutant in seat scratch. Nothing in the lane was written except this
report; no commits, no git/jj mutations.

## 1. Instruments (bytes verified by hash)

| file | sha256 | role |
|---|---|---|
| `scripts/check-showpicker-r84.mjs` | `e88e9fc7…` | counter under mutation (matches `freeze.txt` and `claims.json`) |
| `scripts/negatives-showpicker-r84.mjs` @ `84ebfa95` (freeze commit) | `828dfcb7…` | **the frozen battery I ran** (matches `freeze.txt`) |
| `scripts/negatives-showpicker-r84.mjs` (working tree, other seats) | `42fcfedc…` at final hash | **not used**; it carries uncommitted edits |
| `scripts/chrome-cdp-showpicker-round84.mjs` | `f436b229…` | driver pin passed on every invocation |
| `corpus/evidence/round84/chromium-showpicker/receipt.json` | `29347958…` | the scored receipt |
| `.ufo/waves/round-84/controls/c1/prior-set.txt` | `968844b3…` | prior set (one line: `probes/prior1.json`) |

The working-tree battery changed under me during the wave (first read `ce6c246e…`, then `42fcfedc…`);
the pinned instrument is the freeze-commit blob, so I extracted it read-only with
`git show 84ebfa95:scripts/negatives-showpicker-r84.mjs > $S/frozen-battery.mjs` and verified
`828dfcb7…`. All 123 mutant runs and the baseline used those exact bytes.

## 2. Method

- Scratch: `$HYAKU_SCRATCH/tabi-r84/R84Mut1` = `/fast/scratch/hyaku/tabi-r84/R84Mut1`; pristine
  counter + frozen battery copied there; each mutant built as
  `muts/<id>/{check-showpicker-r84.mjs,negatives-showpicker-r84.mjs}` and deleted after its run.
- Authoring: 123 single-edit semantic mutants (`M01…M107`, `P1a…P9`), each editing exactly one
  rule — conjunct dropped, comparison inverted/relaxed, pin narrowed, superset accepted, or a check
  deleted. Every `from` string occurs **exactly once** in the frozen counter (verified before the
  run: `rows 123 / bad 0`); none was taken from `kill-power-r84.mjs`. The honest-run screen then
  separates true weakenings (clean honest receipt) from edits that merely break the rule (H).
- Baseline first, same detector, same bytes:
  `node base/negatives-showpicker-r84.mjs --lane <lane> --real <receipt> --expect-driver-sha256
  f436b229… --expect-nonce tabi-r84-l1-a5bdb15ec9a7 --expect-fixture-sha256 64817252…
  --prior-set .ufo/waves/round-84/controls/c1/prior-set.txt --work $S/base/work --json`
  → `EXIT=1`, `{"cases":156,"failed":3,"coverage":{"declared":80,"covered":74,`
  `"uncovered":["leg-sp84-cross-origin-tel","leg-sp84-cross-origin-search","leg-sp84-cross-origin-text",`
  `"sp84-cross-origin-tel-law","sp84-cross-origin-search-law","sp84-cross-origin-text-law"]}}`.
  The 3 failures are the three new legs' generic shape cases, each refused **only** as an `extra`
  finding: `got ["leg-sp84-cross-origin-tel","no-selection-law"] extra ["no-selection-law"]`
  (same for search/text). The pristine counter itself is clean:
  `EXIT=0 {"verdict":"clean","checkCount":80,"findings":0}`.
- Classification (case-level, because the exit code is constant — see §7.1):
  **K** = honest receipt still scores clean AND the mutant produces at least one failing battery
  case that the pristine baseline does not fail; **H** = the honest receipt itself no longer scores
  clean (the mutant is caught only through the accept path, no targeted case); **S** = the failing
  case set is exactly the baseline's 3, i.e. the battery cannot distinguish the mutant from the
  pristine counter; **crash** = the counter emits no JSON.
- Witnesses (§5): for 39 of the 51 survivors I built the smallest receipt that exercises the
  dropped rule and ran pristine and mutant counters on the **same bytes** — `A` = mutant accepts a
  receipt the pristine counter refuses, `M` = another independent check still refuses (the weakened
  conjunct is redundant), `X` = the mutant crashes instead of refusing.

## 3. Counts

| applied | K (new failing case) | H (honest-receipt only) | S (survived) | crashed | unapplied |
|---|---|---|---|---|---|
| 123/123 | 60 | 12 | **51** | 0 | 0 |

Battery exit code: `{"1":123}` — incl. the pristine baseline. **Survived/total = 51/123** on the
case set; on the frozen exit-code rule the same run reads 0/123 survivors (all "killed"), because
the baseline already exits 1. The honest-run screen is clean (`exit 0, 80 checks, 0 findings`) for
all 60 K and all 51 S mutants.

## 4. The three assigned probes (the r84 legs, specifically)

| probe | edit | honest run | battery | verdict |
|---|---|---|---|---|
| P1a | delete `'sp84-cross-origin-tel'` from `CHILD_RESULT_LAW` | exit 1, findings `["sp84-cross-origin-tel-law"]`, 80 checks | 156 cases fail (153 new) | **killed (H)** |
| P1b | delete `'sp84-cross-origin-search'` | exit 1, `["sp84-cross-origin-search-law"]` | 156 fail (153 new) | **killed (H)** |
| P1c | delete `'sp84-cross-origin-text'` | exit 1, `["sp84-cross-origin-text-law"]` | 156 fail (153 new) | **killed (H)** |
| P1d | delete all three entries | exit 1, all three `*-law` ids | 156 fail (153 new) | **killed (H)** |
| P2a | replace the three legs' message pin with `/SecurityError/` on the message | exit 1, all three `*-law` ids | 156 fail (153 new) | **killed (H)** |
| P2b | accept any message containing `SecurityError` **in addition** to the pin | clean | 3 (baseline only) | **SURVIVED** |
| P2c | three legs: `same(childResult, law)` → `isObj(childResult)` | clean | 3 | **SURVIVED** (w32 masked by `intercept-law`) |
| P2d | three legs: message pin dropped (ok+name kept) | clean | 3 | **SURVIVED** |
| P2e | all 11 cross legs: message pin dropped (ok+name+ret kept) | clean | 3 | **SURVIVED** — w10 accepted |
| P3 | `ACT_LAW['sp84-cross-origin-text']` after: `hasBeenActive: true → false` | exit 1, `["activation-law"]` | 154 fail (151 new) | **killed (H)** |

Why the three literal probes die without a targeted case: deleting a `CHILD_RESULT_LAW` entry makes
`CHILD_RESULT_LAW[extra]` `undefined` and `same(x, undefined)` is always `false`, so the law can
never pass; the literal `./SecurityError/` false-fails because the real message is
`Failed to execute 'showPicker' on 'HTMLInputElement': showPicker() called from cross-origin iframe.`
— the word `SecurityError` is the error **name**, not a substring of the message; and changing
`ACT_LAW` no longer matches the honest `{isActive:true,hasBeenActive:true}` transition. All three
are *strengthenings* that the honest receipt detects; none tests the battery's case set.

**Which survives:** the *weakenings around* those pins, not the literal edits: P2b/P2d/P2e (message
field entirely unpinned), P4 (`childLate`), P5 (`childActivation*`), P6 (child event seq),
P8 (`parentCrossAccess`) and P9 (the three legs deleted from the loop). P2e's witness w10 — a month
`childResult.message = "bogus"` — is `exit 1 ["sp84-cross-origin-month-law"]` on the pristine counter
and `exit 0 clean` on the mutant. P9's witness w13 — a text `childResult.message = "bogus"` — is
`exit 1 ["sp84-cross-origin-text-law"] / 80 checks` pristine and `exit 0 clean / 77 checks` mutated:
three checks disappear and the coverage gate shrinks with them.

## 5. Survivors (51) — edited line and why the battery missed it

Witness codes: **A** accepted by mutant, **M** masked by an independent check (redundant),
**–** not witnessed. The bullet names the battery case that exists for the check and why it still
passes.

- **M02** nonce regex `{4,48}` → `*`: case `nonce-shape` only tries uppercase `TABI-r84-x`; the
  length/floor dimension is untested (and `nonce-expected` binds the exact value — w37 M).
- **M05** driver pin `=== pin` → first-8-hex prefix: case `driver-pin` tries 64 zeros; w01 **A**
  (a hash sharing the first 8 hex is accepted).
- **M08** fixture keys exact-set → superset: no case adds a top-level fixture key (the `w-` case adds
  a *child* key); w02 **A**.
- **M12** ports uniqueness `Set(...).size === 3` dropped: case `ports-declared` changes
  `ports.child` without rewriting origins, so the origin equality still refuses; w36 **A** with a
  coherent receipt (all `:19452` → `:19450`, `ports.child = ports.http`).
- **M13** `Number.isInteger(ports.cdp)` dropped: no case makes cdp non-integer; w03 **M**
  (`devtools-port-binding` still refuses the string port — redundant).
- **M14** top-level `frameTree.mainFrameParentId === null` dropped: no case touches the top-level
  field (`frame-binding` mutates a leg's); w04 **A**.
- **M19** leg key set → superset: `leg-records` deletes a key (missing still caught); w26 **A** with
  an extra leg key.
- **M20** `l.name === PLAN[i].name` dropped: a rename is also caught by `leg-order` and the kind
  pairing; redundant, no case renames a leg. **–**
- **M21** `chooserWaitMs >= 0` dropped: `w-leg-wait-unbounded` uses 5000 (> cap); w05 **A** with −1.
- **M25** `marks.length >= 3` → `>= 1`: no case shortens marks; w27 **X** — a 1-mark receipt now
  crashes the counter (`TypeError` at `arr(l.marks)[1].name`) instead of scoring `leg-marks`.
- **M29** child-context count `!== 1` → `< 1`: cases remove the context or corrupt fields; w14 **A**
  with a second default child context.
- **M33** send-log `length < 10` → `< 5`: cases renumber/duplicate/insert, never shorten; w33 **A**
  with a 9-send cross-origin log (every `Runtime.evaluate` removed, ids renumbered).
- **M38** eval guard `CROSS.has(leg.name) &&` dropped: no case sends a child expression from a
  non-cross leg. **–**
- **M39** parent-eval allowlist `parent.includes(expr)` → `|| any wrapperFor(...)`: the case pushes
  `window.__evil()`, which is not a wrapper; a wrong-target wrapper is untested. **–**
- **M42** `interceptSendId` binding dropped: no case corrupts it; w16 **A** (`interceptSendId=999`).
- **M43** `triggerSendId === trig.id` → `!trig` only: no case corrupts it coherently; w17 **A**
  (`triggerSendId=999`, open re-bound).
- **M44** `answer.setSendId === set.id` dropped: no case corrupts it; w18 **A** (`setSendId=999`).
- **M45** `set.params.files.length !== 1` dropped: no case answers with two files; w19 **M**
  (`accept-answer-law` re-pins the same length — redundant).
- **M47** non-`{fileChooserOpened,frameNavigated}` event methods dropped: no case adds a third
  method; w25 **A** with `Page.loadEventFired`.
- **M48** `opens.length > 2` → `> 3`: the click leg's frozen shape pins two opens; w28 **M**
  (shape + click-law + intercept-law all refuse three).
- **M49** chooser `frameId === wantFrame.frameId` dropped: no case names a foreign frame; w24 **A**.
- **M51** cross-leg open window `+3` → `+30`: the window only runs when a cross leg has an open,
  which already violates the zero-open law; w23 **M** four ways.
- **M53** per-leg `mainFrameId` format regex dropped: `w-frame-tree-id-any` targets the top level;
  w06 **M** (nav frameId equality).
- **M55** `event.files` array-shape test → `true`: the leg shape's `files` column still refuses a
  non-array value — redundant. **–**
- **M56** `Number.isInteger(e.seq)` → `num`: a non-integer seq still fails `seq-monotonic`. **–**
- **M57** `typeof e.leg === 'string'` dropped: no case makes leg a number; w07 **A** (`leg=5`).
- **M58** `onGrid(e.at)` dropped: `event-time-quantum` mutates `ts` only; w34 **A** with an off-grid
  `at`.
- **M59** `e.at <= (settle ?? closedAt)` dropped: cases mutate the lower bound/order only; w08 **A**
  with an event past `settle`.
- **M62** leg-shape `act` column dropped: no case mutates a page event's `act`; w09 **A**.
- **M64** leg-shape `trusted` column → `true`: `trust-law` still refuses `isTrusted=false`; w39 **M**.
- **M65** gesture-law `message` comparison dropped: `order-law`'s inline message pin still refuses;
  w15 **M**.
- **M67** activation law → `isActive` only: both activation cases mutate `isActive`; w35 **A** with
  `hasBeenActive=false`.
- **M71** `childEvents.length === 5` → `>= 5`: the child-event seq pin already implies length 5;
  w12 **M** (a sixth event still refused by the seq equality).
- **M75** extras-loop zero-chooser conjunct dropped: a cross-leg open is still refused by
  `intercept-law` (`want 0`) and the leg shape; masked. **–**
- **M76** state key set → superset: the leg shape compares `stateAfter`; w20 **M**.
- **M77** no-selection `e.files !== null` clause dropped: the leg shape's `files` column still sees
  the event; masked. **–**
- **M79** non-answer `stateAfterDismiss` emptiness dropped: no case supplies a non-null dismiss
  state there; w21 **A**.
- **M80** `opens !== want` → allow `opens === 0`: removing an open breaks the frozen shape and
  `intercept-law`; masked. **–**
- **M82** dismiss-law cancel clause dropped: `cancel-law` itself refuses the cancel event; w38 **M**.
- **M84** trust-law `show-picker-2` leg pin dropped: the case uses `show-picker` only; w22 **A**.
- **M99** replay refusal `ceil(0.5·np)` → `ceil(0.99·np)`: the battery's forgery replays **100 %**
  of the prior (`absMatched = np`), so every threshold ≤ np refuses it; a 90 % replay escapes. **–**
- **P2b** accept-any-`SecurityError`-message superset: no case rewrites a cross-leg message. **–**
- **P2c** three legs accept any `childResult`: w32 **M** — `{ok:true}` is still refused by
  `intercept-law` (want one open); only the message/childLate/activation dimension is free.
- **P2d** three legs drop the message pin: same gap as P2b, narrower. **–**
- **P2e** all cross legs drop the message pin: w10 **A** (month message `"bogus"`, clean).
- **P4** tel/search/text `childLate` bypassed: no case mutates it for those legs; w11 **A**.
- **P5** tel/search/text `childActivation*` bypassed: w29 **A** (tel `hasBeenActive` lost).
- **P6** tel/search/text child-event seq bypassed: w30 **A** (search target `go99`).
- **P7** tel/search/text `childEvents.length === 5` bypassed: redundant with the seq pin; w12 **M**.
- **P8** tel/search/text `parentCrossAccess` bypassed: w31 **A** (`contentDocument:"object"`).
- **P9** tel/search/text removed from the law loop: 3 checks vanish (80 → 77); the coverage gate
  only re-reports the 3 leg ids it already failed; w13 **A**.

## 6. Killed only through the honest receipt (H, 12)

These never reach a targeted case; the battery notices them only because the accept cases stop
scoring clean. They are **not** weakenings.

| id | honest finding(s) | mechanism |
|---|---|---|
| M16 plan-frozen `priorClick` key dropped | `["plan-frozen"]` | the compared projection loses a key, so it differs from the frozen plan on every leg |
| M17 plan-frozen `kind` key dropped | `["plan-frozen"]` | same projection-shape change |
| M70 mode-law multiple branch removed | `["mode-law"]` | the `multiple` leg really opens `selectMultiple`; `wantMode='selectSingle'` |
| M101 replay token `!==` → `false` | `["replay-launch-token"]` | `priors.every(...)` becomes false on any receipt. Verified follow-up `M101b` (`!==` → `true`, the actual weakening) is killed by case `replay-launch-token` (4 failed = baseline 3 + 1) |
| M102 replay browserId `!==` → `false` | `["replay-devtools-url"]` | same. Verified follow-up `M102b` (`!==` → `true`) is killed by case `replay-devtools-url` (4 failed = baseline 3 + 1) |
| M106 walk without recursion | `["prior-set-unmatched-exempt"]` | the exempted receipt is never walked, so its hash is "unmatched" |
| P1a/P1b/P1c/P1d `CHILD_RESULT_LAW` entries deleted | the three `*-law` ids | `same(x, undefined)` ≡ false |
| P2a literal `/SecurityError/` on the message | the three `*-law` ids | the message text never contains `SecurityError` |
| P3 `ACT_LAW` text after-transition changed | `["activation-law"]` | the honest transition is `{true,true}` |

## 7. Instrument findings (for the planner, not acted on here)

1. **Exit code is not a detector at this baseline.** The pristine counter makes the frozen battery
   exit 1 (3 failed cases + 6 uncovered ids), and all 123 mutants also exit 1 (`{"1":123}`) — the
   frozen rule "exit 1 ⇒ killed" has zero discriminating power and reads 0 survivors. Kill power
   must be scored on the failed-**case** set (as done here), not the exit code, or the baseline must
   be repaired first.
2. **The frozen battery lacks the three new legs' cases.** At `828dfcb7…` it has no
   `cross-origin-{tel,search,text}-law` cases and its generic `leg-*` mutator trips
   `no-selection-law`, so it fails those 3 cases and leaves 6 ids uncovered. The working-tree
   battery (`42fcfedc…`, uncommitted) adds exactly those cases; the pinned bytes do not.
3. **Check removal is invisible to the coverage gate.** P9 deletes three checks (80 → 77) and the
   gate's uncovered set shrinks to the three `leg-*` ids; no case fails, `unknown` is not gated, and
   `declared` (taken from the mutant) silently shrinks.
4. **26 survivors are demonstrated acceptance gaps** (witness `A`), **12 are redundant pins**
   (witness `M`), **1 turns refusal into a crash** (w27), and 12 were not witnessed.
5. **The r84 legs' extra fields are the thinnest area**: `childResult.message` is unpinned (P2e,
   w10), and `childLate`, `childActivation*`, the child-event seq and `parentCrossAccess` have no
   case for tel/search/text (P4/P5/P6/P8); the whole loop can be deleted for them (P9, w13). The
   frozen battery's `w-extras-child-act-dropped` exercises only `month`.
6. **The pinned battery and the working tree disagree** (`828dfcb7…` vs `42fcfedc…` and changing
   during the wave). Any rerun of the kill list in the lane today would use unpinned bytes.

## 8. Restoration evidence / hygiene

- Lane counter, prior set and receipt hashes are unchanged before/after:
  `e88e9fc7…` / `968844b3…` / `29347958…`; `git status --porcelain -- scripts/` shows only the
  other seats' `M scripts/check-record-drift-r84.mjs` and `M scripts/negatives-showpicker-r84.mjs`.
- Mutants were written only under `/fast/scratch/hyaku/tabi-r84/R84Mut1/muts/<id>/` and deleted
  after each run; the pristine scratch copy still hashes `e88e9fc7…` (counter) and `828dfcb7…`
  (frozen battery) after all 123 runs. Scratch dir deleted at the end of the seat.
- Tooling: none installed or upgraded (node v24.21.0 used as found).
- Commands: `node mk-mutants.mjs` (123 mutants, 8-way, 157 s), `node mk-witnesses.mjs` (39
  witnesses), `node check-showpicker-r84.mjs …` for the pristine honest run, and the baseline
  battery command quoted in §2.

## Appendix A — all 123 mutants (id | counter line | edit | verdict | witness)

Legend: **K** killed by a new failing case, **H** honest-receipt only, **S** survived; witness
**A** accepted by mutant, **M** masked, **X** crash, **–** not witnessed.

| id | line | edit (from → to) | v | wit |
|---|---|---|---|---|
| M01-schema-prefix-any | 321 | `check('schema', r.schema === SCHEMA,` → `check('schema', typeof r.schema === 'string' && r.schema.startsWith('tab` | K | – |
| M02-nonce-charset-floor-gone | 323 | `/^tabi-r84-[a-z0-9-]{4,48}$/` → `/^tabi-r84-[a-z0-9-]*$/` | S | M |
| M03-nonce-expected-shape-only | 324 | `check('nonce-expected', r.nonce === expectNonce,` → `check('nonce-expected', /^tabi-r84-[a-z0-9-]+$/.test(r.nonce),` | K | – |
| M04-receipt-fields-superset | 325 | `same(Object.keys(r).sort(), RECEIPT_KEYS)` → `RECEIPT_KEYS.every((k) => Object.prototype.hasOwnProperty.call(r, k))` | K | – |
| M05-driver-pin-prefix | 326 | `check('driver-pin', r.driverSha256 === pin,` → `check('driver-pin', typeof r.driverSha256 === 'string' && r.driverSha256` | S | A |
| M06-fixture-viewport-dropped | 327 | `same(r.fixture.viewport, VIEWPORT) && ` → `` | K | – |
| M07-fixture-childsha-shape-only | 327 | `/^[0-9a-f]{64}$/.test(r.fixture.child.sha256)` → `typeof r.fixture.child.sha256 === 'string'` | K | – |
| M08-fixture-keys-superset | 327 | `same(Object.keys(r.fixture).sort(), ['child', 'origin', 'patch', 'sha256` → `['child', 'origin', 'patch', 'sha256', 'viewport'].every((k) => Object.p` | S | A |
| M09-host-protocol-dropped | 330 | ` && host.cdpProtocolVersion === HOST.cdpProtocolVersion` → `` | K | – |
| M10-host-product-dropped | 330 | ` && host.cdpProduct === HOST.cdpProduct` → `` | K | – |
| M11-host-node-floor | 332 | `split('.')[0]) === HOST.nodeMajor` → `split('.')[0]) >= HOST.nodeMajor - 2` | K | – |
| M12-ports-uniqueness-dropped | 334 | ` && new Set([ports.http, ports.cdp, ports.child]).size === 3` → `` | S | A |
| M13-ports-cdp-integer-dropped | 334 | `Number.isInteger(ports.http) && Number.isInteger(ports.cdp) && Number.is` → `Number.isInteger(ports.http) && Number.isInteger(ports.child)` | S | M |
| M14-frame-tree-parent-dropped | 337 | ` && ftree.mainFrameParentId === null` → `` | S | A |
| M15-frame-tree-id-format-any | 337 | `/^[0-9A-F]{32}$/.test(ftree.mainFrameId)` → `typeof ftree.mainFrameId === 'string'` | K | – |
| M16-plan-frozen-priorclick-dropped | 342 | `, priorClick: l.priorClick` → `` | H | – |
| M17-plan-frozen-kind-dropped | 342 | `{ name: l.name, kind: l.kind, target: l.target,` → `{ name: l.name, target: l.target,` | H | – |
| M18-leg-order-length-only | 344 | `same(legs.map((l) => (isObj(l) ? l.name : null)), LEG_ORDER)` → `legs.length === LEG_ORDER.length` | K | – |
| M19-leg-records-keys-superset | 345 | `same(Object.keys(l).sort(), LEG_KEYS) && l.name === PLAN[i].name` → `LEG_KEYS.every((k) => Object.prototype.hasOwnProperty.call(l, k)) && l.n` | S | A |
| M20-leg-records-name-dropped | 345 | ` && l.name === PLAN[i].name && l.kind === PLAN[i].kind` → ` && l.kind === PLAN[i].kind` | S | – |
| M21-leg-records-wait-floor-dropped | 345 | ` && l.chooserWaitMs >= 0` → `` | S | A |
| M22-leg-records-errors-dropped | 345 | ` && arr(l.errors).length === 0)` → `)` | K | – |
| M23-leg-records-trigger2error-dropped | 345 | ` && errOk(l.trigger2Error)` → `` | K | – |
| M24-leg-records-priorclickerror-dropped | 345 | ` && errOk(l.priorClickError)` → `` | K | – |
| M25-leg-marks-count-floor | 347 | `arr(l.marks).length >= 3 && ` → `arr(l.marks).length >= 1 && ` | S | X |
| M26-leg-marks-grid-dropped | 347 | `num(m.at) && onGrid(m.at) && ` → `num(m.at) && ` | K | – |
| M27-leg-marks-monotonic-dropped | 347 | `(i === 0 \|\| m.at >= a[i - 1].at)` → `true` | K | – |
| M28-leg-marks-name-type-dropped | 347 | `isObj(m) && typeof m.name === 'string' && ` → `` | K | – |
| M29-context-second-child-accepted | 356 | `if (child.length !== 1)` → `if (child.length < 1)` | S | A |
| M30-context-frameid-uniqueness-dropped | 355 | ` && c.frameId !== leg.frameTree.mainFrameId` → `` | K | – |
| M31-context-cross-childid-dropped | 357 | `if (CROSS.has(leg.name) && leg.childContextId !== child[0].id)` → `if (false)` | K | – |
| M32-context-unexpected-childid-dropped | 358 | `if (!CROSS.has(leg.name) && leg.childContextId !== null)` → `if (false)` | K | – |
| M33-sendlog-length-floor | 382 | `if (log.length < 10 \|\| ` → `if (log.length < 5 \|\| ` | S | A |
| M34-sendlog-id-sequence-any-int | 382 | `c.id === i + 1 && ALLOWED_METHODS.has(c.method)` → `Number.isInteger(c.id) && ALLOWED_METHODS.has(c.method)` | K | – |
| M35-sendlog-prologue-dropped | 384 | `else if (!same(log.slice(0, 6).map((c) => c.method), ['Browser.getVersio` → `else if (false) sendBad.push(leg.name + ':prologue');` | K | – |
| M36-sendlog-once-dropped | 385 | `else if (log.filter((c) => c.method === 'Page.navigate').length !== 1 \|` → `else if (false) sendBad.push(leg.name + ':once');` | K | – |
| M37-sendlog-navigate-url-any-string | 386 | `else if (!same(log.find((c) => c.method === 'Page.navigate').params, { u` → `else if (!(log.find((c) => c.method === 'Page.navigate').params && typeo` | K | – |
| M38-sendlog-eval-cross-required-dropped | 375 | `return CROSS.has(leg.name) && params.contextId === leg.childContextId &&` → `return params.contextId === leg.childContextId && childExprs.has(params.` | S | – |
| M39-sendlog-eval-parent-wrapper-any | 376 | `return parent.includes(params.expression);` → `return parent.includes(params.expression) \|\| (typeof params.expression` | S | – |
| M40-sendlog-method-allowlist-any | 382 | `ALLOWED_METHODS.has(c.method)` → `typeof c.method === 'string'` | K | – |
| M41-plan-calls-method-only | 418 | `if (!same(got.map((c) => ({ method: c.method, params: c.params })), want` → `if (!same(got.map((c) => c.method), want.map((c) => c.method)))` | K | – |
| M42-plan-calls-intercept-id-dropped | 420 | `if (p.intercept && leg.interceptSendId !== log.find((c) => c.method === ` → `if (false) planBad.push(leg.name + ':intercept-id');` | S | A |
| M43-plan-calls-trigger-id-value-dropped | 425 | `if (!trig \|\| leg.triggerSendId !== trig.id) planBad.push(leg.name + ':` → `if (!trig) planBad.push(leg.name + ':trigger-id');` | S | A |
| M44-plan-calls-answer-setsendid-dropped | 437 | `if (!set \|\| !isObj(leg.answer) \|\| leg.answer.setSendId !== set.id) p` → `if (!set \|\| !isObj(leg.answer)) planBad.push(leg.name + ':answer-id');` | S | A |
| M45-plan-calls-answer-single-file-dropped | 439 | ` \|\| set.params.files.length !== 1) planBad.push(leg.name + ':answer-fi` → `) planBad.push(leg.name + ':answer-files');` | S | M |
| M46-evlog-nav-count-floor | 450 | `if (nav.length !== 1 \|\| ` → `if (nav.length < 1 \|\| ` | K | – |
| M47-evlog-extra-method-dropped | 450 | ` \|\| el.some((e) => !['Page.fileChooserOpened', 'Page.frameNavigated'].` → `` | S | A |
| M48-evlog-open-limit | 454 | `if (opens.length > 2)` → `if (opens.length > 3)` | S | M |
| M49-evlog-open-frame-dropped | 458 | `if (!wantFrame \|\| o.params.frameId !== wantFrame.frameId)` → `if (!wantFrame)` | S | A |
| M50-evlog-open-keys-superset | 456 | `if (!same(Object.keys(o.params).sort(), ['backendNodeId', 'frameId', 'mo` → `if (!['backendNodeId', 'frameId', 'mode'].every((k) => Object.prototype.` | K | – |
| M51-evlog-cross-open-window | 460 | `o.afterSendId >= leg.priorReleaseId && o.afterSendId <= leg.priorRelease` → `o.afterSendId >= leg.priorReleaseId && o.afterSendId <= leg.priorRelease` | S | M |
| M52-evlog-backendnode-zero-ok | 456 | ` \|\| o.params.backendNodeId <= 0` → ` \|\| o.params.backendNodeId < 0` | K | – |
| M53-frame-binding-format-any | 469 | `isObj(l.frameTree) && typeof l.frameTree.mainFrameId === 'string' && /^[` → `isObj(l.frameTree) && typeof l.frameTree.mainFrameId === 'string' && l.f` | S | M |
| M54-typed-ret-any | 474 | `(e.ret === null \|\| typeof e.ret === 'string')` → `true` | K | – |
| M55-typed-files-any | 474 | `(e.files === null \|\| Array.isArray(e.files))` → `true` | S | – |
| M56-typed-seq-num | 474 | `Number.isInteger(e.seq)` → `num(e.seq)` | S | – |
| M57-typed-leg-string-dropped | 474 | ` && typeof e.leg === 'string'` → `` | S | A |
| M58-event-quantum-at-dropped | 476 | `isObj(e) && onGrid(e.ts) && onGrid(e.at)` → `isObj(e) && onGrid(e.ts)` | S | A |
| M59-event-window-upper-dropped | 482 | ` && e.at <= (settle ?? l.closedAt)` → `` | S | A |
| M60-event-window-start-leg-dropped | 482 | `isObj(e) && e.leg !== 'start' && num(e.at)` → `isObj(e) && num(e.at)` | K | – |
| M61-seq-monotonic-first-index-free | 485 | `s.every((v, i) => v === i + 1)` → `s.every((v, i) => i === 0 \|\| v === i + 1)` | K | – |
| M62-leg-shape-act-column-dropped | 508 | `'seq', 'trusted', 'act', 'xy', 'files', 'opened', 'state'` → `'seq', 'trusted', 'xy', 'files', 'opened', 'state'` | S | A |
| M63-leg-shape-xy-column-dropped | 508 | `'act', 'xy', 'files', 'opened', 'state'` → `'act', 'files', 'opened', 'state'` | K | – |
| M64-leg-shape-trusted-column-true | 493 | `trusted: evs.map((e) => e.isTrusted),` → `trusted: evs.map((e) => true),` | S | M |
| M65-gesture-law-message-dropped | 522 | ` \|\| got.message !== want.message` → `` | S | M |
| M66-gesture-law-ret-dropped | 522 | `got.ret !== want.ret` → `false` | K | – |
| M67-activation-isactive-only | 530 | `if (!same(leg.activationBefore, want[0]) \|\| !same(leg.activationAfter,` → `if ((isObj(leg.activationBefore) && leg.activationBefore.isActive !== wa` | S | A |
| M68-activation-before-dropped | 530 | `if (!same(leg.activationBefore, want[0]) \|\| !same(leg.activationAfter,` → `if (!same(leg.activationAfter, want[1]))` | K | – |
| M69-mode-law-any-string | 541 | `if (!d \|\| opens.some((e) => e.params.mode !== wantMode))` → `if (!d \|\| opens.some((e) => typeof e.params.mode !== 'string'))` | K | – |
| M70-mode-law-multiple-branch-dropped | 540 | `const wantMode = d && d.multiple === true ? 'selectMultiple' : 'selectSi` → `const wantMode = 'selectSingle';` | H | – |
| M71-cross-nonfile-events-count-floor | 547 | `arr(co.childEvents).length === 5 && ` → `arr(co.childEvents).length >= 5 && ` | S | – |
| M72-cross-nonfile-childlate-dropped | 547 | ` && co.childLate === 0,` → `,` | K | – |
| M73-order-law-childlate-dropped | 553 | ` && cod.childLate === 0` → `` | K | – |
| M74-order-law-message-dropped | 553 | ` && sod.showPicker.message === IMMUTABLE_ERR` → `` | K | – |
| M75-extras-chooser-count-dropped | 558 | `arr(ex.cdpEventLog).filter((e) => e.method === 'Page.fileChooserOpened')` → `true && ` | S | – |
| M76-no-selection-state-keys-superset | 603 | `same(Object.keys(st).sort(), ['d', 'dis', 'disd', 'k', 'm', 's', 'sValue` → `['d', 'dis', 'disd', 'k', 'm', 's', 'sValue'].every((k) => Object.protot` | S | M |
| M77-no-selection-file-event-dropped | 610 | ` \|\| (e.files !== null && e.type !== 'cancel')` → `` | S | – |
| M78-no-selection-answer-dismiss-eq-dropped | 605 | `if (!isObj(leg.stateAfterDismiss) \|\| !same(leg.stateAfterDismiss, leg.` → `if (!isObj(leg.stateAfterDismiss))` | K | – |
| M79-no-selection-dismiss-empty-dropped | 609 | `(k) => Array.isArray(leg.stateAfterDismiss[k]) && leg.stateAfterDismiss[` → `(k) => Array.isArray(leg.stateAfterDismiss[k])` | S | A |
| M80-intercept-missing-open-ok | 621 | `if (opens !== want) intBad.push(leg.name + ':opened-' + opens + '-want-'` → `if (opens !== want && opens > 0) intBad.push(leg.name + ':opened-' + ope` | S | – |
| M81-cancel-law-one-allowed | 625 | `check('cancel-law', same(cancels, []),` → `check('cancel-law', cancels.length <= 1,` | K | – |
| M82-dismiss-law-cancel-clause-dropped | 626 | ` && arr(l.pageEvents).every((e) => e.type !== 'cancel'))` → `)` | S | M |
| M83-trust-law-boolean-only | 629 | `events.every((e) => e.isTrusted === true)` → `events.every((e) => typeof e.isTrusted === 'boolean')` | K | – |
| M84-trust-law-picker2-dropped | 629 | `(e.leg !== 'show-picker' && e.leg !== 'show-picker-2')` → `(e.leg !== 'show-picker')` | S | A |
| M85-argv-array-any | 641 | `if (!same(a, want) \|\| typeof tok !== 'string'` → `if (!Array.isArray(a) \|\| typeof tok !== 'string'` | K | – |
| M86-argv-profile-dropped | 641 | ` \|\| path.basename(profile) !== 'profile-' + tok` → `` | K | – |
| M87-devtools-url-any-ws | 642 | `!dl.url.startsWith('ws://127.0.0.1:' + ports.cdp + '/devtools/browser/')` → `!dl.url.startsWith('ws://')` | K | – |
| M88-browserid-any-string | 642 | `/^[0-9a-f-]{36}$/.test(dl.browserId)` → `typeof dl.browserId === 'string'` | K | – |
| M89-teardown-survivors-floor | 647 | `arr(l.teardown.survivors).length === 0` → `arr(l.teardown.survivors).length <= 1` | K | – |
| M90-teardown-probes-any-string | 647 | `Object.values(l.teardown.portProbes).every((v) => v === 'closed')` → `Object.values(l.teardown.portProbes).every((v) => typeof v === 'string')` | K | – |
| M91-teardown-curl-num | 647 | `Object.values(l.teardown.postKillCurl).every((v) => v === 7)` → `Object.values(l.teardown.postKillCurl).every((v) => num(v))` | K | – |
| M92-fixture-descriptors-length-only | 648 | `same(arr(r.fixtureInputs), FIXTURE_INPUTS)` → `arr(r.fixtureInputs).length === FIXTURE_INPUTS.length` | K | – |
| M93-server-log-run-dropped | 649 | `arr(l.serverLog).filter((s) => isObj(s) && s.path === '/').every((s) => ` → `arr(l.serverLog).filter((s) => isObj(s) && s.path === '/').every((s) => ` | K | – |
| M94-server-log-404-dropped | 649 | ` && arr(l.serverLog).filter((s) => isObj(s) && s.path !== '/').every((s)` → `` | K | – |
| M95-child-server-min-dropped | 651 | `arr(l.childServerLog).filter((s) => isObj(s) && s.path === '/child.html'` → `arr(l.childServerLog).filter((s) => isObj(s) && s.path === '/child.html'` | K | – |
| M96-child-server-run-dropped | 651 | `arr(l.childServerLog).filter((s) => isObj(s) && s.path === '/child.html'` → `arr(l.childServerLog).filter((s) => isObj(s) && s.path === '/child.html'` | K | – |
| M97-run-window-lower-floor | 656 | `t1 - t0 >= 12000` → `t1 - t0 >= 1000` | K | – |
| M98-run-window-upper-dropped | 656 | ` && t1 - t0 < 600000` → `` | K | – |
| M99-replay-fraction-099 | 666 | `const absNeed = np > 0 ? Math.ceil(FRAC * np - 1e-9) : 0` → `const absNeed = np > 0 ? Math.ceil(0.99 * np - 1e-9) : 0` | S | – |
| M100-replay-refusal-disabled | 669 | `const replayIdx = sims.findIndex((s) => s.refused);` → `const replayIdx = -1;` | K | – |
| M101-replay-token-any | 671 | `q.launchToken !== l.launchToken` → `false` | H | – |
| M102-replay-browser-any | 673 | `q.devtoolsListening.browserId !== l.devtoolsListening.browserId` → `false` | H | – |
| M103-prior-unmatched-any | 711 | `const unmatched = exemptHashes.filter((h) => ![...fileHashes.values()].i` → `const unmatched = [];` | K | – |
| M104-prior-outside-any | 713 | `check('prior-set-complete', outside.length === 0,` → `check('prior-set-complete', true,` | K | – |
| M105-prior-unparsable-any | 706 | `&& /tabi-chrome-cdp-showpicker-r84/.test(txt)) unparsable.push(w.path);` → `&& false) unparsable.push(w.path);` | K | – |
| M106-walk-no-recursion | 690 | `if (s.isDirectory()) walk(p);` → `if (s.isDirectory()) continue;` | H | – |
| M107-verdict-always-clean | 719 | `const verdict = failed.length === 0 ? 'clean' : 'findings';` → `const verdict = 'clean';` | K | – |
| P1a-childresult-law-tel-deleted | 283 | `  'sp84-cross-origin-tel': { ok: false, name: 'SecurityError', message: ` → `` | H | – |
| P1b-childresult-law-search-deleted | 284 | `  'sp84-cross-origin-search': { ok: false, name: 'SecurityError', messag` → `` | H | – |
| P1c-childresult-law-text-deleted | 285 | `  'sp84-cross-origin-text': { ok: false, name: 'SecurityError', message:` → `` | H | – |
| P1d-childresult-law-three-deleted | 283 | `  'sp84-cross-origin-tel': { ok: false, name: 'SecurityError', message: ` → `` | H | – |
| P2a-three-legs-message-regex | 558 | `isObj(ex.childResult) && same(ex.childResult, CHILD_RESULT_LAW[extra]) &` → `isObj(ex.childResult) && (['sp84-cross-origin-tel', 'sp84-cross-origin-s` | H | – |
| P2b-all-legs-message-regex | 558 | `same(ex.childResult, CHILD_RESULT_LAW[extra])` → `(same(ex.childResult, CHILD_RESULT_LAW[extra]) \|\| (isObj(ex.childResul` | S | – |
| P2c-three-legs-childresult-any | 558 | `isObj(ex.childResult) && same(ex.childResult, CHILD_RESULT_LAW[extra]) &` → `isObj(ex.childResult) && (['sp84-cross-origin-tel', 'sp84-cross-origin-s` | S | M |
| P2d-three-legs-message-pin-dropped | 558 | `isObj(ex.childResult) && same(ex.childResult, CHILD_RESULT_LAW[extra]) &` → `isObj(ex.childResult) && (['sp84-cross-origin-tel', 'sp84-cross-origin-s` | S | – |
| P2e-all-legs-message-pin-dropped | 558 | `same(ex.childResult, CHILD_RESULT_LAW[extra])` → `isObj(ex.childResult) && ex.childResult.ok === CHILD_RESULT_LAW[extra].o` | S | A |
| P3-actlaw-text-changed | 252 | `  'sp84-cross-origin-text': [{ isActive: false, hasBeenActive: false }, ` → `  'sp84-cross-origin-text': [{ isActive: false, hasBeenActive: false }, ` | H | – |
| P4-three-legs-childlate-bypassed | 558 | ` && ex.childLate === 0,` → ` && (['sp84-cross-origin-tel', 'sp84-cross-origin-search', 'sp84-cross-o` | S | A |
| P5-three-legs-childactivation-bypassed | 558 | ` && same(ex.childActivationBefore, CHILD_ACT_LAW[extra][0]) && same(ex.c` → ` && (['sp84-cross-origin-tel', 'sp84-cross-origin-search', 'sp84-cross-o` | S | A |
| P6-three-legs-child-event-seq-bypassed | 558 | ` && same(arr(ex.childEvents).map((e) => e.type + '@' + e.target), CHILD_` → ` && (['sp84-cross-origin-tel', 'sp84-cross-origin-search', 'sp84-cross-o` | S | A |
| P7-three-legs-child-events-count-bypassed | 558 | ` && arr(ex.childEvents).length === 5 && ` → ` && (['sp84-cross-origin-tel', 'sp84-cross-origin-search', 'sp84-cross-o` | S | M |
| P8-three-legs-parentcrossaccess-bypassed | 558 | ` && same(ex.parentCrossAccess, { contentDocument: null, windowDocument: ` → ` && (['sp84-cross-origin-tel', 'sp84-cross-origin-search', 'sp84-cross-o` | S | A |
| P9-three-legs-removed-from-loop | 556 | `, 'sp84-cross-origin-tel', 'sp84-cross-origin-search', 'sp84-cross-origi` → `]) {` | S | A |
