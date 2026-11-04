#!/usr/bin/env node
// R63ExecNeg independent forgery set for C1 (round 63, lane tabi).
//
// Standalone by design: this file does not import, copy, wrap or shell out to
// .ufo/waves/round-63/counters/make-negatives-r63.mjs, and it never reads the
// committed negatives/ or negatives-data/ receipts. The base for every negative
// is the committed smoke control receipt named on the command line; each case
// mutates exactly one thing and is written to this wave dir.
//
// Read-only with respect to the lane: the frozen counter, driver, control
// receipt and control PNGs are only opened for reading.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const WAVE = path.join(LANE, '.ufo/waves/round-63/w1/R63ExecNeg');
const COUNTER = path.join(LANE, '.ufo/waves/round-63/counters/chromium-wheel-r63.mjs');
const DRIVER = path.join(LANE, 'scripts/chrome-cdp-loopback-round63.mjs');
const PIN = 'b00efd59ac10fd047014b76b2a5d16cc8b0acaab0730e8c6029a0b53a0d6c040';
const BASE = path.join(LANE, '.ufo/waves/round-63/controls/smoke/receipt-run1.json');
const SMOKE = path.join(LANE, '.ufo/waves/round-63/controls/smoke');
const LIVE = path.join(LANE, 'corpus/evidence/round63/chromium-wheel-scroll');

const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const shaFile = (p) => sha(fs.readFileSync(p));
const clone = (o) => JSON.parse(JSON.stringify(o));

// Reproduces the counter's fixture derivation exactly, so a probe can recompute
// the hash an attacker controls: slice the frozen driver between the marker
// comments, pull the WHEEL_HTML template, substitute the nonce, hash.
const DRIVER_SRC = fs.readFileSync(DRIVER, 'utf8');
function fixtureShaForNonce(nonce) {
  const begin = '/*WHEEL-FIXTURE-BEGIN*/', end = '/*WHEEL-FIXTURE-END*/';
  const block = DRIVER_SRC.slice(DRIVER_SRC.indexOf(begin), DRIVER_SRC.indexOf(end));
  const m = /const WHEEL_HTML = `([\s\S]*?)`;/.exec(block);
  if (!m) throw new Error('fixture template absent');
  return sha(Buffer.from(m[1].replace('${nonce}', nonce), 'utf8'));
}

