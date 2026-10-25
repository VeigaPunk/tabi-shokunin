# Round 24 W2 — independent re-derivation of C1/C2/C3

Seat: `L1Tabi24.ExecReDerive` (leaf, read-only). Tip measured: `ad125e85c235e1c4ec6a08e398bd64da01f68a08`
(`git rev-parse HEAD` = same). Baseline: `573c99e4885382db38babc3a6fc90e77afeb42a6`.
`TMPDIR=/home/vgpnk/tmp-tabi24` (created; host `/tmp` untouched). No tool installed or upgraded —
none was needed (node + git present). Claims read from `.ufo/waves/round-24/claims.json`
(`revisions` block is **empty**: no post-freeze correction is recorded there).

## Verdict against the frozen claims

| Claim | Frozen target at tip | Re-derived at tip | Verdict |
|---|---|---|---|
| C1 operability | `nonconformant` = 0 | **0**, exit **0**, `clean: true` | **CONFIRMED** |
| C2 calibration | `mismatches` = 0 | **1**, exit **1**, `clean: false` | **FALSIFIED** |
| C3 coverage | 1 admitted entry citing S104/S105 | **1**, exit **0** | **CONFIRMED** (one prose defect) |

## Exact numbers, exit codes, could-not-evaluate

### C1 — `node scripts/check-gate-registry.mjs --rev ad125e8… --json`

| | tip `ad125e8` | baseline `573c99e` |
|---|---|---|
| exit | **0** | **1** |
| gates | **14** | **12** |
| rows parsed | **23** | **12** |
| `nonconformant` | **0** | **3** |
| `findings` | **0** | 3 × `e1-missing-row` (`check-adjacency`, `check-measurement-binding`, `round-evidence-audit`) |
| `skillBytes` | 228857 | — |
| `clean` | **true** | false |

`--selftest`: `GATE_REGISTRY_SELFTEST verdict=clean cases=22 passed=22`, exit **0**.
No could-not-evaluate in either production run.

10-revision sweep (`git log -10`, same command): the five pre-round-24 revisions
(`16fa92f9, 573c99e4, c90dffd3, b905efb5, e059a8f1`) each read `gates=12 nonconf=3 exit=1`
with only `e1-missing-row`; the five round-24 revisions (`f6f7f453, 2d769381, 9e52cb23,
b973fde3, ad125e85`) each read `gates=14 rows=23 nonconf=0 exit=0`. The transition is exactly
the commit that appends the registry section — no intermediate red/green ambiguity.

### C2 — `node scripts/check-selfassessment.mjs --rev ad125e8… --json` (`TMPDIR` set)

| | tip `ad125e8` | baseline `573c99e` |
|---|---|---|
| exit | **1** | **1** |
| `mismatches` | **1** | **5** |
| counted | `m3-unlanded-paths`, `observed: 5` | 4 × `m1-selftest-tally` (`:410` 25≠26; `:1138`, `:1139`, `:1151` 12≠13) + `m3-unlanded-paths observed: 5` |
| `couldNotEvaluate` | **79** | **75** |
| `superseded` | 5 | 0 |
| `clean` | **false** | false |

`--selftest`: `SELFASSESSMENT_SELFTEST verdict=clean cases=13 passed=13`, exit **0**.

Per-class coverage of that run (counted from `--json`):

| class | findings | evaluated | could-not-evaluate | superseded |
|---|---|---|---|---|
| m1-selftest-tally | 16 | 12 | 4 | 5 |
| m2-receipt-exit | 76 | **1** | **75** | 0 |
| m3-unlanded-paths | 1 | 1 | 0 | 0 |

The single counted mismatch is m3. Its 5 paths are exactly
`git status --porcelain --untracked-files=all`:
`.ufo/waves/round-24/gen-w2.mjs`, `w2-dispatch.err`, `w2-dispatch.json`, `w2-spec.json`,
`w2/swarm-registry.json` — all with mtime ≥ `2026-10-25 05:42:08`, i.e. **after** the tip
commit `2026-10-25T05:41:00-03:00`. No tracked file is modified.

### C3 — `git grep -lE '^source: S10[45] ' ad125e8… -- corpus/knowledge | wc -l`

Result **1**, exit **0**. The single file is
`corpus/knowledge/navigation-history-bfcache-evidence.md`. Cross-checks: S104-only = 1 file,
S105-only = 1 file, both rows in the same file.

## C2 falsification — three independent grounds

1. **The tip's own committed evidence says 1, not 0.** `corpus/evidence/round-24/c2-tip.json`
   (committed in `ad125e8`) records `rev: b973fde3…`, `mismatches: 1`, `clean: false`, with the
   single counted finding `m3-unlanded-paths observed: 4`. `c2-measurements.json` `after` agrees
   (`mismatches: 1`). `claims.json` `after: 0` contradicts both files, and the SCORECARD
   disposition table at `SCORECARD.md:1223+` asserts "tip counts none" in the same commit that
   carries a receipt counting one. My re-run at the actual tip returns 1 again (exit 1).
