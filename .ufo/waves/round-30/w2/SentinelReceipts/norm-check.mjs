import { readFileSync } from "node:fs";
const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", "#39": "'", "#x27": "'", mdash: "—", ndash: "–", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", hellip: "…" };
function normalise(t) {
  if (/<!doctype html|<html[\s>]/i.test(t)) {
    t = t.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ");
    t = t.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+[0-9]*);/gi, (m, e) => {
      const k = e.toLowerCase();
      if (k.startsWith("#x")) return String.fromCodePoint(parseInt(k.slice(2), 16));
      if (k.startsWith("#") && k !== "#39") return String.fromCodePoint(parseInt(k.slice(1), 10));
      return ENT[k] ?? m;
    });
  }
  return t.replace(/\s+/g, " ").trim();
}
const dir = "/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-30/frontier/";
const pairs = [
  ["bytes/S117.html", "refetch/bytes/S117-refetch.html"],
  ["bytes/S116.txt", "refetch/bytes/S116.txt"],
];
const Q = {
  S117: "limited on a per-guild basis to prevent abuse. This means that the quota returned by our APIs may be inaccurate, and you may encounter 429s.",
  S116: "The field value SHOULD remain consistent over a sequence of HTTP responses. It is this characteristic that differentiates it from the RateLimit (Section 4) field",
};
for (const [a, b] of pairs) {
  const A = readFileSync(dir + a, "utf8"), B = readFileSync(dir + b, "utf8");
  const nA = normalise(A), nB = normalise(B);
  const id = a.includes("S117") ? "S117" : "S116";
  const q = Q[id];
  console.log(id, "rawEqual=", A === B, "normEqual=", nA === nB, "normLen=", nA.length);
  console.log("  quoteInA=", nA.includes(q), "quoteInB=", nB.includes(q), "quoteWords=", q.split(/\s+/).length);
  const cf = /__CF\$cv\$params/.test(A), cfN = /__CF\$cv\$params/.test(nA);
  console.log("  cfTokenInRaw=", cf, "cfTokenInNormalised=", cfN);
  const nonce = /nonce="[^"]*"/.test(A);
  console.log("  nonceAttrRaw=", nonce);
}
