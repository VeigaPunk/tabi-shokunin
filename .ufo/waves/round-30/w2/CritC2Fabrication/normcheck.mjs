import { normalise } from "/fast/scratch/hyaku/tabi-r30/CritC2Fabrication/normslice.mjs";
import fs from "fs"; import c from "crypto";
const files = {
  receipt: "/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-30/frontier/bytes/S117.html",
  refetch: "/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-30/frontier/refetch/bytes/S117-refetch.html",
  live: "/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-30/w2/CritC2Fabrication/live/S117-live.html",
};
const n = {};
for (const [k, f] of Object.entries(files)) n[k] = normalise(fs.readFileSync(f));
for (const [k, v] of Object.entries(n)) console.log(k, "chars", v.length, "sha", c.createHash("sha256").update(v).digest("hex"));
const q = "limited on a per-guild basis to prevent abuse. This means that the quota returned by our APIs may be inaccurate, and you may encounter 429s.";
for (const [k, v] of Object.entries(n)) console.log(k, "has_quote", v.includes(q));
console.log("receipt==refetch", n.receipt === n.refetch, "receipt==live", n.receipt === n.live);
