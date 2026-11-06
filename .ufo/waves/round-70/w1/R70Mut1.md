UNDERPOWERED

# R70Mut1 — mutation probe of `scripts/check-synthtap-r70.mjs` against its negative battery

Seat R70Mut1, round 70 wave w1. Assignment: generate >=20 single-line mutants of the C1 counter in an
isolated scratch copy and run the battery COPY (which resolves the counter beside itself) on each.
Kill rule as assigned, no amendment: **killed = battery exit 1, survived = battery exit 0**, with the
battery invoked exactly as the claims run it:

```
node <scratch>/s/negatives-synthtap-r70.mjs \
  --real <lane>/corpus/evidence/round70/chromium-synth-tap-gesture/receipt.json \
  --expect-driver-sha256 704efab816e9bd9cc38cb31dd219aa776f7be52815a17cf1ea68924b6dff9577 \
  --work /fast/scratch/hyaku/tabi-r70/R70Mut1/w/<id> \
  --laundered <lane>/.ufo/waves/round-70/controls/c1-receipts/degenerate-js-click.json \
  --laundered <lane>/.ufo/waves/round-70/controls/c1-receipts/degenerate-dispatch-mouse.json \
  --laundered <lane>/.ufo/waves/round-70/controls/c1-receipts/degenerate-skip-touch.json
```

Pins verified before and after every mutant run (the shared pristine copies were never written):

| artifact | sha256 |
|---|---|
| `scripts/check-synthtap-r70.mjs` | `a2ed7619ca6ea165a3877308c3d87c41a27f6b2a7f24a7fca4f879073a39756e` |
| `scripts/negatives-synthtap-r70.mjs` | `22244a81f9653a3df30cb4dc98b258d9cd09201247e748b97b516bca99b2af3c` |
| driver (not mutated) | `704efab816e9bd9cc38cb31dd219aa776f7be52815a17cf1ea68924b6dff9577` |

Baseline (pristine counter + pristine battery, same flags): **exit 0, 95/95 cases, positiveOk=true,
84 declared check ids, coverageGap=[]** (`baseline-battery.json`). A baseline failure would have made
every mutant inconclusive; there was none, so every exit 0 below is a genuine survivor.

Each mutant is exactly one changed line (`diffLines=1` for all 31, `node --check` clean), lives in its
own directory beside its own byte-identical battery copy, and the shared pristine copies were re-hashed
after each run (`pristineUntouched=true` on all 31). Mutant counters and probe receipts are committed
under `mutants/` and `probe/`; per-mutant battery summaries in `mutants/check-synthtap-r70-<id>.result.json`.

**Total 31 mutants: 10 killed, 21 survived.** Of the survivors, 15 are receipts the pinned counter
rejects and the mutant accepts, 2 are the reverse direction (mutant over-strict), 3 are structural
(declared-id list, emitted `checks` map, dead guard) and 1 is an equivalent masked by another check.

---

## 1. Mutant table

Detector column for survivors is a differential probe (`probe.mjs`): the probe receipt is run through
the PINNED counter and through the mutant. `mutant-accepts: pristine=1 [id]; mutant=0` means the pinned
counter names the defect and the mutant silently passes it — a real escape. `mutant-rejects` means the
mutant is over-strict where the pinned counter is right. `dead-guard` / `checks-map` / `list-checks`
are probe-less structural findings, evidenced in §3.

