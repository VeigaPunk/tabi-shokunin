import { spawn } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { createServer as netServer } from "node:net";
import { join } from "node:path";
import { serveFixture } from "/fast/scratch/hyaku/tabi-r32/ExecInterceptPhases/clone/scripts/check-bidi-runtime.mjs";
const OUT = process.argv[2]; const raw = []; const now = () => new Date().toISOString();
const pushRaw = (d, f) => raw.push({ seq: raw.length + 1, ts: now(), dir: d, frame: f });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const freePort = () => new Promise((res, rej) => { const s = netServer(); s.on("error", rej); s.listen(0, "127.0.0.1", () => { const p = s.address().port; s.close(() => res(p)); }); });
const S = process.env.TMPDIR; const scratch = mkdtempSync(join(S, "tabi-pat3-"));
const rt = process.env.XDG_RUNTIME_DIR; let chromeTmp = scratch, own = false;
if (scratch.length > 60) { chromeTmp = mkdtempSync(join(rt, "tabi-pat3-")); own = true; }
const fx = await serveFixture();
const port = await freePort();
const cd = spawn("/usr/bin/chromedriver", [`--port=${port}`], { stdio: "ignore", env: { ...process.env, TMPDIR: chromeTmp, TMP: chromeTmp, TEMP: chromeTmp } });
let body = null;
for (let k = 0; k < 60 && !body; k += 1) { try { const r = await fetch(`http://127.0.0.1:${port}/session`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ capabilities: { alwaysMatch: { browserName: "chrome", webSocketUrl: true, unhandledPromptBehavior: "ignore", "goog:chromeOptions": { binary: "/usr/bin/chromium", args: ["--headless=new", "--no-sandbox", "--no-first-run", "--disable-gpu", `--user-data-dir=${join(scratch, "profile")}`] } } } }) }); body = await r.json(); } catch { await sleep(200); } }
if (!body || !body.value) { console.error("session failed", JSON.stringify(body).slice(0,300)); process.exit(3); }
const ws = new WebSocket(body.value.capabilities.webSocketUrl);
await new Promise((r, j) => { ws.onopen = r; ws.onerror = () => j(new Error("ws")); });
let id = 0; const pend = new Map(); const events = [];
ws.onmessage = (m) => { const f = JSON.parse(String(m.data)); pushRaw("recv", f); if (f.id !== undefined && pend.has(f.id)) { pend.get(f.id)(f); pend.delete(f.id); } else if (f.method) events.push({ i: events.length, frame: f, params: f.params || {} }); };
const send = (method, params = {}, ms = 8000) => new Promise((res) => { id++; const t = setTimeout(() => { pend.delete(id); res({ type: "transport", detail: "timeout" }); }, ms); pend.set(id, (f) => { clearTimeout(t); res(f); }); pushRaw("send", { id, method, params }); ws.send(JSON.stringify({ id, method, params })); });
await send("session.subscribe", { events: ["network.beforeRequestSent", "network.responseStarted", "network.responseCompleted", "network.fetchError"] });
const t0 = await send("browsingContext.getTree", {}); const context = t0.result.contexts[0].context;
await send("browsingContext.navigate", { context, url: `${fx.base}/a.html`, wait: "complete" });
const B = fx.base; const P = String(new URL(B).port);
const cases = [
  ["CONTROL string literal URL", { type: "string", pattern: `${B}/data.txt?case=c1` }, "/data.txt?case=c1"],
  ["pattern host+port+pathname", { type: "pattern", protocol: "http", hostname: "127.0.0.1", port: P, pathname: "/data.txt" }, "/data.txt?case=c2"],
  ["pattern pathname only", { type: "pattern", pathname: "/data.txt" }, "/data.txt?case=c3"],
  ["pattern all components incl search", { type: "pattern", protocol: "http", hostname: "127.0.0.1", port: P, pathname: "/data.txt", search: "case=c4" }, "/data.txt?case=c4"],
  ["pattern search only", { type: "pattern", search: "case=c5" }, "/data.txt?case=c5"],
  ["pattern hostname+port only", { type: "pattern", hostname: "127.0.0.1", port: P }, "/data.txt?case=c6"],
];
const results = [];
for (const [label, pat, path] of cases) {
  const u = B + path;
  const add = await send("network.addIntercept", { phases: ["beforeRequestSent"], urlPatterns: [pat] });
  const entry = { label, urlPattern: pat, requestUrl: u, addIntercept: add };
  if (add.type === "success") {
    const start = events.length;
    await send("script.evaluate", { expression: `window.__q=fetch(${JSON.stringify(u)}).then(r=>r.text(),e=>'ERR:'+e),1`, awaitPromise: false, target: { context } });
    // poll up to 3s for a blocked beforeRequestSent on this URL
    let hit = null;
    for (let k = 0; k < 30 && !hit; k += 1) { await sleep(100); hit = events.slice(start).map((e) => e.frame).find((f) => f.method === "network.beforeRequestSent" && f.params.isBlocked === true && f.params.request.url === u); }
    entry.blocked = !!hit;
    entry.blockedEvent = hit || null;
    if (hit) entry.continue = await send("network.continueRequest", { request: hit.params.request.request });
    entry.fetch = (await send("script.evaluate", { expression: "window.__q", awaitPromise: true, target: { context } }, 4000)).result;
    entry.tailEvents = events.slice(start).map((e) => ({ method: e.frame.method, isBlocked: e.frame.params.isBlocked, url: e.frame.params.request && e.frame.params.request.url }));
    await send("network.removeIntercept", { intercept: add.result.intercept });
  }
  results.push(entry);
}
writeFileSync(join(OUT, "pattern-forms.json"), JSON.stringify({ fixtureBase: B, port: P, results }, null, 2) + "\n");
writeFileSync(join(OUT, "pattern-forms-frames.jsonl"), raw.map((r) => JSON.stringify(r)).join("\n") + "\n");
console.log(JSON.stringify(results.map(r => ({label:r.label, blocked:r.blocked, add:r.addIntercept.type, err:r.addIntercept.message, fetch:r.fetch && r.fetch.result && r.fetch.result.value})), null, 1));
try { ws.close(); } catch {}
await fetch(`http://127.0.0.1:${port}/session/${body.value.sessionId}`, { method: "DELETE" }).catch(() => {});
cd.kill("SIGTERM"); await fx.close(); await sleep(300); rmSync(scratch, { recursive: true, force: true }); if (own) rmSync(chromeTmp, { recursive: true, force: true });
