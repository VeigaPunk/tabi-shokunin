# MutC1Gate — mutation probe of the shipped C1 extension (`scripts/check-selfassessment.mjs`, LOG.md window)

Round 27 wave 1, attempt 1 (hyaku run 7). Assignment: four single-point mutants against the
round-26/27 C1 supersession oracle, copies only, kill each with a bounded behavioral detector.

- Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Lane tip during probe: `5ed6484da66e6bf73654281d2e9ba3703f0c2ef0` (command: `git -C <lane> rev-parse HEAD`). Claim baseline re-checked at `4ad4c77eed78bca1a149e65a7ec6a84b5f71c925` (resolves; command: `git -C <lane> rev-parse 4ad4c77…`).
- Environment: node v24.21.0 (`node --version`), git 2.56.0 (`git --version`). Tooling installs: **none** (nothing needed; pacman untouched).
- Scratch: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-27/scratch/MutC1Gate/` (gitignored, `.gitignore:5` `.ufo/waves/*/scratch/`). All files under it: `pristine.mjs`, `m1.mjs`–`m4.mjs`, `fixture.mjs`, `diffs.txt`, `lane-*.json`, `lane-*.err`, transient `fx-*` repos (removed by harness; `find . -maxdepth 1 -name 'fx-*' | wc -l` → `0`).
- Byte under test never modified: `sha256sum scripts/check-selfassessment.mjs` → `de5d6676b767d31ec52e2831a30dd8899dce99abe4b034e24440176f1ec7faab` before first copy and again after all runs; `pristine.mjs` identical. (`cp scripts/check-selfassessment.mjs …/pristine.mjs` was the only read of it.)
- Detectors:
  - **D1** frozen self-test: `node <copy> --selftest` (17 cases over temp fixture repos).
  - **D2** fixture harness: `node fixture.mjs` — throwaway repos via `mkdtempSync` under scratch, `git -C <root> init -q --initial-branch master`, toplevel verified `== root` before first commit, checker run as `node <copy> --repo <fx> --rev HEAD --json`, repos removed in `finally`. Fixture gate oracle: `FIXTURE_SELFTEST verdict=clean cases=13 passed=13` → observed tally 13.
  - **D3** lane runs (read-only): `node <copy> --repo <lane> --rev <REV> --json` at `4ad4c77…` and `HEAD`; raw JSON kept in scratch.
- Pristine control: D1 `cases=17 passed=17`, exit 0; D2 all pristine arms as predicted; D3 outputs below.

Verdicts: **m1 KILLED, m2 KILLED, m3 KILLED, m4 KILLED.** No surviving mutant. Two frozen-suite
coverage gaps recorded (m2, m4 survive D1 alone). Nothing landed outside scratch + this report.

---

## m1 — `logFindings` forced to `[]` (LOG window never runs) — **KILLED**

Hunk (`diff -u pristine.mjs m1.mjs`, sha256 `be125dbb…`):

```diff
--- pristine.mjs
+++ m1.mjs
@@ -396,7 +396,7 @@
   if (scorecard === null) throw new Refusal(`SCORECARD.md absent at ${rev}`);
   const cache = new Map();
   const logText = readBlob(repo, rev, "LOG.md");
-  const logFindings = logText === null ? [] : m1LogFindings(repo, rev, logText, cache);
+  const logFindings = []; // MUTANT m1: LOG.md window never runs
  const findings = [...m1Findings(repo, rev, scorecard, cache), ...logFindings, ...m2Findings(repo, rev), ...m3Findings(repo, scorecard)];
```
(hunk shown verbatim in `scratch/MutC1Gate/diffs.txt`; the `findings` line is unchanged context)

Kill evidence (the tasked baseline-JSON proof):

- D1: `node m1.mjs --selftest` → `CASE id=m1-log-stale-tally expected_exit=1 exit=0 … FAIL`,
  `CASE id=m1-log-wrong-number-correction expected_exit=1 exit=0 … FAIL`,
  `SELFASSESSMENT_SELFTEST verdict=failed cases=17 passed=15`, exit 3.
- D3 at claim baseline `4ad4c77…`:
  - pristine: `node …/pristine.mjs --repo <lane> --rev 4ad4c77… --json` → exit 1,
    `mismatches=6 superseded=5 cne=89`; counted = the 5 LOG-window findings at **LOG.md:335, :391,
    :1090, :1103, :1664** (claimed/observed 4/12, 4/12, 66/26, 66/26, 12/13) + 1 m3 (46 untracked
    paths). This independently reproduces the frozen C1 counter (mismatches=6, same 5 line numbers).
  - mutant: `node …/m1.mjs --repo <lane> --rev 4ad4c77… --json` → exit 1,
    `mismatches=1 superseded=4 cne=82`, counted = m3 only, **`LOG.md findings=0`** — the 5
    LOG-window findings are gone from the JSON. Kill proven (exit stays 1 only via m3; the JSON is
    the discriminator, as tasked).
- D3 at HEAD `5ed6484`: pristine `LOG.md findings=17 superseded=10 mismatches=1` (the 5 baseline
  lines now carry round-27 corrections; :335 and :391 show `sup=true`); mutant
  `LOG.md findings=0 mismatches=1`. Files: `lane-pristine-4ad4c77.json`, `lane-m1-4ad4c77.json`,
  `lane-pristine-HEAD.json`, `lane-m1-HEAD.json`.

## m2 — `:/LINE/` citation requirement dropped — **KILLED** (fixture; survives frozen self-test)

Hunk (`m2.mjs`, sha256 `004969a9…`, at pristine lines 323–326):

```diff
       return namesScript &&
         /supersed|correct/i.test(text) &&
-        /:\d+/.test(text) &&
-        statedTallyNumbers(text).includes(f.observed);
+        statedTallyNumbers(text).includes(f.observed); // MUTANT m2: no :LINE citation required
```

- D1: `node m2.mjs --selftest` → `cases=17 passed=17`, exit 0 — **SURVIVED by the frozen suite**
  (coverage gap: no no-citation negative case exists; the only positive correction case,
  `m1-log-stale-then-corrected`, carries "LOG.md:6").
- D2 kill (`fixture.mjs`, case `m2-no-citation-correction`; LOG.md line 6 stale `12/12`, line 8
  correction names `scripts/check-fixture.mjs`, marker "supersedes", correct number `cases: 13`,
  **no** `:LINE` citation):
  - pristine: `RESULT … checker=pristine.mjs … exit=1 mismatches=1 superseded=0 counted=[{"doc":"LOG.md","line":6,"claimed":12,"observed":13}]`
  - mutant: `RESULT … checker=m2.mjs … exit=0 mismatches=0 superseded=1 counted=[]` → the
    citation-less paragraph wrongly supersedes. **KILLED.**
- Control arm `m2-control-with-citation` (same fixture with `LOG.md:6` present): pristine
  `exit=0 superseded=1` and mutant `exit=0 superseded=1` — behavior identical where the citation
  exists; the mutant differs only on the dropped requirement.

## m3 — oracle-number check dropped — **KILLED** (frozen self-test **and** fixture)

Hunk (`m3.mjs`, sha256 `22e88fce…`, at pristine lines 323–326):

```diff
       return namesScript &&
         /supersed|correct/i.test(text) &&
-        /:\d+/.test(text) &&
-        statedTallyNumbers(text).includes(f.observed);
+        /:\d+/.test(text); // MUTANT m3: no oracle-number check
```

- D1: `node m3.mjs --selftest` → `CASE id=m1-log-wrong-number-correction expected_exit=1 exit=0 … FAIL`,
  `verdict=failed cases=17 passed=16`, exit 3. The frozen case flips exit 1→0: shipped rejects the
  wrong-number correction; the mutant accepts it. **KILLED by the frozen suite** (assignment's
  expectation confirmed by run).
- D2 kill, assignment-literal fixture `m3a-wrong-number-tally-shape` (LOG.md:6 stale `12/12`;
  correction "…`--selftest` measured `cases: 12`…" citing `LOG.md:6`):
  pristine `exit=1 mismatches=1 counted=[LOG.md:6 12≠13]`; mutant `exit=0 mismatches=0 superseded=1`. **KILLED.**
- Second shape `m3b-wrong-number-prose-shape` (wrong number as prose "re-measured 12/12", no
  claim-shaped tokens): pristine `exit=1`; mutant `exit=0`. **KILLED** both ways.
- Shipped-code observation (not a mutation; recorded for the scribe): the per-line claim grammar
  accepts `cases=12` but not `cases: 12` (`scripts/check-selfassessment.mjs:282`,
  `\bcases\s*=\s*(\d+)`), while the paragraph oracle-number grammar accepts both
  (`scripts/check-selfassessment.mjs:250`, `\bcases\s*[:=]\s*(\d+)`). Hence a `cases: N` correction
  line is itself never a claim line, which is what makes the m1-log-wrong-number-correction case a
  clean exit-code discriminator.

## m4 — supersession made cross-document — **KILLED** (fixture; survives frozen self-test)

Hunk (`m4.mjs`, sha256 `0812071…`, replacing pristine line 400):

```diff
-  const findings = [...m1Findings(repo, rev, scorecard, cache), ...logFindings, ...m2Findings(repo, rev), ...m3Findings(repo, scorecard)];
+  // MUTANT m4: supersession crosses documents — a LOG correction clears a SCORECARD finding
+  const scFindings = m1Findings(repo, rev, scorecard, cache);
+  const logParas = logText === null ? [] : paragraphs(logText);
+  for (const f of scFindings) {
+    if (f.observed === null || f.observed === f.claimed || f.superseded) continue;
+    if (logParas.some((p) => {
+      // MUTANT m4: no position guard — cross-document "later" is document-level
+      const text = p.lines.join("\n");
+      return [...text.matchAll(SCRIPT_IN_TEXT)].some((m) => m[1].replace(/^\.\//, "") === f.script) &&
+        /supersed|correct/i.test(text) &&
+        /:\d+/.test(text) &&
+        statedTallyNumbers(text).includes(f.observed);
+    })) f.superseded = true;
+  }
+  const findings = [...scFindings, ...logFindings, ...m2Findings(repo, rev), ...m3Findings(repo, scorecard)];
```

- D1: `node m4.mjs --selftest` → `cases=17 passed=17`, exit 0 — **SURVIVED by the frozen suite**
  (coverage gap: no cross-document negative case; every scorecard/log case builds only its own doc).
- D2 kill (`fixture.mjs`, case `m4-crossdoc-correction`; SCORECARD.md:5 well-formed stale
  `` `--selftest` (12/12) `` vs oracle 13; LOG.md paragraph "Correction (supersedes SCORECARD.md:5):
  … `cases: 13`"):
  - pristine: `RESULT … exit=1 mismatches=1 superseded=0 counted=[{"doc":"SCORECARD.md","line":5,"claimed":12,"observed":13}]` — shipped stays per-document.
  - mutant: `RESULT … exit=0 mismatches=0 superseded=1 counted=[]` — the LOG paragraph cleared the
    SCORECARD finding. **KILLED.**
- Honest fixture note: first attempt used `` (12/13) `` — a malformed fraction (N≠M) is
  could-not-evaluate by design, so both checkers returned `cne=1 observed=null` and nothing counted;
  that run is not a kill and was discarded. Rebuilt with the well-formed `(12/12)` above.

---

## Restoration evidence

- `sha256sum scripts/check-selfassessment.mjs` after all runs →
  `de5d6676b767d31ec52e2831a30dd8899dce99abe4b034e24440176f1ec7faab` — identical to the pre-probe
  hash and to `pristine.mjs`. The byte under test was never modified, so no restoration was needed.
- Writes performed by me: only `scratch/MutC1Gate/*` and this report
  (`.ufo/waves/round-27/w1/MutC1Gate.md`). No tracked file edited; no git/jj write commands run.
- Concurrent-tree observations, not mine, untouched: `git -C <lane> status --porcelain -- scripts/`
  shows ` M scripts/check-s106-evidence.mjs` and `?? scripts/report-contract.mjs` at probe end
  (absent at probe start); m3's untracked-path count moved 44 → 46 mid-probe. Shared tree, other
  seats active. Recorded as observation only.
- Environment caveat on D3-at-HEAD: pristine@HEAD `mismatches=1` is the m3 finding over 46 untracked
  paths in the shared working tree (my scratch is gitignored, so it contributes none). The C1
  claim's `mismatches=0` at tip presumes the L1's clean tree; my run is consistent with that reading.

## Every number's command

- Tip: `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse HEAD` → `5ed6484da66e6bf73654281d2e9ba3703f0c2ef0`.
- Self-tests: `node pristine.mjs|--selftest` (17/17, exit 0); `node m1.mjs --selftest` (15/17, exit 3); `node m2.mjs --selftest` (17/17, exit 0); `node m3.mjs --selftest` (16/17, exit 3); `node m4.mjs --selftest` (17/17, exit 0).
- Lane runs: `node <copy> --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --rev 4ad4c77eed78bca1a149e65a7ec6a84b5f71c925|HEAD --json` (pristine: mismatches 6 / 1; m1: 1 / 1; JSON summaries extracted with `node -e` over the saved files).
- Fixtures: `node fixture.mjs` (RESULT lines quoted above; each fixture repo rev printed, e.g. `rev=87c8402` for the m4 pair).
- Hashes: `sha256sum` outputs quoted above for pristine/m1/m2/m3/m4 and the lane file.
