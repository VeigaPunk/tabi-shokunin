import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const revision = '93bfead1f5f25f584353df3152a60209bbd89a2e';
const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const runnerPath = 'corpus/evidence/round-18/routed/harm-runner.mjs';
const outputPath = path.join(repo, 'corpus/evidence/round-18/routed/harm-at-93bfead.json');
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const run = (command, args, options = {}) => spawnSync(command, args, {
  cwd: repo,
  encoding: null,
  maxBuffer: 128 * 1024 * 1024,
  ...options,
});
const check = (command, args, cwd = repo) => {
  const result = run(command, args, { cwd });
  if (result.error || result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed: ${result.error?.message ?? `status=${result.status}, signal=${result.signal}`}`);
  }
  return result.stdout;
};
const status = (sandbox) => check('git', ['-C', sandbox, 'status', '--porcelain'], repo).toString('utf8');
const hashAtRevision = (sandbox, revisionPath) => sha256(check('git', ['-C', sandbox, 'show', `${revision}:${revisionPath}`], repo));
const describeRun = (argv, cwd) => {
  const start = process.hrtime.bigint();
  const result = run(argv[0], argv.slice(1), {
    cwd,
    timeout: 900000,
  });
  const runtimeMs = Number(process.hrtime.bigint() - start) / 1e6;
  const stdout = result.stdout ?? Buffer.alloc(0);
  const stderr = result.stderr ?? Buffer.alloc(0);
  const stdoutText = stdout.toString('utf8');
  const lines = stdoutText.replace(/\r\n/g, '\n');
  const stdoutLines = lines === '' ? 0 : lines.split('\n').length - (lines.endsWith('\n') ? 1 : 0);
  const summaryLine = lines.split('\n').filter((line) => line.trim().length > 0).at(-1) ?? '';
  return {
    exit: result.status,
    signal: result.signal,
    timedOut: result.error?.code === 'ETIMEDOUT',
    runtimeMs,
    stdout: {
      bytes: stdout.length,
      sha256: sha256(stdout),
      lines: stdoutLines,
      summaryLine,
    },
    stderr: {
      bytes: stderr.length,
      sha256: sha256(stderr),
    },
    spawnError: result.error?.message ?? null,
  };
};
const determinismDetails = (runResult) => ({
  exit: runResult.exit,
  stdoutSha256: runResult.stdout.sha256,
  stderrSha256: runResult.stderr.sha256,
  runtimeMs: runResult.runtimeMs,
});

mkdirSync(path.dirname(outputPath), { recursive: true });
const sandbox = mkdtempSync(path.join(tmpdir(), 'tabi-r18-harm-at-'));
let receipt;
try {
  check('git', ['clone', '--no-hardlinks', repo, sandbox], repo);
  check('git', ['-C', sandbox, 'checkout', '-q', '--detach', revision], repo);
  check('git', ['-C', sandbox, 'update-ref', 'refs/heads/master', revision], repo);
  check('git', ['-C', sandbox, 'symbolic-ref', 'HEAD', 'refs/heads/master'], repo);

  const baselinePath = path.join(sandbox, '.ufo/waves/round-17/harm-baseline.json');
  const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
  if (!Array.isArray(baseline.gates) || baseline.gates.length !== 20) {
    throw new Error(`Expected 20 baseline gate entries, found ${baseline.gates?.length ?? 'none'}`);
  }

  const statusBefore = status(sandbox);
  const nodeVersion = check(baseline.gates[0].argv[0], ['--version'], repo).toString('utf8').trim();
  const gitVersion = check('git', ['--version'], repo).toString('utf8').trim();
  const gateScripts = [...new Set(baseline.gates.flatMap(({ argv }) => argv.filter((arg) => arg.startsWith('scripts/') && arg.endsWith('.mjs'))))].sort();
  const gateScriptsSha256 = Object.fromEntries(gateScripts.map((script) => [script, hashAtRevision(sandbox, script)]));

  const gates = baseline.gates.map((entry) => {
    const first = describeRun(entry.argv, sandbox);
    const second = describeRun(entry.argv, sandbox);
    return {
      gate: entry.gate,
      argv: entry.argv,
      cwd: sandbox,
      ...first,
      determinism: {
        runs: 2,
        deterministic: first.exit === second.exit
          && first.stdout.sha256 === second.stdout.sha256
          && first.stderr.sha256 === second.stderr.sha256,
        firstRun: determinismDetails(first),
        secondRun: determinismDetails(second),
      },
      baselineExit: entry.exit,
      equal: first.exit === entry.exit,
    };
  });
  const statusAfter = status(sandbox);
  const runnerBytes = readFileSync(fileURLToPath(import.meta.url));
  receipt = {
    schema: 'tabi-round18-harm-at-revision-v1',
    revision,
    measuredAt: new Date().toISOString(),
    producer: {
      path: runnerPath,
      sha256: sha256(runnerBytes),
    },
    baseline: {
      path: '.ufo/waves/round-17/harm-baseline.json',
      schema: baseline.schema,
      revision: baseline.baseline,
    },
    sandbox: {
      path: sandbox,
      preparation: 'git clone --no-hardlinks LANE S; git checkout -q --detach REV; git update-ref refs/heads/master REV; git symbolic-ref HEAD refs/heads/master',
      retention: 'removed after measurement',
      gitStatusPorcelainBefore: statusBefore,
      gitStatusPorcelainAfter: statusAfter,
      cleanBefore: statusBefore.length === 0,
      cleanAfter: statusAfter.length === 0,
    },
    node: nodeVersion,
    git: gitVersion,
    gitStatusPorcelainBefore: statusBefore,
    gitStatusPorcelainAfter: statusAfter,
    gateScriptsSha256,
    measurementMethod: 'Every baseline entry ran twice sequentially via this Node spawnSync runner (timeout 900000 ms, cwd=sandbox, inherited environment). Per-entry result fields record run 1; determinism compares run 1 and run 2 exit/stdout SHA-256/stderr SHA-256. No browser was launched by this measurement.',
    gates,
  };
} finally {
  rmSync(sandbox, { recursive: true, force: true });
}
receipt.sandbox.removedAfterMeasurement = !existsSync(sandbox);
writeFileSync(outputPath, `${JSON.stringify(receipt, null, 2)}\n`, { flag: 'wx' });
const equalCount = receipt.gates.filter((gate) => gate.equal).length;
const unequal = receipt.gates.filter((gate) => !gate.equal).map(({ gate, exit, baselineExit }) => ({ gate, exit, baselineExit }));
console.log(JSON.stringify({
  outputPath,
  revision,
  gateCount: receipt.gates.length,
  exitsEqualBaseline: equalCount,
  exitsDifferFromBaseline: unequal,
  nondeterministic: receipt.gates.filter((gate) => !gate.determinism.deterministic).map((gate) => gate.gate),
  statusBefore: receipt.sandbox.gitStatusPorcelainBefore,
  statusAfter: receipt.sandbox.gitStatusPorcelainAfter,
  sandboxRemoved: receipt.sandbox.removedAfterMeasurement,
}, null, 2));
