import fs from 'node:fs';
const src=fs.readFileSync('/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/playwright-firefox-egress-round39.mjs','utf8');
const a=src.indexOf('// --- owned process tree'), b=src.indexOf('async function runOnce');
const body=src.slice(a,b);
fs.writeFileSync('obs.mjs',`import { spawnSync } from 'node:child_process';
import { readdirSync, readlinkSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
const ROUND40=true;
const sh=(c)=>{try{return spawnSync('/bin/bash',['-c',c],{encoding:'utf8'}).stdout.trim();}catch{return '';}};
${body}
export { sampleSockets, ownedTree, observeSs, observeProc };
`);
