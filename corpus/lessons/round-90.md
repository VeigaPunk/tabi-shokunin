# tabi — round 90

L1 `TabiR90`. Base `a9f1da08` (lane clean; the round-89 verifier spot-check commit). The round-89
non-author spot-check (`corpus/lessons/round-89-verifier-spotcheck.md`) admitted r89 C1/C2 and
routed six record defects to r90 (§7). Claims: C1 coverage — capability
`chromium-showpicker-linux` generation r90 (the settle call is bound); C2 calibration — the six
r89 spot-check routed defects D1–D6.

D1 **`e573334c78fa`**, D2 **`18d06a3f3895`**, nonce **`tabi-r90-l1-e573334c78fa`** (the receipt was
produced once at the D1-derived nonce; D2 touched only the kill-power and battery instruments).
Instruments are the r89 family retargeted to r90 with the settle-call requirement (driver +
counter), two settle battery cases and two settle kill-power mutants, and the drift gate rewritten
to eight statements over the six r89 defects.

Census start: exit 0, 224 rows (`.ufo/waves/round-90/census-start.txt`); end: exit 0, 224 rows
(`.ufo/waves/round-90/census-end.txt`). No new SOURCES rows this round; S224/S223/S219 re-opened.

## Gate

### Sources — opened this round

The wave's scout re-fetched the two living WHATWG pages (HTTP 200) and located the three quotes the
round cites:

- **S224** — §2.3.8 `dfn id=set-of-comma-separated-tokens`: "tokens consist of any string of zero
  or more characters, neither beginning nor ending with ASCII whitespace" (17 words).
- **S223** — the file-upload state's `accept` paragraph: the attribute is a hint, not a validator.
- **S219** — the `showPicker()` steps' cross-origin SecurityError and the File/Color exemption.

Identified 3 / screened 3 / included 0 NEW rows / excluded 0 (all three re-opened in place; the
registry stays at 224). The round's `## Search log` entry records the access date and the located
quotes.

Admitted: `corpus/knowledge/chromium-showpicker-runtime-round-90.md` (cites S224, S223, S219, S216
and the r89 carrier rows).

Rejected (with flip conditions):

- **"The settle call proves Chromium parsed the attribute"** — the distinct expression binds the
  fixture's own call, not the browser's parser. Flip: a dialog-observable or source-side leg.
- **"`plan-calls` makes the domread data unforgeable"** — a receipt that carries both a forged
  `domRead` and a forged call passes. Flip: a provenance binding on the call's return value.

Assimilation: none (`merge/tabi/` adoption stays closed pending the open L0 `tabi | round-57`).
`considerthese/`: no such directory in this lane.

### Admitted / rejected claims

C1 and C2 are frozen in `.ufo/waves/round-90/claims.json`; instrument pins in
`.ufo/waves/round-90/freeze.txt` (D6 `de591e7a416b`; D1 `e573334c78fa`, D2 the restored
kill-power entries and the battery's schema/mirror repairs, D3 the counter simplification and the
allowlist limb, D4 the gate repairs the critic measured). Scored: counter clean **107** checks;
battery **226** cases / 0 failed / coverage 107/107; kill power **76** mutants / 76 killed / 0
survived / 0 crashed / 0 unapplied; selftest **12/12** (D6; 11 gates + `expectations-present`); record drift **7 → 0** over 8 statements;
leak witness dead-branch red.

Verdicts: **C1 NOT VERIFIED** on its declared axis `coverage` (the surface moved is a checker
obligation, not a domain surface — R90Critic F1.3 and R90Review2 §6 agree; legs (a)–(c) hold);
**C2 VERIFIED** on its predicate, with the counted set narrowed on record (five of the six §7
defects plus three self-checks; §7 defect 6 is not lane-measurable).

## Mistakes