| # | line | single-line change | verdict | detector evidence | mutant sha256 (12) |
|---|---|---|---|---|---|
| M01 | 129 | exit-code polarity inverted (clean->1, findings->0) | killed | battery exit 1; cases failed: schema,nonce-shape,... (all) | dd4b5a228492 |
| M02 | 88 | `seq-monotonic` relaxed `===` to `>=` (duplicate/gapped seq accepted) | killed | battery exit 1; case failed: `seq-monotonic` | 9fe29efdc648 |
| M03 | 93 | `tap-call-count` widened `=== 7` to `>= 1` | killed | battery exit 1; cases failed: `tap-call-count`,`laundered-skip-touch` | 4d66bbed9635 |
| M04 | 123 | `producer-verdict` conjunction `&&` -> `\|\|` (either half alone passes) | killed | battery exit 1; cases failed: both producer-polarity cases | 47e415312630 |
| M05 | 124 | `legshape-consistency` polarity inverted | killed | battery exit 1; case failed: `legshape-consistency` | 345eafad3e28 |
| M06 | 124 | `legshape-consistency` compares only the `double` leg | killed | battery exit 1; case failed: `legshape-consistency` | e54c5bd59f95 |
| M07 | 116 | `no-dblclick` drops the `contextmenu` branch | survived | **equivalent/masked** (see §4) | 5eae436796df |
| M08 | 114 | `leg-coords` drops the `clientY` half | survived | mutant-accepts: pristine=1 [`leg-mouse-coords`]; mutant=0 | 60625b230f6c |
| M09 | 77 | `server-log-binding` widens `served.length >= 1` to `>= 0` | survived | mutant-accepts: pristine=1 [`server-log-binding`]; mutant=0 | 4bbb602f32c0 |
| M10 | 95 | look-alike regex drops `Input.emulateTouch` | survived | mutant-accepts: pristine=1 [`no-lookalike-producer`]; mutant=0 | e2ea934948fa |
| M11 | 95 | look-alike regex drops `Input.insertText` and `Input.ime` | survived | mutant-accepts: pristine=1 [`no-lookalike-producer`]; mutant=0 | 117a19bb8b63 |
| M12 | 121 | teardown drops `sweepError === null` conjunct | survived | mutant-accepts: pristine=1 [`teardown-closure`]; mutant=0 | bf66500270bd |
| M13 | 121 | teardown drops `postKillCurl.devtools === 7` conjunct | survived | mutant-accepts: pristine=1 [`teardown-closure`]; mutant=0 | fda061d0f849 |
| M14 | 121 | teardown drops `portProbes.devtools === 'closed'` conjunct | survived | mutant-accepts: pristine=1 [`teardown-closure`]; mutant=0 | af85b18dcfbe |
| M15 | 122 | `failures-empty` tolerates an **absent** `failures` field | survived | mutant-accepts: pristine=1 [`failures-empty`]; mutant=0 | eef9edcbd835 |
| M16 | 75 | `scored-run-not-degenerate` `=== null` -> `== null` | survived | mutant-accepts: pristine=1 [`scored-run-not-degenerate`]; mutant=0 | 08904d25edcb |
| M17 | 94 | `tap-call-params` compares only the first frozen params | killed | battery exit 1; case failed: `tap-call-params` | be42dbfbea67 |
| M18 | 80 | `host-chromium` drops the `cdpProduct` regex (any product string) | survived | mutant-accepts: pristine=1 [`host-chromium`]; mutant=0 | 39a4db1e544f |
| M19 | 83 | `devtools-port-binding` drops loopback+port binding of `dl.url` | survived | mutant-accepts: pristine=1 [`devtools-port-binding`]; mutant=0 | 4e84dbfaddc5 |
| M20 | 85 | `run-window` upper bound widened 600000 -> 31536000000 | survived | mutant-accepts: pristine=1 [`run-window`]; mutant=0 | 7ddebee3aff2 |
| M21 | 127 | unevaluated-check guard disabled (`if (missing.length)` -> `if (false)`) | survived | **equivalent, dead code** (§4) | 8db993b59541 |
| M22 | 46 | `CHECK_IDS` drops `no-lookalike-producer` from the declared list | survived | `--list-checks` 84 -> 83; battery still exit 0 (§3.1) | 59719a2df641 |
| M23 | 110 | `leg-trusted` `every(isTrusted===true)` -> `!some(isTrusted===false)` | survived | mutant-accepts: pristine=1 [`leg-mouse-trusted`]; mutant=0 | ab09e73f9933 |
| M24 | 66 | `MOVES` drops `touchmove` | survived | mutant-rejects: pristine=0; mutant=1 [`leg-touch-seq`] | 41b06e9a494b |
| M25 | 34 | `hold` timing band lower bound widened 395 -> 0 | survived | mutant-accepts: pristine=1 [`leg-hold-timing`]; mutant=0 | 7189e2845760 |
| M26 | 61 | `canon` drops key sorting (order-sensitive comparison) | survived | mutant-rejects: pristine=0; mutant=1 [`plan-frozen`] | 18439077fb0b |
| M27 | 64 | `check()` bookkeeping poisoned: `checks[id] = true` | survived | `checks` map all-true while findings=[`schema`] (§3.2) | 75af659e9b02 |
| M28 | 89 | `event-leg-domain` examines only the first event | killed | battery exit 1; case failed: `event-leg-domain` | 0c4dfd80b26a |
| M29 | 111 | `leg-detail` drops `button === 0` conjunct | killed | battery exit 1; case failed: `mouse-detail-button` | f0d849897554 |
| M30 | 113 | `leg-error` accepts any error string (`includes` -> `typeof string`) | survived | mutant-accepts: pristine=1 [`leg-outside-error`]; mutant=0 | 78850af2ceb1 |
| M31 | 124 | drop a check: `legshape-consistency` id renamed so the declared id is never evaluated | killed | battery exit 1; case failed: `legshape-consistency`; counter-internal also fires (positiveOk=false) | 69c457c5dc79 |

