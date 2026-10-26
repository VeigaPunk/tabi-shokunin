// Scribe-side probe 2: fetch base-URL resolution, collector timing, prompt auto-dismiss, screenshot ordering.
import { createServer } from "node:http";
import { createServer as createNetServer } from "node:net";
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";

const S = process.env.SCRATCH;
const DATA = "tabi-bidi-body-0123456789\n";
const FIX = {
  "/a.html": { type: "text/html; charset=utf-8", body: '<!doctype html><html><head><title>probe</title></head><body><p id="p">probe</p><script>document.cookie="tabi_fixture=1; path=/";window.__ready=new Promise(function(r){setTimeout(function(){r("settled")},50)});</script></body></html>\n' },
  "/data.txt": { type: "text/plain; charset=utf-8", body: DATA },
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const freePort = () => new Promise((res, rej) => { const s = createNetServer(); s.on("error", rej); s.listen(0, "127.0.0.1", () => { const p = s.address().port; s.close(() => res(p)); }); });
const lines = [];
const log = (o) => lines.push({ t: new Date().toISOString(), ...o });
const pngSize = (b64) => { const b = Buffer.from(String(b64 || ""), "base64"); if (b.length < 24 || b.toString("hex", 0, 8) !== "89504e470d0a1a0a") return null; return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) }; };

