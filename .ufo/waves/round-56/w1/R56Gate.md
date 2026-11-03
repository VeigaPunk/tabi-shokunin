# R56Gate — N1 class fix: cited-receipt landing gate

Seat: R56Gate (leaf), round 56 wave w1 (the single v1 wave), lane
`/home/vgpnk/Projects/shokunin/tabi-shokunin`, lane base `faee4cb2`.
Not committed (L1 owns the freeze/data commits). Nothing outside the paths below
was written; the fleet root was read only.

## Deliverable

`scripts/check-cited-receipts.mjs` — new file, sha256
`0457f35468db9efdf8e9291f684dd90defa2016157b45e78887987b023550c7a`, mode 755,
`node --check` exit 0.

It fails when a committed text cites an evidence path under
`.ufo/waves/round-<N>/` that does not exist in the committed tree at that
revision. Both sides are read from git — the citing document via
`git show <rev>:<path>`, every cited path via `git -C <repo> cat-file -e
<rev>:<path>` — so a staged-but-uncommitted receipt cannot satisfy a citation, and
a worktree-only file neither helps nor hurts. All git calls are read-only
(`show`, `rev-parse`, `cat-file`). The script itself writes nothing: no temp files,
no `/tmp`, stdout/stderr only.

Contract as specified:

| item | behaviour |
|---|---|
| `--repo <abs>` | default `process.cwd()`; validated by `rev-parse --show-toplevel` |
| `--round <N>` | required; only tokens whose round directory is exactly N are checked |
| `--doc <rev>:<path>` | repeatable; `rev` resolved with `rev-parse --verify --quiet <rev>^{commit}` so a prefix (`545b251d`) or a full hash both work |
| `--json` | one JSON object on stdout, schema `tabi-cited-receipts-v1` |
| exit 0 | no cited path missing |
| exit 1 | at least one cited path missing; one finding `{path, citingDoc, line}` per occurrence, plus `missing[]` distinct |
| exit 2 | usage error, unresolvable revision, unreadable citing document, non-repo `--repo`, unexpected error |

Extraction rule, fixed in the file header: the literal prefix
`.ufo/waves/round-<digits>/` followed by `[A-Za-z0-9._/-]*`, then the frozen
trailing-punctuation set (backtick, quote, parenthesis, bracket, comma, semicolon,
period, pipe) stripped from the right edge only. A trailing `/` is kept, not
stripped, because git resolves a trailing-slash tree entry: `.ufo/waves/round-55/
measure/` passes `cat-file -e` exactly when that tree exists (verified). Because
the token class admits only `.` from that set at the right edge, the other members
already terminate the match; the full set stays written down so the code states
the frozen rule rather than an accident of the character class.

## Self-tests (all run; driver exit 0)

Driver: `.ufo/waves/round-56/gate/run-fixtures.sh` (sha256
`4c3d1e3c24d4ede67d62e31098cc3f94eb8100c63077119e5da2ae892b40e28b`). It builds
ONE sandbox fixture with `D=$(mktemp -d -p $S fixture.XXXXXX)` under scratch
`$HYAKU_SCRATCH/tabi-r56/R56Gate`, `git -C "$D" init -q`, asserts
`git -C "$D" rev-parse --show-toplevel` equals `$D` before the first commit
(assertion recorded in the receipt), commits the fixture documents at the same
repo-relative paths the lane uses, and removes the tree on exit unless `--keep`.
Each case asserts exit code **and** the gate's own `missing[]` and `checked`
fields, so a passing exit code cannot hide a wrong answer.

Full output: `.ufo/waves/round-56/gate/fixtures-at-round-56.txt` (sha256
`721ca2404d4a324877a3a980a5741eb1b8d5c57cfab53bb51c413024ccf34afa`).

