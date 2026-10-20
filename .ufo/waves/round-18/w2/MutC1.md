VERDICT: ISSUES

# MutC1 — finite counter-forgery probes

Assigned leaf: `TabiR18.MutC1-2`. FALSIFY only; no claim admission, repair, integration, shipping or sibling/runtime invocation. Measured candidate `530f40a9bc3f10436161a2af1ca0fe9bffffc004`; round baseline `2bff864fdfee684ddbcd066cc8e735adaba2735c` is context, not the pristine control used here. Pristine controls are the measured candidate.

## Axes and finite scope

- **Freshness / false-credit resistance:** which counterfeit receipt inputs the unchanged C1 counter excludes.
- **Calibration / bounded trust:** distinguish a rejected forged body digest from ignored metadata; do not turn an offline integrity count into remote authentication.
- **Operability / isolation:** separate single-boundary sandbox commits, 30-second detector deadlines, exact restoration after every committed mutant, no production or index writes.

Observed: **7 mutants KILLED, 3 SURVIVED, 0 inconclusive completed probes**. Every completed pristine/mutant/restored detector process exited 0; rejection is expressed in JSON, not a nonzero process status. Every pristine/restored run counted 51 with zero rejected receipts. The three survivors are coverage/trust findings, not a decision that the declared C1 claim fails. No contract was changed.

## Which forgeries count?

1. **Forged S029 command counts (51 remains 51; own_work remains 1).** Replacing its command with `printf 'forged own-work body' # no pinned Git-object read` is ignored. This does **not** demonstrate forged own-work bytes counting: the separate 64-zero SHA mutant is rejected. The counter independently binds S029 bytes/length/quote/excerpt to the pinned object. The command is unvalidated metadata, not evidence of executed argv. See `.ufo/waves/round-18/measure-c1.mjs:343-350,371-376`; `corpus/evidence/round-18/source-recheck/S029.json:7`.
2. **An HTML-script-only forged excerpt with a matching recomputed excerpt hash counts (51 remains 51).** The producer's unchanged `--normalize-only --decode html-text` returns found=false on those exact mutant excerpt bytes, while the counter accepts them. Its offline check calls only `normalize(excerpt)` rather than HTML decoding, relying on the producer having already made a genuine normalized excerpt. This shows a finite locally demonstrable producer/excerpt-consistency gap, **not** that Playwright's real page lacks the quote. Original raw-response SHA and URL are copied metadata in this test; no forged remote response or live failure is claimed. See counter `:368-369`, producer `.ufo/waves/round-18/recheck-fetch.mjs:24-33,103-109`; mutant excerpt `corpus/evidence/round-18/source-recheck/S016.excerpt.txt:1`, receipt `S016.json:11,19`.
3. **Invalid SOURCES status counts (51 remains 51).** The histogram reports `not-a-status:1` instead of rejecting the row. C1 parses status for classification, not schema validation. That enum belongs to the broader source-registry contract; no structural census/check-sources result was exercised or claimed. See counter `:137-148,268-273,315-377`; `corpus/SOURCES.md:30`.

The unrelated fetch URL (even with original rowUrl and a canonical-looking command), forged S029 digest, mismatched cached excerpt with a copied hash, drift without supersession, HTTP 404, duplicate source id and duplicate receipt id do not count. Full sources, commit identities, argv, actual stdout, exit codes and restoration digests follow.

## Setup, versions and bounds

Production lane read-only: `/home/vgpnk/Projects/shokunin/tabi-shokunin`. All non-report writes were confined to private sandbox `/tmp/tabi-r18-MutC1-2-dLHMks`. No git/jj write occurred in the lane or fleet. No browser, public GET, real-site page invocation, install/update, service change, delegation, push, or detector self-test occurred. Tools already available: Node `v24.21.0`, Git `2.56.0`. Install/update record: none.

Initial exact shell commands (exit 0):

```sh
mktemp -d /tmp/tabi-r18-MutC1-2-XXXXXX
# stdout: /tmp/tabi-r18-MutC1-2-dLHMks
git clone --no-hardlinks --no-checkout /home/vgpnk/Projects/shokunin/tabi-shokunin /tmp/tabi-r18-MutC1-2-dLHMks/repo && git -C /tmp/tabi-r18-MutC1-2-dLHMks/repo checkout --detach 530f40a9bc3f10436161a2af1ca0fe9bffffc004
# output: Cloning into ...; done.; HEAD is now at 530f40a round-18: source rechecks, guarded harness, routed correction evidence and build wave
git --version && node --version
# stdout: git version 2.56.0
# v24.21.0
```

For each completed experiment: commit only the named paths in the sandbox; measure pristine candidate, separate mutant commit, then restored candidate using exactly the same physical counter and options. A detector invocation has timeout 30000 ms and maxBuffer 8 MiB; git subprocesses have timeout 10000 ms. Each outer recorder command was bounded to 150 seconds. `TMPDIR=/tmp/tabi-r18-MutC1-2-dLHMks/tmp` and `GIT_TERMINAL_PROMPT=0` were used by the recorder. No --live flag was run: every counter output has `live:null`. These are ten fixed mutations, not a security/authentication proof or an exhaustive input campaign.

Immutable executable SHA-256 throughout all ten probes:

```text
df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234  .ufo/waves/round-18/measure-c1.mjs
f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360  .ufo/waves/round-18/recheck-fetch.mjs
```

## Outcome summary

| Mutant | Separate sandbox commit | Pristine → mutant → restored count | Verdict | Observed rejection |
|---|---|---|---|---|
| url-unrelated | `0e3f1db767b844cbc3fe96920d1912fb93095a4b` | 51 → 50 → 51 | KILLED | fetch URL does not match row URL |
| own-work-sha | `b0fef1fd885d12f50c9f2782fc93d77841e6dfc5` | 51 → 50 → 51 | KILLED | S029 sha256 does not match pinned git object |
| own-work-command | `11c9aaed75606433377be652b01533a634d78a2b` | 51 → 51 → 51 | SURVIVED | none |
| excerpt-copied-hash | `25cb2c84d05ee13e68f367127d114aab4438615c` | 51 → 50 → 51 | KILLED | excerpt sha mismatch |
| quote-script-only | `3350e5f9276a712e6e1949b64373543ee8f9f4b3` | 51 → 51 → 51 | SURVIVED | none |
| drift-unsuperseded | `5e6007b81522310de1f194da0e54fe21cf12b748` | 51 → 50 → 51 | KILLED | drift without superseding row |
| http-status | `cb3e6060f0f9a6805373df93dcdb50918bc70cf9` | 51 → 50 → 51 | KILLED | httpStatus != 200 |
| source-status | `8fa637bb3c9840c7e9da68b6b369a12ebc0335c3` | 51 → 51 → 51 | SURVIVED | none |
| duplicate-source | `f9d57088c002a1c2b472f741b6a02e311d387848` | 51 → 50 → 51 | KILLED | duplicate source row |
| duplicate-receipt | `6d59cd0c109359efb06a4380c709a642e6d0b603` | 51 → 50 → 51 | KILLED | duplicate row receipt; duplicate row receipt |

## Preserved recorder source

This is the final recorder actually used for the ten completed probes, saved in the sandbox as `/tmp/tabi-r18-MutC1-2-dLHMks/capture.mjs`. It does not mutate receipt fields: the minimal input patches below were applied separately before each invocation. It reads committed inputs, records complete output, commits only explicit paths, and switches cleanly back to the original candidate in finally. To reproduce after sandbox removal, recreate a private clone at the shown path (or substitute a different private root in this source), restore this source, apply one preserved diff at a time with git apply, and invoke the corresponding recorded command. Commit IDs can differ with author timestamps; input hashes and counter outputs excluding rev identify the same experiment.

```js
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = '/tmp/tabi-r18-MutC1-2-dLHMks';
const repo = join(root, 'repo');
const base = '530f40a9bc3f10436161a2af1ca0fe9bffffc004';
const counter = join(repo, '.ufo/waves/round-18/measure-c1.mjs');
const [name, expectedReason, ...paths] = process.argv.slice(2);
if (!name || !expectedReason || paths.length === 0) throw new Error('name, reason and paths required');
const digest = b => createHash('sha256').update(b).digest('hex');
const transcript = [];
mkdirSync(join(root, 'tmp'), { recursive: true });
const env = { ...process.env, TMPDIR: join(root, 'tmp'), GIT_TERMINAL_PROMPT: '0' };
function run(command, args, timeout = 10000) {
  const r = spawnSync(command, args, { cwd: repo, env, encoding: 'utf8', timeout, maxBuffer: 8 * 1024 * 1024 });
  const out = { argv: [command, ...args], cwd: repo, timeoutMs: timeout, exit: r.status, signal: r.signal, error: r.error?.message ?? null, stdout: r.stdout ?? '', stderr: r.stderr ?? '' };
  transcript.push(out);
  return out;
}
function git(args) { return run('git', ['-C', repo, ...args]); }
function need(out) {
  if (out.exit !== 0) throw new Error(JSON.stringify(out));
  return out.stdout.trim();
}
function measure(rev) {
  const out = run(process.execPath, [counter, rev, '--lane', repo], 30000);
  let parsed = null;
  try { parsed = JSON.parse(out.stdout); } catch {}
  return { ...out, parsed };
}
const before = {};
const mutated = {};
for (const path of paths) {
  const original = git(['show', '--no-ext-diff', '--no-textconv', `${base}:${path}`]);
  before[path] = original.exit === 0 ? digest(Buffer.from(original.stdout)) : null;
  mutated[path] = digest(readFileSync(join(repo, path)));
}
const counterBefore = digest(readFileSync(counter));
const baseline = measure(base);
if (baseline.exit !== 0 || baseline.parsed?.c1_rows_rechecked !== 51 || baseline.parsed?.rejected?.length !== 0) throw new Error(`pristine detector inconclusive: ${JSON.stringify(baseline)}`);
need(git(['add', '--', ...paths]));
need(git(['-c', 'user.name=TabiR18.MutC1-2', '-c', 'user.email=mutc1@tabi.invalid', '-c', 'commit.gpgsign=false', '-c', 'core.hooksPath=/dev/null', 'commit', '--quiet', '-m', `falsify C1 ${name}`, '--', ...paths]));
const commit = need(git(['rev-parse', '--verify', 'HEAD']));
let mutant;
let patch;
let restored;
let after;
let counterAfter;
try {
  mutant = measure(commit);
  patch = need(git(['show', '--format=', '--no-ext-diff', '--no-textconv', '--binary', commit, '--', ...paths]));
} finally {
  need(git(['switch', '--detach', base]));
  after = Object.fromEntries(paths.map(path => [path, existsSync(join(repo, path)) ? digest(readFileSync(join(repo, path))) : null]));
  counterAfter = digest(readFileSync(counter));
  restored = measure(base);
}
const restoredExactly = Object.keys(before).every(path => before[path] === after[path]) && counterBefore === counterAfter;
const pristineOk = [baseline, restored].every(out => out.exit === 0 && out.parsed?.c1_rows_rechecked === 51 && out.parsed?.rejected?.length === 0);
const detected = mutant.exit === 0 && mutant.parsed?.c1_rows_rechecked === 50 && mutant.parsed?.rejected?.some(r => r.reason === expectedReason);
const survived = mutant.exit === 0 && mutant.parsed?.c1_rows_rechecked === 51 && mutant.parsed?.rejected?.length === 0;
const verdict = !pristineOk || !restoredExactly ? 'INCONCLUSIVE' : detected ? 'KILLED' : survived ? 'SURVIVED' : 'INCONCLUSIVE';
const result = { name, base, commit, expectedReason, verdict, node: process.version, counterBefore, counterAfter, hashes: { before, mutated, after }, restoredExactly, baseline, mutant, restored, patch, transcript };
const resultPath = join(root, `${name}.json`);
writeFileSync(resultPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ name, commit, verdict, counts: [baseline.parsed?.c1_rows_rechecked, mutant.parsed?.c1_rows_rechecked, restored.parsed?.c1_rows_rechecked], rejections: mutant.parsed?.rejected, hashes: result.hashes, restoredExactly, resultPath }));
if (!restoredExactly) process.exitCode = 2;
```

