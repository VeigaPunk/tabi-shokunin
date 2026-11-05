import fs from 'node:fs'; import { spawnSync } from 'node:child_process';
const [delta, audit, out] = process.argv.slice(2);
const METER='/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-65/counters/c1-adjacency-host-v22.mjs';
const SNAP='/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-66/measure/snapshot-live-r66.tsv';
const DISP=['no-tabi-ground','overlap-declared','contested-open'];
const L=fs.readFileSync(delta,'utf8').split('\n');
let total=0, survivors=[], killed=0, errs=0;
L.forEach((l,i)=>{ if(i===0) return; const c=l.split('\t'); if(c[0]!=='line') return; total++;
  const alt=DISP.filter(d=>d!==c[7]); let surv=true;
  for(const nd of alt){ c[7]=nd; const m=L.slice(); m[i]=c.join('\t'); const p=out+'/s.tsv'; fs.writeFileSync(p,m.join('\n'));
    const r=spawnSync(process.execPath,[METER,'--rev','2816adb359a50c2fd83fa975e39f0650aa189984','--repo','/home/vgpnk/Projects/shokunin/tabi-shokunin','--fleet','/home/vgpnk/Projects/shokunin','--snapshot',SNAP,'--delta',p,'--audit',audit,'--json'],{encoding:'utf8'});
    if(r.status===2) errs++;
    if(r.status!==0){ surv=false; killed++; break; } }
  if(surv) survivors.push(`${i+1}\t${c[1]}\t${c[2]}\t${l.split('\t')[7]}`);
});
console.log(JSON.stringify({lineRows:total, rowsWithSurvivingFlip:survivors.length, rowsKilledByAnyFlip:killed, meterExit2:errs}));
fs.writeFileSync(out+'/survivors.tsv', survivors.join('\n')+'\n');
