# Wave-2 falsification — SCORECARD.md §"Round 24 — corrections to earlier figures" (:1186-1206)

Reviewer: L1Tabi24.RevCorrectionsBlock (read-only). Reviewed object: committed bytes at lane tip
`ad125e85c235e1c4ec6a08e398bd64da01f68a08`. All commands run from the lane root with
`TMPDIR=/home/vgpnk/tmp-tabi24` (host `/tmp` 100% full).

Mid-run note: between my first and last counter runs the working tree gained live edits
(`M scripts/check-selfassessment.mjs`, `M .ufo/waves/round-24/claims.json`, 8 others,
observed via `git status --porcelain` — the claims.json "revisions" block appeared between two
reads). I therefore re-ran the counter under both the committed supersession rule and the
hardened working-copy rule; both verdicts are cited where they differ. SCORECARD.md itself is
unmodified, so the block under review is the committed block.

## F1 (high) — "tip counts none" is contradicted by the lane's own committed receipts

The corrections block is the advertised mechanism of C2's after-value, and the executed
disposition row (SCORECARD.md :1233) says `5 → 0 mismatches … tip counts none, with five earlier
statements superseded by the round's correction block`.

- `corpus/evidence/round-24/c2-tip.json` (committed) records `"rev":
  "b973fde3c89fb2d3476ad0b6002791b75ec87a27"` — not the declared tip `ad125e8` — and
  `"mismatches": 1`, `"clean": false`, counted = `m3-unlanded-paths` observed=4.
  Verified by `node -e '…mismatches…'` on the committed file.
- `corpus/evidence/round-24/c2-measurements.json` after-block records the same: `rev:
  b973fde…`, `mismatches: 1` (`m3`, observed=4), `superseded: 5`. So the ledger honestly reports
  5 → 1, never 5 → 0.
- `git ls-tree --name-only ad125e8 corpus/evidence/round-24/` shows six files; no receipt anywhere
  records a `mismatches: 0` run.
- My re-run at the declared tip: `node scripts/check-selfassessment.mjs --rev ad125e8 --json` →
  `mismatches=1` (`m3-unlanded-paths`, observed=5), `clean=false`, exit 1. The five paths are the
  wave-2 dispatch artifacts (`.ufo/waves/round-24/gen-w2.mjs`, `w2-dispatch.err/json`, `w2-spec.json`,
  `w2/`), which `.gitignore`'s new `.ufo/waves/*/scratch/` rule does not cover.
- The in-flight claims.json revision (uncommitted, appeared mid-review) already concedes the shape:
  `"after 0, measured at the final clean tree … mid-wave runs read 1 while wave artifacts are
  uncommitted; the final receipt records the clean-tree run"`. At the committed tip, that final
  receipt does not exist; the committed prose asserts it.

Observation vs inference: the receipts prove the counter never returned 0 on any committed run;
the attribution of the residual 1 to m3/live-tree is direct in the receipts themselves. Whether a
later clean-tree run exists is unknown by definition (uncommitted).

Consequence for the block: the "mechanical supersession" it performs is real (F-verified below),
but the claim that closes the round (`tip counts none`) is not supported by any committed byte, and
the m3 class it leaves firing is live-tree-dependent — m3 `observed` differs by when you run it
(baseline receipt: 4; my baseline run: 5; tip receipt: 4; my tip run: 5), so the metric is not
reproducible from `<REV>` alone.

## F2 (medium) — The "append-only" block rewrote its own filed bytes, and the rewrite was to evade digit-reading

The block header says "(append-only, after the calibration gate ran)". Commit `b973fde` (visible in
`git show b973fde -- SCORECARD.md`, diff +3/−3) replaced three lines introduced one commit earlier
in `f6f7f45`. The old lines carried digit forms the counter parses — `"25 cases"`, `"12-case
in-memory matrix"`, `"12/12"`, `"25 isolated CLI cases"`, `"eight isolated CLI cases"` — and the new
lines say `twenty-five`, `twelve-case`, `twelve-of-twelve`, `eight` in words.

Proof this mattered mechanically: `node scripts/check-selfassessment.mjs --rev f6f7f45 --json` →
`mismatches=5`, including `SCORECARD.md:1193 claimed=12 obs=13` — the corrections block itself
created a fresh stale mention (pattern `(\d+)-case` read the quoted historical figure as a live
claim on a line that names `round-evidence-audit.mjs`), and because no later line stated 13
correctly at that rev, :1138/:1139/:1151 stayed counted. `b973fde` then reports `mismatches=1`
(m3 only) with superseded=5.

