const fs = require('fs');
const src = fs.readFileSync('/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-34/counters/c2-gate-mutants.mjs', 'utf8');
const s = src.indexOf('const MUTANTS = Object.freeze([');
const e = src.indexOf('\n]);', s);
const arr = eval(src.slice(s + 'const MUTANTS = Object.freeze('.length, e + 2));
const counter = Object.fromEntries(arr.map((o) => [o.id, o]));
const jl = {};
for (const line of fs.readFileSync('/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-33/w2/MutGateV2/mutants.jsonl', 'utf8').split('\n')) {
  if (!line.trim()) continue;
  const d = JSON.parse(line);
  if (d.id === 'M09' || d.id === 'M10') jl[d.id] = d;
}
for (const k of ['M09', 'M10']) {
  console.log(k, 'find match:', counter[k].find === jl[k].find, '| replace match:', counter[k].replace === jl[k].replace, '| area:', JSON.stringify(counter[k].area));
}
console.log('counter mutant count:', arr.length);
console.log('counter ids:', arr.map((o) => o.id).join(' '));
