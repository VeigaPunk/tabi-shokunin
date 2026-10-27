# Executor38 — W1-38 executable verification (Playwright Firefox driver + frozen counters)

Attack id **W1-38**. Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Scratch: `/fast/scratch/hyaku/tabi-r38/Executor38/` (removed before yield).
No lane production file edited, no commit/push/jj mutation, no pacman/npm install performed
by this seat (tooling read-only; `RULES.md` consulted, nothing installed).

Frozen claim bytes verified first: `sha256sum` of all five `frozenDigests` entries equals
`claims.json` exactly (`209d86a0…`, `704da806…`, `6a14d8ca…`, `6d7a925b…`, `4cf3a849…`).
So every result below is against the frozen instruments, not drifted copies.
The lane tip moved under me during the wave (`a8e7d50` → `3bc0b10`); every result below names
its REV.

---

## 1. C2 driver: RUNS, REPRODUCES, PASSES ITS OWN PREDICATE — but its egress/survivor terms are fail-open

### 1a. Positive result (does not falsify C2 by itself)

```
$ node /…/tabi-shokunin/scripts/playwright-firefox-loopback-round38.mjs \
    --out /fast/scratch/hyaku/tabi-r38/Executor38/receipt-exec38.json --runs 2
{"wrote":"…/receipt-exec38.json","runs":2,"binding":true,"egress":0,"survivors":0,
 "firstShot":["3e0c070a75f041986f63792a036addf08f0915b79713fd655499c601ec56378c",
              "3e0c070a75f041986f63792a036addf08f0915b79713fd655499c601ec56378c"]}
EXIT=0
```

Independent reproduction of the committed artifact at `3bc0b10`
(`corpus/evidence/round-38/playwright-firefox/receipt.json`, sha256 `dd77b71a…`):
committed vs this seat's cold run differ in exactly 1 of 12 scalar fields (`runs[]`), and inside
`runs[]` only the ephemeral `serverPort` (`42819/44115` vs `39865/43761`) and `navigate.ms`
(`213/199` vs `205/206`). First-shot SHA, `fixture.sha256 = 0057709b…`, `bytes = 1240`,
`browserVersion = 157.0`, per-run step count (11/11), `egress` and `survivors` are identical.
**So the binding claim itself is reproducible off the frozen bytes.** That is real signal for C2.

### 1b. Falsifier 1 — every zero in the receipt is fail-open (proved at runtime)

`sh()` swallows failures to `''` (`scripts/playwright-firefox-loopback-round38.mjs:139`,
`:143`, `:74`, `:79`), and the counting expressions then read as *success*:

```
survivors  = (sh(ps-grep) || '').split('\n')…            → [] → 0
portClosed = (sh(ss -ltn|grep -c ':PORT ') || '0') === '0' → '' || '0' → true
egress.nonLoopback += lines.filter(non-loopback).length    → [] → 0
```

Runtime red control — same frozen driver, `ps` and `ss` replaced on `PATH` by stubs that exit 1:

```
$ mkdir -p bin && printf '#!/bin/sh\nexit 1\n' > bin/ps && … > bin/ss
$ PATH=/fast/scratch/…/bin:$PATH node /…/scripts/playwright-firefox-loopback-round38.mjs \
      --out /fast/scratch/…/receipt-sabotage.json --runs 2
{"runs":2,"binding":true,"egress":0,"survivors":0,"firstShot":[… same both runs …]}   EXIT=0
run1 pids [] egress {"samples":2,"nonLoopback":0,"lines":0} survivors 0 portClosed true steps 11
run2 pids [] egress {"samples":2,"nonLoopback":0,"lines":0} survivors 0 portClosed true steps 11
```

A receipt produced with **zero instrumentation available** is field-for-field as green as the
committed one except `firefoxPids: []` and `egress.lines: 0`. Any claim of the form
"zero observed non-loopback sockets / zero survivors / port closed" is therefore
*unfalsifiable from this receipt*: the receipt cannot distinguish "nothing happened" from
"the probe did not run".

### 1c. Falsifier 2 — the survivor term only looks at launch-time PIDs, and the signal is 3 of 11

