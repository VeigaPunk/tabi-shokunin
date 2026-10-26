// CritC1Predicates: acceptance-boundary probes. Each probe builds the MINIMUM
// record that satisfies a predicate while the matrix row's stated contract is
// unmet, to separate "holds for a narrow observation" from "evidences the row".
import { PREDICATES, ROWS, DATA_TEXT, FIXTURE_HEADER } from "./clone/scripts/check-bidi-runtime.mjs";

const ok = (result) => ({ type: "success", result });
const S = (value) => ({ type: "string", value });
const rec = (cmds = [], events = [], newSession = null) => ({ newSession, cmds, events });
const cmd = (i, method, params, result) => ({ i, id: i, method, params, response: { id: i, type: "success", result } });
const ev = (i, method, params) => ({ i, method, params });
const run = (id, r, ctx = { browserVersion: "154.0.8037.97" }) => ({ id, why: PREDICATES[id](r, ctx) });

const BASE = "http://127.0.0.1:40000";
const A = `${BASE}/a.html`;
const probes = [];
const add = (id, note, why) => probes.push({ predicate: id, minimalRecordPasses: why === null, note, why });

// R1: matrix counterpart is `session.new` result capabilities. Probe uses ONLY
// the classic /session response plus one arbitrary successful command.
const classic = { value: { sessionId: "X", capabilities: { browserName: "chrome", browserVersion: "154.0.8037.97", webSocketUrl: "ws://127.0.0.1:1/session/X" } } };
add("R1", "no session.new command anywhere; identity read from classic /session", run("R1", rec([cmd(2, "browsingContext.getTree", {}, { contexts: [{ context: "C" }] })], [], classic)).why);

// R2: matrix row is target inventory. Probe returns ONE context id, no url, no
// children: no tree, no target types.
add("R2", "getTree returns a single bare context id (no url/tree/target types)", run("R2", rec([cmd(1, "browsingContext.getTree", {}, { contexts: [{ context: "C" }] })])).why);

// R3: matrix counterpart lists 5 navigation events; probe supplies only `load`.
add("R3", "navigate+load only; started/committed/failed/domContentLoaded absent", run("R3", rec(
  [cmd(1, "browsingContext.navigate", { url: A }, { navigation: "N", url: A })],
  [ev(2, "browsingContext.load", { url: A })])).why);

// R4: matrix row is the L7 full-page screenshot; probe has no origin/clip and a
// header-only 640x480 PNG.
const png = Buffer.alloc(24);
Buffer.from("89504e470d0a1a0a", "hex").copy(png, 0);
png.write("IHDR", 12, "ascii"); png.writeUInt32BE(640, 16); png.writeUInt32BE(480, 20);
add("R4", "AMP-short 24-byte PNG (signature+IHDR only), no origin/clip request", run("R4", rec(
  [cmd(1, "browsingContext.captureScreenshot", { context: "C" }, { data: png.toString("base64") })])).why);

// R5: matrix row is DOM shape/state; probe returns localName only, no attributes,
// no childNodeCount, no snapshot.
add("R5", "locateNodes returns {value:{localName:'h1'}} only", run("R5", rec(
  [cmd(1, "browsingContext.locateNodes", { locator: { type: "css", value: "#h" } }, { nodes: [{ sharedId: "H", value: { localName: "h1" } }] })])).why);

// R6: matrix gap says await/return mapping unmeasured; probe shows only that the
// awaited value string is returned.
add("R6", "awaitPromise on one promise->string; no callFunction, no object mapping", run("R6", rec(
  [cmd(1, "script.evaluate", { expression: "window.__ready", awaitPromise: true }, ok(S("settled")))])).why);

// R7: matrix row is the viewport pin; probe never reads devicePixelRatio and
// never sets it.
add("R7", "setViewport dims + innerWidth only; devicePixelRatio never asserted", run("R7", rec(
  [cmd(1, "browsingContext.setViewport", { context: "C", viewport: { width: 640, height: 480 } }, {}),
   cmd(2, "script.evaluate", { expression: "window.innerWidth" }, ok({ type: "number", value: 640 }))])).why);

// R8: matrix row is click input. Probe's pointer action has NO origin/target:
// the click could land anywhere.
add("R8", "pointerDown/pointerUp with no origin; #out readout unbound to the pointer", run("R8", rec(
  [cmd(1, "input.performActions", { actions: [{ type: "pointer", id: "m", actions: [{ type: "pointerDown", button: 0 }, { type: "pointerUp", button: 0 }] }] }, {}),
   cmd(2, "script.evaluate", { expression: "document.getElementById('out').textContent" }, ok(S("clicked:tabi")))])).why);

