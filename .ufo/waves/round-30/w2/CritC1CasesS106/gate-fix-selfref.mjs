#!/usr/bin/env node
// check-s106-evidence.mjs — tabi lane gate: depth (routed source-evidence admission).
//
// Verdict: 0 valid, 1 invalid (receipt present but committed bytes disagree),
//          2 could-not-evaluate (usage, unreadable revision, receipt or bytes
//          absent at the measured revision, malformed receipt). Any other
//          nonzero code is undeclared and reads as could-not-evaluate.
// Self-test: `--selftest` (10 isolated cases over temporary sandbox
//          repositories; asserts exit code, validity, and each declared
//          field's expected value; creates and removes its own temp trees,
//          never touches the lane).
// Frozen by: .ufo/waves/round-26/claims.json claim C2 (frozen 2026-10-25,
//          executed round 27) — implements the predicate, counter, kill rule
//          and target; also checks anchor uniqueness and decoded byte count.
// Write scope: stdout/stderr only. Production reads committed git blobs only
//          (git show <rev>:<path>); it never fetches, never writes the lane,
//          never reads credentials or session material.
// Owner: tabi L1.
//
// What it decides
// ---------------
// The S106 registry row (BackForwardCache feature at Chromium tag
// 154.0.8037.97) anchors on decoded text lines 186-187 of a googlesource
// `?format=TEXT` transfer. The round-25 closure reader misread that transfer
// as plain text; round 26 committed the decoded bytes + receipt
// (corpus/evidence/round-26/sources/) as evidence-of-record. This gate makes
// the admission mechanical: at the measured revision the committed decoded
// bytes MUST hash to the receipt's decoded_sha256, and the receipt's anchor
// text MUST sit at the receipt's recorded line, uniquely. valid = present &&
// sha_match && anchor_located && anchor_unique && byte_count_match. A missing
// receipt or its referenced committed bytes is could-not-evaluate (exit 2).
//
// Usage:
//   node scripts/check-s106-evidence.mjs --rev <40-hex-or-ref> [--json]
//   node scripts/check-s106-evidence.mjs --selftest [--json]
//   node scripts/check-s106-evidence.mjs --repo <dir> --rev <ref> [--json]   (tests)
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const SCHEMA = "tabi-s106-evidence-v1";
const SELFTEST_SCHEMA = "tabi-s106-evidence-selftest-v1";
const RECEIPT_PATH = "corpus/evidence/round-26/sources/s106.json";
const RECEIPT_SCHEMA = "tabi-s106-evidence-v1";
const LANE = join(dirname(fileURLToPath(import.meta.url)), "..");

class Refusal extends Error {
  constructor(message) {
    super(message);
    this.name = "Refusal";
  }
}

// ---- git (read-only) --------------------------------------------------------

function git(repo, args) {
  const r = spawnSync("git", ["-C", repo, ...args], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_SYSTEM: "/dev/null" },
  });
  if (r.error) throw new Refusal(`git ${args[0]} failed: ${r.error.message}`);
  return r;
}

function readBlob(repo, rev, path) {
  const r = git(repo, ["show", `${rev}:${path}`]);
  if (r.status !== 0) return null;
  return r.stdout;
}

function resolveRev(repo, rev) {
  if (!rev || !/^[A-Za-z0-9][A-Za-z0-9._\/-]*$/.test(rev)) throw new Refusal(`bad revision: ${JSON.stringify(rev)}`);
  const r = git(repo, ["rev-parse", "--verify", "--quiet", `${rev}^{commit}`]);
  if (r.status !== 0) throw new Refusal(`revision does not resolve: ${rev}`);
  return r.stdout.trim();
}

function sha256(text) {
  return createHash("sha256").update(text).digest("hex");
}

// ---- evaluation -------------------------------------------------------------