// ---------------------------------------------------------------------------
// Case table. `cls` negative = attacks a check the counter claims (must exit 1
// on that check); probe = receipt field the counter does not claim (green is
// expected and is NOT a forgedGreen; red would mean the counter is stricter
// than documented); invocation = CLI-level attack via argv; positive = the
// untouched receipt (must exit 0); selftest = the counter's own selftest.
// ---------------------------------------------------------------------------
const cases = [
  // --- the ten mandated single-field negatives -----------------------------
  { id: 'n01-producer-true-hypothesis-refuted', cls: 'negative', mandatory: 'i',
    check: 'producer-verdict', line: 54,
    what: 'predicate stays true while wheelHypothesis is flipped to REFUTED',
    expect: ['producer-verdict'],
    mutate: (r) => { r.wheelHypothesis = 'REFUTED'; } },
  { id: 'n02-producer-false-hypothesis-confirmed', cls: 'negative', mandatory: 'ii',
    check: 'producer-verdict', line: 54,
    what: 'wheelHypothesis stays CONFIRMED while predicate is flipped to false',
    expect: ['producer-verdict'],
    mutate: (r) => { r.predicate = false; } },
  { id: 'n03-duplicate-seq-contradictory', cls: 'negative', mandatory: 'iii',
    check: 'wheellog-sequence', line: 40,
    what: 'wheellog[5].seq set to 4: two entries share key 4 with different ts/defaultPrevented',
    expect: ['wheellog-sequence'],
    mutate: (r) => { r.wheellog[4].seq = 4; } },
  { id: 'n04-fabricated-step-sha', cls: 'negative', mandatory: 'iv',
    check: 'shot-bytes', line: 48,
    what: 'steps[1].sha256 replaced by the sha256 of bytes that exist in no shot file',
    expect: ['shot-bytes'],
    mutate: (r) => { r.steps[1].sha256 = sha(Buffer.from('r63-forged-step-bytes')); } },
  { id: 'n05-scroll-arithmetic-down2', cls: 'negative', mandatory: 'v',
    check: 'scroll-arithmetic', line: 37,
    what: 'legs[2].scrollY 240 -> 239 (exact arithmetic off by one)',
    expect: ['scroll-arithmetic'],
    mutate: (r) => { r.legs[2].scrollY = 239; } },
  { id: 'n06-swallowed-leg-moved', cls: 'negative', mandatory: 'vi',
    check: 'scroll-arithmetic', line: 37,
    what: 'legs[4].scrollY 120 -> 240: the swallowed leg is allowed to move',
    expect: ['scroll-arithmetic'],
    mutate: (r) => { r.legs[4].scrollY = 240; } },
  { id: 'n07-delta-y-mutated', cls: 'negative', mandatory: 'vii',
    check: 'delta-y-passthrough', line: 41,
    what: 'wheellog[0].deltaY 120 -> 121',
    expect: ['delta-y-passthrough'],
    mutate: (r) => { r.wheellog[0].deltaY = 121; } },
  { id: 'n08-teardown-survivor', cls: 'negative', mandatory: 'viii',
    check: 'survivors', line: 50,
    what: 'teardown.survivors [] -> [4242] while postKillSweepCount stays 0',
    expect: ['survivors'],
    mutate: (r) => { r.teardown.survivors = [4242]; } },
  { id: 'n09-nonce-page-mismatch', cls: 'negative', mandatory: 'ix',
    check: 'nonce-binding', line: 29,
    what: 'nonceOnPage changed to a different well-formed nonce (nonce untouched)',
    expect: ['nonce-binding'],
    mutate: (r) => { r.nonceOnPage = 'tabi-r63-smoke-two'; } },
  { id: 'n10-launch-guard-removed', cls: 'negative', mandatory: 'x',
    check: 'launch-guards', line: 33,
    what: '--disable-smooth-scrolling removed from host.argv',
    expect: ['launch-guards'],
    mutate: (r) => { r.host.argv = r.host.argv.filter((a) => a !== '--disable-smooth-scrolling'); } },

  // --- one negative per remaining check ------------------------------------
  { id: 'n11-schema', cls: 'negative', check: 'schema', line: 28,
    what: 'schema -> tabi-chrome-cdp-r62', expect: ['schema'],
    mutate: (r) => { r.schema = 'tabi-chrome-cdp-r62'; } },
  { id: 'n12-driver-binding', cls: 'negative', check: 'driver-binding', line: 30,
    what: 'driverSha256 -> 64 hex chars that are not the driver', expect: ['driver-binding'],
    mutate: (r) => { r.driverSha256 = 'd'.repeat(64); } },
  { id: 'n13-fixture-binding', cls: 'negative', check: 'fixture-binding', line: 31,
    what: 'fixture.sha256 -> 64 hex chars that are not the fixture', expect: ['fixture-binding'],
    mutate: (r) => { r.fixture.sha256 = 'e'.repeat(64); } },
  { id: 'n14-loopback-origin', cls: 'negative', check: 'loopback-origin', line: 32,
    what: 'fixture.origin host 127.0.0.1 -> localhost', expect: ['loopback-origin'],
    mutate: (r) => { r.fixture.origin = 'http://localhost:19481'; } },
  { id: 'n15-legs-reordered', cls: 'negative', check: 'legs-shape', line: 36,
    what: 'legs[4] and legs[5] swapped (names/values travel with them)', expect: ['legs-shape'],
    mutate: (r) => { const t = r.legs[4]; r.legs[4] = r.legs[5]; r.legs[5] = t; } },
  { id: 'n16-leg-wheellog-count', cls: 'negative', check: 'wheellog-count', line: 38,
    what: 'legs[4].wheellogLen 4 -> 3', expect: ['wheellog-count'],
    mutate: (r) => { r.legs[4].wheellogLen = 3; } },
  { id: 'n17-delta-mode', cls: 'negative', check: 'delta-mode-pixels', line: 42,
    what: 'wheellog[2].deltaMode 0 -> 1', expect: ['delta-mode-pixels'],
    mutate: (r) => { r.wheellog[2].deltaMode = 1; } },
  { id: 'n18-trusted', cls: 'negative', check: 'trusted-fields', line: 43,
    what: 'wheellog[0].isTrusted true -> false', expect: ['trusted-fields'],
    mutate: (r) => { r.wheellog[0].isTrusted = false; } },
  { id: 'n19-cancelation-released', cls: 'negative', check: 'cancelation', line: 44,
    what: 'wheellog[3].defaultPrevented true -> false (the swallowed leg is released)',
    expect: ['cancelation'],
    mutate: (r) => { r.wheellog[3].defaultPrevented = false; } },
  { id: 'n20-target-binding-dispatch-y', cls: 'negative', check: 'target-binding', line: 45,
    what: 'wheellog[2].scrollYAtDispatch 240 -> 239', expect: ['target-binding'],
    mutate: (r) => { r.wheellog[2].scrollYAtDispatch = 239; } },
  { id: 'n21-scroll-event-witness', cls: 'negative', check: 'scroll-event-witness', line: 46,
    what: 'pageState.scrollEvents 4 -> 0', expect: ['scroll-event-witness'],
    mutate: (r) => { r.pageState.scrollEvents = 0; } },
  { id: 'n22-step-label-fabricated', cls: 'negative', check: 'shot-records', line: 47,
    what: 'steps[1].name -> b-fabricated (png/sha/bytes untouched)', expect: ['shot-records'],
    mutate: (r) => { r.steps[1].name = 'b-fabricated'; } },
  { id: 'n23-server-witness-foreign-path', cls: 'negative', check: 'server-witness', line: 49,
    what: 'serverLog -> [{path:/index.html}]: no / and a foreign path',
    expect: ['server-witness'],
    mutate: (r) => { r.serverLog = [{ path: '/index.html', query: '' }]; } },
  { id: 'n24-closed-ports-devtools', cls: 'negative', check: 'closed-ports', line: 51,
    what: 'teardown.portProbes.devtools closed -> open', expect: ['closed-ports'],
    mutate: (r) => { r.teardown.portProbes.devtools = 'open'; } },
  { id: 'n25-launch-witness-midrun', cls: 'negative', check: 'launch-witness', line: 52,
    what: 'sweeps.midRun 13 -> 0 (no child observed mid-run)', expect: ['launch-witness'],
    mutate: (r) => { r.sweeps.midRun = 0; } },
  { id: 'n26-failures-recorded', cls: 'negative', check: 'failures', line: 53,
    what: 'failures [] -> [{id:wheel-dispatch}]', expect: ['failures'],
    mutate: (r) => { r.failures = [{ id: 'wheel-dispatch' }]; } },
  { id: 'n27-page-final-state', cls: 'negative', check: 'page-final-state', line: 55,
    what: 'pageState.scrollY 240 -> 239', expect: ['page-final-state'],
    mutate: (r) => { r.pageState.scrollY = 239; } },

  // --- second passes on the same checks, different field -------------------
  { id: 'n28-shot-length-lie', cls: 'negative', check: 'shot-bytes', line: 48,
    what: 'steps[0].bytes 14275 -> 14276 with a correct sha256', expect: ['shot-bytes'],
    mutate: (r) => { r.steps[0].bytes = 14276; } },
  { id: 'n29-step-sha-borrowed-real-file', cls: 'negative', check: 'shot-bytes', line: 48,
    what: 'steps[3].sha256 set to the a-wheel-down hash (a real shot, not its own)',
    expect: ['shot-bytes'],
    mutate: (r) => { r.steps[3].sha256 = r.steps[0].sha256; } },
  { id: 'n30-launch-guards-all-removed', cls: 'negative', check: 'launch-guards', line: 33,
    what: 'host.argv -> [--headless=new]', expect: ['launch-guards'],
    mutate: (r) => { r.host.argv = ['--headless=new']; } },
  { id: 'n31-sequence-gap', cls: 'negative', check: 'wheellog-sequence', line: 40,
    what: 'wheellog[2].seq 3 -> 4 (gap + collision)', expect: ['wheellog-sequence'],
    mutate: (r) => { r.wheellog[2].seq = 4; } },
  { id: 'n32-sequence-swap', cls: 'negative', check: 'wheellog-sequence', line: 40,
    what: 'seq of wheellog[0] and wheellog[1] swapped (unique set intact, order broken)',
    expect: ['wheellog-sequence'],
    mutate: (r) => { const a = r.wheellog[0].seq; r.wheellog[0].seq = r.wheellog[1].seq; r.wheellog[1].seq = a; } },
  { id: 'n33-nonce-format', cls: 'negative', check: 'nonce-binding', line: 29,
    what: 'nonce and nonceOnPage -> tabi-r63-BAD_NONCE (regex + fixture binding)',
    expect: ['nonce-binding', 'fixture-binding'],
    mutate: (r) => { r.nonce = 'tabi-r63-BAD_NONCE'; r.nonceOnPage = 'tabi-r63-BAD_NONCE'; } },
  { id: 'n34-nonce-page-empty', cls: 'negative', check: 'nonce-binding', line: 29,
    what: 'nonceOnPage -> empty string', expect: ['nonce-binding'],
    mutate: (r) => { r.nonceOnPage = ''; } },
  { id: 'n35-postkill-sweep-count', cls: 'negative', check: 'survivors', line: 50,
    what: 'teardown.postKillSweepCount 0 -> 1 (survivors list untouched)',
    expect: ['survivors'],
    mutate: (r) => { r.teardown.postKillSweepCount = 1; } },
  { id: 'n36-postkill-curl', cls: 'negative', check: 'closed-ports', line: 51,
    what: 'teardown.postKillCurl.fixture 7 -> 0', expect: ['closed-ports'],
    mutate: (r) => { r.teardown.postKillCurl.fixture = 0; } },
  { id: 'n37-delta-x', cls: 'negative', check: 'delta-mode-pixels', line: 42,
    what: 'wheellog[1].deltaX 0 -> 1', expect: ['delta-mode-pixels'],
    mutate: (r) => { r.wheellog[1].deltaX = 1; } },
  { id: 'n38-type-scroll', cls: 'negative', check: 'trusted-fields', line: 43,
    what: "wheellog[0].type wheel -> scroll", expect: ['trusted-fields'],
    mutate: (r) => { r.wheellog[0].type = 'scroll'; } },
  { id: 'n39-ts-negative', cls: 'negative', check: 'trusted-fields', line: 43,
    what: 'wheellog[0].ts 15 -> -1', expect: ['trusted-fields'],
    mutate: (r) => { r.wheellog[0].ts = -1; } },
  { id: 'n40-server-witness-empty', cls: 'negative', check: 'server-witness', line: 49,
    what: 'serverLog -> [] (no request witnessed)', expect: ['server-witness'],
    mutate: (r) => { r.serverLog = []; } },
  { id: 'n41-duplicate-seq-appended', cls: 'negative', check: 'wheellog-sequence', line: 40,
    what: 'append a contradictory duplicate of wheellog[3] (seq 4, different ts) so the array is 6 long',
    expect: ['wheellog-sequence', 'delta-y-passthrough', 'delta-mode-pixels', 'trusted-fields', 'cancelation', 'target-binding'],
    mutate: (r) => { r.wheellog.push({ ...r.wheellog[3], ts: 900 }); } },
  { id: 'n42-extra-wheellog-event', cls: 'negative', check: 'wheellog-sequence', line: 40,
    what: 'append a sixth event seq 6 (length-guarded checks all trip)',
    expect: ['wheellog-sequence', 'delta-y-passthrough', 'delta-mode-pixels', 'trusted-fields', 'cancelation', 'target-binding'],
    mutate: (r) => { r.wheellog.push({ ...r.wheellog[4], seq: 6, ts: 1000 }); } },

  // --- probes: receipt surfaces the counter does not claim to check --------
  { id: 'p01-ts-not-monotonic', cls: 'probe', check: 'trusted-fields (ts ordering: not claimed)',
    line: 43, what: 'ts of wheellog[0] and wheellog[2] swapped: 427, 255.2, 15, 605.4, 755.2',
    mutate: (r) => { const t = r.wheellog[0].ts; r.wheellog[0].ts = r.wheellog[2].ts; r.wheellog[2].ts = t; } },
  { id: 'p02-declaredStepNames-foreign', cls: 'probe', check: 'declaredStepNames (not read by the counter)',
    line: 47, what: "declaredStepNames -> ['x','y','z','w']",
    mutate: (r) => { r.declaredStepNames = ['x', 'y', 'z', 'w']; } },
  { id: 'p03-viewport-lie', cls: 'probe', check: 'fixture.viewport (not read)',
    line: 31, what: 'fixture.viewport -> {width:1,height:1}',
    mutate: (r) => { r.fixture.viewport = { width: 1, height: 1 }; } },
  { id: 'p04-host-chromium-lie', cls: 'probe', check: 'host.chromium (not read)',
    line: 33, what: 'host.chromium -> "Firefox 128.0"',
    mutate: (r) => { r.host.chromium = 'Firefox 128.0'; } },
  { id: 'p05-unknown-field', cls: 'probe', check: 'unknown top-level field (not read)',
    line: 28, what: 'extra top-level field forged:true',
    mutate: (r) => { r.forged = true; } },
  { id: 'p06-origin-port-zero', cls: 'probe', check: 'loopback-origin port range (regex accepts 0)',
    line: 32, what: 'fixture.origin -> http://127.0.0.1:0',
    mutate: (r) => { r.fixture.origin = 'http://127.0.0.1:0'; } },
  { id: 'p07-ctrl-modified-wheels', cls: 'probe', check: 'modifier flags (schema fields never asserted)',
    line: 43, what: 'all five events ctrlKey true (zoom-gesture shape, accepted as plain scroll)',
    mutate: (r) => { r.wheellog.forEach((e) => { e.ctrlKey = true; }); } },
  { id: 'p08-uniform-step-bytes', cls: 'probe', check: 'shot-bytes distinctness (never claimed)',
    line: 48, what: 'all four steps claim one PNG hash and the shot dir holds four copies of it',
    shotDir: path.join(WAVE, 'shot-uniform'),
    mutate: (r) => { r.steps.forEach((s) => { s.sha256 = r.steps[0].sha256; s.bytes = r.steps[0].bytes; }); } },
  { id: 'p09-ts-duplicate', cls: 'probe', check: 'ts uniqueness (only seq is keyed)',
    line: 43, what: 'all five ts set to 15: five distinct seq keys, one timestamp',
    mutate: (r) => { r.wheellog.forEach((e) => { e.ts = 15; }); } },
  { id: 'p10-nonce-rebound', cls: 'probe', check: 'nonce/fixture binding is self-consistent only',
    line: 29, what: 'nonce -> tabi-r63-forged-one with fixture.sha256 recomputed from the frozen driver bytes',
    mutate: (r) => { r.nonce = 'tabi-r63-forged-one'; r.nonceOnPage = r.nonce; r.fixture.sha256 = fixtureShaForNonce(r.nonce); } },
  { id: 'p12-scroll-events-in-range', cls: 'probe', check: 'scroll-event-witness bounds 1..5 (line 46)',
    line: 46, what: 'pageState.scrollEvents 4 -> 3 (still inside the accepted 1..5 band)',
    mutate: (r) => { r.pageState.scrollEvents = 3; } },
  { id: 'p11-duplicate-json-key', cls: 'probe', check: 'JSON duplicate keys (JSON.parse last-wins at line 114)',
    line: 114, what: 'raw text gains an earlier "predicate": false before the real "predicate": true; parsed value unchanged',
    raw: (t) => t.replace('"predicate": true', '"predicate": false,\n "predicate": true') },
];

