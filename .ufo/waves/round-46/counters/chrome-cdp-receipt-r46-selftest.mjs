// chrome-cdp-receipt-r46-selftest.mjs — tabi round 46, claim C1 counter selftest.
// Each case names the check it targets and turns red only through that one
// check (QUALITY 76); benign rewrites at the same sites stay green.
import crypto from 'node:crypto';

const PNG = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), crypto.randomBytes(64)]);

function honestReceipt(over = {}) {
  const fixtureNonce = crypto.randomBytes(32).toString('hex');
  return {
    schema: 'tabi-chrome-cdp-round46',
    declaredSurface: 'edge',
    nonce: crypto.randomBytes(32).toString('hex'),
    runnerSha256: over._runnerPin,
    browserPath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    browser: 'Edg/156.0.4314.50',
    protocolVersion: '1.3',
    wsHost: '127.0.0.1:53411',
    discoveryVia: 'devtools-active-port',
    devtoolsBrowserPath: '/devtools/browser/0aa2f2b1-1111-4c6e-9d1f-2c4b6f8a1b22',
    fixtureUrl: 'http://127.0.0.1:51999/',
    fixtureNonce,
    flags: ['--headless=new'],
    launchKey: 'edge-profile-3f9a2b7c1d0e',
    launchPid: 424242,
    profileDir: 'C:/scratch/run1/edge-profile-3f9a2b7c1d0e',
    preLaunchSweepCount: 0,
    midRunSweep: {
      count: 3, pids: [111, 222, 333],
      procs: [{ pid: 111, ppid: 424242, name: 'msedge.exe' }, { pid: 222, ppid: 111, name: 'msedge.exe' }, { pid: 333, ppid: 111, name: 'identity_helper.exe' }],
    },
    dom: { title: 'tabi r46 cdp loopback fixture', nonce: fixtureNonce, markerFound: true, textHead: 'x' },
    domFixtureNonce: fixtureNonce,
    pageTitle: 'tabi r46 cdp loopback fixture',
    markerFound: true,
    invocationBound: true,
    screenshotSha256: crypto.createHash('sha256').update(PNG).digest('hex'),
    pngByteLength: PNG.length,
    teardown: {
      chromeTerminated: true,
      childExit: { code: 1, sig: null },
      legacyTreeKill: { ran: true, pid: 424242, exit: 128, output: 'ERROR: The process "424242" not found.' },
      keyedSweep: { rounds: [{ round: 1, count: 2, pids: [111, 222], killed: [] }, { round: 2, count: 0, pids: [] }], postKillSweepCount: 0 },
      postKillSweepCount: 0,
    },
    t0Ms: 1000, tDomMs: 2000, tShotMs: 3000, tEndMs: 4000,
    hostOs: 'Windows_NT 10.0.26200', nodeVersion: 'v24.21.0',
    ...over,
  };
}

