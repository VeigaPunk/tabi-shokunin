VERDICT: ISSUES

Reviewed PLAN.md §C1 (laneTip semantics + count definition) against JjAuditTabi F1–F6,
JjTrialTabi 4–5 and the live gates. Sandboxes were throwaway `git clone --no-hardlinks` under
/tmp (removed); LANE read-only. Seats edited the gates while I read them, so citations carry the
snapshot sha256 — 2026-10-20T15:52:12Z: round `15f0796e…`, user `bac10415…`, binding `15af0111…`,
selftest `5d9f1ec5…` (15:50:19Z: round `1e1cc28a…`, user `7fc54805…`).
Baseline, clean clone of `5859243`: round exit 0 `clean`; user exit 1 `round_count` "Found 6 user rounds, expected 10"; binding `--check` r16 exit 0 `clean claims=2 bound=2`.

## HIGH

**F1 — Arm C does not prove sensitivity; the predicate counts a gate that still reads HEAD.**
One-site mutant of the current user gate (`check()` read reverted to `show(root,'HEAD','SCORECARD.md')`),
run under the plan's arms: A exit 1 `finding=round_count`; B (`update-ref --no-deref HEAD P`,
master=REV) exit 1, **stdout byte-identical to A**; C (master=P, attached) exit 1
`finding=history_rewritten … SHONEN.md`. A==B, B has no revision field, A≠C ⇒ the plan's predicate
PASSES. Cause: one shared P changes only SHONEN/one lesson/the round script, so HEAD reads of
SCORECARD/LOG/evidence/report bodies are invisible in B *and* C; C is satisfied by the first
anchored check (`checkHistory` SHONEN) because `fail()` aborts the gate. Corroboration: at
15:50:19Z the user gate still carried live HEAD reads (`:636-639`, `:819/823`, `:903/907`,
`:982/984`); the counter cannot distinguish that state from the anchored one.
Fix: (a) static residue scan of each gate blob at REV — every git-argv `'HEAD'` must sit inside a
counter-pinned fixture allowlist (`commit()`, `detachFixture()`, `countWitness`, `selfTest`) or
the entry fails; (b) C must differ in verdict/finding/reason, never in a `*revision*` field;
(c) per-entry poison `P_i` with a declared read set (or one P asserted to cover their union).

**F2 — Arm B cannot exhibit the F3 false attestation; the poison set omits the user script.**
Identical state (worktree=HEAD=edited gate on no branch, master=REV): correct gate →
`committed=no measuredRevision=uncommitted codeRevision=5859243…`; `headBlob`→HEAD mutant →
`committed=yes measuredRevision=5859243…`. That is JjAudit F3 exactly. But with the plan's poison
set (SHONEN + dropped lesson, USER_SCRIPT untouched), correct vs mutant across A/B/C both gave
`committed=yes` in every arm, A==B, C differing only in `codeRevision` ⇒ mutant counted safe.
Arm B discriminates `committed` only if P rewrites the compared file; the "e.g." list never
requires it. Fix: poison must include `scripts/check-user-round-contract.mjs` and
`scripts/check-round-contract.mjs`; add arm B2 (F3); assert `committed=`/`measuredRevision=` values.

**F3 — Arm B's worktree/HEAD pairing is not a jj state and its polarity is inverted.**
Plan arm B = `update-ref --no-deref HEAD P` with worktree unchanged (`=REV`), so worktree≠HEAD
tree; jj keeps worktree == `@` tree (JjTrialTabi 4, JjAuditTabi F2/F3). Measured: in that state a
HEAD-reading gate prints `committed=no` (false negative) while the real jj defect is
`committed=yes`. Fix: keep B as "HEAD names an off-branch commit" and add **B2 = `git checkout -f P`**
(worktree=index=HEAD=P, master=REV), which discriminates the F3 pair with true polarity for any P.

## MEDIUM

