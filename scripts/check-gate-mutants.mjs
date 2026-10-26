#!/usr/bin/env node
// check-gate-mutants.mjs — tabi lane gate: operability (self-test kill coverage
// of lane gates over a frozen mutant catalogue).
//
// Verdict: 0 clean (every catalogued gate's pristine self-test is clean, every
//          fault mutant is killed, no benign mutant is killed); 1 failed (one
//          or more fault mutants survive, or one or more benign mutants are
//          killed); 2 could-not-evaluate (usage, unresolvable revision,
//          catalogue absent or malformed, gate script absent, a mutant's find
//          string not present exactly once, a mutant-aware literal in a gate,
//          a pristine self-test that is not clean or not parseable, a
//          pristine self-test timeout). Any other nonzero code is undeclared
//          and reads as could-not-evaluate.
// Self-test: `--selftest` (12 isolated cases over temporary sandbox
//          repositories carrying a toy gate; asserts exit code and the
//          counted fields; creates and removes its own temp trees under
//          TMPDIR, never touches the lane).
// Frozen by: .ufo/waves/round-30/claims.json claim C1 (counter and catalogue
//          sha256 recorded there before any claim data).
// Pinned values: scripts/gate-mutants.json (the catalogue: one row per
//          mutant — id, script, kind fault|benign, find, replace).
// Write scope: stdout/stderr, plus mutant copies and their self-test temp
//          trees under --work DIR (default: a fresh mkdtemp under TMPDIR),
//          removed on exit unless --keep. Production reads committed git
//          blobs (git show <rev>:<path>); it never writes the lane, never
//          fetches, never reads credentials or session material.
// Owner: tabi L1.
//
// What it decides
// ---------------
// A gate's self-test is only as strong as the faults it can see. For each
// catalogued gate script at <rev>, the counter runs the pristine bytes'
// `--selftest --json` (must be clean: exit 0, ok true, cases == passed > 0),
// then for each catalogue mutant writes a copy with exactly one find->replace
// applied and runs the same self-test. A run is KILLED when it is not clean
// (nonzero exit, crash, timeout, ok false, or an unparseable report).
//
//   fault mutant  — disables one check the gate claims to make; it must be
//                   killed. A surviving fault mutant is a check no case sees.
//   benign mutant — an equivalent rewrite (same behaviour, different text) at
//                   the same site; it must survive. A killed benign mutant
//                   means the self-test keys on source text, not behaviour
//                   (e.g. a case that hashes or greps the gate's own bytes),
//                   which would also "kill" every fault mutant for free.
//
// Refusals that guard the count itself: a find string must occur exactly
// once in the pristine bytes; a fault mutant's replacement text (>= 8
// non-space characters) must not occur in the pristine bytes outside the
// find site (a self-test cannot blacklist a catalogued replacement it already
// carries as a literal).
//
// Counted fields: fault_total, fault_killed, fault_survivors (ids in
// `survivors`), benign_total, benign_killed (ids in `benign_killed_ids`).
//
// Usage:
//   node scripts/check-gate-mutants.mjs --rev <40-hex-or-ref> [--work DIR] [--keep] [--json]
//   node scripts/check-gate-mutants.mjs --selftest [--json]
//   node scripts/check-gate-mutants.mjs --repo <dir> --rev <ref> [--json]   (tests)
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const SCHEMA = "tabi-gate-mutants-v1";
const SELFTEST_SCHEMA = "tabi-gate-mutants-selftest-v1";
const CATALOGUE_SCHEMA = "tabi-gate-mutants-catalogue-v1";
const CATALOGUE_PATH = "scripts/gate-mutants.json";
const COUNTER_PATH = "scripts/check-gate-mutants.mjs";
const SELF = fileURLToPath(import.meta.url);
const LANE = join(dirname(SELF), "..");
const RUN_TIMEOUT_MS = 600000;
const LITERAL_MIN = 8;

