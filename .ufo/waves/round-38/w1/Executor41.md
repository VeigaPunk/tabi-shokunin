# Executor41 — W1-41 — tabi round 38, attempt 1

Seat: Executor41 (executor, leaf). Attack id: W1-41.
Assignment: one bounded executable verification of the Playwright Firefox driver or the frozen
counters — syntax/runtime, receipt shape, counter consistency, source/census/numstat.
Attacked claims: C1 (calibration, D1–D6 routed defects) and C2 (coverage, Playwright Firefox
Juggler loopback capability).

Axes named before measuring: (A1) frozen-byte custody, (A2) counter executability, (A3) counter
discrimination (REV vs baseline dynamic range), (A4) counter satisfiability, (A5) receipt shape
vs claim wording, (A6) measurement non-vacuity.

No lane production file was edited, no commit/push/jj mutation in the lane, no spawn, no pacman.
All runs used a throwaway clone and scratch under `/fast/scratch/hyaku/tabi-r38/Executor41/`
(removed before yielding). No tool was installed: node v24.21.0, Playwright 1.64.0 and Firefox
157.0 were already present.

## 1. Custody of the frozen bytes — holds

```
$ cd tabi-shokunin && git log --oneline -1
a8e7d50 round-38: freeze calibration and Firefox capability claims
$ git show --stat --oneline a8e7d50
 .ufo/waves/round-38/claims.json | 59 +++++++++++++++++++++++++++++++++++++++++
$ git diff --stat a8e7d50 -- .ufo/waves/round-38/claims.json .ufo/waves/round-38/counters/ \
      scripts/playwright-firefox-loopback-round38.mjs
(empty output)
$ sha256sum .ufo/waves/round-38/counters/*.mjs scripts/playwright-firefox-loopback-round38.mjs
209d86a0…149d57f7  .ufo/waves/round-38/counters/c1-routed-defects.mjs      # == claims.frozenDigests
704da806…053a890bb .ufo/waves/round-38/counters/c1-adjacency-sweep-v6.mjs
6a14d8ca…d64047fecf .ufo/waves/round-38/counters/c2-firefox-bidi-v4.mjs
6d7a925b…7cf91e503c .ufo/waves/round-38/counters/c2-battery-mutants.mjs
4cf3a849…b0b02e75c1 scripts/playwright-firefox-loopback-round38.mjs
```

All five `frozenDigests` match byte-for-byte. But the frozen set's own identity is stated three
different ways: the wave authorization says the claims are frozen at `a8e7d50`, `claims.json`
declares `"frozenAt": "98239d0…"` **and** `"baseline": "98239d0…"`, and the C1 counter hardcodes
`const BASELINE = '3f42a5c7…'` (`.ufo/waves/round-38/counters/c1-routed-defects.mjs:52`).
`3f42a5c7` is the round-37 verifier spot-check, `98239d0` is the instrument commit, `a8e7d50` is
the claims commit. This is not cosmetic one commit later (see F4).

`.ufo/waves/round-38/measure/` and `.ufo/waves/round-38/baseline/` exist on disk and are **empty**;
`git ls-tree -r a8e7d50 -- .ufo/waves/round-38` lists only `claims.json` plus the four counters.
So every receipt D4/D5/D6 tests against must be produced and committed during this wave.

## 2. C1 counter — runs, exits 1, predicate false at the frozen REV

```
$ git clone --no-hardlinks …/tabi-shokunin <scratch>/lane-clone && git -C lane-clone checkout a8e7d50
$ node .ufo/waves/round-38/counters/c1-routed-defects.mjs --rev a8e7d50c04254bb19f9de08b31ca2aa811fbe7fc \
      --repo <scratch>/lane-clone --json
exit=1
```

Findings (14), verbatim ids: `d1-correction`, `d1-results`, `d2-stated`, `d3-hash` ×6
(`present=false isCommit=true ancestor=true` for all six round-37 hashes), `d3-freeze-landing`,
`d4-lesson`, `d4-receipt`, `d5-receipt`, `d6-file`.