**F4 — attached HEAD on a non-master branch: the production anchor follows the checkout.**
`laneTip` (round `:88-101`, user `:132-149`, binding `:249-272`) threads `symbolic-ref -q HEAD` for
every root. The lane is safely detached today (`symbolic-ref -q HEAD` rc=1 → master=`5859243…`),
but an attached feature branch would be certified and its hash printed as `codeRevision=`/`--at` —
unreproducible from a clone (the R2 defect C1 claims to close), and it contradicts the SKILL rule
`--witness "$(git rev-parse --verify refs/heads/master)"`. Fix: root-aware policy — production
root (`isProduction`/`sameRoot` exist): lane branch only (`refs/heads/master`, then
`refs/remotes/origin/master`); honour attached HEAD only for fixture roots (where `git init` may
land on `main`). Cheaper: fail closed `anchor_not_lane_branch` when attached to anything else.

**F5 — `refs/heads/master` missing: fail-closed is right, but untested and hard-downs a `main` lane.**
Deleted ref → `git rev-parse --verify --end-of-options 'refs/heads/master^{commit}'` = `fatal:
Needed a single revision`, rc=128 (so exit 2 holds), but (a) no arm tests it, so the likely wrong
implementation (`master` … `catch { HEAD }`) passes A/B/C; (b) a `main`-trunk jj lane exits 2
forever, while the helper already resolves origin/HEAD → master → main
(`scripts/hyaku/jj-lane.sh:53-70`). Fix: ordered candidates master → main → origin/master (or the
helper rule), then exit 2 `anchor_missing` naming the candidates; add arm D (no master, detached →
exit 2, zero mutation) and arm E (attached `refs/heads/scratch`, master present → anchor ignores it).

**F6 — count arithmetic: one entry is unsatisfiable and "Exit 0 counted" contradicts baseline red.**
`check-measurement-binding --check …` with `--at REV`, `--at P`, `--at 1205d26…` all print
`MEASUREMENT_BINDING verdict=clean claims=2 bound=2` exit 0; text mode prints **no revision field**
(JSON carries `"at"`). So (a) "printed 40-hex == REV" is vacuous; (b) arm C leaves the verdict
unchanged (P touches no `countedInputs`) ⇒ A==C ⇒ the entry can never pass, C1 max 6/7, yet the
only licensed drop reason is "e.g. runtime > 10 min"; (c) user production is exit 1 by design
(SKILL.md:1800) and its `--self-test` is exit 1 (`SELFTEST name=round_script_cutover … result=FAIL`;
`ROUND_SCRIPT_CURRENT_SHA256`=`8a573b4e…`=committed REV bytes vs worktree `15f0796e…`, L1's update
pending), so exit-0 hurts and exit-1 conflates "anchor-safe" with "red". Fix:
`pass = exitA==exitB ∧ exitB∈{0,1} ∧ verdictClass(A)==verdictClass(B) ∧ verdictClass(C)≠verdictClass(A)`;
emit `verdictClass` in the JSON; for this entry use `--json`, assert `.at==REV`, and put a
`countedInputs` path into P so C yields `counted_input_changed`; add an explicit `unsatisfiable`
outcome with its reason and print N's denominator. (`--self-test` is not an entry; if added it
would count while red, C differing only via `codeRevision`.)

**F7 — normalization can hide what it asserts; the witness output is irreducible.**
`--diagnostic-witness` differs between any two runs in `args={…"--baseline","6789ee2e…"]` vs
`b093e6b2…` plus temp paths, while the same line carries `codeRevision=` (must equal the tip). A
blanket 40-hex normalization erases `codeRevision`; no normalization breaks A==B every run. Also
`measuredRevision=uncommitted` is a state word, not a revision — the plan's field list is wrong
for it. Fix: field-scoped rule — parse `key=value`, normalize only declared volatile keys
(`baseline=`, `args=`, `*-blob=`, `*-sha256=`, tmp paths, fixture `rev=`), and assert
`codeRevision==REV` (B2: `measuredRevision∈{REV,uncommitted}`, `committed` asserted separately).
Never normalize `codeRevision`/`committed`/`verdict`/`finding`.

**F8 — the revision-field list does not match the gates.** Binding prints `at` in JSON and nothing
in text (`emitResult at: atRev`, `:693-703`); user witness prints `codeRevision=`,
`measuredRevision=`, `rev=`; round count-witness prints `code_revision=`. The plan names only the
last two families. Fix: counter-owned per-gate/mode field table, asserted in F1's projection.

