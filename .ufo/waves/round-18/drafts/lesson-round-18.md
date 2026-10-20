# Round 18 — source rechecks, harness hazards closed in code, round-17 routed defects

Steered round 18, attempt [TBD: integrator], 2026-10-20 (hyaku phase 2). Baseline B
`2bff864fdfee684ddbcd066cc8e735adaba2735c` (census rows 57, `.ufo/waves/round-18/PLAN.md:6-7`). Measured
revision M17 `93bfead1f5f25f584353df3152a60209bbd89a2e`. Round-18 revision REV = [TBD: `git rev-parse --verify
refs/heads/master` at close]. Claims (PLAN `## Claims`, :15-45): C1 freshness 8 → source rows rechecked 0 → 51;
C2 operability 8 → harness/witness hazards closed 0 → 6; C3 calibration 9 → round-17 routed defects closed 0 → 5.
Scalars at B: depth 8, coverage 9, operability 8, freshness 8, calibration 9, adjacency 8 (PLAN:9-10). This
draft moves no scalar and makes no exploratory claim. Values marked TBD are filled by the integrator from counter
output at REV; none is measured in this draft.

## Gate

Author-side admission criteria (an unrun check has not passed):

- **C1 — admit only if** `node .ufo/waves/round-18/measure-c1.mjs REV` prints `c1_rows_rechecked` = 51 (57 rows at B,
  `git show 2bff864:corpus/SOURCES.md` → 57, minus the six superseded at B: S004, S039, S047, S049, S050, S053;
  PLAN:15-17) and every counted receipt meets the C1 contract (PLAN:67-77): schema `tabi-source-recheck-v1`;
  `quoteWords` ≤ 25 and equal to the quote's word count; `excerptSha256` = sha256 of the excerpt bytes;
  `producerSha256` = sha256 of `recheck-fetch.mjs` at REV; `fetchedAt` 2026-10-20; a drift verdict only with a REV
  row whose `teaches` starts `supersedes <row> —`. Receipts come only from `recheck-fetch.mjs` (PLAN:18-19).
  `--live` results are reported as `live_held` and do not change the count (PLAN:76-77).
- **C2 — admit only if** `node .ufo/waves/round-18/measure-c2.mjs REV` prints `c2_hazards_closed` = 6 and the same
  probes print 0 at B (sandbox clones; PLAN:79-89): h1 SIGTERM → exit 2, no `verdict=` receipt, no surviving browser
  pid; h2 TMPDIR empty after an aborted and a normal run; h3 no `--remote-debugging-port` in browser argv and no
  `DevToolsActivePort` in the profile dirs; h4 `invoke-download-refused` passed, no downloaded bytes under TMPDIR;
  s1 exactly one `--enable-features=` and at most one `--disable-features=` per launch; f6 `--rev HEAD` refused
  (exit 2) and `--dry-run` prints the `refs/heads/master` 40-hex while HEAD is detached on a poison commit. Artifacts:
  `scripts/webmcp-invoke-round18.mjs` and `scripts/freshness-witness.mjs`, both absent at B (red at B).
- **C3 — admit only if** `node .ufo/waves/round-18/measure-c3.mjs REV` prints `c3_routed_closed` = 5 with d1–d5 each
  passing (PLAN:93-101): d1 `## Corrections` line cites `corpus/lessons/round-17.md:116` and states 6 (see
  §Corrections); d2 harm receipt `revision` = 93bfead full hex, the 20 gate names of
  `.ufo/waves/round-17/harm-baseline.json`, each entry with exit and two 64-hex sha256 values; d3 self-test receipt
  exit 0, stdout `cases=57`, producer sha256 = `git show 93bfead:scripts/check-adjacency.mjs | sha256sum`; d4 S058
  exists with `teaches` starting `supersedes S057 —` and no S058 cell containing `individual publisher`; d5 ≥ 7
  rerun receipts, each with producer sha256 `de62820dd35e5cf7804b656ef3fe1678da8a15bdf4248c8b7fa737f878b052d7`, a
  full 64-hex receipt digest matching the committed bytes, and a recorded verdict.

Rejected (no round-18 rejection ledger exists yet; carried from the round-17 Gate, `corpus/lessons/round-17.md:31-38`,
and the PLAN byte-frozen list, PLAN:51-58):

- Any edit to a byte-frozen path: `scripts/check-freshness.mjs` (including a code fix for `--witness HEAD`),
  `PROVINCE.md`, `SHONEN.md`, `scripts/webmcp-invoke-round17.mjs`, every `corpus/lessons/round-<N>.md` existing at B
  (the correction lands in `round-18.md`, not in `round-17.md`), and every `scripts/check-*.mjs`.
- Receipts not produced by their named producer (`recheck-fetch.mjs`; the round-17 harness rerun; `check-adjacency.mjs
  --self-test`), and hand-written or pasted digests (PLAN:19, :99-101).
- Scalar moves beyond the three claims. Operability 8→9 and adjacency 8→9 were rejected in round 17
  (`round-17.md:31`) and are not claimed here.
- Coverage 9→10 (real-site, agent-side, Chromium 152, default profile; `round-17.md:33`) — not claimed.
- Closing the fleet L0 questions (`.ufo/l0-questions.md:62`, `:65`); tabi absorbs neither (`round-17.md:120`).
- Calling a probe or counter "unforgeable" or "tamper-proof" (`round-17.md:99`, Mistake 5).

