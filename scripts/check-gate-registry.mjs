#!/usr/bin/env node
// check-gate-registry.mjs — tabi lane gate: gate-registry conformance.
//
// Verdict: 0 clean, 1 failed (>=1 nonconformant gate), 2 could-not-evaluate
//          (usage, unreadable revision, git failure). Any other nonzero code is
//          undeclared and reads as could-not-evaluate.
// Self-test: `--selftest` (22 isolated cases over temporary sandbox repositories;
//          asserts exit code AND stable finding id; creates and removes its own
//          temp trees, never touches the lane).
// Pinned values: the expected exit/finding table is the CASES constant in this
//          file; corpus/evidence/round-24/ carries the round's measured
//          receipts (c1-measurements.json).
// Write scope: stdout/stderr only. Production reads committed git blobs;
//          --selftest writes/deletes only its own temporary repositories under
//          the OS temp dir. Never reads credentials or session material, never
//          executes a command named in the registry.
// Owner: tabi L1.
//
// What it decides
// ---------------
// PROTOCOL.md §Gate standard fixes a gate's registry row: name, gate|probe,
// entry command, verdict map (code -> class), self-test command and spelling,
// pinned-value path, write scope, owner. A child lane's registry home is its
// own SKILL.md. This gate derives the lane's gate set from the bytes at a
// revision (never from the registry itself, so the registry cannot vouch for
// its own completeness):
//
//   gate set = scripts at <rev> whose basename matches the lane's gate naming
//              convention (check-*.mjs, *audit*.mjs)  UNION  scripts a
//              gate-kind registry row invokes in its entry/self-test cell.
//
// Registry tables are parsed schema-aware: the header row above each separator
// line names the columns, so the lane's five historical table shapes (4-, 5-,
// 6- and 8-column) are read by header name, never by fixed position. A legacy
// row whose kind cell reads "gate / tabi" carries its owner after the slash.
//
// For every gate, the LATEST registry row for it in document order wins (later
// rows supersede earlier ones — the lane's append-only correction convention).
// A gate is nonconformant when it has no row (e1), when its latest row lacks a
// required field (e2), or when a row for it names a script absent at <rev>
// (e3). A row whose kind is `probe` registers a probe, not a gate: it enters
// the gate set only through the naming convention, and then its kind is a
// defect.
//
// Findings are stable ids: e1-missing-row, e2-field-incomplete,
// e3-row-script-absent. The counted field is `nonconformant` (integer).
//
// Usage:
//   node scripts/check-gate-registry.mjs --rev <40-hex-or-ref> [--json]
//   node scripts/check-gate-registry.mjs --selftest [--json]
//   node scripts/check-gate-registry.mjs --repo <dir> --rev <ref> [--json]   (tests)
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SCHEMA = "tabi-gate-registry-v1";
const SELFTEST_SCHEMA = "tabi-gate-registry-selftest-v1";
const LANE = join(dirname(fileURLToPath(import.meta.url)), "..");
const FIELDS = ["name", "kind", "entry", "verdictMap", "selftest", "pinned", "scope", "owner"];
const GATE_CONVENTION = /^(check-[a-z0-9-]+|[a-z0-9-]*audit[a-z0-9-]*)\.mjs$/;

class Refusal extends Error {
  constructor(message) {
    super(message);
    this.name = "Refusal";
  }
}

// ---- git (read-only) --------------------------------------------------------

function git(repo, args, opts = {}) {
  const r = spawnSync("git", ["-C", repo, ...args], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_SYSTEM: "/dev/null" },
    ...opts,
  });
  if (r.error) throw new Refusal(`git ${args[0]} failed: ${r.error.message}`);
  return r;
}

function readBlob(repo, rev, path) {
  const r = git(repo, ["show", `${rev}:${path}`]);
  if (r.status !== 0) throw new Refusal(`cannot read ${path} at ${rev}: ${(r.stderr || "").trim().split("\n")[0]}`);
  return r.stdout;
}

function listTree(repo, rev) {
  const r = git(repo, ["ls-tree", "-r", "--name-only", rev]);
  if (r.status !== 0) throw new Refusal(`cannot list ${rev}: ${(r.stderr || "").trim().split("\n")[0]}`);
  return r.stdout.split("\n").filter(Boolean);
}

