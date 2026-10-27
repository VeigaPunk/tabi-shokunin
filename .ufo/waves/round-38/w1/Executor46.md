# Executor46 — W1-46

Attack id: `W1-46`. Axis focus: calibration + coverage. One bounded executable verification pass:
Playwright Firefox driver runtime, frozen-counter runtime, receipt shape, counter consistency,
source/census/numstat.

Frozen claim bytes at `a8e7d50c04254bb19f9de08b31ca2aa811fbe7fc` (verified: HEAD was `a8e7d50` when
this seat started; a sibling then landed `3bc0b10`, so every measurement below is taken in a clean
clone pinned to the rev named, never in the mutating worktree).

**Headline:** C1's frozen counter has a structural defect that makes its own predicate unreachable at
*any* rev (D6 path filter, §C1-1). C2's driver/runtime works and reproduces the committed binding
hash, but its countingCommand cannot fail (§C2-2) and its egress zero is unbound to process identity
(§C2-3).

---

## 0. Instrument integrity (passing)

```
$ sha256sum .ufo/waves/round-38/counters/*.mjs scripts/playwright-firefox-loopback-round38.mjs
704da806…  c1-adjacency-sweep-v6.mjs      ← frozenDigests match
209d86a0…  c1-routed-defects.mjs          ← match
6d7a925b…  c2-battery-mutants.mjs         ← match
6a14d8ca…  c2-firefox-bidi-v4.mjs         ← match
4cf3a849…  scripts/playwright-firefox-loopback-round38.mjs ← match
```
All four digests equal `claims.json.frozenDigests`, and `git show a8e7d50:scripts/playwright-firefox-loopback-round38.mjs | sha256sum`
reproduces `4cf3a849…`. `node --check` exit 0 for all four counters and the driver (node v24.21.0).

Instrument *binding* defect: only two of the four frozen digests are named by a claim's
`countingCommand` (`c1-routed-defects.mjs`, the driver). `c1-adjacency-sweep-v6.mjs`,
`c2-firefox-bidi-v4.mjs`, `c2-battery-mutants.mjs` are frozen but claimed by nothing in
`claims.json` (only two claims exist: C1, C2). Nothing in the frozen claim set exercises them.

---

## C1 — calibration

### C1-1 (decisive, reproducible): D6 can never be satisfied → C1 predicate is unreachable

`c1-routed-defects.mjs:213-214`
```js
const list = git(repo, ['ls-tree', '--name-only', REV, '.ufo/waves/round-38/measure/']);
const names = (list.stdout || '').split('\n').filter((n) => /^numstat-at-[0-9a-f]+\.txt$/.test(n) || n === 'numstat.txt');
```
`git ls-tree --name-only <rev> <dir>` prints **repo-relative** paths, so every candidate name is
prefixed with `.ufo/waves/round-38/measure/` and neither the anchored regex nor the bare
`numstat.txt` comparison can match. `names` is therefore always empty and `F('d6-file', …)` always
fires.

Executable proof (scratch clone, commits made only inside `/fast/scratch/…`, toplevel asserted):

```
$ git ls-tree --name-only 9e6e30c .ufo/waves/round-38/measure/
.ufo/waves/round-38/measure/numstat-at-3bc0b108.txt      ← receipt IS committed
$ node c1-routed-defects.mjs --rev 9e6e30c --repo <clone> --json
d6= {}   d6 findings= [{"id":"d6-file","why":"no numstat receipt under .ufo/waves/round-38/measure"}]

$ # fallback name, full 40-hex baseline/rev inside, committed:
$ node c1-routed-defects.mjs --rev 55b14c98bb76… --repo <clone>
FINDING d6-file no numstat receipt under .ufo/waves/round-38/measure      EXIT=1
```

