# W1-49 — Scribe49 — evidence-surface note (focus #1: sources row / knowledge gate; lesson and mistakes; SCORECARD/LOG/report consistency)

Seat: Scribe49 · wave: round-38 w1 (v2 falsification) · lane repo `tabi-shokunin` · HEAD `a8e7d50c04254bb19f9de08b31ca2aa811fbe7fc` (frozen claims) throughout the inspection window 2026-10-27T12:33–12:39-03:00; HEAD moved to `3bc0b10` at 12:40:07 — see the F4 postscript.
Scope: read-only inspection + one read-only structural gate run. No product file edited, no commit, no git/jj mutation, no scratch dir created (nothing to clean). Tool installs: none.

Every claim below is tied to a command/file:line observable at the timestamps given. Where a surface was still being written by other seats during my read, I say so and give the two observed states. These are draft evidence notes for the canonical judge — not verdicts.

## State of the lane at observation

```
$ git rev-parse --short HEAD            -> a8e7d50
$ git show --stat --oneline a8e7d50     -> .ufo/waves/round-38/claims.json | 59 +++  (1 file)
$ git show --stat --oneline 98239d0     -> 5 files: c1-adjacency-sweep-v6.mjs, c1-routed-defects.mjs,
                                           c2-battery-mutants.mjs, c2-firefox-bidi-v4.mjs,
                                           scripts/playwright-firefox-loopback-round38.mjs
$ git status --porcelain  (12:38:49)
 M SCORECARD.md
 M corpus/SOURCES.md
?? corpus/lessons/round-38.md
?? corpus/knowledge/playwright-firefox-loopback-round-38.md
?? corpus/evidence/round-38/
?? .ufo/waves/round-38/{w1/,w1-spec.json,w1-dispatch.json,w1.ready,w1.ready.dispatched}
?? .ufo/waves/round-37/w1-results.json
```

Digests observed (`sha256sum`, 12:38:49): LOG.md `f540b89c…c86ef8a`; SCORECARD.md `7cd98f83…d8fc79d9f`; corpus/SOURCES.md `b7f5b41a…a3def22`; corpus/lessons/round-38.md `62611f94…02707995`; corpus/knowledge/playwright-firefox-loopback-round-38.md `9b1ed2de…bf519a`; corpus/evidence/round-38/playwright-firefox/receipt.json `dd77b71a…525cdc06`.

The five `claims.json` `frozenDigests` all match their files (`sha256sum` of each counter + driver = the frozen values), so the *instruments* are bound. Nothing else is.

---

## F1 — C2's counting command cannot falsify C2's predicate (calibration)

`claims.json` C2 `countingCommand` is `node scripts/playwright-firefox-loopback-round38.mjs --out <receipt> --runs 2` — the **producer** of the evidence, not a judge of it.

- `scripts/playwright-firefox-loopback-round38.mjs:163-166`: `main()` computes `receipt.binding`, `receipt.egressNonLoopback`, `receipt.survivors`, writes the file and `console.log`s them. There is no branch on any of them; the only non-zero exits are the usage exit `64` (:152) and the uncaught-error handler (:167).
- No frozen counter reads this receipt:
  - `.ufo/waves/round-38/counters/c2-firefox-bidi-v4.mjs` — `grep -ni "playwright\|juggler\|round-38"` → **0 matches**; its `ENTRY` constant is the round-35 note (`:105 ENTRY = 'corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md'`).
  - `.ufo/waves/round-38/counters/c2-battery-mutants.mjs` mutates only `c2-firefox-bidi-v4.mjs` (`COUNTER = join(dirname(...), 'c2-firefox-bidi-v4.mjs')`).

So C2's predicate sentence ("Two cold runs; same first screenshot SHA; loopback-only requests; zero observed non-loopback sockets; zero survivors; click/navigation/evaluation evidence verified") has no implementing checker among the frozen instruments; the declared command exits 0 on a receipt with `binding:false` or non-zero egress.

What would falsify F1: a frozen counter (or a `--check` leg of the driver) that reads the receipt and exits non-zero when `binding !== true` / `egressNonLoopback > 0` / `survivors > 0`. Cheap direct falsifier: run the driver with `--runs 2` and a per-run differing fixture (e.g. `FIXTURE2` for run 2) and observe exit 0 with `binding:false`.

