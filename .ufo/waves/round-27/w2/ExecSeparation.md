# ExecSeparation — causal-separability proof for C1/C2/C3 (round 27, wave 2 FALSIFY)

Seat: TabiR27.ExecSeparation (leaf, read-only reporter). Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
HEAD at measurement: `bceb17d` (`round-27: integrate falsification findings, documentation, report tool and W2 dispatch`).
All paths absolute; scratch only under `.ufo/waves/round-27/scratch/TabiR27.ExecSeparation/` (gitignored). No tracked writes,
no git/jj writes, no installs (node v24.21.0 pre-existing; no tool changed). No git fixtures needed — every check ran
against real committed revs via read-only git.

## 1. The three counter commands, re-run at the isolation revs

| item | command (cwd = lane root) | exit | headline result |
|---|---|---|---|
| (a) C1 w/o C2/C3 | `node scripts/check-selfassessment.mjs --rev fd722a7864d5e6331063251216f8922be8de5048 --json` | 1 | `mismatches=1`, `counted` = **[m3-unlanded-paths only]** |
| (b) C2 w/o C1/C3 | `node scripts/check-s106-evidence.mjs --rev 5577d1b6fe2dc298486e354b5416d38acafeffaa --json` | 0 | `valid=true`, `present=true sha_match=true anchor_located=true anchor_unique=true byte_count_match=true` |
| (c) C3 w/o C1/C2 | `git grep -lE '^source: S107 ' 6ca3b89ad2a7b480984859834b3d28f1e75a9a26 -- corpus/knowledge \| wc -l` | 0 | **1** (matched file: `corpus/knowledge/redirect-and-retry-after-semantics.md`) |

Sweep context for (c): same grep at `master` → 1; at baseline `f185b4e` → 0.

## 2. (a) C1 at fd722a7 — counted[] contains no finding that depends on C2/C3 bytes

Observed `counted` (verbatim, both gate copies):

```
[{"class":"m3-unlanded-paths","doc":"SCORECARD.md","line":null,"claimed":"landed","observed":4}]
```