export function selftest(score, { RUNNER_PIN, TITLE }) {
  const cases = [];
  const runnerDigestOk = RUNNER_PIN;
  const base = () => score({
    receipt: honestReceipt({ _runnerPin: RUNNER_PIN }),
    shotBytes: PNG, runnerDigest: runnerDigestOk, shotPath: '<mem>', runnerPath: '<mem>',
  });
  const mutate = (fn) => {
    const r = honestReceipt({ _runnerPin: RUNNER_PIN });
    fn(r);
    return score({ receipt: r, shotBytes: PNG, runnerDigest: runnerDigestOk, shotPath: '<mem>', runnerPath: '<mem>' });
  };
  const ids = (f) => f.map((x) => x.id).sort();

  // 1 honest green
  cases.push({ id: 'honest-green', expect: 'pass', got: ids(base()) });
  // 2 stale schema (the r45 receipt relabeled forward)
  cases.push({ id: 'schema-stale-r45', expect: ['schema'], got: ids(mutate((r) => { r.schema = 'tabi-chrome-cdp-round45'; })) });
  // 3 cross-surface relabel (edge receipt relabeled chrome, identity kept)
  cases.push({
    id: 'cross-surface-relabel',
    expect: ['surface-identity-mismatch', 'surface-browserpath', 'launch-key-shape'],
    got: ids(mutate((r) => { r.declaredSurface = 'chrome'; })),
  });
  // 4 runner pin mismatch (bytes are not the frozen runner)
  cases.push({ id: 'runner-pin-mismatch', expect: ['runner-pin-mismatch', 'runner-self-digest-mismatch'], got: ids(score({ receipt: honestReceipt({ _runnerPin: RUNNER_PIN }), shotBytes: PNG, runnerDigest: crypto.randomBytes(32).toString('hex'), shotPath: '<mem>', runnerPath: '<mem>' })) });
  // 5 receipt names a runner digest its bytes do not carry
  cases.push({ id: 'runner-self-digest-mismatch', expect: ['runner-self-digest-mismatch'], got: ids(mutate((r) => { r.runnerSha256 = crypto.randomBytes(32).toString('hex'); })) });
  // 6 post-kill sweep nonzero (an orphan class survives)
  cases.push({ id: 'postkill-sweep-not-zero', expect: ['postkill-sweep-not-zero'], got: ids(mutate((r) => { r.teardown.postKillSweepCount = 1; })) });
  // 7 keyed sweep rounds stripped
  cases.push({ id: 'keyed-sweep-stripped', expect: ['keyed-sweep-rounds-missing'], got: ids(mutate((r) => { delete r.teardown.keyedSweep; })) });
  // 8 mid-run census empty (the token group did not bind a live launch); the
  // pids/procs consistency checks sit on the nonempty branch, so exactly the
  // census check fires
  cases.push({ id: 'midrun-census-empty', expect: ['midrun-census-empty'], got: ids(mutate((r) => { r.midRunSweep.count = 0; r.midRunSweep.pids = []; r.midRunSweep.procs = []; })) });
  // 9 mid-run census stripped entirely
  cases.push({ id: 'midrun-census-stripped', expect: ['midrun-census-missing'], got: ids(mutate((r) => { delete r.midRunSweep; })) });
  // 10 mid-run pids inconsistent with the count
  cases.push({ id: 'midrun-pids-mismatch', expect: ['midrun-pids-mismatch'], got: ids(mutate((r) => { r.midRunSweep.pids = [111, 222]; })) });
  // 11 pre-launch sweep nonzero (the key was not fresh)
  cases.push({ id: 'prelaunch-sweep-not-zero', expect: ['prelaunch-sweep-not-zero'], got: ids(mutate((r) => { r.preLaunchSweepCount = 1; })) });
  // 12 launch key from the wrong surface
  cases.push({ id: 'launch-key-shape', expect: ['launch-key-shape', 'profile-not-launch-keyed'], got: ids(mutate((r) => { r.launchKey = 'chrome-profile-aaaaaaaaaaaa'; })) });
  // 13 invocation binding broken (nonce from another run); both binding checks
  // that read domFixtureNonce fire
  cases.push({ id: 'invocation-binding', expect: ['dom-nonce-field-mismatch', 'invocation-binding'], got: ids(mutate((r) => { r.domFixtureNonce = crypto.randomBytes(32).toString('hex'); })) });
  // 14 shot digest mismatch (bytes changed after the run)
  cases.push({ id: 'shot-digest-mismatch', expect: ['shot-digest-mismatch', 'shot-length-mismatch'], got: ids(score({ receipt: honestReceipt({ _runnerPin: RUNNER_PIN }), shotBytes: Buffer.concat([PNG, Buffer.from([1])]), runnerDigest: runnerDigestOk, shotPath: '<mem>', runnerPath: '<mem>' })) });
  // 15 legacy tree-kill record stripped
  cases.push({ id: 'legacy-treekill-stripped', expect: ['legacy-treekill-unrecorded'], got: ids(mutate((r) => { delete r.teardown.legacyTreeKill; })) });
  // 16 main-child termination false
  cases.push({ id: 'chrome-terminated-false', expect: ['chrome-terminated'], got: ids(mutate((r) => { r.teardown.chromeTerminated = false; })) });

  // benign rewrites at the same sites stay green (criterion 76)
  cases.push({
    id: 'benign-field-order-and-extra-field',
    expect: 'pass',
    got: ids((() => {
      const r = honestReceipt({ _runnerPin: RUNNER_PIN });
      const extra = { ...r, note: 'operator annotation', teardown: { ...r.teardown, keyedSweep: { ...r.teardown.keyedSweep, rounds: [...r.teardown.keyedSweep.rounds].reverse() } } };
      return score({ receipt: extra, shotBytes: PNG, runnerDigest: runnerDigestOk, shotPath: '<mem>', runnerPath: '<mem>' });
    })()),
  });
  cases.push({
    id: 'benign-larger-midrun-census',
    expect: 'pass',
    got: ids(mutate((r) => {
      r.midRunSweep = { count: 5, pids: [1, 2, 3, 4, 5], procs: [1, 2, 3, 4, 5].map((n) => ({ pid: n, ppid: n === 1 ? 9 : 1, name: 'msedge.exe' })) };
    })),
  });

  let pass = 0;
  const failures = [];
  for (const c of cases) {
    const ok = c.expect === 'pass' ? c.got.length === 0 : JSON.stringify(c.got) === JSON.stringify([...c.expect].sort());
    if (ok) pass++; else failures.push(c);
  }
  const summary = { schema: 'tabi-chrome-cdp-receipt-r46-selftest', verdict: failures.length === 0 ? 'clean' : 'failed', cases: cases.length, passed: pass, failures };
  console.log(`CHROME_CDP_RECEIPT_R46_SELFTEST verdict=${summary.verdict} cases=${summary.cases} passed=${summary.passed}`);
  console.log(JSON.stringify(summary, null, 1));
  return failures.length === 0 ? 0 : 3;
}
