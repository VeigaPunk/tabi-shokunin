#!/usr/bin/env node
// R90Exec4 refusal matrix for the settle-call binding (C1, r90).
// Reads the scored receipt clone and writes one mutated receipt per named mutation.
// Never touches the lane. Usage:
//   node mutate.mjs <base-receipt.json> <out-dir>
import fs from 'node:fs';
import path from 'node:path';

const [basePath, outDir] = process.argv.slice(2);
if (!basePath || !outDir) { console.error('usage: node mutate.mjs <base-receipt.json> <out-dir>'); process.exit(2); }
const base = JSON.parse(fs.readFileSync(basePath, 'utf8'));
const clone = () => JSON.parse(JSON.stringify(base));
const leg = (r, n) => r.legs.find((l) => l.name === n);
const ID_FIELDS = ['interceptSendId', 'armSendId', 'dismissSendId', 'triggerSendId', 'trigger2SendId', 'priorPressId', 'priorReleaseId', 'clickPressId', 'clickReleaseId'];

const settleIx = (l) => l.cdpSendLog.findIndex((c) => c.method === 'Runtime.evaluate' && c.params && c.params.expression === 'window.__inputs(true)');
const stateIxs = (l) => l.cdpSendLog.map((c, i) => (c.method === 'Runtime.evaluate' && c.params && c.params.expression === 'window.__state()' ? i : -1)).filter((i) => i >= 0);
const evalEntry = (expr) => ({ id: -1, method: 'Runtime.evaluate', params: { expression: expr, returnByValue: true } });

function renumber(l) {
  const map = new Map();
  l.cdpSendLog.forEach((c, i) => { map.set(c.id, i + 1); c.id = i + 1; });
  return map;
}
function remap(l, map) {
  for (const f of ID_FIELDS) if (typeof l[f] === 'number' && map.has(l[f])) l[f] = map.get(l[f]);
  if (l.answer && typeof l.answer.setSendId === 'number' && map.has(l.answer.setSendId)) l.answer.setSendId = map.get(l.answer.setSendId);
}
function insertAt(l, ix, entry) {
  l.cdpSendLog.splice(ix, 0, entry);
  remap(l, renumber(l));
}
function removeAt(l, ix) {
  l.cdpSendLog.splice(ix, 1);
  remap(l, renumber(l));
}
// Re-derive the id-bearing fields from the log's own semantics (used after a whole-log swap).
function rebind(l) {
  const log = l.cdpSendLog;
  const icpts = log.filter((c) => c.method === 'Page.setInterceptFileChooserDialog');
  l.interceptSendId = icpts[0] ? icpts[0].id : null;
  l.dismissSendId = icpts[1] ? icpts[1].id : null;
  const trig = log.find((c) => c.method === 'Runtime.evaluate' && c.params && typeof c.params.expression === 'string' && c.params.expression.includes('.showPicker()'));
  l.triggerSendId = trig ? trig.id : null;
  l.trigger2SendId = null;
  const mouse = log.filter((c) => c.method === 'Input.dispatchMouseEvent');
  const presses = mouse.filter((c) => c.params && c.params.type === 'mousePressed');
  const releases = mouse.filter((c) => c.params && c.params.type === 'mouseReleased');
  const hadPrior = l.priorPressId !== null && l.priorPressId !== undefined;
  const hadClick = l.clickPressId !== null && l.clickPressId !== undefined;
  l.priorPressId = hadPrior && presses[0] ? presses[0].id : null;
  l.priorReleaseId = hadPrior && releases[0] ? releases[0].id : null;
  if (hadClick) {
    l.clickPressId = presses[1] ? presses[1].id : null;
    l.clickReleaseId = releases[1] ? releases[1].id : null;
  }
  const set = log.find((c) => c.method === 'DOM.setFileInputFiles');
  if (l.answer && set) {
    l.answer.setSendId = set.id;
    l.answer.setParams.files = Array.isArray(set.params.files) ? set.params.files.slice() : [];
  }
}
function swapLogs(r, a, b) {
  const la = leg(r, a), lb = leg(r, b);
  const tmp = la.cdpSendLog;
  la.cdpSendLog = lb.cdpSendLog;
  lb.cdpSendLog = tmp;
  rebind(la); rebind(lb);
}

