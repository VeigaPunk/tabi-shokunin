#!/usr/bin/env node
// check-bidi-runtime.mjs — tabi lane gate: coverage (WebDriver BiDi surfaces
// observed at runtime on this host, loopback only).
//
// Verdict: 0 clean (population >= 1 matrix rows marked measured and every one
//          admitted); 1 failed (entry absent, no new mined source row, or one
//          or more rows not admitted); 2 could-not-evaluate (usage,
//          unresolvable revision, registry absent, --live without chromedriver
//          or chromium). Any other nonzero code is undeclared and reads as
//          could-not-evaluate.
// Self-test: `--selftest` (isolated cases over temporary sandbox repositories
//          under TMPDIR with synthetic transcripts; the live leg is exercised
//          through an injected runner, never a browser; creates and removes
//          its own trees).
// Frozen by: .ufo/waves/round-32/claims.json claim C1 (counter sha256
//          recorded there before any claim data).
// Pinned values: FIXTURE, ROWS and the predicates in this file; the round's
//          receipt at --receipt (default corpus/evidence/round-32/bidi/receipt.json).
// Write scope: stdout/stderr only. Production reads committed git blobs
//          (git show <rev>:<path>). With --live it starts chromedriver and a
//          headless chromium with a throwaway profile under TMPDIR, serves
//          FIXTURE on 127.0.0.1 only, never navigates off loopback, and
//          removes the profile; never writes the lane, never reads
//          credentials or session material.
// Owner: tabi L1.
//
// What it decides
// ---------------
// Population: the data rows of the first Markdown table in --entry whose
// header cells are exactly `Row | Surface | BiDi method | Measured | Evidence`
// (case-insensitive) and whose Measured cell is `yes`. Row ids R1..R17 are the
// seventeen rows of corpus/knowledge/webdriver-bidi-capability-matrix.md §2 in
// order (ROWS). Entry-level checks (fail the whole population):
//   e1-entry-absent   --entry is not committed at --rev.
//   s1-source-row     the entry's `source:` line cites no S-id whose registry
//                     row (0-3 leading spaces, 11 cells) is `mined`, names the
//                     entry in used-by, and is absent at --baseline (opened
//                     after the baseline, i.e. this round).
// Per row, first failing check by stable id:
//   x1-row-unknown    the id is not one of R1..R17.
//   x2-no-counterpart the matrix row has no BiDi command (R16, stop-loading).
//   t1-receipt        the receipt is absent or malformed, its fixtureSha256 is
//                     not FIXTURE's, its `driver` script blob is absent or its
//                     sha256 is not `driverSha256`, it lists fewer than two
//                     runs, or a run's transcript blob is absent or its sha256
//                     differs.
//   t3-binding        the runs are not bound to a real rendering: each run's
//                     FIRST captureScreenshot (taken after setViewport 640x480,
//                     navigate /a.html complete and window.__ready settled,
//                     before any input action) must decode to the same bytes
//                     in every run and carry a chromedriverVersion; with
//                     --live those bytes and that version must equal this
//                     counter's own session's (headless rendering of FIXTURE
//                     is byte-deterministic on one host build). A transcript
//                     synthesised without a browser fails here.
//   t2-run            the row predicate fails on a committed run transcript.
//   l1-live           only with --live: the same predicate fails on this
//                     counter's own BiDi session against FIXTURE (independent
//                     client; browserVersion must equal the receipt's).
//
// Transcript (JSONL, one object per line): {"seq":n,"dir":"http-res",
// "path":"/session","body":<classic new-session response>} once, then
// {"seq":n,"dir":"send","frame":{id,method,params}} and
// {"seq":n,"dir":"recv","frame":<response or event>} in wire order.
//
// Counted fields: population, admitted, failing.
//
// Usage:
//   node scripts/check-bidi-runtime.mjs --rev <REV> --baseline <REV> --entry <path>
//        [--receipt PATH] [--live] [--json]
//   node scripts/check-bidi-runtime.mjs --selftest [--json]
//   node scripts/check-bidi-runtime.mjs --repo <dir> ...   (tests)
import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import { createServer } from "node:http";
import { createServer as createNetServer } from "node:net";

const SCHEMA = "tabi-bidi-runtime-v1";
const SELFTEST_SCHEMA = "tabi-bidi-runtime-selftest-v1";
const RECEIPT_SCHEMA = "tabi-bidi-receipt-v1";
const SOURCES_PATH = "corpus/SOURCES.md";
const DEFAULT_RECEIPT = "corpus/evidence/round-32/bidi/receipt.json";
const LANE = join(dirname(fileURLToPath(import.meta.url)), "..");
const HEADER = ["row", "surface", "bidi method", "measured", "evidence"];

class Refusal extends Error {
  constructor(message) {
    super(message);
    this.name = "Refusal";
  }
}

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

// ---- fixture (frozen) -------------------------------------------------------

export const DATA_TEXT = "tabi-bidi-body-0123456789\n";
export const FIXTURE = {
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
export const FIXTURE_SHA256 = sha256(JSON.stringify(Object.keys(FIXTURE).sort().map((k) => [k, FIXTURE[k].type, FIXTURE[k].body])));
export const FIXTURE_HEADER = ["x-tabi-fixture", "r32"];
export const VIEWPORT = { width: 640, height: 480 };

// Serves FIXTURE on 127.0.0.1 (ephemeral port); query strings are ignored for
// lookup. Every response carries FIXTURE_HEADER and `cache-control: no-store`.
export function serveFixture() {
  return new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      const path = (req.url || "/").split("?")[0];
      const f = FIXTURE[path];
      if (!f) { res.writeHead(404, { "content-type": "text/plain", [FIXTURE_HEADER[0]]: FIXTURE_HEADER[1] }); res.end("not found\n"); return; }
      res.writeHead(200, { "content-type": f.type, "cache-control": "no-store", [FIXTURE_HEADER[0]]: FIXTURE_HEADER[1] });
      res.end(f.body);
    });
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => resolve({ server, base: `http://127.0.0.1:${server.address().port}`, close: () => new Promise((r) => server.close(() => r())) }));
  });
}

// ---- rows (matrix §2 order) -------------------------------------------------

export const ROWS = {
  R1: "Browser identity at launch", R2: "Target inventory", R3: "Navigate", R4: "Screenshot",
  R5: "DOM shape/state", R6: "Wait predicates / volatile readouts", R7: "Viewport pin", R8: "Click input",
  R9: "Text fill", R10: "Network client events", R11: "Wire truth (raw status/headers)", R12: "Byte truth",
  R13: "Pre-settle hold", R14: "Navigation history witness", R15: "Cookies", R16: "Stop loading / nav-cancel",
  R17: "User prompts / dialogs",
};

