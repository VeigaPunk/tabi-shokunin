import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ENTITIES = { amp:"&",lt:"<",gt:">",quot:'"',apos:"'",nbsp:" ",mdash:"\u2014",ndash:"\u2013",hellip:"\u2026" };
function normalise(buf){
  let t = Buffer.isBuffer(buf)?buf.toString("utf8"):String(buf);
  if(/<!doctype html|<html[\s>]/i.test(t)){
    t=t.replace(/<script[\s\S]*?<\/script>/gi," ").replace(/<style[\s\S]*?<\/style>/gi," ").replace(/<[^>]+>/g," ");
  }
  return t.replace(/\s+/g," ").trim();
}
const collapse=(s)=>String(s).replace(/\s+/g," ").trim();
const n = normalise(readFileSync(process.argv[2]));
const q = JSON.parse(readFileSync(process.argv[3],"utf8"));
let present=0;
for(const {id,section,quote} of q){
  const ok = n.includes(collapse(quote));
  if(ok) present++;
  console.log(`${ok?"PRESENT":"ABSENT "}\t${id}\t${section}`);
}
console.log(`quotes=${q.length} present=${present} absent=${q.length-present}`);
process.exit(present===q.length?0:1);
