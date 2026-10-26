// delta.mjs — round 35 w1 ExecFirefoxDelta: run the lane's own two recorders
// (gate liveRecord on Chromium; counter liveRecordFirefox on Firefox) over one
// shared recipe, then diff response/event shapes. Nothing here edits the lane:
// the gate and counter are imported read-only from the scratch clone.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const CLONE = process.env.CLONE;
const OUT = process.env.OUT;
const FF = '/home/vgpnk/.local/opt/firefox-158.0.1/firefox';
const GD = '/home/vgpnk/.local/bin/geckodriver';

const gate = await import(`${CLONE}/scripts/check-bidi-runtime.mjs`);
const counter = await import(`${CLONE}/.ufo/waves/round-35/counters/c2-firefox-bidi.mjs`);

// ---- transcript serialisation (gate's recordFromTranscript shape) ----------
function toTranscript(rec) {
  const items = [];
  for (const c of rec.cmds) items.push({ i: c.i, kind: 'cmd', c });
  for (const e of rec.events) items.push({ i: e.i, kind: 'event', e });
  items.sort((a, b) => a.i - b.i);
  const lines = [];
  let seq = 0;
  if (rec.newSession) lines.push(JSON.stringify({ seq: ++seq, dir: 'http-res', path: '/session', body: rec.newSession }));
  for (const it of items) {
    if (it.kind === 'cmd') {
      lines.push(JSON.stringify({ seq: ++seq, dir: 'send', frame: { id: it.c.id, method: it.c.method, params: it.c.params } }));
      if (it.c.response) lines.push(JSON.stringify({ seq: ++seq, dir: 'recv', frame: it.c.response }));
    } else {
      lines.push(JSON.stringify({ seq: ++seq, dir: 'recv', frame: { type: 'event', method: it.e.method, params: it.e.params } }));
    }
  }
  return lines.join('\n') + '\n';
}

