# W1-45 — Executor45 — bounded executable verification (C1 counter runtime/consistency, C2 Playwright Firefox driver)

lane: tabi · round 38 · attempt 1 · v2 falsification wave (64 seats)
seat: Executor45 · attack id `W1-45` · focus #1 (syntax/runtime · receipt shape · counter consistency · source/census/numstat)
frozen claims: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-38/claims.json` at `a8e7d50c04254bb19f9de08b31ca2aa811fbe7fc`
measured delivery commit also examined: `3bc0b108708c46c800f9050a1caa25bfe3bf5e5a` (`master` tip, "round-38: record Firefox capability and routed defects"; the lane worktree is detached at `a8e7d50`)
environment: node v24.21.0 · git 2.56.0 · Playwright 1.64.0 · Playwright Firefox build `firefox-1555` (`firefox --version` → `Mozilla Firefox 157.0`)
tool installs: **none** (Playwright, Firefox 157.0 and geckodriver were already present; no pacman transaction, no npm/uv install)
scratch: `/fast/scratch/hyaku/tabi-r38/Executor45/` (fixture clone + probes; removed before yield)
files changed by this seat: this report only.

Verdict summary — C1: **falsified by execution** (frozen predicate is structurally unreachable; the delivery commit evaluates false with 12 findings). C2: **runtime receipt reproduced by an independent run**, but its "counting command" carries no verdict and its survivor/egress terms are global-PID measurements, not per-run ones.

---

## V1 — Frozen-instrument integrity (PASS)

```
$ sha256sum .ufo/waves/round-38/counters/c1-routed-defects.mjs \
    .ufo/waves/round-38/counters/c1-adjacency-sweep-v6.mjs \
    .ufo/waves/round-38/counters/c2-firefox-bidi-v4.mjs \
    .ufo/waves/round-38/counters/c2-battery-mutants.mjs \
    scripts/playwright-firefox-loopback-round38.mjs
209d86a0…149d57f7  c1-routed-defects.mjs
704da806…053a890bb  c1-adjacency-sweep-v6.mjs
6a14d8ca…047fecf  c2-firefox-bidi-v4.mjs
6d7a925b…1e503c  c2-battery-mutants.mjs
4cf3a849…0b02e75c1  playwright-firefox-loopback-round38.mjs
```
All five equal `claims.json.frozenDigests` byte-for-byte. `node --check` on all five → `SYNTAX_OK` (no parse/import-time failure).

## V2 — C2 driver executes and its receipt is reproducible (PASS, exact)

```
$ HYAKU_SCRATCH=/fast/scratch/hyaku/tabi-r38/Executor45/pw \
  node scripts/playwright-firefox-loopback-round38.mjs \
    --out /fast/scratch/hyaku/tabi-r38/Executor45/pw/receipt-exec45.json --runs 2
{"wrote":"…/receipt-exec45.json","runs":2,"binding":true,"egress":0,"survivors":0,
 "firstShot":["3e0c070a75f041986f63792a036addf08f0915b79713fd655499c601ec56378c",
              "3e0c070a75f041986f63792a036addf08f0915b79713fd655499c601ec56378c"]}
DRIVER_EXIT=0
```
The first-shot SHA equals the committed receipt's value (`corpus/evidence/round-38/playwright-firefox/receipt.json`, committed at `3bc0b10`) and the knowledge entry's stated value. Structural diff of my receipt against the committed receipt: identical in every field except ephemeral ones — `serverPort`/URL port, `firefoxPids`, one timing field (`ms` 212 vs 213). Byte length identical (5087 both, minified). All 11 step records present in both runs in both receipts (`navigate.hydrated, title, shape, screenshot.first, click.effect, screenshot.after-click, evaluate, history.traverse, history-reset-and-click, http.witnessed, console.quiet`), 6 http request/response events per run.

`corpus/evidence/round-38/playwright-firefox/receipt.json` and `corpus/knowledge/playwright-firefox-loopback-round-38.md` are **ABSENT at `a8e7d50`** and present at `3bc0b10`; `S144` likewise absent at `a8e7d50`, added by `3bc0b10` (`| S144 | Browsers — Playwright — https://playwright.dev/docs/browsers | docs | A | … | mined | 2026-10-27 | …`). So C2's "cited newly opened source row" term is satisfied **at `3bc0b10`, not at the frozen claims commit**.