## Per-mutant source and actual detector observations

### url-unrelated — KILLED

**Mutant:** S016 url and its canonical curl-command string point to test-retries; original rowUrl remains test-assertions.

**Expected detector:** Count 50 and reject S016 for fetch URL/source mismatch.

**Committed mutation:** `0e3f1db767b844cbc3fe96920d1912fb93095a4b`, directly based on `530f40a9bc3f10436161a2af1ca0fe9bffffc004`.

Outer exact shell command (exit 0):

```sh
node /tmp/tabi-r18-MutC1-2-dLHMks/capture.mjs url-unrelated 'fetch URL does not match row URL' corpus/evidence/round-18/source-recheck/S016.json
```

Preserved mutation source (git diff against the pristine parent):

```diff
diff --git a/corpus/evidence/round-18/source-recheck/S016.json b/corpus/evidence/round-18/source-recheck/S016.json
index 8f48cd8..917d7b4 100644
--- a/corpus/evidence/round-18/source-recheck/S016.json
+++ b/corpus/evidence/round-18/source-recheck/S016.json
@@ -2,9 +2,9 @@
   "schema": "tabi-source-recheck-v1",
   "row": "S016",
   "rowUrl": "https://playwright.dev/docs/test-assertions",
-  "url": "https://playwright.dev/docs/test-assertions",
+  "url": "https://playwright.dev/docs/test-retries",
   "fetchedAt": "2026-10-20T19:05:48.990Z",
-  "command": "curl -sSL --compressed --max-time 90 -A Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18 -o <tmp>/body -w %{http_code} 'https://playwright.dev/docs/test-assertions'",
+  "command": "curl -sSL --compressed --max-time 90 -A Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18 -o <tmp>/body -w %{http_code} 'https://playwright.dev/docs/test-retries'",
   "httpStatus": 200,
   "bytes": 159543,
   "sha256": "1bb8afe888af092190125a3d5a6aef753fb17312c0c0b774d296060ac0766a2c",
```

SHA-256 restoration evidence; paths below are relative to the private sandbox repo `/tmp/tabi-r18-MutC1-2-dLHMks/repo`. `absent` is an observed missing file, not an omitted digest.

| Input | Before | Mutated | Restored |
|---|---|---|---|
| `corpus/evidence/round-18/source-recheck/S016.json` | `1ef6ff4c1260a3036078df029ce1108ed86b0053a8106e4117f2f4c89d1c3a3d` | `0092b18d92bb297b2d69e2453810f6de4bea459df0b6b844027848fb35d70f44` | `1ef6ff4c1260a3036078df029ce1108ed86b0053a8106e4117f2f4c89d1c3a3d` |

Counter before/after SHA-256: `df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234` / `df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234`. Exact affected-input restoration: **true**.

**baseline:** exact argv (JSON array), cwd `/tmp/tabi-r18-MutC1-2-dLHMks/repo`, timeout 30000 ms; exit **0**, signal `null`, process error `null`; stderr "".

```json
["/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node","/tmp/tabi-r18-MutC1-2-dLHMks/repo/.ufo/waves/round-18/measure-c1.mjs","530f40a9bc3f10436161a2af1ca0fe9bffffc004","--lane","/tmp/tabi-r18-MutC1-2-dLHMks/repo"]
```

Actual stdout (one JSON line, terminated by LF):

```json
{"rev":"530f40a9bc3f10436161a2af1ca0fe9bffffc004","freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate","c1_rows_rechecked":51,"eligible_rows":58,"held":50,"drift_superseded":0,"own_work":1,"row_classes":{"kind":{"code":12,"community":5,"docs":37,"own-work":1,"paper":3,"spec":4,"tool":2},"status":{"mined":48,"queued":8,"rejected":8},"url":{"immutable_pinned":17,"living_live":46,"own_work":1}},"rejected":[],"live":null,"counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
```

**mutant:** exact argv (JSON array), cwd `/tmp/tabi-r18-MutC1-2-dLHMks/repo`, timeout 30000 ms; exit **0**, signal `null`, process error `null`; stderr "".

```json
["/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node","/tmp/tabi-r18-MutC1-2-dLHMks/repo/.ufo/waves/round-18/measure-c1.mjs","0e3f1db767b844cbc3fe96920d1912fb93095a4b","--lane","/tmp/tabi-r18-MutC1-2-dLHMks/repo"]
```

Actual stdout (one JSON line, terminated by LF):

```json
{"rev":"0e3f1db767b844cbc3fe96920d1912fb93095a4b","freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate","c1_rows_rechecked":50,"eligible_rows":58,"held":49,"drift_superseded":0,"own_work":1,"row_classes":{"kind":{"code":12,"community":5,"docs":37,"own-work":1,"paper":3,"spec":4,"tool":2},"status":{"mined":48,"queued":8,"rejected":8},"url":{"immutable_pinned":17,"living_live":46,"own_work":1}},"rejected":[{"file":"corpus/evidence/round-18/source-recheck/S016.json","reason":"fetch URL does not match row URL"}],"live":null,"counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
```

**restored:** exact argv (JSON array), cwd `/tmp/tabi-r18-MutC1-2-dLHMks/repo`, timeout 30000 ms; exit **0**, signal `null`, process error `null`; stderr "".

```json
["/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node","/tmp/tabi-r18-MutC1-2-dLHMks/repo/.ufo/waves/round-18/measure-c1.mjs","530f40a9bc3f10436161a2af1ca0fe9bffffc004","--lane","/tmp/tabi-r18-MutC1-2-dLHMks/repo"]
```

Actual stdout (one JSON line, terminated by LF):

```json
{"rev":"530f40a9bc3f10436161a2af1ca0fe9bffffc004","freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate","c1_rows_rechecked":51,"eligible_rows":58,"held":50,"drift_superseded":0,"own_work":1,"row_classes":{"kind":{"code":12,"community":5,"docs":37,"own-work":1,"paper":3,"spec":4,"tool":2},"status":{"mined":48,"queued":8,"rejected":8},"url":{"immutable_pinned":17,"living_live":46,"own_work":1}},"rejected":[],"live":null,"counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
```

### own-work-sha — KILLED

**Mutant:** Replace only S029 sha256 with 64 zeroes; pinned bytes, excerpt and command are unchanged.

**Expected detector:** Count 50 and reject the forged pinned-object digest.

**Committed mutation:** `b0fef1fd885d12f50c9f2782fc93d77841e6dfc5`, directly based on `530f40a9bc3f10436161a2af1ca0fe9bffffc004`.

Outer exact shell command (exit 0):

```sh
node /tmp/tabi-r18-MutC1-2-dLHMks/capture.mjs own-work-sha 'S029 sha256 does not match pinned git object' corpus/evidence/round-18/source-recheck/S029.json
```

Preserved mutation source (git diff against the pristine parent):

```diff
diff --git a/corpus/evidence/round-18/source-recheck/S029.json b/corpus/evidence/round-18/source-recheck/S029.json
index 9a39e0f..041ef9b 100644
--- a/corpus/evidence/round-18/source-recheck/S029.json
+++ b/corpus/evidence/round-18/source-recheck/S029.json
@@ -7,7 +7,7 @@
   "command": "git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show 837b33a3988ebeea7f6b4ef5c04698da88909a73:corpus/evidence/round-13/aria/receipt.json",
   "httpStatus": null,
   "bytes": 97073,
-  "sha256": "b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7",
+  "sha256": "0000000000000000000000000000000000000000000000000000000000000000",
   "decode": "none",
   "normalizer": "recheck-fetch.mjs normalize(): NFC, curly quotes/dashes folded, whitespace runs collapsed",
   "quote": "\"listeningAfter\": true, \"refusedAfterClose\": true, \"ok\": true, \"perWorker\": [ { \"origin\": \"http://127.0.0.1:40983\", \"listeningBefore\": true, \"closed\": true, \"listeningAfter\": false,",
```

SHA-256 restoration evidence; paths below are relative to the private sandbox repo `/tmp/tabi-r18-MutC1-2-dLHMks/repo`. `absent` is an observed missing file, not an omitted digest.

| Input | Before | Mutated | Restored |
|---|---|---|---|
| `corpus/evidence/round-18/source-recheck/S029.json` | `d01f6c970416024f6ea156229015e806e84bd364538165b914b833c73fd7b860` | `b2a76f24a85460e0203cecdbef23fa71f0eba57b014f161fd33fbd41d9993589` | `d01f6c970416024f6ea156229015e806e84bd364538165b914b833c73fd7b860` |

Counter before/after SHA-256: `df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234` / `df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234`. Exact affected-input restoration: **true**.

**baseline:** exact argv (JSON array), cwd `/tmp/tabi-r18-MutC1-2-dLHMks/repo`, timeout 30000 ms; exit **0**, signal `null`, process error `null`; stderr "".

```json
["/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node","/tmp/tabi-r18-MutC1-2-dLHMks/repo/.ufo/waves/round-18/measure-c1.mjs","530f40a9bc3f10436161a2af1ca0fe9bffffc004","--lane","/tmp/tabi-r18-MutC1-2-dLHMks/repo"]
```

Actual stdout (one JSON line, terminated by LF):

```json
{"rev":"530f40a9bc3f10436161a2af1ca0fe9bffffc004","freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate","c1_rows_rechecked":51,"eligible_rows":58,"held":50,"drift_superseded":0,"own_work":1,"row_classes":{"kind":{"code":12,"community":5,"docs":37,"own-work":1,"paper":3,"spec":4,"tool":2},"status":{"mined":48,"queued":8,"rejected":8},"url":{"immutable_pinned":17,"living_live":46,"own_work":1}},"rejected":[],"live":null,"counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
```

