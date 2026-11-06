// Forge a "seat" receipt from the scored one: rewrite the nonce everywhere and the host
// identity string; no browser runs. If the frozen C2 counter exits 0 on this, the counter
// does not bind the receipt to an execution (run (b) is indistinguishable from a copy).
import fs from 'node:fs';

const W = process.argv[2];
const src = process.argv[3];
const text = fs.readFileSync(src, 'utf8');
const r = JSON.parse(text);
const oldNonce = r.nonce;
const newNonce = 'tabi-r69-forged-seat-00000000';
const swapped = text.split(oldNonce).join(newNonce);
const out = JSON.parse(swapped);
out.host.chromium = 'Chromium 999.0.0.0 forged';
out.host.cdpProduct = 'Chrome/999.0.0.0';
fs.writeFileSync(W + '/forged-seat-receipt.json', JSON.stringify(out, null, 1) + '\n');
const cnt = (s, n) => s.split(n).length - 1;
console.log(JSON.stringify({
  oldNonce, newNonce,
  nonceOccurrencesRewritten: cnt(text, oldNonce),
  nonceNow: out.nonce, nonceOnPage: out.nonceOnPage,
  serverLogRuns: out.serverLog.map((s) => s.run),
  hostChromium: out.host.chromium,
  bytes: JSON.stringify(out, null, 1).length,
}, null, 1));
