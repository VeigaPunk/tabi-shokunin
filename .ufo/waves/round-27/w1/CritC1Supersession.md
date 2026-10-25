# CritC1Supersession — C1 supersession semantics: the wrong-clear reproduces on fixtures and is live at LOG.md:221

Seat: critic (read-only). Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Measured revisions: tip `5ed6484da66e6bf73654281d2e9ba3703f0c2ef0`; counter before-revision
`4ad4c77eed78bca1a149e65a7ec6a84b5f71c925`; round-26 tip (lane baseline)
`f185b4e7ab10cd9e8925e8ec614c9c111772357d`.
Script under test: `scripts/check-selfassessment.mjs`, sha256
`de5d6676b767d31ec52e2831a30dd8899dce99abe4b034e24440176f1ec7faab` at both the tip blob and the
worktree (`git show 5ed6484:scripts/check-selfassessment.mjs | sha256sum`; `sha256sum
scripts/check-selfassessment.mjs`).
`LOG.md` at tip: rev blob sha256
`433921d99dd0aabec7ec98f0ce44f5a4db74d33eebab5af2aebf0c7ba4a65ebe` (1,925 lines; extracted to
`.ufo/waves/round-27/scratch/CritC1Supersession/LOG-at-5ed6484.md` for exact line work).
The live worktree LOG differs (`cf4ae88b…`): 22 lines are appended after the tip, including a
"C1 counter falsification" section that is **not in the measured revision**. All supersession
claims below are computed from the rev blob, never the worktree.
Tooling: no installs, no upgrades. `node v24.21.0`, `git 2.56.0`. No external fetches.

Verdicts:

- **(a) Wrong-clear confirmed, fixture and live.** The shipped predicate accepts *any* `:N` in the
  whole blank-line paragraph as "cites the superseded line". A correction citing `:999`
  (nonexistent) clears a stale tally at `:6`; a correction citing `:8` also clears `:6`; and on
  shipped bytes it clears the `:221` stale tally using a round-1 paragraph whose only
  colon-numbers are a timestamp (`:16`, `:28`) and a loopback port (`:18751`).
- **(b) Claim violation.** The frozen claim says "correction line"; the shipped unit is the
  paragraph (up to 183 lines). That unit is load-bearing (under a line unit **none** of the six
  eligible findings clears), and the round-27 claim record also drops the frozen control arm
  "lacks the line citation". This is a predicate change, not a reading.
- **(c) The four required findings are textually cited with equality, but non-discriminating.**
  All four are cleared by the *same* mega-paragraph `LOG.md:1904-1925`, which cites `:335`,
  `:391`, `:1090`, `:1103` and `:1863` together. Equality holds for each, but a finding would clear
  if *any* bullet in that paragraph cited it. `:1664` is cleared by paragraph `1845-1864`, which
  cites `:1664`. `:221` is cleared by two paragraphs, neither of which cites `:221`.

---

## 1. The shipped predicate

`scripts/check-selfassessment.mjs:316-327`:

```js
316:   const paras = paragraphs(logText);
319:     f.superseded = paras.some((p) => {
320:       if (p.start <= f.line) return false;
321:       const text = p.lines.join("\n");
322:       const namesScript = [...text.matchAll(SCRIPT_IN_TEXT)].some((m) => m[1].replace(/^\.\//, "") === f.script);
323:       return namesScript &&
324:         /supersed|correct/i.test(text) &&
325:         /:\d+/.test(text) &&
326:         statedTallyNumbers(text).includes(f.observed);
```

Three widenings relative to the frozen wording:

1. line 325 tests only that *some* colon-number exists; it never compares it to `f.line` (no
   citation equality, no citation adjacency). `<REV>:<path>` is not excluded either.
2. `paragraphs()` (`:256-265`) splits on blank lines only, so an entire bullet list is one unit.
   The round-27 correction block `LOG.md:1904-1925` has **0 blank lines**
   (`awk 'NR>=1904&&NR<=1925&&$0==""{c++}END{print c+0}' <rev LOG>` → `0`).