**mutant:** exact argv (JSON array), cwd `/tmp/tabi-r18-MutC1-2-dLHMks/repo`, timeout 30000 ms; exit **0**, signal `null`, process error `null`; stderr "".

```json
["/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node","/tmp/tabi-r18-MutC1-2-dLHMks/repo/.ufo/waves/round-18/measure-c1.mjs","b0fef1fd885d12f50c9f2782fc93d77841e6dfc5","--lane","/tmp/tabi-r18-MutC1-2-dLHMks/repo"]
```

Actual stdout (one JSON line, terminated by LF):

```json
{"rev":"b0fef1fd885d12f50c9f2782fc93d77841e6dfc5","freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate","c1_rows_rechecked":50,"eligible_rows":58,"held":50,"drift_superseded":0,"own_work":0,"row_classes":{"kind":{"code":12,"community":5,"docs":37,"own-work":1,"paper":3,"spec":4,"tool":2},"status":{"mined":48,"queued":8,"rejected":8},"url":{"immutable_pinned":17,"living_live":46,"own_work":1}},"rejected":[{"file":"corpus/evidence/round-18/source-recheck/S029.json","reason":"S029 sha256 does not match pinned git object"}],"live":null,"counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
```

**restored:** exact argv (JSON array), cwd `/tmp/tabi-r18-MutC1-2-dLHMks/repo`, timeout 30000 ms; exit **0**, signal `null`, process error `null`; stderr "".

```json
["/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node","/tmp/tabi-r18-MutC1-2-dLHMks/repo/.ufo/waves/round-18/measure-c1.mjs","530f40a9bc3f10436161a2af1ca0fe9bffffc004","--lane","/tmp/tabi-r18-MutC1-2-dLHMks/repo"]
```

Actual stdout (one JSON line, terminated by LF):

```json
{"rev":"530f40a9bc3f10436161a2af1ca0fe9bffffc004","freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate","c1_rows_rechecked":51,"eligible_rows":58,"held":50,"drift_superseded":0,"own_work":1,"row_classes":{"kind":{"code":12,"community":5,"docs":37,"own-work":1,"paper":3,"spec":4,"tool":2},"status":{"mined":48,"queued":8,"rejected":8},"url":{"immutable_pinned":17,"living_live":46,"own_work":1}},"rejected":[],"live":null,"counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
```

### own-work-command — SURVIVED

**Mutant:** Replace only S029 command with a printf description; all pinned bytes/digests stay valid. The string is never executed.

**Expected detector:** A provenance-attesting detector would reject the command; this is not a promised S029 predicate in the frozen C1 rules.

**Committed mutation:** `11c9aaed75606433377be652b01533a634d78a2b`, directly based on `530f40a9bc3f10436161a2af1ca0fe9bffffc004`.

Outer exact shell command (exit 0):

```sh
node /tmp/tabi-r18-MutC1-2-dLHMks/capture.mjs own-work-command 'own-work command must identify pinned Git-object read' corpus/evidence/round-18/source-recheck/S029.json
```

Preserved mutation source (git diff against the pristine parent):

```diff
diff --git a/corpus/evidence/round-18/source-recheck/S029.json b/corpus/evidence/round-18/source-recheck/S029.json
index 9a39e0f..3d60f43 100644
--- a/corpus/evidence/round-18/source-recheck/S029.json
+++ b/corpus/evidence/round-18/source-recheck/S029.json
@@ -4,7 +4,7 @@
   "rowUrl": "corpus/evidence/round-13/aria/receipt.json",
   "url": "corpus/evidence/round-13/aria/receipt.json",
   "fetchedAt": "2026-10-20T19:06:54.809Z",
-  "command": "git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show 837b33a3988ebeea7f6b4ef5c04698da88909a73:corpus/evidence/round-13/aria/receipt.json",
+  "command": "printf 'forged own-work body' # no pinned Git-object read",
   "httpStatus": null,
   "bytes": 97073,
   "sha256": "b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7",
```

SHA-256 restoration evidence; paths below are relative to the private sandbox repo `/tmp/tabi-r18-MutC1-2-dLHMks/repo`. `absent` is an observed missing file, not an omitted digest.

| Input | Before | Mutated | Restored |
|---|---|---|---|
| `corpus/evidence/round-18/source-recheck/S029.json` | `d01f6c970416024f6ea156229015e806e84bd364538165b914b833c73fd7b860` | `c5a7d791250470099cdf11d88678663393923983595ccacae42a7913b8136f9d` | `d01f6c970416024f6ea156229015e806e84bd364538165b914b833c73fd7b860` |

Counter before/after SHA-256: `df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234` / `df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234`. Exact affected-input restoration: **true**.

**baseline:** exact argv (JSON array), cwd `/tmp/tabi-r18-MutC1-2-dLHMks/repo`, timeout 30000 ms; exit **0**, signal `null`, process error `null`; stderr "".

```json
["/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node","/tmp/tabi-r18-MutC1-2-dLHMks/repo/.ufo/waves/round-18/measure-c1.mjs","530f40a9bc3f10436161a2af1ca0fe9bffffc004","--lane","/tmp/tabi-r18-MutC1-2-dLHMks/repo"]
```

Actual stdout (one JSON line, terminated by LF):

```json
{"rev":"530f40a9bc3f10436161a2af1ca0fe9bffffc004","freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate","c1_rows_rechecked":51,"eligible_rows":58,"held":50,"drift_superseded":0,"own_work":1,"row_classes":{"kind":{"code":12,"community":5,"docs":37,"own-work":1,"paper":3,"spec":4,"tool":2},"status":{"mined":48,"queued":8,"rejected":8},"url":{"immutable_pinned":17,"living_live":46,"own_work":1}},"rejected":[],"live":null,"counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
```

**mutant:** exact argv (JSON array), cwd `/tmp/tabi-r18-MutC1-2-dLHMks/repo`, timeout 30000 ms; exit **0**, signal `null`, process error `null`; stderr "".

```json
["/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node","/tmp/tabi-r18-MutC1-2-dLHMks/repo/.ufo/waves/round-18/measure-c1.mjs","11c9aaed75606433377be652b01533a634d78a2b","--lane","/tmp/tabi-r18-MutC1-2-dLHMks/repo"]
```

Actual stdout (one JSON line, terminated by LF):

```json
{"rev":"11c9aaed75606433377be652b01533a634d78a2b","freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate","c1_rows_rechecked":51,"eligible_rows":58,"held":50,"drift_superseded":0,"own_work":1,"row_classes":{"kind":{"code":12,"community":5,"docs":37,"own-work":1,"paper":3,"spec":4,"tool":2},"status":{"mined":48,"queued":8,"rejected":8},"url":{"immutable_pinned":17,"living_live":46,"own_work":1}},"rejected":[],"live":null,"counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
```

**restored:** exact argv (JSON array), cwd `/tmp/tabi-r18-MutC1-2-dLHMks/repo`, timeout 30000 ms; exit **0**, signal `null`, process error `null`; stderr "".

```json
["/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node","/tmp/tabi-r18-MutC1-2-dLHMks/repo/.ufo/waves/round-18/measure-c1.mjs","530f40a9bc3f10436161a2af1ca0fe9bffffc004","--lane","/tmp/tabi-r18-MutC1-2-dLHMks/repo"]
```

Actual stdout (one JSON line, terminated by LF):

```json
{"rev":"530f40a9bc3f10436161a2af1ca0fe9bffffc004","freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate","c1_rows_rechecked":51,"eligible_rows":58,"held":50,"drift_superseded":0,"own_work":1,"row_classes":{"kind":{"code":12,"community":5,"docs":37,"own-work":1,"paper":3,"spec":4,"tool":2},"status":{"mined":48,"queued":8,"rejected":8},"url":{"immutable_pinned":17,"living_live":46,"own_work":1}},"rejected":[],"live":null,"counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
```

### excerpt-copied-hash — KILLED

**Mutant:** Replace S016 excerpt by a different one-line context retaining the quote, and leave the copied original excerptSha256 unchanged.

**Expected detector:** Count 50 and reject the excerpt/hash mismatch.

**Committed mutation:** `25cb2c84d05ee13e68f367127d114aab4438615c`, directly based on `530f40a9bc3f10436161a2af1ca0fe9bffffc004`.

Outer exact shell command (exit 0):

```sh
node /tmp/tabi-r18-MutC1-2-dLHMks/capture.mjs excerpt-copied-hash 'excerpt sha mismatch' corpus/evidence/round-18/source-recheck/S016.excerpt.txt
```

Preserved mutation source (git diff against the pristine parent):

```diff
diff --git a/corpus/evidence/round-18/source-recheck/S016.excerpt.txt b/corpus/evidence/round-18/source-recheck/S016.excerpt.txt
index 2d66dc4..719b146 100644
--- a/corpus/evidence/round-18/source-recheck/S016.excerpt.txt
+++ b/corpus/evidence/round-18/source-recheck/S016.excerpt.txt
@@ -1 +1 @@
-vigations Network Other locators Pages Page object models Screenshots Service Workers Snapshot testing Test generator Touch events (legacy) Trace viewer Videos Visual comparisons WebView2 Migration Integrations Supported languages Guides Assertions On this page Assertions Introduction ​ Playwright includes test assertions in the form of expect function. To make an assertion, call expect(value) and choose a matcher that reflects the expectation. There are many generic matchers like toEqual , toContain , toBeTruthy that can be used to assert any conditions. expect ( success ) . toBeTruthy ( ) ; Playwright also includes web-specific async matchers that will wait until the expected condition is met. Consider the following example: await expect ( page . getByTestId ( 'status' ) ) . toHaveText ( 'Submitted' ) ; Playwright will be re-testing the element with the test id of status until the fetched element has the "Submitted" text. It will re-fetch the element and check it over and over, until the condition is met or until the timeout is reached. You can either pass this timeout or configure it once via the testConfig.expect value in the test config. By default, the timeout for assertions is set to 5 seconds. Learn more about various timeouts . Auto-retrying assertions ​ The following assert
+Unrelated cached page: Playwright also includes web-specific async matchers that will wait until the expected condition is met.
```

SHA-256 restoration evidence; paths below are relative to the private sandbox repo `/tmp/tabi-r18-MutC1-2-dLHMks/repo`. `absent` is an observed missing file, not an omitted digest.

| Input | Before | Mutated | Restored |
|---|---|---|---|
| `corpus/evidence/round-18/source-recheck/S016.excerpt.txt` | `809411872b896d6cfe0bc5c469a8992cea3acb75fcd2ea02dfb208ffb2ca9a01` | `71913c9cf57610ccf7969c447b741b52b42389d005f0fe2575f309138a7cbcb4` | `809411872b896d6cfe0bc5c469a8992cea3acb75fcd2ea02dfb208ffb2ca9a01` |

