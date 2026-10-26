#!/usr/bin/env node
// check-bidi-runtime.mjs — tabi lane gate: coverage (WebDriver BiDi surfaces
// observed at runtime on this host, loopback only). v2, round 33.
//
// Verdict: 0 clean (population >= 1, at least one row admitted, no row finding);
//          1 failed (entry absent, no admissible source row, or one or more row
//          findings); 2 could-not-evaluate (usage, unresolvable revision,
//          registry or lessons absent, --live without chromedriver or chromium).
//          Any other nonzero code is undeclared and reads as could-not-evaluate.
// Self-test: `--selftest` (isolated cases over temporary sandbox repositories
//          under TMPDIR with synthetic transcripts; the live leg is exercised
//          through an injected runner, never a browser; creates and removes
//          its own trees).
// Frozen by: .ufo/waves/round-32/claims.json claim C1 (v1 counter sha256
//          recorded there before any claim data); v2 is round 33 claim C2.
// Owner: tabi L1.
//
// Write scope: stdout/stderr only. Production reads committed git blobs
//          (git show <rev>:<path>). With --live it starts chromedriver and a
//          headless chromium with a throwaway profile, HOME and XDG config/cache
//          dirs under TMPDIR (round 33: the operator's ~/.pki NSS store and
//          ~/.config/chromium are never opened), serves FIXTURE on 127.0.0.1
//          only, never navigates off loopback, and removes only the dirs it
//          created; never writes the lane, never reads credentials or session
//          material. The live leg launches the real browser binary
//          (/usr/lib/chromium/chromium), not the /usr/bin/chromium launcher
//          (which prepends ~/.config/chromium-flags.conf, host state this run
//          does not own — S128) and never passes --no-sandbox (S129): if the
//          sandbox cannot start, or no short directory exists for chromium's
//          singleton socket, the gate refuses (exit 2) instead.
//
// What it decides (v2)
// --------------------
// Population: EVERY data row of the first Markdown table in --entry whose
// header cells are exactly `Row | Surface | BiDi method | Measured | Evidence`
// (case-insensitive) and whose Measured cell is non-empty. Row ids R1..R17 are
// the seventeen rows of corpus/knowledge/webdriver-bidi-capability-matrix.md §2
// in order (ROWS). A row whose Measured cell is not a bare `yes`, a bare `no`,
// or `no` followed by a dash-introduced reason is a row finding: v1 dropped a
// decorated cell (`yes (live)`) out of the population, which hid the row.
// A duplicated row id is a row finding on every occurrence; a `no` row is
// counted in the population and reported as unmeasured, never as admitted.
//
// Entry-level checks (fail the whole population):
//   e1-entry-absent   --entry is not committed at --rev.
//   s1-source-row     the entry's `source:` line cites no S-id whose registry
//                     row (0-3 leading spaces, 11 cells) is `mined`, names the
//                     entry in used-by, is absent at --baseline, AND has a
//                     `## Gate` table row in a corpus/lessons/round-*.md at
//                     --rev carrying an https URL and a 64-hex sha256 whose
//                     host equals the registry row's source URL host. v1 read
//                     the registry row alone, so a fabricated row passed.
//
// Receipt runs (t1-receipt, one finding fails every row):
//   - the receipt is present, its schema is RECEIPT_SCHEMA, its fixtureSha256
//     is this gate's FIXTURE digest, and it names a browserVersion;
//   - the `driver` blob is present at --rev with the recorded sha256, is NOT
//     this gate (its path, its bytes, a re-export of it, or an import of a
//     symbol outside the allow-list below);
//   - at least two runs, whose transcript paths are pairwise distinct and
//     whose transcript sha256 are pairwise distinct (v1 admitted the same path
//     twice and byte-identical copies);
//   - each run's classic new-session body carries a sessionId of ChromeDriver's
//     shape (32 lowercase hex) and a capabilities.webSocketUrl of
//     `ws://127.0.0.1:<port>/session/<that sessionId>`; sessionIds are pairwise
//     distinct; every browsing-context id the run mentions is ChromeDriver's
//     context shape (32 uppercase hex), so the v1 generator's `X` / `C1`
//     constants are refused (v1 could not tell a synthesised transcript from a
//     recorded one).
//   Driver import allow-list: FIXTURE, FIXTURE_SHA256, FIXTURE_HEADER, VIEWPORT,
//   DATA_TEXT, serveFixture (the round-32 driver imports three of them:
//   FIXTURE_SHA256, VIEWPORT, serveFixture). Any other gate symbol, a
//   namespace/default import, a side-effect import, or an `export ... from`
//   re-export of this gate is a t1 finding.
//
// Per row, first failing check by stable id:
//   x1-row-unknown    the id is not one of R1..R17.
//   x3-duplicate-id   the id occurs more than once in the entry table.
//   x4-measured-cell  the Measured cell is neither `yes` nor `no` (+ reason).
//   x2-no-counterpart the matrix row has no BiDi command (R16, stop-loading)
//                     and is marked `yes`.
//   t1-receipt        as above.
//   t3-binding        the runs are not bound to a real rendering: each run's
//                     FIRST captureScreenshot (taken after setViewport 640x480,
//                     navigate /a.html complete and window.__ready settled,
//                     before any input action) must decode to the same bytes in
//                     every run and carry a chromedriverVersion; with --live
//                     those bytes and that version must equal this counter's own
//                     session's (headless rendering of FIXTURE is
//                     byte-deterministic on one host build).
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
// Counted fields: population (every non-empty Measured row), admitted, failing
// (rows with a finding), unmeasured (bare `no` rows), distinct (distinct ids
// among measured rows).
//
// Limits (v2):
//   - The battery is finite. A receipt whose runs are synthesised with
//     real-shaped session ids, distinct bytes and a real-shaped context id is
//     still not proven to have been executed: v2 binds shape and cross-run
//     identity, not a driver-emitted log. The live leg re-tests every admitted
//     row on a session this gate starts, which is what the capability verdict
//     rests on.
//   - The Gate-row check reads one table row's text; it does not verify that
//     the URL was fetched. It closes a fabricated registry row, not a fetched
//     page whose bytes are unread.
//   - The driver import scan is line-based static text matching; a driver that
//     reaches the gate through a computed specifier or a multi-line import is
//     not detected by it.
//   - `no` rows are unmeasured, not verified: the gate cannot tell a genuinely
//     absent capability from an unmeasured one.
//
// Usage:
//   node scripts/check-bidi-runtime.mjs --rev <REV> --baseline <REV> --entry <path>
//        [--receipt PATH] [--live] [--json]
//   node scripts/check-bidi-runtime.mjs --selftest [--json]
//   node scripts/check-bidi-runtime.mjs --repo <dir> ...   (tests)
import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readdirSync, readFileSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, posix } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import { createServer } from "node:http";
import { createServer as createNetServer } from "node:net";

