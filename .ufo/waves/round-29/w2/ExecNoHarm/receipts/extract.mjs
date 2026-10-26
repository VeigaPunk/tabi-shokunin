import fs from "node:fs";
const S = process.argv[2];
const gates = fs.readdirSync(`${S}/gates/base`).filter(f=>f.endsWith(".exit")).map(f=>f.slice(0,-5));
for (const g of gates.sort()) {
  const row = {};
  for (const n of ["base","tip"]) {
    const ec = (()=>{ try { return fs.readFileSync(`${S}/gates/${n}/${g}.exit`,"utf8").trim(); } catch { return "?"; } })();
    let t = ""; try { t = fs.readFileSync(`${S}/gates/${n}/${g}.out`,"utf8"); } catch {}
    const m = t.match(/^[A-Z_]+_JSON (\{[\s\S]*\})$/m);
    let j = null; try { j = JSON.parse(m ? m[1] : t.trim()); } catch {}
    let summary;
    if (j) {
      const keys = ["valid","ok","clean","verdict","exit","findings","mismatches","population","unresolved","holds","drifted","rows","verified","cases","passed","casesChecked","cleanCount","count"];
      const pick = {};
      for (const k of keys) if (k in j) pick[k] = Array.isArray(j[k]) ? j[k].map(x=>typeof x==="string"?x:(x?.id||x?.finding||JSON.stringify(x).slice(0,60))) : j[k];
      summary = JSON.stringify(pick).slice(0,400);
    } else summary = t.split("\n").filter(l=>l.trim()).slice(-1)[0]?.slice(0,200) ?? "(no output)";
    row[n] = `exit=${ec} ${summary}`;
  }
  console.log(`\n## ${g}\n  base: ${row.base}\n  tip : ${row.tip}`);
}
