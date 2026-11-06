adjacent (conditional) — C1 is a first-build boundary matrix (the AXES signal and the kotoba-r49 shape), but the frozen predicate admits a null matrix; C2's predicate admits a fabricated receipt.

# R69Critic — attack on C1 (adjacency) and C2 (coverage), tabi round 69

- Judged: lane `tabi-shokunin`, HEAD `d65546b3` (base `58d84eda`, freeze `a033979c`, freeze record `d65546b3`); working-tree `PROVINCE.md` sha256 `700e0d45a9b6e44ff909eb99d882c1f68a989e71ba019b4b5da377f4d0226487`, 35 added lines, archived verbatim at `evidence/draft-PROVINCE-snapshot.md`. The live tree equals the archived copy at the time of writing.
- Read-only: no lane file was edited, no git mutation. Every control lives in `evidence/` beside this report; scratch was `/fast/scratch/hyaku/tabi-r69/R69Critic` (removed).
- The freeze pins re-hash clean (`evidence/00-manifest.sha256`; values match `.ufo/waves/round-69/freeze.txt`): `check-sibling-matrix-r69.mjs` `b62f9c7d…`, `negatives-sibling-matrix-r69.mjs` `dac61e1b…`, `chrome-cdp-synthscroll-round69.mjs` `13ea3f8a…`, `check-synthscroll-r69.mjs` `c1b3763c…`, `negatives-synthscroll-r69.mjs` `37e8f962…`, snapshot `5aa91a58…`; S174 staged `72cf0d1d…324f4`, S173 staged `5bbc6e23…66e3d`. No pin drift.

## 1. Q1 — is C1 an adjacency move by `AXES.md`, or calibration/bookkeeping?

`AXES.md:22` defines adjacency as "Cross-domain awareness — evidence belonging to another domain reported, not absorbed", signal "Lane reports name contested scope; integrator arbitrates".

### 1.1 The case for adjacency

