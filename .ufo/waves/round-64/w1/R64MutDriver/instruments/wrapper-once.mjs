import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const SELF = fileURLToPath(import.meta.url);
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const out = path.resolve(opt('out'));
fs.mkdirSync(path.dirname(out), { recursive: true });
/*WHEEL-FIXTURE-BEGIN*/
const WHEEL_TEMPLATE = `<!doctype html><html><head><meta charset="utf-8"><title>tabi-r64 wheel fixture</title>
<style>
  html, body { margin: 0; padding: 0; background: #ffffff; }
  #tall { position: relative; left: 0; top: 0; width: 1280px; height: 3000px; }
  .band { position: absolute; left: 0; width: 1280px; height: 120px; pointer-events: none; }
  #noncegrid { position: fixed; z-index: 10; left: 8px; top: 8px; width: 128px; height: 32px; background: #000000; pointer-events: none; }
  #noncegrid i { position: absolute; width: 4px; height: 4px; background: #ffffff; }
  #witness { position: fixed; z-index: 10; left: 900px; top: 600px; width: 200px; height: 50px; background: rgb(10,20,30); pointer-events: none; }
</style>
<script>
window.__seq = 0;
window.__wheellog = [];
window.__scrollEvents = 0;
window.__swallow = false;
window.__nonceOnPage = null;
window.__witness = 'start';
document.addEventListener('wheel', function (e) {
  if (window.__swallow) e.preventDefault();
  window.__wheellog.push({ type: e.type, seq: ++window.__seq, ts: e.timeStamp,
    deltaX: e.deltaX, deltaY: e.deltaY, deltaZ: e.deltaZ, deltaMode: e.deltaMode,
    ctrlKey: e.ctrlKey, shiftKey: e.shiftKey, altKey: e.altKey, metaKey: e.metaKey,
    isTrusted: e.isTrusted, cancelable: e.cancelable, defaultPrevented: e.defaultPrevented,
    targetId: e.target.id || e.target.tagName, scrollYAtDispatch: window.scrollY });
}, { capture: true, passive: false });
window.addEventListener('scroll', function () { window.__scrollEvents += 1; });
const WITNESS = { start: [10,20,30], down1: [40,50,60], down2: [70,80,90], up1: [100,110,120], swallowed: [130,140,150], released: [160,170,180] };
window.__setWitness = function (name) {
  const c = WITNESS[name];
  if (!c) return null;
  window.__witness = name;
  document.getElementById('witness').style.background = 'rgb(' + c.join(',') + ')';
  return c;
};
document.addEventListener('DOMContentLoaded', function () {
  window.__nonceOnPage = document.getElementById('nonce').textContent;
  const grid = document.getElementById('noncegrid');
  const digest = window.__nonceBits;
  let html = '';
  for (let r = 0; r < 8; r++) for (let c = 0; c < 32; c++) {
    const bit = digest[r * 32 + c];
    if (bit) html += '<i style="left:' + (c * 4) + 'px;top:' + (r * 4) + 'px"></i>';
  }
  grid.innerHTML = html;
});
</script></head><body><p id="nonce" style="position:fixed;left:0;top:0;margin:0;font:0/0 monospace;color:#fff;background:#000">__NONCE__</p>
<div id="noncegrid"></div><div id="witness"></div>
<div id="tall">__BANDS__</div></body></html>`;
/*WHEEL-FIXTURE-END*/

const REAL = '/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/chrome-cdp-loopback-round64.mjs';
const cache = path.join(path.dirname(path.dirname(path.resolve(opt('scratch')))), 'cache-once');
const cached = path.join(cache, 'receipt.json');
if (!fs.existsSync(cached)) {
  fs.mkdirSync(cache, { recursive: true });
  const r = spawnSync('node', [REAL, '--scratch', path.join(cache, 'work'), '--out', cached,
    '--nonce', opt('nonce'), '--http-port', opt('http-port'), '--cdp-port', opt('cdp-port')], { encoding: 'utf8', timeout: 600000 });
  if (r.status !== 0) { console.error('inner driver failed', r.status, (r.stderr || '').slice(0, 500)); process.exit(1); }
}
const rec = JSON.parse(fs.readFileSync(cached, 'utf8'));
rec.driverSha256 = sha(fs.readFileSync(SELF));
for (const l of rec.legs) fs.copyFileSync(path.join(cache, l.shot), path.join(path.dirname(out), l.shot));
fs.writeFileSync(out, JSON.stringify(rec, null, 1));
console.log(JSON.stringify({ wrapper: 'once', nonce: rec.nonce, legs: rec.legs.length }));
