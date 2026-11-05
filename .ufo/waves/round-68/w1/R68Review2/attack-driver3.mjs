import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
const GATE = '/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-instrument-registry-r68.mjs';
const SCRATCH = '/fast/scratch/hyaku/tabi-r68/R68Review2/wk/scratch3';
fs.rmSync(SCRATCH, { recursive: true, force: true });
fs.mkdirSync(SCRATCH, { recursive: true });
const EXPECTED = ['scripts/chrome-cdp-loopback-round67.mjs','scripts/verify-live-r67.mjs','.ufo/waves/round-67/counters/chromium-hscroll-r67.mjs','.ufo/waves/round-67/counters/check-receipt-provenance-v4.mjs','.ufo/waves/round-67/counters/make-negatives-r67.mjs','.ufo/waves/round-67/counters/mutate-r67.mjs','.ufo/waves/round-67/counters/png-r67.mjs'];
const RC='## Instrument registry — round 68';
for (const rel of EXPECTED) { fs.mkdirSync(path.dirname(path.join(SCRATCH,'base',rel)),{recursive:true}); fs.copyFileSync(path.join('/home/vgpnk/Projects/shokunin/tabi-shokunin',rel),path.join(SCRATCH,'base',rel)); }
const SHAS={}; for (const rel of EXPECTED) SHAS[rel]=createHash('sha256').update(fs.readFileSync(path.join(SCRATCH,'base',rel))).digest('hex');
const C=['instrument','entry','verdicts','selftest','pinned','scope','owner'];
const row=(c)=>'| '+c.join(' | ')+' |';
const table=(rows)=>RC+'\n\n| '+C.join(' | ')+' |\n|---|---|---|---|---|---|---|\n'+rows.join('\n')+'\n';
const gr=(r)=>row(['`'+r+'`','node '+r,'0 ok; 1 findings','node '+r+' --selftest','sha256 '+SHAS[r],'scratch','tabi']);
const suite=()=>table(EXPECTED.map(gr));
// code-fence copy of exact green suite: does a FENCED table count? (fenced header case K18 already green)
function tree(name,text){const d=path.join(SCRATCH,name); fs.rmSync(d,{recursive:true,force:true}); fs.mkdirSync(d,{recursive:true}); for(const rel of EXPECTED){fs.mkdirSync(path.dirname(path.join(d,rel)),{recursive:true}); fs.copyFileSync(path.join(SCRATCH,'base',rel),path.join(d,rel));} fs.writeFileSync(path.join(d,'SKILL.md'),text);}
const PNG='.ufo/waves/round-67/counters/png-r67.mjs'; const SP=SHAS[PNG];
const cases=[];
// V-suffixing: instrument cell 'node png-r67.mjs checks' with WRONG path order — path appears as substring but from different position
cases.push(['L01-instrument-cell-is-command', table(EXPECTED.map(r=> r===PNG ? ['| node '+r+' | '+'`'+r+'`','0 ok; 1 findings','node '+r+' --selftest','sha256 '+SHAS[r],'scratch','tabi'].join(' | ') : gr(r)))+'', false, 'instrument cell holds a command → inst = that string; byPath key is wrong; row-missing for real path fires. confirm gate treats inst strictly']);
// two key questions:
// M — does the gate rebuild byPath first and error out on duplicates from stale mutations? K04 covered.
// N — verify gate's exit code on SKILL file that doesn't exist (usage rc2)
cases.push(['N01-skill-absent', null, 2, 'rc=2 usage exit']);
const results=[];
for (const [name,text,exp,why] of cases) {
  if (text===null) { // special: rc on missing skill
    let out='',err='',rc=0;
    try { execFileSync('node',[GATE,'--skill',path.join(SCRATCH,'nonexistent','SKILL.md'),'--repo',SCRATCH],{encoding:'utf8'}); }
    catch(e){ rc=e.status; out=e.stdout||''; err=e.stderr||''; }
    results.push({name,exp,observed:rc,why,stdout:out,stderr:err.slice(0,200)});
    continue;
  }
  const d=tree(name+'-d',text);
  let rc,out='',err='';
  try{ out=execFileSync('node',[GATE,'--skill',path.join(d,'SKILL.md'),'--repo',d],{encoding:'utf8'}); rc=0; }
  catch(e){ rc=e.status; out=e.stdout||''; err=e.stderr||''; }
  let p=null; try{p=JSON.parse(out);}catch{}
  results.push({name,exp,observed:rc,why,findings:p?p.findings:[],raw:out.slice(0,200)});
}
console.log(JSON.stringify({battery:'v3',results},null,2));
