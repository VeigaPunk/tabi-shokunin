# ExecReleasePinsTip — round 30 w2 (falsify): are the round-29 readings disturbed at 072af95?

**Verdict — holds, with one low-severity disclosure defect named.** I attacked the three round-29 readings at the
integrated tip `072af95fe2822f0785a6ff88a578e2142dd258e5` in a clean `--shared` clone (porcelain empty, node
v24.21.0): `check-release-pins --stable 156.0.8078.47` returns **population 23 / resolved 23 / unresolved 0 /
holds 16 / drifted 7, exit 0**, and its `rows` array is element-for-element identical (ids, verdicts, empty
`reasons`) to round-29's committed measurement at `ab080992` (`.ufo/waves/round-29/measure/c3-release-pins-rev.json.txt`,
sha256 `edd80578…d1a1c`); `check-s106-evidence --json` returns **valid true, exit 0** with the same decoded sha,
anchor line 187, occurrences 1; `check-selfassessment` returns **mismatches 0, clean, exit 0** with the counter
bytes frozen at round 29 (`72812800…a560c4`, unchanged). The two gates C1 edited are the only scripts whose bytes
moved, and their **production logic is unchanged**: `check-release-pins.mjs`'s whole pre-self-test prefix hashes
identically at `f7c0317` and `072af95` (`ccf9ee3f…d056`), `check-s106-evidence.mjs`'s prefix differs by one docstring
word pair ("7 isolated cases" → "10") and is byte-identical comment-stripped (`1634a064…1506`), and all 20 round-29
pins self-test cases plus all 7 s106 cases survive at the tip with identical expected/actual exits (29/29 and 10/10
pass). No file under `corpus/evidence/round-29` or `.ufo/waves/round-29` changed (`git diff --name-only` = 0 paths).
On the assigned question — **S118 does not enter the release-pin population, and cannot under the frozen rule**: its
`corpus/SOURCES.md:132` source cell is a GitHub blob URL at devtools commit `66df492…` with no `refs/tags/…`, and the
population expression (`scripts/check-release-pins.mjs:178`) reads tags from the source cell only (`:128`); it is the
**seventh** `on-release` row pinned to Chromium 154 through the DEPS line (the round's own evidence,
`corpus/evidence/round-30/s118/DEPS.154.0.8037.97.lines420-425.txt:424`, names `66df492…` as `devtools_frontend_revision`).
A one-line probe commit making its source cell a Gitiles `refs/tags/154.0.8037.97/` URL moves the counter to
**population 24, unresolved 1, `r1-entry missing or no files`, exit 1** — so the exclusion is load-bearing and the
alternative fails loudly, not silently green. The defect is that the round's own excluded-class disclosure is one row
stale: `corpus/lessons/round-30.md:228-231` names "six rows" with a `061e6202` stamp ("23 of 89"), and
`corpus/QUALITY.md:446-452` (added by the same commit `072af95` that added S118) illustrates the duty with "the two
DEPS-pinned rows (S044, S068)" — at the tip the class has seven and the denominator is 90, and S118 is named nowhere
as excluded, while the counter prints no `excluded` list. Severity low: no round-29 number changes, the claims'
`notClaimed` line covers DEPS-pinned row semantics, and the omitted row's 154/156 recheck was performed by hand this
round.

## Commands, exit codes, retained bytes

Clone (one live clone per seat):

```
S=/fast/scratch/hyaku/tabi-r30/ExecReleasePinsTip        # TMPDIR
git clone -q --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"
git -C "$S/clone" checkout -q 072af95fe2822f0785a6ff88a578e2142dd258e5
git -C "$S/clone" rev-parse HEAD          # 072af95fe2822f0785a6ff88a578e2142dd258e5
git -C "$S/clone" status --porcelain | wc -l   # 0
node --version                            # v24.21.0
```

### 1. Release pins (round-29 C3)

```
cd "$S/clone"
TMPDIR=$S node scripts/check-release-pins.mjs --rev 072af95fe2822f0785a6ff88a578e2142dd258e5 \
  --stable 156.0.8078.47 --json > $S/pins.json
echo $?                                   # EXIT=0
```

