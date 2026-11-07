#!/usr/bin/env node
// Witness / parity / refusal probes for the 23 surviving semantic mutants (seat R76Mut1).
// For each probe: build a receipt from the frozen scored receipt, run the MUTANT counter copy and
// the FROZEN counter on the same receipt (same lane, pin, nonce, prior set), record both exits and
// finding ids. Categories:
//   witness   = mutant exit 0, frozen exit 1 (mutant accepts a receipt the frozen counter refuses)
//   parity    = both exit 1 (the dropped conjunct is not load-bearing for this receipt: equivalence claim)
//   refusal   = mutant exit 1, frozen exit 0 (mutant stricter; observability of the edit only)
//   both-accept = both exit 0 (probe inconclusive: it did not exercise the edit)
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const BASE = '/fast/scratch/hyaku/tabi-r76/R76Mut1';
const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const REAL = path.join(LANE, 'corpus/evidence/round76/chromium-js-dialog/receipt.json');
const PIN = '152ffc116b0b15968eb18ab8682b9de3ac49a2f9f3f81ff22e77153526fbdd51';
const NONCE = 'tabi-r76-l1-97bf5d560d03';
const PS = path.join(LANE, '.ufo/waves/round-76/controls/c1/prior-set.txt');
const muts = JSON.parse(fs.readFileSync(path.join(BASE, 'mutants.json'), 'utf8'));
const W = path.join(BASE, 'wtest');
fs.rmSync(W, { recursive: true, force: true });
fs.mkdirSync(W, { recursive: true });
const counterSrc = fs.readFileSync(path.join(BASE, 's/check-dialog-r76.mjs'), 'utf8');
const driverBytes = fs.readFileSync(path.join(BASE, 's/chrome-cdp-dialog-round76.mjs'));
const real = JSON.parse(fs.readFileSync(REAL, 'utf8'));
const clone = (v) => JSON.parse(JSON.stringify(v));

const mutDir = (name) => {
  const m = muts.find((x) => x.name === name);
  if (!m) throw new Error('no such mutant ' + name);
  const d = path.join(W, 'mut-' + name);
  if (!fs.existsSync(d)) {
    fs.mkdirSync(d, { recursive: true });
    if (counterSrc.split(m.from).length - 1 !== 1) throw new Error('edit string not unique: ' + name);
    fs.writeFileSync(path.join(d, 'check-dialog-r76.mjs'), counterSrc.replace(m.from, m.to));
    fs.writeFileSync(path.join(d, 'chrome-cdp-dialog-round76.mjs'), driverBytes);
  }
  return d;
};
const run = (dir, receipt, { priorSet = PS, priors = [] } = {}) => new Promise((resolve) => {
  const p = spawn(process.execPath, [path.join(dir, 'check-dialog-r76.mjs'), '--lane', LANE, '--receipt', receipt,
    '--expect-driver-sha256', PIN, '--expect-nonce', NONCE, '--prior-set', priorSet, ...priors.flatMap((x) => ['--prior', x]), '--json'],
    { stdio: ['ignore', 'pipe', 'pipe'] });
  let so = ''; p.stdout.on('data', (x) => { so += x; });
  p.on('close', (code) => { let j = null; try { j = JSON.parse(so); } catch {} resolve({ exit: code, verdict: j ? j.verdict : null, findingIds: j ? j.findings.map((f) => f.id) : null, checkCount: j ? j.checkCount : null }); });
});
const pairs = (r) => r.events.filter((e) => typeof e.ts === 'number' && typeof e.at === 'number');
const distinctHost = (p) => {
  p.host.launchToken = 'abcdef123456';
  p.host.devtoolsListening.url = 'ws://127.0.0.1:33099/devtools/browser/00000000-0000-0000-0000-000000000000';
  p.host.devtoolsListening.browserId = '00000000-0000-0000-0000-000000000000';
  return p;
};

