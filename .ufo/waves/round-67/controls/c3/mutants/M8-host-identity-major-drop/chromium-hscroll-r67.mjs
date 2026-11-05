#!/usr/bin/env node
// Counter for tabi round 67, C3 (capability chromium-hscroll-domain-linux):
// the Linux Chromium HORIZONTAL wheel plus scrollend receipt written by the
// frozen driver scripts/chrome-cdp-loopback-round67.mjs (sha256 ac0561ac...).
// Generation note: a NEW counter adapted from the frozen r64 vertical-wheel
// counter (counters/chromium-wheel-r64.mjs). Every named check has a declared
// negative (counters/make-negatives-r67.mjs, via the exported forge()) and the
// exact-line mutation matrix lives at counters/mutate-r67.mjs.
//
// Usage:
//   node chromium-hscroll-r67.mjs <receipt.json> --driver <path>
//     --expect-driver-sha256 <hex> --shot <dir> [--json]      (exit 0 true, 1 false, 2 usage)
//   node chromium-hscroll-r67.mjs --selftest --scratch <ABS dir> [--json]
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { decode, encode } from './png-r67.mjs';

const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const SCHEMA = 'tabi-chrome-cdp-r67';
const COUNTER = 'tabi-r67-hscroll-counter';
const NONCE_RE = /^tabi-r67-[a-z0-9-]+$/;
const HEX64 = /^[a-f0-9]{64}$/;
const LEG_NAMES = ['start', 'right1', 'right2', 'left1', 'overscroll', 'boundary'];
const EXPECTED_SCROLL = { start: 0, right1: 120, right2: 240, left1: 120, overscroll: 1000, boundary: 1000 };
const EXPECTED_LEN = { start: 0, right1: 1, right2: 2, left1: 3, overscroll: 4, boundary: 5 };
// scrollend floor for legs start..overscroll (index-aligned); boundary is pinned to 0 separately.
const EXPECTED_SCROLLEND_FLOOR = [0, 1, 1, 1, 1];
const EXPECTED_DELTA_X = [120, 120, -120, 1200, 120];
const EXPECTED_AT_DISPATCH = [0, 120, 240, 120, 1000];
const LEG_WITNESS = {
  start: [12, 24, 36], right1: [48, 60, 72], right2: [84, 96, 108],
  left1: [120, 132, 144], overscroll: [156, 168, 180], boundary: [192, 204, 216],
};
const VIEWPORT = { width: 1280, height: 900 };
const BAND_WIDTH = 120;
const BAND_COUNT = 19;
const CONTENT_WIDTH = 2280;
const CONTENT_HEIGHT = 860;
const BAND_COLORS = [[255, 0, 0], [0, 128, 0], [0, 0, 255], [255, 255, 0], [255, 0, 255], [0, 255, 255]];
const GRID = { left: 8, top: 8, cell: 4, cols: 32, rows: 8 };
const WITNESS_POINT = { x: 1000, y: 625 };
const BAND_SAMPLE_X = 1000;
const BAND_SAMPLE_Y = [60, 180, 300, 420];
const REQUIRED_ARGV = ['--headless=new', '--disable-extensions', '--remote-debugging-address=127.0.0.1', '--disable-smooth-scrolling'];
const MODIFIERS = ['ctrlKey', 'shiftKey', 'altKey', 'metaKey'];

export const CHECK_IDS = [
  'schema', 'nonce-binding', 'driver-binding', 'fixture-binding', 'loopback-origin',
  'launch-guards', 'legs-shape', 'scroll-arithmetic', 'scrollY-orthogonality', 'scrollend-count',
  'wheellog-count', 'wheellog-sequence', 'delta-x-passthrough', 'delta-y-zero', 'delta-mode-pixels',
  'trusted-fields', 'cancelation', 'target-binding', 'scroll-event-witness', 'scrollend-log-witness',
  'shot-records', 'shot-bytes', 'shot-bytes-dims', 'nonce-pixels', 'band-pixels', 'leg-witness', 'server-witness',
  'host-identity', 'host-identity-prefix', 'survivors', 'closed-ports', 'launch-witness', 'failures', 'producer-verdict',
  'page-final-state',
];

