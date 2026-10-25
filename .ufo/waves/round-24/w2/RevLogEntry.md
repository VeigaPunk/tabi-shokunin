# RevLogEntry — round-24 LOG.md entry review (W2 falsify)

Scope: `LOG.md` §"Round 24 — 2026-10-25" (lines 1749–1785 at `ad125e8`). Every hash checked
with `git show --name-status`; every number below carries the command that produced it. Lane
root `/home/vgpnk/Projects/shokunin/tabi-shokunin`; instruments re-run with
`TMPDIR=/home/vgpnk/tmp-tabi24`.

## Critical findings

**F1 — C2 "5 → 0" is false at the reviewed tip, and the round's own receipt says so.**
`node scripts/check-selfassessment.mjs --rev ad125e85c235e1c4ec6a08e398bd64da01f68a08 --json`
→ exit **1**, `mismatches: 1`, `clean: false`, counted `m3-unlanded-paths` (observed 5 porcelain
paths). The committed `corpus/evidence/round-24/c2-tip.json` (recorded rev `b973fde`) reads
`mismatches: 1`, `clean: false` — **no committed receipt anywhere shows after = 0**. LOG.md:1758
"5 → 0", SCORECARD.md:1248 "tip counts none" and claims.json `after: 0` are all contradicted by
the receipts the entry cites. The m3 class is by construction a working-tree property
(`scripts/check-selfassessment.mjs:269` runs `git status --porcelain --untracked-files=all` on the
live tree), so the after-value is a checkout property, not a revision property; the round never
recorded a clean-tree measurement at the tip commit. QUALITY 65 anticipated exactly this
("measured with a clean tree and says so") — the committed receipt was not measured clean and
does not say so.

**F2 — `9e52cb2` deleted 1,035 paths, not 1,034; one of them is a non-scratch, cited file.**
`git show --name-status --format='' 9e52cb2 | grep -c '^D'` → **1035**. `git ls-tree -r 573c99e
.ufo/waves/round-23/scratch | wc -l` → 1034. The extra deletion is
`.ufo/waves/round-23/w2-record.err` (`git diff --diff-filter=D --name-only 573c99e..HEAD | grep -v
round-23/scratch` → exactly that one file). It is not scratch, it is 0 bytes
(`git show 573c99e:.ufo/waves/round-23/w2-record.err | wc -c` → 0), and it is still cited as
evidence at tip: `.ufo/waves/round-23/w2/W2CorrRegistry.md:19` records
"`w1-record.err`/`w2-record.err` both 0 B" — a now-dangling citation the LOG's recovery clause
does not cover (it names "every round-23 document that cites a *scratch* path"). So both the count
and the path set in the entry's description of `9e52cb2` are wrong.

**F3 — The final landed-change item has no hash and misdescribes its commit.**
LOG.md:1775 describes "`round-24` final commit — round report trail, lesson, QUALITY criterion 64,
README frontier row, measurement receipts, wave-2 evidence". At `ad125e8`
(`git show --name-status ad125e8`, 13 paths): **zero** `.ufo/waves/round-24/w2` paths — "wave-2
evidence" is not in the commit (the w2 dir exists only on disk now: ExecReDerive.md,
RevNoHarmDiff.md, RevReceipts.md, ScoutReopenS104.md, ScoutReopenS105.md, swarm-registry.json).
`corpus/QUALITY.md` gained criteria **64 and 65** (`grep -cE '^[0-9]+\. ' corpus/QUALITY.md` → 65),
not "criterion 64" alone. Two carried paths are unmentioned: `SKILL.md` (the selfassessment
registry row 12→13 cases) and `scripts/check-selfassessment.mjs` (13th selftest case
`m1-ambiguous-association-is-not-counted` — the same file the entry attributes to `b973fde` only).
Against the lane's own QUALITY 63 (entry bound to a commit, "the row says which commit carries
the entry"), the row names no commit. The claim of wave-2 evidence landing in the final commit is
unverifiable-then, false-now.

## Major findings

**F4 — Frozen-claim divergence with no recorded revision.**
`claims.json` (unchanged since `f6f7f45`; `git log f6f7f45..HEAD -- claims.json` → 0 commits) holds
C2 `before: 4`, `after: 0`, `revisions: []`. The measured before is **5**
(`corpus/evidence/round-24/c2-baseline.json`: four m1 findings — `:410` 25-vs-26 plus the three
12-vs-13 — and one m3). The LOG/SCORECARD trail claims "5 → 0" everywhere; the frozen claim says
4 → 0. The `revisions` mechanism exists for precisely this correction and is empty — the
"frozen before data" posture is asserted, not honored.