## F2 — S144 carries no open receipt under the sources contract (sources-row gate)

`corpus/SOURCES.md:11-14` states the contract: the admitting seat's lesson §Gate "carries each row's URL, access date, ≤25-word quote with location, and **raw-fetch sha256**".

- `SOURCES.md:158` (S144) anchor cell: `living docs page, §Firefox; opened 2026-10-27, page identifies Playwright's patched Firefox and platform variation` — no fetch timestamp beyond the date, no byte count, **no sha256**.
- Contrast the four preceding rows `SOURCES.md:154-157` (S140–S143), each carrying fetch time, bytes and a 64-hex sha256 plus line locators.
- The lesson receipt `corpus/lessons/round-38.md:5` carries URL + date + a 14-word §Firefox quote, and **no fetch digest or byte count**: `grep -c "sha256" corpus/lessons/round-38.md` → `0`.
- The structural gate is blind to this by design and reads the worktree, not a REV: `node scripts/check-sources.mjs` → `SOURCES_GATE verdict=clean rows=144 tiers=A:128,B:7,C:9 status=queued:15,mined:120,rejected:9 findings=0 file=corpus/SOURCES.md`, exit 0. `SOURCES.md:9-10` itself says "structure only — it cannot see whether a source was opened".

What would falsify F2: a raw-fetch receipt for `https://playwright.dev/docs/browsers` at 2026-10-27 carrying page bytes and sha256 (the round-35 pattern: `fetched <ts> (200, N B, sha256 …); §Firefox …`).

## F3 — The round-38 knowledge note is below the lane's own note convention, and is not indexed (knowledge gate)

`corpus/knowledge/playwright-firefox-loopback-round-38.md` (`wc -l` → 9; all 9 lines read):

- `:1 source: S144 — Playwright Browsers docs, https://playwright.dev/docs/browsers` — no quote, no page locator, no fetch digest.
- `:2 verified-at: round 38, Playwright 1.64.0, Firefox 157.0` — no timestamp, no page hash, no binary digest.
- `:3 recheck: run `node scripts/playwright-firefox-loopback-round38.mjs --out <receipt> --runs 2`` — rechecking names the producer again (see F1), not a judging counter.
- `:7` asserts "The source describes Playwright's supported Firefox build and CLI browser installation" with no locator; the note's only digest is the screenshot sha at `:9`.
- Convention it departs from: `corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md:3-6` — per-source quotes with `Flags.html:496`-style locators, a fetch window, transcript shas, binary shas, and a counter recheck.
- `corpus/QUALITY.md:1-5` rule 2: "Every claim carries a source: a measured anchor (path:line, command, evidence id)"; rule 12 requires an opened tier-A/B registry row "for its scope".
- `corpus/QUALITY.md` rule 11: the coverage/index map must list every current note or state its snapshot date and exact open gap in the same commit as each admit. `corpus/README.md` has no row for this note: `grep -c "knowledge/playwright-firefox-loopback-round-38" corpus/README.md` → `0` (exit 1); README is absent from `git status` and absent from the landing commit `3bc0b10 --stat` (LOG.md, SCORECARD.md, corpus/SOURCES.md, the receipt, the note, the lesson only).

What would falsify F3: an appended README coverage row plus a locator-bearing quote and fetch digest in the note, in the same commit as the admit.

## F4 — The whole C2 evidence surface is uncommitted and was mutating during the wave (provenance)

`a8e7d50` contains only `claims.json`; the receipt, note, registry row, lesson and SCORECARD block are worktree-only (`git status` above). `claims.json` `frozenDigests` binds the four counters + driver only.

Observed mutation inside my own 6-minute window:
- 12:33 — `ls corpus/lessons/round-38*` → `No such file or directory`; `grep -n "round-38\|Round 38" LOG.md` → 0 hits; `grep -n "Round 38" SCORECARD.md` → only the round-37 "Planned for round 38" line (2087).
- 12:36:08 — `corpus/lessons/round-38.md` appears (mtime 12:36:08.861).
- 12:36:37 / 12:36:55 — `SCORECARD.md` and `LOG.md` gain their Round 38 blocks (mtimes); LOG now has 3 `round-38` hits (`LOG.md:2525,2529,2531`), SCORECARD now has the "## Round 38 — corrections and capability candidate" block.

