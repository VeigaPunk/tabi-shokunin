#!/usr/bin/env node
// R63Critic do-nothing control: hand-author a complete r63 receipt with NO
// browser run at all, then let the production CLI judge it.
//
// usage: fabricate.mjs --driver <frozen driver> --out <dir> --nonce <nonce>
//                      [--borrow <dir of real pngs>] [--empty]
// Writes: <out>/receipt-tiny.json     (steps = four 1x1 PNGs written here)
//         <out>/receipt-borrow.json   (steps = shas of <borrow>/*.png, if given)
//         <out>/shots-tiny/*.png      (70-byte 1x1 PNGs, no page was rendered)
// Fields outside steps are authored from prose, not copied from any receipt.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const args = process.argv.slice(2);
const opt = (n) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : null; };
const driver = opt('driver'), out = opt('out'), nonce = opt('nonce'), borrow = opt('borrow');
const pin = opt('pin');
if (!driver || !out || !nonce || !pin) { console.error('usage: fabricate --driver --out --nonce --pin [--borrow]'); process.exit(2); }
// fixture hash derivation identical to the frozen counter's main().
const src = fs.readFileSync(driver, 'utf8');
const begin = '/*WHEEL-FIXTURE-BEGIN*/', end = '/*WHEEL-FIXTURE-END*/';
const block = src.slice(src.indexOf(begin), src.indexOf(end));
const match = /const WHEEL_HTML = `([\s\S]*?)`;/.exec(block);
if (!match) { console.error('fixture template absent'); process.exit(2); }
const fixtureSha = sha(match[1].replace('${nonce}', nonce));
fs.mkdirSync(out, { recursive: true });
const tinyDir = path.join(out, 'shots-tiny');
fs.mkdirSync(tinyDir, { recursive: true });
const PNG1x1 = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
const stepNames = ['a-wheel-down', 'b-wheel-up', 'c-swallow', 'd-release'];
const tinySteps = stepNames.map((name) => {
  fs.writeFileSync(path.join(tinyDir, name + '.png'), PNG1x1);
  return { name, png: name + '.png', sha256: sha(PNG1x1), bytes: PNG1x1.length };
});
const base = (steps) => ({
  schema: 'tabi-chrome-cdp-r63',
  nonce,
  driverSha256: pin,
  host: { chromium: 'Chromium 155.0.8059.84 Arch Linux', argv: ['/usr/bin/chromium', '--headless=new', '--remote-debugging-port=1', '--remote-debugging-address=127.0.0.1', '--user-data-dir=/nonexistent/fabricated-profile', '--disable-extensions', '--disable-smooth-scrolling', '--window-size=1280,900', 'about:blank'], launchToken: 'fabricated' },
  fixture: { sha256: fixtureSha, origin: 'http://127.0.0.1:1', target: 'tall', viewport: { width: 1280, height: 900 } },
  nonceOnPage: nonce,
  legs: [
    { name: 'start', scrollY: 0, wheellogLen: 0 },
    { name: 'down1', scrollY: 120, wheellogLen: 1 },
    { name: 'down2', scrollY: 240, wheellogLen: 2 },
    { name: 'up1', scrollY: 120, wheellogLen: 3 },
    { name: 'swallowed', scrollY: 120, wheellogLen: 4 },
    { name: 'released', scrollY: 240, wheellogLen: 5 },
  ],
  wheellog: [120, 120, -120, 120, 120].map((deltaY, i) => ({
    type: 'wheel', seq: i + 1, ts: 1 + i, deltaX: 0, deltaY, deltaZ: 0, deltaMode: 0,
    ctrlKey: false, shiftKey: false, altKey: false, metaKey: false,
    isTrusted: true, cancelable: true, defaultPrevented: i === 3,
    targetId: 'tall', scrollYAtDispatch: [0, 120, 240, 120, 120][i],
  })),
  declaredStepNames: stepNames,
  steps,
  pageState: { scrollY: 240, scrollEvents: 4, wheellogLen: 5 },
  serverLog: [{ path: '/', query: '' }, { path: '/favicon.ico', query: '' }],
  teardown: { postKillSweepCount: 0, survivors: [], portProbes: { fixture: 'closed', devtools: 'closed' }, postKillCurl: { fixture: 7, devtools: 7 } },
  sweeps: { preLaunch: 0, midRun: 1, postKill: 0 },
  failures: [],
  wheelHypothesis: 'CONFIRMED',
  predicate: true,
});
fs.writeFileSync(path.join(out, 'receipt-tiny.json'), JSON.stringify(base(tinySteps), null, 1));
let borrowSteps = null;
if (borrow) {
  borrowSteps = stepNames.map((name) => {
    const b = fs.readFileSync(path.join(borrow, name + '.png'));
    return { name, png: name + '.png', sha256: sha(b), bytes: b.length };
  });
  fs.writeFileSync(path.join(out, 'receipt-borrow.json'), JSON.stringify(base(borrowSteps), null, 1));
}
console.log(JSON.stringify({
  schema: 'tabi-r63-critic-fabrication-v1', nonce, fixtureSha,
  tinyPng: { bytes: PNG1x1.length, sha256: sha(PNG1x1) },
  tinySteps, borrowSteps,
  files: fs.readdirSync(out).sort(),
}, null, 1));
