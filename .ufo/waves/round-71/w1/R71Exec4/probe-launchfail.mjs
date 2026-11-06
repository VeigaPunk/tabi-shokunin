#!/usr/bin/env node
// R71Exec4: force a Chromium launch failure the socket-length guard cannot see
// (wrapper exits 1 after printing to stderr, answers --version with 0) and time
// time-to-failure for: pinch copy, pinch copy with the child-exit listener removed
// (r70 R4 control), and the r70 tap driver copy. Copies only; lane files untouched.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const ROOT = '/fast/scratch/hyaku/tabi-r71/R71Exec4';
const OUT = path.join(ROOT, 'out');
const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const now = () => Number(process.hrtime.bigint()) / 1e6;

const cases = [
  { name: 'pinch-copy', driver: path.join(ROOT, 'copy/pinch.mjs'), scratch: path.join(ROOT, 'bisect/b62', 'd'.repeat(24)), nonce: 'tabi-r71-launchfail', http: 41200, cdp: 41201, timeout: 150000 },
  { name: 'pinch-nolistener-control', driver: path.join(ROOT, 'copy/pinch-nolistener.mjs'), scratch: path.join(ROOT, 'lf/nolistener'), nonce: 'tabi-r71-launchfail', http: 41300, cdp: 41301, timeout: 200000 },
  { name: 'tap-r70-copy', driver: path.join(ROOT, 'copy/tap.mjs'), scratch: path.join(ROOT, 'lf/tap'), nonce: 'tabi-r70-launchfail', http: 41400, cdp: 41401, timeout: 400000 },
];

const results = { schema: 'r71exec4-launchfail-probe', wrapper: path.join(ROOT, 'wrap/chromium-wrapper.sh'), wrapperSha256: sha(path.join(ROOT, 'wrap/chromium-wrapper.sh')), cases: [] };
for (const c of cases) {
  fs.mkdirSync(c.scratch, { recursive: true });
  const outFile = path.join(OUT, 'lf-' + c.name + '.json');
  try { fs.unlinkSync(outFile); } catch {}
  const args = [c.driver, '--scratch', c.scratch, '--out', outFile, '--nonce', c.nonce, '--http-port', String(c.http), '--cdp-port', String(c.cdp)];
  const t0 = now();
  const r = spawnSync(process.execPath, args, { encoding: 'utf8', timeout: c.timeout });
  const wallMs = Math.round(now() - t0);
  const rec = { name: c.name, driver: c.driver, driverSha256: sha(c.driver), scratch: c.scratch, scratchReal: fs.realpathSync(c.scratch), args, wallMs, exitCode: r.status, signal: r.signal, timedOut: r.error ? String(r.error.code || r.error.message) : null, stderrTail: (r.stderr || '').trim().split('\n').slice(-3).join(' | ').slice(0, 600), receiptWritten: fs.existsSync(outFile) };
  if (rec.receiptWritten) {
    const rc = JSON.parse(fs.readFileSync(outFile, 'utf8'));
    rec.receipt = {
      predicate: rc.predicate, finishedAt: rc.finishedAt,
      failures: rc.failures,
      hostChildExit: rc.host?.childExit ?? null,
      hostChromium: rc.host?.chromium ?? null,
      hostStderrHead: (rc.host?.stderrHead || '').slice(0, 300),
      hostDevtoolsListening: rc.host?.devtoolsListening ?? null,
      hostArgv0: rc.host?.argv?.[0] ?? null,
      teardown: rc.teardown ?? null,
      sweeps: rc.sweeps ?? null,
    };
  }
  results.cases.push(rec);
  console.error('[probe] ' + c.name + ' wallMs=' + wallMs + ' exit=' + r.status + ' receipt=' + rec.receiptWritten);
}
console.log(JSON.stringify(results, null, 1));
