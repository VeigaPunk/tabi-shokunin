# ConnRoutedLedger — round-32 w2 ledger check: routed-defect and w1-finding landing map

Seat: ConnRoutedLedger (leaf, connector, wave w2 = falsify, attempt 1). Attacks: the round-31→round-32
defect ledger — whether round-31 routed defects 1–7
(`corpus/lessons/round-31-verifier-spotcheck.md:143-170`) and every round-32 w1 finding rated
**medium or higher** by its seat landed in the wave-1 integration commit
`b234a58920134424e0d104f137311ff54a16d26b` (path:line) or carry an explicit
carried/not-claimed line in `claims.json`, `corpus/lessons/round-32.md` or `SCORECARD.md`.
All line numbers below are `b234a589` blob lines, read in a `--shared` clone of the lane
(`git -C "$S/clone" checkout -q --detach b234a58920134424e0d104f137311ff54a16d26b`); the lane
checkout was read-only throughout.

## Verdict (one paragraph)

**The ledger mostly holds, with 19 silent drops.** All seven round-31 routed defects close
cleanly: each lands in `b234a589` or in an explicit `notClaimed`/disclosure line in the frozen
`claims.json` (unchanged from `4181fffb`), the round-32 lesson, or the SCORECARD round-32 block.
Of the w1 medium-or-higher findings, the large majority landed — the C2 corrections and the
CritAxisCapability F1 disclosure, the CritC1Forgery D1–D4 holes (answered by QUALITY criterion 86
and the committed plain distinct counts `measure/c1-distinct.mjs` + red/green receipts, with
"gate v2 planned" as the explicit carry), the CritC1Predicates per-row narrowings (entry §3/§6),
SentinelPerimeter F1–F3 (entry §7), ExecNoNetwork's external-traffic caveat (entry §1 Perimeter),
CritC2Rule's counted mis-statements and the m4 could-not-evaluate hole (corrections + criterion 83),
and the ScribeErrataA/B/C dispositions of all 27 carried errata (lesson disposition table,
16 carried at round end, stated). The silent drops are all **counter-side holes the attacking
seats deferred to a future freeze**: RevCounters HIGH-1 (the live leg's 60-second deadline can
hang the counter forever and leak browser, fixture server and scratch), MutC1's selftest
survivors M11/M06 (high) and M04/M18/M17 (medium), CritC2Counter's m4-instrument defects D1–D10,
CritC1Forgery D5 (s1 admits fabricated registry rows), CritC1Predicates' unread-prose-cell defect,
and RevCounters MEDIUM-1's claim-level consequence (its mechanism did land as criterion 85). None
of the 19 has a landing or a carried/not-claimed line anywhere in `claims.json`, the lesson, or
`SCORECARD.md` at `b234a589`; the w1 report files exist under `.ufo/waves/round-32/w1/`, but the
item's rule is that a finding recorded only in its own wave file is unlanded. Four further
material items the w1 seats raised without a severity rating (ExecDeterminism's locale/dsf
false-red conditions, ExecCollectorTiming's measured contradiction of the matrix's
`maxEncodedDataSize` clause, ConnClaims' "rounds 33–35 derive `nudge inactive`" disclosure, and
ExecNoHarmBase's stale user-round-contract registry text) are listed separately; three of the four
are silent drops too. Severity: the 19 explicit drops are 6 high + 13 medium, detailed below with
the smallest append-only fix for each.

## Table 1 — round-31 routed defects 1–7 → disposition (all closed; none silent)

| # | Routed defect (round-31 spotcheck) | Where it closed |
|---|---|---|
| 1 | Calibration counter v3 (M11 refusal + m4 class; word-numeral/`<name>_cases=` tallies; merged two-bullet survivor) | **Claimed part landed:** v3 counter frozen pre-round (`frozenDigests` sha `77b5c8ed…`); C2 corrections at `SCORECARD.md:1607-1610` (41/41 m1 bullet), `:1612`, `:1618`, `:1622` (m4 bullets); SKILL.md:2756+; README round-32 corrections; refusal red/green `measure/c2-refusal-mutant.txt`; criterion 85 at `corpus/QUALITY.md:514`. **Carried part explicit:** `claims.json:86-92` `notClaimed[0..1]` ("word-numeral and `<name>_cases=` tallies (round-31 routed defect 1…)", "merged two-bullet correction survivor"); restated in `LOG.md:2195` ("…are **not claimed**"). |
| 2 | Decision-table counter v2 | Explicit: `claims.json:89` `notClaimed[2]`; `LOG.md:2195` "(2) decision-table counter v2 → not claimed". E3/E4/E6–E9 carried with drafted limits in the lesson errata table (`corpus/lessons/round-32.md:88-93`). |
| 3 | S119 superseding row + recheck alignment | Landed as curation: `corpus/SOURCES.md:137` (S123, `supersedes S119`), `:138-140` (S124-S126); `corpus/knowledge/rate-signal-decision-table.md` §Errata round 32 ("Recheck cadence: the registry's `365d` governs"); lesson `## Gate` (`corpus/lessons/round-32.md:16-20`); `LOG.md:2196` "(3) … → curation (S123), not a claim". |
| 4 | 27 carried w1 errata | Landed: lesson "Carried round-31 errata (routed defect 4) — dispositions" table `corpus/lessons/round-32.md:80-98` — every item E1–E27 dispositioned (closed/refused/carried/landed-as-recorded-limits/half-closed), "Carried at round end: 16 of 27 … down from 27" at `:98`; `LOG.md:2196`. (The 43-vs-27 denominator derivation is stated only in the w1 scribe/scout reports, not in the lesson — below threshold.) |
| 5 | Control captures must name a resolving revision / tree digest | Landed pre-round and re-cited: 8 `baseline/*.provenance` files record clone commit + tree digest; `LOG.md:2141` ("every capture records its clone commit and tree digest in `<control>.provenance` — round-31 routed defect 5"). |
| 6 | Round-30 carried defects 3–4 | Explicit: `claims.json:90` `notClaimed[3]`; `LOG.md:2198` "(6) round-30 routed defects 3–4 → not claimed". |
| 7 | Scratch hygiene | Explicit process claim: `claims.json:14` `priorClosure` (7); every seat prompt requires scratch deletion (this one included); `LOG.md:2198` "(7) scratch hygiene → …". Verified independently: my scratch is removed before yield (hygiene section). |

## Table 2 — round-32 w1 findings rated medium or higher → landing or carried line

Findings are keyed by seat; severity is the seat's own rating. "Landed" cites `b234a589` path:line.

| Seat / finding | Severity | Status |
|---|---|---|
| RevCounters HIGH-1 — `liveRecord`'s 60 s deadline only closes the websocket; awaited `send()`s never settle → counter hangs forever, browser/fixture/scratch leak (`check-bidi-runtime.mjs:382`, `5ad1:394`) | HIGH | **SILENT DROP** — no landing, no carried line (see §A.1). |
| RevCounters MEDIUM-1 — a refused oracle removes that gate's mismatches; breaking an unfrozen gate's selftest makes `mismatches=0` reachable without honest corrections; "deserves a line in the round report" | MEDIUM | **Partially landed / consequence dropped** — the mechanism landed (criterion 85, `QUALITY.md:514-521`; `measure/c2-refusal-mutant.txt`; lesson recorded limits E24 `corpus/lessons/round-32.md:100-136`), and the 15 claimed tallies all name the frozen counter (mitigation). The claim-level consequence line the seat asked for is absent → counted as a drop (§A.2). |
| RevCounters LOW-1/LOW-2/LOW-3, INFO-1/2/3 | low/info | Below threshold; not audited for landing. |
| MutC1 M11 — driver `sha256` equality unenforced by the 27-case selftest (only path/absence arms tested) | HIGH | **SILENT DROP** (§A.3). |
| MutC1 M06 — `ok()` accepting error frames not pinned by any selftest case | HIGH | **SILENT DROP** (§A.4). |
| MutC1 M04 — cross-run `chromedriverVersion` equality unenforced; M18 — R4 PNG dimension equality unenforced for well-formed PNGs; M17 — loopback-only `webSocketUrl` unenforced | MEDIUM ×3 | **SILENT DROPS** (§A.5-A.7). |
| MutC1 M09/M10 (medium-low), M14/M19 (low-medium) | below plain medium | Borderline bucket §B; also unlanded. |
| MutC1 verdict itself (10/10 mutants killed; counter correct for the frozen readings) | — | Landed implicitly: frozen readings unchanged, gate in force; no defect. |
| MutC2 — counter held, 10/10 killed; coverage finding rated **minor** | minor | Below threshold. |
| CritC1Forgery D1 (transcript provenance unbound), D2 (admitted counts table instances), D3 (two runs need not be two observations), D4 (driver identity is a path-string check) | HIGH/HIGH/HIGH/MEDIUM | **Landed:** lesson M2 (`corpus/lessons/round-32.md:57`, §M2 at `:74-77` names all four constructions, records "gate v2 planned" as the carry), criterion 86 (`QUALITY.md:522-528`), entry §8 (`webdriver-bidi-runtime-round-32.md:181-184`), and the plain distinct counts `measure/c1-distinct.mjs` + `measure/c1-distinct-red-green.txt` (green on the lane receipt, red on the v1/v2/v3 forgeries — verified: `ok:true` exit 0 lane; `ok:false` exit 1 ×3 forgeries). D4's content-check half is additionally answered by c1-distinct's `driverEqualsGate`/import scan. |
| CritC1Forgery D5 — `s1` accepts fabricated registry rows (junk URL, no fetch receipt, no anchor) | MEDIUM | **SILENT DROP** (§A.8). |
| CritC1Forgery D6 — `clean` has no minimum population | informational | Below threshold (and criterion 86's distinct-count rule covers the target's arithmetic). |
| CritC1Predicates defect 2 — duplicate rows not collapsed (`R2`×14 admits clean) | MEDIUM | **Landed:** same criterion 86 / M2 / c1-distinct answer as CritC1Forgery D2. |
| CritC1Predicates defect 3 — prose cells unread; a row whose Surface cell is arbitrary text and whose "BiDi method" is a **CDP** command admits clean (E13) | MEDIUM | **SILENT DROP** (§A.9). The per-row overreach/inversion items (R1 mechanism-mismatch, R4/R5, R11, R14, R17) landed via entry §3 "What each `yes` does not show" (`webdriver-bidi-runtime-round-32.md:84-104`), §6 Rejected (`:141-160`), matrix addendum §3 amendment, README frontier restatement. |
| CritC2Counter D1 (correction quoting the stale phrase spawns phantoms), D2 (capability cell first digit-run 29–31 poisons rounds), D3 (any `correct`+range+state-word paragraph clears findings) | HIGH ×3 | **SILENT DROPS** — the two wording rules the seat scoped to this round landed (the landed corrections contain no matchable `nudge inactive` phrase — `git show b234a589:SCORECARD.md | grep -c 'nudge inactive'` on the appended block is 0 per ExecC2Apply's verify, and the capability row's last cell is `32`), but the counter-side items (a)-(f) the seat deferred to the next freeze carry no line (§A.10-A.12). |
| CritC2Counter D4 (correction placed before the statement never clears), D5 (finding line is the `nudge` line `:1473`, not the state-word line `:1474`), D6 (correction's round never checked), D7 (one range citation clears every round in range), D8 (phrasing blind spots), D9 (inputs must sit in the same round group), D10 (capability-cell parsing blind spots) | MEDIUM ×7 | **SILENT DROPS** (§A.13-A.19). |
| CritC2Counter D11 (rule-quotation false positives; "low now, medium if round 32 documents the grammar"), D12 (statements outside `## Round N` invisible) | low/conditional | Borderline bucket §B; also unlanded (D12's substance is partially carried by criterion 83's "over `SCORECARD.md` round groups only" limit clause, `QUALITY.md:505-507`). |
| CritC2Rule — the three counted `nudge inactive` statements are mis-statements | MEDIUM (the claim's object) | **Landed:** corrections `SCORECARD.md:1612`, `:1618`, `:1622` + `LOG.md` round-32 correction of `:2072`; frozen claims not edited. |
| CritC2Rule defect 1 — round-28 statement `:1456` is could-not-evaluate, never verified (CNE hole) | MEDIUM | **Landed:** criterion 83 (`QUALITY.md:495-507`) states "a round group without a six-axis `Axes at round start:` line is unread, not correct". |
| CritC2Rule defect 2 — `:431`/`:737` position-3 boundary ambiguity | LOW | Below threshold; half-landed (unread-group clause only). |
| CritAxisCapability F1 — duplicate authority over capability entries decides the nudge state; disclose-and-record | MEDIUM | **Landed:** `SCORECARD.md:1628-1635` disclosure paragraph (names `CritAxisCapability.md` F1, both rules, the counterfactual consequence, and the operative rule going forward); criterion 84 (`QUALITY.md:508-513`); lesson M1 § (`:62-72`). F2 (low, `:1456` unread) and F3 (low, unmoved-command wording) at/below threshold — F2 landed via criterion 83. |
| ExecNoNetwork — live leg is loopback-sufficient but not loopback-only in effect (8 TCP connections to six Google endpoints, 17.8 kB out / 41.1 kB in, with the frozen argv) | not rated (claim-fidelity) | **Landed:** entry §1 Perimeter (`webdriver-bidi-runtime-round-32.md:50-56`) records the eight non-loopback hosts, the proxy CONNECTs, and "No page of an external site was requested"; the matrix addendum keeps the loopback-perimeter wording. |
| ExecDeterminism — t3 is byte-deterministic within one environment triple, not across; false-reds from locale (`ja_JP`), `--force-device-scale-factor=2`, `--window-size` viewport; false-green against a synthetic transcript; "receipt driver MUST reproduce the counter's argv and locale; entry/lesson MUST NOT claim t3 proves a browser ran" | not rated | **Partially landed:** the "must not claim a browser ran" half landed (entry §6, `:157-159` — "A screenshot proves a real browser" rejected). The locale/dsf/window-size false-red conditions and the driver-environment reproduction advisory are **not recorded anywhere** → unrated silent drop, §C.1. |
| ExecCollectorTiming — case 3 contradicts the matrix correction's mechanism: `maxEncodedDataSize` does not cap the body (20 000 B returned at limit 200); the failure threshold tracks the response **header block** (~197 B base); `unavailable network data` never produced; registering at `responseStarted` is already too late; `dataType:"request"` GET → `unknown error`; recommends "a comment in the round-32 entry (and eventually the matrix row) should say the limit is not a body cap on this build" | not rated | **Silent drop (stale text):** neither the entry nor the matrix addendum records it; entry §3 R12 (`webdriver-bidi-runtime-round-32.md:94`) still reads "`maxEncodedDataSize` and total-storage behaviour … are **unmeasured**", which the w1 measurement falsifies → §C.2. |
| ExecDriver / ExecPyClient / ExecInterceptPhases / ExecC2Apply / RevControls / ScribeEntry / ScribeS119 / ScribeSrc* / ScribeSkillDistill / ScribeMatrixAddendum / ScribeMistakes / ScribeLog / Scout* / ConnSiblings / SentinelPerimeter F4-F6 | holds / low / informational | Landed or below threshold: ExecC2Apply's corrections landed verbatim (`SCORECARD.md:1612-1635` cite each round's own axes — M4 caught); RevControls' one defect is **minor** (c1-J4 tree digest not byte-reproducible; session-bound fields enumerated). SentinelPerimeter **F1/F2/F3 (medium) landed** (entry §7, `:166-178`: launcher `chromium-flags.conf`, `--no-sandbox`, unauthenticated driver socket, transcript contents); F4/F5 (low) also landed; F6 crashpad (low) not landed — below threshold. ScribeMistakes' uncounted-recurrence finding (LOG.md:2072 + three frozen `claims.json:11`) landed (LOG round-32 correction + lesson M1 §:68-70). |

## §A — Silent drops (explicit seat-rated severity; neither landed nor carried)

For each: what was attacked (the w1 finding), the w1 evidence path, why it is unlanded at
`b234a589`, and the smallest append-only fix (naming, not performing — attack seats never repair).
All 19 share one fix shape: an appended block at the end of the round-32 lesson (or the round-32
SCORECARD block's planned section) titled "Recorded limits of the frozen counters" naming each item
with its w1 pointer; §A items were verified absent by full-tree `git grep` at `b234a589` (commands
in the evidence section).

- **A.1 (HIGH, RevCounters HIGH-1).** `liveRecord`'s deadline does `ws.close()` only; pending and
  subsequent `await send(...)` never settle → the counter never returns, `finally` never runs,
  chromedriver/chromium/fixture server/scratch leak, CLI never exits. Evidence:
  `.ufo/waves/round-32/w1/RevCounters.md` (Defects, HIGH-1; `check-bidi-runtime.mjs:382` /
  `5ad1:394`). Absent from lesson/SCORECARD/QUALITY/LOG/README (`git grep -n 'hang\|deadline\|RevCounters'`
  over the landing tree finds only unrelated hits). Smallest fix: append one paragraph to the
  lesson's gate-limits area: "C1 gate live leg: the 60 s deadline closes the websocket but cannot
  unsettle awaited sends; a wedged session hangs the counter with browser, fixture and scratch
  leaked (w1 RevCounters HIGH-1); counter fix deferred to gate v2 (lesson M2)."
- **A.2 (MEDIUM, RevCounters MEDIUM-1).** The refused-oracle mechanism landed (criterion 85), but
  the consequence line — "at REV, breaking an unfrozen gate's selftest silently removes its
  mismatches; `mismatches=0` is reachable without honest corrections for any tally naming an
  unfrozen gate; only protocol guards the unfrozen gates" — is nowhere in the round-32 record.
  Fix: one sentence in the lesson's recorded-limits block citing `w1/RevCounters.md` MEDIUM-1.
- **A.3 (HIGH, MutC1 survivor M11).** t1's `sha256(d) !== driverSha256` arm has no selftest case;
  a receipt whose recorded `driverSha256` mismatches the committed driver bytes admits. Evidence:
  `.ufo/waves/round-32/w1/MutC1.md` survivor 1 (severity high). Fix: one bullet naming the five
  fixture-only kills (m01/m04/m07/m08/m10) and the four survivor classes (M11 driver digest, M06
  error frames, M04 cross-run driver version, M18 PNG dims, M17 loopback ws url) as selftest
  coverage gaps carried to gate v2.
- **A.4 (HIGH, MutC1 survivor M06).** `ok()` accepting error frames is unpinned; an error frame
  with a payload-carrying `result` can be scored a success when the predicate's own revalidation
  doesn't catch it. Same evidence/fix as A.3.
- **A.5-A.7 (MEDIUM, MutC1 M04/M18/M17).** Cross-run `chromedriverVersion` equality unenforced;
  R4 viewport-pin dimension equality unenforced for well-formed PNGs; loopback-only `webSocketUrl`
  unenforced. Same evidence/fix as A.3.
- **A.8 (MEDIUM, CritC1Forgery D5).** `s1` accepts a fabricated registry row (junk URL, no fetch
  receipt, no anchor, wrong scope). Evidence: `.ufo/waves/round-32/w1/CritC1Forgery.md` D5. The
  lesson Gate block does carry per-row fetch receipts (URL/UTC/status/bytes/sha256) for the real
  rows, but no record says the *hole* exists. Fix: one bullet in the lesson's gate-limits block:
  "s1 checks only presence-at-REV/mined/used-by/absence-at-baseline; it does not check that the
  cited row was fetched or that its scope matches (w1 CritC1Forgery D5); gate v2."
- **A.9 (MEDIUM, CritC1Predicates defect 3).** The frozen counter reads only `cells[0]` (id) and
  `cells[3]` (Measured); a row whose Surface cell is arbitrary text and whose BiDi-method cell is
  a CDP command admits clean (executed E13). Evidence: `.ufo/waves/round-32/w1/CritC1Predicates.md`
  (E12/E13, "severity: medium, calibration-facing"). The entry §3 narrowing is hand-review, not a
  gate property, and no line records the hole. Fix: one bullet in the lesson/entry gate-limits
  area: "the gate never reads Surface/BiDi-method/Evidence cells; row-label fidelity is
  hand-review only (w1 CritC1Predicates E13)."
- **A.10-A.12 (HIGH, CritC2Counter D1/D2/D3).** m4 parses a correction that quotes the stale phrase
  as a fresh statement; a capability cell whose first digit run is 29–31 flips rounds 29–31 and
  manufactures phantoms; any paragraph containing `correct`, a `SCORECARD.md:` range and the
  observed state words clears all three findings. Evidence: `.ufo/waves/round-32/w1/CritC2Counter.md`
  D1-D3 (fixtures `fx-target-quoted-round32`, `fx-target-safe-poisoncell`, `fx-falseclear`). The
  seat scoped counter fixes to the next freeze, but no carried line exists. Fix: a "recorded
  limits of the m4 class" bullet list in the lesson naming D1-D3 with their fixtures.
- **A.13-A.19 (MEDIUM, CritC2Counter D4-D10).** Correction-before-statement never clears; finding
  line is the `nudge` line (`:1473`) not the state-word line (`:1474`); the correction's round is
  never checked; one range citation clears every round in the range; nine phrasing variants are
  invisible; inputs must sit in the same round group although `AXES.md` requires only "recorded
  in `SCORECARD.md`"; capability parsing blind spots (prose `first-working13`, name cells read as
  rounds, word numerals). Same evidence file (probe transcripts in the seat output dir). Same fix
  shape as A.10-A.12.

## §B — Borderline bucket (seat-rated below plain medium; also unlanded, listed for completeness)

MutC1 M09/M10 ("medium-low": R9/R14 timing unenforced), MutC1 M14/M19 ("low-medium":
same-major browserVersion, Measured-cell filter), CritC2Counter D11 ("low now, medium if round 32
documents the grammar" — round 32 did document the accepted spelling, so the conditional half may
arguably apply), CritC2Counter D12 (statements outside `## Round N`; partially carried by
criterion 83's scope clause). Smallest fix: same §A fix shape.

## §C — Unrated material items (no seat severity; three of four unlanded)

- **C.1 ExecDeterminism (unlanded).** t3 false-red conditions measured 3/3-reproducible:
  `LANG=ja_JP.UTF-8` → `30b254cb…`, `--force-device-scale-factor=2` → `cf70457a…`,
  `--window-size=640,480` viewport pin → `6e2b0729…` (640×337); the receipt driver "MUST reproduce
  the counter's argv and locale". The landing records only the false-green half (entry §6
  rejects "a screenshot proves a real browser"). The locale/dsf/window-size conditions and the
  driver-environment advisory appear nowhere at `b234a589` (`git grep 'ja_JP\|device-scale'`
  over the landing lesson/entry/SCORECARD/LOG/QUALITY: no match). Fix: two sentences in the
  entry's Limits (§5) or the lesson: "the first-screenshot binding is sensitive to ambient locale
  and device-scale-factor on this build; a receipt driver must pin `LANG`/`LC_ALL`, avoid
  `--force-device-scale-factor` and `--window-size`, and pin the viewport via BiDi `setViewport`
  (w1 ExecDeterminism)".
- **C.2 ExecCollectorTiming (unlanded; leaves stale text).** The w1 measurement contradicts the
  matrix's 2026-10-20 correction bullet 4: `maxEncodedDataSize` does not cap the body (20 000 B
  returned at limit 200); the disappearance threshold tracks the response header block (~197 B
  base, 1:1 with added header bytes); `unavailable network data` was never observed; registering
  at `responseStarted` is already too late; `dataType:"request"` on a GET yields `unknown error`.
  The seat's recommendation — "a comment in the round-32 entry (and eventually the matrix row)
  should say the limit is not a body cap on this build" — was not taken: entry §3 R12 still says
  "`maxEncodedDataSize` and total-storage behaviour … are unmeasured" (now false), and the matrix
  addendum does not mention it. Fix: correct the entry's R12 "does not show" cell and append one
  bullet to the matrix addendum's "still not measured" list citing `w1/ExecCollectorTiming.md`.
- **C.3 ConnClaims advisory #4 (unlanded).** "Rounds 33–35 derive `nudge inactive` because of
  round 32's own capability entry; future rounds must not carry `nudge active` forward." No line
  at `b234a589` records this forward obligation (`git grep 'round 33\|rounds 33'`: no match).
  Advisory #1-#3 and #5 landed (nudge active stated at `SCORECARD.md:1647`; 27 tallies at
  `SKILL.md:2612-2627`; capability row appended at `:1663`; independent claims tabulated). Fix:
  one sentence in the SCORECARD round-32 block: "Because the capability table now holds a round-32
  entry, the derived nudge state for rounds 33–35 is `inactive`; round 33+ blocks must state that
  (w1 ConnClaims simulation D)."
