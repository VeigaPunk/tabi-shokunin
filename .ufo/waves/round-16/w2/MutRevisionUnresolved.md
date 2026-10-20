# MutRevisionUnresolved — mutation probe: gate reason `revision_unresolved`

Author-side attack item (W2 falsify), lane `tabi-shokunin`, snapshot
`b444ca8e024f386124418169e8e400221524bba3` (commit A `8f7feb3` + counter repair).
Read-only on the lane: every mutation was applied to copies under
`/tmp/tabi-mut-revunres-probe`; the real counter was exercised against a
`git clone` of the lane under `/tmp`. This is an author-side recommendation, not
a non-author certification.

## Verdict

**BREAKS (weakening branch) — HOLDS (disable branch).**

- Disabling the code that emits `revision_unresolved` — relabelling both
  `refuse()` sites to `git_failed`, dropping the `status !== 0` refusal, or
  silently falling back to `HEAD` — makes the selftest **red** (exit 1, two case
  FAILs) and the C1 counter **0** on a committed mutant. That half holds; the
  counter fires through four independent conditions (selftest exit, summary,
  case mismatch, vocabulary absence).
- One weakening confined to the same code **survives both harnesses**: deleting
  the leading-dash/NUL *token precheck* in `resolveCommit` leaves the selftest
  `verdict=clean cases=43 reasons=13` and the counter at
  `c1_binding_contracts=1` with `failures=[]`. It is not vocabulary-preserving
  by accident — the second refusal covers every *unresolvable* input — but it
  removes a coded policy that is still observable: on a repo carrying
  `refs/heads/-x`, the pristine gate refuses `--at -x` with exit 2
  `revision_unresolved`, while the mutant resolves the ref and reports
  `verdict=clean claims=1 bound=1` with exit 0.

So the narrow claim “suppressing `revision_unresolved` turns the selftest red and
the C1 counter to 0” is true for the emission paths the selftest exercises, and
false for one in-scope weakening of the same lines: neither harness pins the
token guard.

## Axes

1. **Kill strength** — does the selftest go red when the `revision_unresolved`
   emission is disabled (relabel, dead refusal)?
2. **Semantic weakening** — does the selftest catch an unresolved revision being
   coerced (status check dropped, `HEAD` fallback) rather than refused?
3. **Emission-site granularity** — are both `revision_unresolved` sites
   (`check-measurement-binding.mjs:225-231`) individually pinned?
4. **Counter inheritance** — does the C1 counter add coverage or does it merely
   re-run the same selftest and inspect its vocabulary?

## Baseline (lane, read-only)

```
$ git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse HEAD
b444ca8e024f386124418169e8e400221524bba3

$ node .ufo/waves/round-16/measure.mjs b444ca8e024f386124418169e8e400221524bba3 --claim C1
{"revision":"b444ca8…","c1_binding_contracts":1,
 "gateSha256":"5150611c3d597fd7a70314e2d7cd835be62c5688e521297803e4907fdaa0d6fb",
 "selftestSha256":"8c5426f254b76e4c7c0a0374d513c33f2832a5dfff5e92b938f4bd9d7168f2ae",
 "selftest":{"exit":0,"cases":43,"summary":"MEASUREMENT_BINDING_SELFTEST verdict=clean cases=43 reasons=13","bad":0,"clean":21,"missingVocab":[]},
 "legacy":{"exit":1,"findings":{"C1":[…],"C2":[…]}},"failures":[]}

$ node .ufo/waves/round-16/measure.mjs e38d2599a922cb729186353830fff8e159b4fef0 --claim C1
{"revision":"e38d259…","c1_binding_contracts":0,"failures":["gate or selftest absent at revision"]}

$ node <tmp>/selftest-measurement-binding.mjs --gate <tmp>/check-measurement-binding.mjs
MEASUREMENT_BINDING_SELFTEST verdict=clean cases=43 reasons=13      # exit 0
```

Claim shape reproduced: 0 → 1, with the gate/selftest present at the measured
revision only.

The code under attack (`scripts/check-measurement-binding.mjs:223-233`):

```js
function resolveCommit(repo, rev, label) {
  const text = String(rev);
  if (text.startsWith('-') || text.includes('\0')) {
    refuse(FAILURE_REASON.revisionUnresolved, `${label} ${cleanDetail(text)} is not a revision token`);
  }
  const result = git(repo, ['rev-parse', '--verify', '--end-of-options', `${text}^{commit}`]);
  if (result.error || result.status !== 0) {
    refuse(FAILURE_REASON.revisionUnresolved, `${label} ${cleanDetail(text)} does not resolve to a commit`);
  }
  return result.stdout.trim();
}
```

The selftest pins exactly two things about it
(`scripts/selftest-measurement-binding.mjs:294-302`): `--at <fake-40-hex>` and
`measuredRevision: <fake-40-hex>`, each with a same-shape positive control. No
case supplies a leading-dash token, and none supplies a token that is
*resolvable only because the repo defines a dash-named ref*.