```
fixture=/fast/scratch/hyaku/tabi-r56/R56Gate/fixture.TO1FO4
toplevel-assert=/fast/scratch/hyaku/tabi-r56/R56Gate/fixture.TO1FO4 (equals fixture)
fixture-rev=09dade9bdf47f13121d1097bd20d8fe14158d517   (transient; tree removed on exit)
=== CASE A-mixed
exit=1 expect=1 | missing=[".ufo/waves/round-56/measure/missing.txt"] expect=[".ufo/waves/round-56/measure/missing.txt"] | checked=2 expect=2 | PASS
=== CASE B-present-only
exit=0 expect=0 | missing=[] expect=[] | checked=4 expect=4 | PASS
=== CASE C-trailing-punct
exit=1 expect=1 | missing=[".ufo/waves/round-56/measure/missing.txt"] expect=[".ufo/waves/round-56/measure/missing.txt"] | checked=7 expect=7 | PASS
=== CASE D-code-fence
exit=1 expect=1 | missing=[".ufo/waves/round-56/measure/missing-fenced.txt"] expect=[".ufo/waves/round-56/measure/missing-fenced.txt"] | checked=3 expect=3 | PASS
=== CASE E-round-55
exit=0 expect=0 | missing=[] expect=[] | checked=0 expect=0 | PASS
=== CASE E-round-56
exit=0 expect=0 | missing=[] expect=[] | checked=1 expect=1 | PASS
=== CASE F-usage-missing-round
exit=2 expect=2 PASS
=== CASE G-unreadable-doc
exit=2 expect=2 PASS
=== CASE H-usage-doc-no-colon
exit=2 expect=2 PASS
=== CASE I-usage-bad-rev
exit=2 expect=2 PASS
=== CASE J-usage-no-doc
exit=2 expect=2 PASS
fixture-cases-failing=0
```

The four required cases and what each pins:

- **(a)** `a-mixed.md` — one present, one missing → exit 1 with exactly
  `.ufo/waves/round-56/measure/missing.txt`, 1 finding, 2 tokens checked.
- **(b)** `b-present-only.md` — two files and two directory citations all resolve
  → exit 0, `missing=[]`, 4 checked. Proves the run is not vacuously red and that
  directory citations resolve.
- **(c)** `c-trailing-punct.md` — backticked-with-period, parenthesised, a
  comma/semicolon pair and a table cell, plus one bare sentence-final miss →
  exit 1 with the only distinct missing path spelled **without** the trailing
  period, and 7 checked. A failed right-edge strip would report `missing.txt.`
  and would also falsely report the four present citations.
- **(d)** `d-code-fence.md` — one path inside a fenced block (present), one inside
  the fence (missing) → exit 1, fence not skipped, 3 checked.
- **(E)** round-prefix collision (`e-round-prefix.md`): a `round-5/` citation is
  *not* read as round-55 — `--round 55` checks 0 tokens, `--round 56` checks 1,
  both exit 0.
- **(F)(G)(H)(I)(J)** usage/unreadable classes all exit 2: missing `--round`,
  doc absent at the rev, `--doc` without a colon, unresolvable rev, no `--doc`.

Additional probes, all recorded in
`.ufo/waves/round-56/gate/gate-behaviour-probes.txt` (P1-P6): short-hash rev form
(`545b251d:...`) on the lesson alone → exit 1, 4 findings, 7 tokens checked; a
non-repo `--repo` → exit 2 naming the path; a committed doc whose r55 citations
all resolve (`.ufo/waves/round-55/claims.json`, 14 tokens) → exit 0, so the green
path is exercised on real lane bytes too; and the `cat-file` trailing-slash
semantics the extraction rule relies on — `.../round-55/measure/` resolves (0),
`.../round-55/measure` resolves (0), `SCORECARD.md/` does not (128).

## RED-BEFORE proof at the round-55 close (required)

Revision confirmed first: `git -C <lane> rev-parse 545b251d` →
`545b251d0c370fa1b75f312a4b3feb5c902d0ac6`.

Command and output, verbatim, saved at
`.ufo/waves/round-56/gate/red-at-545b251d.txt` (sha256
`8a561a25ffa81aad3ad3e5a382b880e8dc3e8282ccbcb43fab5d3e1b40201be9`) with the
exit code beside it in `red-at-545b251d.exit` (`1`):

