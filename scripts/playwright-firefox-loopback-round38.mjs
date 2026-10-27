#!/usr/bin/env node
// playwright-firefox-loopback-round38.mjs — tabi round 38, capability driver.
// Drives Firefox 157.0 (playwright firefox v1555, Juggler wire) via Playwright 1.64.0
// on a loopback fixture and records per-step evidence: navigation, hydration wait,
// title/DOM reads, real-pointer click + DOM mutation, screenshot bytes, history
// traversal, request log, console log, egress socket sample, cleanup proof.
// Two cold runs are bound by identical first-screenshot sha256.
//
// Usage: node scripts/playwright-firefox-loopback-round38.mjs --out <receipt.json> [--runs 2]
// Writes: the receipt JSON to --out; nothing else outside its own mkdtemp (removed on exit).
import { firefox } from '/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/lib/node_modules/playwright/index.mjs';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';

const sha256 = (b) => createHash('sha256').update(b).digest('hex');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const PLAYWRIGHT = '/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/lib/node_modules/playwright';
const PW_VERSION = JSON.parse(readFileSync(join(PLAYWRIGHT, 'package.json'), 'utf8')).version;
const FIREFOX_BIN = '/home/vgpnk/.cache/ms-playwright/firefox-1555/firefox/firefox';
const SCHEMA = 'tabi-pw-firefox-receipt-v1';

// Reference fixture (embedded; sha256 recorded at run time — measured surface, not a pin).
const FIXTURE = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>TABI-R38 fixture</title>
<style>html,body{margin:0;padding:0;overflow:hidden;background:#fff;color:#111;font:16px/1.5 monospace}
#frame{width:800px;height:600px;box-sizing:border-box;padding:24px}
#btn{font:inherit;padding:4px 12px}.confirm{color:#0a5}</style></head>
<body><div id="frame">
<h1>TABI-R38 playwright-firefox fixture</h1>
<p id="static">static paragraph never mutated</p>
<button id="btn">mutate</button>
<p>count: <span id="count">0</span></p>
<ul id="list"></ul>
<div id="confirms"></div>
<p>status: <span id="status">booting</span></p>
</div>
<script>
setTimeout(function(){document.getElementById('status').textContent='hydrated';},150);
var count=0;
document.getElementById('btn').addEventListener('click',function(){
 count=count+1;
 document.getElementById('count').textContent=String(count);
 var li=document.createElement('li');li.id='item-'+count;li.textContent='item '+count;
 document.getElementById('list').appendChild(li);
 setTimeout(function(){var d=document.createElement('div');d.className='confirm';d.id='confirm-'+count;d.textContent='confirmed '+count;document.getElementById('confirms').appendChild(d);},120);
});
<\/script></body></html>`;

const FIXTURE2 = FIXTURE.replace('TABI-R38 playwright-firefox fixture', 'TABI-R38 playwright-firefox fixture page2')
  .replace('id="status">booting', 'id="status">page2');

const FIXTURE_SHA = sha256(FIXTURE);
const sh = (c) => { try { return spawnSync('/bin/bash', ['-c', c], { encoding: 'utf8' }).stdout.trim(); } catch { return ''; } };

async function runOnce({ out, runName, profileRoot }) {
  const rec = { name: runName, cmds: [], events: [], errors: [] };
  const server = createServer((req, res) => {
    rec.events.push({ method: 'http.request', url: req.url });
    if (req.url === '/' || req.url === '/a.html') { res.end(FIXTURE); return; }
    if (req.url === '/b.html') { res.end(FIXTURE2); return; }
    res.statusCode = 404; res.end('nf');
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  rec.serverPort = port;

  const profile = mkdtempSync(join(profileRoot, 'profile-'));
  const browser = await firefox.launch({ headless: true });
  rec.firefoxPids = (sh(`ps -eo pid,args --no-headers | grep 'firefox-1555/firefox/firefox' | grep -v grep | awk '{print $1}'`) || '').split('\n').filter(Boolean).map(Number);

  const egress = { samples: 0, nonLoopback: 0, lines: 0 };
  const sampler = setInterval(() => {
    try {
      const lines = (sh(`ss -tnp 2>/dev/null | grep -E 'pid=(${rec.firefoxPids.join('|')}),'`) || '').split('\n').filter(Boolean);
      egress.samples += 1; egress.lines = Math.max(egress.lines, lines.length);
      egress.nonLoopback += lines.filter((l) => !/127\.0\.0\.1|::1/.test(l)).length;
    } catch {}
  }, 400);
  rec.egress = egress;

  try {
    const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
    page.on('console', (m) => rec.events.push({ method: 'console', type: m.type(), text: m.text() }));
    page.on('request', (r) => rec.events.push({ method: 'request', url: r.url() }));
    page.on('response', (r) => rec.events.push({ method: 'response', url: r.url(), status: r.status() }));
    const step = (m, r) => rec.cmds.push({ i: rec.cmds.length + 1, method: m, result: r });

    // 1 navigate + hydration wait
    const t0 = Date.now();
    await page.goto(`http://127.0.0.1:${port}/a.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction("document.getElementById('status').textContent === 'hydrated'", null, { timeout: 5000 });
    step('navigate.hydrated', { url: page.url(), ms: Date.now() - t0 });
    // 2 title + DOM shape
    step('title', { value: await page.title() });
    step('shape', { staticText: await page.textContent('#static'), status: await page.textContent('#status'), items: await page.locator('#list li').count() });
    // 3 first screenshot (the binding artifact)
    const shot1 = await page.screenshot({ type: 'png' });
    rec.firstShotSha256 = sha256(shot1);
    rec.firstShotBytes = shot1.length;
    step('screenshot.first', { sha256: rec.firstShotSha256, bytes: rec.firstShotBytes });
    // 4 real-pointer click on the button rect
    const box = await page.locator('#btn').boundingBox();
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForFunction("document.getElementById('count').textContent === '1'", null, { timeout: 3000 });
    await page.waitForFunction("document.querySelector('#confirms .confirm') !== null", null, { timeout: 3000 });
    step('click.effect', { count: await page.textContent('#count'), items: await page.locator('#list li').count(), confirm: await page.textContent('#confirms .confirm') });
    // 5 second screenshot (post-mutation, must differ from first)
    const shot2 = await page.screenshot({ type: 'png' });
    step('screenshot.after-click', { sha256: sha256(shot2), bytes: shot2.length, differsFromFirst: sha256(shot2) !== rec.firstShotSha256 });
    // 6 evaluate (arbitrary page state)
    step('evaluate', { innerWidth: await page.evaluate('window.innerWidth'), items: await page.evaluate('document.querySelectorAll("#list li").length') });
    // 7 navigate to page2 + history traverse back
    await page.goto(`http://127.0.0.1:${port}/b.html`, { waitUntil: 'domcontentloaded' });
    await page.goBack({ waitUntil: 'domcontentloaded' });
    step('history.traverse', { pathname: await page.evaluate('location.pathname'), title: await page.title() });
    // 8 input: a second real-pointer click on the same rect (input path exercised again)
    const before2 = await page.textContent('#count');
    const box2 = await page.locator('#btn').boundingBox();
    await page.mouse.click(box2.x + box2.width / 2, box2.y + box2.height / 2);
    await page.waitForFunction("document.getElementById('count').textContent === '1'", null, { timeout: 3000 });
    step('history-reset-and-click', { countBefore: before2, countAfter: await page.textContent('#count'), status: await page.textContent('#status') });
    rec.httpLog = rec.events.filter((e) => e.method === 'request' || e.method === 'response');
    step('http.witnessed', { requests: rec.httpLog.length });
    // 10 console quiet check
    step('console.quiet', { errors: rec.events.filter((e) => e.method === 'console' && (e.type === 'error')).length });
  } finally {
    await browser.close();
    clearInterval(sampler);
    server.close();
    await sleep(600);
  }
  // survivors: this run's firefox pids must be gone
  rec.survivors = (sh(`ps -eo pid,args --no-headers | grep 'firefox-1555/firefox/firefox' | grep -v grep | awk '{print $1}'`) || '')
    .split('\n').filter(Boolean).map(Number).filter((p) => rec.firefoxPids.includes(p)).length;
  // port closure proof
  rec.portClosed = (sh(`ss -ltn 2>/dev/null | grep -c ':${port} '`) || '0') === '0';
  rec.firefoxSurvivorPids = rec.survivors;
  return rec;
}

