# Round 31 a2w1 — ExecCensus: census and source gates at REV

Seat: ExecCensus (leaf, falsify wave). Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
REV `486048356f0712e4396588c9dab58cd419243120`; baseline `96a2d1a3e04a1d482a1bd8bfa97343bcc2acf3bc`;
freeze `9505a10eb80b2a0b273ebaba3f7f872ad302192d`. Clean clone at REV
(`git clone --shared … "$S/clone" && git -C "$S/clone" checkout -q REV`, porcelain 0 lines),
scratch `$HYAKU_SCRATCH/tabi-r31/ExecCensus` with `HYAKU_SCRATCH=/fast/scratch/hyaku`, `TMPDIR`
under it.

## Verdict

The census and source gates hold at REV, and the round's registry delta is exactly what the
frontier step claims. All three assigned commands exit 0 on a clean REV clone: `check-sources.mjs`
reports `verdict=clean rows=122 tiers=A:107,B:6,C:9 status=queued:15,mined:98,rejected:9
findings=0`; `sources-census.sh validate` (both `--file` on the clone and the round-end
`--root … tabi`) reports **19 W04, identical to the round-start 19** (byte-identical warning set,
verified by set diff and by an independent reimplementation of the tool's W04 rule that predicts
the same 19 ids and no others); the registry grows **118 → 122 rows** by exactly four added lines
(S119–S122, all `mined`, all tier A, all `used-by corpus/knowledge/rate-signal-decision-table.md`)
with **0 removed and 0 rewritten** lines, and the status histogram moves only
`mined 94→98`. Every `CORPUS.md` §Census manual command reproduces the maintained parser's numbers
exactly (rows 122, malformed 0, tiers A=107/B=6/C=9, statuses mined=98/queued=15/rejected=9,
no duplicate ids, no enum/tier-inflation violation, no missing `used-by` path). I found **one
defect, minor and outside every gate's read**: the C1 entry states `recheck: 180d` for S119/S120
while the registry rows for the same two RFCs state `365d`, and no gate parses an entry's `recheck`
value, so the contradiction is invisible to the fleet. On the duplicate-URL surface the two gates
are *not* interchangeable and neither covers it alone: `check-sources.mjs` fails any repeated URL
regardless of scope but exempts a row whose `teaches` opens `supersedes S###` — including an
unresolved target such as a nonexistent `S999`, measured on a fixture — while the census never
fails a cross-scope repeat (W04, warn-only) and its E04 is same-`(url, scope)` only. This round's
registry does not exploit the gap: all 19 W04 rows are anchored `supersedes` correction rows and
all 34 supersedes references resolve to existing ids.

## Commands and exit codes (all run in `$S/clone` unless stated)

```
$ node scripts/check-sources.mjs
SOURCES_GATE verdict=clean rows=122 tiers=A:107,B:6,C:9 status=queued:15,mined:98,rejected:9 findings=0 file=corpus/SOURCES.md
[exit 0]                                                                -> receipt check-sources.txt

$ /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file "$S/clone/corpus/SOURCES.md"
… 19 × "file<TAB>W04<S id> duplicate url … across scopes" ; file<TAB>ok<TAB>$S/clone/corpus/SOURCES.md
[exit 0]                                                                -> census-validate-file.txt

$ /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi
… 19 × "tabi<TAB>W04 …" ; tabi<TAB>ok<TAB>/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md
[exit 0]                                                                -> census-validate-root.txt

$ /home/vgpnk/Projects/shokunin/scripts/sources-census.sh census --root /home/vgpnk/Projects/shokunin tabi
tabi rows 122 | tier.A 107 tier.B 6 tier.C 9 | status.mined 98 status.queued 15 status.rejected 9
FLEET rows 122 … missing 0
[exit 0]                                                                -> census-mode-lane.txt

$ /home/vgpnk/Projects/shokunin/scripts/sources-census.sh census --root /home/vgpnk/Projects/shokunin   # scoping control, no lane filter
FLEET rows 3217 tier.A 2669 tier.B 433 tier.C 115 status.mined 2722 status.queued 289 status.rejected 206 missing 0
[exit 0]                                                                -> census-mode-fleet.txt

$ /home/vgpnk/Projects/shokunin/scripts/sources-census.sh selftest
killed … W04-scope-sensitive-mutant, W04-does-not-fail-validation, E04-rejected-pair-exemption(-exit-0) …
selftest ok
[exit 0]                                                                -> census-selftest.txt

$ /home/vgpnk/Projects/shokunin/scripts/sources-census.sh overdue --root /home/vgpnk/Projects/shokunin tabi
… cadence lines incl. S119 recheck=365d, S120 recheck=365d, S121 recheck=90d, S122 recheck=90d ; no overdue line
[exit 0]                                                                -> census-overdue.txt
```

`FLEET rows 122` in the lane-restricted run is scoping, not a fleet total: with no lane filter the
same root reports 3217 rows (21 child lanes). The lane filter therefore makes the round-end exit 0
a statement about tabi only.