function parseReceipt(text) {
  let doc;
  try {
    doc = JSON.parse(text);
  } catch {
    throw new Refusal("receipt is not JSON");
  }
  if (!doc || typeof doc !== "object") throw new Refusal("receipt is not an object");
  if (doc.schema !== RECEIPT_SCHEMA) throw new Refusal(`receipt schema mismatch: ${JSON.stringify(doc.schema)}`);
  for (const key of ["url", "decoded_sha256", "bytes_path", "measured_rev"]) {
    if (typeof doc[key] !== "string" || !doc[key]) throw new Refusal(`receipt missing ${key}`);
  }
  if (!/^[0-9a-f]{40}$/.test(doc.measured_rev)) throw new Refusal("receipt measured_rev must be a full lowercase commit id");
  if (typeof doc.decoded_bytes !== "number") throw new Refusal("receipt missing decoded_bytes");
  if (!doc.anchor || typeof doc.anchor !== "object") throw new Refusal("receipt missing anchor");
  if (typeof doc.anchor.line !== "number" || typeof doc.anchor.text !== "string" || !doc.anchor.text) {
    throw new Refusal("receipt anchor needs line (number) and text (string)");
  }
  return doc;
}

export function evaluate(repo, revArg) {
  const rev = resolveRev(repo, revArg);
  const receiptText = readBlob(repo, rev, RECEIPT_PATH);
  if (receiptText === null) throw new Refusal(`receipt absent at ${rev}`);
  const receipt = parseReceipt(receiptText);
  const measuredRev = resolveRev(repo, receipt.measured_rev);
  const measuredBytes = readBlob(repo, measuredRev, receipt.bytes_path);
  const revisionMatch = measuredBytes !== null &&
    sha256(measuredBytes) === receipt.decoded_sha256;
  const bytesText = readBlob(repo, rev, receipt.bytes_path);
  if (bytesText === null) throw new Refusal(`decoded bytes absent at ${rev}: ${receipt.bytes_path}`);
  const observedSha = sha256(bytesText);
  const shaMatch = observedSha === receipt.decoded_sha256;
  const lines = bytesText.split("\n");
  const recorded = lines[receipt.anchor.line - 1];
  const anchorLocated = recorded !== undefined && recorded.trim() === receipt.anchor.text.trim();
  const occurrences = lines.filter((l) => l.trim() === receipt.anchor.text.trim()).length;
  const anchorUnique = occurrences === 1;
  const byteCountMatch = Buffer.byteLength(bytesText) === receipt.decoded_bytes;
  const valid = revisionMatch && shaMatch && anchorLocated && anchorUnique && byteCountMatch;
  return {
    schema: SCHEMA,
    rev,
    receipt: RECEIPT_PATH,
    bytes_path: receipt.bytes_path,
    present: true,
    decoded_bytes: Buffer.byteLength(bytesText),
    decoded_sha256_claimed: receipt.decoded_sha256,
    decoded_sha256_observed: observedSha,
    sha_match: shaMatch,
    revision_match: revisionMatch,
    anchor: { line: receipt.anchor.line, text: receipt.anchor.text, occurrences },
    anchor_located: anchorLocated,
    anchor_unique: anchorUnique,
    byte_count_match: byteCountMatch,
    valid,
  };
}

// ---- self-test --------------------------------------------------------------

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
const FIXTURE_SHA = sha256(FIXTURE_BYTES);
// Same byte length as FIXTURE_BYTES, different sha: the only fixture whose
// verdict can see the sha term while the byte-count term still agrees.
const FIXTURE_TAMPERED_BYTES = FIXTURE_BYTES.replace("// tail", "// tgil");
// The anchor line appears twice (lines 187 and 188): line 187 still carries
// it, so anchor_located holds while occurrences is 2 and anchor_unique does not.
const FIXTURE_BYTES_DUPLICATE_ANCHOR = FIXTURE_BYTES.replace("// tail", `${FIXTURE_LINE}\n// tail`);
// Correction fixtures (scratch prototype): CRLF line endings plus a non-ASCII
// byte, and an independently computed digest so a mutation of the gate sha256()
// helper cannot stay self-consistent.
const FIXTURE_BYTES_CRLF_UTF8 = [
  "// content_features.cc fixture",
  ...Array.from({ length: 184 }, (_, i) => `// filler ${i + 2}`),
  FIXTURE_COMMENT,
  FIXTURE_LINE,
  "// caf\u00e9 tail",
  "",
].join("\r\n");
const FIXTURE_SHA_CRLF_UTF8 = createHash("sha256").update(Buffer.from(FIXTURE_BYTES_CRLF_UTF8, "utf8")).digest("hex");

