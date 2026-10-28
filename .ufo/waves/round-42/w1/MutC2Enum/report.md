# MutC2Enum — C2 verdict-enum mutation probe (tabi round 42, wave 1)

Seat: `MutC2Enum` (mutation-tester, leaf)
Scope: one mutation probe of the frozen C2 checker's r4 verdict-enum clause.
Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin` (read-only for this seat)
Scratch: `/fast/scratch/hyaku/tabi-r42/MutC2Enum/` (deleted before yield)

## 0. Unit under mutation and frozen antecedent

| item | value |
|---|---|
| checker (frozen) | `.ufo/waves/round-42/counters/check-routed-defects-round42.mjs` |
| sha256 | `b1d05df17137bfcf4db9c6d2851108e1313cf2229167b8b521fee2aa1c76b4a8` |
| bytes | 9467 |
| byte-identical at freeze `9b6de3a19de11abdb80e82a1310abc64a40215bb` and at lane HEAD `0081bfdb93b6bd1bf2853bb128996f1a976b7218` | `git diff --stat 9b6de3a HEAD -- …/check-routed-defects-round42.mjs` → empty |

Frozen predicate clause under test (claims.json C2, r4):
> verdict in {present,absent,misbound,partial,unreachable}

Frozen implementation site (lines 156–160):

```js
for (const r of rows) {
  if (!VERDICTS.has(r.verdict)) { add('r4-verdict-enum', `${r.id}: verdict '${r.verdict}' not in enum`); continue; }
  const esize = gitBlobSize(r.evidence);
  if (esize === null) add('r4-evidence-absent', `${r.id}: evidence ${r.evidence} not committed at REV`);
  else if (esize < 200) add('r4-evidence-thin', `${r.id}: evidence ${r.evidence} is ${esize} bytes (<200)`);
}
```

## 1. The mutant (M): accept any verdict token in r4

Single-point, single-line mutation — the enum membership test replaced by a
non-empty-token test, so **any** verdict string is accepted:

```diff
--- checker-pristine.mjs
+++ checker-mutant.mjs
@@ -154,7 +154,7 @@
     if (missing.length) add('r4-ids-missing', `tsv misses staged ids: ${missing.join(',')}`);
     if (extra.length) add('r4-ids-extra', `tsv has unknown ids: ${extra.join(',')}`);
     for (const r of rows) {
-      if (!VERDICTS.has(r.verdict)) { add('r4-verdict-enum', `${r.id}: verdict '${r.verdict}' not in enum`); continue; }
+      if (!r.verdict) { add('r4-verdict-enum', `${r.id}: verdict '${r.verdict}' not in enum`); continue; }
       const esize = gitBlobSize(r.evidence);
       if (esize === null) add('r4-evidence-absent', `${r.id}: evidence ${r.evidence} not committed at REV`);
       else if (esize < 200) add('r4-evidence-thin', `${r.id}: evidence ${r.evidence} is ${esize} bytes (<200)`);
```

Evidence: `mutation.diff` (verbatim, `diff` exit 1 = one changed line), `checker-mutant.mjs`
(sha256 `aac87ec7a41c04d54b87b068cc4f60ee1dd227b60e610293b6149253e7ec915c`, 9453 bytes),
`node --check checker-mutant.mjs` → `syntax-ok`.

The `continue` is deliberately retained: the mutant keeps the *control-flow* skip and only
drops the *membership* test. `VERDICTS` becomes dead in the mutant; irrelevant to behaviour.

## 2. Fixtures

Built by `build-fixture.py`; each is its own git repo whose `rev-parse --show-toplevel`
was asserted equal to the fixture dir before the commit (`fixture-provenance.txt`).

Committed bytes per fixture (46 files): R1 receipt + witness (>1000 B JSON) bound by
`c1-measure.json` sha256s; R2 `SOURCES.md` with S146 `rejected` and S148
`supersedes S146 — The CLI now reports loopback sockets per process` verbatim in the
staged HTML (8 words); R3 `c1-baseline-noop.out` with the `ls-tree` command and the digit `0`;
R4 `slice-ids.txt` (38 ids) + `re-adjudication.tsv` (38 rows) + 38 committed evidence
blobs ≥200 B.

| fixture | rev | tsv verdicts | purpose |
|---|---|---|---|
| `fixtureA` | `4fe69459dc0c8f2b8ea0ec3b656e2d17354058fa` | 33 in-enum, **5 × `ok`** (S102,S118,S135,S153,S167) | the probe: real repairs present, ledger carries 5 out-of-enum tokens |
| `fixtureB-control` | `100ffd64c4ba4b7a8d19fd5dae16f12f3dcfc1bb` | 38 in-enum | control: same R1–R3 bytes, refusal must vanish → isolates the 5 tokens as the sole defect |
| `fixtureA` @ `21f14f2f7919ea20c1293129dfbb7f38e53f4ae8` | narrowness commit | 5 × `ok`, `ev-S106.txt` removed | proves the mutant still enforces the evidence clause |

`tsv-fixtureA.tsv` and `tsv-fixtureB-control.tsv` are the committed ledgers verbatim
(fixtureA = 5 lines matching `\tok\t`, fixtureB-control = 0).

## 3. Red/green table (exact observed runs)

All commands run from `/fast/scratch/hyaku/tabi-r42/MutC2Enum`. Full transcript:
`run-transcript.txt`.

| # | fixture | checker | exit | findings |
|---|---|---|---|---|
| 1 | fixtureA `4fe6945` | **pristine** (`b1d05df`) | **1** | 5 × `r4-verdict-enum` — S102, S118, S135, S153, S167 (`verdict 'ok' not in enum`) |
| 2 | fixtureA `4fe6945` | **mutant M** (`aac87ec`) | **0** | none — `predicate: true, findingCount: 0` |
| 3 | fixtureA `4fe6945` | restored bytes (`b1d05df`) | 1 | 5 × `r4-verdict-enum`, identical to #1 |
| 4 | fixtureB-control `100ffd6` | pristine | 0 | none |
| 5 | fixtureB-control `100ffd6` | mutant M | 0 | none |
| 6 | fixtureA @ `21f14f2` (evidence removed) | mutant M | 1 | 1 × `r4-evidence-absent` — `S106: evidence corpus/evidence/round42/quarantine/ev-S106.txt not committed at REV` |
| 7 | fixtureA @ `21f14f2` (evidence removed) | pristine | 1 | 5 × `r4-verdict-enum` + 1 × `r4-evidence-absent` (S106) |
| 8 | real lane HEAD `0081bfd` | pristine (read-only) | 1 | 1 × `r4-quarantine-absent` — `.ufo/waves/round-42/quarantine/re-adjudication.tsv not committed at REV` |

Row 8 is the calibration anchor: the real lane at HEAD is red on **exactly one** finding, and
it is the r4 TSV absence — confirming this seat's fixture reproduces every other R1/R2/R3
condition faithfully rather than inventing an easier predicate.

### Row 1 vs 2 — the discriminating pair

```
pristine → {"predicate": false, "findingCount": 5, ...} exit 1
mutant   → {"predicate": true,  "findingCount": 0, ...} exit 0
```

Same fixture, same rev, same 38 committed evidence blobs. The **only** delta is the dropped
enum clause. A weakened checker greens a ledger that the frozen checker refuses.

## 4. Verdict

**Mutant M: KILLED** — fixture A separates it from pristine (exit 1/5 findings → exit 0/0 findings).
Baseline is not a failure: the pristine checker produced its expected refusal, so the probe is
conclusive rather than inconclusive.

**Conclusion: the r4 verdict-enum clause is load-bearing.** Absent it, five out-of-enum verdict
tokens (`ok`) satisfy the frozen C2 predicate, i.e. the claims.json requirement
"verdict in {present,absent,misbound,partial,unreachable}" would be unenforced by its own
instrument while `predicate: true` is printed. The clause is not decorative.

Row 6 bounds the finding: the mutant is surgical — it still refuses a missing evidence blob, so
the green in row 2 is attributable to the enum clause alone, not to collateral damage in R4.

## 5. Restoration evidence

- The lane checker was **never** the mutation target: its sha256 is `b1d05df…` before and after
  (`lane-reality.txt`, `restore-evidence.txt`) and `git status --porcelain .ufo/waves/round-42/counters/`
  is empty.
- `checker-restored.mjs` (byte-identical copy of pristine, sha256 `b1d05df…`) reproduces the
  identical 5-finding output on fixture A (row 3).
- The scratch working copy was restored in place after the probe: `cp checker-pristine.mjs
  checker-mutant.mjs` → both `b1d05df…`, and the post-restore run on fixture A returns exit 1 with
  the same 5 findings (`restore-evidence.txt`).
- The mutant bytes are preserved as evidence in this seat dir only (`checker-mutant.mjs`,
  `aac87ec…`), so the deliverable survives the scratch teardown.

## 6. Limitations

- The probe covers **only** the verdict-enum clause. It says nothing about r4 id-set, duplicate,
  malformed-row or evidence-size clauses, and nothing about R1/R2/R3 — those were held fixed and
  passing (fixture B control) to isolate the mutation.
- The mutant still rejects an **empty** verdict cell (`!r.verdict`); "accept any verdict token"
  is therefore exact — any non-empty token passes, no token does not. A mutant that also removed
  the `continue`/evidence path was not attempted (out of assigned scope).
- Fixtures are synthetic and satisfy the frozen predicate by construction; they are a detector
  for the checker's discrimination, not evidence about the real quarantine adjudication, which at
  lane HEAD does not yet exist (row 8). **This seat does not move C2**: the real repairs are absent
  from the lane, and the kill rule ("any mutation seat that greens a weakened checker copy without
  the real repairs … refuses admission") is a statement about exactly the weakened-copy green
  demonstrated in row 2 — reported here as a hole surface, not as an admission.
- Clock/host: local loopback and local files only; no network fetches, no installs, no pacman.
  Nothing was installed or upgraded, so no tool/version/channel record is owed.

## 7. Evidence files (all in this dir, hashes in `evidence-manifest.sha256`)

`checker-pristine.mjs`, `checker-mutant.mjs`, `checker-restored.mjs`, `mutation.diff`,
`build-fixture.py`, `fixtures.json`, `tsv-fixtureA.tsv`, `tsv-fixtureB-control.tsv`,
`run-transcript.txt`, `restore-evidence.txt`, `fixture-provenance.txt`, `lane-reality.txt`,
`evidence-manifest.sha256`.

Scratch `/fast/scratch/hyaku/tabi-r42/MutC2Enum/` deleted before yield.

VERDICT ok — r4 verdict-enum clause is load-bearing: mutant M (`aac87ec`) greens fixture A (exit 0, 0 findings) where pristine `b1d05df` refuses (exit 1, 5 × `r4-verdict-enum`: S102,S118,S135,S153,S167), while the mutant still refuses a missing evidence blob (row 6) and lane HEAD remains red only on `r4-quarantine-absent`.