export function nonceBits(nonce) {
  return Array.from(crypto.createHash('sha256').update(nonce, 'utf8').digest().subarray(0, 32))
    .flatMap((byte) => Array.from({ length: 8 }, (_, k) => (byte >> (7 - k)) & 1));
}

// Band i of the driver sits at document x = i*120 and paints BAND_COLORS[i % 6].
// A viewport column x shows document column scrollLeft + x, so the band index is
// floor((scrollLeft + x) / 120). The sample column is fixed (x = 1000) and every
// sample row shows the same band, because bands are full-height strips.
export function expectedBandColor(scrollLeft) {
  const index = Math.floor((scrollLeft + BAND_SAMPLE_X) / BAND_WIDTH);
  if (index < 0 || index >= BAND_COUNT) return null;
  return BAND_COLORS[index % BAND_COLORS.length];
}

// Re-derives the fixture the frozen driver writes. The template is cut from the
// driver source between its markers and gets the same substitutions the driver
// applies (nonce, band strips, nonce-bit digest). Template text contains no
// backslashes, so the raw source slice equals the JS template value.
export function renderFixture(driverSource, nonce) {
  const m = /\/\*HSCROLL-FIXTURE-BEGIN\*\/[\s\S]*?const HSCROLL_TEMPLATE = `([\s\S]*?)`;[\s\S]*?\/\*HSCROLL-FIXTURE-END\*\//.exec(driverSource);
  if (!m) throw new Error('fixture template not found in driver source');
  if (m[1].includes('\\')) throw new Error('fixture template contains backslashes; raw slice is not the cooked value');
  const bandsHtml = Array.from({ length: BAND_COUNT }, (_, i) => {
    const c = BAND_COLORS[i % BAND_COLORS.length];
    return '<div class="band" style="left:' + (i * BAND_WIDTH) + 'px;background:rgb(' + c.join(',') + ')"></div>';
  }).join('');
  return m[1]
    .replaceAll('__NONCE__', nonce)
    .replaceAll('__BANDS__', bandsHtml)
    .replace('const digest = window.__nonceBits;', 'const digest = ' + JSON.stringify(nonceBits(nonce)) + ';');
}

