author: hyaku closure (non-author integrator, zcode subagent (fresh session, non-author))

# tabi round 55 — non-author closure spot-check (2026-11-02)

Verifier: hyaku closure, fresh zcode subagent session, did NOT author round 55. Fleet root
`C:/Users/jpvei/.zcode/workspace/95b1ba4d-5089-47a4-9fd8-54adebbce2ae/shokunin-clone/shokunin`;
lane repo `C:/Users/jpvei/.zcode/workspace/95b1ba4d-5089-47a4-9fd8-54adebbce2ae/fleet/tabi-shokunin`.
Lane head before: `793d947e1409`; after: `545b251d0c370fa1b75f312a4b3feb5c902d0ac6`.
Index-free git only. No lane-authored file edited by this check.

## 1. Step-1 conformance

| Check | Command | Result |
|---|---|---|
| Report committed by lane identity | `git -C <fleet> log --format='%an %H' -1 -- .ufo/reports/round-55/tabi.md` | `tabi-shokunin ee8386800d14d3f2a5ea7b7e872535bc30100e7e` — lane identity, fleet commit `ee838680` |
| SHONEN heading | read of the report | `## SHONEN` present, 4 `[~]` boxes with resolvable pointers, no `[x]` written (correct routing; operator owns the gate) |
| Lane tip pushed | `git ls-remote origin refs/heads/master` vs local `rev-parse refs/heads/master` | both `545b251d0c370fa1b75f312a4b3feb5c902d0ac6` — equal |
| Baseline ancestry | `git merge-base --is-ancestor 793d947e1409 545b251d` | OK |
| Every cited lane commit exists + ancestor of master | `git cat-file -t` + `merge-base --is-ancestor` for 774610da, a766984c, 7b82763d, db6f4225, c1e64885, 81b2fdbd, 103bf06f, 216b1cf2, 545b251d | all ancestor-OK |
| Cited work reachable in range | `git log 793d947e1409..545b251d` | 10 commits (see defect N2: one uncited) |

Conformance defects (status-neutral, named below in Routed defects): the report's
"receipts commit (after this report)" never landed (N1); the freeze chain has a fifth,
uncited commit `5fd39bfc` (N2); the report/LOG say "four commits" for the freeze (N2);
the correction-1 prose names one of two sibling movers (N3); SOURCES.md in-place cell
edits ride outside the strict v1 columns (N4); lane scratch not deleted (N5).

## 2. Per-claim re-check

### C1 — adjacency (meter v15 rebind). Method: EVIDENCE-VERIFIED from committed receipts (per the closure contract: snapshot pins govern; the lane-owned meter was not executed by this judge). Grade: improved.

- **Before (red control, committed at `db6f4225`):** read
  `.ufo/waves/round-55/controls/c1-meter-v14-red-at-round-open.json` (sha256
  `cc402384…` == the claims.json pin): schema `tabi-adjacency-host-v14`, rev
  `793d947e1409…`, predicate false, findingCount 6 — findings exactly as reported
  (lane-screen-sha-mismatch kengaku, lane-screen-lines-mismatch kengaku,
  lane-screen-head-mismatch kengaku/mori/shokunin-binary-forensics/tameshi; 0 audit
  findings). The do-nothing control IS this red. Verified.
- **Ledger re-derivation (my own plain measurements over committed bytes):**
  - `git -C kengaku-shokunin show a6cd337d:PROVINCE.md | sha256sum` →
    `75c6ccc3a049317117044700d6cfc5873bd13392edfd4eaa8d752b66f365521d`;
    `| wc -l` → 892. delta-r55 kengaku row (committed at `216b1cf2`): same sha, 892
    lines, bgHits 0, head `a6cd337d`. **Byte-for-byte match.** The r54 row (at
    `793d947e`) reads 847 lines — the report's "892, was 847" checks out.
  - `git -C shokunin-binary-forensics show 41322a34:PROVINCE.md | sha256sum` →
    `c49f6d1d…502`; `| wc -l` → 59. delta-r55 row: same sha, 59 lines, bgHits 4, head
    `41322a34`; its 4 line rows carry dispositions `no-tabi-ground` ×2, `contested-open`
    ×2 — inside the frozen vocabulary. **Match.**
  - Snapshot receipts committed at `103bf06f` (rebind) and `216b1cf2` (correction 1)
    pin the full head sets; the raced receipt (committed) shows the correction-0 run:
    predicate false, exactly 1 finding (lane-screen-head-mismatch tameshi). The frozen
    correction flow is on the record at every step.
