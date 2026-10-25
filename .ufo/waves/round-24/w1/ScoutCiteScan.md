# C2 scope and round-23 scratch references

## Scope and source revision

Observed lane `HEAD` was `573c99e4885382db38babc3a6fc90e77afeb42a6` (`git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse HEAD`). The frozen claims are in `.ufo/waves/round-24/claims.json`; C2 explicitly scopes self-assessment to SCORECARD blocks naming a lane gate script and SHONEN.md, and mismatch classes m1 selftest/N-case tally, m2 committed receipt exit vs rerun, m3 unlanded paths while claiming landed rounds. This scan is a supporting committed-document mention inventory, not a complete C2 counter design.

Requested round-23 report is fleet-root `/home/vgpnk/Projects/shokunin/.ufo/reports/round-23/tabi.md`, not inside the lane repository. Its content was read, but it is **not lane-committed bytes**; it must not be included in a counter which reads a lane revision unless that counter explicitly supports a separately scoped fleet report. The claimed path has no lane-tree entry (`git -C /home/vgpnk/Projects/shokunin/tabi-shokunin ls-tree HEAD .ufo/reports/round-23/tabi.md` emitted none). The other requested documents are lane committed at this HEAD: `corpus/lessons/round-23.md` and `corpus/lessons/round-23-verifier-spotcheck.md`.

## Numeric gate/selftest mentions

Exact command used for this candidate scan:

```sh
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin grep -nE 'round-evidence-audit|check-[[:alnum:]_.-]+\.mjs|measure-c1\.mjs' HEAD -- SCORECARD.md SHONEN.md LOG.md corpus/lessons/round-23.md corpus/lessons/round-23-verifier-spotcheck.md
```

The following are lines where the cited gate or its named selftest carries a numeric tally (lines are in committed paths; exclude cited fleet report):

- `SCORECARD.md:1139` — round-evidence-audit `--selftest` (12/12; stale per verifier).
- `SCORECARD.md:1151` — `--selftest` 12/12, with findings/class counts and 6/6 repairs.
- `corpus/lessons/round-23.md:31-35` — round-evidence-audit absence→0 mechanically detectable classes; 13 cases / 13 passed; 6+7 inventory; 7 findings / six classes, 6/6 repairs.
- `corpus/lessons/round-23.md:47-51` — source-entry counter 0→1 (not a gate selftest tally, but gate-named command numeric claim).
- `corpus/lessons/round-23.md:157-158` — lesson says selftest has 12 cases; stale tally claim.
- `corpus/lessons/round-23-verifier-spotcheck.md:35-38` — auditor absent => 0 classes; six classes; 14 `runFixtureCase(` occurrences (one definition + 13 cases), contrasted with 12 in report.
- `corpus/lessons/round-23-verifier-spotcheck.md:42-43` and `:85-90` — registry mention count zero and required gate-row fields (numeric 0).
- `corpus/lessons/round-23-verifier-spotcheck.md:97-100` — scratch paths 1,034 and 1,139 round paths, 25.7 MB (cleanup context; not gate count).
- `LOG.md:1015` — `measure-c1.mjs` counter 0→4; check-freshness selftest 59→76.
- `LOG.md:1661-1664` — round-evidence-audit baseline absent exit 128 / zero classes; selftest 12/12 (later stale figure).
- `SCORECARD.md:1077` — round-22 `measure-c1.mjs` 0→12; historical round gate, not the round-23 gate.
- `SCORECARD.md:794,838,882` — historical measure-c1 counters 0→4, 0→51, 0→27; not round-23 selftest tally.

This is not a full inventory of every gate-like expression in all history: the explicit regex scans the three requested lane docs plus relevant lesson files; it can miss alternate naming, non-mjs gate identifiers, numeric claims separated from a gate mention, and other lessons. It shows why a C2 census needs a defined parser/selection policy and should avoid treating arbitrary historical numeric text or other round counters as current self-assessment. `SHONEN.md` had no output in the candidate scan; that is only absence for the regex on that file, not proof that all its assertions are irrelevant.

## Round-23 scratch path references in requested committed documents

Exact grep command (the lane-contained documents):

```sh
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin grep -nF '.ufo/waves/round-23/scratch/' HEAD -- LOG.md SCORECARD.md SKILL.md corpus/lessons/round-23.md corpus/lessons/round-23-verifier-spotcheck.md
```

Matches:

- `corpus/lessons/round-23.md:87` — `.ufo/waves/round-23/scratch/ExecCollisionGuard/` fixture, explicit evidence pointer.
- `corpus/lessons/round-23.md:206` — proposed cleanup check naming `^\.ufo/waves/round-23/scratch/`.

The command returned exit 1 because there were no matches in `LOG.md`, `SCORECARD.md`, `SKILL.md`, or `corpus/lessons/round-23-verifier-spotcheck.md`; that is the exact-path scan result. The verifier lesson separately references scratch counts and `git ls-tree` but uses the scratch path without a trailing slash; search for all forms with:
Full-path scan results in addition to the slash-terminated scan: `corpus/lessons/round-23-verifier-spotcheck.md:97` (M5 count command) and `corpus/lessons/round-23.md:191` (superseded 868-file count). Thus exact full-path hits in the lane documents are `corpus/lessons/round-23.md:87,191,206` and `corpus/lessons/round-23-verifier-spotcheck.md:97`; no hits in LOG/SCORECARD/SKILL. The full-path grep command produced these four lines.

```sh
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin grep -nF '.ufo/waves/round-23/scratch' HEAD -- LOG.md SCORECARD.md SKILL.md corpus/lessons/round-23.md corpus/lessons/round-23-verifier-spotcheck.md
```

For the fleet report (outside lane Git), the exact command is:

```sh
grep -nF '.ufo/waves/round-23/scratch/' /home/vgpnk/Projects/shokunin/.ufo/reports/round-23/tabi.md
```

Observed fleet report hits: lines 50, 51, 67, 187, 188, 189, 190, 193, 194. These mention ExecCollisionGuard evidence, committed scratch, cleanup promise, and historical scratch counts; report bytes are excluded from lane-committed scope.

## Scratch paths and cleanup consequence

Committed inventory command:

```sh
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin ls-tree -r --name-only HEAD .ufo/waves/round-23/scratch
```

It enumerates 1,034 committed scratch paths (also independently stated at `corpus/lessons/round-23-verifier-spotcheck.md:97-100`; direct numeric command for count is `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin ls-tree -r --name-only HEAD .ufo/waves/round-23/scratch | wc -l`). The complete path list is the output of the command above; it is extensive (1,034 entries) and is not reproduced inline to avoid truncation. Retained-citation candidate explicitly named in a committed lesson: `.ufo/waves/round-23/scratch/ExecCollisionGuard/` (the collision-guard false-green fixture). The report and lesson also cite saved source/evidence artifacts in other scratch subtrees, notably `SrcS102`, `SrcS103`, `SrcDivergence`, `W2QuoteA`, `W2QuoteB`; those are scratch locations, not canonical corpus evidence. Removing the scratch tree strands all such scratch-resident artifacts, including the cited ExecCollisionGuard fixture. The cited durable evidence elsewhere (e.g. corpus lesson/report and committed corpus evidence) is not itself within that directory.

A complete exact inventory is recoverable by that `ls-tree` command; no claim is made here about which individual paths are dispensable beyond the explicitly cited evidence pointers. No tools installed or updated.