Two defects:
- (a) Literal: the block's bytes were rewritten after filing; "append-only" is false for its own
  lines. Prior-round bytes are clean — `git diff 573c99e ad125e8 -- SCORECARD.md` shows zero
  deletions — so the violation is confined to the block itself.
- (b) Deeper: the "supersession is mechanical, not prose" claim is achieved by a prose convention —
  write the historical figure in words so the counter cannot see it. Under the committed rule
  `f.superseded = some(g.line > f.line && g.observed === g.claimed)` any later line naming the same
  script and matching the oracle clears earlier mentions; under the hardened live rule
  (diff in worktree, `git diff scripts/check-selfassessment.mjs`) a correction marker + `:N` line
  cite is additionally required — and the block's lines do cite (`:410`, `:1138`, …) and say
  `supersedes`, so it survives that rule too. What it does not survive is a plain semantic check:
  the counter never understands "superseded"; it only cannot read spelled-out numerals.

## F3 (medium) — check-adjacency's "measured" tally comes from a self-test that fails on this host, and the counter does not care

`node scripts/check-adjacency.mjs --self-test` → `ADJACENCY_SELFTEST verdict=failed cases=57
reasons=18 could_not_evaluate=5`, exit 1; `case git-failed verdict=fail detail=reasons=[map_unreadable]
expected=[git_failed]` (adj.out in my scratch dir). Root cause verified: the fixture's `outside`
dir lands under `$TMPDIR`; `/home/vgpnk` is itself a git repository (`git rev-parse
--show-toplevel` in `/home/vgpnk/tmp-tabi24` → `/home/vgpnk`), so `--repo <tmp>/outside` resolves
into the enclosing repo and yields `map_unreadable` instead of `git_failed`. With
`TMPDIR=/dev/shm/tabi-adj-test` (no git ancestry): `verdict=clean cases=57 reasons=18
could_not_evaluate=6`, exit 0.

Implications for the block:
- `check-selfassessment.mjs` `gateTally()` records `{status:"measured", tally, exit}` but never
  reads `exit` or the verdict — at `ad125e8` it counted line :1195 `cases=57` as a match using a
  failing self-test as oracle (finding shows `claimed=57 obs=57`). So "the figure the gate
  measured this round" is true of the numeral and false of the verdict; a gate whose self-test is
  red still satisfies m1. The block presents the figure with no disclosure of the red verdict.
- `c2-measurements.json` §environment says ENOSPC "made three gate self-tests could-not-evaluate,
  reported, never counted as matches" — yet adjacency was evaluated (to a failing verdict the
  oracle ignored). The sentence is at best incomplete about what the oracle actually did.
- The script is byte-identical to baseline (`git diff --stat 573c99e ad125e8 --
  scripts/check-adjacency.mjs` empty): the failure is environmental, not introduced this round.
  The block's defect is citing it as measured truth on a host where it cannot pass.

## F4 (low) — One block line is entirely invisible to the counter it cites

`:1199` `check-aria-metadata.mjs … cli_cases=36, helpers=4` yields zero claims under
TALLY_PATTERNS: `\bcases\s*=` fails on `cli_cases` (`_` is a word char), and none of the
N/M, N-case, N-cases forms match. Verified against the gate itself: `cli_cases=36 helpers=4`,
exit 0 — the figures are correct, but "the supersession is mechanical" is vacuous for this line;
no pattern ever reads it. Same invisibility applies to the reproduce-paragraph's colon-form
fields (`baselineFindings: 7`, `baselineClasses: 6`, `cases: 6`, `passed: 6` — `cases\s*=` does not
match `cases:`). Today harmless; the trap is that the block reads as if the counter verifies it.

## F5 (low) — `baselineClasses: 6` misquotes a field type

The reproduce paragraph reports the re-run fields as `baselineFindings: 7`, `baselineClasses: 6`.
Actual output of `node scripts/round-evidence-audit.mjs --selftest --rev
03c1b4d9a9ea7719ff4a13a63989fa9be36229c3 --round 22 --round-cap 128` (exit 0, run by me):
`baselineFindings: 7`, `baselineClasses` = an array of six class names, `cases: 6`, `passed: 6`,
`clean: true`. The substance — it reproduces — is verified; the cited field name+scalar is wrong
(the field is a list; `6` is its length). Minor, but this is a corrections block: its own figures
should be byte-accurate.

