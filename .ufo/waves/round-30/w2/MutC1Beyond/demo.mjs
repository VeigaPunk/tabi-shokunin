// MutC1Beyond demo pass — for each SURVIVED mutant, build a minimal fixture
// where the pristine gate and the mutated gate must disagree, run both with
// --repo/--rev (production path), and record both verdicts. A demo where the
// two verdicts differ proves the survivor is a real behaviour change (not an
// equivalent mutant) and doubles as the missing self-test case design.
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { createHash } from "node:crypto";

const S = "/fast/scratch/hyaku/tabi-r30/MutC1Beyond";
const TMP = join(S, "demo-tmp");
rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });
const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const PRISTINE = {
  s106: join(S, "clone", "scripts", "check-s106-evidence.mjs"),
  pins: join(S, "clone", "scripts", "check-release-pins.mjs"),
};
const MUT = (id) => join(S, "mutants", `${id}.mjs`);

function git(root, args) {
  const r = spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
  if (r.status !== 0) throw new Error(`fixture git ${args[0]} failed: ${r.stderr}`);
  return r.stdout;
}
function put(root, rel, data) {
  const abs = join(root, rel);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, data);
}

// ---------------- s106 fixtures (mirror of the gate's own fixture shapes) ----
const FIXTURE_LINE = "BASE_FEATURE(kBackForwardCache, base::FEATURE_ENABLED_BY_DEFAULT);";
const FIXTURE_COMMENT = "// Enable using the BackForwardCache.";
const FIXTURE_BYTES = [
  "// content_features.cc fixture",
  ...Array.from({ length: 184 }, (_, i) => `// filler ${i + 2}`),
  FIXTURE_COMMENT,
  FIXTURE_LINE,
  "// tail",
  "",
].join("\n");
const RECEIPT_PATH = "corpus/evidence/round-26/sources/s106.json";
const BYTES_PATH = "corpus/evidence/round-26/sources/content-features-154.0.8037.97.cc";

function s106Fixture({ bytes = FIXTURE_BYTES, receiptOver = {}, dropKeys = [], revArg = null, twoCommits = false }) {
  const root = mkdtempSync(join(TMP, "s106-"));
  git(root, ["init", "-q"]);
  git(root, ["config", "user.email", "demo@scratch.local"]);
  git(root, ["config", "user.name", "demo"]);
  put(root, BYTES_PATH, bytes);
  const receipt = {
    schema: "tabi-s106-evidence-v1",
    row: "S106",
    url: "https://example.invalid/fixture?format=TEXT",
    fetched_at: "2026-10-25",
    transfer: "base64 (?format=TEXT)",
    bytes_path: BYTES_PATH,
    decoded_bytes: Buffer.byteLength(bytes),
    decoded_sha256: sha256(bytes),
    anchor: { line: 187, text: FIXTURE_LINE, comment_line: 186, comment: FIXTURE_COMMENT, occurrences_in_file: 1 },
    ...receiptOver,
  };
  for (const k of dropKeys) delete receipt[k];
  const firstRev = (() => { git(root, ["add", "-A"]); git(root, ["commit", "--allow-empty", "-q", "-m", "c1"]); return git(root, ["rev-parse", "HEAD"]).trim(); })();
  if (receipt.measured_rev === undefined) receipt.measured_rev = firstRev;
  put(root, RECEIPT_PATH, `${JSON.stringify(receipt, null, 2)}\n`);
  git(root, ["add", "-A"]);
  git(root, ["commit", "--allow-empty", "-q", "-m", "c2"]);
  if (twoCommits) git(root, ["commit", "--allow-empty", "-q", "-m", "c3"]);
  return { root, revArg: revArg ?? "HEAD" };
}

// ---------------- release-pins fixtures (mirror of the gate's own shapes) ----
const OLD = "154.0.8037.97";
const NEW = "156.0.8078.47";
const P = "content/public/common/feature.cc";
const OLD_TEXT = "// header\nint a = 1;\n// Enable the thing.\nBASE_FEATURE(kThing, ENABLED);\nint z = 9;\n";
const NEW_SAME = "// header v2\nint a = 2;\n\n// Enable the thing.\n  BASE_FEATURE(kThing,   ENABLED);\nint z = 9;\n";
const SOURCES_PATH = "corpus/SOURCES.md";
const BYTES_ROOT = "corpus/evidence/round-29/release-pins/bytes";
const REFETCH_ROOT = "corpus/evidence/round-29/release-pins/refetch";
const DEFAULT_RECEIPT = "corpus/evidence/round-29/release-pins/receipt.json";

