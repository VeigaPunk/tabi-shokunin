# Round 35 w1 — planning data-walk (ConnRound)

Scope: bounded data-walk for the L1 (TabiR35). Read-only; no lane edits. All line numbers
verified on the frozen tree at a4bfef0f (claims.json, baseline/, lessons, SOURCES, README,
SCORECARD, SKILL, gates, counters).

Grounding: round-35 claims.json (C1/C2 full text + controls + feasibility + priorClosure),
round-34 closure §Routed defects 1–8, round-34 lesson, SOURCES contract (CORPUS.md §SOURCES.md),
README coverage-map blocks, SCORECARD round-34 executed/planned blocks, gates and counter headers.

---

## (a) Routed defects 1–8 — disposition this round + exact touch

| # | defect | disposition | file+line it touches |
|---|---|---|---|
| 1 | Corrections sweep (README:794 "four new map rows"; :799 "rows 15–18") | **correction** (append-only block; the stale lines keep their bytes, CORPUS.md rule "corrections are new entries") | `corpus/README.md` — new append-only section `## Round 35 — correction (append-only)` citing `:794` and `:799` (three new rows 15–17: kake lab-performance, kaidoku HAR, kaidoku screenshot compare); mirrored in `corpus/lessons/round-35.md` §Errata intake |
| 2 | Adjacency carried claim (3rd miss) | **claim C1** + the two amendment bullets are already frozen IN the counter | the freeze already contains: n4 SIDE refusal (`counters/c1-adjacency-sweep-v3.mjs:52-58`), control J6 (`baseline/c1-J6-quote-states-no-side.json`), and the sweep itself = C1's surface (383 candidates). Touch: `corpus/adjacency-screen-browser.tsv` (new ledger), `corpus/adjacency.tsv` (possible new rows), `SKILL.md` §round-35 declarations (appended), `corpus/lessons/round-35.md` §C1 decisions. Residual: controls still pin only declaration/split clauses (J1–J8); unguarded clauses stay recorded limits → wave-2 attack per new row + screen-reason groups |
| 3 | C2 counter amendment (lstat refusal, scrubbed HOME, controls for 9/10 mutants, whitespace self-sniff) | **carried** (notClaimed[1]) — C2 this round is a capability acquisition, not the amendment. Note: the new counter already confines writes to `$TMPDIR` mkdtemp (c2-firefox-bidi.mjs:56-58), so the symlink-write hazard shrinks by design; the amendment as a claimed counter change stays carried | touch: `claims.json` notClaimed[1] (frozen; no edit), recorded in `corpus/lessons/round-35.md` |
| 4 | Round-33 w2 U01–U28 | **frontier/lesson item** — each gets a disposition row in lesson round-35 §Errata intake (round-34 lesson: "each stays open for round 35"; round-34 §Errata intake 4 is replaced by the round-35 disposition table). Fold into round-35 surfaces where bytes overlap: U01 (Measured-cell decor) → C2 entry Measured grammar; U02/U03 (forgery constructions) → C1 J8 / C2 J2–J5 note; U04 (contested-open substring) → carried; U05/U07/U27/U28 (gate exit-class/H2 provenance) → carried; U08–U13/U16–U19 (round-33 precision) → carried; U14/U15/U20/U21 (criteria 87/88, screen granularity) → C1 ledger reasons; U22–U26 (coverage of R4, near-copy drivers, S125 carry) → C2 file + S125 disposition | touch: `corpus/lessons/round-35.md` §Errata intake |
| 5 | S125 recheck cadence | **frontier item, landed** as a row-cell change: S125 `recheck` `90d` → `on-release` (enabling path re-verified at 156.0.8078.47 by round-34 ScribeS125Cadence receipts; the round-35 noHarmRule explicitly permits SOURCES row-cell edits each logged old→new) | `corpus/SOURCES.md` line 139 (S125 row), `recheck` cell only; old→new logged in `corpus/lessons/round-35.md` §Errata intake |
| 6 | Precision (low): S131 quote locator 245-247 vs actual 244-248; noHarmRule cells; RFC 4122 wording | **correction** (lesson errata; anchor cell is immutable, contract allows only status/recheck/used-by in place) | `corpus/lessons/round-35.md` §Errata intake: S131 corrected span (lines 244–248, quote at 244–248; row anchor stays), RFC 4122 restated as refused "not needed" (not a duplicate URL — S124/S126 already carry BiDi/WebDriver URLs; RFC 4122 refused on scope), and the "name every routed cell in the next freeze" note is satisfied because round-35 plans **no** in-place cell edits beyond S125 recheck (all other ledger notes are appended corrections, not edits) |
| 7 | Calibration counter v4 | **carried** (notClaimed[0], since round 32) | `claims.json` notClaimed[0] (frozen); recorded in lesson round-35 |
| 8 | M1 misroot (wave label in seat paths) | **hold — fixed & verified** in this round's dispatch: every w1 seat dir is `.ufo/waves/round-35/w1/<seat>/` built from the wave id (this seat's own output dir proves it; `grep -c 'round-35/w[12] =' w1-dispatch.json` → 0 on w1) | no touch; state the check in lesson round-35 |

