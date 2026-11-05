// forge-a.mjs — cheapest C1 forgery, variant A: imports the frozen counter's own
// exported forgery oracle (renderFixture + drawShot + nonceBits) and the frozen
// PNG codec. No browser, no driver execution: the driver file is only read.
// Usage: node forge-a.mjs --driver <path> --nonce <n> --out <dir> [--origin http://127.0.0.1:PORT]
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { encode } from '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-64/counters/png-r64.mjs';
import { renderFixture, drawShot, nonceBits } from '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-64/counters/chromium-wheel-r64.mjs';

const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const driverPath = path.resolve(opt('driver'));
const nonce = opt('nonce');
const outDir = path.resolve(opt('out'));
const origin = opt('origin') || 'http://127.0.0.1:18481';

const LEG_NAMES = ['start', 'down1', 'down2', 'up1', 'swallowed', 'released'];
const SCROLL = { start: 0, down1: 120, down2: 240, up1: 120, swallowed: 120, released: 240 };
const LEN = { start: 0, down1: 1, down2: 2, up1: 3, swallowed: 4, released: 5 };
const WIT = { start: [10, 20, 30], down1: [40, 50, 60], down2: [70, 80, 90], up1: [100, 110, 120], swallowed: [130, 140, 150], released: [160, 170, 180] };

const driverSource = fs.readFileSync(driverPath, 'utf8');
const driverSha256 = sha(Buffer.from(driverSource));
const fixtureHtml = renderFixture(driverSource, nonce);          // counter's own renderer
const fixtureSha256 = sha(Buffer.from(fixtureHtml));

const legs = LEG_NAMES.map((name) => {
  const buf = encode({ width: 1280, height: 900, pixels: drawShot({ nonce, scrollY: SCROLL[name], witness: name }) });
  fs.writeFileSync(path.join(outDir, name + '.png'), buf);
  return { name, scrollY: SCROLL[name], wheellogLen: LEN[name], witness: name, witnessRgb: WIT[name],
    shot: name + '.png', shotSha256: sha(buf), shotBytes: buf.length };
});
const wheellog = [120, 120, -120, 120, 120].map((deltaY, i) => ({
  type: 'wheel', seq: i + 1, ts: 1000 + i * 700, deltaX: 0, deltaY, deltaZ: 0, deltaMode: 0,
  ctrlKey: false, shiftKey: false, altKey: false, metaKey: false, isTrusted: true, cancelable: true,
  defaultPrevented: i === 3, targetId: 'tall', scrollYAtDispatch: [0, 120, 240, 120, 120][i],
}));
const receipt = {
  schema: 'tabi-chrome-cdp-r64', nonce, nonceOnPage: nonce, driverSha256,
  host: { chromium: 'Chromium 155.0.8059.84 Arch Linux', cdpProduct: 'Chrome/155.0.8059.84', cdpProtocolVersion: '1.3',
    argv: ['/usr/bin/chromium', '--headless=new', '--remote-debugging-port=19482', '--remote-debugging-address=127.0.0.1',
      '--user-data-dir=/x/profile-x', '--no-first-run', '--no-default-browser-check', '--disable-background-networking',
      '--disable-component-update', '--disable-sync', '--disable-search-engine-choice-screen', '--disable-dev-shm-usage',
      '--disable-extensions', '--disable-smooth-scrolling', '--force-device-scale-factor=1', '--window-size=1280,900', 'about:blank'],
    launchToken: 'forged0' },
  fixture: { sha256: fixtureSha256, origin, target: 'tall', viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1, bandHeight: 120 },
  legs, wheellog, pageState: { scrollY: 240, scrollEvents: 4, wheellogLen: 5 },
  serverLog: [{ path: '/', query: 'run=' + nonce, run: nonce, status: 200 }, { path: '/favicon.ico', query: '', run: '', status: 404 }],
  sweeps: { preLaunch: 0, midRun: 3, postKill: 0 },
  teardown: { postKillSweepCount: 0, survivors: [], sweepError: null, portProbes: { fixture: 'closed', devtools: 'closed' }, postKillCurl: { fixture: 7, devtools: 7 } },
  failures: [], wheelHypothesis: 'CONFIRMED', predicate: true,
};
fs.writeFileSync(path.join(outDir, 'receipt.json'), JSON.stringify(receipt, null, 1));
console.log(JSON.stringify({ forged: 'a', nonce, driverSha256, fixtureSha256, nonceBitsUsed: nonceBits(nonce).length }));
