# ExecCompleteness — tabi r36 (attempt 2), w2 FALSIFY — C1 completeness leg at the wave-1 landing

**Attacks:** the C1 counting command's *completeness leg* as it reads **after** the wave-1 landing
`f2f3f14555ec1db6d8c3a6dc9e4059ef9489b8c7` (S125 `on-release` cell + four companions; S142 registry row +
`corpus/knowledge/adjacency-drift-audit-r36.md`). Question: does the frozen counter still read
`predicate true, candidates 383, unaccounted 0, drift.total 307, auditCoverage 307, auditFindings 0, delta.total 0`
at that rev, measured in a clean clone from the freeze bytes — or did the landing move the meter?

## 1. Frozen inputs (integrity before any reading)

| input | value | frozen digest | match |
|---|---|---|---|
| counter `c1-adjacency-sweep-v4.mjs` (extracted with `git show 2e7b7a89…:.ufo/waves/round-36/counters/c1-adjacency-sweep-v4.mjs`) | `8a223faf5e109fc05dac1373a4a4979b65f9ec2ffef40f86ae9bf40ba1aad385` | `8a223faf…aad385` | ✓ |
| `measure.sh` | `6a652aca6a487ae4459c986243befc09412924d3a41945eb3c446f4adff35afa` | `6a652aca…35afa` | ✓ |
| `scripts/check-adjacency.mjs` at REV | `4e2c2a64b9eae9c10b9e92022e9b33661bba8e3b45b149e6354ecc9592324aac` | `4e2c2a64…324aac` | ✓ (also echoed by the run as `adjGateSha256`) |

Clone: `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin $S/c` → `git -C $S/c checkout --detach f2f3f14…`.
`git -C $S/c rev-parse --show-toplevel` printed `$S/c` (asserted) and `rev-parse HEAD` printed
`f2f3f14555ec1db6d8c3a6dc9e4059ef9489b8c7` before the first counter call. Worktree `status --porcelain` = 0 lines
before **and** after all runs (the counter writes only under `$TMPDIR`, which it empties: `$S/tmp` had 0 entries
after the runs). No commit, no mutation of any git object; all git calls against the lane and the 20 siblings were
read-only (`show`, `ls-tree`, `cat-file -e`, `rev-parse`, `diff --name-only`, `status`).

Provenance: `node v24.21.0`, `git 2.56.0`. No tool installed or upgraded this seat (nothing needed).

## 2. The claim's counting command, re-run at the landing

```
TMPDIR=$S/tmp node $S/c1.mjs --rev f2f3f14555ec1db6d8c3a6dc9e4059ef9489b8c7 \
     --repo $S/c --fleet /home/vgpnk/Projects/shokunin --json
```

**exit 0**, stderr 0 bytes. Raw JSON committed as `run-tip.json`
(sha256 `9ad9f6602733efd66dda62e991d0bab424428a79d88476ef31d81834a026314f`):