const SCHEMA = "tabi-bidi-runtime-v2";
const SELFTEST_SCHEMA = "tabi-bidi-runtime-selftest-v2";
const RECEIPT_SCHEMA = "tabi-bidi-receipt-v1";
const SOURCES_PATH = "corpus/SOURCES.md";
const LESSONS_DIR = "corpus/lessons";
const GATE_PATH = "scripts/check-bidi-runtime.mjs";
const DEFAULT_RECEIPT = "corpus/evidence/round-32/bidi/receipt.json";
const LANE = join(dirname(fileURLToPath(import.meta.url)), "..");
const HEADER = ["row", "surface", "bidi method", "measured", "evidence"];
const DRIVER_ALLOW = new Set(["FIXTURE", "FIXTURE_SHA256", "FIXTURE_HEADER", "VIEWPORT", "DATA_TEXT", "serveFixture"]);
const SESSION_ID = /^[0-9a-f]{32}$/; // ChromeDriver 154 classic session id shape
const CONTEXT_ID = /^[0-9A-F]{32}$/; // ChromeDriver 154 browsing-context id shape
const WS_LOOPBACK = /^ws:\/\/(127\.0\.0\.1|localhost):\d+\/session\//;
const WS_SESSION = /^ws:\/\/[^/]+\/session\/([0-9a-f]{32})$/;
const MEASURED = /^(yes|no)(?:\s*[—–-]\s*\S[\s\S]*)?$/i;
const HEX64 = /\b[0-9a-f]{64}\b/;

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
    if (!WS_LOOPBACK.test(String(caps.webSocketUrl || ""))) return "webSocketUrl not a loopback ws url";
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

// ---- receipt provenance helpers --------------------------------------------

// The Measured cell's verdict: "yes" | "no" | null (a decorated/empty cell).
function measuredVerdict(cell) {
  const t = String(cell == null ? "" : cell).trim();
  if (!t) return { verdict: null, measured: false, detail: "Measured cell is empty" };
  const m = MEASURED.exec(t);
  if (!m) return { verdict: null, measured: false, detail: `Measured cell is neither yes nor no-plus-reason: ${JSON.stringify(t)}` };
  return { verdict: m[1].toLowerCase(), measured: true, detail: null };
}

// The classic new-session body's provenance: a ChromeDriver-shaped sessionId
// bound to a loopback webSocketUrl that carries that same id.
function sessionOf(rec) {
  const v = rec.newSession && rec.newSession.value;
  if (!v || typeof v !== "object") return { why: "no classic new-session value" };
  const sid = v.sessionId;
  if (typeof sid !== "string" || !SESSION_ID.test(sid)) return { why: `sessionId is not 32 lowercase hex: ${JSON.stringify(sid)}` };
  const caps = v.capabilities;
  const url = caps && caps.webSocketUrl;
  if (typeof url !== "string") return { why: "no webSocketUrl capability" };
  const m = WS_SESSION.exec(url);
  if (!m) return { why: `webSocketUrl is not ws://<host>/session/<sessionId>: ${url}` };
  if (m[1] !== sid) return { why: `webSocketUrl session segment ${m[1]} != sessionId ${sid}` };
  if (!WS_LOOPBACK.test(url)) return { why: `webSocketUrl is not a loopback ws session url: ${url}` };
  return { sid, url };
}

// Every browsing-context id a run mentions: command/event params and getTree results.
function contextIds(rec) {
  const ids = new Set();
  const add = (v) => { if (typeof v === "string") ids.add(v); };
  for (const c of rec.cmds) {
    add(c.params && c.params.context);
    const t = c.params && c.params.target;
    if (t && typeof t === "object") add(t.context);
    const r = (c.response && c.response.result) || {};
    for (const x of Array.isArray(r.contexts) ? r.contexts : []) if (x && typeof x === "object") add(x.context);
  }
  for (const e of rec.events) add(e.params && e.params.context);
  return [...ids];
}

// Static import/export specifiers of a driver blob (line-based; see Limits).
function importSpecs(text) {
  const out = [];
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("//")) continue;
    let m = /^export\s+\*\s*(?:as\s+\w+\s*)?from\s*["']([^"']+)["']/.exec(t);
    if (m) { out.push({ kind: "re-export", spec: m[1], names: null }); continue; }
    m = /^export\s*\{([^}]*)\}\s*from\s*["']([^"']+)["']/.exec(t);
    if (m) { out.push({ kind: "re-export", spec: m[2], names: m[1].split(",").map((x) => x.trim().split(/\s+as\s+/)[0]).filter(Boolean) }); continue; }
    m = /^import\s+([^;]*?)\s*from\s*["']([^"']+)["']/.exec(t);
    if (m) {
      const clause = m[1].trim();
      if (clause.startsWith("*")) { out.push({ kind: "namespace", spec: m[2], names: null }); continue; }
      if (clause.startsWith("{")) { out.push({ kind: "named", spec: m[2], names: clause.replace(/^\{|\}$/g, "").split(",").map((x) => x.trim().split(/\s+as\s+/)[0]).filter(Boolean) }); continue; }
      out.push({ kind: "default", spec: m[2], names: null });
      continue;
    }
    m = /^import\s+["']([^"']+)["']/.exec(t);
    if (m) out.push({ kind: "side-effect", spec: m[1], names: null });
  }
  return out;
}

function resolvesToGate(spec, driverPath) {
  if (!spec) return false;
  if (spec.startsWith(".")) return posix.normalize(posix.join(posix.dirname(driverPath), spec)) === GATE_PATH;
  if (spec.startsWith("/")) return false;
  return spec === "check-bidi-runtime.mjs" || spec.endsWith("/check-bidi-runtime.mjs");
}

function driverGateFinding(text, driverPath) {
  for (const s of importSpecs(text)) {
    if (!resolvesToGate(s.spec, driverPath)) continue;
    if (s.kind === "named") {
      const bad = (s.names || []).filter((n) => !DRIVER_ALLOW.has(n));
      if (!bad.length) continue;
      return `driver imports non-allow-listed gate symbol(s): ${bad.join(", ")}`;
    }
    return `driver has a ${s.kind} relation to this gate (${s.spec})`;
  }
  return null;
}

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
    const [id, source, , , , , , status, opened, , usedBy] = c;
    if (!rows.has(id)) rows.set(id, { id, source, status, opened, usedBy });
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

