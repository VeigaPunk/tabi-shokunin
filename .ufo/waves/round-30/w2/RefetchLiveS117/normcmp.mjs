import { normalise } from "/fast/scratch/hyaku/tabi-r30/RefetchLiveS117/norm.mjs";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
const S = "/fast/scratch/hyaku/tabi-r30/RefetchLiveS117";
const rd = (p) => readFileSync(`${S}/clone/${p}`);
const live = readFileSync(`${S}/live.S117.html`);
const committed = rd("corpus/evidence/round-30/frontier/bytes/S117.html");
const refetch = rd("corpus/evidence/round-30/frontier/refetch/bytes/S117-refetch.html");
const nl = normalise(live), nc = normalise(committed), nr = normalise(refetch);
const h = (s) => createHash("sha256").update(s).digest("hex");
const cmp = (a,b) => { if (a===b) return true; let i=0; while(i<a.length&&a[i]===b[i])i++; return {first_diff_at:i, a_ctx:a.slice(Math.max(0,i-60),i+60), b_ctx:b.slice(Math.max(0,i-60),i+60)}; };
console.log(JSON.stringify({
  live_len: nl.length, committed_len: nc.length, refetch_len: nr.length,
  live_eq_committed: cmp(nl,nc), live_eq_refetch: cmp(nl,nr), refetch_eq_committed: cmp(nr,nc),
  live_norm_sha256: h(nl), committed_norm_sha256: h(nc), refetch_norm_sha256: h(nr),
}, null, 2));
writeFileSync(`${S}/live.norm.txt`, nl);
writeFileSync(`${S}/committed.norm.txt`, nc);
