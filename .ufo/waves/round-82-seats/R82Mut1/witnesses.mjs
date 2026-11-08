// Witnesses for survivors of the independent r82 mutant set: each witness is a minimal receipt
// edit that targets ONE weakened conjunct (or one invocation shape for the walk rules). The
// witness harness runs the pristine counter (expect exit 1) and the mutant counter (expect exit 0)
// on the same crafted bytes. A witness that does not discriminate is reported as such.
const leg = (r, n) => r.legs.find((l) => l.name === n);
const evs = (r, n) => leg(r, n).pageEvents;
const open = (r, n) => leg(r, n).cdpEventLog.find((e) => e.method === 'Page.fileChooserOpened');
const PTR_EV = (r, n, type) => evs(r, n).find((e) => e.type === type);

// renumber a leg's send ids +100 while keeping every derived send-id field consistent
const renumber = (r, n) => {
  const l = leg(r, n);
  for (const c of l.cdpSendLog) c.id += 100;
  for (const k of ['interceptSendId', 'triggerSendId', 'trigger2SendId', 'dismissSendId', 'clickPressId', 'clickReleaseId', 'priorPressId', 'priorReleaseId', 'armSendId']) {
    if (typeof l[k] === 'number') l[k] += 100;
  }
  if (l.answer && l.answer.setSendId) l.answer.setSendId += 100;
  for (const e of l.cdpEventLog) if (typeof e.afterSendId === 'number') e.afterSendId += 100;
  return l;
};

