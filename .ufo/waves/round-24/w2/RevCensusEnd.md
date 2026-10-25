# RevCensusEnd — round-end sources census and registry integrity (tabi, round 24, tip ad125e8)

Scope: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi`, row 105,
the "only 2026-10-25 rows" claim, used-by resolution, anchor digests vs committed bytes under
`corpus/evidence/round-24/sources/`. Everything below was re-run against tip
`ad125e85c235e1c4ec6a08e398bd64da01f68a08`; the working tree has no tracked modification
(`git status --porcelain` shows only untracked wave-2 scaffolding), so file bytes = committed bytes.

## Census run (the named command)

`/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi`

- exit **0**; trailing line `tabi  ok  /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md`.
- E lines: **0** (`… | grep -c '	E[0-9]'` → 0).
- W lines: **16, all W04** (`… | awk -F'\t' '$2~/^W/{print $2}' | sort | uniq -c` → `16 W04`). The
  warned ids are S058, S065, S066, S068, S069, S070, S073, S074, S075, S076, S077, S095, S096,
  S098, S099, S100 — every one carries `supersedes` in its teaches cell (per-row awk sweep), so the
  duplicates are declared supersession pairs, not contract violations (E04 stays silent).
- Baseline comparison: `git show 573c99e:corpus/SOURCES.md` into a lane-shaped fixture and
  `--file`-validating it → **same 16 W04, exit 0, 103 rows**. Round 24 added 2 rows and 0 new
  warnings. `corpus/lessons/round-24.md:20` says "105 rows, same 16 warnings; the two new rows add
  no duplicate URL" — consistent with the run.

Cross-check with the lane structural gate: `node scripts/check-sources.mjs` →
`SOURCES_GATE verdict=clean rows=105 tiers=A:90,B:6,C:9 status=queued:19,mined:77,rejected:9
findings=0`, exit 0. My independent tally agrees (`awk -F'|' '/^\| S[0-9]/'`):
105 rows, all NF=13; statuses 77 mined / 19 queued / 9 rejected; tiers 90 A / 6 B / 9 C;
community rows appear only at tier C (E10 silent); every `opened` is a past/present ISO date;
recheck vocabulary is `on-release|90d|180d|365d` only.

Instrument spot-check (attack, not fix): E11 is enforced. In a lane-shaped scratch fixture
(`$TMPDIR/lane/corpus/SOURCES.md` + `knowledge/` symlink) replacing the
`navigation-history-bfcache-evidence.md` used-by in S104/S105 with a missing path → exactly the
two mutated rows flagged `E11`, exit 1; unmutated fixture → 16 W04, exit 0. Caveat observed: E11
resolves used-by relative to the registry file's parent root — running `--file` on a copy sitting
outside a `corpus/` shape flags every used-by row (all 90+ E11), so `--file` results outside a lane
shape are not meaningful without that shape.

## Row 105

`corpus/SOURCES.md:120`. Fields: `code | A | mined | opened 2026-10-25 | recheck on-release |
used-by corpus/knowledge/navigation-history-bfcache-evidence.md` (exists). Anchors verified
against `corpus/evidence/round-24/sources/page.pdl` (1795 lines, decoded plain text):

- `sha256 e944a3b1…9405be` = `sha256sum page.pdl` exactly.
- line 1345 = `BackForwardCacheRestore`, inside `experimental type NavigationType extends string`
  (enum at 1343–1345). ✓
- line 1706 = `experimental event backForwardCacheNotUsed`; `notRestoredExplanations` at 1713 is
  required (no `optional` keyword; the tree at 1715 is the optional one). ✓

Row 104 (`:119`) likewise verified: `157667` bytes, `sha256 0dd45292…f28e07` =
`sha256sum corpus/evidence/round-24/sources/bfcache.html`; file title `Back/forward cache |
Articles | web.dev`; the only `<table>` spans 2520–2534 and line 2531 is the "With bfcache
enabled" cell carrying the quoted restore sentence; 2893 = the NotRestoredReasons sentence;
2511 = "All major browsers include a bfcache". ✓

C3's frozen counter: `git grep -lE '^source: S10[45] ' ad125e8 -- corpus/knowledge | wc -l` → **1**
(the new entry); at `573c99e` → **0**. The entry (`navigation-history-bfcache-evidence.md`) quotes
line 2531 verbatim (markup stripped) and names `NavigationType`:1345 correctly.

## Findings

- **F1 · DEFECT (medium, committed-data contradiction) — S105's anchor records the encoded length
  as the decoded size.** `SOURCES.md:120` says `82548 bytes decoded`; the committed decoded blob is
  61911 bytes and 82548 is exactly its base64 expansion (`python3 -c 'print(61911%3,(61911//3)*4)'`
  → `0 82548`). The same wrong figure sits in `corpus/knowledge/navigation-history-bfcache-evidence.md:4`
  and `corpus/lessons/round-24.md:16` (`grep -rn '82548'`), so the mislabel propagated to three
  committed files and survives at the tip. The digest is right; the count is not.
  Instrument gap: neither `sources-census.sh` nor `check-sources.mjs` reads anchor cells, so
  nothing catches a digest/size cell that disagrees with retained bytes. (Sibling report
  `.ufo/waves/round-24/w2/ScoutReopenS105.md` found this independently; this is my own re-run.)
- **F2 · OBSERVATION (literal check fails, intent holds) — "S104/S105 are the only 2026-10-25
  rows" is false at the tip.** `awk -F'|' '/^\| S[0-9]/{…$10…}' corpus/SOURCES.md` → 4 rows carry
  `opened=2026-10-25`: S102, S103 (landed in round 23, already at baseline `573c99e` with the same
  date) plus S104, S105. `git diff 573c99e..ad125e8 -- corpus/SOURCES.md` adds exactly `+S104`
  and `+S105`, so the only-true reading is "the only rows *new* this round" — which the lesson
  states correctly. Residual staleness: `corpus/lessons/round-23-verifier-spotcheck.md:79` still
  says "S102, S103 — the only two 2026-10-25 rows"; true at round-23 tip, false at this tip
  (append-only document, informational).
- **F3 · INFO (pre-existing prose, not introduced this round) — the preamble's blanket claim is
  stale.** `corpus/SOURCES.md:4` says "Every row below was opened in kaika fleet round-1
  (2026-10-19)"; 77/105 rows carry another date (48× 2026-10-20, 25× 2026-10-21, 4× 2026-10-25).
  The round-14 note in §Search log partially qualifies it, but the sentence itself is false.
- **F4 · INFO (traceability gap) — no row names the retained evidence bytes.**
  `grep -c 'round-24' corpus/SOURCES.md` → 0. S104/S105 carry byte count + digest but never point
  at `corpus/evidence/round-24/sources/{bfcache.html,page.pdl}`; the digest match is discoverable
  only by guessing the directory (the lesson does name it). A reader wanting to re-check F1 must
  already know where the bytes live.

## Residual risk / verification gaps

- No external re-fetch ran (item permits no HTTP GET): reproducibility of both digests against the
  live URLs is untested. S104's page is dynamic — the entry itself (lines 87–88) discloses two
  same-size different-digest copies fetched this round (`4535f93b…` scout vs `0dd45292…` lane);
  the registry row does not record that variance, the entry does.
- 30 further rows carry sha256 anchor claims over bytes not retained in-repo; offline
  verifiability limited to S104/S105.
- §Search log ends at 2026-10-21/round-22; rounds 23–24 recorded their opens in round lessons
  only (the round-20 clarification sanctions that). No contradiction; noted so nobody reads the
  log as complete.

Tooling: no installs. Used host `git`, `gawk`, coreutils, `node` (check-sources.mjs),
`python3` (one arithmetic check). `TMPDIR=/home/vgpnk/tmp-tabi24` created and exported before the
node run; fixtures confined to `.ufo/waves/round-24/scratch/RevCensusEnd/` and `$TMPDIR/lane/`.
