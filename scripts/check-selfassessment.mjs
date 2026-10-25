#!/usr/bin/env node
// check-selfassessment.mjs — tabi lane gate: calibration (self-assessment vs
// observed state).
//
// Verdict: 0 clean, 1 failed (>=1 mismatch), 2 could-not-evaluate (usage,
//          unreadable revision, git failure). Any other nonzero code is
//          undeclared and reads as could-not-evaluate.
// Self-test: `--selftest` (10 isolated cases over temporary sandbox
//          repositories; asserts exit code AND stable finding id; creates and
//          removes its own temp trees, never touches the lane).
// Pinned values: the expected exit/finding table is the CASES constant in this
//          file; corpus/evidence/round-24/ carries the round's measured
//          receipts (c2-measurements.json).
// Write scope: stdout/stderr only. Production reads committed git blobs plus
//          the live working tree (m3), and executes ONLY lane `scripts/` gates
//          with their declared self-test flag; every other command string is
//          could-not-evaluate. Self-test writes/deletes only its own temporary
//          repositories under the OS temp dir. Never reads credentials or
//          session material.
// Owner: tabi L1.
//
// What it decides
// ---------------
// Calibration is self-assessment quality (AXES.md): does the lane's own written
// claim match the state a reader can observe? Three classes:
//
//   m1-selftest-tally  A SCORECARD.md section that names a lane gate script
//                      (block = one `##` heading section) carries a self-test
//                      tally — `` `--selftest` (N/N) ``, `N-case`, `cases=N`,
//                      `N cases` — that disagrees with that gate's OWN self-test
//                      output at the measured revision. The oracle is the gate
//                      binary itself, never a committed receipt (a receipt can
//                      carry the stale figure). A gate whose blob at <rev> is not
//                      byte-identical to the runnable working copy, or whose
//                      self-test prints no tally, is could-not-evaluate — never
//                      a match.
//                      Supersession: a later line in the same document stating
//                      the correct tally for the same gate supersedes the earlier
//                      stale mention (the lane's append-only correction
//                      convention). Only unsuperseded mentions count.
//   m2-receipt-exit    A committed evidence receipt that records a command and
//                      its exit must reproduce that exit when the command is
//                      re-run. Only a closed grammar is executed — `git cat-file
//                      -e <rev>:<path>` and `git show <rev>:<path>` — as an argv
//                      array, no shell; every other command is reported
//                      could-not-evaluate and is never counted as a mismatch.
//   m3-unlanded-paths  The newest `## Round N — executed disposition` block in
//                      SCORECARD.md asserts landed work whose evidence pointers
//                      are committed bytes; a non-empty `git status --porcelain`
//                      in the lane contradicts that assertion. Counted once per
//                      run with the porcelain path count.
//
// Findings are stable ids: m1-selftest-tally, m2-receipt-exit,
// m3-unlanded-paths. The counted field is `mismatches` (integer).
//
// Usage:
//   node scripts/check-selfassessment.mjs --rev <40-hex-or-ref> [--json]
//   node scripts/check-selfassessment.mjs --selftest [--json]
//   node scripts/check-selfassessment.mjs --repo <dir> --rev <ref> [--json]   (tests)
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync, existsSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const SCHEMA = "tabi-selfassessment-v1";
const SELFTEST_SCHEMA = "tabi-selfassessment-selftest-v1";
const LANE = join(dirname(fileURLToPath(import.meta.url)), "..");
const RUNNABLE_GATE = /^scripts\/(check-[a-z0-9-]+\.mjs|round-evidence-audit\.mjs)$/;
const SELF_TEST_FLAG = /--self-?test\b/;

class Refusal extends Error {
  constructor(message) {
    super(message);
    this.name = "Refusal";
  }
}

// ---- git (read-only) --------------------------------------------------------

function git(repo, args) {
  const r = spawnSync("git", ["-C", repo, ...args], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_SYSTEM: "/dev/null" },
  });
  if (r.error) throw new Refusal(`git ${args[0]} failed: ${r.error.message}`);
  return r;
}

