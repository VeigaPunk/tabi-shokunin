#!/usr/bin/env node
// Frozen r64 counter. Scope: the round-64 wheel/scroll receipt on Chromium/Linux
// (six page-side wheel events over five legs, exact scroll arithmetic, one
// swallowed leg with its released positive control) PLUS the run binding the r63
// generation lacked: the committed PNG bytes must decode to a rendering of this
// fixture at this leg (nonce grid, 120 px band colours, per-leg witness strip),
// the fixture must be the exact render of the pinned driver for the receipt's
// nonce, the origin must be bound to the run through the server log, and the
// browser identity must come from CDP Browser.getVersion.
//
// Generation note (round 64): a NEW generation, not a repair of r63. Every named
// check has a declared negative (counters/make-negatives-r64.mjs) and the
// exact-line mutation matrix lives at counters/mutate-r64.mjs. The r63 generation
// accepted a hand-written receipt with four 1x1 PNGs; this one refuses it on
// shot-bytes/nonce-pixels/scroll-pixels/leg-witness.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import os from 'node:os';
import { decode, encode } from './png-r64.mjs';

const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const SCHEMA = 'tabi-chrome-cdp-r64';
const LEG_NAMES = ['start', 'down1', 'down2', 'up1', 'swallowed', 'released'];
const EXPECTED_SCROLL = { start: 0, down1: 120, down2: 240, up1: 120, swallowed: 120, released: 240 };
const EXPECTED_LEN = { start: 0, down1: 1, down2: 2, up1: 3, swallowed: 4, released: 5 };
const EXPECTED_DELTA_Y = [120, 120, -120, 120, 120];
const EXPECTED_AT_DISPATCH = [0, 120, 240, 120, 120];
const LEG_WITNESS = {
  start: [10, 20, 30], down1: [40, 50, 60], down2: [70, 80, 90],
  up1: [100, 110, 120], swallowed: [130, 140, 150], released: [160, 170, 180],
};
const VIEWPORT = { width: 1280, height: 900 };
const BAND_HEIGHT = 120;
const BAND_COUNT = 25;
const BAND_COLORS = [[255, 0, 0], [0, 128, 0], [0, 0, 255], [255, 255, 0], [255, 0, 255], [0, 255, 255]];
const GRID = { left: 8, top: 8, cell: 4, cols: 32, rows: 8 };
const WITNESS_POINT = { x: 1000, y: 625 };
const BAND_SAMPLE_X = 1000;
const BAND_SAMPLE_Y = [60, 180, 300, 420];
const REQUIRED_ARGV = ['--headless=new', '--disable-extensions', '--remote-debugging-address=127.0.0.1', '--disable-smooth-scrolling', '--force-device-scale-factor=1'];

export const CHECK_IDS = [
  'schema', 'nonce-binding', 'driver-binding', 'fixture-binding', 'loopback-origin',
  'launch-guards', 'legs-shape', 'scroll-arithmetic', 'wheellog-count',
  'wheellog-sequence', 'delta-y-passthrough', 'delta-mode-pixels', 'trusted-fields',
  'cancelation', 'target-binding', 'scroll-event-witness', 'shot-records',
  'shot-bytes', 'nonce-pixels', 'scroll-pixels', 'leg-witness', 'server-witness',
  'host-identity', 'survivors', 'closed-ports', 'launch-witness', 'failures',
  'producer-verdict', 'page-final-state',
];

export function nonceBits(nonce) {
  return Array.from(crypto.createHash('sha256').update(nonce, 'utf8').digest().subarray(0, 32))
    .flatMap((byte) => Array.from({ length: 8 }, (_, k) => (byte >> (7 - k)) & 1));
}

export function expectedBandColor(scrollY, k) {
  const docY = scrollY + BAND_SAMPLE_Y[k];
  const index = Math.floor(docY / BAND_HEIGHT);
  return BAND_COLORS[index % BAND_COLORS.length];
}

