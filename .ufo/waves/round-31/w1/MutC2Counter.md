# MutC2Counter — C2 first falsifier: mutation test of `scripts/check-selfassessment.mjs` v2 (round 31, wave w1)

## Verdict

The frozen v2 counter's seven tasked mutation points were probed with one bounded detector — its own `--selftest` (30 cases) — run per mutant on a seat scratch clone of the lane at the freeze commit `9505a10eb80b2a0b273ebaba3f7f872ad302192d`, whose `scripts/check-selfassessment.mjs` is byte-identical to `claims.json → frozenDigests` (sha256 `143d66ff2ba3fc2c113d461f1f2dd0555c94fb00b292e24eb4799e22dadb2fce`). Five of the seven tasked mutants are **killed**: m1 (summary-line regex dropped) by exactly the tasked killer `v2-oracle-reads-summary-line-not-first-cases-token`; m3 (lineOnly ignored) by `v2-readme-no-section-fallback`; m4 (README.md accepted for corpus/README.md) by `v2-readme-root-citation-not-corpus`; m6 (SKILL/README windows not evaluated) by four v2 cases; m7b (doc forced to LOG.md window-wide) by the two stale-then-corrected cases. Every restoration was byte-identical to the pristine bytes (hashes below); the lane checkout was never written. Three probes **survive** the 30-case suite — m2 (first instead of last summary), m5 (citesLine lookbehind removed), m7a (finding `doc` field fixed to `LOG.md`, literal reading) — and minimal out-of-suite fixtures demonstrate pristine and mutant **disagree** on each, so all three are genuine coverage gaps of the self-test, not equivalent mutants. This is a coverage finding about the detector, not a defect in the frozen v2 contract: no lane file was changed and no repair was made.

## Method

- Lane root (read-only): `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Seat scratch: `/fast/scratch/hyaku/tabi-r31/MutC2Counter` (=`$S`; cleaned after receipts were copied).
- One live clone: `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"` then `git -C "$S/clone" checkout -q 9505a10e…` → HEAD `9505a10eb80b2a0b273ebaba3f7f872ad302192d`, toplevel = the clone (verified). Node `v24.21.0` (already installed; **no tools installed or upgraded** — nothing needed).
- Detector (identical for pristine/mutant/restored): `TMPDIR="$S/tmp" node "$S/clone/scripts/check-selfassessment.mjs" --selftest`; pass = exit 0 **and** `SELFASSESSMENT_SELFTEST verdict=clean cases=30 passed=30`.
- Per mutant: copy mutant bytes into `$S/clone/scripts/check-selfassessment.mjs` → run detector → restore pristine bytes → `cmp` against pristine. Mutants were built once from the pristine bytes into `$S/mut/`; the runner is `run-mutant.sh` (receipt).

## Baseline (pristine)

```
$ sha256sum "$S/pristine/check-selfassessment.mjs"
143d66ff2ba3fc2c113d461f1f2dd0555c94fb00b292e24eb4799e22dadb2fce   (= claims.json frozenDigests)
$ TMPDIR="$S/tmp" node "$S/clone/scripts/check-selfassessment.mjs" --selftest   # out/pristine-selftest.txt
SELFASSESSMENT_SELFTEST verdict=clean cases=30 passed=30
exit=0        # 0 FAIL lines; wall ~1.2 s
```

## Results table

