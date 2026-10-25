# Exec22 — round-28 C2 adversarial fixture: unrelated-citation supersession

Seat: Exec22 (leaf, item 22). Wave: tabi-r28-w1. No changes to lane tracked
files; read-only git; no builds/tests/formatters run in this wave (parent owns
post-integration gates). No tool installs (RULES.md read; nothing installed).
Only writes: this report and the scratch artifact below.

## Frozen claim cited

- `tabi-shokunin/.ufo/waves/round-28/claims.json` C2 (calibration): "Repair
  scripts/check-selfassessment.mjs m1 supersession so a correction only clears
  the exact stale tally it cites, not an unrelated later line/paragraph"; metric
  `selfassessment_mismatches_and_cases`; killRule: "If any unrelated correction
  still clears LOG.md:221, claim misses"; failureCapable: "selftest fixture
  with a correction citing another line must retain mismatch; exact citation
  fixture must supersede."
- Motivating evidence: `corpus/lessons/round-27-verifier-spotcheck.md:15`
  (false-clear of LOG.md:221, claimed 8 observed 12, superseded=true though the
  paragraph does not cite line 221) and `:46-47` (routed repairs: "enforces
  citation to the superseded line ... add committed regression coverage for
  unrelated paragraph/citation and ambient-fraction false clears").

## Code read (observation)

Read `scripts/check-selfassessment.mjs:316-328` (supersession block). The
predicate that marks finding `f` superseded:

```
319:    f.superseded = paras.some((p) => {
320:      if (p.start <= f.line) return false;
322:      const namesScript = ... m[1] === f.script;
323:      return namesScript &&
        /supersed|correct/i.test(text) &&
325:        /:\d+/.test(text) &&
326:        statedTallyNumbers(text).includes(f.observed);
327:    });
```

Defect (inference from the code above): criterion (c) only tests that the later
paragraph contains **any** `:N` token (`/:\d+/`), never that `N` equals the
finding's own line `f.line`. Any later paragraph naming the same script with a
correction marker, a line citation to anything, and the oracle-correct number
clears the finding. This is the "unrelated-citation" false-clear class named in
claims.json C2 and spotcheck :46.

Real-world correspondence (observation): the round-26 falsification record in
`LOG.md:1927-1935` states this exactly: "the paragraph-level matcher accepts
any colon-number token as the cited superseded line. It therefore marks the
real `LOG.md:221` stale selftest mention superseded by a later 183-line
paragraph that does not cite line 221". The stale tally itself is at
`LOG.md:221` (`--self-test` → `FRESHNESS_SELFTEST verdict=clean cases=8`,
claimed 8; oracle for that gate today is 12, `LOG.md:254`).

## Adversarial fixture (the deliverable)

Purpose: red unrelated-citation case — a later correction paragraph cites a
different stale tally line and must NOT supersede "this one" (the uncited
line). Full artifact: `.ufo/waves/round-28/scratch/exec22-unrelated-citation-case.mjs`
(proposed `CASES` entry matching existing case style).

Fixture LOG.md (committed in a mktemp repo via `d.gate`/`d.log`, same API as
cases `m1-log-stale-then-corrected` etc.):

```
1: # LOG
2:
3: ## Round 23 — executed disposition
4:
5: `scripts/check-fixture.mjs` gate landed.
6: Non-vacuity: `--selftest` 12/12 across the fixture matrix.
7:
8: Interim rerun: `--selftest` 12/12, method unchanged.
9:
10: ## Later corrections
11:
12: Correction (supersedes LOG.md:8): `scripts/check-fixture.mjs` `--selftest` measured `cases: 13` at the tip.
13:
```

Gate `scripts/check-fixture.mjs` = existing `GATE_SRC` (oracle prints
`verdict=clean cases=13`), so observed tally is 13 for every finding.
SCORECARD.md carries the correct 13/13 (no other findings).

Findings produced (by `m1LogFindings`, per-code inference):
- line 6: claimed 12, observed 13 — stale.
- line 8: claimed 12, observed 13 — stale, and is the line the correction cites.
- correction paragraph starts at line 12 (> both finding lines).

Current matcher trace (inference): correction text names `scripts/check-fixture.mjs`,
has "Correction"/"supersedes", contains `:8`, and `statedTallyNumbers` extracts
`cases: 13` = observed. Criterion (c) passes for **both** findings → both
superseded → `mismatches=0`, exit 0. So today this fixture demonstrates the
false-clear (it would pass green, which is exactly the failure mode).

Required post-fix verdict (asserted in the case as `exit: 1`, `classes:
["m1-selftest-tally"]`): only the finding whose own line is cited (line 8) is
superseded; the uncited line-6 finding remains a counted mismatch → exit 1.
That is the red unrelated-citation case C2 requires.

Positive exact-citation control (already present, stays green): case
`m1-log-stale-then-corrected` (`CASES` at lines 505-514) — correction cites
`LOG.md:6`, which IS the tally line, oracle-correct number 13 → superseded →
exit 0. Companion negative control (`m1-log-wrong-number-correction`, lines
515-524) stays red: cites the right line but wrong number. The three cases
together cover the C2 failureCapable matrix: exact citation supersedes; wrong
number does not; wrong line does not.

Matcher change implied (design only — not implemented here, lane read-only):
replace the bare `/:\d+/.test(text)` with extraction of cited line number(s)
from the paragraph and require one of them to equal `f.line` (e.g. test
`:\d+` tokens against `String(f.line)`; decide multi-line citation ranges, e.g.
`:1352-1353`, as a follow-up). Do not weaken criteria (a)/(b)/(d).

## Evidence

- Sum of `id:` entries in `CASES` = 15 (sweep: grep `^    id: "` on
  `scripts/check-selfassessment.mjs` matched lines 445,451,457,466,472,490,496,
  506,516,526,545,556,567,577,588). Observation.
- Header comment at `scripts/check-selfassessment.mjs:8` says "17 isolated
  cases"; declared 15. Observation (stale header; flag for implementer, not
  part of this fixture).
- Bug predicate located at lines 319-327; quoted `:325` `/:\d+/.test(text) &&`
  and `:326` `statedTallyNumbers(text).includes(f.observed);` verbatim.
  Observation.
- Real LOG.md:221 stale tally (`:221` "exit 0. `--self-test` →
  `FRESHNESS_SELFTEST verdict=clean cases=8`,") and current oracle (12 at
  `:254`). Observation.
- Round-26 falsification record `LOG.md:1927-1935` (quote above, 25 words).
  Observation.
- Nothing was executed; all verdict predictions are labeled inference from the
  read code. Negative claim: no lane tracked file was modified — `git status`
  was not run by this seat (read-only discipline); evidence is the writes list:
  only the two paths below, both untracked (.gitignore ignores
  `.ufo/waves/*/scratch/`, LOG.md:1767).

## Files changed

1. `.ufo/waves/round-28/w1/Exec22.md` (this report).
2. `.ufo/waves/round-28/scratch/exec22-unrelated-citation-case.mjs` (fixture
   artifact, scratch-only).

## Risks / blockers

- Blocker: none. Post-fix verification (running `--selftest`) is the parent's
  gate, not run here per wave contract.
- Risk: if the implementer changes `statedTallyNumbers` or paragraph splitting,
  the fixture's line numbers (6/8/12) must be re-checked; the artifact annotates
  them.
- Risk: multi-line citation ranges (`:1352-1353`) are outside this fixture; a
  future predicate should decide whether a range cites the covered lines.
