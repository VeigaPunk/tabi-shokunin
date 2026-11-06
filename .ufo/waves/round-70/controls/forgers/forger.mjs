#!/usr/bin/env node
// Forgery CONTROL driver for scripts/verify-live-r70.mjs (tabi round 70). Never a scored run.
// Accepts the pinned drivers' CLI (--scratch --out --nonce --http-port --cdp-port) and forges:
//   FORGER_MODE=replay        copy FORGER_SOURCE (a committed receipt) to --out unchanged
//   FORGER_MODE=rewrite       copy FORGER_SOURCE, rewrite nonce, page nonce and server-log runs
//                             to the verifier's drawn nonce (ports and launch token left stale)
//   FORGER_MODE=rewrite-full  as rewrite, plus the drawn ports, a fresh launch token and a driver
//                             digest: FORGER_CLAIM_SHA if set (a lie, e.g. the frozen pin), else
//                             this file's own digest -- a rogue driver that knows the receipt schema
//   FORGER_MODE=degenerate    run FORGER_DRIVER with --degenerate FORGER_DEG, then exit 0 so the
//                             verifier's counter (not the driver's exit) must refuse it
import fs from 'node:fs';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const mode = process.env.FORGER_MODE;
const outPath = opt('out'); const nonce = opt('nonce');
const httpPort = opt('http-port'); const cdpPort = opt('cdp-port');
if (mode === 'degenerate') {
  const r = spawnSync(process.execPath, [process.env.FORGER_DRIVER, ...argv, '--degenerate', process.env.FORGER_DEG], { stdio: 'inherit' });
  console.error('forger: degenerate driver exit ' + r.status + ' (masked to 0)');
  process.exit(0);
}
const src = JSON.parse(fs.readFileSync(process.env.FORGER_SOURCE, 'utf8'));
if (mode === 'rewrite' || mode === 'rewrite-full') {
  src.nonce = nonce; src.nonceOnPage = nonce;
  for (const s of src.serverLog || []) { s.run = nonce; s.query = 'run=' + encodeURIComponent(nonce); }
}
if (mode === 'rewrite-full') {
  const oldCdp = (src.host.argv.find((a) => a.startsWith('--remote-debugging-port=')) || '').split('=')[1];
  src.host.argv = src.host.argv.map((a) => (a.startsWith('--remote-debugging-port=') ? '--remote-debugging-port=' + cdpPort : a));
  src.fixture.origin = 'http://127.0.0.1:' + httpPort;
  const tok = crypto.randomBytes(6).toString('hex');
  const oldTok = src.host.launchToken; src.host.launchToken = tok;
  src.host.argv = src.host.argv.map((a) => a.replaceAll(oldTok, tok));
  if (src.host.devtoolsListening) {
    const url = src.host.devtoolsListening.url.replace(':' + oldCdp + '/', ':' + cdpPort + '/');
    src.host.stderrHead = String(src.host.stderrHead || '').replaceAll(src.host.devtoolsListening.url, url);
    src.host.devtoolsListening = { ...src.host.devtoolsListening, url, port: Number(cdpPort) };
  }
  // FORGER_CLAIM_SHA set: lie (claim e.g. the frozen driver's digest); unset: claim this file's own digest
  src.driverSha256 = process.env.FORGER_CLAIM_SHA || crypto.createHash('sha256').update(fs.readFileSync(fileURLToPath(import.meta.url))).digest('hex');
  if ('startedAt' in src) { src.startedAt = new Date().toISOString(); src.finishedAt = new Date(Date.now() + 9000).toISOString(); }
}
fs.writeFileSync(outPath, JSON.stringify(src, null, 1));
process.exit(0);