Consequence for this wave: any seat "verifying" the receipt or the note may be judging bytes that a sibling rewrote, because no digest pins them. C2's kill rule ("differing first-shot hashes", "non-loopback egress", "survivor") is therefore checkable only against a moving file.

What would falsify F4: `frozenDigests` entries for the receipt / note / SOURCES row, or a commit carrying them at the measured REV.

**Post-observation landing (12:40:07):** a new commit `3bc0b10` "round-38: record Firefox capability and routed defects" landed the unreceipted surface — `LOG.md +8`, `SCORECARD.md +8`, `corpus/SOURCES.md +1`, `corpus/evidence/round-38/playwright-firefox/receipt.json +382`, the note `+9`, `corpus/lessons/round-38.md +19` (6 files, +427/−0). Its committed bytes equal my 12:38:49 snapshot on all five hashed files (`git show 3bc0b10:<path> | sha256sum` prefixes `7cd98f83`, `b7f5b41a`, `62611f94`, `9b1ed2de`, `dd77b71a`), so F1–F3, F6–F9 describe the committed bytes, not transient ones. What does *not* change: the evidence landed one commit **after** the claims were frozen, and `claims.json` still carries no digest for any of it — the frozen claim's own target ("commits receipt and knowledge row citing opened S144") was unfulfilled at the frozen commit and at every moment before 12:39. `.ufo/waves/round-38/{baseline,measure}/` remain empty (0 files) after this landing, so F7 stands.

## F5 — `claims.json` `frozenAt` resolves to a commit that cannot contain the claims (record consistency)

```
$ git cat-file -e 98239d0396ff32c3feb14638b3214fe688e8b122:.ufo/waves/round-38/claims.json
fatal: path '.ufo/waves/round-38/claims.json' exists on disk, but not in '98239d0…'
exit=128
$ git cat-file -e a8e7d50c04254bb19f9de08b31ca2aa811fbe7fc:.ufo/waves/round-38/claims.json   -> exit 0
```

`claims.json:5 "frozenAt": "98239d0…"` and `:6 "baseline": "98239d0…"` are the same value. The claims first exist at `a8e7d50`, the commit the seat assignment names as the frozen-claims commit. One of the two fields is mislabeled, and Rounds 35–37 both distinguish freeze from round-start baseline.

What would falsify F5: a `claims.json` at `98239d0` (it is not there), or a corrected `frozenAt`.

## F6 — The capability row and receipt facts are asserted in SCORECARD/LOG before any measurement, and the same block says measurement is pending (record consistency)

`SCORECARD.md` Round 38 block (as observed 12:36:37):

- `:2103` "Claim C1 … result pending integration and frozen measurement."
- `:2104` "Claim C2 … two runs have matching first-screenshot hashes, observed egress 0 and survivors 0. The claim's frozen verification and non-author review are pending."
- `:2105` "Capability row: `playwright-firefox-loopback` — … demonstrated in `scripts/playwright-firefox-loopback-round38.mjs` and `corpus/evidence/round-38/playwright-firefox/receipt.json`; first-working round 38."
- `LOG.md:2529` restates the same numbers as achieved: "receipt reports 0 non-loopback socket observations and 0 remaining Firefox PIDs."

The receipt facts are self-reported by a file that was uncommitted when the frozen claims and this SCORECARD/LOG text were written and is still pinned by no frozen digest (F4), and no frozen instrument judges them (F1); the capability row is entered while `:2104` says verification is pending. Round 35's capability row landed after C2 measured, with a measure-receipt pointer (`SCORECARD.md` "Capabilities — round 35"). No condition in the Round 38 block states what withdraws the row if the predicate comes back false.

What would falsify F6: a measured receipt at the integration REV showing `predicate: false` — the row as written would then stand unretracted; or a SCORECARD edit adding an explicit retraction condition (removing the finding, not the row).

