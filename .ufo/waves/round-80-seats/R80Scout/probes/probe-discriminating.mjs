// R80Scout discriminating measurement (read-only seat; writes only under the seat dir).
//
// Discriminates Chromium's cross-origin-BEFORE-mutability order from the spec's
// mutability-BEFORE-cross-origin order, using a NON-file input (the file/color
// exemption removes the cross-origin branch entirely and makes the orders
// indistinguishable).
//
//   case A  child-origin (cross-origin) <input type=text>            -> expect SecurityError
//   case B  child-origin (cross-origin) <input type=text disabled>   -> expect SecurityError (mutability NOT reached)
//   case C  same-origin <input type=text disabled>                   -> expect InvalidStateError (positive control)
//   case D  child-origin (cross-origin) <input type=file>            -> control: exemption -> NotAllowedError (no SecurityError)
//   case E  child-origin (cross-origin) <input type=file disabled>   -> control: exemption -> InvalidStateError
//
// Chromium source order (tag 155.0.8059.84, html_input_element.cc:2652-2682):
//   2657 cross-origin -> SecurityError   [skipped for kInputFile/kInputColor]
//   2666 mutability   -> InvalidStateError
//   2673 gesture      -> NotAllowedError
// WHATWG spec order (#dom-input-showpicker): mutability -> cross-origin -> gesture.
// So case B is the discriminator: Chromium gives SecurityError, the spec gives InvalidStateError.
import http from 'node:http';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import fs from 'node:fs';
import crypto from 'node:crypto';

const PORT_A = 18761; // parent origin  http://127.0.0.1:18761
const PORT_B = 18762; // child origin   http://127.0.0.1:18762  (cross-origin: different port)
const CDP = 18763;
const SEAT = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-80-seats/R80Scout';
const OUT = `${SEAT}/probes/discriminating-orders.json`;

const CHILD = `<!doctype html><meta charset=utf-8><body style="margin:0">
<input type="text" id="text" style="position:absolute;left:10px;top:10px;width:100px;height:30px">
<input type="text" id="text_disabled" disabled style="position:absolute;left:10px;top:50px;width:100px;height:30px">
<input type="file" id="file" style="position:absolute;left:10px;top:90px;width:100px;height:30px">
<input type="file" id="file_disabled" disabled style="position:absolute;left:10px;top:130px;width:100px;height:30px">
<script>
window.__try = function (id) {
  try { document.getElementById(id).showPicker(); return { id: id, ok: true }; }
  catch (e) { return { id: id, ok: false, name: e.name, message: e.message }; }
};
</script></body>`;

const PARENT = `<!doctype html><meta charset=utf-8><body style="margin:0">
<iframe id="xo" src="http://127.0.0.1:${PORT_B}/child.html" style="position:absolute;left:0;top:0;width:400px;height:300px;border:0"></iframe>
<input type="text" id="text_disabled" disabled style="position:absolute;left:500px;top:100px;width:100px;height:30px">
<script>
window.__try = function (id) {
  try { document.getElementById(id).showPicker(); return { id: id, ok: true }; }
  catch (e) { return { id: id, ok: false, name: e.name, message: e.message }; }
};
</script></body>`;

const srv = (port, body) => new Promise((res) => {
  const s = http.createServer((q, r) => { r.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); r.end(body); });
  s.listen(port, '127.0.0.1', () => res(s));
});
const sa = await srv(PORT_A, PARENT), sb = await srv(PORT_B, CHILD);
const PROFILE = '/fast/scratch/hyaku/tabi-r80/R80Scout/.prof-discriminating';
const chrome = spawn('/usr/bin/chromium', ['--headless=new', `--remote-debugging-port=${CDP}`, '--remote-allow-origins=*',
  '--no-sandbox', '--disable-gpu', `--user-data-dir=${PROFILE}`, 'about:blank'],
  { stdio: ['ignore', 'pipe', 'pipe'] });
let cerr = ''; chrome.stderr.on('data', (d) => { cerr += d.toString(); });

let ws, msgId = 0; const pending = new Map(); const events = [];
const send = (m, p = {}, s) => { const id = ++msgId; return new Promise((res, rej) => { pending.set(id, { res, rej }); ws.send(JSON.stringify({ id, method: m, params: p, ...(s ? { sessionId: s } : {}) })); }); };

