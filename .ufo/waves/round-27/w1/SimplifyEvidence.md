# SimplifyEvidence — round-27 committed-evidence sufficiency and size

Seat: `SimplifyEvidence` (wave-1 simplifier, read-only reporter). This file answers the
evidence-set item: is the committed round-27 evidence sufficient, and is any of it dead weight.
A second simplifier dispatch (`TabiR27.SimplifyEvidence`) reviewed the same set; its report went
to its own parent separately. This file is the wave-1 seat's answer.

Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Tree read: `master` =
`5ed6484da66e6bf73654281d2e9ba3703f0c2ef0`; baseline lane tip
`f185b4e7ab10cd9e8925e8ec614c9c111772357d`. Read-only git only; no tracked writes.
Scratch used: `.ufo/waves/round-27/scratch/SimplifyEvidence/` (temp files removed).

## Verdicts up front

| Artifact | Size | Verdict |
|---|---|---|
| `.ufo/waves/round-27/assimilation/rfc9110.txt` | 502941 B | **KEEP** — load-bearing for line-anchored quotes; size precedented |
| `assimilation/{staged-row.txt,staged-census.txt,s107-row.txt,xform-census.txt,README.md,reg-ids,staged-ids,collisions,guard-fixture/*}` | 25–2238 B each | **KEEP** — sufficient to re-derive C3; two one-line repairs recommended (§2) |
| `census-before.txt` + `census-after-c3.txt` | 2190 B each, **same blob** `b0adc83c…` | **TRIM one** — zero-delta pair; also identical to round-25's `census-before` |
| `.ufo/waves/round-27/w1-validate.err` | 0 B | **TRIM** — empty; class excluded by `.gitignore:8` |
| `corpus/evidence/round-26/sources/*` | 73952 + 1750 B | **KEEP** — C2 gate input, exercised `valid=true` |
| `corpus/knowledge/redirect-and-retry-after-semantics.md` | 3752 B | **KEEP** — C3 subject; worktree has a pre-existing 1-line `ground:` edit not mine (§6) |
| `selfassess-*.json`, `measure-c{1,2}-*.json` | 732–41512 B | **KEEP files; the set lacks after-state receipts** — flagged §5, not my edit scope |

Round-27 tracked total: **799371 B / 24 files**; rfc9110 is **62.9 %** of it (296430 B without it).
Commands: `git ls-tree -r -l master -- .ufo/waves/round-27 | awk '{s+=$4} END {print s" bytes, "NR" files"}'`;
same over `corpus/evidence/round-26` (75702 B / 2 files).

## 1. Is 502941 B of `rfc9110.txt` justified as committed evidence?

**Yes — KEEP.** Three independent grounds.

### 1.1 Precedent: prior rounds do commit full source bytes

`for d in $(git ls-tree --name-only master:corpus/evidence); do … git cat-file -s …; done`:

| Round | Committed source bytes | Size |
|---|---|---|
| round-19 | `sources/{input.html,form-control-infrastructure.html,html_form_element.cc,form_mcp_schema.cc,WebMCP.pdl}.gz` | 80732, 61795, 15885, 9091, 1388 B (**compressed**) |
| round-20 | `sources/html_form_element.cc` | 68278 B |
| round-24 | `sources/bfcache.html`, `sources/page.pdl` | 157667, 61911 B |
| round-26 | `sources/content-features-154.0.8037.97.cc` (+ receipt) | 73952, 1750 B |

Both forms are precedented: raw text (r20/r24/r26) and gzip (r19). The row-only form also exists —
S102 records `146976-byte plain text … sha256 0622393…` with no committed bytes
(`git show master:corpus/SOURCES.md`, line 116) — but S107's quotes are *line-located*, so the
exact bytes do more than satisfy a checksum.

### 1.2 Size is inside this repository's norms

