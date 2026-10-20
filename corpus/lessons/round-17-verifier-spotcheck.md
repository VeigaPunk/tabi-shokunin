author: hyaku closure (non-author integrator, @m_opus)

# tabi round 17 — lane-tip anchored gates, WebMCP invocation over CDP, checked adjacency map

## Decision and authority

**CLOSURE tabi r17 status=ok admitted=true.** C1 operability (`c1_anchor_safe` 0→4), C2 coverage +
capability `webmcp-cdp-invocation` (`c2_invocation_held` 0→1) and C3 adjacency
(`c3_adjacency_verified` 0→10) verify in their declared, bounded senses. No axis is harmed.
Baseline B `5859243183c4d7ac5429dfdb8a73ce0d9a43d583`; measured M
`93bfead1f5f25f584353df3152a60209bbd89a2e`; records R `f97e7f7fcd391d62d841c29e92949fcb6402296b`;
delivered tip T `1b0bc7bbfec0305e0332a5e3b382d78f22248551`. No claim is exploratory. The hyaku
orchestrator dispatched this closure, not the lane; this closure did not author round 17.

Re-measured over committed bytes with `git show`/`grep`/`diff`/`cat-file`, `jq`, `sha256sum`,
`awk`, `wc` (by this closure and four read-only reviewer seats it dispatched: C1Recheck,
C2Recheck, C3Recheck, NoHarmRecheck). Gate, self-test, counter and harness outcomes are
**evidence-verified** (PROTOCOL §Gate standard, Closure consequence), not re-executed: no lane
script was run (`measure-c{1,2,3}.mjs`, `check-*.mjs`, their self-tests, `webmcp-invoke-round17.mjs`).
This closure ran the fleet census validator and `curl` re-opens of public sources into `/tmp`
scratch.

Driver digest (`.ufo/watchdog.log`, mutable; copied here):
- `2026-10-20T12:32:05-03:00 launch tabi round=17 pgid=2167868 driver=hyaku-inline attempt=1`
- `2026-10-20T15:25:06-03:00 complete tabi round=17; hyaku-inline attempt=1`

## Step-1 conformance

| Check | Command | Observed | Result |
|---|---|---|---|
| Report landed by lane | `git log --format='%an %H' -- .ufo/reports/round-17/tabi.md` | `tabi-shokunin af41737b8faafab6d392c898dacc88f3be0ebcd1` | pass |
| Prompt committed by lane | same for `.ufo/prompts/tabi-round-17.md` | `tabi-shokunin bf295ba0…` | pass |
| Report lands last | `git log -1 --format=%cI af41737` vs lane `1b0bc7b` | 14:51:56 vs 14:51:46 (-03) | pass |
| `SHONEN` heading, one line per box | report `:100-105` | 4 lines, all `[~]` + pointer; SHONEN.md has 4 boxes | pass |
| Cited hashes exist + ancestry | `git cat-file -t` + `merge-base --is-ancestor <h> refs/heads/master` for B, 6c97851, 93bfead, f97e7f7, 1b0bc7b | all `commit`, all ancestors | pass |
| Lane commits authored by lane | `git log --format='%an' 5859243..1b0bc7b` | 4 × `tabi-shokunin` | pass |
| Pushed, nothing uncommitted | `jj-lane.sh state …` ; `git status --porcelain \| wc -l` | `local=remote=1b0bc7b… ahead=0 behind=0 tracked=0 untracked=0`; `0` | pass |
| Remote tip | `git ls-remote origin refs/heads/master` | `1b0bc7bbfec0…` | pass |
| Fleet L0 commits | `git log -1 ebeb396`, `b6b3b5e` | both `tabi-shokunin`, `.ufo/l0-questions.md:62`, `:65` | pass |
| Prompt carries template contract | `.ufo/prompts/tabi-round-17.md` | §1 axes/claims (`:15` lowest axis), §2b frontier, §3 L2 floor, §4 report path/SHONEN/sections (`:101-119`), §5 commit-then-push, push scope, L0 (`:131-140`), §6 hyaku addendum, write scope (`:244`), hash citation (`:266`) | pass |
| Sources & frontier, Trend verdicts sections | report `:75-98` | present | pass |

