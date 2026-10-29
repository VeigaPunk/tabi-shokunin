# ExecTsvBlobs — r42 TSV evidence blob verification (r4 gate on real data)

Seat: `ExecTsvBlobs` (leaf, judged on **calibration**). Milestone: r42 TSV evidence blob verification.
Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin` — **read-only**. No writes, commits, fetches
or pushes anywhere outside my seat directory and my scratch root. No agents spawned.

- Frozen revision under test: `7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc` ("round-43: freeze C1
  signature-authenticated chain + C2 hardened checker").
- Baseline revision named by the brief: `ab592825cd195599822ca227f7768914df208201`.
- Lane HEAD observed: `ba433c94b14a0e0d5ecf2eba1be0a8ee3064491c` (2 commits after the freeze rev;
  freeze rev is an ancestor of HEAD — `git merge-base --is-ancestor` → exit 0).
- Scratch root: `/fast/scratch/hyaku/tabi-r43/ExecTsvBlobs/` (removed before yield).
- Tools used, all pre-installed (no installs performed): `git 2.56.0`, `node v24.21.0`,
  `python3 3.14.8`, Linux `7.2.11-arch1-1`. Operator tooling directive honoured: **no** pacman
  transaction was run (PACMAN GUARD), nothing was installed or upgraded, so there is no
  tool/version/channel/reason entry beyond "no install planned, none performed".

## Question

At the frozen revision, read `.ufo/waves/round-42/quarantine/re-adjudication.tsv`; for **all 38**
evidence paths verify `git cat-file -t` == `blob` **and** `git cat-file -s` >= 200 — the r4 gate,
now exercised on real data rather than on a synthetic fixture.

## Receipt

**38 / 38 PASS. Zero failing rows.**

- All 38 rows resolve at the freeze rev to object type `blob` (none `tree`, none `commit`,
  none absent).
- All 38 committed blob sizes are >= 200 bytes. Observed range: **1777** (S142) to **6838** (S131).
- All 38 evidence paths are distinct (38 distinct paths for 38 distinct row ids).
- All 38 evidence paths live under `.ufo/waves/round-42/w1/` (no path escapes the wave tree).
- All 38 evidence blobs are mode `100644` regular files (no symlink `120000`, no gitlink `160000`).

The frozen C2 checker independently reports `predicate: true`, `findingCount: 0` at the freeze rev
— i.e. the r4 branch contributes zero findings on the real 38-row TSV.

---

## 1. Evidence read (exact commands, exact output)

### 1.1 The TSV under test, read from the frozen revision (not the worktree)

```
$ cd /home/vgpnk/Projects/shokunin/tabi-shokunin
$ git cat-file -t 7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc:.ufo/waves/round-42/quarantine/re-adjudication.tsv
blob
$ git cat-file -s 7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc:.ufo/waves/round-42/quarantine/re-adjudication.tsv
2455
$ git cat-file blob 7ca6f018...:.ufo/waves/round-42/quarantine/re-adjudication.tsv | diff - .ufo/waves/round-42/quarantine/re-adjudication.tsv && echo IDENTICAL
IDENTICAL
$ wc -l .ufo/waves/round-42/quarantine/re-adjudication.tsv
38
```

The committed TSV bytes are byte-identical to the worktree copy, so the worktree read and the
revision-pinned read agree. 38 rows, 3 columns each: `slice_id`, `verdict`, `evidence_path`.

Verdict distribution (frozen enum `present|absent|misbound|partial|unreachable`):

```
      6 absent
     25 misbound
      4 partial
      2 present
      1 unreachable