Additional planned carries (not routed defects): battery v2 / decision-table v2 (notClaimed[2]), assimilation §10 (none — no merge/tabi/ theme this round).

---

## (b) Integration order — append-only preserved, scripts byte-unchanged

Immutable at the freeze (must equal frozenDigests / pins): `counters/c1-adjacency-sweep-v3.mjs` (5707a937…), `counters/c2-firefox-bidi.mjs` (7cc7f17f…), `baseline/controls.mjs`, `measure.sh`, `scripts/check-adjacency.mjs` (4e2c2a64…), `scripts/check-bidi-runtime.mjs` (370e8e95…). Neither check script is edited, moved or wrapper-touched (the counters import them from `--rev` via scratch files under `$TMPDIR`).

Order (append-only files get additions only; `git diff --numstat BASELINE REV` deleted 0 for all listed paths):

1. **w1 build** (seats write to their `.ufo/waves/round-35/w1/<seat>/` dirs; no lane-file edits by seats):
   - Adj* scribes dispose the 383 C1 lines by lane chunk (kaidoku 137, kumitate 66, kagi 56, kake 51, kotoba 20, mado 20, tsukuroi 20, kama 9, mori 2, chousa 1, tameshi 1) → draft ledger rows for `corpus/adjacency-screen-browser.tsv` (header `sibling_ref<TAB>reason<TAB>surface<TAB>quote<TAB>note`; reasons closed vocabulary; same-surface requires a verified row of the same sibling) and draft map-row candidates for `corpus/adjacency.tsv` with new tabi declarations (SKILL.md §round-35 declarations).
   - C2 seats build `scripts/bidi-firefox-loopback-round35.mjs` (model: `scripts/bidi-loopback-round32.mjs`; independent client; never imports the counter), run two committed Firefox sessions (geckodriver `--port`/`--websocket-port` free, `--profile-root` + HOME/TMPDIR/XDG_* in scratch, `-headless`, loopback fixture), and emit `corpus/evidence/round-35/bidi-firefox/receipt.json` + two transcripts; draft `corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md` (model: `webdriver-bidi-runtime-round-32.md`) and the SOURCES rows S134+ (opened this round; each with a `## Gate` row in lesson round-35).
   - First falsifiers (critics/mutation-testers) attack the frozen counters from the baseline (limits only; no counter edits).
