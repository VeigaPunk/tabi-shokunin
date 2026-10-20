VERDICT: PASS

# ReconIdentityChain — round 17, C1 supporting recon (leaf scout)

Snapshot. LANE HEAD `5859243183c4d7ac5429dfdb8a73ce0d9a43d583` (`git rev-parse HEAD`). Both C1 gates
were being edited by GateRoundAnchor / GateUserAnchor during this recon: `git status --porcelain` →
` M scripts/check-round-contract.mjs`, ` M scripts/check-user-round-contract.mjs`,
` M scripts/check-measurement-binding.mjs`, ` M scripts/selftest-measurement-binding.mjs`
(mtime 2026-10-20 12:51:07/08 -0300). Worktree snapshot S1 = user gate sha256
`bac10415d07c38814cfa9c1c1e44e4c640df7e48d8c10071c0cae9ca4ffdb8da`, round gate sha256
`15f0796e0d5a02b80ef8bd919d33a98b779b909cb1a6b7da16a7c283a20ba715`; both already carry `laneTip`
(C1). Line numbers below are S1 unless marked S0 (committed 5859243); S0 and S1 agree on every
identity constant. LSP unavailable: `read xd://lsp` → `No such tool: xd://lsp` (mounted-device list
contains no `lsp`), so symbol tracing is literal grep; the behavioural claims are execution-verified
in a throwaway clone `/tmp/tabi-r17-ReconIdentityChain-jDQR` (deleted), never grep-implied.

## 1. What the chain is

- `scripts/check-user-round-contract.mjs:17` `ROUND_SCRIPT = 'scripts/check-round-contract.mjs'`.
- Identity constants `:29-41`: PRIOR `7d403cee…` (bytes at `PSTACK_PIN = 92d700d6…`, `:13`),
  INTERMEDIATE `6f9eddc7…` (round-13 `1199150`), CUTOVER `8478cd43…` (round-13 `1212207`),
  CURRENT `8a573b4e…` (`:32`); `ROUND_SCRIPT_ARCHIVED_SHA256 = [PRIOR, INTERMEDIATE, CUTOVER]`
  (`:33-37`); `ROUND_SCRIPT_ACCEPTED_SHA256 = [PRIOR, CURRENT]` (`:38-41`).
- `acceptedRoundScript` `:247-267`: `:248` rejects a non-64-hex ACCEPTED entry (could_not_evaluate,
  exit 2); `:251` `tip = laneTip(root)`, `:252` `head = show(root, tip, ROUND_SCRIPT)`, `:253` a
  missing tip blob returns false; `:254-258` the `PSTACK_PIN` blob must hash PRIOR (else exit 2; in
  production a missing pin blob is exit 2); `:259` history query; `:261` archived Set =
  `ARCHIVED ∪ {CURRENT}`; `:262-265` every commit in the walk must have a blob in that Set;
  `:266` tip blob must be in ACCEPTED.
- Consumer: `pstackDrift` `:284` `if (path === ROUND_SCRIPT) return !acceptedRoundScript(...)`; it is
  reached from the pstack diff `git diff --no-renames --name-status <pin> <tip> -- ...PSTACK_PATHS`
  `:350` over `PSTACK_PATHS` `:73-81` (`ROUND_SCRIPT` at `:77`). Observable failure:
  `USER_ROUND_CONTRACT verdict=failed finding=history_rewritten detail=Pstack bytes changed: M<TAB>scripts/check-round-contract.mjs` (executed, exit 1).

## 2. What the L1 must change when check-round-contract.mjs bytes change

1. **`:32 ROUND_SCRIPT_CURRENT_SHA256`** ← sha256 of the *final* new round-gate bytes. Required.
2. **`:33-37 ROUND_SCRIPT_ARCHIVED_SHA256`** ← append the *old* CURRENT `8a573b4e…` and every
   intermediate byte state that gets committed in `pin..tip`. Required: the Set at `:261` is
   `ARCHIVED ∪ {CURRENT}`, so dropping the old current out of the archive makes the commit that
   introduced it (`ed69b154`) unmatched. Executed: with only `:32` updated the gate still printed
   `finding=history_rewritten`; after appending `8a573b4e…` it returned to the inherited baseline
   `verdict=failed finding=round_count detail=Found 6 user rounds, expected 10`.
   Same rule for intermediates: a second byte change with an updated `:32` but the first change
   unarchived again gave `history_rewritten`; archiving it restored `round_count`.