// ---- record + predicates ----------------------------------------------------

// A record is { newSession, cmds:[{i, method, params, response}], events:[{i, method, params}] }
// with i the wire position (seq order).
export function recordFromTranscript(text) {
  const rec = { newSession: null, cmds: [], events: [] };
  const byId = new Map();
  let pos = 0;
  for (const raw of String(text).split("\n")) {
    if (!raw.trim()) continue;
    let o;
    try { o = JSON.parse(raw); } catch { throw new Refusal("transcript line is not JSON"); }
    pos += 1;
    if (o.dir === "http-res" && o.path === "/session" && rec.newSession === null) rec.newSession = o.body;
    else if (o.dir === "send" && o.frame && typeof o.frame.method === "string") {
      const c = { i: pos, id: o.frame.id, method: o.frame.method, params: o.frame.params || {}, response: null };
      rec.cmds.push(c);
      byId.set(o.frame.id, c);
    } else if (o.dir === "recv" && o.frame) {
      const f = o.frame;
      if (f.type === "event" || (f.method && f.id === undefined)) rec.events.push({ i: pos, method: f.method, params: f.params || {} });
      else if (f.id !== undefined && byId.has(f.id) && byId.get(f.id).response === null) byId.get(f.id).response = f;
    }
  }
  return rec;
}

const ok = (c) => c && c.response && c.response.type === "success";
const res = (c) => (c && c.response && c.response.result) || {};
const strVal = (rv) => (rv && rv.type === "string" ? rv.value : undefined);

function navBase(rec) {
  for (const c of rec.cmds) {
    if (c.method !== "browsingContext.navigate" || !ok(c)) continue;
    let u;
    try { u = new URL(c.params.url); } catch { continue; }
    if (u.pathname === "/a.html" && u.protocol === "http:" && (u.hostname === "127.0.0.1" || u.hostname === "localhost")) return u.origin;
  }
  return null;
}

function evalCmds(rec, expr) {
  return rec.cmds.filter((c) => (c.method === "script.evaluate" && c.params.expression === expr) && ok(c) && res(c).type === "success");
}

function headerValue(headers, name) {
  for (const h of headers || []) if (String(h.name).toLowerCase() === name) return strVal(h.value) ?? (typeof h.value === "string" ? h.value : undefined);
  return undefined;
}

function decodeBytes(bv) {
  if (!bv) return undefined;
  if (bv.type === "string") return bv.value;
  if (bv.type === "base64") return Buffer.from(bv.value, "base64").toString("utf8");
  return undefined;
}

function pngSize(b64) {
  const b = Buffer.from(String(b64 || ""), "base64");
  if (b.length < 24 || b.toString("hex", 0, 8) !== "89504e470d0a1a0a" || b.toString("ascii", 12, 16) !== "IHDR") return null;
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
}

