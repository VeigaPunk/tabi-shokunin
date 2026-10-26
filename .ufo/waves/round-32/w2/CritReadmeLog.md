# CritReadmeLog — round-32 w2 — falsify the README/LOG round-32 blocks

Attacked revision: `b234a58920134424e0d104f137311ff54a16d26b` (wave-1 integration). Freeze: `4181fffb`; baseline
`d805d1d6`. Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Everything below was read at `b234a58` unless a
command names another revision. Axes attacked: (1) count→command binding, (2) path/ledger hash resolvability,
(3) README frontier rows vs the entry, (4) the `LOG.md:2072` correction's truth, (5) presence of the claim's
after-measurement. The standards applied: `CORPUS.md:34` ("A count carries its command … written as
`<number> — <command> <date>`"), `AXES.md` §The stagnation nudge, `QUALITY.md:495-527` (83–86), and the frozen
`claims.json` `measurementRule` ("A counter not run is a claim not verified").

## Verdict (one paragraph)

Four of the five sub-questions hold: every ledger hash and frozen digest resolves and is byte-correct; every cited
path exists at `b234a58` (the `baseline/…`, `round-30/claims.json` shorthands resolve against the wave/`.ufo/waves`
contexts the LOG names); the controls table reproduces from the committed receipts with every provenance carrying
clone commit + tree digest; and the `LOG.md:2072` correction is **true** under `AXES.md` (all six axes at or above the
saturation line 8 at round 31's start, no capability entered in rounds 28–30, last capability rows round 25). The
blocks do **not** hold on five points: the LOG's two "After:" readings and its "round-32 disposition below" point at
a disposition block that does not exist at `b234a58` and no post-change counter output is committed under
`measure/`, so the README's "run and admitted"/"measured and admitted" frontier assertions have no after-reading at
REV (F1, medium); the README's "v3's CASES table holds 41 isolated scenarios" is false (the table holds 39; the
printed 41 = 39 + two refusal cases appended in `runSelftest`) (F2, low); the LOG's "claimed 17/22/30" omits two of
the fifteen claims the counter reports (13 and 20) and its "induced by v3's 11 added cases" cannot cover the eight
claims below the 30-case v2 oracle (F3, low); the README frontier restatement's "three contracts the matrix names"
swaps the entry's/matrix's `insertText` for wire-truth parity (F4, low); and the LOG's "16 admittable predicates …
held before the freeze" has no committed command output anywhere at REV (F5, low).

## Findings

### F1 — medium — the LOG's after-readings and the README's admission assertion have no committed measurement at REV

Evidence:
- `LOG.md:2181` and `LOG.md:2185` (the C1 and C2 counting commands) both read
  `After: the round-32 disposition at the end of this entry.`; `LOG.md:2214` reads
  `Verdicts: sixteen rows observed and admitted at the measured revision (round-32 disposition below)`.
  No such block exists: `git show b234a58:LOG.md | wc -l` → `2226`, the last five lines (2222–2226) are the
  `LOG.md:2072` correction, and within the round-32 entry (`LOG.md:2122-2226`) `disposition` occurs only at 2181 and
  2185 (the two `After:` pointers), 2196 ("dispositioned by wave-1 scribes") and 2214 (the "disposition below"
  pointer); the phrase "disposition at the end of this entry" occurs in no other round's LOG entry.
- `.ufo/waves/round-32/measure/` at `b234a58` holds exactly four blobs — `c1-distinct.mjs`,
  `c1-distinct-red-green.txt`, `c1-socket-path-red-green.txt`, `c2-refusal-mutant.txt`
  (`git ls-tree -r --name-only b234a58 .ufo/waves/round-32/measure/`). `git grep -l 'admitted' b234a58 --
  '.ufo/waves/round-32/measure'` → **exit 1, no output**: no post-change counter reading is committed. The driver
  `.ufo/waves/round-32/measure.sh:22,24,25` would write `c1-live-at-$short.json`, `c2-at-$short.json` and
  `c2-numstat-at-$short.txt`; none of those blobs exists at REV.
- The only committed live `admitted: 16` JSON is `.ufo/waves/round-32/w1/ExecDriver/live.json`, and its `rev` is
  `c8ec438690e641cb044e7eff1dc8423d0b7530cc` — `git cat-file -t c8ec4386…` → `fatal: git cat-file: could not get
  object info` (exit 128), `git merge-base --is-ancestor c8ec4386… b234a58` → exit 1. So the LOG's unnamed "measured
  revision" cannot be resolved, and the claims' `measurementRule` (after-measurement in a clean checkout of the
  named lane revision, raw output under `measure/` before the report) is unmet.
