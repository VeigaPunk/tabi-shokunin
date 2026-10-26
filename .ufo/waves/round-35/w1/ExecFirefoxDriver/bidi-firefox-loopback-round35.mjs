#!/usr/bin/env node
// scripts/bidi-firefox-loopback-round35.mjs — tabi lane round 35 (claim C2).
//
// An independent WebDriver BiDi client over geckodriver's classic /session
// bootstrap (webSocketUrl: true) on Firefox. It drives the gate's frozen
// FIXTURE on 127.0.0.1 only, records every frame in the gate's transcript
// format (one `http-res /session` line, then `send`/`recv` in wire order), and
// writes a `tabi-bidi-receipt-v1` receipt over two cold runs (fresh
// geckodriver and fresh profile each).
//
// This file imports ONLY FIXTURE_SHA256, VIEWPORT and serveFixture from
// scripts/check-bidi-runtime.mjs (the gate). It does not import or copy the
// gate's liveRecord or PREDICATES, nor anything from the round-35 C2 counter
// (.ufo/waves/round-35/counters/c2-firefox-bidi.mjs): it is a client, not the
// counter. The recipe order is the gate's liveRecord order, on purpose — the
// counter's binding compares this driver's first screenshot with the first
// screenshot of a session the counter itself starts.
//
// BiDi surface: the WebSocket is geckodriver's own BiDi port (`--websocket-port`;
// geckodriver's default is 9222, which is why every launch here pins a free
// port instead — the operator's CDP lease owns 127.0.0.1:9222 and is never
// touched). Firefox does not speak BiDi on its own: geckodriver brokers the
// session and the socket.
//
// Write scope: its own --out directory (the two transcripts and the receipt)
// and a throwaway Firefox profile plus HOME/XDG dirs under TMPDIR. It never
// writes the lane tree, never reads credentials, never navigates off loopback.
//
// Usage:
//   TMPDIR=<scratch> node scripts/bidi-firefox-loopback-round35.mjs \
//     --out corpus/evidence/round-35/bidi-firefox \
//     [--geckodriver /home/vgpnk/.local/bin/geckodriver] \
//     [--firefox /home/vgpnk/.local/opt/firefox-158.0.1/firefox]
//
// Exit: 0 two runs recorded and receipt written; 1 a run failed; 2 usage/refusal.
//
// Limits: two headless cold runs on one host build (Firefox 158.0.1 through
// geckodriver 0.37.1) against one loopback fixture. A transcript is a record of
// what this client sent and received; it is not a proof of execution to a third
// party, and nothing here generalises to another Firefox or geckodriver build,
// to headed mode, or to a non-loopback origin. The receipt's binding value is
// its first screenshot, which the counter re-derives from its own session.
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { FIXTURE_SHA256, VIEWPORT, serveFixture } from "./check-bidi-runtime.mjs";

const SCHEMA = "tabi-bidi-receipt-v1";
const SCRIPT_PATH = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(SCRIPT_PATH), "..");
const DRIVER_REL = relative(ROOT, SCRIPT_PATH).split("\\").join("/");
const DATA_TEXT = "tabi-bidi-body-0123456789\n"; // asserted locally; a predicate re-checks it from the transcript
const RUN_TIMEOUT_MS = 120000;
const SESSION_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const DEFAULT_FIREFOX = "/home/vgpnk/.local/opt/firefox-158.0.1/firefox";
const DEFAULT_GECKODRIVER = "/home/vgpnk/.local/bin/geckodriver";

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class Refusal extends Error {
  constructor(message) {
    super(message);
    this.name = "Refusal";
  }
}

function freePort() {
  return new Promise((res, rej) => {
    const s = createServer();
    s.on("error", rej);
    s.listen(0, "127.0.0.1", () => {
      const p = s.address().port;
      s.close(() => res(p));
    });
  });
}

