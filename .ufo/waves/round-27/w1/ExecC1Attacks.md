# ExecC1Attacks — C1 supersession semantics: attack + counter re-run (round 27, w1)

Seat: leaf / read-only reporter. Nothing here edited tracked bytes. All fixtures, clones and receipts live
under `.ufo/waves/round-27/scratch/ExecC1Attacks/` (gitignored: `.gitignore:5` `.ufo/waves/*/scratch/`).

**Measured revision.** Lane HEAD `5ed6484da66e6bf73654281d2e9ba3703f0c2ef0`; gate
`scripts/check-selfassessment.mjs` sha256 `de5d6676b767d31ec52e2831a30dd8899dce99abe4b034e24440176f1ec7faab`.
C1 landed at `fd722a7864d5e6331063251216f8922be8de5048` (parent `f185b4e7ab10cd9e8925e8ec614c9c111772357d`);
claim baseline for C1 is `4ad4c77eed78bca1a149e65a7ec6a84b5f71c925`.

**Tree drift during this run.** At first `git status --porcelain` the tree held 4 untracked wave paths; by the end it held
46 entries (`git status --porcelain -uall | wc -l` → 46, none under `scratch/`), including an uncommitted `LOG.md`
addition (`git diff --stat -- LOG.md` → `22 insertions(+)`). Every number below is either anchored to a `--rev` or is
explicitly labelled live-tree. Two independent things moved: wave-2 landing work, and an uncommitted `### C1 counter
falsification` block appended at `LOG.md:1927` (absent from `git show HEAD:LOG.md`; verified with
`git show HEAD:LOG.md | grep -c ExecC1Attacks` → 0). That block reaches the same conclusion as this report; §7
states where this report is sharper.

**Prior report at this path.** This path already held a 175-line report (sha256
`a81203f896a7b0fd884536db43fe4a7fed506fa7026f9a263713ac2ed7df24ab`, measured at an older HEAD `336d5d1`) from an earlier
incarnation of this seat. It was preserved verbatim at `scratch/ExecC1Attacks/prior-ExecC1Attacks.md` before this file was
written. This report is an independent re-run: different fixture set, different revision, and four measurement classes the
prior report did not contain (§4 real-content variants, §5 strict-predicate quantification, §6 relative-`--repo`
false-clean, §3 paragraph-merge anatomy). Where both exist, the headline agrees.

---

## 1. Bottom line

| # | Finding | Severity |
|---|---|---|
| F1 | The "cites the superseded line (:/LINE/)" arm is implemented as a bare `/:\d+/` test. Any colon-number in the paragraph — a wrong line, a clock time, a URL port — clears the finding (`check-selfassessment.mjs:325`). | **high** |
| F2 | The "states the oracle-correct number" arm is satisfied by any `\bN/M\b` fraction or any `N-case` phrase anywhere in the paragraph (`:252`, `:246-254`). Unrelated numbers clear findings. | **high** |
| F3 | The correction unit is a blank-line run, not a Markdown list item. The five round-27 correction bullets are **one 22-line paragraph** (`LOG.md:1904-1925`, 0 blank lines inside); a pre-existing 183-line paragraph (`LOG.md:265-447`) is the sole "correction" for a stale tally it never mentions. | **high** |
| F4 | Under the frozen predicate as declared, the counter is **6** at baseline `4ad4c77` (claim says 5) and **1** at the tip (`LOG.md:221`, uncorrected), not 0. The shipped integer 0 exists only because of F1/F2/F3. | **high** |
| F5 | `m3` counts live porcelain, not `--rev` bytes: `--rev 4ad4c77` with a 46-entry tree reports `m3 observed=46`. Historical receipts are tree-dependent. | medium |
| F6 | `--repo <relative>` silently degrades **every** gate tally to `could-not-evaluate` ("self-test printed no tally") and returns exit 0 / `superseded=0`: same repo, same rev, absolute path gives `superseded=10`. | medium |
| F7 | The marker arm `/supersed\|correct/i` (`:324`) accepts negation ("This is not superseded") and the substring inside "incorrect". | low |
| F8 | The uncommitted `LOG.md` block cites `.ufo/waves/round-27/w1/ExecC1Attacks.md` as evidence; no `w1/` path is tracked at HEAD (`git ls-tree -r --name-only HEAD -- .ufo/waves/round-27/w1 \| wc -l` → 0). | low |