`validate --file` needs the registry inside a lane tree: it anchors `used-by` path resolution at
`realpath(dirname(file)/..)` (`scripts/sources-census.sh:495-502`). A bare copy of `SOURCES.md`
outside a lane tree (my first baseline extraction, `$S/base-SOURCES.md`) yields 136 E11 lines and
**exit 1** with the same 19 W04; the same bytes under `$S/base/corpus/SOURCES.md` yield `ok`, exit
0. The assigned `--file "$S/clone/corpus/SOURCES.md"` is correct; the trap is only for detached
copies.

## Round start vs REV

| metric | round start `96a2d1a` | REV `4860483` | source |
|---|---|---|---|
| rows | 118 | 122 | `grep -cE` on both blobs; maintained `census` mode 122 |
| malformed rows (NF≠13) | 0 | 0 | manual awk; no census E01 |
| tier A/B/C | 103/6/9 | 107/6/9 | manual awk; census `tier.*`; `check-sources` |
| status mined/queued/rejected | 94/15/9 | 98/15/9 | manual awk; census `status.*`; `check-sources` |
| W04 warnings | 19 | 19 | `census-start.txt`, `validate --file`, `validate --root` |
| duplicate ids / enum / tier inflation / missing used-by | none | none | manual awk; no E02–E07, E10, E11 |

Receipts: `baseline-recompute.txt` (baseline rebuilt with
`git -C clone archive 96a2d1a | tar -x -C base`, `validate --file base/corpus/SOURCES.md` exit 0,
19 W04), `w04-rev.txt`, `w04-baseline-tree.txt`, `w04-set-diff.txt` (`diff` of the round-start
warning set against the REV set: no output = identical; likewise baseline-tree vs REV).

Registry delta, measured: `git diff --numstat 96a2d1a 4860483 -- corpus/SOURCES.md` → `4 0`, and
`diff base/corpus/SOURCES.md clone/corpus/SOURCES.md` shows exactly four `>` lines (S119, S120,
S121, S122) and zero `<` lines — no in-place edit of any pre-existing row (status, recheck or
used-by) in round 31. Rows sit at `corpus/SOURCES.md:133-136`, ids contiguous after S118, each
`mined | 2026-10-26 | used-by corpus/knowledge/rate-signal-decision-table.md`; the entry's four
`source: S119/S120/S121/S122` lines (`corpus/knowledge/rate-signal-decision-table.md:4-7`) make the
`used_by_uncited` direction clean too.

## Manual `CORPUS.md` §Census commands vs the maintained parser

`manual-census.sh` runs the frozen §Census block verbatim from the lane root and prints each exit
code (`manual-census.txt`):

| manual command | output | maintained/`check-sources` |
|---|---|---|
| rows (`grep -cE`) | 122 | 122 / `rows=122` |
| malformed (`awk NF!=13`) | 0 | no E01 |
| tier histogram | `A=107 B=6 C=9` | `tier.A 107 tier.B 6 tier.C 9` |
| status histogram | `mined=98 queued=15 rejected=9` | `status.mined 98 …` |
| duplicate ids | nothing | no E03 |
| enum violations / tier inflation | nothing | no E05/E06/E07/E10 |
| mined `used-by` path missing | nothing | no E11 |

All seven exit 0. Agreement is exact, so the frozen column-zero examples and the maintained
0–3-space-tolerant parser see the same table (no row is indented; a row indented 1–3 spaces would
have shown as a smaller manual count — it does not).

## Attacks run (falsification attempts that failed to falsify)

1. **Is W04 under-reported?** `w04-predicate.py` reimplements `url_of()` and the W04 condition from
   `scripts/sources-census.sh:600-607, 644-645` independently: `predicted 19, observed 19, equal:
   true`, `predicted-not-observed: []`, `observed-not-predicted: []` (`w04-predicate.txt`). A naive
   "all but first row per URL group" guess predicts 21 and appears to show 2 missing (S054, S057);
   both are `supersedes` correction rows whose `(url, scope)` pair was already registered, which the
   tool deliberately skips. The four same-`(url, scope)` pairs in the registry
   (S004/S028, S039/S040, S049/S055, S050/S056) are all `supersedes` or rejected-pair exemptions —
   the rule the selftest mutant `E04-rejected-pair-exemption` pins.
2. **Could the round-end exit 0 be reading a dirty tree?** The command has no revision pin, so I
   checked the file it read: lane `corpus/SOURCES.md` sha256 `ad70bbffb7dadda65848e8321620960b85
   04141ec46bdcd71e42a6dd5fdd9789` = the REV blob; `git -C tabi-shokunin status --porcelain` = 6
   lines, all untracked `.ufo/waves/round-31/a2w1*`, none under `corpus/`; `git diff --stat REV --
   corpus/` empty. The exit 0 therefore covers REV content — but only because I verified it by hand:
   the command itself would silently accept uncommitted registry edits.
3. **Were the gates or counters edited to pass?** `git diff --name-only 9505a10 4860483 -- scripts/`
   → 0 files; the two frozen counters still hash to `claims.json` `frozenDigests`
   (`d15f3bd7…f6832`, `143d66ff…db2fce`) at REV; `git diff --name-only 9505a10 4860483` changes only
   13 `corpus/` paths, `SKILL.md` and `SCORECARD.md`. Tip `ae15a37` adds 0 files outside
   `.ufo/waves/round-31/`, so the checkout content equals REV for every file I read.
