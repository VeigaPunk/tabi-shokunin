author: hyaku closure (non-author integrator, zcode subagent (fresh session, non-author))

# tabi round 52 — non-author closure verifier spotcheck (2026-11-02)

Verifier: hyaku closure judge, fresh session, non-author of this round. Lane repo
`C:/Users/jpvei/.zcode/workspace/95b1ba4d-5089-47a4-9fd8-54adebbce2ae/fleet/tabi-shokunin`,
branch `master`, HEAD `7448a3a17772c47ac5afba04134b298a8a9ff8a0` (pushed). Baseline
`d24d31ea2c7a28f74ae41145446bb98e75b4bd0d`. Only index-free git was used on this host.
All instruments were run from bytes extracted with `git cat-file blob 7448a3a1…:<path>`
into the verifier scratch (`scratch/tabi-r52/closure-verify/`), never from the worktree.

## 1. Step-1 conformance — PASS

| Check | Result |
|---|---|
| Report committed by lane identity | `git log --format='%an %H' -1 -- .ufo/reports/round-52/tabi.md` (fleet repo) → `tabi-shokunin 1e99426e214a374281813baa240ed7ab1bb9429d` — lane identity, PASS |
| SHONEN heading | Report carries `## SHONEN` with one `[~]` line per SHONEN.md box (4/4) and `SHONEN: no [x] written`; committed `SHONEN.md` holds only `[~]` marks — PASS |
| Cited commits exist + ancestry | All 11 cited hashes (d24d31ea, 8016e67e, 62d0cd6e, c5846982, 11d6aeb3, 7d91d5e3, 9bda1741, 24efa072, 9d0757b7, 3ae7b891, 7448a3a1) `cat-file -e` OK and `merge-base --is-ancestor <h> refs/heads/master` OK — PASS |
| Pushed | `ls-remote origin refs/heads/master` → `7448a3a17772c4…` == local `refs/heads/master` — PASS |
| Dispatch digest | contract digest: launch 2026-11-01T21:49:48-08:00 base=d24d31ea2c7a; complete 2026-11-02T01:04:21-08:00 head=7448a3a17772 pushed=True — consistent with the commit chain (freeze 06:44→final 09:00 lane-local timestamps) — PASS |
| Not a marker | Report names committed work with checkable hashes, commands, and receipts — real report — PASS |
| Write scope | `diff-tree -r --name-status d24d31ea 7448a3a1` → 102 paths, all lane-owned (lane repo files + `.ufo/waves/round-52/` artifacts + `corpus/evidence/round52/`); no sibling-owned file touched — PASS |

Conformance defects: none. (Two status-neutral cosmetic items are recorded in §6.)

## 2. Claim C1 — adjacency (meter v12 re-bind) — VERIFIED (evidence-verified from committed receipts; no live re-run, per closure contract: sibling heads have advanced since 7d91d5e3)

The claim rests on the lane's own meter; per the gate standard I verified the committed
evidence (self-test tally, frozen-run receipts, the revision each names) and did not
execute a live run. Every number below was re-read from committed bytes at
7448a3a1 (frozen digests re-hashed by me where claims.json pins them).

- Frozen digests match committed bytes: `sha256sum` over `git cat-file blob 7448a3a1:…` —
  `c1-adjacency-host-v12.mjs` → `8789ac3f…7843` == claims.json pin; red control
  `controls/c1-meter-v11-red-at-round-open.json` → `9f7946b1…3a9` == pin; diff
  `controls/v11-v12-meter.diff` → `880b9c54…edc` == pin. PASS.
- **Red control** (round open, before any lane write, rev d24d31ea): predicate=false,
  findingCount=9 — findings exactly: `audit-note-moved-line` +
  `audit-status-mismatch` on `kumitate-shokunin@89cbd998…:SCORECARD.md:1723`, plus
  `lane-screen-head-mismatch` × 7 (chousa, kengaku, mori, shokunin-binary-forensics,
  shokunin-reverse-engineering, tameshi, tsukuroi); ZERO sha/lines/quote findings.
  Matches the reported before-state exactly. PASS.