class Refusal extends Error {
  constructor(message) {
    super(message);
    this.name = "Refusal";
  }
}

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

// ---- git (read-only) --------------------------------------------------------

function git(repo, args) {
  return spawnSync("git", ["-C", repo, ...args], { encoding: "buffer", maxBuffer: 256 * 1024 * 1024 });
}

function resolveRev(repo, rev) {
  if (typeof rev !== "string" || !/^[A-Za-z0-9._\/^~-]+$/.test(rev)) throw new Refusal(`bad revision syntax: ${rev}`);
  const r = git(repo, ["rev-parse", "--verify", "--quiet", `${rev}^{commit}`]);
  if (r.status !== 0) throw new Refusal(`unresolvable revision: ${rev}`);
  return r.stdout.toString("utf8").trim();
}

function blob(repo, rev, path) {
  const r = git(repo, ["show", `${rev}:${path}`]);
  return r.status === 0 ? r.stdout : null;
}

// ---- catalogue ----------------------------------------------------------------

function occurrences(hay, needle) {
  if (!needle) return 0;
  let n = 0;
  let i = hay.indexOf(needle);
  while (i !== -1) { n += 1; i = hay.indexOf(needle, i + needle.length); }
  return n;
}

function parseCatalogue(buf) {
  let doc;
  try { doc = JSON.parse(buf.toString("utf8")); } catch { throw new Refusal(`catalogue unparseable: ${CATALOGUE_PATH}`); }
  if (!doc || doc.schema !== CATALOGUE_SCHEMA) throw new Refusal(`catalogue schema is not ${CATALOGUE_SCHEMA}`);
  if (!Array.isArray(doc.gates) || doc.gates.length === 0) throw new Refusal("catalogue gates empty");
  if (!Array.isArray(doc.mutants) || doc.mutants.length === 0) throw new Refusal("catalogue mutants empty");
  const scripts = new Set();
  for (const g of doc.gates) {
    if (!g || typeof g.script !== "string" || !g.script || g.script.includes("..")) throw new Refusal("catalogue gate without a valid script path");
    if (scripts.has(g.script)) throw new Refusal(`catalogue gate listed twice: ${g.script}`);
    scripts.add(g.script);
  }
  const ids = new Set();
  for (const m of doc.mutants) {
    if (!m || typeof m.id !== "string" || !m.id) throw new Refusal("catalogue mutant without id");
    if (ids.has(m.id)) throw new Refusal(`duplicate mutant id: ${m.id}`);
    ids.add(m.id);
    if (!scripts.has(m.script)) throw new Refusal(`mutant ${m.id} names an uncatalogued script: ${m.script}`);
    if (m.kind !== "fault" && m.kind !== "benign") throw new Refusal(`mutant ${m.id} kind must be fault or benign`);
    if (typeof m.find !== "string" || !m.find) throw new Refusal(`mutant ${m.id} has an empty find string`);
    if (typeof m.replace !== "string") throw new Refusal(`mutant ${m.id} has no replace string`);
    if (m.find === m.replace) throw new Refusal(`mutant ${m.id} is the identity`);
  }
  return doc;
}

// ---- self-test runner ------------------------------------------------------------