export const WITNESSES = {
  // ---- host / fixture / ports ----
  'host-protocol-dropped': (r) => { r.host.cdpProtocolVersion = '1.2'; },
  'host-product-dropped': (r) => { r.host.cdpProduct = 'Chrome/154.0.0.0'; },
  'fixture-viewport-dropped': (r) => { r.fixture.viewport = { width: 800, height: 600 }; },
  'fixture-childkeys-open': (r) => { r.fixture.child.extra = 1; },
  'fixture-childsha-any': (r) => { r.fixture.child.sha256 = 'zz'; },
  'ports-httporigin-dropped': (r) => { r.fixture.origin = 'http://127.0.0.1:1'; },
  'ports-childorigin-dropped': (r) => { r.fixture.child.origin = 'http://127.0.0.1:1'; },
  'ports-min-dropped': (r) => {
    const old = r.ports.http;
    r.ports.http = 80;
    r.fixture.origin = 'http://127.0.0.1:80';
    for (const l of r.legs) {
      for (const c of l.cdpSendLog) if (c.method === 'Page.navigate') c.params.url = c.params.url.split('127.0.0.1:' + old + '/').join('127.0.0.1:80/');
      for (const e of l.cdpEventLog) if (e.method === 'Page.frameNavigated') e.params.url = e.params.url.split('127.0.0.1:' + old + '/').join('127.0.0.1:80/');
    }
  },
  // ---- frame tree ----
  'frame-tree-keys-open': (r) => { r.frameTree.extra = 1; },
  'frame-tree-id-any': (r) => { r.frameTree.mainFrameId = 'not-a-frame-id'; },
  'frame-binding-url-dropped': (r) => { leg(r, 'sp82-accept-answer').frameTree.mainFrameUrl = 'http://127.0.0.1:1/'; },
  // ---- leg records / marks ----
  'leg-wait-unbounded': (r) => { leg(r, 'sp82-accept-answer').chooserWaitMs = 5000; },
  'intercept-error-dropped': (r) => { leg(r, 'sp82-accept-answer').interceptError = { note: 1 }; },
  'priorclick-error-dropped': (r) => { leg(r, 'sp82-accept-answer').priorClickError = { note: 1 }; },
  'leg-errors-open': (r) => { leg(r, 'sp82-accept-answer').errors.push('x'); },
  'trigger2-error-dropped': (r) => { leg(r, 'sp82-accept-answer').trigger2Error = { note: 1 }; },
  'marks-monotonic-dropped': (r) => { const m = leg(r, 'sp82-accept-answer').marks; m[1].at = m[0].at - 5; },
  'marks-start-labels-dropped': (r) => {
    const l = leg(r, 'sp82-accept-answer');
    l.marks[0].name = 'begin';
    l.marks[1].name = 'before';
  },
  'marks-settle-dropped': (r) => { const m = leg(r, 'sp82-accept-answer').marks; m[m.length - 1].name = 'done'; },
  'marks-grid-dropped': (r) => { leg(r, 'sp82-accept-answer').marks[0].at = 1.23456; },
  'marks-closedat-dropped': (r) => { leg(r, 'sp82-accept-answer').closedAt = 'x'; },
  'marks-name-type-dropped': (r) => {
    const l = leg(r, 'sp82-accept-answer');
    const at = l.marks[1].at + 0.1;
    l.marks.splice(2, 0, { name: 5, at });
  },
  // ---- execution contexts ----
  'ctx-default-dropped': (r) => {
    const l = leg(r, 'sp82-cross-origin-nonfile');
    const c = l.contexts.find((x) => x.origin === 'http://127.0.0.1:' + r.ports.child && x.isDefault === true);
    c.isDefault = false;
  },
  'ctx-frameid-unique-dropped': (r) => {
    const l = leg(r, 'sp82-cross-origin-nonfile');
    const c = l.contexts.find((x) => x.origin === 'http://127.0.0.1:' + r.ports.child && x.isDefault === true);
    c.frameId = l.frameTree.mainFrameId;
  },
  'ctx-childid-dropped': (r) => {
    const l = leg(r, 'sp82-cross-origin-nonfile');
    l.childContextId = 'CTX-BOGUS';
    for (const c of l.cdpSendLog) if (c.method === 'Runtime.evaluate' && c.params.contextId !== undefined) c.params.contextId = 'CTX-BOGUS';
  },
  'ctx-unexpected-dropped': (r) => { leg(r, 'sp82-accept-answer').childContextId = 'CTX-EXTRA'; },
  // ---- send log ----
  'sendid-order-dropped': (r) => { renumber(r, 'sp82-accept-answer'); },
  'sendlog-prologue-loosened': (r) => {
    const log = leg(r, 'sp82-accept-answer').cdpSendLog;
    const a = log[1].method, b = log[2].method;
    log[1].method = b; log[2].method = a;
    const pa = log[1].params, pb = log[2].params;
    log[1].params = pb; log[2].params = pa;
  },
  'sendlog-getframetree-once-dropped': (r) => {
    const log = leg(r, 'sp82-accept-answer').cdpSendLog;
    const ft = log.find((c) => c.method === 'Page.getFrameTree');
    log.push({ id: log.length + 1, method: 'Page.getFrameTree', params: JSON.parse(JSON.stringify(ft.params)) });
  },
  'sendlog-navigate-params-loosened': (r) => { leg(r, 'sp82-accept-answer').cdpSendLog.find((c) => c.method === 'Page.navigate').params.url = 'http://127.0.0.1:1/?run=x'; },
  'sendlog-parent-expr-any': (r) => {
    const log = leg(r, 'sp82-accept-answer').cdpSendLog;
    log.push({ id: log.length + 1, method: 'Runtime.evaluate', params: { expression: 'window.__evil()', returnByValue: true } });
  },
  'sendlog-child-expr-any': (r) => {
    const l = leg(r, 'sp82-cross-origin-nonfile');
    l.cdpSendLog.push({ id: l.cdpSendLog.length + 1, method: 'Runtime.evaluate', params: { expression: 'window.__evil()', returnByValue: true, contextId: l.childContextId } });
  },
  'sendlog-methods-extra': (r) => {
    const log = leg(r, 'sp82-accept-answer').cdpSendLog;
    log.push({ id: log.length + 1, method: 'DOM.getDocument', params: {} });
  },
  // ---- cdp event log ----
  'cdp-open-keys-open': (r) => { open(r, 'sp82-accept-answer').params.extra = 1; },
  'cdp-open-backendnode-nonpositive-ok': (r) => {
    const l = leg(r, 'sp82-accept-answer');
    const o = open(r, 'sp82-accept-answer');
    o.params.backendNodeId = 0;
    l.answer.setParams.backendNodeId = 0;
    l.cdpSendLog.find((c) => c.method === 'DOM.setFileInputFiles').params.backendNodeId = 0;
  },
  'cdp-nav-url-dropped': (r) => { leg(r, 'sp82-accept-answer').cdpEventLog.find((e) => e.method === 'Page.frameNavigated').params.url = 'http://127.0.0.1:1/'; },
  'cdp-aftersendid-any': (r) => { leg(r, 'sp82-accept-answer').cdpEventLog.find((e) => e.method === 'Page.frameNavigated').afterSendId = 'x'; },
  'cdp-nav-count-loosened': (r) => {
    const l = leg(r, 'sp82-accept-answer');
    const nav = l.cdpEventLog.find((e) => e.method === 'Page.frameNavigated');
    l.cdpEventLog.push(JSON.parse(JSON.stringify(nav)));
  },
  // ---- page events ----
  'event-ret-any': (r) => { PTR_EV(r, 'sp82-accept-answer', 'click').ret = 5; },
  'event-window-lower-dropped': (r) => {
    const l = leg(r, 'sp82-accept-answer');
    const pre = l.marks.find((m) => m.name === 'pre').at;
    evs(r, 'sp82-accept-answer')[0].at = Math.round((pre - 1) * 10) / 10;
  },
  'event-window-order-dropped': (r) => {
    const l = leg(r, 'sp82-accept-answer');
    const pre = l.marks.find((m) => m.name === 'pre').at;
    const e = evs(r, 'sp82-accept-answer');
    const held = e[1].at;
    let back = Math.round((held - 0.1) * 10) / 10;
    if (back < pre) back = Math.round((pre + 0.1) * 10) / 10;
    if (back >= held) return;
    e[2].at = back;
  },
  'event-window-start-leg-dropped': (r) => { evs(r, 'sp82-accept-answer').filter((e) => e.type === 'input')[0].leg = 'start'; },
  // ---- per-leg shape ----
  'legshape-state-dropped': (r) => {
    const l = leg(r, 'sp82-accept-answer');
    l.stateAfter.k = [];
    l.stateAfterDismiss.k = [];
  },
  // ---- gesture / activation ----
  'gesture-unexpected-dropped': (r) => { leg(r, 'sp82-cross-origin-nonfile').showPicker = { ok: true, ret: 'undefined' }; },
  'gesture-ret-dropped': (r) => { leg(r, 'sp82-click-while-open').showPicker.ret = 'x'; },
  // ---- cross-origin laws ----
  'cross-nonfile-childact-before-dropped': (r) => { leg(r, 'sp82-cross-origin-nonfile').childActivationBefore = { isActive: true, hasBeenActive: true }; },
  'cross-nonfile-childact-after-dropped': (r) => { leg(r, 'sp82-cross-origin-nonfile').childActivationAfter = { isActive: false, hasBeenActive: false }; },
  'cross-nonfile-child-act-dropped': (r) => { leg(r, 'sp82-cross-origin-nonfile').childEvents[0].act = false; },
  'cross-nonfile-childlate-dropped': (r) => { leg(r, 'sp82-cross-origin-nonfile').childLate = 1; },
  'order-cod-childlate-dropped': (r) => { leg(r, 'sp82-cross-origin-nonfile-disabled').childLate = 1; },
  'extras-result-any': (r) => { leg(r, 'sp82-cross-origin-color').childResult = { ok: false, name: 'SecurityError', message: 'x' }; },
  'extras-child-act-dropped': (r) => { leg(r, 'sp82-cross-origin-month').childEvents[0].act = false; },
  // ---- answers ----
  'webkitdir-answer-keys-open': (r) => { leg(r, 'sp82-webkitdirectory-answer').answer.extra = 1; },
  'accept-upload-any': (r) => { leg(r, 'sp82-accept-answer').upload.size = 999; },
  'click-element-any': (r) => { leg(r, 'sp82-click-while-open').clickWhileOpenElement = 'q'; },
  // ---- no selection / dismiss ----
  'no-selection-dismissstate-dropped': (r) => {
    const l = leg(r, 'sp82-accept-answer');
    l.stateAfterDismiss = Object.assign({}, l.stateAfterDismiss, { k: [] });
  },
  'dismiss-error-dropped': (r) => { leg(r, 'sp82-accept-answer').dismissError = { code: 1, message: 'x' }; },
  // ---- trust ----
  'trust-pointer-dropped': (r) => { PTR_EV(r, 'sp82-accept-answer', 'click').leg = 'show-picker'; },
  // ---- host argv / teardown ----
  'argv-profile-dropped': (r) => {
    const l = leg(r, 'sp82-accept-answer');
    const i = l.argv.findIndex((a) => typeof a === 'string' && a.startsWith('--user-data-dir='));
    l.argv[i] = '--user-data-dir=' + l.argv[i].replace(/profile-[0-9a-f]{12}$/, 'profile-zzzzzzzzzzzz');
  },
  'argv-devtools-url-any': (r) => {
    const l = leg(r, 'sp82-accept-answer');
    l.devtoolsListening.url = 'ws://evil/x';
    l.stderrHead = 'DevTools listening on ws://evil/x';
  },
  'argv-browserid-any': (r) => { leg(r, 'sp82-accept-answer').devtoolsListening.browserId = 'zzz'; },
  'argv-stderr-binding-dropped': (r) => { leg(r, 'sp82-accept-answer').stderrHead = 'DevTools listening on ws://127.0.0.1:1/devtools/browser/other'; },
  'teardown-probes-open': (r) => { delete leg(r, 'sp82-accept-answer').teardown.portProbes.child; },
  'teardown-closed-any': (r) => { leg(r, 'sp82-accept-answer').teardown.portProbes.child = 'open'; },
  'teardown-curl-any': (r) => { leg(r, 'sp82-accept-answer').teardown.postKillCurl.child = 0; },
  // ---- server logs ----
  'server-root-count-open': (r) => { const l = leg(r, 'sp82-accept-answer'); l.serverLog.push({ path: '/', status: 200, run: r.nonce }); },
  'server-404-dropped': (r) => { leg(r, 'sp82-accept-answer').serverLog.push({ path: '/other', status: 200, run: r.nonce }); },
  'childserver-min-dropped': (r) => { leg(r, 'sp82-cross-origin-nonfile').childServerLog = []; },
  'childserver-404-dropped': (r) => { leg(r, 'sp82-accept-answer').childServerLog.push({ path: '/other', status: 200, run: r.nonce }); },
  // ---- run window / replay ----
  'runwindow-upper-dropped': (r) => { r.finishedAt = new Date(Date.parse(r.startedAt) + 700000).toISOString(); },
  'replay-token-unique-dropped': (r) => {
    const a = leg(r, 'sp82-accept-answer'), b = leg(r, 'sp82-webkitdirectory-answer');
    const tok = a.launchToken;
    b.launchToken = tok;
    const i = b.argv.findIndex((x) => typeof x === 'string' && x.startsWith('--user-data-dir='));
    b.argv[i] = b.argv[i].replace(/profile-[0-9a-f]{12}$/, 'profile-' + tok);
  },
  'replay-browser-unique-dropped': (r) => {
    const a = leg(r, 'sp82-accept-answer'), b = leg(r, 'sp82-webkitdirectory-answer');
    b.devtoolsListening = JSON.parse(JSON.stringify(a.devtoolsListening));
    b.stderrHead = 'DevTools listening on ' + b.devtoolsListening.url;
  },
  // ---- walk rules (need a scratch mirror lane) ----
  'trees-child-dropped': (r, H) => {
    const mirror = H.mirror('trees-child');
    H.writeFile(mirror + '/corpus/evidence/round82/stray-receipt.json', JSON.stringify(r));
    return { lane: mirror, extraArgs: [] };
  },
  'unparsable-ext-only': (r, H) => {
    const mirror = H.mirror('unparsable-ext');
    H.writeFile(mirror + '/.ufo/waves/round-82/stray-unparsable.txt', '{"schema": "tabi-chrome-cdp-showpicker-r82", broken');
    return { lane: mirror, extraArgs: [] };
  },
  'walk-exempt-everything': (r, H) => {
    const mirror = H.mirror('walk-exempt');
    H.writeFile(mirror + '/.ufo/waves/round-82/stray-receipt.json', JSON.stringify(r));
    const ref = mirror + '/.ufo/waves/round-82/controls/c1/probes/prior1.json';
    return { lane: mirror, extraArgs: ['--tree-exempt-sha256', H.sha256File(ref)] };
  },
};

