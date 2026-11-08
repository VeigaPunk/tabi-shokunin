#!/usr/bin/env node
// R91Exec4 refusal matrix driver: one-field-of-one-leg mutations of the frozen
// r91 proxy receipt, each scored by the frozen counter at the frozen pins.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const SCRATCH = '/fast/scratch/hyaku/tabi-r91/R91Exec4';
const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const COUNTER = path.join(LANE, 'scripts/check-showpicker-proxy-round91.mjs');
const BASE = path.join(SCRATCH, 'receipt.base.json');
const OUTDIR = path.join(SCRATCH, 'mutants');
fs.mkdirSync(OUTDIR, { recursive: true });

const PINS = [
  '--expect-driver-sha256', '343eb0f202d9b37a21d948adf0f5eff84fbebf8c195ab99c272fd66580e33015',
  '--expect-nonce', 'tabi-r91-l1-1d073adc0b8d',
  '--expect-parent-sha256', 'a6ecf367adcfd31e3e54e82794db09e2f9845b8d910eb465ab47ca022b778bf0',
  '--expect-same-sha256', '01380a98976c3fd8963a907a70f1f14d4d84a7b0eb94d088995919331775fe36',
  '--expect-child-sha256', '01380a98976c3fd8963a907a70f1f14d4d84a7b0eb94d088995919331775fe36',
  '--prior-set', '.ufo/waves/round-91/controls/c1/prior-set.txt',
];

const base = JSON.parse(fs.readFileSync(BASE, 'utf8'));
const legOf = (r, name) => {
  const l = r.legs.find((x) => x.name === name);
  if (!l) throw new Error('leg not found: ' + name);
  return l;
};
const setPath = (o, p, v) => {
  const parts = p.split('.');
  let cur = o;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = /^\d+$/.test(parts[i]) ? Number(parts[i]) : parts[i];
    if (cur[k] === undefined) throw new Error('missing path segment ' + parts.slice(0, i + 1).join('.'));
    cur = cur[k];
  }
  const last = parts[parts.length - 1];
  cur[/^\d+$/.test(last) ? Number(last) : last] = v;
};
const getPath = (o, p) => p.split('.').reduce((c, k) => (c == null ? c : c[/^\d+$/.test(k) ? Number(k) : k]), o);

const ORIGIN_PARENT = base.fixture.parent.origin;
const ORIGIN_CHILD = base.fixture.child.origin;
const postIndex = (l) => l.cdpSendLog.findIndex((c) => c.method === 'Runtime.evaluate' && typeof c.params.expression === 'string' && c.params.expression.includes('postMessage'));
const postExprOf = (l) => l.cdpSendLog[postIndex(l)].params.expression;

