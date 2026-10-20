# MutArgvUnsupported — mutation probe: gate reason `argv_unsupported`

Author-side attack item (W2 falsify), lane `tabi-shokunin`, snapshot
`b444ca8e024f386124418169e8e400221524bba3` (commit A `8f7feb3` + counter repair).
Read-only on the lane: every mutation was applied to copies under `mktemp -d`;
the real counter was exercised in a `git clone --no-hardlinks` under `/tmp`.
This is an author-side recommendation, not a non-author certification.

## Verdict

**BREAKS (weakening branch) — HOLDS (disable branch).**

- Disabling the code that emits `argv_unsupported` (total predicate disable, or a
  dead emission branch) makes the selftest **red** (exit 1, 3 case FAIL) and the
  C1 counter **0** at a committed mutant. That half holds.
- A one-token **weakening** of the same predicate — path equality replaced by
  basename equality (`argv[1].split('/').pop() === counterPath.split('/').pop()`)
  — survives: selftest `verdict=clean cases=43 reasons=13`, counter
  `c1_binding_contracts=1`, `failures=[]`. It also lets the gate **execute an
  undigested counter** and report `verdict=clean` (demonstrated below), which is
  the exact hole the gate's own comment `scripts/check-measurement-binding.mjs:510`
  (“Never execute unbound bytes”) promises is closed.

The C1 counter adds **no independent coverage** of argv semantics: it re-runs the
same selftest from committed blobs and only adds a vocabulary-usage check
(`.ufo/waves/round-16/measure.mjs:150,157`). It computes `gateSha256` but never
compares it to any recorded constant (`measure.mjs:121`), so the gate's argv
behaviour is bound only as far as the selftest pins it.

## Axes

1. **Kill strength** — does the selftest go red when the `argv_unsupported`
   predicate/emission is removed?
2. **Coverage granularity** — is each conjunct of `argvSupported` individually pinned?
3. **Counter inheritance** — does the C1 counter also count 0, or does it add
   coverage of its own?
4. **Consequence** — does a surviving weakening have a real semantic effect
   (unbound execution) or only a cosmetic one?

## Baseline (lane, read-only)

```
$ node .ufo/waves/round-16/measure.mjs b444ca8e024f386124418169e8e400221524bba3 --claim C1
{"revision":"b444ca8...","c1_binding_contracts":1,
 "gateSha256":"5150611c3d597fd7a70314e2d7cd835be62c5688e521297803e4907fdaa0d6fb",
 "selftestSha256":"8c5426f254b76e4c7c0a0374d513c33f2832a5dfff5e92b938f4bd9d7168f2ae",
 "selftest":{"exit":0,"cases":43,"summary":"MEASUREMENT_BINDING_SELFTEST verdict=clean cases=43 reasons=13","bad":0,"clean":21,"missingVocab":[]},...}

$ node .ufo/waves/round-16/measure.mjs e38d2599a922cb729186353830fff8e159b4fef0 --claim C1
{"revision":"e38d259...","c1_binding_contracts":0,"gateSha256":null,"selftestSha256":null,
 "failures":["gate or selftest absent at revision"],...}

$ node <tmp>/selftest-measurement-binding.mjs --gate <tmp>/check-measurement-binding.mjs
MEASUREMENT_BINDING_SELFTEST verdict=clean cases=43 reasons=13      # exit 0
```

Claim shape reproduced: 0 → 1, with the gate/selftest present at the measured
revision only.

The predicate under attack (`scripts/check-measurement-binding.mjs:401-407`):

```js
function argvSupported(argv, counterPath) {
  if (!Array.isArray(argv)) return false;
  if (!argv.every((token) => typeof token === 'string' && !token.includes('\0'))) return false;
  if (argv[0] !== 'node') return false;
  if (argv[1] !== counterPath) return false;
  return argv.filter((token) => token === REV_TOKEN).length === 1;
}
```

