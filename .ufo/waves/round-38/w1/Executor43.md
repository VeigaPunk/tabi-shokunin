# W1-43 — bounded executable verification (C1 counter / C2 Firefox driver)

- Seat: Executor43 · attack id `W1-43` · round 38, attempt 1, wave 1
- Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`
- Frozen claims commit: `a8e7d50c04254bb19f9de08b31ca2aa811fbe7fc` (task-stated freeze commit; `claims.json` read there)
- Frozen claim bytes read at: `.ufo/waves/round-38/claims.json` (blob exists only at `a8e7d50c`, see F3)
- Focus 3: syntax/runtime, receipt shape, counter consistency, source/census/numstat
- Tooling: **no installs**. Pre-existing `node` + Playwright `1.64.0` (`/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/lib/node_modules/playwright/package.json`) + Firefox `157.0` (`/home/vgpnk/.cache/ms-playwright/firefox-1555/firefox/firefox`). No pacman transaction attempted. Scratch only under `/fast/scratch/hyaku/tabi-r38/Executor43/` (removed before yield).

## 0. Verdicts

| item | verdict |
|---|---|
| C1 instrument (calibration) | **predicate unreachable at every REV** — two independent defects in D6 (F1, F2). The claim's target "Frozen counter predicate true at measured REV" cannot be met by any honest implementation of the remaining corrections. |
| C2 driver runtime (coverage) | **reproducible and deterministic today**: 2 cold runs, identical first-screenshot sha, egress 0, survivors 0, port closed. |
| C2 predicate enforcement | **no refusing instrument exists** — nothing reads the Playwright receipt; the driver exits 0 unconditionally (F5). |
| C1 receipt shape / counter consistency | 7 further findings (F3, F4, F6, F8–F13). |
| Census / tally numbers | **independently confirmed** (143 rows, A127/B7/C9, mined119/queued15/rejected9; tally 23 ok / 11 finding over 34 reports). |

## 1. Frozen-digest verification (all five match)

```
$ for f in <frozenDigests paths>; do git show a8e7d50c:$f | sha256sum; done
209d86a0cc6fd35f9f87d0e74a769df8666d952a5e9fdec8a75df60b149d57f7  .ufo/waves/round-38/counters/c1-routed-defects.mjs
704da8068783b6c1debcefcf31a46cf503438e8974a27ebde73ade5053a890bb  .ufo/waves/round-38/counters/c1-adjacency-sweep-v6.mjs
6a14d8ca9200270e1fbd8537ddd74b986c181112eb97a9cfbc98dbb64047fecf  .ufo/waves/round-38/counters/c2-firefox-bidi-v4.mjs
6d7a925b563cdb1dcf30828087f9600d0b0f9deb98df21deb54d2a7cf91e503c  .ufo/waves/round-38/counters/c2-battery-mutants.mjs
4cf3a8499ad30158dd03d0b518ce8a79967bd0afafd2ea0f8b5730b0b02e75c1  scripts/playwright-firefox-loopback-round38.mjs
```
All five equal `claims.json:frozenDigests` values, and equal worktree `sha256sum`. Digest binding itself is sound.

## 2. Syntax / runtime

```
$ for f in .ufo/waves/round-38/counters/{c1-routed-defects,c1-adjacency-sweep-v6,c2-firefox-bidi-v4,c2-battery-mutants}.mjs \
           scripts/playwright-firefox-loopback-round38.mjs; do node --check $f; done
