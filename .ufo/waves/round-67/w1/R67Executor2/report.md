# R67Executor2 — C2 instruments: receipt-provenance gate v4 (F7 repo-escape repair)

Seat: Tabi round 67, wave w1, seat R67Executor2 (leaf executor). Scope honoured: only
`.ufo/waves/round-67/counters/`, `.ufo/waves/round-67/c2/`, `.ufo/waves/round-67/w1/R67Executor2/`.
No tool installs were needed (node v24.21.0 preexisting); scratch was
`/fast/scratch/hyaku/tabi-r67/R67Executor2` and was deleted before yield.

## Deliverables

| File | sha256 |
|---|---|
| `counters/check-receipt-provenance-v4.mjs` | `a71b1cf162f60cba72489fd326721967b7180b7534b403db5de1ba30a0e1a56b` |
| `c2/fixture/X/outside.mjs` | `bdab21484c82671abfb05e5225d502a65a85dfe0ea991c4061123d85ab8da20f` |
| `c2/fixture/X/repo/instruments/a.mjs` | `037ecd1db38c230c248787e60fd7bfc0cb0101b187b59535b6e7483be762d350` |
| `c2/fixture/X/repo/controls/matrix-esc.json` | `872d277e9593ac28a3f78ce5c9b92ecf8b9176b5cbc90009dc41c322acccce68` |
| `c2/fixture/X/repo/controls/esc.command.json` | `8492b0fb68ba20f3a04833eaa710ef1818c441f1be60889aadf44904ec8e8c00` |
| `c2/fixture/X/repo/controls/matrix-esc.command.json` | `85223ec7c02031328155a8ebef5ccb5ce5118f2f88b426a48dc6823f5c997bc6` |
| `c2/fixture/X/repo/controls/esc.stdout` | `e5f1eb4d806641698a35efe20e098efd20d7d57a9b90ee69079d5bb650920726` |
| `c2/controls/red-v3-escape.txt`, `c2/controls/green-v4-escape.txt` | evidence files (quoted CLI output verbatim) |
| `c2/mutants/M-E1-guard-removed.mjs`, `M-E2-startswith-only.mjs`, `M-E3-absolute-only.mjs` | byte copies of v4 (`a71b1cf1…`) with one guard edit each |

## A. v4 = byte copy of v3 + checkMatrix guard only

`cp` of `.ufo/waves/round-66/counters/check-receipt-provenance-v3.mjs` verified:
pre-edit sha256 `b683039e5eb373ffc0fecbfca7888c05dd6ebe32203e332382f3777b49f0ca30` == v3's.
Edits: header comment, `checkMatrix` binding block, selftest additions. `CHECK_IDS`,
CLI flags, `evaluate`, `checkReceipt`, exit codes: untouched.

Guard semantics (relative `inp.path` only): candidates `path.join(repo, rel)` and
`path.join(path.dirname(file), rel)`; a candidate that is a file but resolves outside the
resolved `--repo` tree (`fs.realpathSync` when it exists, else `path.resolve`; boundary =
repo path + `path.sep` or equal) does not count as a hit; if every hit is refused, emit
`matrix-input` detail `input escapes repo: <rel>`. Absolute inputs: v3 behaviour
unchanged. `input absent` / `input digest mismatch` details preserved for the surviving-hit
path.

### v3 selftest cases changed: none in expectation; one layout line

All 14 v3 selftest cases keep their ids and expected verdicts. One setup line changed:
`const dir = path.join(root, 'controls')` → `path.join(repo, 'controls')` (controls dir now
inside the synthetic repo, as controls dirs are in real lanes). Reason, verified by
simulation before the edit: under the literal v4 rule, the v3 case
`matrix-input-relative-dir-base` (`input.path: 'good.command.json'`, negate) resolves via
the dir-base candidate to `<root>/controls/good.command.json`, which is outside the
synthetic repo `<root>/repo`; the guard would refuse it and flip the case to red. With the
layout moved, every v3 case produces its v3 verdict under v4 (confirmed by the 17/17 run
below; the five v3 binding cases and the eight CHECK_IDS cases all pass unchanged). This
deviation from "there should be none" is disclosed here rather than silently absorbed.

### v4 selftest additions (count reported)

- `matrix-input-escape-v4`: `../outside.mjs` pinned to a real file outside the synthetic
  repo → refused, detail `input escapes repo: ../outside.mjs`.
- `matrix-input-escape-deep-v4`: `instruments/../../outside.mjs` (no leading `..`) →
  refused, detail `input escapes repo: instruments/../../outside.mjs`. Kills M-E2.
