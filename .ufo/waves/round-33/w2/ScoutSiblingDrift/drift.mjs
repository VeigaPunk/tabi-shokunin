import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
const FLEET='/home/vgpnk/Projects/shokunin';
const src=readFileSync(FLEET+'/tabi-shokunin/.ufo/waves/round-33/counters/c1-adjacency-sweep.mjs','utf8');
const PINS=Object.fromEntries([...src.matchAll(/^\s+'?([a-z0-9-]+)'?: '([0-9a-f]{40})',$/gm)].map(m=>[m[1],m[2]]));
const REGEX=/\b(browsers?|chromium|chrome|cdp|devtools|playwright|puppeteer|webdriver|bidi|selenium|webbridge|tabi|crawl(er|ers|ing)?|scrap(e|er|ers|ing))\b/i;
const g=(d,a)=>spawnSync('git',['-C',d,...a],{encoding:'utf8',maxBuffer:1<<28});
const out=[];
for(const [l,pin] of Object.entries(PINS)){
  const d=`${FLEET}/${l}-shokunin`;
  const heads=g(d,['for-each-ref','--format=%(refname:short)','refs/heads/master','refs/heads/main']).stdout.trim().split('\n').filter(Boolean);
  const tip=g(d,['rev-parse',heads[0]||'HEAD']).stdout.trim();
  const atPin=g(d,['show',`${pin}:PROVINCE.md`]).stdout.split('\n');
  const atTip=g(d,['show',`${tip}:PROVINCE.md`]);
  if(atTip.status!==0){out.push({l,tip,err:'PROVINCE.md absent at tip'});continue;}
  const tl=atTip.stdout.split('\n');
  const cp=atPin.map((t,i)=>[i+1,t]).filter(([,t])=>REGEX.test(t));
  const ct=tl.map((t,i)=>[i+1,t]).filter(([,t])=>REGEX.test(t));
  const setT=new Set(tl.map(s=>s.trim()));const setP=new Set(atPin.map(s=>s.trim()));
  const moved=cp.filter(([n,t])=>tl[n-1]!==t);
  const gone=cp.filter(([n,t])=>!setT.has(t.trim()));
  const added=ct.filter(([n,t])=>!setP.has(t.trim()));
  out.push({l,pin:pin.slice(0,8),tip:tip.slice(0,8),tipBranch:heads[0],aheadCommits:g(d,['rev-list','--count',`${pin}..${tip}`]).stdout.trim(),pinCands:cp.length,tipCands:ct.length,movedOrChangedAtSameLine:moved.length,textGone:gone.length,added:added.map(([n,t])=>`${n}: ${t.slice(0,200)}`),pinBlob:g(d,['rev-parse',`${pin}:PROVINCE.md`]).stdout.trim().slice(0,8),tipBlob:g(d,['rev-parse',`${tip}:PROVINCE.md`]).stdout.trim().slice(0,8),goneList:gone.map(([n,t])=>`${n}: ${t.slice(0,160)}`),movedList:moved.map(([n,t])=>{const nn=tl.findIndex(x=>x===t);return `${n}->${nn+1}`})});
}
console.log(JSON.stringify(out,null,1));
