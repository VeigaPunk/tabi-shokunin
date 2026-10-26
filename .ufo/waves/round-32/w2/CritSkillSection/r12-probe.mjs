// Read-only experiment: does PREDICATES.R12 enforce (a) collector-before-response
// and (b) "on that collector's response"? Import the frozen counter's exports.
import { readFileSync } from "node:fs";
import { PREDICATES, recordFromTranscript, DATA_TEXT } from "./clone/scripts/check-bidi-runtime.mjs";
const text = readFileSync("./clone/corpus/evidence/round-32/bidi/run1/transcript.jsonl", "utf8");
const lines = text.trim().split("\n").map((l) => JSON.parse(l));
const base = recordFromTranscript(text);
console.log("control R12:", PREDICATES.R12(base) ?? "HOLDS");

// (a) collector moved to after the /data.txt responseCompleted, before getData
const col = lines.filter((l) => l.frame && (l.frame.method === "network.addDataCollector" || (l.frame.id !== undefined && lines.some((m) => m.frame && m.frame.id === l.frame.id && m.frame.method === "network.addDataCollector"))));
const keep = lines.filter((l) => !(l.frame && (l.frame.method === "network.addDataCollector" || (l.frame.id !== undefined && col.some((c) => c.frame.id === l.frame.id)))));
const gi = keep.findIndex((l) => l.frame && l.frame.method === "network.getData");
const moved = [...keep.slice(0, gi), ...col, ...keep.slice(gi)];
const recA = recordFromTranscript(moved.map((l, k) => JSON.stringify({ ...l, seq: k + 1 })).join("\n"));
console.log("collector added AFTER responseCompleted, before getData -> R12:", PREDICATES.R12(recA) ?? "HOLDS (predicate admits)");

// (b) getData for a request id that appears nowhere else
const text2 = text.replace('"request":"483282.3"}', '"request":"NOSUCHREQUEST"}');
const recB = recordFromTranscript(text2);
console.log("getData request id never seen -> R12:", PREDICATES.R12(recB) ?? "HOLDS (predicate admits)");