Counter before/after SHA-256: `df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234` / `df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234`. Exact affected-input restoration: **true**.

**baseline:** exact argv (JSON array), cwd `/tmp/tabi-r18-MutC1-2-dLHMks/repo`, timeout 30000 ms; exit **0**, signal `null`, process error `null`; stderr "".

```json
["/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node","/tmp/tabi-r18-MutC1-2-dLHMks/repo/.ufo/waves/round-18/measure-c1.mjs","530f40a9bc3f10436161a2af1ca0fe9bffffc004","--lane","/tmp/tabi-r18-MutC1-2-dLHMks/repo"]
```

Actual stdout (one JSON line, terminated by LF):

```json
{"rev":"530f40a9bc3f10436161a2af1ca0fe9bffffc004","freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate","c1_rows_rechecked":51,"eligible_rows":58,"held":50,"drift_superseded":0,"own_work":1,"row_classes":{"kind":{"code":12,"community":5,"docs":37,"own-work":1,"paper":3,"spec":4,"tool":2},"status":{"mined":48,"queued":8,"rejected":8},"url":{"immutable_pinned":17,"living_live":46,"own_work":1}},"rejected":[],"live":null,"counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
```

**mutant:** exact argv (JSON array), cwd `/tmp/tabi-r18-MutC1-2-dLHMks/repo`, timeout 30000 ms; exit **0**, signal `null`, process error `null`; stderr "".

```json
["/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node","/tmp/tabi-r18-MutC1-2-dLHMks/repo/.ufo/waves/round-18/measure-c1.mjs","25cb2c84d05ee13e68f367127d114aab4438615c","--lane","/tmp/tabi-r18-MutC1-2-dLHMks/repo"]
```

Actual stdout (one JSON line, terminated by LF):

```json
{"rev":"25cb2c84d05ee13e68f367127d114aab4438615c","freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate","c1_rows_rechecked":50,"eligible_rows":58,"held":49,"drift_superseded":0,"own_work":1,"row_classes":{"kind":{"code":12,"community":5,"docs":37,"own-work":1,"paper":3,"spec":4,"tool":2},"status":{"mined":48,"queued":8,"rejected":8},"url":{"immutable_pinned":17,"living_live":46,"own_work":1}},"rejected":[{"file":"corpus/evidence/round-18/source-recheck/S016.json","reason":"excerpt sha mismatch"}],"live":null,"counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
```

**restored:** exact argv (JSON array), cwd `/tmp/tabi-r18-MutC1-2-dLHMks/repo`, timeout 30000 ms; exit **0**, signal `null`, process error `null`; stderr "".

```json
["/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node","/tmp/tabi-r18-MutC1-2-dLHMks/repo/.ufo/waves/round-18/measure-c1.mjs","530f40a9bc3f10436161a2af1ca0fe9bffffc004","--lane","/tmp/tabi-r18-MutC1-2-dLHMks/repo"]
```

Actual stdout (one JSON line, terminated by LF):

```json
{"rev":"530f40a9bc3f10436161a2af1ca0fe9bffffc004","freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate","c1_rows_rechecked":51,"eligible_rows":58,"held":50,"drift_superseded":0,"own_work":1,"row_classes":{"kind":{"code":12,"community":5,"docs":37,"own-work":1,"paper":3,"spec":4,"tool":2},"status":{"mined":48,"queued":8,"rejected":8},"url":{"immutable_pinned":17,"living_live":46,"own_work":1}},"rejected":[],"live":null,"counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
```

### quote-script-only — SURVIVED

**Mutant:** Replace S016 excerpt with HTML whose only quote occurrence is inside a script element; recompute only excerptSha256. Keep decode=html-text, quoteFound=true, original rowUrl, URL, raw-response sha and canonical command.

**Expected detector:** A producer-consistency detector would reject this script-only excerpt. The current offline predicate instead treats excerpt bytes as already-decoded plain text.

**Committed mutation:** `3350e5f9276a712e6e1949b64373543ee8f9f4b3`, directly based on `530f40a9bc3f10436161a2af1ca0fe9bffffc004`.

Outer exact shell command (exit 0):

```sh
node /tmp/tabi-r18-MutC1-2-dLHMks/capture.mjs quote-script-only 'quote not in decoded excerpt' corpus/evidence/round-18/source-recheck/S016.json corpus/evidence/round-18/source-recheck/S016.excerpt.txt
```

Preserved mutation source (git diff against the pristine parent):

```diff
diff --git a/corpus/evidence/round-18/source-recheck/S016.excerpt.txt b/corpus/evidence/round-18/source-recheck/S016.excerpt.txt
index 2d66dc4..4b8ab2d 100644
--- a/corpus/evidence/round-18/source-recheck/S016.excerpt.txt
+++ b/corpus/evidence/round-18/source-recheck/S016.excerpt.txt
@@ -1 +1 @@
-vigations Network Other locators Pages Page object models Screenshots Service Workers Snapshot testing Test generator Touch events (legacy) Trace viewer Videos Visual comparisons WebView2 Migration Integrations Supported languages Guides Assertions On this page Assertions Introduction ​ Playwright includes test assertions in the form of expect function. To make an assertion, call expect(value) and choose a matcher that reflects the expectation. There are many generic matchers like toEqual , toContain , toBeTruthy that can be used to assert any conditions. expect ( success ) . toBeTruthy ( ) ; Playwright also includes web-specific async matchers that will wait until the expected condition is met. Consider the following example: await expect ( page . getByTestId ( 'status' ) ) . toHaveText ( 'Submitted' ) ; Playwright will be re-testing the element with the test id of status until the fetched element has the "Submitted" text. It will re-fetch the element and check it over and over, until the condition is met or until the timeout is reached. You can either pass this timeout or configure it once via the testConfig.expect value in the test config. By default, the timeout for assertions is set to 5 seconds. Learn more about various timeouts . Auto-retrying assertions ​ The following assert
+<!doctype html><html><head><script type="application/ld+json">{"text":"Playwright also includes web-specific async matchers that will wait until the expected condition is met."}</script></head><body><p>No supporting quotation appears in the visible body.</p></body></html>
diff --git a/corpus/evidence/round-18/source-recheck/S016.json b/corpus/evidence/round-18/source-recheck/S016.json
index 8f48cd8..5230d0d 100644
--- a/corpus/evidence/round-18/source-recheck/S016.json
+++ b/corpus/evidence/round-18/source-recheck/S016.json
@@ -16,7 +16,7 @@
   "quoteFound": true,
   "quoteOffset": 1402,
   "excerpt": "S016.excerpt.txt",
-  "excerptSha256": "809411872b896d6cfe0bc5c469a8992cea3acb75fcd2ea02dfb208ffb2ca9a01",
+  "excerptSha256": "e66e3a3dd4cdf16cb4b53e88329ddd65a52b4aca4f2429ba6a3a9e299fc66500",
   "anchorObserved": "docsearch version=stable; footer Copyright (c) 2026 Microsoft; section \"Auto-retrying assertions\" present; sha256 identical to 2026-10-19 Gate fetch",
   "teachesVerdict": "held",
   "note": "Body supports teaches at §Auto-retrying assertions: retrying assertions wait until the expected state; §Non-retrying assertions explicitly says generic assertions \"do not auto-retry\" and warns they can flake.",
```

SHA-256 restoration evidence; paths below are relative to the private sandbox repo `/tmp/tabi-r18-MutC1-2-dLHMks/repo`. `absent` is an observed missing file, not an omitted digest.

| Input | Before | Mutated | Restored |
|---|---|---|---|
| `corpus/evidence/round-18/source-recheck/S016.json` | `1ef6ff4c1260a3036078df029ce1108ed86b0053a8106e4117f2f4c89d1c3a3d` | `469de95339233911af5ec34c5ba979750aefcb4e1b8b375517c2aa5bd0f0510e` | `1ef6ff4c1260a3036078df029ce1108ed86b0053a8106e4117f2f4c89d1c3a3d` |
| `corpus/evidence/round-18/source-recheck/S016.excerpt.txt` | `809411872b896d6cfe0bc5c469a8992cea3acb75fcd2ea02dfb208ffb2ca9a01` | `e66e3a3dd4cdf16cb4b53e88329ddd65a52b4aca4f2429ba6a3a9e299fc66500` | `809411872b896d6cfe0bc5c469a8992cea3acb75fcd2ea02dfb208ffb2ca9a01` |

Counter before/after SHA-256: `df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234` / `df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234`. Exact affected-input restoration: **true**.

**baseline:** exact argv (JSON array), cwd `/tmp/tabi-r18-MutC1-2-dLHMks/repo`, timeout 30000 ms; exit **0**, signal `null`, process error `null`; stderr "".

```json
["/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node","/tmp/tabi-r18-MutC1-2-dLHMks/repo/.ufo/waves/round-18/measure-c1.mjs","530f40a9bc3f10436161a2af1ca0fe9bffffc004","--lane","/tmp/tabi-r18-MutC1-2-dLHMks/repo"]
```

Actual stdout (one JSON line, terminated by LF):

```json
{"rev":"530f40a9bc3f10436161a2af1ca0fe9bffffc004","freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate","c1_rows_rechecked":51,"eligible_rows":58,"held":50,"drift_superseded":0,"own_work":1,"row_classes":{"kind":{"code":12,"community":5,"docs":37,"own-work":1,"paper":3,"spec":4,"tool":2},"status":{"mined":48,"queued":8,"rejected":8},"url":{"immutable_pinned":17,"living_live":46,"own_work":1}},"rejected":[],"live":null,"counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
```

**mutant:** exact argv (JSON array), cwd `/tmp/tabi-r18-MutC1-2-dLHMks/repo`, timeout 30000 ms; exit **0**, signal `null`, process error `null`; stderr "".

```json
["/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node","/tmp/tabi-r18-MutC1-2-dLHMks/repo/.ufo/waves/round-18/measure-c1.mjs","3350e5f9276a712e6e1949b64373543ee8f9f4b3","--lane","/tmp/tabi-r18-MutC1-2-dLHMks/repo"]
```

Actual stdout (one JSON line, terminated by LF):

```json
{"rev":"3350e5f9276a712e6e1949b64373543ee8f9f4b3","freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate","c1_rows_rechecked":51,"eligible_rows":58,"held":50,"drift_superseded":0,"own_work":1,"row_classes":{"kind":{"code":12,"community":5,"docs":37,"own-work":1,"paper":3,"spec":4,"tool":2},"status":{"mined":48,"queued":8,"rejected":8},"url":{"immutable_pinned":17,"living_live":46,"own_work":1}},"rejected":[],"live":null,"counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
```