```

Row-id set vs the frozen slice list `.ufo/waves/round-42/quarantine/slice-ids.txt` (also a blob,
190 bytes at the freeze rev):

```
$ git cat-file blob 7ca6f018...:.ufo/waves/round-42/quarantine/slice-ids.txt | tr -d '\r' | sed '/^$/d' | sort > slice-ids.sorted
$ cut -f1 ev-rows.tsv | sort > tsv-ids.sorted
slice count: 38  tsv count: 38
$ diff slice-ids.sorted tsv-ids.sorted && echo ID_SETS_IDENTICAL
ID_SETS_IDENTICAL
```

### 1.2 The r4 gate, verified independently (my own loop, not the checker's)

For each of the 38 rows, straight `git cat-file` at the freeze rev:

```
REV=7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc
TSV=.ufo/waves/round-42/quarantine/re-adjudication.tsv
while IFS= read -r line; do
  id=$(printf '%s' "$line" | cut -f1); verdict=$(printf '%s' "$line" | cut -f2)
  p=$(printf '%s' "$line" | cut -f3)
  type=$(git cat-file -t "$REV:$p"); size=$(git cat-file -s "$REV:$p")
  [ "$type" = blob ] && [ "$size" -ge 200 ] && pass++ || fail++
done < <(git cat-file blob "$REV:$TSV")
```

Observed output (`evidence-ev-rows.tsv`, columns
`id / verdict / cat-file -t / cat-file -s / status / path / present`):

```
rows=38 pass=38 fail=0
S102  misbound     blob  4307 PASS .ufo/waves/round-42/w1/QuarR4201/evidence-S102.txt  present
S106  misbound     blob  4643 PASS .ufo/waves/round-42/w1/QuarR4201/evidence-S106.txt  present
S109  misbound     blob  3438 PASS .ufo/waves/round-42/w1/QuarR4202/evidence-S109.txt  present
S110  absent       blob  2830 PASS .ufo/waves/round-42/w1/QuarR4202/evidence-S110.txt  present
S111  partial      blob  4483 PASS .ufo/waves/round-42/w1/QuarR4203/evidence-S111.txt  present
S114  partial      blob  3234 PASS .ufo/waves/round-42/w1/QuarR4203/evidence-S114.txt  present
S117  misbound     blob  2677 PASS .ufo/waves/round-42/w1/QuarR4204/evidence-S117.txt  present
S118  present      blob  4120 PASS .ufo/waves/round-42/w1/QuarR4204/evidence-S118.txt  present
S124  partial      blob  3541 PASS .ufo/waves/round-42/w1/QuarR4205/evidence-S124.txt  present
S125  misbound     blob  2895 PASS .ufo/waves/round-42/w1/QuarR4205/evidence-S125.txt  present
S126  absent       blob  2804 PASS .ufo/waves/round-42/w1/QuarR4206/evidence-S126.txt  present
S130  misbound     blob  3066 PASS .ufo/waves/round-42/w1/QuarR4206/evidence-S130.txt  present
S131  misbound     blob  6838 PASS .ufo/waves/round-42/w1/QuarR4207/evidence-S131.txt  present
S133  misbound     blob  5536 PASS .ufo/waves/round-42/w1/QuarR4207/evidence-S133.txt  present
S134  misbound     blob  3291 PASS .ufo/waves/round-42/w1/QuarR4208/evidence-S134.txt  present
S135  absent       blob  2857 PASS .ufo/waves/round-42/w1/QuarR4208/evidence-S135.txt  present
S137  misbound     blob  2038 PASS .ufo/waves/round-42/w1/QuarR4209/evidence-S137.txt  present
S138  misbound     blob  2902 PASS .ufo/waves/round-42/w1/QuarR4209/evidence-S138.txt  present
S140  present      blob  2230 PASS .ufo/waves/round-42/w1/QuarR4210/evidence-S140.txt  present
S142  absent       blob  1777 PASS .ufo/waves/round-42/w1/QuarR4210/evidence-S142.txt  present
S143  misbound     blob  3183 PASS .ufo/waves/round-42/w1/QuarR4211/evidence-S143.txt  present
S144  misbound     blob  3948 PASS .ufo/waves/round-42/w1/QuarR4211/evidence-S144.txt  present
S145  absent       blob  2867 PASS .ufo/waves/round-42/w1/QuarR4212/evidence-S145.txt  present
S147  misbound     blob  3712 PASS .ufo/waves/round-42/w1/QuarR4212/evidence-S147.txt  present
S148  misbound     blob  3606 PASS .ufo/waves/round-42/w1/QuarR4213/evidence-S148.txt  present
S149  misbound     blob  3602 PASS .ufo/waves/round-42/w1/QuarR4213/evidence-S149.txt  present
S153  misbound     blob  3653 PASS .ufo/waves/round-42/w1/QuarR4214/evidence-S153.txt  present
S154  misbound     blob  3128 PASS .ufo/waves/round-42/w1/QuarR4214/evidence-S154.txt  present
S158  misbound     blob  3127 PASS .ufo/waves/round-42/w1/QuarR4215/evidence-S158.txt  present
S163  misbound     blob  4688 PASS .ufo/waves/round-42/w1/QuarR4215/evidence-S163.txt  present
S164  misbound     blob  3232 PASS .ufo/waves/round-42/w1/QuarR4216/evidence-S164.txt  present
S165  absent       blob  3474 PASS .ufo/waves/round-42/w1/QuarR4216/evidence-S165.txt  present
S166  misbound     blob  3751 PASS .ufo/waves/round-42/w1/QuarR4217/evidence-S166.txt  present
S167  misbound     blob  4633 PASS .ufo/waves/round-42/w1/QuarR4217/evidence-S167.txt  present
S171  unreachable  blob  4697 PASS .ufo/waves/round-42/w1/QuarR4219/evidence-S171.txt  present
S174  misbound     blob  4167 PASS .ufo/waves/round-42/w1/QuarR4218/evidence-S174.txt  present
S175  partial      blob  4613 PASS .ufo/waves/round-42/w1/QuarR4218/evidence-S175.txt  present
S176  misbound     blob  4191 PASS .ufo/waves/round-42/w1/QuarR4219/evidence-S176.txt  present
```

Sizes: min 1777, max 6838, all 38 >= 200. Modes at the freeze rev:

```
$ cut -f6 ev-rows.tsv | while read -r p; do git ls-tree 7ca6f018... -- "$p"; done | awk '{print $1, $2}' | sort | uniq -c
     38 100644 blob