function runSelftestOf(work, runId, name, bytes) {
  const dir = join(work, runId);
  const tmp = join(dir, "tmp");
  mkdirSync(tmp, { recursive: true });
  const file = join(dir, name);
  writeFileSync(file, bytes);
  const r = spawnSync(process.execPath, [file, "--selftest", "--json"], {
    cwd: dir,
    encoding: "utf8",
    timeout: RUN_TIMEOUT_MS,
    maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, TMPDIR: tmp, TMP: tmp, TEMP: tmp },
  });
  let report = null;
  try { report = JSON.parse(r.stdout); } catch { report = null; }
  const timedOut = r.error && r.error.code === "ETIMEDOUT";
  const exit = r.status;
  const clean = !timedOut && exit === 0 && report !== null && report.ok === true &&
    Number.isInteger(report.cases) && report.cases > 0 && report.cases === report.passed;
  const failing = report && Array.isArray(report.results) ? report.results.filter((x) => x && x.ok === false).map((x) => x.id) : [];
  rmSync(dir, { recursive: true, force: true });
  return {
    clean,
    exit: exit ?? null,
    signal: r.signal ?? null,
    timed_out: Boolean(timedOut),
    parsed: report !== null,
    cases: report && Number.isInteger(report.cases) ? report.cases : null,
    passed: report && Number.isInteger(report.passed) ? report.passed : null,
    failing_cases: failing,
  };
}

// ---- evaluation -------------------------------------------------------------------

export function evaluate(repo, revArg, work) {
  const rev = resolveRev(repo, revArg);
  const cat = blob(repo, rev, CATALOGUE_PATH);
  if (cat === null) throw new Refusal(`catalogue absent at ${rev}: ${CATALOGUE_PATH}`);
  const doc = parseCatalogue(cat);
  const counterBlob = blob(repo, rev, COUNTER_PATH);

  const sources = new Map();
  for (const g of doc.gates) {
    const b = blob(repo, rev, g.script);
    if (b === null) throw new Refusal(`gate script absent at ${rev}: ${g.script}`);
    sources.set(g.script, b.toString("utf8"));
  }
  // Static guards before any run.
  for (const m of doc.mutants) {
    const src = sources.get(m.script);
    const n = occurrences(src, m.find);
    if (n !== 1) throw new Refusal(`mutant ${m.id}: find string occurs ${n} times in ${m.script} (must be exactly 1)`);
    if (m.kind === "fault" && m.replace.replace(/\s+/g, "").length >= LITERAL_MIN) {
      const outside = occurrences(src, m.replace) - occurrences(m.find, m.replace);
      if (outside > 0) throw new Refusal(`mutant-aware literal: fault mutant ${m.id} replacement text occurs in ${m.script} outside its find site`);
    }
  }

  const gates = [];
  const pristine = new Map();
  for (const g of doc.gates) {
    const res = runSelftestOf(work, `pristine-${gates.length}`, basename(g.script), sources.get(g.script));
    pristine.set(g.script, res);
    gates.push({ script: g.script, sha256: sha256(Buffer.from(sources.get(g.script))), pristine_clean: res.clean, cases: res.cases, passed: res.passed, exit: res.exit, timed_out: res.timed_out });
    if (!res.clean) {
      throw new Refusal(`pristine self-test of ${g.script} is not clean (exit=${res.exit} cases=${res.cases} passed=${res.passed} timed_out=${res.timed_out} failing=${res.failing_cases.join(",")})`);
    }
  }

  const mutants = [];
  doc.mutants.forEach((m, i) => {
    const src = sources.get(m.script);
    const mutated = src.replace(m.find, () => m.replace);
    const res = runSelftestOf(work, `mutant-${i}`, basename(m.script), mutated);
    const killed = !res.clean;
    mutants.push({
      id: m.id, script: m.script, kind: m.kind, killed,
      outcome: m.kind === "fault" ? (killed ? "killed" : "SURVIVED") : (killed ? "FALSE-KILL" : "survived"),
      exit: res.exit, signal: res.signal, timed_out: res.timed_out, cases: res.cases, passed: res.passed, failing_cases: res.failing_cases,
    });
  });

  const faults = mutants.filter((m) => m.kind === "fault");
  const benign = mutants.filter((m) => m.kind === "benign");
  const survivors = faults.filter((m) => !m.killed).map((m) => m.id);
  const benignKilled = benign.filter((m) => m.killed).map((m) => m.id);
  return {
    schema: SCHEMA,
    rev,
    catalogue: CATALOGUE_PATH,
    catalogue_sha256: sha256(cat),
    counter_sha256_at_rev: counterBlob === null ? null : sha256(counterBlob),
    counter_sha256_running: sha256(readFileSync(SELF)),
    gates,
    fault_total: faults.length,
    fault_killed: faults.length - survivors.length,
    fault_survivors: survivors.length,
    survivors,
    benign_total: benign.length,
    benign_killed: benignKilled.length,
    benign_killed_ids: benignKilled,
    mutants,
    clean: survivors.length === 0 && benignKilled.length === 0,
  };
}