Independently checkable states behind them:
- `SCORECARD.md:2078` still carries `Two v1 waves; the round contains **68 seats** (w1 34 + w2 34;`
  → `d1.stalePresent=true`; no round-38 correction line exists after it (`d1.supersedingCorrection=false`).
- `LOG.md` has no `## Round 38` heading; its last section is `## Round 37` (`grep -n '^## Round' LOG.md`
  → last hit `2519`). D2/D3 therefore operate on `log.slice(-1)` (a single trailing byte).
- `.ufo/waves/round-37/w1-results.json` is absent from git at REV (`d1-results`). It exists
  **untracked** in the live lane worktree (`?? .ufo/waves/round-37/w1-results.json`); I did not touch it.
- `corpus/lessons/round-38.md` absent (`d4-lesson`); `.ufo/waves/round-38/baseline/m3-sentence-mutant.json`
  absent (`d4-receipt`); `measure/census-end.txt` absent (`d5-receipt`); no numstat receipt (`d6-file`).

The one positive signal: D2's recomputation is real and already true — `d2.recomputed =
{ok:23, finding:11, error:0, none:0, reports:34}` derived from the 34 committed round-37 w1 reports.
So the 23/11 tally the claim asks LOG to state is independently reproducible at REV.

**Zero dynamic range.** The same counter at `98239d0` and at `3f42a5c7` emits the identical 14
findings (`d1.stalePresent=true` at the round-37 baseline too — the stale line predates round 38).
As frozen, the instrument distinguishes nothing between the claim REV and its baseline; a later
"predicate true at REV" verdict must come from artifacts that do not exist yet.

## 3. C1 is unsatisfiable as frozen — D6 has three independent defects (F1–F3)

To separate "evidence missing" from "instrument broken" I built a throwaway fixture commit in the
scratch clone that writes the honest artifacts D1–D6 ask for (committed `w1-results.json`
`{"seats":34}`, an append-only `SCORECARD.md` round-38 correction, a `LOG.md` `## Round 38` section
carrying `23 ok / 11 finding` + all six hashes + `34ed508c`, `corpus/lessons/round-38.md` with a
`captured-by:` `surface-mismatch` row, `baseline/m3-sentence-mutant.json` `{"exit":1}`, a census
receipt generated from the REV bytes, and `measure/numstat-at-3f42a5c.txt` naming
`3f42a5c7…..<REV>`).

```
$ node .ufo/waves/round-38/counters/c1-routed-defects.mjs --rev 277727bc… --repo <scratch>/lane-clone --json
exit=1  findings = [ d6-file ]
d1 {stalePresent:true, supersedingCorrection:true, seats:34, w2Absent:true}
d2.stated {ok:23,finding:11}  d3.freezeLandingStated true
d4 {mistakes:true, capturedBy:true, mutantRefused:true}
d5 {receiptRows:143, counterRows:143, tier:{A:127,B:7,C:9}, status:{mined:119,queued:15,rejected:9}}
```

D1–D5 are satisfiable; **D6 never is**. Three separate causes, each verified:

**F1 — anchored filename regex against root-relative paths (line 214).**
`git ls-tree --name-only REV .ufo/waves/round-38/measure/` returns repo-root-relative names:
```
.ufo/waves/round-38/measure/census-end.txt
.ufo/waves/round-38/measure/numstat-at-3f42a5c.txt
anchored-match(.ufo/waves/round-38/measure/numstat-at-3f42a5c.txt) = false | suffix-match = true
filtered.length = 0 ; non-anchored filtered.length = 1
```
`filter((n) => /^numstat-at-[0-9a-f]+\.txt$/.test(n) || n === 'numstat.txt')` can never match a
path returned under that pathspec, so `names` is always `[]` → `d6-file` → exit 1. Prior rounds'
receipts are named exactly `numstat-at-34ed508.txt`
(`.ufo/waves/round-37/measure/numstat-at-34ed508.txt`), so the convention is right and only the
match is wrong.