- **C.4 ExecNoHarmBase finding 2 (seat-scoped out, not a drop).** The registry/expected-finding
  text for `check-user-round-contract.mjs` (`SKILL.md:1678/1800/1938/2473`, `SCORECARD.md:416`)
  is stale against the gate's inherited `history_rewritten` refusal; the seat itself marked it
  "Calibration observation only; not claimed, and no C2 correction covers it." Recorded here so
  the ledger shows it was seen; the inherited red itself is documented (`LOG.md:1286/1304/1454/1481`).

Also noted at/below threshold (no action owed): SentinelPerimeter F6 crashpad (low) unlanded;
CritC2Rule defect 2 `:431`/`:737` half-landed; ScribeMatrixAddendum F1 (low) half-landed via the
addendum's loopback wording; RevControls' minor c1-J4 tree-digest documentation defect unlanded;
ScribeS119 F1 (the decision table cannot re-measure at the round-32 baseline; a constraint note,
not a defect) recorded only in its w1 file.

## Evidence — commands and exit codes (all git read-only in the lane; runs only in my scratch clone)

Environment: `S=/fast/scratch/hyaku/tabi-r32/ConnRoutedLedger`, `TMPDIR=$S/tmp`; one live clone.

```
mkdir -p "$S/tmp"                                                     # exit 0
git clone -q --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"   # exit 0
git -C "$S/clone" checkout -q --detach b234a58920134424e0d104f137311ff54a16d26b   # exit 0
git -C "$S/clone" rev-parse HEAD    # b234a58920134424e0d104f137311ff54a16d26b, exit 0
git -C "$S/clone" status --porcelain | head -5                      # 0 lines, exit 0
```