Required-case verdicts (details §2, §3): **(a) FAILS** (wrong cited line clears the finding); **(b), (c), (d), (e) HOLD**
in both the loose and the strict reading.

---

## 2. Frozen predicate vs shipped code

Frozen text (`.ufo/waves/round-27/claims.json`, `claims[0].declared`; its rule sentence is byte-identical to
`.ufo/waves/round-26/claims.json`, whose `declared` appends a Before/After narrative — the two strings diff only in that
tail, `scratch/ExecC1Attacks/r2{6,7}-c1-declared.txt`):
a later paragraph clears an earlier stale mention only when it names the same script, carries a correction marker,
cites the superseded line (`:/LINE/`) and states the oracle-correct number via a tally shape.

`m1LogFindings()` supersession loop, `scripts/check-selfassessment.mjs:316-328`:

| arm | declared | shipped | line | verdict |
|---|---|---|---|---|
| later-than | strictly later paragraph | `if (p.start <= f.line) return false;` | 320 | correct |
| same script | names the same script | `SCRIPT_IN_TEXT` match equals `f.script` | 322 | correct |
| marker | "correction marker" | `/supersed\|correct/i.test(text)` | 324 | **substring-loose** (F7) |
| citation | **cites `:/LINE/`** | `/:\d+/.test(text)` | 325 | **wrong** (F1) |
| number | oracle-correct number in a tally shape | `statedTallyNumbers(text).includes(f.observed)` | 326 | **over-broad** (F2) |
| unit | "paragraph" | `paragraphs()` = blank-line-delimited run | 256-264 | literal, but see F3 |

`statedTallyNumbers()` at `:246-254` collects, in order: `` `--self-test` N/N `` (248), `N-case` (249),
`cases: N`/`cases=N` (250), `N cases` (251), and **any `\bN/M\b`** (252). The last pattern is not in the frozen shape
list (`--self-test N/N`, `N-case`, `cases=N`, `N cases`) and is what F2 exploits.

---

## 3. Fixture matrix — 18 cases

Method, identical for every case: `D=$(mktemp -d "$SCRATCH/repos/<name>.XXXXXX")` → `git -C "$D" init -q` →
`git -C "$D" config user.email/user.name` → `git -C "$D" rev-parse --show-toplevel` asserted equal to `$D` **before** the
first commit → files written → `git -C "$D" add -A` → `git -C "$D" commit -q` → every git call naming `-C "$D"`.
Gate: `node /…/scripts/check-selfassessment.mjs --repo "$D" --rev "$rev" --json`. Driver scripts
`scratch/ExecC1Attacks/run-cases{,2,3,4}.sh`; per-case JSON in `scratch/ExecC1Attacks/out/<name>.json`, revs in
`out/index*.tsv`.

Shared fixture content: `scripts/check-fixture.mjs` prints `FIXTURE_SELFTEST verdict=clean cases=13 passed=13`
(oracle **13**; matches `RUNNABLE_GATE`); `SCORECARD.md` carries no tally; `LOG.md` line 7 is
``Non-vacuity: `scripts/check-fixture.mjs` `--selftest` 12/12 across the fixture matrix.`` (claims **12**), so the
finding under attack is `LOG.md:7 claimed=12 observed=13`.

