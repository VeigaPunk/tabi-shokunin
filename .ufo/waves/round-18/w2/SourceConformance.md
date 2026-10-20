VERDICT: PASS

# Sources-conformance falsification — tabi round 18, wave 2

Seat `TabiR18.SourceConformance-2` (leaf; no subagents). Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`
(LANE), baseline B `2bff864fdfee684ddbcd066cc8e735adaba2735c`, measured candidate REV
`530f40a9bc3f10436161a2af1ca0fe9bffffc004`. Date 2026-10-20. No production, fleet, sibling, jj or Git-index
write; no Git write of any kind; no sandbox clone needed. Census/check-sources are read-only; the two
self-tests wrote only under fresh private `TMPDIR`s that were deleted (check-sources temp left 0 entries).
No tool install or upgrade was performed. No browser was launched and no live fetch was made.

## 0. Revision and byte binding (an input is only "at REV" if proven so)

- `git -C LANE rev-parse HEAD refs/heads/master` → both `530f40a9bc3f10436161a2af1ca0fe9bffffc004`.
- `git -C LANE status --porcelain` → only `?? .ufo/waves/round-18/w2/` (this seat's directory).
- `git -C LANE rev-list --count B..REV` → `1`; the single commit is `530f40a round-18: source rechecks,
  guarded harness, routed correction evidence and build wave`.
- `git show REV:corpus/SOURCES.md | sha256sum` = `81f849da8c78c5e496b5d3973a6a4f47fb1823dfc163f2e5e80c8d845767fa55`;
  worktree `corpus/SOURCES.md` has the **same** sha256 and identical bytes → the census read REV bytes.
- `scripts/check-sources.mjs` sha256 at B = at REV = `afd047874a1aa136efc252290bef8c76bb90d85f405d1ecf593e9d407125df77`
  (byte-frozen, unchanged); worktree bytes equal the REV blob.
- `.ufo/waves/round-18/recheck-fetch.mjs` sha256 at REV = `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360`.

## 1. Fleet census validate — exact run

cwd `/home/vgpnk/Projects/shokunin`:

```
./scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi
tabi	W04	S058 duplicate url chromewebstore.google.com/detail/webmcp-model-context-tool/gbpdfapgefenggkahomfgkhfehlcenpd across scopes
tabi	ok	/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md
EXIT=0
```

`W04` is warning-only by the script header ("W04 same URL across scopes (warnings do not affect clean
lanes)"); the lane line is `ok` and exit is 0. The duplicate is the intended supersession family
S053→S057→S058 sharing one listing URL. `census` mode (same cwd/root/lane):

```
tabi	rows	64
tabi	tier.A	52
tabi	tier.B	4
tabi	tier.C	8
tabi	status.mined	48
tabi	status.queued	8
tabi	status.rejected	8
FLEET	rows	64
FLEET	tier.A	52
FLEET	tier.B	4
FLEET	tier.C	8
FLEET	tier.invalid	0
FLEET	status.queued	8
FLEET	status.mined	48
FLEET	status.rejected	8
FLEET	status.invalid	0
FLEET	missing	0
EXIT=0
```

`overdue --root /home/vgpnk/Projects/shokunin tabi` → 64 `cadence` lines (S001–S064), exit 0; no row is
reported `overdue` (no row is date-due, matching PLAN/lesson).

## 2. Lane check-sources gate — exact run

cwd LANE:

```
node scripts/check-sources.mjs
SOURCES_GATE verdict=clean rows=64 tiers=A:52,B:4,C:8 status=queued:8,mined:48,rejected:8 findings=0 file=corpus/SOURCES.md
EXIT=0
```

Self-test (mutants must die): `TMP=$(mktemp -d /tmp/tabir18-sc-XXXXXX); TMPDIR=$TMP node
scripts/check-sources.mjs --self-test` → 26× `result=PASS` lines and `SOURCES_SELFTEST verdict=clean
cases=26`, `EXIT=0`; `TMP` held 0 entries after the run. Fleet validator self-test:
`TMPDIR=$TMP /home/vgpnk/Projects/shokunin/scripts/sources-census.sh selftest` → all listed mutants
`killed`, final `selftest ok`, `EXIT=0`.

## 3. Independent recompute (raw parse, not either gate's own output)

Parsed the `## Registry` rows directly from the REV bytes and from `git show B:corpus/SOURCES.md`
(11 cells per row after splitting on `|`).

