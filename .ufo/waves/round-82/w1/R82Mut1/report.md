# R82Mut1 — independent conjunct-level mutants of the r82 counter (C1 coverage, wave w1)

Seat: R82Mut1, round 82, wave w1. Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Target: `scripts/check-showpicker-r82.mjs` against the frozen battery `scripts/negatives-showpicker-r82.mjs`.
Constraint honoured: the 46 entries of `scripts/kill-power-r82.mjs` are **not** reused. The 108 mutants below share at most a `from` anchor with four kill-power entries, and every `from -> to` pair is different; no name is reused.

## 1. Baseline (pristine counter, committed receipt)

The predicate's instrument numbers in the seat brief ("56 checks", "62 cases", "46 mutants") are r81-era text. The committed r82 instruments declare **64 checks** and **70 battery cases** (`claims.json`, frozen before this seat ran). Baseline measured here:

| item | value |
|---|---|
| battery | `scripts/negatives-showpicker-r82.mjs` (sha256 `e2d554e6ffd4e3b35d7b00f9301e3d1d0c59f28876a3f830aa229b455a0f32ff`) |
| counter | `scripts/check-showpicker-r82.mjs` (sha256 `d0d26fe59b6f5067b6a8021d6e7e039466e6ded46bb4cd4f5eda6f07b444d62e`) |
| receipt | `corpus/evidence/round82/chromium-showpicker/receipt.json` (sha256 `75c3c4428fdf47baf07e486e9c7fd9b3bac1a292ed0e3441253a5398378537d4`) |
| pins used | driver `2085c2a7…3f1`, nonce `tabi-r82-scored1`, fixture `7373c608…b4d` |
| battery result | **exit 0, 70/70 cases, failed 0, coverage declared 64, covered 64, uncovered `[]`** |

