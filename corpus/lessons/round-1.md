# Round 1 lessons — tabi-shokunin (2026-10-14)

Probation wave 1 (the lane was minted the same day, `MINT.md`): three field
lanes — TABI-1 plugin anatomy, TABI-2 browser census, TABI-3 CDP discipline —
plus a scribe lane. Axis move: coverage + calibration (`SCORECARD.md:66-68`).
Evidence: commit `7961735`, `LOG.md:5-28`, `SCORECARD.md:18-24`.

## What landed

- 3 admitted notes, 539 lines (`wc -l corpus/knowledge/*.md`, `LOG.md:9`;
  numbered lines 224/198/120 — `git show --numstat 7961735`):
  `webbridge-plugin-anatomy.md` (substrate contract; daemon endpoint not
  called), `browser-surface-census.md` (profile trees shape-only),
  `cdp-evidence-patterns.md` (re-runnable loopback CDP recipe).
- SKILL.md +114/−2 (`SCORECARD.md:68`): interaction-evidence decision table,
  record envelope, session-material shape-only and rights/rate rules — every
  rule cited (`grep -c 'corpus/knowledge/' SKILL.md` → 24, `LOG.md:12`).
- Coverage map 0 → 3 rows; axes pinned with counting commands; 17 unknowns
  enumerated, 3 rejections/incidents kept (`SCORECARD.md:68`).

## Method lessons

- Read-only substrate inspection with the endpoint deliberately uncalled
  (`webbridge-plugin-anatomy.md:4-6`) — the pattern every later round reused.
- A config directory is not an installation: the chrome-family "installs"
  are `NativeMessagingHosts/` shells (`browser-surface-census.md` §1.2) —
  the rejection kept as the round's calibration asset.
- Cleanup must be verified: the `pkill -f` self-match killed the invoking
  shell before its verification steps; kill by PID — an unverified kill is
  an unknown, not a cleanup (`cdp-evidence-patterns.md:105`).

## Gate

- Candidates: the three wave-1 survey notes, each measured on the real
  surface and proposed with its own pins; the SKILL distillation rode the
  same pass.
- Admitted: all three, each with a coverage row (the map was empty before —
  `git ls-tree -r --name-only ff81c0f -- corpus/` → QUALITY.md + README.md
  only, `SCORECARD.md:68`).
- Rejected, with reasons and kept: (1) "Brave/Chrome/Vivaldi are installed
  because their config dirs exist" — no binary, no package, NMH shell only
  (`browser-surface-census.md:40-43`); (2) the python websocket client as a
  CDP path — `ModuleNotFoundError` for both modules
  (`cdp-evidence-patterns.md:17`); (3) incident: the `pkill -f` self-match
  kept as calibration (`cdp-evidence-patterns.md:105`).
- Spot-check (non-author — the scribe lane): agrees with the gate on one
  admit (manifest↔skill version `1.11.3`; `grep -n '"version"'
  kimi.plugin.json` → :4) and one reject (Brave →
  `NativeMessagingHosts` only) (`SCORECARD.md:24`); anchor spot-checks
  anatomy §8.1-8.4, cdp :36/:105/:84-85, census :54 all held
  (`LOG.md:16-21`).
- Re-run (this lesson, 2026-10-14): `git show 7961735:<path> | sha256sum`
  first-12 → `49f0735b0594` / `9e4d69dcd658` / `034b1e53b004` — all match.
  Current-file shas differ by design: the notes have received append-only
  errata every later round; the round-1 pins are as-of `7961735`.
- Falsifier: an anchor that does not re-resolve; an admission without a
  coverage row.
- Carried debt out of this round: `corpus/lessons/` empty (this file lands in
  the round-5 freshness pass); `/tmp/tabi3-cdp/` unarchived
  (`cdp-evidence-patterns.md:92`).

## Fleet round-1 continuation — 2026-10-15

This is the explicitly steered fleet round-1, not a rewrite or extension of the
historical training round-1 above. Baseline:
`c24eaea14dfc0c4a3848742d31673db5675f9183` (training round 11).
`SCORECARD.md:91-100` makes freshness **3** the unique minimum; coverage **5**
and calibration **6** remain the lane's initial assignment, not a reason to skip
the lower measured axis (`../MISSION.md:38-46`).

Trigger: the carried later-date pin pass (`plans/round-11.plan.md:422-459`)
was time-blocked at training closeout; its threshold is now past. The baseline
has **0** rows at this round's witness path:
`git grep -h '^MATCH[[:space:]]' c24eaea14dfc0c4a3848742d31673db5675f9183 -- corpus/evidence/fleet-round-1-freshness/pins.tsv | wc -l`.
This does not erase the historical same-day checks.

Actual browser smoke (`corpus/evidence/fleet-round-1-freshness/browser-current.json`):
served the committed `tabi-r2-1-capture/site/page.html` on loopback port 19462,
opened an owned managed Chromium tab, waited for hydration, clicked `#btn`
twice with a wait for each delayed confirmation. Observed count **0 → 1 → 2**,
two items and two confirmations. Screenshots are
`browser-current-before.png` and `browser-current-after.png` in that evidence
directory. Closed the tab and owned server; `socket.connect_ex` returned **111**.
This is semantic replay, not historical pixel equality, real-site evidence,
extension attachment, or a global no-egress proof.

## Gate — fleet round-1

