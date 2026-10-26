// Scribe-side minimal BiDi probe: capture error frames only. Loopback fixture.
// Not claim evidence: this file is a signature-capture instrument, not a driver receipt.
import { createServer } from "node:http";
import { createServer as createNetServer } from "node:net";
import { spawn } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";

const S = process.env.SCRATCH;
if (!S) throw new Error("SCRATCH unset");
const DATA = "tabi-bidi-body-0123456789\n";
const FIX = {
  "/a.html": { type: "text/html; charset=utf-8", body: '<!doctype html><html><head><title>probe</title></head><body><p id="p">probe</p><script>document.cookie="tabi_fixture=1; path=/";window.__ready=new Promise(function(r){setTimeout(function(){r("settled")},50)});</script></body></html>\n' },
  "/data.txt": { type: "text/plain; charset=utf-8", body: DATA },
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const freePort = () => new Promise((res, rej) => { const s = createNetServer(); s.on("error", rej); s.listen(0, "127.0.0.1", () => { const p = s.address().port; s.close(() => res(p)); }); });

const lines = [];
const log = (o) => lines.push({ t: new Date().toISOString(), ...o });

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
rmSync(ct, { recursive: true, force: true });
mkdirSync(ct, { recursive: true });
const profile = join(S, "profile");
const port = await freePort();
const cd = spawn("/usr/bin/chromedriver", [`--port=${port}`], { stdio: ["ignore", "ignore", "pipe"], env: { ...process.env, TMPDIR: ct, TMP: ct, TEMP: ct } });
let cdErr = "";
cd.stderr.on("data", (d) => { cdErr += String(d); });

const out = { schema: "tabi-scribe-bidi-probe-v1", chromedriver: null, chromium: null, session: null, probes: [], fixtureBase: base, note: "error-frame capture only; no row receipt claimed" };
try {
  let body = null;
  for (let k = 0; k < 50 && !body; k += 1) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}/session`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ capabilities: { alwaysMatch: {
        browserName: "chrome", webSocketUrl: true, unhandledPromptBehavior: "ignore",
        "goog:chromeOptions": { binary: "/usr/bin/chromium", args: ["--headless=new", "--no-sandbox", "--no-first-run", "--disable-gpu", `--user-data-dir=${profile}`] } } } }) });
      body = await r.json();
    } catch { await sleep(200); }
  }
  if (!body || !body.value || !body.value.capabilities) throw new Error(`no session: ${JSON.stringify(body).slice(0, 300)} cdErr=${cdErr.slice(0, 300)}`);
  const caps = body.value.capabilities;
  out.session = { sessionId: body.value.sessionId, browserName: caps.browserName, browserVersion: caps.browserVersion, chromedriverVersion: caps.chrome && caps.chrome.chromedriverVersion, webSocketUrl: caps.webSocketUrl };
  log({ dir: "http-res", path: "/session", body });

  const ws = new WebSocket(caps.webSocketUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error("ws open failed")); });
  let id = 0, seq = 0;
  const pending = new Map();
  const events = [];
  ws.onmessage = (m) => {
    const f = JSON.parse(String(m.data));
    seq += 1;
    log({ dir: "recv", seq, frame: f });
    if (f.id !== undefined && pending.has(f.id)) { const p = pending.get(f.id); pending.delete(f.id); p(f); }
    else if (f.method) events.push({ seq, ...f });
  };
  const send = (method, params = {}) => new Promise((res) => {
    id += 1;
    const frame = { id, method, params };
    log({ dir: "send", seq: seq + 1, frame });
    pending.set(id, res);
    ws.send(JSON.stringify(frame));
  });
  const probe = async (name, method, params) => {
    const r = await send(method, params);
    out.probes.push({ name, method, status: r.type === "success" ? "success" : "error", error: r.error || null, result: r.type === "success" ? r.result : undefined });
    return r;
  };

  const tree = await send("browsingContext.getTree", {});
  const ctx = tree.result.contexts[0].context;
  out.context = ctx;

  // 1. handleUserPrompt with no prompt open
  await probe("handleUserPrompt-no-prompt", "browsingContext.handleUserPrompt", { context: ctx, accept: true });
  // 2. subscribe to an unknown event name
  await probe("subscribe-unknown-event", "session.subscribe", { events: ["nonsense.event"] });
  // 3. valid subscription (before navigate)
  await probe("subscribe-valid", "session.subscribe", { events: ["browsingContext.load", "browsingContext.userPromptOpened", "network.beforeRequestSent", "network.responseCompleted"] });
  await probe("setViewport", "browsingContext.setViewport", { context: ctx, viewport: { width: 640, height: 480 }, devicePixelRatio: 1 });
  // 4. getData with no collector registered
  await probe("getData-no-collector", "network.getData", { dataType: "response", request: "no-such-request" });
  await probe("navigate-a", "browsingContext.navigate", { context: ctx, url: `${base}/a.html`, wait: "complete" });
  await probe("evaluate-ready", "script.evaluate", { expression: "window.__ready", awaitPromise: true, target: { context: ctx } });
  // 5. traverseHistory with empty history
  await probe("traverseHistory-empty", "browsingContext.traverseHistory", { context: ctx, delta: -1 });
  // 6. collector added AFTER the response completed, then getData
  await probe("evaluate-fetch", "script.evaluate", { expression: "fetch('/data.txt').then(function(r){return r.text()})", awaitPromise: true, target: { context: ctx } });
  let done = null;
  for (let k = 0; k < 50 && !done; k += 1) { done = events.find((e) => e.method === "network.responseCompleted" && /\/data\.txt$/.test(String(e.params.response && e.params.response.url))); if (!done) await sleep(100); }
  out.dataRequestId = done && done.params.request.request;
  await probe("addDataCollector-after-response", "network.addDataCollector", { dataTypes: ["response"], maxEncodedDataSize: 65536 });
  if (out.dataRequestId) await probe("getData-after-the-fact", "network.getData", { dataType: "response", request: out.dataRequestId });
  // 7. prompt: open, accept, then handle again
  await probe("evaluate-alert", "script.evaluate", { expression: "setTimeout(function(){alert('tabi-alert')},0),1", target: { context: ctx } });
  let opened = null;
  for (let k = 0; k < 50 && !opened; k += 1) { opened = events.find((e) => e.method === "browsingContext.userPromptOpened" && e.params.message === "tabi-alert"); if (!opened) await sleep(100); }
  out.promptOpened = Boolean(opened);
  if (opened) await probe("handleUserPrompt-accept", "browsingContext.handleUserPrompt", { context: opened.params.context, accept: true });
  await probe("handleUserPrompt-twice", "browsingContext.handleUserPrompt", { context: ctx, accept: true });

  ws.close();
  await fetch(`http://127.0.0.1:${port}/session/${body.value.sessionId}`, { method: "DELETE" }).catch(() => {});
} catch (e) {
  out.fatal = String(e && e.message || e);
} finally {
  await sleep(300);
  cd.kill("SIGTERM");
  await new Promise((r) => server.close(r));
  rmSync(profile, { recursive: true, force: true });
  rmSync(ct, { recursive: true, force: true });
  out.chromedriverStderr = cdErr;
  writeFileSync(join(S, "probe.json"), JSON.stringify(out, null, 2));
  writeFileSync(join(S, "probe-frames.jsonl"), lines.map((l) => JSON.stringify(l)).join("\n") + "\n");
  console.log(JSON.stringify({ probes: out.probes.map((p) => ({ name: p.name, status: p.status, code: p.error && p.error.error, message: p.error && p.error.message })), fatal: out.fatal || null }, null, 2));
}
