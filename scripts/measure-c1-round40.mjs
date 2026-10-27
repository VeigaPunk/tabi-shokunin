#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
const ROOT='/home/vgpnk/Projects/shokunin/tabi-shokunin';
const DRIVER=path.join(ROOT,'scripts/playwright-firefox-egress-round39.mjs');
const COUNTER=path.join(ROOT,'.ufo/waves/round-40/counters/c1-sample-span-v3.mjs');
const argv=process.argv.slice(2); let out=null,scratch=null;
for(let i=0;i<argv.length;i++){if(argv[i]==='--out')out=argv[++i];else if(argv[i]==='--scratch')scratch=argv[++i];}
if(!out||!scratch){console.error('usage: node scripts/measure-c1-round40.mjs --out <fresh receipt.json> --scratch <explicit dir>');process.exit(64)}
const outPath=path.resolve(out),scratchPath=path.resolve(scratch);
if(fs.existsSync(outPath)){console.error(JSON.stringify({schema:'tabi-r40-c1-measure',finding:'output-already-exists',path:outPath}));process.exit(1)}
fs.mkdirSync(path.dirname(outPath),{recursive:true});
fs.mkdirSync(scratchPath,{recursive:true});
const nonce=crypto.randomBytes(32).toString('hex');
const driverSha256=crypto.createHash('sha256').update(fs.readFileSync(DRIVER)).digest('hex');
const run=spawnSync(process.execPath,[DRIVER,'--round40','--runs','2','--out',outPath,'--scratch',scratchPath,'--nonce',nonce],{cwd:ROOT,encoding:'utf8',env:{...process.env,HYAKU_SCRATCH:scratchPath},maxBuffer:16<<20});
if(run.error){console.error(JSON.stringify({schema:'tabi-r40-c1-measure',finding:'driver-spawn-failed',message:run.error.message,driverSha256}));process.exit(2)}
let receipt; try{receipt=JSON.parse(fs.readFileSync(outPath,'utf8'))}catch(e){console.error(JSON.stringify({schema:'tabi-r40-c1-measure',finding:'driver-receipt-unreadable',message:e.message,driverExit:run.status,driverStdout:run.stdout,driverStderr:run.stderr,driverSha256}));process.exit(2)}
const nonceMatches=receipt.runNonce===nonce&&Array.isArray(receipt.runs)&&receipt.runs.length===2&&receipt.runs.every(r=>r.runNonce===nonce);
if(!nonceMatches){console.log(JSON.stringify({schema:'tabi-r40-c1-measure',finding:'fresh-run-nonce-mismatch',driverExit:run.status,driverSha256,receiptRunNonce:receipt.runNonce,nonceMatches:false}));process.exit(1)}
const scored=spawnSync(process.execPath,[COUNTER,outPath,'--nonce',nonce],{cwd:ROOT,encoding:'utf8',maxBuffer:16<<20});
let counter;try{counter=JSON.parse(scored.stdout)}catch(e){console.error(JSON.stringify({schema:'tabi-r40-c1-measure',finding:'counter-output-unparseable',driverExit:run.status,counterExit:scored.status,driverSha256,driverStdout:run.stdout,driverStderr:run.stderr,counterStdout:scored.stdout,counterStderr:scored.stderr}));process.exit(2)}
const result={schema:'tabi-r40-c1-measure',out:outPath,driverPath:'scripts/playwright-firefox-egress-round39.mjs --round40',driverSha256,driverExit:run.status,driverStdout:run.stdout,driverStderr:run.stderr,nonceMatches:true,counterExit:scored.status,counter};
console.log(JSON.stringify(result));
process.exit(run.status===0&&scored.status===0&&counter.predicate===true?0:1);
