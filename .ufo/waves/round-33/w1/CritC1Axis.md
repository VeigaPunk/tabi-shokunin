# CritC1Axis — round 33 wave 1 — C1 adjacency, axis falsifier

**Verdict.** C1's *counts* are honest and reproduce exactly (52 candidates / 5 mapped /
0 screened / 47 unaccounted / 0 newMapped at `b7d16fb8`, adjacency clean 10/10), but the
frozen predicate does **not** certify an adjacency move: I reached `predicate: true`
(exit 0) three ways with zero new cross-domain knowledge — (A) four rows that restate the
**one already-mapped** kake split (`corpus/adjacency.tsv:6`, `crawler-discipline-vs-publishing`)
under four cosmetic surface names, plus 43 `not-browser-sense` screens of which **9 are
browser-sense by the counter's own vocabulary** (including `kagi:20` `cdp-bridge`,
`kaidoku:137` CDP/V8-inspector, `kotoba:73` a sibling row declaring tabi's browser-session
ownership, `tsukuroi:150` browser/Electron runtime evidence); (C) a `ruled` row that
re-cites the round‑16 integrator ruling for a *different* candidate line of the same
sibling; (D) a `split-declared` row on a kake-internal line that names no other lane,
whose "other side" is satisfied by tabi's own quote about *publishing*. So the claim is
**partly axis-relabelled**: unaccounted 47→0 is a bound on the map's jurisdiction (map
completeness / calibration), while the only adjacency content is the distinct new
boundaries after semantic review — and the predicate cannot tell that apart from renamed
restatements. Severity **medium, claim-level** (axis attribution + a missing isolating
control). `scripts/check-adjacency.mjs` and the counter's arithmetic hold; the defect is
that `newMapped` keys on the **surface label**, so the map's real overlap count need not
grow, and that screens carry no semantic test at all. The claim survives only if the
closure credits adjacency by distinct boundaries and records 47→0 as a map bound; if the
SCORECARD moves adjacency 8→9 on `unaccounted 0 AND newMapped 4` alone, calibration is
harmed and the round is a trade, not an improvement.

## What I attacked

- `.ufo/waves/round-33/counters/c1-adjacency-sweep.mjs` (frozen, sha256
  `da59d157…c6380` — matches `claims.json:frozenDigests`) — predicate `unaccounted == 0 AND
  newMapped >= 4 AND adjacency clean`.
- `corpus/adjacency.tsv` (baseline sha256 `a099b713…5b0c`, 10 rows) and the frozen gate
  `scripts/check-adjacency.mjs` (sha256 `4e2c2a64…aac` at every probe REV).
- `claims.json` C1 `feasibilityDisclosed`, `baseline/c1-candidates.tsv` (52 lines),
  `baseline/controls-summary.json` (J1–J4 all false).

## Evidence (commands, exit codes, probes)

Scratch: `HYAKU_SCRATCH=/fast/scratch/hyaku`, `TMPDIR=$S/tmp`; clone
`git clone --shared …/tabi-shokunin "$S/clone"; git -C "$S/clone" checkout --detach e6b0a90…`
(`rev-parse --show-toplevel` = clone, verified). All probe commits are in the scratch clone only
(`probe-commits.txt`); the clone worktree was clean (`status --porcelain | wc -l` = 0).

1. **Baseline reproduction** —
   `node …/c1-adjacency-sweep.mjs --repo $S/clone --fleet … --rev b7d16fb8… --json`
   → **exit 1**, `{candidates:52, mapped:5, screened:0, unaccounted:47, newMapped:0,
   adjacency:{verdict:"clean",rows:10,verified:10}}` (`CritC1Axis/c1-baseline.json`).
   Matches `claims.json:before` exactly.