**F9 — three copies, no enforced "same semantics".** Binding: status 1 = detached, other nonzero =
`git_failed` (`:255-262`); round `:90-91` and user `:137-138` treat any nonzero as detached. Both
land at exit 2 in practice, but the plan's "self-contained, same semantics" is unenforced. Fix:
counter extracts each `laneTip` body from the REV blobs and asserts sha256 equality of the three,
and pins "1 = detached, else git failure".

## LOW

**F10 — leading-dash refs: safe, but not for the stated reason; git floor unpinned.**
`refs/heads/-x` is creatable and attachable (`update-ref` rc=0, `symbolic-ref HEAD refs/heads/-x`
rc=0) and resolves with *or without* `--end-of-options` (the token starts `refs/`). The
load-bearing guard is the `refs/heads/` whitelist — which also rejects the legal
`symbolic-ref HEAD refs/remotes/origin/master` (rc=0). `--end-of-options` needs git ≥2.24 (host
2.56.0; binding already uses it at `:232`). Fix: say the whitelist is the guard, `--end-of-options`
defence-in-depth; pin a git floor; probe attached `refs/heads/-x` and a remote-tracking symref →
exit 2, not a wrong anchor.

**F11 — counter inputs are not in the measured revision.** `.ufo/waves/round-17/` is untracked and
not ignored (`check-ignore` rc=1; `ls-tree REV` empty), so the clone lacks `measure-c1.mjs`/
`harm-baseline.json`/`c1-sites.json` and "before→after" cannot be replayed from a clone; REV must
also be branch-reachable (an unlanded jj commit is not). The plan's `--count-witness` entry cites
"the canonical argv from the SKILL.md registry rows", but SKILL has **no** such row (`grep -c`=0);
the only canonical rev is the constant `COUNT_WITNESS_REV=bebe2efc…` (blob `43db9f4b…` resolves
there). Fix: commit wave-1 counter artifacts before the measured revision (or copy the counter into
S); assert `git cat-file -e REV^{commit}` with an explicit failure reason; source the rev from the
script constant and add the SKILL row at integration.

## What holds

- Detached fallback matches the lane: `symbolic-ref -q HEAD` rc=1, master=`5859243…`; missing master
  fails closed (rc=128 → exit 2).
- Arm-B mechanics valid: `update-ref --no-deref HEAD P` rc=0, HEAD→P, master unchanged,
  `symbolic-ref -q HEAD` rc=1. `--end-of-options ${ref}^{commit}` resolves.
- Per-gate detached fixtures exist and the round gate's discriminates: real
  `SELFTEST name=lane_tip_detached_head … result=PASS`; with `laneTip` reverted to HEAD the same
  case is `result=FAIL` (self-test exit 1). User case `detached_head_reads_lane_tip` passes (line 20
  of its real self-test); binding has `lane_tip_detached_off_branch` + `lane_tip_detached_explicit_at`.
- "Before = 0" is credible: round A `clean` vs B `shonen_policy`; user A `round_count` vs B
  `history_rewritten`; binding A==B (fails only C, F6).
- Runtime is no drop risk: production ≈1 s/entry, witnesses ≈0.3 s, round self-test ≈5.1 s wall,
  user self-test ≈4.9 s.

## Consolidated count rewrite

`pass(entry) = exitA==exitB ∧ exitB∈{0,1} ∧ verdictProjection(A)==verdictProjection(B) ∧
revFields(B)=={codeRevision:REV,…} ∧ verdictProjection(C)≠verdictProjection(A) ∧
staticResidue(gate@REV)==0`. Arms: A (attached master=REV, worktree REV), B (HEAD=P detached,
worktree REV), **B2** (checkout P: worktree=HEAD=P, master=REV), C (attached master=P, worktree
REV), D (no master/origin → exit 2 `anchor_missing`, zero mutation), E (master=REV vs
origin/master behind → `anchor_unpushed` policy decision), F (attached `-x`/remote symref → exit 2).
Poison: per-entry `P_i`, or one P whose changed set covers SHONEN.md, one pstack lesson, one user
lesson, SCORECARD.md (append), LOG.md (append), both gate scripts, one round-16 counted input, and
the binding manifest's `countedInputs`.

Files written: `.ufo/waves/round-17/w1/RevPlanC1.md` (this report). Tools: none installed/upgraded.