// Each predicate returns null (holds) or a short reason string.
export const PREDICATES = {
  R1: (rec, ctx) => {
    const caps = rec.newSession && rec.newSession.value && rec.newSession.value.capabilities;
    if (!caps) return "no classic new-session response";
    if (!caps.browserName) return "no browserName";
    if (caps.browserVersion !== ctx.browserVersion) return `browserVersion ${caps.browserVersion} != ${ctx.browserVersion}`;
    if (!/^ws:\/\/(127\.0\.0\.1|localhost):\d+\//.test(String(caps.webSocketUrl || ""))) return "webSocketUrl not a loopback ws url";
    if (!rec.cmds.some(ok)) return "no successful BiDi command on the socket";
    return null;
  },
  R2: (rec) => (rec.cmds.some((c) => c.method === "browsingContext.getTree" && ok(c) && Array.isArray(res(c).contexts) && res(c).contexts.length >= 1 && res(c).contexts.every((x) => typeof x.context === "string")) ? null : "no getTree with contexts"),
  R3: (rec) => {
    const base = navBase(rec);
    if (!base) return "no successful loopback navigate to /a.html";
    const url = `${base}/a.html`;
    if (!rec.cmds.some((c) => c.method === "browsingContext.navigate" && ok(c) && c.params.url === url && res(c).url === url)) return "navigate result url mismatch";
    if (!rec.events.some((e) => e.method === "browsingContext.load" && e.params.url === url)) return "no browsingContext.load for /a.html";
    return null;
  },
  R4: (rec) => {
    const shots = rec.cmds.filter((c) => c.method === "browsingContext.captureScreenshot" && ok(c));
    if (!shots.length) return "no captureScreenshot";
    return shots.some((c) => { const s = pngSize(res(c).data); return s && s.width === VIEWPORT.width && s.height === VIEWPORT.height; }) ? null : "screenshot is not a PNG of the pinned viewport";
  },
  R5: (rec) => (rec.cmds.some((c) => c.method === "browsingContext.locateNodes" && ok(c) && c.params.locator && c.params.locator.type === "css" && c.params.locator.value === "#h"
    && Array.isArray(res(c).nodes) && res(c).nodes.length === 1 && res(c).nodes[0].value && res(c).nodes[0].value.localName === "h1") ? null : "no locateNodes #h -> one h1"),
  R6: (rec) => (rec.cmds.some((c) => c.method === "script.evaluate" && c.params.expression === "window.__ready" && c.params.awaitPromise === true && ok(c)
    && res(c).type === "success" && strVal(res(c).result) === "settled") ? null : "no awaited window.__ready -> settled"),
  R7: (rec) => {
    const vp = rec.cmds.find((c) => c.method === "browsingContext.setViewport" && ok(c) && c.params.viewport && c.params.viewport.width === VIEWPORT.width && c.params.viewport.height === VIEWPORT.height);
    if (!vp) return "no setViewport 640x480";
    return evalCmds(rec, "window.innerWidth").some((c) => c.i > vp.i && res(c).result && res(c).result.type === "number" && res(c).result.value === VIEWPORT.width) ? null : "innerWidth not 640 after setViewport";
  },
  R8: (rec) => {
    const clicks = rec.cmds.filter((c) => c.method === "input.performActions" && ok(c) && (c.params.actions || []).some((s) => s.type === "pointer" && (s.actions || []).some((a) => a.type === "pointerDown") && (s.actions || []).some((a) => a.type === "pointerUp")));
    if (!clicks.length) return "no pointer down/up performActions";
    const first = Math.min(...clicks.map((c) => c.i));
    return evalCmds(rec, "document.getElementById('out').textContent").some((c) => c.i > first && strVal(res(c).result) === "clicked:tabi") ? null : "#out is not clicked:tabi after the click";
  },
  R9: (rec) => {
    const keys = rec.cmds.filter((c) => c.method === "input.performActions" && ok(c) && (c.params.actions || []).some((s) => s.type === "key" && (s.actions || []).filter((a) => a.type === "keyDown").map((a) => a.value).join("").includes("tabi")));
    if (!keys.length) return "no key performActions typing tabi";
    const first = Math.min(...keys.map((c) => c.i));
    return evalCmds(rec, "document.getElementById('t').value").some((c) => c.i > first && strVal(res(c).result) === "tabi") ? null : "#t value is not tabi after typing";
  },
  R10: (rec) => {
    const base = navBase(rec);
    if (!base) return "no loopback base";
    const url = `${base}/a.html`;
    if (!rec.events.some((e) => e.method === "network.beforeRequestSent" && e.params.request && e.params.request.url === url)) return "no beforeRequestSent for /a.html";
    if (!rec.events.some((e) => e.method === "network.responseCompleted" && e.params.response && e.params.response.url === url)) return "no responseCompleted for /a.html";
    return null;
  },
  R11: (rec) => {
    const base = navBase(rec);
    if (!base) return "no loopback base";
    const url = `${base}/a.html`;
    return rec.events.some((e) => e.method === "network.responseCompleted" && e.params.response && e.params.response.url === url && e.params.response.status === 200
      && headerValue(e.params.response.headers, FIXTURE_HEADER[0]) === FIXTURE_HEADER[1]) ? null : "no responseCompleted /a.html with status 200 and the fixture header";
  },
  R12: (rec) => {
    const col = rec.cmds.find((c) => c.method === "network.addDataCollector" && ok(c) && (c.params.dataTypes || []).includes("response"));
    if (!col) return "no response data collector";
    return rec.cmds.some((c) => c.method === "network.getData" && ok(c) && c.i > col.i && c.params.dataType === "response" && decodeBytes(res(c).bytes) === DATA_TEXT) ? null : "no getData returning the fixture body";
  },
  R13: (rec) => {
    const ic = rec.cmds.find((c) => c.method === "network.addIntercept" && ok(c) && (c.params.phases || []).includes("beforeRequestSent"));
    if (!ic) return "no beforeRequestSent intercept";
    const icId = res(ic).intercept;
    const blocked = rec.events.filter((e) => e.method === "network.beforeRequestSent" && e.params.isBlocked === true && (e.params.intercepts || []).includes(icId)
      && e.params.request && /\/data\.txt(\?|$)/.test(String(e.params.request.url)));
    if (!blocked.length) return "no blocked beforeRequestSent for /data.txt";
    return rec.cmds.some((c) => c.method === "network.continueRequest" && ok(c) && blocked.some((e) => e.params.request.request === c.params.request && c.i > e.i)) ? null : "blocked request never continued";
  },
  R14: (rec) => {
    const tr = rec.cmds.find((c) => c.method === "browsingContext.traverseHistory" && ok(c) && c.params.delta === -1);
    if (!tr) return "no traverseHistory delta -1";
    if (!rec.cmds.some((c) => c.method === "browsingContext.navigate" && ok(c) && c.i < tr.i && /\/b\.html$/.test(String(c.params.url)))) return "no navigate to /b.html before the traverse";
    return evalCmds(rec, "location.pathname").some((c) => c.i > tr.i && strVal(res(c).result) === "/a.html") ? null : "pathname is not /a.html after the traverse";
  },
  R15: (rec) => (rec.cmds.some((c) => c.method === "storage.getCookies" && ok(c) && (res(c).cookies || []).some((k) => k.name === "tabi_fixture" && strVal(k.value) === "1")) ? null : "no getCookies with tabi_fixture=1"),
  R16: () => "no-bidi-counterpart",
  R17: (rec) => {
    const opened = rec.events.filter((e) => e.method === "browsingContext.userPromptOpened" && e.params.message === "tabi-alert");
    if (!opened.length) return "no userPromptOpened tabi-alert";
    return rec.cmds.some((c) => c.method === "browsingContext.handleUserPrompt" && ok(c) && opened.some((e) => c.i > e.i)) ? null : "prompt never handled";
  },
};

// ---- git (read-only) --------------------------------------------------------

function git(repo, args) {
  return spawnSync("git", ["-C", repo, ...args], { encoding: "buffer", maxBuffer: 256 * 1024 * 1024 });
}

function resolveRev(repo, rev) {
  if (typeof rev !== "string" || !/^[A-Za-z0-9._\/^~-]+$/.test(rev)) throw new Refusal(`bad revision syntax: ${rev}`);
  const r = git(repo, ["rev-parse", "--verify", "--quiet", `${rev}^{commit}`]);
  if (r.status !== 0) throw new Refusal(`unresolvable revision: ${rev}`);
  return r.stdout.toString("utf8").trim();
}

function blob(repo, rev, path) {
  if (typeof path !== "string" || !path || path.includes("..") || path.startsWith("/")) return null;
  const r = git(repo, ["show", `${rev}:${path}`]);
  return r.status === 0 ? r.stdout : null;
}

function parseRegistry(text) {
  const rows = new Map();
  for (const line of text.split("\n")) {
    if (!/^ {0,3}\|[ \t]*S[0-9]{3,}[ \t]*\|/.test(line)) continue;
    const cells = line.trim().split("|");
    if (cells.length !== 13) continue;
    const c = cells.slice(1, 12).map((x) => x.trim());
    const [id, , , , , , , status, opened, , usedBy] = c;
    if (!rows.has(id)) rows.set(id, { id, status, opened, usedBy });
  }
  return rows;
}

function splitRow(line) {
  const t = line.trim();
  if (!t.startsWith("|") || !t.endsWith("|")) return null;
  return t.slice(1, -1).split("|").map((c) => c.trim());
}

export function parseTable(text) {
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i += 1) {
    const cells = splitRow(lines[i]);
    if (!cells || cells.length !== HEADER.length) continue;
    if (!cells.every((c, k) => c.toLowerCase() === HEADER[k])) continue;
    const rows = [];
    let j = i + 1;
    if (j < lines.length && /^\s*\|[\s:|-]+\|\s*$/.test(lines[j])) j += 1;
    for (; j < lines.length; j += 1) {
      const rc = splitRow(lines[j]);
      if (!rc) break;
      rows.push({ line: j + 1, cells: rc });
    }
    return rows;
  }
  return null;
}

// ---- live leg: this counter's own BiDi client ------------------------------