// The corpus/lessons/round-*.md `## Gate` table rows, keyed by S-id (v2's
// provenance requirement: a registry row alone is not evidence of a fetch).
function gateRows(repo, rev) {
  const map = new Map();
  const r = git(repo, ["ls-tree", "-r", "--name-only", rev, "--", LESSONS_DIR]);
  if (r.status !== 0) return map;
  const files = r.stdout.toString("utf8").split("\n").filter((p) => /^corpus\/lessons\/round-[^/]+\.md$/.test(p));
  for (const f of files) {
    const b = blob(repo, rev, f);
    if (b === null) continue;
    let inGate = false;
    const lines = b.toString("utf8").split("\n");
    for (let i = 0; i < lines.length; i += 1) {
      if (/^#{1,6}\s/.test(lines[i])) { inGate = /^#{1,6}\s+Gate\s*$/.test(lines[i]); continue; }
      if (!inGate) continue;
      const cells = splitRow(lines[i]);
      if (!cells) continue;
      const id = (cells[0] || "").replace(/`/g, "").trim();
      if (!/^S\d{3,}$/.test(id)) continue;
      if (!map.has(id)) map.set(id, []);
      map.get(id).push({ file: f, line: i + 1, text: lines[i] });
    }
  }
  return map;
}

function firstHttps(text) {
  const m = /https:\/\/[^\s)<>`|"']+/.exec(String(text || ""));
  return m ? m[0] : null;
}

function urlHost(u) {
  try { return new URL(u).hostname; } catch { return null; }
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

// The live leg must run a sandboxed renderer. Chromium sandboxes through the
// namespace sandbox (unprivileged user namespaces) or through the setuid helper
// installed next to the binary. If neither is usable, launching with
// --no-sandbox would produce a "live" transcript from an unsandboxed browser,
// so the gate refuses instead.
function sandboxStatus(binary) {
  const helper = join(dirname(binary), "chrome-sandbox");
  let setuidHelper = false;
  try {
    const st = statSync(helper);
    setuidHelper = st.uid === 0 && (st.mode & 0o4000) !== 0;
  } catch {}
  if (setuidHelper) return { refuse: false, why: `setuid ${helper}` };
  let userns = null;
  try { userns = readFileSync("/proc/sys/kernel/unprivileged_userns_clone", "utf8").trim(); } catch {}
  if (userns === "1") return { refuse: false, why: "kernel.unprivileged_userns_clone=1" };
  if (userns === null) return { refuse: false, why: "no unprivileged_userns_clone sysctl on this kernel" };
  return { refuse: true, why: `no setuid ${helper} and kernel.unprivileged_userns_clone=${userns}` };
}

export async function liveRecord({ chromedriver = "chromedriver", chromium = "/usr/lib/chromium/chromium", timeoutMs = 60000 } = {}) {
  const which = (bin) => spawnSync("sh", ["-c", `command -v "$1"`, "sh", bin], { encoding: "utf8" }).status === 0;
  if (!which(chromedriver) || !which(chromium)) throw new Refusal("chromedriver or chromium not found");
  const sandbox = sandboxStatus(chromium);
  if (sandbox.refuse) throw new Refusal(`chromium sandbox unavailable for ${chromium} (${sandbox.why}); refusing to launch the live leg unsandboxed`);
  const base = tmpdir();
  const scratch = mkdtempSync(join(base, "tabi-bidi-live-"));
  // Chromium creates its singleton socket under TMPDIR (`.org.chromium.Chromium.XXXXXX/SingletonSocket`,
  // ~46 bytes); a unix socket path over 108 bytes makes Chrome exit at launch. Hand chromium the
  // throwaway scratch as TMPDIR when it is short enough, else a throwaway dir under XDG_RUNTIME_DIR
  // (the per-user runtime dir meant for sockets); otherwise refuse. Round 33 (w1 SentinelLiveLeg S2):
  // the old fallback to the caller's TMPDIR deleted chromium dirs other processes created there.
  const runtime = process.env.XDG_RUNTIME_DIR;
  let chromeTmp = null;
  let ownChromeTmp = false;
  if (scratch.length <= 60) chromeTmp = scratch;
  else if (runtime && runtime.length <= 40) { chromeTmp = mkdtempSync(join(runtime, "tabi-bidi-")); ownChromeTmp = true; }
  else { rmSync(scratch, { recursive: true, force: true }); throw new Refusal(`no short directory for chromium's singleton socket (TMPDIR ${base.length} bytes, XDG_RUNTIME_DIR ${runtime ? runtime.length : "unset"}); set a TMPDIR of at most 40 bytes`); }
  // Round 33 (w1 SentinelLiveLeg S1): chromium opens $HOME/.pki/nssdb and $XDG_CONFIG_HOME/chromium;
  // point both at throwaway dirs inside the scratch so the operator's home is never touched.
  const home = join(scratch, "home");
  mkdirSync(join(home, ".config"), { recursive: true });
  mkdirSync(join(home, ".cache"), { recursive: true });
  mkdirSync(join(home, ".local", "share"), { recursive: true });
  mkdirSync(join(home, ".local", "state"), { recursive: true });
  const fx = await serveFixture();
  const port = await freePort();
  // Round 33 (w2 SentinelLiveV2): XDG_DATA_HOME and XDG_STATE_HOME are redirected too — this host exports
  // XDG_DATA_HOME under the real home, and chromium's NSS initialisation followed it there.
  const cd = spawn(chromedriver, [`--port=${port}`], { stdio: "ignore", env: { ...process.env, TMPDIR: chromeTmp, TMP: chromeTmp, TEMP: chromeTmp, HOME: home, XDG_CONFIG_HOME: join(home, ".config"), XDG_CACHE_HOME: join(home, ".cache"), XDG_DATA_HOME: join(home, ".local", "share"), XDG_STATE_HOME: join(home, ".local", "state") } });
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
          "goog:chromeOptions": { binary: chromium, args: ["--headless=new", "--no-first-run", "--disable-gpu", `--user-data-dir=${join(scratch, "profile")}`] } } } }) });
        body = await r.json();
      } catch { await sleep(200); }
    }
    if (!body || !body.value || !body.value.capabilities) {
      const why = JSON.stringify((body && body.value && body.value.message) || body).slice(0, 200);
      if (/sandbox|zygote|namespace/i.test(why)) throw new Refusal(`chromium sandbox failed to start (${why}); refusing to relaunch ${chromium} unsandboxed (chromium TMPDIR ${chromeTmp.length} bytes)`);
      throw new Refusal(`new session failed: ${why} (chromium TMPDIR ${chromeTmp.length} bytes)`);
    }
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
  const out = {
    schema: SCHEMA, rev, baseline, entry, receipt, live,
    population: 0, admitted: 0, failing: 0, unmeasured: 0, distinct: 0, duplicates: [],
    entryFinding: null, entryDetail: null, rows: [], provenance: [], driverImports: [],
    fixtureSha256: FIXTURE_SHA256,
  };
  const entryBuf = blob(repo, rev, entry);
  if (entryBuf === null) { out.entryFinding = "e1-entry-absent"; out.clean = false; return out; }
  const entryText = entryBuf.toString("utf8");
  const tableRows = parseTable(entryText) || [];
  out.population = tableRows.filter((r) => String(r.cells[3] == null ? "" : r.cells[3]).trim() !== "").length;
  const idCounts = new Map();
  for (const r of tableRows) idCounts.set(r.cells[0], (idCounts.get(r.cells[0]) || 0) + 1);
  out.duplicates = [...idCounts.entries()].filter(([, n]) => n > 1).map(([id]) => id);
  const regNow = parseRegistry(reg.toString("utf8"));
  const regThen = parseRegistry(regBase.toString("utf8"));
  const srcLine = (entryText.split("\n").find((l) => /^source:/i.test(l)) || "");
  const cited = [...srcLine.matchAll(/\bS\d{3,}\b/g)].map((m) => m[0]);
  const newRows = cited.filter((id) => { const r = regNow.get(id); return r && r.status === "mined" && r.usedBy.split(/[,;]/).map((x) => x.trim()).includes(entry) && !regThen.has(id); });
  if (!newRows.length) out.entryFinding = "s1-source-row";
  else {
    const gates = gateRows(repo, rev);
    const why = [];
    let witness = null;
    for (const id of newRows) {
      const row = regNow.get(id);
      const regUrl = firstHttps(row.source);
      const regHost = urlHost(regUrl);
      const gateRow = (gates.get(id) || []).find((x) => firstHttps(x.text) && HEX64.test(x.text));
      if (!gateRow) { why.push(`${id}: no corpus/lessons/round-*.md \`## Gate\` row with an https URL and a 64-hex sha256`); continue; }
      const gateHost = urlHost(firstHttps(gateRow.text));
      if (!regHost || !gateHost || regHost !== gateHost) { why.push(`${id}: registry source host ${regHost} != Gate URL host ${gateHost} (${gateRow.file}:${gateRow.line})`); continue; }
      witness = { id, gate: `${gateRow.file}:${gateRow.line}`, host: gateHost };
      break;
    }
    if (!witness) { out.entryFinding = "s1-source-row"; out.entryDetail = why.join("; "); }
  }
  // receipt
  let receiptFinding = null;
  const runs = [];
  let receiptObj = null;
  const gateBuf = blob(repo, rev, GATE_PATH);
  const rb = blob(repo, rev, receipt);
  if (rb === null) receiptFinding = "receipt absent";
  else {
    try { receiptObj = JSON.parse(rb.toString("utf8")); } catch { receiptFinding = "receipt is not JSON"; }
    if (receiptObj) {
      if (receiptObj.schema !== RECEIPT_SCHEMA) receiptFinding = "receipt schema";
      else if (receiptObj.fixtureSha256 !== FIXTURE_SHA256) receiptFinding = "fixtureSha256 is not FIXTURE's";
      else if (typeof receiptObj.browserVersion !== "string" || !receiptObj.browserVersion) receiptFinding = "no browserVersion";
      else if (typeof receiptObj.driver !== "string" || !receiptObj.driver) receiptFinding = "no driver path";
      else if (receiptObj.driver === GATE_PATH) receiptFinding = "driver is this gate's own path";
      else {
        const drv = blob(repo, rev, receiptObj.driver);
        if (drv === null) receiptFinding = `driver absent: ${receiptObj.driver}`;
        else if (sha256(drv) !== receiptObj.driverSha256) receiptFinding = `driver sha256 differs: ${receiptObj.driver}`;
        else if (gateBuf !== null && sha256(drv) === sha256(gateBuf)) receiptFinding = "driver is a byte copy of this gate";
        else {
          out.driverImports = importSpecs(drv.toString("utf8")).map((s) => ({ kind: s.kind, spec: s.spec, names: s.names }));
          const why = driverGateFinding(drv.toString("utf8"), receiptObj.driver);
          if (why) receiptFinding = why;
        }
      }
      if (!receiptFinding) {
        if (!Array.isArray(receiptObj.runs) || receiptObj.runs.length < 2) receiptFinding = "fewer than two runs";
        else {
          for (const run of receiptObj.runs) {
            const tb = blob(repo, rev, run.transcript);
            if (tb === null) { receiptFinding = `transcript absent: ${run.transcript}`; break; }
            if (sha256(tb) !== run.transcriptSha256) { receiptFinding = `transcript sha256 differs: ${run.transcript}`; break; }
            try { runs.push({ name: run.name, path: run.transcript, sha: sha256(tb), rec: recordFromTranscript(tb.toString("utf8")) }); } catch (e) { receiptFinding = `transcript unreadable: ${e.message}`; break; }
          }
        }
      }
      if (!receiptFinding) {
        if (new Set(runs.map((r) => r.path)).size !== runs.length) receiptFinding = `transcript path repeated across runs: ${runs.map((r) => r.path).join(", ")}`;
        else if (new Set(runs.map((r) => r.sha)).size !== runs.length) receiptFinding = "transcript sha256 repeated across runs (byte-identical copies)";
      }
      if (!receiptFinding) {
        const sids = [];
        for (const r of runs) {
          const s = sessionOf(r.rec);
          if (s.why) { receiptFinding = `${r.name}: ${s.why}`; break; }
          const ctxs = contextIds(r.rec);
          const bad = ctxs.filter((id) => !CONTEXT_ID.test(id));
          if (bad.length) { receiptFinding = `${r.name}: browsing-context id not ChromeDriver-shaped: ${bad.join(", ")}`; break; }
          sids.push(s.sid);
          out.provenance.push({ name: r.name, sessionId: s.sid, webSocketUrl: s.url, contexts: ctxs });
        }
        if (!receiptFinding && new Set(sids).size !== sids.length) receiptFinding = `sessionId repeated across runs: ${sids.join(", ")}`;
      }
    }
  }
  let liveRec = null;
  let liveError = null;
  if (live && out.population) {
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
  const yesIds = new Set();
  for (const r of tableRows) {
    const id = r.cells[0];
    const cell = r.cells[3] == null ? "" : r.cells[3];
    const mv = measuredVerdict(cell);
    const row = { line: r.line, id, verdict: mv.verdict, measured: mv.measured, admitted: false, reason: null, detail: null };
    if (out.entryFinding) row.reason = out.entryFinding;
    else if (!mv.measured) { row.reason = "x4-measured-cell"; row.detail = mv.detail; }
    else if (!Object.hasOwn(ROWS, id)) row.reason = "x1-row-unknown";
    else if ((idCounts.get(id) || 0) > 1) { row.reason = "x3-duplicate-id"; row.detail = `${id} appears ${idCounts.get(id)} times`; }
    else if (id === "R16" && mv.verdict === "yes") row.reason = "x2-no-counterpart";
    else if (mv.verdict === "no") {
      // unmeasured: counted in the population, never admitted, not a finding
    } else if (receiptFinding) { row.reason = "t1-receipt"; row.detail = receiptFinding; }
    else if (bindingFinding) { row.reason = "t3-binding"; row.detail = bindingFinding; }
    else {
      yesIds.add(id);
      for (const run of runs) {
        const why = PREDICATES[id](run.rec, ctx);
        if (why) { row.reason = "t2-run"; row.detail = `${run.name}: ${why}`; break; }
      }
      if (!row.reason && live) {
        const why = liveRec ? PREDICATES[id](liveRec, ctx) : `live session failed: ${liveError}`;
        if (why) { row.reason = "l1-live"; row.detail = why; }
      }
    }
    row.admitted = row.reason === null && row.verdict === "yes" && mv.measured;
    out.rows.push(row);
  }
  out.admitted = out.rows.filter((r) => r.admitted).length;
  out.failing = out.rows.filter((r) => r.reason !== null).length;
  out.unmeasured = out.rows.filter((r) => r.reason === null && r.verdict === "no").length;
  out.distinct = new Set(out.rows.filter((r) => r.verdict === "yes" && r.measured).map((r) => r.id)).size;
  out.clean = !out.entryFinding && out.population >= 1 && out.admitted >= 1 && out.failing === 0;
  return out;
}