**F5 — C2's m2 class is null at both revisions and nowhere disclosed.**
Baseline receipt: `counted` contains zero m2 findings, `couldNotEvaluate: 75`; tip: `couldNotEvaluate:
79`. Exactly one m2 command ever evaluates (`git cat-file -e a89f193:scripts/round-evidence-audit.mjs`,
claimed 128 = observed 128). The claim's own killRule requires a null class to be "disclosed as a
null class, … the target stated over the classes that did fire"; `grep -rn "null class" SCORECARD.md
LOG.md corpus/lessons/round-24.md` → nothing. LOG.md:1757 claims the counter works "in three
classes" with a straight 5 → 0, implying three live classes.

**F6 — C3 provenance figure false in three documents.**
`wc -c corpus/evidence/round-24/sources/page.pdl` → **61,911** bytes; every record says
"82,548 bytes decoded" (entry `corpus/knowledge/navigation-history-bfcache-evidence.md:4`,
`corpus/lessons/round-24.md:16`, `corpus/SOURCES.md:120`). 82,548 is exactly the base64 length
(`61911 × 4/3 = 82548`) — the encoded response was measured, not the decoded bytes. The
digests and located quotes do verify (`sha256sum` matches `e944a3b1…`; `BackForwardCacheRestore`
at `page.pdl:1345`, `backForwardCacheNotUsed` at `:1706`; `bfcache.html` is exactly 157,667 B with
the restore quote at `:2531`), so C3's admission stands — but the evidence chain the LOG
endorses carries a provably wrong size figure.

## Moderate / minor findings

**F7 — `16fa92f`'s own commit subject misdescribes it.** Subject: "remove the round-23 scratch
over-commit (M5) and land the late seat-report drift"; contents: one file,
`.ufo/waves/round-23/w2/W2Simplifier.md`. The scratch removal happened at `9e52cb2`. The LOG's
description of `16fa92f` is accurate (the diff is a one-line drift-note insert at line 8 of the
pinned-bytes section — an insertion inside a bullet block, not a file-end append), but the entry's
audit trail leads to a commit whose message is false.

**F8 — Next-iteration (c) is not falsifiable and its premise is stale at tip.**
"Decide the adjacency-map row's kind cell" names no command, observable, or failure condition.
Its parenthetical — "the conformance gate reports it as a missing row rather than an incomplete
one" — described the baseline; at tip `check-adjacency` is clean via the canonical row (gate
output `rows: 1`). The underlying mechanism is sharper than the entry admits:
`parseRows` skips any row whose header lacks a Kind-ish column (`check-gate-registry.mjs:174`,
`if (!m) continue`), so a non-conforming registry table (e.g. the 4-column `Entry|argv|Verdict
map|sha256` row at `SKILL.md:1940`) is invisible — it cannot be flagged "incomplete", and no
`e4-unparseable-row` class exists. The killRule's "unparseable row → nonconformant" clause has no
implementation; "0 nonconformant" is vacuous over exactly the rows the parser cannot read.
(a) names an observable (a real `BackForwardCacheRestore` on a loopback fixture) — falsifiable.
(b)'s premise verifies (`LOG.md:1664` reads "`--selftest` 12/12") — a build action without a
stated expected observation, partially falsifiable.

**F9 — Defect-2 closure ("89 → 0 porcelain paths") is not reproducible at the reviewed tip.**
`git status --porcelain` → 5 entries (`gen-w2.mjs`, `w2-dispatch.err`, `w2-dispatch.json`,
`w2-spec.json`, `w2/`) — wave-2 dispatch artifacts outside the `.ufo/waves/*/scratch/` ignore
rule. SCORECARD.md:1256 asserts "git status --porcelain empty at the tip" — false at the
reviewed tip, and the round-24 analog of routed defect 3 (wave artifacts landing after the
report commit) is already recurring with the W2 reports themselves.

## Verified (what held under re-run)

- All five named hashes exist; every path the entry names is carried by its commit
  (`git show --name-status` per hash); the entry's commit order matches `git log
  573c99e..HEAD` exactly (6 commits, 6 items — though the 6th is unnamed).
- C1: re-run at `573c99e` → `nonconformant: 3`, exit 1, findings identical to `c1-baseline.json`
  (e1-missing-row for check-adjacency, check-measurement-binding, round-evidence-audit); re-run
  at `ad125e8` → `nonconformant: 0`, exit 0, `gates: 14`. SKILL.md §"Round 24 — gate registry
  conformance" (line 2455) carries 11 canonical rows; `round-evidence-audit` row present (2477).
- C3 counting command at tip: `git grep -lE '^source: S10[45] ' HEAD -- corpus/knowledge | wc -l`
  → 1 (`navigation-history-bfcache-evidence.md`); S104/S105 rows added in `f6f7f45` (2 added rows);
  both sha256 digests and all three located quotes verify against committed bytes.
- Defect 5 non-reproduction claim verifies: `before.exit` = 1 at `03c1b4d`, = 128 at `7ac9fff`,
  `c90dffd`, `573c99e` — consistent with "the stale 1 lived at `03c1b4d` until `7ac9fff`".
- The entry's own reproduction command runs: `git ls-tree -r master .ufo/waves/round-23/scratch
  | wc -l` → 0 (`master` = `ad125e8`).

## Residual risk / verification gaps

- The m3 class being checkout-state means C2's after is **never** falsifiable from committed
  bytes — a fresh checkout scores it 0 by construction (QUALITY 65 admits this). The honest
  claim is therefore "5 → n where n is a property of the checkout"; the round asserted 0.
- The gate-registry counter never sees unrecognized table shapes, so C1's "0" is bounded by
  the parser's five-shape knowledge; a sixth shape lands clean. Disclosed obliquely in
  next-iteration (c) but not bound to the claim.
- `git status --porcelain` at the reviewed tip will keep growing as W2 seats write; any m3-based
  number quoted now is stale the moment it is quoted.
- Tool installs: none. Node already present; TMPDIR set per host note.
