// analyse.mjs — ExecLiveStability, tabi round 31 w1 C1 probe.
// Uses normalise() extracted VERBATIM from the frozen counter at the freeze
// revision (9505a10e), and asserts it behaviourally on the counter's own
// in-file HTML fixture before measuring anything.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";

const S = "/fast/scratch/hyaku/tabi-r31/ExecLiveStability";
const SCRIPT = `${S}/clone/scripts/check-decision-table.mjs`;
const OUT = "/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-31/w1/ExecLiveStability";

const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const src = readFileSync(SCRIPT, "utf8");

// ---- verbatim extraction ----------------------------------------------------
const ent = src.match(/^const ENTITIES = \{.*?\};$/m);
const start = src.indexOf("export function normalise(buf) {");
const end = src.indexOf("\nconst collapse =", start);
if (!ent || start < 0 || end < 0) throw new Error("extraction markers not found");
const block = src.slice(start, end);
const mod = `${ent[0]}\n\n${block}\n`;
writeFileSync(`${S}/normalise.mjs`, mod);
const nrm = (await import(pathToFileURL(`${S}/normalise.mjs`).href)).normalise;

// assert the extracted function behaves as the counter's own fixture requires
const htmlLine = src.match(/^const HTML = .*$/m)[0];
const qhtmlLine = src.match(/^const QHTML = .*$/m)[0];
const HTML = new Function(`${htmlLine}; return HTML;`)();
const QHTML = new Function(`${qhtmlLine}; return QHTML;`)();
const fixtureOk = nrm(Buffer.from(HTML)).includes(QHTML);
if (!fixtureOk) throw new Error("extracted normalise() fails the counter's own HTML fixture");

// ---- load fetches -----------------------------------------------------------
const meta = readFileSync(`${S}/fetch-meta.tsv`, "utf8").trim().split("\n").slice(1).map((l) => l.split("\t"));
const pages = ["S119", "S120", "S121", "S122"];
const F = {};
for (const [fetch, page, utc, url, code, eff, size, rc] of meta) {
  const f = `${S}/raw/${page}.${fetch}.bin`;
  if (!existsSync(f)) { F[`${page}.${fetch}`] = { fetch, page, utc, url, code, eff, size, rc, missing: true }; continue; }
  const raw = readFileSync(f);
  const norm = nrm(raw);
  F[`${page}.${fetch}`] = {
    fetch, page, utc, url, code, eff, size, rc, missing: false,
    fileBytes: raw.length, rawSha: sha256(raw), norm, normBytes: Buffer.byteLength(norm, "utf8"), normSha: sha256(Buffer.from(norm, "utf8")),
  };
}

function common(b, c) {
  let i = 0; const n = Math.min(b.length, c.length);
  while (i < n && b[i] === c[i]) i += 1;
  let j = 0;
  while (j < n - i && b[b.length - 1 - j] === c[c.length - 1 - j]) j += 1;
  return { i, j, bMid: b.slice(i, b.length - j), cMid: c.slice(i, c.length - j) };
}
const clip = (s, w = 220) => (s.length <= w ? s : `${s.slice(0, w)}…[${s.length - w} chars]`);

// ---- per-fetch TSV ----------------------------------------------------------
const head = ["page", "fetch", "utc", "url", "http_status", "effective_url", "curl_rc", "size_download",
  "file_bytes", "raw_sha256", "norm_bytes", "norm_sha256", "raw_eq_f1", "norm_eq_f1"].join("\t");
const rows = [head];
for (const page of pages) {
  const first = F[`${page}.1`];
  for (const k of ["1", "2", "3"]) {
    const r = F[`${page}.${k}`];
    rows.push([r.page, r.fetch, r.utc, r.url, r.code, r.eff, r.rc, r.size, r.fileBytes ?? "", r.rawSha ?? "",
      r.normBytes ?? "", r.normSha ?? "",
      first && !first.missing && r.rawSha === first.rawSha ? "yes" : "no",
      first && !first.missing && r.normSha === first.normSha ? "yes" : "no"].join("\t"));
  }
}
writeFileSync(`${OUT}/live-stability.tsv`, `${rows.join("\n")}\n`);

