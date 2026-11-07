#!/usr/bin/env node
// Round 73 C1 pre-freeze do-nothing / forgery / limit controls for scripts/check-synthpinch-r73.mjs.
// Each control states its expected exit and finding ids BEFORE it runs (tabi r63 prerequisite:
// executed failing-before controls with independent expected verdicts and observed rc/ids).
// Usage: node controls-c1.mjs --work <ABS scratch>   (writes controls-summary.json beside this file)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const LANE = path.resolve(HERE, '../../../../..');
const CTR = path.join(LANE, 'scripts/check-synthpinch-r73.mjs');
const PIN = crypto.createHash('sha256').update(fs.readFileSync(path.join(LANE, 'scripts/chrome-cdp-synthpinch-round73.mjs'))).digest('hex');
const wi = process.argv.indexOf('--work');
const work = wi >= 0 ? process.argv[wi + 1] : null;
if (!work || !path.isAbsolute(work)) { console.error('usage: --work <ABS scratch>'); process.exit(2); }
fs.mkdirSync(work, { recursive: true });
const PRE = [...[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => path.join(HERE, `smoke${i}.receipt.json`)),
  ...['dispatch-wheel', 'set-scale', 'skip-touch'].map((k) => path.join(HERE, `degenerate-${k}.receipt.json`))];
const P = PRE.flatMap((p) => ['--prior', p]);
const POST = 'tabi-r73-l1-control0000';   // stands in for the post-freeze nonce the predicate derives
const smoke1 = JSON.parse(fs.readFileSync(PRE[0], 'utf8'));
const write = (name, obj) => { const f = path.join(work, name + '.json'); fs.writeFileSync(f, JSON.stringify(obj)); return f; };
const rewriteNonce = (r, to) => {
  const old = r.nonce; r.nonce = to; r.nonceOnPage = to; r.serverLog.forEach((s) => { s.run = to; });
  for (const c of r.cdpSendLog) { if (c.method === 'Page.navigate') c.params.url = c.params.url.replace(encodeURIComponent(old), encodeURIComponent(to)); if (c.method === 'Runtime.evaluate') c.params.expression = c.params.expression.replace(JSON.stringify(old), JSON.stringify(to)); }
};
const shiftStamps = (r) => { for (const k of ['startedAt', 'finishedAt']) r[k] = new Date(Date.parse(r[k]) + 3600000).toISOString(); };

const forged = JSON.parse(JSON.stringify(smoke1)); rewriteNonce(forged, POST); shiftStamps(forged);
const full = JSON.parse(JSON.stringify(forged));
full.host.launchToken = crypto.randomBytes(6).toString('hex');
const oldId = full.host.devtoolsListening.url.split('/devtools/browser/')[1]; const newId = crypto.randomUUID();
full.host.devtoolsListening.url = full.host.devtoolsListening.url.replace(oldId, newId);
if (typeof full.host.devtoolsListening.browserId === 'string') full.host.devtoolsListening.browserId = newId;
full.host.stderrHead = full.host.stderrHead.split(oldId).join(newId);
full.events.forEach((e) => { e.ts += 0.25; });

const REPLAY = ['replay-launch-token', 'replay-devtools-url', 'replay-event-timeline'];
const controls = [
  { name: 'donothing-no-receipt', args: ['--receipt', path.join(work, 'absent.json'), '--expect-driver-sha256', PIN, '--expect-nonce', POST, ...P], expectExit: 2, expectIds: ['receipt-unreadable'], exact: true,
    why: 'no work: no r73 receipt exists' },
  { name: 'donothing-r72-scored-receipt', args: ['--receipt', path.join(LANE, 'corpus/evidence/round72/chromium-synth-pinch-gesture/receipt.json'), '--expect-driver-sha256', PIN, '--expect-nonce', POST, ...P], expectExit: 1, expectIds: ['schema', 'nonce-shape', 'nonce-expected', 'driver-pin'], exact: false,
    why: 'no work: re-present the committed round-72 scored receipt' },
  { name: 'donothing-no-flags', args: ['--receipt', PRE[0]], expectExit: 2, expectIds: ['usage'], exact: true,
    why: 'r72-style call without pin, nonce or priors (R72Review1 FG5): refused as usage' },
  { name: 'replay-zeroedit-smoke1', args: ['--receipt', PRE[0], '--expect-driver-sha256', PIN, '--expect-nonce', POST, ...P], expectExit: 1, expectIds: ['nonce-expected', ...REPLAY], exact: true,
    why: 'QUALITY 136 replay 1: byte-identical pre-freeze receipt presented as the post-freeze run' },
  { name: 'replay-zeroedit-smoke1-own-nonce', args: ['--receipt', PRE[0], '--expect-driver-sha256', PIN, '--expect-nonce', smoke1.nonce, ...P], expectExit: 1, expectIds: REPLAY, exact: true,
    why: 'same, even when the expected nonce is the replayed one: the replay checks alone refuse it' },
  { name: 'replay-forged-nonce-stamps', args: ['--receipt', write('forged-nonce-stamps', forged), '--expect-driver-sha256', PIN, '--expect-nonce', POST, ...P], expectExit: 1, expectIds: REPLAY, exact: true,
    why: 'QUALITY 136 replay 2 (R72Critic forged-a analog): nonce rewritten everywhere to the expected one, wall-clock stamps +1 h' },
  { name: 'limit-full-identifier-rewrite', args: ['--receipt', write('limit-full-rewrite', full), '--expect-driver-sha256', PIN, '--expect-nonce', POST, ...P], expectExit: 0, expectIds: [], exact: true,
    why: 'DECLARED LIMIT witness, not a pass: a forger who also rewrites the launch token, the DevTools browser id and every event ts is not refused (the counter is not an execution oracle)' },
];
const results = controls.map((c) => {
  const p = spawnSync(process.execPath, [CTR, ...c.args, '--json'], { encoding: 'utf8', timeout: 60000 });
  let j = null; try { j = JSON.parse(p.stdout); } catch {}
  const ids = j && Array.isArray(j.findings) ? j.findings.map((f) => f.id) : null;
  const ok = p.status === c.expectExit && Array.isArray(ids) && c.expectIds.every((i) => ids.includes(i)) && (!c.exact || ids.length === c.expectIds.length);
  return { name: c.name, why: c.why, expectExit: c.expectExit, expectIds: c.expectIds, exact: c.exact, exit: p.status, ids, ok };
});
const rows = spawnSync('grep', ['-c', '^| `chromium-synth-pinch-gesture-linux` |', path.join(LANE, 'SCORECARD.md')], { encoding: 'utf8' });
const summary = { schema: 'tabi-r73-c1-controls', counterSha256: crypto.createHash('sha256').update(fs.readFileSync(CTR)).digest('hex'), driverSha256: PIN, priors: PRE.map((p) => path.relative(LANE, p)),
  capabilityRowCount: Number(rows.stdout.trim()), allOk: results.every((r) => r.ok), results };
fs.writeFileSync(path.join(HERE, 'controls-summary.json'), JSON.stringify(summary, null, 1) + '\n');
console.log(results.map((r) => `${r.ok ? 'ok  ' : 'FAIL'} ${r.name} exit=${r.exit} ids=${JSON.stringify(r.ids)}`).join('\n') + `\ncapabilityRowCount=${summary.capabilityRowCount} allOk=${summary.allOk}`);
process.exit(summary.allOk ? 0 : 1);
