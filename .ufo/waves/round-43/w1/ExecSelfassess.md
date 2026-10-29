# ExecSelfassess — self-assessment gate (tabi round 43, wave 1)

Seat: `ExecSelfassess`. Lane: tabi (`/home/vgpnk/Projects/shokunin/tabi-shokunin`).
Scope: run the lane's own calibration gate `scripts/check-selfassessment.mjs` read-only, establish its
verdict at the measured revisions, and route any mismatch as a finding.

The gate is read-only for the lane (it reads committed git blobs plus the live working tree, and
executes only lane `scripts/` gates with their declared self-test flag; every other command string
is `could-not-evaluate`). No lane file was modified by this seat. All scratch work was done under
`/fast/scratch/hyaku/tabi-r43/ExecSelfassess/` (now deleted) and in disposable `git clone`s of the
lane (read-only clones under the scratch root). No commits, no pushes, no git/jj mutation in the
lane, no spawned agents.

## Tooling

No install was needed. Toolchain already present and used as-is:

| tool | version | channel | reason |
|---|---|---|---|
| node | v24.21.0 | pre-installed (fnm-managed) | runs the lane gate; matches `producerPins.nodeSha256` context in `.ufo/waves/round-43/claims.json` |
| git | 2.56.0 | pre-installed | the gate's only oracle input is committed git blobs; clones used for clean-tree measurement |

No pacman transaction was run (host-wide pacman guard is PAUSED; no install was planned).
`/home/vgpnk/.omp/agent/RULES.md` was read first; the permitted channels (`uv tool`, official
release binaries into `~/.local/bin`) were not needed.

Gate bytes are unchanged: working-tree `scripts/check-selfassessment.mjs` sha256
`77b5c8ed503bd9bc93e8ef634a10627613672eaa39bca84cf7339d37b6d4c6a9`, byte-identical to the blob at
the claims freeze `7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc` (git blob id at HEAD
`201e4cbc2a8554cd616a0b9074062df16a372644`). The gate was **not** modified, copied-and-mutated, or
proposed for amendment.

## What the gate is, and how it was invoked

The gate's header states it needs `--rev <REV>` (a revision whose `SCORECARD.md` exists); `--repo`
defaults to the lane. It has no `--root` flag. `--selftest` runs its own 41-case fixture battery.
Verdict codes: `0` clean, `1` failed (>=1 counted mismatch), `2` could-not-evaluate.

The task brief said "expect mismatches 0". The lane's own prior convention (SCORECARD.md:1650,
round 32) is that C2 calibration is measured as `node scripts/check-selfassessment.mjs --rev <REV>
--json` against a **clean clone** of the measured revision, not against the live working tree. That
distinction turned out to be the whole story.

## Measurements

### 1. Gate self-test (instrument is sound)

```
$ node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-selfassessment.mjs --selftest
SELFASSESSMENT_SELFTEST verdict=clean cases=41 passed=41
exit=0
```
Full per-case output: `gate-selftest.txt`.

### 2. In-lane run at HEAD — mismatches 1, and the finding is NOT about the round-43 claims

```
$ node .../scripts/check-selfassessment.mjs --rev HEAD --json
exit=1
{"rev":"ba433c94b14a0e0d5ecf2eba1be0a8ee3064491c","mismatches":1,"clean":false,
 "couldNotEvaluate":117,"superseded":48,
 "counted":[{"class":"m3-unlanded-paths","doc":"SCORECARD.md","line":null,
             "claimed":"landed","observed":<N>}]}
```
Human-readable line:
```
FINDING class=m3-unlanded-paths doc=SCORECARD.md line=- claimed=landed observed=548
SELFASSESSMENT verdict=failed rev=ba433c94b14a0e0d5ecf2eba1be0a8ee3064491c mismatches=1 could_not_evaluate=117 superseded=48
```

The single counted mismatch is `m3-unlanded-paths`. The gate's `m3` class reads the **live working
tree** (`git status --porcelain --untracked-files=all` on the lane) and compares its path count
against the newest `## Round N — executed disposition` block in SCORECARD.md, which at HEAD is
**Round 42** (`SCORECARD.md:2244`). The `observed` count is therefore the number of dirty paths in
the lane right now, and it moved on every re-run because sibling seats were writing into
`.ufo/waves/round-43/w1/` while this seat measured:

| run | rev | `observed` | lane porcelain count immediately after |
|---|---|---|---|
| 1 | HEAD | 40 | 45 |
| 2 | HEAD | 293 | 293 |
| 3 | HEAD | 410 | 410 |
| 4 | HEAD | 498 | 498 |
| 5 | HEAD | 548 | 548 |
| 6 | HEAD | 563 | 563 |

