#!/usr/bin/env node
// CritC2Counter — K4: isolates (a) the decoy probe against a defensible "banned weakened
// rule absent" case, (b) the twin probe against a defensible "rule text verbatim" case,
// (c) the counter's environment leak into the subject (TMPDIR/cwd/argv path).
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';

const CLONE = process.argv[2];
const BASE = process.argv[3];
const LEAK = process.argv[4];
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

// M02's find text, base64 so the file bytes do not contain it (keeps the mutant appliable)
const M02_FIND_B64 = Buffer.from('const MEASURED = /^(yes|no)(?:\\s*[—–-]\\s*\\S[\\s\\S]*)?$/i;', 'utf8').toString('base64');

const HEAD = [
  '    { // record what the runner handed us (diagnostic only)',
  `      try { writeFileSync(${JSON.stringify(LEAK)}, JSON.stringify({ TMPDIR: process.env.TMPDIR || null, cwd: process.cwd(), argv1: process.argv[1] || null, execArgv: process.execArgv }) + String.fromCharCode(10), { flag: "a" }); } catch { /* ignore */ }`,
  '    }',
  '    { // a weakened session-id rule must never reappear in this file',
  `      if (readFileSync(fileURLToPath(import.meta.url), "utf8").includes("const SESSION_ID = /^[0-9a-f" + "A-F]{32}$/;")) { console.log("CASE id=no-weakened-session-rule expected_exit=0 exit=1 expected_admitted=0 admitted=0 expected_population=- population=0 expected_reason=- reason=weakened-rule-present FAIL"); console.log("BIDI_RUNTIME_SELFTEST verdict=failed cases=1 passed=0"); process.exit(3); }`,
  '    }',
  '    { // the measured-cell rule must still read exactly as specified',
  `      const __wantM = Buffer.from(${JSON.stringify(M02_FIND_B64)}, "base64").toString("utf8");`,
  '      if (!readFileSync(fileURLToPath(import.meta.url), "utf8").includes(__wantM)) { console.log("CASE id=measured-rule-verbatim expected_exit=0 exit=1 expected_admitted=0 admitted=0 expected_population=- population=0 expected_reason=- reason=measured-rule-reworded FAIL"); console.log("BIDI_RUNTIME_SELFTEST verdict=failed cases=1 passed=0"); process.exit(3); }',
  '    }',
  '',
].join('\n');
const K4 = G.replace(ANCHOR, ANCHOR + HEAD);
writeFileSync(join(CLONE, GATE), K4);
git(['add', '-A']);
git(['commit', '-q', '--no-verify', '-m', 'crit K5 env leak, append']);
const rev = git(['rev-parse', 'HEAD']);
git(['checkout', '-q', '--force', '--detach', BASE]);
console.log(JSON.stringify({ rev }));
