#!/usr/bin/env node
// Build a TRIMMED copy of the frozen kill-power control: same code path, smaller mutant set.
// Trims: (a) force-true mutants limited to the first `forceTrue` declared check ids, (b) SEMANTIC
// array replaced wholesale. Each replacement must occur exactly once.
import fs from 'node:fs';
import path from 'node:path';

const [S, outName, cfgFile] = process.argv.slice(2);
const cfg = JSON.parse(fs.readFileSync(cfgFile, 'utf8'));
let src = fs.readFileSync(path.join(S, 'base-kill-power.mjs'), 'utf8');
const once = (from, to, tag) => {
  const n = src.split(from).length - 1;
  if (n !== 1) { console.error(`${tag}: occurs ${n} times`); process.exit(2); }
  src = src.replace(from, to);
};
once("...ids.map((id) => ({ cls: 'force-true'", `...ids.slice(0, ${cfg.forceTrue}).map((id) => ({ cls: 'force-true'`, 'force-true trim');
const start = src.indexOf('const SEMANTIC = [');
const end = src.indexOf('];\nif (!counterSrc.includes(HOOK))');
if (start < 0 || end < 0) { console.error('SEMANTIC delimiters not found'); process.exit(2); }
src = src.slice(0, start) + 'const SEMANTIC = ' + JSON.stringify(cfg.semantic) + ';\n' + src.slice(end + 3);
const dest = path.join(S, 'scripts', outName);
fs.writeFileSync(dest, src);
const chk = fs.readFileSync(dest, 'utf8');
console.log(JSON.stringify({ dest, sha256: (await import('node:crypto')).createHash('sha256').update(chk).digest('hex'), semantic: cfg.semantic.length, forceTrue: cfg.forceTrue }));
