#!/usr/bin/env node
// Enumerate only the frozen USER lessonDrift predicate; never execute the inherited red gate.
import {spawnSync} from 'node:child_process';
const revision=process.argv[2];
if(!/^[a-f0-9]{40}$/.test(revision??'')) { console.error('full revision required'); process.exit(2); }
const env={PATH:process.env.PATH,GIT_NO_REPLACE_OBJECTS:'1',GIT_CONFIG_NOSYSTEM:'1',GIT_CONFIG_GLOBAL:'/dev/null',GIT_OPTIONAL_LOCKS:'0',GIT_PAGER:'cat'};
const run=(args)=>spawnSync('git',args,{encoding:'utf8',env});
const git=(args)=>{const r=run(args);if(r.status!==0)throw new Error(r.stderr);return r.stdout.trim();};
const blob=(rev,path)=>{const r=run(['rev-parse','--verify',`${rev}:${path}`]);return r.status===0?r.stdout.trim():null;};
try {
  const baseline=git(['rev-parse','--verify','7f506af^{commit}']), pin=git(['rev-parse','--verify','92d700d^{commit}']);
  const changed=git(['diff','--name-status','--no-renames',pin,revision,'--','corpus/lessons/']).split('\n').filter(Boolean);
  const lessons=changed.map(line=>line.split('\t')).filter(([,path])=>/^corpus\/lessons\/round-\d+\.md$/.test(path));
  const records=lessons.map(([status,path])=>{
    const historical=blob(baseline,path), current=blob(revision,path);
    const later=git(['log','--no-show-signature','-m','--no-renames','--diff-filter=MDRT','--format=%H',`${pin}..${revision}`,'--',path]);
    return {path,status,historical,current,laterMDRTCommits:later?later.split('\n'):[],refused:historical?current!==historical:status!=='A'||!current||later.length>0};
  });
  console.log(JSON.stringify({schema:'tabi-round20-lesson-history-v1',revision,baseline,pin,scope:'lessonDrift only, not complete USER gate',refused:records.filter(row=>row.refused).map(row=>row.path).sort(),records}));
} catch(error) {console.error(error.message);process.exit(2);}
