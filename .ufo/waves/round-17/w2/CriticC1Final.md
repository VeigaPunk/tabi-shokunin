VERDICT: ISSUES

Attacked: C1 as landed at M = 6c97851034e9d8f58b135d28ff969f1f28fa2f7d (baseline B = 5859243…). Five questions:
(1) is 0→4 an honest operability move, (2) is excluding the 4 label-only entries right, (3) does "jj-safe"
overstate (local vs pushed tip, helper exit 3, attached non-master branch), (4) is the check-freshness why-not
honest, (5) can C1 be separated causally from C2/C3.
Axes: operability (C1 count), calibration (claim wording), harm, separability.
Sandbox: `/tmp/tabi-r17w2-CriticC1Final-4yTj` (git clones of LANE; jj ran only inside the probe's own /tmp
clones). It is removed. LANE was read only: `HEAD = master = 6c97851…` before and after. No tools installed.

## 1. Is 0→4 an honest move? HOLDS (it reproduces, and residue is 0)
- Counter blob at M: sha256 `47185c8c…` (`git show 6c97851:.ufo/waves/round-17/measure-c1.mjs | sha256sum`).
  This equals the sha in C1Counter.md:5.
- `node .ufo/waves/round-17/measure-c1.mjs 6c97851… --lane <clone>` gives `c1_anchor_safe=4`, `sitesSource=rev`.
  The four behavior entries pass with exits A/B/B2/C: round-production 0/0/0/1, user-production 1/1/1/1,
  binding-r16 1/1/1/1, fixture-full-read 0/0/0/1. The same counter at B gives 0 (`sitesSource=embedded`).
- Static residue at M is 0/0/0. I checked every literal `'HEAD'` in the three gate blobs by hand:
  - round `:123,606,689,814-898,1073,1176-1186`
  - user `:175,186,640,680,723,1194,1246,1295,1302`
  - binding `:268`
  Each one is a `symbolic-ref` probe, an HTTP method string, fixture `commit()`, a fixture or self-test
  helper, or the count-witness fixture repo. No live lane read is left.
- Independent check with real jj: `probes/jj-real-probe.mjs 6c97851…` reports `round_contract_reads_jj_head=false`
  and `measurement_binding_reads_jj_head=false`. In the states `after-jj-new` and `after-snapshot-content`,
  HEAD is on no branch, yet the gates read master.
- Caveats. Neither is a defect in the count:
  - The user-production entry is credited while red (`round_count 6/10`) at both B and M.
  - Binding-r16 in arm A is red at M: `counted_input_changed`. The C1 claim lists `scripts/check-measurement-binding.mjs,selftest`
    and the C2 claim lists `corpus/README.md,corpus/SOURCES.md`. This is expected drift at the new tip. The harm row
    uses `--at 1205d26` (`harm-baseline.json:906-925`), and that row is still clean at M (rc=0, `clean claims=2 bound=2`).

## 2. Is excluding the label-only entries right? HOLDS, but the claim needs both numbers
- At M the four witness entries fail on exactly one reason: `["arm_c_label_only"]`.
  At B they failed `revision_field_not_lane_tip_b/_b2`, `committed_not_no_b2`, `gate_static_head_residue`.
- The concrete case is user witness in arm B2, the real jj state: HEAD = worktree = P, off-branch.
  - At B it printed `committed=yes measuredRevision=<P>`. That is false provenance (JjAudit F3).
  - At M it prints `committed=no measuredRevision=uncommitted`.
  - So C1 also repaired these four entries. They now pass every anchor check. Only the sensitivity arm fails, and it
    cannot pass by construction: the witness verdicts come from fixtures (C1Counter.md:140-143).
- Excluding them is correct. Crediting an entry whose verdict ignores lane state brings back the relabel game
  (CriticC1 A1). Reporting "0→4" with no denominator undersells what C1 did.
- Integration drafts already say "4 … of 8 entries" (`drafts/log2.md:28`, `drafts/scorecard2.md:25`). These are
  uncommitted, not at M.
- Repair (L1 wording): "behavior-bearing 0→4 (4/4); label-only 4 entries anchor-correct at M (F3 attestation fixed),
  not credited by rule; 8 entries total."

## 3. Does the claim overstate "jj-safe"? ISSUES. The fix is branch-anchored, not landed
- **E3, local vs pushed (the helper exit-3 state).** Setup: clone at M, `origin/master` set to B, ahead=1.
  - Running `--count-witness bebe2efc…` gives `code_revision=6c97851… code_committed=yes result=PASS`.
  - Production prints `verdict=clean rounds=10`.
  - `git branch -r --contains 6c97851` prints nothing. The gate prints no push state.
  - So the unpushed tip is certified exactly as baseline did (CriticC1 A2).
  - `drafts/quality.md:52` itself says "Not drafted: a push-state clause".
