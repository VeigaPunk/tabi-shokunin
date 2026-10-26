# ExecPinsCasesB — C1 build (round-30 w1): release-pin self-test cases for survivors 6–9

Seat: `ExecPinsCasesB` (executor, leaf). Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Baseline `f7c0317e4f8445502005e79e3d65767430912dab`; work done in a `git clone --shared` checkout at
`061e62024c0523d3c6c7e819506a773ff2cd7d75` (freeze commit) under
`/fast/scratch/hyaku/tabi-r30/ExecPinsCasesB/`, removed at the end. No lane file, lane index, jj state,
fleet repo or `/home/vgpnk/Projects/shokuknow` was written. No network access was used. No tools
installed or upgraded (pre-existing `node v24.21.0`, `git 2.56.0`).

## Verdict

The four assigned release-pin fault mutants — `pins-s1-supersession-prefix`, `pins-s1-supersession-tag`,
`pins-notfound-status`, `pins-notfound-body` — are **killed** by four self-test cases appended to the
`CASES` array of `scripts/check-release-pins.mjs`, with every catalogued `find` line byte-identical
(34 insertions, 0 deletions; `evaluate()` untouched, production behaviour unchanged). In my clean clone
the frozen counter moves `fault_survivors 14 → 10` with `benign_killed` still 0: `fault_total 27 /
fault_killed 17 / fault_survivors 10 / benign_total 13 / benign_killed 0`. The ten remaining survivors are
exactly the other C1 seats' assignments (`s106-*` ×5, `pins-f1-old-tag`, `pins-f2-path-traversal`,
`pins-f3-bytes-absent`, `pins-f4-range-bounds`, `pins-f4-anchor-token`). Each of my four mutants reports
`failing_cases` equal to precisely the one new case written for it; those cases pass on pristine bytes
(release-pin self-test 24/24 clean); all 13 benign equivalents survive; and a probe of the gate's own
`reasons` array shows the new cases are unresolved on pristine bytes for `s1-drift-unsuperseded` alone —
no `f6-refetch`, `f2`, `f3`, `f4`, `f5` or `r1` reason appears — so the refetch record is not what masks
or manufactures the reading. Combined with `ExecPinsCasesA`'s patch in a scratch merge, the counter reads
`fault_killed 22 / fault_survivors 5 / benign_killed 0` (the five `s106` rows only), release-pin self-test
29/29 clean, so C1's release-pin half is complete once both patches land and the five `s106` rows are
covered by their seat. This seat does **not** close C1 by itself: its counter run exits 1 with ten
survivors.

## Delivered change

Patch: `.ufo/waves/round-30/w1/ExecPinsCasesB/pins-cases-b.patch`
(sha256 `15c3023398c8eb00d7db55653d3e4c643cbb0e7ff3629432f1cf84ca452dafaa`, 2938 bytes) — a pure append
of 34 lines immediately before the closing `];` of `CASES`. `git diff --stat 061e620…` →
`1 file changed, 34 insertions(+)`; `grep -c '^-[^-]'` on the patch → `0`; `git apply --check` on a fresh
checkout of `061e620…` → exit 0; full `git apply` of the delivered patch onto a second fresh
`061e620…` checkout → exit 0, file sha256 `8a1f9770…19b630` (identical to the scratch-HEAD blob) and
self-test 24/24 clean there. Patched file at the standalone commit `1ca5b57…`:
513 lines, sha256 `8a1f977046d08391de82f3ec0c8fc61af7dbdb7a02cc98eb8cca474ab519b630`.

Four new cases, appended contiguously, one comment line marking the block:

| Case id | Fixture | Pristine reading (measured) | Mutant it kills |
|---|---|---|---|
| `drift-superseder-teaches-without-prefix-unresolved` | S001 drifted (`NEW_DRIFT`); `superseded_by: S002`; S002 pinned at the **stable** tag but its `teaches` cell lacks `supersedes S001 —` | unresolved 1, verdict drifted, reason `s1-drift-unsuperseded` | `pins-s1-supersession-prefix` |
| `drift-superseder-not-at-stable-tag-unresolved` | S001 drifted; `superseded_by: S002`; S002 `teaches` carries the prefix but its source is pinned at the **old** tag (`recheck: 90d` keeps it out of the population) | unresolved 1, drifted, `s1-drift-unsuperseded` | `pins-s1-supersession-tag` |
| `absence-404-present-with-marker-unresolved` | old 404 → new **200**, new body still contains `NOT_FOUND`, `ranges: []` | unresolved 1, drifted, `s1-drift-unsuperseded` | `pins-notfound-status` |
| `absence-404-body-lacks-marker-unresolved` | old 404 → new **404**, body `<html><head><title>Error 404</title></head></html>` (no `NOT_FOUND`) | unresolved 1, drifted, `s1-drift-unsuperseded` | `pins-notfound-body` |