```json
{
 "schema": "tabi-r36-c1-adjacency-sweep-v4",
 "rev": "f2f3f14555ec1db6d8c3a6dc9e4059ef9489b8c7",
 "baseline": "11c64b96f357de106c30a71c5e21ca44a3eacdc0",
 "adjGateSha256": "4e2c2a64b9eae9c10b9e92022e9b33661bba8e3b45b149e6354ecc9592324aac",
 "adjacency": { "verdict": "clean", "rows": 16, "verified": 16, "findings": 0 },
 "completeness": {
  "candidates": 383, "priorCandidatesSkipped": 22, "mapped": 0, "screened": 383,
  "unaccounted": 0, "newMapped": 0, "newMappedRows": [], "newRowRefusals": [],
  "screenFindings": [], "unaccountedKeys": []
 },
 "drift": {
  "pins": {
   "audio": "7a2fcd4f08831154686e4e323031f41fffdb077f",
   "chousa": "f9736a39a0344a0aed63a65dfaddf7db624303d9",
   "game-dev-2d": "7753d49b16674e122ed134403e7a9b301f2cbf7e",
   "game-dev-3d": "89dd182b70943a20ae9aa6c1ed0e3c9b6e79c080",
   "kagi": "69b61db46be4ed955994f6f1d1cba522bc5f4e97",
   "kaidoku": "1ed29de2cdd6061315fb2f5478d5029b7d570675",
   "kake": "437f53b1f6cd22dbf307f1187f41d1c0850a1ac2",
   "kama": "3a600d2f729828419aaea34cc402c8b0d20fb720",
   "kasegi": "96dbd5f4276fcf8f93552fb97554485904cc0488",
   "kengaku": "0f77f9b27931b3c76b3d095fc0fa70edb79556d9",
   "kotoba": "65a5c7a663249e0522cc49e4a148424200d9ddfe",
   "kotodama": "f556d1049fe651d3d63975600b13acd9fb686f15",
   "kumitate": "d23892ad44b41e1af63b3edb949d265ca1dd812d",
   "lore": "380ef3abc7c7af11d7f23e9f9c82bb1937e1f695",
   "mado": "b4a79843cc2545bbe800db9322e58f6e00436629",
   "mori": "5b295eeebd87ebd610d8d39bfe2035742f740cfa",
   "revenger": "b7abcd875c84f4e1d6c8df966b6bd20f4154c53f",
   "souji": "9c76c7222a8abff027af42e37f0d160d52526bba",
   "tameshi": "6db1d220b337c35ff1e25bf9cfd74abc9db1498d",
   "tsukuroi": "3629c46a0e787121f1e1d4ccb53bc830e4a7633f"
  },
  "lanesWithDrift": ["chousa","kaidoku","kake","kama","kasegi","kengaku","kumitate","mado","mori","revenger","tameshi","tsukuroi"],
  "total": 307,
  "observed": { "unchanged": 304, "moved": 3, "stale": 0 },
  "auditCoverage": 307,
  "auditFindings": [], "auditMissing": [], "staleFindings": []
 },
 "delta": { "total": 0, "screened": 0, "mapped": 0, "unaccounted": 0, "screenFindings": [], "unaccountedKeys": [] },
 "candidates": 383, "mapped": 0, "screened": 383, "unaccounted": 0, "newMapped": 0,
 "screenFindings": [], "predicate": true
}
```

Expected ↔ actual (machine-compared, `MATCH true`):

| value | expected | actual |
|---|---|---|
| `predicate` | true | true |
| `candidates` | 383 | 383 |
| `completeness.unaccounted` | 0 | 0 |
| `drift.total` | 307 | 307 |
| `drift.auditCoverage` | 307 | 307 |
| `drift.auditFindings` | 0 | 0 (`[]`) |
| `delta.total` | 0 | 0 |
| `delta.unaccounted` / `delta.screenFindings` | 0 / 0 | 0 / 0 (`[]`) |
| `drift.staleFindings` | 0 | 0 (`[]`) |
| `adjacency.verdict` | clean | clean (16/16 rows verified, 0 findings) |

The reading is **field-for-field equal to the frozen `c1-J5-honest-floor` control summary** in
`claims.json` (including `driftObserved 304/3/0`, `priorCandidatesSkipped 22`), and to the predicate sentence
in the claim file. Determinism: a second identical invocation produced a **byte-identical** JSON
(`run-tip-repeat.json`, same sha256 `9ad9f660…314f`).

## 3. The three list modes

| mode | exit | `wc -l` | stderr | expected |
|---|---|---|---|---|
| `--list-candidates` | 0 | **383** | 0 B | 383 ✓ |
| `--list-drift` | 0 | **307** | 0 B | 307 ✓ |
| `--list-delta` | 0 | **0** | 0 B | 0 ✓ |

Raw: `list-candidates.txt` (sorted sha256 `41145a23…b8ce`), `list-drift.txt` (sorted sha256
`7725cb2b…de69`), `list-delta.txt` (empty, `e3b0c442…b855`). Note `--list-drift`/`--list-delta` resolve the
delta pins at the **clone HEAD** (not `--rev`); the clone was detached at `f2f3f14…`, so both readings are the
landing's.

## 4. Independent recount (does 383/307/0 exist outside the counter?)

I re-implemented the enumeration in `recount.mjs`: it imports only the counter's own frozen `BG` regex and
parses `PINS` from the counter source, then does its own `ls-tree` + `show` walk of the 20 siblings, its own
line splitting, keying, dedupe and prior-pool subtraction (`recount.json`):

