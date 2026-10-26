# ExecRerunC1 — round 29, wave w2: C1 re-measurement (attack)

Measured revision `32008a453737a27f69e9ab401d0b9775d2a944f7` (lane `master`), C1 only.
Clean clone: `git clone --shared` of the lane into scratch, `git -C lane checkout -q 32008a45…`,
`git -C lane rev-parse HEAD` = `32008a453737a27f69e9ab401d0b9775d2a944f7`,
`git -C lane status --porcelain` empty before and after every run (`blob-identity-at-rev.txt`).
Nothing in the lane checkout was written; all mutants live in scratch copies.
Evidence files referenced below are in `.ufo/waves/round-29/w2/ExecRerunC1/`.

Environment: node v24.21.0, git 2.56.0, GNU patch; no network used; nothing installed
(no `uv tool`/`npx`/binary install was needed, so no tooling-gate record is owed).

## Verdict

**C1 predicate CONFIRMED — every clause holds at 32008a45.** Three mutation-testing gaps found
(anchor uniqueness, byte-count, and the field-value assertion as a whole are unprotected by the
committed self-test); they do not violate the frozen C1 predicate, whose clauses never require
coverage of those fields. Detail in *Mutation battery* and *Findings*.

## Clause-by-clause (predicate text → measurement)

Commands run from the clone root `/fast/scratch/hyaku/tabi-r29/ExecRerunC1/lane`.

### Clause 1 — `--selftest` exits 0 — **CONFIRMED**

```
$ node scripts/check-s106-evidence.mjs --selftest; echo exit=$?
CASE id=clean-fixture-valid expected_exit=0 exit=0 valid=true PASS
CASE id=measured-revision-bytes-match expected_exit=0 exit=0 valid=true PASS
CASE id=measured-revision-bytes-mismatch expected_exit=1 exit=1 valid=false PASS
CASE id=sha-mismatch-invalid expected_exit=1 exit=1 valid=false PASS
CASE id=anchor-off-by-one-invalid expected_exit=1 exit=1 valid=false PASS
CASE id=missing-bytes-could-not-evaluate expected_exit=2 exit=2 valid=n/a refusal=decoded bytes absent at <sha>: corpus/evidence/round-26/sources/content-features-154.0.8037.97.cc PASS
CASE id=missing-receipt-could-not-evaluate expected_exit=2 exit=2 valid=n/a refusal=receipt absent at <sha> PASS
S106_SELFTEST verdict=clean cases=7 passed=7
exit=0
```
`c1-selftest-tip.txt` (raw, unnormalised: fixture commit ids vary per run).
Three consecutive runs: exit=0 each, stdout identical under commit-id normalisation
(`selftest-determinism.txt`). The only non-deterministic bytes are the fixture repos' random
commit ids embedded in the two refusal messages — by construction, not a flake.

### Clause 2 — prints `S106_SELFTEST verdict=clean cases=N passed=N`, N >= 7 — **CONFIRMED**

`verdict=clean cases=7 passed=7`, N = 7 = the declared case count
(`case-list.txt`, extracted from the source at the measured rev; same 7 ids appear in the run).

### Clause 3 — CASES include `measured-revision-bytes-match` and `measured-revision-bytes-mismatch` — **CONFIRMED**

Both ids present in the source `CASES` list and printed by the run (`case-list.txt`,
`c1-selftest-tip.txt`). The mismatch case at tip ends with the second `d.commit()`
(`scripts/check-s106-evidence.mjs:200`), i.e. the receipt is committed, unlike baseline.

### Clause 4 — committed receipt shows the same self-test on a copy whose revision comparison is removed, exiting nonzero with `measured-revision-bytes-mismatch` FAIL — **CONFIRMED (independently reproduced)**

Re-applied the committed `corpus/evidence/round-29/s106-selftest/mutation.diff` to a fresh copy of
the gate taken from the same rev (`patch -p0 --batch -i mutation.diff`, laid out as
`<scratch>/scripts/check-s106-evidence.mjs`; exit 0 — note the diff's `+++` header names a wave-1
scratch path, which `patch` reports as `Ignoring potentially dangerous file name`). Applied effect
(`mutation.diff.effect.txt`): hunk 2 replaces

```
-  const revisionMatch = measuredBytes !== null &&
-    sha256(measuredBytes) === receipt.decoded_sha256;
+  const revisionMatch = true; // MUTANT: revision comparison removed
```
(hunk 1 also rebinds `LANE` to the live lane absolute path; inert for `--selftest`, which uses its
own fixture repos — see Findings P2).