Each case also carries `reasons: ["s1-drift-unsuperseded"]`, the reason measured above. That field is
inert against unpatched `runSelftest` (unknown case fields are ignored, so the patch stands alone) and is
asserted once `ExecPinsCasesA`'s reason-pinning harness lands — measured clean in the combined run below.

Refetch consistency (the `f6` masking risk the assignment names): all four cases use the fixture's
derived refetch record, built from the same `f.new_status` / `f.new_sha256` the receipt carries, with
seat `W2-fixture` ≠ `fetched_by` `W1-fixture`. No case overrides `_refetch`, so `f6-refetch` passes in
every one and the fixture reaches the sub-condition under test — confirmed by the probe's empty reason
sets.

`f5-digest` is satisfied in the two 404 cases by putting the full 64-hex sha256 of the old (404) body in
the anchor cell, mirroring the existing `absence-404-holds` case; the two supersession cases use
`regLine`'s default abbreviated digest over `OLD_TEXT`.

## Evidence — commands and exit codes

```
$S = /fast/scratch/hyaku/tabi-r30/ExecPinsCasesB
$O = /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-30/w1/ExecPinsCasesB

git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"
git -C "$S/clone" checkout -q 061e62024c0523d3c6c7e819506a773ff2cd7d75   → exit 0, HEAD 061e620…

# BEFORE (frozen counter bytes, freeze commit, clean tree)
TMPDIR=$S/tmp node scripts/check-gate-mutants.mjs --rev 061e620… --repo "$S/clone" --work "$S/work-before" --json
  → EXIT=1  fault_total 27, fault_killed 13, fault_survivors 14, benign_total 13, benign_killed 0
  → survivors: s106-sha-drop, s106-anchor-unique-drop, s106-anchor-unique-true, s106-byte-count-drop,
    s106-byte-count-true, pins-f1-old-tag, pins-f2-path-traversal, pins-f3-bytes-absent,
    pins-f4-range-bounds, pins-f4-anchor-token, pins-s1-supersession-prefix, pins-s1-supersession-tag,
    pins-notfound-status, pins-notfound-body                                   (receipt: gate-mutants-before.json)

# pristine self-test and the claims' pins reading before the edit
TMPDIR=$S/tmp node scripts/check-release-pins.mjs --selftest   → EXIT=0, cases=20 passed=20
TMPDIR=$S/tmp node scripts/check-release-pins.mjs --rev HEAD --stable 156.0.8078.47
  → EXIT=0  clean population=23 resolved=23 unresolved=0 holds=16 drifted=7

# commit inside the seat's own clone only (toplevel verified == "$S/clone" before every git call)
git -C "$S/clone" -c user.name=ExecPinsCasesB -c user.email=ExecPinsCasesB@scratch.local commit -q -am …
  → 6a2ed96ce0d5bca866dff39e1c813aa426cc4960   (cases without reasons)
  → 1ca5b57db44cd45386a1af6dc9848a9a8d07b82c   (cases with reasons pinned; tree clean)

# AFTER (standalone patch)
TMPDIR=$S/tmp node scripts/check-release-pins.mjs --selftest   → EXIT=0, cases=24 passed=24
TMPDIR=$S/tmp node scripts/check-gate-mutants.mjs --rev HEAD --repo "$S/clone" --work "$S/work-after2" --json
  → EXIT=1  fault_total 27, fault_killed 17, fault_survivors 10, benign_total 13, benign_killed 0
  → survivors: s106-sha-drop, s106-anchor-unique-drop, s106-anchor-unique-true, s106-byte-count-drop,
    s106-byte-count-true, pins-f1-old-tag, pins-f2-path-traversal, pins-f3-bytes-absent,
    pins-f4-range-bounds, pins-f4-anchor-token                                  (receipt: gate-mutants-after.json)
  → pins-s1-supersession-prefix: killed, exit 3, failing_cases
      [drift-superseder-teaches-without-prefix-unresolved]
  → pins-s1-supersession-tag:    killed, exit 3, failing_cases
      [drift-superseder-not-at-stable-tag-unresolved]
  → pins-notfound-status:        killed, exit 3, failing_cases
      [absence-404-present-with-marker-unresolved]
  → pins-notfound-body:          killed, exit 3, failing_cases
      [absence-404-body-lacks-marker-unresolved]
  → benign_killed_ids: []
  → gates: (scripts/check-s106-evidence.mjs pristine_clean true cases 7 passed 7),
           (scripts/check-release-pins.mjs pristine_clean true cases 24 passed 24)
  → catalogue_sha256 cd1c27a2a971f8a4d4208fd53efe3adbc776efacb7072201af8bb55b93853833
      == claims.frozenDigests["scripts/gate-mutants.json"]
  → counter_sha256_at_rev 02945f882ea9c62a3f42934f13b4dc52887ebd93a5a69dd6526d20f01cec3a55
      == claims.frozenDigests["scripts/check-gate-mutants.mjs"]

# claims no-harm reading at the patched HEAD
TMPDIR=$S/tmp node scripts/check-release-pins.mjs --rev HEAD --stable 156.0.8078.47
  → EXIT=0  clean rev=1ca5b57db44cd45386a1af6dc9848a9a8d07b82c stable=156.0.8078.47
            population=23 resolved=23 unresolved=0 holds=16 drifted=7   (receipt: release-pins-head.json)

# the four catalogued sites are untouched (counter exit 1, not 2: its static guards — find occurs
# exactly once, fault replacement text not present as a literal — passed)
grep -n 'sup.teaches.startsWith|refs/tags/${stable}/|f.new_status === 404 && nb|r.recheck === "on-release"'
  → lines 178, 223, 252: one occurrence each, bytes unchanged (diff is additions only)
```

