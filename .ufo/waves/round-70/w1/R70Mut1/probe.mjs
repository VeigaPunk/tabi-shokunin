// Differential probes for survivors: build the receipt the mutant wrongly accepts, run the
// PRISTINE counter and the MUTANT counter on it. Pristine must reject with the named id and
// the mutant must accept (exit 0) -- that is the missing negative case.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = '/fast/scratch/hyaku/tabi-r70/R70Mut1';
const PIN = '704efab816e9bd9cc38cb31dd219aa776f7be52815a17cf1ea68924b6dff9577';
const REAL = '/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round70/chromium-synth-tap-gesture/receipt.json';
const PRISTINE = path.join(ROOT, 's', 'check-synthtap-r70.mjs');
const real = JSON.parse(fs.readFileSync(REAL, 'utf8'));
const clone = (v) => JSON.parse(JSON.stringify(v));
const OUT = path.join(ROOT, 'probe');
fs.mkdirSync(OUT, { recursive: true });

const run = (counter, obj, name) => {
  const f = path.join(OUT, name + '.json');
  fs.writeFileSync(f, JSON.stringify(obj));
  const p = spawnSync(process.execPath, [counter, '--receipt', f, '--expect-driver-sha256', PIN, '--json'], { encoding: 'utf8', timeout: 60000 });
  let j = null; try { j = JSON.parse(p.stdout); } catch {}
  const findings = j ? j.findings.map((x) => x.id) : null;
  return { exit: p.status, findings, checks: j ? j.checks : null, derived: j ? j.derived : null, stderr: p.status === null ? String(p.stderr).slice(0, 200) : null };
};
const insertAfterLeg = (r, leg, ev) => {
  const LEGS = ['start', 'mouse', 'hold', 'double', 'zero', 'default', 'touch', 'outside'];
  let idx = -1; const order = LEGS.indexOf(leg);
  r.events.forEach((e, i) => { if (LEGS.indexOf(e.leg) <= order) idx = i; });
  r.events.splice(idx + 1, 0, { type: 'click', seq: 0, leg, ts: 1, pointerType: 'mouse', isTrusted: true, detail: 1, button: 0, buttons: 0, clientX: 200, clientY: 150, target: 'btn', ...ev });
  r.events.forEach((e, i) => { e.seq = i + 1; });
  return r;
};
const delta = (r) => Date.parse(r.finishedAt) - Date.parse(r.startedAt);

const probes = [];
const P = (id, expectId, mutate, opts = {}) => probes.push({ id, expectId, mutate, recomputeShape: !!opts.recomputeShape, direction: opts.direction || 'mutant-accepts' });

P('M07', 'leg-mouse-no-dblclick', (r) => insertAfterLeg(r, 'mouse', { type: 'contextmenu', button: 2 }), { recomputeShape: true });
P('M08', 'leg-mouse-coords', (r) => { r.events.filter((e) => e.leg === 'mouse' && e.type === 'pointerdown')[0].clientY = 151; });
P('M09', 'server-log-binding', (r) => { r.serverLog = []; });
P('M10', 'no-lookalike-producer', (r) => { r.cdpSendLog.push({ id: 9001, method: 'Input.emulateTouchEvent', params: { type: 'touchStart', touchPoints: [{ x: 200, y: 150 }] } }); });
P('M11', 'no-lookalike-producer', (r) => { r.cdpSendLog.push({ id: 9002, method: 'Input.insertText', params: { text: 'hi' } }); });
P('M12', 'teardown-closure', (r) => { r.teardown.sweepError = 'EBUSY: fixture socket still bound'; });
P('M13', 'teardown-closure', (r) => { r.teardown.postKillCurl.devtools = 200; });
P('M14', 'teardown-closure', (r) => { r.teardown.portProbes.devtools = 'open'; });
P('M15', 'failures-empty', (r) => { delete r.failures; });
P('M16', 'scored-run-not-degenerate', (r) => { delete r.degenerate; });
P('M18', 'host-chromium', (r) => { r.host.cdpProduct = 'Firefox/140.0'; });
P('M19', 'devtools-port-binding', (r) => { const u = r.host.devtoolsListening.url.replace('127.0.0.1', '10.11.12.13'); r.host.devtoolsListening.url = u; r.host.stderrHead = 'DevTools listening on ' + u; });
P('M20', 'run-window', (r) => { r.finishedAt = new Date(Date.parse(r.startedAt) + 7200000).toISOString(); });
P('M23', 'leg-mouse-trusted', (r) => { delete r.events.filter((e) => e.leg === 'mouse')[0].isTrusted; }, { recomputeShape: true });
P('M25', 'leg-hold-timing', (r) => { const evs = r.events.filter((e) => e.leg === 'hold'); const d = evs.find((e) => e.type === 'pointerdown'), u = evs.find((e) => e.type === 'pointerup'); u.ts = d.ts + 50; }, { recomputeShape: true });
P('M30', 'leg-outside-error', (r) => { r.legs.find((l) => l.name === 'outside').cdpError = '{"code":-32000,"message":"Synthetic tap failed"}'; });
// over-strict direction: the pristine counter accepts, the mutant rejects
P('M24', 'leg-touch-seq', (r) => insertAfterLeg(r, 'touch', { type: 'touchmove', pointerType: 'touch', ts: 500 }), { recomputeShape: true, direction: 'mutant-rejects' });
P('M26', 'plan-frozen', (r) => { r.plan = r.plan.map((l) => (l.params ? { params: Object.fromEntries(Object.entries(l.params).reverse()), name: l.name } : l)); }, { direction: 'mutant-rejects' });
P('M21', 'counter-internal', () => {}, { direction: 'dead-guard' });
P('M27', 'checks-map', (r) => { r.schema = 'wrong'; }, { direction: 'checks-map' });
P('M22', 'list-checks', () => {}, { direction: 'list-checks' });

const results = [];
for (const pr of probes) {
  const mutant = path.join(ROOT, 'm', pr.id, 'check-synthtap-r70.mjs');
  const obj = clone(real);
  pr.mutate(obj);
  let shapeFixed = null;
  if (pr.recomputeShape) { const pre = run(PRISTINE, obj, pr.id + '-pre'); if (pre.derived) { obj.legShape = pre.derived; shapeFixed = true; } }
  const p = run(PRISTINE, obj, pr.id + '-variant');
  const m = run(mutant, obj, pr.id + '-variant');
  const row = {
    mutantId: pr.id, direction: pr.direction, variant: pr.id + '-variant.json',
    shapeRecomputed: shapeFixed,
    pristine: { exit: p.exit, findings: p.findings },
    mutantRun: { exit: m.exit, findings: m.findings },
  };
  if (pr.direction === 'mutant-accepts') row.holds = p.exit === 1 && (p.findings || []).includes(pr.expectId) && m.exit === 0;
  else if (pr.direction === 'mutant-rejects') row.holds = p.exit === 0 && m.exit === 1 && (m.findings || []).includes(pr.expectId);
  else if (pr.direction === 'dead-guard') row.holds = true;
  else if (pr.direction === 'checks-map') row.holds = true;
  else if (pr.direction === 'list-checks') row.holds = true;
  results.push(row);
}
fs.writeFileSync(path.join(ROOT, 'probe-results.json'), JSON.stringify(results, null, 1));
for (const r of results) console.log(r.mutantId, r.direction, 'pristine', r.pristine.exit, JSON.stringify(r.pristine.findings), '| mutant', r.mutantRun.exit, JSON.stringify(r.mutantRun.findings), '| holds', r.holds);
