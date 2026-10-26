import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const src = readFileSync("/fast/scratch/hyaku/tabi-r30/CritClaimSizing/clone/scripts/check-frontier-admission.mjs","utf8");
const start = src.indexOf("export function normalise");
const end = src.indexOf("\n}\n", start);
let fn = src.slice(start, end+3).replace("export ","");
const ENTITIES = {amp:"&",lt:"<",gt:">",quot:'"',apos:"'","#39":"'"};
const f = new Function("ENTITIES", fn + "; return normalise;")(ENTITIES);
const [a,b] = process.argv.slice(2).map(p=>readFileSync(p));
const na=f(a), nb=f(b);
const h=(s)=>createHash("sha256").update(s).digest("hex").slice(0,16);
console.log("norm_len",na.length,nb.length,"equal",na===nb,h(na),h(nb));
const quote="This means that the quota returned by our APIs may be inaccurate, and you may encounter 429s.";
console.log("quote_in_norm",na.includes(quote),nb.includes(quote));
for (const t of ["X-RateLimit-Limit","X-RateLimit-Remaining","X-RateLimit-Reset","X-RateLimit-Bucket"]) console.log(t,na.includes(t));
if(na!==nb){let i=0;while(na[i]===nb[i])i++;console.log("first_diff_at",i);console.log("A:",JSON.stringify(na.slice(Math.max(0,i-70),i+70)));console.log("B:",JSON.stringify(nb.slice(Math.max(0,i-70),i+70)));}