**F2 — double path prefix (line 217).** With F1 patched in a scratch copy the finding became
`d6-window namesBaseline=false namesRev=false` while `d6.file` printed the full path: line 217 does
`blob(repo, REV, '.ufo/waves/round-38/measure/' + names[0])`, prefixing an already-root-relative
name → `git show REV:.ufo/waves/round-38/measure/.ufo/waves/round-38/measure/numstat-at-3f42a5c.txt`
→ null → empty text.

**F3 — self-reference fixed point (line 220).** With F1+F2 patched, the run reported
`namesBaseline=true namesRev=false`. Committing a receipt that names the commit containing it:
```
FIXREV = 277727bc3bd1fba5139651f6628c96b057df5e49   (receipt names 277727bc…)
$ git commit … → FIX2 = 744ec692bf72848565d66e47fbbce25f64fc9bed
$ node <patched counter> --rev 744ec692… --repo <scratch>/lane-clone
exit=1  findings=[d6-window]  d6 {file:".ufo/waves/round-38/measure/numstat-at-3f42a5c.txt",
                                 namesBaseline:true, namesRev:false}
```
`out.d6.namesRev = text.includes(REV.slice(0,8)) || text.includes(REV)` requires the receipt blob
*at* REV to contain REV's own hash. A receipt is committed by the commit whose hash it would have to
contain, so no commit can satisfy it — a hash fixed point. This is not a fixture artifact: it applies
to any REV an operator would measure.

**Consequence for C1.** The claim's target is "Frozen counter predicate true at measured REV", and
`predicate` is the conjunction that includes `out.d6.namesBaseline && out.d6.namesRev`. Since D6 is
unreachable, no REV can produce `predicate=true` or exit 0 with this frozen counter, and the
"baseline control must fail" leg is vacuous because everything fails. The claim is falsified at the
frozen instrument, not merely unevidenced. (C1's kill rule — "any stated number differs from
counter-derived evidence" — is met in the structural sense: the counter contradicts its own
documented usage for `.ufo/waves/round-38/measure/numstat-at-*.txt`, lines 33 and 211–225.)

**F4 — baseline identity conflict.** D6's window must contain `BASELINE` = `3f42a5c7…` (line 52),
while `claims.json` declares `"baseline": "98239d0…"`. An operator who cuts the numstat window at
the claim's declared baseline (`98239d0..REV`, the commit that added the instruments, 5 files /
1 893 insertions) produces `namesBaseline=false` and the predicate fails for a second, unrelated
reason. The counter's own comment ("the baseline equals the frozen round-start baseline", line 33)
resolves to `3f42a5c7`, not to the claims file's field.

**F5 — exit-code shape.** Every structural failure above surfaces as **exit 1** (findings) rather
than exit 2 (`could-not-evaluate`). Evidence: both D6 variants above returned 1, and no code path
maps an unreadable/misnamed receipt to `Refusal`. A reader cannot distinguish "operator forgot the
receipt" from "instrument cannot read receipts", which is exactly how the two look identical here.

## 4. D5 census leg — mapping correct, but the live worktree is a trap (F6)

The counter's D5 parse is consistent with the registry: `corpus/SOURCES.md:13` header is
`| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |`;
rows split into 13 fields, so `c[4]` = tier and `c[8]` = status are the right columns (all 143/144
data rows have 13 fields, verified by counting). Census at REV `a8e7d50`, derived from git bytes:

```
rows 143 ; tier {A:127, B:7, C:9} ; status {mined:119, queued:15, rejected:9}
```

