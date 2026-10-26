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
  rows.push({ id: cells[1], source: cells[2], anchor: cells[6], recheck: cells[10], tags: [...new Set([...cells[2].matchAll(TAG_RE)].map((m) => m[1]))] });
}
const onRelease = rows.filter((r) => r.recheck === "on-release");
const excluded = onRelease.filter((r) => !r.tags.some((t) => cmp(t, stable) < 0));
const chromiumish = excluded.filter((r) => /chromium\.googlesource\.com|github\.com\/chromium\/chromium|github\.com\/ChromeDevTools\/devtools-frontend|raw\.githubusercontent\.com\/ChromeDevTools\/devtools-frontend|DEPS/.test(r.source));
console.log(JSON.stringify({
  excluded_count: excluded.length,
  excluded_at_stable_tag: excluded.filter((r) => r.tags.length && r.tags.every((t) => cmp(t, stable) >= 0)).map((r) => r.id),
  excluded_no_tag: excluded.filter((r) => r.tags.length === 0).length,
  chromium_revision_outside_tag: chromiumish.map((r) => ({ id: r.id, recheck: r.recheck, source: r.source })),
}, null, 2));