rc=0 for all five (no output)
```
No syntax failure in any frozen instrument.

C1 counter, three revisions, unmodified bytes as committed:

```
$ node .ufo/waves/round-38/counters/c1-routed-defects.mjs --rev a8e7d50c04254bb19f9de08b31ca2aa811fbe7fc --repo .
FINDING d1-correction no append-only round-38 correction naming the true shape after the stale line
FINDING d1-results w1-results.json absent
FINDING d2-stated LOG.md round-38 section lacks the corrected tally "23 ok / 11 finding"
FINDING d3-hash 99437d29 present=false isCommit=true ancestor=true      (× 6 hashes)
FINDING d3-freeze-landing LOG round-38 section does not record the freeze entry landing at 34ed508c ...
FINDING d4-lesson corpus/lessons/round-38.md absent
FINDING d4-receipt m3-sentence-mutant.json absent
FINDING d5-receipt census-end.txt absent at REV
FINDING d6-file no numstat receipt under .ufo/waves/round-38/measure
C1_ROUTED_DEFECTS predicate=not-met rev=a8e7d50c... findings=14 seats=undefined tally=23/11 census=undefined
exit=1
```
Same 14 findings and exit 1 at `--rev 98239d0…` (claims-declared baseline) and `--rev 3f42a5c…` (counter baseline). Exit-code contract holds at these revs (0 met / 1 not met / 2 could-not-evaluate); no-arg gives exit 2 with `verdict=could-not-evaluate` (correct).

C2 mutation battery and battery mode:

```
$ HYAKU_SCRATCH=<scratch> node .ufo/waves/round-38/counters/c2-battery-mutants.mjs
{"schema":"tabi-r38-c2-mutants-v1","sha256Before":"6a14d8ca…","sha256After":"6a14d8ca…",
 "mutants":{"m5":{"status":1,"clean":false,"p1Refused":false},"m5b":{"status":1,"clean":false,"p1Refused":false},
            "m3":{"status":0,"clean":true,"p1Refused":true},"decoy":{"status":0,"clean":true}},
 "expectations":{"m5_killed":true,"m5b_killed":true,"m3_classified":true,"decoy_clean":true,"restored":true},"verdict":"pass"}
exit=0
$ node .ufo/waves/round-38/counters/c2-firefox-bidi-v4.mjs --battery
{"schema":"tabi-r38-c2-battery-v1","h1Admits":true,"p1Refused":true,"clean":true} exit=0
```
Battery behaves as declared (m3 is *classified*, not killed — self-declared limitation in the driver header).

## 3. C2 driver — executable, deterministic, and matching the pre-existing evidence receipt

```
$ HYAKU_SCRATCH=<scratch> node scripts/playwright-firefox-loopback-round38.mjs --out <scratch>/pw-receipt.json --runs 2
{"wrote":"<scratch>/pw-receipt.json","runs":2,"binding":true,"egress":0,"survivors":0,
 "firstShot":["3e0c070a75f041986f63792a036addf08f0915b79713fd655499c601ec56378c",
              "3e0c070a75f041986f63792a036addf08f0915b79713fd655499c601ec56378c"]}
exit=0   (wall 4.35 s)
```
Per run: 11 evidence steps, 3 witnessed requests all `http://127.0.0.1:<port>/…`, `portClosed:true`, `survivors:0`, `errors:[]`.
The first-shot sha is **byte-identical to the untracked evidence receipt** at `corpus/evidence/round-38/playwright-firefox/receipt.json` (`sha256 dd77b71a…`, `firstShotSha256 3e0c070a…`), so the driver reproduces its recorded evidence today on this host.

Firefox/Juggler identity verified independently of the receipt:

```
$ ~/.cache/ms-playwright/firefox-1555/firefox/firefox --version
Mozilla Firefox 157.0
$ unzip -l ~/.cache/ms-playwright/firefox-1555/firefox/omni.ja | grep -ci juggler
19      (e.g. chrome/juggler/content/JugglerFrameParent.jsm)
```
So "Playwright 1.64.0 + Firefox 157.0 via Juggler" is a true description of the executed surface.

### F5 (high, C2) — the C2 predicate has no refusing instrument, and the driver cannot fail

```
$ grep -rn "playwright\|juggler\|pw-firefox\|firstShot" .ufo/waves/round-38/counters/
(no counter reads tabi-pw-firefox-receipt-v1; only c2-firefox-bidi-v4.mjs's own BiDi transcript `firstShot(rec)` helper)
$ grep -n "errors.push\|pageerror\|firefoxVersion\|process.exit" scripts/playwright-firefox-loopback-round38.mjs
153:  if (!out) { console.error('usage: …'); process.exit(64); }
157:  const receipt = { …, firefoxVersion: null, browserVersion: null, … };
169:  main().catch((e) => { console.error(e); process.exit(1); });
```
- The driver has **no assertion and no failing exit path** for the claim's terms. It computes `binding`, `egressNonLoopback`, `survivors` and always exits 0; nothing refuses a false `binding`.
- Demonstrated vacuity of "Two cold runs; same first screenshot SHA":
  ```
  $ node scripts/playwright-firefox-loopback-round38.mjs --out pw-runs1.json --runs 1
  {"runs":1,"binding":true,"egress":0,"survivors":0,"firstShot":["3e0c070a…"]}  exit=0
  ```
  `binding` is `new Set([one]).size === 1` → `true` with a single run.
