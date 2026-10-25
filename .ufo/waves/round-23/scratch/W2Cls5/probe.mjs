#!/usr/bin/env node
// W2Cls5 falsifier for c5-registry-identities. Reads REAL round-22 committed bytes at the
// round baseline and overrides exactly one file (or drops it) per case, then re-runs the
// auditor's own exported audit() over a ctx that is gitCtx except for that override.
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const LANE = "/home/vgpnk/Projects/shokunin/tabi-shokunin";
const SCRIPT = `${LANE}/scripts/round-evidence-audit.mjs`;
const mod = await import(pathToFileURL(SCRIPT).href);
const REV = "a89f1935f523a64b00991d792fca6a8c0d321948";
const ROUND = 22;
const ROUND_CAP = 65;
const CID = "c5-registry-identities";
const REG = `.ufo/waves/round-22/w2b/swarm-registry.json`;
const policy = JSON.parse(readFileSync("/home/vgpnk/Projects/shokunin/scripts/hyaku/ufo-wave-policy.json", "utf8"));
const reportText = readFileSync(`/home/vgpnk/Projects/shokunin/.ufo/reports/round-${ROUND}/tabi.md`, "utf8");
const base = mod.gitCtx(LANE, REV);
const lessonText = base.read(`corpus/lessons/round-${ROUND}.md`);

function ctxWith({ override = null, drop = [] } = {}) {
  return {
    ...base,
    list(prefix) {
      const all = base.list(prefix);
      return all === null ? null : all.filter((p) => !drop.includes(p));
    },
    read(path) {
      if (drop.includes(path)) return null;
      if (override && Object.prototype.hasOwnProperty.call(override, path)) return override[path];
      return base.read(path);
    },
  };
}

function run(name, mutate, expect) {
  const { override = null, drop = [] } = mutate || {};
  const ctx = ctxWith({ override, drop });
  const res = mod.audit(ctx, { round: ROUND, policy, roundCap: ROUND_CAP, reportText, lessonText });
  const c5 = res.findings.filter((f) => f.class === CID);
  const observed = c5.length === 0 ? "silent" : `${c5.length}x ${c5.map((f) => f.derived).join(" | ")}`;
  const pass =
    expect === "fire"
      ? c5.length > 0
      : expect === "unreadable"
        ? c5.some((f) => /registry-unreadable/.test(String(f.derived)))
        : c5.length === 0;
  return { name, expect, pass, observed, detail: c5.map((f) => ({ cited: f.cited, derived: f.derived, evidence: f.evidence[0] })) };
}

const raw = base.read(REG);
const reg = JSON.parse(raw);
const names = Object.keys(reg.members);
const oneFilled = JSON.parse(raw);
oneFilled.members[names[0]].agentId = `L1Tabi23.${names[0]}`;
const allFilled = JSON.parse(raw);
for (const n of names) allFilled.members[n].agentId = `L1Tabi23.${n}`;
const allBlank = JSON.parse(raw);
for (const n of names) allBlank.members[n].agentId = "";
const emptyMembers = JSON.parse(raw);
emptyMembers.members = {};
const arrayMembers = JSON.parse(raw);
arrayMembers.members = [];

const cases = [
  run("A-baseline-65-null", null, "fire"),
  run("B-one-id-filled", { override: { [REG]: JSON.stringify(oneFilled) } }, "fire"),
  run("C-all-ids-filled", { override: { [REG]: JSON.stringify(allFilled) } }, "silent"),
  run("D-registry-file-absent", { drop: [REG] }, "unreadable"),
  run("E-registry-unparseable", { override: { [REG]: "{not json" } }, "unreadable"),
  run("F-member-array-not-object", { override: { [REG]: JSON.stringify(arrayMembers) } }, "unreadable"),
  run("G-empty-members-object", { override: { [REG]: JSON.stringify(emptyMembers) } }, "unreadable"),
  run("H-all-ids-empty-string", { override: { [REG]: JSON.stringify(allBlank) } }, "fire"),
];

const out = {
  rev: REV,
  round: ROUND,
  scriptSha256: mod.SCHEMA && null,
  registryMembers: names.length,
  registryNullIds: names.filter((n) => !reg.members[n] || !reg.members[n].agentId).length,
  cases: cases.map(({ name, expect, pass, observed, detail }) => ({ name, expect, pass, observed, detail })),
  allPass: cases.every((c) => c.pass),
};
console.log(JSON.stringify(out, null, 2));
process.exitCode = out.allPass ? 0 : 1;