The committed receipt carries nonce `tabi-r82-scored1` and driver pin `2085c2a7…` (the round-level nonce `tabi-r82-l1-5204a0581de5` in the brief is the round identity, not the scored receipt's). Running against the receipt's own pins is what makes the baseline clean; a receipt/pin mismatch would make every mutant look "killed" by the identity checks. The pins above are the ones that produce the green baseline.

## 2. Method

108 semantic edits, each applied to a **copy** of the counter in `/fast/scratch/hyaku/tabi-r82/R82Mut1/mut-<name>/` together with a copy of the frozen battery. Every mutant is one of: a dropped conjunct, a flipped/loosened comparison, a widened tolerance, an accepted extra value, or a dropped binding. For each mutant the battery ran in the copy directory (`--lane` pointing at the real lane, read-only) and the mutant counter also ran once on the committed receipt to separate a semantic kill from a syntax crash.

- applied exactly once: 108/108 (each `from` anchor occurs exactly once in the counter source)
- crashed: **0**; unapplied: **0**
- **survived: 99**, killed: **9**

For each survivor a crafted witness receipt (the committed receipt plus one targeted edit, or one invocation shape for the walk rules) was run through the pristine counter and the mutant. A witness counts only when pristine exits 1 with **exactly one** finding and the mutant exits 0.

- survivors with a killing witness: **72** (all 72 witnesses are single-finding)
- survivors with no discriminating receipt: **27** (the weakened conjunct is pinned by another rule or unreachable)

## 3. Killed mutants (9) — where the battery has teeth

| mutant | caught by | note |
|---|---|---|
| `cancel-any` | `cancel-law` case | right reason |
| `extras-result-any` | `cross-color-law` case | right reason |
| `leg-order-order-insensitive` | battery case fails on extra `plan-frozen`/`leg-records` | **collateral**: the mutant's own `leg-order` rule never fires; `leg-order` is redundant with `plan-frozen`, which compares the same names in order |
| `legshape-state-dropped` | battery leg cases | **collateral**: the state edit is also refused by `no-selection-law`; on answer legs `accept-answer-law` is the only detector. No single-rule witness exists |
| `mode-enum-any` | `mode-law` case | right reason (the case requires `mode-law` to fire) |
| `receipt-fields-missing-ok` | `receipt-fields` case | right reason |
| `sendlog-methods-extra` | `send-log-allowlist` case | right reason |
| `seq-monotonic-loosened-desc` | `seq-monotonic` case | right reason |
| `trees-child-dropped` | `prior-set-unmatched-exempt` (extra id on every case) | **collateral**: the exemption hash stops matching a walked file. No case plants a stray receipt in `corpus/evidence/round82`; the witness below proves that tree is unwalked |

`trees-child-dropped` witness (run separately): mirror lane, stray receipt at `corpus/evidence/round82/stray-receipt.json`, no exemption -> pristine exits 1 with `prior-set-complete`, mutant exits 0 clean. The second walked tree is untested by the battery even though this mutant is nominally "killed".

## 4. Survivors (99)

Each entry below is a real weakening the frozen battery does not notice (battery exit 0). 72 come with the witness that pins the missing case; the other 27 have no discriminating receipt - 26 because another rule already pins the same bytes, 1 (`mode-single-only`) because a branch of `mode-law` is exercised by nothing. All mutation text and per-mutant evidence is machine-readable in `mutants.json` and `r82mut1-result.json`.


#### answer laws (8)

Why the battery misses this family: answer laws are exercised on uploadDir.files[0].sha256 and one read ret; answer key set, upload name/size, state k, answer basename and read counts are unprobed (or pinned only by plan-calls/leg shape)

- `accept-basename-dropped`: `arr(aa.answer.setParams.files).length === 1 && path.basename(aa.answer.setParams.files[0]) === ANSWER.name` -> `arr(aa.answer.setParams.files).length >= 1` - no witness - plan-calls re-derives path.basename(set.params.files[0]) from the frozen plan files list and refuses the same edit
- `accept-read-count-loosened`: `arr(aa.pageEvents).filter((e) => e.type === 'read').length === 1` -> `arr(aa.pageEvents).filter((e) => e.type === 'read').length >= 1` - no witness - leg-<name> seq/files pin the single read event and its ret
- `accept-state-any`: `same(isObj(aa.stateAfter) ? aa.stateAfter.k : null, [[ANSWER.name, ANSWER.size, ANSWER.type, '']])` -> `isObj(aa.stateAfter) && Array.isArray(aa.stateAfter.k)` - no witness - leg-<name> compares stateAfter byte-for-byte, so the accept-answer-law k comparison is redundant; leg shape refuses the same edit in both counters
- `accept-upload-any`: `isObj(aa.upload) && same(aa.upload, { name: ANSWER.name, size: ANSWER.size, sha256: ANSWER.sha256 })` -> `isObj(aa.upload)` - witness `accept-answer-law` (pristine exit 1 / mutant exit 0)
- `webkitdir-answer-basename-dropped`: `arr(wa.answer.setParams.files).length === 1 && path.basename(wa.answer.setParams.files[0]) === DIR.name` -> `arr(wa.answer.setParams.files).length >= 1` - no witness - plan-calls re-derives the same basename binding (:answer-files)
- `webkitdir-answer-keys-open`: `same(Object.keys(wa.answer).sort(), ['files', 'setError', 'setParams', 'setResult', 'setSendId'])` -> `Object.keys(wa.answer).length >= 5` - witness `webkitdirectory-answer-law` (pristine exit 1 / mutant exit 0)
- `webkitdir-answer-nodeid-dropped`: `wa.answer.setParams.backendNodeId === nodeReport['sp82-webkitdirectory-answer'][0]` -> `Number.isInteger(wa.answer.setParams.backendNodeId)` - no witness - plan-calls compares the send backendNodeId to opens[0].params.backendNodeId, the same binding nodeReport feeds
- `webkitdir-read-count-loosened`: `arr(wa.pageEvents).filter((e) => e.type === 'read').length === 2` -> `arr(wa.pageEvents).filter((e) => e.type === 'read').length >= 2` - no witness - leg-<name> seq/files pin the read count (2) and the per-read ret hex list

#### cancel/dismiss (2)

Why the battery misses this family: cancel/dismiss are exercised on one added cancel and dismissResult.ok; dismissError and the cancel scan inside dismiss-law are unprobed

- `dismiss-cancel-dropped`: `&& l.dismissError === null && arr(l.pageEvents).every((e) => e.type !== 'cancel'))` -> `&& l.dismissError === null)` - no witness - leg-<name> seq pins the same event list; the battery cancel-law case is refused via its own rule in both counters
- `dismiss-error-dropped`: `!(isObj(l.dismissResult) && same(l.dismissResult, {}) && l.dismissError === null && arr(l.pageEvents).every((e) => e.type !== 'cancel'))` -> `!(isObj(l.dismissResult) && same(l.dismissResult, {}) && arr(l.pageEvents).every((e) => e.type !== 'cancel'))` - witness `dismiss-law` (pristine exit 1 / mutant exit 0)

#### CDP event log (7)

Why the battery misses this family: cdp-event-log-closed is exercised on afterSendId and open-binding only; chooser param key set, mode enum, backendNodeId positivity, nav url/count, afterSendId typing and the 3-open cap are unprobed

- `cdp-aftersendid-any`: `!el.every((e) => isObj(e) && isObj(e.params) && Number.isInteger(e.afterSendId))` -> `!el.every((e) => isObj(e) && isObj(e.params))` - witness `cdp-event-log-closed` (pristine exit 1 / mutant exit 0)
- `cdp-multi-open-loosened`: `if (opens.length > 2) evBad.push(leg.name + ':multi-open');` -> `if (opens.length > 3) evBad.push(leg.name + ':multi-open');` - no witness - the same opened vector refuses a third chooser
- `cdp-nav-count-loosened`: `if (nav.length !== 1 || el.some(` -> `if (nav.length < 1 || el.some(` - witness `cdp-event-log-closed` (pristine exit 1 / mutant exit 0)
- `cdp-nav-url-dropped`: `if (nav.length === 1 && !(nav[0].params.frameId === lft.mainFrameId && nav[0].params.url === 'http://127.0.0.1:' + ports.http + '/?run=' + encodeURIComponent(r.nonce))) evBad.push(leg.name + ':nav');` -> `if (nav.length === 1 && !(nav[0].params.frameId === lft.mainFrameId)) evBad.push(leg.name + ':nav');` - witness `cdp-event-log-closed` (pristine exit 1 / mutant exit 0)
- `cdp-open-backendnode-nonpositive-ok`: `|| !Number.isInteger(o.params.backendNodeId) || o.params.backendNodeId <= 0` -> `|| !Number.isInteger(o.params.backendNodeId)` - witness `cdp-event-log-closed` (pristine exit 1 / mutant exit 0)
- `cdp-open-keys-open`: `if (!same(Object.keys(o.params).sort(), ['backendNodeId', 'frameId', 'mode']) || !['selectSingle', 'selectMultiple'].includes(o.params.mode)` -> `if (!isObj(o.params) || !['selectSingle', 'selectMultiple'].includes(o.params.mode)` - witness `cdp-event-log-closed` (pristine exit 1 / mutant exit 0)
- `cdp-open-mode-enum-any`: `!['selectSingle', 'selectMultiple'].includes(o.params.mode)` -> `typeof o.params.mode !== 'string'` - no witness - mode-law checks every non-cross chooser against the page-measured input and cross-origin legs must open nothing, so the enum conjunct is redundant for reachable receipts

#### CDP send log (6)

Why the battery misses this family: send-log-allowlist is exercised with DOM.getDocument; send-id order, prologue order, getFrameTree-once, navigate params, and the parent/child expression allowlists are unprobed

- `sendid-order-dropped`: `log.every((c, i) => isObj(c) && c.id === i + 1 && ALLOWED_METHODS.has(c.method) && isObj(c.params))` -> `log.every((c, i) => isObj(c) && ALLOWED_METHODS.has(c.method) && isObj(c.params))` - witness `send-log-allowlist` (pristine exit 1 / mutant exit 0)
- `sendlog-child-expr-any`: `return CROSS.has(leg.name) && params.contextId === leg.childContextId && childExprs.has(params.expression);` -> `return CROSS.has(leg.name) && params.contextId === leg.childContextId;` - witness `send-log-allowlist` (pristine exit 1 / mutant exit 0)
- `sendlog-getframetree-once-dropped`: `log.filter((c) => c.method === 'Page.getFrameTree').length !== 1` -> `false` - witness `send-log-allowlist` (pristine exit 1 / mutant exit 0)
- `sendlog-navigate-params-loosened`: `else if (!same(log.find((c) => c.method === 'Page.navigate').params, { url: 'http://127.0.0.1:' + ports.http + '/?run=' + encodeURIComponent(r.nonce) })) sendBad.push(leg.name + ':navigate');` -> `else if (!isObj(log.find((c) => c.method === 'Page.navigate').params)) sendBad.push(leg.name + ':navigate');` - witness `send-log-allowlist` (pristine exit 1 / mutant exit 0)
- `sendlog-parent-expr-any`: `return parent.includes(params.expression);` -> `return typeof params.expression === 'string';` - witness `send-log-allowlist` (pristine exit 1 / mutant exit 0)
- `sendlog-prologue-loosened`: `else if (!same(log.slice(0, 6).map((c) => c.method), ['Browser.getVersion', 'Page.enable', 'Runtime.enable', 'Page.getFrameTree', 'Emulation.setDeviceMetricsOverride', 'Page.navigate'])) sendBad.push(leg.name + ':prologue');` -> `else if (log.length < 6) sendBad.push(leg.name + ':prologue');` - witness `send-log-allowlist` (pristine exit 1 / mutant exit 0)

#### click while open (4)

Why the battery misses this family: click-while-open is exercised on the after-count; element id, click count, click act and the log chooser count are unprobed (the latter pinned by leg shape)

- `click-act-dropped`: `cw.pageEvents).filter((e) => e.type === 'click' && e.target === 's').every((e) => e.isTrusted === true && e.act === true)` -> `cw.pageEvents).filter((e) => e.type === 'click' && e.target === 's').every((e) => e.isTrusted === true)` - no witness - leg-sp82-click-while-open act vector pins act=true on click@s
- `click-count-loosened`: `arr(cw.pageEvents).filter((e) => e.type === 'click' && e.target === 's').length === 1` -> `arr(cw.pageEvents).filter((e) => e.type === 'click' && e.target === 's').length >= 1` - no witness - leg-sp82-click-while-open seq pins exactly one click@s
- `click-element-any`: `cw.clickWhileOpenElement === 's'` -> `typeof cw.clickWhileOpenElement === 'string'` - witness `click-while-open-law` (pristine exit 1 / mutant exit 0)
- `click-open-count-loosened`: `arr(cw.cdpEventLog).filter((e) => e.method === 'Page.fileChooserOpened').length === 2` -> `arr(cw.cdpEventLog).filter((e) => e.method === 'Page.fileChooserOpened').length >= 1` - no witness - leg-sp82-click-while-open opened vector pins exactly 2 selectSingle choosers

#### execution contexts (4)

Why the battery misses this family: context-binding is exercised by removing the child context; isDefault, frameId uniqueness, childContextId equality and an unexpected childContextId are unprobed

- `ctx-childid-dropped`: `if (CROSS.has(leg.name) && leg.childContextId !== child[0].id) ctxBad.push(leg.name + ':childContextId ' + leg.childContextId + ' != ' + child[0].id);` -> `` - witness `context-binding` (pristine exit 1 / mutant exit 0)
- `ctx-default-dropped`: `c.isDefault === true && typeof c.frameId === 'string'` -> `typeof c.frameId === 'string'` - witness `context-binding` (pristine exit 1 / mutant exit 0)
- `ctx-frameid-unique-dropped`: `typeof c.frameId === 'string' && c.frameId !== leg.frameTree.mainFrameId` -> `typeof c.frameId === 'string'` - witness `context-binding` (pristine exit 1 / mutant exit 0)
- `ctx-unexpected-dropped`: `if (!CROSS.has(leg.name) && leg.childContextId !== null) ctxBad.push(leg.name + ':childContextId-unexpected');` -> `` - witness `context-binding` (pristine exit 1 / mutant exit 0)

#### frame tree (3)

Why the battery misses this family: the frame cases mutate frameTree.mainFrameUrl (top level) and one leg mainFrameParentId; no case mutates frame-tree key sets, frame-id shape, or a leg frameTree url

- `frame-binding-url-dropped`: `l.frameTree.mainFrameParentId === null && l.frameTree.mainFrameUrl === 'about:blank'` -> `l.frameTree.mainFrameParentId === null` - witness `frame-binding` (pristine exit 1 / mutant exit 0)
- `frame-tree-id-any`: `/^[0-9A-F]{32}$/.test(ftree.mainFrameId)` -> `typeof ftree.mainFrameId === 'string'` - witness `frame-tree` (pristine exit 1 / mutant exit 0)
- `frame-tree-keys-open`: `same(Object.keys(ftree).sort(), ['mainFrameId', 'mainFrameParentId', 'mainFrameUrl'])` -> `Object.keys(ftree).length >= 3` - witness `frame-tree` (pristine exit 1 / mutant exit 0)

#### host argv/teardown (7)

Why the battery misses this family: host-argv is exercised with argv[7]; profile/token binding, devtools url prefix, browserId format, stderr binding, probe key set/values and postKillCurl are unprobed

- `argv-browserid-any`: `!/^[0-9a-f-]{36}$/.test(dl.browserId)` -> `typeof dl.browserId !== 'string'` - witness `host-argv` (pristine exit 1 / mutant exit 0)
- `argv-devtools-url-any`: `!dl.url.startsWith('ws://127.0.0.1:' + ports.cdp + '/devtools/browser/')` -> `typeof dl.url !== 'string'` - witness `host-argv` (pristine exit 1 / mutant exit 0)
- `argv-profile-dropped`: `typeof profile !== 'string' || path.basename(profile) !== 'profile-' + tok` -> `typeof profile !== 'string'` - witness `host-argv` (pristine exit 1 / mutant exit 0)
- `argv-stderr-binding-dropped`: `typeof leg.stderrHead !== 'string' || !leg.stderrHead.includes(dl.url)` -> `typeof leg.stderrHead !== 'string'` - witness `host-argv` (pristine exit 1 / mutant exit 0)
- `teardown-closed-any`: `Object.values(l.teardown.portProbes).every((v) => v === 'closed')` -> `Object.values(l.teardown.portProbes).every((v) => typeof v === 'string')` - witness `teardown-closure` (pristine exit 1 / mutant exit 0)
- `teardown-curl-any`: `Object.values(l.teardown.postKillCurl).every((v) => v === 7)` -> `Object.values(l.teardown.postKillCurl).every((v) => Number.isInteger(v))` - witness `teardown-closure` (pristine exit 1 / mutant exit 0)
- `teardown-probes-open`: `same(Object.keys(l.teardown.portProbes).sort(), ['child', 'devtools', 'fixture'])` -> `isObj(l.teardown.portProbes)` - witness `teardown-closure` (pristine exit 1 / mutant exit 0)

#### identity/host/fixture/ports (9)

Why the battery misses this family: the battery flips only schema/lane/nonce/driver/fixture.sha256/host.chromium/frameTree.mainFrameUrl and a duplicate port; no case mutates host.cdpProduct, host.cdpProtocolVersion, fixture.viewport, fixture.child keys/sha, either fixture origin, or a sub-1024 port

- `fixture-childkeys-open`: `same(Object.keys(r.fixture.child).sort(), ['origin', 'sha256'])` -> `isObj(r.fixture.child)` - witness `fixture-hash` (pristine exit 1 / mutant exit 0)
- `fixture-childsha-any`: `/^[0-9a-f]{64}$/.test(r.fixture.child.sha256)` -> `typeof r.fixture.child.sha256 === 'string'` - witness `fixture-hash` (pristine exit 1 / mutant exit 0)
- `fixture-viewport-dropped`: `r.fixture.sha256 === expectFixture && same(r.fixture.viewport, VIEWPORT) &&` -> `r.fixture.sha256 === expectFixture &&` - witness `fixture-hash` (pristine exit 1 / mutant exit 0)
- `host-product-dropped`: `host.chromium === HOST.chromium && host.cdpProduct === HOST.cdpProduct && host.cdpProtocolVersion === HOST.cdpProtocolVersion` -> `host.chromium === HOST.chromium && host.cdpProtocolVersion === HOST.cdpProtocolVersion` - witness `host-chromium` (pristine exit 1 / mutant exit 0)
- `host-protocol-dropped`: `host.chromium === HOST.chromium && host.cdpProduct === HOST.cdpProduct && host.cdpProtocolVersion === HOST.cdpProtocolVersion` -> `host.chromium === HOST.chromium && host.cdpProduct === HOST.cdpProduct` - witness `host-chromium` (pristine exit 1 / mutant exit 0)
- `nonce-shape-bound-dropped`: `/^tabi-r82-[a-z0-9-]{4,48}$/.test(r.nonce)` -> `/^tabi-r82-[a-z0-9-]+$/.test(r.nonce)` - no witness - nonce-expected pins r.nonce to the invocation nonce by equality, so a longer/shorter-but-valid shape cannot be presented alone
- `ports-childorigin-dropped`: `isObj(r.fixture.child) && r.fixture.child.origin === 'http://127.0.0.1:' + ports.child,` -> `isObj(r.fixture.child),` - witness `ports-declared` (pristine exit 1 / mutant exit 0)
- `ports-httporigin-dropped`: `&& isObj(r.fixture) && r.fixture.origin === 'http://127.0.0.1:' + ports.http && isObj(r.fixture.child)` -> `&& isObj(r.fixture) && isObj(r.fixture.child)` - witness `ports-declared` (pristine exit 1 / mutant exit 0)
- `ports-min-dropped`: `[ports.http, ports.cdp, ports.child].every((p) => p >= 1024)` -> `[ports.http, ports.cdp, ports.child].every((p) => Number.isInteger(p))` - witness `ports-declared` (pristine exit 1 / mutant exit 0)

#### law checks (12)

Why the battery misses this family: each law case flips one field (webkitdirectory showPicker, one activationBefore, sod message, one chooser mode, one extra-leg childResult); ret, unexpected parent showPicker, childActivationBefore/After, child act, childLate, mode selectMultiple and the activation no-law branch are unprobed

- `activation-nolaw-open`: `if (!want) { actBad.push(leg.name + ':no-law'); continue; }` -> `if (!want) { continue; }` - no witness - plan-frozen forces the exact 10-leg plan and ACT_LAW covers all ten names, so the no-law branch is unreachable on any accepted receipt
- `cross-nonfile-child-act-dropped`: `arr(co.childEvents).every((e) => e.isTrusted === true && e.act === true)` -> `arr(co.childEvents).every((e) => e.isTrusted === true)` - witness `cross-origin-nonfile-law` (pristine exit 1 / mutant exit 0)
- `cross-nonfile-childact-after-dropped`: `same(co.childActivationBefore, CHILD_ACT_LAW['sp82-cross-origin-nonfile'][0]) && same(co.childActivationAfter, CHILD_ACT_LAW['sp82-cross-origin-nonfile'][1])` -> `same(co.childActivationBefore, CHILD_ACT_LAW['sp82-cross-origin-nonfile'][0])` - witness `cross-origin-nonfile-law` (pristine exit 1 / mutant exit 0)
- `cross-nonfile-childact-before-dropped`: `same(co.childActivationBefore, CHILD_ACT_LAW['sp82-cross-origin-nonfile'][0]) && same(co.childActivationAfter, CHILD_ACT_LAW['sp82-cross-origin-nonfile'][1])` -> `same(co.childActivationAfter, CHILD_ACT_LAW['sp82-cross-origin-nonfile'][1])` - witness `cross-origin-nonfile-law` (pristine exit 1 / mutant exit 0)
- `cross-nonfile-childlate-dropped`: `&& co.childLate === 0,` -> `,` - witness `cross-origin-nonfile-law` (pristine exit 1 / mutant exit 0)
- `extras-child-act-dropped`: `arr(ex.childEvents).every((e) => e.isTrusted === true && e.act === true)` -> `arr(ex.childEvents).every((e) => e.isTrusted === true)` - witness `sp82-cross-origin-month-law` (pristine exit 1 / mutant exit 0)
- `gesture-message-dropped`: `(want.ok ? got.ret !== want.ret : (got.name !== want.name || got.message !== want.message))` -> `(want.ok ? got.ret !== want.ret : (got.name !== want.name))` - no witness - order-law pins the same InvalidStateError message on the only leg whose SP_LAW carries a message
- `gesture-ret-dropped`: `if (!isObj(got) || got.ok !== want.ok || (want.ok ? got.ret !== want.ret : (got.name !== want.name || got.message !== want.message)))` -> `if (!isObj(got) || got.ok !== want.ok || (want.ok ? false : (got.name !== want.name || got.message !== want.message)))` - witness `gesture-law` (pristine exit 1 / mutant exit 0)
- `gesture-unexpected-dropped`: `if (want === null) { if (got !== null) spBad.push(leg.name + ':unexpected'); continue; }` -> `if (want === null) { continue; }` - witness `gesture-law` (pristine exit 1 / mutant exit 0)
- `mode-single-only`: `const wantMode = d && d.multiple === true ? 'selectMultiple' : 'selectSingle';` -> `const wantMode = 'selectSingle';` - no witness - no leg targets the multiple input (plan-frozen) and the scored receipt has only selectSingle choosers, so the selectMultiple branch of mode-law is exercised by nothing — a real gap with no witness constructible inside the frozen plan
- `order-cod-childlate-dropped`: `&& cod.childLate === 0 &&` -> `&&` - witness `order-law` (pristine exit 1 / mutant exit 0)
- `order-sod-nochooser-dropped`: `arr(sod.cdpEventLog).filter((e) => e.method === 'Page.fileChooserOpened').length === 0,` -> `true,` - no witness - intercept-law already refuses any chooser on the failed same-origin leg (want 0 when the trigger threw)

#### leg marks (7)

Why the battery misses this family: leg-marks is exercised only through lateAfterClose; mark order, start/pre labels, settle label, the 0.1 ms grid, closedAt, mark count and mark-name typing are unprobed

- `marks-closedat-dropped`: `num(l.closedAt) && l.lateAfterClose === 0` -> `l.lateAfterClose === 0` - witness `leg-marks` (pristine exit 1 / mutant exit 0)
- `marks-count-loosened`: `arr(l.marks).length >= 3 &&` -> `arr(l.marks).length >= 1 &&` - no witness - with marks[0]=start, marks[1]=pre and last=settle required, any array shorter than 3 is already refused by the label conjuncts (empty arrays throw before the count can be reached)
- `marks-grid-dropped`: `num(m.at) && onGrid(m.at) && (i === 0` -> `num(m.at) && (i === 0` - witness `leg-marks` (pristine exit 1 / mutant exit 0)
- `marks-monotonic-dropped`: `(i === 0 || m.at >= a[i - 1].at)` -> `(i === 0 || true)` - witness `leg-marks` (pristine exit 1 / mutant exit 0)
- `marks-name-type-dropped`: `isObj(m) && typeof m.name === 'string' &&` -> `isObj(m) &&` - witness `leg-marks` (pristine exit 1 / mutant exit 0)
- `marks-settle-dropped`: `arr(l.marks).slice(-1)[0].name === 'settle' &&` -> `typeof arr(l.marks).slice(-1)[0].name === 'string' &&` - witness `leg-marks` (pristine exit 1 / mutant exit 0)
- `marks-start-labels-dropped`: `arr(l.marks)[0].name === 'start' && arr(l.marks)[1].name === 'pre' &&` -> `typeof arr(l.marks)[0].name === 'string' &&` - witness `leg-marks` (pristine exit 1 / mutant exit 0)

#### leg records (5)

Why the battery misses this family: leg-records is exercised only by deleting stderrHead; no case mutates chooserWaitMs bounds, any errOk(...) field, a non-empty errors array, or the trigger2Error slot

- `intercept-error-dropped`: `errOk(l.interceptError) && errOk(l.priorClickError) && errOk(l.triggerError)` -> `errOk(l.priorClickError) && errOk(l.triggerError)` - witness `leg-records` (pristine exit 1 / mutant exit 0)
- `leg-errors-open`: `errOk(l.clickError) && arr(l.errors).length === 0),` -> `errOk(l.clickError)),` - witness `leg-records` (pristine exit 1 / mutant exit 0)
- `leg-wait-unbounded`: `num(l.chooserWaitMs) && l.chooserWaitMs >= 0 && l.chooserWaitMs <= 3000` -> `num(l.chooserWaitMs)` - witness `leg-records` (pristine exit 1 / mutant exit 0)
- `priorclick-error-dropped`: `errOk(l.interceptError) && errOk(l.priorClickError) && errOk(l.triggerError)` -> `errOk(l.interceptError) && errOk(l.triggerError)` - witness `leg-records` (pristine exit 1 / mutant exit 0)
- `trigger2-error-dropped`: `errOk(l.trigger2Error) && errOk(l.dismissError)` -> `errOk(l.dismissError)` - witness `leg-records` (pristine exit 1 / mutant exit 0)

#### no selection (3)

Why the battery misses this family: no-selection is exercised by planting a selected file; state key set, dismiss-state equality and file events are unprobed (or pinned by leg shape)

- `no-selection-dismissstate-dropped`: `if (!isObj(leg.stateAfterDismiss) || !same(leg.stateAfterDismiss, leg.stateAfter)) stateBad.push(leg.name + ':dismiss-state');` -> `if (!isObj(leg.stateAfterDismiss)) stateBad.push(leg.name + ':dismiss-state');` - witness `no-selection-law` (pristine exit 1 / mutant exit 0)
- `no-selection-fileevent-dropped`: `if (arr(leg.pageEvents).some((e) => e.type === 'input' || e.type === 'change' || (e.files !== null && e.type !== 'cancel'))) stateBad.push(leg.name + ':file-event');` -> `` - no witness - leg-<name> seq/files pin the input/change/read events of every leg
- `no-selection-keys-open`: `same(Object.keys(st).sort(), ['d', 'dis', 'disd', 'k', 'm', 's', 'sValue'])` -> `Object.keys(st).length >= 7` - no witness - leg-<name> state comparison pins the exact stateAfter key set

#### page events (8)

Why the battery misses this family: event-types is exercised with one extra key; act/files/ret/target typing, ts typing, window lower bound, intra-leg order and the start-leg exclusion are unprobed

- `event-act-any`: `(e.act === null || typeof e.act === 'boolean')` -> `true` - no witness - leg-<name> compares the whole act vector of every event; event-types act typing is redundant
- `event-files-any`: `(e.files === null || Array.isArray(e.files))` -> `true` - no witness - leg-<name> files vector pins every non-null files payload; a non-array files value also changes that vector
- `event-ret-any`: `(e.ret === null || typeof e.ret === 'string')` -> `true` - witness `event-types` (pristine exit 1 / mutant exit 0)
- `event-target-any`: `(e.target === null || typeof e.target === 'string')` -> `true` - no witness - leg-<name> seq is type@target, so any non-string target also breaks the frozen seq vector
- `event-ts-any`: `typeof e.type === 'string' && num(e.ts) &&` -> `typeof e.type === 'string' &&` - no witness - event-time-quantum (onGrid) already refuses any non-numeric or off-grid ts; the num(e.ts) typing is redundant
- `event-window-lower-dropped`: `num(e.at) && e.at >= (pre ?? 0) && e.at <= (settle ?? l.closedAt)` -> `num(e.at) && e.at <= (settle ?? l.closedAt)` - witness `event-leg-window` (pristine exit 1 / mutant exit 0)
- `event-window-order-dropped`: `(i === 0 || (num(a[i - 1].at) && e.at >= a[i - 1].at)))` -> `(i === 0 || num(a[i - 1].at)))` - witness `event-leg-window` (pristine exit 1 / mutant exit 0)
- `event-window-start-leg-dropped`: `isObj(e) && e.leg !== 'start' &&` -> `isObj(e) &&` - witness `event-leg-window` (pristine exit 1 / mutant exit 0)

#### prior-set walk (3)

Why the battery misses this family: the walk cases use one stray receipt inside .ufo/waves/round-82; the corpus/evidence tree, a non-.json unparsable file, a blanket exemption and the self-exemption are unprobed

- `unparsable-ext-only`: `if ((/\.json$/i.test(w.path) || txt.trimStart().startsWith('{')) && /tabi-chrome-cdp-showpicker-r82/.test(txt)) unparsable.push(w.path);` -> `if (/\.json$/i.test(w.path) && /tabi-chrome-cdp-showpicker-r82/.test(txt)) unparsable.push(w.path);` - witness `prior-set-unparsable` (pristine exit 1 / mutant exit 0)
- `walk-exempt-everything`: `if (exemptHashes.includes(h)) exemptReal.add(w.path);` -> `if (exemptHashes.length > 0) exemptReal.add(w.path);` - witness `prior-set-complete` (pristine exit 1 / mutant exit 0)
- `walk-self-exemption-dropped`: `!priorReal.has(w.path) && w.path !== selfReal &&` -> `!priorReal.has(w.path) &&` - no witness - under every battery invocation the receipt under test is either content-exempted or outside the walked trees; dropping the conjunct only makes the counter stricter, never weaker

#### replay (5)

Why the battery misses this family: replay is exercised with a full prior copy and one token/browser reuse; cross-leg token and browser uniqueness and the FRAC threshold are unprobed

- `replay-browser-unique-dropped`: `) && new Set(legs.map((l) => l.devtoolsListening && l.devtoolsListening.browserId)).size === legs.length,` -> `),` - witness `replay-devtools-url` (pristine exit 1 / mutant exit 0)
- `replay-frac-raised`: `const TOL = 0.05, GAP_MIN = 50, FRAC = 0.5, GAP_FRAC = 0.75;` -> `const TOL = 0.05, GAP_MIN = 50, FRAC = 0.9, GAP_FRAC = 0.75;` - witness `replay-event-timeline` (pristine exit 1 / mutant exit 0)
- `replay-token-shape-any`: `/^[0-9a-f]{12}$/.test(l.launchToken)` -> `typeof l.launchToken === 'string'` - no witness - host-argv requires /^[0-9a-f]{12}$/ on the same launchToken, so the replay-token shape check is redundant
- `replay-token-unique-dropped`: `) && new Set(legs.map((l) => l.launchToken)).size === legs.length,` -> `),` - witness `replay-launch-token` (pristine exit 1 / mutant exit 0)
- `replay-tolerance-narrowed`: `const TOL = 0.05, GAP_MIN = 50, FRAC = 0.5, GAP_FRAC = 0.75;` -> `const TOL = 0.001, GAP_MIN = 50, FRAC = 0.5, GAP_FRAC = 0.75;` - no witness - ts/at are pinned to the 0.1 ms grid (event-time-quantum), so 0.001 ms and 0.05 ms tolerance are indistinguishable: every on-grid difference is >= 0.1 ms

#### run window (1)

Why the battery misses this family: run-window is exercised on the lower bound only; the 600 s upper bound is unprobed

- `runwindow-upper-dropped`: `&& t1 - t0 < 600000,` -> `,` - witness `run-window` (pristine exit 1 / mutant exit 0)

#### server logs (4)

Why the battery misses this family: server logs are exercised by one run field; duplicate root entries, side-request status and a missing child request are unprobed

- `childserver-404-dropped`: `arr(l.childServerLog).filter((s) => isObj(s) && s.path !== '/child.html').every((s) => s.status === 404)` -> `true` - witness `child-server-log-binding` (pristine exit 1 / mutant exit 0)
- `childserver-min-dropped`: `arr(l.childServerLog).filter((s) => isObj(s) && s.path === '/child.html').length >= 1` -> `true` - witness `child-server-log-binding` (pristine exit 1 / mutant exit 0)
- `server-404-dropped`: `arr(l.serverLog).filter((s) => isObj(s) && s.path !== '/').every((s) => s.status === 404)` -> `true` - witness `server-log-binding` (pristine exit 1 / mutant exit 0)
- `server-root-count-open`: `arr(l.serverLog).filter((s) => isObj(s) && s.path === '/').length === 1` -> `arr(l.serverLog).filter((s) => isObj(s) && s.path === '/').length >= 1` - witness `server-log-binding` (pristine exit 1 / mutant exit 0)

#### trust (1)

Why the battery misses this family: trust-law is exercised by isTrusted=false; the showPicker pointer-event exclusion is unprobed

- `trust-pointer-dropped`: `legs.every((l) => isObj(l) && arr(l.pageEvents).every((e) => !PTR.has(e.type) || (e.leg !== 'show-picker' && e.leg !== 'show-picker-2')))` -> `true` - witness `trust-law` (pristine exit 1 / mutant exit 0)

## 5. Structural findings beyond the individual mutants

1. **`mode-law`'s `selectMultiple` branch is exercised by nothing.** `mutants.mjs:mode-single-only` hard-codes `wantMode = 'selectSingle'` and survives with no witness: no leg targets the `multiple` input (`plan-frozen` fixes the 10-leg plan; input `m` has no leg) and the scored receipt contains only `selectSingle` choosers. `mode-enum-any` is killed only because the battery case demands `mode-law` fire, not because any case feeds a `selectMultiple` chooser.
2. **The replay `FRAC` threshold has no band coverage.** The only forgery case is a full prior copy (32/32 matches). A forged receipt with 24/32 matches is still refused at `FRAC = 0.5` but accepted at `FRAC = 0.9` (witness `replay-frac-raised`), so the threshold is untested between 0.5 and 1.0.
3. **`TOL` is unobservable on the 0.1 ms grid.** `event-time-quantum` forces `ts`/`at` onto the grid, so `0.001` and `0.05` accept exactly the same receipts (any on-grid difference is at least `0.1`). The tolerance constant is effectively decorative; only the grid matters.
4. **`leg-order` duplicates `plan-frozen`.** `plan-frozen` compares `{name, kind, target, intercept, priorClick, gesture}` for every leg in order, so any reordering fails it; `leg-order` can never be the sole detector. The battery's `leg-order` case passes only because `plan-frozen`/`leg-records` fire first and the case forbids extra ids.
5. **`event-act`, `event-ts`, `event-files`, `event-target` typing are redundant with the per-leg shape.** The shape compares the trusted/act/xy/files vectors and the `type@target` sequence for every leg, so a typed-field weakening cannot be isolated; the corresponding battery cases add no kill power.
6. **`accept-state`, `accept-basename`, `webkitdir-basename`, `webkitdir-nodeid`, and both read-count rules are redundant** with the leg shape or with `plan-calls`, which re-derives the same bindings from the frozen plan.
7. **`activation-nolaw-open` is unreachable**: `plan-frozen` pins the leg set and `ACT_LAW` covers all ten names, so the `no-law` branch cannot fire on any accepted receipt.
8. **`walk-self-exemption-dropped` can never weaken anything**: dropping the conjunct only adds the receipt-under-test to the outside set, making the counter stricter; every battery invocation either content-exempts the receipt or keeps it outside the walked trees.
9. **The blanket-exemption weakening is real**: `walk-exempt-everything` survives, and its witness shows that one matching `--tree-exempt-sha256` exempts *every* walked file (stray receipt accepted) whereas pristine exempts only the matching content.
10. **`prior-set-unparsable` only recognises `.json` paths in the mutant**: a truncated schema-carrying file named `.txt` is silently skipped (`unparsable-ext-only` witness: pristine exit 1, mutant exit 0).

## 6. Missing battery cases with a killing witness (priority order)

These 72 survivors each have a single-finding witness; each is directly adoptable as a new `add(...)` case (the witness edit is the case's mutate function, the pristine finding id is the expectation). Per the seat rule the *routed defects* are the 27 survivors without a witness (section 7).

1. `event-leg-window` — intra-leg order and lower bound (3 mutants).
2. `leg-marks` — order, labels, grid, closedAt, name typing (6).
3. `send-log-allowlist` — send-id order, prologue, getFrameTree-once, navigate params, parent/child expression allowlists (6).
4. `leg-records` — `errOk` on intercept/priorClick/trigger2, non-empty errors, `chooserWaitMs` bounds (5).
5. `cdp-event-log-closed` — nav url/count, afterSendId typing, chooser key set, backendNodeId positivity (5).
6. `host-chromium`, `fixture-hash`, `ports-declared`, `frame-tree`, `frame-binding` — identity fields the battery never flips (11).
7. `context-binding` — isDefault, frameId uniqueness, childContextId equality, unexpected childContextId (4).
8. `host-argv`/`teardown-closure` — profile binding, devtools url, browserId format, stderr binding, probe keys/values, postKillCurl (7).
9. `cross-origin-*`/`order-law`/`gesture-law` — child activation, child act, childLate, parent showPicker ret/unexpected (7).
10. `webkitdirectory-answer-law`/`accept-answer-law` — answer key set, upload name/size, state k (3).
11. `server-log-binding`/`child-server-log-binding` — duplicate root, side status, missing child request (4).
12. `trust-law` (pointer exclusion), `click-while-open-law` (element), `dismiss-law` (dismissError), `no-selection-law` (dismiss state), `run-window` (upper bound), `replay-*` (token/browser uniqueness, FRAC band), `prior-set-*` (second tree, non-json unparsable, blanket exemption).

Highest-leverage single fix: add cases that mutate one field at a time per law (the battery today mutates one representative field per law, and that representative is usually the one the rule's detail string prints).


## 7. Routed defects (27) — survivors no receipt can discriminate

Per the seat rule these are the survivors without a witness: the weakened conjunct cannot be the sole detector on any admissible receipt because another rule pins the same bytes, or the branch is unreachable. One entry (`mode-single-only`) is NOT redundancy: it is a genuine untested branch of `mode-law`.

- `accept-basename-dropped` (answer laws): the accept answer must name exactly the planned file
  - `arr(aa.answer.setParams.files).length === 1 && path.basename(aa.answer.setParams.files[0]) === ANSWER.name` -> `arr(aa.answer.setParams.files).length >= 1`
  - reason: plan-calls re-derives path.basename(set.params.files[0]) from the frozen plan files list and refuses the same edit
- `accept-read-count-loosened` (answer laws): the accept leg fires exactly one read event
  - `arr(aa.pageEvents).filter((e) => e.type === 'read').length === 1` -> `arr(aa.pageEvents).filter((e) => e.type === 'read').length >= 1`
  - reason: leg-<name> seq/files pin the single read event and its ret
- `accept-state-any` (answer laws): the accept leg stateAfter.k equals the delivered file tuple
  - `same(isObj(aa.stateAfter) ? aa.stateAfter.k : null, [[ANSWER.name, ANSWER.size, ANSWER.type, '']])` -> `isObj(aa.stateAfter) && Array.isArray(aa.stateAfter.k)`
  - reason: leg-<name> compares stateAfter byte-for-byte, so the accept-answer-law k comparison is redundant; leg shape refuses the same edit in both counters
- `activation-nolaw-open` (law checks): every leg has an activation law
  - `if (!want) { actBad.push(leg.name + ':no-law'); continue; }` -> `if (!want) { continue; }`
  - reason: plan-frozen forces the exact 10-leg plan and ACT_LAW covers all ten names, so the no-law branch is unreachable on any accepted receipt
- `cdp-multi-open-loosened` (CDP event log): no leg opens more than two choosers
  - `if (opens.length > 2) evBad.push(leg.name + ':multi-open');` -> `if (opens.length > 3) evBad.push(leg.name + ':multi-open');`
  - reason: the same opened vector refuses a third chooser
- `cdp-open-mode-enum-any` (CDP event log): chooser mode is selectSingle or selectMultiple
  - `!['selectSingle', 'selectMultiple'].includes(o.params.mode)` -> `typeof o.params.mode !== 'string'`
  - reason: mode-law checks every non-cross chooser against the page-measured input and cross-origin legs must open nothing, so the enum conjunct is redundant for reachable receipts
- `click-act-dropped` (click while open): the click@s event carries act=true
  - `cw.pageEvents).filter((e) => e.type === 'click' && e.target === 's').every((e) => e.isTrusted === true && e.act === true)` -> `cw.pageEvents).filter((e) => e.type === 'click' && e.target === 's').every((e) => e.isTrusted === true)`
  - reason: leg-sp82-click-while-open act vector pins act=true on click@s
- `click-count-loosened` (click while open): exactly one click@s event in the click-while-open leg
  - `arr(cw.pageEvents).filter((e) => e.type === 'click' && e.target === 's').length === 1` -> `arr(cw.pageEvents).filter((e) => e.type === 'click' && e.target === 's').length >= 1`
  - reason: leg-sp82-click-while-open seq pins exactly one click@s
- `click-open-count-loosened` (click while open): exactly two choosers in the click-while-open CDP log
  - `arr(cw.cdpEventLog).filter((e) => e.method === 'Page.fileChooserOpened').length === 2` -> `arr(cw.cdpEventLog).filter((e) => e.method === 'Page.fileChooserOpened').length >= 1`
  - reason: leg-sp82-click-while-open opened vector pins exactly 2 selectSingle choosers
- `dismiss-cancel-dropped` (cancel/dismiss): a post-hoc cancel must not fire a page cancel
  - `&& l.dismissError === null && arr(l.pageEvents).every((e) => e.type !== 'cancel'))` -> `&& l.dismissError === null)`
  - reason: leg-<name> seq pins the same event list; the battery cancel-law case is refused via its own rule in both counters
- `event-act-any` (page events): event act is null or a boolean
  - `(e.act === null || typeof e.act === 'boolean')` -> `true`
  - reason: leg-<name> compares the whole act vector of every event; event-types act typing is redundant
- `event-files-any` (page events): event files is null or an array
  - `(e.files === null || Array.isArray(e.files))` -> `true`
  - reason: leg-<name> files vector pins every non-null files payload; a non-array files value also changes that vector
- `event-target-any` (page events): event target is null or a string
  - `(e.target === null || typeof e.target === 'string')` -> `true`
  - reason: leg-<name> seq is type@target, so any non-string target also breaks the frozen seq vector
- `event-ts-any` (page events): event ts is a finite number
  - `typeof e.type === 'string' && num(e.ts) &&` -> `typeof e.type === 'string' &&`
  - reason: event-time-quantum (onGrid) already refuses any non-numeric or off-grid ts; the num(e.ts) typing is redundant
- `gesture-message-dropped` (law checks): the same-origin disabled showPicker message is the immutable-controls message
  - `(want.ok ? got.ret !== want.ret : (got.name !== want.name || got.message !== want.message))` -> `(want.ok ? got.ret !== want.ret : (got.name !== want.name))`
  - reason: order-law pins the same InvalidStateError message on the only leg whose SP_LAW carries a message
- `marks-count-loosened` (leg marks): the marks array has at least three entries
  - `arr(l.marks).length >= 3 &&` -> `arr(l.marks).length >= 1 &&`
  - reason: with marks[0]=start, marks[1]=pre and last=settle required, any array shorter than 3 is already refused by the label conjuncts (empty arrays throw before the count can be reached)
- `mode-single-only` (law checks): chooser mode equals the page-measured input mode (selectMultiple included)
  - `const wantMode = d && d.multiple === true ? 'selectMultiple' : 'selectSingle';` -> `const wantMode = 'selectSingle';`
  - reason: no leg targets the multiple input (plan-frozen) and the scored receipt has only selectSingle choosers, so the selectMultiple branch of mode-law is exercised by nothing — a real gap with no witness constructible inside the frozen plan | REAL GAP, not redundancy: no leg targets the multiple input (plan-frozen) and the scored receipt has only selectSingle choosers, so the selectMultiple branch of mode-law is exercised by nothing
- `no-selection-fileevent-dropped` (no selection): no non-answer leg fires input/change or a files-carrying event
  - `if (arr(leg.pageEvents).some((e) => e.type === 'input' || e.type === 'change' || (e.files !== null && e.type !== 'cancel'))) stateBad.push(leg.name + ':file-event');` -> ``
  - reason: leg-<name> seq/files pin the input/change/read events of every leg
- `no-selection-keys-open` (no selection): stateAfter carries exactly the seven frozen keys
  - `same(Object.keys(st).sort(), ['d', 'dis', 'disd', 'k', 'm', 's', 'sValue'])` -> `Object.keys(st).length >= 7`
  - reason: leg-<name> state comparison pins the exact stateAfter key set
- `nonce-shape-bound-dropped` (identity/host/fixture/ports): the nonce matches /^tabi-r82-[a-z0-9-]{4,48}$/
  - `/^tabi-r82-[a-z0-9-]{4,48}$/.test(r.nonce)` -> `/^tabi-r82-[a-z0-9-]+$/.test(r.nonce)`
  - reason: nonce-expected pins r.nonce to the invocation nonce by equality, so a longer/shorter-but-valid shape cannot be presented alone
- `order-sod-nochooser-dropped` (law checks): the failed same-origin disabled leg opens no chooser
  - `arr(sod.cdpEventLog).filter((e) => e.method === 'Page.fileChooserOpened').length === 0,` -> `true,`
  - reason: intercept-law already refuses any chooser on the failed same-origin leg (want 0 when the trigger threw)
- `replay-token-shape-any` (replay): launchToken matches /^[0-9a-f]{12}$/
  - `/^[0-9a-f]{12}$/.test(l.launchToken)` -> `typeof l.launchToken === 'string'`
  - reason: host-argv requires /^[0-9a-f]{12}$/ on the same launchToken, so the replay-token shape check is redundant
- `replay-tolerance-narrowed` (replay): pair near-match tolerance is 0.05 ms
  - `const TOL = 0.05, GAP_MIN = 50, FRAC = 0.5, GAP_FRAC = 0.75;` -> `const TOL = 0.001, GAP_MIN = 50, FRAC = 0.5, GAP_FRAC = 0.75;`
  - reason: ts/at are pinned to the 0.1 ms grid (event-time-quantum), so 0.001 ms and 0.05 ms tolerance are indistinguishable: every on-grid difference is >= 0.1 ms
- `walk-self-exemption-dropped` (prior-set walk): the receipt under test is excluded from the prior-set walk
  - `!priorReal.has(w.path) && w.path !== selfReal &&` -> `!priorReal.has(w.path) &&`
  - reason: under every battery invocation the receipt under test is either content-exempted or outside the walked trees; dropping the conjunct only makes the counter stricter, never weaker
- `webkitdir-answer-basename-dropped` (answer laws): the directory answer must name exactly the planned directory
  - `arr(wa.answer.setParams.files).length === 1 && path.basename(wa.answer.setParams.files[0]) === DIR.name` -> `arr(wa.answer.setParams.files).length >= 1`
  - reason: plan-calls re-derives the same basename binding (:answer-files)
- `webkitdir-answer-nodeid-dropped` (answer laws): the answer backendNodeId equals the chooser backendNodeId
  - `wa.answer.setParams.backendNodeId === nodeReport['sp82-webkitdirectory-answer'][0]` -> `Number.isInteger(wa.answer.setParams.backendNodeId)`
  - reason: plan-calls compares the send backendNodeId to opens[0].params.backendNodeId, the same binding nodeReport feeds
- `webkitdir-read-count-loosened` (answer laws): the directory leg fires exactly two read events
  - `arr(wa.pageEvents).filter((e) => e.type === 'read').length === 2` -> `arr(wa.pageEvents).filter((e) => e.type === 'read').length >= 2`
  - reason: leg-<name> seq/files pin the read count (2) and the per-read ret hex list

## 8. Evidence, integrity, reproduction

Seat artifacts (all outside the walked trees):

| file | content |
|---|---|
| `.ufo/waves/round-82-seats/R82Mut1/mutants.json` | seat artifact in the round-81 convention: totals, killed, witnessed survivors, 27 routed defects, all 108 mutants, restoration |
| `.ufo/waves/round-82-seats/R82Mut1/r82mut1-result.json` | 108 mutants with full mutation text, outcome, battery detail, witness verdict, no-witness reason, integrity hashes |
| `.ufo/waves/round-82-seats/R82Mut1/mutants.mjs` | the independent mutant table (`name`, `from`, `to`) |
| `.ufo/waves/round-82-seats/R82Mut1/witnesses.mjs` | witness functions + `NO_WITNESS` reasons |
| `.ufo/waves/round-82-seats/R82Mut1/mutate-r82.mjs`, `witness-harness.mjs`, `build-result.mjs`, `merge-result.mjs` | harnesses |
| `.ufo/waves/round-82-seats/R82Mut1/mutants-r82.json`, `witnesses-r82.json`, `baseline-battery.json` | raw harness outputs |

Integrity: no lane file was written. The counter (`d0d26fe5…`), battery (`e2d554e6…`), kill-power (`f0d2b866…`), record-drift (`d145d9ff…`) and selftest (`64888b15…`) hashes re-read after the run match the frozen pins in `claims.json`; the receipt is unchanged (`75c3c442…`). Every mutant directory under `/fast/scratch/hyaku/tabi-r82/R82Mut1/` was deleted after its run, and the scratch root is removed.

## 9. Limits

- These are crafted-receipt mutants: no browser was launched, so nothing here measures Chromium's behaviour. The witnesses are admissible batch inputs for the battery, not new runtime observations.
- "Survived" is relative to the frozen battery only; several survivors are redundant rules inside the counter (section 5), not battery gaps. The 27 no-witness entries are reported with their reasons precisely so they are not counted as missing cases - except `mode-single-only`, which is a real untested branch of `mode-law`.
- Mutant count is 108, above the 40 required; the 9 kills plus the 72 witnesses give the L1 a direct map from rule to missing case.
