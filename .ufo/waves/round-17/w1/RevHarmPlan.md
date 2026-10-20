VERDICT: ISSUES

Scope: round-17 planned writes vs the append-only/protected rules in `scripts/check-round-contract.mjs`,
`scripts/check-user-round-contract.mjs`, `scripts/check-freshness.mjs` (pins.tsv), `scripts/check-sources.mjs`,
`scripts/check-measurement-binding.mjs`. Baseline `5859243183c4d7ac5429dfdb8a73ce0d9a43d583` (detached HEAD;
`git symbolic-ref -q HEAD` → exit 1, refs/heads/master = same sha). Line citations are from the committed
baseline blobs; the worktree is peer-dirty (`git status`: 4 modified C1 scripts + new `scripts/check-adjacency.mjs`),
so worktree line numbers differ. Every arm below ran in a throwaway clone
(`git clone --no-hardlinks LANE /tmp/tabi-r17-RevHarmPlan-sbx`, checkouts of the baseline, sandbox removed after).

## HIGH

### H1 — `PROVINCE.md` append is impossible under the round gate's census freeze (blocks PLAN routed defect 5)
- Rule: `check-round-contract.mjs:25` puts `PROVINCE.md` in `APPEND_ONLY`, but the census loop wins:
  `:27 CENSUS_PATH`, `:30 CENSUS_SHA256`, `:248 censusEntries`, `:250-252` recorded blob must equal the blob at
  `HARD_BASELINE` (`Census baseline drifted`), `:261` HEAD blob must equal the recorded blob
  (`Census blob drifted`). Only `SHONEN.md` has an exception (`:254-260`).
  Census row: `corpus/evidence/pstack-20261015/baseline-census.tsv:24` = `c2222b16… PROVINCE.md`
  (= its blob at `7f506af` and at HEAD).
- Evidence (sandbox, append one line + commit):
  `node scripts/check-round-contract.mjs --repo $S` →
  `ROUND_CONTRACT verdict=failed finding=history_rewritten detail=Census blob drifted: PROVINCE.md`, exit 1.
- Re-issued-census workaround fails too: rewriting the census row to the appended blob and updating
  `CENSUS_SHA256` yields `Census baseline drifted: PROVINCE.md`, exit 1 (`:252`), because a recorded row can
  only ever equal the hard-baseline blob. So no data-write path can legalize a PROVINCE change.
- The user gate stays green on the same append (PROVINCE is not in `PSTACK_PATHS :73-82`; prefix check
  `:317-321` passes), so the contradiction only shows when the round gate runs.
- Disposition: do not write `PROVINCE.md` this round. Land the integrator CDP ruling in the new
  `corpus/adjacency.tsv` (unfrozen) plus the `corpus/README.md` and/or `SKILL.md` append (both tested clean).
  Changing PROVINCE later is a gate-policy change (census mechanism), not a data write — record the latent
  inconsistency (APPEND_ONLY advertises an append the census forbids) as a why-not.

### H2 — `scripts/check-round-contract.mjs` new bytes must land as exactly one blob identity in `92d700d..lane-tip`
- Rule: `check-user-round-contract.mjs:32` `ROUND_SCRIPT_CURRENT_SHA256`, `:33-37` `ROUND_SCRIPT_ARCHIVED_SHA256`,
  `:38-41` `ROUND_SCRIPT_ACCEPTED_SHA256`, `:226-248 acceptedRoundScript` (every commit in `92d700d..HEAD`
  touching the file must hash to ARCHIVED ∪ {CURRENT}; HEAD blob must be in ACCEPTED), `:284 pstackDrift`,
  `:307-334 checkHistory` → `Pstack bytes changed`.
