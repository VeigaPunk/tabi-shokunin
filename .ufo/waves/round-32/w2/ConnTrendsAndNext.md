# ConnTrendsAndNext — cross-wave pattern scan: w1 defects not closed by b234a58, grouped as round-33 candidate claims

Seat: ConnTrendsAndNext (connector, leaf, wave w2 = falsify, milestone planning). Date 2026-10-26.
Report path: `.ufo/waves/round-32/w2/ConnTrendsAndNext.md`. Output dir: `.ufo/waves/round-32/w2/ConnTrendsAndNext/`.

## Verdict

Of the 36 w1 reports, the integration at `b234a58920134424e0d104f137311ff54a16d26b` closes the two
claims' build surface — C1's entry/receipt/driver/matrix addendum/S123–S126 and C2's append-only
corrections all landed, counters remain byte-identical to the frozen digests (only
`scripts/bidi-loopback-round32.mjs` added under `scripts/`), and the lesson records M1–M5 with
QUALITY 83–86 — but every *counter* defect w1 found is still open by construction (`scripts/**`
frozen), and one knowledge-base defect w1 measured is still unlanded: the matrix's collector-timing
sentences at `:71`/`:159` remain contradicted by the round's own runtime evidence. The round-33
candidate set, ranked: (1) **gate v2 for check-bidi-runtime** — CritC1Forgery's four admitted-16
forgeries (duplicate ids, one-transcript-twice, driver-reexports-gate, spliced screenshot) are
answered only by the side-measure `measure/c1-distinct.mjs`, with the lesson itself writing "gate v2
planned"; (2) **collector-timing correction** — the only defect that falsifies a committed knowledge
sentence, not just a gate; (3) **BiDi perimeter flags** — `--no-sandbox`, launcher flag injection,
eight non-loopback Google endpoints, unauthenticated chromedriver, host-global crashpad, all
disclosed in the entry but not fixed in the frozen args; (4) **m4 v4** — CritC2Counter's twelve
grammar/binding defects plus five mutation survivors; (5) **decision-table v2** — nine carried
errata with live reproductions; plus the compatible synthesis (6) **webExtension.install loopback
probe** (ConnFrontier), which turns C1's new BiDi transport into the first instrument for the
Extension↔daemon frontier item and works the round's lowest axis, adjacency 8, harming none.

## What I attacked