`git rev-list --objects master | git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | awk '$1=="blob"' | sort -k3 -n | tail -15`
puts rfc9110 **14th largest of master's blobs**: 13 blobs are larger, from 511987
(`round-25/freshness/S020.html`) to 3320476 (`round-19/validation/probes/non-scalar.json`, via
523470, 537623, 537644, 552411×2, 552734, 627078, 663037, 663180, 811507, 1081672); the next
smaller blob is 496015 (`round-22/checks-final.json`). Round-27 carries 24 files (r24 77,
r25 51, r26 8) and 799371 B, second-largest of those four rounds by bytes (r24 979765,
r25 795964, r26 284900).

### 1.3 The bytes are correct and the citations resolve

- `sha256sum .ufo/waves/round-27/assimilation/rfc9110.txt` →
  `21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a`, identical to
  `git cat-file -p master:…/rfc9110.txt | sha256sum` and to README:7 and the S107 row.
- 502941 B, 10785 lines; file ends `…/webdav/\n` (no truncation).
- `awk 'NR>=…'` spot-checks: 303 body 7413–7418 (GET-or-HEAD at 7417); 307
  `MUST NOT change the request method` at 7494 within 7492–7495; 308 body 7507–7523 with **no**
  MUST-NOT; `awk 'NR>=7250&&NR<=7560&&/MUST NOT/'` returns only 7494.

**Compression option, not taken:** `gzip -9 -c rfc9110.txt | wc -c` → 138950 B (−72.4 %), with
the round-19 `.gz` precedent. Rejected because every claim anchor in the S107 row and the entry
is a *line number* in plain text; a `.gz` copy forces `zcat` for each spot-check and breaks the
direct `sed -n` verification the row invites. Revisit only if repository size becomes an axis.

## 2. Are the pruned mirror dirs adequately represented?

**Yes for re-deriving the claim; not for re-executing it.** KEEP all five files.

What a reader has and can do (all verified):

- **Before state:** at `f185b4e` — `git grep -lE '^source: S107 ' f185b4e -- corpus/knowledge | wc -l`
  → 0; `git show f185b4e:corpus/SOURCES.md | grep -cE '^ {0,3}\|[[:space:]]*S[0-9]{3,}'` → 106;
  `reg-ids` is 106 lines.
- **After state:** at `6ca3b89` (C3 commit) and tip `5ed6484` → 1 entry, **107** rows (same two
  commands). S107's commit is recorded in SCORECARD:1398.
- **The transform is fully visible** by diffing the two committed rows (11 table cells; 6 differ:
  id S124→S107, description scope clause, anchor cell rebuilt with bytes/sha/line anchors,
  verdict cell narrowed to 307-only MUST-NOT, opened 2026-10-23→2026-10-25, recheck
  `730d (errata only)`→`730d`). `cmp` of `s107-row.txt` against committed `corpus/SOURCES.md:121`
  → byte-identical.
- **The do-nothing control:** `staged-census.txt` carries
  `file  E09  S124 recheck=730d (errata only)`; `xform-census.txt` carries `file  ok  …`.
- **The collision guard fixture** (4 files, 5/5/25/34 B) proves the `  | S124 |` indented-row
  pattern before any append; `collisions` is the 5-line `comm -12` (S102–S106).
- **The mirror recipe** is committed — `gen-w1.mjs:81`, seat `ExecCensusMirror`: copy `corpus/`,
  insert the row **before** `## Paths`, run
  `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file <mirror>/corpus/SOURCES.md`.
  That tool exists and is executable (`ls -ld` → `-rwxr-xr-x … 35466 Oct 19`, bash script) but
  lives **outside the lane** (`scripts/sources-census.sh` is not in the lane; no copy tracked here).

Gaps, repairable without deleting anything:

1. **No exit codes in any round-27 census receipt.** `grep -nE 'EXIT|exit'` over `census-before.txt`,
   `census-after-c3.txt`, `assimilation/staged-census.txt`, `assimilation/xform-census.txt` → no
   match. Round-26 did capture it (`census-after.txt` ends `EXIT=0`). SCORECARD's "exit 0/exit 1"
   therefore rests on prose plus the presence of `ok`/`E09` lines. Fix: append `EXIT=<code>`.