2719 B, sha256 `eba4f81914bb505f2572794f846f7ab7ebcf312022a29d4e41d695d84c68e9da`
(`w2/ExecReleasePinsTip/c1-pins-tip.json`). Reading:
`schema tabi-release-pins-v1, stable 156.0.8078.47, receipt corpus/evidence/round-29/release-pins/receipt.json
(receipt_present true), population 23, resolved 23, unresolved 0, holds 16, drifted 7, clean true`.
Top-level keys: `schema,rev,stable,receipt,receipt_present,population,resolved,unresolved,holds,drifted,rows,clean`.
Drifted ids, each resolved through `superseded_by` with `reasons: []`: `S042, S071, S078, S080, S081, S096, S100`.

Identity against round-29's committed record (rev `ab080992`, sha256 `edd80578…d1a1c`; its file carries a trailing
`exit=0` line, so I compared the JSON slice):

```
identical rows/verdicts (ignoring rev): true      # population,resolved,unresolved,holds,drifted,rows,clean,receipt,stable
id set identical: true
r29 rev=ab080992 clean=true | tip rev=072af95 clean=true
```

Determinism: a second run in the same clean checkout produced byte-identical output
(`cmp` → `BYTE_IDENTICAL=yes`, sha256 `eba4f819…e9da` twice, `w2/ExecReleasePinsTip/c1-pins-tip-rerun.json`).

Receipt shape (round-29 receipt, unchanged tree): 23 rows, id set exactly the 23 population ids; no entry for
`S044`, `S068` or `S118`; no entry without files.

### 2. s106 evidence gate (round-29 C1)

```
TMPDIR=$S node scripts/check-s106-evidence.mjs --rev 072af95fe2822f0785a6ff88a578e2142dd258e5 --json > $S/s106.json
echo $?                                   # EXIT=0
```

758 B, sha256 `707bb09365d6752f0c61f1ffd90da18e196db5764d543d8c57a3974a656c9913`
(`w2/ExecReleasePinsTip/c1-s106-tip.json`):

```
receipt corpus/evidence/round-26/sources/s106.json, bytes_path corpus/evidence/round-26/sources/content-features-154.0.8037.97.cc
present true, decoded_bytes 73952
decoded_sha256_claimed = decoded_sha256_observed = 9b93fe64843ecf819202fa6de9833597203b3f53f6572c144b76f247424e6c44
sha_match true, revision_match true
anchor {line 187, text "BASE_FEATURE(kBackForwardCache, base::FEATURE_ENABLED_BY_DEFAULT);", occurrences 1}
anchor_located true, anchor_unique true, byte_count_match true, valid true
```

### 3. Self-assessment (round-29 C2)

```
TMPDIR=$S node scripts/check-selfassessment.mjs --rev 072af95fe2822f0785a6ff88a578e2142dd258e5 > $S/self.txt
echo $?   # 0
TMPDIR=$S node scripts/check-selfassessment.mjs --rev 072af95fe2822f0785a6ff88a578e2142dd258e5 --json > $S/self.json
echo $?   # 0
```

Tally: `SELFASSESSMENT verdict=clean rev=072af95fe2822f0785a6ff88a578e2142dd258e5 mismatches=0
could_not_evaluate=92 superseded=15` (`c1-selfassessment-tip.txt`, sha256 `de8e864b…e09a`).
JSON (`c1-selfassessment-tip.json`, sha256 `a52c7d79…2c15`): `mismatches 0, findings 125, counted [], couldNotEvaluate 92,
superseded 15, clean true`.