- `matrix-input-rel-inside-v4` (negate): legit relative `instruments/a.mjs` still passes.

Commands and exit codes (scratch `/fast/scratch/hyaku/tabi-r67/R67Executor2`):
- `node …/round-66/…/check-receipt-provenance-v3.mjs --selftest --scratch <scratch>` →
  `TABI_R64_PROVENANCE_SELFTEST verdict=clean cases=14 passed=14`, exit 0 (baseline intact).
- `node …/round-67/counters/check-receipt-provenance-v4.mjs --selftest --scratch <scratch>` →
  `TABI_R64_PROVENANCE_SELFTEST verdict=clean cases=17 passed=17`, exit 0; the `--json`
  rerun listed all 17 cases `ok:true` (14 v3 + 3 v4), exit 0.

## B. Escape fixture (`c2/fixture/X/`)

`X/outside.mjs` (sample file, outside repo), `X/repo/instruments/a.mjs`,
`X/repo/controls/{esc.stdout, esc.command.json, matrix-esc.command.json}` (schema
`tabi-command-receipt-v1`, built exactly as the v3 selftest builds receipts: argv
`["node","instruments/a.mjs","--json"]`, `exit:0`, `stdoutFile`+`stdoutSha256`, inputs
`[{path:'instruments/a.mjs', sha256:aSha}]`, `rev:'worktree'`), and
`matrix-esc.json` = `{"input":{"path":"../outside.mjs","sha256":"bdab2148…"}}` (digest of
`X/outside.mjs`). Both receipts pass v3's receipt checks, so any red/green difference
comes solely from `checkMatrix`.

## C. Red-before / green

- RED: `node …/round-66/…/check-receipt-provenance-v3.mjs --dir <X/repo/controls> --repo <X/repo> --json`
  → exit **0**, `failures:0`, `ok:true` — v3 admits the escape (candidate
  `X/outside.mjs` exists, sha matches). Evidence: `c2/controls/red-v3-escape.txt`.
- GREEN: same command with v4 → exit **1**, `failures:1`,
  `byCheck {"matrix-input":1}`, finding detail `input escapes repo: ../outside.mjs`.
  Evidence: `c2/controls/green-v4-escape.txt`.

## D. Mutants (byte copies of v4, one guard edit each)

| Mutant | `--selftest` result | Escape fixture | Killed by |
|---|---|---|---|
| M-E1 guard removed entirely | exit 1, `verdict=red cases=17 passed=15`; FAIL `matrix-input-escape-v4`, `matrix-input-escape-deep-v4` | exit **0** (`ok:true`, admits escape) | both selftest escape cases and the fixture (expected 1, got 0) |
| M-E2 guard reduced to `startsWith('..')` | exit 1, `verdict=red cases=17 passed=16`; FAIL `matrix-input-escape-deep-v4` only | exit **1** (green still passes — `../outside.mjs` starts with `..`) | selftest case `matrix-input-escape-deep-v4` (nested escape without a leading `..` normalises outside repo and is accepted by the mutant) |
| M-E3 guard applied to absolute inputs only | exit 1, `verdict=red cases=17 passed=15`; FAIL `matrix-input-escape-v4`, `matrix-input-escape-deep-v4` | exit **0** (`ok:true`, relative escape passes) | both selftest escape cases and the fixture |

Every mutant is killed; M-E2 is killed only by the deep-escape selftest case, which is why
that case exists. Mutant battery command pattern:
`node <mutant> --selftest --scratch <scratch>; node <mutant> --dir <X/repo/controls> --repo <X/repo> --json`
— all runs executed this session, exit codes quoted above.

## Acceptance check

- v4 selftest exit 0 with every case passing, count reported (17/17): ✅
- escape fixture red on v3 (exit 0): ✅ — green on v4 (exit 1, `matrix-input` escape detail): ✅
- mutant kill table complete (3/3 killed, kill sites named): ✅
- v3 selftest cases changed: none in expectation; one layout line disclosed above.

## Risks / notes for the L1

- The escape rule necessarily rejects a dir-base candidate that lies outside `--repo`
  (the v3 selftest's synthetic layout was the only place that happened). Production
  controls dirs live inside the lane repo, so legit dir-base relative inputs are unaffected.
- `matrix-command` sibling receipts are still required per matrix file; unchanged from v3.
- Receipt-level `inputs` (`readAt`) remain unguarded by design — item A scopes the change
  to `checkMatrix` only; a receipt input named `../x` keeps v3 behaviour in v4.