// ---- self-test ----------------------------------------------------------------

// A synthetic record that satisfies every admittable predicate (test-only;
// exported so a round's controls can score a browserless forgery). v2 emits
// ChromeDriver-shaped session and context ids derived from the seed, so two
// calls with distinct `sessionTag` are two distinct sessions; `sessionId`,
// `contextId` and `wsHost` are test hooks for the refusal cases.
export function goldenLines({ base = "http://127.0.0.1:40000", version = "154.0.8037.97", mutate = () => {}, shotTag = "", driverVersion = "154.0.8037.97 (fixture)", sessionTag = "golden", sessionId = null, contextId = null, wsHost = "127.0.0.1", wsPort = 9515, bWsSessionSegment = null } = {}) {
  const seed = `${base}|${version}|${shotTag}|${sessionTag}|${driverVersion}`;
  const sid = sessionId === null ? sha256(`tabi-bidi-v2-session:${seed}`).slice(0, 32) : sessionId;
  const ctx = contextId === null ? sha256(`tabi-bidi-v2-context:${seed}`).toUpperCase().slice(0, 32) : contextId;
  const wsUrl = `ws://${wsHost}:${wsPort}/session/${bWsSessionSegment === null ? sid : bWsSessionSegment}`;
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
    ["cmd", "browsingContext.getTree", {}, { contexts: [{ context: ctx, url: "about:blank" }] }],
    ["cmd", "browsingContext.setViewport", { context: ctx, viewport: VIEWPORT }, {}],
    ["cmd", "network.addDataCollector", { dataTypes: ["response"], maxEncodedDataSize: 65536 }, { collector: "K1" }],
    ["ev", "network.beforeRequestSent", { request: { request: "Q1", url: a } }],
    ["ev", "network.responseCompleted", { request: { request: "Q1", url: a }, response: { url: a, status: 200, headers: [{ name: "X-Tabi-Fixture", value: S("r32") }] } }],
    ["ev", "browsingContext.load", { context: ctx, url: a }],
    ["cmd", "browsingContext.navigate", { context: ctx, url: a, wait: "complete" }, { navigation: "N1", url: a }],
    ["cmd", "script.evaluate", { expression: "window.__ready", awaitPromise: true }, { type: "success", result: S("settled") }],
    ["cmd", "script.evaluate", { expression: "window.innerWidth" }, { type: "success", result: { type: "number", value: VIEWPORT.width } }],
    ["cmd", "browsingContext.locateNodes", { context: ctx, locator: { type: "css", value: "#h" } }, { nodes: [{ type: "node", sharedId: "H", value: { localName: "h1" } }] }],
    ["cmd", "input.performActions", { actions: [{ type: "key", id: "k", actions: [..."tabi"].map((c) => ({ type: "keyDown", value: c })) }] }, {}],
    ["cmd", "script.evaluate", { expression: "document.getElementById('t').value" }, { type: "success", result: S("tabi") }],
    ["cmd", "input.performActions", { actions: [{ type: "pointer", id: "m", actions: [{ type: "pointerDown", button: 0 }, { type: "pointerUp", button: 0 }] }] }, {}],
    ["cmd", "script.evaluate", { expression: "document.getElementById('out').textContent" }, { type: "success", result: S("clicked:tabi") }],
    ["cmd", "browsingContext.captureScreenshot", { context: ctx }, { data: png.toString("base64") }],
    ["cmd", "network.getData", { dataType: "response", request: "Q2" }, { bytes: S(DATA_TEXT) }],
    ["cmd", "storage.getCookies", {}, { cookies: [{ name: "tabi_fixture", value: S("1") }] }],
    ["cmd", "network.addIntercept", { phases: ["beforeRequestSent"] }, { intercept: "I1" }],
    ["ev", "network.beforeRequestSent", { isBlocked: true, intercepts: ["I1"], request: { request: "Q3", url: `${base}/data.txt?held=1` } }],
    ["cmd", "network.continueRequest", { request: "Q3" }, {}],
    ["cmd", "browsingContext.navigate", { context: ctx, url: `${base}/b.html` }, { url: `${base}/b.html` }],
    ["cmd", "browsingContext.traverseHistory", { context: ctx, delta: -1 }, {}],
    ["cmd", "script.evaluate", { expression: "location.pathname" }, { type: "success", result: S("/a.html") }],
    ["ev", "browsingContext.userPromptOpened", { context: ctx, message: "tabi-alert" }],
    ["cmd", "browsingContext.handleUserPrompt", { context: ctx, accept: true }, {}],
  ];
  mutate(steps);
  const lines = [{ dir: "http-res", path: "/session", body: { value: { sessionId: sid, capabilities: { browserName: "chrome", browserVersion: version, chrome: { chromedriverVersion: driverVersion }, webSocketUrl: wsUrl } } } }];
  let id = 0;
  for (const [kind, method, params, result] of steps) {
    if (kind === "ev") lines.push({ dir: "recv", frame: { type: "event", method, params } });
    else { id += 1; lines.push({ dir: "send", frame: { id, method, params } }); lines.push({ dir: "recv", frame: { id, type: "success", result } }); }
  }
  return lines.map((l, k) => JSON.stringify({ seq: k + 1, ...l })).join("\n") + "\n";
}

