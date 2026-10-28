# MutC2Digest — C2 digest-binding mutation (round 42, wave 1)

Seat: `MutC2Digest` · item: digest binding mutation · judged on calibration.
Frozen claim under test: **C2** (calibration), predicate clauses `r1a`/`r1b` of
`check-routed-defects-round42.mjs`.

Target clause (verbatim, lane bytes at sha256 `b1d05df1…6b4a8`):

```js
  const got = sha256(raw);
  if (got !== want) add(`${id}-digest-mismatch`, `${p} sha256 ${got} != committed ${key} ${want}`);
```

## Axes (named before probing)

| Axis | Question the probe must answer |
|---|---|
| A kill discrimination | Does the mutant *green* a fixture the pristine checker *refuses*? |
| B scope isolation | Does the mutation drop **only** the digest equality, leaving size and parse intact? |
| C symmetry | Is the clause load-bearing on **both** bound artifacts (`r1a` receipt, `r1b` witness)? |
| D attribution | Is the fixture otherwise conformant, so a refusal is caused by the digest clause alone? |
| E evidence integrity | Are lane bytes untouched, and is the mutation confined to scratch? |

## Setup

Scratch root `/fast/scratch/hyaku/tabi-r42/MutC2Digest/` (created, deleted before yield).
Lane checker is 9467 bytes; copied, never edited in place.

```
$ mkdir -p /fast/scratch/hyaku/tabi-r42/MutC2Digest
$ sha256sum .../round-42/counters/check-routed-defects-round42.mjs
b1d05df17137bfcf4db9c6d2851108e1313cf2229167b8b521fee2aa1c76b4a8   (9467 bytes)
$ node --version
v24.21.0
```

No tool installs or upgrades were performed (node v24.21.0 and git were already present; pacman untouched per the host-wide pause). Nothing outside scratch and this seat dir was written.

### Mutation M

`diff -u` lane checker → scratch mutant (`evidence/mutation.diff` in this dir):

```
@@ -86,7 +86,7 @@
   const want = measureDoc && measureDoc[key];
   if (!want) { ...binding-unavailable... continue; }
   const got = sha256(raw);
-  if (got !== want) add(`${id}-digest-mismatch`, `${p} sha256 ${got} != committed ${key} ${want}`);
+  // MUTATION M: digest binding to the committed measure record dropped (size+parse kept).
 }
```

Only the equality test is removed. The `want` lookup / `*-binding-unavailable`
clause, the `size < 1000` clause and the `JSON.parse` clause all remain, so the
mutant still fails on absence, thinness and malformed JSON.

Hashes:

```
b1d05df17137bfcf4db9c6d2851108e1313cf2229167b8b521fee2aa1c76b4a8  lane check-routed-defects-round42.mjs (before AND after)
b1d05df17137bfcf4db9c6d2851108e1313cf2229167b8b521fee2aa1c76b4a8  check-pristine.mjs (byte copy)
e1cbe0bd8e447669e7a1918fa58d858f8194ba07694fd00399fd57868f681d8a  check-mutant.mjs
```

### Fixture repo

`/fast/scratch/hyaku/tabi-r42/MutC2Digest/fixture`, `git init -q`, toplevel verified
equal to the fixture path via `realpath` **before** the first commit:

```
toplevel: /fast/scratch/hyaku/tabi-r42/MutC2Digest/fixture | realpath-equals-fixture: True
rev: 98f0e360bb183ddb22fc96515cb4785cb5a07dc7
```

Contents (full listing: `fixture-manifest.txt`):

- `.ufo/waves/round-41/measure/c1-measure.json` — copied **unchanged** from the lane
  (carries `receiptSha256 416f6e4b…46db1`, `witnessSha256 d3c9972e…0f39d3`).
- `corpus/evidence/round41/playwright-egress/receipt.json` — **synthetic, exactly 2000
  bytes, valid JSON**, sha256 `aabd85a5…f2ff3f` ⇒ differs from the committed r41 record
  (`416f6e4b…46db1`). Size and parse both pass; only the digest differs.
- `corpus/evidence/round41/playwright-egress/receipt.witness.json` — real witness bytes,
  digest matches the measure record.
- `corpus/SOURCES.md`, `.ufo/waves/round-41/sources/node-cli-v24.21.0.html`,
  `.ufo/waves/round-41/controls/c1-baseline-noop.out` — copied from the lane so r2/r3 are
  genuinely satisfied rather than trivially absent.
- `.ufo/waves/round-42/quarantine/slice-ids.txt` + `re-adjudication.tsv` (38 rows, verdict
  `present`, each evidence a committed 200+ byte blob) — fixture-local, so the only
  variable under test is the receipt digest.

