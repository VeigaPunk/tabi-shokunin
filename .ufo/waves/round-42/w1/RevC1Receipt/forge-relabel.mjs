import fs from 'node:fs';
const [recIn,witIn,recOut,witOut,nonce]=process.argv.slice(2);
const r=JSON.parse(fs.readFileSync(recIn,'utf8'));
r.runNonce=nonce; for(const run of r.runs||[]) run.runNonce=nonce;
fs.writeFileSync(recOut,JSON.stringify(r));
const w=JSON.parse(fs.readFileSync(witIn,'utf8')); w.nonce=nonce;
fs.writeFileSync(witOut,JSON.stringify(w));
console.log(JSON.stringify({recNonce:r.runNonce,runNonces:(r.runs||[]).map(x=>x.runNonce),witNonce:w.nonce,witSamples:(w.samples||[]).length,measuredAt:r.measuredAt,spanSum:(r.runs||[]).reduce((a,x)=>{const s=x.samples||[];return a+(s.length>1?s.at(-1).t-s[0].t:0)},0)}));