function freePort() {
  return new Promise((resolve, reject) => {
    const s = createNetServer();
    s.on("error", reject);
    s.listen(0, "127.0.0.1", () => { const p = s.address().port; s.close(() => resolve(p)); });
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function liveRecord({ chromedriver = "chromedriver", chromium = "/usr/bin/chromium", timeoutMs = 60000 } = {}) {
  const which = (bin) => spawnSync("sh", ["-c", `command -v "$1"`, "sh", bin], { encoding: "utf8" }).status === 0;
  if (!which(chromedriver) || !which(chromium)) throw new Refusal("chromedriver or chromium not found");
  const base = tmpdir();
  const scratch = mkdtempSync(join(base, "tabi-bidi-live-"));
  // Chromium creates its singleton socket under TMPDIR (`.org.chromium.Chromium.XXXXXX/SingletonSocket`,
  // ~46 bytes); a unix socket path over 108 bytes makes Chrome exit at launch. Hand chromium the
  // throwaway scratch as TMPDIR when it is short enough, else a throwaway dir under XDG_RUNTIME_DIR
  // (the per-user runtime dir meant for sockets), else the caller's TMPDIR, removing the chromium
  // entries that appear there during the run.
  const runtime = process.env.XDG_RUNTIME_DIR;
  let chromeTmp = base;
  let ownChromeTmp = false;
  if (scratch.length <= 60) chromeTmp = scratch;
  else if (runtime && runtime.length <= 40) { chromeTmp = mkdtempSync(join(runtime, "tabi-bidi-")); ownChromeTmp = true; }
  const preexisting = new Set(readdirSync(chromeTmp));
  const fx = await serveFixture();
  const port = await freePort();
  const cd = spawn(chromedriver, [`--port=${port}`], { stdio: "ignore", env: { ...process.env, TMPDIR: chromeTmp, TMP: chromeTmp, TEMP: chromeTmp } });
  const rec = { newSession: null, cmds: [], events: [] };
  let ws = null;
  let sessionId = null;
  const deadline = setTimeout(() => { try { ws && ws.close(); } catch {} }, timeoutMs);
  try {
    let body = null;
    for (let k = 0; k < 50 && !body; k += 1) {
      try {
        const r = await fetch(`http://127.0.0.1:${port}/session`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ capabilities: { alwaysMatch: {
          browserName: "chrome", webSocketUrl: true, unhandledPromptBehavior: "ignore",
          "goog:chromeOptions": { binary: chromium, args: ["--headless=new", "--no-sandbox", "--no-first-run", "--disable-gpu", `--user-data-dir=${join(scratch, "profile")}`] } } } }) });
        body = await r.json();
      } catch { await sleep(200); }
    }
    if (!body || !body.value || !body.value.capabilities) throw new Refusal(`new session failed: ${JSON.stringify(body && body.value && body.value.message || body).slice(0, 200)} (chromium TMPDIR ${chromeTmp.length} bytes)`);
    rec.newSession = body;
    sessionId = body.value.sessionId;
    ws = new WebSocket(body.value.capabilities.webSocketUrl);
    await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = () => reject(new Refusal("websocket open failed")); });
    let pos = 0;
    let nextId = 0;
    const pending = new Map();
    const waiters = [];
    ws.onmessage = (m) => {
      const f = JSON.parse(String(m.data));
      pos += 1;
      if (f.id !== undefined && pending.has(f.id)) { const p = pending.get(f.id); pending.delete(f.id); p.cmd.response = f; p.resolve(p.cmd); }
      else if (f.method) {
        const e = { i: pos, method: f.method, params: f.params || {} };
        rec.events.push(e);
        for (const w of [...waiters]) if (w.pred(e)) { waiters.splice(waiters.indexOf(w), 1); w.resolve(e); }
      }
    };
    const send = (method, params = {}) => new Promise((resolve) => {
      nextId += 1;
      pos += 1;
      const cmd = { i: pos, id: nextId, method, params, response: null };
      rec.cmds.push(cmd);
      pending.set(nextId, { cmd, resolve });
      ws.send(JSON.stringify({ id: nextId, method, params }));
    });
    const waitEvent = (pred, ms = 10000) => {
      const hit = rec.events.find(pred);
      if (hit) return Promise.resolve(hit);
      return Promise.race([new Promise((resolve) => waiters.push({ pred, resolve })), sleep(ms).then(() => null)]);
    };
    const evaluate = (expression, awaitPromise = false, context) => send("script.evaluate", { expression, awaitPromise, target: { context } });
    await send("session.subscribe", { events: ["browsingContext.load", "browsingContext.userPromptOpened", "network.beforeRequestSent", "network.responseCompleted"] });
    const tree = await send("browsingContext.getTree", {});
    const context = res(tree).contexts && res(tree).contexts[0] && res(tree).contexts[0].context;
    if (!context) throw new Refusal("no browsing context");
    await send("browsingContext.setViewport", { context, viewport: VIEWPORT, devicePixelRatio: 1 });
    await send("network.addDataCollector", { dataTypes: ["response"], maxEncodedDataSize: 65536 });
    const a = `${fx.base}/a.html`;
    await send("browsingContext.navigate", { context, url: a, wait: "complete" });
    await waitEvent((e) => e.method === "browsingContext.load" && e.params.url === a);
    await evaluate("window.__ready", true, context);
    await evaluate("window.innerWidth", false, context);
    await send("browsingContext.captureScreenshot", { context });
    const loc = async (sel) => { const r = await send("browsingContext.locateNodes", { context, locator: { type: "css", value: sel } }); return res(r).nodes && res(r).nodes[0] && res(r).nodes[0].sharedId; };
    await loc("#h");
    const t = await loc("#t");
    const b = await loc("#b");
    const click = (sharedId) => ({ type: "pointer", id: "mouse", parameters: { pointerType: "mouse" }, actions: [{ type: "pointerMove", x: 0, y: 0, origin: { type: "element", element: { sharedId } } }, { type: "pointerDown", button: 0 }, { type: "pointerUp", button: 0 }] });
    await send("input.performActions", { context, actions: [click(t)] });
    await send("input.performActions", { context, actions: [{ type: "key", id: "kbd", actions: [..."tabi"].flatMap((ch) => [{ type: "keyDown", value: ch }, { type: "keyUp", value: ch }]) }] });
    await evaluate("document.getElementById('t').value", false, context);
    await send("input.performActions", { context, actions: [click(b)] });
    await evaluate("document.getElementById('out').textContent", false, context);
    await evaluate("fetch('/data.txt').then(function(r){return r.text()})", true, context);
    const done = await waitEvent((e) => e.method === "network.responseCompleted" && e.params.response && /\/data\.txt$/.test(e.params.response.url));
    if (done) await send("network.getData", { dataType: "response", request: done.params.request.request });
    await send("storage.getCookies", {});
    const ic = await send("network.addIntercept", { phases: ["beforeRequestSent"], urlPatterns: [{ type: "string", pattern: `${fx.base}/data.txt?held=1` }] });
    await evaluate("window.__held=fetch('/data.txt?held=1').then(function(r){return r.text()}),1", false, context);
    const blocked = await waitEvent((e) => e.method === "network.beforeRequestSent" && e.params.isBlocked === true && (e.params.intercepts || []).includes(res(ic).intercept));
    if (blocked) await send("network.continueRequest", { request: blocked.params.request.request });
    await evaluate("window.__held", true, context);
    await send("browsingContext.navigate", { context, url: `${fx.base}/b.html`, wait: "complete" });
    await send("browsingContext.traverseHistory", { context, delta: -1 });
    await waitEvent((e) => e.method === "browsingContext.load" && e.params.url === a && e.i > rec.cmds[rec.cmds.length - 1].i, 5000);
    for (let k = 0; k < 20; k += 1) {
      const p = await evaluate("location.pathname", false, context);
      if (strVal(res(p).result) === "/a.html") break;
      await sleep(100);
    }
    await evaluate("setTimeout(function(){alert('tabi-alert')},0),1", false, context);
    const prompt = await waitEvent((e) => e.method === "browsingContext.userPromptOpened" && e.params.message === "tabi-alert");
    if (prompt) await send("browsingContext.handleUserPrompt", { context: prompt.params.context, accept: true });
    return rec;
  } finally {
    clearTimeout(deadline);
    try { ws && ws.close(); } catch {}
    if (sessionId) { try { await fetch(`http://127.0.0.1:${port}/session/${sessionId}`, { method: "DELETE" }); } catch {} }
    cd.kill("SIGTERM");
    await fx.close();
    await sleep(300);
    if (ownChromeTmp) rmSync(chromeTmp, { recursive: true, force: true });
    else if (chromeTmp === base) for (const n of readdirSync(base)) if (!preexisting.has(n) && /^\.?org\.chromium\.Chromium\./.test(n)) rmSync(join(base, n), { recursive: true, force: true });
    rmSync(scratch, { recursive: true, force: true });
  }
}

