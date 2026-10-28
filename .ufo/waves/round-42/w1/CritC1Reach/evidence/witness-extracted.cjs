
const fs=require('fs');
const out=process.env.TABI_WITNESS_OUT;
const root=Number(process.env.TABI_WITNESS_ROOT);
const hz=Number(require('child_process').execFileSync('getconf',['CLK_TCK'],{encoding:'utf8'}).trim())||100;
const uptime=()=>Math.round(parseFloat(fs.readFileSync('/proc/uptime','utf8').split(' ')[0])*hz);
const envNames=p=>{try{return fs.readFileSync('/proc/'+p+'/environ','latin1').split('\0').filter(Boolean).map(e=>e.split('=')[0])}catch{return null}};
const samples=[];
function table(){
  let rows=null;
  try{const r=require('child_process').spawnSync('ps',['-eo','pid=,ppid='],{encoding:'utf8',maxBuffer:8<<20});if(r.error||r.status!==0)return null;rows=r.stdout.split('\n').map(l=>l.trim().split(/\s+/)).filter(m=>m.length>=2&&/^\d+$/.test(m[0])&&/^\d+$/.test(m[1])).map(m=>[Number(m[0]),Number(m[1])]);}catch{return null}
  return rows;
}
function ident(pid){
  try{const s=fs.readFileSync('/proc/'+pid+'/stat','utf8');const e=s.lastIndexOf(')');if(e<0)return null;const f=s.slice(e+2).split(' ');let exe=null;try{exe=fs.readlinkSync('/proc/'+pid+'/exe')}catch{};let comm=s.slice(s.indexOf('(')+1,e);return {pid,ppid:Number(f[1]),startTicks:Number(f[19]),exe,comm};}catch{return null}
}
function descendants(){
  const rows=table();if(rows===null)return null;
  const ch=new Map();for(const [pid,ppid] of rows){if(!ch.has(ppid))ch.set(ppid,[]);ch.get(ppid).push(pid)}
  const seen=new Set(),q=[root],out=[];
  while(q.length){const p=q.shift();if(seen.has(p))continue;seen.add(p);const id=ident(p);if(id)out.push(id);for(const c of ch.get(p)||[])q.push(c)}
  return out;
}
const t0=uptime();
const iv=setInterval(()=>{const d=descendants();if(d)samples.push({t:Date.now(),tTicks:uptime(),tree:d});},50);
process.on('SIGTERM',()=>{clearInterval(iv);const env=envNames('self');
  fs.writeFileSync(out,JSON.stringify({schema:'tabi-r41-witness',rootPid:root,nonce:process.env.TABI_RUN_NONCE||null,startedTicks:t0,endedTicks:uptime(),samples,environ:env},null,0)+'\n');
  process.exit(0);});
