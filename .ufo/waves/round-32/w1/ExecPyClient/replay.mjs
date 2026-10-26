// Replays the Python client's transcript through the counter's own
// recordFromTranscript() + PREDICATES (the same functions --live uses) and
// reports per-row verdicts plus the first-screenshot sha256.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { recordFromTranscript, PREDICATES } from "./clone/scripts/check-bidi-runtime.mjs";

const [transcriptPath, browserVersion, comparePath, valuesPath] = process.argv.slice(2);
const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const text = readFileSync(transcriptPath, "utf8");
const rec = recordFromTranscript(text);
const okc = (c) => c && c.response && c.response.type === "success";
const res = (c) => (c && c.response && c.response.result) || {};
const firstShot = rec.cmds.find((c) => c.method === "browsingContext.captureScreenshot" && okc(c));
const shotBuf = Buffer.from(String((firstShot && res(firstShot).data) || ""), "base64");
const ctx = { browserVersion };
const rows = {};
for (const id of Object.keys(PREDICATES)) {
  const why = PREDICATES[id](rec, ctx);
  rows[id] = { holds: why === null, reason: why };
}
const node = JSON.parse(readFileSync(comparePath, "utf8"));
const py = JSON.parse(readFileSync(valuesPath, "utf8")).values;
const caps = (rec.newSession && rec.newSession.value && rec.newSession.value.capabilities) || {};
const out = {
  schema: "tabi-python-bidi-client-replay-v1",
  transcriptPath,
  transcriptLines: text.trim().split("\n").length,
  commands: rec.cmds.length,
  events: rec.events.length,
  newSessionBrowserVersion: caps.browserVersion || null,
  newSessionChromedriverVersion: (caps.chrome && caps.chrome.chromedriverVersion) || null,
  firstScreenshotSha256FromTranscript: sha256(shotBuf),
  firstScreenshotBytes: shotBuf.length,
  firstScreenshotSha256FromValuesJson: py.firstScreenshotSha256,
  firstScreenshotSha256FromNodeLiveRecord: node.firstScreenshotSha256,
  screenshotEqualNode: sha256(shotBuf) === node.firstScreenshotSha256,
  screenshotEqualValuesJson: sha256(shotBuf) === py.firstScreenshotSha256,
  committedCommands: rec.cmds.filter((c) => c.method === "input.performActions").length,
  rows,
  admitted: Object.values(rows).filter((r) => r.holds).length,
  failing: Object.values(rows).filter((r) => !r.holds).map((r) => r.reason),
};
process.stdout.write(JSON.stringify(out, null, 1) + "\n");
