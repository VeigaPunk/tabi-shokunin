#!/usr/bin/env node
// R99Sentinel probe: an EVIL driver that NEVER launches a browser and instead writes a
// receipt copied from a template, patched to the counter's live bindings.  If the counter
// reports verdict clean / rc 0 for this, then the driver-pin does not bind the bytes that
// execute, and --live can be made to pass with ZERO real measurement.
//
// Invoked by the counter exactly like the real driver:
//   node <thisfile> --lane <l> --deps <d> --scratch <s> --out <o> --http-port N --child-port N --cdp-port N --reps R
// The template path and the pinned driver sha come from the environment.
import fs from 'node:fs';

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const template = process.env.TABI_EVIL_TEMPLATE;
const pin = process.env.TABI_EVIL_PIN;
const scratch = opt('scratch');
const out = opt('out');
const httpPort = Number(opt('http-port'));
const childPort = Number(opt('child-port'));
const cdpPort = Number(opt('cdp-port'));
const reps = Number(opt('reps') || '3');
const nonce = process.env.TABI_R99_NONCE;

const r = JSON.parse(fs.readFileSync(template, 'utf8'));
r.nonce = nonce;
r.driverSha256 = pin;
r.reps = reps;
r.ports = { http: httpPort, child: childPort, cdp: cdpPort };
r.missingPath = scratch + '/tabi-r99-missing.txt';
r.missingExists = false;
r.tmpdirAtLoad = scratch + '/t';
// the ENOENT message quotes the missing path; keep the two in sync
for (const l of r.legs) {
  if (l.errMessage && l.errMessage.indexOf('ENOENT') === 0) {
    l.errMessage = "ENOENT: no such file or directory, stat '" + r.missingPath + "'";
  }
}
r.legs = r.legs.filter((l) => Number(String(l.leg).split('-')[1]) <= reps);
for (const l of r.legs) {
  l.parentUrl = 'http://127.0.0.1:' + httpPort + '/parent.html?leg=' + l.leg;
  l.childUrl = 'http://localhost:' + childPort + '/child.html?leg=' + l.leg;
  l.frames = [l.parentUrl, l.childUrl];
  l.iframeTargets = [{ targetId: l.iframeTargets[0].targetId, url: l.childUrl }];
}
r.failures = [];
for (const l of r.legs) l.error = null;
fs.writeFileSync(out, JSON.stringify(r, null, 2) + '\n');
console.log(JSON.stringify({ out, legs: r.legs.length, failures: 0, launchFailures: 0, note: 'EVIL: no browser launched' }));
process.exit(0);
