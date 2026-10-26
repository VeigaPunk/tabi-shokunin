# ConnSeparability — causal separability of C1, C2, C3 (tabi round 29, wave w1)

Seat: ConnSeparability (connector, leaf). Date: 2026-10-26.
Lane state analysed: tip `35045d7` (w1 mid-landing; landings `190052c` C3 re-open,
`59e8167` C1 repair + C2 corrections, `35045d7` LOG correction). Claims frozen at
`97be89b`; baseline `856fa9e`. All counter runs were done in a `--shared` scratch clone
under `/fast/scratch/hyaku/tabi-r29/ConnSeparability` (removed after the run); no lane
file was written or modified by this seat. No tools installed.

## 1. Read set / write set per claim (traced from source, with path:line)

### C1 — operability (`scripts/check-s106-evidence.mjs`)
- Reads (production): git blob `corpus/evidence/round-26/sources/s106.json`
  (`scripts/check-s106-evidence.mjs:46`, `:111`) and the committed decoded bytes at
  `receipt.bytes_path` (`:118`), all at the measured revision via `git show` (`:69`).
  Self-test: only its own temp fixture repos. Never reads SCORECARD.md, LOG.md,
  SKILL.md, corpus/SOURCES.md, or corpus/evidence/round-29/.
- Writes (landing `59e8167`): the gate itself, `corpus/evidence/round-29/s106-selftest/`
  (`mutation.txt`, `mutation.diff`, `selftest-l1.txt`). No .json.

### C2 — calibration (`scripts/check-selfassessment.mjs`, frozen sha256 `728128008e22…`)
- Reads: SCORECARD.md blob (`:402`), LOG.md blob (`:405`) — the m1 text windows
  (`:184`, `:280`, tally shapes at `:121-127`); **every `*.json` under
  `corpus/evidence` at the revision** (`:345-348`, m2); `git status --porcelain`
  (`:391`, m3); and, as the m1 oracle, it **executes the working-copy self-test of
  every gate script named on a tally line** (`gateTally`, `:144-182`), requiring the
  rev blob to be byte-identical to the working copy (`:153-155`).
- Writes (landings `59e8167`, `35045d7`): append-only SCORECARD.md round-29 corrections
  block (`SCORECARD.md:1458-1467`) and LOG.md round-29 block with the correction
  paragraph (`LOG.md:2007-2008`). Counter bytes untouched — frozen sha256 verified at
  `97be89b`, `190052c`, `59e8167`, `35045d7`.

### C3 — freshness (`scripts/check-release-pins.mjs`, frozen sha256 `567637200b05…`)
- Reads: `corpus/SOURCES.md` (`:69`), `corpus/evidence/round-29/release-pins/receipt.json`
  (`:70`), `…/bytes/` (`:71`), `…/refetch/<id>.json` (`:72`) — committed blobs at the
  revision. Never reads SCORECARD.md, LOG.md, SKILL.md, or anything C1/C2 write.
- Writes (landing `190052c`, in flight): SOURCES.md rows S108–S115 + recheck notes,
  `corpus/evidence/round-29/release-pins/` (receipt, bytes at both tags,
  `chromiumdash-stable-linux.json`, refetch records as seats land them), knowledge
  entries with round-29 recheck notes.

## 2. Coupling table