## V3 — C2 `survivors` / `egressNonLoopback` are global-process measurements, not per-run (FAIL)

Driver captures PIDs by a global process-table grep, not from the launched browser:

- `scripts/playwright-firefox-loopback-round38.mjs:73` `firefox.launch({ headless: true })`
- `:74` `rec.firefoxPids = ps -eo pid,args | grep 'firefox-1555/firefox/firefox' …`
- `:77-83` sampler runs `ss -tnp | grep -E 'pid=(<that pid list>),'`
- `:138` survivors = same global grep filtered to that captured list

Controlled experiment (scratch): launch an **unrelated** headless Playwright Firefox, keep it alive, then run the lane driver `--runs 1`:

```
decoy pids alive: [709752,710084,…,710779]  decoy version: 157.0
driver exit: 0  stdout: {"runs":1,"binding":true,"egress":0,"survivors":7,
                         "firstShot":["3e0c070a…"]}
run1 captured pids: [709752,710100,710148,710214,710226,710567,711192,712018,712341,712379]
  decoy pids captured by driver: [709752,710100,710148,710214,710226,710567]
  survivors: 7   receipt.survivors: 7
```
The driver attributed six PIDs it never launched to its own run and reported `survivors: 7`, **and still exited 0 with `binding: true`**. Consequences:
1. `survivors: 0` in the committed receipt is not evidence of per-run cleanup — the same code path can report a non-zero value for a foreign process (false positive shown), and symmetrically a child process spawned after the one-shot `ps` snapshot (`:74`) is never counted (false negative, by construction).
2. The same PID set feeds the egress classifier, so `egressNonLoopback` can be polluted by an unrelated Firefox.
3. The driver has no verdict: `:166` writes the receipt, `:169` exits 0 unless an exception is thrown. `claims.json:38` names this driver as C2's `countingCommand`, so the claim's "counting command" cannot return met/not-met.

Sampler scope (probe during a live session, exact same command the driver uses):
```
captured pids: [665532,666066,666115]
ss -tnp  → ["ESTAB 0 0 127.0.0.1:36234 127.0.0.1:42665 users:((\"firefox\",pid=665532,fd=90))"]
ss -unp  → []            (never sampled by the driver)
driver-classified nonLoopback TCP lines: 0
```
So the observation is live (it does see the loopback ESTAB connection) but is TCP-only, `ESTAB`-only, and discrete: `egress.samples: 2` per run in both my receipt and the committed receipt (400 ms interval against a ~1 s session). UDP/DoH/QUIC and short-lived sockets between samples are unobservable by this instrument.

Falsifier that would kill this finding: a driver change that derives PIDs from the `Browser` object and re-samples per run; or a run where a foreign Firefox is alive and `survivors` still reads 0.

## V4 — C1 predicate is false at the only delivery commit (FAIL)