All 31 mutants are single-line and syntactically valid; `diffLines=1` and `node --check` status are
recorded per mutant in `mutants/check-synthtap-r70-<id>.result.json`.

---

## 2. What the 10 kills show (the battery's real strength)

The battery is strong exactly where it has a *committed receipt mutation that moves the value against
the frozen expectation*: seq integrity (M02, M28), producer call count/params (M03, M17), the producer
verdict both polarities (M04), the legShape re-derivation (M05, M06, M31), and the button conjunct on
`leg-detail` (M29). M03 is worth noting for the battery's design: it is also caught by
`laundered-skip-touch`, so the laundering path is doing independent work. M31 (renaming a check id)
also trips the counter's own `counter-internal` guard, which is why its positive case fails too — the
battery's "one negative per declared id" rule has teeth in the *delete-a-check* direction.

---

## 3. Structural findings (no receipt probe)

### 3.1 The coverage gate is one-directional — a declared id can vanish silently (M22, line 46)

`negatives-synthtap-r70.mjs:129-131` computes `coverageGap = listed.filter(id => !covered.has(id))`,
i.e. "every id the counter *declares* has a case". It never asserts the reverse: that every id a case
*expects* is still declared. Deleting `'no-lookalike-producer'` from `CHECK_IDS` (counter line 46) is
therefore invisible:

```
node mutants/check-synthtap-r70-M22.mjs --list-checks | ...   # 83 ids, no-lookalike-producer absent
# pinned battery against M22: exit 0 (95/95, coverageGap=[])
```

The check still runs and still fires, so no case fails. The only consumer of `--list-checks` in the
lane is the battery itself (`negatives-synthtap-r70.mjs:129`), so a shrinking declaration is currently
unpoliced.

### 3.2 The emitted `checks` map can lie (M27, line 64)

`checks[id] = !!ok` is the only per-id record in the JSON output, and no battery case inspects it.
With `checks[id] = true` (M27), the counter still exits 1 with `findings=[schema]` while reporting
`checks.schema === true`:

```
pinned : exit 1 findings=[schema] checksFalse=["schema"] checkCount=84
M27    : exit 1 findings=[schema] checksFalse=[]         checkCount=84
```

`verify-live-r70.mjs` consumes only the counter's **exit code** (line 175-176) and pins its digest
(line 126), so this is not exploitable through the live verifier — but the `checks` map is the counter's
per-id evidence surface for any human or tool that reads it, and nothing pins it.

---

## 4. Equivalents (survived, not coverage gaps)

- **M07** (`no-dblclick` drops `contextmenu`, line 116): masked by defence in depth. `leg-<name>-seq`
  compares the exact ordered list of non-move event types, so *any* injected `contextmenu`/`auxclick`/
  `dblclick` already breaks `seq` before `no-dblclick` is consulted. Probe: the pinned counter reports
  both `leg-mouse-seq` and `leg-mouse-no-dblclick`; the mutant reports `leg-mouse-seq`. Note the
  corollary: `leg-*-no-dblclick` is largely redundant with `leg-*-seq`, and the battery's
  `*-dblclick` cases may pass for the seq reason (round-69 lesson R3 territory).
- **M21** (`if (missing.length)` -> `if (false)`, line 127): dead guard. `CHECK_IDS` is composed from
  the same `LEG_ORDER × PER_LEG` expansion the loop evaluates, and every static id is `check(...)`-called
  unconditionally, so `missing` is empty on every reachable input. Empirically `counter-internal` fires
  in 0 of the 95 baseline cases + the positive. It only becomes live if a check call is deleted or
  renamed — which M31 shows is caught by the *case* for that id first.