2. **Probe A — renamed restatements + screen-all: predicate TRUE** —
   `--rev 582acf97…` → **exit 0**, `{mapped:9, screened:43, unaccounted:0, newMapped:4,
   adjacency:{clean,rows:14,verified:14}, screenFindings:[]}` (`c1-probeA.json`,
   map `adjacency-A.tsv`, ledger `screen.tsv`). The four rows cite
   `kake:61, kake:304, kake:323, kake:338` — four lines that all restate the split already
   mapped at `corpus/adjacency.tsv:6` (`kake:34`, "`tabi` drives browsers and owns
   client-side crawler discipline; kake owns") — with surfaces
   `browser-execution-boundary-kake-{a,b,c,d}`. The 43 screens declare `not-browser-sense`
   for, among others, `kagi@69b61db…:PROVINCE.md:20` (`cdp-bridge` in the-janitor CLI),
   `kagi…:59` (CDP lease/profile ownership refusal), `kagi…:81` ("browser leases"),
   `kaidoku@8b9634e…:137` (`self-launched CDP/V8-inspector targets`),
   `kotoba@65a5c7a…:73` (a sibling map row stating "tabi owns browser-session and
   web-interaction evidence"), `tsukuroi@9cc9aa7…:150` ("browser/Electron runtime
   evidence"), `kake…:72` (`burnerchrome`), `kake…:362` ("stays tabi's adjacent province
   for anything that executes a browser").

3. **Probe B — same four lines, one surface reused: predicate FALSE** —
   `--rev 72e14bb1…` → **exit 1**, `adjacency:{verdict:"failed",rows:14,verified:13,
   findings:1}`, `newMapped:3`, `unaccounted:1` (`c1-probeB.json`). The single change from
   probe A is row 12's surface name → `crawler-discipline-vs-publishing`, which trips
   `duplicate_row` (gate header `scripts/check-adjacency.mjs:151-153`: "the same folded
   surface+sibling pair appears on two rows"). **The predicate's true/false boundary is the
   surface label, not the boundary reported.**

4. **Probe C — ruled re-citation: predicate TRUE** — `--rev d24863ba…` → **exit 0**,
   `newMapped:5`, clean 15/15 (`c1-probeC.json`): a `ruled` row for
   `kaidoku@8b9634e…:137` reusing
   `tabi-shokunin@58592431…:corpus/lessons/round-16-verifier-spotcheck.md:142`, the ruling
   already cited for `kaidoku:53` (`corpus/adjacency.tsv:2`). The gate binds the ruling to
   the **lane**, not to the line (`scripts/check-adjacency.mjs:84`: "ruling_quote must name
   the sibling lane"). Caveat: this particular line is plausibly inside that ruling's CDP
   boundary, so the finding is instrument-scope (no line-binding), not a proven false
   ruling on the current candidate set — only `kaidoku:53/137` are eligible and 53 is
   already ruled.

5. **Probe D — one-sided split: predicate TRUE** — `--rev f5ef39dd…` → **exit 0**,
   `newMapped:6`, clean 16/16 (`c1-probeD.json`): `split-declared` on
   `kake@0440485…:PROVINCE.md:72` (a kake-internal historical note; the line names no
   other lane) with `tabi_quote` = `web *publishing* (→ kake),`. The gate only requires
   "verbatim existence" of the tabi-side quote (`scripts/check-adjacency.mjs:88-91`), and
   the counter satisfies "name the other side" if **either** side names the other
   (`c1-adjacency-sweep.mjs:222-225`).

## The four questions

**Q1 — sweep+screen ledger: adjacency, or calibration/coverage relabelled?**
Partly relabelled. `AXES.md:16` defines adjacency as "evidence belonging to another domain
reported, not absorbed" with signal "Lane reports name contested scope". A screen row names
what is **not** tabi's scope; it is a jurisdiction bound on tabi's own map (the claim's own
surface sentence says exactly that). In the passing regime of probe A, 43 of the 47
accounting units are screens whose reasons are never tested (`c1-adjacency-sweep.mjs:201-207`:
vocabulary + verbatim quote only), and the remaining 4 are restatements. So the movement that
is *counted* is map completeness/calibration; the adjacency movement is only the distinct new
dispositions. The claim does not state that split, and its controls (J1–J4) never isolate it:
J2 screens everything (newMapped 0), J3/J4 add rows without screens. The **combination**
(screen-all + 4 renamed surfaces) is untested and passes.

**Q2 — is `newMapped >= 4` reachable by absorbing sibling ground?**
Not by outright ownership absorption, but by the same failure shape: unilateral scope
assertions the sibling never made. Probe D is the demonstration — a `split-declared` row on a
kake-internal line, "named" only by tabi's own publishing quote; a `split` row carries
`ruling_ref = '-'` (no arbitration), so the map records a settled boundary on tabi's say-so.
Probe A is the cheaper version: four renamings of one existing boundary. The prose target
"sibling_quote containing `tabi` or a tabi_quote containing the sibling lane" is satisfied by
the bare possessive in "browser execution stays tabi's" — it certifies a token, not a
declaration. `contested-open` is the only path that is structurally safe here: it lands a
fleet L0 question (an external artifact), so the claim is reported and the integrator
arbitrates.

**Q3 — do contested-open rows with fresh L0 questions count as "reported, not absorbed"?**
Yes. It is the only newMapped route with a real external artifact (`check-adjacency.mjs:79-83`
requires `fleet@<rev>:.ufo/l0-questions.md:<line>` naming a `tabi | round-<N> |` row that names
the sibling). It is also the least constrained route: the counter returns `true` for
`contested-open` unconditionally (`c1-adjacency-sweep.mjs:220`), with no sibling-side naming
and no reality test beyond the quote being on the candidate line. A tabi-filed question about a
non-overlap therefore counts (disclosed: "cannot judge overlap semantics"), which is a wave-2
surveillance target, not an absorption — arbitration still sits with the integrator.

**Q4 — is C1 causally separable from C2?**
Yes. Inputs are disjoint: C1 reads `corpus/adjacency.tsv`, `corpus/adjacency-screen.tsv`,
`scripts/check-adjacency.mjs` (digest-pinned) and sibling `PROVINCE.md` at frozen pins; C2 reads
`scripts/check-bidi-runtime.mjs`, the round-32 entry and the receipt battery (`c2-bidi-forgery-
battery.mjs:56,60`). `c1-adjacency-sweep.mjs` mentions `bidi` only inside its candidate regex
(line 65); `scripts/check-selfassessment.mjs` contains **no** `bidi` reference (`grep -c` = 0,
exit 1), so C2's gate rewrite does not move the no-harm instrument C1 relies on.
`measure.sh` runs both in one clone sequentially, but each verdict is computed from its own
inputs, and C2 rewrites no file C1 reads. Distinct axes (adjacency vs operability) satisfy
`AXES.md:31-32`.

## Impacted axes

- **adjacency** — the claimed movement is not established by the frozen predicate alone
  (probes A, C, D). Credit only distinct, semantically-new boundaries.
- **calibration** — probe A lets 9 false-negative screens + 4 renamed rows read as a pass;
  recording adjacency 8→9 on that basis is a trade (calibration harmed).
- **freshness** — `corpus/adjacency-screen.tsv` is a durable corpus artifact whose only
  checker is a round-33 frozen counter; `check-adjacency.mjs` does not know it exists, so
  nothing re-verifies it after this round.

`depth`, `coverage`, `operability`: unaffected by C1.

## Smallest safe correction (counter and gate are frozen — report-level only)

1. Wave 2 must add the **joint** falsifier I ran: full screen ledger (all
   `not-browser-sense`) + four renamed-surface rows on the already-mapped kake split →
   predicate true. Treat a passing predicate as necessary, not sufficient.
2. The closure credits adjacency only with **distinct new boundaries** versus the baseline
   map (probe C/D rows and renamed restatements get zero credit), and records unaccounted
   47→0 explicitly as **map completeness** (calibration/no-harm), never as adjacency
   improvement.
3. The screen ledger's status is stated where it lives: round-33's counter is its only
   checker; a later round must name that counter or route the ledger through
   `check-adjacency` in a round where the gate may change.
4. If adjacency stays 8 and calibration stays 9, no trade. If the SCORECARD claims 8→9 on
   the frozen predicate alone, reject the row.

## Honesty / housekeeping

- Counter bytes used were the clone's copy at `e6b0a90`: sha256 `da59d157…c6380` = the
  frozen digest; `check-adjacency.mjs` at every probe REV = `4e2c2a64…aac` (the counter
  refuses otherwise, and it did not refuse).
- No lane file, lane index, lane jj state, fleet repo, sibling repo or `shokuknow` was
  written. No builds/linters/formatters run. No subagents. No `agent://all`.
- No browser was started; `pgrep -fa 'chromedriver|chromium'` printed only the host's
  `/usr/bin/earlyoom … --prefer (^|/)(java|node|chromium|python3?)$` line (not mine).
- No tools installed or upgraded; no network fetches.
- Scratch (`$HYAKU_SCRATCH/tabi-r33/CritC1Axis`) deleted after receipts were copied.

## Deliverable paths

- Report: `.ufo/waves/round-33/w1/CritC1Axis.md` (this file)
- Receipts: `.ufo/waves/round-33/w1/CritC1Axis/{c1-baseline.json,c1-probeA.json,
  c1-probeB.json,c1-probeC.json,c1-probeD.json,adjacency-A.tsv,adjacency-C.tsv,
  adjacency-D.tsv,screen.tsv,candidates.txt,probe-commits.txt}`