- **Raced receipts** (the frozen correction flow's two consumed cycles):
  `c1-meter-raced-at-correction0.json` (rev 62d0cd6e, 1 finding: tsukuroi-shokunin) and
  `c1-meter-green-at-correction1.json` (rev c5846982, 1 finding: mori-shokunin) — both
  committed, both predicate=false. Matches the report. PASS.
- **Green** (`c1-meter-green-at-correction2.json`): rev `7d91d5e31d448230578a06f63f566188c39706a2`,
  predicate=**true**, findingCount=**0**, counts {roster:16, mapRows:16, auditRows:16,
  deltaLanes:12}; the receipt's `predicateSentence` leads `c1-adjacency-host-v12 admits…`
  (the routed R51-V1 token, fixed in the emitted output). PASS.
- **v12 selftest** (`measure/c1-meter-v12-selftest.json`): schema tabi-adjacency-host-v12-selftest,
  allPass=true, cases=16, pass=16. PASS.
- **Pure-core byte-identity v11→v12**: I re-derived `diff` between
  `.ufo/waves/round-51/counters/c1-adjacency-host-v11.mjs` and the committed v12 myself
  (not via the committed diff file). Changed hunks: header comments (v11→v52 narrative),
  `AUDIT_REL`/`DELTA_REL` r51→r52, schema strings (`tabi-adjacency-host-v11…`→`…v12…`,
  error/selftest/output), usage strings, the header `PREDICATE-SENTENCE` comment token
  (v7→v12) and the emitted `predicateSentence` leading token (v10→v12; sentence BODY
  otherwise unchanged). No verify/selftest/parse hunk. Matches
  `controls/v11-v12-meter.diff` and the claim's "differs ONLY in" enumeration. PASS.
- **R51-V1 fix measured** (`measure/c1-emitted-token-check.txt`): v11 emitted line 374
  leads `c1-adjacency-host-v10`, v12 emitted line 380 leads `c1-adjacency-host-v12`;
  header comment line 57 led v7, line 63 leads v12; the one v10 occurrence left in v12
  is the delta comment quoting the historical defect (line 49) — documentation. PASS.
- **Do-nothing reachability**: the red control IS the do-nothing state (re-running the
  inherited meter); green required the re-bind at a fresh snapshot (7 head re-pins + the
  kumitate moved-row re-adjudication) which no do-nothing control performs. The claim
  clears §9 sizing. PASS.
- **Ledgers bound at one snapshot**: `corpus/adjacency-host-audit-r52.tsv` (16 rows) and
  `corpus/adjacency-host-delta-r52.tsv` (12 lane rows + 16 line rows) committed at
  62d0cd6e; snapshot receipt `measure/c1-snapshot-at-rebind.json` committed. Dispositions
  carried by exact whole-line quote match, 0 new adjudications (audit statuses unchanged
  per the correction commit messages; the kumitate row honestly moved with the
  meter-derived note). Consistent. PASS.

**C1 verdict: VERIFIED** (evidence-verified). adjacency 8 → 8 (held; no rubric authorizes
a move — the SCORECARD states this explicitly).

## 3. Claim C2 — coverage (per-key key-event typing trace) — VERIFIED (re-measured live by the verifier)

Per the closure contract I re-ran the committed runner once myself, scored the fresh
receipt with the committed counter, ran the counter's 50-case fixture set, and ran both
cross-refusals. All instruments were the committed bytes (digests re-hashed first).

1. **Before→after count**: `git ls-tree -r --name-only d24d31ea -- corpus/evidence/round52 | wc -l`
   → **0**; same at 7448a3a1 → **7** (receipt.json + 6 per-step PNGs). Matches. PASS.
2. **Runner path-selftest**: `node scripts/webview2-cdp-loopback-round52.mjs --path-selftest`
   → exit 0, allPass=true, 6/6 cases. PASS.
3. **Live re-run of the committed runner** (fresh scratch, throwaway profile
   `tabi-r52-wv2drv-<hex>-profile`, `--journey --form`, runtime
   `…EdgeWebView/Application/156.0.4314.58` — the receipt's runtime still installed):
   **exit 0**, `failures: []`, `postKillSweepCount: 0`; fresh nonce
   `tabi-r52-327b58583c6f901c` (shape `tabi-r52-<16hex>`); 6-leg journey
   Page.navigate /a.html → anchor-click /b.html → /c.html → navigateToHistoryEntry
   /b.html (targetIndex 2, history 4/3 at C) → anchor-click /form.html → form-submit
   `/echo?field=tabi-r52-327b58583c6f901c`; `journey.form.mechanism`
   `dispatchKeyEvent+submit-click`; `valueBeforeFirstKey` `""`; **25 typing entries**
   (i 0→24, char/code/VK per character — first `{t, KeyT, 84, "t"}`, last
   `{c, KeyC, 67, "tabi-r52-327b58583c6f901c"}`); `keyEventCount` **50**;
   `allPrefixTrue` true; `filledValue` == `fieldValueAfterTyping` == `valueOnEchoPage`
   == the nonce; `serverSawField` true. Six per-step PNGs written (5.3–9.0 KB). The
   committed round receipt (`tabi-r52-48b62c227a28283d`) records the identical shape.
   **The live surface reproduces the round's evidence.** PASS.
4. **Counter over the FRESH receipt**: `node .ufo/waves/round-52/counters/webview2-receipt-r52.mjs
   <fresh receipt> --shot … --png-a … --png-b … --png-c … --png-form … --png-echo …
   --driver scripts/webview2-cdp-loopback-round52.mjs --hostsrc scripts/webview2-host-round48.cs`
   → **exit 0, predicate=true, findingCount=0, couldNotEvaluate []**. The counter
   re-derived every typing entry's code/VK from the fresh receipt's own nonce and
   checked all 25 prefixes. PASS.
5. **Counter over the COMMITTED receipt**: exit 0, predicate=true, findingCount=0,
   couldNotEvaluate [] (re-run of the report's after counting command). PASS.
6. **50-case fixture selftest**: `node .ufo/waves/round-52/counters/webview2-receipt-r52.mjs
   --selftest .ufo/waves/round-52/counters/webview2-receipt-r52-fixtures` → **exit 0,
   allPass=true, cases=50, pass=50**, no failing case. (Verifier harness note, not a
   lane defect: the selftest resolves the pinned driver/hostsrc five directories above
   the fixtures dir, i.e. it assumes the lane repo layout — run it inside a faithful
   repo-root layout or it reports `pin-file-unreadable`. A one-line usage note in the
   next counter generation would spare the next verifier.) PASS.
7. **Cross-refusals (symmetric)**: r51 counter on the r52 receipt → **exit 1, 6
   findings**: schema, profile-not-throwaway, nonce-shape, driver-pin-mismatch,
   form-mechanism, form-field-value. r52 counter on the committed r51 receipt →
   **exit 1, 6 findings**: schema, profile-not-throwaway, nonce-shape,
   driver-pin-mismatch, form-mechanism, **typing-missing**. Both match the reported
   findings exactly; both directions refuse. PASS.
8. **Teardown**: `tasklist | grep webview2-host` → no survivors after the verifier's
   own run; the receipt's postKillSweepCount is 0. PASS.
9. **Capability row**: `webview2-keyevent-typing-windows` enters the SCORECARD
   capabilities table with first-working round 52 and an evidence pointer to the
   runner/receipt/counter/note — the demonstration ran (this verifier re-ran it). PASS.

**C2 verdict: VERIFIED** (re-measured). coverage 9 → 9 (held; capability acquired).

## 4. Round hygiene (not a claim) — the v4 gate chain and the repairs — VERIFIED

Committed receipts (all read from committed bytes):

| Receipt | Summary line |
|---|---|
| `measure/c3-gate-at-work.txt` | `SELFASSESSMENT verdict=failed rev=9bda1741… mismatches=7 could_not_evaluate=167 superseded=43` |
| `measure/c3-gate-at-addendum.txt` | `SELFASSESSMENT verdict=failed rev=24efa072… mismatches=43 could_not_evaluate=236 superseded=45` |
| `measure/c3-gate-at-repair.txt` | `SELFASSESSMENT verdict=failed rev=9d0757b7… mismatches=4 could_not_evaluate=171 superseded=45` |
| `measure/c3-gate-v4-at-final.txt` | `SELFASSESSMENT verdict=clean rev=3ae7b891… mismatches=0 could_not_evaluate=178 superseded=43` |

The chain 7 → 43 → 4 → clean 0 matches the report beat for beat; the three failed
passes are kept and named, never quoted as verdicts; the clean verdict names the rev it
measured.

**Repair byte-exactness (verifier re-derived, byte level):**

- Repair 1 (9d0757b7): rebuilt SCORECARD.md == the 9bda1741 blob **+ exactly one
  addendum** (776 bytes; prefix equality verified TRUE), SKILL.md == base blob + one
  addendum (578 bytes; prefix equality TRUE).
- The doubled commit (24efa072): SCORECARD blob measured 611,355 B ≈ base +
  boundary-newline + full new content — i.e. the full content truly landed twice
  (the append-mode authoring bug as described), which is what pushed the gate's
  line-scoped findings past the true EOF (mismatches=43).
- Repair 2 (3ae7b891): SCORECARD rebuilt with the tally + marker + all four citations on
  ONE physical line (first byte differing from the 9d0757b7 blob is at 305,533 — inside
  the addendum region only); SKILL.md untouched (9d0757b7 SKILL == 3ae7b891 SKILL ==
  HEAD SKILL, sha256 `63e4d036…`).
- Final state: SCORECARD at 7448a3a1 == SCORECARD at 3ae7b891 (sha256
  `9d05756b…`); SCORECARD diff baseline→HEAD is ONE hunk, **+68/−0, purely additive**
  (append-only discipline held through the whole round, repairs included).
- `measure/adjacency-selftest-at-work.txt`: `ADJACENCY_SELFTEST verdict=clean cases=64
  reasons=18 could_not_evaluate=6`, 64 `verdict=pass` lines — the oracle-correct 64 the
  supersession line cites. PASS.

## 5. Harm check, scorecard, LOG, frontier

- `diff-tree -r -p d24d31ea 7448a3a1 -- SCORECARD.md`: one purely-additive hunk; the
  round-52 block records C1/C2 VERIFIED with counting commands and measured revisions;
  no earlier row edited, no score moved (adjacency 8→8, coverage 9→9, others held 9;
  saturation 8/window 3 retained, window restarted by the r52 capability row).
- LOG.md round-52 entry present and ties every landed change (freeze, C1 data,
  corrections 1–2, C2 data, work, addendum, repairs, receipts-only final) — matches the
  report's Landed changes list. PASS.
- PROVINCE.md gains the round-52 runner line + the standing concurrent-fleet head-race
  note; no refusal route removed. PASS.
- Frontier: SOURCES registry 160 → 160 (no new row; S153 re-opened in place — the
  contract-conformant act this round); S153's used-by extended in place with the two r52
  paths, old→new logged in the lesson (verified in the lesson text and the SOURCES
  diff — only the used-by cell changed). Knowledge notes 67 → 68
  (`ls-tree corpus/knowledge | wc -l`: baseline 67, HEAD 68); the new note opens with
  the provenance trio (source: S153 … / verified-at: … / recheck: …). PASS.
- Census: committed start AND end receipts `tabi ok` with the 22 pre-existing W04
  duplicate-URL warnings; verifier's own run of
  `bash <fleet>/scripts/sources-census.sh validate --root <fleet> tabi` → **exit 0,
  `tabi ok`**, same 22 W04 set. PASS. `check-sources-at-work.txt`:
  `SOURCES_GATE verdict=clean rows=160 tiers=A:144,B:7,C:9
  status=queued:15,mined:135,rejected:10 findings=0`. PASS.

## 6. Discernment spot-check (non-author, outside the lane)

Samples: two admits + two rejects from `corpus/lessons/round-52.md ## Gate`, plus the
round's source act (S153 re-open — no new row this round, so the re-opened row is the
checked row; its ≤25-word quote checked).

| Item | Decision | Re-opened source | Agree/disagree | Reason |
|---|---|---|---|---|
| C2 typing trace + capability row | ADMIT | The committed runner/counter/fixtures re-executed live by this verifier (fresh nonce, 25 keystrokes, 50 events, counter green, cross-refusals symmetric) | **agree** | The per-keystroke prefix trace is real delivery evidence the r51 shape could not carry; the capability demonstrably runs (this verifier ran it), verifies, and its row entered the table in the same round |
| S153 re-open (the round's located ground) | ADMIT | Fresh fetch by this verifier: `curl raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json` → 1,421,620 B, sha256 `f60f0c0263c6f880…eb3f2` == the registered anchor == the committed staged copy; "Dispatches a key event to the page." verbatim, 1 hit in the opened bytes | **agree** | Fourth byte-identical fetch confirmed independently; the quote is 8 words, location-grounded, and is exactly the primitive the fill leg rides |
| C1 v12 re-bind + green | ADMIT | Committed receipts re-read (red 9 findings → raced 1 → raced 1 → green 0 at 7d91d5e3; selftest 16/16; my own v11/v12 re-diff) | **agree** | Every after-state is an instrument output at a named revision; the diff is confined exactly as claimed; the red control is a genuine do-nothing state and green required the re-bind work |
| insertText fill as typing evidence going forward | REJECT | The fresh live trace run vs the committed r51 receipt's before/after-only shape | **agree** | The r51 witness cannot distinguish per-keystroke delivery from a value-set or a dropped key; the rejection is grounded in what each evidence shape can carry, and the r51 receipts stand as landed (nothing retroactively voided) |
| First fixture authoring pass (49/50) | REJECT | The committed 50-case fixture set re-run by this verifier (50/50) incl. the corrected `paths-absolute-not-identity` case | **agree** | A fixture whose mutation produces no finding is not a refusal fixture; the counter's own selftest caught it before the freeze, the fix landed before the freeze, and the overwritten failing receipt is disclosed in the lesson |

Census and SOURCES row checks: see §5 — validator exit 0, S153 used-by extension logged
old→new, quote ≤25 words. No disagreement found; no lesson owed from this spot-check.

## 7. Trend verdicts (verifier's, evidence-checked)

- **expansion: improved** — 0 → 7 evidence files on the round52 tree (re-counted); the
  capability row `webview2-keyevent-typing-windows` enters the table through a
  demonstration this verifier re-ran; knowledge notes 67 → 68 (re-counted); S153's held
  row extends its located ground to `Input.dispatchKeyEvent` (re-fetched byte-identical).
- **quality: improved** — the regression gate absorbed two concurrent sibling-commit
  races inside its pre-declared correction flow with both raced receipts committed
  (re-read) and green at 7d91d5e3 with zero byte drift; the routed R51-V1 fix is
  isolated to the emitted sentence in a versioned bump (re-diffed); the counter ships
  50 hand-declared fixtures with exact-findings assertions (re-run 50/50) and both
  cross-generation refusals measured symmetric (re-run); six stale tallies real since
  r48 surfaced and were superseded, ending verdict=clean mismatches=0 at 3ae7b891 with
  the repairs restoring byte-exact state (re-derived at byte level).
- **discernment: improved** — every after-state is an instrument output at a named
  revision; the two head races, the 49/50 fixture pass, the v12 header defect, the
  receipt mojibake, the birth-name drift, and the doubling + wrapped-citation beats are
  all disclosed with kept-and-named receipts and mined as Mistakes rows (lesson re-read:
  5 rows + the folded doubling row); the two repairs name the commits they supersede;
  the clean verdict names the rev it measured. The outside spot-check (this file)
  agrees with the gate on the sampled admits and rejects.

## 8. Per-axis verdicts

| Axis | Verdict | Basis |
|---|---|---|
| adjacency | improved | C1 VERIFIED (evidence-verified): gate generation re-bound green at 7d91d5e3 through two disclosed correction cycles; routed carry-in R51-V1 fixed; score held 8 (no rubric authorizes a move) — the axis's evidence base improved, nothing absorbed |
| coverage | improved | C2 VERIFIED (re-measured live): per-key typing trace capability runs, verifies, cross-refused symmetrically; evidence 0 → 7; capability row first-working 52; score held 9 |
| depth | unchanged | No claim targeted it; SKILL gained only the tally-supersession paragraph; no entry falsified |
| operability | unchanged | No claim targeted it; the new runner/counter are covered by the C2 capability move; nothing regressed |
| freshness | unchanged | No claim targeted it; S153's re-open and the live re-run are freshness activity recorded under C2/SOURCES, not a freshness axis move; nothing went stale-unmarked |
| calibration | unchanged | No claim targeted it; the self-assessment gate ended clean mismatches=0 at 3ae7b891 with the chain disclosed — consistent, no score move claimed |

No axis harmed. No exploratory claim this round (none declared), so no
`unprovable-but-better` judgment is owed by this verifier.

## 9. Routed defects / notes for the operator (all status-neutral; none bars admission)

1. **claims.json C2(d) prose drift**: the frozen predicate says "48 refusal fixtures
   including **9** typing-trace refusals" then lists **10** ids (typing-missing,
   typing-length, typing-char, typing-vk, typing-code, typing-prefix, typing-index,
   typing-value-before, typing-event-count, typing-field-value). The report, lesson,
   SCORECARD and the fixture tree itself all say/have 10, and the selftest asserts exact
   findings per case and passes 50/50 — no measurement binds the "9". Cosmetic; fix the
   count if claims.json prose is ever quoted forward.
2. **SHONEN operator note (protocol duty 6)**: all four SHONEN.md boxes are `[~]`
   lane-asserted with resolvable pointers. From this verifier's non-author position the
   boxes look fully checkable — box 2's end-to-end task is the live 6-leg journey this
   verifier re-executed; box 3's instructions (runner/counter usage + 50-case selftest)
   were executed by this fresh session without oral context; boxes 1 and 4 spot-read
   conformant (SKILL decision tables/checklists/citations present; PROVINCE still
   accurate after the round-52 line). A non-author `[x]` remains available to the
   operator's promotion review.
3. **Harness note for the next counter generation** (not a lane defect): the receipt
   counter's `--selftest` resolves its pinned driver/hostsrc five directories above the
   fixtures directory — it silently reports `pin-file-unreadable` when run from a
   non-repo-root layout. A one-line usage note (or a repo-root auto-detect) would spare
   the next verifier a red herring.
4. Carry-in status: both r51-closure routed items are discharged on the record
   (R51-V1 fixed and measured; the `tabi | round-44` L2-floor L0 remains open and
   routed around per the standing PROVINCE.md disposition line — still not treated as
   answered). The routing queue has no open item against this lane from this closure.

**Closure verdict: tabi round 52 status ok, ADMITTED** — both claims verify (C1
evidence-verified, C2 re-measured live by this verifier), no axis harmed, trends
improved/improved/improved, hygiene chain reproduced end-to-end.
