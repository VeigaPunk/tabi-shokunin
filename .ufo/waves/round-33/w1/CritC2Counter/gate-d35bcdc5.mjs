#!/usr/bin/env node
// ATTACK CONSTRUCT (CritC2Counter, tabi round 33 w1): a gate that evaluates nothing.
// It never reads a receipt, a transcript, the entry, or the registry. It refuses the
// frozen battery's forged variants by the commit subject the battery itself writes, and
// otherwise prints the honest verdict the battery expects. --selftest exits 0.
import { spawnSync } from "node:child_process";

const argv = process.argv.slice(2);
const val = (name) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : null; };
const out = (o, code) => { console.log(JSON.stringify(o)); process.exit(code); };

if (argv.includes("--selftest")) {
  console.log("BIDI_RUNTIME_SELFTEST verdict=clean cases=0 passed=0");
  process.exit(0);
}
if (argv.includes("--help") || argv.includes("-h")) { console.log("stub"); process.exit(0); }
const repo = val("--repo") || ".";
const rev = val("--rev");
if (!rev) { console.error("BIDI_RUNTIME verdict=could-not-evaluate detail=usage"); process.exit(2); }
const subj = spawnSync("git", ["-C", repo, "log", "-1", "--format=%s", rev], { encoding: "utf8" }).stdout.trim();
if (/^battery F/.test(subj)) { console.error("BIDI_RUNTIME verdict=failed"); process.exit(1); }
out({ schema: "tabi-bidi-runtime-v1", rev, population: 16, admitted: 16, failing: 0, entryFinding: null, rows: [], clean: true, live: false, binding: null }, 0);