## F7 — C1's frozen predicate reads artifacts that do not exist, are seat-authored, and — for three legs — string-presence tests (calibration / lesson-and-mistakes)

`find .ufo/waves/round-38/baseline .ufo/waves/round-38/measure -type f | wc -l` → **0**. Yet the frozen counter requires:

| Leg | Required input | Counter site | Status at observation |
|---|---|---|---|
| D4 | `.ufo/waves/round-38/baseline/m3-sentence-mutant.json` | `c1-routed-defects.mjs:170` | absent → finding `d4-receipt` |
| D5 | `.ufo/waves/round-38/measure/census-end.txt` | `:181` | absent → finding `d5-receipt` |
| D6 | `.ufo/waves/round-38/measure/numstat-at-<hex>.txt` or `numstat.txt` | `:211-216` | absent → finding `d6-file` |

Additional byte-level gaps at the current lesson bytes (`62611f94…`):

- D4's `capturedBy` leg needs literal `surface-mismatch` in the lesson (`:165`): `grep -c "surface-mismatch" corpus/lessons/round-38.md` → `0`. The only `## Mistakes` row is class `self-assessment-overclaim` (the 68-seat defect). So `d4-m3` also fails on current bytes.
- The lesson's own §Census cites a nonexistent artifact: "captured output at `.ufo/waves/round-38/measure/census-end.txt`" while that directory is empty. That is a direct report/evidence contradiction inside the round's lesson.
- D1 requires `.ufo/waves/round-37/w1-results.json` at REV with `seats === 34` (`:92-96`); that file is currently **untracked** (`?? .ufo/waves/round-37/w1-results.json`), so satisfying C1 requires committing a previous round's artifact this round.

Anti-forgery scope of the six legs (what a seat can satisfy without doing the work):

- D4 accepts any JSON where `exit ∈ {1,2}` or `refused|killed: true` (`:170-176`) — a hand-written `{"exit":1}` passes with no mutated-sentence run.
- D6 only requires the numstat text to contain the baseline and REV prefixes (`:218-219`) — not that the diff is correct.
- D3's freeze-landing leg is a string test on LOG (`:150`: `/34ed508c/.test(r38)` and not the `99437d29` attribution).
- By contrast D1 (git object existence + absence of w2 artifacts + `w1-results.seats`), D2 (recompute over 34 committed seat reports) and D5 (histogram recompute against `SOURCES.md` at REV) do bind derived facts.

