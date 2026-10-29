# ExecC1Battery — round-43 C1 battery re-run

**Seat:** ExecC1Battery (wave r43 w1, lane C1 battery re-run)
**Milestone:** re-run battery
**Judged on:** operability
**Date (UTC):** 2026-10-29T20:53:25Z
**Scratch (created, used, deleted):** `/fast/scratch/hyaku/tabi-r43/ExecC1Battery/`
**Report:** `.ufo/waves/round-43/w1/ExecC1Battery.md`
**Evidence dir:** `.ufo/waves/round-43/w1/ExecC1Battery/evidence/`

No commit, no push, no git/jj mutation, no network, no agent dispatch. Only reads in
`/home/vgpnk/Projects/shokunin/tabi-shokunin` (git read-only plumbing: `rev-parse`,
`hash-object`, `cat-file`, `log`, `status`) and writes under this seat dir + scratch.

---

## 1. What was executed

Instrument under test (committed bytes, frozen at `7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc`):

```
/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/measure-c1-round43.mjs --battery
```

Committed control used for the shape comparison:

```
/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/controls/c1-battery-r43.json
```

### 1.1 Frozen-byte check (before running)

```
$ git -C /home/vgpnk/Projects/shokunin/tabi-shokunin log --oneline -8
ba433c94 round-43: C1 receipt+witness committed as explicit files (1.18/1.20 MiB — directory commits skip >1MiB new files; r41 D1 class caught by ls-tree before citing)
b77e84a0 round-43: w1 spec (64 seats, attack 30/64) + validated dispatch (taskCall) + ready handoff
7ca6f018 round-43: freeze C1 signature-authenticated chain + C2 hardened checker; controls red pre-data; S150/S151 opened; live measurement clean
ab592825 hyaku run12: remove stale round-41 w1.ready (residual spec without taskCall; crash-loops dispatcher bootstrap)
2844de30 round-42 verifier spot-check (integrator, hyaku): non-author admit/reject
15b75a73 round-42: commit RevWitnessProbe >1MiB forgery evidence files (directory-commit skip); remove wave-created self-symlink debris
22795661 round-42: commit C1 receipt+witness at measured state (RevReceiptBytes routed the untracked-recurrence), late seat forgery evidence, orchestrator dispatch marker
db91779b round-43: SCORECARD disposition — C1 not admitted (kill rule), C2 not met as worded (instrument pass recorded); scores held 9; planned r43
```

Repo HEAD is `ba433c94b14a0e0d5ecf2eba1be0a8ee3064491c` (two commits after the freeze commit; the
freeze commit itself is present). Blob identity vs. the freeze commit, for every frozen input
this seat depends on:

```
$ for f in .ufo/waves/round-43/counters/c1-signature-bound-v5.mjs \
           .ufo/waves/round-43/counters/check-routed-defects-round43.mjs \
           .ufo/waves/round-43/claims.json \
           .ufo/waves/round-43/controls/c1-battery-r43.json \
           scripts/measure-c1-round43.mjs; do
    a=$(git rev-parse 7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc:$f)
    b=$(git hash-object $f)
    printf '%s freeze=%s work=%s %s\n' "$f" "$a" "$b" "$([ "$a" = "$b" ] && echo SAME || echo DIFFERENT)"
  done
.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs freeze=f1670bdc593cd3b0127b075f998eb29c9621d914 work=f1670bdc593cd3b0127b075f998eb29c9621d914 SAME
.ufo/waves/round-43/counters/check-routed-defects-round43.mjs freeze=72804f929c814540c5bc0801255191db411b0e71 work=72804f929c814540c5bc0801255191db411b0e71 SAME
.ufo/waves/round-43/claims.json freeze=f3036d9eddad68da5ef2899b6b0da8737cc5f40e work=f3036d9eddad68da5ef2899b6b0da8737cc5f40e SAME
.ufo/waves/round-43/controls/c1-battery-r43.json freeze=b94c921c548dade5f50514606c637c6fa1688dd8 work=b94c921c548dade5f50514606c637c6fa1688dd8 SAME
scripts/measure-c1-round43.mjs freeze=4c39f32f3700b06a74a2930d4b7f63f4160d6527 work=4c39f32f3700b06a74a2930d4b7f63f4160d6527 SAME
```

All five frozen inputs are byte-identical to the freeze commit — no amendment is in play.

