# ExecLessonEvidence — round-25 mined mistake (round-24 receipt-pinning defect)

Seat: `L1Tabi25.ExecLessonEvidence` (executor, read-only reporter). Files written: this report, plus
throwaway fixtures under `.ufo/waves/round-25/scratch/ExecLessonEvidence/` (gitignored by
`.gitignore:5: .ufo/waves/*/scratch/`, verified with `git check-ignore -v`). No tracked file edited, no
git writes, no tools installed. Node `v24.21.0` (`node --version`).

Lane state at run time: `git rev-parse HEAD` → `c8ef3084c6363f265b9d23285296ab3547654f57`
(`round-25: freeze claims, controls, census-before, wave-1 spec`), one commit past the stated baseline;
`git merge-base --is-ancestor 9e13666759bcf30665abec84dec13adefc1fa86a HEAD` → ancestor. `git diff --stat
9e13666 HEAD -- scripts/` → empty (no tracked script changed). All `--at` runs below pin
`9e13666759bcf30665abec84dec13adefc1fa86a` explicitly.

## Summary

- **(a) Premise correction (load-bearing).** `corpus/evidence/round-24/c2-measurements.json` does **not**
  pin `4722dba`; its `after.rev` is `2f35bd4c79951e35a3241a600bb47a0d36d48f3d` at every revision from
  `3069ca9` to HEAD. The `4722dba` pin lives in the raw tip receipts `c1-tip.json` and `c2-tip.json`
  (`"rev": "4722dbaf8efc8ba50ca9196234c4c285ab779161"`), written by commit `8bc1d32` ("receipt revs to the
  final tip"). The round-24 report's claim table cites tip `8bc1d325e677f72c8ab12d32722fc2578dcf4ba7` for
  C1, C2 and C3. So there are **three** revisions in play, not two: report cites `8bc1d32`, tip receipts pin
  `4722dba`, measurements receipts pin `2f35bd4`. The spot-check lesson's C2 row also misquotes
  `c2-measurements.json` as "after `4722dba`". That is a second receipt-quoting slip, by the non-author
  verifier.
- **(b) Red-before.** The fixture whose recorded revision (`4722dba`) differs from the cited revision
  (`8bc1d32`) yields **exit 1 `counted_input_changed`** when the receipt is a declared counted input. If you
  put the cited revision into `after.revision` instead, it yields **exit 2 `manifest_schema_invalid`**.
- **(c) Green.** The same fixture with recorded = cited = `8bc1d32` yields **exit 0 `verdict=clean
  claims=1 bound=1`** under `--reproduce`, with both reproduction arms executed.
- **Mined gap (observed).** `check-measurement-binding.mjs` has no "cited revision" field. With the receipt
  dropped from `countedInputs`, the `4722dba`-pinned manifest passes clean (exit 0). The gate catches this
  defect only if the receipt file is declared as a counted input.

## (a) The two fields, quoted with commands

Round-24 report claim table (fleet repo, read-only). File: `/home/vgpnk/Projects/shokunin/.ufo/reports/round-24/tabi.md`,
committed `06e5802b round-24: tabi report` (`git log --oneline -3 -- .ufo/reports/round-24/tabi.md`).

`grep -n '8bc1d32\|4722dba\|2f35bd4' .ufo/reports/round-24/tabi.md` (cwd `/home/vgpnk/Projects/shokunin`):

```
101:| `2f35bd4` | wave-2 falsification evidence (32 reports), counter supersession hardening, exit-3 verdict maps, entry/lesson precision fixes, frontier rows |
103:| `8bc1d32` | receipt revision fields pinned to the final tip `8bc1d32` |
109:| C1 operability | `node scripts/check-gate-registry.mjs --rev <REV> --json` → `nonconformant` | **3** (12 gates; `573c99e`) | **0** (14 gates) | baseline `573c99e4885382db38babc3a6fc90e77afeb42a6`, tip `8bc1d325e677f72c8ab12d32722fc2578dcf4ba7` |
```

`sed -n '104,116p' .ufo/reports/round-24/tabi.md` shows the C2 row's "Measured commit" cell is `same two
revisions`, which means tip `8bc1d32`. The C3 row reads the same way. No line cites `4722dba` (the grep above
has no `4722dba` hit).

The receipts pin a different revision. All commands below ran in the lane root:

```
$ for r in 3069ca9 4722dba 8bc1d32 9e13666 HEAD; do echo "== $r"; git show $r:corpus/evidence/round-24/c2-measurements.json | grep -n '"rev"'; done
== 3069ca9
6:  "rev": "573c99e4885382db38babc3a6fc90e77afeb42a6",
48:  "rev": "2f35bd4c79951e35a3241a600bb47a0d36d48f3d",
(identical lines 6/48 at 4722dba, 8bc1d32, 9e13666, HEAD)

$ git grep -n '4722dba\|8bc1d32' 9e13666 -- .
9e13666:corpus/evidence/round-24/c1-tip.json:3: "rev": "4722dbaf8efc8ba50ca9196234c4c285ab779161",
9e13666:corpus/evidence/round-24/c2-tip.json:3: "rev": "4722dbaf8efc8ba50ca9196234c4c285ab779161",
9e13666:corpus/lessons/round-24-verifier-spotcheck.md:7:`8bc1d325e677f72c8ab12d32722fc2578dcf4ba7` (state: `branch=master local=8bc1d32 remote=8bc1d32
...
9e13666:corpus/lessons/round-24-verifier-spotcheck.md:78:- Receipt-pinned measurement revision `4722dba` differs from the report claim table's cited commit
9e13666:corpus/lessons/round-24-verifier-spotcheck.md:79:  `8bc1d32`; the delta is only the two receipt files, so the verdicts are unaffected — align the

$ grep -n '"rev"' corpus/evidence/round-24/c1-measurements.json
6:  "rev": "573c99e4885382db38babc3a6fc90e77afeb42a6",
28:  "rev": "2f35bd4c79951e35a3241a600bb47a0d36d48f3d",
```

Where the pinning came from:

```
$ git show 8bc1d32 --stat
commit 8bc1d325e677f72c8ab12d32722fc2578dcf4ba7
    round-24: receipt revs to the final tip
 corpus/evidence/round-24/c1-tip.json |  244 ++---
 corpus/evidence/round-24/c2-tip.json | 1858 +++++++++++++++++-----------------
$ git diff 4722dba 8bc1d32 -- corpus/evidence/round-24/   (first hunk of each file)
-  "rev": "2f35bd4c79951e35a3241a600bb47a0d36d48f3d",      (c1-tip.json and c2-tip.json, both)
$ git diff --stat 4722dba 9e13666
 corpus/evidence/round-24/c1-tip.json          |  244 ++--
 corpus/evidence/round-24/c2-tip.json          | 1858 ++++++++++++-------------
 corpus/lessons/round-24-verifier-spotcheck.md |   88 ++
```

Mechanism (observed from the diffs above). Commit `8bc1d32` rewrote the tip receipts' `rev` from `2f35bd4`
to `4722dba`, the parent commit and the last tip the counters could have measured. Then it became the new
tip itself. A receipt cannot pin the commit that contains it, so "pin the final tip" was structurally
unreachable in one commit, and the report then cited the containing commit `8bc1d32`. `c1/c2-measurements.json`
were not rewritten and still say `2f35bd4`. [INFERENCE] The general defect is citing a container commit
while the receipt names its parent. Any "pin receipts to the final tip" commit produces it.

Spot-check misquote, from `git show 9e13666:corpus/lessons/round-24-verifier-spotcheck.md`, §2 C2 row:
"`c2-measurements.json` (... after `4722dba` → `mismatches=0`, `superseded=4`, `couldNotEvaluate=79`, tree
clean at measurement)". The C1 row says the same about `c1-measurements.json` ("after `4722dba` →
`nonconformant=0`"). The committed `after.rev` in both measurement files is `2f35bd4` (commands above). The
values match `c2-tip.json`, which is pinned at `4722dba`, so the verdict is unaffected. The file attribution
is wrong.

## (b) Red-before fixtures and exact output

All runs used cwd `/home/vgpnk/Projects/shokunin/tabi-shokunin`, `S=.ufo/waves/round-25/scratch/ExecLessonEvidence`,
and the command template
`node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-measurement-binding.mjs --check $S/<f>.json --at 9e13666759bcf30665abec84dec13adefc1fa86a --reproduce; echo "exit=$?"`.

### The manifest has no "cited revision" field

The checker's manifest (header lines 33-45; `manifestProblems`) carries `measuredRevision` and
`after.revision` and refuses any manifest where they differ. The only places a revision can be "cited" are
`after.revision` and the `--at` anchor. So I expressed "recorded ≠ cited" two ways.

### Red variant 1: `red-reproducible.json` (primary red, finding-level)

The counter is `.ufo/waves/round-20/measure-c1.mjs`, a tracked file. Its header says "every input is a regular
blob at that commit ... the working tree is never read". It prints one JSON line and exits 0. The blob is
`sha256 19921191fad84ba79414188e1a7b1bc05acdb491b1e6052ed5b70454864f7945` at `4722dba`, at `9e13666` and in
the worktree (`git show <rev>:<path> | sha256sum`; `sha256sum <path>`). Fields:
`measuredRevision = after.revision = 4722dbaf…` (the receipt-recorded revision). `before = {c49929430d99…, 0}`,
`after.count = 12`. `countedInputs` are the round-20 manifest's four inputs plus
`corpus/evidence/round-24/c1-tip.json`, the receipt itself.

The counts reproduce. `node .ufo/waves/round-20/measure-c1.mjs $(git rev-parse <r>)` gives
`c1_lifecycle_decisions` = 0 at `c4992943`, and 12 at each of `4722dba`, `8bc1d32` and `9e13666`, with one
stdout line each time and exit 0.

```
=== red-reproducible
MEASUREMENT_BINDING verdict=failed claims=1 bound=0
finding claim=C1 reason=counted_input_changed detail=paths=corpus/evidence/round-24/c1-tip.json
exit=1
```

The finding is real. `git diff --name-only 4722dba 9e13666 -- <the five inputs + counter path>` →
`corpus/evidence/round-24/c1-tip.json`. Because a finding was recorded, `--reproduce` did not execute the
counter (`evaluateClaim`: `if (reproduce && supported && findings.length === 0)`).

### Red variant 2: `red-cited-mismatch.json` (cited revision placed in `after.revision`)

Fields: `measuredRevision = 4722dba…`, `after.revision = 8bc1d32…`. The counter is
`scripts/check-gate-registry.mjs`. Everything else matches red variant 3.

```
=== red-cited-mismatch
MEASUREMENT_BINDING verdict=could_not_evaluate claims=0 bound=0
finding claim=- reason=manifest_schema_invalid detail=/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-25/scratch/ExecLessonEvidence/red-cited-mismatch.json: claims[0].after.revision != measuredRevision
exit=2
```

This is a refusal (exit 2, gate-level, `claim=-`), not a per-claim finding.

### Red variant 3: `red-receipt-input.json` (round-24's own C1 counter)

Counter `scripts/check-gate-registry.mjs`, sha256 `9f8230da70a340f0e101599763a9847ea7c121b06be4273540222c9b3c823a76`
(identical at `4722dba`, `8bc1d32`, `9e13666` and in the worktree). `measuredRevision = after.revision = 4722dba`.
Inputs are `SKILL.md`, `scripts` and `corpus/evidence/round-24/c1-tip.json`. Before is `{573c99e…, 3}` and
after is 0. Per `node scripts/check-gate-registry.mjs --rev <r> --json`, nonconformant is 3 at `573c99e`
(exit 1) and 0 at `4722dba`, `8bc1d32` and `9e13666` (exit 0).

```
=== red-receipt-input
MEASUREMENT_BINDING verdict=failed claims=1 bound=0
finding claim=C1 reason=counted_input_changed detail=paths=corpus/evidence/round-24/c1-tip.json
exit=1
```

### Blindness probe: `blind-reproducible.json` (mined gap)

This is `red-reproducible.json` with the `corpus/evidence/round-24/` input removed (generated by a `node -e`
filter; `grep -c round-24` → 0). `measuredRevision` stays `4722dbaf…`.

```
MEASUREMENT_BINDING verdict=clean claims=1 bound=1
exit=0
```

The gate certifies a manifest pinned to `4722dba` against `--at 9e13666` as clean, with the counter
reproduced on both arms. The receipt-vs-report revision disagreement is invisible to it unless the receipt
path is a declared counted input. The gate only checks ancestry (`4722dba` is an ancestor of `9e13666`) and
whether inputs changed. It never compares a recorded revision with a cited one.

## (c) Green fixtures

### `green-reproducible.json`: recorded = cited = `8bc1d32`

This is identical to `red-reproducible.json` except `measuredRevision = after.revision = 8bc1d325e677…`.

```
=== green-reproducible
MEASUREMENT_BINDING verdict=clean claims=1 bound=1
exit=0
```

`git diff --name-only 8bc1d32 9e13666 -- <same inputs + counter>` | `wc -l` → 0. `--reproduce` executed both
arms: `c4992943` gave 0 (matching `before.count`) and `9e13666` gave 12 (matching `after.count`). A mismatch
would have printed `count_not_reproduced`.

### `green-matching.json`: same pair on `check-gate-registry.mjs` (not green, reported)

This is `red-receipt-input.json` with `measuredRevision = after.revision = 8bc1d32`.

```
=== green-matching
MEASUREMENT_BINDING verdict=failed claims=1 bound=0
finding claim=C1 reason=counter_failed detail=arm=573c99e4885382db38babc3a6fc90e77afeb42a6 argv=["node","scripts/check-gate-registry.mjs","--rev","{REV}","--json"] exit 1
finding claim=C1 reason=counter_failed detail=arm=9e13666759bcf30665abec84dec13adefc1fa86a argv=["node","scripts/check-gate-registry.mjs","--rev","{REV}","--json"] stdout is not a single JSON line
exit=1
```

`blind-no-receipt-input.json` (the gate-registry counter without the receipt input, `measuredRevision=4722dba`)
gives the same two `counter_failed` lines and exit 1. The revision binding passed in both cases. Failure
happens only at reproduction, because `check-gate-registry.mjs` exits 1 when it finds anything (baseline
nonconformant=3) and pretty-prints multi-line JSON. `reproduceArm` requires exit 0 and a single JSON line.
[INFERENCE] As a result, round-24's own gate counters (`check-gate-registry.mjs`, `check-selfassessment.mjs`,
which share the verdict style) cannot be bound under `--reproduce`. That is why the reproducible green uses
the round-20 counter. `check-selfassessment.mjs` was deliberately not used as a `--reproduce` counter. Its
header says production "executes ONLY lane `scripts/` gates with their declared self-test flag" and reads the
live tree (m3). The tree was not clean: `git status --porcelain` listed sibling seats' untracked
`.ufo/waves/round-25/assimilation/`, `.ufo/waves/round-25/w1/`, `scripts/check-bfcache-receipt.mjs` and
`scripts/check-source-reopen-receipt.mjs`. And the spot-check §5 records that four round-19 self-tests
rewrite tracked receipts when run.