## Independent re-checks per claim

### C1 operability — `c1_anchor_safe` 0→4 (re-measured static residue; gate behaviour evidence-verified)

- `git grep -c 'laneTip(' <rev> -- scripts/check-round-contract.mjs scripts/check-user-round-contract.mjs scripts/check-measurement-binding.mjs`:
  absent at B; 3/19/2 at M and T (2/18/1 call sites). Gate files identical M→T.
- `measurements.json` `.runs["c1@…"]`: live HEAD residue 20/31/1 at B → 0/0/0 at M; 8 entries, 4
  credited (`round-contract-production`, `user-contract-production`,
  `measurement-binding-round16-manifest`, `user-contract-fixture-full-read`), 4 label-only witness
  entries not credited. Matches report `:60`.
- Committed evidence: `w1/GateRoundAnchor.md`, `GateUserAnchor.md`, `GateBindAnchor.md`
  (baseline red / after green per scenario), `binding/selftest.json` exit 0, **76 PASS 0 FAIL**
  (report: 59→76), expected exits/reasons committed in `scripts/selftest-measurement-binding.mjs`.
  `w2/JjRealAfter.md` ran at `6c97851`; `git diff --stat 6c97851 93bfead --` the three gates and
  self-test is empty, so it covers M's gate bytes.
- `check-freshness --witness HEAD` not fixed: `git diff --exit-code B T -- scripts/check-freshness.mjs` exit 0;
  `protectedPath` lists it (`scripts/check-round-contract.mjs:175`, `check-user-round-contract.mjs:84,233,353`;
  census `corpus/evidence/pstack-20261015/baseline-census.tsv:57`); SKILL rule at `SKILL.md:1921`.
- Registry rows at T: `SKILL.md:1937-1939` (+ `:1840`).
- **Verdict: agree 0→4; operability improved.**

### C2 coverage + capability `webmcp-cdp-invocation` — `c2_invocation_held` 0→1 (re-measured receipt/source facts; harness evidence-verified)

- `git cat-file -e` receipt and note: absent at B, present at M and T; `corpus/README.md:322` indexes the note at M.
- `jq` over `corpus/evidence/round-17/webmcp-invoke/receipt.json`: verdict pass, 11/11 cases, 4/4
  controls, `invoke-cancel` → `Canceled`, Chromium 154.0.8037.97, external requests 0.
- Producer digest: `git show M:scripts/webmcp-invoke-round17.mjs | sha256sum` = `git show T:…` =
  `de62820dd35e5cf7804b656ef3fe1678da8a15bdf4248c8b7fa737f878b052d7` = receipt producer.
- Receipt `generatedAt` 13:49:59-03 precedes `6c97851` (14:06:25-03) and M (14:44:26-03): no future-dated evidence.
- Note `source:` S041–S048, S054: all present in `corpus/SOURCES.md` at T, tier A, `mined`.
  Three note claims spot-checked against the receipt (success echoes nonce; schema mismatch still
  `Completed`; cancel `Canceled`): no mismatch.
- Capability row `SCORECARD.md:807` (pointer harness + receipt, first-working 17); coverage scalar 9→9 with claim at `:786`.
- **Verdict: agree 0→1; coverage improved; capability admission holds** within loopback, flags,
  fixture-owned pages (real-site, agent-side, Chromium 152, default profile stay open per the lane).

### C3 adjacency — `c3_adjacency_verified` 0→10 (re-measured map facts; checker evidence-verified)

- `git cat-file -e B:corpus/adjacency.tsv` → absent. At M and T: 10 data rows; dispositions 4
  contested-open / 1 ruled / 2 split-declared / 3 refused-route (matches report `:62`).
- Distinct `sibling` values: **6** (`kagi kaidoku kake kama kumitate revenger`), not 7 as written in
  report `:35` and `corpus/lessons/round-17.md:116` — routed defect 1 (count not used by the claim).
