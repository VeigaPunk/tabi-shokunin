VERDICT: ISSUES
The census claims hold exactly at M: rows 53, A43/B4/C6, mined41/queued6/rejected6, and all three validators exit 0.
S049–S052 being `queued` with used-by `—` matches the PLAN amendment. One low-severity issue (LOW-1): the
Paths line `SOURCES.md:77` points to two destinations that do not exist at M. It is not gate-checked.

Attacked: the `corpus/SOURCES.md` census at M=6c97851034e9d8f58b135d28ff969f1f28fa2f7d, and the amendment at
`.ufo/waves/round-17/PLAN.md:217-218` (M): "Sources S049–S052 (jj/git) stay `queued` this round (the lesson that
cites them lands after the measured revision; used-by cannot point at it earlier)."

Lane state when run: `git rev-parse HEAD` = `refs/heads/master` = 6c97851…, HEAD detached (`symbolic-ref -q HEAD`
exit 1). The tracked tree was clean; `status --porcelain` listed only `??` files from peers under
`.ufo/waves/round-17/{drafts,w2}/`. The worktree `corpus/SOURCES.md` blob f8f3d359… equals `M:corpus/SOURCES.md`.
Validator identity: fleet `scripts/sources-census.sh` has sha256 3fb72615…, last commit 6a1dd8c, clean in the fleet
repo. Lane `scripts/check-sources.mjs` is blob 3f96058f, unchanged from B to M, and the worktree copy equals M.
Environment: UTC date 2026-10-20, gawk 5.4.1, node v24.21.0.

## 1. Required runs (cwd = lane, read-only)
```
$ /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi
tabi	ok	/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md
EXIT=0          (no E-codes and no W-codes)
$ /home/vgpnk/Projects/shokunin/scripts/sources-census.sh census --root /home/vgpnk/Projects/shokunin tabi
tabi	rows	53 | tier.A 43 | tier.B 4 | tier.C 6 | status.mined 41 | status.queued 6 | status.rejected 6
FLEET	rows	53 | tier.A 43 | tier.B 4 | tier.C 6 | tier.invalid 0 | status.queued 6 | status.mined 41
FLEET	status.rejected 6 | status.invalid 0 | missing 0
EXIT=0          (lines joined with " | " for space; each value appears verbatim in the output)
$ node scripts/check-sources.mjs
SOURCES_GATE verdict=clean rows=53 tiers=A:43,B:4,C:6 status=queued:6,mined:41,rejected:6 findings=0 file=corpus/SOURCES.md
EXIT=0
```

## 2. Independent re-derivation
- Third parser: gawk over `git show M:corpus/SOURCES.md`, Registry section only. It finds 53 rows, all with NF=13.
  - Tier B: S006 S007 S019 S022.
  - Tier C: S026 S027 S038 S039 S040 S053.
  - Queued: S021 S022 S049 S050 S051 S052.
  - Rejected: S026 S027 S038 S039 S040 S053.
  - Result: A43/B4/C6 and mined41/queued6/rejected6. Three parsers agree.
- Strictly clean sandbox clones (no untracked files; conf `tabi|tabi-shokunin|…`):
  - At M: the same outputs, all exit 0.
  - At B=5859243: rows 40, A31/B4/C5, mined33/queued2/rejected5, all exit 0. This matches the start census at
    `PLAN.md:7`.
- The SOURCES diff from B to M is 16 insertions and 0 deletions:
  - 13 rows S041–S053 (`SOURCES.md:55-67`), 2 Paths lines (`:76-77`) and 1 search-log line (`:94`).
  - Delta: A+12 (S041–S052), C+1 (S053); mined+8 (S041–S048), queued+4 (S049–S052), rejected+1 (S053).
- Both validators are live. Each self-test ran in the sandbox with TMPDIR inside it and left nothing behind:
  - `check-sources.mjs --self-test`: `SOURCES_SELFTEST verdict=clean cases=26`, 0 FAIL, exit 0.
  - `sources-census.sh selftest`: 96 killed, 0 SURVIVED, `selftest ok`, exit 0.

## 3. S049–S052 against the amendment
- At M, S049–S052 (`SOURCES.md:63-66`) are `queued`, opened 2026-10-20, with recheck on-release / on-release /
  180d / 180d and used-by `—`. This matches `PLAN.md:217-218`.
- "Lesson lands after the measured revision": at M, `corpus/lessons/` holds `round-16.md` and
  `round-16-verifier-spotcheck.md`. There is no `round-17.md`.
- Who cites them at M. I ran `git grep` for S049–S052 at M. Hits:
  - `PLAN.md:217`.
  - `SOURCES.md:63-66` (the rows themselves), `:77` (Paths) and `:94` (search log).
  - No note, lesson, SKILL, README, LOG or SCORECARD cites them, so no legitimate used-by target exists at M and
    `queued` is the honest status.