- The assertion this leaves unsupported is written twice in the README: `corpus/README.md:716` ("R1–R15 and R17 …
  run and admitted") and `corpus/README.md:735` ("R1–R15 and R17 measured and admitted"). `corpus/README.md:745` also
  depends on `41/41`, which is fine, but the admission itself has no after-reading.
- Also note the counts the LOG *does* state are the pre-freeze ones (`baseline/c1-J1-do-nothing.json` population 0,
  `baseline/c2-J1-do-nothing.json` mismatches 18) — the "before" half is committed, the "after" half is a pointer.

Smallest safe correction (append-only): append a `## Round 32 — executed disposition` block to `LOG.md` after line
2226 stating the counter's after-reading per claim (population / admitted / failing and mismatches / m4 / deleted
lines, with the `jq` shape the counting commands name) and the measured revision's full SHA, and commit
`measure.sh`'s `provenance-*.txt`, `c1-live-at-*.json`, `c1-offline-at-*.json`, `c2-at-*.json`,
`c2-numstat-at-*.txt` under `.ufo/waves/round-32/measure/`. If the disposition is produced by wave-2 integration,
the appended block is still the correction: the pointers at 2181/2185/2214 then resolve, and `README.md:716`/`:735`
gain the reading they assert. No earlier line need change.

### F2 — low — `corpus/README.md:745`: "v3's CASES table holds 41 isolated scenarios" is false

Evidence: the constant `CASES` in the frozen v3 holds **39** cases, and the selftest's 41 comes from two extra
refusal cases appended in `runSelftest`, not from the table:
- `git show b234a58:scripts/check-selfassessment.mjs | grep -cE '^\s{4}id: "'` → `39`; the block delimited by `const CASES = [` and its matching `]` contains `39` `build:` entries and `39`
  line-start ids (47 `id: "` strings total — the rest are inline in build bodies).
- `grep -c 'results.push('` on the same script → `2` (one in the `for (const c of CASES)` loop, one in the
  two-item `refusal-bad-rev-syntax` / `refusal-unresolvable-rev` block). 39 + 2 = 41.
- `node scripts/check-selfassessment.mjs --selftest` → `SELFASSESSMENT_SELFTEST verdict=clean cases=41 passed=41`,
  exit 0 — the tally is right; only the attribution "CASES table holds 41" is wrong. (The script's own header
  comment says "41 isolated cases"; that is the run count, not the table count.)

Smallest safe correction: append a bullet under `## Round 32 — corrections` in `corpus/README.md` stating the table
holds 39 and that the gate's 41 = 39 table cases + `refusal-bad-rev-syntax` and `refusal-unresolvable-rev` appended in
`runSelftest`; the `41/41` figure at `:745` stands.

### F3 — low — `LOG.md:2171-2173`: the m1 claim set is mis-enumerated and the causal clause does not follow

Evidence (rerun of the frozen v3 at the freeze, `.ufo/waves/round-32/w2/CritReadmeLog/c2-freeze.json`):
`mismatches 18`, `{m1-selftest-tally: 15, m4-nudge-state: 3}`. The 15 m1 claims are
`17, 22, 22, 30, 13, 17, 20, 22, 30, 30, 30, 30, 30, 17, 30` (in counter order) — distinct set **{13, 17, 20, 22, 30}**, not "17/22/30":
- `SKILL.md:2479` claims `(cases=13, passed=13)`;
- `SKILL.md:2530` claims `20 cases in CASES`;
- the other 13 claims are 17 (`SCORECARD.md:1439`, `SKILL.md:2515`, `corpus/README.md:613`), 22
  (`SCORECARD.md:1465`, `SCORECARD.md:1486`, `SKILL.md:2545`) and 30 (`SCORECARD.md:1564`, `SKILL.md:2576`, `:2578`,
  `:2590`, `:2594`, `:2598`, `corpus/README.md:668`).