```
$ node scripts/check-s106-evidence.mjs --selftest; echo exit=$?      # mutant copy
CASE id=clean-fixture-valid … PASS
CASE id=measured-revision-bytes-match … PASS
CASE id=measured-revision-bytes-mismatch expected_exit=1 exit=0 valid=true FAIL
CASE id=sha-mismatch-invalid … PASS
CASE id=anchor-off-by-one-invalid … PASS
CASE id=missing-bytes-could-not-evaluate … PASS
CASE id=missing-receipt-could-not-evaluate … PASS
S106_SELFTEST verdict=failed cases=7 passed=6
exit=3
```
`c1-mutation-reapplied.txt`. Comparison with the committed receipt: **identical under commit-id
normalisation, including the trailing `exit=3`** (only differing lines are the two refusal shas —
receipt `7a87c327…`/`897387e3…`, rerun `5eed473a…`/`c039d991…`). So the receipt is an honest record
of this mutant, and it is red exactly on `measured-revision-bytes-mismatch`.

Blobs at the measured rev (`blob-identity-at-rev.txt`):
`scripts/check-s106-evidence.mjs` = `7ec5f5e6ff92f6b10e86fbd9d3471c21db38aef5` (14113 B, local
sha256 `1a01256e…e45eb3`), `corpus/evidence/round-29/s106-selftest/mutation.diff` blob
`769ec645…` (sha256 `1d526ef2…7aac4`), `mutation.txt` blob `d694f463…` (sha256 `c0280986…c3300`).
Both receipt files are committed at the measured rev.

### Clause 5 — `--rev REV --json` reports valid=true — **CONFIRMED**

```
$ node scripts/check-s106-evidence.mjs --rev 32008a453737a27f69e9ab401d0b9775d2a944f7 --json; echo exit=$?
{ "schema": "tabi-s106-evidence-v1", "rev": "32008a45…", "receipt": "corpus/evidence/round-26/sources/s106.json",
  "bytes_path": "corpus/evidence/round-26/sources/content-features-154.0.8037.97.cc", "present": true,
  "decoded_bytes": 73952,
  "decoded_sha256_claimed": "9b93fe64843ecf819202fa6de9833597203b3f53f6572c144b76f247424e6c44",
  "decoded_sha256_observed": "9b93fe64843ecf819202fa6de9833597203b3f53f6572c144b76f247424e6c44",
  "sha_match": true, "revision_match": true,
  "anchor": { "line": 187, "text": "BASE_FEATURE(kBackForwardCache, base::FEATURE_ENABLED_BY_DEFAULT);", "occurrences": 1 },
  "anchor_located": true, "anchor_unique": true, "byte_count_match": true, "valid": true }
exit=0
```
`c1-rev-json-tip.json`, `c1-rev-json-tip.exit` (=0).

### Kill rule — **not triggered**

Nonzero exit: no. N < 7: no (7). Revision case ids absent: no. Mutation receipt absent or green:
no (present at rev, red). `--rev` valid != true: no.

## Baseline premise (attack on the "before" story, not on a predicate clause)

Baseline script extracted read-only (`git show 856fa9e…:scripts/check-s106-evidence.mjs`) into scratch:

- **Defect 1 — crash.** `node check-s106-evidence.mjs --selftest` →
  `ReferenceError: existsSync is not defined` at `:267:9` inside `rev()`, **exit=1**, no tally
  (`baseline-crash.txt`). Baseline's `node:fs` import at `:37` omits `existsSync`. Matches the
  claim's `before` exactly.
- **Defect 2 — inverted field assertion.** With only the import fixed (`existsSync` added, nothing
  else), the same 7 cases give `S106_SELFTEST verdict=failed cases=7 passed=5` exit=3
  (`mut-baseline.txt`): `measured-revision-bytes-match` FAILs (`exit=0 valid=true` vs expected,
  because baseline line 301 is `if (c.field) ok = ok && out[c.field] === false;`) and
  `measured-revision-bytes-mismatch` FAILs with `exit=2 refusal=receipt absent at <sha>`.
- **Defect 3 — mismatch case never commits its receipt.** Explained by the same run: that case's
  build ends at `d.receipt(…)` with no commit, and `rev()` skips its own commit because
  `committed` was already set by the interior `d.commit()`; so the receipt is never in history and
  `evaluate` refuses with `receipt absent`. All three claimed defects are real, and the tip's
  repairs are the ones that remove them.