## Mutation matrix (lane untouched; one exact-string edit per mutant)

Driver per row, in a fresh `git reset --hard b444ca8` worktree of the clone:

```
node scripts/selftest-measurement-binding.mjs --gate scripts/check-measurement-binding.mjs
node .ufo/waves/round-16/measure.mjs <mutant-sha> --claim C1
```

| id | mutation (only the code that emits `revision_unresolved`) | selftest | C1 counter |
|---|---|---|---|
| M1 | both `FAILURE_REASON.revisionUnresolved` → `gitFailed` | exit **1**, FAIL `revision_unresolved_at`, `revision_unresolved_measured`; `verdict=failed` | **0** |
| **M2** | delete the `startsWith('-') || includes('\0')` precheck (one of two emission sites) | exit **0**, `verdict=clean cases=43 reasons=13`, `missingVocab=[]` | **1** |
| M3 | `if (result.error \|\| result.status !== 0)` → `if (result.error)` | exit **1**, same two FAILs | **0** |
| M4 | unresolved branch → `return 'HEAD';` (silent coercion) | exit **1**, both cases exit 0/`verdict=clean` vs expected 2 | **0** |

Selected observed lines:

```
# M1 / M3
case=revision_unresolved_at expected_exit=2 actual_exit=2 expected_reasons=revision_unresolved actual_reasons=git_failed FAIL
case=revision_unresolved_measured expected_exit=2 actual_exit=2 expected_reasons=revision_unresolved actual_reasons=git_failed FAIL
MEASUREMENT_BINDING_SELFTEST verdict=failed cases=43 reasons=13

# M4 — the semantic weakening is caught, not just the label
case=revision_unresolved_at expected_exit=2 actual_exit=0 expected_reasons=revision_unresolved actual_reasons=- FAIL
FAIL_DETAIL case=revision_unresolved_at MEASUREMENT_BINDING verdict=clean claims=1 bound=1

# M2 — survivor
MEASUREMENT_BINDING_SELFTEST verdict=clean cases=43 reasons=13     # 43 PASS lines
```

## Counter confirmation on committed mutants (real `measure.mjs`, `/tmp` clone)

| mutant | commit | `c1_binding_contracts` | `gateSha256` | `failures` |
|---|---|---|---|---|
| baseline `b444ca8` | `b444ca8` | **1** | `5150611c…` | `[]` |
| M1 | `83ec46eaed552206c209d33d3a661172a52bf1fd` | **0** | `8c79f41d…` | `["selftest exit 1","selftest summary absent, not clean, or case count mismatch","2 case lines not exact PASS","vocabulary not exercised: revision_unresolved"]` |
| **M2** | `9afa7dadbb8d5594df2d1c63a7eb51b290c142b0` | **1** | `6c47d908…` | `[]` |
| M3 | `9be6e10c81e4bea051f649a50bb6e9c39855e15e` | **0** | `3b26a4d2…` | same four |
| M4 | `57717d9b1f60fdcd27f865ca92f2adfa626ee4e4` | **0** | `089042ba…` | same four |

So the answer to “would the C1 counter also count 0?” is **yes for disablement
(M1/M3/M4), no for the surviving weakening (M2)**. The counter materialises the
mutant gate from the committed blob (its `gateSha256` is the mutant digest) and
still counts 1; it adds no independent coverage of `resolveCommit` because its
only other oracle, the `--legacy` arm on real round-15 history, never reaches
the revision resolver with a non-40-hex token.

## Finding (Medium) — M2 survives, and the token policy is observably lost

`resolveCommit` refuses any leading-`-` token *categorically* — the reason
detail is literally “is not a revision token” — before git is consulted.
`--end-of-options` stops option parsing, but it does not stop git from resolving
`-x` as a *ref name*: `refs/heads/-x` is a legal ref and
`git rev-parse --verify --end-of-options '-x^{commit}'` resolves it (exit 0).
Under M2 the precheck is gone, so the gate accepts a token its own contract calls
unusable and evaluates the claim at that commit.

End-to-end probe. Fixture: `/tmp/tabi-mut-revunres-probe/fixture`, clean-shape
manifest (`measuredRevision=rev1=f6971a55…`, `before=rev0=e7be44af…`,
`counted/` input, digest-bound counter) plus
`git update-ref refs/heads/-x f6971a55…`.

```
# pristine committed gate (copy of b444ca8:scripts/check-measurement-binding.mjs)
$ node <base>/check-measurement-binding.mjs --repo <fixture> --check <manifest> --at -x
MEASUREMENT_BINDING verdict=could_not_evaluate claims=0 bound=0
finding claim=- reason=revision_unresolved detail=--at -x is not a revision token
exit=2

# M2 gate (same fixture, same flags)
$ node <m2>/check-measurement-binding.mjs --repo <fixture> --check <manifest> --at -x
MEASUREMENT_BINDING verdict=clean claims=1 bound=1
exit=0

# control: pristine gate with a valid --at
$ node <base>/check-measurement-binding.mjs --repo <fixture> --check <manifest>
MEASUREMENT_BINDING verdict=clean claims=1 bound=1
exit=0
```

