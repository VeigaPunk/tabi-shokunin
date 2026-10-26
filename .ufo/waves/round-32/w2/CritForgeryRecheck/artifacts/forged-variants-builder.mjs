#!/usr/bin/env node
// variants.mjs — W2 CritForgeryRecheck: build receipt/transcript variants over the
// b234a589 clone. Run from the clone root. Writes only under
// corpus/evidence/round-32/bidi/ (scratch clone).
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { transcript, FIXTURE } from "./recheck-driver.mjs";

const sha = (b) => createHash("sha256").update(b).digest("hex");
const BIDI = "corpus/evidence/round-32/bidi";
const BASE = "d805d1d6132430118b206a848b85753ab35d1014";
const HONEST = "b234a58920134424e0d104f137311ff54a16d26b";
const DRIVER_HONEST = "scripts/bidi-loopback-round32.mjs";
const FIXTURE_SHA = sha(JSON.stringify(Object.keys(FIXTURE).sort().map((k) => [k, FIXTURE[k].type, FIXTURE[k].body])));
const CDV = "154.0.8037.97 (b510e9d7cd3a2fbd78d0ddc42234103206c5f78d-refs/branch-heads/8037@{#1673})";

const git = (args) => {
  const r = spawnSync("git", args, { encoding: "utf8" });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")}: ${r.stderr}`);
  return r.stdout;
};

// The one real screenshot, lifted from the committed honest transcript — no browser.
const honest = git(["show", `${HONEST}:${BIDI}/run1/transcript.jsonl`]);
const honestLine = honest.split("\n").map((l) => { try { return JSON.parse(l); } catch { return null; } })
  .find((o) => o && o.dir === "recv" && o.frame && o.frame.result && o.frame.result.data && o.frame.method === undefined)
  || honest.split("\n").map((l) => { try { return JSON.parse(l); } catch { return null; } })
    .find((o) => o && o.dir === "recv" && o.frame && o.frame.result && o.frame.result.data);
const SHOT = honestLine.frame.result.data;
const shotBytes = Buffer.from(SHOT, "base64");
writeFileSync(join(process.cwd(), BIDI, "committed-shot.png"), shotBytes);
const SHOT_SHA = sha(shotBytes);

const hex = (n) => { let s = ""; for (let i = 0; i < n; i += 1) s += "0123456789abcdef"[Math.floor(Math.random() * 16)]; return s; };
const uuid = () => `${hex(8)}-${hex(4)}-${hex(4)}-${hex(4)}-${hex(12)}`;

function mkRun(port, shot) {
  return transcript({
    port, ctx: hex(32).toUpperCase(), shot, sessionId: hex(32), wsPort: 30000 + Math.floor(Math.random() * 20000),
    subscription: uuid(), collector: uuid(), navigation: uuid(), navigationB: uuid(),
    realm: `${4000000000000000000n + BigInt(Math.floor(Math.random() * 1e6))}.-100`,
  });
}

// Golden-constant rewrite: the session body and context ids the counter's own
// generator emits, which no real chromedriver reports.
function goldenize(text, port) {
  const ctx = text.match(/"context":"([0-9A-F]{32})"/);
  const nav = text.match(/"navigation":"([0-9a-f-]{36})"/);
  if (!ctx) throw new Error("no ctx in transcript");
  let s = text.split(ctx[1]).join("C1");
  if (nav) s = s.split(nav[1]).join("N1");
  s = s.split(`I-${port}`).join("I1");
  s = s.replace(/"sessionId":"[0-9a-f]{32}"/, '"sessionId":"X"');
  s = s.replace(/"webSocketUrl":"ws:\/\/127\.0\.0\.1:\d+\/session\/[0-9a-f]{32}"/, '"webSocketUrl":"ws://127.0.0.1:9515/session/X"');
  return s;
}

function fakeShot() {
  const png = Buffer.alloc(24);
  Buffer.from("89504e470d0a1a0a", "hex").copy(png, 0);
  png.write("IHDR", 12, "ascii");
  png.writeUInt32BE(640, 16);
  png.writeUInt32BE(480, 20);
  return png.toString("base64");
}

function receipt({ driver, runs, extra = {} }) {
  return {
    schema: "tabi-bidi-receipt-v1", fixtureSha256: FIXTURE_SHA, browserVersion: "154.0.8037.97",
    chromedriverVersion: CDV, driver, driverSha256: sha(readFileSync(driver)), runs,
    host: { uname: "Linux plazir27 7.2.11-arch1-1 #1 SMP PREEMPT_DYNAMIC", chromium: "Chromium 154.0.8037.97 Arch Linux", chromedriver: `ChromeDriver ${CDV}` },
    ranAtUtc: new Date().toISOString(), ...extra,
  };
}