3. **`:38-41 ROUND_SCRIPT_ACCEPTED_SHA256`** — no edit; it derives from PRIOR + CURRENT.
4. **`:29-31`** — no edit; those are frozen historical bytes.
5. **Land both in the same commit as the new round-gate bytes.** `:266` only accepts the *tip* blob,
   and the self-test case `round_script_cutover` (`:1248-1250`) writes
   `readFileSync(join(defaultRoot, ROUND_SCRIPT))` — the LANE *worktree* bytes — into a fixture and
   expects clean. Executed: committing the constant ahead of the tip bytes (tip reverted to
   `8a573b4e…`, CURRENT `ccf6196d…`) gave `history_rewritten`; appending an uncommitted byte to the
   worktree while `:32` was current made `SELFTEST name=round_script_cutover … expected_exit=0
   actual_exit=1 … result=FAIL`. So `:32` must equal the final worktree bytes at self-test time and
   the final tip blob at gate time — i.e. one atomic commit.
6. **No edits** to the user gate's own history pins: `:50 LEGACY_USER_GATE_BLOB 18e2c79a…`,
   `:55 LEGACY_COUNT_GATE_BLOB 7df3ee9f…`, `:875 COUNT_WITNESS_REV bebe2ef…`, `:882-884`
   DIAGNOSTIC_BASELINE (`5c7710d` / blob `347ae9bb…` / sha256 `bde18c67…`). All are historical arms;
   resolved and confirmed: `git rev-parse 75e7836b:scripts/check-user-round-contract.mjs` →
   `18e2c79ada4258cc46af7696e98907299b77c431`; `git cat-file blob 347ae9bb… | sha256sum` →
   `bde18c67…`.

## 3. pin..tip walk semantics (exact)

`git log --no-show-signature --format=%H ${pstackPin}..${tip} -- scripts/check-round-contract.mjs`
(`:259`). Range excludes the pin commit; the pin blob is checked separately against PRIOR
(`:254-258`). No `--first-parent`, no `-m`, no `--full-history`, no `-m --diff-filter`, so git's
default history simplification applies; each listed commit is then read as `show(rev, path)`
(`:263`) and a revision where the path is absent yields null → false. Observed walk at S0 (three
commits, blob + sha256):
`ed69b154… → 3b49a9c7… → 8a573b4e…` (CURRENT), `1212207… → 43db9f4b… → 8478cd43…` (CUTOVER),
`1199150… → d871e73d… → 6f9eddc7…` (INTERMEDIATE). Note `git rev-parse
92d700d6…:scripts/check-user-round-contract.mjs` → `fatal: path … exists on disk, but not in
92d700d6…`: the pin carries no user gate, so this pin anchors only the round script.

## 4. Executed matrix (sandbox clone of 5859243, 8 commits; all runs `node scripts/check-user-round-contract.mjs`)

| # | state | result |
|---|---|---|
| 0 | clean baseline | `round_count` (6/10), exit 1 — inherited red |
| 1 | round gate byte appended, constants stale | `history_rewritten`, exit 1 |
| 2 | `:32` = new sha, archive untouched | `history_rewritten`, exit 1 |
| 3 | `8a573b4e…` appended to `:33-37` | `round_count`, exit 1 (chain passes) |
| 4 | second byte change, `:32` only | `history_rewritten`, exit 1 |
| 5 | second intermediate archived | `round_count`; `--self-test` → `USER_ROUND_CONTRACT_SELFTEST verdict=clean cases=42 fixtures=32 …`, `round_script_cutover … result=PASS` |
| 6 | uncommitted worktree drift vs `:32` | `round_script_cutover … result=FAIL` |
| 7 | `:32` ahead of tip bytes | `history_rewritten`, exit 1 |

## 5. Does check-round-contract.mjs pin the user or binding gate?