## Corrections

**D1 — sibling count is 6, not 7.** `corpus/lessons/round-17.md:116` reads "Map: 10 rows, 7 siblings." The map has
10 data rows and 6 distinct siblings (kagi, kaidoku, kake, kama, kumitate, revenger). Command and output, run at
93bfead (identical at `refs/heads/master`):

```
$ git show 93bfead:corpus/adjacency.tsv | cut -f2 | tail -n +2 | sort | uniq -c
      2 kagi
      2 kaidoku
      2 kake
      1 kama
      1 kumitate
      2 revenger
$ git show 93bfead:corpus/adjacency.tsv | cut -f2 | tail -n +2 | sort -u | wc -l
6
$ git show 93bfead:corpus/adjacency.tsv | tail -n +2 | wc -l
10
$ git rev-parse 93bfead:corpus/adjacency.tsv        # blob
098aa6adc5678d52a32653f38329dc3eae0a52ef
$ git show 93bfead:corpus/adjacency.tsv | sha256sum
a099b7137270e917665c78b12875ab4a8081cd9cc0601d7ee97cd4b552375b0c  -
```

`corpus/lessons/round-17.md` is absent at 93bfead (`git show` fails), so the "7" was written after the measured
revision and was never counted against it. Spot-check `corpus/lessons/round-17-verifier-spotcheck.md:83-84`
confirms the count of 6 independently.

**Report `:35` — not re-read here.** The spot-check (`:159`) also cites round-17 report `:35` for "7 siblings".
`.ufo/reports/round-17/tabi.md` is absent from the lane working tree and from `refs/heads/master`, and commit
`af41737b8faafab6d392c898dacc88f3be0ebcd1` (cited at spot-check `:31`) is not in this clone. That line's correction
is left to the report owner; this draft does not claim it verified.

## Mistakes

| # | Class | Evidence pointer | Captured-by | Fix (shown able to fail) |
|---|---|---|---|---|

Rows are added at close from the integrator's measurements; none is recorded in this draft.

## Routed defects from the round-17 spot-check

Source: `corpus/lessons/round-17-verifier-spotcheck.md:159-163` (non-author spot-check, closure `:3-9`). Each closure
pointer below matches PLAN C3 (:37-45) and counters d1–d5 (:93-101). None is closed until REV.

1. **Sibling count "7".** Corrected in §Corrections D1. Closure: `corpus/lessons/round-18.md` `## Corrections`; counter d1.
2. **20-gate harm set measured at `6c97851`, not `93bfead`** (`w2/HarmAfter.md:3,20`). Closure:
   `corpus/evidence/round-18/routed/harm-at-93bfead.json`; counter d2.
3. **Self-test evidenced only by a wave report line** (`.ufo/waves/round-17/w1/C3Checker.md:103`, `cases=57`). The
   same report's `:101` records checker sha256
   `4e2c2a64b9eae9c10b9e92022e9b33661bba8e3b45b149e6354ecc9592324aac`; recomputed here from
   `git show 93bfead:scripts/check-adjacency.mjs | sha256sum` (same value).
   Closure: `corpus/evidence/round-18/routed/adjacency-selftest.json`; counter d3.
4. **S057 carries "individual publisher".** `git grep -n "individual publisher" refs/heads/master -- corpus/SOURCES.md`
   matches `:67` (S053) and `:71` (S057). Closure: new row S058 `supersedes S057 —`; S057 is not edited in place
   (SOURCES is append-only, PLAN:57-58); counter d4.
5. **Seven reruns recorded with abbreviated digests** (`w2/ReRunHarness.md:28-33,113-118`). Closure:
   `corpus/evidence/round-18/routed/harness-reruns/` with full 64-hex digests; counter d5.

Open, not routed (carried): L0 `.ufo/l0-questions.md:62` and `:65` (operator rulings); `check-freshness --witness HEAD`
remains a code-level hazard enforced only by SKILL text (spot-check `:165`).

## Adjacency

Map at 93bfead: 10 data rows, 6 distinct siblings (see D1). Dispositions, verified with
`git show 93bfead:corpus/adjacency.tsv | cut -f7 | tail -n +2 | sort | uniq -c`: contested-open 4, refused-route 3,
ruled 1, split-declared 2. Round-17 counts match (spot-check `:81-82`).

Known overlaps left undispositioned (carried from `corpus/lessons/round-17.md:116-120`, not re-verified in this draft):
kaidoku `PROVINCE.md:128` (verbs; same surface as row 1); kagi `corpus/adjacency.tsv:83` [unresolved pointer: the
file has 11 lines at 93bfead; the target must be re-cited]; lore and tameshi routes (wave scratch only); game-dev-3d
roster mention; kasegi operator-gated CDP submissions. Fleet L0 lines 62 (musketeer lease) and 65 (ruling reach to
revenger and kama) are open; tabi absorbs neither.

## Seats

Wave 1: 70 seats dispatched (`.ufo/waves/round-18/w1/assignments.json`, 70 keys; role counts from
`.ufo/waves/round-18/w1/validation.json` `"agent"` fields: scout 36, executor 12, reviewer 6, scribe 7, connector 5,
critic 2, revenger 1, sentinel 1 = 70). Dispatch outcome and dead-seat list: TBD at wave close. Wave 2: TBD.