```

Path containment: every one of the 38 paths is under `.ufo/waves/round-42/w1/` — no escape.

### 1.3 The frozen checker agrees (r4 branch contributes zero findings)

```
$ node .ufo/waves/round-43/counters/check-routed-defects-round43.mjs \
    --rev 7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc \
    --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --json
exit=0
{"schema": "tabi-r43-routed-defects", ..., "rev": "7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc",
 "predicate": true, "findingCount": 0, "findings": []}
```

Full JSON: `evidence-c2-at-freeze.json`. The frozen checker bytes are the committed bytes:

```
$ git cat-file blob 7ca6f018...:.ufo/waves/round-43/counters/check-routed-defects-round43.mjs | sha256sum
2f150b8422c1c70c816a49129eb0709ef759c82b3fa19733673f2314f8911743  -
$ sha256sum .ufo/waves/round-43/counters/check-routed-defects-round43.mjs
2f150b8422c1c70c816a49129eb0709ef759c82b3fa19733673f2314f8911743  .ufo/waves/round-43/counters/check-routed-defects-round43.mjs
```

Same at lane HEAD (`ba433c94…`): exit 0, `findingCount: 0`, and an independent 38-row loop at
HEAD also gives `pass=38 fail=0` (`evidence-c2-at-head.json`). So the result is not an artefact of
the freeze revision alone.

### 1.4 The r4 branch is live on this data (mutation, run from scratch)

To show the 38/38 is a real gate result and not a vacuous pass, I copied the frozen checker to
scratch and changed only the numeric floor `size < 200` → `size < 5000`:

```
$ node /fast/scratch/hyaku/tabi-r43/ExecTsvBlobs/checker-mut-floor5000.mjs \
    --rev 7ca6f018... --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --json
