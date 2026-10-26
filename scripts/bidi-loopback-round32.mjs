#!/usr/bin/env node
// scripts/bidi-loopback-round32.mjs — tabi lane round 32 (claim C1).
//
// An independent WebDriver BiDi client over chromedriver's classic /session
// bootstrap (webSocketUrl: true). It drives the counter's frozen FIXTURE on
// 127.0.0.1 only, records every frame in the counter's transcript format
// (one `http-res /session` line, then `send`/`recv` in wire order), and writes
// a `tabi-bidi-receipt-v1` receipt over two cold runs (fresh profile each).
//
// This file imports only FIXTURE_SHA256, VIEWPORT and serveFixture from
// scripts/check-bidi-runtime.mjs (the gate). It does not import or copy the
// gate's liveRecord or PREDICATES: it is a client, not the counter.
//
// Write scope: its own --out directory and a throwaway chrome profile under
// TMPDIR; never the lane, never credentials, never an off-loopback URL.
//
// Usage:
//   TMPDIR=<short scratch> node scripts/bidi-loopback-round32.mjs \
//     [--out corpus/evidence/round-32/bidi] [--chromedriver chromedriver] \
//     [--chromium /usr/bin/chromium]
//
// Exit: 0 two runs recorded and receipt written; 1 a run failed; 2 usage/refusal.
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { FIXTURE_SHA256, VIEWPORT, serveFixture } from "./check-bidi-runtime.mjs";

const SCHEMA = "tabi-bidi-receipt-v1";
const SCRIPT_PATH = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(SCRIPT_PATH), "..");
const DRIVER_REL = relative(ROOT, SCRIPT_PATH).split("\\").join("/");
const DATA_TEXT = "tabi-bidi-body-0123456789\n"; // asserted locally; predicate re-checks from the transcript
const RUN_TIMEOUT_MS = 90000;

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class Refusal extends Error {}

function freePort() {
  return new Promise((res, rej) => {
    const s = createServer();
    s.on("error", rej);
    s.listen(0, "127.0.0.1", () => { const p = s.address().port; s.close(() => res(p)); });
  });
}