- The JjColocation scout recommended exactly this (M `.ufo/waves/round-17/sources/JjColocation.md:199-202`): "place
  it `queued` with `—` and flip at the Gate (`check-sources.mjs` enforces `used_by_missing`, E11)".
- C2 is unaffected:
  - The C2 note `corpus/knowledge/webmcp-invocation-round-17.md` is tracked at M. Its `source:` header lists S041–S048
    only. All eight are mined, tier A, opened 2026-10-20 and absent at B. Each id is cited 2–7 times.
  - `README.md:322` cites "S041–S048".
  - `measure-c2.mjs:45,435` (`cited_row_queued`) constrains only rows the note cites.
- Mechanical probes. Each ran in the M sandbox, edited only that copy of SOURCES.md, and restored it.

| Probe | Change to S049 (or S049–S052) | Fleet validator | Lane gate |
|---|---|---|---|
| P1 | S049 mined, used-by `corpus/lessons/round-17.md` (absent at M) | `E11 S049 missing used-by …`, exit 1 | `used_by_missing`, exit 1 |
| P4 | S049–S052 mined, used-by a lesson stub that exists and cites them | exit 0 | exit 0; census mined45/queued2 |
| P2 | S049 mined, used-by `—` | W03 only, exit 0 | `mined_without_used_by`, exit 1 |
| P3 | S049 queued, used-by the C2 note (which lacks S049) | exit 0 | `used_by_uncited`, exit 1 |
| P5 | S049 mined, used-by `corpus/SOURCES.md` (self-citation) | exit 0 | exit 0 |
| P6 | S049 mined, used-by `.ufo/waves/round-17/PLAN.md` | exit 0 | exit 0 |

  - P1 shows the amendment's rationale holds mechanically: used-by cannot point at the lesson at M.
  - P4 shows the flip becomes viable once the lesson lands.

## Findings by severity
LOW-1 — Forward reference at M. The `jj-colocated-anchor` path at `SOURCES.md:77` (M) ends: "Ends at the round-17
lesson and the SKILL round-17 anchor rule." Neither destination exists at M:
- There is no `corpus/lessons/round-17.md`.
- `git diff --stat B M -- SKILL.md` is empty, and `git grep -E 'round-17|refs/heads/master' M -- SKILL.md` finds
  nothing.
- Meanwhile `PLAN.md:47-48` names that SKILL registry rule (`--witness "$(git rev-parse --verify
  refs/heads/master)"`) as the F6 remedy.

No gate reads §Paths, so nothing turns red. Repair: at the Gate commit, either land both destinations (the lesson and
the SKILL append) or reword `:77` to mark them as pending. `corpus/SOURCES.md` is not in `APPEND_ONLY`
(`scripts/check-round-contract.mjs:25` at M), nor in `pins.tsv` or `baseline-census.tsv`, so the edit is allowed.

## Residual risk and verification gaps
- R1 [INFERENCE] Round-close semantics.
  - The amendment says "stay queued this round". But `:77` says the path ends at the round-17 lesson.
  - The peer draft `drafts/lesson-gate.md` (untracked, in progress) quotes S049–S052 at `:22-25` and plans
    "no transition this round" at `:60-61`.
  - If the delivered lesson cites them while they stay queued with used-by `—`, the registry under-reports a
    consumer. Lessons are valid used-by targets: S028 → `lessons/kaika-fleet-round-1.md`, S029 →
    `lessons/round-14.md` and `lessons/round-15.md`.
  - The gates are clean either way (P4 or current). The L1 should pick one: flip at the Gate with used-by
    `corpus/lessons/round-17.md`, or state in the lesson that the rows stay queued.
- R2 Validator weakness, not a defect at M. Both validators accept used-by pointing at any in-root file that mentions
  the id, including the registry itself (P5) or a planning file (P6). At M, the targets of all 41 mined rows are
  `corpus/knowledge/*.md` (8 files) or `corpus/lessons/*.md` (3 files), with no self-citation or plan citation.
  Future hardening idea: allow used-by only under `corpus/knowledge/`, `corpus/lessons/` and `SKILL.md`, and reject
  `corpus/SOURCES.md`.
- R3 The fleet validator alone is weaker than the lane gate (P2, P3): its exit 0 does not prove that mined rows have
  consumers that cite them. The lane gate checks that, and is also clean at M.
- Gaps: I did not run the `overdue` or `shared` modes (not assigned). I did not re-fetch S041–S053 anchors or quotes
  upstream; the ReopenS0xx seats own that.

Files written: `.ufo/waves/round-17/w2/RevCensusM.md` (this report only). The sandbox
`/tmp/tabi-r17w2-RevCensusM-kkth2cna` (clean clones of M and B, plus TMPDIR for the self-tests) has been removed.
I ran no `jj` and no git write in LANE.
Tools installed or updated: none.
