#!/usr/bin/env node
// Live-killer harness: tabi round 98, C1. The counter's three `--live`-only checks (`driver-exit`,
// `ports-bound`, `missing-bound`) cannot be reached by a receipt battery (r96 M20/M51/M52 and r97 M75-M77
// survived for that reason). This harness builds a scratch lane holding a copy of the counter and a driver
// mutant per check, runs the counter `--live --reps 1` with that mutant's own sha256 as the pin, and
// requires rc 1 with the target finding id. It then runs a counter mutant with that one check neutralised
// (`check('<id>', true, …)`) on the same driver mutant and requires rc 0: the killer kills the mutant.
//   K-exit:    driver exits 4 instead of 0 after writing a clean receipt  -> `driver-exit`
//   K-ports:   driver records cdp port + 1 in the receipt                 -> `ports-bound`
//   K-missing: driver uses <scratch>/k/tabi-r98-missing.txt                -> `missing-bound`
// Usage: node livekillers-client-oopif-uploadmodes-round98.mjs --lane <ABS lane> --deps <ABS dir>
//          --scratch <ABS dir> --ports <http,child,cdp> [--json]
// Exit 0: every killer kills (frozen counter rc 1 with the id; neutralised counter rc 0); 1: otherwise;
// 2: usage/setup (a live run refused, or a replacement anchor not found).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const lane = opt('lane'); const deps = opt('deps'); const scratch = opt('scratch'); const ports = opt('ports');
if (![lane, deps, scratch].every((p) => p && path.isAbsolute(p)) || !/^[0-9]+,[0-9]+,[0-9]+$/.test(ports || '')) { console.error('usage'); process.exit(2); }
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const DRIVER = 'scripts/client-oopif-uploadmodes-round98.mjs';
const COUNTER = 'scripts/check-client-oopif-uploadmodes-round98.mjs';
const driverSrc = fs.readFileSync(path.join(lane, DRIVER), 'utf8');
const counterSrc = fs.readFileSync(path.join(lane, COUNTER), 'utf8');
const replaceOnce = (src, from, to, what) => {
  const n = src.split(from).length - 1;
  if (n !== 1) { console.log(JSON.stringify({ verdict: 'setup', detail: what + ': anchor found ' + n + ' times' })); process.exit(2); }
  return src.replace(from, to);
};
const killers = [
  { name: 'K-exit', id: 'driver-exit', from: 'process.exit(launchFailures ? 3 : receipt.failures.length ? 1 : 0);', to: 'process.exit(launchFailures ? 3 : receipt.failures.length ? 1 : 4);' },
  { name: 'K-ports', id: 'ports-bound', from: 'ports: { http: httpPort, child: childPort, cdp: cdpPort },', to: 'ports: { http: httpPort, child: childPort, cdp: cdpPort + 1 },' },
  { name: 'K-missing', id: 'missing-bound', from: 'const missingPath = path.join(scratch, MISSING_NAME);', to: "const missingPath = path.join(scratch, 'k', MISSING_NAME);" },
];
const neutral = {
  'driver-exit': ["check('driver-exit', driverRun.status === 0,", "check('driver-exit', true,"],
  'ports-bound': ["check('ports-bound', isObj(receipt.ports) && eq([receipt.ports.http, receipt.ports.child, receipt.ports.cdp], livePorts),", "check('ports-bound', true,"],
  'missing-bound': ["check('missing-bound', receipt.missingPath === liveMissing,", "check('missing-bound', true,"],
};
fs.mkdirSync(scratch, { recursive: true });
const results = [];
for (const k of killers) {
  // short directory names: the driver puts TMPDIR at <counter scratch>/driver/t, and chromium's singleton
  // socket path under it must stay below the unix socket limit (108-byte sun_path)
  const fake = fs.mkdtempSync(path.join(scratch, k.name.slice(2, 3)));
  fs.mkdirSync(path.join(fake, 'scripts'));
  const mutant = replaceOnce(driverSrc, k.from, k.to, k.name + ' driver');
  fs.writeFileSync(path.join(fake, DRIVER), mutant);
  const pin = sha256(Buffer.from(mutant));
  const run = (counterBytes, label) => {
    const cpath = path.join(fake, 'scripts', label + '-check.mjs');
    fs.writeFileSync(cpath, counterBytes);
    const r = spawnSync(process.execPath, [cpath, '--lane', fake, '--expect-driver-sha256', pin, '--live', '--deps', deps, '--scratch', path.join(fake, label.slice(0, 1)), '--ports', ports, '--reps', '1'], { encoding: 'utf8', timeout: 600000 });
    let o = {};
    try { o = JSON.parse(r.stdout); } catch {}
    return { rc: r.status, verdict: o.verdict || null, ids: [...new Set((o.findings || []).map((f) => f.id))], detail: o.detail || null };
  };
  const frozen = run(counterSrc, 'frozen');
  const neutralised = run(replaceOnce(counterSrc, neutral[k.id][0], neutral[k.id][1], k.name + ' counter'), 'neutral');
  if (frozen.rc === 2 || neutralised.rc === 2) { console.log(JSON.stringify({ verdict: 'setup', killer: k.name, frozen, neutralised })); process.exit(2); }
  const ok = frozen.rc === 1 && frozen.ids.includes(k.id) && neutralised.rc === 0;
  results.push({ name: k.name, id: k.id, mutantSha256: pin, frozen, neutralised, ok });
  fs.rmSync(fake, { recursive: true, force: true });
}
const fail = results.filter((x) => !x.ok);
const out = { harness: 'tabi-r98-client-oopif-uploadmodes-livekillers', counterSha256: sha256(Buffer.from(counterSrc)), driverSha256: sha256(Buffer.from(driverSrc)), killers: results.length, ok: results.length - fail.length, failed: fail.map((x) => x.name), results };
console.log(argv.includes('--json') ? JSON.stringify(out, null, 2) : JSON.stringify({ killers: out.killers, ok: out.ok, failed: out.failed }));
process.exit(fail.length ? 1 : 0);