function regLine(id, { tag = OLD, path = P, anchor, teaches = "teaches", recheck = "on-release", indent = "" } = {}) {
  const a = anchor ?? `tag ${tag}; feature.cc:3-4; sha256 ${sha256(Buffer.from(OLD_TEXT)).slice(0, 8)}…${sha256(Buffer.from(OLD_TEXT)).slice(-4)}`;
  return `${indent}| ${id} | Fixture — https://chromium.googlesource.com/chromium/src/+/refs/tags/${tag}/${path}?format=TEXT | code | A | scope | ${a} | ${teaches} | mined | 2026-10-20 | ${recheck} | — |`;
}
function registry(lines) {
  return ["# SOURCES", "", "## Registry", "", "| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |", "|---|---|---|---|---|---|---|---|---|---|---|---|", ...lines, ""].join("\n");
}
function fileEntry({ oldText = OLD_TEXT, newText = NEW_SAME, ranges = [[3, 4]], oldStatus = 200, newStatus = 200, path = P, newTag = NEW } = {}) {
  return {
    path, old_tag: OLD, old_status: oldStatus, new_status: newStatus,
    old_bytes: `${BYTES_ROOT}/${OLD}/${path}`, new_bytes: `${BYTES_ROOT}/${newTag}/${path}`,
    old_sha256: sha256(Buffer.from(oldText)), new_sha256: sha256(Buffer.from(newText)),
    ranges, _old: oldText, _new: newText,
  };
}
function pinsBuild({ regLines, rows, stable = NEW }) {
  const root = mkdtempSync(join(TMP, "pins-"));
  git(root, ["init", "-q"]);
  git(root, ["config", "user.email", "demo@scratch.local"]);
  git(root, ["config", "user.name", "demo"]);
  put(root, SOURCES_PATH, registry(regLines));
  const receipt = { schema: "tabi-release-pins-v1", stable, rows };
  for (const e of rows) {
    if (e.fetched_by === undefined) e.fetched_by = "W1-fixture";
    for (const f of e.files) {
      if (f._old !== undefined) put(root, f.old_bytes, f._old);
      if (f._new !== undefined) put(root, f.new_bytes, f._new);
      delete f._old; delete f._new;
    }
    const rf = e._refetch === undefined
      ? { seat: "W2-fixture", files: e.files.map((f) => ({ path: f.path, tag: stable, status: f.new_status, sha256: f.new_sha256 })) }
      : e._refetch;
    delete e._refetch;
    if (rf) put(root, `${REFETCH_ROOT}/${e.id}.json`, `${JSON.stringify({ id: e.id, fetched_at: "2026-10-26T00:00:00Z", ...rf }, null, 2)}\n`);
  }
  put(root, DEFAULT_RECEIPT, `${JSON.stringify(receipt, null, 2)}\n`);
  git(root, ["add", "-A"]);
  git(root, ["commit", "--allow-empty", "-q", "-m", "c1"]);
  return { root, rev: git(root, ["rev-parse", "HEAD"]).trim() };
}