```
pins 20, deltaPins 20, driftedLanes 12 (same 12 names as the counter's lanesWithDrift)
priorPoolKeys 67, candidates 383, priorSkipped 22, pinLines 405, deltaPool 0
```

- `383 + 22 = 405 = pinLines` — every BG non-tabi line at the pins is either a candidate or a round-34 prior key;
  nothing is dropped or double-counted by construction, which matches the run's
  `candidates 383 / priorCandidatesSkipped 22 / unaccounted 0`.
- `--list-candidates` keys **diff-identical** to my independent 383 keys (`cmp` of both sorted → equal,
  sha256 `41145a23…b8ce`).
- `--list-delta` empty ↔ my independent delta pool 0 (no BG non-tabi line at any frozen delta head is absent
  from the pin lines).
- `--list-drift` equals, as a set, my independent filter (screen rows whose `ref` lane is one of the 12 drifted
  lanes): 307 lines, `cmp` of sorted → equal. Order differs only because the counter preserves screen-ledger
  order.
- Audit coverage checked from ledger bytes, not from the counter: `corpus/adjacency-screen-drift.tsv` at REV has
  307 data rows, **0 duplicate refs**, and its ref set is **set-identical** to the 307 drift refs
  (`audit-refs.txt` == `drift-refs-independent.txt`, sha256 `7725cb2b…de69`); its status column is
  `304 unchanged / 3 moved / 0 stale` = the counter's `drift.observed`. So `auditCoverage 307/307`,
  `auditFindings 0`, `auditMissing 0` are reproduced independently.

## 5. Post-landing invariance (why the landing cannot have moved the meter)

- `git -C $S/c diff --name-only 2e7b7a89… f2f3f14… -- corpus/adjacency.tsv corpus/adjacency-screen-browser.tsv
  corpus/adjacency-screen-drift.tsv corpus/adjacency-screen-delta.tsv .ufo/waves/round-36/baseline/
  .ufo/waves/round-36/counters/` → **empty**. The landing touched none of C1's input surfaces.
- sha256 of each C1 input, freeze vs landing: `adjacency-screen-drift.tsv` `bde87e24da7daace…` **SAME**;
  `adjacency-screen-browser.tsv` `f4fc43f0588dd027…` **SAME**; `adjacency.tsv` `7a16a2e663f3437b…` **SAME**;
  `baseline/c1-delta-pins.json` `810193620393f6e8…` **SAME** (= the frozen digest); `adjacency-screen-delta.tsv`
  absent at both.
- The candidate population is derived from the **siblings' pins**, not from the lane's own files, so a lane-only
  landing (S125 evidence, S142 row, `adjacency-drift-audit-r36.md`) has no path into `candidates`, `drift` or
  `delta` counts. The observed numbers then equal the pre-landing honest-floor control exactly (§2).
- **Lane tip note (not a finding):** the lane's actual HEAD is `1ee2ab1aaee3c29681d553c3a353d6ee5c4930f1`
  (`round-36: w2 dispatch spec/dispatch/registry/ready + gen-w2-spec.py`), i.e. two dispatch-only commits sit on
  top of `f2f3f14…`. Running the same command at `1ee2ab1…` gives an **identical summary (exit 0,
  `run-laneHEAD.json`)**, so the meter is invariant to the dispatch commits too. Also recorded for future seats:
  the counter refuses abbreviated revs — `--rev 1ee2ab1` → exit 2
  `C1_ADJACENCY_SWEEP_V4 verdict=could-not-evaluate detail=revision must be 40-hex: 1ee2ab1` (expected
  behaviour, not a defect).

## 6. Findings

**None on the completeness leg.** Every expected value matched, in a clean clone, from the freeze bytes, with
the gate digest pinned, deterministically, and with the population independently re-derived (383 / 405−22 /
307 / 307 unique audit refs / delta 0). Smallest correction required: none.

Two observations that demand no correction from this seat:

1. `corpus/adjacency-screen-delta.tsv` is **absent** at REV (and at the freeze), so its sha256 reads as the empty
   string (`e3b0c442…`). With `delta.total == 0` the counter treats absence as an empty ledger and the predicate
   still holds (control `c1-J4` shows a junk row in that file would fail), and the predicate sentence does not
   require the file to exist — but the claim's *surface* text names the ledger as if committed, so a header-only
   committed ledger would make the surface text literally true. Cosmetic; no unmet predicate clause.
