# ScribeLog — round-32 LOG.md entry skeleton (w1, frontier)

**Verdict:** The round-32 `LOG.md` entry skeleton is written and grounded entirely in frozen artefacts — the claims
file, the freeze commits, the control readings under `.ufo/waves/round-32/baseline/`, the frozen counter digests and
the wave registry — in the house format of the last two entries (`LOG.md:1989-2062` round 29, `:2063-2120` round 31):
freeze provenance, axes at round start with the nudge ACTIVE, the eight control readings, both claims with their
before/target/kill rules, the counting commands, the frontier step, the wave composition, the freshness
re-verification line and the commit ledger. Exactly three placeholders exist, all of them after-measurements
(C1 live reading at REV, C2 reading at REV, re-verification verdicts at REV). Nothing was measured, no lane file was
edited, no browser was started, no scratch tree was created.

## What the skeleton asserts, and where each assertion comes from

| Section | Facts | Source |
|---|---|---|
| freeze provenance | baseline `d805d1d6`, counters `2f8535c5`, claims/controls `4181fffb`, pre-freeze fix `5ad1fcbf` and why (chromium singleton socket > 108-byte unix-socket limit under a deep TMPDIR) | `claims.json` (`counterCommits`, `baseline`), `baseline/README-receipts.md` |
| frozen digests | `2f25af5a…6c393` (bidi runtime), `77b5c8ed…6c6a9` (selfassessment v3) | `baseline/frozen-counter-sha256.txt`, re-hashed this round from the freeze tree |
| axes / nudge | depth 9, coverage 9, operability 9, freshness 9, calibration 9, adjacency 8; saturation 8, window 3; nudge ACTIVE; lowest-axis obligation waived | `claims.json` (`axisScoresAtRoundStart`, `lowestNonRetiredAxis`); `SCORECARD.md:430` (saturation 8 / window 3), `:1249,1306,1314` (`First-working round: 25`) |
| controls table | 8 rows: J1 0/0 exit 1; J2 pop 16 adm 0 `s1-source-row` exit 1; J3-offline 16/16 exit 0; J3-live 0 `t3-binding` exit 1; J4 0 `t1-receipt` exit 1; C2 J1 18 (3 m4 + 15 m1) exit 1; J2 15 mismatches + 3/3 deleted `SCORECARD.md` exit 1; J3 18 exit 1 | `baseline/README-receipts.md`, the eight `baseline/c*-J*.json`, `c2-J2-delete-words.numstat`, `*.provenance` |
| self-tests / census | bidi `cases=27 passed=27` exit 0; selfassessment `cases=41 passed=41` exit 0; census `ok` exit 0, 122 rows | `baseline/c1-counter-selftest.txt`, `c2-counter-selftest.txt`, `census-start.txt` |
| C1 | entry path, `\| Row \| Surface \| BiDi method \| Measured \| Evidence \|`, R1–R17 = matrix §2 order, R16 no BiDi command, chromedriver/chromium 154.0.8037.97, `webSocketUrl: true`, loopback, receipt `corpus/evidence/round-32/bidi/receipt.json`, schema `tabi-bidi-receipt-v1`, fixture sha `343cbced…2843`, target >= 14 / failing 0 | `claims.json` C1, `c1-J1-do-nothing.json` (`fixtureSha256`), `chromedriver --version` / `chromium --version` run this round |
| C2 | m4 class + failed-summary refusal; 18 = 3 m4 (`SCORECARD.md:1473,1515,1576`) + 15 m1 (4 SCORECARD, 9 SKILL, 2 README); claimed 17/22/30 vs observed 41; target 0 / 0 / 0 deleted | `claims.json` C2 (`beforeItems`, `beforeComposition`), `c2-J1-do-nothing.json`, `sed -n '1473p;1515p;1576p' SCORECARD.md` |
| frontier step | S123–S126 (122 → 126), S123 supersedes S119 on the RFC 9309 header date, lesson `corpus/lessons/round-32.md` with Gate + Mistakes, mistake = stale-premise `nudge inactive`, routed defects 1–7 dispositions, assimilation none | `claims.json` (`frontierStep`, `priorClosure`, `notClaimed`, `assimilation`), `corpus/lessons/round-31-verifier-spotcheck.md` §Routed defects |
| waves | w1 36 seats: 12 scribe, 8 executor, 5 critic, 3 connector, 3 reviewer, 2 mutation-tester, 2 scout, 1 sentinel; w2 falsify; 64–128 total | `w1/swarm-registry.json`, `w1-spec.json`, `claims.json` `roundShape` |
| re-verification | matrix §2 (17 rows) entered at kaika fleet round-1, `LOG.md:492`, `locally measured: no` x17, `verified-at: 2026-10-19`; observed this round; R16 nothing to observe; S123 re-grounds S119 | `LOG.md:492`, matrix header, `claims.json` |

## Evidence (commands and exit codes)