const probes = [];
const P = (o) => probes.push(o);
const revKeys = (o) => Object.fromEntries(Object.keys(o).reverse().map((k) => [k, o[k]]));

// ---- acceptance witnesses ----
P({ id: 'W-X01-ts-zero', mutant: 'X01-typed-ts-nonneg', category: 'witness', build: (r) => { const e = r.events.filter((x) => x.leg === 'confirm-accept').pop(); e.ts = 0; return r; } });
P({ id: 'W-X10-aftersend-string', mutant: 'X10-evshape-aftersend-int-dropped', category: 'witness', build: (r) => { const n = r.cdpEventLog.find((e) => e.method === 'Page.frameNavigated'); n.afterSendId = String(n.afterSendId); return r; } });
P({ id: 'W-X35-marks-order', mutant: 'X35-marks-monotonic-dropped', category: 'witness', build: (r) => { r.legMarks[0].at = r.legMarks[1].at + 1; return r; } });
P({ id: 'W-X38-leg-kind-handle-only', mutant: 'X38-legrec-kind-dropped', category: 'witness', build: (r) => { r.legs.find((l) => l.name === 'alert-accept').kind = 'handle-only'; return r; } });
P({ id: 'W-X44-server-query', mutant: 'X44-server-query-conjunct-dropped', category: 'witness', build: (r) => { r.serverLog.find((s) => s.path === '/').query = 'run=other'; return r; } });
P({ id: 'W-X59-argv-18', mutant: 'X59-argv-length-ge', category: 'witness', build: (r) => { r.host.argv.push('--no-first-run'); return r; } });
P({ id: 'W-X60-viewport', mutant: 'X60-fixture-viewport-dropped', category: 'witness', build: (r) => { r.fixture.viewport.width = 1279; return r; } });

// ---- refusal witnesses (stricter direction: observability only) ----
P({ id: 'R-X54-legshape-key-order', mutant: 'X54-legshape-json-stringify', category: 'refusal', build: (r) => { r.legShape['alert-accept'] = revKeys(r.legShape['alert-accept']); return r; } });
P({
  id: 'R-X14-prior-ts-only', mutant: 'X14-pairmatch-at-dropped', category: 'refusal',
  build: (r) => r,
  priorBuild: (p) => {
    distinctHost(p);
    const ps = p.events.filter((e) => typeof e.ts === 'number' && typeof e.at === 'number');
    ps.forEach((e, i) => { e.at = Math.round((100000 + i * 250) * 10) / 10; });
    return p;
  },
});
P({
  id: 'R-X17-prior-symlink', mutant: 'X17-prior-walk-realpath-dropped', category: 'refusal',
  build: (r) => r,
  priorSetDrop: '.ufo/waves/round-76/controls/c1/probe/p1.receipt.json',
  priorSymlink: path.join(LANE, '.ufo/waves/round-76/controls/c1/probe/p1.receipt.json'),
});

