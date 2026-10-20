# SimplifyBinding — C1 manifest/gate YAGNI review (tabi round 16, wave 1)

Seat: `TabiR16.SimplifyBinding-5`. Advisory only; L1 re-runs every final check after integration.
Scope: the C1 design text in `.ufo/waves/round-16/PLAN.md:34-77`. The gate and selftest **landed at
11:34 while this review was being written** (`scripts/check-measurement-binding.mjs`, 681 lines;
`scripts/selftest-measurement-binding.mjs`, 356 lines); §4, §5b and §6 cite those bytes so the advice
is actionable against the draft, not just the plan. `measure.mjs` still does not exist. I wrote only
this report and ran no gate, selftest, counter, browser or probe (read-only `git show/rev-parse/log`,
`sha256sum`, `python3 -c json`, `awk`/`grep` on source). Installs: none (pacman pause honored).

## Axes named

1. **Falsifiability (must not drop).** Every planned check must keep a cause-exact red arm and the
   C1 0→1 count must depend on the real round-16 record, not just on files existing.
2. **Maintenance surface (target of this review).** Modes, reasons, fields and selftest cases with no
   consumer and no defect behind them.
3. **Fidelity to the routed defects.** `corpus/lessons/round-15-verifier-spotcheck.md:120-121` is the
   only acceptance text; anything not traceable to those two sentences is a candidate.

## What the routed defects actually require

- **Defect 1** (`:120`): "Record the counter digest per claim, and say which counter revision reproduces
  each receipt." Two obligations: per-claim digest, and a named counter revision that reproduces.
- **Defect 2** (`:121`): "Future rounds should measure at, or explicitly diff to, the delivered HEAD."
  Two allowed arms: equality, or an explicit diff. Equality must **not** be required (see §5c).
- Neither defect mentions argv flags, JSON output, harness directories, or exit-2 diagnostics.

## 1. Essential set (keep)

| Item | PLAN anchor | Why it is load-bearing |
|---|---|---|
| `claims[].id` | :43 | Selects `--claim <id>` and attributes findings. |
| `counter.path` | :44 | Locates the blob; auto-added to the counted-input diff. |
| `counter.sha256` | :44 | Defect 1: the per-claim digest. |
| `counter.countField` | :46 | Only place the counter's claiming field is named (PLAN never names it elsewhere); removing it would move a contract to MeasureCounters for zero gain. **Rejected cut.** |
| `countedInputs` (non-empty) | :47 | The path set defect 2's "explicitly diff" arm needs. |
| `measuredRevision` | :48 | The revision the count describes; defect 2. |
| `count` (was `after.count`) | :50 | Value `--reproduce` compares against. |
| `--check`, `--at`, `--reproduce` | :53 | The only mode that binds. `--at` is two lines and is how a verifier re-checks a delivered commit. |
| `--legacy` | :64-67 | The **red-before arm on the real r15 bytes**; without it the gate never demonstrates it would have caught defect 1. Essential. |
| `--self-test` | :68-70 | Precedent (`scripts/check-user-round-contract.mjs:281-285`, `scripts/check-aria-metadata.mjs:44`) and the receipt producer. Keep **only** as a 4-line relay: `spawnSync(process.execPath,[selftestPath,...],{stdio:'inherit'}); process.exit(status)`. |
| reasons `measured_revision_not_ancestor`, `counter_digest_unrecorded`, `counter_digest_mismatch`, `counter_changed_since_measurement`, `counted_inputs_undeclared`, `counted_input_changed` | :54-57 | One per defect-1/2 failure mode; all fixture-cheap. |
| reasons `counter_failed`, `count_not_reproduced` | :60 | Only two failure modes of reproduction. |

## 2. Cut list (no routed-defect consumer)

