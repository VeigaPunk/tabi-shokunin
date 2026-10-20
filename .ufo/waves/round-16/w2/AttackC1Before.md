# AttackC1Before — C1 count re-run, cwd/env sensitivity, reproducibility

- Reviewer: `TabiR16.AttackC1Before` (author-side review; not certification)
- Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin` (HEAD `b444ca8e024f386124418169e8e400221524bba3`)
- Date: 2026-10-20; host node `v24.21.0` (fnm), Linux 7.2.11-arch1-1 x64
- Scope: one attack item — re-run C1 counts at before/after, from lane root and `/tmp`,
  and probe cwd/env sensitivity (`NODE_OPTIONS`, `GIT_DIR`, related `GIT_*`, locale, HOME,
  TMPDIR, PATH) plus reproducibility (repeat, parallel, alternate node major, clone, symlink,
  replace refs, dirty worktree).
- Read-only on the lane: no tracked or untracked lane file was modified, created or deleted
  except this report. All mutation probes ran on clones/dirs under `/tmp`.

## Verdict

**HOLDS** for the named item: C1 counts `0` at `e38d2599…` and `1` at `b444ca8e…`, both
exit 0, reproduced byte-identically across every cwd/env permutation tested, including
hostile `GIT_DIR`/`GIT_*`, `NODE_OPTIONS` preload, minimal `env -i`, node 22 vs 24,
relocated clone, symlink invocation, git replace refs, and a deliberately dirtied worktree.

A separate **MEDIUM** finding (not a count falsification) breaks the *acceptance path*
reproducibility: `corpus/evidence/round-16/measurement-binding.json`, required by the
QUALITY-22 command `--check <manifest> --at <delivered HEAD> --reproduce`, is **untracked**
at the measured revision, so that command exits 2 `manifest_unreadable` from a clean
checkout. Details in Finding 1.

## Observed counts (lane root, verbatim stdout)

```
$ node .ufo/waves/round-16/measure.mjs e38d2599a922cb729186353830fff8e159b4fef0 --claim C1
{"revision":"e38d2599a922cb729186353830fff8e159b4fef0","c1_binding_contracts":0,"gateSha256":null,"selftestSha256":null,"failures":["gate or selftest absent at revision"],"counterBlobAtRevisionSha256":"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855","inputsRead":["corpus/evidence/round-15/measurements.json","scripts/check-measurement-binding.mjs","scripts/selftest-measurement-binding.mjs"]}
EXIT=0

$ node .ufo/waves/round-16/measure.mjs b444ca8e024f386124418169e8e400221524bba3 --claim C1
{"revision":"b444ca8e024f386124418169e8e400221524bba3","c1_binding_contracts":1,
 "gateSha256":"5150611c3d597fd7a70314e2d7cd835be62c5688e521297803e4907fdaa0d6fb",
 "selftestSha256":"8c5426f254b76e4c7c0a0374d513c33f2832a5dfff5e92b938f4bd9d7168f2ae",
 "selftest":{"exit":0,"cases":43,"summary":"MEASUREMENT_BINDING_SELFTEST verdict=clean cases=43 reasons=13","bad":0,"clean":21,"missingVocab":[]},
 "legacy":{"exit":1,"findings":{"C1":["counted_inputs_undeclared","counter_changed_since_measurement","counter_digest_unrecorded"],"C2":["counted_inputs_undeclared","counter_digest_mismatch"]},"at":"36240c70ee114347a79abb91cacab6c63044ce36"},
 "failures":[],
 "counterBlobAtRevisionSha256":"bda4e18eecbaae5463240889fa5b71574cb50f31287f2f3617ba325ff70b88f9",
 "inputsRead":["corpus/evidence/round-15/measurements.json","scripts/check-measurement-binding.mjs","scripts/selftest-measurement-binding.mjs"]}