function resolveRev(repo, rev) {
  if (!rev || !/^[A-Za-z0-9][A-Za-z0-9._\/-]*$/.test(rev)) throw new Refusal(`bad revision: ${JSON.stringify(rev)}`);
  const r = git(repo, ["rev-parse", "--verify", "--quiet", `${rev}^{commit}`]);
  if (r.status !== 0) throw new Refusal(`revision does not resolve: ${rev}`);
  return r.stdout.trim();
}

// ---- registry parsing (schema-aware) ---------------------------------------

function splitCells(line) {
  // Cells never contain a literal pipe; an escaped pipe is content, not a
  // separator.
  const parts = [];
  let cur = "";
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === "\\" && line[i + 1] === "|") {
      cur += "|";
      i += 1;
    } else if (ch === "|") {
      parts.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  parts.push(cur);
  return parts.slice(1, -1).map((c) => c.trim());
}

const SEPARATOR = /^\|[\s:|-]+\|$/;

function parseTables(text) {
  const rows = [];
  const lines = text.split("\n");
  let i = 0;
  while (i < lines.length) {
    if (lines[i].startsWith("|") && i + 1 < lines.length && SEPARATOR.test(lines[i + 1].trim())) {
      const header = splitCells(lines[i]);
      let j = i + 2;
      while (j < lines.length && lines[j].startsWith("|")) {
        rows.push({ line: j + 1, header, cells: splitCells(lines[j]) });
        j += 1;
      }
      i = j;
    } else {
      i += 1;
    }
  }
  return rows;
}

function col(header, re) {
  for (let k = 0; k < header.length; k += 1) if (re.test(header[k])) return k;
  return -1;
}

function cellAt(row, idx) {
  return idx >= 0 && idx < row.cells.length ? (row.cells[idx] || "").trim() : null;
}

function fieldOf(row, re, fallbackIdx) {
  const k = col(row.header, re);
  if (k >= 0) return cellAt(row, k);
  return fallbackIdx === undefined ? null : cellAt(row, fallbackIdx);
}

function kindOf(row) {
  const k = col(row.header, /kind/i);
  if (k >= 0) return (cellAt(row, k) || "").toLowerCase();
  return "";
}

function parseRows(skillText) {
  const rows = [];
  for (const t of parseTables(skillText)) {
    const kindCell = kindOf(t);
    const m = /^(gate|probe)\b/i.exec(kindCell);
    if (!m) continue;
    const name = fieldOf(t, /^name$/i, 0) || "";
    const kind = m[1].toLowerCase();
    const entry = fieldOf(t, /entry/i) || "";
    const verdictCell = fieldOf(t, /verdict/i);
    const selftest = fieldOf(t, /self-?test|self-invocation/i) || "";
    const pinned = fieldOf(t, /pinned|persisted/i) || "";
    const scope = fieldOf(t, /write scope|scope/i) || "";
    let owner = fieldOf(t, /owner/i);
    if (owner === null) {
      // legacy "Kind / owner" cell: owner after the slash
      const parts = kindCell.split("/");
      owner = parts.length > 1 ? parts.slice(1).join("/").trim() : "";
    }
    rows.push({
      line: t.line,
      name,
      kind,
      kindCell,
      entry,
      verdict: verdictCell,
      selftest,
      pinned,
      scope,
      owner,
      cells: t.cells,
    });
  }
  return rows;
}

const SCRIPT_TOKEN = /((?:\.{0,2}\/)?[A-Za-z0-9_.\/-]+\.mjs)/g;