**restored:** exact argv (JSON array), cwd `/tmp/tabi-r18-MutC1-2-dLHMks/repo`, timeout 30000 ms; exit **0**, signal `null`, process error `null`; stderr "".

```json
["/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node","/tmp/tabi-r18-MutC1-2-dLHMks/repo/.ufo/waves/round-18/measure-c1.mjs","530f40a9bc3f10436161a2af1ca0fe9bffffc004","--lane","/tmp/tabi-r18-MutC1-2-dLHMks/repo"]
```

Actual stdout (one JSON line, terminated by LF):

```json
{"rev":"530f40a9bc3f10436161a2af1ca0fe9bffffc004","freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate","c1_rows_rechecked":51,"eligible_rows":58,"held":50,"drift_superseded":0,"own_work":1,"row_classes":{"kind":{"code":12,"community":5,"docs":37,"own-work":1,"paper":3,"spec":4,"tool":2},"status":{"mined":48,"queued":8,"rejected":8},"url":{"immutable_pinned":17,"living_live":46,"own_work":1}},"rejected":[],"live":null,"counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
```

### drift-unsuperseded — KILLED

**Mutant:** Change only S016 teachesVerdict from held to drift; add no superseding source row.

**Expected detector:** Count 50 and reject drift without a superseding row.

**Committed mutation:** `5e6007b81522310de1f194da0e54fe21cf12b748`, directly based on `530f40a9bc3f10436161a2af1ca0fe9bffffc004`.

Outer exact shell command (exit 0):

```sh
node /tmp/tabi-r18-MutC1-2-dLHMks/capture.mjs drift-unsuperseded 'drift without superseding row' corpus/evidence/round-18/source-recheck/S016.json
```

Preserved mutation source (git diff against the pristine parent):

```diff
diff --git a/corpus/evidence/round-18/source-recheck/S016.json b/corpus/evidence/round-18/source-recheck/S016.json
index 8f48cd8..82d8e5e 100644
--- a/corpus/evidence/round-18/source-recheck/S016.json
+++ b/corpus/evidence/round-18/source-recheck/S016.json
@@ -18,7 +18,7 @@
   "excerpt": "S016.excerpt.txt",
   "excerptSha256": "809411872b896d6cfe0bc5c469a8992cea3acb75fcd2ea02dfb208ffb2ca9a01",
   "anchorObserved": "docsearch version=stable; footer Copyright (c) 2026 Microsoft; section \"Auto-retrying assertions\" present; sha256 identical to 2026-10-19 Gate fetch",
-  "teachesVerdict": "held",
+  "teachesVerdict": "drift",
   "note": "Body supports teaches at §Auto-retrying assertions: retrying assertions wait until the expected state; §Non-retrying assertions explicitly says generic assertions \"do not auto-retry\" and warns they can flake.",
   "seat": "Recheck08",
   "producerSha256": "f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360"
```

SHA-256 restoration evidence; paths below are relative to the private sandbox repo `/tmp/tabi-r18-MutC1-2-dLHMks/repo`. `absent` is an observed missing file, not an omitted digest.

| Input | Before | Mutated | Restored |
|---|---|---|---|
| `corpus/evidence/round-18/source-recheck/S016.json` | `1ef6ff4c1260a3036078df029ce1108ed86b0053a8106e4117f2f4c89d1c3a3d` | `aeb4bf9de87005ca0df991be01fc9b817e859a63392970441f70491f873884ed` | `1ef6ff4c1260a3036078df029ce1108ed86b0053a8106e4117f2f4c89d1c3a3d` |

Counter before/after SHA-256: `df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234` / `df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234`. Exact affected-input restoration: **true**.

**baseline:** exact argv (JSON array), cwd `/tmp/tabi-r18-MutC1-2-dLHMks/repo`, timeout 30000 ms; exit **0**, signal `null`, process error `null`; stderr "".

```json
["/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node","/tmp/tabi-r18-MutC1-2-dLHMks/repo/.ufo/waves/round-18/measure-c1.mjs","530f40a9bc3f10436161a2af1ca0fe9bffffc004","--lane","/tmp/tabi-r18-MutC1-2-dLHMks/repo"]
```

Actual stdout (one JSON line, terminated by LF):

```json
{"rev":"530f40a9bc3f10436161a2af1ca0fe9bffffc004","freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate","c1_rows_rechecked":51,"eligible_rows":58,"held":50,"drift_superseded":0,"own_work":1,"row_classes":{"kind":{"code":12,"community":5,"docs":37,"own-work":1,"paper":3,"spec":4,"tool":2},"status":{"mined":48,"queued":8,"rejected":8},"url":{"immutable_pinned":17,"living_live":46,"own_work":1}},"rejected":[],"live":null,"counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
```

**mutant:** exact argv (JSON array), cwd `/tmp/tabi-r18-MutC1-2-dLHMks/repo`, timeout 30000 ms; exit **0**, signal `null`, process error `null`; stderr "".

```json
["/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node","/tmp/tabi-r18-MutC1-2-dLHMks/repo/.ufo/waves/round-18/measure-c1.mjs","5e6007b81522310de1f194da0e54fe21cf12b748","--lane","/tmp/tabi-r18-MutC1-2-dLHMks/repo"]
```

Actual stdout (one JSON line, terminated by LF):

```json
{"rev":"5e6007b81522310de1f194da0e54fe21cf12b748","freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate","c1_rows_rechecked":50,"eligible_rows":58,"held":49,"drift_superseded":0,"own_work":1,"row_classes":{"kind":{"code":12,"community":5,"docs":37,"own-work":1,"paper":3,"spec":4,"tool":2},"status":{"mined":48,"queued":8,"rejected":8},"url":{"immutable_pinned":17,"living_live":46,"own_work":1}},"rejected":[{"file":"corpus/evidence/round-18/source-recheck/S016.json","reason":"drift without superseding row"}],"live":null,"counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
```

**restored:** exact argv (JSON array), cwd `/tmp/tabi-r18-MutC1-2-dLHMks/repo`, timeout 30000 ms; exit **0**, signal `null`, process error `null`; stderr "".

```json
["/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node","/tmp/tabi-r18-MutC1-2-dLHMks/repo/.ufo/waves/round-18/measure-c1.mjs","530f40a9bc3f10436161a2af1ca0fe9bffffc004","--lane","/tmp/tabi-r18-MutC1-2-dLHMks/repo"]
```

Actual stdout (one JSON line, terminated by LF):

```json
{"rev":"530f40a9bc3f10436161a2af1ca0fe9bffffc004","freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate","c1_rows_rechecked":51,"eligible_rows":58,"held":50,"drift_superseded":0,"own_work":1,"row_classes":{"kind":{"code":12,"community":5,"docs":37,"own-work":1,"paper":3,"spec":4,"tool":2},"status":{"mined":48,"queued":8,"rejected":8},"url":{"immutable_pinned":17,"living_live":46,"own_work":1}},"rejected":[],"live":null,"counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
```

### http-status — KILLED

**Mutant:** Change only S016 httpStatus from 200 to 404.

**Expected detector:** Count 50 and reject non-200 HTTP status.

**Committed mutation:** `cb3e6060f0f9a6805373df93dcdb50918bc70cf9`, directly based on `530f40a9bc3f10436161a2af1ca0fe9bffffc004`.

Outer exact shell command (exit 0):

```sh
node /tmp/tabi-r18-MutC1-2-dLHMks/capture.mjs http-status 'httpStatus != 200' corpus/evidence/round-18/source-recheck/S016.json
```

Preserved mutation source (git diff against the pristine parent):

```diff
diff --git a/corpus/evidence/round-18/source-recheck/S016.json b/corpus/evidence/round-18/source-recheck/S016.json
index 8f48cd8..85a47e4 100644
--- a/corpus/evidence/round-18/source-recheck/S016.json
+++ b/corpus/evidence/round-18/source-recheck/S016.json
@@ -5,7 +5,7 @@
   "url": "https://playwright.dev/docs/test-assertions",
   "fetchedAt": "2026-10-20T19:05:48.990Z",
   "command": "curl -sSL --compressed --max-time 90 -A Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18 -o <tmp>/body -w %{http_code} 'https://playwright.dev/docs/test-assertions'",
-  "httpStatus": 200,
+  "httpStatus": 404,
   "bytes": 159543,
   "sha256": "1bb8afe888af092190125a3d5a6aef753fb17312c0c0b774d296060ac0766a2c",
   "decode": "html-text",
```

SHA-256 restoration evidence; paths below are relative to the private sandbox repo `/tmp/tabi-r18-MutC1-2-dLHMks/repo`. `absent` is an observed missing file, not an omitted digest.

| Input | Before | Mutated | Restored |
|---|---|---|---|
| `corpus/evidence/round-18/source-recheck/S016.json` | `1ef6ff4c1260a3036078df029ce1108ed86b0053a8106e4117f2f4c89d1c3a3d` | `84b68a2cda4248376ab4e0126610f6be8e410ff684637b4847070ac677ba9e9f` | `1ef6ff4c1260a3036078df029ce1108ed86b0053a8106e4117f2f4c89d1c3a3d` |

Counter before/after SHA-256: `df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234` / `df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234`. Exact affected-input restoration: **true**.

**baseline:** exact argv (JSON array), cwd `/tmp/tabi-r18-MutC1-2-dLHMks/repo`, timeout 30000 ms; exit **0**, signal `null`, process error `null`; stderr "".

```json
["/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node","/tmp/tabi-r18-MutC1-2-dLHMks/repo/.ufo/waves/round-18/measure-c1.mjs","530f40a9bc3f10436161a2af1ca0fe9bffffc004","--lane","/tmp/tabi-r18-MutC1-2-dLHMks/repo"]
```

Actual stdout (one JSON line, terminated by LF):

```json
{"rev":"530f40a9bc3f10436161a2af1ca0fe9bffffc004","freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate","c1_rows_rechecked":51,"eligible_rows":58,"held":50,"drift_superseded":0,"own_work":1,"row_classes":{"kind":{"code":12,"community":5,"docs":37,"own-work":1,"paper":3,"spec":4,"tool":2},"status":{"mined":48,"queued":8,"rejected":8},"url":{"immutable_pinned":17,"living_live":46,"own_work":1}},"rejected":[],"live":null,"counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
```

**mutant:** exact argv (JSON array), cwd `/tmp/tabi-r18-MutC1-2-dLHMks/repo`, timeout 30000 ms; exit **0**, signal `null`, process error `null`; stderr "".

```json
["/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node","/tmp/tabi-r18-MutC1-2-dLHMks/repo/.ufo/waves/round-18/measure-c1.mjs","cb3e6060f0f9a6805373df93dcdb50918bc70cf9","--lane","/tmp/tabi-r18-MutC1-2-dLHMks/repo"]
```

Actual stdout (one JSON line, terminated by LF):

