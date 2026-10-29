# ExecCensus — census expected-vs-observed (tabi, round 43)

Seat: `ExecCensus` · lane: tabi round 43, wave 1 · judged on: **freshness**
Milestone: census expected-vs-observed · wave item: `ExecCensus`
Date: 2026-10-29

## Verdict in one line

All five expected census figures are **observed exactly** (151 rows, tiers A135/B7/C9,
mined 126 / queued 15 / rejected 10, 21 W04) — but the committed census receipt
`census-start.out` was captured against the **149-row baseline registry**, and the
151-row registry committed at `7ca6f018` does **not** validate clean from committed bytes
alone (exit 1, two `E11` findings) because the `S150`/`S151` used-by note was never committed.

---

## 1. Assigned command — observed

```
$ /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi
```

* **exit** `0`  (`03-validate.tabi.exit`)
* **stdout** 22 lines (`01-validate.tabi.stdout`) — 21 × `tabi W04 …` + 1 × `tabi ok /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md`
* **stderr** 0 bytes (`02-validate.tabi.stderr`)

Emitted codes: `W04` ×21, `ok` ×1. **No `E*` finding on the live working tree.**

## 2. Derived histograms at `7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc` — observed vs expected

Two independent derivations, both reading the **committed blob** (not the working tree):

* (a) the census instrument's own `census` mode over the committed blob
  (`git show 7ca6f018:corpus/SOURCES.md` → `04-census.tabi.stdout`);
* (b) my **own** awk re-implementation of the registry grammar, deliberately not reusing the
  instrument (`## Registry` section only, header row + separator row excluded).

| Metric | Expected | Observed (a) | Observed (b) | Match |
|---|---|---|---|---|
| rows | 151 | 151 | 151 | ✅ |
| tier A | 135 | 135 | 135 | ✅ |
| tier B | 7 | 7 | 7 | ✅ |
| tier C | 9 | 9 | 9 | ✅ |
| status mined | 126 | 126 | 126 | ✅ |
| status queued | 15 | 15 | 15 | ✅ |
| status rejected | 10 | 10 | 10 | ✅ |
| W04 warnings | 21 | 21 | 21 | ✅ |

**observed == expected on every figure.** All 151 ids distinct (`S001`–`S151`, no gaps, no
duplicate ids); tier sum `135+7+9 = 151`; status sum `126+15+10 = 151`.

Provenance of the blob: `git rev-parse 7ca6f018:corpus/SOURCES.md` =
`929b07b80198364c02667167e4a8a6eaea610fce` = `HEAD:corpus/SOURCES.md`; worktree
`corpus/SOURCES.md` sha256 `13ef6d4cf3bbdd5db118bf869f86f1caec40bdf8f3fd7a1791aee454fe7ca678`,
byte-identical to the blob exported to scratch. So the live tree and the frozen tree carry the
**same registry bytes**; the divergence below is not registry drift.

## 3. Supporting checks

* **Census instrument self-test** — `sources-census.sh selftest` → exit `0`, **96 `killed`,
  0 `SURVIVED`** (`11-census-selftest.stdout`). The instrument is sound; the findings below are
  not tool misbehaviour.
* **Determinism / TZ-independence** — two further runs of the assigned command produced
  byte-identical stdout; a run under `TZ=America/Sao_Paulo` was byte-identical too.
* **Overdue** — `overdue --root … tabi` → exit `0`, 150 `cadence` rows, **0 `overdue`**
  (`12-overdue.tabi.stdout`). Recheck cadences: `on-release`×100, `90d`×29, `180d`×13,
  `365d`×7, `730d`×1, one dated `2026-11-24`. Nothing is past due.
* **Freshness** — `opened` dates span 2026-10-19 → 2026-10-29 (2 rows opened on the freeze day);
  the registry is current, not stale.
* **Fleet context** — fleet-wide `census` exits 0, 4146 rows / FLEET tier A3469 B507 C170,
  status queued 299 / mined 3565 / rejected 282, `missing 0` (`13-census.fleet.stdout`);
  fleet-wide `validate` exits 0 (`tabi ok` among the clean lanes).

---

