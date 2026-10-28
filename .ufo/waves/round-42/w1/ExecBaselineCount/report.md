# ExecBaselineCount — baseline count transcription check (tabi round 42, w1)

Seat: `ExecBaselineCount` (leaf). Judged axis: calibration. Milestone: baseline transcription check.
Repo (read-only): `/home/vgpnk/Projects/shokunin/tabi-shokunin`. HEAD at measurement:
`0081bfdb93b6bd1bf2853bb128996f1a976b7218` ("round-42: SCORECARD declared-claims section (frozen predicates, C1/C2)").
Declared baseline (claims.json `.baseline`): `34e177959d1b7ce04afb85a001420e02631ce79e`.
Frozen-claims commit named in dispatch: `9b6de3a19de11abdb80e82a1310abc64a40215bb` (verified present, commit type).
Scratch root `/fast/scratch/hyaku/tabi-r42/ExecBaselineCount` used and deleted at end (see Cleanup).

Rev identity (`git cat-file -t`, `git log -1`):

| rev | type | date | subject |
|---|---|---|---|
| fecbdf0a3aa79ce17bce3ef7338f69112f604f88 | commit | 2026-10-27 17:28:51 -0300 | round-40 verifier spot-check (integrator, hyaku): non-author admit/reject |
| 34e177959d1b7ce04afb85a001420e02631ce79e | commit | 2026-10-28 08:58:58 -0300 | round-41 verifier spot-check (integrator, hyaku): non-author admit/reject |
| 9b6de3a19de11abdb80e82a1310abc64a40215bb | commit | 2026-10-28 12:07:26 -0300 | round-42: freeze C1 + C2 claims and checker; land r41 defects D1/D2/D3; open S149; baseline red control 34e1779 |

---

## 1. Round-41 evidence tree count at the round-41 baseline rev

Command (exactly as dispatched):

```
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin ls-tree -r --name-only fecbdf0a3aa79ce17bce3ef7338f69112f604f88 -- corpus/evidence/round41 | wc -l
```

Output:

```
0
```

Exit status `0`. **Matches the expected 0.**

Zero-semantics guard (a `0` from a mistyped/absent pathspec would be vacuous), same rev:

```
git cat-file -t fecbdf0a3aa79ce17bce3ef7338f69112f604f88:corpus/evidence/round41
→ fatal: path 'corpus/evidence/round41' exists on disk, but not in 'fecbdf0a3aa79ce17bce3ef7338f69112f604f88'
git ls-tree -r --name-only fecbdf0a... -- corpus/evidence | wc -l
→ 3213
git ls-tree --name-only fecbdf0a...:corpus/evidence | sed -n '1,6p'
→ fleet-round-1-freshness
  kaika-fleet-round-1
  pstack-20261015-r01
  pstack-20261015-r02
  pstack-20261015-r03
  pstack-20261015-r04
```

So the count is a faithful **path-absent-at-REV** zero (the parent prefix resolves and yields 3213 files there; only
`round41/` is absent), not a mistyped-path artefact. For cross-reference: at HEAD the same path is a tree with **2** files
(`git ls-tree -r --name-only HEAD -- corpus/evidence/round41` →
`corpus/evidence/round41/playwright-egress/receipt.json`, `.../receipt.witness.json`), i.e. D1 landed after the baseline.

## 2. Round-42 evidence tree count at the declared baseline rev

Command:

```
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin ls-tree -r --name-only 34e177959d1b7ce04afb85a001420e02631ce79e -- corpus/evidence/round42 | wc -l
```

Output:

```
0
```

Exit status `0`. **Matches the expected 0.**

Zero-semantics guard:

```
git cat-file -t 34e1779...:corpus/evidence/round42
→ fatal: path 'corpus/evidence/round42' exists on disk, but not in '34e177959d1b7ce04afb85a001420e02631ce79e'   (exit 128)
```

Same class of zero: **path absent at the baseline rev** (pre-data), rather than a committed-but-empty directory.

## 3. `c1-baseline-noop.out` at HEAD vs re-derived value (1)

```
git show HEAD:.ufo/waves/round-41/controls/c1-baseline-noop.out
```

Output (verbatim, 343-byte blob):

```
# tabi round 42: populated per round-41 verifier routed defect D3 (was committed empty).
# Re-derived 2026-10-28 at the round-41 baseline; value unchanged from the round-41 prose record:
#   git -C /home/vgpnk/Projects/shokunin/tabi-shokunin ls-tree -r --name-only fecbdf0a3aa79ce17bce3ef7338f69112f604f88 -- corpus/evidence/round41 | wc -l
0
```