| Item | PLAN anchor | Evidence / reason |
|---|---|---|
| `claims[].counter.argv` + reason `argv_unsupported` (:58) + the `{REV}` injection case (:72) | :45,58,72 | argv is fully determined by data already present: PLAN's own count line fixes the shape `node <counter.path> <REV> --claim <id>` (PLAN:26-27, :75) and r15 uses the identical shape (`measurements.json` `C1.after.command` = `["node",".ufo/waves/round-15/measure.mjs","b7cf044…","--claim","C1"]`). `argv[1] === counter.path` is the only asserted property; extra args are unverified and inert. Deriving the argv deletes a field, a reason and **six of the 41 landed selftest cases** (3 negatives + 3 paired controls, `selftest:200-211`). If L1 wants the command as human evidence, keep it as a non-validated `command` note that gates nothing. |
| `--json` | :53,63 | No consumer: the selftest parses text and the C1 counter reads receipts. Precedent has no `--json`; `check-aria-metadata.mjs` uses a single prefixed line (`ARIA_METADATA_JSON `, `:2263-2268`) only for its in-file selftest. Two output paths that can diverge are pure maintenance risk. |
| `--repo <dir>` | :38 | Low value now. Precedent needs it because its default root is script-anchored and it guards self-blessing; this gate's stated default is "git toplevel of cwd" and the landed gate implements no self-blessing guard. The landed selftest passes `--repo` (`selftest:288-289`), so the cut costs one call-site change in a second owner's file (`cwd: repo`) and removes zero cases. Skip it unless BindCore already owns both files; do not churn two owners for one flag. |
| Top-level `round`, `baseline` | :42 | Read by no reason. `baseline` is duplicated by the before-receipt (run the counter at the round baseline; r15 pattern `corpus/evidence/round-15/count-before-c1.json`). |
| `claims[].axis` | :43 | Narrative metadata; the gate never reads it. |
| `before {revision,count}` | :49 | No reason reads it. Landed gate: `check-measurement-binding.mjs:333` resolves `before.revision` and never uses the value; `before.count` is never read. The "0" is produced by running `measure.mjs <baseline> --claim C1` (r15 did exactly this), not asserted in the binding record. |
| `after.revision` | :50 | A second copy of `measuredRevision` with an equality rule. Rename `after.count` → `count` and delete the duplicate. |
| Exit-2 reason explosion `manifest_unreadable`, `manifest_schema_invalid`, `revision_unresolved`, `git_failed` | :61 | Four reasons × four fixtures for a "no verdict" path. Precedent has two tokens for all of it (`usage`, `could_not_evaluate`; `check-user-round-contract.mjs:764`, `:1326`) and puts the cause in `detail`. Landed adds a fifth (`usage`, gate `:106-112`) and six negative fixtures (`selftest:218-250`). Collapse to `usage` + `could_not_evaluate`, keep the closed token (`manifest_unreadable|manifest_schema_invalid|revision_unresolved|git_failed`) in `detail=`: 5 → 2 tokens, and ~12 cases (6 negatives + 6 controls) → ~4. |

Net against the landed draft: 12 → 7 per-claim fields, 3 → 1 top-level fields, 14 → 10 reason
tokens (9 finding + 5 failure → 8 + 2), 7 → 6 flags (7 → 5 if the low-value `--repo` cut is taken;
§2, §8).

## 3. Minimal design (proposed to BindCore)

Manifest `corpus/evidence/round-16/measurement-binding.json`:

```json
{ "schema": "tabi-measurement-binding-v1",
  "claims": [ { "id": "C1",
    "counter": { "path": ".ufo/waves/round-16/measure.mjs",
                 "sha256": "<64-hex blob digest>",
                 "countField": "c1_binding_contracts" },
    "countedInputs": ["scripts/check-measurement-binding.mjs",
                      "scripts/selftest-measurement-binding.mjs",
                      "corpus/evidence/round-16/binding/selftest.json",
                      "corpus/evidence/round-16/binding/legacy-r15.json"],
    "measuredRevision": "<40-hex>", "count": 1 } ] }
```