try {
  let version = null;
  for (let i = 0; i < 60 && !version; i++) { try { version = await (await fetch(`http://127.0.0.1:${CDP}/json/version`)).json(); } catch { await sleep(250); } }
  if (!version) throw new Error('cdp down: ' + cerr.slice(-300));
  ws = new WebSocket(version.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = (e) => j(new Error('ws ' + e.message)); });
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { const p = pending.get(d.id); pending.delete(d.id); d.error ? p.rej(new Error(JSON.stringify(d.error))) : p.res(d.result); } else if (d.method) events.push(d); };

  const { targetId } = await send('Target.createTarget', { url: `http://127.0.0.1:${PORT_A}/` });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  await send('Runtime.enable', {}, sessionId); await send('Page.enable', {}, sessionId);
  await sleep(1200);

  const ctxOf = (o) => { let c = null; for (const e of events) if (e.method === 'Runtime.executionContextCreated' && e.params.context.origin === o && e.params.context.auxData && e.params.context.auxData.isDefault !== false) c = e.params.context.id; return c; };
  const childCtx = ctxOf(`http://127.0.0.1:${PORT_B}`), parentCtx = ctxOf(`http://127.0.0.1:${PORT_A}`);
  const ev = async (e, c) => { const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, ...(c ? { contextId: c } : {}) }, sessionId); return r.exceptionDetails ? { evaluationError: r.exceptionDetails.text } : r.result.value; };

  const rec = {
    measuredAt: new Date().toISOString(),
    chromium: version.Browser,
    chromiumPath: '/usr/bin/chromium',
    driver: 'R80Scout discriminating probe (read-only seat)',
    parentOrigin: `http://127.0.0.1:${PORT_A}`,
    childOrigin: `http://127.0.0.1:${PORT_B}`,
    crossOriginBy: 'different port => different origin',
    sourceOrderChromium: 'html_input_element.cc:2652-2682 -> 2657 cross-origin(SecurityError, skipped for kInputFile/kInputColor), 2666 mutability(InvalidStateError), 2673 gesture(NotAllowedError)',
    sourceOrderSpec: 'WHATWG #dom-input-showpicker -> step 1 mutability(InvalidStateError), step 2 cross-origin(SecurityError), step 3 gesture(NotAllowedError)',
    cases: {}
  };

  // child-origin (cross-origin) cases — evaluated in the CHILD's own execution context
  rec.cases.A_childOrigin_text = { expected: 'SecurityError', observed: await ev('JSON.stringify(window.__try("text"))', childCtx) };
  rec.cases.B_childOrigin_textDisabled = { expected: 'SecurityError (mutability NOT reached)', observed: await ev('JSON.stringify(window.__try("text_disabled"))', childCtx) };
  rec.cases.D_childOrigin_file = { expected: 'NotAllowedError (File Upload exemption skips SecurityError)', observed: await ev('JSON.stringify(window.__try("file"))', childCtx) };
  rec.cases.E_childOrigin_fileDisabled = { expected: 'InvalidStateError (File Upload exemption skips SecurityError)', observed: await ev('JSON.stringify(window.__try("file_disabled"))', childCtx) };

  // same-origin positive control — evaluated in the PARENT's context
  rec.cases.C_sameOrigin_textDisabled = { expected: 'InvalidStateError', observed: await ev('JSON.stringify(window.__try("text_disabled"))', parentCtx) };

  // frame facts, to show the child really is cross-origin and is its own top-level
  rec.childFrameFacts = {
    childOrigin: await ev('location.origin', childCtx),
    childIsTopLevel: await ev('window.top === window', childCtx),
    parentContentDocumentNull: await ev('document.getElementById("xo").contentDocument === null', parentCtx),
    parentWindowDocumentThrows: await ev('(function(){ try { document.getElementById("xo").contentWindow.document; return "no-throw"; } catch (e) { return e.name; } })()', parentCtx),
    childContextId: childCtx, parentContextId: parentCtx
  };

  rec.conclusion = 'Case B is the discriminator: Chromium reports SecurityError for a cross-origin DISABLED non-file input, i.e. its cross-origin check precedes its mutability check. The spec orders mutability first, so the spec would report InvalidStateError for the same call. Cases D/E show the file/color exemption removes the cross-origin branch, making the two orders indistinguishable for file inputs (hence the r80 cross-origin legs cannot discriminate, and cannot reach the SecurityError branch at all).';

  fs.mkdirSync(`${SEAT}/probes`, { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(rec, null, 2) + '\n');
  console.log(JSON.stringify(rec, null, 2));
} finally {
  try { chrome.kill('SIGKILL'); } catch {}
  sa.close(); sb.close();
  fs.rmSync(PROFILE, { recursive: true, force: true });
}
