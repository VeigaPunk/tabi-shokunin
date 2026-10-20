VERDICT: PASS

# Recon — round-16 report and lesson structure, for reuse in round 17

Read-only. Sources: `/home/vgpnk/Projects/shokunin/.ufo/reports/round-16/tabi.md` (152 lines),
`/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/lessons/round-16.md` (116 lines),
`corpus/lessons/round-16-verifier-spotcheck.md` (159 lines), `templates/round-prompt.md`,
`.ufo/prompts/tabi-round-17.md`. No writes outside this file; no git/jj write; no browser; no tool installs.

## 0. Contract above the lane docs (the bound r17 must meet)

- `templates/round-prompt.md:100-118`: six required sections **in order** — Work performed,
  Landed changes, Before → after measurements, Sources & frontier, Trend verdicts, SHONEN.
  Marker rule `:121-124`: missing sections other than the last two = conformance defect; no evidence
  pointers = failed round.
- `.ufo/prompts/tabi-round-17.md:297-298` adds: canonical Trend verdicts, a `Stale-lane` line
  (respawn-per-round; no other mission open), and any tool installs.
- r16 implemented the addendum extras as `## Round mechanics and extras` after SHONEN
  (`tabi.md:120-152`); that heading is lane-local, not a template requirement.
- r16 report passed step-1: `spotcheck:36` ("work performed, evidence pointers, a LOG-linked commit
  table, Sources & frontier, Trend verdicts and SHONEN, so it is not a marker").
- Delta vs r15: r15 had the six sections only, no mechanics heading (`round-15/tabi.md` headings:
  `:3,20,37,48,77,83`). Reuse the r16 shape; the extra section is now established.

## 1. Round-16 report skeleton — copy this order

| Lines | Element | Exact convention |
|---|---|---|
| `tabi.md:1` | H1 | `# tabi — round 16 report (hyaku phase 2, attempt 1)` |
| `:3-5` | Preamble | Lane HEAD `<40-hex>` (pushed, `origin/master`, ahead 0, clean). Baseline `<40>`. Measured revision `<40>`. |
| `:7` | H2 | `## Work performed`; `:9` `Declared claims (2):`, `:17` `Work items:` |
| `:10-15` | Claim bullets | **C1 — operability 8 (lowest non-retired tie with depth/freshness/adjacency):** <contract> 0→1. / **C2 — coverage 9 + capability acquisition `webmcp-cdp-observation`, sourced:** <entry> 0→1 on <build> (bounded). |
| `:18-43` | Work items | One bullet per item, each ending in a path, commit or receipt; no bullet without a pointer. Includes a lesson bullet (`:39-40`) and a frontier bullet (`:41-43`) |
| `:45` | H2 | `## Landed changes`; table `:47-48` `\| Commit \| Change \| LOG.md entry \|`; `:55` closing attribution sentence (author identity, pathspec-limited adds, pushed before report) |
| `:57` | H2 | `## Before → after measurements` (arrow glyph); table `:59-60` header: Claim | Counting command (lane root) | Before @ `<rev>` | After @ `<rev>` |
| `:64-79` | Measurement notes | Bullets: counter blob sha256 `:64`; delivered-rev binding with exact argv + `MEASUREMENT_BINDING verdict=clean claims=2 bound=2` `:66-69`; `- History, not this measurement:` `:70`; `- No-harm checks at the delivered HEAD:` with nested items incl. pre-existing red called out `:73-78`; `- No scalar moves.` `:79` |
| `:81` | H2 | `## Sources & frontier`; bullets `:83-98`: `Rows 29→40. Counting command:` + absolute census command `:84`; `Added by tier:` `:87`; `Touched old→new:` nested `:88-93`; `Frontier advanced:` `:94-96`; `Mistake mined:` + `Sourced claim:` `:97-98` |
| `:100` | H2 | `## Trend verdicts`; three bullets `:102-111`, bold `expansion: improved.`, `quality: improved.`, `discernment: improved (author-side).`, each with evidence and an explicit external limit (`:111`) |
| `:113` | H2 | `## SHONEN`; one `- [~] <criterion> — <pointer> (no non-author verifier)` per box `:115-118`; no `[x]` |
| `:120` | H2 | `## Round mechanics and extras`; nested bullet order: `**Waves:**` (`:122-132`), `**Misroot sweep:**` (`:133`), `**Contested scope (adjacency):**` (`:136`), `**Inherited state:**` (`:138`), `**Carried debt:**` (`:140`), `**Disclosed limits:**` (`:142`), `**L0 questions:**` (`:147`), `**Stale-lane:**` (`:149`), `**Tools installed/updated:**` (`:151`) |

## 2. Seat tallies — exact wording and the checkable source

- `tabi.md:122-132` format:
  **Wave 1: 84 seats.** Scout 21, executor 19, reviewer 14, scribe 10, connector 8, critic 5, revenger 4, sentinel 2, simplifier 1. It was refused 4× by the 100-job cap and spawned on attempt 5 (`.ufo/waves/round-16/w1/dispatch-attempts.json`).
  then `**Wave 1 dead seats:** …` (names, cause, disposition), `**Wave 2: 73 seats.** Reviewer 42, …`,
  `**Round total:** 157 seats.` plus the seat-ID suffix note (`:131-132`).
- Role counts are **verifiable** from committed dispatch records, contrary to the spot-check's
  "author-reported" remark (`spotcheck:157`). Command and output:
  `jq -r '.details.progress | length' w1/dispatch-result.json` → `84`;
  `jq -r '.details.progress | group_by(.agent)[] | "\(.[0].agent) \(length)"' …` →
  `scout 21 / executor 19 / reviewer 14 / scribe 10 / connector 8 / critic 5 / revenger 4 / sentinel 2 / simplifier 1`;
  w2 → `73` and `reviewer 42 / scout 14 / critic 7 / mutation-tester 4 / sentinel 3 / connector 2 / revenger 1`.
  Exactly equal to `tabi.md:123-130`. Refusal sequence also matches: `dispatch-attempts.json` w1
  attempts 1-4 `refused:84`, attempt 5 `refused:0, spawned:true`.
- **r17 convention:** cite the jq command + one artifact path in the Waves bullet; do not rely on
  author count. r17 archive already holds `w1/dispatch-result.json` (`.ufo/waves/round-17/w1/`).

## 3. Wording conventions observed (apply verbatim in r17)

- Counts as `0→1`; arrows `→`/`—`; every path, command, hash, env var and identifier in backticks.
- Hashes: 7 hex in table cells, 40 hex in the preamble; every hex is either a commit reachable from
  the lane branch or is labelled in situ as a counter digest / upstream revision (`spotcheck:40`).
- Claims state axis + scalar + why this axis; report says `No scalar moves.` (`:79`) even when a
  capability enters. Lesson adds `No exploratory claim` (`round-16.md:8`).
- Negative history is kept and labelled, never removed: `History, not this measurement:` (`:70`),
  `pre-existing, unchanged` (`:75`), `Disclosed limits:` (`:142-146`).
- Trend verdicts never report scalars; `discernment` carries `(author-side)` when outside
  admit/reject agreement is absent (`:108-111`).
- SHONEN boxes stay `[~]` with a resolvable pointer and `(no non-author verifier)`; `[x]` needs a
  named non-author verifier (`templates/round-prompt.md:117-118`; `spotcheck:41,159`).
- Stale-lane exact shape (`:149-150`): `**Stale-lane:** respawn-per-round driver. This tabi
  round-16 mission was launched <ISO-8601> and is progressing (<N> lane commits). No other tabi
  mission is open.` r17 must additionally say no round-18 mission was started.
- Tools exact shape (`:151-152`): `**Tools installed/updated:** none by L1. Seat <id> installed
  <tool> <version> via <channel>; … No pacman transaction.` Under the r17 pacman pause, keep the
  last sentence and name tool/version/channel/reason (`.ufo/prompts/tabi-round-17.md:299-310`).

## 4. Round-16 lesson skeleton — copy this order

| Lines | Element | Exact convention |
|---|---|---|
| `round-16.md:1` | H1 | `# Round 16 — <theme phrase>`. The H1 theme is repeated in the report's first claim line |
| `:3-10` | Intro, no heading | Steered round 16, attempt 1, 2026-10-20 (hyaku phase 2). Baseline `<40>`, clean lane. Measured revision `<40>`. C1 <axis> <scalar> (<tie rationale>): <contract> 0→1. C2 <axis> <scalar> + capability `<cap>`, sourced: <entry> 0→1. No exploratory claim; no scalar moves. Round 16 is position 3 of the stagnation window since the round-13 capability; … |
| `:12-14` | `## Gate` | Opening sentence `Author-side admission criteria (not a claim that an unrun check passed):` |
| `:16-22` | admit C1 | - admit C1 only if `node .ufo/waves/round-16/measure.mjs REV --claim C1` counts 1 at the measured revision and 0 at baseline, where 1 requires … and only if `--check … --at <delivered HEAD> --reproduce` exits 0 with both claims bound. |
| `:23-27` | admit C2 | `- admit C2 only if the receipt at the measured revision is the committed harness's output (producer digest), … and the README map row exists.` |
| `:28-33` | rejected | - rejected: … listing every scope refusal with reason/pointer; closes `SHONEN stays four [~]`. |
| `:35` | H3 | `### Rows opened this round (access date 2026-10-20; quotes ≤25 words)`; table `:37` `\| Row \| URL \| Located quote \| Location / identity \|`; `:52-55` provenance paragraph naming per-seat dirs and the draft-key mismatch caveat |
| `:57` | H3 | `### Registry transitions (old→new, in-place cells only)`; bullets `S###: status queued→mined; used-by —→<path>; …` `:59-71`, including a withdrawn rejection `:70-71` |
| `:73` | H3 | `### Census`; start/end with the absolute census command, exit status, `rows/A·B·C/mined·queued·rejected` tuple, `Added by tier:`, knowledge-note delta (`:75-79`) |
| `:81-83` | `## Mistakes` | Table header exactly `\| Class \| Evidence pointer \| Captured-by \| Fix / shown able to fail \|` (r15 used `Fix / falsification evidence`); 10 rows `:85-94`; `:96-102` operational-record paragraph marked "not a lane-content mistake" for dead seats + misroot |
| `:104` | H2 | `## Routed defect disposition (round-15 outside spot-check :118-124)`; numbered, one line per defect with closed/carried status `:106-111` |
| `:113` | H2 | `## Adjacency`; one paragraph naming the sibling row, its path:line, and disposition (contested/open, not absorbed) |

- Delta vs r15 lesson: r15 had `## Execution evidence` (`round-15.md:57`) and no `## Adjacency`;
  r16 dropped Execution evidence and folded run facts into the After cells / `## Mistakes`.
  r17 should keep Gate / Rows / Registry / Census / Mistakes / Routed / Adjacency; add an execution
  block only for facts not carried by a receipt or counter stdout.

## 5. What the spot-check criticized (and the r17 rule it implies)

| Spot-check | Criticism | Lane lines it targets | r17 rule |
|---|---|---|---|
| `:76` | the word "unforgeable" overstates what finite liar probes show | *attributed to "the author summary"* — the word occurs **nowhere** in committed `tabi.md`, `round-16.md`, or `.ufo/waves/round-16/**`; `grep -rn unforgeable` returns only this spot-check line and `round-17/PLAN.md:169` (report has one commit, `5830720`) | avoid absolute security adjectives; say "the three tested liar shapes"; state what the probe does not cover |
| `:148` (routed 1) | liar-probe evidence unrooted: points at tmpfs clone `/tmp/tabi-r16-c1liar-93NO`; liar commits not in lane | `tabi.md:30-31`; `round-16.md:88` | every pointer must resolve from a fresh session; commit blobs or generator+digests (r17 owner RoutedLiar) |
| `:149` (routed 2) | committed `binding/selftest.json` is the 43-case pre-hardening gate `5150611c…`, while report/lesson claim 59 cases | `tabi.md:61` ("selftest 59/59 clean", "3 legacy variations exact"); `round-16.md:18` ("59 cases") | cite receipt path + gate blob digest; label stale receipts `history`; verified locally: `jq -r '.run.stdout' binding/selftest.json \| grep verdict=` → `MEASUREMENT_BINDING_SELFTEST verdict=clean cases=43 reasons=13`, `.gateSha256` = `5150611c…` |
| `:150` (routed 3) | report says `--check --reproduce` was run "again at `1205d26`" with no committed receipt | `tabi.md:66-69` | commit a delivered-tip receipt or write "holds by drift diff" |
| `:151` (routed 4) | census U3 has no in-file pointer to the README `:295-317` supersession | `tabi.md:94-96` frontier bullet; `browser-surface-census.md:188` | r17 README append index row (PLAN routed 4) |
| `:152` (routed 5) | integrator ruling not yet recorded lane-side | `tabi.md:136-137`; `round-16.md:113-116` | C3 adjacency row + PROVINCE append citing `spotcheck:138-142` |
| `:157` | seat tallies "author-reported and not re-counted" | `tabi.md:123-131` | cite the jq/dispatch-result command (section 2 above) |
| `:159` | SHONEN boxes are not all non-author-checkable from the review | `tabi.md:115-118` | keep `[~]`; state plainly what the closure could not verify |
| `:154-156` | carried debt + disclosed limits remain | `tabi.md:140-146` | repeat unchanged; add round-17 routed debt |

- No structural complaint was made: every required section was present and the report was not a
  marker (`spotcheck:36`). All criticisms are evidence-rooting or wording, not missing headings.
- Step-1 checks the report must keep passing (`spotcheck:37-44`, commands `:25-31`): lane tip
  pushed `ahead=0`; clean worktree; round-commit ordering and author identity; every cited hex is a
  branch-reachable commit or labelled; SHONEN four `[~]` and `SHONEN.md` byte-unchanged; evidence
  timestamps ≤ the commit that ships each file; prompt fidelity.

## 6. Round-17 deltas to fold into the two documents

- Preamble: branch tip from `/home/vgpnk/Projects/shokunin/scripts/hyaku/jj-lane.sh state …`
  (`local=`, `ahead=`), never bare `HEAD` (`.ufo/prompts/tabi-round-17.md:279-281`); cite only the
  helper's final `landed <hash>` (`,266-268`); report lands last.
- Third claim: Before→after table gains
  `| C3 | node .ufo/waves/round-17/measure-c3.mjs REV | … 0 | … N |`; Sources & frontier will
  need the new `corpus/adjacency.tsv` rows and the ruling reference, not just SOURCES rows.
- Census start is already fixed in `PLAN.md:7`: rows 40, A31/B4/C5, mined33/queued2/rejected5.
- Lesson `## Routed defect disposition` header must cite
  `round-16-verifier-spotcheck.md:146-157` and `:76`, and `## Adjacency` must carry the CDP ruling
  (`spotcheck:138-142`) as a `ruled` row, not "contested".
- Instrumented truth for r17, as of this read: `.ufo/waves/round-17/w1/dispatch-result.json`
  exists but `.details.progress | length` → `0` (dispatch still running), so the tally command in
  section 2 must be rerun at report time. `.ufo/waves/round-17/harm-baseline.json` is absent at
  read time; it is the planned `HarmBaseline` artifact (`PLAN.md:181`), the r16
  equivalent of `tabi.md:73-78`.

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-17/w1/ReconReportR16.md
