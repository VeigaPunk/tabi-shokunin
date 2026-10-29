# MutC2Bind — mutation: drop the r5 sha256 equality check (keep quote check)

Round 43, wave 1. Axis judged: **calibration** (claim C2, the round-42 routed-defect checker
`.ufo/waves/round-43/counters/check-routed-defects-round43.mjs`).

## Verdict up front

**The r5 sha256 equality clause is LOAD-BEARING.** Dropping it turns two inputs that the frozen
bytes REFUSE into inputs the mutant ACCEPTS (exit 0, predicate true, zero findings):

| fixture input | frozen bytes | mutant (sha256 check dropped) |
|---|---|---|
| A — `claims.json` `controlBindings[].sha256` points at different bytes, quote still present | exit 1, `r5-binding-sha-mismatch` | **exit 0, predicate true, 0 findings** |
| B — control BYTES tampered, `claims.json` left pristine | exit 1, `r5-binding-sha-mismatch` | **exit 0, predicate true, 0 findings** |

The mutant still refuses a quote-absent input (both report `r5-binding-quote-absent`), confirming
the mutation was exactly "drop the sha256 equality check, keep the quote check" and nothing else.

## 1. Frozen bytes and the mutation

Frozen checker (never modified on disk — see §6):

```
/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/counters/check-routed-defects-round43.mjs
sha256 2f150b8422c1c70c816a49129eb0709ef759c82b3fa19733673f2314f8911743
```

The working-tree file and the blob at the freeze commit `7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc`
hash identically (checked with `git cat-file -p <rev>:<path> | sha256sum`), i.e. the lane copy is
byte-identical to the frozen blob.

The r5 clause in the frozen checker (lines 188–204) is:

```js
for (const b of binds) {
  const tag = b.path ? b.path.replace(/[^A-Za-z0-9./_-]/g, '').slice(-40) : 'unnamed';
  if (!b.path || !/^[0-9a-f]{64}$/.test(b.sha256 || '')) { add('r5-binding-malformed', tag); continue; }
  if (!requireBlob(`r5-ctl-${tag}`, b.path)) continue;
  const raw = gitShow(b.path);
  if (sha256(raw) !== b.sha256) add('r5-binding-sha-mismatch', `${b.path} sha256 ${sha256(raw)} != frozen ${b.sha256}`);
  if (typeof b.quote !== 'string' || b.quote.length < 8 || !raw.toString('utf8').includes(b.quote)) add('r5-binding-quote-absent', `${b.path} quote line not found verbatim in committed control bytes`);
}
```

Mutation applied to the **scratch copy** only — one line deleted:

```diff
--- .../counters/check-routed-defects-round43.mjs   (frozen)
+++ /fast/scratch/hyaku/tabi-r43/MutC2Bind/check-routed-defects-round43.MUT.mjs   (mutant)
@@ -197,7 +197,6 @@
       if (!b.path || !/^[0-9a-f]{64}$/.test(b.sha256 || '')) { add('r5-binding-malformed', tag); continue; }
       if (!requireBlob(`r5-ctl-${tag}`, b.path)) continue;
       const raw = gitShow(b.path);
-      if (sha256(raw) !== b.sha256) add('r5-binding-sha-mismatch', `${b.path} sha256 ${sha256(raw)} != frozen ${b.sha256}`);
       if (typeof b.quote !== 'string' || b.quote.length < 8 || !raw.toString('utf8').includes(b.quote)) add('r5-binding-quote-absent', `${b.path} quote line not found verbatim in committed control bytes`);
```

Mutant sha256: `974fdd68bce7dad262c9b4d5683b181664faee39bc6ebb59a20af5cd9471b9a0`.
Full diff: `.ufo/waves/round-43/w1/MutC2Bind/mutation.diff`.

## 2. Scratch fixture (created, not borrowed)

Scratch root: `/fast/scratch/hyaku/tabi-r43/MutC2Bind/`. The fixture is a fresh git repo created
with `git init -q` under the scratch root; `git rev-parse --show-toplevel` was asserted to equal the
fixture dir before any commit; every commit used a per-commit throwaway identity
(`git -c user.name=tabi-fixture -c user.email=fixture@localhost`); no remotes exist.

