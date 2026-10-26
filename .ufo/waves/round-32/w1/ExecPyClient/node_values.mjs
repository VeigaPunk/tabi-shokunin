// Extracts, from the counter's own liveRecord session, the same value set the
// Python client records, so the report can show a Python-vs-Node value table.
import { createHash } from "node:crypto";
import { liveRecord } from "./clone/scripts/check-bidi-runtime.mjs";

const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const okc = (c) => c && c.response && c.response.type === "success";
const res = (c) => (c && c.response && c.response.result) || {};
const strVal = (rv) => (rv && rv.type === "string" ? rv.value : undefined);
const decodeBytes = (bv) => {
  if (!bv) return undefined;
  if (bv.type === "string") return bv.value;
  if (bv.type === "base64") return Buffer.from(bv.value, "base64").toString("utf8");
  return undefined;
};

const rec = await liveRecord();
const firstShot = rec.cmds.find((c) => c.method === "browsingContext.captureScreenshot" && okc(c));
const shotBuf = Buffer.from(String(res(firstShot).data || ""), "base64");
const caps = (rec.newSession && rec.newSession.value && rec.newSession.value.capabilities) || {};
const tree = rec.cmds.find((c) => c.method === "browsingContext.getTree" && okc(c));
const locH = rec.cmds.find((c) => c.method === "browsingContext.locateNodes" && okc(c) && c.params.locator && c.params.locator.value === "#h");
const locNodes = locH ? res(locH).nodes || [] : [];
const ev = (expr) => {
  const c = rec.cmds.filter((c) => c.method === "script.evaluate" && c.params.expression === expr && okc(c)).pop();
  return c ? res(c).result : undefined;
};
const navBase = (() => {
  for (const c of rec.cmds) {
    if (c.method !== "browsingContext.navigate" || !okc(c)) continue;
    try {
      const u = new URL(c.params.url);
      if (u.pathname === "/a.html") return u.origin;
    } catch { /* not a url */ }
  }
  return null;
})();
const aUrl = navBase ? `${navBase}/a.html` : null;
const aDone = rec.events.find((e) => e.method === "network.responseCompleted" && e.params.response && e.params.response.url === aUrl);
const headerValue = (headers, name) => {
  for (const h of headers || []) if (String(h.name).toLowerCase() === name) return strVal(h.value) ?? (typeof h.value === "string" ? h.value : undefined);
  return undefined;
};
const collector = rec.cmds.find((c) => c.method === "network.addDataCollector" && okc(c));
const getData = rec.cmds.find((c) => c.method === "network.getData" && okc(c));
const intercept = rec.cmds.find((c) => c.method === "network.addIntercept" && okc(c));
const icId = intercept ? res(intercept).intercept : null;
const blocked = rec.events.find((e) => e.method === "network.beforeRequestSent" && e.params.isBlocked === true && (e.params.intercepts || []).includes(icId));
const cont = blocked ? rec.cmds.find((c) => c.method === "network.continueRequest" && okc(c)) : null;
const traverse = rec.cmds.find((c) => c.method === "browsingContext.traverseHistory" && okc(c));
const path = rec.cmds.filter((c) => c.method === "script.evaluate" && c.params.expression === "location.pathname" && okc(c)).pop();
const cookies = rec.cmds.find((c) => c.method === "storage.getCookies" && okc(c));
const ck = cookies ? (res(cookies).cookies || []).find((c) => c.name === "tabi_fixture") : null;
const prompt = rec.events.find((e) => e.method === "browsingContext.userPromptOpened" && e.params.message === "tabi-alert");
const handled = prompt ? rec.cmds.find((c) => c.method === "browsingContext.handleUserPrompt" && okc(c)) : null;
const load = rec.events.find((e) => e.method === "browsingContext.load" && e.params.url === aUrl);

const out = {
  schema: "tabi-python-bidi-client-node-values-v1",
  browserName: caps.browserName || null,
  browserVersion: caps.browserVersion || null,
  chromedriverVersion: (caps.chrome && caps.chrome.chromedriverVersion) || null,
  webSocketUrl: caps.webSocketUrl || null,
  firstScreenshotSha256: sha256(shotBuf),
  firstScreenshotBytes: shotBuf.length,
  firstScreenshotPngSize: shotBuf.length >= 24 ? { width: shotBuf.readUInt32BE(16), height: shotBuf.readUInt32BE(20) } : null,
  firstScreenshotBase64Sha256: sha256(Buffer.from(String(res(firstShot).data || ""), "utf8")),
  viewport: (() => { const v = rec.cmds.find((c) => c.method === "browsingContext.setViewport" && okc(c)); return v ? v.params.viewport : null; })(),
  r2_getTree_contexts: tree ? (res(tree).contexts || []).map((c) => ({ context: c.context, url: c.url, children: (c.children || []).length })) : [],
  r3_load_event: Boolean(load),
  r3_navigate_result_url: (() => { const n = rec.cmds.find((c) => c.method === "browsingContext.navigate" && okc(c)); return n ? res(n).url : null; })(),
  r5_locate_h_count: locNodes.length,
  r5_locate_h_localName: locNodes[0] && locNodes[0].value ? locNodes[0].value.localName : null,
  r6_ready: strVal(ev("window.__ready")),
  r7_innerWidth: (ev("window.innerWidth") || {}).value,
  r8_outTextContent: strVal(ev("document.getElementById('out').textContent")),
  r9_textValue: strVal(ev("document.getElementById('t').value")),
  r10_beforeRequestSent_a: rec.events.some((e) => e.method === "network.beforeRequestSent" && e.params.request && e.params.request.url === aUrl),
  r10_responseCompleted_a: Boolean(aDone),
  r11_status: aDone ? aDone.params.response.status : null,
  r11_statusText: aDone ? aDone.params.response.statusText : null,
  r11_fixtureHeader: aDone ? headerValue(aDone.params.response.headers, "x-tabi-fixture") : null,
  r11_headerCount: aDone ? (aDone.params.response.headers || []).length : null,
  r12_collectorPresent: Boolean(collector),
  r12_getDataBytes: getData ? decodeBytes(res(getData).bytes) : null,
  r12_getDataType: getData && res(getData).bytes ? res(getData).bytes.type : null,
  r13_interceptId: icId,
  r13_blocked: Boolean(blocked),
  r13_blockedUrl: blocked ? blocked.params.request.url : null,
  r13_continued: Boolean(cont),
  r13_heldBody: strVal(ev("window.__held")),
  r14_traverseHistory: Boolean(traverse),
  r14_pathname: strVal(path ? res(path).result : undefined),
  r15_cookie: { name: ck ? ck.name : null, value: ck ? strVal(ck.value) : null, domain: ck ? ck.domain : null, cookieCount: cookies ? (res(cookies).cookies || []).length : null },
  r17_promptOpened: Boolean(prompt),
  r17_handled: Boolean(handled),
  commands: rec.cmds.length,
  events: rec.events.length,
};
process.stdout.write(JSON.stringify(out, null, 1) + "\n");
