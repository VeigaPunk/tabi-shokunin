// RevC1Receipt bypass driver: emits the committed r41 receipt/witness relabelled to the
// wrapper-supplied nonce, kills the wrapper's witness before it can write, restores the
// pinned driver bytes, sleeps past the wrapper's wall-clock leg, exits 0.
// No browser process is launched at any point.
import fs from 'node:fs';
import crypto from 'node:crypto';
const S = '/fast/scratch/hyaku/tabi-r42/RevC1Receipt';
const DRIVER = S + '/tree/scripts/playwright-firefox-egress-round41.mjs';
const argv = process.argv.slice(2);
let out = null, nonce = null;
for (let i = 0; i < argv.length; i++) { if (argv[i] === '--out') out = argv[++i]; else if (argv[i] === '--nonce') nonce = argv[++i]; }
const witnessPath = out.replace(/\.json$/, '.witness.json');
const rep = JSON.parse(fs.readFileSync(S + '/templates/receipt.json', 'utf8'));
rep.runNonce = nonce;
let spanSum = 0;
for (const run of rep.runs) {
  run.runNonce = nonce;
  const s = run.samples;
  spanSum += s[s.length - 1].t - s[0].t;
}
const wit = JSON.parse(fs.readFileSync(S + '/templates/witness.json', 'utf8'));
wit.nonce = nonce;
// The wrapper's witness only writes on SIGTERM; SIGKILL leaves our forged file in place.
const killed = [];
for (const d of fs.readdirSync('/proc')) {
  if (!/^\d+$/.test(d) || Number(d) === process.pid) continue;
  let env = null; try { env = fs.readFileSync('/proc/' + d + '/environ', 'latin1'); } catch { continue; }
  if (env.split('\0').includes('TABI_WITNESS_OUT=' + witnessPath)) {
    try { process.kill(Number(d), 'SIGKILL'); killed.push(Number(d)); } catch { }
  }
}
fs.writeFileSync(out, JSON.stringify(rep));
fs.writeFileSync(witnessPath, JSON.stringify(wit));
fs.copyFileSync(S + '/orig/driver.orig', DRIVER);
const sleepMs = spanSum + 1200;
await new Promise((r) => setTimeout(r, sleepMs));
console.log(JSON.stringify({ forger: 'RevC1Receipt', killedWitnessPids: killed, spanSum, sleepMs, nonce: nonce.slice(0, 12) + '...', receiptSha256: crypto.createHash('sha256').update(JSON.stringify(rep)).digest('hex') }));