Also, "the 15 induced by v3's 11 added cases, 30 → 41" cannot be literally true: 8 of the 15 claim a figure **below**
the v2 oracle of 30, so those tallies were already stale against v2 and are not produced by the 30 → 41 move; v3
counts them against the 41-case oracle.

Smallest safe correction: append a correction paragraph to the LOG (after 2226) naming the distinct claim set
`{13, 17, 20, 22, 30}` with `SKILL.md:2479` and `SKILL.md:2530` cited, and requalify the causal clause as "counted against the
41-case oracle" or drop it; the 15 and the line list at `:2171-2172` are correct.

### F4 — low — `corpus/README.md:725-729`: the "three contracts" set contradicts the entry and the matrix

Evidence: `corpus/README.md:725-729` says "The three contracts the matrix names as unmatched remain unmatched: no
wire-truth parity …, no columnar `DOMSnapshot` shape …, no history-entry list". But
- the entry it restates names the three load-bearing contracts as DOMSnapshot's columnar shape, the history-entry
  list and `insertText` (`corpus/knowledge/webdriver-bidi-runtime-round-32.md:149-151`);
- the matrix's own "Rejected" bullet names the same three ("at least three load-bearing contracts … DOMSnapshot's
  columnar shape, `getNavigationHistory`'s entry list, and `insertText`", `corpus/knowledge/webdriver-bidi-capability-matrix.md:100-102`);
- wire-truth parity is a *fourth* §3 gap ("DOMSnapshot's columnar shape, the history-entry list, `Input.insertText`,
  or CDP's raw `ExtraInfo` header block", `webdriver-bidi-capability-matrix.md:84-86`), and the README frontier row
  at `:735` itself lists `insertText` as unmatched.
So the restatement's three-member set matches neither the entry nor the matrix, and `insertText` is dropped from the
"three" only to reappear one row later.

Smallest safe correction: append a bullet under `## Round 32 — corrections` in `corpus/README.md` stating the three
load-bearing contracts are DOMSnapshot's columnar shape, the history-entry list and `insertText` (matrix
`Rejected`), and that wire-truth parity (`ExtraInfo` raw header block, byte-exact status line) is a fourth §3 gap as
the frontier row at `:735` already lists it; cite `corpus/README.md:725-729`.

### F5 — low — `LOG.md:2165-2166`: "the 16 admittable predicates the counter's own live leg held before the freeze" has no committed command output

Evidence: `git grep -n '16 of the 16' b234a58 -- .ufo/waves/round-32` returns only `claims.json:39` — the same
statement, with no artifact pointer. The only committed `liveRecord` output is
`.ufo/waves/round-32/measure/c1-socket-path-red-green.txt:4-5`, which records `ok cmds=28` at `5ad1fcbf`, not a
16/16 predicate tally, and no blob under `measure/` contains `admitted` (F1 run). The 16/16 does exist later as a
wave-1 run (`w1/ExecDriver/live.json`, rev `c8ec4386…`, unresolvable — F1), but that is not the pre-freeze leg the
LOG names. The target (14) does not depend on this number: `c1-J3-forgery-offline` admits 16 offline, exit 0, and the
gate offline at `b234a58` admits 16 (command below).

Smallest safe correction: append a correction to the LOG (after 2226) either citing the pre-freeze artifact if one can
be produced, or marking the figure `[INFERENCE]`/unrecorded and keeping the target at `admitted >= 14`.

## Holds (verified, with the command and exit code)

1. **Ledger hashes resolve.** `git cat-file -t` on `d805d1d613…`, `2f8535c5b3…`, `5ad1fcbfba…`, `4181fffb4e…`,
   `b234a58920…` → `commit` ×5, exit 0 each. The LOG's commit roles match the commits (`2f8535c5` = both counters +
   `SKILL.md` registry rows — no `SOURCES.md` change, which is consistent because "registry rows" in that message are
   the `SKILL.md` §Round-32 registry table, `git show --stat 2f8535c5` → `SKILL.md | 17 +`, two scripts).
