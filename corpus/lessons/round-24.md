# Round 24 — gate-registry conformance, calibration counter, bfcache frontier entry

Round 24 (hyaku run 6), baseline `573c99e4885382db38babc3a6fc90e77afeb42a6`. Three claims,
frozen in `.ufo/waves/round-24/claims.json` before either instrument existed. Claims and verdicts:
`SCORECARD.md` §"Round 24 — declared claims" and §"Round 24 — executed disposition".

## Gate

Sources opened by this lane this round (every quote located in bytes fetched on 2026-10-25, ≤25
words; the lane re-fetched both itself — the wave-1 scout copies are a second read, not the
authority):

| Row | URL | Opened | Located quote |
|---|---|---|---|
| S104 | https://web.dev/articles/bfcache | 2026-10-25, 157667 bytes, sha256 `0dd45292df5288f84748b4d5087ed1c69b0b98eb27dc46eaf7c50c9ffaf28e07` | line 2531 (markup-stripped; the raw bytes carry `<em>` around "essentially instant"): "Loading the previous page is essentially instant, because the entire page can be restored from memory, without having to go to the network at all." |
| S105 | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/Page.pdl?format=TEXT | 2026-10-25, 61911 bytes decoded from a 82548-byte base64 transfer, sha256 `e944a3b19fa2c87b4ed0a84cca85b16b127618725394496ba046a2dfdf9405be` | decoded line 1345: `NavigationType` enum carries `BackForwardCacheRestore`; line 1706: `experimental event backForwardCacheNotUsed` with required `notRestoredExplanations` |

