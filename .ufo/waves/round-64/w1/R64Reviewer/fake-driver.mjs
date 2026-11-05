// fake-driver.mjs — attack: a stand-in for the frozen driver that never launches
// a browser. The live verifier passes --driver to BOTH the run spawn and the
// counter's --expect-driver-sha256, so any file consistent with its own bytes
// satisfies the whole chain. Honors the verifier's exact invocation:
//   node fake-driver.mjs --scratch D --out D/receipt.json --nonce N --http-port P --cdp-port Q
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { encode } from '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-64/counters/png-r64.mjs';
import { renderFixture, drawShot } from '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-64/counters/chromium-wheel-r64.mjs';

const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const out = path.resolve(opt('out'));
const outDir = path.dirname(out);
const nonce = opt('nonce');
const SELF = fileURLToPathOwn();
function fileURLToPathOwn() { return fs.realpathSync(process.argv[1]); }

const LEG_NAMES = ['start', 'down1', 'down2', 'up1', 'swallowed', 'released'];
const SCROLL = { start: 0, down1: 120, down2: 240, up1: 120, swallowed: 120, released: 240 };
const LEN = { start: 0, down1: 1, down2: 2, up1: 3, swallowed: 4, released: 5 };
const WIT = { start: [10, 20, 30], down1: [40, 50, 60], down2: [70, 80, 90], up1: [100, 110, 120], swallowed: [130, 140, 150], released: [160, 170, 180] };

const src = fs.readFileSync(SELF, 'utf8');
const fixtureHtml = renderFixture(src, nonce);   // regex needs the WHEEL-FIXTURE block: embedded below
const legs = LEG_NAMES.map((name) => {
  const buf = encode({ width: 1280, height: 900, pixels: drawShot({ nonce, scrollY: SCROLL[name], witness: name }) });
  fs.writeFileSync(path.join(outDir, name + '.png'), buf);
  return { name, scrollY: SCROLL[name], wheellogLen: LEN[name], witness: name, witnessRgb: WIT[name], shot: name + '.png', shotSha256: sha(buf), shotBytes: buf.length };
});
const wheellog = [120, 120, -120, 120, 120].map((deltaY, i) => ({
  type: 'wheel', seq: i + 1, ts: 555000 + i * 700, deltaX: 0, deltaY, deltaZ: 0, deltaMode: 0,
  ctrlKey: false, shiftKey: false, altKey: false, metaKey: false, isTrusted: true, cancelable: true,
  defaultPrevented: i === 3, targetId: 'tall', scrollYAtDispatch: [0, 120, 240, 120, 120][i],
}));
const receipt = {
  schema: 'tabi-chrome-cdp-r64', nonce, nonceOnPage: nonce, driverSha256: sha(fs.readFileSync(SELF)),
  host: { chromium: 'Chromium 155.0.8059.84 Arch Linux', cdpProduct: 'Chrome/155.0.8059.84', cdpProtocolVersion: '1.3',
    argv: ['/usr/bin/chromium', '--headless=new', '--remote-debugging-port=' + opt('cdp-port'), '--remote-debugging-address=127.0.0.1',
      '--user-data-dir=' + opt('scratch') + '/profile-x', '--no-first-run', '--no-default-browser-check', '--disable-background-networking',
      '--disable-component-update', '--disable-sync', '--disable-search-engine-choice-screen', '--disable-dev-shm-usage',
      '--disable-extensions', '--disable-smooth-scrolling', '--force-device-scale-factor=1', '--window-size=1280,900', 'about:blank'],
    launchToken: 'fake00' },
  fixture: { sha256: sha(Buffer.from(fixtureHtml)), origin: 'http://127.0.0.1:' + opt('http-port'), target: 'tall', viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1, bandHeight: 120 },
  legs, wheellog, pageState: { scrollY: 240, scrollEvents: 4, wheellogLen: 5 },
  serverLog: [{ path: '/', query: 'run=' + nonce, run: nonce, status: 200 }, { path: '/favicon.ico', query: '', run: '', status: 404 }],
  sweeps: { preLaunch: 0, midRun: 3, postKill: 0 },
  teardown: { postKillSweepCount: 0, survivors: [], sweepError: null, portProbes: { fixture: 'closed', devtools: 'closed' }, postKillCurl: { fixture: 7, devtools: 7 } },
  failures: [], wheelHypothesis: 'CONFIRMED', predicate: true,
};
fs.writeFileSync(out, JSON.stringify(receipt, null, 1));
console.error('fake-driver: no browser was launched; receipt synthesized for nonce ' + nonce);
process.exit(0);

/*WHEEL-FIXTURE-BEGIN*/
const WHEEL_TEMPLATE = `<!doctype html><html><head><title>fake</title></head><body><p id="nonce">__NONCE__</p><div id="noncegrid"></div><div id="tall">__BANDS__</div><script>const digest = window.__nonceBits;</script></body></html>`;
/*WHEEL-FIXTURE-END*/
