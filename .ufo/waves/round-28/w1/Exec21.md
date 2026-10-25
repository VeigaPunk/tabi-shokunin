# Exec21 — C2 audit: LOG.md:221 false-clear and the frozen citation behavior

Seat: Exec21 (executor, leaf — no delegation). Wave `tabi-r28-w1`, item 21.
Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Measured rev: baseline
`eb23c0b84668afc48ebab8bd7e4a8a4457407cc4` (= `HEAD`, the round-28 frozen baseline).
Report path (this file): `.ufo/waves/round-28/w1/Exec21.md` under the lane root.

## 1. Frozen claim (source)

Frozen claims: `.ufo/waves/round-28/claims.json`, claim `C2` (line 12). Declared
(quoted, 41 words): "Repair scripts/check-selfassessment.mjs m1 supersession so a
correction only clears the exact stale tally it cites, not an unrelated later
line/paragraph." Targets: "LOG.md:221 appears as a mismatch unless an exact-line
correction cites it; selftest contains both red false-clear and green exact
citation cases". Kill rule: "If any unrelated correction still clears LOG.md:221,
claim misses. Do not alter historical LOG prose or weaken existing matching rules
to get a green count." Failure-capable: "selftest fixture with a correction citing
another line must retain mismatch; exact citation fixture must supersede."

Conclusion in one line: the false-clear is caused by the citation arm being a bare
`/:\d+/` substring test (`scripts/check-selfassessment.mjs:325`); the frozen claim
requires citation **equality** — a correction clears only the stale tally whose own
line number (`:221` for LOG.md:221) appears in the correction's cited-line set.

## 2. State at baseline — observation

Command (read-only, the frozen counting command exactly):

```
node scripts/check-selfassessment.mjs --rev eb23c0b84668afc48ebab8bd7e4a8a4457407cc4 --json
```

