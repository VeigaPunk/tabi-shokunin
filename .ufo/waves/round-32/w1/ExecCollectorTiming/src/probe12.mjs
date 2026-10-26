// Mechanism probe: does maxEncodedDataSize gate on response header size, on
// body size, or on neither? Header sweep first (fresh session), then body sweep
// incl. bodies far above the limit.
import { serveFixture } from "./clone/scripts/check-bidi-runtime.mjs";
import { spawn } from "node:child_process";
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { createServer } from "node:net";
import { createServer as createHttpServer } from "node:http";

const OUT = process.argv[2];
const SCRATCH = process.argv[3];
const CHROMIUM = "/usr/bin/chromium";
const CHROMEDRIVER = "/usr/bin/chromedriver";
if (!OUT || !SCRATCH) { console.error("usage: probe12.mjs <outdir> <scratch>"); process.exit(2); }
mkdirSync(OUT, { recursive: true });
const chromeTmp = mkdtempSync("/tmp/tc-");
const profile = mkdtempSync(join(SCRATCH, "profile12-"));
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
let cd = null, ws = null, port = null, sessionId = null, fx = null, srv = null;
const summary = { schema: "tabi-bidi-collector-probe-v1", run: 12, cases: [] };

try {
  fx = await serveFixture();
  srv = await new Promise((resolve) => {
    const s = createHttpServer((req, res) => {
      const u = new URL(req.url || "/", "http://127.0.0.1");
      const b = Number(u.searchParams.get("body"));
      const h = Number(u.searchParams.get("hdr"));
      if (u.pathname === "/x.txt") {
        const headers = { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" };
        if (h > 0) headers["x-extra"] = "h".repeat(h);
        res.writeHead(200, headers);
        res.end("x".repeat(Number.isFinite(b) ? b : 26));
        return;
      }
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

  const probe = async (label, query, limit, extra = {}) => {
    currentCase = label;
    const start = frames.length;
    const rec = { id: label, query, maxEncodedDataSize: limit, extra };
    const col = await send("network.addDataCollector", { dataTypes: ["response"], maxEncodedDataSize: limit, ...extra });
    rec.addCollector = describe(col);
    const url = `${srv.base}/x.txt?${query}`;
    await send("browsingContext.navigate", { context, url, wait: "complete" });
    const done = await waitEvent((e) => e.method === "network.responseCompleted" && e.params.response && e.params.response.url === url, 15000);
    const req = done && done.params.request.request;
    const g = req ? await send("network.getData", { dataType: "response", request: req }) : null;
    rec.getData = g ? describe(g) : null;
    rec.returnedBytes = g && g.result && g.result.bytes ? (g.result.bytes.type === "base64" ? Buffer.from(g.result.bytes.value, "base64").length : String(g.result.bytes.value).length) : null;
    if (res(col).collector) await send("network.removeDataCollector", { collector: res(col).collector });
    rec.frames = frames.slice(start);
    summary.cases.push(rec);
  };

  await probe("t-h0-l190-total1M", "body=26&hdr=0", 190, { maxTotalCollectedSize: 1048576 });
  await probe("t-h600-l200-total1M", "body=26&hdr=600", 200, { maxTotalCollectedSize: 1048576 });
  await probe("t-h0-b20000-l190-total1M", "body=20000&hdr=0", 190, { maxTotalCollectedSize: 1048576 });
  await probe("t-h0-l65536-total200", "body=26&hdr=0", 65536, { maxTotalCollectedSize: 200 });
  await probe("t-h0-b20000-l65536-total200", "body=20000&hdr=0", 65536, { maxTotalCollectedSize: 200 });
  await probe("t-h600-l200-totalBig", "body=26&hdr=600", 200, { maxTotalCollectedSize: 1048576 });
} catch (e) {
  summary.fatal = String(e && e.stack || e);
} finally {
  try { if (ws && ws.readyState === 1) ws.close(); } catch {}
  try { if (sessionId && port) await fetch(`http://127.0.0.1:${port}/session/${sessionId}`, { method: "DELETE" }); } catch {}
  try { if (cd) cd.kill("SIGTERM"); } catch {}
  await sleep(800);
  try { if (fx) await fx.close(); } catch {}
  try { if (srv) await srv.close(); } catch {}
  try { rmSync(profile, { recursive: true, force: true }); } catch {}
  try { rmSync(chromeTmp, { recursive: true, force: true }); } catch {}
  writeFileSync(join(OUT, "frames.jsonl"), frames.map((f) => JSON.stringify(f)).join("\n") + "\n");
  writeFileSync(join(OUT, "summary.json"), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify({ ok: !summary.fatal, fatal: summary.fatal || null, rows: summary.cases.map((c) => [c.id, c.maxEncodedDataSize, c.getData && c.getData.type === "success" ? `OK ${c.returnedBytes}B` : (c.getData && c.getData.error) || "?"]) }, null, 2));
}
