import fs from "node:fs";
const S = process.argv[2];
const load = (n,g) => {
  const t = fs.readFileSync(`${S}/gates/${n}/${g}.out`,"utf8");
  const m = t.match(/^[A-Z_]+_JSON (\{[\s\S]*\})$/m);
  try { return JSON.parse(m ? m[1] : t.trim()); } catch { return null; }
};
// selfassessment
for (const n of ["base","tip","newtip"]) {
  const j = load(n,"selfassessment");
  const norm = x => typeof x === "string" ? JSON.parse(x) : x;
  const f = (j.findings||[]).map(norm);
  console.log(n, "clean="+j.clean, "mismatches="+(j.mismatches ?? "ABSENT"), "findings="+f.length,
    "statuses="+JSON.stringify(f.reduce((a,x)=>{const k=x.status??x.state??(x.superseded?"cleared":"open");a[k]=(a[k]||0)+1;return a;},{})));
  console.log("   sample="+JSON.stringify(f.slice(0,3)));
}
// adjacency
for (const n of ["base","tip","newtip"]) {
  const j = load(n,"adjacency");
  const reasons = (j.findings||[]).map(f => (typeof f==="string"?f:f.reason));
  const counts = reasons.reduce((a,r)=>{a[r]=(a[r]||0)+1;return a;},{});
  console.log("adjacency", n, "verdict="+j.verdict, "rows="+j.rows, "verified="+j.verified, "n="+reasons.length, JSON.stringify(counts));
}
// aria
for (const n of ["base","tip","newtip"]) {
  const j = load(n,"aria-bare");
  const st = (j.findings||[]).reduce((a,x)=>{const k=x.status; a[k]=(a[k]||0)+1; return a;},{});
  console.log("aria", n, "ok="+j.ok, "findings="+(j.findings||[]).length, JSON.stringify(st), "classification="+JSON.stringify(j.classification));
}
// round-evidence-audit
for (const n of ["base","tip","newtip"]) {
  const j = load(n,"round-evidence-audit");
  const norm = x => typeof x==="string"?JSON.parse(x):x;
  const f=(j.findings||[]).map(norm);
  console.log("rea", n, "clean="+j.clean, "classes="+JSON.stringify(j.findingClasses||j.classIds), "n="+f.length);
}
// release-pins
for (const n of ["tip","newtip"]) {
  const j = load(n,"release-pins");
  console.log("release-pins", n, JSON.stringify({clean:j.clean,population:j.population,unresolved:j.unresolved,holds:j.holds,drifted:j.drifted}));
}
