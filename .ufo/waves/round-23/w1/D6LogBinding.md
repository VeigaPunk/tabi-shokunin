# D6 — c6-landed-log-binding ground truth

**Verdict:** CONFIRMED at source. Round-22 `## Landed changes` row 2 (fleet report line 85) cites
`47bfb5f7ad3c87d0deb2629af6b7d7fe2076cf3e`, whose diff has **0** `LOG.md` hunks; the claimed entry
("§Round22 landing item 1 and 3") first appears in `fbee618`. Re-derivation also finds the same shape
at row 6 (line 89, `be271a2`, evidence-only, 1 file) — a detector emitting exactly one finding is
overfit to the spot-check.

## 1. Proof (read-only, cwd `/home/vgpnk/Projects/shokunin/tabi-shokunin`)

```sh
git show --name-only --format= 47bfb5f | grep -c '^LOG.md$'      # -> 0
git rev-parse 47bfb5f:LOG.md 47bfb5f^:LOG.md                     # -> 8c1491ca… twice (same blob)
git show 47bfb5f:LOG.md | wc -l                                  # -> 1577 (< 1579 = heading today)
git log --oneline -S'Round22 landing' 5f585773..be271a2 -- LOG.md # -> fbee618 only
git diff-tree --no-commit-id --name-only -r 47bfb5f             # -> 5 files, no LOG.md
```

Cited files: `fixtures/expected.json`, `measure-c1.mjs`, `post-crash-repair.json`, `selftest-c1.mjs`,
`corpus/evidence/round-22/semantic-expectations.json`. Trap: the *tree* holds `LOG.md`
(`git ls-tree -r --name-only 47bfb5f | grep -c '^LOG.md$'` → **1**); only the *diff* is empty.

## 2. Row → commit → LOG-required

Parse `## Landed changes` (markdown table, or `- ` bullets as in round-21); per row:

1. **Extract** backticked 7–40 hex tokens **from the Commit cell only** (the Change cell carries
   sha256 pins: `d00aed4c…`, `5afe1810…`), strip `…`, resolve via
   `git rev-parse --verify <tok>^{commit}`; an unresolvable token is a finding, never a skip.
2. **Carrier order:** (a) explicit phrase in the LOG cell — `entry in <rev>` / `lands in <rev>`;
   (b) any cited commit with non-empty
   `git diff-tree --no-commit-id --name-only -r <c> -- LOG.md`; (c) else **VIOLATION**
   `c6-log-unbound`, evidence = row index, report line, cited commits, and the sibling that does
   carry the entry (`fbee618`).
3. **Anchor (weaker, tip-scoped):** `§<heading>` literal must occur in `git show <tip>:LOG.md`;
   `:A–B` needs `B <= $(git show <tip>:LOG.md | wc -l)` → 1647 at `be271a2`. Normalise `§` up to
   whitespace/`item`; `"Round22 landing item 1 and 3"` has **0** literal hits
   (`git show be271a2:LOG.md | grep -c 'item 1'` → 0).
4. **Must carry an entry:** commits touching `corpus/**`, `SKILL.md`, `SCORECARD.md`, `README.md`,
   `PROVINCE.md`, `QUALITY.md`, `scripts/**`, or the round's measurement code/fixtures
   (`*.mjs|*.py|*.sh`, `fixtures/**`). `47bfb5f` qualifies (2 scripts, 1 fixture, 1 corpus file).
5. **Must NOT be required to carry one:** (a) the baseline/control rev (`5f585773` r22,
   `a89f1935` r23) — it lives in *Before → after*; a baseline rev cited as a landed change is itself
   a finding; (b) **evidence-only** commits — every path under `.ufo/waves/<round>/`, none matching
   step 4 (`be271a2`: `A …checks-final.json`). Such a row must name its carrier; row 6 does not.
   R22 census is not a commit at all (`census-before.json` rode inside `0f24164`), so no census
   commit exists to exempt.
6. **Inherited rows** grade at row level: row 1 cites `0f24164` (1 LOG hunk) and passes even though
   `e3cf4e0` (0 hunks, 36 files) alone would trip.

## 3. Fixtures

**RED** — real bytes, unmutated: `/home/vgpnk/Projects/shokunin/.ufo/reports/round-22/tabi.md`
(blob `802ce177…`, fleet commit `69449ed5`) + lane revs `5f585773..be271a2` → `c6-log-unbound` at
lines 85 and 89, `cited:47bfb5f`/`cited:be271a2`, `derived:"fbee618"`. In-memory mutant: one row,
`LOG: §Round22 landing item 1 and 3`, `Commit: 47bfb5f7…` — must trip; never pin `findings.length == 1`.

**GREEN** — same report, carrier phrases added per the spot-check's prescription: row 2 →
`` `LOG.md` §Round22 landing item 1 and 3 (entry in `fbee618`) ``; row 6 → `` `LOG.md` §Round22
landing (serial cohort) (entry in `fbee618`) `` → 0 findings. Second control: round-21 bullets
(`:1335-1445`@`1b5f449`, `:1404-1445`@`2d5eaaa`, `:1447-1476`@`ab73abe`, `:1478-1494`@`5f58577`), all
four commits with 1 LOG hunk, tip 1494 lines, ranges in bounds → 0.
## 4. Brittleness

- **Line drift defeats bounds checks.** `1b5f449:LOG.md` is **1402** lines yet round-21 cites
  `:1335–1445`; bounds-testing at the cited rev false-trips the green control. Ranges must resolve at
  the tip — and then prove little after an append.
- **Anchors are unaddressable.** "item 1 and 3" has no literal and no id; only `§Round22 landing` resolves.
- **Report bytes sit outside the lane rev.** `git ls-tree -r --name-only be271a2 -- .ufo/reports |
  grep -c round-22` → **0**: with `--rev` alone c6 needs `--report` (default
  `$FLEET/.ufo/reports/round-<N>/tabi.md`) and exit **2** when absent; absence reading as `clean` is
  the failure mode.
- **Row-shape drift.** r21 bullets vs r22 table: a table-only parser sees 0 rows and says clean —
  require ≥1 parsed row whenever the heading exists.
- **Multi-commit rows mask per-commit voids.** Row 3 (`47bfb5f` record, `fbee618` receipt) passes at
  row level though `47bfb5f` carries no entry: row-level OR for green, per-commit output for evidence.
- **Token hygiene.** `0f24164`/`e3cf4e0` are 7-hex; bare hex grep also catches digests — unresolved
  tokens must surface.

Unknowns: none material. Not checked: fleet-report ancestry into the lane (separate repos). Tooling: none installed.
