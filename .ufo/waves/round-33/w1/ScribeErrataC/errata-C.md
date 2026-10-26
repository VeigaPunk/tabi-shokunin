# Errata intake C — round-32 w1 findings without a landing line

Seat: ScribeErrataC (scribe, leaf, round-33 w1, frontier milestone). Scope: `.ufo/waves/round-32/w2/ConnRoutedLedger.md`
(the 19 medium-or-higher w1 findings its §A records as silent drops) and `.ufo/waves/round-32/w2/CritReadmeLog.md`
(F1–F5), re-checked against the round-33 freeze `e6b0a9074d434ccc307badd312ae7379d1193fea`. Every line number below is a
blob line at `e6b0a90` unless another revision is named. Lane scripts were run only in a `git clone --shared` of the lane
detached at the freeze; the lane checkout and index were never written.

Deliverable of this seat: this ledger and the copy-ready append-only texts in §4. **Seats never edit lane files** — the L1
applies them.

## Verdict (one paragraph)

Of the 19, **13 need a landing and get an exact append-only text here** (A.1, A.2, A.5, A.6, A.7, A.9, A.13–A.19);
**5 are already closed by a landing line written after the ConnRoutedLedger report** (A.3 and A.4 by lesson round-32 M7
`corpus/lessons/round-32.md:143`; A.10–A.12 by M6 `:142`); and **exactly one is closed by this round's claim** — A.8
(CritC1Forgery D5) through C2's frozen forgery F8 (`.ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs:190`), which
requires gate v2 to refuse a junk mined source row. The item's premise that "C2 gate v2 closes MutC1/CritC1Forgery items"
holds for the CritC1Forgery half only: **the frozen C2 predicate encodes none of the five MutC1 survivors A.3–A.7**
(F1–F7 carry D1–D4 and MutC1Entry; F5/F6 test driver *content* ≠ gate, not the recorded-digest↔blob arm M11 names, and no
F case exercises M06's error frame, M04's cross-run driver version, M18's well-formed-wrong-IHDR PNG or M17's non-loopback
`webSocketUrl`). C2's `priorClosure` text ("MutC1 survivors as cases") and `SCORECARD.md:1689-1691`'s plan carry them, but
the frozen predicate verifies `--selftest` exit 0 only, so the five stay **landed-by-line, not verified-closed**: A.3/A.4
by M7's naming, A.5–A.7 by the new text below, with the flip "one selftest case per survivor, red on the mutant and green
on the lane receipt". Of the CritReadmeLog five, **F1 is closed at the freeze** (the round-32 after-readings and the
disposition block landed, and the measured revision resolves); **F2, F3, F4 and F5 stand** and get append-only
corrections (two in `corpus/README.md`, two in `LOG.md`). Nothing here needs a refusal: every re-checked finding is either
true at `e6b0a90` and worth a line, or already answered.

## Table 1 — the ConnRoutedLedger 19 (medium-or-higher w1 findings with no landing line)