2. **The frozen `before` is also wrong.** `claims.json` says `before: 4` and enumerates three
   stale 12/12 figures plus one unlanded-path finding. The instrument at `573c99e` reads **5**:
   four m1 findings (the enumeration omits `check-sources` 25 vs 26 at `SCORECARD.md:410`) plus
   one m3. `c2-measurements.json` `before` and the SCORECARD block both say 5, so `claims.json`
   is the outlier, not my run.
3. **m3 is not revision-scoped.** `m3Findings` (`scripts/check-selfassessment.mjs:264-274`) runs
   `git status --porcelain --untracked-files=all` against the live lane and ignores `--rev`
   entirely. `--rev` scopes m1 and m2 only. Consequently a `--rev`-addressed claim of 0 is a
   claim about the working tree at scoring time, not about the measured bytes.

### Is the tip's working tree clean enough for m3 to read 0?

**As measured: no.** m3 = 0 requires an empty porcelain; porcelain has 5 entries, all untracked,
all created by the wave-2 dispatch harness itself (`gen-w2.mjs`, `w2-dispatch.*`, `w2-spec.json`,
`w2/swarm-registry.json`). m3 returns `[]` only when `paths.length === 0` (same function; the
`m3-clean-tree` selftest case asserts exit 0 on an empty tree).

**What would make it read 0:** the same disposition the wave-1 harness already has. At the tip,
`.ufo/waves/round-24/gen-w1.mjs`, `w1-dispatch.json`, `w1-spec.json` and `w1/` are **tracked**
(`git ls-tree` at `ad125e8`); `.gitignore` ignores only `.ufo/waves/*/scratch/`, so the w2
equivalents are unlanded by construction until the L1 commits them. Every w2 seat report written
into `.ufo/waves/round-24/w2/` — this file included — adds one more path to the count, so m3's
`observed` will keep rising during the wave and can only fall to 0 at integration.

`[INFERENCE]` At the moment of the tip commit the tree was plausibly empty of untracked paths
(all 5 current paths postdate the commit by ≥ 68 s), but that state is not retroactively provable
from the repo — only that no current unlanded path predates the tip.

**Live mutation observed mid-run (grounding for the moving m3 number).** A re-run of the same C2
command after writing this file (`05:54:5x`) returned `mismatches: 1` with
`m3-unlanded-paths observed: 8`; seconds later `git status --porcelain --untracked-files=all`
showed **11** lines — 8 untracked (4 dispatch files, `w2/swarm-registry.json`, 3 w2 reports
including this one) plus **3 tracked files now ` M`**: `corpus/SOURCES.md`,
`corpus/knowledge/navigation-history-bfcache-evidence.md`, `corpus/lessons/round-24.md`. None of
those three edits is mine; `git diff` shows a correction pass on the S105 byte-count defect
flagged below ("82548 bytes decoded" → "61911 bytes decoded from a 82548-byte base64 transfer",
both sites) plus an accurate relabel of the S104 section to `§"bfcache basics"` (real `h2` at
fetched line 2513). Because the edits are uncommitted they add to m3, and because `--rev` does
not scope m3 the counter's reported "tip" state moved 5 → 8 → 11 within four minutes. The
`claims.json` `revisions` block remains empty while these corrections land uncommitted.

## C1 confirmation — and what it cannot see

Gate set derivation (`scripts/check-gate-registry.mjs:28-30, 246-256`): `scripts/` files matching
`check-*.mjs` / `*audit*.mjs` (10) ∪ scripts named by gate-kind registry rows (4:
`claim-record-discipline`, `lifecycle observation count`, `finite review-chronology/history
classifier`, `finite lifecycle semantic outcome oracle`) = **14**, matching the reported set.
`scripts/` holds 23 `.mjs` files; I read the headers of every non-convention one
(`selftest-measurement-binding.mjs` = self-test driver for `check-measurement-binding`,
`freshness-witness.mjs`, `pstack-seat/aggregate.mjs`, `user-seat/aggregate.mjs`,
`aria-loopback-round13.mjs`, `webmcp-*.mjs`): none self-declares as a gate, so the derivation is
not obviously under-inclusive. `[INFERENCE]` — this is a reading of headers, not a semantic
classification.

Real-byte fail-closure limit: across the 10 swept revisions the only real-byte finding id is
`e1-missing-row`. `e2-field-incomplete` and `e3-row-script-absent` fire **only in fixtures**
(`--selftest`), never on this lane's committed registry bytes in that window. The field predicates
therefore rest on the fixture matrix alone; I did not mutate the real registry (delegated to
`L1Tabi24.MutGateRegistryRows`).

