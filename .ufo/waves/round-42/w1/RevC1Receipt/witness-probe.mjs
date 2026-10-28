import fs from 'node:fs';
const S='/fast/scratch/hyaku/tabi-r42/RevC1Receipt';
const r=JSON.parse(fs.readFileSync(S+'/forge/receipt.json','utf8'));
const w=JSON.parse(fs.readFileSync(S+'/forge/receipt.witness.json','utf8'));
const nodePid=r.runs[0].owned.nodePid;
w.samples=w.samples.map(s=>({...s,tree:(s.tree||[]).filter(p=>p.pid===nodePid)}));
fs.writeFileSync(S+'/forge/witness-nodeonly.json',JSON.stringify(w));
console.log(JSON.stringify({nodePid,samples:w.samples.length,firstTree:w.samples[0].tree}));
