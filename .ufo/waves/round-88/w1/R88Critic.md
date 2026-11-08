# R88Critic — R88 falsification (claims vs instruments)

Assignment `w1` — attack C1 (accept-grammar sentence vs measured facts and counter scope) and C2 (four drift statements vs do-nothing constructions). Seat is read-only; no predicates/counters/pins/priors/thresholds/kill-rules proposed for amendment. All probes run from scratch `/fast/scratch/hyaku/R88Critic/` (removed before yield).

## Verdict summary

- **C1 — HELD, with two scope overstatements and zero contradicting facts.** The scored receipt contradicts nothing: across the 12 grammar legs the file always lands, fires trusted `input`+`change`, and the page reads the stored bytes back, on inputs whose raw attribute `window.__inputs()` records verbatim (`accept: e.getAttribute('accept')`). The counter's `accept-grammar-law` has exactly the lawful scope — one fixture-descriptor equality per leg plus the delivered-file checks, never a tokenisation claim. But the new legs measure less than the claim sentence implies (see C1-A, C1-B below), which is a wording/scope issue, not a falsification of the law.
- **C2 — three statements HELD, two construction-level defects that must be recorded.** `scorecard-tallies` is defeated by a stub-heading hijack (C2-A); `gate-selftest` is a source-text test that a do-nothing construction satisfies (C2-B). The runner's `gate-selftest` genuinely executes the four isolated `--selftest` modes, which partially — but not wholly — compensates. `selftest-wording` and `quality161-sweep` held against escapes.
- No claim is *falsified* by the receipts. The two C2 defects are fixable (smallest safe corrections named below); under the frozen kill rule I am not amending them, only flagging them for L1.

---

## C1

### Measured facts in the scored receipt (commands + output)

Fixture sha256 `8f93405128f1b0286549c470ff2e849e861af2a79b3d3cccea32dd9f27231a35`; driver `8c015fa4…`; nonce `tabi-r88-l1-86f1dcec`.

```
$ node scripts/check-showpicker-round88.mjs --lane <lane> --receipt corpus/.../receipt.json … --json
{"schema": "tabi-chrome-cdp-showpicker-r88-counter", "verdict": "clean", "checkCount": 102, …}
```

The three r88 legs (extracted from the receipt):

| leg | target | accept (from `fixtureInputs`, i.e. `getAttribute`) | answer | stateAfter |
|---|---|---|---|---|
| `sp88-accept-case-png` | `ac` | `IMAGE/PNG` | `tabi-r88-b.png` (image/png) | `ac: [[tabi-r88-b.png, 21, image/png, ""]]` |
| `sp88-accept-audiovideo-text` | `au` | `audio/*,video/*` | `tabi-r88-a.txt` (text/plain) | `au: [[tabi-r88-a.txt, 22, text/plain, ""]]` |
| `sp88-accept-mimeparam-png` | `amc` | `image/png;q=0.9` | `tabi-r88-b.png` (image/png) | `amc: [[tabi-r88-b.png, 21, image/png, ""]]` |

`window.__inputs()` returns `accept: e.getAttribute('accept')` (fixture line 196), so the counter's `desc.accept === accept` binds the RAW attribute string, and the leg shape binds the read-back of the delivered bytes. The event chain per leg is `… click@pad, input@target, change@target, read@target`, trusted — the law's factual content.

### C1-A — does the case-variant leg prove anything about the UA's tokenisation? NO (wording overstatement, not a false law)

`IMAGE/PNG` answered with image/png proves only that (a) the attribute string was recorded, and (b) the answer was accepted. Since the law is precisely "accept is not a validator on a programmatic answer", a case-variant accept that would, in a dialog, be case-insensitively normalised adds zero evidence about tokenisation — the leg cannot distinguish "UA lowercases the token and matches" from "UA ignores the token entirely". The counter itself asserts no tokenisation: `accept-grammar-law` checks `desc.accept === accept` (string equality of the raw attribute) plus the delivery triad. Verdict: the claim sentence says the leg measures "case variants"; that is true only of the recorded attribute, and the limit sentence already concedes the DOM-parsed normalisation is frontier. Not a falsification — but no future round should cite `sp88-accept-case-png` as tokenisation evidence.

### C1-B — does the MIME-parameter leg measure a parameter? NO (same class)

`image/png;q=0.9` answered with image/png: the answer would land identically if the UA parsed `;q=0.9` as a parameter, ignored it, or dropped the whole token. The leg measures "a string containing `;q=0.9` did not cause rejection", which is the law and nothing more. The claim sentence's phrasing "MIME parameters … measured, one leg per form" overstates. Same verdict as C1-A.

### C1-C — does the counter enforce exactly the sentence's scope (no wider)? YES, with one counting observation

`GRAMMAR` (12 entries) covers the r86 forms (wildcard, mixed, `application/pdf`) + r87 forms (audio, video, multimime, whitespace) + the three r88 forms = 12 legs, but the claim leg-(a) says checkCount 99 while the `counter-clean` gate asserts `checkCount === 102` and the live run reports **102**. Record the discrepancy: `claims.json` C1 leg (a) reads "scores clean … at checkCount 99", the assignment brief I was sent says "checkCount 102", and the shipped counter prints 102. The gate (`selftest-r88-gates.mjs:55`) asserts 102. The sentence "clean at checkCount 99" is stale by three checks (or the brief is the corrected one). Not a law-falsification, but a false numeral in a frozen claim as dispatched. [INFERENCE width: whether "99" predates a late counter edit — unverified.]