Landing-map reads (exit 0 each; `cd "$S/clone"`):

```
git show b234a589:SCORECARD.md | tail -70            # round-32 corrections 1605-1635, claims block, capability row :1663
git show b234a589:corpus/lessons/round-32.md         # full lesson: Gate 13-40, M1-M5 table 56-60, errata table 80-98, recorded limits 100-136
git show b234a589:corpus/QUALITY.md | tail -45       # criteria 83 (:495), 84 (:508), 85 (:514), 86 (:522)
git show b234a589:corpus/knowledge/webdriver-bidi-runtime-round-32.md   # §1 Perimeter :50-56, §3 :84-104, §6 :141-160, §7 :166-178, §8 :181-184
git show b234a589:LOG.md | sed -n '2121,2230p'       # round-32 entry incl. routed-defect restatement :2195-2198
git show b234a589:corpus/README.md | tail -45        # round-32 knowledge row + frontier restatement
git show b234a589:corpus/SOURCES.md | grep -n 'S12[3-6]'   # S123 :137, S124 :138, S125 :139, S126 :140
git show b234a589:corpus/knowledge/rate-signal-decision-table.md | tail -22   # §Errata round 32 (365d governs; S123 row grounds the month)
git show b234a589:corpus/knowledge/webdriver-bidi-capability-matrix.md | sed -n '167,262p'  # 2026-10-26 addendum
git show b234a589:.ufo/waves/round-32/measure/c1-distinct.mjs              # distinct-id/transcript/driver-content counter
git show b234a589:.ufo/waves/round-32/measure/c1-distinct-red-green.txt    # green on lane receipt (exit 0), red on v2/v3/v1 forgeries (exit 1 x3)
git show b234a589:.ufo/waves/round-32/measure/c1-socket-path-red-green.txt # 2f8535c5 fails / 5ad1fcbf runs (M5)
git show b234a589:.ufo/waves/round-32/measure/c2-refusal-mutant.txt        # 39/41, exit 3 (criterion 85 red/green)
git diff --name-only 4181fffb b234a589 -- .ufo/waves/round-32/claims.json  # 0 lines (claims frozen; notClaimed at :86-92)
git ls-tree --name-only b234a589 .ufo/waves/round-32/baseline/ | grep -c provenance   # 8
git ls-tree --name-only b234a589 .ufo/waves/round-32/w2/ | wc -l           # 0 (w2 not yet integrated — this report is w2 input)
```