// ---- self-test ------------------------------------------------------------------

// A toy gate: check(x) is true iff 0 < x < 10. Its own self-test cases are
// selected by the fixture; the counter is exercised against it.
function toyGate({ cases = ["in", "low", "high"], extra = "", comment = "" } = {}) {
  const table = {
    in: `{ id: "in", run: () => check(5) === true }`,
    low: `{ id: "low", run: () => check(0) === false }`,
    high: `{ id: "high", run: () => check(10) === false }`,
    srcgrep: `{ id: "srcgrep", run: () => readFileSync(fileURLToPath(import.meta.url), "utf8").includes("x " + "> 0") }`,
    broken: `{ id: "broken", run: () => check(5) === false }`,
  };
  return [
    "#!/usr/bin/env node",
    `// toy gate${comment}`,
    'import { readFileSync } from "node:fs";',
    'import { fileURLToPath } from "node:url";',
    "export function check(x) {",
    "  const a = x > 0;",
    "  const b = x < 10;",
    "  return a && b;",
    "}",
    extra,
    `const CASES = [${cases.map((c) => table[c]).join(", ")}];`,
    "const results = CASES.map((c) => { let ok = false; try { ok = c.run() === true; } catch { ok = false; } return { id: c.id, ok }; });",
    "const passed = results.filter((r) => r.ok).length;",
    'if (process.argv.includes("--selftest")) {',
    "  console.log(JSON.stringify({ ok: passed === results.length, cases: results.length, passed, results }));",
    "  process.exit(passed === results.length ? 0 : 3);",
    "}",
    "",
  ].join("\n");
}

const TOY = "scripts/toy-gate.mjs";
const M_A = { id: "a-true", script: TOY, kind: "fault", find: "const a = x > 0;", replace: "const a = true;" };
const M_B = { id: "b-true", script: TOY, kind: "fault", find: "const b = x < 10;", replace: "const b = true;" };
const M_A_EQ = { id: "a-eq", script: TOY, kind: "benign", find: "const a = x > 0;", replace: "const a = 0 < x;" };
const M_CRASH = { id: "a-crash", script: TOY, kind: "fault", find: "const a = x > 0;", replace: "const a = (() => { process.exit(9); })();" };

function catalogueOf(mutants, gates = [TOY]) {
  return `${JSON.stringify({ schema: CATALOGUE_SCHEMA, gates: gates.map((script) => ({ script })), mutants }, null, 2)}\n`;
}

