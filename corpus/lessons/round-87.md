# tabi — round 87

L1 `TabiR87`. Base `24765dd9` (lane clean; the round-86 verifier spot-check commit). The round-86
non-author spot-check admitted both r86 claims and routed seven defects; five are lane-owned record
defects closed here (C2), and the remaining `accept` token forms the r86 note named are measured
(C1). Claims: C1 coverage — capability `chromium-showpicker-linux` generation r87 (four remaining
token forms: `audio/*`, `video/*`, a multi-MIME list, a whitespace variant); C2 calibration — the
five lane-owned routed record defects.

D **`3dd4b0802d67`** — the scored receipt's digest — with nonce **`tabi-r87-l1-3dd4b0802d67`**.
The instrument set re-froze three times after the scored run: D4 `b1d06cf8db57` (selftest runner
path fix), D5 `c921658c6046` (the drift gate's ledger-pointer and directional-count checks,
strengthened after R87Critic C2-3/C2-4) and D6 `6d4a63d29e0c` (a tenth selftest gate,
`noreceipt-control`, answering R87Sentinel F3); D1 `efbee055d6b4` and D2 `42a489b9d4be` were
superseded pre-report. `plans/round-87.md` §Re-freeze
history carries every digest; the receipt stays at D3 because none of the later re-freezes touched
the driver, the counter, the battery or the kill-power list. Freeze commit recorded in LOG.

Census start: exit 0, 223 rows (`census/start.txt`); end: exit 0 (`.ufo/waves/round-87/census/end.txt`).

## Gate

### Sources — opened this round

The L1 re-opened the living WHATWG input page on 2026-11-08 (HTTP 200, 687,515 bytes, sha256
`b0202de1c0b4…`, staged at `.ufo/waves/round-87/sources/whatwg-input.html`).

- **S223** — the `accept` attribute's own sentence. Located quote: "attribute may be specified to
  provide user agents with a hint of what file types will be accepted." This is the normative ground
  for the seven-form acceptance law (a hint, not a validator on a programmatic answer).
- **S219** — the `showPicker()` colour exemption, re-opened this round as the ground of the colour
  arm. Located quote (21 words, `printf '%s' … | wc -w`): "Throws a 'SecurityError' DOMException if
  input is inside a cross-origin iframe, unless input is in the File Upload or Color states." (The
  page's own quotation marks are straight double quotes; the nested single quotes here render the
  inner DOMException name.)

Identified 2 / screened 2 / included 0 / excluded 2 for NEW rows; no registry change.

R87Scout re-fetched the same page (byte-identical: `cmp` exit 0, sha256 `b0202de1c0b4…`) and located
longer forms: a 20-word `accept` sentence, the 16/12/21-word Color-exemption forms, and 21/19/10-word
parse-shape sentences. Its substantive finding: the whitespace-normalization rule is **not on the
staged page** — it lives on two linked pages it opened (sha256 `2e9e2cbbe1…` among them). This round
therefore grounds only the ACCEPTANCE law in S223; the whitespace leg measures the raw attribute
string, not the spec's parsing, and the note says so.

R87Scout also opened three further pages for the parse semantics (all HTTP 200, sha256 recorded in
`w1/R87Scout.md` §3): `html.spec.whatwg.org/multipage/common-microsyntaxes.html`
(`2e9e2cbbe1…`, 24/18/22-word quotes), `infra.spec.whatwg.org` (`8d43350a0a…`, 8/20-word quotes)
and `mimesniff.spec.whatwg.org` (`39dade0e50…`, 20-word quote). They are **excluded as registry
rows** this round (reason: the round measures acceptance on a programmatic answer, not the user
agent's tokenisation; the pages are cited as context in the seat report, not as the claim's
source), so the census stays 223. The registry
search-log entry for the round-86 bounded re-opening (routed defect 5) is added at
`corpus/SOURCES.md` §Search log.

Admitted: `corpus/knowledge/chromium-showpicker-runtime-round-87.md` (cites S223, S219, S216 and the
r86 carrier rows).

Rejected (with flip conditions):

- **"The accept grammar is fully enumerated"** — seven token forms are measured; MIME parameters,
  case variants and combined `audio/*,video/*` lists stay frontier. Flip: one leg per remaining form.
- **"The dialog filters what the user sees"** — the receipt answers programmatically; the dialog is
  unmeasured. Flip: an interactive-dialog harness.

Assimilation: none (`merge/tabi/` adoption stays closed pending the open L0 `tabi | round-57`).
`considerthese/`: no such directory in this lane.

### Report corrections carried into this round (round-86 spot-check defects 1–2)

- The round-86 report's Before→after C1 control line says "39 findings"; the committed control has
  **40** (`tabi.md:123` vs the committed JSON). The r86 record's own correction already states the
  re-capture; this round's records carry 40 only.
- The round-86 report's Sources & frontier says S221/S222 were "re-opened"; they were **carried, not
  re-opened** (no `.pdl` fetched). This lesson and the r87 report carry the correction.

