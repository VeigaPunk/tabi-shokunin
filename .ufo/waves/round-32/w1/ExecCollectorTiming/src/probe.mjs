// Collector-timing probe: network.addDataCollector / network.getData on a real
// chromium 154 + chromedriver 154 BiDi session against the counter's FIXTURE.
// Independent client (not the counter's liveRecord). Loopback only.
import { serveFixture, DATA_TEXT, FIXTURE_SHA256, FIXTURE } from "./clone/scripts/check-bidi-runtime.mjs";
import { spawn } from "node:child_process";
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { createServer as createNetServer } from "node:net";

const OUT = process.argv[2];
const SCRATCH = process.argv[3];
const CHROMIUM = "/usr/bin/chromium";
const CHROMEDRIVER = "/usr/bin/chromedriver";
if (!OUT || !SCRATCH) { console.error("usage: probe.mjs <outdir> <scratch>"); process.exit(2); }
mkdirSync(OUT, { recursive: true });

// Chromium's singleton socket lives in TMPDIR; keep that path short (<108 bytes
// for the whole unix socket). Profile lives under scratch as required.
const chromeTmp = mkdtempSync("/tmp/tc-");
const profile = mkdtempSync(join(SCRATCH, "profile-"));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const freePort = () => new Promise((resolve, reject) => {
  const s = createNetServer();
  s.on("error", reject);
  s.listen(0, "127.0.0.1", () => { const p = s.address().port; s.close(() => resolve(p)); });
});

const frames = [];
let currentCase = "setup";
let seq = 0;
const log = (dir, frame) => { seq += 1; frames.push({ case: currentCase, seq, dir, frame }); };

let cd = null;
let ws = null;
let port = null;
let sessionId = null;
let fx = null;
const summary = { schema: "tabi-bidi-collector-probe-v1", fixtureSha256: FIXTURE_SHA256, dataTextBytes: Buffer.byteLength(DATA_TEXT), cases: [], frames: 0, notes: [] };

