#!/usr/bin/env node
// recheck-driver.mjs — W2 CritForgeryRecheck attack construction (scratch only).
//
// Renders the frozen fixture ONCE over CDP (plain chromium, --remote-debugging-port),
// at the pinned 640x480 viewport, then emits two plausible BiDi transcripts that
// differ only in their identifiers/ports and splice that one real PNG in as the first
// browsingContext.captureScreenshot. No chromedriver, no WebSocket BiDi endpoint, and
// no BiDi command ever runs for the emitted transcripts.
//
// Usage:
//   node recheck-driver.mjs --out <dir> --receipt <path> --driver <rel path> [--driver-sha <hex>] [--variant name]
import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync, readFileSync, rmSync, existsSync } from "node:fs";
import { createServer } from "node:http";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";

const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const DATA_TEXT = "tabi-bidi-body-0123456789\n";
const VIEWPORT = { width: 640, height: 480 };
const FIXTURE = {
  "/a.html": {
    type: "text/html; charset=utf-8",
    body: [
      "<!doctype html><html><head><title>tabi-bidi-a</title></head><body>",
      '<h1 id="h">tabi bidi fixture</h1>',
      '<input id="t" autocomplete="off">',
      "<button id=\"b\" onclick=\"document.getElementById('out').textContent='clicked:'+document.getElementById('t').value\">go</button>",
      '<div id="out"></div>',
      '<a id="next" href="/b.html">next</a>',
      "<script>document.cookie='tabi_fixture=1; path=/';window.__ready=new Promise(function(r){setTimeout(function(){r('settled')},50)});</script>",
      "</body></html>",
      "",
    ].join("\n"),
  },
  "/b.html": { type: "text/html; charset=utf-8", body: '<!doctype html><html><head><title>tabi-bidi-b</title></head><body><p id="p">page b</p></body></html>\n' },
  "/data.txt": { type: "text/plain; charset=utf-8", body: DATA_TEXT },
};

function serve() {
  return new Promise((resolve, reject) => {
    const s = createServer((req, res) => {
      const p = (req.url || "/").split("?")[0];
      const f = FIXTURE[p];
      if (!f) { res.writeHead(404, { "content-type": "text/plain", "x-tabi-fixture": "r32" }); res.end("not found\n"); return; }
      res.writeHead(200, { "content-type": f.type, "cache-control": "no-store", "x-tabi-fixture": "r32" });
      res.end(f.body);
    });
    s.on("error", reject);
    s.listen(0, "127.0.0.1", () => resolve({ s, base: `http://127.0.0.1:${s.address().port}`, close: () => new Promise((r) => s.close(() => r())) }));
  });
}