| Finding id | Source report | Disposition | Target line |
|---|---|---|---|
| A.1 | ConnRoutedLedger §A.1 — RevCounters HIGH-1 (`liveRecord` deadline closes the websocket only) | land | round-33 lesson, §Errata intake C, bullet "C1 gate v1 live leg" (append after `## Mistakes`; fallback `corpus/lessons/round-32.md:187`) |
| A.2 | ConnRoutedLedger §A.2 — RevCounters MEDIUM-1 (refused-oracle consequence) | land | same section, bullet "A refused oracle removes its mismatches" |
| A.3 | ConnRoutedLedger §A.3 — MutC1 M11 (driver `driverSha256`↔blob equality unenforced by any case) | closed-already | `corpus/lessons/round-32.md:143` (M7 names `driverSha256` equality as one of the two worst) |
| A.4 | ConnRoutedLedger §A.4 — MutC1 M06 (`ok()` accepts error frames) | closed-already | `corpus/lessons/round-32.md:143` (M7 names error-frame `ok()`) |
| A.5 | ConnRoutedLedger §A.5 — MutC1 M04 (cross-run `chromedriverVersion` equality) | land | same section, bullet "C1 gate v1 selftest gaps M04, M18 and M17" |
| A.6 | ConnRoutedLedger §A.6 — MutC1 M18 (R4 PNG width/height equality for well-formed PNGs) | land | same bullet |
| A.7 | ConnRoutedLedger §A.7 — MutC1 M17 (loopback-only `webSocketUrl` has no R1 detector) | land | same bullet |
| A.8 | ConnRoutedLedger §A.8 — CritC1Forgery D5 (`s1` accepts a fabricated registry row) | landed-this-round-by-claim | `.ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs:190` (F8) + `claims.json` C2 predicate (conditional on C2 met at REV) |
| A.9 | ConnRoutedLedger §A.9 — CritC1Predicates defect 3 (Surface/BiDi-method/Evidence cells unread; E13) | land | same section, bullet "The gate never reads the entry's Surface, BiDi-method or Evidence cells" |
| A.10 | ConnRoutedLedger §A.10 — CritC2Counter D1 (correction quoting the stale phrase read as a fresh statement) | closed-already | `corpus/lessons/round-32.md:142` (M6 names it) |
| A.11 | ConnRoutedLedger §A.11 — CritC2Counter D2 (capability cell starting 29–31 flips rounds) | closed-already | `corpus/lessons/round-32.md:142` (M6 names it) |
| A.12 | ConnRoutedLedger §A.12 — CritC2Counter D3 (any `correct` + range + state word clears a finding) | closed-already | `corpus/lessons/round-32.md:142` (M6 names it) |
| A.13 | ConnRoutedLedger §A.13 — CritC2Counter D4 (correction placed before the statement never clears) | land | same section, bullet "m4 supersession grammar (D4–D10)" |
| A.14 | ConnRoutedLedger §A.14 — CritC2Counter D5 (finding line is the `nudge` line `:1473`, not `:1474`) | land | same bullet |
| A.15 | ConnRoutedLedger §A.15 — CritC2Counter D6 (correction's own round unchecked) | land | same bullet |
| A.16 | ConnRoutedLedger §A.16 — CritC2Counter D7 (one range citation clears every round in range) | land | same bullet |
| A.17 | ConnRoutedLedger §A.17 — CritC2Counter D8 (nine phrasing variants invisible) | land | same bullet |
| A.18 | ConnRoutedLedger §A.18 — CritC2Counter D9 (inputs must sit in the same round group) | land | same bullet |
| A.19 | ConnRoutedLedger §A.19 — CritC2Counter D10 (capability-cell parsing blind spots) | land | same bullet |

Counts: closed-already 5 · landed-this-round-by-claim 1 · land 13 · refuse 0 · carry 0.

## Table 2 — the CritReadmeLog five (named in this seat's item alongside the 19)

| Finding id | Source report | Disposition | Target line |
|---|---|---|---|
| CR-F1 | CritReadmeLog F1 (medium — LOG after-readings and README admission had no committed measurement at `b234a58`) | closed-already | `LOG.md:2228` (round-32 disposition paragraph; the `After:` pointers at `:2181`/`:2185` now resolve) + `.ufo/waves/round-32/measure/provenance-0808688.txt:1` (rev resolves, ancestor of `e6b0a90`; `porcelain=0`, both frozen digests named) |
| CR-F2 | CritReadmeLog F2 (low — "CASES table holds 41" is false; 39 + 2) | land | append `corpus/README.md` after `:757` (file end at the freeze) |
| CR-F3 | CritReadmeLog F3 (low — m1 claim set mis-enumerated as 17/22/30; causal clause) | land | append `LOG.md` after `:2230` (file end at the freeze) |
| CR-F4 | CritReadmeLog F4 (low — README "three contracts" set swaps `insertText` for wire-truth parity) | land | append `corpus/README.md` after `:757` |
| CR-F5 | CritReadmeLog F5 (low — "16 admittable predicates … before the freeze" has no artifact) | land | append `LOG.md` after `:2230` |

## §1 — Why A.3/A.4 are closed but A.5–A.7 are not

M7 (`corpus/lessons/round-32.md:143`) reads: "9 of 20 mutants of the C1 gate survive its 27-case selftest
(`driverSha256` equality and error-frame `ok()` the worst)". That names M11 (A.3) and M06 (A.4) and their class; it does
not name M04, M18 or M17, which `.ufo/waves/round-32/w1/MutC1.md:41,54,55` record as survivors at 27/27 PASS, exit 0. The
ConnRoutedLedger fix shape asked for "one bullet naming … the four survivor classes"; half of it exists at `:143`, so the
remaining three get the bullet in §4.

## §2 — What C2's frozen predicate does and does not close (A.8, and the five it does not)

- **A.8 (D5) is closed by forgery F8.** The battery's variant list (`c2-bidi-forgery-battery.mjs:35-41`) maps F8 to "junk
  source: a new `mined` S990 row (`https://e.test/`) naming the entry, cited alone on the entry's `source:` line", and the
  builder is at `:190`. The frozen predicate requires `forgeriesAccepted 0`, so a v2 that admits a fabricated registry row
  fails C2. This is the only one of the 19 whose exact construction the predicate exercises.
- **F1–F7 never build the five MutC1 survivors.** F1 = golden splice (D1); F2 = duplicate ids (D2); F3 = same path twice
  and F4 = byte copy (D3); F5 = gate-copy driver and F6 = re-export driver (D4 — the *driver content* arm); F7 = decorated
  `Measured` cell (`yes (live)`, MutC1Entry). M11's construction — a present driver blob with a wrong recorded
  `driverSha256` (`.ufo/waves/round-32/w1/MutC1.md:63`) — is not built by F5/F6, whose receipts carry
  `driverSha256 = sha256(driver blob)`. M06's error frame carrying a `result` (`:64`), M04's divergent
  `chrome.chromedriverVersion` (`:65`), M18's valid 100x100 PNG (`:66`) and M17's `ws://10.0.0.1:9515/…` URL (`:67`) are
  not built either.
- C2's own texts route the obligation without verifying it: `claims.json` `priorClosure` says "MutC1 survivors as cases",
  and `SCORECARD.md:1689-1691` plans "a selftest case per w1 MutC1 survivor". The frozen predicate checks only
  `--selftest` **exit 0** (`c2-bidi-forgery-battery.mjs` `out.predicate`), so a v2 whose suite omits those cases still
  passes. The v2 registry append states receipt-provenance rules (`.ufo/waves/round-33/w1/ScribeSkillRows/skill-append.md`
  rules 1–3) that would refuse some of these constructions at runtime, but that deliverable was not integrated and not run
  by this seat; it is not evidence for closure here.
- **Recommendation to the L1** (not a repair by this seat): accept A.3/A.4 as line-landed, land A.5–A.7 as text, and have
  wave 2 build the five survivor constructions against v2 — each must be refused by the gate or killed by its selftest
  case. Do not record C2 as having verified the five.

## §3 — Per-item re-check (evidence at `e6b0a90`)

- **A.1 (RevCounters HIGH-1).** `scripts/check-bidi-runtime.mjs:394`:
  `const deadline = setTimeout(() => { try { ws && ws.close(); } catch {} }, timeoutMs);`. `send()` resolves only from
  `ws.onmessage` (the w1 report traces `:402-418` at its blob; the same shape at the freeze), so a fired deadline leaves
  pending sends unsettled: the counter, chromedriver, chromium, `serveFixture()` and the scratch dir are never released.
  `--live` is outside C2's predicate by the claim's own kill rule. No line in the freeze documents it: `git grep -n
  'deadline'` over `corpus/lessons/round-32.md`, `SCORECARD.md`, `corpus/QUALITY.md`, `LOG.md`, `corpus/README.md` → no
  match.
- **A.2 (RevCounters MEDIUM-1 consequence).** Criterion 85 (`corpus/QUALITY.md:514-521`) landed the "not an oracle"
  mechanism, and `measure/c2-refusal-mutant.txt` is the red/green. The consequence — a zero mismatch count reachable by
  breaking an unfrozen gate's self-test — is recorded nowhere (`git grep -n 'unfrozen'` over the five landing documents →
  no match).
