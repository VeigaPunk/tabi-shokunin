# CritC2Verdict — attack on C2 (calibration, claimed 5 → 0)

Reviewer: L1Tabi24.CritC2Verdict. Lane tip attacked: `ad125e85c235e1c4ec6a08e398bd64da01f68a08`.
Baseline: `573c99e4885382db38babc3a6fc90e77afeb42a6`. All commands run with
`TMPDIR=/home/vgpnk/tmp-tabi24` (host /tmp is full). Read-only git only; no installs made
(none needed; pacman untouched per the pause guard).

Observation / inference / unknown are separated per finding.

## Reproduced headline numbers

- `node scripts/check-selfassessment.mjs --rev 573c99e4885382db38babc3a6fc90e77afeb42a6 --json`
  → `mismatches: 5`, `counted`: m1 at SCORECARD `:410` (25 vs 26), `:1138` `:1139` `:1151`
  (12 vs 13), m3 observed 5; `couldNotEvaluate: 75`; `superseded: 0`; exit 1.
- `node scripts/check-selfassessment.mjs --rev ad125e8 --json` (first run, 5 untracked paths)
  → `mismatches: 1`, counted = one `m3-unlanded-paths` (observed 5); `superseded: 5`;
  `couldNotEvaluate: 79`; exit 1.
- `node scripts/check-selfassessment.mjs --rev b973fde --json` → `mismatches: 1` (m3,
  observed 5; the committed receipt recorded observed 4 at the same rev).
- `--selftest` → `cases=13 passed=13` exit 0.
- `corpus/evidence/round-24/c2-tip.json` — the committed "tip" receipt — records
  `rev: b973fde` (one commit before tip), `mismatches: 1`, `clean: false`.
- `corpus/evidence/round-24/c2-measurements.json` — `after.mismatches: 1` at `b973fde`.
- `.ufo/waves/round-24/claims.json` (committed form): `before: 4`, `after: 0`,
  `revisions: []`. On disk a peer is now appending revisions (captured below).

## The after-value of 0 is false as committed

**Observation:** SCORECARD.md:1233 asserts `C2 calibration | 5 → 0 mismatches | **met**: … tip
counts none`. LOG.md:1755 asserts `5 → 0`. claims.json `after: 0`. Yet the lane's own committed
receipt `c2-tip.json` says `mismatches: 1` at `b973fde`, and my re-run at `ad125e8` says 1.
There is no committed receipt anywhere recording `mismatches: 0` at any revision. The "0" the
disposition and LOG assert is not a measured value; it is the value the counter would produce
if `git status --porcelain` were empty, which it never was during the round's measurements
(the receipt itself records 4 unlanded paths at that instant).

The live (uncommitted) claims.json revision now concedes this: `"to": "after 0, measured at
the final clean tree; the m3 class is a live-tree property, so mid-wave runs read 1 while wave
artifacts are uncommitted; the final receipt records the clean-tree run"`. But no such
clean-tree receipt exists; the "final receipt" it anticipates has not been written. As
committed, the claim and its evidence disagree.

## Every way the after=0 is weaker than it looks

### 1. m3 is not scoped to the revision — and not scoped to anything

`m3Findings(repo, scorecard)` reads the newest `## Round N — executed disposition` heading from
the rev's SCORECARD blob, then runs `git status --porcelain --untracked-files=all` on the live
working tree and reports `claimed: "landed", observed: <path count>`.

- **Not rev-scoped.** `--rev 573c99e` and `--rev ad125e8` both measure today's tree (I got
  `observed: 5` on both runs). The baseline "measurement" is a snapshot of the 2026-10-25 tree,
  never reproducible: the committed `c2-baseline.json` says observed 4, my re-run says 5.
- **`claimed:"landed"` is hardcoded** (`return [{ … claimed: "landed" … }]`). The class never
  parses whether the disposition asserts landed work; any non-empty tree under any
  disposition heading fires. `observed !== "landed"` is `number !== string`, always true.
