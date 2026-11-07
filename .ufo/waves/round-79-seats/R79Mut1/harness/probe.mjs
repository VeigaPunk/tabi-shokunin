// Subsumption probes: for each survivor with no separating witness, apply a natural receipt
// mutation and record which check ids the PRISTINE counter and the MUTANT counter fire. If the
// mutant still refuses, the mutated conjunct is subsumed by the check(s) named in the evidence.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const HERE = path.dirname(new URL(import.meta.url).pathname);
const SRC = path.join(HERE, 'base', 'check-showpicker-r79.mjs');
const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const RECEIPT = path.join(HERE, 'receipt-sweep.json'); // pinned sweep-time bytes (the live receipt is being rewritten by another seat)
const PRIOR_SET = path.join(LANE, '.ufo/waves/round-79/controls/c1/prior-set.txt');
const PIN = 'e9c87159e5d5212237437eb7a80a2d26fcd8086603dae1e37db64ce1aaf94933';
const NONCE = 'tabi-r79-l1-80830674d421';
const FIXTURE = '2e80efa0c96d4c3ccc952d9b54353d8c079e6c9156abbc3d78dfd38d0bc5c5c8';
const WORK = path.join(HERE, 'runs');
const MIRROR = path.join(WORK, 'lane', 'tabi-shokunin');
fs.rmSync(MIRROR, { recursive: true, force: true });
for (const t of ['.ufo/waves/round-79', 'corpus/evidence/round79']) fs.mkdirSync(path.join(MIRROR, t), { recursive: true });
fs.cpSync(path.join(LANE, '.ufo/waves/round-79/controls/c1'), path.join(MIRROR, '.ufo/waves/round-79/controls/c1'), { recursive: true });
const clone = (v) => JSON.parse(JSON.stringify(v));
const arr = (v) => (Array.isArray(v) ? v : []);
const legOf = (r, n) => arr(r.legs).find((l) => l.name === n);

const PROBES = {
  'marks-min-count-widened': (r) => { const l = legOf(r, 'sp-click-then-show'); l.marks = [l.marks[0], l.marks[l.marks.length - 1]]; },
  'plan-click-release-dropped': (r) => { legOf(r, 'sp-click-control').priorReleaseId = 5; },
  'plan-unknown-leg-skipped': (r) => { legOf(r, 'sp-click-control').name = 'sp-click-control-x'; },
  'cdp-mode-enum-dropped': (r) => { arr(legOf(r, 'sp-click-then-show').cdpEventLog).find((e) => e.method === 'Page.fileChooserOpened').params.mode = 'selectDirectory'; },
  'typed-seq-loosened': (r) => { arr(legOf(r, 'sp-click-then-show').pageEvents)[0].seq = 1.5; },
  'typed-act-dropped': (r) => { arr(legOf(r, 'sp-click-then-show').pageEvents)[0].act = null; },
  'typed-files-dropped': (r) => { arr(legOf(r, 'sp-click-then-show').pageEvents)[0].files = 'x'; },
  'typed-istrusted-dropped': (r) => { arr(legOf(r, 'sp-click-then-show').pageEvents)[0].isTrusted = 'yes'; },
  'gesture-unknown-leg-skipped': (r) => { legOf(r, 'sp-click-control').name = 'sp-click-control-x'; },
  'consumption-first-ok-dropped': (r) => { legOf(r, 'sp-show-twice').showPicker = { ok: false, name: 'NotAllowedError', message: "Failed to execute 'showPicker' on 'HTMLInputElement': HTMLInputElement::showPicker() requires a user gesture." }; },
  'immutable-open-count-dropped': (r) => { const l = legOf(r, 'sp-disabled'); l.cdpEventLog.push({ method: 'Page.fileChooserOpened', params: { frameId: l.frameTree.mainFrameId, mode: 'selectSingle', backendNodeId: 3 }, afterSendId: l.triggerSendId }); },
  'mode-law-missing-descriptor-ok': (r) => { r.fixtureInputs = r.fixtureInputs.filter((d) => d.id !== 's'); },
  'no-selection-svalue-dropped': (r) => { legOf(r, 'sp-click-then-show').stateAfter.sValue = 'x'; },
  'intercept-open-count-loosened': (r) => { const l = legOf(r, 'sp-click-then-show'); const o = arr(l.cdpEventLog).find((e) => e.method === 'Page.fileChooserOpened'); l.cdpEventLog.push(clone(o)); },
  'dismiss-cancel-events-dropped': (r) => { const l = legOf(r, 'sp-click-then-show'); l.pageEvents.push({ type: 'cancel', ts: 20, isTrusted: true, act: false, target: 's', x: null, y: null, buttons: null, files: [], ret: null, seq: l.pageEvents.length + 1, leg: 'settle', at: 20 }); },
  'trust-nonempty-dropped': (r) => { for (const l of arr(r.legs)) l.pageEvents = []; },
  'argv-token-regex-loosened': (r) => { const l = legOf(r, 'sp-click-then-show'); const tok = 'ZZZZZZZZZZZZ'; l.launchToken = tok; const i = l.argv.findIndex((a) => a.startsWith('--user-data-dir=')); l.argv[i] = '--user-data-dir=' + path.join(path.dirname(l.argv[i].slice('--user-data-dir='.length)), 'profile-' + tok); },
  'replay-frac-loosened': null,
  'replay-gapfrac-loosened': null,
  'plan-trigger2-order-dropped': null,
};

const parse = (s) => { try { return JSON.parse(s); } catch { return null; } };
const args = (counter, receipt) => [counter, '--lane', MIRROR, '--receipt', receipt, '--expect-driver-sha256', PIN, '--expect-nonce', NONCE,
  '--expect-fixture-sha256', FIXTURE, '--prior-set', PRIOR_SET, '--json'];

const out = {};
const wdir = path.join(WORK, 'probe');
fs.mkdirSync(wdir, { recursive: true });
for (const [id, fn] of Object.entries(PROBES)) {
  if (!fn) { out[id] = { probe: null, note: 'no receipt probe: see analysis' }; continue; }
  const r = JSON.parse(fs.readFileSync(RECEIPT, 'utf8'));
  fn(r);
  const p = path.join(wdir, id + '.json');
  fs.writeFileSync(p, JSON.stringify(r, null, 1));
  const pr = spawnSync(process.execPath, args(SRC, p), { encoding: 'utf8', timeout: 120000 });
  const mu = spawnSync(process.execPath, args(path.join(WORK, 'mut-' + id, 'check-showpicker-r79.mjs'), p), { encoding: 'utf8', timeout: 120000 });
  const pj = parse(pr.stdout), mj = parse(mu.stdout);
  out[id] = {
    probe: path.relative(HERE, p),
    pristine: { exit: pr.status, findings: pj ? (pj.findings || []).map((f) => f.id) : (pr.stderr || '').slice(0, 200) },
    mutant: { exit: mu.status, findings: mj ? (mj.findings || []).map((f) => f.id) : (mu.stderr || '').slice(0, 200) },
    subsumedBy: mj && mu.status === 1 ? (mj.findings || []).map((f) => f.id) : null,
  };
  process.stderr.write('[' + id + '] pristine ' + pr.status + ' ' + JSON.stringify(out[id].pristine.findings) + ' mutant ' + mu.status + ' ' + JSON.stringify(out[id].mutant.findings) + '\n');
}
fs.writeFileSync(path.join(HERE, 'probes.json'), JSON.stringify(out, null, 1));