- **A.3/A.4.** Named at `corpus/lessons/round-32.md:143` (M7); see §1.
- **A.5–A.7.** Not named in any of the five landing documents (`git grep -n -i 'cross-run\|PNG dim'` → no match; "row id"
  hits are the criterion-86 rule, not these survivors).
- **A.8.** Closed by C2's F8; see §2.
- **A.9.** `scripts/check-bidi-runtime.mjs:508` filters `cells[3] === "yes"` and `:560` reads `cells[0]`; the entry's
  Surface, method and Evidence cells are never read, as `.ufo/waves/round-32/w1/CritC1Predicates.md` E12/E13 execute. The
  freeze records no such line (`git grep -n 'hand-review\|cells\['` over the landing documents → only criterion 86's
  distinct-count rule, which is about counts, not cells).
- **A.10–A.12.** `corpus/lessons/round-32.md:142` (M6) names all three constructions verbatim in its evidence cell.
- **A.13–A.19.** M6's evidence cell names only the three D1–D3 shapes; D4–D10 appear nowhere in the landing documents
  (`git grep -n 'before the statement\|range citation\|same round group'` → no match).
- **CR-F1.** `.ufo/waves/round-32/measure/` at the freeze holds `c1-live-at-0808688.json` (population 16, admitted 16,
  failing 0, `live: true`, `rev: 08086884d425b879f020af82fc6e57180e991a3e`), `c1-offline-at-0808688.json`,
  `c2-at-0808688.json`, `c2-numstat-at-0808688.txt` and `provenance-0808688.txt` (`rev=…`, `porcelain=0`, both frozen
  digests). `git cat-file -t 0808688` → `commit`; `git merge-base --is-ancestor 0808688 e6b0a90` → exit 0. The LOG's two
  `After:` pointers (`:2181`, `:2185`) resolve to the `Round-32 disposition:` paragraph at `:2228`; `SCORECARD.md:1667`
  opens the executed-disposition block. F1's assertion is answered.
