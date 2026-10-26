#!/usr/bin/env node
// MutC1Rows evidence extraction: S122 collision context + survivor mutated lines.
import { spawnSync } from "node:child_process";
const S = "/fast/scratch/hyaku/tabi-r31/MutC1Rows";
const CLONE = `${S}/clone`;
const REV = "486048356f0712e4396588c9dab58cd419243120";
const git = (args) => {
  const r = spawnSync("git", ["-C", CLONE, ...args], { encoding: "buffer", maxBuffer: 256 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")}: ${r.stderr}`);
  return r.stdout;
};
const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", "#39": "'", "#x27": "'", mdash: "—", ndash: "–", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", hellip: "…" };
function normalise(buf) {
  let t = buf.toString("utf8");
  if (/<!doctype html|<html[\s>]/i.test(t)) {
    t = t.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ");
    t = t.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+[0-9]*);/gi, (m, e) => {
      const k = e.toLowerCase();
      if (k.startsWith("#x")) return String.fromCodePoint(parseInt(k.slice(2), 16));
      if (k.startsWith("#") && k !== "#39") return String.fromCodePoint(parseInt(k.slice(1), 10));
      return ENTITIES[k] ?? m;
    });
  }
  return t.replace(/\s+/g, " ").trim();
}
const q = "Otherwise, wait for at least one minute before retrying.";
for (const id of ["S121", "S122"]) {
  const meta = JSON.parse(git(["show", `${REV}:corpus/evidence/round-31/decision-table/${id}.json`]).toString());
  const t = normalise(git(["show", `${REV}:${meta.bytes_path}`]));
  const i = t.indexOf(q);
  console.log(`== ${id} occurrence at char ${i} ==`);
  console.log(`…${t.slice(Math.max(0, i - 230), i + q.length + 170)}…`);
}
console.log("=== survivor mutated lines ===");
const matrix = JSON.parse(await import("node:fs").then ? (await import("node:fs")).readFileSync(`${S}/out/matrix.json`, "utf8") : "{}");
const revOf = (id) => matrix.mutants.find((m) => m.id === id)?.rev;
for (const [id, row] of [["m5-E2b", "D6"], ["m7-D5", "D5"], ["m7-D7", "D7"], ["m7-D9", "D9"], ["m6-F1", "D14"], ["m2b-D5", "D5"], ["m3-D1", "D1"]]) {
  const rev = revOf(id);
  const line = git(["show", `${rev}:corpus/knowledge/rate-signal-decision-table.md`]).toString().split("\n").find((l) => l.trim().startsWith(`| ${row} `));
  console.log(`-- ${id} (${rev}) row ${row}:`);
  console.log(line);
}
