#!/usr/bin/env node
// Throwaway contract-conformance prototype for ExecCliContract's spec.
// NOT production code: it exists to fix the exact bytes of the six findings
// on round-22 and to prove the round-21 control yields zero findings.
import { execFileSync } from "node:child_process";
import { dirname } from "node:path";
import { realpathSync } from "node:fs";

const LANE = execFileSync("git", ["-C", dirname(realpathSync(process.argv[1])), "rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
const FLEET = dirname(LANE);
const WAVE_MAX_LANES = 64;
const ROUND_SEAT_CAP = 128;

const args = process.argv.slice(2);
const rev = (() => {
  const i = args.indexOf("--rev");
  return execFileSync("git", ["-C", LANE, "rev-parse", "--verify", `${args[i + 1]}^{commit}`], { encoding: "utf8" }).trim();
})();
const round = Number(args[args.indexOf("--round") + 1]);

function g(a) { try { return execFileSync("git", a, { encoding: "utf8", maxBuffer: 256 << 20 }); } catch { return null; } }
const show = (p) => g(["-C", LANE, "show", `${rev}:${p}`]);
const tree = g(["-C", LANE, "ls-tree", "-r", "--name-only", rev]).split("\n").filter(Boolean);
const exists = (p) => tree.includes(p);

// ---- report resolution -------------------------------------------------
let reportPath = null, reportBytes = null, reportCommit = null;
const laneReport = `.ufo/reports/round-${round}/tabi.md`;
if (exists(laneReport)) {
  reportPath = laneReport;
  reportBytes = show(laneReport);
  reportCommit = rev;
} else {
  const fleetRel = `.ufo/reports/round-${round}/tabi.md`;
  reportCommit = execFileSync("git", ["-C", FLEET, "log", "-1", "--format=%H", "--", fleetRel], { encoding: "utf8" }).trim();
  reportBytes = g(["-C", FLEET, "show", `HEAD:${fleetRel}`]);
  reportPath = `../${fleetRel}`;
}
if (reportBytes === null) { console.error("refused: report-absent"); process.exit(2); }
const sha = execFileSync("sha256sum", { input: reportBytes, encoding: "utf8" }).slice(0, 64);
const reportRef = `${reportPath}@${sha}`;
const findings = [];

// c1
{
  const files = tree.filter((p) => new RegExp(`^\\.ufo/waves/round-${round}/w[0-9a-z]*-cap-refusal-[0-9]+\\.json$`).test(p));
  const m = reportBytes.match(/(\d+)\s+whole-payload/);
  const cited = m ? Number(m[1]) : null;
  if (cited === null ? files.length > 0 : cited !== files.length) {
    findings.push({
      class: "c1-refusal-arithmetic",
      cited: `whole-payload-refusals=${cited === null ? "absent" : cited}`,
      derived: `whole-payload-refusals=${files.length}`,
      evidence: { root: `.ufo/waves/round-${round}`, report: reportRef, reportCommit },
    });
  }
}
// c2
{
  const specs = tree.filter((p) => new RegExp(`^\\.ufo/waves/round-${round}/w[0-9a-z]*-spec\\.json$`).test(p));
  const declared = Math.max(...specs.map((p) => JSON.parse(show(p) || "{}").maxLanes ?? 0));
  const tm = reportBytes.match(/Round total:\s*(\d+)\s+seats/);
  const total = tm ? Number(tm[1]) : null;
  if (declared > WAVE_MAX_LANES || (total !== null && total > ROUND_SEAT_CAP)) {
    findings.push({
      class: "c2-wave-caps",
      cited: `declaredMaxLanes=${declared},roundSeats=${total === null ? "absent" : total}`,
      derived: `waveMaxLanes=${WAVE_MAX_LANES},roundSeatCap=${ROUND_SEAT_CAP}`,
      evidence: { root: `.ufo/waves/round-${round}`, report: reportRef, reportCommit },
    });
  }
}
// c3
{
  const artifact = `corpus/lessons/round-${round}-verifier-spotcheck.md`;
  const lesson = `corpus/lessons/round-${round}.md`;
  if (exists(artifact) && exists(lesson)) {
    const lines = show(lesson).split("\n");
    const start = lines.findIndex((l) => l.trim() === "## Gate");
    let end = lines.findIndex((l, i) => i > start && /^## /.test(l));
    if (end < 0) end = lines.length;
    const gate = start < 0 ? [] : lines.slice(start + 1, end);
    const rows = gate.filter((l) => /(spot-check|owed to closure)/i.test(l)).length;
    if (rows === 0) {
      findings.push({
        class: "c3-gate-spotcheck",
        cited: "gate-spotcheck=absent",
        derived: `artifact=${artifact},gateRows=${rows}`,
        evidence: { root: "corpus/lessons", report: reportRef, reportCommit },
      });
    }
  }
}
// c4
{
  const launch = reportBytes.match(/watchdog launches\s+(\d{4}-\d{2}-\d{2}(?:,\s*\d{4}-\d{2}-\d{2})*)/);
  const attempts = launch ? launch[1].split(",").length : 1;
  const graded = reportBytes.split("\n").filter((l) => /^\s*[-*]\s+\*\*Attempt\s+\d+/.test(l)).length;
  if (attempts > 1 && graded < attempts) {
    const sm = reportBytes.match(/^\s*(?:[-*]\s*)?(?:\*\*)?Stale-lane:(?:\*\*)?\s*(\S+)/m);
    findings.push({
      class: "c4-stale-attempts",
      cited: `stale-lane=${sm ? sm[1].toLowerCase() : "absent"}`,
      derived: `attempts=${attempts},graded=${graded}`,
      evidence: { root: null, report: reportRef, reportCommit },
    });
  }
}
// c5
{
  const regs = tree.filter((p) => new RegExp(`^\\.ufo/waves/round-${round}/.*swarm-registry\\.json$`).test(p));
  let evaluated = 0, members = 0, unidentified = 0;
  for (const p of regs) {
    const d = JSON.parse(show(p));
    const dir = String(d.reportDir || "").replace(/\/+$/, "");
    const ran = tree.some((q) => q.startsWith(`${dir}/`) && q.endsWith(".md"));
    if (!ran) continue; // wave never produced reports: no identities owed
    const ms = Object.values(d.members || {});
    evaluated++;
    members += ms.length;
    unidentified += ms.filter((x) => x.agentId == null || x.agentId === "").length;
  }
  if (unidentified > 0) {
    const disclosed = /(not|no|without)\s+agent\s+ids/i.test(reportBytes);
    findings.push({
      class: "c5-registry-identities",
      cited: `registryIds=${disclosed ? "names-only" : "absent"}`,
      derived: `registries=${evaluated},members=${members},unidentified=${unidentified}`,
      evidence: { root: `.ufo/waves/round-${round}`, report: reportRef, reportCommit },
    });
  }
}
// c6
{
  const lines = reportBytes.split("\n");
  const start = lines.findIndex((l) => l.trim() === "## Landed changes");
  let end = lines.findIndex((l, i) => i > start && /^## /.test(l));
  if (end < 0) end = lines.length;
  const section = start < 0 ? [] : lines.slice(start + 1, end);
  const unbound = new Set(), commits = new Set();
  const tableRows = section.filter((l) => /^\|/.test(l)).length >= 3
    ? section.filter((l) => /^\|/.test(l)).length - 2
    : 0;
  let rows = tableRows;
  for (const line of section) {
    let hit = false;
    for (const tok of line.match(/(?<![0-9a-f])[0-9a-f]{7,40}(?![0-9a-f])/g) || []) {
      const full = g(["-C", LANE, "rev-parse", "--verify", "--quiet", `${tok}^{commit}`]);
      if (!full) continue;
      const h = full.trim();
      commits.add(h);
      hit = true;
      const log = g(["-C", LANE, "show", "--name-only", "--format=", h, "--", "LOG.md"]);
      if (!log || !/^LOG\.md$/m.test(log)) unbound.add(h);
    }
    if (hit && tableRows === 0) rows++; // bullet-shaped section: one row per commit-bearing bullet
  }
  if (unbound.size > 0) {
    const sorted = [...unbound].sort();
    findings.push({
      class: "c6-landed-log-binding",
      cited: `rows=${rows}`,
      derived: `rows=${rows},commits=${commits.size},logBound=${commits.size - unbound.size},unbound=${sorted.join(",")}`,
      evidence: { root: null, report: reportRef, reportCommit },
    });
  }
}

const out = {
  schema: "tabi-round-evidence-audit-v1",
  rev, round, classes: 6, findings, clean: findings.length === 0,
};
console.log(JSON.stringify(out));
process.exit(out.clean ? 0 : 1);