- The only frozen "C2 counter" (`c2-firefox-bidi-v4.mjs`) is the round-37 geckodriver/BiDi instrument; its predicate sentence
  `no entry finding AND no receipt finding AND no binding finding AND failing == 0 AND admitted >= 16 AND live.egressNonLoopback == 0 AND live.survivors == 0`
  contains none of the C2 claim's terms (two cold runs, first-shot binding, Playwright/Juggler). The battery only exercises that predicate.
- Consequence: C2's target is currently *recorded*, not *measured with a refusal*. What would falsify C2 as claimed: any counter that reads the receipt and exits non-zero on `binding !== true || runs !== 2 || egressNonLoopback !== 0 || survivors !== 0`.

### F7 (medium, C2) — "citing opened S144" and the capability row do not exist at REV

```
$ git show a8e7d50c:corpus/SOURCES.md | grep -c '^| *S[0-9]\{3,\} *|'   → 143
$ git show a8e7d50c:corpus/SOURCES.md | grep -n 'S144'                  → (no match; last id is S143)
$ git ls-tree -r --name-only a8e7d50c corpus/ | grep -i 'round-38'      → (none)
$ git show a8e7d50c:SCORECARD.md | grep -ic playwright → 8   (all pre-existing: web-flake / locator / round-12 rows)
$ git show a8e7d50c:SCORECARD.md | grep -ic juggler    → 0
$ git show a8e7d50c:SCORECARD.md | grep -in 'round-38' → 0   (no C2 capability row; only round-35/36/37 Firefox BiDi rows)
```
So at the frozen REV: no `S144` registry row, no round-38 knowledge doc, no Playwright capability row. `claims.json` C2 also has **no `source` field at all** (`claims.claims[1].source === undefined`), while its killRule requires "no cited newly opened source row". What would falsify: `S144` present with a Playwright-docs URL and a knowledge row citing it.

### F10 (low, C2) — driver receipt shape: dead fields, thin egress sampling

- `firefoxVersion` is initialised `null` and never assigned (`browserVersion` carries `"157.0"`); the claim's "Firefox 157.0" is only indirectly recorded.
- `rec.errors` is created `[]` and never written to (`errors.push` count = 0); no `page.on('pageerror')` handler — JS page errors are invisible; `console.quiet` only counts `console` type `error`.
- Egress observation is real but thin: `runs[*].egress = {"samples":2,"nonLoopback":0,"lines":1}`. Two samples per ~1 s run, with `lines:1` proving the `ss … pid=(…)` filter did match a live firefox socket (so the zero is not vacuous) — but two samples is a very short window for "zero observed non-loopback sockets", and firefox PIDs are captured once, so a child process spawned later is not watched.

## 4. C1 counter — receipt shape and counter consistency

### F1 (blocker, C1) — D6 file discovery never matches: `d6-file` fires at every REV

`.ufo/waves/round-38/counters/c1-routed-defects.mjs:213-215`
```js
const list = git(repo, ['ls-tree', '--name-only', REV, '.ufo/waves/round-38/measure/']);
const names = (list.stdout || '').split('\n').filter((n) => /^numstat-at-[0-9a-f]+\.txt$/.test(n) || n === 'numstat.txt');
```
`git ls-tree --name-only <rev> <dir>/` prints **repo-root-relative** paths, so the `^`-anchored regex and the `n === 'numstat.txt'` equality can never match:

```
$ git ls-tree --name-only <rev> .ufo/waves/round-38/measure/
.ufo/waves/round-38/measure/census-end.txt
.ufo/waves/round-38/measure/numstat-at-a8e7d50c.txt
$ <same output> | node -e '… filter(/^numstat-at-[0-9a-f]+\.txt$/ || x==="numstat.txt")'
matched: []
```
Reproduced in a scratch clone with a *correctly named, committed* `numstat-at-*.txt` (and also with `numstat.txt`): the counter still reports
`FINDING d6-file no numstat receipt under .ufo/waves/round-38/measure` with `predicate=false`. Verified for the no-file case too, so the finding text is indistinguishable between "no receipt" and "receipt present".

### F2 (blocker, C1) — even with F1 fixed, `namesRev` is a self-reference: unsatisfiable at any REV

`.mjs:216-222` reads the receipt blob **at REV** and requires `text.includes(REV.slice(0,8))`. A file committed in commit `C` cannot contain `C`'s own hash (content determines the hash). Empirically, in the fixture clone:

```
receipt body: "# baseline 3f42a5c7… -> rev 60b32dbb…"   (names the parent/measured rev)
$ node <F1-patched copy> --rev 5df8fc15… --repo <fixture>
FINDING d6-window receipt names baseline=true rev=false (window must be baseline..REV)
```
(Scratch copy with only the F1 filter repaired; no lane file touched.) Both defects are individually sufficient to keep the predicate false forever, so C1's "predicate true at measured REV" target is unreachable as frozen.

### F8 (medium, C1) — D6 never parses the receipt body

```
$ grep -n "numstat" .ufo/waves/round-38/counters/c1-routed-defects.mjs
33://   D6 numstat window precision … diffs exactly baseline..REV
211:  // ---------- D6: numstat window precision ----------
214:    const names = …
```
No body parse, no `\t`/row handling (grep for `\\t` → 0 hits). A file whose entire content is
`# baseline 3f42a5c7… -> rev <REV>\n0\t0\tNOT-A-REAL-DIFF.txt` satisfies D6's intended check if the two substrings are present. Also `names[0]` is arbitrary when several receipts exist (the fixture had two), so an extra file can flip the verdict.

### F3 (high, C1) — claim metadata contradicts its own evidence and the counter constant

| site | value |
|---|---|
| `claims.json:baseline` | `98239d0396ff32c3feb14638b3214fe688e8b122` |
| `claims.json:frozenAt` | `98239d0396ff32c3feb14638b3214fe688e8b122` |
| `c1-routed-defects.mjs:46` `BASELINE` | `3f42a5c7cc19a544c879577e4bad7b7fd9d61a35` |
| commit containing `claims.json` | `a8e7d50c…` (task freeze commit) |

```
$ git cat-file -e 98239d0:.ufo/waves/round-38/claims.json
fatal: path '.ufo/waves/round-38/claims.json' exists on disk, but not in '98239d0'
$ git show --stat 98239d0 | head
98239d0 round-38: add frozen-instrument candidates and Firefox driver   (5 files, the 5 frozen instruments)
```
`frozenAt` names the commit *before* the freeze, which does not contain the frozen bytes. `baseline` names a **round-38** commit that already contains all five frozen instruments — contradicting C1's `before: "… counter absent"` — while the counter hard-codes the round-37 tip `3f42a5c` as `BASELINE`. D6's predicate text says the window's "baseline equals the frozen round-start baseline"; the claim's frozen baseline and the counter's baseline disagree, so the required receipt is ambiguous and one of the two readings is always wrong. (Round-37 precedent: its LOG freeze entry declared baseline `ed8ccfc…`; the round-38 LOG section that would declare one does not exist at REV.)

### F4 (high, C1) — the "byte-identical predicate sentence" contract is violated at the claims site

`.mjs:4-8` and `.mjs:246` state the sentence is "the same sentence in claims.json and the receipt's `predicateSentence` field".