EXIT=0
```
(the after-revision JSON shown wrapped; on the wire it is one 925-byte line)

Both hashes are the sha256 of the exact stdout bytes used throughout this report:

| revision | stdout sha256 |
|---|---|
| `e38d2599…` | `448090404bf4c3fcdb26438d3c9b528d49581c612cf6ad0d89d4e5f7bbdd7b72` |
| `b444ca8e…` | `5bf73484c5cae0421e55eb1bed4dfeb16c9bc61a35bfbf013ea48126e055fbc9` |

## Reproducibility matrix (all runs: identical stdout hash to the table above)

| probe | exact invocation | before hash | after hash |
|---|---|---|---|
| lane root (baseline) | `node .ufo/waves/round-16/measure.mjs <REV> --claim C1` | 4480…d7b72 | 5bf7…fbc9 |
| cwd `/tmp`, absolute script path | `cd /tmp && node /…/measure.mjs <REV> --claim C1` | 4480…d7b72 | 5bf7…fbc9 |
| cwd inside unrelated git repo | clone of scratch repo in `/tmp/c1probe/otherrepo` | 4480…d7b72 | 5bf7…fbc9 |
| 3× sequential | three consecutive runs, `sha256sum` | — | identical 3/3 |
| 5× concurrent | 5 parallel before + 5 parallel after | 5/5 4480…d7b72 | 5/5 5bf7…fbc9 |
| relocated clone | `git clone --no-hardlinks` → run clone's counter | — | `"c1_binding_contracts":1` |
| symlink invocation from `/tmp` | `ln -s …/measure.mjs /tmp/c1probe/measure-link.mjs` | — | `"c1_binding_contracts":1` |
| node 22.23.3 (npx) | `npx -y node@22 … <REV> --claim C1` | 4480…d7b72 | 5bf7…fbc9 |
| node 22 vs 24 diff | `diff n24-after.json n22-after.json` | — | `IDENTICAL` |
| `env -i` minimal | `env -i PATH=/usr/bin:/bin TMPDIR=… node <abs> …` | 4480…d7b72 | 5bf7…fbc9 |

### Env-sensitivity probes (all output hashes unchanged, exit 0 unless noted)

```
GIT_DIR=/tmp/bogus.git GIT_WORK_TREE=/tmp GIT_OBJECT_DIRECTORY=/tmp/bogus-obj \
  GIT_ALTERNATE_OBJECT_DIRECTORIES=/tmp/bogus-alt node <abs> b444ca8… --claim C1
→ 5bf73484…3fbc9  EXIT=0

GIT_INDEX_FILE=/tmp/bogus.idx GIT_CEILING_DIRECTORIES=/ GIT_DISCOVERY_ACROSS_FILESYSTEM=1 \
  node <abs> b444ca8… --claim C1
→ 5bf73484…3fbc9  EXIT=0

HOME=/nonexistent-home node <abs> b444ca8… --claim C1          → 5bf73484…3fbc9
TZ=Asia/Tokyo LC_ALL=tr_TR.UTF-8 LANG=tr_TR.UTF-8 node … C1    → 5bf73484…3fbc9
HOME=/tmp/c1probe/home GIT_CONFIG_GLOBAL=/tmp/c1probe/hostilegitconfig node … → 5bf73484…3fbc9
NODE_OPTIONS=--no-warnings node … b444ca8… --claim C1          → 5bf73484…3fbc9
TMPDIR="/tmp/c1probe/with space" node … b444ca8… --claim C1    → "c1_binding_contracts":1
NODE_OPTIONS=--max-old-space-size=16 node … b444ca8… --claim C1 → EXIT=0, c1_binding_contracts 1

TMPDIR=/nonexistent/tmp node … b444ca8… --claim C1
→ MEASURE verdict=could_not_evaluate detail=ENOENT: no such file or directory,
  mkdtemp '/nonexistent/tmp/tabi-r16-measure-c1-XXXXXX'   EXIT=2   (structured, no false 0/1)