```
$ node .ufo/waves/round-38/counters/c1-routed-defects.mjs \
    --rev 3bc0b108708c46c800f9050a1caa25bfe3bf5e5a --repo <clean clone> --json
EXIT=1
predicate: false   findings: 12
- d1-results      : w1-results.json absent
- d3-hash         : 99437d29 present=false isCommit=true ancestor=true
- d3-hash         : f76da094 present=false isCommit=true ancestor=true
- d3-hash         : 34ed508c present=false isCommit=true ancestor=true
- d3-hash         : 5a2ebb6a present=false isCommit=true ancestor=true
- d3-hash         : f485cce1 present=false isCommit=true ancestor=true
- d3-hash         : bf8ecd5a present=false isCommit=true ancestor=true
- d3-freeze-landing: LOG round-38 section does not record the freeze entry landing at 34ed508c
- d4-m3           : no Mistakes row with captured-by naming round-37 M3 (surface-mismatch)
- d4-receipt      : m3-sentence-mutant.json absent
- d5-receipt      : census-end.txt absent at REV
- d6-file         : no numstat receipt under .ufo/waves/round-38/measure
d1 {"stalePresent":true,"supersedingCorrection":true,"w2Absent":true}
d2 stated {"ok":23,"finding":11} recomputed {"ok":23,"finding":11,"error":0,"none":0,"reports":34}
```
`git ls-tree -r --name-only 3bc0b10 .ufo/waves/round-38/measure .ufo/waves/round-38/baseline` prints **nothing**: both receipt directories are empty at the delivery commit (and at `a8e7d50`). `.ufo/waves/round-37/w1-results.json` exists only as an untracked worktree file (`seats: 34`), so D1's re-derivation has no committed object. LOG/SCORECARD at `3bc0b10` themselves say the claim is unmeasured: "Full frozen-counter and independent wave verdicts remain pending" (LOG, round-38 section) and "result pending integration and frozen measurement" (SCORECARD round-38 block). Only D1's stale-line/superseding-correction, D2's tally (23/11 recomputed exactly from the 34 committed round-37 seat reports), and `d1.w2Absent` are met.

Baseline controls (claim: "baseline control must fail"):
```
--rev 3f42a5c7cc19a544c879577e4bad7b7fd9d61a35 → exit 1
--rev 98239d0396ff32c3feb14638b3214fe688e8b122 → exit 1
```
Both fail as required — but so does the delivery commit, so the control has no discriminating power between "before" and "after".

At the frozen claims commit the counter reports 14 findings (adds `d1-correction`, `d2-stated`, `d4-lesson`). Full JSON retained in scratch during the wave; every id/why above is verbatim counter output.

## V5 — D6 is unreachable: the frozen counter cannot return `true` at any REV (FAIL, decisive)

`counters/c1-routed-defects.mjs:213-222`:
```js
const list = git(repo, ['ls-tree','--name-only',REV,'.ufo/waves/round-38/measure/']);
const names = (list.stdout||'').split('\n').filter((n)=>/^numstat-at-[0-9a-f]+\.txt$/.test(n) || n==='numstat.txt');
…
const text = blob(repo, REV, `.ufo/waves/round-38/measure/${names[0]}`) || '';
```
`git ls-tree --name-only <rev> <dir>/` emits **full repo paths**, not basenames:
```
$ git ls-tree --name-only ff9a1e1 .ufo/waves/round-38/measure/ | cat -A
.ufo/waves/round-38/measure/census-end.txt$
.ufo/waves/round-38/measure/numstat-at-3bc0b10.txt$
```
The anchored `/^numstat-at-[0-9a-f]+\.txt$/` never matches a full path, so `names` is always empty → `F('d6-file')` and `out.d6` stays `{}`. Demonstrated in a scratch fixture clone (asserted toplevel, synthetic commit containing `census-end.txt` with the real counts **and** a `numstat-at-<hex>.txt`):
```
$ node <lane>/counters/c1-routed-defects.mjs --rev ffd9848… --repo ./clone --json
d5 rows: 144 | d6: {} | d6 findings: [{"id":"d6-file","why":"no numstat receipt under .ufo/waves/round-38/measure"}]
```
D5 passes with a committed receipt whose counts equal the counter's own parse of `corpus/SOURCES.md` (rows 144; A128/B7/C9; mined120/queued15/rejected9) — so D5's machinery works and only D6's file discovery is broken. Because the predicate is `… && out.d6.namesBaseline && out.d6.namesRev` (`:233`) and both stay `undefined`, **C1 can never evaluate to `predicate=true`**, no matter what the seats commit. (Second latent bug in the same block, visible only after fixing the filter: `:218` re-prefixes `names[0]` with the directory, so a full path would be double-prefixed to `.ufo/waves/round-38/measure/.ufo/waves/round-38/measure/…` and read as empty.)

