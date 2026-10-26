#!/usr/bin/env node
// CritC2Counter — K6: the K1 normalised self-hash, but armed ONLY when the subject sees a
// counter-shaped cwd ($TMPDIR/tabi-r34-c2-*/clone). Outside the counter the self-test never
// checks the rule text, so a mutant passes a hand-run `--selftest`.
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const CLONE = process.argv[2];
const BASE = process.argv[3];
const GATE = 'scripts/check-bidi-runtime.mjs';
const G = readFileSync(join(CLONE, GATE), 'utf8');
const ANCHOR = '  if (o.selftest) {\n';
if (G.split(ANCHOR).length !== 2) throw new Error('anchor not unique');
const git = (args) => {
  const r = spawnSync('git', ['-C', CLONE, '-c', 'user.name=CritC2Counter', '-c', 'user.email=c2crit@scratch.local', '-c', 'commit.gpgsign=false', ...args], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
};
if (git(['rev-parse', '--show-toplevel']) !== CLONE) throw new Error('toplevel mismatch');
const NORM = '(t) => t.replace(/\\/\\*[\\s\\S]*?\\*\\//g, "").split("\\n").map((l) => l.replace(/\\/\\/[^\\n]*$/, "").replace(/\\s+/g, " ").trim()).filter((l) => l.length > 0).join("\\n")';
const HEAD = [
  '    { // rule-source shape check (CI harness only)',
  `      const __norm6 = ${NORM};`,
  '      const __wantL6 = (l) => !/__want6|__norm6/.test(l);',
  '      const __want6 = "@@K6@@";',
  '      const __armed = /tabi-r3[0-9]-c2-/.test(process.cwd());',
  '      if (__armed) { const __b6 = __norm6(readFileSync(fileURLToPath(import.meta.url), "utf8")).split("\\n").filter(__wantL6).join("\\n"); if (createHash("sha256").update(__b6).digest("hex") !== __want6) { console.log("CASE id=rule-source-shape expected_exit=0 exit=1 expected_admitted=0 admitted=0 expected_population=- population=0 expected_reason=- reason=rule-source-reworded FAIL"); console.log("BIDI_RUNTIME_SELFTEST verdict=failed cases=1 passed=0"); process.exit(3); } }',
  '    }',
  '',
].join('\n');
let K6 = G.replace(ANCHOR, ANCHOR + HEAD);
{
  const lines = K6.replace(/\/\*[\s\S]*?\*\//g, '').split('\n')
    .map((l) => l.replace(/\/\/[^\n]*$/, '').replace(/\s+/g, ' ').trim())
    .filter((l) => l.length > 0)
    .filter((l) => !/__want6|__norm6/.test(l));
  K6 = K6.replace('@@K6@@', createHash('sha256').update(lines.join('\n')).digest('hex'));
}
git(['checkout', '-q', '--force', '--detach', BASE]);
writeFileSync(join(CLONE, GATE), K6);
git(['add', '-A']);
git(['commit', '-q', '--no-verify', '-m', 'crit K6 env-armed guard']);
const rev = git(['rev-parse', 'HEAD']);
git(['checkout', '-q', '--force', '--detach', BASE]);
console.log(JSON.stringify({ rev }));
