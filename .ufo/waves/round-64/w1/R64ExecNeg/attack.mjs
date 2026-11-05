// R64ExecNeg independent negative set. Does NOT use counters/make-negatives-r64.mjs.
// Only frozen import: png-r64.mjs decode/encode (production codec semantics).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { decode, encode } from '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-64/counters/png-r64.mjs';

const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const DRIVER = path.join(LANE, 'scripts/chrome-cdp-loopback-round64.mjs');
const COUNTER = path.join(LANE, '.ufo/waves/round-64/counters/chromium-wheel-r64.mjs');
const DRIVER_PIN = '1ff560cc7f34c709a6ec8847fec9b4b6a1b55bb4818b550ae41d1dcee2b92db5';
const SMOKE = path.join(LANE, '.ufo/waves/round-64/controls/smoke');
const SMOKE_RECEIPT = path.join(SMOKE, 'receipt.json');
const LEGS = ['start', 'down1', 'down2', 'up1', 'swallowed', 'released'];
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const GRID = { left: 8, top: 8, cell: 4, cols: 32, rows: 8 };
const BAND_COLORS = [[255,0,0],[0,128,0],[0,0,255],[255,255,0],[255,0,255],[0,255,255]];
// independent reimplementation from the driver/counter header docs
const nonceBits = (n) => Array.from(crypto.createHash('sha256').update(n, 'utf8').digest().subarray(0, 32))
  .flatMap((b) => Array.from({ length: 8 }, (_, k) => (b >> (7 - k)) & 1));

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const WORK = path.join(ROOT, 'work');
fs.rmSync(WORK, { recursive: true, force: true });
fs.mkdirSync(WORK, { recursive: true });

const baseReceipt = () => structuredClone(JSON.parse(fs.readFileSync(SMOKE_RECEIPT, 'utf8')));
const basePng = (leg) => fs.readFileSync(path.join(SMOKE, leg + '.png'));

// edit one pixel of a leg's png and keep the receipt digest truthful (the lie is the pixel, not the bookkeeping)
function repaint(ctx, leg, x, y, rgb) {
  const d = decode(basePng(leg));
  const px = Buffer.from(d.pixels);
  const i = (y * d.width + x) * 4;
  px[i] = rgb[0]; px[i + 1] = rgb[1]; px[i + 2] = rgb[2]; px[i + 3] = 255;
  ctx.putPng(leg, encode({ width: d.width, height: d.height, pixels: px }));
}
function cropPng(ctx, leg, w, h) {
  const d = decode(basePng(leg));
  const out = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const s = (y * d.width + x) * 4, t = (y * w + x) * 4;
    out[t] = d.pixels[s]; out[t + 1] = d.pixels[s + 1]; out[t + 2] = d.pixels[s + 2]; out[t + 3] = 255;
  }
  ctx.putPng(leg, encode({ width: w, height: h, pixels: out }));
}

