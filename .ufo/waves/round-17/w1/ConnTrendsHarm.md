VERDICT: ISSUES

# ConnTrendsHarm — r17 trend verdicts and the no-harm pre-map

Measured 2026-10-20 ~12:50-13:05 -0300 at lane tip `5859243` (detached HEAD == `refs/heads/master`;
only untracked `.ufo/waves/round-17/`). Peers began editing `scripts/` mid-probe; every "before"
digest below was taken before those edits and reproduces the r16 pins, which the edited bytes cannot
produce. All experiments ran in `/tmp/tabi-r17-*` clones; no `jj`/git write in LANE or fleet.

## 1. What constitutes the r17 harm check — nine rows

The inherited set is the six commands in `.ufo/waves/round-16/harm-baseline.json:13,36,59,83,106,130`
(method and verdict rule: `.ufo/waves/round-16/w2/AttackHarmGates.md:10,20-27`). Round 17 changes the
bytes of three of those gates plus the binding gate, so a six-row inherited comparison is no longer
sufficient: rows 1-3 answer "did the C1 edit preserve behavior"; rows 7-9 answer "did the binding
instrument survive its own edit".

| # | Command (cwd LANE) | Before at 5859243 | Invariant before→after |
|---|---|---|---|
| 1 | `node scripts/check-round-contract.mjs` | exit 0, out `25e66498…` | byte-identical stdout/stderr/exit |
| 2 | `node scripts/check-user-round-contract.mjs` | exit 1, err `47e9ffdc…`, `finding=round_count detail=Found 6 user rounds, expected 10` | byte-identical stderr; same finding/detail (already red: `harm-baseline.json:237-246`) |
| 3 | `node scripts/check-freshness.mjs --worktree` | exit 0, out `6f99a374…` | byte-identical |
| 4 | `node scripts/check-sources.mjs` | exit 0, out `9fcbfa79…` = `rows=40 tiers=A:31,B:4,C:5 status=queued:2,mined:33,rejected:5 findings=0` | `verdict=clean findings=0`; count delta allowed only if each delta is explained by the `corpus/SOURCES.md` blob diff (r16 precedent `AttackHarmGates.md:44-58`; not digest-pinned, `harm-baseline.json:219`) |
| 5 | `node scripts/check-sources.mjs --self-test` | exit 0, out `8a1efa8b…`, `cases=26` | byte-identical |
| 6 | `node scripts/check-aria-metadata.mjs --check corpus/evidence/round-14/aria-metadata/corrected.json` | exit 0, out `afdc9fad…` | identical only after normalizing the repo root — stdout embeds absolute input paths (measured) |
| 7 | `node scripts/check-measurement-binding.mjs --check corpus/evidence/round-16/measurement-binding.json --at 3254740…` | exit 0, out `89ac1fca…` = `MEASUREMENT_BINDING verdict=clean claims=2 bound=2` | byte-identical; **never** evaluated at the r17 tip (§2) |
| 8 | `node scripts/selftest-measurement-binding.mjs` | exit 0, out `abff6ff1…`, `cases=59 reasons=13` | `verdict=clean`, cases ≥59, reasons ≥13 |
| 9 | `node scripts/check-measurement-binding.mjs --check corpus/evidence/round-17/measurement-binding.json --at <delivered> --reproduce` | none (new) | exit 0 `claims=3 bound=3` |

Liveness floors must not shrink (measured at 5859243): round selftest 32 cases, user 42, freshness 12,
sources 26, binding 59; aria selftest ok.

Blob-level identity that must hold at the delivered revision: `scripts/check-freshness.mjs`
`93d19637…`; `.ufo/rounds/**` and `corpus/evidence/fleet-round-1-freshness/**`; census
`b9c8dc35…`; r16 evidence `measurements.json 48a2f78e…`, `measurement-binding.json 72c77ed4…`,
`webmcp/receipt.json 93e80e42…`; r16 harness `scripts/webmcp-loopback-round16.mjs 0adbbe0e…`
(PLAN.md:42-54); append-only prefix property for the six files
(`scripts/check-round-contract.mjs@5859243:242-245`).

## 2. What must NOT be asserted (each measured false)

