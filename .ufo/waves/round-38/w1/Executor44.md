# Round 38 · W1 · Executor44 — bounded executable verification (attack id `W1-44`)

seat: executor44 (leaf) · lane: tabi-shokunin · frozen claims `a8e7d50c04254bb19f9de08b31ca2aa811fbe7fc`
item focus #4: syntax/runtime, receipt shape, counter consistency, source/census/numstat
write scope: this report only (`+ /fast/scratch/hyaku/tabi-r38/Executor44/`, cleaned). No production file,
no git/jj mutation in the lane. All fixture git work happened in scratch clones whose
`git rev-parse --show-toplevel` was asserted first.
tooling: **no installs performed** (Playwright 1.64.0, node v24.21.0, Firefox playwright-firefox-1555
already present; `pacman` untouched per authorisation).

## Verdict summary

| Claim | Runtime / instrument | As frozen |
|---|---|---|
| **C1** calibration (D1–D6) | instrument runs, all 5 syntax-clean, digests match | **FALSIFIED as frozen — predicate unsatisfiable** (F1). Secondary holes F2–F5. |
| **C2** coverage (Playwright Firefox/Juggler) | **reproduced independently** — same first-shot SHA, 0 egress, 0 survivors, all interaction steps green | runtime predicate **supported**; calibration not met: no frozen verifier consumes the receipt (F6), receipt shape defects (F7), cited bytes absent at freeze (F8). |

## 1. Freeze integrity, syntax, baseline control

```
$ sha256sum .ufo/waves/round-38/counters/*.mjs scripts/playwright-firefox-loopback-round38.mjs
704da806…bb c1-adjacency-sweep-v6.mjs      209d86a0…f7 c1-routed-defects.mjs
6d7a925b…3c c2-battery-mutants.mjs         6a14d8ca…ef c2-firefox-bidi-v4.mjs
4cf3a849…c1 scripts/playwright-firefox-loopback-round38.mjs
```
All five equal `claims.json → frozenDigests` byte-for-byte. `node --check` on all five → exit 0 each
(node v24.21.0). `npx playwright --version` → `Version 1.64.0`, matching `toolInstalls[2].version`.

Baseline control (`killRule: "baseline reaches predicate"`):

```
$ node .ufo/waves/round-38/counters/c1-routed-defects.mjs --rev 3f42a5c7cc19a544c879577e4bad7b7fd9d61a35 --repo <lane> --json
→ exit 1, predicate false
$ node … --rev a8e7d50c04254bb19f9de08b31ca2aa811fbe7fc --repo <lane> --json
→ exit 1, 15 findings (d1-correction, d1-results, d2-stated, 6× d3-hash, d3-freeze-landing,
  d4-lesson, d4-receipt, d5-receipt, d6-file), predicate false
```
Baseline does **not** reach the predicate. That kill rule is not triggered. The 15 findings at the
frozen REV are expected pre-integration state (corrections not yet landed), not a defect by themselves.

Independent re-derivation of the contested round-37 tally (not using counter code): last
`VERDICT (ok|finding|error)` per committed seat file under `.ufo/waves/round-37/w1/` →

```
34 seats;  23 VERDICT ok;  11 VERDICT finding
```
That matches `d2.recomputed` and the corrected target exactly. **D2's numbers are sound.**

## 2. C2 — independent reproduction (positive result)

```
$ HYAKU_SCRATCH=<scratch> node scripts/playwright-firefox-loopback-round38.mjs --out <scratch>/receipt.json --runs 2
{"wrote":"…/receipt.json","runs":2,"binding":true,"egress":0,"survivors":0,
 "firstShot":["3e0c070a75f041986f63792a036addf08f0915b79713fd655499c601ec56378c",
              "3e0c070a75f041986f63792a036addf08f0915b79713fd655499c601ec56378c"]}
exit=0
```
Per-run audit of my receipt: `browserVersion 157.0`, 3 firefox PIDs captured at launch, `portClosed true`,
steps `navigate.hydrated, title, shape, screenshot.first, click.effect, screenshot.after-click, evaluate,
history.traverse, history-reset-and-click, http.witnessed, console.quiet`; `click.effect {count:"1",
items:1, confirm:"confirmed 1"}`, `evaluate {innerWidth:800}` , `history.traverse {pathname:"/a.html",
title:"TABI-R38 fixture"}`; requests only `http://127.0.0.1:<port>/{a,b}.html`; console errors 0.

