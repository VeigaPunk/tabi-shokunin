author: hyaku closure (non-author integrator, @m_opus)
round: 18 — lane tabi
reviewed lane tip: df51a0724772e8190445544767248d9f6fca05a7
report: .ufo/reports/round-18/tabi.md @ bd330f86b3580b31ae790a3472f5666de0a51456
dispatched prompt: .ufo/prompts/tabi-round-18.md

# Round 18 verifier spot-check (non-author)

This is the outside discernment check for tabi round 18. I did not author the round. I re-ran the
lane's counters over committed bytes at the delivered tip, re-opened a sample of its source gate
decisions, and verified its harm and census evidence. No lane-authored file was edited; the only
lane write is this file.

## Conformance (PROTOCOL step 1)

- **Report identity and landing.** `git log --format='%an %H' -1 -- .ufo/reports/round-18/tabi.md`
  → `tabi-shokunin bd330f86b3580b31ae790a3472f5666de0a51456`; the commit adds only the report
  (97 insertions). Lane tip `df51a0724772e8190445544767248d9f6fca05a7` committed
  `2026-10-20T18:12:38-03:00`, report `2026-10-20T18:14:41-03:00` → the report lands last.
- **SHONEN heading.** Present with one line per box: four `[~]` lines, each carrying a resolvable
  pointer. No `[x]`; promotion stays operator-owned.
- **Cited commits.** `git cat-file -e` and `git merge-base --is-ancestor <hash> master` for
  `530f40a9`, `c0aff236`, `01531daf`, `2ec136e7`, `df51a072` → all exist, all ancestors of
  `master`. The report cites `df51a072…` as lane HEAD and the helper state matches.
- **Lane state.** `scripts/hyaku/jj-lane.sh state …/tabi-shokunin` →
  `local=df51a072… remote=df51a072… ahead=0 behind=0`; `git status --porcelain` empty, so no
  uncommitted round work.
- **Prompt fidelity.** `.ufo/prompts/tabi-round-18.md` sections §1, §2, §2b, §3, §4, §5 carry the
  `templates/round-prompt.md` contract; the five child-lane items are present (report path and
  filename; commit-then-report ordering, "The report lands last and cites the pushed lane hash";
  the `SHONEN` heading requirement; the commit-hash citation rule; the lane write scope). The §6
  addendum quotes the session `task.agentModelOverrides` role→route table; `MISSION.md` calls its
  own role-class grouping advisory and delegates routing to the operator's global table, so the
  quoted map does not contradict the MISSION bucket, and no model alias is hardcoded in the lane.
- **Fleet root.** `git -C /home/vgpnk/Projects/shokunin status --porcelain` shows only driver
  runtime (`.ufo/watchdog.log` modified; untracked `.ufo/state/*.report-baseline`). No
  lane-authored misroot; the lane's own sweep receipt agrees.
- **Status:** `ok`. The defects below are named in notes and are status-neutral.

## Claim re-check (commands run from the lane root)

### C1 — freshness (re-measured)

- `node .ufo/waves/round-18/measure-c1.mjs df51a0724772e8190445544767248d9f6fca05a7` →
  `c1_rows_rechecked=51`, `eligible_rows=51`, `held=41`, `drift_superseded=9`, `own_work=1`,
  `rejected=0`.
- Before: `corpus/evidence/round-18/measurements.json` → `runs["C1-before"]` at baseline
  `2bff864…` → `c1_rows_rechecked=0`, `eligible_rows=51`.
- Independent receipt check (plain Python over `git show` bytes): 51 `.json` + 51 `.excerpt.txt` +
  51 `.body.gz` at the tip; gzip sha256, decompressed sha256/size and excerpt sha256 match every
  receipt (0 failures); every normalized quote occurs in its committed excerpt (51/51); one
  producer sha256 across the set. Verdict histogram is 41 held, 10 `drift` — the counter books
  `S029` (own-work source) separately as `own_work=1`, hence 9 drift-superseded + 1 own-work.
- **Verdict: improved** (recipe: fixed baseline cohort of 51, eligibility 57-minus-the-six
  superseded rows at `2bff864…`; reproduced at the delivered tip).

### C2 — operability (evidence-verified + counter reproduction)

- `corpus/evidence/round-18/webmcp-invoke/receipt.json`: `verdict=pass`, 12/12 cases, 4 controls,
  `producer.sha256=d1443344…` which equals `sha256(git show df51:scripts/webmcp-invoke-round18.mjs)`.
  Case set is the round-17 set plus `invoke-download-refused`; controls are unchanged.