const D = 'sp89-accept-domread-text';       // domread, target aw, answer a.txt
const D2 = 'sp89-accept-domread-png';       // domread, target am, answer b.png
const W = 'sp86-accept-wildcard-text';      // answer, target aw, answer a.txt
const A = 'sp84-accept-answer';             // answer, target k, answer a.txt
const A2 = 'sp84-accept-mime-answer';       // answer, target k, answer b.png

const mutations = {
  'm00-identity': () => {},
  'm01-remove-settle': (r) => { const l = leg(r, D); removeAt(l, settleIx(l)); },
  'm02-rename-plain-inputs': (r) => { const l = leg(r, D); l.cdpSendLog[settleIx(l)].params.expression = 'window.__inputs()'; },
  'm03-duplicate-settle': (r) => { const l = leg(r, D); const ix = settleIx(l); insertAt(l, ix + 1, JSON.parse(JSON.stringify(l.cdpSendLog[ix]))); },
  'm04-move-settle-after-dismiss': (r) => {
    const l = leg(r, D); const ix = settleIx(l); const [e] = l.cdpSendLog.splice(ix, 1);
    const icpts = l.cdpSendLog.filter((c) => c.method === 'Page.setInterceptFileChooserDialog');
    const di = l.cdpSendLog.indexOf(icpts[1]);
    l.cdpSendLog.splice(di + 1, 0, e); remap(l, renumber(l));
  },
  'm05-add-settle-to-non-domread': (r) => { const l = leg(r, A); insertAt(l, stateIxs(l)[0] + 1, evalEntry('window.__inputs(true)')); },
  'm06-settle-returnbyvalue-false': (r) => { const l = leg(r, D); l.cdpSendLog[settleIx(l)].params.returnByValue = false; },
  'm07-extra-eval-between-state-settle': (r) => { const l = leg(r, D); insertAt(l, stateIxs(l)[0] + 1, evalEntry('window.__late')); },
  'm08-swap-domread-logs': (r) => swapLogs(r, D, D2),
  'm09-swap-domread-with-same-target-answer': (r) => swapLogs(r, D, W),
  'm10-swap-same-target-answer-logs': (r) => swapLogs(r, A, A2),
  'm11-extra-late-after-settle': (r) => { const l = leg(r, D); insertAt(l, settleIx(l) + 1, evalEntry('window.__late')); },
  'm12-extra-plain-inputs-after-settle': (r) => { const l = leg(r, D); insertAt(l, settleIx(l) + 1, evalEntry('window.__inputs()')); },
  'm13-plain-preread-returnbyvalue-false': (r) => { const l = leg(r, D); const c = l.cdpSendLog.find((x) => x.params && x.params.expression === 'window.__inputs()'); c.params.returnByValue = false; },
  'm14-rebind-settle-to-post-dismiss-state': (r) => {
    const l = leg(r, D); const s = settleIx(l); const st = stateIxs(l)[0];
    const [se] = l.cdpSendLog.splice(s, 1); const [ste] = l.cdpSendLog.splice(st, 1);
    const st2 = stateIxs(l)[0]; // the surviving post-dismiss state
    l.cdpSendLog.splice(st2 + 1, 0, ste, se); remap(l, renumber(l));
  },
  'm15-move-state-settle-pair-after-dismiss': (r) => {
    const l = leg(r, D); const s = settleIx(l); const st = stateIxs(l)[0];
    const [se] = l.cdpSendLog.splice(s, 1); const [ste] = l.cdpSendLog.splice(st, 1);
    const icpts = l.cdpSendLog.filter((c) => c.method === 'Page.setInterceptFileChooserDialog');
    const di = l.cdpSendLog.indexOf(icpts[1]);
    l.cdpSendLog.splice(di + 1, 0, ste, se); remap(l, renumber(l));
  },
  'm16-nonallowlisted-eval-after-settle': (r) => { const l = leg(r, D); insertAt(l, settleIx(l) + 1, evalEntry('window.__inputs(true)||0')); },
  'm17-non-domread-preread-becomes-settle': (r) => { const l = leg(r, A); l.cdpSendLog.find((x) => x.params && x.params.expression === 'window.__inputs()').params.expression = 'window.__inputs(true)'; },
  'm18-post-dismiss-state-returnbyvalue-false': (r) => { const l = leg(r, D); const st = stateIxs(l); l.cdpSendLog[st[1]].params.returnByValue = false; },
  'm19-extra-state-after-settle': (r) => { const l = leg(r, D); insertAt(l, settleIx(l) + 1, evalEntry('window.__state()')); },
  'm20-swap-answer-logs-pure': (r) => { const la = leg(r, A), lb = leg(r, A2); const tmp = la.cdpSendLog; la.cdpSendLog = lb.cdpSendLog; lb.cdpSendLog = tmp; for (const l of [la, lb]) { const map = renumber(l); for (const f of ID_FIELDS) if (typeof l[f] === 'number' && map.has(l[f])) l[f] = map.get(l[f]); const set = l.cdpSendLog.find((c) => c.method === 'DOM.setFileInputFiles'); if (l.answer && set) l.answer.setSendId = set.id; } },
  'm21-remove-post-dismiss-state': (r) => { const l = leg(r, D); const st = stateIxs(l); removeAt(l, st[1]); },
  'm22-remove-plain-preread': (r) => { const l = leg(r, D); const ix = l.cdpSendLog.findIndex((c) => c.method === 'Runtime.evaluate' && c.params && c.params.expression === 'window.__inputs()'); removeAt(l, ix); },
  'm23-settle-params-key-order': (r) => { const l = leg(r, D); const c = l.cdpSendLog[settleIx(l)]; c.params = { returnByValue: c.params.returnByValue, expression: c.params.expression }; },
  'm24-add-settle-to-cross-leg': (r) => { const l = leg(r, 'sp84-cross-origin-nonfile'); const ix = l.cdpSendLog.findIndex((c) => c.method === 'Runtime.evaluate' && c.params && String(c.params.expression).startsWith('JSON.stringify((function(){ var f = document.getElementById')); insertAt(l, ix + 1, evalEntry('window.__inputs(true)')); },
  'm25-swap-same-target-coherent': (r) => {
    const la = leg(r, D), lb = leg(r, W);
    const tmp = la.cdpSendLog; la.cdpSendLog = lb.cdpSendLog; lb.cdpSendLog = tmp;
    for (const l of [la, lb]) { rebind(l); for (const ev of l.cdpEventLog) if (ev.method === 'Page.fileChooserOpened') ev.afterSendId = l.triggerSendId; }
  },
  'm27-plain-inputs-before-state-anchor': (r) => { const l = leg(r, D); insertAt(l, stateIxs(l)[0], evalEntry('window.__inputs()')); },
  'm28-settle-contextid': (r) => { const l = leg(r, D); const ctx = (l.contexts || []).find((c) => c && c.isDefault === true && c.frameId === l.frameTree.mainFrameId); l.cdpSendLog[settleIx(l)].params.contextId = ctx ? ctx.id : 1; },
  'm29-settle-extra-param-usergesture': (r) => { const l = leg(r, D); l.cdpSendLog[settleIx(l)].params.userGesture = true; },
  'm30-extra-state-between-state-settle': (r) => { const l = leg(r, D); insertAt(l, settleIx(l), evalEntry('window.__state()')); },
  'm31-extra-state-before-anchor': (r) => { const l = leg(r, D); insertAt(l, stateIxs(l)[0], evalEntry('window.__state()')); },
  'm32-settle-bare-params': (r) => { const l = leg(r, D); const c = l.cdpSendLog[settleIx(l)]; c.params = { expression: c.params.expression }; },
  'm26-remove-plain-preread-coherent': (r) => {
    const l = leg(r, D); const ix = l.cdpSendLog.findIndex((c) => c.method === 'Runtime.evaluate' && c.params && c.params.expression === 'window.__inputs()');
    removeAt(l, ix);
    for (const ev of l.cdpEventLog) if (typeof ev.afterSendId === 'number' && ev.afterSendId > ix + 1) ev.afterSendId -= 1;
  },
};


fs.mkdirSync(outDir, { recursive: true });
const index = {};
for (const [id, fn] of Object.entries(mutations)) {
  const r = clone();
  fn(r);
  const p = path.join(outDir, id + '.json');
  fs.writeFileSync(p, JSON.stringify(r, null, 1));
  const l = leg(r, D);
  index[id] = {
    path: p,
    domreadSettleCounts: r.legs.filter((x) => x.kind === 'showpicker-domread').map((x) => [x.name, settleIx(x) >= 0 ? x.cdpSendLog.filter((c) => c.params && c.params.expression === 'window.__inputs(true)').length : 0]),
    note: id,
  };
}
fs.writeFileSync(path.join(outDir, 'index.json'), JSON.stringify(index, null, 1));
console.log('wrote', Object.keys(mutations).length, 'mutants to', outDir);
