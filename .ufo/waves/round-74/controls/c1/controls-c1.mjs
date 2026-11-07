#!/usr/bin/env node
// Round 74 C1 pre-freeze do-nothing / forgery / limit controls for scripts/check-imecompose-r74.mjs.
// Each control states its expected exit and finding ids BEFORE it runs (tabi r63 prerequisite:
// executed failing-before controls with independent expected verdicts and observed rc/ids,
// QUALITY 131: exit AND ids, evaluated mechanically).
// Usage: node controls-c1.mjs --work <ABS scratch>   (writes controls-summary.json beside this file)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const LANE = path.resolve(HERE, '../../../../..');
const CTR = path.join(LANE, 'scripts/check-imecompose-r74.mjs');
const DRV = path.join(LANE, 'scripts/chrome-cdp-imecompose-round74.mjs');
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const driverText = fs.readFileSync(DRV, 'utf8');
const PIN = sha(fs.readFileSync(DRV));
const wi = process.argv.indexOf('--work');
const work = wi >= 0 ? process.argv[wi + 1] : null;
if (!work || !path.isAbsolute(work)) { console.error('usage: --work <ABS scratch>'); process.exit(2); }
fs.mkdirSync(work, { recursive: true });
const PRE = [...[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => path.join(HERE, `smoke${i}.receipt.json`)),
  ...['dispatch-key', 'exec-command', 'script-events'].map((k) => path.join(HERE, `degenerate-${k}.receipt.json`))];
const P = PRE.flatMap((p) => ['--prior', p]);
const POST = 'tabi-r74-l1-control0000';   // stands in for the post-freeze nonce the predicate derives
const smoke1 = JSON.parse(fs.readFileSync(PRE[0], 'utf8'));
const tpl = /\/\*IMECOMPOSE-FIXTURE-BEGIN\*\/\nconst FIXTURE_TEMPLATE = `([\s\S]*?)`;\n\/\*IMECOMPOSE-FIXTURE-END\*\//.exec(driverText)[1];
const fixtureSha = (nonce) => sha(tpl.replaceAll('__NONCE__', nonce));
const write = (name, obj) => { const f = path.join(work, name + '.json'); fs.writeFileSync(f, JSON.stringify(obj)); return f; };
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
  r.host.stderrHead = r.host.stderrHead.split(oldId).join(newId);
};

const forged = JSON.parse(JSON.stringify(smoke1)); rewriteNonce(forged, POST, false); shiftStamps(forged);
const forgedFix = JSON.parse(JSON.stringify(smoke1)); rewriteNonce(forgedFix, POST, true); shiftStamps(forgedFix);
const tiny = JSON.parse(JSON.stringify(forgedFix)); newIds(tiny); tiny.events[7].ts += 1e-12;
const full = JSON.parse(JSON.stringify(forgedFix)); newIds(full);
full.events.forEach((e) => { e.ts = Math.round((e.ts + 0.1) * 10) / 10; e.at = Math.round((e.at + 0.1) * 10) / 10; });

