VERDICT: ISSUES

# RevAuditSites — JjAuditTabi live-site table vs master 5859243

Target: master `5859243` (`git rev-parse --short HEAD`). All row evidence was read through
`git show HEAD:<file>`, so the concurrent working-tree edits noted in Gap 2 cannot affect it.
Audited artifact: `/home/vgpnk/Projects/shokunin/.ufo/waves/hyaku/jj-w1/reports/JjAuditTabi.md`
— site tables at `:207-286`, class counts at `:312-319`, shell-git table at `:297-301`, F6 at `:184-192`.

Method: every table row was extracted from `git show HEAD:<file>` (never the working tree) and
compared token-by-token by a scripted probe: 66/66 audited rows matched (0 drift in the gate tables).
Tooling: nothing installed or upgraded (no pacman/uv/npx transaction); no `jj`, no git write command
and no sandbox mutation was run — the only executed lane command was the read-only
`node scripts/check-freshness.mjs --witness HEAD` cited under F6.

## What holds (PASS components)

- **R1 = 12 rows, all line-exact at 5859243.** `check-round-contract.mjs` 119, 231, 232, 504;
  `check-user-round-contract.mjs` 167, 237, 255, 308, 309, 325, 327, 529. Every command string,
  class (D) and risk mark matches the emitted argv (`git show HEAD:... | sed -n Np` per row).
- **R2 = 4 rows, all line-exact.** `check-round-contract.mjs:1007` prints `code_revision=` at
  `:1009`; `check-user-round-contract.mjs:790/874/955` print `codeRevision=` at `:829/:928/:1065`.
- **Class counts recompute exactly** (`JjAuditTabi.md:314-319`): B=25 (freshness 4, round 9, user 12),
  D=41 (freshness 7, round 14, user 20, +3 slices), and the 41 D split 12 R1 / 4 R2 / 7 F / 18
  explicit-revision is arithmetic-correct.
- **Shell-git surface exact.** Exactly three `slices.json` files contain git at HEAD
  (`git grep -l '"command".*git ' HEAD -- 'corpus/evidence/*/slices.json'` → r01, r02, r04) and the
  cited lines (`r01:115`, `r02:108`, `r04:128`) carry the quoted `git rev-parse HEAD:<path>` commands.
- **F6 substantively holds** (see drift F-A): freshness accepts a non-hex witness and prints it
  verbatim; the sibling gates enforce hex. Reproduced read-only:
  `node scripts/check-freshness.mjs --witness HEAD | tail -1` →
  `FRESHNESS_GATE verdict=clean ... revision=HEAD ...`; hex gates at round `:211` and user `:291/:295`.

## Findings

### F-A (minor, drifted citation) — F6 points at `check-freshness.mjs:51`; the behavior is at `:49`

`JjAuditTabi.md:186` says "`scripts/check-freshness.mjs:51` accepts `--witness <anything>`
(only a leading `--` is refused)". At HEAD (and at the audit's own sandbox tip e38d259) line 51 is
the loop close `}`; the lenient acceptance is `:49`
(`... && !args[i + 1].startsWith('--') ... options[flag.slice(2)] = args[++i]`).
Substance is unaffected — `HEAD` passes that guard — but the pointer is off by 2.
Evidence: `git show HEAD:scripts/check-freshness.mjs | sed -n '44,54p'`.

### F-B (major, missed live HEAD read, as assigned) — `check-measurement-binding.mjs:833`

At HEAD: `atRev = resolveCommit(repo, options.at ?? 'HEAD', '--at')`
(`git show HEAD:scripts/check-measurement-binding.mjs | sed -n 833p`). `resolveCommit` is
`git rev-parse --verify --end-of-options <rev>^{commit}` (`:232`). The resolved `atRev` then drives
every committed-state read — ancestry `:469`, counter blob `:485`, `diff --name-only :505`, worktree
blob `:521`, arm selection `:538`, legacy `:620` — and is emitted as `at` in the receipt
(`:659`, `:843`). Under jj detached HEAD this is exactly R1 + R2: the gate evaluates and receipts a
detached, possibly empty/unpushed commit.

Why the audit missed it: its inventory (`JjAuditTabi.md:24-35`) lists ten `scripts/*.mjs` files.
That list is e38d259's tree verbatim (`git ls-tree --name-only e38d259 scripts/` → the same ten),
while HEAD has 13; round-16 added `check-measurement-binding.mjs`, `selftest-measurement-binding.mjs`,
`webmcp-loopback-round16.mjs` in `8f7feb3`. The audit's own scope sentence includes "the gates named
in `SKILL.md`", and `git show HEAD:SKILL.md | sed -n 1840p` registers
`measurement-binding` with `node scripts/check-measurement-binding.mjs`. The sandbox clones at
`master e38d259` (F1/F2) confirm the straddle: tables read at 5859243, inventory taken at e38d259.

