import { recordFromTranscript, PREDICATES, ROWS } from "/fast/scratch/hyaku/tabi-r32/CritC1Claim/clone/scripts/check-bidi-runtime.mjs";
import { readFileSync } from "node:fs";
const text = readFileSync(process.argv[2], "utf8");
const mutated = text.replaceAll(/(https?:\/\/)127\.0\.0\.1:/g, "$1example.test:");
const rec = recordFromTranscript(mutated);
const ctx = { browserVersion: "154.0.8037.97" };
const out = {};
for (const id of Object.keys(ROWS)) { if (id === "R16") continue; out[id] = PREDICATES[id](rec, ctx) === null ? "holds" : "fails"; }
console.log(JSON.stringify({ baseChangedTo: "example.test", rows: out,
  holdingOnNonLoopbackBase: Object.entries(out).filter(([,v]) => v === "holds").map(([k]) => k) }, null, 1));