- **E2, attached non-master branch.** Setup: `git checkout -b feat` at M, then commit a README append.
  - Round production gives `clean`.
  - Binding `--json` gives `"at":"1164027…"`.
  - User `--diagnostic-witness` gives `codeRevision=measuredRevision=1164027… committed=yes`.
  - `git branch -a --contains HEAD` prints only `* feat`.
  - So the gates certify a branch that is not the lane branch. This follows the PLAN spec (`PLAN.md:62-63`).
  - The freshness rule (`refs/heads/master`) names M in the same state, so one receipt set carries two anchors.
    RevPlanC1 F4 is still open.
- **E1, the verdict line names no anchor.** Setup: off-branch commit on detached HEAD with extra SHONEN prose,
  master = M (the same shape as jj-real-probe `after-snapshot-content`).
  - The M gate prints `ROUND_CONTRACT verdict=clean rounds=10 consequential=0` (rc.mjs:683), with no revision.
  - The B gate in the same state prints `failed finding=shonen_policy`.
  - Certifying master is the correct semantics. But a clean line is now indistinguishable from "the work at HEAD is
    clean", and HEAD≠tip produces no diagnostic. This is the jj-probe risk 1 (C1JjRealProbe.md:103-108), left unaddressed.
- Repairs:
  - (a) L1 wording now, in claim, LOG, lesson and QUALITY 29: "anchored on the local `refs/heads/` branch tip (no
    off-branch HEAD); not landed/pushed; an attached non-master branch is certified as its own tip". Record exit 3 /
    ahead>0 as a residual limit.
  - (b) Gate change, next round: when the resolved HEAD commit ≠ tip, write a stderr note
    `head_off_tip head=<40hex> tip=<40hex>`. Attached-checkout output stays byte-identical (`PLAN.md:78-79`).
  - (c) Gate change, next round: fail closed when a production root is attached to a branch other than
    `refs/heads/master` (RevPlanC1 F4) [INFERENCE: fixtures `branch -m master` (rc.mjs:816), so they are unaffected;
    not run].

## 4. Is the check-freshness why-not honest? HOLDS on substance, ISSUES on the record
- The freeze is real.
  - `protectedPath` lists the file: rc.mjs:175 at M, and the user gate at `:233` and `:353` (also `:84`).
  - `git diff --quiet B M -- scripts/check-freshness.mjs` gives rc 0.
  - No committed receipt prints `revision=HEAD`: `git grep` at M over corpus/.ufo finds 15 `worktree`, 7 hex, and
    `HEAD` only in w1 reports and drafts.
  - `--worktree` labels itself `revision=worktree` (check-freshness.mjs:114), so it is honest.
- Issues:
  - (i) At M the why-not and the SKILL invocation rule exist only in PLAN.md and `.ufo/.../drafts`.
    `SKILL.md LOG.md SCORECARD.md corpus/QUALITY.md` are unchanged from B to M (`git diff --quiet` rc 0).
    So "recorded as a why-not plus a SKILL rule" is not yet true at the measured revision.
  - (ii) The rule form `--witness "$(git rev-parse --verify refs/heads/master)"` (`drafts/log2.md:35`, `drafts/skill.md:22`)
    still lacks `--end-of-options …^{commit}`. Under E2 it also differs from the gates' anchor (CriticC1 A4 is unapplied).
    An empty substitution fails closed: check-freshness.mjs:49-50 rejects `""` with a usage error, exit 2 (from reading the code).
  - (iii) The rule is caller discipline, not enforcement. Say "unenforced" explicitly.

## 5. Is C1 causally separable from C2/C3? HOLDS (shown empirically)
- X1 = M with the four C1 gate files restored to B bytes (`dc468ca`):
  `c1=0`, `c2_invocation_held=1`, `c3_adjacency_verified=9`.
- X2 = M with the C2 and C3 artifacts removed and README/SOURCES restored to B (`d181d25`):
  `c1=4` (same 4 entries), `c2=0`, `c3=0`.
- At M: c2=1, c3=9. c3 ran with `--repo <clone named tabi-shokunin> --fleet-root /home/vgpnk/Projects/shokunin`.
  An earlier run from a clone named `e4` gave c3=0 with `sibling_unresolved`: it was an artefact of the clone path
  (measure-c3.mjs:1095,1100), not of the claim.
- `check-adjacency.mjs` has its own copy of the pattern (`resolveLaneTip`; `LANE_TIP_FALLBACKS=['refs/heads/master']`
  at :189). It is not in the C1 entry list, so it is not double-credited.
- Residual (not a separability break): there are now 4 hand-copied anchor implementations. Nothing enforces equal
  semantics between them (RevPlanC1 F9). For example, check-adjacency `TIP_FALLBACKS` adds `main` for siblings (:188).

## Impacted axes / smallest safe correction
- calibration: §3(a) wording, §2 "of 8" with the label-only fix noted, §4(i) land the why-not before citing it, and
  §4(ii) rule form.
- operability: the count stands at 4. No re-measure is needed.
- harm: none found.
- Next-round gate items: §3(b) `head_off_tip` stderr note, §3(c) non-master attached fail-closed.

Files written: .ufo/waves/round-17/w2/CriticC1Final.md
