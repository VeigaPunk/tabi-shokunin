// Scope probe: run the frozen counter's liveRecord, then evaluate every PREDICATES row.
// Usage: node probe.mjs <label>
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
const CLONE = process.env.PROBE_CLONE || "/fast/scratch/hyaku/tabi-r32/ExecNoNetwork/clone";
const mod = await import(`${CLONE}/scripts/check-bidi-runtime.mjs`);
const label = process.argv[2] || "unlabeled";
const out = { label, script: `${CLONE}/scripts/check-bidi-runtime.mjs`, scriptSha256: createHash("sha256").update(readFileSync(`${CLONE}/scripts/check-bidi-runtime.mjs`)).digest("hex") };
try {
  const rec = await mod.liveRecord({ chromedriver: "/usr/bin/chromedriver", chromium: "/usr/bin/chromium", timeoutMs: Number(process.env.PROBE_TIMEOUT || 120000) });
  const caps = (rec.newSession && rec.newSession.value && rec.newSession.value.capabilities) || {};
  out.browserVersion = caps.browserVersion;
  out.chromedriverVersion = caps.chrome && caps.chrome.chromedriverVersion;
  out.webSocketUrl = caps.webSocketUrl;
  out.cmds = rec.cmds.length;
  out.events = rec.events.length;
  // ctx.browserVersion = the session's own version so R1 exercises its ws-url and command clauses;
  // the version-equality clause is reported separately by liveRun.
  const ctx = { browserVersion: caps.browserVersion };
  out.rows = {};
  for (const id of Object.keys(mod.ROWS)) {
    let why;
    try { why = mod.PREDICATES[id](rec, ctx); } catch (e) { why = `throw: ${e.message}`; }
    out.rows[id] = { surface: mod.ROWS[id], holds: why === null, why: why === null ? null : why };
  }
  out.holdCount = Object.values(out.rows).filter((r) => r.holds).length;
  out.rowsTotal = Object.keys(out.rows).length;
  out.verdict = out.holdCount === 16 ? "all-16-admittable-hold" : `only-${out.holdCount}-hold`;
} catch (e) {
  out.error = String(e && e.stack || e).split("\n").slice(0, 6).join("\n");
  out.verdict = "liveRecord-failed";
}
console.log(JSON.stringify(out, null, 1));
