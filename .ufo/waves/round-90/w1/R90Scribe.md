# R90Scribe — round 90, wave w1 — scoped findings

Seat `R90Scribe` (scribe). Axes: **depth, calibration**. Milestone: record drafts.
Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Base `a9f1da08`. Instrument freeze: the lane
re-froze three times during my seat (D1 `e573334c78fa` → D2 `18d06a3f3895` → D3 → D4
`85c4191706b3`); the last `freeze.txt` I saw pinned
`check-showpicker-round90.mjs` = `6f65a0d420adea5947eb6a218ca46b354a966e8f695bde28d2df422f7074f735`,
and all 8 pinned files verified `OK` at 11:31:53 (`sha256sum -c .ufo/waves/round-90/freeze.txt`).
Scored nonce `tabi-r90-l1-e573334c78fa`; receipt
`corpus/evidence/round90/chromium-showpicker/receipt.json` (driver `ac5a7a5e5653…`, fixture
`5fb1f0f7806c…`).

**Lane files were not edited.** Four draft bodies and eleven receipt/evidence files are under
`.ufo/waves/round-90/w1/R90Scribe/`. My scratch (`/fast/scratch/hyaku/tabi-r90/R90Scribe`) is
deleted.

---

## Behavior (what I did)

Drafted independently, from the instruments and the receipt, four things:

| deliverable | file | what it contains |
|---|---|---|
| (a) r90 knowledge-note body | `w1/R90Scribe/draft-a-knowledge-note.md` | the measured law, the leg facts, the declared limits, the frontier — plus an 11-row divergence table against the live `corpus/knowledge/chromium-showpicker-runtime-round-90.md` |
| (b) r90 lesson Gate source rows | `w1/R90Scribe/draft-b-lesson-gate.md` | S224 / S223 / S219 with quotes located by me in the staged bytes and word counts (17 / 20 / 21), the census counts, and two notes on what the live lesson and SOURCES entry do not yet say |
| (c) SCORECARD r90 claim-table + capability-row wording | `w1/R90Scribe/draft-c-scorecard.md` | proposed wording for both rows, the narrowings paragraph, the Scored line, with the reasoning for every deviation from the live text |
| (d) four `## Mistakes` candidates | `w1/R90Scribe/draft-d-mistakes.md` | four rows in the r89 lesson's `class / evidence / captured-by / fix` shape |

## Gates I ran (read-only; every command names the lane explicitly)

- `node scripts/check-showpicker-round90.mjs --lane <ABS lane> --receipt corpus/evidence/round90/chromium-showpicker/receipt.json --expect-driver-sha256 ac5a7a5e… --expect-nonce tabi-r90-l1-e573334c78fa --expect-fixture-sha256 5fb1f0f7… --prior-set .ufo/waves/round-90/controls/c1/prior-set.txt --json`
  → **exit 0, `clean`, 107 checks, 0 findings.**
- `node scripts/check-record-drift-round90.mjs --lane <ABS lane> --json` → **exit 0, 8 claims,
  0 mismatches**; per-statement details include `words=17 annot=17 annotOk=true`,
  `sourcesRows=224`, and a live leak witness (`exit 0, fixtureAbsent true, decoyPresent true` /
  the dead-branch mutant `exit 1`).
- `node scripts/kill-power-round90.mjs --lane <ABS lane> --real … --work /fast/scratch/… --json`
  → **76 mutants / 76 killed / 0 survived / 0 crashed / 0 unapplied** (291 s, my own run).
- The r89 scored receipt under the r90 counter → **exit 1 with 35 finding ids**, including
  `schema` and `plan-calls` carrying all four domread legs (`settle-order`, `sequence`,
  `answer-files` each).
- `sha256sum -c .ufo/waves/round-90/freeze.txt` → 8/8 `OK` at 11:31:53.

## Touched surfaces

Only my own report file and `.ufo/waves/round-90/w1/R90Scribe/**`. No lane file edited, no
`git`/`jj` command run, no commit, no push, no scratch left under `/tmp`, no other seat's file
touched, no subagent dispatched, no background job left running.

### A mistake I made and corrected — disclosed

