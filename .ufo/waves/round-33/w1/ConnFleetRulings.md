# ConnFleetRulings — C1 rulings (tabi round 33 w1)

## Verdict

No operator or integrator ruling made since round 17 settles any contested/split surface of the C1 adjacency map. The two relevant tabi L0 rows — `.ufo/l0-questions.md:62` (the-musketeer Chrome profile / CDP 127.0.0.1:9222 lease, kagi↔kake) and `:65` (reach of the round-16 CDP ruling to revenger and kama) — remain open and carry no answer; every later source (round-17…32 verifier-spotchecks, fleet round reports, `AGGREGATE.md` P5/D-36/D-76, `ROADMAP.md:140-141`, `PROTOCOL.md:457-461`) restates openness, and none was converted into a settlement. Exactly one venue-eligible line exists (`ROADMAP.md:140` at fleet@f47ad6ba, outside `.ufo/`, naming kagi and kake), and it *declares the contest open* — it would pass `check-adjacency`'s mechanical `ruled` rule but is not a settlement, so it must not be cited as one. The substantive lease ruling (round-10 protocol D-36) lives in `.ufo/reports/round-10/protocol.md:253-257`, predates round 17, is in an ineligible venue, and explicitly defers ownership ("Until ruled: … Neither may absorb the other's half"). Baseline check at frozen rev e6b0a907: verdict clean, 10 rows verified, selfRulings 2.

## Evidence

### Search surface and commands (all read-only; exit codes recorded)

| Command | Exit | Result |
|---|---|---|
| `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"` + `git -C "$S/clone" checkout -q --detach e6b0a9074d434ccc307badd312ae7379d1193fea` | 0 | clone HEAD = e6b0a9074d434ccc307badd312ae7379d1193fea |
| `node scripts/check-adjacency.mjs --at e6b0a907… --fleet /home/vgpnk/Projects/shokunin --repo "$S/clone" --json` | 0 | `{"verdict":"clean","rows":10,"verified":10,"selfRulings":[2],"at":"e6b0a907…"}` |
| `git -C /home/vgpnk/Projects/shokunin grep -n -i -E 'rul(e\|ing)\|adjudicat\|arbitrat' refs/heads/master -- ':!.ufo/'` | 0 | 636 hits, all in LOG.md/AGENTS/AXES/CORPUS/ROADMAP/goal files; none settles a C1 surface |
| `grep -nE 'tabi \|' .ufo/l0-questions.md` | 0 | 9 tabi rows: lines 25, 34, 62, 65, 76, 77, 91, 155, 165 |
| `grep -n -E 'L0 ANSWER\|RESOLVED\|Answer by ID\|— ANSWER\|answered' .ufo/l0-questions.md` | 0 | No answer attached to lines 62 or 65; only line 77 is a self-resolving row (round-19 lesson drift, not a sibling surface) |
| `git grep -n -i -E 'musketeer\|9222\|listener-census\|CDP\|crawl\|lease' refs/heads/master -- '.scratch/goal-*.md'` | 0 | No goal-file ruling on lease/CDP surfaces |
| `git log --oneline -G 'musketeer\|9222\|CDP\|lease' -- README.md ROADMAP.md PROTOCOL.md MISSION.md LOG.md SCORECARD.md` | 0 | Only tree-repair/round bookkeeping commits; no post-r10 lease ruling commit |
| `git -C tabi-shokunin log -1 --format='%an <%ae>' -- <spotcheck>` per round 16-32 | 0 | every `*-verifier-spotcheck.md` last authored by `protocol-shokunin` (non-tabi) → venue-eligible if any line ruled; none does |

### Candidate rulings found (full list in `rulings.tsv`, 8 rows)

1. **ROADMAP.md:140** (fleet@f47ad6ba8d306f8125597401cb2ce45c1297a593, outside `.ufo/`):
   `Contested rulings still open: CDP-9222 lease (kagi r3+r7, kake r9 — lease is`
   — venue-eligible mechanically (names kagi+kake, commit reachable), but declares the contest **open**: it is not a settlement. Using it as `ruled` would misrepresent the record; it is the *only* eligible venue line found.
