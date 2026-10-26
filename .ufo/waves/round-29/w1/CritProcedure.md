# CritProcedure — round 29 / w1: evidence-procedure attack

Seat: attack (findings only; no production repair). Scope: `claims.json` + every file in
`.ufo/waves/round-29/baseline/`, byte-reproducibility from committed bytes, recorded exit
codes, and the census capture. No subagents, no lane writes, no builds of the lane.

## Method

- One live clone: `git clone --shared -q /home/vgpnk/Projects/shokunin/tabi-shokunin $S/clone`
  (`$S=/fast/scratch/hyaku/tabi-r29/CritProcedure`), one worktree added from it
  (`$S/revs/base`). `git -C <x> status --porcelain` printed empty before every run at
  `856fa9e` and at `97be89b`; `rev-parse --show-toplevel` confirmed.
- `TMPDIR=$S/tmp`. node v24.21.0 (same as the receipts' stack). No tooling installed.
- Lane state during the audit: HEAD moved `190052c` → `59e8167` (C1/C2 land) → `35045d7`
  (LOG entry). `claims.json` hash at tip equals its hash at `97be89b`
  (`b73659419dff041e…`), and `97be89b..HEAD` touches no file under `baseline/`.
  `sha256sum -c baseline/frozen-counter-sha256.txt` → exit 0 (both counters OK).

Key commands (all exit codes as printed):

```
git -C $S/clone checkout -q --detach 856fa9e… ; node clone/scripts/check-s106-evidence.mjs --selftest   -> exit=1
git -C $S/clone checkout -q --detach 97be89b… ; node clone/scripts/check-selfassessment.mjs --selftest   -> exit=0
node clone/scripts/check-selfassessment.mjs --rev 856fa9e… --json                                        -> exit=1 (mismatches=5)
node clone/scripts/check-selfassessment.mjs --repo $S/revs/base --rev 856fa9e… --json                    -> exit=1 (mismatches=6)
node $S/revs/base/scripts/check-selfassessment.mjs --rev 856fa9e… --json                                 -> exit=1 (mismatches=6)
node clone/scripts/check-release-pins.mjs --selftest                                                     -> exit=0
node clone/scripts/check-release-pins.mjs --rev 856fa9e… --stable 156.0.8078.47 --json                   -> exit=1
node clone/scripts/check-release-pins.mjs --rev 190052c… --stable 156.0.8078.47 --json                   -> exit=1 (population 23, unresolved 23)
bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi -> exit=0
curl -sS 'https://chromiumdash.appspot.com/fetch_releases?channel=Stable&platform=Linux&num=3'           -> HTTP 200
```

## Reproduction matrix (20 files in `baseline/`)

`byte` = byte-compare against committed receipt; `mod-paths` = identical except absolute path
frames; `mod-trailer` = identical except the documented `exit=N` trailer; `NO` = differs.

| receipt | bytes | how reproduced | exit recorded / observed | byte |
|---|---|---|---|---|
| `rev.txt` | 41 | string equals claims `baseline` | n/a | yes |
| `frozen-counter-sha256.txt` | 284 | `sha256sum -c` at tip | 0 / 0 | yes (file has no final newline) |
| `s106-selftest.txt` | 828 | `--selftest` at clean 856fa9e | 1 / 1 | mod-paths (4 `file://` frames) |
| `c1-control-case-deletion.diff` | 922 | `patch -s` onto committed `0f5e7c47…` | patch 0 | applies clean; mutant sha `e3fc94aa…` (uncommitted) |
| `c1-control-case-deletion.txt` | 630 | patched gate `--selftest` | 0 / 0 | **NO** — fixture SHAs differ (F2) |
| `c2-before-frozen-counter-cleanbase.json.txt` | 42337 | frozen judge `--repo` 856fa9e checkout, `--rev 856fa9e` | 1 / 1 | **yes, byte-identical** (hybrid only, F1) |
| `selfassessment-selftest-oldcounter.txt` | 2029 | old counter (856fa9e) `--selftest` | 0 / 0 | mod-trailer |
| `selfassessment-rev-oldcounter.json.txt` | 42673 | old counter `--rev 856fa9e` clean | 1 / 1 | **NO** — 6/93/5 vs 7/93/5 (F7) |
| `c2-red-before-selftest.txt` | 2253 | — | **none recorded** (must be 3) | **NO** — unproducible (F3) |
| `c2-after-fix-selftest.txt` | 2291 | frozen `--selftest` at clean 97be89b | 0 / 0 | **yes, byte-identical** |
| `c2-control-crossdoc-frozencounter.json` | 43347 | rebuild 856fa9e + 2 tails, commit, frozen judge | 1 / 1 | **NO** — counts identical 6/93/5, `rev` differs (F4) |
| `c2-control-crossdoc-oldcounter.json` | 42508 | same tree, old judge | 0 / 0 | **NO** — counts identical 0/93/11, `rev` differs (F4) |
| `c2-control-crossdoc-SCORECARD-tail.md` | 363 | append reproduces the control counts | n/a | content reproduced |
| `c2-control-crossdoc-LOG-tail.md` | 119 | append reproduces the control counts | n/a | content reproduced |
| `c3-before.json` | 3603 | `--rev 856fa9e --stable 156.0.8078.47 --json` | 1 / 1 | **yes, byte-identical** |
| `c3-before.exit` | 7 | — | 1 / 1 | yes |
| `c3-selftest-frozen.txt` | 2257 | `--selftest`, 2 runs | 0 / 0 | **yes, byte-identical, deterministic** |
| `census-start.txt` | 2197 | fresh run at tip | 0 / 0 | **NO** — 2 extra rows (F5) |
| `chromiumdash-stable-linux.json` | 1802 | re-fetch with `num=3` | HTTP 200 | **yes, byte-identical** (F6 on params) |
| `chromiumdash-fetched-at.txt` | 21 | payload `time` unchanged today | n/a | consistent |

Result: **9 of 20 files byte-reproduce as-is; 6 reproduce only through an unstated invocation
or modulo path/trailer; 5 do not reproduce.**

## Findings

### F1 — C2 "before" is misattributed: 6 is not the number a clean clone with the frozen counter produces
Counterexample. Clean checkout of `97be89b` (frozen counter in-tree, `--rev 856fa9e`):
`mismatches=5, couldNotEvaluate=94, superseded=5`, exit 1. `SCORECARD.md:1439` is refused with
`"script at rev is not the runnable working copy"` (guard at `scripts/check-selfassessment.mjs:151-153`).
The committed receipt has `6 / 93 / 5` and `observed=20` at `:1439`; that combination appears
only when the *judged* repo is a baseline checkout while the judge runs from elsewhere
(`--repo <856fa9e checkout>`), which is what makes `sha256(file at rev) == sha256(working copy)`
pass. I reproduced the receipt **byte-identically** with exactly that hybrid.
Impact. Claim text "6 at baseline 856fa9e in a clean clone with the frozen counter" is false as
written: the reachable number under the claim's own measurement rule is 5. Both are >0, so the
do-nothing control still misses the target and the target (`0`) is unaffected; the overstated
part is the delta and the provenance. A verifier following the stated procedure records a
number the claim does not predict.
Axes: calibration (primary), operability (receipt provenance).
Smallest safe correction: replace the `before` line with both readings and the exact
invocation, e.g. `before: 5 (clean 97be89b checkout, --rev 856fa9e; :1439 refused); 6 (--repo
<856fa9e checkout>, observed=20; receipt bytes)`, and put the invoked command line in each C2
receipt.

### F2 — C1 receipts cannot be byte-reproduced: fixture commits are unpinned
Counterexample. Five runs of the same mutated gate (the committed `c1-control-case-deletion.diff`
applied to `0f5e7c47…`) produced five different fixture revs in the `refusal=… absent at <sha>`
lines: `49bb6443/587acd17`, `dc272ba4/96b687d2`, `1c8d029a/0e77068b`, `0742d67a/9d670a25`;
the receipt carries `7569934f/ac31b82b`. `makeFixture()` sets `user.name`/`user.email` but no
`GIT_AUTHOR_DATE`/`GIT_COMMITTER_DATE`, so every fixture commit hashes the wall-clock second;
two of my runs matched only because they fell inside one second. The landed round-29 receipts
`corpus/evidence/round-29/s106-selftest/{selftest-l1.txt,mutation.txt}` carry the same defect
(`7a87c327…`, `897387e3…`) and the fixture is still unpinned at `35045d7`
(`grep -n 'GIT_AUTHOR_DATE|GIT_COMMITTER_DATE|SOURCE_DATE_EPOCH'` → no match).
Impact. Only the `verdict=/cases=/ids` lines of any s106 receipt are stable, so round-28 routed
defect 5 ("byte-exact captures") cannot be met for C1 evidence. The C1 kill rule does not
demand byte equality, so the claim survives; the control and mutation receipts cannot be
re-derived byte-for-byte by a verifier.
Axes: operability.
Smallest safe correction: in `makeFixture().run()` pass a fixed
`GIT_AUTHOR_DATE=GIT_COMMITTER_DATE=2026-01-01T00:00:00Z` (or print a stable fixture index
instead of the sha in `CASE` lines), then re-capture the C1 receipts.

### F3 — `c2-red-before-selftest.txt` is unproducible from committed bytes, and is the one receipt with no exit code
Counterexample. `git log --all -S 'm1-scorecard-crossdoc-citation-not-superseded'` reaches only
frozen-counter blobs (`72812800…`); the only pre-fix blob is `9bc6feb72…` (20-case, no crossdoc
ids). No committed blob yields `cases=22` with the old matcher, so the red state was never
committed and the receipt cannot be regenerated. The file also omits `exit=`; by
`process.exit(out.ok ? 0 : 3)` (`scripts/check-selfassessment.mjs:787`) that run necessarily
exited **3** — the round's only nonzero selftest exit is the one not recorded.
Impact. The C2 red/green pair is half-verifiable. Not fatal: the green side is byte-exact (F-
matrix) and the crossdoc control reproduces the same discrimination from committed inputs
(old 0 vs frozen 6 on identical bytes), so the property is established without the red receipt.
Axes: calibration, operability.
Smallest safe correction: either commit the intermediate counter (or its inverse patch) beside
the receipt together with `; echo exit=$?` output, or drop the red receipt and cite the
crossdoc control as the discrimination evidence.

### F4 — Control receipts are pinned to scratch revisions that do not exist
Counterexample. `git -C <lane> cat-file -e 8404d20533db3f20320a4f16c619ad0fcd301050` → exit 1;
the C1 control's fixture revs (`7569934f…`, `ac31b82b…`) likewise. Rebuilding baseline plus the
two committed tails commits as `18445e66…`; the counts reproduce exactly
(frozen `6/93/5` exit 1; old `0/93/11` exit 0 — same as both control JSONs) but the JSON bytes
differ in `rev`.
Impact. For controls whose asserted property is a count this is acceptable, but it must be
stated, otherwise a verifier records "not reproduced".
Axes: calibration.
Smallest safe correction: annotate both control receipts "counts reproducible, bytes not; rebuilt
rev differs", and record base rev + append point for the tails.

### F5 — `census-start.txt` is not equal to a fresh run and carries no provenance
Counterexample.
`bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi`
→ exit 0, 2556 B, 18 lines, sha256 `4aa6d6a3992a9ee45c8557081f0cab82ff3d9e8caa95e73ad1435d274a394b57`.
Receipt: 2197 B, 17 lines, sha256 `603360beca064bae65069f52e679f48a0d964685b714cb51b8e5368ac2eee750`.
Diff = two extra `W04` rows, `S114` and `S115`, both pinned at
`refs/tags/156.0.8078.47/…/html_form_element.cc?format=TEXT`, added to `corpus/SOURCES.md` by
`190052c`. Running the counter over the `856fa9e` and `97be89b` trees reproduces the receipt's
16 rows exactly, modulo the lane-label column (derived from the directory's real name: `base`,
`clone`) and the absolute path in the final `ok` line. The capture has no rev/date/root header,
so it cannot be attributed to a tree state, and the lane tip moved twice during this audit.
Impact. The round-28 routed defect 5 requirement ("byte-exact captures") is not met for the
census: equality holds only for the original absolute path at the capture-time tree state,
which no longer exists in the lane.
Axes: operability (capture discipline); coverage is unaffected.
Smallest safe correction: emit a sidecar header per capture (`<rev>\t<root>\t<command>`) and
require equality *given the same rev+root*, not across checkouts; re-capture at each
measurement revision.

### F6 — ChromiumDash trigger receipt does not record its fetch parameters
Counterexample. `?channel=Stable&platform=Linux&num=3` → HTTP 200, 1802 B, sha
`90abf2c3efe7df7b3c48521ca754bb24191f7f05b3b60b93ebb735375fd7fe33` — byte-identical to the
receipt. `num=2` → 1202 B (2 entries, second `previous_version` `155.0.8059.79`); no `num` →
6002 B. So the receipt is reproducible only if the verifier guesses `num=3`. The trigger itself
holds today: version `156.0.8078.47`, previous `155.0.8059.84`, `time` `1792526230889`
unchanged.
Axes: freshness (minor).
Smallest safe correction: add `chromiumdash-request.txt` with the exact URL (one line).

### F7 — `selfassessment-rev-oldcounter.json.txt` was captured in a dirty tree
Counterexample. Clean `856fa9e` with the old counter: `mismatches=6, couldNotEvaluate=93,
superseded=5`; the receipt says `7/93/5` and contains one extra finding
`{"class":"m3-unlanded-paths","doc":"SCORECARD.md","round":27,"claimed":"landed","observed":5}`
that only appears when 5 cited paths are unlanded. A clean checkout therefore gives 6, not 7.
Consequence worth recording: at baseline the old and frozen counters both report 6, so the
doc-binding change moves nothing at baseline — the only behavioural difference is cross-document
clearing (old 0 vs frozen 6), which is exactly what the control measures. That makes the
control's discrimination stronger than the 7→6 delta suggested.
Axes: calibration (minor).
Smallest safe correction: re-capture in a clean checkout, or label it "context, dirty tree; not
a control".

## Assessment

- No round-29 claim is fatally unverifiable from the baseline evidence. C3's before is
  byte-exact (and `population=23 / unresolved=23` still holds at `190052c`, verified); C2's
  target is measurable under its own procedure; C1's target line is deterministic.
- The defects are procedural: one misstated baseline anchor (F1), one class of
  non-reproducible receipts from unpinned fixture timestamps (F2, F3), scratch-rev pinning
  (F4), capture provenance (F5), fetch-parameter provenance (F6), one dirty-tree capture (F7).
- Order by cost to fix: F6 (one file) → F5 (one sidecar) → F1 (one claims line) → F4 (two
  annotations) → F7 (re-capture) → F2 (fixture dates + re-capture C1 receipts) → F3 (commit the
  intermediate or drop the red receipt).
- Impacted axes: calibration (F1, F3, F4, F7), operability (F1, F2, F5), freshness (F6).
  Coverage, depth, adjacency: untouched.
- Forward risk for the after-measurement (not exercised here, reported for the verifier): any
  after-receipt that records `CASE` lines inherits F2, so `measure/` receipts should be compared
  on verdict/count/ids only until the fixture dates are pinned.

## Hygiene notes (not findings)

`claims.json` and `baseline/` are unmodified since the freeze commit; both counter hashes verify;
the crossdoc control's discrimination reproduces on identical inputs (old 0 / frozen 6); the
release-pin selftest is byte-deterministic across repeated runs; the census exit code matches
(0). No tool installs or upgrades were performed.