| Metric | B parse | REV parse | census | check-sources |
|---|---|---|---|---|
| rows | 57 | 64 | 64 | 64 |
| tier.A | 46 | 52 | 52 | 52 |
| tier.B | 4 | 4 | 4 | 4 |
| tier.C | 7 | 8 | 8 | 8 |
| status.mined | 42 | 48 | 48 | 48 |
| status.queued | 8 | 8 | 8 | 8 |
| status.rejected | 7 | 8 | 8 | 8 |

Delta is exactly +7 rows, tier A +6 / C +1, mined +6 / rejected +1. No discrepancies between an
independent parse and either gate.

## 4. Identity hygiene

- 64 row ids, 64 unique, contiguous `S001`…`S064`; no duplicate id, no gap, no malformed row
  (all rows have exactly 11 cells). Both gates' duplicate-id code (census `E03`, check-sources
  `duplicate_id`) is absent.
- Cross-tool URL/scope duplicate `E04` is absent because S058's `teaches` starts `supersedes S057 —`.
- No table row appears outside `## Registry` (census `E12` / check-sources `row_outside_registry` absent).

## 5. Old row cells against B

`git diff B REV -- corpus/SOURCES.md` = **9 insertions, 0 deletions** (7 new rows at
`corpus/SOURCES.md:72-78`, 2 search-log lines at `corpus/SOURCES.md:106-107`).

All 57 B rows (S001–S057) are present at REV, and a positional cell-by-cell comparison of
57 rows × 11 cells = **627 cells changed 0**. So no old status/recheck/used-by edit exists to log
old→new; the lesson's "Existing status/recheck/used-by cells unchanged; no old→new transitions"
(`corpus/lessons/round-18.md:49-50`) matches the bytes.

## 6. New rows opened this round, and the ≤25-word Gate budget

Rows not in B = exactly `S058`–`S064`. All have `opened=2026-10-20` (today), `status`: S058 `rejected`,
S059–S064 `mined`, `tier`: S058 `C`, S059–S064 `A`; used-by: S058 `—`, S059–S064
`corpus/knowledge/harness-hardening-round-18.md`.

Gate table `corpus/lessons/round-18.md:39-45`: every new id has one row, its URL cell occurs verbatim in
that row's `source` cell, its date is `2026-10-20`, and the actual word count of each quoted span equals
the parenthetical claim:

| Row | claimed words | actual words | ≤25 |
|---|---|---|---|
| S058 | 12 | 12 | yes |
| S059 | 6 | 6 | yes |
| S060 | 16 | 16 | yes |
| S061 | 19 | 19 | yes |
| S062 | 19 | 19 | yes |
| S063 | 20 | 20 | yes |
| S064 | 13 | 13 | yes |

Max = 20. Separately, the C1 receipt `quoteWords` max is 24 (contract limit 25).

## 7. C1 receipt inventory (evidence under `corpus/evidence/round-18/source-recheck/`)

102 tracked files = 51 `S###.json` + 51 `S###.excerpt.txt`. Expected set = 57 B rows minus the six
superseded `{S004,S039,S047,S049,S050,S053}` = 51; set equality holds both ways (0 unexpected, 0 missing).
Independent re-verification of every receipt:

- schema `tabi-source-recheck-v1` (single value across all 51);
- `row` equals filename; `rowUrl` occurs verbatim in that row's `source` cell (0 mismatches);
- `quoteWords` equals whitespace count of `quote`, max 24; `quoteFound` true;
- `normalize(quote)` occurs in `normalize(excerpt bytes)`; `excerptSha256` equals sha256 of the tracked
  excerpt file; `sha256` field is 64-hex;
- `fetchedAt` on 2026-10-20 (full timestamps, all 51);
- `producerSha256` equals the REV `.ufo/waves/round-18/recheck-fetch.mjs` sha256 `f2ba0033…a360` (51/51);
- `httpStatus=200` for all 50 HTTP rows; the only `null` is S029 (`own-work`, repo path), as the contract allows;
- `teachesVerdict=held` for all 51, so no `drift` row and no successor row is required.

S029's quote is recorded with `quoteSource` pointing into `corpus/lessons/kaika-fleet-round-1.md` (lines
44–60 family), consistent with PLAN's "own-work S029 is explicitly hygiene, not live freshness".

## 8. Evidence and tracked-new-path inventory (read-only Git)

`git diff --name-status B REV` = **221 files: 217 A, 4 M, 0 D**. The 4 modifications are append-only:

| path | numstat (add/del) |
|---|---|
| `LOG.md` | +24 / 0 |
| `corpus/QUALITY.md` | +21 / 0 |
| `corpus/README.md` | +19 / 0 |
| `corpus/SOURCES.md` | +9 / 0 |