// R9: matrix gap is insertText absence + unmeasured fast-insertion side-effects.
// Probe shows keyDown-only (no keyUp) satisfies the typing predicate.
add("R9", "keyDown actions only (no keyUp), no side-effect parity measured", run("R9", rec(
  [cmd(1, "input.performActions", { actions: [{ type: "key", id: "k", actions: [..."tabi"].map((c) => ({ type: "keyDown", value: c })) }] }, {}),
   cmd(2, "script.evaluate", { expression: "document.getElementById('t').value" }, ok(S("tabi")))])).why);

// R10: matrix note says "subscribe with session.subscribe first"; probe never
// subscribes and omits responseStarted/fetchError.
add("R10", "no session.subscribe; only beforeRequestSent+responseCompleted", run("R10", rec(
  [cmd(1, "browsingContext.navigate", { url: A }, { url: A })],
  [ev(2, "network.beforeRequestSent", { request: { url: A } }), ev(3, "network.responseCompleted", { response: { url: A } })])).why);

// R11: matrix rows says raw ExtraInfo header block and original status line are
// NOT defined. Probe: status + one serialized header, nothing else.
add("R11", "status+one serialized header; no raw header block/status line", run("R11", rec(
  [cmd(1, "browsingContext.navigate", { url: A }, { url: A })],
  [ev(2, "network.responseCompleted", { response: { url: A, status: 200, headers: [{ name: FIXTURE_HEADER[0], value: S(FIXTURE_HEADER[1]) }] } })])).why);

// R12: matrix row is byte truth. Probe: getData for an UNRELATED request id
// (no /data.txt provenance) whose bytes happen to equal the fixture text.
add("R12", "getData request id is unrelated to any /data.txt event; disownData unused", run("R12", rec(
  [cmd(1, "network.addDataCollector", { dataTypes: ["response"] }, {}),
   cmd(2, "network.getData", { dataType: "response", request: "UNRELATED" }, { bytes: S(DATA_TEXT) })])).why);

// R13: matrix counterpart names continueRequest/failRequest/provideResponse;
// probe exercises only continue.
add("R13", "continueRequest only; failRequest/provideResponse unexercised", run("R13", rec(
  [cmd(1, "network.addIntercept", { phases: ["beforeRequestSent"] }, { intercept: "I" }),
   cmd(3, "network.continueRequest", { request: "Q" }, {})],
  [ev(2, "network.beforeRequestSent", { isBlocked: true, intercepts: ["I"], request: { request: "Q", url: `${BASE}/data.txt` } })])).why);

// R14: matrix row is the history witness and says the WD defines NO command
// returning the history-entry list. Probe: empty traverseHistory result + pathname.
add("R14", "traverseHistory result is empty {}; no entry list, only pathname", run("R14", rec(
  [cmd(1, "browsingContext.navigate", { url: `${BASE}/b.html` }, { url: `${BASE}/b.html` }),
   cmd(2, "browsingContext.traverseHistory", { delta: -1 }, {}),
   cmd(3, "script.evaluate", { expression: "location.pathname" }, ok(S("/a.html")))])).why);

// R15: matrix gap: partition/scope must be matched explicitly, not assumed
// browser-wide. Probe: no filter, no partitionKey read.
add("R15", "unfiltered getCookies; no partitionKey/scope assertion", run("R15", rec(
  [cmd(1, "storage.getCookies", {}, { cookies: [{ name: "tabi_fixture", value: S("1") }] })])).why);

// R17: matrix row says this is NOT currently a tabi surface (no CDP anchor).
add("R17", "prompt opened+handled; no userPromptClosed; not a tabi surface", run("R17", rec(
  [cmd(2, "browsingContext.handleUserPrompt", { accept: true }, {})],
  [ev(1, "browsingContext.userPromptOpened", { message: "tabi-alert" })])).why);

console.log(JSON.stringify({ schema: "critc1-probe-v1", rows: Object.keys(ROWS).length, probes }, null, 2));
const overreaching = probes.filter((p) => p.minimalRecordPasses);
console.log(`PROBE rows=${probes.length} minimal_records_accepted=${overreaching.length} rejected=${probes.length - overreaching.length}`);
