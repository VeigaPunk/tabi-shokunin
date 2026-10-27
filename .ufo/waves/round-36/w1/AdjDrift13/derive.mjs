#!/usr/bin/env node
// AdjDrift13 — independent re-derivation of the C1 drift-verification status for 20 ledger rows.
// Reads ONLY git objects (git show <rev>:<path>). No mutation of any repo, no worktree reads.
// Usage: node derive.mjs <chunk.tsv> <delta-pins.json> <committed-ledger.tsv> <out-receipt.tsv> <out-commands.txt>
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const [chunkPath, pinsPath, ledgerPath, outReceipt, outCommands] = process.argv.slice(2);
const FLEET = '/home/vgpnk/Projects/shokunin';
const ENV = { PATH: process.env.PATH, HOME: process.env.HOME, GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null', LC_ALL: 'C' };
const REF_RE = /^([a-z0-9-]+)-shokunin@([0-9a-f]{40}):(.+):([1-9][0-9]*)$/;

const cmds = [];
function git(repo, args) {
  const shown = ['git', '-C', repo, ...args];
  const r = spawnSync(shown[0], shown.slice(1), { encoding: 'buffer', maxBuffer: 256 * 1024 * 1024, env: ENV });
  cmds.push(`${shown.join(' ')}  # exit ${r.status === null ? `signal ${r.signal}` : r.status} stdout-bytes ${r.stdout ? r.stdout.length : 0}`);
  return r;
}
const split = (buf) => buf.toString('utf8').split('\n').map((l) => l.replace(/\r$/, ''));

// committed ledger indexed by sibling_ref
const ledger = new Map();
for (const l of split(readFileSync(ledgerPath)).slice(1)) {
  if (!l) continue;
  const [ref, status, note] = l.split('\t');
  ledger.set(ref, { status, note });
}
const deltaPins = JSON.parse(readFileSync(pinsPath, 'utf8'));

const rows = [];
const chunk = split(readFileSync(chunkPath)).filter((l) => l && !l.startsWith('#'));
for (const line of chunk) {
  const ref = line.split('\t')[0];
  const m = REF_RE.exec(ref);
  if (!m) throw new Error(`unparsable sibling_ref: ${ref}`);
  const lane = m[1], pin = m[2], path = m[3], n = Number(m[4]);
  const repo = `${FLEET}/${lane}-shokunin`;
  const H = deltaPins[lane];
  if (!H) throw new Error(`no frozen delta head for lane ${lane}`);

  // step 1: cited text at the pin
  const pinShow = git(repo, ['show', `${pin}:${path}`]);
  let status, note;
  if (pinShow.status !== 0) {
    status = 'stale'; note = 'pin file absent';
  } else {
    const pinLines = split(pinShow.stdout);
    const cited = n <= pinLines.length ? pinLines[n - 1].trim() : null;
    if (cited === null) {
      status = 'stale'; note = 'pin line absent';
    } else {
      // step 2: the frozen delta head
      const headShow = git(repo, ['show', `${H}:${path}`]);
      if (headShow.status !== 0) {
        status = 'stale'; note = 'head file absent';
      } else {
        const headLines = split(headShow.stdout);
        const same = n <= headLines.length ? headLines[n - 1].trim() : undefined;
        if (same === cited) {
          status = 'unchanged'; note = '-';
        } else {
          const hits = [];
          for (let i = 0; i < headLines.length; i += 1) if (headLines[i].trim() === cited) hits.push(i + 1);
          if (hits.length) {
            status = 'moved';
            note = `verbatim at :${hits[0]}${hits.length > 1 ? ` (also :${hits.slice(1).join(', :')})` : ''}`;
          } else {
            status = 'stale'; note = 'cited text absent at head';
          }
        }
      }
    }
  }

  const committed = ledger.get(ref);
  const ledgerStatus = committed ? committed.status : 'ABSENT-FROM-LEDGER';
  const verdict = committed && committed.status === status ? 'agree' : 'MISMATCH';
  rows.push([ref, status, note, ledgerStatus, verdict]);
}

const mismatches = rows.filter((r) => r[4] !== 'agree');
const out = ['sibling_ref\tmy-status\tmy-note\tledger-status\tagree|MISMATCH']
  .concat(rows.map((r) => r.join('\t')))
  .concat([`# AdjDrift13: ${rows.length} rows, ${mismatches.length} mismatches`])
  .join('\n') + '\n';
writeFileSync(outReceipt, out);
writeFileSync(outCommands, cmds.join('\n') + '\n');
console.log(`AdjDrift13: ${rows.length} rows, ${mismatches.length} mismatches`);
for (const r of rows) console.log(r.join('\t'));
process.exit(0);