The sentence's ten token forms: 12 grammar legs include two duplicates of form (wildcard ×2, mixed ×2), so distinct token *forms* are exactly 10 (`image/*`, `image/png, .txt`, `application/pdf`, `audio/*`, `video/*`, `image/png,application/pdf`, `  image/png ,  .txt  `, `IMAGE/PNG`, `audio/*,video/*`, `image/png;q=0.9`). Scope matches.

## C2

Live lane: `check-record-drift-r88.mjs` exits 0 (claims 4, mismatches 0); `--selftest` exits 0, asserting fixture lane red on `scorecard-tallies` + `selftest-wording` only.

### C2-A — `scorecard-tallies`: DEFEATED by stub-heading hijack (fixable defect)

The statement finds the first `## Round N` heading and tests that segment. Probe B (staging in scratch):

```
## Round 44
selftest 9/9
## Round 44b
selftest 10/10
## Round 68 … 9/9 …
```
→ exit 0, mismatches 0. The stub `## Round 44` (matches the regex) with `9/9` precedes the real `## Round 44b` carrying 10/10; `findIndex` returns the stub and the boundary search stops at `## Round 44b`, so the 10/10 never enters the segment.

Also defeated: probe G (a duplicate `## Round 44` at the end carrying `selftest 10/10`) → exit 0, and probe F (a `selftest 10/10` inside `## Round 70`, outside the seven) → exit 0 — the `tallyLines` count is computed and printed but never gated, so a swept tally outside the seven is invisible.

Held: probe A — `selftest 10/10` under `### Round 44 extra` inside the first section segment → exit 1 (the `###` heading does not bound, so the 10/10 correctly poisons the segment). The section-boundary escape I was asked to hunt (`10/10` hidden by a later heading) is blocked for sub-headings; it opens only via `##`-typed duplicate/stub headings and off-set sections.

Smallest safe correction (for L1, not this seat): test every `## Round N` occurrence (all indices, each segment), not the first; and assert the off-set `selftest 10/10` lines equal the one sanctioned r87 row (whose section header is `## Round 87`), rather than printing `tallyLines` unexamined.

### C2-B — `gate-selftest`: source-text test, satisfied by a do-nothing construction (fixable defect)

The drift statement checks `/--selftest/` against the sibling scripts' source bytes, `/record-drift|check-record-drift-r88/` in the runner, and `--selftest` against its own source. Probe D: sibling scripts containing only the *string* `--selftest` (one comment, one bare line) and a runner mentioning `record-drift` → exit 0, mismatches 0. Two compounding weaknesses:

- `mentions` is self-referential: the gate's own file always contains `--selftest` (its mode), so that sub-conjunct is tautological.
- The statement never executes anything. What compensates: the runner's `gate-selftest` gate (`selftest-r88-gates.mjs:86-95`) DOES spawn each of the four `--selftest` modes and requires `ok === true` + exit 0; and the four instruments' `--selftest` modes genuinely build scratch fixtures (counter: wrong-schema receipt → `schema`, exit 1; battery: a named case red; kill-power: a named mutant killed; drift: fixture lane red on two statements). So a *broken instrument* (one that throws, hangs past 1800s, or prints no `ok`) cannot pass the runner gate. BUT an instrument whose `--selftest` is reduced to a stub printing `{ok:true}` passes the runner gate — and the drift statement, being text-only, is satisfied by the stub's source containing `--selftest`. The drift gate's own `--selftest` additionally asserts only that `scorecard-tallies` and `selftest-wording` go red on its fixture; a fixture where only `gate-selftest` is broken greens the drift selftest. In short: execution is real at the runner level; the drift *statement* tests text, not execution, and can be green without the work.

Smallest safe correction: make `gate-selftest` check the runner's *recorded* selftest output (the four modes' `ok` fields) or bind each `--selftest` mode's stable finding id, not go shoving execution into the drift gate; extend the drift selftest fixture to also go red on `gate-selftest`.

### C2-C — `selftest-wording`: HELD

Probe C (`selftest 10/10 at D7` in SKILL.md + lesson87) → exit 1, `selftest-wording` red. The four-file stale sweep (skill, note, plan87, lesson87), plus the lesson88 `D6` + correction-named requirement, is a real repo-state test; a construction omitting the correction naming fails.

### C2-D — `quality161-sweep`: HELD on its stated scope

Probe I (cite `check-record-drift-r88` inside rule 162, only `tally` in 161) → red (`cites=false`): the `^161\.` block regex correctly stops at `\n162.`. Probe E (a one-line "161. see SCORECARD tally via check-record-drift-r88.") greens it without a runtime sweep — inherent to the frozen scope ("four record statements, not every sentence"); the statement tests the prose enumeration exists, which is the claim. Recorded as a limit, not a defect.

## Commands run

- `node scripts/check-record-drift-r88.mjs --lane <lane> --json` → 0 mismatches, EXIT 0; `--selftest --json` → `ok:true`, EXIT 0, fixture red on `scorecard-tallies, selftest-wording, gate-selftest, quality161-sweep`.
- `node scripts/check-showpicker-round88.mjs … --json` → verdict `clean`, checkCount **102**.
- Scratch probes (node, building fixture lanes against the frozen gate): A stub test, B hijack, C stale, D text-only, E one-liner, F off-set 10/10, G duplicate heading, H stale-outside-four, I 161-boundary — outputs as quoted above, scratch directory removed.