Census correction for the missing files (HEAD):
- `check-measurement-binding.mjs`: 8 invocation sites (`:199` transport, `:232`, `:242`, `:268`,
  `:283`, `:300`, `:308`, `:323`); one live HEAD default at `:833` (R1/R2 above); rest explicit-rev.
- `selftest-measurement-binding.mjs`: fixture-only git writes/reads — `:61` add, `:62` commit,
  `:63` rev-parse HEAD, `:120` init, `:226` rev-parse tree, `:227` commit-tree, `:377` update-ref.
- `webmcp-loopback-round16.mjs`: 0 git invocations.

### F-C (major, R1 census incomplete) — 35 production HEAD-resolution call sites are not in the R1 table

The 12 R1 rows are correct as a list of git argv sites, but the audit classifies helper *definitions*
(round `:71`/`:77`/`:89`, user `:127`/`:133`/`:139`) and marks their "jj-safe replacement" as
`unchanged`. Those helpers are the vehicle for literal `'HEAD'` at call sites that are absent from the
table, so applying the table verbatim leaves them resolving a jj-detached HEAD:

- `check-round-contract.mjs` (16, all in production functions `checkShonen`, `censusEntries`,
  `roundIds`, `checkSwarm`, `checkReport`, `scanConsequential`, `sameTree`, `checkPublic`, `check`):
  `:170 :173 :177 :266 :466 :487 :500 :517 :520 :538 :540 :548 :565 :584 :585 :587`.
- `check-user-round-contract.mjs` (19, in `acceptedRoundScript`, `lessonDrift`, `pstackDrift`,
  `roundIds`, `checkSpec`, `checkSwarm`, `checkReport`, `scanConsequential`, `sameTree`,
  `checkPublic`, `check`): `:230 :252 :254 :262 :338 :443 :474 :493 :512 :525 :539 :541 :559 :561
  :569 :586 :607 :608 :610`.

Machine map: `'HEAD'` literal occurrences at HEAD = 24 (round) + 31 (user); after excluding the HTTP
method comparisons and fixture roots, 35 production call sites remain unflagged. F3 (`:126-135`)
acknowledges the *mechanism* and cites the witness `headBlob` reads (`user:794/878/953`), but the
recorded remediation would not fix the 35. Note the class-D count is unaffected: these are calls *into*
rows 71/77/89, not additional git spawns.

### F-D (minor) — `check-user-round-contract.mjs:1268` live-root read inside `selfTest`

`const committedScorecard = show(defaultRoot, 'HEAD', 'SCORECARD.md')` — `defaultRoot` is the live
lane, so `--self-test` reads the jj-owned HEAD rather than a fixture. Unflagged in the table; no R mark.

## Residual risk and verification gaps

1. **Not reproduced:** F1/F2/F3's jj sandbox runs (clean-gate-on-detached-HEAD, `revision=HEAD`,
   `committed` false positive). Out of this assignment's scope; they remain audit-authored claims
   backed by its own transcripts, not re-executed here. Unrun ⇒ not asserted.
2. **Line numbers are HEAD-anchored, and the worktree is moving.** Another seat is landing a
   `laneTip` refactor in place. Snapshot at 2026-10-20 12:51:38 -0300, HEAD still `5859243`:
   `git diff --numstat HEAD -- scripts/` →
   `check-measurement-binding.mjs 45/2`, `check-round-contract.mjs 120/52`,
   `check-user-round-contract.mjs 82/36`, `selftest-measurement-binding.mjs 36/0`.
   At that instant `resolveCommit(... 'HEAD')` had moved `833 → 874` behind an uncommitted
   `laneTip` helper. Re-running this review against the worktree will report false drift unless
   pinned to `5859243`.
3. **Audit lineage straddle** (inventory pre-round-16, tables post-round-16) is inferred from commit
   dates (`e38d259` 10:28:30) and the F5 index probe at 11:15-11:16; the audit records no revision id.
   Recommend every future audit print `git rev-parse HEAD` in its header.
4. F6's parenthetical "no option injection is possible" is slightly strong: single-dash tokens (e.g.
   `-p`) pass the `startsWith('--')` guard. They make `git show -s --format=%ct` non-numeric and fail
   closed at `:66` (`Unreadable witness instant`), so no revision substitution was found; noted only
   because the cited line also moved.

## Files written

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-17/w1/RevAuditSites.md`
