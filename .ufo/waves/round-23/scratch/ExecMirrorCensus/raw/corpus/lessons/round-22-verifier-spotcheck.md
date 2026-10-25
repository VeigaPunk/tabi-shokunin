author: hyaku closure (non-author integrator, @m_flash)
round: 22 — lane tabi
reviewed lane tip: be271a2d98f3e2f6ec3e179c8e17f50f80698571
report: .ufo/reports/round-22/tabi.md @ 69449ed557b844e21705e711585aea454c551f98
dispatched prompt: .ufo/prompts/tabi-round-22.md
inherited checkpoint of this landing attempt (the prompt's "before"): e3cf4e0d30bb835532ff44b118c5ad52e09eb76d
— note the round's lineage starts earlier, 5f585773 (round-21 tip) → 0f24164 → e3cf4e0, so e3cf4e0 is
not the round's first commit but the tip this attempt inherited from the earlier attempts

# Round 22 verifier spot-check (non-author)

This is the outside discernment check for tabi round 22. I did not author the round and edited no
lane-authored file; the only lane write is this file. I re-derived the declared claim over committed
bytes at the delivered tip, re-measured the round's value-neutrality claim with the pre-revision
oracle in a throwaway clone, re-opened the sampled gate decisions and their sources, and checked the
census and preservation receipts. Every seat in the round — W1, W2 (never spawned) and W2b — was
dispatched by the lane, so no seat judgment in the round counts as outside review; this file is the
round's only non-author agreement.

## Conformance (PROTOCOL step 1)

- **Report identity and landing.** `git log --format='%an %ae %H %ad %cd' -- .ufo/reports/round-22/tabi.md`
  → `tabi-shokunin tabi@shokunin.local 69449ed557b844e21705e711585aea454c551f98`, author date
  `2026-10-25 03:33:51 -0300`, committer date `2026-10-25 03:39:56 -0300`; the commit adds only
  `.ufo/reports/round-22/tabi.md` (213 lines) and the one L0 line. The lane tip `be271a2d…` was
  committed `2026-10-25 03:38:49 -0300` → the report lands last. `git diff HEAD -- .ufo/reports/round-22/tabi.md`
  is empty, so the filed bytes are the reviewed bytes.
- **SHONEN heading.** Present, one line per box: four `[~]` lines, each with a resolvable pointer
  (SKILL decision tables/errata, `multi-step-journey.md` §1–§2/§7, `executor-test-sufficiency.md` §0/§4,
  `PROVINCE.md:3-19`). No `[x]`; promotion stays operator-owned and no box was written by me.
- **Cited commits.** `git cat-file -e <h>^{commit}` and `git merge-base --is-ancestor <h> refs/heads/master`
  for `0f24164`, `e3cf4e0`, `47bfb5f`, `fbee618`, `be271a2` (and the baseline `5f58577`) → all exist,
  all ancestors of `master` (the worktree's git HEAD is detached at the tip, so ancestry was tested
  against the branch ref, never `@{u}`).
- **Lane state.** `scripts/hyaku/jj-lane.sh state …/tabi-shokunin` →
  `branch=master local=be271a2d… remote=be271a2d… ahead=0 behind=0 head=detached`; `git status --porcelain`
  empty → no uncommitted round work, nothing unpushed.
- **Prompt fidelity.** `.ufo/prompts/tabi-round-22.md` §1–§5 are byte-identical to
  `templates/round-prompt.md` with the placeholders rendered (`diff` over lines 1–140 shows only the
  `{{FLEET_ROOT}}`/`{{LANE}}`/`{{AXES}}` substitutions; 0 substantive differences). The five child-lane
  items are present: report path and filename (`:101`), commit-then-report ordering ("The report lands
  last and cites the pushed lane hash", `:328`), the `SHONEN` heading requirement (`:118`), the
  commit-hash citation rule (`:106-107`), and push/write scope (`:135`). Round-level items: MISSION/AXES
  binding (`:3`), 1–3 claims with the lowest-non-retired-axis rule (`:13-16`), the L2 floor
  (`:80-84`, ≥8 in one batched call), commit-then-push (`:131-134`), L0 side channel (`:138`). The §6
  addendum (`:141-481`) carries the run-6 rulings: wave band v1 32–64, ≤128 seats per round, every role
  routed `@m_flash` through the global role map, and the planner-seat ruling. `MISSION.md:53-66` makes
  its own role-class grouping advisory and delegates routing to the operator table, so the quoted route
  does not contradict the MISSION bucket.
- **Fleet root.** `git -C /home/vgpnk/Projects/shokunin status --porcelain` shows only driver/operator
  state (`.ufo/watchdog.log`, `.ufo/state/*.report-baseline`, `scripts/hyaku/hyaku.env`,
  `scripts/hyaku/lane-addendum.md` modified; untracked `bm.json`, `live*.html`, `s395.txt`,
  `.scratch/goal-20261025-hyaku-12h.md`, `.omp/mcp.json`). No tabi-authored misroot; the lane's own
  sweep statement agrees.
- **Status: `ok`.** The defects below are named in notes and are status-neutral; none makes the report
  a marker (it names real committed work, every section is present, and the cited hash is checkable).

## Claim re-check (commands run from the lane root, over committed bytes)

### C1 — operability (re-measured; the round's only claim)

Declared: `c1_semantically_checked_lifecycle_rows` 0→12 over the *same* twelve retained round-21
observations; population 12→12; scalar 8→8.

Counting command re-run by me at four revisions:

```sh
node .ufo/waves/round-22/measure-c1.mjs 5f585773258b33d2d514b00cd0b0775333578db6
node .ufo/waves/round-22/measure-c1.mjs 47bfb5f7ad3c87d0deb2629af6b7d7fe2076cf3e
node .ufo/waves/round-22/measure-c1.mjs fbee618b3ca313b6387192950083ef0ff47ee145
node .ufo/waves/round-22/measure-c1.mjs be271a2d98f3e2f6ec3e179c8e17f50f80698571
```

| Revision | Observed | Reported | Match |
|---|---|---|---|
| `5f58577…` (round-21 tip, before) | `value=0`, `verdict=baseline`, exit 0, findings `[]` | 0 / `baseline` / exit 0 | ✅ |
| `47bfb5f…` (post-revision checkpoint) | `value=12`, `verdict=clean`, exit 0, findings `[]`, 12 rows | 12 / `clean` | ✅ |
| `fbee618…` (docs/evidence commit) | `value=12`, `verdict=clean`, exit 0 | 12 / `clean` | ✅ |
| `be271a2…` (delivered tip) | `value=12`, `verdict=clean`, exit 0 | (report measures to `fbee618`; the tip is the same tree as to counted inputs) | ✅ |

Independent derivation, not the lane's script: `git show be271a2:corpus/evidence/round-22/semantic-expectations.json`
→ `cases=12`, ids `na-pending, na-click, na-requestsubmit, na-native-submit, na-reset, na-remove,
na-reject, na-throw, na-delayed, na-invalid-submit, auto-positive, auto-invalid`;
`git show be271a2:corpus/evidence/round-21/runtime/receipt.json` → `cases=12`. A plain `jq` join of the
pinned status against the retained `after.responses[].status` matches on 12/12 cases
(`Completed×5`, `Canceled×2`, `Error×4`, `na-pending` null/absent → the pending case). So the count is
twelve explicit semantic outcomes over twelve observations, not a counter that merely reads its own
expectations file.

**Value-neutrality of the disclosed encoding revision (re-measured, not asserted).** The revision
moved the pinned field `cases[na-native-submit].post.errors` from `[]` to `null` and re-pinned the
digest `4a693dce…`→`d00aed4c…`. Running the *post*-revision oracle at `e3cf4e0` correctly fails closed
on the moved pin (`value=0`, `verdict=failed`, exit 1, 2 findings) — that is the digest guard, not a
value change. With the pre-revision oracle (script and pin as of `e3cf4e0`) in a throwaway
`git clone --shared` checked out at `e3cf4e0`:

```sh
git clone -q --shared --no-checkout …/tabi-shokunin /tmp/tabi-e3
git -C /tmp/tabi-e3 checkout -q e3cf4e0d30bb835532ff44b118c5ad52e09eb76d
cd /tmp/tabi-e3 && node .ufo/waves/round-22/measure-c1.mjs e3cf4e0d30bb835532ff44b118c5ad52e09eb76d
# → {"value":12,"verdict":"clean","exit":0,"findings":[],"rows":12}
# that tree pins EXPECTATIONS_SHA256 = 4a693dce44b1… and sha256(expectations@e3cf4e0) = 4a693dce44b1161d…
```

So both oracle revisions report 12 on the same frozen round-21 bytes: the revision cannot have
manufactured the target. The receipt `.ufo/waves/round-22/expectation-revision.json`
(`valueNeutrality.preRevisionValue=12`, `postRevisionValue=12`) is accurate.

**Digest pins verified independently.** `sha256(git show be271a2:corpus/evidence/round-22/semantic-expectations.json)`
= `d00aed4c29b06ef49a055773d1f31fc662a85048e6c62a75ef45e30506c56914` = `EXPECTATIONS_SHA256` (`measure-c1.mjs:22`);
`sha256(git show be271a2:scripts/webmcp-lifecycle-round21.mjs)` = `bc11e4d6…748a811` = `PRODUCER_SHA256` (`:23`).

**Evidence-verified, not executed by me** (PROTOCOL §Gate standard — a lane-owned gate's committed
receipt is the evidence):

- Selftest 45/45: `.ufo/waves/round-22/checks-final.json` `runs[gate=oracle22-selftest]` → exit 0,
  stdout `{"cases":45,"passed":45,"verdict":"clean"}`; the 44→45 growth is the single added mutant
  `expectations-bytes-unpinned` (`git diff e3cf4e0 be271a2 -- .ufo/waves/round-22/selftest-c1.mjs`
  → `+5` lines), which isolates the expectations digest guard by appending one byte while keeping the
  schema valid.
- Serial cohort 35/35: `.ufo/waves/round-22/checks-final.json` → `runs=35`, `verdict=clean`,
  `[.runs[] | select(.exit != .expectedExit)] | length` = **0**, including `c1-before` 0/`baseline`,
  `c1-after` 12/`clean`, both no-harm lifecycle arms, and the retained red arm
  `historical-review-scope-red` expected 1 / got 1. One gate is documented `skipped`
  (`check-user-round-contract-production`, inherited known exit 1, not rerun).
- Preservation: `preservation.mismatches=[]`, `scopeErrors=[]`, `sourceErrors=[]`, `files=4865`,
  every mutable doc (`LOG.md`, `SCORECARD.md`, `SKILL.md`, `corpus/QUALITY.md`, `corpus/README.md`)
  a pure byte-prefix extension (`prefixes` all true) of the `5f58577…` baseline.

An incidental local invocation of `selftest-c1.mjs` (made before the evidence-only rule was applied)
returned the same 45/45; the verdict above rests on the committed receipt, not on that run.

### No axis harmed

- `git diff e3cf4e0 be271a2 -- SCORECARD.md` → 48 insertions, 0 deletions (append-only); no scalar row
  changed; all other axis rows read `unchanged`; `PROVINCE.md` and `SHONEN.md` untouched.
- `git diff e3cf4e0 be271a2 -- corpus/QUALITY.md` adds only criteria 59–60 (56–58 came with the
  earlier attempt), both citing `corpus/lessons/round-22.md` mistakes M1/M2 and the falsifier receipts.
- No admitted entry is falsified: the only new knowledge entry
  (`webmcp-lifecycle-oracle-round-22.md`) states a recheck/method claim on held ground, carries an
  errata section for the encoding change, and its `recheck:` command works
  (`measure-c1.mjs --selftest` → selftest JSON, clean).

| Axis | Verdict | Basis |
|---|---|---|
| operability | **improved** | 0→12 re-derived at `47bfb5f`, `fbee618`, `be271a2`; before-arm 0 at `5f58577`; failure-capable (45 isolated cases incl. the digest-guard mutant; cohort 35/35 with the expected red arm) |
| depth | unchanged | no new technical surface claimed; the note deepens the encoding of the same twelve observations and claims no depth credit |
| coverage | unchanged | population 12→12, SOURCES 101→101, 0 register rows adopted; no new browser run or build |
| freshness | unchanged | S101 reopened (2026-10-25) and no drift found; the acquisition's `verified-at` correctly stays 2026-10-21 |
| calibration | unchanged | the lane disclosed its own high-severity falsifier, the absence of any non-author sample, and the 129-seat overage; one arithmetic slip is routed below |
| adjacency | unchanged | no sibling file touched; the quarantine verdicts judge only tabi's slice of the campaign register and adopt nothing |
| (any axis harmed?) | **none** | append-only SCORECARD, 0 preservation mismatches, 0 scope/source errors, no falsified entry, no stale mark |

## Discernment spot-check

The round's gate this time is mostly refusal-shaped: 38 campaign-register rows hand-checked (37
`absent-refused`, 1 unverifiable, 0 adopted) plus one admitted knowledge note. I re-opened one admit,
two rejects and the unverifiable ruling, re-fetching each source myself.

| Item | Decision | Re-opened source | Agree? | Reason |
|---|---|---|---|---|
| `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md` (admit; S101 own-work) | admitted, `source: S101` | `corpus/evidence/round-21/runtime/receipt.json` (`na-reset`, `na-native-submit`), `na-reset.json`, `na-native-submit.json` | **agree** | `na-reset` records `status: Canceled` with `errorText: "Tool execution cancelled by a form reset"` (quote present verbatim in `na-reset.json`); the `na-native-submit` landing observation has no `nonce`/`submits`/`errors` keys at all, which is exactly the absence the errata says `post.errors: null` encodes. The entry is a recheck on held ground and says so. |
| S102 (`payload-absent` → refused) | reject | `https://chromium.googlesource.com/chromium/src/+/refs/heads/main/third_party/blink/public/devtools_protocol/README.md` | **agree** | Re-fetch `http=200`, 25431 bytes; registered quote `Last updated 2026-10-05 UTC` → 0 hits; control `devtools` → 4 hits in the same bytes, so the matcher works on this page. Refusal is correct. |
| S106 (`payload-absent` → refused) | reject | `https://www.rfc-editor.org/rfc/rfc9309.txt` | **agree** | Re-fetch `http=200`, 25265 bytes; registered quote `使用 WebMCP 時，請注意下列事項` → 0 hits; control `robots.txt` → 36 hits. A WebMCP sentence cited to the robots.txt RFC is exactly the mis-citation class the refusal names. |
| S171 (`unreachable` → unverifiable) | reject-as-unverifiable, not fabrication | `https://chromestatus.com/features/5117755740913664` | **agree** | Re-fetch now returns `HTTP 404`, 207 bytes (an error page). The cited source does not resolve, so `unverifiable-unreachable` is the honest class; the register row carried 0 quotes, so nothing was claimed present. |
| Register input binding | — | `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md` | **agree** | `sha256sum` = `5afe1810a6c3d62f37987b575a954f5b1197daa23005d4bb2f1d982f64bad833` = the receipt's `registerSha256`; data rows for tabi are 37 `payload-absent` plus 1 `unreachable` = 38, while the register's `## By lane` summary line reads 37 — confirming the lane's claim that the slice had to be derived from the rows. |

**Newly written `corpus/SOURCES.md` row:** none — SOURCES is 101→101 by design this round
(`git show <rev>:corpus/SOURCES.md | grep -cE '^\| S[0-9]+'` → 101 at `5f58577` and at `be271a2`).
I therefore re-opened the one row the round touched, **S101** (`git diff 5f58577 be271a2 --
corpus/SOURCES.md` → one modified row, `used-by` gains `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md`,
no immutable cell changed). Its quote cell is 14 words (≤25) and matches the retained receipt
("Finite recorded Chromium154 loopback scenarios and their retained raw CDP/page/cleanup observations,
not universal semantics").

**Census.** `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` → exit 0,
16 `W04` duplicate-URL warnings (the unchanged named set), which matches the report's before→after.

## Trend verdicts

- **expansion: unchanged** — agree with the lane. SOURCES 101→101, mined 73→73, tiers A88/B4/C9
  unchanged, knowledge 40→41 on held ground, population 12→12, 0 register rows adopted, no frontier row
  advanced. Ingesting a method recheck as new coverage would be the inflation `QUALITY.md` 56 forbids.
- **quality: improved (bounded)** — agree. The round replaced a structural positive with a
  failure-capable semantic oracle (12 explicit status/output/error/timing rows), caught and repaired a
  high-severity falsifier (a pin read backwards), bound the encoding in `expectationShape`, isolated the
  digest guard with its own mutant, and measured the repair's value neutrality at both revisions. The
  bound the lane states is the right one: retained-evidence replay only — no new browser run, real site
  or other build.
- **discernment: improved** — the lane's in-round verdict was `unchanged`, and that was honest: every
  seat, W1 included, was lane-dispatched, so no outside agreement existed when it filed. With this
  closure's spot-check on record, `LEARNING.md`'s observable is met — an outside reviewer agrees with the
  gate on an admit **and** on rejects (1 admit, 3 refusal rulings, all `agree` above) — and the round
  turned two of its own mistakes into grounded criteria (`QUALITY.md` 59–60 citing lesson M1/M2). No
  disagreement was left unlearned. Journaling the divergence: this verdict is only observable through
  closure and should not be read back as a lane-side improvement.

## Routed defects (status-neutral; lane fixes next round by appended correction)

1. **Refusal arithmetic is off by one.** Report §Work performed, `SCORECARD.md:1111` and
   `corpus/lessons/round-22.md:130` say "23 whole-payload" refusals for W2. The committed receipts are
   **13** `w2-cap-refusal-*` files (attempts 1–9 and 11–14; attempt 10 has no record) and **11**
   `w2b-cap-refusal-*` files (attempts 1–11, spawn at 12) — **24** whole-payload refusals in total, each
   refusing all 64 (W2) or 65 (W2b) seats:
   `grep -c "Background job limit reached (100)" .ufo/waves/round-22/w2-cap-refusal-*.json
   .ufo/waves/round-22/w2b-cap-refusal-*.json` → 1 per file, 13 + 11 = 24; `grep -o … | wc -l` per file
   → 64 / 65. Append a correction naming the superseded figure; do not rewrite the filed report.
2. **Wave and round caps.** W2b was validated at 65 seats with `w2b-spec.json` `maxLanes: 65`, above the
   policy's `waveMaxLanes: 64`, and the round total is 129 against the ≤128 cap. The lane disclosed
   both, which is why this is status-neutral, but the next replacement wave must stay ≤64 and the round
   total ≤128 — a degenerate wave (`0 spawned`) does not buy a larger replacement.
3. **`## Gate` has no spot-check row.** `LEARNING.md` §Files requires the round lesson's Gate section to
   carry "the spot-check result"; round 22's Gate states that no non-author sample exists and defers to
   closure. Next round must append the result (this file) or an explicit "owed to closure" line naming it.
4. **Stale-lane actuator not graded per attempt.** The report's single `Stale-lane: none` line does not
   distinguish the three dispatches. Attempt 2 (`2026-10-23T20:41:38-03:00`) has no tabi commit
   (`git log --since=2026-10-21T20:00 --until=2026-10-25T00:00` → empty), i.e. **silent** on the commit
   test, while attempt 1 was progressing (commits `0f24164`, `e3cf4e0`). Name each attempt's grade.
5. **W2b registry has no seat identities.** `w2b/swarm-registry.json` carries `agentId: null` for every
   member and the 7 dead seats are named without ids; the wave's evidence cannot be tied to the
   transcripts it cites. Also state W2b's attempt numbering once: the wave restarts at attempt 1 while
   `w2b-spawn-result.json` records `attempt: 12`. The report discloses the first half; fix both next wave.
6. **Landed-changes row cites a commit that carries no LOG entry.** Row 2 (encoding revision) cites
   `47bfb5f`, which touches no `LOG.md` (`git show --name-only --format="" 47bfb5f | grep -c '^LOG.md$'`
   → 0); its LOG entry landed in `fbee618`. Say "LOG entry lands in `fbee618`" or bind the change and
   its entry to one commit next round.

## Notes for the operator

- **Disclosure, not defect:** the encoding revision was authored after the data was observed and after
  the lane's own W2b seats had scored the pre-revision rule. It is disclosed
  (`.ufo/waves/round-22/expectation-revision.json`, note errata), keeps metric/target/blocking
  rule/population unchanged, and I independently confirmed 12 at both oracle revisions on the same
  frozen bytes. The lane filed the admissibility question at `.ufo/l0-questions.md:155`; the round did
  not block on it, and nothing here asserts the ruling.
- **Capacity:** W2's loss is the host's 100-job cap (23→24 whole-payload refusals per defect 1), not a
  lane error; W2 therefore contributed no falsification, and the round's falsification rests on W2b's
  58/65 reports — all author-side.
- **SHONEN boxes:** box 1 now has resolvable decision tables/checklists with the round-22 errata, box 2
  an executed-and-logged task, box 3 executable counters that run from committed bytes, and box 4 an
  unchanged `PROVINCE.md`. A non-author could check 1–3 from the pointers; box 4 still leans on the open
  L0 scope rulings (contested-scope rows at `l0-questions.md:62`, `:65`). Promotion is
  operator-owned; no `[x]` was written.
- **No harm used in this check:** read-only git/jq/sha256 over committed bytes, four public HTTP GETs
  (the three listed sources plus the S171 URL), and a throwaway `git clone --shared` under `/tmp` for
  the pre-revision oracle. No secret, private config, target mutation or host change.
