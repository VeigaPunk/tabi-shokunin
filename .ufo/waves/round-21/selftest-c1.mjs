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
const CARRIER='.ufo/waves/round-21/sources/html_form_element.cc.base64.gz';
const EXECUTION='.ufo/waves/round-21/runtime-execution-finalized.json';
BASE[CARRIER]=readFileSync(join(HOME,'fixtures/source-carrier.gz'));
const EXPECTED = JSON.parse(readFileSync(join(HOME,'fixtures/expected.json')));
const PREFIX='corpus/evidence/round-21/runtime/';
const RECEIPT=PREFIX+'receipt.json';
const NOTE='corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md';
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
 case 'false-pending': {
   const params={invocationId:first.invocationId,status:'Completed'};
   e.frames.splice(2,0,{seq:0,at:996,dir:'event',method:'WebMCP.toolResponded',params});
   e.pageObservations[0].seq=5;e.pageObservations[1].seq=8;
   first.after.responses=[params];changed=true;break;
 }
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
 case 'producer-absent':delete files['scripts/webmcp-lifecycle-round21.mjs'];return;
 case 'producer-resealed':files['scripts/webmcp-lifecycle-round21.mjs']+='\n// altered producer\n';r.producer.sha256=HASH(files['scripts/webmcp-lifecycle-round21.mjs']);break;
 case 'copied-note-source-label':files[NOTE]=files[NOTE].replace(/^source:.*$/m,'source: S999')+'\nS100 S101\n';return;
 case 'own-work-note-source-missing':files[NOTE]=files[NOTE].replace('S101 —','S999 —');return;
 case 's100-backlink-drift':
 case 's101-backlink-drift':
 case 's101-kind-drift':
 case 's101-tier-drift':
 case 's101-status-drift':
 case 's101-path-drift': {
   const edits={
     's100-backlink-drift':['S100',11,'unrelated.md'],
     's101-backlink-drift':['S101',11,'unrelated.md'],
     's101-kind-drift':['S101',3,'code'],
     's101-tier-drift':['S101',4,'B'],
     's101-status-drift':['S101',8,'queued'],
     's101-path-drift':['S101',2,'Fixture — wrong-receipt.json'],
   };
   const [id,column,value]=edits[name];
   files['corpus/SOURCES.md']=files['corpus/SOURCES.md'].split('\n').map(line=>{const c=line.split('|');if(c[1]?.trim()!==id)return line;c[column]=' '+value+' ';return c.join('|');}).join('\n');
   return;
 }
 case 'null-frame-member':e.frames[0]=null;changed=true;break;
 case 'null-observation-member':e.pageObservations[0]=null;changed=true;break;
 case 'object-case-id':first.id={toString:null};break;
 case 'missing-after-shape':delete first.after;break;
 case 'malformed-present-submits': {
   const post=e.pageObservations.find(p=>p.label==='after-action');
   post.value.submits={unexpected:true};
   e.frames.find(f=>f.dir==='observation'&&f.label==='after-action').value=structuredClone(post.value);
   first.after.pageState=structuredClone(post.value);first.after.submits=null;
   changed=true;break;
 }
 case 'case-id-case-drift':first.id='NA-pending';break;
 case 'quoted-attribute-spoof':
 case 'boolean-false-attribute-green': {
   const c=r.cases.find(c=>c.id==='auto-positive');
   const ep=c.evidence.path, ev=JSON.parse(files[ep]), hp=ev.fixture.path;
   files[hp]=files[hp].replace('toolautosubmit',name==='quoted-attribute-spoof'?'data-note=" toolautosubmit "':'toolautosubmit="false"');
   ev.fixture.sha256=HASH(files[hp]);files[ep]=JSON.stringify(ev,null,2)+'\n';c.evidence.sha256=HASH(files[ep]);
   break;
 }
 case 'quoted-attribute-green':files[e.fixture.path]=files[e.fixture.path].replace('<form>','<form data-note=" toolautosubmit ">');e.fixture.sha256=HASH(files[e.fixture.path]);changed=true;break;
 case 'ack-action-mismatch':e.frames.find(f=>f.dir==='action-complete').action='submit';changed=true;break;
 case 'invoked-frame':e.frames.find(f=>f.method==='WebMCP.toolInvoked').params.frameId='wrong-frame';changed=true;break;
 case 'invoked-tool':e.frames.find(f=>f.method==='WebMCP.toolInvoked').params.toolName='wrong-tool';changed=true;break;
 case 'invoked-input':e.frames.find(f=>f.method==='WebMCP.toolInvoked').params.input='{"q":"wrong-input"}';changed=true;break;
 case 'page-nonce-echo':
 case 'page-input-echo': {
   const p=e.pageObservations[0];p.value[name==='page-nonce-echo'?'nonce':'value']='wrong-echo';
   e.frames.find(f=>f.dir==='observation'&&f.label==='pre-action').value=structuredClone(p.value);changed=true;break;
 }
 case 'node-only-mismatch':r.environment.node='v22.0.0';break;
 case 'flags-token-drop':r.environment.flags[0]=r.environment.flags[0].replace(',DeclarativeWebmcp','');break;
 case 'flags-disable-appended':r.environment.flags.push('--disable-features=DeclarativeWebmcp');break;
 case 'server-close-false':r.cleanup.serverClosed=false;break;
 case 'cleanup-server-error':r.cleanup.serverError='controlled failure';break;
 case 'context-close-false':e.contextClosed=false;changed=true;break;
 case 'context-close-error':e.closeError='controlled failure';changed=true;break;
 case 'raw-carrier-edit':files[CARRIER]=Buffer.from('not gzip');return;
 case 'raw-metadata-drift':
 case 'quote-location-drift': {
   const p='.ufo/waves/round-21/source-opening.json', s=JSON.parse(files[p]);
   if(name==='raw-metadata-drift')s.rawSha256='0'.repeat(64);else s.location='html_form_element.cc:1';
   files[p]=JSON.stringify(s);return;
 }
 case 'execution-record-missing':delete files[EXECUTION];return;
 case 'execution-exit':
 case 'execution-receipt-digest': {
   const x=JSON.parse(files[EXECUTION]);
   if(name==='execution-exit')x.exit=1;else x.receiptSha256='0'.repeat(64);
   files[EXECUTION]=JSON.stringify(x);return;
 }
 case 'response-payload-mismatch': {
   const params={invocationId:first.invocationId,status:'Completed',output:{ok:true}};
   e.frames.splice(e.frames.length-1,0,{seq:0,at:1500,dir:'event',method:'WebMCP.toolResponded',params});
   e.pageObservations[1].seq=8;first.after.responses=[{...params,status:'Error'}];changed=true;break;
 }
 case 'window-below-minimum':first.preAction.start=1001;first.preAction.windowMs=249;break;
 default:throw Error('unknown persisted test:'+name);
 }
 if(changed){e.frames.forEach((f,i)=>{if(f&&typeof f==='object'&&!Array.isArray(f))f.seq=i+1;});files[first.evidence.path]=JSON.stringify(e,null,2)+'\n';first.evidence.sha256=HASH(files[first.evidence.path]);}
 files[RECEIPT]=JSON.stringify(r,null,2)+'\n';
}
function sealAcquisition(files,name) {
  if(name.startsWith('execution-')||!files[EXECUTION])return;
  const x=JSON.parse(files[EXECUTION]);
  x.artifacts=Object.fromEntries(Object.entries(files).filter(([p])=>p.startsWith(PREFIX)).map(([p,bytes])=>[p,HASH(bytes)]));
  x.receiptSha256=x.artifacts[RECEIPT]??null;
  files[EXECUTION]=JSON.stringify(x,null,2)+'\n';
}
const temporary=mkdtempSync(join(tmpdir(),'tabi-r21-cli-selftest-'));
const reports=[];
try{
 for(const expected of EXPECTED){
  const dir=join(temporary,expected.name);mkdirSync(dir);
  const git=(args)=>{const r=spawnSync('git',['-c','core.fsmonitor=false',...args],{cwd:dir,env:cleanEnv,encoding:'utf8'});if(r.status!==0)throw Error(r.stderr);return r.stdout.trim();};
  const files=structuredClone(BASE);mutate(expected.name,files);sealAcquisition(files,expected.name);
  files['.ufo/waves/round-21/measure-c1.mjs']=readFileSync(join(HOME,'measure-c1.mjs'),'utf8');
  for(const [path,bytes]of Object.entries(files)){const to=join(dir,path);mkdirSync(dirname(to),{recursive:true});writeFileSync(to,bytes);}
  git(['init','-q']);git(['add','--','.']);git(['commit','-qm','isolated fixture']);
  const rev=git(['rev-parse','HEAD']);
  const run=spawnSync(process.execPath,[join(dir,'.ufo/waves/round-21/measure-c1.mjs'),rev],{cwd:dir,env:cleanEnv,encoding:'utf8',timeout:30000});
  let observed;try{observed=JSON.parse(run.stdout);}catch{observed={findings:[],value:null};}
  const ids=observed.findings?.map(f=>f.id)||[];
  const expectedVerdict=expected.exit===0?(expected.value===0?'baseline':'clean'):'failed';
  const pass=run.status===expected.exit&&observed.exit===expected.exit&&observed.verdict===expectedVerdict&&observed.value===expected.value&&(expected.finding?ids.includes(expected.finding):ids.length===0);
  reports.push({name:expected.name,expected,exit:run.status,findings:ids,value:observed.value,pass,stdout:run.stdout,stderr:run.stderr});
 }
 console.log(JSON.stringify({schema:'tabi-round21-c1-selftest-v1',verdict:reports.every(r=>r.pass)?'clean':'failed',cases:reports.length,passed:reports.filter(r=>r.pass).length,reports}));
 process.exitCode=reports.every(r=>r.pass)?0:1;
}finally{rmSync(temporary,{recursive:true,force:true});}