Faithfulness checks against (1):

- Command shape: `git show HEAD:... | grep -c '<exact command string>'` → `1`. The embedded command line is byte-identical to
  the one I executed in item 1 (same `git -C`, same `-r --name-only`, same rev, same pathspec, same `| wc -l`).
- Digit: `git show HEAD:... | tail -n1 | od -c` → `0000000   0  \n` — final line is exactly the digit `0` plus newline.
- Blob size at HEAD: `git cat-file -s HEAD:...` → `343`.
- Blob size at the declared baseline rev: `git cat-file -s 34e1779...:.ufo/waves/round-41/controls/c1-baseline-noop.out` → `0`,
  which is precisely what the committed red control asserts (`r3-baseline-file-empty`: "committed blob is 0 bytes").
- `git hash-object` of the worktree file == committed blob: both `9a90061`.

**Transcription faithful: same command shape, digit 0.**

## 4. `c1-baseline-tree-count.txt` vs re-derived value (2)

```
cat .ufo/waves/round-42/controls/c1-baseline-tree-count.txt
```

Output (verbatim):

```
0
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin ls-tree -r --name-only 34e177959d1b7ce04afb85a001420e02631ce79e -- corpus/evidence/round42 | wc -l → 0 (run 2026-10-28, tabi round 42 pre-data)
```

Faithfulness checks:

- Byte view (`od -c`) confirms line 1 is exactly `0\n`, then the command line.
- Exact-substring comparison in Python (`line.split(' → ')[0]` vs the command executed in item 2) → `MATCH`; parsed value → `0`.
- `git hash-object` of worktree file == committed blob: both `51cf054`. No dirty state
  (`git status --porcelain -- .ufo/waves/round-42/controls .ufo/waves/round-41/controls` → empty).

**Transcription faithful: same command, digit 0.**

## 5. Frozen checker at the declared baseline rev

```
node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-42/counters/check-routed-defects-round42.mjs \
  --rev 34e177959d1b7ce04afb85a001420e02631ce79e \
  --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --json
```

Exit status: **`1`** (expected). stdout (verbatim):

```json
{
 "schema": "tabi-r42-routed-defects",
 "rev": "34e177959d1b7ce04afb85a001420e02631ce79e",
 "predicate": false,
 "findingCount": 7,
 "findings": [
  {"id": "r1a-receipt-absent",      "detail": "corpus/evidence/round41/playwright-egress/receipt.json not committed at REV"},
  {"id": "r1b-witness-absent",      "detail": "corpus/evidence/round41/playwright-egress/receipt.witness.json not committed at REV"},
  {"id": "r2-s146-not-rejected",    "detail": "S146 status is 'mined', expected 'rejected'"},
  {"id": "r2-supersession-absent",  "detail": "row S148 not found at REV"},
  {"id": "r3-baseline-file-empty",  "detail": ".ufo/waves/round-41/controls/c1-baseline-noop.out committed blob is 0 bytes"},
  {"id": "r4-slice-absent",         "detail": ".ufo/waves/round-42/quarantine/slice-ids.txt not committed at REV"},
  {"id": "r4-quarantine-absent",    "detail": ".ufo/waves/round-42/quarantine/re-adjudication.tsv not committed at REV"}
 ]
}
```

(stderr empty; wall ~1.6 s.)

Byte-identity with the committed red control:

```
diff -u .ufo/waves/round-42/controls/c2-baseline-red.json <rerun>   → no output, IDENTICAL
sha256 both                                                          → 16d8cdca9a00d0b471508f9a7e74b2ac5178d6d259414ed3ebbdf491d9827f53
```

Committed red control is not dirty (`git hash-object` worktree == committed `767c2cb`).

**Confirmed: exit 1 with exactly the committed 7 red findings.**

---

## Calibration controls (anti-vacuity, beyond the assigned five)

Frozen-counter digests (read-only observation; `sha256sum`):

```
b1d05df17137bfcf4db9c6d2851108e1313cf2229167b8b521fee2aa1c76b4a8  .ufo/waves/round-42/counters/check-routed-defects-round42.mjs
ce7b56799cae7593d315330ffce460ac9236c1f343e40cf7212f334f7fd41d7a  .ufo/waves/round-42/claims.json
16d8cdca9a00d0b471508f9a7e74b2ac5178d6d259414ed3ebbdf491d9827f53  .ufo/waves/round-42/controls/c2-baseline-red.json
02dfbbd6b2138d0d5689838eb3b9e6fc1b4048c9780696df3dffb163c49fb7f0  .ufo/waves/round-42/controls/c1-baseline-tree-count.txt
```

