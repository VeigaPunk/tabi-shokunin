import fs from 'node:fs'; import path from 'node:path'; import { spawnSync } from 'node:child_process';
const [lane, work, real, nonce, pin, from, to] = process.argv.slice(2);
const counter=fs.readFileSync(path.join(lane,'scripts/check-imecompose-r74.mjs'),'utf8');
const battery=fs.readFileSync(path.join(lane,'scripts/negatives-imecompose-r74.mjs'),'utf8');
const driver=fs.readFileSync(path.join(lane,'scripts/chrome-cdp-imecompose-round74.mjs'));
const n=path.basename(real).replace('.receipt.json','');
const C1=path.join(lane,'.ufo/waves/round-74/controls/c1');
const priors=[]; for(let i=1;i<=9;i++) if(`smoke${i}`!==n) priors.push('--prior',path.join(C1,`smoke${i}.receipt.json`));
for(const k of ['dispatch-key','exec-command','script-events']) priors.push('--prior',path.join(C1,`degenerate-${k}.receipt.json`));
const src=counter.replace(from,to); if(src===counter){console.error('no-op replace');process.exit(2);}
const d=path.join(work,'tol-'+Buffer.from(from+to).toString('hex').slice(0,16)); fs.mkdirSync(path.join(d,'w'),{recursive:true});
fs.writeFileSync(path.join(d,'check-imecompose-r74.mjs'),src);
fs.writeFileSync(path.join(d,'negatives-imecompose-r74.mjs'),battery);
fs.writeFileSync(path.join(d,'chrome-cdp-imecompose-round74.mjs'),driver);
const p=spawnSync(process.execPath,[path.join(d,'negatives-imecompose-r74.mjs'),'--real',real,'--expect-driver-sha256',pin,'--expect-nonce',nonce,...priors,'--work',path.join(d,'w'),'--json'],{encoding:'utf8',timeout:600000});
let j=null; try{j=JSON.parse(p.stdout);}catch{}
console.log(JSON.stringify({from,to,exit:p.status,allOk:j&&j.allOk,positiveOk:j&&j.positiveOk,passed:j&&j.passed,cases:j&&j.cases,failed:j?j.failed:null},null,1));