Every w1 report under `.ufo/waves/round-32/w1/*.md` (all 36), cross-checked against the landed
integration tree at `b234a58` (read-only lane git only). For each w1 defect I asked: did the
integration bytes close it, record it as a limit, or leave it open? Classification of the
integration's own claims of closure: lesson M1–M5 and QUALITY 83–86 *record* the forgery holes
(criterion 86, M2 "gate v2 planned") and the m4 limits (criterion 83, E21/E24/E26/E27 "recorded
limits") — recording is not closing; the counters are byte-frozen, so no counter defect can be
closed this round. One knowledge defect the reports measured (collector timing) has no recorded
limit in the landed matrix bytes — it is the only *silently open* item.

## Ranked table — round-33 candidate claims

Rank order: severity of the underlying defect × clarity of the falsifiable before→after × axis
value. "Do-nothing control" is the tree that skips the claimed work and must miss the target.

| # | Candidate claim (round 33) | Axis | Falsifiable before → after | Counting command sketch | Do-nothing control |
|---|---|---|---|---|---|
| 1 | **gate v2 for check-bidi-runtime** — distinct row ids, distinct transcript digests per run, driver content ≠ gate (digest + import/re-export scan), first-screenshot splice detection; plus selftest cases for the nine MutC1 survivors and the liveRecord deadline hang | calibration (gate overstates what C1 verifies); coverage | before: entry with `R2`×16 → `admitted 16, clean, exit 0` (CritC1Forgery v2, `e666174`); one transcript path cited twice → `admitted 16` (v3, `7912a62`); driver = 2-line re-export of the gate → `admitted 16` (v1, `b858b5d`); golden synthetic + CDP screenshot → `admitted 16` (v1) → after: each construction scores `distinct<16` / `driverEqualsGate` / `spliceDetected` → `clean=false`, and a `--live` run >60 s aborts instead of hanging | `node scripts/check-bidi-runtime.mjs --rev <REV> --baseline d805d1d… --entry <junk> --live --json` over four committed junk trees (forgery v1–v4 receipts already in `.ufo/waves/round-32/w1/CritC1Forgery/runs/`); plus `node .ufo/waves/round-32/measure/c1-distinct.mjs` reading `{distinctRowIds, distinctTranscriptDigests, driverEqualsGate, driverImportsFromGate, ok}` | the frozen v1 gate admits all four junk trees (`measure/c1-distinct-red-green.txt` red arms, exit 1 on v1/v2/v3); the do-nothing tree is the current counter, which cannot distinguish any of them from the honest receipt |
| 2 | **collector-timing correction** — append-only matrix correction: `maxEncodedDataSize` gates the response's encoded header block on this build, never the body (20 000-byte body returned in full at limit 200); `unavailable network data` never observed (too-small limit → no record at all); `dataType:"request"` needs post data else `unknown error` | calibration (a committed knowledge sentence is false); depth | before: `webdriver-bidi-capability-matrix.md:71` asserts "`maxEncodedDataSize` limits each item" and `:159` (round-13 correction) asserts the body is stored "within that collector's `max encoded item size`" → after: an appended dated correction states the header-block gate with the measured thresholds (first success ~198 B default / ~820 B with +600 B header; `maxTotalCollectedSize` no effect) and the two error-vocabulary facts, citing `:71`/`:159` and the ExecCollectorTiming receipts | `grep -nE "maxEncodedDataSize\\|limits each item\\|max encoded item size" corpus/knowledge/webdriver-bidi-capability-matrix.md` → the two contradicted clauses absent from any post-`:166` appended block; correction cites `webdriver-bidi-capability-matrix.md:71` and `:159` and names `runs/out9…out12` summaries (366 probe cases) | do-nothing = matrix bytes unchanged: the contradicted sentences persist; counting command is the grep above returning the stale clauses with no appended correction block |
| 3 | **BiDi perimeter flags v2** — launch-arg hardening for the frozen counter's `liveRecord`: drop `--no-sandbox`, launch `/usr/lib/chromium/chromium` (or fence the launcher), add resolver-pin/`suppress-all` set, record executed browser argv in the receipt, chromedriver `--url-base` nonce + build check, `--disable-breakpad` | operability (evidence-run hygiene); calibration (claim integrity of "loopback only") | before: frozen five-arg session makes **8 TCP connections to six Google endpoints** (17,821 B out / 41,057 B in, netlog-measured); `--no-sandbox` renderers run Seccomp 0 in the caller's namespace; `~/.config/chromium-flags.conf` is prepended to every launched browser (demonstrated proxy exfil of the "loopback" fixture request); chromedriver answers `/status` 200 from uid `nobody`; crashpad writes to the user's real `~/.config/chromium/Crash Reports` → after: resolver-pin run shows 0 external TCP; sandboxed renderers (Seccomp 2, own user ns); launcher bypassed or flags fenced; driver port unaddressable without nonce; no host-profile crashpad writes | `strace -f -e trace=connect … node probe.mjs` + netlog parse (`ExecNoNetwork/traffic-matrix.json` shape): external TCP count 8 → 0; `probe-d` renderer `/proc/<pid>/status` Seccomp 0 → 2; `sudo -n -u nobody curl http://127.0.0.1:<port>/status` → non-200/connection refused | do-nothing = frozen args re-run: netlog again shows `clients2.google.com`, `accounts.google.com`, `update.googleapis.com`, `www.google.com`, `content-autofill.googleapis.com`, `edgedl.me.gvt1.com` (+`android.clients.google.com`, `csp.withgoogle.com`) |
| 4 | **m4 v4 (statement grammar + supersession binding)** — CritC2Counter D1–D12 + MutC2 survivors m01/m04/m07/m08/m10 + round-28 CNE hole + E26/E27 tally binding | calibration | before: a correction bullet that *quotes* `nudge inactive` is itself parsed as a fresh round-32 statement (3 phantoms, `fx-target-quoted-round32` exit 1); a capability cell whose first digit run is `30` flips rounds 29–31 and manufactures 4 phantoms (`fx-target-safe-poisoncell`); one ordinary sentence containing `correct`, a `SCORECARD.md:` range and `nudge active` clears all three findings (`fx-falseclear`, exit 0); window-far-boundary, prose-capability, self-supersession, verdict-refusal and section-grouping mutants all survive the frozen 41-case selftest → after: v4 binds the marker to `\b(correction|supersedes?)\b`, forbids cross-round range clearing, parses capability cells only on an explicit round token, accepts document-level saturation/window per AXES.md's actual wording, and the five mutant classes are killed by new selftest cases | `node scripts/check-selfassessment.mjs --repo <fixture> --rev HEAD --json` over the three production-path fixtures (quoted-round32 → counted 3; safe-poisoncell → counted 4; falseclear → counted 0) plus `node <mutant> --selftest --json` for m01/m04/m07/m08/m10 (each now fails ≥1 case); round-28 group at `SCORECARD.md:1456` reads a verdict, not CNE | do-nothing = frozen v3: the three fixtures reproduce exactly as filed (CritC2Counter probe transcripts `probe.out`/`probe2.out`/`probe3.out`); the false-clear tree scores `mismatches 0` while being no correction at all |
| 5 | **decision-table v2** — carried errata E3 (example-value admission: `(for example, 30 days)` admits threshold 30), E6–E9 (`--live` attests this host's curl resolution, not the origin: soft-404 echo passes; site-root stands in for the cited document; two unparseable hosts compare equal; PATH-stub curl), E12 (`RangeError: Invalid code point` → exit 1, no verdict line), E13 (row without trailing pipe → clean exit 0, row never read), E14 (literal `|` in a registry cell → `r1-row-missing`), E19 `passed=` arm, E20 (header `:30-33` advertises `cases: N`; extractors `:216`/`:322` cannot match it) | calibration; depth | before: each defect reproduces against the frozen `check-decision-table.mjs` (`d15f3bd7…`) via the ScribeErrataA probe harness (six cases, all admitted/passing in `probe-out.txt`) and the three ScribeErrataB probes (exit 1/0/1 as filed) → after: v2 refuses example values, binds the live leg to the cited origin (host + quote + status), parses trailing pipes safely, rejects/escapes in-cell pipes, parses `passed=` and refuses a short pass count, and reads the colon-form summary it advertises | `node scripts/check-decision-table.mjs --repo <fx> --rev HEAD --json` over the nine committed fixtures (`receipts/probe-erratas.mjs` + `probe-A..D` shapes): each defective input flips from admitted/clean to refused with a named reason | do-nothing = frozen v1 counter: all nine fixtures pass as filed (ScribeErrataA `probe-out.txt` six rows all exit 0 admitted; E12 exit 1 with no verdict line; E13 exit 0 clean; E14 exit 1 `r1-row-missing`) |
| 6 | **webExtension.install loopback probe** (compatible synthesis, ConnFrontier round-33 candidate) — install the kimi-webbridge extension into a throwaway BiDi-session profile and sample loopback `/status` for `extension_connected` / `extension_id` at t≈0, +30 s, +5 min; falsifier: `extension_connected:false` at +5 min with the browser running | adjacency (8, lowest non-retired — unique); coverage (new evidence-operation class: extension lifecycle over BiDi; no R1–R17 row covers it) | before: the Extension↔daemon link is the lane's oldest never-observed state (`extension_connected:false` in every `/status` sample on record; `webbridge-revival-assessment.md:182-200` routes it to user action because no instrument could load an extension into a controlled profile — CDP has no extension-install command) → after: a committed receipt (schema extending `tabi-bidi-runtime-round-32.md` discipline) records `webExtension.install` frames + `/status` samples showing `extension_connected:true`, or a named falsifier outcome | `node scripts/bidi-loopback-round32.mjs`-class driver extended with `webExtension.install`; predicate: committed receipt carries install frames + ≥1 `/status` sample with `extension_connected:true` and the sampled `extension_id`; counter-side binding like t3 (fixture screenshot byte-determinism) | do-nothing = no run: the state stays `extension_connected:false` on record; the falsifier tree (browser up at +5 min, flag still false) is the honest negative; risks: MV3 service-worker attach timing needs a state wait; manifest `1.11.3` vs daemon/extension `2.0.23` reconciliation (census U6) needs a named disposition; a fixture-daemon positive discharges the instrument question, not a real-daemon handshake — the report must name that limit |

Also-ran (carried restatement, not ranked): round-31 routed defect 1's carried part (word-numeral
and `<name>_cases=` tallies; the merged two-bullet correction survivor) and routed defects 2/6
(decision-table v2; round-30 defects 3–4 — gate-mutants + frontier-admission counter v2;
release-pin counter v2) remain `notClaimed`; the lesson's errata table carries 16 of 27. These are
the standing backlog the round-33 SCORECARD block must restate; they do not need new evidence.

## Evidence per candidate (path:line, source report)

### 1. gate v2 — open by record
- `corpus/lessons/round-32.md` M2 (:57): "criterion 86 and the plain distinct counts beside the
  gate's reading … **gate v2 planned**". Criterion 86 (`corpus/QUALITY.md` at `b234a58`) requires
  the plain distinct counts be recorded *beside* the gate's reading — mitigation, not closure.
- `measure/c1-distinct-red-green.txt`: green on the lane receipt (`distinctRowIds 16`,
  `distinctTranscriptDigests 2`, `driverEqualsGate false`, exit 0); red on v2 (`R2`×16 →
  `distinctRowIds 1`, exit 1), v3 (same transcript path twice → `distinctTranscriptPaths 1`,
  exit 1), v1 (driver re-export → `driverReexports true`, exit 1).
- CritC1Forgery D1–D6 (`w1/CritC1Forgery.md`): `t3-binding` binds only screenshot sha +
  chromedriverVersion (`scripts/check-bidi-runtime.mjs:545-552`); population is `rows.length`
  with no dedupe (`:509`, `:580`); `runs.length >= 2` only (`:529`); driver is a path-string
  check (`:528`); `s1` accepts fabricated registry rows (`:511-515`); `clean` has no minimum
  population (`:582`). All four admitted-16 forgeries reproduce at the frozen bytes.
- CritC1Predicates (`w1/CritC1Predicates.md` E7/E12/E13): duplicate ids score
  `population 14, admitted 14, failing 0, clean true`; only `cells[0]`/`cells[3]` are consumed;
  a row whose Surface cell is arbitrary and whose method is CDP admits clean.
- MutC1 (`w1/MutC1.md`): nine single-point mutants survive 27/27 — M04 (cross-run
  chromedriverVersion equality), M06 (`ok()` accepts error frames), M09/M10 (R9/R14 ordering),
  M11 (driver digest unenforced — high), M14 (browserVersion major-only), M17 (loopback
  webSocketUrl unenforced), M18 (R4 dimensions unenforced), M19 (Measured-cell filter).
- RevCounters HIGH-1 (`w1/RevCounters.md`): the 60 s deadline only does `ws.close()`
  (`bidi.freeze.mjs:382`); pending `send()`s never settle → liveRecord hangs forever, leaking
  browser + fixture + scratch; threatens every future `--live` re-run under wave load. LOW-1/2/3
  (cleanup race, freePort TOCTOU, 5ad1 sweep cross-seat) ride along.
- ExecDeterminism (`w1/ExecDeterminism.md`): t3 false-reds under `LANG=ja_JP.UTF-8` /
  `--force-device-scale-factor=2` / `--window-size` viewport (each 3/3 reproducible) and a
  measured false-green (synthetic transcript + authentic screenshot bytes + authentic
  driver-version string → `evaluate(…, live:true)` admitted 2/2, `binding:null`) — t3 binds
  the host build, not an executed browser.

### 2. collector-timing correction — silently open
- At `b234a58`, `corpus/knowledge/webdriver-bidi-capability-matrix.md:71` (§2 Byte-truth row)
  still reads "`maxEncodedDataSize` limits each item and total storage is
  implementation-defined"; `:159` (round-13 dated correction) still reads the body is stored
  "with the body within that collector's `max encoded item size`". Verified by read-only
  `git show b234a58:… | grep` (command log below).
- ExecCollectorTiming (`w1/ExecCollectorTiming.md`): case 3 + sweeps (`runs/out3…out12`, 366
  cases) — 20 000-byte body returned in full at `maxEncodedDataSize:200`; failure threshold
  tracks the response header block (~197 B default, ~810 B with +600 B header, ~1425 B with
  +1200 B), identical for every body 1 B–2000 B; `maxTotalCollectedSize` moves nothing;
  `unavailable network data` never produced; `dataType:"request"` on a bodyless GET →
  `unknown error` / `No post data available`. The counter's own 65536 choice is safe, but any
  future driver lowering the limit "towards the body size will get no data with a misleading
  'no such network data'".
- The landed matrix addendum (`:166+`) covers the narrowing caveats (no wire-truth parity, no
  DOMSnapshot columns, no history list, no `insertText`, no retroactive retrieval, R16, one
  host) but does **not** touch the `:71`/`:159` size-limit clauses — the only w1-measured
  knowledge defect with no recorded limit anywhere in the landed bytes.

### 3. BiDi perimeter flags — disclosed, not fixed
- The entry (`corpus/knowledge/webdriver-bidi-runtime-round-32.md` at `b234a58`) discloses all
  of it (:53 background URL requests to eight non-loopback Google hosts; :163 host launcher
  flags; :170 `--no-sandbox` not needed) — disclosure in a corpus entry is not a fix; the
  frozen counter args still carry `--no-sandbox` and launch `/usr/bin/chromium`.
- SentinelPerimeter F1–F6 (`w1/SentinelPerimeter.md`): F1 `--no-sandbox` needless (renderer
  Seccomp 0 in caller ns vs Seccomp 2 + own user ns without; `scripts/check-bidi-runtime.mjs:401`);
  F2 `~/.config/chromium-flags.conf` prepended to every launch — demonstrated proxy exfil of the
  loopback fixture request off-host; F3 eight Google hosts with live bytes (17,821 out / 41,057
  in); F4 chromedriver unauthenticated on 127.0.0.1 **and [::1]**, `nobody` got `ready:true`,
  `freePort()` race (`:366`); F5 transcripts carry host path + dead session ids (redaction
  list drafted); F6 crashpad writes to the user's real profile dir.
- ExecNoNetwork (`w1/ExecNoNetwork.md`): in a `unshare -rn` namespace all 16 predicates hold
  (loopback-sufficient); on the networked host 8 external TCP attempts; the operative switch is
  the resolver pin (`--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1`), 0 external TCP;
  `--disable-background-networking` alone does not stop the traffic.

### 4. m4 v4 — open by record
- CritC2Counter D1–D12 (`w1/CritC2Counter.md`), each demonstrated end-to-end against the frozen
  v3 bytes: D1 quoted-correction phantoms (exit 1, counted 1615–1617); D2 first-digit-run
  capability cell poisons rounds 31–32 (exit 1, counted 4); D3 any-paragraph-with-`correct`
  false-clear (exit 0, `superseded=true`×3); D4 correction-before-statement never clears;
  D5 state-word line vs `nudge` line attribution (1473 vs 1474); D6 cross-round clearing;
  D7 range clearing; D8 phrasing blind spots (11 variants, 9 missed); D9 same-round-group axes
  requirement tighter than `AXES.md` (round 28 CNE); D10 capability-cell blind spots (name
  cells read as rounds — spurious `1` from `kaika-fleet-round-1`); D11 rule-quotation false
  positives; D12 statements outside `## Round N` invisible.
- MutC2 (`w1/MutC2.md`): five mutants (m01 window far boundary, m04 prose-capability parse,
  m07 self-supersession guard, m08 verdict-refusal when oracle exits 0, m10 round-number vs
  section grouping) survive the frozen 41-case selftest; each killed only by a leg-B fixture.
- CritC2Rule §5 (`w1/CritC2Rule.md`): round 28's statement (`SCORECARD.md:1456`) is
  could-not-evaluate forever (no `Axes at round start:` label) — "permanently exempt from the
  class"; the `:431`/`:737` window-boundary readings disagree at position 3.
- ScribeErrataC E26/E27 (`w1/ScribeErrataC.md`): landed as *recorded limits* (lesson
  "Recorded limits of the v3 calibration counter"), not fixed — `(\d+)-case` has no actor test
  (`:216`/`:322`); `statedTallyNumbers` (`:264-271`) accepts any `N/M` anywhere, so a date or a
  round range can clear a stale tally.

### 5. decision-table v2 — carried with live reproductions
- Lesson errata table at `b234a58`: E3, E6–E9 "carried — counter change refused this round
  (scripts/** frozen after the freeze; decision-table v2 not claimed)"; E1, E4, E5, E10, E12,
  E13, E14, E17, E18, E20 "carried — append-only correction texts drafted … not landed".
- ScribeErrataA (`w1/ScribeErrataA.md`): six-case probe against the frozen counter's own
  `evaluate()` — E3-a/E3-b (example-value admission both ways), E7 (soft-404 echo passes
  `--live`), E8 (site-root stands in for the cited document), E9 (two unparseable hosts compare
  equal), E6 (default fetcher with a PATH-stub curl). The `--live` leg "attests this host's
  curl resolution, not the cited origin".
- ScribeErrataB (`w1/ScribeErrataB.md`): E12 `RangeError: Invalid code point 1114112` at
  `check-decision-table.mjs:141` → exit 1, no verdict line; E13 trailing-pipe row → clean exit
  0 with the row never read; E14 in-cell `|` → `r1-row-missing` (registry audit: 122 rows, 0
  malformed — no live instance). Corrections drafted, not landed.
- ScribeErrataC (`w1/ScribeErrataC.md`): E19 half-closed — `passed=` still parsed nowhere, so a
  `verdict=clean cases=13 passed=11` exit-0 summary is still an oracle; E20 header `:30-33`
  advertises `cases: N` the extractors cannot match. Conflicts recorded verbatim (the landed
  criterion 81/85 premise is v2-bound; the queue header's revision predates two of its own
  items' fixes).

### 6. webExtension probe — the synthesis move
- ConnFrontier (`w1/ConnFrontier.md`, "One bounded proposal"): BiDi `webExtension` module (WD
  §7.10) is the standardized extension-install path CDP lacks; aimed at
  `extension_connected:false` in every `/status` sample on record
  (`webbridge-revival-assessment.md:182-200`; daemon not listening at scan time). Affects
  adjacency (8 — the round's unique lowest non-retired axis; the C1 capability row at
  `SCORECARD.md` `b234a58` restarts the window, so rounds 33–35 derive `nudge inactive` and the
  lowest-axis obligation is back in play) and coverage (extension lifecycle over BiDi — no
  R1–R17 row covers it). Loopback-only, throwaway profile, `/status` shape-only: no other axis
  touched.

## Contradictions (stated, not smoothed)

1. **C1's count semantics.** CritC1Predicates/CritC1Forgery: the capability is real (16/16
   predicates hold on live sessions, independently reproduced by ExecPyClient's Python client)
   yet the target arithmetic `admitted >= 14` is defeated by listing duplicates (16×R2 = 16)
   and the claim's `feasibilityDisclosed` sentence ("not reachable without … a driver other
   than the counter") is false as written (v1 admits with a 2-line re-export driver). Coverage
   gain genuine at 16 *distinct*; the gate's `clean` verdict and the claim's evidence sentence
   disagree. Round 33 must not let a green gate-v2 run be read as closing this until the
   distinct-count predicate is part of the claim.
2. **nudge premise vs promotion policy.** CritC2Rule: all three statements are mis-statements,
   full stop. CritAxisCapability F1: under the lane's own round-24/25 practice (gates entered
   as capability rows), rounds 29–30 derive correctly `inactive` and only round 31 is false —
   the "stale-premise" lesson is half true. Both agree the frozen counter reads the table as
   committed (active); they disagree on whether the statements are mis-statements simpliciter.
   The landed SCORECARD disclosure + criterion 84 adopt "gates never enter the table" as the
   operative rule — that disposes the bookkeeping but not the historical reading.
3. **Refusal-count figures.** ScribeErrataB's carried "103" vs ScribeErrataC's "104" — both
   correct: 103 is v2 at `9505a10e`, 104 is v3 at `4181fff`. A round-33 claim quoting either
   must name the counter bytes, or the same scalar disagreement reopens.
4. **Perimeter vs loopback claim.** The claim and entry say "loopback fixture only";
   ExecNoNetwork/SentinelPerimeter measured real non-loopback egress with the frozen args.
   Both are true at once (navigation is loopback-only; traffic is not) — the contradiction is
   in the word "only", which the perimeter-flags claim (rank 3) exists to retire.

## Commands run (all read-only; lane git untouched for writes; exit codes)

All evidence is from the committed w1 reports and the integration tree; no browser, no network
fetch, no lane script execution, no scratch clone was needed (planning data-walk).

```
cd /home/vgpnk/Projects/shokunin/tabi-shokunin
git log --oneline -5                                            # exit 0 (b234a58 on top of 4181fff)
git log --oneline -1 b234a58920134424e0d104f137311ff54a16d26b   # exit 0
git diff --stat 4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6 b234a58920134424e0d104f137311ff54a16d26b | tail -30   # exit 0
git show b234a58:scripts/check-bidi-runtime.mjs | sha256sum     # exit 0 → 2f25af5a…c393 (= frozenDigests)
git show b234a58:scripts/check-selfassessment.mjs | sha256sum   # exit 0 → 77b5c8ed…c6a9 (= frozenDigests)
git diff --name-only 4181fffb b234a58 -- scripts/               # exit 0 → scripts/bidi-loopback-round32.mjs (counters frozen)
git show b234a58:corpus/QUALITY.md | tail -45                   # exit 0 (criteria 83–86)
ls -la .ufo/waves/round-32/measure/                             # exit 0 (c1-distinct.mjs + red-green receipt)
git show b234a58:corpus/lessons/round-32.md | grep -nE '^\| M[0-9]|^### M[0-9]'   # exit 0 (M1–M5)
git show b234a58:corpus/knowledge/webdriver-bidi-capability-matrix.md | grep -nE "maxEncodedDataSize|max encoded|unavailable network data|header block"   # exit 0 → :71, :153, :159 (correction NOT landed)
git show b234a58:corpus/lessons/round-32.md | sed -n '76,136p'  # exit 0 (errata dispositions; "gate v2 planned")
git show b234a58:SCORECARD.md | awk '/^## Round 32/,0' | …      # exit 0 (corrections/claims/capability row; no carried restatement)
git show b234a58:corpus/knowledge/webdriver-bidi-runtime-round-32.md | grep -nE "LANG|locale|host build|chromium-flags|no-sandbox|distinct"  # exit 0 (perimeter disclosed)
cat .ufo/waves/round-32/measure/c1-distinct-red-green.txt       # exit 0 (green on receipt; red on v1/v2/v3)
mkdir -p .ufo/waves/round-32/w2/ConnTrendsAndNext               # exit 0
pgrep -fa 'chromedriver|chromium' | grep -i conntrends          # exit 1 (no process of mine)
```

## Hygiene, tooling, installs

- Writes: only this report and the (empty) output dir `.ufo/waves/round-32/w2/ConnTrendsAndNext/`.
  No lane tracked file, lane index, jj state, fleet repo, or sibling lane touched; no commits
  anywhere (no scratch clone was created — nothing to delete; `/fast/scratch/hyaku` has no
  `ConnTrendsAndNext` tree).
- Browser/network: no chromium/chromedriver started (the only `pgrep` matches are the host
  `earlyoom` argv pattern and sibling seats' runs); no external fetches — every quoted w1
  measurement is taken from the committed w1 reports and receipts, not re-run.
- Tools: nothing installed or upgraded (no need; read-only analysis). Pacman untouched.
- Honesty: all commands and exit codes are pasted above; every defect cited carries its w1
  report and, where landed bytes are quoted, the `b234a58` path:line or the report's recorded
  scratch-revision evidence. No check was re-run to decorate this report.