// The replay refusal threshold: a forgery built from the prior receipt with its identity rewritten
// (the battery's own forgery), 8 of 32 events re-timed on the 0.1 ms grid so only 24/32 pair-match.
// Pristine: absMatched 24 >= ceil(0.5*32)=16 -> refused. FRAC 0.9: need 29 -> accepted.
WITNESSES['replay-frac-raised'] = (r, H) => {
  const prior = H.clone(H.priorJson);
  const realR = H.realJson;
  const old = prior.nonce, to = realR.nonce;
  prior.nonce = to;
  prior.driverSha256 = realR.driverSha256;
  prior.fixture.sha256 = realR.fixture.sha256;
  const rep = (s) => s.split(encodeURIComponent(old)).join(encodeURIComponent(to));
  for (const l of prior.legs) {
    for (const s of l.serverLog || []) if (s.run === old) s.run = to;
    for (const s of l.childServerLog || []) if (s.run === old) s.run = to;
    for (const c of l.cdpSendLog || []) {
      if (c.method === 'Page.navigate') c.params.url = rep(c.params.url);
      if (c.method === 'Runtime.evaluate' && typeof c.params.expression === 'string') c.params.expression = c.params.expression.split(JSON.stringify(old)).join(JSON.stringify(to));
    }
    for (const e of l.cdpEventLog || []) if (e.method === 'Page.frameNavigated') e.params.url = rep(e.params.url);
    const tok = H.randomHex(6);
    l.launchToken = tok;
    const i = (l.argv || []).findIndex((a) => typeof a === 'string' && a.startsWith('--user-data-dir='));
    if (i >= 0) l.argv[i] = '--user-data-dir=' + H.path.dirname(l.argv[i].slice('--user-data-dir='.length)) + '/profile-' + tok;
    const bid = H.uuid();
    if (l.devtoolsListening) {
      l.devtoolsListening = { url: 'ws://127.0.0.1:' + prior.ports.cdp + '/devtools/browser/' + bid, port: prior.ports.cdp, browserId: bid };
      l.stderrHead = 'DevTools listening on ' + l.devtoolsListening.url;
    }
  }
  let k = 0;
  for (const l of prior.legs) for (const e of l.pageEvents) { if (k % 4 === 0) e.ts += 1; k++; }
  for (const key of Object.keys(r)) delete r[key];
  Object.assign(r, prior);
};

