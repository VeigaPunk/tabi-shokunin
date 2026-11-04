# R63ExecGate — independent reproduction of C2 (tabi round 63, wave w1)

Seat: `R63ExecGate` · axis judged: **calibration** · claim: **C2** · date 2026-11-04 (UTC)
Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin` · baseline `f098bcf8843c8a5a723a83995352180f897a6ff9`
Instrument/controls freeze `816592612dd2a8073437c595d3fe3c477125cf3c` · lane HEAD at seat start `e5325ad8805df86cb0109373d2ac695f558c2a1f`
Host: node `v24.21.0`, git `2.56.0`. No tool installs, no pacman, no jj, no lane mutation.

Everything below is a run I executed; unrun checks are named as skipped.

## Sandbox

```
mkdir -p /fast/scratch/hyaku/tabi-r63/R63ExecGate
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin /fast/scratch/hyaku/tabi-r63/R63ExecGate/sandbox/lane
git -C <clone> rev-parse --show-toplevel   ->  /fast/scratch/hyaku/tabi-r63/R63ExecGate/sandbox/lane   (exit 0)
cp <lane>/.ufo/waves/round-62/w1/R62Scout/commands.json  <clone>/.ufo/waves/round-62/w1/R62Scout/commands.json
sha256(commands.json) = e9b673d70685b317f33f12bb91556e62f27f27aa62185121670ce8e56a2e34d7  (1,388,366 bytes; identical in lane and clone)
git -C <clone> status --porcelain  ->  exactly 1 row:  ?? .ufo/waves/round-62/w1/R62Scout/commands.json
```

Clone HEAD `e5325ad8`. All mutations below happened only inside this scratch clone (`git commit` with throwaway `-c user.name/-c user.email`, toplevel asserted first).

## Frozen bytes (sha256)

| File | sha256 | identity |
|---|---|---|
| `scripts/check-selfassessment.mjs` | `005bd45ac44aa8fc0d81c453b38e0bd7aacee1527432da50eb5fd9d7aee8a48d` | identical at `f098bcf8`, `81659261`, `e5325ad8`, live worktree, clone |
| `scripts/check-secondary-round62.mjs` | `25bff62a0476e8bc8606a8a59e3a4ae4184526937274366c7e5958e7e6ab062a` | identical at `f098bcf8`, `e5325ad8`, worktree |
| `scripts/chrome-cdp-loopback-round63.mjs` | `b00efd59ac10fd047014b76b2a5d16cc8b0acaab0730e8c6029a0b53a0d6c040` | matches the C1 pin |
| `.ufo/waves/round-62/counters/c1-adjacency-host-v21.mjs` | `b845973c0f16433b05080829cf66641df303cffa09a9dc291d1773b9b9c8afa6` | frozen r62 counter (run, not edited) |
| `SCORECARD.md` blob at baseline | `08d5f49718ba86cd01f2c820069bbedce8aeddad` (3,445 lines) | the bytes the gate reads under `--rev f098bcf8` |
| `SCORECARD.md` live worktree at 19:07:04Z | `89318d592b01225f1385027586d1f80e38e5b061c64ea4d784cc2b5f1c3870f3` (3,491 lines) | uncommitted round-63 append (+46/−0); **not** the byte set the gate scores at the baseline rev |

## Runs (argv, cwd, exit)

| # | argv | cwd | exit | result |
|---|---|---|---|---|
| R1 | `node scripts/check-selfassessment.mjs --rev f098bcf8843c8a5a723a83995352180f897a6ff9 --json` | `<clone>` | **1** | mismatches **2**, clean **false**, counted = `[m1 SCORECARD.md:3427 claimed 44 observed 9; m3 claimed "landed" observed 1]`, couldNotEvaluate **142**, superseded **58**, stderr 0 B |
| R2 | `node scripts/check-selfassessment.mjs --rev 24c966dada206571a096c5c8f70b4ffe21c9523c --json` | `<clone>` | **0** | mismatches **0**, clean **true**, counted `[]`, couldNotEvaluate **142**, superseded **59**, status rows before run **0** |
| R3 | same as R2 after copying 60 untracked round-63 paths into the clone | `<clone>` | **1** | mismatches **1**, counted = `[m3 claimed "landed" observed 60]`, finding `round: 43` |
| R4 | `node scripts/check-secondary-round62.mjs --self-test` | `<clone>` | **0** | JSON `{"schema":"tabi-r62-production-path-selftest","allPass":true,"cases":9,"results":9}` — tally line `"cases": 9` |
| R5 | `node .ufo/waves/round-62/counters/c1-adjacency-host-v21.mjs --selftest` | `<lane>` | **0** | `{"allPass":true,"cases":44,"pass":44,"results":44}` |
| R6 | `node scripts/check-selfassessment.mjs --selftest` | `<lane>` | **0** | `SELFASSESSMENT_SELFTEST verdict=clean cases=45 passed=45` |
| R7 | `git -C <lane> status --porcelain --untracked-files=all \| wc -l` | `/home/vgpnk/Projects/shokunin` | 0 | **63** rows at 2026-11-04T19:07:04Z (earlier in-session observation: 38 rows, all untracked) |

R1 receipt `receipts/selfassessment-before.json` (`91f4e174…`), R2 `receipts/selfassessment-after.json` (`d7ffc2e7…`), R3 `receipts/selfassessment-residual-m3.json` (`31f4a2b4…`), R4 `receipts/check-secondary-selftest.json` (`de3be3bb…`), R5 `receipts/c1-adjacency-host-v21-selftest.json` (`80023511…`), R6 `receipts/check-selfassessment-selftest.out`, R7 `receipts/live-status-snapshot-190704Z.txt` (`1ca6b616…`). Hashes in `receipts/SHA256SUMS.txt`; structured receipt `runs.json`.

R2 setup (append-only, inside the clone only): one appended SCORECARD line
`Correction (supersedes SCORECARD.md:3427): the \`44/44\` figure on that line is the v21 meter own selftest tally (… cases 44, allPass true), not a tally of \`scripts/check-secondary-round62.mjs\`, whose \`--self-test\` measures 9 cases.`
plus `commands.json` and a new `MANIFEST.json` committed at `24c966da`. Commit numstat: `SCORECARD.md 2/0`, `commands.json 133/0`, `MANIFEST.json 7/0` (zero deletions).

