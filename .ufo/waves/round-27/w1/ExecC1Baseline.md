# ExecC1Baseline — C1 before-arm re-run + vacuity control

Seat: ExecC1Baseline (leaf, read-only reporter). Lane: /home/vgpnk/Projects/shokunin/tabi-shokunin.
HEAD at measurement: `5ed6484da66e6bf73654281d2e9ba3703f0c2ef0` (`round-27: permit empty missing-receipt selftest fixture commit`).
Baseline rev under test: `4ad4c77eed78bca1a149e65a7ec6a84b5f71c925` (`round-25 admission erratum: conformance neutrality`), confirmed ancestor of HEAD
(`git merge-base --is-ancestor 4ad4c77… HEAD` → exit 0).

Scope: only the C1 before-arm, the `--repo`-flag control, and the m1LogFindings knockout. No tip-arm judgement, no C2/C3 work.
No tracked file was written; artifacts live in `.ufo/waves/round-27/scratch/ExecC1Baseline/` (gitignored — `git check-ignore -v` → `.gitignore:5:.ufo/waves/*/scratch/`).

---

## 1. Independent baseline re-run

Command (exactly):

```
node scripts/check-selfassessment.mjs --rev 4ad4c77eed78bca1a149e65a7ec6a84b5f71c925 --json \
  > .ufo/waves/round-27/scratch/ExecC1Baseline/baseline.json
```

exit 1 (verdict `failed`, expected: mismatches ≥ 1), 0 bytes on stderr, 40687 B stdout,
sha256 `4d6cb74c7c782a8e225147c2976379c94d7a2782345a115fa7f493f56bf27174`. Runtime 17.9 s.

Key fields:

| field | value |
|---|---|
| schema | `tabi-selfassessment-v1` |
| rev | `4ad4c77eed78bca1a149e65a7ec6a84b5f71c925` |
| **mismatches** | **6** |
| couldNotEvaluate | 89 |
| superseded | 5 |
| clean | false |
| findings[] | 112 |

`counted` (the six, verbatim from the JSON):

| # | class | doc | line | claimed | observed |
|---|---|---|---|---|---|
| 1 | m1-selftest-tally | LOG.md | 335 | 4 | 12 |
| 2 | m1-selftest-tally | LOG.md | 391 | 4 | 12 |
| 3 | m1-selftest-tally | LOG.md | 1090 | 66 | 26 |
| 4 | m1-selftest-tally | LOG.md | 1103 | 66 | 26 |
| 5 | m1-selftest-tally | LOG.md | 1664 | 12 | 13 |
| 6 | m3-unlanded-paths | SCORECARD.md | null | `"landed"` | 18 |

This reproduces the frozen claim's before-arm exactly: "5 LOG-window findings counted at baseline 4ad4c77 (LOG.md:335, :391, :1090, :1103, :1664) + 1 m3 working-tree finding" (`.ufo/waves/round-27/claims.json`, C1.before). Script associations and line texts, read from the JSON:

- 335 → `scripts/check-freshness.mjs`, claimed 4 / observed 12; line text begins ``self-test receipt (`ROUND_CONTRACT_SELFTEST verdict=clean cases=4`)``
- 391 → `scripts/check-freshness.mjs`, claimed 4 / observed 12
- 1090 → `scripts/check-sources.mjs`, claimed 66 / observed 26; text cites `decisions.json (27 decisions, 66 cases)`
- 1103 → `scripts/check-sources.mjs`, claimed 66 / observed 26; text `66/66 cases pass on Chromium 154.0.8037.97/…`
- 1664 → `scripts/round-evidence-audit.mjs`, claimed 12 / observed 13; text ``Non-vacuity: `--selftest` 12/12``

Line numbers were independently re-located in the rev's blob, e.g. `git show 4ad4c77…:LOG.md | sed -n '335p'` returns the `cases=4` receipt line and `sed -n '1664p'` returns the `12/12` line. All five are correct pointers.

Extraction command for the table (both tables) is the same JSON, e.g.:

```
node -e 'const b=require("./.ufo/waves/round-27/scratch/ExecC1Baseline/baseline.json");
for(const n of [335,391,1090,1103,1664]){const f=b.findings.find(x=>x.doc==="LOG.md"&&x.line===n);
console.log(n, f.script, f.claimed, f.observed)}'
```

## 2. Diff against the committed receipt `.ufo/waves/round-27/selfassess-baseline-raw.json`

Committed file: 40685 B, sha256 `831650a57e17f3b8159fec1d6a207146c2f64ef34f06848e3f38b77ce9bf5963`.

```
diff .ufo/waves/round-27/scratch/ExecC1Baseline/baseline.json \
     .ufo/waves/round-27/selfassess-baseline-raw.json
```

→ exactly **two changed lines**, both the m3 observed value:

```
1121c1121
<       "observed": 18,      (findings[]  m3-unlanded-paths)
1166c1166
<       "observed": 6        (counted[]   m3-unlanded-paths)
```

So the re-run is **not byte-identical**, and the difference is *not* the `rev` field (both files carry `4ad4c77…`). It is confined to the single live term:

```
node -e '…normalise m3.observed to "<live>" in both files…' → equal-modulo-m3-observed: true
```

i.e. with `m3-unlanded-paths.observed` replaced by a placeholder, my run and the committed receipt are **equal** (same key order, same 112 findings, same 6 counted, same couldNotEvaluate 89, same superseded 5). Everything the C1 counter asserts is byte-for-byte reproducible; only m3's raw count is not.

### Why (observed, not inferred)

`m3Findings` is a working-tree liveness probe, `scripts/check-selfassessment.mjs:379-389`:

```js
const r = spawnSync("git", ["-C", repo, "status", "--porcelain", "--untracked-files=all"], …);
const paths = r.stdout.split("\n").filter(Boolean);
if (!paths.length) return [];
return [{ class: "m3-unlanded-paths", … claimed: "landed", observed: paths.length, … }];
```