- **v15 generation bump:** my own `diff` of the two committed meters (from `db6f4225`)
  shows ONLY: header comments (incl. the Round 55 delta paragraph), the Round 55
  paragraph, PREDICATE-SENTENCE comment, AUDIT_REL/DELTA_REL `r54`→`r55`, schema strings
  in all four places, usage strings — no logic line touched. Pure-core byte-identical
  claim VERIFIED. The v14 header name-leftover ("tabi round 53") is present in v14's
  committed bytes and disclosed in `controls/c1-token-check-r55.txt` (v15 names round 55;
  v14 bytes never edited). Verified.
- **Selftest:** `measure/c1-meter-v15-selftest.json` (committed at `216b1cf2`): cases 16,
  pass 16, allPass true. Verified.
- **After-state transcript:** `measure/c1-meter-green-at-correction1.json` (rev
  `216b1cf2…`, predicate true, 0 findings, counts {roster:16, mapRows:16, auditRows:16,
  deltaLanes:12}) exists on DISK and corroborates — but is NOT committed (defect N1).
  The green verdict still re-derives from committed bytes: the ledgers are committed at
  the measured revision, the meter is digest-pinned, and the counting command in the
  report is fully reproducible over committed inputs. Graded on the committed chain.

### C2 — coverage (capability `webview2-keyevent-control-keys-windows`). Method: RE-MEASURED by this judge (live re-run + committed counter), plus committed receipts. Grade: improved.

- **Before/after tree counts (my own runs):**
  `git ls-tree -r --name-only 793d947e1409 -- corpus/evidence/round55 | wc -l` → **0**;
  same at `81b2fdbd` → **7** (receipt.json + 6 per-step PNGs). Matches the claim.
- **Committed receipt structural check** (`81b2fdbd:corpus/evidence/round55/webview2-control-keys/receipt.json`):
  schema `tabi-webview2-cdp-r55`; nonce `tabi-r55-5a70384367c4b44b`; hostCsSha256
  `13b2bc3d…` == the pinned hostsrc; teardown {postKillSweepCount 0, survivors [],
  postSweepRecheckCount 0}; controlDomain: End VK 35 ×2 with valueAfterEnd == nonce
  (negative edit witness), Backspace VK 8 ×2 with valueAfterBackspace == nonce minus
  exactly its last character (`…c4b44b` → `…c4b44`), restore char `b` (KeyB, VK 66) with
  valueAfterRestore == nonce, Tab VK 9 ×2 with activeElement `field`→`field2`, Enter VK 13
  ×1 from the tabbed-to field, keylog window +4 (65→69), pageKeylog 69 entries,
  serverSawField + serverSawMixed true. All as reported.
- **Committed counter re-run (my own, read-only node over committed bytes):** extracted
  the counter from `545b251d` (sha256 `e4b9f9be9012f6d53ac84c77683bb76ddfb18c7f1fc2138119e0336bb21e5def`
  == the claims.json pin) and ran it over the committed receipt + committed PNG bytes
  with the committed driver (sha `d773fa71…`) and hostsrc: **exit 0, predicate true,
  0 findings, couldNotEvaluate [].** Re-measures the committed green.
