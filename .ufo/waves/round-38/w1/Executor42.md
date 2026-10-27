# W1-42 — Executor42

Seat: Executor42 · wave round-38/w1 · attempt 1 · attack id **W1-42**
Item: one bounded executable verification of the Playwright Firefox driver and the frozen counters
(focus #2: syntax/runtime, receipt shape, counter consistency, source/census/numstat).
Verdict surface: C1 (calibration, D1–D6) and C2 (coverage capability, Firefox/Juggler).

Lane re-checked while working: HEAD moved **a8e7d50 → 3bc0b10** ("round-38: record Firefox capability
and routed defects") mid-seat. Both REVs are measured below; a8e7d50 is the frozen-claims commit,
3bc0b10 is the current landed tip.

Environment (no installs performed; pacman untouched):
`node v24.21.0`; Playwright `1.64.0` at
`/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/lib/node_modules/playwright`;
Firefox `157.0` at `~/.cache/ms-playwright/firefox-1555/firefox/firefox` (buildID 20261002045259).

---

## A. Frozen instrument bytes — match

```
sha256sum .ufo/waves/round-38/counters/*.mjs scripts/playwright-firefox-loopback-round38.mjs
704da806…53a890bb  counters/c1-adjacency-sweep-v6.mjs
209d86a0…4d57f7    counters/c1-routed-defects.mjs
6d7a925b…91e503c   counters/c2-battery-mutants.mjs
6a14d8ca…40f7ecf   counters/c2-firefox-bidi-v4.mjs
4cf3a849…0e75c1    scripts/playwright-firefox-loopback-round38.mjs
```
All five equal `claims.json.frozenDigests`. Syntax: `node --check` exit 0 on all five.

## B. C2 driver — executable, reproducible, and the committed receipt is honest

Command (my out-dir, not the lane):

```
HYAKU_SCRATCH=/fast/scratch/hyaku/tabi-r38/Executor42 \
  node scripts/playwright-firefox-loopback-round38.mjs --out <scratch>/receipt-attempt.json --runs 2
→ {"wrote":…,"runs":2,"binding":true,"egress":0,"survivors":0,
   "firstShot":["3e0c070a75f041986f63792a036addf08f0915b79713fd655499c601ec56378c",
                "3e0c070a75f041986f63792a036addf08f0915b79713fd655499c601ec56378c"]}   EXIT=0
```

Independent re-run vs committed `corpus/evidence/round-38/playwright-firefox/receipt.json`:
first-shot array **identical** (`match committed: true`), `binding true`, `egress 0`, `survivors 0`,
both runs 11 evidence steps, `portClosed true`, `httpLog` only `http://127.0.0.1:<port>/a.html|b.html`
(6 request/response events per run), click 0→1 with `confirm-1` node, `history.traverse` → `/a.html`,
`evaluate innerWidth 800`. Wire identity confirmed from live process args:

```
709752 …/firefox-1555/firefox/firefox -no-remote -headless -profile /tmp/playwright_firefoxdev_profile-… -juggler-pipe -silent
browserVersion= 157.0
```
Cleanup: `ls -d /tmp/playwright_firefoxdev_profile-* | wc -l` → `0`; `ls -d /tmp/tabi-r38-pwff-* | wc -l` → `0`.

**C2's executable predicate reproduces.** Kept findings are instrument weaknesses that bound what the
receipt proves, not refutations of the run.

### F8 (medium) — the driver's exit status is not a predicate
Negative control: a scratch copy with one per-load nonce in the fixture
(`document.getElementById('nonce').textContent=String(Math.random()).slice(2,14)`), same invocation:

```
binding= false firstShot= ["45497ac1…","4bc0c54a…"]   NEG_EXIT=0
```
The C2 kill rule ("differing first-shot hashes") is recorded but **not enforced by $?**: a wrapper doing
`node driver.mjs --out r.json && echo pass` accepts a non-binding receipt. Only a reader of `binding`
catches it. Falsifier: driver exiting non-zero (or refusing to write) when `binding !== true`.

### F9 (medium) — pid capture is machine-global, so concurrent runs contaminate each other
Two driver instances launched concurrently in my scratch:

```
A pids [741710,742101,742107,742168]
B pids [741710,742101,742107,742168,742256,742269,742538,742624,742698]
overlap [741710,742101,742107,742168]
```
`rec.firefoxPids` comes from `ps … | grep 'firefox-1555/firefox/firefox'` with no parent/port
filter (driver lines 78–79, 155–157). Consequences: a sibling browser still alive at the survivor
check makes a clean run report `survivors > 0` (false kill), and a sibling's sockets are attributed to
this run's egress sample. Both concurrent runs here still ended `survivors 0` because both closed
before either check. Falsifier: two concurrent runs whose pid sets never intersect.

### F10 (low/medium) — egress observation is two snapshots per run and cannot be distinguished from blind
`runs[].egress = {"samples":2,"nonLoopback":0,"lines":1}` in both the committed receipt and my re-run.
The sampler ticks every 400 ms over a ~0.8 s session and matches `ss -tnp | grep 'pid=(<pids>),'`.
`lines:1` proves the pattern matched at least one socket on this host, so the zero is non-vacuous
*here*; but the receipt has no `sawSocket` guard, so `lines:0` would print the identical
`egressNonLoopback:0`. Falsifier: a page-level non-loopback request retained while the sampler ticks
yet `egressNonLoopback` stays 0.

### F11 (low) — dead receipt fields
`firefoxVersion: null` is never assigned (only `browserVersion` from `probe.version()`), and
`runs[].errors` is never pushed to, so a mid-session error can only surface as a thrown exit, never as
recorded evidence.

## C. C1 counter — 10–12 findings at both REVs, and two terms are unsatisfiable by construction

```
node .ufo/waves/round-38/counters/c1-routed-defects.mjs --rev <REV> --repo <clean clone> --json
```

| REV | predicate | exit | findings |
|---|---|---|---|
| a8e7d50 (frozen claims) | false | 1 | 14 |
| 3bc0b10 (landed tip) | false | 1 | 12 |

**Kept (passes at 3bc0b10):** `d1.stalePresent true`, `d1.supersedingCorrection true`,
`d1.w2Absent true`; `d2.stated {23,11}` == `d2.recomputed {ok:23,finding:11,error:0,none:0,reports:34}`.
Absence is reported as named findings, never silently as a pass. Exit codes match the header (0/1/2).

### F1 (high) — D6 is unsatisfiable: the receipt-name filter can never match
`c1-routed-defects.mjs:225-226`:

```js
const list = git(repo, ['ls-tree', '--name-only', REV, '.ufo/waves/round-38/measure/']);
const names = (list.stdout||'').split('\n').filter((n) => /^numstat-at-[0-9a-f]+\.txt$/.test(n) || n === 'numstat.txt');
```
`git ls-tree --name-only` prints **root-relative** paths. Green control (scratch clone, every D1–D5
artifact satisfied by construction, `git rev-parse --show-toplevel` asserted):

```
ls-tree measure dir: ".ufo/waves/round-38/measure/census-end.txt\n.ufo/waves/round-38/measure/numstat-at-<REV>.txt\n"
names after the counter's own filter: []
counterEXIT 1   predicate false
findings [ { "id": "d6-file", "why": "no numstat receipt under .ufo/waves/round-38/measure" } ]
d5 {"receiptRows":143,"counterRows":143,"counterTier":{"A":127,"B":7,"C":9},…,"receiptStatus":{"mined":119,"queued":15,"rejected":9}}
```
(the fixture is cloned from a8e7d50, where SOURCES.md still has 143 rows; on 3bc0b10 the counter's own
parse is 144 / A=127,B=7,C=9 / mined=119,queued=15,rejected=9 — D5 uses the counter's value, so the
absolute number is not what blocks it.)
D1–D5 all green in that fixture and the predicate is still false, with `d6-file` the sole finding.
No filename satisfies both `^numstat-at-[0-9a-f]+\.txt$` (root-relative path) and `n === 'numstat.txt'`.
Falsifier: any name that survives the filter, i.e. a listing without the directory prefix
(`-r`/`--full-name` refusal, or an `(^|\/)` tolerant regex).

### F2 (high) — D1's `seats == 34` term cannot be met while `w1-results.json` is untracked
`out.d1.seats = JSON.parse(blob(repo, REV, '.ufo/waves/round-37/w1-results.json')).seats`; the file is
`?? .ufo/waves/round-37/w1-results.json` in the worktree and `git ls-files` returns nothing, so at every
REV `d1.seats` is `undefined` and `predicate` requires `=== 34`. Observed `d1` object at 3bc0b10:
`{"stalePresent":true,"supersedingCorrection":true,"w2Absent":true}` — no `seats` key. The same commit's
lesson text says the count must be "re-derived from committed `w1-results.json` (34 seats)": the file is
not committed. Falsifier: commit `.ufo/waves/round-37/w1-results.json` (`{"seats":34}`).

### F3 (high) — D3 demands six hashes that appear nowhere in LOG.md
`grep -c` per required hash in `LOG.md` → **0** for all six, and 0 inside the `## Round 38` section
(`awk '/^## Round 38/{f=1} f' LOG.md | grep -c <h>`). All six do resolve (`cat-file -t` = commit,
`merge-base --is-ancestor` = true), so the defect is purely textual: the round-38 LOG section names
`3f42a5c7` (round-start baseline), `a8e7d50` (claims) and `98239d0` (instrument) but none of
`99437d29 f76da094 34ed508c 5a2ebb6a f485cce1 bf8ecd5a`. Falsifier: append the six to the round-38 section.

### F4 (high) — D4's artifact does not exist and its class token does not match
- `.ufo/waves/round-38/baseline/` is empty at 3bc0b10 and in the worktree; `m3-sentence-mutant.json`
  (the D4 red control) does not exist: `F d4-receipt :: m3-sentence-mutant.json absent`.
- `corpus/lessons/round-38.md` has `## Mistakes` with exactly one row: `M1, class
  `self-assessment-overclaim` … Captured-by: none at round 37`. The counter needs
  `/captured-by:/i && /surface-mismatch/ && /round-37|r37/`; the landed row has no `surface-mismatch`.
  `corpus/lessons/round-37-verifier-spotcheck.md:123` defines the target class as
  "M3 (`surface-mismatch`)", so claim and artifact disagree on both row id (M1 vs M3) and class name.
  Observed: `d4 {"mistakes":true,"capturedBy":false}`.

### F5 (medium) — D5 receipt absent, its citation in the landed lesson is dangling, and the lesson's row count is stale
`git ls-tree -r --name-only 3bc0b10 .ufo/waves/round-38/` lists only `claims.json` + 4 counters — no
`measure/`, no `baseline/`. Yet `corpus/lessons/round-38.md` §Census states "captured output at
`.ufo/waves/round-38/measure/census-end.txt`". That is a stated artifact that exists at no REV and in
no worktree — the exact defect class C1 claims to repair. Its "143 registry rows" is also stale: the
same commit 3bc0b10 adds S144, and `grep -c '^| S[0-9]' corpus/SOURCES.md` → **144** at that commit
(counter parse: `counterTier {"A":127,"B":7,"C":9}`, `mined 119 / queued 15 / rejected 9`). A census
receipt written from the lesson's number fails D5 by one row.

### F6 (medium) — the claim's baseline and the counter's baseline are different commits
`claims.json:5-6` `frozenAt` = `baseline` = `98239d03…`; `c1-routed-defects.mjs:52`
`const BASELINE = '3f42a5c7…'`, which is `98239d0`'s parent, while `LOG.md`'s round-38 section says
"Round-start baseline: `3f42a5c7…`". D6's term "window endpoints == baseline..REV" is therefore checked
against `3f42a5c7` while the claim declares `98239d0`. The two differ by the round-38 instrument commit
itself (`a8e7d50 ← 98239d0 ← 3f42a5c7`), i.e. the window either includes or excludes 100 KB of
instrument bytes depending on which field you read. `frozenAt` also does not name the commit the claims
are frozen at (a8e7d50).

### F7 (low) — the counter's "byte-identical predicate" comment is false against claims.json
`c1-routed-defects.mjs:54` `PREDICATE_SENTENCE` is the long `D1 … AND D6 …` conjunction;
`claims.json:24` `C1.predicate` is `"D1-D6 all re-derived and corrected at REV by c1-routed-defects.mjs;
predicate true"`. The header comment ("one sentence, byte-identical across claims.json, this constant
and the receipt") does not hold for the frozen claim bytes.

## D. Structural observation (not a kill) — no seat in this wave can produce the missing artifacts
`w1-spec.json` has 64 items, roles `{reviewer:15, critic:12, mutation-tester:10, executor:10,
scribe:10, scout:4, connector:3}`, five distinct item templates, all inspection-only ("Return a draft
finding/evidence note only; do not write outside your Report directory"). No seat is chartered to emit
`measure/census-end.txt`, `measure/numstat-at-*.txt`, `baseline/m3-sentence-mutant.json`, the LOG hashes,
or the lesson M3 row. C1's target is therefore reachable only after L1 lands those artifacts — and F1
means D6 stays red even then.

## E. What would make each claim true (exact, minimal)

C1: (1) fix the D6 name filter (F1); (2) commit `.ufo/waves/round-37/w1-results.json` (F2);
(3) append the six hashes to the round-38 LOG section (F3); (4) add a Mistakes row naming
`surface-mismatch` + `Captured-by:` and land `baseline/m3-sentence-mutant.json` with `exit 1|2` (F4);
(5) land `measure/census-end.txt` with `rows: 144`, `A=127,B=7,C=9`, `mined=119,queued=15,rejected=9`
(F5); (6) reconcile `claims.json.baseline` with the counter's `BASELINE` (F6).
C2: predicate already reproduces byte-for-byte; harden by making `binding !== true` a non-zero exit,
scoping pid capture to the launched process tree, and recording `sawSocket`/sample count so egress 0
is not blind-zero (F8–F10).

## F. Risks
- F1/F2 make the C1 predicate unreachable independently of seat quality; a wave that "finds nothing"
  on C1 is not evidence of correction.
- F9 means sibling executors running the driver concurrently (as they are in this wave) can manufacture
  a `survivors > 0` receipt for a clean run; do not treat a concurrent-run survivor count as a kill
  without the pid sets.
- F5's stale 143 will silently fail D5 if a census receipt is generated from the lesson text.

Scratch: `/fast/scratch/hyaku/tabi-r38/Executor42/` (clones, green control, negative control) — removed
before yielding. No lane production file, git/jj state, or external substrate was modified; the only
writes outside scratch are this report.