## 4. Finding — the committed census receipt does not attest the committed registry

**Severity: finding (round-43 hygiene / freshness), not a claim failure.** The C1 and C2
counters and checkers never read `corpus/SOURCES.md` or any census receipt
(`grep -c 'SOURCES\|census'` = 0 in `c1-signature-bound-v5.mjs`, `measure-c1-round43.mjs`,
`playwright-firefox-egress-round43.mjs`; 0 in `check-routed-defects-round43.mjs`), and
`claims.json` mentions "census" 0 times. **Neither claim is affected by this.**

### 4a. The committed tree at `7ca6f018` does **not** validate clean from committed bytes

Extracting the frozen commit into scratch and validating it in isolation:

```
$ git -C …/tabi-shokunin archive 7ca6f018 | tar -x -C $S/frozen5/tabi-shokunin
$ sources-census.sh validate --root $S/frozen5 $S/frozen5/tabi-shokunin
  exit=1
  tabi-shokunin	E11	S150 missing used-by corpus/knowledge/receipt-authenticity-signing-round-43.md
  tabi-shokunin	E11	S151 missing used-by corpus/knowledge/receipt-authenticity-signing-round-43.md
  W04 count: 21
```
(`06-validate.frozen-tree-committed.out`)

Adding the note file back — without touching anything else — restores exit `0`:
```
$ cp …/tabi-shokunin/corpus/knowledge/receipt-authenticity-signing-round-43.md $S/frozen5/tabi-shokunin/corpus/knowledge/
$ sources-census.sh validate --root $S/frozen5 $S/frozen5/tabi-shokunin
  exit=0 ; tabi-shokunin ok ; 21 W04
```
(`07-validate.frozen-tree-plus-untracked-note.out`)

### 4b. Root cause — the note was never committed

* `corpus/knowledge/receipt-authenticity-signing-round-43.md` exists in the working tree
  (6183 B) but is **untracked**: `git ls-files --error-unmatch` → *did not match any file known
  to git*; `git ls-tree -r --name-only HEAD | grep -c receipt-authenticity-signing-round-43.md`
  → `0`.
* It is in **no commit on any ref**: a sweep of `git rev-list --all` × `ls-tree -r` found zero
  commits containing it, and `git rev-list --objects --all | grep -i receipt-authenticity` is empty.
* Its birth time is **2026-10-29 17:51:58**, which is **8m19s after** the freeze commit
  `7ca6f018` (2026-10-29 17:43:39). The registry rows that cite it were committed **before
  the note existed**.
* Rows `S150` and `S151` are both `status=mined` with
  `used-by = corpus/knowledge/receipt-authenticity-signing-round-43.md`. A `mined` row whose
  used-by artifact is absent from the committed tree is exactly what `E11` exists to catch.
* Per-row detail for all 126 `mined` rows: `09-usedby-existence-frozen-vs-worktree.tsv`.
  **S150 and S151 are the only two** whose used-by path is missing from the commit; every other
  mined row's used-by path is committed at `7ca6f018`.

### 4c. The committed receipt is a 149-row receipt, not a 151-row receipt

`LOG.md` at the freeze commit states: *"Census start receipt: exit 0, `tabi ok`, 21 W04
warnings, **149 rows**."* The frozen `corpus/SOURCES.md` has **151** rows. I confirmed the
receipt's provenance by reconstruction:

* baseline `ab592825:corpus/SOURCES.md` has **149** rows (`14-SOURCES.baseline.ab592825.md`);
* the **only** delta from baseline to the frozen registry is the two added rows `S150`, `S151`
  (id-set diff: `149a150,151`);
* validating the **149-row** baseline registry over the **full committed tree** reproduces the
  committed receipt **byte-identically** (exit 0, 21 W04, `ok`) — i.e. the committed
  `census-start.out` was captured **before** `S150`/`S151` were appended, or the rows were
  appended without re-running the census.

So the receipt in `.ufo/waves/round-43/measure/census-start.out` is a truthful receipt for a
registry state that the same commit does not contain. Its W04 count (21) is unchanged by the two
new rows, which is why the discrepancy is invisible in the W04 figure and shows up only as the
two `E11` findings.