## Fixture identities

`sha256sum $S/*.json`:

```
9af1f1a9ab05b41fbb1b359828195e26d039054251b1c0b49c2fac2bc25bdfc4  blind-no-receipt-input.json
b8c50235ec213c0a35d4cbefd8cbd38a620ca9db4d8a3625b2e7ef69c47c26a5  blind-reproducible.json
cf86e7bd51fae37045440a4cb229f5b6ce6cba216b9f6d178b164ac8c08e3f6e  green-matching.json
dc52b3ff3403645cf5a9a4e820097beee9a45397de4c6048175a8b9e73c2fd57  green-reproducible.json
3319dbe71e00fcf852b01810c5c6c7eebf570ab1f2ace3dbc48a1e8300442a39  red-cited-mismatch.json
4e2b29854f55fbd4e8a5bf4917ecdf1787eb1043d95d3ea81e50c83ac0c71a10  red-receipt-input.json
88ab63714a6ec2ac4a7e2295fdc4462883ffd564123b2529a464904c44063919  red-reproducible.json
```

For the lesson, the canonical red/green pair is `red-reproducible.json` (exit 1, `counted_input_changed`) and
`green-reproducible.json` (exit 0). The two differ only in `measuredRevision`/`after.revision` (`4722dba` vs
`8bc1d32`).

## Risks and bounds

- Observation: the red finding depends on declaring the receipt as a counted input. Without it the gate
  passes (blindness probe). The lesson should not claim the binding gate detects receipt/report revision
  drift in general.
- Observation: the C1 and C2 verdicts are unaffected by the drift. The counter output is identical at
  `4722dba`, `8bc1d32` and `9e13666` for both counters run here.
- [INFERENCE] A repair options set (not implemented, out of scope): (1) cite the receipt's pinned revision
  in the report, or (2) record "measured at parent P, receipt committed in P+1" explicitly. Then (3) a
  checker predicate comparing the report-cited tip to `receipt.rev`, allowing the "child of the cited
  revision, only receipt paths changed" relation, would make the gap mechanical.
- Unknown: whether other rounds' "pin to final tip" commits have the same off-by-one. No sweep was run
  beyond round 24.
- Fixtures are gitignored throwaways. No process was left running: all runs were synchronous CLI
  invocations, with no servers or browsers.