---

## 5. Surviving escapes, ranked, with a proposed negative case each

Every `add(...)` below is written against the battery's own case DSL and was **verified**: the pinned
counter, run on the probe receipt, exits 1 and emits exactly the named expected id
(`probe-results.json`, `probe/<id>-variant.json`). Reproduce any row with:

```
cd <lane>/.ufo/waves/round-70/w1/R70Mut1
node check-synthtap-r70.pristine.mjs --receipt probe/<id>-variant.json \
     --expect-driver-sha256 704efab816e9bd9cc38cb31dd219aa776f7be52815a17cf1ea68924b6dff9577   # exit 1, names the defect
node mutants/check-synthtap-r70-<id>.mjs --receipt probe/<id>-variant.json \
     --expect-driver-sha256 704efab816e9bd9cc38cb31dd219aa776f7be52815a17cf1ea68924b6dff9577   # exit 0, accepts it
```

To re-run a whole mutant through the battery (the battery must be named
`negatives-synthtap-r70.mjs` beside the counter it should test):

```
D=$(mktemp -d -p /fast/scratch/hyaku/tabi-r70/R70Mut1); cp mutants/check-synthtap-r70-<id>.mjs "$D/check-synthtap-r70.mjs"
cp negatives-synthtap-r70.pristine.mjs "$D/negatives-synthtap-r70.mjs"
node "$D/negatives-synthtap-r70.mjs" --real <lane>/corpus/evidence/round70/chromium-synth-tap-gesture/receipt.json \
  --expect-driver-sha256 704efab816e9bd9cc38cb31dd219aa776f7be52815a17cf1ea68924b6dff9577 --work "$D/w" \
  --laundered <lane>/.ufo/waves/round-70/controls/c1-receipts/degenerate-js-click.json \
  --laundered <lane>/.ufo/waves/round-70/controls/c1-receipts/degenerate-dispatch-mouse.json \
  --laundered <lane>/.ufo/waves/round-70/controls/c1-receipts/degenerate-skip-touch.json; echo exit=$?
```

### 5.1 Highest value — these unpin a *measured* C1 invariant

| rank | mutant | invariant left unpinned | proposed battery case (verified) |
|---|---|---|---|
| A1 | M25 (counter:34) | **`duration: 400` -> press->release 400 ms.** The battery only pushes `pointerup` *later* (`+500`), so the band's lower bound is never tested: a receipt with the `hold` leg at 50 ms (duration parameter silently ignored) is accepted. | `add('hold-duration-ignored','leg-hold-timing',(r)=>{const d=r.events.find(e=>e.leg==='hold'&&e.type==='pointerdown'),u=r.events.find(e=>e.leg==='hold'&&e.type==='pointerup');u.ts=d.ts+50;})` |
| A2 | M30 (counter:113) | **`outside` must fail with "Position out of bounds".** Any error string satisfies the leg: a receipt whose out-of-bounds tap failed for an unrelated reason (`-32000 Synthetic tap failed`) is accepted. | `add('outside-error-wrong-message','leg-outside-error',(r)=>{r.legs.find(l=>l.name==='outside').cdpError='{"code":-32000,"message":"Synthetic tap failed"}';})` |
| A3 | M09 (counter:77) | **The driver was served by the fixture server.** `served.length >= 1` only guards non-emptiness; a receipt with `serverLog: []` (no HTTP evidence at all) is accepted. | `add('server-log-absent','server-log-binding',(r)=>{r.serverLog=[];})` |
| A4 | M19 (counter:83) | **The DevTools websocket is this run's loopback port.** Dropping the `startsWith('ws://127.0.0.1:<port>/devtools/browser/')` binding leaves only `includes('/devtools/browser/')`; a foreign-host URL (`ws://10.11.12.13:<same port>/devtools/browser/x`) plus a matching `stderrHead` is accepted. | `add('devtools-url-foreign-host','devtools-port-binding',(r)=>{const u=r.host.devtoolsListening.url.replace('127.0.0.1','10.11.12.13');r.host.devtoolsListening.url=u;r.host.stderrHead='DevTools listening on '+u;})` |
| A5 | M18 (counter:80) | **The CDP product is headless Chromium.** No case mutates `host.cdpProduct`; `Firefox/140.0` passes a mutant that keeps the `typeof` test only. | `add('host-cdp-product','host-chromium',(r)=>{r.host.cdpProduct='Firefox/140.0';})` |
| A6 | M20 (counter:85) | **The run finished inside 10 minutes.** Only `t1 > t0` is tested (equal timestamps), never the `600000` bound: a 2-hour window is accepted. | `add('run-window-long','run-window',(r)=>{r.finishedAt=new Date(Date.parse(r.startedAt)+7200000).toISOString();})` |