3. line 324's marker is a substring match with no negation test: `incorrect`, `does not
   supersede` both pass.

The header documents the unit change itself: "*with the correction unit being the paragraph
(Markdown wraps one correction over several lines)*" (`scripts/check-selfassessment.mjs:43-45`,
14 words quoted). Documenting a widened predicate does not restore the frozen one.

`statedTallyNumbers()` (`:246-254`) also accepts a bare fraction — `/…(\d+)\s*\/\s*(\d+)…/` at
line 252 — so the "oracle-correct number" can arrive from an unrelated `13/20`.

## 2. (a) Fixture counterexamples

All fixtures: `git -C "$D" init -q`; `rev-parse --show-toplevel` verified equal to `$D`; every
later git call used `-C "$D"`; gate `scripts/check-fixture.mjs` prints
`FIXTURE_SELFTEST verdict=clean cases=13 passed=13`. Run command:

```
node /…/tabi-shokunin/scripts/check-selfassessment.mjs --repo "$D" --rev HEAD --json
```

| fixture | correction paragraph (later, same script) | exit | m1 LOG result |
|---|---|---|---|
| `fixture-a` (`9d7960fe…`) | `Correction (supersedes LOG.md:999): … --selftest … cases: 13` | **0** | `LOG:6 claimed=12 observed=13 superseded=true`; `mismatches=0`, `clean=true` |
| `fixture-b` (`cfd54c7a…`) | two stales (`:6`, `:8`); correction cites only `:8` | **0** | both `superseded=true`; `mismatches=0`, `clean=true` |
| `fixture-d` (`1b1b0395…`) | cites `:6`, but number only in `13/20 spot-checks` | **0** | `LOG:6 … superseded=true`; `mismatches=0`, `clean=true` |
| `fixture-c` (`75f49e5b…`) | cites `:6`, real `cases: 13` (intended positive) | **0** | `superseded=true`, `clean=true` |
| `fixture-e` (`587f50cc…`) | correction with **no** `:N` at all | 1 | `LOG:6 … superseded=false` (negative control holds) |
| `fixture-f` (`00786581…`) | "does not supersede anything: … cases: 13 … LOG.md:6" | **0** | `LOG:6 … superseded=true` (negation ignored) |

(a) is answered by `fixture-a` and `fixture-b`: the finding at `:6` is marked superseded even
though no paragraph in the file names `:6`. Verdict `clean=true`, exit 0 — a wrong-clear makes
the gate declare calibration clean. `fixture-e` shows the gate can distinguish the absence of a
citation; the hole is specifically that *a wrong citation is accepted*. `fixture-d` shows the
number test can be satisfied by a non-tally fraction.

Receipts (sha256): `fixture-a-clean.json bf3ef141…`, `fixture-b-clean.json a7bd2098…`,
`fixture-d-clean.json ad1cda3a…`, `fixture-e-clean.json 17f55692…`,
`fixture-f-clean.json 002242e1…`, all under
`.ufo/waves/round-27/scratch/CritC1Supersession/`.

## 3. (a-live) The wrong-clear is on shipped bytes: LOG.md:221

`LOG.md:221` (rev blob) reads: "*`--self-test` → `FRESHNESS_SELFTEST verdict=clean cases=8`*"
(9 tokens). The measured oracle is 12 (`node scripts/check-selfassessment.mjs --rev 5ed6484… --json`
reports `LOG.md:221 claimed=8 observed=12`), so it is a genuine stale tally. No correction
anywhere cites `:221`: `grep -n ':221\b' LOG-at-5ed6484.md` → no match.

The shipped rule marks it `superseded=true` via two paragraphs:

- `LOG.md:265-447` (a 183-line round-1 bullet list). It satisfies the predicate with
  `Corrected owned work landed in` (`:266`), `2026-10-15T05:16:28Z` (`:269` → `:16`, `:28`),
  `12-case self-invocation` (`:275` → `12`), and `http://127.0.0.1:18751/page.html` (`:308` →
  `:18751`). None of those tokens refers to `:221`.
- `LOG.md:1904-1925` (the round-27 correction block), because it contains `cases: 12` and names
  `scripts/check-freshness.mjs`; it cites `:335/:391/:1090/:1103/:1863`, never `:221`.

Command and result (rev `5ed6484…`, counter against the rev blob):

```
node scripts/check-selfassessment.mjs --rev 5ed6484… --json   → exit 1
m1 LOG :221 … claimed=8 observed=12 superseded=true
m1 LOG :335/:391/:1090/:1103 … superseded=true
m1 LOG :1664 … superseded=true
counted under shipped rule: 0 LOG findings   (mismatches=1 is m3, see §6)
```