- Candidate: the carried later-date re-derivation over the baseline's 23 notes,
  seven reports, three resolved public plugin files and pre-append SKILL.
- Admitted, bounded: 34 independently anchored matching pin witnesses, with
  exact target-set equality, 34 unique identities, 31 lane full-baseline
  matches and no unexplained mismatches (`integration-current.json` and
  `planner-current.json` in `evidence/fleet-round-1-freshness/`). This is
  freshness evidence, not 34 newly covered surfaces. The date gate additionally
  requires the actual witness commit instant recorded in `SCORECARD.md` at repo root.
- Rejected: blindly treating the receipt's old `c6f4445ebd03`/203 pin as current;
  it names a declared historical prefix. Current `79255f1e03b8`/424 already has
  an independent persisted source (`LOG.md:140`, `SCORECARD.md:16-17`).
  The critic's actual receipt-prefix and timezone falsification observations
  are retained in `critic-current.json`; hypothetical duplicate/omission cases
  there are not represented as executed mutations.
- Rejected: deriving extension attachment, daemon health, real-site rights or
  global browser capability from public-file hashes or local fixture replay.
  A new review directory is not a new domain-coverage archive.
- Same-lane advisory checks: planner target derivation, executor measurements,
  reviewer correctness review and critic falsifiers. The observed dispatch is
  the single nine-role `Round1*` batch in `baseline-current.json`; inherited
  `Freshness*` dispatch metadata is a different prior attempt and not counted
  as this session's dispatch. No route configuration or model pin was changed.
- Outside spot-check: **not performed**. Dispatched L2s remain this lane under
  `LEARNING.md:37-43`; no new SHONEN `[x]`, promotion or improved discernment
  claim follows. Historical checklist statements are retained, not recertified.
- Local numeric rubric: freshness 3→4 only for this complete dated committed
  witness. Canonical per-axis assessment: freshness improved; depth, coverage,
  operability, calibration and adjacency unchanged. Trends: expansion unchanged
  (no new knowledge note), quality improved (later-date pin evidence),
  discernment unchanged (no outside admit/reject check). This is L1's bounded
  assessment, not a native judge or integrator decision.
- Falsifiers: a duplicate/missing/extra target, unexplained pin mismatch,
  circular expected value, wrong SKILL revision, or witness commit epoch below
  1792022400 defeats the closing claim. Existing real-site, handshake and
  archive-completeness ceilings remain.

## Gate — interactive fleet round-1 reconciliation (2026-10-15)

Named correction to the fleet continuation above, not to the historical
training round-1 record: its measurements and nine-seat `Round1*` dispatch
were inherited uncommitted. Neither is this interactive session's launch.
The numeric rubric at :114 is not enacted as a complete round or score bump.

- Candidate retained: the fixed later-date 34-target witness. Re-measured
  exact-set equality, independent immutable-source prefixes, full lane blobs,
  newline counts and unchanged pre-append SKILL bytes via
  `node scripts/check-freshness.mjs --worktree` → clean, exit 0.
- Local admission only: bounded pin-integrity evidence. Witness mode must
  additionally grade the real carrying commit instant; that hash and output
  are recorded in SCORECARD after creation. No new corpus/domain entry.
- Rejected: counting the stopped nine-seat advisory batch or a rendered
  32-scope payload as an authorized dispatched/completed round. Canonical
  plan/render exits 0, 32 distinct tasks, **zero current task calls**.
- Rejected: silently replacing the required `@m_grok` audit route or
  `@m_antigravity` / `@m_zfl` connector chain with actual `@m_mid` /
  `@m_fast` taxonomy bindings. Named aliases alone are not seat bindings.
  `.ufo/rounds/fleet-round-1-interactive-20261015/routing.json` at repo root
  records the exact missing prerequisite; no host/source remediation.
- Isolated self-invocation actually exercised eight same-CLI cases, including
  duplicate/missing targets, changed source bytes, stale prefix authority,
  early commit instant and unavailable revision. `--self-test` exits 0.
- Actual interactive smoke: local committed fixture, owned port 19472,
  hydration → two settled clicks → count 2, two delayed confirmations;
  own tab/server closed, connect result 111. Screenshots and command capture
  are under the interactive evidence directory, not the inherited one.
- Outside spot-check: not performed. Same-lane advisory output cannot
  establish improved discernment or SHONEN promotion. Historical `[x]`
  statements are preserved, not recertified.
- Verdicts: freshness improved locally; other axes unchanged. Expansion
  unchanged, quality improved for bounded pin evidence, discernment
  unchanged. **Round blocked**, zero verified-round increment. No native
  judgment, receipt, Sighting completion or saturation inferred.

Motivation/evidence: `LOG.md` interactive fleet-round-1 reconciliation entry;
plan `.ufo/plans/fleet-round-1-interactive-20261015.md` at repo root. A fresh
authorized session resumes this one actual round only after bindings exist.

Safety correction within this same blocked attempt: the initial helper's
mutable public-path list was unsafe; its `716dc8a` revision is not the shipping
gate. Fixed exact public identities, descriptor/table paths and no-symlink
reads now have **12/12** same-CLI cases, including path-injection and symlink
refusals. No real host secret was used as a probe. Corrected captures are
`gate-selftest-safe.json` / `gate-worktree-safe.json` in the interactive
evidence directory. This is a correction to the gate, not another round.