## Assignment item 1 — reproduce C2 before/after

Reproduced. Before: exit 1, mismatches 2, `clean:false`, exactly the two declared findings, 142 could-not-evaluate and 58 superseded (matching the C2 `limits` text). After: exit 0, mismatches 0, `clean:true`, superseded 59. Gate `--selftest` 45/45 clean and gate bytes unchanged (`005bd45a…`) before and after.

The before "selftest status" of the m1 oracle is **measured**, not refused: the gate spawned `check-secondary-round62.mjs --self-test` itself (exit 0, `cases:9`) and compared the document's 44 against it. There is no per-oracle status field in the receipt; a measured tally implies exit 0 and a clean/absent summary verdict (`scripts/check-selfassessment.mjs:203-211`).

## Assignment item 2 — does 44/44 belong to the v21 meter or to check-secondary?

**It belongs to the v21 meter, and it is correct there.** `c1-adjacency-host-v21.mjs --selftest` returns exit 0 with `cases:44, pass:44, allPass:true` (R5). The line `SCORECARD.md:3427` (baseline blob; also live line 3427) is the round-62 **C1** row and names `node .ufo/waves/round-62/counters/c1-adjacency-host-v21.mjs …`; it names no `scripts/*.mjs` at all (verified: zero `scripts/` tokens on that line).

The gate nevertheless associates it with `scripts/check-secondary-round62.mjs` because `SCRIPT_IN_TEXT` (`scripts/check-selfassessment.mjs:146`) only recognizes `scripts/**.mjs`, and the per-line association falls back to the section's single script when the line names none (`:250-252`). At the scored baseline rev the round-62 section (`SCORECARD.md:3418`→EOF of the 3,445-line blob) contains exactly one `scripts/*.mjs`: `check-secondary-round62.mjs`. Its oracle reports **9** (R4, `"cases": 9`, `allPass:true`, exit 0). So the counted m1 pair is `44 (v21 counter, true) vs 9 (secondary counter, true)` — a cross-instrument comparison, not a stale number.

## Assignment item 3 — the 63 porcelain rows and whether committing the artifact zeroes them

R7 snapshot 2026-11-04T19:07:04Z, 63 rows (`1ca6b616…`):

| class | count | paths |
|---|---|---|
| round-63 in-flight (untracked) | 60 | 45 under `.ufo/waves/round-63/**` (`w1/R63ExecDriver` 22, `controls/negatives-data` 11, `w1/R63Scout` 2, `controls/mutation` 2, wave handoff files, remainder), 14 under `corpus/evidence/round63/chromium-wheel-scroll/**`, `corpus/knowledge/chromium-wheel-scroll-round-63.md` |
| round-63 in-flight (tracked, modified) | 2 | `SCORECARD.md` (+46/−0), `corpus/SOURCES.md` (+4/−0) |
| round-62 artifact | 1 | `.ufo/waves/round-62/w1/R62Scout/commands.json` (`e9b673d7…`) |

**No — committing the artifact alone does not zero it.** Measured (R3): with the artifact landed, the MANIFEST committed and the correction applied, restoring the 60 untracked round-63 paths alone leaves `mismatches:1`, `m3-unlanded-paths observed:60`. `m3Findings` (`scripts/check-selfassessment.mjs:477-508`) counts every `git status --porcelain --untracked-files=all` row, regardless of round, against the newest executed-disposition block. The live lane can only report 0 at a tree where no seat holds uncommitted work — i.e. after integration, never mid-wave. The count is also non-stationary: 38 rows (all untracked) at the start of this seat, 63 at 19:07:04Z as siblings wrote.

