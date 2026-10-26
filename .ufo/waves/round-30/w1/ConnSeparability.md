# ConnSeparability — C1/C2 causal separability and shared-file conflicts (round 30 w1)

Seat: `ConnSeparability` (connector, leaf). Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`
(read-only; only my wave output dir and this report written). Scratch:
`/fast/scratch/hyaku/tabi-r30/ConnSeparability/` (clones c1..c4). Milestone: claims.
No subagent dispatched; no tool installed/upgraded (node v24.21.0, git 2.56.0, curl, python3
already present).

## Verdict

C1 and C2 are **causally separable at the counter level** — the C1 counter
(`check-gate-mutants.mjs`) reads only `scripts/gate-mutants.json` and the two gate scripts; the C2
counter (`check-frontier-admission.mjs`) reads only corpus paths (`corpus/SOURCES.md`,
`corpus/knowledge`, `corpus/evidence/round-30/frontier`, `corpus/lessons/round-30.md`); neither
reads the other's surface, and I verified both predicates on a fully integrated scratch clone
(C1: `fault_survivors 0 / benign_killed 0 / exit 0`; C2: `population 2 / admitted 2 / exit 0`,
offline and `--live`). The **shared-file collisions** are: (a) `scripts/check-release-pins.mjs`
is patched by two seats (ExecPinsCasesA and ExecPinsCasesB) with a documented hunk conflict — plain
`git apply` of B after A fails; resolution is concatenation of B's CASES block after A's (measured
clean, `combined-A-plus-B.patch`); (b) `corpus/SOURCES.md` is patched by ScribeUsedBy23 (23
used-by cells) and ScribeEntryDiscordHeaders (+S117 row) — disjoint hunks, and I verified both apply
orders apply cleanly; (c) `corpus/lessons/round-30.md` does not exist at freeze and receives content
from ≥3 seats (ScribeRows gate-block, ScribeQuoteGrounding gate lines, L1 assembly) — a single new
file, order matters only for the `g6-gate` quote lines; (d) `corpus/evidence/round-30/frontier/`
is written by FetchS159 (S116 receipt+bytes), FetchS182 (S117 receipt+bytes) and
ScribeEntryDiscordHeaders (S117 refetch+bytes) — disjoint files, no conflict. **Self-assessment
fallout:** at freeze `check-selfassessment.mjs` is clean (exit 0, mismatches 0); after C1 lands
(s106 self-test 7→10, release-pins 20→29) the frozen counter flags **exactly 4 lines** —
`SCORECARD.md:1438,1466,1479,1485` (mismatches 4, exit 1) — and the same-document appended
correction block (required; landed in integration `38891ca`) restores mismatches 0; the
SOURCES-stale committed tallies live only in `SCORECARD.md` and `SKILL.md` (LOG.md has none),
and `SKILL.md` is not scanned by the calibration counter. **Two integration gaps remain for C2
that no w1 seat ships:** the S116 registry row (only drafted in `sources-row-s116.md`/`rows.md`,
never patched into `corpus/SOURCES.md`) and the S116 refetch record (`refetch/S116.json`; every
seat that touched S116 explicitly declined to write it, and the refusal is correct — same-seat
provenance is the J4 selfquote pattern). With those two pieces composed (row from the seat's own
proposal; refetch by a second seat over a fresh byte-identical `-11` fetch) the full C2 predicate
passes both offline and live. C1 is unaffected by C2 landing and vice versa (measured both ways).

## 1. Shared-file map — what each w1 item proposes to change

Patches / concrete deliverables (from the item texts and the output dirs):

| Lane file | Items proposing a change | Patch / artifact |
|---|---|---|
| `scripts/check-s106-evidence.mjs` | **ExecS106Cases** (C1 build: +3 cases, header comment, +53/−1, `s106-cases.patch`) | only C1 seat with a patch; CritC1Equivalence probe patch is evidence, not a deliverable |
| `scripts/check-release-pins.mjs` | **ExecPinsCasesA** (+5 cases, `runSelftest` reasons harness, +52/−3) and **ExecPinsCasesB** (+4 cases, +34/−0) | **two seats patch the same file** (see §3) |
| `corpus/SOURCES.md` | **ScribeUsedBy23** (23 used-by cells, `usedby.patch`), **ScribeEntryDiscordHeaders** (+S117 row), ScribeRows (drafts rows S116/S117 in `rows.md`, no patch), ScribeEntryRateLimitFields (proposes S116 row in `sources-row-s116.md`, no patch) | **three items touch the same file** (two via patches, one drafted) |
| `corpus/README.md` | **ScoutPriorRateGround** (append coverage rows + frontier restatement, `readme-round30-coverage-row.patch`) | append-only |
| `corpus/knowledge/rate-limit-policy-fields.md` | **ScribeEntryRateLimitFields** (new entry, `rate-limit-policy-fields.patch`) | new file |
| `corpus/knowledge/host-published-rate-limit-headers.md` | **ScribeEntryDiscordHeaders** (new entry, in `patch-S117.diff`) | new file |
| `corpus/evidence/round-30/frontier/S116.json` + `bytes/S116.txt` | **FetchS159** (`S116-receipt.patch`) | new files |
| `corpus/evidence/round-30/frontier/S117.json` + `bytes/S117.html` | **FetchS182** (`S117.patch`) | new files |
| `corpus/evidence/round-30/frontier/refetch/S117.json` + `bytes/S117-refetch.html` | **ScribeEntryDiscordHeaders** (in `patch-S117.diff`) | new files |
| `corpus/evidence/round-30/frontier/refetch/S116.json` + bytes | **nobody** — gap (see §5) | — |
| `corpus/lessons/round-30.md` | ScribeRows (gate-block), ScribeQuoteGrounding (S110/S114/S115 gate lines), L1 assembly | new file, multi-contributor |
| `SCORECARD.md` | corrections block (drafted, uncommitted, in lane worktree; also CritC1Equivalence probe patch) | append-only |
| `SKILL.md` | two new registry rows (drafted, uncommitted, in lane worktree) | append-only |
| `QUALITY.md` | no w1 item edits it (only referenced by scout/package criteria) | — |

Attack seats (CritC1Counter, MutC1Counter, CritC2Counter, MutC2Counter, CritPackageStaleClaims,
RevQuarantineCarry) report findings only — no lane patches.

## 2. Counter-input coupling (C1 ↔ C2)

Read surfaces, by source inspection of the frozen counters at `061e620…`:

- `scripts/check-gate-mutants.mjs` — reads `scripts/gate-mutants.json` (line 69) and the two gate
  scripts; executes their `--selftest` in sandbox temp trees. **No corpus path.**
- `scripts/check-frontier-admission.mjs` — reads `corpus/SOURCES.md` (line 79), `corpus/knowledge`
  (80), `corpus/evidence/round-30/frontier` (81), `corpus/lessons/round-30.md` (82). **No script path.**

So C1 landing (scripts only) cannot change a C2 counter input, and C2 landing (corpus only) cannot
change a C1 counter input. Measured end-to-end below (§5). The only cross-axis document both claims
share is `SCORECARD.md` via the `check-selfassessment.mjs` no-harm check — that is calibration, not
a counter input (see §4).

## 3. Files two items both patch — merge order

### `scripts/check-release-pins.mjs` (A + B) — CONFLICT, measured
Both seats append to the end of `CASES`; A also edits `runSelftest` (reasons harness) and the
console printer. Measured in scratch (also documented by ExecPinsCasesB):
- A alone applies: `git apply pins-cases-a.patch` → OK (self-test 25/25).
- B after A, plain `git apply`: **fails** (`patch failed: scripts/check-release-pins.mjs:353`).
- Resolution that measured clean: apply A, then insert B's 34-line block before the closing `];` of
  `CASES` (concatenation; block order immaterial) → release-pins self-test 29/29, frozen counter
  `fault_killed 22 / fault_survivors 5` (s106 rows only). `combined-A-plus-B.patch` is the merged
  state; the L1 should apply the two seat patches (or that combined one), not both blindly.

### `corpus/SOURCES.md` (usedby + S117 row) — DISJOINT, measured
- ScribeUsedBy23 `usedby.patch` touches lines 47–120 (cells only, 23 rows).
- ScribeEntryDiscordHeaders `patch-S117.diff` appends the S117 row after S115 (line 129).
- Both orders apply cleanly on a pristine freeze tree: `usedby` → `patch-S117.diff` OK; and
  `patch-S117.diff` → `usedby` OK (verified). No hunk overlap.

### `corpus/lessons/round-30.md` (new file, multi-contributor)
Does not exist at freeze. ScribeRows' `gate-block.md` carries the S116/S117 gate quotes (both
receipt-quote candidates verbatim); ScribeQuoteGrounding's `gate-lines-round-30.md` carries the
S110/S114/S115 gate lines (routed-defect curation). `g6-gate` needs the receipt quotes inside the
lesson; L1 must assemble so both C2 receipt quotes survive verbatim (the counter collapses
whitespace but checks the record string as-is).

## 4. Self-assessment fallout of C1 (calibration axis)

**Baseline (freeze `061e620…`):** `node scripts/check-selfassessment.mjs --rev HEAD --repo <clone> --json`
→ **exit 0, `mismatches 0`, clean true**.

**After C1 (simulated with the real seat patches in my scratch clone):** s106 self-test
7→10, release-pins 20→29 (both measured: `S106_SELFTEST verdict=clean cases=10 passed=10`,
`RELEASE_PINS_SELFTEST verdict=clean cases=29 passed=29`, exit 0 each). Re-running the frozen
calibration counter:
```
node scripts/check-selfassessment.mjs --rev HEAD --repo <clone2> --json
→ EXIT=1, mismatches 4:
  SCORECARD.md:1438  claimed 5  observed 10  (s106)  "5 cases at baseline → implementation adds 2 revision-binding cases…"
  SCORECARD.md:1466  claimed 7  observed 10  (s106)  "--selftest (7/7): correction — supersedes the stale tally at SCORECARD.md:1438…"
  SCORECARD.md:1479  claimed 7  observed 10  (s106)  "S106_SELFTEST verdict=clean cases=7 passed=7…"
  SCORECARD.md:1485  claimed 20 observed 29  (pins)  "The scripts/check-release-pins.mjs self-test runs cases=20 (registry row in SKILL.md round 29)."