Comparison with the lane's draft receipt `corpus/evidence/round-38/playwright-firefox/receipt.json`
(untracked worktree file, mtime 12:34): `firstShotSha256` **identical** to mine in both runs; per-run
`egress {samples:2, nonLoopback:0, lines:1}` and 3 PIDs identical. **The capability is real and
reproducible on this host**; the quoted hash in the knowledge draft is not fabricated.

Frozen operability instrument also green at the frozen REV:

```
$ node .ufo/waves/round-38/counters/c2-firefox-bidi-v4.mjs --rev a8e7d50… --repo <lane> --json
exit=0  predicate=true  population 17  admitted 16  target 16  failing 0  survivors 0
        egressNonLoopback 0  receiptFinding null  binding null
$ node .ufo/waves/round-38/counters/c2-battery-mutants.mjs
{"sha256Before":"6a14d8ca…ef","sha256After":"6a14d8ca…ef",
 "mutants":{"m5":{"status":1,"clean":false},"m5b":{"status":1,"clean":false},
            "m3":{"status":0,"clean":true},"decoy":{"status":0,"clean":true}},
 "verdict":"pass"}  exit=0
```
The battery kills m5/m5b, classifies m3, keeps decoy clean, restores the digest. **C2b controls hold.**

## 3. Findings

### F1 (critical) — D6 is unsatisfiable by construction; C1's predicate can never be true

`c1-routed-defects.mjs:213-214` discovers the numstat receipt with
`git ls-tree --name-only REV '.ufo/waves/round-38/measure/'` and then filters each entry with
`/^numstat-at-[0-9a-f]+\.txt$/` (or `n === 'numstat.txt'`). `ls-tree` given a directory emits
**repo-root-relative paths**, so the anchor can never match:

```
$ git -C <fixture> ls-tree --name-only e8492f2c '.ufo/waves/round-38/measure/'
.ufo/waves/round-38/measure/census-end.txt
.ufo/waves/round-38/measure/numstat-at-3f42a5c7.txt        # ← committed, and still not matched
D6 filter result: []      names[0] would be: None
```
Consequence: `d6-file` fires for every REV, so `predicate` is false for every REV. Measured on an
honest fixture that lands every correction D1–D5 require and commits `numstat-at-3f42a5c7.txt`
naming `3f42a5c7cc19…`:

```
honest fixture e8492f2c (v3):  d1 {stalePresent:true, supersedingCorrection:true, seats:34, w2Absent:true}
d2 {stated:{23,11}, recomputed:{ok:23,finding:11,reports:34}}  d3.freezeLandingStated true
d4 {mistakes:true, capturedBy:true, mutantRefused:true}  d5 {receiptRows:143, counterRows:143}
findings: ['d6-file | no numstat receipt under .ufo/waves/round-38/measure']   predicate=false
```
Only D6 fails, and it fails *because the file it wants is there*. `claims.json` C1 target
("Frozen counter predicate true at measured REV") is therefore unreachable: **C1 is falsified as
frozen.** D6 is also self-referential even after a regex fix — the receipt must contain
`REV.slice(0,8)` (`:221`) while being committed *at* REV, which has no fixed point; the round-37
precedent (`numstat-at-34ed508.txt` committed at `5a2ebb6`) shows the intended reading is a receipt
naming an *earlier* commit than the one that carries it, which `blob(repo, REV, …)` cannot see.

Falsifier for F1: a REV where `names` is non-empty (i.e. the per-entry match is made path-tolerant
`/(?:^|\/)numstat-at-[0-9a-f]+\.txt$/`), plus a receipt whose content can contain its own commit hash.

### F2 (high) — D1's "superseding correction" is a keyword sniff: false corrections are admitted