// external: { driverSha256, expectDriverSha256, fixtureSha256, shots: { <leg>: { sha256, bytes, width, height, pixel(x,y) } | null } }
export function verify(r, external = {}) {
  const findings = [];
  const check = (ok, id) => { if (!ok) findings.push(id); };
  const legs = Array.isArray(r?.legs) ? r.legs : [];
  const legMap = Object.fromEntries(legs.map((l) => [l?.name, l]));
  const wl = Array.isArray(r?.wheellog) ? r.wheellog : [];
  const sl = Array.isArray(r?.scrollendlog) ? r.scrollendlog : [];
  const ps = r?.pageState || {};
  const shots = external.shots || {};
  const shotOf = (name) => shots[name] || null;
  const at = (shot, x, y) => {
    if (!shot || !Number.isInteger(x) || !Number.isInteger(y)) return null;
    if (x < 0 || y < 0 || x >= shot.width || y >= shot.height) return null;
    return shot.pixel(x, y);
  };
  const rgbEq = (a, b) => Array.isArray(a) && Array.isArray(b) && a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
  const legsOk = legs.length === 6 && LEG_NAMES.every((n, i) => legs[i]?.name === n);
  const wlOk = wl.length === 5;
  // The leg whose scrollend window (startMarker, endMarker] contains this seq.
  const legWindow = (seq) => legs.find((l) => Number.isInteger(l?.scrollendMarkerAtStart) && Number.isInteger(l?.scrollendMarkerAtEnd)
    && l.scrollendMarkerAtStart < seq && seq <= l.scrollendMarkerAtEnd) || null;

  check(r?.schema === SCHEMA, 'schema');
  check(NONCE_RE.test(r?.nonce || '') && r.nonceOnPage === r.nonce, 'nonce-binding');
  check(HEX64.test(r?.driverSha256 || '') && r.driverSha256 === external.driverSha256 && external.driverSha256 === external.expectDriverSha256, 'driver-binding');
  check(HEX64.test(r?.fixture?.sha256 || '') && r.fixture.sha256 === external.fixtureSha256, 'fixture-binding');
  check(/^http:\/\/127\.0\.0\.1:[0-9]+$/.test(r?.fixture?.origin || '') && r?.fixture?.target === 'wide'
    && r?.fixture?.viewport?.width === VIEWPORT.width && r?.fixture?.viewport?.height === VIEWPORT.height
    && r?.fixture?.deviceScaleFactor === 1 && r?.fixture?.bandWidth === BAND_WIDTH
    && r?.fixture?.contentWidth === CONTENT_WIDTH && r?.fixture?.contentHeight === CONTENT_HEIGHT, 'loopback-origin');
  check(Array.isArray(r?.host?.argv) && REQUIRED_ARGV.every((a) => r.host.argv.includes(a)), 'launch-guards');
  check(legsOk, 'legs-shape');
  check(LEG_NAMES.every((k) => legMap[k]?.scrollLeft === EXPECTED_SCROLL[k]), 'scroll-arithmetic');
  check(legs.length === 6 && legs.every((l) => l.scrollY === 0), 'scrollY-orthogonality');
  // Each scrolling leg needs at least one scrollend; the boundary leg (no movement) must have none.
  // The per-leg count must equal the marker window it was taken from.
  check(legs.length === 6 && legs.every((l) => l.scrollendsInLeg === l.scrollendMarkerAtEnd - l.scrollendMarkerAtStart)
    && legs.slice(0, 5).every((l, i) => l.scrollendsInLeg >= EXPECTED_SCROLLEND_FLOOR[i]) && legMap.boundary?.scrollendsInLeg === 0, 'scrollend-count');
  check(LEG_NAMES.every((k) => legMap[k]?.wheellogLen === EXPECTED_LEN[k]), 'wheellog-count');
  check(wlOk && wl.every((e, i) => e?.seq === i + 1), 'wheellog-sequence');
  check(wlOk && wl.every((e, i) => e.deltaX === EXPECTED_DELTA_X[i]), 'delta-x-passthrough');
  check(wlOk && wl.every((e) => e.deltaY === 0), 'delta-y-zero');
  check(wlOk && wl.every((e) => e.deltaMode === 0 && e.deltaZ === 0), 'delta-mode-pixels');
  check(wlOk && wl.every((e) => e.type === 'wheel' && e.isTrusted === true && e.cancelable === true
    && Number.isFinite(e.ts) && e.ts >= 0 && MODIFIERS.every((k) => e[k] === false)), 'trusted-fields');
  check(wlOk && wl.every((e) => e.defaultPrevented === false), 'cancelation');
  check(wlOk && wl.every((e, i) => e.targetId === 'wide' && e.scrollLeftAtDispatch === EXPECTED_AT_DISPATCH[i] && e.scrollYAtDispatch === 0), 'target-binding');
  // The scroll witness must count at least the four wheels that moved the page.
  check(Number.isInteger(ps.scrollEvents) && ps.scrollEvents >= 4, 'scroll-event-witness');
  // Every scrollend entry must sit inside one leg's window and carry that leg's scrollLeft.
  check(sl.length === ps.scrollendEvents && sl.every((e, i) => e?.type === 'scrollend' && e.seq === i + 1 && e.scrollY === 0
    && legWindow(e.seq)?.scrollLeft === e.scrollLeft) && legs.reduce((n, l) => n + (l?.scrollendsInLeg || 0), 0) === sl.length, 'scrollend-log-witness');
  check(legs.length === 6 && legs.every((l) => l.shot === l.name + '.png' && HEX64.test(l.shotSha256 || '')
    && Number.isInteger(l.shotBytes) && l.shotBytes > 0), 'shot-records');
  check(legsOk && legs.every((l) => {
    const s = shotOf(l.name);
    return !!s && s.width === VIEWPORT.width && s.height === VIEWPORT.height && s.sha256 === l.shotSha256 && s.bytes === l.shotBytes;
  }), 'shot-bytes');
  const bits = typeof r?.nonce === 'string' && NONCE_RE.test(r.nonce) ? nonceBits(r.nonce) : [];
  check(legs.length === 6 && bits.length === 256 && legs.every((l) => {
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
    const want = Number.isInteger(l?.scrollLeft) ? expectedBandColor(l.scrollLeft) : null;
    return !!s && !!want && BAND_SAMPLE_Y.every((y) => rgbEq(at(s, BAND_SAMPLE_X, y), want));
  }), 'band-pixels');
  check(legs.length === 6 && legs.every((l) => {
    const s = shotOf(l.name);
    const want = LEG_WITNESS[l?.name];
    return !!want && rgbEq(l.witnessRgb, want) && l.witness === l.name && rgbEq(at(s, WITNESS_POINT.x, WITNESS_POINT.y), want);
  }), 'leg-witness');
  check(Array.isArray(r?.serverLog) && r.serverLog.some((e) => e.path === '/' && e.status === 200 && e.run === r?.nonce)
    && r.serverLog.every((e) => ['/', '/favicon.ico'].includes(e.path)), 'server-witness');
  check(/^Chrome\/1[0-9]{2}\./.test(r?.host?.cdpProduct || '') && /^Chromium 1[0-9]{2}\./.test(r?.host?.chromium || '')
    , 'host-identity');
  check(r?.teardown?.postKillSweepCount === 0 && Array.isArray(r.teardown.survivors) && r.teardown.survivors.length === 0 && r.teardown.sweepError === null, 'survivors');
  check(r?.teardown?.portProbes?.fixture === 'closed' && r.teardown.portProbes.devtools === 'closed'
    && r?.teardown?.postKillCurl?.fixture === 7 && r.teardown.postKillCurl.devtools === 7, 'closed-ports');
  check(r?.sweeps?.preLaunch === 0 && r.sweeps.midRun > 0 && r.sweeps.postKill === 0, 'launch-witness');
  check(Array.isArray(r?.failures) && r.failures.length === 0, 'failures');
  check(r?.predicate === true && r?.hscrollHypothesis === 'CONFIRMED', 'producer-verdict');
  check(ps.scrollLeft === 1000 && ps.scrollY === 0 && ps.wheellogLen === 5, 'page-final-state');
  return { schema: COUNTER, predicate: findings.length === 0, findingCount: findings.length, findings };
}