function scriptsInRow(row) {
  const found = new Set();
  for (const text of [row.entry, row.selftest]) {
    for (const m of (text || "").matchAll(SCRIPT_TOKEN)) {
      const p = m[1].replace(/^\.\//, "");
      if (p.startsWith("/")) continue;
      found.add(p);
    }
  }
  return [...found];
}

function missingFields(row) {
  const missing = [];
  if (!/^[A-Za-z0-9][A-Za-z0-9 ._/-]{2,}$/.test(row.name || "")) missing.push("name");
  if (row.kind !== "gate") missing.push("kind");
  if (!row.entry || row.entry.length < 8) missing.push("entry");
  const verdictText = row.verdict ? `${row.entry} ${row.verdict}` : row.entry;
  const has0 = /\b0\b\s*[-=:>]*\s*clean\b/i.test(verdictText);
  const has1 = /\b1\b\s*[-=:>]*\s*(failed|findings|finding|red|semantic failed)\b/i.test(verdictText);
  const has2 = /\b2\b\s*[-=:>]*\s*(could[ -]?not[ -]?evaluate|could not evaluate|usage|refus)/i.test(verdictText);
  if (!has0 || !has1 || !has2) missing.push("verdictMap");
  if (!/--self-?test\b/.test(row.selftest || "")) missing.push("selftest");
  if (!row.pinned || row.pinned.length < 8 || !(/[/.]/.test(row.pinned) || /[0-9a-f]{7,}/i.test(row.pinned))) missing.push("pinned");
  if (!row.scope || row.scope.length < 10 || !/read|writ|temp|isolat|stdout|nothing|no /i.test(row.scope)) missing.push("scope");
  if (!row.owner || row.owner.length < 2 || !/tabi|lane|L1|shokunin|owner/i.test(row.owner)) missing.push("owner");
  return missing;
}

// ---- verdict ----------------------------------------------------------------

export function evaluate(repo, revArg) {
  const rev = resolveRev(repo, revArg);
  const skill = readBlob(repo, rev, "SKILL.md");
  const tree = listTree(repo, rev);
  const treeSet = new Set(tree);
  const rows = parseRows(skill);
  const gateRows = rows.filter((r) => r.kind === "gate");

  // gate set: convention scripts present at the revision, plus scripts a
  // gate-kind row invokes.
  const gates = new Map();
  for (const path of tree) {
    if (!path.startsWith("scripts/")) continue;
    const base = path.slice("scripts/".length);
    if (GATE_CONVENTION.test(base)) gates.set(path, { name: base.replace(/\.mjs$/, ""), script: path });
  }
  for (const row of gateRows) {
    for (const script of scriptsInRow(row)) {
      if (!gates.has(script)) gates.set(script, { name: row.name, script });
    }
  }

  const findings = [];
  const gateReports = [];
  for (const [script, gate] of [...gates.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const owned = gateRows.filter((r) => r.name === gate.name || scriptsInRow(r).includes(script));
    const latest = owned.length ? owned[owned.length - 1] : null;
    const rowExists = Boolean(latest);
    const absentScript = rowExists && !treeSet.has(script);
    const missing = rowExists ? missingFields(latest) : FIELDS.slice();
    const nonconformant = !rowExists || missing.length > 0 || absentScript;
    if (!rowExists) {
      findings.push({ id: "e1-missing-row", gate: gate.name, script, line: null, detail: "no gate-kind registry row names this gate" });
    }
    if (rowExists && missing.length) {
      findings.push({ id: "e2-field-incomplete", gate: gate.name, script, line: latest.line, detail: `latest row missing: ${missing.join(", ")}` });
    }
    if (absentScript) {
      findings.push({ id: "e3-row-script-absent", gate: gate.name, script, line: latest.line, detail: "row names a script that does not exist at this revision" });
    }
    gateReports.push({ name: gate.name, script, row: latest ? latest.line : null, rows: owned.length, missing, nonconformant });
  }

  return {
    schema: SCHEMA,
    rev,
    skillBytes: Buffer.byteLength(skill),
    rows: rows.length,
    gates: gateReports,
    findings,
    nonconformant: gateReports.filter((g) => g.nonconformant).length,
    clean: findings.length === 0,
  };
}

// ---- self-test --------------------------------------------------------------

const CANONICAL = "| Name | Kind | Entry command | Verdict map | Self-test | Pinned-value path | Write scope | Owner |";
const CANONICAL_SEP = "|---|---|---|---|---|---|---|---|";
const LEGACY = "| Name | Kind / owner | Entry and verdict map | Self-invocation | Persisted pinned values | Write scope |";
const LEGACY_SEP = "|---|---|---|---|---|---|";

const cleanRow = (name, script, shape = "canonical") =>
  shape === "canonical"
    ? `| ${name} | gate | \`node ${script} --rev REV\` | 0=clean; 1=failed; 2=could-not-evaluate | \`node ${script} --selftest\` | corpus/evidence/round-24/${name}.json | stdout only; self-test writes an isolated temp tree | tabi L1 |`
    : `| ${name} | gate / tabi | \`node ${script} --rev REV\`; 0 clean, 1 failed, 2 could-not-evaluate | \`node ${script} --selftest\`; 4 isolated cases | corpus/evidence/round-24/${name}.json pins expected exit/finding | stdout only; self-test writes an isolated temp tree |`;

const CASES = [
  { id: "clean-canonical-row", exit: 0, findings: [], build: (d) => { d.script("scripts/check-alpha.mjs"); d.skill(CANONICAL, CANONICAL_SEP, [cleanRow("alpha", "scripts/check-alpha.mjs")]); } },
  { id: "clean-legacy-six-column-row", exit: 0, findings: [], build: (d) => { d.script("scripts/check-alpha.mjs"); d.skill(LEGACY, LEGACY_SEP, [cleanRow("alpha", "scripts/check-alpha.mjs", "legacy")]); } },
  { id: "missing-row", exit: 1, findings: ["e1-missing-row"], build: (d) => { d.script("scripts/check-alpha.mjs"); d.skill(CANONICAL, CANONICAL_SEP, []); } },
  { id: "kind-column-absent", exit: 1, findings: ["e1-missing-row"], build: (d) => { d.script("scripts/check-alpha.mjs"); d.skill("| Name | Entry | Verdict map | Pinned / checked | Write scope |", "|---|---|---|---|---|", ["| alpha | `node scripts/check-alpha.mjs --rev REV` | 0 clean, 1 failed, 2 could-not-evaluate | `corpus/evidence/round-24/a.json` | stdout only; no writes |"]); } },
  { id: "missing-owner", exit: 1, findings: ["e2-field-incomplete"], build: (d) => { d.script("scripts/check-alpha.mjs"); d.skill(CANONICAL, CANONICAL_SEP, [cleanRow("alpha", "scripts/check-alpha.mjs").replace("| tabi L1 |", "|  |")]); } },
  { id: "missing-selftest", exit: 1, findings: ["e2-field-incomplete"], build: (d) => { d.script("scripts/check-alpha.mjs"); d.skill(CANONICAL, CANONICAL_SEP, [cleanRow("alpha", "scripts/check-alpha.mjs").replace("`node scripts/check-alpha.mjs --selftest`", "a helper checks it")]); } },
  { id: "verdict-map-incomplete", exit: 1, findings: ["e2-field-incomplete"], build: (d) => { d.script("scripts/check-alpha.mjs"); d.skill(CANONICAL, CANONICAL_SEP, [cleanRow("alpha", "scripts/check-alpha.mjs").replace("0=clean; 1=failed; 2=could-not-evaluate", "0=ok")]); } },
  { id: "probe-row-for-convention-gate", exit: 1, findings: ["e1-missing-row"], build: (d) => { d.script("scripts/check-alpha.mjs"); d.skill(CANONICAL, CANONICAL_SEP, [cleanRow("alpha", "scripts/check-alpha.mjs").replace("| gate |", "| probe |")]); } },
  { id: "pinned-value-missing", exit: 1, findings: ["e2-field-incomplete"], build: (d) => { d.script("scripts/check-alpha.mjs"); d.skill(CANONICAL, CANONICAL_SEP, [cleanRow("alpha", "scripts/check-alpha.mjs").replace("corpus/evidence/round-24/alpha.json", "none")]); } },
  { id: "scope-missing", exit: 1, findings: ["e2-field-incomplete"], build: (d) => { d.script("scripts/check-alpha.mjs"); d.skill(CANONICAL, CANONICAL_SEP, [cleanRow("alpha", "scripts/check-alpha.mjs").replace("stdout only; self-test writes an isolated temp tree", "  ")]); } },
  { id: "name-empty", exit: 1, findings: ["e2-field-incomplete"], build: (d) => { d.script("scripts/check-alpha.mjs"); d.skill(CANONICAL, CANONICAL_SEP, [cleanRow("alpha", "scripts/check-alpha.mjs").replace("| alpha |", "|  |")]); } },
  { id: "entry-cell-none", exit: 1, findings: ["e2-field-incomplete"], build: (d) => { d.script("scripts/check-alpha.mjs"); d.skill(CANONICAL, CANONICAL_SEP, [cleanRow("alpha", "scripts/check-alpha.mjs").replace("`node scripts/check-alpha.mjs --rev REV`", "none")]); } },
  { id: "verdict-code2-dropped", exit: 1, findings: ["e2-field-incomplete"], build: (d) => { d.script("scripts/check-alpha.mjs"); d.skill(CANONICAL, CANONICAL_SEP, [cleanRow("alpha", "scripts/check-alpha.mjs").replace("; 2=could-not-evaluate", "")]); } },
  { id: "selftest-flag-typo", exit: 1, findings: ["e2-field-incomplete"], build: (d) => { d.script("scripts/check-alpha.mjs"); d.skill(CANONICAL, CANONICAL_SEP, [cleanRow("alpha", "scripts/check-alpha.mjs").replace("--selftest", "--selftestt")]); } },
  { id: "gate-renamed-row-orphans-script", exit: 1, findings: ["e1-missing-row", "e3-row-script-absent"], build: (d) => { d.script("scripts/check-alpha.mjs"); d.skill(CANONICAL, CANONICAL_SEP, [cleanRow("beta", "scripts/check-beta.mjs")]); } },
  { id: "row-script-absent", exit: 1, findings: ["e3-row-script-absent"], build: (d) => { d.script("scripts/check-alpha.mjs"); d.skill(CANONICAL, CANONICAL_SEP, [cleanRow("alpha", "scripts/check-alpha.mjs"), cleanRow("beta", "scripts/check-beta.mjs")]); } },
  { id: "supersession-latest-wins", exit: 0, findings: [], build: (d) => { d.script("scripts/check-alpha.mjs"); d.skill(CANONICAL, CANONICAL_SEP, [cleanRow("alpha", "scripts/check-alpha.mjs").replace("| tabi L1 |", "|  |"), cleanRow("alpha", "scripts/check-alpha.mjs")]); } },
  { id: "supersession-later-row-red", exit: 1, findings: ["e2-field-incomplete"], build: (d) => { d.script("scripts/check-alpha.mjs"); d.skill(CANONICAL, CANONICAL_SEP, [cleanRow("alpha", "scripts/check-alpha.mjs"), cleanRow("alpha", "scripts/check-alpha.mjs").replace("| tabi L1 |", "|  |")]); } },
  { id: "audit-convention-name", exit: 0, findings: [], build: (d) => { d.script("scripts/round-evidence-audit.mjs"); d.skill(CANONICAL, CANONICAL_SEP, [cleanRow("round-evidence-audit", "scripts/round-evidence-audit.mjs")]); } },
  { id: "row-named-gate-outside-scripts", exit: 0, findings: [], build: (d) => { d.script(".ufo/waves/round-12/w1/mistake/check-claim-record.mjs"); d.skill(CANONICAL, CANONICAL_SEP, [cleanRow("claim-record-discipline", ".ufo/waves/round-12/w1/mistake/check-claim-record.mjs")]); } },
];

function makeFixture() {
  const root = mkdtempSync(join(tmpdir(), "tabi-gate-registry-"));
  const run = (args) => {
    const r = spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
    if (r.status !== 0) throw new Error(`fixture git ${args[0]} failed: ${r.stderr}`);
    return r.stdout;
  };
  run(["init", "-q"]);
  run(["config", "user.email", "fixture@tabi.local"]);
  run(["config", "user.name", "tabi-fixture"]);
  return {
    root,
    script(rel) {
      const abs = join(root, rel);
      mkdirSync(dirname(abs), { recursive: true });
      writeFileSync(abs, "// fixture gate\n");
    },
    skill(header, sep, rows) {
      writeFileSync(join(root, "SKILL.md"), `# fixture\n\n${header}\n${sep}\n${rows.join("\n")}\n`);
    },
    commit() {
      run(["add", "-A"]);
      run(["commit", "-q", "-m", "fixture"]);
      return run(["rev-parse", "HEAD"]).trim();
    },
  };
}

function runSelftest() {
  const results = [];
  for (const c of CASES) {
    const fx = makeFixture();
    try {
      c.build(fx);
      const rev = fx.commit();
      let out;
      let exit = 0;
      try {
        out = evaluate(fx.root, rev);
        exit = out.clean ? 0 : 1;
      } catch (e) {
        if (!(e instanceof Refusal)) throw e;
        exit = 2;
        out = { findings: [{ id: "refused" }] };
      }
      const ids = out.findings.map((f) => f.id).sort();
      const expected = [...c.findings].sort();
      const ok = exit === c.exit && JSON.stringify(ids) === JSON.stringify(expected);
      results.push({ id: c.id, ok, expectedExit: c.exit, exit, expectedFindings: expected, findings: ids });
    } finally {
      rmSync(fx.root, { recursive: true, force: true });
    }
  }
  const fx = makeFixture();
  try {
    fx.skill(CANONICAL, CANONICAL_SEP, []);
    fx.commit();
    for (const rev of ["../etc/passwd", "0000000000000000000000000000000000000000"]) {
      let exit = 0;
      let id = null;
      try {
        evaluate(fx.root, rev);
      } catch (e) {
        if (!(e instanceof Refusal)) throw e;
        exit = 2;
        id = "refused";
      }
      results.push({ id: rev.startsWith("..") ? "refusal-bad-rev-syntax" : "refusal-unresolvable-rev", ok: exit === 2, expectedExit: 2, exit, expectedFindings: ["refused"], findings: id ? [id] : [] });
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
    console.error(`GATE_REGISTRY verdict=could-not-evaluate detail=${e.message}`);
    process.exit(2);
  }
  if (opts.help) {
    console.log("usage: node scripts/check-gate-registry.mjs --rev <REV> [--json] | --selftest [--json]");
    process.exit(0);
  }
  if (opts.selftest) {
    const out = runSelftest();
    if (opts.json) console.log(JSON.stringify(out, null, 2));
    else {
      for (const r of out.results) console.log(`CASE id=${r.id} expected_exit=${r.expectedExit} exit=${r.exit} expected=${r.expectedFindings.join(",") || "-"} actual=${r.findings.join(",") || "-"} ${r.ok ? "PASS" : "FAIL"}`);
      console.log(`GATE_REGISTRY_SELFTEST verdict=${out.ok ? "clean" : "failed"} cases=${out.cases} passed=${out.passed}`);
    }
    process.exit(out.ok ? 0 : 3);
  }
  if (!opts.rev) {
    console.error("GATE_REGISTRY verdict=could-not-evaluate detail=usage: --rev <REV> or --selftest");
    process.exit(2);
  }
  let out;
  try {
    out = evaluate(opts.repo, opts.rev);
  } catch (e) {
    if (!(e instanceof Refusal)) throw e;
    console.error(`GATE_REGISTRY verdict=could-not-evaluate detail=${e.message}`);
    process.exit(2);
  }
  if (opts.json) console.log(JSON.stringify(out, null, 2));
  else {
    for (const g of out.gates) {
      console.log(`GATE name=${g.name} script=${g.script} row=${g.row ?? "-"} rows=${g.rows} ${g.nonconformant ? `NONCONFORMANT missing=${g.missing.join(",") || "-"}` : "conformant"}`);
    }
    for (const f of out.findings) console.log(`FINDING id=${f.id} gate=${f.gate} line=${f.line ?? "-"} detail=${f.detail}`);
    console.log(`GATE_REGISTRY verdict=${out.clean ? "clean" : "failed"} rev=${out.rev} rows=${out.rows} gates=${out.gates.length} nonconformant=${out.nonconformant} findings=${out.findings.length}`);
  }
  process.exit(out.clean ? 0 : 1);
}

main();