Round-29 committed at `ab080992` (`c2-selfassessment-rev.json.txt`, sha256 `c19bd983…3e1f4`): `mismatches 0, findings 123,
couldNotEvaluate 92, superseded 12, clean true`. Delta is exactly the disclosure round-30 declared: 3 newly superseded
findings, all in `SCORECARD.md` (lines 1466, 1479, 1485 — the tallies C1's added self-test cases moved), and 2 further
tally findings picked up; `couldNotEvaluate` unchanged at 92; `mismatches` unchanged at 0. Claim target `mismatches = 0`
holds with the frozen counter bytes: `sha256sum scripts/check-selfassessment.mjs` =
`728128008e2242b635bda30a28313de20b06d381d7855f11f18fa5043ba560c4`, identical to
`.ufo/waves/round-29/measure/counter-sha256.txt`.

### 4. Byte-level no-harm of the two C1-edited gates

```
# prefix = everything before the line `// ---- self-test`
git show <rev>:scripts/check-release-pins.mjs | awk '/^\/\/ ---- self-test/{exit} {print}' | sha256sum
```

| file | section | f7c0317 (baseline) | 072af95 (tip) |
|---|---|---|---|
| check-release-pins.mjs | production prefix | `ccf9ee3f…d056` | **`ccf9ee3f…d056`** |
| check-release-pins.mjs | self-test suffix | `53c7f6c7…f805` | `c44f08f3…d81c` |
| check-s106-evidence.mjs | production prefix | `c6731b49…60c9` | `a59bf61c…8f9b` |
| check-s106-evidence.mjs | production prefix, comments stripped | `1634a064…1506` | **`1634a064…1506`** |
| check-s106-evidence.mjs | self-test suffix | `0da31f62…8ebb` | `d0bbaf16…9171` |

The only s106 production-prefix difference is the header comment `7 isolated cases` → `10 isolated cases`.
`diff -u` of the two prefixes shows exactly that one hunk. So round-30's C1 work sits entirely in the fixture/case
section, as its `separability` line requires.

Self-tests at the tip (run in the clone, `TMPDIR=$S`):

```
node scripts/check-release-pins.mjs --selftest --json   # EXIT=0, ok true, cases 29 passed 29, no failing id
node scripts/check-s106-evidence.mjs --selftest --json  # EXIT=0, ok true, cases 10 passed 10
node scripts/check-selfassessment.mjs --selftest        # EXIT=0, SELFASSESSMENT_SELFTEST verdict=clean cases=22 passed=22
```

Round-29's own cases all survive with unchanged expectations: comparing `CASE id=… expected_exit=… exit=… PASS`
lines from `.ufo/waves/round-29/measure/c3-release-pins-selftest.txt` (20 cases) and `c1-s106-selftest.txt` (7 cases)
against the tip results gave **0 missing/changed** cases for both gates. Round-29's s106 mutation receipt
(`corpus/evidence/round-29/s106-selftest/mutation.txt`) is untouched and still red
(`measured-revision-bytes-mismatch expected_exit=1 exit=0 valid=true FAIL`).

`git diff --name-only f7c0317..072af95 -- corpus/evidence/round-29 .ufo/waves/round-29` → **0 paths**.

### 5. The 23 population rows between baseline and tip

Every one of the 23 rows changed in exactly one cell, `used-by`; `source, kind, tier, scope, anchor, teaches,
status, opened, recheck` are byte-identical at `f7c0317` and `072af95`. Round 30 added three rows (`S116, S117, S118`);
all 118 registry rows still split into exactly 13 `|` cells, so none is dropped by the silent
`if (cells.length !== 13) continue;` at `scripts/check-release-pins.mjs:121`.

## The S118 question

**Does S118 enter the release-pin population? No.** Rule as coded
(`scripts/check-release-pins.mjs:178`):

```js
const population = rows.filter((r) => r.recheck === "on-release" && r.tags.some((t) => cmpVersion(t, stable) < 0));
```

with `tags` built from the **source cell only** (`:128`) and `TAG_RE = /refs\/tags\/(\d+\.\d+\.\d+\.\d+)\//g` (`:76`).

S118's row (`corpus/SOURCES.md:132`, at the tip blob) has 13 cells, `recheck = on-release`, `opened 2026-10-26`,
`status mined`, source cell
`https://github.com/ChromeDevTools/devtools-frontend/blob/66df492aaa0129d090937e933dd44c5389ab24d2/front_end/models/web_mcp/WebMCPModel.ts`
— no `refs/tags/`. Its anchor cell carries `Chromium tag 154.0.8037.97 DEPS line 424`, and the tag string appears
nowhere as `refs/tags/…`. The DEPS binding is the round's own committed evidence:
`corpus/evidence/round-30/s118/DEPS.154.0.8037.97.lines420-425.txt:424` →
`'devtools_frontend_revision': '66df492aaa0129d090937e933dd44c5389ab24d2',`. So the row is release-coupled in
substance and invisible to the rule in form — the same shape as S036/S044/S068/S088/S089/S090, with S118 the seventh.

Probe (inside my clone only; nothing in the lane):

```
# single-line rewrite of S118's source cell to a Gitiles refs/tags/154.0.8037.97/ URL, then
git -C clone -c user.name=ExecReleasePinsTip -c user.email=ExecReleasePinsTip@scratch.local commit -am …
#   5f81e02446a8e281ac9370b7aa874a1bce91fa68
node scripts/check-release-pins.mjs --rev 5f81e024… --stable 156.0.8078.47 --json   # EXIT=1
```

Result (`w2/ExecReleasePinsTip/c1-probe-s118-tagged-source.json`, sha256 `fc6865a2…5b6e`):
`population 24, unresolved 1, clean false`, `S118 {"resolved": false, "verdict": null,
"reasons": ["r1-entry missing or no files"]}`, ids end `…,S106,S118`. The clone was returned to the tip
(`git checkout -q 072af95…`, porcelain 0) before the determinism re-run; the probe commit exists only in scratch.

Split recomputed by the same rule over the **committed tip blob** (`git show 072af95:corpus/SOURCES.md`):

```
registry_rows 118 | on_release 90 | included 23 | excluded 67
DEPS-pinned on-release (source cell at 66df492…, no refs/tags): S036, S044, S068, S088, S089, S090, S118   (7)
pinned at the stable tag itself (156.0.8078.47), hence not "below --stable": S109–S115                    (7)
```

### Defect named (severity: low; class: disclosure completeness, not a claim disturbance)

- `corpus/lessons/round-30.md:228-231` (tip, committed) names "**six** rows pinned only through the DEPS-selected
  devtools-frontend commit `66df492…` (S036, S044, S068, S088, S089, S090 …)" and states "Measured at `061e62…`:
  23 of **89** `on-release` rows selected". At `072af95` the same class has **seven** rows and the denominator is
  **90**; the missing member is S118, added by the later round-30 commit. The sentence is not false (it carries a
  revision stamp), but the round's answer to routed defect 5 does not describe the registry it ships with.
- `corpus/QUALITY.md:446-452` (criterion 79, added by the same commit `072af95` as S118) illustrates the duty with
  "the two DEPS-pinned rows (S044, S068)" — inherited from round-29's `notClaimed` phrasing; the live count is 7.
- The counter offers no way to see this: its output has `population` but no `excluded` array, so a reader of
  `population 23` cannot tell that 24 rows are pinned to 154 in substance. This is exactly the limitation
  `QUALITY.md:451-452` records ("no lane instrument prints the excluded class").
- Bound on consequence: no round-29 reading changes (population, ids, verdicts all identical), claims.json
  `notClaimed` names "release-pin counter v2 semantics (id-set population, DEPS-pinned rows S044/S068, refetch
  provenance)" as out of scope, and S118's 154-vs-156 comparison was carried out by hand this round
  (`corpus/evidence/round-30/s118/` holds both devtools revisions — `WebMCPView.ts@66df492` and `…@bf69d041`,
  `models-web_mcp.dir@*`, `fetches.tsv`, `quote-check.txt`, `sha256sums.txt`), so the freshness work exists even
  though the gate cannot measure it. Recommended (not performed): emit the population as an id set plus a reasoned
  `excluded` array, and add S118 to the lesson's named class when the rule text is next touched.

