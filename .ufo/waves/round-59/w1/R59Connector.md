# R59Connector — seat report (tabi round 59, wave w1)

Seat: `R59Connector` (connector). Lane: `tabi-shokunin`.
Lane base revision: `4e7fb89d7b71a6fdf661680891440be6577759e8` (verbatim from
`claims.json` → `"baseline"`).
Round: 59. Wave: w1 (the only v1 wave). Claims read FIRST; frozen; never amended.

**Scope honoured.** I wrote exactly two files, both under
`tabi-shokunin/.ufo/waves/round-59/connector/`, plus this report under
`tabi-shokunin/.ufo/waves/round-59/w1/`. No VCS mutation was run anywhere (no `git commit/add/
push/stash/checkout/reset`, no mutating `jj`). No file outside my item's paths was written.
The fleet repo and every sibling lane repo were read **read-only**. Scratch tree
`/fast/scratch/hyaku/tabi-r59/R59Connector/` was created, used, and **deleted** before this
report was written.

## 1. Deliverables (sha256)

| Path | sha256 | bytes |
|---|---|---|
| `.ufo/waves/round-59/connector/overlap-scan.md` | `95b70639bef1878a7a71e1a6eecf8079cc6a82fb3c88b9a8e4eb41b193ca1e31` | 22028 |
| `.ufo/waves/round-59/connector/kagi-kake-kama-adjudication.md` | `0f23e42457dd3ebb768cbed1e16f9edf17ad551652d53a1e9c2a1de29bdfd476` | 48759 |
| `.ufo/waves/round-59/w1/R59Connector.md` | self-referential — this file's own digest cannot embed itself; measure it with `sha256sum .ufo/waves/round-59/w1/R59Connector.md` | — |

