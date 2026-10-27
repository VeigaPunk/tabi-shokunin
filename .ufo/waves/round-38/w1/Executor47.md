# W1-47 — Executor47

Axes: **calibration** (C1), **coverage** (C2). Item: one bounded recursive verification of the Playwright Firefox driver and the frozen counters (syntax/runtime, receipt shape, counter consistency, source/census/numstat). No production file edited; every run below uses the lane worktree read-only or a scratch clone under `/fast/scratch/hyaku/tabi-r38/Executor47/` (toplevel asserted) that was removed before this report was finalised.

Lane state at start: `git -C tabi-shokunin rev-parse --show-toplevel` → `/home/vgpnk/Projects/shokunin/tabi-shokunin`; `git log --oneline -3` → `a8e7d50 round-38: freeze calibration and Firefox capability claims`, `98239d0 round-38: add frozen-instrument candidates and Firefox driver`, `3f42a5c round-37 verifier spot-check (integrator, hyaku): non-author admit/reject`.

## F1 — C1 predicate is false at the frozen claim commit (blocking, calibration)

```text
$ node .ufo/waves/round-38/counters/c1-routed-defects.mjs --rev a8e7d50c04254bb19f9de08b31ca2aa811fbe7fc --repo . --json
EXIT=1
{"predicate":false,
 "d1":{"stalePresent":true,"supersedingCorrection":false,"w2Absent":true},
 "d2":{"stated":null,"recomputed":{"ok":23,"finding":11,"error":0,"none":0,"reports":34}},
 "d3":{"freezeLandingStated":false,"hashes":{<all six>:{"presentInR38Section":false,"isCommit":true,"ancestorOfRev":true}}},
 "findings":[d1-correction, d1-results, d2-stated, d3-hash ×6, d3-freeze-landing,
             d4-lesson, d4-receipt, d5-receipt, d6-file]}
```

Same 14 findings, exit 1, from a clean clone of `a8e7d50` (`--repo <clone>`), i.e. the result is not worktree contamination:

```text
$ git clone --no-hardlinks tabi-shokunin /fast/scratch/…/clone && git checkout a8e7d50
toplevel=/fast/scratch/hyaku/tabi-r38/Executor47/clone
$ node <lane>/.ufo/waves/round-38/counters/c1-routed-defects.mjs --rev a8e7d50… --repo <clone> --json
{"rev":"a8e7d50…","predicate":false,"findings":[14 ids identical to above]}
```

Also run at the claim's own `frozenAt` value (`98239d0`): `EXIT=1`, `predicate=false`, `14 findings`. So both candidate REVs falsify the C1 predicate.

Independent re-derivation of the D1/D2/D3 environment facts at REV:

```text
$ git show a8e7d50:SCORECARD.md | grep -n "68 seats"
2078:Two v1 waves; the round contains **68 seats** (w1 34 + w2 34; see the report for the
$ git show a8e7d50:LOG.md | grep -n -i "round 38\|round-38"     # (no output)
$ git show a8e7d50:LOG.md | grep -n "99437d29\|34ed508c\|f76da094\|5a2ebb6a\|f485cce1\|bf8ecd5a"   # (no output)
$ git ls-tree -r --name-only a8e7d50 .ufo/waves/round-38/
.ufo/waves/round-38/claims.json
.ufo/waves/round-38/counters/{c1-adjacency-sweep-v6,c1-routed-defects,c2-battery-mutants,c2-firefox-bidi-v4}.mjs
$ git ls-tree -r --name-only a8e7d50 .ufo/waves/round-38/baseline .ufo/waves/round-38/measure | wc -l
0
```

Consequences: the stale `68 seats` line is present with no superseding correction; LOG.md has no round-38 section, hence no round-37 hash ledger and no tally; D4's `corpus/lessons/round-38.md` and `baseline/m3-sentence-mutant.json`, D5's `measure/census-end.txt`, D6's `measure/numstat-at-*.txt` and `w1-results.json` are all unshipped. The claim's own kill rule ("… missing correction; absent source receipt") is observable *at REV*, before any evaluation of the wave's work.

What would falsify F1: a REV whose counter run exits 0 (all D1-D6 terms true) — none of the two REVs named by the frozen bytes does.

## F2 — Two frozen artifacts name different baselines, and `frozenAt` names the wrong commit (calibration)