### Admitted / rejected claims

C1 and C2 are frozen in `.ufo/waves/round-87/claims.json` (nonce `tabi-r87-l1-3dd4b0802d67`,
receipt D `3dd4b0802d67`; instrument freeze D5 `c921658c6046`). Scored: counter clean **99** checks;
battery **209** cases / 0 failed / coverage 99/99; kill power **66/66** killed, 0 survivors, 0
crashed, 0 unapplied; selftest **10/10** at D6 over the D3 receipt; record drift **5 → 0**.

## Mistakes

| class | evidence | captured-by | fix |
|---|---|---|---|
| `mid-wave-re-freeze-churn` — the instrument set was re-frozen three times (D4, D5, D6) WHILE the wave's seats were verifying: R87Exec2's hashes at read time were D4 and its selftest capture moved under it, R87Scribe re-ran the selftest twice against different freezes, and R87Sentinel had to state findings "against the final D5 snapshot". The repairs were each honest (a runner path, a gate direction, a missing gate), but they should have been batched and landed as ONE post-wave re-freeze | `w1/R87Exec2.md` §State (D4 mid-run change), `w1/R87Sentinel.md` header (D5 snapshot), `w1/R87Scribe/selftest-d5.json` (re-run at 07:40 against D5) | the seats' own hash-at-read discipline; no lane rule caught the churn | the repair set is frozen once at D6 and every record cites the receipt D3 + instrument D6; next round freezes the full instrument set BEFORE dispatch and batches post-wave repairs into a single re-freeze (`plans/round-87.md` §Re-freeze history) |
| `claims-pointer-staleness` — the frozen C1 `countingCommand` kept the D2 nonce after the receipt moved to D3; three seats (Review1 F4, Review2 F7, Critic C1-2) found it and each had to re-derive that the command exits 1 | `w1/R87Critic.md` §C1-2; `w1/R87Review1.md` §F4 | none — the freeze did not check that every pointer in `claims.json` matches `claims.nonce` | reviewed and corrected post-freeze (record fix, no predicate change); the next round diffs every pointer against the nonce at freeze time |

Sweep for further mistakes: the counter (99 checks), battery (209 cases), kill power (66 mutants),
drift gate (5 statements), and the wave's ten landed reports were re-read; the two classes above are
the ones with a demonstrated failure mode. R87Mut1's 5 survivors are routed to the next generation
as narrowings 14, not counted as a mistake of this round's process.

## Corrections — the wave's findings (append-only)

| # | finding | correction |
|---|---|---|
| 1 | R87Critic C1-2 / R87Review1 F4: `claims.json` C1 `countingCommand` carried the superseded D2 nonce and exited 1 | pointer corrected to `tabi-r87-l1-3dd4b0802d67` after the freeze; the command then exits 0 clean 99. A record fix, no predicate change (plans §Narrowings item 3). |
| 2 | R87Critic C1-3: C1 leg (c) "selftest green" was false at the dispatched D3 pin (its receipt path named the r86 receipt) | the selftest runner was fixed and re-frozen (D4), and the selftest now scores the D3 receipt 10/10 at D6; the record says the leg is measured at the final freeze (D6), not at the D3 pin (plans §Re-freeze history). |
| 3 | R87Critic C2-3 / R87Mut1 D07: statement (4) said the ledger pointer resolves to a "headline item" while the row named item 1; the first repair checked only the cell's text, so removing the item heading passed | the round-86 ledger row was repointed to `§Narrowings item 9` and the D7 gate now requires the `9. **The accept-headline` heading itself; shown able to fail (removing the heading yields `ledger-pointer`, restoring it passes). The row's claim/verdict/note are unchanged (r86 lesson Corrections row 8). |
| 4 | R87Critic C2-4 / R87Mut1 D09: statement (5) was a directionless token test, and the D5 regex was satisfied by the corrections table's own description of it | the D7 gate scans ONLY the report-corrections bullet block for `says "39 findings"` … `committed control has **40**`; an inverted 39/40 bullet now fails it (`report-corrections`), the true bullet passes. |
| 5 | R87Review2 F1/F2: the page-read act is not required and `fixture.patch.*` is unbound | the "read from the page" clause is receipt-level; narrowings 6–7 record that the counter enforces the descriptor/answer/read facts, not the act or the served-DOM source. |
| 6 | R87Review1 F1: driver/fixture pins are declaration-level | narrowing 9 records that the counter compares receipt fields to CLI pins and never reads instrument bytes; provenance rests on the driver's own `driverSha256` and the reviewer's reproduction. |
| 7 | R87Review1 F3: a `read` event's `isTrusted` is fixture-authored | narrowing 11 records that `trust-law` enforces the recorded literal, not a browser trust fact for the synthetic `read` event. |
| 8 | R87Exec2 §Findings: kill-power's `results` order varies across runs | narrowing 5 records that the mutant set/outcomes/totals are stable, the array order is not. |
