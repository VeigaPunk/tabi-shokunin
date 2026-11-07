// R79Mut1 — witnesses. Each witness mutates the committed receipt (or builds a mirror lane) so the
// PRISTINE counter refuses with the mutant's rule id while the MUTANT accepts (exit 0). A witness
// proves the survivor is a battery coverage gap, not an unfalsifiable rule.
import fs from 'node:fs';
import path from 'node:path';

const clone = (v) => JSON.parse(JSON.stringify(v));
const arr = (v) => (Array.isArray(v) ? v : []);

export const rewriteNonce = (r, to) => {
  const old = r.nonce;
  r.nonce = to;
  for (const l of arr(r.legs)) {
    for (const s of arr(l.serverLog)) if (s.run === old) s.run = to;
    for (const c of arr(l.cdpSendLog)) {
      if (c.method === 'Page.navigate' && c.params && typeof c.params.url === 'string') c.params.url = c.params.url.split(encodeURIComponent(old)).join(encodeURIComponent(to));
      if (c.method === 'Runtime.evaluate' && c.params && typeof c.params.expression === 'string') c.params.expression = c.params.expression.split(JSON.stringify(old)).join(JSON.stringify(to));
    }
    for (const e of arr(l.cdpEventLog)) if (e.method === 'Page.frameNavigated' && e.params && typeof e.params.url === 'string') e.params.url = e.params.url.split(encodeURIComponent(old)).join(encodeURIComponent(to));
  }
  return r;
};

// renumber the send log 1..N and remap every referenced send id after an insertion at `index`
const insertSendCall = (leg, index, call) => {
  leg.cdpSendLog.splice(index, 0, clone(call));
  leg.cdpSendLog.forEach((c, i) => { c.id = i + 1; });
  const remap = (old) => (old === null || old === undefined ? old : (old - 1 >= index ? old + 1 : old));
  for (const f of ['interceptSendId', 'triggerSendId', 'trigger2SendId', 'dismissSendId', 'priorPressId', 'priorReleaseId']) leg[f] = remap(leg[f]);
  for (const e of arr(leg.cdpEventLog)) e.afterSendId = remap(e.afterSendId);
};

// keep only the named send-log indices, renumber 1..N and remap every referenced send id
const pruneSendLog = (leg, keepIdx) => {
  const keep = new Set(keepIdx);
  const map = new Map();
  const next = [];
  leg.cdpSendLog.forEach((c, i) => { if (keep.has(i)) { next.push(c); map.set(c.id, next.length); } });
  leg.cdpSendLog = next;
  next.forEach((c, i) => { c.id = i + 1; });
  for (const f of ['interceptSendId', 'triggerSendId', 'trigger2SendId', 'dismissSendId', 'priorPressId', 'priorReleaseId']) {
    if (leg[f] !== null && leg[f] !== undefined) leg[f] = map.has(leg[f]) ? map.get(leg[f]) : null;
  }
  for (const e of arr(leg.cdpEventLog)) if (map.has(e.afterSendId)) e.afterSendId = map.get(e.afterSendId);
};

const legOf = (r, n) => arr(r.legs).find((l) => l.name === n);
const evOf = (r, leg, pred = () => true) => arr(legOf(r, leg).pageEvents).filter(pred);
const openOf = (r, leg) => arr(legOf(r, leg).cdpEventLog).find((e) => e.method === 'Page.fileChooserOpened');

// rewrite the fixture/CDP port everywhere the receipt binds it
const setHttpPort = (r, port) => {
  const old = r.ports.http;
  r.ports.http = port;
  r.fixture.origin = 'http://127.0.0.1:' + port;
  for (const l of arr(r.legs)) for (const c of arr(l.cdpSendLog)) if (c.method === 'Page.navigate' && c.params && typeof c.params.url === 'string') c.params.url = c.params.url.split(':' + old + '/').join(':' + port + '/');
  for (const l of arr(r.legs)) for (const e of arr(l.cdpEventLog)) if (e.method === 'Page.frameNavigated' && e.params && typeof e.params.url === 'string') e.params.url = e.params.url.split(':' + old + '/').join(':' + port + '/');
};
const setCdpPort = (r, port) => {
  const old = r.ports.cdp;
  r.ports.cdp = port;
  for (const l of arr(r.legs)) {
    l.argv = arr(l.argv).map((a) => (typeof a === 'string' && a.startsWith('--remote-debugging-port=') ? '--remote-debugging-port=' + port : a));
    if (l.devtoolsListening && typeof l.devtoolsListening.url === 'string') {
      l.devtoolsListening.url = l.devtoolsListening.url.split(':' + old + '/').join(':' + port + '/');
      l.devtoolsListening.port = port;
      l.stderrHead = 'DevTools listening on ' + l.devtoolsListening.url;
    }
  }
};