- Committed measurement (`measurements.json`): after hazards `h1,h2,h3,h4,s1,f6` all `pass:true`;
  before `c2_hazards_closed=0` with the named red reasons (no SIGTERM abort receipt, SIGINT/watchdog
  TMPDIR residue, missing download case, feature-switch violations, witness wrapper absent).
- Reproduction: `node scripts/check-measurement-binding.mjs --check .ufo/waves/round-18/measurement-binding.json
  --at df51a072… --reproduce --json` → exit 0, `verdict=clean`, `claims=3`, `bound=3`,
  `findings=[]`; it re-ran all three counters at the delivered tip and their counts reproduced.
- Adversarial read (critic seat, read-only code/evidence attack): H2, H3 and S1 are genuine and
  red→green for the stated reasons; H1 is genuine but SIGTERM-scoped (SIGINT is checked only for
  cleanup, SIGHUP is never exercised, and "no surviving browser" reads 0 on both revisions); the F6
  wrapper genuinely rejects symbolic/short/off-branch input, but the counter only tries the literal
  `--rev HEAD` and checks the exit code, not the refusal reason; H4 is the weakest — the download
  case genuinely runs (acceptDownloads:false, a real `invokeTool`, one settled refusal event, pre/post
  scans), but its byte scan matches only the suggested filename, not arbitrary new files (Playwright
  writes `<uuid>` artifacts), and the invocation/response/marker fields are the harness's own report,
  so a pasted download record with real browsers would pass H4. Whole-receipt replay without a
  browser is closed. The six counts share the retained-download precondition, so one H4 regression
  zeroes all six; that retention requirement is declared in the lesson's C2 gate, not hidden.
- **Verdict: improved** for the measured 0→6 claim; the predicate gaps are routed, and none
  falsifies the reported count or the six artefacts' existence.

### C3 — calibration (re-measured)

- `node .ufo/waves/round-18/measure-c3.mjs df51a072…` → `c3_routed_closed=5`; `d1`–`d5` all
  `pass:true` (`correction_line_verified`, `20_historical_gates_verified`,
  `adjacency_selftest_verified`, `S058_supersession_verified`, `7_reruns_verified`).
- Independent: `git show 93bfead:corpus/adjacency.tsv | cut -f2 | tail -n +2 | sort -u | wc -l`
  → `6`; the 20 gate exits in `routed/harm-at-93bfead.json` equal the `.ufo/waves/round-17/harm-baseline.json`
  exits element-for-element; the adjacency receipt parses 57 cases, verdict `clean`, producer sha
  `4e2c2a64…` equals the checker blob at `93bfead`; the seven rerun files' sha256 equal the index,
  each exit 0 with 11/11 cases and 4 controls; the S058 row reads `supersedes S057 … rejected` with
  the corrected developer. Round-17 lesson and spot-check blob ids are byte-identical at B and the
  tip, so the correction did not rewrite history. **Verdict: improved.**

### No axis harmed

- `git diff 2bff864… df51a072… -- SCORECARD.md` is append-only (45 insertions, 0 deletions); all
  scalar rows stay at their prior values; `PROVINCE.md` and `SHONEN.md` are unchanged.
- `.ufo/waves/round-18/final/harm-at-checkpoint.json`: 23/23 exits equal baseline (22×0 plus the
  inherited USER `round_count` exit 1); `gitStatusBefore`/`gitStatusAfter` empty.
  `corpus/evidence/round-18/harm-at-measured.json` shows the same 23-gate equality at `c0aff236`.
- `git diff … -- corpus/SOURCES.md` → 23 insertions, 0 deletions; census
  `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` exit 0
  (10 W04 duplicate-URL warnings for named supersessions); rows 57→76, tiers A46/B4/C7→A64/B4/C8,
  status 42/8/7→60/8/8, malformed 0; knowledge entries 34→36.

| Axis | Verdict | Basis |
|---|---|---|
| freshness | improved | C1 0→51 re-derived at the delivered tip; before arm 0 at B |
| operability | improved | C2 0→6, 12/12 cases + 4 controls, reproduced by the binding check; predicate gaps routed |
| calibration | improved | C3 0→5, d1–d5 independently re-checked; round-17 routed defects closed |
| depth | unchanged | deliberately deferred; no depth claim this round |
| coverage | unchanged | 11 original scenarios retained by ID; no real-site/agent-side claim |
| adjacency | unchanged | no sibling file touched; two L0 questions remain open |
| (any axis harmed?) | none | SCORECARD append-only, scalars unchanged, 23/23 gate exits equal baseline |