```text
claims.json:5   "frozenAt": "98239d0396ff32c3feb14638b3214fe688e8b122",
claims.json:6   "baseline": "98239d0396ff32c3feb14638b3214fe688e8b122",
counters/c1-routed-defects.mjs:52  const BASELINE = '3f42a5c7cc19a544c879577e4bad7b7fd9d61a35';
```

- `98239d0` is itself a round-38 commit ("add frozen-instrument candidates and Firefox driver"); `3f42a5c` is the last round-37 commit, i.e. the true round-start tip. D6 (`counters/…:211-225`) passes only a receipt naming `3f42a5c…`; a receipt built to the claim's declared baseline `98239d0…` fails D6. The two frozen artifacts cannot both be satisfied.
- The claims bytes do not exist at `98239d0`: `git diff 98239d0 a8e7d50 --stat` → `.ufo/waves/round-38/claims.json | 59 +++++` (1 file, 59 insertions, 0 deletions). So `frozenAt` points one commit before the freeze it describes.

What would falsify F2: a revision where `claims.json` exists at `98239d0` (it does not), or a D6 implementation that accepts `98239d0..REV` (it does not).

## F3 — D3's freeze-landing term is phrase-sensitive, not fact-sensitive (measured instrument defect)

`counters/c1-routed-defects.mjs:153` — `out.d3.freezeLandingStated = /34ed508c/.test(r38) && !/freeze entry.*99437d29|99437d29.*freeze entry/i.test(r38)`.

Three fixture-clone variants, all with the six **full 40-hex** round-37 hashes present in a `## Round 38` LOG section (8-char abbreviations do *not* count: with abbreviations all six `presentInR38Section=false`):

| variant | appended correction sentence (same facts) | `freezeLandingStated` | findings |
|---|---|---|---|
| A | "the round-37 freeze entry (claims) landed at 99437d29…; the freeze-held integration landed at 34ed508c…, and the report's Landed-changes bullet said 99437d29…" | **false** | `d3-freeze-landing` |
| B | "the round-37 freeze entry landed at 34ed508c…" (99437d29 dropped) | **true** | no d3-freeze-landing |
| C | "the round-37 claims landed at 99437d29…; the freeze entry landed at 34ed508c…" | **false** | `d3-freeze-landing` |

Exact runs:

```text
A REV=21bdcbca… -> {"d2":{"ok":23,"finding":11},"d3":false,"hashes":[true×6],"findings":[d1-correction,d3-freeze-landing,d4-lesson,d4-receipt,d5-receipt,d6-file]}
B REV=4daeb8cd… -> {"d3":true,"findings":[d1-correction,d4-lesson,d4-receipt,d5-receipt,d6-file]}
C REV=73558945… -> {"d3":false,"findings":[d1-correction,d3-freeze-landing,d4-lesson,d4-receipt,d5-receipt,d6-file]}
```

Variant A is the *accurate* statement — `99437d29` is literally "round-37: freeze claims, C1 v5 + C2 v3 counters, build tool v2, harness v2, controls receipts (before data)", while `34ed508c` is "round-37: w1 seat evidence, S143 row, lesson, scorecard and log (freeze-held integration)". The counter therefore rejects an entry that states both facts and rewards one that suppresses the claims-freeze hash; it ranks wording, not accuracy. (Its error text even says "or repeats the report's 99437d29 claim" — but the regex cannot distinguish "repeats the wrong claim" from "states the right claims-freeze hash".)

What would falsify F3: a variant where an entry naming both hashes with truthful roles passes, or where a false entry ("freeze entry landed at 99437d29" alone) passes while a correct one fails — the table shows the opposite.

## F4 — Degenerate section slice when the round-38 header is absent (latent, fails closed today)

`counters/c1-routed-defects.mjs:108` and `:144` both do `log.slice(log.indexOf('## Round 38'))`. At REV `git show a8e7d50:LOG.md | grep -ci "round 38"` = 0, so `indexOf` = −1 and the slice is `log.slice(-1)` — a **one-character** "round-38 section". Consequences measured at REV: `d2.stated=null` and all six `presentInR38Section=false`, i.e. it fails closed, but the D2/D3 checks are not reading the region the source comment claims to read, and the failure reason printed ("LOG.md round-38 section lacks …") is not mechanically supported. Any future LOG.md whose final character could never carry a tally or hash makes the two checks structurally unsatisfiable rather than evidence-driven.