Observation (exit 1): `mismatches=1` (sole counted finding is `m3-unlanded-paths`
from the live wave tree, not m1); among m1 findings, `LOG.md:221` is reported
`script=scripts/check-freshness.mjs claimed=8 observed=12 superseded=true`. That is
the known false-clear: an uncorrected stale tally is marked superseded, so it is
not counted. Independent prior evidence agrees: `corpus/lessons/round-27-verifier-spotcheck.md:15`
("its own finding at `LOG.md:221` says claimed 8, observed 12, `superseded=true`
… does not cite line 221").

The baseline `LOG.md` blob is the round-28 HEAD blob. `LOG.md:221` (blob line 221)
reads "exit 0. `--self-test` → `FRESHNESS_SELFTEST verdict=clean cases=8`," — a
claimed 8 for `scripts/check-freshness.mjs`; the gate's own selftest oracle measures
12 (`node scripts/check-freshness.mjs --self-test` → `cases=12`). It is a genuine,
non-ambiguous stale tally.

## 3. Mechanism of the false-clear — observation

Supersession loop `scripts/check-selfassessment.mjs:316-328`; the citation arm is
`/:\d+/.test(text)` (line 325): *any* colon-number token in a later paragraph
satisfies "cites the superseded line", never compared to the finding's line.

Replica of the shipped predicate over the baseline blob (scratch
`.ufo/waves/round-28/scratch/exec21/strict-sim.mjs`, reproduces the shipped flag for
`:221` — `shipped_superseded=true`) finds exactly two later paragraphs that clear
`LOG.md:221`:

| paragraph (blob lines) | content that satisfies the arms | cited `:\d+` tokens | cites 221? |
|---|---|---|---|
| 265–447 (183-line round-1 entry) | `Corrected owned work` (:266), `scripts/check-freshness.mjs` (:272), `12-case self-invocation` (:275) | 16, 28 (timestamp `2026-10-15T05:16:28Z`), 18751 (port `127.0.0.1:18751`) | no |
| 1904–1925 (round-27 correction block) | `scripts/check-freshness.mjs` + `cases: 12`; marker "Correction (supersedes …)" | 335, 335, 391, 391, 1090, 1090, 1103, 1103, 1863, 1863 | no |

Sweep (negative claim): `git show eb23c0b…:LOG.md | grep -n ':221'` → only line
1931 (the round-27 falsification statement, which cites `:221` as the *defect*),
no correction paragraph cites `:221`. So no legitimate supersession of `:221`
exists at baseline; its `superseded=true` is produced solely by the loose arm.

Strict-equality replica over the same blob: `strict_superseded=false` for `:221`
(i.e. it becomes a counted mismatch), while `:335`, `:391`, `:1090`, `:1103`
remain `true` — paragraph 1904–1925 cites those lines exactly, so the four genuine
dispositions survive an equality fix. `:1664` (round-evidence-audit, 12→13) is
cleared by the paragraph beginning at 1845, which cites `:1664` — also survives.

## 4. Precise citation behavior the frozen claim requires

1. **Equality, not presence.** Replace `:/:\d+/.test(text)` with a citation-set
   check: extract all `:\d+` tokens in the correction paragraph and require the set
   to contain `String(f.line)`. A paragraph that cites only other lines (e.g.
   `:999`, `:335`, or non-line tokens like timestamp `:28` / port `:18751`) must
   NOT clear the finding.
2. **Target behavior at LOG.md:221.** Under the repaired rule, `LOG.md:221`
   remains `superseded=false` and is counted → the self-assessment mismatch count at
   tip becomes nonzero for m1 (claim's `after` arm), unless a future correction
   paragraph that names the same script, carries a correction marker, cites
   `:221` exactly and states the oracle-correct number 12 is appended.
3. **No weakening of the other arms.** Same-script naming, marker word, and
   oracle-correct tally number remain required; historical LOG prose must not be
   edited to force the count (kill rule).
4. **Positive control must keep passing.** An exact-citation correction (same
   script, marker, oracle number, citing the true line) must still supersede — the
   four legitimate dispositions at :335/:391/:1090/:1103 and :1664 depend on it.
5. **Selftest surface.** Current suite is 17/17 (`--selftest` → `cases=17
   passed=17`). It already contains the green exact-citation case
   (`m1-log-stale-then-corrected`, `CASES` at `scripts/check-selfassessment.mjs:506-514`,
   cites `:6` and clears) and the wrong-*number* red case (`m1-log-wrong-number-correction`,
   `:516-524`). It lacks the required red **wrong-line** case: a correction citing a
   different line (e.g. `:999`) must keep the stale tally a mismatch (exit 1).
   That is the missing negative test the claim names ("red unrelated-citation
   case"). Round-27 attack receipts show the very shape (`case-a-different-line`,
   exit 0 / clean — should be 1; `.ufo/waves/round-27/scratch/ExecC1Attacks/out/case-a-different-line.json`,
   and the written-up report `.ufo/waves/round-27/w1/ExecC1Attacks.md` §3 case 3).

## 5. Adjacent observations (recorded, out of C2's minimal scope)

- **Unit is the paragraph (F3).** 1904–1925 is one blank-line-divided paragraph of
  five bullets; equality alone keeps the five dispositions working, but per-bullet
  binding is not enforced. Recorded in round-27 reports
  (`.ufo/waves/round-27/w1/ExecC1Attacks.md` F3; `.ufo/waves/round-27/w1/CritC1Supersession.md` §10.1
  — paragraph+own-citation is sufficient; entry-scoped+equality is the minimal
  predicate satisfying both intent and after-arm).
- **Number arm overbreadth (F2).** `statedTallyNumbers()` (`:246-254`) accepts a
  bare `\bN/M\b` fraction at line 252, so an unrelated fraction can supply the
  oracle number (round-27 fixture-d / case g′). Not required by C2's frozen text;
  noted as adjacent hardening.
- **Marker arm (F7).** `/supersed|correct/i` matches negations ("This is not
  superseded"). Not in C2's frozen scope.
- m1 `:1664` context: at baseline blob, `:1664` is correctly superseded by the
  1845–1864 paragraph citing `:1664` (observation: `git show eb23c0b…:LOG.md | sed -n '1845,1864p'`
  contains "supersedes LOG.md:1664").

## 6. Evidence index

| evidence | command / location |
|---|---|
| claim C2 frozen text | `.ufo/waves/round-28/claims.json:12` |
| shipped behavior at baseline | `node scripts/check-selfassessment.mjs --rev eb23c0b… --json` (exit 1; LOG.md:221 superseded=true) |
| selftest suite state | `node scripts/check-selfassessment.mjs --selftest` → cases=17 passed=17 |
| stale-tally line content | `LOG.md:221` blob line |
| clearing paragraphs + cited sets | scratch `.ufo/waves/round-28/scratch/exec21/strict-sim.mjs` (replica; shipped flag for :221 matches the real gate) |
| sweep: no correction cites :221 | `git show eb23c0b…:LOG.md \| grep -n ':221'` → only line 1931 (defect statement) |
| oracle | `node scripts/check-freshness.mjs --self-test` → `cases=12` |
| prior defect evidence | `corpus/lessons/round-27-verifier-spotcheck.md:15`; `.ufo/waves/round-27/w1/ExecC1Attacks.md` (§3, §5); `.ufo/waves/round-27/w1/CritC1Supersession.md` (§1–§5, §8, §10.1) |

Distinctions: all numbers above are observations (commands listed) or replicas of
the shipped predicate (scratch, flagged). No inference is load-bearing for the
conclusion. Negative claim (no `:221` citation) backed by full-blob grep sweep.

## 7. Tooling

No installs/upgrades; `node v24.21.0`, `git` present. PACMAN untouched. No
tracked files edited; scratch only under `.ufo/waves/round-28/scratch/exec21/`.
