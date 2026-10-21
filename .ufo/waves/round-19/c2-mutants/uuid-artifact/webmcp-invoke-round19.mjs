#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// The round-18 counter patches this declaration for its watchdog probe.
const RUN_TIMEOUT_MS = 420000;
const SELF = fileURLToPath(import.meta.url);
const SCRIPT_DIR = dirname(SELF);
const ORIGINAL = join(SCRIPT_DIR, 'webmcp-invoke-round18.mjs');
const MUTANT_HARNESS = join(SCRIPT_DIR, '.r19-uuid-harness.mjs');
const source = readFileSync(ORIGINAL, 'utf8');
const scanNeedle = `        result.observations.afterContextClose = {\n          runTempDir: scanForBytes(runTempDir, marker),\n          processTmpdir: scanForBytes(processTmpDir, marker),\n          browserGone: run.run.gone === true,\n        };`;
if (source.split(scanNeedle).length !== 2) throw new Error('expected one after-context marker scan block');
const artifactInjection = `${scanNeedle}\n        const mutantGuid = randomBytes(16).toString('hex');\n        const artifactDir = join(processTmpDir, 'playwright-artifacts-' + randomBytes(16).toString('hex'));\n        mkdirSync(artifactDir, { recursive: true });\n        const artifactPath = join(artifactDir, mutantGuid);\n        writeFileSync(artifactPath, marker);\n        process.stderr.write('WEBMCP_C2_GUID_ARTIFACT ' + JSON.stringify({ path: artifactPath, guid: mutantGuid, markerSha256: sha256Text(marker) }) + '\\n');`;
writeFileSync(MUTANT_HARNESS, source.replace(scanNeedle, artifactInjection));

const child = spawn(process.execPath, [MUTANT_HARNESS, ...process.argv.slice(2)], {
  cwd: process.cwd(),
  env: process.env,
  stdio: ['ignore', 'pipe', 'pipe'],
  windowsHide: true,
});
child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);
for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
  process.on(signal, () => {
    if (child.exitCode === null && child.signalCode === null) child.kill(signal);
  });
}
const close = await new Promise((resolvePromise) => {
  child.once('close', (code, signal) => resolvePromise({ code, signal }));
});
if (close.code === 0) {
  const outIndex = process.argv.indexOf('--out');
  if (outIndex < 0 || !process.argv[outIndex + 1]) throw new Error('round-18 counter omitted --out');
  const outPath = process.argv[outIndex + 1];
  const receipt = JSON.parse(readFileSync(outPath, 'utf8'));
  const digest = createHash('sha256').update(readFileSync(SELF)).digest('hex');
  const producerPath = relative(process.cwd(), SELF).split(sep).join('/');
  receipt.producer = { ...(receipt.producer ?? {}), path: producerPath, sha256: digest };
  receipt.producerSha256 = digest;
  writeFileSync(outPath, `${JSON.stringify(receipt, null, 2)}\n`);
}
process.exitCode = close.code ?? (close.signal ? 128 : 1);
