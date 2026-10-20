# AttackSupportedCounts — USER supported committed counts and baseline/expect drumbeat

Round15 wave2, author-side source review (not a non-author verification).
Scope: C1 "supported committed USER historical count semantics unchanged;
baselines/expected10 never relaxed." Read-only. No gate, self-test, counter,
browser or suite was executed; no source edits. Only this report was written.

## Attacked identity (exact)

- Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`
- Revision: `72dcf031b9da24796b718517ea575f21e4f7caae` (HEAD at review start).
- Build snapshot pins verified by extracting the revision's blobs:
  - `scripts/check-user-round-contract.mjs` sha256 `abf174c31db616c78bf52cb6f520bcdb7c42ebd4f2a84e867455e66519b60a3d`
  - `scripts/check-aria-metadata.mjs` sha256 `5738296263a327807e0ea4b756ea6b643e88c6e3803b7a4cc42ed8e2e83e4eb0`
  - `.ufo/waves/round-15/measure.mjs` sha256 `62e98fa858c0c29478d052b23206c726cacd457c26a41549058c473be1df02e7`
  - `.ufo/waves/round-15/metadata-witness.py` sha256 `44cd37c52aa87c09c15ebe36f0624c2c6cbbcf566d0617de3748747548f45831`
  All four equal the snapshot values. All pointers below are to bytes at
  `72dcf03` (`git show 72dcf03:<path>`), not to the moving worktree.
- Post-snapshot drift observed during this review (outside the attacked bytes):
  worktree files were rewritten at 2026-10-20 05:35-05:37 local, after the
  snapshot was taken — checker now `f6d41053…`, ARIA checker `58bc8ec7…`,
  `measure.mjs` `322e7cf3…`, `metadata-witness.py` `89643faf…`. Findings here
  are against the snapshot digests above. L1 fixes in the worktree are not
  reviewed and must produce a new snapshot before a delivered-byte claim.

## Verdict

The core proposition **survives for the six committed USER rows**: all six are
inside the closed grammar, the count grammar and counting logic are unchanged
from the round-14 delivered evaluator (only refusal reason tags were added
around them), and the fixed baseline/ten-round constants and production guard
are unchanged. Two truthfulness/coverage defects and one grammar-wide narrowing
are reported below; none changes a committed row's number. The "verified 0→1"
half is **not present in the attacked revision** (temporal limit at the end).

## Observed facts

1. **Six supported rows, byte-checked.** `SCORECARD.md` at `72dcf03` carries
   user rows at lines 332-380 (`r01` comment:332, `r02`:340, `r03`:349,
   `r04`:357, `r05`:365, `r06`:373). Each command (`:336`, `:344`, `:353`,
   `:361`, `:369`, `:377`) is exactly
   `git ls-tree -r --name-only <40hex> | grep <single token> | wc -l`, with one
   space around each pipe and no trailing bytes (`cat -A` shows `-l$`). Every
   pattern is a subset of `GREP_PATTERN` (`checker:371`), has no leading `-`,
   no `^`/`$`, and the command rev equals `measured-against` in all six rows.
2. **Evaluator unchanged in round15.** `git diff 5c7710d 72dcf03 --
   scripts/check-user-round-contract.mjs` is 292 insertions/33 deletions; the
   only hunks inside the count path are the added reason arguments at
   `checker:413`, `:420`, `:430`, `:619-620`. `TREE_COUNT`/`GREP_COUNT`
   (`:367-368`), `countPattern` (`:374-381`), `countingCommand` (`:383-398`)
   and `runCount`'s counting logic (`:418-440`) have no diff hunk. Supported
   semantics therefore cannot have changed for any admitted shape.
3. **The committed values are consistent with both engines.** Each measured rev
   resolves to a commit (`git cat-file -t`: r01 95ea5f8, r02 59ba8da, r03
   8a869af, r04 982e3b2, r05 c6fb0d5, r06 1229098). Each target file exists at
   its measured rev and is absent at `HARD_BASELINE 7f506af` (`git cat-file -e`
   per row). The targeted directory listing at each measured rev contains
   exactly one name matching the pattern (r01 operability, r02 boundary, r03
   calibration, r05 depth, r06 freshness; r04's `corpus/knowledge` listing has
   no other name containing the `user-public-observation` stem). With ASCII
   names and `.` as the only wildcard, the historical grep and the evaluator
   agree on 0→1 for all six.
   This is source reasoning; the numbers were not executed by me.
4. **Baseline and ten-round expectation are not relaxed.** `checker:12`
   `HARD_BASELINE = 7f506aff…`; `:274` default `expect: 10`; `:301-303` the
   production guard is identical to `5c7710d:279` (fixed baseline, expect 10,
   no pstack override). The only `argumentsOf` change is the added
   `diagnosticWitness` flag and usage text. `measure.mjs` (snapshot) pins
   `USER_EXPECTED = { exit: 1, finding: 'round_count', rounds: 6,
   expectedRounds: 10 }` at `:167` and at `:790-804` refuses other counts and
   any `verdict=clean` production line. No delivered branch lowers the
   expectation or changes the baseline.
5. **Production does not reach the six counts.** `check` (`:597-628`) fails
   `round_count` at `:602` because HEAD has six committed lessons
   (`corpus/lessons/user-20261015-r01..r06.md`), then returns before the
   per-round loop at `:609-625`. So the only source-level recomputation of the
   six counts is the `--self-test` committed loop at `:1245-1252`, which calls
   `parseScore`/`runCount` in-process.

## Defects

### D1 (medium — false CLI-isolation provenance on the committed-count lines)

Anchor: `checker:1245-1252`. `committedIds` is read at `:1245`; for each id the
loop calls `runCount(defaultRoot, …)` at `:1249-1250` in the same process, then
prints at `:1252`:

```
SELFTEST name=count_committed_<id> expected_exit=0 actual_exit=0 … isolation=cli … result=PASS|FAIL
```

No child process is spawned for these rows, and `actual_exit=0` is a literal,
not an observation. This is the one place the gate recomputes the committed
historical counts, and it labels them as CLI-isolated. The measurement harness
then trusts the self-declared token over its own rule: `measure.mjs:716-719`
computes `isolated = entry.isolation !== null ? entry.isolation === 'cli' :
isIsolatedCase(entry.name)`, while `:550-551` documents
`count_committed_|count_witness|production_` as the non-isolated executions.
The token therefore defeats the name rule for exactly the prefix the rule
lists. Today the committed lines carry no `expected_reason`, so C1's
`isolatedCli`/`negativeReason` counters are not inflated; the defect is false
provenance in the very receipt that is meant to prove isolation, not a count
change.

Bounded correction: print `isolation=in_process` (or omit the token) and drop
or mark `actual_exit=na` for the committed loop; keep `isolation=cli` only for
`spawnSync(process.execPath, …)` cases. In `measure.mjs`, make the name rule
authoritative (a `count_committed_*` line with `isolation=cli` is a finding) or
validate the token against the name class. Note: the post-snapshot worktree
already changed this line to `kind=helper isolation=in_process` (current line
1274), so the correction is in flight but is not in the attacked digest.

### D2 (medium — C1 green does not require the committed-count equivalence)

Anchor: `measure.mjs:149`, `:632-635`, `:670-681`, `:716-719`. `countC1`
requires a receipt, a clean `USER_ROUND_CONTRACT_SELFTEST` summary, minimum six
case lines, per-case PASS/expected_finding agreement, ≥3 reason assertions over
≥2 distinct reasons, applicability coverage, and ≥2 isolated CLI reason
controls. It never requires a `count_committed_*` line and never parses the
summary's `committedCounts=` field (`checker:1287`); the summary regex at
`:670` captures only `cases=(\d+)`. Because the summary total includes fixture
cases (`cases = fixture + committed + 4`, `:1287`), a run with
`committedIds.length === 0` — e.g. `list()` returning `[]` on a git failure,
`checker:138-142` — emits `verdict=clean cases=36 … committedCounts=0`, and
every measure check still passes: parsed case lines == parsed cases, ≥6, no
FAIL. The supported-count equivalence would then be absent from a green C1
receipt. On a healthy lane the loop sees six ids (so this is a coverage/vacuity
gap, not an observed false green); the harness's green count does not require
the loop to have seen them.

Bounded correction: in `countC1`, parse `committedCounts` from the summary (or
count `count_committed_user-20261015-rNN` PASS lines) and require it equal the
committed lesson count at the revision and ≥6; in `selfTest`, fail with
`could_not_evaluate` if `committedIds.length === 0` so a green summary cannot
be emitted with zero committed rows.

### D3 (low — before-count substitution narrowed versus the historical shell gate)

Anchor: the legacy shell gate measured the before value by
`score.command.replaceAll(score.measured, options.baseline)` (`bebe2ef…:492`).
The delivered `runCount` overrides only the parsed rev target
(`checker:421-423`, called with `options.baseline` at `:618`). The closed
grammar permits a 40-hex literal in a grep pattern (`GREP_PATTERN`
`checker:371`; `TREE_COUNT` `:367`), so a supported row whose pattern text
equals its measured rev would be counted against different text by the two
implementations. None of the six committed rows triggers this: their patterns
are path fragments and the rev appears only in the rev slot. The equivalence
for the assigned rows holds; the divergence is a grammar-wide narrowing that
is not documented at `checker:363-366`.

Bounded correction: reject a pattern containing the measured rev (fail closed),
or apply the same full-string substitution, or state the narrowing in the
grammar comment and in the C1 contract text.

## Temporal limits (do not read as success)

- **No C1 receipt at the attacked revision.** `corpus/evidence/round-15/` at
  `72dcf03` contains `source-index.json`, `misroot-recovery.json` and
  `metadata/*` only; `corpus/evidence/round-15/user-diagnostics.json` is
  absent. `measure.mjs:632-635` therefore returns C1 count 0 with
  "round-15 USER diagnostics receipt missing". The committed LOG entry
  (`LOG.md:828+`) says outcomes are recorded only after actually exercised,
  and `corpus/lessons/round-15.md` is untracked at the attacked revision.
  So "0→1 verified diagnostic contract" is not a delivered-byte fact here; it
  is L1's pending execution.
- `SCORECARD.md` at `72dcf03` has no round15 row (its last section is round14);
  the C1 0→1 scoring is also pending L1 integration.
- Production remains the honest red 6/10 by design; it aborts at `round_count`
  before the six counts, so a production receipt cannot witness their
  semantics. Only `--self-test` can, and that execution has no receipt yet.

## Residual boundaries (not defects of this delivery)

- The production guard is realpath equality with the script's own root
  (`checker:301` with `sameRoot:108-114`). A clone/copy of the same HEAD can be
  evaluated with `--baseline`/`--expect` overrides, but it is not the production
  root; the C1 receipt pins the checker revision/digest, not the invocation
  args. This is an inherent authority boundary of a source gate.
- Hostile git environment/config/hooks/PATH trust remains uncredited (round15
  lesson item 6); the six counts inherit it. No new relaxation is introduced.
- `[INFERENCE]` The actual 0/1 values were not executed; they follow from the
  file presence/absence and the unchanged evaluator logic.

## Commands L1 should run after integration (not run by me)

From the lane root, against the newly pinned bytes (do not mix with the
post-snapshot worktree):

1. `node scripts/check-user-round-contract.mjs --self-test` — expect the six
   `count_committed_*` lines to PASS; after the D1 fix they should report the
   in-process/helper kind, not `isolation=cli`.
2. `node scripts/check-user-round-contract.mjs` — expect
   `verdict=failed finding=round_count detail=Found 6 user rounds, expected 10`,
   exit 1; any clean line is a regression.
3. `node .ufo/waves/round-15/measure.mjs <new-revision> --claim C1` after
   writing `corpus/evidence/round-15/user-diagnostics.json`; C1 is currently
   count 0 solely because the receipt is missing.

Tooling installed/updated: none.