A faithful replica of the shipped clause over the rev blob
(`.ufo/waves/round-27/scratch/CritC1Supersession/` analysis run) reproduces exactly the same
flags and lists the clearing paragraphs: for `:221`, `(265,447) cites=[16,28,18751]` and
`(1904,1925) cites=[335,335,391,391,1090,1090,1103,1103,1863,1863]` — `221 ∉` either citation
set.

## 4. (b) Line vs paragraph: the frozen wording is violated

Frozen wording, round-27 `claims.json` C1 `declared`: "*a correction line later in LOG.md …
cites the superseded line*". Round-27's header also asserts "predicate, counter, kill rule and
target unchanged" (`resumeNote`).

The round-26 record's skip-work control read: "*a correction line that states the wrong oracle
number or lacks the line citation must NOT supersede*" (17 words). Round-27's control drops the
citation arm: "*a correction paragraph stating the wrong oracle number must NOT supersede*"
(12 words) and switches `line` → `paragraph`. The sole `revisions` entry in round-27's claims
concerns C3's census arm; there is no revision recording the unit change
(`node -e 'console.log(require("./.ufo/waves/round-27/claims.json").revisions)'`).

The deviation is load-bearing, not cosmetic. Re-running the frozen line-unit reading over the
rev blob (`any single later line satisfying name+marker+`:N`+oracle`) clears **0 of 6** eligible
m1 LOG findings, including the four the claim requires. The reason is visible in the block: the
script name, the marker, the citation and the oracle number live on different wrapped lines of
the same bullet, e.g. `:1904` carries the marker+`:335`, `:1907` carries
`scripts/check-freshness.mjs` + `cases: 12`. So `mismatches=0` is unreachable under the frozen
predicate; the implementation changed the unit to reach it.

Answer: **the paragraph-unit deviation is a claim violation, not an acceptable reading.** Under
the strict paragraph unit *plus* citation equality the tip is **1** counted LOG finding (`:221`);
under the frozen line unit it is **6**; only the shipped unit+any-`:N` yields 0.

## 5. (c) Real LOG at tip: citations for the four

Replica over `LOG-at-5ed6484.md` (same regexes, same oracle values as the counter JSON):

| finding | claimed→observed | clearing paragraph | paragraph citations | `f.line` in citations |
|---|---|---|---|---|
| `LOG:335` | 4→12 | 1904-1925 | 335,391,1090,1103,1863 (×2) | yes |
| `LOG:391` | 4→12 | 1904-1925 | same | yes |
| `LOG:1090` | 66→26 | 1904-1925 | same | yes |
| `LOG:1103` | 66→26 | 1904-1925 | same | yes |
| `LOG:1664` (context) | 12→13 | 1845-1864 | 1664 | yes |
| `LOG:221` | 8→12 | 265-447 and 1904-1925 | 16,28,18751 / 335,391,…,1863 | **no** |

So: the four findings *are* cleared by corrections whose citation list contains their own line —
`1904` explicitly says "*Correction (supersedes LOG.md:335)*", `1908` `:391`, `1912` `:1090`,
`1916` `:1103`. But equality is not tested by the code, and because all five bullets form one
paragraph, the same test would also clear any one of them from a *different* bullet in the block.
That is precisely what happens to `:221`: the block's `cases: 12` (freshness oracle) plus any of
its `:N` tokens clears a line it never cites. The equality observed for the four is therefore
incidental to the mechanism, not evidence that the mechanism checks equality.

Also note: the block states both freshness's 12 and sources' 26, so the shared paragraph can
clear findings for two different scripts at once, with no per-bullet binding.

## 6. Literal `after`-target at the measured tip

`node scripts/check-selfassessment.mjs --rev 5ed6484da66e6bf73654281d2e9ba3703f0c2ef0 --json`
→ `exit=1`, `mismatches=1`, `couldNotEvaluate=92`, `superseded=10`. The one counted finding is
`m3-unlanded-paths` with `observed=27` (live porcelain at that run; a later count during this
seat was 44 paths: `git status --porcelain --untracked-files=all | wc -l`). C1's `after` says
"mismatches=0 at the tip"; the literal command exits 1 from a wave-time tree. `m3` reads the live
worktree, not `--rev`, so this is the revision-binding defect already recorded in the worktree
(not the measured rev). Observation, not inference: the counter's own output is exit 1.