### 1.2 Ambient environment (pre-flight)

```
$ env | grep -E '^(NODE_OPTIONS|NODE_PATH|NODE_EXTRA_CA_CERTS|NODE_PENDING_DEPRECATION|LD_|DYLD_|BUN_|PYTHONPATH|PYTHONHOME|PYTHONSTARTUP|RUBYOPT|RUBYLIB|PERL5OPT|PERL5LIB|JAVA_TOOL_OPTIONS|_JAVA_OPTIONS|JDK_JAVA_OPTIONS)' || echo "no forbidden env vars present"
no forbidden env vars present
```

Node: `v24.21.0` (`/run/user/1000/fnm_multishells/3090301_1793303840413/bin/node`).
Host: `Linux 7.2.11-arch1-1 x86_64`.

---

## 2. Exact commands and observed output

### 2.1 Primary battery run (from scratch cwd)

```
$ cd /fast/scratch/hyaku/tabi-r43/ExecC1Battery
$ node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/measure-c1-round43.mjs --battery > battery-run.json 2> battery-run.stderr
$ echo "EXIT=$?"; wc -c battery-run.json battery-run.stderr
EXIT=0
1385 battery-run.json
0 battery-run.stderr
```

`battery-run.json` (verbatim, single line):

```json
{"schema":"tabi-r43-battery","cases":[{"case":"forger-r39-verbatim","vector":"NODE_OPTIONS=--require /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-41/fixtures/forger-round39.cjs","exit":2,"finding":"environment-loader-contamination","pass":true},{"case":"forger-r41-retargeted","vector":"NODE_OPTIONS=--require /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-41/fixtures/forger-round41.cjs","exit":2,"finding":"environment-loader-contamination","pass":true},{"case":"node-path","vector":"NODE_PATH=/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-41/fixtures/shadow_modules","exit":2,"finding":"environment-loader-contamination","pass":true},{"case":"ld-preload","vector":"LD_PRELOAD=/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-41/fixtures/libforger.so","exit":2,"finding":"environment-loader-contamination","pass":true},{"case":"esm-loader","vector":"NODE_OPTIONS=--experimental-loader /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-41/fixtures/loader.mjs","exit":2,"finding":"environment-loader-contamination","pass":true},{"case":"esm-import","vector":"NODE_OPTIONS=--import /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-41/fixtures/loader.mjs","exit":2,"finding":"environment-loader-contamination","pass":true},{"case":"clean","vector":null,"exit":0,"finding":null,"pass":true}],"allPass":true}
```

Process exit status of the battery itself: **0** (`out.allPass ? 0 : 1`). stderr empty.

### 2.2 Repeat runs (determinism + cwd independence)

```
$ cd /fast/scratch/hyaku/tabi-r43/ExecC1Battery
$ node .../measure-c1-round43.mjs --battery > battery-run2.json 2> battery-run2.stderr
$ echo "EXIT2=$?"          -> EXIT2=0
$ cd / && node .../measure-c1-round43.mjs --battery > .../battery-run-cwd-root.json 2>&1
$ echo "EXIT=$?"           -> EXIT=0
$ sha256sum battery-run.json battery-run2.json battery-run-cwd-root.json
6cb61f1150406e490ec9ba8f54353bf0b8d7ce02ccd31df8388d17d813ef9aed  battery-run.json
6cb61f1150406e490ec9ba8f54353bf0b8d7ce02ccd31df8388d17d813ef9aed  battery-run2.json
6cb61f1150406e490ec9ba8f54353bf0b8d7ce02ccd31df8388d17d813ef9aed  battery-run-cwd-root.json
```

All three runs (scratch cwd ×2, `/` cwd ×1) are byte-identical to one another **and** to the
committed control file (sha256 `6cb61f11…ef9aed`). The battery output carries no timestamp or
host-varying field, so byte-identity happened to hold; the pass/fail decision below rests on the
field-by-field shape comparison, not on the hash.

### 2.3 Shape comparison against the committed control

Comparator (copied to `evidence/compare-shape.mjs`; runs read-only against both files, compares
`schema`, `allPass`, and per-case `case|vector|exit|finding|pass` in order):

```
$ cd /fast/scratch/hyaku/tabi-r43/ExecC1Battery
$ node compare-shape.mjs battery-run.json battery-run2.json battery-run-cwd-root.json > shape-compare.json
$ echo "CMP_EXIT=$?"
CMP_EXIT=0
```

