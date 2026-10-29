#!/usr/bin/env node
// unit-observe.mjs — deterministic, browser-free probe of the driver's two
// socket-observation functions. It extracts observeSs/observeProc (and their
// helpers) from a driver copy and runs them against a SYNTHETIC observation
// that contains exactly one non-loopback remote:
//
//   ss -Htnp   -> one ESTAB line whose peer is 203.0.113.7:443
//   /proc/net/tcp -> one ESTABLISHED row, rem 077F01CB:01BB (203.0.113.7:443),
//                    inode 4242
//   /proc/<pid>/fd -> fd 5 -> socket:[4242]
//
// It prints the returned observation object for the given driver copy, so the
// pristine and mutated copies can be compared on IDENTICAL observation input.
import fs from 'node:fs';

const path = process.argv[2];
const src = fs.readFileSync(path, 'utf8');

const START = 'function isLoopbackPeer(peer) {';
const END = '// One sample: fresh identity-bound tree + both socket surfaces + owned counts.';
const a = src.indexOf(START);
const b = src.indexOf(END);
if (a < 0 || b < 0) { console.error('could not locate the observation block'); process.exit(2); }
const block = src.slice(a, b);

// Synthetic observation stubs.
const SS_LINE = 'ESTAB 0 0 127.0.0.1:41234 203.0.113.7:443 users:(("firefox",pid=1234,fd=5))';
// parseProcNet() drops the FIRST line of /proc/net/tcp{,6} as the header, so
// the synthetic tables must carry a header row before the data row.
const TCP_HDR = '  sl  local_address rem_address   st tx_queue rx_queue tr tm->when retrnsmt   uid  timeout inode';
const TCP_ROW = '   0: 0100007F:1F90 077F01CB:01BB 01 00000000:00000000 00:00000000 00000000     0        0 4242 1 0000000000000000 0 0 0 10 0';
const TCP6_ROW = '   0: 00000000000000000000000000000000:0000 00000000000000000000000000000000:0000 0A 00000000:00000000 00:00000000 00000000     0        0 0 1 0000000000000000 0 0 0 0 0';

const stubs = {
  spawnSync(cmd, args) {
    if (cmd === 'ss') return { status: 0, stdout: SS_LINE + '\n' };
    return { status: 0, stdout: '' };
  },
  readFileSync(p) {
    if (p === '/proc/net/tcp') return TCP_HDR + '\n' + TCP_ROW + '\n';
    if (p === '/proc/net/tcp6') return TCP_HDR + '\n' + TCP6_ROW + '\n';
    throw new Error('ENOENT ' + p);
  },
  readdirSync(p) {
    if (p === '/proc/1234/fd') return ['5'];
    throw new Error('ENOENT ' + p);
  },
  readlinkSync(p) {
    if (p === '/proc/1234/fd/5') return 'socket:[4242]';
    throw new Error('ENOENT ' + p);
  },
};

// The extracted block calls node:path's join() (socketInodesOfPid) and
// node:fs's readlinkSync; both must be in scope or the inner try/catch in
// socketInodesOfPid silently swallows the ReferenceError and reports zero
// inodes.
const { join } = await import('node:path');
const fn = new Function(
  'spawnSync', 'readFileSync', 'readdirSync', 'readlinkSync', 'join',
  `${block}\nreturn { observeSs, observeProc };`,
);
const { observeSs, observeProc } = fn(stubs.spawnSync, stubs.readFileSync, stubs.readdirSync, stubs.readlinkSync, join);

const out = {
  driver: path,
  ss: observeSs([1234]),
  proc: observeProc([1234]),
};
console.log(JSON.stringify(out, null, 1));
