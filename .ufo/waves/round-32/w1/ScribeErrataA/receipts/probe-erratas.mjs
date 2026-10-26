// Round-32 ScribeErrataA: re-check errata E3/E7/E8/E9 against the frozen counter at 4181fff.
// No network: every live check uses an injected fetcher (the counter's own `fetcher` option).
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";

const CLONE = process.argv[2];
const OUT = process.argv[3];
// The counter calls main() unconditionally at import, so a byte-identical copy
// with only the trailing `main();` bootstrap removed is imported instead.
const srcFile = join(CLONE, "scripts/check-decision-table.mjs");
const srcText = readFileSync(srcFile, "utf8");
const stripped = srcText.replace(/\nmain\(\);\n?$/, "\n");
if (stripped === srcText) throw new Error("bootstrap line not found; refusing to import");
writeFileSync(join(OUT, "counter-nocli.mjs"), stripped);
const mod = await import(join(OUT, "counter-nocli.mjs"));
const { evaluate } = mod;

const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const ENTRY = "corpus/knowledge/fx-table.md";
const RECEIPTS = "corpus/evidence/round-31/decision-table";

function regRow(id, { source = "Fixture spec", usedBy = ENTRY } = {}) {
  return `| ${id} | ${source} | spec | A | scope | §2 | teaches | mined | 2026-10-26 | 180d | ${usedBy} |`;
}
const registry = (lines) =>
  ["# SOURCES", "", "| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |",
   "|---|---|---|---|---|---|---|---|---|---|---|", ...lines, ""].join("\n");

function fixture({ baselineSource, source, row, quoteText, receiptUrl, extraBytes }) {
  const root = mkdtempSync(join(OUT, "fx-"));
  const git = (args) => {
    const r = spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
    if (r.status !== 0) throw new Error(`git ${args[0]}: ${r.stderr}`);
    return r.stdout.trim();
  };
  git(["init", "-q"]);
  if (git(["rev-parse", "--show-toplevel"]) !== root) throw new Error("fixture root mismatch");
  git(["config", "user.email", "errata@scratch.local"]);
  git(["config", "user.name", "ScribeErrataA"]);
  const put = (rel, data) => { const abs = join(root, rel); mkdirSync(dirname(abs), { recursive: true }); writeFileSync(abs, data); };
  put("corpus/SOURCES.md", registry([regRow("S001", { usedBy: "corpus/knowledge/old.md" })]));
  git(["add", "-A"]); git(["commit", "--allow-empty", "-q", "-m", "baseline"]);
  const baseline = git(["rev-parse", "HEAD"]);
  put("corpus/SOURCES.md", registry([regRow("S001", { usedBy: "corpus/knowledge/old.md" }), regRow("S002", { source })]));
  put(ENTRY, ["# Fixture", "", "source: S002", "verified-at: 2026-10-26", "recheck: 180d", "",
    "| Row | Signal | Decision | Threshold | Source | Located quote |", "|---|---|---|---|---|---|", row, "", "Trailing.", ""].join("\n"));
  const bytesPath = `${RECEIPTS}/bytes/S002.txt`;
  put(bytesPath, quoteText);
  put(`${RECEIPTS}/S002.json`, JSON.stringify({ id: "S002", url: receiptUrl, fetched_at: "2026-10-26T00:00:00Z",
    fetched_by: "errata-fixture", http_status: 200, bytes_path: bytesPath, sha256: sha256(Buffer.from(quoteText)) }));
  if (extraBytes) put(extraBytes.path, extraBytes.data);
  git(["add", "-A"]); git(["commit", "--allow-empty", "-q", "-m", "measured"]);
  const head = git(["rev-parse", "HEAD"]);
  return { root, baseline, head };
}

const rows = [];
function run(id, what, spec, fetcher) {
  const fx = fixture(spec);
  let res, exit;
  try {
    res = fetcher === "default"
      ? evaluate(fx.root, fx.head, { baseline: fx.baseline, entry: ENTRY, live: true })
      : evaluate(fx.root, fx.head, { baseline: fx.baseline, entry: ENTRY, live: Boolean(fetcher), fetcher });
    exit = res.clean ? 0 : 1;
  } catch (e) {
    rows.push({ case: id, what, status: `REFUSAL ${e.message}` });
    rmSync(fx.root, { recursive: true, force: true });
    return;
  }
  rows.push({ case: id, what, exit, population: res.population, admitted: res.admitted, failing: res.failing,
    reason: res.rows.map((r) => r.reason).filter(Boolean).join(",") || "-" });
  rmSync(fx.root, { recursive: true, force: true });
}

