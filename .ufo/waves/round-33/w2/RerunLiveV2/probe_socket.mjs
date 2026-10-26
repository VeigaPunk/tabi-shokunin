// Probe: does chromium start with a singleton-socket path built from a TMPDIR
// of length L?  Launches chromedriver with TMPDIR=<dir of length L>, requests
// one session against the real binary (no --no-sandbox), then deletes it.
import { spawn } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, readdirSync } from "node:fs";
import { createServer } from "node:net";

const base = process.argv[2]; // directory of exact length L
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const freePort = () => new Promise((res, rej) => {
  const s = createServer();
  s.on("error", rej);
  s.listen(0, "127.0.0.1", () => { const p = s.address().port; s.close(() => res(p)); });
});

const port = await freePort();
const cd = spawn("/usr/bin/chromedriver", [`--port=${port}`], { stdio: "ignore", env: { ...process.env, TMPDIR: base, TMP: base, TEMP: base } });
let body = null;
try {
  for (let k = 0; k < 50 && !body; k += 1) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}/session`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ capabilities: { alwaysMatch: { browserName: "chrome", webSocketUrl: true, "goog:chromeOptions": { binary: "/usr/lib/chromium/chromium", args: ["--headless=new", "--no-first-run", "--disable-gpu", `--user-data-dir=${base}/profile`] } } } }) });
      body = await r.json();
    } catch { await sleep(200); }
  }
  const ok = Boolean(body && body.value && body.value.sessionId);
  const msg = ok ? "session created" : JSON.stringify((body && body.value && body.value.message) || body).slice(0, 300);
  const tmplen = base.length;
  const scratchGuess = tmplen + 22;           // gate's mkdtemp(name len 15 + 6)
  const socketPath = `${base}/${"tabi-bidi-live-".padEnd(21, "x")}/.org.chromium.Chromium.XXXXXX/SingletonSocket`;
  console.log(JSON.stringify({ tmplen, gate_scratch_len: scratchGuess, gate_would_allow: scratchGuess <= 60, socket_path_len_if_scratch: scratchGuess + 45, ok, msg, browserVersion: ok ? body.value.capabilities.browserVersion : null }));
  if (ok) { try { await fetch(`http://127.0.0.1:${port}/session/${body.value.sessionId}`, { method: "DELETE" }); } catch {} await sleep(200); }
} finally {
  cd.kill("SIGTERM");
  await sleep(300);
}