The fixture is populated read-only from the production tree via
`git -C /home/vgpnk/Projects/shokunin/tabi-shokunin archive <frozen rev> <paths> | tar -xf -`.
Paths: the r41 receipt + witness, the pinned measure record, `corpus/SOURCES.md`, the staged node
CLI copy, the baseline control, the r42 quarantine TSV + slice ids, the round-43 `claims.json`,
all `.ufo/waves/round-43/controls/*`, and every evidence path named by the quarantine TSV
(55 paths total; `paths.txt`).

The reproduction script is committed as evidence:
`.ufo/waves/round-43/w1/MutC2Bind/build-fixture.sh` (it rebuilds the pristine fixture plus variants
A, B, C from the frozen commit). A fresh independent rebuild was executed and reproduced the same
verdict matrix (§5).

## 3. Fixture variants and observed commands

`FRZ` = frozen checker, `MUT` = mutated scratch copy.
Command form for both: `node <checker> --rev <40-hex rev> --repo <fixture dir> --json`.

### Baseline — pristine fixture (frozen == green)

```
$ node $FRZ --rev 5ab4b6e69a79853bb492cfea72fecaab5223a2fe --repo $D --json
predicate true, findingCount 0, findings []   EXIT=0
$ node $MUT --rev 5ab4b6e69a79853bb492cfea72fecaab5223a2fe --repo $D --json
predicate true, findingCount 0, findings []   EXIT=0
```

The baseline is green for both copies, so the mutant's behaviour below is attributable to the
mutation, not to a broken fixture.

### Variant A — `controlBinding.sha256` points at different bytes, quote still present

`claims.json` was edited so that the `c2-tree-fixture.json` binding's `sha256` field carries the
digest of *different* bytes (the `c1-battery-r43.json` control), while the binding's `quote`
string is still present verbatim in the committed control bytes. Control bytes themselves untouched.

```
$ node $FRZ --rev 13808a5df7868bf87055f94285487c6162dddc85 --repo $D --json
EXIT=1  predicate false  findingCount 1
  r5-binding-sha-mismatch: .ufo/waves/round-43/controls/c2-tree-fixture.json
    sha256 3443ad72fc05b0390d577be8ad9dc88b9ac903dbfb2b7e8d07124f7ec12ac3bf != frozen
    6cb61f1150406e490ec9ba8f54353bf0b8d7ce02ccd31df8388d17d813ef9aed

$ node $MUT --rev 13808a5df7868bf87055f94285487c6162dddc85 --repo $D --json
EXIT=0  predicate true   findingCount 0  findings []
```

**The mutant ACCEPTS what the frozen bytes REFUSE.** This is the kill: the mutation deletes the
only check that a frozen control digest still describes the committed control bytes.

### Variant B — control BYTES tampered, `claims.json` pristine

The committed control `.ufo/waves/round-43/controls/c2-baseline-red-r43.json` was rewritten so it
records `exit 0 / findingCount 0 / predicate true` (i.e. it falsely claims the baseline was green);
the quote anchor ` "findingIds": [` survives. `claims.json` was restored to the pristine frozen
bytes, so its recorded digest still describes the ORIGINAL control bytes.

```
$ node $FRZ --rev e01d878a76847efb27fc38595badd5b27773faa9 --repo $D --json
EXIT=1  predicate false  findingCount 1
  r5-binding-sha-mismatch

$ node $MUT --rev e01d878a76847efb27fc38595badd5b27773faa9 --repo $D --json
EXIT=0  predicate true   findingCount 0  findings []
```

Second independent kill in the opposite direction: the mutant accepts tampered control bytes that
the frozen bytes refuse. This is the substantive case — it shows the clause is what stops a control
receipt (e.g. a "baseline was red" receipt) from being rewritten to say the opposite while the
freeze still names it.

### Variant C — quote absent, sha256 correct (negative control for the mutation)

```
$ node $FRZ --rev 9db26e5aff684ecaf3f024674580879c56396438 --repo $D --json
EXIT=1  findingCount 1  ['r5-binding-quote-absent']
$ node $MUT --rev 9db26e5aff684ecaf3f024674580879c56396438 --repo $D --json
EXIT=1  findingCount 1  ['r5-binding-quote-absent']
```