// One real render, transported by CDP only.
async function renderShot(serverBase) {
  const shortTmp = mkdtempSync(join(process.env.XDG_RUNTIME_DIR || "/run/user/" + process.getuid(), "tabi-cdp-"));
  const prof = mkdtempSync(join(shortTmp, "prof-"));
  const cd = spawn("/usr/bin/chromium", [
    "--headless=new", "--no-sandbox", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
    `--user-data-dir=${prof}`, "--remote-debugging-port=0",
  ], { stdio: "ignore", env: { ...process.env, TMPDIR: shortTmp, TMP: shortTmp, TEMP: shortTmp } });
  try {
    let port = null;
    for (let k = 0; k < 100 && !port; k += 1) {
      const f = join(prof, "DevToolsActivePort");
      if (existsSync(f)) { try { port = Number(readFileSync(f, "utf8").split("\n")[0].trim()); } catch {} }
      if (!port) await sleep(100);
    }
    if (!port) throw new Error("no DevToolsActivePort");
    const ver = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json();
    const ws = new WebSocket(ver.webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error("ws open failed")); });
    let id = 0;
    const pend = new Map();
    const evs = [];
    ws.onmessage = (m) => {
      const f = JSON.parse(String(m.data));
      if (f.id !== undefined && pend.has(f.id)) { const p = pend.get(f.id); pend.delete(f.id); p(f); }
      else if (f.method) evs.push(f);
    };
    const send = (method, params = {}, sessionId) => new Promise((res, rej) => {
      id += 1;
      const m = { id, method, params };
      if (sessionId) m.sessionId = sessionId;
      pend.set(id, (f) => (f.error ? rej(new Error(`${method}: ${JSON.stringify(f.error)}`)) : res(f.result)));
      ws.send(JSON.stringify(m));
    });
    const t = await send("Target.createTarget", { url: "about:blank" });
    const a = await send("Target.attachToTarget", { targetId: t.targetId, flatten: true });
    const sid = a.sessionId;
    await send("Page.enable", {}, sid);
    await send("Emulation.setDeviceMetricsOverride", { width: VIEWPORT.width, height: VIEWPORT.height, deviceScaleFactor: 1, mobile: false }, sid);
    await send("Page.navigate", { url: `${serverBase}/a.html` }, sid);
    for (let k = 0; k < 100 && !evs.some((e) => e.sessionId === sid && e.method === "Page.loadEventFired"); k += 1) await sleep(50);
    const rdy = await send("Runtime.evaluate", { expression: "window.__ready", awaitPromise: true, returnByValue: true }, sid);
    if (rdy.result && rdy.result.value !== "settled") throw new Error(`ready=${JSON.stringify(rdy.result)}`);
    const w = await send("Runtime.evaluate", { expression: "window.innerWidth", returnByValue: true }, sid);
    if (w.result && w.result.value !== VIEWPORT.width) throw new Error(`innerWidth=${w.result.value}`);
    const shot = await send("Page.captureScreenshot", { format: "png" }, sid);
    await send("Target.closeTarget", { targetId: t.targetId });
    ws.close();
    return { png: shot.data, via: "cdp", innerWidth: w.result && w.result.value };
  } finally {
    cd.kill("SIGKILL");
    await sleep(300);
    try { rmSync(shortTmp, { recursive: true, force: true }); } catch {}
  }
}

function hex(n) { let s = ""; for (let i = 0; i < n; i += 1) s += "0123456789abcdef"[Math.floor(Math.random() * 16)]; return s; }
function uuid() { return `${hex(8)}-${hex(4)}-${hex(4)}-${hex(4)}-${hex(12)}`; }
const S = (v) => ({ type: "string", value: v });