(The two connector files were each written once, after their content was fully composed; the
sha256 values above are of the final bytes on disk and were recomputed after the last write.
The adjudication file's content includes two corrections to my own first-pass verdicts — §4
below — which were made **before** the file's final write, not after it.)

## 2. What I did

**Item 1 — sibling-overlap scan** → `connector/overlap-scan.md`. Read the fleet's round-58
and round-59 lane reports (13 + 12 files) and every sibling's newest round dir; grepped for
browser/web-interaction ground across the four named classes (CapsLock/key-event, CDP
capabilities, adjacency meters, SOURCES registry tooling). Result: **no sibling holds the
CapsLock ground** (the only sibling `capsLock` hit is mado's Hyprland/XKB locked-modifier
note — a compositor API, not a browser). CDP overlap exists but is **pre-existing and already
ruled** in tabi's own `corpus/adjacency.tsv` (kaidoku / revenger / kama rows) and in the two
open L0 questions at `.ufo/l0-questions.md` lines 62 and 65. Adjacency-meter tooling is
**tabi-only** fleet-wide (`find -name 'adjacency-host-*'` outside tabi → empty). The tabi
SOURCES tooling (`scripts/check-sources.mjs`) is tabi-only; the fleet `scripts/sources-census.sh`
is shared infrastructure (one name-collision note: kagi carries a lane-local copy with a
different sha256).

**Item 2 — independent adjudication** → `connector/kagi-kake-kama-adjudication.md`. Read the
three provinces at their live heads (via `git cat-file -p <head>:<path>` — the worktree was
never read), enumerated every browser-ground hit line under **two** word lists, and adjudicated
every line with the frozen vocabulary. **Independence held**: my scripts and my readings were
complete before I opened R59Rebind's draft; the draft was read afterwards for the cross-check
only.

**Item 3 — novelty check** → in `overlap-scan.md` §4. **No sibling holds CapsLock or
`getModifierState` ground.** `getModifierState` appears nowhere outside tabi's own tree.

## 3. Headline results

1. **My independent scan reproduces the rebind draft's hit set exactly**: 72 meter-list hit
   lines — kagi `PROVINCE.md` 3, kake `PROVINCE.md` 45, kake `SKILL.md` 19, kama
   `corpus/knowledge/listener-census.md` 5.
2. **My independent dispositions match the draft exactly** after I corrected **two of my own
   verdicts** (§4). Final split, both tables: **59 `no-tabi-ground` / 5 `overlap-declared` /
   8 `contested-open`**. The 8 `contested-open` and the 5 `overlap-declared` are the *same
   lines* in both tables.
3. **All 13 non-`no-tabi-ground` rows carry a real, resolvable ruling reference with a
   verbatim quote** — verified at the cited fleet commits (`git cat-file -t` → `commit`) and
   against tabi's own `corpus/adjacency.tsv`. Nothing invented.

## 4. Failures / corrections I made (disclosed, not smoothed)

- **Two wrong verdicts of mine, found and corrected.** My first pass classified kake
  `PROVINCE.md:329` ("… Client-side crawler discipline stays with tabi; kake keeps") and `:344`
  ("Boundary unchanged: publisher-side placement is kake's; client-side crawling stays with
  tabi.") as `no-tabi-ground`. Both lines explicitly assign the client-side crawler ground to
  tabi, which is `overlap-declared`. I caught it on the cross-check by re-reading every
  meter-list row whose quote mentions "tabi" — a mechanical check I should have run before
  writing Part A. After correcting both, my table and the draft agree on all 72 dispositions.
  Recorded in the adjudication file §5.2 and §6.2.
- **My Part-B family counts were inconsistent on the first two generations** (85+66+13+3=167
  against a 165-line set, after the two corrections). Recomputed against the corrected table
  with an explicit regex classifier: **F1 83 + F2 68 + F3 13 + F4 3 = 167**, and every count in
  the file now sums correctly.
- **The do-nothing control's finding count has moved.** The claims file records 4 findings at
  round open; my own re-run of v18 at the baseline rev gives **6** (the two extra are kasegi's
  `lane-screen-sha-mismatch` and `lane-screen-lines-mismatch`, because kasegi's head moved and
  its PROVINCE.md changed bytes). Recorded in `overlap-scan.md` §2.4 with the exact finding
  list. This is the expected behaviour of a per-run head snapshot, not a defect.

## 5. The one finding worth the L1's attention (routing, not mine to decide)

**The meter's frozen BG word list contains `cdp` but not `chrome`/`browser`/`http`.**
Consequence on the three newly screened lanes: the **same** the-musketeer Chrome-profile /
CDP-9222 lease is adjudicated from kagi's `PROVINCE.md:64` (contains `CDP`) and from kake's
`SKILL.md:161` (contains `CDP`), but **kake's own `PROVINCE.md:45`** — "The the-musketeer
Chrome profile lease is contested scope (kagi/tabi/kake)" — is **outside** the frozen screen
(verified: all 13 list-M words evaluated against that exact line → zero hits). Likewise kake
`SKILL.md:159` ("**Lease before browser.**") and `:160` ("The shared burner chrome").

This is **not** a meter defect and **not** mine to fix (the meter is `R59Meter`'s file; the
ledger is `R59Rebind`'s; I edited neither). It is a **contested-scope note**: the D8 "new
screened surface" is real for all three lanes, but *which* of a lane's browser-ground
statements count as browser ground is decided by a word list frozen before these three lanes
were ever screened — and on this list a lane's own explicit "contested" statement can fall
outside the screen while its sibling's equivalent statement falls inside it. Suggested
wording for the round report: the three lanes are now **screened**, not "every browser-ground
statement in them is adjudicated".

**Second routing note (`R59Meter`).** R59Rebind's rebind writes **one `lane` row per
(lane, relPath)** — 25 lane rows over 20 lanes — while v18's `verify()` keys `line` rows by
**lane alone**, so its `delta-line-invented` check cross-fires across a lane's files. Measured
against the exact rebind output shape:

| Ledger + keying | v18 `verify()` findings |
|---|---|
| 25 lane rows + 103 line rows, **v18 lane-only keying** | **118** — 37 `delta-line-missing` + **81 `delta-line-invented`** |
| same ledger, **re-keyed by (lane, relPath)** | **37** — all `delta-line-missing`, **0** `delta-line-invented` |

The claim's declared change **(e)** already names the fix ("lineRows keyed by (lane,
relPath)"), so the v19 meter is *declared* to do this — but the v19 selftest must **pin** it
with a case that feeds **two** relPaths for one lane and asserts the line-row checks do not
cross-fire. The 37 remaining `delta-line-missing` are kaidoku's two queue-ops files' 37
unadjudicated hits (`adj/screen-set-r59-inventory.json` → `uncoveredRows: 37`), which are
outside the three named lanes but inside (d)'s "every roster sibling" requirement — route to
`R59Rebind`.

**Reconciliation with R59Rebind's rehearsal figure (both reproduced; the numbers are not in
conflict).** R59Rebind reported that its v18-core rehearsal emitted **151**
`delta-line-invested` and **0** missing on a **fully adjudicated** candidate (140 line rows),
while my probe gave **81** `delta-line-invented` + 37 missing on a **partially adjudicated**
one (103 line rows). I re-derived both independently and confirmed R59Rebind's reconciliation
is exactly right. The v18 lane-only filter flags a lane's line row once **per foreign file**
whose hit set it misses, so the count scales with **how many of the lane's hit rows are
present** in the candidate:

| Candidate | kaidoku (3 files) | kake (2 files) | kama (2 files) | total `delta-line-invented` |
|---|---|---|---|---|
| A — 103 rows (kaidoku's 37 queue-ops rows absent) | 12 | 64 | 5 | **81** |
| B — 140 rows (every hit adjudicated) | 82 | 64 | 5 | **151** |

kake and kama are candidate-independent (all their rows present in both); kaidoku's
contribution moves 12 → 82 as its 37 missing rows arrive. **Same defect class, different
candidate state.** The instructive part: the cross-fire count *grows* as the ledger gets
*more complete* — a fully-adjudicated ledger is the worst case for the lane-only keying.

**Third routing note — a pin that had already moved (pre-freeze drift, not a defect).**
R59Rebind's `adj/rebind-r59-preflight-v19core.json` pinned `meterSha256 =
7c4e4b5d2c909f68803454bc4c3338f2846a6d98839d3470398989b6c3641073`, but the meter file on
disk now hashes to `0f956f869be4bfe573d2e3e863879b76ac42c1361c030eb0895662e0d703391c`. The
meter gained the selftest case that my routing note asked for: the committed
`adj-v19-selftest.json` receipt records **37** cases and the fresh run records **38** — the
new one is `kaidoku-multi-file-keyed-green` (a three-file lane, `expect 0`, `assertPredicate
true`, `assertFindingCount 0`), and the meter header at
`c1-adjacency-host-v19.mjs:641` cites my routing note by name. **My own run of the v19
selftest: `allPass true`, 38 cases, 38 pass.** The claims file requires the exact case count
to be "pinned at instrument freeze" and `>= 28` — 38 satisfies the floor, and the freeze pin
must be taken from the freeze commit, not from this preflight receipt.

**CLOSED — verified by me after R59Rebind's re-run.** R59Rebind re-ran both `adj/` receipts
against the on-disk meter and re-pinned them; I verified the result read-only:

| receipt | meterSha256 now pinned | outcome |
|---|---|---|
| `adj/rebind-r59-preflight.json` (sha `11d5c5ef6847dbff9ef1ae3b8e746d580180cef1e72376ca1302537e9b7bfa8b`) | `0f956f869be4bfe573d2e3e863879b76ac42c1361c030eb0895662e0d703391c` | **exit 3 / `ok: false`** — truthful: 103 line rows, **37 unresolved** |
| `adj/rebind-r59-preflight-v19core.json` (sha `d0efdf2df5719583fdbbdeeecd22b21ba188a7722c167e5a3fbef64709124fd7`) | same `0f956f86…` | **exit 0 / `ok: true`** — `preflight.findings 0`, `predicate true`, counts `{roster 20, mapRows 16, auditRows 16, deltaLanes 20, bgScreenSiblings 20}` over 25 screens / 140 line rows |

Both pins equal the sha I measured on disk; both receipt file digests match R59Rebind's
message. The truthful receipt still fails with exactly the **37** unresolved rows, and I
confirmed those 37 are exactly the kaidoku queue-ops hits (`…r10-01-queue-ops.md` 12,
`…r10-02-queue-ops-2.md` 25 — 25 + 12 = 37, matching
`adj/screen-set-r59-inventory.json` → `uncovered`). The drift chain is now recorded in
R59Rebind's own report (`w1/R59Rebind.md` lines 174-178, 225-227): `cc11af86…` →
`7c4e4b5d…` (37 cases) → `0f956f86…` (38 cases), with the receipts re-run at each move.
**The freeze-commit pin duty remains the L1's** — the meter is still untracked
(`git ls-files .ufo/waves/round-59/counters/` → empty), so the sha and the exact case count
recorded in the round report must come from the freeze commit, not from these receipts.

## 6. Commands run (all read-only) and their outcomes

| Command | Outcome |
|---|---|
| `read tabi-shokunin/.ufo/waves/round-59/claims.json` | read FIRST; frozen; not amended |
| `ls -d /home/vgpnk/Projects/shokunin/*/` | 22 dirs (21 lanes + research/scripts/templates/tools) |
| `for d in */; do [ -e "$d/.git" ] \|\| [ -e "$d/HEAD" ]` | 21 git lanes incl. tabi; `kumitate-shokinin` (typo dir) has no `.git` → excluded; **roster = 20 siblings** |
| `git -C {kagi,kake,kama}-shokunin rev-parse HEAD` | `91f7752b…`, `1240288f…`, `6035e952…` (recorded in the adjudication file §1) |
| `sha256sum {kagi,kake,kama}-shokunin/PROVINCE.md` | `0bbf19b3…`, `0513521f…`, `f0aaae9c…` |
| `git -C <lane> cat-file -p <head>:<path>` | bytes read at head; worktree never read |
| `grep -rniE 'capslock\|getmodifierstate\|modifierstate' */corpus/` (fleet, excl. tabi) | 1 lane hit (mado hyprland note) + mado wave evidence |
| `grep -rniE 'capslock\|getmodifierstate\|modifierstate' */.ufo/waves/round-59/` (siblings) | **0** |
| `grep -rliE 'chromium\|cdp\|devtools\|playwright\|selenium\|puppeteer\|geckodriver' */.ufo/waves/round-59/` | kake assimilation copies, kumitate stream, tameshi stdout — substring only, **no browser launch** |
| `grep -inE <BG words> .ufo/reports/round-{58,59}/*.md` | only tabi.md (r58) names Chromium/CDP; kotoba.md:24 "browser user agent" = a header string |
| `find . -maxdepth 4 -name 'adjacency-host-*' -not -path './tabi-shokunin/*'` | **empty** (tabi-only) |
| `ls */scripts/check-sources.mjs` | tabi only |
| `sha256sum scripts/sources-census.sh kagi-shokunin/corpus/sources-census.sh` | `3fb7261569f4…` vs `8d30d627021c…` — different bytes |
| `git show 4e7fb89d…:corpus/adjacency-host-delta-r58.tsv \| grep -c 'kagi-shokunin\|kake-shokunin\|kama-shokunin'` | **0** — the new surface is unheld at the baseline (matches the claims file's `newSurfaceBefore`) |
| `git show 4e7fb89d…:corpus/adjacency-host-delta-r59.tsv` | **fails** — no r59 ledger exists at the baseline |
| `node .ufo/waves/round-58/counters/c1-adjacency-host-v18.mjs --rev 4e7fb89d… --repo … --fleet … --json` | **exit 1**, `predicate false`, `findingCount 6`, counts `{roster 20, mapRows 16, auditRows 16, deltaLanes 16}`; findings: `lane-screen-sha-mismatch kasegi`, `lane-screen-lines-mismatch kasegi`, `lane-screen-head-mismatch kasegi\|kengaku\|souji\|tsukuroi` |
| `git cat-file -t ebeb396f… / b6b3b5e4…` | both `commit`; cited line numbers carry the quoted ruling text |
| `grep` for the three `overlap-declared` ruling quotes in `tabi-shokunin/corpus/adjacency.tsv` | all ≥1 hit — quotes verbatim |
| my scratch scripts `bgscan.mjs`, `screen.mjs`, `pairs.mjs`, `adj_table.mjs`, `probe2/3/4.mjs`, `recon.mjs`, `recon2.mjs` | 72 meter-list hits on the 3 lanes; 140 fleet-wide over 25 (lane,path) screens; the §5 keying measurement; the 81-vs-151 reconciliation |
| `node .ufo/waves/round-59/counters/c1-adjacency-host-v19.mjs --selftest` | **allPass true, 38 cases, 38 pass**; the new case `kaidoku-multi-file-keyed-green` (expect 0, predicate true) and `cross-file-hit-number-wrong-file` (expect 1, 2 findings) both pass |
| `sha256sum .ufo/waves/round-59/counters/c1-adjacency-host-v19.mjs` | `0f956f869be4bfe573d2e3e863879b76ac42c1361c030eb0895662e0d703391c` — differs from the `7c4e4b5d…` preflight pin (§5) |
| `git ls-files .ufo/waves/round-59/counters/` | empty → the v19 meter is still untracked (pre-freeze); the freeze pin must come from the freeze commit |
| `sha256sum .ufo/waves/round-59/adj/rebind-r59-preflight{,-v19core}.json` | `11d5c5ef6847dbff…` and `d0efdf2df5719583…` — match R59Rebind's reported digests |
| `python3 -c` over both `adj/rebind-r59-preflight*.json` | both now pin `meterSha256 0f956f86…` (= the sha on disk); truthful receipt `ok: false` with 37 unresolved; v19-core receipt `ok: true`, `preflight.findings 0`, `predicate true`, counts 20/16/16/20/20 |
| `python3 -c` over `adj/screen-set-r59-inventory.json` → `uncovered` | 37 rows, all kaidoku: `…r10-02-queue-ops-2.md` 25 + `…r10-01-queue-ops.md` 12 |
| `grep -n 'cc11af86\|7c4e4b5d\|0f956f86' .ufo/waves/round-59/w1/R59Rebind.md` | the meter-sha drift chain is recorded in R59Rebind's report |

## 7. Tooling

**No tools installed, upgraded, or removed.** No pacman transaction (host-wide pacman is
paused; I ran none). No `uv tool install`, no `npx`, no binary placed in `~/.local/bin` or
any PATH directory. Everything used was already on the host: `git`, `node` v24.21.0,
`python3`, `sha256sum`, `grep`, `find`. Nothing in the task needed a new tool, so the
tooling directive's channel order was not exercised.

## 8. Cross-check note (independence preserved)

I read R59Rebind's draft **only after** my own scan and adjudication were complete, and only
for the cross-check now recorded in `kagi-kake-kama-adjudication.md` §5. My two corrected
verdicts (§4) were found by re-reading my *own* rows against the draft, and the corrected
verdicts match the draft — a coincidence of correct reasoning, not a copy: the corrected
verdicts follow from the definitions in §3 of my file (a line that assigns the ground to tabi
is `overlap-declared`), and I had applied that definition to the other three such lines
(`PROVINCE.md:40`, `:310`, `SKILL.md:697`) in my first pass.