function runGate(gatePath, args) {
  const r = spawnSync(process.execPath, [gatePath, ...args, "--json"], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  let parsed = null;
  try { parsed = JSON.parse(r.stdout); } catch { /* refusal text on stderr */ }
  return {
    exit: r.status,
    valid: parsed ? parsed.valid ?? null : null,
    clean: parsed ? parsed.clean ?? null : null,
    population: parsed ? parsed.population ?? null : null,
    unresolved: parsed ? parsed.unresolved ?? null : null,
    refusal: parsed ? parsed.refusal ?? null : (r.stderr || "").trim().split("\n").pop() ?? null,
  };
}

const DEMOS = [
  // ---- s106 survivors -------------------------------------------------------
  {
    id: "D1", mutant: "s106-parseReceipt-schema-drop",
    build: () => s106Fixture({ receiptOver: { schema: "tabi-s106-evidence-v0" } }),
    args: (fx) => ["--repo", fx.root, "--rev", fx.revArg],
    expect: "pristine exit 2 (schema refusal) vs mutant exit 0 valid",
  },
  {
    id: "D2", mutant: "s106-parseReceipt-string-fields-drop",
    build: () => s106Fixture({ dropKeys: ["url"] }),
    args: (fx) => ["--repo", fx.root, "--rev", fx.revArg],
    expect: "pristine exit 2 (missing url) vs mutant exit 0 valid",
  },
  {
    id: "D3", mutant: "s106-parseReceipt-rev-hex-drop",
    build: () => s106Fixture({ receiptOver: { measured_rev: "HEAD" } }),
    args: (fx) => ["--repo", fx.root, "--rev", fx.revArg],
    expect: "pristine exit 2 (measured_rev not 40-hex) vs mutant exit 0 valid",
  },
  {
    id: "D4", mutant: "s106-parseReceipt-decoded-bytes-type-drop",
    build: () => s106Fixture({ receiptOver: { decoded_bytes: String(Buffer.byteLength(FIXTURE_BYTES)) } }),
    args: (fx) => ["--repo", fx.root, "--rev", fx.revArg],
    expect: "pristine exit 2 (decoded_bytes not a number) vs mutant exit 1 invalid (byte_count_match false)",
  },
  {
    id: "D5", mutant: "s106-parseReceipt-anchor-fields-drop",
    build: () => s106Fixture({ dropKeys: ["anchor"] }),
    args: (fx) => ["--repo", fx.root, "--rev", fx.revArg],
    expect: "pristine exit 2 (missing anchor) vs mutant exit 1 invalid (anchor_located false)",
  },
  {
    id: "D6", mutant: "s106-resolveRev-syntax-drop",
    build: () => s106Fixture({ revArg: "HEAD~1", twoCommits: true }),
    args: (fx) => ["--repo", fx.root, "--rev", fx.revArg],
    expect: "pristine exit 2 (bad revision: HEAD~1) vs mutant exit 0 valid at the parent commit",
  },
  {
    id: "D7", mutant: "s106-resolveRev-unresolvable-drop",
    build: () => s106Fixture({ revArg: "cafe12" }),
    args: (fx) => ["--repo", fx.root, "--rev", fx.revArg],
    expect: "pristine exit 2 (does not resolve) vs mutant reads the INDEX via empty rev and exits 0 valid",
  },
  {
    id: "D8", mutant: "s106-anchor-located-notrim",
    build: () => {
      const padded = FIXTURE_BYTES.replace(FIXTURE_LINE, `  ${FIXTURE_LINE}`);
      return s106Fixture({ bytes: padded, receiptOver: { decoded_bytes: Buffer.byteLength(padded), decoded_sha256: sha256(padded) } });
    },
    args: (fx) => ["--repo", fx.root, "--rev", fx.revArg],
    expect: "pristine exit 0 valid (trim matches padded line) vs mutant exit 1 invalid (exact compare fails)",
  },
  {
    id: "D9", mutant: "s106-anchor-unique-notrim",
    build: () => {
      const dup = FIXTURE_BYTES.replace("// tail", `  ${FIXTURE_LINE}\n// tail`);
      return s106Fixture({ bytes: dup, receiptOver: { decoded_bytes: Buffer.byteLength(dup), decoded_sha256: sha256(dup) } });
    },
    args: (fx) => ["--repo", fx.root, "--rev", fx.revArg],
    expect: "pristine exit 1 invalid (trimmed occurrences = 2) vs mutant exit 0 valid (exact occurrences = 1)",
  },
  // ---- release-pins survivors -------------------------------------------------
  {
    id: "D10", mutant: "pins-rowre-indent-loose",
    build: () => pinsBuild({ regLines: [regLine("S001", { indent: "     " })], rows: [] }),
    args: (fx) => ["--repo", fx.root, "--rev", fx.rev, "--stable", NEW],
    expect: "pristine exit 2 (5-space row ignored, empty population) vs mutant exit 1 (row counted, unresolved)",
  },
  {
    id: "D11", mutant: "pins-parseRegistry-13cell-drop",
    build: () => pinsBuild({
      regLines: ["| S001 | Fixture — https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/content/public/common/feature.cc?format=TEXT | code | A | scope | tag 154.0.8037.97; feature.cc:3-4 | teaches | mined | 2026-10-20 | on-release | — | — |"],
      rows: [],
    }),
    args: (fx) => ["--repo", fx.root, "--rev", fx.rev, "--stable", NEW],
    expect: "pristine exit 2 (14-cell row skipped, empty population) vs mutant exit 1 (row counted, unresolved)",
  },
  {
    id: "D12", mutant: "pins-cmpVersion-first-two",
    build: () => pinsBuild({ regLines: [regLine("S001", { tag: "156.0.8078.47" })], rows: [], stable: "156.0.8078.99" }),
    args: (fx) => ["--repo", fx.root, "--rev", fx.rev, "--stable", "156.0.8078.99"],
    expect: "pristine exit 1 (47 < 99, row pinned below stable, unresolved) vs mutant exit 2 (A.B equal, not counted, empty population)",
  },
  {
    id: "D13", mutant: "pins-digestMatches-suffix-drop",
    build: () => {
      const pre = sha256(Buffer.from(OLD_TEXT)).slice(0, 8);
      return pinsBuild({
        regLines: [regLine("S001", { anchor: `tag ${OLD}; feature.cc:3-4; sha256 ${pre}…0000` })],
        rows: [{ id: "S001", files: [fileEntry()] }],
      });
    },
    args: (fx) => ["--repo", fx.root, "--rev", fx.rev, "--stable", NEW],
    expect: "pristine exit 1 (f5-digest: suffix 0000 mismatch) vs mutant exit 0 (prefix-only match, resolved)",
  },
  {
    id: "D14", mutant: "pins-receipt-schema-refusal-drop",
    build: () => {
      const fx = pinsBuild({ regLines: [regLine("S001")], rows: [{ id: "S001", files: [fileEntry()] }] });
      // rewrite the receipt with a wrong schema, keep everything else valid
      const p = join(fx.root, DEFAULT_RECEIPT);
      const doc = JSON.parse(readFileSync(p, "utf8"));
      doc.schema = "tabi-release-pins-v0";
      writeFileSync(p, `${JSON.stringify(doc, null, 2)}\n`);
      git(fx.root, ["add", "-A"]);
      git(fx.root, ["commit", "--allow-empty", "-q", "-m", "c2"]);
      return { root: fx.root, rev: git(fx.root, ["rev-parse", "HEAD"]).trim() };
    },
    args: (fx) => ["--repo", fx.root, "--rev", fx.rev, "--stable", NEW],
    expect: "pristine exit 2 (schema refusal) vs mutant exit 0 clean",
  },
  {
    id: "D15", mutant: "pins-r1-duplicate-entry-allowed",
    build: () => {
      const e = { id: "S001", files: [fileEntry()] };
      return pinsBuild({ regLines: [regLine("S001")], rows: [e, JSON.parse(JSON.stringify({ id: "S001", files: [fileEntry()] }))] });
    },
    args: (fx) => ["--repo", fx.root, "--rev", fx.rev, "--stable", NEW],
    expect: "pristine exit 1 (r1-entry duplicate) vs mutant exit 0 (first entry wins, resolved)",
  },
];

const out = { startedAt: new Date().toISOString(), demos: [] };
for (const d of DEMOS) {
  const fx = d.build();
  try {
    const pristine = runGate(PRISTINE[d.mutant.startsWith("s106") ? "s106" : "pins"], d.args(fx));
    const mutant = runGate(MUT(d.mutant), d.args(fx));
    const changed = JSON.stringify([pristine.exit, pristine.valid, pristine.clean, pristine.population, pristine.unresolved]) !==
      JSON.stringify([mutant.exit, mutant.valid, mutant.clean, mutant.population, mutant.unresolved]);
    out.demos.push({ id: d.id, mutant: d.mutant, expect: d.expect, pristine, mutant, behavior_changed: changed });
    console.log(`${changed ? "CHANGED" : "SAME"}\t${d.id}\t${d.mutant}\tpristine(exit=${pristine.exit} valid=${pristine.valid} clean=${pristine.clean} pop=${pristine.population} unres=${pristine.unresolved})\tmutant(exit=${mutant.exit} valid=${mutant.valid} clean=${mutant.clean} pop=${mutant.population} unres=${mutant.unresolved})`);
  } finally {
    rmSync(fx.root, { recursive: true, force: true });
  }
}
out.finishedAt = new Date().toISOString();
writeFileSync(join(S, "demo-results.json"), JSON.stringify(out, null, 2));
const changedCount = out.demos.filter((d) => d.behavior_changed).length;
console.log(`SUMMARY demos=${out.demos.length} behavior_changed=${changedCount}`);