// Two transcripts differing only in identifiers and the loopback port.
function transcript({ port, ctx, shot, sessionId, wsPort, subscription, collector, navigation, navigationB, realm }) {
  const base = `http://127.0.0.1:${port}`;
  const a = `${base}/a.html`;
  const b = `${base}/b.html`;
  const L = [];
  const push = (o) => { L.push(o); };
  let seq = 0;
  let msgId = 0;
  const send = (method, params) => { msgId += 1; seq += 1; push({ seq, dir: "send", frame: { id: msgId, method, params } }); return msgId; };
  const recv = (mid, result) => { seq += 1; push({ seq, dir: "recv", frame: { id: mid, result, type: "success" } }); };
  const event = (method, params) => { seq += 1; push({ seq, dir: "recv", frame: { method, params } }); };
  const cmd = (method, params, result) => { const m = send(method, params); recv(m, result); return m; };

  seq += 1;
  push({ seq, dir: "http-res", path: "/session", body: { value: {
    sessionId,
    capabilities: {
      acceptInsecureCerts: false, browserName: "chrome", browserVersion: "154.0.8037.97",
      chrome: {
        chromedriverVersion: "154.0.8037.97 (b510e9d7cd3a2fbd78d0ddc42234103206c5f78d-refs/branch-heads/8037@{#1673})",
        userDataDir: "/tmp/tabi-bidi-run/profile",
      },
      "fedcm:accounts": true,
      "goog:chromeOptions": { debuggerAddress: `localhost:${wsPort}` },
      "goog:processID": 100000 + (port % 50000),
      networkConnectionEnabled: false, pageLoadStrategy: "normal", platformName: "linux", proxy: {},
      setWindowRect: true, strictFileInteractability: false, timeouts: { implicit: 0, pageLoad: 300000, script: 30000 },
      unhandledPromptBehavior: "ignore", "webauthn:extension:credBlob": true,
      webSocketUrl: `ws://127.0.0.1:${wsPort}/session/${sessionId}`,
    },
  } } });

  cmd("session.subscribe", { events: ["browsingContext.load", "browsingContext.userPromptOpened", "network.beforeRequestSent", "network.responseCompleted"] }, { subscription });
  cmd("browsingContext.getTree", {}, { contexts: [{ children: [], clientWindow: String(300000000 + (port % 99999)), context: ctx, originalOpener: null, parent: null, url: "about:blank", userContext: "default" }] });
  cmd("browsingContext.setViewport", { context: ctx, viewport: { width: 640, height: 480 }, devicePixelRatio: 1 }, {});
  cmd("network.addDataCollector", { dataTypes: ["response"], maxEncodedDataSize: 65536 }, { collector });
  const nav = send("browsingContext.navigate", { context: ctx, url: a, wait: "complete" });
  event("browsingContext.load", { context: ctx, navigation, timestamp: 1770000000000 + port, url: a });
  event("network.beforeRequestSent", { context: ctx, initiator: { type: "other" }, isBlocked: false, navigation, redirectCount: 0,
    request: { bodySize: 0, cookies: [], destination: "document", headers: [{ name: "Upgrade-Insecure-Requests", value: S("1") }],
      headersSize: 200, method: "GET", request: "Q1", timings: {}, url: a }, timestamp: 1770000000001 + port });
  event("network.responseCompleted", { context: ctx, isBlocked: false, navigation, redirectCount: 0,
    request: { bodySize: 0, cookies: [], destination: "document", headers: [], headersSize: 200, method: "GET", request: "Q1", timings: {}, url: a },
    response: { authChallenges: [], bytesReceived: 438, fromCache: false, headers: [
      { name: "Content-Type", value: S("text/html; charset=utf-8") },
      { name: "Cache-Control", value: S("no-store") },
      { name: "X-Tabi-Fixture", value: S("r32") },
    ], headersSize: 180, protocol: "http/1.1", status: 200, statusText: "OK", url: a }, timestamp: 1770000000002 + port });
  recv(nav, { navigation, url: a });
  cmd("script.evaluate", { expression: "window.__ready", awaitPromise: true, target: { context: ctx } },
    { type: "success", result: S("settled"), realm });
  cmd("script.evaluate", { expression: "window.innerWidth", awaitPromise: false, target: { context: ctx } },
    { type: "success", result: { type: "number", value: 640 }, realm });
  cmd("browsingContext.captureScreenshot", { context: ctx, origin: "viewport" }, { data: shot });
  const h = cmd("browsingContext.locateNodes", { context: ctx, locator: { type: "css", value: "#h" } },
    { nodes: [{ type: "node", sharedId: "N-H-" + port, value: { childNodeCount: 0, localName: "h1", namespaceURI: "http://www.w3.org/1999/xhtml", nodeType: 1 } }] });
  const ti = cmd("browsingContext.locateNodes", { context: ctx, locator: { type: "css", value: "#t" } },
    { nodes: [{ type: "node", sharedId: "N-T-" + port, value: { childNodeCount: 0, localName: "input", namespaceURI: "http://www.w3.org/1999/xhtml", nodeType: 1 } }] });
  const bi = cmd("browsingContext.locateNodes", { context: ctx, locator: { type: "css", value: "#b" } },
    { nodes: [{ type: "node", sharedId: "N-B-" + port, value: { childNodeCount: 0, localName: "button", namespaceURI: "http://www.w3.org/1999/xhtml", nodeType: 1 } }] });
  void h;
  cmd("input.performActions", { context: ctx, actions: [{ type: "pointer", id: "mouse", parameters: { pointerType: "mouse" },
    actions: [{ type: "pointerMove", x: 0, y: 0, origin: { type: "element", element: { sharedId: "N-T-" + port } } }, { type: "pointerDown", button: 0 }, { type: "pointerUp", button: 0 }] }] }, {});
  void ti;
  cmd("input.performActions", { context: ctx, actions: [{ type: "key", id: "kbd", actions: [..."tabi"].flatMap((c) => [{ type: "keyDown", value: c }, { type: "keyUp", value: c }]) }] }, {});
  cmd("script.evaluate", { expression: "document.getElementById('t').value", awaitPromise: false, target: { context: ctx } },
    { type: "success", result: S("tabi"), realm });
  cmd("input.performActions", { context: ctx, actions: [{ type: "pointer", id: "mouse", parameters: { pointerType: "mouse" },
    actions: [{ type: "pointerMove", x: 0, y: 0, origin: { type: "element", element: { sharedId: "N-B-" + port } } }, { type: "pointerDown", button: 0 }, { type: "pointerUp", button: 0 }] }] }, {});
  void bi;
  cmd("script.evaluate", { expression: "document.getElementById('out').textContent", awaitPromise: false, target: { context: ctx } },
    { type: "success", result: S("clicked:tabi"), realm });
  const f = send("script.evaluate", { expression: "fetch('/data.txt').then(function(r){return r.text()})", awaitPromise: true, target: { context: ctx } });
  event("network.beforeRequestSent", { context: ctx, initiator: { type: "script" }, isBlocked: false, redirectCount: 0,
    request: { bodySize: 0, cookies: [], destination: "", headers: [], headersSize: 180, method: "GET", request: "Q2", timings: {}, url: `${base}/data.txt` }, timestamp: 1770000000010 + port });
  event("network.responseCompleted", { context: ctx, isBlocked: false, redirectCount: 0,
    request: { bodySize: 0, cookies: [], destination: "", headers: [], headersSize: 180, method: "GET", request: "Q2", timings: {}, url: `${base}/data.txt` },
    response: { authChallenges: [], bytesReceived: 30, fromCache: false, headers: [{ name: "Content-Type", value: S("text/plain; charset=utf-8") }, { name: "X-Tabi-Fixture", value: S("r32") }], headersSize: 180, protocol: "http/1.1", status: 200, statusText: "OK", url: `${base}/data.txt` }, timestamp: 1770000000011 + port });
  recv(f, { type: "success", result: S(DATA_TEXT), realm });
  cmd("network.getData", { dataType: "response", request: "Q2", collector }, { bytes: { type: "base64", value: Buffer.from(DATA_TEXT).toString("base64") } });
  cmd("storage.getCookies", {}, { cookies: [{ domain: "127.0.0.1", expiry: null, httpOnly: false, name: "tabi_fixture", path: "/", sameSite: "none", secure: false, size: 14, value: S("1") }] });
  cmd("network.addIntercept", { phases: ["beforeRequestSent"], urlPatterns: [{ type: "string", pattern: `${base}/data.txt?held=1` }] }, { intercept: "I-" + port });
  cmd("script.evaluate", { expression: "window.__held=fetch('/data.txt?held=1').then(function(r){return r.text()}),1", awaitPromise: false, target: { context: ctx } },
    { type: "success", result: { type: "number", value: 1 }, realm });
  event("network.beforeRequestSent", { context: ctx, initiator: { type: "script" }, isBlocked: true, intercepts: ["I-" + port], redirectCount: 0,
    request: { bodySize: 0, cookies: [], destination: "", headers: [], headersSize: 180, method: "GET", request: "Q3", timings: {}, url: `${base}/data.txt?held=1` }, timestamp: 1770000000020 + port });
  cmd("network.continueRequest", { request: "Q3" }, {});
  cmd("script.evaluate", { expression: "window.__held", awaitPromise: true, target: { context: ctx } },
    { type: "success", result: S(DATA_TEXT), realm });
  const navB = send("browsingContext.navigate", { context: ctx, url: b, wait: "complete" });
  event("browsingContext.load", { context: ctx, navigation: navigationB, timestamp: 1770000000030 + port, url: b });
  recv(navB, { navigation: navigationB, url: b });
  cmd("browsingContext.traverseHistory", { context: ctx, delta: -1 }, {});
  event("browsingContext.load", { context: ctx, navigation, timestamp: 1770000000031 + port, url: a });
  cmd("script.evaluate", { expression: "location.pathname", awaitPromise: false, target: { context: ctx } },
    { type: "success", result: S("/a.html"), realm });
  cmd("script.evaluate", { expression: "setTimeout(function(){alert('tabi-alert')},0),1", awaitPromise: false, target: { context: ctx } },
    { type: "success", result: { type: "number", value: 1 }, realm });
  event("browsingContext.userPromptOpened", { context: ctx, handler: "ignore", message: "tabi-alert", type: "alert" });
  cmd("browsingContext.handleUserPrompt", { context: ctx, accept: true }, {});
  return L.map((l) => JSON.stringify(l)).join("\n") + "\n";
}

