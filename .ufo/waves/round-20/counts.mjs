#!/usr/bin/env node
import {spawnSync} from 'node:child_process';
const revision=process.argv[2];
if (!/^[a-f0-9]{40}$/.test(revision??'')) { console.error('full revision required'); process.exit(2); }
const git=(args)=>{
  const result=spawnSync('git',args,{encoding:'utf8',env:{PATH:process.env.PATH,GIT_NO_REPLACE_OBJECTS:'1',GIT_CONFIG_NOSYSTEM:'1',GIT_CONFIG_GLOBAL:'/dev/null',GIT_PAGER:'cat'}});
  if(result.status!==0) throw new Error(result.stderr);
  return result.stdout;
};
try {
  const rows=git(['show',`${revision}:corpus/SOURCES.md`]).split('\n').filter(line=>/^\|\s*S\d{3,}\s*\|/.test(line)).map(line=>line.split('|').map(cell=>cell.trim()));
  const histogram=(column)=>Object.fromEntries([...new Set(rows.map(row=>row[column]))].sort().map(key=>[key,rows.filter(row=>row[column]===key).length]));
  const knowledge=git(['ls-tree','-r','--name-only',revision,'--','corpus/knowledge/']).trim().split('\n').filter(path=>path.endsWith('.md')).length;
  console.log(JSON.stringify({revision,rows:rows.length,tiers:histogram(4),statuses:histogram(8),knowledge}));
} catch(error) {console.error(error.message);process.exit(2);}
