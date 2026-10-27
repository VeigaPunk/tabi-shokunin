# RevNoHarm — tabi round 37 w1, no-harm plan review (attempt 1)

seat: RevNoHarm (leaf, no subagents) · date: 2026-10-27 · lane: /home/vgpnk/Projects/shokunin/tabi-shokunin
contract read first: .ufo/waves/round-37/claims.json (frozenAt=baseline=ed8ccfc00ad3784bc424aa118e056f8edf4ee803) · routed defects: corpus/lessons/round-36-verifier-spotcheck.md §Routed defects

## 1. The two nonzero legs of the round-36 no-harm receipt

`.ufo/waves/round-36/measure/noharm-at-20a69e0.txt` — 29 commands, tally `exit=0 ×27, exit=1 ×1, exit=2 ×1`. The two nonzero:

1. Line 5 `node scripts/check-frontier-admission.mjs --rev HEAD --frontier rate-tos-signal --since 2026-10-27 :: exit=1` — `FRONTIER_ADMISSION verdict=failed … live=false population=2 admitted=0 failing=2` (S116, S117 `NOT-ADMITTED reasons=r4-opened`). Pre-existing red, not a round-36 regression: reproduced at the round-36 start baseline in `noharm-baseline-compare.txt` (`frontier-exit=1`, same two NOT-ADMITTED lines), and re-reproduced by me at the round-37 baseline (below, byte-identical entries).
2. Line 8 `node scripts/check-freshness.mjs --worktree --rev HEAD :: exit=2` — `FRESHNESS_GATE verdict=could-not-evaluate finding=usage` — the round-36 harness invoked the gate outside its usage contract (`--worktree` combined with `--rev`); this is routed defect 5, repaired by the round-37 harness (see §2).

## 2. The round-37 harness changes only the freshness leg

Diffed `.ufo/waves/round-36/measure.sh` against `.ufo/waves/round-37/measure.sh` (worktree bytes sha256 `9f89697c…` = `frozenDigests.measure`, and identical blob in jj freeze commit 99437d29de03…):

- The noharm `for c in` list is 11 legs in both; all are byte-identical except leg 8: `check-freshness.mjs --worktree --rev HEAD` → `check-freshness.mjs --worktree --repo $d` (usage-conformant). Nothing added, nothing dropped.
- The self-test loop (`for g in scripts/check-*.mjs scripts/round-evidence-audit.mjs`) is byte-identical.
- The census leg (11th) is textually different only in expressing its own clone path (`$d/corpus/SOURCES.md` here; round-36 hardcoded the equivalent absolute scratch path of its own `$d`).
- Outside the noharm list, the harness plumbing changed as the routed defects require: `OUT` is `realpath -m`'d up front and the numstat runs inside the clone against the absolute OUT path (defect 5, numstat arm); the provenance counter legs are now c1v5/c2v3 plus no-harm re-runs of the round-36 pair (added) and round-35 pair (kept); the round-34 pair was dropped. Measurement plumbing, not noharm-list changes; no gate impact.
- Empirical exit flip, captured on a fresh clone of the lane at ed8ccfc (`git rev-parse --show-toplevel` asserted = clone): old leg `--worktree --rev HEAD` → **exit 2** (`verdict=could-not-evaluate finding=usage`); new leg `--worktree --repo <clone>` → **exit 0** (`FRESHNESS_GATE verdict=clean finding=freshness_worktree matched=34 unique=34 lane=31 public=3`). Exit 2 → 0 as targeted.

## 3. Claim surfaces cannot regress a gate

Frozen-byte integrity (all verified, not assumed):

- All five `frozenDigests` match the worktree bytes AND the blobs in jj freeze commit 99437d29de03… (git name-rev: `jj/keep/99437d29…`): c1 `9c6289b7…`, c2 `eda339eb…`, buildTool `a85152cd…`, measure `9f89697c…`, controls (baseline/run-controls.sh) `3a08367f…`.
- claims.json sha256 `eade07a2…` is byte-identical in the worktree and in 99437d29 — **unchanged since the dispatch freeze**.
- Both gates the counters digest-pin match their pins today: scripts/check-adjacency.mjs `4e2c2a64…` (v5 `ADJ_GATE_SHA256`), scripts/check-bidi-runtime.mjs `370e8e95…` (v3 `GATE_SHA256`).

File surface of the round: claims/counters/harness/controls/baseline receipts all live under `.ufo/waves/round-37/` (the counters also only READ `.ufo/waves/round-34/baseline/c1-candidates.tsv`, `.ufo/waves/round-36/baseline/c1-delta-pins.json`). Planned lane-tree writes: corpus/SOURCES.md (one appended row), corpus/lessons/round-37.md (new file), SCORECARD.md and LOG.md appends — exactly the noHarmRule's append-only set; no prior-round prose byte is touched.

Baseline gate state, measured the way the harness measures (clean clone):

- `check-selfassessment` at ed8ccfc: **exit 0, verdict=clean, mismatches=0** (could_not_evaluate=116, superseded=48). Re-run at current lane HEAD f76da094 (w1 dispatch commit): **exit 0, mismatches=0**. The "mismatches stay 0" clause has a green baseline.
- `check-frontier-admission` at ed8ccfc: **exit 1** (population=2 admitted=0 failing=2, S116/S117 `r4-opened`) — identical to both round-36 readings; a pre-existing red outside the "exits 0 at baseline stays 0" protection, and the planned writes do not touch its inputs (corpus/knowledge entries + admission state — a SOURCES.md row and lessons/SCORECARD/LOG appends are not its surface).
- Remaining gate legs read ledgers/registries/knowledge the round does not write; the one interaction to keep an eye on is recorded under "append discipline" below.