- The `ruled` row cites `corpus/lessons/round-16-verifier-spotcheck.md:138-142` (B), authored
  `protocol-shokunin` (integrator): tabi owns live browser/CDP observation, kaidoku keeps CDP as an
  REA provider surface. Agree, a non-tabi ruling.
- Contested-open rows resolve to fleet `.ufo/l0-questions.md:62` (kagi/kake musketeer lease, `ebeb396`)
  and `:65` (ruling reach to revenger, kama, `b6b3b5e`). Spot-opened sibling pins exist:
  `kake-shokunin@7c61c8c:PROVINCE.md:30`, `kaidoku-shokunin@9011581:PROVINCE.md:3`.
- Self-test evidence: `.ufo/waves/round-17/w1/C3Checker.md:103` `verdict=clean cases=57`; registry `SKILL.md:1940`.
  No standalone self-test receipt under `corpus/evidence/round-17/` (routed defect 3).
- `verified` means "re-derived with zero findings" (`measure-c3.mjs:697`, `w1/C3Counter.md:7-10`):
  honest for citation/status validation; it does **not** mean 9 settled boundaries — only 1 row is
  arbitrated, 4 await L0. The lane's own reject of adjacency 8→9 agrees with this reading.
- **Verdict: agree 0→10; adjacency improved** (claim count, scalar unchanged 8→8).

### Harm check

- `git diff B T -- SCORECARD.md`: +43/−0; round-17 scalars depth 8, coverage 9, operability 8,
  freshness 8, calibration 9, adjacency 8 — all equal to round 16 (`SCORECARD.md:783-790`).
- `git diff --numstat B T -- LOG.md corpus/SOURCES.md corpus/QUALITY.md corpus/README.md`: 35/0, 20/0, 38/0, 54/0 — append-only.
  S001–S040 unmodified; `corpus/knowledge` one note added, none modified/deleted;
  `--diff-filter=D` empty; `PROVINCE.md`, `SHONEN.md`, `scripts/check-freshness.mjs` byte-unchanged.
- QUALITY 26–32 each cited in `corpus/lessons/round-17.md` (lesson-backed).
- `git diff --name-only R T` → four `corpus/evidence/round-17/binding/` receipts (plus wave reports);
  `git diff --name-only M T --` every manifest counted input/counter → empty.
- `binding/check-at-tip.json`: exit 0 `claims=3 bound=3`, run at R (no counted input changed R..T).
  `binding/r16-check-at-tip.json`: exit 1 `counted_input_changed` — the round-16 manifest pins
  inputs round 17 legitimately changed; the historical valid receipt
  `routed/binding-hardened/check-at-1205d26.json` (exit 0, 2/2) is kept. Judged supersession, not harm.
- Harm-gate set: `harm-baseline.json` 20 gates at B (19×0, 1×1 `USER round_count`);
  `w2/HarmAfter.md:3,20` 20/20 exits equal — but measured at `6c97851`, not M. Between `6c97851`
  and M no gate script changed (`git diff --name-only 6c97851 93bfead` touches only counters,
  `check-adjacency.mjs`, SOURCES/README/note/adjacency and wave files); this closure's own
  `sources-census.sh validate` at T exits 0. No harm found; the missing full-set run at M is routed
  defect 2.
- **No axis harmed.**

## Discernment and source spot-check

Gate under review: `corpus/lessons/round-17.md` `## Gate`.

