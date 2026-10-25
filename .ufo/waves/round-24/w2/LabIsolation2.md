# LabIsolation2 — W2 falsification: gate isolation probe

Report: `.ufo/waves/round-24/w2/LabIsolation2.md`
Scope: bounded probe — "running both gates leaves the lane's tracked tree byte-identical and writes nothing outside their declared scope." TMPDIR exported to `/home/vgpnk/tmp-tabi24` per host note (also to a per-seat `scratch/LabIsolation2/tmp*` for isolated attribution). Lane tip = `ad125e85c235e1c4ec6a08e398bd64da01f68a08` = `master` = `HEAD` (`git rev-parse master; git rev-parse HEAD`).
Node v24.21.0; strace present; no tools installed (nothing needed).

## Verdict on the hypothesis

**Confirmed mechanically, falsified semantically.** The tracked tree is byte-identical and nothing survives outside TMPDIR (F0). But the instruments and the claims built on them fail in five grounded ways (F1–F8): C2's `after: 0` is not reproducible at tip and is contradicted by the claim's own committed receipt; the counter is non-hermetic; m1 validates tallies on selftests that exit nonzero; both gates' selftest failure paths exit an undeclared code; and environment failure (unwritable TMPDIR) exits 1 = "failed", not could-not-evaluate.

## F0 — isolation confirmed (hypothesis, supported)

Snapshots before vs after 8 runs (`--selftest` ×2, `--rev ad125e8` ×2, per gate):

- `git status --porcelain=v1 -uall` — identical (5 then 7 `??` wave-2 artifacts; the count grew from concurrent sibling writes, not the gates).
- `git ls-tree -r master` (5250 entries) — identical.
- `git rev-parse master HEAD`, `git for-each-ref`, `git stash list` — identical.
- `find .git -newer marker -type f` after gate-only window — **empty**: no file inside `.git` written. `.git` *directory* mtime updates, but a 20 s `sleep` control with zero commands shows the same churn → ambient sibling `git` activity, not attributable to the gates (control: `touch .mA; sleep 20; find .git -newer .mA` → `.git`).
- Full-worktree `sha256sum` diff — changed files are exclusively other seats' `.ufo/waves/round-24/scratch/<Peer>/` fixtures plus my own scratch; **zero** tracked-file changes.
- Dedicated `TMPDIR=$S/tmp` + marker: after all 4 runs, `ls -A $S/tmp` = 0 residue; `find` for non-scratch worktree files newer than marker = empty.
- `strace -f -e trace=%file`: every create/unlink/rename resolves under the TMPDIR fixture roots (mkdtemp git init/commit churn — `tmp3/tabi-selfassessment-*/tabi-freshness-selftest-*/.git/...`). Lane `.git` sees only `O_RDONLY` (e.g. `.git/objects/pack/multi-pack-index`). `check-selfassessment --rev` transitively `spawnSync`s the lane's runnable gates' selftests (`RUNNABLE_GATE`, line 70) — observed `tabi-freshness-selftest-*` fixture creation inside the parent tmp.
- Determinism: JSON outputs byte-identical across both repetitions for all four modes.

## F1 — C2 `after: 0` falsified at tip; claim contradicts its own receipt

`node scripts/check-selfassessment.mjs --rev ad125e85... --json` → exit **1**, `mismatches: 1`, `clean: false` (both repetitions, identical). Finding: `m3-unlanded-paths, claimed: "landed", observed: 5` (= the `git status --porcelain -uall` count at that moment).

More: `corpus/evidence/round-24/c2-measurements.json` itself records `"after": { rev: b973fde…, mismatches: 1, m3 observed=4 }` and `"before": { mismatches: 5 }` — while `claims.json` freezes `before: 4, after: 0` (declared: "one unlanded-path mismatch over 89 porcelain paths", a stale round-23-era number; measured at `b973fde`, not the lane tip). So the frozen claim disagrees with the committed receipt in **both** cells (4 vs 5 before; 0 vs 1 after). C1's `after: 0` does hold at tip: `check-gate-registry --rev ad125e8` → exit 0, `nonconformant: 0`, 14 gates, 23 rows, deterministic.

## F2 — counter non-hermetic; `after: 0` unreachable during any in-flight wave