async function main() {
  const argv = process.argv.slice(2);
  let out = null, runs = 2;
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--out') out = argv[++i];
    else if (argv[i] === '--runs') runs = Number(argv[++i]);
  }
  if (!out) { console.error('usage: --out <receipt.json> [--runs N]'); process.exit(64); }
  const S = mkdtempSync(join(process.env.HYAKU_SCRATCH || tmpdir(), 'tabi-r38-pwff-'));
  const profiles = join(S, 'profiles'); mkdirSync(profiles, { recursive: true });
  process.on('exit', () => { try { rmSync(S, { recursive: true, force: true }); } catch {} });
  const receipt = { schema: SCHEMA, driver: 'scripts/playwright-firefox-loopback-round38.mjs', playwrightVersion: PW_VERSION, firefoxVersion: null, browserVersion: null, fixture: { sha256: FIXTURE_SHA, bytes: FIXTURE.length }, runs: [] };
  const probe = await firefox.launch({ headless: true });
  receipt.browserVersion = probe.version();
  await probe.close();
  for (let i = 0; i < runs; i += 1) receipt.runs.push(await runOnce({ out, runName: `run${i + 1}`, profileRoot: profiles }));
  receipt.firstShotSha256 = receipt.runs.map((r) => r.firstShotSha256);
  receipt.binding = new Set(receipt.firstShotSha256).size === 1;
  receipt.egressNonLoopback = receipt.runs.reduce((a, r) => a + r.egress.nonLoopback, 0);
  receipt.survivors = receipt.runs.reduce((a, r) => a + r.survivors, 0);
  writeFileSync(out, JSON.stringify(receipt, null, 1) + '\n');
  console.log(JSON.stringify({ wrote: out, runs: receipt.runs.length, binding: receipt.binding, egress: receipt.egressNonLoopback, survivors: receipt.survivors, firstShot: receipt.firstShotSha256 }));
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch((e) => { console.error(e); process.exit(1); });
export { FIXTURE, FIXTURE2, FIXTURE_SHA, runOnce, PW_VERSION };
