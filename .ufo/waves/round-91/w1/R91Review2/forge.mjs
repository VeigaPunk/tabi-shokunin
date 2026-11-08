#!/usr/bin/env node
// R91Review2 origin-attribution forgeries against the C1 counter.
// Each mutant is derived from the scored receipt; the counter is run unchanged.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const SCRATCH = '/fast/scratch/hyaku/tabi-r91/R91Review2';
const RECEIPT = path.join(LANE, 'corpus/evidence/round91/chromium-showpicker-proxy/receipt.json');
const COUNTER = path.join(LANE, 'scripts/check-showpicker-proxy-round91.mjs');
const base = JSON.parse(fs.readFileSync(RECEIPT, 'utf8'));
const clone = () => JSON.parse(JSON.stringify(base));
const leg = (r, n) => r.legs.find((l) => l.name === n);
const P = base.ports.http, C = base.ports.child;
const PO = 'http://127.0.0.1:' + P, CO = 'http://127.0.0.1:' + C;

// the frozen allowlisted post expression for (frame,target,origin), as the counter builds it
const postExpr = (frame, target, origin) =>
  'JSON.stringify((function(){ var f = document.getElementById(' + JSON.stringify(frame) + '); f.contentWindow.postMessage({cmd:"showpicker",target:' + JSON.stringify(target) + '}, ' + JSON.stringify(origin) + '); return "sent"; })())';

// every leg's elements copy must equal receipt.elements
const setElements = (r, mut) => { mut(r.elements); for (const l of r.legs) l.elements = JSON.parse(JSON.stringify(r.elements)); };

const muts = [
  ['M00 baseline (scored receipt unchanged)', (r) => {}],

  ['M01 proxy result copied from sp91-so-proxy-childact into sp91-xo-proxy-file-childact; proxySendId rerouted to the childState read (no binding to the child proxy read)',
    (r) => {
      const src = leg(r, 'sp91-so-proxy-childact');
      const dst = leg(r, 'sp91-xo-proxy-file-childact');
      dst.proxy = JSON.parse(JSON.stringify(src.proxy));
      dst.proxyLog = JSON.parse(JSON.stringify(src.proxyLog));
      dst.replies = JSON.parse(JSON.stringify(src.replies));
      // keep the frozen per-leg reply origin for the xo leg
      dst.replies[0].origin = CO;
      dst.proxySendId = dst.cdpSendLog.filter((c) => c.params && c.params.expression === 'window.__state()').slice(-1)[0].id;
    }],

  ['M02 child proxy-log read never happened: the Runtime.evaluate that reads window.__log is replaced by an allowed non-read expression, the proxyLog value kept',
    (r) => {
      const l = leg(r, 'sp91-xo-proxy-file-childact');
      const e = l.cdpSendLog.find((c) => c.params && c.params.expression === 'JSON.stringify(window.__log)');
      e.params.expression = 'window.__state()';
    }],

  ['M03 parent reply only: child proxy null, parent reply kept (data.result left as the honest object)',
    (r) => { leg(r, 'sp91-xo-proxy-file-childact').proxy = null; }],

  ['M04 proxy log with the right origin but the wrong target on sp91-so-proxy-childact',
    (r) => { leg(r, 'sp91-so-proxy-childact').proxyLog[0].target = 'dt'; }],

  ['M05 reply from the wrong origin: so leg reply origin set to the child origin',
    (r) => { leg(r, 'sp91-so-proxy-childact').replies[0].origin = CO; }],

  ['M06 same-origin spoof: xo leg reply origin set to the parent origin',
    (r) => { leg(r, 'sp91-xo-proxy-file-childact').replies[0].origin = PO; }],

  ['M07 same-element record: xo accept changed to image/png, every leg copy changed, so record left alone',
    (r) => setElements(r, (el) => { el.xo.elements[0].accept = 'image/png'; })],

  ['M08 same-element record: BOTH so and xo accept changed to image/png, every leg copy changed',
    (r) => setElements(r, (el) => { el.so.elements[0].accept = 'image/png'; el.xo.elements[0].accept = 'image/png'; })],

  ['M09 chooser owned by the cross-origin frame on a same-origin leg (frameId only)',
    (r) => { const l = leg(r, 'sp91-so-proxy-childact'); l.choosers[0].params.frameId = l.xoFrameId; }],

  ['M10 same, with childFrameId patched to the xo frame to silence frame-tree',
    (r) => { const l = leg(r, 'sp91-so-proxy-childact'); l.choosers[0].params.frameId = l.xoFrameId; l.childFrameId = l.xoFrameId; }],

  ['M11 answer delivered to the parent input: childState empty, parentState carries the file',
    (r) => { const l = leg(r, 'sp91-xo-proxy-file-answer'); l.childState = []; l.parentState = [['tabi-r91-answer.txt', 22, 'text/plain']]; l.stateAfterDismiss = l.parentState; }],

  ['M12 answerSet/chooser keep node 10, but DOM.setFileInputFiles actually targets another node (backendNodeId 999)',
    (r) => {
      const l = leg(r, 'sp91-xo-proxy-file-answer');
      const e = l.cdpSendLog.find((c) => c.method === 'DOM.setFileInputFiles');
      e.params.backendNodeId = 999;
    }],

  ['M13 answerSet.files and the DOM.setFileInputFiles files rerouted to another directory (same basename)',
    (r) => {
      const l = leg(r, 'sp91-xo-proxy-file-answer');
      const other = '/home/vgpnk/Projects/shokunin/tabi-shokunin/elsewhere/upload/tabi-r91-answer.txt';
      l.answerSet.files = [other];
      const e = l.cdpSendLog.find((c) => c.method === 'DOM.setFileInputFiles');
      e.params.files = [other];
    }],

  ['M14 post expression text with targetOrigin "*" on sp91-xo-proxy-file-childact',
    (r) => {
      const l = leg(r, 'sp91-xo-proxy-file-childact');
      const e = l.cdpSendLog.find((c) => c.params && c.params.expression === postExpr('xo', 's', CO));
      e.params.expression = postExpr('xo', 's', '*');
    }],

  ['M15 a chooser fabricated on sp91-xo-proxy-file-parentact (which must open nothing), with one appended dismiss send',
    (r) => {
      const l = leg(r, 'sp91-xo-proxy-file-parentact');
      l.choosers = [{ params: { frameId: l.childFrameId, mode: 'selectSingle', backendNodeId: 10 }, afterSendId: l.postSendId + 1 }];
      const nextId = l.cdpSendLog.length + 1;
      l.cdpSendLog.push({ id: nextId, method: 'Page.setInterceptFileChooserDialog', params: { enabled: true, cancel: true } });
      l.dismissSendId = nextId;
    }],

  ['M16 two choosers on sp91-so-proxy-childact (the law says exactly one)',
    (r) => {
      const l = leg(r, 'sp91-so-proxy-childact');
      l.choosers.push(JSON.parse(JSON.stringify(l.choosers[0])));
    }],

  ['M17 chooser.afterSendId = postSendId + 2 (window edge)',
    (r) => { const l = leg(r, 'sp91-so-proxy-childact'); l.choosers[0].afterSendId = l.postSendId + 2; }],

  ['M18 chooser.afterSendId = postSendId + 3 (outside the window)',
    (r) => { const l = leg(r, 'sp91-so-proxy-childact'); l.choosers[0].afterSendId = l.postSendId + 3; }],

  ['M19 proxy log origin = child origin with a successful proxy on the xo leg (message the child must have rejected)',
    (r) => { leg(r, 'sp91-xo-proxy-file-childact').proxyLog[0].origin = CO; }],
];

