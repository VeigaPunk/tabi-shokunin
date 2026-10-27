# ExecSelftest — round 36 w1 instrumentation receipt

Seat: `ExecSelftest` (executor leaf, lane `tabi-shokunin`). Freeze rev `2e7b7a8920bff47fae6f75c3d06e48e37767099e`.
Raw receipt: `.ufo/waves/round-36/w1/ExecSelftest/selftest.txt` (every command, exit code, last output line).

## What was checked (all five item legs pass)

1. **frozenDigests 8/8 match real bytes.** For each of the eight keys in `.ufo/waves/round-36/claims.json` `frozenDigests`, `git show 2e7b7a89…:<path> | sha256sum` equals the declared digest — and equals the current worktree bytes too (worktree == freeze for all eight, so no drift between freeze and tree). The two annotated keys (`scripts/check-adjacency.mjs`, `scripts/check-bidi-runtime.mjs`) were resolved to their bare paths and match. Both counters carry the same pins internally (`c1-adjacency-sweep-v4.mjs:79 ADJ_GATE_SHA256=4e2c2a64…`, `c2-firefox-bidi-v2.mjs:71 GATE_SHA256=370e8e95…`), so the claim file, the counters and the worktree agree three ways.
2. **Both counters parse.** `node --check` on `c1-adjacency-sweep-v4.mjs` and `c2-firefox-bidi-v2.mjs`: exit 0, no output (node v24.21.0).
3. **C1 list modes hit their declared counts exactly**, run from the freeze-commit bytes of the counter against a clean clone at the freeze rev: `--list-candidates` 383, `--list-drift` 307, `--list-delta` 0. All three pipe exits 0.
4. **C1 predicate is reachable at the freeze rev.** Clean clone (`--shared` clone of the lane, detached at the freeze rev, `--show-toplevel` asserted, porcelain 0 lines), counters taken via `git show FREEZE:`: `--json` exit 0, `predicate=true`, adjacency clean, `completeness.unaccounted=0`, `drift.total=307 / auditCoverage=307 / auditFindings=0 / staleFindings=0`, `delta.total=0 / unaccounted=0 / screenFindings=0`, `newMapped=0`, stderr 0 bytes. The non-JSON form exits 0 with the same summary line. Re-running the same command produced **byte-identical** JSON (deterministic instrument, 15 top-level keys in both runs) — the predicate is not a coin-flip.
5. **Gate self-tests all green.** Loop replicated exactly as `measure.sh` does it (`grep -oE -- '--self-?test'`, first match, over `scripts/check-*.mjs` + `scripts/round-evidence-audit.mjs`) from the clean clone: **18 scripts, 18 exposed a flag, 18 exited 0**, none skipped. Case counts: adjacency 57, aria-metadata 36 CLI + 4 helper, bfcache-receipt 17/17, bidi-runtime 56/56, decision-table 34/34, freshness 12, frontier-admission 24/24, gate-mutants 12/12, gate-registry 22/22, measurement-binding 76, release-pins 29/29, round-contract 38, s106-evidence 10/10, selfassessment 41/41, source-reopen-receipt 18/18, sources 26, user-round-contract 45, round-evidence-audit 13/13.

## Evidence retained

- `.ufo/waves/round-36/w1/ExecSelftest/selftest.txt` — per-command line: command shape, exit code, last output line; plus the digest table (git bytes, expected, verdict, worktree bytes), the two binary-pin line numbers, the determinism note and an explicit scope stanza.
- All runs executed with `TMPDIR=/fast/scratch/hyaku/tabi-r36/ExecSelftest/tmp`; every git call named `-C "$S/c"`; clone toplevel asserted as `$S/c`; no mutating git command was issued anywhere. Scratch root deleted before finish.

## Findings against the instruments

None. Every leg of the assignment passed on the freeze bytes, and nothing needed adjustment: the counts the claim states (383 / 307 / 0), the predicate the claim states (true with 307/307 audited, 0 findings), and the freeze digests are all reproducible from a clean clone by anyone.

## Risks / notes (not defects, disclosed for the L1)

- **Digest equality is also worktree equality.** The eight frozen files are byte-identical between the freeze commit and the current tree. That is what we want, but it also means this receipt cannot distinguish "frozen file was edited before freeze" from "frozen file matches" — only that the tree has not moved since the freeze commit. Any w1/w2 landing that touches these eight paths will break the freeze match and must be re-measured.
- **`--list-delta` counts 0 by pipe but the tool still prints a trailing newline class of output**: the correct measure is `| wc -l` (0), as done here; counting via shell variable expansion would report 1. Recorded so a later reader does not mistake an empty expansion for a one-line ledger.
- **Scope of this seat is the instruments, not the claims.** The C2 live Firefox/geckodriver leg, the C1 control receipts (c1-J0…J5) and the C2 attack battery (c2-J2…J6) were not run here; they belong to the seats that own those legs.

## Tooling

No install or upgrade was performed; `node v24.21.0` (host) and stock coreutils/git were sufficient. No pacman invocation.

VERDICT ok — all five self-test legs pass at the freeze rev: 8/8 frozenDigests match the committed bytes (git and worktree), both counters pass `node --check`, C1 list modes read 383/307/0 as declared, the C1 counter exits 0 with `predicate=true` (307/307 audited, 0 findings) in a clean clone and re-runs byte-identically, and all 18 gate self-tests exit 0.
