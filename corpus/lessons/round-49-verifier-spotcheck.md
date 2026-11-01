# tabi round 49 — verifier spotcheck (non-author closure)

author: hyaku closure (non-author integrator, zcode subagent (fresh session, non-author))

Closed 2026-11-01 against lane tip `c0b187b7659b3d623837e315d67483f3be5ca8e8`
(branch `master`, pushed). Baseline `10ea3d96c0eed6d0e7240f57f7a30d8ef73689b1`.
This file is written by the closure judge and is NOT committed by the lane; the
orchestrator commits it under the protocol identity.

## 1. Step-1 conformance — all checks pass

| Check | Command (abridged) | Result |
|---|---|---|
| Report committed by lane identity | `git -C <fleet> log --format='%an <%ae> %H %cI' -1 -- .ufo/reports/round-49/tabi.md` | `tabi-shokunin <tabi@shokunin.local> d72dfede8350 2026-11-01T08:39:36-08:00` — lane identity, one second after the watchdog `complete` line (08:39:35), i.e. the orchestrator's sweep commit carrying lane attribution |
| `SHONEN` heading | read of the report | present, 4 `[~]` lines with evidence pointers, no `[x]` written by author or closure |
| Cited commits exist + are ancestors | `git merge-base --is-ancestor <h> refs/heads/master` for 7700daf8, 6e080c17, eb89957f, 44dde54f, 5fa18384, b026dc34, 36f8579b, c0b187b7 (+ baseline 10ea3d96) | 9/9 ANCESTOR-OK |
| Tip pushed | `git ls-remote origin refs/heads/master` vs `rev-parse refs/heads/master` | both `c0b187b7659b3d623837e315d67483f3be5ca8e8` |
| Round work reachable | `git log --oneline 10ea3d96..c0b187b7659b` | exactly the 8 commits of the report's Landed-changes table |
| SCORECARD append-only | `git diff-tree -r -p 10ea3d96 c0b187b7 -- SCORECARD.md` | pure append (round-49 block + capability row); no prior byte touched; no axis score moved (8/9/9 held) |
| LOG entry | `git show c0b187b7:LOG.md \| grep -n 'Round 49'` | line 3110, ties every landed commit |
| Frozen digests | sha256 over committed bytes of all 13 `claims.json` `frozenDigests` entries | 13/13 match |
| Assimilation line | `ls <lane>/considerthese` | absent — the report's `Assimilation: none — shokuknow unreachable` is honest |

## 2. Per-claim re-check

### C1 adjacency — VERIFIED (evidence-verified against snapshot pins; live re-run races, as the closure note anticipated)

Path taken, as ordered by the closure note: I first **re-ran meter v9 myself
from committed bytes**; it races because sibling heads advanced after the round
(kama/mori/kotodama and others landed; kasegi/kengaku/mado provinces changed
bytes). Applying the frozen correction flow again is a lane write (re-bind +
commit) outside the closure's two-artifact scope, so I then took the note's
second option: **evidence-verify the committed green receipt at `5fa18384`
against the snapshot pins**. Both runs are recorded here.

1. Instrument integrity: extracted `c1-adjacency-host-v9.mjs` at `5fa18384` —
   sha256 `4a5a029c…` = the frozen digest. Selftest re-run by me:
   `node c1-adjacency-host-v9.mjs --selftest` → exit 0, `allPass: true, cases:
   16, pass: 16`.
2. Live re-run: `node c1-adjacency-host-v9.mjs --rev 5fa18384… --repo <lane>
   --fleet <fleet> --json` → **exit 1, predicate false, 17 findings** (12
   `lane-screen-head-mismatch`; kasegi/kengaku/mado sha+lines mismatch —
   post-round sibling movement, the same race class the round routed through
   the frozen correction flow). Not a defect of the round: the meter compares
   against sibling heads *as they are now*.
3. Pinned-snapshot re-derivation (the evidence-verify): with the meter's own
   exported `verify()` core unchanged, fed the ledgers extracted at `5fa18384`
   and sibling bytes read via `git cat-file -p <pinned-head>:PROVINCE.md` at
   the **green receipt's own 16-head snapshot** →
   **predicate true, findingCount 0**, counts {roster 16, mapRows 16,
   auditRows 16, deltaLanes 12} — identical to
   `measure/c1-meter-green-at-data.json`. Every delta lane row re-derives
   (12/12 sha, lines, head all match). Pin authenticity: all 16 pinned heads
   exist and are ancestors of their repo's current HEAD (first pass flagged
   kotodama/binfor/rev-eng against `refs/heads/master`; those repos' active
   branch is `main`, which contains the pins — my check, not the meter's, used
   the wrong ref; against HEAD: 16/16 OK).