Selftest counts measured, not inherited:
`node … --selftest --json` at tip → `cases=17, passed=17, ok=true`; the baseline script blob
(`git show 4ad4c77…:scripts/check-selfassessment.mjs` run from scratch) → `cases=13,
passed=13, ok=true`. The 13→17 claim holds. No selftest case covers a **wrong** line citation,
an unrelated fraction, or a negated marker; the four LOG cases are stale / corrected /
wrong-number / ambiguous (`CASES`, `scripts/check-selfassessment.mjs:451-540`). The frozen
control's "lacks the line citation" clause therefore has no red test for the shape that actually
fails.

## 7. Secondary: `:1664` provenance contradicts the LOG prose

`LOG.md:1897-1900` (rev blob) says the baseline "found five unsuperseded stale-tally mentions"
and that "round-23's `:1664` was already superseded by the round-26 correction at its `:1853`
paragraph — counted as superseded, not cleared". Measured:

```
node scripts/check-selfassessment.mjs --rev 4ad4c77… --json   → LOG:1664 superseded=false (counted, → 5 counted LOG; mismatches=6 incl. m3)
node scripts/check-selfassessment.mjs --rev f185b4e… --json   → LOG:1664 superseded=true  (→ 4 counted LOG; mismatches=5 incl. m3)
git merge-base --is-ancestor 0c666ad 4ad4c77                  → exit 1  (the correction commit is not in 4ad4c77)
git show 4ad4c77:LOG.md | grep -c 'Correction (supersedes LOG.md:1664)'  → 0
```

`4ad4c77` is "round-25 admission erratum" (`git log --oneline -1 4ad4c77`), not round-26 tip;
the `:1853` correction first appears in `0c666ad` (round-26 landing). The sentence is true at
`f185b4e` and false at the cited counter baseline `4ad4c77`. Both the "five" and the parenthetical
can be made true, but not about the same revision.

## 8. Smallest safe correction

1. In `m1LogFindings`, replace `/:\d+/.test(text)` with a citation-equality test on the same
   correction unit: collect `[...text.matchAll(/:(\d+)/g)]` and require the set to contain
   `String(f.line)` (and prefer requiring it in the same bullet). This alone makes
   `fixture-a`/`fixture-b` count their findings and leaves the four real corrections cleared.
2. Append a real `:221` correction bullet citing `:221` with `cases: 12` (the oracle); without it,
   an equality-based rule reports 1 LOG finding at the tip (measured above).
3. Record the line→paragraph unit change as a claim revision (it cannot be pre-data now; it must
   be declared, not implied by a code comment), or restore the line unit and accept that the
   shipped correction block does not satisfy the frozen predicate — i.e. C1 failed.
4. Add red selftest cases for the three shapes demonstrated here: wrong/nonexistent line
   citation, oracle number present only in an unrelated fraction, negated marker
   ("does not supersede").
5. Optional hardening: require the oracle number in a tally shape (`cases: N`, `--selftest N/N`)
   rather than the generic `N/M` fraction at `scripts/check-selfassessment.mjs:252`.

## 9. Evidence index and unknowns

Scratch root: `.ufo/waves/round-27/scratch/CritC1Supersession/`.
`LOG-at-5ed6484.md` (rev bytes), `tip.json`, `baseline.json`, `f185b4e.json`,
`baseline-selftest.json`, `selftest.json`, `fixture-{a,b,c,d,e,f}-clean.json`, and fixtures
`fixture-{a,b,c,d,e,f}/` (each a real git repo with its own HEAD; the JSON `rev` field is the
fixture commit). The earlier file at this report path (273 lines, mtime 14:39) is replaced by
this independently measured report; it was not used as evidence.

Unknown: none material to (a)-(c). The worktree LOG and SCORECARD are being edited by other
seats while this seat runs; no statement above depends on worktree bytes except where explicitly
labelled. No tracked file, credential, or sibling lane was touched.

---

## 10. Independent replication (second instance of this seat id)

Provenance: this path was replaced at 14:39 by an independently measured report from a second
instance of `TabiR27.CritC1Supersession`; the earlier 273-line draft is preserved byte-for-byte at
`.ufo/waves/round-27/scratch/TabiR27.CritC1Supersession/overwritten-by-peer.md`. §1–§9 were then
re-measured by this instance; every number below is my own run, not a restatement.