// ---- verdict ----------------------------------------------------------------

export async function evaluate(repo, { rev: revArg, baseline: baseArg, entry, receipt = DEFAULT_RECEIPT, live = false, liveRunner = liveRecord }) {
  if (!entry) throw new Refusal("usage: --entry <path> is required");
  const rev = resolveRev(repo, revArg);
  const baseline = resolveRev(repo, baseArg);
  const reg = blob(repo, rev, SOURCES_PATH);
  if (reg === null) throw new Refusal(`${SOURCES_PATH} absent at ${rev}`);
  const regBase = blob(repo, baseline, SOURCES_PATH);
  if (regBase === null) throw new Refusal(`${SOURCES_PATH} absent at ${baseline}`);
  const out = { schema: SCHEMA, rev, baseline, entry, receipt, live, population: 0, admitted: 0, failing: 0, entryFinding: null, rows: [], fixtureSha256: FIXTURE_SHA256 };
  const entryBuf = blob(repo, rev, entry);
  if (entryBuf === null) { out.entryFinding = "e1-entry-absent"; out.clean = false; return out; }
  const entryText = entryBuf.toString("utf8");
  const rows = (parseTable(entryText) || []).filter((r) => /^yes(?![a-z])/i.test((r.cells[3] || "").trim()));
  out.population = rows.length;
  const regNow = parseRegistry(reg.toString("utf8"));
  const regThen = parseRegistry(regBase.toString("utf8"));
  const srcLine = (entryText.split("\n").find((l) => /^source:/i.test(l)) || "");
  const cited = [...srcLine.matchAll(/\bS\d{3,}\b/g)].map((m) => m[0]);
  const newRow = cited.some((id) => { const r = regNow.get(id); return r && r.status === "mined" && r.usedBy.split(/[,;]/).map((x) => x.trim()).includes(entry) && !regThen.has(id); });
  if (!newRow) out.entryFinding = "s1-source-row";
  // receipt
  let receiptFinding = null;
  const runs = [];
  let receiptObj = null;
  const rb = blob(repo, rev, receipt);
  if (rb === null) receiptFinding = "receipt absent";
  else {
    try { receiptObj = JSON.parse(rb.toString("utf8")); } catch { receiptFinding = "receipt is not JSON"; }
    if (receiptObj) {
      if (receiptObj.schema !== RECEIPT_SCHEMA) receiptFinding = "receipt schema";
      else if (receiptObj.fixtureSha256 !== FIXTURE_SHA256) receiptFinding = "fixtureSha256 is not FIXTURE's";
      else if (typeof receiptObj.browserVersion !== "string" || !receiptObj.browserVersion) receiptFinding = "no browserVersion";
      else if (typeof receiptObj.driver !== "string" || !receiptObj.driver || receiptObj.driver === "scripts/check-bidi-runtime.mjs" || (() => { const d = blob(repo, rev, receiptObj.driver); return d === null || sha256(d) !== receiptObj.driverSha256; })()) receiptFinding = "driver absent, is this counter, or its sha256 differs";
      else if (!Array.isArray(receiptObj.runs) || receiptObj.runs.length < 2) receiptFinding = "fewer than two runs";
      else {
        for (const run of receiptObj.runs) {
          const tb = blob(repo, rev, run.transcript);
          if (tb === null) { receiptFinding = `transcript absent: ${run.transcript}`; break; }
          if (sha256(tb) !== run.transcriptSha256) { receiptFinding = `transcript sha256 differs: ${run.transcript}`; break; }
          try { runs.push({ name: run.name, rec: recordFromTranscript(tb.toString("utf8")) }); } catch (e) { receiptFinding = `transcript unreadable: ${e.message}`; break; }
        }
      }
    }
  }
  let liveRec = null;
  let liveError = null;
  if (live && rows.length) {
    try { liveRec = await liveRunner(); } catch (e) { if (e instanceof Refusal) throw e; liveError = String(e && e.message || e); }
  }
  const firstShot = (rec) => { const c = rec.cmds.find((x) => x.method === "browsingContext.captureScreenshot" && ok(x)); return c ? sha256(Buffer.from(String(res(c).data || ""), "base64")) : null; };
  const cdv = (rec) => (rec.newSession && rec.newSession.value && rec.newSession.value.capabilities && rec.newSession.value.capabilities.chrome && rec.newSession.value.capabilities.chrome.chromedriverVersion) || null;
  let bindingFinding = null;
  if (!receiptFinding && runs.length) {
    const shots = runs.map((r) => firstShot(r.rec));
    if (shots.some((s) => !s) || new Set(shots).size !== 1) bindingFinding = "first screenshots absent or differ between runs";
    else if (runs.some((r) => !cdv(r.rec)) || new Set(runs.map((r) => cdv(r.rec))).size !== 1) bindingFinding = "chromedriverVersion absent or differs between runs";
    else if (live && liveRec) {
      if (firstShot(liveRec) !== shots[0]) bindingFinding = "first screenshot differs from this counter's live session";
      else if (cdv(liveRec) !== cdv(runs[0].rec)) bindingFinding = "chromedriverVersion differs from this counter's live session";
    }
  }
  out.binding = bindingFinding;
  const ctx = { browserVersion: receiptObj && receiptObj.browserVersion };
  for (const r of rows) {
    const id = r.cells[0];
    const row = { line: r.line, id, admitted: false, reason: null, detail: null };
    if (out.entryFinding) row.reason = out.entryFinding;
    else if (!Object.hasOwn(ROWS, id)) row.reason = "x1-row-unknown";
    else if (id === "R16") row.reason = "x2-no-counterpart";
    else if (receiptFinding) { row.reason = "t1-receipt"; row.detail = receiptFinding; }
    else if (bindingFinding) { row.reason = "t3-binding"; row.detail = bindingFinding; }
    else {
      for (const run of runs) {
        const why = PREDICATES[id](run.rec, ctx);
        if (why) { row.reason = "t2-run"; row.detail = `${run.name}: ${why}`; break; }
      }
      if (!row.reason && live) {
        const why = liveRec ? PREDICATES[id](liveRec, ctx) : `live session failed: ${liveError}`;
        if (why) { row.reason = "l1-live"; row.detail = why; }
      }
    }
    row.admitted = row.reason === null;
    out.rows.push(row);
  }
  out.admitted = out.rows.filter((r) => r.admitted).length;
  out.failing = out.population - out.admitted;
  out.clean = !out.entryFinding && out.population >= 1 && out.failing === 0;
  return out;
}