```

Note the mechanism: `:1438` (5) was previously superseded by the correction at `:1466` (7); once
`:1466` itself disagrees with the oracle (10), both the original tally and the correction count
(also `:1479`). `SCORECARD.md:1485` carries the pins 20. This reproduces the number already
measured by CritC1Equivalence (mismatches 4 against the same four lines).


**Addendum (post-measurement):** the L1 has since committed the integration as `38891ca`
(“round-30: C1 self-test cases …, tally corrections”). Re-measuring the real integrated commit in a
clean clone: `check-selfassessment.mjs` → exit 0, `mismatches 0`; `check-gate-mutants.mjs` → exit 0,
27 killed, 0 survivors, 0 benign killed (both frozen digests match); `check-frontier-admission.mjs`
(offline) → exit 0, population 2, admitted 2. The four lines above are `superseded: true` in that
commit, so the appended-corrections mechanism is what restored 0 — confirming the simulated reading.
**Correction restores 0:** during measurement, the lane worktree carried an uncommitted draft
(SCORECARD.md +7, SKILL.md +2 — observed, not authored by me) appending a "Round 30 — corrections"
block restating 10/10 and 29/29. Copying that draft into the C1-simulated clone and re-running:
`EXIT=0, mismatches 0`, with the four lines `superseded: true` and the new lines 1507/1508
(claimed 10/29 = observed 10/29). That draft is now committed as `38891ca` (see Addendum above).

**Committed tallies that state the pre-C1 counts (full census):**

| Doc:line | Statement | Scanned by check-selfassessment? |
|---|---|---|
| `SCORECARD.md:1438` | s106 selftest "5 cases at baseline" | yes — flagged after C1 |
| `SCORECARD.md:1466` | s106 selftest "(7/7)" (correction line) | yes — flagged after C1 |
| `SCORECARD.md:1479` | s106 `cases=7 passed=7` | yes — flagged after C1 |
| `SCORECARD.md:1485` | pins "runs `cases=20` (registry row in SKILL.md round 29)" | yes — flagged after C1 |
| `SKILL.md:2514` | s106 `--selftest` (cases=5, passed=5) | no (SKILL.md not scanned) — already stale at freeze (oracle 7) |
| `SKILL.md:2529` | s106 "7 cases in CASES (not run at round-28 tip)" | no — becomes stale after C1 |
| `SKILL.md:2543` | pins `--selftest` (cases=20, passed=20) | no — becomes stale after C1 |
| `SKILL.md:2544` | s106 `--selftest` (cases=7, passed=7) | no — becomes stale after C1 |
| `LOG.md` | no s106/release-pins selftest tally exists (grep) | n/a |

## 5. Integration gaps found (C2) + full-predicate proof

Applying every w1 C2 patch (usedby, S117 diff, S116 receipt, S117 receipt, S116 entry, README row)
to a clean freeze clone and committing (including a lesson carrying both receipt quotes verbatim)
gives the C2 counter at the composed rev:

- **C1 counter on the C2-only clone:** exit 1, `fault_survivors 14` (the baseline reading) — C2
  landing changes nothing for C1.
- **C2 counter on the C2-only clone:** `population 2, admitted 1`, S116 fails `r1-row-missing
  S116` — **no w1 seat patches the S116 registry row** (ScribeRows and ScribeEntryRateLimitFields
  only draft it; the only SOURCES.md patches are used-by cells + the S117 row).
- After composing the two missing pieces (S116 row appended after S115 from
  `sources-row-s116.md` verbatim; `refetch/S116.json` by seat `ConnSeparability` over a fresh
  byte-identical `-11` fetch, sha256 `d6016dd0…`, 67,097 B, HTTP 200):
  - `node scripts/check-frontier-admission.mjs --rev HEAD --repo <clone3> --frontier rate-tos-signal --since 2026-10-26 --json` → **exit 0, population 2, admitted 2, failing 0, clean true**;
  - same with `--live` → **exit 0, population 2, admitted 2** (live fetch of the `-11` archive and
    the Discord page, both read-only HTTPS GETs).
- **C1 counter on the full C1+C2 clone** (C1 patches + all C2 pieces): **exit 0,
  `fault_total 27, fault_killed 27, fault_survivors 0, benign_total 13, benign_killed 0, clean true`**
  with both frozen digests matching `claims.json frozenDigests`.

So the wave's own artifacts are sufficient for C1; C2 additionally needs the L1 to (a) commit the
S116 row (seat-drafted) and (b) write the S116 refetch by a seat ≠ FetchS159 with its own committed
bytes (currently absent — every S116-touching seat correctly refused; SentinelFetchScope's fetch is
a g7-shaped note, not a committed record), plus the lesson Gate assembly.

## 6. Commands and exit codes (verbatim)

```
# baseline calibration (freeze) — EXIT 0
TMPDIR=$S/tmp node scripts/check-selfassessment.mjs --rev HEAD --repo "$S/clone" --json
  → mismatches 0, clean true