const REPLAY = ['replay-launch-token', 'replay-devtools-url', 'replay-event-timeline'];
const controls = [
  { name: 'donothing-no-receipt', args: ['--receipt', path.join(work, 'absent.json'), '--expect-driver-sha256', PIN, '--expect-nonce', POST, ...P], expectExit: 2, expectIds: ['receipt-unreadable'], exact: true,
    why: 'no work: no r74 IME receipt exists' },
  { name: 'donothing-r73-pinch-receipt', args: ['--receipt', path.join(LANE, 'corpus/evidence/round73/chromium-synth-pinch-gesture/receipt.json'), '--expect-driver-sha256', PIN, '--expect-nonce', POST, ...P], expectExit: 1, expectIds: ['schema', 'nonce-shape', 'nonce-expected', 'driver-pin', 'ime-call-count'], exact: false,
    why: 'no work: re-present the lane\'s newest committed capability receipt (r73 pinch) as an IME run' },
  { name: 'donothing-no-flags', args: ['--receipt', PRE[0]], expectExit: 2, expectIds: ['usage'], exact: true,
    why: 'call without pin, nonce or priors: refused as usage' },
  { name: 'replay-zeroedit-smoke1', args: ['--receipt', PRE[0], '--expect-driver-sha256', PIN, '--expect-nonce', POST, ...P], expectExit: 1, expectIds: ['nonce-expected', ...REPLAY], exact: true,
    why: 'QUALITY 136 replay 1: byte-identical pre-freeze receipt presented as the post-freeze run' },
  { name: 'replay-zeroedit-smoke1-own-nonce', args: ['--receipt', PRE[0], '--expect-driver-sha256', PIN, '--expect-nonce', smoke1.nonce, ...P], expectExit: 1, expectIds: REPLAY, exact: true,
    why: 'same, with the replayed receipt\'s own nonce expected: the replay checks alone refuse it' },
  { name: 'replay-forged-nonce-stamps', args: ['--receipt', write('forged-nonce-stamps', forged), '--expect-driver-sha256', PIN, '--expect-nonce', POST, ...P], expectExit: 1, expectIds: [...REPLAY, 'fixture-hash'], exact: true,
    why: 'QUALITY 136 replay 2: nonce rewritten everywhere it is logged, wall-clock stamps +1 h; the fixture hash still carries the old nonce' },
  { name: 'replay-forged-nonce-stamps-fixture', args: ['--receipt', write('forged-nonce-stamps-fixture', forgedFix), '--expect-driver-sha256', PIN, '--expect-nonce', POST, ...P], expectExit: 1, expectIds: REPLAY, exact: true,
    why: 'same, and the fixture hash recomputed for the new nonce' },
  { name: 'replay-forged-1e-12', args: ['--receipt', write('forged-1e-12', tiny), '--expect-driver-sha256', PIN, '--expect-nonce', POST, ...P], expectExit: 1, expectIds: ['replay-event-timeline'], exact: true,
    why: 'R73Review1 section 1.4 analog: nonce, fixture hash, launch token and browser id all rewritten, one event ts moved by 1e-12; the near-match timeline refuses it' },
  { name: 'limit-full-identifier-rewrite', args: ['--receipt', write('limit-full-rewrite', full), '--expect-driver-sha256', PIN, '--expect-nonce', POST, ...P], expectExit: 0, expectIds: [], exact: true,
    why: 'DECLARED LIMIT witness, not a pass: a forger who also rewrites the launch token, the browser id and moves every event time by one 0.1 ms quantum is not refused (the counter is not an execution oracle)' },
];
const results = controls.map((c) => {
  const p = spawnSync(process.execPath, [CTR, ...c.args, '--json'], { encoding: 'utf8', timeout: 60000 });
  const rc = p.status;
  let j = null; try { j = JSON.parse(p.stdout); } catch {}
  const ids = j && Array.isArray(j.findings) ? j.findings.map((f) => f.id) : null;
  const ok = rc === c.expectExit && Array.isArray(ids) && c.expectIds.every((i) => ids.includes(i)) && (!c.exact || ids.length === c.expectIds.length);
  return { name: c.name, why: c.why, expectExit: c.expectExit, expectIds: c.expectIds, exact: c.exact, exit: rc, ids, ok };
});
const degenerates = ['dispatch-key', 'exec-command', 'script-events'].map((k) => {
  const read = (f) => { try { return fs.readFileSync(path.join(HERE, f), 'utf8').trim(); } catch { return null; } };
  let r = null; try { r = JSON.parse(read(`degenerate-${k}.receipt.json`)); } catch {}
  const ok = read(`degenerate-${k}.driver.exit`) === '1' && r !== null && r.degenerate === k && r.imeComposeHypothesis === 'REFUTED' && r.predicate === false;
  return { name: 'degenerate-' + k, expect: 'driver exit 1, receipt.degenerate === name (QUALITY 133), hypothesis REFUTED', driverExit: read(`degenerate-${k}.driver.exit`), label: r ? r.degenerate : null, hypothesis: r ? r.imeComposeHypothesis : null, ok };
});
const rows = spawnSync('grep', ['-c', '^| `chromium-ime-composition-linux` |', path.join(LANE, 'SCORECARD.md')], { encoding: 'utf8' });
const summary = { schema: 'tabi-r74-c1-controls', counterSha256: sha(fs.readFileSync(CTR)), driverSha256: PIN, priors: PRE.map((p) => path.relative(LANE, p)),
  capabilityRowCount: Number(rows.stdout.trim()), allOk: results.every((r) => r.ok) && degenerates.every((d) => d.ok), results, degenerates };
fs.writeFileSync(path.join(HERE, 'controls-summary.json'), JSON.stringify(summary, null, 1) + '\n');
console.log([...results, ...degenerates].map((r) => `${r.ok ? 'ok  ' : 'FAIL'} ${r.name} exit=${r.exit ?? r.driverExit} ids=${JSON.stringify(r.ids ?? r.label)}`).join('\n') + `\ncapabilityRowCount=${summary.capabilityRowCount} allOk=${summary.allOk}`);
process.exit(summary.allOk ? 0 : 1);
