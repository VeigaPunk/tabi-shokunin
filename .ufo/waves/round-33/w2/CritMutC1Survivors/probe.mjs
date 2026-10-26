#!/usr/bin/env node
// Seat CritMutC1Survivors (round 33 w2): build receipt-level constructions for the
// five remaining round-32 MutC1 survivors that w1 only closed as selftest cases
// (M11 driverSha256, M06 error frame, M04 cross-run chromedriverVersion,
// M18 well-formed PNG wrong IHDR, M17 non-loopback webSocketUrl), plus one
// adjacent probe (near-copy of the gate as the "driver"), commit each into the
// scratch clone on top of REV, and run gate v2 offline on each:
//   node scripts/check-bidi-runtime.mjs --repo <clone> --rev <variant> --baseline BASE
//        --entry ENTRY --json
// then re-run the same receipt against a single-point mutant gate that re-applies
// that survivor's weakening to v2, to show which check carries the refusal.
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { deflateSync } from "node:zlib";
import { join, dirname } from "node:path";

const S = process.argv[2];
const CLONE = join(S, "clone");
const MUT = join(S, "mut");
const REV = "042d6d9abf97d567d495652a85eabc851b81adc1";
const BASE = "d805d1d6132430118b206a848b85753ab35d1014";
const ENTRY = "corpus/knowledge/webdriver-bidi-runtime-round-32.md";
const RECEIPT = "corpus/evidence/round-32/bidi/receipt.json";
const GATE = "scripts/check-bidi-runtime.mjs";
const sha256 = (b) => createHash("sha256").update(b).digest("hex");

const env = { ...process.env, TMPDIR: join(S, "tmp") };
const run = (cmd, args, opts = {}) => spawnSync(cmd, args, { encoding: "buffer", env, maxBuffer: 256 * 1024 * 1024, ...opts });
const git = (args, opts = {}) => {
  const r = run("git", ["-C", CLONE, "-c", "user.name=CritMutC1Survivors", "-c", "user.email=CritMutC1Survivors@scratch.local", "-c", "commit.gpgsign=false", ...args], opts);
  if (r.status !== 0 && !opts.allowFail) throw new Error(`git ${args.join(" ")}: ${r.stderr}`);
  return r.stdout.toString("utf8").trim();
};

const top = git(["rev-parse", "--show-toplevel"]);
if (top !== CLONE) throw new Error(`clone toplevel ${top} != ${CLONE}`);
if (git(["rev-parse", "HEAD"]) !== REV) throw new Error("clone not detached at REV");

const gateText = readFileSync(join(CLONE, GATE), "utf8");
const gateSha = sha256(gateText);
const receipt0 = JSON.parse(readFileSync(join(CLONE, RECEIPT), "utf8"));
const t1_0 = readFileSync(join(CLONE, receipt0.runs[0].transcript), "utf8");
const t2_0 = readFileSync(join(CLONE, receipt0.runs[1].transcript), "utf8");

// A genuinely well-formed 100x100 RGBA PNG (correct CRCs, real IDAT) whose IHDR
// says 100x100: the construction M18's round-32 killing case was missing.
function realPng(w, h) {
  const crcTable = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
  });
  const crc32 = (buf) => {
    let c = 0xffffffff;
    for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const chunk = (type, data) => {
    const t = Buffer.from(type, "ascii");
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
    return Buffer.concat([len, t, data, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const raw = Buffer.alloc(h * (1 + w * 4)); // every scanline: filter byte 0 + zero RGBA
  return Buffer.concat([Buffer.from("89504e470d0a1a0a", "hex"), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0))]);
}

const lines = (text) => text.trim().split("\n").map((l) => JSON.parse(l));
const jsonl = (arr) => arr.map((o) => JSON.stringify(o)).join("\n") + "\n";
const withSha = (text) => sha256(Buffer.from(text));

const png100 = realPng(100, 100);
const pngBase64 = png100.toString("base64");

function mapSession(rec, fn) {
  const first = rec[0];
  if (first.dir !== "http-res" || first.path !== "/session") throw new Error("no new-session line");
  fn(first.body.value.capabilities);
  return rec;
}
function mapFirstShot(rec, dataB64) {
  const sendIds = new Set();
  for (const l of rec) {
    if (l.dir === "send" && l.frame && l.frame.method === "browsingContext.captureScreenshot") sendIds.add(l.frame.id);
    if (l.dir === "recv" && l.frame && sendIds.has(l.frame.id) && l.frame.type === "success") { l.frame.result = { ...l.frame.result, data: dataB64 }; return rec; }
  }
  throw new Error("no successful captureScreenshot");
}

const put = (rel, buf) => {
  const abs = join(CLONE, rel);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, buf);
};
const receiptWith = (patch, runs) => {
  const r = { ...receipt0, ...patch };
  if (runs) r.runs = receipt0.runs.map((x, k) => ({ ...x, transcriptSha256: withSha(runs[k]) }));
  return r;
};