Design: the fixture is green for r1b, r2, r3, r4 **except** for the receipt digest, so any
refusal is attributable to the mutated clause (axis D).

## Runs (same fixture, same rev `98f0e360…`)

```
$ node check-pristine.mjs --rev 98f0e360bb183ddb22fc96515cb4785cb5a07dc7 --repo <fixture> --json
{ "schema": "tabi-r42-routed-defects", "rev": "98f0e360…", "predicate": false, "findingCount": 1,
  "findings": [ { "id": "r1a-digest-mismatch",
    "detail": "corpus/evidence/round41/playwright-egress/receipt.json sha256 aabd85a58e14dee975e93325c145664f7b42b2704d836d73b0926ca8e2f2ff3f != committed receiptSha256 416f6e4bb893bd31208106005dcd2b53689a6f74ada2e987b98b247277446db1" } ] }
exit=1

$ node check-mutant.mjs --rev 98f0e360bb183ddb22fc96515cb4785cb5a07dc7 --repo <fixture> --json
{ "schema": "tabi-r42-routed-defects", "rev": "98f0e360…", "predicate": true, "findingCount": 0, "findings": [] }
exit=0
```

### Red/green table — primary fixture

| fixture | checker | exit | findings |
|---|---|---|---|
| `fixture` (2000 B valid JSON receipt, digest ≠ measure record) | **pristine** (lane bytes) | **1** | `r1a-digest-mismatch` |
| `fixture` (identical bytes/rev) | **mutant M** | **0** | *(none)* |

**Verdict: mutant KILLED.** The mutant greens a fixture the pristine checker refuses, so
the `sha256 == measureRecord` clause is load-bearing — dropping it destroys refusal of a
2000-byte, well-formed, but unbound receipt.

### Control matrix (scope + attribution)

| control fixture (same rev mechanism) | pristine | mutant | what it proves |
|---|---|---|---|
| `fixture-control-bound` — real r41 receipt bytes (`416f6e4b…`) | exit 0, no findings | exit 0, no findings | fixture is otherwise fully conformant; refusal above is caused by the digest, not leftover defects (axis D) |
| `fixture-control-small` — 999-byte valid-JSON receipt | exit 1, `r1a-too-small` | exit 1, `r1a-too-small` | size clause survives M (axis B) |
| `fixture-control-unparseable` — 1802-byte non-JSON receipt | exit 1, `r1a-unparseable` | exit 1, `r1a-unparseable` | parse clause survives M (axis B) |
| `fixture-control-witness` — real receipt, 2000-byte tampered witness | exit 1, `r1b-digest-mismatch` | exit 0, no findings | the same clause is load-bearing on the witness side too (axis C) |

`fixture-control-small`/`-witness` receipts/witnesses were generated deterministically at
exactly 999 / 2000 bytes and assert-validated as JSON before commit.

## Restoration / integrity evidence

- Lane checker sha256 **before** the probe: `b1d05df1…6b4a8`; **after** the probe:
  `b1d05df1…6b4a8` (same bytes; the probe only ever read the lane file).
- No writes, commits, fetches, pushes or VCS mutation in the production tree, the fleet
  repo, sibling `*-shokunin` repos, or `shokuknow`. Fixture commits were confined to
  `/fast/scratch/...`; each fixture's toplevel was asserted equal to its scratch path.
- Scratch removed at yield.

Evidence in this directory: `mutation.diff`, `check-mutant.mjs`, `pristine.out`,
`mutant.out`, `pristine.exit`, `mutant.exit`, `hashes.txt`, `fixture-manifest.txt`,
`fixture.rev`, `fixture-control-*.rev`.

## Limitations

- The fixture receipt is synthetic (2000 bytes as specified), not the 1.1 MB r41 receipt;
  the clause is exercised with a genuine byte difference, which is the property that
  matters, but message volume/shape for the real artifact is not exercised here.
- The r4 rows are fixture-local (`present` verdicts, synthetic 200-byte evidence), used
  only to keep the fixture green so r1a is the single variable. This seat makes **no**
  judgement about the real `re-adjudication.tsv` (still red by design).
- Controls cover receipt digest, witness digest, size and parse; no probe of the
  `*-binding-unavailable` branch (a measure record lacking the digest key) was run.
- Surviving mutants were not sought beyond M; a green fixture is a coverage statement,
  not a contract change.

VERDICT ok — mutant M (drop `sha256 == measureRecord` in r1a/r1b) is KILLED: pristine refuses the unbound 2000-byte receipt as `r1a-digest-mismatch` (exit 1) while the mutant greens it (exit 0, 0 findings); size/parse controls stay red and lane bytes are unchanged.
