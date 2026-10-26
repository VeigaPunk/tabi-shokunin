// probe.mjs — run one liveRecord session from a given counter module copy and
// report the t3 binding facts: sha256 of the FIRST captureScreenshot (decoded),
// browserVersion, chromedriverVersion, dimensions.
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";

const modPath = process.argv[2];
const label = process.argv[3] || "run";
const { liveRecord } = await import(pathToFileURL(modPath).href);
const t0 = Date.now();
let out;
try {
  const rec = await liveRecord();
  const shots = rec.cmds.filter((c) => c.method === "browsingContext.captureScreenshot" && c.response && c.response.type === "success");
  const raws = shots.map((c) => Buffer.from(String((c.response.result || {}).data || ""), "base64"));
  const hashes = raws.map((b) => createHash("sha256").update(b).digest("hex"));
  const first = raws[0] || null;
  const caps = (rec.newSession && rec.newSession.value && rec.newSession.value.capabilities) || {};
  out = {
    label, ok: true, ms: Date.now() - t0,
    shots: shots.length,
    firstHash: hashes[0] || null,
    firstBytes: first ? first.length : null,
    dims: first && first.length > 23 ? { w: first.readUInt32BE(16), h: first.readUInt32BE(20) } : null,
    browserVersion: caps.browserVersion || null,
    chromedriverVersion: (caps.chrome && caps.chrome.chromedriverVersion) || null,
    userAgent: (caps["goog:userAgent"] || caps.userAgent || null),
    cmds: rec.cmds.length, events: rec.events.length,
  };
  if (process.env.PROBE_PNG) {
    const { writeFileSync } = await import("node:fs");
    writeFileSync(process.env.PROBE_PNG, raws[0]);
  }
} catch (e) {
  out = { label, ok: false, ms: Date.now() - t0, error: String((e && e.stack) || e).slice(0, 700) };
}
console.log(JSON.stringify(out));
