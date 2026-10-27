import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
const FLEET = '/home/vgpnk/Projects/shokunin';
const ENV = { PATH: process.env.PATH, HOME: process.env.HOME, GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null', LC_ALL: 'C' };
function git(repo, args) {
  const r = spawnSync('git', ['-C', repo, ...args], { encoding: 'utf8', env: ENV });
  if (r.status !== 0) throw new Error(r.stderr);
  return r.stdout;
}
function grab(file) {
  const src = readFileSync(file, 'utf8');
  const m = src.match(/const PINS = Object\.freeze\(\{([\s\S]*?)\}\);/);
  const o = {};
  for (const line of m[1].split('\n')) { const mm = line.match(/^\s*'?([a-z0-9-]+)'?:\s*'([^']*)'/); if (mm) o[mm[1]] = mm[2]; }
  return o;
}
const B = grab('./build.mjs'), C = grab('./c1-counter.mjs');

console.log('=== DECISIVE TEST: hypothetical future pins file where kama is re-pinned at its round-35 head ===');
console.log('  (i.e. kama stops drifting; a legitimate round-37 re-pin)');
const hyp = { ...JSON.parse(readFileSync('./freeze-pins.json', 'utf8')) };
hyp.kama = C.kama;  // kama's round-35 pin, 40-hex, resolvable
const dB = new Set(Object.entries(hyp).filter(([s, h]) => h !== B[s]).map(([s]) => s));
const dC = new Set(Object.entries(hyp).filter(([s, h]) => h !== C[s]).map(([s]) => s));
console.log('  build-tool drifted set (' + dB.size + '):', [...dB].sort().join(' '));
console.log('  counter     drifted set (' + dC.size + '):', [...dC].sort().join(' '));
console.log('  kama drifted under BUILD tool?', dB.has('kama'), '  under COUNTER?', dC.has('kama'));
const onlyB = [...dB].filter((x) => !dC.has(x));
const onlyC = [...dC].filter((x) => !dB.has(x));
console.log('  only in build-tool set:', onlyB.join(' ') || '(none)');
console.log('  only in counter set    :', onlyC.join(' ') || '(none)');
console.log('  SETS IDENTICAL?', dB.size === dC.size && onlyB.length === 0);

console.log('\n  how many screen rows cite kama (rows the build tool would wrongly emit)?');
const screen = git(`${FLEET}/tabi-shokunin`, ['show', '2e7b7a8920bff47fae6f75c3d06e48e37767099e:corpus/adjacency-screen-browser.tsv']);
const kamaRows = screen.split('\n').filter((l) => l.startsWith('kaidoku-shokunin@') === false && l.includes('kama-shokunin@'));
console.log('  kama-citing screen rows:', kamaRows.length);

console.log('\n=== counter PINS validation: is the counter’s kama pin resolvable? ===');
console.log('  counter kama:', C.kama, '->', git(`${FLEET}/kama-shokunin`, ['cat-file', '-t', C.kama]).trim());
console.log('  build   kama:', B.kama, '(len ' + B.kama.length + ')');
try { git(`${FLEET}/kama-shokunin`, ['cat-file', '-t', B.kama]); console.log('  build kama resolves'); }
catch (e) { console.log('  build kama does NOT resolve: ' + e.message.trim().split('\n')[0]); }