**Missing control artifact.** All three claims name
`.ufo/waves/round-24/control/control-receipt.json` as the recorded control. That directory does
not exist and nothing of that name is tracked (`find .ufo/waves/round-24 -name 'control-receipt*'`
returns only a decoy inside a mutant fixture at
`scratch/L1Tabi24.MutSelfAssessmentClasses/fx/A3-receipt-outside-corpus/…`). The control *scripts*
survive at `.ufo/waves/round-24/scratch/ExecControlSkip/`, and I re-ran them at the baseline:

| control | output at `573c99e` | frozen counter at `573c99e` |
|---|---|---|
| `check-gate-registry-skip.mjs` | `nonconformant: 0`, `clean: true`, exit 0, `grep_hits_in_SKILL_md: 0` | 3 (exit 1) |
| `check-selfassessment-skip.mjs` | `mismatches: 0`, `clean: true`, exit 0, `grep_hits_in_SCORECARD_md: 4` | 5 (exit 1) |

Both controls are separated from the frozen counters by the full before-value, so the counters are
not skip-work. But the receipt the claims point at was never landed: the control claim is
**reproducible from scratch scripts, not from the cited path**.

## C3 confirmation — bytes and admission both hold, one label is wrong

- `sha256sum corpus/evidence/round-24/sources/{bfcache.html,page.pdl}` →
  `0dd45292df5288f84748b4d5087ed1c69b0b98eb27dc46eaf7c50c9ffaf28e07` (157667 B) and
  `e944a3b19fa2c87b4ed0a84cca85b16b127618725394496ba046a2dfdf9405be`. Both match the entry's
  `source:` lines and `corpus/SOURCES.md:119-120` verbatim.
- Every cited span is present at the cited line of the retained bytes: S104 `:2531` (the
  "restored from memory, without having to go to the network" cell), `:2893` (the
  `NotRestoredReasons` sentence), `:2511` ("All major browsers include a bfcache"); S105 `:1345`
  (`BackForwardCacheRestore` inside `NavigationType`) and `:1706`
  (`experimental event backForwardCacheNotUsed`).
- Admission: `corpus/README.md:582` maps the entry under §Frontier; `corpus/SOURCES.md:119-120`
  carry `fetched 2026-10-25`; `git grep -ilE 'bfcache|back/forward cache'` over `corpus/knowledge`
  returns **nothing** at `573c99e` and only this entry at the tip — the surface was genuinely
  unheld, so the killRule's "already held" branch does not apply.
- **Defect (prose, located; a fix is already uncommitted in the working tree):** entry §source line
  for S105 and `SOURCES.md:120` both said "82548 bytes decoded". The retained decoded file is
  **61911 bytes**; 82548 = ceil(61911/3)×4 is the **base64-encoded** length. The sha256 is of the
  decoded bytes and matches, so the row was always grounded — only the adjective was wrong, in two
  places. As observed in the live-mutation note above, a sibling correction pass rewrote both sites
  to "61911 bytes decoded from a 82548-byte base64 transfer" and retitled S104's section to the real
  heading `bfcache basics` (`<h2 id="basics">` at fetched line 2513); I verified the new label
  against the retained bytes. The committed bytes at `ad125e8` still carry the defect.
- The counting command is a **proxy**: `^source: S10[45] ` counts files citing either row. It does
  not test "first opened this round" and does not test admission; I verified both separately above.

## Instrument limits found (not defects to fix here)

1. **m2 is effectively null.** 76 m2 findings, **1 evaluated** at both revisions (the round-23
   `git cat-file -e a89f193:…` receipt, claimed 128 = observed 128), **75** could-not-evaluate
   ("command outside the closed re-run grammar"). C2's entire arithmetic is m1 + m3; the
   disposition never discloses m2 as a null class even though the claim's own killRule requires
   disclosing a class that yields no finding.
2. **m1 supersession is mechanical, therefore cheap to satisfy.** The 5 stale figures at the tip
   are cleared because `SCORECARD.md:1186-1198` restates the correct tallies later
   (`supersession: a later line stating the correct tally … clears earlier stale mentions`). The
   stale bytes remain in the document; the counter is satisfied by a later correct restatement.
   This is disclosed design, but it means "0 mismatches" never implies "no wrong figure in the
   file".
3. **The round's own new figures are unverified by the counter.** The 4 tip-side
   could-not-evaluate findings are `SCORECARD.md:1232, :1233, :1243, :1249` — the disposition's
   own `cases=22` and `cases=13` claims ("ambiguous script association"). I measured both
   directly: C1 `cases=22 passed=22`, C2 `cases=13 passed=13`. Correct, but counted as
   could-not-evaluate, never as a match.
4. **m3 is a live-tree sensor** (see above): its value is a function of what other seats are
   writing while it runs.

## Unknowns / not tested

- Retroactive proof that porcelain was empty at `ad125e8` (only the mtime ordering above).
- Real-byte `e2`/`e3` red (fixture-only in the swept window); mutation of the real registry was
  left to the assigned mutation tester.
- No browser, no network fetch, no external site beyond the retained round-24 source bytes.