Falsifier: any REV at which the frozen counter exits 0. There is none.

## V6 — D6's baseline constant contradicts `claims.json` (FAIL)

- `claims.json:5-6` `frozenAt`/`baseline` = `98239d0396ff32c3feb14638b3214fe688e8b122`
- `counters/c1-routed-defects.mjs:52` `const BASELINE = '3f42a5c7cc19a544c879577e4bad7b7fd9d61a35'`
- `LOG.md` round-38 section (at `3bc0b10`): "Round-start baseline: `3f42a5c7cc19a544c879577e4bad7b7fd9d61a35`"
- `counters/c2-firefox-bidi-v4.mjs:101` `const BASELINE = '2d2c8a77428f9c95c3cd0eb4a3bbf0c6fb4ab684'` (round-34 spot-check)

Three different "baselines" across the round's own artifacts. D6's requirement is `windowRe.test(text)` where `windowRe` is the **full** `3f42a5c…` hash, so a receipt that diffs the claims-declared baseline is rejected. Diagnostic (scratch copy, filter/path fixed only, no other change):
```
receipt naming 3f42a5c7…<REV>  → d6 {"file":"…/numstat-at-3bc0b10.txt","namesBaseline":true,"namesRev":false}
receipt naming 98239d03…<REV>  → d6 {"namesBaseline":false,"namesRev":false}
                                  finding d6-window "receipt names baseline=false rev=false"
```
Falsifier: make `claims.json`'s `baseline` equal the counter constant (or vice versa) and re-run.

## V7 — D6's `namesRev` term is self-referential (FAIL, structural)

`out.d6.namesRev = text.includes(REV.slice(0,8)) || text.includes(REV)` (`:221`) requires a file *committed at* REV to contain REV's own hash. A blob cannot contain the hash of the commit that contains it (the hash is a function of the tree including that blob), so `namesRev` is unsatisfiable as written for any receipt that D6 can also *find* at REV. The lane's own precedent is the opposite convention: `.ufo/waves/round-36/measure/numstat-at-20a69e0.txt` is **ABSENT at** its measured `20a69e0` and was introduced later by `410e91b` ("round-36: lesson, scorecard, log and measured evidence") — i.e., the receipt names an ancestor and lands after it. D6 demands the receipt exist at REV *and* name REV; round-36 works because it satisfies neither half under D6's rule.

Falsifier: a two-part convention made explicit (receipt names baseline..X, committed at Y>X, and D6 checks X), which is not what the frozen counter does.

## V8 — D6 validates only two substrings; the diff body is never checked (FAIL)

After the discovery bug, the entire D6 check is `windowRe.test(text)` + `text.includes(REV…)` (`:219-222`). My fixture receipt body was:

```
numstat 3f42a5c7cc19a544c879577e4bad7b7fd9d61a35..3bc0b108…
1	1	bogus/path/that/does/not/exist.txt
```
and `namesBaseline` evaluated `true`. There is no `git diff --numstat` re-derivation, no endpoint ordering check, no content equivalence check — so "numstat-at-*.txt diffs exactly baseline..REV" (header `:33-35`) overstates the instrument. Any file that mentions the two hashes satisfies it.

## V9 — D5/D6 read REV objects, not the worktree, contradicting the frozen header (FAIL, doc vs code)