Read-only git in the lane, no clone (no lane script was run, so the contract's one-clone rule had nothing to host):

```
$ git log --oneline -1 <4181fffb|2f8535c5|d805d1d6|5ad1fcbf>          # exit 0 — all four resolve
4181fff round-32: freeze claims C1 … and C2 …, controls and receipts before data
2f8535c round-32: freeze counters — check-bidi-runtime.mjs (C1) and check-selfassessment.mjs v3 (C2), registry rows
d805d1d round-31 verifier spot-check (integrator, hyaku): non-author admit/reject
5ad1fcb round-32: counter fix before freeze — chromium singleton-socket path overflow under a deep TMPDIR

$ git show 5ad1fcbf:scripts/check-bidi-runtime.mjs   | sha256sum
2f25af5a3c6326b9295f7fb191c3b76334dbb23a3403d39755d9e9ee3516c393  -      # == frozen-counter-sha256.txt
$ git show 5ad1fcbf:scripts/check-selfassessment.mjs | sha256sum
77b5c8ed503bd9bc93e8ef634a10627613672eaa39bca84cf7339d37b6d4c6a9  -      # == frozen-counter-sha256.txt
                                                              # exit 0

$ git diff --name-only 5ad1fcbf 4181fffb -- scripts/check-bidi-runtime.mjs scripts/check-selfassessment.mjs
                                                              # empty, exit 0 — no counter change after the fix
$ git diff --numstat  5ad1fcbf 4181fffb -- SKILL.md corpus/README.md SCORECARD.md LOG.md
                                                              # empty, exit 0

$ chromium --version
Chromium 154.0.8037.97 Arch Linux
$ chromedriver --version
ChromeDriver 154.0.8037.97 (b510e9d7cd3a2fbd78d0ddc42234103206c5f78d-refs/branch-heads/8037@{#1673})

$ grep -c '^| S[0-9]' corpus/SOURCES.md          # 122 — registry rows at the freeze
$ jq -r '.members|length' .ufo/waves/round-32/w1/swarm-registry.json    # 36
$ jq -r '.items|length'   .ufo/waves/round-32/w1-spec.json              # 36
$ jq -r '.members|to_entries|map(.value.role)|group_by(.)|map("\(.[0]) \(length)")|.[]' …   # connector 3, critic 5,
  executor 8, mutation-tester 2, reviewer 3, scout 2, scribe 12, sentinel 1

$ sed -n '1473p;1515p;1576p' SCORECARD.md   # the three m4 lines, all carrying `nudge inactive` (1473 wraps the word)
$ grep -n 'First-working round' SCORECARD.md | tail -3   # 1249:24, 1306:25, 1314:25 — last capability entry = 25

$ pgrep -fa 'chromedriver|chromium' | grep -v pgrep
1371 /usr/bin/earlyoom -r 3600 --avoid … --prefer (^|/)(java|node|chromium|python3?)$
```

The single `pgrep` line is earlyoom's own argv (a match pattern), not a process I started: no chromium and no
chromedriver was launched this round. `/fast/scratch/hyaku/tabi-r32/ScribeLog` does not exist — no scratch tree to
delete.

## Touched surfaces

- `.ufo/waves/round-32/w1/ScribeLog/log-entry.md` (new, 97 lines) — the skeleton.
- `.ufo/waves/round-32/w1/ScribeLog.md` (this report).
- Nothing else: no lane tracked file, no lane index, no fleet repo, no scratch.

## Out of scope (left to the L1 / other seats)

- Every after-measurement: C1 `--live` reading at REV, C2 reading at REV, re-verification verdicts — the three
  `<L1: …>` placeholders.
- Writing the entry into `LOG.md` (append-only, after `:2120`), the SOURCES rows S123–S126, `corpus/lessons/round-32.md`,
  the C1 entry and receipt, the C2 corrections, QUALITY numbering, SCORECARD round-32 block, wave/seat counts and the
  landing commit ledger.

## Findings and limits

1. **Counter-freeze commit vs frozen bytes.** `claims.json` names `2f8535c5` as the counter-freeze commit but the frozen
   digests are the `5ad1fcbf` bytes; the skeleton states this explicitly (the pre-freeze control failure, the
   TMPDIR-only fix, and that the controls were scored against the same tree). No discrepancy found: `5ad1fcbf` changes
   no counter byte after itself through the claims freeze.
2. **House-format "Waves" line carries report counts.** Round 29/30/31 entries name seats *and* reports; the report
   count is only knowable after the wave settles, so the skeleton names the dispatched composition from the registry
   and defers counts, dead seats and results to the round report — this is a ledger deferral, not an
   after-measurement placeholder.
3. **QUALITY numbers are not in the frozen claims**; the skeleton points at the `SCORECARD.md` round-32 block "as
   landed" rather than guessing numbers.
4. **`AXES.md` lives at the fleet root** (`/home/vgpnk/Projects/shokunin/AXES.md`), not in the lane; the nudge rule
   quoted in the entry is the fleet file's §The stagnation nudge, and saturation 8 / window 3 are the lane's own
   `SCORECARD.md:430` declarations — both read, neither edited.
5. **No tool install or upgrade** was needed; no pacman/uv/npx transaction was attempted.

Artifacts: `tabi-shokunin/.ufo/waves/round-32/w1/ScribeLog/log-entry.md`,
`tabi-shokunin/.ufo/waves/round-32/w1/ScribeLog.md`.
