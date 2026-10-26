# RevQualityCriteria — w2 review of QUALITY.md criteria 74–79 at 072af95

**Verdict.** I attacked the six criteria appended at `072af95fe2822f0785a6ff88a578e2142dd258e5` (`corpus/QUALITY.md:400-452`) on five axes: lesson-pointer resolvability, existence at that revision of every named mechanical check, testability, numbering continuity from 73, and contradiction with criteria 1–73. All six criteria hold on form: every pointer resolves (round-30 lesson mistakes M1/M3/M4 with both table row and subsection; round-29 spot-check routed defects 1–5 and 7; criteria 65/70), every named mechanical check exists and runs clean at the revision (frontier counter self-test 24/24, gate-mutants counter self-test 12/12, catalogue 27 fault / 13 benign, case tables present in both gates), numbering is 1–79 with no gap or duplicate, and no contradiction with an earlier criterion was found. One **medium defect** sits in the round's own artifacts: `corpus/lessons/round-30.md` fails criterion 77's own mechanical check at the very commit that appends it — 6 mistake table rows (M1–M6) vs 4 subsections (M1–M4); the M5/M6 rows added at 072af95 have no subsections, and the wave-1 receipt that recorded "4 table rows and 4 subsections (counted equal)" is stale at the tip. Three **low defects** cluster around criterion 79: its example says "the two DEPS-pinned rows (S044, S068)" where the same commit's population-rule section and the Scribe's own enumerator say six; the population-rule section's "three main-branch rows" is contradicted by the receipt it cites in the same sentence (the receipt lists two); and the section names only 2 of the 4 excluded classes its own enumerator produces.

## Method

Scratch clone (porcelain empty), all measurement there; lane touched read-only:

```
S=/fast/scratch/hyaku/tabi-r30/RevQualityCriteria
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"        # exit 0
git -C "$S/clone" checkout -q 072af95fe2822f0785a6ff88a578e2142dd258e5           # exit 0
git -C "$S/clone" status --porcelain | wc -l    # -> 0
git -C "$S/clone" rev-parse HEAD                # -> 072af95fe2822f0785a6ff88a578e2142dd258e5
```

Frozen bytes confirmed at the revision (exit 0):

```
sha256sum scripts/check-frontier-admission.mjs scripts/check-gate-mutants.mjs scripts/gate-mutants.json
cadef57e8d9627a02d7e8c5404689225cf5b4de361e816f62c4127b28a509eca  scripts/check-frontier-admission.mjs
02945f882ea9c62a3f42934f13b4dc52887ebd93a5a69dd6526d20f01cec3a55  scripts/check-gate-mutants.mjs
cd1c27a2a971f8a4d4208fd53efe3adbc776efacb7072201af8bb55b93853833  scripts/gate-mutants.json
```
All three match `claims.json` `frozenDigests` — the checks the criteria cite exist at 072af95 byte-identical to the freeze.

Counter self-tests (exit 0 each; captures in `selftest-frontier.txt`, `selftest-gate-mutants.txt` beside this report):

```
TMPDIR=$S/tmp node scripts/check-frontier-admission.mjs --selftest
  -> FRONTIER_ADMISSION_SELFTEST verdict=clean cases=24 passed=24      (exit 0)
TMPDIR=$S/tmp node scripts/check-gate-mutants.mjs --selftest
  -> GATE_MUTANTS_SELFTEST verdict=clean cases=12 passed=12            (exit 0)
```

Catalogue counts (exit 0): `git show 072af95…:scripts/gate-mutants.json | grep -oE '"kind": *"[a-z]+"' | sort | uniq -c` → `13 benign`, `27 fault`.

Numbering (exit 0): `git show 072af95…:corpus/QUALITY.md | grep -oE '^[0-9]+\. ' | …` → `count=79 last=79`, no GAP/DUP line — criteria 1–79 contiguous, no duplicates; 74–79 continue 73.

## Verdict per criterion

**74 — holds.** Pointer `corpus/lessons/round-30.md#mistakes M1` resolves (`## Mistakes` :130, row :139, `### M1` :146); routed round-29 defect 2 resolves (`round-29-verifier-spotcheck.md:119`). Mechanical checks exist at the revision in `scripts/check-frontier-admission.mjs` (frozen bytes): `g5-quote-located` :211 (quote must be a substring of `normalise()` of the bytes at the receipt's own committed `bytes_path`, :206-210), `g6-gate` :212 (quote in the round lesson, `DEFAULT_LESSON` :82), `q1-entry-quote` :260 (every double-quoted ≥4-word span of the entry, `entryQuotes` :155-163); self-test clean, cases=24, with red cases `quote-not-in-bytes`, `quote-not-in-lesson-gate`, `entry-quote-fabricated` each failing on exactly the named reason. Grounding and non-frontier Gate rows are declared review — consistent with M1's fix text. Testable: yes. No contradiction with 38 (recheck URL binding) or 72 (command-output captures) — different objects. Nit only: the criterion's q1 shorthand "every >=4-word span of the entry" omits "double-quoted … outside code spans"; the script's own comment (:56) is precise, and the criterion names the check id, so it resolves.

**75 — holds.** Pointer `#mistakes M4` resolves (row :142, `### M4` :207); routed defect 1 resolves (`:118`). `r3-used-by` exists (:252) and runs only on entries carrying the `frontier:` tag (:237-239), exactly matching the criterion's "neither instrument reads a row cited only outside the frontier surface, so that direction is reviewed". The census check exists: fleet-root `scripts/sources-census.sh` code E11 "used-by path missing on disk" (:29, emitted at :567). "SOURCES contract rule 2" resolves and says what the criterion claims — fleet `CORPUS.md:116-118` and `.ufo/waves/kaika/SOURCES-CONTRACT-v1.md:49-51` both: "Only `status`, `recheck` and `used-by` change in place, and each change is logged old→new in the round lesson" (the lesson's section header says "CORPUS rule 2"; both documents carry the identical rule 2, so both pointers land). The lesson logs 23 old→new rows (S033–S106). Testable: self-test case `used-by-omits-entry` → `r3-used-by`, exit 1.