export function renderFixture(driverSource, nonce) {
  const m = /\/\*WHEEL-FIXTURE-BEGIN\*\/[\s\S]*?const WHEEL_TEMPLATE = `([\s\S]*?)`;[\s\S]*?\/\*WHEEL-FIXTURE-END\*\//.exec(driverSource);
  if (!m) throw new Error('fixture template not found in driver source');
  const bandsHtml = Array.from({ length: BAND_COUNT }, (_, i) => {
    const c = BAND_COLORS[i % BAND_COLORS.length];
    return '<div class="band" style="top:' + (i * BAND_HEIGHT) + 'px;background:rgb(' + c.join(',') + ')"></div>';
  }).join('');
  return m[1]
    .replaceAll('__NONCE__', nonce)
    .replaceAll('__BANDS__', bandsHtml)
    .replace('const digest = window.__nonceBits;', 'const digest = ' + JSON.stringify(nonceBits(nonce)) + ';');
}

// external: { driverSha256, fixtureSha256, shots: { <name>: { sha256, bytes, width, height, pixel(x,y) } | null } }
export function verify(r, external = {}) {
  const findings = [];
  const check = (ok, id) => { if (!ok) findings.push(id); };
  const legs = Array.isArray(r?.legs) ? r.legs : [];
  const legMap = Object.fromEntries(legs.map((l) => [l.name, l]));
  const wl = Array.isArray(r?.wheellog) ? r.wheellog : [];
  const shots = external.shots || {};
  const shotOf = (name) => shots[name] || null;
  const at = (shot, x, y) => {
    if (!shot || !Number.isInteger(x) || !Number.isInteger(y)) return null;
    if (x < 0 || y < 0 || x >= shot.width || y >= shot.height) return null;
    return shot.pixel(x, y);
  };
  const rgbEq = (a, b) => Array.isArray(a) && a[0] === b[0] && a[1] === b[1] && a[2] === b[2];

  check(r?.schema === SCHEMA, 'schema');
  check(/^tabi-r64-[a-z0-9-]+$/.test(r?.nonce || '') && r.nonceOnPage === r.nonce, 'nonce-binding');
  check(/^[a-f0-9]{64}$/.test(r?.driverSha256 || '') && r.driverSha256 === external.driverSha256, 'driver-binding');
  check(/^[a-f0-9]{64}$/.test(r?.fixture?.sha256 || '') && r.fixture.sha256 === external.fixtureSha256, 'fixture-binding');
  check(/^http:\/\/127\.0\.0\.1:[0-9]+$/.test(r?.fixture?.origin || '') && r?.fixture?.target === 'tall'
    && r?.fixture?.viewport?.width === VIEWPORT.width && r?.fixture?.viewport?.height === VIEWPORT.height
    && r?.fixture?.deviceScaleFactor === 1 && r?.fixture?.bandHeight === BAND_HEIGHT, 'loopback-origin');
  check(Array.isArray(r?.host?.argv) && REQUIRED_ARGV.every((a) => r.host.argv.includes(a)), 'launch-guards');
  check(legs.length === 6 && LEG_NAMES.every((n, i) => legs[i]?.name === n), 'legs-shape');
  check(LEG_NAMES.every((k) => Math.abs(legMap[k]?.scrollY - EXPECTED_SCROLL[k]) <= 60), 'scroll-arithmetic');
  check(LEG_NAMES.every((k) => legMap[k]?.wheellogLen === EXPECTED_LEN[k]), 'wheellog-count');
  check(wl.length === 5 && wl.every((e, i) => e.seq === i + 1) && new Set(wl.map((e) => e.seq)).size === 5, 'wheellog-sequence');
  check(wl.length === 5 && wl.every((e, i) => e.deltaY === EXPECTED_DELTA_Y[i]), 'delta-y-passthrough');
  check(wl.length === 5 && wl.every((e) => e.deltaX === 0 && e.deltaZ === 0 && e.deltaMode === 0), 'delta-mode-pixels');
  check(wl.length === 5 && wl.every((e) => e.type === 'wheel' && e.isTrusted === true && Number.isFinite(e.ts) && e.ts >= 0 && e.cancelable === true
    && e.ctrlKey === false && e.shiftKey === false && e.altKey === false && e.metaKey === false), 'trusted-fields');
  check(wl.length === 5 && wl.every((e, i) => e.defaultPrevented === (i === 3)), 'cancelation');
  check(wl.length === 5 && wl.every((e, i) => e.targetId === 'tall' && e.scrollYAtDispatch === EXPECTED_AT_DISPATCH[i]), 'target-binding');
  // r63 W3: the scroll witness must equal the number of wheels that actually scrolled,
  // not merely sit in 1..5 — a page-side contradiction is refused.
  check(wl.length === 5 && r?.pageState?.scrollEvents === wl.filter((e) => !e.defaultPrevented).length, 'scroll-event-witness');
  check(legs.length === 6 && legs.every((l) => l.shot === l.name + '.png' && /^[a-f0-9]{64}$/.test(l.shotSha256 || '') && Number.isInteger(l.shotBytes) && l.shotBytes > 0), 'shot-records');
  check(legs.length === 6 && legs.every((l) => {
    const s = shotOf(l.name);
    return s && s.width === VIEWPORT.width && s.height === VIEWPORT.height && s.sha256 === l.shotSha256 && s.bytes === l.shotBytes;
  }), 'shot-bytes');
  const bits = r?.nonce ? nonceBits(r.nonce) : [];
  check(legs.length === 6 && legs.every((l) => {
    const s = shotOf(l.name);
    if (!s) return false;
    for (let row = 0; row < GRID.rows; row++) {
      for (let col = 0; col < GRID.cols; col++) {
        const p = at(s, GRID.left + col * GRID.cell + 2, GRID.top + row * GRID.cell + 2);
        const want = bits[row * GRID.cols + col] ? 255 : 0;
        if (!p || p[0] !== want || p[1] !== want || p[2] !== want) return false;
      }
    }
    return true;
  }), 'nonce-pixels');
  check(legs.length === 6 && legs.every((l) => {
    const s = shotOf(l.name);
    if (!s) return false;
    return BAND_SAMPLE_Y.every((y, k) => rgbEq(at(s, BAND_SAMPLE_X, y), expectedBandColor(l.scrollY, k)));
  }), 'scroll-pixels');
  check(legs.length === 6 && legs.every((l) => {
    const s = shotOf(l.name);
    const want = LEG_WITNESS[l.name];
    return want && rgbEq(l.witnessRgb, want) && l.witness === l.name && rgbEq(at(s, WITNESS_POINT.x, WITNESS_POINT.y), want);
  }), 'leg-witness');
  check(Array.isArray(r?.serverLog) && r.serverLog.some((e) => e.path === '/' && e.status === 200 && e.run === r?.nonce)
    && r.serverLog.every((e) => ['/', '/favicon.ico'].includes(e.path)), 'server-witness');
  check(/^Chrome\/1[0-9]{2}\./.test(r?.host?.cdpProduct || '') && /^Chromium 1[0-9]{2}\./.test(r?.host?.chromium || '')
    && r.host.chromium.split(' ')[1]?.split('.')[0] === r.host.cdpProduct.split('/')[1]?.split('.')[0], 'host-identity');
  check(r?.teardown?.postKillSweepCount === 0 && Array.isArray(r.teardown.survivors) && r.teardown.survivors.length === 0 && r.teardown.sweepError === null, 'survivors');
  check(r?.teardown?.portProbes?.fixture === 'closed' && r.teardown.portProbes.devtools === 'closed'
    && r?.teardown?.postKillCurl?.fixture === 7 && r.teardown.postKillCurl.devtools === 7, 'closed-ports');
  check(r?.sweeps?.preLaunch === 0 && r.sweeps.midRun > 0 && r.sweeps.postKill === 0, 'launch-witness');
  check(Array.isArray(r?.failures) && r.failures.length === 0, 'failures');
  check(r?.predicate === true && r?.wheelHypothesis === 'CONFIRMED', 'producer-verdict');
  check(r?.pageState?.scrollY === 240 && r?.pageState?.wheellogLen === 5, 'page-final-state');
  return { schema: 'tabi-r64-wheel-counter', predicate: findings.length === 0, findingCount: findings.length, findings };
}

