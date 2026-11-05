// R64MutDriver: generate mutant copies of the FROZEN r64 driver.
// The lane copy is read-only; every mutant is written under this scratch tree.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const SRC = path.join(LANE, 'scripts/chrome-cdp-loopback-round64.mjs');
const OUT = '/fast/scratch/hyaku/tabi-r64/R64MutDriver/mutants';
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');

const frozen = fs.readFileSync(SRC, 'utf8');
if (sha(Buffer.from(frozen)) !== '1ff560cc7f34c709a6ec8847fec9b4b6a1b55bb4818b550ae41d1dcee2b92db5') {
  throw new Error('lane driver bytes do not match the frozen pin; refusing to mutate');
}
fs.mkdirSync(OUT, { recursive: true });

const A_UP1 = "  await leg('up1', () => wheel(-120));\n";
const A_TAIL = "  receipt.wheellog = await evalValue('JSON.parse(JSON.stringify(window.__wheellog))');\n";
const A_CAPTURE = "    const shot = await capture(name);\n";
const A_WITNESS = "const WITNESS = { start: [10,20,30], down1: [40,50,60], down2: [70,80,90], up1: [100,110,120], swallowed: [130,140,150], released: [160,170,180] };";
const A_VIEWPORT = "const VIEWPORT = { width: 1280, height: 900 };";
const A_PREDICATE = "receipt.predicate = receipt.wheelHypothesis === 'CONFIRMED' && receipt.failures.length === 0 && !interrupted;";
const A_SWALLOW = "  if (window.__swallow) e.preventDefault();";
const A_NAV = "  await send('Page.navigate', { url: origin + '/?run=' + encodeURIComponent(nonce) });";
const A_VERSION = "  const ver = await send('Browser.getVersion');\n  receipt.host.cdpProduct = ver.result.product;\n  receipt.host.cdpProtocolVersion = ver.result.protocolVersion;";
const A_NONCE = "const nonce = opt('nonce');";
const A_LEGS = `  await leg('start', null);
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 200, y: 300, button: 'none', buttons: 0 });
  await leg('down1', () => wheel(120));
  await leg('down2', () => wheel(120));
  await leg('up1', () => wheel(-120));
  await evalValue('window.__swallow = true');
  await leg('swallowed', () => wheel(120));
  await evalValue('window.__swallow = false');
  await leg('released', () => wheel(120));
`;

function patch(src, anchor, replacement, label) {
  const n = src.split(anchor).length - 1;
  if (n !== 1) throw new Error(label + ': anchor occurs ' + n + ' times, expected 1');
  return src.replace(anchor, replacement);
}

