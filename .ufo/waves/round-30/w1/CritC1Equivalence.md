# Round 30 w1 — CritC1Equivalence: are the 14 C1 survivors killable at all?

**Verdict.** All fourteen catalogue mutants listed in `.ufo/waves/round-30/claims.json` `C1.before`
are **non-equivalent** and killable: for each one I built a minimal fixture repo plus receipt in
scratch on which the pristine gate (bytes at `061e62024c0523d3c6c7e819506a773ff2cd7d75`) and a
one-site mutant copy give different exit or field results in production mode (`--repo/--rev`), then
went further and showed the frozen counter reaches the claim's target from CASES/fixtures alone:
`fault_survivors 0`, `benign_killed 0`, counter exit 0, with both gates' pristine self-tests clean
(s106 10/10, release-pins 29/29). No survivor is equivalent, so the frozen target is **not**
unreachable. Two integration facts the executor must respect, both verified: (a) `pins-f3-bytes-absent`
is killable only through a *crash* (uncaught `ERR_INVALID_ARG_TYPE` on a null blob) rather than a clean
verdict flip — the frozen counter counts a crash as a kill, so this is a valid kill, but it is the one
kill that does not read as "the self-test sees a wrong field"; (b) the CASES additions raise two
self-test tallies (s106 7→10, release-pins 20→29), which makes `check-selfassessment.mjs` report
`mismatches = 4` against `SCORECARD.md:1438,1466,1479,1485` until one append-only correction block
restates 10 and 29 — appending that block was verified to restore `mismatches = 0`.

No lane file was edited; every run happened in my scratch clone at the freeze commit and my
scratch fixture repos. I made no claims, ran no builds, touched no sibling lane, and installed no tools.

## Evidence

Freeze reading (the "before" reproduces exactly):

```
TMPDIR=$S/tmp node clone/scripts/check-gate-mutants.mjs --rev HEAD --repo "$S/clone" --work "$S/work" --json
exit 1 → fault_total 27, fault_survivors 14, benign_total 13, benign_killed 0
sha256sum scripts/check-gate-mutants.mjs scripts/gate-mutants.json
02945f88…3a55  cd1c27a2…3833        (== frozenDigests; clone status --porcelain empty)
```

Per-mutant probe — `python3 "$S/harness.py"`, exit 0, `ALL: True`. For each mutant the harness
commits a fixture repo, writes the mutant as a copy of the pristine gate with the catalogue
`find→replace` applied exactly once (asserted count 1), and runs
`node <gate> --repo <fixture> --rev HEAD [--stable 156.0.8078.47] --json` twice. Receipts:
`w1/CritC1Equivalence/distinguishability/results.json` plus `pristine.json` / `mutant.json` per mutant;
fixture trees (registry, receipt, bytes) under `w1/CritC1Equivalence/fixtures/<mutant>/`.

| mutant | fixture that distinguishes it | pristine → mutant |
|---|---|---|
| `s106-sha-drop` | measured commit holds base bytes (sha B, len L); HEAD holds base with `// tail`→`// taiL` (same length): sha_match false, byte_count_match true, anchor located+unique, revision_match true | exit 1 `valid:false` → exit 0 `valid:true` |
| `s106-anchor-unique-drop` | HEAD holds a second copy of the anchor line before `// tail` (receipt sha/bytes recomputed, `measured_rev` = the commit holding that text): occurrences 2, every other term true | exit 1 `valid:false` → exit 0 `valid:true` |
| `s106-anchor-unique-true` | same duplicate-anchor repo | exit 1 `valid:false, anchor_unique:false` → exit 0 `valid:true, anchor_unique:true` |
| `s106-byte-count-drop` | measured = base; receipt `decoded_bytes = L+1`, sha still the true one | exit 1 `valid:false` → exit 0 `valid:true` |
| `s106-byte-count-true` | same off-by-one receipt | exit 1 `valid:false, byte_count_match:false` → exit 0 `valid:true, byte_count_match:true` |
| `pins-f1-old-tag` | population row tagged `150.0.0.1`; file entry `old_tag` = `154.0.8037.97` bound only through the anchor's basename | exit 1 `unresolved:1` → exit 0 `unresolved:0` |
| `pins-f2-path-traversal` | `path = "content/feature..cc"` (a literal `..` inside one component), named in the row's source cell | exit 1 `unresolved:1` → exit 0 `unresolved:0` |
| `pins-f3-bytes-absent` | file entry whose old bytes were never committed (new bytes present) | exit 1 `unresolved:1` (reason `f3-bytes absent`) → exit 1, **no JSON**: `sha256(null)` throws `ERR_INVALID_ARG_TYPE` |
| `pins-f4-range-bounds` | `ranges [[0,1]]`, anchor carries token `0-1` (only the lower-bound guard fires) | exit 1 `unresolved:1` → exit 0 `unresolved:0` (empty slice reads as "holds") |
| `pins-f4-anchor-token` | `ranges [[3,4]]`, anchor names the file but carries no `3-4` token | exit 1 `unresolved:1` → exit 0 `unresolved:0` (block is present) |
| `pins-s1-supersession-prefix` | drifted S001, `superseded_by S002`, S002 teaches `replaces S001 — …` and carries `refs/tags/156.0.8078.47/` | exit 1 `unresolved:1` → exit 0 `unresolved:0` |
| `pins-s1-supersession-tag` | same drift, S002 teaches `supersedes S001 — …` but its source cell carries no `refs/tags` (no tags ⇒ not in population) | exit 1 `unresolved:1` → exit 0 `unresolved:0` |
| `pins-notfound-status` | old_status 404, new_status 200, new body contains `NOT_FOUND` | exit 1 `unresolved:1` (drifted, unsuperseded) → exit 0 `unresolved:0` |
| `pins-notfound-body` | old_status 404, new_status 404, new body `gone\n` with no `NOT_FOUND` | exit 1 `unresolved:1` → exit 0 `unresolved:0` |