```json
{"rev":"cb3e6060f0f9a6805373df93dcdb50918bc70cf9","freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate","c1_rows_rechecked":50,"eligible_rows":58,"held":49,"drift_superseded":0,"own_work":1,"row_classes":{"kind":{"code":12,"community":5,"docs":37,"own-work":1,"paper":3,"spec":4,"tool":2},"status":{"mined":48,"queued":8,"rejected":8},"url":{"immutable_pinned":17,"living_live":46,"own_work":1}},"rejected":[{"file":"corpus/evidence/round-18/source-recheck/S016.json","reason":"httpStatus != 200"}],"live":null,"counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
```

**restored:** exact argv (JSON array), cwd `/tmp/tabi-r18-MutC1-2-dLHMks/repo`, timeout 30000 ms; exit **0**, signal `null`, process error `null`; stderr "".

```json
["/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node","/tmp/tabi-r18-MutC1-2-dLHMks/repo/.ufo/waves/round-18/measure-c1.mjs","530f40a9bc3f10436161a2af1ca0fe9bffffc004","--lane","/tmp/tabi-r18-MutC1-2-dLHMks/repo"]
```

Actual stdout (one JSON line, terminated by LF):

```json
{"rev":"530f40a9bc3f10436161a2af1ca0fe9bffffc004","freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate","c1_rows_rechecked":51,"eligible_rows":58,"held":50,"drift_superseded":0,"own_work":1,"row_classes":{"kind":{"code":12,"community":5,"docs":37,"own-work":1,"paper":3,"spec":4,"tool":2},"status":{"mined":48,"queued":8,"rejected":8},"url":{"immutable_pinned":17,"living_live":46,"own_work":1}},"rejected":[],"live":null,"counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
```

### source-status — SURVIVED

**Mutant:** Change only S016 SOURCES status from mined to not-a-status.

**Expected detector:** A source-schema-integrity detector would reject the enum. Status validity is not part of the frozen C1 receipt-count predicate.

**Committed mutation:** `8fa637bb3c9840c7e9da68b6b369a12ebc0335c3`, directly based on `530f40a9bc3f10436161a2af1ca0fe9bffffc004`.

Outer exact shell command (exit 0):

```sh
node /tmp/tabi-r18-MutC1-2-dLHMks/capture.mjs source-status 'source status enum must be valid' corpus/SOURCES.md
```

Preserved mutation source (git diff against the pristine parent):

```diff
diff --git a/corpus/SOURCES.md b/corpus/SOURCES.md
index c931461..d7cd41a 100644
--- a/corpus/SOURCES.md
+++ b/corpus/SOURCES.md
@@ -27,7 +27,7 @@ admitted to `knowledge/` (admission stays in `corpus/QUALITY.md`). Structural ch
 | S013 | Retries — Playwright — https://playwright.dev/docs/test-retries | docs | A | Playwright Test attempt-result classification | stable docs served 2026-10-19, §Failures, §Retries | A first-run failure that passes on retry is classed flaky, not passed; keep every attempt | mined | 2026-10-19 | on-release | corpus/knowledge/web-flake-retry-evidence.md, corpus/knowledge/source-recheck-round-12.md |
 | S014 | Trace viewer — Playwright — https://playwright.dev/docs/trace-viewer | docs | A | Playwright Test retry-trace capture | stable docs served 2026-10-19, §Recording a trace / Tracing on CI | Record the trace on the first retry so the failing path is inspectable with DOM, console and network records | mined | 2026-10-19 | on-release | corpus/knowledge/web-flake-retry-evidence.md |
 | S015 | Auto-waiting — Playwright — https://playwright.dev/docs/actionability | docs | A | Playwright locator-action prerequisites | stable docs served 2026-10-19, §Introduction | Actionability checks gate the action, not the test's post-action state predicate; the two waits are distinct evidence | mined | 2026-10-19 | on-release | corpus/knowledge/web-flake-retry-evidence.md |
-| S016 | Assertions — Playwright — https://playwright.dev/docs/test-assertions | docs | A | Playwright asynchronous (retrying) assertions | stable docs served 2026-10-19, §Auto-retrying assertions | Web-first assertions wait for the expected state; generic value assertions do not retry | mined | 2026-10-19 | on-release | corpus/knowledge/web-flake-retry-evidence.md |
+| S016 | Assertions — Playwright — https://playwright.dev/docs/test-assertions | docs | A | Playwright asynchronous (retrying) assertions | stable docs served 2026-10-19, §Auto-retrying assertions | Web-first assertions wait for the expected state; generic value assertions do not retry | not-a-status | 2026-10-19 | on-release | corpus/knowledge/web-flake-retry-evidence.md |
 | S017 | Release notes — Playwright — https://playwright.dev/docs/release-notes | docs | A | Playwright Test 1.64 test-order reproduction | Version 1.64 §Test runner, served 2026-10-19 | `--shuffle` prints a seed and `--shuffle <seed>` replays the order, making order-dependent failures reproducible | mined | 2026-10-19 | on-release | corpus/knowledge/web-flake-retry-evidence.md, corpus/knowledge/source-recheck-round-12.md |
 | S018 | An Empirical Study of Web Flaky Tests: Understanding and Unveiling DOM Event Interaction Challenges — https://mpapad.github.io/publications/pdfs/ICST25.pdf | paper | A | DOM-event web UI flake classes and repair patterns within the study sample | ICST 2025 accepted paper, §III.C, §V.A Table V (printed pp. 94, 98-99) | Study-scoped evidence that DOM/event interaction flakes are repaired by synchronization and consistent state transitions, bounded to its 123-test sample | mined | 2026-10-19 | 180d | corpus/knowledge/web-flake-retry-evidence.md |
 | S019 | Non-Flaky and Nearly Optimal Time-Based Treatment of Asynchronous Wait Web Tests — https://research.knu.ac.kr/en/publications/non-flaky-and-nearly-optimal-time-based-treatment-of-asynchronous/ | paper | B | Reported prevalence of wait-time changes in asynchronous-wait fixes | institutional record, Abstract; DOI 10.1145/3695989, published 2025-02-12 | Developers often adjust wait durations as the fix; a secondary record of that prevalence, read from the abstract only | mined | 2026-10-19 | 180d | corpus/knowledge/web-flake-retry-evidence.md |
```

SHA-256 restoration evidence; paths below are relative to the private sandbox repo `/tmp/tabi-r18-MutC1-2-dLHMks/repo`. `absent` is an observed missing file, not an omitted digest.

| Input | Before | Mutated | Restored |
|---|---|---|---|
| `corpus/SOURCES.md` | `81f849da8c78c5e496b5d3973a6a4f47fb1823dfc163f2e5e80c8d845767fa55` | `f2877be1db0752bb6dda1c348a309031b0108899ee5112fb22f0e0ed8f434c9f` | `81f849da8c78c5e496b5d3973a6a4f47fb1823dfc163f2e5e80c8d845767fa55` |

Counter before/after SHA-256: `df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234` / `df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234`. Exact affected-input restoration: **true**.

**baseline:** exact argv (JSON array), cwd `/tmp/tabi-r18-MutC1-2-dLHMks/repo`, timeout 30000 ms; exit **0**, signal `null`, process error `null`; stderr "".

```json
["/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node","/tmp/tabi-r18-MutC1-2-dLHMks/repo/.ufo/waves/round-18/measure-c1.mjs","530f40a9bc3f10436161a2af1ca0fe9bffffc004","--lane","/tmp/tabi-r18-MutC1-2-dLHMks/repo"]
```

Actual stdout (one JSON line, terminated by LF):

```json
{"rev":"530f40a9bc3f10436161a2af1ca0fe9bffffc004","freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate","c1_rows_rechecked":51,"eligible_rows":58,"held":50,"drift_superseded":0,"own_work":1,"row_classes":{"kind":{"code":12,"community":5,"docs":37,"own-work":1,"paper":3,"spec":4,"tool":2},"status":{"mined":48,"queued":8,"rejected":8},"url":{"immutable_pinned":17,"living_live":46,"own_work":1}},"rejected":[],"live":null,"counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
```

**mutant:** exact argv (JSON array), cwd `/tmp/tabi-r18-MutC1-2-dLHMks/repo`, timeout 30000 ms; exit **0**, signal `null`, process error `null`; stderr "".

```json
["/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node","/tmp/tabi-r18-MutC1-2-dLHMks/repo/.ufo/waves/round-18/measure-c1.mjs","8fa637bb3c9840c7e9da68b6b369a12ebc0335c3","--lane","/tmp/tabi-r18-MutC1-2-dLHMks/repo"]
```

Actual stdout (one JSON line, terminated by LF):

```json
{"rev":"8fa637bb3c9840c7e9da68b6b369a12ebc0335c3","freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate","c1_rows_rechecked":51,"eligible_rows":58,"held":50,"drift_superseded":0,"own_work":1,"row_classes":{"kind":{"code":12,"community":5,"docs":37,"own-work":1,"paper":3,"spec":4,"tool":2},"status":{"mined":47,"not-a-status":1,"queued":8,"rejected":8},"url":{"immutable_pinned":17,"living_live":46,"own_work":1}},"rejected":[],"live":null,"counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
```

**restored:** exact argv (JSON array), cwd `/tmp/tabi-r18-MutC1-2-dLHMks/repo`, timeout 30000 ms; exit **0**, signal `null`, process error `null`; stderr "".

```json
["/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node","/tmp/tabi-r18-MutC1-2-dLHMks/repo/.ufo/waves/round-18/measure-c1.mjs","530f40a9bc3f10436161a2af1ca0fe9bffffc004","--lane","/tmp/tabi-r18-MutC1-2-dLHMks/repo"]
```

Actual stdout (one JSON line, terminated by LF):

```json
{"rev":"530f40a9bc3f10436161a2af1ca0fe9bffffc004","freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate","c1_rows_rechecked":51,"eligible_rows":58,"held":50,"drift_superseded":0,"own_work":1,"row_classes":{"kind":{"code":12,"community":5,"docs":37,"own-work":1,"paper":3,"spec":4,"tool":2},"status":{"mined":48,"queued":8,"rejected":8},"url":{"immutable_pinned":17,"living_live":46,"own_work":1}},"rejected":[],"live":null,"counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
```

### duplicate-source — KILLED

**Mutant:** Add a second identical S016 SOURCES row after the original.

**Expected detector:** Count 50 and reject the ambiguous source id.

**Committed mutation:** `f9d57088c002a1c2b472f741b6a02e311d387848`, directly based on `530f40a9bc3f10436161a2af1ca0fe9bffffc004`.

Outer exact shell command (exit 0):

```sh
node /tmp/tabi-r18-MutC1-2-dLHMks/capture.mjs duplicate-source 'duplicate source row' corpus/SOURCES.md
```

Preserved mutation source (git diff against the pristine parent):