At 11:40 I copied my six forged RECEIPTS into `.ufo/waves/round-90/w1/R90Scribe/`. That was
wrong: the counter walks `TREES = ['.ufo/waves/round-90', 'corpus/evidence/round90']`
(`scripts/check-showpicker-round90.mjs:110`) and its `prior-set-complete` check refuses any
file in those trees carrying the receipt schema `tabi-chrome-cdp-showpicker-r90` that is not the
receipt under test, not a prior and not exempted. My forged receipts carried exactly that
schema, so they would have tripped `prior-set-complete` for every other seat's run against the
lane. The files were removed from my directory at ~11:43 (not by me — I was writing the report);
I did not investigate at the time, and the wave's own `prior-set-complete` finding in my
`ctl-r89-d2.json` shows the effect.

**Fix:** I rebuilt both decisive forges in scratch, re-scored them from OUTSIDE the lane (both
`exit 0, clean, 107 checks, 0 findings` — the finding reproduces), and stored only the counter's
OUTPUT as `evidence-forgeB.json` / `evidence-forgeF.json` with the schema
`tabi-r90-forge-evidence` (489 B each, not the receipt schema, so the walked-tree check is
unaffected). The forged receipts themselves are NOT inside the lane; the rebuild recipe is in
this report. I verified after the fix that
`node scripts/check-showpicker-round90.mjs --lane <ABS lane> --receipt
corpus/evidence/round90/chromium-showpicker/receipt.json … --prior-set
.ufo/waves/round-90/controls/c1/prior-set.txt --json` → **exit 0, `clean`, 107 checks, 0
findings** with all my artifacts present. My scratch is deleted again. This is offered to the
L1 as a candidate `## Mistakes` row (class: `evidence-schema-collision` — a seat's forged
receipts staged inside the lane's walked tree break the wave's own gate).

### Recipe to rebuild the two decisive forges (no receipt-schema file enters the lane)

Start from `corpus/evidence/round90/chromium-showpicker/receipt.json`; take the leg
`sp89-accept-domread-text`; its honest `cdpSendLog` has `window.__state()` at index 22,
`window.__inputs(true)` at 23 and `window.__setLeg("settle")` at 20.

- **forgeF** — insert one extra
  `{"method":"Runtime.evaluate","params":{"expression":"window.__state()","returnByValue":true}}`
  at index 22 (before the honest settle state read), then move the `__inputs(true)` entry to
  index 23 so it follows the INSERTED call; renumber every `id` to `index+1` and remap the
  leg's `interceptSendId` / `dismissSendId` / `triggerSendId` / `answer.setSendId`.
- **forgeB** — move the contiguous (`window.__state()`, `window.__inputs(true)`) pair so it sits
  immediately after the `DOM.setFileInputFiles` entry; renumber and remap as above.

Score either with the claim's own command plus the scored receipt's content-bound exemption:
```
node scripts/check-showpicker-round90.mjs --lane <ABS lane> \
  --receipt <the forged receipt, OUTSIDE the lane> \
  --expect-driver-sha256 ac5a7a5e56537acc8f61058059294c5f343b236de9b52b8d691995f1e6c49c8d \
  --expect-nonce tabi-r90-l1-e573334c78fa \
  --expect-fixture-sha256 5fb1f0f7806c8f099976078f3f03c9e08d6814346cc29fdccd022f4037bd7ac8 \
  --prior-set .ufo/waves/round-90/controls/c1/prior-set.txt \
  --tree-exempt-sha256 be8a5c38a8f3a6d9edb469f8867b1448a6f120654337a4b31bffa5dfb7d1f4f9 --json
→ exit 0, clean, 107 checks, 0 findings   (both forges, on the D3/D4 counter bytes)
```
The `--tree-exempt-sha256` is the scored receipt's own file sha256; it is needed because the
real scored receipt stays in the walked tree and is not the receipt under test.

## Findings

**F1 — CONFIRMATION of a sibling finding: the r90 `plan-calls` settle-ORDER check is anchored to
the FIRST `window.__state()` evaluate in the send log, not to the settle-marked one. Two
receipts I built pass clean.** `scripts/check-showpicker-round90.mjs:608-610` locates the anchor
with `log.findIndex(c => c.params.expression === 'window.__state()')` and requires the settle
call at `anchor + 1`. It never correlates that index with the `window.__setLeg("settle")` call or
with the leg's `marks` array. Against the live counter bytes (`6f65a0d4…`):