PATH=/tmp/c1probe/nopath /…/node <abs> b444ca8… --claim C1
→ MEASURE verdict=could_not_evaluate detail=git rev-parse: spawnSync git ENOENT  EXIT=2
```

`NODE_OPTIONS` reaches the **parent** counter process (a `--require` preload executed:
`/tmp/c1probe/hit.txt` = `parent-honored-NODE_OPTIONS`) but not its children: a recording
preload appended exactly **one** pid line (the parent); the selftest/gate children run under
the counter's closed `ENV` allowlist (`measure.mjs:77-87`, only `PATH`,`HOME`,`TZ`,`LC_ALL`,
`GIT_CONFIG_NOSYSTEM`,`GIT_CONFIG_GLOBAL=/dev/null`,`GIT_NO_REPLACE_OBJECTS=1`,
`GIT_OPTIONAL_LOCKS=0`,`GIT_TERMINAL_PROMPT=0`). Output unchanged. An adversarial in-process
preload can of course rewrite stdout — that is the inherent trust boundary of executing the
counter at all, not a defect of this script.

### Git-object integrity probes (on `/tmp` clone, lane untouched)

```
$ git replace e38d2599a922cb729186353830fff8e159b4fef0 b444ca8e024f386124418169e8e400221524bba3
$ git cat-file -p e38d2599a922cb729186353830fff8e159b4fef0 | head -2
tree 49fe704d043966e3e460152b97c38a1bedef032b
parent 8f7feb3ff7a0c0ceef220a362581e325a95d6f3a      # replacement IS visible to plain git
$ node .ufo/waves/round-16/measure.mjs e38d2599… --claim C1
"c1_binding_contracts":0  "failures":["gate or selftest absent at revision"]  EXIT=0
```
`GIT_NO_REPLACE_OBJECTS=1` is honored: the counter does **not** see the replacement.

Worktree dirt immunity (clone; clobbered `scripts/check-measurement-binding.mjs`,
`scripts/selftest-measurement-binding.mjs`, `corpus/evidence/round-15/measurements.json`
with garbage; `git status --porcelain` = 3× ` M`):

```
counter at b444ca8… → "c1_binding_contracts":1  "failures":[]            EXIT=0
counter at e38d259… → "c1_binding_contracts":0  failures=["gate or selftest absent at revision"]  EXIT=0
```
Counts are read from `git ls-tree`/`git cat-file` blobs at REV only (`measure.mjs:100-116`),
never the worktree; the lane's own worktree was clean for these three paths at HEAD
(`git status --porcelain <paths>` empty), so the independently run worktree scripts are
byte-identical evidence for the blobs (`5150611c…` / `8c5426f2…` = blob sha256 at REV).

### Revision / argv grammar

```
node … e38d259 --claim C1    → "revision":"e38d2599a922cb729186353830fff8e159b4fef0"  (resolved to full sha)
node … HEAD --claim C1       → "revision":"b444ca8e…", count 1   (record carries resolved sha, not "HEAD")
node … 49fe704d…(tree) --claim C1 → could_not_evaluate detail=unresolved revision  EXIT=2
node … 0000000000000000000000000000000000000000 --claim C1 → could_not_evaluate unresolved revision EXIT=2
node … --help --claim C1     → could_not_evaluate detail=revision token  EXIT=2
node …                       → usage line  EXIT=2
node … b444ca8… --claim C3   → usage line  EXIT=2
node … b444ca8… --claim=c1   → usage line  EXIT=2
node … b444ca8… --claim C1 --bogus → count 1, EXIT=0   (extra trailing argv ignored)
```
Resolution uses `rev-parse --verify --end-of-options <rev>^{commit}` (`measure.mjs:274-278`),
with a leading-dash guard, so only commits are countable and option injection is blocked.

### Independent confirmation of the count's own oracles (not the counter's word)

```
$ node scripts/selftest-measurement-binding.mjs
… 43 case lines, every one PASS … MEASUREMENT_BINDING_SELFTEST verdict=clean cases=43 reasons=13
EXIT=0        # matches counter's reported cases=43, bad=0, clean=21, missingVocab=[]

$ node scripts/check-measurement-binding.mjs --legacy corpus/evidence/round-15/measurements.json \
    --at 36240c70ee114347a79abb91cacab6c63044ce36 --repo .
MEASUREMENT_BINDING verdict=failed claims=2 bound=0
finding claim=C1 reason=counted_inputs_undeclared …
finding claim=C1 reason=counter_changed_since_measurement …
finding claim=C1 reason=counter_digest_unrecorded …
finding claim=C2 reason=counted_inputs_undeclared …
finding claim=C2 reason=counter_digest_mismatch …
EXIT=1        # exactly the set the counter hard-codes as its legacy oracle

$ node scripts/check-measurement-binding.mjs --check corpus/evidence/round-16/measurement-binding.json \
    --at b444ca8e024f386124418169e8e400221524bba3 --repo .
MEASUREMENT_BINDING verdict=clean claims=2 bound=2   EXIT=0

$ … --check … --at b444ca8… --repo . --reproduce
MEASUREMENT_BINDING verdict=clean claims=2 bound=2   EXIT=0

$ … --check … --at e38d2599… --repo .
MEASUREMENT_BINDING verdict=failed claims=2 bound=0
finding claim=C1 reason=measured_revision_not_ancestor detail=measuredRevision=b444ca8e… is not ancestor-or-equal of at=e38d2599…
… EXIT=1
```

## Findings

### MEDIUM — acceptance manifest is untracked at the measured revision (C1 operability path)

Evidence at HEAD `b444ca8e…`:

```
$ git ls-tree b444ca8e024f386124418169e8e400221524bba3 -- corpus/evidence/round-16/measurement-binding.json
(empty)
$ git ls-tree 8f7feb3ff7a0c0ceef220a362581e325a95d6f3a -- corpus/evidence/round-16/measurement-binding.json
(empty)
$ git status --porcelain
?? .ufo/waves/round-16/w2/
?? corpus/evidence/round-16/measurement-binding.json
$ git check-ignore -v corpus/evidence/round-16/measurement-binding.json
(not ignored)
```

Consequence — QUALITY criterion 22's admission command cannot be reproduced from the
revision alone. On a fresh clone checked out at `b444ca8e…`:

```
$ ls corpus/evidence/round-16/measurement-binding.json
ls: cannot access '…': No such file or directory
$ node scripts/check-measurement-binding.mjs --check corpus/evidence/round-16/measurement-binding.json \
    --at b444ca8e024f386124418169e8e400221524bba3 --repo . --reproduce