Header `:39-40`: "D5/D6 receipt files are read at --repo's worktree (they are committed measurement outputs, not git-object data)". Implementation uses `blob(repo, REV, path)` (`:181`, `:218`). Fixture: census receipt present in the clone's worktree but removed from the index:
```
$ node …/c1-routed-defects.mjs --rev 00d0c61d… --repo ./clone --json
d5 receiptRows: undefined  counterRows: undefined
findings: [{"id":"d5-receipt","why":"census-end.txt absent at REV"}]
```
So a seat following the documented contract (write the receipt in the worktree) is scored as "absent". Concrete consequence for this round: as long as `measure/` is uncommitted, D5/D6 are unsatisfiable; if it is committed, V5/V7 still make them unsatisfiable.

## V10 — Predicate sentences are not the frozen sentence in `claims.json` (FAIL, consistency)

- `claims.json:24` C1 predicate: `D1-D6 all re-derived and corrected at REV by c1-routed-defects.mjs; predicate true`
- `counters/c1-routed-defects.mjs:53` `PREDICATE_SENTENCE` = `D1 stale-line-present AND superseding-correction-present AND … AND D6 window endpoints == baseline..REV`
- counter header `:42-43` asserts "the same sentence in claims.json and the receipt's predicateSentence field"

Both cannot be true. Same class for C2: `claims.json:37` is a prose sentence about two cold runs/screenshot SHA/loopback/click-navigation-evaluation, while `c2-firefox-bidi-v4.mjs:128` states the geckodriver/BiDi predicate `no entry finding AND no receipt finding AND … live.survivors == 0`. The C2 predicate in `claims.json` is **not implemented by any frozen counter**:

```
$ grep -rln 'corpus/evidence/round-38' .ufo/waves/round-38/ --include=*.mjs
(no output)
$ grep -rn 'tabi-pw-firefox-receipt-v1' . | grep -v scripts/playwright-firefox
corpus/knowledge/playwright-firefox-loopback-round-38.md:3, corpus/evidence/round-38/playwright-firefox/receipt.json:2
```
Nothing re-derives the Playwright receipt: no schema check, no "two cold runs" check, no step-presence check, no click/navigation/evaluation verification. That is the round-37 finding (`RevFrozenDigests`: "the frozen C1 predicate sentence is not identical to the counter's stricter header/implementation") recurring one round later, now with C2 added.

## V11 — Receipt-shape defect: `firefoxVersion` is always `null` (FAIL, minor)

`scripts/playwright-firefox-loopback-round38.mjs:157` initialises `firefoxVersion: null`; `:159` sets only `browserVersion = probe.version()`. Every receipt (mine and the committed one) therefore has `firefoxVersion: null`, `browserVersion: "157.0"`. The claimed surface "Playwright 1.64.0 + Firefox 157.0" is independently true — `/home/vgpnk/.cache/ms-playwright/firefox-1555/firefox/firefox --version` → `Mozilla Firefox 157.0`, Playwright `package.json` version `1.64.0` — but the receipt field named for that fact is dead. `FIREFOX_BIN` (`:24`) is declared and never passed to `firefox.launch()` (`:73`), so the runs are not bound to that path.

## V12 — C2 mutation battery (PASS, non-regression only)

```
$ HYAKU_SCRATCH=… node .ufo/waves/round-38/counters/c2-battery-mutants.mjs
{"mutants":{"m5":{"status":1,"clean":false,"p1Refused":false},
            "m5b":{"status":1,"clean":false,"p1Refused":false},
            "m3":{"status":0,"clean":true,"p1Refused":true},
            "decoy":{"status":0,"clean":true,"p1Refused":true}},
 "expectations":{"m5_killed":true,"m5b_killed":true,"m3_classified":true,"decoy_clean":true,"restored":true},
 "verdict":"pass"}
BATTERY_EXIT=0
```
`sha256Before == sha256After == 6a14d8ca…`. Note what this does **not** cover: the battery mutates the **BiDi/geckodriver** counter, which no round-38 claim uses. `m3` survives by design ("live-leg-only"), so the battery provides no mutation evidence for the Playwright/Juggler capability at all — a mutant that zeroes `rec.survivors` in `scripts/playwright-firefox-loopback-round38.mjs:138` would leave the battery verdict `pass`.

