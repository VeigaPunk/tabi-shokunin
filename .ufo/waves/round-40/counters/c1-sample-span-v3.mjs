#!/usr/bin/env node
// Round-40 C1 measured counter v3. Called only by measure-c1-round40, which creates a fresh nonce and runs the browser driver.
import fs from 'node:fs';
import crypto from 'node:crypto';
const PREDICATE='measure-c1-round40 invokes the Firefox driver for exactly two Playwright Firefox loopback runs with a fresh 64-hex nonce AND the produced receipt and each run carry that exact invocation nonce AND each run has >=8 strictly increasing samples whose first-to-last observed timestamp span is >=1000ms AND both ss and proc observations are available with positive ticks on every sample and final sweep AND all observed nonLoopback counts are zero AND per-run owned tree is nonempty AND both runs have identical firstShotSha256 AND both runs have zero survivors and closed fixture port AND browserVersion is bound AND the round-39 receipt without the current invocation nonce and with sample spans below 1000ms is refused';
function usable(x){return !!x&&x.unavailable!==true&&Number.isFinite(x.ticks)&&x.ticks>0&&Number.isFinite(x.nonLoopback)}
function evaluate(file,expectedNonce){
 const raw=fs.readFileSync(file,'utf8'),receipt=JSON.parse(raw),findings=[];
 const runs=Array.isArray(receipt.runs)?receipt.runs:[];
 if(receipt.schema!=='tabi-pw-firefox-egress-receipt-r40')findings.push('schema');
 if(!/^[0-9a-f]{64}$/.test(expectedNonce)||receipt.runNonce!==expectedNonce||runs.some(r=>r.runNonce!==expectedNonce))findings.push('run-nonce-mismatch');
 if(receipt.refused!==false||runs.length!==2)findings.push('run-set');
 for(let i=0;i<runs.length;i++){
  const r=runs[i],s=Array.isArray(r.samples)?r.samples:[];
  if(r.refused!==false)findings.push(`run${i+1}-refused`);
  if(s.length<8)findings.push(`run${i+1}-sample-count`);
  const ts=s.map(x=>x?.t);
  if(ts.some((t,j)=>!Number.isFinite(t)||(j>0&&t<=ts[j-1])))findings.push(`run${i+1}-sample-order`);
  if(ts.length<2||ts.at(-1)-ts[0]<1000)findings.push(`run${i+1}-sample-span`);
  for(const [j,x] of s.entries())for(const k of ['ss','proc']){
   if(!usable(x?.[k]))findings.push(`run${i+1}-sample${j+1}-${k}-unavailable`);
   else if(x[k].nonLoopback!==0)findings.push(`run${i+1}-sample${j+1}-${k}-egress`);
  }
  for(const k of ['ss','proc']){
   if(!usable(r.finalSweep?.[k]))findings.push(`run${i+1}-final-${k}-unavailable`);
   else if(r.finalSweep[k].nonLoopback!==0)findings.push(`run${i+1}-final-${k}-egress`);
  }
  if(!Array.isArray(r.owned?.tree)||r.owned.tree.length===0)findings.push(`run${i+1}-owned-empty`);
  if(r.survivors!==0||!Array.isArray(r.survivorPids)||r.survivorPids.length!==0)findings.push(`run${i+1}-survivors`);
  if(r.portClosed!==true)findings.push(`run${i+1}-port-open`);
  if(typeof r.browserVersion!=='string'||!r.browserVersion)findings.push(`run${i+1}-version`);
  if(!/^[0-9a-f]{64}$/.test(r.firstShotSha256||''))findings.push(`run${i+1}-shot-hash`);
 }
 if(runs.length===2&&runs[0]?.firstShotSha256!==runs[1]?.firstShotSha256)findings.push('shot-hash-diff');
 return {schema:'tabi-r40-c1-measured-v3',predicateSentence:PREDICATE,receiptSha256:crypto.createHash('sha256').update(raw).digest('hex'),nonceMatched:!findings.includes('run-nonce-mismatch'),predicate:findings.length===0,findings};
}
const args=process.argv.slice(2),file=args[0];let nonce=null;for(let i=1;i<args.length;i++)if(args[i]==='--nonce')nonce=args[++i];
if(!file||!nonce){console.error('usage: node c1-sample-span-v3.mjs <receipt.json> --nonce <runner nonce>');process.exit(64)}
try{const out=evaluate(file,nonce);console.log(JSON.stringify(out));process.exit(out.predicate?0:1)}catch(e){console.error(`could-not-evaluate: ${e.message}`);process.exit(2)}