const server = createServer((req, res) => {
  const p = (req.url || "/").split("?")[0];
  const f = FIX[p];
  if (!f) { res.writeHead(404, { "content-type": "text/plain" }); res.end("nf\n"); return; }
  res.writeHead(200, { "content-type": f.type, "cache-control": "no-store", "x-tabi-fixture": "r32" });
  res.end(f.body);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;
const ct = join(S, "ct");
rmSync(ct, { recursive: true, force: true }); mkdirSync(ct, { recursive: true });
const port = await freePort();
const cd = spawn("/usr/bin/chromedriver", [`--port=${port}`], { stdio: ["ignore", "ignore", "pipe"], env: { ...process.env, TMPDIR: ct, TMP: ct, TEMP: ct } });
let cdErr = ""; cd.stderr.on("data", (d) => { cdErr += String(d); });

const out = { schema: "tabi-scribe-bidi-probe2-v1", sessions: [] };

async function session(behavior) {
  const prof = join(S, `profile-${behavior}`);
  let body = null;
  for (let k = 0; k < 50 && !body; k += 1) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}/session`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ capabilities: { alwaysMatch: {
        browserName: "chrome", webSocketUrl: true, unhandledPromptBehavior: behavior,
        "goog:chromeOptions": { binary: "/usr/bin/chromium", args: ["--headless=new", "--no-sandbox", "--no-first-run", "--disable-gpu", `--user-data-dir=${prof}`] } } } }) });
      body = await r.json();
    } catch { await sleep(200); }
  }
  const rec = { behavior, session: body && body.value && body.value.capabilities, probes: [], events: [] };
  if (!body || !body.value) { rec.fatal = JSON.stringify(body).slice(0, 300); return rec; }
  log({ dir: "http-res", path: "/session", behavior, body });
  const ws = new WebSocket(body.value.capabilities.webSocketUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error("ws open failed")); });
  let id = 0, seq = 0;
  const pending = new Map();
  ws.onmessage = (m) => {
    const f = JSON.parse(String(m.data)); seq += 1; log({ dir: "recv", seq, frame: f, behavior });
    if (f.id !== undefined && pending.has(f.id)) { const p = pending.get(f.id); pending.delete(f.id); p(f); }
    else if (f.method) rec.events.push({ seq, ...f });
  };
  const send = (method, params = {}) => new Promise((res) => { id += 1; log({ dir: "send", seq: seq + 1, frame: { id, method, params }, behavior }); pending.set(id, res); ws.send(JSON.stringify({ id, method, params })); });
  const probe = async (name, method, params) => { const r = await send(method, params); rec.probes.push({ name, status: r.type, code: r.error || null, message: r.message || null, result: r.type === "success" ? r.result : undefined }); return r; };
  const ev = async (pred, ms = 8000) => { for (let k = 0; k < ms / 100; k += 1) { const h = rec.events.find(pred); if (h) return h; await sleep(100); } return null; };

  const tree = await send("browsingContext.getTree", {});
  const ctx = tree.result.contexts[0].context;
  rec.context = ctx;
  await probe("subscribe", "session.subscribe", { events: ["browsingContext.load", "browsingContext.userPromptOpened", "network.beforeRequestSent", "network.responseCompleted"] });
  // screenshot BEFORE setViewport: what size does the window default give?
  const shotPre = await probe("screenshot-before-setViewport", "browsingContext.captureScreenshot", { context: ctx });
  rec.preViewportShot = shotPre.type === "success" ? pngSize(shotPre.result.data) : null;
  await probe("setViewport", "browsingContext.setViewport", { context: ctx, viewport: { width: 640, height: 480 }, devicePixelRatio: 1 });
  await probe("navigate-a", "browsingContext.navigate", { context: ctx, url: `${base}/a.html`, wait: "complete" });
  await ev((e) => e.method === "browsingContext.load" && e.params.url === `${base}/a.html`);
  await probe("evaluate-ready", "script.evaluate", { expression: "window.__ready", awaitPromise: true, target: { context: ctx } });
  await probe("evaluate-href", "script.evaluate", { expression: "location.href", awaitPromise: false, target: { context: ctx } });
  await probe("evaluate-baseURI", "script.evaluate", { expression: "document.baseURI", awaitPromise: false, target: { context: ctx } });
  const shotPost = await probe("screenshot-after-setViewport", "browsingContext.captureScreenshot", { context: ctx });
  rec.postViewportShot = shotPost.type === "success" ? pngSize(shotPost.result.data) : null;
  await send("network.addDataCollector", { dataTypes: ["response"], maxEncodedDataSize: 65536 });
  rec.probes.push({ name: "addDataCollector-before-fetch", status: "success" });
  await probe("evaluate-relative-fetch", "script.evaluate", { expression: "fetch('/data.txt').then(function(r){return r.text()})", awaitPromise: true, target: { context: ctx } });
  await probe("evaluate-absolute-fetch", "script.evaluate", { expression: `fetch('${base}/data.txt?abs=1').then(function(r){return r.text()})`, awaitPromise: true, target: { context: ctx } });
  const done = await ev((e) => e.method === "network.responseCompleted" && /\/data\.txt\?abs=1$/.test(String(e.params.response && e.params.response.url)));
  rec.absoluteFetchCompleted = Boolean(done);
  if (done) {
    await probe("getData-with-collector", "network.getData", { dataType: "response", request: done.params.request.request });
  }
  if (behavior === "ignore") {
    // alert opened while the ignore behavior leaves it open
    await probe("evaluate-alert", "script.evaluate", { expression: "setTimeout(function(){alert('tabi-alert')},0),1", awaitPromise: false, target: { context: ctx } });
    const opened = await ev((e) => e.method === "browsingContext.userPromptOpened" && e.params.message === "tabi-alert");
    rec.promptOpened = Boolean(opened);
    if (opened) await probe("handleUserPrompt-1", "browsingContext.handleUserPrompt", { context: opened.params.context, accept: true });
    await probe("handleUserPrompt-2", "browsingContext.handleUserPrompt", { context: ctx, accept: true });
  } else {
    await probe("evaluate-alert", "script.evaluate", { expression: "setTimeout(function(){alert('tabi-alert')},0),1", awaitPromise: false, target: { context: ctx } });
    const opened = await ev((e) => e.method === "browsingContext.userPromptOpened" && e.params.message === "tabi-alert");
    rec.promptOpened = Boolean(opened);
    await sleep(1500);
    await probe("evaluate-while-prompt-auto-dismissed", "script.evaluate", { expression: "1", awaitPromise: false, target: { context: ctx } });
    await probe("handleUserPrompt-after-auto-dismiss", "browsingContext.handleUserPrompt", { context: ctx, accept: true });
  }
  ws.close();
  await fetch(`http://127.0.0.1:${port}/session/${body.value.sessionId}`, { method: "DELETE" }).catch(() => {});
  await sleep(300);
  rmSync(prof, { recursive: true, force: true });
  return rec;
}

try {
  out.sessions.push(await session("ignore"));
  out.sessions.push(await session("dismiss and notify"));
} catch (e) {
  out.fatal = String(e && e.message || e);
} finally {
  cd.kill("SIGTERM");
  await new Promise((r) => server.close(r));
  rmSync(ct, { recursive: true, force: true });
  out.chromedriverStderr = cdErr;
  writeFileSync(join(S, "probe2.json"), JSON.stringify(out, null, 2));
  writeFileSync(join(S, "probe2-frames.jsonl"), lines.map((l) => JSON.stringify(l)).join("\n") + "\n");
  const brief = out.sessions.map((s) => ({ behavior: s.behavior, context: s.context, preViewportShot: s.preViewportShot, postViewportShot: s.postViewportShot, promptOpened: s.promptOpened, probes: s.probes.map((p) => ({ name: p.name, status: p.status, code: p.code, message: p.message })), fatal: s.fatal || null }));
  console.log(JSON.stringify({ sessions: brief, fatal: out.fatal || null }, null, 2));
}
