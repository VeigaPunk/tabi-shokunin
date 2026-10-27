import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
const FLEET = '/home/vgpnk/Projects/shokunin';
const ENV = { PATH: process.env.PATH, HOME: process.env.HOME, GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null', LC_ALL: 'C' };
function git(repo, args) {
  const r = spawnSync('git', ['-C', repo, ...args], { encoding: 'utf8', env: ENV });
  return { status: r.status, out: r.stdout, err: r.stderr };
}
const bSrc = readFileSync('./build.mjs', 'utf8');
const cSrc = readFileSync('./c1-counter.mjs', 'utf8');
function grab(src) {
  const m = src.match(/const PINS = Object\.freeze\(\{([\s\S]*?)\}\);/);
  const o = {};
  for (const line of m[1].split('\n')) {
    const mm = line.match(/^\s*'?([a-z0-9-]+)'?:\s*'([^']*)'/);
    if (mm) o[mm[1]] = mm[2];
  }
  return o;
}
const B = grab(bSrc), C = grab(cSrc);
console.log('=== byte-level PINS literal comparison (build tool vs frozen counter) ===');
let diffs = 0;
for (const k of Object.keys(C)) {
  const b = B[k], c = C[k];
  const same = b === c;
  if (!same) diffs++;
  console.log(`  ${k.padEnd(12)} build=${b} (len ${b.length})  counter=${c} (len ${c.length})  ${same ? 'same' : '*** DIFFER ***'}`);
}
console.log(`  lanes differing between the two frozen literals: ${diffs}`);

console.log('\n=== do the two kama literals resolve as git objects in kama-shokunin? ===');
for (const [name, h] of [['build', B.kama], ['counter', C.kama]]) {
  const r = git(`${FLEET}/kama-shokunin`, ['cat-file', '-t', h]);
  console.log(`  ${name.padEnd(8)} ${h} -> status=${r.status} ${(r.out || r.err).toString().trim()}`);
}
console.log(`  build literal length ${B.kama.length} (a git object name needs 40)`);

console.log('\n=== does the build tool ever RESOLVE its PINS (vs only compare)? ===');
const uses = bSrc.split('\n').map((l, i) => [i + 1, l]).filter(([, l]) => l.includes('PINS'));
for (const [n, l] of uses) console.log(`  L${n}: ${l.trim()}`);

console.log('\n=== drifted-set equality check: build PINS vs counter PINS ===');
const frozen = JSON.parse(readFileSync('./freeze-pins.json', 'utf8'));
const dB = new Set(Object.entries(frozen).filter(([s, h]) => h !== B[s]).map(([s]) => s));
const dC = new Set(Object.entries(frozen).filter(([s, h]) => h !== C[s]).map(([s]) => s));
console.log('  build-tool drifted set  :', [...dB].sort().join(' '), `(${dB.size})`);
console.log('  counter   drifted set  :', [...dC].sort().join(' '), `(${dC.size})`);
console.log('  identical?', dB.size === dC.size && [...dB].every((x) => dC.has(x)));
console.log('  -> kama drifted under build?', dB.has('kama'), ' under counter?', dC.has('kama'));

console.log('\n=== build.mjs lines 85-88 (the "agreeing line for line" cite in method entry §3) ===');
bSrc.split('\n').slice(84, 88).forEach((l, i) => console.log(`  ${85 + i}: ${l}`));