const ALL_OK = ["R1", "R2", "R3", "R4", "R5", "R6", "R7", "R8", "R9", "R10", "R11", "R12", "R13", "R14", "R15", "R17"];
const ENTRY = "corpus/knowledge/bidi-fixture.md";
const LESSONS = "corpus/lessons/round-33.md";
const GATE_IN_FIXTURE = GATE_PATH;

function entryDoc(o) {
  const rows = o.entryRows || (o.ids || ALL_OK).map((id, k) => [id, o.cell ? o.cell(id, k) : "yes"]);
  const all = o.extraRows ? rows.concat(o.extraRows) : rows;
  return [`source: ${o.source || "S002"} — fixture`, "verified-at: fixture", "recheck: fixture", "", "| Row | Surface | BiDi method | Measured | Evidence |", "|---|---|---|---|---|",
    ...all.map(([id, cell]) => `| ${id} | ${ROWS[id] || "x"} | m | ${cell} | receipt |`), ""].join("\n");
}

function regDoc(rows) {
  return ["# SOURCES", "", "| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |", "|---|---|---|---|---|---|---|---|---|---|---|",
    ...rows.map(([id, usedBy]) => `| ${id} | t — https://e.test/ | spec | A | s | a | t | mined | 2026-10-26 | 90d | ${usedBy} |`), ""].join("\n");
}