## Falsification attempts that did not break the no-harm reading

1. **Row-identity attack** — `check-release-pins` could be green on different rows than round 29: disproved, id set and
   per-row verdicts/reasons identical (comparison above).
2. **Determinism** — two runs byte-identical.
3. **Silent row drop** — a new row with ≠13 cells would vanish at `:121`: all 118 rows split into 13 cells.
4. **Receipt smuggling** — receipt could have been extended for S118/S044/S068: 23 entries, none of those ids.
5. **Counter substitution** — C1 could have moved production logic: pins prefix byte-identical, s106 code identical
   comment-stripped, selfassessment bytes equal to round-29's frozen sha.
6. **Frozen record editing** — round-30 could have rewritten round-29 measurements: 0 changed paths under
   `corpus/evidence/round-29` and `.ufo/waves/round-29`.
7. **Self-test regression by addition** — all 20 round-29 pins cases and 7 s106 cases survive at the tip with
   unchanged expected/actual exits; both gates 29/29 and 10/10 clean.

## Hygiene

- Only absolute paths were touched: my clone and `$S` under `/fast/scratch/hyaku/tabi-r30/ExecReleasePinsTip`, and this
  report plus its receipt directory `.ufo/waves/round-30/w2/ExecReleasePinsTip/`. No write to the lane checkout, lane
  index, jj state, fleet root, sibling lanes or `/home/vgpnk/Projects/shokuknow`.