```
$ node scripts/check-cited-receipts.mjs --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --round 55 \
    --doc 545b251d0c370fa1b75f312a4b3feb5c902d0ac6:corpus/lessons/round-55.md \
    --doc 545b251d0c370fa1b75f312a4b3feb5c902d0ac6:SCORECARD.md
repo: /home/vgpnk/Projects/shokunin/tabi-shokunin
round: 55
doc: 545b251d0c370fa1b75f312a4b3feb5c902d0ac6:corpus/lessons/round-55.md -> 545b251d0c370fa1b75f312a4b3feb5c902d0ac6 (7 round-55 token(s), 1 other-round)
doc: 545b251d0c370fa1b75f312a4b3feb5c902d0ac6:SCORECARD.md -> 545b251d0c370fa1b75f312a4b3feb5c902d0ac6 (5 round-55 token(s), 233 other-round)
checked: 12 token(s); other-round tokens skipped: 234
MISSING path=.ufo/waves/round-55/sources/html-form-control-infrastructure.html citingDoc=545b251d0c370fa1b75f312a4b3feb5c902d0ac6:corpus/lessons/round-55.md line=16
MISSING path=.ufo/waves/round-55/sources/browser_protocol.json citingDoc=545b251d0c370fa1b75f312a4b3feb5c902d0ac6:corpus/lessons/round-55.md line=17
MISSING path=.ufo/waves/round-55/measure/census-end.txt citingDoc=545b251d0c370fa1b75f312a4b3feb5c902d0ac6:corpus/lessons/round-55.md line=131
MISSING path=.ufo/waves/round-55/measure/check-sources-at-work.txt citingDoc=545b251d0c370fa1b75f312a4b3feb5c902d0ac6:corpus/lessons/round-55.md line=134
MISSING path=.ufo/waves/round-55/sources/ citingDoc=545b251d0c370fa1b75f312a4b3feb5c902d0ac6:SCORECARD.md line=3164
MISSING path=.ufo/waves/round-55/measure/check-sources-at-work.txt citingDoc=545b251d0c370fa1b75f312a4b3feb5c902d0ac6:SCORECARD.md line=3170
missing(distinct)=5 findings=6
verdict: RED
EXIT=1
```

**Exact missing list (5 distinct, 6 findings):**

1. `.ufo/waves/round-55/sources/html-form-control-infrastructure.html` (lesson:16)
2. `.ufo/waves/round-55/sources/browser_protocol.json` (lesson:17)
3. `.ufo/waves/round-55/measure/census-end.txt` (lesson:131)
4. `.ufo/waves/round-55/measure/check-sources-at-work.txt` (lesson:134, SCORECARD:3170)
5. `.ufo/waves/round-55/sources/` (SCORECARD:3164 — the whole source-bytes directory)

### Discrepancy with the seat spec's expected list — reported, not papered over

The seat spec expected six lost r55 receipts to be named. The gate names five
paths from that set and **two of the six are not cited in full-path form at all**:

| spec-listed receipt | form in the r55 docs | gate result |
|---|---|---|
| `c1-meter-green-at-correction1.json` | SCORECARD:3145 cites it as ``` `measure/c1-meter-green-at-correction1.json` ``` — relative, no `.ufo/waves/round-55/` prefix, and introduced as "receipt named by OUTCOME" | not extracted (relative form), hence not a finding |
| `census-end.txt` | full prefix at lesson:131 | ✓ finding |
| `check-sources-at-work.txt` | full prefix at lesson:134 and SCORECARD:3170 | ✓ finding |
| `c3-gate-v4-at-final.txt` | **absent from both documents** — `git grep 'c3-gate-v4-at-final' 545b251d` returns six hits, none of them in either citing doc: `LOG.md:3433` (round-52 path), `LOG.md:3527` (round-53 path), `LOG.md:3539` (prose, round-54), `corpus/lessons/round-52-verifier-spotcheck.md:142`, `round-52.md:221`, `round-53.md:224` | cannot be found by any citation check |
| `sources/browser_protocol.json` | full prefix at lesson:17 | ✓ finding |
| `sources/html-form-control-infrastructure.html` | full prefix at lesson:16 | ✓ finding |

The sixth path in the gate's list is the directory citation
`.ufo/waves/round-55/sources/` (SCORECARD:3164), which the spec did not name. All
six spec-listed receipts are independently confirmed absent at 545b251d
(`git cat-file -e` → 128 each; also `git ls-tree -r 545b251d --
.ufo/waves/round-55/sources` → 0 files).

