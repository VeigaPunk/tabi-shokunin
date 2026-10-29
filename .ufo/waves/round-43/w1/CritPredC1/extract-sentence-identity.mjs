import fs from 'node:fs';
import crypto from 'node:crypto';
import { TextDecoder } from 'node:util';

const ROOT = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const SEAT = `${ROOT}/.ufo/waves/round-43/w1/CritPredC1`;
const CLAIMS_PATH = `${ROOT}/.ufo/waves/round-43/claims.json`;
const C1_PATH = `${ROOT}/.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs`;
const C2_PATH = `${ROOT}/.ufo/waves/round-43/counters/check-routed-defects-round43.mjs`;
const EXECUTION = {
  command: `node ${SEAT}/extract-sentence-identity.mjs`,
  cwd: '/fast/scratch/hyaku/tabi-r43/CritPredC1',
};
const decoder = new TextDecoder('utf-8', { fatal: true });
const sha256 = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
const utf8 = (text) => Buffer.from(text, 'utf8');
const readText = (path) => decoder.decode(fs.readFileSync(path));

function sourceSentence(source, label) {
  const header = source.match(/^\/\/ PREDICATE-SENTENCE: ([^\r\n]*)$/m);
  const constant = source.match(/^const PREDICATE = '((?:\\.|[^'\\])*)';$/m);
  if (!header || !constant) throw new Error(`${label}: required sentence source not found`);
  const escapes = constant[1].match(/\\./g) || [];
  if (escapes.some((escape) => escape !== "\\'")) {
    throw new Error(`${label}: unexpected JavaScript string escape in PREDICATE`);
  }
  return { header: header[1], constant: constant[1].replace(/\\'/g, "'") };
}

function firstByteDifference(a, b) {
  const aa = utf8(a), bb = utf8(b);
  const limit = Math.min(aa.length, bb.length);
  for (let i = 0; i < limit; i++) if (aa[i] !== bb[i]) return i;
  return aa.length === bb.length ? null : limit;
}

function capture(site, value) {
  return { site, sha256: sha256(utf8(value)), utf8Bytes: utf8(value).length, text: value };
}

function compareGroup(name, entries) {
  const values = entries.map((entry) => entry[1]);
  const pairwise = [];
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const a = utf8(values[i]), b = utf8(values[j]);
      pairwise.push({
        left: entries[i][0], right: entries[j][0],
        byteIdentical: a.equals(b), firstByteDifference: firstByteDifference(values[i], values[j]),
      });
    }
  }
  return {
    name,
    sites: entries.map(([site, value]) => capture(site, value)),
    pairwise,
    allByteIdentical: pairwise.every((pair) => pair.byteIdentical),
  };
}

const claimsBytes = fs.readFileSync(CLAIMS_PATH);
const claims = JSON.parse(decoder.decode(claimsBytes));
const c1SourceBytes = fs.readFileSync(C1_PATH);
const c2SourceBytes = fs.readFileSync(C2_PATH);
const c1Source = sourceSentence(decoder.decode(c1SourceBytes), 'C1 counter');
const c2Source = sourceSentence(decoder.decode(c2SourceBytes), 'C2 checker');
const c1Claim = claims.claims[0];
const c2Claim = claims.claims[1];
const c1Identity = compareGroup('C1 counterPredicate at three sites', [
  ['claims[0].counterPredicate', c1Claim.counterPredicate],
  ['c1-signature-bound-v5.mjs header PREDICATE-SENTENCE', c1Source.header],
  ['c1-signature-bound-v5.mjs const PREDICATE (unescaped)', c1Source.constant],
]);
const c2Identity = compareGroup('C2 predicate at three sites', [
  ['claims[1].predicate', c2Claim.predicate],
  ['check-routed-defects-round43.mjs header PREDICATE-SENTENCE', c2Source.header],
  ['check-routed-defects-round43.mjs const PREDICATE (unescaped)', c2Source.constant],
]);
const c1ClaimBytes = utf8(c1Claim.predicate);
const c1CounterBytes = utf8(c1Claim.counterPredicate);
const c1PrefixMatches = c1ClaimBytes.subarray(0, c1CounterBytes.length).equals(c1CounterBytes);
const c1Suffix = c1PrefixMatches ? decoder.decode(c1ClaimBytes.subarray(c1CounterBytes.length)) : null;
const c1ClaimComposition = {
  counterPredicateSha256: sha256(c1CounterBytes),
  predicateSha256: sha256(c1ClaimBytes),
  startsWithCounterPredicateBytes: c1PrefixMatches,
  appendedSuffix: c1Suffix,
  suffixBeginsWithTheClaimMarker: typeof c1Suffix === 'string' && c1Suffix.startsWith(' THE CLAIM:'),
  exactReconstruction: c1PrefixMatches && Buffer.concat([c1CounterBytes, utf8(c1Suffix)]).equals(c1ClaimBytes),
};
const frozenSources = [
  {
    path: '.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs',
    actualSha256: sha256(c1SourceBytes),
    expectedSha256: claims.frozenDigests['.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs'],
  },
  {
    path: '.ufo/waves/round-43/counters/check-routed-defects-round43.mjs',
    actualSha256: sha256(c2SourceBytes),
    expectedSha256: claims.frozenDigests['.ufo/waves/round-43/counters/check-routed-defects-round43.mjs'],
  },
];
for (const source of frozenSources) source.matchesFrozenDigest = source.actualSha256 === source.expectedSha256;
const output = {
  schema: 'tabi-round43-sentence-identity-audit-v1',
  execution: EXECUTION,
  claimsFileSha256: sha256(claimsBytes),
  declaredSentenceIdentity: claims.sentenceIdentity,
  C1: { identity: c1Identity, claimComposition: c1ClaimComposition },
  C2: { identity: c2Identity },
  frozenSourceDigestChecks: frozenSources,
  verdict: c1Identity.allByteIdentical && c1ClaimComposition.exactReconstruction && c1ClaimComposition.suffixBeginsWithTheClaimMarker && c2Identity.allByteIdentical && frozenSources.every((source) => source.matchesFrozenDigest) ? 'ok' : 'finding',
};
const rendered = `${JSON.stringify(output, null, 2)}\n`;
fs.writeFileSync(`${SEAT}/extraction-output.json`, rendered, { flag: 'w' });
process.stdout.write(rendered);