What would falsify F4: a test where a LOG.md with no `## Round 38` header but a trailing `23 ok / 11 finding` line makes `d2.stated` non-null. (I did not construct it: with a one-character slice, no such input exists — which is the defect.)

## F5 — D1's seat term is reachable; the blocker is an unshipped file, not a broken gate (measured)

Committing the lane worktree's **untracked** `.ufo/waves/round-37/w1-results.json` into a fixture clone:

```text
$ node -e 'const r=require("./.ufo/waves/round-37/w1-results.json");console.log("seats=",r.seats,"wave=",r.wave,"results=",r.results.length)'
seats= 34 wave= w1 results= 34
$ (clone) cp …/w1-results.json … && git commit -m "fixture: add round-37 w1-results"
$ c1-routed-defects.mjs --rev 0aafdbfd… --repo <clone>
{"predicate":false,"seats":34,"d1":{"stalePresent":true,"supersedingCorrection":false,"seats":34,"w2Absent":true},
 "findings":[d1-correction, d2-stated, d3-hash×6, d3-freeze-landing, d4-lesson, d4-receipt, d5-receipt, d6-file]}
```

`d1.seats` moves `undefined → 34` and the `d1-results` finding disappears; 13 findings remain. So the D1 gate works once its named source is committed. Note the file is **untracked in the lane worktree** (`git status --porcelain` → `?? .ufo/waves/round-37/w1-results.json`), so at REV the "seats == 34" re-derivation has no committed source; the only committed support for 34 is D2's 34 seat reports (`recomputed.reports=34`).

## F6 — D5's census target re-derived independently (numstat/census absent at REV)

Independent parse of `corpus/SOURCES.md` at `a8e7d50` using the counter's own column indices (header: `| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |`, so `split('|')[4]`=tier, `[8]`=status):

```text
{"rows":143,"tier":{"A":127,"B":7,"C":9},"status":{"mined":119,"queued":15,"rejected":9}}
```