Live lane worktree right now: `M corpus/SOURCES.md`, `?? corpus/knowledge/playwright-firefox-loopback-round-38.md`,
and `SOURCES.md` has grown an `S144` row (`| S144 | Browsers — Playwright — https://playwright.dev/docs/browsers …| mined | 2026-10-27 |`)
→ `rows 144, tier {A:128,B:7,C:9}, status {mined:120,queued:15,rejected:9}`. D5 compares the receipt
to the **REV** bytes, so a census receipt generated from the worktree before the S144 edit is
committed computes 144 against the counter's 143 and fails. The receipt must be generated from
`git show <REV>:corpus/SOURCES.md`, never from the worktree.

## 5. C2 — driver runs and binds; three receipt-shape gaps (F7–F9)

Environment (already installed, nothing added): node `v24.21.0`; Playwright `1.64.0`
(`…/fnm/node-versions/v24.21.0/installation/lib/node_modules/playwright/package.json`);
`~/.cache/ms-playwright/firefox-1555/firefox/firefox` → `Mozilla Firefox 157.0`.

```
$ HYAKU_SCRATCH=<scratch> node scripts/playwright-firefox-loopback-round38.mjs \
      --out <scratch>/receipts/pwff-w1-41.json --runs 2
{"wrote":"…/pwff-w1-41.json","runs":2,"binding":true,"egress":0,"survivors":0,
 "firstShot":["3e0c070a75f041986f63792a036addf08f0915b79713fd655499c601ec56378c",
              "3e0c070a75f041986f63792a036addf08f0915b79713fd655499c601ec56378c"]}
real 0m4.625s   exit=0   receipt 7448 B
```

Per-run receipt facts actually observed (not inferred): `run1` pids `[521484,521912,521964]`,
`run2` pids 9 entries; `egress {samples:2, nonLoopback:0, lines:1}` / `{samples:2, nonLoopback:0, lines:2}`;
`portClosed:true` both; `firefoxSurvivorPids:0` both; `httpLog` URLs are exactly
`http://127.0.0.1:<port>/a.html` and `/b.html`, zero non-loopback URLs; 11 steps each, no `errors`;
click effect `count=1, items=1, confirm="confirmed 1"`; post-click screenshot differs
(`072ae136…`, 22 924 B vs first `3e0c070a…`, 20 626 B); `evaluate innerWidth=800`; console errors 0;
`browserVersion "157.0"`, `fixture.sha256 0057709b…`, `fixture.bytes 1240`.

**F7 — `firefoxVersion` is null in every receipt.** Line 157 initializes
`{ … playwrightVersion: PW_VERSION, firefoxVersion: null, browserVersion: null … }` and nothing ever
assigns `firefoxVersion`; the observed version lands only in `browserVersion: "157.0"`, filled by
`probe.version()` at lines 158–159. The claim's surface names "Firefox 157.0"; a consumer reading the
field with that name gets `null`.

**F8 — coldness is not driver-controlled.** Line 72 `const profile = mkdtempSync(join(profileRoot, 'profile-'))`
is dead: `firefox.launch({ headless: true })` (lines 73, 158) is called with no `userDataDir`, so the
harness's `profiles/` tree stays empty and "two cold runs" rests on Playwright's own default temp
profile rather than on the driver's isolation. (It does work — the two runs bind — but the driver
does not enforce what the claim words describe, and `runOnce`'s `out` parameter (line 60) is also
unused.)

**F9 — the egress sampler is narrow and partially unanchored.** The sampler at lines 77–84 polls
`ss -tnp` every 400 ms and matches `pid=(<pids>),` against a pid list captured **once** at line 74,
immediately after launch. In these runs that produced only 2 samples per ~1.9 s run; `egress.lines`
1–2 proves the sampler did observe loopback sockets (so "zero non-loopback" is not vacuous here), but
processes spawned after line 74 are never matched, and egress between samples is invisible. The
supportable statement is "no non-loopback socket in 2 samples over ~0.8 s of sampling", not "zero
egress for the run". I confirmed the vacuity margin exists: with `firefoxPids: []` the pid regex
collapses to `pid=(),` and both `egress.nonLoopback` and `survivors` would read 0 without measuring.