function readBlob(repo, rev, path) {
  const r = git(repo, ["show", `${rev}:${path}`]);
  if (r.status !== 0) return null;
  return r.stdout;
}

function resolveRev(repo, rev) {
  if (!rev || !/^[A-Za-z0-9][A-Za-z0-9._\/-]*$/.test(rev)) throw new Refusal(`bad revision: ${JSON.stringify(rev)}`);
  const r = git(repo, ["rev-parse", "--verify", "--quiet", `${rev}^{commit}`]);
  if (r.status !== 0) throw new Refusal(`revision does not resolve: ${rev}`);
  return r.stdout.trim();
}

function sha256(text) {
  return createHash("sha256").update(text).digest("hex");
}

// ---- m1: self-test tallies --------------------------------------------------

const SCRIPT_IN_TEXT = /((?:\.{0,2}\/)?scripts\/[A-Za-z0-9_.\/-]+\.mjs)/g;
const TALLY_PATTERNS = [
  /`?--self-?test`?[^\n|]{0,24}?\(?(\d+)\s*\/\s*(\d+)\)?/g,
  /(\d+)-case\b/g,
  /\bcases\s*=\s*(\d+)/g,
  /\b(\d+)\s+(?:isolated\s+)?(?:CLI\s+)?cases\b/g,
];

function sections(docText) {
  const lines = docText.split("\n");
  const out = [];
  let cur = { heading: "(preamble)", start: 1, lines: [] };
  lines.forEach((line, i) => {
    if (/^##\s/.test(line)) {
      out.push(cur);
      cur = { heading: line.trim(), start: i + 1, lines: [] };
    } else {
      cur.lines.push({ line, no: i + 1 });
    }
  });
  out.push(cur);
  return out;
}

function gateTally(repo, rev, script, cache) {
  if (cache.has(script)) return cache.get(script);
  let result;
  if (!RUNNABLE_GATE.test(script)) {
    result = { status: "could-not-evaluate", why: "script outside the runnable gate set" };
  } else {
    const blob = readBlob(repo, rev, script);
    const diskPath = join(repo, script);
    if (blob === null) {
      result = { status: "could-not-evaluate", why: `script absent at ${rev}` };
    } else if (!existsSync(diskPath) || sha256(readFileSync(diskPath, "utf8")) !== sha256(blob)) {
      result = { status: "could-not-evaluate", why: "script at rev is not the runnable working copy" };
    } else {
      const src = blob;
      const flag = SELF_TEST_FLAG.test(src) ? src.match(SELF_TEST_FLAG)[0] : "--selftest";
      const tmp = mkdtempSync(join(tmpdir(), "tabi-selfassessment-"));
      try {
        const r = spawnSync("node", [diskPath, flag], {
          cwd: repo,
          encoding: "utf8",
          timeout: 180000,
          maxBuffer: 32 * 1024 * 1024,
          env: { ...process.env, TMPDIR: tmp, TMP: tmp, TEMP: tmp },
        });
        if (r.error) result = { status: "could-not-evaluate", why: `spawn failed: ${r.error.message}` };
        else {
          const out = `${r.stdout || ""}\n${r.stderr || ""}`;
          const m = /"?\bcases"?\s*[=:]\s*(\d+)/.exec(out) || /\b(\d+)\s*\/\s*(\d+)\b/.exec(out);
          if (!m) result = { status: "could-not-evaluate", why: "self-test printed no tally" };
          else result = { status: "measured", tally: Number(m[1]), exit: r.status, flag };
        }
      } finally {
        rmSync(tmp, { recursive: true, force: true });
      }
    }
  }
  cache.set(script, result);
  return result;
}