| # | case | rev | exit | `counted[]` | superseded | expected | verdict |
|---|---|---|---|---|---|---|---|
| 1 | do-nothing control | `c1624f6` | 1 | `[LOG.md:7 12→13]` | 0 | stand | **PASS** (fixture bites) |
| 2 | green control, cites true line `:7` | `5c8f530` | 0 | `[]` | 1 | clear | **PASS** |
| 3 | **(a)** cites different line `:999` | `596be41` | **0** | **`[]`** | 1 | stand | **FAIL** |
| 3b | (a′) cites `:6` — a **blank** line | `f8a0d49` | 0 | `[]` | 1 | stand | **FAIL** |
| 4 | (b) names different script | `be35a60` | 1 | `[LOG.md:7]` | 0 | stand | **PASS** (CNE=1: other gate absent) |
| 5 | (b′) names different script, present, same tally | `c61934b` | 1 | `[LOG.md:7]` | 0 | stand | **PASS** (CNE=0) |
| 6 | (c) correction in `SCORECARD.md`, stale in `LOG.md` | `1bf63c4` | 1 | `[LOG.md:7]` | 0 | stand | **PASS** (per-doc) |
| 7 | (d) no marker word | `08b45b0` | 1 | `[LOG.md:7]` | 0 | stand | **PASS** |
| 8 | (e) right number, paragraph never names script | `23b29b0` | 1 | `[LOG.md:7]` | 0 | stand | **PASS** |
| 9 | (i) two stale lines, correction cites only `:7` | `9533ae5` | **0** | **`[]`** | **2** | only `:7` clears | **FAIL** |
| 10 | (j) citation is a clock time `12:30` | `cd54ac1` | **0** | **`[]`** | 1 | stand | **FAIL** |
| 11 | (k) citation is a URL port `example.com:443` | `8c00db4` | **0** | **`[]`** | 1 | stand | **FAIL** |
| 12 | (l) literal negation "This is not superseded" | `8626411` | **0** | **`[]`** | 1 | stand | **FAIL** |
| 13 | (m) "incorrect" substring as marker | `c185e19` | **0** | **`[]`** | 1 | stand | **FAIL** |
| 14 | (g) `:6` + only `13/20 files` supplies the number | `f8b1f99` | 0 | `[]` | 1 | stand | **FAIL** |
| 15 | (g′) true `:7`, only `13/20 files` supplies the number | `9683d4c` | **0** | **`[]`** | 1 | stand | **FAIL** — isolates F2 from F1 |
| 16 | (n) citation `:7-9` (contains the true line) | `a7ac663` | 0 | `[]` | 1 | either way | recorded, not scored |
| 17 | (o) correction paragraph placed **before** the stale line | `2285938` | 1 | `[LOG.md:9 12→13]` | 0 | stand | **PASS** (ordering enforced) |

Selected raw outputs (full JSON retained under `out/`):

- `case (a)`: `{"doc":"LOG.md","line":7,"script":"scripts/check-fixture.mjs","claimed":12,"observed":13,"superseded":true}` — a citation to `:999` cleared a finding at line 7.
- `case (i)`: `superseded:2, counted:[]` — the second stale line (`:9`, "4-case") was cleared by a paragraph that cites only `:7`.
- `case (g′)`: `superseded:1, counted:[]` — `13/20 files` satisfied the oracle number; no self-test tally appears in the paragraph.

So of the five required cases: (a) fails, (b)/(c)/(d)/(e) hold. The harness itself is sound — controls 1, 2, 4, 5, 6, 7, 8, 17 all behave.

---

## 4. Real-content proof — variants of the shipped LOG

To show the looseness is not fixture-only, a full clone of the lane at `5ed6484` was made
(`git clone -q --no-hardlinks "$LANE" "$SCRATCH/clone0"`, toplevel asserted, tree clean) and three variants were committed
on copies (`cp -a clone0 clone{A,B,C}`; every git call `-C clone<X>`). Gated with
`node scripts/check-selfassessment.mjs --repo "$SCRATCH/clone<X>" --rev <rev> --json` (absolute path — see F6).