Scope of the reachable trigger, checked rather than assumed:

- `measuredRevision`, `before.revision` and `after.revision` are schema-gated to
  40-hex (`check-measurement-binding.mjs:384-388`), so a dash token cannot
  ride in through the manifest. A manifest carrying a literal NUL in
  `measuredRevision` is rejected earlier as
  `manifest_schema_invalid … measuredRevision is not 40-hex`.
- A NUL cannot travel through execve argv either, so the `includes('\0')` half of
  the deleted precheck is effectively unreachable; the only live trigger is
  `--at <leading-dash token>` on a repo that defines a matching dash-named ref.
- Under M2 the emission is still present for every *unresolvable* token (the
  `result.error || status !== 0` guard), so the reason vocabulary stays intact;
  the surviving difference is the policy refusal for a token that happens to
  resolve.

Consequence: the selftest pins the presence of `revision_unresolved` on two
inputs, not the token guard. A one-line edit that deletes the guard keeps both
harnesses green while changing the gate's verdict class from 2 to 0 on a repo
prepared with `refs/heads/-x`. Whether this is a contract change or an
equivalence-class mutant depends on whether the guard is intended as policy
(the code and its comment say it is: “is not a revision token”) — either way the
negative case is missing.

## Residual risk / verification gaps

- **Counter independence is limited.** `bad` and `missingVocab` are both derived
  from the same selftest run (`measure.mjs:150,154-156`); the legacy arm at
  `36240c7` only pins digest/drift/input findings. A coordinated gate+selftest
  edit that preserves membership in the 13-reason vocabulary and the expected
  sets would still count 1. Not run here (out of the “mutate only the gate”
  scope) — **[INFERENCE]**.
- **M2's reachability is narrow.** It needs a repo carrying a dash-named ref
  (`refs/heads/-x`); honest repos do not have one. No digest is bypassed, no
  count is falsified, and no code executes. The defect is detection sufficiency
  of the two harnesses and a silent policy change, not a wrong count at
  `b444ca8`.
- **M1/M3/M4 kill margin is wide, not single-signal.** Each sets `bad=2`,
  `missingVocab=[revision_unresolved]`, `selftest.exit=1` and a non-clean
  summary; a defect in any one check would not mask a reason suppression on the
  exercised paths.
- **Not tested:** mutants that keep `revision_unresolved` emitted but attach it
  to a different input class (would still be caught by `bad>0` unless the
  selftest itself is edited); mutants on the `--legacy` arm (it calls
  `resolveCommit` only for valid 40-hex revisions).
- Suggested repair (for the integrator, not applied here): add a selftest
  negative case that creates `refs/heads/-x` and runs `--at -x`, expecting exit 2
  with exactly `revision_unresolved`; keep the two existing cases. Alternatively,
  if the token refusal is meant to be redundant with `--end-of-options`, delete
  the precheck deliberately and document the relaxed policy — but do not leave it
  unpinned.
- **Out-of-scope observation (no verdict):** at probe time
  `git -C <lane> status --porcelain` reports
  `?? corpus/evidence/round-16/measurement-binding.json` (mtime 2026-10-20
  11:57); that path is not in `b444ca8`'s tree (`git ls-tree b444ca8
  corpus/evidence/round-16/` lists `binding/`, `measure/`, `webmcp/`). The C1
  counter does not read it, so this item is unaffected; flagged for whoever owns
  the C1 manifest artifact.

## Reproduction (all under `/tmp`, lane never mutated)

```
P=/tmp/tabi-mut-revunres-probe
mkdir -p $P/base && cp <lane>/scripts/{check,selftest}-measurement-binding.mjs $P/base/
git clone <lane> $P/lane                       # HEAD = b444ca8…
# per mutant:
git -C $P/lane reset -q --hard b444ca8e024f386124418169e8e400221524bba3
<apply one exact-string mutation to scripts/check-measurement-binding.mjs>
git -C $P/lane -c user.name=probe -c user.email=probe@local commit -q -am '<mutant>'
node $P/lane/scripts/selftest-measurement-binding.mjs --gate $P/lane/scripts/check-measurement-binding.mjs
node $P/lane/.ufo/waves/round-16/measure.mjs $(git -C $P/lane rev-parse HEAD) --claim C1
```

## Tooling

No installs or upgrades. Used `node v24.21.0`, `git 2.56.0` (system), and
`mktemp`/`git clone` under `/tmp`. No pacman transaction attempted; no `~/.omp`
agent DB or credential file opened; REA MCP not used.