Summarised comparator output:

```json
{
 "controlSha256": "6cb61f1150406e490ec9ba8f54353bf0b8d7ce02ccd31df8388d17d813ef9aed",
 "allRunsShapeEqual": true,
 "allRuns7of7": true,
 "runs": [
  {"run":"battery-run.json","sha":"6cb61f11…","byteIdentical":true,"caseCount":7,"passCount":7,"allPass":true,"shapeDiffs":0,"shapeEqual":true},
  {"run":"battery-run2.json","sha":"6cb61f11…","byteIdentical":true,"caseCount":7,"passCount":7,"allPass":true,"shapeDiffs":0,"shapeEqual":true},
  {"run":"battery-run-cwd-root.json","sha":"6cb61f11…","byteIdentical":true,"caseCount":7,"passCount":7,"allPass":true,"shapeDiffs":0,"shapeEqual":true}
 ]
}
```

Per-case shape, run vs control (identical for all three runs):

| # | case | vector | exit | finding | pass |
|---|------|--------|------|---------|------|
| 1 | forger-r39-verbatim | `NODE_OPTIONS=--require …/fixtures/forger-round39.cjs` | 2 | environment-loader-contamination | true |
| 2 | forger-r41-retargeted | `NODE_OPTIONS=--require …/fixtures/forger-round41.cjs` | 2 | environment-loader-contamination | true |
| 3 | node-path | `NODE_PATH=…/fixtures/shadow_modules` | 2 | environment-loader-contamination | true |
| 4 | ld-preload | `LD_PRELOAD=…/fixtures/libforger.so` | 2 | environment-loader-contamination | true |
| 5 | esm-loader | `NODE_OPTIONS=--experimental-loader …/fixtures/loader.mjs` | 2 | environment-loader-contamination | true |
| 6 | esm-import | `NODE_OPTIONS=--import …/fixtures/loader.mjs` | 2 | environment-loader-contamination | true |
| 7 | clean | `null` | 0 | `null` | true |

`caseCount = 7`, `passCount = 7`, `allPass = true`; `shapeDiffs = 0` against the committed control.
**7/7 pass confirmed by direct observation, not by assertion.**

### 2.4 Probe-level detail (what actually fires the refusal)

Clean probe (exit 0):

```
$ node .../measure-c1-round43.mjs --battery-probe
{"schema":"tabi-r43-battery-probe","contaminated":false,"finding":null,"self":{"procEnvironReadable":true,"nameCount":267,"forbiddenNames":[],"execArgv":[],"execArgvClean":true,"execPath":"…/node-versions/v24.21.0/installation/bin/node","nodeSha256":"7fde7b8afa198da66257f42ee2001d874c7355631e6d1579a5fb5ef1f246df4c"},"child":{"schema":"tabi-r43-env-gate","self":{"readable":true,"forbidden":[]},"parent":{"ppid":4031588,"readable":true,"forbidden":[]},"execArgvLen":2,"execArgvFlag":["--eval"],"execArgvClean":true,"ok":true}}
PROBE_EXIT=0
```

Contaminated probe (`NODE_OPTIONS` vector, exit 2):

```
$ env "NODE_OPTIONS=--require …/fixtures/forger-round39.cjs" node .../measure-c1-round43.mjs --battery-probe
PROBE_EXIT=2
{"schema":"tabi-r43-battery-probe","contaminated":true,"finding":"environment-loader-contamination","self":{"forbiddenNames":["NODE_OPTIONS"],…},"child":{"…,"forbidden":["NODE_OPTIONS"],"ok":false}}
```

So the six refusal cases are genuine gate detections: the forbidden loader variable is observed in
the child's own kernel exec-time `/proc/self/environ` **and** in the parent's `/proc/<ppid>/environ`,
and the gate marks the run contaminated → exit 2 with finding
`environment-loader-contamination`. The clean case reaches exit 0 with `contaminated:false`.

---

## 3. Evidence files (all under this seat dir)

