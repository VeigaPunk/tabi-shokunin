# CritHarness — attack on measurement harness v2 (`measure.sh`)

Seat: CritHarness (leaf critic, no subagents) · Round: tabi 37 attempt 1, wave w1 · Date: 2026-10-27
Target: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-37/measure.sh` (frozen digest `9f89697c…3302`, worktree byte-verified equal, equals blob at freeze rev `99437d29…988a`).
Method: static read of all 72 lines + five avenue-specific fixtures under my scratch root only; no writes to the lane, no mutating git anywhere. Fixture repos were created with `git init` inside `/fast/scratch/hyaku/tabi-r37/w1/CritHarness` and every git call named `-C`.

## Digest & freeze provenance (grounding)

- Worktree `measure.sh` sha256 = `frozenDigests.measure` = `9f89697c…3302`; identical to `git show 99437d29:.ufo/waves/round-37/measure.sh`.
- Live extraction at freeze rev with the harness's exact commands matches every `frozenDigests` entry: c1 `9c6289b7…`, c2 `eda339eb…`, buildTool `a85152cd…` (at `.ufo/waves/round-37/counters/c1-drift-audit-build-v2.mjs`), controls `3a08367f…` (at `.ufo/waves/round-37/baseline/run-controls.sh`); counters clean vs HEAD.
- Note (not a defect): `claims.json`'s own `frozenAt` field names `ed8ccfc0…`, a commit that predates the round-37 tree (`measure.sh` absent there). The operative freeze is the prompt's `99437d29…`; the two names should be reconciled in the round-38 freeze so the digest story is single-sourced.
- Both routed round-36 harness defects are repaired in v2: numstat runs `git -C "$d" diff --numstat … > "$OUT/numstat-…"` with absolute OUT while cwd is the clone (line 69); `check-freshness` is invoked `--worktree --repo $d` per its usage contract (line 56).

## Avenue results

### (a) OUT with spaces or a symlink — HANDLED (with two residual notes)

- `realpath -m` canonicalizes space-containing paths, symlinks to existing dirs, and dangling symlinks correctly (smoke-tested: all three resolve; `mkdir -p` + receipt write through a space-path OUT succeeds).
- Residual 1: if OUT exists as a regular file, `mkdir -p "$OUT"` fails (exit 1) but the script has no `set -e` and continues; receipt writes then fail and **the harness still exits 0** (last statement is `echo "measured $short"`). Consumers must parse the provenance exit lines, never `$?` of measure.sh.
- Residual 2 (TOCTOU, low): a symlinked OUT/parent resolved once up front can be re-pointed mid-run; outputs land in the swapped target. Acceptable for a local L1 caller.

### (b) trap deletes $S on EXIT; SIGKILL leak — LEAK CONFIRMED, CLASSIFIED NON-SENSITIVE

- Replica with the harness's exact scratch/trap/TMPDIR mechanics, killed with SIGKILL mid-run: EXIT trap does not fire; `$S` survives containing `tmp/rust_mozprofile.*` (fresh geckodriver profile: `prefs.js`, empty-random `key4.db`, `cert9.db`, `cookies.sqlite`), a full clone checkout of committed lane state, and the frozen counter copies under `$S/k`.
- Classification: no credentials, no uncommitted source (clone is of committed objects only), no session tokens (throwaway profile against loopback fixtures). Bounded to the caller-chosen scratch path. Self-heals: the next run's leading `rm -rf -- "$S"` clears it. Verdict: acceptable debris; no correction required. Note that bash does run the EXIT trap on SIGTERM, so only SIGKILL/power-loss leaks.

### (c) no-harm block's unquoted `$c` — LITERALS CLEAN; LATENT SPLIT HAZARD VIA PATH VARIABLES

- Read of all 11 command strings: no literal embeds an unquoted space; every internal space is an intended argument separator. Interpolated variables only: `$full` (40-hex rev), `$FLEET` (constant, no spaces), `$d` (`$S/c`, space-free under the default `HYAKU_SCRATCH`).
- Demonstrated hazard: with a space in `$d` (armed purely by `HYAKU_SCRATCH="/path/with space"`), the unquoted expansion splits `--repo /fast/…/sp ace/c`; node exits MODULE_NOT_FOUND and sources-census reports `--file not found` — recorded as spurious non-zero no-harm exits (false failures, not silent passes). Same class: glob chars in `$d`.
- Inert under the documented invocation environment; armed only by a hostile/typo'd HYAKU_SCRATCH. Smallest correction: assert at startup that `HYAKU_SCRATCH` contains no whitespace or glob characters (one line), or restructure the loop over arrays.

### (d) HYAKU_SCRATCH override redirecting scratch into the lane repo — CONFIRMED, UNGUARDED

- No validation on `HYAKU_SCRATCH`. Ran the harness head verbatim (LANE redirected to a fixture clone standing in for the lane; no lane bytes touched) with `HYAKU_SCRATCH=<fixture-lane>`: `S=<lane>/tabi-r37/L1/m` is created **inside the measured worktree** — including a full `git clone --shared` at `…/m/c` (clone-into-own-subdirectory succeeds) and TMPDIR profile space.
- The harness's own cleanliness signal is blind to it: provenance records `porcelain=$(git -C "$d" status --porcelain | wc -l)` — counted on the **clone**. Receipt captured: provenance says `porcelain=0` while the lane stand-in simultaneously shows `?? tabi-r37/`.
- On clean EXIT the trap scrubs it (verified gone); on SIGKILL the whole tree persists inside the lane worktree as untracked pollution. Blast radius of the leading `rm -rf -- "$S"` is confined to the `tabi-r37/L1/m` subtree even for adversarial values, so this is pollution/leak, not deletion.
- Smallest correction: reject `HYAKU_SCRATCH` whose `realpath -m` is inside `LANE` or `FLEET` (or require the `/fast/scratch/hyaku` prefix) before the `rm -rf`.

### (e) freeze-byte counters via `git -C $LANE show $FREEZE:$f` vs dirty worktree — DIRT HARMLESS; REPLACE REFS GRAFT

- Dirty-worktree smoke (fixture): with the worktree file overwritten **and** a staged-new file, `git show HEAD:file` still returns committed bytes; staged-never-committed paths are unreadable (`fatal … not in 'HEAD'`). Live: all extractions at the freeze rev match `frozenDigests`; counters clean vs HEAD. So the frozen bytes beat worktree dirt, as required.
- **Counterexample (fixture):** a `refs/replace` graft in the lane repo makes `git show "$FREEZE:counters/…"` return the replacement commit's bytes — the harness extracts, and would execute, doctored counters. `measure.sh` sets no `GIT_NO_REPLACE_OBJECTS` (unlike the C2 v3 counter it launches, which hardens exactly this) and performs **no check** of extracted sha against `frozenDigests` — the sha lines in provenance are informational; nothing aborts on mismatch.
- Clone side is clean: `git clone` does not propagate `refs/replace` (verified: clone of the grafted fixture has no replace refs and reads honest bytes), so the at-rev digest line is unaffected.
- Current lane state: `git for-each-ref refs/replace` is empty; arming requires write access to the lane object store, so this is a hardening gap, not a live compromise. Smallest correction: `export GIT_NO_REPLACE_OBJECTS=1` at the top of measure.sh (one line, consistent with C2 v3) and hard-exit if any extracted byte sha ≠ the corresponding `frozenDigests` entry.

## Findings (impacted axes: operability — C2 names harness v2 in its surface; calibration — measurement trust)

1. **F1 (fixable defect)** — frozen-byte extraction honors `refs/replace` in the lane repo; no `GIT_NO_REPLACE_OBJECTS`, no abort-on-digest-mismatch. Evidence: fixture graft returned attacker bytes through the exact harness command. Correction: one-line export + digest gate.
2. **F2 (fixable defect)** — `HYAKU_SCRATCH` unvalidated; redirect into the lane worktree plants a transient untracked `tabi-r37/L1/m/` tree (full clone + profiles) that the provenance porcelain line cannot see (receipt: `porcelain=0` vs `?? tabi-r37/`) and that survives a mid-run kill. Correction: prefix/realpath guard before the `rm -rf`.
3. **F3 (latent defect)** — unquoted `$c` splits `$d` when the scratch path contains spaces/globs, yielding false no-harm failures. Correction: whitespace/glob assertion on `HYAKU_SCRATCH`.
4. **F4 (note)** — harness process exit status is unconditionally 0 (no `set -e`; final `echo`); counter/outcome truth lives only in provenance/receipt files. Callers must not trust `$?`.
5. **F5 (note)** — SIGKILL leak of scratch is non-sensitive operational debris; self-healing on next run.

Nothing here touches the two frozen claims' predicates: both routed harness repairs are correctly in place, and all five `frozenDigests` verify against freeze rev `99437d29`.

Tooling: none installed (used host git, coreutils, node already present).

Scratch: `/fast/scratch/hyaku/tabi-r37/w1/CritHarness` deleted before finish (fixtures: e-fixture, a-fixture(+clone), c-fix, b-kill, d-fix).

VERDICT finding — harness v2's routed repairs and digest binding verify, but F1 (replace-ref-blind frozen-byte extraction), F2 (unguarded HYAKU_SCRATCH redirect into the lane), and F3 (latent word-split) are real, demonstrated hardening defects with one-line-class corrections; F4/F5 are operational notes.
