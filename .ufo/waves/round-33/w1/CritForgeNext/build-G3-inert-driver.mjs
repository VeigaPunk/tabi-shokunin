#!/usr/bin/env node
// build-G3-inert-driver.mjs — round-33 C2 next-generation forgery G3
// ("a driver that imports only allow-listed symbols but whose run never happened").
//
// Attacked rule: gate v2 clause (3) — "driver: blob present with matching sha256,
// sha256 different from the gate's own blob at --rev, and its source neither re-exports
// (`export * from` / `export {…} from`) the gate nor imports any gate symbol outside an
// explicit allow-list FIXTURE, FIXTURE_SHA256, FIXTURE_HEADER, VIEWPORT, DATA_TEXT,
// serveFixture".
//
// Construction: the receipt names a new driver blob that (a) imports exactly the six
// allow-listed gate symbols and nothing else, (b) has no re-export, (c) has a digest
// different from the gate's, and (d) starts no session and records no transcript —
// its main() throws and is never invoked. The transcripts stay the honest round-32
// runs, which this file did not produce. Every static clause passes; the receipt's
// sentence "this driver recorded these runs" is false.
//
// Why it matters: a source-content allow-list is a necessary condition, not a
// provenance check. Static analysis cannot establish execution. (The honest round-32
// driver would satisfy the same clauses; the attack shows the clauses do not
// distinguish "ran" from "declared".)
//
// Usage: node build-G3-inert-driver.mjs --repo <clone> --rev <40hex> [--json]
import {
  commit, emit, honest, parseArgs, prepareVariant, put, sha256, RECEIPT,
} from './forge-common.mjs';

const o = parseArgs(process.argv.slice(2), { repo: 'str', rev: 'str', json: 'bool' });
if (!o.repo || !o.rev) throw new Error('--repo and --rev are required');

const repo = prepareVariant(o.repo, o.rev);
const h = honest(repo, o.rev);

const DRIVER = 'corpus/evidence/round-32/bidi/g3-driver.mjs';
const source = [
  '#!/usr/bin/env node',
  '// corpus/evidence/round-32/bidi/g3-driver.mjs — round-33 forgery G3.',
  '// Declared WebDriver BiDi driver for the receipt\'s two runs. It imports only the gate',
  '// symbols a content allow-list would permit and never starts a session: main() throws',
  '// and is not invoked from the module body, so no chromedriver process, no websocket and',
  '// no transcript is ever produced by this file. The transcript bytes cited by the receipt',
  '// are the honest round-32 ones, which this file did not write.',
  'import {',
  '  DATA_TEXT, FIXTURE, FIXTURE_HEADER, FIXTURE_SHA256, VIEWPORT, serveFixture,',
  '} from "../../../../scripts/check-bidi-runtime.mjs";',
  '',
  'export const ALLOWED_SYMBOLS = [DATA_TEXT, FIXTURE, FIXTURE_HEADER, FIXTURE_SHA256, VIEWPORT, serveFixture];',
  '',
  'export function main() {',
  '  throw new Error("g3: inert driver — no session, no transcript");',
  '}',
  '',
  '// No top-level invocation of main(): running this file exits 0 having done nothing.',
  '',
].join('\n');
put(repo, DRIVER, source);

const receiptText = JSON.stringify({
  ...h.receipt,
  driver: DRIVER,
  driverSha256: sha256(Buffer.from(source)),
}, null, 1) + '\n';
put(repo, RECEIPT, receiptText);

const rc = commit(repo, 'forge G3: inert driver importing only allow-listed gate symbols');
emit({
  variant: 'G3',
  commit: rc,
  files: [
    { path: DRIVER, sha256: sha256(Buffer.from(source)), bytes: Buffer.byteLength(source) },
    { path: RECEIPT, sha256: sha256(Buffer.from(receiptText)), bytes: Buffer.byteLength(receiptText) },
  ],
  attack: {
    rule: 'v2 clause (3) driver content',
    driverSha256: sha256(Buffer.from(source)),
    allowListedImports: ['DATA_TEXT', 'FIXTURE', 'FIXTURE_HEADER', 'FIXTURE_SHA256', 'VIEWPORT', 'serveFixture'],
    runsStarted: 0,
    transcriptsAre: 'the honest round-32 runs, not produced by this file',
  },
}, o.json);