New paths by group (all tracked at REV):

- `corpus/evidence/round-18/` — 114 files: `source-recheck/` 102 (51 json + 51 excerpt),
  `routed/` 11 (`harm-at-93bfead.json`, `harm-runner.mjs`, `adjacency-selftest.json`,
  `harness-reruns/index.json` + `run-1..run-7.json`), `webmcp-invoke/receipt.json` 1.
- `.ufo/waves/round-18/` — 98 files: root 6 (`PLAN.md`, `harm-baseline.json`,
  `measure-c1.mjs`, `measure-c2.mjs`, `measure-c3.mjs`, `recheck-fetch.mjs`), `drafts/` 9,
  `sources/` 7 (`S058Listing.md`, `SrcChromiumPipe.md`, `SrcChromiumSwitchMerge.md`,
  `SrcNodeSignals.md`, `SrcPwCdpSession.md`, `SrcPwDownloads.md`, `SrcPwLaunch.md`), `w1/` 76.
- `scripts/` — 2: `webmcp-invoke-round18.mjs`
  sha256 `0a1201a9c01e4ee23f8a94ad6d75b868c626f96c97960797acf05b6bdbfbe155` (equals the C2 receipt
  `producer.sha256`), `freshness-witness.mjs`
  sha256 `a348912911ce63577147b4b4610ce88fa73cba888d888d158b092a74db8ecad1`.
- `corpus/knowledge/` — 2: `harness-hardening-round-18.md`
  sha256 `b4aae6a26bdb26d5eaf358012bc6889d399dafba7e8f799013a6c539dfc63816` (the used-by target for
  S059–S064), `source-recheck-round-18.md`
  sha256 `f66801cb16ef9ef2c353fb02158bd11bdd052703723db1bb1383191643e13540`.
- `corpus/lessons/round-18.md` — 1.

All 217 added `.json` files parse; 0 added files are 0 bytes. The 7 rerun receipts exist as
`run-1..run-7.json` plus `index.json` (index lists 7 runs); `run-1.json` carries
`producerSha256=de62820dd35e5cf7804b656ef3fe1678da8a15bdf4248c8b7fa737f878b052d7` (round-17 harness
frozen) and `verdict=pass`. No tracked file under `corpus/evidence/round-18/` or the rest of the delta is
untracked; `git status` shows only the wave-2 directory.

## 9. Mined used-by references

48 mined rows; **0** have `—`/empty used-by. They produce 56 references over 12 distinct paths
(8 queued and 8 rejected rows carry `—`). Every reference: exists on disk, resolves inside LANE, is
tracked at REV, and the cited file contains its own row id at an id boundary. 0 missing, 0 uncited,
0 escapes. Paths:

`corpus/knowledge/aria-loopback-round-13.md`, `corpus/knowledge/chrome-remote-debugging-profile-boundary.md`,
`corpus/knowledge/harness-hardening-round-18.md`, `corpus/knowledge/playwright-accessible-locators-and-snapshots.md`,
`corpus/knowledge/source-recheck-round-12.md`, `corpus/knowledge/web-flake-retry-evidence.md`,
`corpus/knowledge/webdriver-bidi-capability-matrix.md`, `corpus/knowledge/webmcp-chromium-loopback-round-16.md`,
`corpus/knowledge/webmcp-invocation-round-17.md`, `corpus/lessons/kaika-fleet-round-1.md`,
`corpus/lessons/round-14.md`, `corpus/lessons/round-15.md`.

S058 cell audit (C3 D4 shape, verified independently): `teaches` starts `supersedes S057 —`, contains
`REJECTED:` and `flip:`, and **no** S058 cell contains `individual publisher`. Only the explicitly
superseded S053/S057 rows retain that phrase, as the lesson states
(`corpus/lessons/round-18.md:57-58`).

## 10. Report-path audit (misroot / dangling), 221 tracked doc-like files + wave-2 dir

Scanned added bytes (M files: added lines only) of every `.md/.json/.mjs/.txt/.tsv` in the B..REV delta,
plus `.ufo/waves/round-18/w2/*.md` (none owned by this seat at scan time).

Absolute paths: 238 distinct, 1566 occurrences — 228 exist under LANE, 8 exist under the fleet root
(legitimate fleet-level files), 2 do not exist. Both missing absolute paths are non-citations:
1. `/home/vgpnk/Projects/shokunin/scripts/webmcp-invoke-round17.mjs` — inside a **quoted runtime error**
   ("Cannot find module …") in `.ufo/waves/round-18/w1/R17RedSignals.md:197`; the lane copy
   `/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/webmcp-invoke-round17.mjs` exists.