const FORGERIES = [
  // ---- schema / identity ----
  { id: 'F01-schema', change: "schema → 'tabi-chrome-cdp-r63'", expect: ['schema'], mut(r) { r.schema = 'tabi-chrome-cdp-r63'; } },
  { id: 'F02-nonce-swap', change: "nonce → 'tabi-r64-attacker' (nonceOnPage follows)", expect: ['fixture-binding', 'nonce-pixels', 'server-witness'], mut(r) { r.nonce = 'tabi-r64-attacker'; r.nonceOnPage = 'tabi-r64-attacker'; } },
  { id: 'F03-nonce-on-page', change: "nonceOnPage → 'tabi-r64-other' (nonce field kept)", expect: ['nonce-binding'], mut(r) { r.nonceOnPage = 'tabi-r64-other'; } },
  { id: 'F04-driver-pin', change: 'driverSha256 → 64×d', expect: ['driver-binding'], mut(r) { r.driverSha256 = 'd'.repeat(64); } },
  { id: 'F05-fixture-digest', change: 'fixture.sha256 → 64×e', expect: ['fixture-binding'], mut(r) { r.fixture.sha256 = 'e'.repeat(64); } },
  { id: 'F06-origin-port', change: 'fixture.origin port 18481 → 12345', expect: [], forgedGreenGuess: 'loopback-origin never binds the port to serverLog', mut(r) { r.fixture.origin = 'http://127.0.0.1:12345'; } },
  // ---- host / argv ----
  { id: 'F07-argv-conflict', change: "host.argv += '--force-device-scale-factor=2' (fsf=1 still present)", expect: [], forgedGreenGuess: 'launch-guards is subset-only', mut(r) { r.host.argv.push('--force-device-scale-factor=2'); } },
  { id: 'F08-argv-drop', change: "host.argv -= '--disable-smooth-scrolling'", expect: ['launch-guards'], mut(r) { r.host.argv = r.host.argv.filter((a) => a !== '--disable-smooth-scrolling'); } },
  { id: 'F39-launch-token', change: "host.launchToken → 'deadbeefcafe'", expect: [], forgedGreenGuess: 'token unwitnessed', mut(r) { r.host.launchToken = 'deadbeefcafe'; } },
  { id: 'F40-proto-version', change: "host.cdpProtocolVersion '1.3' → '2.0'", expect: [], forgedGreenGuess: 'protocol version unwitnessed', mut(r) { r.host.cdpProtocolVersion = '2.0'; } },
  { id: 'F41-stderr-head', change: "host.stderrHead '' → 'simulation stable'", expect: [], forgedGreenGuess: 'stderr head unwitnessed', mut(r) { r.host.stderrHead = 'simulation stable'; } },
  { id: 'F28-cdp-product', change: "host.cdpProduct → 'HeadlessChrome/155.0.8059.84'", expect: ['host-identity'], mut(r) { r.host.cdpProduct = 'HeadlessChrome/155.0.8059.84'; } },
  { id: 'F29-chromium-major', change: "host.chromium → 'Chromium 156.0.8059.84 Arch Linux'", expect: ['host-identity'], mut(r) { r.host.chromium = 'Chromium 156.0.8059.84 Arch Linux'; } },
  // ---- legs ----
  { id: 'F09-leg-reorder', change: 'legs[1] ↔ legs[2] full objects swapped', expect: ['legs-shape'], mut(r) { const t = r.legs[1]; r.legs[1] = r.legs[2]; r.legs[2] = t; } },
  { id: 'F10-scroll-value', change: 'legs[2].scrollY 240 → 180', expect: ['scroll-arithmetic', 'scroll-pixels'], mut(r) { r.legs.find((l) => l.name === 'down2').scrollY = 180; } },
  { id: 'F11-len-lie', change: 'legs[4].wheellogLen 4 → 5', expect: ['wheellog-count'], mut(r) { r.legs.find((l) => l.name === 'swallowed').wheellogLen = 5; } },
  { id: 'F45-witness-rgb', change: 'legs[5].witnessRgb [160,170,180] → [161,170,180]', expect: ['leg-witness'], mut(r) { r.legs.find((l) => l.name === 'released').witnessRgb = [161, 170, 180]; } },
  { id: 'F42-shot-name', change: "legs[0].shot 'start.png' → 'other.png'", expect: ['shot-records', 'shot-bytes'], mut(r) { r.legs[0].shot = 'other.png'; } },
  { id: 'F43-digest-lie', change: 'legs[0].shotSha256 → 64×f (bytes on disk untouched)', expect: ['shot-bytes'], mut(r) { r.legs[0].shotSha256 = 'f'.repeat(64); } },
  { id: 'F44-bytes-lie', change: 'legs[0].shotBytes 6332 → 6333', expect: ['shot-bytes'], mut(r) { r.legs[0].shotBytes = 6333; } },
  // ---- wheellog ----
  { id: 'F12-seq-swap', change: 'wheellog[0].seq ↔ wheellog[1].seq', expect: ['wheellog-sequence'], mut(r) { const t = r.wheellog[0].seq; r.wheellog[0].seq = r.wheellog[1].seq; r.wheellog[1].seq = t; } },
  { id: 'F13-delta-y', change: 'wheellog[1].deltaY 120 → 60', expect: ['delta-y-passthrough'], mut(r) { r.wheellog[1].deltaY = 60; } },
  { id: 'F14-delta-mode', change: 'wheellog[3].deltaMode 0 → 1', expect: ['delta-mode-pixels'], mut(r) { r.wheellog[3].deltaMode = 1; } },
  { id: 'F15-untrusted', change: 'wheellog[2].isTrusted true → false', expect: ['trusted-fields'], mut(r) { r.wheellog[2].isTrusted = false; } },
  { id: 'F16-uncancelable', change: 'wheellog[3].cancelable true → false', expect: ['trusted-fields'], mut(r) { r.wheellog[3].cancelable = false; } },
  { id: 'F17-unprevented', change: 'wheellog[3].defaultPrevented true → false (scrollEvents untouched)', expect: ['cancelation', 'scroll-event-witness'], mut(r) { r.wheellog[3].defaultPrevented = false; } },
  { id: 'F18-target', change: "wheellog[0].targetId 'tall' → 'body'", expect: ['target-binding'], mut(r) { r.wheellog[0].targetId = 'body'; } },
  { id: 'F19-at-dispatch', change: 'wheellog[1].scrollYAtDispatch 120 → 118', expect: ['target-binding'], mut(r) { r.wheellog[1].scrollYAtDispatch = 118; } },
  { id: 'F20-ts-big', change: 'wheellog[2].ts 528 → 99999', expect: [], forgedGreenGuess: 'ts only needs finite ≥ 0', mut(r) { r.wheellog[2].ts = 99999; } },
  { id: 'F21-ts-negative', change: 'wheellog[2].ts 528 → -5', expect: ['trusted-fields'], mut(r) { r.wheellog[2].ts = -5; } },
  { id: 'F46-extra-entry', change: '6th wheellog entry appended (seq 6)', expect: ['wheellog-sequence', 'delta-y-passthrough', 'delta-mode-pixels', 'trusted-fields', 'cancelation', 'target-binding', 'scroll-event-witness'], mut(r) { r.wheellog.push({ type: 'wheel', seq: 6, ts: 1100, deltaX: 0, deltaY: 120, deltaZ: 0, deltaMode: 0, ctrlKey: false, shiftKey: false, altKey: false, metaKey: false, isTrusted: true, cancelable: true, defaultPrevented: false, targetId: 'tall', scrollYAtDispatch: 240 }); } },
  { id: 'F47-drop-entry', change: 'wheellog[4] removed (4 entries)', expect: ['wheellog-sequence', 'delta-y-passthrough', 'delta-mode-pixels', 'trusted-fields', 'cancelation', 'target-binding', 'scroll-event-witness'], mut(r) { r.wheellog.pop(); } },
  // ---- page state / server log ----
  { id: 'F22-scroll-events', change: 'pageState.scrollEvents 4 → 5', expect: ['scroll-event-witness'], mut(r) { r.pageState.scrollEvents = 5; } },
  { id: 'F23-final-scroll', change: 'pageState.scrollY 240 → 120', expect: ['page-final-state'], mut(r) { r.pageState.scrollY = 120; } },
  { id: 'F24-favicon-drop', change: 'serverLog favicon.ico entry deleted (only / left)', expect: [], forgedGreenGuess: 'every() over 1 entry passes', mut(r) { r.serverLog = r.serverLog.filter((e) => e.path === '/'); } },
  { id: 'F25-favicon-200', change: 'serverLog favicon.ico status 404 → 200', expect: [], forgedGreenGuess: 'favicon status unpinned', mut(r) { const e = r.serverLog.find((x) => x.path === '/favicon.ico'); e.status = 200; } },
  { id: 'F26-run-mismatch', change: "serverLog '/' entry run → 'tabi-r64-other'", expect: ['server-witness'], mut(r) { r.serverLog.find((x) => x.path === '/').run = 'tabi-r64-other'; } },
  { id: 'F27-extra-path', change: "serverLog += {path:'/evil.js', status:200, run:nonce}", expect: ['server-witness'], mut(r) { r.serverLog.push({ path: '/evil.js', query: 'x=1', run: r.nonce, status: 200 }); } },
  // ---- teardown / sweeps / verdict ----
  { id: 'F30-sweep-error', change: "teardown.sweepError null → 'ps exited 1'", expect: ['survivors'], mut(r) { r.teardown.sweepError = 'ps exited 1'; } },
  { id: 'F31-curl-zero', change: 'teardown.postKillCurl.fixture 7 → 0', expect: ['closed-ports'], mut(r) { r.teardown.postKillCurl.fixture = 0; } },
  { id: 'F32-probe-open', change: "teardown.portProbes.devtools 'closed' → 'open'", expect: ['closed-ports'], mut(r) { r.teardown.portProbes.devtools = 'open'; } },
  { id: 'F33-midrun-zero', change: 'sweeps.midRun 13 → 0', expect: ['launch-witness'], mut(r) { r.sweeps.midRun = 0; } },
  { id: 'F34-midrun-one', change: 'sweeps.midRun 13 → 1 (count falsified, still >0)', expect: [], forgedGreenGuess: 'only >0 witnessed', mut(r) { r.sweeps.midRun = 1; } },
  { id: 'F35-failures', change: "failures [] → [{id:'drive-error', detail:'x'}]", expect: ['failures'], mut(r) { r.failures = [{ id: 'drive-error', detail: 'x' }]; } },
  { id: 'F36-predicate-off', change: 'predicate true → false', expect: ['producer-verdict'], mut(r) { r.predicate = false; } },
  { id: 'F37-hypothesis-off', change: "wheelHypothesis 'CONFIRMED' → 'REFUTED'", expect: ['producer-verdict'], mut(r) { r.wheelHypothesis = 'REFUTED'; } },
  { id: 'F38-verdict-both-off', change: 'predicate false AND wheelHypothesis REFUTED (honest-looking refutation of clean data)', expect: ['producer-verdict'], mut(r) { r.predicate = false; r.wheelHypothesis = 'REFUTED'; } },
  { id: 'F59-viewport', change: 'fixture.deviceScaleFactor 1 → 2', expect: ['loopback-origin'], mut(r) { r.fixture.deviceScaleFactor = 2; } },
  // ---- pixel forgeries (PNG edited + receipt digest kept truthful) ----
  { id: 'F48-one-by-one', change: 'start.png replaced by a 1×1 white PNG', expect: ['shot-bytes'], mut(r, ctx) { ctx.putPng('start', encode({ width: 1, height: 1, pixels: Buffer.from([255, 255, 255, 255]) })); } },
  { id: 'F49-borrowed-same-scroll', change: 'down1.png bytes ← up1.png bytes (same scrollY 120)', expect: ['leg-witness'], mut(r, ctx) { ctx.putPng('down1', basePng('up1')); } },
  { id: 'F50-borrowed-cross-scroll', change: 'released.png bytes ← start.png bytes (scrollY 0 vs 240)', expect: ['scroll-pixels', 'leg-witness'], mut(r, ctx) { ctx.putPng('released', basePng('start')); } },
  { id: 'F51-grid-cell', change: 'up1.png grid cell (row 7, col 31) centre colour inverted', expect: ['nonce-pixels'], mut(r, ctx) { const bits = nonceBits(r.nonce); const idx = 7 * GRID.cols + 31; const x = GRID.left + 31 * GRID.cell + 2, y = GRID.top + 7 * GRID.cell + 2; repaint(ctx, 'up1', x, y, bits[idx] ? [0, 0, 0] : [255, 255, 255]); } },
  { id: 'F52-band-sample', change: 'down2.png band sample (1000,180) → [1,2,3]', expect: ['scroll-pixels'], mut(r, ctx) { repaint(ctx, 'down2', 1000, 180, [1, 2, 3]); } },
  { id: 'F53-witness-colour', change: 'released.png witness point (1000,625) → [0,0,0]', expect: ['leg-witness'], mut(r, ctx) { repaint(ctx, 'released', 1000, 625, [0, 0, 0]); } },
  { id: 'F54-cropped', change: 'down2.png cropped to 640×450 top-left quadrant', expect: ['shot-bytes'], mut(r, ctx) { cropPng(ctx, 'down2', 640, 450); } },
  { id: 'F57-truncated-json', change: 'receipt.json truncated mid-object (invalid JSON)', expect: ['exit-2 usage refusal'], mut(r, ctx) { ctx.rawReceipt = '{"schema": "tabi-chrome-cdp-r64"'; } },
];