## Assignment item 4 — gate selftest

`node scripts/check-selfassessment.mjs --selftest`, cwd `<lane>`, exit **0**:
`SELFASSESSMENT_SELFTEST verdict=clean cases=45 passed=45` (R6, `receipts/check-selfassessment-selftest.out`).

## Findings (severity, frozen file/line attacked)

**H1 — C2's m3 clause is not decidable by its own instrument, and committing the artifact cannot clear it mid-wave.** `scripts/check-selfassessment.mjs:477-508` (`m3Findings`) and `:484` (`git status … --untracked-files=all`). Measured: 60 residual round-63 paths still yield a counted m3 finding (R3). Consequence: the C2 `afterCommand` (`claims.json:70`) is only satisfiable on a tree after every wave artifact is landed; a mid-wave "after" run is exactly the K4 could-not-evaluate case (`claims.json:74`). The gate also cannot distinguish "landed with a MANIFEST" (`claims.json:63`) from a bare commit or from deleting the file — m3 sees only status rows, so the MANIFEST requirement is prose, not predicate.

**H2 — the counted m1 mismatch is a cross-instrument mis-association, not a stale tally.** `scripts/check-selfassessment.mjs:146` (`SCRIPT_IN_TEXT` cannot match `.ufo/waves/**/counters/*.mjs`) + `:250-252` (section-wide fallback). Attacked bytes: `SCORECARD.md:3427` (baseline blob `08d5f49…`) and the C2 `before` text `claims.json:69`. Evidence: 44/44 is the v21 meter's own `cases:44/pass:44/allPass:true` (R5); check-secondary's oracle is `cases:9` (R4). The declared repair makes the gate's number agree with check-secondary; it does not and cannot change the association rule, so any future counter-tally on a `scripts`-free line inside a single-gate section will repeat the false comparison.

**M1 — the m3 finding names round 43, while the claim says round 62.** `scripts/check-selfassessment.mjs:478` regex `/^##\s+Round\s+(\d+)\s+—\s+executed disposition/` only matches headings whose text immediately after the dash is `executed disposition`; rounds 44-58 insert "declared claims …", rounds 59-62 use other wording, so the newest match is `## Round 43 — executed disposition …` (`SCORECARD.md:2323`). Both receipts carry `"round": 43` (R1, R3), contradicting `claims.json:69` ("m3-unlanded-paths round 62"). The counted tuple drops `round`, so scoring is unaffected — the prose is.

**L1 — the C2 kill rule cites a pin that the freeze pin set omits.** `claims.json:79` ("`scripts/check-selfassessment.mjs` bytes differ from the frozen pin") has no corresponding entry in `pins` (`claims.json:17-25`). I verified the dependency externally: the blob is `005bd45a…` at `f098bcf8`, `81659261` and `e5325ad8`, so K1 currently resolves; the claims file alone does not let a verifier resolve it.

**L2 — the gate's child sandbox does not contain the child's default scratch.** `scripts/check-selfassessment.mjs:187-192` spawns child gates with `TMPDIR/TMP/TEMP` in a private temp dir, but `scripts/check-secondary-round62.mjs:23` defaults `scratch` to `HYAKU_SCRATCH || /fast/scratch/hyaku/tabi-r62/l1-cli-replay`, outside that sandbox. Observed: the fixed directory exists on this host and was empty after my runs (the child's `finally` cleanup held); no lane-tree write occurred.

**I1 — informational, live lane drift.** The live worktree `SCORECARD.md` (3,491 lines, `89318d59…`) differs from its HEAD blob (3,445 lines, `08d5f49…`) and `corpus/SOURCES.md` is modified; both diffs are append-only (46/0 and 4/0). The receipt line numbers I cite are baseline-blob coordinates, which still address the same rows in the live file (C1 row = line 3427 in both). The 63-row count above is a snapshot, not a constant.

## Not run / not verified

- The real landing revision and the lane's real after-state: not produced by me (seats do not commit); R2 is a sandbox reproduction of the predicate mechanics only.
- C1's live wheel run, its counter, the 10 negatives and the 8 mutants: out of this seat's scope, untouched.
- No build/lint/formatter/test gate was run on the lane; none was assigned.

## VERDICT

**C2's before state reproduces exactly (exit 1, mismatches 2, clean false) and its after state is reachable in a sandbox clone (exit 0, mismatches 0, clean true, selftest 45/45) — but the repair is an annotation of a gate mis-association (44/44 is the v21 meter's true tally, check-secondary's oracle is 9), and the m3 clause cannot be zeroed until the round-63 work is landed.**

Scratch `/fast/scratch/hyaku/tabi-r63/R63ExecGate/` was deleted before yield; no tree remains.