- **LIVE re-run (the one authorized by the closure contract):** safety-reviewed the
  committed runner first — profile is a throwaway dir under `--scratch`
  (`tabi-r55-wv2drv-<token>-profile`), the fixture server binds `127.0.0.1:0` only, all
  fetches target 127.0.0.1, keyed teardown taskkills the host tree and sweeps by profile
  token, exit 0 requires postKillSweepCount === 0 (fail-closed); the host .cs has no
  network/fs surface beyond the loopback CDP contract. Ran the committed bytes once into
  a fresh closure scratch: **exit 0 first try** — fresh compile, nonce
  `tabi-r55-953a9d58d882d4f3`, 6-leg journey with the echo URL
  `/echo?field=<nonce>&mixed=<UPPERCASED>`, backspace residue == nonce[:-1], exact
  restore, tabFocus `field2`, keylogMatchesPlan true, postKillSweepCount 0, failures [].
  Then the committed counter over the FRESH receipt + fresh PNGs: **exit 0, predicate
  true, 0 findings, couldNotEvaluate [].** The capability reproduces end-to-end today.
  Closure scratch deleted afterwards; runner's own sweep accounting was 0.
- **Cross-refusals (committed receipts):** r54 counter on the r55 receipt → 6 findings
  (schema, profile-not-throwaway, nonce-shape, driver-pin-mismatch, form-mechanism,
  keylog-length 69≠65); r55 counter on the committed r54 receipt → 7 findings (same five
  + control-domain-missing + keylog-length 70≠74). Exactly the frozen, pre-data-corrected
  expectation. Verified.
- **Selftests (committed receipts):** counter 103/103 (`c2-counter-selftest-at-freeze.json`);
  runner `--path-selftest` 6/6 (`c2-path-selftest-at-freeze.json`). Verified.

### D54 carry-ins (routed, verified)

- **D54-1:** `git diff-tree --name-status c1e64885 -- .ufo/waves/round-54/` shows exactly
  the three cited receipts + `d54-1-landing-note-r55.txt` ADDED at the cited paths.
  Re-read all three: green 0 findings / predicate true / cne []; r53-counter refuses
  r54 = 5 findings (the exact cited set); r54-counter refuses r53 = 7 findings incl.
  chord-domain-missing + keylog-missing (the exact cited set). Provenance disclosed
  (r55 re-measures; r54 originals LOST). LANDED as routed.
- **D54-2:** S161 anchor cell now §3.5.1; verified against the committed staged bytes
  (`.ufo/waves/round-54/sources/uievents.html`, sha `8ded5eaf…` == the row's recorded
  sha): `data-level="3.5.1" id="interface-keyboardevent"` present; grep
  `data-level="5.3"` → 0 hits. Old→new logged in the lesson. Corrected of record.
- **D54-3:** the L2-floor L0 standing is referred to only (claims.json discloses
  L1-inline; PROVINCE carries the standing line; not treated as answered). Compliant.

### Axis-harm check

`git diff-tree -r -p 793d947e1409 545b251d -- SCORECARD.md` is purely ADDITIVE: the
round-55 block, the capabilities row, trend/planned sections. No score moved (adjacency
8→8, coverage 9→9 held; no rubric authorizes a move), no axis row touched. Spot reads of
LOG.md (append-only round entry), PROVINCE.md (additive round-55 line), QUALITY.md
(criterion 109 appended citing the lesson), corpus (new knowledge note; SOURCES changes
below) — no axis harmed.

## 3. Discernment spot-check (non-author)

Sampled from `corpus/lessons/round-55.md` `## Gate`: 2 admits (S083 re-open, S153
re-open; the C1/C2 admits were additionally re-derived in §2 above) and 1 reject (the
S162 duplicate-URL draft dropped at check-sources E04).