Rev discrimination (proves the red control is not a constant-red stub). Same checker, `--json`, three revs:

| rev | exit | predicate | findingCount | finding ids |
|---|---|---|---|---|
| `fecbdf0a3aa79ce17bce3ef7338f69112f604f88` | 1 | `false` | 8 | `r1-measure-absent`, `r1a-receipt-absent`, `r1b-witness-absent`, `r2-s146-absent`, `r2-supersession-absent`, `r3-baseline-file-absent`, `r4-slice-absent`, `r4-quarantine-absent` |
| `34e177959d1b7ce04afb85a001420e02631ce79e` (baseline) | 1 | `false` | 7 | the committed red set above |
| `0081bfdb93b6bd1bf2853bb128996f1a976b7218` (HEAD) | 1 | `false` | 1 | `r4-quarantine-absent` |

The set shrinks monotonically across revs and the finding vocabulary mutates as history lands D1/D2/D3
(`*-absent` → `*-not-rejected` / `*-empty`), so the checker genuinely reads the tree at `--rev` rather than returning a fixed payload.
At HEAD exactly one red remains, matching the freeze statement "only r4 (quarantine re-adjudication TSV) is still red, by design".

Checker interface note (not a defect): `--rev HEAD` is rejected with exit `2` and
`{"schema":"tabi-r42-routed-defects","error":"usage: node check-routed-defects-round42.mjs --rev <40-hex rev> --repo <lane repo> [--json]"}` —
a 40-hex rev is mandatory. Seats must not read exit 2 as a red/pass signal; pass the full sha.

## Observation (non-blocking, frozen bytes — routed as a finding, not amended)

`claims.json` `.claims[1].beforeState` enumerates the baseline red as *"r1a-receipt-absent, r1b-witness-absent,
r2-supersession-absent, r3-baseline-file-empty, r4-quarantine-absent"* — 5 ids, while the frozen checker and the committed
control `controls/c2-baseline-red.json` both emit **7** (`r2-s146-not-rejected` and `r4-slice-absent` omitted from the prose list).
The prose is incomplete rather than false: every enumerated id is present in the measured output, and the exit-1 requirement holds.
The authoritative artifact (committed control JSON) is byte-faithful to a live re-run. Recorded here per instruction; no edit
proposed or made to claims/counter bytes.

Second observation, semantic only: both baseline controls record a `0` that means *path absent at the rev*, not *committed empty
directory*. The transcription values are faithful either way; the control artefacts do not state which semantics they encode, so a
reader checking "0 files" against a later populated tree should not read the 0 as "directory existed and was empty".

## Limitations

- Everything ran against the local git object store only (loopback/local files); no network was used.
- I did not modify, commit, fetch or push anywhere; the production tree and `.ufo/.../controls`/`counters` were read-only for this seat.
  Only my seat directory was written.
- `--rev` must be a full 40-hex sha (see interface note); all three revs above were passed as full shas.
- No tool was installed or upgraded; no pacman invocation (host transactions paused) — nothing was needed.

## Evidence paths (seat dir)

`.ufo/waves/round-42/w1/ExecBaselineCount/`

- `report.md` — this file
- `evidence/c1-baseline-noop.out.HEAD` — `git show HEAD:...` bytes, 343 B, sha256 `45379acb…1caa`
- `evidence/c1-baseline-tree-count.txt.copy` — committed control copy, sha256 `02dfbbd6…b7f0`
- `evidence/c2-baseline-red.json.committed` — committed red control, sha256 `16d8cdca…7f53`
- `evidence/c2-baseline-rerun.json` — live re-run at `34e1779…`, sha256 `16d8cdca…7f53` (identical to committed)
- `evidence/c2-at-fecbdf0.json` — discrimination run, 8 findings, sha256 `c8366d22…9479e`
- `evidence/c2-at-head.json` — HEAD run, 1 finding (`r4-quarantine-absent`), sha256 `fcf5e248…a616`

Cleanup: `/fast/scratch/hyaku/tabi-r42/ExecBaselineCount` removed after evidence copy.

VERDICT ok — both re-derived counts are 0, `c1-baseline-noop.out` carries the identical command and `0`, `c1-baseline-tree-count.txt` carries the identical command and `0`, and the frozen checker at `34e1779…` exits 1 with output byte-identical to `controls/c2-baseline-red.json` (7 findings, sha256 `16d8cdca…`); frozen claims prose under-enumerates that red set 5-of-7 (recorded, not amended).
