import { spawn } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { createServer as netServer } from "node:net";
import { join } from "node:path";
import { serveFixture } from "/fast/scratch/hyaku/tabi-r32/ExecInterceptPhases/clone/scripts/check-bidi-runtime.mjs";
const OUT = process.argv[2]; const raw = []; const now = () => new Date().toISOString();
const pushRaw = (d, f) => raw.push({ seq: raw.length + 1, ts: now(), dir: d, frame: f });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const freePort = () => new Promise((res, rej) => { const s = netServer(); s.on("error", rej); s.listen(0, "127.0.0.1", () => { const p = s.address().port; s.close(() => res(p)); }); });
const S = process.env.TMPDIR; const scratch = mkdtempSync(join(S, "tabi-sub-"));
const rt = process.env.XDG_RUNTIME_DIR; let chromeTmp = scratch, own = false;
if (scratch.length > 60) { chromeTmp = mkdtempSync(join(rt, "tabi-sub-")); own = true; }
const fx = await serveFixture(); const port = await freePort();
const cd = spawn("/usr/bin/chromedriver", [`--port=${port}`], { stdio: "ignore", env: { ...process.env, TMPDIR: chromeTmp, TMP: chromeTmp, TEMP: chromeTmp } });
let body = null;
for (let k = 0; k < 60 && !body; k += 1) { try { const r = await fetch(`http://127.0.0.1:${port}/session`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ capabilities: { alwaysMatch: { browserName: "chrome", webSocketUrl: true, unhandledPromptBehavior: "ignore", "goog:chromeOptions": { binary: "/usr/bin/chromium", args: ["--headless=new", "--no-sandbox", "--no-first-run", "--disable-gpu", `--user-data-dir=${join(scratch, "profile")}`] } } } }) }); body = await r.json(); } catch { await sleep(200); } }
if (!body || !body.value) { console.error("session failed"); process.exit(3); }
const ws = new WebSocket(body.value.capabilities.webSocketUrl);
await new Promise((r, j) => { ws.onopen = r; ws.onerror = () => j(new Error("ws")); });
let id = 0; const pend = new Map(); const events = [];
ws.onmessage = (m) => { const f = JSON.parse(String(m.data)); pushRaw("recv", f); if (f.id !== undefined && pend.has(f.id)) { pend.get(f.id)(f); pend.delete(f.id); } else if (f.method) events.push({ i: events.length, frame: f }); };
const send = (method, params = {}, ms = 6000) => new Promise((res) => { id++; const t = setTimeout(() => { pend.delete(id); res({ type: "transport", detail: "timeout" }); }, ms); pend.set(id, (f) => { clearTimeout(t); res(f); }); pushRaw("send", { id, method, params }); ws.send(JSON.stringify({ id, method, params })); });
const t0 = await send("browsingContext.getTree", {}); const context = t0.result.contexts[0].context;
await send("browsingContext.navigate", { context, url: `${fx.base}/a.html`, wait: "complete" });
const B = fx.base;
const out = { fixtureBase: B, steps: [] };
async function step(label, subscribed) {
  const u = `${B}/data.txt?case=${label}`;
  const add = await send("network.addIntercept", { phases: ["beforeRequestSent"], urlPatterns: [{ type: "string", pattern: u }] });
  if (add.type !== "success") { out.steps.push({ label, subscribed, add }); return; }
  if (subscribed) { await send("session.subscribe", { events: ["network.beforeRequestSent"] }); }
  const start = events.length;
  const trigAt = Date.now();
  await send("script.evaluate", { expression: `window.__z=fetch(${JSON.stringify(u)}).then(r=>r.text(),e=>'ERR:'+e),1`, awaitPromise: false, target: { context } });
  await sleep(1500);
  const evs = events.slice(start).filter((e) => e.frame.method === "network.beforeRequestSent" && e.frame.params.request.url === u).map((e) => ({ isBlocked: e.frame.params.isBlocked }));
  // is the fetch still pending? evaluate with short budget
  const pending = await send("script.evaluate", { expression: "window.__z", awaitPromise: true, target: { context } }, 1200);
  let resolved = null;
  if (pending.type === "success" && pending.result) resolved = pending.result.result;
  out.steps.push({ label, subscribedBeforeIntercept: subscribed, add: add.type, intercept: add.result && add.result.intercept, eventsSeen: evs, fetchPendingAfter1500ms: resolved === null, fetchValue: resolved && resolved.value });
  if (evs.some((e) => e.isBlocked) && add.result) {
    // release whatever is blocked so the session stays clean
    const hit = events.slice(start).map((e) => e.frame).find((f) => f.method === "network.beforeRequestSent" && f.params.isBlocked === true);
    if (hit) await send("network.continueRequest", { request: hit.params.request.request });
    const late = await send("script.evaluate", { expression: "window.__z", awaitPromise: true, target: { context } }, 3000);
    out.steps[out.steps.length - 1].afterRelease = late.result && late.result.result && late.result.result.value;
  }
  if (add.result) await send("network.removeIntercept", { intercept: add.result.intercept });
}
await step("unsubscribed-1", false);
await step("subscribed-2", true);
await step("unsubscribed-3", false);
writeFileSync(join(OUT, "subscribe-dependence.json"), JSON.stringify(out, null, 2) + "\n");
writeFileSync(join(OUT, "subscribe-dependence-frames.jsonl"), raw.map((r) => JSON.stringify(r)).join("\n") + "\n");
console.log(JSON.stringify(out.steps, null, 1));
try { ws.close(); } catch {}
await fetch(`http://127.0.0.1:${port}/session/${body.value.sessionId}`, { method: "DELETE" }).catch(() => {});
cd.kill("SIGTERM"); await fx.close(); await sleep(300); rmSync(scratch, { recursive: true, force: true }); if (own) rmSync(chromeTmp, { recursive: true, force: true });
