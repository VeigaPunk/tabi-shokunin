## 2026-10-20 — round-17 (hyaku, attempt 1)

Baseline `5859243183c4d7ac5429dfdb8a73ce0d9a43d583` (clean; `.ufo/waves/round-17/PLAN.md:3-5`).
Measured revision `6c97851034e9d8f58b135d28ff969f1f28fa2f7d` (lane `master` at the read; `git log -1 master`
→ `6c97851`, 2026-10-20 12:31:11 -0300). No later lane commit was observed at drafting; L1 re-checks the
tip at integration. Motivating evidence: round-16 outside spot-check routed defects 1-5
(`corpus/lessons/round-16-verifier-spotcheck.md:146-153`); the jj audit of this lane
(`.ufo/waves/hyaku/jj-w1/reports/JjAuditTabi.md`, cited at `PLAN.md:17-23`); the frontier row
"tool invocation as committed evidence" (`corpus/README.md:301-303` at baseline) against the round-16 note
"No tool is invoked in the receipt" (`corpus/knowledge/webmcp-chromium-loopback-round-16.md:127`).

Attempt history: the L1 (`TabiR17`) was launched at 12:32:05 -03 with `attempt=1` (fleet
`.ufo/watchdog.log`, the `launch tabi round=17` line). It exited on an Anthropic 429 (retry-after
11-14 min) and was resumed under its original identity once the operator reported the Opus route back.
Three other L1s on that route (KaidokuR18, TsukuroiR17, MadoR18) were resumed the same way
(fleet `.ufo/waves/hyaku/PHASE2.md:103-106`). The watchdog holds one launch line for round 17 and no
relaunch (`grep 'round=17' .ufo/watchdog.log`). Wave-1 and wave-2 seats below were spawned under that L1.
[PENDING: L1 to add the resume time from its own transcript; the watchdog records none.]

## Claims

- C1 operability 8 (lowest tie): lane-tip anchoring of the round gates.
  `scripts/check-round-contract.mjs` (`laneTip` at `:114`, used at `:651` and `:1193`),
  `scripts/check-user-round-contract.mjs` (`laneTip` at `:160`; witness reads route through it, `:249-558`),
  and `scripts/check-measurement-binding.mjs` + selftest (interface `PLAN.md:58-81`). Motivation: under jj,
  git HEAD names an empty or unlanded commit (JjAudit F1) and can carry snapshot-only content (F3); the gates
  now certify the `refs/heads/` tip. Counter `node .ufo/waves/round-17/measure-c1.mjs REV` (`PLAN.md:87-106`):
  `c1_anchor_safe` **0 at 5859243** (`w1/C1Counter.md:78`) → **4 at 6c97851**, of 8 entries
  (`/tmp/tabi-r17w2-DraftLog2-out/c1.out`; run in a sandbox clone at 6c97851).
  Credited behaviour entries: round-contract-production (arms a/b/b2/c = 0/0/0/1), user-contract-production
  (1/1/1/1; USER gate red as before), measurement-binding-round16-manifest (1/1/1/1), user-contract-fixture-full-read
  (0/0/0/1). Not credited (`arm_c_label_only`): round-contract-count-witness, user-contract-witness,
  user-contract-count-witness, user-contract-diagnostic-witness. Not fixed in code: `check-freshness --witness HEAD`
  (JjAudit F6), because `scripts/check-freshness.mjs` is byte-frozen (`PLAN.md:44-48`); recorded as a why-not and
  a SKILL registry rule (`--witness "$(git rev-parse --verify refs/heads/master)"`).
  Identity pair moved at this commit: `scripts/check-user-round-contract.mjs:34` archives `8a573b4e…`
  (round-14 current) and `:35` sets `ROUND_SCRIPT_CURRENT_SHA256 = 1579a794…`, which equals
  `sha256(scripts/check-round-contract.mjs)` at 6c97851 (`git show 6c97851:scripts/check-round-contract.mjs | sha256sum`).
  `PLAN.md:83-86` reserves this pair to L1; `w1/GateRoundAnchor.md:106-107` states the USER gate rejects the
  new bytes until the pair moves.

