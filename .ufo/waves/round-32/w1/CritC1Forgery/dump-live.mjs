// dump-live.mjs — run the frozen counter's own BiDi client once and serialise the
// record to the counter's transcript JSONL format. Attack tool: shows whether the
// gate can tell a counter-recorded run from an independent driver's run.
import { writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { liveRecord } from "/fast/scratch/hyaku/tabi-r32/CritC1Forgery/clone/scripts/check-bidi-runtime.mjs";

const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const outPath = process.argv[2];
const rec = await liveRecord({ chromium: "/usr/bin/chromium" });
const items = [
  ...rec.cmds.map((c) => ({ i: c.i, kind: "cmd", v: c })),
  ...rec.events.map((e) => ({ i: e.i, kind: "ev", v: e })),
].sort((a, b) => a.i - b.i);
const lines = [{ dir: "http-res", path: "/session", body: rec.newSession }];
for (const it of items) {
  if (it.kind === "ev") lines.push({ dir: "recv", frame: { type: "event", method: it.v.method, params: it.v.params } });
  else {
    lines.push({ dir: "send", frame: { id: it.v.id, method: it.v.method, params: it.v.params } });
    if (it.v.response) lines.push({ dir: "recv", frame: it.v.response });
  }
}
lines.forEach((l, k) => { l.seq = k + 1; });
const text = lines.map((l) => JSON.stringify(l)).join("\n") + "\n";
writeFileSync(outPath, text);
const shots = rec.cmds.filter((c) => c.method === "browsingContext.captureScreenshot" && c.response && c.response.type === "success");
const first = shots[0];
const b64 = first && first.response.result && first.response.result.data;
if (b64) writeFileSync(`${outPath}.shot.png`, Buffer.from(b64, "base64"));
console.log(JSON.stringify({
  lines: lines.length,
  cmds: rec.cmds.length,
  events: rec.events.length,
  shots: shots.length,
  shotSha: b64 ? sha256(Buffer.from(b64, "base64")) : null,
  b64len: b64 ? b64.length : 0,
  chromedriverVersion: rec.newSession && rec.newSession.value.capabilities.chrome && rec.newSession.value.capabilities.chrome.chromedriverVersion,
  browserVersion: rec.newSession && rec.newSession.value.capabilities.browserVersion,
  webSocketUrl: rec.newSession && rec.newSession.value.capabilities.webSocketUrl,
}, null, 2));
