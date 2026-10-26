#!/usr/bin/env node
// compare baseline noharm-at-15dfacc.txt with the rerun noharm-<short>.txt
// line by line: exit codes, order, and command identity (normalised).
import { readFileSync } from "node:fs";

const basePath = process.argv[2];
const newPath = process.argv[3];
const base = readFileSync(basePath, "utf8").split("\n").filter((l) => l.length);
const cur = readFileSync(newPath, "utf8").split("\n").filter((l) => l.length);

const exitOf = (line) => {
  const m = line.match(/:: exit=(\d+)/) || line.match(/exit=(\d+)/);
  return m ? Number(m[1]) : null;
};
const cmdOf = (line) => {
  // command part is before " :: " or " --self-test"/" --selftest"
  const i = line.indexOf(" :: ");
  const raw = i >= 0 ? line.slice(0, i) : line;
  return raw
    .replace(/--at [0-9a-f]{40}/, "--at <REV>")
    .replace(/--rev [0-9a-f]{7,40}/, "--rev <REV>")
    .replace(/\/fast\/scratch\/hyaku\/[^ ]*\/corpus\/SOURCES.md/, "<CLONE>/corpus/SOURCES.md")
    .replace(/--baseline [0-9a-f]{7,40}/, "--baseline <PIN>")
    .replace(/\s+/g, " ")
    .trim();
};

let fails = 0;
const rows = [];
const n = Math.max(base.length, cur.length);
for (let i = 0; i < n; i += 1) {
  const b = base[i];
  const c = cur[i];
  if (!b || !c) {
    fails += 1;
    rows.push({ i: i + 1, verdict: b ? "MISSING-in-rerun" : "EXTRA-in-rerun", base: b ? exitOf(b) : null, cur: c ? exitOf(c) : null, cmd: (b || c).slice(0, 100) });
    continue;
  }
  const be = exitOf(b);
  const ce = exitOf(c);
  const bc = cmdOf(b);
  const cc = cmdOf(c);
  const sameCmd = bc === cc;
  let verdict = "same";
  if (!sameCmd) verdict = "CMD-DIFF";
  if (be === 0 && ce !== 0) verdict = "REGRESSION";
  else if (be !== ce && be === 0) verdict = "REGRESSION";
  if (verdict !== "same") fails += 1;
  rows.push({ i: i + 1, verdict, base: be, cur: ce, cmd: cc.slice(0, 100), baseCmd: sameCmd ? null : bc.slice(0, 100) });
}
for (const r of rows) {
  const tag = r.verdict === "same" ? "ok " : "XX ";
  console.log(`${tag}${String(r.i).padStart(2, "0")} base=${r.base} cur=${r.cur} ${r.cmd}`);
  if (r.baseCmd) console.log(`     baseline cmd: ${r.baseCmd}`);
}
const regressions = rows.filter((r) => r.verdict === "REGRESSION").length;
const diff = rows.filter((r) => r.verdict !== "same").length;
console.log(`\nSUMMARY lines_base=${base.length} lines_cur=${cur.length} regressions=${regressions} non_identical=${diff}`);
process.exit(regressions === 0 && diff === 0 ? 0 : 1);
