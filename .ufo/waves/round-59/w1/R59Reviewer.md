# Round 59 w1 — R59Reviewer attack report

Seat: R59Reviewer (read-only attack + two routed tasks). Authority:
`.ufo/waves/round-59/claims.json` as amended pre-data (commits dd337bb3 → 03f64a39:
preDataCorrection counts 19→20/16→20; C2 restatement to the measured-negative
delivery-boundary claim after the runner's live caps-bit probe; critic pins P1/P2/P3,
mutantsC1 M1..M6, C2 forgery-probe scope f1–f8). Never amended by this seat.
Baseline `4e7fb89d`; lane HEAD at review start `03f64a39`. Scratch:
`/fast/scratch/hyaku/tabi-r59/R59Reviewer/` (deleted before yield; every citable
receipt is copied into `reviewer/`).

## Bottom line

- **No finding kills either claim.** Both frozen (restated) claims' instruments exist,
  are internally coherent, and every enumerated kill surface this office could attack
  stayed red; both green baselines re-derived.
- **One real instrument defect was found and fixed pre-freeze:** the first v19 bytes
  (sha `cc11af86…`, 18:06) had a **self-masking harness guard** — the routed N1/M1
  findings-term drop survived its own guard cases by construction. The 18:08 revision
  adds the `direct` term outside the caseOk verdict path; this office rebuilt the M1
  mutant on the final bytes → KILLED (35/37). A6/A3 below.
- **Named for the next generation (no kill):** the (d) screen set's file-level boundary
  (18,869 out-of-screen BG lines in sibling .md files, live); the `isSafeInteger`
  parse-hardening assertion is un-pinned by any case (M2′ survivor); the runner's
  URL-toggle refusal list still misses `document.URL`/`documentURI`/`history.state`
  (unrouted r58 residual, mitigated by the counter's driver-sha pin).

## Snapshot state

| object | sha256 (state attacked) | notes |
|---|---|---|
| `.ufo/waves/round-59/counters/c1-adjacency-host-v19.mjs` | `7c4e4b5d2c909f68…` | stable across two checks 65 s apart; selftest 37/37 |
| `.ufo/waves/round-59/adj/rebind-r59.mjs` | `577fef0019362ed1…` | stable; pins BG_WORDS/DISPOSITIONS to v19's literals (fail-closed) and stamps meterSha256 |
| `scripts/chrome-cdp-loopback-round59.mjs` | `b16ddb443d5bd1b1…` | path-selftest 24/24; smoke1/smoke2 receipts pin the same sha |
| `.ufo/waves/round-59/counters/chromium-receipt-r59.mjs` | `35461bbeb9e26981…` | stable across two checks 65 s apart; selftest 90/90, idCoverage 58/58, 0 uncovered/0 stray |
| `counters/v18-v19-meter.diff` | `563f1268aa53709a…` | matches the sha pinned in `adj/v19-line-audit.txt` |
| `.ufo/waves/round-59/runner/probe-capslock.mjs` | `7e3c1d7c5ec21c96…` | matches the pin inside the committed probe receipt |

Every C2 verdict below is for these bytes. No tool was installed (none needed); only
read-only git subcommands were run against the lane and siblings; the only browser
artifacts touched were the runner seat's committed smoke/probe receipts (this seat
launched no browser, ran no live data pass, committed nothing).

## A. Attacks on the frozen claims

Verdict key: **FB** = failed-to-break; **AS** = attack-succeeded; **PEND** = bytes not
yet landed at report time.

