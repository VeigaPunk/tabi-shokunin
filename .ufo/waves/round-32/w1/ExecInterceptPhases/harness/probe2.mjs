// Round-32 w1: BiDi intercept phases x commands, chromium 154 / chromedriver 154, loopback only.
import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { createServer } from "node:http";
import { createServer as createNetServer } from "node:net";
import { join } from "node:path";
import { serveFixture, DATA_TEXT, FIXTURE_HEADER } from "/fast/scratch/hyaku/tabi-r32/ExecInterceptPhases/clone/scripts/check-bidi-runtime.mjs";

const OUT = process.argv[2];
const CHROMIUM = "/usr/bin/chromium", CHROMEDRIVER = "/usr/bin/chromedriver";
const raw = [];
const started = Date.now();
const now = () => new Date().toISOString();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pushRaw = (dir, frame) => raw.push({ seq: raw.length + 1, ts: now(), dir, frame });

const freePort = () => new Promise((res, rej) => { const s = createNetServer(); s.on("error", rej); s.listen(0, "127.0.0.1", () => { const p = s.address().port; s.close(() => res(p)); }); });

function serveAuth() {
  return new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      const path = (req.url || "/").split("?")[0];
      if (path !== "/auth.txt") { res.writeHead(404, { "content-type": "text/plain" }); res.end("nf\n"); return; }
      if (!req.headers.authorization) {
        res.writeHead(401, { "www-authenticate": 'Basic realm="tabi-r32"', "content-type": "text/plain", [FIXTURE_HEADER[0]]: FIXTURE_HEADER[1] });
        res.end("auth required\n"); return;
      }
      res.writeHead(200, { "content-type": "text/plain", [FIXTURE_HEADER[0]]: FIXTURE_HEADER[1] });
      res.end("auth ok\n");
    });
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => resolve({ server, base: `http://127.0.0.1:${server.address().port}`, close: () => new Promise((r) => server.close(() => r())) }));
  });
}

const S = process.env.TMPDIR;
const scratch = mkdtempSync(join(S, "tabi-ei-"));
const rt = process.env.XDG_RUNTIME_DIR;
let chromeTmp = scratch, ownChromeTmp = false;
if (scratch.length > 60) { chromeTmp = mkdtempSync(join(rt, "tabi-ei-")); ownChromeTmp = true; }

const summary = { schema: "tabi-round32-w1-intercepts-v2", startedAt: now(),
  versions: { chromium: spawnSync(CHROMIUM, ["--version"], { encoding: "utf8" }).stdout.trim(), chromedriver: spawnSync(CHROMEDRIVER, ["--version"], { encoding: "utf8" }).stdout.trim(), node: process.version },
  scratch, chromeTmp, cases: [], extras: [] };

const fx = await serveFixture();
const auth = await serveAuth();
summary.fixture = { base: fx.base, authBase: auth.base, fixtureDataText: DATA_TEXT };
const port = await freePort();
const cd = spawn(CHROMEDRIVER, [`--port=${port}`], { stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, TMPDIR: chromeTmp, TMP: chromeTmp, TEMP: chromeTmp } });
let cdErr = ""; cd.stderr.on("data", (b) => { cdErr += String(b); });
let ws = null, sessionId = null, contextId = null;
const events = [];
const pending = new Map();
const waiters = [];
let cmdId = 0;

const send = (method, params = {}) => new Promise((resolve) => {
  cmdId += 1; const id = cmdId;
  pushRaw("send", { id, method, params });
  const t = setTimeout(() => { pending.delete(id); resolve({ kind: "timeout", id, method, params }); }, 20000);
  pending.set(id, (f) => { clearTimeout(t); resolve({ kind: "frame", id, method, params, frame: f }); });
  ws.send(JSON.stringify({ id, method, params }));
});
const frameOf = (r) => (r && r.kind === "frame" ? r.frame : { type: "transport", detail: r });
const okv = (f) => f && f.type === "success";
const resultOf = (f) => (f && f.result) || {};

function waitEvent(pred, from = 0, ms = 8000) {
  const hit = events.slice(from).find((e) => e.i >= from && pred(e));
  if (hit) return Promise.resolve(hit);
  return Promise.race([new Promise((resolve) => waiters.push({ pred, from, resolve })), sleep(ms).then(() => null)]);
}

