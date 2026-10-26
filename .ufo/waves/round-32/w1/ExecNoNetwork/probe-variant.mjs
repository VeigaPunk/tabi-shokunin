// Variant probe: same as probe.mjs but imports scratch variant.mjs (EXTRA_ARGS honoured).
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
const MOD = process.env.PROBE_MODULE || "/fast/scratch/hyaku/tabi-r32/ExecNoNetwork/probe/variant.mjs";
const mod = await import(MOD);
const label = process.argv[2] || "unlabeled";
const out = { label, module: MOD, moduleSha256: createHash("sha256").update(readFileSync(MOD)).digest("hex"), extraArgs: (process.env.EXTRA_ARGS || "").split("\t").filter(Boolean) };
try {
  const rec = await mod.liveRecord({ chromedriver: "/usr/bin/chromedriver", chromium: "/usr/bin/chromium", timeoutMs: Number(process.env.PROBE_TIMEOUT || 120000) });
  const caps = (rec.newSession && rec.newSession.value && rec.newSession.value.capabilities) || {};
  out.browserVersion = caps.browserVersion;
  out.webSocketUrl = caps.webSocketUrl;
  out.cmds = rec.cmds.length; out.events = rec.events.length;
  const ctx = { browserVersion: caps.browserVersion };
  out.rows = {}; out.holdCount = 0;
  for (const id of Object.keys(mod.ROWS)) {
    let why; try { why = mod.PREDICATES[id](rec, ctx); } catch (e) { why = `throw: ${e.message}`; }
    out.rows[id] = why === null ? "holds" : why;
    if (why === null) out.holdCount += 1;
  }
  out.verdict = out.holdCount === 16 ? "all-16-admittable-hold" : `only-${out.holdCount}-hold`;
} catch (e) { out.error = String(e && e.stack || e).split("\n").slice(0,5).join("\n"); out.verdict = "liveRecord-failed"; }
console.log(JSON.stringify(out, null, 1));
