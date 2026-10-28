import fs from 'node:fs';
import crypto from 'node:crypto';
const SRC = '/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/playwright-firefox-egress-round41.mjs';
const raw = fs.readFileSync(SRC, 'utf8');
console.log('source_sha256', crypto.createHash('sha256').update(raw).digest('hex'));
function extract(name) {
  const i = raw.indexOf(`function ${name}(`);
  if (i < 0) throw new Error('missing ' + name);
  // brace matching from the first { after the signature
  let j = raw.indexOf('{', i), d = 0, k = j;
  for (; k < raw.length; k++) { if (raw[k] === '{') d++; else if (raw[k] === '}') { d--; if (d === 0) { k++; break; } } }
  return raw.slice(i, k);
}
const src = extract('decodeProcIp') + '\n' + extract('isLoopbackHexRem');
const f = new Function(src + '\nreturn {decodeProcIp, isLoopbackHexRem};')();
const fmt = (b) => b ? b.map((x) => x.toString(16).padStart(2, '0')).join('') : 'null';
const vectors = [
  ['127.0.0.1 (v4 LE word)', '0100007F'],
  ['192.168.1.1 (v4 LE word)', '0101A8C0'],
  ['::1', '00000000000000000000000001000000'],
  ['::ffff:127.0.0.1', '0000000000000000FFFF00000100007F'],
  [':: (wildcard)', '00000000000000000000000000000000'],
  ['2001:db8::1', 'B80D0120000000000000000001000000'],
  ['fe80::1', '000080FE000000000000000001000000'],
];
for (const [label, hex] of vectors) {
  console.log(`${label.padEnd(24)} hex=${hex.padEnd(32)} bytes=${fmt(f.decodeProcIp(hex))} loopback=${f.isLoopbackHexRem(hex + ':1F90')}`);
}
// host table structural check (read-only, no claim)
for (const p of ['/proc/net/tcp', '/proc/net/tcp6']) {
  const lines = fs.readFileSync(p, 'utf8').split('\n').slice(1).filter((l) => l.trim());
  const lens = {};
  const states = {};
  let inodeIdxOk = 0;
  for (const line of lines) {
    const fl = line.trim().split(/\s+/);
    if (fl.length < 10) continue;
    const L = fl[1].split(':')[0].length; lens[L] = (lens[L] || 0) + 1;
    states[fl[3]] = (states[fl[3]] || 0) + 1;
    if (/^\d+$/.test(fl[9])) inodeIdxOk++;
  }
  console.log(`${p} rows=${lines.length} localHexLen=${JSON.stringify(lens)} states=${JSON.stringify(states)} numericField9=${inodeIdxOk}`);
}
