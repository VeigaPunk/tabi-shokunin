// authRequired leg v3: one fresh loopback origin (ephemeral port) per case.
import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { createServer } from "node:http";
import { createServer as createNetServer } from "node:net";
import { join } from "node:path";

const OUT = process.argv[2];
const raw = []; const now = () => new Date().toISOString();
const pushRaw = (dir, frame) => raw.push({ seq: raw.length + 1, ts: now(), dir, frame });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const freePort = () => new Promise((res, rej) => { const s = createNetServer(); s.on("error", rej); s.listen(0, "127.0.0.1", () => { const p = s.address().port; s.close(() => res(p)); }); });

function serveCase(caseName) {
  return new Promise((resolve, reject) => {
    const requests = [];
    const server = createServer((req, res) => {
      const [path, query = ""] = (req.url || "/").split("?");
      const auth = req.headers.authorization;
      requests.push({ path, query, authorization: auth || null, at: now() });
      if (path === "/auth.html") { res.writeHead(200, { "content-type": "text/html; charset=utf-8" }); res.end(`<!doctype html><html><head><title>auth-${caseName}</title></head><body><h1 id=h>auth</h1><img id=im><script>window.__ready=1</script></body></html>\n`); return; }
      if (path === "/auth.txt") {
        const realm = `tabi-${caseName}`;
        if (!auth) { res.writeHead(401, { "www-authenticate": `Basic realm="${realm}"`, "content-type": "text/plain" }); res.end(`auth required ${realm}\n`); return; }
        res.writeHead(200, { "content-type": "text/plain" }); res.end(`auth ok ${realm} ${auth}\n`); return;
      }
      res.writeHead(404, { "content-type": "text/plain" }); res.end("nf\n");
    });
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => resolve({ server, base: `http://127.0.0.1:${server.address().port}`, requests, close: () => new Promise((r) => { server.closeAllConnections(); server.close(() => r()); }) }));
  });
}

const S = process.env.TMPDIR;
const scratch = mkdtempSync(join(S, "tabi-ar3-"));
const rt = process.env.XDG_RUNTIME_DIR;
let chromeTmp = scratch, ownChromeTmp = false;
if (scratch.length > 60) { chromeTmp = mkdtempSync(join(rt, "tabi-ar3-")); ownChromeTmp = true; }
const summary = { schema: "tabi-round32-w1-authrequired-v3", startedAt: now(),
  versions: { chromium: spawnSync("/usr/bin/chromium", ["--version"], { encoding: "utf8" }).stdout.trim(), chromedriver: spawnSync("/usr/bin/chromedriver", ["--version"], { encoding: "utf8" }).stdout.trim(), node: process.version },
  cases: [], extras: [] };
const port = await freePort();
const cd = spawn("/usr/bin/chromedriver", [`--port=${port}`], { stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, TMPDIR: chromeTmp, TMP: chromeTmp, TEMP: chromeTmp } });
let cdErr = ""; cd.stderr.on("data", (b) => { cdErr += String(b); });
let ws = null, sessionId = null, contextId = null;
const events = []; const pending = new Map(); const waiters = []; let cmdId = 0;
const send = (method, params = {}, ms = 10000) => new Promise((resolve) => {
  cmdId += 1; const id = cmdId; pushRaw("send", { id, method, params });
  const t = setTimeout(() => { pending.delete(id); resolve({ kind: "timeout", id, method, params }); }, ms);
  pending.set(id, (f) => { clearTimeout(t); resolve({ kind: "frame", id, method, params, frame: f }); });
  ws.send(JSON.stringify({ id, method, params }));
});
const frameOf = (r) => (r && r.kind === "frame" ? r.frame : { type: "transport", detail: r });
const okv = (f) => f && f.type === "success";
const resultOf = (f) => (f && f.result) || {};
function waitEvent(pred, from = 0, ms = 6000) {
  const hit = events.slice(from).find((e) => e.i >= from && pred(e));
  if (hit) return Promise.resolve(hit);
  return Promise.race([new Promise((resolve) => waiters.push({ pred, from, resolve })), sleep(ms).then(() => null)]);
}
const observe = async (expr, ms = 4000) => {
  const f = frameOf(await send("script.evaluate", { expression: expr, awaitPromise: true, target: { context: contextId } }, ms));
  if (!okv(f)) return { error: f };
  const rv = f.result; return { type: rv && rv.type, value: rv && (rv.value !== undefined ? rv.value : rv) };
};
const evUrl = (e) => String((e.params.request && e.params.request.url) || "");
const trig = (u) => `window.__r=fetch(${JSON.stringify(u)}).then(function(r){return r.text().then(function(t){return JSON.stringify({status:r.status,text:t})})},function(e){return JSON.stringify({error:String(e)})}),1`;