// ---- shape classification --------------------------------------------------
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
function strClass(s) {
  if (typeof s !== 'string') return `nonstring:${typeof s}`;
  if (UUID.test(s)) return 'uuid';
  if (/^[0-9a-f]{32}$/.test(s)) return 'hex32-lower';
  if (/^[0-9A-F]{32}$/.test(s)) return 'hex32-upper';
  if (/^ws:\/\/(127\.0\.0\.1|localhost|\d+\.\d+\.\d+\.\d+):\d+\/session\//.test(s)) return 'ws-session-url';
  if (/^ws:\/\//.test(s)) return 'ws-url';
  if (/^http:\/\/127\.0\.0\.1:\d+\//.test(s)) return 'loopback-url';
  if (/^\/[a-z0-9._-]+$/i.test(s)) return 'path';
  if (s.length > 200 && /^[A-Za-z0-9+/=]+$/.test(s)) return `base64(len:${s.length})`;
  if (/^[\dA-Fa-f-]{8,}$/.test(s)) return 'hexish';
  return 'str';
}
function shape(v, depth = 0) {
  if (v === null) return 'null';
  if (v === undefined) return 'undef';
  if (Array.isArray(v)) return `[${v.length ? shape(v[0], depth + 1) : ''}]`;
  switch (typeof v) {
    case 'string': return strClass(v);
    case 'number': return Number.isInteger(v) ? 'int' : 'float';
    case 'boolean': return 'bool';
    case 'object': {
      if (depth >= 4) return 'obj';
      return `{${Object.keys(v).sort().map((k) => `${k}:${shape(v[k], depth + 1)}`).join(',')}}`;
    }
    default: return typeof v;
  }
}

const resOf = (c) => (c && c.response && c.response.result) || undefined;
const statusOf = (c) => {
  if (!c) return 'absent';
  if (!c.response) return 'no-response';
  if (c.response.type === 'success') return 'success';
  return `error:${c.response.error || '?'}`;
};
const cmd = (rec, method, pred = () => true) => rec.cmds.find((c) => c.method === method && pred(c));
const cmds = (rec, method) => rec.cmds.filter((c) => c.method === method);
const evs = (rec, method) => rec.events.filter((e) => e.method === method);
const evalCmd = (rec, expr) => rec.cmds.find((c) => c.method === 'script.evaluate' && c.params.expression === expr);

// ---- per-row extractors ----------------------------------------------------
// Each returns { text, sig }. sig is compared only between engines: identical
// sig = same shape (values may still differ), differing sig = shape delta.
const ROWS = [
  ['R1', 'POST /session (classic new session)', (rec) => {
    const v = (rec.newSession && rec.newSession.value) || {};
    const caps = v.capabilities || {};
    const keys = Object.keys(caps).sort();
    const first = rec.cmds[0];
    return {
      text: `sessionId=${strClass(v.sessionId)}; webSocketUrl=${strClass(caps.webSocketUrl || '')}; browserName=${JSON.stringify(caps.browserName)}; browserVersion=${caps.browserVersion}; capsKeys=[${keys.join(' ')}]; firstBiDiCmd=${first ? `${first.method}:${statusOf(first)}` : 'none'}`,
      sig: `sid:${strClass(v.sessionId)}|ws:${strClass(caps.webSocketUrl || '')}|bn:${caps.browserName}|caps:${keys.join(',')}`,
    };
  }],
  ['R2', 'browsingContext.getTree', (rec) => {
    const c = cmd(rec, 'browsingContext.getTree');
    const r = resOf(c);
    const ctx = r && r.contexts && r.contexts[0];
    return {
      text: `${statusOf(c)}; contexts=${(r && r.contexts) || [] ? r.contexts.length : 0}; context=${ctx ? strClass(ctx.context) : 'none'} (${ctx ? ctx.context : ''}); clientWindow=${ctx ? strClass(ctx.clientWindow) : 'none'}; userContext=${ctx ? JSON.stringify(ctx.userContext) : 'none'}; contextKeys=[${ctx ? Object.keys(ctx).sort().join(' ') : ''}]; hasChildren=${ctx ? Array.isArray(ctx.children) : 'n/a'}`,
      sig: `${statusOf(c)}|${shape(r)}`,
    };
  }],
  ['R3', 'browsingContext.navigate (+ browsingContext.load)', (rec) => {
    const c = cmd(rec, 'browsingContext.navigate', (x) => /\/a\.html$/.test(String(x.params.url)));
    const r = resOf(c);
    const loads = evs(rec, 'browsingContext.load');
    const e = loads.find((x) => /\/a\.html$/.test(String(x.params.url)));
    return {
      text: `${statusOf(c)}; resultKeys=[${r ? Object.keys(r).sort().join(' ') : ''}]; navigation=${r ? strClass(r.navigation) : 'absent'}; urlClass=${r ? strClass(r.url) : 'absent'}; loadEvents=${loads.length}; loadKeys=[${e ? Object.keys(e.params).sort().join(' ') : ''}]`,
      sig: `${statusOf(c)}|${shape(r)}|load:${shape(e && e.params)}|n:${loads.length}`,
    };
  }],
  ['R4', 'browsingContext.captureScreenshot', (rec) => {
    const c = cmd(rec, 'browsingContext.captureScreenshot');
    const r = resOf(c) || {};
    const b = Buffer.from(String(r.data || ''), 'base64');
    const dims = b.length >= 24 ? `${b.readUInt32BE(16)}x${b.readUInt32BE(20)}` : 'n/a';
    return {
      text: `${statusOf(c)}; dataKey=${r.data === undefined ? 'none' : 'data'}; valueType=${typeof r.data}; base64Chars=${String(r.data || '').length}; bytes=${b.length}; pngDims=${dims}; pngSha256=${createHash('sha256').update(b).digest('hex')}; resultKeys=[${Object.keys(r).sort().join(' ')}]`,
      sig: `${statusOf(c)}|${shape(r)}|dims:${dims}|bytes:${b.length}`,
    };
  }],
  ['R5', 'browsingContext.locateNodes', (rec) => {
    const c = cmd(rec, 'browsingContext.locateNodes', (x) => x.params.locator && x.params.locator.value === '#h');
    const r = resOf(c) || {};
    const n = (r.nodes || [])[0];
    return {
      text: `${statusOf(c)}; nodes=${(r.nodes || []).length}; nodeKeys=[${n ? Object.keys(n).sort().join(' ') : ''}]; sharedId=${n ? strClass(n.sharedId) : 'none'} (${n ? n.sharedId : ''}); valueKeys=[${n && n.value ? Object.keys(n.value).sort().join(' ') : ''}]; localName=${n && n.value ? n.value.localName : 'none'}; resultKeys=[${Object.keys(r).sort().join(' ')}]`,
      sig: `${statusOf(c)}|${shape(r)}`,
    };
  }],
  ['R6', 'script.evaluate window.__ready', (rec) => {
    const c = evalCmd(rec, 'window.__ready');
    const r = resOf(c);
    return {
      text: `${statusOf(c)}; resultKeys=[${r ? Object.keys(r).sort().join(' ') : ''}]; type=${r ? r.type : 'absent'}; result=${r && r.result ? JSON.stringify(r.result) : 'absent'}; realm=${r ? strClass(r.realm) : 'absent'} (${r ? r.realm : ''})`,
      sig: `${statusOf(c)}|${shape(r)}`,
    };
  }],
  ['R7', 'browsingContext.setViewport (+ innerWidth)', (rec) => {
    const vp = cmd(rec, 'browsingContext.setViewport');
    const iw = evalCmd(rec, 'window.innerWidth');
    return {
      text: `setViewport=${statusOf(vp)} result=${JSON.stringify(resOf(vp) || null)}; innerWidth=${JSON.stringify(resOf(iw) || null)}`,
      sig: `vp:${statusOf(vp)}|${shape(resOf(vp))}|iw:${shape(resOf(iw))}`,
    };
  }],
  ['R8', 'input.performActions (pointer) → #out', (rec) => {
    const act = cmds(rec, 'input.performActions');
    const out = evalCmd(rec, "document.getElementById('out').textContent");
    return {
      text: `performActions=${act.length} (${act.map(statusOf).join(',')}); resultKeys=[${resOf(act[0]) ? Object.keys(resOf(act[0])).sort().join(' ') : ''}]; #out=${JSON.stringify((resOf(out) || {}).result || null)}; evaluateRealm=${out && resOf(out) ? strClass(resOf(out).realm) : 'n/a'}`,
      sig: `n:${act.length}|${act.map(statusOf).join(',')}|${shape(resOf(act[0]))}|${shape((resOf(out) || {}).result)}`,
    };
  }],
  ['R9', 'input.performActions (keys) → #t', (rec) => {
    const act = cmds(rec, 'input.performActions').filter((c) => (c.params.actions || []).some((s) => s.type === 'key'));
    const val = evalCmd(rec, "document.getElementById('t').value");
    return {
      text: `keyPerformActions=${act.length}; status=${act.map(statusOf).join(',')}; #t=${JSON.stringify((resOf(val) || {}).result || null)}; evaluateRealm=${val && resOf(val) ? strClass(resOf(val).realm) : 'n/a'}`,
      sig: `n:${act.length}|${act.map(statusOf).join(',')}|${shape((resOf(val) || {}).result)}`,
    };
  }],
  ['R10', 'network.beforeRequestSent / network.responseCompleted', (rec) => {
    const brs = evs(rec, 'network.beforeRequestSent');
    const rc = evs(rec, 'network.responseCompleted');
    const a = brs.find((e) => /\/a\.html$/.test(String((e.params.request || {}).url)));
    const r = rc.find((e) => /\/a\.html$/.test(String((e.params.response || {}).url)));
    const req = a ? a.params.request : null;
    const resp = r ? r.params.response : null;
    const hn = req && req.headers ? req.headers.map((h) => String(h.name)) : [];
    const dup = [...new Set(hn.filter((x, i) => hn.indexOf(x) !== i))];
    const fav = brs.filter((e) => /\/favicon\.ico$/.test(String((e.params.request || {}).url))).length;
    return {
      text: `beforeRequestSent=${brs.length} (favicon.ico=${fav}) keys=[${a ? Object.keys(a.params).sort().join(' ') : ''}]; requestKeys=[${req ? Object.keys(req).sort().join(' ') : ''}]; requestId=${req ? strClass(req.request) : 'none'} (${req ? req.request : ''}); headerCount=${hn.length} uniqueNames=${new Set(hn).size} duplicatedNames=[${dup.join(',')}]; firstHeader=${req && req.headers && req.headers[0] ? JSON.stringify(req.headers[0]) : 'none'}; hasHostHeader=${hn.some((x) => x.toLowerCase() === 'host')}; timings=${req ? JSON.stringify(req.timings).slice(0, 120) : 'n/a'}; responseCompleted=${rc.length} keys=[${r ? Object.keys(r.params).sort().join(' ') : ''}]; responseKeys=[${resp ? Object.keys(resp).sort().join(' ') : ''}]`,
      sig: `k:${shape(a && a.params)}|req:${shape(req)}|rk:${shape(resp)}|n:${brs.length},${rc.length}`,
    };
  }],
  ['R11', 'network.responseCompleted (status + raw headers)', (rec) => {
    const r = evs(rec, 'network.responseCompleted').find((e) => /\/a\.html$/.test(String((e.params.response || {}).url)));
    const resp = r ? r.params.response : null;
    const h = resp && resp.headers ? resp.headers : [];
    const fixture = h.find((x) => String(x.name).toLowerCase() === 'x-tabi-fixture');
    return {
      text: `status=${resp ? resp.status : 'absent'}; statusText=${JSON.stringify(resp ? resp.statusText : null)}; headerCount=${h.length} uniqueNames=${new Set(h.map((x) => String(x.name))).size}; headerNames=[${h.map((x) => x.name).join(',')}]; headerValueEncoding=${h[0] ? shape(h[0].value) : 'n/a'}; fixtureHeader=${fixture ? JSON.stringify(fixture) : 'MISSING'}; mimeType=${JSON.stringify(resp ? resp.mimeType : null)}; bytesReceived=${resp ? resp.bytesReceived : 'n/a'}; headersSize=${resp ? resp.headersSize : 'n/a'}; bodySize=${resp ? resp.bodySize : 'n/a'}; content=${resp ? JSON.stringify(resp.content) : 'n/a'}`,
      sig: `${shape(resp)}|fix:${fixture ? shape(fixture.value) : 'missing'}`,
    };
  }],
  ['R12', 'network.addDataCollector + network.getData', (rec) => {
    const col = cmd(rec, 'network.addDataCollector');
    const g = cmd(rec, 'network.getData');
    const r = resOf(g) || {};
    const b = r.bytes;
    let decoded = null;
    if (b && b.type === 'string') decoded = b.value;
    else if (b && b.type === 'base64') decoded = Buffer.from(String(b.value || ''), 'base64').toString('utf8');
    return {
      text: `addDataCollector=${statusOf(col)}${col && col.response && col.response.type === 'error' ? `(${col.response.error})` : ''}; getData=${statusOf(g)}; resultKeys=[${Object.keys(r).sort().join(' ')}]; bytes.type=${b ? b.type : 'none'}; bytes.valueLen=${b ? String(b.value || '').length : 0}; decodedMatchesFixture=${decoded === gate.DATA_TEXT}; collectorResultKeys=[${resOf(col) ? Object.keys(resOf(col)).sort().join(' ') : ''}]`,
      sig: `${statusOf(col)}|${statusOf(g)}|${shape(r)}|match:${decoded === gate.DATA_TEXT}`,
    };
  }],
  ['R13', 'network.addIntercept + blocked beforeRequestSent + continueRequest', (rec) => {
    const ic = cmd(rec, 'network.addIntercept');
    const icId = resOf(ic) ? resOf(ic).intercept : undefined;
    const blocked = evs(rec, 'network.beforeRequestSent').filter((e) => e.params.isBlocked === true && (e.params.intercepts || []).includes(icId));
    const cont = cmd(rec, 'network.continueRequest');
    return {
      text: `addIntercept=${statusOf(ic)} resultKeys=[${resOf(ic) ? Object.keys(resOf(ic)).sort().join(' ') : ''}]; interceptId=${icId === undefined ? 'none' : strClass(icId)}; blockedEvents=${blocked.length}; blockedEventKeys=[${blocked[0] ? Object.keys(blocked[0].params).sort().join(' ') : ''}]; continueRequest=${statusOf(cont)}`,
      sig: `${statusOf(ic)}|${shape(resOf(ic))}|b:${blocked.length},${shape(blocked[0] && blocked[0].params)}|${statusOf(cont)}`,
    };
  }],
  ['R14', 'browsingContext.traverseHistory', (rec) => {
    const c = cmd(rec, 'browsingContext.traverseHistory');
    const r = resOf(c);
    const p = evalCmd(rec, 'location.pathname');
    return {
      text: `${statusOf(c)}; result=${JSON.stringify(r === undefined ? null : r)}; resultKeys=[${r ? Object.keys(r).sort().join(' ') : ''}]; pathnameAfter=${JSON.stringify((resOf(p) || {}).result || null)}`,
      sig: `${statusOf(c)}|${shape(r)}|${shape((resOf(p) || {}).result)}`,
    };
  }],
  ['R15', 'storage.getCookies', (rec) => {
    const c = cmd(rec, 'storage.getCookies');
    const cook = ((resOf(c) || {}).cookies) || [];
    const k = cook.find((x) => x.name === 'tabi_fixture') || cook[0];
    return {
      text: `${statusOf(c)}; cookies=${cook.length}; names=[${cook.map((x) => x.name).join(',')}]; cookieKeys=[${k ? Object.keys(k).sort().join(' ') : ''}]; valueShape=${k ? shape(k.value) : 'n/a'}; sameSite=${k ? JSON.stringify(k.sameSite) : 'n/a'}; httpOnly=${k ? k.httpOnly : 'n/a'}; secure=${k ? k.secure : 'n/a'}; cookiePartitionKey=${k ? (k.partitionKey === undefined ? 'absent' : JSON.stringify(k.partitionKey)) : 'n/a'}; resultPartitionKey=${JSON.stringify((resOf(c) || {}).partitionKey)}; resultKeys=[${resOf(c) ? Object.keys(resOf(c)).sort().join(' ') : ''}]`,
      sig: `${statusOf(c)}|n:${cook.length}|${shape(k)}|${shape(resOf(c))}`,
    };
  }],
  ['R16', 'no BiDi command (matrix R16 = no counterpart)', () => ({
    text: 'no command in the shared recipe (R16 is the matrix row with no BiDi counterpart); nothing recorded',
    sig: 'no-command',
  })],
  ['R17', 'browsingContext.userPromptOpened + handleUserPrompt', (rec) => {
    const opened = evs(rec, 'browsingContext.userPromptOpened');
    const e = opened.find((x) => x.params.message === 'tabi-alert') || opened[0];
    const h = cmd(rec, 'browsingContext.handleUserPrompt');
    return {
      text: `userPromptOpened=${opened.length}; promptKeys=[${e ? Object.keys(e.params).sort().join(' ') : ''}]; type=${e ? JSON.stringify(e.params.type) : 'none'}; defaultValue=${e ? (e.params.defaultValue === undefined ? 'absent' : JSON.stringify(e.params.defaultValue)) : 'none'}; handler=${e ? JSON.stringify(e.params.handler) : 'none'}; handleUserPrompt=${statusOf(h)} result=${JSON.stringify(resOf(h) || null)}`,
      sig: `${opened.length}|${shape(e && e.params)}|${statusOf(h)}|${shape(resOf(h))}`,
    };
  }],
];

// ---- run both recorders ----------------------------------------------------
const log = [];
const t0 = Date.now();
let cr = null;
let ce = null;
try {
  cr = await gate.liveRecord({ timeoutMs: 120000 });
  log.push({ engine: 'chromium', ok: true, ms: Date.now() - t0, cmds: cr.cmds.length, events: cr.events.length });
} catch (e) {
  ce = String((e && e.stack) || e);
  log.push({ engine: 'chromium', ok: false, ms: Date.now() - t0, error: ce });
}
const t1 = Date.now();
let fr = null;
let fe = null;
try {
  fr = await counter.liveRecordFirefox({ gate, firefox: FF, geckodriver: GD, timeoutMs: 180000 });
  log.push({ engine: 'firefox', ok: true, ms: Date.now() - t1, cmds: fr.cmds.length, events: fr.events.length });
} catch (e) {
  fe = String((e && e.stack) || e);
  log.push({ engine: 'firefox', ok: false, ms: Date.now() - t1, error: fe });
}

if (cr) writeFileSync(join(OUT, 'chromium-raw.jsonl'), toTranscript(cr));
if (fr) writeFileSync(join(OUT, 'firefox-raw.jsonl'), toTranscript(fr));

// ---- per-engine command/event inventory ------------------------------------
function inventory(rec) {
  if (!rec) return null;
  const byMethod = {};
  for (const c of rec.cmds) {
    const m = (byMethod[c.method] ||= { calls: 0, statuses: {}, errorCodes: [] });
    m.calls += 1;
    const s = statusOf(c);
    m.statuses[s] = (m.statuses[s] || 0) + 1;
    if (c.response && c.response.type === 'error') m.errorCodes.push(`${c.method}:${c.response.error}:${JSON.stringify(c.response.message || '').slice(0, 160)}`);
  }
  const events = {};
  for (const e of rec.events) events[e.method] = (events[e.method] || 0) + 1;
  return { commands: byMethod, events, caps: Object.keys((rec.newSession && rec.newSession.value && rec.newSession.value.capabilities) || {}).sort(), sessionId: rec.newSession && rec.newSession.value && rec.newSession.value.sessionId };
}

// ---- round-trip: parse the serialised transcript with the gate's own parser
// and run the gate's own PREDICATES (the frozen C2 row predicates). This is not
// the C2 verdict (that needs committed runs + the counter); it checks that the
// JSONL is faithful and records where each row stands on each engine.
function predicates(rec, browserVersion) {
  if (!rec) return null;
  const out = {};
  for (const id of Object.keys(gate.PREDICATES)) {
    let why;
    try { why = gate.PREDICATES[id](rec, { browserVersion }); } catch (e) { why = `threw: ${e && e.message}`; }
    out[id] = why === null ? 'holds' : why;
  }
  return out;
}
const rt = {};
for (const [name, rec] of [['chromium', cr], ['firefox', fr]]) {
  if (!rec) { rt[name] = null; continue; }
  const ver = rec.newSession && rec.newSession.value && rec.newSession.value.capabilities && rec.newSession.value.capabilities.browserVersion;
  const text = toTranscript(rec);
  const parsed = gate.recordFromTranscript(text);
  rt[name] = { roundTripCmds: parsed.cmds.length, roundTripEvents: parsed.events.length, sourceCmds: rec.cmds.length, sourceEvents: rec.events.length, predicates: predicates(rec, ver) };
}

// ---- rows + tsv ------------------------------------------------------------
const rows = [];
for (const [id, method, fn] of ROWS) {
  const c = cr ? fn(cr) : { text: 'no chromium record', sig: 'none' };
  const f = fr ? fn(fr) : { text: 'no firefox record', sig: 'none' };
  rows.push({ row: id, method, chromium: c.text, firefox: f.text, differs: c.sig === f.sig ? 'no' : 'yes', sigC: c.sig, sigF: f.sig });
}
const clean = (s) => String(s).replace(/\t/g, ' ').replace(/\n/g, ' ');
const tsv = ['row\tmethod\tchromium\tfirefox\tdiffers', ...rows.map((r) => [r.row, r.method, r.chromium, r.firefox, r.differs].map(clean).join('\t'))].join('\n') + '\n';
writeFileSync(join(OUT, 'delta.tsv'), tsv);
writeFileSync(join(OUT, 'shapes.json'), JSON.stringify({ generated: new Date().toISOString(), runs: log, chromium: inventory(cr), firefox: inventory(fr), roundTrip: rt, rows }, null, 2) + '\n');
console.log(JSON.stringify(log, null, 2));
console.log(`${rows.filter((r) => r.differs === 'yes').length}/${rows.length} rows differ`);
if (!cr || !fr) process.exitCode = 3;