## Mutation battery (only-mutant-kills analysis)

Each mutant is a scratch copy of the tip gate with one surgical change; each ran `--selftest`.
Diffs per mutant in `mut-*.diff`; outputs in `mut-*.txt`.

| # | Change | Result | Killed by |
|---|--------|--------|-----------|
| M1 | committed receipt: `revisionMatch = true` (revision comparison removed) | exit=3, 6/7 | `measured-revision-bytes-mismatch` (only) |
| M2 | `shaMatch = true` (committed-bytes sha comparison dropped) | exit=3, 6/7 | `sha-mismatch-invalid` (only) |
| M3 | `anchorUnique = true` (anchor uniqueness dropped) | **exit=0, 7/7 clean** | **none — survives** |
| M4 | runner ignores `field`/`fieldValue` entirely | **exit=0, 7/7 clean** | **none — survives** |
| M5 | runner field assertion inverted (`!==`, round-28 defect 2 replay) | exit=3, 3/7 | `measured-revision-bytes-match`, `-mismatch`, `sha-mismatch-invalid`, `anchor-off-by-one-invalid` (4) |
| M6 | `byteCountMatch = true` (decoded byte-count dropped) | **exit=0, 7/7 clean** | **none — survives** |

M3/M6 survival is *coverage* absence, not a defect in `evaluate`: adding one case
(`c1-plus-anchor-uniqueness-case.diff`, 12 added lines, anchor line duplicated at trailing position,
sha/byte-count recomputed so only `anchor_unique` differs) makes the *unmutated* gate
`verdict=clean cases=8 passed=8` exit=0, and the *same* gate with M3 applied
`verdict=failed cases=8 passed=7` exit=3 on `anchor-duplicate-invalid` (`…-case.txt`,
`mut-addcase-m3.txt`). So the uniqueness check is load-bearing in production and merely uncovered by
the committed seven cases. M4 survives because at present every declared `fieldValue` already agrees
with the `exit`/`valid` assertions, making the field check redundant on this case set — the
inversion (M5) is caught, outright removal (M4) is not.

## Findings (attack results, not repairs)

- **F1 (coverage, medium).** `anchor_unique` is unchecked by any committed case: M3 hard-codes it
  true and the self-test stays `verdict=clean`, exit 0. The gate's own header advertises uniqueness
  checking; only `evaluate` enforces it. Predicate-neutral (C1 never requires it), but the self-test
  cannot regress-detect it.
- **F2 (coverage, medium).** `byte_count_match` likewise: M6 survives 7/7.
- **F3 (coverage, low).** The runner's field assertion can be deleted wholesale (M4) without a single
  failing case; only its inversion is caught. Round-28 defect 2 is fixed in fact
  (`out[c.field] === c.fieldValue` with a `fieldValue`-presence guard) but not regression-protected
  against removal.
- **F4 (provenance, low).** `mutation.diff` carries no base-gate or mutant file digest, its `+++`
  header names a dead wave-1 scratch path (`/fast/scratch/hyaku/tabi-r29/L1-measure/mutant.mjs`),
  and its first hunk rebinds `LANE` to the live lane absolute path. The receipt is therefore
  reproducible only by re-applying the diff to the gate at the same rev (done here: exact match), and
  the rebinding means the mutant, if run with `--rev` and no `--repo`, would read the live lane
  rather than its own tree.
- **F5 (determinism, informational).** Refusal messages embed random fixture commit ids, so the
  receipt can never be byte-reproduced; verdict and per-case status are stable across three runs.

## Risks / blockers

- No blocker. C1's predicate needs no information I could not obtain; all five clauses are measured,
  not inferred.
- Residual risk on C1 is regression drift only: the three uncovered fields (F1–F3) mean a future
  edit could disable anchor-uniqueness, byte-count, or the whole field assertion with a green gate.
  The frozen predicate does not test for this, so it does not falsify C1 — but a later round wanting
  operability of this gate should add the duplicate-anchor case (patch supplied) plus a
  byte-count-mismatch case and a `field`-less/`fieldValue`-wrong case.
- Lane untouched: only reads in the lane; all writes are under
  `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-29/w2/ExecRerunC1/` (receipts) plus
  this report; scratch under `/fast/scratch/hyaku/tabi-r29/ExecRerunC1/`, one shared clone.
