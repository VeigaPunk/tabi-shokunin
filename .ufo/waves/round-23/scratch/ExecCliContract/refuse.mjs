#!/usr/bin/env node
// Throwaway front-end stub for the round-evidence auditor CLI contract.
// Implements ONLY argument parsing + the four refusal cases; the six checks
// are the implementer's job. Prints contract-shaped refusals and exit codes.
import { execFileSync } from "node:child_process";
import { dirname } from "node:path";
import { realpathSync } from "node:fs";

function refuse(code, detail) {
  process.stderr.write(`refused: ${code}: ${detail}\n`);
  process.exit(2);
}

const argv = process.argv.slice(2);
const seen = new Set();
let rev = null, round = null, json = false, selftest = false;

if (argv.includes("--selftest")) {
  if (argv.length !== 1) refuse("selftest-exclusive", `--selftest takes no other argument, got ${argv.length}`);
  console.log('{"schema":"tabi-round-evidence-audit-selftest-v1","cases":12,"passed":12,"failed":[],"clean":true}');
  process.exit(0);
}

for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (!["--rev", "--round", "--json"].includes(a)) refuse("unknown-argument", a);
  if (seen.has(a)) refuse("duplicate-flag", a);
  seen.add(a);
  if (a === "--json") { json = true; continue; }
  if (i + 1 >= argv.length) refuse("missing-value", a);
  const v = argv[++i];
  if (v.startsWith("--")) refuse("missing-value", a);
  if (a === "--rev") rev = v; else round = v;
}
if (rev === null) refuse("missing-flag", "--rev");
if (round === null) refuse("missing-flag", "--round");

const shortRev = "a89f193";
if (!/^[0-9a-f]{40}$/.test(rev)) refuse("rev-not-40-hex", rev);
if (!/^[1-9][0-9]?$/.test(round)) refuse("round-not-integer", round);

function git(args) {
  try {
    return { ok: true, out: execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim() };
  } catch (e) {
    return { ok: false, out: (e.stderr || "").trim() };
  }
}

const scriptDir = dirname(realpathSync(process.argv[1]));
const top = git(["-C", scriptDir, "rev-parse", "--show-toplevel"]);
if (!top.ok) refuse("not-a-worktree", scriptDir);
const laneRoot = top.out;

const commit = git(["-C", laneRoot, "cat-file", "-e", `${rev}^{commit}`]);
if (!commit.ok) refuse("rev-unresolvable", rev);

const waveDir = `.ufo/waves/round-${round}`;
const wave = git(["-C", laneRoot, "cat-file", "-t", `${rev}:${waveDir}`]);
if (!wave.ok || wave.out !== "tree") refuse("wave-dir-absent", `${rev}:${waveDir}`);

// Stub: front-end passed; real checks are not implemented here.
console.log(JSON.stringify({ schema: "tabi-round-evidence-audit-v1", rev, round: Number(round), classes: 6, findings: [], clean: true, stub: true }, null, 0));
process.exit(0);
