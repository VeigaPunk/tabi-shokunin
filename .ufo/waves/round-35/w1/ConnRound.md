# Round 35 w1 — ConnRound (planning data-walk) report

## Verdict

The round's two claims and the eight routed defects dispose cleanly onto the frozen round-35 surfaces:
C1 owns defect 2 (the counter already contains the round-34-mandated n4 SIDE refusal and control J6; the
383-line browser-ground sweep is the claim itself), C2 owns a new capability acquisition (Firefox
158.0.1 / geckodriver 0.37.1, two committed runs + the counter's live leg, entry + SOURCES S134+ with
`## Gate` rows), defect 1 and the defect-6 precision items land as append-only corrections (README new
block; lesson §Errata intake), defect 5 lands as the sole SOURCES cell change (S125 `recheck` `90d` →
`on-release`, logged old→new), and defects 3/7 stay carried. Integration order is settled so every
append-only file gains only additions (numstat deleted 0) and neither check script nor any frozen counter
byte moves; measurement runs `measure.sh` at the final REV in a clean clone. One pre-data finding worth the
L1's attention: the frozen C2 counter implements `TARGET = 14` (`c2-firefox-bidi.mjs:77`), while the
written claim predicate says `admitted >= 16` — the plan treats the written claim as authoritative, targets
16/16 with zero slack, and records the instrument mismatch in the lesson (section (e)).

## Evidence

Commands run (all read-only; exit 0 unless noted; no git mutations, no installs, no fetches):

- `read claims.json:1-39,40-153,155-223` — claims, controls (C1 J1–J8, C2 J1–J5), feasibility, kill rules, priorClosure.
- `read baseline/controls-summary.json` — 14 control receipts (C1 J1–J8, C2 J1–J5 + 1).
- `read baseline/c1-pins.json` — 21 sibling pins.
- `read baseline/c2-instrument-check.json` — two Firefox sessions, 16/16 predicates, byte-identical first screenshots `7a3ae6a9…`.
- `read scripts/check-adjacency.mjs:1-170` — gate header: columns, dispositions, finding vocabulary, exit classes, pins.
- `read counters/c1-adjacency-sweep-v3.mjs:1-63` — frozen C1 definitions: BG candidate, mapped/screened/newMapped, n1–n4, predicate (unaccounted 0, newMapped ≥ 2).
- `read counters/c2-firefox-bidi.mjs:1-58` — frozen C2 definitions: entry/s1/receipt/firefox/binding/admitted/failing, predicate.
- `grep`/`read` `c2-firefox-bidi.mjs:60-77,339,442-482` — `const TARGET = 14` at `:77`; predicate `:462`; header comment `:54` says `>= 14` while claims.json `:162` says `>= 16` (finding, section (e)).
- `read scripts/check-bidi-runtime.mjs:149-383` — FIXTURE/serveFixture/ROWS/PREDICATES (R1–R17; R16 = `no-bidi-counterpart`), recordFromTranscript.
- `read SKILL.md:2855-2888` — decision rule (round 33 §decision rule, lines 2863-2881) and declarations precedent.
- `read corpus/QUALITY.md:532-590,670-675` — criteria 87–91, 97 (red states tied to round-33/34 control files).
- `read corpus/lessons/round-34-verifier-spotcheck.md:159-177` — routed defects 1–8; `:30` no-harm/relabel scope.
- `read corpus/lessons/round-34.md` — C1/C2 decisions, mistakes M1–M5, Errata intake 1–7, U01–U28 route.
- `read corpus/README.md:3-6,788-812` — round-34 block; stale `:794` "four new map rows", `:799` "rows 15–18"; frontier rows `:803-804`.
- `read corpus/SOURCES.md:128-147,193-198` — registry rows S114–S133 (S125 at line 139; S133 last at line 147); contract in `CORPUS.md:64-155` (§SOURCES.md).
- `read SCORECARD.md:1855-1958` — round-34 executed disposition, planned rows (browser-ground sweep; C2 amendment), window at `:1922`, round-35 declared claims `:1924-1958`.
- `read corpus/knowledge/webdriver-bidi-runtime-round-32.md:1-83` — entry model (source:/verified-at:/recheck:, §1 run facts, §2 matrix table).
- `bash` listing: round-35 waves dirs (`w1/` exists; `measure/` empty), `corpus/adjacency*` (screen-skill, screen, adjacency exist; `adjacency-screen-browser.tsv` absent), candidate list 383 lines (`wc -l` → 383; key<TAB>text), `scripts/bidi-firefox-loopback-round35.mjs` absent, SKILL.md tail, README/SCORECARD tails.
- `bash` scratch: `mkdir -p /fast/scratch/hyaku/tabi-r35/ConnRound` → exit 0.

## Key file:line anchors (plan)

- Defect 1 → README `:794`, `:799` (stale, keep bytes); correction block appended after `:804`.
- Defect 2 → C1 counter `c1-adjacency-sweep-v3.mjs:52-58` (n4 SIDE), control `baseline/c1-J6-quote-states-no-side.json`.
- Defect 5 → SOURCES `:139` (S125 row), `recheck` cell old→new.
- Defect 6 → SOURCES S131 row anchor (`:145`) immutable; correction in lesson; RFC 4122 wording note.
- C1 candidate lanes: kaidoku 137, kumitate 66, kagi 56, kake 51, kotoba 20, mado 20, tsukuroi 20, kama 9, mori 2, chousa 1, tameshi 1 = 383.

## Deliverables

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/ConnRound/plan.md` (sections (a)–(e)).
- This report: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/ConnRound.md`.

Scratch `/fast/scratch/hyaku/tabi-r35/ConnRound` created for discipline; no lane scripts ran; removed before yield.