// The round lesson's `## Gate` table: a row per S-id with an https URL and a
// 64-hex sha256 in the same row (the shape corpus/lessons/round-32.md uses).
function lessonsDoc(ids, o = {}) {
  // bGateRowNoSha: the `## Gate` row keeps its https URL and quote but loses the
  // 64-hex sha256, so only the digest requirement can refuse it.
  const accessed = (id) => (o.bGateRowNoSha ? "2026-10-26T00:00:00Z (HTTP 200, 12 B)" : `2026-10-26T00:00:00Z (HTTP 200, 12 B, sha256 \`${"a".repeat(64)}\`)`);
  return ["# fixture round lesson", "", "## Gate", "",
    "| row | URL | accessed | receipt quote |",
    "|---|---|---|---|",
    ...ids.map((id) => `| ${id} | https://e.test/${id.toLowerCase()} | ${accessed(id)} | "fixture receipt quote" |`), "",
    "## Mistakes", "", "- none.", ""].join("\n");
}

function pngHeader(w, h) {
  const b = Buffer.alloc(32);
  Buffer.from("89504e470d0a1a0a", "hex").copy(b, 0);
  b.write("IHDR", 12, "ascii");
  b.writeUInt32BE(w, 16);
  b.writeUInt32BE(h, 20);
  return b.toString("base64");
}

