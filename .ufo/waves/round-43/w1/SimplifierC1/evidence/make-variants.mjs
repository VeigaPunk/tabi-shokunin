#!/usr/bin/env node
// Scratch-only helper: derives mutated COPIES of the round-43 C1 wrapper for
// hypothesis testing. Writes nothing outside the scratch root.
import fs from 'node:fs';
import path from 'node:path';

const SRC = '/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/measure-c1-round43.mjs';
const OUT = process.argv[2];
const mode = process.argv[3]; // v1-deadcode | v2-minenv | v3-gateargv
let s = fs.readFileSync(SRC, 'utf8');
const before = s;

function must(cond, msg) { if (!cond) { console.error('ANCHOR MISS: ' + msg); process.exit(3); } }

if (mode === 'v1-deadcode') {
  const lines = s.split('\n');
  const out = lines.filter((l) => !l.startsWith('const FIREFOX_BIN =') && !l.startsWith('const uptimeTicks ='));
  s = out.join('\n');
  must(s.includes('process.exit(finding === \'environment-loader-contamination\' ? 2 : 2);'), 'refuse ternary');
  s = s.replace("process.exit(finding === 'environment-loader-contamination' ? 2 : 2);", 'process.exit(2);');
  must(s.includes('const GATE_ARGV_OK ='), 'GATE_ARGV_OK decl');
  s = s.replace(/const GATE_ARGV_OK = .*\n/, '');
  must(s.includes('parsed.execArgvClean = parsed.execArgvClean === true && GATE_ARGV_OK(parsed.execArgvFlag && parsed.execArgvFlag[0], parsed.execArgvLen);'), 'gate argv line');
  s = s.replace('  parsed.execArgvClean = parsed.execArgvClean === true && GATE_ARGV_OK(parsed.execArgvFlag && parsed.execArgvFlag[0], parsed.execArgvLen);\n', '');
} else if (mode === 'v3-gateargv') {
  must(s.includes('parsed.execArgvClean = parsed.execArgvClean === true && GATE_ARGV_OK(parsed.execArgvFlag && parsed.execArgvFlag[0], parsed.execArgvLen);'), 'gate argv line');
  s = s.replace('  parsed.execArgvClean = parsed.execArgvClean === true && GATE_ARGV_OK(parsed.execArgvFlag && parsed.execArgvFlag[0], parsed.execArgvLen);\n', '');
} else if (mode === 'v2-minenv') {
  const m = s.match(/^const ENV_ALLOW = \[.*\];$/m);
  must(m, 'ENV_ALLOW line');
  s = s.replace(m[0], "const ENV_ALLOW = ['PATH', 'HOME', 'LANG', 'TMPDIR', 'HYAKU_SCRATCH', 'TABI_RUN_NONCE'];");
} else {
  console.error('unknown mode'); process.exit(2);
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, s);
console.log(JSON.stringify({ mode, out: OUT, bytes: Buffer.byteLength(s), srcBytes: Buffer.byteLength(before) }));
