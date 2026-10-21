# ScribeReadme — round-19 corpus/README.md draft (wave 1)

Seat: TabiR19-2.ScribeReadme-4 (scribe, leaf). Baseline B = 66251bfc1aef393e4aec599e950a8deb867736bb.
Lane tip (`refs/heads/master`) at drafting: 66251bfc1aef393e4aec599e950a8deb867736bb.
Scope: draft only. The L1 (TabiR19-2) is the sole writer of `corpus/README.md`; this file is the draft.
No production file, no knowledge note, no edit to `corpus/README.md` or any shared file.

## 0. Conventions read (corpus/README.md, 399 lines at B; working copy identical to B)

- Append-only (PLAN §Byte-frozen: `corpus/README.md` is append-only). Historical blocks (`## Coverage map`
  table at `:11-21`, `## Frontier` at `:22-55`, each round section) stay as written.
- Coverage rows: "A row is written when its file exists, never before" (`corpus/README.md:9`).
- Gate the README diff enforces: `diff <(ls corpus/knowledge | sed 's/\.md$//' | sort) <(grep -o 'knowledge/[a-z0-9-]*\.md' corpus/README.md | sed 's|knowledge/||;s|\.md$||' | sort -u)` → no output (`corpus/README.md:349`). A README reference to a note that does not yet exist fails this check.
- Round sections use `## Round N — <title> (date)`, a note table `| Note | Holds | Sources |`, and a frontier table `| Frontier item | Current status | Pointer |` or prose with status words `held` / `docs-held` / `open` / `superseded` (`:171-199`, `:201-226`).
- Current end of file: `## Round 18 — …` (`:370-399`), last line `:399`.
- Note: `CORPUS.md` (cited by `corpus/README.md:9`) is not in the lane's tracked tree (`git ls-files` matched no `CORPUS.md`). The row rule is therefore taken from `corpus/README.md:9` itself; the fleet-root copy was not read.

## 1. Gate — the coverage row must not land before the note file

The seat brief asks for a coverage-map row for `corpus/knowledge/webmcp-declarative-validation-round-19.md`
with Holds/Sources TBD. That conflicts with the file's own rule (`:9`) and with the diff at `:349`:
a row (or a frontier line) naming the note while the file is absent makes the diff non-empty.
**Therefore the row and the frontier line below are STAGED in this report and are integrated by the L1
only after the note file exists in the lane and the diff returns no output.** The round-19 note is not in
the lane at drafting (`ls corpus/knowledge/webmcp*` → round-16 and round-17 notes only).

## 2. Draft A — coverage-map addition (append at file end, after Round 18)

Block to append (staged; Holds/Sources TBD as briefed):

```
## Round 19 — declarative WebMCP input validation (2026-10-21)

New knowledge map row (37 notes once admitted; the 36 earlier rows are unchanged; the
measured count is the round's committed measurement, not this sentence):

| Note | Holds | Sources |
|---|---|---|
| `knowledge/webmcp-declarative-validation-round-19.md` | TBD — runtime-held decision rows for declarative (`<form toolautosubmit>`) WebMCP input validation on Chromium 154.0.8037.97 loopback, flags on: cases with observed CDP `toolResponded` status/error text and form state, per the committed receipt. Holds is written from the receipt's `pass: true` cases only. | TBD — S### rows opened 2026-10-21 at Chromium tag 154.0.8037.97 (declarative validation source, S071 as predecessor); receipt `corpus/evidence/round-19/validation/receipt.json` |
```

Admission condition for this row (all must hold before L1 integrates it): (a) the note file exists;
(b) `diff` at `:349` returns no output; (c) the Holds cell names the receipt cases it rests on; (d) the
Sources cell names S### rows with their line anchors (no source-only claim sits in Holds).

## 3. Draft B — frontier status update (declarative validation moves source-level → runtime-held)

Gated like Draft A. The historical round-3 `## Frontier` (`:22-55`) and the kaika/round-16/17/18 status
text stay unedited. Append:

```
## Round 19 — frontier status (append-only; the wording at :22-55, :180-194, :302-305, :384-387 keeps its historical text)

| Frontier item | Current status | Pointer |
|---|---|---|
| Declarative WebMCP input validation | **runtime-held** on Chromium 154.0.8037.97 loopback, flags on, for the cases in the round-19 receipt that carry `pass: true` (gate: at least 12 such rows, per the round-19 plan's C1 counter). Before the receipt passes, this row stays **source-level**: `SKILL.md:1994-1997` ("source-level evidence, not a new runtime validation probe") is the current text. | `knowledge/webmcp-declarative-validation-round-19.md`; `corpus/evidence/round-19/validation/receipt.json`; SKILL.md "Declarative WebMCP input-validation decision table (round 19)" |
| Remaining after that move (unchanged, still open) | **open**: (1) real-site WebMCP — needs operator approval; (2) agent-side consumption of page tools — no MCP client observed; (3) custom elements / `ElementInternals` form-associated controls — not in any S### row and no runtime case; (4) non-autosubmit forms — the round-19 fixture contract gives every form `toolautosubmit`, so non-autosubmit submission is untested. Also still open from earlier rounds: extension↔daemon handshake, real-site rate/rights, real-site journeys, Chromium 152 at runtime. | `knowledge/webmcp-chromium-loopback-round-16.md`; `knowledge/webmcp-invocation-round-17.md`; `knowledge/harness-hardening-round-18.md`; `corpus/SOURCES.md` S071, S073 |
```

Grounding notes for Draft B: items (1), (2) and the extension↔daemon line are restated from `:302-305`
and `:328-332` (round 16/17). Item (3) and item (4) are named by the briefing; `grep` of `corpus/knowledge`,
`corpus/SOURCES.md` and `corpus/lessons` for `ElementInternals`/`form-associated` returns no row, so item (3)
is recorded as open with no source. Item (4) follows from the fixture rules in PLAN §C1 (one
`<form toolname toolautosubmit>` per tool); no non-autosubmit sample was measured.

## 4. Draft C — round-19 corrections index line (routed defect d1–d4; append after Draft B)

The corrections are being landed by the L1 and the C3 counter (`measure-c3.mjs` → `c3_routed_closed`).
Until those files exist, the index is staged with pending pointers.

```
Round-19 corrections index (append-only; older bytes stay historical):

| Earlier pointer | Current interpretation |
|---|---|
| `LOG.md:1059` ("QUALITY33–38") | round-19 LOG entry: "QUALITY 33–39 (seven)"; the count is re-derived from `corpus/QUALITY.md` (criteria 33..39 citing `round-18.md`) |
| `SCORECARD.md:830` (round-18 assertion-delta, numeric CDP codes) | round-19 SCORECARD correction line: "IDs and pass status retained"; lists the six case ids whose round-18 predicates replaced numeric CDP codes with message substrings, re-derived from `git show <B>:scripts/webmcp-invoke-round17.mjs` vs `…round18.mjs` |
| round-18 registries with `wave: null` | `.ufo/waves/round-19/corrections/r18-registry-wave-null.md` — dispatch output's embedded registry carries no `wave`; the file written by `run` does |
| round-18 writer isolation (lane-only writes) | `.ufo/waves/round-19/isolation/ledger.json` — each wave-1 writer's clone, branch, base = B, commit, changed paths; lane status before/after equal |
```

## 5. Admission checklist for the L1 (single integration pass)

1. Land `knowledge/webmcp-declarative-validation-round-19.md` first (its own S### rows, if the SOURCES
   edit is also L1's, go in the same wave).
2. Append Draft A, then Draft B, then Draft C to the end of `corpus/README.md` (append-only; no edit above `:399`).
3. Run the `:349` diff → no output. Run the coverage count by command, not by sentence.
4. Do not change the historical frontier text at `:22-55`; `superseded`/`held` status only in the new table.
5. Do not assert a count of notes or receipt cases in prose; quote the command output instead.

## 6. Limits

- Nothing above is observed runtime evidence. Draft A and Draft B make no claim until the round-19 receipt exists;
  the words "runtime-held" in Draft B are conditional on the receipt gate.
- No live browser run, no receipt read, no source fetch was made by this seat (the scribe does not run checks).
- Draft C pointers reference files the L1 has not yet landed; they are not verified here.

## Isolation

No production file was produced. This seat wrote only this report under the lane
(`.ufo/waves/round-19/w1/ScribeReadme.md`). No clone was created, no commit made, no git write issued in the lane.
Clone path: none. Branch: none. Base: 66251bfc1aef393e4aec599e950a8deb867736bb. Commit: none.
Changed paths: `.ufo/waves/round-19/w1/ScribeReadme.md` only.

## Tooling

No tool installed or updated by this seat. Reads and greps used the existing lane tools only.