Silent-drop greps (each `git grep -n <pattern> b234a589 -- <docs>`, exit 0 with only unrelated
hits means absent; exit 1 means no match — both counted as "not recorded"):

```
git grep -n 'hang\|deadline' b234a589 -- corpus/lessons/round-32.md SCORECARD.md corpus/QUALITY.md LOG.md corpus/README.md   # no round-32 record of HIGH-1 (A.1)
git grep -n 'ja_JP\|device-scale' b234a589 -- corpus/lessons/round-32.md SCORECARD.md corpus/QUALITY.md LOG.md corpus/knowledge/webdriver-bidi-runtime-round-32.md   # no match (C.1)
git grep -n 'unavailable network data\|header block' b234a589 -- corpus/knowledge/webdriver-bidi-capability-matrix.md corpus/knowledge/webdriver-bidi-runtime-round-32.md   # only the pre-existing 2026-10-20 correction text (C.2)
git grep -n 'rounds 33\|round 33' b234a589 -- SCORECARD.md corpus/lessons/round-32.md LOG.md corpus/QUALITY.md   # no match (C.3)
git grep -n 'phantom\|poison\|false-clear' b234a589 -- corpus/lessons/round-32.md SCORECARD.md corpus/QUALITY.md LOG.md   # no match outside w1 (A.10-A.19)
git grep -n '1474' b234a589 -- corpus/lessons/round-32.md SCORECARD.md corpus/QUALITY.md LOG.md   # no match (A.13, D5 attribution hole)
git grep -n 'M11.*driver\|driver.*digest' b234a589 -- corpus/lessons/round-32.md SCORECARD.md corpus/QUALITY.md LOG.md   # no match (A.3-A.7 selftest-coverage record)
git grep -n 'maxEncodedDataSize' b234a589 -- corpus/knowledge/webdriver-bidi-runtime-round-32.md corpus/knowledge/webdriver-bidi-capability-matrix.md   # entry only names it in the stale "unmeasured" cell (C.2)
```