- C2 coverage 9 + capability `webmcp-cdp-invocation`: WebMCP page-tool invocation over CDP, loopback only,
  Chromium 154.0.8037.97 (`/usr/bin/chromium`, `PLAN.md:6`). Harness `scripts/webmcp-invoke-round17.mjs`
  (2127 lines; `producerSha256` `de62820dd35e…` in the receipt). Receipt
  `corpus/evidence/round-17/webmcp-invoke/receipt.json`: verdict `pass`, `summary` 11 cases / 11 passed /
  0 failed / 0 missing, `caseSetOk: true`, 3 runs, `loopback.externalRequestCount` 0 (read at 6c97851).
  Seven page fixtures under `.../webmcp-invoke/fixtures/`. The first run failed preflight and is kept as
  `preflight-smoke-failed.json` (`PLAN.md:126-127`; cause not reviewed by this draft).
  Note `corpus/knowledge/webmcp-invocation-round-17.md` (126 lines; `source:` S041 … S048).
  Counter `node .ufo/waves/round-17/measure-c2.mjs REV`: `c2_invocation_held` **0 at 5859243**
  (`w1/C2Counter.md:39`) → **1 at 6c97851**, failures `[]`, cited S041–S048, all seven negative probes held 0
  (`producer_sha_flipped`, `required_case_removed`, `cited_row_queued`, `cited_row_preexisting`,
  `control_shows_completed`, `positive_not_completed`, `control_records_nothing`).
  Capability held for this build only; real-site WebMCP, agent-side consumption and Chromium 152 stay open
  (`corpus/README.md:316-333`, section "Round 17").

- C3 adjacency 8 (lowest tie): checked sibling-overlap map `corpus/adjacency.tsv` (9 rows) + checker
  `scripts/check-adjacency.mjs` (1667 lines). Rows: kaidoku CDP (ruled, ruling `:142`), kaidoku and revenger
  forensics (refused-route), kake crawler/publishing (split-declared), the-musketeer 9222 lease kake and kagi
  (contested-open, fleet `.ufo/l0-questions.md:62`), kagi secrets (refused-route), kasegi CDP submissions
  (refused-route), kumitate kimi-webbridge internals (split-declared). Counter `measure-c3.mjs REV`:
  `c3_adjacency_verified` **0 at 5859243** (`w1/C3Counter.md:14`).
  **At 6c97851 the counter and the checker disagree; the count is not settled.** The brief's 9 is not reproduced:
  - `measure-c3.mjs 6c97851… --fleet-root /home/vgpnk/Projects/shokunin` → `c3_adjacency_verified: 8`
    (`contested-open` 2, `split-declared` 2, `refused-route` 4, `ruled` 0). Row 2 (kaidoku, `ruled`, ruling
    `tabi-shokunin@5859243…:corpus/lessons/round-16-verifier-spotcheck.md:142`) fails `ruling_venue`.
  - `check-adjacency.mjs --at 6c97851… --fleet /home/vgpnk/Projects/shokunin --json` → `verdict: clean`,
    `rows 9`, `verified 9`, `findings []`. The checker has no `ruling_venue` rule; the counter's `checkSelfVenue`
    rejects that line. The line's last-touching author is `protocol-shokunin`
    (`git log -1 --format=%an 5859243 -- corpus/lessons/round-16-verifier-spotcheck.md`), and the quoted text
    names kaidoku, so under the amended PLAN rule (`PLAN.md:205-214`) it should pass [INFERENCE: counter defect,
    not isolated].
  - **Sandbox trap, measured:** run without `--fleet-root` from a `/tmp` sandbox, the counter reports
    `fleet_root: /tmp` and `c3_adjacency_verified: 0` with every row `sibling_unresolved`. The checker has the
    same trap without `--fleet`. PLAN's count command (`PLAN.md:152-153`) does not say so.
  LOG records the counted value only after L1 resolves the row-2 disagreement.

## Routed defects (`corpus/lessons/round-16-verifier-spotcheck.md:146-157`)

1. Unrooted liar probe (`:148`) → `corpus/evidence/round-17/routed/liar/` (`generate.mjs` 306 lines,
   `originals.bundle`, `blobs/gate.mjs`, `blobs/selftest.mjs`, `receipt.json` schema
   `tabi-round17-routed-liar-v1` verdict `pass`, `run.stdout.txt`, `README.md`). Landed at 6c97851; not re-run by this draft.
2. Pre-hardening gate receipts (`:149`) → `corpus/evidence/round-17/routed/binding-hardened/` (`index.json`,
   `selftest.json`, `legacy-r15.json`). Labelled as history in the README round-17 section
   (`corpus/README.md:357-361`, "Binding receipts history label"). Landed at 6c97851.
