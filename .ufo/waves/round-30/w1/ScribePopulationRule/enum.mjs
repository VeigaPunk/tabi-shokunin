import { readFileSync } from "node:fs";
const TAG_RE = /refs\/tags\/(\d+\.\d+\.\d+\.\d+)\//g;
const stable = "156.0.8078.47";
const cmp = (a,b) => { const A=a.split(".").map(Number), B=b.split(".").map(Number); for (let i=0;i<4;i++){ if(A[i]!==B[i]) return A[i]-B[i]; } return 0; };
const text = readFileSync(process.argv[2], "utf8");
const rows = [];
for (const line of text.split("\n")) {
  if (!/^ {0,3}\|\s*S\d{3,}\s*\|/.test(line)) continue;
  const cells = line.split("|").map((c) => c.trim());
  if (cells.length !== 13) continue;
  rows.push({ id: cells[1], source: cells[2], anchor: cells[6], teaches: cells[7], recheck: cells[10], tags: [...new Set([...cells[2].matchAll(TAG_RE)].map((m) => m[1]))] });
}
const onRelease = rows.filter((r) => r.recheck === "on-release");
const included = onRelease.filter((r) => r.tags.some((t) => cmp(t, stable) < 0));
const excluded = onRelease.filter((r) => !r.tags.some((t) => cmp(t, stable) < 0));
const out = {
  total_rows: rows.length,
  on_release: onRelease.length,
  included: included.map((r) => r.id),
  excluded: excluded.map((r) => ({ id: r.id, tags: r.tags, source_head: r.source.slice(0, 120) })),
  all_on_release_ids: onRelease.map((r) => r.id),
};
console.log(JSON.stringify(out, null, 2));
