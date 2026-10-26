// Collector-timing probe, run 2: boundary sizes, request dataType with post
// data, and two sub-responseCompleted timing probes (add-at-responseStarted,
// getData-at-responseStarted). Same fixture, own loopback only.
import { serveFixture, DATA_TEXT, FIXTURE_SHA256 } from "./clone/scripts/check-bidi-runtime.mjs";
import { spawn } from "node:child_process";
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { createServer as createNetServer } from "node:net";

const OUT = process.argv[2];
const SCRATCH = process.argv[3];
const CHROMIUM = "/usr/bin/chromium";
const CHROMEDRIVER = "/usr/bin/chromedriver";
if (!OUT || !SCRATCH) { console.error("usage: probe2.mjs <outdir> <scratch>"); process.exit(2); }
mkdirSync(OUT, { recursive: true });

const chromeTmp = mkdtempSync("/tmp/tc-");
const profile = mkdtempSync(join(SCRATCH, "profile2-"));
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
const now = () => Date.now();

let cd = null, ws = null, port = null, sessionId = null, fx = null;
const summary = { schema: "tabi-bidi-collector-probe-v1", run: 2, fixtureSha256: FIXTURE_SHA256, dataTextBytes: Buffer.byteLength(DATA_TEXT), cases: [] };

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
    return rec;
  };
  const addCollector = async (params) => {
    const r = await send("network.addDataCollector", params);
    return { id: res(r).collector, reply: describe(r) };
  };
  const removeCollector = async (id) => (id ? describe(await send("network.removeDataCollector", { collector: id })) : null);
  const navAndGet = async (rec, url, collectorParams, dataTypeIn, label) => {
    const col = await addCollector(collectorParams);
    rec[label + "AddCollector"] = col.reply;
    const t0 = now();
    const nav = await send("browsingContext.navigate", { context, url, wait: "complete" });
    rec[label + "Navigate"] = describe(nav);
    const done = await waitEvent((e) => e.method === "network.responseCompleted" && e.params.response && e.params.response.url === url, 15000);
    rec[label + "ResponseCompletedMs"] = now() - t0;
    rec[label + "ResponseCompleted"] = done ? done.params : null;
    const req = done && done.params.request.request;
    if (req) { const g = await send("network.getData", { dataType: dataTypeIn, request: req }); rec[label + "GetData"] = describe(g); }
    rec[label + "RemoveCollector"] = await removeCollector(col.id);
  };

  // c1/c2 repeats of run 1 (determinism): before-navigation success, after-completion failure.
  await runCase("c1", "repeat: collector before navigation, response, 65536", (rec) => navAndGet(rec, `${fx.base}/data.txt?c1=2`, { dataTypes: ["response"], maxEncodedDataSize: 65536 }, "response", "x"));
  await runCase("c2", "repeat: no collector during response, add after responseCompleted", async (rec) => {
    const url = `${fx.base}/data.txt?c2=2`;
    const nav = await send("browsingContext.navigate", { context, url, wait: "complete" });
    rec.navigate = describe(nav);
    const done = await waitEvent((e) => e.method === "network.responseCompleted" && e.params.response && e.params.response.url === url, 15000);
    rec.responseCompleted = done ? done.params : null;
    await sleep(250);
    const col = await addCollector({ dataTypes: ["response"], maxEncodedDataSize: 65536 });
    rec.addCollector = col.reply;
    const req = done && done.params.request.request;
    if (req) rec.getData = describe(await send("network.getData", { dataType: "response", request: req }));
    rec.removeCollector = await removeCollector(col.id);
  });

  // Size boundary: body is 26 bytes.
  for (const [id, size] of [["c6", 25], ["c7", 26], ["c8", 27], ["c9", 1]]) {
    await runCase(id, `maxEncodedDataSize ${size} vs body ${Buffer.byteLength(DATA_TEXT)} B`, (rec) => navAndGet(rec, `${fx.base}/data.txt?${id}=1`, { dataTypes: ["response"], maxEncodedDataSize: size }, "response", "x"));
  }

  // Request dataType with an actual post body (fetch POST from the page).
  await runCase("c10", "dataType request, POST fetch with 11-byte post body", async (rec) => {
    const col = await addCollector({ dataTypes: ["request"], maxEncodedDataSize: 65536 });
    rec.addCollector = col.reply;
    const url = `${fx.base}/data.txt?c10=1`;
    const ev = waitEvent((e) => e.method === "network.responseCompleted" && e.params.response && e.params.response.url === url, 15000);
    const ev2 = waitEvent((e) => e.method === "network.beforeRequestSent" && e.params.request && e.params.request.url === url, 15000);
    const evl = await send("script.evaluate", { expression: `fetch('/data.txt?c10=1',{method:'POST',body:'hello=world'}).then(function(r){return r.text()})`, awaitPromise: true, target: { context } });
    rec.evaluate = describe(evl);
    const started = await ev2;
    rec.beforeRequestSent = started ? started.params : null;
    const done = await ev;
    rec.responseCompleted = done ? done.params : null;
    const req = done && done.params.request.request;
    if (req) rec.getData = describe(await send("network.getData", { dataType: "request", request: req }));
    rec.removeCollector = await removeCollector(col.id);
  });

  // Response dataType on the same POST (does the response body collect for a POST fetch?).
  await runCase("c11", "dataType response, POST fetch with 11-byte post body", async (rec) => {
    const col = await addCollector({ dataTypes: ["response"], maxEncodedDataSize: 65536 });
    rec.addCollector = col.reply;
    const url = `${fx.base}/data.txt?c11=1`;
    const ev = waitEvent((e) => e.method === "network.responseCompleted" && e.params.response && e.params.response.url === url, 15000);
    const evl = await send("script.evaluate", { expression: `fetch('/data.txt?c11=1',{method:'POST',body:'hello=world'}).then(function(r){return r.text()})`, awaitPromise: true, target: { context } });
    rec.evaluate = describe(evl);
    const done = await ev;
    rec.responseCompleted = done ? done.params : null;
    const req = done && done.params.request.request;
    if (req) rec.getData = describe(await send("network.getData", { dataType: "response", request: req }));
    rec.removeCollector = await removeCollector(col.id);
  });

  // Timing: collector added at responseStarted (after response creation, before completion).
  await runCase("c12", "collector added on network.responseStarted (navigation), getData after completion", async (rec) => {
    const url = `${fx.base}/data.txt?c12=1`;
    const navP = send("browsingContext.navigate", { context, url, wait: "complete" });
    const st = await waitEvent((e) => e.method === "network.responseStarted" && e.params.response && e.params.response.url === url, 15000);
    rec.responseStarted = st ? st.params : null;
    const col = await addCollector({ dataTypes: ["response"], maxEncodedDataSize: 65536 });
    rec.addCollector = col.reply;
    rec.navigate = describe(await navP);
    const done = await waitEvent((e) => e.method === "network.responseCompleted" && e.params.response && e.params.response.url === url, 15000);
    rec.responseCompleted = done ? done.params : null;
    const req = done && done.params.request.request;
    if (req) rec.getData = describe(await send("network.getData", { dataType: "response", request: req }));
    rec.removeCollector = await removeCollector(col.id);
  });

  // Timing: collector before navigation, getData issued at responseStarted (pending record).
  await runCase("c13", "collector before navigation, getData issued at responseStarted", async (rec) => {
    const col = await addCollector({ dataTypes: ["response"], maxEncodedDataSize: 65536 });
    rec.addCollector = col.reply;
    const url = `${fx.base}/data.txt?c13=1`;
    const navP = send("browsingContext.navigate", { context, url, wait: "complete" });
    const st = await waitEvent((e) => e.method === "network.responseStarted" && e.params.response && e.params.response.url === url, 15000);
    rec.responseStarted = st ? st.params : null;
    const req = st && st.params.request.request;
    const t0 = now();
    const g = req ? await send("network.getData", { dataType: "response", request: req }) : null;
    rec.getDataMs = now() - t0;
    rec.getData = g ? describe(g) : null;
    rec.navigate = describe(await navP);
    rec.removeCollector = await removeCollector(col.id);
  });

  // Repeat of the GET-no-post request-dataType case (c4 in run 1).
  await runCase("c14", "repeat: dataType request on a GET navigation (no post body)", async (rec) => {
    const col = await addCollector({ dataTypes: ["request"], maxEncodedDataSize: 65536 });
    rec.addCollector = col.reply;
    const url = `${fx.base}/data.txt?c14=1`;
    const nav = await send("browsingContext.navigate", { context, url, wait: "complete" });
    rec.navigate = describe(nav);
    const done = await waitEvent((e) => e.method === "network.responseCompleted" && e.params.response && e.params.response.url === url, 15000);
    rec.responseCompleted = done ? done.params : null;
    const req = done && done.params.request.request;
    if (req) rec.getData = describe(await send("network.getData", { dataType: "request", request: req }));
    rec.removeCollector = await removeCollector(col.id);
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
  const flat = (o) => {
    const out = {};
    for (const [k, v] of Object.entries(o)) if (/GetData$|getData$/.test(k)) out[k] = v && { type: v.type, error: v.error || null, message: v.message || null, bytes: v.result && v.result.bytes ? (v.result.bytes.type === "base64" ? Buffer.from(v.result.bytes.value, "base64").length : String(v.result.bytes.value).length) : null };
    return out;
  };
  console.log(JSON.stringify({ ok: !summary.fatal, fatal: summary.fatal || null, cases: summary.cases.map((c) => ({ id: c.id, threw: c.threw || null, getDataMs: c.getDataMs, ...flat(c), addCollectorError: c.xAddCollector && c.xAddCollector.type === "error" ? c.xAddCollector : c.addCollector && c.addCollector.type === "error" ? c.addCollector : null })) }, null, 2));
}