// ---------- selftest: an independently drawn synthetic rendering ----------
export function drawShot({ nonce, scrollY, witness }) {
  const pixels = Buffer.alloc(VIEWPORT.width * VIEWPORT.height * 4, 255);
  const put = (x, y, rgb) => { const i = (y * VIEWPORT.width + x) * 4; pixels[i] = rgb[0]; pixels[i + 1] = rgb[1]; pixels[i + 2] = rgb[2]; pixels[i + 3] = 255; };
  for (let y = 0; y < VIEWPORT.height; y++) {
    const band = Math.floor((scrollY + y) / BAND_HEIGHT);
    const c = BAND_COLORS[band % BAND_COLORS.length];
    for (let x = 0; x < VIEWPORT.width; x++) put(x, y, c);
  }
  const bits = nonceBits(nonce);
  for (let row = 0; row < GRID.rows; row++) for (let col = 0; col < GRID.cols; col++) {
    const v = bits[row * GRID.cols + col] ? 255 : 0;
    for (let dy = 0; dy < GRID.cell; dy++) for (let dx = 0; dx < GRID.cell; dx++) put(GRID.left + col * GRID.cell + dx, GRID.top + row * GRID.cell + dy, [v, v, v]);
  }
  for (let dy = 0; dy < 50; dy++) for (let dx = 0; dx < 200; dx++) put(900 + dx, 600 + dy, LEG_WITNESS[witness]);
  return pixels;
}
function shotInfo(buf) {
  const d = decode(buf);
  return { sha256: sha(buf), bytes: buf.length, width: d.width, height: d.height, pixel: (x, y) => d.pixel(x, y), pixels: d.pixels };
}
function synthetic() {
  const nonce = 'tabi-r64-test';
  const legs = LEG_NAMES.map((name) => ({ name, scrollY: EXPECTED_SCROLL[name], wheellogLen: EXPECTED_LEN[name], witness: name, witnessRgb: LEG_WITNESS[name], shot: name + '.png', shotSha256: 'c'.repeat(64), shotBytes: 10 }));
  const wl = EXPECTED_DELTA_Y.map((deltaY, i) => ({
    type: 'wheel', seq: i + 1, ts: 10 + i, deltaX: 0, deltaY, deltaZ: 0, deltaMode: 0,
    ctrlKey: false, shiftKey: false, altKey: false, metaKey: false, isTrusted: true, cancelable: true,
    defaultPrevented: i === 3, targetId: 'tall', scrollYAtDispatch: EXPECTED_AT_DISPATCH[i],
  }));
  return {
    schema: SCHEMA, nonce, nonceOnPage: nonce, driverSha256: 'a'.repeat(64),
    host: { chromium: 'Chromium 155.0.8059.84 Arch Linux', cdpProduct: 'Chrome/155.0.8059.84', cdpProtocolVersion: '1.3', argv: REQUIRED_ARGV.slice(), launchToken: 'x' },
    fixture: { sha256: 'b'.repeat(64), origin: 'http://127.0.0.1:19471', target: 'tall', viewport: VIEWPORT, deviceScaleFactor: 1, bandHeight: BAND_HEIGHT },
    legs, wheellog: wl, pageState: { scrollY: 240, scrollEvents: 4, wheellogLen: 5 },
    serverLog: [{ path: '/', query: 'run=' + nonce, run: nonce, status: 200 }, { path: '/favicon.ico', query: '', run: '', status: 404 }],
    sweeps: { preLaunch: 0, midRun: 3, postKill: 0 },
    teardown: { postKillSweepCount: 0, survivors: [], sweepError: null, portProbes: { fixture: 'closed', devtools: 'closed' }, postKillCurl: { fixture: 7, devtools: 7 } },
    failures: [], wheelHypothesis: 'CONFIRMED', predicate: true,
  };
}
function goodShots(receipt) {
  const shots = {};
  for (const l of receipt.legs) {
    const buf = encode({ width: VIEWPORT.width, height: VIEWPORT.height, pixels: drawShot({ nonce: receipt.nonce, scrollY: l.scrollY, witness: l.name }) });
    const info = shotInfo(buf);
    l.shotSha256 = info.sha256;
    l.shotBytes = info.bytes;
    shots[l.name] = info;
  }
  return shots;
}

