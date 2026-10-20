# RevCountCmds — can an outsider paste and run each claim's counting command?

Seat: TabiR16.RevCountCmds-5 (reviewer, read-only). Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Lane HEAD when tested: `e38d2599a922cb729186353830fff8e159b4fef0` (r16 artifacts untracked; no delivered commit yet).
Scope: the two counting commands named in `PLAN.md:14` and `PLAN.md:29`, and the argv contract the C1 gate must reuse
(`PLAN.md:36-77`). Gate/self-test semantics, WebMCP evidence content and scalars are other seats' slices.

The counter was written and then edited five times while this review ran (MeasureCounters is rate-limited since ~11:45,
so the last three blobs were never seen by its author's session). Every row below names the blob it was observed on.

| label | sha256 | size / mtime | state observed |
|---|---|---|---|
| A | `f441295099c4f5d3f4c0e4d69e86ee4f0966b243e77c827d11575a82169063a0` | 34921 B, 11:34 | C1=1 and C2=1 reachable in a synthetic delivered-like commit |
| B | `fc5627da29577b5fbcdb67f7b572604a4d97d3bb1c4984cf915f4bd8428a35e3` | 38769 B, 11:40 | baseline + C2 fine; C1 crashes at receipt-bearing revisions (`text is not defined`) |
| C | `9cccf78f6da1a3b73941e19fdddfec75ec290ea6c0504ef158cd4357cfd8fe0a` | 43567 B, 11:42 | does not parse (`node --check`: duplicate `tokensOf`, :357/:370) |
| D/E | `b59579e3…` (11:43), **`749e33c177449d4671b78f4d8d9588212079f8ef63eb52fdef87c667964e22e1`** (11:44, latest tested) | 42579/42929 B | parses, baseline 0/0; **C1 still exits 2 at receipt-bearing revisions (`measuredRev is not defined`)**; C2=1 |
| gate | `0fbe2e408f3ef93575233568df202d3ac0e6fae8860b450c85b3f6f634140b6f` | 27819 B | not run/certified by this seat |

## Verdict

- **The command shape is right and environment-safe.** On A/B (and baseline on D/E) the counting commands are
  cwd-independent (five spellings, byte-identical stdout), internally Git-env-scrubbed, Node 20/22/24 byte-identical at
  baseline, emit one JSON line on stdout with diagnostics on stderr, and return the documented exit codes (0 counted,
  1 malformed, 2 could-not-evaluate).
- **C1's delivered-HEAD count still cannot be produced from the latest tested blob.** D and E parse and return the 0
  baseline correctly, but as soon as the binding receipt exists the C1 path throws `measuredRev is not defined` (:608
  `void measuredRev;`), exit 2 with empty stdout. C2 reaches 1 on the same fixture.
- **Both counts were reachable in earlier blobs:** A returned `c1_binding_contracts=1` and `c2_webmcp_held=1` in a clean
  fresh clone of a synthetic commit carrying the counter, gate and synthetic receipts; B returned C2=1. So the current
  failure is a regression in the C1 receipt path, not a design dead end. Synthetic receipts prove reachability and the
  read set, not that the real evidence will validate.
- **Two delivery conditions remain:** the counter is still untracked (a checkout of `e38d259` has no
  `.ufo/waves/round-16/measure.mjs`), and the pasted line executes the *working-tree* code, so the reported measurement
  must be taken from a clean tree at the delivered commit.
- **`countedInputs` must be derived from the positive run, not the baseline run.** Baseline C1 lists 3 paths; the C1
  positive path additionally reads the legacy input and (new in D/E) the r15 counter blob, i.e. 5 paths. Baseline C2 lists
  3 paths; positive C2 lists 5. Deriving from baseline silently omits them.

## 1. Exact final command lines

Machine form (meets "argv only, no shell"):

```
{"cwd":"/home/vgpnk/Projects/shokunin/tabi-shokunin",
 "argv":["node",".ufo/waves/round-16/measure.mjs","<DELIVERED_HEAD_40>","--claim","C1"]}

{"cwd":"/home/vgpnk/Projects/shokunin/tabi-shokunin",
 "argv":["node",".ufo/waves/round-16/measure.mjs","<DELIVERED_HEAD_40>","--claim","C2"]}
```

Baseline ("before") form, literal and already known:

```
{"cwd":"/home/vgpnk/Projects/shokunin/tabi-shokunin",
 "argv":["node",".ufo/waves/round-16/measure.mjs","e38d2599a922cb729186353830fff8e159b4fef0","--claim","C1"]}

{"cwd":"/home/vgpnk/Projects/shokunin/tabi-shokunin",
 "argv":["node",".ufo/waves/round-16/measure.mjs","e38d2599a922cb729186353830fff8e159b4fef0","--claim","C2"]}
```

Human paste line, cwd-independent (observed identical bytes from `/tmp` on A/B):

```
node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-16/measure.mjs <DELIVERED_HEAD_40> --claim C1
node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-16/measure.mjs <DELIVERED_HEAD_40> --claim C2
```

cwd-bound form the PLAN quotes (`PLAN.md:14`, `:29`), valid only from the lane root:

```
cd /home/vgpnk/Projects/shokunin/tabi-shokunin
node .ufo/waves/round-16/measure.mjs <DELIVERED_HEAD_40> --claim C1
node .ufo/waves/round-16/measure.mjs <DELIVERED_HEAD_40> --claim C2
```

Printing rules for the r16 report:

- **Never print `REV`, `{REV}` or `$(git rev-parse HEAD)` in a counting command.** The counter rejects an unresolvable
  positional with exit 2 and empty stdout (observed: `deadbeefhidden` -> exit 2, stderr
  `MEASURE verdict=could-not-evaluate detail=Cannot resolve revision: deadbeefhidden`). `$(...)` is a shell
  substitution and breaks the argv-only claim. Print the literal 40-hex and, separately,
  `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse HEAD`.
- `<DELIVERED_HEAD_40>` must equal the manifest `measuredRevision` (`PLAN.md:41`) and `after.revision` (`PLAN.md:46`);
  otherwise `--reproduce` measures a different object than the claim.
- Quote the count fields, not a byte-identical stdout transcript: C1 `c1_binding_contracts`, C2 `c2_webmcp_held`. The
  `commands` block embeds the absolute path `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh`, so stdout differs
  across checkouts even when the count does not. C1's baseline stdout shape also changed between A and D
  (`c1_selftest_receipt.caseLines`, `c1_legacy_receipt.claims` array -> object).
- `--histogram` is available as `["node",".ufo/waves/round-16/measure.mjs","<REV40>","--histogram"]`; observed keys
  `revision,source_histogram,note_map,inputsRead,commands`, exit 0. Do not combine it with `--claim`.

## 2. Observed matrix

Baseline reference (`--claim C1` at `e38d259`, exit 0): A/B stdout sha256
`04cbfef0825bd4d2c005877391549059560a9f314c66229509edd5124bf22cd6`; D/E changed the C1 output shape and sha to
`dc95bad1b473c7c208d1c7f690ed6c3f55ef6a641814c2d16793207916104870` with
`{"c1_binding_contracts":0,"c1_gate":"absent",…,"c1_selftest_receipt":{"present":false,…,"caseLines":0,…},"c1_legacy_receipt":{"present":false,…,"claims":{}},"inputsRead":["corpus/evidence/round-16/binding/legacy-r15.json","corpus/evidence/round-16/binding/selftest.json","scripts/check-measurement-binding.mjs"]}`.
Baseline `--claim C2` exit 0, unchanged across all blobs: `"c2_webmcp_held":0`, `inputsRead` = README, webmcp receipt,
knowledge note; sha256 `4a162bc0399c49dd341d015f05b6b0befa0ecbf76d42f3c79726cc5adaccc5a7`.

| # | Condition | Blob | Observed |
|---|---|---|---|
| C1 | lane root, relative path | A, B, D | exit 0; A/B sha `04cbfef0…`, D sha `dc95bad1…` |
| C2 | `/tmp`, absolute path | A, B | exit 0, sha `04cbfef0…` (`/tmp` run of D not repeated) |
| C3 | parent cwd, `tabi-shokunin/.ufo/…` | A | exit 0, same sha |
| C4 | `scripts/` subdir, `../.ufo/…` | A | exit 0, same sha |
| C5 | symlinked script `/tmp/measure16-symlink.mjs` from `/tmp` | B | exit 0, same sha (ROOT from `import.meta.url`, counter `:100`) |
| C6 | documented minimal env (`env -i` + GIT_CONFIG_NOSYSTEM/GIT_CONFIG_GLOBAL/GIT_NO_REPLACE_OBJECTS/GIT_OPTIONAL_LOCKS/GIT_TERMINAL_PROMPT/TZ=UTC, PATH/HOME) | A | exit 0, same sha |
| N1–N3 | Node v20.20.2 / v22.23.3 / v24.21.0 | A (C1+C2), B (C1) | baseline shas `04cbfef0…` / `4a162bc0…` identical on all three; exit 0 |
| G1–G5 | `GIT_DIR`, `GIT_OBJECT_DIRECTORY`, `GIT_COMMON_DIR`, `GIT_REPLACE_REF_BASE`, `GIT_INDEX_FILE`, hostile `GIT_CONFIG_GLOBAL` | A (one at a time), B (G1–G4 combined) | exit 0, `c1=0`, stderr empty — ambient values ignored |
| A1 | `--claim C2 <rev>` (claim before revision) | A | exit 0, C2 object; parser unchanged in B |
| A2 | `--claim C1 --claim C2` | A | exit 0, last `--claim` wins: C1 field absent, C2 present (undocumented; print one claim per line) |
| A3 | extra positional; bogus revision; missing revision; missing `--claim` value; unknown claim; `--histogram --claim C1`; no args | A/B | exit 2, **empty stdout**, stderr `MEASURE verdict=could-not-evaluate …` |
| X0 | r15 template at its delivered HEAD `36240c7`, fresh clone, clean tree | r15 | exit 0, counts 1/1; stdout `revision` = `36240c7…` while r15's `measurements.json` recorded `b7cf044…` — the defect the r16 binding must close |
| X1 | C1 at a synthetic committed delivered-like state | A | exit 0, `c1_binding_contracts=1`, read set 4 paths |
| X2 | C1 at the same synthetic state | B | **exit 2, empty stdout, `MEASURE verdict=could-not-evaluate detail=text is not defined`** |
| X3 | C2 at the same synthetic state | B/D | exit 0, `c2_webmcp_held=1`; positive tools-added and flag-off control parsed |
| X4 | fresh `--no-local` clone of the synthetic commit, clean tree, mode 100755 | A | C1 exit 0 count 1; C2 exit 0 count 1; absolute-path run identical |
| X5 | `node --check` | C | exit 1, `SyntaxError: Identifier 'tokensOf' has already been declared` (:357 and :370) |
| X6 | C1 at the synthetic state | D/E | **exit 2, empty stdout, `MEASURE verdict=could-not-evaluate detail=measuredRev is not defined`** |
| D1 | untracked `junk.txt` added in the synthetic repo | A | count and sha unchanged (reads are from git objects) |
| R1 | revision spelled `e38d259`, `HEAD`, or the full 40-hex | B | all resolve to the same commit; stdout sha identical |

Exit contract observed at the tail handler: stdout is exactly one JSON line; `MEASURE verdict=…` goes to stderr;
malformed evidence -> count 0 exit 1; usage/unresolvable/crash -> exit 2 with empty stdout
(`:868-873` in A/B; `emit` `:773-779`).

## 3. C1-path failures observed while the counter was in flux

**B — ReferenceError as soon as the receipt exists.**
```
$ node .ufo/waves/round-16/measure.mjs <receipt-bearing-rev> --claim C1
MEASURE verdict=could-not-evaluate detail=text is not defined     # stderr
$ echo $?
2                                                                 # stdout empty
```
`const text = outputOf(run)` was declared inside `if (run) { … }` (B `:447`, block closes `:470`); the new block at
`:471-497` (`selftestCaseList(text)`, `result.selftest.caseLines`, `selftest_tally`) sat outside it and also referenced
`summary` (`:492`) from the same block. Baseline still returned 0 because the receipt is absent and the path is skipped —
the break appeared only at the delivered state, exactly what the report would paste.

**C — the file did not parse.**
```
$ node --check .ufo/waves/round-16/measure.mjs
measure.mjs:370
function tokensOf(text) {
^
SyntaxError: Identifier 'tokensOf' has already been declared
```

**D/E — still broken on the C1 receipt path.**
```
$ node .ufo/waves/round-16/measure.mjs <receipt-bearing-rev> --claim C1
MEASURE verdict=could-not-evaluate detail=measuredRev is not defined   # stderr
$ echo $?
2                                                                      # stdout empty
```
Line 608 is `void measuredRev;`; `void` does not swallow the reference, and `measuredRev` is never declared. The intended
ancestry check around it (`manifestMeasured = resolveCommitish(measurements.measuredRevision)`, `:573-575`) already exists,
so the line is a leftover. Delete it or wire the check it was meant to perform.

Reproduction without lane writes: any commit whose `corpus/evidence/round-16/binding/selftest.json` exists. I used a
synthetic repo under `/tmp/tabi-r16-synth` (counter copied, gate copied, receipts pinned to the gate's sha256). A returns
1 on the same fixture, D/E crash, so the fixture is not the variable.

## 4. `countedInputs` to declare (exact)

Positive-state `inputsRead` observed with A (C1, 4 paths) and B/D (C2, 5 paths). The D/E legacy branch additionally reads
`.ufo/waves/round-15/measure.mjs` through the sink-enabled reader (`read.sha(R15_COUNTER)`, around `:592`), so C1's
positive set must grow to 5 paths; that is read from code, not yet observed because X6 crashes before returning:

- C1 positive: `[".ufo/waves/round-15/measure.mjs","corpus/evidence/round-15/measurements.json",
  "corpus/evidence/round-16/binding/legacy-r15.json","corpus/evidence/round-16/binding/selftest.json",
  "scripts/check-measurement-binding.mjs"]`
- C2 positive: `["corpus/README.md","corpus/SOURCES.md","corpus/evidence/round-16/webmcp/receipt.json",
  "corpus/knowledge/webmcp-chromium-loopback-round-16.md","scripts/webmcp-loopback-round16.mjs"]`

Recommendation: `countedInputs` = union of `inputsRead` at `before.revision` and at `measuredRevision`. Baseline reads the
three receipt/gate paths only; positive reads add the legacy input + r15 counter (C1) and SOURCES + harness (C2). If L1
copies only the baseline run, a later edit to `corpus/SOURCES.md` or the harness blob cannot trip `counted_input_changed`
(`PLAN.md:56`) even though it can change the count.

## 5. Manifest argv constraint

`argv_unsupported` (`PLAN.md:57`) requires `argv[0]` exactly `node`, `argv[1]` exactly
`.ufo/waves/round-16/measure.mjs`, and exactly one `{REV}` token. So the manifest argv is:

```
["node",".ufo/waves/round-16/measure.mjs","{REV}","--claim","C1"]
```

The human absolute-path line in section 1 is a different (cwd-independent) spelling of the same command; do not put it in
the manifest, and never put `{REV}` into the report's paste line.

## 6. Findings by severity

**P0 — the C1 delivered-HEAD command still returns no count.** Latest tested blob E (`749e33c1`, 11:44) parses and
baselines 0/0, but every receipt-bearing revision exits 2 with `measuredRev is not defined` (section 3). The two blobs
before it failed with a runtime scope error (B) and a duplicate declaration (C). The report must not quote a C1
after-count until the release gate in section 8 passes on the final blob; if C1 needs an honest 0 this round, saying so is
better than quoting an un-runnable command.

**P1 — the counter is not committed, so there is no delivered-HEAD command yet.** At `e38d259`,
`git ls-tree -r --name-only e38d259 -- .ufo/waves/round-16 corpus/evidence/round-16 scripts/webmcp-loopback-round16.mjs
scripts/check-measurement-binding.mjs` returns 0 paths, and
`git cat-file -e e38d259:.ufo/waves/round-16/measure.mjs` fails with
`fatal: path '.ufo/waves/round-16/measure.mjs' exists on disk, but not in 'e38d259…'`. An outsider cloning `e38d259` gets
`MODULE_NOT_FOUND` for the exact command in `PLAN.md:14`. L1 must commit the counter, gate, receipts and note.

**P1 — `countedInputs` from the baseline run is incomplete.** Evidence in section 4: C1 3 vs 5 (expected) paths, C2 3 vs
5 paths. The counter is honest (`inputsRead` is "paths read at this revision"), so the hazard is entirely in how the
manifest is assembled. Use the union, and re-observe C1's set after the X6 fix.

**P2 — the pasted command executes working-tree code, so "clean tree at the delivered commit" is part of the command.**
Demonstrated on the r15 template: a constant-1 replacement of the counter on disk printed
`{"c1_truthful_diagnostics":1,"c1_receipt":1}` exit 0 while `git status` showed the file modified. For r16, adding an
untracked file does not change the count (D1), but editing the counter does — the counter changed five times under this
review (11:34 -> 11:44). Print `git status --porcelain` (expect empty) before the commands, and take the measurement there.

**P2 — preconditions that argv cannot fix must be printed with the command:** `NODE_OPTIONS` unset (observed
`--require` injection prepends `INJECTED_BEFORE_JSON` to stdout, exit 0), `node` and `git` on PATH (observed exit 2, empty
stdout, stderr-only `Cannot resolve revision: …` when git is absent), and the actual `node --version`/`git --version`
recorded. Node 20/22/24 equivalence holds for the blobs tested; r15's committed `node-version.json` (`v26.12.0`) is not a
valid pin for r16 (host PATH resolves `v24.21.0`).

**P3 — stdout is not portable across checkouts.** `commands.census_histogram` is an absolute lane path; two outsiders at
different paths get different stdout bytes for the same count. Quote the count field and `inputsRead` (repo-relative), not
a stdout digest, as the identity proof. C1's own stdout shape also changed between A and D, so a stdout transcript from an
earlier blob is not evidence about the delivered one.

**P3 — argument tolerances to pin in the report:** claim-before-revision works; a duplicated `--claim` silently takes the
last value, so a paste that accidentally carries both claims reports C2 under a C1 heading; unknown claim, extra
positional, missing revision, missing value and `--histogram`+`--claim` all exit 2 with empty stdout. Print exactly one
claim per line.

**P3 — do not copy `commands.binding_check` from the counter's stdout as the gate proof.** It is a display string:
`node scripts/check-measurement-binding.mjs --check corpus/evidence/round-16/measurement-binding.json`, with no `--at` and
no `--reproduce`. If L1 quotes it, extend it with `--at <DELIVERED_HEAD_40> --reproduce` (BindCore's documented syntax) and
say which form was actually run.

**Verified fixed (no action):** ambient Git state no longer leaks — `GIT_DIR`, `GIT_OBJECT_DIRECTORY`, `GIT_COMMON_DIR`,
`GIT_REPLACE_REF_BASE`, `GIT_INDEX_FILE` and a hostile `GIT_CONFIG_GLOBAL` were each ignored (G1–G5), because the counter
spawns git with an explicit `GIT_ENV` (`:136-151`). This closes the r15 template failure where `GIT_DIR` produced exit 2
and a replace ref flipped the count; ambient replace refs are neutralized by `GIT_NO_REPLACE_OBJECTS=1`. cwd independence
(C1–C5) and Node-major independence (N1–N3) are likewise verified for the runnable blobs.

## 7. Residual risk and verification gaps

- The real delivered commit does not exist; the positive counts come from a synthetic repo. They prove the command reaches
  1 and the read set, **not** that the real gate receipts/WebMCP evidence will validate. On D/E only C2 is demonstrable
  end-to-end.
- `scripts/check-measurement-binding.mjs` landed but I did not run it, its `--self-test`, `--legacy` or `--reproduce`;
  that is BindCore's slice. Whether its own argv handling is cwd/env-safe is unverified.
- The C2 count depends on L1-owned bytes not yet committed (`corpus/knowledge/webmcp-chromium-loopback-round-16.md`,
  `corpus/README.md` mention, `corpus/SOURCES.md` row, `corpus/evidence/round-16/webmcp/receipt.json`). Until then the real
  C2 command honestly reports 0.
- MeasureCounters is rate-limited (last wake failed; reset ~16:26 UTC), so the P0 must be fixed by whoever L1 assigns, then
  re-gated. Every row names its blob; re-run section 8 on the delivered blob.
- Not tested on Windows/macOS; `spawnSync` argv and `git show` are portable in principle, but path casing/line endings were
  not observed. Target host is linux x64.
- Git version: `rev-parse --verify`, `ls-tree -r`, `show`, `merge-base --is-ancestor` are all available since git 1.8. The
  only version-specific artifact seen is git 2.56.0's `GIT_REPLACE_REF_BASE` abort, which the counter avoids by not
  inheriting the variable.

## 8. Release gate and re-run recipe for L1 (verbatim)

```
REPO=/home/vgpnk/Projects/shokunin/tabi-shokunin
cd "$REPO"
git status --porcelain                    # expect empty
git rev-parse HEAD                        # paste this literal 40-hex as <DELIVERED_HEAD_40>
node --version; git --version
sha256sum .ufo/waves/round-16/measure.mjs # record it; the report and manifest must cite this byte identity

node --check .ufo/waves/round-16/measure.mjs   # GATE 1: exit 0
node .ufo/waves/round-16/measure.mjs e38d2599a922cb729186353830fff8e159b4fef0 --claim C1   # GATE 2: 0, exit 0
node .ufo/waves/round-16/measure.mjs e38d2599a922cb729186353830fff8e159b4fef0 --claim C2   # GATE 2: 0, exit 0
node .ufo/waves/round-16/measure.mjs <DELIVERED_HEAD_40> --claim C1                         # GATE 3: 1, exit 0
node .ufo/waves/round-16/measure.mjs <DELIVERED_HEAD_40> --claim C2                         # GATE 3: 1, exit 0

# cwd-independent spelling, run from anywhere:
cd /tmp && env -u NODE_OPTIONS node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-16/measure.mjs <DELIVERED_HEAD_40> --claim C1
```

Measure only at a commit that already contains the counter, gate, both receipts and the WebMCP note/receipt; at any earlier
commit `c1_gate` is `"absent"` and the count is honestly 0. If the measurement record is committed afterwards, either cite
the evidence-bearing commit as `measuredRevision` or re-run at the final HEAD; every read is revision-based, so an
evidence-free later commit does not change the count (R1/D1). Build `countedInputs` from the union of `inputsRead`
before/after (section 4). Any stderr `MEASURE verdict=failed`, any exit 1/2, or a non-empty `git status --porcelain` means
the pasted command did not do what the report says.

## 9. Tooling

- Installed Node **v22.23.3** and **v20.20.2** via the existing `fnm 1.39.0` (fnm -> official nodejs.org binaries; reason:
  Node-version sensitivity of the counting command). No pacman transaction was run (host-wide pause respected); no other
  installs/updates.
- No repo writes except this report. Synthetic repos and shims under `/tmp` (`/tmp/tabi-r16-synth`, `/tmp/synth-clone`,
  `/tmp/inject.cjs`); the lane was only read.
