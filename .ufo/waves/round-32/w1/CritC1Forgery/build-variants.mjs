// build-variants.mjs — forge C1 admission attempts in the scratch clone.
// Each variant commits junk content at a fresh rev, then runs the frozen counter
// with --live. No lane file is touched; every commit stays inside the scratch clone.
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { goldenLines, FIXTURE_SHA256, ROWS } from "/fast/scratch/hyaku/tabi-r32/CritC1Forgery/clone/scripts/check-bidi-runtime.mjs";

const S = "/fast/scratch/hyaku/tabi-r32/CritC1Forgery";
const CLONE = `${S}/clone`;
const ENTRY = "corpus/knowledge/bidi-junk.md";
const RECEIPT = "corpus/evidence/round-32/bidi/receipt.json";
const BASE_REV = "d805d1d6132430118b206a848b85753ab35d1014";
const RECEIPT_SCHEMA = "tabi-bidi-receipt-v1";
const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const ALL_OK = ["R1", "R2", "R3", "R4", "R5", "R6", "R7", "R8", "R9", "R10", "R11", "R12", "R13", "R14", "R15", "R17"];

const g = (args) => {
  const r = spawnSync("git", ["-C", CLONE, "-c", "user.name=CritC1Forgery", "-c", "user.email=CritC1Forgery@scratch.local", ...args], { encoding: "utf8" });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")}: ${r.stderr}`);
  return r.stdout.trim();
};
if (g(["rev-parse", "--show-toplevel"]) !== CLONE) throw new Error("clone root mismatch");
const put = (rel, buf) => { const abs = join(CLONE, rel); mkdirSync(dirname(abs), { recursive: true }); writeFileSync(abs, buf); };
const commit = (msg) => { g(["add", "-A"]); g(["commit", "-q", "-m", msg]); return g(["rev-parse", "HEAD"]); };

// real facts captured from one real BiDi session (live1) and one real CDP render
const liveMeta = JSON.parse(readFileSync(`${S}/live1.meta.json`, "utf8"));
const cdpMeta = JSON.parse(readFileSync(`${S}/cdp.meta.json`, "utf8"));
if (cdpMeta.shotSha !== liveMeta.shotSha) console.error("WARN cdp shot differs from bidi shot");
const realB64 = readFileSync(`${S}/cdp-shot.png`).toString("base64");
const realDriverVersion = liveMeta.chromedriverVersion;
const realBrowserVersion = liveMeta.browserVersion;
const liveTranscript = readFileSync(`${S}/live1.jsonl`);
const driverCopy = readFileSync(`${CLONE}/scripts/check-bidi-runtime.mjs`); // byte-identical renamed counter
const driverReexport = Buffer.from('// "independent driver"\nexport * from "../../scripts/check-bidi-runtime.mjs";\n');

// registry: junk rows opened "this round" at a junk entry
const regRows = [
  ["S901", "mined", ENTRY],
  ["S902", "mined", ENTRY],
  ["S903", "queued", ENTRY],
  ["S904", "mined", "corpus/knowledge/other.md"],
];
const sourcesPath = join(CLONE, "corpus/SOURCES.md");
let reg = readFileSync(sourcesPath, "utf8");
for (const [id, status, usedBy] of regRows) {
  if (!reg.includes(`| ${id} |`)) reg += `| ${id} | junk — https://e.test/ | spec | A | s | a | t | ${status} | 2026-10-26 | 90d | ${usedBy} |\n`;
}
put("corpus/SOURCES.md", reg);
const fixRev = commit("scratch: junk registry rows S901-S904");

const entryDoc = (ids, source = "S902") => [
  `source: ${source} — junk`, "verified-at: junk", "recheck: junk", "",
  "| Row | Surface | BiDi method | Measured | Evidence |", "|---|---|---|---|---|",
  ...ids.map((id) => `| ${id} | ${ROWS[id] || "x"} | m | yes | corpus/evidence/round-32/bidi/junk |`), "",
].join("\n");

const synthetic = (withShot) => goldenLines({
  base: "http://127.0.0.1:40000",
  version: realBrowserVersion,
  driverVersion: realDriverVersion,
  mutate: (steps) => {
    if (withShot) steps.find((x) => x[1] === "browsingContext.captureScreenshot")[3] = { data: realB64 };
  },
});

function writeReceipt({ rev, runs, driverPath, driverBytes }) {
  put(driverPath, driverBytes);
  put(RECEIPT, JSON.stringify({
    schema: RECEIPT_SCHEMA, fixtureSha256: FIXTURE_SHA256, browserVersion: realBrowserVersion,
    driver: driverPath, driverSha256: sha256(driverBytes), runs,
  }, null, 2));
}

function runsFrom(texts, tag) {
  return texts.map((text, k) => {
    const rel = `corpus/evidence/round-32/bidi/${tag}/run${k + 1}/transcript.jsonl`;
    put(rel, text);
    return { name: `run${k + 1}`, transcript: rel, transcriptSha256: sha256(Buffer.from(text)) };
  });
}

const variants = [];
function variant(id, { ids = ALL_OK, source = "S902", texts, samePath = false, withShot = true, driver = "copy", liveShot }) {
  put(ENTRY, entryDoc(ids, source));
  const tag = id;
  const driverPath = "corpus/evidence/round-32/bidi/bidi-driver.mjs";
  const driverBytes = driver === "copy" ? driverCopy : driverReexport;
  let runs;
  if (samePath) {
    const rel = `corpus/evidence/round-32/bidi/${tag}/run1/transcript.jsonl`;
    put(rel, texts[0]);
    runs = [
      { name: "run1", transcript: rel, transcriptSha256: sha256(Buffer.from(texts[0])) },
      { name: "run2", transcript: rel, transcriptSha256: sha256(Buffer.from(texts[0])) },
    ];
  } else runs = runsFrom(texts, tag);
  writeReceipt({ runs, driverPath, driverBytes });
  const rev = commit(`scratch: ${id}`);
  variants.push({ id, rev, withShot, liveShot });
}

// v0: browserless golden, exactly control J3 (expect t3-binding)
variant("v0-browserless-golden", { texts: [synthetic(false), synthetic(false)] });
// v1: golden synthetic + the real CDP screenshot spliced in + re-export driver
variant("v1-synthetic-cdp-shot", { texts: [synthetic(true), synthetic(true)], driver: "reexport" });
// v2: only R2 measured, listed 16 times (population counts instances)
variant("v2-duplicate-rows", { ids: Array(16).fill("R2"), texts: [synthetic(true), synthetic(true)], driver: "reexport" });
// v3: one real transcript, same path cited twice
variant("v3-same-path-twice", { texts: [liveTranscript], samePath: true, driver: "copy" });
// v4: one real transcript, two byte-identical copies
variant("v4-one-run-copied", { texts: [liveTranscript, liveTranscript], driver: "copy" });
// v5: entry cites a queued registry row
variant("v5-queued-source", { source: "S903", texts: [synthetic(true), synthetic(true)], driver: "reexport" });
// v6: a single measured row is already "clean" for the counter
variant("v6-single-row", { ids: ["R2"], texts: [synthetic(true), synthetic(true)], driver: "reexport" });

writeFileSync(`${S}/variants.json`, JSON.stringify({ fixRev, variants }, null, 2));
console.log(JSON.stringify({ fixRev, variants }, null, 2));
