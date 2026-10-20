VERDICT: PASS

# Round 17 — gate registry + digest-pin reconnaissance (C1 input)

Read-only recon. All line numbers/digests are the **committed HEAD** blobs unless marked
worktree. Anchor: HEAD = `5859243183c4d7ac5429dfdb8a73ce0d9a43d583` ("round-16 verifier
spot-check (integrator, hyaku)…", `git log -1`). SKILL cites name the lane-root file.
At recon time all four gate files were **worktree-modified** (`git status --short -- scripts/`:
` M` on all four) — C1 seats are editing concurrently. Worktree sha256 observed:
round `87a7907…`, user `679c62f2…`, binding `15af0111…`, selftest `e2f9a11f…` (≠ HEAD below).
Nothing below was executed; exit maps are code-read plus committed receipts.

## 1. Gate entry points inside SKILL.md:1555-1892

| # | Registry row (SKILL.md) | Canonical argv (as registered) | Exit / verdict |
|---|---|---|---|
| 1 | closeout-pin-witness :1559 | `node scripts/check-freshness.mjs --worktree` (candidate only) or `--witness REV` | 0 clean / 1 failed / 2 could-not-evaluate; self `--self-test` (12 cases after safety erratum :1577-1596) |
| 2 | sources-census :1614 | `node scripts/check-sources.mjs [--file REL] [--since YYYY-MM-DD]` | 0 clean / 1 failed / 2 c-n-e (missing, symlinked, non-regular registry; bad args); self `--self-test` (26 cases, :1619-1629) |
| 3 | claim-record-discipline :1657 | `node .ufo/waves/round-12/w1/mistake/check-claim-record.mjs --file fixtures/m2-inference-source-scoped.jsonl` | 0 clean / 1 failed / 2 c-n-e; self `--self-test` |
| 4 | historical-pstack-contract :1677 | `node scripts/check-round-contract.mjs` | 0 clean / 1 failed / 2 c-n-e (`ROUND_CONTRACT verdict=…`, HEAD:608/:1028) |
| 5 | historical-user-contract :1678, superseded by :1800 | `node scripts/check-user-round-contract.mjs` | 0 clean / 1 failed / 2 c-n-e; production stays failed 6/10 (`USER_ROUND_CONTRACT verdict=…`, HEAD:627/:1326) |
| 6 | aria-historical-metadata :1755, superseded by :1801 | `node scripts/check-aria-metadata.mjs --check corpus/evidence/round-14/aria-metadata/corrected.json` | 0 clean / 1 semantic failed / 2 c-n-e incl `snapshot_tampered`/`snapshot_unavailable` |
| 7 | measurement-binding :1840 | `node scripts/check-measurement-binding.mjs --check <manifest> [--at REV] [--reproduce]`; `--legacy <round-15 measurements.json> [--at REV]`; `--self-test` | 0 clean / 1 findings / 2 c-n-e (`MEASUREMENT_BINDING verdict=…`, HEAD:646; `EXIT` HEAD:116) |

Registered self-invocation / witness entry points (same binaries):

- ROUND `--self-test` (HEAD:1022); `--witness 75e7836b6c3090180aee2754e20a5d3cfb186e74` (:1677, HEAD:933);
  code-only `--count-witness REV` (HEAD:972) pinned to `COUNT_WITNESS_REV=bebe2efc…` (HEAD:43).
- ROUND fixture-only `--repo PATH --baseline HASH --expect N [--census-sha256 HASH]` (usage HEAD:207;
  validations :209-226).
- USER `--self-test`; `--witness 75e7836b…` (:1730, HEAD:788); `--diagnostic-witness` (:1800, HEAD:1058);
  `--count-witness bebe2efc…` (:1800, HEAD:924); fixture `--repo/--baseline/--expect/--pstack-pin` (HEAD:281-305).
- MB `--self-test` spawns `scripts/selftest-measurement-binding.mjs` (HEAD:97,679-685). Code also accepts
  `--reasons`, `--json`, `--repo` (HEAD:705-708); the :1840 row omits these and omits `--reasons`.
- Not a registry row but an entry in-window: `node scripts/webmcp-loopback-round16.mjs [--out PATH]`,
  0 pass / 1 a case failed / 2 could-not-evaluate (SKILL:1866-1868). Byte-frozen (PLAN:44-46).

## 2. Digest of the three C1 targets (+ MB selftest) at HEAD

| Script | sha256 (HEAD) | git blob (HEAD) | History |
|---|---|---|---|
| `scripts/check-round-contract.mjs` | `8a573b4ed5875ce24a6d5f60e68cee575bc0687968c5105d4e9e3cfb0febe942` | `3b49a9c7f53e1583d3dd0aac8e0ae2852d0c1343` | last touched `ed69b15` (round-14); identical at `3254740` |
| `scripts/check-user-round-contract.mjs` | `f9be3a726c3d58d1cff07ffe260fb71a37f4bc156b5f8df8bf6be98b15518e7b` | `ce89e692d601ad39e88d7f037ede34a31ad87f25` | last touched `27dfd98` (round-15) |
| `scripts/check-measurement-binding.mjs` | `1f84fb545f76ad776fc88411319dcd2d8145187014ca34bf569753acdde8b1f6` | `6e5d2b3116eef5ccc9943a518c9bf3ee00910ac8` | introduced `8f7feb3` as `5150611c…`, hardened at `3254740` (identical blob) |
| `scripts/selftest-measurement-binding.mjs` | `481eefaec846fa8a58390652f7825122aef57a8ceb6de2fdb06d96f58c3414b3` | `4a25585713430b1cec3c2db20dc9a93fca89bc1b` | `8c5426f2…` at `8f7feb3`, `481eefae…` at `3254740` |

Commands: `sha256sum …`, `git rev-parse HEAD:<path>`, `git log --format='%h %H' -- <path>`,
`git rev-parse 3254740:<path>`.

## 3. Where each digest is pinned — and what a C1 edit invalidates

### 3a. `check-round-contract.mjs` = `8a573b4e…` (blob `3b49a9c7…`)

- **Runtime-enforced pin (the one that breaks):** `scripts/check-user-round-contract.mjs:32`
  `ROUND_SCRIPT_CURRENT_SHA256`. `acceptedRoundScript()` (HEAD:226-245) reads the ROUND script at
  **`HEAD`** (:230), requires its sha256 ∈ `ROUND_SCRIPT_ACCEPTED_SHA256` (old-`prior` + `current`,
  :38-41), and requires every blob touched in `PSTACK_PIN..HEAD` ∈ `ARCHIVED ∪ {current}` (:33-37,
  :237-243). Any byte change to ROUND makes USER production fail `history_rewritten` through
  `pstackDrift`→`acceptedRoundScript` (HEAD:261, :332-334; ROUND is a `PSTACK_PATHS` member :77)
  with detail `Pstack bytes changed: scripts/check-round-contract.mjs`
  (SKILL:1800; PLAN C1 identity chain :70-75) until L1 moves old current → archived and sets the
  new sha as current. No other script pins the USER or MB bytes this way (grep over `scripts/`).
- Historical receipt (frozen, will no longer describe current bytes):
  `corpus/evidence/round-14/gates.json:7` (`sha256`, `measuredRevision f942c62…`; same file `:55`
  records USER `bde18c67…`). `corpus/lessons/round-14-verifier-spotcheck.md:105`.
- Blob-identity list (round-16 harm baseline, historical read-only):
  `.ufo/waves/round-16/harm-baseline.json:191` ("only the 4 recorded sha256 identities
  (prior … intermediates … current 8a573b4e) may appear in pin..HEAD history").
- Witness arms are historical blobs, unaffected by the edit: `LEGACY_GATE_BLOB=b2eb8316…` (HEAD:38)
  = `git rev-parse 75e7836b:scripts/check-round-contract.mjs`; `COUNT_WITNESS_BLOB=43db9f4b…`
  (HEAD:42-43) = `git rev-parse bebe2efc:…`.
- Narrative-only pins (reports): `.ufo/waves/round-14/w1/{RoundCounter.md:5,84,113;
  SecurityScope.md:129; MeasureClaims.md:177; UserCounter.md:61,75,174; ReviewC1Admission.md:4}`,
  `.ufo/waves/round-15/w1/{HistoricalImmutable.md:53,70,120; CountHistory.md:16;
  CountFixtureShape.md:15}`, `.ufo/waves/round-15/w2/AttackNoHarm.md:14`,
  `.ufo/waves/round-16/w1/{ReconProtected.md:69,71; RevHarmPlan.md:64}`.

### 3b. `check-user-round-contract.mjs` = `f9be3a72…` (blob `ce89e692…`)

- **No runtime gate pins its own digest.** Grep over `scripts/` finds no reader of this sha; its
  `--witness`/`--count-witness`/`--diagnostic-witness` compare *historical* arms only
  (`LEGACY_USER_GATE_BLOB=18e2c79a…` HEAD:50, `LEGACY_COUNT_GATE_BLOB=7df3ee9f…` HEAD:55,
  `DIAGNOSTIC_BASELINE_{REV 5c7710d, BLOB 347ae9bb, SHA256 bde18c67}` HEAD:852-854).
- Evidence records that go stale on a C1 edit (same digest today):
  `corpus/evidence/round-15/user-diagnostics.json:4` (`codeSha256`; receipt revision `27dfd98`,
  measured `b7cf044`), `corpus/evidence/round-15/user-diagnostic-witness.json:25` (prints
  `code-sha256=` inside the retained stdout), `.ufo/waves/round-15/verified-code-snapshot.json:4`
  (snapshot revision `27dfd98`). None is gate-enforced; a new receipt must name the new digest/rev.
- Narrative: `.ufo/waves/round-15/w2/{AttackS029Trace.md:27; AttackUserProduction.md:13}`,
  `.ufo/waves/round-16/w1/{ReconMeasure15.md:280-281; RevengeCounterIntent.md:93,105,176,220}`.

### 3c. `check-measurement-binding.mjs` = `1f84fb54…` (blob `6e5d2b31…`), selftest `481eefae…`

- No cross-gate runtime digest pin; blob `6e5d2b31` appears in no file (`grep -rIn` empty).
- **Indirect runtime effect:** `corpus/evidence/round-16/measurement-binding.json:23-24` lists
  `scripts/check-measurement-binding.mjs` and `scripts/selftest-measurement-binding.mjs` in C1
  `countedInputs`, with `measuredRevision 3254740…` (:26). `--check` without `--at` resolves
  `HEAD` (HEAD:833) and diffs `countedInputs`+counter from measured→at (HEAD:507,
  reason `counted_input_changed`). So after a C1 edit the r16 registered command
  (SKILL:1840) goes `counted_input_changed` for C1 at any later REV. **[INFERENCE]** from code;
  not executed (worktree mid-edit). A new r17 manifest measured at the new revision is required.
- Evidence pins: `corpus/evidence/round-16/measurements.json:32` (`gateSha256 1f84fb54…`,
  `selftestSha256 481eefae…`, counter stdout at `3254740`); pre-hardening receipts
  `corpus/evidence/round-16/binding/selftest.json:3-4` and `legacy-r15.json:3-4`
  (`5150611c…`/`8c5426f2…`, labelled history by `corpus/lessons/round-16-verifier-spotcheck.md:149`).
  Fresh this round: `corpus/evidence/round-17/routed/binding-hardened/{selftest.json:13-15,
  legacy-r15.json:16-18, check-at-1205d26.json:17-19, index.json:22-24}` record the same
  `1f84fb54…`/`481eefae…` pair, produced from a sandbox checkout of `3254740` — a C1 edit turns
  these into history, not delivered-gate receipts.
- Narrative: `corpus/lessons/round-16-verifier-spotcheck.md:67,68,149`;
  `.ufo/waves/round-17/PLAN.md:162` (routed defect 2 names `1f84fb54…`); `.ufo/waves/round-17/w1/
  {spec.json:100, validation.json:648, dispatch-result.json:2}` echo the digest as dispatch text.

## 4. Findings that constrain the C1 change (all code-read)

1. **ROUND `--count-witness` exit field is wrong on failure.** The printed line says
   `exit=${pass ? 0 : 2}` (HEAD:1009) but the failure call is `fail('count_witness_failure', …)`
   with default `exit = 1` (HEAD:45, call HEAD:1013) → process exits 1 after printing
   `ROUND_CONTRACT verdict=failed`. PLAN's C1 entry list includes this mode; a counter that
   normalizes the `exit=` token would see 2 while the process returns 1.
2. **Anchor-surface sizes differ.** `'HEAD'` string occurrences at HEAD: ROUND 25, USER 33,
   MB **1** (`grep -c "'HEAD'"` per HEAD blob). MB's only live site is the `--at` default
   (HEAD:833); ROUND/USER counts include fixture/self-test reads of freshly committed fixture
   repos, which PLAN says stay unchanged.
3. **The USER identity chain reads `HEAD`, not a lane tip.** `acceptedRoundScript` HEAD:230 and
   `checkHistory` (HEAD:307-308) both anchor on `rev-parse HEAD`; this is exactly the jj case
   (`jj new` → unlanded/empty HEAD). USER witness `committed=` compares worktree blob to the
   **HEAD** blob (HEAD:795, 879, 954) — the field PLAN redefines to the lane tip.
4. **Registry rows are subsets of the CLIs.** MB row :1840 omits `--reasons/--json/--repo`;
   ROUND's `--count-witness` has no SKILL-documented rev (code constant `bebe2efc…`, HEAD:43);
   USER's documented `--count-witness bebe2efc…` (:1800) matches code. Non-zero exits on usage
   are 2 in all three gates (`fail(...,2)` / `EXIT.couldNotEvaluate`).
5. Unaffected shared constants (do not rotate on a C1 edit): `HARD_BASELINE 7f506aff…`
   (ROUND:11, USER:12), `PSTACK_PIN 92d700d6…` (USER:13), `SHONEN_SEED b45c2ac3…`
   (ROUND:36, USER:46), `CENSUS_SHA256 b9c8dc35…` (ROUND:30).

## 5. Remaining unknowns

- No gate was executed, so runtime exit equality across arms is untested by this seat; only
  committed receipts (`gates.json`, `measurements.json`, `binding/*.json`) and code paths were read.
- `check-freshness` literal-HEAD acceptance (JjAudit F6) was not re-verified; the file is
  byte-frozen (PLAN:44-46), so its registry row (:1559) is documentation-only surface.
- Worktree bytes were mid-C1-edit during recon; any later line-number drift in the three gate
  scripts should be re-read against the delivered revision, not trusted from this snapshot.

Files written:
- `.ufo/waves/round-17/w1/ReconRegistry.md`

No tools installed or upgraded.