4. Ledger content: audit-r49 histogram `unchanged 10 / sibling-absent 6`
   (awk re-run); delta-r49 = 12 lane + 16 line rows; line dispositions
   `no-tabi-ground 12, contested-open 4` — all inside the frozen vocabulary.
   Ledgers at tip are byte-identical to `5fa18384` (diff-tree empty).
5. Correction budget: red-at-round-open receipt (digest-pinned, verified)
   shows 15 findings (11 head + 2 sha + 2 lines) at `10ea3d96`; correction-1's
   raced receipt `measure/c1-meter-red-at-data.json` shows 2 head mismatches
   (kotodama, shokunin-binary-forensics) at `eb89957f`; green at correction 2
   `5fa18384` — exactly the allowed two cycles. The first race's receipt
   having been overwritten in place is disclosed in the lesson; both surviving
   raced artifacts are committed.
6. Retarget diff: 47 lines; every hunk is a comment, a const
   (audit/delta r48→r49), or a schema string — verified by reading the diff.

### C2 operability — VERIFIED (live re-measured by the closure judge)

1. One live re-run with the **absolute path**, throwaway profile, per the
   closure note: staged the committed driver + host `.cs` (sha256
   `9b6fa47f…` / `13b2bc3d…`, both = frozen/pinned digests) in closure scratch,
   then `node webview2-cdp-loopback-round49.mjs --runtime
   "C:/Program Files (x86)/Microsoft/EdgeWebView/Application/156.0.4314.58"
   --loader "C:/Program Files/WSL/wslsettings/WebView2Loader.dll" --scratch
   <abs scratch> --out <abs receipt> --csc
   "C:/Windows/Microsoft.NET/Framework64/v4.0.30319/csc.exe"` → **exit 0**,
   `ok: true`, invocation-bound nonce `tabi-r49-c82c31971e78725f` echoed
   (`matches: true`), `Edg/156.0.4314.58` (the live runtime — the round's
   `.50` has since been auto-removed from the host; see observation D3),
   screenshot 8,393 B, `postKillSweepCount: 0`, `survivors: []`,
   `postSweepRecheckCount: 0`. Fail-closed teardown confirmed both by the
   receipt and by an independent process scan (6 host-wide msedgewebview2
   processes, none referencing the throwaway profile).
2. Committed counter (extracted bytes = frozen digest `21b0cd31…`) on **my**
   fresh receipt → exit 0, predicate true, **0 findings**.
3. `--path-selftest` re-run → exit 0, **6/6**.
4. Counter selftest over the committed fixtures → today exit 1 with
   `runtime-msedgewebview2-absent` added to every case's findings; all 8
   case intents still match exactly modulo that one environmental finding
   (see D3). The frozen receipt `measure/c3-counter-selftest.json`
   (digest = `claims.json` pin) records 8/8 at the freeze, when the pinned
   runtime existed.
5. Red control evidence-verified: `c2-v1-relative-scratch-red-*` digests
   match the frozen pins; the stdout receipt shows exit 1,
   `no-devtools-active-port` (waitedMs 15568), and the anchor listing shows
   the profile anchored at the host-exe directory with a live
   `EBWebView/DevToolsActivePort` — exactly the S160 contract. Cross-refusal
   receipts verified: r44 chrome receipt refused with 19 findings; r48
   counter refuses the r49 receipt with 4 (schema, profile-not-throwaway,
   nonce-shape, driver-pin-mismatch).
6. Counter on the committed C2 receipt → exit 1 today with the single
   environmental finding `runtime-msedgewebview2-absent` (D3); every
   receipt-content check passes.

### C3 coverage — VERIFIED (evidence-verified from committed per-page evidence; counter re-run by the closure judge)

1. `git ls-tree -r --name-only <REV> -- corpus/evidence/round49/webview2-nav
   | wc -l` → baseline `10ea3d96` **0**; data rev `36f8579b` **3**; tip **3**.
2. Committed receipt re-read: `nav.mechanism: "anchor-click"`,
   `crossPage: true`, `sameOrigin: true`, pages
   `http://127.0.0.1:61114/a.html` → `/b.html` (same origin, distinct URLs),
   titles "tabi-r49 nav fixture A/B", nonce `tabi-r49-1145c3ff25e00f2e`,
   `Edg/156.0.4314.50`, `postKillSweepCount: 0`, driver pin `9b6fa47f…`.
3. Per-page PNG pins re-hashed from committed bytes: page-a
   `506e83ee…623c9` = receipt pin (6,781 B); page-b `b7a98213…d6c3e8` =
   receipt pin and the receipt's main screenshot (7,002 B). Both match.
