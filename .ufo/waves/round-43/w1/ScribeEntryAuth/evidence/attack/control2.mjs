// Control: same fabrication, but answer the challenge with a DIFFERENT key
// (not the one named in the measure record) -> should refuse.
import { spawn } from 'node:child_process';
import crypto from 'node:crypto';
const LANE='/home/vgpnk/Projects/shokunin/tabi-shokunin';
const C=LANE+'/.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs';
const D='/fast/scratch/hyaku/tabi-r43/ScribeEntryAuth/forge';
async function run(mode){
  const child=spawn(process.execPath,[C,D+'/receipt.json','--measure',D+'/measure.json'],{stdio:['ignore','pipe','pipe','pipe','pipe']});
  let out='',chal=Buffer.alloc(0);
  child.stdout.on('data',d=>out+=d);
  child.stdio[3].on('data',d=>{chal=Buffer.concat([chal,d]);});
  child.stdio[3].on('end',()=>{
    if(chal.length===32){
      if(mode==='wrong-key'){ const {privateKey}=crypto.generateKeyPairSync('ed25519'); child.stdio[4].write(crypto.sign(null,chal,privateKey).toString('hex')+'\n'); }
      if(mode==='right-key'){ const priv=crypto.createPrivateKey(require('fs').readFileSync(D+'/wrapper-private.pem','utf8')); child.stdio[4].write(crypto.sign(null,chal,priv).toString('hex')+'\n'); }
    }
    child.stdio[4].end();
  });
  const code=await new Promise(r=>child.on('exit',r));
  let d=null; try{d=JSON.parse(out);}catch{}
  return {mode, exit:code, challengeVerified:d?.challengeVerified, predicate:d?.predicate, findings:d?.findings};
}
import {createRequire} from 'node:module'; const require=createRequire(import.meta.url);
console.log(JSON.stringify(await run('wrong-key'),null,1));
console.log(JSON.stringify(await run('right-key'),null,1));