// ---- self-test ----------------------------------------------------------------

// A synthetic record that satisfies every admittable predicate (test-only;
// exported so the round's do-nothing controls can score a browserless forgery).
export function goldenLines({ base = "http://127.0.0.1:40000", version = "154.0.8037.97", mutate = () => {}, shotTag = "", driverVersion = "154.0.8037.97 (fixture)" } = {}) {
  const png = Buffer.alloc(24 + shotTag.length);
  png.write(shotTag, 24, "ascii");
  Buffer.from("89504e470d0a1a0a", "hex").copy(png, 0);
  png.write("IHDR", 12, "ascii");
  png.writeUInt32BE(VIEWPORT.width, 16);
  png.writeUInt32BE(VIEWPORT.height, 20);
  const a = `${base}/a.html`;
  const S = (v) => ({ type: "string", value: v });
  const steps = [
    ["cmd", "session.subscribe", {}, {}],
    ["cmd", "browsingContext.getTree", {}, { contexts: [{ context: "C1", url: "about:blank" }] }],
    ["cmd", "browsingContext.setViewport", { context: "C1", viewport: VIEWPORT }, {}],
    ["cmd", "network.addDataCollector", { dataTypes: ["response"], maxEncodedDataSize: 65536 }, { collector: "K1" }],
    ["ev", "network.beforeRequestSent", { request: { request: "Q1", url: a } }],
    ["ev", "network.responseCompleted", { request: { request: "Q1", url: a }, response: { url: a, status: 200, headers: [{ name: "X-Tabi-Fixture", value: S("r32") }] } }],
    ["ev", "browsingContext.load", { context: "C1", url: a }],
    ["cmd", "browsingContext.navigate", { context: "C1", url: a, wait: "complete" }, { navigation: "N1", url: a }],
    ["cmd", "script.evaluate", { expression: "window.__ready", awaitPromise: true }, { type: "success", result: S("settled") }],
    ["cmd", "script.evaluate", { expression: "window.innerWidth" }, { type: "success", result: { type: "number", value: VIEWPORT.width } }],
    ["cmd", "browsingContext.locateNodes", { context: "C1", locator: { type: "css", value: "#h" } }, { nodes: [{ type: "node", sharedId: "H", value: { localName: "h1" } }] }],
    ["cmd", "input.performActions", { actions: [{ type: "key", id: "k", actions: [..."tabi"].map((c) => ({ type: "keyDown", value: c })) }] }, {}],
    ["cmd", "script.evaluate", { expression: "document.getElementById('t').value" }, { type: "success", result: S("tabi") }],
    ["cmd", "input.performActions", { actions: [{ type: "pointer", id: "m", actions: [{ type: "pointerDown", button: 0 }, { type: "pointerUp", button: 0 }] }] }, {}],
    ["cmd", "script.evaluate", { expression: "document.getElementById('out').textContent" }, { type: "success", result: S("clicked:tabi") }],
    ["cmd", "browsingContext.captureScreenshot", { context: "C1" }, { data: png.toString("base64") }],
    ["cmd", "network.getData", { dataType: "response", request: "Q2" }, { bytes: S(DATA_TEXT) }],
    ["cmd", "storage.getCookies", {}, { cookies: [{ name: "tabi_fixture", value: S("1") }] }],
    ["cmd", "network.addIntercept", { phases: ["beforeRequestSent"] }, { intercept: "I1" }],
    ["ev", "network.beforeRequestSent", { isBlocked: true, intercepts: ["I1"], request: { request: "Q3", url: `${base}/data.txt?held=1` } }],
    ["cmd", "network.continueRequest", { request: "Q3" }, {}],
    ["cmd", "browsingContext.navigate", { context: "C1", url: `${base}/b.html` }, { url: `${base}/b.html` }],
    ["cmd", "browsingContext.traverseHistory", { context: "C1", delta: -1 }, {}],
    ["cmd", "script.evaluate", { expression: "location.pathname" }, { type: "success", result: S("/a.html") }],
    ["ev", "browsingContext.userPromptOpened", { context: "C1", message: "tabi-alert" }],
    ["cmd", "browsingContext.handleUserPrompt", { context: "C1", accept: true }, {}],
  ];
  mutate(steps);
  const lines = [{ dir: "http-res", path: "/session", body: { value: { sessionId: "X", capabilities: { browserName: "chrome", browserVersion: version, chrome: { chromedriverVersion: driverVersion }, webSocketUrl: "ws://127.0.0.1:9515/session/X" } } } }];
  let id = 0;
  for (const [kind, method, params, result] of steps) {
    if (kind === "ev") lines.push({ dir: "recv", frame: { type: "event", method, params } });
    else { id += 1; lines.push({ dir: "send", frame: { id, method, params } }); lines.push({ dir: "recv", frame: { id, type: "success", result } }); }
  }
  return lines.map((l, k) => JSON.stringify({ seq: k + 1, ...l })).join("\n") + "\n";
}

const ALL_OK = ["R1", "R2", "R3", "R4", "R5", "R6", "R7", "R8", "R9", "R10", "R11", "R12", "R13", "R14", "R15", "R17"];
const ENTRY = "corpus/knowledge/bidi-fixture.md";