function argValue(name, fallback) {
  const i = process.argv.indexOf(name);
  return i > 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

function versionLine(bin, args = ["--version"]) {
  const r = spawnSync(bin, args, { encoding: "utf8" });
  return (r.stdout || r.stderr || "").trim().replace(/\s+/g, " ") || `unavailable (exit ${r.status})`;
}

// One cold run: start chromedriver, negotiate a BiDi session, drive the recipe,
// record every frame. Returns { transcriptPath, observed, caps }.
async function runOnce({ name, outDir, scratchRoot, chromedriver, chromium }) {
  const runDir = join(outDir, name);
  mkdirSync(runDir, { recursive: true });
  const transcriptPath = join(runDir, "transcript.jsonl");
  const lines = [];
  const append = (dir, extra) => { lines.push({ seq: lines.length + 1, dir, ...extra }); return lines.length; };

  // Chromium's singleton socket lives under TMPDIR and must stay inside the
  // 108-byte unix socket limit, so chromium's TMPDIR is the short scratch root.
  const chromeTmp = process.env.TMPDIR && process.env.TMPDIR.length <= 40 ? process.env.TMPDIR : scratchRoot;
  const profile = mkdtempSync(join(chromeTmp, "prof-"));
  const fx = await serveFixture();
  const port = await freePort();
  const observed = [];
  const note = (step, value) => { observed.push({ step, value }); };
  const cd = spawn(chromedriver, [`--port=${port}`], {
    stdio: "ignore", detached: true,
    env: { ...process.env, TMPDIR: chromeTmp, TMP: chromeTmp, TEMP: chromeTmp },
  });
  let ws = null;
  let sessionId = null;
  let caps = null;
  const deadline = setTimeout(() => { try { ws && ws.close(); } catch {} }, RUN_TIMEOUT_MS);
  try {
    const payload = { capabilities: { alwaysMatch: {
      browserName: "chrome", webSocketUrl: true, unhandledPromptBehavior: "ignore",
      "goog:chromeOptions": { binary: chromium, args: ["--headless=new", "--no-sandbox", "--no-first-run", "--disable-gpu", `--user-data-dir=${join(profile, "data")}`] },
    } } };
    let body = null;
    for (let k = 0; k < 100 && !body; k += 1) {
      try {
        const r = await fetch(`http://127.0.0.1:${port}/session`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
        body = await r.json();
      } catch { await sleep(200); }
    }
    if (!body || !body.value || !body.value.capabilities) {
      throw new Refusal(`new session failed: ${JSON.stringify(body && body.value && body.value.message || body).slice(0, 300)}`);
    }
    note("session", { sessionId: body.value.sessionId ? "present" : "absent", browserVersion: body.value.capabilities.browserVersion, webSocketUrl: body.value.capabilities.webSocketUrl });
    append("http-res", { path: "/session", body });
    sessionId = body.value.sessionId;
    caps = body.value.capabilities;

    ws = new WebSocket(caps.webSocketUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Refusal("websocket open failed")); });

    const pending = new Map();
    const waiters = [];
    const events = [];
    let nextId = 0;
    let lastSent = 0;
    ws.onmessage = (m) => {
      const frame = JSON.parse(String(m.data));
      append("recv", { frame });
      if (frame.id !== undefined && pending.has(frame.id)) {
        const p = pending.get(frame.id); pending.delete(frame.id); p.resolve(frame);
      } else if (frame.method) {
        events.push({ at: lines.length, frame });
        for (const w of [...waiters]) if (w.at < lines.length && w.pred(frame)) { waiters.splice(waiters.indexOf(w), 1); w.resolve(frame); }
      }
    };
    const send = (method, params = {}) => new Promise((res, rej) => {
      nextId += 1;
      lastSent = append("send", { frame: { id: nextId, method, params } });
      pending.set(nextId, {
        resolve: (f) => (f.type === "success" ? res(f) : rej(new Refusal(`${method} error: ${JSON.stringify(f).slice(0, 300)}`))),
      });
      ws.send(JSON.stringify({ id: nextId, method, params }));
    });
    const waitEvent = (pred, ms = 15000, after = 0) => {
      const hit = events.find(({ at, frame }) => at > after && pred(frame));
      if (hit) return Promise.resolve(hit.frame);
      return Promise.race([
        new Promise((res) => waiters.push({ at: after, pred, resolve: res })),
        sleep(ms).then(() => null),
      ]);
    };
    const headerOf = (f) => (f && f.result && f.result.headers) || [];

    // ---- recipe (predicate order; every expression is the pinned one) ------
    await send("session.subscribe", { events: ["browsingContext.load", "browsingContext.userPromptOpened", "network.beforeRequestSent", "network.responseCompleted"] });
    note("subscribe", "4 events");

    const tree = await send("browsingContext.getTree", {});
    const context = tree.result && tree.result.contexts && tree.result.contexts[0] && tree.result.contexts[0].context;
    if (!context) throw new Refusal("no browsing context in getTree");
    note("getTree", { contexts: tree.result.contexts.length });

    await send("browsingContext.setViewport", { context, viewport: VIEWPORT, devicePixelRatio: 1 });
    note("setViewport", VIEWPORT);

    await send("network.addDataCollector", { dataTypes: ["response"], maxEncodedDataSize: 65536 });
    note("addDataCollector", "response");

    const aUrl = `${fx.base}/a.html`;
    const nav = await send("browsingContext.navigate", { context, url: aUrl, wait: "complete" });
    note("navigate /a.html", nav.result && nav.result.url);

    const load = await waitEvent((f) => f.method === "browsingContext.load" && f.params && f.params.url === aUrl);
    if (!load) throw new Refusal("no browsingContext.load for /a.html");

    const ready = await send("script.evaluate", { expression: "window.__ready", awaitPromise: true, target: { context } });
    note("window.__ready", ready.result && ready.result.result && ready.result.result.value);

    const innerWidth = await send("script.evaluate", { expression: "window.innerWidth", awaitPromise: false, target: { context } });
    note("window.innerWidth", innerWidth.result && innerWidth.result.result && innerWidth.result.result.value);

    const shot = await send("browsingContext.captureScreenshot", { context });
    note("captureScreenshot", { bytes: Buffer.from(String(shot.result.data || ""), "base64").length, sha256: sha256(Buffer.from(String(shot.result.data || ""), "base64")) });

    const locate = async (sel) => {
      const r = await send("browsingContext.locateNodes", { context, locator: { type: "css", value: sel } });
      const nodes = (r.result && r.result.nodes) || [];
      if (nodes.length !== 1 || !nodes[0].sharedId) throw new Refusal(`locateNodes ${sel} -> ${nodes.length} node(s)`);
      note(`locateNodes ${sel}`, { localName: nodes[0].value && nodes[0].value.localName });
      return nodes[0].sharedId;
    };
    await locate("#h");
    const tId = await locate("#t");
    const bId = await locate("#b");

    const click = (sharedId) => [{ type: "pointer", id: "mouse", parameters: { pointerType: "mouse" }, actions: [
      { type: "pointerMove", x: 0, y: 0, origin: { type: "element", element: { sharedId } } },
      { type: "pointerDown", button: 0 },
      { type: "pointerUp", button: 0 },
    ] }];
    await send("input.performActions", { context, actions: click(tId) });
    note("pointer click #t", "down/up");

    await send("input.performActions", { context, actions: [{ type: "key", id: "kbd", actions: [..."tabi"].flatMap((ch) => [{ type: "keyDown", value: ch }, { type: "keyUp", value: ch }]) }] });
    note("key actions", "tabi");

    const typed = await send("script.evaluate", { expression: "document.getElementById('t').value", awaitPromise: false, target: { context } });
    note("#t value", typed.result && typed.result.result && typed.result.result.value);

    await send("input.performActions", { context, actions: click(bId) });
    note("pointer click #b", "down/up");

    const out = await send("script.evaluate", { expression: "document.getElementById('out').textContent", awaitPromise: false, target: { context } });
    note("#out textContent", out.result && out.result.result && out.result.result.value);

    const fetched = await send("script.evaluate", { expression: "fetch('/data.txt').then(function(r){return r.text()})", awaitPromise: true, target: { context } });
    note("fetch /data.txt", fetched.result && fetched.result.result && String(fetched.result.result.value || "").trim());
    const dataDone = await waitEvent((f) => f.method === "network.responseCompleted" && f.params && f.params.response && /\/data\.txt$/.test(String(f.params.response.url)));
    if (!dataDone) throw new Refusal("no network.responseCompleted for /data.txt");
    const data = await send("network.getData", { dataType: "response", request: dataDone.params.request.request });
    const dataBytes = data.result && data.result.bytes ? (data.result.bytes.type === "base64" ? Buffer.from(data.result.bytes.value, "base64").toString("utf8") : data.result.bytes.value) : "";
    note("getData /data.txt", { bytes: dataBytes.length, matches: dataBytes === DATA_TEXT });
    if (dataBytes !== DATA_TEXT) throw new Refusal(`getData bytes ${JSON.stringify(dataBytes).slice(0, 80)} != fixture body`);

    const cookies = await send("storage.getCookies", {});
    note("storage.getCookies", ((cookies.result && cookies.result.cookies) || []).map((c) => `${c.name}=${c.value && c.value.value}`));

    const heldUrl = `${fx.base}/data.txt?held=1`;
    const ic = await send("network.addIntercept", { phases: ["beforeRequestSent"], urlPatterns: [{ type: "string", pattern: heldUrl }] });
    const interceptId = ic.result && ic.result.intercept;
    await send("script.evaluate", { expression: "window.__held=fetch('/data.txt?held=1').then(function(r){return r.text()}),1", awaitPromise: false, target: { context } });
    const blocked = await waitEvent((f) => f.method === "network.beforeRequestSent" && f.params && f.params.isBlocked === true && (f.params.intercepts || []).includes(interceptId) && /\/data\.txt(\?|$)/.test(String(f.params.request && f.params.request.url)));
    if (!blocked) throw new Refusal("held /data.txt?held=1 request was never blocked");
    note("blocked beforeRequestSent", { intercept: interceptId, url: blocked.params.request.url });
    await send("network.continueRequest", { request: blocked.params.request.request });
    note("continueRequest", blocked.params.request.request);
    const heldBody = await send("script.evaluate", { expression: "window.__held", awaitPromise: true, target: { context } });
    note("held body", heldBody.result && heldBody.result.result && String(heldBody.result.result.value || "").trim());

    const bUrl = `${fx.base}/b.html`;
    await send("browsingContext.navigate", { context, url: bUrl, wait: "complete" });
    note("navigate /b.html", bUrl);
    await send("browsingContext.traverseHistory", { context, delta: -1 });
    note("traverseHistory", -1);
    const traversedAt = lines.length;
    const backLoad = await waitEvent((f) => f.method === "browsingContext.load" && f.params && f.params.url === aUrl, 10000, traversedAt);
    note("post-traverse load", backLoad ? backLoad.params.url : null);
    let pathname = null;
    for (let k = 0; k < 30; k += 1) {
      // The realm is replaced by the traversal; an evaluate can transiently
      // answer "Cannot find context with specified id". Record it and retry.
      try {
        const p = await send("script.evaluate", { expression: "location.pathname", awaitPromise: false, target: { context } });
        pathname = p.result && p.result.result && p.result.result.value;
        if (pathname === "/a.html") break;
      } catch (e) {
        note("pathname poll retry", String(e.message).slice(0, 80));
      }
      await sleep(100);
    }
    note("location.pathname", pathname);
    if (pathname !== "/a.html") throw new Refusal(`pathname after traverse is ${pathname}, not /a.html`);

    await send("script.evaluate", { expression: "setTimeout(function(){alert('tabi-alert')},0),1", awaitPromise: false, target: { context } });
    const prompt = await waitEvent((f) => f.method === "browsingContext.userPromptOpened" && f.params && f.params.message === "tabi-alert");
    if (!prompt) throw new Refusal("no userPromptOpened tabi-alert");
    note("userPromptOpened", prompt.params.message);
    await send("browsingContext.handleUserPrompt", { context: prompt.params.context, accept: true });
    note("handleUserPrompt", "accept");

    void headerOf;
    return { transcriptPath, observed, caps };
  } finally {
    clearTimeout(deadline);
    try { ws && ws.close(); } catch {}
    if (sessionId) { try { await fetch(`http://127.0.0.1:${port}/session/${sessionId}`, { method: "DELETE" }); } catch {} }
    try { cd.kill("SIGTERM"); } catch {}
    await sleep(500);
    try { process.kill(-cd.pid, "SIGKILL"); } catch {}
    await fx.close();
    rmSync(profile, { recursive: true, force: true });
    writeFileSync(transcriptPath, lines.map((l) => JSON.stringify(l)).join("\n") + "\n");
  }
}

