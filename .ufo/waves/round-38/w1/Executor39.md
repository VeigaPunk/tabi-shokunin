# Executor39 — W1-39 (round 38, attempt 1)

Axes attacked: **calibration** (C1), **coverage** (C2).
Item: one bounded executable verification of the Playwright Firefox driver and the frozen counters —
focus #3: syntax/runtime, receipt shape, counter consistency, source/census/numstat.
No lane production file, no commit, no git/jj mutation, no spawn. Scratch:
`/fast/scratch/hyaku/tabi-r38/Executor39` (removed at end; a throwaway clone there was used only as a
fixture to commit synthetic receipts and prove counter behaviour — never the lane).
Tooling: no install this wave. Used existing `node v24.21.0`,
`playwright@1.64.0` (npm global), `~/.cache/ms-playwright/firefox-1555`. No pacman.

Lane state read during the window: `a8e7d50` (frozen claims) → `3bc0b108` ("round-38: record Firefox
capability and routed defects") landed while this seat was measuring. Both are reported separately.

---

## 0. Verified positives (these survive)

**P1 — frozen instrument digests are exact.** All five files in `claims.json.frozenDigests` hash to the
stated value, in the worktree, at `a8e7d50`, and at `3bc0b108`:

```
209d86a0…d57f7  .ufo/waves/round-38/counters/c1-routed-defects.mjs
704da806…90bb   .ufo/waves/round-38/counters/c1-adjacency-sweep-v6.mjs
6a14d8ca…6fecf  .ufo/waves/round-38/counters/c2-firefox-bidi-v4.mjs
6d7a925b…503c   .ufo/waves/round-38/counters/c2-battery-mutants.mjs
4cf3a849…75c1   scripts/playwright-firefox-loopback-round38.mjs
```
`git diff --name-only a8e7d50 3bc0b108 -- .ufo/waves/round-38/claims.json` → empty: claims bytes are
still frozen.

**P2 — syntax clean.** `node --check` exit 0 for all five instruments.

**P3 — counter exit-code contract holds.** `--rev deadbeef` → exit 2 `C1_ROUTED_DEFECTS
verdict=could-not-evaluate detail=cannot resolve deadbeef`; `--bogus` → exit 2 `unknown argument
--bogus`; no `--rev` → exit 2 `usage: --rev <40-hex REV> required`; driver without `--out` → exit 64
`usage: --out <receipt.json> [--runs N]`.

**P4 — the Firefox driver reproduces.** Two independent invocations × `--runs 2` (4 cold-ish runs):

```
node scripts/playwright-firefox-loopback-round38.mjs --out …/receipt-39.json  --runs 2
{"runs":2,"binding":true,"egress":0,"survivors":0,
 "firstShot":["3e0c070a75f041986f63792a036addf08f0915b79713fd655499c601ec56378c", "3e0c070a75f041986f63792a036addf08f0915b79713fd655499c601ec56378c"]}
```
Second invocation returned the same two hashes. The committed receipt
`corpus/evidence/round-38/playwright-firefox/receipt.json` is structurally identical to my run after
dropping volatile fields (`serverPort`, `httpLog`, `firefoxPids`, event URLs): same 11 steps, same
`click.effect {count:"1",items:1,confirm:"confirmed 1"}`, same first-shot bytes `20626`, same sha
`3e0c070a…`, same `egress {samples:2,nonLoopback:0,lines:1}`, same `survivors 0`, same
`fixture.sha256 0057709b…`. Playwright 1.64.0, `browserVersion 157.0` as claimed.

**P5 — the egress detector has real true-positive power** (so "0 non-loopback" is not a dead detector).
Held a page connection to the host's LAN address (`192.168.0.253`) for 1.5 s with the driver's exact
sampler: `nonLoopback: 24` over 24 samples, `lines: 1`
(`ESTAB 127.0.0.1→…`-style predicate correctly classified `192.168.0.253` peers as non-loopback).

**P6 — the D5 census parse is consistent with independent parsing.** At `3bc0b108`,
`git show HEAD:corpus/SOURCES.md` parses to 144 rows, tier `A=128 B=7 C=9`, status
`mined=120 queued=15 rejected=9`; the fleet parser agrees exactly:
`scripts/sources-census.sh census --root … tabi` → `tabi rows 144 / tier.A 128 / tier.B 7 / tier.C 9 /
status.mined 120 / status.queued 15 / status.rejected 9` (validate: exit 0, `tabi ok`). A synthetic
receipt in the counter's documented shape (`rows: 143` / `tier: A=127 B=7 C=9` / `status: mined=119
queued=15 rejected=9`) satisfies D5 against `a8e7d50` (`d5` findings: none).

---

## 1. C1 — calibration: the predicate is **unreachable**, not merely unmet

`node .ufo/waves/round-38/counters/c1-routed-defects.mjs --rev <REV> --repo <clone> --json`

| REV | exit | predicate | findings |
|---|---|---|---|
| `a8e7d50` (frozen claims) | **1** | false | **14** |
| `98239d0` (claims-declared baseline) | 1 | false | 14 |
| `3f42a5c7` (counter's own `BASELINE`, line 52) | 1 | false | 14 |
| `3bc0b108` (lane HEAD at measure time) | **1** | false | **12** |

At `a8e7d50` (the only REV the claim names) D1/D4/D5/D6 have no evidence file in the tree at all:
`d1-correction, d1-results, d2-stated, d3-hash ×6, d3-freeze-landing, d4-lesson, d4-receipt, d5-receipt,
d6-file`. `git log --all -- .ufo/waves/round-38/measure` → 0 commits; same for `…/baseline` (still true
at `3bc0b108`). **C1 is false at the frozen REV by construction of the wave's own ordering.**

### F1 — D6 can never pass (counter bug, proven)
`c1-routed-defects.mjs:213-215`:
```js
const list = git(repo, ['ls-tree', '--name-only', REV, '.ufo/waves/round-38/measure/']);
const names = (list.stdout||'').split('\n').filter((n) => /^numstat-at-[0-9a-f]+\.txt$/.test(n) || n === 'numstat.txt');
if (!names.length) { F('d6-file', 'no numstat receipt under .ufo/waves/round-38/measure'); }
```
`git ls-tree` prints **repo-relative full paths**, so the anchored `^numstat-at-…` regex cannot match.
Isolated proof in my scratch clone (branch from `a8e7d50`, one commit adding *only*
`.ufo/waves/round-38/measure/numstat-at-a8e7d50.txt`):
```
file committed: .ufo/waves/round-38/measure/numstat-at-a8e7d50.txt
counter ls-tree view: .ufo/waves/round-38/measure/numstat-at-a8e7d50.txt
d6 fields: {}
d6 findings: [{'id':'d6-file','why':'no numstat receipt under .ufo/waves/round-38/measure'}]
predicate False
```
No numstat receipt — correct or not, honest or stale — can clear D6. **C1's predicate is unreachable
by any evidence.** Falsifier: a run in which the file exists and `d6-file` is absent.

### F2 — D1's source was never committed (claim's "absent source receipt" kill rule fires)
`blob(repo, REV, '.ufo/waves/round-37/w1-results.json')` (line 90) → null at every REV:
`git log --all --oneline -- .ufo/waves/round-37/w1-results.json` → **0 commits**;
`git cat-file -e HEAD:.ufo/waves/round-37/w1-results.json` → *exists on disk, but not in 'HEAD'*;
`git status --porcelain` → `?? .ufo/waves/round-37/w1-results.json`. The file *does* carry `seats: 34`
(untracked bytes), but the counter only reads committed blobs, so `d1.seats === 34` (line 228) is
underivable from git. Falsifier: any REV containing that path.

### F3 — the round-38 correction repeats the defect class it corrects
`SCORECARD.md:2102` (at `3bc0b108`): *"The committed round-37 result object records 34 w1 seats."*
By F2 that object is not committed and never has been. The **number is right** — D2 recomputes
23 ok / 11 finding over 34 committed seat reports — but the *citation* is false, i.e. exactly the
round-37 D1 class (prose asserting committed evidence that isn't).

### F4 — D3's hash check is unsatisfiable under the lane's hash convention
Line 150 requires the **full 40-hex** hash to appear in the LOG round-38 slice; the lane's LOG cites
8-char hashes (`LOG.md:2527` "`3f42a5c7…`", "`a8e7d50c…`", "`98239d03…`"). At `3bc0b108` all six are
`presentInR38Section: false` while `isCommit: true, ancestorOfRev: true`. The same block (line 153)
requires the **short** string `34ed508c` for the freeze-entry landing — one check demands full hashes,
the neighbouring check demands the short form, and `LOG.md:2525-2531` contains neither `34ed508c` nor
any full hash. Falsifier: LOG round-38 carrying all six 40-char hashes *and* `34ed508c`.

### F5 — D5's receipt format is incompatible with what the census tool emits
The counter needs `rows: N`, `tier: A=… B=…`, `status: …` (`c1-routed-defects.mjs:184-200`). The fleet
parser's actual output has no `rows:` token at all:
```
scripts/sources-census.sh validate --root … tabi
tabi  W04  S098 duplicate url …        (20 warning lines)
tabi  ok   /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md     EXIT=0
```
So `corpus/lessons/round-38.md:15` — "captured output at `.ufo/waves/round-38/measure/census-end.txt`" —
cannot satisfy D5 as written; only a bespoke, counter-shaped receipt can. That file also **does not
exist** at `3bc0b108` (`d5-receipt` finding), so the lesson cites an absent artifact. And the lesson's
stated "143 registry rows" is already stale: the registry at `3bc0b108` has **144** rows (S144 added
this round), and the census prints 144 — a D5-satisfying receipt must say 144, contradicting the prose.
Falsifier: a committed `census-end.txt` that is both the tool's captured output and passes D5.

### F6 — D4 accepts a bare assertion (no replay binding)
`c1-routed-defects.mjs:173` — `d.exit === 1 || … || d.refused === true || d.killed === true` — so
`{"exit":1,"refused":true}` alone clears `d4.mutantRefused` (verified in the scratch clone: `d4-receipt`
finding disappears). No command, no stderr, no mutated sentence, no predicate hash is required, so the
"red control" cannot distinguish a refusal from a typed-in boolean. Separately `d4-m3` is unmet at
`3bc0b108`: `corpus/lessons/round-38.md` carries only **M1** (`class self-assessment-overclaim`,
"Captured-by: none"), no `surface-mismatch`/M3 row.

### F7 — latent predicate weakness in D5 (not currently exploitable)
Line 232 is `out.d5.receiptRows === out.d5.counterRows`; when `census-end.txt` is absent both sides are
`undefined`, so the clause evaluates **true**, not false (observed: `d5 {}` at `3bc0b108`). It is masked
only by the global `out.findings.length === 0` gate. A refactor that drops that gate makes D5
vacuous-pass. Falsifier of the concern: a test where D5's clause alone decides.

### C1 verdict
`predicate false` at `a8e7d50` (14 findings), at both control baselines, and at `3bc0b108` (12
findings). Baseline control correctly fails, so that half of the target holds — but "predicate true at
measured REV" is blocked by F1 (structural), F2 (absent committed source), F4 (hash-format convention)
and F5 (receipt-format/tool mismatch), while F3/F6 mean the remaining checks would accept prose and
booleans as evidence.

---

## 2. C2 — coverage: predicate elements reproduce, but two of its metrics are not run-scoped

### Reproduced
Two runs, identical first-shot sha, all page requests loopback, 0 non-loopback socket observations, 0
survivors, click/navigation/evaluate evidence present (P4). Every request URL in both runs:
`http://127.0.0.1:<port>/a.html`, `/b.html`, `/a.html` — non-loopback request count **0** (my parsing
of the receipt's `events`, see F9).

### F8 — "zero survivors" is host-global and race-prone under 64 seats (proven false positive)
`scripts/playwright-firefox-loopback-round38.mjs:74` snapshots **every** `firefox-1555/firefox/firefox`
pid on the host at launch; lines 138-139 then count any of those pids still alive as *this run's*
survivors. Deterministic probe (sibling browser already alive, then my launch, then close mine):
```
mySnapshotLen: 8
siblingPidsInMySnapshot: [787219, 787657, 787703, 787796, 787806]
survivorsAsDriverComputesThem: 5
myOwnPidsGone: true
verdict: FALSE POSITIVE: concurrent seat pids counted as our survivors
```
Live corroboration inside one invocation: `run1 firefoxPids=10`, `run2 firefoxPids=3`. C2's kill rule
("survivor") can therefore fire on a clean run purely because another seat's browser is open — and
inversely, a leaked process from an *earlier* run is invisible if it is not in the new snapshot.

### F9 — egress evidence is a 2-sample window over a ~1 s browser life
All four runs, mine and committed, record `egress {"samples":2,"nonLoopback":0,"lines":1}`: a 400 ms
`setInterval` over a run that ends ~0.8-1.2 s after launch (lines 77-81). Any connection shorter than
one tick is invisible. P5 shows the detector is *correct* when traffic persists, so the honest reading
of "zero observed non-loopback sockets" is **"nothing persisted across two polls"**, not "no egress
occurred". Second-order: the sampler filters on the launch-time pid list only, and Firefox spawns
content processes afterwards (probe: `spawnedAfterLaunch: [706523,706537,706814,707404]`); page/
socket traffic in this build is owned by the parent (verified), but a post-launch process owning a
socket would be uncounted.

### F10 — receipt-shape defects
- **No loopback-only assertion exists in the receipt.** The driver records request events but emits no
  `loopbackOnly` / `nonLoopbackRequests` field; the claim's "loopback-only requests" can only be
  re-derived out-of-band (as I did). The claim's kill rule is thus not self-witnessed by the receipt.
- `scripts/…:127-128` — `http.witnessed.requests` is `httpLog.length`, where `httpLog` is requests
  **plus** responses; both runs print `requests: 6` for **3** actual requests. Field name misstates
  its count.
- `scripts/…:157` — `firefoxVersion: null` is never assigned; the only version evidence is
  `browserVersion "157.0"` from a probe launch. Dead field.
- `run1/run2 history-reset-and-click` records `status: "booting"` in every run: after `goBack` the
  step waits on `#count`, not on the fixture's 150 ms hydration, so the receipt captures a pre-hydrated
  page. Evidence is still valid; the step just does not verify restoration.
- `scripts/…:141` — `portClosed` defaults to **true** when `ss` is unavailable:
  `sh("ss -ltn …")` → `""` → `("" || "0") === "0"` → true (verified with `PATH=/nonexistent`). Port
  closure is unproven, not proven, in that case.
- Dead code: `FIREFOX_BIN` (line 24) unused; `runOnce({out})` parameter unused.

### F11 — "two cold runs" definitional nit
`scripts/…:158` launches a probe browser before the measured runs, so run1 is the second cold start in
the process tree. Binding is unaffected; the word "cold" is.

### C2 verdict
Predicate elements reproduce on this host and the committed receipt is faithful to a live run (P4), so
the capability row is supported. But the two guard conditions the kill rule names are weakly
instrumented: survivors is host-global and provably confusable by concurrent seats (F8), and
non-loopback egress is a 2-sample observation whose negative is weaker than the receipt's phrasing
implies (F9). "Loopback-only requests" is true but not asserted anywhere in the artifact (F10).

---

## 3. Other counter/claims consistency notes
- `claims.json` `baseline: 98239d0` and `frozenAt: 98239d0` vs the counter's `BASELINE =
  3f42a5c7` (line 52) vs the actual freeze commit `a8e7d50`. D6 will accept a receipt naming
  `3f42a5c7…` (baseline) while `claims.json` says the baseline is `98239d0`; the lane's own LOG now
  calls `3f42a5c7` the "Round-start baseline", so the claim file's `baseline` field is stale.
- The counter's comment (lines 48-50) asserts the predicate sentence is "byte-identical across
  claims.json, this constant and the receipt" — `claims.json` `C1.predicate` is a *different*, shorter
  sentence ("D1-D6 all re-derived and corrected at REV by c1-routed-defects.mjs; predicate true").
  Not byte-identical.
- C2's counting command, receipt path and SCORECARD capability row (`SCORECARD.md:2105`, source S144)
  exist at `3bc0b108`; the knowledge row is committed and cites S144, matching the claim's target.
- `corpus/lessons/round-37-verifier-spotcheck.md:109` lists exactly six routed defects (1..6 = D1..D6),
  so C1's "before" statement checks out.

## 4. Risks / blockers
- **C1 cannot be satisfied as frozen** (F1 + F2). Fixing F1 requires editing a *frozen* counter, which
  the wave's own rules forbid mid-wave; therefore C1 should be adjudicated as failed for round 38 and
  re-issued with a corrected D6 path matcher and a committed D1 source.
- **C2 is corroborated but not falsification-hardened**: a concurrent-seat survivor (F8) or a
  sub-400 ms connection (F9) would misjudge a clean run; recommend run-scoped pid capture
  (`launcher`-owned child tree) and a higher-frequency or `strace`/`bpf`-based egress check before the
  capability is treated as a coverage advance that survives attack.
- Measurements taken while `3bc0b108` landed; the lane moved under this seat, so any later commit may
  change D1/D3/D4 results. All conclusions above are pinned to the printed REVs.
