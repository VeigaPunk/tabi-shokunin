#!/usr/bin/env node
// Records ONE command as a provenance-complete receipt (argv, cwd, exit, stdout
// digest, inputs bound to bytes at a revision). Used for the scored after-command
// whose argv differs from the battery's control set (it names the committed
// evidence path). It records bytes; it never interprets a result.
//
// Usage: node record-command.mjs --name <n> --out <dir> --rev <hex|worktree>
//   --repo <lane> --input <repo-relative path> [--input ...] -- <command...>
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const argv = process.argv.slice(2);
const sep = argv.indexOf('--');
if (sep < 0) { console.log(JSON.stringify({ error: 'usage', detail: 'need -- <command...>' })); process.exit(2); }
const flags = new Map();
for (let i = 0; i < sep; i++) {
  if (argv[i].startsWith('--')) { const n = argv[i + 1]; if (n && !n.startsWith('--')) { flags.set(argv[i].slice(2), n); i++; } else flags.set(argv[i].slice(2), true); }
}
const opt = (n) => (flags.get(n) === true ? null : flags.get(n) || null);
const name = opt('name');
const outDir = path.resolve(opt('out') || '');
const rev = opt('rev') || 'worktree';
const repo = path.resolve(opt('repo') || process.cwd());
const inputs = [];
for (let i = 0; i < sep; i++) if (argv[i] === '--input') inputs.push(argv[i + 1]);
const command = argv.slice(sep + 1);
if (!name || !command.length) { console.log(JSON.stringify({ error: 'usage', detail: 'need --name and -- <command...>' })); process.exit(2); }
fs.mkdirSync(outDir, { recursive: true });
const stdoutPath = path.join(outDir, name + '.stdout');
const stderrPath = path.join(outDir, name + '.stderr');
const run = spawnSync(command[0], command.slice(1), { cwd: repo, encoding: 'buffer', timeout: 900000 });
fs.writeFileSync(stdoutPath, run.stdout || Buffer.alloc(0));
fs.writeFileSync(stderrPath, run.stderr || Buffer.alloc(0));
const receipt = {
  schema: 'tabi-command-receipt-v1', name,
  argv: command, cwd: repo, exit: run.status === null ? -1 : run.status,
  stdoutFile: path.basename(stdoutPath), stdoutSha256: sha(run.stdout || Buffer.alloc(0)),
  stderrFile: path.basename(stderrPath), stderrSha256: sha(run.stderr || Buffer.alloc(0)),
  inputs: inputs.map((p) => ({ path: p, sha256: sha(fs.readFileSync(path.join(repo, p))) })),
  rev,
};
fs.writeFileSync(path.join(outDir, name + '.command.json'), JSON.stringify(receipt, null, 1));
console.log(JSON.stringify({ name, exit: receipt.exit, stdoutSha256: receipt.stdoutSha256 }));
process.exitCode = 0;