async function withOrigin(caseName, fn) {
  const site = await serveCase(caseName);
  const page = `${site.base}/auth.html`;
  try {
    await send("browsingContext.navigate", { context: contextId, url: page, wait: "complete" }, 8000);
    await waitEvent((e) => e.method === "browsingContext.load" && String(e.params.url).startsWith(page), 0, 8000);
    return await fn(site);
  } finally {
    await site.close();
  }
}

async function runCase(c) {
  return withOrigin(c.name, async (site) => {
    const url = `${site.base}/auth.txt?case=${c.name}`;
    const out = { name: c.name, origin: site.base, url, trigger: c.triggerKind, command: c.command, commandParams: c.params || {}, eventArrived: false, eventBlocked: null, commandResponse: null, commandOk: null, effect: null, release: null, afterReleaseEffect: null };
    const added = frameOf(await send("network.addIntercept", { phases: ["authRequired"], urlPatterns: [{ type: "string", pattern: url }] }));
    out.addIntercept = added;
    if (!okv(added)) { out.serverRequests = site.requests; summary.cases.push(out); return; }
    const iid = resultOf(added).intercept;
    const start = events.length;
    try {
      await send("script.evaluate", { expression: trig(url), awaitPromise: false, target: { context: contextId } });
      const ev = await waitEvent((e) => e.method === "network.authRequired" && e.params.isBlocked === true && (e.params.intercepts || []).includes(iid) && evUrl(e) === url, start, 6000);
      out.eventArrived = !!ev;
      if (ev) {
        out.eventBlocked = ev.params.isBlocked; out.event = { method: ev.method, params: ev.params }; out.requestId = ev.params.request.request;
        const r = await send(c.command, { ...(c.params || {}), request: out.requestId });
        out.commandResponse = frameOf(r); out.commandOk = okv(out.commandResponse);
        if (c.observe !== false) out.effect = await observe("window.__r", c.observeMs || 4000);
        if (c.releaseCommand) {
          out.release = { command: c.releaseCommand, params: c.releaseParams || {}, response: frameOf(await send(c.releaseCommand, { ...(c.releaseParams || {}), request: out.requestId })) };
          if (c.postReleaseObserve) out.afterReleaseEffect = await observe("window.__r", c.observeMs || 4000);
        }
      } else if (c.observe !== false) out.effect = await observe("window.__r", c.observeMs || 4000);
      await sleep(300);
      out.tailEvents = events.slice(start).map((e) => ({ method: e.method, url: evUrl(e), isBlocked: e.params.isBlocked, status: e.params.response && e.params.response.status, errorText: e.params.errorText }));
      out.serverRequests = site.requests.slice();
    } finally {
      await send("network.removeIntercept", { intercept: iid });
      summary.cases.push(out);
    }
  });
}