// ---------- selftest: an independently drawn synthetic rendering ----------
// Draws what the r67 page should paint at this scroll: 120 px full-height band
// strips at document x = i*120, a white strip below the 860 px content height, a
// 128x32 black nonce grid whose bit-1 cells are 4x4 white squares, and the 200x50
// witness strip at (900,600).
export function drawShot({ nonce, scrollLeft, witness }) {
  const pixels = Buffer.alloc(VIEWPORT.width * VIEWPORT.height * 4, 255);
  const put = (x, y, rgb) => { const i = (y * VIEWPORT.width + x) * 4; pixels[i] = rgb[0]; pixels[i + 1] = rgb[1]; pixels[i + 2] = rgb[2]; pixels[i + 3] = 255; };
  for (let y = 0; y < CONTENT_HEIGHT && y < VIEWPORT.height; y++) {
    for (let x = 0; x < VIEWPORT.width; x++) {
      const band = Math.floor((scrollLeft + x) / BAND_WIDTH);
      put(x, y, BAND_COLORS[band % BAND_COLORS.length]);
    }
  }
  for (let dy = 0; dy < GRID.rows * GRID.cell; dy++) for (let dx = 0; dx < GRID.cols * GRID.cell; dx++) put(GRID.left + dx, GRID.top + dy, [0, 0, 0]);
  const bits = nonceBits(nonce);
  for (let row = 0; row < GRID.rows; row++) for (let col = 0; col < GRID.cols; col++) {
    if (!bits[row * GRID.cols + col]) continue;
    for (let dy = 0; dy < GRID.cell; dy++) for (let dx = 0; dx < GRID.cell; dx++) put(GRID.left + col * GRID.cell + dx, GRID.top + row * GRID.cell + dy, [255, 255, 255]);
  }
  for (let dy = 0; dy < 50; dy++) for (let dx = 0; dx < 200; dx++) put(900 + dx, 600 + dy, LEG_WITNESS[witness]);
  return pixels;
}
function shotInfo(buf) {
  const d = decode(buf);
  return { sha256: sha(buf), bytes: buf.length, width: d.width, height: d.height, pixel: (x, y) => d.pixel(x, y), pixels: d.pixels };
}
function synthetic() {
  const nonce = 'tabi-r67-test';
  const legs = [
    { name: 'start', scrollLeft: 0, scrollY: 0, wheellogLen: 0, scrollendMarkerAtStart: 0, scrollendMarkerAtEnd: 0, scrollendsInLeg: 0 },
    { name: 'right1', scrollLeft: 120, scrollY: 0, wheellogLen: 1, scrollendMarkerAtStart: 0, scrollendMarkerAtEnd: 1, scrollendsInLeg: 1 },
    { name: 'right2', scrollLeft: 240, scrollY: 0, wheellogLen: 2, scrollendMarkerAtStart: 1, scrollendMarkerAtEnd: 2, scrollendsInLeg: 1 },
    { name: 'left1', scrollLeft: 120, scrollY: 0, wheellogLen: 3, scrollendMarkerAtStart: 2, scrollendMarkerAtEnd: 3, scrollendsInLeg: 1 },
    { name: 'overscroll', scrollLeft: 1000, scrollY: 0, wheellogLen: 4, scrollendMarkerAtStart: 3, scrollendMarkerAtEnd: 4, scrollendsInLeg: 1 },
    { name: 'boundary', scrollLeft: 1000, scrollY: 0, wheellogLen: 5, scrollendMarkerAtStart: 4, scrollendMarkerAtEnd: 4, scrollendsInLeg: 0 },
  ].map((l) => ({ ...l, witness: l.name, witnessRgb: LEG_WITNESS[l.name], shot: l.name + '.png', shotSha256: 'c'.repeat(64), shotBytes: 10 }));
  const wl = EXPECTED_DELTA_X.map((deltaX, i) => ({
    type: 'wheel', seq: i + 1, ts: 10 + i, deltaX, deltaY: 0, deltaZ: 0, deltaMode: 0,
    ctrlKey: false, shiftKey: false, altKey: false, metaKey: false, isTrusted: true, cancelable: true,
    defaultPrevented: false, targetId: 'wide', scrollLeftAtDispatch: EXPECTED_AT_DISPATCH[i], scrollYAtDispatch: 0,
  }));
  const sl = [
    { type: 'scrollend', seq: 1, ts: 500, scrollLeft: 120, scrollY: 0 },
    { type: 'scrollend', seq: 2, ts: 900, scrollLeft: 240, scrollY: 0 },
    { type: 'scrollend', seq: 3, ts: 1300, scrollLeft: 120, scrollY: 0 },
    { type: 'scrollend', seq: 4, ts: 1700, scrollLeft: 1000, scrollY: 0 },
  ];
  return {
    schema: SCHEMA, nonce, nonceOnPage: nonce, driverSha256: 'a'.repeat(64),
    host: { chromium: 'Chromium 155.0.8059.84 Arch Linux', cdpProduct: 'Chrome/155.0.8059.84', cdpProtocolVersion: '1.3', argv: REQUIRED_ARGV.slice(), launchToken: 'x', stderrHead: '' },
    fixture: { sha256: 'b'.repeat(64), origin: 'http://127.0.0.1:19471', target: 'wide', viewport: VIEWPORT, deviceScaleFactor: 1, bandWidth: BAND_WIDTH, contentWidth: CONTENT_WIDTH, contentHeight: CONTENT_HEIGHT },
    legs, wheellog: wl, scrollendlog: sl,
    pageState: { scrollLeft: 1000, scrollY: 0, scrollEvents: 4, scrollendEvents: 4, wheellogLen: 5 },
    serverLog: [{ path: '/', query: 'run=' + nonce, run: nonce, status: 200 }, { path: '/favicon.ico', query: '', run: '', status: 404 }],
    sweeps: { preLaunch: 0, midRun: 3, postKill: 0 },
    teardown: { postKillSweepCount: 0, survivors: [], sweepError: null, portProbes: { fixture: 'closed', devtools: 'closed' }, postKillCurl: { fixture: 7, devtools: 7 } },
    failures: [], hscrollHypothesis: 'CONFIRMED', predicate: true,
  };
}
function goodShots(receipt) {
  const shots = {};
  for (const l of receipt.legs) {
    const buf = encode({ width: VIEWPORT.width, height: VIEWPORT.height, pixels: drawShot({ nonce: receipt.nonce, scrollLeft: l.scrollLeft, witness: l.name }) });
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
    const ext = { driverSha256: 'a'.repeat(64), expectDriverSha256: 'a'.repeat(64), fixtureSha256: 'b'.repeat(64), shots };
    const expect = mutate(r, shots, ext);
    const got = verify(r, ext);
    results.push({ id, expect, findings: got.findings, ok: expect === null ? got.findings.length === 0 : got.findings.includes(expect) });
  };
  run('clean', () => null);
  for (const id of CHECK_IDS) run('neg-' + id, (r, shots) => forge(id, r, shots));
  // Positive control: a blanket refusal would fail this. The drawn shots are written
  // to the scratch dir so the positive control can be inspected.
  const posReceipt = synthetic();
  const posShots = goodShots(posReceipt);
  const posExt = { driverSha256: 'a'.repeat(64), expectDriverSha256: 'a'.repeat(64), fixtureSha256: 'b'.repeat(64), shots: posShots };
  const clean = verify(posReceipt, posExt);
  results.push({ id: 'positive-control-accepted', expect: null, findings: clean.findings, ok: clean.findings.length === 0 });
  const passed = results.filter((x) => x.ok).length;
  if (scratchDir) {
    const dir = path.join(scratchDir, 'positive-control');
    fs.mkdirSync(dir, { recursive: true });
    for (const l of posReceipt.legs) fs.writeFileSync(path.join(dir, l.shot), encode({ width: VIEWPORT.width, height: VIEWPORT.height, pixels: drawShot({ nonce: posReceipt.nonce, scrollLeft: l.scrollLeft, witness: l.name }) }));
    fs.writeFileSync(path.join(dir, 'receipt.json'), JSON.stringify(posReceipt, null, 1));
  }
  return { verdict: passed === results.length ? 'clean' : 'red', cases: results.length, passed, results };
}