function fixtureReceipt(over = {}) {
  return {
    schema: "tabi-s106-evidence-v1",
    row: "S106",
    url: "https://example.invalid/fixture?format=TEXT",
    fetched_at: "2026-10-25",
    transfer: "base64 (?format=TEXT)",
    bytes_path: "corpus/evidence/round-26/sources/content-features-154.0.8037.97.cc",
    decoded_bytes: Buffer.byteLength(FIXTURE_BYTES),
    decoded_sha256: FIXTURE_SHA,
    anchor: { line: 187, text: FIXTURE_LINE, comment_line: 186, comment: FIXTURE_COMMENT, occurrences_in_file: 1 },
    ...over,
  };
}

const CASES = [
  {
    id: "clean-fixture-valid",
    exit: 0,
    valid: true,
    build: (d) => { d.receipt(fixtureReceipt()); d.bytes(FIXTURE_BYTES); },
  },
  {
    id: "measured-revision-bytes-match",
    exit: 0,
    valid: true,
    field: "revision_match",
    fieldValue: true,
    build: (d) => { d.receipt(fixtureReceipt()); d.bytes(FIXTURE_BYTES); },
  },
  {
    id: "measured-revision-bytes-mismatch",
    exit: 1,
    valid: false,
    field: "revision_match",
    fieldValue: false,
    build: (d) => {
      d.bytes(FIXTURE_BYTES.replace("// tail", "// prior source bytes"));
      const measuredRev = d.commit();
      d.bytes(FIXTURE_BYTES);
      d.receipt(fixtureReceipt({ measured_rev: measuredRev }));
      d.commit();
    },
  },
  {
    id: "sha-mismatch-invalid",
    exit: 1,
    valid: false,
    field: "sha_match",
    fieldValue: false,
    build: (d) => { d.receipt(fixtureReceipt()); d.bytes(FIXTURE_BYTES.replace("// tail", "// tampered")); },
  },
  {
    id: "anchor-off-by-one-invalid",
    exit: 1,
    valid: false,
    field: "anchor_located",
    fieldValue: false,
    build: (d) => {
      const r = fixtureReceipt();
      r.anchor = { ...r.anchor, line: 188 };
      d.receipt(r);
      d.bytes(FIXTURE_BYTES);
    },
  },
  {
    id: "same-length-tamper-invalid",
    exit: 1,
    valid: false,
    field: "sha_match",
    fieldValue: false,
    build: (d) => {
      d.bytes(FIXTURE_BYTES);
      const measuredRev = d.commit();
      d.bytes(FIXTURE_TAMPERED_BYTES);
      d.receipt(fixtureReceipt({ measured_rev: measuredRev }));
      d.commit();
    },
  },
  {
    id: "duplicate-anchor-invalid",
    exit: 1,
    valid: false,
    field: "anchor_unique",
    fieldValue: false,
    build: (d) => {
      d.bytes(FIXTURE_BYTES_DUPLICATE_ANCHOR);
      const measuredRev = d.commit();
      const receipt = fixtureReceipt({
        measured_rev: measuredRev,
        decoded_bytes: Buffer.byteLength(FIXTURE_BYTES_DUPLICATE_ANCHOR),
        decoded_sha256: sha256(FIXTURE_BYTES_DUPLICATE_ANCHOR),
      });
      receipt.anchor = { ...receipt.anchor, occurrences_in_file: 2 };
      d.receipt(receipt);
      d.commit();
    },
  },
  {
    id: "receipt-byte-count-mismatch-invalid",
    exit: 1,
    valid: false,
    field: "byte_count_match",
    fieldValue: false,
    build: (d) => {
      d.bytes(FIXTURE_BYTES);
      const measuredRev = d.commit();
      d.receipt(fixtureReceipt({ measured_rev: measuredRev, decoded_bytes: Buffer.byteLength(FIXTURE_BYTES) + 7 }));
      d.commit();
    },
  },
  {
    id: "missing-bytes-could-not-evaluate",
    exit: 2,
    valid: null,
    build: (d) => { d.receipt(fixtureReceipt()); },
  },
  {
    id: "missing-receipt-could-not-evaluate",
    exit: 2,
    valid: null,
    build: () => {},
  },
  {
    id: "anchor-text-whitespace-tolerant-valid",
    exit: 0,
    valid: true,
    field: "anchor_located",
    fieldValue: true,
    build: (d) => {
      const r = fixtureReceipt();
      r.anchor = { ...r.anchor, text: `  ${FIXTURE_LINE}` };
      d.receipt(r);
      d.bytes(FIXTURE_BYTES);
    },
  },
  {
    id: "non-ascii-crlf-bytes-valid",
    exit: 0,
    valid: true,
    build: (d) => {
      d.bytes(FIXTURE_BYTES_CRLF_UTF8);
      d.receipt(fixtureReceipt({
        decoded_bytes: Buffer.byteLength(FIXTURE_BYTES_CRLF_UTF8),
        decoded_sha256: sha256(FIXTURE_BYTES_CRLF_UTF8),
      }));
    },
  },
  {
    id: "receipt-byte-count-understated-invalid",
    exit: 1,
    valid: false,
    field: "byte_count_match",
    fieldValue: false,
    build: (d) => {
      d.bytes(FIXTURE_BYTES);
      const measuredRev = d.commit();
      d.receipt(fixtureReceipt({ measured_rev: measuredRev, decoded_bytes: Buffer.byteLength(FIXTURE_BYTES) - 7 }));
      d.commit();
    },
  },
  {
    id: "same-length-tamper-measured-revision-holds",
    exit: 1,
    valid: false,
    field: "revision_match",
    fieldValue: true,
    build: (d) => {
      d.bytes(FIXTURE_BYTES);
      const measuredRev = d.commit();
      d.bytes(FIXTURE_TAMPERED_BYTES);
      d.receipt(fixtureReceipt({ measured_rev: measuredRev }));
      d.commit();
    },
  },
];

