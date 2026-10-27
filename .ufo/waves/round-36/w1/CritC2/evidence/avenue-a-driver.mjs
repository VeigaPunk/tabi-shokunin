#!/usr/bin/env node
// scripts/critc2-honest-driver.mjs — CritC2 (tabi round 36 w1) avenue (a):
// a minimal, honest WebDriver-BiDi driver over geckodriver's classic
// /session bootstrap (webSocketUrl: true) on the pinned Firefox, written
// from scratch for the attack seat. It drives ONLY the gate's frozen
// loopback FIXTURE, records every wire frame in the gate's transcript
// format, and emits a tabi-bidi-receipt-v1 over two cold runs.
//
// Gate imports are limited to the counter's allow-list: FIXTURE_SHA256,
// VIEWPORT, serveFixture. No gate predicates, no counter code.
//
// Write scope: --out dir (transcripts + receipt) and mkdtemp dirs under
// TMPDIR (profiles/HOME/XDG). Never writes the lane tree outside --out.
//
// Usage:
//   TMPDIR=<scratch> node scripts/critc2-honest-driver.mjs --out <dir>
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { FIXTURE_SHA256, VIEWPORT, serveFixture } from "./check-bidi-runtime.mjs";

const SCHEMA = "tabi-bidi-receipt-v1";
const FIREFOX = "/home/vgpnk/.local/opt/firefox-158.0.1/firefox";
const GECKODRIVER = "/home/vgpnk/.local/bin/geckodriver";
const BROWSER_VERSION = "158.0.1";
const DATA_TEXT = "tabi-bidi-body-0123456789\n"; // fixture body; a gate predicate re-derives it
const SUBSCRIBE = ["browsingContext.load", "browsingContext.userPromptOpened", "network.beforeRequestSent", "network.responseCompleted"];
const SESSION_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const LOOPS = /^ws:\/\/(127\.0\.0\.1|localhost):\d+\/session\/[0-9a-f-]+$/;

const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class Refusal extends Error {}

function arg(name) {
  const i = process.argv.indexOf(name);
  return i > 0 && process.argv[i + 1] ? process.argv[i + 1] : null;
}
function freePort() {
  return new Promise((res, rej) => {
    const s = createServer();
    s.on("error", rej);
    s.listen(0, "127.0.0.1", () => { const p = s.address().port; s.close(() => res(p)); });
  });
}
function versionLine(bin) {
  const r = spawnSync(bin, ["--version"], { encoding: "utf8" });
  return ((r.stdout || r.stderr || "").trim().split("\n")[0]) || `unavailable (exit ${r.status})`;
}