- **Unit is a line count, not a defect.** 4 paths, 89 paths, 1,034 paths all count as exactly
  one mismatch, so the metric cannot express the routed defect's magnitude (89 → 0).
- **It taxes the wave itself.** The 5 paths it counted are `.ufo/waves/round-24/{gen-w2.mjs,
  w2-dispatch.json, w2-spec.json, w2/, w2-dispatch.err}` — wave-2 orchestration, not lane
  artifacts. `.ufo/waves/*/scratch/` is ignored but `w2/` is not, so every wave-2 report file
  that lands (including this one) increments m3's observed count; it grew 4 → 5 → 20 → 40
  across my session as peers wrote. The claim's own wave makes its after-value false.
- The live revision's hedge ("measured at the final clean tree") makes the metric read the
  *integration instant*, not the revision — a property no committed bytes can preserve.

### 2. The counter is whatever is on disk — it is not bound to `<rev>`

`evaluate` runs `scripts/check-selfassessment.mjs` as the process, i.e. the working copy.
`gateTally` pins *other* gates' blobs to the rev (byte-identical or could-not-evaluate) but
the instrument applies no such pin to itself. During this review a peer's mutation wave wrote
a hardened variant to `scripts/check-selfassessment.mjs` (diff observed: stricter supersession
requiring `supersed|correct|replace` + `:\d+` markers, plus `lineText` capture). Mid-mutation
the counter printed `mismatches: 5, superseded: 0` for `--rev ad125e8`; after it settled,
`mismatches: 1, superseded: 4` (the hardened code also stops "superseding" the already-correct
figure at `:197`). Three different verdicts for one committed revision inside one session —
**observation**, grounded in `git diff` of the disk file vs `ad125e8:…` (sha256 `740b9dc` blob
vs `6b8d31e` disk). Consequence: a skip-work mutant of the counter itself is the ultimate
control escape — edit the file to always emit `mismatches: 0` and the counting command
produces 0 with no internal witness; only m3's dirty-tree flag notices, collapsed with every
other untracked path.

### 3. Supersession clears the mismatch without fixing the wrong figure

- `f.superseded = findings.some(g => g.script === f.script && g.line > f.line &&
  g.observed === g.claimed && g.observed === f.observed)` — any later line naming the same
  script and stating the oracle-true tally clears every earlier stale mention of it, in any
  section, with the stale bytes untouched. **Observation:** SCORECARD `:1139` and `:1151`
  still read `12/12` at tip (`git show ad125e8:SCORECARD.md | grep -n '12/12'` → :1139,
  :1151 plus unrelated historical hits). SKILL.md:1559 still says "eight isolated CLI cases",
  SKILL.md:1614 still says "25 isolated CLI cases" — both superseded only in prose. So after=0
  means "no *unsuperseded* mismatch", not "no false figure": the document still asserts
  12/12, 25, and eight while the counter reads clean.
- **Disclosure:** partial. SCORECARD:1233 says "five earlier statements superseded", :1258
  says routed defect 4 "closed (corrections block, mechanical supersession, C2 counts it)",
  SKILL.md:2469/2470 say "(… figure is superseded)". claims.json's declared text (full 798
  chars, verified) contains neither "supersed" nor "unsuperseded"; `After: 0 mismatches at the
  round tip` is categorical, and defect 4 is declared "closed" while the stale figure remains.
- **Fragile.** The predicate requires `g.observed === f.observed`. The next time a gate's
  selftest case count changes (this round bumped one matrix 12→13), the correction line
  becomes stale itself and every earlier figure it superseded re-opens — **inference** from
  the quoted predicate; a gate-matrix change resurrects all cleared mismatches at once.
- The committed instrument's `superseded: 5` includes `:197` — a *correct* figure (12 vs 12)
  "superseded" by another correct figure. So the count the disposition cites as "five earlier
  statements superseded" overstates the repairs: 4 stale + 1 always-correct.

### 4. The m1 window is narrower than declared — and misses where the lane keeps tallies

