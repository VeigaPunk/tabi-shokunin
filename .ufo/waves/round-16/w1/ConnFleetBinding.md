# ConnFleetBinding — round 16 wave 1 report

Owned output: this report only. Nothing else written; no subagent; no gate/selftest/counter/browser
executed; no tool installed. All reads below are read-only: 55 `*/corpus/lessons/*verifier-spotcheck*.md`
files enumerated across 21 lanes, selected sections opened, plus read-only `git cat-file`/`git show`/
`sha256sum`/`merge-base` over the tabi repo.

## Question and answer

Do other lanes route the same two defect classes tabi's C1 cites — a counter pinned only by revision,
and a measurement taken at a revision other than the delivered HEAD — and is there a shipped,
reusable fix shape?

**Yes, both, in five lanes; and the fleet's fix shapes converge on one invariant tabi's spec does not
yet enforce. Separately, the r15 legacy manifest tabi's C1 counter must consume is *not uniform*: C2
records a counter digest and C1 does not, and C2's recorded digest does not exist at the manifest's
own `measuredRevision`. As written, `PLAN.md:77` requires a finding that an honest adapter cannot
produce, so the declared 0→1 would fail its own counter.** Evidence below.

## Evidence A — fleet pattern census

| # | Pattern | Lane anchors (path:line) | Fleet wording / remedy |
|---|---|---|---|
| P1 | Counter identity pinned by revision only; no byte digest | `tabi-shokunin/corpus/lessons/round-15-verifier-spotcheck.md:120` | "pins C1's counter only as `counterCodeRevision 27dfd98` (`measure.mjs` sha256 `3ee59de0…`) … Record the counter digest per claim, and say which counter revision reproduces each receipt." |
| P2 | Measured revision ≠ delivered revision | tabi r15:121; `kama-…/round-13-verifier-spotcheck.md:30`, `round-14:23`, `round-15:23`; `mado-…/round-15:126` | kama repeats the rule each round: "All measurements below end at the author-delivered revision, not this verifier commit." tabi r15: "Future rounds should measure at, or explicitly diff to, the delivered HEAD." |
| P3 | Two-sided digest check (at measured revision **and** at delivered) | `kama-…/round-14:82`; `kama-…/round-15:109`; `mado-…/round-14:104`; `mado-…/round-15:136-137`; `tameshi-…/round-14:84`; `tameshi-…/round-15:93`; `kake-…/round-21:62`; `tsukuroi-…/round-13:124` | kama r14: "Tool, cases and measure.py blobs at the measured revision equal delivered blobs." tameshi r15: "**11/11 matches at measured7650fe4 and11/11 at delivered9f2c86f**." kake: "measured revision equals the closed tree for the gate and claim populations." |
| P4 | Digest that names no revision (captured off-tree) | `souji-…/round-15-verifier-spotcheck.md:125` | R4: "pins `tools/souji-census.sh` at `b5187351…`, which no committed revision has. Re-pin after R1 and record the frozen verdict with its measured revision." |
| P5 | Receipt carries no measured revision / gate digest of its own | `mado-…/round-13:205`; `mori-…/round-13:135`; fixed at `mado-…/round-14:108`, `:113` | mado R13-V3: "future standalone selftest receipts should carry the measured gate revision/digest." mori: "Historical 24/24 at 80bd58a is not a c13df48 selftest." mado r14 ships the *enforced* form: `provenance-red.txt` = old receipt fails (exit 1) for "missing measured_commit/gate_sha256"; `provenance-green.txt` = new receipt passes. |
| P6 | Temporal overclaim: a digest map read as "unchanged during the run" | `kaidoku-…/round-16:183` | R16-PROVENANCE: "Independent comparison proves only that recorded hashes match committed S/A bytes20/20, not that files were stable throughout the run … say 'map matches committed source-revision blobs; temporal stability not evidenced'." |
| P7 | Check ordering decides what a receipt can evidence; exit 2 outranks 1 | `mado-…/round-16:167`; `kotodama-…/tools/replay-frozen.py:21`, `:27-39` | mado R16-V1: a pair defect "fired before any digest check", so the receipt labelled `snapshot_tampered` actually recorded `frozen_error`. kotodama: "verifies gate_sha256, the input_snapshot's input_sha256 … *before* any gate runs"; "Exit 2 has precedence over exit 1". |