# C1 simulation: apply real seat patches on a clean freeze clone (clone2)
git -C "$S/clone2" checkout -q 061e62024c0523d3c6c7e819506a773ff2cd7d75
git -C "$S/clone2" apply $W/ExecS106Cases/s106-cases.patch            → EXIT 0
git -C "$S/clone2" apply $W/ExecPinsCasesB/combined-A-plus-B.patch    → EXIT 0
node scripts/check-s106-evidence.mjs --selftest                       → EXIT 0 (10/10)
node scripts/check-release-pins.mjs --selftest                        → EXIT 0 (29/29)
git -C "$S/clone2" -c user.name=ConnSeparability -c user.email=ConnSeparability@scratch.local commit -q -am …
  → d38d017eb8e78f5000ccf7f51775ac76175dc55b

# after C1 — EXIT 1, mismatches 4 (SCORECARD.md:1438,1466,1479,1485)
TMPDIR=$S/tmp node scripts/check-selfassessment.mjs --rev HEAD --repo "$S/clone2" --json

# corrections draft (copied from lane worktree, uncommitted) — EXIT 0, mismatches 0
# C1 counter on C1 clone — EXIT 0, survivors 0, benign_killed 0
TMPDIR=$S/tmp node scripts/check-gate-mutants.mjs --rev HEAD --repo "$S/clone2" --work "$S/work2" --json