MEASUREMENT_BINDING verdict=could_not_evaluate claims=0 bound=0
finding claim=- reason=manifest_unreadable detail=…/measurement-binding.json: ENOENT: no such file or directory…
EXIT=2
```

In the same clean clone the counter still yields 0 → 1, so **the count claim is unaffected**;
what is not reproducible from the revision is the *binding manifestation* that QUALITY-22
makes the admission gate. The manifest's own bytes are consistent (its `counter.sha256`
`bda4e18e…` equals `git cat-file blob b444ca8:.ufo/waves/round-16/measure.mjs | sha256sum`),
and its mtime `2026-10-20 11:57:18` predates this review — I did not create it. Fix is an
L1 action: commit the manifest (and any other round-16 artifact the acceptance names) so the
acceptance command runs from `git` alone. As of this review it is UNPROVEN as a
revision-reproducible artifact, and its check in-lane passes only because of worktree state.

### LOW — trailing argv is silently ignored

`node …/measure.mjs b444ca8… --claim C1 --bogus` exits 0 with count 1. The parser destructures
exactly three arguments (`measure.mjs:274`) and never rejects a fourth. No count impact, but a
mis-typed claim invocation that happens to leave a valid 3-arg prefix is accepted rather than
brought to a usage error. Recommend rejecting `process.argv.length > 5`.

### INFO — the C1 transition is attributable to commit A, not to the b444 counter repair

```
$ node .ufo/waves/round-16/measure.mjs 8f7feb3ff7a0c0ceef220a362581e325a95d6f3a --claim C1
"c1_binding_contracts":1   "failures":[]   EXIT=0
$ git show --stat --oneline b444ca8e024f386124418169e8e400221524bba3
b444ca8 round-16: repair C2 counter fixture-path read; retain first failing measurement
 .ufo/waves/round-16/measure.mjs                          | 11 +++++++++--
 …/measure/count-after-c2-first-counter-defect.json      | 15 +++++++++++++++
 2 files changed, 24 insertions(+), 2 deletions(-)
```
C1 is already 1 at commit A and remains 1 after the repair; the repair is C2-only. The claim
"0 at `e38d2599…` → 1 at `b444ca8e…`" is factually true, but the measured-revision choice for
C1 is immaterial — the gate existence at A is what flips it.

### INFO/retracted — temp-dir "leak" was peer concurrency, not a counter defect

Early probes appeared to show `/tmp/tabi-r16-measure-c1-*` dirs surviving runs. Re-testing
with a private `TMPDIR` shows **0** leftovers for node 24 and node 22
(`TMPDIR=/tmp/c1probe/t24` / `t22`, `ls -A | wc -l` = 0), and observing the shared prefix for
6 s while running nothing shows it churning (n = 1→3→1→2) from concurrent peer agents running
the same counter. Cleanup (`rmSync(dir, {recursive:true, force:true})`, `measure.mjs:174`)
works. Retracted.

## Residual risk / verification gaps

- I verified the C1 **counter** and the gate's acceptance commands as invoked; I did not
  evaluate the C2 receipt contents (separate lanes).
- The C1 count is only as strong as the selftest fixtures it drives; I confirmed 43/43 PASS
  and exact reason-set matching, but did not audit fixture semantics case-by-case (other
  lanes attack the mutation cases).
- Cross-version evidence covers node 22.23.3 vs 24.21.0 only; no node ≤20 or alternate
  architectures were exercised.
- The MEDIUM finding is a delivery-state issue at this snapshot; if L1 commits the manifest
  before delivery, re-run the clean-clone acceptance command to close it.
- Hostile in-process code (`NODE_OPTIONS=--require`, or any loader) can fabricate stdout for
  any node program; the counter's children are insulated but the parent's output is not
  self-authenticating. Treat counter stdout as data from a trusted process, or compare the
  counter blob digest at REV (which the manifest already does).

## Tooling record

- `npx -y node@22` → node **22.23.3**, npx cache `/home/vgpnk/.npm/_npx/52027bd8fc0022aa`,
  channel npx, reason: cross-node-major reproducibility probe. No system packages installed,
  no pacman transaction attempted.
- All probes used the already-installed host node `v24.21.0`. Nothing was installed into the
  lane or `~/.local/bin`.