| Item | Decision | Re-opened source (my own run) | Agree/disagree | Reason |
|---|---|---|---|---|
| S083 re-open with the extended Implicit-submission ground | admit | `curl -sL https://html.spec.whatwg.org/multipage/form-control-infrastructure.html` (live; section 4.10.22.2 confirmed in the live TOC) + the round's staged copy (disk, sha256 `dc7c30888b2d1d665c0afbabee782ee4e0789f4bb8c2685802db0b033e8d1aaa`, 466,321 B — hash and size == the row's cells; the quote `hitting the "enter" key while a text control is <a id=implicit-submission:focused` greps exactly 1 hit in the staged bytes; the surrounding text confirms the default-button click contract) | **agree** | The located ground is real, in the named bytes, and is the right spec ground for the Enter-leg; extending the existing row instead of minting a same-URL duplicate is defensible (see N4). |
| S153 seventh re-open (byte-identical) | admit | `curl -sL https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json` → sha256 `f60f0c0263c6f8801c1a3058a88aad0aef2c8f78242c3cfb4e8c6f5e915eb3f2`, 1,421,620 B — **byte-identical to the registered anchor** (my re-open makes it an eighth); `modifiers` description verified verbatim: "Bit field representing pressed modifier keys. Alt=1, Ctrl=2, Meta/Command=4, Shift=8 (default: 0)." | **agree** | The shared key-event ground is stable and the quote is exactly where the lesson says. |
| S162 duplicate-URL draft (the would-be Implicit-submission row) | reject | Registry re-open: `grep -c S162` on the committed SOURCES.md → 0 rows; `scripts/check-sources.mjs` maps `duplicate_url: 'E04'` (read from the committed source); my own `node scripts/check-sources.mjs` → `SOURCES_GATE verdict=clean rows=161 findings=0` | **agree** | The draft's URL duplicated S083's; E04 is the named duplicate-url rule and the gate was clean after the drop. Routing the ground to a re-open + used-by extension preserved the evidence without a duplicate row. |

New SOURCES.md row check: no new row this round (161 → 161; the S162 draft dropped), so
the "newly written row" duty falls to the round's row changes — S083's extended cells and
S153's used-by were re-opened above; S161's corrected anchor was re-verified against the
staged bytes (D54-2). The ≤25-word located quotes for both re-opened rows grep verbatim in
bytes I fetched/staged-hash-verified myself.

Census (my own run):
`bash <fleet>/scripts/sources-census.sh validate --root <fleet> tabi` → **exit 0**,
`tabi ok`, the 22 pre-existing W04 duplicate-URL warnings (same set disclosed r47–r54).
The round's census-end receipt is uncommitted (defect N1) but the end-state it records is
reproduced by my own run.

## 4. Trend verdicts (with evidence)

- **expansion: improved** — evidence tree 0 → 7 (my own counts); the capability row
  `webview2-keyevent-control-keys-windows` entered the SCORECARD table with a
  demonstration I re-ran live; knowledge notes 70 → 71 (`webview2-control-keys-round-55.md`
  is the one added file under corpus/knowledge/); a NEW located ground entered S083;
  seven new control-domain refusal fixtures joined the 103-case exact-findings manifest.
- **quality: improved** — the correction flow absorbed a mid-round sibling commit race in
  ONE of two frozen cycles (raced receipt committed; snapshot receipts pin both cycles);
  the v15 bump is pure-core byte-identical (my own diff); the pre-freeze smoke run caught
  the caret defect and the red control is committed at the citing round
  (`c2-smoke-caret-midtext-red.json`, driverSha256 `a41c51d1…` = the pre-fix runner —
  the fix landed at the freeze-pinned digest `d773fa71…`); the CRLF empty-commit class
  was caught by the post-commit landing check and mined (Mistakes 2) with criterion 109
  landed; my re-run of the counter over committed bytes reproduced the green exactly.
- **discernment: improved** — every after-state is an instrument output at a named
  revision; the three carry-ins were corrected of record with measured oracles (D54-1's
  re-measures verified from the landed receipts; D54-2 verified against staged bytes);
  the duplicate-URL draft was dropped at the gate rather than argued around (my spot-check
  agrees); the frozen cross-refusal expectation was corrected pre-data by walking the
  counter's check flow and the measured refusal matched it exactly; SHONEN boxes stayed
  `[~]` (operator-owned). Both sampled gate decisions agree with my re-opens.