const LEGIT_ODD = [
  { id: 'G01-same-nonce-twice', change: 'serverLog logs the same /?run=nonce request twice (same nonce two entries)', expect: 'accepted; right? — log shape is factual, counter scopes to existence', mut(r) { r.serverLog.splice(1, 0, { ...r.serverLog[0] }); } },
  { id: 'G02-extra-unused-png', change: 'shot dir gains bonus.png (copy of start.png) not named by any leg', expect: 'accepted; right? — counter loads only legs[i].shot names', mut() {} , extra: 'bonus.png' },
];

const results = [];
function runCounter(receiptPath, shotDir, label) {
  const run = spawnSync('node', [COUNTER, receiptPath, '--driver', DRIVER, '--expect-driver-sha256', DRIVER_PIN, '--shot', shotDir, '--json'],
    { cwd: ROOT, encoding: 'utf8', timeout: 120000 });
  let parsed = null;
  try { parsed = JSON.parse(run.stdout); } catch {}
  return { exit: run.status, predicate: parsed?.predicate ?? null, findings: parsed?.findings ?? null, findingCount: parsed?.findingCount ?? null, stdout: (run.stdout || '').slice(0, 400), stderr: (run.stderr || '').slice(0, 200), _label: label };
}

// ---- baseline positive control on the committed bytes (read-only) ----
const baseline = runCounter(SMOKE_RECEIPT, SMOKE, 'baseline-committed-smoke');
results.push({ id: 'F00-baseline', class: 'baseline', change: 'committed smoke receipt + shots, unmodified', expect: 'exit 0 findings []', ...strip(baseline) });
if (baseline.exit !== 0 || (baseline.findings || []).length !== 0) {
  console.error('BASELINE NOT GREEN — harness invalid', JSON.stringify(baseline));
  process.exit(3);
}