| # | Mutant (receipt label) | Behavior point (pristine line) | Mutation | Selftest | Verdict | Killing case(s) |
|---|---|---|---|---|---|---|
| m1 | `m1-summary-line-dropped` | L175–176 (`gateTally`) | summary-line regex removed; first-`cases=`/`N/N` fallback only | 29/30, exit 3 | **KILLED** | `v2-oracle-reads-summary-line-not-first-cases-token` (expected_exit=0 exit=1) — exactly the tasked killer |
| m2 | `m2-first-summary` | L176 | `summaries[summaries.length - 1]` → `summaries[0]` | 30/30, exit 0 | **SURVIVED** | — (demo A below: two-summary-line gate → pristine exit 0 / mutant exit 1) |
| m3 | `m3-lineonly-ignored` | L322 (`m1LogFindings`) | `!lineOnly &&` dropped → section fallback leaks into SKILL/README windows | 29/30, exit 3 | **KILLED** | `v2-readme-no-section-fallback` (expected_exit=0 exit=1) |
| m4 | `m4-citesline-readme-accepted` | L278 (`citesLine`) | `README.md` accepted as a citation for `corpus/README.md` | 29/30, exit 3 | **KILLED** | `v2-readme-root-citation-not-corpus` (expected_exit=1 exit=0) |
| m5 | `m5-citesline-lookbehind-removed` | L276 (`citesLine`) | `(?<![A-Za-z0-9_\/])` dropped | 30/30, exit 0 | **SURVIVED** | — (demo B below: `docs/LOG.md:6` citation → pristine exit 1 / mutant exit 0) |
| m6 | `m6-windows-dropped` | L423, L425 (`evaluate`) | SKILL.md and corpus/README.md windows replaced by `[]` | 26/30, exit 3 | **KILLED** | `v2-skill-stale-tally`; `v2-skill-crossdoc-citation-not-superseded`; `v2-readme-stale-tally`; `v2-readme-root-citation-not-corpus` (all expected_exit=1 exit=0) |
| m7a | `m7a-doc-field-log` (literal reading: finding `doc` field) | L314/324/330/333 | every `doc,` push in `m1LogFindings` → `doc: "LOG.md"` | 30/30, exit 0 | **SURVIVED** | — (demo C below: JSON `doc` label flips `SKILL.md`→`LOG.md`, verdict identical) |
| m7b | `m7b-doc-param-log` (window-wide reading) | L295–297 | `doc = "LOG.md";` forced at function top (supersession citation matching included) | 28/30, exit 3 | **KILLED** | `v2-skill-stale-then-corrected`, `v2-readme-stale-then-corrected` (both expected_exit=0 exit=1) |

The tasked mutant list names "doc field fixed to LOG.md" without disambiguating the two readings; both were probed (m7a literal field, m7b parameter forced). m7a survives because `runSelftest` asserts only exit code and finding **classes**, never the finding's `doc` field; m7b is killed because forcing the window-wide document breaks same-document citation matching in supersession.

## Killing-case evidence (verbatim FAIL lines)

```
m1: CASE id=v2-oracle-reads-summary-line-not-first-cases-token expected_exit=0 exit=1 expected=- actual=m1-selftest-tally FAIL
m3: CASE id=v2-readme-no-section-fallback expected_exit=0 exit=1 expected=- actual=m1-selftest-tally FAIL
m4: CASE id=v2-readme-root-citation-not-corpus expected_exit=1 exit=0 expected=m1-selftest-tally actual=- FAIL
m6: CASE id=v2-skill-stale-tally expected_exit=1 exit=0 expected=m1-selftest-tally actual=- FAIL
    CASE id=v2-skill-crossdoc-citation-not-superseded expected_exit=1 exit=0 expected=m1-selftest-tally actual=- FAIL
    CASE id=v2-readme-stale-tally expected_exit=1 exit=0 expected=m1-selftest-tally actual=- FAIL
    CASE id=v2-readme-root-citation-not-corpus expected_exit=1 exit=0 expected=m1-selftest-tally actual=- FAIL
m7b: CASE id=v2-skill-stale-then-corrected expected_exit=0 exit=1 expected=- actual=m1-selftest-tally FAIL
     CASE id=v2-readme-stale-then-corrected expected_exit=0 exit=1 expected=- actual=m1-selftest-tally FAIL
```

m1 independently corroborates the L1's `baseline/m8-proof/` (v2 counter with the summary-line oracle removed → its regression case fails): same regression case fails here; the passed-count difference (29/30 here vs 28/30 there) reflects a different mutant variant, not a disagreement.

