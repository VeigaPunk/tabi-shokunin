// Admissibility pre-check for candidate decision-table rows drawn from S119,
// mirroring the FROZEN counter's own constants (scripts/check-decision-table.mjs
// HEADER/DECISIONS/UNIT_RE/NUMBER_WORDS and its q1/q2/n1 predicates).
import { readFileSync } from "node:fs";
const UNIT_RE = /^(?:(?:at least|at most|no more than|up to|more than|less than|≤|≥|<=|>=|<|>)\s*)?(\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?)\s*(s|sec|seconds?|min|minutes?|h|hours?|days?|KiB|MiB|bytes|requests?|redirects?|points?|attempts?|retries|concurrent)\b/i;
const NUMBER_WORDS = { zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,fifteen:15,twenty:20,"twenty-four":24,thirty:30,sixty:60,ninety:90,hundred:100 };
const DECISIONS = new Set(["wait","stop","retry","allow","disallow","cap","follow","refetch","backoff","cache","limit","pause","serialize"]);
function normalise(buf){
  let t = Buffer.isBuffer(buf)?buf.toString("utf8"):String(buf);
  if(/<!doctype html|<html[\s>]/i.test(t)){
    t=t.replace(/<script[\s\S]*?<\/script>/gi," ").replace(/<style[\s\S]*?<\/style>/gi," ").replace(/<[^>]+>/g," ");
  }
  return t.replace(/\s+/g," ").trim();
}
const collapse=(s)=>String(s).replace(/\s+/g," ").trim();
const words=(s)=>collapse(s).split(" ").filter(Boolean).length;
const norm = normalise(readFileSync(process.argv[2]));
const cand = JSON.parse(readFileSync(process.argv[3],"utf8"));
let pass=0;
for (const c of cand) {
  const problems=[];
  const verb=(c.decision.toLowerCase().match(/^[a-z]+/)||[""])[0];
  if(!DECISIONS.has(verb)) problems.push("t3-decision");
  const tm=UNIT_RE.exec(c.threshold);
  if(!tm) problems.push("t4-threshold");
  if(!/`[^`]+`/.test(c.signal)) problems.push("t2-signal");
  const w=words(c.quote);
  if(w<6||w>25) problems.push(`q1-quote-length(${w}w)`);
  if(!norm.includes(collapse(c.quote))) problems.push("q2-quote-located");
  if(tm){
    const digits=String(tm[1]).replace(/,/g,"");
    const hasDigits=norm.includes(digits);
    const hasWord=Object.entries(NUMBER_WORDS).some(([k,v])=>String(v)===digits && new RegExp(`\\b${k}\\b`,"i").test(norm));
    if(!hasDigits && !hasWord) problems.push("n1-threshold-sourced");
  }
  if(!problems.length) pass++;
  console.log(`${problems.length?"FAIL":"PASS"}\t${c.row}\t${w}w\t${c.threshold}\t${problems.join(",")||"-"}`);
}
console.log(`candidates=${cand.length} pass=${pass} fail=${cand.length-pass}`);