```
claims.claims[0].predicate : "D1-D6 all re-derived and corrected at REV by c1-routed-defects.mjs; predicate true"
counter PREDICATE_SENTENCE  : "D1 stale-line-present AND superseding-correction-present AND re-derived seats == 34
                               AND w2-artifacts absent AND D2 tally stated == recomputed AND D3 every hash present+ancestor
                               AND D4 captured-by present AND mutant receipt refused AND D5 receipt counts == counter counts
                               AND D6 window endpoints == baseline..REV"
byte-equal? false
```
The same defect class was already routed in round 37 (`w1-results.json` → `RevFrozenDigests`: "C1 and C2 header comment sentence text has two leading spaces after `//`, so literal byte comparison against claims predicate/constants differs"). It is still open.

### F6 (medium, C1) — D4 accepts a bare exit code as a "refused mutated sentence"

`.mjs:170-181`: `mutantRefused = d && (d.exit === 1 || d.exit === 2 || d.refused === true || d.killed === true)`. Receipt content is never bound to the mutated sentence, to the counter identity, or to a run. Scratch fixture probe (D6 neutralised to isolate the other terms; lane bytes untouched):

```
receipt {"exit":1}                      -> mutantRefused=true   predicate=true findings=[]
receipt {"exit":1,"note":"unrelated parse failure"} -> mutantRefused=true predicate=true
receipt {"refused":true}                -> mutantRefused=true   predicate=true findings=[]
receipt {"exit":0}                      -> mutantRefused=false  predicate=false findings=['d4-mutant']   (control fires)
receipt {"exit":2}                      -> mutantRefused=true   predicate=true
```
The full fabricated fixture (`SCORECARD` correction line + `LOG` round-38 section with the six hashes + `corpus/lessons/round-38.md` M3 row + `census-end.txt` matching + a numstat file with only the two magic strings + `{"exit":1}`) reached `predicate=True, exit=0`. So the predicate's *reachable* content is prose presence plus bare exit codes, not re-derivation. Positive control: deleting the stale `68 seats` line is refused (`d1-stale` + `d1-correction`), so append-only enforcement is active.

### F11 (low, C1) — D1's "re-derived seats" is a declared field, not a derivation

`.mjs:97` reads `JSON.parse(w1).seats` only. Fixture file `{"seats":34}` alone satisfied it. The lane's untracked `.ufo/waves/round-37/w1-results.json` does have `seats:34`, `results.length:34` (each entry carries a JSON *string* under `output`, no top-level `verdict`), so the number is consistent — but nothing re-derives it from entries. Note the file is **untracked** at REV, so D1 is currently unsatisfiable for a second, independent reason.

### F9 (low, C1) — absent round-38 LOG section silently degrades to a one-character slice

`.mjs:106` / `.mjs:139`: `log.slice(log.indexOf('## Round 38'))`. At REV `LOG.md` has no round-38 heading:

```
$ git show a8e7d50c:LOG.md | grep -n '## Round 38'   → no match
$ git show a8e7d50c:LOG.md | grep -c '99437d29'      → 0
```
`indexOf` = −1 → `slice(-1)` = last character. D2 and all six D3 hash checks then evaluate a 1-char string, producing `present=false` findings that look identical to a real content defect. No distinct finding is emitted for "section missing".

### F12 (low, C1) — header doc contradicts implementation on D5/D6 read source

`.mjs:44-46` says "D5/D6 receipt files are read at `--repo`'s worktree (they are committed measurement outputs, not git-object data)"; the code (`:181`, `:222`) reads them with `blob(repo, REV, path)` i.e. **git objects at REV**. Behaviour is the safer one; the documented contract is wrong, which matters for a `--repo <clean clone>` invocation where the worktree could be stale.

### F13 (info) — round-37 LOG pointer is dangling at REV

`LOG.md` round-37 section: "see the round-37 report (`.ufo/reports/round-37/tabi.md`)".
```
$ git cat-file -e a8e7d50c:.ufo/reports/round-37/tabi.md
fatal: path '.ufo/reports/round-37/tabi.md' does not exist in 'a8e7d50c'
$ git ls-tree -r --name-only a8e7d50c .ufo/reports/   → only fleet-round-1-attempt-20261015/tabi.md
```
D3's hash-carrying repair does not cover this reference. Also D3's six-hash set (`99437d29, f76da094, 34ed508c, 5a2ebb6a, f485cce1, bf8ecd5a`) is not enumerated by any committed artifact: the spot-check lesson says "grep = 0 for all **five** cited hashes" and cites `99437d29, 34ed508c, 5a2ebb6a, bf8ecd5a`; `f76da094` and `f485cce1` appear only in round-37 seat reports and inside the round-38 counter itself. All six do resolve as commits and are ancestors of REV (verified), so the *facts* hold; only the set's provenance is unbound.

