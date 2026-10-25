# W2Scorecard — round-23 SCORECARD block review

Target: `## Round 23` block (SCORECARD.md, first seen uncommitted, landed in `03c1b4d9a9ea7719ff4a13a63989fa9be36229c3` mid-review).

Verdict: **CONTESTED** — two claims both measured and met (reproduced), but the block lacks a
measured revision for either counting command and asserts a no-harm evidence claim that is
falsified for corpus/SOURCES.md.

## Findings

- F1 (high) Missing measured revision, both claims. The C1/C2 rows carry `<REV>` placeholders;
  the disposition says the checkpoint hash "is recorded in the report (the report lands last)".
  LOG.md says it is recorded "in the `## Round 23` block of SCORECARD.md and in the round
  report". Circular deferral; no report exists (`ls
  /home/vgpnk/Projects/shokunin/.ufo/reports/round-23/tabi.md` → ENOENT). Command:
  `git show 03c1b4d:SCORECARD.md | grep -nE "[0-9a-f]{40}"` → only the baseline hash appears.
- F2 (high) "no axis harmed" evidence falsified. The disposition claims "append-only prefixes
  on all six mutable docs"; `corpus/SOURCES.md` diverges from its baseline at byte 65524,
  line 116 — S102/S103 were inserted mid-file before `## Paths`, so baseline bytes are not a
  prefix. Command: `git show a89f19…:corpus/SOURCES.md | cmp - <(head -c 84565 corpus/SOURCES.md)`
  → differ. All other five pass (LOG.md, SCORECARD.md, QUALITY.md, README.md, SKILL.md; SKILL.md
  is byte-identical).
- F3 (medium) Before-arm receipt records the wrong exit. `corpus/evidence/round-23/c1-measurements.json`
  `"exit": 1` for `git cat-file -e a89f193:scripts/round-evidence-audit.mjs`; actual is 128
  (`fatal: path … exists on disk, but not in 'a89f19…'`). The scorecard cites this file as the
  C1 evidence pointer; the lesson §Gate correctly says 128 — receipt and lesson disagree.
- F4 (medium) Scorecard's C1 evidence pointer internally contradicts the disposition. The
  disposition says round-21 "trips c3 only … not a zero-control" (reproduced: exit 1, classes
  `[c3-gate-spotcheck]`). But `corpus/lessons/round-23.md:32` §Gate asserts "round-21 evidence
  → exit **0, clean, 0 classes** (zero-control)", and §Mistakes M4 records a third account
  ("first run (2 classes)"). Three in-round accounts disagree on one instrument's output.
- F5 (low) C1 capability row evidence command is not copy-runnable: `--selftest --rev a89f1935…`
  uses an elided hash (same ellipsis at the disposition). Verified equivalent full-hash run:
  `--selftest --rev a89f19… --round 22 --round-cap 128 --json` → 6/6 repairs, exit 0.
- F6 (low) Wave/seat census absent from the block — no W1/W2 counts, cap check, or dead-seat
  line; every prior round block (r12–r22) carries one. Numbers exist in
  `corpus/lessons/round-23.md` §Waves (44+44=88 ≤128) but the scorecard omits them and the w2
  directory at commit time carries `swarm-registry.json` only.

## Verified (not findings)

- C1 reproduced: `node scripts/round-evidence-audit.mjs --rev a89f19… --round 22 --round-cap
  128 --json` → exit 1, `findingClasses` = 6 distinct classes, 7 findings (c6×2). Before-arm:
  instrument absent at baseline → 0. `--selftest` → 12/12 exit 0. Evidence-keyed selftest →
  6/6 repairs. Skip-work control refused (6 on clean fixture) per `fixtures/skipwork-receipt.json`.
- C2 reproduced: `git grep -lE '^source: S10[23] ' 03c1b4d -- corpus/knowledge | wc -l` → 1
  (`csrf-defense-shape-boundary.md`); `a89f19…` → 0. SOURCES rows `git show a89f19…:corpus/SOURCES.md
  | grep -cE '^\| S[0-9]{3} \|'` 101 → `corpus/SOURCES.md` 103; mined 73 → 75.
- Capability row complete: name (round-evidence auditor), function, evidence pointer,
  first-working round 23.
- No scalar promotion: operability 8→8, coverage 9→9, other four axes explicitly unchanged;
  six `revisions` entries disclosed; round-21/22 evidence bytes unchanged (`git diff --stat
  a89f19 03c1b4d -- .ufo/waves/round-2{1,2} corpus/evidence/round-2{1,2}` → empty).
- Frozen claim's C1 countingCommand (`--rev <REV> --round 22 --json`) still fails exit 2 —
  disclosed via `revisions[0]` (`--round-cap` added); scorecard cites the corrected command.

## Residual risk

W2 report bytes are landing mid-review; the uncommitted `scripts/round-evidence-audit.mjs`
change (selftest inventory guard only — verified by `git diff`, audit() untouched) post-dates
the commit, so all results above reproduce against the checkpoint's instrument semantics.
The report that was to carry the measured revision does not yet exist.