// variant -> { build(): description; expects }
const VARIANTS = {
  "V0-honest": { build: () => ({}) },
  "V1-m11-driver-sha-mismatch": {
    build: () => ({ receipt: receiptWith({ driverSha256: "0".repeat(64) }) }),
  },
  "V2-m06-error-frame-with-payload": {
    build: () => {
      const rec = lines(t1_0);
      const sent = rec.find((l) => l.dir === "send" && l.frame.method === "browsingContext.getTree");
      const resp = rec.find((l) => l.dir === "recv" && l.frame.id === sent.frame.id);
      resp.frame = { id: sent.frame.id, type: "error", error: "unknown command", message: "tabi forged error frame", result: resp.frame.result };
      const t1 = jsonl(rec);
      return { transcripts: [t1, t2_0], receipt: receiptWith({}, [t1, t2_0]), extra: { getTreeResponseType: resp.frame.type, getTreeResultHasContexts: Array.isArray(resp.frame.result.contexts) } };
    },
  },
  "V3-m04-cross-run-chromedriver": {
    build: () => {
      const rec2 = mapSession(lines(t2_0), (caps) => { caps.chrome = { ...caps.chrome, chromedriverVersion: "155.0.0.0 (other build)" }; });
      const t2 = jsonl(rec2);
      return { transcripts: [t1_0, t2], receipt: receiptWith({}, [t1_0, t2]) };
    },
  },
  "V4-m18-png-wrong-ihdr": {
    build: () => {
      const r1 = mapFirstShot(lines(t1_0), pngBase64);
      const r2 = mapFirstShot(lines(t2_0), pngBase64);
      const a = jsonl(r1); const b = jsonl(r2);
      return { transcripts: [a, b], receipt: receiptWith({}, [a, b]), extra: { pngBytes: png100.length, ihdrWidth: png100.readUInt32BE(16), ihdrHeight: png100.readUInt32BE(20), identicalAcrossRuns: a === b ? "no (rest differs)" : "data identical, transcripts differ" } };
    },
  },
  "V5-m17-ws-off-loopback": {
    build: () => {
      const r1 = mapSession(lines(t1_0), (caps) => { caps.webSocketUrl = caps.webSocketUrl.replace("ws://127.0.0.1:", "ws://10.0.0.1:"); });
      const r2 = mapSession(lines(t2_0), (caps) => { caps.webSocketUrl = caps.webSocketUrl.replace("ws://127.0.0.1:", "ws://10.0.0.1:"); });
      const a = jsonl(r1); const b = jsonl(r2);
      return { transcripts: [a, b], receipt: receiptWith({}, [a, b]), extra: { wsRun1: r1[0].body.value.capabilities.webSocketUrl } };
    },
  },
  "V6-probe-gate-near-copy-driver": {
    build: () => {
      const drvPath = "corpus/evidence/round-32/bidi/near-copy-driver.mjs";
      const drv = Buffer.from(gateText + "// recorded by the round-32 loopback driver\n");
      return { driver: { path: drvPath, buf: drv }, receipt: { ...receipt0, driver: drvPath, driverSha256: sha256(drv) } };
    },
  },
};

const reset = () => { git(["checkout", "-q", "--force", "--detach", REV]); git(["clean", "-q", "-fdx"]); };
const commit = (msg) => { git(["add", "-A"]); git(["commit", "-q", "--no-verify", "-m", msg]); return git(["rev-parse", "HEAD"]); };