const MUTANTS = {
  // 1. drop a leg: the up1 leg never runs.
  'm01-drop-leg': (s) => patch(s, A_UP1, '', 'drop-leg'),

  // 2. swap two legs' shots: down1 and up1 both sit at scrollY 120, so the
  //    band-colour check cannot see it; only the witness strip can.
  'm02-swap-shots': (s) => patch(s, A_TAIL, `  {
    const _l1 = receipt.legs.find((l) => l.name === 'down1'), _l2 = receipt.legs.find((l) => l.name === 'up1');
    const _t = { shot: _l1.shot, shotSha256: _l1.shotSha256, shotBytes: _l1.shotBytes };
    Object.assign(_l1, { shot: _l2.shot, shotSha256: _l2.shotSha256, shotBytes: _l2.shotBytes });
    Object.assign(_l2, _t);
  }
` + A_TAIL, 'swap-shots'),

  // 3. reuse one shot for all legs: the first capture's bytes are written under
  //    every leg's own filename, so the naming/digest checks still hold.
  'm03-one-shot': (s) => patch(s, A_CAPTURE, `    if (globalThis.__cachedShot) {
      fs.writeFileSync(path.join(outDir, name + '.png'), globalThis.__cachedShot);
      return { png: name + '.png', sha256: sha256(globalThis.__cachedShot), bytes: globalThis.__cachedShot.length };
    }
` + A_CAPTURE + `    globalThis.__cachedShot = buf;
`, 'one-shot'),

  // 4. change the witness table the page paints from.
  'm04-witness-table': (s) => patch(s, A_WITNESS, A_WITNESS.replace('down1: [40,50,60]', 'down1: [41,51,61]'), 'witness-table'),

  // 5. shrink the viewport.
  'm05-shrink-viewport': (s) => patch(s, A_VIEWPORT, "const VIEWPORT = { width: 640, height: 450 };", 'shrink-viewport'),

  // 6. report a scrollY the page never reached (patched after the producer's own
  //    verdict, so the receipt still claims CONFIRMED/predicate true).
  'm06-fake-scrolly': (s) => patch(s, A_PREDICATE, A_PREDICATE + `
legMap['down2'].scrollY = 360;
`, 'fake-scrolly'),

  // 7. the page stops swallowing the wheel, so the "swallowed" leg scrolls.
  'm07-no-swallow': (s) => patch(s, A_SWALLOW, '  if (false) e.preventDefault();', 'no-swallow'),

  // 8. the receipt reports a foreign nonce (page rendered the real one).
  'm08-foreign-nonce': (s) => patch(s, A_PREDICATE, A_PREDICATE + `
receipt.nonce = 'tabi-r64-foreign-nonce';
`, 'foreign-nonce'),

  // 8b. the driver ignores --nonce: every run renders the same nonce, so the
  //     verifier's per-run nonce binding is vacuous.
  'm08b-ignore-nonce': (s) => patch(s, A_NONCE, "const nonce = 'tabi-r64-live-a';", 'ignore-nonce'),

  // 9. skip the server-log run binding: navigate without ?run=.
  'm09-no-run-binding': (s) => patch(s, A_NAV, "  await send('Page.navigate', { url: origin + '/' });", 'no-run-binding'),

  // 10. forge the server-log entry instead of observing it: navigate without
  //     ?run= and append the entry the counter wants to see.
  'm10-forge-server-log': (s) => patch(patch(s, A_NAV, "  await send('Page.navigate', { url: origin + '/' });", 'forge-nav'), A_PREDICATE, `
serverLog.push({ path: '/', query: 'run=' + nonce, run: nonce, status: 200 });
` + A_PREDICATE, 'forge-server-log'),

  // 11. hardcode the browser identity instead of reading Browser.getVersion.
  'm11-hardcode-host': (s) => patch(s, A_VERSION, `  receipt.host.cdpProduct = 'Chrome/154.0.1.1';
  receipt.host.cdpProtocolVersion = '1.3';`, 'hardcode-host'),

  // 12. fabricate every wheel timestamp as 0.
  'm12-fake-ts': (s) => patch(s, A_TAIL, A_TAIL + `for (const _e of receipt.wheellog) _e.ts = 0;
`, 'fake-ts'),

  // 14. record launch flags the process never received: spawn without
  //     --disable-smooth-scrolling but keep it in the recorded argv.
  'm14-argv-lie': (s) => patch(s, "child = spawn(childArgv[0], childArgv.slice(1), {",
    "child = spawn(childArgv[0], childArgv.slice(1).filter((a) => a !== '--disable-smooth-scrolling'), {", 'argv-lie'),

  // 15. claim a mid-run launch witness that was never observed.
  'm15-fake-sweep': (s) => patch(s, "receipt.sweeps = { preLaunch: preLaunch.pids.length, midRun: midRunCount, postKill: swept.postKillSweepCount };",
    "receipt.sweeps = { preLaunch: preLaunch.pids.length, midRun: 1, postKill: swept.postKillSweepCount };", 'fake-sweep'),

  // 13. no wheel input at all: scroll with window.scrollTo and synthesize the
  //     wheel log. Shots are still real renderings of the fixture.
  'm13-no-wheel-input': (s) => patch(s, A_LEGS, `  const fakeWheel = (deltaY, prevented) => async () => {
    await evalValue('(() => { const e = { type: "wheel", seq: ++window.__seq, ts: 1, deltaX: 0, deltaY: ' + deltaY + ', deltaZ: 0, deltaMode: 0, ctrlKey: false, shiftKey: false, altKey: false, metaKey: false, isTrusted: true, cancelable: true, defaultPrevented: ' + prevented + ', targetId: "tall", scrollYAtDispatch: window.scrollY }; window.__wheellog.push(e); if (!' + prevented + ') window.scrollTo(0, window.scrollY + (' + deltaY + ')); return null; })()');
    await sleep(60);
    return settle();
  };
  await leg('start', null);
  await leg('down1', fakeWheel(120, false));
  await leg('down2', fakeWheel(120, false));
  await leg('up1', fakeWheel(-120, false));
  await leg('swallowed', fakeWheel(120, true));
  await leg('released', fakeWheel(120, false));
`, 'no-wheel-input'),
};

const manifest = {};
for (const [id, fn] of Object.entries(MUTANTS)) {
  const src = fn(frozen);
  const dir = path.join(OUT, id);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, 'driver.mjs');
  fs.writeFileSync(file, src);
  manifest[id] = { file, sha256: sha(Buffer.from(src)), deltaBytes: src.length - frozen.length };
}
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 1));
console.log(JSON.stringify(manifest, null, 1));