Consequence: the D6 term of the frozen predicate (`… AND D6 window endpoints == baseline..REV`) is
permanently false, so `C1_ROUTED_DEFECTS predicate=met` cannot be produced by any REV, receipts
included. The claim's positive leg is unfalsifiable-by-pass; its killRule ("absent source receipt")
is satisfied forever for the wrong reason. Falsifier of this finding: any rev at which the frozen
counter prints `d6.file` non-null / omits `d6-file`. None can exist without editing the counter.

Runtime at the two revs measured (this is why the tip's 12 findings still include `d6-file`):

```
$ node …/c1-routed-defects.mjs --rev a8e7d50… --repo <clean clone>
… findings=14  EXIT=1        (d1-correction, d1-results, d2-stated, 6×d3-hash, d3-freeze-landing,
                              d4-lesson, d4-receipt, d5-receipt, d6-file)
$ node …/c1-routed-defects.mjs --rev 3bc0b10… --repo <clean clone>
… findings=12  EXIT=1        (d1-results, 6×d3-hash, d3-freeze-landing, d4-m3, d4-receipt,
                              d5-receipt, d6-file)
```

### C1-2: D6 is a substring check, not a measurement (would still be weak if C1-1 were fixed)

`c1-routed-defects.mjs:213-222` (blob at `:217`, window tests at `:219-221`) only asks whether the receipt text contains `BASELINE.slice(0,40)`
or `slice(0,12)`, and `REV.slice(0,8)` or `REV`. It never runs `git diff --numstat`. A receipt whose
header names both endpoints but whose numbers describe an unrelated window passes. Measured real
window for comparison: `git diff --numstat 3f42a5c… 3bc0b10 | wc -l` → `12`;
`git diff --stat` tail → `12 files changed, 2379 insertions(+)`.

### C1-3: claims.json `baseline` contradicts the counter's frozen baseline

- `claims.json:6` → `"baseline": "98239d0396ff32c3feb14638b3214fe688e8b122"`
- `claims.json:5` → `"frozenAt": "98239d0396ff32c3feb14638b3214fe688e8b122"`
- `c1-routed-defects.mjs:52` → `const BASELINE = '3f42a5c7cc19a544c879577e4bad7b7fd9d61a35'`

`98239d0` is *inside* round 38 ("round-38: add frozen-instrument candidates and Firefox driver");
`3f42a5c` is the round-37 verifier spot-check commit the LOG round-38 section itself calls
"Round-start baseline". A receipt generated to match the claims' stated baseline would name
`98239d0…` and fail D6's intent; the receipt that satisfies the counter names a baseline the claims
do not state. Also `frozenAt` names `98239d0` although `git log --diff-filter=A -- .ufo/waves/round-38/claims.json`
→ `a8e7d50 round-38: freeze calibration and Firefox capability claims`: the freeze commit is not the
value frozen in the file.

### C1-4: predicate sentence byte-identity claimed by the counter is false

Counter header, `c1-routed-defects.mjs:42`: "Predicate (frozen) — the same sentence in claims.json and
the receipt's predicateSentence field". Measured:

```
claims.json C1.predicate  len=82   "D1-D6 all re-derived and corrected at REV by c1-routed-defects.mjs; predicate true"
counter PREDICATE_SENTENCE len=311 "D1 stale-line-present AND … AND D6 window endpoints == baseline..REV"
equal=false
```
No receipt is written at all (counter writes stdout only), so the "receipt's predicateSentence field"
is unimplemented too. The claims-side predicate carries no numbers, so C1's own killRule ("Any stated
number differs from counter-derived evidence") has nothing on the claims side to bind.

### C1-5: header/code mismatch on where D5/D6 receipts are read

`c1-routed-defects.mjs:39`: "D5/D6 receipt files are read at --repo's worktree (they are committed
measurement outputs, not git-object data)". Code reads `blob(repo, REV, path)` = `git show REV:path`
(D5 `:181`, D6 `:217`). A receipt present only in the worktree (uncommitted) is invisible; the
comment tells the next operator the opposite.

### C1-6: `slice(indexOf(...))` degrades to a one-character window