// Each forge mutates exactly one field (or one pixel) of a copy of the synthetic
// receipt and returns the check id it must trip. Negatives that touch scrollend
// markers keep the markers self-consistent so only the named check is the cause.
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
    case 'schema': r.schema = 'tabi-chrome-cdp-r64'; return 'schema';
    case 'nonce-binding': r.nonceOnPage = 'tabi-r67-other'; return 'nonce-binding';
    case 'driver-binding': r.driverSha256 = 'd'.repeat(64); return 'driver-binding';
    case 'fixture-binding': r.fixture.sha256 = 'e'.repeat(64); return 'fixture-binding';
    case 'loopback-origin': r.fixture.origin = 'http://10.0.0.1:19471'; return 'loopback-origin';
    case 'launch-guards': r.host.argv = r.host.argv.filter((a) => a !== '--disable-smooth-scrolling'); return 'launch-guards';
    case 'legs-shape': r.legs[1].name = 'rightX'; return 'legs-shape';
    // Isolated: the leg, its scrollend entry and the drawn band pixels all agree on 180, so only the frozen arithmetic can refuse it.
    case 'scroll-arithmetic': {
      r.legs[2].scrollLeft = 180; r.scrollendlog[1].scrollLeft = 180;
      for (const y of BAND_SAMPLE_Y) repaint('right2', BAND_SAMPLE_X, y, expectedBandColor(180));
      return 'scroll-arithmetic';
    }
    case 'scrollY-orthogonality': r.legs[3].scrollY = 120; return 'scrollY-orthogonality';
    // Consistent markers and scrollend log: only the boundary "no scrollend" clause can refuse this.
    case 'scrollend-count':
      r.legs[5].scrollendMarkerAtEnd = 5; r.legs[5].scrollendsInLeg = 1;
      r.scrollendlog.push({ type: 'scrollend', seq: 5, ts: 1900, scrollLeft: 1000, scrollY: 0 });
      r.pageState.scrollendEvents = 5;
      return 'scrollend-count';
    case 'wheellog-count': r.legs[4].wheellogLen = 5; return 'wheellog-count';
    case 'wheellog-sequence': setWl(4, { seq: 4 }); return 'wheellog-sequence';
    case 'delta-x-passthrough': setWl(1, { deltaX: 60 }); return 'delta-x-passthrough';
    case 'delta-y-zero': setWl(3, { deltaY: 60 }); return 'delta-y-zero';
    case 'delta-mode-pixels': setWl(3, { deltaMode: 1 }); return 'delta-mode-pixels';
    case 'trusted-fields': setWl(2, { isTrusted: false }); return 'trusted-fields';
    case 'cancelation': setWl(3, { defaultPrevented: true }); return 'cancelation';
    case 'target-binding': setWl(0, { scrollYAtDispatch: 7 }); return 'target-binding';
    case 'scroll-event-witness': r.pageState.scrollEvents = 3; return 'scroll-event-witness';
    case 'scrollend-log-witness': r.scrollendlog[0].scrollLeft = 999; return 'scrollend-log-witness';
    case 'shot-records': r.legs[5].shot = 'other.png'; return 'shot-records';
    // Isolated: the PNG bytes stay a real rendering; only the recorded digest lies.
    case 'shot-bytes': r.legs[0].shotSha256 = 'f'.repeat(64); return 'shot-bytes';
    // Isolated: the same 1280x900 pixels plus one white row (1280x901) with the digest rebound to its own bytes. The checked
    // coordinates are unchanged, so only the viewport-dimension clause of shot-bytes can refuse it.
    case 'shot-bytes-dims': {
      const dimBase = shots[r.legs[0].name];
      const dimBuf = encode({ width: 1280, height: 901, pixels: Buffer.concat([dimBase.pixels, Buffer.alloc(1280 * 4, 255)]) });
      const dimInfo = shotInfo(dimBuf);
      shots[r.legs[0].name] = dimInfo;
      r.legs[0].shotSha256 = dimInfo.sha256;
      r.legs[0].shotBytes = dimInfo.bytes;
      return 'shot-bytes';
    }
    case 'nonce-pixels': { const bit0 = nonceBits(r.nonce)[0]; repaint('right1', GRID.left + 2, GRID.top + 2, bit0 ? [0, 0, 0] : [255, 255, 255]); return 'nonce-pixels'; }
    case 'band-pixels': repaint('left1', BAND_SAMPLE_X, BAND_SAMPLE_Y[0], [1, 2, 3]); return 'band-pixels';
    case 'leg-witness': repaint('overscroll', WITNESS_POINT.x, WITNESS_POINT.y, [0, 0, 0]); return 'leg-witness';
    case 'server-witness': r.serverLog = r.serverLog.map((e) => ({ ...e, run: e.path === '/' ? 'tabi-r67-other' : e.run })); return 'server-witness';
    // Isolated: a valid Chrome/1xx product with a different major than the Chromium banner. Only the same-major clause can refuse it.
    case 'host-identity': r.host.cdpProduct = 'Chrome/150.0.7000.0'; return 'host-identity';
    // Isolated: the Chrome/ prefix clause alone; the major (155) still matches the Chromium banner.
    case 'host-identity-prefix': r.host.cdpProduct = 'HeadlessChrome/155.0.8059.84'; return 'host-identity';
    case 'survivors': r.teardown.sweepError = 'ps exited 1'; return 'survivors';
    case 'closed-ports': r.teardown.postKillCurl.fixture = 0; return 'closed-ports';
    case 'launch-witness': r.sweeps.midRun = 0; return 'launch-witness';
    case 'failures': r.failures = [{ id: 'x', detail: 'y' }]; return 'failures';
    case 'producer-verdict': r.predicate = false; return 'producer-verdict';
    case 'page-final-state': r.pageState.scrollLeft = 960; return 'page-final-state';
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
      console.log(JSON.stringify({ schema: COUNTER, error: 'usage', detail: '--selftest requires an absolute --scratch (no /tmp default)' }));
      process.exitCode = 2;
      return;
    }
    const out = selftest(scratch);
    if (json) console.log(JSON.stringify(out, null, 1));
    else {
      for (const r of out.results.filter((x) => !x.ok)) console.log('FAIL ' + r.id + ' expect=' + r.expect + ' findings=' + JSON.stringify(r.findings));
      console.log('TABI_R67_COUNTER_SELFTEST verdict=' + out.verdict + ' cases=' + out.cases + ' passed=' + out.passed);
    }
    process.exitCode = out.verdict === 'clean' ? 0 : 1;
    return;
  }
  const receiptPath = bare[0];
  const driverPath = opt('driver');
  const expectDriver = opt('expect-driver-sha256');
  const shotDir = opt('shot');
  const refuse = (detail) => { console.log(JSON.stringify({ schema: COUNTER, error: 'usage', detail })); process.exitCode = 2; };
  if (!receiptPath || !driverPath || !expectDriver || !shotDir) return refuse('need <receipt> --driver <path> --expect-driver-sha256 <hex> --shot <dir>');
  if (!HEX64.test(expectDriver)) return refuse('--expect-driver-sha256 must be 64 hex chars');
  let receipt;
  try { receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8')); } catch (e) { return refuse('receipt unreadable: ' + e.message); }
  let driverSource;
  try { driverSource = fs.readFileSync(driverPath); } catch (e) { return refuse('driver unreadable: ' + e.message); }
  const driverSha256 = sha(driverSource);
  let fixtureSha256 = null;
  try { fixtureSha256 = sha(Buffer.from(renderFixture(driverSource.toString('utf8'), receipt?.nonce || ''))); } catch { fixtureSha256 = null; }
  const shots = {};
  for (const leg of Array.isArray(receipt?.legs) ? receipt.legs : []) {
    const p = path.join(shotDir, String(leg?.shot || ''));
    try { shots[leg.name] = shotInfo(fs.readFileSync(p)); } catch { shots[leg?.name] = null; }
  }
  const result = verify(receipt, { driverSha256, expectDriverSha256: expectDriver, fixtureSha256, shots });
  if (json) console.log(JSON.stringify({ ...result, checks: CHECK_IDS.length, driverSha256, fixtureSha256 }, null, 1));
  else console.log('TABI_R67_COUNTER predicate=' + result.predicate + ' findings=' + result.findingCount + (result.findingCount ? ' ids=' + result.findings.join(',') : ''));
  process.exitCode = result.predicate ? 0 : 1;
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) main();