function argValue(name, fallback) {
  const i = process.argv.indexOf(name);
  return i > 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

function versionLine(bin) {
  const r = spawnSync(bin, ["--version"], { encoding: "utf8" });
  const text = (r.stdout || r.stderr || "").trim().replace(/\s+/g, " ");
  return text.split("\n")[0] || `unavailable (exit ${r.status})`;
}

// One cold run: a fresh geckodriver, a fresh profile root and a fresh HOME/TMPDIR,
// one BiDi session, the recipe in the gate's liveRecord order, every frame recorded.
async function runOnce({ name, outDir, scratchBase, geckodriver, firefox }) {
  if (!scratchBase) throw new Refusal("TMPDIR must name a scratch directory for the profile, HOME and XDG dirs");
  const runDir = mkdtempSync(join(scratchBase, "fx-"));
  const home = join(runDir, "home");
  const tmp = join(runDir, "tmp");
  const profiles = join(runDir, "profiles");
  for (const d of [home, tmp, profiles, join(home, ".config"), join(home, ".cache"), join(home, ".local", "share"), join(home, ".local", "state")]) {
    mkdirSync(d, { recursive: true });
  }
  const transcriptPath = join(outDir, `${name}.jsonl`);
  const lines = [];
  const append = (dir, extra) => {
    lines.push({ seq: lines.length + 1, dir, ...extra });
    return lines.length;
  };
  const observed = [];
  const note = (step, value) => observed.push({ step, value });
  const fixture = await serveFixture();
  const port = await freePort();
  const wsPort = await freePort();
  if (port === 9222 || wsPort === 9222) throw new Refusal("refusing the 9222 CDP lease port");
  const env = {
    PATH: process.env.PATH,
    HOME: home,
    TMPDIR: tmp,
    TMP: tmp,
    TEMP: tmp,
    XDG_CONFIG_HOME: join(home, ".config"),
    XDG_CACHE_HOME: join(home, ".cache"),
    XDG_DATA_HOME: join(home, ".local", "share"),
    XDG_STATE_HOME: join(home, ".local", "state"),
    XDG_RUNTIME_DIR: join(runDir, "runtime"),
    MOZ_HEADLESS: "1",
    LC_ALL: "C.UTF-8",
  };
  mkdirSync(env.XDG_RUNTIME_DIR, { recursive: true });
  const gd = spawn(geckodriver, ["--port", String(port), "--websocket-port", String(wsPort), "--binary", firefox, "--profile-root", profiles], {
    stdio: "ignore",
    detached: true,
    env,
  });
  let ws = null;
  let sessionId = null;
  let caps = null;
  const deadline = setTimeout(() => {
    try { ws && ws.close(); } catch {}
  }, RUN_TIMEOUT_MS);
  try {
    const payload = {
      capabilities: {
        alwaysMatch: {
          browserName: "firefox",
          webSocketUrl: true,
          unhandledPromptBehavior: "ignore",
          "moz:firefoxOptions": { args: ["-headless"] },
        },
      },
    };
    let body = null;
    for (let k = 0; k < 100 && !body; k += 1) {
      try {
        const r = await fetch(`http://127.0.0.1:${port}/session`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
        body = await r.json();
      } catch {
        await sleep(200);
      }
    }
    if (!body || !body.value || !body.value.capabilities) {
      throw new Refusal(`new session failed: ${JSON.stringify((body && body.value && body.value.message) || body).slice(0, 300)}`);
    }
    append("http-res", { path: "/session", body });
    sessionId = body.value.sessionId;
    caps = body.value.capabilities;
    note("session", {
      sessionId: SESSION_UUID.test(String(sessionId)) ? "uuid" : `unexpected shape ${String(sessionId).slice(0, 40)}`,
      browserVersion: caps.browserVersion,
      geckodriverVersion: caps["moz:geckodriverVersion"],
      webSocketUrl: caps.webSocketUrl,
    });
    if (!SESSION_UUID.test(String(sessionId))) throw new Refusal(`sessionId is not geckodriver-shaped: ${sessionId}`);
    const wsUrl = String(caps.webSocketUrl || "");
    if (!/^ws:\/\/(127\.0\.0\.1|localhost):\d+\/session\//.test(wsUrl)) throw new Refusal(`webSocketUrl is not loopback: ${wsUrl}`);
    if (!wsUrl.endsWith(`/session/${sessionId}`)) throw new Refusal(`webSocketUrl session segment does not carry the sessionId: ${wsUrl}`);
    if (typeof caps.browserVersion !== "string" || !caps.browserVersion) throw new Refusal("no browserVersion capability");
    if (typeof caps["moz:geckodriverVersion"] !== "string" || !caps["moz:geckodriverVersion"]) throw new Refusal("no moz:geckodriverVersion capability");

    ws = new WebSocket(wsUrl);
    await new Promise((res, rej) => {
      ws.onopen = res;
      ws.onerror = () => rej(new Refusal("websocket open failed"));
    });
    const pending = new Map();
    const waiters = [];
    const events = [];
    let nextId = 0;
    ws.onmessage = (m) => {
      const frame = JSON.parse(String(m.data));
      append("recv", { frame });
      if (frame.id !== undefined && pending.has(frame.id)) {
        const p = pending.get(frame.id);
        pending.delete(frame.id);
        p.resolve(frame);
      } else if (frame.method) {
        events.push({ at: lines.length, frame });
        for (const w of [...waiters]) {
          if (w.at < lines.length && w.pred(frame)) {
            waiters.splice(waiters.indexOf(w), 1);
            w.resolve(frame);
          }
        }
      }
    };
    const send = (method, params = {}) => new Promise((res, rej) => {
      nextId += 1;
      append("send", { frame: { id: nextId, method, params } });
      pending.set(nextId, {
        resolve: (f) => (f.type === "success" ? res(f) : rej(new Refusal(`${method} error: ${JSON.stringify(f).slice(0, 300)}`))),
      });
      ws.send(JSON.stringify({ id: nextId, method, params }));
    });
    const sendSoft = async (method, params = {}) => {
      try {
        return await send(method, params);
      } catch (e) {
        note(`${method} failed`, String(e.message).slice(0, 160));
        return null;
      }
    };
    const waitEvent = (pred, ms = 15000, after = 0) => {
      const hit = events.find(({ at, frame }) => at > after && pred(frame));
      if (hit) return Promise.resolve(hit.frame);
      return Promise.race([new Promise((res) => waiters.push({ at: after, pred, resolve: res })), sleep(ms).then(() => null)]);
    };

    // ---- recipe (gate liveRecord order; every expression is the pinned one) --
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

    const aUrl = `${fixture.base}/a.html`;
    const nav = await send("browsingContext.navigate", { context, url: aUrl, wait: "complete" });
    note("navigate /a.html", nav.result && nav.result.url);

    const load = await waitEvent((f) => f.method === "browsingContext.load" && f.params && f.params.url === aUrl);
    if (!load) throw new Refusal("no browsingContext.load for /a.html");

    const ready = await send("script.evaluate", { expression: "window.__ready", awaitPromise: true, target: { context } });
    note("window.__ready", ready.result && ready.result.result && ready.result.result.value);

    const innerWidth = await send("script.evaluate", { expression: "window.innerWidth", awaitPromise: false, target: { context } });
    note("window.innerWidth", innerWidth.result && innerWidth.result.result && innerWidth.result.result.value);

    // First screenshot: the binding artefact. It must be taken at this point and
    // nowhere earlier, or the counter's own first screenshot cannot match it.
    const shot = await send("browsingContext.captureScreenshot", { context });
    const shotBytes = Buffer.from(String(shot.result.data || ""), "base64");
    note("captureScreenshot", { bytes: shotBytes.length, sha256: sha256(shotBytes) });
    if (shotBytes.toString("hex", 0, 8) !== "89504e470d0a1a0a") throw new Refusal("first screenshot is not a PNG");
    if (shotBytes.readUInt32BE(16) !== VIEWPORT.width || shotBytes.readUInt32BE(20) !== VIEWPORT.height) {
      throw new Refusal(`first screenshot is ${shotBytes.readUInt32BE(16)}x${shotBytes.readUInt32BE(20)}, not the pinned viewport`);
    }

    const locate = async (sel) => {
      const r = await send("browsingContext.locateNodes", { context, locator: { type: "css", value: sel } });
      const nodes = (r.result && r.result.nodes) || [];
      if (nodes.length !== 1 || !nodes[0].sharedId) throw new Refusal(`locateNodes ${sel} -> ${nodes.length} node(s)`);
      note(`locateNodes ${sel}`, { localName: nodes[0].value && nodes[0].value.localName });
      return nodes[0].sharedId;
    };
    await locate("#h");
    const fieldId = await locate("#t");
    const buttonId = await locate("#b");

    const click = (sharedId) => [{ type: "pointer", id: "mouse", parameters: { pointerType: "mouse" }, actions: [
      { type: "pointerMove", x: 0, y: 0, origin: { type: "element", element: { sharedId } } },
      { type: "pointerDown", button: 0 },
      { type: "pointerUp", button: 0 },
    ] }];
    await send("input.performActions", { context, actions: click(fieldId) });
    note("pointer click #t", "down/up");

    await send("input.performActions", { context, actions: [{ type: "key", id: "kbd", actions: [..."tabi"].flatMap((ch) => [{ type: "keyDown", value: ch }, { type: "keyUp", value: ch }]) }] });
    note("key actions", "tabi");

    const typed = await send("script.evaluate", { expression: "document.getElementById('t').value", awaitPromise: false, target: { context } });
    note("#t value", typed.result && typed.result.result && typed.result.result.value);

    await send("input.performActions", { context, actions: click(buttonId) });
    note("pointer click #b", "down/up");

    const out = await send("script.evaluate", { expression: "document.getElementById('out').textContent", awaitPromise: false, target: { context } });
    note("#out textContent", out.result && out.result.result && out.result.result.value);

    const fetched = await send("script.evaluate", { expression: "fetch('/data.txt').then(function(r){return r.text()})", awaitPromise: true, target: { context } });
    note("fetch /data.txt", fetched.result && fetched.result.result && String(fetched.result.result.value || "").trim());
    const dataDone = await waitEvent((f) => f.method === "network.responseCompleted" && f.params && f.params.response && /\/data\.txt$/.test(String(f.params.response.url)));
    if (!dataDone) throw new Refusal("no network.responseCompleted for /data.txt");
    const data = await send("network.getData", { dataType: "response", request: dataDone.params.request.request });
    const dataBytes = data.result && data.result.bytes
      ? (data.result.bytes.type === "base64" ? Buffer.from(data.result.bytes.value, "base64").toString("utf8") : data.result.bytes.value)
      : "";
    note("getData /data.txt", { bytes: dataBytes.length, matches: dataBytes === DATA_TEXT });
    if (dataBytes !== DATA_TEXT) throw new Refusal(`getData bytes ${JSON.stringify(dataBytes).slice(0, 80)} != fixture body`);

    const cookies = await send("storage.getCookies", {});
    note("storage.getCookies", ((cookies.result && cookies.result.cookies) || []).map((c) => `${c.name}=${c.value && c.value.value}`));

    const heldUrl = `${fixture.base}/data.txt?held=1`;
    const intercept = await send("network.addIntercept", { phases: ["beforeRequestSent"], urlPatterns: [{ type: "string", pattern: heldUrl }] });
    const interceptId = intercept.result && intercept.result.intercept;
    await send("script.evaluate", { expression: "window.__held=fetch('/data.txt?held=1').then(function(r){return r.text()}),1", awaitPromise: false, target: { context } });
    const blocked = await waitEvent((f) => f.method === "network.beforeRequestSent" && f.params && f.params.isBlocked === true
      && (f.params.intercepts || []).includes(interceptId) && /\/data\.txt(\?|$)/.test(String(f.params.request && f.params.request.url)));
    if (!blocked) throw new Refusal("held /data.txt?held=1 request was never blocked");
    note("blocked beforeRequestSent", { intercept: interceptId, url: blocked.params.request.url });
    await send("network.continueRequest", { request: blocked.params.request.request });
    note("continueRequest", blocked.params.request.request);
    const heldBody = await send("script.evaluate", { expression: "window.__held", awaitPromise: true, target: { context } });
    note("held body", heldBody.result && heldBody.result.result && String(heldBody.result.result.value || "").trim());

    const bUrl = `${fixture.base}/b.html`;
    await send("browsingContext.navigate", { context, url: bUrl, wait: "complete" });
    note("navigate /b.html", bUrl);
    const testedAt = lines.length;
    await send("browsingContext.traverseHistory", { context, delta: -1 });
    note("traverseHistory", -1);
    const backLoad = await waitEvent((f) => f.method === "browsingContext.load" && f.params && f.params.url === aUrl, 10000, testedAt);
    note("post-traverse load", backLoad ? backLoad.params.url : null);
    let pathname = null;
    for (let k = 0; k < 60; k += 1) {
      // The traversal replaces the realm, and Firefox answers a read taken in the
      // gap with an error; each attempt is recorded, and only a successful read counts.
      const p = await sendSoft("script.evaluate", { expression: "location.pathname", awaitPromise: false, target: { context } });
      pathname = p && p.result && p.result.result && p.result.result.value;
      if (pathname === "/a.html") break;
      await sleep(150);
    }
    note("location.pathname", pathname);
    if (pathname !== "/a.html") throw new Refusal(`pathname after traverse is ${pathname}, not /a.html`);

    // Re-arm the page for the prompt: a user prompt opened during the navigation
    // would block later commands, so this runs only after the traverse settled.
    await send("script.evaluate", { expression: "setTimeout(function(){alert('tabi-alert')},0),1", awaitPromise: false, target: { context } });
    const prompt = await waitEvent((f) => f.method === "browsingContext.userPromptOpened" && f.params && f.params.message === "tabi-alert");
    if (!prompt) throw new Refusal("no userPromptOpened tabi-alert");
    note("userPromptOpened", prompt.params.message);
    await send("browsingContext.handleUserPrompt", { context: prompt.params.context, accept: true });
    note("handleUserPrompt", "accept");

    return { transcriptPath, observed, caps };
  } finally {
    clearTimeout(deadline);
    try { ws && ws.close(); } catch {}
    if (sessionId) {
      try {
        await fetch(`http://127.0.0.1:${port}/session/${sessionId}`, { method: "DELETE" });
      } catch {}
    }
    try { process.kill(-gd.pid, "SIGTERM"); } catch {}
    await sleep(700);
    try { process.kill(-gd.pid, "SIGKILL"); } catch {}
    await fixture.close();
    writeFileSync(transcriptPath, lines.map((l) => JSON.stringify(l)).join("\n") + "\n");
    rmSync(runDir, { recursive: true, force: true });
  }
}

async function main() {
  const outRel = argValue("--out", "corpus/evidence/round-35/bidi-firefox");
  const geckodriver = argValue("--geckodriver", DEFAULT_GECKODRIVER);
  const firefox = argValue("--firefox", DEFAULT_FIREFOX);
  if (Array.from(outRel).some((c) => c.charCodeAt(0) > 126)) throw new Refusal("refusing a non-ASCII output path");
  for (const bin of [geckodriver, firefox]) {
    const r = spawnSync(bin, ["--version"], { encoding: "utf8" });
    if (r.status !== 0) throw new Refusal(`not runnable: ${bin}`);
  }
  const scratchBase = process.env.TMPDIR;
  if (!scratchBase) throw new Refusal("TMPDIR must name the scratch directory that holds the profile, HOME and XDG dirs");
  const outDir = resolve(ROOT, outRel);
  mkdirSync(outDir, { recursive: true });
  const driverSha256 = sha256(readFileSync(SCRIPT_PATH));
  const runs = [];
  for (const name of ["run1", "run2"]) {
    const r = await runOnce({ name, outDir, scratchBase, geckodriver, firefox });
    const transcript = relative(ROOT, join(outDir, `${name}.jsonl`)).split("\\").join("/");
    runs.push({ name, transcript, transcriptSha256: sha256(readFileSync(join(outDir, `${name}.jsonl`))), observed: r.observed, caps: r.caps });
    console.error(`${name}: ${join(outDir, `${name}.jsonl`)}`);
  }
  const browserVersions = new Set(runs.map((r) => r.caps.browserVersion));
  if (browserVersions.size !== 1) throw new Refusal(`browserVersion differs between runs: ${[...browserVersions].join(", ")}`);
  const driverVersions = new Set(runs.map((r) => r.caps["moz:geckodriverVersion"]));
  if (driverVersions.size !== 1) throw new Refusal(`moz:geckodriverVersion differs between runs: ${[...driverVersions].join(", ")}`);
  const shots = new Set(runs.map((r) => (r.observed.find((o) => o.step === "captureScreenshot") || {}).value.sha256));
  if (shots.size !== 1) throw new Refusal(`first screenshots differ between runs: ${[...shots].join(", ")}`);
  const receipt = {
    schema: SCHEMA,
    fixtureSha256: FIXTURE_SHA256,
    browserVersion: runs[0].caps.browserVersion,
    browserName: runs[0].caps.browserName,
    geckodriverVersion: runs[0].caps["moz:geckodriverVersion"],
    driver: DRIVER_REL,
    driverSha256,
    runs: runs.map(({ name, transcript, transcriptSha256, observed }) => ({ name, transcript, transcriptSha256, observed })),
    firstScreenshotSha256: [...shots][0],
    binaries: {
      geckodriver,
      geckodriverVersionLine: versionLine(geckodriver),
      firefox,
      firefoxVersionLine: versionLine(firefox),
    },
  };
  writeFileSync(join(outDir, "receipt.json"), `${JSON.stringify(receipt, null, 1)}\n`);
  console.error(`receipt: ${join(outDir, "receipt.json")}`);
  return 0;
}

main().then(
  (code) => process.exit(code),
  (e) => {
    if (e instanceof Refusal) {
      console.error(`bidi-firefox-loopback-round35: refusal: ${e.message}`);
      process.exit(2);
    }
    console.error(`bidi-firefox-loopback-round35: run failed: ${(e && e.stack) || e}`);
    process.exit(1);
  },
);