export function selftest(scratchDir) {
  const results = [];
  const run = (id, mutate) => {
    const r = JSON.parse(JSON.stringify(synthetic()));
    const shots = goodShots(r);
    const ext = { driverSha256: 'a'.repeat(64), fixtureSha256: 'b'.repeat(64), shots };
    const expect = mutate(r, shots, ext);
    const got = verify(r, ext);
    results.push({ id, expect, findings: got.findings, ok: expect === null ? got.findings.length === 0 : got.findings.includes(expect) });
  };
  run('clean', () => null);
  for (const id of CHECK_IDS) run('neg-' + id, (r, shots) => forge(id, r, shots));
  // positive control: a blanket refusal would fail this
  const posReceipt = synthetic();
  const posShots = goodShots(posReceipt);
  const clean = verify(posReceipt, { driverSha256: 'a'.repeat(64), fixtureSha256: 'b'.repeat(64), shots: posShots });
  results.push({ id: 'positive-control-accepted', expect: null, findings: clean.findings, ok: clean.findings.length === 0 });
  const passed = results.filter((x) => x.ok).length;
  if (scratchDir) fs.mkdirSync(scratchDir, { recursive: true });
  return { verdict: passed === results.length ? 'clean' : 'red', cases: results.length, passed, results };
}

export function forge(id, r, shots) {
  const setWl = (i, patch) => Object.assign(r.wheellog[i], patch);
  const repaint = (name, x, y, rgb) => {
    const s = shots[name];
    const px = Buffer.alloc(s.width * s.height * 4);
    for (let yy = 0; yy < s.height; yy++) for (let xx = 0; xx < s.width; xx++) {
      const p = s.pixel(xx, yy); const i = (yy * s.width + xx) * 4;
      px[i] = p[0]; px[i + 1] = p[1]; px[i + 2] = p[2]; px[i + 3] = p[3];
    }
    const i = (y * s.width + x) * 4;
    px[i] = rgb[0]; px[i + 1] = rgb[1]; px[i + 2] = rgb[2]; px[i + 3] = 255;
    const buf = encode({ width: s.width, height: s.height, pixels: px });
    const info = shotInfo(buf);
    shots[name] = info;
    const leg = r.legs.find((l) => l.name === name);
    leg.shotSha256 = info.sha256;
    leg.shotBytes = info.bytes;
    return info;
  };
  switch (id) {
    case 'schema': r.schema = 'tabi-chrome-cdp-r63'; return 'schema';
    case 'nonce-binding': r.nonceOnPage = 'tabi-r64-other'; return 'nonce-binding';
    case 'driver-binding': r.driverSha256 = 'd'.repeat(64); return 'driver-binding';
    case 'fixture-binding': r.fixture.sha256 = 'e'.repeat(64); return 'fixture-binding';
    case 'loopback-origin': r.fixture.origin = 'http://10.0.0.1:19471'; return 'loopback-origin';
    case 'launch-guards': r.host.argv = r.host.argv.filter((a) => a !== '--disable-smooth-scrolling'); return 'launch-guards';
    case 'legs-shape': r.legs[1].name = 'downX'; return 'legs-shape';
    case 'scroll-arithmetic': r.legs[2].scrollY = 180; return 'scroll-arithmetic';
    case 'wheellog-count': r.legs[4].wheellogLen = 5; return 'wheellog-count';
    case 'wheellog-sequence': setWl(4, { seq: 4 }); return 'wheellog-sequence';
    case 'delta-y-passthrough': setWl(1, { deltaY: 60 }); return 'delta-y-passthrough';
    case 'delta-mode-pixels': setWl(3, { deltaMode: 1 }); return 'delta-mode-pixels';
    case 'trusted-fields': setWl(2, { isTrusted: false }); return 'trusted-fields';
    // Isolated: the non-prevented count stays 4 (index 0 flips to prevented), so
    // only the per-index cancelation rule can refuse this receipt.
    case 'cancelation': setWl(3, { defaultPrevented: false }); setWl(0, { defaultPrevented: true }); return 'cancelation';
    case 'target-binding': setWl(0, { scrollYAtDispatch: 7 }); return 'target-binding';
    case 'scroll-event-witness': r.pageState.scrollEvents = 5; return 'scroll-event-witness';
    case 'shot-records': r.legs[5].shot = 'other.png'; return 'shot-records';
    // Isolated: the shot bytes stay a real rendering; only the recorded digest
    // is a lie, so no pixel check can see it. The 1x1-PNG class is covered by the
    // committed red-one-by-one control, not by this negative.
    case 'shot-bytes': {
      r.legs[0].shotSha256 = 'f'.repeat(64);
      return 'shot-bytes';
    }
    case 'nonce-pixels': {
      const bit0 = nonceBits(r.nonce)[0];
      repaint('down1', GRID.left + 2, GRID.top + 2, bit0 ? [0, 0, 0] : [255, 255, 255]);
      return 'nonce-pixels';
    }
    case 'scroll-pixels': repaint('up1', BAND_SAMPLE_X, BAND_SAMPLE_Y[0], [1, 2, 3]); return 'scroll-pixels';
    case 'leg-witness': repaint('released', WITNESS_POINT.x, WITNESS_POINT.y, [0, 0, 0]); return 'leg-witness';
    case 'server-witness': r.serverLog = r.serverLog.map((e) => ({ ...e, run: e.path === '/' ? 'tabi-r64-other' : e.run })); return 'server-witness';
    case 'host-identity': r.host.cdpProduct = 'HeadlessChrome/99.0.0.0'; return 'host-identity';
    case 'survivors': r.teardown.sweepError = 'ps exited 1'; return 'survivors';
    case 'closed-ports': r.teardown.postKillCurl.fixture = 0; return 'closed-ports';
    case 'launch-witness': r.sweeps.midRun = 0; return 'launch-witness';
    case 'failures': r.failures = [{ id: 'x', detail: 'y' }]; return 'failures';
    case 'producer-verdict': r.predicate = false; return 'producer-verdict';
    case 'page-final-state': r.pageState.scrollY = 120; return 'page-final-state';
    default: throw new Error('no forge for ' + id);
  }
}

