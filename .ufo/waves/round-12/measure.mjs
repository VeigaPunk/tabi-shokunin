import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const revision = process.argv[2];
if (!revision) throw new Error('Usage: node .ufo/waves/round-12/measure.mjs REV');
const files = execFileSync('git',['ls-tree','-r','--name-only',revision],{encoding:'utf8'}).trim().split('\n');
const text=path=>execFileSync('git',['show',`${revision}:${path}`],{encoding:'utf8'});
const sha=path=>createHash('sha256').update(execFileSync('git',['show',`${revision}:${path}`])).digest('hex');
const targets=['chrome-remote-debugging-profile-boundary.md','webdriver-bidi-capability-matrix.md','web-flake-retry-evidence.md'].map(n=>'corpus/knowledge/'+n);
const receipt='corpus/evidence/round-12/source-recheck.json';
let reviews=0;
if(files.includes(receipt)) {
  const data=JSON.parse(text(receipt));
  reviews=targets.filter(path=>data.reviews.filter(r=>r.path===path).length===1 && data.reviews.some(r=>r.path===path && r.date==='2026-10-20' && ['confirmed','drift','unknown'].includes(r.result) && r.disposition && r.claims.length>0 && files.includes(r.evidence) && r.sha256===sha(path))).length;
}
const note='corpus/knowledge/playwright-accessible-locators-and-snapshots.md';
let admitted=0;
if(files.includes(note) && files.includes('corpus/lessons/round-12.md')) {
  const entry=text(note), registry=text('corpus/SOURCES.md');
  admitted=Number(['source:','verified-at:','recheck:'].every(key=>entry.includes(key))
    && ['S023','S024','S025'].every(id=>entry.includes(id) && registry.split('\n').some(line=>line.startsWith('| '+id+' |') && line.includes('| mined |') && line.includes(note)))
    && text('corpus/README.md').includes('knowledge/playwright-accessible-locators-and-snapshots.md')
    && text('corpus/lessons/round-12.md').includes('admitted: `'+note+'`'));
}
console.log(JSON.stringify({revision,source_rechecks:reviews,accessible_locator_entry:admitted}));
