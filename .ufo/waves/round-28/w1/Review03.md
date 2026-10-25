# Review03 — C2 claim fit vs actual LOG correction matcher and false-clear

Seat: `Review03` (reviewer, read-only; godspeed). Lane root:
`/home/vgpnk/Projects/shokunin/tabi-shokunin`. Baseline/tip:
`eb23c0b84668afc48ebab8bd7e4a8a4457407cc4` (= HEAD; worktree clean except untracked
`.ufo/waves/round-28/`; `git hash-object` equality verified for LOG.md blob vs worktree).

Scope: check frozen claim C2 (`.ufo/waves/round-28/claims.json`, line 12) against the actual
LOG correction matcher in `scripts/check-selfassessment.mjs` and the live `LOG.md:221`
false-clear; specify red/green controls. No edits to tracked lane files; report only.

---

## 1. Frozen C2 claim (verbatim, id C2)

> "Repair scripts/check-selfassessment.mjs m1 supersession so a correction only clears the
> exact stale tally it cites, not an unrelated later line/paragraph. Target: self-assessment
> mismatch count at tip is nonzero for the known LOG.md:221 false-clear and matching selftest
> includes a red unrelated-citation case and positive exact-citation control."
>
> before: "tip presently reports a false-clear of LOG.md:221 per
> corpus/lessons/round-27-verifier-spotcheck.md:15"
> after: "LOG.md:221 appears as a mismatch unless an exact-line correction cites it; selftest
> contains both red false-clear and green exact citation cases"
> count: "If any unrelated correction still clears LOG.md:221, claim misses. Do not alter
> historical LOG prose or weaken existing matching rules to get a green count."
> failureCapable: "selftest fixture with a correction citing another line must retain mismatch;
> exact citation fixture must supersede."

## 2. Baseline measurements (observations)

| # | Command (cwd = lane root) | Result |
|---|---|---|
| 1 | `node scripts/check-selfassessment.mjs --rev eb23c0b84668afc48ebab8bd7e4a8a4457407cc4 --json` | exit 1; `mismatches=1`, `superseded=10`, `couldNotEvaluate=92`, `clean=false`; counted = `[m3-unlanded-paths observed=45]` (live porcelain). Finding `LOG.md:221` = `claimed=8 observed=12 superseded=true` |
| 2 | `node scripts/check-selfassessment.mjs --selftest --json` | `cases=17 passed=17 ok=true`; case ids: m1-stale-tally, m1-correct-tally, m1-stale-then-superseded, m1-case-phrase-stale, m1-ambiguous-association-is-not-counted, m1-no-tally-is-not-a-mismatch, m1-log-stale-tally, m1-log-stale-then-corrected, m1-log-wrong-number-correction, m1-log-ambiguous-section-not-counted, m2-receipt-matches, m2-receipt-contradicts, m2-unsupported-command-not-counted, m3-unlanded-path, m3-clean-tree, refusal-bad-rev-syntax, refusal-unresolvable-rev |
| 3 | `git show eb23c0b:LOG.md \| grep -n ':221'` | single hit at **1931** only: "`LOG.md:221` stale selftest mention superseded by a later 183-line paragraph" (disclosure prose, names no script, carries no tally — not an exact correction) |
| 4 | `git show eb23c0b:LOG.md \| awk 'NR==221'` | "exit 0. `--self-test` → `FRESHNESS_SELFTEST verdict=clean cases=8`," |
| 5 | replica of shipped + fixed predicate over baseline LOG.md (scratch `supersession-replica.cjs`) | paragraphs=138, longest=183 lines (start 265). Shipped: all six stale LOG findings superseded. Fixed-equality: `:221` NOT superseded (clearing paras `[]`); `:335/:391/:1090/:1103/:1664` still superseded via paras `[1904,22]` / `[1845,20]` |

## 3. Findings

### F1 — HIGH. Defect confirmed live at baseline; C2 before-arm accurate
`LOG.md:221` claims 8, oracle measures 12; the shipped matcher marks it `superseded=true`, so it
is excluded from `counted` — the false-clear is live on committed bytes (command 1, 4). Root
cause in `m1LogFindings` (`scripts/check-selfassessment.mjs:319-327`): line 325
`/:\d+/.test(text)` accepts **any** colon-number token — a timestamp or loopback port is enough —
never comparing it to `f.line`. Two paragraphs clear `:221` without citing it: `LOG.md:265-447`
(183-line round-1 bullet; its colon-numbers are timestamps `:16/:28` and port `:18751`) and
`LOG.md:1904-1925` (the round-27 correction block citing `:335/:391/:1090/:1103/:1863`, never
`:221`). No exact `:221` correction exists (command 3). This matches the spot-check lesson
`corpus/lessons/round-27-verifier-spotcheck.md:15-17` and `LOG.md:1929-1938`.

