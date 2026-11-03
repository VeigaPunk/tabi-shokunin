#!/usr/bin/env node
// Sentinel probe: A/B control for the Arch launcher's flags.conf injection.
//
// Arms a THROWAWAY home that contains a copy of the operator's
// ~/.config/chromium-flags.conf (with the --load-extension line) and shows
// that (a) the launcher reads $HOME/.config/chromium-flags.conf, (b) the
// extension then loads, (c) --disable-extensions suppresses it.
//
// Nothing outside the scratch is touched: the flags.conf is a COPY written
// under the scratch's throwaway home, never a read or write of the operator's.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';

const SCRATCH = process.argv[2];
const MODE = process.argv[3]; // 'flags' | 'flags-disableext' | 'noflags'
const CHROMIUM = '/usr/bin/chromium';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

fs.mkdirSync(SCRATCH, { recursive: true });
const token = crypto.randomBytes(6).toString('hex');
const profileDir = path.join(SCRATCH, 'profile-' + token);
const runHome = path.join(SCRATCH, 'home-' + token);
const runXdgConfig = path.join(runHome, '.config');
fs.mkdirSync(profileDir, { recursive: true, mode: 0o700 });
fs.mkdirSync(runXdgConfig, { recursive: true, mode: 0o700 });

if (MODE !== 'noflags') {
  // a COPY of the operator's flags file, placed under the throwaway HOME
  const real = path.join(process.env.HOME, '.config', 'chromium-flags.conf');
  fs.copyFileSync(real, path.join(runXdgConfig, 'chromium-flags.conf'));
}

const srv = http.createServer((req, res) => {
  res.writeHead(200, { 'content-type': 'text/html' });
  res.end('<!doctype html><html><body>probe</body></html>');
});
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const port = srv.address().port;

const argv = [
  CHROMIUM, '--headless=new', '--remote-debugging-port=0',
  '--remote-debugging-address=127.0.0.1', '--user-data-dir=' + profileDir,
  '--no-first-run', '--no-default-browser-check', '--disable-background-networking',
  '--disable-component-update', '--disable-sync', '--disable-search-engine-choice-screen',
  '--disable-dev-shm-usage', '--window-size=1280,900',
  'http://127.0.0.1:' + port + '/',
];
if (MODE !== 'flags-disableext') argv.push('--disable-extensions');
argv.push('about:blank');

const child = spawn(argv[0], argv.slice(1), {
  stdio: ['ignore', 'pipe', 'pipe'], detached: true,
  env: { ...process.env, HOME: runHome, XDG_CONFIG_HOME: runXdgConfig, TMPDIR: SCRATCH },
});
let stderr = ''; child.stderr.on('data', (d) => { stderr += d.toString(); });
await sleep(9000);

let effective = null;
try {
  const pf = fs.readFileSync(path.join(profileDir, 'DevToolsActivePort'), 'utf8').split('\n')[0].trim();
  const list = await (await fetch('http://127.0.0.1:' + pf + '/json/list')).json();
  effective = {
    extensionTargets: list.filter((t) => (t.url || '').startsWith('chrome-extension://')).map((t) => t.url.slice(0, 120)),
    allTargets: list.map((t) => t.type),
  };
} catch (e) { effective = { error: String(e && e.message) }; }

try { process.kill(-child.pid, 'SIGKILL'); } catch {}
await sleep(700);
for (const ent of fs.readdirSync('/proc')) {
  if (!/^\d+$/.test(ent)) continue;
  let cmd; try { cmd = fs.readFileSync('/proc/' + ent + '/cmdline', 'latin1'); } catch { continue; }
  if (cmd.includes(token)) { try { process.kill(Number(ent), 'SIGKILL'); } catch {} }
}
srv.close();
console.log(JSON.stringify({ mode: MODE, effective }, null, 1));
process.exit(0);