The count tracked the sibling seats' untracked output exactly, one-for-one. `git status` in the
lane showed the dirty set is entirely round-43 wave artefacts: `.ufo/waves/round-43/w1/<seat>/**`
untracked (the wave's own report directories), plus one tracked modification
`M corpus/README.md` (a round-43 knowledge-row addition) and two untracked lane-root files
`corpus/lessons/round-43.md`, `corpus/knowledge/receipt-authenticity-signing-round-43.md`.
**This is the round-43 wave writing its own evidence — it is not a stale self-assessment claim, and
it is not a defect of the round-43 claims.** The `m3` class is by design a "the newest executed
disposition asserts landed work; a dirty tree contradicts that" check, and it is doing exactly what
it says.

### 3. Clean-clone runs — mismatches 0 (the lane's own measurement convention)

Read-only clones of the lane (`git clone --no-hardlinks`, then `git checkout <rev>`; porcelain
count 0 in each clone) reproduce the lane's stated convention:

| measurement | rev | result |
|---|---|---|
| clean clone of HEAD | `ba433c94b14a0e0d5ecf2eba1be0a8ee3064491c` | `mismatches=0`, `clean=true`, `couldNotEvaluate=117`, `superseded=48`, exit 0 |
| clean clone of the claim baseline | `ab592825cd195599822ca227f7768914df208201` | `mismatches=0`, `clean=true`, exit 0 |
| `git archive` snapshot of the freeze | `7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc` | `mismatches=0`, `clean=true`, exit 0 |

Receipts: `gate-cleanclone-HEAD.json`, `gate-cleanclone-baseline-ab592825.json`,
`gate-cleansnapshot-freeze-7ca6f018.json`.

Full finding-set diff, in-lane vs clean clone at the **same** rev (identical rev, identical blobs):

```
live-only:   m3-unlanded-paths|SCORECARD.md|||landed|40|
clone-only:  (none)
```
i.e. the *only* difference between "mismatches 1" and "mismatches 0" at the identical revision is
the `m3` working-tree count. Every other class — 66 SCORECARD / 26 LOG / 58 SKILL /
7 corpus-README `m1` tallies, 78 `m2` receipt-exit records, 13 `m4` nudge states — is
byte-identical between the two runs.

`m2` note: the round-43 committed receipts
(`corpus/evidence/round43/playwright-egress/receipt.json`, `receipt.witness.json`) carry **no**
`command`/`exit` pair, so the `m2` class produces **zero** findings for them (verified: 0
`"command"` and 0 `"exit"` occurrences). That is a coverage limit of the closed re-run grammar, not
a mismatch; the round-43 C1 evidence is not checked by `m2` in either direction.

### 4. Round-43 SCORECARD section: read by the gate, zero findings

`SCORECARD.md:2297` `## Round 43 — declared claims (frozen before data)` is inside the gate's
`m1` window. Filtering every finding to `doc=SCORECARD.md && line>=2297` yields **0** findings —
no stale tally, no ambiguous association, no nudge-state claim is currently asserted there. The
`m1`/`m4` classes therefore have nothing to object to in the round-43 section as it stands.

`SHONEN.md` is **not** read by the gate at all (the script reads only `SCORECARD.md`, `LOG.md`,
`SKILL.md`, `corpus/README.md`; grep for `SHONEN` in the gate source returns nothing). The seat
brief's note about "SCORECARD/SHONEN round-43 sections being written this round" therefore applies
to SCORECARD only; nothing pending in SHONEN can reach this gate. `SHONEN.md` is 12 lines with no
round-43 entry.

## Probes (scratch clones only; the lane was never touched)

Each probe was a fresh `git clone --no-hardlinks` of the lane into the scratch root, checked out at
`ba433c94`, mutated **in the clone only**, and the gate was run with `--repo <clone>`. The lane's
`scripts/check-selfassessment.mjs` was not modified.

**Probe A — `m4` does police a round-43 nudge statement when the section states the axes.**
Appending to the clone's SCORECARD.md a `## Round 43 — executed disposition` block with
`Axes at round start: depth 9 coverage 9 operability 9 freshness 9 calibration 9 adjacency 8.
Saturation 8 / window 3.` plus a **stale** nudge claim:
```
mismatches=1, counted=[{"class":"m4-nudge-state","doc":"SCORECARD.md","line":2325,
                         "claimed":"inactive","observed":"active"}]
```
Receipt `probe-m4-r43-axes-round-start-form-counted.json`. The honest variant (claiming `active`)
gives `mismatches=0` — receipt `probe-m4-r43-honest-nudge-clean.json`.

**Probe B — the round-43 axis shape as the lane actually writes it is `could-not-evaluate`, not
counted.** Using the lane's own current round-43 wording (`Axes at start: adjacency 8 (lowest),
others 9; saturation 8 / window 3; …`), the same stale `inactive` claim yields:
```
mismatches=0, counted=[]
m4 round=43 claimed="inactive" observed=null
  couldNotEvaluate="no `Axes at round start:` with all six axes in the round group"
```
Receipt `probe-m4-r43-axes-shape-could-not-evaluate.json`. The `m4` axis parser requires the exact
literal `Axes at round start:` followed by all six axis names; the lane's round-43 prose says
`Axes at start:` and names only adjacency. A stale round-43 nudge claim written in the lane's
current style would be *silent* (unverifiable) rather than counted. **This is a finding to route,
not a claim defect** — the gate bytes are frozen and no amendment is proposed.

**Probe C — `m1` does police a stale tally in a round-43 section.** Appending
`- \`scripts/check-selfassessment.mjs\` \`--selftest\` (7/7): stale figure.` to a round-43 block:
```
mismatches=1, counted=[{"class":"m1-selftest-tally","doc":"SCORECARD.md","line":2325,
                         "script":"scripts/check-selfassessment.mjs","claimed":7,"observed":41}]
```
Receipt `probe-m1-r43-stale-tally-counted.json`. The round-43 section is inside the `m1` window and
a wrong figure there will be caught.

**Probe D — `m3` binds to the newest executed-disposition round.** Appending a
`## Round 43 — executed disposition` block to the clone and leaving one stray untracked file:
```
mismatches=1, counted=[{"class":"m3-unlanded-paths","doc":"SCORECARD.md","round":43,
                         "claimed":"landed","observed":1}]
```
Receipt `probe-m3-r43-disposition-round-binding.json`. So once round 43 writes its executed
disposition, `m3` will bind to round 43 — and until the wave's own seat output is committed, the
live-tree count will keep `m3` counted. Practical consequence for the L1's closure: the closing
measurement must be taken against a clean clone (as round 32 did), or the wave's seat output must
be committed first.

## Findings routed (no amendment proposed; counter/claim/checker bytes are frozen)

**F1 — `m4` round-43 axis-input shape: a stale round-43 nudge claim in the lane's own prose style
is `could-not-evaluate`, never a counted mismatch.** The `m4` class requires the literal
`Axes at round start:` plus all six axis names in the round group. The lane's round-43 section
(`SCORECARD.md:2297`, currently `Axes at start: adjacency 8 (lowest), others 9`) does not match
that shape, and neither does the phrase `the stagnation nudge waives the lowest-axis obligation`
(it contains no `active`/`inactive` token adjacent to `nudge`, so no statement is extracted at
all). Probe B demonstrates the consequence: a round-43 executed disposition that says
`The stagnation nudge is inactive for round 43` in the lane's current style produces **zero**
counted mismatches, while the same claim in the `Axes at round start:` shape produces one. This is
a calibration-input gap in the round-43 section as written, and it is the one item here that could
let a wrong round-43 self-assessment stand unchallenged. Route to the L1 as a finding: when the
round-43 executed disposition is written, it needs the `Axes at round start: <six axes>` +
`Saturation S / window W` form (as SCORECARD.md:2117 and the round-29/30 blocks use) for `m4` to
be able to check it. The gate's own bytes are unchanged and no patch is proposed.

**F2 — `m2` does not cover the round-43 C1 receipts.** `corpus/evidence/round43/playwright-egress/receipt.json`
and `receipt.witness.json` carry no `command`/`exit` pair (0 occurrences of each key), so the `m2`
class — whose grammar only re-runs `git cat-file -e` and `git show` — has nothing to re-run for
them and reports zero findings. Round-43 C1 evidence is therefore outside `m2`'s reach in both
directions; it is neither confirmed nor contradicted by this gate. Route as a scope note for the
closure.

**F3 — in-lane `mismatches=1` is the wave's own untracked output, not a lane claim.** Verbatim
finding text from the in-lane run:
```
FINDING class=m3-unlanded-paths doc=SCORECARD.md line=- claimed=landed observed=548
SELFASSESSMENT verdict=failed rev=ba433c94b14a0e0d5ecf2eba1be0a8ee3064491c mismatches=1 could_not_evaluate=117 superseded=48
```
The `observed` number equals the lane's live `git status --porcelain --untracked-files=all` path
count and changed on every re-run (40 → 293 → 410 → 498 → 548 → 563) as sibling seats wrote. The
same revision measured in a clean clone gives `mismatches=0`, exit 0. Per the seat brief
("if the gate reads them and reports a mismatch … report the finding text verbatim rather than
judging"), this text is recorded verbatim above and is not adjudicated here.

## Claim impact

- **C1 (coverage capability)** — unaffected. The gate does not read
  `scripts/measure-c1-round43.mjs` or the round-43 counter; its input set is SCORECARD/LOG/SKILL/
  corpus-README plus `corpus/evidence/**`. The round-43 declared-claims section yields zero
  findings, and the committed round-43 C1 receipts yield zero `m2` findings.
- **C2 (calibration)** — unaffected by the gate's verdict at HEAD/freeze/baseline in a clean
  clone (`mismatches=0` at all three). F1 is a *forward-looking* calibration gap that bites when
  the round-43 executed disposition is written in the lane's current prose style; it does not
  change any already-measured number.
- **The round-43 claims are frozen at `7ca6f018`; no byte of any counter, claim, or checker was
  modified, copied-and-mutated in place, or proposed for amendment by this seat.**

## Limitations

1. The `m3` class is working-tree-based, so the in-lane verdict is not reproducible while the wave
   writes. Only the clean-clone numbers (mismatches 0) are stable.
2. `couldNotEvaluate=117` at HEAD is stable across all runs and is dominated by design limits of
   the gate, not lane defects: 76 `m2` records whose command string is outside the closed re-run
   grammar, 36 `m1` tallies with ambiguous script association, 4 `m1` tallies naming scripts
   outside the runnable gate set (`scripts/selftest-measurement-binding.mjs`,
   `scripts/measure-c1-round41.mjs`, `scripts/freshness-witness.mjs`,
   `scripts/webmcp-invoke-round18.mjs`), and 1 `m4` group (round 28) missing the axis inputs.
   These are `could-not-evaluate`, never counted as mismatches.
3. The `git archive` snapshot of the freeze differs from a full-history clone in one respect:
   `scripts/check-round-contract.mjs --self-test` needs the pinned prior gate blob
   `43db9f4bba56a27114ed116c85f27b80227e74bd`, which is absent from a single-commit snapshot, so
   that gate printed no tally there (`could-not-evaluate`) while the full clone measured 38 cases.
   Both snapshot and clone still give `mismatches=0`; only the could-not-evaluate count differs
   (123 vs 117). The full-history clone is the closer analogue of the lane.
4. No `SHONEN.md` coverage exists in this gate, so the brief's SHONEN caveat is vacuous here.
5. Probes were run on clones of the lane at `ba433c94`, i.e. they characterise the gate's current
   behaviour, not any future revision.

## Evidence paths

All under `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/w1/ExecSelfassess/`:

| file | what it shows |
|---|---|
| `gate-selftest.txt` | `--selftest` → `verdict=clean cases=41 passed=41`, exit 0 |
| `gate-inlane-HEAD.json` | in-lane run at HEAD: mismatches 1, counted = m3-unlanded-paths |
| `gate-inlane-HEAD.stdout.txt` | the same run's human-readable FINDING + summary lines |
| `gate-cleanclone-HEAD.json` | clean clone at `ba433c94`: mismatches 0, exit 0 |
| `gate-cleanclone-baseline-ab592825.json` | clean clone at baseline `ab592825`: mismatches 0, exit 0 |
| `gate-cleansnapshot-freeze-7ca6f018.json` | `git archive` snapshot of freeze `7ca6f018`: mismatches 0, exit 0 |
| `gate-inlane-freeze-7ca6f018.stdout.txt` | in-lane run at the freeze rev (m3 only) |
| `gate-inlane-baseline-ab592825.stdout.txt` | in-lane run at the baseline rev (m3 only) |
| `probe-m4-r43-axes-round-start-form-counted.json` | Probe A — stale r43 nudge in `Axes at round start:` form IS counted |
| `probe-m4-r43-honest-nudge-clean.json` | Probe A — honest r43 nudge in the same form is clean |
| `probe-m4-r43-axes-shape-could-not-evaluate.json` | Probe B — stale r43 nudge in the lane's own `Axes at start:` style is NOT counted (F1) |
| `probe-m1-r43-stale-tally-counted.json` | Probe C — a stale tally in a round-43 SCORECARD block IS counted |
| `probe-m3-r43-disposition-round-binding.json` | Probe D — m3 binds to round 43 once its disposition block exists |

Scratch root `/fast/scratch/hyaku/tabi-r43/ExecSelfassess/` was deleted after the receipts above
were copied into the seat dir.

VERDICT finding the gate is clean (mismatches 0) at HEAD, the claim baseline and the claims freeze when measured against committed bytes in a clean clone, but the in-lane run is mismatches 1 (m3-unlanded-paths, the wave's own untracked output) and a stale round-43 nudge claim written in the lane's current `Axes at start:` style is could-not-evaluate rather than counted (F1).
