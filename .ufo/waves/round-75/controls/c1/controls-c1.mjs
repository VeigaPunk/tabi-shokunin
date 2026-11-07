#!/usr/bin/env node
// Round 75 C1 pre-freeze do-nothing / forgery / limit controls for scripts/check-dragdrop-r75.mjs.
// Each control states its expected exit and finding ids BEFORE it runs (tabi r63 prerequisite;
// QUALITY 131: exit AND ids, evaluated mechanically). PRE is read from prior-set.txt (the schema
// enumeration at the freeze parent, QUALITY 140), never from a hand-written list.
// Usage: node controls-c1.mjs --work <ABS scratch>   (writes controls-summary.json beside this file)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const LANE = path.resolve(HERE, '../../../../..');
const CTR = path.join(LANE, 'scripts/check-dragdrop-r75.mjs');
const DRV = path.join(LANE, 'scripts/chrome-cdp-dragdrop-round75.mjs');
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const driverText = fs.readFileSync(DRV, 'utf8');
const PIN = sha(fs.readFileSync(DRV));
const wi = process.argv.indexOf('--work');
const work = wi >= 0 ? process.argv[wi + 1] : null;
if (!work || !path.isAbsolute(work)) { console.error('usage: --work <ABS scratch>'); process.exit(2); }
fs.mkdirSync(work, { recursive: true });
const PRE = fs.readFileSync(path.join(HERE, 'prior-set.txt'), 'utf8').split('\n').filter((l) => l.trim() && !l.startsWith('#')).map((l) => path.join(LANE, l.trim()));
if (PRE.length === 0) { console.error('empty prior-set.txt'); process.exit(2); }
const P = PRE.flatMap((p) => ['--prior', p]);
const POST = 'tabi-r75-l1-control0000';   // stands in for the post-freeze nonce the predicate derives
const smoke1Path = PRE.find((p) => p.endsWith('/smoke1.receipt.json'));
const probe1Path = PRE.find((p) => p.endsWith('/probe/p1.receipt.json'));
const smoke1 = JSON.parse(fs.readFileSync(smoke1Path, 'utf8'));
const tpl = /\/\*DRAGDROP-FIXTURE-BEGIN\*\/\nconst FIXTURE_TEMPLATE = `([\s\S]*?)`;\n\/\*DRAGDROP-FIXTURE-END\*\//.exec(driverText)[1];
const fixtureSha = (nonce) => sha(tpl.replaceAll('__NONCE__', nonce));
const write = (name, obj) => { const f = path.join(work, name + '.json'); fs.writeFileSync(f, JSON.stringify(obj)); return f; };
const clone = (v) => JSON.parse(JSON.stringify(v));
const rewriteNonce = (r, to, fixToo) => {
  const old = r.nonce; r.nonce = to; r.nonceOnPage = to; r.serverLog.forEach((s) => { s.run = to; });
  for (const c of r.cdpSendLog) { if (c.method === 'Page.navigate') c.params.url = c.params.url.replace(encodeURIComponent(old), encodeURIComponent(to)); if (c.method === 'Runtime.evaluate') c.params.expression = c.params.expression.replace(JSON.stringify(old), JSON.stringify(to)); }
  if (fixToo) r.fixture.sha256 = fixtureSha(to);
};
const shiftStamps = (r) => { for (const k of ['startedAt', 'finishedAt']) r[k] = new Date(Date.parse(r[k]) + 3600000).toISOString(); };
const newIds = (r) => {
  r.host.launchToken = crypto.randomBytes(6).toString('hex');
  const oldId = r.host.devtoolsListening.url.split('/devtools/browser/')[1]; const newId = crypto.randomUUID();
  r.host.devtoolsListening.url = r.host.devtoolsListening.url.replace(oldId, newId);
  if (typeof r.host.devtoolsListening.browserId === 'string') r.host.devtoolsListening.browserId = newId;
  r.host.stderrHead = r.host.stderrHead.split(oldId).join(newId);
};
const q = (v) => Math.round(v * 10) / 10;
// a full relabel: nonce (with fixture hash), stamps, launch token, browser id, driver pin field, producer verdict
const relabel = (src) => { const r = clone(src); rewriteNonce(r, POST, true); shiftStamps(r); newIds(r); r.driverSha256 = PIN; r.predicate = true; r.dragHypothesis = 'CONFIRMED'; r.degenerate = null; r.failures = []; return r; };
const forged = clone(smoke1); rewriteNonce(forged, POST, false); shiftStamps(forged);
const forgedFix = clone(smoke1); rewriteNonce(forgedFix, POST, true); shiftStamps(forgedFix);
const tiny = clone(forgedFix); newIds(tiny); tiny.events[7].ts += 1e-12;
const whole = relabel(smoke1); whole.events.forEach((e) => { e.ts = q(e.ts + 0.1); e.at = q(e.at + 0.1); }); whole.legMarks.forEach((m) => { m.at = q(m.at + 0.1); }); whole.closedAt = q(whole.closedAt + 0.1);
const whole100 = relabel(smoke1); whole100.events.forEach((e) => { e.ts = q(e.ts + 100); e.at = q(e.at + 100); }); whole100.legMarks.forEach((m) => { m.at = q(m.at + 100); }); whole100.closedAt = q(whole100.closedAt + 100);
const probeRelabel = relabel(JSON.parse(fs.readFileSync(probe1Path, 'utf8')));
const limit = relabel(smoke1); limit.events.forEach((e, i) => { const d = (i + 1) * 0.3; e.ts = q(e.ts + d); e.at = q(e.at + d); });   // monotone, so event order and leg windows hold