2. **`xform-census.txt`'s `ok` line names a path that no longer exists**
   (`.ufo/waves/round-27/assimilation/validate/xform/corpus/SOURCES.md`; `test -e` → false).
   README:12 states the mirrors were pruned, so it is explained but not resolvable on disk.
3. **`census-before.txt` cannot support the "before" half as cited.** Its blob is `b0adc83c…`,
   identical to round-25's `census-before.txt` and to `census-after-c3.txt`; the census prints no
   row count, so the pair cannot show 106→107. LOG:1893 cites this file for "exit 0, rows 106,
   16 W04", but the file holds 16 W04 lines and an `ok` line only. (The count is independently
   reproducible, above.) Keep one file, not two.
4. **The staged package is gone on this host**: `/home/vgpnk/Projects/shukuknow` does not exist
   (`ls` → "No such file or directory"). So `staged-row.txt` (585 B) and `staged-ids` (148 ids)
   are now the *only* witnesses of the staged input; the README's "byte-exact staged S124 row
   (line 29)" cannot be re-verified here. This argues to keep both files, not trim them.

## 3. Anything else a reader would need to re-derive C3?

The claim is reproducible from the tree: counting command → 1; registry → 107; the entry front
matter carries `source: S107`, byte count and sha. The committed-bytes path is discoverable
without the wave dir — `corpus/README.md:599` and `corpus/lessons/round-27.md:26` both name
`.ufo/waves/round-27/assimilation/rfc9110.txt` (the S107 row itself does not, which is acceptable
given those two references).

Minor missing provenance, descending value:

- **Fetch response status not recorded.** README:7 gives date/bytes/sha only; the URL is in the
  row. A verifier must re-fetch to learn the HTTP status; one
  `curl -sS -o /dev/null -w '%{http_code}'` line would close it (round-26 `s106.json` has the same
  omission — carried practice, not a round-27 regression).
- **No tool revision for the census.** The receipts name outputs, not the `sources-census.sh`
  version/hash; a reader without the fleet repo cannot re-run either mirror arm.
- **Refusals (S125 as S102 duplicate; S142 as S107 same-document overlap) live in
  `corpus/lessons/round-27.md` §Gate, not in `assimilation/`.** Sufficient if the lesson is the
  ledger; no second home needed.

Not missing: the row's cited line ranges resolve in the committed bytes (§1.3); the 308 INFERENCE
is labelled and matches the bytes (only 307 carries the clause).

## 4. Size ledger and trim list

| File | B | Verdict |
|---|---|---|
| `assimilation/rfc9110.txt` | 502941 | keep |
| `w1-dispatch.json` | 63922 | keep (round-25/26 carry the same spec+dispatch pair; it is the validated payload actually dispatched) |
| `w1-spec.json` | 53141 | keep |
| `selfassess-tip-raw.json` | 41512 | keep; rename recommended (§5) |
| `measure-c1-fd722a7.json` | 40983 | keep |
| `selfassess-baseline-raw.json` | 40685 | keep |
| `gen-w1.mjs` | 34050 | keep (holds the mirror recipe, §2) |
| `claims.json` | 8007 | keep |
| `xform-census.txt` | 2238 | keep (control arm) |
| `census-before.txt`, `census-after-c3.txt` | 2190 each | **trim one** (identical blob) |
| `staged-census.txt` | 2161 | keep (E09 arm) |
| `README.md` | 1558 | keep |
| `s107-row.txt` | 989 | keep (byte-identical witness) |
| `staged-ids` | 740 | keep (only surviving staged id census) |
| `measure-c2-5577d1b.json` | 732 | keep |
| `staged-row.txt` | 585 | keep (only surviving staged row) |
| `reg-ids` | 530 | keep |
| `w1.ready` | 148 | keep (dispatch readiness) |
| `guard-fixture/reg`, `collisions`, `guard-fixture/fix-{ids,collisions}` | 34, 25, 5, 5 | keep (tiny; the guard proof) |
| `w1-validate.err` | 0 | **trim** — empty and `.gitignore:8` (`.ufo/waves/*/*.err`) marks the class as never-landed; `git check-ignore -v --no-index` matches it. Round-26 carried the same empty file: carried habit, not a new decision. |

