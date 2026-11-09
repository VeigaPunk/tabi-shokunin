#!/usr/bin/env node
// Live-killer harness: tabi round 99, C1. The counter's `--live`-only checks (`driver-exit`,
// `ports-bound`, `missing-bound`, `tmpdir-bound`) and its driver-exit-3 handling (r98 D3) cannot be
// reached by a receipt battery. This harness builds a scratch lane holding a copy of the counter and a
// driver mutant per killer, runs the counter `--live --reps 1` with that mutant's own sha256 as the pin, and
// requires the frozen counter's expected rc and finding id; for every killer with a neutral form it then
// runs a counter mutant with that one behaviour neutralised on the same driver mutant and requires the
// neutralised rc: the killer kills the mutant.
//   K-exit:    driver exits 4 instead of 0 after writing a clean receipt   -> rc 1 `driver-exit`; neutral rc 0
//   K-ports:   driver records cdp port + 1 in the receipt                  -> rc 1 `ports-bound`; neutral rc 0
//   K-missing: driver uses <scratch>/k/tabi-r99-missing.txt                 -> rc 1 `missing-bound`; neutral rc 0
//   K-tmpdir:  driver records <scratch>/k/t as tmpdirAtLoad                 -> rc 1 `tmpdir-bound`; neutral rc 0
//   K-partial: rep-1 Puppeteer launch fails (driver exit 3) AND the binary payload is named .bin
//              (a law change on the legs that came up)                       -> rc 1 `child-files`; neutral
//              (the r98 mapping: exit 3 -> `setup` before any check) rc 2
//   K-launchonly: rep-1 Puppeteer launch fails, nothing else changed        -> rc 2 `setup` (positive control:
//              a launch failure alone is not reported as a law finding); no neutral form
// Usage: node livekillers-client-oopif-uploadsets-round99.mjs --lane <ABS lane> --deps <ABS dir>
//          --scratch <ABS dir> --ports <http,child,cdp> [--json]
// Exit 0: every killer gives its expected verdicts; 1: otherwise; 2: usage/setup (an unexpected live
// refusal, or a replacement anchor not found).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const lane = opt('lane'); const deps = opt('deps'); const scratch = opt('scratch'); const ports = opt('ports');
if (![lane, deps, scratch].every((p) => p && path.isAbsolute(p)) || !/^[0-9]+,[0-9]+,[0-9]+$/.test(ports || '')) { console.error('usage'); process.exit(2); }
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const DRIVER = 'scripts/client-oopif-uploadsets-round99.mjs';
const COUNTER = 'scripts/check-client-oopif-uploadsets-round99.mjs';
const driverSrc = fs.readFileSync(path.join(lane, DRIVER), 'utf8');
const counterSrc = fs.readFileSync(path.join(lane, COUNTER), 'utf8');
const replaceOnce = (src, from, to, what) => {
  const n = src.split(from).length - 1;
  if (n !== 1) { console.log(JSON.stringify({ verdict: 'setup', detail: what + ': anchor found ' + n + ' times' })); process.exit(2); }
  return src.replace(from, to);
};
const LAUNCH = "if (a.lib === 'puppeteer') client = await puppeteer.launch({";
const LAUNCH_K = "if (a.lib === 'puppeteer' && rep === 1) throw new Error('k-launch'); " + LAUNCH;
const killers = [
  { name: 'K-exit', edits: [['process.exit(launchFailures ? 3 : receipt.failures.length ? 1 : 0);', 'process.exit(launchFailures ? 3 : receipt.failures.length ? 1 : 4);']], frozen: [1, 'driver-exit'], neutral: [["check('driver-exit', driverRun.status === 0,", "check('driver-exit', true,"], 0] },
  { name: 'K-ports', edits: [['ports: { http: httpPort, child: childPort, cdp: cdpPort },', 'ports: { http: httpPort, child: childPort, cdp: cdpPort + 1 },']], frozen: [1, 'ports-bound'], neutral: [["check('ports-bound', isObj(receipt.ports) && eq([receipt.ports.http, receipt.ports.child, receipt.ports.cdp], livePorts),", "check('ports-bound', true,"], 0] },
  { name: 'K-missing', edits: [['const missingPath = path.join(scratch, MISSING_NAME);', "const missingPath = path.join(scratch, 'k', MISSING_NAME);"]], frozen: [1, 'missing-bound'], neutral: [["check('missing-bound', receipt.missingPath === liveMissing,", "check('missing-bound', true,"], 0] },
  { name: 'K-tmpdir', edits: [['tmpdirAtLoad: tmpDir,', "tmpdirAtLoad: path.join(scratch, 'k', 't'),"]], frozen: [1, 'tmpdir-bound'], neutral: [["check('tmpdir-bound', receipt.tmpdirAtLoad === liveTmp,", "check('tmpdir-bound', true,"], 0] },
  { name: 'K-partial', edits: [[LAUNCH, LAUNCH_K], ["const BIN_NAME = 'tabi-r99-bytes.png';", "const BIN_NAME = 'tabi-r99-bytes.bin';"]], frozen: [1, 'child-files'], neutral: [['if (status === 3) partialLaunch = true;', "if (status === 3) refuse('chromium never came up (driver exit 3, host resource failure)', { revision, driverRun });"], 2] },
  { name: 'K-launchonly', edits: [[LAUNCH, LAUNCH_K]], frozen: [2, null], neutral: null },
];
fs.mkdirSync(scratch, { recursive: true });
const results = [];
for (const k of killers) {
  // short directory names: the driver puts TMPDIR at <counter scratch>/driver/t, and chromium's singleton
  // socket path under it must stay below the unix socket limit (108-byte sun_path)
  const fake = fs.mkdtempSync(path.join(scratch, k.name.slice(2, 3)));
  fs.mkdirSync(path.join(fake, 'scripts'));
  let mutant = driverSrc;
  for (const [from, to] of k.edits) mutant = replaceOnce(mutant, from, to, k.name + ' driver');
  fs.writeFileSync(path.join(fake, DRIVER), mutant);
  const pin = sha256(Buffer.from(mutant));
  const run = (counterBytes, label) => {
    const cpath = path.join(fake, 'scripts', label + '-check.mjs');
    fs.writeFileSync(cpath, counterBytes);
    const r = spawnSync(process.execPath, [cpath, '--lane', fake, '--expect-driver-sha256', pin, '--live', '--deps', deps, '--scratch', path.join(fake, label.slice(0, 1)), '--ports', ports, '--reps', '1'], { encoding: 'utf8', timeout: 600000 });
    let o = {};
    try { o = JSON.parse(r.stdout); } catch {}
    return { rc: r.status, verdict: o.verdict || null, ids: [...new Set((o.findings || []).map((f) => f.id))], launchFailed: o.launchFailed || null, detail: o.detail || null };
  };
  const frozen = run(counterSrc, 'frozen');
  const neutralised = k.neutral ? run(replaceOnce(counterSrc, k.neutral[0][0], k.neutral[0][1], k.name + ' counter'), 'neutral') : null;
  const frozenOk = frozen.rc === k.frozen[0] && (k.frozen[1] === null ? frozen.verdict === 'setup' : frozen.verdict === 'findings' && frozen.ids.includes(k.frozen[1]));
  const neutralOk = !k.neutral || neutralised.rc === k.neutral[1];
  if (!frozenOk && frozen.rc === 2 && k.frozen[0] !== 2) { console.log(JSON.stringify({ verdict: 'setup', killer: k.name, frozen, neutralised })); process.exit(2); }
  results.push({ name: k.name, expect: { frozen: k.frozen, neutral: k.neutral ? k.neutral[1] : null }, mutantSha256: pin, frozen, neutralised, ok: frozenOk && neutralOk });
  fs.rmSync(fake, { recursive: true, force: true });
}
const fail = results.filter((x) => !x.ok);
const out = { harness: 'tabi-r99-client-oopif-uploadsets-livekillers', counterSha256: sha256(Buffer.from(counterSrc)), driverSha256: sha256(Buffer.from(driverSrc)), killers: results.length, ok: results.length - fail.length, failed: fail.map((x) => x.name), results };
console.log(argv.includes('--json') ? JSON.stringify(out, null, 2) : JSON.stringify({ killers: out.killers, ok: out.ok, failed: out.failed }));
process.exit(fail.length ? 1 : 0);
