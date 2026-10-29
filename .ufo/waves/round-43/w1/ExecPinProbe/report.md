# ExecPinProbe — measure blob id stability (tabi round 43, wave 1)

Seat: `ExecPinProbe` (leaf executor; axis judged: **calibration**; milestone: **measure blob id
stability**).
Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin` — **read-only** for this seat.
Scratch root: `/fast/scratch/hyaku/tabi-r43/ExecPinProbe/` (created by this seat, deleted at seat end).
Frozen inputs: round-43 claims freeze at `7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc`, baseline
`ab592825cd195599822ca227f7768914df208201`. No counter/claims/checker byte was amended, proposed
for amendment, or modified; the r43 checker was executed from the lane as committed.

The same report body is filed twice, at the two paths this seat is allowed to write:
`.ufo/waves/round-43/w1/ExecPinProbe.md` (the item's `Report:` trailer path) and
`.ufo/waves/round-43/w1/ExecPinProbe/report.md` (the seat directory), with the evidence files
under `.ufo/waves/round-43/w1/ExecPinProbe/evidence/`.

---

## 1. Question

The round-43 C2 checker pins the round-41 measure record by its **immutable git blob id**:

```
.ufo/waves/round-43/counters/check-routed-defects-round43.mjs:27
const MEASURE_BLOB_PIN = '8ff64d691f5c09569a50f2a5a038bb23774c3d35';
```

The item asks: resolve `git rev-parse <rev>:.ufo/waves/round-41/measure/c1-measure.json` at five
revisions and confirm that all five equal the pin; produce the receipt; and (for calibration)
establish that the pin actually has teeth.

## 2. Full-hash resolution of `123e55c`

The short rev named in the r42 evidence (`.ufo/waves/round-42/w1/CritC2Ledger/report.md:140-144`)
resolves in the lane repo to:

```
$ git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse 123e55c
123e55c77bb101be008db4cbf8ffca626423335a
```

(This is also present as a `refs/jj/keep/123e55c…` ref in the lane — evidence/08.)

## 3. The receipt — five required revisions

Exact command (run from the lane root; every call is a read):

```
$ for r in 123e55c77bb101be008db4cbf8ffca626423335a \
           9b6de3a19de11abdb80e82a1310abc64a40215bb \
           15b75a7337089ed42208555a71ed89a966b21932 \
           ab592825cd195599822ca227f7768914df208201 \
           7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc; do
    git -C $LANE rev-parse "$r:.ufo/waves/round-41/measure/c1-measure.json"
  done
```

Observed output (verbatim, evidence/01):

```
123e55c77bb101be008db4cbf8ffca626423335a  8ff64d691f5c09569a50f2a5a038bb23774c3d35
9b6de3a19de11abdb80e82a1310abc64a40215bb  8ff64d691f5c09569a50f2a5a038bb23774c3d35
15b75a7337089ed42208555a71ed89a966b21932  8ff64d691f5c09569a50f2a5a038bb23774c3d35
ab592825cd195599822ca227f7768914df208201  8ff64d691f5c09569a50f2a5a038bb23774c3d35
7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc  8ff64d691f5c09569a50f2a5a038bb23774c3d35
```

**All five equal the pin `8ff64d691f5c09569a50f2a5a038bb23774c3d35`.** Lane HEAD at seat time
(`ba433c94b14a0e0d5ecf2eba1be0a8ee3064491c`, the commit that added the round-43 C1 receipt) also
carries the same blob id.

Object facts (evidence/01):

```
$ git cat-file -t 8ff64d691f5c09569a50f2a5a038bb23774c3d35   -> blob
$ git cat-file -s 8ff64d691f5c09569a50f2a5a038bb23774c3d35   -> 3284
$ git cat-file blob 8ff64d691f5c09569a50f2a5a038bb23774c3d35 | sha256sum
5e2a83ac02b9a4ec3f7d0ebec21f5fa9b3469d4110ac23f8e78af18b43913f13  -
```

## 4. Independent derivation (not the same command)

Three further derivations agree with `git rev-parse` (evidence/02):

```
$ git ls-tree <rev> -- .ufo/waves/round-41/measure/c1-measure.json
123e55c77bb101be008db4cbf8ffca626423335a  100644 blob 8ff64d691f5c09569a50f2a5a038bb23774c3d35  .ufo/…
9b6de3a19de11abdb80e82a1310abc64a40215bb  100644 blob 8ff64d691f5c09569a50f2a5a038bb23774c3d35  .ufo/…
15b75a7337089ed42208555a71ed89a966b21932  100644 blob 8ff64d691f5c09569a50f2a5a038bb23774c3d35  .ufo/…
ab592825cd195599822ca227f7768914df208201  100644 blob 8ff64d691f5c09569a50f2a5a038bb23774c3d35  .ufo/…
7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc  100644 blob 8ff64d691f5c09569a50f2a5a038bb23774c3d35  .ufo/…
ba433c94b14a0e0d5ecf2eba1be0a8ee3064491c  100644 blob 8ff64d691f5c09569a50f2a5a038bb23774c3d35  .ufo/…