try {
  fx = await serveFixture();
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
  summary.capabilities = { browserName: body.value.capabilities.browserName, browserVersion: body.value.capabilities.browserVersion, chromedriverVersion: body.value.capabilities["chrome"] && body.value.capabilities["chrome"].chromedriverVersion, hasWebSocketUrl: typeof body.value.capabilities.webSocketUrl === "string" };

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
    else if (f.method) {
      events.push(f);
      for (const w of [...waiters]) if (w.pred(f)) { waiters.splice(waiters.indexOf(w), 1); w.resolve(f); }
    }
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

  const navTo = async (url) => {
    const r = await send("browsingContext.navigate", { context, url, wait: "complete" });
    const q = new URL(url).search;
    const ev = await waitEvent((e) => e.method === "network.responseCompleted" && e.params.response && e.params.response.url === url, 15000);
    return { nav: describe(r), done: ev };
  };

  await send("session.subscribe", { events: ["browsingContext.load", "network.beforeRequestSent", "network.responseStarted", "network.responseCompleted"] });
  const tree = await send("browsingContext.getTree", {});
  const context = res(tree).contexts && res(tree).contexts[0] && res(tree).contexts[0].context;
  if (!context) throw new Error("no browsing context");
  await send("browsingContext.setViewport", { context, viewport: { width: 640, height: 480 }, devicePixelRatio: 1 });
  await send("browsingContext.navigate", { context, url: `${fx.base}/a.html`, wait: "complete" });
  await waitEvent((e) => e.method === "browsingContext.load" && e.params.url === `${fx.base}/a.html`);
  await send("script.evaluate", { expression: "window.__ready", awaitPromise: true, target: { context } });

  const runCase = async (id, title, fn) => {
    currentCase = id;
    const start = frames.length;
    const rec = { id, title, steps: [] };
    try { await fn(rec); } catch (e) { rec.threw = String(e && e.message || e); }
    rec.frames = frames.slice(start);
    summary.cases.push(rec);
  };
  const addCollector = async (params) => {
    const r = await send("network.addDataCollector", params);
    const id = res(r).collector;
    return { id, reply: describe(r) };
  };
  const removeCollector = async (id) => { if (id) return describe(await send("network.removeDataCollector", { collector: id })); return null; };

  // Case 1: collector added BEFORE navigation.
  await runCase("c1", "collector added before navigation, dataType response, maxEncodedDataSize 65536", async (rec) => {
    const col = await addCollector({ dataTypes: ["response"], maxEncodedDataSize: 65536 });
    rec.addCollector = col.reply;
    const url = `${fx.base}/data.txt?c1=1`;
    const r = await navTo(url);
    rec.navigate = r.nav;
    rec.responseCompleted = r.done ? r.done.params : null;
    const req = r.done && r.done.params.request.request;
    rec.requestId = req;
    if (req) { const g = await send("network.getData", { dataType: "response", request: req }); rec.getData = describe(g); }
    rec.removeCollector = await removeCollector(col.id);
  });

  // Case 2: NO collector during the response; collector added AFTER responseCompleted.
  await runCase("c2", "collector added after response completed, dataType response, maxEncodedDataSize 65536", async (rec) => {
    const url = `${fx.base}/data.txt?c2=1`;
    const r = await navTo(url);
    rec.navigate = r.nav;
    rec.responseCompleted = r.done ? r.done.params : null;
    const req = r.done && r.done.params.request.request;
    rec.requestId = req;
    await sleep(250);
    const col = await addCollector({ dataTypes: ["response"], maxEncodedDataSize: 65536 });
    rec.addCollector = col.reply;
    if (req) { const g = await send("network.getData", { dataType: "response", request: req }).catch(() => null); rec.getData = g ? describe(g) : "send-failed"; }
    rec.removeCollector = await removeCollector(col.id);
  });

  // Case 3: maxEncodedDataSize (10) smaller than the 26-byte body.
  await runCase("c3", "collector maxEncodedDataSize 10 < body 26 B, dataType response", async (rec) => {
    const col = await addCollector({ dataTypes: ["response"], maxEncodedDataSize: 10 });
    rec.addCollector = col.reply;
    const url = `${fx.base}/data.txt?c3=1`;
    const r = await navTo(url);
    rec.navigate = r.nav;
    rec.responseCompleted = r.done ? r.done.params : null;
    const req = r.done && r.done.params.request.request;
    rec.requestId = req;
    if (req) { const g = await send("network.getData", { dataType: "response", request: req }); rec.getData = describe(g); }
    rec.removeCollector = await removeCollector(col.id);
  });

  // Case 4: dataType "request".
  await runCase("c4", "collector dataType request, maxEncodedDataSize 65536", async (rec) => {
    const col = await addCollector({ dataTypes: ["request"], maxEncodedDataSize: 65536 });
    rec.addCollector = col.reply;
    const url = `${fx.base}/data.txt?c4=1`;
    const r = await navTo(url);
    rec.navigate = r.nav;
    rec.responseCompleted = r.done ? r.done.params : null;
    const req = r.done && r.done.params.request.request;
    rec.requestId = req;
    if (req) { const g = await send("network.getData", { dataType: "request", request: req }); rec.getData = describe(g); }
    rec.removeCollector = await removeCollector(col.id);
  });

  // Control: does getData on an unknown request id refuse?
  await runCase("c5-control-unknown-request", "getData with a fabricated request id (no record)", async (rec) => {
    const g = await send("network.getData", { dataType: "response", request: "00000000-0000-0000-0000-000000000000" });
    rec.getData = describe(g);
  });

  summary.frames = frames.length;
} catch (e) {
  summary.fatal = String(e && e.stack || e);
} finally {
  try { if (ws && ws.readyState === 1) ws.close(); } catch {}
  try { if (sessionId && port) await fetch(`http://127.0.0.1:${port}/session/${sessionId}`, { method: "DELETE" }); } catch {}
  try { if (cd) cd.kill("SIGTERM"); } catch {}
  await sleep(800);
  try { if (fx) await fx.close(); } catch {}
  try { rmSync(profile, { recursive: true, force: true }); } catch {}
  try { rmSync(chromeTmp, { recursive: true, force: true }); } catch {}
  writeFileSync(join(OUT, "frames.jsonl"), frames.map((f) => JSON.stringify(f)).join("\n") + "\n");
  writeFileSync(join(OUT, "summary.json"), JSON.stringify(summary, null, 2));
  for (const c of summary.cases) writeFileSync(join(OUT, `${c.id}.jsonl`), c.frames.map((f) => JSON.stringify(f)).join("\n") + "\n");
  console.log(JSON.stringify({ ok: !summary.fatal, fatal: summary.fatal || null, cases: summary.cases.map((c) => ({ id: c.id, threw: c.threw || null, getData: c.getData && { type: c.getData.type, error: c.getData.error, hasResult: !!c.getData.result, bytes: c.getData.result && c.getData.result.bytes ? (c.getData.result.bytes.type === "base64" ? Buffer.from(c.getData.result.bytes.value, "base64").length : String(c.getData.result.bytes.value).length) : null } })) }, null, 2));
}