`c1-routed-defects.mjs:108,144`: `log.slice(log.indexOf('## Round 38'))`. With no round-38 section,
`indexOf` is `-1`, so `slice(-1)` yields the **last character** of LOG.md:
```
indexOf= -1  slice= "2"  len= 1
```
No false pass is reachable (no hash or `34ed508c` fits in one char), but the emitted reason is
misattributed ("does not record the freeze entry landing at 34ed508c") while the truth is "there is
no round-38 section at this rev" — as at `a8e7d50`, where `grep -n '^## Round 38' LOG.md` returns
nothing (LOG.md's last section heading is `## Round 37 …`).

### C1-7: D2 term verified sound, and now satisfied at the tip (passing control)

```
--rev a8e7d50          → FINDING d2-stated (LOG had no round-38 section); summary line still
                          "tally=23/11", i.e. the recompute itself succeeded from 34 committed reports
--rev 3bc0b10 --json   → d2.stated {ok:23,finding:11}; d2.recomputed {ok:23,finding:11,error:0,none:0,
                          reports:34}; bySeat keys=34; no d2-* finding
```
The recompute reads 34 distinct committed `VERDICT` lines, so it is not tautological with the LOG
text. At `a8e7d50` D2 fails only because the LOG round-38 section did not exist yet; it landed in
`3bc0b10`. Baselines control behaves: counter at `3f42a5c` and at `98239d0` both exit 1 with 14
findings (F('d5-receipt')/F('d6-file') included) — the counter is not trivially true at old revs.

### C1-8: D1's seats input is uncommitted (`d1-results` at every rev measured)

```
$ git cat-file -e a8e7d50:.ufo/waves/round-37/w1-results.json
fatal: path … does not exist in 'a8e7d50'                                  exit=128
$ node -e 'require("…/.ufo/waves/round-37/w1-results.json").seats'  → 34   (worktree, untracked: "?? …w1-results.json")
$ git check-ignore -v .ufo/waves/round-37/w1-results.json           → not ignored
```
D1 is therefore achievable but not yet achieved, and it depends on a file the wave has so far left
untracked; if it is never committed, D1 keeps C1 false independently of C1-1.

### C1-9: D4 term vs the actually committed lesson text (`a8e7d50` → `d4-lesson`; tip → `d4-m3`)

At the tip `corpus/lessons/round-38.md` §Mistakes carries the string `Captured-by: none at round 37`
inside the M1 bullet. The frozen predicate needs a row where `captured-by:` names round-37's **M3**
class and `surface-mismatch`: `grep -i 'surface-mismatch'` finds no match in the committed lesson, so
`d4-m3` fires. The lesson's M1 bullet records the *overclaim* class, not M3 — i.e. the calibration
narrative and the frozen counter disagree about which class was captured.

### C1-10: census receipt cited by the lesson does not exist; census counts move under S144

`corpus/lessons/round-38.md` §Census (committed at `3bc0b10`): "Round-end validation returned exit 0
and `tabi ok`; captured output at `.ufo/waves/round-38/measure/census-end.txt`".
```
$ ls -la .ufo/waves/round-38/measure/ .ufo/waves/round-38/baseline/
total 0   (both empty — no census-end.txt, no m3-sentence-mutant.json)
```
The citation is to a file that does not exist; the same gap produces `d5-receipt` and `d4-receipt`.
Row-count drift to watch: `corpus/SOURCES.md` rows at `a8e7d50` = **143** (S143 last), at `3bc0b10` =
**144** (S144 added). A census receipt written from the round-start run (143) will fail D5 at any
rev that includes S144; D5's own parse at `3bc0b10` is 144 rows. Column mapping verified correct
(`c[4]`=tier, `c[8]`=status against the header `| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |`).

### C1-11: sanity checks that passed

- `c2-battery-mutants.mjs` runs green against the frozen bidi counter, digest stable:
  `{"verdict":"pass", sha256Before=sha256After=6a14d8ca…, m5 killed, m5b killed, m3 classified, decoy clean, restored:true}`, exit 0.
  All three mutation target strings exist verbatim (lines 541, 541, 356).
- Counter `--repo` default (`dirname(import.meta.url)/../../../..`) resolves to the lane root; `--rev`
  resolves via `rev-parse --verify <rev>^{commit}`; unknown args exit 2 (Refusal path).

---

## C2 — coverage

### C2-1 (evidence, passing): independent rerun reproduces the committed receipt

```
$ HYAKU_SCRATCH=<scratch> node scripts/playwright-firefox-loopback-round38.mjs \
      --out receipt-run.json --runs 2
{"runs":2,"binding":true,"egress":0,"survivors":0,
 "firstShot":["3e0c070a75f041986f63792a036addf08f0915b79713fd655499c601ec56378c",
              "3e0c070a75f041986f63792a036addf08f0915b79713fd655499c601ec56378c"]}   EXIT=0
```
Same first-shot SHA256 as the committed receipt `corpus/evidence/round-38/playwright-firefox/receipt.json`
at a different time, different stack ports (35969 / 44829 in my run) and different PIDs. Per-run steps
present and green in both runs: `navigate.hydrated` (210/215 ms), `title` = `TABI-R38 fixture`,
`shape` static/hydrated/0 items, `screenshot.first` 20626 B, `click.effect` count=1 items=1
confirm="confirmed 1", `screenshot.after-click` differs, `evaluate` innerWidth=800, `history.traverse`
back to `/a.html`, `history-reset-and-click` countBefore "0" → "1" (click is real, not vacuous),
`console.quiet` 0 errors. Requests per run = 3, all `http://127.0.0.1:<port>/…` (0 non-loopback).
Host: Playwright 1.64.0, `browserVersion` "157.0", `firefox-1555` binary present.

### C2-2: the countingCommand cannot fail — no refusal, no consumer

`main()` (`scripts/playwright-firefox-loopback-round38.mjs:146-169`) writes the receipt and prints a
summary; the only `process.exit` calls are the usage error (64) and an uncaught throw (1). Nothing
gates on `binding`, `egressNonLoopback` or `survivors`. Executable proof with a scratch copy (lane
file untouched) where run 2 sets `#static` to `UNBOUND-MARKER` before the first screenshot:

```
{"runs":2,"binding":false,"egress":0,"survivors":0,
 "firstShot":["3e0c070a…78c","ff05db92…d75"]}                                   EXIT=0
```
A run that violates C2's predicate (differing first-shot hashes) exits 0. `grep -rn 'tabi-pw-firefox-receipt-v1|playwright-firefox/receipt.json'` finds only the driver itself: **no counter or verifier
consumes the receipt**, so the predicate clause "click/navigation/evaluation evidence verified" has no
executing owner. Falsifier of this finding: a committed checker that exits non-zero on
`binding!==true`, `egressNonLoopback!==0`, `survivors!==0`, or that re-derives the receipt fields.

### C2-3: the "zero non-loopback sockets" zero is unbound to the browser process

`rec.firefoxPids` comes from one immediate global `ps … | grep 'firefox-1555/firefox/firefox'`
(`:74`), and the sampler filters `ss -tnp` with `pid=(${pids.join('|')})` (`:79`). With an empty PID
set the filter becomes `pid=(),`, which matches nothing. Executable proof with a scratch copy (PID
capture neutered, lane file untouched):

```
run1 pids [] egress {"samples":2,"nonLoopback":0,"lines":0} survivors 0 portClosed true
run2 pids [] egress {"samples":2,"nonLoopback":0,"lines":0} survivors 0 portClosed true
→ receipt egressNonLoopback 0, survivors 0, binding true, EXIT=0
```
So `egressNonLoopback: 0` is emitted both when the detector saw the browser's sockets and when it saw
nothing at all; the honest runs only evidence a sparse observation (`samples: 2`, `lines: 2` and `1`).
The `FIREFOX_BIN` constant (`:24`) is never used to launch; the launch is unqualified
`firefox.launch()` (`:73`), so a Playwright cache rev change silently empties both PID greps and the
survivor/egress zeros.

### C2-4: receipt shape defects

`receipt.json` (committed): `firefoxVersion: null` — declared at `:157` and never populated; the only
identity is `browserVersion` from `probe.version()` (`:159`). No Juggler/protocol identity and no
browser build path/rev field, although the claim's surface names "via Juggler". Step
`http.witnessed {requests: 6}` (`:128`) counts `rec.httpLog.length`, i.e. requests **plus** responses
(3+3) — the label overstates request count by 2×. Post-`goBack` the page is read with
`status: "booting"` (hydration not re-waited), so that step's `status` field evidences the timer, not
hydration.

### C2-5: source row S144 is absent at the frozen claim commit, present at the tip

```
$ git show a8e7d50:corpus/SOURCES.md | grep -c 'S144'   → 0        (143 rows, last S143)
$ git show 3bc0b10:corpus/SOURCES.md | grep -c 'S144'   → 1        (144 rows)
$ git cat-file -e a8e7d50:corpus/knowledge/playwright-firefox-loopback-round-38.md → ABSENT
```
At `a8e7d50` C2's killRule ("no cited newly opened source row") fired; `3bc0b10` closes it: S144
(`docs`, tier `A`, status `mined`, opened 2026-10-27, used-by the round-38 knowledge note) plus a
knowledge note citing `source: S144`. The claim wording "citing opened S144" maps to SOURCES.md's
`opened` date column; the registry *status* is `mined`, which is consistent, not a discrepancy.

---

## What would falsify each live finding

| Finding | Falsifier |
|---|---|
| C1-1 D6 unreachable | a rev where the frozen counter omits `d6-file`; I claim none exists because `names` is always empty by prefix |
| C1-2 D6 substring-only | a code path in the counter that re-derives `git diff --numstat` and compares numbers |
| C1-3 baseline drift | `claims.json.baseline == counter.BASELINE` (3f42a5c…) or a documented reason the claims baseline is not the measurement window |
| C1-4 predicate mismatch | a receipt field `predicateSentence` equal to both, or claims text equal to the 311-char sentence |
| C1-5 worktree claim | code reading the receipt from the filesystem rather than `git show REV:path` |
| C1-6 slice(-1) | `indexOf` result guarded (`< 0` → "absent" finding) |
| C1-9 M3 row | a committed `## Mistakes` row whose `Captured-by:` names M3/`surface-mismatch` for round 37 |
| C1-10 census citation | `measure/census-end.txt` committed with counts equal to a fresh parse (144 rows at a rev containing S144) |
| C2-2 no refusal | a committed checker that fails on binding/egress/survivor violations |
| C2-3 vacuous zero | a PID source bound to the launched browser plus a `pids.length > 0` / `lines > 0` assertion |
| C2-4 receipt shape | `firefoxVersion` populated from the actual launched binary, Juggler identity recorded, `requests` counted from request events only |

## Residuals / scope

- I did not run the live leg of `c2-firefox-bidi-v4.mjs` (round-35 BiDi evidence, geckodriver) — it is
  not bound by any claim in `claims.json` (see §0) and requires the round-35 evidence path.
- The lane worktree moved under this seat (`a8e7d50` → `3bc0b10`). All rev-pinned numbers above were
  taken in a pinned clean clone; the tip numbers are attributed to `3bc0b10`.
- Tooling: **no installs, no updates, no pacman transactions**. Playwright 1.64.0 (npm global, already
  present) and `firefox-1555` (Playwright cache, already present) were used as installed; driver
  runtime 4.4 s per 2-run pass.
- Scratch `/fast/scratch/hyaku/tabi-r38/Executor46/` was removed after this report was written.
