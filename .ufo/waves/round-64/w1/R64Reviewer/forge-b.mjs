// forge-b.mjs — C1 forgery, variant B: independent of the counter's exported
// helpers. Derives the fixture geometry from the DRIVER SOURCE (bands table,
// witness table, nonce-bit rule from the template) and uses only the frozen
// PNG codec. No browser, no driver execution.
// Usage: node forge-b.mjs --driver <path> --nonce <n> --out <dir> [--origin http://127.0.0.1:PORT]
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { encode } from '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-64/counters/png-r64.mjs';

const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const driverPath = path.resolve(opt('driver'));
const nonce = opt('nonce');
const outDir = path.resolve(opt('out'));
const origin = opt('origin') || 'http://127.0.0.1:18481';

// geometry, parsed out of the pinned driver source (not executed)
const src = fs.readFileSync(driverPath, 'utf8');
const BAND_COLORS = JSON.parse(/const BAND_COLORS = (\[\[[\s\S]*?\]\]);/m.exec(src)[1]);
const WIT = JSON.parse(/const WITNESS = (\{[\s\S]*?\});/m.exec(src)[1].replace(/(\w+):/g, '"$1":'));
const CELLS = { left: 8, top: 8, cell: 4, cols: 32, rows: 8 };           // stated in driver comment + template CSS
const [W, H] = [1280, 900];
const nonceBits = Array.from(crypto.createHash('sha256').update(nonce, 'utf8').digest().subarray(0, 32))
  .flatMap((b) => Array.from({ length: 8 }, (_, k) => (b >> (7 - k)) & 1));
function drawShot(scrollY, name) {
  const px = Buffer.alloc(W * H * 4, 255);
  const put = (x, y, c) => { const i = (y * W + x) * 4; px[i] = c[0]; px[i + 1] = c[1]; px[i + 2] = c[2]; px[i + 3] = 255; };
  for (let y = 0; y < H; y++) { const c = BAND_COLORS[Math.floor((scrollY + y) / 120) % BAND_COLORS.length]; for (let x = 0; x < W; x++) put(x, y, c); }
  for (let r = 0; r < CELLS.rows; r++) for (let c = 0; c < CELLS.cols; c++) {
    const v = nonceBits[r * CELLS.cols + c] ? 255 : 0;
    for (let dy = 0; dy < CELLS.cell; dy++) for (let dx = 0; dx < CELLS.cell; dx++) put(CELLS.left + c * CELLS.cell + dx, CELLS.top + r * CELLS.cell + dy, [v, v, v]);
  }
  for (let dy = 0; dy < 50; dy++) for (let dx = 0; dx < 200; dx++) put(900 + dx, 600 + dy, WIT[name]);
  return px;
}
// render the fixture html the way the counter's renderFixture does, to bind fixtureSha256
const template = /\/\*WHEEL-FIXTURE-BEGIN\*\/[\s\S]*?const WHEEL_TEMPLATE = `([\s\S]*?)`;[\s\S]*?\/\*WHEEL-FIXTURE-END\*\//.exec(src)[1];
const bandsHtml = Array.from({ length: 25 }, (_, i) => {
  const c = BAND_COLORS[i % BAND_COLORS.length];
  return '<div class="band" style="top:' + (i * 120) + 'px;background:rgb(' + c.join(',') + ')"></div>';
}).join('');
const fixtureHtml = template.replaceAll('__NONCE__', nonce).replaceAll('__BANDS__', bandsHtml)
  .replace('const digest = window.__nonceBits;', 'const digest = ' + JSON.stringify(nonceBits) + ';');

const LEG_NAMES = ['start', 'down1', 'down2', 'up1', 'swallowed', 'released'];
const SCROLL = { start: 0, down1: 120, down2: 240, up1: 120, swallowed: 120, released: 240 };
const LEN = { start: 0, down1: 1, down2: 2, up1: 3, swallowed: 4, released: 5 };
const legs = LEG_NAMES.map((name) => {
  const buf = encode({ width: W, height: H, pixels: drawShot(SCROLL[name], name) });
  fs.writeFileSync(path.join(outDir, name + '.png'), buf);
  return { name, scrollY: SCROLL[name], wheellogLen: LEN[name], witness: name, witnessRgb: WIT[name], shot: name + '.png', shotSha256: sha(buf), shotBytes: buf.length };
});
const wheellog = [120, 120, -120, 120, 120].map((deltaY, i) => ({
  type: 'wheel', seq: i + 1, ts: 1000 + i * 700, deltaX: 0, deltaY, deltaZ: 0, deltaMode: 0,
  ctrlKey: false, shiftKey: false, altKey: false, metaKey: false, isTrusted: true, cancelable: true,
  defaultPrevented: i === 3, targetId: 'tall', scrollYAtDispatch: [0, 120, 240, 120, 120][i],
}));
const receipt = {
  schema: 'tabi-chrome-cdp-r64', nonce, nonceOnPage: nonce, driverSha256: sha(fs.readFileSync(driverPath)),
  host: { chromium: 'Chromium 155.0.8059.84 Arch Linux', cdpProduct: 'Chrome/155.0.8059.84', cdpProtocolVersion: '1.3',
    argv: ['/usr/bin/chromium', '--headless=new', '--remote-debugging-port=19482', '--remote-debugging-address=127.0.0.1',
      '--user-data-dir=/x/profile-x', '--no-first-run', '--no-default-browser-check', '--disable-background-networking',
      '--disable-component-update', '--disable-sync', '--disable-search-engine-choice-screen', '--disable-dev-shm-usage',
      '--disable-extensions', '--disable-smooth-scrolling', '--force-device-scale-factor=1', '--window-size=1280,900', 'about:blank'],
    launchToken: 'forged0' },
  fixture: { sha256: sha(Buffer.from(fixtureHtml)), origin, target: 'tall', viewport: { width: W, height: H }, deviceScaleFactor: 1, bandHeight: 120 },
  legs, wheellog, pageState: { scrollY: 240, scrollEvents: 4, wheellogLen: 5 },
  serverLog: [{ path: '/', query: 'run=' + nonce, run: nonce, status: 200 }, { path: '/favicon.ico', query: '', run: '', status: 404 }],
  sweeps: { preLaunch: 0, midRun: 3, postKill: 0 },
  teardown: { postKillSweepCount: 0, survivors: [], sweepError: null, portProbes: { fixture: 'closed', devtools: 'closed' }, postKillCurl: { fixture: 7, devtools: 7 } },
  failures: [], wheelHypothesis: 'CONFIRMED', predicate: true,
};
fs.writeFileSync(path.join(outDir, 'receipt.json'), JSON.stringify(receipt, null, 1));
console.log(JSON.stringify({ forged: 'b', nonce, fixtureSha256: receipt.fixture.sha256 }));