2. `drift.pins` (delta heads) are read from `c1-delta-pins.json` at REV with **no digest binding** — this is w1
   CritC1's F1, and this re-run inherits it: my counts certify whatever heads that file names. It does not bite
   here because the file's bytes are unchanged from the freeze (`810193620393f6e8…` == frozen digest) and every
   head resolves; F1 stays queued as a round-37 counter amendment, not a new finding.

## 7. Limits of this seat / what I did not verify

- Drift-leg *correctness* (whether each `moved` note names a relocation line where the cited text verifies
  verbatim) was not re-derived here — that is the 16 w1 `AdjDrift` seats' + MutC1/CritC1 territory; I checked only
  set equality, duplicate-freedom and the status-class distribution against ledger bytes.
- The clone is `--shared` (objects shared with the lane repo, no fetch): the lane rev's objects are byte-identical
  to the lane's, and no sibling working tree is read by the counter (git objects at pins/heads only), so a dirty
  sibling worktree cannot influence the reading.
- Nothing was written outside my seat dir and my scratch root; the scratch root was deleted at the end. No
  sibling repo, fleet-root file, or lane file outside the seat dir was touched.

## Commands run (verbatim, in order)

```
git -C <lane> show 2e7b7a89…:.ufo/waves/round-36/counters/c1-adjacency-sweep-v4.mjs > $S/c1.mjs; sha256sum $S/c1.mjs
git -C <lane> show 2e7b7a89…:.ufo/waves/round-36/measure.sh > $S/measure.sh; sha256sum $S/measure.sh
TMPDIR=$S/tmp git clone --shared -q <lane> $S/c && git -C $S/c checkout --detach -q f2f3f14…
git -C $S/c rev-parse --show-toplevel; git -C $S/c rev-parse HEAD; sha256sum $S/c/scripts/check-adjacency.mjs
TMPDIR=$S/tmp node $S/c1.mjs --rev f2f3f14… --repo $S/c --fleet /home/vgpnk/Projects/shokunin --json   # exit 0
TMPDIR=$S/tmp node $S/c1.mjs --rev f2f3f14… --repo $S/c --fleet … --json                                # repeat, byte-identical
TMPDIR=$S/tmp node $S/c1.mjs --list-candidates --repo $S/c --fleet …   # 383 lines, exit 0
TMPDIR=$S/tmp node $S/c1.mjs --list-drift      --repo $S/c --fleet …   # 307 lines, exit 0
TMPDIR=$S/tmp node $S/c1.mjs --list-delta      --repo $S/c --fleet …   # 0 lines,   exit 0
TMPDIR=$S/tmp node $S/recount.mjs $S/c $S/out/recount-candidate-keys.txt                              # exit 0
TMPDIR=$S/tmp node $S/c1.mjs --rev 1ee2ab1aaee3c29681d553c3a353d6ee5c4930f1 --repo $S/c --fleet … --json  # exit 0, identical
git -C $S/c diff --name-only 2e7b7a89… f2f3f14… -- <C1 surfaces>            # empty
git -C $S/c show <rev>:corpus/adjacency-screen-drift.tsv | awk … | sort | uniq -d   # 0 duplicates
diff <(sort $S/out/drift-refs-independent.txt) <(sort $S/out/list-drift.txt)       # identical
```

Conclusion: the C1 completeness leg holds at the wave-1 landing. The frozen counter (digest-verified bytes) at
`f2f3f14555ec1db6d8c3a6dc9e4059ef9489b8c7` exits 0 with predicate true, candidates 383, unaccounted 0,
drift.total 307, auditCoverage 307, auditFindings 0, delta.total 0; list modes 383/307/0; the same numbers are
independently re-derivable (383 + 22 prior = 405 pin lines; 307 drift refs = 307 unique audit refs) and are
invariant to the landing and to the two post-landing dispatch commits. No finding.

VERDICT ok — C1 completeness re-run at f2f3f14555ec1db6d8c3a6dc9e4059ef9489b8c7: exit 0, predicate true, candidates 383, unaccounted 0, drift.total 307, auditCoverage 307, auditFindings 0, delta.total 0; --list-candidates/--list-drift/--list-delta = 383/307/0; reading identical to the frozen baseline and to c1-J5, independently re-derived; no finding.
