#!/usr/bin/env node
// Scratch-only: run the wrapper's --battery-probe under each contamination
// vector against the repo file and each scratch variant, and dump comparable
// JSON. Mirrors batteryMain()'s case list exactly.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

const REPO = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const FIXTURES = REPO + '/.ufo/waves/round-41/fixtures';
const S = '/fast/scratch/hyaku/tabi-r43/SimplifierC1';
const targets = {
  repo: REPO + '/scripts/measure-c1-round43.mjs',
  v1: S + '/v1-deadcode.mjs',
  v2: S + '/v2-minenv.mjs',
  v3: S + '/v3-gateargv.mjs',
};
const vectors = [
  ['forger-r39-verbatim', `NODE_OPTIONS=--require ${FIXTURES}/forger-round39.cjs`],
  ['forger-r41-retargeted', `NODE_OPTIONS=--require ${FIXTURES}/forger-round41.cjs`],
  ['node-path', `NODE_PATH=${FIXTURES}/shadow_modules`],
  ['ld-preload', `LD_PRELOAD=${FIXTURES}/libforger.so`],
  ['esm-loader', `NODE_OPTIONS=--experimental-loader ${FIXTURES}/loader.mjs`],
  ['esm-import', `NODE_OPTIONS=--import ${FIXTURES}/loader.mjs`],
  ['clean', null],
];
// minimal scrubbed parent env, same shape batteryMain uses (scrubEnv of the allow list)
const ENV_ALLOW = ['PATH', 'HOME', 'LANG', 'TZ', 'TMPDIR', 'XDG_RUNTIME_DIR', 'DBUS_SESSION_BUS_ADDRESS', 'HYAKU_SCRATCH', 'TABI_RUN_NONCE', 'USER', 'LOGNAME', 'SHELL', 'DISPLAY', 'WAYLAND_DISPLAY', 'XAUTHORITY', 'FONTCONFIG_PATH', 'FONTCONFIG_FILE', 'LC_ALL', 'LC_CTYPE', 'XDG_DATA_DIRS', 'XDG_CONFIG_DIRS', 'XDG_CACHE_HOME', 'XDG_CONFIG_HOME', 'XDG_STATE_HOME', 'SSH_AUTH_SOCK'];
const env = {};
for (const k of ENV_ALLOW) if (process.env[k] !== undefined) env[k] = process.env[k];

const out = {};
for (const [tname, tpath] of Object.entries(targets)) {
  out[tname] = [];
  for (const [caseName, envStr] of vectors) {
    const cmd = envStr === null
      ? `${process.execPath} ${tpath} --battery-probe`
      : `/bin/bash -c 'env "${envStr}" ${process.execPath} ${tpath} --battery-probe'`;
    const r = envStr === null
      ? spawnSync(process.execPath, [tpath, '--battery-probe'], { encoding: 'utf8', env, maxBuffer: 4 << 20, timeout: 20000 })
      : spawnSync('/bin/bash', ['-c', `env "${envStr}" ${process.execPath} ${tpath} --battery-probe`], { encoding: 'utf8', env, maxBuffer: 4 << 20, timeout: 20000 });
    let parsed = null; try { parsed = JSON.parse((r.stdout || '').trim()); } catch { }
    out[tname].push({ case: caseName, exit: r.status, finding: parsed ? parsed.finding : null, contaminated: parsed ? parsed.contaminated : null, stdout: r.stdout, stderr: r.stderr });
  }
}
fs.writeFileSync(S + '/probe-parity.json', JSON.stringify(out, null, 1) + '\n');
// comparison: every target must produce byte-identical stdout per case vs repo
let identical = true;
for (const t of Object.keys(targets)) {
  for (let i = 0; i < vectors.length; i++) {
    const a = out.repo[i], b = out[t][i];
    const same = a.stdout === b.stdout && a.exit === b.exit && a.finding === b.finding;
    if (!same) { identical = false; console.log(`DIFF ${t} case=${vectors[i][0]} exitRepo=${a.exit} exit=${b.exit} findingRepo=${a.finding} finding=${b.finding} stdoutEqual=${a.stdout === b.stdout}`); }
  }
}
console.log('probe parity byte-identical across repo/v1/v2/v3:', identical);
for (const t of Object.keys(targets)) console.log(t, out[t].map((c) => `${c.case}:${c.exit}/${c.finding}`).join(' '));
