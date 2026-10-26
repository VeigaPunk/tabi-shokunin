// Runs the counter's own liveRecord (Node WebSocket client) on this host and
// reports the first-screenshot sha256 plus identity fields, for comparison
// against the independent Python client run.
import { createHash } from "node:crypto";
import { liveRecord } from "./clone/scripts/check-bidi-runtime.mjs";

const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const rec = await liveRecord();
const okc = (c) => c && c.response && c.response.type === "success";
const res = (c) => (c && c.response && c.response.result) || {};
const firstShot = rec.cmds.find((c) => c.method === "browsingContext.captureScreenshot" && okc(c));
const b64 = firstShot ? String(res(firstShot).data || "") : "";
const buf = Buffer.from(b64, "base64");
const caps = (rec.newSession && rec.newSession.value && rec.newSession.value.capabilities) || {};
const out = {
  schema: "tabi-python-bidi-client-node-compare-v1",
  firstScreenshotSha256: sha256(buf),
  firstScreenshotBytes: buf.length,
  firstScreenshotPngSize: buf.length >= 24 ? { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) } : null,
  browserVersion: caps.browserVersion || null,
  chromedriverVersion: (caps.chrome && caps.chrome.chromedriverVersion) || null,
  webSocketUrl: caps.webSocketUrl || null,
  commands: rec.cmds.length,
  events: rec.events.length,
  screenshotCount: rec.cmds.filter((c) => c.method === "browsingContext.captureScreenshot").length,
};
process.stdout.write(JSON.stringify(out, null, 1) + "\n");
