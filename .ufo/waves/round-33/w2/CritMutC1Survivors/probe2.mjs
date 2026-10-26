#!/usr/bin/env node
// Adjacent probe: R4 is existential over screenshots. A receipt whose FIRST
// (t3-pinned) screenshot is a well-formed 100x100 PNG but which carries one extra
// 640x480 screenshot later satisfies R4 while the pinned evidence is the wrong
// size. Offline only (with --live the t3 live comparison covers the first shot).
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { deflateSync } from "node:zlib";
import { join, dirname } from "node:path";

const S = process.argv[2];
const CLONE = join(S, "clone");
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
if (git(["rev-parse", "--show-toplevel"]) !== CLONE) throw new Error("clone toplevel mismatch");

function realPng(w, h) {
  const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
  const crc32 = (buf) => { let c = 0xffffffff; for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const chunk = (type, data) => { const t = Buffer.from(type, "ascii"); const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data]))); return Buffer.concat([len, t, data, crc]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from("89504e470d0a1a0a", "hex"), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(Buffer.alloc(h * (1 + w * 4)), { level: 9 })), chunk("IEND", Buffer.alloc(0))]);
}

const receipt0 = JSON.parse(readFileSync(join(CLONE, RECEIPT), "utf8"));
const lines = (t) => t.trim().split("\n").map((l) => JSON.parse(l));
const jsonl = (a) => a.map((o) => JSON.stringify(o)).join("\n") + "\n";
const png100 = realPng(100, 100).toString("base64");

function buildRun(text) {
  const rec = lines(text);
  const shotSend = rec.find((l) => l.dir === "send" && l.frame.method === "browsingContext.captureScreenshot");
  const shotResp = rec.find((l) => l.dir === "recv" && l.frame.id === shotSend.frame.id);
  const honestData = shotResp.frame.result.data; // the real 640x480 capture
  shotResp.frame.result = { ...shotResp.frame.result, data: png100 }; // pinned shot: wrong size
  // append one more successful capture, 640x480, at the end of the wire log
  const nextId = Math.max(...rec.filter((l) => l.dir === "send").map((l) => l.frame.id)) + 1;
  const lastSeq = Math.max(...rec.map((l) => l.seq));
  const treeSent = rec.find((l) => l.dir === "send" && l.frame.method === "browsingContext.getTree");
  const ctx = rec.find((l) => l.dir === "recv" && l.frame.id === treeSent.frame.id).frame.result.contexts[0].context;
  rec.push({ seq: lastSeq + 1, dir: "send", frame: { id: nextId, method: "browsingContext.captureScreenshot", params: { context: ctx } } });
  rec.push({ seq: lastSeq + 2, dir: "recv", frame: { id: nextId, type: "success", result: { data: honestData } } });
  return jsonl(rec);
}

git(["checkout", "-q", "--force", "--detach", REV]); git(["clean", "-q", "-fdx"]);
const a = buildRun(readFileSync(join(CLONE, receipt0.runs[0].transcript), "utf8"));
const b = buildRun(readFileSync(join(CLONE, receipt0.runs[1].transcript), "utf8"));
const put = (rel, buf) => { const abs = join(CLONE, rel); mkdirSync(dirname(abs), { recursive: true }); writeFileSync(abs, buf); };
put(receipt0.runs[0].transcript, a);
put(receipt0.runs[1].transcript, b);
put(RECEIPT, JSON.stringify({ ...receipt0, runs: receipt0.runs.map((x, k) => ({ ...x, transcriptSha256: sha256(Buffer.from(k === 0 ? a : b)) })) }, null, 1) + "\n");
git(["add", "-A"]);
git(["commit", "-q", "--no-verify", "-m", "seat V7-hybrid-screenshot-sizes"]);
const target = git(["rev-parse", "HEAD"]);
const r = run(process.execPath, [join(CLONE, GATE), "--repo", CLONE, "--rev", target, "--baseline", BASE, "--entry", ENTRY, "--json"], { cwd: CLONE });
const j = JSON.parse(r.stdout.toString("utf8"));
const shotRow = j.rows.find((x) => x.id === "R4");
const out = {
  commit: target, exit: r.status, admitted: j.admitted, population: j.population, failing: j.failing,
  binding: j.binding, R4: shotRow, entryFinding: j.entryFinding,
  firstShotIs100: true, laterShot640: true,
};
writeFileSync(join(S, "results-v7.json"), JSON.stringify(out, null, 1) + "\n");
console.log(`V7 hybrid exit=${r.status} admitted=${j.admitted}/${j.population} failing=${j.failing} binding=${j.binding} R4=${JSON.stringify(shotRow)}`);
git(["checkout", "-q", "--force", "--detach", REV]); git(["clean", "-q", "-fdx"]);