export const WITNESSES = {
  'ports-http-floor-dropped': { desc: 'fixture HTTP port set to 80 (privileged) with origin and every navigate/frameNavigated URL rewritten', apply: (r) => { setHttpPort(r, 80); } },
  'ports-cdp-floor-dropped': { desc: 'CDP port set to 80 with argv, devtools URL and stderr head rewritten', apply: (r) => { setCdpPort(r, 80); } },
  'host-cdp-product-dropped': { desc: 'host.cdpProduct relabelled to Chrome/154.0.0.0 (chromium string untouched)', apply: (r) => { r.host.cdpProduct = 'Chrome/154.0.0.0'; } },
  'host-protocol-dropped': { desc: 'host.cdpProtocolVersion relabelled to 1.2', apply: (r) => { r.host.cdpProtocolVersion = '1.2'; } },
  'fixture-viewport-dropped': { desc: 'fixture viewport changed to 800x600', apply: (r) => { r.fixture.viewport = { width: 800, height: 600 }; } },
  'fixture-keyset-dropped': { desc: 'an extra fixture field (patch2) is added', apply: (r) => { r.fixture.patch2 = 'x'; } },
  'fixture-origin-dropped': { desc: 'fixture origin pointed at a different port than the declared HTTP port', apply: (r) => { r.fixture.origin = 'http://127.0.0.1:1'; } },
  'frame-tree-parent-dropped': { desc: 'top-level frameTree.mainFrameParentId set to a non-null id', apply: (r) => { r.frameTree.mainFrameParentId = 'ABC'; } },
  'frame-tree-id-regex-loose': { desc: 'top-level frameTree.mainFrameId shortened to 1 hex char', apply: (r) => { r.frameTree.mainFrameId = 'A'; } },
  'nonce-suffix-min-dropped': { desc: 'run nonce shortened to a 1-char suffix (rewritten everywhere, expected nonce follows)', apply: (r) => { rewriteNonce(r, 'tabi-r79-a'); return { expectNonce: 'tabi-r79-a' }; } },
  'nonce-suffix-max-dropped': { desc: 'run nonce suffix lengthened to 60 chars (rewritten everywhere, expected nonce follows)', apply: (r) => { const n = 'tabi-r79-' + 'a'.repeat(60); rewriteNonce(r, n); return { expectNonce: n }; } },

  'chooser-wait-upper-widened': { desc: 'chooserWaitMs set to 3001 on sp-click-then-show', apply: (r) => { legOf(r, 'sp-click-then-show').chooserWaitMs = 3001; } },
  'chooser-wait-lower-dropped': { desc: 'chooserWaitMs set to -1 on sp-click-then-show', apply: (r) => { legOf(r, 'sp-click-then-show').chooserWaitMs = -1; } },
  'marks-min-count-widened': { desc: 'sp-click-then-show marks reduced to [start, settle]', apply: (r) => { const l = legOf(r, 'sp-click-then-show'); l.marks = [l.marks[0], l.marks[l.marks.length - 1]]; } },
  'marks-start-name-dropped': { desc: 'first mark renamed start -> begin', apply: (r) => { legOf(r, 'sp-click-then-show').marks[0].name = 'begin'; } },
  'marks-pre-name-dropped': { desc: 'second mark renamed pre -> pre0', apply: (r) => { legOf(r, 'sp-click-then-show').marks[1].name = 'pre0'; } },
  'marks-settle-name-dropped': { desc: 'last mark renamed settle -> done', apply: (r) => { const l = legOf(r, 'sp-click-then-show'); l.marks[l.marks.length - 1].name = 'done'; } },
  'marks-monotonic-dropped': { desc: 'sp-click-then-show prior-click mark moved before the pre mark', apply: (r) => { legOf(r, 'sp-click-then-show').marks[2].at = 5; } },
  'marks-grid-dropped': { desc: 'sp-click-then-show show-picker mark moved off the 0.1 ms grid (166.15)', apply: (r) => { legOf(r, 'sp-click-then-show').marks[3].at = 166.15; } },
  'closedAt-num-dropped': { desc: 'sp-click-then-show closedAt replaced by a string', apply: (r) => { legOf(r, 'sp-click-then-show').closedAt = 'x'; } },
  'err-intercept-dropped': { desc: 'sp-click-then-show interceptError given a non-integer code', apply: (r) => { legOf(r, 'sp-click-then-show').interceptError = { code: 'x', message: 'm' }; } },
  'err-prior-click-dropped': { desc: 'sp-click-then-show priorClickError given a fractional code', apply: (r) => { legOf(r, 'sp-click-then-show').priorClickError = { code: 1.5, message: 'm' }; } },
  'err-trigger-dropped': { desc: 'sp-click-then-show triggerError given a fractional code', apply: (r) => { legOf(r, 'sp-click-then-show').triggerError = { code: 1.5, message: 'm' }; } },
  'err-trigger2-dropped': { desc: 'sp-show-twice trigger2Error given a fractional code', apply: (r) => { legOf(r, 'sp-show-twice').trigger2Error = { code: 1.5, message: 'm' }; } },
  'err-dismiss-dropped': { desc: 'sp-nogesture-intercept-on dismissError given a fractional code (leg has no dismiss send)', apply: (r) => { legOf(r, 'sp-nogesture-intercept-on').dismissError = { code: 1.5, message: 'm' }; } },
  'err-code-integer-dropped': { desc: 'sp-cdp-gesture interceptError given a fractional code', apply: (r) => { legOf(r, 'sp-cdp-gesture').interceptError = { code: 1.5, message: 'm' }; } },
  'err-keyset-dropped': { desc: 'sp-cdp-gesture interceptError given an extra field', apply: (r) => { legOf(r, 'sp-cdp-gesture').interceptError = { code: null, message: 'm', extra: 1 }; } },

  'send-prologue-order-dropped': { desc: 'the first two prologue calls (Browser.getVersion, Page.enable) swap methods and params', apply: (r) => { const l = legOf(r, 'sp-click-then-show'); const a = l.cdpSendLog[0], b = l.cdpSendLog[1]; const m = a.method, p = a.params; a.method = b.method; a.params = b.params; b.method = m; b.params = p; } },
  'send-navigate-count-widened': { desc: 'a second Page.navigate call is inserted (ids renumbered, send-id references remapped)', apply: (r) => { const l = legOf(r, 'sp-click-then-show'); const nav = l.cdpSendLog.find((c) => c.method === 'Page.navigate'); insertSendCall(l, 6, nav); } },
  'send-getframetree-count-widened': { desc: 'a second Page.getFrameTree call is inserted (ids renumbered, send-id references remapped)', apply: (r) => { const l = legOf(r, 'sp-click-then-show'); const ft = l.cdpSendLog.find((c) => c.method === 'Page.getFrameTree'); insertSendCall(l, 6, ft); } },
  'send-navigate-url-dropped': { desc: 'the navigate URL run parameter changed to another nonce', apply: (r) => { const l = legOf(r, 'sp-click-then-show'); const nav = l.cdpSendLog.find((c) => c.method === 'Page.navigate'); nav.params.url = nav.params.url.replace(/\?run=.*$/, '?run=other'); } },
  'send-min-length-widened': { desc: 'sp-nogesture-intercept-on send log pruned to the 6-call prologue + intercept + trigger (8 calls, ids renumbered)', apply: (r) => { const l = legOf(r, 'sp-nogesture-intercept-on'); const keep = [0, 1, 2, 3, 4, 5]; l.cdpSendLog.forEach((c, i) => { if (c.method === 'Page.setInterceptFileChooserDialog' || (c.method === 'Runtime.evaluate' && c.params && typeof c.params.expression === 'string' && c.params.expression.includes('showPicker'))) keep.push(i); }); pruneSendLog(l, keep); } },
  'send-params-object-dropped': { desc: 'the Browser.getVersion call params replaced by null', apply: (r) => { legOf(r, 'sp-click-then-show').cdpSendLog[0].params = null; } },
  'eval-wrapper-target-agnostic': { desc: 'a showPicker wrapper for a non-plan element (m) is evaluated on sp-click-then-show', apply: (r) => { const l = legOf(r, 'sp-click-then-show'); l.cdpSendLog.push({ id: l.cdpSendLog.length + 1, method: 'Runtime.evaluate', params: { expression: "(function(){ try { var r = document.getElementById(\"m\").showPicker(); return {ok: true, ret: String(r)}; } catch (e) { return {ok: false, name: e.name, message: e.message}; } })()", returnByValue: true } }); } },

  'plan-prior-order-dropped': { desc: 'sp-click-then-show press/release send ids swapped (release before press)', apply: (r) => { const l = legOf(r, 'sp-click-then-show'); const a = l.priorPressId; l.priorPressId = l.priorReleaseId; l.priorReleaseId = a; } },
  'plan-click-release-dropped': { desc: 'sp-click-control given a non-null priorReleaseId', apply: (r) => { legOf(r, 'sp-click-control').priorReleaseId = 5; } },
  'plan-trigger2-unexpected-dropped': { desc: 'sp-click-then-show given a trigger2SendId', apply: (r) => { legOf(r, 'sp-click-then-show').trigger2SendId = 5; } },
  'plan-dismiss-unexpected-dropped': { desc: 'sp-nogesture-intercept-on (a refused leg that sends no dismiss) given a dismissSendId and an empty dismissResult', apply: (r) => { const l = legOf(r, 'sp-nogesture-intercept-on'); l.dismissSendId = 5; l.dismissResult = {}; } },
  'plan-intercept-id-dropped': { desc: 'sp-click-then-show interceptSendId set to 99', apply: (r) => { legOf(r, 'sp-click-then-show').interceptSendId = 99; } },

  'cdp-open-keyset-dropped': { desc: 'the fileChooserOpened params gain an extra field', apply: (r) => { openOf(r, 'sp-click-then-show').params.extra = 1; } },
  'cdp-nav-url-dropped': { desc: 'the frameNavigated URL run parameter changed to another nonce', apply: (r) => { const l = legOf(r, 'sp-click-then-show'); const n = l.cdpEventLog.find((e) => e.method === 'Page.frameNavigated'); n.params.url = n.params.url.replace(/\?run=.*$/, '?run=other'); } },
  'cdp-nav-count-widened': { desc: 'a second frameNavigated event is appended to a leg', apply: (r) => { const l = legOf(r, 'sp-click-then-show'); const n = l.cdpEventLog.find((e) => e.method === 'Page.frameNavigated'); l.cdpEventLog.push(clone(n)); } },
  'cdp-aftersend-integer-dropped': { desc: 'a frameNavigated afterSendId replaced by a string', apply: (r) => { const l = legOf(r, 'sp-click-then-show'); l.cdpEventLog.find((e) => e.method === 'Page.frameNavigated').afterSendId = 'x'; } },

  'typed-ret-dropped': { desc: 'a page event ret field set to a number', apply: (r) => { evOf(r, 'sp-click-then-show')[0].ret = 5; } },
  'event-window-startleg-dropped': { desc: 'the cancel event on sp-cancel-armed attributed to the start window', apply: (r) => { evOf(r, 'sp-cancel-armed', (e) => e.type === 'cancel')[0].leg = 'start'; } },
  'event-quantum-tolerance-widened': { desc: 'a page event ts placed 0.0005 ms off the 0.1 ms grid (inside 1e-3, outside 1e-4)', apply: (r) => { evOf(r, 'sp-click-then-show')[0].ts = 10.00005; } },
  'leg-shape-act-dropped': { desc: 'a page event act column set to null', apply: (r) => { evOf(r, 'sp-click-then-show')[0].act = null; } },

  'gesture-ret-dropped': { desc: 'a successful showPicker ret relabelled to "x"', apply: (r) => { legOf(r, 'sp-click-then-show').showPicker = { ok: true, ret: 'x' }; } },
  'no-selection-dismiss-state-dropped': { desc: 'stateAfterDismiss on sp-click-then-show carries a selected file', apply: (r) => { legOf(r, 'sp-click-then-show').stateAfterDismiss = { s: [['a', 1, 'text/plain']], m: [], d: [], k: [], dis: [] }; } },

  'argv-stderr-link-dropped': { desc: 'a leg stderrHead no longer contains the devtools URL', apply: (r) => { legOf(r, 'sp-click-then-show').stderrHead = 'nothing'; } },
  'argv-token-regex-loosened': { desc: 'a launch token set to 12 non-hex characters with the profile name following it', apply: (r) => { const l = legOf(r, 'sp-click-then-show'); const tok = 'ZZZZZZZZZZZZ'; l.launchToken = tok; const i = l.argv.findIndex((a) => a.startsWith('--user-data-dir=')); l.argv[i] = '--user-data-dir=' + path.join(path.dirname(l.argv[i].slice('--user-data-dir='.length)), 'profile-' + tok); } },
  'argv-browserid-regex-loosened': { desc: 'a devtools browser id set to a non-uuid with url and stderr head following it', apply: (r) => { const l = legOf(r, 'sp-click-then-show'); const bid = 'not-a-uuid'; l.devtoolsListening = { url: 'ws://127.0.0.1:' + r.ports.cdp + '/devtools/browser/' + bid, port: r.ports.cdp, browserId: bid }; l.stderrHead = 'DevTools listening on ' + l.devtoolsListening.url; } },
  'teardown-portprobes-dropped': { desc: 'a teardown port probe reports open', apply: (r) => { legOf(r, 'sp-click-then-show').teardown.portProbes.fixture = 'open'; } },
  'teardown-curl-dropped': { desc: 'a post-kill curl reports 0 instead of connection-refused', apply: (r) => { legOf(r, 'sp-click-then-show').teardown.postKillCurl.fixture = 0; } },
  'server-log-count-widened': { desc: 'the fixture-root request is duplicated in a leg server log', apply: (r) => { const l = legOf(r, 'sp-click-then-show'); l.serverLog.push(clone(l.serverLog.find((s) => s.path === '/'))); } },
  'server-log-404-dropped': { desc: 'a non-root path answers 200', apply: (r) => { legOf(r, 'sp-click-then-show').serverLog.push({ path: '/x', run: '', status: 200 }); } },

  'run-window-lower-widened': { desc: 'finishedAt is exactly 19999 ms after startedAt', apply: (r) => { r.finishedAt = new Date(Date.parse(r.startedAt) + 19999).toISOString(); } },
  'run-window-upper-inclusive': { desc: 'finishedAt is exactly 600000 ms after startedAt', apply: (r) => { r.finishedAt = new Date(Date.parse(r.startedAt) + 600000).toISOString(); } },

  'walk-unreadable-dir-skipped': {
    desc: 'a mirror lane carries a chmod-000 directory inside the walked round-79 tree',
    apply: (r, ctx) => {
      const mirror = path.join(ctx.work, 'witness-mirror', 'tabi-shokunin');
      const priorLocked = path.join(mirror, '.ufo/waves/round-79/locked');
      if (fs.existsSync(priorLocked)) { try { fs.chmodSync(priorLocked, 0o700); } catch {} }
      fs.rmSync(mirror, { recursive: true, force: true });
      for (const t of ['.ufo/waves/round-79', 'corpus/evidence/round79']) fs.mkdirSync(path.join(mirror, t), { recursive: true });
      const src = path.join(ctx.lane, '.ufo/waves/round-79/controls/c1');
      if (fs.existsSync(src)) fs.cpSync(src, path.join(mirror, '.ufo/waves/round-79/controls/c1'), { recursive: true });
      const locked = path.join(mirror, '.ufo/waves/round-79/locked');
      fs.mkdirSync(locked, { recursive: true });
      fs.chmodSync(locked, 0o000);
      return { lane: mirror };
    },
  },
};