# C2 patch stack on freeze clone (clone3): usedby → S117 diff → S116 receipt → S117 receipt →
# S116 entry → README row — all EXIT 0; both SOURCES apply orders verified on a clean tree.
# C2 counter on C2-only clone — EXIT 1: population 2, admitted 1, r1-row-missing S116
# Compose S116 row + refetch (see §5); C2 offline — EXIT 0, 2/2; C2 --live — EXIT 0, 2/2
# C1 counter on full C1+C2 clone — EXIT 0: 27 killed, 0 survivors, 0 benign killed, clean
```

Network (this seat): one read-only HTTPS GET of
`https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-11.txt` — 2026-10-26T07:06:42Z,
HTTP 200, 67,097 bytes, sha256 `d6016dd0db5a33ba3f1e6b6f4c84e9b5ecc00986822d5212bab831f6c2d1d412`
(byte-identical to the FetchS159 receipt; used for the simulated S116 refetch). The `--live` C2 run
fetched the same URL and `https://docs.discord.com/developers/topics/rate-limits` through the frozen
counter (read-only GETs, no credentials).

## 7. Receipts (output dir `.ufo/waves/round-30/w1/ConnSeparability/`)

| file | sha256 | reading |
|---|---|---|
| `selfassessment-baseline.json` | `020118eda5fe893326bbc784bb1ad10bceaf2914b6ba963b4110e5749fd997b6` | freeze: mismatches 0, exit 0 |
| `selfassessment-after-c1.json` | `c932f6dc49bd46998b2d9d8dfad0563f51cd5cf9da6f707ebe2c8c87ddc47851` | after C1: mismatches 4 (1438/1466/1479/1485) |
| `selfassessment-after-corrections.json` | `9cac67116ea22e3fa7ab4a168bbdea46701564a75ac601c041edf3ad63ef7a17` | with drafted corrections: mismatches 0 |
| `gate-mutants-after-c1.json` | `9e5d2ca5a323c6f78f4122315c42773a7426a05548b4bea4c87cf1b4742ac7d3` | C1 counter at C1-only clone: 0 survivors, exit 0 |
| `gate-mutants-full.json` | `49179720859c7673e5e2b4474895bea40c364963789900d5607b4625292fafde` | C1 counter at full C1+C2 clone: 0 survivors, exit 0 |
| `c2-offline-full.json` | `7ec59bfabe179d9250bb278882dad2d7719ee67b4eb89dfc26efebecd3393f48` | C2 offline at C2-only clone: 2/1, r1-row-missing S116 |
| `c2-offline-composed.json` | `a069a366e334ba5f34917c01a34ca86bbb67d16037639507165362c502e46eae` | C2 offline composed: 2/2, exit 0 |
| `c2-live-composed.json` | `cedf016818a0cd93d016d63ab3e65a1a6f2adde130617114638ab9bb8d51bfcb` | C2 live composed: 2/2, exit 0 |
| `selfassessment-38891ca.json` | `c435462ff26f56eb5f23afd50bdcfbd6dbc21fc8d6deba683b2bec623680958b` | integrated commit 38891ca: mismatches 0, exit 0 |
| `gate-mutants-38891ca.json` | `a61b18e7e7a4826245d83920880921a9eba0bd085b55c1fb4845e2e19d756718` | integrated commit 38891ca: 0 survivors, 0 benign killed, exit 0 |
| `c2-offline-38891ca.json` | `66aaddecd372a81b86cf9c8742bcc3f4f1d54da6da1f621e634f2188623efbeb` | integrated commit 38891ca: population 2, admitted 2, exit 0 |

Scratch `/fast/scratch/hyaku/tabi-r30/ConnSeparability/` removed after the receipts above were copied;
the lane tree was never modified (only `.ufo/waves/round-30/w1/` untracked wave files exist, incl.
this report and the output dir).
