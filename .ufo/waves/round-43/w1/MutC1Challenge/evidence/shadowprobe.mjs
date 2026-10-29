import fs from 'node:fs';
import crypto from 'node:crypto';
const p = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs';
const claims = JSON.parse(fs.readFileSync('/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/claims.json','utf8'));
console.log(JSON.stringify({
  counterPathResolved: p,
  counterFileSha256: crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'),
  claimsPinForCounter: claims.frozenDigests['.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs'],
  hasConstChallenge: /const challengeVerified = true/.test(fs.readFileSync(p,'utf8')),
}));