2. **L1 w1 integration** commits the data deliverables + the S125 recheck cell change (logged old→new) + README round-35 block (rows below) + lesson round-35 draft + SCORECARD round-35 declared block is already frozen; no check-script or counter bytes change. Commit order inside the integration: data first (ledger, entry, driver, receipts, sources), then index rows (README, lesson, SCORECARD, LOG), each as append-only additions.
3. **w2 falsification** attacks: every new map row by ≥2 seats; each screen-reason group sampled; C2 driver/receipt/entry re-derived and probed (below). Findings only — seats never repair.
4. **L1 wave-2 integration**: every withdrawn row is removed or screened BEFORE the measurement (never kept against a finding, C1 killRule); any entry/driver defect found in w2 is fixed and re-committed (the deliverable is the claim's object; the counter bytes stay frozen).
5. **Measurement** at the final REV: `measure.sh <REV> <OUT> <FREEZE>` in a clean clone; counter bytes from the freeze commit; TMPDIR under `/fast/scratch/hyaku/tabi-r35/`; C1 with `--repo <clone> --fleet /home/vgpnk/Projects/shokunin --rev <40-hex>`, C2 with `--repo <clone> --rev <40-hex>` (live Firefox leg inside the counter). Raw output committed under `.ufo/waves/round-35/measure/`. First scripted C2 measurement = reading; a live flake is a failing row, never re-run.
6. **Post-measurement append-only**: SCORECARD.md round-35 executed disposition, LOG.md, report `.ufo/reports/round-35/tabi.md`; lesson round-35 finalized (sources `## Gate` rows, errata intake, C1/C2 decisions).

Append-only guard list (deleted 0 at REV): SKILL.md, SCORECARD.md, LOG.md, corpus/README.md, corpus/QUALITY.md, corpus/adjacency.tsv, corpus/adjacency-screen.tsv, corpus/adjacency-screen-skill.tsv, corpus/knowledge/*, corpus/lessons/*. New this round: corpus/adjacency-screen-browser.tsv, corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md, corpus/evidence/round-35/…, corpus/lessons/round-35.md, scripts/bidi-firefox-loopback-round35.mjs. SOURCES.md: only new rows S134+ and the S125 recheck cell change (logged).

---

## (c) Kill-rule firings + the wave-2 item that catches each

### C1 (predicate: adjacency clean AND unaccounted == 0 AND newMapped >= 2; rows must survive wave 2)
1. **split-declared row fails QUALITY 97** — sibling line states no side (a sibling census/report of tabi's own text, or a third-lane record whose quote passes the mechanical n4 SIDE regex with a side word in a non-side sense) → w2 withdraws → newMapped < 2 → predicate false. Catch: each new row attacked by ≥2 seats (critic + reviewer) reading the sibling's own file at its pin, judged row-by-row at closure (round-34 rows 17/18 precedent).
2. **rename route / same-surface re-key** — a new row restates a surface a baseline row already owns (kake lab-performance or JS-rendering split; kaidoku HAR ground already mapped at baseline as `recorded-har-producer-channel`); n2 checks the baseline map only (near-vacuous disclosure) → w2 re-key probe withdraws → newMapped < 2. Catch: per-new-row re-key comparison against baseline rows and prior rows (round-34 w2 CritRowLiveDelivery precedent).
3. **ledger form/completeness miss** — a screen row fails the counter's format (quote not verbatim substring, reason outside vocabulary, same-surface not naming a verified row of the same sibling) or 383 lines are not each mapped/screened exactly once → unaccounted > 0 → predicate false. Catch: screen-reason group sampling in w2 + an exact-key completeness pass (dedupe, 383 unique keys, every reason group sampled).

### C2 (predicate: no entry finding AND no binding finding AND failing == 0 AND admitted >= 16; first scripted measurement is the reading)
1. **live flake** on the counter's own Firefox session or on a committed run (geckodriver/Firefox headless nondeterminism: R13 intercept/continue race, R14 traverseHistory timing, R17 prompt handling, or first-screenshot byte binding across runs/live) → failing >= 1 → predicate false; no re-run. Catch: instrument-check parity is already frozen (baseline/c2-instrument-check.json: two sessions, 16/16, byte-identical screenshots); w2 tries the same driver path on the same binaries and reports whether the row is reproducible — the first measurement stands regardless.
2. **receipt/driver shape finding** — transcripts not pairwise-distinct (one transcript at two paths), driver path/bytes equal the gate or counter, driver statically imports the counter, sessionId not lowercase-UUID, moz:geckodriverVersion/browserVersion inconsistent across runs/live, or first screenshot differs from the live session (relabelled Chromium copy → t3) → failing 16 → predicate false. Catch: w2 reviewer re-derives the receipt contract from committed bytes (sha256/grep/jq over transcripts, driver path/import graph — round-34 verifier evidence-verify pattern).
3. **entry/registry finding** — Measured cells not exactly `yes`/`no`(+reason), R16 marked yes, duplicate/unknown row ids, or s1-source failure (SOURCES row not mined, used-by missing the entry, lesson Gate row host/sha mismatch, row present at baseline) → admitted < 16 → predicate false. Catch: w2 reviewer cross-checks entry ↔ SOURCES row ↔ lesson Gate row (census-style) with the gate's own parseTable semantics.

---

## (d) README coverage-map rows the round must add

In the round-35 append-only block (new section after `corpus/README.md:804`), two rows + frontier restatements:

| Row (Note) | Holds | Sources pointer |
|---|---|---|
| `adjacency-screen-browser.tsv` *(round 35, with `adjacency.tsv` rows …)* | The 383 sibling `SKILL.md`/`corpus/knowledge` lines at their pins that match the frozen browser-ground regex, neither name tabi nor were round-34 candidates — every line mapped (verified row) or screened under a closed reason; N new boundaries (…) | sibling pins `baseline/c1-pins.json`; `SKILL.md` §round-35 declarations; counter `node .ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs --rev <REV> --repo <clone> --fleet <fleet> --json` |
| `knowledge/webdriver-bidi-firefox-runtime-round-35.md` *(round 35)* | WebDriver BiDi runtime on a second engine: Firefox 158.0.1 / geckodriver 0.37.1 (official Mozilla binaries), loopback fixture, one host build; matrix §2 rows R1–R15, R17 runtime-held (R16 stays `no` — no BiDi command); two committed runs + the counter's live session, first screenshots byte-identical | S134+ (Firefox/geckodriver official-release rows opened this round, `## Gate` rows in lesson round-35); counter `node .ufo/waves/round-35/counters/c2-firefox-bidi.mjs --rev <REV> --repo <clone> --json` |

Frontier restatements in the same block (append-only; earlier rows keep their bytes):
- Supersede `README:803` ("browser-ground lines … stay unswept") → bounded: 383/383 accounted; the C1 count command is the pointer.
- BiDi runtime on a second engine: update the round-32/34 frontier surface — Chromium-only runtime now has a Firefox pair at one pinned build; still open: further engines, real-site ground, non-headless.

---

## (e) Pre-data consistency observation (frozen C2 counter vs written claim predicate)

The frozen counter implements `TARGET = 14` (`counters/c2-firefox-bidi.mjs:77`, predicate at `:462`:
`out.admitted >= TARGET`), while `claims.json` C2 written predicate (:162) is `admitted >= 16` and the
target says "admitted 16 of the 16 matrix rows that have a BiDi command". The counter header comment (:54)
also says `>= 14`. The counter bytes equal the frozen digest, so this is not fixable in-round.
Consequence for measurement and closure: if the measured run admits 14 or 15, the counter prints predicate met
but the written claim predicate is false — the L1/verifier must read the claim's written `>= 16` as
authoritative and treat 14/15 admission as an honest stop, recording the instrument mismatch in lesson
round-35 (the baseline instrument check already proves 16/16 is achievable: `baseline/c2-instrument-check.json`
holds all 16 predicates on two sessions). The C2 plan therefore targets admitted 16 with zero slack.

---

## Deliverables of this planning walk
- `plan.md` (this file) → `.ufo/waves/round-35/w1/ConnRound/plan.md`
- Report → `.ufo/waves/round-35/w1/ConnRound.md`