Two greps behaved specially: `git grep -n 'hang' b234a589 -- …` matched only unrelated words
("unchanged", "odometer-free"); `git grep -n 'carried' …` matched historical LOG lines only.
No counter, lane file, claim or control was executed or modified by this seat; no browser was
started (no chromedriver/chromium of mine exists — `pgrep` shows only other seats' trees and the
host `earlyoom`).

## What the L1 should run after w2 lands

Nothing in this report re-runs a counter; the drops are ledger facts. If the L1 adopts the §A/§B
fix shape, the acceptance check is: `git grep -n 'Recorded limits of the frozen counters'
<new-REV> -- corpus/lessons/round-32.md` returns the new block, and each of the §A items' w1
pointers is named in it; then re-run the two frozen counters at REV per the measurement rule to
confirm the appends changed no reading (the lesson/SCORECARD appends sit outside every counted
window by construction, but the C2 counter is the authority).

## Hygiene, tooling, boundaries

- Wrote only this report at `.ufo/waves/round-32/w2/ConnRoutedLedger.md` and the seat output dir
  `.ufo/waves/round-32/w2/ConnRoutedLedger/` (a copy of the raw grep outputs below). No lane
  tracked file, lane git index, lane jj state, fleet repo, sibling lane, or
  `/home/vgpnk/Projects/shokuknow` was written. Lane git was read-only (`git show`/`grep`/`ls-tree`/`diff`).
- Scratch `/fast/scratch/hyaku/tabi-r32/ConnRoutedLedger` deleted before yield (`rm -rf`, then
  `test -e` → absent); receipts (this report) copied out first.
- No browser/chromedriver started, none killed; `pgrep -fa 'chromedriver|chromium'` lines at
  yield belong to other seats and the host — none owned by ConnRoutedLedger.
- No tools installed or upgraded (nothing was needed; per operator rule no pacman transaction was
  attempted — host-wide pause respected).
- No network fetches (the w1 fetch receipts I cite were read as committed files; I made no GETs).
- Leaf seat: no subagent dispatch, no `agent://all` message.

## Raw grep outputs (copied from the session, for the record)

See `.ufo/waves/round-32/w2/ConnRoutedLedger/greps.txt` — the verbatim outputs of the landing-map
greps listed above, with the commands that produced them.