```
$ node pids-probe.mjs   (launch → newPage → goto, same ps-grep as the driver)
{"atLaunchCount":4,"afterPageCount":11,"afterNavCount":6,"latePids":3,
 "ssLinesTracked":0,"ssLinesLateUntracked":0,"ssTotalTcpLines":149}
```

`rec.firefoxPids` is snapshotted at `:74`, immediately after `firefox.launch`, before
`newPage()`; `:139` filters survivors with `rec.firefoxPids.includes(p)`. Content/render
processes that appear later are *never* tracked, so a leaked child process is invisible.
Sockets owned by those children are also never sampled (`:79` greps `pid=(<launch pids>)`).

Direction check (mutation in scratch only: `browser.close()` deferred by timer):
```
real `ps`,  browser still alive at check → survivors 3   (metric can see a survivor)
fake `ps`,  browser still alive at check → survivors 0   (fail-open path wins)
```

### 1d. Falsifier 3 — the egress observation window is 2 samples over ~1 s, TCP only, no raw rows

Committed and reproduced receipts both record `egress: {"samples":2,"nonLoopback":0,"lines":1}`.
Sampler interval is 400 ms (`:78`) and it is cleared after `browser.close()` (`:141`), so each
run contributes ~0.8 s of observation and *one* socket row. Additionally `ss -tnp` (`:79`)
lists **TCP only**: DNS/UDP egress is structurally invisible to this instrument, and the receipt
stores only counters — no sampled rows, no timestamps — so an auditor cannot re-derive what was
observed. "Zero observed non-loopback sockets" is true but the observation is one row wide.

### 1e. Receipt-shape defects (small, still concrete)

- `receipt.firefoxVersion` is declared and **never assigned** (`:157`, only `browserVersion` is
  set at `:159` from `probe.version()`): committed receipt has `"firefoxVersion": null`. The
  claim's "Firefox 157.0" rides on `browserVersion` alone.
- `profile = mkdtempSync(join(profileRoot,'profile-'))` (`:72`) is **never passed to
  `firefox.launch({headless:true})`** (`:75`): dead allocation; "cold run" rests on Playwright's
  own ephemeral profile, not on the driver's declared cold-profile construction.
- `runOnce({ out, … })` — `out` is unused (`:60`).
- `step('http.witnessed', {requests})` (`:129`) counts requests **and** responses (6 for 3
  requests) under a label that says requests.
- Source comment numbering skips 9 (`// 8` … `// 10`); emitted `cmds[].i` is contiguous 1–11.

---

## 2. C1 counter: executable, discriminating on the pre-state, but the frozen REV it names cannot satisfy it — and two frozen documents disagree on `baseline`

### 2a. Runs, exits, verdicts

```
$ node .ufo/waves/round-38/counters/c1-routed-defects.mjs --rev 3f42a5c7… --repo . --json
EXIT=1  predicate=false  findings=14  (baseline control fails, as the claim requires)

$ node .ufo/waves/round-38/counters/c1-routed-defects.mjs --rev a8e7d50c… --repo . --json
EXIT=1  predicate=false  findings=14  (the frozen claims commit)

$ node .ufo/waves/round-38/counters/c1-routed-defects.mjs --rev 3bc0b108… --repo . --json
EXIT=1  predicate=false  findings=12
        d1 {"stalePresent":true,"supersedingCorrection":true,"w2Absent":true}   seats absent
        d2 stated {"ok":23,"finding":11} == recomputed {"ok":23,"finding":11,reports:34}
        remaining: d1-results, d3-hash ×6, d3-freeze-landing, d4-m3, d4-receipt, d5-receipt, d6-file
```

At the tip the counter now *does* discriminate the two claims it can reach: D1's append-only
correction and D2's 23/11 tally are present and recomputed to the same numbers. The predicate
still fails because the remaining receipts do not exist in the commit graph:
`corpus/lessons/round-38.md` has `## Mistakes` but **no** `captured-by:`/`surface-mismatch`
row; `.ufo/waves/round-38/baseline/m3-sentence-mutant.json`,
`.ufo/waves/round-38/measure/census-end.txt` and any `numstat-at-*.txt` are absent; and
`.ufo/waves/round-37/w1-results.json` exists **only untracked in the worktree** — D1 reads it
from git objects, so D1 can never complete while it stays untracked.