`c1-routed-defects.mjs:85` accepts any line after the stale `68 seats` line that contains
`34 seats` or `w2 … (not dispatched|never dispatched|deferred|absent)`, with "correction/supersed/
round 38" within ±6 lines. It never reads what the correction *says*. Measured:

```
decoy commit 3e09b174: appended "### Round 38 — plan / Planned for round 38: 34 seats in the wave."
→ d1.supersedingCorrection = true      (nothing was corrected)

false commit: appended "Correction to the above block: the round contained 34 seats and wave 2
dispatched on schedule, so the 68-seat figure stands as written."
→ d1 = {stalePresent:true, supersedingCorrection:true, w2Absent:true}    d1 findings: ['d1-results']
```
A statement asserting the **opposite** of the truth passes. `killRule "missing correction"` is not
enforced. Also `:96` checks only `w2.ready` and `w2-results.json`; defect D1 names the absence of
a `w2/` seat directory too, which is unexamined.

Falsifier: a counter revision that parses the correction's asserted shape (and rejects a
`w2 dispatched` phrase), then the two fixtures above must fail D1.

### F3 (high) — the frozen predicate sentence is **not** in claims.json (re-occurrence of round-37 M3)

`c1-routed-defects.mjs:42` claims "the same sentence in claims.json and the receipt's
predicateSentence field". Measured:

```
$ grep -c 'stale-line-present' .ufo/waves/round-38/claims.json   → 0
claims.json claims[0].predicate = "D1-D6 all re-derived and corrected at REV by c1-routed-defects.mjs; predicate true"
counter PREDICATE_SENTENCE       = "D1 stale-line-present AND superseding-correction-present AND … D6 window endpoints == baseline..REV"
```
The sentence exists at 2 sites, not 3. This is the exact surface-mismatch class round-37 routed as M3
and which round-38's own lesson row (D4) is required to carry. The `## Mistakes` row is therefore due
for this round, not only for round 37.

Falsifier: `grep -c` > 0 with byte-equality of `claims[0].predicate` and the counter constant.

### F4 (medium) — two incompatible "baseline" definitions

`claims.json → baseline` = `98239d0396ff32c3feb14638b3214fe688e8b122`; the counter hardcodes
`BASELINE = 3f42a5c7cc19a544c879577e4bad7b7fd9d61a35` (`:52`) and D6 requires the receipt to name it
(`:220`). `98239d0^ == 3f42a5c`, i.e. the true round-38 start is `3f42a5c`; `98239d0` is the round's
*first* commit (it already contains the instrument candidates). Round-37's claims.json set
`baseline == frozenAt == ed8ccfc` (the actual round start), so the round-38 file breaks its own
convention. A lane that follows claims.json produces a `98239d0..REV` receipt that D6 rejects.