```diff
diff --git a/corpus/SOURCES.md b/corpus/SOURCES.md
index c931461..e04a0ef 100644
--- a/corpus/SOURCES.md
+++ b/corpus/SOURCES.md
@@ -28,6 +28,7 @@ admitted to `knowledge/` (admission stays in `corpus/QUALITY.md`). Structural ch
 | S014 | Trace viewer — Playwright — https://playwright.dev/docs/trace-viewer | docs | A | Playwright Test retry-trace capture | stable docs served 2026-10-19, §Recording a trace / Tracing on CI | Record the trace on the first retry so the failing path is inspectable with DOM, console and network records | mined | 2026-10-19 | on-release | corpus/knowledge/web-flake-retry-evidence.md |
 | S015 | Auto-waiting — Playwright — https://playwright.dev/docs/actionability | docs | A | Playwright locator-action prerequisites | stable docs served 2026-10-19, §Introduction | Actionability checks gate the action, not the test's post-action state predicate; the two waits are distinct evidence | mined | 2026-10-19 | on-release | corpus/knowledge/web-flake-retry-evidence.md |
 | S016 | Assertions — Playwright — https://playwright.dev/docs/test-assertions | docs | A | Playwright asynchronous (retrying) assertions | stable docs served 2026-10-19, §Auto-retrying assertions | Web-first assertions wait for the expected state; generic value assertions do not retry | mined | 2026-10-19 | on-release | corpus/knowledge/web-flake-retry-evidence.md |
+| S016 | Assertions — Playwright — https://playwright.dev/docs/test-assertions | docs | A | Playwright asynchronous (retrying) assertions | stable docs served 2026-10-19, §Auto-retrying assertions | Web-first assertions wait for the expected state; generic value assertions do not retry | mined | 2026-10-19 | on-release | corpus/knowledge/web-flake-retry-evidence.md |
 | S017 | Release notes — Playwright — https://playwright.dev/docs/release-notes | docs | A | Playwright Test 1.64 test-order reproduction | Version 1.64 §Test runner, served 2026-10-19 | `--shuffle` prints a seed and `--shuffle <seed>` replays the order, making order-dependent failures reproducible | mined | 2026-10-19 | on-release | corpus/knowledge/web-flake-retry-evidence.md, corpus/knowledge/source-recheck-round-12.md |
 | S018 | An Empirical Study of Web Flaky Tests: Understanding and Unveiling DOM Event Interaction Challenges — https://mpapad.github.io/publications/pdfs/ICST25.pdf | paper | A | DOM-event web UI flake classes and repair patterns within the study sample | ICST 2025 accepted paper, §III.C, §V.A Table V (printed pp. 94, 98-99) | Study-scoped evidence that DOM/event interaction flakes are repaired by synchronization and consistent state transitions, bounded to its 123-test sample | mined | 2026-10-19 | 180d | corpus/knowledge/web-flake-retry-evidence.md |
 | S019 | Non-Flaky and Nearly Optimal Time-Based Treatment of Asynchronous Wait Web Tests — https://research.knu.ac.kr/en/publications/non-flaky-and-nearly-optimal-time-based-treatment-of-asynchronous/ | paper | B | Reported prevalence of wait-time changes in asynchronous-wait fixes | institutional record, Abstract; DOI 10.1145/3695989, published 2025-02-12 | Developers often adjust wait durations as the fix; a secondary record of that prevalence, read from the abstract only | mined | 2026-10-19 | 180d | corpus/knowledge/web-flake-retry-evidence.md |
```

SHA-256 restoration evidence; paths below are relative to the private sandbox repo `/tmp/tabi-r18-MutC1-2-dLHMks/repo`. `absent` is an observed missing file, not an omitted digest.

| Input | Before | Mutated | Restored |
|---|---|---|---|
| `corpus/SOURCES.md` | `81f849da8c78c5e496b5d3973a6a4f47fb1823dfc163f2e5e80c8d845767fa55` | `dad55bc1ee8e28fa3e6385753986a40674f19693f3ec4d6c21d0c71c1a746f71` | `81f849da8c78c5e496b5d3973a6a4f47fb1823dfc163f2e5e80c8d845767fa55` |

Counter before/after SHA-256: `df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234` / `df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234`. Exact affected-input restoration: **true**.

**baseline:** exact argv (JSON array), cwd `/tmp/tabi-r18-MutC1-2-dLHMks/repo`, timeout 30000 ms; exit **0**, signal `null`, process error `null`; stderr "".

```json
["/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node","/tmp/tabi-r18-MutC1-2-dLHMks/repo/.ufo/waves/round-18/measure-c1.mjs","530f40a9bc3f10436161a2af1ca0fe9bffffc004","--lane","/tmp/tabi-r18-MutC1-2-dLHMks/repo"]
```

Actual stdout (one JSON line, terminated by LF):

```json
{"rev":"530f40a9bc3f10436161a2af1ca0fe9bffffc004","freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate","c1_rows_rechecked":51,"eligible_rows":58,"held":50,"drift_superseded":0,"own_work":1,"row_classes":{"kind":{"code":12,"community":5,"docs":37,"own-work":1,"paper":3,"spec":4,"tool":2},"status":{"mined":48,"queued":8,"rejected":8},"url":{"immutable_pinned":17,"living_live":46,"own_work":1}},"rejected":[],"live":null,"counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
```

**mutant:** exact argv (JSON array), cwd `/tmp/tabi-r18-MutC1-2-dLHMks/repo`, timeout 30000 ms; exit **0**, signal `null`, process error `null`; stderr "".

```json
["/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node","/tmp/tabi-r18-MutC1-2-dLHMks/repo/.ufo/waves/round-18/measure-c1.mjs","f9d57088c002a1c2b472f741b6a02e311d387848","--lane","/tmp/tabi-r18-MutC1-2-dLHMks/repo"]
```

Actual stdout (one JSON line, terminated by LF):

```json
{"rev":"f9d57088c002a1c2b472f741b6a02e311d387848","freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate","c1_rows_rechecked":50,"eligible_rows":58,"held":49,"drift_superseded":0,"own_work":1,"row_classes":{"kind":{"code":12,"community":5,"docs":37,"own-work":1,"paper":3,"spec":4,"tool":2},"status":{"mined":48,"queued":8,"rejected":8},"url":{"immutable_pinned":17,"living_live":46,"own_work":1}},"rejected":[{"file":"corpus/evidence/round-18/source-recheck/S016.json","reason":"duplicate source row"}],"live":null,"counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
```

**restored:** exact argv (JSON array), cwd `/tmp/tabi-r18-MutC1-2-dLHMks/repo`, timeout 30000 ms; exit **0**, signal `null`, process error `null`; stderr "".

```json
["/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node","/tmp/tabi-r18-MutC1-2-dLHMks/repo/.ufo/waves/round-18/measure-c1.mjs","530f40a9bc3f10436161a2af1ca0fe9bffffc004","--lane","/tmp/tabi-r18-MutC1-2-dLHMks/repo"]
```

Actual stdout (one JSON line, terminated by LF):

```json
{"rev":"530f40a9bc3f10436161a2af1ca0fe9bffffc004","freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate","c1_rows_rechecked":51,"eligible_rows":58,"held":50,"drift_superseded":0,"own_work":1,"row_classes":{"kind":{"code":12,"community":5,"docs":37,"own-work":1,"paper":3,"spec":4,"tool":2},"status":{"mined":48,"queued":8,"rejected":8},"url":{"immutable_pinned":17,"living_live":46,"own_work":1}},"rejected":[],"live":null,"counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
```

### duplicate-receipt — KILLED

**Mutant:** Add S016-copy.json carrying the same row=S016 and valid-looking receipt data beside S016.json.

**Expected detector:** Count 50; reject both files carrying the duplicate receipt row id, never count either twice.

**Committed mutation:** `6d59cd0c109359efb06a4380c709a642e6d0b603`, directly based on `530f40a9bc3f10436161a2af1ca0fe9bffffc004`.

Outer exact shell command (exit 0):

```sh
node /tmp/tabi-r18-MutC1-2-dLHMks/capture.mjs duplicate-receipt 'duplicate row receipt' corpus/evidence/round-18/source-recheck/S016-copy.json
```

Preserved mutation source (git diff against the pristine parent):

```diff
diff --git a/corpus/evidence/round-18/source-recheck/S016-copy.json b/corpus/evidence/round-18/source-recheck/S016-copy.json
new file mode 100644
index 0000000..4aee439
--- /dev/null
+++ b/corpus/evidence/round-18/source-recheck/S016-copy.json
@@ -0,0 +1,25 @@
+{
+  "schema": "tabi-source-recheck-v1",
+  "row": "S016",
+  "rowUrl": "https://playwright.dev/docs/test-assertions",
+  "url": "https://playwright.dev/docs/test-assertions",
+  "fetchedAt": "2026-10-20T19:05:48.990Z",
+  "command": "curl -sSL --compressed --max-time 90 -A Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18 -o <tmp>/body -w %{http_code} 'https://playwright.dev/docs/test-assertions'",
+  "httpStatus": 200,
+  "bytes": 159543,
+  "sha256": "1bb8afe888af092190125a3d5a6aef753fb17312c0c0b774d296060ac0766a2c",
+  "decode": "html-text",
+  "normalizer": "recheck-fetch.mjs normalize(): NFC, curly quotes/dashes folded, whitespace runs collapsed",
+  "quote": "Playwright also includes web-specific async matchers that will wait until the expected condition is met.",
+  "quoteWords": 15,
+  "quoteSource": "corpus/lessons/kaika-fleet-round-1.md:59",
+  "quoteFound": true,
+  "quoteOffset": 1402,
+  "excerpt": "S016.excerpt.txt",
+  "excerptSha256": "809411872b896d6cfe0bc5c469a8992cea3acb75fcd2ea02dfb208ffb2ca9a01",
+  "anchorObserved": "docsearch version=stable; footer Copyright (c) 2026 Microsoft; section \"Auto-retrying assertions\" present; sha256 identical to 2026-10-19 Gate fetch",
+  "teachesVerdict": "held",
+  "note": "Body supports teaches at §Auto-retrying assertions: retrying assertions wait for the expected state; §Non-retrying assertions explicitly says generic assertions \"do not auto-retry\" and warns they can flake.",
+  "seat": "Recheck08",
+  "producerSha256": "f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360"
+}
```

SHA-256 restoration evidence; paths below are relative to the private sandbox repo `/tmp/tabi-r18-MutC1-2-dLHMks/repo`. `absent` is an observed missing file, not an omitted digest.

| Input | Before | Mutated | Restored |
|---|---|---|---|
| `corpus/evidence/round-18/source-recheck/S016-copy.json` | `absent` | `5e1c2dd2d38b33d2498097358a16c41ebbb9e0b3329287401db2302279f0990f` | `absent` |