$ printf '7ca6f01…:.ufo/waves/round-41/measure/c1-measure.json\n' | git cat-file --batch-check
8ff64d691f5c09569a50f2a5a038bb23774c3d35 blob 3284

$ git hash-object .ufo/waves/round-41/measure/c1-measure.json     # working-tree copy
8ff64d691f5c09569a50f2a5a038bb23774c3d35
$ git status --porcelain -- .ufo/waves/round-41/measure/c1-measure.json   # empty -> unmodified
```

The working-tree file is byte-identical to the committed blob (no local modification of the
record under test).

## 5. Exhaustive stability sweep — every commit, every ref

`git log --all -- <path>` shows the path was **added** twice (never modified), on two divergent
branches, with byte-identical content:

```
$ git log --all --format='%H %ad %s' --date=short -- .ufo/waves/round-41/measure/c1-measure.json
123e55c77bb101be008db4cbf8ffca626423335a 2026-10-28 round-41: record measured results and honest queued-wave disposition
59f21592db6ab6250e4d42d6f5db92d70163b31a 2026-10-28
$ git log --all --format='%H' --name-status -- .ufo/waves/round-41/measure/c1-measure.json
123e55c…  A   .ufo/waves/round-41/measure/c1-measure.json
59f2159…  A   .ufo/waves/round-41/measure/c1-measure.json
```

(59f2159's parent 8c84417 and 123e55c's parent do not contain the path; the two adds are
byte-identical, hence the same blob id.)

Exhaustive sweep over all 992 commits reachable from all 902 refs (heads, remotes, the 900-ish
`refs/jj/keep/*` refs, `refs/stash`) — evidence/08:

```
$ for c in $(git rev-list --all); do git rev-parse --verify --quiet $c:.ufo/waves/round-41/measure/c1-measure.json; done | sort | uniq -c
     60 8ff64d691f5c09569a50f2a5a038bb23774c3d35
    932 ABSENT
```

**60 commits carry the path; every one of them carries blob id `8ff64d69…`. No other blob id has
ever existed at that path in this repository.** The pin is therefore not merely "stable across the
five named revs" — it is the *only* content the path has ever held.

## 6. The frozen checker never sees a pin mismatch (evidence/04)

```
$ node .ufo/waves/round-43/counters/check-routed-defects-round43.mjs --rev <rev> --repo $LANE --json
rev 123e55c…  exit=1 count=8  [r1a-absent, r1b-absent, r2-s146-not-rejected, r2-supersession-absent,
                                r3-baseline-file-empty, r4-slice-absent, r5-claims-absent, r6-probe-absent]
rev 9b6de3a…  exit=1 count=3  [r4-tsv-absent, r5-claims-absent, r6-probe-absent]
rev 15b75a7…  exit=1 count=2  [r5-claims-absent, r6-probe-absent]
rev ab59282…  exit=1 count=2  [r5-claims-absent, r6-probe-absent]
rev 7ca6f01…  exit=0 count=0  []            <- round-43 freeze commit: predicate true
rev ba433c9…  exit=0 count=0  []            <- lane HEAD at seat time
```

`r1-measure-blob-pin-mismatch` appears at **no** revision — the pin holds wherever the record
exists; the red at older revs is other rules' business (absent r41/r42/r43 artifacts), not the pin.

## 7. Teeth of the pin (scratch fixtures; lane untouched)

Fixture: `git clone --shared` of the lane into the scratch root, checked out at
`ba433c94b14a0e0d5ecf2eba1be0a8ee3064491c`; toplevel asserted equal to the fixture dir before
any commit; throwaway identity `exec-pin-probe@fixture.local` local to the fixture; the lane repo
was only read. The checker was run from the lane (frozen bytes) with `--repo` pointed at the
fixture. Evidence/05.

**Control** — unmodified clone HEAD: `predicate=true count=0`.

**Variant A2 — valid-JSON self-authored replacement measure record** (one added field
`"selfAuthoredReplacement": true`; the record still parses and still carries the same
`receiptSha256`/`witnessSha256`, so the r1a/r1b digest comparison still passes):

```
$ git rev-parse HEAD:.ufo/waves/round-41/measure/c1-measure.json
4ce083ae29cdbf742138a2912f35aee8d1c644ef
exit=1
predicate=false count=1
  r1-measure-blob-pin-mismatch :: .ufo/waves/round-41/measure/c1-measure.json object id
     4ce083ae29cdbf742138a2912f35aee8d1c644ef != pinned 8ff64d691f5c09569a50f2a5a038bb23774c3d35
```

The pin is the **only** rule that refuses this variant — i.e. it closes exactly the r42 hole
CritC2Ledger documented (r1 bound to an unpinned, mutable measure record).

**Variant B — the measure path replaced by a tree object** (the r42 V14 defect class, aimed at
the measure path):

```
$ git cat-file -t HEAD:.ufo/waves/round-41/measure/c1-measure.json   -> tree
exit=1
predicate=false count=1
  r1-measure-not-a-blob :: .ufo/waves/round-41/measure/c1-measure.json resolves to object type
     'tree', frozen sentence requires blob
```

## 8. The committed V0-fabrication probe re-run (evidence/06)

The committed control generator was re-executed from the lane against a scratch fixture
(`--work` inside this seat's scratch root; the generator writes only under `--work` and `--out`):

```
$ node .ufo/waves/round-43/fixtures/v0-fabrication.mjs --out $S/v0-probe.json --work $S/v0work \
      --slice $LANE/.ufo/waves/round-42/quarantine/slice-ids.txt
exit=0
{ "schema":"tabi-r43-c2-v0-probe", "fixtureRev":"62fd1d0665abfa69db01908218ab44cdc19a0689",
  "generatorDigest":"b87470625b11aa5b13d72cf1ac888ed004bff7b1d2ef7501f746d2142cb0b80c",
  "refused":true, "checkerExit":1,
  "findingIds":["r1-measure-blob-pin-mismatch","r5-claims-absent","r6-probe-absent"],
  "r42CheckerExit":0, "r42FindingCount":0, "r42FindingIds":[] }
```

i.e. the fully self-consistent V0 fabrication is still greened by the **round-42** checker bytes
(the documented hole) and is **refused by the round-43** bytes via the measure-blob pin. The
generator's sha256 matches `claims.json.frozenDigests["…/fixtures/v0-fabrication.mjs"]`
(`b87470625b11aa5b13d72cf1ac888ed004bff7b1d2ef7501f746d2142cb0b80c`), so the bytes exercised are
the frozen ones.

## 9. Findings

1. **The pin is well-founded and load-bearing.** The r41 measure record has had exactly one
   content in the repository's entire history (60 commits, 2 independent adds, 0 modifications);
   the pin is therefore content-stable, and the checker refuses a self-authored replacement
   (variant A2) *and* a tree substituted at the path (variant B) while every other rule stays
   green. No hole found against the pin as worded.
2. **Scope boundary (not a defect).** The C2 pin covers the *round-41* record at
   `.ufo/waves/round-41/measure/c1-measure.json`. The round-43 C1 artifact
   `.ufo/waves/round-43/measure/c1-measure-r43.json` (committed at lane HEAD as blob
   `ee5ffaf8a2f67ea813dbee76a136c35480a23d81`) is **not** covered by any blob-id pin; it is bound
   by its Ed25519 wrapper signature and the C1 counter's challenge-response instead. A byte change
   to *that* file is caught by signature verification, not by an object-id pin — a different
   mechanism, and outside this item's scope, but recorded here so the closure does not read the
   C1 record as blob-pinned.
3. **Theoretical limit of any blob-id pin.** The pin is a SHA-1 git object id; reproducing it
   requires the exact bytes (or a SHA-1 collision). Git's SHA-1 implementation is
   collision-detecting (SHA-1DC), and the declared residual model puts cryptographic collisions
   out of scope. Noted for completeness; no in-model bypass was found.

## 10. Limitations

- The sweep reflects the lane repo **as of seat time** (HEAD `ba433c94b14a0e0d5ecf2eba1be0a8ee3064491c`,
  992 commits, 902 refs). Later commits could in principle change the record; the closure should
  re-run the five-rev receipt (evidence/01) at the measured revision.
- The lane repo was never mutated: no commit, no fetch, no push, no `jj` operation, no index
  write, no checkout. All mutations happened in a scratch clone under this seat's scratch root.
- `git clone --shared` writes an alternates file pointing at the lane's object store; the clone
  was deleted with the scratch root at seat end, so no reference to the lane's objects remains.
- The teeth variants (A2, B) exercise the checker's r1 rules only; the other five rules were
  verified green in the control run at the same rev.
- No claim verdict is asserted here. The C2 sentence's overall truth at a measured revision is
  not this seat's claim to decide — only the stability and the teeth of the measure-blob pin.

## 11. Tooling

`/home/vgpnk/.omp/agent/RULES.md` was read before any tool use. **No install or upgrade was
performed** — none was needed: `git 2.56.0` and `node v24.21.0` (both already installed) cover
every command used. No package manager was invoked; `pacman` was not run (host-wide guard
respected). Channels available had an install been required: `uv tool install` / official
release binaries in `~/.local/bin`; none used.

Frozen bytes verified by digest before use (evidence/07):

```
2f150b8422c1c70c816a49129eb0709ef759c82b3fa19733673f2314f8911743  .ufo/waves/round-43/counters/check-routed-defects-round43.mjs
b87470625b11aa5b13d72cf1ac888ed004bff7b1d2ef7501f746d2142cb0b80c  .ufo/waves/round-43/fixtures/v0-fabrication.mjs
290c87d5c8916d2ee761181c1291365572068b7ad87c16839526df1526e73029  .ufo/waves/round-43/claims.json
```

Both digests equal the corresponding `claims.json.frozenDigests` entries; no frozen byte was
modified.

## 12. Evidence index (all under `.ufo/waves/round-43/w1/ExecPinProbe/evidence/`)

| file | content |
|---|---|
| `01-rev-parse-five-revs.txt` | the primary receipt: five revs + HEAD → pin; blob type/size/sha256 |
| `02-independent-methods.txt` | `git ls-tree`, `cat-file --batch-check`, `hash-object`, `status` |
| `03-history-all-blobs.txt` | path history, both adds, absence at parents, `rev-list --objects` |
| `04-checker-across-revs.txt` | frozen checker run at each of the five revs, plus HEAD and 59f2159 |
| `05-pin-teeth.txt` | control + variant A2 (self-authored record) + variant B (tree at path) |
| `06-v0-probe.txt` | re-run of the committed V0-fabrication probe (r42 green / r43 refuses) |
| `07-tooling.txt` | git/node versions, frozen digests, "no installs" statement |
| `08-exhaustive-sweep.txt` | 992-commit sweep: 60 × pin, 932 absent, no other blob id ever |
| `09-manifest.txt` | sha256 of every evidence file above |

Scratch root `/fast/scratch/hyaku/tabi-r43/ExecPinProbe/` was deleted before this report was
finalised. Nothing was written outside `.ufo/waves/round-43/w1/ExecPinProbe.md` and
`.ufo/waves/round-43/w1/ExecPinProbe/`.

VERDICT ok — the pinned measure blob id `8ff64d691f5c09569a50f2a5a038bb23774c3d35` is the
object id of `.ufo/waves/round-41/measure/c1-measure.json` at all five required revisions
(123e55c77bb…, 9b6de3a1…, 15b75a73…, ab592825…, 7ca6f018…), at lane HEAD, and at every one of
the 60 commits in the repo's whole history that carry the path — and the frozen r43 checker
refuses both a self-authored replacement record and a tree substituted at that path, so the pin
is stable and load-bearing.
