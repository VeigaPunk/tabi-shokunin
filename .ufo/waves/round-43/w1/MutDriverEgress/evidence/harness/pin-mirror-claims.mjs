#!/usr/bin/env node
// pin-mirror-claims.mjs <mirrorRoot>
// Re-pins the MIRROR's claims.json so that ONLY the driver digest can
// mismatch: the mirror's wrapper and counter copies were edited (the ROOT
// literal), so their digests are pinned to their ACTUAL mirror bytes, while
// the driver stays pinned to the PRISTINE committed driver digest.
//
//   mirror-mutant  -> actual driver is the MUTANT -> driver digest mismatches
//   mirror-pristine-> actual driver is the PRISTINE -> nothing mismatches
//
// The result isolates the producer-digest pin as the only difference between
// the two arms.
import fs from 'node:fs';
import crypto from 'node:crypto';

const root = process.argv[2];
const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const claimsPath = `${root}/.ufo/waves/round-43/claims.json`;
const c = JSON.parse(fs.readFileSync(claimsPath, 'utf8'));

c.frozenDigests['scripts/measure-c1-round43.mjs'] = sha(`${root}/scripts/measure-c1-round43.mjs`);
c.frozenDigests['.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs'] = sha(`${root}/.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs`);
// the DRIVER pin stays the committed pristine value — deliberately.
fs.writeFileSync(claimsPath, JSON.stringify(c, null, 1) + '\n');
console.log(JSON.stringify({
  mirror: root,
  wrapperPin: c.frozenDigests['scripts/measure-c1-round43.mjs'],
  counterPin: c.frozenDigests['.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs'],
  driverPin: c.frozenDigests['scripts/playwright-firefox-egress-round43.mjs'],
  actualDriver: sha(`${root}/scripts/playwright-firefox-egress-round43.mjs`),
}, null, 1));