P1–P3 are the same defect at three depths: revision→pinned-without-bytes, measurement→older-than-delivery,
and (the remedy) bytes-at-both-revisions. P4 and P5 are the two ways a digest can be unmoored
(no revision at all; no header in the receipt). P6 is the wording limit any binding gate inherits.
P7 is the part tabi's spec leaves implicit.

## Evidence B — reusable implementation shapes (not copyable code; check shapes)

- `kotodama-shokunin/tools/replay-frozen.py:21` — verify `gate_sha256` / `input_sha256` / `output_sha256`
  **before** executing anything; refuse unsafe paths before normalization; never parse the recorded
  command string. Exit 2 (could-not-evaluate) outranks exit 1 (`:27-39`).
- `souji-shokunin/tools/souji-evidence-cache.py:70-73` — `measured_commit` is required, 40 lowercase
  hex, and "never defaulted from a top-level field, HEAD, or any previous attempt". `:203-224` states
  the load-bearing precondition: digests "must have been captured by the runner at measurement time";
  backfilling them "pairs a digest with a revision that was never measured together, and this gate
  cannot detect that". Also: "point-in-time at evaluation … no historical execution is attested."
- `souji-shokunin/tools/souji-preservation-evidence.py:1263-1267` — `run-inconsistent` when
  `runs.changed.tool.commit != measured_commit`; `:1287-1290` the same for a control arm; recorded
  digest vs observed digest is `binding-digest-mismatch`.
- `chousa-shokunin/tools/research-gate.sh:2552` + `:2562-2568` — `GATE_DRIFT_VOLATILE_FIELDS='ts gate_sha256'`:
  a digest that is *inside* the artifact it describes must be masked as volatile, or every comparison
  self-drifts.
- `mado-shokunin` provenance pair (`corpus/lessons/round-14-verifier-spotcheck.md:113`) — the receipts
  are red/green over one contract: a receipt lacking `measured_commit`/`gate_sha256` exits 1. This is
  the closest shipped analogue to tabi's `gateSha256` field.

No sibling lane ships tabi's exact triple (per-claim counter digest + declared counted-input set +
reproduce mode); the fleet supplies the individual checks and their failure ordering, not the composite.

## Evidence C — tabi-specific: the r15 legacy file is not uniform (blocking)

Read-only commands, all in `/home/vgpnk/Projects/shokunin/tabi-shokunin`:

```
$ for r in 27dfd98 9fd8bca b7cf044 36240c7 HEAD; do
    printf '%s ' "$r"; git show "$r:.ufo/waves/round-15/measure.mjs" | sha256sum | cut -c1-16; done
27dfd98 3ee59de095750e08
9fd8bca dd9c8675ab9bbc91
b7cf044 3ee59de095750e08
36240c7 dd9c8675ab9bbc91
HEAD    dd9c8675ab9bbc91

$ git log --oneline --reverse 27dfd98^..e38d259
27dfd98 round-15: repair falsified diagnostics and evidence oracles
b7cf044 round-15: retain exercised evidence and source-grounded lessons
9fd8bca round-15: parse actual ARIA evidence without changing outcomes
36240c7 round-15: record verified diagnostic and metadata improvements
e38d259 round-15 verifier spot-check (integrator, hyaku): non-author admit/reject
```

`b7cf044` (the manifest's `measuredRevision`) is an ancestor of `9fd8bca` (C2's `counterCodeRevision`).
Both `after.command` rows in the manifest are `node .ufo/waves/round-15/measure.mjs b7cf044… --claim C1|C2`
with `cwd` = the lane, i.e. **the script executed is the worktree file, while the revision argument only
selects the data** — the same structural gap tabi's `--reproduce` inherits.

Manifest facts (`corpus/evidence/round-15/measurements.json`):

| Claim | Field | Value |
|---|---|---|
| C1 | `counterCodeRevision` (:65) | `27dfd98…` → blob `3ee59de0…` |
| C1 | `counterSha256` | **absent** |
| C2 | `counterCodeRevision` (:131) | `9fd8bca…` → blob `dd9c8675…` |
| C2 | `counterSha256` (:132) | `dd9c8675…` |
| both | `measuredRevision` (:4) | `b7cf044…` → blob `3ee59de0…` |

Consequences for the round-16 contract as written:

1. `PLAN.md:65` says the legacy schema has "no digest/inputs". **False for C2**: C2 records a 64-hex
   `counterSha256` that resolves exactly at `9fd8bca` and at HEAD.
