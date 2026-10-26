// Builds the c1-distinct probe trees. Scratch only.
// usage: node build.mjs <scratchRoot> <blobsDir>
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { createHash } from "node:crypto";

const S = process.argv[2];
const B = process.argv[3];
const CLONE = resolve(S, "clone");
const V = resolve(S, "variants");
const sha = (b) => createHash("sha256").update(b).digest("hex");

function put(root, rel, content) {
  const p = resolve(root, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, content);
  return p;
}
function putCopy(root, rel, srcAbs) {
  const p = resolve(root, rel);
  mkdirSync(dirname(p), { recursive: true });
  copyFileSync(srcAbs, p);
  return p;
}

const realEntry = readFileSync(resolve(CLONE, "corpus/knowledge/webdriver-bidi-runtime-round-32.md"));
const realReceiptTxt = readFileSync(resolve(CLONE, "corpus/evidence/round-32/bidi/receipt.json"), "utf8");
const realReceipt = JSON.parse(realReceiptTxt);
const realRun1 = readFileSync(resolve(CLONE, "corpus/evidence/round-32/bidi/run1/transcript.jsonl"));
const gateBytes = readFileSync(resolve(CLONE, "scripts/check-bidi-runtime.mjs"));

// the real first screenshot payload, lifted from the honest run1 transcript
const r1lines = realRun1.toString("utf8").trim().split("\n").map(JSON.parse);
const shot = r1lines.find((o) => o.frame && o.frame.id === 8 && o.frame.result && o.frame.result.data).frame.result.data;
const caps1 = r1lines[0].body.value.capabilities;

const manifest = {};

// ---------- shared: a synthetic transcript with the real PNG spliced in ----------
function syntheticRun(tag, port, sessionId, context) {
  const lines = [];
  let seq = 1;
  lines.push(JSON.stringify({
    seq: seq++, dir: "http-res", path: "/session", body: { value: { capabilities: {
      acceptInsecureCerts: false, browserName: "chrome", browserVersion: "154.0.8037.97",
      chrome: { chromedriverVersion: caps1.chrome.chromedriverVersion,
        debuggerAddress: "127.0.0.1:" + (port + 1000), "goog:processID": 40000 + port % 1000,
        userDataDir: "/tmp/" + tag },
      platformName: "linux", setWindowRect: true,
      "webSocketUrl": `ws://127.0.0.1:${port}/session/${sessionId}`,
    } } },
  }));
  lines.push(JSON.stringify({ seq: seq++, dir: "send", frame: { id: 1, method: "session.status", params: {} } }));
  lines.push(JSON.stringify({ seq: seq++, dir: "recv", frame: { id: 1, result: { ready: false } } }));
  lines.push(JSON.stringify({ seq: seq++, dir: "send", frame: { id: 2, method: "browsingContext.getTree", params: {} } }));
  lines.push(JSON.stringify({ seq: seq++, dir: "recv", frame: { id: 2, result: { contexts: [{ context, url: "about:blank", clientWindow: "cw-" + tag, userContext: "default" }] } } }));
  lines.push(JSON.stringify({ seq: seq++, dir: "send", frame: { id: 8, method: "browsingContext.captureScreenshot", params: { context } } }));
  lines.push(JSON.stringify({ seq: seq++, dir: "recv", frame: { id: 8, result: { data: shot } } }));
  lines.push(JSON.stringify({ seq: seq++, dir: "recv", frame: { method: "browsingContext.load", params: { context, navigation: "n-" + tag, timestamp: 1, url: "http://127.0.0.1:1/a.html" } } }));
  return lines.join("\n") + "\n";
}

function tree(name, opts) {
  const root = resolve(V, name);
  put(root, "corpus/knowledge/webdriver-bidi-runtime-round-32.md", opts.entry ?? realEntry);
  const rc = opts.receipt;
  put(root, "corpus/evidence/round-32/bidi/receipt.json", typeof rc === "string" || Buffer.isBuffer(rc) ? rc : JSON.stringify(rc, null, 1));
  for (const [rel, content] of Object.entries(opts.files || {})) put(root, rel, content);
  for (const [rel, src] of Object.entries(opts.copies || {})) putCopy(root, rel, src);
  manifest[name] = { root, entry: "corpus/knowledge/webdriver-bidi-runtime-round-32.md", receipt: "corpus/evidence/round-32/bidi/receipt.json" };
  return root;
}

// ---------- 1: v1 receipt (real blob), transcripts = real run1 bytes twice ----------
tree("v1-reexport-samebytes", {
  entry: readFileSync(resolve(B, "v1-entry.md")),
  receipt: readFileSync(resolve(B, "v1-receipt.json")),
  files: {
    "corpus/evidence/round-32/bidi/v1-synthetic-cdp-shot/run1/transcript.jsonl": realRun1,
    "corpus/evidence/round-32/bidi/v1-synthetic-cdp-shot/run2/transcript.jsonl": realRun1,
  },
  copies: { "corpus/evidence/round-32/bidi/bidi-driver.mjs": resolve(B, "v1-driver-reexport.mjs") },
});