// ---------- CLI ----------
function main() {
  const argv = process.argv.slice(2);
  const flags = new Map();
  const bare = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) { flags.set(argv[i].slice(2), next); i++; } else flags.set(argv[i].slice(2), true);
    } else bare.push(argv[i]);
  }
  const opt = (n) => (flags.get(n) === true ? null : flags.get(n) || null);
  const json = flags.has('json');
  if (flags.has('selftest')) {
    const scratch = opt('scratch');
    if (!scratch || !path.isAbsolute(scratch)) {
      console.log(JSON.stringify({ schema: 'tabi-r64-wheel-counter', error: 'usage', detail: '--selftest requires an absolute --scratch (no /tmp default)' }));
      process.exitCode = 2;
      return;
    }
    const out = selftest(scratch);
    if (json) console.log(JSON.stringify(out, null, 1));
    else {
      for (const r of out.results.filter((x) => !x.ok)) console.log('FAIL ' + r.id + ' expect=' + r.expect + ' findings=' + JSON.stringify(r.findings));
      console.log('TABI_R64_COUNTER_SELFTEST verdict=' + out.verdict + ' cases=' + out.cases + ' passed=' + out.passed);
    }
    process.exitCode = out.verdict === 'clean' ? 0 : 1;
    return;
  }
  const receiptPath = bare[0];
  const driverPath = opt('driver');
  const expectDriver = opt('expect-driver-sha256');
  const shotDir = opt('shot');
  const refuse = (detail) => { console.log(JSON.stringify({ schema: 'tabi-r64-wheel-counter', error: 'usage', detail })); process.exitCode = 2; };
  if (!receiptPath || !driverPath || !expectDriver || !shotDir) return refuse('need <receipt> --driver <path> --expect-driver-sha256 <hex> --shot <dir>');
  if (!/^[a-f0-9]{64}$/.test(expectDriver)) return refuse('--expect-driver-sha256 must be 64 hex chars');
  let receipt;
  try { receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8')); } catch (e) { return refuse('receipt unreadable: ' + e.message); }
  let driverSource;
  try { driverSource = fs.readFileSync(driverPath, 'utf8'); } catch (e) { return refuse('driver unreadable: ' + e.message); }
  const driverSha256 = sha(Buffer.from(driverSource));
  let fixtureSha256 = null;
  try { fixtureSha256 = sha(Buffer.from(renderFixture(driverSource, receipt?.nonce || ''))); } catch { fixtureSha256 = null; }
  const shots = {};
  for (const leg of Array.isArray(receipt?.legs) ? receipt.legs : []) {
    const p = path.join(shotDir, String(leg?.shot || ''));
    try {
      const buf = fs.readFileSync(p);
      shots[leg.name] = shotInfo(buf);
    } catch { shots[leg.name] = null; }
  }
  const result = verify(receipt, { driverSha256, fixtureSha256, shots });
  if (json) console.log(JSON.stringify({ ...result, checks: CHECK_IDS.length, driverSha256, fixtureSha256 }, null, 1));
  else console.log('TABI_R64_COUNTER predicate=' + result.predicate + ' findings=' + result.findingCount + (result.findingCount ? ' ids=' + result.findings.join(',') : ''));
  process.exitCode = result.predicate ? 0 : 1;
}

if (import.meta.url === `file://${process.argv[1]}`) main();