Do **not** put the manifest itself in `countedInputs`: the manifest is necessarily committed after the
receipts it certifies (r15: `measuredRevision b7cf044` while `measurements.json` first exists at
`36240c7` — `git show b7cf044:corpus/evidence/round-15/measurements.json` → `fatal: path … exists on
disk, but not in 'b7cf044'`), so self-inclusion would make every honest round fail.

CLI: `--check <manifest> [--at REV] [--reproduce]`, `--legacy <r15 measurements.json> [--at REV]`,
`--self-test` (relay). Reasons as in §1, with this precedence per claim so one drift is not reported
twice: `sha256` absent → `counter_digest_unrecorded`; else blob at `measuredRevision` ≠ `sha256` →
`counter_digest_mismatch`; else blob at REV ≠ `sha256` → `counter_changed_since_measurement`. Detail
carries all three digests.

Output line grammar: reuse the lane's parser shape — `MEASUREMENT_BINDING verdict=failed
finding=<reason> claim=C1 detail=<text>` and `…verdict=clean claims=N bound=M`. `finding=` is what
`check-user-round-contract.mjs:764` already parses; the planned `finding claim=… reason=…` is a second
grammar for the same thing.

## 4. Defects in the PLAN text and in the draft that landed at 11:34

I read the landed gate and selftest read-only (no execution). Line numbers below are
`scripts/check-measurement-binding.mjs` unless stated.

### 4a. `--legacy` reports a digest as "unrecorded" for C2, which records one

PLAN:64-65 says r15 has "no digest/inputs" and PLAN:75-77 requires `counter_digest_unrecorded` for
both claims. Committed r15 bytes (`git show e38d259:corpus/evidence/round-15/measurements.json`):

```
C1 counterCodeRevision= 27dfd98b… counterSha256= <ABSENT>
C2 counterCodeRevision= 9fd8bca9… counterSha256= dd9c8675ab9bbc91c20f501a90f898197d046d2586f12d2389a564385281251d
```

C2 **does** record a digest, and it matches the blob at its `counterCodeRevision` (my own
`git cat-file`+`sha256sum` loop: `9fd8bca` → `dd9c8675…`, `27dfd98` and `b7cf044` → `3ee59de0…`).
The landed gate reconciles this by declaring the field out of scope at `:467-471` — "The round-15
schema has no bound counter.sha256 slot; a sibling counterSha256 field (C2) is not the bound
contract" — and then still emits `counter_digest_unrecorded` at `:469`. The machine-readable token is
false for C2; only the free-text detail is true, and the C1 counter (PLAN:76) reads tokens, not
detail. Minimal fix: when a legacy claim records `counterSha256`, emit `counter_digest_mismatch`
(recorded `dd9c8675…` ≠ blob at `measuredRevision` `3ee59de0…`) instead of `unrecorded`; when it does
not (C1), keep `unrecorded`. The honest real-r15 set becomes C1{unrecorded, undeclared, changed} +
C2{mismatch, undeclared}, exit 1, and PLAN:76 must say so. `measured_revision_not_ancestor` must stay
silent (`b7cf044` is an ancestor of `36240c7`/`e38d259`). BindLegacyEvidence's note reaches the same
real-data signature (`.ufo/waves/round-16/w1/BindLegacyEvidence.md`, "Notes for BindCore").

### 4b. Two different counter-identity predicates are specified and implemented

v1: blob at `measuredRevision` = `sha256` (PLAN:55, landed `:345`). `--legacy`: blob at
`counterCodeRevision` vs REV (PLAN:66, landed `:463-482`). For r15 C2 they disagree
(`counterCodeRevision 9fd8bca` ≠ `measuredRevision b7cf044`; v1 → `counter_digest_mismatch`, legacy →
clean). The landed code implements both, so the divergence is live, not hypothetical. Minimal
resolution: use **one digest predicate** — a recorded digest (v1 `counter.sha256`, or the legacy
`counterSha256` field) is compared to the blob at `measuredRevision`; `counterCodeRevision` is used
only for the drift arm (blob at `counterCodeRevision` vs REV), because that is the revision the r15
receipt actually names. That resolves 4a without a third predicate: C2's recorded `dd9c8675…` vs the
blob at `b7cf044` (`3ee59de0…`) is a true `counter_digest_mismatch`.

### 4c. `--reproduce` reproduces the wrong revision and executes unbound bytes

PLAN:59 → landed `:373` maps `{REV}`→`atRev`, then `:400` compares against `claim.after.count`, which
is the count at `measuredRevision`. So checking a clean record at a later HEAD reports
`count_not_reproduced` in addition to `counted_input_changed` whenever the count legitimately moved.
Reproduction must reproduce the **record**: map `{REV}` → `measuredRevision`; the checked REV belongs
only to the digest/diff arms. (If L1 wants the extra "record no longer holds at REV" signal, it needs
its own reason name; conflating it with `count_not_reproduced` makes the reason mean two things.)

Separately, `:376` spawns the counter path from the **worktree**, whose bytes no field binds when
`atRev` is older than the worktree. r15 C2 is the historical precedent: its count at `b7cf044` was
produced by counter bytes `dd9c8675…` that are not at `b7cf044` (`3ee59de0…`). Minimal fix, no new
reason: materialize `git cat-file blob <measuredRevision>:<counter.path>` into a `mkdtemp` file and
execute that copy with `cwd` = repo. Then "which counter revision reproduces each receipt" is literal,
and the author-supplied `argv` can be derived (§2).

### 4d. Receipt naming / ownership gap

Ownership (:105) names `corpus/evidence/round-16/binding/r15-counter-identity.json`; the C1 condition
(:76) requires `…/legacy-r15.json`. The first exists (BindLegacyEvidence wrote it); the second is
required by the counter and is not in the ownership table (L1's catch-all covers it). State the
producer command, e.g. `node scripts/check-measurement-binding.mjs --legacy
corpus/evidence/round-15/measurements.json --at <delivered REV>`, captured by L1 into
`legacy-r15.json` with `gateSha256`. Otherwise integration has an unowned required receipt.

## 5. Falsifiability holes in the plan (fixes are additive, not YAGNI cuts)

### 5a. The C1 0→1 count never reads the round's own manifest

PLAN:74-77 counts 1 if the gate blob exists and the two receipts look right. `measurement-binding.json`
is not mentioned at all, so C1 can be 1 with no binding manifest — exactly the "counter pinned only by
file presence" class of defect this round routes. Minimal closure without duplicating gate logic and
without a new mode: the gate's first line also prints `manifest=<64-hex of the bytes it parsed>`; L1
commits the captured `--check` run as `corpus/evidence/round-16/binding/check.json`; the counter
requires exit 0, `verdict=clean`, `gateSha256` = gate blob at REV, and `manifest` = manifest blob at
REV. That ties the count to those exact bytes. Alternative if L1 refuses a third receipt: the counter
re-derives only `counter.sha256` at `measuredRevision` and the ancestry check itself (3 git calls) and
accepts the two-authority risk.

### 5b. `countedInputs` pathspec magic — already closed in the draft

`git diff --name-only measuredRevision REV -- <countedInputs>` interprets `:(glob)`, `:!`, `:^`, so a
declared input of `:!*` would make the diff empty. The landed gate passes `--literal-pathspecs` on
that exact call (`check-measurement-binding.mjs:235`), which is the right fix and needs no new reason
(`man git`, `GIT_LITERAL_PATHSPECS`: "cause Git to treat all pathspecs literally, rather than as glob
patterns"). What remains is **declaration under-coverage** (an author may declare paths that never
change, making the arm vacuously clean); no gate can know the true reading set, so this is a
manifest-review property, not a missing reason. Do not add path-validation code beyond the flag.

### 5c. Do not tighten `measured_revision_not_ancestor` to equality

PLAN:77's own flow (manifest committed after the measured commit) and r15's committed bytes (manifest
first exists at `36240c7`, `measuredRevision b7cf044`) both require ancestor-or-equal + diff. Equality
would make the honest round un-countable.

## 6. Selftest size: 41 executed cases for 10 reasons

The landed selftest declares 22 fixtures (`positive`/`negative` at `:157-165`) and auto-adds a paired
`_control` for every negative, so it executes **19 negative + 19 control + 3 positive = 41 cases**
(`:160-165`; ids at `:168-274`). Set equality is implemented correctly (`:330-331`). The paired control
proves the fixture's only delta is the break — real value where the broken shape differs from the
clean fixture.

Minimal cut that keeps that property: keep the paired control only where the negative's shape is not
the clean fixture (legacy, multi-claim, reproduce, exit-2), and let the shared `clean` case be the
control for the v1 one-field mutations (it proves their base is green). That is ~13 negatives + ~5
controls + 3 positives ≈ 21, not 41. Deleting `argv_unsupported` alone removes 3 negatives + 3
controls (`:200-211`) = 6/41, 15% of the selftest for a property the derived-argv design makes
impossible. Dropping the four exit-2 tokens to `usage`+`could_not_evaluate` removes two more pairs
(`:218-250` keeps one representative per token).

`cases ≥ 12` (PLAN:75) is now inert (41 ≥ 12) and still gameable by shrinking the reason vocabulary.
Have the **counter** hold the literal reason list (not read it from the gate) and require each with
its expected exit; drop the numeric floor. The `{REV}` `;`/`$()` case (`:151,274`) asserts a property
of `spawnSync` argv arrays, not of this gate; if kept, it should not be counted as reason coverage.

## 7. Exact anchors used

- `.ufo/waves/round-16/PLAN.md:38,42-50,53-63,64-67,68-72,74-77,105` (quoted above).
- `corpus/lessons/round-15-verifier-spotcheck.md:120-121` (defects 1/2, quoted).
- `corpus/evidence/round-15/measurements.json` C1/C2 `counterCodeRevision`/`counterSha256` (dumped at
  `36240c7` and `e38d259`: byte-identical blob `e45d4a2a…`).
- `git cat-file`+`sha256sum`: `27dfd98`/`b7cf044` → `3ee59de0…`; `9fd8bca`/`36240c7`/`e38d259` →
  `dd9c8675…`.
- `scripts/check-user-round-contract.mjs:281,285,764,1313,1326-1327` (flag/grammar/precedent).
- `scripts/check-aria-metadata.mjs:44,2263-2268` (selftest mode; prefixed JSON line).
- `scripts/check-measurement-binding.mjs:100-125` (closed vocabularies), `:219-235` (`cat-file`,
  `merge-base`, `--literal-pathspecs` diff), `:317-323` (`argvSupported`), `:325-408`
  (`evaluateClaim`/`--reproduce`), `:455-498` (legacy), `:563-603` (CLI surface).
- `scripts/selftest-measurement-binding.mjs:151-165` (control pairing), `:168-274` (22 fixtures),
  `:330-331` (set equality), `:355` (summary line).
- `man git` → `GIT_LITERAL_PATHSPECS`.

## 8. Tradeoffs / limits

- Cutting `--repo` saves one flag but the landed selftest invokes it (`selftest:288-289`), so it costs
  a second owner's call-site change and removes no cases. Low value; do not take it as part of this
  round's cuts.
- Deriving argv forbids counters with extra flags. PLAN fixes the invocation today; a future shape
  change is a schema change, which is the right time to pay for it.
- The `check.json` receipt in §5a adds one small file and one token; the alternative (counter
  re-derives gate logic) reintroduces the drift the lane just routed.
- Reproduction at the checked REV (§4c as landed) doubles as an undeclared-drift detector: it can
  catch a count that moved for a reason not listed in `countedInputs`. Moving it to
  `measuredRevision` gives up that signal. If L1 wants both, keep the REV run under a distinct reason
  (`count_not_stable_at_target`), do not reuse `count_not_reproduced` for two meanings.
- This review read the landed gate/selftest source but executed none of it; statements about gate
  behavior are code-reading, not observed runs. Installs: none.