The selftest pins only three of these conjuncts
(`scripts/selftest-measurement-binding.mjs:256-266`): missing `{REV}`, bad runner,
wrong path. There is no case for two `{REV}` tokens, no case for the same
basename in a different directory, and no case for a non-string/NUL element.

## Mutation matrix (copies in `mktemp -d`, lane untouched)

Driver: `/tmp/argvmut-driver.mjs` (copies both scripts into `<dir>/scripts/`,
applies one exact-string mutation to the gate, runs the selftest with `--gate`,
then emulates `countC1` line-for-line). Command per row:
`node <tmp>/selftest-measurement-binding.mjs --gate <tmp>/check-measurement-binding.mjs`.
Counter column is the real `countC1` behaviour, confirmed below on commits.

| id | mutation (only the `argv_unsupported` predicate/emission) | selftest | C1 counter |
|---|---|---|---|
| A1 | `argvSupported` → `return true` first | exit **1**, FAIL `argv_unsupported_missing_rev`, `_bad_runner`, `_wrong_path` | **0** |
| A2 | emission branch `if (!supported)` → `if (false && !supported)` | exit **1**, same 3 FAIL | **0** |
| A3 | drop `argv[0] !== 'node'` | exit **1**, FAIL `argv_unsupported_bad_runner` | **0** |
| A4 | drop `argv[1] !== counterPath` (`if (false)`) | exit **1**, FAIL `argv_unsupported_wrong_path` | **0** |
| **A5** | `argv[1] !== counterPath` → basename equality | exit **0**, `verdict=clean cases=43 reasons=13` | **1** |
| **A6** | `{REV}` count `=== 1` → `>= 1` | exit **0**, clean | **1** |
| **A7** | drop string/NUL element check | exit **0**, clean | **1** |
| A8 | reason literal `argv_unsupported` → `argv_unsupported_weakened` | exit **1**, same 3 FAIL | **0** |

A1–A4/A8 are killed; A5–A7 survive with the full 43-case selftest green and
`missingVocab=[]`.

## Counter confirmation on committed mutants (real `measure.mjs`, `/tmp` clone)

```
$ git clone --no-hardlinks /home/vgpnk/Projects/shokunin/tabi-shokunin /tmp/tabi-clone
$ # per mutant: apply mutation, git add scripts/check-measurement-binding.mjs, commit
$ node .ufo/waves/round-16/measure.mjs <mutant-sha> --claim C1
```

| mutant | commit | `c1_binding_contracts` | `failures` |
|---|---|---|---|
| baseline `b444ca8` | `b444ca8` | **1** | `[]` |
| A1 | `e4f1392e5be3d1fc69a074e95d639b8a01737bc3` | **0** | `["selftest exit 1","selftest summary absent, not clean, or case count mismatch","3 case lines not exact PASS","vocabulary not exercised: argv_unsupported"]` |
| A2 | `219fa958b77f8e83068b2849ee0dccc5284077d1` | **0** | same four |
| A4 | `3ec4473f020693a877464961a106eeb69153625f` | **0** | `["selftest exit 1",...,"1 case lines not exact PASS"]` |
| **A5** | `11996cd096ee1ff1abc7be28f701209dfa9350c7` | **1** | `[]` (`gateSha256=e2f047059986327c7c3a137b2c63e71de512e881f2a720a7174426430ccf9af7`) |
| **A6** | `406014c25f68579af293b26b42539807abb4afa6` | **1** | `[]` |
| **A7** | `0a5cef277ee93613a362d5feea9ea5ea096c9e71` | **1** | `[]` |

So the answer to “would the C1 counter also count 0?” is: **yes for disablement
(A1/A2/A4), no for weakening (A5/A6/A7)**. The counter goes 0 only because the
selftest went red and/or stopped exercising the vocabulary; it does not detect a
semantically weaker but vocabulary-preserving gate.

## Finding 1 (High) — A5 bypasses the digest guard and reports clean

