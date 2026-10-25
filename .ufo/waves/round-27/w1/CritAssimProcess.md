# CritAssimProcess — attack on the addendum-§10 conformance of landed C3 (round 27, wave 1)

Seat: `CritAssimProcess` (critic, wave 1, leaf — no dispatch, read-only outside this file).
Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Measured revision: **`5ed6484da66e6bf73654281d2e9ba3703f0c2ef0`** (`master`, the assignment's tip).
Round baseline `f185b4e7ab10cd9e8925e8ec614c9c111772357d`; C3 landing commit `6ca3b89ad2a7b480984859834b3d28f1e75a9a26` (2026-10-25 14:15:19 −0300).

**Verdict: procedural §10 conformance PASSES on (a)–(f); two record-level defects (A1, A2) and four hygiene/evidence defects (A3–A6) are named below. C3's frozen counter is met and nothing here withdraws it.**

Every review statement below is anchored to **HEAD**, not the working tree: at review time the worktree was dirty (A5), so live-tree geometry and HEAD geometry disagree on the S107 row and the entry.

---

## 1. Verdict per assigned item

| Item | Question | Verdict | Keystone evidence (§2) |
|---|---|---|---|
| (a) | ONE theme, 1–3 entries? | **PASS — 1 theme, 1 entry** | `git diff --name-status f185b4e master -- corpus/knowledge` → one `A` line |
| (b) | Gate records ≥1 admit **and** ≥1 reject? | **PASS — 1 admit + 2 rejects**, each with a flip condition | HEAD `corpus/lessons/round-27.md` §Gate; grounds independently re-measured (§2b) |
| (c) | Only S107 appended; entry cites no other row? | **PASS — exactly one `+| S` line; entry cites S107 once, no other id** | `git diff f185b4e master -- corpus/SOURCES.md \| grep -c '^+| S'` → `1` |
| (d) | Id assigned by document, not arithmetic? | **PASS — staged S124 document → lane S107; collision math reproduced** | registry 106 → 107, no duplicate ids; staged/registry id overlap S102–S106 |
| (e) | Quarantine slice untouched; register reads read-only? | **PASS (with one unknown-origin `.git` mtime, no content change)** | round-22 artifacts and `absent-defect-register.md` mtimes predate the round |
| (f) | Byte-exact staged row FAILS a census gate; transformed row passes? | **PASS — E09 reproduced on the staged row (exit 1), clean on the HEAD tree (exit 0, rows=107)** | §2f, four independent mirror runs |
| (g) | Any mandatory §10 step skipped? | **No step skipped; two refusal bullets are predictions without receipts (A4)** | §2g |

---

## 2. Evidence, item by item (every number carries its command)

### (a) One theme, one entry

```
git diff --name-status f185b4e7ab10cd9e8925e8ec614c9c111772357d master -- corpus/knowledge
A	corpus/knowledge/redirect-and-retry-after-semantics.md
git diff --stat  f185b4e… master -- corpus/knowledge
 …/redirect-and-retry-after-semantics.md | 55 ++++++++++++++
git ls-tree -r --name-only master -- corpus/knowledge | grep -c 'redirect-status-classification'
0                                     # the staged sibling stayed staged
```

One entry (inside the 1–3 band), one theme ("journey redirect and Retry-After semantics"). The staged sibling entry `redirect-status-classification.md` was **not** admitted, matching the S142 refusal. [M]

### (b) Gate: one admit, two rejects, with flip conditions

HEAD `corpus/lessons/round-27.md` §"Gate (sources opened this round, 2026-10-25)" carries, verbatim:
- `**S107 admitted**` — fetch date, 502941 B, sha256 `21c1cdce…`, staged-S124 transform, "Staged id → lane id assignment by document … never arithmetic";
- `**Staged S125 refused as a row**` — same document as **S102**; flip: adopt only if S102 is superseded and the row records `supersedes S102`;
- `**Staged S142 refused as a row**` — same RFC 9110 document as S107; flip: adopt only if S107's scope narrows so per-status classification needs its own row;
- a stripped-prose bullet (`"(errata only)"` → `730d`) and the quarantine bullet.

The **grounds** are not left as prose assertions — I re-measured both with the lane's own census gate (read-only, scratch roots):

```
# baseline registry + byte-exact staged S125 row
FINDING id=duplicate_url fleet=E04 row=S125 detail=duplicate_url
FINDING id=bad_recheck  fleet=E09 row=S125 detail=recheck_invalid
EXIT=1
# HEAD registry (has S107) + byte-exact staged S142 row
FINDING id=duplicate_url fleet=E04 row=S142 detail=duplicate_url
EXIT=1
```

So "S125 is a duplicate of S102" and "S142 is a second row for one document" are **gate-confirmed**, not eyeballed. The S142 row also re-asserts the corrected defect ("307 and 308 must not change the request method"), so refusing it prevented re-importing M1. [M]

### (c) Append-only, one row, one citing entry

```
git diff f185b4e… master -- corpus/SOURCES.md | grep -c '^+| S'      → 1
git show master:corpus/SOURCES.md | grep -cE '^\| S[0-9]{3} '        → 107
git show f185b4e…:corpus/SOURCES.md | grep -cE '^\| S[0-9]{3} '      → 106
git diff f185b4e… master -- corpus/SOURCES.md | grep -c '^-| S'      → 0
git grep -lE '^source: S107 ' master -- corpus/knowledge | wc -l     → 1
git show master:corpus/knowledge/redirect-and-retry-after-semantics.md | grep -oE 'S[0-9]{3}' | sort | uniq -c
      1 S107
```

Row is 989 B, 11 data cells (`awk -F'|' … NF` → 13 including edge empties), **0** occurrences of an escaped pipe (`sed -n '121p' corpus/SOURCES.md | grep -c '\\|'` → `0`), `recheck` cell bare `730d`, `used-by` cell exactly the admitted entry. `cmp` of the committed row against `.ufo/waves/round-27/assimilation/s107-row.txt` → identical. [M]

### (d) Id assignment by document, not arithmetic

- Baseline registry ends at **S106** → next free id is S107 (`grep -cE '^\| S[0-9]{3} '` on the baseline blob = 106).
- No duplicate ids at HEAD: `grep -oE '^\| S[0-9]{3,}' corpus/SOURCES.md | sort | uniq -d` → empty; unique count 107.
- The staged id space is parallel, not the lane's: recomputed `comm -12` of registry ids (106) against staged ids (148, recomputed from `SOURCES.append.md` with the 0–3-space pattern) → `S102 S103 S104 S105 S106`, exactly the recorded `assimilation/collisions` file. Staged **S124** could not be adopted by number; the row was rebuilt as S107 and the entry's `source:` line follows the **document** (`https://www.rfc-editor.org/rfc/rfc9110.txt`), not the staged number.
- The indented-id guard is real: `guard-fixture/reg` carries `  | S124 | indented fixture row |` and `fix-ids`/`fix-collisions` both output `S124`, i.e. the `^ {0,3}\|` pattern catches an indented row before any append. [M]

The transform is substantive, not a copy: staged S124 cited "§15.4.7 (307)" (RFC 9110 §15.4.7 is **306 (Unused)**, line 7485) and asserted "307/308 MUST NOT change the method"; HEAD S107 cites §15.4.8 with line anchors and states 308 as INFERENCE. Staged-vs-admitted `diff -u` shows the whole body re-written. [M]

### (e) Quarantine slice untouched; register reads read-only

```
stat -c '%y %n' .ufo/waves/round-22/assimilation/quarantine-verdicts.{json,tsv}
  2026-10-25 03:33  (both)   # round 22, before this round's 14:00 start
stat -c '%y %n' /home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md
  2026-10-24 08:37:00
find /home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1 -maxdepth 1 -newermt '2026-10-25 13:00' -type f
  (empty)
stat -c '%y %n' /home/vgpnk/Projects/shokuknow/merge/tabi/SOURCES.append.md
  2026-10-24 23:33:20
```

The four write-capable package scripts (**`renumber-staged.py`, `merge-plan.py`, `quote-lint.py`, `absent-defect-register.py`**) were not run: their output file mtimes are unchanged, and `absent-defect-register.py`'s default input `quote-lint-full-v3.json` does not exist under `corpus-expansion-1/` (a default run would have raised `FileNotFoundError` before writing). No row from the 38-row slice was adopted (only S107 was appended; S107 is RFC 9110, not a quarantine document). [M]

Sweep for *any* write in the read-only tree during the round:

```
find /home/vgpnk/Projects/shokuknow -newermt '2026-10-25 13:30' -type f | grep -v '/.deepresearch/' | wc -l   → 3
  lanes/tabi/round8/.work/ratelimit-series.tsv                  13:34:48
  lanes/revenger/round13/measurements/cleanup-marker-withheld-trace.log  13:35:28
  lanes/revenger/round13/measurements/cleanup-readback-timeout-trace.log 13:35:28
```

Those three predate the round (claims frozen 14:14) and sit in **other lanes'** round directories; they are not attributable to C3. **Unknown:** `/home/vgpnk/Projects/shokuknow/.git` has directory mtime `14:38:38` while every file inside it is older (`.git/index` 2026-10-24 23:33:24, no file in `.git` newer than 14:00). No repository content changed; consistent with a transient lock file created and removed by a read-only git invocation. [M]/[I]

### (f) Byte-exact staged row must FAIL; transformed row passes

The two supplied receipts (`.ufo/waves/round-27/assimilation/staged-census.txt`, `xform-census.txt`) do show the contrast — `file E09 S124 recheck=730d (errata only)` versus `file ok …/validate/xform/corpus/SOURCES.md` — but they carry **no exit code** and their format is the fleet wrapper's, so I re-exercised both arms myself with the lane gate `scripts/check-sources.mjs` (unchanged since the baseline: `git diff --stat f185b4e… master -- scripts/check-sources.mjs` → empty):

| Mirror (scratch) | Contents | Exit | Findings |
|---|---|---|---|
| A | baseline registry + **byte-exact** staged S124 row, entry absent | **1** | `E09 bad_recheck S124`, `E11 used_by_missing S124` |
| B | baseline registry + transformed S107 row + entry (worktree bytes) | 0 | `verdict=clean rows=107` |
| C | baseline registry + byte-exact staged **S125** row | 1 | `E04 duplicate_url`, `E09`, `E11` |
| D | HEAD registry + byte-exact staged **S142** row | 1 | `E04 duplicate_url`, `E09`, `E11` |
| E | **HEAD tree** (`git archive master corpus`) unmodified, + entry | **0** | `verdict=clean rows=107 tiers=A:92,B:6,C:9 findings=0` |

So: E09 is the staged row's real defect (prose recheck cell, i.e. `bad_recheck`), the transformed row passes, and the tip tree measures **106 → 107 rows, exit 0**. My mirror A also produced E11 because the entry was absent in that arm, so "E09 only" understates the staged arm by one finding — immaterial to the control (it fails either way). [M]

### (g) Mandatory steps — none skipped, two recorded as prediction

The §10 machinery items the round-26 LOG itself named are all present and locatable: collision guard **with** the indented-fixture proof (`assimilation/guard-fixture/*`), staged-row transform (`s107-row.txt`, byte-identical to the committed row), scratch-mirror census gate (both receipts), S125 refusal, S142 refusal, stripped-prose record, quarantine statement, and the frozen/resumed clause in LOG/lesson. `considerthese/` noted absent.

One residual gap: the S125/S142 bullets are phrased as predictions ("appending it **must** trip census E04") with no output receipt. That is a documentation gap, not a missing action — my §2b runs supply the measurement.

---

## 3. Findings

### A1 (medium — content defect in the landed entry, unfixed at HEAD). False novelty claim in `ground:`

HEAD `corpus/knowledge/redirect-and-retry-after-semantics.md:6` reads:

> `ground: multi-step journey execution semantics — the redirect rules the lane's driver has never asserted`

"Never asserted" is contradicted by three committed entries at HEAD:

| Counter-entry | Line | Text (≤25 words) |
|---|---|---|
| `corpus/knowledge/external-class-fixture-v2.md` | 487 | "R3 — 307 preserves method and body end-to-end." |
| `corpus/knowledge/stateful-fixture-evidence.md` | 624 | `post-307` cell … "wire + server log (method preserved)" |
| `corpus/knowledge/state-changing-matrix-r9.md` | 229 | "M — method-preserving redirect, no state … POST `/echo307` → `307` → POST" |

The **delta** is real (`git grep -niE 'post to get|MAY change the request method' f185b4e -- corpus` → 0): 301/302 POST→GET, 303's GET-or-HEAD retrieval, `Retry-After` on 3xx. But the sentence claiming the lane never asserted redirect rules is false. HEAD `corpus/README.md:605` is careful ("traversed, never classified"); the entry is not.
**Smallest safe correction:** replace the `ground:` sentence with the delta only — the wording already staged in the dirty worktree is adequate. The row, the quotes and the counter are unaffected.

### A2 (medium — false provenance in the claims record). `controlArmFalsified` misquotes the frozen claim and mislabels its timing

`round-27/claims.json` → `claims[2].controlArmFalsified` asserts the frozen text "speculated the byte-exact staged row would fail 'its own census gate' on malformed-row grounds; measured ground is E09 (prose recheck cell), not a malformed row"; `revisions` repeats it.

Measured against the frozen file:

```
grep -c 'malformed'           .ufo/waves/round-26/claims.json  → 0
grep -c 'its own census gate' .ufo/waves/round-26/claims.json  → 0
```

The frozen control actually reads: "appending the staged S124 row byte-identical (**campaign schema, prose recheck cell**) must fail the census --file gate …". A prose recheck cell **is** E09 (`bad_recheck` in `scripts/check-sources.mjs:39`). So the frozen control was **confirmed**, not falsified: it predicted exactly the code that fired, and it never mentions malformed-row (E01) nor the quoted phrase. Second, the "**PRE-DATA**" label is contradicted by the artifacts' own mtimes: `assimilation/staged-census.txt` 14:13:14.95 precedes `round-27/claims.json` 14:14:10.44 — the note was written 55 s *after* the measurement it cites. (The frozen *predicates* do predate data: `round-26/claims.json` is 11:28:42.)
**Smallest safe correction:** rewrite the revision as "control confirmed: E09 (prose recheck cell) is the predicted failure mode", and replace "PRE-DATA" with "pre-dispatch, post-measurement". No counter or predicate changes.

### A3 (low — quote fidelity, unfixed at HEAD). Two quoted spans are not byte-exact substrings

```
grep -cF 'if this behavior is undesired' rfc9110.txt                          → 0
sed -n '7386,7387p' rfc9110.txt | grep -cF 'if this behavior is undesired'    → 0
sed -n '7385p'   rfc9110.txt  → '…for the subsequent request.  If'
```

The entry lower-cases and relocates the fragment: bytes have "If" at line **7385**, the citation says 7386-7387 (and 7406-7409 for the 302 twin, actual note 7406-7409 — that one is right). Likewise "(§15.4.4, line 7413)" is used for a sentence that runs 7413-7414, and the ranges `7507-7523` / `4809-4813` include the trailing blank line (bodies end 7522 / 4812). No meaning changes; an executable quote arm would flag all three.
**Smallest safe correction:** cite `7385-7387` and `7407-7409`, `7413-7414`, `7507-7522`, `4809-4812`.

### A4 (low — record completeness). Refusals are predictions without receipts

Headline S125/S142 bullets name E04 as the expected trip, but no census output for either row exists under `.ufo/waves/round-27/assimilation/`. My §2b runs are the measurement of record; the L1 should either attach them or mark the bullets as confirmed-by-wave-1.

### A5 (medium — integration risk, not a C3 defect). Tracked files are dirty **at review time**, and the live S107 row differs from HEAD

```
git status --porcelain   →  M LOG.md, SCORECARD.md, corpus/QUALITY.md, corpus/README.md,
                             corpus/SOURCES.md, corpus/knowledge/redirect-and-retry-after-semantics.md,
                             corpus/lessons/round-27.md, scripts/check-s106-evidence.mjs
stat -c '%y' corpus/SOURCES.md                                    → 14:39:11
stat -c '%y' corpus/knowledge/redirect-and-retry-after-semantics.md → 14:38:34
stat -c '%y' corpus/lessons/round-27.md                           → 14:40:15
```

All four mtimes are **after** the tip commit `5ed6484` (14:35:59). The uncommitted S107 row already differs materially from HEAD's (scope cell "Documented … may observe", an added §15.4-history anchor at 7260-7264, a rephrased `teaches` cell). Consequence for the L1: **any gate run now measures uncommitted bytes**; wave-1 findings must be adjudicated against `5ed6484`, and the once-after-integration gate must run only after these revisions land (or are dropped). I did not attribute these edits to a seat and did not touch them.

### A6 (low — evidence capture). The two census receipts are byte-identical and carry neither exit status nor row count

`diff census-before.txt census-after-c3.txt` → empty; both are 17 lines ending `tabi ok …/corpus/SOURCES.md`. This is *expected* (the census prints findings, and the append added none), but the receipt alone cannot evidence "106 → 107" or "exit 0". I verified both independently (row counts 106/107; HEAD-tree gate exit 0 rows=107). Optional fix: re-run the census capturing `$?` and the row count into the receipt.

---

## 4. What I did not find (negative claims + their sweeps)

- **No duplicate authority:** exactly one registry row for `rfc9110.txt` (`grep -n 'rfc9110\|RFC 9110' corpus/SOURCES.md` → 1 line), and E04 fires on the staged S142 duplicate. 
- **No second entry, no second admitted theme:** `corpus/knowledge` gains exactly one file; the staged sibling stays staged.
- **No id renumbering or row rewrite:** the SOURCES diff is `1 insertion, 0 deletions`; no `^-| S` line.
- **No quote absent from the fresh bytes:** every range the entry rests on re-located in the committed 502941 B / sha256 `21c1cdce…` blob — 7413, 7416-7418, 7423, 7384-7387, 7406-7409, 7493-7495, 7507-7523, 7306-7307, 4805-4813. Only A3's boundary/casing issues attach.
- **No runtime over-claim:** the entry is labelled "Documented upstream, not measured here"; its loopback premise is grounded (A1 table) and "real-site … untested by rule" matches `multi-step-journey.md:287`.

## 5. Scope compliance

- Lane gates were **executed read-only** in service of the assigned control-arm re-exercise: `node scripts/check-sources.mjs --root <scratch mirror> --file corpus/SOURCES.md` (A–D), once against the HEAD archive tree (E), once against the live tree. Its validate path writes only stdout (`writeFileSync`/`rmSync` occur solely in the `--selftest` fixture path, `scripts/check-sources.mjs:436-526`), and `git status --porcelain` was unchanged before/after my runs.
- Wrote only this report and `scratch/CritAssimProcess/` (mirrors A–E ≈ 57 MB each incl. a corpus copy, receipt `.out` files, row extracts).
- No tracked file edited; no git/jj write; no build/linter/formatter; no pacman; no tool installed or upgraded; no spawn, no peer message, no broadcast.
- Read-only reads of `/home/vgpnk/Projects/shokuknow` (`merge/tabi/SOURCES.append.md` line 29/30/47, the staged entry, mtimes); nothing executed there and none of the four write-capable scripts run.

---

# Addendum — seat-owner second pass: the dirty row's contract consequence, and the corrected refusal text measured

State: §1–§5 measured `5ed6484`. This addendum re-measured the same rev and adds four
things they do not cover. An earlier draft of this seat's report measured `336d5d1`; it
is superseded by this file and its numbers are re-derived below.

## D1 (medium — landing blocker if committed as-is). The dirty S107 row edits three **immutable** cells

Full-cell diff of the S107 line, `git show master:corpus/SOURCES.md` vs the worktree:

```
CHANGED scope    "The normative redirect semantics a journey driver observes …"
              →  "Documented redirect semantics a journey driver may observe …"
CHANGED anchor   (…same sha256…; adds "§15.4 historical note at 7260-7264 …"; 7413 → lines 7413-7414)
CHANGED teaches  "308's preservation is an inference in this text"
              →  "RFC 9110's history note describes 308 as method-preserving but §15.4.9 does not restate the rule normatively"
```

`id`, `source`, `kind`, `tier`, `status`, `opened`, `recheck`, `used-by` are unchanged.
CORPUS.md rule 2 (`/home/vgpnk/Projects/shokunin/CORPUS.md:96-100`): "**Only `status`,
`recheck` and `used-by` change in place** … A correction is a new row whose `teaches`
opens `supersedes S0NN —`." So `scope` and `teaches` are being rewritten in place, with
no old→new log in the lesson — the one append-only failure this item asked about.
Consequence: item (c) is **PASS at HEAD** (`1 insertion, 0 deletions`) and becomes
**FAIL at landing** if this diff commits.

Smallest safe correction: **revert `corpus/SOURCES.md`.** The HEAD row is accurate — all
nine cited spans re-locate in the committed bytes, `teaches` already labels 308's
preservation as an inference, and the 7260-7264 note now lives in the entry where it
belongs. If a row-level correction is genuinely wanted, append
`| S108 | … | … | supersedes S107 — …` and log the change old→new in the lesson.

## D2 (medium — resolves A4). The corrected refusal bullets are now **measured**, not predicted

- `scripts/check-sources.mjs:296` — `if (seenUrls.has(url) && !/^supersedes\s+S[0-9]{3,}\b/.test(teaches))`
  → this gate's E04 is **URL-only** (no scope term). "check-sources flags duplicate URL
  as E04" is true by code.
- Same-scope control (staged S125 row rewritten with **S102's scope cell**, fleet
  census): `exit 1`, `file  E04  S125 duplicate url www.ietf.org/archive/id/draft-ietf-httpbis-rfc6265bis-13.txt within scope …`
  → "a control with S102's exact scope produces census E04" is true.
- `supersedes S107` control (staged S142 fields, `scope` = S107's, `teaches` = `supersedes
  S107 — …`, `recheck` = `730d`, `used-by` = the admitted entry, fleet census):
  `exit 0`, `file  ok  …/F/corpus/SOURCES.md` → "the measured `supersedes S107` merge
  passes both gates" is true (the check-sources half follows from the same regex).

Exact split to keep straight in any rewrite: the **fleet census** reports `W04`+`E09`+`E11`
for the byte-exact S125/S142 rows and reaches `E04` only when the scope cell also
matches; **`check-sources.mjs`** reaches `E04` on the URL alone.

## D3 (low — provenance rationale). The 308 re-anchor target was a dead end; the fix removes it silently

Evidence in the committed 502941 B blob: RFC 9110 **obsoletes RFC 7538** (line 28) and
§B.7 says "Changes from RFC 7538 / **None**" (372-373), so 7538 cannot carry a sentence
9110 lacks; §15.4.9's only 7538 pointer is deployment (7529-7530); the located sentence
the entry now cites is §15.4 **7260-7264** ("were later added to unambiguously indicate
method-preserving redirects"). The working-tree entry drops the 7538 pointer (correct)
without recording why, so a reader cannot tell the old target was wrong rather than
merely untidy. One clause on obsoletes/§B.7 makes the correction auditable.

## D4 (low — propagates A2). The false revision text survives in the lesson, not only in `claims.json`

The working-tree `corpus/lessons/round-27.md` `## Corrections` block still says
"the frozen claim speculated the byte-exact staged row fails the census gate on
malformed-row grounds; measured ground is E09". A2's one-line fix must be applied here
as well as in `claims.json.revisions`.

## D5 (corroboration, independent of §2). What I re-ran and got

- staged mirror (baseline registry + byte-exact S124 + entry) → `diff` against
  `assimilation/staged-census.txt` → **identical** (17 lines, E09 present).
- transformed mirror → identical to `xform-census.txt` except the `ok` line's path.
- live `sources-census.sh validate --root … tabi` → **exit 0**, 107 rows, output
  byte-identical to `census-after-c3.txt`.
- `curl -sSL https://www.rfc-editor.org/rfc/rfc9110.txt` → `http=200 bytes=502941`,
  sha256 `21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a` = committed bytes.
- Quarantine by **content**, not mtime: `absent-defect-register.md` sha256
  `5afe1810a6c3d62f37987b575a954f5b1197daa23005d4bb2f1d982f64bad833` = the round-22
  receipt's `registerSha256` (`corpus/lessons/round-22-verifier-spotcheck.md:166`).