| class | evidence | captured-by | fix |
|---|---|---|---|
| `range-replace-drops-adjacent-entries` — the kill-power insertion that added the two settle mutants replaced a three-line range and deleted the two adjacent r89 entries `replay-limit-printed-drift` and `text-leg-law-skip` | `scripts/kill-power-round89.mjs:174-175` vs the r90 list before D2 (72 entries, both absent); the pre-flight sweep printed `mutants 72` where 74 were intended (`/fast/scratch/hyaku/tabi-r90/preflight/killpower.json`) | the frozen list's entry count was never compared to the intended count after an insertion; the selftest's `kill-power` gate only reads `survived`/`crashed` | both entries restored, list now 74, D2 re-freeze, and the scored sweep re-run on the exact bytes; the round-91 rule: after any mutant-list edit, assert `entries === previous + added` before the sweep |
| `forgery-schema-rewrite` — the battery's `forgery()` rewrote the prior's schema to `tabi-chrome-cdp-showpicker-r89`, so the `replay-event-timeline` case carried an extra `schema` finding and the case failed on a collateral | `scored/battery-a.json` (first pre-flight run: 2 failed, `extra ["schema"]`) | the battery's per-case allowlists are checked against the counter's declared ids, but the case's own mutation was not reviewed against the schema string it rewrites | `c.schema` now copies the real receipt's schema; battery 225/225 green (D2) |
| `mirror-prior-resolution` — the battery's mirror-lane walk cases failed `prior-set-complete` because the prior-set file carried absolute paths into the real lane, so the mirror's own copy of the prior was an undeclared receipt | `scored/battery-a.json` (first pre-flight run: `prior-set-unparsable` case extra `prior-set-complete`) | the mirror case builds the lane copy but the declared prior still resolved outside it | prior-set paths are lane-relative (the counter resolves them against `--lane`); 225/225 green (D2) |
| `stale-record-pointer` — the SCORECARD blocks for r79–r89 cite a README `## Round N coverage` section the current README (14 lines) does not carry | `README.md` at base (14 lines, no coverage rows); `SCORECARD.md:4011`, `:4247` etc. | no gate reads README against SCORECARD; the round-90 C2 statement set does not cover README | README gains `## Round 90 coverage`; the historical rows stay missing and are named here, not silently repaired (outside the frozen claim) |
| `gate-blind-to-backticked-pointer` — the first drift gate's `r89-narrowing-pointers` regex required the path and the section sign to be contiguous, so `` `plans/round-89.md` §Narrowings `` (backticked) passed while `SCORECARD.md:4292` carried exactly that pointer | `w1/R90Critic.md` §F2.2 (both forms measured in a scratch lane copy: bare red, backticked green) | the gate was written against the form the correction block used, not against the forms the lane's records use | the statement now matches the optional backtick and scans the ledger; the marking rule (`does not exist`/`superseded`/…) is per line; the three live sites are annotated in place and D4 re-measures 7 → 0 |
| `statement-reads-prose-not-state` — `r89-census-attribution` never read `corpus/SOURCES.md`: a scratch lane with 223 rows and a count-free `end.txt` stayed green, and the correction's own "(19 words)" annotation contradicted the 17-word quote | `w1/R90Critic.md` §F2.3 (223-row counterexample green; base 224 already true and red) | the statement's name said "census" while its predicate read the correction block | it now counts the `S###` rows in `corpus/SOURCES.md` (`sourcesRows === 224`), requires the correction's annotation to equal the measured word count, and the annotation is corrected to 17 |
| `self-certifying-source-grep` — `r89-leak-enforcement` grepped the gate's own source for `rmSync`/`fixtureAbsent`, so a dead-branched removal stayed green; and the record named a `selftest-fixture-cleanup-dropped` battery case that does not exist | `w1/R90Critic.md` §F2.4 (dead-branch copy: statement green, `--selftest` exit 1 `fixtureAbsent:false`); `grep` finds no such case in the battery | the statement tested text, not behaviour, and the record asserted an artifact nobody built | the statement now reads `.ufo/waves/round-90/scored/leak-witness.json` — stock run exit 0 with the fixture absent, dead-branch run exit 1 with it present, pin-matched to the frozen gate — and the record names that artifact instead of the nonexistent case |
| `post-hoc-freeze-attestation` — six freezes (D1–D6) in ~50 minutes, three of them C1 instruments; D1's battery pin (`06c67275`) matched no bytes ever found, and each scored artifact preceded the pin that attests it (measured by R90Review1 §2 and R90Sentinel) | `scored/battery-a.json` (11:20) vs the D2 freeze (11:23); `freeze.txt` history in `plans/round-90.md` §Re-freeze history; `w1/R90Review1.md` item 2 | the r89 rule ("freeze only after counter + battery + kill power + selftest run green on the exact bytes") was applied to the receipt but not to the instrument batch; each P0 the seats found forced another instrument edit | the final D6 pins match all eight files (`pins-match-freeze` green, selftest 12/12) and every intermediate digest is disclosed with its trigger; the r91 rule: run the full gate batch on the candidate instrument bytes BEFORE writing `freeze.txt`, and treat any post-freeze instrument edit as a re-freeze with a named trigger |
| `claim-type-overstates-the-counted-set` — the frozen C2 `type` says "the six routed defects", but the gate counts five of them plus three self-checks, and the plan named the sixth as "report author date" | `w1/R90Critic.md` §F2.1; `claims.json` C2 `type`; `plans/round-90.md` (pre-correction) | the claims `type`, the plan and the gate were written at three different moments and never reconciled before the freeze | §7 defect 6 is recorded as not lane-measurable, the SCORECARD row and `plans/round-90.md` §Wave corrections state the counted set, and the claim text stays frozen (a narrowing on record, not an amendment) |

| `report-author-date` — the r89 spot-check's defect 6 recurred in a minor form: the report commit's author date (12:10:25) precedes the cited lane tip's committer time (12:11:41) by 76 s, because the report body was written before the lane landed and only the lane-tip line was patched afterwards | `git log -1 --format='%ai %ci' -- .ufo/reports/round-90/tabi.md` → author 12:10:25, committer 12:12:00; lane `f2b69440` committer 12:11:41 | nothing checks the report author date against the lane tip's committer time; the helper stamps the author date from the working-tree write | disclosed here and in the report; the committer time is after the lane tip, so the landing order is provable. The r91 rule: write the report body only after the lane commit lands, so author and committer both follow it |