| variant | rev | exit | `mismatches` | `counted[]` | superseded |
|---|---|---|---|---|---|
| base (unmodified HEAD) | `5ed6484` | 0 | 0 | `[]` | 10 |
| **A** — re-point the two check-sources bullets `:1090→:7019`, `:1103→:7013` | `5b58c0e` | **0** | **0** | **`[]`** | 10 |
| **B** — delete both check-sources bullets (no `cases: 26` remains) | `946873d` | 1 | **2** | `[LOG.md:1090 66→26, LOG.md:1103 66→26]` | 8 |
| **C** — delete the `:335` bullet only | `43e1271` | **0** | **0** | **`[]`** | 10 |

Readings:

- **A** is case (a) on real bytes: the shipped correction bullets now cite lines that do not contain the tallies, and the
  gate still reports `mismatches=0`. The citation clause does no work.
- **B** proves the number arm is the only load-bearing arm: remove the `cases: 26` text and both findings reappear
  (oracle still measures 26, so the gate is capable). Marker and citation arms contribute nothing.
- **C** is case (i) on real bytes: `LOG.md:335` is still cleared after its own bullet is deleted, because the `:391`
  bullet states the same number 12 and sits in the same blank-line paragraph.

**Paragraph anatomy (F3).** `LOG.md:1904-1925` is one blank-line paragraph: 22 lines, 0 blank lines inside, bullet
starts at 1904/1908/1912/1916/1920. The shipped matcher therefore sees one "correction paragraph" citing
`[335,335,391,391,1090,1090,1103,1103,1863,1863]` and stating 12, 26 and 17. Per-finding attribution ("this bullet
cleared that finding") is not derivable from the gate's output, and B/C show it is not true either.

---

## 5. The `:221` counter defect, quantified

Attribution was measured with a **byte-identical copy** of the shipped gate (`scratch/ExecC1Attacks/probe.mjs`,
sha256 equal to the lane file at copy time; the only edit replaced the unconditional `main();` with a call guarded on
`probe.mjs` and added one export statement, so no matcher code changed). The oracle cache was pre-populated with the
tallies the shipped gate itself reported
(check-freshness 12, check-sources 26, round-evidence-audit 13, check-selfassessment 17), so no gate was re-spawned; the
recomputed `superseded` flags reproduce the shipped receipts exactly: 15/15 findings at `4ad4c77`, 17/17 at `5ed6484`,
0 disagreements (`node attribute.mjs`).

`LOG.md:221` is
`` `--self-test` → `FRESHNESS_SELFTEST verdict=clean cases=8` `` — it sits in the bullet starting at
`LOG.md:199` ("2026-10-15 — **interactive fleet round-1 reconciliation; blocked attempt"), in the LOG **preamble**:
the file's first `##` heading is at `:449`, so section association falls back to the preamble, which names exactly one
script (`git show HEAD:LOG.md | sed -n '1,448p' | grep -oE '(\.{0,2}/)?scripts/[A-Za-z0-9_./-]+\.mjs' | sort -u` →
1 line, `scripts/check-freshness.mjs`). Claimed 8, oracle 12 → a genuine, non-ambiguous stale tally.

The only paragraphs that clear it:

- `LOG.md:265-447` — **183 lines, 0 blank lines inside** — a 2026-10-15 round entry. It supplies: the script name at
  `:272` (`` `node scripts/check-freshness.mjs --witness c5e2520…` ``), the marker at `:266` ("Corrected owned work
  landed in"), the number 12 at `:275` ("12-case self-invocation and candidate run"), and the `:\d+` tokens from a
  timestamp at `:269` ("2026-10-15T05:16:28Z") and a port at `:308`
  ("http://127.0.0.1:18751/page.html"). It never mentions line 221.
- `LOG.md:1904-1925` (at the tip) — cites `[335,391,1090,1103,1863]`, not 221.

Strict-versus-shipped counts (strict = the declared rule, i.e. the paragraph's cited set contains `f.line`):

| rev | stale LOG mentions | shipped superseded / counted | strict superseded / counted |
|---|---|---|---|
| `4ad4c77` (claim baseline) | 6 | 1 / **5** | 0 / **6** (221, 335, 391, 1090, 1103, 1664) |
| `5ed6484` (tip) | 6 | 6 / **0** | 5 / **1** (`:221`) |

Consequences for C1 as frozen:

1. "before: 5 LOG-window findings" is 1 low: the declared predicate yields **6** (adds `:221`).
2. "after: mismatches=0 at the tip" holds for the five dispositions only because the merged paragraph happens to cite all
   five lines; the sixth (`:221`) is never corrected and must still stand → strict tip count **1**.
3. The claim's `control` ("a correction paragraph stating the wrong oracle number must NOT supersede") is satisfied but
   incomplete: the wrong-*number* arm is enforced, the wrong-*line* arm is not, and the self-test never exercises it (§6).

---

## 6. Counter re-runs and gate surface

Counting command as frozen: `node scripts/check-selfassessment.mjs --rev <REV> --json` (default repo = absolute LANE).
All runs by this seat, saved under `scratch/ExecC1Attacks/out/exec-<rev>.json`.

| rev | exit | mismatches | superseded | couldNotEvaluate | counted | tree at run |
|---|---|---|---|---|---|---|
| `4ad4c77` | 1 | **6** | 5 | 89 | 5×m1 LOG (`:335,:391,:1090,:1103,:1664`) + m3 | porcelain 46 |
| `f185b4e` | 1 | 5 | 6 | 92 | 4×m1 LOG (`:335,:391,:1090,:1103`) + m3 | porcelain 46 |
| `fd722a7` (C1 landing) | 1 | **1** | 10 | 92 | m3 only | porcelain 46 |
| `5ed6484` (HEAD) | 1 | 1 | 10 | 92 | m3 only | porcelain 27 at first run, 46 later |
| `5ed6484`, clean clone, absolute repo | **0** | **0** | 10 | 92 | `[]` | clean |
| `5ed6484`, clean clone, **relative** repo | 0 | 0 | **0** | **113** | `[]` | clean |

Notes: at `f185b4e` the round-26 correction bullet at `LOG.md:1853` (inside the paragraph beginning `:1845`) already
supersedes `:1664` — it cites `:1664` and states `cases: 13` — so only four LOG findings remain; that clearance is
legitimate under the strict rule too (the cited set contains 1664). `m3` accounts for the residual integer
at every wave-time run and is not rev-bound (F5).

**Self-test surface.** `node scripts/check-selfassessment.mjs --selftest --json` → `cases: 17, passed: 17, ok: true` at
HEAD; the gate blob at `4ad4c77` gives `cases: 13, passed: 13` (`scratch/ExecC1Attacks/out/selftest-old.json`). So the
declared `13 → 17` is measured. The four new ids exist at `:496` (`m1-log-stale-tally`), `:506`
(`m1-log-stale-then-corrected`), `:516` (`m1-log-wrong-number-correction`), `:526`
(`m1-log-ambiguous-section-not-counted`). **No case varies the cited line, cross-clears a second stale mention, or
supplies the number through a bare `N/M` fraction** — the three defects above are outside the failure-capable suite, which
is why they shipped green (F1/F2/F3 are untested, not contradicted, by the suite).

**Kill rule ("m1 only; m2 and m3 unchanged") — holds.** `git diff fd722a7^ fd722a7 -- scripts/check-selfassessment.mjs`
is 176 insertions / 12 deletions. `m2Findings` and `m3Findings` bodies are byte-identical between `4ad4c77` and HEAD:
sha256 `3e1f8014ef97967f3a75516744a9cf32738be9a11d194a1c521b2d2bb2b3fe66` and
`223298d242385e5d33f00ebf2f001b237b3cddde18ad7a1b60b0a92f6fbac120` for both revs. The only edited line that mentions
m2/m3 is the composition in `evaluate()` (`:398`), which adds `...logFindings` — no body change.

---

## 7. Relation to the (uncommitted) round-27 falsification block

The working-tree `LOG.md:1927-1938` block says the matcher "accepts any colon-number token", that it marks `LOG.md:221`
superseded "by a later 183-line paragraph that does not cite line 221", that "the counter's apparent zero is unsound",
and that "`m3` also reads live porcelain state rather than binding its count to `--rev`". This seat's measurements
independently confirm all four statements.

Sharper, from §5: a minimal membership fix (`cited includes f.line`) would **not** change the tip's five dispositions —
the merged paragraph cites all five lines — so the tip would still report `mismatches=0` *for those five*; the unsound
number is the **baseline 5 (should be 6)** plus the **uncorrected `:221` at the tip (count 1)**. The defect is therefore
better stated as "the before-number is low and one stale mention survives", not as "the zero is arithmetically wrong".
Two further artefacts of the same clause are not in that block: the 22-line single-paragraph anatomy of the five bullets
(F3) and the relative-`--repo` false clean (F6).

---

## 8. Risks, limits, and non-claims

- **Scope.** This seat attacked C1's supersession clause and re-ran the C1 counter. It did not verify C2/C3, the m2
  grammar, or any corpus/registry claim.
- **F6 mechanism is inference.** Observed: relative `--repo` → `superseded=0`, `couldNotEvaluate=113`, 21 of them
  "self-test printed no tally", exit 0; absolute → `superseded=10`, CNE 92. `[INFERENCE]` cause: `gateTally()` builds
  `diskPath = join(repo, script)` and spawns `node` with `cwd: repo`; with both relative, node resolves the script under
  `repo/repo/...` and fails to load, while the pre-spawn hash check resolves against `process.cwd()` and passes. Not
  traced with a debugger.
- **F3 is partly a document-structure issue.** The matcher's paragraph definition matches its own comment; the round-27
  block just happens to be written as adjacent bullets with no blank lines, so five declared corrections are one unit.
  Whether the fix belongs in the matcher or the document is a design call for the owner, not this seat.
- **Live tree.** The lane tree changed while this seat ran (46 porcelain entries, `LOG.md` +22 uncommitted). All
  `--rev`-anchored numbers are stable; all `m3` numbers are labelled with the tree state in which they were taken.
- **No writes outside scope.** Tracked files untouched; no `git`/`jj` write in the lane; no sibling messages; no
  pacman, builds, linters or formatters; no external HTTP fetches were needed for this item.
- **Tooling unchanged.** `node v24.21.0`, `git 2.56.0`, `jq` already present; nothing installed or upgraded.

---

## 9. Artefacts (all under `.ufo/waves/round-27/scratch/ExecC1Attacks/`)

| path | content |
|---|---|
| `run-cases.sh`, `run-cases2.sh`, `run-cases3.sh`, `run-cases4.sh` | the 18-case fixture drivers |
| `out/index{,2,3,4}.tsv` | case → rev → exit → fixture dir |
| `out/<case>.json` | full `--json` output per fixture case |
| `out/lane-HEAD.json`, `out/exec-<rev>.json` | counter re-runs at `4ad4c77`, `f185b4e`, `fd722a7`, HEAD |
| `out/selftest.json`, `out/selftest-old.json` | selftest 17/17 (HEAD) and 13/13 (`4ad4c77`) |
| `probe.mjs` | byte-identical gate copy (instrumentation: `main()` guard + exports only) |
| `attribute.mjs` | per-finding clearing-paragraph attribution + strict-rule simulation |
| `clone0`, `clone{A,B,C}` | lane clone at `5ed6484` and the three real-content variants |
| `out/clone0-base-abs.json`, `out/clone0-base.json` | absolute vs relative `--repo` (F6) |
| `out/variant{A,B,C}.json` | real-content variants |
| `prior-ExecC1Attacks.md` | preserved earlier report at this path (sha256 `a81203f8…`) |