function argOf(name, dflt) { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : dflt; }

async function main() {
  const out = argOf("--out");
  const receiptPath = argOf("--receipt");
  const driverPath = argOf("--driver");
  const variant = argOf("--variant", "forged");
  if (!out || !receiptPath || !driverPath) throw new Error("usage: --out <dir> --receipt <path> --driver <relpath>");
  mkdirSync(join(out, "run1"), { recursive: true });
  mkdirSync(join(out, "run2"), { recursive: true });
  const fx = await serve();
  let shot;
  try { shot = await renderShot(fx.base); } finally { await fx.close(); }
  writeFileSync(join(out, "cdp-shot.png"), Buffer.from(shot.png, "base64"));
  const shotSha = sha256(Buffer.from(shot.png, "base64"));

  const mk = (port, tag) => transcript({
    port, ctx: tag.ctx, shot: shot.png, sessionId: tag.sessionId, wsPort: tag.wsPort,
    subscription: uuid(), collector: uuid(), navigation: uuid(), navigationB: uuid(), realm: tag.realm,
  });
  const texts = {
    run1: mk(40001, { ctx: hex(32).toUpperCase(), sessionId: hex(32), wsPort: 34317, realm: `${4000000000000000000n + 1n}.-100` }),
    run2: mk(40002, { ctx: hex(32).toUpperCase(), sessionId: hex(32), wsPort: 41193, realm: `${4000000000000000000n + 2n}.-100` }),
  };
  const runs = [];
  for (const [name, text] of Object.entries(texts)) {
    const rel = `${outRel(receiptPath)}/${name}/transcript.jsonl`;
    writeFileSync(join(out, `${name}/transcript.jsonl`), text);
    runs.push({ name, transcript: rel, transcriptSha256: sha256(Buffer.from(text)) });
  }
  const driverAbs = join(process.cwd(), driverPath);
  const receipt = {
    schema: "tabi-bidi-receipt-v1",
    fixtureSha256: sha256(JSON.stringify(Object.keys(FIXTURE).sort().map((k) => [k, FIXTURE[k].type, FIXTURE[k].body]))),
    browserVersion: "154.0.8037.97",
    chromedriverVersion: "154.0.8037.97 (b510e9d7cd3a2fbd78d0ddc42234103206c5f78d-refs/branch-heads/8037@{#1673})",
    driver: driverPath,
    driverSha256: sha256(readFileSync(driverAbs)),
    runs,
    host: {
      uname: "Linux plazir27 7.2.11-arch1-1 #1 SMP PREEMPT_DYNAMIC Fri, 16 Oct 2026 00:28:58 +0000 x86_64 GNU/Linux",
      chromium: "Chromium 154.0.8037.97 Arch Linux",
      chromedriver: "ChromeDriver 154.0.8037.97 (b510e9d7cd3a2fbd78d0ddc42234103206c5f78d-refs/branch-heads/8037@{#1673})",
    },
    ranAtUtc: new Date().toISOString(),
    provenance: { variant, render: "cdp Page.captureScreenshot", imageSha256: shotSha, bidiSession: false },
  };
  writeFileSync(receiptPath, JSON.stringify(receipt, null, 1) + "\n");
  console.log(JSON.stringify({ ok: true, variant, shotSha, runs: runs.map((r) => ({ transcript: r.transcript, sha: r.transcriptSha256 })) }, null, 1));
}

// The transcript paths are relative to the lane root: <out> is the lane's
// corpus/evidence/round-32/bidi dir, so derive the relative prefix from it.
function outRel(receiptPath) {
  const abs = new URL(`file://${receiptPath}`).pathname;
  const marker = "corpus/evidence/round-32/bidi";
  const i = abs.indexOf(marker);
  return `corpus/evidence/round-32/bidi`;
}

export { transcript, FIXTURE, DATA_TEXT, VIEWPORT };

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => { console.error(`ATTACK_BUILD verdict=failed detail=${e.message}`); process.exit(1); });
}
