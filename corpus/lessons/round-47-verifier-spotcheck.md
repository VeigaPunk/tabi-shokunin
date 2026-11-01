author: hyaku closure (non-author integrator, zcode subagent (fresh session, non-author))

# tabi round 47 — non-author verifier spotcheck

Closure judge: hyaku non-author closure, fresh zcode subagent session, did not author this round.
Lane repo: `C:/Users/jpvei/.zcode/workspace/95b1ba4d-5089-47a4-9fd8-54adebbce2ae/fleet/tabi-shokunin`
(branch `master`); baseline `b95b546949e71f34bfaa1e63de44aff4b4d29371`; lane head at closure
`dce01d280cacfe586c7ec69135d43e7a95faebe6` (== `origin/master`). All commands below were run by
the closure judge at closure time (2026-11-01T09:22Z); all cited bytes are committed bytes read
through index-free git (`cat-file`/`show`/`diff-tree`/`ls-tree`/`merge-base --is-ancestor`).

**Closure ruling: `rejected-honest-stop`, lanes.tabi = `ok`, admitted = false.** C1 (adjacency)
VERIFIED under its frozen predicate — re-measured by this judge. C2 (operability) REFUSED under
its own pre-declared kill rule — the gate's honest verdict file (`measure/c2-gate-green-at-data.json`:
verified=5, 13 findings) contradicts the frozen after-state (verified=10, exactly 6 findings), the
kill rule fired, and the claim was refused with rationale on record rather than re-declared
post-data. The refusal discipline is correct and is the honest path. One claim verifies, one
honest refusal, no axis harmed.

## 1. Step-1 conformance

| Check | Command | Observed | Result |
|---|---|---|---|
| Report committed by lane identity | `git -C <fleet> log --format='%an %ae %H %ad' -1 -- .ufo/reports/round-47/tabi.md` | `tabi-shokunin tabi@shokunin.local d1b3b98c06f17723e470b8a4d65c3fa9e5ca2098 2026-11-01 01:51:50 -0700` | pass |
| Report commit touches only its own path | `git -C <fleet> diff-tree -r --name-status d1b3b98c` | `A  .ufo/reports/round-47/tabi.md` (only) | pass |
| `SHONEN` heading | read `.ufo/reports/round-47/tabi.md` | `## SHONEN` with four `[~]` lines + pointers | pass |
| Report is not a marker | read | work performed, evidence pointers, five commit-hash citations, sources & frontier, trend verdicts | pass (real report) |
| Cited lane commits exist and are ancestors | `git cat-file -e <h>^{commit}` + `git merge-base --is-ancestor <h> refs/heads/master` for `80325bd8`, `d76eb5bb`, `524910a9`, `c2711c47`, `dce01d28` | all exist=yes ancestor=yes | pass |
| Lane tip pushed | `git rev-parse refs/heads/master` vs `git ls-remote origin refs/heads/master` | both `dce01d280cacfe586c7ec69135d43e7a95faebe6` | pass |
| Cited work reachable in round range | `git log --format='%H %an %s' b95b5469..dce01d28` | exactly the five round commits, all authored `tabi-shokunin` | pass |
| Dispatch/complete digest | watchdog digest in the closure contract | `2026-11-01T00:40:23-07:00 launch tabi round=47 base=b95b546949e7 (zcode run14)`; `01:51:50-07:00 complete tabi round=47 head=dce01d280cac pushed=True` — matches the report's dispatch line; report commit lands at the complete timestamp (report last) | pass |
| Lane scratch deleted at round close | `ls scratch/tabi-r47` | absent at round close (recreated by the closure judge for `closure.json` afterward — judge artifact, not lane debt) | pass |

No step-1 conformance defect. Dispatched prompt carries the mission/axes binding, 1–3 claims
contract, frontier step 2b, report contract (with the five child-lane items), commit/push/L0
rules, honesty rules, and the fresh-start lane binding. The L2 floor remains routed through the
open L0 (`tabi | round-44`, `.ufo/l0-questions.md:231`) — the round ran L1-inline, no wave clause
in any predicate (verified in `claims.json`), the L0 was never treated as answered.

## 2. C1 (adjacency) — re-measured by this judge: VERIFIED under the frozen predicate