2. `PLAN.md:77` requires the committed `legacy-r15.json` to show "`counter_digest_unrecorded` for both
   r15 claims". An adapter implementing its own reason trigger — `counter_digest_unrecorded` (no
   sha256) at `PLAN.md:55` — must **not** emit it for C2. Emitting it for C2 is a false finding;
   withholding it makes the C1 counter's pass condition unreachable (C1 counts 0, declared 0→1 fails).
3. C2's recorded digest is **not** the blob at the manifest's `measuredRevision` (`dd9c8675…` vs
   `3ee59de0…`), because `9fd8bca` postdates `b7cf044`. The r15 manifest has no per-claim
   measurement revision and no field naming where C2's counter actually ran — the "backfill" limit
   `souji-evidence-cache.py:203-224` says such a gate cannot detect. This is a *third* r15 identity
   defect, adjacent to but distinct from the routed 1 and 2; it is exactly the shape r16's per-claim
   `measuredRevision` was introduced to fix, but only the **native** mode checks it.

Honest finding set for the real file at HEAD (sorted, exit 1) — **five**, not four and not six:

```
C1 counter_digest_unrecorded            (no sha256)
C1 counted_inputs_undeclared            (no input list)
C1 counter_changed_since_measurement    (3ee59de0… at 27dfd98/b7cf044 vs dd9c8675… at HEAD)
C2 counted_inputs_undeclared
C2 counter_digest_mismatch              (recorded dd9c8675… ≠ blob 3ee59de0… at measuredRevision b7cf044)
```

`measured_revision_not_ancestor` must not fire: `b7cf044` is an ancestor of HEAD (verified; agrees with
`w1/BindLegacyEvidence.md`). `BindLegacyEvidence.md`'s digest table matches this report byte-for-byte,
but its "failure signature on real data" line is C1-only if the adapter honors C2's recorded digest;
its evidence JSON should carry the C2 `counterSha256` row so the fixture can prove the split.

## Affected axes

| Axis | Effect | Why |
|---|---|---|
| **operability (C1, 8 — lowest tie)** | **improves** | The gate's verdict becomes attributable and actionable: one reason per real defect instead of a flattened false positive. Without this, the declared 0→1 either needs a false finding (quality harm) or counts 0. |
| quality | protected, not claimed | A gate that reports `unrecorded` over a recorded digest would be a new quality defect in the very artifact C1 counts. |
| depth / coverage / freshness / adjacency | unchanged | No scalar, source row, registry cell or knowledge note is touched; C2 (`webmcp-cdp-observation`) is untouched. |
| capability (C2) | unchanged | The move lives entirely in the C1 binding gate and its counter condition. |

The move is not a scalar claim; it changes only *which* findings C1's existing 0/1 counts, inside the
already-declared `operability 8` claim. No axis is traded.

## Proposed move (one)

