#!/usr/bin/env node
// C1 reachability attack, vector (a/d): a hand-written receipt + witness that
// contains NO browser artifacts at all. It has no driver command log, no page
// events, no screenshots, no fixture hash, no http log, no userAgent; it names
// pid 1 as the "firefox" tree pid and pid 999999 as the driver. Every field the
// frozen counter v4 actually reads is filled in consistently and nothing else.
import fs from 'node:fs';
import crypto from 'node:crypto';

const S = process.argv[2];
if (!S) { console.error('usage: gen-a2.mjs <scratch-dir>'); process.exit(64); }
const nonce = crypto.randomBytes(32).toString('hex');
fs.writeFileSync(`${S}/a2-nonce.txt`, nonce + '\n');

const FF = '/home/vgpnk/.cache/ms-playwright/firefox-1555/firefox/firefox'; // real path only: the pin is read from disk
const FF_PID = 1;        // pid 1 is PID 1; it is provably not firefox
const NODE_PID = 999999; // provably nonexistent
const SHOT = 'ab'.repeat(32);

function mkRun(i) {
  const runStartTicks = 1000 + i * 1000;
  const samples = [];
  for (let j = 0; j < 8; j += 1) {
    samples.push({
      t: 2000000000000 + i * 100000 + j * 200, // fabricated wall clock
      tTicks: runStartTicks + j * 20,
      ss: { ticks: 1, lines: 1, nonLoopback: 0, ssObs: 1 },
      proc: { ticks: 1, inodes: 1, nonLoopback: 0, procObs: 1 },
      treePids: [{ pid: FF_PID, ppid: 1, startTicks: runStartTicks, exe: FF, comm: 'firefox', args: 'handwritten' }],
    });
  }
  return {
    name: `run${i + 1}`, refused: false, refuseReason: null, runNonce: nonce,
    runStartTicks, runEndTicks: runStartTicks + 160, samples,
    browserVersion: '0.0-not-a-browser', firstShotSha256: SHOT,
    finalSweep: {
      t: samples.at(-1).t,
      ss: { ticks: 1, lines: 0, nonLoopback: 0, ssObs: 0 },
      proc: { ticks: 1, inodes: 0, nonLoopback: 0, procObs: 0 },
      treePids: [],
    },
    survivorPids: [], survivors: 0, portClosed: true,
    sockets: { ss: { observations: 8, nonLoopback: 0 }, proc: { observations: 8, nonLoopback: 0 }, finalSweep: { ss: 0, proc: 0 } },
    egressNonLoopback: 0,
    owned: { nodePid: NODE_PID, roots: [{ pid: FF_PID, startTicks: runStartTicks, exe: FF, comm: 'firefox' }] },
  };
}

const receipt = {
  schema: 'tabi-pw-firefox-egress-receipt-r41',
  driver: 'handwritten-no-driver.json',
  measuredAt: '1970-01-01T00:00:00.000Z',
  playwrightVersion: '0.0.0',
  fixture: { sha256: '00'.repeat(32), bytes: 0 },
  envCheck: { procEnvironReadable: true, nameCount: 0, forbiddenNames: [], execArgv: [], execArgvClean: true, envNonceEcho: 'match' },
  runNonce: nonce, runs: [mkRun(0), mkRun(1)], refused: false, binding: true,
  egressNonLoopback: 0, survivors: 0, browserVersion: '0.0-not-a-browser',
};
fs.writeFileSync(`${S}/a2-receipt.json`, JSON.stringify(receipt, null, 1) + '\n');

const ws = [];
for (let j = 0; j < 10; j += 1) {
  ws.push({ t: 2000000000000 + j * 60, tTicks: 1100 + j, tree: [
    { pid: NODE_PID, ppid: 1, startTicks: 900, exe: '/usr/bin/node', comm: 'node' },
    { pid: FF_PID, ppid: NODE_PID, startTicks: 1000, exe: FF, comm: 'firefox' },
  ] });
}
fs.writeFileSync(`${S}/a2-witness.json`, JSON.stringify({
  schema: 'tabi-r41-witness', rootPid: NODE_PID, nonce, startedTicks: 900, endedTicks: 1600, samples: ws, environ: [],
}, null, 1) + '\n');
console.log(JSON.stringify({ receiptBytes: fs.statSync(`${S}/a2-receipt.json`).size, witnessBytes: fs.statSync(`${S}/a2-witness.json`).size, nonce }));
