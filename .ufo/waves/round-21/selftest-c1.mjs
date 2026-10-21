#!/usr/bin/env node
// Full CLI cases in a disposable Git repository; expected.json is an independent oracle.
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
const HOME = dirname(fileURLToPath(import.meta.url));
const BASE = JSON.parse(readFileSync(join(HOME,'fixtures/positive-ordered.json'))).files;
const EXPECTED = JSON.parse(readFileSync(join(HOME,'fixtures/expected.json')));
const PREFIX='corpus/evidence/round-21/runtime/';
const RECEIPT=PREFIX+'receipt.json';
const NOTE='corpus/knowledge/webmcp-nonautosubmit-round-21.md';
const HASH=(v)=>createHash('sha256').update(v).digest('hex');
const cleanEnv={PATH:process.env.PATH,HOME:process.env.HOME,LANG:'C',GIT_CONFIG_NOSYSTEM:'1',GIT_CONFIG_GLOBAL:'/dev/null',GIT_AUTHOR_NAME:'tabi-fixture',GIT_AUTHOR_EMAIL:'fixture@invalid.local',GIT_COMMITTER_NAME:'tabi-fixture',GIT_COMMITTER_EMAIL:'fixture@invalid.local',GIT_NO_REPLACE_OBJECTS:'1'};
function mutate(name,files){
 const r=JSON.parse(files[RECEIPT]);
 const first=r.cases[0];
 const e=JSON.parse(files[first.evidence.path]);
 let changed=false;
 switch(name){
 case 'positive':return;
 case 'baseline':delete files[RECEIPT];delete files[NOTE];return;
 case 'partial':delete files[NOTE];return;
 case 'missing-case':r.cases.pop();break;
 case 'duplicate-case':r.cases[11]=structuredClone(first);break;
 case 'producer-edit':files['scripts/webmcp-lifecycle-round21.mjs']+='\nchanged';return;
 case 'source-edit':files['.ufo/waves/round-21/sources/html_form_element.cc']+='\nchanged';return;
 case 'evidence-edit':files[first.evidence.path]+='\n';return;
 case 'fixture-edit':files[PREFIX+first.id+'.html']+='changed';return;
 case 'invocation-mismatch':first.invocationId='wrong-id';break;
 case 'no-invoke':e.frames=e.frames.filter(f=>f.dir!=='sent');changed=true;break;
 case 'reused-nonce':r.cases[1].nonce=first.nonce;break;
 case 'empty-pids':e.browserPidsBefore=[];changed=true;break;
 case 'survivor':e.browserPidsAfter=[1000];changed=true;break;
 case 'cleanup-summary':r.cleanup.browserClosed=false;break;
 case 'false-pending':e.frames.splice(2,0,{seq:0,at:996,dir:'event',method:'WebMCP.toolResponded',params:{invocationId:first.invocationId,status:'Completed'}});changed=true;break;
 case 'response-mismatch':first.after.responses=[{invocationId:first.invocationId,status:'Completed'}];break;
 case 'absent-note-case':files[NOTE]=files[NOTE].replace('`na-pending`','missing');return;
 case 'wrong-source':files['.ufo/waves/round-21/source-opening.json']=JSON.stringify({sourceId:'S096',decodedSha256:'0'.repeat(64)});return;
 case 'row-url-drift':files['corpus/SOURCES.md']=files['corpus/SOURCES.md'].replace('https://chromium.googlesource.com/','https://invalid.example/');return;
 case 'own-work-row-missing':files['corpus/SOURCES.md']=files['corpus/SOURCES.md'].split('\n').filter(line=>!line.startsWith('| S101 |')).join('\n');return;
 case 'flags-missing':r.environment.flags.pop();break;
 case 'wrong-build':r.environment.chromium='0.0.0.0';break;
 case 'short-window':first.preAction.windowMs=1;break;
 case 'before-action-order':e.frames.find(f=>f.dir==='action').at=1200;changed=true;break;
 case 'nonfinite-clock':e.frames[0].at=null;changed=true;break;
 case 'download':e.downloads=[{at:1500}];changed=true;break;
 case 'external-request':e.blocked=['https://invalid.example/'];changed=true;break;
 case 'case-kind-drift':first.action='click';e.action='click';e.frames.find(f=>f.dir==='action').action='click';changed=true;break;
 case 'missing-observation-marker':e.frames=e.frames.filter(f=>!(f.dir==='observation'&&f.label==='pre-action'));changed=true;break;
 case 'autosubmit-fixture-toggle':files[PREFIX+first.id+'.html']=files[PREFIX+first.id+'.html'].replace('<form>','<form toolautosubmit>');e.fixture.sha256=HASH(files[PREFIX+first.id+'.html']);changed=true;break;
 case 'unavailable-null-positive':
 case 'unavailable-to-empty': {
   const post=e.pageObservations.find(p=>p.label==='after-action');
   delete post.value.submits;
   e.frames.find(f=>f.dir==='observation'&&f.label==='after-action').value=structuredClone(post.value);
   first.after.pageState=structuredClone(post.value);
   first.after.submits=name==='unavailable-null-positive'?null:[];
   changed=true;break;
 }
 case 'late-response-outside-window':
 case 'late-response-summary': {
   const params={invocationId:first.invocationId,status:'Completed'};
   e.frames.push({seq:0,at:1800,dir:'event',method:'WebMCP.toolResponded',params});
   if(name==='late-response-summary')first.after.responses=[params];
   changed=true;break;
 }
 case 'foreign-response-ignored':
 case 'foreign-response-summary': {
   const params={invocationId:'different-invocation',status:'Completed'};
   e.frames.splice(e.frames.length-1,0,{seq:0,at:1500,dir:'event',method:'WebMCP.toolResponded',params});
   e.pageObservations.find(p=>p.label==='after-action').seq=8;
   if(name==='foreign-response-summary')first.after.responses=[params];
   changed=true;break;
 }
 case 'response-before-invoke': {
   const params={invocationId:first.invocationId,status:'Completed'};
   e.frames.splice(1,0,{seq:0,at:992,dir:'event',method:'WebMCP.toolResponded',params});
   e.pageObservations.find(p=>p.label==='pre-action').seq=5;
   e.pageObservations.find(p=>p.label==='after-action').seq=8;
   first.preAction.responseCount=1;
   first.after.responses=[params];changed=true;break;
 }
 case 'marker-mirror':e.pageObservations[0].value.formActive=false;changed=true;break;
 case 'action-phase':e.frames.find(f=>f.dir==='action').phase='intent-only';changed=true;break;
 case 'missing-action-ack':e.frames=e.frames.filter(f=>f.dir!=='action-complete');changed=true;break;
 case 'input-nonce':e.frames.find(f=>f.dir==='sent').params.input.q='wrong-nonce';changed=true;break;
 case 'broken-sequence-chain': {
   e.frames.splice(3,0,e.frames.splice(4,1)[0]);
   e.pageObservations[0].seq=5;
   changed=true;break;
 }
 default:throw Error('unknown persisted test:'+name);
 }
 if(changed){e.frames.forEach((f,i)=>f.seq=i+1);files[first.evidence.path]=JSON.stringify(e,null,2)+'\n';first.evidence.sha256=HASH(files[first.evidence.path]);}
 files[RECEIPT]=JSON.stringify(r,null,2)+'\n';
}
const temporary=mkdtempSync(join(tmpdir(),'tabi-r21-cli-selftest-'));
const reports=[];
try{
 for(const expected of EXPECTED){
  const dir=join(temporary,expected.name);mkdirSync(dir);
  const git=(args)=>{const r=spawnSync('git',['-c','core.fsmonitor=false',...args],{cwd:dir,env:cleanEnv,encoding:'utf8'});if(r.status!==0)throw Error(r.stderr);return r.stdout.trim();};
  const files=structuredClone(BASE);mutate(expected.name,files);
  files['.ufo/waves/round-21/measure-c1.mjs']=readFileSync(join(HOME,'measure-c1.mjs'),'utf8');
  for(const [path,bytes]of Object.entries(files)){const to=join(dir,path);mkdirSync(dirname(to),{recursive:true});writeFileSync(to,bytes);}
  git(['init','-q']);git(['add','--','.']);git(['commit','-qm','isolated fixture']);
  const rev=git(['rev-parse','HEAD']);
  const run=spawnSync(process.execPath,[join(dir,'.ufo/waves/round-21/measure-c1.mjs'),rev],{cwd:dir,env:cleanEnv,encoding:'utf8',timeout:30000});
  let observed;try{observed=JSON.parse(run.stdout);}catch{observed={findings:[],value:null};}
  const ids=observed.findings?.map(f=>f.id)||[];
  const pass=run.status===expected.exit&&observed.value===expected.value&&(expected.finding?ids.includes(expected.finding):ids.length===0);
  reports.push({name:expected.name,expected,exit:run.status,findings:ids,value:observed.value,pass,stdout:run.stdout,stderr:run.stderr});
 }
 console.log(JSON.stringify({schema:'tabi-round21-c1-selftest-v1',verdict:reports.every(r=>r.pass)?'clean':'failed',cases:reports.length,passed:reports.filter(r=>r.pass).length,reports}));
 process.exitCode=reports.every(r=>r.pass)?0:1;
}finally{rmSync(temporary,{recursive:true,force:true});}