1. **It is a first build, not a re-pin.** At base there is no `## Adjacent` section: the counter exits 1 `matrix-missing`, rows 0, bound 0/20 (`evidence/head-counter.json`, reproduced from `git show d65546b3:PROVINCE.md`). The r66 rejection was a *rebind* of an existing r62 ledger with 0 disposition changes; here the artifact did not exist.
2. **It answers inbound contested scope, which the province never answered.** kake's PROVINCE at the frozen head names tabi on eight lines and declares the Chrome profile lease "contested scope (kagi/tabi/kake)" (`kake PROVINCE.md:45`); tabi's base PROVINCE had no row for it. The committed row cites that exact line and declares `contested`. kengaku (`PROVINCE.md:103`) and kotoba (`PROVINCE.md:76`) are answered the same way — inbound 3/3 (`evidence/live-counter.json`).
3. **Nothing is absorbed.** No sibling file is edited; tabi's `Owns` surface is unchanged; the outbound four (kagi, kaidoku, kake, revenger) keep their routing from the `Refuses` paragraph (`PROVINCE.md:15-17`).
4. **Three of the five `contested` rows are discoveries, not forced labels.** kumitate `contested` (its `PROVINCE.md:14` censuses `~/.kimi-code/` while tabi documents the kimi-webbridge plugin under the same tree as absent), revenger `contested` (REA's `rea-cdp-browser` loopback CDP, `PROVINCE.md:33`), kagi `contested` (the-musketeer 9222 lease, `PROVINCE.md:64`). No counter rule forces any of these; a reader learns something the province did not hold.
5. **The declared limit is honest.** `claims.json` C1 `limit` says relation labels are lane judgment and that the counter binds "citations, reciprocity and routing, not the meaning of each label".

### 1.2 The case for calibration/bookkeeping

1. **The counting command admits a null matrix.** I generated the cheapest passing `PROVINCE.md` (section 2): 17/20 quotes are the sibling's title line, one boilerplate `tabi side` for all 20 rows, labels derived by a `\btabi\b` regex plus tabi's own `Refuses` set. Counter: clean, rows 20, bound 20/20, inbound 3/3, outbound 4/4, findings `[]` (`evidence/cheap2-counter.json`, exit 0). Real-mode battery: 19/19 refused for their expected ids, positive clean (`evidence/cheap2-battery.json`, exit 0). **The full frozen predicate `C1-MATRIX-BOUND` admits it.**
2. **The predicate is one-sided.** It refuses under-claims (`none` where a sibling names tabi or tabi routes to the lane: `check-sibling-matrix-r69.mjs:104,107`) and never refuses over-claims: a variant with 19 `adjacent` + kake `contested` and the same title-line quotes is also clean (`evidence/cheap3-counter.json`). Labels carry no evidence requirement of their own.
3. **It forces three labels lexically.** Applying the independent connector's labels to the same rows yields exit 1, bound 17, findings `inbound-contested-unnamed` (kake) and `inbound-relation-none` twice (kengaku, kotoba) (`evidence/connector-labels-counter.json`). Any `PROVINCE.md` containing the string `tabi` is thereby converted into a non-`none` relation by the meter, not by the lane's judgment.
4. **So the "connector agrees 15/20" line is partly a measurement of the counter.** Of the 5 disagreements between the connector draft (`.ufo/waves/round-69/w1/R69Connector/relations.tsv`) and the committed draft, 3 are counter-forced (kake, kengaku, kotoba) and 2 are judgment (kagi, tameshi) — judgment agreement is 17/20 (`evidence/connector-vs-draft.tsv`).
5. **The quote column establishes which lane, not which boundary.** 10/20 rows quote the sibling's own `PROVINCE.md:3` domain line; 15/20 quotes contain neither `tabi` nor any boundary word (contested/adjacent/refus/scope/overlap/split/boundary/handoff/routes). The boundary lives in the `tabi side` cell, which no check reads beyond length ≥ 4 words (`:95`).

### 1.3 Precedent — kotoba

- kotoba's `PROVINCE.md:57-77` is the same artifact shape (lane | classification | commit | boundary), and its round-49 entry scores exactly this move as **adjacency**: `SCORECARD.md:335` records "0 classified, pinned rows in `PROVINCE.md` § Adjacent @ `a5adc146` → 20 @ `f054b8e`; guard `rows 20 verified 20`". Its later re-pin is recorded as **freshness** (`PROVINCE.md:33`; `SCORECARD.md:515`). First build = adjacency, re-pin = freshness — which supports C1.
- Two differences cut the other way. (i) kotoba's guard binds classification to a separately written census artifact ("lane set, classification and commit"); the boundary text is explicitly *not* checked (`PROVINCE.md:50`). tabi's counter has no classification ground truth at all — it binds citations only. (ii) kotoba's matrix is 4 columns with no per-row quote; tabi's is strictly more bound, but the extra binding is citation discipline, not cross-domain judgment.

### 1.4 Verdict

**adjacent (conditional).** The artifact is the AXES adjacency surface — a first build that answers an unanswered inbound contested declaration, declares five contests (three unforced), and routes four outbound, on the kotoba-r49 precedent. It is not a r66-style rebind and not bookkeeping.

The condition is on the *evidence sentence*, not the work: `SCORECARD.md:3642` says "adjacency 8 → 9 claimed (re-derivable by the command above)". That sentence is false of the command — the command greens the null in section 2. The band move is re-derivable only as (countable part) 20 rows bound at the frozen heads + 3/3 inbound + 4/4 outbound + 19/19 battery, and (judged part) the five contested rows with their reasons and the two judgment disagreements named. If the row keeps the current wording, the move is operability+calibration (a new cited census instrument) and the canonical judge should reject the adjacency band move; with the split sentence, the move stands on content. This is a fixable defect (verdict prose), not a predicate amendment — the predicate is frozen and must stay so.

## 2. Q2 — the cheapest `PROVINCE.md` that passes C1, and what it proves

**Construction** (`evidence/gen-cheap.mjs`, 60 lines, no domain reading): for each of the 20 frozen lanes, read `git show <head>:PROVINCE.md`; set `relation = none`; if the file matches `/\btabi\b/i` set `adjacent`, or `contested` if any matching line also matches `/contested/i`; else if tabi's own `Refuses` names the lane set `adjacent`. Cite the first line with 3–25 words and quote it; write one constant `tabi side` for every row. That is the whole generator.

**Result** (`evidence/cheap2-PROVINCE.md`, `cheap2-rows.md`, `cheap2-counter.json`, `cheap2-battery.json`):

| measure | cheapest control | committed draft |
|---|---|---|
| counter | exit 0, rows 20, bound 20/20, findings `[]` | exit 0, 20/20, findings `[]` |
| real-mode battery | exit 0, 19/19 refused, positive ok | exit 0, 19/19 |
| quotes that are the sibling's `PROVINCE.md:1` title line | 17/20 | 0/20 |
| quotes citing the sibling's `PROVINCE.md:3` domain line | 0 | 10/20 |
| distinct `tabi side` strings | 1/20 | 19/20 |
| non-`none` relations | 6 (4 outbound + 3 inbound − kake counted once) | 9 (all judgment-bearing) |

The over-claim variant (19 `adjacent`, kake `contested`) is also clean (`evidence/cheap3-counter.json`). **The predicate admits both the null and the over-claim.**

**What a non-author has to check to tell it from real work** (none of this is in the predicate):

1. **Quote provenance per row.** Read the cited line at the frozen head (`git -C <lane>-shokunin show <head>:PROVINCE.md | sed -n '<line>p'`). If it is the title/domain line, the row establishes *which lane*, not *which boundary*. Cheap control: 17/20 title lines; draft: 10/20 domain lines — the draft is better but not clean.
2. **Relation justification against the sibling's bytes.** For each non-`none`, the sibling sentence that shows the overlap: kumitate `:14` (kimi census), revenger `:33` (rea-cdp-browser), kagi `:64` (9222 lease), kaidoku `:55` (`chromium --headless --remote-debugging-port=9222`), kake `:45` (contested lease), kengaku `:103`, kotoba `:76`. This is the judgment the score is supposed to measure, and it is invisible to the counter.
3. **The `none` set.** Sweep each `none` lane's `PROVINCE.md` *and* `SKILL.md` at the frozen head for tabi's surface vocabulary (cdp, chromium, browser, headless, devtools, webbridge, screenshot, crawl, webview). I ran it (`evidence/inbound.json`): no `none` lane claims a browser/CDP surface — the hits are Godot `--headless`, desktop screenshots, audio headless fixtures, desktop rendering. No sibling names tabi *only* in `SKILL.md`, so PROVINCE-only reciprocity missed no lane at this snapshot. The `none` set is defensible, but only this sweep (or a semantic read) can say so.
4. **Side specificity.** 20 distinct sides vs 1. A byte-identical side across rows is the cheapest tell.
5. **The independent draft.** 17/20 judgment agreement, 2 disagreements (kagi `contested` vs `adjacent`, tameshi `adjacent` vs `none`), 3 counter-forced labels. A closure must read the two, not the 15/20 headline.

`kaidoku` is the test case: at my first read the row was `adjacent` with the domain-line quote; the archived snapshot has `contested` with `PROVINCE.md:55`. Both pass the counter. The latter is the better row (the connector found the CDP launch independently); the counter cannot prefer it. That is the whole discrimination problem in one row.

## 3. Q3 — the cheapest C2 receipt/route that meets (a)-(d) without the capability

**Construction** (all in `evidence/`, clearly labelled controls, not runtime evidence):

1. **(a)** Start from the scored receipt, rewrite the nonce in all 6 places it appears (`nonce`, `nonceOnPage`, the page URL, the `Runtime.evaluate` expression's nonce literal, `serverLog[0].query`, `serverLog[0].run`) and replace the host identity with `Chromium 999.0.0.0 forged` / `Chrome/999.0.0.0`. Counter: **exit 0, 63 checks, findings `[]`** with the frozen `--expect-driver-sha256` (`evidence/control-forged-seat-receipt.json`, `forged-counter.json`). No browser ran.
2. Stronger, on the same receipt: empty `host.argv`, empty `host.stderrHead`, `fixture.sha256 = 0…0` → **exit 0** (`control-mut-no-stderr.json`, `nostderr-counter.json`). The only external-origin artifact (Chrome's own `DevTools listening on ws://…` line) and the fixture hash are not checked at all.
3. All event `ts = 0` and all `legs[].elapsedMs = 0` → **exit 0** (`control-mut-zero-times.json`). The timeline is unconstrained.
4. Wheel deltas redistributed inside a leg with the sum preserved → **exit 0** (`control-mut-events-redistributed.json`). The event pattern is pinned only by sum/direction/range.
5. **(b)** the same artifact under a new nonce passes the same counter with the same pin. The counter takes one receipt and never compares runs; there is no expected-nonce-differs or cross-receipt check.
6. **(c)** 41 of the battery's 44 negatives are mutations of whatever receipt is passed as `--real` (the other 3 are the committed laundered degenerates). Passing the forged receipt: **44/44 refused for expected ids, positive ok, exit 0** (`forged-battery.json`), and the same for the no-stderr mutant (`nostderr-battery.json`). The battery tests the counter; it cannot detect a fabricated positive.
7. **(d)** two text rows: the capability row (`SCORECARD.md:3649`) and the knowledge note (`corpus/knowledge/chromium-synth-scroll-gesture-runtime-round-69.md`, `source: S174`). No predicate.

**Is (b) + the pin enough?** No, as automated discrimination:

- The pin is **self-attested**. `check-synthscroll-r69.mjs:42` compares `r.driverSha256` to the flag and never reads the driver; the driver writes that field by hashing itself (`chrome-cdp-synthscroll-round69.mjs:225`). Anyone can write the same string.
- (b) has no cross-run check. A byte-copy passes; a nonce-rewritten copy passes (above).
- Nothing binds the receipt to a live browser. No absolute timestamp: the receipt and the driver stdout contain no wall-clock, so "produced after the freeze" rests on commit order (freeze commit 15:50:03, receipt committed later) — not on the artifact.

**What actually discriminates here** (and it does hold for this round):

- The **honest seat run is real**: R69Exec1's receipt differs from the scored receipt in **387 leaf paths** — nonce, `launchToken`, port (40502 vs 41831), profile path, `stderrHead`, 370 event timestamps, event count 170 vs 171 (`evidence/scored-vs-seat-diff.json`, `diff-receipts.mjs`). That is a different execution, not a copy.
- The **pinned driver source is auditable**: the receipt-producing path launches `/usr/bin/chromium` (`:232`, `:269`), rejects CDP errors (`:288`), calls `Input.synthesizeScrollGesture` (`:326`) and captures Chrome's stderr (`:338`). A reader can see there is no browser-free branch.
- But those are **manual checks**: read the diff, read the source. The frozen predicate does neither.

**Smallest safe correction (no predicate amendment):** in the round report, present (a)/(b) as *manual provenance*: the 387-leaf a↔b diff, both committed driver stdout/stderr files with their nonces, and the driver-source pointer; do not present "63 checks" or "44/44" as proof of a live run — they are receipt-internal consistency and counter coverage. Route the counter gaps to r70 as a calibration claim with failing-before controls: timeline monotonic and non-zero; `host.stderrHead` carries the DevTools line and its port equals the launched port; `host.argv` non-empty with `/usr/bin/chromium`; `fixture.sha256` recomputed from the committed fixture; `startedAt` + `freezeCommit` in the receipt; and a two-receipt mode (nonce/port/launchToken differ, event-ts series differ). Even those are forgeable by a determined author — the only non-forgeable witness is an independent re-run, which is what (b) is meant to be; say so.

## 4. Impacted axes and corrections

| axis | C1 | C2 |
|---|---|---|
| adjacency | claimed 8 → 9: supported by the rows' content and the kotoba precedent, **not** by the counting command (null admitted) | unchanged |
| coverage | unchanged | 9 held; the capability is real in fact (honest seat run), but the predicate's proving power is lower than the claim implies |
| calibration | "re-derivable by the command above" overstates: the command cannot distinguish the work from the control | "63 checks" is internal consistency; five dimensions unguarded (timeline, stderr/port, argv, fixture hash, cross-run) |
| operability | new counter + 19-negative battery: real, re-runnable | new driver + counter + 44-negative battery: real, re-runnable; battery gaps already routed by R69Mut2 |
| freshness | frozen-head pins verified; matrix present at the frozen heads | S174/S173 pins verified; receipt has no absolute time, so freeze ordering is commit-order evidence |
| depth | unchanged | unchanged |

**C1 corrections (report/SCORECARD prose only — the predicate, counter, battery, snapshot and kill rules stay frozen):**
1. Replace "re-derivable by the command above" with the two-part sentence (countable counts; judged rows + the 2 judgment disagreements kagi/tameshi, with the 3 counter-forced labels named). This is the whole fixable defect.
2. Anchor the scored `PROVINCE.md` digest in the round report (it is `700e0d45…` now; the working tree moved during this review and both states passed).
3. Strongest cheap addition: one `why` clause per non-`none` row naming the sibling sentence that shows the overlap (kumitate `:14`, revenger `:33`, kagi `:64`, kaidoku `:55`, kake `:45`). That is what makes the judgment checkable by a non-author, and it is content, not a rule change.

**C2 corrections:** as in section 3 (manual provenance in the report; five counter dimensions + cross-run mode as an r70 calibration claim). Do not touch the frozen instrument now.

**Minor (r70):**
- The counter parses the first `## Adjacent — sibling matrix` heading; the battery's `matrix-removed` negative replaces only the first. With a duplicated section the counter is clean but the battery fails (`evidence/dup-section-counter.json`, `dup-section-battery.json`, `failed: ["matrix-removed"]`). Single-heading should be asserted (`duplicate-section` finding).
- Reciprocity is lexical and PROVINCE-only (`:99`). No lane names tabi only in `SKILL.md` at this snapshot, so 3/3 is complete here; the rule should say so or scan both files.

## 5. What I did not find

- No pin or snapshot drift; no sign of fabrication in the actual scored or seat receipts (the seat receipt is genuinely independent).
- No `none` row contradicted by a browser/CDP claim in that sibling's `PROVINCE.md` at the frozen head.
- No sibling claims tabi's scope only in `SKILL.md`.
- The `claims.json` before-values reproduce: base exit 1 `matrix-missing`, 0/20; no-receipt C2 exit 2; the committed fixture battery is 19/19.

## 6. Reproduction and evidence

Run `evidence/repro.sh` (read-only, absolute paths, its own scratch). Key commands:

```
cd /home/vgpnk/Projects/shokunin/tabi-shokunin
# C1 null
S=$(mktemp -d -p /fast/scratch/hyaku/tabi-r69/R69Critic r.XXXX); git show d65546b3:PROVINCE.md > $S/head.md && node scripts/check-sibling-matrix-r69.mjs --province $S/head.md \
  --snapshot .ufo/waves/round-69/c1/sibling-heads-r69.tsv --fleet /home/vgpnk/Projects/shokunin --json   # exit 1 matrix-missing
# C1 cheapest passing matrix + battery
node scripts/check-sibling-matrix-r69.mjs --province .ufo/waves/round-69/w1/R69Critic/evidence/cheap2-PROVINCE.md \
  --snapshot .ufo/waves/round-69/c1/sibling-heads-r69.tsv --fleet /home/vgpnk/Projects/shokunin --json      # exit 0, bound 20
node scripts/negatives-sibling-matrix-r69.mjs --province .ufo/waves/round-69/w1/R69Critic/evidence/cheap2-PROVINCE.md \
  --snapshot .ufo/waves/round-69/c1/sibling-heads-r69.tsv --fleet /home/vgpnk/Projects/shokunin \
  --work /fast/scratch/hyaku/tabi-r69/R69Critic/b --out /fast/scratch/hyaku/tabi-r69/R69Critic/b.json  # 19/19, exit 0
# C2 forged receipt
node scripts/check-synthscroll-r69.mjs --receipt .ufo/waves/round-69/w1/R69Critic/evidence/control-forged-seat-receipt.json \
  --expect-driver-sha256 13ea3f8ae67fb7761a94c4763e575c9ee487905dd9b405d916d55fca562abce3 --json       # exit 0, 63 checks
# C2 (a) vs (b)
node .ufo/waves/round-69/w1/R69Critic/evidence/diff-receipts.mjs \
  corpus/evidence/round69/chromium-synth-scroll-gesture/receipt.json .ufo/waves/round-69/w1/R69Exec1/receipt.json
```

Evidence (all with sha256 in `evidence/00-manifest.sha256`): `draft-PROVINCE-snapshot.md`, `head-PROVINCE.md`, `head-counter.json`, `draft-counter.json`, `live-counter.json`, `live-battery.json`, `cheap2-PROVINCE.md`, `cheap2-rows.md`, `cheap2-counter.json`, `cheap2-battery.json`, `cheap2-stats.json`, `cheap3-all-adjacent-PROVINCE.md`, `cheap3-counter.json`, `connector-labels-PROVINCE.md`, `connector-labels-counter.json`, `connector-vs-draft.tsv`, `inbound.json`, `dup-section-PROVINCE.md`, `dup-section-counter.json`, `dup-section-battery.json`, `control-forged-seat-receipt.json`, `forged-counter.json`, `forged-battery.json`, `control-mut-no-stderr.json`, `nostderr-counter.json`, `nostderr-battery.json`, `control-mut-zero-times.json`, `zerotimes-counter.json`, `control-mut-events-redistributed.json`, `redistributed-counter.json`, `scored-vs-seat-diff.json`, `gen-cheap.mjs`, `forge-receipt.mjs`, `diff-receipts.mjs`, `repro.sh`.