// ---- parity probes for equivalence claims ----
P({ id: 'E-X03-ret-number', mutant: 'X03-typed-ret-string-dropped', category: 'parity', build: (r) => { r.events.find((e) => e.leg === 'alert-accept' && e.type === 'dialog-return').ret = 42; return r; } });
P({ id: 'E-X08-code-float', mutant: 'X08-errok-code-int-dropped', category: 'parity', build: (r) => { r.legs.find((l) => l.name === 'no-dialog').handleError.code = -32602.5; return r; } });
P({ id: 'E-X09-message-number', mutant: 'X09-errok-message-string-dropped', category: 'parity', build: (r) => { r.legs.find((l) => l.name === 'no-dialog').handleError.message = 42; return r; } });
P({ id: 'E-X11-unknown-method', mutant: 'X11-evshape-method-known-dropped', category: 'parity', build: (r) => { r.cdpEventLog.push({ method: 'Page.javascriptDialogClosedX', params: { frameId: 'x', result: true, userInput: '' }, afterSendId: 51 }); return r; } });
P({ id: 'E-X30-ret-target', mutant: 'X30-block-target-coupling-dropped', category: 'parity', build: (r) => { r.events.find((e) => e.leg === 'alert-accept' && e.type === 'dialog-return').target = 'c'; return r; } });
P({ id: 'E-X42-handle-method', mutant: 'X42-legrec-handle-method-dropped', category: 'parity', build: (r) => { const id = r.legs.find((l) => l.name === 'alert-accept').handleSendId; r.cdpSendLog.find((c) => c.id === id).method = 'Input.dispatchMouseEvent'; return r; } });
P({ id: 'E-X57-unload-event', mutant: 'X57-eventlegdomain-all-legs', category: 'parity', build: (r) => { r.events.push({ type: 'pointerdown', seq: 0, leg: 'unload-accept', ts: 2600, at: 2600, isTrusted: true, target: 'a', x: 150, y: 120, buttons: 1, defaultPrevented: false, kind: null, ret: null }); r.events.forEach((e, i) => { e.seq = i + 1; }); return r; } });
P({ id: 'E-X58-devtools-url-path', mutant: 'X58-devtools-url-prefix-loose', category: 'parity', build: (r) => { r.host.devtoolsListening.url = r.host.devtoolsListening.url.replace('/devtools/browser/', '/devtools/browsr/'); return r; } });

const out = [];
for (const p of probes) {
  const receipt = clone(real);
  p.build(receipt);
  const rf = path.join(W, p.id + '.json');
  fs.writeFileSync(rf, JSON.stringify(receipt));
  const opts = { priors: [] };
  if (p.priorBuild) {
    const pf = path.join(W, p.id + '.prior.json');
    fs.writeFileSync(pf, JSON.stringify(p.priorBuild(clone(real))));
    opts.priors.push(pf);
  }
  if (p.priorSetDrop) {
    const lines = fs.readFileSync(PS, 'utf8').split('\n').filter((l) => l.trim() && !l.trim().startsWith('#') && l.trim() !== p.priorSetDrop);
    const psf = path.join(W, p.id + '.priorset.txt');
    fs.writeFileSync(psf, lines.join('\n') + '\n');
    opts.priorSet = psf;
    const lf = path.join(W, p.id + '.prior-link.json');
    fs.rmSync(lf, { force: true });
    fs.symlinkSync(p.priorSymlink, lf);
    opts.priors.push(lf);
  }
  const m = await run(mutDir(p.mutant), rf, opts);
  const f = await run(path.join(BASE, 's'), rf, opts);
  const kind = m.exit === 0 && f.exit === 1 ? 'witness' : m.exit === 1 && f.exit === 1 ? 'parity' : m.exit === 1 && f.exit === 0 ? 'refusal' : m.exit === 0 && f.exit === 0 ? 'both-accept' : 'other';
  out.push({ id: p.id, mutant: p.mutant, claimed: p.category, observed: kind, mutant: { exit: m.exit, verdict: m.verdict, findingIds: m.findingIds }, frozen: { exit: f.exit, verdict: f.verdict, findingIds: f.findingIds } });
  console.log(p.id.padEnd(30), kind.padEnd(12), 'mutant', m.exit, JSON.stringify(m.findingIds), '| frozen', f.exit, JSON.stringify(f.findingIds));
}
fs.writeFileSync(path.join(BASE, 'witnesses.json'), JSON.stringify({ schema: 'tabi-r76-r76mut1-witnesses', real: REAL, probes: out }, null, 1));
const ok = out.every((x) => x.observed === x.claimed);
console.log('allAsClaimed', ok, 'witness', out.filter((x) => x.observed === 'witness').length, 'parity', out.filter((x) => x.observed === 'parity').length, 'refusal', out.filter((x) => x.observed === 'refusal').length);
process.exit(ok ? 0 : 1);
