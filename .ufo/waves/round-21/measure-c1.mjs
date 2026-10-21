#!/usr/bin/env node
// Counts finite evidence-backed observations, NOT semantic entailment or branch coverage.
// 0 baseline/clean; 1 evaluated findings; 2 could-not-evaluate. Git blobs only.
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';
const SELF = fileURLToPath(import.meta.url);
export const IDS = ['na-pending','na-click','na-requestsubmit','na-native-submit','na-reset','na-remove','na-reject','na-throw','na-delayed','na-invalid-submit','auto-positive','auto-invalid'];
const CONFIG = [
  [false,'none','success'], [false,'click','success'],
  [false,'requestSubmit','success'], [false,'submit','success'],
  [false,'reset','success'], [false,'remove','success'],
  [false,'requestSubmit','reject'], [false,'requestSubmit','throw'],
  [false,'requestSubmit','delayed'], [false,'invalidRequestSubmit','success'],
  [true,'none','success'], [true,'none','invalid'],
];
const FLAGS = [
  '--enable-features=CDPScreenshotNewSurface,WebMCP,WebMCPTesting,DevToolsWebMCPSupport,DeclarativeWebmcp',
  '--enable-blink-features=WebMCP,WebMCPTesting',
  '--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1',
  '--disable-extensions',
];
export const PREFIX = 'corpus/evidence/round-21/runtime/';
export const PRODUCER = 'scripts/webmcp-lifecycle-round21.mjs';
export const NOTE = 'corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md';
export const EXECUTION = '.ufo/waves/round-21/runtime-execution-finalized.json';
export const SOURCE_BODY = '.ufo/waves/round-21/sources/html_form_element.cc';
export const SOURCE_CARRIER = '.ufo/waves/round-21/sources/html_form_element.cc.base64.gz';
const PRODUCER_SHA = 'bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811';
export const INPUT_PATHS = [PRODUCER, NOTE, 'SKILL.md', 'corpus/SOURCES.md', '.ufo/waves/round-21/source-opening.json', SOURCE_BODY, SOURCE_CARRIER, EXECUTION, PREFIX];
export const FINDINGS = ['partial_state','receipt_shape','case_set','producer_digest','environment','cleanup','source_binding','note_missing','case_shape','nonce_reused','evidence_missing','evidence_digest','fixture_digest','case_identity','raw_invoke','invoke_identity','event_identity','window_mismatch','summary_mismatch','context_cleanup','boundary_violation','order_mismatch','execution_binding'];
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
const equal = (a,b) => JSON.stringify(a) === JSON.stringify(b);
const plain = (v) => v && typeof v === 'object' && !Array.isArray(v);
const hex = (v) => typeof v === 'string' && /^[a-f0-9]{64}$/.test(v);
const SOURCE_SHA = '8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916';
const SOURCE_URL = 'https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT';
// Finite first-literal-form grammar, not a general HTML parser: quoted values
// are consumed as values, never mistaken for boolean attribute names.
function formAttributes(html) {
  const form=/<form\b((?:"[^"]*"|'[^']*'|[^'">])*)>/i.exec(html);
  if(!form)return null;
  const attributes=new Set();
  const tokens=/([^\s"'<>/=]+)(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?/g;
  let end=0, token;
  while((token=tokens.exec(form[1]))){
    if(!/^\s*$/.test(form[1].slice(end,token.index)))return null;
    attributes.add(token[1].toLowerCase());end=tokens.lastIndex;
  }
  return /^\s*\/?\s*$/.test(form[1].slice(end))?attributes:null;
}
export function evaluate(files) {
  const findings = [];
  const add = (id,detail) => findings.push({id,detail});
  const result = (count) => ({ schema:'tabi-round21-c1-measure-v1', metric:'c1_lifecycle_observations', c1_lifecycle_observations:count, value:count, verdict:findings.length?'failed':count?'clean':'baseline', exit:findings.length?1:0, findings });
  const get = (p) => files[p] === undefined ? null : Buffer.isBuffer(files[p]) ? files[p] : Buffer.from(files[p]);
  const parse = (p) => { const b=get(p);if(!b)return null;try{return JSON.parse(b.toString());}catch{return null;} };
  const receipt = parse(PREFIX+'receipt.json');
  if (!get(PREFIX+'receipt.json') && !get(NOTE)) return result(0);
  if (!get(PREFIX+'receipt.json') || !get(NOTE)) { add('partial_state','receipt/note');return result(0); }
  if (!plain(receipt) || receipt.schema !== 'tabi-round21-runtime-v1' || !Array.isArray(receipt.cases)) {add('receipt_shape','schema/cases');return result(0);}
  const cases = receipt.cases;
  const caseIds=cases.map(c=>typeof c?.id==='string'?c.id:'');
  if (cases.length !== IDS.length || !equal(caseIds.sort(),[...IDS].sort())) add('case_set','expected exact fixed12');
  if (receipt.producer?.path !== PRODUCER || !get(PRODUCER) || receipt.producer.sha256 !== PRODUCER_SHA || sha(get(PRODUCER)) !== PRODUCER_SHA) add('producer_digest',PRODUCER);
  const execution=parse(EXECUTION);
  const runtimePaths=Object.keys(files).filter(path=>path.startsWith(PREFIX)).sort();
  if(!plain(execution)||execution.exit!==0||execution.producerPath!==PRODUCER||execution.producerSha256!==PRODUCER_SHA||!Array.isArray(execution.argv)||execution.argv.length!==4||execution.argv[1]!==PRODUCER||execution.argv[2]!=='--out'||!plain(execution.artifacts)||!equal(Object.keys(execution.artifacts).sort(),runtimePaths)||execution.receiptSha256!==sha(get(PREFIX+'receipt.json'))||runtimePaths.some(path=>execution.artifacts[path]!==sha(get(path))))add('execution_binding','acquisition/producer/retained artifacts');
  const environment=receipt.environment;
  if (environment?.node !== 'v24.21.0' || environment?.chromium !== '154.0.8037.97' || environment?.playwright !== '1.64.0' || !equal(environment.flags,FLAGS)) add('environment','pinned build/recorded flags');
  if (receipt.cleanup?.browserClosed !== true || receipt.cleanup?.serverClosed !== true || receipt.cleanup.contextError || receipt.cleanup.serverError || receipt.cleanup.tempError) add('cleanup','browser/server/error');
  const source = parse('.ufo/waves/round-21/source-opening.json');
  const sourceBody=get(SOURCE_BODY);
  let carrierValid=false;
  try {
    const compressed=get(SOURCE_CARRIER);
    const raw=compressed?gunzipSync(compressed,{maxOutputLength:128*1024}):null;
    const location=typeof source?.location==='string'?/^html_form_element\.cc:(\d+)(?:-(\d+))?$/.exec(source.location):null;
    const start=Number(location?.[1]), end=Number(location?.[2]||location?.[1]);
    const lines=sourceBody?.toString().split(/\r?\n/)||[];
    carrierValid=!!(compressed&&raw&&sourceBody&&source.storedPath===SOURCE_CARRIER&&source.storedSha256===sha(compressed)&&source.rawSha256===sha(raw)&&source.rawSha256==='ff55d51149ec4d3f320f43c2ea6a9a4d78798360f71e78d1f1df00c6ea6519ed'&&Buffer.from(raw.toString(),'base64').equals(sourceBody)&&Number.isFinite(Date.parse(source.accessedAt))&&source.comparisonToRetainedRound20===true&&start>=1&&end>=start&&end<=lines.length&&typeof source.quote==='string'&&source.quote.trim()&&source.quote.trim().split(/\s+/).length<=25&&lines.slice(start-1,end).join('\n').includes(source.quote));
  } catch { carrierValid=false; }
  const registry = get('corpus/SOURCES.md')?.toString() || '';
  const sourceRows=registry.split('\n').filter(line=>/^\|\s*S100\s*\|/.test(line));
  const ownRows=registry.split('\n').filter(line=>/^\|\s*S101\s*\|/.test(line));
  const cells=sourceRows[0]?.split('|').map(cell=>cell.trim())||[];
  const ownCells=ownRows[0]?.split('|').map(cell=>cell.trim())||[];
  const backlink=(row)=>row[11]?.split(',').map(path=>path.trim()).includes(NOTE);
  if(source?.sourceId !== 'S100' || source.url !== SOURCE_URL || source.decodedSha256 !== SOURCE_SHA || !sourceBody || sha(sourceBody) !== SOURCE_SHA || !carrierValid || sourceRows.length!==1 || cells.length!==13 || cells[3]!=='code' || cells[4]!=='A' || !cells[2].split(/\s+/).includes(SOURCE_URL) || !cells[6].includes('decoded sha256 '+SOURCE_SHA) || cells[8]!=='mined' || !backlink(cells) || ownRows.length!==1 || ownCells.length!==13 || ownCells[3]!=='own-work' || ownCells[4]!=='A' || ownCells[8]!=='mined' || !ownCells[2].split(/\s+/).includes(PREFIX+'receipt.json') || !backlink(ownCells)) add('source_binding','opened S100/carrier/body/row and S101 own-work/backlinks');
  const note=get(NOTE).toString();
  const skill=get('SKILL.md')?.toString() || '';
  const header=note.split(/\r?\n/,1)[0];
  const sourceIds=[...header.matchAll(/\bS[0-9]{3,}\b/g)].map(match=>match[0]);
  const associations=header.slice('source:'.length).split(/;\s*(?=S[0-9]{3,}\b)/);
  const source100=associations.find(part=>/^S100\b/.test(part.trim()))||'';
  const source101=associations.find(part=>/^S101\b/.test(part.trim()))||'';
  if(!header.startsWith('source:') || !skill.includes(NOTE)) add('note_missing','provenance/skill');
  if(!equal([...sourceIds].sort(),['S100','S101'])||!source100.split(/\s+/).includes(SOURCE_URL)||!source101.split(/\s+/).includes(PREFIX+'receipt.json'))add('source_binding','note source-header associations');
  const nonces=new Set();
  for(const c of cases){
    const id=typeof c?.id==='string'?c.id:null;
    if(!plain(c) || !IDS.includes(id) || typeof c.nonce!=='string' || c.nonce.length<16 || typeof c.autosubmit!=='boolean' || typeof c.action!=='string' || !plain(c.preAction) || !plain(c.after) || !plain(c.after.pageState) || !Array.isArray(c.after.responses) || !Array.isArray(c.after.navigations) || !note.includes('`'+id+'`')) {add('case_shape',String(id));continue;}
    if(nonces.has(c.nonce))add('nonce_reused',id);nonces.add(c.nonce);
    const path=PREFIX+id+'.json';
    if(c.evidence?.path!==path || !get(path)){add('evidence_missing',id);continue;}
    if(!hex(c.evidence.sha256) || c.evidence.sha256!==sha(get(path)))add('evidence_digest',id);
    const e=parse(path);
    if(!plain(e) || !Array.isArray(e.frames) || !Array.isArray(e.pageObservations) || !e.frames.every(plain) || !e.pageObservations.every(p=>plain(p)&&plain(p.value)&&(!Object.hasOwn(p.value,'submits')||Array.isArray(p.value.submits)))){add('case_shape',id+':evidence');continue;}
    const config = CONFIG[IDS.indexOf(id)];
    if(e.id!==id || e.nonce!==c.nonce || e.autosubmit!==c.autosubmit || e.action!==c.action || c.autosubmit!==config[0] || c.action!==config[1] || e.mode!==config[2])add('case_identity',id);
    const fixturePath=PREFIX+id+'.html';
    if(e.fixture?.path!==fixturePath || !get(fixturePath) || e.fixture.sha256!==sha(get(fixturePath)) || !get(fixturePath).toString().includes(c.nonce))add('fixture_digest',id);
    const attributes=formAttributes(get(fixturePath)?.toString()||'');
    if (!attributes || attributes.has('toolautosubmit') !== c.autosubmit) add('fixture_digest',id+':autosubmit');
    const frames=e.frames;
    if(!frames.length || frames.some((f,i)=>f.seq!==i+1 || !Number.isFinite(f.at) || i>0&&f.at<frames[i-1].at))add('order_mismatch',id);
    const sent=frames.filter(f=>f.dir==='sent'&&f.method==='WebMCP.invokeTool');
    if(sent.length!==1 || !Number.isSafeInteger(sent[0].command) || sent[0].command<1 || sent[0].params?.toolName!=='lifecycle' || typeof sent[0].params?.frameId!=='string' || !plain(sent[0].params?.input) || sent[0].params.input.q!==(e.mode==='invalid'?'not-an-email':c.nonce))add('raw_invoke',id);
    const command=sent[0]?.command;
    const answered=frames.filter(f=>(f.dir==='result'||f.dir==='error')&&f.command===command);
    if(answered.length!==1 || answered[0].seq<=sent[0]?.seq || c.invocationId!== (answered[0]?.result?.invocationId??null) || c.invokeError!==(answered[0]?.message??null))add('invoke_identity',id);
    const events=frames.filter(f=>f.dir==='event'&&f.method==='WebMCP.toolResponded'&&f.params?.invocationId===c.invocationId);
    const invoked=frames.filter(f=>f.dir==='event'&&f.method==='WebMCP.toolInvoked'&&f.params?.invocationId===c.invocationId);
    if(typeof c.invocationId!=='string'||!c.invocationId||invoked.length!==1||events.some(f=>f.seq<=invoked[0].seq))add('event_identity',id);
    let invokedInput=null;
    try { invokedInput=JSON.parse(invoked[0]?.params?.input); } catch { /* evaluated mismatch below */ }
    if(invoked[0]?.params?.toolName!==sent[0]?.params?.toolName||invoked[0]?.params?.frameId!==sent[0]?.params?.frameId||!equal(invokedInput,sent[0]?.params?.input))add('event_identity',id+':payload');
    const pre=e.pageObservations.find(p=>p.label==='pre-action');
    const post=e.pageObservations.find(p=>p.label==='after-action');
    const action=frames.filter(f=>f.dir==='action');
    const preMarkers=frames.filter(f=>f.dir==='observation'&&f.label==='pre-action');
    const postMarkers=frames.filter(f=>f.dir==='observation'&&f.label==='after-action');
    const completed=frames.filter(f=>f.dir==='action-complete');
    if(!pre||!post||action.length!==1||completed.length!==1||preMarkers.length!==1||postMarkers.length!==1||action[0].action!==c.action||completed[0].action!==c.action||action[0].phase!==(c.action==='none'?'no-action':'dispatch-started')||pre.seq!==preMarkers[0].seq||post.seq!==postMarkers[0].seq||pre.at!==preMarkers[0].at||post.at!==postMarkers[0].at||!equal(pre.value,preMarkers[0].value)||!equal(post.value,postMarkers[0].value)||!(answered[0]?.seq<pre.seq&&pre.seq<action[0].seq&&action[0].seq<completed[0].seq&&completed[0].seq<post.seq)||pre.at>action[0].at||post.at<action[0].at||sent[0]?.at>c.preAction?.start)add('order_mismatch',id+':action');
    if(pre?.value?.nonce!==c.nonce||pre?.value?.value!==sent[0]?.params?.input?.q||(c.action!=='submit'&&post?.value?.nonce!==c.nonce))add('case_identity',id+':page echo');
    if(!Number.isFinite(c.preAction?.windowMs)||c.preAction.windowMs<250||c.preAction.end!==pre?.at||c.preAction.windowMs!==c.preAction.end-c.preAction.start||!Number.isFinite(c.after?.windowMs)||c.after.windowMs<500||c.after.end!==post?.at||c.after.windowMs!==c.after.end-c.after.start||c.after.start>action[0]?.at)add('window_mismatch',id);
    if(c.preAction?.responseCount!==events.filter(f=>f.seq<pre?.seq).length || c.preAction?.formActive!==pre?.value?.formActive || !equal(c.after?.responses,events.filter(f=>f.seq<post?.seq).map(f=>f.params)) || !equal(c.after?.pageState,post?.value) || !equal(c.after?.submits,Array.isArray(post?.value?.submits)?post.value.submits:null) || !equal(c.after?.navigations,frames.filter(f=>f.method==='Page.frameNavigated'&&f.at>=c.after.start&&f.seq<post?.seq).map(f=>f.params)))add('summary_mismatch',id);
    if(!Array.isArray(e.browserPidsBefore)||!e.browserPidsBefore.length||e.browserPidsBefore.some(p=>!Number.isInteger(p)||p<=0)||!equal(e.browserPidsAfter,[])||e.contextClosed!==true||e.closeError)add('context_cleanup',id);
    if(!equal(e.blocked,[])||!equal(e.downloads,[]))add('boundary_violation',id);
  }
  return result(findings.length?0:cases.length);
}
const ROOT=resolve(dirname(SELF),'../../..');
function git(args){const r=spawnSync('git',['-c','core.fsmonitor=false','-c','core.quotepath=false',...args],{cwd:ROOT,env:{PATH:process.env.PATH,HOME:process.env.HOME,LANG:'C',GIT_NO_REPLACE_OBJECTS:'1',GIT_CONFIG_NOSYSTEM:'1',GIT_CONFIG_GLOBAL:'/dev/null'},encoding:null,maxBuffer:64*1024*1024});if(r.status!==0)throw Error('git_failed:'+args[0]);return r.stdout;}
export function filesAt(rev){
  if(!/^[a-f0-9]{40}$/.test(rev))throw Error('revision_requires_full_hash');
  const resolved=git(['rev-parse','--verify','--end-of-options',rev+'^{commit}']).toString().trim();
  if(resolved!==rev)throw Error('revision_mismatch');
  const files={};
  const paths=git(['ls-tree','-r','-z',rev,'--',...INPUT_PATHS]).toString().split('\0').filter(Boolean);
  for(const entry of paths){const match=/^(100644|100755) blob ([a-f0-9]{40})\t(.+)$/.exec(entry);if(!match)throw Error('entry_not_regular');files[match[3]]=git(['cat-file','blob',match[2]]);}
  return files;
}
if(process.argv[1]&&resolve(process.argv[1])===SELF){
  try{
    if(process.argv.length===3&&process.argv[2]==='--selftest'){
      const r=spawnSync(process.execPath,[resolve(dirname(SELF),'selftest-c1.mjs')],{stdio:'inherit'});process.exitCode=r.status??2;
    }else if(process.argv.length===3){const r=evaluate(filesAt(process.argv[2]));r.revision=process.argv[2];console.log(JSON.stringify(r));process.exitCode=r.exit;}
    else throw Error('usage');
  }catch(error){console.log(JSON.stringify({verdict:'could-not-evaluate',exit:2,findings:[{id:error.message}]}));process.exitCode=2;}
}