// Each entry: id, leg, path inside the leg (relative to the leg object), new value.
// Every entry changes exactly one field of exactly one leg.
const MUTATIONS = [
  { id: 'M01-proxy-ok', leg: 'sp91-xo-proxy-file-noact', path: 'proxy.ok', value: true, note: 'proxy result ok false->true (no-activation cross-origin leg)' },
  { id: 'M02-proxy-name', leg: 'sp91-so-proxy-noact', path: 'proxy.name', value: 'SecurityError', note: 'proxy result name NotAllowedError->SecurityError' },
  { id: 'M03-proxy-target', leg: 'sp91-xo-proxy-file-childact', path: 'proxy.target', value: 'dt', note: 'proxy target s->dt (file leg)' },
  { id: 'M04-proxy-origin', leg: 'sp91-so-proxy-childact', path: 'proxy.origin', value: ORIGIN_CHILD, note: 'proxy origin parent->child origin' },
  { id: 'M05-proxy-ret', leg: 'sp91-so-proxy-childact', path: 'proxy.ret', value: 'object', note: 'proxy return undefined->object' },
  { id: 'M06-proxyLog-origin', leg: 'sp91-so-proxy-childact', path: 'proxyLog.0.origin', value: ORIGIN_CHILD, note: 'proxyLog origin parent->child' },
  { id: 'M07-proxyLog-cmd', leg: 'sp91-xo-proxy-file-childact', path: 'proxyLog.0.cmd', value: 'showPicker', note: 'proxyLog cmd showpicker->showPicker' },
  { id: 'M08-proxyLog-target', leg: 'sp91-xo-proxy-file-answer', path: 'proxyLog.0.target', value: 'dt', note: 'proxyLog target s->dt' },
  { id: 'M09-reply-origin', leg: 'sp91-so-proxy-childact', path: 'replies.0.origin', value: ORIGIN_CHILD, note: 'reply origin parent->child (same-origin child must reply parent)' },
  { id: 'M10-reply-result', leg: 'sp91-xo-proxy-date-childact', path: 'replies.0.data.result.ok', value: true, note: 'reply result ok false->true while the proxy field still says SecurityError' },
  { id: 'M11-childFrameId', leg: 'sp91-so-proxy-childact', path: 'childFrameId', value: 'XX', note: 'childFrameId replaced by the leg xoFrameId after build' },
  { id: 'M12-chooser-frameId', leg: 'sp91-xo-proxy-file-answer', path: 'choosers.0.params.frameId', value: 'XX', note: 'chooser frameId replaced by the leg soFrameId after build' },
  { id: 'M13-chooser-mode', leg: 'sp91-so-direct-parentact', path: 'choosers.0.params.mode', value: 'selectMultiple', note: 'chooser mode selectSingle->selectMultiple on a single file input' },
  { id: 'M14-chooser-afterSendId', leg: 'sp91-xo-proxy-file-childact', path: 'choosers.0.afterSendId', value: 99, note: 'chooser afterSendId +10 outside the [act, act+2] attribution window' },
  { id: 'M15-activationAfter-isActive', leg: 'sp91-so-direct-parentact', path: 'activationAfter.isActive', value: true, note: 'parent activationAfter.isActive false->true (success must consume activation)' },
  { id: 'M16-activationAfter-hasBeenActive', leg: 'sp91-so-direct-noact', path: 'activationAfter.hasBeenActive', value: true, note: 'parent activationAfter.hasBeenActive false->true never activated' },
  { id: 'M17-childActivationAfter-isActive', leg: 'sp91-xo-proxy-date-childact', path: 'childActivationAfter.isActive', value: false, note: 'child activationAfter.isActive true->false after a throwing call' },
  { id: 'M18-answerSet-backendNodeId', leg: 'sp91-xo-proxy-file-answer', path: 'answerSet.backendNodeId', value: 11, note: 'answerSet backendNodeId 10->11, chooser backendNodeId stays 10' },
  { id: 'M19-answerSet-files-basename', leg: 'sp91-xo-proxy-file-answer', path: 'answerSet.files.0', value: '/fast/scratch/hyaku/tabi-r91/R91Exec4/upload/tabi-r91-answer-beta.txt', note: 'answerSet files basename answer->answer-beta' },
  { id: 'M20-answerSet-setResult', leg: 'sp91-xo-proxy-file-answer', path: 'answerSet.setResult', value: { n: 1 }, note: 'answerSet setResult {}->{n:1}' },
  { id: 'M21-childState', leg: 'sp91-so-proxy-childact', path: 'childState', value: [['forged.txt', 4, 'text/plain']], note: 'childState []->forged file on a non-answer leg' },
  { id: 'M22-parentState', leg: 'sp91-so-direct-noact', path: 'parentState', value: [['forged.txt', 4, 'text/plain']], note: 'parentState []->forged file' },
  { id: 'M23-leg-element-accept', leg: 'sp91-so-proxy-childact', path: 'elements.so.elements.0.accept', value: 'image/*', note: 'one leg copy of the same-origin element accept null->image/*' },
  { id: 'M24-leg-element-rect', leg: 'sp91-so-proxy-childact', path: 'elements.xo.elements.0.rect.width', value: 121, note: 'one leg copy of the cross-origin element rect width 120->121' },
  { id: 'M25-sendlog-expression', leg: 'sp91-so-proxy-childact', path: 'SENDLOG_EXPR', value: 'document.title', note: 'the postMessage Runtime.evaluate expression swapped for document.title' },
  { id: 'M26-mark-name', leg: 'sp91-so-direct-noact', path: 'marks.1.name', value: 'preflight', note: 'mark pre->preflight' },
  { id: 'M27-teardown-portProbe', leg: 'sp91-xo-proxy-file-answer', path: 'teardown.portProbes.fixture', value: 'open', note: 'teardown portProbes.fixture closed->open' },
  { id: 'M28-directResult-string', leg: 'sp91-so-direct-noact', path: 'directResult', value: '{"ok":true,"ret":"undefined"}', note: 'legacy directResult string mirror says ok while direct says NotAllowedError' },
  { id: 'M29-chooser-backendNodeId', leg: 'sp91-so-direct-parentact', path: 'choosers.0.params.backendNodeId', value: 999, note: 'chooser backendNodeId 10->999 on a leg with no setFileInputFiles answer' },
  { id: 'M30-argv-profile', leg: 'sp91-so-proxy-childact', path: 'argv.4', value: '--user-data-dir=/fast/scratch/hyaku/tabi-r91/R91Exec4/mutant-profile', note: 'one argv element: the profile path, one character class change only' },
  { id: 'M31-event-at', leg: 'sp91-xo-proxy-file-answer', path: 'childEvents.0.at', value: -1, note: 'one event timestamp at -> -1' },
  { id: 'M32-actionAt', leg: 'sp91-so-proxy-childact', path: 'actionAt', value: 1, note: 'actionAt epoch ms -> 1' },
  { id: 'M33-closedAt', leg: 'sp91-so-proxy-childact', path: 'closedAt', value: 1, note: 'closedAt -> 1, before the start mark' },
  { id: 'M34-stderrHead', leg: 'sp91-so-proxy-childact', path: 'stderrHead', value: 'x', note: 'stderrHead stripped of the DevTools line' },
  { id: 'M35-interceptSendId', leg: 'sp91-so-proxy-childact', path: 'interceptSendId', value: 7, note: 'interceptSendId 6->7 (no other send id changes)' },
  { id: 'M36-dismissSendId', leg: 'sp91-so-proxy-childact', path: 'dismissSendId', value: 999, note: 'dismissSendId -> 999 on a chooser leg' },
  { id: 'M37-soFrameId-on-xo-leg', leg: 'sp91-xo-proxy-file-answer', path: 'soFrameId', value: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', note: 'the soFrameId field inside an xo leg replaced with a fresh 32-hex id' },
  { id: 'M38-proxy-on-direct-leg', leg: 'sp91-so-direct-noact', path: 'proxy', value: { ok: true, ret: 'undefined', target: 's', origin: ORIGIN_PARENT }, note: 'proxy object forged on a direct-mode leg whose law says NotAllowedError' },
  { id: 'M39-replies-on-direct-leg', leg: 'sp91-so-direct-noact', path: 'replies', value: [{ origin: ORIGIN_PARENT, data: { cmd: 'result', result: { ok: true, ret: 'undefined', target: 's', origin: ORIGIN_PARENT } } }], note: 'proxy reply forged on a direct-mode leg' },
  { id: 'M40-proxyLog-on-direct-leg', leg: 'sp91-so-direct-noact', path: 'proxyLog', value: [{ origin: ORIGIN_PARENT, cmd: 'showpicker', target: 's', at: 1 }], note: 'proxy log entry forged on a direct-mode leg' },
  { id: 'M41-argv-profile-dir', leg: 'sp91-so-proxy-childact', path: 'argv.4', value: '--user-data-dir=/fast/scratch/hyaku/tabi-r91/R91Exec4/elsewhere/profile', note: 'the profile directory moved, basename still profile' },
  { id: 'M42-marks-order', leg: 'sp91-so-direct-noact', path: 'marks.1.at', value: 0, note: 'mark pre timestamp moved before the start mark' },
  { id: 'M43-proxyLog-at', leg: 'sp91-xo-proxy-file-childact', path: 'proxyLog.0.at', value: 1, note: 'proxyLog timestamp at -> 1' },
  { id: 'M44-reply-cmd', leg: 'sp91-xo-proxy-file-childact', path: 'replies.0.data.cmd', value: 'showpicker', note: 'reply data.cmd result->showpicker' },
  { id: 'M45-teardown-survivors', leg: 'sp91-xo-proxy-file-answer', path: 'teardown.survivors', value: [1234], note: 'teardown survivors []->[1234]' },
  { id: 'M46-teardown-postKillCurl', leg: 'sp91-xo-proxy-file-answer', path: 'teardown.postKillCurl.fixture', value: 0, note: 'postKillCurl fixture exit 7->0' },
  { id: 'M47-leg-element-id', leg: 'sp91-so-proxy-childact', path: 'elements.so.elements.0.id', value: 'q', note: 'one leg copy of the same-origin element id s->q' },
  { id: 'M48-childContextId', leg: 'sp91-so-proxy-childact', path: 'childContextId', value: '999', note: 'childContextId replaced by a non-existent context id' },
  { id: 'M49-plan-childPad', leg: 'sp91-so-direct-noact', path: 'childPad', value: true, note: 'plan field childPad false->true' },
  { id: 'M50-plan-mode', leg: 'sp91-so-direct-noact', path: 'mode', value: 'proxy', note: 'plan field mode direct->proxy' },
  { id: 'M51-event-isTrusted', leg: 'sp91-xo-proxy-file-answer', path: 'childEvents.0.isTrusted', value: false, note: 'one synthetic-looking pointer event isTrusted true->false' },
  { id: 'M52-launchToken', leg: 'sp91-so-proxy-childact', path: 'launchToken', value: legOf(base, 'sp91-so-direct-noact').launchToken, note: 'launch token replaced by another leg token already in the receipt' },
  { id: 'M55-launchToken-fresh', leg: 'sp91-so-proxy-childact', path: 'launchToken', value: 'aaaabbbbcccc', note: 'launch token replaced by a fresh unique 12-hex value (uniqueness is the law)' },
  { id: 'M53-leg-errors', leg: 'sp91-so-proxy-childact', path: 'errors', value: ['E'], note: 'leg errors []->["E"]' },
  { id: 'M54-leg-name', leg: 'sp91-so-direct-noact', path: 'name', value: 'sp91-so-direct-noact-renamed', note: 'leg name changed (plan identity)' },
];

const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');

const results = [];
for (const m of MUTATIONS) {
  const mut = JSON.parse(JSON.stringify(base));
  const leg = legOf(mut, m.leg);
  let appliedPath = 'legs[' + m.leg + '].' + m.path;
  if (m.path === 'SENDLOG_EXPR') {
    const i = postIndex(leg);
    if (i < 0) throw new Error('no post expression in ' + m.leg);
    leg.cdpSendLog[i].params.expression = m.value;
    appliedPath = 'legs[' + m.leg + '].cdpSendLog[' + i + '].params.expression';
  } else if (m.path === 'childFrameId') {
    leg.childFrameId = leg.xoFrameId;
  } else if (m.path === 'choosers.0.params.frameId') {
    leg.choosers[0].params.frameId = leg.soFrameId;
  } else {
    setPath(leg, m.path, m.value);
  }
  const file = path.join(OUTDIR, m.id + '.json');
  fs.writeFileSync(file, JSON.stringify(mut));
  const args = [COUNTER, '--lane', LANE, '--receipt', file, ...PINS, '--json'];
  const t0 = Date.now();
  const r = spawnSync(process.execPath, args, { encoding: 'utf8', timeout: 120000 });
  let j = null;
  try { j = JSON.parse(r.stdout); } catch {}
  const findings = j && Array.isArray(j.findings) ? j.findings : [];
  const before = m.path === 'SENDLOG_EXPR' ? postExprOf(legOf(base, m.leg)) : getPath(legOf(base, m.leg), m.path);
  const after = m.path === 'SENDLOG_EXPR' ? m.value : getPath(leg, m.path);
  results.push({
    id: m.id,
    note: m.note,
    appliedPath,
    before,
    after,
    value: m.value,
    exit: r.status,
    verdict: j ? j.verdict : null,
    findingIds: findings.map((f) => f.id),
    details: findings.map((f) => f.id + ': ' + String(f.detail).slice(0, 220)),
    ms: Date.now() - t0,
    mutantSha256: sha(fs.readFileSync(file)),
  });
  process.stderr.write(m.id + ' exit=' + r.status + ' ids=' + JSON.stringify(findings.map((f) => f.id)) + '\n');
}

const passes = results.filter((r) => r.exit === 0);
const refused = results.filter((r) => r.exit !== 0);
const byId = {};
for (const r of results) for (const id of r.findingIds) byId[id] = (byId[id] || 0) + 1;
const summary = {
  schema: 'tabi-r91-r91exec4-refusal-matrix',
  base: path.basename(BASE),
  baseSha256: sha(fs.readFileSync(BASE)),
  counter: COUNTER,
  counterSha256: sha(fs.readFileSync(COUNTER)),
  cmdTemplate: 'node ' + COUNTER + ' --lane ' + LANE + ' --receipt <mutant.json> ' + PINS.join(' ') + ' --json',
  mutations: results.length,
  refused: refused.length,
  passed: passes.length,
  passIds: passes.map((r) => r.id),
  refusedByCheck: byId,
  results,
};
fs.writeFileSync(path.join(SCRATCH, 'results.json'), JSON.stringify(summary, null, 1));
process.stdout.write(JSON.stringify({ mutations: summary.mutations, refused: summary.refused, passed: summary.passed, passIds: summary.passIds, refusedByCheck: byId }, null, 1) + '\n');
process.exitCode = 0;
