#!/usr/bin/env node
// Direct counter invocation with NO fd3/fd4 channel (the committed controls'
// invocation shape): node <counter> <receipt> --measure <measure>
import fs from 'node:fs';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const NODE = '/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node';
const counterPath = process.argv[2];
const fixtureDir = process.argv[3];
const label = process.argv[4] || 'direct';

const r = spawnSync(NODE, [counterPath, fixtureDir + '/receipt.json', '--measure', fixtureDir + '/measure.json'], {
  cwd: fixtureDir,
  env: { PATH: process.env.PATH, HOME: process.env.HOME, LANG: 'C.UTF-8' },
  encoding: 'utf8', maxBuffer: 64 << 20,
});
let counter = null;
try { counter = JSON.parse((r.stdout || '').trim()); } catch { }
console.log(JSON.stringify({
  label,
  counterPath,
  counterSha256: crypto.createHash('sha256').update(fs.readFileSync(counterPath)).digest('hex'),
  exit: r.status,
  counter,
  stderr: (r.stderr || '').trim().slice(0, 400),
}, null, 1));