| Item | Gate decision | Re-opened source | Agree/disagree | Reason |
|---|---|---|---|---|
| S041 WebMCP.pdl quote | admit (A, mined) | `curl …/154.0.8037.97/…/WebMCP.pdl?format=TEXT \| base64 -d` | agree | line 68 reads `# Unique identifier for this invocation. Response is sent before tool events.` verbatim (11 words ≤25); body sha256 `26e62f29…0a37ff` equals the dossier digest; `cancelInvocation` at `:71` supports the row's teaching |
| S048 DevTools WebMCP page | admit (A, mined) | `curl https://developer.chrome.com/docs/devtools/application/webmcp` (191228 B) | agree | whitespace-normalized body contains `The result of the invocation (Completed, Canceled, In Progress, or Error.)`; `id="invoked-tools"` present; "Last updated 2026-05-12" matches; sha drift (191224→191228 B) is the noted per-response variance |
| S053→S057 Chrome Web Store inspector listing | reject (C) | `curl` listing (695893 B) | agree | meta description verbatim `Inspect, monitor, and execute WebMCP tools manually or with Gemini`; page names `Google Ireland, Ltd.` (S057's correction of S053 holds); zero `invokeTool`/`executeTool`/`invocationId` hits — adds no invocation contract beyond S041/S048 |
| Fix `check-freshness --witness HEAD` in code | reject | `git grep` `protectedPath`/census at T | agree | file is frozen by both round gates (`check-round-contract.mjs:175`, `check-user-round-contract.mjs:84`) and `baseline-census.tsv:57`; editing it would turn the gates red; SKILL `:1921` carries the invocation rule instead |
| Operability 8→9, adjacency 8→9 | reject | `SCORECARD.md:783-790`, adjacency dispositions above | agree | USER round_count still red 6/10; only 1/10 rows arbitrated |

New SOURCES row quote check: S041 (≤25-word quote verbatim, above). Census:
`/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi`
→ `tabi ok …/corpus/SOURCES.md`, exit 0. Own count at T: rows 57 (B: 40); tier A46/B4/C7; status
mined42/queued8/rejected7 — matches report `:78-79`.

## Per-axis verdicts and trends

| Axis | Verdict | Evidence |
|---|---|---|
| depth | unchanged | scalar 8→8 |
| coverage | improved | C2 0→1, capability `webmcp-cdp-invocation` |
| operability | improved | C1 0→4 |
| freshness | unchanged | scalar 8→8; `check-freshness.mjs` byte-unchanged |
| calibration | unchanged | scalar 9→9 |
| adjacency | improved | C3 0→10 |

- **expansion: improved** — new note `corpus/knowledge/webmcp-invocation-round-17.md` on map-uncovered
  ground (README frontier "tool invocation as committed evidence", index `:322`), every `source:` a
  `mined` A row opened this round; capability entered with an in-round run.
- **quality: improved** — round-16 probe superseded by a fixture-bound receipt; round-16 routed
  defects landed with receipts; wave-2 re-opens corrected S047/S049/S050/S053 by appended rows
  S054–S057; no admitted entry failed this closure's re-check.
- **discernment: improved** — this outside spot-check agrees with the gate on 2 admits and 3
  rejects; QUALITY 26–32 are lesson-backed. (The lane wrote `unchanged` for want of outside agreement; this record supplies it.)

## Routed defects (status-neutral; lane fixes next round)

1. Sibling count: report `:35` and `corpus/lessons/round-17.md:116` say "7 siblings"; `corpus/adjacency.tsv` at T has 6 distinct siblings. Append a correction.
2. `w2/HarmAfter.md:3,20` measures the 20-gate harm set at `6c97851`, not the measured `93bfead`/tip; ship a full-set comparison at the measured revision.
3. `check-adjacency.mjs` self-test (57 cases) is evidenced only by a wave report line (`w1/C3Checker.md:103`); commit a receipt under `corpus/evidence/`.
4. `corpus/SOURCES.md` S057 (the row correcting S053) still carries the falsified premise "Offered by François Beaufort (individual publisher)" in its anchor cell; append a correction row (corrections sweep every mention).
5. `w2/ReRunHarness.md:28-33,113-118` records the 7 reruns with abbreviated digests only (raw outputs were in a removed `/tmp` sandbox); keep full digests or committed rerun artifacts.

Open (not defects): L0 `.ufo/l0-questions.md:62`, `:65` (operator rulings); `check-freshness --witness HEAD` remains a code-level hazard enforced only by SKILL text.

SHONEN: all four boxes are `[~]`. Boxes 1–3 carry pointers a non-author can check (SKILL decision rows, receipt + LOG round 17, note §Recheck procedure); box 4 depends on the two open L0 rulings. Promotion is operator-owned; not acted on here.
