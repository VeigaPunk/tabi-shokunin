# ConnRound — round-33 w1 cross-claim connector and planning data-walk

Seat: ConnRound (connector, frontier). Baseline `b7d16fb8…66cd`, freeze `e6b0a9074d434ccc307badd312ae7379d1193fea`. Read: `claims.json`, `corpus/lessons/round-32-verifier-spotcheck.md`, `SCORECARD.md:1687-1694` (plus `:1637-1665`, `:1656-1658`), `SKILL.md:2612-2628`, `corpus/lessons/round-32.md:179-187`, `SOURCES.md`, the two frozen counters, `measure.sh`, `scripts/check-gate-registry.mjs`, `scripts/sources-census.sh`, `SHONEN.md`, `PROVINCE.md`.

## Verdict

C1 and C2 are causally separable claims: their tracked input sets are disjoint (C1 touches only `corpus/adjacency.tsv`, the new `corpus/adjacency-screen.tsv`, the pinned `scripts/check-adjacency.mjs`, the sibling PROVINCE.md blobs at frozen pins, and its own counter; C2 touches only `scripts/check-bidi-runtime.mjs`, the round-32 BiDi entry/receipts/RerunDriver transcripts, and this round's own S127-S129 rows, lesson Gate table, v2 note and SKILL registry row), so either claim can verify with the other reverted and measurement itself runs them as independent steps. The round-32 closure's seven routed defects land almost entirely on this round's C2 (gate v2), the errata scribes (wave-2 precision defects), the lesson (S125 cadence, feasibilityDisclosed correction, M9 landed) and the carried calibration v4; the one planning gap I found is that round-32's two planned superseding rows for S124/S126 (which were allocated the S127 id) are left open because this round's w1 consumes S127 for the ChromeDriver session-id row — they must be re-named in the round-33 lesson ledger or they drop silently. The sharpest no-harm regressions to watch at integration are (a) the three stale `cases=27`/`(27/27)` bidi-tally statements (SKILL.md:2626, SCORECARD.md:1657, LOG.md:2154) when v2's 44-case tally lands — check-selfassessment will go red without append-only corrections; (b) the v2 gate-registry row must be appended after SKILL.md:2626 with the same gate name and all eight fields; (c) S127-S129 must keep `recheck 90d` (never on-release) or S129's 154-tag pin enters the release-pins population unresolved; (d) S127's source file must not be `session_commands.cc`, which would duplicate S125's URL and add a census W04 — all other planned URLs are new.

## 1. Causal separability of C1 and C2

Files C1 touches (counter `c1-adjacency-sweep.mjs` constants): `corpus/adjacency.tsv` (MAP, :58), `corpus/adjacency-screen.tsv` (SCREEN, :60; fresh ledger, header exactly `sibling_ref reason surface quote note`), `scripts/check-adjacency.mjs` (ADJ_GATE, :57; byte-digest pinned :59 = claims.json frozenDigests `4e2c2a64…`), each sibling `PROVINCE.md` at frozen PINS (:66-87), and the count's own fresh read. It reads none of SOURCES.md, SKILL.md, SCORECARD.md, LOG.md, corpus/knowledge/*, or scripts/check-bidi-runtime.mjs.

Files C2 touches (counter `c2-bidi-forgery-battery.mjs` constants): `scripts/check-bidi-runtime.mjs` (GATE, :56; the one prior file the noHarmRule allows C2 to rewrite), `corpus/knowledge/webdriver-bidi-runtime-round-32.md` (ENTRY, :60), `corpus/evidence/round-32/bidi/**` (RECEIPT/EVD, :61-62), `.ufo/waves/round-32/w2/RerunDriver/bidi-run` (RERUN, :64), plus this round's own surface: the S127-S129 rows, the lesson `## Gate` table (v2 rule s1 reads it), the v2 note, and the SKILL registry row. None touch `corpus/adjacency.tsv`, the screen ledger, or sibling repos.

So: **yes, each verifies with the other reverted.** Reverting C2 (restore v1 gate blob at baseline bytes, drop S127-S129/note/lesson rows) leaves C1's sweep inputs byte-identical; reverting C1 (drop map/screen additions) leaves C2's gate/entry/receipt inputs intact. Measurement shares only infrastructure: `measure.sh` runs c1 then c2 as independent node programs in one clean clone (measure.sh:25-26), both take the frozen digest bytes from the FREEZE commit, and both need the same scratch/clone discipline — no shared tracked artifact. The noharm sweep (measure.sh:30-39) runs both gates; a reverted side returns to baseline byte state and its gate exits 0 by construction, so no cross-coupling appears there either. The only semantic overlap is the claim-level rule that a counter not run is a claim not verified (claims.json measurementRule) — identical for both.

## 2. Round-32 routed defects and planned rows left open, and where they must be named

Round-32 closure spotcheck §Routed defects (:146-154):

1. **Gate v2 → claimed as this round's C2.** Closed if C2 lands; otherwise must be carried. Named in: claims.json C2, lesson round-33 §Gate (admitted F-refusal list), SCORECARD round-33 plan.
2. **Calibration counter v4 → stays open.** `notClaimed` in claims.json. It MUST be re-named in lesson round-33's routed-defects section and in SCORECARD's round-34 plan, or it is silently dropped (this is the same carry pattern the lane used for v3 → v4).
3. **S125 recheck cadence → curation, open.** Spotcheck :150: "Either add a release-pin receipt entry for S125 and restore a release-bound cadence, or record in the lesson why 90d is the right cadence". Must be named in lesson round-33 §Gate (a recorded reason line, or a receipt entry). Not visible in any w1 seat prompt other than the lesson scribe's §Gate block.
4. **claims.json C1 feasibilityDisclosed false as written → correction, open.** Must be named as an append-only correction in lesson round-33 `## Mistakes` (mined as this round's mistake) and in SCORECARD's corrections section, citing the claims.json C1 line (priorClosure item 4; M2).
5. **Wave-2 precision defects (CritNewNumbers 5, CritEntry 10, RevLesson, CritReadmeLog, ConnRoutedLedger 19) → handled by errata scribes this round.** ScribeErrataB/C exist; their dispositions must land in lesson round-33's ledger (round-32.md:186: "this section and the round-33 plan are their ledger"). Any undisposed item must remain named in the lesson carry list.
6. **M9 fix cell → lesson round-33 must record it landed** (spotcheck :153).
7. **Control provenance → closed by construction**: `baseline/controls.mjs` is committed, receipts carry the scratch commit and tree (claims.json priorClosure item 7; spotcheck :154 has the mutated-control trees now reproducible via the committed controls builder).

Planned rows at SCORECARD.md:1687-1694: operability gate v2 (now claimed), calibration v4 (carried). **Additional plan left open:** round-32 lesson :170 and w2 ReopenS124/ReopenS126 planned *superseding rows* for S124's scope/anchor and S126's anchor, both allocated the next unused id S127. Round-33 w1 consumes S127 for the ChromeDriver session-id row (C2). So the S124/S126 superseding rows are open and must be re-named in lesson round-33 (errata/ledger) and re-planned for the next BiDi source round — otherwise the S124 scope/Gate-word-count and S126 §6.7 anchor corrections stay orphaned.

## 3. SHONEN boxes: citable evidence after this round, non-author reachability

- **Box 1 (SKILL decision tables/error patterns/checklists/cited sources)** — new citations: SKILL.md round-33 append-only sections (v2 gate registry row superseding `:2626`; sibling-overlap sweep + screen-ledger decision rule). Non-author reachable: yes, resolved repo pointers; the qualitative judgement stays operator-owned. `[~]` unchanged.
- **Box 2 (end-to-end domain task executed + logged)** — existing journey pointers stand; LOG.md gains the round-33 entry (v2 gate work, `log-append.md` draft). Non-author reachable via committed bytes; not a new domain journey, so the box's substance is unchanged. `[~]`.
- **Box 3 (instructions executable without oral context)** — still rests on `executor-test-sufficiency.md` whose verdict used a lane-dispatched seat. This round's C2 battery is fully scriptable and frozen (a non-author can re-run it), but it does not discharge this box; no `[x]` can be written by this round. Non-author verification NOT reachable (operator-owned).
- **Box 4 (no cross-domain bleed)** — PROVINCE.md unchanged; NEW mechanical evidence this round: `corpus/adjacency.tsv` + `corpus/adjacency-screen.tsv`, gated by `scripts/check-adjacency.mjs` (scripted; runs in measurement). The map's split-declared rows name tabi and the other side (e.g. kake `crawler-discipline-vs-publishing`; kagi CDP-lease contested-open), which is exactly "lane reports name contested scope, integrator arbitrates". Non-author verification: mechanically reachable (re-run the gate). `[~]`.

## 4. What makes each trend improved vs unchanged this round

- **Expansion** — improved iff ≥1 of S127-S129 is admitted as a mined tier-A row and the v2 knowledge note (`corpus/knowledge/bidi-runtime-gate-v2-round-33.md`) lands; unchanged iff rows are rejected/queued and no new corpus knowledge is added. (Capability row is not re-entered; the round-32 capability restarts the window, so score stays 9.)
- **Quality** — improved iff the append-only corrections actually land: the feasibilityDisclosed named correction (SCORECARD + lesson), the v2 tally corrections (27 → 44), the errata dispositions, and no new stale statement. Unchanged iff corrections are drafted but not integrated or none land.
- **Discernment** — improved iff the w1 falsifiers (MutC1Counter, MutC2Counter, CritC1Axis, CritC2Axis) produce genuine constructions, the gate's F-refusals are principle-based rather than battery-specific tells, the C1 screen/map judgments survive the closure spot-check, and QUALITY criteria 87+ codify the disciplines; unchanged if decisions are later shown to rest on construction tells or mislabeled dispositions.

## 5. No-harm regression risks (each with evidence lines)

(a) **Gate-registry row for v2.** `check-gate-registry.mjs` takes the LATEST row per gate name in document order (header :37-38); a v2 row must be appended after `SKILL.md:2626`, keep gate name `bidi-runtime`, and carry all eight fields (FIELDS, :61). Failure modes: e2 (missing field), e3 (script absent — n/a), or name drift creating a second gate identity. The draft row's selftest cell must state the real v2 tally, not `cases=27`.

(b) **Selfassessment tallies.** v2's selftest tally = 27 (v1) + 8 (F1-F8) + 9 (MutC1 survivors M04, M06, M09, M10, M11, M14, M17, M18, M19) = **44**. Stale statements that will become m1 mismatches: `SKILL.md:2626` (`cases=27, passed=27`), `SCORECARD.md:1657` (`(27/27)`), `LOG.md:2154` (`BIDI_RUNTIME_SELFTEST … cases=27`). Each needs an append-only correction in the round-32 style once v2 lands (ExecTallyProbe provides the verified recipe). Without them, `check-selfassessment.mjs` mismatches >0 → noharm red → C2 fails.

(c) **Release-pins via new S-rows.** `check-release-pins.mjs` reads `on-release` rows pinned to Chromium tags into its population (S125 round-32 lesson M10). S127-S129 must keep `recheck 90d` (all three scribe prompts already mandate this). If any lands `on-release`, S129's 154.0.8037.97 tag pin (sandbox README) enters the population without a receipt entry → unresolved → gate red. S128 (Arch launcher) is not a Chromium-tag pin; S127 depends on the chosen chromedriver file (tag-pinned if `session_commands.cc`/`session.cc`). Current population 23/23 at baseline (noharm line 3).

(d) **Census W04 on duplicate URLs (S127-S129 vs existing rows).** `sources-census.sh validate` W04 = "same URL across scopes" (warning; exit still 0); E04 = same-scope duplicate error. Probe results on SOURCES.md:
  - S127 (ChromeDriver session id): file unpinned in the prompt; if the scribe lands on `session_commands.cc`, URL = S125's (`SOURCES.md:139`) → **W04**. Prefer a distinct file (`session.cc`, `server/http_handler.cc`, or util) or deliberately record the W04.
  - S128 (Arch chromium launcher): `gitlab.archlinux.org` PKGBUILD + `github.com/foutrelis/chromium-launcher` — grep exit 1, no existing URL → no W04.
  - S129 (sandbox README): `sandbox/linux/README.md` at tag 154 — grep exit 1, no existing URL → no W04.
  - Future watch: the round-32 planned S124/S126 superseding rows will reuse the BiDi WD URL (`webdriver-bidi-20261008`, SOURCES.md:138) when they land in a later round — then E04/W04 applies.

(e) **Other confirmed-safe surfaces.** noharm baseline gates all exit 0 (noharm-at-b7d16fb.txt, 10 gate lines + 18 selftests); check-adjacency at REV must stay byte-identical to `4e2c2a64…` (C1 kill rule); measure.sh's offline line 36 requires v2 to keep accepting the honest round-32 entry (H0) — consistent with the battery. PROVINCE.md/SHONEN.md must stay untouched (spotcheck :95).

## Commands / exit codes

See `ConnRound/evidence.txt` (all probes; exit codes recorded). Reads only; no writes outside this report and the output dir.

## Deliverables

- `Report: .ufo/waves/round-33/w1/ConnRound.md`
- `.ufo/waves/round-33/w1/ConnRound/evidence.txt` (probe receipts: URLs, exit codes, line citations)