Append discipline for the planned writes (no defect today, conditions to keep it that way):

- SCORECARD/LOG appends are new m1-selftest-tally / m4-nudge-state surface: every appended tally must be oracle-correct, or superseded/could-not-evaluate, or mismatches leaves 0. The round-36 closure appends (+44 SCORECARD/+40 LOG lines) left the clean-clone gate at 0 — the mechanism is proven append-safe when claims are accurate.
- The SOURCES.md row must be schema-valid (check-sources `findings=0`, census `exit 0` — row-count deltas are informational) and must not reuse an S-id that the C2 entry's `source:` line cites: v3's `parseRegistry` maps by S-id (later row wins), and v3's s1 witness keys on those rows.
- corpus/adjacency-screen-drift.tsv is NOT in the planned write list. If c1-drift-audit-build-v2.mjs is ever run with its default `--out` (the lane ledger path), the write must be byte-identical to the committed ledger, or check-adjacency and v5 must be re-verified after it; control runs should target scratch/OUT paths.

Worktree-artifact caveat (so nobody misreads it): running `check-selfassessment` in the dirty live lane exits 1 with `m3-unlanded-paths claimed=landed observed=3` — m3 fires on any non-empty `git status --porcelain --untracked-files=all` against the newest SCORECARD "executed disposition" block; the 3 entries are the in-flight w1 dirs (`.ufo/waves/round-37/L1-notes/`, `w1.ready.dispatched`, `w1/`). measure.sh runs the gate inside a clean clone where m3 is empty — verified exit 0 there. A live-run exit 1 mid-wave is the artifact, not a round regression.

## 4. v5/v3 predicate-true does not depend on files outside their frozen input sets

Both counters read, in full:

- **c1-adjacency-sweep-v5.mjs** (640 lines): every read is a git object under `GIT_NO_REPLACE_OBJECTS=1` with sanitized git config env — the lane at REV and BASELINE 11c64b96… only: corpus/adjacency.tsv, adjacency-screen-browser.tsv, adjacency-screen-drift.tsv, adjacency-screen-delta.tsv, PROVINCE.md, `.ufo/waves/round-34/baseline/c1-candidates.tsv`, `.ufo/waves/round-36/baseline/c1-delta-pins.json` (sha256-bound to `810193620393f6e8b76faac4b606977508198de1b9ffd00d3a7440e8f1910655`, refusal on mismatch — B1), scripts/check-adjacency.mjs (sha256-bound to `4e2c2a64…`, written to a TMPDIR scratch copy through an lstat-guarded safeWrite and run `--at REV`). Sibling repos are touched only via `rev-parse`/`show`/`ls-tree` at the embedded frozen PINS literals and at the digest-bound delta heads — sibling worktrees are never read. The only worktree read in the file is the `--list-delta`/`--list-drift` helper-mode fallback for the pins file (absent-at-HEAD → `cat` of the worktree file); helper modes exit before `evaluate()` and the countingCommand never uses them.
- **c2-firefox-bidi-v3.mjs** (713 lines): `replaceRefs()` enumerates `refs/replace/` and refuses before any read (B1); every git read carries `GIT_NO_REPLACE_OBJECTS=1`; all lane reads go through `blob(repo, REV|BASELINE)` with a traversal guard — the digest-pinned gate, corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md, corpus/evidence/round-35/bidi-firefox/receipt.json plus its referenced driver and transcripts (each sha256-checked), corpus/lessons/round-35.md and round-36.md, corpus/SOURCES.md at REV and BASELINE (registry parse). Binaries are sha256-verified against embedded install-receipt digests before any spawn; the live leg is loopback-only (the gate's serveFixture) with DNS-off prefs, /proc-based egress sampling and a teardown survivor scan confined to its own mkdtemp scratch; write scope is stdout/stderr plus those scratch dirs.

Predicate-true at the tip is therefore a function of {the REV tree, the BASELINE tree, frozen sibling pins/heads, digest-pinned gate bytes, digest-bound pins file, pinned binaries} — closed under the frozen input sets; nothing on the predicate path reads the live lane worktree or any unfrozen file.

## Verification performed (this seat, read-only)

Two gate runs at the frozen rev (selfassessment, frontier-admission) + clean-clone reruns at ed8ccfc and f76da09; both freshness legs executed on a fresh ed8ccfc clone (true exit codes); sha256 of all five frozen instruments + claims.json in worktree and in 99437d29; sha256 of both digest-pinned gates; commit-range inspection 20a69e0..ed8ccfc (5 closure commits, +2705, all round-36 closure files); full input-path enumeration of both counters (source read); m3 implementation read (check-selfassessment.mjs:414-424). No mutating git command anywhere; clones confined to my scratch. No tool installs were needed (existing node/git only).

## Verdict

VERDICT ok — the round-37 harness changes exactly one noharm leg (freshness, empirically 2→0), adds no other leg; all five frozen digests and claims.json are byte-identical across worktree and dispatch-freeze commit; baseline is selfassessment exit 0 / mismatches 0 at both ed8ccfc and f76da09, frontier exit 1 pre-existing and outside the rule's protection; both counters' predicate inputs are closed under their frozen sets. Residual risks are process conditions on the planned appends (oracle-correct tallies; SOURCES S-id reuse; drift-TSV byte stability) — recorded above, none actionable as a defect.