Both refuse. The quote check survives the mutation, as required by the mutation spec, and the
mutant is not simply "r5 disabled" — it is specifically the sha256 half of r5 that is lost.

### Committed controls re-run against both copies (lane read-only)

Committed baseline-red control (`c2-baseline-red-r43.json`, rev `ab592825cd195599822ca227f7768914df208201`):

```
$ node $FRZ --rev ab592825cd195599822ca227f7768914df208201 --repo <real repo> --json
EXIT=1  findingCount 2  ['r5-claims-absent', 'r6-probe-absent']     (matches the committed control)
$ node $MUT --rev ab592825cd195599822ca227f7768914df208201 --repo <real repo> --json
EXIT=1  findingCount 2  ['r5-claims-absent', 'r6-probe-absent']
```

Committed freeze revision itself (real repo, frozen bytes and mutant):

```
$ node $FRZ --rev 7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc --repo <real repo> --json   EXIT=0  predicate true  0 findings
$ node $MUT --rev 7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc --repo <real repo> --json   EXIT=0  predicate true  0 findings
```

Both green on the frozen commit — the mutation is invisible on honest input, which is exactly what
makes it a calibration hole rather than an obvious breakage.

### V0-fabrication and tree-object controls (rebuilt equivalents)

The committed V0-probe and tree-fixture receipts name fixture revs
`a1f3887724f5ec3f6213c068199e9d8454948ece` and `d28c27897e203857195a88e59683b6c129d0c804`;
those objects are **not present** in the lane repo (checked with `git cat-file -t` in both
`tabi-shokunin` and the fleet root — "could not get object info"), so I rebuilt equivalents from
the frozen commit rather than replaying them:

* V0-style fabrication (`claims.json` + `c2-v0-probe.json` removed, measure record replaced so
  its blob id is no longer `8ff64d69…`):
  frozen → EXIT 1 `['r1-measure-blob-pin-mismatch','r5-claims-absent','r6-probe-absent']`;
  mutant → EXIT 1, **identical** finding set. The r1 blob-id pin and r6 still hold without the r5
  sha256 clause.
* Receipt path replaced by a TREE object:
  frozen → EXIT 1 `['r1a-not-a-blob','r5-binding-sha-mismatch']`;
  mutant → EXIT 1 `['r1a-not-a-blob']`. The r1 blob-type gate (S151) is untouched by this mutation;
  only the r5 sha256 finding disappears.

### Self-consistent rebinding (both bytes and the declared digest updated)

For completeness: rewriting the control bytes AND updating `claims.json`'s recorded digest to
match the new bytes is accepted by **both** copies (EXIT 0, 0 findings). That is not a mutation
artefact — the frozen clause has the same behaviour — it shows the clause is an *equality* check
against a frozen declaration, not a provenance check. This is the residual model C2 already
declares (committed-byte re-derivation of pins), not a new hole opened by this mutation.

## 4. Load-bearing determination

Clause r5's sha256 equality is load-bearing iff the mutated copy greens (or loses the named
finding) on input the frozen bytes refuse. Observed:

* Variant A: frozen EXIT 1 `r5-binding-sha-mismatch` → mutant EXIT 0, zero findings. **Satisfied.**
* Variant B: frozen EXIT 1 `r5-binding-sha-mismatch` → mutant EXIT 0, zero findings. **Satisfied.**

Two independent constructions, both killed. **Verdict: load-bearing = yes.** The mutant is
**killed** by both variants.

## 5. Independent rebuild (reproducibility)

`build-fixture.sh` was re-run into a fresh scratch dir (`verify.EsMiqj`), producing new revs, and
the full matrix was re-executed:

```
b0dd98c frozen exit=0 0 []                       <- pristine fixture
b0dd98c mut    exit=0 0 []
1d0c486 frozen exit=1 1 ['r5-binding-sha-mismatch']  <- variant A (sha256 points at different bytes)
1d0c486 mut    exit=0 0 []
01e2b38 frozen exit=1 1 ['r5-binding-quote-absent'] <- variant C (quote absent)
01e2b38 mut    exit=1 1 ['r5-binding-quote-absent']
ac07cdf frozen exit=1 1 ['r5-binding-sha-mismatch']  <- variant B (control bytes tampered)
ac07cdf mut    exit=0 0 []
```

