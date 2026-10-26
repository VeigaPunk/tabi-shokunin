// Size-threshold probe: why does maxEncodedDataSize=27 fail for a 26-byte body?
// Sweep the limit around the body size and base64 size, on FIXTURE's /data.txt
// and on a second loopback server with a 1000-byte body.
import { serveFixture, DATA_TEXT, FIXTURE_SHA256 } from "./clone/scripts/check-bidi-runtime.mjs";
import { spawn } from "node:child_process";
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { createServer } from "node:net";
import { createServer as createHttpServer } from "node:http";

const OUT = process.argv[2];
const SCRATCH = process.argv[3];
const CHROMIUM = "/usr/bin/chromium";
const CHROMEDRIVER = "/usr/bin/chromedriver";
if (!OUT || !SCRATCH) { console.error("usage: probe4.mjs <outdir> <scratch>"); process.exit(2); }
mkdirSync(OUT, { recursive: true });

const chromeTmp = mkdtempSync("/tmp/tc-");
const profile = mkdtempSync(join(SCRATCH, "profile4-"));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const freePort = () => new Promise((resolve, reject) => {
  const s = createServer();
  s.on("error", reject);
  s.listen(0, "127.0.0.1", () => { const p = s.address().port; s.close(() => resolve(p)); });
});
const frames = [];
let currentCase = "setup";
let seq = 0;
const log = (dir, frame) => { seq += 1; frames.push({ case: currentCase, seq, dir, frame }); };

let cd = null, ws = null, port = null, sessionId = null, fx = null, big = null;
const summary = { schema: "tabi-bidi-collector-probe-v1", run: 3, fixtureSha256: FIXTURE_SHA256, dataTextBytes: Buffer.byteLength(DATA_TEXT), cases: [] };
const BODY26 = DATA_TEXT;
const BASE64_26 = Buffer.from(BODY26).toString("base64").length;
const BIG = "x".repeat(1000);