`c1-meter-green-at-correction1.json` is a **real gap in the frozen extraction
rule**, and it is exactly the receipt the round-55 lesson calls out as lost. A
probe over the relative-form citations inside the two documents' r55 blocks
(`gate/relative-form-probe.json`) finds one more relative-form orphan:
`measure/d54-1-landing-note-r55.txt` cited at lesson:67, absent at r55, and the
only file of that name on disk is under `round-54/`. I did **not** widen the
predicate — the round-56 claims freeze fixes this gate's scope, and widening it
here would make the documented rule diverge from what the L1 froze. Recorded as
round-56 finding **R56Gate-F1** below.

## Files written (absolute)

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-cited-receipts.mjs` (deliverable)
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-56/gate-fixtures/a-mixed.md`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-56/gate-fixtures/b-present-only.md`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-56/gate-fixtures/c-trailing-punct.md`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-56/gate-fixtures/d-code-fence.md`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-56/gate-fixtures/e-round-prefix.md`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-56/gate/run-fixtures.sh`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-56/gate/fixtures-at-round-56.txt`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-56/gate/red-at-545b251d.txt` + `.exit` + `.json`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-56/gate/gate-behaviour-probes.txt`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-56/gate/relative-form-probe.json`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-56/w1/R56Gate.md` (this report)

## Commands run (all exit codes)

| command | exit |
|---|---|
| `git -C <lane> rev-parse 545b251d` | 0 → `545b251d0c370fa1b75f312a4b3feb5c902d0ac6` |
| `git -C <lane> rev-parse HEAD` | 0 → `faee4cb27982388b18e9a45f292cdfb9dfd1ebc8` |
| `git -C <lane> cat-file -e 545b251d:<each of the six>` (×6) | 128 each (absent) |
| `git -C <lane> ls-tree -r --name-only 545b251d -- .ufo/waves/round-55/sources` | 0, 0 rows |
| `git -C <lane> cat-file -e 545b251d:<trailing-slash tree>` (probe) | 0 (tree resolves) |
| `node --check scripts/check-cited-receipts.mjs` | 0 |
| `bash .ufo/waves/round-56/gate/run-fixtures.sh` (final) | 0 (`fixture-cases-failing=0`, 11 cases) |
| gate red-before, r55 close | **1** (as required) |
| gate short-hash form, lesson only | 1 (4 findings) |
| gate non-repo `--repo` | 2 |
| gate on `.ufo/waves/round-55/claims.json` (green control) | 0, 14 tokens checked |

No mutating git/jj command was run anywhere. Fixture commits used
`git -C "$D" -c user.name=TabiFixture -c user.email=tabi-fixture@example.invalid
commit` inside `mktemp -d` trees whose `--show-toplevel` was asserted first — no
throwaway identity in the lane.

## Risks / open items for the L1

- **R56Gate-F1 (rule scope, not fixed by me):** the frozen extraction rule matches
  only full-prefix citations, so `measure/c1-meter-green-at-correction1.json`
  (SCORECARD:3145) and `measure/d54-1-landing-note-r55.txt` (lesson:67) are not
  checked. Both are relative-form citations of r55 paths that do not exist at
  r55. The one that the round-55 mistake narrative treats as the lost green
  receipt is therefore invisible to this gate. Closing it means either a new
  round-56 predicate (relative form resolved against the citing round) or a
  contract rule requiring full prefixes — both are post-freeze decisions, so this
  is a disclosure, not a change.
- **The `sources/` directory citation** is a legitimate finding (the byte store was
  never committed) but it is a directory, not a receipt; the L1 may want the
  round-56 close to cite the two byte files rather than the directory.
- The gate is a lander check, not a repair: it does not restore the six lost
  receipts, and no claim should cite them.
- Scratch: `$HYAKU_SCRATCH/tabi-r56/R56Gate/` was **deleted** at the end of this
  seat (verified gone). Before deletion every receipt cited here was byte-compared
  into the wave dir (`fixtures.out` == `gate/fixtures-at-round-56.txt`,
  sha256 `721ca240…`; `relative-form-probe.json` identical, sha256 `df6a402d…`).
  The fixture `mktemp -d` tree is removed by `trap` (also on error) and per-case
  `.err` files are written inside that tree, so nothing leaked outside it.
- Free space at the time of writing: `/home` 717 G of 930 G available (23 % used),
  `/fast` 408 G of 804 G available (50 % used). No ENOSPC encountered.
- No tool installs or upgrades were made.
