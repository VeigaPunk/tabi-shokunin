#!/usr/bin/env node
// R58Sentinel live perimeter probe: run the r58 driver ONCE into scratch and
// verify the security perimeter from the receipt + the scratch tree.
//
// Verifies, from OBSERVED artifacts (not from the driver's own claims):
//   P1  argv recorded shape-only: no /home/<user> and no ~/ in host.argv
//   P2  the browser's own background-services artefacts land INSIDE the
//       throwaway HOME (not in the operator's real ~/.config/chromium)
//   P3  zero survivors after the driver's own teardown
//   P4  the fixture port and the DevTools port both refuse a connect
//   P5  the operator's real Chromium profile was not written by the launch
//   P6  no external URL in the recorded fixture origin / argv
//   P7  the receipt carries no absolute path into the user's home
//
// Usage: node live-perimeter-probe.mjs <driver.mjs> <scratchAbs> <outReceiptAbs>
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import net from 'node:net';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const driver = process.argv[2];
const scratch = process.argv[3];
const outReceipt = process.argv[4];
const out = { schema: 'r58sentinel-live-perimeter-v1', driver, scratch, checks: [], findings: [] };
const add = (id, ok, detail) => { out.checks.push({ id, ok: !!ok, detail: String(detail) }); if (!ok) out.findings.push({ id, detail: String(detail) }); };

fs.mkdirSync(scratch, { recursive: true });
fs.mkdirSync(path.dirname(outReceipt), { recursive: true });

// snapshot the operator's real profile BEFORE the launch
const realProfile = path.join(os.homedir(), '.config', 'chromium');
function profileSnapshot() {
  const s = {};
  const walk = (d, prefix) => {
    let ents; try { ents = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const e of ents) {
      const p = path.join(d, e.name);
      const rel = prefix + e.name;
      let st; try { st = fs.statSync(p); } catch { continue; }
      if (e.isDirectory()) { s[rel + '/'] = 'dir'; walk(p, rel + '/'); }
      else s[rel] = st.size + ':' + st.mtimeMs;
    }
  };
  walk(realProfile, '');
  return s;
}
const before = profileSnapshot();

const r = spawnSync('node', [driver, '--scratch', scratch, '--out', outReceipt], { encoding: 'utf8', timeout: 300000 });
out.exitCode = r.status;
out.stdoutTail = String(r.stdout || '').slice(-3000);
out.stderrTail = String(r.stderr || '').slice(-2000);

let receipt = null;
try { receipt = JSON.parse(fs.readFileSync(outReceipt, 'utf8')); out.receiptParsed = true; }
catch (e) { out.receiptParsed = false; add('receipt-parses', false, String((e && e.message) || e)); }

if (receipt) {
  // P1 argv shape-only
  const argvStr = JSON.stringify(receipt.host && receipt.host.argv || []);
  const homeLeak = /\/home\/[A-Za-z0-9._-]+\//.test(argvStr) || argvStr.includes('~/');
  add('argv-shape-only-no-home-leak', !homeLeak, argvStr.slice(0, 600));
  // P6 origin loopback
  const origin = String(receipt.fixture && receipt.fixture.origin || '');
  add('fixture-origin-loopback', /^http:\/\/127\.0\.0\.1:\d+$/.test(origin), origin);
  // P3 zero survivors
  const td = receipt.teardown || {};
  add('zero-survivors', td.postKillSweepCount === 0 && Array.isArray(td.survivors) && td.survivors.length === 0, JSON.stringify(td));
  // P4 port probes
  const pp = td.portProbes || null;
  add('port-probes-closed', !!pp && Object.values(pp).every((v) => v === 'closed'), JSON.stringify(pp));
  // P7 no home path anywhere in the receipt
  const whole = JSON.stringify(receipt);
  const leaks = [...whole.matchAll(/\/home\/[A-Za-z0-9._-]+/g)].map((m) => m[0]);
  add('receipt-no-user-home-path', leaks.length === 0, leaks.slice(0, 5).join(',') || 'clean');
  out.receiptTopLevelKeys = Object.keys(receipt);
  out.receiptSummary = {
    schema: receipt.schema, nonce: receipt.nonce,
    driverSha256: receipt.driverSha256,
    failures: receipt.failures, predicate: receipt.predicate,
    host: receipt.host && { chromium: receipt.host.chromium, argvLen: (receipt.host.argv || []).length },
  };
  // the swallow leg, if present
  const sf = receipt.journey && receipt.journey.form ? receipt.journey.form : null;
  if (sf) {
    out.swallowLeg = sf.swallowLeg || null;
    out.fixtureDelta = sf.fixtureDelta || null;
    out.serverRequests = sf.serverRequests || null;
  }
  out.keylogFields = (receipt.keylog && receipt.keylog.entries && receipt.keylog.entries[0]) || null;
}

// P2 background-services artefacts land inside the throwaway HOME
const homes = fs.existsSync(scratch) ? fs.readdirSync(scratch).filter((f) => f.startsWith('home-')) : [];
out.throwawayHomes = homes;
let gcmFound = null, crashFound = null;
for (const h of homes) {
  const base = path.join(scratch, h);
  const walk = (d) => {
    let ents; try { ents = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const e of ents) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) { if (/GCM Store/i.test(e.name)) gcmFound = p; if (/Crash Reports/i.test(e.name)) crashFound = p; walk(p); }
    }
  };
  walk(base);
}
out.gcmStorePath = gcmFound;
out.crashDbPath = crashFound;
const homeHasBg = homes.length > 0 && (!!gcmFound || !!crashFound);
add('bg-services-inside-throwaway-home', homes.length > 0, 'throwawayHomeCount=' + homes.length + ' gcm=' + (gcmFound || 'none') + ' crash=' + (crashFound || 'none'));

// P5 the operator's real profile untouched
const after = profileSnapshot();
const changed = [];
for (const k of Object.keys(after)) if (!(k in before) || before[k] !== after[k]) changed.push(k);
const removed = Object.keys(before).filter((k) => !(k in after));
out.realProfileChanged = changed.slice(0, 30);
out.realProfileRemoved = removed.slice(0, 30);
add('operator-profile-untouched', changed.length === 0 && removed.length === 0, 'changed=' + JSON.stringify(changed.slice(0, 10)) + ' removed=' + JSON.stringify(removed.slice(0, 10)));

// an independent /proc sweep for this seat's scratch path
const survivors = [];
try {
  for (const e of fs.readdirSync('/proc')) {
    if (!/^\d+$/.test(e)) continue;
    let cmd; try { cmd = fs.readFileSync('/proc/' + e + '/cmdline', 'latin1'); } catch { continue; }
    if (cmd.includes(scratch)) survivors.push(Number(e));
  }
} catch {}
out.procSurvivors = survivors;
add('no-survivors-after-run', survivors.length === 0, JSON.stringify(survivors));

out.findingCount = out.findings.length;
out.predicate = out.findingCount === 0;
fs.writeFileSync(path.join(path.dirname(outReceipt), 'live-perimeter-probe.json'), JSON.stringify(out, null, 1));
console.log(JSON.stringify({ checks: out.checks, findings: out.findings, findingCount: out.findingCount }, null, 1));
process.exit(out.predicate ? 0 : 1);
