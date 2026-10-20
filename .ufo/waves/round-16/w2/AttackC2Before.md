# AttackC2Before — C2 0/0/1 reproduction and the A→X counter repair

- Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin` (read-only; nothing written except this report)
- Revisions: baseline **B** = `e38d2599a922cb729186353830fff8e159b4fef0`, **A** = `8f7feb3ff7a0c0ceef220a362581e325a95d6f3a`, **X** = `b444ca8e024f386124418169e8e400221524bba3` (the named measured snapshot)
- Attacked: `--claim C2` counts 0 at B, 0 at A (counter defect, retained), 1 at X; and whether the A→X counter repair is **consumer-only**.
- Date: 2026-10-20.

## Verdict: **HOLDS**

All three claimed counts reproduce exactly, the A=0 failure is attributable to the A counter blob and to nothing in the measured artifacts, and the A→X repair changes only the consumer (plus one added measurement record that no C2 input path includes). A 2×3 counter×revision matrix isolates the 0→1 transition to the executing counter blob: measured revision does not matter because every C2 input is byte-identical between A and X.

## 0. Why `git show A:.ufo/waves/round-16/measure.mjs > /tmp/mA.mjs` cannot reproduce the 0

The counter derives its repo root from its own location:

```js
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
...
function git(args, binary = false) {
  const result = spawnSync('git', ['-c', 'core.fsmonitor=false', ...args], {
    cwd: ROOT, env: ENV, encoding: binary ? 'buffer' : 'utf8', maxBuffer: 64 * 1024 * 1024,
  });
```

For `/tmp/mA.mjs`, `ROOT` resolves to `/`; every git call runs with `cwd: '/'`, which is not a repository. Observed:

```
$ git show 8f7feb3ff7a0c0ceef220a362581e325a95d6f3a:.ufo/waves/round-16/measure.mjs > /tmp/mA-probe.mjs
$ (cd /tmp && node /tmp/mA-probe.mjs 8f7feb3ff7a0c0ceef220a362581e325a95d6f3a --claim C2); echo "exit=$?"
MEASURE verdict=could_not_evaluate detail=unresolved revision 8f7feb3ff7a0c0ceef220a362581e325a95d6f3a
exit=2
```

Note the error text is misleading: the revision exists, but `rev-parse` ran outside a repo, so the counter reports `unresolved revision`. A relocated blob therefore yields **exit 2 / could-not-evaluate**, never 0 — it cannot stand in for the A measurement.

Correct reproduction: give the A blob the canonical path inside a copy of the repo's `.git`, so `ROOT` resolves to a real repository whose objects include A:

```
d=$(mktemp -d)
cp -a .git "$d/.git"
mkdir -p "$d/.ufo/waves/round-16"
git show 8f7feb3ff7a0c0ceef220a362581e325a95d6f3a:.ufo/waves/round-16/measure.mjs > "$d/.ufo/waves/round-16/measure.mjs"
(cd "$d" && node .ufo/waves/round-16/measure.mjs 8f7feb3ff7a0c0ceef220a362581e325a95d6f3a --claim C2)
```

This writes only under `/tmp`; the lane is untouched.

## 1. Counts at the three revisions

Lane worktree counter equals the X blob exactly (`sha256sum .ufo/waves/round-16/measure.mjs` = `bda4e18e…`, identical to `git cat-file blob X:.ufo/waves/round-16/measure.mjs`).

```
$ node .ufo/waves/round-16/measure.mjs e38d2599a922cb729186353830fff8e159b4fef0 --claim C2
{"revision":"e38d2599…","c2_webmcp_held":0,"failures":["note, receipt or harness absent at revision"],
 "counterBlobAtRevisionSha256":"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", …}   exit=0

$ node .ufo/waves/round-16/measure.mjs 8f7feb3ff7a0c0ceef220a362581e325a95d6f3a --claim C2
{"revision":"8f7feb3f…","c2_webmcp_held":1,"cited":["S020","S030","S031","S032","S033","S034","S035","S036"],
 "caseIds":[…11 ids…],"failures":[],"counterBlobAtRevisionSha256":"4eb828956cfa5a6158185f02f8daa1d7b9b85b1c9be0108811b83497958a1e84", …}   exit=0

$ node .ufo/waves/round-16/measure.mjs b444ca8e024f386124418169e8e400221524bba3 --claim C2
{"revision":"b444ca8e…","c2_webmcp_held":1,"cited":[same 8],"caseIds":[same 11],"failures":[],
 "counterBlobAtRevisionSha256":"bda4e18eecbaae5463240889fa5b71574cb50f31287f2f3617ba325ff70b88f9", …}   exit=0
```

The B=0 is artifact absence (`note, receipt or harness absent`), and the counter blob does not exist at B (`counterBlobAtRevisionSha256` = SHA-256 of empty input). Reproduced identically with both the A and X counter blobs (`count=0`, same failure).

The **A=0 is only produced by the A counter blob**, never the repaired one:

| executing counter | measured rev | exit | count | failures | `counterBlobAtRevisionSha256` |
|---|---|---|---|---|---|
| A `4eb82895…` | B | 0 | 0 | `note, receipt or harness absent at revision` | `e3b0c442…` |
| A `4eb82895…` | A | 0 | **0** | `case data-url-declarative fixture digest` | `4eb82895…` |
| A `4eb82895…` | X | 0 | **0** | `case data-url-declarative fixture digest` | `bda4e18e…` |
| X `bda4e18e…` | B | 0 | 0 | `note, receipt or harness absent at revision` | `e3b0c442…` |
| X `bda4e18e…` | A | 0 | **1** | — | `4eb82895…` |
| X `bda4e18e…` | X | 0 | **1** | — | `bda4e18e…` |

(Rows run from a `/tmp` repo copy; the lane's own runs at B/A/X are the first command block above.)

The A-counter@A stdout is byte-identical (after trailing-whitespace trim) to the retained record's `stdout` in `corpus/evidence/round-16/measure/count-after-c2-first-counter-defect.json`, and the retained `counterBlobAtRevisionSha256` (`4eb82895…`) equals `sha256(A:.ufo/waves/round-16/measure.mjs)`. The retained record's `exit` is 0 (counted; count 0 — the counter's documented "counted but 0" path).

### The failure is the consumer, not the fixture

- `corpus/evidence/round-16/webmcp/receipt.json` (identical blob at A and X) gives `data-url-declarative` `"fixture": "data: (declarative-form.html bytes)"`, `"fixtureFile": "declarative-form.html"`, `fixtureSha256` = `7816ea656af94966989f51eb126d3bde0f8c44b7a88bd3da35fdff0b4568350e`.
- `git ls-tree A -- "data: (declarative-form.html bytes)"` → rc 0, **empty stdout**.
- `sha256(A:corpus/evidence/round-16/webmcp/fixtures/declarative-form.html)` = `7816ea65…` — exactly the receipt's `fixtureSha256`.

So A's counter asked git for a blob at a path that is a human display label (the harness itself writes that label for its synthetic data: URL case), got nothing, and failed the digest. The served fixture bytes were correct all along.

## 2. Is the A→X repair consumer-only?

The changed surface between A and X is exactly two paths, one of them the consumer:

```
$ git diff --name-status 8f7feb3ff7a0c0ceef220a362581e325a95d6f3a b444ca8e024f386124418169e8e400221524bba3
M	.ufo/waves/round-16/measure.mjs
A	corpus/evidence/round-16/measure/count-after-c2-first-counter-defect.json

$ git diff --stat 8f7feb3f… b444ca8e…
 .ufo/waves/round-16/measure.mjs                           | 11 +++++++++--
 .../measure/count-after-c2-first-counter-defect.json      | 15 +++++++++++++++
 2 files changed, 24 insertions(+), 2 deletions(-)
```

The single hunk in the counter replaces the label-as-path read with the `fixtureFile` field:

```
@@ -232,9 +232,16 @@ function countC2(rev) {
     for (const c of cases) {
       caseIds.push(c.id);
       if (c.status !== 'pass') failures.push(`case ${c.id} status ${c.status}`);
-      if (c.fixture) {
-        const fx = blob(rev, c.fixture);
+      // `fixture` is a display label (e.g. "data: (declarative-form.html
+      // bytes)"); `fixtureFile` names the served file. Repair after the first
+      // after-measurement at 8f7feb3 read the label as a path and counted 0
+      // (corpus/evidence/round-16/measure/count-after-c2-first-counter-defect.json).
+      if (c.fixtureFile !== undefined) {
+        const name = String(c.fixtureFile);
+        const fx = /^[A-Za-z0-9._-]+$/.test(name) ? blob(rev, `corpus/evidence/round-16/webmcp/fixtures/${name}`) : null;
         if (!fx || sha256(fx) !== c.fixtureSha256) failures.push(`case ${c.id} fixture digest`);
+      } else {
+        failures.push(`case ${c.id} names no fixtureFile`);
       }
     }
```

The only non-counter change is the *added* measurement record. It is not an input: `countC2`'s `inputsRead` at both A and X lists only `corpus/README.md`, `corpus/SOURCES.md`, the seven fixture blobs, `receipt.json`, the note, and the harness — never `corpus/evidence/round-16/measure/`. All measured inputs are byte-identical across A→X:

```
$ git diff --quiet 8f7feb3f… b444ca8e… -- corpus scripts; echo $?
1
$ git diff --name-only 8f7feb3f… b444ca8e… -- corpus scripts
corpus/evidence/round-16/measure/count-after-c2-first-counter-defect.json
```

i.e. under `corpus/` and `scripts/` the *only* difference is the added audit record; note, README, SOURCES, receipt, harness and every fixture are unchanged. Receipt blob at A equals receipt blob at X (verified byte-for-byte).

### The repair did not loosen the check

Two independent controls:

1. **Counter×revision matrix above**: A-counter@X = 0 with the same single failure, X-counter@A = 1. The count difference is a pure function of the executing consumer.
2. **Negative control in a `/tmp` repo copy**: a synthetic commit (`b691085f29acca75c6fbf2b9bac2c9fa6dd03737`, built with `read-tree`/`update-index`/`commit-tree`, no worktree, no lane mutation) appends one byte to `fixtures/declarative-form.html` with the receipt untouched. The repaired counter then counts 0 with exactly the five cases that use that fixture:

```
perturbed-fixture count 0 failures ['case flags-off-negative-control fixture digest',
 'case devtools-domain-disabled fixture digest', 'case declarative-form-tool fixture digest',
 'case navigation-clears-tools fixture digest', 'case data-url-declarative fixture digest']
X in same temp repo count 1
```

3. **Field plumbing**: the harness builds every case record through `pushCase(id, fixtureFile, …)` (`scripts/webmcp-loopback-round16.mjs:1344-1356`); for `data-url-declarative` it passes `'data:'` (`:1403`), and `pushCase` then records `fixtureFile: 'declarative-form.html'` and `fixtureSha256: fixtureSha256('declarative-form.html')`, while the served URL is itself built from `readFixture('declarative-form.html')` (`:1260-1261`). So the repaired counter pins exactly the bytes that case serves; for the other ten cases `fixtureFile` is the same basename as the receipt's `fixture` path (checked case-by-case; all 11 fixtureFiles present at A). The repair checks the same objects the A counter checked, minus the one nonexistent label lookup.

## 3. Residual risk (not falsifying)

- **R1 — the count is not self-identifying.** `counterBlobAtRevisionSha256` names the counter blob *at the measured revision*, not the blob that executed. Concrete counterexample from the matrix: X-counter@A reports `count=1` with `counterBlobAtRevisionSha256=4eb82895…`, the *same* field value as A-counter@A's `count=0`. An auditor who re-runs today's worktree counter at A gets 1 and cannot tell from the JSON alone that the retained 0 came from the A blob; only the retained record's `note` (+ argv/cwd) names the executing counter. The retained record does say "counter blob 4eb82895 (at A)", so the delivery is honest, but recomputation at A is not a reproduction of the historical 0.
- **R2 — C2 is a receipt audit, not a re-execution.** `producerSha256` pins the harness blob, and `fixtureSha256` pins the named fixture at REV, but nothing proves the harness actually served `fixtureFile` per case; the mapping is producer-asserted. The repair drops any cross-check of the `fixture` display field (A checked it only because the ten normal cases happened to hold repo paths). Given the harness constructs both fields from the same file — including the `data:` case — this is not a weakening of what can be checked statically, but it is not runtime proof.

## 4. Verification gaps

- I did not execute the WebMCP harness; C2=1 here means the receipt/note/source/harness-byte contract holds, not that 11/11 loopback cases ran in this session (separate receipt-runtime lane).
- Historical execution of the retained A record cannot be proven; its stdout is reproducible byte-for-byte from the A blob, which is the strongest available check.
- I did not run the C1 gate/selftest (out of scope for this item).

## 5. Environment / tooling

- No packages installed or upgraded; no `pacman` transaction attempted (host-wide pause respected).
- Concurrent lane activity observed, not mine: an untracked `corpus/evidence/round-16/measurement-binding.json` (schema `tabi-measurement-binding-v1`, mtime 2026-10-20 11:57 local, baseline `e38d259…`) appeared during the session. It is not an input to `countC2` (git-blob reads at REV only), so it cannot affect any count reported here. I created nothing under the lane except this report.