- **No LOG-window finding survives** at fd722a7 (all five baseline LOG findings are superseded by the C1 commit's own
  correction block: `superseded=10`, LOG-window counted = 0). So there is no counted finding that *could* reference C2/C3
  bytes — and, structurally, there are no C2/C3 bytes at that rev: `git ls-tree fd722a7 -- scripts/check-s106-evidence.mjs`
  → absent (C2's gate script lands only at `5577d1b`); `git ls-tree fd722a7 -- corpus/knowledge/redirect-and-retry-after-semantics.md`
  → absent (C3's entry lands only at `6ca3b89`).
- **The m3 finding is working-tree noise, not a coupling.** Its `observed` is the live `git status --porcelain
  --untracked-files=all` path count at run time (`check-selfassessment.mjs:384`, `spawnSync`), independent of `--rev` and
  of every committed byte. It read 4 in one run and 5 in the next (blob-gate control) seconds apart. It is present at every
  rev — the C1 before-arm budgets it ("+1 m3 working-tree finding", `claims.json:28`) and the kill rule keeps m2/m3 out of
  the extension's scope (`claims.json:31`). It cannot couple the claim to C2/C3 because it samples only the live tree and
  exists identically before any C2/C3 byte existed.
- **Reproducibility vs the committed receipt:** my run equals `measure-c1-fd722a7.json` element-for-element once the m3
  live count is normalized (115/115 findings identical, `only-in-mine=0`, `only-in-receipt=0`; summary identical:
  `mismatches=1, superseded=10, couldNotEvaluate=92`). The L1 receipt is byte-reproducible modulo the live m3 count.
- **Fidelity control:** the gate blob at fd722a7 (`gate-c1-fd722a7.mjs`, extracted via `git show`) yields the same
  `counted` (m3 only). Note `git diff fd722a7 master -- scripts/check-selfassessment.mjs` is **empty** — the C1 counter
  code is byte-identical today to the code that landed C1, so no later integration touched it.

## 3. (b) C2 at 5577d1b — valid regardless of LOG/corpus changes

- Result `valid=true` under both gate copies: the worktree gate (post-repair `fce4d4e2…`) and the landed C2-era blob
  (`a339ec31…`, extracted and run) produce byte-identical JSON (`BLOBGATE_IDENTICAL`). Post-landing code changes
  (`5198e28`, `5ed6484`, comment edits in `bceb17d`) affect only the missing-receipt branch, never this path.
- My output is byte-identical to the committed measurement receipt `measure-c2-5577d1b.json` (`c2 receipt equal: true`).
- **Input set (from source): exactly two blobs** — `corpus/evidence/round-26/sources/s106.json` (`RECEIPT_PATH`) and the
  receipt's `bytes_path` (`check-s106-evidence.mjs:45,109,114`). The gate never reads LOG.md, SCORECARD.md, corpus/knowledge,
  or corpus/SOURCES.md (source sweep: no such path in the file). Therefore LOG/corpus changes cannot reach it.
- **Empirical invariance:** both input blobs have identical oids at all four claim revs:
  `s106.json` → `e2cc93298c4df00cbac614b6d8ebebff705ddbfb`, bytes → `1ec86eaac948e8c295def4a70273bd7e75e01446`
  at fd722a7 / 5577d1b / 6ca3b89 / master. Neither C1 (fd722a7 touched no corpus path) nor C3 (6ca3b89 touched
  `corpus/SOURCES.md`, `corpus/knowledge/*`, `.ufo/…/assimilation/*` only) altered these paths.

## 4. (c) C3 at 6ca3b89 — grep count = 1 regardless of gates

- The counting command is pure `git grep` over `corpus/knowledge`; it executes no gate and reads no script, so C1's and
  C2's gates are not in its dependency closure by construction.
- Its byte set was introduced solely by C3's own commit: `6ca3b89` is the only commit of the three that touches
  `corpus/knowledge/redirect-and-retry-after-semantics.md` (the sole match) and the only one that appends row S107
  (`corpus/SOURCES.md:121`). fd722a7 and 5577d1b do not touch `corpus/knowledge` or `corpus/SOURCES.md` at all.
- Sweep: count = 1 at 6ca3b89 and master; 0 at baseline f185b4e (pre-C3). Monotone, gate-independent.

## 5. (d) Hidden coupling search

**Observed shared input (soft, uncounted):** C1's `m2Findings` scans `corpus/evidence/**/*.json` (`check-selfassessment.mjs:338`),
so it touches C2's evidence receipt file `s106.json`. At fd722a7 this yields exactly one finding —
`m2-receipt-exit corpus/evidence/round-26/sources/s106.json "command outside the closed re-run grammar"` — which is
**could-not-evaluate and never counted** (counted has only m3). NB `s106.json` is round-26 substrate (it predates all three
claims), not a C2 landed byte; C2's landed byte set is only `scripts/check-s106-evidence.mjs`. Risk: if a future receipt in
that directory were reshaped into the m2 grammar with a failing exit, C1's `mismatches` would move — a shared-directory
state dependency, not a dependence on C2's admission.

**Latent gate-oracle interaction:** C1's m1 oracle executes named gates from the *worktree* disk (`spawnSync("node",
[diskPath, flag])`, `check-selfassessment.mjs:161`). At the tip, `SCORECARD.md:1397` narrates C2's gate ("selftest 4/4")
but carries none of the four frozen tally shapes (`--selftest` (N/N), `N-case`, `cases=N`, `N cases`), so m1 emits no
finding and never runs `check-s106-evidence.mjs` (verified: the master run contains no finding whose `script` names s106).
If a future tally line used a recognized shape for the s106 gate, C1's oracle would execute C2's gate — a genuine
cross-claim runtime coupling. Latent today; no measured effect on any run.

**Not found:** hardcoded cross-references (`grep` for `S107|s106|redirect|check-s106|check-sources` in
`check-selfassessment.mjs` → zero matches; `check-s106-evidence.mjs` references no LOG/SCORECARD/knowledge path);
shared receipt files (each claim has a distinct measurement receipt — `measure-c1-fd722a7.json`,
`measure-c2-5577d1b.json`, `selfassess-baseline/tip-raw.json` — and no counter reads any of them; counters read rev blobs
plus live porcelain only).

**Validation-layer join (not hidden):** C3's counterField "plus" arm (`sources-census.sh validate --root … tabi` exit 0)
validates the whole registry — `scripts/check-sources.mjs` reads `corpus/SOURCES.md` and each row's used-by knowledge file
(`inspectUsedBy`, `check-sources.mjs:231-233,329-341`). That arm couples C3's full claim to the integrity of *all*
registry rows including C2's S106. The grep arm and the S107 row bytes themselves are clean of this.

**Observation for the record:** LOG.md at fd722a7 already contains round-27 narration naming S106/S107/redirect (lines
1811-1852, e.g. "commit decoded S106 evidence", "one transformed row S107"). These are the L1's pre-landing round ledger
(added by fd722a7 itself, +47 LOG lines), not C2/C3 bytes; none carries a recognized tally shape, so none is counted. They
do not create a dependence.

## 6. Verdict

Causal separability holds for all three claims as measured:

- (a) At fd722a7, C1's counted[] = {m3} only; the m3 finding is a live-porcelain liveness probe (observed 4↔5 within
  seconds) that exists identically at baseline, is outside the claim by kill rule, and cannot reference bytes that do not
  exist at that rev. The counter code is unchanged from fd722a7 to master.
- (b) At 5577d1b, C2 valid=true under both the landed and current gate code, byte-identical to the committed receipt; its
  input set is exactly two blobs that are oid-identical across all four claim revs and untouched by C1/C3.
- (c) At 6ca3b89, the grep count is 1, produced solely by C3's own entry bytes; the command executes no gate.
- (d) No shared receipt file, no hardcoded cross-reference, no counted cross-claim coupling. Two latent/soft interactions
  are reported for the L1: (i) C1's m2 scans the corpus/evidence directory that hosts C2's receipt (today: one uncounted
  CNE finding), and (ii) C1's m1 oracle would execute C2's gate from the worktree if a future tally line named it with a
  recognized shape (today: no such line). C3's census "plus" arm validates the shared registry including S106 — a stated,
  not hidden, join.

## 7. Exact retained evidence

Scratch: `.ufo/waves/round-27/scratch/TabiR27.ExecSeparation/`
— `c1-fd722a7.json` (worktree gate run; ~18.3 s), `gate-c1-fd722a7.mjs` + `c1-fd722a7-blobgate.json` (fidelity control),
`c2-5577d1b.json`, `gate-c2-5577d1b.mjs` + `c2-5577d1b-blobgate.json`, `c1-master.json` (tip probe).

Key commands (all read-only, `git -C <lane>` / cwd = lane root):
```
git diff fd722a7864d5e6331063251216f8922be8de5048 master -- scripts/check-selfassessment.mjs        # empty
git ls-tree fd722a7864d5e6331063251216f8922be8de5048 -- scripts/check-s106-evidence.mjs corpus/knowledge/redirect-and-retry-after-semantics.md   # absent
git grep -lE '^source: S107 ' 6ca3b89ad2a7b480984859834b3d28f1e75a9a26 -- corpus/knowledge | wc -l  # 1
git rev-parse <fd722a7|5577d1b|6ca3b89|master>:corpus/evidence/round-26/sources/s106.json             # e2cc9329… at all four
git rev-parse <same revs>:corpus/evidence/round-26/sources/content-features-154.0.8037.97.cc          # 1ec86ea… at all four
node scripts/check-selfassessment.mjs --rev fd722a7864d5e6331063251216f8922be8de5048 --json           # mismatches=1, counted=[m3]
node scripts/check-s106-evidence.mjs --rev 5577d1b6fe2dc298486e354b5416d38acafeffaa --json            # valid=true, exit 0
```