total findingCount 36 | r4 findings: 36
r4-ev-S102-too-small :: .ufo/waves/round-42/w1/QuarR4201/evidence-S102.txt is 4307 bytes (<200)
r4-ev-S106-too-small :: ... (36 rows)
```

36 of 38 rows fire (S131 = 6838 bytes and S133 = 5536 bytes are above the mutated 5000 floor and
are not reported). Full listing: `evidence-mut-floor5000.json`. The mutated copy was run from
scratch only; the frozen checker in the lane was never modified.

### 1.5 Discrimination probes on a synthetic fixture repo

A throwaway git repo was created under my scratch (`git -C "$D" init -q`, with
`git -C "$D" rev-parse --show-toplevel` asserted equal to `$D` before any commit, and a
throwaway identity set inside that repo only). Ten probes covered: tree object, 5-byte blob,
300-byte blob, absent path, the 199/200/201-byte floor boundary, empty / whitespace evidence
column, duplicate row id, path-escape path, extra fourth column, two distinct ids sharing one
path, symlink blob, and gitlink. Command-by-command output: `evidence-r4-discrimination.txt`.

Highlights:

- tree → `r4-ev-S900-not-a-blob`; 5-byte blob → `r4-ev-S900-too-small`; absent → `r4-ev-S900-absent`;
  300-byte blob → no r4 finding.
- Floor is exactly ">= 200 passes": 199 → `too-small`, 200 and 201 → clean.
- gitlink (mode 160000) is refused as `absent`.
- Symlink (mode 120000) with a 257-byte link text **passes** the r4 branch.

---

## 2. Cross-check on the evidence bodies (beyond the gate)

The r4 gate checks type and size only. As an independent content sanity check I asked whether each
evidence blob's body actually mentions the slice id it is filed under:

```
$ git cat-file blob "$REV:$p" | grep -q "$id"   for all 38 rows
NO-ID rows: 0
```

All 38 evidence blobs name their own slice id (`evidence-ev-mention.tsv`). Spot-checked heads show
the expected shape (e.g. `evidence-S171.txt` begins `id: S171`, `lane: tabi`, `round: round5`,
`register: … absent-defect-register.md line 362`, `register class: unreachable`).

---

## 3. Cross-check of the sibling r4 sub-conditions at the freeze rev

The r4 clause of the frozen predicate sentence also requires the TSV to carry exactly the committed
slice ids, no duplicates, and verdicts inside the frozen enum. Verified independently:

- id sets identical (38 == 38, `diff` clean) — §1.1;
- 38 distinct row ids, no duplicates;
- all 38 verdicts inside `{present, absent, misbound, partial, unreachable}` — §1.1 distribution;
- the checker reports no `r4-id-set-mismatch`, `r4-duplicate-ids` or `r4-verdict-enum` finding.

The baseline revision named by the brief (`ab592825…`) is **red** for reasons unrelated to r4 — the
checker there exits 1 with exactly two findings, `r5-claims-absent` and `r6-probe-absent`
(`evidence-c2-at-baseline.json`); the r4 clause is already satisfied at the baseline (the r42
evidence was committed before the r43 freeze). So the r4 result of this seat is independent of the
r5/r6 hardening, and the r5/r6 controls remain the discriminating ones.

---

## 4. Observations (routed as findings, not amendments — the checker bytes are frozen)

None of these changes the 38/38 receipt. They are stated because they bound what the r4 gate
actually proves.

1. **Symlink evidence paths satisfy the gate.** A mode-120000 entry is a `blob` in git's object
   model, and `git cat-file -s` on it reports the length of the link *text*. A symlink whose target
   string is >= 200 characters therefore passes both the type gate and the size floor while
   pointing at a path that need not exist and containing no evidence text. Probe 8 in
   `evidence-r4-discrimination.txt`. This is **not** a defect against the frozen predicate sentence
   ("every evidence path a committed blob of >=200 bytes" — a symlink *is* a committed blob of that
   size), and it does **not** affect the receipt: all 38 real paths are mode `100644`. It is a
   boundary of the gate's evidential reach worth recording in the residual model.
2. **No 1:1 binding between row id and evidence path.** Two distinct row ids pointing at the same
   evidence path are accepted (probe 7). The frozen sentence constrains ids and paths separately,
   not their pairing. Not violated by the real data (38 distinct paths for 38 distinct ids).
3. **Extra TSV columns are ignored** (probe 6, fourth column): only `cols[0..2]` are consumed.
   Again not violated by the real data (every row has exactly 3 columns).
4. **The verdict column is not cross-checked against the evidence body** by the r4 branch: a row
   whose verdict says `absent` still needs only a >=200-byte blob at the path, not a body that
   demonstrates absence. The real data is internally consistent on inspection (§2 and the
   `evidence-S171.txt` spot check show verdict `unreachable`/`absent` bodies that do document the
   absent/unreachable condition).

No checker amendment is proposed. Counter/claims/checker bytes at
`7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc` were read only.

---

## 5. Limitations

- The seat verifies the r4 clause of the C2 predicate on real data. It does not re-litigate the
  r42 adjudication verdicts themselves (that the `misbound`/`absent`/`partial` classifications are
  *correct*) — only that each cited evidence path is a committed blob of >= 200 bytes at the frozen
  revision, as the frozen sentence requires.
- Verification is at the frozen revision `7ca6f018…` and additionally at lane HEAD `ba433c94…`
  (both 38/38). It says nothing about any future commit.
- Object type and size are read through `git cat-file` at a pinned revision; a worktree-only file
  would not count, and none of the 38 are worktree-only (the whole `.ufo/waves/round-42/w1/` tree
  is committed at that rev: 904 committed paths under `.ufo/waves/round-42/`).
- The synthetic probes exercise the checker only in the r4 clause; other clauses (r1/r2/r3/r5/r6)
  are out of this seat's scope and are reported red/green only where the checker itself reported it.

## 6. Scope compliance

- Files written: this seat directory only —
  `.ufo/waves/round-43/w1/ExecTsvBlobs/report.md` and the seven `evidence-*` files beside it.
- Scratch `/fast/scratch/hyaku/tabi-r43/ExecTsvBlobs/` removed before yield.
- No commits, no pushes, no `git`/`jj` mutation in the lane repo, no fetch, no writes to the
  production tree, the fleet root, sibling `*-shokunin` repos or `/home/vgpnk/Projects/shokuknow`;
  no agent spawned; no network access; no pacman transaction.
- The only `git` mutation performed anywhere was inside a throwaway fixture repo under my scratch
  root, with `rev-parse --show-toplevel` asserted equal to that fixture dir before each commit and
  a throwaway identity used only there.

## 7. Evidence index (all under `.ufo/waves/round-43/w1/ExecTsvBlobs/`)

| file | content |
|---|---|
| `report.md` | this report |
| `evidence-ev-rows.tsv` | per-row `cat-file -t` / `cat-file -s` / PASS-FAIL for all 38 rows at the freeze rev |
| `evidence-ev-mention.tsv` | per-row check that the evidence body names its own slice id (38/38) |
| `evidence-c2-at-freeze.json` | frozen checker output at `7ca6f018…` (exit 0, 0 findings) |
| `evidence-c2-at-baseline.json` | frozen checker output at `ab592825…` (exit 1, 2 findings: r5/r6) |
| `evidence-c2-at-head.json` | frozen checker output at lane HEAD `ba433c94…` (exit 0, 0 findings) |
| `evidence-mut-floor5000.json` | mutated floor-5000 copy on real data — 36 r4 findings, branch is live |
| `evidence-r4-discrimination.txt` | 10 synthetic-fixture probes with exact commands and output |
| `evidence-slice-ids.sorted`, `evidence-tsv-ids.sorted` | the two id lists whose `diff` is empty |

VERDICT ok 38/38 evidence paths are committed blobs of >=200 bytes at 7ca6f018 (min 1777, max 6838); no failing rows; r4 branch independently shown live and discriminating.
