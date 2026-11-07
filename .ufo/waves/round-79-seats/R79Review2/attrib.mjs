import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
const LANE='/home/vgpnk/Projects/shokunin/tabi-shokunin';
const COUNTER=path.join(LANE,'scripts/check-showpicker-r79.mjs');
const REAL=path.join(LANE,'corpus/evidence/round79/chromium-showpicker/receipt.json');
const PRIOR=path.join(LANE,'.ufo/waves/round-79/controls/c1/prior-set.txt');
const PIN='e9c87159e5d5212237437eb7a80a2d26fcd8086603dae1e37db64ce1aaf94933';
const NONCE='tabi-r79-l1-80830674d421';
const FIX='2e80efa0c96d4c3ccc952d9b54353d8c079e6c9156abbc3d78dfd38d0bc5c5c8';
const realSha=crypto.createHash('sha256').update(fs.readFileSync(REAL)).digest('hex');
const bat=JSON.parse(fs.readFileSync('battery.json','utf8'));
const expectByCase=new Map(bat.results.map(r=>[r.case,r.expect]));
const dir=path.join('/fast/scratch/hyaku/tabi-r79/R79Review2/battery','cases');
const files=fs.readdirSync(dir).filter(f=>f.endsWith('.json')&&!f.startsWith('replay-threshold-sweep-k')).sort();
const out=[];
for (const f of files) {
  const name=f.replace(/\.json$/,'');
  if (['prior-set-complete','prior-set-unparsable','prior-set-unmatched-exempt','foreign-schema-in-walk-ignored','honest-tree-exempt-sha256'].includes(name)) { out.push({name,skipped:'mirror-lane'}); continue; }
  const args=[COUNTER,'--lane',LANE,'--receipt',path.join(dir,f),'--expect-driver-sha256',PIN,'--expect-nonce',NONCE,'--expect-fixture-sha256',FIX,'--prior-set',PRIOR,'--tree-exempt-sha256',realSha,'--json'];
  const r=spawnSync(process.execPath,args,{encoding:'utf8',timeout:120000});
  let j=null; try{j=JSON.parse(r.stdout);}catch{}
  out.push({name,expect:expectByCase.get(name)??null,status:r.status,verdict:j&&j.verdict,findings:j?j.findings:null,limit:j?j.limit:null,stderr:r.stderr.slice(0,200)});
}
fs.writeFileSync('attrib.json',JSON.stringify(out,null,1));
console.log('cases',out.length,'ran',out.filter(x=>!x.skipped).length);
