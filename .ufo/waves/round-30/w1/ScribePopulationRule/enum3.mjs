import { readFileSync } from "node:fs";
const TAG_RE = /refs\/tags\/(\d+\.\d+\.\d+\.\d+)\//g;
const stable = "156.0.8078.47";
const cmp = (a, b) => { const A = a.split(".").map(Number), B = b.split(".").map(Number); for (let i = 0; i < 4; i += 1) if (A[i] !== B[i]) return A[i] - B[i]; return 0; };
const CHROMIUM = /chromium\.googlesource\.com|github\.com\/chromium\/chromium|raw\.githubusercontent\.com\/chromium\/chromium|ChromeDevTools\/devtools-frontend/;
const DEVTOOLS_COMMIT = /(?:github\.com\/ChromeDevTools\/devtools-frontend\/(?:blob|raw)|raw\.githubusercontent\.com\/ChromeDevTools\/devtools-frontend)\/([0-9a-f]{40})\//;
const rows = [];
for (const line of readFileSync(process.argv[2], "utf8").split("\n")) {
  if (!/^ {0,3}\|\s*S\d{3,}\s*\|/.test(line)) continue;
  const c = line.split("|").map((x) => x.trim());
  if (c.length !== 13) continue;
  rows.push({ id: c[1], source: c[2], anchor: c[6], recheck: c[10], tags: [...new Set([...c[2].matchAll(TAG_RE)].map((m) => m[1]))] });
}
const on = rows.filter((r) => r.recheck === "on-release");
const reason = (r) => {
  if (r.tags.some((t) => cmp(t, stable) < 0)) return "included";
  if (r.tags.length) return "at-stable";
  const d = r.source.match(DEVTOOLS_COMMIT);
  if (d) return "deps-devtools-commit";
  if (/github\.com\/chromium\/chromium\/(?:blob|raw)\/main|raw\.githubusercontent\.com\/chromium\/chromium\/main/.test(r.source)) return "main-branch";
  if (CHROMIUM.test(r.source)) return "chromium-no-version-anchor";
  return "non-chromium-host";
};
const byReason = {};
for (const r of on) (byReason[reason(r)] ??= []).push(r.id);
const devtoolsFiles = on.filter((r) => reason(r) === "deps-devtools-commit").map((r) => {
  const files = new Set();
  for (const m of `${r.source} ${r.anchor}`.matchAll(/([A-Za-z0-9_.-]+\.(?:ts|cc|h|pdl|test\.ts))/g)) files.add(m[1]);
  return { id: r.id, files: [...files], commit: r.source.match(DEVTOOLS_COMMIT)?.[1] ?? null };
});
console.log(JSON.stringify({ total_rows: rows.length, on_release: on.length, by_reason: byReason, counts: Object.fromEntries(Object.entries(byReason).map(([k, v]) => [k, v.length])), devtools_files: devtoolsFiles }, null, 1));