// E3-a: an illustrative figure inside a quote sources a row.
const Q_EX = "If the robots.txt file is undefined for a reasonably long period of time (for example, 30 days), crawlers MAY assume";
run("E3-a-example-admitted", "quote carries '(for example, 30 days)', threshold 30 days",
  { source: "Fixture spec — https://example.org/spec.txt", row: `| D1 | \`robots.txt\` unreachable | allow | 30 days | S002 | "${Q_EX}" |`,
    quoteText: `${Q_EX} that the file is unavailable.\n`, receiptUrl: "https://example.org/spec.txt" });

// E3-b: same figure with the "for example" marker truncated away.
const Q_EX2 = "If the robots.txt file is undefined for a reasonably long period of time, 30 days, crawlers MAY assume";
run("E3-b-example-marker-truncated", "same figure, 'for example' deleted; threshold 30 days",
  { source: "Fixture spec — https://example.org/spec.txt", row: `| D1 | \`robots.txt\` unreachable | allow | 30 days | S002 | "${Q_EX2}" |`,
    quoteText: `${Q_EX2} that the file is unavailable.\n`, receiptUrl: "https://example.org/spec.txt" });

// E7: a 200 page that echoes the quote (soft 404) passes l1-live.
const Q = "Otherwise, wait for at least one minute before retrying.";
run("E7-echo-page-live", "receipt bytes hold the sentence; the live page is a soft-404 echo",
  { source: "Fixture spec — https://example.org/spec.txt", row: `| D2 | \`429\` without \`retry-after\` | wait | at least 1 minute | S002 | "${Q}" |`,
    quoteText: `${Q}\n`, receiptUrl: "https://example.org/spec.txt" },
  () => ({ code: 200, effective: "https://example.org/spec.txt",
    body: Buffer.from(`<!doctype html><html><body><p>We could not find that page. Your query matched: ${Q}</p></body></html>`) }));

// E8: the fetched URL is only a prefix of the cited source cell.
run("E8-prefix-url-live", "receipt url https://example.org, source cell cites the document at /spec.txt",
  { source: "Fixture spec — https://example.org/spec.txt",
    row: `| D3 | \`429\` | wait | at least 1 minute | S002 | "${Q}" |`, quoteText: `${Q}\n`,
    receiptUrl: "https://example.org" },
  () => ({ code: 200, effective: "https://example.org", body: Buffer.from(`${Q}\n`) }));

// E9: two unparseable hosts compare equal.
run("E9-null-host-guard", "receipt url and effective url both unparseable by new URL()",
  { source: "Fixture spec — https://[::1/spec.txt",
    row: `| D4 | \`429\` | wait | at least 1 minute | S002 | "${Q}" |`, quoteText: `${Q}\n`,
    receiptUrl: "https://[::1" },
  () => ({ code: 200, effective: "https://[::1/spec", body: Buffer.from(`${Q}\n`) }));

// E6: the default fetch path resolves `curl` through PATH; a stub earlier in PATH serves a
// fabricated 200 page and the counter admits it with no packet leaving the host.
run("E6-pathstub-live", "default curlFetch (no injected fetcher), stub curl first in PATH",
  { source: "Fixture spec — https://example.org/spec.txt",
    row: `| D5 | \`429\` | wait | at least 1 minute | S002 | "${Q}" |`, quoteText: `${Q}\n`,
    receiptUrl: "https://example.org/spec.txt" }, "default");

// hostOf, sliced from the lane bytes and evaluated verbatim.
const src = srcText;
const hm = /function hostOf\(url\) \{[\s\S]*?\n\}/.exec(src);
console.log(hm ? "HOSTOF_SOURCE_FOUND copy=y" : "HOSTOF_SOURCE_FOUND copy=n");
const hostOf = eval(`(${hm[0].replace("function hostOf", "function")})`);
const a = hostOf("https://[::1");
const b = hostOf("https://[::1/spec");
console.log(`HOSTOF a=${JSON.stringify(a)} b=${JSON.stringify(b)} guard_passes=${!(a !== b)}`);

console.log("CASE\tEXIT\tPOP\tADM\tFAIL\tREASON\tWHAT");
for (const r of rows) console.log([r.case, r.exit ?? "-", r.population ?? "-", r.admitted ?? "-", r.failing ?? "-", r.reason ?? r.status, r.what].join("\t"));
