import fs from "node:fs";
const REC="/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-31/decision-table/bytes/";
function normalise(t){
  if(/<!doctype html|<html[\s>]/i.test(t)){
    t=t.replace(/<script[\s\S]*?<\/script>/gi," ").replace(/<style[\s\S]*?<\/style>/gi," ").replace(/<[^>]+>/g," ");
    t=t.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+[0-9]*);/gi,(m,e)=>{const k=e.toLowerCase();
      if(k.startsWith("#x"))return String.fromCodePoint(parseInt(k.slice(2),16));
      if(k.startsWith("#")&&k!=="#39")return String.fromCodePoint(parseInt(k.slice(1),10));
      return ({amp:"&",lt:"<",gt:">",quot:'"',apos:"'",nbsp:" ","#39":"'","#x27":"'",mdash:"—",ndash:"–",rsquo:"’",lsquo:"‘",rdquo:"”",ldquo:"“",hellip:"…"})[k]??m;});
  }
  return t.replace(/\s+/g," ").trim();
}
const collapse=s=>String(s).replace(/\s+/g," ").trim();
const words=s=>collapse(s).split(" ").filter(Boolean).length;
const QUOTES={
  D5:{src:"S119",file:"S119.txt",live:"live/S119.bin",q:"The parsing limit MUST be at least 500 kibibytes [KiB].",thr:"500",unit:"KiB"},
  D6:{src:"S121",file:"S121.html",live:"live/S121.bin",q:"Otherwise, wait for at least one minute before retrying.",thr:"1",unit:"minute"},
};
const out=[];
out.push("# Independent quote re-check (replica of check-decision-table.mjs normalise()), seat RowAttackD5D6, "+new Date().toISOString());
for(const [row,v] of Object.entries(QUOTES)){
  const rec=normalise(fs.readFileSync(REC+v.file,"utf8"));
  const live=normalise(fs.readFileSync(v.live,"utf8"));
  const q=collapse(v.q);
  const inRec=rec.includes(q), inLive=live.includes(q);
  out.push("");
  out.push(`## ${row} (${v.src})`);
  out.push(`quote words=${words(q)}  located receipt=${inRec}  located live=${inLive}`);
  // sentence context: 2 sentences before + 2 after
  const idx=rec.indexOf(q);
  const para=rec.slice(Math.max(0,idx-900), idx+q.length+700);
  const sents=para.split(/(?<=\.)\s+(?=[A-Z])/);
  out.push("receipt sentences around quote:");
  for(const s of sents) out.push("  - "+s.trim());
  // threshold number in quote
  const nums=[...q.matchAll(/\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?/g)].map(m=>m[0]);
  const nw={"one":1,"two":2,"three":3,"four":4,"five":5,"six":6,"seven":7,"eight":8,"nine":9,"ten":10};
  const wordsNums=Object.entries(nw).filter(([w])=>new RegExp(`(^|[^a-z-])${w}([^a-z-]|$)`, "i").test(q)).map(([w,n])=>`${w}=${n}`);
  out.push(`digits in quote=[${nums.join(",")}] number-words in quote=[${wordsNums.join(",")}] row-threshold=${v.thr} unit=${v.unit}`);
  // does the quote carry a bound phrase?
  out.push(`bound phrases in quote: ${["at least","more than","no more than","at most","none","MUST","SHOULD","MAY"].filter(p=>q.includes(p)).join(" | ")||"(none)"}`);
}
fs.writeFileSync("verify-out.txt", out.join("\n")+"\n");
console.log(out.join("\n"));