4. Counter with both nav legs on the committed evidence → every content
   check passes (driver/hostsrc pins, shot digests, nav legs); the only
   finding today is the environmental `runtime-msedgewebview2-absent` (D3).
   The frozen `measure/c3-counter-green-at-data.json` records exit-0 /
   0 findings at the data revision.
5. Residual supersession: the r48 note's Declared-residuals text is present
   at baseline (lines 84–85, wrapped) and the round-49 dated append at the
   tip supersedes it naming the evidence. See defect D1 for the report's
   misquoted counting command.

### Carry-in: orphan-evidence sweep — EMPTY conclusion VERIFIED; class arithmetic VERIFIED

- Re-census today: `git ls-files --others --exclude-standard` → **257**
  paths (the stale index accumulated r49's own 52 newly-landed paths since
  round open); `git cat-file -e HEAD:<path>` per path → **257/257 are blobs
  at the tip** — zero unlanded evidence.
- The 205 class re-derived exactly: of today's 257 "others", **205 are blobs
  already at the sweep's baseline `10ea3d96`** (comm -12 against the
  baseline tree) — the same 205 in-HEAD set the sweep classified at round
  open; 208 − 205 = 3 and 257 − 205 = 52 (r49's own paths, including the 3
  hygiene landings).
- The 3 named r44 receipts are **not at baseline** (cat-file -e, 3/3) and
  **are at the hygiene commit `6e080c17`**; `git grep` over all committed
  lane bytes at baseline → exit 1 (zero hits for all three names), and the
  fleet-side tabi reports r44–r48 → 0 hits each. The cited-but-uncommitted
  intersection is therefore **EMPTY**, as concluded.
- The standing selfassessment m3 mismatch (`observed=425`-class) is
  consistent with this artifact: `git status`-based instruments read the
  stale index's in-HEAD blobs as untracked. Index artifact, not unlanded
  evidence — disclosure accepted.

## 3. Discernment spot-check (non-author)

Sampled ≥1 admit and ≥1 reject from `corpus/lessons/round-49.md` `## Gate`;
each source re-opened.