// ---- per-page verdict, divergence spans, digit-sentence survival ------------
const diffs = [], summary = ["page\turl\traw_all_equal\tnorm_all_equal\tdigit_sentences\tsurvive_f2\tsurvive_f3\tverdict"];
for (const page of pages) {
  const fs3 = ["1", "2", "3"].map((k) => F[`${page}.${k}`]);
  if (fs3.some((x) => x.missing)) { summary.push([page, fs3[0].url, "FETCH-MISSING", "", "", "", "", "unmeasured"].join("\t")); continue; }
  const rawAllEqual = fs3.every((x) => x.rawSha === fs3[0].rawSha);
  const normAllEqual = fs3.every((x) => x.normSha === fs3[0].normSha);
  // candidate quote model: digit-bearing sentences of fetch 1, <= 200 chars
  const cand = [...new Set(fs3[0].norm.split(/(?<=[.!?])\s+/).map((s) => s.trim())
    .filter((s) => /\d/.test(s) && s.length <= 200 && s.split(" ").length >= 6 && s.split(" ").length <= 25))];
  const surv = (t) => cand.filter((s) => t.includes(s)).length;
  const s2 = surv(fs3[1].norm), s3 = surv(fs3[2].norm);
  const verdict = normAllEqual ? "holds" : s3 === cand.length ? "holds (bytes differ, all candidate quotes still locate)" : "falsified";
  summary.push([page, fs3[0].url, rawAllEqual ? "yes" : "no", normAllEqual ? "yes" : "no", cand.length, s2, s3, verdict].join("\t"));
  diffs.push(`## ${page} ${fs3[0].url}`);
  diffs.push(`raw sha256: ${fs3.map((x) => `${x.fetch}=${x.rawSha}`).join(" ")}`);
  diffs.push(`norm sha256: ${fs3.map((x) => `${x.fetch}=${x.normSha}`).join(" ")}`);
  diffs.push(`norm bytes: ${fs3.map((x) => `${x.fetch}=${x.normBytes}`).join(" ")}`);
  for (let a = 0; a < 3; a += 1) for (let b = a + 1; b < 3; b += 1) {
    if (fs3[a].norm === fs3[b].norm) { diffs.push(`fetch${a + 1} vs fetch${b + 1}: identical`); continue; }
    const d = common(fs3[a].norm, fs3[b].norm);
    diffs.push(`fetch${a + 1} vs fetch${b + 1}: differ — common prefix ${d.i} chars, common suffix ${d.j} chars`);
    diffs.push(`  fetch${a + 1} span (${d.bMid.length} chars): ${JSON.stringify(clip(d.bMid))}`);
    diffs.push(`  fetch${b + 1} span (${d.cMid.length} chars): ${JSON.stringify(clip(d.cMid))}`);
  }
  const lost = cand.filter((s) => !fs3[2].norm.includes(s));
  if (lost.length) diffs.push(`candidate quotes of fetch1 NOT located in fetch3 (${lost.length}/${cand.length}):\n${lost.map((s) => `  - ${JSON.stringify(s)}`).join("\n")}`);
  if (!cand.length) diffs.push("no digit-bearing candidate sentence of 6..25 words in fetch1 normalised text");
  diffs.push("");
}
writeFileSync(`${OUT}/stability-summary.tsv`, `${summary.join("\n")}\n`);
writeFileSync(`${OUT}/normalised-diffs.txt`, `${[
  `# normalise() extracted verbatim from scripts/check-decision-table.mjs @ 9505a10e`,
  `# script sha256: ${sha256(Buffer.from(src, "utf8"))}`,
  `# extracted module sha256: ${sha256(Buffer.from(mod, "utf8"))}`,
  `# behavioural fixture check (counter's own HTML/QHTML): ${fixtureOk ? "PASS" : "FAIL"}`,
  ""].join("\n")}${diffs.join("\n")}\n`);

// normalised texts for the pages whose fetches differ (evidence for the spans)
mkdirSync(`${OUT}/normalised`, { recursive: true });
for (const page of pages) for (const k of ["1", "2", "3"]) {
  const r = F[`${page}.${k}`];
  if (!r.missing) writeFileSync(`${OUT}/normalised/${page}.${k}.txt`, r.norm);
}
console.log(summary.join("\n"));
console.log(`\nfixture=${fixtureOk ? "PASS" : "FAIL"} extracted_sha256=${sha256(Buffer.from(mod, "utf8"))}`);