`m3Findings` (script lines 262–273) runs `git status --porcelain --untracked-files=all` on the **live working tree** regardless of `--rev`, whenever SCORECARD's newest "executed disposition" block claims landed. Evidence: `--rev 573c99e` (baseline) reports `m3 observed=7` today vs `observed=4` in the receipt for the same rev. The metric is not a function of committed bytes; the same "before" revision scores 4, 5, or 7 depending on sibling traffic. `.gitignore` line 5 does ignore `.ufo/waves/*/scratch/` (routed defect 3 confirmed for scratch), but wave-level artifacts (`gen-w2.mjs`, `w2-dispatch.err`, `w2-dispatch.json`, `w2-spec.json`, `w2/swarm-registry.json`) are unignored and trigger m3 — so the target cannot read 0 at any moment a wave is in flight, including the L1's own integration checkpoint.

## F3 — m1 compares only the tally, never the exit

`gateTally` (lines ~150–170): `result = { status: "measured", tally: Number(m[1]), exit: r.status }` — `exit` is recorded and never consulted; `observed === claimed` matches on the printed `cases=N` alone. Demonstrated live: `node scripts/check-adjacency.mjs --self-test` on this host → exit **1**, `ADJACENCY_SELFTEST verdict=failed cases=57 reasons=18 could_not_evaluate=5` (case `git-failed`: exit=1 expected=2, all 15 reasons `*_unresolved`), and retains `fixture retained: <tmp>/tabi-adjacency-selftest-*`. Yet the tip run counts `SCORECARD.md:1195` `claimed: 57, observed: 57` as a clean match — the m1 class reports agreement between the scorecard and a currently-failing selftest. Claim wording "a `--selftest` tally that disagrees with the gate's own selftest output" is narrower in practice: only the integer is compared, not the verdict. (Attribution note: check-adjacency's failure is pre-existing lane state, not caused by this probe — 56/57 pass.)

## F4 — undeclared exit code on selftest failure

Both gates: `process.exit(out.ok ? 0 : 3)` on selftest failure (`check-gate-registry.mjs:439`, `check-selfassessment.mjs:550`), while both headers declare "Any other nonzero code is undeclared and reads as could-not-evaluate" and both registry rows declare `0=clean; 1=failed; 2=could-not-evaluate`. A failing selftest exits 3 = undeclared code — the new instrument violates the verdict-map convention C1's own registry enforces on 14 gates. (Grounded by source read; selftest matrices pass clean at tip, 22/22 and 13/13, so no failure run was observable without mutation, which read-only bounds prohibit — the `exit 3` literal is direct.)

## F5 — unwritable TMPDIR exits 1 ("failed"), not 2 (could-not-evaluate)

`TMPDIR=<chmod-500 dir>`: `mkdtempSync` throws `EACCES` uncaught → exit **1** for `check-gate-registry --selftest`, `check-selfassessment --selftest`, and `check-selfassessment --rev ad125e8` (throw at `gateTally`, line 150 — outside its try/finally). The round's own receipt asserts "ENOSPC made three gate self-tests could-not-evaluate" — by exit code the observed behavior is `failed`, the opposite verdict class, and an m1-class tally could never be trusted as cne in that state. Reproduced; stack traces in `scratch/LabIsolation2/nw.*.out`.

## F6 — the defect class C2 catches survives in its own source, undetected

- `check-gate-registry.mjs:7` header: "`--selftest` (**15** isolated cases…" — shipped matrix is **22** (`selftest --json` → `cases: 22, passed: 22`).
- `check-selfassessment.mjs:8` header: "**10** isolated cases" — shipped matrix is **13** (`cases: 13, passed: 13`).
- `check-gate-registry.mjs:303` legacy row template: "`--selftest`; **4** isolated cases".
- The m1 class reads only `SCORECARD.md`/`SHONEN.md` (`m1Findings`, line ~170), so gate-header tallies are outside its scope — the stale-figure class escapes the counter in the one place it most matters.
- The two new gates' own SCORECARD figures (`SCORECARD.md` lines 1232/1233/1243/1249, the round-24 `22`/`13` entries) resolve as `couldNotEvaluate: "ambiguous script association"` — the counter cannot decide the tally claims of the new gates themselves.

## F7 — decidable surface at tip: 14 of 93 findings

Tip JSON: `findings: 93` = 16 m1 + 76 m2 + 1 m3; `couldNotEvaluate: 79` (75 × m2 "command outside the closed re-run grammar" — `SAFE_GIT` admits only `git cat-file -e`/`git show`, line ~216 — plus 4 × m1 "ambiguous script association"); `superseded: 5`; `mismatches: 1`. Even absent F1/F2, a reported `0` would rest on 7 decidable m1 comparisons + 1 decidable m2 receipt + an m3 that is vacuous only when the tree is clean. 84.9 % of the counter's enumerated surface is non-decidable; `couldNotEvaluate` is disclosed in JSON but absent from the claim's `before/after` prose.

## F8 — temp-tree leak in a transitively-executed gate (adjacent observation)

`check-adjacency.mjs --self-test` failure path prints `fixture retained: <tmp>/tabi-adjacency-selftest-*` and leaves the temp repo behind (observed in isolated `TMPDIR=$S/tmp2`; residue = `tabi-adjacency-selftest-30yeOK`). 8 such dirs currently accumulate in shared `/home/vgpnk/tmp-tabi24` (ages 05:49–05:52, from concurrent seats' direct runs). When `check-selfassessment --rev` spawns it, the parent's `rmSync` contains the leak — so the two gates under review leave **zero** residue; the leak is check-adjacency's own failure path. Earlier `tabi-selfassessment-GDZVBk` in the shared tmpdir disappeared on recheck (in-flight sibling, not a leak).

## Retained evidence (under `.ufo/waves/round-24/scratch/LabIsolation2/`)

- `*.before`/`.after`/`.iso` snapshots: `status`, `lstree`, `refs`, `revs`, `stash`, `tree` (sha256), `tmpdir` listings; `.marker`, `.marker2`, `.mA`, `.mB` markers.
- `iso.<gate>.<mode>.out` — isolated-TMPDIR run outputs; `check-*.{selftest,rev}.{1,2}.{json,err}` — full JSON for all 8 runs; `exits.txt` — exit codes + wall ms.
- `nw.reg.st.out`, `nw.sa.st.out`, `nw.sa.rev.out` — EACCES stack traces (F5).
- `adj.st2.out` — check-adjacency selftest failure + `fixture retained` line (F3/F8).
- `trace.sa.rev.log`, `trace.reg.st.log` — strace `%file` traces (F0).
- `mut/` — unmodified copies (no mutant run needed; see F4 note), `tmp*/`, `nowrite/` — fixtures; `c2-declared.txt` — full claim text.

## Commands (canonical reproductions)

- `git status --porcelain=v1 -uall`, `git ls-tree -r master`, `git for-each-ref --format='%(refname) %(objectname)'` before/after — byte-identical.
- `TMPDIR=$S/tmp node scripts/check-{gate-registry,selfassessment}.mjs --selftest|(--rev ad125e85c235e1c4ec6a08e398bd64da01f68a08) --json` ×2 each — registry 0/0; selfassessment 0 selftest, **1** rev.
- `node scripts/check-selfassessment.mjs --rev 573c99e4885382db38babc3a6fc90e77afeb42a6 --json` → `m3 observed=7` (F2).
- `TMPDIR=$S/nowrite node <gate> ...` → EACCES exit 1 (F5).
- `TMPDIR=$S/tmp2 node scripts/check-adjacency.mjs --self-test` → exit 1, `fixture retained` (F3/F8).
- `strace -f -e trace=%file env TMPDIR=$S/tmp3 node scripts/check-selfassessment.mjs --rev ad125e8…` → all writes under tmp3 fixtures (F0).

## Risks / residual unknowns

- `.git` dir-mtime churn is ambient (sibling git activity); no gate-attributable `.git` file writes observed — but concurrent-lane contention means an object-store write timed to a sibling commit could not be perfectly excluded at syscall granularity; the after-state hash sweep rules it out.
- check-adjacency's `git-failed` selftest failure predates this probe; whether it fails on the L1's measurement host identically is untested here — the m1 exit-blindness finding holds either way.
- The m3 count moved 5→7 during the session as wave-2 dispatch artifacts arrived; today's `observed=5` is the value frozen in the first two run outputs.

## Blockers

None.
