import { readFileSync } from 'node:fs';
const M = '/fast/scratch/hyaku/tabi-r35/RevControls/fleet/tabi-shokunin/.ufo/waves/round-35/baseline';
const F = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/baseline';
const names = ['c1-J1-do-nothing','c1-J2-screen-all','c1-J3-junk-noncandidate','c1-J4-existing-tabi-line','c1-J5-quote-no-browser-ground','c1-J6-quote-states-no-side','c1-J7-third-lane-record','c1-J8-residual-lexical-forgery','c2-J1-do-nothing','c2-J2-chromium-copy','c2-J3-relabelled-chromium','c2-J4-duplicate-run','c2-J5-driver-imports-counter'];
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
function diffPath(a, b, p, out) {
  if (a === b) return;
  if (isObj(a) && isObj(b)) {
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) diffPath(a[k], b[k], `${p}.${k}`, out);
    return;
  }
  if (Array.isArray(a) && Array.isArray(b) && a.length === b.length) {
    for (let i = 0; i < a.length; i++) diffPath(a[i], b[i], `${p}[${i}]`, out);
    return;
  }
  out.push(`${p}: mine=${JSON.stringify(a)?.slice(0, 90)} frozen=${JSON.stringify(b)?.slice(0, 90)}`);
}
for (const n of names) {
  const a = JSON.parse(readFileSync(`${M}/${n}.json`, 'utf8'));
  const b = JSON.parse(readFileSync(`${F}/${n}.json`, 'utf8'));
  const out = [];
  diffPath(a, b, n, out);
  const kept = out.filter((l) => !new RegExp(`^${n}\\.(rev|live)(\\.|:|$)`).test(l));
  console.log(`${n}: ${kept.length === 0 ? 'EQUIVALENT (only rev/live differ)' : `DIFFERS ${kept.length} field(s)`}`);
  for (const l of kept.slice(0, 8)) console.log('   ' + l);
  if (a.live && b.live && a.live.firstShotSha256 !== undefined && b.live.firstShotSha256 !== undefined) {
    console.log(`   live.firstShotSha256 mine=${String(a.live.firstShotSha256).slice(0, 16)}… frozen=${String(b.live.firstShotSha256).slice(0, 16)}… ${a.live.firstShotSha256 === b.live.firstShotSha256 ? 'MATCH' : 'MISMATCH'}`);
  }
}