// ---- forgeries ----
const pngCopies = [];
for (const spec of FORGERIES) {
  const dir = path.join(WORK, spec.id);
  fs.mkdirSync(dir, { recursive: true });
  const ctx = {
    rawReceipt: null,
    touched: [],
    putPng(leg, buf) {
      fs.writeFileSync(path.join(dir, leg + '.png'), buf);
      pngCopies.push([spec.id, leg, buf]);
      ctx.touched.push(leg);
    },
  };
  // start from pristine copies of the six committed shots
  for (const leg of LEGS) fs.writeFileSync(path.join(dir, leg + '.png'), basePng(leg));
  const r = baseReceipt();
  spec.mut(r, ctx);
  // pixel forgeries lie only in pixels: keep shotSha256/shotBytes truthful for touched legs
  for (const leg of ctx.touched) {
    const buf = fs.readFileSync(path.join(dir, leg + '.png'));
    const legRec = r.legs.find((l) => l.name === leg);
    legRec.shotSha256 = sha(buf);
    legRec.shotBytes = buf.length;
  }
  if (ctx.rawReceipt !== null) fs.writeFileSync(path.join(dir, 'receipt.json'), ctx.rawReceipt);
  else fs.writeFileSync(path.join(dir, 'receipt.json'), JSON.stringify(r, null, 1));
  const out = runCounter(path.join(dir, 'receipt.json'), dir, spec.id);
  const accepted = out.exit === 0;
  results.push({
    id: spec.id, class: 'forgery', change: spec.change,
    expectCheck: spec.expect.length ? spec.expect.join('+') : '(accept — predicted forgedGreen' + (spec.forgedGreenGuess ? ': ' + spec.forgedGreenGuess : '') + ')',
    predictedRefusal: spec.expect, exit: out.exit, predicate: out.predicate, findings: out.findings,
    forgedGreen: accepted, matchesPrediction: JSON.stringify(out.findings || []) === JSON.stringify(spec.expect),
    stdout: out.stdout.slice(0, 220),
  });
}