### F2 — HIGH. Same hole exists in the SCORECARD window; claim scope should cover both
`m1Findings` supersession (`scripts/check-selfassessment.mjs:233-239`) has the identical
unanchored `/:\d+/.test(g.lineText)` at line 239 (line unit; requires `g.observed===g.claimed`).
C2 declares "m1 supersession" without pinning the window; a matcher-only fix that addresses only
the LOG paragraph keeps the SCORECARD any-`:N` hole (Crit §10.3,
`.ufo/waves/round-27/w1/CritC1Supersession.md:301-309`). The frozen wording "only clears the
exact cited stale tally" and the killRule "any unrelated correction still clears LOG.md:221"
operate on both windows; the red/green control set below therefore includes a SCORECARD red arm.

### F3 — MED. `after`-arm metric is not fit as worded: "nonzero" is already true at baseline
At baseline, `mismatches=1` is nonzero **already** — but it is `m3-unlanded-paths` (live
porcelain: 45 uncommitted paths in the wave dir), unrelated to calibration. The claim's scalar
acceptance is vacuously satisfiable without touching the matcher. Operational acceptance **must**
be finding-specific: `counted` must contain `{doc:"LOG.md", line:221, class:"m1-selftest-tally"}`
(and the selftest must contain the red/green cases). Note `m3` reads the live worktree, not
`--rev` (`m3Findings`, lines 379-389), so post-fix runs at a dirty tree will report
`mismatches=2` (LOG:221 + m3); at a clean committed tip, `mismatches=1` (LOG:221 only).

### F4 — MED. Selftest today lacks the required red unrelated-citation case
`CASES` (lines 443-597) has the green exact-citation control (`m1-log-stale-then-corrected`:
correction "supersedes LOG.md:6" with oracle 13 → exit 0) and the wrong-number red
(`m1-log-wrong-number-correction`), but **no** case where a correction cites the wrong line with
the right number. Under the shipped matcher such a fixture clears (exit 0); after the fix it must
be a mismatch (exit 1, class `m1-selftest-tally`).

### F5 — LOW. Paragraph-unit equality residual
The minimal equality fix on the LOG **paragraph** unit still lets one bullet's citation clear
another finding in the same merged bullet block (Crit §10.1): if a future bullet in the
`1904-1925`-style block cites `:221` while the block also names `check-freshness.mjs` and states
12, `:221` would clear even if that bullet did not intend it. Today no `:221` citation exists, so
the claim is met; the safer predicate is bullet-entry-scoped + citation equality. Adjacent,
out-of-C2-scope matcher holes (not required by this claim): negated markers ("does not
supersede" still matches `/supersed|correct/i`, Crit fixture-f) and oracle number arriving from an
unrelated fraction (`statedTallyNumbers` accepts bare `N/M`, line 252, Crit fixture-d).

## 4. Red/green controls (fixture recipes, harness style of lines 443-597)

Gate fixture `scripts/check-fixture.mjs` prints `FIXTURE_SELFTEST verdict=clean cases=13 passed=13`.

| id | window | fixture | expected current exit | expected fixed exit |
|---|---|---|---|---|
| G1 | LOG | stale `12/12` at `LOG:6`; later paragraph `Correction (supersedes LOG.md:6): ... cases: 13` (= existing `m1-log-stale-then-corrected`) | 0 (clean) | 0 (clean) |
| G2 | SCORECARD | stale `12/12` at `:5`; later line `... (13/13) supersedes the twelve figure at \`:5\`` (= existing `m1-stale-then-superseded`) | 0 | 0 |
| R1 | LOG | stale `12/12` at `LOG:6`; later paragraph `Correction (supersedes LOG.md:99): ... cases: 13` | **0 (defect: :221-class false-clear)** | **1**, classes `["m1-selftest-tally"]` |
| R2 | SCORECARD | stale `12/12` at `:5`; later line `... (13/13) supersedes the twelve figure at \`:99\`` | **0 (defect)** | **1**, classes `["m1-selftest-tally"]` |
| R3 | LOG | wrong-number correction citing `LOG.md:6` with `cases: 12` (= existing `m1-log-wrong-number-correction`) | 1 | 1 (regression guard) |

Selftest case count after the required red arms: 17 → 18 (R1 mandatory per claim; R2
recommended for window symmetry). Guard: the four genuine corrections `LOG.md:335/:391/:1090/:1103`
and `:1664` must stay superseded after the fix (replica: they do; `LOG:221` is the only LOG
finding that flips). KillRule check: R1 must remain exit 1 at the post-fix tip; do not relax the
predicate or edit historical LOG prose.

## 5. Post-fix prediction over baseline rev (inference from replica, not an edit)
Fixed matcher (paragraph + citation equality, both windows) over `eb23c0b` → `counted` m1 LOG =
`{LOG:221}` only; `superseded` 10→9; at a clean committed tip `mismatches=1`; selftest 18 (or
19 with R2) cases, all green.

## 6. Residual risk / verification gaps
- Implementer must run the counting command against the committed post-fix tip (blob == crypto
  copy), else `gateTally` returns could-not-evaluate for edited gate scripts.
- `m3` porcelain noise: assert the finding, not the scalar (F3).
- `:1664` provenance contradiction (`LOG.md:1897-1900` vs measured revisions) is a separate
  pre-existing issue, not C2 scope.
- No installs performed. Scratch (replica script + outputs) at
  `.ufo/waves/round-28/scratch/Review03/`.