Both bytes sets are committed at `corpus/evidence/round-24/sources/` (the fetch, not a copy of the
page's rendered text). Census: `scripts/sources-census.sh validate --root … tabi` exit 0 at round
start (103 rows, 16 W04 warnings) and at round end (105 rows, same 16 warnings; the two new rows
add no duplicate URL). Id-collision check before the append: lane ids S001–S103, staged ids
S102–S249, intersection 2 (S102/S103, already landed), candidate ids S104/S105 free in the
lane registry (`.ufo/waves/round-24/assimilation/`). The staged package itself also carries
S104/S105 (different sources), so a future adoption must renumber by document, per §10.
S104/S105 were chosen this round for the two rows this lane actually appended.

Admitted: `corpus/knowledge/navigation-history-bfcache-evidence.md` (documented-upstream; no
browser ran, no restore observed, no measured credit). Rejected this round: nothing was offered
for adoption — `Assimilation: none`; the round-23 quarantine verdicts keep package adoption
closed, and no theme was taken.

Freshness note found by the gate's own honesty rule: the web.dev article is a live page and
**changed between two fetches inside this round** — a scout's copy and this lane's copy are both
157667 bytes with different sha256 (`4535f93b…` vs `0dd45292…`). The row carries this lane's own
digest and its quoted spans are dated, not stable; the entry's U4 records it.

## Mistakes

### M1 — a counter that infers an association manufactures findings (this round's own)

- **Class:** measurement (the counter, not the lane, was wrong).
- **Evidence pointer:** the first tip run of `scripts/check-selfassessment.mjs` compared every
  tally line against every script named in its section, so lines like 1192 (`check-sources`
  cases=26) were also compared against `round-evidence-audit` (13), `check-adjacency` (57),
  `check-measurement-binding` (76) and the rest — a cross-product of the section's script names
  and its tally lines, counting a hundred manufactured findings (the exact pre-fix count differed
  per run and was not committed; the class reproduces at line 1192 with the post-fix code
  reading one pair per line).
- **Captured-by:** none at the time — the self-test matrix had no case with two scripts in one
  section, and the claim's kill rule ("a class that fires on a correct line is not a predicate")
  existed as prose but had no fixture behind it.
- **Fix (shown able to fail):** association is per line — a tally belongs to the scripts named on
  its own line, else to the section's single script, else it is `could-not-evaluate`
  ("ambiguous script association") and is never counted. The gate now carries case
  `m1-ambiguous-association-is-not-counted` (two scripts in one section, a tally line naming
  neither → clean, exit 0) and `cases=13`. QUALITY criterion 65 encodes the rule.

### M2 — a documented number is stale the moment its instrument changes (this round's own)

- **Class:** self-assessment drift.
- **Evidence pointer:** `SKILL.md` row for `selfassessment-counter` and the SCORECARD capability
  row both said `cases=12` after the gate's matrix grew to 13 cases in the same session
  (`grep -c 'CASE'` → 13). The calibration gate itself flagged the SCORECARD mention on its next
  run, which is the point of the gate.
- **Captured-by:** `scripts/check-selfassessment.mjs` class `m1-selftest-tally` (this round's C2
  capability) — the instrument caught its own documentation.
- **Fix:** every mention corrected in the same round (SKILL.md row, SCORECARD capability row,
  QUALITY 65, the receipt's `selftest.cases`), and the corrections block states the value the
  gate measures.

### Inherited mistake (round 23's M5) and what closed it

Round 23 committed 1,034 scratch paths / 25.7 MB. The captured-by it recorded was "nothing said
the landing must exclude them". This round closes it structurally, not by care: `.gitignore` now
carries `.ufo/waves/*/scratch/`, the 1,034 paths are deleted in one commit (`9e52cb2`), and every
round-23 document that cites a scratch path still resolves — the bytes are readable at `573c99e`
(`git show 573c99e:.ufo/waves/round-23/scratch/<path>`). The one non-scratch deletion in the
same commit was the empty `w2-record.err` (junk; `W2CorrRegistry.md:19` names it and still resolves
at `573c99e`). The retention alternative (copy the 58
exact-cited files, 2.14 MB, into `corpus/evidence/round-23/retained-scratch/`) was considered and
refused: the citing strings name the old paths, so a copy repairs no pointer, while git history
keeps every byte addressable at a named revision.

## Corrections

| Superseded figure | Where it stood | Superseding statement |
|---|---|---|
| `round-evidence-audit` `--selftest` 12/12 and "12-case matrix" | `SCORECARD.md:1138`, `:1139`, `:1151` | cases=13, passed=13 (13th case landed in `43e9bb5`); SCORECARD §Round 24 corrections |
| `check-sources` twenty-five cases | `SCORECARD.md:410`; the round-23-era SKILL.md row | cases=26 |
| `check-freshness` eight cases | the round-23-era SKILL.md row | cases=12 |
| 89 unlanded paths at round-23 closure | `corpus/lessons/round-23-verifier-spotcheck.md` §4.2 | `git status --porcelain` empty at the round-24 tip; the composition follows the verifier's own classification (67 empty numeric-named files, 4 empty `.err` captures, untracked seat-scratch subtrees and the 91-file assimilation mirror deleted; the 2 rewrite-in-progress files restored from the branch; the 1 late seat append committed in `16fa92f`) |
| 1,034 committed scratch paths | `corpus/lessons/round-23-verifier-spotcheck.md` §4.3 | 0 at the round-24 tip (`git ls-tree -r master .ufo/waves/round-23/scratch \| wc -l`) |
| `c1-measurements.json` `before.exit: 1` | `corpus/lessons/round-23-verifier-spotcheck.md` §4.5 | does not reproduce: `git show c90dffd:…` and `573c99e:…` both read 128; the stale `1` lived at `03c1b4d` until `7ac9fff` |
| Wave-1 prototype "4 findings / 3 classes, 3/6 repairs" for the auditor's evidence-keyed matrix | `.ufo/waves/round-24/w1/ExecMismatchProto.md` | the shipped auditor returns 7 findings / 6 classes, 6/6 repairs, clean (`--selftest --rev 03c1b4d… --round 22 --round-cap 128`); the prototype's number is recorded as a prototype defect, not as a lane figure |

## Wave-2 falsification of the first C2 filing, and the clean-tree fix

The 33-seat falsify wave reproduced C2 as committed as `mismatches=1` at the mid-wave tip, because
`m3-unlanded-paths` reads the live working tree and the wave's own artifacts were uncommitted. The
frozen claim's `after` was therefore meaningless until the final clean tree existed. The round's
answer is not to soften the number: the final receipt `c2-tip.json` records `mismatches=0`,
`clean=true`, measured at `3069ca9` with `git status --porcelain` = 0, and the instrument's
tree-dependence is a disclosed property (QUALITY 65) rather than a hidden one. The counter's m2
class is disclosed as a null class (one supported receipt decodable, the other 75
could-not-evaluate) — the kill rule's disclosure demanded it, and the report's wave-2 section
carries it. Wave-2 also falsified C1's "whole gate set" wording (the derived universe is 14 gates,
and five wave-local gates declared in earlier rows are outside it) and C3's presence-proxy metric
(the quote control is not a scripted check); both are recorded as instrument limits in the report.

## Open, carried

- `LOG.md:1664` still reads twelve for the auditor's self-test; it is a dated journal entry bound
  to `03c1b4d` and self-corrects in its own post-landing block. The counter's m1 window is
  SCORECARD.md by declaration (`RevCounterScope` finding); widening it to non-revision-bound LOG
  entries is a next-iteration, not a claim of this round.
- Four lane self-tests rewrite tracked receipts when run (`corpus/evidence/round-19/selftests/`
  `c1.json`, `c3.json`, `isolation.json`, and `c2.json` byte-identically). They were restored this
  round; the isolation defect is a sibling observation, reported, not fixed here.
- The adjacency-map registry table has no `Kind` column, so the conformance gate reports
  `check-adjacency` as `e1-missing-row` rather than `e2-field-incomplete`. The restatement gives it
  a kind; whether the historical table should be repaired in place is left to a later round
  (append-only).