| # | claim / clause | verdict | evidence |
|---|---|---|---|
| A1 | C1 before: v18 at baseline red at round open | FB (caveat) | Re-ran the frozen BEFORE command read-only: exit 1, predicate false — but **findingCount 6**, not the frozen 4 (kasegi-shokunin gained `lane-screen-sha-mismatch` + `lane-screen-lines-mismatch` after round open; the four original head-mismatch lanes all still red). Live-fleet drift; the round-open receipt (`controls/c1-meter-v18-at-round-open.json`, 4 findings) is the only exact anchor and matches its own claim. Point-in-time caveat, same class as r58 A6. Receipt: `reviewer/v18-before-rerun.json`. |
| A2 | C1 newSurfaceBefore; C2 ls-tree; C2 counterRefusal | FB | `git show 4e7fb89d:corpus/adjacency-host-delta-r58.tsv \| grep -c 'kagi\|kake\|kama'` → **0**; `git ls-tree -r --name-only 4e7fb89d -- corpus/evidence/round59 \| wc -l` → **0**; r58 counter on an absent receipt → exit 1, `findings [receipt-missing]`, `couldNotEvaluate [{check receipt-load, code receipt-absent}]` — byte-shape identical to the committed control (`reviewer/c2-absent-rerun.json`). |
| A3 | C1 kill clause "findings-term drop survives the harness guard (N1 not actually killed)" | **AS → fixed pre-freeze** | First v19 bytes (`cc11af86…`): the guard cases were run()-only; a caseOk mutant dropping `okFindings` evaluates the guard's synthetic finding through the mutant itself → case verdict stays true → M1 survives the selftest by construction. Evidence of the first state: first-copy selftest receipt (guard cases carry no `direct` field) and the superseded first-copy diff in this seat's scratch history. The 18:08 revision adds `direct`, evaluated outside caseOk. Rebuilt M1 on FINAL bytes (drop `okFindings` from caseOk; mutant sha `802e4c05…`, builder `reviewer/m1-current.mjs`): 35/37, failing exactly the two findings-mismatch guard cases → KILLED (`reviewer/m1-current-selftest.json`). Fix landed before the instrument freeze; no data had scored. |
| A4 | Routed task 1: independent v18→v19 re-diff | FB | Comment-stripped diff of final bytes: **0 differing non-comment lines outside (a)–(e) + critic pins**; host layer untouched; CONCORDANT with the meter seat's `adj/v19-line-audit.txt` (284 lines; (a)14 (b)23 (c)12 (d)80 (e)155; 0 unaccounted). Files: `reviewer/v19-independent-logic.diff`, `reviewer/v19-independent-rediff.txt`. |
| A5 | Routed task 2: mixed-forgery (real rows + junk rows) | FB | Live v19 on a scratch fleet/tab-repo harness (honest baseline GREEN first): j1 junk non-hit quotes on two screened files → exit 1 `delta-line-invented` ×2; j2 hit-line text quoted at a non-hit line → exit 1 `delta-line-invented`; j3 real hit text of a NEVER-screened file → exit 1 `line-row-unscreened-file`; extend (honest full adjudication of the unscreened file) → GREEN (ledger additions extend the screen; omissions are what get caught); residual (the unscreened file left unadjudicated) → GREEN, the file-level boundary named in A6. Receipts: `reviewer/mixed-forgery-attack.json` (+ `mf-baseline/j1/j2/j3/extend.json`). The selftest's `kama-mixed-forgery` case pins the same hole for kama-shaped lanes. |
| A6 | C1 (d) AFTER-scope: unadjudicated BG content outside the enumerated set | AS (structural, named for next gen) | The (d) screen set is PROVINCE.md ∪ map-referenced files. Live read-only scan at sibling HEADs (lean .md scan): **18,869 BG-word lines in sibling .md files OUTSIDE the screen set** (bulk in `.ufo/waves/**` seat history + non-referenced corpus files; e.g. kake corpus/knowledge/*, every lane's LOG/README), vs **12 lanes with ≥1 in-screen hit** — exactly matching the critic pin's "12 at the authoring heads". Not a claims violation ((d) is frozen to this set); it is the D8 surface's boundary, the file-level successor of r58's lane-level A4. Receipt: `reviewer/live-scan-md-out.txt`. |
| A7 | Runner URL-toggle refusal (r58 reviewer's unrouted residual) | AS (carried) | A scratch copy of the r59 runner with `var bypass = document.URL; var bypass2 = document.documentURI; var bypass3 = history.state;` injected into the fixture still passes `--path-selftest` **24/24** (`reviewer/runner-docurl-selftest.json` — byte-identical to the unmodified run's receipt, `reviewer/runner-path-selftest.json`, which is itself the demonstration). The channel list remains the six r58 names. Mitigation: the counter pins the driver by sha (f3), so a fixture-tampered driver cannot green a committed receipt; the residual only weakens the runner's own self-attestation layer. Not routed by the r58 closure; carried silently into r59. |
| A8 | C2 after-state (restated): all f1–f8 shapes, D1, D2, cross-refusals | FB | Battery from the committed smoke1 bytes against the counter: f1 schema → `schema-wrong`; f2 renamed step → `step-plan-mismatch`; f3 driver sha → `driver-sha-mismatch`; f5 caps true anywhere → `caps-flag-true`; f5b missing capsLatchExpected → `caps-flag-true`; f6 deleted keyCode on a CapsLock event → `missing-delivered-shape-field`; f7 doubled /echo2 → `echo2-count-wrong`; f8 declaredStepNames edited → `step-plan-mismatch`; f8b missing PNG on disk → `png-missing`; **f4b forged PAGE keylog (block intact) → `keylog-flag-mismatch`** (the kill rule's explicit mutant). Control: unedited smoke1 → GREEN exit 0; smoke2 → GREEN exit 0. D2 is anchored to the counter's EMBEDDED 18-name plan (editing both receipt fields does not help). D1 is a global BY-VALUE (key, cancelable, defaultPrevented) match against journey.form.pageKeylog; a block-side dp flip (f4) trips the carried domain pin `swallow-defaultprevented-missing` instead — block+page CONSISTENT forgeries stay closed by the domain pins, not by D1 alone (the disclosed byte-perfect-replica residual is the only surviving class). Files: `reviewer/f-probes-results.json` (+ forged/ verdicts in scratch, summarized in the JSON). |
| A9 | C1 (c) parse hardening depth | AS (named for next gen, no kill) | Mutant weakening ONLY the finite-integer assertion to `Number.isNaN(ln)` (regex kept; mutant sha `e4910de9…`): 37/37 → **survives**. No case feeds a digits-only-unsafe suffix or `:0`. The FROZEN (c) shapes and the frozen M2 definition are still killed (they die on the regex), so the claim's obligation is met as written; the assertion itself wants one more case. Receipt: `reviewer/m2-current-selftest.json`. |
| A10 | M6 spot-check (independent) | FB | Vocabulary gut (drop selenium/playwright/headless; mutant sha `82e4f2f7…`): 32/37, failing exactly the five kama cases → KILLED (`reviewer/m6-current-selftest.json`). The D8 enumerating power is kill-pinned. |
| A11 | C1 do-nothing reachability | FB | v18 reads the r58 ledger NAMES hardcoded, so even a completed rebind cannot green it (structurally red — my harness twin run: v18 green only on r58-named copies, red on r59-named equivalents with identical content). The rebind refuses an in-corpus --out, aborts (exit 3) on any unresolved hit line before writing, and preflights through the v19 core (exit 5 on findings); its rehearsal receipts show the abort path was exercised (37 unresolved → adjudicated via 109 explicit + 31 carried → v19 preflight predicate true, counts {roster 20, mapRows 16, auditRows 16, deltaLanes 20, bgScreenSiblings 20} — exactly the corrected claims numbers, derived not hardcoded). |
| A12 | C2 do-nothing reachability | FB | No receipt, no green: the counter refuses an absent receipt (A2); a file-copied tree fails f1–f8 unless it is a byte-perfect replica (the disclosed residual — genuineness rests on the L1 live pass); the boundary probe receipt and its script are committed with matching pins. |
| A13 | Relabel completeness (meter + counter) | FB | v19: r58 appears only in lineage/changelog comments (6 comment lines) and in no schema/path/output string. Counter: one non-comment r58 mention, a diagnostic string naming "the r58 swallow and r59 capslock names" — semantically correct lineage reference, not a relabel defect. SCHEMA `tabi-chrome-cdp-r59`, NONCE_RE `^tabi-r59-[0-9a-f]{12}$`. |
| A14 | C2 cross-refusals symmetric | FB | r59 counter on the committed r58 receipt → exit 1, findings `[schema-wrong, nonce-shape, driver-sha-mismatch]` (schema-wrong FIRST) (`reviewer/xr-r59on58.json`); r58 counter on the r59 smoke1 receipt → exit 1, findings `[schema-wrong, nonce-shape, driver-sha-mismatch]` (`reviewer/xr-r58on59.json`); r58 counter on its own committed receipt stays GREEN (sanity, `reviewer/sanity-r58-green.json`). |
| A15 | Restated C2 ground truth (probe receipt) | FB | `runner/probe-capslock.json`: CapsLock events deliver (key/code CapsLock, keyCode 20, cancelable true, defaultPrevented false) while `capsLock` reads false on EVERY record; the differential Shift chord reads `shift` true (the recorder can see true when the bit is mappable); probe script committed beside the receipt with matching sha; throwaway profile dir + `--disable-extensions` in the recorded argv; no `/home/…` in argv. |
| A16 | Runner live witnesses (smoke1/smoke2, pre-data rehearsal) | FB | Both smoke receipts: 18 steps = declared 18; all 18 PNG shas match the files on disk; caps `true` occurs 0 times in either receipt; capsLatchExpected false / observedAllFalse / capsLatchOk true; exactly one `/echo` AND one `/echo2`; teardown survivors [] / postKillSweepCount 0. |
| A17 | C1 kill receipts M1..M6; C2 f-kill receipts | PEND | `mutant-meter/` and `mutant-counter/` were still empty at report time (seats running). This office's independent kills: M1 KILLED (A3), M6 KILLED (A10), M2′ SURVIVOR disclosed (A9), f1–f8 all red (A8). The seat receipts remain the round's pinned artifacts; any SURVIVED verdict there must be disclosed, never smoothed. |

## Kill-rule clause walk (attack line 4)

**C1** (every clause → implementing check): selftest all-pass → the selftest (37/37);
surviving-mutant kill receipts → M1..M6 receipts (PEND) + this office's M1/M6 kills;
diff-audit clause → meter's diff+line-audit AND this office's independent re-diff
(furnished, concordant — the clause's own routing); 2-cycle red → L1 process rule
(no instrument can implement it; named as such); head-citation (generalized) →
lane rows bind `head` vs the meter's own snapshot + line-row quotes re-derived per
file bytes at that snapshot (`kama-head-citation` case + A5/j3 live); N1 findings-drop
→ the `direct` term + two guard cases (A3); N4 orphan/unscreened →
`orphan-line-row` / `line-row-unscreened-file` (selftest + live j3); newly screened
lane head-citation → `kama-head-citation`. **No orphan clause.**

**C2** (restated, enumerated f1–f8): f1 → schema check (carried); f2/f8 → D2 vs the
counter-embedded plan + png basename rule; f3 → driver-sha vs bytes + `--expect-driver-sha256`
pin; f4 → D1 global by-value page-vs-block (+ domain pins for block-side flips, A8/f4);
f5 → caps-flag-true (named expectation + any-true guard, S162-grounded);
f6 → delivered-shape per CapsLock/letter event; f7 → /echo AND /echo2 exactly-one
counts; D4 presence → form2 contract + echo2Witness + `form2-swallower-refused`/
`form2-contract-green` path-selftest cases. Residual (byte-perfect replica) disclosed
in the claims and confirmed structurally unavoidable for a file-only counter.
**No orphan clause; the pre-restatement latch-sequence clause no longer exists to
implement (restated claim, disclosed pre-data).**

## Verification gaps

- `mutant-meter/M1..M6-kill.json` and the mutant-counter f-receipts had not landed at
  report time (A17 PEND) — the L1 should confirm they exist before the freeze-commit
  record, with any SURVIVED verdict disclosed.
- The instrument freeze pins (exact selftest counts 37 and 90, driver sha `b16ddb44…`,
  counter/meter shas) are this office's snapshots of working-tree bytes; the L1's
  freeze commit is the pin of record.
- The live scan is point-in-time over sibling HEADs (heads move); the 12-lane figure
  matched the pin at scan time.
- The D1 block-side observation (A8/f4) is semantic analysis on one smoke receipt's
  shape; the counter's own fixtures cover the emitted ids.

## Artifacts (all in `.ufo/waves/round-59/reviewer/`, sha256)

| file | sha256 |
|---|---|
| mixed-forgery-attack.json | `b1ef98860592968a534e08d8e5808abbcb56ccecb6685b9801a142f8670643b7` |
| mf-baseline.json | `f895af76024891a4d92ceb63053dcbd09e8cc9398b124fb77803ece3a014fc95` |
| mf-j1.json | `2da2fd51c8963e98ac7f88befd34f54fbc67b9d12d27d9803555bdbb5e0da6fa` |
| mf-j2.json | `dab526c33fc442e38c1f3297741cca0388a43898a1bf39fd584de19eb0b1d84d` |
| mf-j3.json | `6182dcf1e3a4054b041c180c5a412dbb63e5938d00e417df6302da9240cec130` |
| mf-extend.json | `913974a02fc26900b6cf8dceea60a2c779a3bda081ba1e15439dc106f3913a90` |
| v19-independent-rediff.txt | `aa3867eaa47fa2aea6dd4bc44f5b509f47d1bc75228a0f2a58397681243d138a` |
| v19-independent-logic.diff | `7b824bde78d8b500974fb2c12337254ab8aea9ba0639d6590596637cec5435d9` |
| v18-before-rerun.json | `1c8dc2e180f0079d8cd5cb5a8cddbaae79267564e573f0448cc09731420b97a5` |
| c2-absent-rerun.json | `9d1548969324d2101c9ea75ff875e77751f8245277775c8606b6fd53407a11ac` |
| v19-selftest-2.json | `007982086b1fc881ca05b3688393cea26e4ea8da18d01d4b135a6c13be646b98` |
| counter-selftest-1.clean.json | `441a089909b30813c3763eef7510fcac4c508ffc00aecebec73fb5dd7bdacd95` |
| counter-selftest-raw.txt | `dc37af8faeccd767eed597fff862e7ac4d5eb758485e25802f758e5e60e50c10` |
| f-probes-results.json | `1f3b17a77ad65f045e6228ecb8312d1129d8c4f1b7adea1b33ee932846a3cb80` |
| xr-r59on58.json | `b0e7311ca2b559f7166261b1c1a85a476c679ee6a2c883f8309c92a79baa4be1` |
| xr-r58on59.json | `1b85e92d2636b59f8d0b13c2b98429ed395b88e47ee833e0138a3c1ab60306f5` |
| sanity-r58-green.json | `f39158c34ffcc8c7906bdf575f81967dd82f7840992f491843f450e90cfeed8c` |
| smoke2-verdict.json | `320922b73fe85d5991f4132f3c7c2075db1925818b0ac34c178432d361cf7e3d` |
| runner-path-selftest.json | `511286a41dcf4a0f729cfa03475cef3af4ff626489fcba48564192044493bac5` |
| runner-docurl-selftest.json | `511286a41dcf4a0f729cfa03475cef3af4ff626489fcba48564192044493bac5` (byte-identical to the unmodified run — the finding) |
| live-scan-md-out.txt | `a21249f91e396ee31fe3d8cec1b756c4f8345d409d0bea95c28435f4badd7c02` |
| m1-current.mjs (mutant) | `802e4c05fc263e9a3975dc23f0fdd8e2f232a3b6d06fedce5b8c30503997f409` |
| m1-current-selftest.json | `224576f6811fb8d36627c46e928ff18057a43e51724cb6cb0a67c53af21e4547` |
| m2-current.mjs (mutant) | `e4910de95b1186031adc044cb6845acfaa09346b263b525efd92273a4fc0cc76` |
| m2-current-selftest.json | `007982086b1fc881ca05b3688393cea26e4ea8da18d01d4b135a6c13be646b98` (byte-identical to the honest selftest — the finding) |
| m6-current.mjs (mutant) | `82e4f2f7f2c961905d0e372ff909f23129e72c6f33c22bbb0456b7749cfa0b28` |
| m6-current-selftest.json | `1188facdc7ac9c0a55a3f0ba9b8975181a398c8e55bc4868ed553560737b0580` |

## Commands (all read-only against the lane/siblings; runs only in scratch)

- `node .ufo/waves/round-58/counters/c1-adjacency-host-v18.mjs --rev 4e7fb89d… --repo <lane> --fleet <fleet> --json` → exit 1, 6 findings (drift caveat, A1).
- `git show 4e7fb89d:corpus/adjacency-host-delta-r58.tsv | grep -c 'kagi-shokunin\|kake-shokunin\|kama-shokunin'` → 0; `git ls-tree -r --name-only 4e7fb89d -- corpus/evidence/round59 | wc -l` → 0 (A2).
- `node .ufo/waves/round-58/counters/chromium-receipt-r58.mjs <absent> --driver scripts/chrome-cdp-loopback-round58.mjs --json` → exit 1 receipt-missing (A2).
- Harness build + v19 meter runs at 6 scratch revs (baseline/j1/j2/j3/extend/restore) → receipts above (A5).
- `node cur/c1-adjacency-host-v19.mjs --selftest` → 37/37 (twice: first bytes, final bytes).
- `node cur/chromium-receipt-r59.mjs --selftest` → 90/90 (counter copy + fixtures dir in scratch).
- Cross-refusals ×2 + sanity green ×2 (A14); f1–f8 + f4b + f8b + control battery (A8).
- `node cur/chrome-cdp-loopback-round59.mjs --path-selftest` → 24/24; docurl probe copy → 24/24 (A7).
- M1/M2′/M6 mutants: single-hunk rebuilds of scratch copies, selftest runs (A3/A9/A10).
- Lean live BG scan: `git rev-parse HEAD` + `git ls-tree -r` + `git cat-file -p` per sibling .md (read-only, A6).

No VCS mutation, no corpus/ write, no browser launch, no tool install, no pacman.
Scratch tree deleted before yield.