2. **Frozen digests are byte-correct at every named revision.** `git show 4181fffb:scripts/check-bidi-runtime.mjs |
   sha256sum` → `2f25af5a3c6326b9295f7fb191c3b76334dbb23a3403d39755d9e9ee3516c393`;
   `…:scripts/check-selfassessment.mjs` → `77b5c8ed503bd9bc93e8ef634a10627613672eaa39bca84cf7339d37b6d4c6a9`;
   identical at `5ad1fcbf` and `b234a58`. `.ufo/waves/round-32/baseline/frozen-counter-sha256.txt` carries exactly
   these two lines.
3. **The freeze-diff claim holds.** `git diff --name-only 5ad1fcbf 4181fffb | grep -vc '^\.ufo/'` → `0` (exit 1 for
   no match): only `.ufo/waves/round-32/**` changed, so both "scripts diff empty" and "no document changed either".
4. **Controls reproduce.** The eight `baseline/c*.json` readings match the LOG table exactly (J1 0/0/`e1-entry-absent`;
   J2 16/0/16 `s1-source-row`; J3-offline 16/16 `live:false`; J3-live 16/0/16 `t3-binding` with detail "first
   screenshot differs from this counter's live session"; J4 16/0/16 `t1-receipt` with detail "driver absent, is this
   counter, or its sha256 differs"; c2-J1 18; c2-J2 15 with numstat `3 3 SCORECARD.md`; c2-J3 18), and every
   `<control>.provenance` carries `freeze=5ad1fcbf…`, a `clone_head`, a `clone_tree` and the exit in the table
   (1,1,0,1,1,1,1,1).
5. **Self-tests at the frozen bytes.** `node scripts/check-bidi-runtime.mjs --selftest` →
   `BIDI_RUNTIME_SELFTEST verdict=clean cases=27 passed=27`, exit 0;
   `node scripts/check-selfassessment.mjs --selftest` → `SELFASSESSMENT_SELFTEST verdict=clean cases=41 passed=41`,
   exit 0.
6. **C2 before/after.** `--rev 4181fffb --json` → `mismatches 18` = 3 `m4-nudge-state` at `SCORECARD.md:1473,1515,1576`
   + 15 `m1-selftest-tally` at exactly the 15 lines the LOG lists, exit 1. `--rev b234a58 --json` → `mismatches 0`,
   `counted 0`, exit 0. `git diff --numstat 4181fffb b234a58 -- SKILL.md corpus/README.md SCORECARD.md LOG.md` →
   `106/0`, `62/0`, `135/0`, `41/0` (0 deletions), matching the target.
7. **Counting commands in `corpus/README.md:737-739`.**
   `git ls-tree --name-only 4181fffb corpus/knowledge/ | grep -c '\.md$'` → `50`;
   `ls corpus/knowledge/*.md | wc -l` → `51` at `b234a58`. `corpus/README.md:745`'s `41/41` reproduces.
8. **Frontier rows match the entry's substance.** Matrix §2 has exactly 17 rows at `:60-76`; entry §2 has R1–R17 in
   that order with matching surfaces; R16 is `no — no BiDi command` in both the entry (`:82`) and the matrix
   addendum (`:213`), and the README row's five unmatched items (wire-truth parity, DOMSnapshot columns, history-entry
   list, `insertText`, retroactive body retrieval) match entry §3 rows R11/R5/R14/R9/R12. Matrix addendum date
   `2026-10-26` exists (`:168`); the `locally measured: no` bytes are intact (`:56`, every row's last cell).
9. **All cited paths exist at `b234a58`.** Token sweep over the two blocks (`corpus/README.md:707-746`,
   `LOG.md:2122-2226`) resolved every path token: `corpus/knowledge/webdriver-bidi-runtime-round-32.md`,
   `corpus/evidence/round-32/bidi/receipt.json` (schema `tabi-bidi-receipt-v1`; `runs` = run1/run2),
   `webdriver-bidi-capability-matrix.md`, `scripts/check-bidi-runtime.mjs`, `scripts/check-selfassessment.mjs`,
   `scripts/bidi-loopback-round32.mjs`, `.ufo/waves/round-32/{claims.json,baseline/,measure/,w1/swarm-registry.json,w1-spec.json}`,
   `corpus/lessons/round-32.md`, `.ufo/waves/round-{29,30,31}/claims.json`, and the `merge/tabi/`,
   `considerthese/` references are declared absences ("is not read", "no … dir exists"), not paths.
   The `baseline/…` and `round-30/claims.json` shorthands resolve against the wave dir / `.ufo/waves` the LOG names
   two lines earlier (`LOG.md:2140` names `.ufo/waves/round-32/baseline/`).
10. **Receipt facts.** `sha256sum` of `corpus/evidence/round-32/bidi/run1|run2/transcript.jsonl` →
    `8aa97463…aaf851` and `9918a716…c7169d7`, equal to the receipt's `transcriptSha256` values; `fixtureSha256`
    `343cbcedd56f6fb1914d529119fadfd69cd7901ed919c6e1ae84d213bc112843` equals the gate's exported `FIXTURE_SHA256`
    (offline run at REV prints the same), matching `LOG.md:2164`. `chromedriver --version` →
    `ChromeDriver 154.0.8037.97 (b510e9d7cd3a2fbd78d0ddc42234103206c5f78d-refs/branch-heads/8037@{#1673})` and
    `chromium --version` → `Chromium 154.0.8037.97 Arch Linux`; the chromedriver string is byte-equal to
    `LOG.md:2161` and both versions match the claim at `LOG.md:2161-2162`.
11. **Registry 122 → 126.** Row counts (`grep -cE '^\| S[0-9]+ '` on `corpus/SOURCES.md`): `d805d1d6` 122, `2f8535c5`
    122, `4181fffb` 122, `b234a58` 126. `baseline/census-start.txt` ends `ok … exit=0`; S123–S126 each carry
    `opened 2026-10-26`, matching the README "all opened 2026-10-26" (`:716`) and `LOG.md:2187`.
12. **Wave counts.** `.ufo/waves/round-32/w1/swarm-registry.json` → 36 members, roles
    `scribe 12, executor 8, critic 5, reviewer 3, connector 3, scout 2, mutation-tester 2, sentinel 1`;
    `w1-spec.json` → 36 items. Exactly `LOG.md:2204-2206`.
13. **The `LOG.md:2072` correction is TRUE.** `LOG.md:2072` reads "… C2 works calibration (a lane axis); nudge
    inactive; no axis retired." `AXES.md` §The stagnation nudge (lines 66-73): the waiver needs every axis **at or
    above** the saturation line and no capability within the window. Round 31's own frozen inputs:
    `.ufo/waves/round-31/claims.json:10` `{depth 8, coverage 9, operability 9, freshness 9, calibration 9, adjacency 8}`
    and `Saturation 8 / window 3`; capability rows exist only through round 25
    (`SCORECARD.md:1306`, `:1314` are the last `First-working round:` lines; rounds 28–30 have none), so `AXES.md`
    derives **active**, and the correction's six axis values and "no capability entered in rounds 28–30" are correct.
    The correction's second claim also holds: `round-29/claims.json:11`, `round-30/claims.json:11`,
    `round-31/claims.json:11` each carry a `nudge inactive` statement, and each file's last commit is its freeze
    commit (`97be89b`, `061e620`, `9505a10`) — not edited since.

## Commands and exit codes (all run by this seat)

Workdir `/fast/scratch/hyaku/tabi-r32/CritReadmeLog/clone`, one `--shared` clone of the lane detached at `b234a58`
(`git status --porcelain` empty), `TMPDIR=/fast/scratch/hyaku/tabi-r32/CritReadmeLog/tmp`.

```
$ git rev-parse HEAD                                     # b234a58920134424e0d104f137311ff54a16d26b (0)
$ git cat-file -t <d805d1d6|2f8535c5|5ad1fcbf|4181fffb|b234a58>   # commit ×5 (0)
$ git show 4181fffb:scripts/check-bidi-runtime.mjs | sha256sum    # 2f25af5a…c393 (0)
$ git show 4181fffb:scripts/check-selfassessment.mjs | sha256sum  # 77b5c8ed…c6a9 (0)
$ git show 5ad1fcbf:scripts/check-{bidi-runtime,selfassessment}.mjs | sha256sum  # same (0)
$ git diff --name-only 5ad1fcbf 4181fffb | grep -vc '^\.ufo/'     # 0 lines (1: no match)
$ node scripts/check-bidi-runtime.mjs --selftest                  # clean cases=27 passed=27 (0)
$ node scripts/check-selfassessment.mjs --selftest                # clean cases=41 passed=41 (0)
$ node scripts/check-selfassessment.mjs --rev 4181fffb --json     # mismatches 18, 3 m4 + 15 m1 (1)
$ node scripts/check-selfassessment.mjs --rev b234a58 --json      # mismatches 0 counted 0 (0)
$ node scripts/check-bidi-runtime.mjs --rev b234a58 --baseline d805d1d6 \
    --entry corpus/knowledge/webdriver-bidi-runtime-round-32.md --json
    # population 16 admitted 16 failing 0 live false fixtureSha256 343cbced…2843 (0)
$ git ls-tree --name-only 4181fffb corpus/knowledge/ | grep -c '\.md$'  # 50 (0)
$ ls corpus/knowledge/*.md | wc -l                                # 51 (0)
$ git show b234a58:scripts/check-selfassessment.mjs | grep -cE '^\s{4}id: "'   # 39 (0)
$ git show b234a58:scripts/check-selfassessment.mjs | grep -c 'results.push('  # 2 (0)
$ git grep -l 'admitted' b234a58 -- '.ufo/waves/round-32/measure' # no output (1)
$ git ls-tree -r --name-only b234a58 .ufo/waves/round-32/measure/  # 4 blobs (0)
$ git cat-file -t c8ec438690e641cb044e7eff1dc8423d0b7530cc        # fatal: could not get object info (128)
$ git merge-base --is-ancestor c8ec4386… b234a58                  # false (1)
$ git show b234a58:LOG.md | wc -l                                 # 2226 (0)
$ git log --oneline -1 -- .ufo/waves/round-{29,30,31}/claims.json  # freeze commits (0)
$ sha256sum corpus/evidence/round-32/bidi/run{1,2}/transcript.jsonl  # matches receipt (0)
$ chromedriver --version; chromium --version                       # 154.0.8037.97 both (0)
$ python3 (control receipts + provenance dump)                     # matches LOG table (0)
$ python3 (w1 registry/spec counts)                                # 36 / 36, roles 12/8/5/3/3/2/2/1 (0)
```

Raw counter outputs are copied into `.ufo/waves/round-32/w2/CritReadmeLog/`: `c2-freeze.json` (18 mismatches), `c2-head.json` (0),
`c1-offline.json` (population 16, admitted 16). No browser was started, no network fetch was made, no tool was
installed, and no lane file, index, or jj state was touched. The scratch clone and `$HYAKU_SCRATCH/tabi-r32/CritReadmeLog`
are removed at yield; `pgrep -fa 'chromedriver|chromium'` lines owned by this seat: none.

## Lane-state note (not evidence)

While this seat was reading, and after this report was written, a concurrent writer modified eight tracked lane files
(mtimes 2026-10-26 14:28:27–14:28:58 -03; `git diff --stat` at yield: `LOG.md 4 +`, `SCORECARD.md 29 +`, `SKILL.md 8 +`,
`corpus/README.md 11 +`, `corpus/SOURCES.md 1 +/1 -`, the matrix `10 +`, the entry `19 +`, the lesson `41 +`). This seat
wrote none of them. Every citation above was then re-verified against `git show b234a58:<path>` and matches the attacked
revision exactly (`LOG.md:2072,2140,2165,2181,2185,2187,2204,2214,2222,2226`; `corpus/README.md:716,725,735,737,745`;
`SCORECARD.md:1306,1314`; `SKILL.md:2479,2530`; matrix `:56,84,100,168,213`; entry `:82,149,151`). The in-flight
`LOG.md` append is a "Round-32 disposition" (+4 lines) whose readings are absent from the attacked revision and whose
pointer is still `.ufo/waves/round-32/measure/` — a directory that at yield still holds only the four pre-existing
blobs. The worktree is not used as evidence; F1 is a statement about `b234a58`.