// One cold run: fresh geckodriver + profile + HOME under TMPDIR; the recipe in
// the gate's liveRecord order; every frame logged as one transcript line.
async function coldRun({ name, outDir, scratchBase }) {
  if (!scratchBase) throw new Refusal("TMPDIR must be set");
  const runDir = mkdtempSync(join(scratchBase, `critc2-${name}-`));
  const home = join(runDir, "home");
  const tmp = join(runDir, "tmp");
  const profiles = join(runDir, "profiles");
  const runtime = join(runDir, "runtime");
  for (const d of [home, tmp, profiles, runtime, join(home, ".config"), join(home, ".cache"), join(home, ".local", "share"), join(home, ".local", "state")]) mkdirSync(d, { recursive: true });
  const env = {
    PATH: process.env.PATH, HOME: home, TMPDIR: tmp, TMP: tmp, TEMP: tmp,
    XDG_CONFIG_HOME: join(home, ".config"), XDG_CACHE_HOME: join(home, ".cache"),
    XDG_DATA_HOME: join(home, ".local", "share"), XDG_STATE_HOME: join(home, ".local", "state"),
    XDG_RUNTIME_DIR: runtime, MOZ_HEADLESS: "1", LC_ALL: "C.UTF-8",
  };
  const lines = [];
  const log = (dir, extra) => { lines.push({ seq: lines.length + 1, dir, ...extra }); return lines.length; };
  const notes = [];
  const note = (step, value) => notes.push({ step, value });
  const fixture = await serveFixture();
  const port = await freePort();
  const wsPort = await freePort();
  if (port === 9222 || wsPort === 9222) throw new Refusal("refusing the 9222 CDP lease port");
  const gd = spawn(GECKODRIVER, ["--port", String(port), "--websocket-port", String(wsPort), "--binary", FIREFOX, "--profile-root", profiles], { stdio: "ignore", detached: true, env });
  let ws = null;
  let sessionId = null;
  const timer = setTimeout(() => { try { ws && ws.close(); } catch {} }, 120000);
  try {
    const body = await (async () => {
      for (let k = 0; k < 100; k += 1) {
        try {
          const r = await fetch(`http://127.0.0.1:${port}/session`, {
            method: "POST", headers: { "content-type": "application/json" },
            body: JSON.stringify({ capabilities: { alwaysMatch: {
              browserName: "firefox", webSocketUrl: true, unhandledPromptBehavior: "ignore",
              "moz:firefoxOptions": { args: ["-headless"], prefs: { "network.dns.disabled": true, "network.trr.mode": 5 } },
            } } }),
          });
          return await r.json();
        } catch { await sleep(200); }
      }
      return null;
    })();
    if (!body || !body.value || !body.value.capabilities) throw new Refusal(`new session failed: ${JSON.stringify(body && body.value).slice(0, 200)}`);
    log("http-res", { path: "/session", body });
    sessionId = body.value.sessionId;
    const caps = body.value.capabilities;
    if (!SESSION_UUID.test(String(sessionId))) throw new Refusal(`sessionId not UUID-shaped: ${sessionId}`);
    if (caps.browserName !== "firefox") throw new Refusal(`browserName ${caps.browserName}`);
    if (caps.browserVersion !== BROWSER_VERSION) throw new Refusal(`browserVersion ${caps.browserVersion} != ${BROWSER_VERSION}`);
    if (typeof caps["moz:geckodriverVersion"] !== "string") throw new Refusal("no moz:geckodriverVersion");
    if (!LOOPS.test(String(caps.webSocketUrl || ""))) throw new Refusal(`webSocketUrl not loopback: ${caps.webSocketUrl}`);
    if (!String(caps.webSocketUrl).endsWith(`/session/${sessionId}`)) throw new Refusal("webSocketUrl does not carry the sessionId");
    note("session", { sessionId: "uuid", browserVersion: caps.browserVersion, geckodriverVersion: caps["moz:geckodriverVersion"], webSocketUrl: caps.webSocketUrl });

    ws = new WebSocket(caps.webSocketUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Refusal("ws open failed")); });
    const pending = new Map();
    const waiters = [];
    const seen = [];
    let nextId = 0;
    ws.onmessage = (m) => {
      const frame = JSON.parse(String(m.data));
      log("recv", { frame });
      if (frame.id !== undefined && pending.has(frame.id)) {
        const p = pending.get(frame.id);
        pending.delete(frame.id);
        p.resolve(frame);
      } else if (frame.method) {
        seen.push({ at: lines.length, frame });
        for (const w of [...waiters]) if (w.at < lines.length && w.pred(frame)) { waiters.splice(waiters.indexOf(w), 1); w.resolve(frame); }
      }
    };
    const send = (method, params = {}) => new Promise((res, rej) => {
      nextId += 1;
      log("send", { frame: { id: nextId, method, params } });
      pending.set(nextId, { resolve: (f) => (f.type === "success" ? res(f) : rej(new Refusal(`${method}: ${JSON.stringify(f).slice(0, 200)}`))) });
      ws.send(JSON.stringify({ id: nextId, method, params }));
    });
    const waitEvent = (pred, ms = 15000, after = 0) => {
      const hit = seen.find(({ at, frame }) => at > after && pred(frame));
      if (hit) return Promise.resolve(hit.frame);
      return Promise.race([new Promise((res) => waiters.push({ at: after, pred, resolve: res })), sleep(ms).then(() => null)]);
    };
    const evaluate = (expression, awaitPromise, context) => send("script.evaluate", { expression, awaitPromise, target: { context } });
    const strOf = (f) => f && f.result && f.result.result && f.result.result.type === "string" ? f.result.result.value : undefined;

    await send("session.subscribe", { events: SUBSCRIBE });
    note("subscribe", `${SUBSCRIBE.length} events`);
    const tree = await send("browsingContext.getTree", {});
    const context = tree.result && tree.result.contexts && tree.result.contexts[0] && tree.result.contexts[0].context;
    if (!context) throw new Refusal("no browsing context");
    note("getTree", { contexts: tree.result.contexts.length });
    await send("browsingContext.setViewport", { context, viewport: VIEWPORT, devicePixelRatio: 1 });
    note("setViewport", VIEWPORT);
    await send("network.addDataCollector", { dataTypes: ["response"], maxEncodedDataSize: 65536 });
    note("addDataCollector", "response");

    const aUrl = `${fixture.base}/a.html`;
    await send("browsingContext.navigate", { context, url: aUrl, wait: "complete" });
    note("navigate /a.html", aUrl);
    if (!await waitEvent((f) => f.method === "browsingContext.load" && f.params && f.params.url === aUrl)) throw new Refusal("no load for /a.html");
    const ready = await evaluate("window.__ready", true, context);
    note("window.__ready", strOf(ready));
    if (strOf(ready) !== "settled") throw new Refusal("window.__ready not settled");
    const iw = await evaluate("window.innerWidth", false, context);
    note("window.innerWidth", iw.result && iw.result.result && iw.result.result.value);

    // First screenshot — the binding artefact; this point in the recipe only.
    const shot = await send("browsingContext.captureScreenshot", { context });
    const shotBuf = Buffer.from(String(shot.result.data || ""), "base64");
    note("captureScreenshot", { bytes: shotBuf.length, sha256: sha256(shotBuf) });
    if (shotBuf.toString("hex", 0, 8) !== "89504e470d0a1a0a") throw new Refusal("first shot is not a PNG");
    if (shotBuf.readUInt32BE(16) !== VIEWPORT.width || shotBuf.readUInt32BE(20) !== VIEWPORT.height) throw new Refusal("first shot viewport mismatch");

    const locate = async (sel) => {
      const r = await send("browsingContext.locateNodes", { context, locator: { type: "css", value: sel } });
      const nodes = (r.result && r.result.nodes) || [];
      if (nodes.length !== 1 || !nodes[0].sharedId) throw new Refusal(`locateNodes ${sel} -> ${nodes.length}`);
      note(`locateNodes ${sel}`, { localName: nodes[0].value && nodes[0].value.localName });
      return nodes[0].sharedId;
    };
    await locate("#h");
    const tId = await locate("#t");
    const bId = await locate("#b");
    const click = (sharedId) => [{ type: "pointer", id: "mouse", parameters: { pointerType: "mouse" }, actions: [
      { type: "pointerMove", x: 0, y: 0, origin: { type: "element", element: { sharedId } } },
      { type: "pointerDown", button: 0 }, { type: "pointerUp", button: 0 }] }];
    await send("input.performActions", { context, actions: click(tId) });
    note("pointer click #t", "down/up");
    await send("input.performActions", { context, actions: [{ type: "key", id: "kbd", actions: [..."tabi"].flatMap((ch) => [{ type: "keyDown", value: ch }, { type: "keyUp", value: ch }]) }] });
    note("key actions", "tabi");
    note("#t value", strOf(await evaluate("document.getElementById('t').value", false, context)));
    await send("input.performActions", { context, actions: click(bId) });
    note("pointer click #b", "down/up");
    note("#out textContent", strOf(await evaluate("document.getElementById('out').textContent", false, context)));

    note("fetch /data.txt", strOf(await evaluate("fetch('/data.txt').then(function(r){return r.text()})", true, context)).trim());
    const done = await waitEvent((f) => f.method === "network.responseCompleted" && f.params && f.params.response && /\/data\.txt$/.test(String(f.params.response.url)));
    if (!done) throw new Refusal("no responseCompleted for /data.txt");
    const data = await send("network.getData", { dataType: "response", request: done.params.request.request });
    const bytes = data.result && data.result.bytes ? (data.result.bytes.type === "base64" ? Buffer.from(data.result.bytes.value, "base64").toString("utf8") : data.result.bytes.value) : "";
    note("getData /data.txt", { bytes: bytes.length, matches: bytes === DATA_TEXT });
    if (bytes !== DATA_TEXT) throw new Refusal("getData body mismatch");

    const cookies = await send("storage.getCookies", {});
    note("storage.getCookies", ((cookies.result && cookies.result.cookies) || []).map((c) => `${c.name}=${c.value && c.value.value}`));

    const ic = await send("network.addIntercept", { phases: ["beforeRequestSent"], urlPatterns: [{ type: "string", pattern: `${fixture.base}/data.txt?held=1` }] });
    const icId = ic.result && ic.result.intercept;
    note("blocked beforeRequestSent", { intercept: icId, url: `${fixture.base}/data.txt?held=1` });
    await evaluate("window.__held=fetch('/data.txt?held=1').then(function(r){return r.text()}),1", false, context);
    const blocked = await waitEvent((f) => f.method === "network.beforeRequestSent" && f.params && f.params.isBlocked === true && (f.params.intercepts || []).includes(icId));
    if (!blocked) throw new Refusal("no blocked beforeRequestSent");
    await send("network.continueRequest", { request: blocked.params.request.request });
    note("continueRequest", blocked.params.request.request);
    note("held body", strOf(await evaluate("window.__held", true, context)));

    await send("browsingContext.navigate", { context, url: `${fixture.base}/b.html`, wait: "complete" });
    note("navigate /b.html", `${fixture.base}/b.html`);
    const tr = await send("browsingContext.traverseHistory", { context, delta: -1 });
    note("traverseHistory", tr.result && tr.result.delta);
    const back = await waitEvent((f) => f.method === "browsingContext.load" && f.params && f.params.url === aUrl, 5000);
    note("post-traverse load", back && back.params && back.params.url);
    for (let k = 0; k < 20; k += 1) {
      if (strOf(await evaluate("location.pathname", false, context)) === "/a.html") break;
      await sleep(100);
    }
    note("location.pathname", "/a.html");

    await evaluate("setTimeout(function(){alert('tabi-alert')},0),1", false, context);
    const prompt = await waitEvent((f) => f.method === "browsingContext.userPromptOpened" && f.params && f.params.message === "tabi-alert");
    if (!prompt) throw new Refusal("no userPromptOpened");
    note("userPromptOpened", prompt.params.message);
    await send("browsingContext.handleUserPrompt", { context: prompt.params.context, accept: true });
    note("handleUserPrompt", "accept");

    const transcriptPath = join(outDir, `${name}.jsonl`);
    writeFileSync(transcriptPath, lines.map((l) => JSON.stringify(l)).join("\n") + "\n");
    return { name, transcriptPath, observed: notes, firstShotSha256: sha256(shotBuf) };
  } finally {
    clearTimeout(timer);
    try { ws && ws.close(); } catch {}
    if (sessionId) { try { await fetch(`http://127.0.0.1:${port}/session/${sessionId}`, { method: "DELETE" }); } catch {} }
    try { process.kill(-gd.pid, "SIGTERM"); } catch { try { gd.kill("SIGTERM"); } catch {} }
    await fixture.close();
    await sleep(400);
    rmSync(runDir, { recursive: true, force: true });
  }
}

