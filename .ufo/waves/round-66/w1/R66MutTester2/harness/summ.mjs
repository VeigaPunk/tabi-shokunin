import fs from 'node:fs';
const dir = process.argv[2];
for (const k of ['baseline','mut-a','mut-b','mut-c','mut-d','mut-e','mut-f']) {
  const j = JSON.parse(fs.readFileSync(`${dir}/${k}.json`,'utf8'));
  const e = fs.readFileSync(`${dir}/${k}.exit`,'utf8').trim();
  const f0 = j.findings[0];
  const c = {}; j.findings.forEach(f => c[f.id]=(c[f.id]||0)+1);
  console.log(k, 'exit='+e, 'predicate='+j.predicate, 'findingCount='+j.findingCount, 'first='+(f0?f0.id+' | '+f0.detail:'-'), JSON.stringify(c));
}