- Evidence: one edit+commit → `history_rewritten detail=Pstack bytes changed: M scripts/check-round-contract.mjs`,
  exit 1 (expected until L1 updates the constants). Two edits A then B, simulating L1 ("old current→archived,
  new→current"): still red (A unarchived). Adding A to `ROUND_SCRIPT_ARCHIVED_SHA256`: `checkHistory` passes
  (gate then fails only the pre-existing `round_count 6/10`).
- Disposition: the executor's gate bytes must be the last/only identity in the range; any later commit that
  re-touches the gate (formatting, integration fix) requires archiving that intermediate sha. Note
  `scripts/check-user-round-contract.mjs` itself is unpinned (absent from `PSTACK_PATHS :73-82` and
  `protectedPath :144-153`), so only its constants matter to the gates.

## MEDIUM

### M1 — `corpus/lessons/round-17.md` is admitted only as a single initial addition
- Rule: `check-user-round-contract.mjs:250-259 lessonDrift` (A-only, no later M/D/R/T in `92d700d..lane-tip`),
  `:250-259` reached via `:284`, diff over `corpus/lessons` at `:317-321`, fail `:334`. The `protectedPath`
  regexes (`check-round-contract.mjs:95`, user `:145`) enumerate only baseline-existing lessons, so a *new*
  file is not frozen — but it is single-shot.
- Evidence: add-only commit → checkHistory passes (only pre-existing `round_count` fails); add then append a
  line → `Pstack bytes changed: A	corpus/lessons/round-17.md`, exit 1.

### M2 — new note `corpus/knowledge/webmcp-invocation-round-17.md`: no pin row, no edits to pinned files
- Rule: `check-freshness.mjs:12` table path, `:78` targets enumerated at baseline `c24eaea`, `:81` exact set
  equality (`target_set`), `:99` existing bytes must equal the baseline slice, `:101` `SKILL.md` must grow
  (`witness_append`), `:110` `content_drift`. `pins.tsv` is protected by `check-round-contract.mjs:96` and
  `check-user-round-contract.mjs:146` (`Protected bytes changed`).
- Evidence: pin identities = 34 (31 baseline-local notes/reports + 3 public); diff of pin targets vs
  `git ls-tree -r --name-only c24eaea -- corpus/knowledge reports SKILL.md` is empty;
  `node scripts/check-freshness.mjs --worktree` → `FRESHNESS_GATE verdict=clean … matched=34 … baseline=c24eaea`, exit 0.
  A new note is outside the baseline enumeration → no row; adding one would be an extra target → `target_set`.
- Do not edit a pinned note or the 7 pinned `reports/*.md`; new `reports/round-17*.md` are unconstrained.

### M3 — `scripts/check-freshness.mjs` is frozen four ways; keep `--witness` at `refs/heads/master`
- Rule: `protectedPath` `check-round-contract.mjs:101` / user `:151`; `PSTACK_PATHS` user `:80`; census row
  `baseline-census.tsv:57`; `CENSUS_SHA256 :30` identity check `:184` and census loop `:261`. Editing the census
  → `Census identity changed` (round) + `Pstack bytes changed: M corpus/evidence/pstack-20261015/baseline-census.tsv`
  (user), both exit 1 (tested).
- `--witness` only needs a 40-hex (`check-freshness.mjs:65,:71`), so under jj-lite detached HEAD a literal `HEAD`
  can certify an unlanded/empty commit (JjAudit F6); the SKILL registry must invoke
  `--witness "$(git rev-parse --verify refs/heads/master)"`. Never fix this in code.

### M4 — SOURCES rows S041+ must be inserted at the end of `## Registry`, not appended at EOF
- Rule: `check-sources.mjs:266 row_outside_registry`, `:307 fields_13`, `:331 mined_without_used_by`,
  `:339 used_by_uncited`. `corpus/SOURCES.md`: `## Registry` lines 11-55, `## Paths` at 56 (append-at-EOF lands
  in `## Leads (unopened)`).
- Evidence: a cloned row S041 inserted before `## Paths` → `SOURCES_GATE verdict=clean rows=41 … findings=0`, exit 0;
  the same row at EOF → `FINDING id=row_outside_registry row=S041 detail=section_leads_unopened_`, exit 1;
  baseline → `rows=40 … clean`, exit 0.
- Each `mined` row needs `used_by` pointing at an existing file that contains the id (word boundary); keep 13
  fields; dedupe URLs unless `teaches` starts with `supersedes Sxxx`. Inserting at line 55 leaves rows 1-54
  stable, so existing line citations (e.g. `corpus/lessons/round-14-verifier-spotcheck.md:145` → `SOURCES.md:43`)
  do not drift; inserting earlier would shift them.

### M5 — the gates certify committed git HEAD, not the worktree
- Rule: `check-round-contract.mjs:231` (`rev-parse HEAD`) and every read against that value (`:234-261`);
  user gate `:308,:311-334`.
- Evidence: production round gate exit 0 and production user gate exit 1 while the four C1 scripts are dirty —
  both read HEAD. So a green gate run before the round-17 appends are committed certifies baseline bytes only;
  under jj the named commit may be unlanded (C1's premise). Also note the production user gate is already RED at
  baseline (`USER_ROUND_CONTRACT verdict=failed finding=round_count detail=Found 6 user rounds, expected 10`,
  exit 1) — pre-existing, not caused by these writes, but it is one of C1's fixed entry points, so it cannot be
  counted exit-0 anchor-safe as-is.

### M6 — measurement manifests bind counters and counted inputs to both `measuredRevision` and `--at` (lane tip)
- Rule: `check-measurement-binding.mjs:143/:528 counter_changed_since_measurement`, `:145/:548 counted_input_changed`,
  `:511 measured_revision_not_ancestor`, `:24/:254/:875 --at` defaults to the lane tip, `:558-572 --reproduce`
  refuses a worktree counter whose bytes differ from the recorded blob.
- Disposition: commit `measure-c*.mjs`, `scripts/check-adjacency.mjs`, `corpus/adjacency.tsv` and any other
  declared countedInput before measuring and never touch them afterwards through lane tip; record sha256 of the
  committed blob. Keeps C1/C2/C3 counters reproducible.

## LOW
- L1 — Plan-only freezes the gates do not enforce: `corpus/evidence/round-16/**` and
  `scripts/webmcp-loopback-round16.mjs` are absent from `protectedPath` (`:94-103`), `PSTACK_PATHS` (`:73-82`)
  and `pins.tsv`; an accidental edit there is invisible to the reviewed gates (discipline only).
- L2 — `scanConsequential`/`sameTree` cover only `pstack-20261015-rNN` / `user-20261015-rNN` ids, so the new
  `corpus/lessons/round-17.md` and `corpus/evidence/round-17/**` are not scanned for the NEEDLES
  (`consequential-action: performed`, `credential-submit: yes`, `account-mutation: yes`) or non-GET `requests[]`;
  C2 receipt hygiene must be counter-enforced.
- L3 — New files trip nothing: `corpus/adjacency.tsv`, `scripts/check-adjacency.mjs`,
  `scripts/webmcp-invoke-round17.mjs`, `corpus/evidence/round-17/**`, `.ufo/waves/round-17/**` are outside all
  protected sets. Appends to `corpus/README.md`, `corpus/QUALITY.md`, `LOG.md`, `SCORECARD.md`, `SKILL.md` all
  pass (prefix `:242-246`/`:317-321`); the full planned write set (all five appends + the new note/tsv/scripts/
  lesson/evidence) produced `ROUND_CONTRACT verdict=clean rounds=10`, exit 0. Only PROVINCE fails (H1).

## Residual risk / verification gaps
- Freshness with a *simulated* SKILL append was not run (fixture mode needs host public-target files); the
  production worktree run is clean and the append math is `check-freshness.mjs:99/:101`.
- "checkHistory passes" in M1/H2 is evidenced by the gate reaching `round_count` (production user gate is
  pre-existing red), not by a green exit.
- No tools installed (no pacman/uv/npx); no browser/CDP used. Sandbox clone removed; every arm is reproducible
  from the commands cited above.
- [INFERENCE]: M3's "unlanded/empty commit" consequence is from code reading plus the detached-HEAD symref, not a
  jj trial (executors must not run `jj`).

Files written:
- `.ufo/waves/round-17/w1/RevHarmPlan.md`