---

## Findings ranked by force (what would falsify the claim)

| # | Claim | Finding | Evidence | What would kill it |
|---|---|---|---|---|
| F1 | C1 | Frozen predicate unreachable at any REV (D6 discovery regex vs `ls-tree` full paths; `out.d6` always `{}`) | V5, exit 1 with a fully provisioned `measure/` | any REV giving exit 0 |
| F2 | C1 | Predicate false at the delivery commit `3bc0b10`: 12 findings, missing `w1-results.json`, 6 LOG hashes, freeze-landing, M3 captured-by, mutant receipt, census, numstat | V4 | commit those artifacts and get exit 0 — impossible per F1 until D6 is repaired |
| F3 | C1 | D6 baseline constant (`3f42a5c`) ≠ `claims.json` baseline (`98239d0`) ≠ c2 baseline (`2d2c8a7`) | V6 | unify the values |
| F4 | C1 | D6 `namesRev` self-referential; contradicts round-36 precedent (`numstat-at-20a69e0.txt` absent at `20a69e0`) | V7 | a receipt that names its own containing commit |
| F5 | C1 | D5/D6 header says worktree, code reads REV objects | V9 | a worktree-only receipt that D5 accepts |
| F6 | C1/C2 | frozen predicate sentence in `claims.json` ≠ counter `PREDICATE_SENTENCE`; C2's predicate has no implementing counter | V10 | byte-identical sentences and a counter reading `corpus/evidence/round-38/…/receipt.json` |
| F7 | C2 | `survivors`/`egressNonLoopback` are global-PID measurements; foreign browser produced `survivors: 7` and exit 0 | V3 | PID derivation from the launched browser |
| F8 | C2 | `countingCommand` cannot return a verdict (driver always exits 0); no assertion on binding/egress/survivors | V3 `:166,:169` | nonzero exit when any predicate term fails |
| F9 | C2 | Egress observation is TCP/`ESTAB`-only and n=2 samples per ~1 s run | V3 probe (`ss -unp` empty; `samples: 2`) | continuous/`-a`/UDP sampling with a stated coverage window |
| F10 | C2 | Receipt `firefoxVersion` always `null`; `FIREFOX_BIN` unused | V11 | populate and pass the executable path |

Load-bearing confirmations (do not over-read the above as blanket refutation): the C2 runtime receipt **is** reproducible — identical first-shot SHA `3e0c070a…` across two cold runs, identical step/event structure, 0 sampled non-loopback sockets; `S144` is genuinely opened and cited at `3bc0b10`; D2's 23 ok / 11 finding tally re-derives exactly from the 34 committed round-37 reports; C1's baseline controls do fail as required. C1's failure is therefore an **instrument** failure (D6 structurally dead + receipts uncommitted), not a data-cooking failure.

## Risks / limits of this seat's evidence

- The delivery commit I measured as "the round's implementation" is `master` tip `3bc0b10`; the lane worktree is detached at `a8e7d50`. A later integration commit could add the receipts, but F1 (D6 unreachable) and F6/F7 (no verdict instrument for C2) are properties of the frozen bytes and cannot be fixed by adding data.
- My D6 diagnostics ran on a scratch **copy** of the frozen counter with only the discovery/path lines changed; no lane file was modified. The unpatched counter's behaviour is what F1 reports.
- The decoy experiment ran while other seats were also driving Firefox on this host; the point is the attribution defect itself (a captured PID the driver never launched), which the run demonstrates directly (`decoy pids captured by driver: [...]`, `survivors: 7`, exit 0).
- Scratch `/fast/scratch/hyaku/tabi-r38/Executor45/` has been removed; the fixture clone was asserted (`git rev-parse --show-toplevel` → `/fast/scratch/hyaku/tabi-r38/Executor45/clone`) before any commit, and no lane/fleet repo, PATH directory, or shared substrate was touched.