- Commits made only inside `$S/clone` with `-c user.name=ExecReleasePinsTip -c user.email=ExecReleasePinsTip@scratch.local`;
  `git rev-parse --show-toplevel` verified as the clone before committing.
- No builds, linters or formatters were run; no network fetches were made (0 HTTPS GETs, so no URLs/times/statuses to
  record); no tools were installed; no subagents or labrat were dispatched.

## Retained receipts

`w2/ExecReleasePinsTip/`:

| file | bytes | sha256 |
|---|---|---|
| `c1-pins-tip.json` | 2719 | `eba4f81914bb505f2572794f846f7ab7ebcf312022a29d4e41d695d84c68e9da` |
| `c1-pins-tip-rerun.json` | 2719 | `eba4f81914bb505f2572794f846f7ab7ebcf312022a29d4e41d695d84c68e9da` |
| `c1-s106-tip.json` | 758 | `707bb09365d6752f0c61f1ffd90da18e196db5764d543d8c57a3974a656c9913` |
| `c1-selfassessment-tip.txt` | 18140 | `de8e864b5a9e6aaaa1f22f1a439a23fc4e5fd2c530b531291abda42d1935e09a` |
| `c1-selfassessment-tip.json` | 45631 | `a52c7d79ef01b74b80e22119fc8106c7eda08b9ef97f30d937cc6b2a0b162c15` |
| `c1-pins-selftest-tip.json` | 8933 | `0b0abcc9a194ef9d1b89b5c784c682c50ac8b21798225b9e3c13de98e4103240` |
| `c1-s106-selftest-tip.json` | 1901 | `bf170e0e593f648339b771f276547d0f69d4239781d2294afe662d624cc8405d` |
| `c1-selfassessment-selftest-tip.txt` | 2284 | `98efa8fd1e3905baf55d94e73546e82709775489573531d258d9327d81448ae6` |
| `c1-probe-s118-tagged-source.json` | 2867 | `fc6865a2b4d80022ac962bc6b40f72c9a646bafd7363fcf9582cb83b8e295b6e` |

## Risks / blockers

None blocking. Residual risks, all bounded and named above: (a) the excluded-class disclosure is one row stale at the
tip it ships with, and the counter prints no exclusion list, so `population 23` reads as a fuller statement of the
freshness surface than it is; (b) S118 (and the six earlier DEPS-pinned rows) will never be re-measured by this gate at
the next stable without the planned counter v2 — the round's own `notClaimed` line covers the semantics, and the manual
154/156 evidence is committed; (c) my probe commit lives only in the scratch clone's reflog and was preceded/followed by
a porcelain-empty tip checkout, so no measurement above was taken on a dirty tree.