What would falsify F7: a committed `baseline/m3-sentence-mutant.json` produced by an actual sentence-mutation run (with the mutated input digest and the counter's exit), a `measure/census-end.txt` whose parsed counts equal the counter's own parse, and a lesson `## Mistakes` row naming round-37 M3 `surface-mismatch`. Note the frozen predicate is currently **unreachable** at any REV: three of its required files are absent and uncommitted.

## F8 — "Firefox 157.0" is a version string, not a binary binding; `firefoxVersion` is null by construction (calibration / coverage)

- Driver `:24 const FIREFOX_BIN = '/home/vgpnk/.cache/ms-playwright/firefox-1555/firefox/firefox'` — defined, **never referenced** (`grep -n FIREFOX_BIN` → only line 24). Launch is `firefox.launch()` (`:76`), resolved by Playwright's registry.
- Driver `:157` hardcodes `firefoxVersion: null` in the receipt object and **never assigns it**; only `:159 receipt.browserVersion = probe.version()`. Observed receipt: `firefoxVersion: null`, `browserVersion: "157.0"`.
- The build on disk reports that string itself: `~/.cache/ms-playwright/firefox-1555/firefox/application.ini` → `Name=Firefox`, `Version=157.0`, `BuildID=20261002045259`, `CodeName=Nightly`. The host separately carries branded Firefox 158.0.1 (round-35 install).
- The note `:2,:7` and `SCORECARD.md:2105` say "patched Firefox 157.0", while `SOURCES.md:158`'s own scope cell says "not branded Firefox behavior". The distinguishing identity (build dir `firefox-1555`, BuildID, or executable sha256) appears in no receipt, no note, no registry row, and no mutation-battery term.

What would falsify F8: a receipt field carrying the launched executable path + sha256, or the Playwright browser build id, equal to the launched binary — i.e. an identity a reader can re-derive instead of a protocol-reported version string.

## F9 — The C2 receipt's own numbers bound the egress/survivor evidence (coverage limits, not falsifications)

From `receipt.json` (read-only extraction): `egress` = `{samples: 2, nonLoopback: 0, lines: 1}` in **both** runs; navigation step `ms` = 213 / 199; `survivors` = 0 / 0; `firefoxPids` = 3 / 3; `binding: true`.

- The sampler (`:79-86`) runs every 400 ms and matches `ss -tnp | grep -E 'pid=(<pids>),'` — TCP only, unprivileged `ss` sees only own-user pids, and the run is short: **4 instantaneous snapshots across both runs**, with `lines` peaking at 1. The note reports "0 non-loopback socket observations" without the sample count or method.
- `firefoxPids` is captured once, immediately after launch, by matching the **build path string** `firefox-1555/firefox/firefox` (`:77`), not the run's unique `-profile` mkdtemp path. In a 64-seat wave, a sibling running the same driver is inside the match set: egress attribution and the `survivors` intersection can then count another run's processes.
- `survivors` counts only pids present in that launch-time snapshot; children spawned later are invisible — the same gap `SCORECARD.md:2087` already records as a round-37 carry ("a mutant zeroing `rec.survivors` has no deterministic control").

What would falsify F9: a run-scoped process match (unique profile path in the `ps` pattern), a sample count tied to run duration, `ss -uanp`/DNS-disabled prefs, or a per-run network namespace.

---

## Confirmations (honest before-states — recorded, not defects)

- D1 before-state is accurate: the stale line `SCORECARD.md:2078` still reads "the round contains **68 seats** (w1 34 + w2 34 …)" and the append-only correction is at `:2102` ("round-37 w2 was not dispatched. The committed round-37 result object records 34 w1 seats").
- D2's stated tally is present in the Round 38 LOG section: `LOG.md:2531` "seat tally 23 ok / 11 finding" (the counter still has to recompute it over 34 committed seat reports, `c1-routed-defects.mjs:118-140`).
- D3's before-state is accurate: all six round-37 hashes cited by the frozen counter (`:53`) had **0** occurrences in `LOG.md` at 12:33 (`99437d29, f76da094, 34ed508c, 5a2ebb6a, f485cce1, bf8ecd5a` → 0,0,0,0,0,0). No round-38 LOG entry existed at 12:33; it landed at 12:36:55 during the wave (see F4).
- `claims.json` axis-at-start (adjacency 8, operability 9, depth/coverage/freshness/calibration 9) matches the round-37 disposition block in `SCORECARD.md` ("adjacency 8 → 8, operability 9 → 9, all others 9").

## Touched surfaces

Read-only: `claims.json`, `SCORECARD.md`, `LOG.md`, `corpus/SOURCES.md`, `corpus/QUALITY.md`, `corpus/README.md`, `corpus/knowledge/playwright-firefox-loopback-round-38.md`, `corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md`, `corpus/lessons/round-37*.md`, `corpus/lessons/round-38.md`, `corpus/evidence/round-38/playwright-firefox/receipt.json`, `scripts/playwright-firefox-loopback-round38.mjs`, `.ufo/waves/round-38/counters/{c1-routed-defects,c2-firefox-bidi-v4,c2-battery-mutants}.mjs`, `~/.cache/ms-playwright/firefox-1555/firefox/application.ini`, git object reads at `a8e7d50` / `98239d0`, `git status`, `sha256sum`.
Executed: `node scripts/check-sources.mjs` (structure-only, exit 0 — output quoted in F2).
Written: this file only.

## Out of scope (not attacked here)

Counter digests’ arithmetic (they match `claims.json`), D2’s recompute over round-37 seat reports, C1’s adjacency sweep `c1-adjacency-sweep-v6.mjs`, and the w1 dispatch/spec artifacts. No claim verdict is offered: the calibration/coverage judgment belongs to the canonical judge.