const CASES = [
  { id: "all-killed-benign-survives-clean", exit: 0, survivors: 0, benignKilled: 0, build: (d) => { d.put(TOY, toyGate()); d.put(CATALOGUE_PATH, catalogueOf([M_A, M_B, M_A_EQ])); } },
  { id: "uncovered-check-survives", exit: 1, survivors: 1, benignKilled: 0, build: (d) => { d.put(TOY, toyGate({ cases: ["in", "low"] })); d.put(CATALOGUE_PATH, catalogueOf([M_A, M_B, M_A_EQ])); } },
  { id: "source-grep-case-false-kills-benign", exit: 1, survivors: 0, benignKilled: 1, build: (d) => { d.put(TOY, toyGate({ cases: ["in", "low", "high", "srcgrep"] })); d.put(CATALOGUE_PATH, catalogueOf([M_A, M_B, M_A_EQ])); } },
  { id: "crash-counts-as-killed", exit: 0, survivors: 0, benignKilled: 0, build: (d) => { d.put(TOY, toyGate({ cases: ["in", "high"] })); d.put(CATALOGUE_PATH, catalogueOf([M_CRASH, M_B])); } },
  { id: "find-absent-could-not-evaluate", exit: 2, survivors: null, benignKilled: null, build: (d) => { d.put(TOY, toyGate()); d.put(CATALOGUE_PATH, catalogueOf([{ ...M_A, find: "const a = x >= 0;" }])); } },
  { id: "find-twice-could-not-evaluate", exit: 2, survivors: null, benignKilled: null, build: (d) => { d.put(TOY, toyGate({ comment: " const a = x > 0;" })); d.put(CATALOGUE_PATH, catalogueOf([M_A])); } },
  { id: "pristine-not-clean-could-not-evaluate", exit: 2, survivors: null, benignKilled: null, build: (d) => { d.put(TOY, toyGate({ cases: ["in", "broken"] })); d.put(CATALOGUE_PATH, catalogueOf([M_A])); } },
  { id: "mutant-aware-literal-could-not-evaluate", exit: 2, survivors: null, benignKilled: null, build: (d) => { d.put(TOY, toyGate({ extra: 'const BLACKLIST = "const b = true;";' })); d.put(CATALOGUE_PATH, catalogueOf([M_A, M_B])); } },
  { id: "catalogue-absent-could-not-evaluate", exit: 2, survivors: null, benignKilled: null, build: (d) => { d.put(TOY, toyGate()); } },
  { id: "gate-script-absent-could-not-evaluate", exit: 2, survivors: null, benignKilled: null, build: (d) => { d.put(CATALOGUE_PATH, catalogueOf([M_A])); } },
  { id: "unknown-kind-could-not-evaluate", exit: 2, survivors: null, benignKilled: null, build: (d) => { d.put(TOY, toyGate()); d.put(CATALOGUE_PATH, catalogueOf([{ ...M_A, kind: "neutral" }])); } },
  { id: "bad-rev-could-not-evaluate", exit: 2, survivors: null, benignKilled: null, rev: "no such rev!", build: (d) => { d.put(TOY, toyGate()); d.put(CATALOGUE_PATH, catalogueOf([M_A])); } },
];

function makeFixture(base) {
  const root = mkdtempSync(join(base, "fx-"));
  const run = (args) => {
    const r = spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
    if (r.status !== 0) throw new Error(`fixture git ${args[0]} failed: ${r.stderr}`);
    return r.stdout;
  };
  run(["init", "-q"]);
  const top = run(["rev-parse", "--show-toplevel"]).trim();
  if (top !== root) throw new Error(`fixture root mismatch: ${top} != ${root}`);
  run(["config", "user.email", "fixture@tabi.local"]);
  run(["config", "user.name", "tabi-fixture"]);
  return {
    root,
    put(rel, data) { const abs = join(root, rel); mkdirSync(dirname(abs), { recursive: true }); writeFileSync(abs, data); },
    commit() { run(["add", "-A"]); run(["commit", "--allow-empty", "-q", "-m", "fixture"]); return run(["rev-parse", "HEAD"]).trim(); },
  };
}

