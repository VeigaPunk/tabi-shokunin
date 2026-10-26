// CritC1Predicates: run the frozen counter's own live leg once, then report per
// row (a) the predicate verdict and (b) the observed field set the predicate
// keys on. Read-only over the clone; writes one transcript JSONL to argv[2].
import { writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { liveRecord, PREDICATES, ROWS, FIXTURE_HEADER, VIEWPORT, DATA_TEXT } from "./clone/scripts/check-bidi-runtime.mjs";

const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const t0 = Date.now();
const rec = await liveRecord({ chromedriver: "/usr/bin/chromedriver", chromium: "/usr/bin/chromium" });
// Serialise to the counter's own transcript format so the receipt shape is honest.
const lines = [{ seq: 1, dir: "http-res", path: "/session", body: rec.newSession }];
let seq = 1;
for (const c of rec.cmds) {
  seq += 1; lines.push({ seq, dir: "send", frame: { id: c.id, method: c.method, params: c.params } });
  seq += 1; lines.push({ seq, dir: "recv", frame: c.response });
}
for (const e of rec.events) { seq += 1; lines.push({ seq, dir: "recv", frame: { type: "event", method: e.method, params: e.params } }); }
const text = lines.map((l) => JSON.stringify(l)).join("\n") + "\n";
writeFileSync(process.argv[2], text);

const out = { elapsedMs: Date.now() - t0, transcriptSha256: sha256(Buffer.from(text)), cmds: rec.cmds.length, events: rec.events.length, rows: {}, evidence: {} };
const caps = (rec.newSession && rec.newSession.value && rec.newSession.value.capabilities) || {};
out.evidence.newSessionKeys = Object.keys(caps);
out.evidence.browserName = caps.browserName;
out.evidence.browserVersion = caps.browserVersion;
out.evidence.webSocketUrl = caps.webSocketUrl;
out.evidence.chromedriverVersion = caps.chrome && caps.chrome.chromedriverVersion;

const ctx = { browserVersion: caps.browserVersion };
for (const id of Object.keys(ROWS)) out.rows[id] = { surface: ROWS[id], why: PREDICATES[id](rec, ctx) };

const ok = (c) => c.response && c.response.type === "success";
const res = (c) => (c && c.response && c.response.result) || {};
const pick = (m) => rec.cmds.filter((c) => c.method === m);

// R1: where identity actually comes from
out.evidence.r1_identitySource = "http-res /session value.capabilities (classic new-session)";

// R2: tree shape
const tree = pick("browsingContext.getTree").find(ok);
out.evidence.r2_contexts = (res(tree).contexts || []).map((x) => ({ keys: Object.keys(x).sort(), context: x.context, url: x.url, children: Array.isArray(x.children) ? undefined : null }));

// R3: navigate + which bidi events were seen
const nav = pick("browsingContext.navigate").find(ok);
out.evidence.r3_navigateResultKeys = Object.keys(res(nav)).sort();
out.evidence.r3_eventNames = [...new Set(rec.events.map((e) => e.method))].sort();

// R4: screenshot geometry and the params used
const shot = pick("browsingContext.captureScreenshot").find(ok);
const png = Buffer.from(String(res(shot).data || ""), "base64");
out.evidence.r4_shotParams = shot.params;
out.evidence.r4_png = { bytes: png.length, sig: png.toString("hex", 0, 8), ihdr: png.toString("ascii", 12, 16), width: png.length >= 24 ? png.readUInt32BE(16) : null, height: png.length >= 24 ? png.readUInt32BE(20) : null, sha256: sha256(png) };

// R5: locateNodes payload
const locs = pick("browsingContext.locateNodes").filter(ok);
out.evidence.r5_locateNodes = locs.map((c) => ({ locator: c.params.locator, nodes: (res(c).nodes || []).map((n) => ({ keys: Object.keys(n).sort(), localName: n.value && n.value.localName, valueKeys: n.value ? Object.keys(n.value).sort() : null, childNodeCount: n.value && n.value.childNodeCount })) }));

// R6/R7/R8/R9/R14: script.evaluate results
out.evidence.scriptEvaluates = pick("script.evaluate").filter(ok).map((c) => ({ expression: c.params.expression, awaitPromise: c.params.awaitPromise === true, resultType: res(c).result && res(c).result.type, value: res(c).result && res(c).result.value }));
const vp = pick("browsingContext.setViewport").find(ok);
out.evidence.r7_setViewportParams = vp && vp.params;
out.evidence.r7_devicePixelRatioObserved = (() => { try { return null; } catch { return null; } })();

// R8/R9: performActions shapes
out.evidence.performActions = pick("input.performActions").filter(ok).map((c) => (c.params.actions || []).map((s) => ({ type: s.type, id: s.id, actionTypes: (s.actions || []).map((a) => a.type), origins: (s.actions || []).map((a) => a.origin && (a.origin.type || "string")), values: (s.actions || []).map((a) => a.value) })));

// R10/R11: network events with ResponseData field sets
out.evidence.networkEvents = rec.events.filter((e) => /^network\./.test(e.method)).map((e) => ({ method: e.method, url: (e.params.request && e.params.request.url) || (e.params.response && e.params.response.url), isBlocked: e.params.isBlocked, keys: Object.keys(e.params).sort(), responseKeys: e.params.response ? Object.keys(e.params.response).sort() : null, status: e.params.response && e.params.response.status, statusText: e.params.response && e.params.response.statusText, headers: e.params.response && (e.params.response.headers || []).map((h) => ({ name: h.name, valueType: typeof h.value, valueKind: h.value && h.value.type, value: h.value && h.value.value })) }));

// R12: collector + getData
out.evidence.r12 = {
  collectors: pick("network.addDataCollector").map((c) => ({ ok: ok(c), dataTypes: c.params.dataTypes, maxEncodedDataSize: c.params.maxEncodedDataSize })),
  getData: pick("network.getData").map((c) => ({ ok: ok(c), params: c.params, bytesType: res(c).bytes && res(c).bytes.type, bytesEqFixture: res(c).bytes && res(c).bytes.value === DATA_TEXT, keys: Object.keys(res(c)).sort() })),
  disown: pick("network.disownData").length,
};

// R13: intercept/continue
const ic = pick("network.addIntercept").find(ok);
out.evidence.r13 = { intercept: ic && res(ic).intercept, phases: ic && ic.params.phases, continues: pick("network.continueRequest").map((c) => ({ ok: ok(c), request: c.params.request })) };

// R14: traverse
out.evidence.r14 = pick("browsingContext.traverseHistory").map((c) => ({ ok: ok(c), params: c.params, resultKeys: Object.keys(res(c)).sort() }));

// R15: cookies (partitionKey present?)
const ck = pick("storage.getCookies").find(ok);
out.evidence.r15 = { resultKeys: Object.keys(res(ck)).sort(), cookies: (res(ck).cookies || []).map((k) => ({ keys: Object.keys(k).sort(), name: k.name, value: k.value && k.value.value, domain: k.domain, path: k.path })) };

// R17: prompt
out.evidence.r17 = { opened: rec.events.filter((e) => e.method === "browsingContext.userPromptOpened").map((e) => ({ message: e.params.message, keys: Object.keys(e.params).sort() })), handled: pick("browsingContext.handleUserPrompt").map((c) => ({ ok: ok(c), params: c.params })) };

console.log(JSON.stringify(out, null, 2));