function makeFixture() {
  const root = mkdtempSync(join(tmpdir(), "tabi-s106-"));
  const run = (args) => {
    const r = spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
    if (r.status !== 0) throw new Error(`fixture git ${args[0]} failed: ${r.stderr}`);
    return r.stdout;
  };
  run(["init", "-q"]);
  run(["config", "user.email", "fixture@tabi.local"]);
  run(["config", "user.name", "tabi-fixture"]);
  let committed = false;
  const d = {
    root,
    receipt(obj) {
      const abs = join(root, RECEIPT_PATH);
      mkdirSync(dirname(abs), { recursive: true });
      writeFileSync(abs, `${JSON.stringify(obj, null, 2)}\n`);
    },
    bytes(text) {
      const abs = join(root, "corpus/evidence/round-26/sources/content-features-154.0.8037.97.cc");
      mkdirSync(dirname(abs), { recursive: true });
      writeFileSync(abs, text);
    },
    commit() {
      run(["add", "-A"]);
      run(["commit", "--allow-empty", "-q", "-m", "fixture"]);
      committed = true;
      return run(["rev-parse", "HEAD"]).trim();
    },
    rev() {
      if (!committed) {
        const receiptPath = join(root, RECEIPT_PATH);
        if (existsSync(receiptPath)) {
          const receipt = JSON.parse(readFileSync(receiptPath, "utf8"));
          if (!receipt.measured_rev) {
            receipt.measured_rev = d.commit();
            d.receipt(receipt);
          }
        }
        d.commit();
      }
      return run(["rev-parse", "HEAD"]).trim();
    },
  };
  return d;
}