async function main() {
  const outRel = argValue("--out", "corpus/evidence/round-32/bidi");
  const outDir = resolve(ROOT, outRel);
  const chromedriver = argValue("--chromedriver", "chromedriver");
  const chromium = argValue("--chromium", "/usr/bin/chromium");
  if (!process.env.TMPDIR) throw new Refusal("TMPDIR must name a short scratch directory (chromium singleton socket path limit)");
  if (Array.from(outRel).some((c) => c.charCodeAt(0) > 126)) throw new Refusal("refusing non-ASCII output path");
  const driverSha256 = sha256(readFileSync(SCRIPT_PATH));
  const runs = [];
  for (const name of ["run1", "run2"]) {
    const r = await runOnce({ name, outDir, scratchRoot: process.env.TMPDIR, chromedriver, chromium });
    const transcript = relative(ROOT, r.transcriptPath).split("\\").join("/");
    runs.push({ name, transcript, transcriptSha256: sha256(readFileSync(r.transcriptPath)), observed: r.observed, caps: r.caps });
    console.error(`${name}: ${r.transcriptPath}`);
  }
  const versions = new Set(runs.map((r) => r.caps.browserVersion));
  if (versions.size !== 1) throw new Refusal(`browserVersion differs between runs: ${[...versions].join(", ")}`);
  const driverVersions = new Set(runs.map((r) => r.caps.chrome && r.caps.chrome.chromedriverVersion));
  if (driverVersions.size !== 1) throw new Refusal(`chromedriverVersion differs between runs: ${[...driverVersions].join(", ")}`);
  const receipt = {
    schema: SCHEMA,
    fixtureSha256: FIXTURE_SHA256,
    browserVersion: runs[0].caps.browserVersion,
    chromedriverVersion: runs[0].caps.chrome.chromedriverVersion,
    driver: DRIVER_REL,
    driverSha256,
    runs: runs.map(({ name, transcript, transcriptSha256, observed }) => ({ name, transcript, transcriptSha256, observed })),
    host: {
      uname: spawnSync("uname", ["-a"], { encoding: "utf8" }).stdout.trim(),
      chromium: versionLine(chromium),
      chromedriver: versionLine(chromedriver),
    },
    ranAtUtc: new Date().toISOString(),
  };
  writeFileSync(join(outDir, "receipt.json"), `${JSON.stringify(receipt, null, 1)}\n`);
  console.error(`receipt: ${join(outDir, "receipt.json")}`);
}

main().catch((e) => {
  console.error(`${e instanceof Refusal ? "refusal" : "error"}: ${e && e.message ? e.message : e}`);
  process.exit(e instanceof Refusal ? 2 : 1);
});