Falsifier: claims.json `baseline` equal to `3f42a5c7…` (or the counter's constant changed to match).

### F5 (medium) — D3's negative clause refuses the natural honest sentence

`c1-routed-defects.mjs:153` refuses when `/freeze entry.*99437d29|99437d29.*freeze entry/i` matches
any single line of the round-38 section. Measured on the fixture: the honest sentence
"The round-37 report's Landed-changes bullet named `99437d29` for the freeze entry; that bullet is the
routed defect" → `freezeLandingStated = false`. The same content passes only after rewording to
"The round-37 report's Landed-changes bullet named the wrong hash" (v3 → true). The predicate rewards
vagueness and punishes the informative wording the routed defect itself asks for.

Falsifier: the negative term scoped to an assertion (e.g. "landed at `99437d29`") rather than to
co-occurrence.

### F6 (high) — C2's evidence has no verifier; every predicate term is self-attested

```
$ grep -rn 'playwright-firefox-loopback' .ufo/waves/round-38/counters/   → (no matches)
```
`c2-battery-mutants.mjs` mutates `c2-firefox-bidi-v4.mjs`, never the playwright driver. C2's
`countingCommand` is a *producer*: `binding`, `egressNonLoopback`, `survivors` and `firstShotSha256`
are written by the same script under test and read by nothing. A hand-edited receipt (e.g.
`egressNonLoopback: 5`, `binding: false`) is admitted by no instrument — precisely the
"observed-tamper receipt" class that round-37's v3 counter closed for the bidi path. C2's
`killRule` (differing hashes / non-loopback egress / survivor) names conditions that nothing checks.

Falsifier: a frozen C2 verifier that re-reads the receipt and re-derives each term; feed it a mutated
receipt and it must exit 1.

### F7 (low) — receipt shape defects (measured on both my run and the lane's draft)

- `firefoxVersion` is declared in the receipt and is **null** in every run (driver sets only
  `browserVersion = probe.version()`); `claims.json` C2 title says "Firefox 157.0" — the field meant to
  carry it is empty.
- `FIREFOX_BIN` (`scripts/playwright-firefox-loopback-round38.mjs:24`) is declared and never used; launch goes through Playwright's registry.
- `runOnce({ out, … })` takes `out` and never uses it (dead parameter; the caller also passes it).
- No wire-level Juggler evidence is recorded: "via Juggler" is asserted in comments/claim text and
  inferred from Playwright's build identity — `[INFERENCE]`, not an observed protocol record.

### F8 (medium) — C2's cited bytes do not exist at the freeze

```
$ git show a8e7d50:corpus/SOURCES.md | grep -c 'S144'      → 0
$ git show a8e7d50:corpus/SOURCES.md | grep -cE '^\|\s*S[0-9]{3,}\s*\|'  → 143
worktree: 144 rows, tier A 128 / B 7 / C 9, status mined 120 / queued 15 / rejected 9
```
At the frozen REV the SOURCES table has **143** rows and no S144; `claims.json` C2 `source`
("S144 (Playwright docs)"), the knowledge draft, and
`corpus/evidence/round-38/playwright-firefox/receipt.json` exist only as uncommitted worktree files
(mtime 12:34, during this wave). Practical trap: a census receipt built from the **worktree** (144)
fails D5's parse of the committed SOURCES at REV (143) — measured as
`d5-rows receipt rows 144 != counter rows 143` on my first honest fixture, all three histograms
mismatching. The census step must be measured at REV, not in the dirty worktree.

### F9 (low, evidence limit — not a defect) — egress sampling is thin

Each run records `egress {samples: 2, nonLoopback: 0, lines: 1}`: a 400 ms sampler over ~1 s of run,
maximum one socket line per sample. `nonLoopback: 0` is non-vacuous (pids captured, ≥1 socket seen),
but the strength of "loopback-only" rests on two observations per run, not continuous coverage.

### F10 (low) — claim/instrument bookkeeping

`claims.json` has two claims; the frozen set carries two further instruments (`c2-firefox-bidi-v4.mjs`,
`c2-battery-mutants.mjs`) with no claim entry and no counting command in the claim set, so C2b's green
result above is not attributable to a claim. Separately, D2 recomputes from the fixed round-37 report
corpus, so it is REV-invariant; the only REV-dependent term is that LOG.md *states* 23/11. Routed
defect D2 asked for the correction "in the round-38 report" (`.ufo/reports/round-38/tabi.md`, a
fleet-repo path absent from this lane), which the counter cannot read — it checks a prose copy in
LOG.md instead.

## 4. What would falsify this report

- F1: any REV at which `d6.file` is populated / `predicate` true under the byte-frozen counter.
- F2: a D1 correction fixture above that the counter *refuses*.
- F3: byte-equality between `claims[0].predicate` and the counter constant.
- F6: a round-38 frozen instrument that consumes `corpus/evidence/round-38/playwright-firefox/receipt.json`.
- F8: `S144` present in `git show a8e7d50:corpus/SOURCES.md`.

## 5. Limits

Scratch (`/fast/scratch/hyaku/tabi-r38/Executor44/`: two clones, honest fixture, decoy/false fixtures,
receipts, logs) removed before yield. No lane file other than this report was created or modified;
all fixture commits were made in scratch clones after asserting `git rev-parse --show-toplevel`.
No builds/lints/tests run against the lane (wave-in-flight rule); the only executions are the frozen
instruments and the driver, run read-only with `--out`/`HYAKU_SCRATCH` inside scratch.
