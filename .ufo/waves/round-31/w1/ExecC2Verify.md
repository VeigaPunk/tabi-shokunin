# ExecC2Verify — C2 build/verify (tabi round 31, w1)

**Verdict: the C2 target is reachable only through corrections that are (i) appended below every stale line, (ii) one
per stale line (or one per script), (iii) citing that line in its own document, and (iv) stating the gate's own
oracle tally — and every deviation I ran is measurably caught.** In a clean scratch clone at
`9505a10eb80b2a0b273ebaba3f7f872ad302192d` with the frozen counter bytes
(`scripts/check-selfassessment.mjs` sha256 `143d66ff…db2fce` = claims.json `frozenDigests`), the frozen tree reads
`mismatches 9`, exit 1 (exact nine lines named in claims.json); my own append-only corrections (eight paragraphs at
the end of `SKILL.md`, one at the end of `corpus/README.md`, each naming the line's own script and the gate's own
summary tally) read `mismatches 0`, exit 0, with `git diff --numstat` = `26/0 SKILL.md`, `5/0 corpus/README.md`,
0 deleted lines and an empty `scripts/` diff. A correction that cites the right line but repeats the stale number
clears nothing and adds its own mismatch (18); a single paragraph citing the whole range `SKILL.md:1614-2544` while
naming only `scripts/check-selfassessment.mjs` clears **only** that script's three stale lines and leaves all five
other-script lines counted (5), so it does **not** wrongly clear other scripts; and inserting the same corrections
mid-file clears nothing and additionally breaks the freeze-time correction for the former `SKILL.md:2545` (9,
`superseded: []`), because line citations are positional.

## Environment and receipts

- Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`, read-only; no lane file, index or jj state touched.
- Scratch: `S=/fast/scratch/hyaku/tabi-r31/ExecC2Verify`, `TMPDIR=$S/tmp`, one `git clone --shared` at the freeze
  commit (clean: `git status --porcelain | wc -l` → `0`). All commits inside the clone with
  `-c user.name=ExecC2Verify -c user.email=ExecC2Verify@scratch.local`.
- Counter sha256 at the freeze equals claims.json C2 `frozenDigests`; `git diff … -- scripts/` between the freeze
  and every measured commit is 0 lines, so no gate bytes moved.
- No network, no tool installs, no subagent dispatch. Full transcript in `commands.txt` (commands + exit codes).

## Readings (each: `node scripts/check-selfassessment.mjs --rev HEAD --json` in the clone)

| Tree | Commit | Exit | mismatches | deleted lines | `scripts/` diff |
|---|---|---|---|---|---|
| freeze (do nothing) | `9505a10e…` | 1 | **9** | — | 0 |
| append-only corrections (mine) | `daa9381b6` | **0** | **0** | **0** (26/0, 5/0) | 0 |
| (a) right line, stale number | `88a8c3a8f` | 1 | 18 | 0 | 0 |
| (b) range `SKILL.md:1614-2544`, one script named | `48174043…` | 1 | 5 | 0 | 0 |
| (c) corrections inserted mid-file | `68dab7e0c` | 1 | 9 | 0 | 0 |
| (d) extra: script name and tally on different lines | `8c90932d7` | 0 | 0 (one cne finding) | 0 | 0 |

Freeze reading, exactly the nine claims.json lines: `SKILL.md:1614` check-sources 25→26; `:2479` selfassessment
13→30; `:2514` s106 5→10; `:2515` selfassessment 17→30; `:2529` s106 7→10; `:2530` selfassessment 20→30;
`:2543` release-pins 20→29; `:2544` s106 7→10; `corpus/README.md:613` selfassessment 17→30.

Correct run: `counted []`; findings 174 → 183 (the nine appended paragraphs are findings whose claimed number
equals the oracle, so they neither count nor perturb any other window); could-not-evaluate findings unchanged at
103; the freeze-time correction at `SKILL.md:2545` is still `superseded: true`. The appended paragraphs are visible
at `SKILL.md:2584–2606` and `corpus/README.md:665–666` in `correct.json`.

## Negative variants

**(a) Right line, stale number** — eight SKILL.md paragraphs and one README paragraph, each citing the correct
line but restating the stale figure (`(25/25)`, `(13/13)`, `(5/5)`, `(17/17)`, `(7/7)`, `(20/20)`, `(20/20)`,
`(7/7)`, `(17/17)`). Result **18**: none of the nine originals is superseded (`statedTallyNumbers` does not
contain the oracle number), and each correction paragraph is itself a tally claim at a stale figure, so it becomes a
fresh counted finding at `SKILL.md:2584,2587,2590,2593,2596,2599,2602,2605` and `corpus/README.md:665`. Wrong-number
corrections are doubly visible — they fail to clear and they add noise.

**(b) One paragraph, range citation, one script named** — `Correction (round 31, supersedes SKILL.md:1614-2544):
scripts/check-selfassessment.mjs --self-test (30/30)`, README line correctly corrected at the end. Result **5**, with
`superseded` = `SKILL.md:2479`, `:2515`, `:2530` (plus the pre-existing `:2545`). Counted survivors:
`SKILL.md:1614` (sources), `:2514`/`:2529`/`:2544` (s106), `:2543` (release-pins) — one for each other-script line
in the range. **Answer to the posed question: no, (b) does not wrongly clear lines of other scripts.** The
`namesScript` test is evaluated per finding, so a paragraph naming one script can only clear that script's lines;
and `statedTallyNumbers` must contain the finding's own oracle number, so a wrong figure still clears nothing. The
residual gripe is the opposite direction: a single correct number plus a wide range clears *every* same-script
mention in the range whose oracle tally equals it. That is sound here (all three selfassessment stale lines share
oracle 30) but coarse — if one script had two stale lines with different current tallies, one paragraph could only
clear the lines matching the number it states, which is exactly the desired behaviour.

**(c) Mid-file insertion** — the eight SKILL.md correction paragraphs inserted before the `## Errata — round-9
append` heading (line 1059), README corrected at the end. Result **9**, `superseded` = `[]`. Every stale line
survives (now at `:1640, :2505, :2540, :2541, :2555, :2556, :2569, :2570`) because each correction paragraph now
starts *before* its cited line (`p.start <= f.line` fails the later-paragraph requirement), and the line shift
additionally invalidates the freeze-time `SKILL.md:2545` citation, so the 22-case statement resurfaces as a counted
mismatch at `:2571`. Insertion is strictly worse than appending: it breaks both the new corrections and the ones
already landed at the freeze.

**(d) Extra probe — wrapped paragraph** (script name and tally on different lines): result **0**, exit 0, but one
`could-not-evaluate` finding appears at `SKILL.md:2588` (`ambiguous script association`) because the tally line
carries no script of its own. Supersession joins the whole paragraph, so the cited line still clears — the target
stays reachable, at the cost of an uncounted cne finding. Worth avoiding anyway: a future stricter verdict that
treats cne findings as non-clean would flip this run.

## What this settles for the frozen predicate (C2)

1. The target is not reachable by doing nothing, by deleting, by mid-file edits, or by restating stale figures:
   measured 9 / 9 / 9 / 18 against a target of 0.
2. The target *is* reachable with the intended correction shape, and only that shape was shown to reach it:
   append-only at the document end; one paragraph per stale line; the stale line cited by `SKILL.md:N` /
   `corpus/README.md:N` in its own document; the same line's script named; the oracle number stated in a tally
   shape (`(N/N)` was sufficient, no stale number anywhere in the paragraph).
3. Cross-script clearing does not happen: (b)'s five survivors are precisely the non-selfassessment lines.
   A correct-number paragraph cannot launder another gate's stale tally.
4. The 0-deleted-lines half of the predicate composes with the counter rather than duplicating it: all four
   measured trees had 0 deletions, and only the append-at-end tree had 0 mismatches, so an insert-only edit style
   (which the counter would also have caught positionally) is caught twice.
5. Residual risk for the integrator: line citations are positional. Any later insertion above `SKILL.md:1614` or
   `corpus/README.md:613` silently un-supersedes the corrections I prototyped. Corrections must be the last thing
   that moves in those documents; SCORECARD.md and LOG.md must stay untouched by this claim (my trees touched only
   `SKILL.md` and `corpus/README.md`).

## Artifacts (in `.ufo/waves/round-31/w1/ExecC2Verify/`)

| File | sha256 |
|---|---|
| `c2-correct.patch` (the 9 append-only corrections I verified) | `e874dd3873241360496f7b2a34a3a09aafbc10a8030d11a691001fcee7dae38b` |
| `variant-a-stale-number.patch` | `f39bb613fe158c9f0c41112b6085a205db1b0daba89aaabe42067e26d28ba68a` |
| `variant-b-range-one-script.patch` | `cc941eba735708dbe0efa3a27ae9ace739a99c25a036018b53948f7a59cfa37e` |
| `variant-c-midfile.patch` | `40d64355ac93f1313235e172161411969ece0f0c58dde2d182357d301b4baee7` |
| `probe-d-wrapped-tally.patch` | `9d817ac208a6b8a7618b02354f6501525b33f5f58c7859ea49a9a34e83953756` |
| `before-freeze.json` (exit 1, 9) | `b5ec0f1933941cda012e254fe36d2ca99e0ae5d3792a6db9f9a67b40a907cf84` |
| `correct.json` (exit 0, 0) | `9b20b7ca7c5054406f58ee91fe08bb3027977a0e79aa1e1bcd79d6b746f0253b` |
| `v-a.json` (exit 1, 18) | `9f34a3bdb3215d1de8141b859552f12545cbf9ff4d578effa02937567875cb6a` |
| `v-b.json` (exit 1, 5) | `f7664e1273d77d067331b7b913da82acc581470309c77be7a3aa1b58900cd0bd` |
| `v-c.json` (exit 1, 9) | `75d5e0f2503b3a1393123df697c269a7ee260186cb81fd2bdfcaf49ae6c9de3a` |
| `v-d.json` (exit 0, 0 + 1 cne) | `bc766b71ad5ad7bc5fe076a7a8f4673b6b1f6bdb6fa32bc75f8c26bf0471f757` |
| `summary.json` | machine-readable readings table |
| `numstat-*.txt`, `sha256sums.txt`, `commands.txt` | raw numstat, digests, transcript |

The patches are prototypes for the L1 to apply to the lane (this seat never edits lane files). `c2-correct.patch`
applies to the freeze tree `9505a10e…`; the paragraph text is reusable verbatim, but the `:N` citations are only
valid while nothing above them moves.

## Honesty and limits

- Every reading above is a run of the frozen counter in the clone; none is inferred. Unrun: the counter at the lane
  tip (no lane edit was made), the counter self-test at my commits (unmodified bytes), and any live/fetch path.
- I did not verify the `--selftest` table or the five freeze-time controls; those belong to other seats and the
  baseline receipts.
- The exit-code column is the process exit of `node scripts/check-selfassessment.mjs`, checked directly, not derived
  from `mismatches`.