## F6 (low) — Scope gap the block inherits: the counter reads SCORECARD.md only

`evaluate()` calls `readBlob(repo, rev, "SCORECARD.md")` and nothing else. Claim C2's frozen text
declares scope "SCORECARD.md blocks … and SHONEN.md" — SHONEN.md is never opened. Consequence for
this block: the SKILL.md supersessions it asserts ("the round-24 registry restatement replaces
it") are prose-only — no instrument reads SKILL.md. Verified the restatement exists and asserts
the supersession in words (SKILL.md :2469, :2470), and the stale rows remain by append-only
convention (:1559 "eight isolated CLI cases", :1614 "25 isolated CLI cases"). Latent hazard:
SKILL.md :2470 embeds the digit string `"25 isolated CLI cases"` inside its supersession note —
if m1 ever scans SKILL.md, that line self-poisons exactly like the pre-`b973fde` block did.

## What I verified as true (negative space of the attack)

- Supersession works. At `ad125e8` under the committed rule: `superseded=5` — :410 (25 vs 26),
  :1138/:1139/:1151 (12 vs 13) all cleared by the block's correct later statements, plus :197
  (freshness, matching anyway). Under the hardened worktree rule: `superseded=4` — same four real
  mismatches cleared; :197 simply isn't flagged as needing supersession. Command: `node
  scripts/check-selfassessment.mjs --rev ad125e8 --json` (both script versions).
- Every numeric in the block matches the gate it names, re-run by me this session: check-sources
  `cases=26`; round-evidence-audit `cases:13, passed:13`; check-freshness `cases=12`;
  check-adjacency `cases=57, reasons=18` (but see F3); check-measurement-binding `cases=76,
  reasons=13`; check-round-contract `cases=38`; check-user-round-contract `cases=45`;
  check-aria-metadata `cli_cases=36, helpers=4`.
- All cited line numbers resolve: :410 is `cases=25`; :1138 `:1139` the 12/12 capability row;
  :1151 the executed-disposition `--selftest 12/12`; :1183-1184 the evidence-keyed command line.
- `43e9bb5` exists and is the commit that grew the auditor matrix (`cases.length === CLASSES.length
  * 2` → `* 2 + 1`, i.e. the thirteenth case). `git show 43e9bb5 --
  scripts/round-evidence-audit.mjs`.
- The "not corrected, because it reproduces" claim is reproducible byte-for-byte: exit 0,
  baselineFindings 7, six classes, 6/6 repairs, clean. The prototype defect is recorded at
  `corpus/lessons/round-24.md:91` with the same wording the block cites.
- No prior-round byte rewritten: `git diff 573c99e ad125e8 -- SCORECARD.md | grep -c '^-[^-]'` = 0.
- The "Not corrected" paragraph contributes zero counter claims — `7 findings / 6 classes` and
  `6/6` are outside all TALLY_PATTERNS, so it cannot be misread. Verified: no m1 finding at
  :1200-1206 in the tip run.
- At `f6f7f45` the original wording did produce a new counted mismatch (claimed=12 at :1193) —
  so the `b973fde` wording change was load-bearing, not cosmetic (that is precisely F2's point).

## Residual risk / verification gaps

- The four `ambiguous script association` could-not-evaluate findings at :1232/:1233/:1243/:1249
  (the disposition table's `cases=22`/`cases=13` and the capability rows' `--selftest (cases=22)`
  / `(cases=13)`) mean the round's own capability tallies are not mechanically checked — the
  sections name several scripts and the lines name none, so per-line association fails. If any of
  those figures were wrong, the counter could not say so.
- m3's live-tree dependence means the frozen counting command `--rev <REV> --json` is not a pure
  function of `<REV>`; the "after" number is only meaningful when the tree is clean, and the
  committed tip receipt's 1 is the honest current value.
- Unresolved unknown: which gate self-tests the ENOSPC window actually poisoned at measurement
  time (the ledger names a count of three but not the gates); and whether a post-wave clean-tree
  receipt will exist — at the reviewed tip it does not.
- Scope disclaimer: I did not audit check-gate-registry.mjs's eight-field logic or SKILL.md
  registry rows beyond the supersession assertions above.