- **CR-F2.** `corpus/README.md:745` still reads "v3's CASES table holds 41 isolated scenarios"; the frozen script holds
  39 line-start case ids (`grep -cE '^\s{4}id: "'` → 39) and 2 `results.push(` sites, so 41 = 39 table cases + 2 refusal
  cases appended in `runSelftest`. F2 stands.
- **CR-F3.** `LOG.md:2172-2173` still reads "claimed 17/22/30 against observed 41, the 15 induced by v3's 11 added cases,
  30 → 41". Re-running the frozen v3 at `4181fffb` (this seat's run, exit 1) gives 15 m1 claims in counter order
  `17,22,22,30,13,17,20,22,30,30,30,30,30,17,30` — distinct set `{13, 17, 20, 22, 30}` — and 8 of them (17×3, 22×3, 13,
  20) state a figure below 30. F3 stands, with the set and the 8-of-15 clause verified by this seat.
- **CR-F4.** `corpus/README.md:725-729` names wire-truth parity, DOMSnapshot's columnar shape and the history-entry list
  as "the three contracts the matrix names as unmatched"; the entry §6 (`:149-151`) and the matrix §Rejected
  (`webdriver-bidi-capability-matrix.md:100-102`) name DOMSnapshot's columnar shape, the history-entry list and
  `insertText`; the matrix's §3 gap list (`:84-86`) adds CDP's raw `ExtraInfo` header block and the byte-exact status
  line, and the frontier row at `:735` lists `insertText` among five unmatched items. F4 stands.
- **CR-F5.** `LOG.md:2165-2166` still reads "the 16 admittable predicates the counter's own live leg held before the
  freeze". At the freeze the offline control admits 16 with `live:false`
  (`baseline/c1-J3-forgery-offline.json`), and every live leg admits 0 with 16 failing (`c1-J2-docs-only.json`,
  `c1-J3-forgery-live.json`, `c1-J4-counter-as-driver.json`); the live 16-admitted reading is post-integration
  (`measure/c1-live-at-0808688.json`). F5 stands.

## §4 — Exact append-only texts (copy-ready; L1 applies)

### L-1 — round-33 lesson (`corpus/lessons/round-33.md`)