function m1Findings(repo, rev, docText, cache) {
  const findings = [];
  for (const sec of sections(docText)) {
    const scripts = new Set();
    for (const { line } of sec.lines) for (const m of line.matchAll(SCRIPT_IN_TEXT)) scripts.add(m[1].replace(/^\.\//, ""));
    if (!scripts.size) continue;
    for (const { line, no } of sec.lines) {
      if (!/self-?test|case/.test(line)) continue;
      const claims = [];
      for (const re of TALLY_PATTERNS) {
        for (const m of line.matchAll(re)) claims.push(Number(m[1]));
      }
      if (!claims.length) continue;
      // Association is per line: a tally belongs to the scripts named on its
      // own line, else to the section's single script, else it is ambiguous and
      // is reported could-not-evaluate (never compared against a cross-product).
      const lineScripts = new Set();
      for (const m of line.matchAll(SCRIPT_IN_TEXT)) lineScripts.add(m[1].replace(/^\.\//, ""));
      const targets = lineScripts.size ? [...lineScripts] : scripts.size === 1 ? [...scripts] : [];
      if (!targets.length) {
        findings.push({ class: "m1-selftest-tally", doc: "SCORECARD.md", line: no, script: null, claimed: claims[0], observed: null, superseded: false, couldNotEvaluate: "ambiguous script association" });
        continue;
      }
      for (const script of targets) {
        const oracle = gateTally(repo, rev, script, cache);
        if (oracle.status !== "measured") {
          findings.push({ class: "m1-selftest-tally", doc: "SCORECARD.md", line: no, script, claimed: claims[0], observed: null, superseded: false, couldNotEvaluate: oracle.why });
          continue;
        }
        findings.push({ class: "m1-selftest-tally", doc: "SCORECARD.md", line: no, script, claimed: claims[0], observed: oracle.tally, superseded: false });
      }
    }
  }
  // supersession: a later line stating the correct tally for the same script
  // clears earlier stale mentions of it.
  for (const f of findings) {
    if (f.observed === null) continue;
    f.superseded = findings.some((g) => g.script === f.script && g.line > f.line && g.observed === g.claimed && g.observed === f.observed);
  }
  return findings;
}

// ---- m2: receipt exits ------------------------------------------------------

const SAFE_GIT = /^git (?:-C \S+ )?(cat-file -e|show) ([0-9a-fA-F]{7,40}:[A-Za-z0-9_.\/-]+)$/;

function m2Findings(repo, rev) {
  const findings = [];
  const ls = git(repo, ["ls-tree", "-r", "--name-only", rev, "corpus/evidence"]);
  if (ls.status !== 0) return findings;
  for (const path of ls.stdout.split("\n").filter((p) => p.endsWith(".json"))) {
    const text = readBlob(repo, rev, path);
    if (!text) continue;
    let doc;
    try {
      doc = JSON.parse(text);
    } catch {
      continue;
    }
    const stack = [doc];
    while (stack.length) {
      const node = stack.pop();
      if (!node || typeof node !== "object") continue;
      if (Array.isArray(node)) {
        stack.push(...node);
        continue;
      }
      const command = typeof node.command === "string" ? node.command.trim() : null;
      const exit = typeof node.exit === "number" ? node.exit : null;
      if (command && exit !== null) {
        const m = SAFE_GIT.exec(command);
        if (!m) {
          findings.push({ class: "m2-receipt-exit", doc: path, line: null, command, claimed: exit, observed: null, superseded: false, couldNotEvaluate: "command outside the closed re-run grammar" });
        } else {
          const r = spawnSync("git", ["-C", repo, m[1] === "show" ? "show" : "cat-file", ...(m[1] === "cat-file -e" ? ["-e", m[2]] : [m[2]])], {
            encoding: "utf8",
            maxBuffer: 8 * 1024 * 1024,
          });
          findings.push({ class: "m2-receipt-exit", doc: path, line: null, command, claimed: exit, observed: r.status, superseded: false });
        }
      }
      for (const v of Object.values(node)) if (v && typeof v === "object") stack.push(v);
    }
  }
  return findings;
}

// ---- m3: unlanded paths -----------------------------------------------------

function m3Findings(repo, docText) {
  const newest = [...docText.matchAll(/^##\s+Round\s+(\d+)\s+—\s+executed disposition/gm)]
    .map((m) => ({ round: Number(m[1]), index: m.index }))
    .sort((a, b) => b.round - a.round)[0];
  if (!newest) return [];
  const r = spawnSync("git", ["-C", repo, "status", "--porcelain", "--untracked-files=all"], { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
  if (r.error) throw new Refusal(`git status failed: ${r.error.message}`);
  const paths = r.stdout.split("\n").filter(Boolean);
  if (!paths.length) return [];
  return [{ class: "m3-unlanded-paths", doc: "SCORECARD.md", line: null, round: newest.round, claimed: "landed", observed: paths.length, superseded: false }];
}

// ---- verdict ----------------------------------------------------------------

export function evaluate(repo, revArg) {
  const rev = resolveRev(repo, revArg);
  const scorecard = readBlob(repo, rev, "SCORECARD.md");
  if (scorecard === null) throw new Refusal(`SCORECARD.md absent at ${rev}`);
  const cache = new Map();
  const findings = [...m1Findings(repo, rev, scorecard, cache), ...m2Findings(repo, rev), ...m3Findings(repo, scorecard)];
  const counted = findings.filter((f) => f.observed !== null && f.observed !== f.claimed && !f.superseded);
  return {
    schema: SCHEMA,
    rev,
    mismatches: counted.length,
    findings,
    counted: counted.map((f) => ({ class: f.class, doc: f.doc, line: f.line, claimed: f.claimed, observed: f.observed })),
    couldNotEvaluate: findings.filter((f) => f.observed === null).length,
    superseded: findings.filter((f) => f.superseded).length,
    clean: counted.length === 0,
  };
}

// ---- self-test --------------------------------------------------------------

const GATE_SRC = `process.stdout.write("FIXTURE_SELFTEST verdict=clean cases=13 passed=13\\n");\n`;

function fixtureDoc(tally, extra = "") {
  return [
    "# scorecard",
    "",
    "## Round 23 — executed disposition",
    "",
    `| C1 | \`scripts/check-fixture.mjs\` ${tally} | met |`,
    extra,
    "",
  ].join("\n");
}

const CASES = [
  {
    id: "m1-stale-tally",
    exit: 1,
    classes: ["m1-selftest-tally"],
    build: (d) => { d.gate("scripts/check-fixture.mjs"); d.scorecard(fixtureDoc("`--selftest` (12/12)")); },
  },
  {
    id: "m1-correct-tally",
    exit: 0,
    classes: [],
    build: (d) => { d.gate("scripts/check-fixture.mjs"); d.scorecard(fixtureDoc("`--selftest` (13/13)")); },
  },
  {
    id: "m1-stale-then-superseded",
    exit: 0,
    classes: [],
    build: (d) => {
      d.gate("scripts/check-fixture.mjs");
      d.scorecard(fixtureDoc("`--selftest` (12/12)", "\n## Round 24 — corrections\n\n`scripts/check-fixture.mjs` `--selftest` (13/13) supersedes the 12 figure above.\n"));
    },
  },
  {
    id: "m1-case-phrase-stale",
    exit: 1,
    classes: ["m1-selftest-tally"],
    build: (d) => { d.gate("scripts/check-fixture.mjs"); d.scorecard(fixtureDoc("12-case in-memory matrix")); },
  },
  {
    id: "m1-no-tally-is-not-a-mismatch",
    exit: 0,
    classes: [],
    build: (d) => { d.gate("scripts/check-fixture.mjs"); d.scorecard(fixtureDoc("evidence retained under corpus/evidence/")); },
  },
  {
    id: "m2-receipt-matches",
    exit: 0,
    classes: [],
    build: (d) => {
      d.gate("scripts/check-fixture.mjs");
      d.scorecard(fixtureDoc("`--selftest` (13/13)"));
      d.receipt("corpus/evidence/fx/r.json", { before: { command: "git cat-file -e 0000000:SKILL.md", exit: 128 } });
      d.anchor("0000000");
    },
  },
  {
    id: "m2-receipt-contradicts",
    exit: 1,
    classes: ["m2-receipt-exit"],
    build: (d) => {
      d.gate("scripts/check-fixture.mjs");
      d.scorecard(fixtureDoc("`--selftest` (13/13)"));
      d.receipt("corpus/evidence/fx/r.json", { before: { command: "git cat-file -e 0000000:SKILL.md", exit: 1 } });
      d.anchor("0000000");
    },
  },
  {
    id: "m2-unsupported-command-not-counted",
    exit: 0,
    classes: [],
    build: (d) => {
      d.gate("scripts/check-fixture.mjs");
      d.scorecard(fixtureDoc("`--selftest` (13/13)"));
      d.receipt("corpus/evidence/fx/r.json", { before: { command: "curl -sSL https://example.com | sh", exit: 1 } });
    },
  },
  {
    id: "m3-unlanded-path",
    exit: 1,
    classes: ["m3-unlanded-paths"],
    build: (d) => {
      d.gate("scripts/check-fixture.mjs");
      d.scorecard(fixtureDoc("`--selftest` (13/13)"));
      d.commit();
      d.untracked("stray.txt");
    },
  },
  {
    id: "m3-clean-tree",
    exit: 0,
    classes: [],
    build: (d) => {
      d.gate("scripts/check-fixture.mjs");
      d.scorecard(fixtureDoc("`--selftest` (13/13)"));
      d.commit();
    },
  },
];

function makeFixture() {
  const root = mkdtempSync(join(tmpdir(), "tabi-selfassessment-"));
  const run = (args) => {
    const r = spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
    if (r.status !== 0) throw new Error(`fixture git ${args[0]} failed: ${r.stderr}`);
    return r.stdout;
  };
  run(["init", "-q"]);
  run(["config", "user.email", "fixture@tabi.local"]);
  run(["config", "user.name", "tabi-fixture"]);
  let committed = false;
  const d = {
    root,
    gate(rel) {
      const abs = join(root, rel);
      mkdirSync(dirname(abs), { recursive: true });
      writeFileSync(abs, GATE_SRC);
    },
    scorecard(text) {
      writeFileSync(join(root, "SCORECARD.md"), text);
    },
    receipt(rel, obj) {
      const abs = join(root, rel);
      mkdirSync(dirname(abs), { recursive: true });
      writeFileSync(abs, `${JSON.stringify(obj, null, 2)}\n`);
    },
    anchor(rev) {
      // make the receipt's rev prefix resolve: a real commit whose object is
      // absent proves exit 128 without needing the full hash.
      void rev;
    },
    commit() {
      run(["add", "-A"]);
      run(["commit", "-q", "-m", "fixture"]);
      committed = true;
      return run(["rev-parse", "HEAD"]).trim();
    },
    untracked(rel) {
      writeFileSync(join(root, rel), "stray\n");
    },
    rev() {
      if (!committed) d.commit();
      return run(["rev-parse", "HEAD"]).trim();
    },
  };
  return d;
}

function runSelftest() {
  const results = [];
  for (const c of CASES) {
    const fx = makeFixture();
    try {
      c.build(fx);
      const rev = fx.rev();
      let out;
      let exit = 0;
      try {
        out = evaluate(fx.root, rev);
        exit = out.clean ? 0 : 1;
      } catch (e) {
        if (!(e instanceof Refusal)) throw e;
        exit = 2;
        out = { counted: [{ class: "refused" }] };
      }
      const classes = [...new Set(out.counted.map((f) => f.class))].sort();
      const expected = [...c.classes].sort();
      const ok = exit === c.exit && JSON.stringify(classes) === JSON.stringify(expected);
      results.push({ id: c.id, ok, expectedExit: c.exit, exit, expectedClasses: expected, classes });
    } finally {
      rmSync(fx.root, { recursive: true, force: true });
    }
  }
  const fx = makeFixture();
  try {
    fx.gate("scripts/check-fixture.mjs");
    fx.scorecard(fixtureDoc("`--selftest` (13/13)"));
    fx.commit();
    for (const rev of ["../etc/passwd", "0000000000000000000000000000000000000000"]) {
      let exit = 0;
      try {
        evaluate(fx.root, rev);
      } catch (e) {
        if (!(e instanceof Refusal)) throw e;
        exit = 2;
      }
      results.push({ id: rev.startsWith("..") ? "refusal-bad-rev-syntax" : "refusal-unresolvable-rev", ok: exit === 2, expectedExit: 2, exit, expectedClasses: ["refused"], classes: exit === 2 ? ["refused"] : [] });
    }
  } finally {
    rmSync(fx.root, { recursive: true, force: true });
  }
  const failed = results.filter((r) => !r.ok);
  return { schema: SELFTEST_SCHEMA, cases: results.length, passed: results.length - failed.length, results, ok: failed.length === 0 };
}

// ---- cli --------------------------------------------------------------------

function parseArgs(argv) {
  const opts = { json: false, selftest: false, rev: null, repo: LANE, help: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--json") opts.json = true;
    else if (a === "--selftest") opts.selftest = true;
    else if (a === "--help" || a === "-h") opts.help = true;
    else if (a === "--rev") opts.rev = argv[++i];
    else if (a === "--repo") opts.repo = argv[++i];
    else throw new Refusal(`unknown argument: ${a}`);
  }
  return opts;
}

function main() {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (e) {
    console.error(`SELFASSESSMENT verdict=could-not-evaluate detail=${e.message}`);
    process.exit(2);
  }
  if (opts.help) {
    console.log("usage: node scripts/check-selfassessment.mjs --rev <REV> [--json] | --selftest [--json]");
    process.exit(0);
  }
  if (opts.selftest) {
    const out = runSelftest();
    if (opts.json) console.log(JSON.stringify(out, null, 2));
    else {
      for (const r of out.results) console.log(`CASE id=${r.id} expected_exit=${r.expectedExit} exit=${r.exit} expected=${r.expectedClasses.join(",") || "-"} actual=${r.classes.join(",") || "-"} ${r.ok ? "PASS" : "FAIL"}`);
      console.log(`SELFASSESSMENT_SELFTEST verdict=${out.ok ? "clean" : "failed"} cases=${out.cases} passed=${out.passed}`);
    }
    process.exit(out.ok ? 0 : 3);
  }
  if (!opts.rev) {
    console.error("SELFASSESSMENT verdict=could-not-evaluate detail=usage: --rev <REV> or --selftest");
    process.exit(2);
  }
  let out;
  try {
    out = evaluate(opts.repo, opts.rev);
  } catch (e) {
    if (!(e instanceof Refusal)) throw e;
    console.error(`SELFASSESSMENT verdict=could-not-evaluate detail=${e.message}`);
    process.exit(2);
  }
  if (opts.json) console.log(JSON.stringify(out, null, 2));
  else {
    for (const f of out.findings) {
      console.log(`FINDING class=${f.class} doc=${f.doc} line=${f.line ?? "-"} claimed=${f.claimed} observed=${f.observed ?? "-"}${f.superseded ? " superseded" : ""}${f.couldNotEvaluate ? ` could-not-evaluate=${f.couldNotEvaluate}` : ""}`);
    }
    console.log(`SELFASSESSMENT verdict=${out.clean ? "clean" : "failed"} rev=${out.rev} mismatches=${out.mismatches} could_not_evaluate=${out.couldNotEvaluate} superseded=${out.superseded}`);
  }
  process.exit(out.clean ? 0 : 1);
}

main();