### 2b. Falsifier — `baseline` is two different commits in two frozen documents

`claims.json` says `"baseline": "98239d0396ff…"`; the counter hard-codes
`BASELINE = '3f42a5c7cc19a544c879577e4bad7b7fd9d61a35'` (`c1-routed-defects.mjs:49`) and
`LOG.md`'s round-38 section says `Round-start baseline: 3f42a5c7…`. Executable consequence —
replaying D6's own expressions on a receipt:

```
receipt naming claims.json baseline 98239d0..REV => {"namesBaseline":false,"namesRev":true}
receipt naming counter baseline 3f42a5c..REV     => {"namesBaseline":true,"namesRev":true}
```
A `numstat-at-<rev>.txt` that honours the claim file's declared baseline is **refused** by the
frozen counter; only `3f42a5c..REV` can pass. C1's killRule ("any stated number differs from
counter-derived evidence") is therefore already hit by the claim file itself.

### 2c. Falsifier — `frozenAt` names a commit in which `claims.json` does not exist

```
$ git cat-file -e 98239d0:.ufo/waves/round-38/claims.json
fatal: path '.ufo/waves/round-38/claims.json' exists on disk, but not in '98239d0…'   (exit 128)
$ git diff --stat 98239d0 a8e7d50
 .ufo/waves/round-38/claims.json | 59 +++++  (created here)
```
`claims.json` declares `frozenAt = baseline = 98239d0`, but it was first committed at `a8e7d50`.
The fold-in the claim calls "frozen at" cannot be the freeze of the claim bytes.

### 2d. Counter robustness defects (they change the *reported reason*, not the verdict)

- `log.indexOf('## Round 38')` returning `-1` degrades to `log.slice(-1)` — a 1-character body.
  Verified at `a8e7d50`: `heading index -1 … r38len 1`, so D2/D3 report "missing" for a reason
  that is a slice bug rather than a content inspection. At `3bc0b10` the heading exists and the
  same code path works, so today's verdicts are correct; the failure mode is latent.
- Header says "D5/D6 receipt files are read at `--repo`'s **worktree**"; the code reads them with
  `blob(repo, REV, path)` — git objects (`:161`, `:220`). The documented `--repo <clean clone>`
  invocation therefore works only because of the code, not the header.
- `frozenDigests` also pins `c1-adjacency-sweep-v6.mjs`, which neither C1 nor C2 references.

---

## 3. C2's frozen counters do not measure C2's claim (hardest finding of this seat)

`claims.json` C2 surface: "Playwright 1.64.0 + Firefox 157.0 via Juggler", countingCommand
`node scripts/playwright-firefox-loopback-round38.mjs --out <receipt> --runs 2`.

The two frozen C2 instruments never touch that driver:

```
$ grep -ci playwright .ufo/waves/round-38/counters/c2-firefox-bidi-v4.mjs   → 0
$ grep -ci playwright .ufo/waves/round-38/counters/c2-battery-mutants.mjs   → 0
$ grep -ci playwright .ufo/waves/round-38/counters/c1-routed-defects.mjs    → 0
```

`c2-firefox-bidi-v4.mjs` is the **round-35 WebDriver-BiDi** counter:
`ENTRY = corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md`,
`RECEIPT = corpus/evidence/round-35/bidi-firefox/receipt.json` with `RECEIPT_SCHEMA =
'tabi-bidi-receipt-v1'`, `FIREFOX = /home/vgpnk/.local/opt/firefox-158.0.1/firefox`,
`GECKODRIVER`, and a receipt whose declared driver is
`scripts/bidi-firefox-loopback-round35.mjs`.

Executed at the round-38 tip:

```
$ node .ufo/waves/round-38/counters/c2-firefox-bidi-v4.mjs --rev a8e7d50c… --repo . 
C2_FIREFOX_BIDI_V4 predicate=met rev=a8e7d50… population=17 admitted=16/16 failing=0
                   unmeasured=1 egressNonLoopback=0 entry=- receipt=- binding=-   EXIT=0
$ … --json
live {"browserName":"firefox","browserVersion":"158.0.1","geckodriverVersion":"0.37.1",
      "firstShotSha256":"7a3ae6a9…","commands":28,"events":20,
      "egress":{"samples":3,"nonLoopback":0,"pids":9}}
sourceWitness {"id":"S134","gate":"corpus/lessons/round-35.md:15",…}
$ node .ufo/waves/round-38/counters/c2-battery-mutants.mjs
{"mutants":{"m5":{"status":1,"clean":false},"m5b":{"status":1,"clean":false},
            "m3":{"status":0,"clean":true},"decoy":{"status":0,"clean":true}},
 "expectations":{"m5_killed":true,"m5b_killed":true,"m3_classified":true,
                 "decoy_clean":true,"restored":true},"verdict":"pass"}   EXIT=0
```

So the C2 counter set is healthy, mutation-tested and green — for **Firefox 158.0.1 / BiDi /
S134**, none of which appears in C2's surface, target, or killRule. Concretely:

1. A green `c2-firefox-bidi-v4` receipt proves nothing about Playwright 1.64.0, Juggler, or
   Firefox 157.0. C2's "capability row enters SCORECARD" has **no frozen counter binding**; the
   only evidence for the round-38 capability is the driver's own self-report (section 1).
2. The round-38 receipt cannot be substituted into that counter: it lacks `fixtureSha256`
   (it nests `fixture.sha256`), `driverSha256`, and per-run `transcript`/`transcriptSha256`,
   and its `schema` is `tabi-pw-firefox-receipt-v1`, so validation stops at
   `rf = 'receipt schema'` before any run is read.
3. C2's killRule "no cited newly opened source row" is unenforced: the counter's source gate is
   S134; S144 is cited only in `corpus/SOURCES.md:158` (`used-by:
   corpus/knowledge/playwright-firefox-loopback-round-38.md`), and the driver itself contains
   zero occurrences of `S144` (`grep -c S144 scripts/playwright-firefox-loopback-round38.mjs → 0`).

Note for the integrator: at `3bc0b10` the receipt `corpus/evidence/round-38/playwright-firefox/
receipt.json` **is** committed (it was untracked at `a8e7d50`), so the "absent receipt" reading
of `SCORECARD.md:2104-2105` is closed. The *instrument-disconnection* finding above is not.

---

## 4. What would falsify each claim (state of play)

- **C1** — kill on (i) any stated number differing from counter-derived evidence: already true for
  `baseline` (`claims.json` 98239d0 vs counter/LOG 3f42a5c), see §2b; (ii) missing correction:
  still true at tip for D4/D5/D6 plus the untracked `w1-results.json` (§2a). To *pass*, the wave
  must commit `w1-results.json`, the census + numstat receipts under `.ufo/waves/round-38/measure/`
  naming `3f42a5c..REV`, `baseline/m3-sentence-mutant.json` with `exit != 0`, a `captured-by:`
  M3 row, and the six round-37 hashes + `34ed508c` in the LOG round-38 section — **and** the
  claims file's `baseline`/`frozenAt` must be corrected to match, otherwise the claim's own text
  contradicts the counter it quotes.
- **C2** — no executable counter is reachable at all (§3); the only runnable evidence path
  (section 1) is real but fail-open on its three strongest terms (§1b–1d). A single non-loopback
  socket row, or one leaked child PID, would be invisible to it in exactly the failure modes the
  killRule names. What *would* falsify the capability itself: any run whose `firstShotSha256`
  differs across cold runs (not observed: `3e0c070a…` twice here and in the committed receipt),
  or a page-state step that fails (not observed: 11/11 steps, `click.effect count=1`,
  `history.traverse pathname=/a.html`, `console.quiet errors=0`).

## 5. Risks / blockers (no artificial enlargement)

- The lane tip moved mid-wave (`a8e7d50` → `3bc0b10`); all verdicts above are pinned to those two
  shas. `w1-results.json` and the whole `.ufo/waves/round-38/w1/` tree remain untracked, so
  a C1 pass at any sha today is impossible regardless of seat reports.
- No blocker prevented this seat's work: driver, both counters, and the mutation battery all
  executed; only lane write-scope restrictions stopped me from committing the receipts C1 needs.
- Nothing installed; nothing in the lane's production files or the fleet root was touched.