async function runCase(c) {
  const name = c.name;
  const url = c.url;
  const start = events.length;
  const out = { name, phase: c.phase, url, command: c.command, commandParams: c.params || {}, eventMethod: c.event,
    eventArrived: false, eventBlocked: null, eventIntercepts: null, requestId: null,
    commandResponse: null, commandOk: null, effect: null, release: null, afterReleaseEffect: null };
  const added = frameOf(await send("network.addIntercept", { phases: [c.phase], urlPatterns: [{ type: "string", pattern: url }] }));
  out.addIntercept = added;
  if (!okv(added)) { summary.cases.push(out); return out; }
  const interceptId = resultOf(added).intercept;
  try {
    await send("script.evaluate", { expression: c.trigger, awaitPromise: false, target: { context: contextId } });
    const ev = await waitEvent((e) => e.method === c.event && e.params.isBlocked === true
      && (e.params.intercepts || []).includes(interceptId)
      && c.eventUrlMatch(e.params), start, c.eventWaitMs || 8000);
    out.eventArrived = !!ev;
    if (ev) {
      out.eventBlocked = ev.params.isBlocked;
      out.eventIntercepts = ev.params.intercepts;
      out.requestId = ev.params.request && ev.params.request.request;
      out.event = { method: ev.method, params: ev.params };
      const r = await send(c.command, { ...(c.params || {}), request: out.requestId });
      out.commandResponse = frameOf(r); out.commandOk = okv(out.commandResponse);
    } else {
      // no block: still show whether the request completed and what the fetch saw
      out.effect = await observe(c.observeExpr);
    }
    if (ev && c.observe !== false) out.effect = await observe(c.observeExpr);
    if (ev && c.releaseCommand) {
      out.release = { command: c.releaseCommand, params: c.releaseParams || {}, response: frameOf(await send(c.releaseCommand, { ...(c.releaseParams || {}), request: out.requestId })) };
      if (c.postReleaseObserve) out.afterReleaseEffect = await observe(c.observeExpr);
    }
    await sleep(c.settleMs || 300);
    out.tailEvents = events.slice(start).map((e) => ({ method: e.method, url: e.params.request && e.params.request.url, isBlocked: e.params.isBlocked, errorText: e.params.errorText, status: e.params.response && e.params.response.status }));
  } finally {
    await send("network.removeIntercept", { intercept: interceptId });
    summary.cases.push(out);
  }
  return out;
}

async function observe(expr) {
  const f = frameOf(await send("script.evaluate", { expression: expr || "window.__r", awaitPromise: true, target: { context: contextId } }));
  if (!okv(f)) return { error: f };
  const rv = f.result;
  return { type: rv && rv.type, value: rv && (rv.value !== undefined ? rv.value : rv) };
}