| Item | Decision | Re-opened source | Agree/disagree | Reason |
|---|---|---|---|---|
| S160 (User data folder, Microsoft Learn) | ADMIT | Live URL re-fetched now: 87,802 B, sha256 `5c93b4fd…81f2` — **byte-identical** to the staged copy; sentence "On this platform, the default UDF location is the directory that the app executable (.exe) is running in" found **3×** in the raw bytes (`.exe` wrapped in `<code>` tags; the recorded quote is the rendered text, verbatim, 18 words ≤ 25; "The default UDF location" section present) | **agree** | Row tier A/scope honest; the exe-dir anchor is exactly what the C2 red control measured live; quote located and ≤25 words |
| C3 admit (capability + evidence) | ADMIT | My own §2-C3 re-check (ls-tree 0→3, PNG re-hash, counter nav legs, frozen at-data counter receipt) | **agree** | The capability demonstrably ran; evidence is counter-checked and re-derivable; row entered with first-working 49 |
| Reject: counter draft's two defects (block-scoped `norm`; port-blind loopback origin) | REJECT (the draft refused) | Counter bytes at tip: `norm` hoisted to function scope (line 72); origin compared **with port included** (`http://127.0.0.1${port}`); frozen selftest receipt 8/8 at the freeze | **agree** | Both described defect classes are real (the fixed shapes are in the committed bytes; the fixture harness is exactly what catches them); refusing the draft before any data relied on it is the right gate |
| Reject: pre-fix `--path-selftest` receipt (5/6 draft) | REJECT (the draft refused) | Runner bytes at tip: the dotdot case asserts on path **segments** (`segs.includes('a')`), not the whole resolved string; my `--path-selftest` re-run on the final bytes: 6/6 | **agree** | A test asserting on the whole resolved path (which contains the CWD's own letters) is a real test bug; supersession by the 6/6 receipt on the final driver bytes is the honest disposition |

`bash scripts/sources-census.sh validate --root <fleet-root> tabi` → **exit
0**, `tabi ok`, exactly the 22 pre-existing W04 duplicate-URL warnings (the
same set disclosed at start/end in `measure/census-start.txt` /
`census-end.txt`). The census validated the same bytes as the lane repo
(sha256 of `corpus/SOURCES.md` identical at both paths). Registry count
re-derived: `grep -cE '^\|…S[0-9]{3,}…\|'` → 159 at baseline, **160** at tip.

## 4. Per-axis verdicts

| Axis | Verdict | Evidence |
|---|---|---|
| adjacency | **improved** | C1 verified (§2): the regression gate re-bound at one snapshot and green at `5fa18384` within the frozen two-cycle budget; re-derived by the closure judge from the receipt's pins; score held 8 (no rubric authorizes a move) |
| operability | **improved** | C2 verified: the routed foot-gun closed measured-on-both-sides (v1-relative red with exe-dir anchor; v2 same-shape green — re-run live by me with absolute paths, keyed teardown to 0), absolute-equivalence control committed |
| coverage | **improved** | C3 verified: surface extended from a data:-URL page to cross-page HTTP navigation, capability row `webview2-http-cross-page-nav-windows` (first-working 49) enters the table with a demonstrated run; registry 159→160 with a held, re-opened row |
| depth | unchanged | No depth claim declared; SKILL.md untouched this round; no harm observed |
| freshness | unchanged | No freshness claim declared; the r48 note grew a dated append (supersession, not a rewrite); no harm observed |
| calibration | unchanged | No calibration claim declared; selfassessment disclosure continues honestly (m3 index artifact, explained by the sweep); no harm observed |

## 5. Trend verdicts (closure judge, agreeing with the lane)

- **expansion: improved** — capability row entered through a demonstrated,
  counter-checked run (re-verified live by the closure judge); S160 held and
  re-opened byte-identical; evidence set 0→3 committed files.
- **quality: improved** — the repair is measured on both sides plus an
  absolute-equivalence control; the counter family demonstrated two symmetric
  cross-refusals (19 and 4 findings, receipts verified); the adjacency gate
  survived two live head races inside its frozen budget and reads green
  against its pins; the three genuinely orphaned r44 receipts landed; no
  admitted entry failed its re-check (today's counter environmental finding
  is host drift, D3, and the lane's declared re-derivation path re-verifies
  green).
- **discernment: improved** — every after-state is an instrument output at a
  named revision; two real counter defects were caught by the fixture selftest
  before any data relied on the counter and are disclosed as mistakes with the
  failing first reads; the hygiene sweep refused to find work that wasn't
  there (EMPTY cited-but-uncommitted set) while landing the three orphans it
  did find; the correction flow consumed exactly its allowed budget. My
  spot-check agrees with the gate on the sampled admits AND rejects.

## 6. Routed defects / observations for the lane's next round (all status-neutral)

- **D1 (number-drift, report + SCORECARD C3 row + lesson Measurements):** the
  printed counting command `grep -c 'cross-page navigation were not
  exercised' corpus/knowledge/webview2-cdp-loopback-round-48.md` does **not**
  print `1` at the baseline — the residual sentence is line-wrapped there
  ("…were not\n  exercised", lines 84–85), so the command prints **0** at
  baseline and **1** at the tip (the supersession quote itself). The
  substantive before-state (residual text committed at baseline) and the
  supersession append are real and verified; only the quoted command/output
  pair is wrong. Fix next round as a named correction (new entries, never
  rewrites).
- **D2 (wording drift):** the report and commit message say the S160 row was
  inserted "inside the Registry table after S159"; the row actually sits
  **between S158 and S159**. The substantive requirement (inside the Registry
  table, never appended at file end) IS met — census and check-sources are
  clean at 160 rows — but the positional wording is wrong. Name the
  correction next round.
- **D3 (environmental drift, not a lane defect; routed as an instrument
  improvement suggestion):** WebView2 auto-update removed runtime
  156.0.4314.50 after the round (host now offers 155.0.4283.62 /
  156.0.4314.58). The r49 counter's `runtime-msedgewebview2-absent` check
  therefore fires on the committed receipts and adds one environmental
  finding to every selftest case today (intents still 8/8; the frozen
  at-freeze receipts are 8/8 and 0-findings). Suggestion for a future
  versioned counter: grade a missing pinned runtime as a declared
  could-not-evaluate class (per the gate standard's declared-codes rule) or
  bind the runtime expectation to a discovered live runtime, so the selftest
  stays runnable across auto-updates. The lane's own declared re-derivation
  path (re-run the committed runner; fresh nonce, fresh port) is what this
  closure used and it is green on the live runtime.

## 7. SHONEN note for the operator

No `[x]` exists anywhere and none was written by this closure. All four boxes
look fully checkable by a named non-author verifier: box 2's end-to-end runs
were re-executed by this closure (C2 absolute-path green, C3 evidence
re-verified); box 3's executor-test verdict is SUFFICIENT but its executor was
lane-dispatched, so a non-author re-run of the r49 runner's usage/`--path-selftest`
path would close it cleanly; boxes 1 and 4 carry resolvable pointers and held
this round. A promotion review is the operator's call; the artifacts are ready
for one.

## 8. Verdict

All three claims verify (C1 evidence-verified against snapshot pins after the
anticipated post-round race; C2 live re-measured; C3 evidence-verified from
committed per-page evidence with the counter re-run). No owned axis is harmed.
Defects D1–D3 are named above and are status-neutral. **Round 49: admitted.**