| path | sha256 | what |
|------|--------|------|
| `.ufo/waves/round-43/w1/ExecC1Battery/evidence/battery-run.json` | `6cb61f1150406e490ec9ba8f54353bf0b8d7ce02ccd31df8388d17d813ef9aed` | primary battery stdout |
| `.ufo/waves/round-43/w1/ExecC1Battery/evidence/battery-run2.json` | `6cb61f1150406e490ec9ba8f54353bf0b8d7ce02ccd31df8388d17d813ef9aed` | repeat battery stdout |
| `.ufo/waves/round-43/w1/ExecC1Battery/evidence/battery-run-cwd-root.json` | `6cb61f1150406e490ec9ba8f54353bf0b8d7ce02ccd31df8388d17d813ef9aed` | battery stdout, cwd `/` |
| `.ufo/waves/round-43/w1/ExecC1Battery/evidence/shape-compare.json` | `5fd59af355b47bb5d23d49339508c668b432a7828fd4b00b4bbd8b8d2b5ca5a7` | field-by-field comparison vs committed control |
| `.ufo/waves/round-43/w1/ExecC1Battery/evidence/compare-shape.mjs` | `f6df0158d90f38118928ebb3df831e945fbc05ea6180d4af7a05514ff881a0c9` | comparator source |
| `.ufo/waves/round-43/w1/ExecC1Battery/evidence/probe-clean.json` | `43cdf3fc3c193ab165404ecafd5e1ecf30f981da11446f1a35a436ad8d8ab29f` | clean probe detail |
| `.ufo/waves/round-43/w1/ExecC1Battery/evidence/probe-node-options.json` | `3dcbe04bfeb5176729dca0abd49ea91f43c2953f6774bfb12ca7be543b748f1b` | contaminated probe detail |
| `.ufo/waves/round-43/w1/ExecC1Battery/evidence/probe-exit.txt` | `d60b9c86f56b5286c820825430483fb54e196f664516894629b79c6cd603aefe` | observed probe exit codes |
| `.ufo/waves/round-43/w1/ExecC1Battery/evidence/environment.txt` | `eb98ddfaa4c194d213cec44a9a9c06464202cfb8981e9998a36916d0c12bda2b` | node/uname/digests/HEAD |
| `.ufo/waves/round-43/w1/ExecC1Battery/evidence/SHA256SUMS.txt` | (listing) | digests of the above |

Scratch root `/fast/scratch/hyaku/tabi-r43/ExecC1Battery/` was deleted before yield; the receipts
that matter are the copies above.

---

## 4. Tooling

No install or upgrade performed. Node `v24.21.0` (already present), `git` (already present),
coreutils were sufficient. `pacman` was not run (host-wide pacman transactions are paused).
Per `/home/vgpnk/.omp/agent/RULES.md`, no channel was needed because no tool was missing.

---

## 5. Limitations / scope notes

- This seat exercised **only** the battery mode (`--battery` / `--battery-probe`) of
  `measure-c1-round43.mjs`: spawn-level environment-loader refusals. It did **not** run the
  Playwright/Firefox loopback chain, the Ed25519 measure record, the independent witness, or the
  fd3/fd4 counter challenge-response — those are other seats' scope. The battery's 7/7 says
  nothing about the signature-authenticated admission claim beyond "the battery is operable and
  behaves exactly as the committed control records".
- The battery is env-gate only by construction: `libforger.so` in the r41 fixtures is a 0-byte
  file and `shadow_modules/` is an empty directory, so the `ld-preload` and `node-path` refusals
  are triggered by **forbidden-env-name detection**, not by any loader actually executing. That is
  the gate semantics the control claims, but it does mean these two vectors do not demonstrate
  "a preload succeeded and was caught" — they demonstrate "a preload request was refused before
  any preload could matter". Observed and reported; not a defect in the battery's own contract.
- `execArgv` cleanliness is reported by the probe as `[]` in the self view and `["--eval"]` in the
  child gate view; both are reported clean.
- The comparison is against the committed control's *shape* (`schema`, `allPass`, and per-case
  `case|vector|exit|finding|pass` in order) as instructed. In this instance shape equality and
  byte equality coincide because the battery output contains no varying field.
- No production tree, sibling repo, fleet-root tracked file, or `/home/vgpnk/Projects/shokuknow`
  path was written. Only this seat dir and the seat scratch were written. No commit, push, fetch,
  branch or tag operation was performed; `git` use was limited to read-only plumbing.

---

VERDICT ok — battery re-run in scratch gives 7/7 pass with zero shape differences against the committed control (all three runs byte-identical to it); frozen instrument/control/counter/claims bytes verified unchanged.