function runSelftest() {
  const results = [];
  for (const c of CASES) {
    const fx = makeFixture();
    try {
      c.build(fx);
      const rev = fx.rev();
      let out;
      let exit = 0;
      try {
        out = evaluate(fx.root, rev);
        exit = out.valid ? 0 : 1;
      } catch (e) {
        if (!(e instanceof Refusal)) throw e;
        exit = 2;
        out = { valid: null, refusal: e.message };
      }
      let ok = exit === c.exit;
      if (c.valid !== null) ok = ok && out.valid === c.valid;
      if (c.field) {
        if (!Object.prototype.hasOwnProperty.call(c, "fieldValue")) {
          throw new Error(`case ${c.id} declares field ${c.field} without fieldValue`);
        }
        ok = ok && out[c.field] === c.fieldValue;
      }
      results.push({ id: c.id, ok, expectedExit: c.exit, exit, valid: out.valid ?? null, refusal: out.refusal ?? null });
    } finally {
      rmSync(fx.root, { recursive: true, force: true });
    }
  }
  const failed = results.filter((r) => !r.ok);
  return { schema: SELFTEST_SCHEMA, cases: results.length, passed: results.length - failed.length, results, ok: failed.length === 0 };
}

// ---- cli --------------------------------------------------------------------

function parseArgs(argv) {
  const opts = { json: false, selftest: false, rev: null, repo: LANE, help: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--json") opts.json = true;
    else if (a === "--selftest") opts.selftest = true;
    else if (a === "--help" || a === "-h") opts.help = true;
    else if (a === "--rev") opts.rev = argv[++i];
    else if (a === "--repo") opts.repo = argv[++i];
    else throw new Refusal(`unknown argument: ${a}`);
  }
  return opts;
}

function main() {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (e) {
    console.error(`S106_EVIDENCE verdict=could-not-evaluate detail=${e.message}`);
    process.exit(2);
  }
  if (opts.help) {
    console.log("usage: node scripts/check-s106-evidence.mjs --rev <REV> [--json] | --selftest [--json]");
    process.exit(0);
  }
  if (opts.selftest) {
    const out = runSelftest();
    if (opts.json) console.log(JSON.stringify(out, null, 2));
    else {
      for (const r of out.results) console.log(`CASE id=${r.id} expected_exit=${r.expectedExit} exit=${r.exit} valid=${r.valid ?? "n/a"}${r.refusal ? ` refusal=${r.refusal}` : ""} ${r.ok ? "PASS" : "FAIL"}`);
      console.log(`S106_SELFTEST verdict=${out.ok ? "clean" : "failed"} cases=${out.cases} passed=${out.passed}`);
    }
    process.exit(out.ok ? 0 : 3);
  }
  if (!opts.rev) {
    console.error("S106_EVIDENCE verdict=could-not-evaluate detail=usage: --rev <REV> or --selftest");
    process.exit(2);
  }
  let out;
  try {
    out = evaluate(opts.repo, opts.rev);
  } catch (e) {
    if (!(e instanceof Refusal)) throw e;
    console.error(`S106_EVIDENCE verdict=could-not-evaluate detail=${e.message}`);
    process.exit(2);
  }
  if (opts.json) console.log(JSON.stringify(out, null, 2));
  else {
    console.log(`S106_EVIDENCE verdict=${out.valid ? "valid" : "invalid"} rev=${out.rev} present=${out.present} sha_match=${out.sha_match} anchor_located=${out.anchor_located} valid=${out.valid}${out.reason ? ` reason=${out.reason}` : ""}`);
  }
  process.exit(out.valid ? 0 : 1);
}

main();
