#!/usr/bin/env node
// Replay the frozen r62 production CLI over the committed live fixture and its
// eight declared one-field forgeries. Supplements (does NOT rewrite) the frozen
// counter's pure selftest. All negative cases assert exit 1 AND a stable id.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const wave=path.join(root,'.ufo/waves/round-62');
const counter=path.join(wave,'counters/chromium-receipt-r62.mjs');
const driver=path.join(root,'scripts/chrome-cdp-loopback-round62.mjs');
const shot=path.join(root,'corpus/evidence/round62/chromium-secondary-button');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const pins=JSON.parse(fs.readFileSync(path.join(wave,'instrument-pins.json')));
for(const file of [counter,driver]){
 if(sha(fs.readFileSync(file))!==pins[path.relative(root,file)])throw new Error('snapshot_tampered: '+file);
}
if(!process.argv.includes('--self-test'))throw new Error('usage: node scripts/check-secondary-round62.mjs --self-test [--scratch ABS]');
const idx=process.argv.indexOf('--scratch');
const scratch=idx>=0?process.argv[idx+1]:path.join(process.env.HYAKU_SCRATCH||'/fast/scratch/hyaku','tabi-r62','l1-cli-replay');
if(!path.isAbsolute(scratch))throw new Error('scratch must be absolute');
fs.mkdirSync(scratch,{recursive:true});
const temp=fs.mkdtempSync(path.join(scratch,'cli-'));
const source=JSON.parse(fs.readFileSync(path.join(shot,'receipt.json')));
const {forgeries}=await import(counter);
const ids={f1:'pointer-buttons-0',f2:'pointer-types',f3:'trusted-fields',f4:'mouse-types',f5:'pointer-buttons-1',f6:'pointer-identity',f7:'menu-cancelation-1',f8:'survivors'};
const results=[];
try{
 for(const name of ['live',...Object.keys(forgeries)]){
  const r=structuredClone(source);
  if(name!=='live')forgeries[name](r);
  const file=path.join(temp,name+'.json');fs.writeFileSync(file,JSON.stringify(r));
  const args=[counter,file,'--driver',driver,'--expect-driver-sha256',pins[path.relative(root,driver)],'--shot',shot,'--json'];
  const out=spawnSync(process.execPath,args,{encoding:'utf8'});
  let verdict=null;try{verdict=JSON.parse(out.stdout);}catch{}
  const expectedExit=name==='live'?0:1;
  const ok=out.status===expectedExit && (name==='live'?verdict?.predicate===true:verdict?.findings?.includes(ids[name]));
  results.push({name,expectedExit,expectedFinding:ids[name]||null,exit:out.status,ok,counterSha256:sha(fs.readFileSync(counter)),probeSha256:sha(fs.readFileSync(file)),argv:[process.execPath,...args],stdout:out.stdout,stderr:out.stderr});
 }
}finally{fs.rmSync(temp,{recursive:true,force:true});}
const allPass=results.every(r=>r.ok);
console.log(JSON.stringify({schema:'tabi-r62-production-path-selftest',allPass,cases:results.length,results},null,1));
process.exitCode=allPass?0:1;