// ---------- 2: v1 essence — two DISTINCT synthetic transcripts + re-export driver ----------
{
  const t1 = syntheticRun("v1run1", 51001, "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "CTXAAAAAAAAAAAAAAAAAAAAAAAAAAAA1");
  const t2 = syntheticRun("v1run2", 51002, "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb", "CTXBBBBBBBBBBBBBBBBBBBBBBBBBBBB2");
  const rec = JSON.parse(readFileSync(resolve(B, "v1-receipt.json"), "utf8"));
  rec.runs[0].transcriptSha256 = sha(t1);
  rec.runs[1].transcriptSha256 = sha(t2);
  tree("v1-spliced-distinct-reexport", {
    entry: readFileSync(resolve(B, "v1-entry.md")),
    receipt: rec,
    files: {
      "corpus/evidence/round-32/bidi/v1-synthetic-cdp-shot/run1/transcript.jsonl": t1,
      "corpus/evidence/round-32/bidi/v1-synthetic-cdp-shot/run2/transcript.jsonl": t2,
    },
    copies: { "corpus/evidence/round-32/bidi/bidi-driver.mjs": resolve(B, "v1-driver-reexport.mjs") },
  });
}

// ---------- 3: v2 duplicates ----------
tree("v2-duplicates", {
  entry: readFileSync(resolve(B, "v2-entry-duplicates.md")),
  receipt: realReceipt,
  copies: {
    "corpus/evidence/round-32/bidi/run1/transcript.jsonl": resolve(CLONE, "corpus/evidence/round-32/bidi/run1/transcript.jsonl"),
    "corpus/evidence/round-32/bidi/run2/transcript.jsonl": resolve(CLONE, "corpus/evidence/round-32/bidi/run2/transcript.jsonl"),
    "scripts/bidi-loopback-round32.mjs": resolve(CLONE, "scripts/bidi-loopback-round32.mjs"),
  },
});

// ---------- 4: v3 one real run's file cited twice + counter bytes as "driver" ----------
tree("v3-same-path", {
  receipt: readFileSync(resolve(B, "v3-receipt-same-path.json")),
  copies: {
    "corpus/evidence/round-32/bidi/v3-same-path-twice/run1/transcript.jsonl": resolve(CLONE, "corpus/evidence/round-32/bidi/run1/transcript.jsonl"),
    "corpus/evidence/round-32/bidi/bidi-driver.mjs": resolve(CLONE, "scripts/check-bidi-runtime.mjs"),
  },
});

// ---------- 5: v4 two byte-identical copies at distinct paths ----------
{
  const rec = JSON.parse(realReceiptTxt);
  rec.runs[1].transcript = "corpus/evidence/round-32/bidi/v4-identical-copy/run2/transcript.jsonl";
  rec.runs[1].transcriptSha256 = rec.runs[0].transcriptSha256;
  tree("v4-identical-copies", {
    receipt: rec,
    copies: {
      "corpus/evidence/round-32/bidi/run1/transcript.jsonl": resolve(CLONE, "corpus/evidence/round-32/bidi/run1/transcript.jsonl"),
      "corpus/evidence/round-32/bidi/v4-identical-copy/run2/transcript.jsonl": resolve(CLONE, "corpus/evidence/round-32/bidi/run1/transcript.jsonl"),
      "scripts/bidi-loopback-round32.mjs": resolve(CLONE, "scripts/bidi-loopback-round32.mjs"),
    },
  });
}

// ---------- 6: spliced screenshot, two distinct synthetic runs, hand-written stub driver,
//             receipt driverSha256 = the gate's digest (a lie the counter never reads) ----------
{
  const t1 = syntheticRun("stubrun1", 52001, "cccccccccccccccccccccccccccccccc", "CTXCCCCCCCCCCCCCCCCCCCCCCCCCCCC3");
  const t2 = syntheticRun("stubrun2", 52002, "dddddddddddddddddddddddddddddddd", "CTXDDDDDDDDDDDDDDDDDDDDDDDDDDDD4");
  const stub = `// loopback BiDi driver: talks to a chromedriver session over its webSocketUrl
import { createHash } from "node:crypto";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export async function drive(url, commands) {
  const ws = new WebSocket(url);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  const seen = [];
  for (const [i, cmd] of commands.entries()) {
    ws.send(JSON.stringify({ id: i + 1, ...cmd }));
    seen.push(await new Promise((res) => { ws.onmessage = (e) => res(JSON.parse(e.data)); }));
  }
  ws.close();
  return { commands: commands.length, seen, digest: createHash("sha256").update(JSON.stringify(seen)).digest("hex") };
}
`;
  const rec = {
    schema: "tabi-bidi-receipt-v1",
    fixtureSha256: realReceipt.fixtureSha256,
    browserVersion: "154.0.8037.97",
    chromedriverVersion: realReceipt.chromedriverVersion,
    driver: "scripts/stub-driver.mjs",
    driverSha256: "2f25af5a3c6326b9295f7fb191c3b76334dbb23a3403d39755d9e9ee3516c393",
    runs: [
      { name: "run1", transcript: "corpus/evidence/round-32/bidi/stub/run1/transcript.jsonl", transcriptSha256: sha(t1) },
      { name: "run2", transcript: "corpus/evidence/round-32/bidi/stub/run2/transcript.jsonl", transcriptSha256: sha(t2) },
    ],
    host: realReceipt.host,
    ranAtUtc: "2026-10-26T16:40:00.000Z",
  };
  tree("spliced-stub-driver", {
    receipt: rec,
    files: {
      "scripts/stub-driver.mjs": stub,
      "corpus/evidence/round-32/bidi/stub/run1/transcript.jsonl": t1,
      "corpus/evidence/round-32/bidi/stub/run2/transcript.jsonl": t2,
    },
  });
}

// ---------- 7: spliced screenshot, same driver file, but the receipt's driverSha256 field is honest ----------
{
  const src = resolve(V, "spliced-stub-driver");
  const root = resolve(V, "spliced-stub-driver-honest-hash");
  tree("spliced-stub-driver-honest-hash", {
    receipt: JSON.parse(readFileSync(resolve(src, "corpus/evidence/round-32/bidi/receipt.json"), "utf8")),
    files: {
      "scripts/stub-driver.mjs": readFileSync(resolve(src, "scripts/stub-driver.mjs")),
      "corpus/evidence/round-32/bidi/stub/run1/transcript.jsonl": readFileSync(resolve(src, "corpus/evidence/round-32/bidi/stub/run1/transcript.jsonl")),
      "corpus/evidence/round-32/bidi/stub/run2/transcript.jsonl": readFileSync(resolve(src, "corpus/evidence/round-32/bidi/stub/run2/transcript.jsonl")),
    },
  });
  const rec = JSON.parse(readFileSync(resolve(root, "corpus/evidence/round-32/bidi/receipt.json"), "utf8"));
  rec.driverSha256 = sha(readFileSync(resolve(root, "scripts/stub-driver.mjs")));
  put(root, "corpus/evidence/round-32/bidi/receipt.json", JSON.stringify(rec, null, 1));
  manifest["spliced-stub-driver-honest-hash"].driverSha256 = rec.driverSha256;
}

// ---------- 8: v8 control (R16 + invented R18 marked yes) ----------
tree("v8-r16-r18", {
  entry: readFileSync(resolve(B, "v8-entry-r16-unknown.md")),
  receipt: realReceipt,
  copies: {
    "corpus/evidence/round-32/bidi/run1/transcript.jsonl": resolve(CLONE, "corpus/evidence/round-32/bidi/run1/transcript.jsonl"),
    "corpus/evidence/round-32/bidi/run2/transcript.jsonl": resolve(CLONE, "corpus/evidence/round-32/bidi/run2/transcript.jsonl"),
    "scripts/bidi-loopback-round32.mjs": resolve(CLONE, "scripts/bidi-loopback-round32.mjs"),
  },
});

// ---------- 9: real receipt but driverSha256 field replaced with the gate's digest ----------
{
  const rec = JSON.parse(realReceiptTxt);
  rec.driverSha256 = "2f25af5a3c6326b9295f7fb191c3b76334dbb23a3403d39755d9e9ee3516c393";
  tree("real-receipt-gate-hash-field", {
    receipt: rec,
    copies: {
      "corpus/evidence/round-32/bidi/run1/transcript.jsonl": resolve(CLONE, "corpus/evidence/round-32/bidi/run1/transcript.jsonl"),
      "corpus/evidence/round-32/bidi/run2/transcript.jsonl": resolve(CLONE, "corpus/evidence/round-32/bidi/run2/transcript.jsonl"),
      "scripts/bidi-loopback-round32.mjs": resolve(CLONE, "scripts/bidi-loopback-round32.mjs"),
    },
  });
}

// ---------- 10: real tree, but the cited driver file is a copy of the counter ----------
{
  const rec = JSON.parse(realReceiptTxt);
  rec.driver = "corpus/evidence/round-32/bidi/renamed-counter.mjs";
  tree("real-receipt-counter-copy-driver", {
    receipt: rec,
    copies: {
      "corpus/evidence/round-32/bidi/run1/transcript.jsonl": resolve(CLONE, "corpus/evidence/round-32/bidi/run1/transcript.jsonl"),
      "corpus/evidence/round-32/bidi/run2/transcript.jsonl": resolve(CLONE, "corpus/evidence/round-32/bidi/run2/transcript.jsonl"),
      "corpus/evidence/round-32/bidi/renamed-counter.mjs": resolve(CLONE, "scripts/check-bidi-runtime.mjs"),
    },
  });
}

writeFileSync(resolve(S, "manifest.json"), JSON.stringify({ manifest, gateSha: sha(gateBytes), shotSha: sha(Buffer.from(shot, "base64")), blobs: { "v1-receipt-driverSha256": JSON.parse(readFileSync(resolve(B, "v1-receipt.json"), "utf8")).driverSha256, "v1-driver-reexport-sha256": sha(readFileSync(resolve(B, "v1-driver-reexport.mjs"))) } }, null, 1));
console.log("built", Object.keys(manifest).length, "trees");