try {
  let body = null;
  for (let k = 0; k < 60 && !body; k += 1) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}/session`, { method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ capabilities: { alwaysMatch: { browserName: "chrome", webSocketUrl: true, unhandledPromptBehavior: "ignore",
          "goog:chromeOptions": { binary: CHROMIUM, args: ["--headless=new", "--no-sandbox", "--no-first-run", "--disable-gpu", `--user-data-dir=${join(scratch, "profile")}`] } } } }) });
      body = await r.json();
    } catch { await sleep(200); }
  }
  if (!body || !body.value || !body.value.capabilities) throw new Error(`new session failed: ${JSON.stringify(body).slice(0, 400)} cdErr=${cdErr.slice(-300)}`);
  summary.session = { browserName: body.value.capabilities.browserName, browserVersion: body.value.capabilities.browserVersion,
    webSocketUrl: body.value.capabilities.webSocketUrl, chromedriverVersion: body.value.capabilities.chrome && body.value.capabilities.chrome.chromedriverVersion };
  pushRaw("http-res", { path: "/session", body: { value: { sessionId: body.value.sessionId, capabilities: body.value.capabilities } } });
  sessionId = body.value.sessionId;
  ws = new WebSocket(body.value.capabilities.webSocketUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error("ws open failed")); });
  ws.onmessage = (m) => {
    const f = JSON.parse(String(m.data));
    pushRaw("recv", f);
    if (f.id !== undefined && pending.has(f.id)) { const cb = pending.get(f.id); pending.delete(f.id); cb(f); }
    else if (f.method) {
      const e = { i: events.length, method: f.method, params: f.params || {} };
      events.push(e);
      for (const w of [...waiters]) if (e.i >= w.from && w.pred(e)) { waiters.splice(waiters.indexOf(w), 1); w.resolve(e); }
    }
  };
  await send("session.subscribe", { events: ["browsingContext.load", "network.beforeRequestSent", "network.responseStarted", "network.responseCompleted", "network.fetchError", "network.authRequired"] });
  const tree = frameOf(await send("browsingContext.getTree", {}));
  contextId = (resultOf(tree).contexts || [])[0].context;
  if (!contextId) throw new Error("no browsing context");
  await send("browsingContext.setViewport", { context: contextId, viewport: { width: 640, height: 480 }, devicePixelRatio: 1 });
  const a = `${fx.base}/a.html`;
  await send("browsingContext.navigate", { context: contextId, url: a, wait: "complete" });
  await waitEvent((e) => e.method === "browsingContext.load" && e.params.url === a, 0, 8000);
  await send("script.evaluate", { expression: "window.__ready", awaitPromise: true, target: { context: contextId } });

  const ex = async (label, method, params) => { const f = frameOf(await send(method, params)); summary.extras.push({ label, method, params, response: f }); return f; };
  const lit = `${fx.base}/data.txt`;
  const all3 = await ex("addIntercept phases=[beforeRequestSent,responseStarted,authRequired] literal urlPattern", "network.addIntercept", { phases: ["beforeRequestSent", "responseStarted", "authRequired"], urlPatterns: [{ type: "string", pattern: lit }] });
  if (okv(all3)) await send("network.removeIntercept", { intercept: resultOf(all3).intercept });
  await ex("addIntercept phase=responseCompleted (not an enum value)", "network.addIntercept", { phases: ["responseCompleted"], urlPatterns: [{ type: "string", pattern: lit }] });
  await ex("addIntercept phases=[]", "network.addIntercept", { phases: [] });
  await ex("addIntercept phases=[beforeRequestSent] urlPatterns=[] (all URLs)", "network.addIntercept", { phases: ["beforeRequestSent"], urlPatterns: [] })
    .then((f) => okv(f) ? send("network.removeIntercept", { intercept: resultOf(f).intercept }) : null);
  await ex("addIntercept string pattern with '*' wildcard", "network.addIntercept", { phases: ["beforeRequestSent"], urlPatterns: [{ type: "string", pattern: `${fx.base}/data.txt*` }] });

  const trig = (u) => `window.__r=fetch(${JSON.stringify(u)}).then(function(r){return r.text().then(function(t){return JSON.stringify({status:r.status,text:t})})},function(e){return JSON.stringify({error:String(e)})}),1`;
  const evUrl = (e) => String((e.params.request && e.params.request.url) || (e.params.response && e.params.response.url) || "");

  // beforeRequestSent
  const brs = (n, cmd, params, opts = {}) => {
    const u = `${fx.base}/data.txt?case=${n}`;
    return { name: n, phase: "beforeRequestSent", event: "network.beforeRequestSent", url: u, command: cmd, params, trigger: trig(u), eventUrlMatch: (p) => evUrl({ params: p }) === u, ...opts };
  };
  await runCase(brs("brs-continueRequest", "network.continueRequest", {}));
  await runCase(brs("brs-continueResponse", "network.continueResponse", { statusCode: 200 }, { releaseCommand: "network.continueRequest", postReleaseObserve: true }));
  await runCase(brs("brs-provideResponse", "network.provideResponse", { statusCode: 200, reasonPhrase: "OK", headers: [{ name: "content-type", value: { type: "string", value: "text/plain" } }], body: { type: "string", value: "provided-brs" } }));
  await runCase(brs("brs-failRequest", "network.failRequest", {}));
  await runCase(brs("brs-continueWithAuth", "network.continueWithAuth", { action: "default" }, { releaseCommand: "network.continueRequest", postReleaseObserve: true, observe: false }));

  // responseStarted
  const rs = (n, cmd, params, opts = {}) => {
    const u = `${fx.base}/data.txt?case=${n}`;
    return { name: n, phase: "responseStarted", event: "network.responseStarted", url: u, command: cmd, params, trigger: trig(u), eventUrlMatch: (p) => evUrl({ params: p }) === u, ...opts };
  };
  await runCase(rs("rs-continueResponse", "network.continueResponse", {}));
  await runCase(rs("rs-continueRequest", "network.continueRequest", {}, { releaseCommand: "network.continueResponse", postReleaseObserve: true }));
  await runCase(rs("rs-provideResponse", "network.provideResponse", { statusCode: 200, reasonPhrase: "OK", headers: [{ name: "content-type", value: { type: "string", value: "text/plain" } }], body: { type: "string", value: "provided-rs" } }));
  await runCase(rs("rs-failRequest", "network.failRequest", {}));
  await runCase(rs("rs-continueWithAuth", "network.continueWithAuth", { action: "default" }, { releaseCommand: "network.continueResponse", postReleaseObserve: true, observe: false }));

  // authRequired control on a fixture request (no 401 anywhere in FIXTURE)
  {
    const start = events.length;
    const u = `${fx.base}/data.txt?case=ar-control`;
    const added = frameOf(await send("network.addIntercept", { phases: ["authRequired"], urlPatterns: [{ type: "string", pattern: u }] }));
    const fetchRes = await observe(`fetch(${JSON.stringify(u)}).then(function(r){return r.text()},function(e){return 'ERR:'+e})`);
    await sleep(400);
    summary.extras.push({ label: "authRequired intercept over a 200 fixture request", addIntercept: added, fetchResult: fetchRes,
      authRequiredEvents: events.slice(start).filter((e) => e.method === "network.authRequired").length,
      beforeRequestSentEvents: events.slice(start).filter((e) => e.method === "network.beforeRequestSent").length });
    if (okv(added)) await send("network.removeIntercept", { intercept: resultOf(added).intercept });
  }

  // authRequired: supplementary loopback 401 (Basic)
  const ar = (n, cmd, params, opts = {}) => {
    const u = `${auth.base}/auth.txt?case=${n}`;
    return { name: n, phase: "authRequired", event: "network.authRequired", url: u, command: cmd, params, trigger: trig(u), eventUrlMatch: (p) => evUrl({ params: p }) === u, ...opts };
  };
  await runCase(ar("ar-continueWithAuth-default", "network.continueWithAuth", { action: "default" }));
  await runCase(ar("ar-continueRequest", "network.continueRequest", {}, { releaseCommand: "network.continueWithAuth", releaseParams: { action: "default" }, postReleaseObserve: true }));
  await runCase(ar("ar-continueResponse", "network.continueResponse", { statusCode: 200 }, { releaseCommand: "network.continueWithAuth", releaseParams: { action: "default" }, postReleaseObserve: true, observe: false }));
  await runCase(ar("ar-provideResponse", "network.provideResponse", { statusCode: 200, reasonPhrase: "OK", headers: [{ name: "content-type", value: { type: "string", value: "text/plain" } }], body: { type: "string", value: "provided-ar" } }, { releaseCommand: "network.continueWithAuth", releaseParams: { action: "default" }, postReleaseObserve: true }));
  await runCase(ar("ar-failRequest", "network.failRequest", {}, { releaseCommand: "network.continueWithAuth", releaseParams: { action: "default" }, postReleaseObserve: true, observe: false }));

  // double-command semantics on a released request
  {
    const u = `${fx.base}/data.txt?case=dup`;
    const added = frameOf(await send("network.addIntercept", { phases: ["beforeRequestSent"], urlPatterns: [{ type: "string", pattern: u }] }));
    const start = events.length;
    await send("script.evaluate", { expression: trig(u), awaitPromise: false, target: { context: contextId } });
    const ev = await waitEvent((e) => e.method === "network.beforeRequestSent" && e.params.isBlocked === true && evUrl(e) === u, start, 8000);
    const first = ev ? frameOf(await send("network.continueRequest", { request: ev.params.request.request })) : null;
    const second = ev ? frameOf(await send("network.continueRequest", { request: ev.params.request.request })) : null;
    await sleep(250);
    summary.extras.push({ label: "second command on already-released request", first, second, effect: await observe() });
    if (okv(added)) await send("network.removeIntercept", { intercept: resultOf(added).intercept });
  }
} catch (err) {
  summary.error = { message: String((err && err.stack) || err), chromedriverStderrTail: cdErr.slice(-2000) };
  process.exitCode = 1;
} finally {
  try { ws && ws.close(); } catch {}
  if (sessionId) { try { await fetch(`http://127.0.0.1:${port}/session/${sessionId}`, { method: "DELETE" }); } catch {} }
  cd.kill("SIGTERM");
  await fx.close(); await auth.close(); await sleep(400);
  if (ownChromeTmp) rmSync(chromeTmp, { recursive: true, force: true });
  summary.finishedAt = now(); summary.elapsedMs = Date.now() - started; summary.wireFrames = raw.length;
  mkdirSync(OUT, { recursive: true });
  writeFileSync(join(OUT, "frames.jsonl"), raw.map((r) => JSON.stringify(r)).join("\n") + "\n");
  writeFileSync(join(OUT, "probe-summary.json"), JSON.stringify(summary, null, 2) + "\n");
  writeFileSync(join(OUT, "chromedriver.stderr.txt"), cdErr);
  rmSync(scratch, { recursive: true, force: true });
  console.log(JSON.stringify({ cases: summary.cases.length, extras: summary.extras.length, frames: raw.length, error: summary.error || null }, null, 2));
}