## Discernment spot-check

| Item | Gate decision | Source re-opened | Verdict | Reason |
|---|---|---|---|---|
| S063 | admit | `raw.githubusercontent.com/nodejs/node/v24.21.0/doc/api/process.md` | agree | Sentence present at lines 757–759 after whitespace normalization; body sha256 equals the Gate digest; Gate quote is 20 words (≤25) |
| S065 | admit | `git-scm.com/docs/git-rev-parse` and `Documentation/git-rev-parse.adoc:505` at v2.56.0 | agree | Sentence verbatim once in the page and exactly at adoc line 505; page sha256 equals the Gate digest; quote 13 words |
| S058 | reject | Chrome Web Store listing `gbpdfapgefenggkahomfgkhfehlcenpd` | agree | Developer card reads Google Ireland, Ltd. (Gordon House, Dublin 4) and offered by François Beaufort; the record's flattened address is a tag/whitespace collapse, and live offsets are +50 (offsets shift per fetch, as the dossier says) |
| S001 | held receipt | `developer.chrome.com/blog/remote-debugging-port` | agree | Gzip sha, decompressed sha/size, excerpt sha re-derived; quote present in normalised excerpt |
| S010 | drift receipt | `developer.chrome.com/blog/webdriver-bidi-2023` | agree | Body and excerpt digests re-derived; quote present; the S069 supersession records the "first" overreach |

Newly written `SOURCES.md` rows re-opened: S063 and S065 (quotes and anchors above), plus the S058
rejection row; all are present at the tip with opened date 2026-10-20 and a resolvable `used-by`.

## Trend verdicts

- **expansion: unchanged.** Two knowledge notes entered (34→36) but both sit on already-held
  loopback/source-recheck ground; no capability row and no new frontier area. I agree with the lane.
- **quality: improved.** 51 retained-body source rechecks with re-derived digests, 12 explicit
  supersessions (S065–S076) that leave old rows historical, and no stale claim left unmarked. The
  note's first-integration tallies are explicitly superseded by its §7/§8 and the final receipt tree.
- **discernment: improved.** This outside check agrees with the gate on both sampled admits and the
  sampled reject, and the round's corrections are lesson-backed (QUALITY 33–39 cite round-18
  lessons and the round-17 spot-check).

## Routed defects (status-neutral; lane fixes next round)

1. `LOG.md:1059` says “QUALITY33–38 arise from the lesson's mistake rows”; the committed additions
   are seven criteria, 33–39 (`corpus/QUALITY.md:139-165`). Append a correction in round 19 naming
   the superseded count; do not rewrite the append-only LOG entry.
2. Wave 1 wrote through disjoint assigned files in one checkout instead of the addendum §6.2
   separate-writer-worktree contract (disclosed by the lane). Status-neutral conformance defect;
   the next multi-writer wave must bind each writer to its own worktree/clone.
3. C2 predicates need hardening next round (claim still verifies at its declared scope):
   H4's download scan matches only the suggested filename, so Playwright's `<uuid>` artifact names
   would escape it, and its invocation/marker fields are the harness's own report — a pasted
   download record with real browsers passes; tie the record to a fresh per-run value and scan
   `processTmpDir/playwright-artifacts-*` for any new file. H1 checks SIGTERM but not the SIGINT/
   SIGHUP cases its plan names; F6's counter tries only the literal `--rev HEAD` and not `@`,
   `master`, a short hash or the refusal reason. Also record the assertion-level delta: 6 of the
   15 original checks drop numeric CDP codes for message substrings (`SKILL.md:1991-1992` says why;
   `SCORECARD.md:830` and the report's “retains” sentence should say “IDs and pass status retained”).
4. Bookkeeping nit: both `w{1,2}/swarm-registry.json` carry `"wave": null`, and the w1 validation
   snapshot embeds `agentId: null`. Counts and role vectors match the report; no claim depends on it.

## Notes for the operator

- A non-author can check SHONEN boxes 1–3 from the cited evidence; box 4 still depends on the two
  open L0 rulings (`.ufo/l0-questions.md:62` the-musketeer/CDP lease, `:65` ruling reach to
  revenger/kama). Promotion remains operator-owned; no `[x]` was written.
- The lane's `## Corrections` and source-note §7 supersede, rather than rewrite, the round-17 prose
  and the first-integration receipt tallies; the files I re-opened retain those historical bytes.
- No live secret, private configuration, target mutation or host change was used in this check; the
  only network reads were the public source URLs named above.