### 4d. This is new at round 43, not an inherited pattern

Validating the two preceding round commits **in isolation** (same method) gives exit 0 with no
`E11`:

| revision | rows | validate exit | E11 |
|---|---|---|---|
| `9b6de3a1` (r41 freeze) | 149 | 0 | 0 |
| `435b64c9` (r42 close) | 149 | 0 | 0 |
| **`7ca6f018` (r43 freeze)** | **151** | **1** | **2** (S150, S151) |

Rounds 41 and 42 shipped a `census-end` receipt alongside `census-start` (r42's `census-end.out`
ends `tabi ok`, exit 0, 21 W04). **Round 43 ships `census-start` only** — no end receipt
(`git ls-tree -r --name-only 7ca6f018 -- .ufo/waves/round-43/measure/` lists exactly
`c1-measure-r43.json`, `census-start.{err,exit,out}`) — so nothing re-ran the census after the
two rows landed.

### 4e. Cross-lane context (not a tabi defect, but the same shape)

A fleet-wide sweep of `mined`-row used-by paths against each lane's own git index
(`10-fleet-untracked-usedby-scan.tsv`): **tabi = 2** affected rows (S150, S151);
**revenger = 315** rows citing 2 distinct untracked notes
(`corpus/knowledge/2026-10-29-rea-evidence-ledger-discipline.md`). revenger's notes are
likewise untracked in `revenger-shokunin` (which *is* a git repo of its own — the fleet root's
`.gitignore` excludes `*-shokunin/`, so lane repos are tracked individually). So the
"census-clean from committed bytes" property is not fleet-wide anyway; tabi's 2 rows are simply
the newest instance. Every affected path is **present on disk**, so no lane's live `validate`
fails today — the divergence is strictly between the live tree and the committed tree.

### 4f. Why the live tree hides this

`E11` is a filesystem-existence check (`[ ! -e "$dir/$path" ]`) against the lane directory. The
note is present in the working tree, so the live `validate` cannot see the gap. Only a
commit-scoped check reveals it. The round-43 freeze's own discipline (S149/S151 "committed-bytes
verification", C2's `r1` blob-type gate via `git cat-file -t`) is committed-bytes-first
everywhere else; the census receipt is the one artifact in the round that was measured against
the working tree rather than against the commit.

### 4g. Suggested remedy (route as a finding — counter/claims/checker bytes are frozen)

* Land `corpus/knowledge/receipt-authenticity-signing-round-43.md` (it is already written and
  present on disk; it is referenced by two `mined` rows), **or** re-status `S150`/`S151` to
  `queued` until the note lands.
* Then re-run the census against the committed tree and commit a `census-end` receipt, matching
  the r41/r42 precedent that round 43 dropped.

I did **not** apply any of this: the freeze is at `7ca6f018`, and the wave contract forbids
commits, amendments to frozen bytes, and writes outside my seat directory.

---

## 5. Evidence paths

All under `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/w1/ExecCensus/`:

| file | content |
|---|---|
| `01-validate.tabi.stdout` | assigned command stdout (22 lines: 21 W04 + ok) |
| `02-validate.tabi.stderr` | assigned command stderr (0 bytes) |
| `03-validate.tabi.exit` | assigned command exit (0) |
| `04-census.tabi.stdout` | `census` mode on the live lane (rows/tier/status) |
| `05-validate.live.stdout` | final live re-run of the assigned command |
| `06-validate.frozen-tree-committed.out` | **validate of the committed tree in isolation → exit 1, 2× E11 (S150, S151)** |
| `07-validate.frozen-tree-plus-untracked-note.out` | same tree + the untracked note → exit 0 (causal proof) |
| `08-committed-census-start.receipt` | the committed `census-start.out` (149-row receipt) |
| `09-usedby-existence-frozen-vs-worktree.tsv` | per-mined-row used-by existence, frozen vs worktree |
| `10-fleet-untracked-usedby-scan.tsv` | fleet-wide scan of mined-row used-by vs each lane's git index |
| `11-census-selftest.stdout` | census selftest: 96 killed, 0 survived |
| `12-overdue.tabi.stdout` | overdue mode: 150 cadence, 0 overdue |
| `13-census.fleet.stdout` | fleet-wide census (4146 rows) |
| `14-SOURCES.baseline.ab592825.md` | baseline 149-row registry (the receipt's actual subject) |

In-repo, unmodified: `tabi-shokunin/.ufo/waves/round-43/measure/census-start.{out,exit,err}`
(the committed receipt), `tabi-shokunin/corpus/SOURCES.md` at `7ca6f018`
(blob `929b07b80198364c02667167e4a8a6eaea610fce`), and the census instrument
`/home/vgpnk/Projects/shokunin/scripts/sources-census.sh`
(sha256 `3fb7261569f46423dd80ecc23e0a23789a7926f667c7a3fc559d2439d4a64e30`).

## 6. Tooling record

`/home/vgpnk/.omp/agent/RULES.md` read first. **No installs or upgrades were needed or made** —
the seat used only pre-existing host tools (`git`, `bash`, `awk`, `grep`, `sed`, `sha256sum`,
`stat`, `cmp`, `diff`, `wc`, `tar`). No pacman transaction (host-wide pause respected); no
`uv tool` install; no binary fetched to `~/.local/bin`. Nothing to record beyond that under the
operator tooling rule.

## 7. Scope, mutations, limitations

* **Writes confined to** `.ufo/waves/round-43/w1/ExecCensus/` and the scratch root
  `/fast/scratch/hyaku/tabi-r43/ExecCensus/` (deleted before yield). The production tree, the
  fleet repo, sibling `*-shokunin` repos and `shokuknow` were read-only throughout: the only
  commands touching them are `git show`/`git ls-tree`/`git archive`/`git rev-list` (read-only)
  and the census script itself (read-only; it writes only stdout unless `--out` is given, which
  I never used).
* **No commits, pushes, fetches, or git/jj mutations anywhere.** `git -C` was used only for
  read operations; `git archive` writes to stdout, never to a repo. No fixture repo was created,
  so no `rev-parse --show-toplevel` assertion was needed. No agents spawned; this seat ran as a
  leaf.
* **No network access** was performed: the seat names no source re-open, so no HTTP GET was made.
* **Host-guard note:** my process cwd was the fleet root `/home/vgpnk/Projects/shokunin`; every
  command used absolute paths, and all writes went to absolute scratch/seat paths.
* **Limitations.** (i) The E11 check is filesystem-based, so the divergence is invisible to any
  working-tree-scoped run — a clean-checkout or archive-based check is required to see it, and
  that is what I did. (ii) I did not run the round-43 C1 counter or the C2 checker; the
  claim-independence statements in §4 rest on grep of their committed bytes (they read neither
  `corpus/SOURCES.md` nor any census receipt), not on executed runs — the counters' behaviour is
  other seats' scope. (iii) The `E11` readings for the two preceding revisions (§4d) were
  obtained by `git archive` extraction; if the original r41/r42 working trees contained
  untracked artifacts, that check would show them as clean for the same reason — the r41/r42
  *committed* trees contain every used-by path their registry cites, whereas r43's does not,
  which is the property at issue. (iv) The receipt's capture order (captured before the two rows
  were appended vs. appended without re-running) is not directly observable; I proved the
  receipt is byte-identical to the 149-row census, which is the same conclusion either way.
  (v) `revenger`'s 315 rows are reported as observed cross-lane context only; that lane is
  outside this seat's scope and was not otherwise investigated.

## 8. Cleanup

Scratch root `/fast/scratch/hyaku/tabi-r43/ExecCensus/` removed before yield, including the
extracted frozen trees, the baseline registry copy, and the `TMPDIR` used for the census
selftest. Receipts that matter were copied into the seat report dir first (see §5).

VERDICT finding census expected-vs-observed: all eight figures match exactly (151 rows, A135/B7/C9, mined 126/queued 15/rejected 10, 21 W04, exit 0), but the committed census receipt attests the 149-row baseline registry and the frozen tree at 7ca6f018 validates to exit 1 with two E11 findings (S150, S151 used-by note never committed) — claims unaffected