- Declared: "SCORECARD.md blocks that name a lane gate script, **and SHONEN.md**". Code:
  `readBlob(repo, rev, "SCORECARD.md")` only; `grep -c SHONEN scripts/check-selfassessment.mjs`
  → 0. SHONEN.md happens to carry no tally at either rev (vacuous gap), but the declaration is
  false and the mechanism for a second document does not exist (the parser needs `##` sections
  naming scripts; SHONEN.md has none).
- SKILL.md — the actual registry home — is outside both declaration and code, and at tip it
  still contains two stale self-test tallies (1559 "eight isolated CLI cases", 1614 "25
  isolated CLI cases"). The corrections block claims the restatement "replaces" them; no
  instrument verifies that. `eight` is a word — TALLY_PATTERNS are digit-only, so it could
  never be seen even in scope; `25 isolated CLI cases` *would* match `\b(\d+)\s+(?:isolated
  )?(?:CLI )?cases\b` if SKILL.md were read.
- Line-granularity blind spots inside the window itself: the pattern requires
  `/self-?test|case/` plus a digit tally. `cli_cases=36` (SCORECARD:1199) matches neither
  `\bcases=` (preceded by `_`) nor the line filter's needs — it produces *no finding at all*,
  not even could-not-evaluate. A tally the lane cannot typo-detect is simply invisible.

### 5. Per-line counting inflates the before value

SCORECARD :1138–1139 is one wrapped sentence ("a 12-case in-memory matrix … Evidence:
`--selftest` (12/12)") counted as **two** findings for one stale figure. The true count of
distinct stale facts at baseline is 4 (410, 1138/1139, 1151, m3) — which is what the frozen
`before: 4` happened to say, for a different decomposition. `counterField` says "distinct
findings" but the unit is a file line: text layout moves the metric. The executed disposition
then prints "four stale tallies … :1138, :1139, :1151", adopting the wrap artifact as if it
were four defects.

### 6. m2 is a null class — undisclosed despite the killRule

- Baseline: 76 m2 findings, **0 counted**; 75 could-not-evaluate, 1 measured (a `git cat-file
  -e a89f193:…` receipt whose claimed/observed 128 agreed). Tip identical: 76/0/1. So m2's
  discriminating coverage over the entire committed corpus is one command.
- The closed grammar `^git (?:-C \S+ )?(cat-file -e|show) …$` excludes every `node …`,
  `sed`, `sha256sum`, `ls`, `wc`, `node -e`, and the fleet `sources-census.sh` receipts — the
  receipts most likely to disagree with a re-run are the ones m2 can never check. The declared
  "read-only command it names" is far broader than two git forms.
- The killRule requires "a class [that] yields no finding at the baseline" to be disclosed as
  a null class with the target stated over firing classes. m2 yields no *decision* at
  baseline. `git grep -in 'null class' ad125e8` → no hits; the declared text and the live
  revisions contain no null-class disclosure. **Verdict:** the claim's own kill rule is
  unmet; at best m2 is a stub class whose one in-grammar comparison happened to agree.
- **Self-reference hole:** the disposition's own `5 → 0` figure is a self-assessment claim
  living in SCORECARD/LOG, matching no m1 tally pattern and no m2 receipt shape. When it is
  wrong — it is — nothing counts it.

### 7. Could-not-evaluate swallows the lane's own new-gate figures

- 75 cne at baseline, 79 at tip. The four additions are `:1232`,`:1233`,`:1243`,`:1249` —
  `--selftest cases=22` (check-gate-registry) and `cases=13` (check-selfassessment), i.e. the
  headline tallies of the two claims themselves, inside `## Round 24 — executed disposition`,
  a multi-script section, on rows naming no script → "ambiguous script association". The
  counter therefore cannot verify the self-assessment figures its own admission rests on, by
  construction of the section layout (any disposition table naming >1 gate produces this).
- The ambiguous-not-counted path is **new this round**: per-line association landed at
  `b973fde`, and the locking selftest case `m1-ambiguous-association-is-not-counted` was added
  at `ad125e8` — the same commit that introduced the four ambiguous rows. The instrument's
  newest test certifies the loophole the new text falls into. The killRule's "never counted as
  a match" is honoured, but "0 mismatches" then means "0 among the decidable", which the claim
  does not state.
- And the "tip" receipt was captured at `b973fde`, before `ad125e8` added those rows and the
  oracle change — so the after-measurement predates the final bytes it describes.

### 8. Claim-artifact defects (committed claims.json)

- `before: 4` vs measured 5 (`c2-baseline.json`): the frozen estimate was never corrected in
  the committed file; `revisions: []` at tip. (On-disk revision now records 4→5 — post-freeze
  and uncommitted.)
- Declared "one unlanded-path mismatch over 89 porcelain paths": the counter's m3 reported 4
  at receipt time; 89 is the round-23 defect magnitude, not a baseline measurement.
- Control: "Recorded before data in `.ufo/waves/round-24/control/control-receipt.json`" — no
  such file exists on disk or in the tree (the only committed hit is
  `w1/ExecControlSkip.md`). The actual control lives in gitignored scratch
  (`scratch/ExecControlSkip/check-selfassessment-skip.mjs`), which I ran: it prints
  `mismatches: 0` at baseline with `grep_hits_in_SCORECARD_md: 4`. The control is thus
  unverifiable from committed bytes, and the claimed recording path was never written.
  Moreover the control only discriminates at baseline; at tip a grep would still find `12/12`
  at :1139/:1151 while both counter and shortcut print 0/1 — indistinguishable reasons.
- `counterField` "distinct findings" is per-line (see §5); the claim's "three stale figures"
  and the receipt's 4 m1 findings disagree about what one figure is.

## Fixes (smallest safe)

1. **Bind the counter to its bytes**: resolve `rev:scripts/check-selfassessment.mjs` to a
   blob hash and require it to equal the disk copy before evaluating, else exit 2 — the same
   pin it already applies to other gates. Otherwise the counting command is unverifiable.
2. **Scope m3 honestly**: either make the m3 finding carry `rev` and `paths[]` explicitly and
   count "unlanded paths the disposition names", or drop m3 to could-not-evaluate whenever the
   tree is non-empty for reasons outside the round's claimed landings; at minimum disclose in
   the claim that after=0 is conditional on a clean `git status`, and write the clean-tree
   receipt the revision text already promises (none exists).
3. **Supersession requires a marker + citation**: adopt the on-disk mutant's rule (superseding
   line must carry `supersedes`/`replaces` AND cite the line it supersedes, e.g. `:1138`);
   keep the `f.observed !== f.claimed` guard so correct figures are never "superseded". This
   is fixable, and wave 2 already built it — land it.
4. **Widen m1 honestly or narrow the declaration**: either read SHONEN.md + SKILL.md as
   declared (SKILL.md holds two live stale figures at :1559/:1614) or strike "and SHONEN.md"
   from the declared scope. Add word-number and `N/M`-style coverage only if declared.
5. **Name the script on every tally line** in disposition/capability rows (or give each gate
   its own section) so the lane's own `cases=22`/`cases=13` stop being could-not-evaluate; and
   disclose the null class: state explicitly "m2 produced no counted finding at baseline; the
   target is over m1+m3" per the killRule.
6. **Count figures, not lines**: coalesce adjacent-line tallies asserting the same number for
   the same script, so :1138–1139 is one finding.
7. **Land the control receipt** at the claimed path (or fix the claim to point at the
   gitignored location and say so), and re-score the control at tip, not only baseline.

## What is not broken

- The counter's `counted` filter, the fail-closed exit codes, the selftest (13/13 pass, incl.
  one red case per class), and the honest listing of findings vs counted are sound.
- The before-side is real: baseline genuinely counted ≥4 stale self-assessment figures plus a
  dirty tree. The improvement is real in mechanism; the 0 endpoint is what is untrue as
  committed.
- The on-disk claims.json revisions (4→5 correction, m3 live-tree caveat) are the right shape
  of disclosure for two of the findings; m2's null class, m1's window, supersession
  semantics, the instrument self-pin, and the absent control receipt are still unaddressed
  there.