2. **Round-10 protocol D-36** (`.ufo/reports/round-10/protocol.md:253-257`, row at `:220`):
   `CDP-9222 / burner-chrome lease (D-36): global resource arbitration belongs to operator-side — no province owns a cross-lane lease. Until ruled: kagi documents the lease mechanism … kake documents consumer-side retry semantics. Neither may absorb the other's half.`
   — substantive integrator ruling (procedural split: kagi documents lease, kake consumer retry), but venue is `.ufo/reports/` (ineligible), predates round 17, and explicitly defers ownership ("Until ruled"). Also re-confirmed at `AGGREGATE.md:667` (RULED at r10) and `:734` (D-76 OPEN: PROVINCE records still owed).
3. **AGGREGATE.md:202 P5**: `Three items are open with no ruling: CDP 9222 + musketeer profile (kake ↔ kagi)` — venue ineligible; states open.
4. **Round-16 CDP ruling** (`tabi-shokunin@5859243183c4d7ac5429dfdb8a73ce0d9a43d583:corpus/lessons/round-16-verifier-spotcheck.md:141-142`): tabi owns live browser/CDP page observation; kaidoku keeps CDP only as REA provider surface. Pre-round-17, already consumed by the map's one `ruled` row (self-venue, flagged selfRulings). It is the reference the L0:65 scope question asks about.
5. **No ruling found** for: revenger (`rea-browser-runtime-evidence`), kama (`cdp-live-target-census`), kake (`crawler-discipline-vs-publishing`), kaidoku/revenger (`reverse-engineering-of-shipped-artifacts` — only a tsukuroi L0 question at `l0-questions.md:42`, unanswered).
6. **PROTOCOL.md:457-461** (fleet, venue-eligible but normative, not a settlement): `Contested scope — evidence or work is reported in the lane report; the integrator arbitrates by refining PROVINCE.md and records the ruling in the round notes … silence is not a ruling and must never default scope to whichever lane wrote first.` — supports keeping contested rows contested-open.

### Verifier-spotcheck statements of continuing openness (all non-tabi authored)

- `round-17-verifier-spotcheck.md:88-89,94`: contested-open rows resolve to l0 `:62`/`:65`; "only 1 row is arbitrated, 4 await L0".
- `round-18-verifier-spotcheck.md:114,164`: "two L0 questions remain open" (`:62`/`:65`).
- `round-22-verifier-spotcheck.md:242`: "open L0 scope rulings (… `l0-questions.md:62`, `:65`)".
- Fleet `round-17/tabi.md:128`, `round-18/tabi.md:76`, `round-19/tabi.md:32`, `round-21/tabi.md:127`, `round-29/tabi.md`, `round-32/tabi.md:104` all repeat the two questions open / no absorption.

### Open `tabi |` L0 rows and answer status

| L0 line | Round | Subject | Answered? |
|---|---|---|---|
| 25 | 5 | Operator approval (C3 third-party read-only, C2, C6 budget) | No |
| 34 | 1 | Run namespace ratification | No (proceeds without answer) |
| 62 | 17 | the-musketeer/CDP-9222 lease (kagi↔kake) — C1 surface | **No** |
| 65 | 17 | Round-16 CDP ruling reach to revenger/kama — C1 surfaces | **No** |
| 76 | 19 | Frozen lessonDrift policy | Resolved by row 77 |
| 77 | 19 | RESOLVED-BY-RULING (Main, in-session orchestrator) | Yes (resolution row itself) |
| 91 | 22 | Quota-only recovery classification / safety hold | No (documentary disposition sought) |
| 155 | 22 | Target-decision ruling (encoding revision admissibility) | No |
| 165 | 27 | §10 quarantine/frozen-claim conflict (S114/S140) | No |

## Deliverables

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-33/w1/ConnFleetRulings/rulings.tsv` (8 candidate-ruling rows: surface, sibling, ref, verbatim quote, meets-rule verdict, note)
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-33/w1/ConnFleetRulings.md` (this report)

Consequence for C1 construction: no new `ruled` row can be grounded on a post-round-17 settlement (none exists); the contested surfaces must stay `contested-open` on L0 `:62`/`:65` (both still name the siblings), and the kake maps (crawler split, refused-routes) remain split-declared/refused-route on the sibling PROVINCE text.
