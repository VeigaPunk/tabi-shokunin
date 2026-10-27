# Round 37 w1 — harness-v2 review

## Findings

No actionable defects found in the routed harness repairs.

- **OUT path handling:** `.ufo/waves/round-37/measure.sh` assigns `OUT=$(realpath -m "$2")` before any output-path use (line 11). All provenance, counter, selfassessment, no-harm, and numstat outputs write through `$OUT`. In particular, the no-harm block changes directory to `$d` inside its braces at line 48, while its block redirection is evaluated at line 66; because `OUT` was resolved absolutely before entering the block, that redirect remains rooted at the requested output directory. The numstat command now uses `git -C "$d" diff ...` and redirects to `"$OUT/numstat-at-$short.txt"` (line 69), so both the diff source and destination are correct and it cannot read the live lane worktree.
- **Freshness CLI contract:** `scripts/check-freshness.mjs` accepts `--worktree` as its mode flag and `--repo PATH` as an optional path/value pair (`argumentsOf`, lines 45–53); it rejects unrecognized `--rev` with exit 2. Thus `--worktree --repo $d` is valid, whereas the old `--worktree --rev HEAD` was invalid. The round-37 harness no-harm receipt records the new invocation exit 0 and `FRESHNESS_GATE verdict=clean` (34/34 unique pins, production profile).
- **Round-36 no-harm semantics:** the gate/self-test command loop is otherwise retained. The two current round-37 counters replace the prior current round-36 pair; prior-round counter coverage is rolled forward by adding round-36 v4/v2 and retaining round-35 v3/v1, while round-34 v2/gate-mutants are removed. The selfassessment invocation, listed offline gate commands, source census, and dynamically discovered `--self-test` loop remain; only the freshness CLI arguments change. The shell diff is recorded by the compared source scripts; the run receipt shows 29 no-harm entries, including the unchanged pre-existing frontier-admission exit 1 and passing freshness leg.

## Smoke run

Ran `.ufo/waves/round-37/measure.sh ed8ccfc00ad3784bc424aa118e056f8edf4ee803 <seat>/measure-smoke 99437d29de036415a9f2d0524343617a3b19988a` once with `HYAKU_SCRATCH=/fast/scratch/hyaku/tabi-r37/w1/RevHarness`. It completed with `measured ed8ccfc`; provenance records clean clone porcelain, C1/C2 and round-36 controls exit 0, and pinned Firefox 158.0.1 / geckodriver 0.37.1. `numstat-at-ed8ccfc.txt` exists and is non-empty (313 bytes, 10 changed-path rows). The freshness no-harm line exits 0. The run's no-harm and provenance receipts are retained in `measure-smoke/`. Scratch root was removed after the run.

No tools were installed or updated.

VERDICT ok — both routed harness repairs work; the frozen harness completes, writes numstat, and passes its freshness leg.