## 5. Census and tally — independently re-derived (positive results)

Census parse of `corpus/SOURCES.md` at `a8e7d50c` using the counter's own column rule (`c[4]=tier`, `c[8]=status`, row regex `^\|\s*S\d{3,}\s*\|`):

```
rows 143
tier   {"A":127,"B":7,"C":9}
status {"mined":119,"queued":15,"rejected":9}
first row split: ["","S001",<title>,"docs","A",<scope>,<anchor>,<teaches>,"mined","2026-10-19","on-release",<used-by>,""]
```
Column indices are **correct** (no D5 parse defect). These numbers agree with the round-37 LOG statement "registry 142 → 143; mined 118 → 119; A 126 → 127". A `census-end.txt` in the counter's expected shape (`rows: 143` / `tier: A:127 B:7 C:9` / `status: mined:119 queued:15 rejected:9`) is therefore the correct receipt; a `rows: 142` receipt is correctly refused (`FINDING d5-rows receipt rows 142 != counter rows 143`, verified in the fixture).

Tally re-derived three independent ways over the 34 committed round-37 seat reports (`ls-tree`-derived seat set, dir/`report.md` preferred):

```
counter rule (last anywhere VERDICT match) : {"ok":23,"finding":11}
line-anchored last match                    : {"ok":23,"finding":11}
last-line-wins scan                         : {"ok":23,"finding":11}
34 seat files; 2 reports (LabratC1, LabratC2) carry two VERDICT tokens, both same class
```
"23 ok / 11 finding" is robust, and matches the round-37 spot-check's own figure. D2's number is well grounded; only its receipt (`LOG` round-38 section) is missing at REV.

Round-37 receipt precedents worth noting for the new formats the counter demands: `numstat-at-34ed508.txt` has **no header at all** (rows only), and `census-end.txt` is the W04 warnings + `tabi ok` line — i.e. round-38's D5/D6 receipt shapes are new conventions, not continuous with the receipts they cite as precedent.

## 6. Exact kill/falsify surface for each claim

- **C1** is falsified as an instrument (not merely unmet): F1 makes `d6-file` fire at every REV, and F2 makes `namesRev` unsatisfiable. Falsifier commands are in §4. If either defect is repaired in a round-38 counter amendment, re-run the §4 fixture probe; a repaired counter must still refuse `{"exit":1}`-only mutant receipts (F6) and a terse `numstat` body (F8) to be more than a name-check.
- **C2** is falsified as a *measured* capability claim: the counting command has no refusal surface (F5; `--runs 1` yields `binding:true`, exit 0), no counter in the wave reads the receipt, `S144` is absent (F7), and no capability row or knowledge doc exists at REV. The driver's *runtime* facts are true and reproducible (§3).

## 7. Risks / blockers

- Blocker for C1 acceptance: any attempt to "measure" C1 at a REV will emit `d6-file` forever; a lane that reports `predicate=true` for C1 in this round is reporting a reading the frozen bytes cannot produce.
- Blocker for C2 acceptance: no frozen instrument refuses a bad Playwright receipt; the honest evidence receipt is currently *untracked* (`corpus/evidence/round-38/playwright-firefox/receipt.json`, `sha256 dd77b71a…`).
- Residual: `claims.json:baseline`/`frozenAt` both name `98239d0`, which contains none of the claim's evidence and is not the round-start tip (`3f42a5c`). A clean-clone measurement invoked as `--repo <clean clone> --rev <REV>` cannot reconcile this without a written decision.
- No production file was edited, no commit/push made, no git/jj state mutated in the lane. The scratch clone (`/fast/scratch/hyaku/tabi-r38/Executor43/lane-fixture`, toplevel asserted as `…/Executor43/lane-fixture`) and all other scratch were removed after the probes above.