The gate refuses to reproduce unless the *worktree* counter at `counter.path`
matches the recorded blob (`check-measurement-binding.mjs:509-521`), then spawns
`counter.argv` (`:422`). Equality of `argv[1]` and `counterPath` is the only thing
tying the executed file to the digested one. Under A5, a manifest may declare
`counter.path: "measure.mjs"` (digest checked, untouched) and
`argv: ["node","evil/measure.mjs","{REV}"]`; `isCleanRepoPath` accepts that argv
path because argv elements are only checked for being an array
(`:367-372`), and reproduction executes `evil/measure.mjs`.

End-to-end probe (`/tmp/argvmut-exploit.mjs`, fixture repo with
`rev0=399d6337…`, `rev1=76bfd6ae…`, manifest commit `7bc244b8…`; the evil counter
writes `evil-executed.txt` and returns 0 for `rev0`, 1 for `rev1`):

```
# strict committed gate:  --repo <fixture> --check <manifest> --reproduce
MEASUREMENT_BINDING verdict=failed claims=1 bound=0
finding claim=C1 reason=argv_unsupported detail=argv=["node","evil/measure.mjs","{REV}"] requires [node, measure.mjs, ...] with exactly one {REV} token
exit=1  evil-executed.txt present: false          # refused before any spawn

# A5 mutant gate, same fixture and flags
MEASUREMENT_BINDING verdict=clean claims=1 bound=1
exit=0  evil-executed.txt present: true  content="executed at 7bc244b87dfe7fc66be0f1b5aa9e8f87b1f2733b"
```

Consequence: a gate that has been weakened in exactly the way the selftest does
not test still reports `clean`, and the C1 counter still reads 1 — while
arbitrary (undigested) code runs under the reproduction path. This is a
one-token mutation, not a contrived rewrite.

## Finding 2 (Low) — A6/A7 survive without semantic consequence

- A6 (`{REV}` count `>= 1`) admits two `{REV}` tokens; both arms map to the same
  revision, so the reproduced counts are unchanged. Coverage gap only.
- A7 (dropped element type/NUL check) admits a non-string or NUL-bearing token;
  `spawnSync` rejects it inside `reproduceArm`'s `try` (`:421-431`) and it is
  reported as `counter_failed` instead of `argv_unsupported`. Reason-class
  misattribution only.

Both are reason-vocabulary precision gaps, but they confirm the same underlying
defect: the selftest pins the presence of the reason, not the predicate's
semantics.

## Residual risk / verification gaps

- The committed C1 manifest (`corpus/evidence/round-16/measurement-binding.json`)
  uses the exact path (`".ufo/waves/round-16/measure.mjs"`), so today's C1=1 is
  not produced by the weakened behaviour; the defect is in mutant-detection
  sufficiency and in a reachable reproduction-path hole, not in the recorded
  count at `b444ca8`.
- A5/A6/A7 were verified against the real counter only in a `/tmp` clone with
  locally committed mutants; the lane itself was never mutated or committed to.
- The mutant gate's argv acceptance was exercised via `--check` + `--reproduce`.
  `--legacy` does not consult `argvSupported`, so the legacy arm is unaffected
  (findings identical for every mutant, as observed).
- Suggested repair (for the integrator, not applied here): add negative cases for
  a same-basename/different-directory `argv[1]` and for two `{REV}` tokens (plus
  a non-string/NUL element); equivalently, pin `argv[1] === counterPath` in a
  dedicated assertion rather than relying on the wrong-path case alone.
- Scope note: this report attacks the gate/selftest/counter chain for
  `argv_unsupported` only; the C2 claim and the WebMCP receipt are out of scope.

## Tooling

No installs or upgrades. Used `node v24.21.0`, `git 2.56.0` (system), and
`mktemp`/`git clone` under `/tmp`. No pacman transaction attempted; no
`~/.omp` agent DB or credential file opened; REA MCP not used.