const pins = [
  '--lane', LANE,
  '--expect-driver-sha256', base.driverSha256,
  '--expect-nonce', base.nonce,
  '--expect-parent-sha256', base.fixture.parent.sha256,
  '--expect-same-sha256', base.fixture.same.sha256,
  '--expect-child-sha256', base.fixture.child.sha256,
  '--prior-set', '.ufo/waves/round-91/controls/c1/prior-set.txt',
  '--json',
];
const rows = [];
for (const [name, fn] of muts) {
  const r = clone();
  fn(r);
  const file = path.join(SCRATCH, name.slice(0, 3) + '.json');
  fs.writeFileSync(file, JSON.stringify(r));
  const p = spawnSync(process.execPath, [COUNTER, '--receipt', file, ...pins], { encoding: 'utf8', cwd: LANE, timeout: 120000 });
  let j = null; try { j = JSON.parse(p.stdout); } catch {}
  rows.push({ id: name.slice(0, 3), name, exit: p.status, verdict: j && j.verdict, checkCount: j && j.checkCount, findings: j && j.findings ? j.findings.map((f) => f.id) : [String(p.stdout || p.stderr).slice(0, 300)] });
  process.stderr.write(rows[rows.length - 1].id + ' exit=' + p.status + ' ' + JSON.stringify(rows[rows.length - 1].findings) + '\n');
}
fs.writeFileSync(path.join(SCRATCH, 'results.json'), JSON.stringify(rows, null, 1));
console.log(JSON.stringify(rows.map((x) => ({ id: x.id, exit: x.exit, verdict: x.verdict, refused: x.exit !== 0, findings: x.findings })), null, 1));