// ---- legit-but-odd ----
for (const spec of LEGIT_ODD) {
  const dir = path.join(WORK, spec.id);
  fs.mkdirSync(dir, { recursive: true });
  for (const leg of LEGS) fs.writeFileSync(path.join(dir, leg + '.png'), basePng(leg));
  if (spec.extra) fs.writeFileSync(path.join(dir, spec.extra), basePng('start'));
  const r = baseReceipt();
  spec.mut(r);
  fs.writeFileSync(path.join(dir, 'receipt.json'), JSON.stringify(r, null, 1));
  const out = runCounter(path.join(dir, 'receipt.json'), dir, spec.id);
  results.push({ id: spec.id, class: 'legit-odd', change: spec.change, expectCheck: spec.expect, exit: out.exit, predicate: out.predicate, findings: out.findings, stdout: out.stdout.slice(0, 220) });
}

// ---- empty shot dir (invocation-side single change, receipt untouched) ----
{
  const dir = path.join(WORK, 'F58-empty-shotdir');
  fs.mkdirSync(dir, { recursive: true });
  const out = runCounter(SMOKE_RECEIPT, dir, 'F58');
  results.push({ id: 'F58-empty-shotdir', class: 'forgery-invocation', change: '--shot points at an empty dir (committed receipt untouched)', expectCheck: 'shot-bytes+nonce-pixels+scroll-pixels+leg-witness', predictedRefusal: ['shot-bytes', 'nonce-pixels', 'scroll-pixels', 'leg-witness'], exit: out.exit, predicate: out.predicate, findings: out.findings, forgedGreen: out.exit === 0, stdout: out.stdout.slice(0, 220) });
}