Those are the numbers a conforming `measure/census-end.txt` must carry. No such receipt exists at REV (F1's `ls-tree` = 0 under `measure/`), and no `numstat-at-*.txt` exists either, so D6 has no artifact to check against its `3f42a5c…` window. The lane worktree has empty untracked `baseline/` and `measure/` directories, which cannot be committed as-is.

## F7 — C2's executable content reproduces, and matches the wave receipt byte-for-byte on the binding field (coverage, positive)

```text
$ HYAKU_SCRATCH=/fast/scratch/hyaku/tabi-r38/Executor47 node scripts/playwright-firefox-loopback-round38.mjs --out …/receipt.json --runs 2
{"wrote":"…/receipt.json","runs":2,"binding":true,"egress":0,"survivors":0,
 "firstShot":["3e0c070a75f041986f63792a036addf08f0915b79713fd655499c601ec56378c",
              "3e0c070a75f041986f63792a036addf08f0915b79713fd655499c601ec56378c"]}
EXIT=0
```

Per-run detail from my receipt: `egress {samples:2, nonLoopback:0, lines:1}` both runs; `survivors 0`; `portClosed true`; 11 steps each with identical method sequence `navigate.hydrated,title,shape,screenshot.first,click.effect,screenshot.after-click,evaluate,history.traverse,history-reset-and-click,http.witnessed,console.quiet`; `click.effect {count:"1",items:1,confirm:"confirmed 1"}`; `screenshot.after-click differsFromFirst:true`; `history.traverse {pathname:"/a.html",title:"TABI-R38 fixture"}`; `evaluate {innerWidth:800,items:1}`; request origins = `http://127.0.0.1:39569, http://127.0.0.1:33229` (12 absolute URLs, 6 server-relative), i.e. loopback-only requests; console errors 0.

Cross-check against the wave's own receipt (untracked at REV — `git ls-tree -r a8e7d50 corpus/evidence/round-38 | wc -l` → `0`): `corpus/evidence/round-38/playwright-firefox/receipt.json` carries the *same* first-shot sha `3e0c070a…`, `binding:true`, `egress:0`, `survivors:0`, `pw:1.64.0`, `browser:157.0`. Two independent processes on this host produce a bit-identical first screenshot, so the binding term is genuinely deterministic, not merely same-session.

Juggler transport, independently witnessed (the receipt never mentions it):

```text
$ node juggler-probe.mjs   # launch firefox via playwright, then ps
{"version":"157.0",
 "procs":["…/firefox-1555/firefox/firefox -no-remote -headless -profile /tmp/playwright_firefoxdev_profile-w3azoT -juggler-pipe -silent",
          "…/firefox-1555/firefox/firefox -contentproc -ipcHandle 0 …"],
 "jugglerArg":true}
```

So Playwright 1.64.0 + Firefox 157.0 over `-juggler-pipe` is real; the claim's `surface` is accurate.

## F8 — C2 receipt-shape and witness defects (measured)

1. `receipt.firefoxVersion` is **null** in every receipt (`scripts/playwright-firefox-loopback-round38.mjs:157` initialises it and nothing assigns it); the version lives only in `browserVersion:"157.0"`. A consumer reading the field named after the claimed browser gets nothing.
2. The driver **never gates on `binding`**. `main()` writes the receipt and prints, with no `process.exit` on failure (`:166-167`); and the binding term is vacuous for short runs:
   ```text
   $ node scripts/playwright-firefox-loopback-round38.mjs --out …/receipt-runs1.json --runs 1
   EXIT=0   runs= 1   binding= true   hashes=[ '3e0c070a…' ]
   ```
   `new Set([one hash]).size === 1` (`:163`). The predicate "two cold runs; same first screenshot SHA" is therefore a caller convention, not an enforcement: `--runs 1` yields `binding:true` and exit 0.
3. The egress witness is **TCP-only and snapshot-sampled**. `:74-83` greps `ss -tnp` for the PID list captured right after launch, every 400 ms (measured `samples:2` per run, `max lines:1`). UDP is invisible — measured with a live non-loopback UDP pair:
   ```text
   UDP listener pid=915962 at 192.168.0.253:47124 (peer :39392)
   $ ss -tnp | grep -E "pid=(915962),"
   (no TCP line -> UDP invisible)
   $ ss -unp | grep -E "pid=(915962),"
   0 0 192.168.0.253:47124 192.168.0.253:39392 users:(("nc",pid=915962,fd=3))
   ```
   The classifier itself is *not* blind to non-loopback TCP: the same grep on a real non-loopback TCP pair returned 2 lines and the driver's filter (`grep -vE '127\.0\.0\.1|::1'`) counted 2. So "zero observed non-loopback sockets" is an honest but narrow claim: non-loopback **TCP**, at 2 instants per run, for PIDs present at launch (run1 3 pids, run2 4 pids; later descendants unmatched). No `network.dns.disabled` / TRR prefs are set (unlike the round-35 BiDi driver), so DNS egress would be a UDP path this witness cannot see.
4. Dead code: `const profile = mkdtempSync(join(profileRoot,'profile-'))` (`:72`) is never passed to `firefox.launch` — Playwright uses its own `/tmp/playwright_firefoxdev_profile-*` (see F7's ps output) — and `out` is an unused `runOnce` parameter (`:60`). Per-run profile directories are created and left for the parent cleanup.
5. Cleanup verified beyond the pid list: after all my runs `ps -eo pid,args | grep 'firefox-1555/firefox/firefox' | grep -v grep | wc -l` → `0`.

What would falsify F7/F8: differing first-shot hashes across two cold runs (kills F7); a receipt whose `firefoxVersion` is populated; a driver invocation that exits non-zero on `binding:false` (kills 2); a non-loopback TCP line attributable to a Firefox pid under the driver's own grep (kills the C2 egress term outright).

## F9 — C2's cited source row S144 does not exist at REV (source/census consistency)

```text
$ git show a8e7d50:corpus/SOURCES.md | grep -o "S[0-9]\{3\}" | sort -u | tail -1
S143
$ git show a8e7d50:corpus/SOURCES.md | grep -c "S144"      # 0 (file = 209 lines, 143 registry rows)
$ git grep -n "S144" a8e7d50 -- . | head -3
.ufo/waves/round-22/assimilation/quarantine-rows-full:22: round3 | S144 | `payload-absent` | …/puppeteer-core/src/api/Page.ts
.ufo/waves/round-24/assimilation/staged-ids.txt:43:S144
.ufo/waves/round-25/assimilation/quarantine-ids.txt:22:S144
```

`claims.json:29` ("S144 (Playwright docs) is only for C2") names a registry row that does not exist yet; S144 is the next free id after S143, and the *only* S144 spelled at REV is a round-22 quarantine row for a refused Puppeteer `Page.ts` payload (round-23 `RevRenumber.md`/`W2IdMap.md` already recorded that `S144` was renumbered to `S101` there). Consequences: (a) the C2 kill rule's "no cited newly opened source row" can only be satisfied by opening S144 during the wave — the claim's `source` field is prospective, not a receipt; (b) any evidence row citing "S144" must disambiguate it from the quarantine row of the same spelling, or the citation is ambiguous by construction. No knowledge row for a Playwright/Firefox Juggler capability exists at REV either (`grep -ri juggler` over the REV tree returns the round-35 BiDi surface only), so the "capability row enters SCORECARD" target is unstarted.

## F10 — Counter consistency checks that hold (no finding)

- Frozen digests: all five sha256 values in `claims.json:frozenDigests` match the worktree bytes exactly (`sha256sum` → `209d86a0…`, `704da806…`, `6a14d8ca…`, `6d7a925b…`, `4cf3a849…`).
- `c2-battery-mutants.mjs` (frozen C2b control) runs clean:
  ```text
  {"sha256Before":"6a14d8ca…","sha256After":"6a14d8ca…",
   "mutants":{"m5":{"status":1,"p1Refused":false},"m5b":{"status":1,"p1Refused":false},
              "m3":{"status":0,"clean":true,"p1Refused":true},"decoy":{"status":0,"clean":true}},
   "expectations":{"m5_killed":true,"m5b_killed":true,"m3_classified":true,"decoy_clean":true,"restored":true},
   "verdict":"pass"}
  ```
  Third-party observation for F9's family: the quoted `p1Refused:true` on the decoy/pristine path and `false` on both drop-term mutants is the intended kill shape, and the counter digest is unchanged by the driver.
- `c2-firefox-bidi-v4.mjs --battery` → `{"h1Admits":true,"p1Refused":true,"clean":true}`, exit 0.

## F11 — Counter at the wave's own remedy commit (post-freeze, measured)

While this seat ran, a sibling landed `3bc0b10 round-38: record Firefox capability and routed defects` on top of the frozen `a8e7d50` (LOG +8, SCORECARD +8, SOURCES +1 row, `corpus/evidence/round-38/playwright-firefox/receipt.json` 382 lines, knowledge row 9 lines, `corpus/lessons/round-38.md` 19 lines). Re-running the frozen counter there:

```text
$ node .ufo/waves/round-38/counters/c1-routed-defects.mjs --rev 3bc0b10 --repo . --json
EXIT=1
{"schema":"tabi-r38-c1-routed-defects","rev":"3bc0b108708c46c800f9050a1caa25bfe3bf5e5a",
 "baseline":"3f42a5c7cc19a544c879577e4bad7b7fd9d61a35",
 "d1":{"stalePresent":true,"supersedingCorrection":true,"w2Absent":true},
 "d2":{"stated":{"ok":23,"finding":11},"recomputed":{"ok":23,"finding":11,"error":0,"none":0,"reports":34}},
 "d3":{"freezeLandingStated":false,"hashes":{<six>:{"presentInR38Section":false,"isCommit":true,"ancestorOfRev":true}}},
 "d4":{"mistakes":true,"capturedBy":false},"d5":{},"d6":{},
 "findings":[d1-results, d3-hash×6, d3-freeze-landing, d4-m3, d4-receipt, d5-receipt, d6-file],
 "predicate":false}
```

(JSON keys present are exactly `schema,rev,baseline,d1,d2,d3,d4,d5,d6,findings,predicateSentence,predicate`; `d1` carries no `seats` key at this revision because `w1-results.json` is absent.)

What the tip bytes say about each survivor, read at `3bc0b10`:

- `d3-hash ×6` is *by design deferred* in the tip text: the LOG round-38 section ends "Round-38 closure result and landed commit hashes will follow in the appended round-38 ledger." No round-37 hash appears yet. Note the constraint measured in F3: 8-character abbreviations **never** satisfy this term — only full 40-hex strings do.
- `d4-m3` is a genuine miss, not a regex artefact: `corpus/lessons/round-38.md:9-11` has a single `## Mistakes` row, `M1, class self-assessment-overclaim … Captured-by: none at round 37`; there is no M3/`surface-mismatch` row, so no row can carry `captured-by:` naming round-37 M3.
- `d5-receipt` / `d6-file` remain absent: `git ls-tree -r --name-only 3bc0b10 .ufo/waves/round-38/measure .ufo/waves/round-38/baseline | wc -l` → `0`, and both worktree directories are empty (`ls -A` → nothing).
- `d1-results` remains: `w1-results.json` is still uncommitted (F5).

Census target after the tip's S144 row (`| S144 | Browsers — Playwright — https://playwright.dev/docs/browsers | docs | A | … | mined | 2026-10-27 | on-release | corpus/knowledge/playwright-firefox-loopback-round-38.md |`, `SOURCES.md:158`):

```text
(at 3bc0b10) {"rows":144,"tier":{"A":128,"B":7,"C":9},"status":{"mined":120,"queued":15,"rejected":9}}
(at a8e7d50) {"rows":143,"tier":{"A":127,"B":7,"C":9},"status":{"mined":119,"queued":15,"rejected":9}}
```

So a conforming `measure/census-end.txt` must carry 144 / A128 B7 C9 / mined120 queued15 rejected9 *if* it is measured at a tip that includes S144; measuring it at REV requires the 143 numbers. Both sets are stated here so the receipt cannot pass by reusing stale counts.

## F12 — The lesson cites a census receipt that does not exist (calibration, measured at tip)

`corpus/lessons/round-38.md:15` states: "Round-end validation returned exit 0 and `tabi ok`; captured output at `.ufo/waves/round-38/measure/census-end.txt` (the registry parser's counts are reported in the round report)." At the same commit, that path is untracked and the file does not exist — `git ls-tree -r 3bc0b10 .ufo/waves/round-38/measure` → 0 paths, `.ufo/waves/round-38/measure/` → empty. The D5 receipt it names is therefore a citation to nothing at the tip; the frozen counter's `d5-receipt` finding is the correct reading, and the lesson's claim is the one that must move.

Also note `LOG.md` at the tip states "Round-start baseline: `3f42a5c7cc19a544c879577e4bad7b7fd9d61a35`" — i.e. the wave's own log agrees with the counter (`:52`) and contradicts the frozen `claims.json:6` baseline `98239d0…` (F2). One of those two frozen artifacts is wrong; the log and counter agree on which.

## Verdict

| claim | verdict | basis |
|---|---|---|
| C1 (calibration) | **falsified at the frozen REV; still false at the wave's remedy tip** | own counting command exits 1 at `a8e7d50` and at `98239d0` (14 findings) and at `3bc0b10` (12 findings); D3 gate is phrase-sensitive (F3); baseline/`frozenAt` fields contradict the counter, the LOG and the actual freeze commit (F2, F12) |
| C2 (coverage) | **executable content reproduced; receipt and witness narrower than the claim** | two cold runs, identical first-shot sha `3e0c070a…`, loopback-only requests, 0 observed non-loopback TCP, 0 survivors, Juggler `-juggler-pipe` witnessed; but `firefoxVersion:null`, no binding gate (`--runs 1` passes), TCP-only/2-sample egress witness, receipt untracked at REV (committed only at tip `3bc0b10`), S144 absent at REV (present at tip, `SOURCES.md:158`) |

Risks / limits: my egress conclusion is exactly "no non-loopback TCP at 2 sampled instants per run" — it cannot be upgraded to "no egress". My C1 verdict measures the counter; it does not adjudicate whether the round-38 corrections are *intended* to land after the freeze — but the claim's `before` field says only "counter absent", so shipping the counter without the six corrections is what the frozen bytes actually do.

No tools installed (Playwright 1.64.0 and `~/.cache/ms-playwright/firefox-1555` already present and used as found); no pacman transaction; no production file, git state, or fleet file touched (the only git mutations were commits inside the scratch clone, toplevel asserted as `/fast/scratch/hyaku/tabi-r38/Executor47/clone`). Scratch removed after the run.

VERDICT finding