**No.** `grep -n "scripts/[a-z-]*\.mjs\|check-user-round-contract\|check-measurement-binding"
scripts/check-round-contract.mjs` (S1) returns only `:122 scripts/check-freshness.mjs` (inside
`protectedPath`, `:115`), `:997/999/1000` and `:1036/1038/1039` (its own path, witness arms), and
`:1076` (its own bytes vs `codeRevision`). No occurrence of `check-user-round-contract.mjs` or
`check-measurement-binding.mjs` anywhere in the file. Its only cross-file freeze is
`protectedPath` + the baseline census (`CENSUS_PATH/CENSUS_SHA256 :30`; the census row set contains
exactly one script, `scripts/check-freshness.mjs`) + `APPEND_ONLY :25`. So the dependency is one-way
(user → round): round-gate edits force the `:32/:33-37` update; user/binding-gate edits force none.
The binding gate hardcodes no gate path: it validates manifest-declared `countedInputs` and
`counter.sha256` (`check-measurement-binding.mjs:493-500`), and the user gate contains no reference
to `check-measurement-binding` at all (`grep` empty). Round-gate self-pins: `LEGACY_GATE_BLOB
b2eb8316…` (`:38`), `COUNT_WITNESS_BLOB 43db9f4b…` (`:42`), `COUNT_WITNESS_REV bebe2ef…` (`:43`);
blob sha256s verified `7d403cee…` and `8478cd43…`. New in S1: `code_committed=` (`:1076-1079`) so a
receipt printing `code_revision=<tip> code_sha256=<worktree>` now carries whether those bytes are
the tip's.

## 6. Every other pinned identity (all historical; none is compared by a live gate)

check-round-contract.mjs:
- `scripts/check-user-round-contract.mjs:32` (current `8a573b4e…`), `:33-37`, `:38-41` — the live pin.
- `SKILL.md:1677` registry row (constants "HARD_BASELINE, canonical seed digest, census digest and
  legacy witness blob"; `--witness 75e7836b…`); `SKILL.md:1730` same witness argv for the user gate.
- `corpus/evidence/round-14/gates.json:7` sha256 `8a573b4e…` at codeRevision `f942c625…` (`:3`);
  `corpus/evidence/round-13/gates.json:7` sha256 `8478cd43…` at `9c547dd2…` (`:3`).
- `corpus/lessons/round-14-verifier-spotcheck.md:105` (`ROUND: 8a573b4e…`); `LOG.md:523`;
  `.ufo/waves/round-15/w1/HistoricalImmutable.md:53,70`; `.ufo/waves/round-16/w1/ReconProtected.md:69-71`;
  `.ufo/waves/round-16/harm-baseline.json:191` (identity-constant rule).
check-user-round-contract.mjs:
- self history pins `:50`, `:55`, `:875`, `:882-884` (see §2.6).
- `corpus/evidence/round-15/user-diagnostics.json:4` codeSha256 `f9be3a72…` at revision `27dfd98…`;
  `.ufo/waves/round-15/verified-code-snapshot.json:4` same digest.
- `corpus/evidence/round-14/gates.json:55` sha256 `bde18c67…`; `corpus/evidence/round-13/gates.json:48`
  sha256 `69066121…`.
- `corpus/evidence/round-16/binding/r15-counter-identity.json:87` lists it in the round-15 C1
  countedInputs. `SKILL.md:1678`, `:1800`, `:1730`.
check-measurement-binding.mjs / selftest-measurement-binding.mjs:
- `corpus/evidence/round-16/measurement-binding.json:23-24` countedInputs (self-reference);
  `corpus/evidence/round-16/binding/check.json:7`, `selftest.json:2,11`, `legacy-r15.json:2-4`
  (`gatePath`, `gateSha256 5150611c…`, `selftestSha256 8c5426f2…`, pre-hardening).
- `corpus/evidence/round-16/measurements.json:32` at `3254740…`: `gateSha256 1f84fb54…`,
  `selftestSha256 481eefae…`; `corpus/lessons/round-16-verifier-spotcheck.md:67-68`.
- `SKILL.md:1840` registry row (argv only); `SCORECARD.md:754`; `corpus/QUALITY.md:80`;
  `LOG.md:971-972`.
All of these are receipts at their own revisions (or prose); no gate reads them back, so a round-17
byte change requires editing none of them. The only live constant pair to move is
`check-user-round-contract.mjs:32` + `:33-37`.

## 7. Remaining unknowns / inference

- Final round-gate bytes are not fixed yet (both C1 gates uncommitted at S1); the new CURRENT digest
  can only be computed at integration from the final worktree blob. [INFERENCE]
- If the round gate lands as more than one commit, every intermediate digest must be archived; the
  matrix row 4 shows the failure, but the actual number of commits is GateRoundAnchor's choice. [INFERENCE]
- Not reproduced: `--witness 75e7836b…` and `--count-witness bebe2ef…` arms after a `:32` update.
  Their checks read only forked historical blobs (`:798`, `:867`), which `:32` does not touch. [INFERENCE]

Files written:
- `.ufo/waves/round-17/w1/ReconIdentityChain.md`