// ---------------------------------------------------------------------------
// Invocation-level cases (the receipt is the untouched base; the attack is in
// the argv the production CLI is handed).
// ---------------------------------------------------------------------------
const invocation = [
  { id: 'i01-shot-dir-swapped-bytes', expectExit: 1, expect: ['shot-bytes'],
    what: '--shot points at a copy dir whose four PNGs are byte-swapped between steps',
    shotDir: path.join(WAVE, 'shot-swapped') },
  { id: 'i02-shot-dir-missing-file', expectExit: 1, expect: ['shot-bytes'],
    what: '--shot points at a copy dir missing d-release.png',
    shotDir: path.join(WAVE, 'shot-missing') },
  { id: 'i03-shot-dir-absent', expectExit: 1, expect: ['shot-bytes'],
    what: '--shot points at a nonexistent path',
    shotDir: path.join(WAVE, 'shot-absent-does-not-exist') },
  { id: 'i04-driver-pin-wrong', expectExit: 2, expect: [],
    what: '--expect-driver-sha256 is 64 f characters',
    pin: 'f'.repeat(64) },
  { id: 'i05-driver-file-missing', expectExit: 2, expect: [],
    what: '--driver points at a nonexistent file',
    driver: path.join(WAVE, 'driver-absent-does-not-exist.mjs') },
];