It emits **at most one finding**, whose `observed` is the live porcelain line count — independent of `--rev`. Measured drift across six runs in a 30-minute window (each value read from the run's own JSON):

| run | mtime | m3.observed | file |
|---|---|---|---|
| L1 receipt | 14:09:46 | 6 | `.ufo/waves/round-27/selfassess-baseline-raw.json` |
| earlier seat run | 14:32 | 4 | `scratch/ExecC1Baseline/baseline.pre-rerun.json` |
| this seat | 14:36:45 | 18 | `scratch/ExecC1Baseline/baseline.json` |
| this seat (`--repo` control) | 14:38 | 27 | `scratch/ExecC1Baseline/baseline-repo-flag.json` |
| this seat (mutant) | 14:37 | 26 | `scratch/ExecC1Baseline/baseline-nolog.json` |

Live corroboration: `git status --porcelain --untracked-files=all | wc -l` → 23 at 14:37, 34 at 14:39, 36 at 14:39:14 — the wave-1 report files under `.ufo/waves/round-27/w1/` and in-flight tracked edits (`corpus/QUALITY.md`, `corpus/README.md`, `corpus/SOURCES.md`, `corpus/knowledge/redirect-and-retry-after-semantics.md`) are *not* gitignored, so every sibling write moves this number.

Fixture proof of semantics (throwaway repo, `mktemp -d`; `git -C "$D" rev-parse --show-toplevel` == `$D` checked before first commit):

```
D=$(mktemp -d); git -C "$D" init -q; # SCORECARD.md with "## Round 25 — executed disposition", LOG.md, scripts/check-fixture.mjs; git -C "$D" add -A; commit
node scripts/check-selfassessment.mjs --repo "$D" --rev HEAD --json   # clean tree
  → {"mismatches":0,"findings":[]}
touch "$D/untracked-a" "$D/untracked-b"
node scripts/check-selfassessment.mjs --repo "$D" --rev HEAD --json   # 2 untracked paths
  → {"mismatches":1,"findings":[{"class":"m3-unlanded-paths","round":25,"observed":2}]}
```

Artifacts: `scratch/ExecC1Baseline/fixture-clean.json`, `fixture-dirty.json`, `fixture-dir.txt`.
Conclusion: m3 contributes exactly **one** finding whenever the tree is dirty, so its `observed` value never changes the mismatch arithmetic (6 stays 6); it only makes the receipt's raw text unresolvable outside the instant it was captured.

### `--repo` flag control

```
node scripts/check-selfassessment.mjs --repo /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --rev 4ad4c77eed78bca1a149e65a7ec6a84b5f71c925 --json
```

→ mismatches **6**, `counted` identical to §1 element-for-element (same five LOG lines + m3), findings 112, i.e. the `--repo` form is equivalent to the cwd form. This is the precondition for reading the mutant's §3 result as caused by the knockout and not by the flag.

`node scripts/check-selfassessment.mjs --selftest --json` (HEAD/worktree script): `cases: 17, passed: 17, ok: true`, exit 0. Extracted rev-blob script `git show 4ad4c77…:scripts/check-selfassessment.mjs > scratch/…/gate-at-baseline.mjs` → `--selftest` `cases: 13, passed: 13, ok: true`. That confirms the claimed "selftest 13 → 17" bound on both ends. (`git diff --stat HEAD -- scripts/check-selfassessment.mjs` is empty; the worktree gate equals HEAD's, sha256 `de5d6676b767d31ec52e2831a30dd8899dce99abe4b034e24440176f1ec7faab`.)

## 3. Vacuity control — knockout of the LOG window

`m1LogFindings` has exactly one call site (`grep -n m1LogFindings scripts/check-selfassessment.mjs` → definition at :267, call at :399), so blanking that expression removes the whole extension.

Mutant: `scripts/check-selfassessment.mjs` copied to `scratch/ExecC1Baseline/check-selfassessment-mut-nolog.mjs`, one line changed (`diff` → 1 hunk, nothing else):

```js
-  const logFindings = logText === null ? [] : m1LogFindings(repo, rev, logText, cache);
+  const logFindings = []; // VACUITY MUTANT (ExecC1Baseline): m1LogFindings call removed; logText deliberately unused
```

Mutant run (exit 1, 35787 B, stderr empty):

```
node .ufo/…/scratch/ExecC1Baseline/check-selfassessment-mut-nolog.mjs \
  --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --rev 4ad4c77… --json \
  > .ufo/…/scratch/ExecC1Baseline/baseline-nolog.json
```

| field | unmodified gate | knockout | delta |
|---|---|---|---|
| mismatches | 6 | **1** | −5 |
| findings[] | 112 | 97 | −15 |
| `doc: "LOG.md"` findings | 15 | **0** | −15 |
| `m1-selftest-tally` / SCORECARD.md | 20 | 20 | 0 |
| all `m2-receipt-exit` findings | 76 | 76 | 0 |
| counted | 5 LOG + 1 m3 | 1 m3 only (`observed` 26) | −5 LOG |
| couldNotEvaluate | 89 | 82 | −7 |
| superseded | 5 | 4 | −1 |

The sole surviving counted finding is `m3-unlanded-paths` (the noise floor). Every one of the five LOG findings disappears; the SCORECARD m1 window and the whole m2 family are untouched. **The baseline findings are produced by the LOG window and by nothing else.** The knock-on drops (couldNotEvaluate −7, superseded −1) are themselves all LOG-window findings, corroborating that the window owns the entire LOG.md delta of 15.

Positive control inside the window (rules out "the window flags every tally"): of the 7 plain (non-superseded, evaluable) LOG findings, only 5 are counted; LOG.md:254 and :275 both read claimed 12 / observed 12 and are correctly *not* counted. Full LOG-window set at the baseline rev, for the record: lines 221, 254, 275, 335, 391, 471, 484, 972, 994, 1056, 1079, 1090, 1103, 1664, 1812.

### Mutant vs selftest (the extension's own red)

`node scratch/…/check-selfassessment-mut-nolog.mjs --selftest --json` → exit 3, `ok: false`, **passed 15 / cases 17**, failing cases:

```
m1-log-stale-tally              expectedExit 1, got 0, expectedClasses ["m1-selftest-tally"], got []
m1-log-wrong-number-correction  expectedExit 1, got 0, expectedClasses ["m1-selftest-tally"], got []
```

Both are the two new LOG-arm cases, and they are load-bearing: the knockout is caught by the selftest, while the other 15 cases still pass (so the failure is specific, not a global collapse).

## 4. Observations, inference, unknowns

Observed:
- mismatches = 6 at `4ad4c77…` under the extended counter: five LOG-window findings at :335/:391/:1090/:1103/:1664 plus one m3 working-tree finding. Reproduced twice (§1, §2 `--repo`), both times with an identical `counted` list.
- The five LOG findings vanish and only the m3 floor remains when `m1LogFindings` is not called; m1-SCORECARD and m2 are bit-stable across that change.
- The committed baseline receipt differs from a fresh run in exactly the m3 `observed` field (6 vs 18/27), by a mechanism demonstrated on a fixture.
- Production selftest 17/17; rev-blob selftest 13/13.

Inference (marked as such):
- The receipt's `observed: 6` corresponds to a working tree that held six porcelain entries when the L1 captured it at 14:09:46; that state is gone and cannot be reconstructed read-only. Any future "byte-identical" acceptance check on this receipt must either compare modulo `m3-unlanded-paths.observed` or be run from a clean checkout.

Unknown / not attempted:
- Which specific six paths were dirty at 14:09:46 (unknown; no snapshot exists).
- Tip-arm behaviour (mismatches=0 expected) and the correction block's supersession — out of scope for this seat; note only that `scratch/ExecC1Baseline/tip-head.json` (a pre-existing artifact in this scratch dir, not produced by this seat) reads `mismatches: 1`, `counted: [m3]`, which is consistent with the tip having zero LOG findings, and that `selfassess-tip-raw.json` reads `mismatches: 5` at a different capture.

## 5. Risks to the round

1. **Receipt non-reproducibility (low severity, counter-level none).** `selfassess-baseline-raw.json` cannot be regenerated byte-identically while the working tree is dirty, because m3 samples it live. The C1 counter (`mismatches`) is immune, but a reviewer diffing bytes will see a diff. Recommend the L1 phrase the acceptance as "identical modulo `m3-unlanded-paths.observed`" or capture the receipt with `git status --porcelain --untracked-files=all | wc -l` recorded alongside.
2. **Noise floor is live.** m3 will read 30+ during wave 1 and near 0 in a clean post-merge tree; anyone expecting `mismatches=0` at the tip must either land the tree clean or subtract the m3 term. (The frozen claim already budgets "+1 m3 working-tree"; that budget holds — m3 is one finding, always.)
3. **Tracked files are being modified in flight** (`corpus/QUALITY.md`, `corpus/README.md`, `corpus/SOURCES.md`, `corpus/knowledge/redirect-and-retry-after-semantics.md` at 14:39:14). Not this seat's scope, but the corpus row of C3 and the m3 term both see them; the L1 should re-read them after integration.

## 6. Artifacts (all under `.ufo/waves/round-27/scratch/ExecC1Baseline/`, none tracked)

| file | bytes | note |
|---|---|---|
| `baseline.json` | 40687 | sha256 `4d6cb74c…` — this seat's re-run at the baseline rev |
| `baseline.err` | 0 | |
| `baseline-repo-flag.json` | 40687 | `--repo` equivalence control (m3 `observed` 27) |
| `check-selfassessment-mut-nolog.mjs` | 30896 | single-line knockout mutant |
| `baseline-nolog.json` | 35787 | mutant at baseline rev (mismatches 1) |
| `mut-selftest.json` | 3311 | mutant selftest 15/17, two named failures |
| `prod-selftest.json` | 3378 | 17/17 at HEAD |
| `gate-at-baseline.mjs` / `selftest-at-baseline.json` | — / 2575 | rev-blob gate, 13/13 |
| `fixture-clean.json` / `fixture-dirty.json` / `fixture-dir.txt` | — | m3 semantics fixture |
| `baseline.pre-rerun.json` | 40685 | pre-existing run (m3 4), preserved before overwrite |

Tooling: none installed or upgraded (node v24.21.0 pre-existing). No pacman invoked. No writes outside this scratch dir and the report file; no git write commands; no network fetches in this item.