Insert after the `## Mistakes` block (file end if the lesson is appended to). If the round-33 lesson is frozen in a shape
that cannot take a new section, append the same block after `corpus/lessons/round-32.md:187`.

```markdown
## Errata intake C — round-32 w1 findings without a landing line (append-only)

Re-checked at `e6b0a9074d434ccc307badd312ae7379d1193fea` against `.ufo/waves/round-32/w2/ConnRoutedLedger.md`
(19 medium-or-higher w1 findings) and `.ufo/waves/round-32/w2/CritReadmeLog.md` (F1–F5); the ledger is
`.ufo/waves/round-33/w1/ScribeErrataC/errata-C.md`. Named by a landing line at that revision: A.3 and A.4 (lesson
round-32 M7), A.10–A.12 (M6); closed by this round's claim: A.8 (C2, forgery F8). The rest are recorded here.

- **C1 gate v1 live leg: the deadline closes the websocket only (RevCounters HIGH-1).**
  `scripts/check-bidi-runtime.mjs:394` — `const deadline = setTimeout(() => { try { ws && ws.close(); } catch {} }, timeoutMs);`
  — settles no pending or later `send()`: the client's send on a closed socket is a no-op, so a wedged session hangs the
  counter with chromedriver, chromium, the fixture server and the scratch dir leaked and the CLI never exiting
  (`.ufo/waves/round-32/w1/RevCounters.md`, HIGH-1). C2's frozen predicate is the receipt leg (`claims.json` C2 killRule:
  "The `--live` leg is not part of this predicate"); the v2 live-leg change (real binary, no `--no-sandbox`) does not
  touch this arm. Flip: the live leg rejects every pending send on the deadline and a control shows the counter exiting
  after a wedged session.
- **A refused oracle removes its mismatches (RevCounters MEDIUM-1, consequence).** Criterion 85 landed the mechanism;
  the claim-level consequence is recorded here: at REV, breaking an *unfrozen* gate's self-test silently removes that
  gate's mismatches, so a zero mismatch count is reachable without honest corrections for any tally naming an unfrozen
  gate; only protocol guards the unfrozen gates (`.ufo/waves/round-32/w1/RevCounters.md`, MEDIUM-1).
- **C1 gate v1 selftest gaps M04, M18 and M17.** M7 names `driverSha256` equality and error-frame `ok()` as the worst of
  nine surviving mutants; these three are the unnamed rest: cross-run `chromedriverVersion` equality is unenforced (M04),
  R4's PNG width/height equality is unexercised because the failing case supplies non-PNG bytes (M18), and no case ships
  a non-loopback `webSocketUrl`, so the loopback-only contract has no R1 detector in the suite (M17). Each survived the
  27-case selftest at 27/27 PASS, exit 0; each names its killing case in `.ufo/waves/round-32/w1/MutC1.md`. Flip: one
  selftest case per survivor, red on the mutant and green on the lane receipt.
- **The gate never reads the entry's Surface, BiDi-method or Evidence cells (CritC1Predicates defect 3).**
  `scripts/check-bidi-runtime.mjs:508` selects rows by `(r.cells[3] || "").toLowerCase() === "yes"` and `:560` reads
  `r.cells[0]`; a row whose Surface cell is arbitrary text and whose BiDi-method cell names a CDP command admits clean
  (`.ufo/waves/round-32/w1/CritC1Predicates.md`, E13; severity medium). Row-label fidelity is hand-review only; v2's
  stated rules narrow the `Measured` cell but do not read the other cells. Flip: a gate check that the method cell names
  the row's BiDi method, or a per-round hand-review line for every `yes` row.
- **m4 supersession grammar (CritC2Counter D4–D10).** D1–D3 are named in M6; these seven are not. D4: a correction placed
  *before* the statement never clears it, though the lane's own `## Round N — corrections` convention puts corrections
  above the claims block. D5: the finding's line is the line holding `nudge` (`SCORECARD.md:1473`), not the state word
  (`:1474`), so a correction citing `:1474` alone does not clear. D6: the correction's own round is never checked, so a
  "round 30" correction clears round 29's statement. D7: a range citation clears every round in the range
  (`:1470-1580` clears 29, 30 and 31 with one sentence). D8: phrasing blind spots — `nudge is not active`,
  `does not use the nudge`, `nudge waived`, `nudge fires`, `nudge remains inactive`, `no stagnation nudge`,
  `nudge state: inactive`, `nudge = inactive`, `nudge is dormant` and a `| nudge | inactive |` table cell are invisible.
  D9: inputs must sit in the same round group although `AXES.md` records the saturation line and window once in
  `SCORECARD.md`; round 28's `:1456` is could-not-evaluate because its axes sit at `:1432`, and the `depth: 9` colon
  form, a >240-char tail, table-form axes and `Saturation line8 and window3` are unparsed. D10: capability-cell blind
  spots — prose `first-working13`, `First-working: 3`, `first working round 3`, a header outside the last cell and word
  numerals are unseen, while a name cell is read as a round (`kaika-fleet-round-1` ⇒ 1). All seven are medium
  (`.ufo/waves/round-32/w1/CritC2Counter.md`). Counter v4 is not claimed this round (`claims.json` notClaimed); flip:
  v4 carries each as a case with a fixture, per `SCORECARD.md:1692`.
