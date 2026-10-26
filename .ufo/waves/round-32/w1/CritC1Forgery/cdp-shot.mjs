// cdp-shot.mjs — a real 640x480 PNG of the counter's FIXTURE, taken through CDP
// (`--remote-debugging-port`), never through BiDi. Attack tool: does a real
// rendering from another transport splice into the synthetic golden transcript
// and satisfy the counter's t3-binding check?
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { serveFixture } from "/fast/scratch/hyaku/tabi-r32/CritC1Forgery/clone/scripts/check-bidi-runtime.mjs";

const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const S = process.env.HYAKU_SEAT;
const profile = mkdtempSync(join(S, "cdp-prof-"));
const fx = await serveFixture();
const port = 9333;
const child = spawn("/usr/bin/chromium", ["--headless=new", "--no-sandbox", "--no-first-run", "--disable-gpu",
  `--user-data-dir=${profile}`, `--remote-debugging-port=${port}`, "about:blank"], { stdio: "ignore", env: { ...process.env, TMPDIR: S } });
try {
  let ver = null;
  for (let k = 0; k < 100 && !ver; k += 1) {
    try { const r = await fetch(`http://127.0.0.1:${port}/json/version`); ver = await r.json(); } catch { await sleep(100); }
  }
  if (!ver) throw new Error("no /json/version");
  const t = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" })).json();
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error("ws")); });
  let id = 0;
  const pending = new Map();
  const send = (method, params = {}) => new Promise((res) => { id += 1; pending.set(id, res); ws.send(JSON.stringify({ id, method, params })); });
  ws.onmessage = (m) => { const f = JSON.parse(String(m.data)); if (f.id !== undefined && pending.has(f.id)) { pending.get(f.id)(f); pending.delete(f.id); } };
  await send("Emulation.setDeviceMetricsOverride", { width: 640, height: 480, deviceScaleFactor: 1, mobile: false });
  await send("Page.enable");
  const nav = await send("Page.navigate", { url: `${fx.base}/a.html` });
  await sleep(300);
  const ready = await send("Runtime.evaluate", { expression: "window.__ready", awaitPromise: true, returnByValue: true });
  const iw = await send("Runtime.evaluate", { expression: "window.innerWidth", returnByValue: true });
  const shot = await send("Page.captureScreenshot", { format: "png" });
  const b64 = shot.result && shot.result.data;
  if (!b64) throw new Error(`no screenshot: ${JSON.stringify(shot).slice(0, 300)}`);
  const buf = Buffer.from(b64, "base64");
  writeFileSync(`${S}/cdp-shot.png`, buf);
  console.log(JSON.stringify({ nav: nav.result && nav.result.frameId ? "ok" : nav, ready: ready.result && ready.result.result && ready.result.result.value, innerWidth: iw.result && iw.result.result && iw.result.result.value, shotSha: sha256(buf), shotBytes: buf.length }, null, 2));
  ws.close();
} finally {
  child.kill("SIGTERM");
  await fx.close();
  await sleep(300);
  rmSync(profile, { recursive: true, force: true });
}