function entryDoc(ids, source = "S002") {
  return [`source: ${source} — fixture`, "verified-at: fixture", "recheck: fixture", "", "| Row | Surface | BiDi method | Measured | Evidence |", "|---|---|---|---|---|",
    ...ids.map((id) => `| ${id} | ${ROWS[id] || "x"} | m | yes | receipt |`), ""].join("\n");
}

function regDoc(rows) {
  return ["# SOURCES", "", "| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |", "|---|---|---|---|---|---|---|---|---|---|---|",
    ...rows.map(([id, usedBy]) => `| ${id} | t — https://e.test/ | spec | A | s | a | t | mined | 2026-10-26 | 90d | ${usedBy} |`), ""].join("\n");
}

const CASES = [
  { id: "do-nothing-entry-absent", exit: 1, admitted: 0, reason: "e1-entry-absent", build: () => ({ noEntry: true }) },
  { id: "golden-two-runs", exit: 0, admitted: 16, reason: null, build: () => ({}) },
  { id: "old-source-row", exit: 1, admitted: 0, reason: "s1-source-row", build: () => ({ source: "S001" }) },
  { id: "source-row-not-naming-entry", exit: 1, admitted: 0, reason: "s1-source-row", build: () => ({ usedBy: "corpus/knowledge/other.md" }) },
  { id: "stop-loading-marked", exit: 1, admitted: 0, reason: "x2-no-counterpart", build: () => ({ ids: ["R16"] }) },
  { id: "unknown-row", exit: 1, admitted: 0, reason: "x1-row-unknown", build: () => ({ ids: ["R18"] }) },
  { id: "one-run-only", exit: 1, admitted: 0, reason: "t1-receipt", build: () => ({ runs: 1 }) },
  { id: "transcript-tampered", exit: 1, admitted: 0, reason: "t1-receipt", build: () => ({ tamper: true }) },
  { id: "fixture-sha-differs", exit: 1, admitted: 0, reason: "t1-receipt", build: () => ({ fixtureSha: "0".repeat(64) }) },
  { id: "cdp-relabelled", exit: 1, admitted: 0, reason: "t2-run", build: () => ({ ids: ["R6"], mutate: (s) => { for (const x of s) if (x[1] === "script.evaluate") x[1] = "Runtime.evaluate"; } }) },
  { id: "forged-value", exit: 1, admitted: 0, reason: "t2-run", build: () => ({ ids: ["R6"], mutate: (s) => { s.find((x) => x[2].expression === "window.__ready")[3] = { type: "success", result: { type: "string", value: "nope" } }; } }) },
  { id: "off-loopback-navigate", exit: 1, admitted: 0, reason: "t2-run", build: () => ({ ids: ["R3"], base: "http://example.com" }) },
  { id: "screenshot-wrong-size", exit: 1, admitted: 0, reason: "t2-run", build: () => ({ ids: ["R4"], mutate: (s) => { s.find((x) => x[1] === "browsingContext.captureScreenshot")[3] = { data: Buffer.from("not a png").toString("base64") }; } }) },
  { id: "readout-before-action", exit: 1, admitted: 0, reason: "t2-run", build: () => ({ ids: ["R8"], mutate: (s) => { const k = s.findIndex((x) => x[2].expression === "document.getElementById('out').textContent"); const [e] = s.splice(k, 1); s.splice(2, 0, e); } }) },
  { id: "browser-version-mismatch", exit: 1, admitted: 0, reason: "t2-run", build: () => ({ ids: ["R1"], version: "1.0" }) },
  { id: "error-response-not-success", exit: 1, admitted: 0, reason: "t2-run", build: () => ({ ids: ["R2"], errorMethod: "browsingContext.getTree" }) },
  { id: "live-agrees", exit: 0, admitted: 2, reason: null, build: () => ({ ids: ["R2", "R15"], live: "golden" }) },
  { id: "live-session-empty", exit: 1, admitted: 0, reason: "t3-binding", build: () => ({ ids: ["R15"], live: "empty" }) },
  { id: "live-row-disagrees", exit: 1, admitted: 0, reason: "l1-live", build: () => ({ ids: ["R15"], live: "noCookies" }) },
  { id: "live-screenshot-differs", exit: 1, admitted: 0, reason: "t3-binding", build: () => ({ ids: ["R2"], live: "otherShot" }) },
  { id: "live-chromedriver-differs", exit: 1, admitted: 0, reason: "t3-binding", build: () => ({ ids: ["R2"], live: "otherDriver" }) },
  { id: "run-screenshots-differ", exit: 1, admitted: 0, reason: "t3-binding", build: () => ({ ids: ["R2"], shotPerRun: true }) },
  { id: "driver-absent", exit: 1, admitted: 0, reason: "t1-receipt", build: () => ({ noDriver: true }) },
  { id: "driver-is-the-counter", exit: 1, admitted: 0, reason: "t1-receipt", build: () => ({ driverPath: "scripts/check-bidi-runtime.mjs" }) },
];

function makeFixture() {
  const root = mkdtempSync(join(tmpdir(), "tabi-bidi-runtime-"));
  const run = (args) => {
    const r = spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
    if (r.status !== 0) throw new Error(`fixture git ${args[0]} failed: ${r.stderr}`);
    return r.stdout.trim();
  };
  run(["init", "-q"]);
  if (run(["rev-parse", "--show-toplevel"]) !== root) throw new Error("fixture root mismatch");
  run(["config", "user.email", "fixture@tabi.local"]);
  run(["config", "user.name", "tabi-fixture"]);
  const put = (rel, text) => { const abs = join(root, rel); mkdirSync(dirname(abs), { recursive: true }); writeFileSync(abs, text); };
  const commit = () => { run(["add", "-A"]); run(["commit", "-q", "--allow-empty", "-m", "fixture"]); return run(["rev-parse", "HEAD"]); };
  return { root, put, commit };
}