```

Placement rule for the L1: this block belongs in a **lesson**, not in `SCORECARD.md` — the m4 class reads `SCORECARD.md`
round groups only, but the D8 bullet quotes state-word variants and must not enter a counted document.

### R-1 — `corpus/README.md`

Append after `:757` (file end at the freeze), inside the round-32 corrections area:

```markdown
## Round 32 — corrections to the round-32 text, precision (round-33 errata intake C; append-only)

- `corpus/README.md:745`: "v3's CASES table holds 41 isolated scenarios" is false. The table holds 39 cases
  (`grep -cE '^\s{4}id: "'` on `scripts/check-selfassessment.mjs` → 39) and the gate's run count is 39 table cases plus
  the two refusal cases appended in `runSelftest` (`refusal-bad-rev-syntax`, `refusal-unresolvable-rev`;
  `grep -c 'results.push('` → 2). The run-count figure at `:745` stands; the attribution to the table does not.
  (w2 CritReadmeLog F2, re-verified at `e6b0a90`.)
- The round-32 frontier restatement's "three contracts the matrix names as unmatched" (`corpus/README.md:725-729`) names
  wire-truth parity, DOMSnapshot's columnar shape and the history-entry list. The three load-bearing contracts the entry
  and the matrix name are DOMSnapshot's columnar shape, the history-entry list and `insertText`
  (`corpus/knowledge/webdriver-bidi-runtime-round-32.md:149-151`; `webdriver-bidi-capability-matrix.md:100-102`);
  wire-truth parity (CDP's raw `ExtraInfo` header block and a byte-exact status line) is a fourth §3 gap
  (`webdriver-bidi-capability-matrix.md:84-86`), and the frontier row at `:735` already lists it as unmatched.
  (w2 CritReadmeLog F4.)
```

### G-1 — `LOG.md`

Append after `:2230` (file end at the freeze):

```markdown
Corrections — round-32 entry, precision (round-33 errata intake C; append-only)

- `LOG.md:2172-2173` "claimed 17/22/30" names three of the five distinct figures the m1 class reads. Re-running the frozen
  v3 at `4181fffb` gives 15 m1 claims whose distinct set is `{13, 17, 20, 22, 30}` (`SCORECARD.md:1439,1465,1486,1564`;
  `SKILL.md:2479,2515,2530,2545,2576,2578,2590,2594,2598`; `corpus/README.md:613,668`). The causal clause "the 15 induced
  by v3's 11 added cases, 30 → 41" is requalified as "counted against the 41-case oracle": 8 of the 15 state a figure
  below 30 (17 three times, 22 three times, 13, 20), so those tallies were already stale against v2's 30-case oracle and
  were not produced by the 30 → 41 move. (w2 CritReadmeLog F3.)
- `LOG.md:2165-2166` "the 16 admittable predicates the counter's own live leg held before the freeze" has no pre-freeze
  live artifact: at the freeze the offline control admits 16 with `live:false`
  (`baseline/c1-J3-forgery-offline.json`) and every live leg admits 0 with 16 failing (`c1-J2-docs-only.json`,
  `c1-J3-forgery-live.json`, `c1-J4-counter-as-driver.json`); the live 16-admitted reading is at the measured revision
  (`.ufo/waves/round-32/measure/c1-live-at-0808688.json`). Read the figure as not recorded before the freeze; the target
  `admitted >= 14` does not depend on it. (w2 CritReadmeLog F5.)
```

## §5 — Application check for the L1

1. After landing L-1/R-1/G-1, re-run the no-harm instrument named in `claims.json`: `node scripts/check-selfassessment.mjs
   --rev <REV> --json` must still report `mismatches 0` (the new lines state no gate-naming tally in an accepted shape; if
   the m1 extractor reads one, restate the figure without it). The C2 battery is unaffected by these documents; the C1
   counter reads neither.
2. Do not move L-1 into `SCORECARD.md` (the m4 group rule) and do not add a `## Round N` group around it.
3. The five MutC1 survivors (A.3–A.7) stay open at the claim level: wave 2 should build M11/M06/M04/M18/M17 against v2 and
   report survivors as limits; C2's predicate does not exercise them.

## Commands and exit codes (this seat)

Workdir `/fast/scratch/hyaku/tabi-r33/ScribeErrataC`, `TMPDIR=/fast/scratch/hyaku/tabi-r33/ScribeErrataC/tmp`; one
`git clone --shared` of the lane detached at `e6b0a90` (`git status --porcelain` → 0 lines).

```
$ git clone -q --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"                     # 0
$ git -C "$S/clone" checkout -q --detach e6b0a9074d434ccc307badd312ae7379d1193fea                 # 0
$ git -C "$S/clone" rev-parse HEAD            # e6b0a9074d434ccc307badd312ae7379d1193fea          # 0
$ git -C "$S/clone" status --porcelain | wc -l                                                    # 0
$ node scripts/check-selfassessment.mjs --rev 4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6 --json     # 1
    # mismatches 18: 15 m1 (17,22,22,30,13,17,20,22,30,30,30,30,30,17,30) + 3 m4 (1473,1515,1576)
$ git cat-file -t 0808688                                                                         # commit
$ git merge-base --is-ancestor 0808688 e6b0a90                                                    # 0
$ git show e6b0a90:.ufo/waves/round-32/measure/provenance-0808688.txt                             # rev=0808688…, porcelain=0, both digests
$ git show e6b0a90:scripts/check-selfassessment.mjs | grep -cE '^\s{4}id: "'                      # 39
$ git show e6b0a90:scripts/check-selfassessment.mjs | grep -c 'results.push('                     # 2
$ grep -n 'const deadline' scripts/check-bidi-runtime.mjs                                         # 394
$ grep -n 'cells\[' scripts/check-bidi-runtime.mjs                                                # 508, 560
$ git grep -n -i '<each keyword>' e6b0a90 -- corpus/lessons/round-32.md SCORECARD.md \
    corpus/QUALITY.md LOG.md corpus/README.md corpus/knowledge/webdriver-bidi-runtime-round-32.md  # absence sweeps, see §3
```

Raw counter output copied into this directory: `c2-freeze-at-4181fffb.json` (the 18-mismatch reading, exit 1) and
`c2-freeze-summary.txt` (the 15 m1 figures in counter order with their lines).

## Hygiene and boundaries

- Wrote only this file and the two receipts in this directory, plus the report at
  `.ufo/waves/round-33/w1/ScribeErrataC.md`. No lane tracked file, lane index, lane jj state, fleet file, sibling lane or
  `/home/vgpnk/Projects/shokuknow` was written; all lane git was read-only; the only scripts run were in the scratch clone.
- No browser or chromedriver was started (`pgrep -fa 'chromedriver|chromium'` at yield: no line of this seat). No network
  fetch, no tool install or upgrade (nothing needed; the host-wide pacman pause was respected).
- Scratch `/fast/scratch/hyaku/tabi-r33/ScribeErrataC` is removed before yield; the receipts above were copied out first.
- Leaf seat: no subagent dispatch, no `agent://all` message.