**76 — holds.** Pointer `#mistakes M3` resolves (row :141, `### M3` :185); routed defect 7 resolves (`:124`). The battery exists and is clean (`check-gate-mutants.mjs`, cases=12); catalogue is 27 fault / 13 benign as the criterion states; case tables exist in both gates — `check-s106-evidence.mjs` `CASES` :183+ pinning `field`/`fieldValue` (:194-195, :202-203, :216-217, :224-225, :237-238, :251-252, :270-271) and `check-release-pins.mjs` `CASES` :315+ pinning `reasons` per case (:359, :370, :378, :387, :395, :405, :412, :419, :428). Testable: the battery is runnable and its self-test proves both failure directions (uncovered-check-survives → survivors 1; source-grep-case-false-kills-benign → benign_killed 1). Low observation: the battery counts kills, not case exercise — lesson M5 (:143) demonstrates a cwd-derived junk case reaching `fault_survivors 0 / benign_killed 0` on the frozen counter; the exercise property ("case builds a fixture and calls the gate's `evaluate()`") is certified only by the wave-2 kill-attribution audit and the planned counter v2, not by criterion 76's text. A reviewer applying 76 alone plus the battery's `failing_cases` output can see the junk's attribution, but not its vacuity.

**77 — holds as a criterion; defect in the round's own lesson (medium).** Pointer routed defect 3 resolves (`:120`); the mechanical check is given in the criterion and works; "no lane instrument asserts this yet" is true — `git grep -n '### M' 072af95… -- scripts` finds nothing and no script counts mistake rows/subsections. Testable — and it fails on the artifact it governs, at the commit that appends it:

```
cd $S/clone
grep -c '^| M[0-9]'  corpus/lessons/round-30.md   # -> 6
grep -c '^### M[0-9]' corpus/lessons/round-30.md  # -> 4
grep -c '^| M[0-9]'  corpus/lessons/round-29.md   # -> 5
grep -c '^### M[0-9]' corpus/lessons/round-29.md  # -> 5
```

`round-30.md` numbers mistakes M1–M6 in its table (:139-144) but carries subsections only for M1–M4 (:146, :166, :185, :207); no `#### M` headings exist (count 0) and the file ends at the Scope note (:237, 241 lines). The 072af95 diff adds `+| M5 |` and `+| M6 |` with no matching `+### M5`/`+### M6`. The wave-1 receipts are stale at the tip: `w1/ScribeMistakes.md:26` records "gains `## Mistakes` with M1–M4: 4 table rows and 4 subsections (counted equal)", and `w1/ScribeQualityCriteria.md:57` tracks defect 3 as "in flight — ScribeMistakes confirms 4 table rows = 4 subsections". No w1 file discloses the M5/M6 subsection gap. By the criterion's own rationale, M5/M6's able-to-fail states are unrecorded (their fix cells describe compensating wave-2 audits and a planned counter v2, but no stored red command). round-29.md itself now passes (5/5 — the defect-3 fix landed there as appended rows :276-277). Severity medium: mechanically detectable governance gap in the round's own lesson, undisclosed, in the same commit as the criterion.

**78 — holds.** Pointer routed defect 4 resolves (`:121`); criteria 65 (:343) and 70 (:381) exist and 78 explicitly marks itself their recurrence — 70 requires document+line for self-assessment supersession, 78 extends the citation form to appended corrections generally and adds the quoted-anchor alternative; no conflict. The span arithmetic is verified against the committed bytes:

```
sed -n '199,212p' corpus/evidence/round-29/release-pins/bytes/156.0.8078.47/third_party/blink/renderer/core/html/forms/html_form_element.cc
  199 "  }"  200 blank  201-202 comments  203 "if (!form_->GetDocument().IsActive()) {"
  204-208 return spanning five lines  209 "}"  210 blank  211 "// Success. …"
```
Guard block 201-209 = nine lines; the "10-line insertion" = those nine plus the blank at 210 — exactly the surviving errata statement (`chromium-156-release-pin-recheck.md:117-118`), while the scribe addendum (:120-141) supersedes the stale `:110-111` attribution and cites by document and line, as 78 demands. Testable: yes (the arithmetic above is the failing test).