// ---- CLI demo: --expect-driver-sha256 is never compared to the driver ----
{
  const out = spawnSync('node', [COUNTER, SMOKE_RECEIPT, '--driver', DRIVER, '--expect-driver-sha256', '0'.repeat(64), '--shot', SMOKE, '--json'], { cwd: ROOT, encoding: 'utf8', timeout: 120000 });
  let parsed = null; try { parsed = JSON.parse(out.stdout); } catch {}
  results.push({ id: 'C01-expect-flag-dead', class: 'cli-demo', change: '--expect-driver-sha256 000…0 (64 zeros) on the committed receipt', expectCheck: 'if the flag were live: exit 2/1; observed?', exit: out.status, predicate: parsed?.predicate ?? null, findings: parsed?.findings ?? null, stdout: (out.stdout || '').slice(0, 220) });
}

function strip(o) { const { _label, ...rest } = o; return rest; }

const summary = {
  harness: 'R64ExecNeg independent negative set (no make-negatives reuse)',
  driver: DRIVER, driverPin: DRIVER_PIN, counter: COUNTER,
  baseline: results[0],
  forgeries: results.filter((x) => x.class === 'forgery').length,
  forgedGreen: results.filter((x) => x.class === 'forgery' && x.forgedGreen).map((x) => x.id),
  predictionMismatches: results.filter((x) => x.class === 'forgery' && x.matchesPrediction === false).map((x) => ({ id: x.id, predicted: x.predictedRefusal, observed: x.findings })),
  checkCensus: {},
  results,
};
const ids = new Set();
for (const x of results) for (const f of x.findings || []) ids.add(f);
for (const x of results) if (x.findings === null && x.exit === 2) ids.add('(exit-2-usage)');
summary.checkCensus = {
  counterChecksTotal: 29,
  triggered: [...ids].filter((x) => x !== '(exit-2-usage)').sort(),
  neverTriggeredByAnyForgery: null, // filled by reporter against CHECK_IDS
};
fs.writeFileSync(path.join(ROOT, 'results.json'), JSON.stringify(summary, null, 1));
const t = (x) => (x.forgedGreen ? 'GREEN' : 'exit ' + x.exit);
console.log('baseline exit=' + baseline.exit + ' findings=' + JSON.stringify(baseline.findings));
for (const x of results.filter((y) => y.class === 'forgery' || y.class === 'forgery-invocation')) {
  console.log(x.id.padEnd(26) + t(x).padEnd(8) + ' findings=' + JSON.stringify(x.findings) + (x.matchesPrediction === false ? '  MISMATCH predicted=' + JSON.stringify(x.predictedRefusal) : ''));
}
console.log('forgedGreen=' + summary.forgedGreen.length + ' [' + summary.forgedGreen.join(',') + ']');
for (const x of results.filter((y) => y.class === 'legit-odd' || y.class === 'cli-demo')) {
  console.log(x.id.padEnd(26) + 'exit ' + x.exit + ' findings=' + JSON.stringify(x.findings));
}
console.log('triggered check ids: ' + JSON.stringify(summary.checkCensus.triggered));