- **"r16 binding is clean at the r17 tip."** Probe: commit one appended comment to
  `scripts/check-measurement-binding.mjs` in a sandbox, then `--check` the r16 manifest →
  exit 1, `finding claim=C1 reason=counted_input_changed detail=paths=scripts/check-measurement-binding.mjs`;
  `--at 3254740` → exit 0. Cause: the r16 manifest lists the gate and its selftest as C1's counted
  inputs (`corpus/evidence/round-16/measurement-binding.json:21-25`; C2 at `:51`). Consequence: r17's
  binding measurement must be taken **after** the last edit to every declared counted input.
- **"check-round-contract stays green."** True only if `PROVINCE.md` is not appended (§3.1).

## 3. Two measured contradictions

### 3.1 `PROVINCE.md` is census-frozen, and C3 plans to append it

- Isolated probe (append one line to `PROVINCE.md`, nothing else): `ROUND_CONTRACT verdict=failed
  finding=history_rewritten detail=Census blob drifted: PROVINCE.md`, exit 1. Identical appends to
  `SCORECARD.md`, `LOG.md`, `SKILL.md`, `corpus/README.md`, `corpus/QUALITY.md` each stay exit 0 clean.
- Mechanism: `corpus/evidence/pstack-20261015/baseline-census.tsv:24` pins PROVINCE blob `c2222b16`;
  `scripts/check-round-contract.mjs@5859243:255-261` requires every census blob at the tip to equal
  the record. `APPEND_ONLY` (`:25`) lists PROVINCE and its prefix rule (`:242-245`) passes, but the
  census loop overrides it. `harm-baseline.json:167` already documents the rule: "every listed
  baseline path must keep its recorded blob id".
- Not fixed by C1: the in-flight worktree gate (sha `15f0796e…`, 1098 lines) still fails identically.
- The census is not re-pinnable in-round: its sha is a code constant
  (`check-round-contract.mjs@5859243:30`), and `corpus/evidence/pstack-20261015/**` is drift-forbidden
  to the user gate (`harm-baseline.json:186-210`).
- PLAN.md:39,168,194 requires the append ("C3 … the PROVINCE append"; routed defect 5). As written it
  guarantees harm row 1 red. Minimum no-harm route: **drop the append**; carry the integrator ruling
  in `corpus/adjacency.tsv` `ruling_ref` plus `SCORECARD.md`/`LOG.md` appends (probe-clean). If L1
  keeps it, it is a declared gate repair — prefix-grow exemption for APPEND_ONLY census paths + a
  mid-file negative control + a declared row-1 delta — not part of C1's anchor claim.

### 3.2 The identity chain masks the pre-existing red line between commits

- Probes (plumbing commits in a clone): (a) edit `scripts/check-round-contract.mjs` alone → user gate
  stderr becomes `history_rewritten … Pstack bytes changed: M\tscripts/check-round-contract.mjs`
  (a different digest → harm row 2 red); (b) move the old current sha `8a573b4e…` into
  `ROUND_SCRIPT_ARCHIVED_SHA256` and the new blob into `ROUND_SCRIPT_CURRENT_SHA256` → stderr returns
  byte-identical to `round_count 6/10`; (c) a second, unrecorded intermediate commit of the same file
  → `history_rewritten` again.
- Rule: exactly one committed blob of `check-round-contract.mjs` per round, or every intermediate
  digest in the archived set (`check-user-round-contract.mjs@5859243:32-40,239-244`). The harm check
  must run at the delivered revision only; a mid-wave user-gate red is a different finding and must
  not be recorded as harm.

## 4. Trend pre-registration (counts → verdict; scalars firewalled)

| Axis | Declared scalar | Counter field | Before | "improved" iff all hold | Scalar move |
|---|---|---|---|---|---|
| operability | 8→8 | `c1_anchor_safe` | 0 | count ≥1 at measured rev; every counter negative probe 0; harm rows 1-9 clean; row 9 exit 0 | **no**: withholding reasons untouched (USER 6/10 red, no outside execution — SCORECARD.md:744); integrator already rejected 8→9 (`round-16-verifier-spotcheck.md:119`) |
| coverage | 9→9 | `c2_invocation_held` | 0 | count =1; probes 0; note cites an S041+ mined A/B row; receipt `producerSha256` = harness blob sha | **no**: one build, flags, loopback; real-site ground open (SCORECARD.md:743; spotcheck `:119`) |
| adjacency | 8→8 | `c3_adjacency_verified` | 0 | count ≥1; counter re-verifies every row; checker goes red on a mutated row | **no**: a map records boundaries, it absorbs no sibling domain; PROVINCE append blocked (§3.1) |
| depth | 8→8 | — | — | no claim | no |
| freshness | 8→8 | — | — | no claim | no; the carried item (re-verify S001-S019, SCORECARD.md:770) is not in r17's claims, so "freshness improved" is unsupported |
| calibration | 9→9 | — | — | only a QUALITY criterion + mistake row pointer can justify a trend word | no |