Re-verified: script sha256 `de5d6676b767d31ec52e2831a30dd8899dce99abe4b034e24440176f1ec7faab` at
both `5ed6484` blob and worktree (`git show 5ed6484:scripts/check-selfassessment.mjs | sha256sum`);
`--rev f185b4e` → `mismatches=5`, `LOG:1664 superseded=true`; `--rev 4ad4c77` → `mismatches=6`,
`LOG:1664 superseded=false`; `git show 4ad4c77:LOG.md | grep -c 'Correction (supersedes
LOG.md:1664)'` → `0`; `git merge-base --is-ancestor 0c666ad 4ad4c77` → exit 1. Re-ran the peer's
own fixtures: `fixture-d` (`1b1b0395f407a08181a26a1882cd9e1e8a921770`) → `mismatches 0`, `clean
true`, `LOG:6 12→13 superseded=true`; `fixture-f` (`007865815b3c62533b5173916e356af943cdf421`) →
same. Both the unrelated-fraction and the negated-marker clears are real.

### 10.1 Which unit, exactly (§4 states the extremes; this is the middle)

`units.mjs` over `HEAD:LOG.md`, using `statedTallyNumbers()`/`paragraphs()` lifted verbatim from the
source, scored five candidate predicates against all six disputed findings:

| predicate | `:335` | `:391` | `:1090` | `:1103` | `:1664` | `:221` |
|---|---|---|---|---|---|---|
| single line + own citation (frozen reading) | — | — | — | — | — | — |
| paragraph + any `:N` (shipped) | 1904 | 1904 | 1904 | 1904 | 1845 | **265, 1904** |
| paragraph + own citation | 1904 | 1904 | 1904 | 1904 | 1845 | — |
| bullet entry + any `:N` | 1904, 1908 | 1904, 1908 | 1912, 1916 | 1912, 1916 | 1853 | 265, 1904, 1908 |
| bullet entry + own citation | 1904 | 1908 | 1912 | 1916 | 1853 | — |

Two readings follow. Citation equality alone keeps the claim's five dispositions and refuses
`:221`; entry-scoping alone does not (a bullet of the same block still clears `:221`). The minimal
predicate that satisfies both the frozen wording's intent and the claim's after-arm is
**entry-scoped + citation equality**; §8 item 1 (`paragraph + own citation`) is sufficient, and
its measured tip value is `m1 = 1` (`:221`) → `mismatches = 2` with `m3`.

### 10.2 Two further clear shapes and one control not covered above

- **Cross-script number laundering.** A correction paragraph that names `scripts/check-fixture.mjs`
  but whose only tally `13/13` belongs to `scripts/check-other.mjs` (oracle 15) clears the
  fixture finding (12→13); the other gate's own 13-vs-15 stays counted. The "oracle-correct number"
  is never bound to the script named in the correction (`fixtures2.mjs`, `V8b-other-gate-tally-laundered`).
- **Document isolation — control, holds.** A LOG paragraph citing `SCORECARD.md:5` with the right
  number clears nothing in `SCORECARD.md`: the two windows keep separate finding lists
  (`fixtures2.mjs`, `V9-log-paragraph-cannot-clear-scorecard` → `mismatches 1`, finding counted).
- **Literal ticket shape.** `fixture-v12`, rev `6a0c86e884e7f7e7e9ceb60867d806b96a3a3995`, 103-line
  LOG with the stale tally at `:100` and a correction citing nonexistent `:200` →
  `mismatches 0`, `clean true`, exit 0, `LOG:100 12→13 superseded=true`. Command:
  `node scripts/check-selfassessment.mjs --repo <scratch>/TabiR27.CritC1Supersession/fixture-v12
  --rev 6a0c86e8… --json`.

### 10.3 The two windows are not one convention

`m1Findings` (SCORECARD) requires the correcting line to itself be a measured claim
(`g.observed === g.claimed`, `scripts/check-selfassessment.mjs:235-238`) and accepts
`supersed|correct|replace|replac|superseding`; `m1LogFindings` requires only that the number appear
and accepts `supersed|correct` (`:319-327`). Unit: line vs paragraph. So the header's "same
supersession convention" (`:44-48`) is wrong on three counts — unit, marker set, claim strength —
and the §8 fix must be applied twice or factored into one shared helper, or the SCORECARD window
keeps the any-`:N` hole that the LOG window is being criticised for.