2. `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/webmcp-invoke-fixtures/` — the
   wave-1 task prompt's **conditional** new directory ("only if the harness keeps fixtures in files; …
   prefer embedding"). The shipped harness embeds fixtures, so its absence is compliant.

Lane-relative tokens: 383 distinct, 3731 occurrences — 352 resolve in LANE; 7 resolve only at the fleet
root and are explicitly labeled fleet (`SOURCES-CONTRACT-v1.md`, `.ufo/l0-questions.md`,
`.ufo/reports/round-17/tabi.md`, `.ufo/waves/kaika-w1/mistakes.md`, `scripts/hyaku/lane-addendum.md`,
`scripts/sources-census.sh`, `.ufo/state/`); 11 resolve only inside a named sibling repository and appear
with `sibling@commit:` context (kama, kaidoku, chousa, kake, kasegi, kotodama, mori, kotoba, mado, kagi);
13 do not resolve to a file. Of those 13: 1 is a revision-qualified base file that exists
(`corpus/lessons/round-17-verifier-spotcheck.md@2bff86…`), 3 are placeholder lesson names in
`harm-baseline.json` expectation text, 2 are counter negative/temporary paths
(`corpus/evidence/round-13/aria/other.json` in `measure-c1.mjs`, `scripts/.measure-c2-watchdog-probe.mjs`
in `measure-c2.mjs`), 1 is explicitly negated (round-17 download fixture), 1 is cited as absent
(round-17 routed self-test), 1 is a hypothetical sandbox example (`source-recheck/S061.json` in
`w1/ReconGates.md:72`), 1 is a recommendation not yet created
(`corpus/evidence/round-18/measurement-binding.json`, `w1/ReconGates.md:150`), 1 is the conditional
fixtures directory, 1 is the `scripts/webmcp-invoke-roundNN.mjs` naming template, and 1 is a genuine
dangling note reference: **`corpus/adjacency.md` at `.ufo/waves/round-18/w1/ConnL0.md:44`** (absent in
LANE, fleet root, and every sibling; only occurrence). It is a wave-1 note phrase ("`corpus/adjacency.tsv`
/ `corpus/adjacency.md`"), not a misroot (it is not a fleet-root path) and no gate reads it.

Conclusion: no citation is rooted at the fleet root when the lane copy was meant; no lane file is cited
with a missing `tabi-shokunin/` component except the quoted failure text. Report paths are misroot-free;
the single dangling note reference is recorded below as non-blocking. This report itself uses
lane-absolute paths only.

## 11. Non-blocking observations (do not change VERDICT)

1. `corpus/adjacency.md` (`w1/ConnL0.md:44`) does not exist; `corpus/adjacency.tsv` does. Wave-1 evidence
   only; production untouched.
2. `w1/ReconGates.md:150` recommends a round-18 `corpus/evidence/round-18/measurement-binding.json`; none
   exists. `scripts/check-round-contract.mjs` and `scripts/check-user-round-contract.mjs` contain 0
   occurrences of `measurement-binding`, and `check-measurement-binding.mjs` is opt-in per manifest, so
   this is an open recommendation, not an observed gate red. Round-18 claims are instead bound by
   `measure-{c1,c2,c3}.mjs` producer hashes and the receipts above.
3. Census `W04` for S058 is expected for the supersession family and is warning-only (exit 0, `ok`);
   check-sources exempts a `supersedes S…` row from `E04`. Neither gate reports a failure.
4. S053/S057 retain the old "individual publisher" phrase as superseded history (lesson
   `corpus/lessons/round-18.md:57-58`); S058's cells are clean, so the D4 shape holds.

## 12. Limits (what was not run, and why)

- `measure-c1.mjs`/`measure-c2.mjs`/`measure-c3.mjs` were not executed and C2 behavioural/browser probes
  were not run — those are the counters' own seats; this seat verified their inputs and evidence shapes.
- No live HTTP re-fetch (`--live`) was performed; receipt internal binding and excerpt digests were
  re-verified from committed bytes instead.
- No sandbox `git clone` was required: the worktree is clean at REV for every scanned tracked input, and
  the two gate inputs were proven byte-identical to their REV blobs. Self-tests used private `TMPDIR`s
  (`/tmp/tabir18-sc-*`, `/tmp/tabir18-census-*`) and left them empty/deleted.
- No declaration about C1/C2/C3 score movement is made here.

## Files written

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/SourceConformance.md`