Trimming the duplicate census receipt saves 0 Git object bytes (blob already deduped); its value
is removing the impression that a before/after delta was captured. Everything else stays.

## 5. Cross-scope observations — after-state receipts (not my edit scope)

Encountered while inventorying; flagged because the question was "anything missing".

**C1.** `measure-c1-fd722a7.json` records `rev=fd722a7864…`, **`mismatches=1`**
(`m3-unlanded-paths`, `observed=9603`), `clean=false` — not 0. `selfassess-tip-raw.json` records
`rev=f185b4e…` (the *baseline* lane tip) and **`mismatches=5`** (four LOG-window findings + m3);
the "tip" name is ambiguous. No committed file in the round-27 tree records the after-value —
negative sweep: `git grep -l '"mismatches": 0' master -- .ufo/waves/round-27` → no hit.
SCORECARD:1396 says of `measure-c1-fd722a7.json`: "tip run at the integration commit records the
same `mismatches=0`" — not what the file says (`mismatches=1`; rev `fd722a7`, not the integration
commit). LOG:1902 points to "`mismatches=0` (measured receipt in the claim block below)"; the LOG
round-27 entry ends at line 1925 with the correction list, so there is no claim block below
(LOG.md is 1925 lines total).

**C2.** `measure-c2-5577d1b.json` records `valid=true` at `5577d1b`, when
`scripts/check-s106-evidence.mjs` was blob `a420bd2…`; HEAD's gate is `ea0f9d8…`
(`git rev-parse 5577d1b:scripts/check-s106-evidence.mjs` vs `5ed6484:…`), edited again by
`5198e28` and `5ed6484`. The receipt therefore validates a gate revision that is no longer
shipped, and no re-measurement accompanies those edits.

One tip-revision re-run per claim would close both gaps; the L1 owns those files.

## 6. Method, state, and stop point

Commands behind every number: `git ls-tree -r -l master -- <path>`; `git cat-file -s master:<path>`;
`git cat-file -p master:<path> | sha256sum`; `git show`; `git grep -lE '^source: S107 '`;
`grep -cE '^ {0,3}\|[[:space:]]*S…'`; `cmp`; `sed -n`/`awk` for line-numbered RFC text;
`gzip -9 -c | wc -c`; `test -e/-x`; `ls -ld`; `git check-ignore -v --no-index`; `ls` for the
absent `/home/vgpnk/Projects/shukuknow`.

Observation vs inference: all sizes, hashes and line numbers above are observed tool output. The
claim "the before census was a carried copy rather than a fresh run" is **[INFERENCE]** from the
identical blob reaching back to round 25 and the missing `EXIT=` line — the census would
legitimately produce identical output on an unchanged registry, so it concerns provenance only.
The working-tree entry edit (committed blob `848c0321…`, worktree `d5878a83…`, one `ground:` line)
is pre-existing and someone else's; I did not touch it. An orphan commit `b8b78f2` contains the
same rfc9110 blob but is not reachable from `master` (`git merge-base --is-ancestor` → false); it
affects no checked-out tree.

Stop point: the next candidate deletions would be (a) compressing `rfc9110.txt` to 138950 B and
(b) dropping `w1-dispatch.json` because it restates `w1-spec.json` item text. Both trade a
reader-facing capability (plain-text `sed -n` quote checks; the validated dispatch payload that
rounds 25–26 also carry) for bytes. I stopped before them.
