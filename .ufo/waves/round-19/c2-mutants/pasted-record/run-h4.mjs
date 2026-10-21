#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { basename, extname } from 'node:path';
import { runInNewContext } from 'node:vm';
import { fileURLToPath } from 'node:url';

const DIR = new URL('.', import.meta.url);
const ROOT = new URL('../../../../../', DIR);
const COUNTER = new URL('.ufo/waves/round-18/measure-c2.mjs', ROOT);
const RECEIPT = new URL('pasted-receipt.json', DIR);
const RESULTS = new URL('results.json', DIR);
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const counterBytes = readFileSync(COUNTER);
let source = counterBytes.toString('utf8');
const start = source.indexOf('const SCRIPT = ');
const end = source.lastIndexOf('\nprocess.exitCode = await entry();');
if (start < 0 || end <= start) throw new Error('counter extraction anchors unavailable');
source = source.slice(start, end);
source = source.replace('const SCRIPT = fileURLToPath(import.meta.url);', `const SCRIPT = ${JSON.stringify(fileURLToPath(COUNTER))};`);
source += '\nglobalThis.__c2Probe = { retainedCoverage, h4Hazard };\n';
const sandbox = { createHash, basename, extname };
runInNewContext(source, sandbox, { filename: fileURLToPath(COUNTER), timeout: 10000 });
const receiptBytes = readFileSync(RECEIPT);
const receipt = JSON.parse(receiptBytes.toString('utf8'));
const coverage = sandbox.__c2Probe.retainedCoverage(receipt);
const normal = {
  receipt,
  downloadCaseLineLive: true,
  liveDownloadFiles: [],
  tmpFiles: [],
  browserEvidence: null,
};
const h4 = sandbox.__c2Probe.h4Hazard(normal, coverage);
const result = {
  schema: 'tabi-r19-c2-pasted-h4-probe-v1',
  verdict: coverage.pass && h4.pass ? 'pass' : 'fail',
  counterSha256: sha256(counterBytes),
  pastedReceiptSha256: sha256(receiptBytes),
  coverage,
  h4,
  isolation: 'exact round-18 retainedCoverage and h4Hazard function bodies; receipt copied verbatim; normal run fields are the minimal passing shape; no browser-execution evidence is supplied',
};
const output = `${JSON.stringify(result)}\n`;
writeFileSync(RESULTS, output);
process.stdout.write(output);
