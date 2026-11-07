# R79Mut1 — independent semantic mutants of the r79 showpicker counter

Seat: `R79Mut1` (mutation tester, leaf, no dispatch). Round 79, wave w1.
Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`, base `24c821895f31f9dcb66ac2f357bc947818b0408c`, digests commit D `80830674d421e97bb1c01c836bfbb3dc49687dbc`.

## Instruments (read from the current `.ufo/waves/round-79/freeze.txt`)

| file | sha256 |
|---|---|
| `scripts/check-showpicker-r79.mjs` | `0dc76277a870f71d21e0bc4e840246b85831b2dbed6e659ad270df3043cd3f76` |
| `scripts/negatives-showpicker-r79.mjs` | `8c64f8e04b4afeba56ceebc30f3987c3ce6b20f07c4c65d7515a496a927f5662` |
| `scripts/chrome-cdp-showpicker-round79.mjs` | `e9c87159e5d5212237437eb7a80a2d26fcd8086603dae1e37db64ce1aaf94933` |
| `.ufo/waves/round-79/controls/c1/prior-set.txt` | `644a4274158f47b8c691759a7c93810da093142984e2552573e83a0b12143738` |

The freeze was re-issued at 18:18:31–18:18:47 (the counter moved from `4072031b…` to `0dc76277…` by a
`priorReal` change that also excludes `--prior` receipts from the walk). The first sweep ran on `4072031b…`;
every number below was re-produced on `0dc76277…`. Both sweeps agree (0 killed, 76 survived).

Receipt under test, pinned: object copy of the committed (a) receipt, nonce `tabi-r79-l1-80830674d421`,
10 legs, 37 page events, fixture `2e80efa0c96d4c3ccc952d9b54353d8c079e6c9156abbc3d78dfd38d0bc5c5c8`.
The live `corpus/evidence/round79/chromium-showpicker/receipt.json` was being rewritten by another seat's
scored run during this probe (observed mid-write at 18:19:12 with a different nonce, `finishedAt: null`,
4 legs). Every result here is bound to the pinned copy (`receipt-sweep.json` in the seat dir), never to the
moving file.

## Method

1. 76 single-site semantic edits, each a real weakening (dropped conjunct, flipped comparison, widened
   tolerance, accepted extra value, skipped binding). Each `from` string is asserted to occur exactly once
   in the pristine counter; the mutated counter passes `node --check`.
2. Per mutant, a scratch copy `runs/mut-<id>/` holds the mutated counter **and** the frozen battery. The
   battery resolves the counter by path (`path.join(dirname(battery), 'check-showpicker-r79.mjs')`), so the
   mutant is what runs. No lane file is touched.
3. The battery runs with the pinned receipt on a mirror lane (`runs/baseline-lane/tabi-shokunin`) that
   carries the two walked trees, the controls, and an exempted copy of the pinned receipt. This keeps the
   content-bound exemption resolvable and makes the sweep immune to the live receipt churn.
4. Outcome: battery exit 0 = **survived**; exit 1 = **killed** (noticing cases recorded); anything else =
   crashed. **Positive control:** four frozen-list mutants (`schema-accepts-any`, `leg-marks-late-ignored`,
   `event-window-dropped`, `cancel-law-any`) run through the same harness are all killed (battery exit 1;
   1, 1, 1 and 2 noticing cases; recorded in `controls.json` in the seat dir), so the harness does detect
   targeted mutations. The controls were re-run on the current counter bytes (`0dc76277…`) with the pinned
   receipt and the same mirror lane as the sweep.
5. **Witness** for a survivor: mutate the pinned receipt (or build a mirror lane) so the pristine counter
   refuses with the mutant's rule id and the mutant exits 0 clean. A witness proves the counter still holds
   the rule and the battery is blind to it.
6. **Subsumption probe** for the rest: apply a natural receipt mutation and record the firing ids for
   pristine and mutant. If the mutant still refuses, the mutated conjunct is subsumed by the named check.

Baseline (pristine counter + frozen battery, pinned receipt): **exit 0, cases 90, passed 90, failed 0,
coverage declared 56 / covered 56 / uncovered [] / unknown []**.

## Result

| | count |
|---|---|
| mutants applied | 76 |
| killed by the frozen battery | **0** |
| survived | **76** |
| crashed / unapplied | 0 |
| survivors with a witness that kills them | **56** |
| survivors subsumed by another check/conjunct | 17 |
| survivors structurally unreachable | 1 |
| survivors inert on the frozen prior set | 2 |

The battery is a one-case-per-check battery: each case exercises exactly **one** conjunct of a
multi-conjunct rule. 56 of 76 conjunct-level weakenings leave all 90 cases green while a crafted receipt
makes the pristine counter refuse. The counter is strong; the battery is blind to the other conjuncts.

## Survivors (every one, with the mutation text and why the battery misses it)

| id | rule | mutation | class | evidence |
|---|---|---|---|---|
| `ports-http-floor-dropped` | `ports-declared` | `ports.http >= 1024 && ports.cdp >= 1024` → `ports.http >= 0 && ports.cdp >= 1024` | witness-killed | witness: pristine exit 1 [ports-declared], mutant exit 0 [] |
| `ports-cdp-floor-dropped` | `ports-declared` | `ports.http >= 1024 && ports.cdp >= 1024` → `ports.http >= 1024 && ports.cdp >= 0` | witness-killed | witness: pristine exit 1 [ports-declared], mutant exit 0 [] |
| `host-cdp-product-dropped` | `host-chromium` | `host.chromium === HOST.chromium && host.cdpProduct === HOST.cdpProduct && host.cdpProtocolVersion === HOST.cdpProtocolVersion` → `host.chromium === HOST.chromium && host.cdpProtocolVersion === HOST.cdpProtocolVersion` | witness-killed | witness: pristine exit 1 [host-chromium], mutant exit 0 [] |
| `host-protocol-dropped` | `host-chromium` | `host.chromium === HOST.chromium && host.cdpProduct === HOST.cdpProduct && host.cdpProtocolVersion === HOST.cdpProtocolVersion` → `host.chromium === HOST.chromium && host.cdpProduct === HOST.cdpProduct` | witness-killed | witness: pristine exit 1 [host-chromium], mutant exit 0 [] |
| `fixture-viewport-dropped` | `fixture-hash` | `same(r.fixture.viewport, VIEWPORT)` → `true` | witness-killed | witness: pristine exit 1 [fixture-hash], mutant exit 0 [] |
| `fixture-keyset-dropped` | `fixture-hash` | `same(Object.keys(r.fixture).sort(), ['origin', 'patch', 'sha256', 'viewport'])` → `true` | witness-killed | witness: pristine exit 1 [fixture-hash], mutant exit 0 [] |
| `fixture-origin-dropped` | `ports-declared` | `isObj(r.fixture) && r.fixture.origin === 'http://127.0.0.1:' + ports.http` → `isObj(r.fixture)` | witness-killed | witness: pristine exit 1 [ports-declared], mutant exit 0 [] |
| `frame-tree-parent-dropped` | `frame-tree` | `ftree.mainFrameParentId === null` → `ftree.mainFrameParentId !== undefined` | witness-killed | witness: pristine exit 1 [frame-tree], mutant exit 0 [] |
| `frame-tree-id-regex-loose` | `frame-tree` | `/^[0-9A-F]{32}$/.test(ftree.mainFrameId)` → `/^[0-9A-F]{1,}$/.test(ftree.mainFrameId)` | witness-killed | witness: pristine exit 1 [frame-tree], mutant exit 0 [] |
| `nonce-suffix-min-dropped` | `nonce-shape` | `/^tabi-r79-[a-z0-9-]{4,48}$/.test(r.nonce)` → `/^tabi-r79-[a-z0-9-]{1,48}$/.test(r.nonce)` | witness-killed | witness: pristine exit 1 [nonce-shape], mutant exit 0 [] |
| `nonce-suffix-max-dropped` | `nonce-shape` | `/^tabi-r79-[a-z0-9-]{4,48}$/.test(r.nonce)` → `/^tabi-r79-[a-z0-9-]{4,}$/.test(r.nonce)` | witness-killed | witness: pristine exit 1 [nonce-shape], mutant exit 0 [] |
| `chooser-wait-upper-widened` | `leg-records` | `l.chooserWaitMs <= 3000` → `l.chooserWaitMs <= 3001` | witness-killed | witness: pristine exit 1 [leg-records], mutant exit 0 [] |
| `chooser-wait-lower-dropped` | `leg-records` | `l.chooserWaitMs >= 0 && l.chooserWaitMs <= 3000` → `l.chooserWaitMs <= 3000` | witness-killed | witness: pristine exit 1 [leg-records], mutant exit 0 [] |
| `marks-min-count-widened` | `leg-marks` | `arr(l.marks).length >= 3` → `arr(l.marks).length >= 2` | subsumed | subsumed by leg-marks; probe pristine [leg-marks] / mutant [leg-marks] |
| `marks-start-name-dropped` | `leg-marks` | `arr(l.marks)[0].name === 'start'` → `true` | witness-killed | witness: pristine exit 1 [leg-marks], mutant exit 0 [] |
| `marks-pre-name-dropped` | `leg-marks` | `arr(l.marks)[1].name === 'pre'` → `true` | witness-killed | witness: pristine exit 1 [leg-marks], mutant exit 0 [] |
| `marks-settle-name-dropped` | `leg-marks` | `arr(l.marks).slice(-1)[0].name === 'settle'` → `true` | witness-killed | witness: pristine exit 1 [leg-marks], mutant exit 0 [] |
| `marks-monotonic-dropped` | `leg-marks` | `(i === 0 \|\| m.at >= a[i - 1].at)` → `true` | witness-killed | witness: pristine exit 1 [leg-marks], mutant exit 0 [] |
| `marks-grid-dropped` | `leg-marks` | `num(m.at) && onGrid(m.at)` → `num(m.at)` | witness-killed | witness: pristine exit 1 [leg-marks], mutant exit 0 [] |
| `closedAt-num-dropped` | `leg-marks` | `num(l.closedAt) && ` → `` | witness-killed | witness: pristine exit 1 [leg-marks], mutant exit 0 [] |
| `err-intercept-dropped` | `leg-records` | `errOk(l.interceptError) && ` → `` | witness-killed | witness: pristine exit 1 [leg-records], mutant exit 0 [] |
| `err-prior-click-dropped` | `leg-records` | `errOk(l.priorClickError) && ` → `` | witness-killed | witness: pristine exit 1 [leg-records], mutant exit 0 [] |
| `err-trigger-dropped` | `leg-records` | `errOk(l.triggerError) && ` → `` | witness-killed | witness: pristine exit 1 [leg-records], mutant exit 0 [] |
| `err-trigger2-dropped` | `leg-records` | `errOk(l.trigger2Error) && ` → `` | witness-killed | witness: pristine exit 1 [leg-records], mutant exit 0 [] |
| `err-dismiss-dropped` | `leg-records` | `errOk(l.dismissError) && ` → `` | witness-killed | witness: pristine exit 1 [leg-records], mutant exit 0 [] |
| `err-code-integer-dropped` | `leg-records` | `(e.code === null \|\| Number.isInteger(e.code))` → `true` | witness-killed | witness: pristine exit 1 [leg-records], mutant exit 0 [] |
| `err-keyset-dropped` | `leg-records` | `same(Object.keys(e).sort(), ['code', 'message'])` → `isObj(e)` | witness-killed | witness: pristine exit 1 [leg-records], mutant exit 0 [] |
| `send-prologue-order-dropped` | `send-log-allowlist` | `same(log.slice(0, 6).map((c) => c.method), ['Browser.getVersion', 'Page.enable', 'Runtime.enable', 'Page.getFrameTree', 'Emulation.setDeviceMetricsOverride', 'Page.navigate'])` → `true` | witness-killed | witness: pristine exit 1 [send-log-allowlist], mutant exit 0 [] |
| `send-navigate-count-widened` | `send-log-allowlist` | `log.filter((c) => c.method === 'Page.navigate').length !== 1` → `log.filter((c) => c.method === 'Page.navigate').length < 1` | witness-killed | witness: pristine exit 1 [send-log-allowlist], mutant exit 0 [] |
| `send-getframetree-count-widened` | `send-log-allowlist` | `log.filter((c) => c.method === 'Page.getFrameTree').length !== 1` → `log.filter((c) => c.method === 'Page.getFrameTree').length < 1` | witness-killed | witness: pristine exit 1 [send-log-allowlist], mutant exit 0 [] |
| `send-navigate-url-dropped` | `send-log-allowlist` | `!same(log.find((c) => c.method === 'Page.navigate').params, { url: 'http://127.0.0.1:' + ports.http + '/?run=' + encodeURIComponent(r.nonce) })` → `false` | witness-killed | witness: pristine exit 1 [send-log-allowlist], mutant exit 0 [] |
| `send-min-length-widened` | `send-log-allowlist` | `log.length < 10` → `log.length < 5` | witness-killed | witness: pristine exit 1 [send-log-allowlist], mutant exit 0 [] |
| `send-params-object-dropped` | `send-log-allowlist` | `isObj(c.params)` → `true` | witness-killed | witness: pristine exit 1 [send-log-allowlist], mutant exit 0 [] |
| `eval-wrapper-target-agnostic` | `send-log-allowlist` | `if (p.kind === 'click' \|\| p.kind === 'showpicker' \|\| p.kind === 'showpicker-twice') allowed.push(wrapperFor(p.target));` → `allowed.push(wrapperFor('s'), wrapperFor('m'), wrapperFor('d'), wrapperFor('k'), wrapperFor('dis'));` | witness-killed | witness: pristine exit 1 [send-log-allowlist], mutant exit 0 [] |
| `plan-prior-order-dropped` | `plan-calls` | `leg.priorReleaseId <= leg.priorPressId` → `false` | witness-killed | witness: pristine exit 1 [plan-calls], mutant exit 0 [] |
| `plan-click-release-dropped` | `plan-calls` | `if (leg.priorPressId === null \|\| leg.priorReleaseId !== null) planBad.push(leg.name + ':click-ids');` → `if (leg.priorPressId === null) planBad.push(leg.name + ':click-ids');` | subsumed | subsumed by plan-calls; probe pristine [plan-calls] / mutant [plan-calls] |
| `plan-trigger2-unexpected-dropped` | `plan-calls` | `} else if (leg.trigger2SendId !== null) planBad.push(leg.name + ':trigger2-unexpected');` → `}` | witness-killed | witness: pristine exit 1 [plan-calls], mutant exit 0 [] |
| `plan-trigger2-order-dropped` | `plan-calls` | `leg.trigger2SendId !== t2.id \|\| leg.trigger2SendId <= leg.triggerSendId` → `leg.trigger2SendId !== t2.id` | unreachable | t2 is the SECOND wrapper occurrence in a 1..N-id log, so t2.id > triggerSendId always; the `<=` conjunct can never be the sole cause |
| `plan-dismiss-unexpected-dropped` | `plan-calls` | `else if (leg.dismissSendId !== null) planBad.push(leg.name + ':dismiss-unexpected');` → `` | witness-killed | witness: pristine exit 1 [plan-calls], mutant exit 0 [] |
| `plan-intercept-id-dropped` | `plan-calls` | `if (p.intercept && leg.interceptSendId !== log.find((c) => c.method === 'Page.setInterceptFileChooserDialog').id) planBad.push(leg.name + ':intercept-id');` → `if (false) planBad.push(leg.name + ':intercept-id');` | witness-killed | witness: pristine exit 1 [plan-calls], mutant exit 0 [] |
| `plan-unknown-leg-skipped` | `plan-calls` | `if (!p) { planBad.push('unknown-leg'); continue; }` → `if (!p) { continue; }` | subsumed | subsumed by plan-frozen + leg-order + leg-records; probe pristine [plan-frozen, leg-order, leg-records, plan-calls, leg-sp-click-control-x, gesture-law, activation-law, intercept-law] / mutant [plan-frozen, leg-order, leg-records, leg-sp-click-control-x, gesture-law, activation-law, intercept-law] |
| `cdp-open-keyset-dropped` | `cdp-event-log-closed` | `!same(Object.keys(o.params).sort(), ['backendNodeId', 'frameId', 'mode'])` → `false` | witness-killed | witness: pristine exit 1 [cdp-event-log-closed], mutant exit 0 [] |
| `cdp-mode-enum-dropped` | `cdp-event-log-closed` | `!['selectSingle', 'selectMultiple'].includes(o.params.mode)` → `typeof o.params.mode !== 'string'` | subsumed | subsumed by mode-law + leg-sp-<name>; probe pristine [cdp-event-log-closed, leg-sp-click-then-show, mode-law] / mutant [leg-sp-click-then-show, mode-law] |
| `cdp-nav-url-dropped` | `cdp-event-log-closed` | `nav[0].params.url === 'http://127.0.0.1:' + ports.http + '/?run=' + encodeURIComponent(r.nonce)` → `typeof nav[0].params.url === 'string'` | witness-killed | witness: pristine exit 1 [cdp-event-log-closed], mutant exit 0 [] |
| `cdp-nav-count-widened` | `cdp-event-log-closed` | `if (nav.length !== 1 \|\| ` → `if (nav.length < 1 \|\| ` | witness-killed | witness: pristine exit 1 [cdp-event-log-closed], mutant exit 0 [] |
| `cdp-aftersend-integer-dropped` | `cdp-event-log-closed` | `isObj(e) && isObj(e.params) && Number.isInteger(e.afterSendId)` → `isObj(e) && isObj(e.params)` | witness-killed | witness: pristine exit 1 [cdp-event-log-closed], mutant exit 0 [] |
| `typed-ret-dropped` | `event-types` | `(e.ret === null \|\| typeof e.ret === 'string')` → `true` | witness-killed | witness: pristine exit 1 [event-types], mutant exit 0 [] |
| `typed-seq-loosened` | `event-types` | `Number.isInteger(e.seq)` → `num(e.seq)` | subsumed | subsumed by seq-monotonic; probe pristine [event-types, seq-monotonic] / mutant [seq-monotonic] |
| `typed-act-dropped` | `event-types` | `(e.act === null \|\| typeof e.act === 'boolean')` → `true` | subsumed | subsumed by leg-sp-<name>; probe pristine [leg-sp-click-then-show] / mutant [leg-sp-click-then-show] |
| `typed-files-dropped` | `event-types` | `(e.files === null \|\| Array.isArray(e.files))` → `true` | subsumed | subsumed by leg-sp-<name> + no-selection-law; probe pristine [event-types, leg-sp-click-then-show, no-selection-law] / mutant [leg-sp-click-then-show, no-selection-law] |
| `typed-istrusted-dropped` | `event-types` | `typeof e.isTrusted === 'boolean'` → `true` | subsumed | subsumed by leg-sp-<name> + trust-law; probe pristine [event-types, leg-sp-click-then-show, trust-law] / mutant [leg-sp-click-then-show, trust-law] |
| `event-window-startleg-dropped` | `event-leg-window` | `e.leg !== 'start'` → `true` | witness-killed | witness: pristine exit 1 [event-leg-window], mutant exit 0 [] |
| `event-quantum-tolerance-widened` | `event-time-quantum` | `Math.abs(v * 10 - Math.round(v * 10)) <= 1e-4` → `Math.abs(v * 10 - Math.round(v * 10)) <= 1e-3` | witness-killed | witness: pristine exit 1 [event-time-quantum], mutant exit 0 [] |
| `leg-shape-act-dropped` | `leg-sp-click-then-show` | `for (const k of ['seq', 'trusted', 'act', 'xy', 'files', 'opened', 'state'])` → `for (const k of ['seq', 'trusted', 'xy', 'files', 'opened', 'state'])` | witness-killed | witness: pristine exit 1 [leg-sp-click-then-show], mutant exit 0 [] |
| `gesture-ret-dropped` | `gesture-law` | `(want.ok ? got.ret !== want.ret : (got.name !== want.name \|\| got.message !== want.message))` → `(want.ok ? false : (got.name !== want.name \|\| got.message !== want.message))` | witness-killed | witness: pristine exit 1 [gesture-law], mutant exit 0 [] |
| `gesture-unknown-leg-skipped` | `gesture-law` | `if (want === undefined) { spBad.push(leg.name + ':unknown-leg'); continue; }` → `if (want === undefined) continue;` | subsumed | subsumed by plan-frozen + leg-order + leg-records; probe pristine [plan-frozen, leg-order, leg-records, plan-calls, leg-sp-click-control-x, gesture-law, activation-law, intercept-law] / mutant [plan-frozen, leg-order, leg-records, plan-calls, leg-sp-click-control-x, activation-law, intercept-law] |
| `consumption-first-ok-dropped` | `consumption-law` | `isObj(twice.showPicker) && twice.showPicker.ok === true && ` → `isObj(twice.showPicker) && ` | subsumed | subsumed by gesture-law; probe pristine [gesture-law, consumption-law] / mutant [gesture-law] |
| `immutable-open-count-dropped` | `immutable-law` | `arr(dis.cdpEventLog).filter((e) => e.method === 'Page.fileChooserOpened').length === 0 && ` → `` | subsumed | subsumed by leg-sp-disabled + intercept-law; probe pristine [leg-sp-disabled, immutable-law, intercept-law] / mutant [leg-sp-disabled, intercept-law] |
| `mode-law-missing-descriptor-ok` | `mode-law` | `if (!d \|\| opens.some((e) => e.params.mode !== wantMode))` → `if (opens.some((e) => e.params.mode !== wantMode))` | subsumed | subsumed by fixture-descriptors; probe pristine [mode-law, fixture-descriptors] / mutant [fixture-descriptors] |
| `no-selection-svalue-dropped` | `no-selection-law` | `&& st.sValue === ''` → `` | subsumed | subsumed by leg-sp-<name>; probe pristine [leg-sp-click-then-show, no-selection-law] / mutant [leg-sp-click-then-show] |
| `no-selection-dismiss-state-dropped` | `no-selection-law` | `if (leg.stateAfterDismiss !== null && !(isObj(leg.stateAfterDismiss) && ['s', 'm', 'd', 'k', 'dis'].every((k) => Array.isArray(leg.stateAfterDismiss[k]) && leg.stateAfterDismiss[k].length === 0))) stateBad.push(leg.name + ':dismiss-state');` → `` | witness-killed | witness: pristine exit 1 [no-selection-law], mutant exit 0 [] |
| `intercept-open-count-loosened` | `intercept-law` | `opens !== 1) intBad.push(leg.name + ':intercept-but-' + opens)` → `opens < 1) intBad.push(leg.name + ':intercept-but-' + opens)` | subsumed | subsumed by leg-sp-<name> + cdp-event-log-closed; probe pristine [cdp-event-log-closed, leg-sp-click-then-show, intercept-law] / mutant [cdp-event-log-closed, leg-sp-click-then-show] |
| `dismiss-cancel-events-dropped` | `dismiss-law` | `&& arr(l.pageEvents).every((e) => e.type !== 'cancel')` → `` | subsumed | subsumed by cancel-law + leg-sp-<name>; probe pristine [leg-sp-click-then-show, cancel-law, dismiss-law] / mutant [leg-sp-click-then-show, cancel-law] |
| `trust-nonempty-dropped` | `trust-law` | `events.length > 0 && events.every((e) => e.isTrusted === true)` → `events.every((e) => e.isTrusted === true)` | subsumed | subsumed by leg-sp-<name> + event-types; probe pristine [event-types, event-time-quantum, leg-sp-click-then-show, leg-sp-intercept-off-click-then-show, leg-sp-multiple-show, leg-sp-disabled, leg-sp-cancel-armed, leg-sp-show-twice, leg-sp-click-control, cancel-law, trust-law] / mutant [event-types, event-time-quantum, leg-sp-click-then-show, leg-sp-intercept-off-click-then-show, leg-sp-multiple-show, leg-sp-disabled, leg-sp-cancel-armed, leg-sp-show-twice, leg-sp-click-control, cancel-law] |
| `argv-stderr-link-dropped` | `host-argv` | `typeof leg.stderrHead !== 'string' \|\| !leg.stderrHead.includes(dl.url)` → `typeof leg.stderrHead !== 'string'` | witness-killed | witness: pristine exit 1 [host-argv], mutant exit 0 [] |
| `argv-token-regex-loosened` | `host-argv` | `/^[0-9a-f]{12}$/.test(tok)` → `typeof tok === 'string'` | subsumed | subsumed by replay-launch-token; probe pristine [host-argv, replay-launch-token] / mutant [replay-launch-token] |
| `argv-browserid-regex-loosened` | `host-argv` | `/^[0-9a-f-]{36}$/.test(dl.browserId)` → `typeof dl.browserId === 'string'` | witness-killed | witness: pristine exit 1 [host-argv], mutant exit 0 [] |
| `teardown-portprobes-dropped` | `teardown-closure` | `Object.values(l.teardown.portProbes).every((v) => v === 'closed')` → `true` | witness-killed | witness: pristine exit 1 [teardown-closure], mutant exit 0 [] |
| `teardown-curl-dropped` | `teardown-closure` | `Object.values(l.teardown.postKillCurl).every((v) => v === 7)` → `true` | witness-killed | witness: pristine exit 1 [teardown-closure], mutant exit 0 [] |
| `server-log-count-widened` | `server-log-binding` | `arr(l.serverLog).filter((s) => isObj(s) && s.path === '/').length === 1` → `arr(l.serverLog).filter((s) => isObj(s) && s.path === '/').length >= 1` | witness-killed | witness: pristine exit 1 [server-log-binding], mutant exit 0 [] |
| `server-log-404-dropped` | `server-log-binding` | `arr(l.serverLog).filter((s) => isObj(s) && s.path !== '/').every((s) => s.status === 404)` → `true` | witness-killed | witness: pristine exit 1 [server-log-binding], mutant exit 0 [] |
| `run-window-lower-widened` | `run-window` | `t1 - t0 >= 20000` → `t1 - t0 >= 19999` | witness-killed | witness: pristine exit 1 [run-window], mutant exit 0 [] |
| `run-window-upper-inclusive` | `run-window` | `t1 - t0 < 600000` → `t1 - t0 <= 600000` | witness-killed | witness: pristine exit 1 [run-window], mutant exit 0 [] |
| `replay-frac-loosened` | `replay-event-timeline` | `const TOL = 0.05, GAP_MIN = 50, FRAC = 0.5, GAP_FRAC = 0.75;` → `FRAC = 0.49` | inert-prior-set | all four frozen priors carry 37 events: ceil(0.49·37)=19=ceil(0.5·37); unbracketable until a prior has ≥ 100 events |
| `replay-gapfrac-loosened` | `replay-event-timeline` | `const TOL = 0.05, GAP_MIN = 50, FRAC = 0.5, GAP_FRAC = 0.75;` → `GAP_FRAC = 0.7` | inert-prior-set | all four frozen priors carry 1 gap: ceil(0.7·1)=1=ceil(0.75·1); unbracketable until a prior has ≥ 7 gaps |
| `walk-unreadable-dir-skipped` | `prior-set-complete` | `if (w.error) { outside.push('unreadable-dir:' + w.dir); continue; }` → `if (w.error) { continue; }` | witness-killed | witness: pristine exit 1 [prior-set-complete], mutant exit 0 [] |

## Routed defects for r80

1. **`replay-frac-loosened` — real, unbracketable on the frozen prior set.** Lowering `FRAC` from 0.5 to 0.49
   survives every case and every prior: all four priors carry 37 page events, and ceil(0.49·37) =
   ceil(0.5·37) = 19. The battery's sweep is self-consistent because it re-reads the counter's *printed*
   `absNeed`, so it cannot see the fraction move. A prior with ≥ 100 events (e.g. 100 → 49 vs 50) is needed
   to bracket it. Same class: the battery's own `unbracketed` note already admits the gap rule's independent
   kill is not constructible.
2. **`replay-gapfrac-loosened` — real, unbracketable on the frozen prior set.** `GAP_FRAC` 0.75 → 0.7 needs
   a prior with ≥ 7 gaps (ceil(0.7·7)=5 < ceil(0.75·7)=6); every frozen prior carries exactly 1 gap, where
   both round to 1.
3. **`plan-trigger2-order-dropped` — dead conjunct.** `t2` is the second wrapper occurrence in a send log
   whose ids are 1..N in array order, so `t2.id > triggerSendId` always; `trigger2SendId <= triggerSendId`
   can never be true when `trigger2SendId === t2.id`. Deleting the conjunct changes nothing observable.
4. **17 redundant conjuncts** (`marks-min-count-widened`, `plan-click-release-dropped`,
   `plan-unknown-leg-skipped`, `cdp-mode-enum-dropped`, `typed-seq-loosened`, `typed-act-dropped`,
   `typed-files-dropped`, `typed-istrusted-dropped`, `gesture-unknown-leg-skipped`,
   `consumption-first-ok-dropped`, `immutable-open-count-dropped`, `mode-law-missing-descriptor-ok`,
   `no-selection-svalue-dropped`, `intercept-open-count-loosened`, `dismiss-cancel-events-dropped`,
   `trust-nonempty-dropped`, `argv-token-regex-loosened`). Each is subsumed by the check named in the table
   (probe evidence: the mutant still refuses, via the other check). Maintainability finding, not a soundness
   gap — but each is a rule the counter appears to bind and does not independently enforce.

## Battery coverage additions implied by the 56 witnesses

Each witness in the table is a receipt that the pristine counter refuses and the mutant accepts. The
battery needs one case per named conjunct; the cheapest set is the 56 witness receipts, already written to
`runs/witness/<id>.json` in scratch and reproducible from the seat dir's `results.json` (each record carries
the witness description and the exact pristine/mutant verdicts). Highest-value additions, because they
weaken a *law* rather than a shape:

- `gesture-ret-dropped` (a successful showPicker returning a non-`undefined` value),
- `leg-shape-act-dropped` (the per-event activation column),
- `no-selection-dismiss-state-dropped` (post-dismiss state),
- `event-quantum-tolerance-widened` (0.0005 ms off the 0.1 ms grid),
- `eval-wrapper-target-agnostic` (the showPicker wrapper on a non-plan element),
- `send-min-length-widened` (a leg pruned to 8 CDP calls),
- `walk-unreadable-dir-skipped` (a chmod-000 directory inside a walked tree).

## Observations (record only; no amendment proposed)

- The frozen battery prints `cases: 90` (83 refusal + 7 accept), `passed: 90`, `failed: 0`,
  `coverage: {declared: 56, covered: 56, uncovered: [], unknown: []}`. The claims/freeze prose and the
  predicate say "87/87 allOk with coverageGap []". The instrument's own field names are `uncovered`/`unknown`,
  not `coverageGap`; the count 90 does not match 87. This is a record/instrument naming mismatch for the
  planner to reconcile; it does not change any verdict here.
- The freeze and claims were re-issued at 18:18:31–18:18:47 while this seat was running (counter
  `4072031b…` → `0dc76277…`, claims sha `fa99b214…` → `91d3f723…`). Both sweeps were run; results agree.
- The live (a) receipt was rewritten by another seat's scored run mid-probe. All results here are bound to
  the pinned copy; a seat that re-runs the battery against the live file while a scored run is in flight
  will see the honest case fail for reasons unrelated to any mutant.
- The battery's own `unbracketed` list is accurate: `chooserWaitMs` 3001 is not exercised, and my
  `chooser-wait-upper-widened` (3000 → 3001) confirms it with a witness.

## Bounds and restoration evidence

- No lane file was written by this seat. Counter sha256 before and after: `0dc76277…` (matches `freeze.txt`);
  battery `8c64f8e0…` (matches `freeze.txt`); `kill-power-r79.mjs` `48371285…` (untouched).
- All scratch work lived under `/fast/scratch/hyaku/tabi-r79/R79Mut1/` (mutant copies, battery work dirs,
  witness receipts, mirror lanes) and is deleted before yield. No JSON was written under
  `.ufo/waves/round-79/` or `corpus/evidence/round79/`; the only files this seat leaves in the lane are this
  prose report and the seat dir `.ufo/waves/round-79-seats/R79Mut1/` (`mutants.json`, `results.json`,
  `probes.json`, `summary.json`, `receipt-sweep.json`).
- No git/jj command was run. No tool was installed (node v24.21.0 already present; no channel used).

## Seat dir contents

- `mutants.json` — the 76-mutant list (id, rule, weakening, from, to, mutant sha256).
- `results.json` — full per-mutant record: mutation, battery verdict, classification, witness
  (pristine/mutant exits and findings), subsumption probe, subsuming checks.
- `probes.json` — raw subsumption probe verdicts.
- `summary.json` — counts, routed defects, blind spots, redundant conjuncts.
- `controls.json` — the four positive-control mutants and their battery verdicts.
- `harness/` — the exact scripts used (`mutants.mjs`, `witness.mjs`, `run.mjs`, `rerun-witness.mjs`,
  `probe.mjs`, `finalize.mjs`, `ctl.mjs`); with `receipt-sweep.json` they reproduce every number above.
- `receipt-sweep.json` — the pinned receipt every run was bound to.