const positives = [
  { id: 'P0-smoke-run1', receipt: path.join(SMOKE, 'receipt-run1.json'), shotDir: SMOKE },
  { id: 'P1-smoke-run2', receipt: path.join(SMOKE, 'receipt-run2.json'), shotDir: SMOKE },
  { id: 'P2-data-live', receipt: path.join(LIVE, 'receipt.json'), shotDir: LIVE },
];

function runNode(argv, cwd) {
  const p = spawnSync(argv[0], argv.slice(1), { cwd, encoding: 'utf8', maxBuffer: 16 << 20 });
  return { status: p.status, stdout: p.stdout ?? '', stderr: p.stderr ?? '', signal: p.signal };
}
function parseJson(s) { try { return JSON.parse(s); } catch { return null; } }

function main() {
  for (const d of ['negatives', 'probes', 'raw', 'commands']) fs.mkdirSync(path.join(WAVE, d), { recursive: true });
  const baseBytes = fs.readFileSync(BASE);
  const baseText = baseBytes.toString('utf8');
  const base = JSON.parse(baseText);
  const baseSha = sha(baseBytes);

  // invocation shot fixtures: copies of the committed PNG bytes, rearranged.
  fs.mkdirSync(path.join(WAVE, 'shot-swapped'), { recursive: true });
  fs.mkdirSync(path.join(WAVE, 'shot-missing'), { recursive: true });
  const png = (n) => fs.readFileSync(path.join(SMOKE, n));
  fs.writeFileSync(path.join(WAVE, 'shot-swapped', 'a-wheel-down.png'), png('d-release.png'));
  fs.writeFileSync(path.join(WAVE, 'shot-swapped', 'b-wheel-up.png'), png('d-release.png'));
  fs.writeFileSync(path.join(WAVE, 'shot-swapped', 'c-swallow.png'), png('d-release.png'));
  fs.writeFileSync(path.join(WAVE, 'shot-swapped', 'd-release.png'), png('a-wheel-down.png'));
  for (const n of ['a-wheel-down.png', 'b-wheel-up.png', 'c-swallow.png']) {
    fs.writeFileSync(path.join(WAVE, 'shot-missing', n), png(n));
  }
  fs.mkdirSync(path.join(WAVE, 'shot-uniform'), { recursive: true });
  for (const n of ['a-wheel-down.png', 'b-wheel-up.png', 'c-swallow.png', 'd-release.png']) {
    fs.writeFileSync(path.join(WAVE, 'shot-uniform', n), png('a-wheel-down.png'));
  }

  const written = [];
  for (const c of cases) {
    const r = clone(base);
    if (c.mutate) c.mutate(r);
    const dir = c.cls === 'negative' ? 'negatives' : 'probes';
    const file = path.join(WAVE, dir, c.id + '.json');
    const text = c.raw ? c.raw(baseText) : JSON.stringify(r, null, 1);
    fs.writeFileSync(file, text.endsWith('\n') ? text : text + '\n');
    written.push({ ...c, receipt: file, shotDir: c.shotDir ?? SMOKE, receiptSha256: shaFile(file) });
  }

  const results = [];
  const record = (id, cls, argv, cwd, expected, extra) => {
    const out = runNode(argv, cwd);
    const parsed = parseJson(out.stdout);
    const findings = parsed?.findings ?? null;
    const predicate = parsed?.predicate ?? null;
    const exp = expected.expectExit;
    let verdict;
    if (cls === 'negative' || cls === 'negative-rebased') {
      if (out.status === 0) verdict = 'FORGED-GREEN';
      else if (out.status !== 1) verdict = 'WRONG-EXIT';
      else if (!findings || !expected.expect.every((f) => findings.includes(f))) verdict = 'WRONG-FINDING';
      else verdict = 'refused';
    } else if (cls === 'probe') {
      verdict = out.status === 0 ? 'green (unclaimed surface)' : 'refused (stricter than documented)';
    } else if (cls === 'invocation') {
      verdict = out.status === exp ? 'refused' : 'WRONG-EXIT';
    } else if (cls === 'positive') {
      verdict = out.status === 0 && predicate === true ? 'accepted' : 'REJECTED-POSITIVE';
    } else if (cls === 'selftest') {
      verdict = out.status === 0 ? 'clean' : 'FAILED';
    }
    const rec = {
      id, cls, cwd, argv, exit: out.status, signal: out.signal,
      expectedExit: exp ?? null, expectedFindings: expected.expect ?? null,
      predicate, findingCount: parsed?.findingCount ?? null, findings,
      unexpectedFindings: (cls === 'negative' || cls === 'negative-rebased') && findings ? findings.filter((f) => !expected.expect.includes(f)) : null,
      error: parseJson(out.stderr)?.error ?? null,
      verdict, ...extra,
    };
    fs.writeFileSync(path.join(WAVE, 'raw', id + '.stdout'), out.stdout);
    fs.writeFileSync(path.join(WAVE, 'raw', id + '.stderr'), out.stderr);
    fs.writeFileSync(path.join(WAVE, 'commands', id + '.command.json'),
      JSON.stringify({ schema: 'tabi-r63-forgery-command-v1', id, argv, cwd, exit: out.status,
        stdoutFile: 'raw/' + id + '.stdout', stderrFile: 'raw/' + id + '.stderr' }, null, 1) + '\n');
    results.push(rec);
    const label = verdict === 'refused' || verdict === 'accepted' || verdict === 'clean' ? 'ok' : '!!';
    console.log(`${label} ${id} exit=${out.status} findings=${findings ? findings.join(',') : '-'} verdict=${verdict}`);
    return rec;
  };

  const cwd = LANE;
  const counterArgs = (receipt, shotDir, pin = PIN, driver = DRIVER) =>
    ['node', COUNTER, receipt, '--driver', driver, '--expect-driver-sha256', pin, '--shot', shotDir, '--json'];

  // selftest
  record('ST-selftest', 'selftest', ['node', COUNTER, '--selftest'], cwd, {});

  // positives
  for (const p of positives) {
    record(p.id, 'positive', counterArgs(p.receipt, p.shotDir), cwd, {},
      { receipt: p.receipt, shotDir: p.shotDir, receiptSha256: shaFile(p.receipt) });
  }

  // negatives
  for (const w of written.filter((x) => x.cls === 'negative')) {
    record(w.id, 'negative', counterArgs(w.receipt, w.shotDir), cwd,
      { expectExit: 1, expect: w.expect },
      { receipt: w.receipt, shotDir: w.shotDir, receiptSha256: w.receiptSha256,
        targets: { check: w.check, counterLine: w.line }, mutation: w.what, mandatory: w.mandatory ?? null });
  }

  // the ten mandated attacks re-based on the scored data receipt: the checks are
  // constant-driven, so each single change must be refused on either base.
  const liveBytes = fs.readFileSync(path.join(LIVE, 'receipt.json'));
  const liveBase = JSON.parse(liveBytes.toString('utf8'));
  fs.mkdirSync(path.join(WAVE, 'rebased'), { recursive: true });
  for (const c of cases.filter((x) => x.cls === 'negative' && x.mandatory)) {
    const r = clone(liveBase);
    c.mutate(r);
    const file = path.join(WAVE, 'rebased', c.id + '.json');
    fs.writeFileSync(file, JSON.stringify(r, null, 1) + '\n');
    record('R-' + c.id, 'negative-rebased', counterArgs(file, LIVE), cwd,
      { expectExit: 1, expect: c.expect },
      { receipt: file, shotDir: LIVE, receiptSha256: shaFile(file),
        targets: { check: c.check, counterLine: c.line }, mutation: c.what, base: 'data-live' });
  }

  // probes
  for (const w of written.filter((x) => x.cls === 'probe')) {
    record(w.id, 'probe', counterArgs(w.receipt, w.shotDir), cwd, {},
      { receipt: w.receipt, receiptSha256: w.receiptSha256,
        targets: { surface: w.check, counterLine: w.line }, mutation: w.what });
  }

  // invocation
  for (const i of invocation) {
    record(i.id, 'invocation', counterArgs(BASE, i.shotDir ?? SMOKE, i.pin, i.driver), cwd,
      { expectExit: i.expectExit, expect: i.expect },
      { receipt: BASE, shotDir: i.shotDir ?? SMOKE, mutation: i.what });
  }

  const neg = results.filter((r) => r.cls === 'negative');
  const summary = {
    schema: 'tabi-r63-execneg-results-v1',
    base: { path: BASE, sha256: baseSha, sha256PinnedByControl: true },
    counter: { path: COUNTER, sha256: shaFile(COUNTER) },
    driver: { path: DRIVER, sha256: shaFile(DRIVER), pin: PIN },
    selftest: results.find((r) => r.cls === 'selftest'),
    positives: results.filter((r) => r.cls === 'positive'),
    negatives: { count: neg.length,
      refused: neg.filter((r) => r.verdict === 'refused').length,
      forgedGreen: neg.filter((r) => r.verdict === 'FORGED-GREEN').map((r) => r.id),
      wrongExit: neg.filter((r) => r.verdict === 'WRONG-EXIT').map((r) => r.id),
      wrongFinding: neg.filter((r) => r.verdict === 'WRONG-FINDING').map((r) => r.id) },
    rebased: results.filter((r) => r.cls === 'negative-rebased').map((r) => ({ id: r.id, exit: r.exit, findings: r.findings, verdict: r.verdict, receiptSha256: r.receiptSha256 })),
    probes: results.filter((r) => r.cls === 'probe').map((r) => ({ id: r.id, exit: r.exit, predicate: r.predicate, findings: r.findings, verdict: r.verdict })),
    invocation: results.filter((r) => r.cls === 'invocation').map((r) => ({ id: r.id, exit: r.exit, expectedExit: r.expectedExit, findings: r.findings, verdict: r.verdict })),
    results,
  };
  fs.writeFileSync(path.join(WAVE, 'results.json'), JSON.stringify(summary, null, 1) + '\n');
  fs.writeFileSync(path.join(WAVE, 'manifest.json'), JSON.stringify({
    schema: 'tabi-r63-execneg-manifest-v1',
    base: { path: BASE, sha256: baseSha, nonce: base.nonce },
    counterSha256: shaFile(COUNTER), driverSha256: shaFile(DRIVER), pin: PIN,
    cases: written.map((w) => ({ id: w.id, cls: w.cls, mandatory: w.mandatory ?? null,
      targets: { check: w.check, counterLine: w.line }, mutation: w.what,
      expectedFindings: w.expect ?? null, receipt: path.relative(LANE, w.receipt), receiptSha256: w.receiptSha256 })),
    invocation: invocation.map((i) => ({ id: i.id, mutation: i.what, shotDir: i.shotDir ?? SMOKE,
      driver: i.driver ?? DRIVER, pin: i.pin ?? PIN, expectedExit: i.expectExit, expectedFindings: i.expect })),
    positives: positives.map((p) => ({ id: p.id, receipt: p.receipt, shotDir: p.shotDir, receiptSha256: shaFile(p.receipt) })),
  }, null, 1) + '\n');
  console.log(JSON.stringify({ negatives: neg.length, rebased: summary.rebased.length, forgedGreen: summary.negatives.forgedGreen,
    wrongExit: summary.negatives.wrongExit, wrongFinding: summary.negatives.wrongFinding }, null, 1));
}

main();
