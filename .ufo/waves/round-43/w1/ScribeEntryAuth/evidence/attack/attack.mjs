// Spawn counter v5 with fd3/fd4 pipes and answer the challenge with the
// FABRICATOR'S OWN Ed25519 key (never a browser run). Does predicate reach true?
import { spawn } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
const LANE='/home/vgpnk/Projects/shokunin/tabi-shokunin';
const C=LANE+'/.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs';
const D='/fast/scratch/hyaku/tabi-r43/ScribeEntryAuth/forge';
const priv=crypto.createPrivateKey(fs.readFileSync(D+'/wrapper-private.pem','utf8'));
const child=spawn(process.execPath,[C,D+'/receipt.json','--measure',D+'/measure.json'],{stdio:['ignore','pipe','pipe','pipe','pipe']});
let out='',err='',chal=Buffer.alloc(0);
child.stdout.on('data',d=>out+=d); child.stderr.on('data',d=>err+=d);
child.stdio[3].on('data',d=>{chal=Buffer.concat([chal,d]);});
child.stdio[3].on('end',()=>{
  console.log('challenge bytes received:',chal.length);
  if(chal.length===32){
    const sig=crypto.sign(null,chal,priv).toString('hex');
    child.stdio[4].write(sig+'\n');
  }
  child.stdio[4].end();
});
const code=await new Promise(r=>child.on('exit',r));
let doc=null; try{doc=JSON.parse(out);}catch(e){}
console.log('counter exit:',code);
if(doc){delete doc.predicateSentence; console.log(JSON.stringify(doc,null,1));} else {console.log('raw out:',out,'raw err:',err);}
