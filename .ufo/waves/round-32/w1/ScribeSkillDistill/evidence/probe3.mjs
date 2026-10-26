// Scribe-side probe 3: what traverseHistory(-1) does with empty history (realm/base change?).
import { createServer } from "node:http";
import { createServer as createNetServer } from "node:net";
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";

const S = process.env.SCRATCH;
const FIX = { "/a.html": { type: "text/html; charset=utf-8", body: '<!doctype html><html><head><title>probe</title></head><body><p id="p">probe</p></body></html>\n' }, "/data.txt": { type: "text/plain", body: "x\n" } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const freePort = () => new Promise((res, rej) => { const s = createNetServer(); s.on("error", rej); s.listen(0, "127.0.0.1", () => { const p = s.address().port; s.close(() => res(p)); }); });
const lines = []; const log = (o) => lines.push({ t: new Date().toISOString(), ...o });
const server = createServer((req, res) => { const p = (req.url || "/").split("?")[0]; const f = FIX[p]; if (!f) { res.writeHead(404); res.end(); return; } res.writeHead(200, { "content-type": f.type }); res.end(f.body); });
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;
const ct = join(S, "ct"); rmSync(ct, { recursive: true, force: true }); mkdirSync(ct, { recursive: true });
const port = await freePort();
const cd = spawn("/usr/bin/chromedriver", [`--port=${port}`], { stdio: ["ignore", "ignore", "pipe"], env: { ...process.env, TMPDIR: ct, TMP: ct, TEMP: ct } });
const out = { schema: "tabi-scribe-bidi-probe3-v1", probes: [], events: [] };
try {
  let body = null;
  for (let k = 0; k < 50 && !body; k += 1) { try { const r = await fetch(`http://127.0.0.1:${port}/session`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ capabilities: { alwaysMatch: { browserName: "chrome", webSocketUrl: true, unhandledPromptBehavior: "ignore", "goog:chromeOptions": { binary: "/usr/bin/chromium", args: ["--headless=new", "--no-sandbox", "--no-first-run", "--disable-gpu", `--user-data-dir=${join(S, "profile3")}`] } } } }) }); body = await r.json(); } catch { await sleep(200); } }
  if (!body || !body.value) throw new Error("no session " + JSON.stringify(body).slice(0, 200));
  const ws = new WebSocket(body.value.capabilities.webSocketUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error("ws")); });
  let id = 0, seq = 0; const pending = new Map();
  ws.onmessage = (m) => { const f = JSON.parse(String(m.data)); seq += 1; log({ dir: "recv", seq, frame: f }); if (f.id !== undefined && pending.has(f.id)) { const p = pending.get(f.id); pending.delete(f.id); p(f); } else if (f.method) out.events.push({ seq, method: f.method, url: f.params && f.params.url }); };
  const send = (method, params = {}) => new Promise((res) => { id += 1; log({ dir: "send", seq: seq + 1, frame: { id, method, params } }); pending.set(id, res); ws.send(JSON.stringify({ id, method, params })); });
  const probe = async (name, method, params) => { const r = await send(method, params); out.probes.push({ name, status: r.type, code: r.error || null, message: r.message || null, result: r.type === "success" ? r.result : undefined }); return r; };
  const tree = await send("browsingContext.getTree", {}); const ctx = tree.result.contexts[0].context;
  await probe("subscribe", "session.subscribe", { events: ["browsingContext.load"] });
  await probe("navigate-a", "browsingContext.navigate", { context: ctx, url: `${base}/a.html`, wait: "complete" });
  await probe("href-before", "script.evaluate", { expression: "location.href", awaitPromise: false, target: { context: ctx } });
  const tr = await probe("traverseHistory-empty", "browsingContext.traverseHistory", { context: ctx, delta: -1 });
  await sleep(500);
  await probe("href-after", "script.evaluate", { expression: "location.href", awaitPromise: false, target: { context: ctx } });
  await probe("baseURI-after", "script.evaluate", { expression: "document.baseURI", awaitPromise: false, target: { context: ctx } });
  await probe("relative-fetch-after", "script.evaluate", { expression: "fetch('/data.txt').then(function(r){return r.text()})", awaitPromise: true, target: { context: ctx } });
  out.loadEvents = out.events.filter((e) => e.method === "browsingContext.load");
  ws.close();
  await fetch(`http://127.0.0.1:${port}/session/${body.value.sessionId}`, { method: "DELETE" }).catch(() => {});
} catch (e) { out.fatal = String(e && e.message || e); } finally {
  cd.kill("SIGTERM"); await new Promise((r) => server.close(r)); rmSync(ct, { recursive: true, force: true }); rmSync(join(S, "profile3"), { recursive: true, force: true });
  writeFileSync(join(S, "probe3.json"), JSON.stringify(out, null, 2));
  writeFileSync(join(S, "probe3-frames.jsonl"), lines.map((l) => JSON.stringify(l)).join("\n") + "\n");
  console.log(JSON.stringify({ probes: out.probes.map((p) => ({ name: p.name, status: p.status, code: p.code, message: p.message, href: p.result && p.result.result && p.result.result.value, realm: p.result && p.result.realm, type: p.result && p.result.type })), loadEvents: out.loadEvents, fatal: out.fatal || null }, null, 2));
}