const reorder = (expr, method) => (s) => {
  const k = s.findIndex((x) => x[2] && x[2].expression === expr);
  const [e] = s.splice(k, 1);
  const j = s.findIndex((x) => x[1] === method);
  s.splice(j, 0, e);
};

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
  { id: "driver-is-the-counter", exit: 1, admitted: 0, reason: "t1-receipt", build: () => ({ driverPath: GATE_PATH }) },
  // ---- v2 receipt-provenance cases: one per battery construction F1..F8 ----
  { id: "v2-f1-golden-splice", exit: 1, admitted: 0, reason: "t1-receipt", build: () => ({ run1: { sessionId: "X", contextId: "C1" }, run2: { sessionId: "X", contextId: "C1", base: "http://127.0.0.1:40001" } }) },
  { id: "v2-f2-duplicate-ids", exit: 1, admitted: 0, reason: "x3-duplicate-id", build: () => ({ ids: Array(16).fill("R2") }) },
  { id: "v2-f3-same-path-twice", exit: 1, admitted: 0, reason: "t1-receipt", build: () => ({ samePath: true }) },
  { id: "v2-f4-byte-copy", exit: 1, admitted: 0, reason: "t1-receipt", build: () => ({ sameBytes: true }) },
  { id: "v2-f5-driver-is-gate-copy", exit: 1, admitted: 0, reason: "t1-receipt", build: () => ({ gateBlob: true, driverCopyOfGate: true }) },
  { id: "v2-f6-driver-reexports-gate", exit: 1, admitted: 0, reason: "t1-receipt", build: () => ({ driverPath: "corpus/evidence/round-32/bidi/f6-driver.mjs", driverText: 'export * from "../../../../scripts/check-bidi-runtime.mjs";\n' }) },
  { id: "v2-f7-decorated-measured", exit: 1, admitted: 15, reason: "x4-measured-cell", build: () => ({ cell: (id, k) => (k === 0 ? "yes (live)" : "yes") }) },
  { id: "v2-f8-junk-source-row", exit: 1, admitted: 0, reason: "s1-source-row", build: () => ({ source: "S990", regExtra: [["S990", ENTRY]] }) },
  // ---- v2 cases: one per round-32 MutC1 survivor (M04, M06, M09, M10, M11,
  //      M14, M17, M18, M19); each FAILS when that mutant is re-applied ----
  { id: "v2-m04-runs-chromedriver-differ", exit: 1, admitted: 0, reason: "t3-binding", build: () => ({ run2: { driverVersion: "155.0.0.0 (other)" } }) },
  { id: "v2-m06-error-frame-as-success", exit: 1, admitted: 0, reason: "t2-run", build: () => ({ ids: ["R2"], errorWithResult: "browsingContext.getTree" }) },
  { id: "v2-m09-readout-before-typing", exit: 1, admitted: 0, reason: "t2-run", build: () => ({ ids: ["R9"], mutate: reorder("document.getElementById('t').value", "input.performActions") }) },
  { id: "v2-m10-pathname-before-traverse", exit: 1, admitted: 0, reason: "t2-run", build: () => ({ ids: ["R14"], mutate: reorder("location.pathname", "browsingContext.traverseHistory") }) },
  { id: "v2-m11-driver-sha-differs", exit: 1, admitted: 0, reason: "t1-receipt", build: () => ({ driverSha: "0".repeat(64) }) },
  { id: "v2-m14-browser-version-same-major", exit: 1, admitted: 0, reason: "t2-run", build: () => ({ ids: ["R1"], version: "154.9.9" }) },
  { id: "v2-m17-ws-url-off-loopback", exit: 1, admitted: 0, reason: "t1-receipt", build: () => ({ ids: ["R1"], run1: { wsHost: "10.0.0.1" }, run2: { wsHost: "10.0.0.1" } }) },
  { id: "v2-m18-png-wrong-dimensions", exit: 1, admitted: 0, reason: "t2-run", build: () => ({ ids: ["R4"], mutate: (s) => { s.find((x) => x[1] === "browsingContext.captureScreenshot")[3] = { data: pngHeader(100, 100) }; } }) },
  { id: "v2-m19-unmeasured-row-counted", exit: 0, admitted: 16, reason: null, population: 17, build: () => ({ extraRows: [["R16", "no"]] }) },
  // ---- v3 (seat A): one case per round-33 w2 MutGateV2 survivor assigned to
  //      this seat (M01, M03, M06, M08, M09, M10); each case FAILS when that
  //      mutant is re-applied. A case observes the gate's runnable refusal
  //      (exit, admitted, population, first finding id and detail), never the
  //      gate's own source text.
  // M01: the duplicate-id threshold is 2, not 3 — an id listed exactly TWICE is
  //      a finding on both rows, not an admitted pair.
  { id: "v3-a-m01-duplicate-id-twice", exit: 1, admitted: 0, reason: "x3-duplicate-id", population: 2, build: () => ({ ids: ["R2", "R2"] }) },
  // M03: the Measured verdict is case-folded — `Yes` is a measured yes and the
  //      only two rows are admitted (the mutant reads it as neither yes nor no,
  //      leaving population without an admitted row).
  { id: "v3-a-m03-measured-cell-uppercase", exit: 0, admitted: 2, reason: null, population: 2, build: () => ({ ids: ["R1", "R2"], cell: () => "Yes" }) },
  // M06: an upper-case 32-hex sessionId is refused BY THE SESSION-SHAPE CHECK
  //      (S127: ChromeDriver 154 mints 32 lower-case hex, util.cc GenerateId).
  //      The synthesised webSocketUrl carries the same upper-case id, so a gate
  //      that only widened the shape would refuse later, naming the ws url.
  { id: "v3-a-m06-session-id-uppercase", exit: 1, admitted: 0, reason: "t1-receipt", population: 1, detailIncludes: "sessionId is not 32 lowercase hex", build: () => { const upper = sha256("tabi-v3-a-session").slice(0, 32).toUpperCase(); return { ids: ["R2"], run1: { sessionId: upper }, run2: { sessionId: upper } }; } },
  // M08: a browsing-context id is 32 UPPER-case hex; a lower-case 32-hex id is
  //      a synthesised transcript (round-32 evidence: "context":"31B8FE9C..."
  //      in corpus/evidence/round-32/bidi/run1/transcript.jsonl) and refused.
  { id: "v3-a-m08-context-id-lowercase", exit: 1, admitted: 0, reason: "t1-receipt", population: 16, build: () => { const lower = sha256("tabi-v3-a-context").slice(0, 32); return { run1: { contextId: lower }, run2: { contextId: lower } }; } },
  // M09: the driver allow-list is closed — an import of the gate-internal ROWS
  //      table is a t1 finding, whatever else the driver imports.
  { id: "v3-a-m09-driver-imports-rows", exit: 1, admitted: 0, reason: "t1-receipt", population: 16, build: () => ({ driverText: 'import { FIXTURE, ROWS } from "./check-bidi-runtime.mjs";\n' }) },
  // M10: the honest round-32 driver imports FIXTURE_SHA256, VIEWPORT and
  //      serveFixture; all three stay admitted (the allow-list loses nothing).
  { id: "v3-a-m10-driver-imports-servefixture", exit: 0, admitted: 16, reason: null, population: 16, build: () => ({ driverText: 'import { FIXTURE_SHA256, VIEWPORT, serveFixture } from "./check-bidi-runtime.mjs";\n' }) },
  // ---- v3-B cases: one per round-34 C2 mutant assigned to seat ExecKillsB
  //      (M04, M05, M07, M16, M18, M19). Each FAILS when that mutant is applied.
  // M04: both runs cite one transcript path. The byte-identity rule behind it
  // refuses the same fixture, so this case pins WHICH finding fired (detailIncludes).
  { id: "v3-b-m04-transcript-path-repeated", exit: 1, admitted: 0, reason: "t1-receipt", detailIncludes: "transcript path repeated across runs", build: () => ({ samePath: true }) },
  // M05: identical bytes under two distinct paths (the path rule is silent by design).
  { id: "v3-b-m05-transcript-sha-repeated", exit: 1, admitted: 0, reason: "t1-receipt", detailIncludes: "transcript sha256 repeated across runs", build: () => ({ sameBytes: true }) },
  // M07: run1's webSocketUrl carries a ChromeDriver-shaped session id (S127 shape,
  // 32 lower-case hex) that is not that session's sessionId.
  { id: "v3-b-m07-ws-session-segment-unbound", exit: 1, admitted: 0, reason: "t1-receipt", detailIncludes: "webSocketUrl session segment", build: () => ({ run1: { bWsSessionSegment: "b".repeat(32) } }) },
  // M16: the `## Gate` row for the cited registry id keeps its https URL and quote
  // but carries no 64-hex sha256.
  { id: "v3-b-m16-gate-row-without-sha", exit: 1, admitted: 0, reason: "s1-source-row", population: 16, build: () => ({ bGateRowNoSha: true }) },
  // M18: a valid receipt and entry whose every row is unmeasured ("no"), so the
  // population is non-empty and nothing is admitted.
  { id: "v3-b-m18-clean-with-zero-admitted", exit: 1, admitted: 0, reason: null, population: 16, build: () => ({ cell: () => "no" }) },
  // M19: two runs whose sessions carry the same 32-lower-case-hex sessionId (S127
  // shape) while their transcripts differ (distinct sessionTag ⇒ distinct bytes).
  { id: "v3-b-m19-sessionid-repeated", exit: 1, admitted: 0, reason: "t1-receipt", detailIncludes: "sessionId repeated across runs", build: () => ({ run1: { sessionId: "0f1e2d3c4b5a69788796a5b4c3d2e1f0" }, run2: { sessionId: "0f1e2d3c4b5a69788796a5b4c3d2e1f0" } }) },
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
  const gateSource = readFileSync(fileURLToPath(import.meta.url));
  for (const c of CASES) {
    const o = c.build();
    const fx = makeFixture();
    try {
      fx.put(SOURCES_PATH, regDoc([["S001", ENTRY]]));
      fx.put(LESSONS, lessonsDoc(["S002"], o));
      const baseline = fx.commit();
      const usedBy = o.usedBy || ENTRY;
      const regAtRev = [["S001", ENTRY], ["S002", usedBy]].concat(o.regExtra || []);
      fx.put(SOURCES_PATH, regDoc(regAtRev));
      if (!o.noEntry) fx.put(ENTRY, entryDoc(o));
      const runsN = o.runs || 2;
      const texts = [];
      for (let k = 1; k <= runsN; k += 1) {
        const opt = { base: o.base, version: o.version, mutate: o.mutate, shotTag: o.shotPerRun ? `run${k}` : "", sessionTag: `run${k}` };
        if (k === 1 && o.run1) Object.assign(opt, o.run1);
        if (k === 2 && o.run2) Object.assign(opt, o.run2);
        let text = goldenLines(opt);
        if (o.errorMethod || o.errorWithResult) {
          const ls = text.trim().split("\n").map((l) => JSON.parse(l));
          const method = o.errorMethod || o.errorWithResult;
          const sent = ls.find((l) => l.dir === "send" && l.frame.method === method);
          const resp = ls.find((l) => l.dir === "recv" && l.frame.id === sent.frame.id);
          resp.frame = o.errorWithResult
            ? { id: sent.frame.id, type: "error", error: "unknown command", message: "x", result: resp.frame.result }
            : { id: sent.frame.id, type: "error", error: "unknown command", message: "x" };
          text = ls.map((l) => JSON.stringify(l)).join("\n") + "\n";
        }
        texts.push(text);
      }
      if (o.samePath && runsN >= 2) texts[1] = texts[0];
      if (o.sameBytes && runsN >= 2) texts[1] = texts[0];
      const runs = [];
      for (let k = 1; k <= runsN; k += 1) {
        const rel = `corpus/evidence/round-32/bidi/run${k}/transcript.jsonl`;
        const cite = o.samePath && k === 2 ? "corpus/evidence/round-32/bidi/run1/transcript.jsonl" : rel;
        fx.put(rel, texts[k - 1]);
        runs.push({ name: `run${k}`, transcript: cite, transcriptSha256: o.tamper && k === 2 ? sha256("x") : sha256(Buffer.from(texts[k - 1])) });
      }
      const driver = o.driverPath || "scripts/bidi-driver-fixture.mjs";
      const driverBytes = o.driverCopyOfGate ? gateSource : Buffer.from(o.driverText || "// fixture driver\n");
      if (!o.noDriver) fx.put(driver, driverBytes);
      if (o.gateBlob) fx.put(GATE_IN_FIXTURE, gateSource);
      fx.put(DEFAULT_RECEIPT, JSON.stringify({
        schema: RECEIPT_SCHEMA,
        fixtureSha256: o.fixtureSha || FIXTURE_SHA256,
        browserVersion: "154.0.8037.97",
        driver,
        driverSha256: o.driverSha || sha256(driverBytes),
        runs,
      }, null, 2));
      const rev = fx.commit();
      const liveRunner = async () => {
        if (o.live === "golden") return recordFromTranscript(goldenLines({ sessionTag: "live" }));
        if (o.live === "noCookies") return recordFromTranscript(goldenLines({ sessionTag: "live", mutate: (s) => { s.splice(s.findIndex((x) => x[1] === "storage.getCookies"), 1); } }));
        if (o.live === "otherShot") return recordFromTranscript(goldenLines({ sessionTag: "live", shotTag: "live" }));
        if (o.live === "otherDriver") return recordFromTranscript(goldenLines({ sessionTag: "live", driverVersion: "155.0.0.0 (other)" }));
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
        out = { admitted: 0, population: 0, rows: [], entryFinding: "refused" };
      }
      const reason = out.entryFinding || (out.rows.find((r) => !r.admitted) || {}).reason || null;
      // v3 (round 34, seats A and B): a case may also pin WHICH check refused (the first finding's
      // detail), so a rule that is only observable in the refusal's message —
      // e.g. the session-id shape, which otherwise reads as a generic t1-receipt —
      // is still exercised. The detail is gate output, never the gate's bytes.
      const firstDetail = out.entryDetail || (out.rows.find((r) => !r.admitted) || {}).detail || null;
      const pass = exit === c.exit && out.admitted === c.admitted && reason === c.reason
        && (c.population === undefined || out.population === c.population)
        && (c.detailIncludes === undefined || (typeof firstDetail === "string" && firstDetail.includes(c.detailIncludes)));
      results.push({ id: c.id, ok: pass, expectedExit: c.exit, exit, expectedAdmitted: c.admitted, admitted: out.admitted, expectedPopulation: c.population === undefined ? null : c.population, population: out.population, expectedReason: c.reason, reason, detail: firstDetail, expectedDetailIncludes: c.detailIncludes === undefined ? null : c.detailIncludes });
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
      results.push({ id, ok: exit === 2, expectedExit: 2, exit, expectedAdmitted: 0, admitted: 0, expectedPopulation: null, population: 0, expectedReason: "refused", reason: exit === 2 ? "refused" : null });
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
      for (const r of out.results) console.log(`CASE id=${r.id} expected_exit=${r.expectedExit} exit=${r.exit} expected_admitted=${r.expectedAdmitted} admitted=${r.admitted} expected_population=${r.expectedPopulation ?? "-"} population=${r.population} expected_reason=${r.expectedReason ?? "-"} reason=${r.reason ?? "-"} ${r.ok ? "PASS" : "FAIL"}`);
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
    for (const r of out.rows) console.log(`ROW id=${r.id} line=${r.line} measured=${r.verdict ?? "-"} ${r.admitted ? "admitted" : r.reason === null ? "unmeasured" : `reason=${r.reason}${r.detail ? ` detail=${JSON.stringify(r.detail)}` : ""}`}`);
    console.log(`BIDI_RUNTIME verdict=${out.clean ? "clean" : "failed"} rev=${out.rev} population=${out.population} admitted=${out.admitted} failing=${out.failing} unmeasured=${out.unmeasured} distinct=${out.distinct}${out.entryFinding ? ` entry=${out.entryFinding}` : ""} live=${out.live}`);
  }
  process.exit(out.clean ? 0 : 1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