async function runSelftest() {
  const results = [];
  for (const c of CASES) {
    const o = c.build();
    const fx = makeFixture();
    try {
      fx.put(SOURCES_PATH, regDoc([["S001", ENTRY]]));
      const baseline = fx.commit();
      const usedBy = o.usedBy || ENTRY;
      fx.put(SOURCES_PATH, regDoc([["S001", ENTRY], ["S002", usedBy]]));
      if (!o.noEntry) fx.put(ENTRY, entryDoc(o.ids || ALL_OK, o.source || "S002"));
      const runsN = o.runs || 2;
      const runs = [];
      for (let k = 1; k <= runsN; k += 1) {
        let text = goldenLines({ base: o.base, version: o.version, mutate: o.mutate, shotTag: o.shotPerRun ? `run${k}` : "" });
        if (o.errorMethod) {
          const ls = text.trim().split("\n").map((l) => JSON.parse(l));
          const sent = ls.find((l) => l.dir === "send" && l.frame.method === o.errorMethod);
          const resp = ls.find((l) => l.dir === "recv" && l.frame.id === sent.frame.id);
          resp.frame = { id: sent.frame.id, type: "error", error: "unknown command", message: "x" };
          text = ls.map((l) => JSON.stringify(l)).join("\n") + "\n";
        }
        const rel = `corpus/evidence/round-32/bidi/run${k}/transcript.jsonl`;
        fx.put(rel, text);
        runs.push({ name: `run${k}`, transcript: rel, transcriptSha256: o.tamper && k === 2 ? sha256("x") : sha256(Buffer.from(text)) });
      }
      const driver = o.driverPath || "scripts/bidi-driver-fixture.mjs";
      if (!o.noDriver) fx.put(driver, "// fixture driver\n");
      fx.put(DEFAULT_RECEIPT, JSON.stringify({ schema: RECEIPT_SCHEMA, fixtureSha256: o.fixtureSha || FIXTURE_SHA256, browserVersion: "154.0.8037.97", driver, driverSha256: sha256(Buffer.from("// fixture driver\n")), runs }, null, 2));
      const rev = fx.commit();
      const liveRunner = async () => {
        if (o.live === "golden") return recordFromTranscript(goldenLines({}));
        if (o.live === "noCookies") return recordFromTranscript(goldenLines({ mutate: (s) => { s.splice(s.findIndex((x) => x[1] === "storage.getCookies"), 1); } }));
        if (o.live === "otherShot") return recordFromTranscript(goldenLines({ shotTag: "live" }));
        if (o.live === "otherDriver") return recordFromTranscript(goldenLines({ driverVersion: "155.0.0.0 (other)" }));
        return { newSession: null, cmds: [], events: [] };
      };
      let out;
      let exit;
      try {
        out = await evaluate(fx.root, { rev, baseline, entry: ENTRY, live: Boolean(o.live), liveRunner });
        exit = out.clean ? 0 : 1;
      } catch (e) {
        if (!(e instanceof Refusal)) throw e;
        exit = 2;
        out = { admitted: 0, rows: [], entryFinding: "refused" };
      }
      const reason = out.entryFinding || (out.rows.find((r) => !r.admitted) || {}).reason || null;
      const pass = exit === c.exit && out.admitted === c.admitted && reason === c.reason;
      results.push({ id: c.id, ok: pass, expectedExit: c.exit, exit, expectedAdmitted: c.admitted, admitted: out.admitted, expectedReason: c.reason, reason });
    } finally {
      rmSync(fx.root, { recursive: true, force: true });
    }
  }
  const fx = makeFixture();
  try {
    fx.put(SOURCES_PATH, regDoc([]));
    const rev = fx.commit();
    for (const [id, args] of [["refusal-bad-rev-syntax", { rev: "../x", baseline: rev, entry: ENTRY }], ["refusal-unresolvable-rev", { rev: "0".repeat(40), baseline: rev, entry: ENTRY }], ["refusal-no-entry-arg", { rev, baseline: rev }]]) {
      let exit = 0;
      try { await evaluate(fx.root, args); } catch (e) { if (!(e instanceof Refusal)) throw e; exit = 2; }
      results.push({ id, ok: exit === 2, expectedExit: 2, exit, expectedAdmitted: 0, admitted: 0, expectedReason: "refused", reason: exit === 2 ? "refused" : null });
    }
  } finally {
    rmSync(fx.root, { recursive: true, force: true });
  }
  const failed = results.filter((r) => !r.ok);
  return { schema: SELFTEST_SCHEMA, cases: results.length, passed: results.length - failed.length, results, ok: failed.length === 0 };
}

// ---- cli --------------------------------------------------------------------

function parseArgs(argv) {
  const o = { repo: LANE, rev: null, baseline: null, entry: null, receipt: DEFAULT_RECEIPT, live: false, json: false, selftest: false, help: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--json") o.json = true;
    else if (a === "--live") o.live = true;
    else if (a === "--selftest") o.selftest = true;
    else if (a === "--help" || a === "-h") o.help = true;
    else if (["--repo", "--rev", "--baseline", "--entry", "--receipt"].includes(a)) {
      const v = argv[++i];
      if (v === undefined) throw new Refusal(`missing value for ${a}`);
      o[a.slice(2)] = v;
    } else throw new Refusal(`unknown argument: ${a}`);
  }
  return o;
}

async function main() {
  let o;
  try { o = parseArgs(process.argv.slice(2)); } catch (e) { console.error(`BIDI_RUNTIME verdict=could-not-evaluate detail=${e.message}`); process.exit(2); }
  if (o.help) { console.log("usage: node scripts/check-bidi-runtime.mjs --rev <REV> --baseline <REV> --entry <path> [--receipt PATH] [--live] [--json] | --selftest [--json]"); process.exit(0); }
  if (o.selftest) {
    const out = await runSelftest();
    if (o.json) console.log(JSON.stringify(out, null, 2));
    else {
      for (const r of out.results) console.log(`CASE id=${r.id} expected_exit=${r.expectedExit} exit=${r.exit} expected_admitted=${r.expectedAdmitted} admitted=${r.admitted} expected_reason=${r.expectedReason ?? "-"} reason=${r.reason ?? "-"} ${r.ok ? "PASS" : "FAIL"}`);
      console.log(`BIDI_RUNTIME_SELFTEST verdict=${out.ok ? "clean" : "failed"} cases=${out.cases} passed=${out.passed}`);
    }
    process.exit(out.ok ? 0 : 3);
  }
  if (!o.rev || !o.baseline) { console.error("BIDI_RUNTIME verdict=could-not-evaluate detail=usage: --rev <REV> --baseline <REV> --entry <path>"); process.exit(2); }
  let out;
  try { out = await evaluate(o.repo, o); } catch (e) {
    if (!(e instanceof Refusal)) throw e;
    console.error(`BIDI_RUNTIME verdict=could-not-evaluate detail=${e.message}`);
    process.exit(2);
  }
  if (o.json) console.log(JSON.stringify(out, null, 2));
  else {
    for (const r of out.rows) console.log(`ROW id=${r.id} line=${r.line} ${r.admitted ? "admitted" : `reason=${r.reason}${r.detail ? ` detail=${JSON.stringify(r.detail)}` : ""}`}`);
    console.log(`BIDI_RUNTIME verdict=${out.clean ? "clean" : "failed"} rev=${out.rev} population=${out.population} admitted=${out.admitted} failing=${out.failing}${out.entryFinding ? ` entry=${out.entryFinding}` : ""} live=${out.live}`);
  }
  process.exit(out.clean ? 0 : 1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