### 5.2 Teardown closure — three of seven conjuncts are unpinned (M12, M13, M14, counter:121)

The battery's only teardown case sets `survivors=[4242]`. Verified against the pinned counter:

`add('teardown-sweep-error','teardown-closure',(r)=>{r.teardown.sweepError='EBUSY';})` — 1 finding `teardown-closure`
`add('teardown-postkill-devtools','teardown-closure',(r)=>{r.teardown.postKillCurl.devtools=200;})`
`add('teardown-portprobe-devtools','teardown-closure',(r)=>{r.teardown.portProbes.devtools='open';})`
`add('teardown-sweep-count','teardown-closure',(r)=>{r.teardown.postKillSweepCount=1;})` — also verified exit 1
`add('teardown-portprobe-fixture','teardown-closure',(r)=>{r.teardown.portProbes.fixture='open';})` — also verified exit 1

The first three are accepted by their mutants (M12 sweep error, M13 `postKillCurl.devtools`, M14
`portProbes.devtools`). The last two (`postKillSweepCount`, `portProbes.fixture`) are pinned by the
pinned counter — verified exit 1 with `teardown-closure` — but no mutant of this wave targets them; they
are listed so the battery can close the whole conjunctive check at once. In every case the defect is a
receipt whose fixture server or DevTools port survived the kill and still takes the clean verdict.

### 5.3 Presence-only fields (M15, M16, M23, counter:75/110/122)

| mutant | defect accepted | proposed case (verified) |
|---|---|---|
| M15 | `failures` field **absent** (not `[]`) passes; `Array.isArray` is the only thing pinning it. | `add('failures-absent','failures-empty',(r)=>{delete r.failures;})` |
| M16 | `degenerate` field **absent** passes under `== null`; `undefined` is not `null` and must be rejected by the pinned `=== null`. | `add('degenerate-absent','scored-run-not-degenerate',(r)=>{delete r.degenerate;})` |
| M23 | A log event with **no `isTrusted` field** passes: `!some(isTrusted===false)` is satisfied by absence, while the pinned `every(isTrusted===true)` rejects it. | `add('mouse-trusted-absent','leg-mouse-trusted',(r)=>{delete r.events.find(e=>e.leg==='mouse').isTrusted;})` |

### 5.4 Producer / host surface not enumerated by any case (M10, M11, counter:95)

The `no-lookalike-producer` regex has four `Input.*` alternatives and three `Runtime.*` payload
alternatives; the battery exercises `dispatchMouseEvent`, `dispatchTouchEvent`, and one *overloaded*
`Runtime.callFunctionOn` payload that matches both `dispatchEvent` and `new MouseEvent`. No case covers:

- `Input.emulateTouchEvent` (M10 survives) →
  `add('lookalike-emulate-touch','no-lookalike-producer',(r)=>{r.cdpSendLog.push({id:999,method:'Input.emulateTouchEvent',params:{type:'touchStart',touchPoints:[{x:200,y:150}]}});})`
- `Input.insertText` / `Input.ime*` (M11 survives) →
  `add('lookalike-insert-text','no-lookalike-producer',(r)=>{r.cdpSendLog.push({id:999,method:'Input.insertText',params:{text:'x'}});})`

Because one case matches several regex alternatives, narrowing any single alternative survives; the
battery needs one case per alternative, not one per branch.

### 5.5 Coordinate check pins only X (M08, counter:114)

`leg-<name>-coords` tests `clientX === BTN.x && clientY === BTN.y`; every coordinate case moves
`clientX` only. Verified: a receipt with `clientY = 151` on the `mouse` leg is rejected by the pinned
counter (`leg-mouse-coords`) and accepted by M08.

