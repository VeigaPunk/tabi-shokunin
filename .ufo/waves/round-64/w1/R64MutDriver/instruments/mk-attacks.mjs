// Generate the verifier attack instruments. Each embeds the frozen driver's
// fixture block verbatim so the counter's fixture-binding recomputes to the
// same sha as the receipt it reuses.
import fs from 'node:fs';
import path from 'node:path';

const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const S = '/fast/scratch/hyaku/tabi-r64/R64MutDriver';
const frozen = fs.readFileSync(path.join(LANE, 'scripts/chrome-cdp-loopback-round64.mjs'), 'utf8');
const m = /\/\*WHEEL-FIXTURE-BEGIN\*\/[\s\S]*?\/\*WHEEL-FIXTURE-END\*\//.exec(frozen);
if (!m) throw new Error('fixture block not found');
const BLOCK = m[0];
const A = path.join(S, 'attacks');
fs.mkdirSync(A, { recursive: true });

const PRELUDE = `import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const SELF = fileURLToPath(import.meta.url);
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const out = path.resolve(opt('out'));
fs.mkdirSync(path.dirname(out), { recursive: true });
${BLOCK}
`;

// A: run the frozen driver ONCE, then hand both "cold runs" the same receipt.
const once = PRELUDE + `
const REAL = '${path.join(LANE, 'scripts/chrome-cdp-loopback-round64.mjs')}';
const cache = path.join(path.dirname(path.dirname(path.resolve(opt('scratch')))), 'cache-once');
const cached = path.join(cache, 'receipt.json');
if (!fs.existsSync(cached)) {
  fs.mkdirSync(cache, { recursive: true });
  const r = spawnSync('node', [REAL, '--scratch', path.join(cache, 'work'), '--out', cached,
    '--nonce', opt('nonce'), '--http-port', opt('http-port'), '--cdp-port', opt('cdp-port')], { encoding: 'utf8', timeout: 600000 });
  if (r.status !== 0) { console.error('inner driver failed', r.status, (r.stderr || '').slice(0, 500)); process.exit(1); }
}
const rec = JSON.parse(fs.readFileSync(cached, 'utf8'));
rec.driverSha256 = sha(fs.readFileSync(SELF));
for (const l of rec.legs) fs.copyFileSync(path.join(cache, l.shot), path.join(path.dirname(out), l.shot));
fs.writeFileSync(out, JSON.stringify(rec, null, 1));
console.log(JSON.stringify({ wrapper: 'once', nonce: rec.nonce, legs: rec.legs.length }));
`;
fs.writeFileSync(path.join(A, 'wrapper-once.mjs'), once);

// A2: no browser at all — copy a counter-clean receipt + its shots.
const copy = PRELUDE + `
const SRC = '${path.join(LANE, '.ufo/waves/round-64/controls/smoke')}';
const rec = JSON.parse(fs.readFileSync(path.join(SRC, 'receipt.json'), 'utf8'));
rec.driverSha256 = sha(fs.readFileSync(SELF));
for (const l of rec.legs) fs.copyFileSync(path.join(SRC, l.shot), path.join(path.dirname(out), l.shot));
fs.writeFileSync(out, JSON.stringify(rec, null, 1));
console.log(JSON.stringify({ wrapper: 'copy', nonce: rec.nonce, legs: rec.legs.length }));
`;
fs.writeFileSync(path.join(A, 'wrapper-copy.mjs'), copy);

// A3: a counter that always accepts.
fs.writeFileSync(path.join(A, 'counter-accept.mjs'), `#!/usr/bin/env node
console.log(JSON.stringify({ schema: 'stub-counter', predicate: true, findingCount: 0, findings: [], checks: 29 }));
process.exitCode = 0;
`);

// C: a counter that always refuses.
fs.writeFileSync(path.join(A, 'counter-refuse.mjs'), `#!/usr/bin/env node
console.log(JSON.stringify({ schema: 'stub-counter', predicate: false, findingCount: 1, findings: ['stub-refusal'], checks: 29 }));
process.exitCode = 1;
`);

// B: a driver that exits 0 and writes nothing (leaves stale receipts alone).
fs.writeFileSync(path.join(A, 'driver-noop.mjs'), `#!/usr/bin/env node
console.log(JSON.stringify({ noop: true }));
process.exitCode = 0;
`);

console.log(JSON.stringify({ written: fs.readdirSync(A) }));