Related frozen instruments, for completeness: `c2-battery-mutants.mjs --rev a8e7d50 --repo <clone> --json`
→ `verdict:"pass"`, exit 0, `sha256Before == sha256After == 6a14d8ca…` (m5/m5b killed, m3 classified,
decoy clean, restored). `c2-firefox-bidi-v4.mjs` prints `verdict=could-not-evaluate detail=usage: --rev <40-hex REV> required`
with exit 2 on no args, and at a REV:
`predicate=true, findings=[]` — at **all three** of `a8e7d50`, `98239d0` and `3f42a5c7` (exit 0 each).
That counter therefore has zero dynamic range for round 38 and is not the counting command of either
frozen claim.

## 6. What would falsify / restore each claim

- **C1 is falsified as frozen** (D6 unreachable; F1–F3). A repair that makes it falsifiable again
  would need: a de-anchored/`basename` filename match, a single path join, and a window check that
  does not require the receipt to contain its own commit (e.g. accept a `windowEnd` recorded pre-commit
  and verified against `git rev-parse` of the measured object, or measure a REV that the receipt can
  legitimately name because that REV already existed when the receipt was written — the F3 fixture
  shows the window leg itself passes in that shape). C1 would additionally have to reconcile
  `claims.json.baseline` (98239d0) with `BASELINE` (3f42a5c7).
- **C2 is supported but weakly on two edges**: the driver genuinely produces two cold runs with
  identical first-shot bytes, loopback-only URLs, zero survivors and real click/navigation/evaluate
  evidence in 4.6 s; the claim's kill rule is not met on the run itself. It would be killed by a run
  with differing first-shot hashes (I got byte-identical), non-loopback URLs (none), or a survivor
  (none). It is *not* falsified by F7–F9, but those three mean the receipt cannot yet carry the
  words "Firefox 157.0" (null field), "cold" (unused profile control) or "zero observed non-loopback
  sockets" beyond a 2-sample window.

## 7. Risks and blockers for the integration seat

1. C1's frozen counter cannot report success at any REV; if SCORECARD/LOG claim "predicate true at
   REV" for C1 it will be unsupported by the frozen instrument (it will be exit 1 with `d6-file`).
   Re-freezing the counter changes `frozenDigests` and needs an explicit amendment.
2. `.ufo/waves/round-38/measure/` and `baseline/` are empty; D4/D5/D6 evidence must be committed at
   REV, and the census receipt must be generated from REV bytes (worktree already 144 rows vs REV 143).
3. `.ufo/waves/round-37/w1-results.json` is untracked in the live worktree; D1 needs it committed.
4. `LOG.md` has no round-38 section yet and `SCORECARD.md:2078` still carries the 68-seat line; both
   D1 and D2/D3 depend on appends that do not exist at `a8e7d50`.
5. `SOURCES.md` S144 (`corpus/SOURCES.md`, uncommitted) shifts the census by +1 row and +1 mined;
   the knowledge row `corpus/knowledge/playwright-firefox-loopback-round-38.md` is untracked.
6. Receipt field `firefoxVersion` is null; anyone grading C2's surface against that field will see a gap.

VERDICT finding — C1's frozen counter is executable but unsatisfiable (D6 fails by construction:
anchored regex at `c1-routed-defects.mjs:214`, double path prefix at `:217`, self-referential REV
window at `:220`; 14 findings identically at `a8e7d50`, `98239d0` and `3f42a5c7`); C2's driver
reproduces two cold runs in 4.6 s with binding first-shot `3e0c070a…`, loopback-only URLs, 0
survivors and 0 non-loopback samples, with receipt-shape gaps at
`playwright-firefox-loopback-round38.mjs:72` (dead profile control) and `:157` (`firefoxVersion: null`).