**Bind the bytes, not the path — in both modes.** One invariant ("identity is a blob digest resolved at
the claim's own measured revision, and the bytes executed must be that blob"), two enforcement points,
one counter-condition correction. Both are additions to data the gate already loads; neither adds a
dependency, a network call or a new file format.

1. **`--legacy`: honor a recorded digest.** A `counterSha256` present in the legacy schema is
   authoritative. Apply the existing `counter_digest_mismatch` reason against the claim's effective
   `measuredRevision`; emit `counter_digest_unrecorded` only where the digest is absent. On the real
   file this yields the five-finding set above. Then correct the C1 counter condition
   (`PLAN.md:77`) from "`counter_digest_unrecorded` for both r15 claims" to "`counter_digest_unrecorded`
   for C1 **and** `counter_digest_mismatch` for C2" — a sharper pair that a path-only adapter cannot
   satisfy and a digest-honoring adapter reproduces exactly. Reuse the existing vocabulary; no new
   reason and no selftest-vocabulary change are needed for this half.
2. **`--reproduce`: hash the file about to be spawned.** Before `spawnSync`, hash `<repo>/argv[1]`,
   require it to be a regular file whose realpath is under `<repo>`, and require
   `sha256 == claim.counter.sha256`. On mismatch emit `counter_exec_digest_mismatch`, exit 2, and
   **do not spawn**. Rationale is tabi-specific, not stylistic: `measure.mjs:159` derives
   `ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')`, so a temp mirror would
   silently retarget the repo — hash-before-exec is the only sound form here, unlike kotodama's
   snapshot mirror (`replay-frozen.py:21`). One check covers both r15 symptoms: a dirty worktree, and
   a `--at` revision whose counter blob differs from the pinned one (the exact P1 defect). This is
   `kotodama`'s verify-before-run ordering and `souji`'s "digest and revision from the same execution",
   reduced to one `sha256sum`-equivalent read.

Selftest additions (BindSelftest, all with a no-spawn side-effect marker):

- clean `--reproduce` → exit 0, counter stdout parsed, exactly one spawn marker;
- worktree counter mutated by one byte → exit 2 `counter_exec_digest_mismatch`, **zero** spawn markers;
- `--at` an older revision whose counter blob ≠ pin → same reason, zero spawns;
- legacy fixture with a digest absent (C1 shape) → `counter_digest_unrecorded`, and with a digest
  present but not at `measuredRevision` (C2 shape) → `counter_digest_mismatch`; asserting the two
  differ is the positive control that the adapter reads the field.

## Risks

- **Cross-seat interface.** Point 1 changes `--legacy` semantics (BindCore, `scripts/check-measurement-binding.mjs`)
  and the C1 counter's pass condition (MeasureCounters, `.ufo/waves/round-16/measure.mjs`); point 2 adds a
  reason to the exit-2 bucket, which BindSelftest must exercise and the MeasureCounters vocabulary
  check must include. All three are separate owned files, so this needs one coordinated note, not a
  shared edit. If only BindCore lands, C1 counts 0 (the exact failure mode this move removes).
- **The easy wrong fix.** Emitting `counter_digest_unrecorded` for C2 to satisfy the current counter
  text passes the counter and ships a false finding. That trades quality for the operability count —
  the trade the round rule forbids — and a non-author reviewer comparing `measurements.json:132`
  against the receipt will find it.
- **Vocabulary churn.** `counter_exec_digest_mismatch` is new; keep `cases ≥ 12` and "every reason
  exercised" true by construction (add one case, one reason).
- **Self-reference.** Do not place gate-produced receipts or the manifest in `countedInputs`; a
  digest that lives inside the artifact it measures must be treated as volatile, not compared
  (`research-gate.sh:2552`), or `counted_input_changed` fires on the gate's own output.
- **Overclaim guard.** The gate proves blob identity at a revision; it never proves temporal stability
  during a run (`kaidoku r16:183`). Report/lesson wording must stay "blob at REV equals the recorded
  digest", not "the counter was unchanged while measuring".
- **Fail-closed cost.** `--reproduce --at <old rev>` cannot succeed from a newer checkout given
  `measure.mjs:159`; document it as could-not-evaluate rather than weakening the check.

## Verification for L1 (read-only until integration)

```
cd /home/vgpnk/Projects/shokunin/tabi-shokunin
git show b7cf044:.ufo/waves/round-15/measure.mjs | sha256sum   # expect 3ee59de0… (measuredRevision blob)
git show 9fd8bca:.ufo/waves/round-15/measure.mjs | sha256sum   # expect dd9c8675… (C2 recorded counter)
git merge-base --is-ancestor 9fd8bca b7cf044; echo $?          # expect 1 (C2 counter postdates measurement)
node -e "const m=require('./corpus/evidence/round-15/measurements.json');
console.log(Object.hasOwn(m.C1,'counterSha256'), m.C2.counterSha256.slice(0,8))"   # expect false dd9c8675
```

After integration, the three acceptance observations:

```
node scripts/check-measurement-binding.mjs --legacy corpus/evidence/round-15/measurements.json --at HEAD
# exit 1; exactly the five findings above, sorted; no finding for C1's counter_digest_mismatch
node scripts/check-measurement-binding.mjs --check corpus/evidence/round-16/measurement-binding.json --reproduce
# exit 0 on a clean tree; exit 2 counter_exec_digest_mismatch with zero child spawns after a one-byte edit
node .ufo/waves/round-16/measure.mjs HEAD --claim C1
# 1 with the corrected counter condition; 0 under the current "both claims" text (the falsifier)
```

## Files changed

- `.ufo/waves/round-16/w1/ConnFleetBinding.md` (this report, new).

## Tooling

No installs or upgrades. Used `git` (read-only: `cat-file`, `show`, `log`, `merge-base`), `sha256sum`,
`python3` stdlib for JSON key inspection, and `read`/`grep` over lane lesson files. No pacman command
was run; the host-wide pause was not tested. No browser, gate, selftest, counter, or fleet script was
executed.