### Per-mutant cause probe (intended path, not f6)

`probe.mjs` (delivered) takes the patched gate, replaces the trailing `main();` with a driver that runs
exactly one new case and prints `evaluate()`'s own `reasons`/`verdict`, then repeats with each of the four
catalogue mutants applied (`find` occurrences asserted == 1 before each swap).
`TMPDIR=$S/tmp node probe.mjs` → `PROBE_EXIT=0`; receipt `probe-reasons.json`.

```
pristine                    [{"id":"S001","resolved":false,"verdict":"drifted","reasons":["s1-drift-unsuperseded"]}]   ×4 (one per new case)
pins-s1-supersession-prefix [{"id":"S001","resolved":true, "verdict":"drifted","reasons":[]}]
pins-s1-supersession-tag    [{"id":"S001","resolved":true, "verdict":"drifted","reasons":[]}]
pins-notfound-status        [{"id":"S001","resolved":true, "verdict":"holds",  "reasons":[]}]
pins-notfound-body          [{"id":"S001","resolved":true, "verdict":"holds",  "reasons":[]}]
```

On pristine bytes each case is unresolved for the s1 supersession reason alone; with the single target
check disabled the identical fixture becomes resolved with an empty reason list. No `f6-refetch`,
`f2-path-bound`, `f3-bytes`, `f4-ranges`, `f5-digest` or `r1-entry` reason appears in any row.

## Integration note for the L1 (measured, not advised)

`ExecPinsCasesA` also inserts at the same anchor (immediately before the closing `];` of `CASES`) and
also edits `runSelftest`/the console printer. Measured in scratch:

- apply A's patch to a fresh `061e620…` checkout → exit 0 (self-test 25/25 clean);
- apply B's patch after it with plain `git apply` → the shared hunk does not apply;
- `git apply --3way` → conflict (`UU`) on the two adjacent insertions.

Resolution that measured clean: apply A's patch, then insert B's 34-line block before the closing `];`
of `CASES` (concatenation; order of the two blocks is immaterial — no case depends on another's
position). Reproduced with `merge-combined.mjs` (delivered): merged tree → release-pin self-test
`cases=29 passed=29` clean, and the frozen counter at the merged commit
`4c72512a9c95ebd7853a4d95f13cd54ff7f2d463` reads:

```
fault_total 27, fault_killed 22, fault_survivors 5, benign_total 13, benign_killed 0
survivors: s106-sha-drop, s106-anchor-unique-drop, s106-anchor-unique-true, s106-byte-count-drop,
           s106-byte-count-true
gates: (check-s106-evidence.mjs 7/7), (check-release-pins.mjs 29/29)
RELEASE_PINS clean population=23 resolved=23 unresolved=0
```

i.e. every release-pin fault mutant is killed by the two blocks together and only the five `s106` rows
remain for `ExecS106Cases`. `combined-A-plus-B.patch` is that merged state's diff from `061e620…`, for
reference only — the L1 should apply the two seat patches, not this combined one.

## Files in this output dir

| File | sha256 |
|---|---|
| `pins-cases-b.patch` | `15c3023398c8eb00d7db55653d3e4c643cbb0e7ff3629432f1cf84ca452dafaa` |
| `gate-mutants-before.json` (counter at `061e620…`) | `b46f4e34ac425895f98f61273741b29b6c4ae4e9256531ff377bdb1572671df6` |
| `gate-mutants-after.json` (counter at patched HEAD, standalone) | `807fc3d0a114e931329c237f57f54478503003172bbdd2276875aa7f0cbc118e` |
| `combined-counter.json` (counter at merged A+B commit) | `56f8c66161214fb3f0c38d78f80e32f416c160fdc56da55a4a65ff680e9495d7` |
| `combined-A-plus-B.patch` (reference merge state) | `c2010328556fd666358ccdc69396224f9bf3f55e10bb6fef6b9309a3680eadf2` |
| `merge-combined.mjs` (block-concatenation merge used above) | `dbabbe6924d1f69b8a08a2a330a17a5a8786d56aad02ed34db44fcaed0b3d07b` |
| `release-pins-selftest-at-061e620.txt` (20/20) | `0ea48d66403d2bb6cccc00b023853a33492829dea4e5b2befcbbb4f26339cc9a` |
| `release-pins-selftest.txt` (24/24, standalone) | `a473bc3495b4fccb68a00e1a7a00431015ac3d4525856a374545d1893ae75907` |
| `release-pins-head.txt` / `release-pins-head.json` | `e9c37c2f…b518289` / `3af6655b0e66535e46908158ccbe058c8ce40dbc43391362775363e364e1ca1f` |
| `probe.mjs` / `probe-reasons.json` | `16478fb838a0042dc11cb86dd0f7fec7967db5cd9a57b9e6ca21ee0b2c5ee14c` / `0126b4788918a8c9aecfe835ff98d57f61318917a67727983a0225eae69bb536` |

## Risks and limits

- The counter is 15 s per run and its two static guards (each `find` occurs exactly once; no fault
  replacement text present as a literal) are the only thing standing between the patch and exit 2; both
  passed at the patched HEAD and at the merged commit.
- `reasons` pinning in my cases is inert until `ExecPinsCasesA`'s harness lands. It was authored against
  the reason strings measured in `probe-reasons.json`, so it cannot fail spuriously on the current gate;
  if A's patch were reworked to compare reasons differently, my field becomes dead data, not a failure.
- C1 as claimed is not met by this seat: `fault_survivors` is 10 standalone / 5 combined, all
  `s106-*`, owned by `ExecS106Cases`. `benign_killed = 0` and both pristine self-tests are clean in both
  configurations, and both frozen digests match `frozenDigests`, so this patch is additive.
- I ran only what is listed here (plus the scratch combined merge). No `check-selfassessment`,
  `check-gate-registry`, census, build, lint or formatter was run: they read state this patch does not
  touch and belong to the parent's post-integration gate.

## Scratch

Everything lived in `/fast/scratch/hyaku/tabi-r30/ExecPinsCasesB/` (`clone`, `combined`, `tmp`,
`work-before`, `work-after2`, `work-combined3`, …) and was removed after every file above was copied
here. Lane `git status --porcelain` shows only untracked round-30 wave files belonging to the wave
itself (`.ufo/waves/round-30/w1/…`, `w1.ready`, `w1-spec.json`, `measure/`); no tracked lane file is
modified.