4. **Do the four new rows smuggle a duplicate?** None of their URLs occurs in the baseline registry
   (`W04` set unchanged), and no E04 fires.

## Defect found

**D1 (minor, freshness consistency; invisible to every gate).** The C1 entry's cadence for S119/S120
contradicts the registry rows it cites, with the same justification in both places:

- `corpus/knowledge/rate-signal-decision-table.md:8` — `recheck: 180d for S119 and S120
  (standards-track RFC text, which changes by errata only — re-open and re-locate every span); 90d
  for S121 and S122 …`
- `corpus/SOURCES.md:133` (S119) and `:134` (S120) — field 11 = `365d`, the cadence `overdue` mode
  schedules (receipt `census-overdue.txt`: `S119 recheck=365d`, `S120 recheck=365d`).

Nothing reads the entry's value: `check-frontier-admission.mjs:244` tests only
`/^recheck:\s*\S/` (presence); `check-sources.mjs:322` validates the registry cell's *format*;
`check-freshness.mjs` contains no `recheck` handling at all. So the entry promises re-open at 180d
while the registry schedules 365d, and no gate, no exit code and no warning reflects it. The
delivered wave-1 drafts disagree the same way (`w1/ScribeSourcesRows/rows.md` "recheck: `365d` for
the two published RFCs" vs the entry's 180d), i.e. the divergence was introduced when the two
documents were integrated, not by the gate. It does not touch either claim's predicate; it is a
data-integrity defect in the round's own output.

## Holes confirmed as design or measured on fixtures (recorded for the routed list)

- **The duplicate-URL surface is split across two gates with different rules, and one exemption is
  unguarded.** Measured (`duplicate-rule-divergence.txt`, fixtures
  `fixture-cross-scope-sources.md`, `fixture-fake-supersedes-sources.md`):
  `check-sources.mjs` keys on the URL alone (`normalizeUrl` strips `www.` and one trailing slash,
  `scripts/check-sources.mjs:180-187`) and exempts only a `teaches` that *opens*
  `supersedes SNNN` (`:292-298`); the census keys E04 on URL-*and*-scope
  (`scripts/sources-census.sh:646-650`) and never fails a cross-scope repeat, which it emits as W04
  (`:644-645`, warning-only per `:33` and pinned by the selftest mutant
  `W04-does-not-fail-validation`). Two consequences I measured: (a) the same three-row registry
  exits 1 from `check-sources` (`duplicate_url` on the cross-scope repeats) and exits 0 from
  `sources-census.sh validate` (two W04 lines); (b) a row can suppress the failing form with a
  `supersedes S999` token whose target does not exist — `check-sources` stays clean on it and the
  census only warns. In this round's registry the exemption is not abused: all 19 W04 rows are
  anchored `supersedes` rows and all 34 supersedes references resolve to existing ids
  (`supersedes-targets.txt`, 0 unresolved), so the clean exit 0 is not vacuous.
- Rows whose `source` cell carries no URL (3 rows: S029, S067, S101, all `own-work` with repo paths)
  are outside W04/E04 by construction — neither gate has a duplicate check for them.
- `check-sources.mjs` resolves its repo from the script location (`defaultRoot = dirname(script)/..`,
  `:22-23`) and needs `--root`/`--file` to read a registry elsewhere; run from a foreign cwd it
  silently grades the script's own repo (measured: my first fixture run re-reported `rows=122`).

## Evidence retained (`.ufo/waves/round-31/a2w1/ExecCensus/`)

`check-sources.txt`, `census-validate-file.txt`, `census-validate-root.txt`, `census-mode-lane.txt`,
`census-mode-fleet.txt`, `census-selftest.txt`, `census-overdue.txt`, `manual-census.txt` +
`manual-census.sh`, `w04-predicate.py` + `w04-predicate.txt`, `w04-rev.txt`,
`w04-baseline-tree.txt`, `w04-set-diff.txt`, `baseline-recompute.txt`,
`supersedes-targets.txt`, `duplicate-rule-divergence.txt`, `fixture-cross-scope-sources.md`,
`fixture-fake-supersedes-sources.md`, `summary.txt` (REV/baseline/
freeze, file sha256s, tool versions: node v24.21.0, GNU Awk 5.4.1, `sources-census.sh` sha256
`3fb72615…4e30`). Every counter output was written to a file and never piped into a JSON reader.

## Tooling, risks, blockers

No installs, no upgrades (nothing needed; no pacman transaction attempted). No network fetch was
required for this item — every input is committed bytes or the lane checkout read-only. Risks: the
round-end census command is unpinned to a revision (D1's neighbour risk, mitigated only by hand
verification above); cross-scope duplication fails only in `check-sources`, and an anchored
`supersedes` token whose target is unchecked suppresses that failure in both gates (fixture B), so
the two gates must both keep running — neither replaces the other. No blockers; nothing was
repaired (attack seat).