Frozen instrument integrity (all six `claims.json` `frozenDigests` re-hashed from committed bytes
at the tip — all match; meter sha256 `ffd0abca…` byte-identical at freeze `80325bd8` / data
`d76eb5bb` / correction 1 `524910a9` / tip `dce01d28`; git blob `168e1ecc76ebe547c3242c01e0697df1d899e5f9`,
matching the SCORECARD and the committed-bytes receipt):

```
for p in <six frozen paths>; do git cat-file -p dce01d28:.ufo/waves/round-47/$p | sha256sum; done
→ all six == claims.json digests (counters/c1-adjacency-host-v7.mjs, the two red controls,
  v6-v7-retarget.diff, census-start.txt, c1-meter-v7-selftest.json)
```

Per-leg re-derivation against the frozen predicate:

- **(a) red control (evidence-verified).** `controls/c1-meter-red-at-round-open.json`: schema
  `tabi-adjacency-host-v6`, rev `b95b5469…`, `predicate:false`, `findingCount:17` (3 sha + 3
  lines + 8 head mismatches, 1 hits mismatch, 2 `delta-line-missing` = binfor PROVINCE.md:30/:33).
  Digest-matched. Matches the report.
- **(b) ledgers (re-measured).** `corpus/adjacency-host-audit-r47.tsv`: 16 data rows, histogram
  `unchanged 10 / sibling-absent 6` (my awk run, output identical to the report's).
  `corpus/adjacency-host-delta-r47.tsv`: 12 `lane` rows + 16 `line` rows.
- **(c) green run (RE-MEASURED — the meter re-run this contract orders).**
  - Selftest, run by me: `node .ufo/waves/round-47/counters/c1-adjacency-host-v7.mjs --selftest`
    → exit 0, `allPass:true, cases:16, pass:16` (matches `measure/c1-meter-v7-selftest.json`,
    digest-matched).
  - Live re-run at the cited revision: `node .ufo/waves/round-47/counters/c1-adjacency-host-v7.mjs
    --rev 524910a9… --repo <lane> --fleet <fleet>` → exit 1, 9 findings, **all** in the
    lane-screen family (`lane-screen-head-mismatch` ×7, `lane-screen-sha-mismatch` ×1,
    `lane-screen-lines-mismatch` ×1) on lanes whose heads advanced **after the round closed**
    (8 of 12 delta-bound lanes moved between correction 1 and closure — verified head-by-head).
    This is exactly the class the frozen kill rule routes through the data-correction flow ("a
    lane-screen-head-mismatch or ANY finding at the green run routes through the frozen
    data-correction flow … it is a correction, not a claim refusal") — a post-closure head race,
    **not** a refutation of C1.
  - Bound-snapshot re-derivation (the load-bearing check): with every sibling pinned to the
    correction-1 receipt's own `headSnapshot` and the meter's exported pure core `verify()` run
    over the committed r47 ledgers (judge's driver in closure scratch; reads committed bytes and
    the committed receipt only), the result is **`findingCount: 0`** with counts
    `{roster:16, mapRows:16, auditRows:16, deltaLanes:12}` — identical to
    `measure/c1-meter-green-at-correction1.json` (`predicate:true, findingCount:0`). C1's green
    re-verifies at its measured revision.
- **(d) snapshot equality (re-measured).** All 12 delta `lane` rows' bound `head` values equal
  the correction-1 green-run `headSnapshot` entries (12/12, 0 mismatches).
- **(f) retarget diff (read).** `controls/v6-v7-retarget.diff`: every hunk is the header comment,
  the two ledger-filename consts, the schema strings, the predicate sentence, or the usage lines
  — no pure-core change. The instrument was not weakened.

The two genuinely new binfor browser-ground lines (PROVINCE.md:30 rea-cdp-browser over the host's
own Chrome/Edge; :33 list-browser-targets/inspect-web-page over loopback CDP) carry
`contested-open` dispositions in delta-r47 — reported, not absorbed (adjacency discipline held);
the successor-ground note (kaidoku/revenger lane dirs absent while `scratch/kaidoku-r53..r55` and
`scratch/revenger-r74..r78` working dirs exist — re-confirmed by this judge) belongs to the
operator/integrator.

**C1 verdict: claim verified (met under the frozen rule); adjacency held 8 → 8 (no rubric
authorizes a move). Instrument: re-measured (selftest + pinned-core re-derivation + snapshot
equality by this judge); red control and receipts: evidence-verified with matching digests.**

## 3. C2 (operability) — refusal verified against the frozen predicate: REFUSAL CORRECT

- **Red control (evidence-verified).** `controls/c2-gate-red-at-round-open.json`: exit-2 class,
  `verdict:"could_not_evaluate"`, `findings:[{reason:"git_failed", detail:"git rev-parse
  --show-toplevel failed (status=spawn)"}]`. Digest-matched. The gate could not run on this host.
- **Honest verdict file (read against the frozen predicate).**
  `measure/c2-gate-green-at-data.json`, `at: c2711c47…`: `verdict:"failed"` (an EVALUATED class —
  the repair works), `rows:16`, **`verified:5`**, findings:
  - 6 × `sibling_unresolved` at map rows 2,3,4,5,16,17 (kaidoku ×4, revenger ×2) — **exactly the
    six `sibling-absent` rows of audit-r47, 1:1** (the frozen cross-check limb (c) held on this
    class; re-derived by this judge from both files);
  - 4 × `ruling_unresolved` at rows 5,7,8,11 — cause verified real: the gate resolves rulings at
    the `--fleet` dir and requires it to be a git toplevel; `…/fleet/.git` is ABSENT on this host
    (the fleet repo and the sibling parent are different directories);
  - 3 × `quote_too_long` at rows 8,13,15 (56/32/28 words vs the gate's 25-word cap — the legacy
    cap vs the meter-era whole-line quotes).
- **Kill rule.** The frozen predicate demanded `verified=10` with findings EXACTLY 6 ×
  `sibling_unresolved`; the frozen kill rule reads "REFUSAL if … any finding other than the six
  absent-sibling sibling_unresolved fires". 7 such findings fired (4 + 3), and `verified=5 ≠ 10`.
  **The kill rule fired; the refusal is mandated by the lane's own pre-data freeze.** The claim
  was refused with the rationale on record (lesson Mistake 1, class `stale-premise`: the frozen
  after-state was reasoned, not measured) — NOT re-declared post-data. That is the honest path.
- **The object-level repair is landed and live-verifies (not claimed as an axis move).**
  - Scope (re-measured): `git diff 80325bd8..c2711c47 -- scripts/check-adjacency.mjs` = the
    `node:path` import line + the `minimalEnv` PATH block (`split(path.delimiter)` /
    `filter(entry => entry.length > 0 && isAbsolute(entry))` / `join(path.delimiter)`) + its
    comment; `diff-tree -r --name-status c2711c47` shows that file is the commit's ONLY change.
    Blob `0a24cfec` → `ac720457`, matching the committed-bytes receipt. The frozen scope clause
    ("the repair touches ONLY the minimalEnv PATH block") holds.
  - Self-test receipt: `ADJACENCY_SELFTEST verdict=clean cases=57 reasons=18
    could_not_evaluate=6` (`measure/c2-gate-selftest.json`) — the repaired gate can fail and
    covers its finding vocabulary.
  - Disclosure verified: the gate blob at the data commit `d76eb5bb` is `0a24cfec` (pre-repair)
    while that commit's message already names the repair — self-disclosed as lesson Mistake 2
    (class `landing`), corrected by `c2711c47` whose bytes and message agree.

**C2 verdict: claim REFUSED (correctly); operability NOT harmed** — the gate went from
cannot-evaluate (exit 2) to evaluated (exit 1) with a clean self-test; no score moved; the refusal
is recorded with cause and an r48 re-declaration plan (SCORECARD planned: either measure the
predicted after-state pre-data over the same bytes, or key the refusal to classes).

## 4. Carry-in (r46 closure items) — verified in committed bytes

- **V1 → S156.** `corpus/SOURCES.md` S156 `teaches` opens `supersedes S155 —`; judge re-ran
  `git cat-file -s 859d441fa1f5b5f70e1ec6ca636e91edf1ae481b` → **104255** (row records 104,255 B
  with this command; S155 keeps its drifted "104,251 B" — append-only correction discipline held;
  sha256 unchanged `317f30f2…`).
- **V2 → corrected knowledge entry.** `corpus/knowledge/chrome-cdp-teardown-round-46-corrected.md`
  opens with the machine-readable trio (`source:` citing S156, `verified-at:`, `recheck:` with a
  concrete command); the original `chrome-cdp-teardown-round-46.md` keeps an append-only
  `## Supersession` paragraph (verified in committed bytes); knowledge notes 63 → 64 (judge count:
  64 `.md` files); README index rows landed (round-47 section + correction index).
- **V3 → receipt-derived disclosure.** `measure/selfassessment-precommit.txt` summary line reads
  `SELFASSESSMENT verdict=failed rev=c2711c47… mismatches=1 could_not_evaluate=171 superseded=24`
  (the 1 = pre-commit `m3-unlanded-paths`); every number in the round's disclosure is quoted from
  a receipt's own summary line (verified against the files).
- Fresh-start spot-checks corroborated: r41 blobs `7b2ece05`/`5930d20f`, r42 counter `5c45c4d5` +
  selftest receipt `ec0c238e` + signing note `72e6b85f`, r43 crash receipt `54ea155a` — all
  present as blobs at HEAD (`git ls-tree -r dce01d28`).

## 5. Sources, census, and discernment spot-check

Judge's own runs: `grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md` → **157**
(155 → 157 as reported); malformed-row awk → 0; duplicate-id awk → 0.
`bash <fleet>/scripts/sources-census.sh validate --root <fleet> tabi` → **exit 0, `tabi ok`**,
22 W04 warnings = the 21 pre-existing + S156's intentional URL re-use of S155 (disclosed in the
lesson) — identical to the committed `census-end.txt`. `check-sources-at-integration.txt` reads
`verdict=clean rows=157 tiers=A:141,B:7,C:9 status=queued:15,mined:132,rejected:10 findings=0`.

Spot-check table (re-opened sources; ≥1 admit and ≥1 reject per LEARNING.md):

| Item | Gate decision | Re-opened source (by this judge) | Agree/disagree | Reason |
|---|---|---|---|---|
| ADMIT S156 (V1 correction) | admit | the committed staged blob itself: `git cat-file -s 859d441f…` → 104255; row bytes at tip | agree | the count re-derives exactly; superseded text named, original row unedited; load-bearing for the corrected entry's trio |
| ADMIT S157 (Node path docs) | admit | committed staged copy `.ufo/waves/round-47/sources/node-path.html`: 59,344 B, sha256 `7b14f91d…` — both match the row's anchor cell; quote located in the `path.delimiter` property section | agree | the teaches quote "Provides the platform-specific path delimiter: ; for Windows : for POSIX" (12 words ≤ 25) is verbatim in the fetched bytes (1 hit); `path.isAbsolute` section present; the two primitives are exactly what the landed repair uses |
| ADMIT C1 | admit | this judge's own meter re-runs (selftest 16/16; pinned-core re-derivation 0 findings; 12/12 snapshot equality) | agree | red 17 at round open is real and committed; green 0 re-derived at the bound snapshot; instrument byte-identical and not weakened |
| REJECT C2-as-frozen | reject (kill rule) | `measure/c2-gate-green-at-data.json` read against the frozen predicate + kill rule in `claims.json` | agree | verified=5 ≠ frozen 10; 7 findings beyond the six absent-sibling (4 `ruling_unresolved` — `…/fleet/.git` absent, verified; 3 `quote_too_long` — 56/32/28 words); refusing a mis-frozen claim instead of re-declaring post-data is the honest path; the repair itself live-verifies |
| REJECT first green (`d76eb5bb`) | reject → correction | `measure/c1-meter-green-at-data.json` | agree | exactly 2 × `lane-screen-head-mismatch` (shokunin-reverse-engineering, tsukuroi) — the frozen correction-flow class; correction 1 re-bound both ledgers at one fresh snapshot and then measured green |

**One disagree-note (prose slip, status-neutral defect D1, routed):** the lesson's REJECT —
C2-as-frozen reason enumerates the quote_too_long rows as "kagi :64 / kama :355 / kake :310", but
the verdict file's three `quote_too_long` rows are kagi `PROVINCE.md:64` (56 w), kake
`PROVINCE.md:310` (32 w), and **kake `SKILL.md:697` (28 w)**; kama `listener-census.md:355` (row
11, 11 words) is a `ruling_unresolved` row, not a quote_too_long row. The receipt is authoritative
and correct; the lesson prose mislists one row. Fix next round the append-only way: an r48 lesson
erratum naming the superseded text.

## 6. Axis harm check

`git diff-tree -r -p b95b5469 dce01d28 -- SCORECARD.md` is a pure append (the round-47 block);
no existing score row changed. adjacency held 8 → 8 (C1 verified, no rubric authorizes a move);
operability's score did not move and its instrument improved (cannot-run → runs); the other four
axes untouched. **No owned axis is harmed.** Saturation 8 / window 3 noted: round 47 = position 3,
the window expires after this round — the SCORECARD's own planned item already routes r48 to a
capability/frontier move or a re-declared C2 predicate.

## 7. Per-axis verdicts and trend verdicts (closure judge)

| Axis | Verdict | Evidence |
|---|---|---|
| adjacency | improved | C1 verified by this judge's re-measurement: the regression gate re-run is real (red 17 at round open → green 0 at correction 1 under the frozen predicate, re-derived at the bound snapshot); two new sibling browser-ground lines adjudicated contested-open, not absorbed |
| operability | unchanged | C2 refused under its own kill rule (verified=5 vs frozen 10; 7 extra findings); the object-level repair landed and live-verifies (exit 2 → exit 1 evaluated; selftest clean 57/57) but the claim does not verify, so the axis does not move |
| coverage | unchanged | no new coverage-map ground (S156 is a correction; S157 documents the repair's own primitives; notes 63 → 64 is the correction's record) |
| depth | unchanged | untouched this round |
| freshness | unchanged | S152–S155 90d rechecks not due (2027-01-29); no admitted entry failed a re-check |
| calibration | unchanged | the frozen kill rule refused the lane's own claim and the refusal is recorded with rationale — honest, but no calibration score movement |

Trends: **expansion unchanged** (no new coverage-map ground; the two binfor lines are binfor
province ground, screened + adjudicated); **quality improved** (routed defect closed in committed
bytes with live red/green receipts; the C1 gate red 17 → green 0 with honest adjudication; S155's
drifted count corrected as S156 without editing the original; no admitted entry failed a
re-check); **discernment improved** (the lane's own frozen kill rule refused its own claim at data
time and the refusal stands recorded; the head race ran the frozen correction flow; every
disclosure number quotes a receipt's own summary line — all re-verified by this judge).

## 8. Routed defects / notes for next round

- **D1 (routed to tabi, r48):** lesson prose mislists one quote_too_long row ("kama :355" for
  kake `SKILL.md:697`) — §5 above. Append-only erratum naming the superseded text.
- **D2 (already self-disclosed, stays on record):** `d76eb5bb` message named the C2 repair while
  its gate blob was still pre-repair (`0a24cfec`); corrected by `c2711c47`; lesson Mistake 2.
  No new routing.
- **N1 (r48 duty, from the frozen correction flow):** 8 of 12 delta-bound sibling heads advanced
  after correction 1; this judge's live meter re-run at `524910a9` reads 9 lane-screen findings.
  Before any r48 meter verdict, re-bind BOTH ledgers at r48's own fresh snapshot (the SCORECARD
  planned item already says this). This is next round's ordinary correction flow, not a defect in
  r47's cited measurement.
- **N2 (operator):** all four SHONEN boxes remain `[~]`; this round's evidence (LOG round-47
  entry, committed receipts under `.ufo/waves/round-47/`, and this spotcheck) looks fully
  checkable by a non-author — same operator note as r46.
- **N3 (operator/integrator):** the kaidoku/revenger successor-ground observation is
  corroborated (lane dirs absent from `…/fleet/`; `scratch/kaidoku-r53..r55`, `revenger-r74..r78`
  working dirs present) — reported, not absorbed; operator ground.
- **N4:** the tabi | round-44 L2-floor L0 remains open and was routed around consistently; no
  wave clause appears in any frozen predicate (verified in `claims.json`).