Scalar firewall — the answer to "justified only by measured counts":

1. **No scalar may move this round.** A move needs (a) the counter field >0 at the measured revision,
   (b) the named withholding reason retired with evidence, (c) harm rows clean at the delivered
   revision, (d) `--reproduce` exit 0. Nothing in PLAN provides (b) for any axis.
2. **The only justified scalar change is downward** (e.g. 8→7) if a hard harm row turns red: the
   no-harm check is the negative scalar's only instrument.
3. Precedent for a count-bound move is `SCORECARD.md:410` (operability 7→8 tied to a 0→1 receipt while
   the axis was uniquely lowest). r17's counts are new counters, not retirements of the reasons that
   withhold 9/10/8, so they do not meet that precedent.
4. Blast radius: no gate validates the hyaku SCORECARD scalar rows — `check-round-contract` parses
   only `<!-- pstack-round:` markers (`check-round-contract.mjs@5859243:265-273,578-608`). An inflated
   scalar is silently accepted; this pre-map is the only check, so it must be quoted by the round
   report before the SCORECARD append.

## 5. One bounded move

**Replace the one-dimensional harm compare with a 2×2 script×revision differential, and use cell B as
the pre-admission test for every planned content append.**

Cells, all in one attached-HEAD sandbox clone: A = old scripts @ R0 (digests in §1); B = old scripts @
R1; C = new scripts @ R0; D = new scripts @ R1 (delivered). Harm holds iff B≡A (content caused no gate
delta), C≡A on attached HEAD (script change is behavior-preserving; only declared printed-revision
fields may differ), and D≡B or every delta is declared. R16 compared identical script bytes at both
revisions (`AttackHarmGates.md:20-27`), so it cannot separate script change from input change; r17
changes four scripts, making D-vs-A alone unattributable.

- Affected axes: operability (C1's proof becomes a differential), calibration (claim evidence bar),
  adjacency (content-append admission). Coverage untouched; the move only adds falsifiers.
- Risks: B can legitimately fail on content the new gate accepts — classify and declare it, never
  waive it; copy old blobs only inside the sandbox, never in LANE.
- Cost (measured per cell): round 2.07 s, user 0.18, freshness 0.12, sources 0.02, binding 0.04 —
  under 10 s for all four cells.
- Verification: `S=$(mktemp -d /tmp/tabi-r17-harm-XXXX); git clone --no-hardlinks LANE $S; cd $S;
  git checkout -q --detach R1; git update-ref refs/heads/master R1; git symbolic-ref HEAD
  refs/heads/master; for f in scripts/check-round-contract.mjs scripts/check-user-round-contract.mjs
  scripts/check-measurement-binding.mjs scripts/selftest-measurement-binding.mjs; do git show
  5859243:$f > $f; done` → run A/B; `git checkout -- scripts` → run C/D.
- First result already in hand: with r17-shaped content minus PROVINCE, five of six digests are
  identical to A (aria differs only by absolute path); with PROVINCE, B is red (§3.1). That isolates
  C1 as the only remaining variable and proves the PROVINCE append is not harm-neutral.

## 6. Two smaller measured facts

- `check-aria-metadata` stdout embeds absolute pinned-input paths (e.g.
  `/tmp/…/corpus/evidence/round-13/aria/receipt.json`), so its digest is repo-location dependent. The
  other five gate stdouts contain no absolute path (checked). Normalize the repo root or run that row
  in-lane.
- `check-sources` has no digest contract (`harm-baseline.json:219`); its r17 before is `rows=40`
  (queued 2, mined 33, rejected 5; A31/B4/C5), matching PLAN.md:8.

Files written: `.ufo/waves/round-17/w1/ConnTrendsHarm.md`