Every recipe is expressible with the gates' own fixture helpers (`fixtureReceipt`/`d.bytes`/`d.commit`;
`regLine`/`fileEntry`/`receiptOf`/`d.receipt`), so a CASES/fixture-only change suffices — the catalogued
check lines stay untouched.

Reachability probe (CASES only, scratch clone `clone2`, patch `probe-cases-only.patch`,
sha256 `8807a112…5f82`):

```
3 s106 cases (sha-mismatch-same-length-invalid, anchor-not-unique-invalid,
byte-count-mismatch-invalid) + 9 release-pin cases
node clone2/scripts/check-s106-evidence.mjs  --selftest --json   → exit 0, cases 10 passed 10
node clone2/scripts/check-release-pins.mjs   --selftest --json   → exit 0, cases 29 passed 29
TMPDIR=$S/tmp node clone/scripts/check-gate-mutants.mjs --rev HEAD --repo "$S/clone2" --work "$S/work2" --json
→ exit 0: fault_total 27, fault_killed 27, fault_survivors 0, benign_total 13, benign_killed 0
```

Byte-identity and identity guards: the diff is **54 insertions, 0 deletions**, all inside `const CASES = [`;
each of the 40 catalogue `find` strings still occurs exactly once in both pristine and modified gate
bytes; `clone2/scripts/gate-mutants.json` and `check-gate-mutants.mjs` still hash to the frozen digests;
the two gates' production readings on the real lane revision are byte-identical before and after the
case additions (s106 `valid:true`, release-pins JSON diff empty).

Doc-bound tally (no-harm surface) and its smallest correction — patch `probe-cases-and-corrections.patch`,
sha256 `4efdda51…03d9`:

```
check-selfassessment --repo <clone2> --rev 4c490ec… → exit 1, mismatches 4
  SCORECARD.md:1438 claimed 5 observed 10; :1466 claimed 7 observed 10; :1479 claimed 7 observed 10;
  SCORECARD.md:1485 claimed 20 observed 29
append “## Round 30 — corrections” naming those four lines and restating 10/10 and 29/29
check-selfassessment --repo <clone2> --rev 72adbba… → exit 0, mismatches 0 (all four superseded)
counter --repo <clone2> --rev HEAD → exit 0, 27 killed / 0 benign killed, pristine 10/10 and 29/29
```

One measurement caveat worth recording: an earlier `check-selfassessment` invocation with a **relative**
`--repo` reported could-not-evaluate ("self-test printed no tally") for these gates; the four-mismatch
reading above is the absolute-path run and is the one cited.

## Impacted axes

- **operability (C1, the claim axis)** — every survivor is killable; target reachable at 0/0.
- **calibration (not claimed)** — the same change moves two doc-bound tallies, so the round must carry the
  one correction block or `check-selfassessment` goes red; measured 4 → 0.
- nothing else touched: counters and catalogue bytes unchanged, s106 and release-pin production
  readings unchanged on the lane revision, no corpus/registry edits.

## Smallest safe correction

1. Append the three s106 cases and nine release-pin cases from `probe-cases-only.patch` (CASES region only;
   no check line, constant or runner touched).
2. Append one `## Round 30 — corrections` block to `SCORECARD.md` restating `check-s106-evidence.mjs`
   `--selftest` (10/10) against `SCORECARD.md:1438,1466,1479` and `check-release-pins.mjs` `--selftest`
   (29/29) against `SCORECARD.md:1485` (from `probe-cases-and-corrections.patch`).

Both patches are probe evidence produced by this seat, not an integration request: the L1/executor owns
the change and the measurement at the tip. Scratch clones and fixture temp trees were removed after the
receipts were copied here.