const REPLAY = ['replay-launch-token', 'replay-devtools-url', 'replay-event-timeline'];
const controls = [
  { name: 'donothing-no-receipt', args: ['--receipt', path.join(work, 'absent.json'), '--expect-driver-sha256', PIN, '--expect-nonce', POST, ...P], expectExit: 2, expectIds: ['receipt-unreadable'], exact: true,
    why: 'no work: no r75 drag receipt exists' },
  { name: 'donothing-r74-ime-receipt', args: ['--receipt', path.join(LANE, 'corpus/evidence/round74/chromium-ime-composition/receipt.json'), '--expect-driver-sha256', PIN, '--expect-nonce', POST, ...P], expectExit: 1, expectIds: ['schema', 'nonce-shape', 'nonce-expected', 'driver-pin', 'drag-call-count', 'intercept-event'], exact: false,
    why: 'no work: re-present the lane\'s newest committed capability receipt (r74 IME) as a drag run' },
  { name: 'donothing-no-flags', args: ['--receipt', smoke1Path], expectExit: 2, expectIds: ['usage'], exact: true,
    why: 'call without pin, nonce or priors: refused as usage' },
  { name: 'replay-zeroedit-smoke1', args: ['--receipt', smoke1Path, '--expect-driver-sha256', PIN, '--expect-nonce', POST, ...P], expectExit: 1, expectIds: ['nonce-expected', ...REPLAY], exact: true,
    why: 'QUALITY 136 replay 1: byte-identical pre-freeze receipt presented as the post-freeze run' },
  { name: 'replay-zeroedit-smoke1-own-nonce', args: ['--receipt', smoke1Path, '--expect-driver-sha256', PIN, '--expect-nonce', smoke1.nonce, ...P], expectExit: 1, expectIds: REPLAY, exact: true,
    why: 'same, with the replayed receipt\'s own nonce expected: the replay checks alone refuse it' },
  { name: 'replay-forged-nonce-stamps', args: ['--receipt', write('forged-nonce-stamps', forged), '--expect-driver-sha256', PIN, '--expect-nonce', POST, ...P], expectExit: 1, expectIds: [...REPLAY, 'fixture-hash'], exact: true,
    why: 'QUALITY 136 replay 2: nonce rewritten everywhere it is logged, wall-clock stamps +1 h; the fixture hash still carries the old nonce' },
  { name: 'replay-forged-nonce-stamps-fixture', args: ['--receipt', write('forged-nonce-stamps-fixture', forgedFix), '--expect-driver-sha256', PIN, '--expect-nonce', POST, ...P], expectExit: 1, expectIds: REPLAY, exact: true,
    why: 'same, and the fixture hash recomputed for the new nonce' },
  { name: 'replay-forged-1e-12', args: ['--receipt', write('forged-1e-12', tiny), '--expect-driver-sha256', PIN, '--expect-nonce', POST, ...P], expectExit: 1, expectIds: ['replay-event-timeline'], exact: true,
    why: 'R73Review1 1.4 analog: nonce, fixture hash, launch token and browser id rewritten, one event ts moved by 1e-12 (still on the 0.1 ms grid within the counter\'s 1e-4 tolerance; first pass expected event-time-quantum too and failed: lesson-proof/controls-first-pass-1e-12-expectation.json)' },
  { name: 'replay-forged-whole-shift-0.1ms', args: ['--receipt', write('forged-whole-shift', whole), '--expect-driver-sha256', PIN, '--expect-nonce', POST, ...P], expectExit: 1, expectIds: ['replay-event-timeline'], exact: true,
    why: 'THE ROUND-74 DECLARED LIMIT, now refused: full relabel plus every event time moved by one 0.1 ms quantum (r74 controls: limit-full-identifier-rewrite exit 0); the shift-invariant gap test refuses it' },
  { name: 'replay-forged-whole-shift-100ms', args: ['--receipt', write('forged-whole-shift-100', whole100), '--expect-driver-sha256', PIN, '--expect-nonce', POST, ...P], expectExit: 1, expectIds: ['replay-event-timeline'], exact: true,
    why: 'same with a 100 ms whole-timeline shift' },
  { name: 'replay-probe-p1-relabel', args: ['--receipt', write('probe-p1-relabel', probeRelabel), '--expect-driver-sha256', PIN, '--expect-nonce', POST, ...P], expectExit: 1, expectIds: ['replay-event-timeline'], exact: false,
    why: 'QUALITY 140 / R74Critic: a full relabel of a committed PROBE receipt is refused because the probes are in PRE (probe legShape differs: the producer-verdict and legshape ids may co-fire)' },
  { name: 'limit-nonuniform-retime', args: ['--receipt', write('limit-nonuniform', limit), '--expect-driver-sha256', PIN, '--expect-nonce', POST, ...P], expectExit: 0, expectIds: [], exact: true,
    why: 'DECLARED LIMIT witness, not a pass: a full relabel whose every event time is moved by a different multiple of 0.3 ms is not refused (the counter is not an execution oracle)' },
];
const results = controls.map((c) => {
  const p = spawnSync(process.execPath, [CTR, ...c.args, '--json'], { encoding: 'utf8', timeout: 60000 });
  const rc = p.status;
  let j = null; try { j = JSON.parse(p.stdout); } catch {}
  const ids = j && Array.isArray(j.findings) ? j.findings.map((f) => f.id) : null;
  const ok = rc === c.expectExit && Array.isArray(ids) && c.expectIds.every((i) => ids.includes(i)) && (!c.exact || ids.length === c.expectIds.length);
  return { name: c.name, why: c.why, expectExit: c.expectExit, expectIds: c.expectIds, exact: c.exact, exit: rc, ids, ok };
});
const degenerates = ['native-mouse', 'no-intercept', 'script-events'].map((k) => {
  const read = (f) => { try { return fs.readFileSync(path.join(HERE, f), 'utf8').trim(); } catch { return null; } };
  let r = null; try { r = JSON.parse(read(`degenerate-${k}.receipt.json`)); } catch {}
  const ok = read(`degenerate-${k}.driver.exit`) === '1' && r !== null && r.degenerate === k && r.dragHypothesis === 'REFUTED' && r.predicate === false;
  return { name: 'degenerate-' + k, expect: 'driver exit 1, receipt.degenerate === name (QUALITY 133), hypothesis REFUTED', driverExit: read(`degenerate-${k}.driver.exit`), label: r ? r.degenerate : null, hypothesis: r ? r.dragHypothesis : null, ok };
});
// before-state at the round's base commit (committed bytes, not the working tree)
const BASE = 'c19a520fdfa574a5c082b09130b7dbfcdd1e99eb';
const baseScorecard = spawnSync('git', ['-C', LANE, 'show', BASE + ':SCORECARD.md'], { encoding: 'utf8', maxBuffer: 1 << 26 }).stdout;
const rows = { stdout: String(baseScorecard.split('\n').filter((l) => l.startsWith('| `chromium-drag-intercept-linux` |')).length) };
const notes = spawnSync('git', ['-C', LANE, 'grep', '-lE', 'dispatchDragEvent|setInterceptDrags', BASE, '--', 'corpus/knowledge'], { encoding: 'utf8' });
const summary = { schema: 'tabi-r75-c1-controls', counterSha256: sha(fs.readFileSync(CTR)), driverSha256: PIN, priors: PRE.map((p) => path.relative(LANE, p)),
  capabilityRowCount: Number(rows.stdout.trim()), notesCitingDragCommands: notes.stdout.split('\n').filter(Boolean).length,
  allOk: results.every((r) => r.ok) && degenerates.every((d) => d.ok) && Number(rows.stdout.trim()) === 0, results, degenerates };
fs.writeFileSync(path.join(HERE, 'controls-summary.json'), JSON.stringify(summary, null, 1) + '\n');
console.log([...results, ...degenerates].map((r) => `${r.ok ? 'ok  ' : 'FAIL'} ${r.name} exit=${r.exit ?? r.driverExit} ids=${JSON.stringify(r.ids ?? r.label)}`).join('\n') + `\ncapabilityRowCount=${summary.capabilityRowCount} notes=${summary.notesCitingDragCommands} allOk=${summary.allOk}`);
process.exit(summary.allOk ? 0 : 1);