- **forgeF** — insert an EXTRA `window.__state()` before the honest settle one and put
  `__inputs(true)` immediately after the INSERTED one. The settle read is then NOT immediately
  after the settle-marked state read, yet `settleIx === stateIx + 1` still holds because
  `findIndex` returns the inserted call. → **exit 0, `clean`, 107 checks, 0 findings.**
- **forgeB** — move the whole (`window.__state()`, `window.__inputs(true)`) pair to sit
  immediately after `DOM.setFileInputFiles`, i.e. **before** `window.__setLeg("settle")`: the
  settle read happens before the settle. The `want`/`got` ordered-plan comparison still holds
  because it filters the send log down to `DOM.setFileInputFiles` / target-wrapper /
  `__inputs(true)` and ignores the `__setLeg` and `__state()` calls. → **exit 0, `clean`, 107
  checks, 0 findings.**

**Attribution (checked against the sibling reports):** this family was reached first by
**R90Review2** (F7, "the state anchor is expression-only"; their receipt
`R90Review2-f7-fake-state-anchor.json` replaces the anchor call's params and scores clean 107)
and by **R90Review1** (§5: "`stateIx` is the **first** `window.__state()` in the leg… a driver
reorder that inserted an earlier probe `__state()` would false-refuse", rated low risk,
driver-side convention). My contribution is two RECEIPT constructions they did not build,
measured clean on the final D3/D4 bytes, one of which moves the settle read BEFORE the settle
mark; and the wording consequence below.

The honest receipt satisfies the strong reading (`__state()` at index 22, `__inputs(true)` at
23, `__setLeg("settle")` at 20), so **the capability is real on the measured bytes**; what is
overstated is the *binding*. The live knowledge note, the live capability row and `SKILL.md`'s
r90 registry all say "immediately after the settle `window.__state()` evaluate" / "immediately
after the settle `window.__state()` call" — a position the counter does not enforce. No battery
case or kill-power mutant can see this family: the battery's `plan-calls-settle-order` SWAPS
the two calls (which does trip the check) and the kill-power mutants
`settle-order-any` / `settle-want-dropped` / `settle-want-always` / `settle-allow-any` mutate
the check's own source, not a receipt. Draft (a) divergence **D2**, draft (c) capability-row
item 2, and `## Mistakes` candidate 1 all carry this.

**F2 — CONFIRMATION of a sibling finding, still open in the records: the "forbids it on every
other leg" limb is enforced by `send-log-allowlist`, not by `plan-calls`.** The live note's
measured-law item 2 and the live capability row both attribute both limbs to `plan-calls`.
Measured: a receipt carrying `window.__inputs(true)` on `sp84-accept-answer` is refused with
`send-log-allowlist: sp84-accept-answer:expression`; `plan-calls` does not fire for the call
(the `plan-calls` finding on my forged receipt was `dismiss-id`, an artifact of my own
id-renumbering). The current counter's `evalAllowed` returns
`p.kind === 'showpicker-domread'` for that expression
(`scripts/check-showpicker-round90.mjs:553`). **R90Review1** found this first (item 5 and its
m2/m14 matrix: on the D3 bytes both are "refused by `send-log-allowlist` only; `plan-calls`
passes"), and the lane's own `plans/round-90.md` §Wave corrections records it ("R90Review1 item 5
… enforced by `send-log-allowlist` (D3), not by `plan-calls`; recorded, not amended"). What
remains OPEN — and is what my contribution adds — is that the knowledge note and the SCORECARD
capability row still carry the old attribution, and that the frozen C1 sentence in
`claims.json` still says `plan-calls` (which is a claim-side divergence the lane recorded but
did not amend, correctly). Draft (a) divergences **D1**/**D8**, draft (c) capability-row item 1.

**F3 (NEW — no sibling seat covers it; I grepped every wave-1 seat report for "31 word",
"verbatim", "paraphrase" and "25-word" and the only hits are in my own report) — the r89
`corpus/SOURCES.md` search-log quote is still a paraphrase inside quotation
marks, and the r90 drift gate cannot see it.** `corpus/SOURCES.md:305` quotes 39 words;
word-level diff against the staged bytes (`.ufo/waves/round-90/sources/common-microsyntaxes.html`,
sha256 `2e9e2cbbe1ed…`) shows three edits: `COMMA character,` → `COMMA character (,),` ;
`nor containing any commas` → `nor containing any U+002C COMMA characters (,),` ;
`optionally surrounded` → `and optionally surrounded`. The r89 lesson's appended block asserts
"the search-log quote is verbatim"; the r90 drift statement `r89-census-attribution` reads the
appended block's own annotation (`words=17 annot=17 annotOk=true`) and the census row count,
never that SOURCES line. Same defect class the r89 spot-check §5/§7 item 3 routed. Draft (b)
note 2 and `## Mistakes` candidate 2.

**F4 (NEW) — the r89 lesson's own `## Gate` section still carries the 31-WORD S224 quote (over the
≤25-word CORPUS cap); the ≤25-word version lives only in the appended block, which the r90
drift gate is scoped to.** `corpus/lessons/round-89.md:29-31` — 31 words by my count; the
appended block's version at lines 101-103 is 17 words. The drift gate slices the lesson from
the `## Corrections carried by round 90` heading onward
(`scripts/check-record-drift-round90.mjs:66-69`), so the Gate section's own over-cap quote is
out of its reach and the gate is green. The lane repaired the block's inline label mid-wave
(`(19 words)` at 11:26 → `(17 words)` now; the file was edited at 11:36) — the label now agrees
with the gate. Draft (b) note 3 and `## Mistakes` candidate 3.

**F5 (NEW) — the live r90 lesson Gate block lists a located quote + word count for only S224.** S223
and S219 are described in prose with no quote and no count. Given the r89 spot-check's §5
defect 3 was precisely an over-cap Gate quote, all three should carry ≤25-word located quotes
(17 / 20 / 21 — all three located by me verbatim in the staged bytes). Draft (b).

**F6 (NEW) — the live r90 search-log entry promises located quotes it does not contain.**
`corpus/SOURCES.md:317` says "the three located quotes are the sentences the r89/r90 laws cite"
but carries no quoted sentence; the r89 entry did. Draft (b) note 2.

**F7 (NEW) — the live r90 SCORECARD C1 `Before → after` cell under-reports the control.** "exit 1
with `schema` and `plan-calls` on all four domread legs" reads as two findings; the control
produces **35** ids. Both named ids are present and `plan-calls` does carry all four domread
legs, so the cell is not false — it is under-specified. Draft (c).

**F8 (NEW) — the live r90 SCORECARD C2 row header still says "the six r89 spot-check routed defects",
while `plans/round-90.md` §Wave corrections records that five of the six are counted and §7
defect 6 (report author date) is not lane-measurable.** The lane's own note says the SCORECARD
row carries the narrowed statement; it does not yet. Draft (c).

**F9 (NEW) — the r90 knowledge note's file-name claim is stale.** "The delivered bytes still carry the
r83 marker under the r89 file names" — the r90 receipt's delivered names are
`tabi-r90-a.txt`, `tabi-r90-b.png`, `tabi-r90-second.txt`, `tabi-r90-dir` (r90 names, not r89).
The MARKER content is still r83 (`tabi-r83-answer-alpha\n`), so the sentence's substance holds
and only the file-name half is a stale carry-over from the r89 note. Draft (a) divergence D3.

**F10 (NEW) — the r90 knowledge note's `recheck:` front-matter line uses `<pin>` / `<scored nonce>` /
`<receipt fixture sha256>` placeholders** where the r89 note spelled out the three real digests.
The pins are known (driver `ac5a7a5e5653…`, nonce `tabi-r90-l1-e573334c78fa`, fixture
`5fb1f0f7806c…`), so the line could be runnable as written. Draft (a) divergence D4.

### Findings I checked and did NOT raise

- The C1 capability itself: honest receipt satisfies the strong reading; the four token lists
  are byte-identical to r89's (`DOMREAD` table diff: no change); 41 legs, `failures: []`, 41
  distinct `--user-data-dir` values (one fresh browser per leg).
- The C2 axis: 8 statements, 0 mismatches, my own run agrees; the before-control's 7 mismatches
  and the ids match the lane's `drift-before.json`.
- The lane's own C1 verdict **NOT VERIFIED** (axis miss, reported) — the lane's call, recorded
  in `plans/round-90.md` §Wave corrections. My F1–F2 findings are about what the counter's
  `plan-calls` check binds, orthogonal to which axis moved. I do not dispute the verdict.
- `plan-calls` does enforce exactly-one and absence-in-the-right-place on the domread legs:
  forgeD (two settle calls) → `plan-calls:sequence`; forgeE (`returnByValue:false`) →
  `plan-calls:sequence`; forgeC (call on a non-domread leg) → `send-log-allowlist:expression`.
  Only the POSITION anchor is weak.

## Out of scope / not done

- I did not run the base-`a9f1da08`-worktree before-controls myself (the lane's own
  `drift-before.json` and the r89-under-r90 control both exist and I measured the latter); the
  base C1 "no r90 receipt → exit 2" claim is taken from the counter's source, not re-measured.
- I did not re-run the selftest runner (`scored/selftest.json` was 0 bytes when I read it at
  11:39 — the lane was writing it).
- I did not re-measure the battery myself (I read the lane's `scored/battery-a.json`: 226 cases
  / 0 failed / coverage 107/107). The kill power I DID run independently: 76/76.
- No amendment to any frozen predicate, counter, pin, prior, threshold or kill rule is proposed
  anywhere in my drafts. F1 and F2 are attack findings for the L1 to weigh; the drafts propose
  wording changes to RECORDS only, plus an r91 rule for the next generation.

## Calibration note

I am confident in F1–F4, F7–F10 as measurements: each is a file path plus a command whose output
I obtained on the live bytes. **I checked the sibling reports before claiming novelty.** F1's
family and F2's attribution divergence were found first by R90Review2 (F7) and R90Review1 (item
5) — I say so explicitly in the findings, and my contribution is the two extra constructions
(forgeF, forgeB), the final-bytes re-measurement, and the records-side wording consequence that
is still open. F3–F10 are mine: I grepped every wave-1 seat report for the relevant terms and
found no sibling coverage. I am less certain that F1 is material to the wave's own verdict rather
than a defect to disclose in the r90 knowledge note's limits section — the honest receipt does
satisfy the strong reading, so C1's measured surface is unaffected. That is the L1's call, and
the drafts present both readings. The mid-wave re-freeze (D1→D4, three instruments' bytes
changing under a frozen nonce) means every byte-level finding above is stated against the
snapshot named in each draft, not against a moving target.

## Tooling

No tool was installed, upgraded, or updated in this seat. `node` (v24.21.0) and the lane's own
pinned instruments were used as-is; `sha256sum`, `grep`, `jq`, `diff` (coreutils/diffutils) for
verification. No pacman transaction was needed; the operator's update-safety gate was not
entered.

## Artifacts

- Report: `.ufo/waves/round-90/w1/R90Scribe.md` (this file)
- Drafts: `.ufo/waves/round-90/w1/R90Scribe/draft-{a-knowledge-note,b-lesson-gate,c-scorecard,d-mistakes}.md`
- Draft index: `.ufo/waves/round-90/w1/R90Scribe/drafts.md`
- Receipts: `.ufo/waves/round-90/w1/R90Scribe/` —
  `counter-r90.json` (clean, 107), `ctl-r89-d2.json` (exit 1, 35 ids),
  `drift-now.json` (8/0), `kp-now.json` (76/76), and the two decisive forge OUTPUTS
  `evidence-forgeB.json` / `evidence-forgeF.json` (both `clean`, 107 checks, 0 findings).
  The forged receipts themselves are deliberately NOT in the lane — see the disclosed mistake
  above; the rebuild recipe is in this report.
- Scratch `/fast/scratch/hyaku/tabi-r90/R90Scribe` — deleted after the receipts were copied.