3. Delivered-HEAD receipt (`:150`) → `routed/binding-hardened/check-at-1205d26.json`, landed at 6c97851. The
   round-17 delivered-tip receipt is **not** at 6c97851; it lands at round end (`PLAN.md:165-166`). [PENDING: L1.]
4. Census U3 pointer (`:151`, `corpus/knowledge/browser-surface-census.md:188`) → index row in
   `corpus/README.md:334-346` ("Census U3 pointer index"). The pinned note is not edited
   (`corpus/evidence/fleet-round-1-freshness/pins.tsv:7`). Landed at 6c97851.
5. Integrator ruling (`:152`) → `corpus/adjacency.tsv` row 2 (kaidoku CDP, `ruled`). The PROVINCE append is
   **not** landed: `PROVINCE.md` is census-frozen (`PLAN.md:201-203`). See C3 for the open disagreement.
- Also (`PLAN.md:169`): "unforgeable" overstated finite liar probes → QUALITY criterion. **Not at 6c97851**
  (`corpus/QUALITY.md` is absent from the 6c97851 diff). [PENDING: L1, from `drafts/quality.md`.]

## Census

`corpus/SOURCES.md`: **40 → 53 rows** (counted from the registry rows at each commit; baseline 33 mined / 2 queued /
5 rejected; 6c97851 41 mined / 6 queued / 6 rejected). New: S041–S048 mined (`corpus/SOURCES.md:55-62`), S049–S052
queued (jj/git docs, `:63-66`), S053 rejected (`:67`, Chrome Web Store listing that restates S048). Validate:
`/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` →
`tabi ok`, exit 0 (run at the fleet root). New Paths entries: `webmcp-invocation` (`:76`), `jj-colocated-anchor` (`:77`).

## Waves

- Wave 1: 86 seats, spawned at attempt 2 (attempt 1 refused all 86 at 12:43:44; `w1/dispatch-attempts.json`).
  Role mix (`w1/swarm-registry.json`, counted here): scout 22, executor 19, reviewer 12, scribe 9, connector 8,
  critic 6, revenger 4, sentinel 2, mutation-tester 2, simplifier 2. Refusal cause: the cap that refuses `task`
  calls while ≥100 background jobs run (`PHASE2.md:50-51`) [INFERENCE: the 86-seat dispatch exceeded it].
- Wave 2 (falsify): 78 seats (`w2/dispatch-result.json` "Spawned 78"; `w2/swarm-registry.json`). Role mix:
  scout 24, reviewer 23, executor 8, critic 7, scribe 5, mutation-tester 4, sentinel 3, connector 3, revenger 1.
- Dead or rate-limited seats: none recorded in the round-17 wave-1 reports (grep for `429|rate limit|died|dead`
  under `w1/` returns only unrelated text). [PENDING: L1 to fill from the wave-2 reports.] The L1's own 429 is
  recorded above, not as a seat death.

## No-harm

Measured by this draft at 6c97851 (sandbox clone): ROUND production exit 0 (arm a); USER production exit 1
(arm a), the pre-existing USER 6/10 red (`LOG.md:998`, round 16). [PENDING: L1 runs `harm-baseline.json` rows 1-9
and the freshness `--worktree` check; this draft ran neither.]

## History kept, not rewritten

- Round-16 binding receipts from the pre-hardening gate (`binding/selftest.json`, `binding/legacy-r15.json`)
  stay as history (routed defect 2).
- `corpus/evidence/round-17/webmcp-invoke/preflight-smoke-failed.json` stays (`PLAN.md:126-127`).
- Not edited: `scripts/check-freshness.mjs`, `.ufo/rounds/fleet-round-1-interactive-20261015/**`,
  `corpus/knowledge/browser-surface-census.md` and the other admitted notes, `corpus/evidence/round-16/**`.

## Author verdicts

[PENDING: L1 verdicts after the C3 row-2 question is resolved.] This draft records no scalar move: the C1 and
C2 counts are measured above and C3 is open. Expansion, quality and discernment are not scored here.

## Tools installed or updated

None by this draft. Tools used: `node` v24.21.0 (`PLAN.md:6`), `git`, `awk`, `python3` (stdlib JSON), the
round-17 counters and checkers. No `pacman`, `uv tool`, `npm -g` or `jj` run (pacman paused host-wide,
fleet `.ufo/prompts/tabi-round-17.md`). Wave-1 reports record the same (`w1/DraftLog.md:14`).