`add('mouse-coords-y','leg-mouse-coords',(r)=>{firstOf(r,'mouse').clientY=151;})`

### 5.6 Absence cases missing — the counter is right, the battery never proves it (M24, M26)

These two mutants are **over-strict**: they reject receipts the pinned counter accepts. They survived
because the battery has no "stays clean" case class (it runs one positive receipt and one negative per
id), so both an over-strict and a permissive edit pass. Closing them needs a small extension — a case
that asserts the counter exits 0 on a mutated-but-legitimate receipt, which the battery already has the
machinery for (the laundering path already recomputes `legShape` from the counter's own `derived`).

- **M24** (counter:66, `MOVES` loses `touchmove`): the pinned counter tolerates a `touchmove` inside a
  leg (moves are excluded from `seq`); the mutant rejects it (`leg-touch-seq`). The real receipt
  contains no move events at all, so the exclusion rule is unpinned in either direction.
  Proposed clean case: `addClean('touch-leg-move-tolerated',(r)=>insertAt(r,'touch',{type:'touchmove',pointerType:'touch'}))`
  (needs the battery's existing two-pass `legShape` recompute, as the laundering path already does).
- **M26** (counter:61, `canon` loses key sorting): the pinned counter is order-insensitive on `plan`
  and `legShape`; the mutant rejects a receipt whose `params` keys are in a different order
  (`plan-frozen`). No case proves order-insensitivity.
  Proposed clean case: `addClean('plan-key-order',(r)=>{r.plan=r.plan.map(l=>l.params?{params:Object.fromEntries(Object.entries(l.params).reverse()),name:l.name}:l);})`

### 5.7 Framework-level cases for §3

- Kill M22 (shrinking declaration): in `negatives-synthtap-r70.mjs` after the `coverageGap` line, add
  `const undeclared = [...covered].filter(id => !listed.includes(id));` and include it in `allOk`
  (report both lists).
- Kill M27 (lying `checks` map): have `runCounter` return the parsed JSON and, for every case, also
  require `o.checks && o.checks[c.expect] === false`.

---

## 6. Limits of this probe

- The detector is the battery, by assignment. A survivor is a statement about **the battery's power**,
  not about the scored receipt: the C1 receipt is a real cold run, and the pinned counter still exits 0
  on it. What a survivor says is that a *forged or laundered* receipt can now keep the counter's form
  while breaking one of the claimed invariants — which is exactly the case the battery exists to stop
  (round-69 lesson R1: counters prove form only).
- `verify-live-r70.mjs` pins `scripts/check-synthtap-r70.mjs` by digest (`counter-pin`, line 126), so a
  mutated counter cannot reach a scored run. The exposure is a future *edit* of the pinned counter whose
  defect the battery cannot see; the 31 mutant counters under `mutants/` are a ready-made regression
  corpus for that.
- Two survivors (M21, M07) are genuine equivalents, not gaps; M24/M26 are over-strict and are graded as
  absence-case gaps, not escapes.
- No production, lane-root, fleet or sibling file was touched; the shared script copies were never
  written (all mutants live in per-mutant directories) and both pins were re-verified after the wave.
  No pacman transaction and no tool install was needed (`node v24.21.0`, `chromium 155.0.8059.84` were
  already present); no git/jj mutation was performed.

## 7. Artifacts

```
report.md                          this file
mutants-summary.json               machine table: verdicts, shas, failed cases, probe results
mutants.json / run-one.mjs         mutant specs + per-mutant harness (re-runnable)
probe.mjs / probe-results.json     differential probe harness + every pristine/mutant exit pair
mutants/check-synthtap-r70-<id>.mjs   31 single-line mutants (each diffLines=1 vs the pin)
mutants/check-synthtap-r70-<id>.result.json   per-mutant battery exit/summary + restoration evidence
probe/<id>-variant.json            21 probe receipts (+ extra-*.json for §5.2)
baseline-battery.json              pristine counter + battery: exit 0, 95/95, coverageGap=[]
check-synthtap-r70.pristine.mjs    a2ed7619...  (byte-identical copy of the pinned counter)
negatives-synthtap-r70.pristine.mjs 22244a81... (byte-identical copy of the pinned battery)
```