## Survivors = coverage findings (out-of-suite demonstrations, `demo-survivors.sh`)

Fixtures live only under seat scratch; pristine and mutant were run in production mode (`--repo <fixture> --rev HEAD`) on identical fixture repos.

**Demo A — m2 (first vs last summary).** A gate printing two `<NAME>_SELFTEST` summary lines (`cases=9` then `cases=13`) with a SCORECARD claim of `(13/13)`:

```
m2 pristine exit=0   FINDING claimed=13 observed=13 … mismatches=0
m2 mutant  exit=1    FINDING claimed=13 observed=9  … mismatches=1
```

No CASE in the suite gives a gate more than one summary line (the noisy fixture's extra line is a per-case `CASE …` line, which the summary regex correctly ignores), so first-vs-last is untested. A killing case would be exactly this fixture: two summary lines with different tallies.

**Demo B — m5 (lookbehind removed).** A LOG.md stale tally at line 6 with a later correction paragraph citing a slash-qualified path `docs/LOG.md:6` (right document, wrong path form), naming the script, carrying "Correction", stating `cases: 13`:

```
m5 pristine exit=1   … mismatches=1 superseded=0   (qualified citation rejected → stale stands)
m5 mutant  exit=0    … mismatches=0 superseded=1   (citation accepted → stale wrongly cleared)
```

The lookbehind is load-bearing against word/`/`-prefixed tokens (`docs/LOG.md:N`, `notSKILL.md:N`); no suite citation is ever prefixed by anything but a space or backtick, so the mutant is indistinguishable in-suite. A killing case would cite `docs/LOG.md:6` in a correction paragraph.

**Demo C — m7a (doc field mislabeled).** SKILL.md stale registry tally, `--json`:

```
m7a pristine exit=1, m7a mutant exit=1   (identical verdict)
demo-m7a-json.diff:  "doc": "SKILL.md"  →  "doc": "LOG.md"   (×2: findings + counted)
```

`runSelftest`'s `ok` check compares `exit` and class sets only; a mutant that mislabels every SKILL.md/corpus/README.md finding as `LOG.md` passes 30/30. A killing change would assert the counted findings' `doc` field (or add a case asserting it).

## Per-mutant diffs (also receipts as `<label>.diff`)

```diff
--- m1-summary-line-dropped (L175-176)
-          const summaries = [...out.matchAll(/^[A-Z][A-Z0-9_]*_SELFTEST\b[^\n]*?\bcases\s*[=:]\s*(\d+)/gm)];
-          const m = summaries.length ? summaries[summaries.length - 1] : (/"?\bcases"?\s*[=:]\s*(\d+)/.exec(out) || /\b(\d+)\s*\/\s*(\d+)\b/.exec(out));
+          const m = (/"?\bcases"?\s*[=:]\s*(\d+)/.exec(out) || /\b(\d+)\s*\/\s*(\d+)\b/.exec(out));

--- m2-first-summary (L176)
-          const m = summaries.length ? summaries[summaries.length - 1] : (…
+          const m = summaries.length ? summaries[0] : (…

--- m3-lineonly-ignored (L322)
-      const targets = lineScripts.size ? [...lineScripts] : !lineOnly && scripts.size === 1 ? [...scripts] : [];
+      const targets = lineScripts.size ? [...lineScripts] : scripts.size === 1 ? [...scripts] : [];

--- m4-citesline-readme-accepted (L278)
-      if (`${match[1]}.md` !== doc) return false;
+      if (`${match[1]}.md` !== doc && !(doc === "corpus/README.md" && `${match[1]}.md` === "README.md")) return false;

--- m5-citesline-lookbehind-removed (L276)
-  return [...text.matchAll(/(?<![A-Za-z0-9_\/])((?:corpus\/)?(?:LOG|SCORECARD|SKILL|README))\.md:(\d+)(?:-(\d+))?\b/g)]
+  return [...text.matchAll(/((?:corpus\/)?(?:LOG|SCORECARD|SKILL|README))\.md:(\d+)(?:-(\d+))?\b/g)]

--- m6-windows-dropped (L423, L425)
-  const skillFindings = skillText === null ? [] : m1LogFindings(repo, rev, skillText, cache, "SKILL.md", true);
+  const skillFindings = [];
-  const readmeFindings = readmeText === null ? [] : m1LogFindings(repo, rev, readmeText, cache, "corpus/README.md", true);
+  const readmeFindings = [];

--- m7a-doc-field-log (L314/324/330/333, replace_all)
-        findings.push({ class: "m1-selftest-tally", doc, line: no, … });
+        findings.push({ class: "m1-selftest-tally", doc: "LOG.md", line: no, … });   (4 pushes)

--- m7b-doc-param-log (L295-297)
 function m1LogFindings(repo, rev, logText, cache, doc = "LOG.md", lineOnly = false) {
+  doc = "LOG.md";
   const findings = [];
```

## Restoration evidence

Every mutant run ended with the pristine bytes back in place, verified by hash and `cmp`:

```
hash_pristine / hash_restored (all 8 runs): 143d66ff2ba3fc2c113d461f1f2dd0555c94fb00b292e24eb4799e22dadb2fce
restored byte-identical   (all 8 runs; runner output lines quoted above)
mutant hashes: m1 a58d84b7ee188b06…  m2 92fa0f19c2224d4f…  m3 8cb66514a2b42da2…  m4 77bfafaa63951a24…
               m5 8e9015c7832c87ba…  m6 171ae0de2d39ab8d…  m7a 1e3a707de0d61bf5…  m7b 88e416b099383eb0…
```

## Commands and exit codes (as run)

```
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone" && git -C "$S/clone" checkout -q 9505a10e…   # exit 0; HEAD/toplevel verified
TMPDIR="$S/tmp" node "$S/clone/scripts/check-selfassessment.mjs" --selftest > out/pristine-selftest.txt 2>…err ; echo exit=$?   # exit=0
sh "$S/run-mutant.sh" <label> "$S/mut/<label>.mjs"   # ×8, serial (shared clone file)
  → selftest_exit: m1=3  m2=0  m3=3  m4=3  m5=0  m6=3  m7a=0  m7b=3 ; restored byte-identical ×8
sh "$S/demo-survivors.sh"   # demo_exit=0; per-demo exits quoted above
```

No network fetches were needed (no new sources opened; no `api.github.com`, no credentials, no cookies). No tool installs/upgrades (node v24.21.0 present; pacman untouched). No lane tracked file, lane git index, or lane jj state was modified; all mutations lived in seat scratch and were restored byte-identically.

## Coverage findings for the L1 (findings only — no contract change made, none required by this probe)

1. m2: the suite never exercises a gate whose output carries **two** `<NAME>_SELFTEST` summary lines with different tallies — first-vs-last selection is untested.
2. m5: the suite never exercises a citation token prefixed by a word character or `/` (`docs/LOG.md:6`, `notSKILL.md:5`) — the lookbehind is untested.
3. m7a: `runSelftest` asserts exit code and finding classes but never the finding's `doc` field — document mislabeling is invisible to the suite.

## Receipts (this directory)

`pristine-selftest.txt`/`.err` (baseline), `m1…m7b` `.txt` (full per-case selftest output) + `.diff` (unified diffs), `demo-run.log`, `demo-m2-{pristine,mutant}.txt`, `demo-m5-{pristine,mutant}.txt`, `demo-m7a-{pristine,mutant}.json`, `demo-m7a-json.diff`, `run-mutant.sh`, `demo-survivors.sh`, `mutants/*.mjs` (the eight mutant bytes), `MANIFEST.sha256` (sha256 of every receipt). Seat scratch `/fast/scratch/hyaku/tabi-r31/MutC2Counter` was removed after the receipts were copied.