function runSelftest() {
  const base = mkdtempSync(join(tmpdir(), "tabi-gate-mutants-selftest-"));
  const results = [];
  try {
    for (const c of CASES) {
      const fx = makeFixture(base);
      const work = mkdtempSync(join(base, "work-"));
      try {
        c.build(fx);
        const head = fx.commit();
        let exit;
        let out;
        try {
          out = evaluate(fx.root, c.rev ?? head, work);
          exit = out.clean ? 0 : 1;
        } catch (e) {
          if (!(e instanceof Refusal)) throw e;
          exit = 2;
          out = { fault_survivors: null, benign_killed: null, refusal: e.message };
        }
        const ok = exit === c.exit && out.fault_survivors === c.survivors && out.benign_killed === c.benignKilled;
        results.push({ id: c.id, ok, expectedExit: c.exit, exit, survivors: out.fault_survivors, benignKilled: out.benign_killed, refusal: out.refusal ?? null });
      } finally {
        rmSync(fx.root, { recursive: true, force: true });
        rmSync(work, { recursive: true, force: true });
      }
    }
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
  const failed = results.filter((r) => !r.ok);
  return { schema: SELFTEST_SCHEMA, cases: results.length, passed: results.length - failed.length, results, ok: failed.length === 0 };
}

// ---- cli ----------------------------------------------------------------------------

function parseArgs(argv) {
  const opts = { json: false, selftest: false, rev: null, repo: LANE, work: null, keep: false, help: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--json") opts.json = true;
    else if (a === "--selftest") opts.selftest = true;
    else if (a === "--keep") opts.keep = true;
    else if (a === "--help" || a === "-h") opts.help = true;
    else if (a === "--rev") opts.rev = argv[++i];
    else if (a === "--repo") opts.repo = argv[++i];
    else if (a === "--work") opts.work = argv[++i];
    else throw new Refusal(`unknown argument: ${a}`);
  }
  return opts;
}

function main() {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (e) {
    console.error(`GATE_MUTANTS verdict=could-not-evaluate detail=${e.message}`);
    process.exit(2);
  }
  if (opts.help) {
    console.log("usage: node scripts/check-gate-mutants.mjs --rev <REV> [--work DIR] [--keep] [--json] | --selftest [--json]");
    process.exit(0);
  }
  if (opts.selftest) {
    const out = runSelftest();
    if (opts.json) console.log(JSON.stringify(out, null, 2));
    else {
      for (const r of out.results) console.log(`CASE id=${r.id} expected_exit=${r.expectedExit} exit=${r.exit} survivors=${r.survivors ?? "-"} benign_killed=${r.benignKilled ?? "-"}${r.refusal ? ` refusal=${r.refusal}` : ""} ${r.ok ? "PASS" : "FAIL"}`);
      console.log(`GATE_MUTANTS_SELFTEST verdict=${out.ok ? "clean" : "failed"} cases=${out.cases} passed=${out.passed}`);
    }
    process.exit(out.ok ? 0 : 3);
  }
  if (!opts.rev) {
    console.error("GATE_MUTANTS verdict=could-not-evaluate detail=usage: --rev <REV>, or --selftest");
    process.exit(2);
  }
  const work = opts.work ? (mkdirSync(opts.work, { recursive: true }), mkdtempSync(join(opts.work, "gate-mutants-"))) : mkdtempSync(join(tmpdir(), "tabi-gate-mutants-"));
  let out;
  try {
    out = evaluate(opts.repo, opts.rev, work);
  } catch (e) {
    if (!(e instanceof Refusal)) throw e;
    console.error(`GATE_MUTANTS verdict=could-not-evaluate detail=${e.message}`);
    process.exit(2);
  } finally {
    if (!opts.keep) rmSync(work, { recursive: true, force: true });
  }
  if (opts.json) console.log(JSON.stringify(out, null, 2));
  else {
    for (const m of out.mutants) console.log(`MUTANT id=${m.id} kind=${m.kind} outcome=${m.outcome} exit=${m.exit ?? "-"} failing=${m.failing_cases.join(",") || "-"}`);
    console.log(`GATE_MUTANTS verdict=${out.clean ? "clean" : "failed"} rev=${out.rev} fault_total=${out.fault_total} fault_killed=${out.fault_killed} fault_survivors=${out.fault_survivors} benign_total=${out.benign_total} benign_killed=${out.benign_killed} catalogue_sha256=${out.catalogue_sha256}`);
  }
  process.exit(out.clean ? 0 : 1);
}

main();