## 5. Routed defects (the lane must fix next round; status-neutral, none bars admission)

- **N1 (criterion-109 class, THIS round's own rule): the receipts commit never landed.**
  The report's own Landed-changes table names a "receipts commit (after this report)" —
  it does not exist; lane HEAD is `545b251d` and remote master equals it. Uncommitted at
  the citing round, all present in the working tree / `scratch/tabi-r55/`:
  `.ufo/waves/round-55/measure/c1-meter-green-at-correction1.json` (the round's cited C1
  green transcript — the same orphaned-evidence class D54-1 just fixed),
  `measure/census-end.txt`, `measure/check-sources-at-work.txt`,
  `measure/c3-gate-v4-at-final.txt`, and the two staged source copies
  `.ufo/waves/round-55/sources/browser_protocol.json` +
  `html-form-control-infrastructure.html` (the SOURCES.md cells cite their byte counts /
  sha256s). **Routed: land them next round with the `git show <rev>:<path>` landing check
  criterion 109 itself mandates.** C1 still verifies from the rest of the committed chain
  (snapshot-pinned ledgers I re-derived byte-for-byte, committed selftest, committed
  meter diff, reproducible counting command) — this is a landing defect, not a refusal.
- **N2: the freeze took FIVE commits, not the four the report/SCORECARD/lesson describe.**
  `5fd39bfc` (between `7b82763d` and `db6f4225`, in range, pushed) is cited nowhere; its
  tree is EMPTY (identical to its parent `7b82763d`) while its commit message claims it
  "carries the remaining frozen set at the SAME digests" — a false message body. The
  CRLF root cause and the `db6f4225` full carrier stand. **Routed: note the corrected
  count in the round record; the false-carrier message joins the Mistakes-2 class.**
- **N3: the correction-1 race had TWO movers, the prose names one.** Between the
  correction-0 run and the correction-1 snapshot, tameshi moved `6e6cf2f7`→`25bc78a6`
  (disclosed) AND shokunin-binary-forensics moved `87f80cef`→`41322a34` (visible in the
  two committed snapshot receipts; absorbed by the rebind; ledger row re-derives). The
  commit message and report name only tameshi. **Routed: correction-cycle disclosures
  must enumerate every head that moved, not only the one that caused the raced finding.**
- **N4: SOURCES.md in-place cell edits ride outside the strict v1 columns**
  (status/recheck/used-by only): S083's anchor+teaches were extended in place and S161's
  anchor corrected §5.3→§3.5.1 in place. Old→new is logged in the lesson and the r54
  closure routing directed "corrected of record", but the v1-sanctioned form is a
  superseding row (the S156 pattern). **Routed: operator/aggregator to rule whether
  superseding rows are owed; no frozen byte was edited and no information was lost.**
- **N5 (minor): the lane's scratch dir `scratch/tabi-r55/` was not deleted** (the round
  prompt requires it). Usefully, the author's originals survive there for the N1 landing.
- **SHONEN note for the operator:** all four boxes carry resolvable pointers and look
  checkable by a non-author on the committed bytes (box 2's end-to-end task was
  additionally re-executed by this closure). The `[x]` remains the operator's call per
  the standing routing.

## 6. Verdict summary

| Axis | Verdict | Basis |
|---|---|---|
| adjacency | improved | C1 verified (evidence-verified from committed receipts; snapshot pins govern; ledger rows re-derived byte-for-byte by this judge) |
| coverage | improved | C2 verified (RE-MEASURED: live re-run of the committed runner + committed counter green on fresh and committed receipts; tree 0→7 re-counted) |
| depth | unchanged | no depth-row change; additive corpus/knowledge note |
| freshness | unchanged | no freshness-row change; re-opens logged per contract |
| operability | unchanged | no operability-row change; instruments frozen and digest-pinned |
| calibration | unchanged | no calibration-row change; honest disclosure posture throughout |

Trends: expansion improved · quality improved · discernment improved.
Admission: every claim verifies and no axis is harmed → **admitted**.
