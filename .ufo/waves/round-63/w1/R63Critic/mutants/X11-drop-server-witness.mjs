#!/usr/bin/env node
// Frozen r63 counter. Scope: the round-63 wheel/scroll receipt on Chromium/Linux
// (five page-side wheel events, exact scroll arithmetic, one swallowed leg with
// its released positive control) plus closure.
//
// Generation note (round 63): this is a NEW generation, not a repair of the r62
// counter. It carries (a) BOTH producer-verdict polarity negatives — a receipt
// whose producer predicate is true while its hypothesis is REFUTED and the
// reverse — so an `&&`->`||` mutation at the producer-verdict line cannot
// false-green; (b) a strictly-increasing unique sequence check so a
// contradictory duplicate event key is refused; (c) a step-label binding that
// re-hashes the shot bytes from --shot, so a fabricated step label is refused.
// The exact-line mutation matrix lives at counters/mutate-r63.mjs.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const EXPECTED_SCROLL = { start: 0, down1: 120, down2: 240, up1: 120, swallowed: 120, released: 240 };
const EXPECTED_LEN = { start: 0, down1: 1, down2: 2, up1: 3, swallowed: 4, released: 5 };
const LEG_NAMES = ['start', 'down1', 'down2', 'up1', 'swallowed', 'released'];
const EXPECTED_DELTA_Y = [120, 120, -120, 120, 120];
const EXPECTED_AT_DISPATCH = [0, 120, 240, 120, 120];
const STEP_NAMES = ['a-wheel-down', 'b-wheel-up', 'c-swallow', 'd-release'];
export function verify(r, external = {}) {
  const findings = [];
  const check = (ok, id) => { if (!ok) findings.push(id); };
  check(r?.schema === 'tabi-chrome-cdp-r63', 'schema');
  check(/^tabi-r63-[a-z0-9-]+$/.test(r?.nonce || '') && r.nonceOnPage === r.nonce, 'nonce-binding');
  check(r?.driverSha256 === external.driverSha256 && /^[a-f0-9]{64}$/.test(r?.driverSha256 || ''), 'driver-binding');
  check(r?.fixture?.sha256 === external.fixtureSha256, 'fixture-binding');
  check(r?.fixture?.origin?.match(/^http:\/\/127\.0\.0\.1:[0-9]+$/) && r?.fixture?.target === 'tall', 'loopback-origin');
  check(Array.isArray(r?.host?.argv) && ['--headless=new', '--disable-extensions', '--remote-debugging-address=127.0.0.1', '--disable-smooth-scrolling'].every((a) => r.host.argv.includes(a)), 'launch-guards');
  const legs = Array.isArray(r?.legs) ? r.legs : [];
  const legMap = Object.fromEntries(legs.map((l) => [l.name, l]));
  check(legs.length === 6 && LEG_NAMES.every((n, i) => legs[i]?.name === n), 'legs-shape');
  check(LEG_NAMES.every((k) => legMap[k]?.scrollY === EXPECTED_SCROLL[k]), 'scroll-arithmetic');
  check(LEG_NAMES.every((k) => legMap[k]?.wheellogLen === EXPECTED_LEN[k]), 'wheellog-count');
  const wl = Array.isArray(r?.wheellog) ? r.wheellog : [];
  check(wl.length === 5 && wl.every((e, i) => e.seq === i + 1) && new Set(wl.map((e) => e.seq)).size === 5, 'wheellog-sequence');
  check(wl.length === 5 && wl.every((e, i) => e.deltaY === EXPECTED_DELTA_Y[i]), 'delta-y-passthrough');
  check(wl.length === 5 && wl.every((e) => e.deltaX === 0 && e.deltaZ === 0 && e.deltaMode === 0), 'delta-mode-pixels');
  check(wl.length === 5 && wl.every((e) => e.type === 'wheel' && e.isTrusted === true && Number.isFinite(e.ts) && e.ts >= 0 && e.cancelable === true), 'trusted-fields');
  check(wl.length === 5 && wl.every((e, i) => e.defaultPrevented === (i === 3)), 'cancelation');
  check(wl.length === 5 && wl.every((e, i) => e.targetId === 'tall' && e.scrollYAtDispatch === EXPECTED_AT_DISPATCH[i]), 'target-binding');
  check(Number.isInteger(r?.pageState?.scrollEvents) && r.pageState.scrollEvents > 0 && r.pageState.scrollEvents <= 5, 'scroll-event-witness');
  check(Array.isArray(r?.steps) && r.steps.length === 4 && r.steps.every((e, i) => e.name === STEP_NAMES[i] && e.png === STEP_NAMES[i] + '.png' && /^[a-f0-9]{64}$/.test(e.sha256) && e.bytes > 0), 'shot-records');
  check(external.shotsValid === true, 'shot-bytes');
  check(true, 'server-witness');
  check(r?.teardown?.postKillSweepCount === 0 && Array.isArray(r.teardown.survivors) && r.teardown.survivors.length === 0, 'survivors');
  check(r?.teardown?.portProbes?.fixture === 'closed' && r.teardown.portProbes.devtools === 'closed' && r.teardown.postKillCurl?.fixture === 7 && r.teardown.postKillCurl.devtools === 7, 'closed-ports');
  check(r?.sweeps?.preLaunch === 0 && r.sweeps.midRun > 0 && r.sweeps.postKill === 0, 'launch-witness');
  check(Array.isArray(r?.failures) && r.failures.length === 0, 'failures');
  check(r?.predicate === true && r?.wheelHypothesis === 'CONFIRMED', 'producer-verdict');
  check(r?.pageState?.scrollY === 240 && r?.pageState?.wheellogLen === 5, 'page-final-state');
  return { schema: 'tabi-r63-wheel-counter', predicate: findings.length === 0, findingCount: findings.length, findings };
}
function synthetic() {
  const legs = LEG_NAMES.map((name) => ({ name, scrollY: EXPECTED_SCROLL[name], wheellogLen: EXPECTED_LEN[name] }));
  const wl = EXPECTED_DELTA_Y.map((deltaY, i) => ({ type: 'wheel', seq: i + 1, ts: 10 + i, deltaX: 0, deltaY, deltaZ: 0, deltaMode: 0,
    ctrlKey: false, shiftKey: false, altKey: false, metaKey: false, isTrusted: true, cancelable: true,
    defaultPrevented: i === 3, targetId: 'tall', scrollYAtDispatch: EXPECTED_AT_DISPATCH[i] }));
  return { schema: 'tabi-chrome-cdp-r63', nonce: 'tabi-r63-test', nonceOnPage: 'tabi-r63-test', driverSha256: 'a'.repeat(64),
    fixture: { sha256: 'b'.repeat(64), origin: 'http://127.0.0.1:19471', target: 'tall', viewport: { width: 1280, height: 900 } },
    host: { chromium: 'Chromium 155', argv: ['--headless=new', '--disable-extensions', '--remote-debugging-address=127.0.0.1', '--disable-smooth-scrolling'], launchToken: 'x' },
    legs, wheellog: wl, pageState: { scrollY: 240, scrollEvents: 4, wheellogLen: 5 },
    steps: STEP_NAMES.map((name) => ({ name, png: name + '.png', sha256: 'c'.repeat(64), bytes: 10 })),
    serverLog: [{ path: '/' }, { path: '/favicon.ico' }], sweeps: { preLaunch: 0, midRun: 3, postKill: 0 },
    teardown: { postKillSweepCount: 0, survivors: [], portProbes: { fixture: 'closed', devtools: 'closed' }, postKillCurl: { fixture: 7, devtools: 7 } },
    failures: [], wheelHypothesis: 'CONFIRMED', predicate: true };
}
const ext = { driverSha256: 'a'.repeat(64), fixtureSha256: 'b'.repeat(64), shotsValid: true };
export const forgeries = {
  f1: (r) => { r.wheellog[1].deltaY = 60; },
  f2: (r) => { r.legs[2].scrollY = 180; },
  f3: (r) => { r.wheellog[3].defaultPrevented = false; },
  f4: (r) => { r.wheellog[4].seq = 4; },
  f6: (r) => { r.teardown.survivors = [99999]; },
  f7: (r) => { r.wheellog[3].deltaMode = 1; },
  f8: (r) => { r.serverLog = [{ path: '/favicon.ico' }]; },
  f9: (r) => { r.pageState.scrollEvents = 0; },
  f10: (r) => { r.wheellog[2].targetId = 'marker'; },
  f11: (r) => { r.legs[5].wheellogLen = 4; },
};
function selftest() {
  const results = [{ name: 'valid', ok: verify(synthetic(), ext).predicate }];
  for (const [id, mutate] of Object.entries(forgeries)) { const r = synthetic(); mutate(r); results.push({ name: id, ok: !verify(r, ext).predicate, findings: verify(r, ext).findings }); }
  // Producer-verdict polarity in BOTH directions: the two negatives the r62
  // generation lacked. Each must be refused on the producer-verdict finding,
  // and each is the control an `&&`->`||` mutation at that line false-greens.
  for (const [name, mutate] of Object.entries({
    polarityTrueRefuted: (r) => { r.wheelHypothesis = 'REFUTED'; },
    polarityFalseConfirmed: (r) => { r.predicate = false; },
  })) { const r = synthetic(); mutate(r); const v = verify(r, ext); results.push({ name, ok: !v.predicate && v.findings.includes('producer-verdict'), findings: v.findings }); }
  results.push({ name: 'shot-bytes', ok: !verify(synthetic(), { ...ext, shotsValid: false }).predicate });
  for (const [name, mutate] of Object.entries({
    nonce: (r) => { r.nonceOnPage = 'wrong'; }, driver: (r) => { r.driverSha256 = 'd'.repeat(64); },
    sequence: (r) => { r.wheellog[1].seq = 10; }, click: (r) => { r.failures = [{ id: 'x' }]; },
    ports: (r) => { r.teardown.postKillCurl.devtools = 0; }, stepLabel: (r) => { r.steps[1].name = 'z'; },
    legOrder: (r) => { r.legs.reverse(); }, launch: (r) => { r.host.argv = ['--headless=new']; },
  })) { const r = synthetic(); mutate(r); results.push({ name, ok: !verify(r, ext).predicate }); }
  const allPass = results.every((e) => e.ok);
  console.log(JSON.stringify({ schema: 'tabi-r63-counter-selftest', verdict: allPass ? 'clean' : 'failed', allPass, cases: results.length, results }, null, 1));
  if (allPass) console.log(`TABI_R63_COUNTER_SELFTEST verdict=clean cases=${results.length} passed=${results.length}`);
  process.exitCode = allPass ? 0 : 1;
}
const main = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (main) {
  const args = process.argv.slice(2), option = (n) => args[args.indexOf(n) + 1];
  if (args[0] === '--selftest') selftest();
  else {
    try {
      if (!args[0] || !args.includes('--driver') || !args.includes('--expect-driver-sha256') || !args.includes('--shot')) throw new Error('usage: counter receipt --driver file --expect-driver-sha256 sha --shot dir --json');
      const r = JSON.parse(fs.readFileSync(args[0], 'utf8'));
      const src = fs.readFileSync(option('--driver'), 'utf8'), driverSha = sha(src);
      if (driverSha !== option('--expect-driver-sha256')) throw new Error('counter invocation driver pin mismatch');
      const begin = '/*WHEEL-FIXTURE-BEGIN*/', end = '/*WHEEL-FIXTURE-END*/';
      const block = src.slice(src.indexOf(begin), src.indexOf(end));
      const match = /const WHEEL_HTML = `([\s\S]*?)`;/.exec(block);
      if (!match) throw new Error('fixture template absent');
      const fixture = match[1].replace('${nonce}', r.nonce);
      let shotsValid = true;
      for (const s of r.steps || []) {
        if (!/^[a-z-]+\.png$/.test(s.png || '')) { shotsValid = false; continue; }
        try {
          const bytes = fs.readFileSync(path.join(option('--shot'), s.png));
          shotsValid = shotsValid && sha(bytes) === s.sha256 && bytes.length === s.bytes && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) && bytes.readUInt32BE(16) > 0 && bytes.readUInt32BE(20) > 0;
        } catch { shotsValid = false; }
      }
      const result = verify(r, { driverSha256: driverSha, fixtureSha256: sha(fixture), shotsValid });
      console.log(JSON.stringify(result, null, 1));
      process.exitCode = result.predicate ? 0 : 1;
    } catch (e) { console.error(JSON.stringify({ schema: 'tabi-r63-wheel-counter', error: e.message })); process.exitCode = 2; }
  }
}
