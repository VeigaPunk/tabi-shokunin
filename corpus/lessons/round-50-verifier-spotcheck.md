# Round 50 verifier spot-check — tabi

author: hyaku closure (non-author integrator, zcode subagent (fresh session, non-author))

Closed 2026-11-01T22:18:44Z against lane HEAD `ea11da958a9b8279203cda760a73b8129ac1a082`
(branch `master`, pushed). I did not author this round; I verified, spot-checked, and closed it.
Verdict: **all three claims verify; no axis harmed; admitted.** Defects found are
status-neutral and listed in §6.

## 1. Step-1 conformance

| Check | Command / evidence | Result |
|---|---|---|
| Report committed by lane identity | `git -C <fleet> log --format='%an <%ae> %H %cI' -1 -- .ufo/reports/round-50/tabi.md` → `tabi-shokunin <tabi@shokunin.local> c2fde80a5cc17c1bccc59e049157a14fbe629876 2026-11-01T13:27:49-08:00` | OK (lane identity; landed at the complete timestamp, after the last cited commit ea11da95 at 21:20:22Z) |
| SHONEN heading | report `## SHONEN` with four `[~]` lines + explicit `SHONEN: no [x] written` trailing line | OK (no `[x]` written by the lane or by closure; promotion stays the operator's call) |
| Cited lane commits exist + ancestry | all 10 cited hashes (a9b47d6a, 2febf9b2, 2604c1d9, 5c701994, 19636760, 1ea714f5, bceb2114, f3364aa, ed701bf7, ea11da95): `git cat-file -e <h>^{commit}` + `git merge-base --is-ancestor <h> refs/heads/master` | OK — 10/10 exist and are ancestors of master |
| Branch tip pushed | `git rev-parse refs/heads/master` = `git ls-remote origin refs/heads/master` = `ea11da958a9b…` | OK |
| Cited work inside the round range | `git log a9b47d6a1ea2..ea11da958a9b` lists exactly the round's 9 commits (freeze → amendments → data → C1 data → correction → green → integration → selfassessment) | OK |
| Dispatch/complete digest | watchdog.log lines 251/277 match the contract digest verbatim (launch 10:27:11-08:00 base=a9b47d6a; complete 13:27:49-08:00 head=ea11da958a9b pushed=True) | OK |
| Report minimum content | Work performed / Landed changes / Before→after / Sources & frontier / Trend verdicts / SHONEN all present with evidence pointers | OK |
| Frozen digests | all 16 `frozenDigests` entries in claims.json recomputed from committed bytes at ea11da95 with `git show <rev>:<path> \| sha256sum` | OK — 16/16 match (runner 2152d292…, counter b7f54586…, meter 214b6ebf…, all controls/measure receipts) |

## 2. Claim re-checks

### C1 — adjacency, the regression-gate re-bind (adjacency held 8 → 8): VERIFIED (evidence-verified — I did NOT re-run the meter)

Which and why: the claim is bound to correction revision `bceb2114` and the green
receipt carries full snapshot pins; sibling heads have advanced since (a fresh run
would open a new frozen correction cycle, which only the lane may perform), and the
gate standard has closure verify a sibling gate's committed evidence, never execute
it. I verified the evidence and re-derived every count with my own commands:

- Green receipt `.ufo/waves/round-50/measure/c1-meter-green-at-correction1.json`
  (committed at f3364aa): schema `tabi-adjacency-host-v10`, rev `bceb2114`,
  predicate **true**, findingCount **0**.
- Counts re-derived by me from committed bytes at bceb2114:
  `corpus/adjacency.tsv` = 1 header + **16** data rows (mapRows 16);
  `corpus/adjacency-host-audit-r50.tsv` = 1 header + **16** rows (auditRows 16);
  `corpus/adjacency-host-delta-r50.tsv` = 1 header + **12** lane rows + **16** line
  rows (deltaLanes 12) — all four match the receipt.
- Roster re-derived: 17 dirs in the fleet root − tabi = **16** siblings, matching
  `roster:16` and the receipt's 16-entry `headSnapshot`.
- Snapshot pins spot-checked: `tsukuroi-shokunin b8b24076` (the correction re-bind
  head), `kotoba-shokunin 1c8f37ed`, `kasegi-shokunin eae1d614` — each exists and is
  an ancestor of that sibling's current master (no rewrite).
- v10 selftest receipt `measure/c1-meter-v10-selftest.json`: allPass=true, 16/16
  (digest pinned in claims.json, recomputed, matches).
- Retarget diff `controls/v9-v10-retarget.diff` read in full: comment lines,
  `AUDIT_REL`/`DELTA_REL` const retarget to the r50 ledgers, schema/usage strings —
  no core-logic hunks. Matches the "comment/const/schema hunks only" claim.
- Red control `controls/c1-meter-v9-red-at-round-open.json`: schema v9, rev
  a9b47d6a (round baseline), predicate false, findingCount **24** — the do-nothing
  state, taken before any lane write. See §6 defect D-1 for the per-class prose
  drift around this receipt.
- Correction flow: `measure/c1-meter-red-at-data.json` (1 finding,
  lane-screen-head-mismatch tsukuroi) → ledgers re-bound at a fresh snapshot →
  green inside **one** cycle of the frozen two-cycle budget. The raced receipt is
  committed.

### C2 — coverage, the multi-step journey capability (coverage held 9 → 9; capability `webview2-multi-step-journey-windows` first-working 50): VERIFIED (re-measured — I RE-RAN the committed runner myself once)

- Before: `git ls-tree -r --name-only a9b47d6a… -- corpus/evidence/round50 | wc -l`
  → **0**; the journey residual is committed text in the baseline SCORECARD
  (`planned: coverage — the nav surface's next residuals: a multi-step journey (A -> B -> C with …`, line 2703).
- After: same command at ea11da95 → **5** files (receipt.json + 4 per-step PNGs),
  introduced exactly at 19636760.
- All four receipt PNG pins re-hashed from committed bytes: `c6c0d2fd…`, `cdf91601…`,
  `917a1e4e…`, `556c0bf2…` — 4/4 match the receipt's screenshot pins.
- Committed receipt matches the frozen predicate field-for-field: 4 legs
  (Page.navigate → anchor-click → anchor-click → navigateToHistoryEntry), history at
  C `[data:, a, b, c]` entriesLength 4 currentIndex 3, backLeg targetIndex 2 →
  urlAfter `/b.html`, entriesLengthAfter 4, currentIndexAfter 2, nonceOnPageA true,
  Edg/156.0.4314.58, postKillSweepCount 0, hostReadySeen true.
- **My re-run** (the declared re-derivation path): I mirrored the committed bytes
  into a clean scratch dir (`scripts/webview2-cdp-loopback-round50.mjs` =
  sha256 2152d292… == the frozen digest; `scripts/webview2-host-round48.cs` =
  sha256 13b2bc3d… == the receipt pin) and ran
  `node …round50.mjs --runtime "C:/Program Files (x86)/Microsoft/EdgeWebView/Application/156.0.4314.58" --loader "C:/Program Files/WSL/wslsettings/WebView2Loader.dll" --scratch <scratch>/rerun/journey-run --out <scratch>/rerun/verify-receipt.json --journey`
  → **exit 0**, ok=true, fresh nonce `tabi-r50-c56ead6156cbcc4e` echoed
  (invocationBound true), fresh loopback ports (fixture 52998), 4 legs, history at C
  `[data:, a, b, c]` entriesLength 4 currentIndex 3, back hop targetIndex 2 landing
  `/b.html` with entriesLengthAfter 4 currentIndexAfter 2, nonceOnPageA true,
  **postKillSweepCount 0**, failures []. The measured history model reproduces.
- Safety verified from the runner source before running: throwaway profile under
  `--scratch` keyed by a per-invocation random token (`WEBVIEW2_USER_DATA_FOLDER`),
  loopback-only fixture server on an ephemeral port, keyed teardown
  (`taskkill /T /F` on the host tree + token sweep + recheck) with `ok` gated on
  sweep 0 — lane-local safe as claimed. My run wrote only inside my scratch.
- Amendments pre-data: `git diff-tree` over 2604c1d9 and 5c701994 shows only
  instruments/claims/fixtures/red-control bytes — no `corpus/evidence` file exists
  before 19636760. Both amendments carry committed red receipts that pin the exact
  bytes they ran on: target-race red (`no-page-target`, driverSha 05a4f77e… = the
  freeze bytes) and history-model red (`journey-back-not-ready`, driverSha
  80084750… = the amendment-1 bytes, whose own measured history block already shows
  `[data:, a, b, c]` — the refutation that forced amendment 2). Provenance chain
  freeze → amendment 1 → amendment 2 → data is unbroken.
- Cross-refusal receipt `measure/c2-r49counter-refuses-r50.json`: the r49 counter
  refuses the r50 receipt with exactly **4 findings** (schema, profile-not-throwaway,
  nonce-shape, driver-pin-mismatch) — the prior counter generation does not green
  this receipt.

### C3 — operability, the declared could-not-evaluate class (operability held 9 → 9): VERIFIED (evidence-verified: counter source + committed receipts; fixture selftest not executed by closure per the gate standard)

- Counter source read (`.ufo/waves/round-50/counters/webview2-receipt-r50.mjs`,
  digest b7f54586… == frozenDigests): when the receipt's pinned runtime FOLDER does
  not exist → `couldNotEvaluate.push({check:'runtime-existence',
  code:'runtime-pin-host-drift', …})` and **no finding**; when the folder exists
  WITHOUT `msedgewebview2.exe` → the hard finding `runtime-msedgewebview2-absent`;
  new receipt-internal `runtime-identity-mismatch` (Browser version tail vs folder
  version tail). Exactly the r49-closure D3 adoption as suggested.
- Selftest manifest: **13** cases with exact-match expected findings AND the declared
  cne rule asserted per case (`wantCne = folderExists ? [] : ['runtime-pin-host-drift']`).
  `d3-asis-real-removed-runtime` pins the REAL removed runtime
  `…\EdgeWebView\Application\156.0.4314.50` (verified absent on this host — only
  155.0.4283.62 / 156.0.4314.58 exist); `runtimeProbe: with-exe / without-exe`
  cases materialize a deterministic probe runtime under a temp dir, exercising both
  runtime branches on any host.
- Data-time receipt `measure/c3-counter-selftest-at-data.json`: allPass=true,
  **13/13**, with the d3-asis case showing `gotCne=['runtime-pin-host-drift']`,
  `got=[]` (disclosed class, zero pollution) and `runtime-without-exe-refused`
  showing `got=['runtime-msedgewebview2-absent']`, `gotCne=[]` (hard finding kept).
- Red/green pair for the counter's own draft defect:
  `controls/c3-counter-selftest-draft-counter-red.json` (draft bytes over the final
  fixtures: **10/13**, three journey cases spuriously red on a wrong global
  URL-distinctness rule) vs the final bytes green 13/13. The draft bytes are not
  committed (only the red receipt is), so this red is evidence-verified, not re-run.
- Before-state controls: `controls/c3-r49counter-selftest-today.json` (r49 counter,
  unchanged bytes): 0/8, all 8 cases polluted with `runtime-msedgewebview2-absent`;
  the same counter on the two committed r49 receipts exits 1 with only that
  environmental finding. The D3 drift was environmental; the fix is the versioned
  counter.
- Counter green on the round's own receipt: `measure/c2-counter-green-at-data.json`
  (exit 0, predicate true, 0 findings, couldNotEvaluate [] — the live runtime
  156.0.4314.58 exists today; I verified the folder and its exe exist).

## 3. Erratum and sources re-open

- **D1** re-derived by me: `git show 10ea3d96:<note> | grep -c 'cross-page
  navigation were not exercised'` → **0** (line-wrapped sentence) and **1** at tip;
  the revision-stable join+squeeze form (`tr '\n' ' ' | tr -s ' ' | grep -o … | wc
  -l`) → **1** at baseline, **2** at tip. Exactly as the erratum states.
- **D2** re-derived: in the committed registry, S158 (line 172) → S160 (line 173) →
  S159 (line 174): S160 sits **between S158 and S159**, as the erratum states; the
  substantive requirement (inside the Registry table) is met.
- **D4 / the E04 refusal**: `controls/sources-duplicate-row-catch.txt` quotes the
  three gate runs (E01 field count → E09 recheck → E04 `duplicate_url` on S161).
  The staged re-open bytes `.ufo/waves/round-50/sources/browser-protocol.json`
  hash to `f60f0c0263c6…` — equal to the S153 anchor pin in the registry. My own
  re-open of those opened bytes: "Returns navigation history for the current page."
  → 1 verbatim hit; "Navigates current page to the given history entry." → 1
  verbatim hit. `corpus/SOURCES.md` is byte-identical between baseline and tip
  (`git diff-tree` empty — the S161 row never landed); rows re-counted **160**; no
  S161 row exists. The refusal receipt verifies.
- SOURCES rows before→after: `grep -cE '^\|\s*S[0-9]{3,}\s*\|' corpus/SOURCES.md`
  → 160 → 160 (unchanged; the report discloses the withdrawn S161 and the S153
  re-open). Knowledge notes re-counted: 65 at baseline → **66** at tip, the new note
  `corpus/knowledge/webview2-journey-round-50.md` present.

## 4. Discernment spot-check (outside view; ≥1 admit and ≥1 reject re-opened)

| Item | Decision (lesson §Gate) | Re-opened source / command | Agree/disagree | Reason |
|---|---|---|---|---|
| S153 re-open (byte-identical, both history-primitive quotes) | ADMIT | staged opened bytes hashed + grepped by me (§3); registry S153 anchor pin | **agree** | fresh fetch digest equals the registered anchor; both CDP quotes verbatim 1 hit; load-bearing for C2 exactly as claimed |
| C3 declared class adoption | ADMIT | counter source + 13/13 data-time receipt + manifest cne rule (§2 C3) | **agree** | the removed pinned runtime grades as the declared class with zero finding pollution; folder-without-exe stays hard; both branches deterministic |
| C2 journey capability | ADMIT | my own live re-run of the committed runner (§2 C2) | **agree** | the after-state is a live instrument output I reproduced end-to-end, not a reasoned number |
| Amendment-1 history model (entries [a,b,c]) | REJECT | my re-run's measured history block: [data:, a, b, c], entriesLength 4, currentIndex 3 | **agree** | the live surface refutes [a,b,c] exactly as the lesson records; the red receipt kept at the amendment-1 bytes carries the same measurement |
| Counter first draft (global URL distinctness) | REJECT | `controls/c3-counter-selftest-draft-counter-red.json` (10/13, spurious `journey-url` on green-journey) | **agree** | the back leg legitimately revisits /b.html; the draft rule false-refuses every journey; red reproducible from the committed named reproduction |

No disagreement found; nothing left unlearned (the round's own Mistakes table
already carries each sampled reject with its failing first read).

## 5. Per-axis verdicts and trends

| Axis | Verdict | Evidence |
|---|---|---|
| adjacency | **improved** | C1 verified under its frozen predicate: red 24 → green 0 at bceb2114 through the sanctioned correction flow, counts re-derived, v10 selftest 16/16; the r47-admitted-round precedent grades a verified re-bind improved (the scalar holds 8 → 8 by the lane's own rubric) |
| coverage | **improved** | C2 verified: 0 → 5 evidence files, live journey re-run by closure, counter green, r49 counter cross-refuses, capability row enters the table first-working 50 (scalar holds 9 → 9) |
| operability | **improved** | C3 verified: the environmental pollution class is closed in a versioned counter with the declared could-not-evaluate rule, hard branch kept, 13/13 at the data revision, deterministic both-branch probes (scalar holds 9 → 9) |
| depth | unchanged | no claim this round; SCORECARD untouched outside the appended round-50 block |
| freshness | unchanged | no claim this round |
| calibration | unchanged | no claim this round |

No axis harmed: `git diff-tree` over SCORECARD baseline..tip is a single pure
append (+92 lines, one hunk); no prior row edited.

Trends (all three agree with the report): **expansion improved** (0 → 5 evidence
files; capability row; notes 65 → 66 — re-counted by me); **quality improved**
(two pre-data instrument defects forced by live reds and repaired under named
amendments before any data; D3 closed; no admitted entry failed a re-check);
**discernment improved** (my §4 spot-check agrees on all five sampled decisions;
both design reds kept, the E04 duplicate-row catch disclosed as a Mistake with a
committed catch record).

## 6. Defects (status-neutral; routed to the lane for round 51) and standing items

- **D-1 (prose number drift, class number-drift):** the v9 red-control per-class
  decomposition quoted in the claims.json C1 frozenPredicate parenthetical, the
  lesson Measurements bullet, and the report bullet ("12 lane-screen-head-mismatch
  + 3 sha + 3 lines …") does not match the committed receipt's actual split — the
  receipt's findings are **11 head / 4 sha / 4 lines / 2 missing / 1 quote / 2
  invented = 24** (kotoba carries a sha+lines pair beyond the three named
  provinces). The operative headline numbers (exit 1, predicate false,
  findingCount 24) are correct everywhere and the receipt itself is the instrument
  output; fix next round by quoting the receipt's own Counter in prose, or a
  lesson row naming the correction.
- **D-2 (stale sentence, class stale-premise):** the lesson's Census → End sentence
  still reads "S161's URL is new to the registry and lands INSIDE the Registry
  table (after the S160 row, before the S159 row …)" — true of the during-round
  draft, false of the final state (S161 withdrawn pre-commit; registry 160; the
  same lesson documents the withdrawal). The committed census-end receipt is fine
  (22 W04 + `tabi ok`). Fix: a dated correction line in the next lesson.
- **D-3 (label leftover):** claims.json C3 frozenPredicate says "the r50 counter
  (frozen sha 8372402c…)" — the freeze-time counter sha superseded by amendment 2.
  The operative `frozenDigests` pin (b7f54586…) governs, matches the committed
  bytes, and no measured predicate binds 8372402c. Fix of record next round.
- **Standing (not defects):** the `tabi | round-44` L2-floor L0 stays open — routed
  around for the fifth round (L1-inline disclosed in every predicate); the lane's
  own selfassessment gate reads verdict=failed mismatches=1 at ed701bf7 on the
  single standing m3 stale-index class (host git-index artifact; crashed EPERM
  receipt kept and never quoted as a verdict — disclosure discipline held).
- SHONEN.md: all four boxes remain `[~]` (lane-asserted) — correctly so; a
  non-author `[x]` remains available to the operator's promotion review. The r49
  closure's §7 note still lists what a non-author re-run would close.

## 7. Closure

Status **ok**, **admitted**: every claim verifies (C1 evidence-verified at its
bound revision; C2 re-measured live by this closure; C3 evidence-verified from
source + committed receipts), no axis is harmed, and the report is a real report
(work, evidence pointers, cited commit hashes, SHONEN heading).