**79 — holds as a criterion; three low defects in its example and exemplar section.** Pointer routed defect 5 resolves (`:122`); the stated rule matches the instrument (`check-release-pins.mjs:178`: `recheck === "on-release"` and a source-cell tag below `--stable`); "no lane instrument prints the excluded class" is verified — the script prints `population/resolved/unresolved/holds/drifted` counts and per-population-row results only (:265-266, :556-557), never excluded ids. The round's own statement puts rule and count in one place (`round-30.md:223-231`, "23 of 89 … Measured at 061e6202"). Testable: yes — I re-derived the id set, which is how the defects below surfaced.

- **(a) stale example in the criterion itself (low).** `QUALITY.md:446-449` says "the two DEPS-pinned rows (S044, S068)". The same commit's population-rule section and the Scribe's own enumerator say **six** devtools-commit rows: S036, S044, S068, S088, S089, S090 (`round-30.md:223-231`; `population-split.json` `devtools_commit_rows`; my enum3 re-run `counts["deps-devtools-commit"]=6`; SOURCES.md :50/:58/:82/:102/:103/:104 all `on-release` with the `66df492…` devtools commit in the source cell). The definite "two" is stale-on-arrival; a reader following the example would understate the excluded class the criterion says must be named and counted.
- **(b) lesson vs its own cited receipt (low).** `round-30.md:223-231` says "three `main`-branch rows (S004, S028, S035)" and cites `population-split.json` in the same sentence; that receipt's `main_branch_rows` is `["S004","S028"]` — two. Re-derivation with the Scribe's own `enum3.mjs` on the 061e6202 registry gives three (S004, S028, S035; S035 is `on-release` with a `raw.githubusercontent.com/chromium/chromium/main/…` source, SOURCES.md :49). The prose is right and the committed receipt is incomplete — a reader re-performing the criterion's derivation hits a contradiction between the lesson and its evidence.
- **(c) unnamed excluded classes (low, letter-vs-spirit).** The section names 2 of the 4 excluded classes its own enumerator produces: `at-stable` (S109–S115, 7 on-release rows pinned at the new stable tag 156.0.8078.47) and `non-chromium-host` (50) are unnamed; only devtools-commit (6) and main-branch (3) are. By the criterion's letter ("every class the rule excludes named and counted") the exemplar is incomplete; by its example's spirit (the surprising exclusions) it is adequate. Nit within this: the "six rows" enumeration is already stale at the tip — S118 (added in the same commit, `on-release`, devtools-commit source, SOURCES.md :132) makes it seven; the measurement sentence pins 061e6202 but the enumeration does not.

## Findings by severity

- **Medium — D1:** `corpus/lessons/round-30.md` at 072af95 violates criterion 77's mechanical check (6 rows vs 4 subsections; M5/M6 without subsections at any heading level); w1 receipts `ScribeMistakes.md:26` and `ScribeQualityCriteria.md:57` stale; undisclosed. Evidence: counts above + 072af95 diff (`+| M5 |`, `+| M6 |`, no `+### M5`/`+### M6`).
- **Low — D2:** criterion 79's example "the two DEPS-pinned rows (S044, S068)" vs six (`QUALITY.md:446-449` vs `round-30.md:223-231`, `population-split.json`, enum3).
- **Low — D3:** population-rule section's "three main-branch rows" vs cited receipt's two (`round-30.md:223-231` vs `population-split.json` `main_branch_rows`; enum3 re-run says three).
- **Low — D4:** population-rule section omits the `at-stable` (S109–S115) and `non-chromium-host` (50) excluded classes; "six rows" enumeration stale at tip (S118).
- **Observations (no action forced):** criterion 74's q1 shorthand omits "double-quoted" (D5, nit); criterion 76's battery counts kills not exercise — M5's cwd vector passes it, exercise is certified only by the wave-2 audit / counter v2 (D6, low).

## Residual risk and verification gaps

- I verified the instruments (self-tests, catalogue counts, case tables, digests), not the claims: the full C1 battery run (27 mutants at tip) and the C2 `--live` reading belong to the C1/C2 seats; I did not re-run them.
- I did not audit the two frontier entries' admission (C2's surface).
- `population-split.json`'s producing script is not identified among `enum.mjs`/`enum2.mjs`/`enum3.mjs` (its shape matches none exactly); D3 is documented, not attributed to a specific script line.
- Repair of D1–D4 belongs to the Scribe; this seat does not repair.

## Honesty notes

- No network fetches were made (all verification local: `git show`, node self-tests with sandboxed fixtures under `$HYAKU_SCRATCH/tmp`); nothing to record under the fetch-receipt rule.
- No tools installed or upgraded (node pre-existing); pacman untouched.
- Measurement only inside the scratch clone (porcelain 0); lane read-only; no lane index/jj touched.
- Evidence captures beside this report: `selftest-frontier.txt`, `selftest-gate-mutants.txt`, `criterion77-counts.txt`, `population-derivation-enum3.json`, `population-split.json` (copy of the cited w1 receipt).