const put = (rel, text) => { const abs = join(process.cwd(), rel); mkdirSync(join(abs, ".."), { recursive: true }); writeFileSync(abs, text); return { transcript: rel, transcriptSha256: sha(Buffer.from(text)) }; };
const report = {};

// F4: no browser, no driver run — two distinct synthetic transcripts, the committed PNG spliced in.
{
  const t1 = mkRun(41001, SHOT), t2 = mkRun(41002, SHOT);
  const runs = [{ name: "run1", ...put(`${BIDI}/variant/F4/run1/transcript.jsonl`, t1) },
    { name: "run2", ...put(`${BIDI}/variant/F4/run2/transcript.jsonl`, t2) }];
  put(`${BIDI}/receipt-f4.json`, JSON.stringify(receipt({ driver: DRIVER_HONEST, runs, extra: { provenance: { variant: "F4", render: "none — base64 copied from the committed transcript", imageSha256: SHOT_SHA } } }), null, 1) + "\n");
  report.F4 = { runs: runs.map((r) => [r.transcript, r.transcriptSha256]), shotSha: SHOT_SHA };
}

// F2: the cited "driver" is an attacker-written CDP driver that names none of the
// counter's internals and re-exports nothing; the receipt is otherwise F4.
{
  const drv = `${BIDI}/recheck-driver.mjs`;
  copyFileSync(join(process.env.ATTACK_BUILD, "recheck-driver.mjs"), join(process.cwd(), drv));
  const runs = [{ name: "run1", ...put(`${BIDI}/variant/F2/run1/transcript.jsonl`, mkRun(42001, SHOT)) },
    { name: "run2", ...put(`${BIDI}/variant/F2/run2/transcript.jsonl`, mkRun(42002, SHOT)) }];
  put(`${BIDI}/receipt-f2.json`, JSON.stringify(receipt({ driver: drv, runs, extra: { provenance: { variant: "F2", render: "cdp", imageSha256: SHOT_SHA } } }), null, 1) + "\n");
  report.F2 = { driver: drv, driverSha256: sha(readFileSync(drv)), runs: runs.map((r) => [r.transcript, r.transcriptSha256]) };
}

// F3: golden session constants (sessionId X, port 9515, context C1) + the real PNG.
{
  const t1 = goldenize(mkRun(43001, SHOT), 43001), t2 = goldenize(mkRun(43002, SHOT), 43002);
  const runs = [{ name: "run1", ...put(`${BIDI}/variant/F3/run1/transcript.jsonl`, t1) },
    { name: "run2", ...put(`${BIDI}/variant/F3/run2/transcript.jsonl`, t2) }];
  put(`${BIDI}/receipt-f3.json`, JSON.stringify(receipt({ driver: DRIVER_HONEST, runs, extra: { provenance: { variant: "F3", render: "none", imageSha256: SHOT_SHA } } }), null, 1) + "\n");
  report.F3 = { runs: runs.map((r) => [r.transcript, r.transcriptSha256]) };
}

// DUP: one transcript cited as both runs (w1 v3 shape) — expect c1-distinct red.
{
  const r1 = put(`${BIDI}/variant/DUP/run1/transcript.jsonl`, mkRun(44001, SHOT));
  const runs = [{ name: "run1", ...r1 }, { name: "run2", ...r1 }];
  put(`${BIDI}/receipt-dup.json`, JSON.stringify(receipt({ driver: DRIVER_HONEST, runs, extra: { provenance: { variant: "DUP" } } }), null, 1) + "\n");
  report.DUP = { runs };
}

// FAKE: a header-only 640x480 PNG (no real render) in both runs — expect the gate red.
{
  const fake = fakeShot();
  const runs = [{ name: "run1", ...put(`${BIDI}/variant/FAKE/run1/transcript.jsonl`, mkRun(45001, fake)) },
    { name: "run2", ...put(`${BIDI}/variant/FAKE/run2/transcript.jsonl`, mkRun(45002, fake)) }];
  put(`${BIDI}/receipt-fake.json`, JSON.stringify(receipt({ driver: DRIVER_HONEST, runs, extra: { provenance: { variant: "FAKE" } } }), null, 1) + "\n");
  report.FAKE = { runs: runs.map((r) => [r.transcript, r.transcriptSha256]) };
}

writeFileSync(join(process.cwd(), BIDI, "variant-manifest.json"), JSON.stringify(report, null, 1) + "\n");
console.log(JSON.stringify({ ok: true, shotSha: SHOT_SHA, variants: Object.keys(report) }, null, 1));
console.log(`BASE=${BASE}`);