| # | Coupling path | Evidence | State at tip `35045d7` | Verdict |
|---|---|---|---|---|
| 1 | **C1 landing → C2 count** (m1 oracle): repairing the s106 self-test flips C2's oracle for `scripts/check-s106-evidence.mjs` from *no tally / could-not-evaluate* to a measured number; `SCORECARD.md:1438` (claimed 5) turns from uncounted into a counted stale tally unless superseded | baseline finding "couldNotEvaluate: self-test printed no tally" (`.ufo/waves/round-29/baseline/c2-before-frozen-counter-cleanbase.json.txt` line ~205); oracle machinery `check-selfassessment.mjs:144-182`; measured at tip: `:1438` claimed=5 observed=7 superseded=True | C2 correction line `SCORECARD.md:1466` states exactly (7/7) and cites `SCORECARD.md:1438`; `mismatches=0` measured | **REAL COUPLING.** C2's final count depends on C1's landed case count. If C1 had landed N≠7, line `:1466` would itself count (claimed 7 ≠ observed N) and `:1438` would fail supersession (clearing requires clearing-line observed == its claimed == stale line's observed) — C2 would fail through C1's value. |
| 2 | **C1/C3 record wording → C2 count** (m1 text window): any SCORECARD/LOG line that names a gate script and carries a tally shape — `` `--selftest` (N/N) ``, `N-case`, `cases=N`, `cases: N`, `N cases` (`check-selfassessment.mjs:121-127`, `:184-277`, `:280-339`) — is compared to that gate's oracle | `SCORECARD.md:1466` (C1 record, 7/7) and `:1465` (C2 record, 22/22) both measured clean at tip | wording rule required (§3); both landed lines satisfy it | **Record-layer coupling.** Counters are file-disjoint, but all three claims' records share the two documents C2 counts. |
| 3 | **C3 landing → C2 count** (m2 receipt scan): every `*.json` under `corpus/evidence` at the rev is walked; objects with `command:string` + `exit:number` are re-executed under the closed grammar `git (cat-file -e|show) <rev>:<path>` (`check-selfassessment.mjs:341-384`); other commands are could-not-evaluate, reproducible git commands must match their recorded exit | C3 lands `receipt.json` + `chromiumdash-stable-linux.json` + `refetch/*.json` inside that tree (`190052c` stat). Structured walk of both committed JSONs at tip: **zero** command/exit object pairs (the naive `git grep -E '"command"|"exit"'` hits are substrings `command_line`, `expected_exit`). C2 measured `mismatches=0` | currently clean | **LATENT COUPLING.** A C3 receipt entry recording a non-reproducible `command`/`exit` pair (or a reproducing `git show` whose exit later changes) would add m2 mismatches to C2. Rule §3.4. |
| 4 | C2 landing → C1 count | none: C1 reads only its receipt + bytes + own blob (`check-s106-evidence.mjs:46,111-118`); C2 writes SCORECARD/LOG only (`59e8167`/`35045d7` stats touch no s106 evidence) | C1 `--rev HEAD --json` → `valid=true` measured | **Independent.** |
| 5 | C2 landing → C3 count | none: C3 reads SOURCES.md + release-pins evidence (`check-release-pins.mjs:69-72`); C2 writes neither | C3 measured population=23 unresolved=23 (all reasons `f6-refetch`; seats still landing refetch records) while C2=0 — counts move on independent axes | **Independent.** |
| 6 | C1 landing → C3 count | none: C3 re-derives rows from committed bytes + its own receipt; the s106 gate repair and `corpus/evidence/round-29/s106-selftest/` are outside C3's read set; `corpus/evidence/round-26/sources/s106.json` and the 154 bytes untouched by `190052c` | C3 S106-row checks (f1–f5) pass in receipt; unresolved reasons are only f6 | **Independent.** |
| 7 | C3 landing → C1 count | none: C1 checks the round-26 receipt + 154 decoded bytes + revision bytes; C3's re-open adds new bytes under `round-29/release-pins/bytes/` and superseding SOURCES rows, never rewriting the round-26 evidence | C1 `--selftest` 7/7 exit 0; mutation receipt red (`measured-revision-bytes-mismatch` FAIL on the mutant, `mutation.txt` exit=3) | **Independent.** |
| 8 | C2 m3 (SCORECARD newest `## Round N — executed disposition` × `git status --porcelain`, `check-selfassessment.mjs:386-398`) | fires only on a dirty tree; the round's measurement rule mandates a clean checkout of REV, so porcelain is empty and m3 cannot fire; all round records are committed before measurement | no m3 finding at tip | **Decoupled by measurement rule**, not by code. |
| 9 | SKILL.md record surface: `59e8167` added registry rows stating (cases=7/22/20) at `SKILL.md:2543-2545` | no round-29 counter reads SKILL.md — C2's m1 windows are SCORECARD/LOG only (`:402-405`); the adjacent `check-gate-registry.mjs` reads it, and its verdict is recorded in `LOG.md:2010` with no tally shape | no effect on any r29 count | **Adjacent, not coupled** — but the SKILL rows must stay equal to the landed selftest counts or a future registry-conformance check trips. |
| 10 | Latent quarantine: `SCORECARD.md:1232-1249,1293-1313` carry tally-shaped numbers (22/13/17/18) inside multi-script sections | quarantined as "ambiguous script association" → couldNotEvaluate, never counted (baseline + tip receipts) | uncounted at tip | **Latent:** any edit narrowing those sections to a single named script un-quarantines them into live tallies. Never restructure those sections. |

## 3. Wording rules that keep the round's own records from creating new stale tallies

Derived from the frozen matcher and verified empirically (C2 at tip: `mismatches=0`,
`couldNotEvaluate=92`, `superseded=12`):

1. **Either avoid tally shapes or state the measured number.** When recording any gate
   result in SCORECARD.md or LOG.md, either write no tally shape at all on lines naming a
   gate script (no `` `--selftest` (N/N) ``, `N-case`, `cases=N`, `cases: N`, `N cases`),
   or state the exact number that gate's self-test prints at the measured REV. For the
   round-29 tip those numbers are: s106-evidence = 7, selfassessment-counter = 22,
   release-pins = 20, freshness = 12, sources = 26, round-evidence-audit = 13.
