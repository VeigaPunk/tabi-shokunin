// R79Mut1 — independent semantic mutants of scripts/check-showpicker-r79.mjs.
// Every entry is a real weakening of a rule the counter binds: a dropped conjunct, a flipped
// comparison, a widened tolerance, an accepted extra value, a skipped binding. The `from` string
// must occur exactly once in the pristine counter (the runner enforces this).
//
// This list is NOT the frozen kill-power-r79.mjs list: it attacks different conjuncts and
// different edit sites (per-conjunct errOk drops, mark-name/grid/monotonic conjuncts, prologue
// order, once-counts, navigate params, plan send-id coherence, open-shape key set, typed field
// types, leg-shape `act`, gesture `ret`, dismiss state, teardown probes, server-log duplicates,
// run-window boundaries, prior-set walk error handling, nonce/frame-id regex bounds).

export const MUTANTS = [
  // ---- identity / run binding ----
  { id: 'ports-http-floor-dropped', rule: 'ports-declared', from: 'ports.http >= 1024 && ports.cdp >= 1024', to: 'ports.http >= 0 && ports.cdp >= 1024', weakening: 'accepts a privileged fixture port (<1024) instead of requiring an unprivileged one' },
  { id: 'ports-cdp-floor-dropped', rule: 'ports-declared', from: 'ports.http >= 1024 && ports.cdp >= 1024', to: 'ports.http >= 1024 && ports.cdp >= 0', weakening: 'accepts a privileged CDP port (<1024)' },
  { id: 'host-cdp-product-dropped', rule: 'host-chromium', from: 'host.chromium === HOST.chromium && host.cdpProduct === HOST.cdpProduct && host.cdpProtocolVersion === HOST.cdpProtocolVersion', to: 'host.chromium === HOST.chromium && host.cdpProtocolVersion === HOST.cdpProtocolVersion', weakening: 'drops the cdpProduct binding: a different browser build passes if the chromium string matches' },
  { id: 'host-protocol-dropped', rule: 'host-chromium', from: 'host.chromium === HOST.chromium && host.cdpProduct === HOST.cdpProduct && host.cdpProtocolVersion === HOST.cdpProtocolVersion', to: 'host.chromium === HOST.chromium && host.cdpProduct === HOST.cdpProduct', weakening: 'drops the CDP protocol-version binding' },
  { id: 'fixture-viewport-dropped', rule: 'fixture-hash', from: 'same(r.fixture.viewport, VIEWPORT)', to: 'true', weakening: 'drops the frozen viewport from the fixture binding' },
  { id: 'fixture-keyset-dropped', rule: 'fixture-hash', from: "same(Object.keys(r.fixture).sort(), ['origin', 'patch', 'sha256', 'viewport'])", to: 'true', weakening: 'accepts extra fixture fields (an unbound patch/state channel)' },
  { id: 'fixture-origin-dropped', rule: 'ports-declared', from: "isObj(r.fixture) && r.fixture.origin === 'http://127.0.0.1:' + ports.http", to: 'isObj(r.fixture)', weakening: 'drops the binding between the declared HTTP port and the fixture origin' },
  { id: 'frame-tree-parent-dropped', rule: 'frame-tree', from: 'ftree.mainFrameParentId === null', to: 'ftree.mainFrameParentId !== undefined', weakening: 'accepts a main frame that is not a root frame' },
  { id: 'frame-tree-id-regex-loose', rule: 'frame-tree', from: '/^[0-9A-F]{32}$/.test(ftree.mainFrameId)', to: '/^[0-9A-F]{1,}$/.test(ftree.mainFrameId)', weakening: 'accepts any-length frame id instead of the 32-hex CDP shape' },
  { id: 'nonce-suffix-min-dropped', rule: 'nonce-shape', from: '/^tabi-r79-[a-z0-9-]{4,48}$/.test(r.nonce)', to: '/^tabi-r79-[a-z0-9-]{1,48}$/.test(r.nonce)', weakening: 'accepts a 1-3 character nonce suffix (guessable run nonce)' },
  { id: 'nonce-suffix-max-dropped', rule: 'nonce-shape', from: '/^tabi-r79-[a-z0-9-]{4,48}$/.test(r.nonce)', to: '/^tabi-r79-[a-z0-9-]{4,}$/.test(r.nonce)', weakening: 'drops the nonce upper bound' },

  // ---- legs ----
  { id: 'chooser-wait-upper-widened', rule: 'leg-records', from: 'l.chooserWaitMs <= 3000', to: 'l.chooserWaitMs <= 3001', weakening: 'widens the chooser-wait upper bound by 1 ms' },
  { id: 'chooser-wait-lower-dropped', rule: 'leg-records', from: 'l.chooserWaitMs >= 0 && l.chooserWaitMs <= 3000', to: 'l.chooserWaitMs <= 3000', weakening: 'accepts a negative chooser wait' },
  { id: 'marks-min-count-widened', rule: 'leg-marks', from: 'arr(l.marks).length >= 3', to: 'arr(l.marks).length >= 2', weakening: 'accepts a leg with only start+settle marks (no pre-observation window)' },
  { id: 'marks-start-name-dropped', rule: 'leg-marks', from: "arr(l.marks)[0].name === 'start'", to: 'true', weakening: 'drops the required first mark name' },
  { id: 'marks-pre-name-dropped', rule: 'leg-marks', from: "arr(l.marks)[1].name === 'pre'", to: 'true', weakening: 'drops the required pre-observation mark name' },
  { id: 'marks-settle-name-dropped', rule: 'leg-marks', from: "arr(l.marks).slice(-1)[0].name === 'settle'", to: 'true', weakening: 'drops the required settle mark name' },
  { id: 'marks-monotonic-dropped', rule: 'leg-marks', from: '(i === 0 || m.at >= a[i - 1].at)', to: 'true', weakening: 'accepts marks out of time order' },
  { id: 'marks-grid-dropped', rule: 'leg-marks', from: 'num(m.at) && onGrid(m.at)', to: 'num(m.at)', weakening: 'accepts marks off the 0.1 ms grid' },
  { id: 'closedAt-num-dropped', rule: 'leg-marks', from: 'num(l.closedAt) && ', to: '', weakening: 'drops the numeric closedAt binding' },
  { id: 'err-intercept-dropped', rule: 'leg-records', from: 'errOk(l.interceptError) && ', to: '', weakening: 'stops validating the intercept error shape' },
  { id: 'err-prior-click-dropped', rule: 'leg-records', from: 'errOk(l.priorClickError) && ', to: '', weakening: 'stops validating the prior-click error shape' },
  { id: 'err-trigger-dropped', rule: 'leg-records', from: 'errOk(l.triggerError) && ', to: '', weakening: 'stops validating the trigger error shape' },
  { id: 'err-trigger2-dropped', rule: 'leg-records', from: 'errOk(l.trigger2Error) && ', to: '', weakening: 'stops validating the second-trigger error shape' },
  { id: 'err-dismiss-dropped', rule: 'leg-records', from: 'errOk(l.dismissError) && ', to: '', weakening: 'stops validating the dismiss error shape' },
  { id: 'err-code-integer-dropped', rule: 'leg-records', from: '(e.code === null || Number.isInteger(e.code))', to: 'true', weakening: 'accepts a non-integer CDP error code' },
  { id: 'err-keyset-dropped', rule: 'leg-records', from: "same(Object.keys(e).sort(), ['code', 'message'])", to: 'isObj(e)', weakening: 'accepts extra fields on a CDP error object' },

  // ---- send log ----
  { id: 'send-prologue-order-dropped', rule: 'send-log-allowlist', from: "same(log.slice(0, 6).map((c) => c.method), ['Browser.getVersion', 'Page.enable', 'Runtime.enable', 'Page.getFrameTree', 'Emulation.setDeviceMetricsOverride', 'Page.navigate'])", to: 'true', weakening: 'drops the frozen prologue method order' },
  { id: 'send-navigate-count-widened', rule: 'send-log-allowlist', from: "log.filter((c) => c.method === 'Page.navigate').length !== 1", to: "log.filter((c) => c.method === 'Page.navigate').length < 1", weakening: 'accepts two or more navigations in one leg' },
  { id: 'send-getframetree-count-widened', rule: 'send-log-allowlist', from: "log.filter((c) => c.method === 'Page.getFrameTree').length !== 1", to: "log.filter((c) => c.method === 'Page.getFrameTree').length < 1", weakening: 'accepts two or more getFrameTree calls in one leg' },
  { id: 'send-navigate-url-dropped', rule: 'send-log-allowlist', from: "!same(log.find((c) => c.method === 'Page.navigate').params, { url: 'http://127.0.0.1:' + ports.http + '/?run=' + encodeURIComponent(r.nonce) })", to: 'false', weakening: 'drops the navigate URL/run-nonce binding' },
  { id: 'send-min-length-widened', rule: 'send-log-allowlist', from: 'log.length < 10', to: 'log.length < 5', weakening: 'accepts a leg with as few as 5 CDP calls' },
  { id: 'send-params-object-dropped', rule: 'send-log-allowlist', from: 'isObj(c.params)', to: 'true', weakening: 'accepts a non-object params on a logged CDP call' },
  { id: 'eval-wrapper-target-agnostic', rule: 'send-log-allowlist', from: "if (p.kind === 'click' || p.kind === 'showpicker' || p.kind === 'showpicker-twice') allowed.push(wrapperFor(p.target));", to: "allowed.push(wrapperFor('s'), wrapperFor('m'), wrapperFor('d'), wrapperFor('k'), wrapperFor('dis'));", weakening: 'allows the showPicker wrapper on any element in any leg, not just the plan target' },

  // ---- plan calls ----
  { id: 'plan-prior-order-dropped', rule: 'plan-calls', from: 'leg.priorReleaseId <= leg.priorPressId', to: 'false', weakening: 'accepts a mouse release that precedes its press' },
  { id: 'plan-click-release-dropped', rule: 'plan-calls', from: "if (leg.priorPressId === null || leg.priorReleaseId !== null) planBad.push(leg.name + ':click-ids');", to: "if (leg.priorPressId === null) planBad.push(leg.name + ':click-ids');", weakening: 'accepts a release id on a click leg that must have none' },
  { id: 'plan-trigger2-unexpected-dropped', rule: 'plan-calls', from: "} else if (leg.trigger2SendId !== null) planBad.push(leg.name + ':trigger2-unexpected');", to: '}', weakening: 'accepts a second-trigger send id on a single-trigger leg' },
  { id: 'plan-trigger2-order-dropped', rule: 'plan-calls', from: 'leg.trigger2SendId !== t2.id || leg.trigger2SendId <= leg.triggerSendId', to: 'leg.trigger2SendId !== t2.id', weakening: 'drops the ordering requirement between the two triggers' },
  { id: 'plan-dismiss-unexpected-dropped', rule: 'plan-calls', from: "else if (leg.dismissSendId !== null) planBad.push(leg.name + ':dismiss-unexpected');", to: '', weakening: 'accepts a dismiss send id on a leg that sent no dismiss' },
  { id: 'plan-intercept-id-dropped', rule: 'plan-calls', from: "if (p.intercept && leg.interceptSendId !== log.find((c) => c.method === 'Page.setInterceptFileChooserDialog').id) planBad.push(leg.name + ':intercept-id');", to: "if (false) planBad.push(leg.name + ':intercept-id');", weakening: 'drops the intercept send-id coherence binding' },
  { id: 'plan-unknown-leg-skipped', rule: 'plan-calls', from: "if (!p) { planBad.push('unknown-leg'); continue; }", to: 'if (!p) { continue; }', weakening: 'silently skips a leg that is not in the frozen plan' },

  // ---- CDP event log ----
  { id: 'cdp-open-keyset-dropped', rule: 'cdp-event-log-closed', from: "!same(Object.keys(o.params).sort(), ['backendNodeId', 'frameId', 'mode'])", to: 'false', weakening: 'accepts extra fields on a fileChooserOpened event' },
  { id: 'cdp-mode-enum-dropped', rule: 'cdp-event-log-closed', from: "!['selectSingle', 'selectMultiple'].includes(o.params.mode)", to: "typeof o.params.mode !== 'string'", weakening: 'accepts any string as the chooser mode' },
  { id: 'cdp-nav-url-dropped', rule: 'cdp-event-log-closed', from: "nav[0].params.url === 'http://127.0.0.1:' + ports.http + '/?run=' + encodeURIComponent(r.nonce)", to: 'typeof nav[0].params.url === \'string\'', weakening: 'drops the frameNavigated URL/run-nonce binding' },
  { id: 'cdp-nav-count-widened', rule: 'cdp-event-log-closed', from: 'if (nav.length !== 1 || ', to: 'if (nav.length < 1 || ', weakening: 'accepts two or more frameNavigated events (a mid-leg reload)' },
  { id: 'cdp-aftersend-integer-dropped', rule: 'cdp-event-log-closed', from: 'isObj(e) && isObj(e.params) && Number.isInteger(e.afterSendId)', to: 'isObj(e) && isObj(e.params)', weakening: 'accepts a non-integer afterSendId on a CDP event' },

  // ---- page events ----
  { id: 'typed-ret-dropped', rule: 'event-types', from: "(e.ret === null || typeof e.ret === 'string')", to: 'true', weakening: 'accepts any type for the page event ret field' },
  { id: 'typed-seq-loosened', rule: 'event-types', from: 'Number.isInteger(e.seq)', to: 'num(e.seq)', weakening: 'accepts a fractional page-event seq' },
  { id: 'typed-act-dropped', rule: 'event-types', from: "(e.act === null || typeof e.act === 'boolean')", to: 'true', weakening: 'accepts any type for the activation flag' },
  { id: 'typed-files-dropped', rule: 'event-types', from: '(e.files === null || Array.isArray(e.files))', to: 'true', weakening: 'accepts any type for the files field' },
  { id: 'typed-istrusted-dropped', rule: 'event-types', from: "typeof e.isTrusted === 'boolean'", to: 'true', weakening: 'accepts any type for isTrusted' },
  { id: 'event-window-startleg-dropped', rule: 'event-leg-window', from: "e.leg !== 'start'", to: 'true', weakening: 'accepts a page event attributed to the pre-start window' },
  { id: 'event-quantum-tolerance-widened', rule: 'event-time-quantum', from: 'Math.abs(v * 10 - Math.round(v * 10)) <= 1e-4', to: 'Math.abs(v * 10 - Math.round(v * 10)) <= 1e-3', weakening: 'widens the 0.1 ms grid tolerance tenfold' },
  { id: 'leg-shape-act-dropped', rule: 'leg-sp-click-then-show', from: "for (const k of ['seq', 'trusted', 'act', 'xy', 'files', 'opened', 'state'])", to: "for (const k of ['seq', 'trusted', 'xy', 'files', 'opened', 'state'])", weakening: 'drops the per-event activation column from the frozen leg shape' },

  // ---- laws ----
  { id: 'gesture-ret-dropped', rule: 'gesture-law', from: '(want.ok ? got.ret !== want.ret : (got.name !== want.name || got.message !== want.message))', to: '(want.ok ? false : (got.name !== want.name || got.message !== want.message))', weakening: 'drops the return-value binding on a successful showPicker' },
  { id: 'gesture-unknown-leg-skipped', rule: 'gesture-law', from: "if (want === undefined) { spBad.push(leg.name + ':unknown-leg'); continue; }", to: 'if (want === undefined) continue;', weakening: 'silently skips a leg with no frozen showPicker law' },
  { id: 'consumption-first-ok-dropped', rule: 'consumption-law', from: 'isObj(twice.showPicker) && twice.showPicker.ok === true && ', to: 'isObj(twice.showPicker) && ', weakening: 'drops the requirement that the first call in the twice leg succeeded' },
  { id: 'immutable-open-count-dropped', rule: 'immutable-law', from: "arr(dis.cdpEventLog).filter((e) => e.method === 'Page.fileChooserOpened').length === 0 && ", to: '', weakening: 'drops the "opens nothing" half of the immutable-control law' },
  { id: 'mode-law-missing-descriptor-ok', rule: 'mode-law', from: 'if (!d || opens.some((e) => e.params.mode !== wantMode))', to: 'if (opens.some((e) => e.params.mode !== wantMode))', weakening: 'accepts a chooser on an element with no page-measured descriptor' },
  { id: 'no-selection-svalue-dropped', rule: 'no-selection-law', from: "&& st.sValue === ''", to: '', weakening: 'drops the input-value half of the no-selection law' },
  { id: 'no-selection-dismiss-state-dropped', rule: 'no-selection-law', from: "if (leg.stateAfterDismiss !== null && !(isObj(leg.stateAfterDismiss) && ['s', 'm', 'd', 'k', 'dis'].every((k) => Array.isArray(leg.stateAfterDismiss[k]) && leg.stateAfterDismiss[k].length === 0))) stateBad.push(leg.name + ':dismiss-state');", to: '', weakening: 'stops checking that the post-dismiss state is still empty' },
  { id: 'intercept-open-count-loosened', rule: 'intercept-law', from: "opens !== 1) intBad.push(leg.name + ':intercept-but-' + opens)", to: "opens < 1) intBad.push(leg.name + ':intercept-but-' + opens)", weakening: 'accepts two or more chooser events on an intercepting leg' },
  { id: 'dismiss-cancel-events-dropped', rule: 'dismiss-law', from: "&& arr(l.pageEvents).every((e) => e.type !== 'cancel')", to: '', weakening: 'accepts a page cancel alongside a post-hoc dismiss' },
  { id: 'trust-nonempty-dropped', rule: 'trust-law', from: 'events.length > 0 && events.every((e) => e.isTrusted === true)', to: 'events.every((e) => e.isTrusted === true)', weakening: 'makes the trusted-event rule vacuous on an empty event log' },

  // ---- host argv / teardown / server ----
  { id: 'argv-stderr-link-dropped', rule: 'host-argv', from: "typeof leg.stderrHead !== 'string' || !leg.stderrHead.includes(dl.url)", to: "typeof leg.stderrHead !== 'string'", weakening: 'drops the binding between the devtools URL and the stderr head' },
  { id: 'argv-token-regex-loosened', rule: 'host-argv', from: '/^[0-9a-f]{12}$/.test(tok)', to: "typeof tok === 'string'", weakening: 'accepts any string as the launch token' },
  { id: 'argv-browserid-regex-loosened', rule: 'host-argv', from: '/^[0-9a-f-]{36}$/.test(dl.browserId)', to: "typeof dl.browserId === 'string'", weakening: 'accepts any string as the devtools browser id' },
  { id: 'teardown-portprobes-dropped', rule: 'teardown-closure', from: "Object.values(l.teardown.portProbes).every((v) => v === 'closed')", to: 'true', weakening: 'drops the per-port teardown proof' },
  { id: 'teardown-curl-dropped', rule: 'teardown-closure', from: 'Object.values(l.teardown.postKillCurl).every((v) => v === 7)', to: 'true', weakening: 'drops the post-kill connection-refused proof' },
  { id: 'server-log-count-widened', rule: 'server-log-binding', from: "arr(l.serverLog).filter((s) => isObj(s) && s.path === '/').length === 1", to: "arr(l.serverLog).filter((s) => isObj(s) && s.path === '/').length >= 1", weakening: 'accepts duplicate fixture-root requests' },
  { id: 'server-log-404-dropped', rule: 'server-log-binding', from: "arr(l.serverLog).filter((s) => isObj(s) && s.path !== '/').every((s) => s.status === 404)", to: 'true', weakening: 'accepts a non-404 response on a non-root path' },

  // ---- run window / replay ----
  { id: 'run-window-lower-widened', rule: 'run-window', from: 't1 - t0 >= 20000', to: 't1 - t0 >= 19999', weakening: 'widens the run-window floor by 1 ms' },
  { id: 'run-window-upper-inclusive', rule: 'run-window', from: 't1 - t0 < 600000', to: 't1 - t0 <= 600000', weakening: 'accepts exactly the 600 s ceiling' },
  { id: 'replay-frac-loosened', rule: 'replay-event-timeline', from: 'const TOL = 0.05, GAP_MIN = 50, FRAC = 0.5, GAP_FRAC = 0.75;', to: 'const TOL = 0.05, GAP_MIN = 50, FRAC = 0.49, GAP_FRAC = 0.75;', weakening: 'lowers the pair-match refusal fraction from 0.5 to 0.49' },
  { id: 'replay-gapfrac-loosened', rule: 'replay-event-timeline', from: 'const TOL = 0.05, GAP_MIN = 50, FRAC = 0.5, GAP_FRAC = 0.75;', to: 'const TOL = 0.05, GAP_MIN = 50, FRAC = 0.5, GAP_FRAC = 0.7;', weakening: 'lowers the gap-match refusal fraction from 0.75 to 0.7' },

  // ---- prior-set walk ----
  { id: 'walk-unreadable-dir-skipped', rule: 'prior-set-complete', from: "if (w.error) { outside.push('unreadable-dir:' + w.dir); continue; }", to: 'if (w.error) { continue; }', weakening: 'skips an unreadable walked directory instead of refusing' },
];