async function main() {
  const outDir = resolve(arg("--out") || "");
  if (!outDir) throw new Refusal("usage: --out <dir> required");
  const scratchBase = process.env.TMPDIR || null;
  mkdirSync(outDir, { recursive: true });
  const driverRel = relative(resolve(dirname(fileURLToPath(import.meta.url)), ".."), fileURLToPath(import.meta.url)).split("\\").join("/");
  const runs = [];
  for (const name of ["run1", "run2"]) {
    const r = await coldRun({ name, outDir, scratchBase });
    runs.push({ name, transcriptPath: r.transcriptPath, observed: r.observed, firstShotSha256: r.firstShotSha256 });
    console.log(`${name}: ${r.transcriptPath} shot=${r.firstShotSha256}`);
  }
  if (runs[0].firstShotSha256 !== runs[1].firstShotSha256) throw new Refusal("first screenshots differ across runs");
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const receipt = {
    schema: SCHEMA,
    fixtureSha256: FIXTURE_SHA256,
    browserVersion: BROWSER_VERSION,
    browserName: "firefox",
    geckodriverVersion: "0.37.1",
    driver: driverRel,
    driverSha256: sha256(readFileSync(fileURLToPath(import.meta.url))),
    runs: runs.map((r) => ({ name: r.name, transcript: relative(root, r.transcriptPath).split("\\").join("/"), transcriptSha256: sha256(readFileSync(r.transcriptPath)), observed: r.observed })),
    firstScreenshotSha256: runs[0].firstShotSha256,
    binaries: { firefox: FIREFOX, firefoxVersionLine: versionLine(FIREFOX), geckodriver: GECKODRIVER, geckodriverVersionLine: versionLine(GECKODRIVER) },
  };
  writeFileSync(join(outDir, "receipt.json"), JSON.stringify(receipt, null, 1) + "\n");
  console.log(`receipt: ${join(outDir, "receipt.json")}`);
}

main().then(() => process.exit(0), (e) => { console.error(`critc2-honest-driver: ${e.message}`); process.exit(e instanceof Refusal ? 2 : 1); });