2. **Clear a stale line only with the full correction grammar.** SCORECARD: a later line
   naming the same script, carrying /supersed\|correct\|replace/i, stating the oracle
   number, and citing the stale line's **own document and line/range**
   (`SCORECARD.md:N` clears only SCORECARD lines; `LOG.md:N` clears only LOG lines —
   the frozen matcher's cross-document hardening, claims C2 control). LOG: the
   correction is a *paragraph* (blank-line delimited) that names the script, carries the
   marker, cites the same-document line/range, and includes the oracle number among its
   stated tallies — as done at `LOG.md:2007-2008` for `LOG.md:221` (states `cases: 12`,
   oracle 12).
3. **Keep incidental counts away from gate-script lines.** Bare fractions and counts
   ("23 of 23", "16 hold, 7 drifted") are safe from the line scan (it only fires on lines
   containing `selftest|case`), but a `cases: N` shape anywhere on a script-naming line
   is caught — check before adding colons to numbers.
4. **C3 evidence JSONs must not carry `{command, exit}` object pairs** unless the command
   is the closed `git show <rev>:<path>` / `git cat-file -e <rev>:<path>` grammar and
   reproduces at the measured revision (m2 re-runs it; anything else is could-not-evaluate,
   which is safe but pollutes the count's denominator of real checks).
5. **Never edit the frozen counters.** `check-selfassessment.mjs` = sha256
   `728128008e2242b635bda30a28313de20b06d381d7855f11f18fa5043ba560c4` and
   `check-release-pins.mjs` = sha256 `567637200b05eaf6c4ca750294b6ddc30ce64417c336fe135ab625f8c6fc3770`
   at every round-29 measurement REV (verified identical at `97be89b`, `190052c`,
   `59e8167`, `35045d7`). Editing them breaks the C2/C3 kill rule ("counter bytes
   differing from the frozen sha256 → not verified") and shifts every oracle number the
   record lines state.
6. **Do not restructure quarantined multi-script sections** (table row #10): removing a
   script name from those SCORECARD sections converts couldNotEvaluate quarantine into
   live tallies at whatever number the section carries.

## 4. Verdict

- **Counters are file-disjoint and independently runnable.** C1↔C3 have zero paths in
  either direction (verified by read-set trace and by the tip measurements: C1 valid and
  red-mutated while C3 sits at 23 unresolved for f6-refetch reasons only).
- **One real cross-claim count coupling exists: C1's landed self-test value feeds C2's
  m1 oracle** (table row #1). C2's verification is not independent of C1's landing; it is
  kept separable only by wording rule 1/2 — the record states the measured 7 and the
  frozen counter's supersession grammar does the rest. This matches the claims.json
  separability note's intent ("If C1 does not land, SCORECARD.md:1438 stays
  could-not-evaluate (no tally) and C2 is unaffected") with the corollary that the
  claims.json did not state: *if C1 lands with N≠7, C2 fails via its own honest record.*
- **The shared m2 scan surface** (C3's evidence JSONs inside C2's receipt tree) is the
  second coupling; it is clean at tip and kept clean by rule 4.
- **m3 is decoupled by the measurement rule** (clean checkout), and SKILL.md is an
  adjacent record surface, not a round-29 count surface.

## 5. Commands run (all in the scratch clone; lane untouched)

```
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin lane   # exit 0
node scripts/check-selfassessment.mjs --rev HEAD --json                # exit 0; mismatches=0, couldNotEvaluate=92, superseded=12
node scripts/check-s106-evidence.mjs --selftest                        # exit 0; S106_SELFTEST verdict=clean cases=7 passed=7
node scripts/check-s106-evidence.mjs --rev HEAD --json                 # exit 0; valid=true
node scripts/check-release-pins.mjs --rev HEAD --stable 156.0.8078.47 --json  # exit 1; population=23 unresolved=23 (mid-flight; reasons all f6-refetch)
node scripts/check-selfassessment.mjs --selftest                       # exit 0; cases=22 passed=22 (frozen bytes at tip)
node scripts/check-selfassessment.mjs --selftest   @856fa9e            # exit 0; cases=20 passed=20 (pre-freeze committed counter)
git show <rev>:scripts/check-selfassessment.mjs | sha256sum           # 728128008e22… at 97be89b/190052c/59e8167/35045d7 (frozen match)
git show <rev>:scripts/check-release-pins.mjs | sha256sum             # 567637200b05… at 97be89b and 35045d7 (frozen match)
```

Measured receipts: `c2-at-head.json`, `c3-at-head.json` (scratch, copied next to this
report as `ConnSeparability.c2-at-head.json` / `ConnSeparability.c3-at-head.json`).

Tooling installs: none.
