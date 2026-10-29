// Variant B: honest committed receipt+witness bytes, but the measure record is
// re-authored and re-signed by the forger's OWN key. Does the counter accept?
import { spawn } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
const LANE='/home/vgpnk/Projects/shokunin/tabi-shokunin';
const C=LANE+'/.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs';
const OUT='/fast/scratch/hyaku/tabi-r43/ScribeEntryAuth/attack2';
fs.rmSync(OUT,{recursive:true,force:true}); fs.mkdirSync(OUT,{recursive:true});
const canonical=(v)=>{if(v===null||typeof v!=='object')return JSON.stringify(v);if(Array.isArray(v))return '['+v.map(canonical).join(',')+']';return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}';};
const sha=(b)=>crypto.createHash('sha256').update(b).digest('hex');
const fileSha=(p)=>sha(fs.readFileSync(p));
const receipt=fs.readFileSync(LANE+'/corpus/evidence/round43/playwright-egress/receipt.json','utf8');
const witness=fs.readFileSync(LANE+'/corpus/evidence/round43/playwright-egress/receipt.witness.json','utf8');
const honest=JSON.parse(fs.readFileSync(LANE+'/.ufo/waves/round-43/measure/c1-measure-r43.json','utf8'));
const wk=crypto.generateKeyPairSync('ed25519');
const m={schema:honest.schema, nonce:honest.nonce, createdAt:new Date().toISOString(),
  pubkeys:{wrapper:wk.publicKey.export({type:'spki',format:'pem'}).toString(), witness:honest.pubkeys.witness},
  bindings:{receiptSha256:sha(Buffer.from(receipt,'utf8')), witnessSha256:sha(Buffer.from(witness,'utf8')), runs:2},
  digests:{
    'scripts/measure-c1-round43.mjs': fileSha(LANE+'/scripts/measure-c1-round43.mjs'),
    'scripts/playwright-firefox-egress-round43.mjs': fileSha(LANE+'/scripts/playwright-firefox-egress-round43.mjs'),
    '.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs': fileSha(LANE+'/.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs')
  },
  gate:honest.gate, elapsedMs:honest.elapsedMs, driverExit:0};
const us=canonical(m);
m.signature={scheme:'ed25519', over:sha(Buffer.from(us,'utf8')), value:crypto.sign(null,Buffer.from(us,'utf8'),wk.privateKey).toString('hex')};
fs.writeFileSync(OUT+'/receipt.json',receipt);
fs.writeFileSync(OUT+'/receipt.witness.json',witness);
fs.writeFileSync(OUT+'/measure.json',JSON.stringify(m,null,1));
const priv=wk.privateKey;
const child=spawn(process.execPath,[C,OUT+'/receipt.json','--measure',OUT+'/measure.json'],{stdio:['ignore','pipe','pipe','pipe','pipe']});
let out='',chal=Buffer.alloc(0);
child.stdout.on('data',d=>out+=d);
child.stdio[3].on('data',d=>{chal=Buffer.concat([chal,d]);});
child.stdio[3].on('end',()=>{
  if(chal.length===32) child.stdio[4].write(crypto.sign(null,chal,priv).toString('hex')+'\n');
  child.stdio[4].end();
});
const code=await new Promise(r=>child.on('exit',r));
let d=null; try{d=JSON.parse(out);}catch{}
delete d?.predicateSentence;
console.log(JSON.stringify({variant:'B: honest bytes, forger-signed measure record', exit:code, ...d},null,1));