// Survivors for which no receipt can discriminate the mutant from the pristine counter: another
// rule (or the same rule on another field) already pins the same bytes, so the weakened conjunct
// is redundant or unreachable. These are coverage facts about the COUNTER, not about the battery.
export const NO_WITNESS = {
  'accept-state-any': 'leg-<name> compares stateAfter byte-for-byte, so the accept-answer-law k comparison is redundant; leg shape refuses the same edit in both counters',
  'event-act-any': 'leg-<name> compares the whole act vector of every event; event-types act typing is redundant',
  'event-ts-any': 'event-time-quantum (onGrid) already refuses any non-numeric or off-grid ts; the num(e.ts) typing is redundant',
  'replay-token-shape-any': 'host-argv requires /^[0-9a-f]{12}$/ on the same launchToken, so the replay-token shape check is redundant',
  'event-files-any': 'leg-<name> files vector pins every non-null files payload; a non-array files value also changes that vector',
  'event-target-any': 'leg-<name> seq is type@target, so any non-string target also breaks the frozen seq vector',
  'accept-basename-dropped': 'plan-calls re-derives path.basename(set.params.files[0]) from the frozen plan files list and refuses the same edit',
  'webkitdir-answer-basename-dropped': 'plan-calls re-derives the same basename binding (:answer-files)',
  'webkitdir-answer-nodeid-dropped': 'plan-calls compares the send backendNodeId to opens[0].params.backendNodeId, the same binding nodeReport feeds',
  'webkitdir-read-count-loosened': 'leg-<name> seq/files pin the read count (2) and the per-read ret hex list',
  'accept-read-count-loosened': 'leg-<name> seq/files pin the single read event and its ret',
  'click-count-loosened': 'leg-sp82-click-while-open seq pins exactly one click@s',
  'click-act-dropped': 'leg-sp82-click-while-open act vector pins act=true on click@s',
  'click-open-count-loosened': 'leg-sp82-click-while-open opened vector pins exactly 2 selectSingle choosers',
  'cdp-multi-open-loosened': 'the same opened vector refuses a third chooser',
  'no-selection-keys-open': 'leg-<name> state comparison pins the exact stateAfter key set',
  'no-selection-fileevent-dropped': 'leg-<name> seq/files pin the input/change/read events of every leg',
  'cancel-any': 'leg-<name> seq pins the event list; a page cancel event also breaks the frozen seq vector of its leg',
  'dismiss-cancel-dropped': 'leg-<name> seq pins the same event list; the battery cancel-law case is refused via its own rule in both counters',
  'gesture-message-dropped': 'order-law pins the same InvalidStateError message on the only leg whose SP_LAW carries a message',
  'marks-count-loosened': 'with marks[0]=start, marks[1]=pre and last=settle required, any array shorter than 3 is already refused by the label conjuncts (empty arrays throw before the count can be reached)',
  'activation-nolaw-open': 'plan-frozen forces the exact 10-leg plan and ACT_LAW covers all ten names, so the no-law branch is unreachable on any accepted receipt',
  'nonce-shape-bound-dropped': 'nonce-expected pins r.nonce to the invocation nonce by equality, so a longer/shorter-but-valid shape cannot be presented alone',
  'walk-self-exemption-dropped': 'under every battery invocation the receipt under test is either content-exempted or outside the walked trees; dropping the conjunct only makes the counter stricter, never weaker',
  'mode-single-only': 'no leg targets the multiple input (plan-frozen) and the scored receipt has only selectSingle choosers, so the selectMultiple branch of mode-law is exercised by nothing — a real gap with no witness constructible inside the frozen plan',
  'cdp-open-mode-enum-any': 'mode-law checks every non-cross chooser against the page-measured input and cross-origin legs must open nothing, so the enum conjunct is redundant for reachable receipts',
  'order-sod-nochooser-dropped': 'intercept-law already refuses any chooser on the failed same-origin leg (want 0 when the trigger threw)',
  'replay-tolerance-narrowed': 'ts/at are pinned to the 0.1 ms grid (event-time-quantum), so 0.001 ms and 0.05 ms tolerance are indistinguishable: every on-grid difference is >= 0.1 ms',
};
