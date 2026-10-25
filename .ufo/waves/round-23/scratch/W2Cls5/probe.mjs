#!/usr/bin/env node
// W2Cls5 falsifier for c5-registry-identities (round 23 wave 2).
// Runs the auditor's own exported audit() over REAL round-22 committed bytes at the round
// baseline (a89f193…), overriding or dropping exactly one path per case. Read-only.
//
//   node .ufo/waves/round-23/scratch/W2Cls5/probe.mjs
// exit 0 = every case met its expectation; 1 = at least one expectation defeated.
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const LANE = "/home/vgpnk/Projects/shokunin/tabi-shokunin";
const mod = await import(pathToFileURL(`${LANE}/scripts/round-evidence-audit.mjs`).href);
const REV = "a89f1935f523a64b00991d792fca6a8c0d321948";
const ROUND = 22;
const ROUND_CAP = 128; // claims.json revisions[0]: the round-23 prompt's declared seat cap
const CID = "c5-registry-identities";
const DIR = `.ufo/waves/round-${ROUND}`;
const REG = `${DIR}/w2b/swarm-registry.json`;
const policy = JSON.parse(readFileSync("/home/vgpnk/Projects/shokunin/scripts/hyaku/ufo-wave-policy.json", "utf8"));
const reportText = readFileSync(`/home/vgpnk/Projects/shokunin/.ufo/reports/round-${ROUND}/tabi.md`, "utf8");
const base = mod.gitCtx(LANE, REV);
const lessonText = base.read(`corpus/lessons/round-${ROUND}.md`);
const regText = base.read(REG);
const reg = JSON.parse(regText);
const names = Object.keys(reg.members);

function view({ extra = null, drop = [] }) {
  return {
    ...base,
    list(prefix) {
      const all = base.list(prefix);
      if (all === null) return null;
      return [...new Set([...all, ...(extra ? Object.keys(extra) : [])])].filter((p) => !drop.includes(p));
    },
    read(path) {
      if (drop.includes(path)) return null;
      if (extra && path in extra) return extra[path];
      return base.read(path);
    },
  };
}

function run(name, expect, opts) {
  const res = mod.audit(view(opts), { round: ROUND, policy, roundCap: ROUND_CAP, reportText, lessonText });
  const c5 = res.findings.filter((f) => f.class === CID);
  const observed = c5.length ? `${c5.length}x ${c5.map((f) => f.derived).join(" | ")}` : "silent";
  const pass =
    expect === "fire" ? c5.length > 0 : expect === "unreadable" ? c5.some((f) => /registry-unreadable/.test(String(f.derived))) : c5.length === 0;
  return { name, expect, pass, observed };
}

const mutate = (fn) => {
  const o = JSON.parse(regText);
  fn(o.members, o);
  return JSON.stringify(o);
};

const cases = [
  // --- the claim's own arms -------------------------------------------------
  run("A-baseline-w2b-65-null", "fire", {}),
  run("B-one-id-filled-of-65", "fire", { extra: { [REG]: mutate((m) => (m[names[0]].agentId = `L1Tabi23.${names[0]}`)) } }),
  run("C-all-65-ids-filled", "silent", { extra: { [REG]: mutate((m) => names.forEach((n, i) => (m[n].agentId = `L1Tabi23.${i}`))) } }),
  run("H-all-ids-empty-string", "fire", { extra: { [REG]: mutate((m) => names.forEach((n) => (m[n].agentId = ""))) } }),
  // --- break it: the registry the wave should have ---------------------------
  run("D-spawned-wave-with-no-registry-file", "unreadable", { drop: [REG] }),
  run("E-registry-present-unparseable", "unreadable", { extra: { [REG]: "{not json" } }),
  run("F-members-is-empty-array", "unreadable", { extra: { [REG]: mutate((_m, o) => (o.members = [])) } }),
  run("G-members-is-empty-object", "unreadable", { extra: { [REG]: mutate((_m, o) => (o.members = {})) } }),
  // --- break it: the same anonymous wave under a different registry shape ----
  run("I-registry-only-nested-w2b/critic", "unreadable", { extra: { [`${DIR}/w2b/critic/swarm-registry.json`]: regText }, drop: [REG] }),
  run("J-registry-only-at-round-root-w2b-", "unreadable", { extra: { [`${DIR}/w2b-swarm-registry.json`]: regText }, drop: [REG] }),
  run("K-registry-only-named-registry.json", "unreadable", { extra: { [`${DIR}/w2b/registry.json`]: regText }, drop: [REG] }),
  // --- break it: identity quality ------------------------------------------
  run("M-constant-id-x-on-all-65", "fire", { extra: { [REG]: mutate((m) => names.forEach((n) => (m[n].agentId = "x"))) } }),
  run("N-whitespace-id-on-all-65", "fire", { extra: { [REG]: mutate((m) => names.forEach((n) => (m[n].agentId = " "))) } }),
  run("O-ids-nonexistent-in-receipt", "fire", { extra: { [REG]: mutate((m) => names.forEach((n, i) => (m[n].agentId = `ghost.seat.${i}`))) } }),
  run("P-one-id-repeated-65x", "fire", { extra: { [REG]: mutate((m) => names.forEach((n) => (m[n].agentId = "L1Tabi23.W2Cls1"))) } }),
  run("Q-registry-1-member-vs-65-spawned", "fire", {
    extra: { [REG]: JSON.stringify({ ...reg, members: { "notinreceipt-1": { kind: "spawn", agentId: "a" } } }) },
  }),
];

const out = {
  rev: REV,
  round: ROUND,
  roundCap: ROUND_CAP,
  registry: REG,
  registryMembers: names.length,
  registryNullIds: names.filter((n) => !reg.members[n] || !reg.members[n].agentId).length,
  spawned: (base.read(`${DIR}/w2b-spawn-result.json`).match(/Spawned (\d+) background agents/) || [])[1],
  w2Spawned: (base.read(`${DIR}/w2-spawn-result.json`).match(/Spawned (\d+) background agents/) || [])[1] ?? "0 (refusal-only)",
  defeated: cases.filter((c) => !c.pass).map((c) => c.name),
  cases,
};
console.log(JSON.stringify(out, null, 2));
process.exitCode = out.defeated.length ? 1 : 0;