try {
  fx = await serveFixture();
  big = await new Promise((resolve) => {
    const s = createHttpServer((req, res) => {
      if (req.url && req.url.startsWith("/big.txt")) { res.writeHead(200, { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" }); res.end(BIG); return; }
      res.writeHead(404); res.end("no\n");
    });
    s.listen(0, "127.0.0.1", () => resolve({ server: s, base: `http://127.0.0.1:${s.address().port}`, close: () => new Promise((r) => s.close(() => r())) }));
  });
  port = await freePort();
  cd = spawn(CHROMEDRIVER, [`--port=${port}`], { stdio: "ignore", env: { ...process.env, TMPDIR: SCRATCH, TMP: SCRATCH, TEMP: SCRATCH } });
  let body = null;
  for (let k = 0; k < 50 && !body; k += 1) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}/session`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ capabilities: { alwaysMatch: {
        browserName: "chrome", webSocketUrl: true, unhandledPromptBehavior: "ignore",
        "goog:chromeOptions": { binary: CHROMIUM, args: ["--headless=new", "--no-sandbox", "--no-first-run", "--disable-gpu", `--user-data-dir=${profile}`] } } } }) });
      const t = await r.text();
      try { body = JSON.parse(t); } catch { await sleep(200); }
    } catch { await sleep(200); }
  }
  if (!body || !body.value || !body.value.capabilities) throw new Error(`new session failed: ${JSON.stringify(body).slice(0, 400)}`);
  writeFileSync(join(OUT, "classic-new-session.json"), JSON.stringify(body, null, 2));
  sessionId = body.value.sessionId;

  ws = new WebSocket(body.value.capabilities.webSocketUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = () => reject(new Error("ws open failed")); });
  const pending = new Map();
  const events = [];
  const waiters = [];
  let nextId = 0;
  ws.onmessage = (m) => {
    const f = JSON.parse(String(m.data));
    log("recv", f);
    if (f.id !== undefined && pending.has(f.id)) { const p = pending.get(f.id); pending.delete(f.id); p(f); }
    else if (f.method) { events.push(f); for (const w of [...waiters]) if (w.pred(f)) { waiters.splice(waiters.indexOf(w), 1); w.resolve(f); } }
  };
  const send = (method, params = {}) => new Promise((resolve) => {
    nextId += 1;
    const id = nextId;
    const frame = { id, method, params };
    log("send", frame);
    pending.set(id, resolve);
    ws.send(JSON.stringify(frame));
  });
  const waitEvent = (pred, ms = 15000) => {
    const hit = events.find(pred);
    if (hit) { events.splice(events.indexOf(hit), 1); return Promise.resolve(hit); }
    return Promise.race([new Promise((resolve) => waiters.push({ pred, resolve })), sleep(ms).then(() => null)]);
  };
  const res = (f) => (f && f.result) || {};
  const describe = (f) => ({ type: f && f.type, result: f && f.result !== undefined ? f.result : undefined, error: f && f.error, message: f && f.message });

  await send("session.subscribe", { events: ["browsingContext.load", "network.responseCompleted"] });
  const tree = await send("browsingContext.getTree", {});
  const context = res(tree).contexts && res(tree).contexts[0] && res(tree).contexts[0].context;
  if (!context) throw new Error("no browsing context");
  await send("browsingContext.setViewport", { context, viewport: { width: 640, height: 480 }, devicePixelRatio: 1 });
  await send("browsingContext.navigate", { context, url: `${fx.base}/a.html`, wait: "complete" });
  await waitEvent((e) => e.method === "browsingContext.load" && e.params.url === `${fx.base}/a.html`);
  await send("script.evaluate", { expression: "window.__ready", awaitPromise: true, target: { context } });

  const one = async (id, url, limit) => {
    currentCase = id;
    const start = frames.length;
    const rec = { id, url, maxEncodedDataSize: limit };
    const col = await send("network.addDataCollector", { dataTypes: ["response"], maxEncodedDataSize: limit });
    rec.addCollector = describe(col);
    const cid = res(col).collector;
    const nav = await send("browsingContext.navigate", { context, url, wait: "complete" });
    rec.navigate = describe(nav);
    const done = await waitEvent((e) => e.method === "network.responseCompleted" && e.params.response && e.params.response.url === url, 15000);
    rec.responseCompleted = done ? { status: done.params.response.status, request: done.params.request.request, headers: done.params.response.headers } : null;
    const req = done && done.params.request.request;
    if (req) rec.getData = describe(await send("network.getData", { dataType: "response", request: req }));
    if (cid) await send("network.removeDataCollector", { collector: cid });
    rec.frames = frames.slice(start);
    summary.cases.push(rec);
    return rec;
  };

  for (const limit of [101, 110, 128, 150, 200, 256, 300, 400, 450, 499, 500, 501, 512, 600, 768, 1000, 1024, 2048, 4096, 65536]) await one(`s26-${limit}`, `${fx.base}/data.txt?limit=${limit}`, limit);
  for (const limit of [100, 256, 500, 501, 512, 1024, 4096]) await one(`s1000-${limit}`, `${big.base}/big.txt?limit=${limit}`, limit);
  summary.notes = { body26Bytes: Buffer.byteLength(BODY26), body26Base64Chars: BASE64_26, bigBodyBytes: BIG.length };
} catch (e) {
  summary.fatal = String(e && e.stack || e);
} finally {
  try { if (ws && ws.readyState === 1) ws.close(); } catch {}
  try { if (sessionId && port) await fetch(`http://127.0.0.1:${port}/session/${sessionId}`, { method: "DELETE" }); } catch {}
  try { if (cd) cd.kill("SIGTERM"); } catch {}
  await sleep(800);
  try { if (fx) await fx.close(); } catch {}
  try { if (big) await big.close(); } catch {}
  try { rmSync(profile, { recursive: true, force: true }); } catch {}
  try { rmSync(chromeTmp, { recursive: true, force: true }); } catch {}
  writeFileSync(join(OUT, "frames.jsonl"), frames.map((f) => JSON.stringify(f)).join("\n") + "\n");
  writeFileSync(join(OUT, "summary.json"), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify({ ok: !summary.fatal, fatal: summary.fatal || null, notes: summary.notes, cases: summary.cases.map((c) => ({ id: c.id, limit: c.maxEncodedDataSize, add: c.addCollector.type + (c.addCollector.error ? ":" + c.addCollector.error : ""), getData: c.getData && { type: c.getData.type, error: c.getData.error || null, message: c.getData.message || null, bytes: c.getData.result && c.getData.result.bytes ? (c.getData.result.bytes.type === "base64" ? Buffer.from(c.getData.result.bytes.value, "base64").length : String(c.getData.result.bytes.value).length) : null } })) }, null, 2));
}