function gateRun(gatePath, rev) {
  const r = run(process.execPath, [gatePath, "--repo", CLONE, "--rev", rev, "--baseline", BASE, "--entry", ENTRY, "--json"], { cwd: CLONE });
  let j = null;
  try { j = JSON.parse(r.stdout.toString("utf8")); } catch { /* non-JSON */ }
  const rows = j && Array.isArray(j.rows) ? j.rows : [];
  return {
    exit: r.status,
    admitted: j ? j.admitted : null,
    population: j ? j.population : null,
    failing: j ? j.failing : null,
    unmeasured: j ? j.unmeasured : null,
    entryFinding: j ? j.entryFinding : null,
    binding: j ? (j.binding ?? null) : null,
    reasons: [...new Set(rows.map((x) => x.reason).filter(Boolean))].sort(),
    details: [...new Set(rows.filter((x) => x.detail).map((x) => `${x.id}:${x.detail}`))].slice(0, 4),
    stderr: r.stderr.toString("utf8").trim().slice(0, 300),
  };
}

function selftest(gatePath) {
  const r = run(process.execPath, [gatePath, "--selftest", "--json"], { cwd: CLONE });
  let j = null;
  try { j = JSON.parse(r.stdout.toString("utf8")); } catch { /* */ }
  const failed = j ? j.results.filter((x) => !x.ok).map((x) => x.id) : [];
  return { exit: r.status, cases: j ? j.cases : null, passed: j ? j.passed : null, failed };
}

const MUTANTS = [
  "m11-driver-sha-not-compared",
  "m06-ok-accepts-any-frame",
  "m04-cdv-presence-only",
  "m18-png-dims-unchecked",
  "m17a-r1-loopback-loosened",
  "m17b-sessionof-loopback-dropped",
  "m17c-both-loopback-dropped",
];

const out = { seat: "CritMutC1Survivors", rev: REV, baseline: BASE, entry: ENTRY, gateSha256: gateSha, variants: {}, selftest: {}, results: {} };

out.selftest.pristine = selftest(join(CLONE, GATE));
for (const m of MUTANTS) out.selftest[m] = selftest(join(MUT, `${m}.mjs`));

for (const [name, v] of Object.entries(VARIANTS)) {
  reset();
  const b = v.build();
  if (b.transcripts) {
    put(receipt0.runs[0].transcript, b.transcripts[0]);
    put(receipt0.runs[1].transcript, b.transcripts[1]);
  }
  if (b.driver) put(b.driver.path, b.driver.buf);
  if (b.receipt) put(RECEIPT, JSON.stringify(b.receipt, null, 1) + "\n");
  const changed = git(["status", "--porcelain"]);
  const target = changed ? commit(`seat ${name}`) : REV;
  out.variants[name] = { commit: target, changedPaths: changed.split("\n").filter(Boolean), extra: b.extra || null };
  out.results[name] = {};
  const gates = [["pristine", join(CLONE, GATE)]];
  const pairs = {
    "V1-m11-driver-sha-mismatch": ["m11-driver-sha-not-compared"],
    "V2-m06-error-frame-with-payload": ["m06-ok-accepts-any-frame"],
    "V3-m04-cross-run-chromedriver": ["m04-cdv-presence-only"],
    "V4-m18-png-wrong-ihdr": ["m18-png-dims-unchecked"],
    "V5-m17-ws-off-loopback": ["m17a-r1-loopback-loosened", "m17b-sessionof-loopback-dropped", "m17c-both-loopback-dropped"],
    "V6-probe-gate-near-copy-driver": [],
  };
  for (const m of pairs[name] || []) gates.push([m, join(MUT, `${m}.mjs`)]);
  for (const [gname, gpath] of gates) out.results[name][gname] = gateRun(gpath, target);
  console.log(`VARIANT ${name} commit=${target.slice(0, 12)} changed=${out.variants[name].changedPaths.length}`);
  for (const [gname, r] of Object.entries(out.results[name])) console.log(`  gate=${gname} exit=${r.exit} admitted=${r.admitted}/${r.population} failing=${r.failing} binding=${r.binding ?? "-"} reasons=${r.reasons.join(",") || "-"} detail=${r.details[0] ?? "-"}`);
}

// Control: every mutant gate must still admit the honest revision, else it is not
// a faithful re-application of that survivor.
out.controls = {};
for (const m of MUTANTS) {
  reset();
  out.controls[m] = gateRun(join(MUT, `${m}.mjs`), REV);
  console.log(`CONTROL gate=${m} on honest REV exit=${out.controls[m].exit} admitted=${out.controls[m].admitted}/${out.controls[m].population} reasons=${out.controls[m].reasons.join(",") || "-"}`);
}
reset();

writeFileSync(join(S, "results.json"), JSON.stringify(out, null, 1) + "\n");
console.log("WROTE", join(S, "results.json"));
