// Boundary forgery v2: replay probe1, rewrite identity, move exactly k page events.
// `ts` moves +0.1 for each selected event (order not checked on ts); the >=50 ms gap's later
// bound moves `at` +0.2 (it is the last event of its leg, so the leg order is preserved).
import fs from 'node:fs';
import crypto from 'node:crypto';
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const SRC = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-79/controls/c1/probes/probe1.json';
const k = Number(process.argv[2] || 19);
const outPath = process.argv[3] || '/fast/scratch/hyaku/tabi-r79/R79Critic/forged.json';
const laneName = process.argv[4] || 'lane';
const p = JSON.parse(fs.readFileSync(SRC, 'utf8'));
const NONCE = 'tabi-r79-forge' + k;
const HTTP = 18950, CDP = 18951;
const hex = (n) => crypto.randomBytes(n).toString('hex');
const uuid = () => crypto.randomUUID();

p.lane = laneName;
p.nonce = NONCE;
p.driverSha256 = 'e9c87159e5d5212237437eb7a80a2d26fcd8086603dae1e37db64ce1aaf94933';
p.fixture.sha256 = sha256(JSON.stringify(p.fixture.patch));
p.fixture.origin = 'http://127.0.0.1:' + HTTP;
p.ports = { http: HTTP, cdp: CDP };
p.frameTree = { mainFrameId: hex(16).toUpperCase(), mainFrameParentId: null, mainFrameUrl: 'about:blank' };
const navUrl = 'http://127.0.0.1:' + HTTP + '/?run=' + encodeURIComponent(NONCE);
const seenTokens = new Set();
for (const leg of p.legs) {
  let tok;
  do { tok = hex(6); } while (seenTokens.has(tok));
  seenTokens.add(tok);
  leg.launchToken = tok;
  leg.argv = leg.argv.map((a) => {
    if (a.startsWith('--remote-debugging-port=')) return '--remote-debugging-port=' + CDP;
    if (a.startsWith('--user-data-dir=')) return '--user-data-dir=/fast/scratch/hyaku/tabi-r79/forge/profile-' + tok;
    return a;
  });
  const bid = uuid();
  leg.devtoolsListening = { url: 'ws://127.0.0.1:' + CDP + '/devtools/browser/' + bid, port: CDP, browserId: bid };
  leg.stderrHead = 'DevTools listening on ws://127.0.0.1:' + CDP + '/devtools/browser/' + bid + '\n';
  const fid = hex(16).toUpperCase();
  leg.frameTree = { mainFrameId: fid, mainFrameParentId: null, mainFrameUrl: 'about:blank' };
  for (const e of leg.cdpEventLog) {
    if (e.params && typeof e.params.frameId === 'string') e.params.frameId = fid;
    if (e.method === 'Page.frameNavigated' && e.params) e.params.url = navUrl;
  }
  for (const c of leg.cdpSendLog) {
    if (c.method === 'Page.navigate') c.params = { url: navUrl };
    if (c.method === 'Runtime.evaluate' && typeof c.params.expression === 'string')
      c.params.expression = c.params.expression.split('tabi-r79-probe1').join(NONCE);
  }
  for (const s of leg.serverLog) if (s.path === '/') s.run = NONCE;
}

const all = [];
p.legs.forEach((leg, li) => leg.pageEvents.forEach((e, ei) => all.push({ li, ei, at: e.at, ts: e.ts })));
const sorted = [...all].sort((a, b) => a.at - b.at);
let gapIdx = -1, gapVal = 0;
for (let i = 1; i < sorted.length; i++) {
  const d = sorted[i].at - sorted[i - 1].at;
  if (d >= 50 && d > gapVal) { gapVal = d; gapIdx = i; }
}
const gapKey = gapIdx > 0 ? sorted[gapIdx].li + ':' + sorted[gapIdx].ei : null;
const picked = [];
if (gapKey) picked.push(gapKey);
const pool = all.filter((x) => !picked.includes(x.li + ':' + x.ei));
for (let i = 0; i < pool.length && picked.length < k; i += 2) picked.push(pool[i].li + ':' + pool[i].ei);
for (let i = 1; i < pool.length && picked.length < k; i += 2) picked.push(pool[i].li + ':' + pool[i].ei);
const moved = picked.slice(0, k);
for (const key of moved) {
  const [li, ei] = key.split(':').map(Number);
  const e = p.legs[li].pageEvents[ei];
  e.ts = Math.round((e.ts + 0.1) * 10) / 10;
  if (key === gapKey) e.at = Math.round((e.at + 0.2) * 10) / 10;
}
fs.writeFileSync(outPath, JSON.stringify(p, null, 1));
console.log(JSON.stringify({ out: outPath, nonce: NONCE, fixtureSha: p.fixture.sha256, moved: moved.length, gapVal, gapKey, total: all.length }));