Identical to the first run. (Revs differ from the first run because commit timestamps differ.)

## 6. Lane integrity / restoration

* The frozen checker was **never edited in place**; the mutant exists only at
  `/fast/scratch/hyaku/tabi-r43/MutC2Bind/check-routed-defects-round43.MUT.mjs`. Post-run hash of
  the lane file is still `2f150b8422c1c70c816a49129eb0709ef759c82b3fa19733673f2314f8911743`,
  identical to the frozen blob hash (evidence: `checker-hashes.txt`).
* No commits, no pushes, no `git`/`jj` mutation in the production tree, the fleet root, sibling
  repos, or `shokuknow`. `git status --porcelain` in `tabi-shokunin` shows only pre-existing /
  sibling-agent changes (`corpus/README.md`, `corpus/knowledge/…`, `corpus/lessons/round-43.md`,
  `.ufo/waves/round-43/w1/`), none of them authored by this seat. The only writes this seat made
  are under `.ufo/waves/round-43/w1/MutC2Bind/`, `.ufo/waves/round-43/w1/MutC2Bind.md`, and its
  own scratch dir.
* All mutation runs used the scratch copies; the fixture git repo lives only under the scratch
  root and is deleted before yield (see §8).

## 7. Evidence files (all under the seat dir)

`.ufo/waves/round-43/w1/MutC2Bind/`

| file | content |
|---|---|
| `mutation.diff` | frozen → mutant unified diff (one deleted line) |
| `checker-hashes.txt` | sha256 of frozen lane file and of the mutant |
| `build-fixture.sh` | reproducible fixture builder (pristine + variants A/B/C) |
| `fixture-revs.txt` | fixture rev → variant mapping |
| `fixture-patches/*.patch` | the fixture commits as patches |
| `mut-pristine.json`, `frozen-tampered.json`, `mut-tampered.json` | baseline + variant A outputs |
| `frozen-controlbytes3.json`, `mut-controlbytes3.json` | variant B outputs |
| `frozen-quoteabsent.json`, `mut-quoteabsent.json` | variant C outputs |
| `frozen-v0.json`, `mut-v0.json` | rebuilt V0-fabrication outputs |
| `frozen-tree.json`, `mut-tree.json` | tree-object outputs |
| `frozen-baseline-red.json`, `mut-baseline-red.json` | committed baseline-red control re-run |
| `mut-real-frozencommit.json` | mutant on the frozen commit in the real repo |
| `frozen-selfconsistent.json`, `mut-selfconsistent.json` | self-consistent rebinding outputs |

## 8. Limitations

* The committed V0-probe and tree-fixture receipts reference fixture revs absent from the lane
  repo, so their committed byte-level replay could not be run; equivalents were rebuilt from the
  frozen commit (documented in §3). The rebuilt equivalents reproduce the committed receipts'
  *finding sets* for the frozen bytes, but they are not the same objects.
* The claim-C2 pin `MEASURE_BLOB_PIN` is a blob id of the frozen commit's measure record; a fixture
  commit necessarily produces a different blob id for any edited measure file, so variant A/B/C
  avoid touching the measure record and the r1 pin stays satisfied there.
* The r5 clause binds controls by path + digest + quote inside `claims.json`; as §3 shows, a
  self-consistent edit of both the control bytes and the declared digest is accepted by the frozen
  bytes too. The mutation result therefore establishes that the *equality* clause is load-bearing
  against one-sided tampering only — consistent with the residual model C2 declares.
* No tool was installed or upgraded; `node v24.21.0` and `git 2.56.0` (pre-installed) were used.
  No pacman transaction was run (host-wide pacman guard).
* The scratch root `/fast/scratch/hyaku/tabi-r43/MutC2Bind/` (fixture repo, mutant copy, patch
  series, raw JSON) is deleted before yield; everything needed for re-examination was copied into
  the seat dir first.

VERDICT ok r5 sha256 equality is load-bearing (mutant killed twice): dropping it makes check-routed-defects-round43 accept (exit 0) a claims.json whose controlBinding digest points at different bytes, and control bytes tampered against a pristine claims.json, both of which the frozen bytes refuse with r5-binding-sha-mismatch