Counter before/after SHA-256: `df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234` / `df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234`. Exact affected-input restoration: **true**.

**baseline:** exact argv (JSON array), cwd `/tmp/tabi-r18-MutC1-2-dLHMks/repo`, timeout 30000 ms; exit **0**, signal `null`, process error `null`; stderr "".

```json
["/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node","/tmp/tabi-r18-MutC1-2-dLHMks/repo/.ufo/waves/round-18/measure-c1.mjs","530f40a9bc3f10436161a2af1ca0fe9bffffc004","--lane","/tmp/tabi-r18-MutC1-2-dLHMks/repo"]
```

Actual stdout (one JSON line, terminated by LF):

```json
{"rev":"530f40a9bc3f10436161a2af1ca0fe9bffffc004","freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate","c1_rows_rechecked":51,"eligible_rows":58,"held":50,"drift_superseded":0,"own_work":1,"row_classes":{"kind":{"code":12,"community":5,"docs":37,"own-work":1,"paper":3,"spec":4,"tool":2},"status":{"mined":48,"queued":8,"rejected":8},"url":{"immutable_pinned":17,"living_live":46,"own_work":1}},"rejected":[],"live":null,"counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
```

**mutant:** exact argv (JSON array), cwd `/tmp/tabi-r18-MutC1-2-dLHMks/repo`, timeout 30000 ms; exit **0**, signal `null`, process error `null`; stderr "".

```json
["/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node","/tmp/tabi-r18-MutC1-2-dLHMks/repo/.ufo/waves/round-18/measure-c1.mjs","6d59cd0c109359efb06a4380c709a642e6d0b603","--lane","/tmp/tabi-r18-MutC1-2-dLHMks/repo"]
```

Actual stdout (one JSON line, terminated by LF):

```json
{"rev":"6d59cd0c109359efb06a4380c709a642e6d0b603","freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate","c1_rows_rechecked":50,"eligible_rows":58,"held":49,"drift_superseded":0,"own_work":1,"row_classes":{"kind":{"code":12,"community":5,"docs":37,"own-work":1,"paper":3,"spec":4,"tool":2},"status":{"mined":48,"queued":8,"rejected":8},"url":{"immutable_pinned":17,"living_live":46,"own_work":1}},"rejected":[{"file":"corpus/evidence/round-18/source-recheck/S016-copy.json","reason":"duplicate row receipt"},{"file":"corpus/evidence/round-18/source-recheck/S016.json","reason":"duplicate row receipt"}],"live":null,"counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
```

**restored:** exact argv (JSON array), cwd `/tmp/tabi-r18-MutC1-2-dLHMks/repo`, timeout 30000 ms; exit **0**, signal `null`, process error `null`; stderr "".

```json
["/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node","/tmp/tabi-r18-MutC1-2-dLHMks/repo/.ufo/waves/round-18/measure-c1.mjs","530f40a9bc3f10436161a2af1ca0fe9bffffc004","--lane","/tmp/tabi-r18-MutC1-2-dLHMks/repo"]
```

Actual stdout (one JSON line, terminated by LF):

```json
{"rev":"530f40a9bc3f10436161a2af1ca0fe9bffffc004","freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate","c1_rows_rechecked":51,"eligible_rows":58,"held":50,"drift_superseded":0,"own_work":1,"row_classes":{"kind":{"code":12,"community":5,"docs":37,"own-work":1,"paper":3,"spec":4,"tool":2},"status":{"mined":48,"queued":8,"rejected":8},"url":{"immutable_pinned":17,"living_live":46,"own_work":1}},"rejected":[],"live":null,"counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
```

## Script-only supporting normalizer detector

The same unchanged producer CLI was exercised on pristine, mutated, and restored excerpt bytes, separately from the 30 primary counter invocations. Exact argv below; original shell invoked it through `node` resolving to the same Node executable. cwd was `/tmp/tabi-r18-MutC1-2-dLHMks/repo`, each deadline 10 seconds, stderr empty. This supporting check reads only the named file and makes no HTTP request.

```json
["/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node","/tmp/tabi-r18-MutC1-2-dLHMks/repo/.ufo/waves/round-18/recheck-fetch.mjs","--normalize-only","--decode","html-text","--body","/tmp/tabi-r18-MutC1-2-dLHMks/repo/corpus/evidence/round-18/source-recheck/S016.excerpt.txt","--quote","Playwright also includes web-specific async matchers that will wait until the expected condition is met."]
```

Pristine: exit 0; stdout:
```json
{"found":true,"offset":600,"normalizedLength":1304,"window":" choose a matcher that reflects the expectation. There are many generic matchers like toEqual , toContain , toBeTruthy that can be used to assert any conditions. expect ( success ) . toBeTruthy ( ) ; Playwright also includes web-specific async matchers that will wait until the expected condition is met. Consider the following example: await expect ( page . getByTestId ( 'status' ) ) . toHaveText ( 'Submitted' ) ; Playwright will be re-testing the element with the test id of status until the fetched "}
```

Mutated: exit 1; stdout:
```json
{"found":false,"offset":-1,"normalizedLength":52,"window":null}
```

Restored: exit 0; stdout:
```json
{"found":true,"offset":600,"normalizedLength":1304,"window":" choose a matcher that reflects the expectation. There are many generic matchers like toEqual , toContain , toBeTruthy that can be used to assert any conditions. expect ( success ) . toBeTruthy ( ) ; Playwright also includes web-specific async matchers that will wait until the expected condition is met. Consider the following example: await expect ( page . getByTestId ( 'status' ) ) . toHaveText ( 'Submitted' ) ; Playwright will be re-testing the element with the test id of status until the fetched "}
```

The 273-byte mutant HTML is preserved in the quote-script-only diff, SHA-256 `e66e3a3dd4cdf16cb4b53e88329ddd65a52b4aca4f2429ba6a3a9e299fc66500`. This isolates the meaning of script-only; it is not an observation about the served source page.

## Aborted recorder attempt (excluded; inconclusive harness error)

The first recorder source mistyped the candidate constant as `530f40a9bc3f104361a2af1ca0fe9bffffc004` (not the 40-hex candidate). The initial `url-unrelated` command therefore ended with exit 1 when its finally block attempted `git switch --detach` to that invalid reference. Its final actual output was:

```text
Error: {"argv":["git","-C","/tmp/tabi-r18-MutC1-2-dLHMks/repo","switch","--detach","530f40a9bc3f104361a2af1ca0fe9bffffc004"],"cwd":"/tmp/tabi-r18-MutC1-2-dLHMks/repo","timeoutMs":10000,"exit":128,"signal":null,"error":null,"stdout":"","stderr":"fatal: invalid reference: 530f40a9bc3f104361a2af1ca0fe9bffffc004\n"}
Node.js v24.21.0
```

No baseline or kill credit is taken from that aborted recorder; its internal detector outputs were not retained. The final recorder corrects the constant and refuses to commit if its pristine detector does not count 51 with no rejected rows. This was an authoring error, not a C1 failure. The abandoned sandbox-only commit was `5409beccd97515a9c6281a99c7d7943ad924a85f`; actual recovery command (exit 0):

```sh
git -C /tmp/tabi-r18-MutC1-2-dLHMks/repo log -1 --format='%H %s' && git -C /tmp/tabi-r18-MutC1-2-dLHMks/repo switch --detach 530f40a9bc3f10436161a2af1ca0fe9bffffc004 && sha256sum /tmp/tabi-r18-MutC1-2-dLHMks/repo/corpus/evidence/round-18/source-recheck/S016.json
# stdout: 5409beccd97515a9c6281a99c7d7943ad924a85f falsify C1 url-unrelated
# stderr included leaving 1 commit behind and HEAD is now at 530f40a ...
# stdout: 1ef6ff4c1260a3036078df029ce1108ed86b0053a8106e4117f2f4c89d1c3a3d  /tmp/tabi-r18-MutC1-2-dLHMks/repo/corpus/evidence/round-18/source-recheck/S016.json
```

The URL mutation was then reapplied and run as the separate completed `0e3f1db767b844cbc3fe96920d1912fb93095a4b` probe above.

## Restoration and limits

All ten completed controls produced byte-identical pristine/restored stdout, and every affected input hash (or observed absence for the added receipt) was exactly restored. Both executable hashes remained unchanged. Seven killed mutants have a 51 → 50 → 51 counter transition with the exact expected rejection; survivors have 51 → 51 → 51. No failing baseline was classified as a kill.

This report preserves all mutation diffs, the recorder source, full counter stdout, exact detector argv/exits and full before/mutated/restored SHA-256 values. Sandbox commit identities are historical experiment identifiers: after the private clone is removed they are reproducible from the retained diffs, not promised objects in production. No live-fetch/authenticity verdict, browser behaviour, broader gate pass, or C1 integration/admission verdict is implied. Permanent changes: none; main owns any contract/coverage decision.

## Sandbox cleanup

After all committed inputs were restored and their detector runs recorded, exact cleanup command (cwd `/tmp`, deadline 30 seconds):

```sh
rm -rf /tmp/tabi-r18-MutC1-2-dLHMks && test ! -e /tmp/tabi-r18-MutC1-2-dLHMks && printf '%s\n' 'removed /tmp/tabi-r18-MutC1-2-dLHMks; absence confirmed'
```

Observed exit 0; stdout:

```text
removed /tmp/tabi-r18-MutC1-2-dLHMks; absence confirmed
```

No sandbox remains. Removed ephemeral writes included the private clone `/tmp/tabi-r18-MutC1-2-dLHMks/repo/` (including its sandbox-only Git objects), `/tmp/tabi-r18-MutC1-2-dLHMks/tmp/`, the recorder, and the following receipt files:

- `/tmp/tabi-r18-MutC1-2-dLHMks/capture.mjs`
- `/tmp/tabi-r18-MutC1-2-dLHMks/url-unrelated.json`
- `/tmp/tabi-r18-MutC1-2-dLHMks/own-work-sha.json`
- `/tmp/tabi-r18-MutC1-2-dLHMks/own-work-command.json`
- `/tmp/tabi-r18-MutC1-2-dLHMks/excerpt-copied-hash.json`
- `/tmp/tabi-r18-MutC1-2-dLHMks/quote-script-only.json`
- `/tmp/tabi-r18-MutC1-2-dLHMks/drift-unsuperseded.json`
- `/tmp/tabi-r18-MutC1-2-dLHMks/http-status.json`
- `/tmp/tabi-r18-MutC1-2-dLHMks/source-status.json`
- `/tmp/tabi-r18-MutC1-2-dLHMks/duplicate-source.json`
- `/tmp/tabi-r18-MutC1-2-dLHMks/duplicate-receipt.json`

Their complete behavioral outputs and mutation source are preserved above; no `/tmp` pointer is required to reproduce the findings.

Files written (remaining, absolute paths):
/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/MutC1.md