try {
  let body = null;
  for (let k = 0; k < 60 && !body; k += 1) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}/session`, { method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ capabilities: { alwaysMatch: { browserName: "chrome", webSocketUrl: true, unhandledPromptBehavior: "ignore",
          "goog:chromeOptions": { binary: "/usr/bin/chromium", args: ["--headless=new", "--no-sandbox", "--no-first-run", "--disable-gpu", `--user-data-dir=${join(scratch, "profile")}`] } } } }) });
      body = await r.json();
    } catch { await sleep(200); }
  }
  if (!body || !body.value || !body.value.capabilities) throw new Error(`new session failed: ${JSON.stringify(body).slice(0, 400)}`);
  summary.session = { browserVersion: body.value.capabilities.browserVersion, webSocketUrl: body.value.capabilities.webSocketUrl };
  pushRaw("http-res", { path: "/session", body: { value: { sessionId: body.value.sessionId, capabilities: body.value.capabilities } } });
  sessionId = body.value.sessionId;
  ws = new WebSocket(body.value.capabilities.webSocketUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error("ws open failed")); });
  ws.onmessage = (m) => {
    const f = JSON.parse(String(m.data)); pushRaw("recv", f);
    if (f.id !== undefined && pending.has(f.id)) { const cb = pending.get(f.id); pending.delete(f.id); cb(f); }
    else if (f.method) { const e = { i: events.length, method: f.method, params: f.params || {} }; events.push(e); for (const w of [...waiters]) if (e.i >= w.from && w.pred(e)) { waiters.splice(waiters.indexOf(w), 1); w.resolve(e); } }
  };
  await send("session.subscribe", { events: ["browsingContext.load", "network.beforeRequestSent", "network.responseStarted", "network.responseCompleted", "network.fetchError", "network.authRequired"] });
  const tree = frameOf(await send("browsingContext.getTree", {}));
  contextId = (resultOf(tree).contexts || [])[0].context;
  await send("browsingContext.setViewport", { context: contextId, viewport: { width: 640, height: 480 }, devicePixelRatio: 1 });
  const boot = await serveCase("boot");
  summary.bootOrigin = boot.base;
  await send("browsingContext.navigate", { context: contextId, url: `${boot.base}/auth.html`, wait: "complete" });
  await boot.close();

  await runCase({ name: "cancel", command: "network.continueWithAuth", params: { action: "cancel" }, triggerKind: "same-origin fetch()" });
  await runCase({ name: "default", command: "network.continueWithAuth", params: { action: "default" }, triggerKind: "same-origin fetch()", observeMs: 2500 });
  await runCase({ name: "contReq", command: "network.continueRequest", params: {}, triggerKind: "same-origin fetch()", releaseCommand: "network.continueWithAuth", releaseParams: { action: "cancel" }, postReleaseObserve: true });
  await runCase({ name: "provide", command: "network.provideResponse", params: { statusCode: 200, reasonPhrase: "OK", headers: [{ name: "content-type", value: { type: "string", value: "text/plain" } }], body: { type: "string", value: "provided-ar" } }, triggerKind: "same-origin fetch()" });
  await runCase({ name: "fail", command: "network.failRequest", params: {}, triggerKind: "same-origin fetch()", releaseCommand: "network.continueWithAuth", releaseParams: { action: "cancel" }, postReleaseObserve: true });
  await runCase({ name: "contResp", command: "network.continueResponse", params: { statusCode: 200 }, triggerKind: "same-origin fetch()" });

  // extras: img subresource and top-level navigation, each on a fresh origin
  await withOrigin("img", async (site) => {
    const url = `${site.base}/auth.txt?case=img`;
    const added = frameOf(await send("network.addIntercept", { phases: ["authRequired"], urlPatterns: [{ type: "string", pattern: url }] }));
    const start = events.length;
    await send("script.evaluate", { expression: `document.getElementById('im').src=${JSON.stringify(url)},1`, awaitPromise: false, target: { context: contextId } });
    const ev = await waitEvent((e) => e.method === "network.authRequired" && evUrl(e) === url, start, 6000);
    const rel = ev ? frameOf(await send("network.continueWithAuth", { request: ev.params.request.request, action: "cancel" })) : null;
    await sleep(500);
    summary.extras.push({ label: "<img src> subresource 401 (fresh origin)", addIntercept: added, eventArrived: !!ev, event: ev && { method: ev.method, params: ev.params }, release: rel, serverRequests: site.requests.slice(),
      tailEvents: events.slice(start).map((e) => ({ method: e.method, url: evUrl(e), isBlocked: e.params.isBlocked, status: e.params.response && e.params.response.status })) });
    if (okv(added)) await send("network.removeIntercept", { intercept: resultOf(added).intercept });
  });
  await withOrigin("nav", async (site) => {
    const url = `${site.base}/auth.txt?case=nav`;
    const added = frameOf(await send("network.addIntercept", { phases: ["authRequired"], urlPatterns: [{ type: "string", pattern: url }] }));
    const start = events.length;
    const nav = await send("browsingContext.navigate", { context: contextId, url, wait: "none" }, 8000);
    const ev = await waitEvent((e) => e.method === "network.authRequired" && evUrl(e) === url, start, 8000);
    let rel = null;
    if (ev) rel = frameOf(await send("network.continueWithAuth", { request: ev.params.request.request, action: "cancel" }));
    await sleep(1200);
    summary.extras.push({ label: "top-level navigation to 401 URL (fresh origin)", addIntercept: added, navigateResponse: frameOf(nav), eventArrived: !!ev, event: ev && { method: ev.method, params: ev.params }, release: rel, serverRequests: site.requests.slice(),
      tailEvents: events.slice(start).map((e) => ({ method: e.method, url: evUrl(e), isBlocked: e.params.isBlocked, status: e.params.response && e.params.response.status })) });
    if (okv(added)) await send("network.removeIntercept", { intercept: resultOf(added).intercept });
  });
} catch (err) {
  summary.error = { message: String((err && err.stack) || err), chromedriverStderrTail: cdErr.slice(-1500) };
  process.exitCode = 1;
} finally {
  try { ws && ws.close(); } catch {}
  if (sessionId) { try { await fetch(`http://127.0.0.1:${port}/session/${sessionId}`, { method: "DELETE" }); } catch {} }
  cd.kill("SIGTERM"); await sleep(400);
  if (ownChromeTmp) rmSync(chromeTmp, { recursive: true, force: true });
  summary.finishedAt = now(); summary.wireFrames = raw.length;
  mkdirSync(OUT, { recursive: true });
  writeFileSync(join(OUT, "auth-frames.jsonl"), raw.map((r) => JSON.stringify(r)).join("\n") + "\n");
  writeFileSync(join(OUT, "auth-probe-summary.json"), JSON.stringify(summary, null, 2) + "\n");
  rmSync(scratch, { recursive: true, force: true });
  console.log(JSON.stringify({ cases: summary.cases.length, extras: summary.extras.length, frames: raw.length, error: summary.error || null }, null, 2));
}
