# ConnW1Synthesis — wave-1 finding ledger (tabi round 29, wave w2)

Seat: ConnW1Synthesis (connector, leaf — no subagent dispatch, no lane tracked-file writes).
Item: wave-1 synthesis — read every report in `.ufo/waves/round-29/w1/`, list every finding,
defect and survivor they raise, and record whether the integrated lane tip addresses it, leaves
it open, or it is out of scope; flag any W1 finding that would falsify a claim.

## 0. Method and tip identity

- Read all 44 w1 reports (3 Conn, 6 Crit, 3 Exec, 3 Mut, 3 Rev, 2 Scout, 1 Scribe, 23 Pin)
  plus the frozen `.ufo/waves/round-29/claims.json`.
- The assignment names integrated tip `32008a453737a27f69e9ab401d0b9775d2a944f7`; actual
  `master` is `e1e3a15f2db10c135739e0ee7e81ce63a02facf6` = `32008a4` plus exactly one
  evidence-only commit (`w1` report/evidence tree + `corpus/lessons/round-29.md` +
  `corpus/QUALITY.md` criteria 71-73 + `corpus/README.md` frontier; verified
  `git diff --stat 32008a4 e1e3a15` touches no script, counter, corpus evidence, or registry
  file). All claim-relevant state is identical at both revs; measurements below were run in a
  clean `git clone --shared` of `e1e3a15` (`git status --porcelain` empty, verified).
- Frozen counter bytes verified at tip: `check-selfassessment.mjs` =
  `728128008e2242b635bda30a28313de20b06d381d7855f11f18fa5043ba560c4`,
  `check-release-pins.mjs` = `567637200b05eaf6c4ca750294b6ddc30ce64417c336fe135ab625f8c6fc3770`
  (both match the frozen shas).
- Tooling installed/upgraded: none (pre-existing node v24.21.0, git, jq, curl). No pacman/uv/npx
  transactions. Receipts of my runs: `ConnW1Synthesis.measure/` beside this report.

## 1. Claim status at the integrated tip (measured, clean clone)

| Claim | counting command at tip | result | verdict |
|---|---|---|---|
| C1 | `node scripts/check-s106-evidence.mjs --selftest` | `S106_SELFTEST verdict=clean cases=7 passed=7`, exit 0; both revision case ids present | **target met** |
| C1 | `node scripts/check-s106-evidence.mjs --rev HEAD --json` | `valid=true`, exit 0 | **target met** |
| C1 | `cat corpus/evidence/round-29/s106-selftest/mutation.txt` | `measured-revision-bytes-mismatch … exit=0 valid=true FAIL`, `verdict=failed cases=7 passed=6`, exit 3 | **target met (red)** |
| C2 | `node scripts/check-selfassessment.mjs --rev HEAD --json` | `mismatches=0, clean=true, couldNotEvaluate=92, superseded=12`, exit 0 | **target met** |
| C3 | `node scripts/check-release-pins.mjs --rev HEAD --stable 156.0.8078.47 --json` | `population=23, resolved=0, unresolved=23`, exit 1 — **every** row's sole reason is `f6-refetch`; `corpus/evidence/round-29/release-pins/refetch/` does not exist at tip | **NOT met at tip — awaiting w2 independent re-fetch records** |
| adjacent | `node scripts/check-gate-registry.mjs --rev HEAD --json` | `nonconformant=0, clean=true`, exit 0 | met (ScoutGateRegistry rows landed) |

C3 evidence state at tip otherwise complete: `receipt.json` has 23 rows, correct `stable`, and
the 7 drifted rows carry `superseded_by` S109-S115 (verified: S042→S109, S071→S110, S078→S111,
S080→S112, S081→S113, S096→S114, S100→S115); all 7 superseding rows + recheck notes landed in
`190052c`; per-row f1-f5 and s1 pass for all 23 (only f6 fails). ConnSharedFiles independently
re-fetched the 6 shared files and agreed with every S109-S115 anchor/shift.

## 2. Ledger

Status tags: **[ADDRESSED]** = fixed at the integrated tip (evidence path:line);
**[OPEN]** = not fixed at tip; **[OUT-OF-SCOPE]** = claim text frozen this round / report-only;
**[FLAG]** = a W1 finding that would falsify a claim (or its evidence) if credited by the
closure — see §3. Numbers in findings are the reports' own; tip confirmations are mine.

### 2.1 CritC1Vacuity (attack on the landed C1 gate)

| # | finding | status |
|---|---|---|
| C1V-1 | Landed repair is genuine: kills M01-M06; discriminates both tamper shapes | [ADDRESSED] `scripts/check-s106-evidence.mjs` @59e8167 (sha256 `1a01256e…5eb3`); re-verified at tip (§1) |
| C1V-2 | **X1**: dead revision binding still yields `verdict=clean cases=7 passed=7` + `valid=true` at lane HEAD (predicate never inspects case metadata) | [OPEN] gate unchanged since 59e8167 — [FLAG] |
| C1V-3 | **X2**: CLI bypass — `runSelftest()` never calls `main()`; forced-`valid=true` in `main()` alone passes everything | [OPEN] — [FLAG] |
| C1V-4 | M17 length-only binding SURVIVES with shipped fixture; pairing rule (run M01+M17 against shipped and length-preserving fixtures) | [OPEN] fixture divergence unchanged |
| C1V-5 | M19 prefix-sha survivor (low); M07/M08/M09/M10/M12/M13 survivors (no falsifier cases) | [OPEN] |
| C1V-6 | Mutation receipt forgeable/non-discriminating: decoys D1/D2/X1receipt all satisfy the literal receipt wording; no `gate_sha256`/`mutant_sha256` pin; `mutation.diff` rewrites `LANE` | [OPEN] `corpus/evidence/round-29/s106-selftest/mutation.{txt,diff}` — [FLAG] |
| C1V-7 | §6 corrections (length-preserving `"// TAIL"`, `fieldValue` on mismatch, CLI case, `anchor-duplicate`/`byte-count` cases, receipt pin) — none landed | [OPEN] |
| C1V-8 | §7 claim-text: separability "C1 touches `scripts/check-s106-evidence.mjs` only" already false; killRule names only `mutation.txt` | [OUT-OF-SCOPE] claims frozen; report-only |

### 2.2 CritC2Matcher (attack on the frozen C2 counter)

| # | finding | status |
|---|---|---|
| C2M-1 | **S1**: document-wide range (`SCORECARD.md:1-2000`) clears all six real tallies 6→0 with 4 appended lines | [OPEN] counter frozen; no new cases — [FLAG] |
| C2M-2 | S2: LOG window clears on an unrelated-referent number (12 "not the tally") | [OPEN] |
| C2M-3 | S3: marker satisfied by the word "correctly" (asserts the stale figure is correct) | [OPEN] |
| C2M-4 | S4: an honest correction quoting the before-value becomes a new mismatch | [OPEN] |
| C2M-5 | S5: quoted historical receipt output counted as a current claim | [OPEN] |
| C2M-6 | S6: wrapped (two-line) SCORECARD correction never clears | [OPEN] |
| C2M-7 | S7: only the first tally on a line is judged | [OPEN] |
| C2M-8 | S8: one tally applied to every script named on the line | [OPEN] |
| C2M-9 | S9: self-referential oracle at `SCORECARD.md:1439` (any future case addition re-stales it) | [OPEN] structural |
| C2M-10 | C1 interaction: C2 `before` is 7, not 6, at a C1-landed rev; separability understates the coupling | [ADDRESSED] in data — `SCORECARD.md:1438` correction landed `59e8167` (`SCORECARD.md:1458-1467`), LOG correction `35045d7` (`LOG.md:2007-2008`); tip measures `mismatches=0` (§1). Claim-text defect itself [OUT-OF-SCOPE] (frozen) — [FLAG] as provenance |
| C2M-11 | Bounded attacks that correctly fail (placement, same-line, crossdoc); no live correction regressed; frozen crossdoc control reproduced (old 0 / frozen 6) | [ADDRESSED] corroborated by RevC2Diff and tip run |

### 2.3 CritC3Gaming (attack on the frozen C3 counter)

| # | finding | status |
|---|---|---|
| C3G-1 | **S1**: 156 bytes = byte copy of 154 + receipt-derived refetch → `population=23 unresolved=0 holds=23` | [OPEN] counter frozen — [FLAG] |
| C3G-2 | **S14**: the lane's own committed tree + 23 receipt-derived refetch JSONs (invented seat, `fetched_at` 1970, no network) → exact target output `holds=16 drifted=7` | [OPEN] — [FLAG] |
| C3G-3 | S2/S12: declared ranges need not be the anchor's (tag digits bind: `[[8037,8037]]` passes) | [OPEN] — [FLAG] |
| C3G-4 | S3c: `f2` basename-only binding verifies a wrong-path file | [OPEN] — [FLAG] |
| C3G-5 | S4: row supersedes itself (`superseded_by === row.id` accepted) | [OPEN] |
| C3G-6 | S5c: one-line superseder with a 156 URL to a nonexistent path resolves a drifted row | [OPEN] — [FLAG] (same shape the lane relies on for S109-S115) |
| C3G-7 | S6c/S15: population is a count, not an id set — drop S105 + add S999 restores `population=23` | [OPEN] — [FLAG] |
| C3G-8 | S10: entry need not cover all anchor-named files | [OPEN] |
| C3G-9 | S8/S16: digest matched against any file's old sha; `sha256<hex>` spelling silently unbound (8 of 23 rows effectively digest-free) | [OPEN] — [FLAG] |
| C3G-10 | S7: 404 rows skip range checks entirely | [OPEN] |
| C3G-11 | S9: phantom trailing line `[[N,N]]` holds vacuously | [OPEN] latent |
| C3G-12 | S11 negative: path traversal blocked | [ADDRESSED] confirmed |
| C3G-13 | Verdict: the frozen predicate sentence describes the code's shape, not its strength; `unresolved=0` is not freshness evidence | [OPEN] closure must not credit C3 on the counter alone — [FLAG] |

### 2.4 CritClaimSizing (claim-sizing audit)

| # | finding | status |
|---|---|---|
| CS-1 | **CX1**: C2 target 0 reachable with zero corrections (tally-obscuring edits → `couldNotEvaluate` grows; gate deletion → CNE 110) | [OPEN] — [FLAG] |
| CS-2 | **CX2**: C3 `unresolved=0` reachable with zero 156 bytes fetched (1-row fixture) | [OPEN] — [FLAG] |
| CS-3 | **CX3**: C1 landing creates the 7th C2 mismatch; declared six corrections alone can't reach 0 at a merged tip | [ADDRESSED] in data (7th correction landed, tip `mismatches=0`); claim text frozen — [FLAG] as provenance |
| CS-4 | D1: C1 predicate = 4 conjuncts over 3 artifacts; `countingCommand` covers 1 | [OUT-OF-SCOPE] frozen text |
| CS-5 | D2: mutation receipt unbound (no sha/harness pin; hand-writable) | [OPEN] — [FLAG] (same as C1V-6) |
| CS-6 | D3: `--rev REV valid=true` conjunct has no `before` | [ADDRESSED]-with-note: after-state measured at tip (`valid=true`, exit 0); before-state was the crash; claim text gap frozen |
| CS-7 | D4: target satisfiable with the inverted runner if the match case's `field` were deleted | [ADDRESSED] as landed (all four field cases carry `fieldValue`, match case `true`); residual is claim-text only — frozen |
| CS-8 | D5: cheapest control (import-only) not scored pre-freeze; post-hoc run: `cases=7 passed=5`, exit 3 — target survives | [ADDRESSED] receipt `w1/CritClaimSizing/c1-import-only.txt` (not mirrored into `baseline/`) |
| CS-9 | D7 (=CX1), D8: "0" is universal over 6 counted while 93 CNE are exempt | [OPEN] — [FLAG] (reporting remedy: paste `mismatches` beside `couldNotEvaluate`) |
| CS-10 | D9 (=CX3) | [ADDRESSED] in data; text frozen |
| CS-11 | D10: `c2-before-frozen-counter-cleanbase.json.txt` not valid JSON (trailing `exit=1`; `jq` exit 5) | partially [ADDRESSED] — `32008a4` added `baseline/README-receipts.md` documenting invocation + hybrid rev; confirmed at tip: `jq` still fails (exit 5), bytes unchanged. Residual [OPEN] (re-commit as parseable JSON was the alternative fix) |
| CS-12 | D11: `countingCommand` omits the frozen-sha check the killRule requires | [OUT-OF-SCOPE] frozen text; pins recorded in `baseline/frozen-counter-sha256.txt` and verified at tip |
| CS-13 | D12: "independent re-fetch" is `rf.seat !== entry.fetched_by` (two free strings) | [OPEN] — [FLAG] |
| CS-14 | D13: `unresolved=0` requires no fetched 156 byte | [OPEN] — [FLAG] |
| CS-15 | D14: C3 counter not byte-pinned by the predicate | [OUT-OF-SCOPE] frozen text; pin carried in evidence |
| CS-16 | D15: killRule's knowledge-recheck-note condition is not measurable by any counter | [OPEN] measurable only by inspection — verified true at tip for all `corpus/knowledge` citers (7 recheck blocks landed, `190052c`; see 2.13) — report as trade |
| CS-17 | D16: both C3 junk controls are the counter's own selftest cases, not junk commits | [OPEN] |
| CS-18 | D17: `countingCommand` projection weaker than the predicate | [OPEN] |
| CS-19 | Verified premises: trigger sha matches, 23 rows, no prior release-pin counter | [ADDRESSED] |

### 2.5 CritProcedure (evidence-procedure attack)

| # | finding | status |
|---|---|---|
| CP-1 | F1: C2 `before`=6 is reachable only via hybrid invocation (judge outside a clean 856fa9e checkout); the stated "clean clone" procedure yields 5 (`:1439` refused) | partially [ADDRESSED] — `32008a4` `baseline/README-receipts.md` documents the exact hybrid invocation; claim line still literally overstates. Residual [OPEN] (frozen text) — [FLAG] as provenance |
| CP-2 | F2: C1 receipts not byte-reproducible — `makeFixture()` sets no `GIT_AUTHOR_DATE`/`GIT_COMMITTER_DATE` | [OPEN] confirmed at tip (`grep -c` = 0 in gate); re-cut of C1 receipts blocked; w2 must compare verdict/ids only — [FLAG] (evidence quality, not target) |
| CP-3 | F3: `c2-red-before-selftest.txt` unproducible from committed bytes and the one receipt with no exit code | partially [ADDRESSED] via README provenance; bytes unchanged, exit still unrecorded (necessarily 3 per `check-selfassessment.mjs:787`). Residual [OPEN] |
| CP-4 | F4: control receipts pinned to nonexistent scratch revs | [ADDRESSED] README annotation (counts reproducible, `rev` differs) |
| CP-5 | F5: `census-start.txt` ≠ fresh run, no provenance header | [ADDRESSED] README records rev + root + command |
| CP-6 | F6: chromiumdash trigger receipt lacks fetch parameters | [ADDRESSED] README records the exact `num=3` URL |
| CP-7 | F7: `selfassessment-rev-oldcounter.json.txt` captured in a dirty tree (7 incl. `m3-unlanded-paths`) | [ADDRESSED] README provenance |
| CP-8 | No round-29 claim fatally unverifiable; C3 before byte-exact; selftest byte-deterministic | confirmed at tip |

### 2.6 CritSemanticDrift (attack on C3 `holds` semantics)

| # | finding | status |
|---|---|---|
| CSD-1 | Counterexample A: subset filing certifies all 23 `holds` (`unresolved=0, drifted=0`) while 7 rows actually drifted — `holds` is survival-of-filed-lines, not row resolution | [OPEN] counter frozen; landed receipt is honestly full-filed (all anchor ranges in `receipt.json`) — [FLAG] (C3 counter design) |
| CSD-2 | Counterexample B: S045 cited lines survive verbatim but the witnessed contract changed (`window`→`document.modelContext`, JSON-string→object arg) | [ADDRESSED] `32008a4` — semantic note in `corpus/knowledge/chromium-156-release-pin-recheck.md:91+` and `corpus/knowledge/webmcp-invocation-round-17.md:142+` |
| CSD-3 | Per-row semantics: S034/S074 absence-claim half unwitnessed by `holds` + anchor line numbers don't address 156 (offsets +181 etc.); S105/S106 coverage gaps; S041/S099/S079 `debugging` annotation unmined out-of-anchor; S042/S071/S078/S080/S081/S096/S100 drift details (guard insertion, by-value tokens, SelectedcontentSpecEnabled removal) | negative evidence recorded; coverage gaps [OPEN] (future rows; counter does not bind absence/offsets) |
| CSD-4 | Counterexample C: S094 `f6` is self-certifying — natural commit order fails (per-request `request_id` nonce); passing order = refetcher's bytes become the committed bytes; a foreign path's 404 body also passes | partially [ADDRESSED] — `32008a4` normalised the committed 156 body (`request_id` → `<per-request id removed>`; receipt gains `raw_new_sha256` + `normalization`), making the honest order workable; content-binding hole (any 404 body passes) remains [OPEN] — [FLAG] |
| CSD-5 | Proposed corrections: f4 coverage binding from the anchor cell; 404 branch = status + stable first line across two seats (no body-sha); occurrence uniqueness + offset reporting; full file-list coverage | [OPEN] counter frozen → route to r30 as frozen-counter amendment |

### 2.7 MutC1Baseline / MutC2 / MutC3 (mutation baselines)

| # | finding | status |
|---|---|---|
| MUT1-1 | On the repaired gate: drop-sha, drop/force-true anchor-unique, drop/force-true byte-count all SURVIVE (only revision is verdict-killed; sha killed via field assertion alone) | [OPEN] coverage trade — selftest green overstates; w2 must not read `cases=7 passed=7` as full-term coverage — [FLAG] (trade) |
| MUT1-2 | On the red round-28 gate every mutant is exit-invisible; per-case flip attribution required | methodology note; [ADDRESSED] by the C1 repair |
| MUT1-3 | Committed `mutation.txt` independently reproduced (M4/M4b both kill via `measured-revision-bytes-mismatch`) | [ADDRESSED] |
| MUT2-1 | m1/m2/m3/m5a KILLED (doc binding real, both windows, single-line inclusivity); corroborates the C2 control | [ADDRESSED] |
| MUT2-2 | m4 (reversed range) and m5b (range-end −1) SURVIVE — all 22 selftest citations are single-line | [OPEN] coverage |
| MUT3-1 | 9 killed / 9 survived on the release-pin selftest; survivors: f1-old-tag, f2-traversal, f3-absent, f4-bounds, f4-anchor (killed-for-wrong-reason case), s1-prefix, s1-tag, notfound-status, notfound-body — suite asserts exit+count, never the reason | [OPEN] coverage — [FLAG] (trade) |
| MUT3-2 | f2-path-binding, f3 path/sha, f5-digest, f6 seat/sha/whole, population filters KILLED | [ADDRESSED] |

### 2.8 RevC1Gate / RevC2Diff / RevC3Code (reviews)

| # | finding | status |
|---|---|---|
| REV1-1 | `evaluate()` semantics pinned; all three baseline defects confirmed repaired at HEAD (import `H:38`; `fieldValue` runner `H:307-311`; mismatch-case `d.commit()` `H:203`); no new defect | [ADDRESSED] re-verified at tip (§1) |
| REV1-2 | W2 checklist delivered | used by w2 rerun seats |
| REV1-3 | Residual: `main()` never exercised by selftest (= C1V-3/X2); non-UTF8 latent; `decoded_sha256` format-unvalidated | [OPEN] (first = [FLAG] above; others frozen behavior) |
| REV2-1 | PASS: doc binding in both windows, nothing else changed, red/green independently reproduced, frozen rerun on clean 856fa9e = 6 with byte-identical findings | [ADDRESSED] tip re-run agrees |
| REV3-1 | M1: `anchorHasRange` single-line tokens bind inside tag/date/sha digits (21/23 rows accept `[154,154]`/`[8037,8037]`) | [OPEN] — [FLAG] |
| REV3-2 | M2: no file-coverage enforcement (S045 resolvable on the `.html` alone; S062 on a subset) | [OPEN] — [FLAG] |
| REV3-3 | L1: malformed rows silently dropped (population shrinks, no refusal) | [OPEN] — [FLAG] (enables C3G-7) |
| REV3-4 | L2: non-Refusal crash exits 1, misread as "failed" (latent); L3: selftest asserts modeled exits, not the CLI's; L4: temp-dir leak on `makeFixture` throw; L5: selftest exit 3 undeclared | [OPEN] latent/low |
| REV3-5 | I1: unrecognized digest spelling → f5 silently skipped (= PinS074 F-1); I2: 404 placeholder is a substring test; I3: refetch independence = string inequality; I4: phantom trailing line; I5: loose basename fallback | [OPEN] — I1/I3 [FLAG] |
| REV3-6 | Verified-good: parseRegistry vs census, version compare, dash forms, digest regexes, blockIn symmetry, 404 matrix, refetch binding, exit contract, TMPDIR honor | [ADDRESSED] |

### 2.9 ExecC1Repair / ExecC2DryRun / ExecTrigger (executors)

| # | finding | status |
|---|---|---|
| EX1-1 | Three routed defects repaired on the copy (import; per-case `fieldValue`; mismatch-case commit); 7 cases preserved; mutation + inverse-mutant receipts | [ADDRESSED] landed `59e8167`; verified at tip (§1) |
| EX1-2 | Parent-owed items: land patch, commit `mutation.txt` to the predicate path, re-run counting commands at final REV, update SKILL tally | [ADDRESSED] all four (tip runs §1; registry clean §1) |
| EX1-3 | Risks: fixture commit ids per-run (non-reproducible); `#`-header provenance lines | [OPEN] (= CP-2) |
| EX2-1 | Draft corrections clear all six; four attack variants each leave the targeted tally counted; `:1438` prediction verified against the real repaired gate | [ADDRESSED] landed wording differs and works; tip `mismatches=0` (§1) |
| EX2-2 | Standing risks: C1 case-count binding (landed exactly 7 — OK); `:1439` binds the counter's own 22; absolute line numbers; heading verbatim; drafts duplicate the landed block if reapplied | standing rules — noted for w2/integrator |
| EX3-1 | Trigger confirmed byte-identical to baseline (`90abf2c3…`); Gitiles tag 156.0.8078.47 = `1d17a2e2…`; S108 row drafted with 11 valid cells | [ADDRESSED] S108 already in registry (`corpus/SOURCES.md:122`, `190052c`) |
| EX3-2 | Per-platform divergence: Windows stable already `157.0.8103.15`, Mac `156.0.8078.48` — a later `--stable` re-run would move the population | informational — scope fact for future rounds, not a failure |

### 2.10 ScoutGateRegistry / ScoutUsedBy / ConnSeparability / ConnSharedFiles / ConnSiblings

| # | finding | status |
|---|---|---|
| SC1-1 | 3 nonconformant registry rows at freeze (missing release-pins row; s106/selfassessment round-28 rows fail name/selftest regexes) | [ADDRESSED] `59e8167` SKILL rows; tip `nonconformant=0` (§1) |
| SC1-2 | m1 does not read SKILL.md; registry rows can never be counted; wording rules for round records (tally shapes, correction grammar, C3 JSON `command`/`exit` hazard, never edit frozen counters, never restructure quarantined sections) | standing rules — [ADDRESSED] as guidance; latent couplings noted |
| SU-1 | Complete citation map: 7 drifted rows and all citers; used-by `—` rows (S080/S081/S093/S098, S094→lessons) verified | [ADDRESSED] analytical |
| SU-2 | **SKILL.md cites drifted rows (S071/S078/S096/S100…) and carries no round-29 recheck note** | borderline [OPEN] — the killRule scopes the harm to "citing knowledge entries"; all 7 `corpus/knowledge` citers carry notes (verified at tip), SKILL.md is the gate registry, not a knowledge entry. Verifier-judgment call: report as trade, never admit |
| SEP-1 | Real coupling C1→C2 kept separable only by wording rules (landed 7 matches the landed correction) | [ADDRESSED] tip `mismatches=0` (§1) |
| SEP-2 | Latent couplings: m2 JSON surface (C3 receipts must not carry reproducible `command`/`exit` pairs — clean at tip), quarantined multi-script sections, SKILL adjacency | standing rules — noted |
| SHF-1 | 6-file independent re-fetch: hold set {S034 S074 S041 S079 S099 S097 S077 S093 S098}, drifted set {S042 S071 S078 S096 S100 S080} — every S109-S115 anchor/shift agrees with the lane's rows | [ADDRESSED] independent corroboration of `190052c` |
| SHF-2 | Cosmetic inter-note variance: guard cited `156:201-209` vs `:201-210` | [OPEN] cosmetic (10-line insert; body 201-209) |
| SHF-3 | Out-of-item surfaces not independently re-fetched: S112's `script_tool_types.h`/`frame.mojom`/`local_frame_mojo_handler.cc` claims, S113's `html_select_element.cc` (PinS081 covered the latter) | [OPEN] unverified surface — flagged |
| SIB-1 | Zero sibling registry overlap; cross-lane wants classified (tsukuroi/tameshi stable-number; kotoba census re-run; kasegi `/tmp` attribution) | [ADDRESSED] report-only |
| SIB-2 | Hygiene flag: `/tmp/code.154.0.8037.97` and `/tmp/code.156.0.8078.47` editor temp dirs (kasegi r33) possibly from tabi r29 seats — contract requires `$HYAKU_SCRATCH` | [OPEN] out-of-lane; reported for Main/kasegi; not absorbed |

### 2.11 ScribeLesson

| # | finding | status |
|---|---|---|
| SL-1 | M1: no capturing criterion for "landed instrument that crashes unrun" → proposed P-71 | [ADDRESSED] `corpus/lessons/round-29.md` M1 + `corpus/QUALITY.md:71` (landed `e1e3a15`) |
| SL-2 | M2: census prose quoted output the command never prints → proposed P-72 | [ADDRESSED] lesson M2 + QUALITY 72 |
| SL-3 | M3 captured-in-writing by criteria 65/70 but unenforced; routed observation: criterion authored alongside a contradicting implementation | [ADDRESSED] lesson M3/M4 + QUALITY 73 |
| SL-4 | F4: C1 landing = seat's exact bytes (`1a01256e…5eb3`), non-vacuous in both directions | [ADDRESSED] |
| SL-5 | F5: inverse-mutant arm uncommitted at draft time | [ADDRESSED] `w1/build/c1/positive-control-nonvacuous.txt` committed with the w1 evidence (`e1e3a15`) |
| SL-6 | F6: numbering free at 71; F7: pointer hygiene | [ADDRESSED] 71-73 used; pointers verified |

### 2.12 Pin seats (23 row reports)

Common to all 23: independent fetch of 154+156 bytes with HTTP statuses, decoded-byte digests,
per-range counter-semantics verdicts, counter-shape `entry.json`, and (drifted rows) supersede
drafts with per-citer recheck notes. Common open dependencies at w1 close, both waved to w2/the
assembler: (a) `f6-refetch` record from a *different* seat per row — none existed at tip (§1);
(b) byte promotion `w1/pins/S*/bytes/` → `corpus/evidence/round-29/release-pins/bytes/` —
done in `190052c`; (c) receipt assembly — done in `190052c` (23 rows verified). Row verdicts:
**holds** S033 S034 S041 S045 S062 S064 S074 S077 S079 S093 S094 S097 S098 S099 S105 S106;
**drifted** S042 S071 S078 S080 S081 S096 S100 (superseded_by S109-S115 verified in
`receipt.json`).

| # | finding | status |
|---|---|---|
| PIN-1 | PinS074 F-1: `sha25699b92e…` glued spelling → `rowDigests` extracts nothing; f5 vacuous for S074 (fixture-proven: wrong digest still resolves; spaced spelling fails) | [OPEN] counter frozen — [FLAG] (predicate clause unexercised for this row) |
| PIN-2 | PinS094 F1: 404 `request_id` nonce makes f6 unreproducible as filed | [ADDRESSED] `32008a4` nonce normalisation (+ `raw_new_sha256`/`normalization` receipt fields) |
| PIN-3 | PinS094 F2: 404 branch content-unbound (foreign path's 404 body resolves) | [OPEN] — [FLAG] (same as CSD-4 residual) |
| PIN-4 | PinS094 F3: flip lead `html_form_mcp_tool_test.cc` 200 at both tags, byte-identical | noted for re-scoping; [OPEN] |
| PIN-5 | PinS096/PinS071: literal `S1NN` placeholder invisible to the registry regex — numeric id required in registry **and** `entry.superseded_by` in one commit | [ADDRESSED] S109-S115 allocated `190052c`; receipt fields verified |
| PIN-6 | PinS045 risk 3: anchor spells `inspector-protocol/webmcp/invoke-tool.js` without the `third_party/blink/web_tests/` prefix (basename fallback tolerates) | [OPEN] cosmetic readability |
| PIN-7 | PinS062 risk 3: `devtools_http_handler.cc` +11 line shift invisible to the counter | [OPEN] by design; re-pin at next release |
| PIN-8 | PinS093: `.h` digest not registry-bound — only f3 byte-hash binds the header | [OPEN] weak binding noted |
| PIN-9 | PinS098: f6 non-discriminating for byte-identical files (copied-old-as-new undetectable on this row); `.ufo/waves/round-20/w2/SemanticLC03.md:9` mislabels decoded sha as "r19 gzip sha256" | [OPEN] cosmetic/inherent |
| PIN-10 | PinS033 fetch-log had a garbled digest line from a shell error (rewritten, recomputed) | [OPEN] receipt hygiene — values verified correct |
| PIN-11 | Per-row knowledge-citer checks (S041 line-shift +2, S062/S064/S105/S106 substance holds, S080/S081 no citers) | [ADDRESSED] negative evidence; no recheck notes owed on hold rows |

### 2.13 Cross-cutting verification at tip (this seat)

- 7 `## Round-29 recheck` blocks landed in the citing knowledge entries
  (`webmcp-invocation-round-17`, `source-recheck-round-18`, `harness-hardening-round-18`,
  `webmcp-declarative-validation-round-19`, `webmcp-completion-lifecycle-round-20`,
  `webmcp-nonautosubmit-round-21`, `webmcp-nonautosubmit-round-21-corrected`) plus
  `chromium-156-release-pin-recheck.md` — the C3 killRule's recheck-note quality condition holds
  in fact for all corpus/knowledge citers (D15/SU-2 caveat: no counter measures this).
- `c3-tip.json` reason histogram: 23 rows × `f6-refetch` only — f1-f5 and s1 pass everywhere;
  expected post-refetch outcome is `holds=16, drifted=7` (receipt `superseded_by` set).

## 3. Claim-falsifying flags (what the closure must not credit)

1. **C3 target ≠ freshness evidence.** CritC3Gaming S1/S14, CritClaimSizing CX2, CritSemanticDrift
   A/C, RevC3Code M1/M2/I3: `population=23 unresolved=0` is reachable with copied or
   receipt-derived bytes, fabricated seat strings, subset filing, self-supersession, and
   population swaps. The frozen predicate's "committed 154/156 decoded bytes … independent
   re-fetch from a different seat" clauses are **not enforced** by the frozen counter. When w2
   refetch records land and the counter reads 0, the closure must require per-row Gitiles
   provenance (HTTP status + decoded sha from the refetching seat's own fetch) before crediting
   C3 — otherwise C3 is falsified-by-design while its scalar passes. (The w1-produced bytes and
   rows themselves are honest: Pin×23 + ConnSharedFiles + PinS105's negative fixtures.)
2. **C2 target ≠ calibrated docs.** CritC2Matcher S1-S9 + CritClaimSizing CX1/D8: 0 is reachable
   by document-wide range sweeps, marker-word luck, or by hiding tallies in the exempt
   `couldNotEvaluate` bucket. The tip's `mismatches=0` is genuine (six exact corrections +
   the :1438 seventh), but the frozen counter cannot distinguish it from the cheap routes.
   Closure should paste `mismatches` beside `couldNotEvaluate` and note the correction style.
3. **C1 predicate admits sham gates.** CritC1Vacuity X1/X2 (+ RevC1Gate residual): a gate can
   satisfy every C1 conjunct while admitting divergent measured revisions or bypassing its CLI.
   The landed gate is not such a gate (M01-M06 dead, both tamper shapes discriminated), but the
   predicate cannot prove that. Treat C1 as verified for the landed bytes, not as a class result.
4. **Claim-text provenance defects (frozen, report-only).** C2 `before`=6 is hybrid-invocation-only
   (clean procedure gives 5, `:1439` refused — CP-1); C1 landing adds the 7th mismatch (CS-3);
   separability "C1 … C2 unaffected" is one-directional; the C2 before receipt still fails `jq`
   (exit 5). None change the targets; all should ride the round report.
5. **Evidence-quality residuals.** C1 receipts are not byte-reproducible (unpinned fixture
   dates — CP-2); the mutation receipt has no byte pin (CS-5/D2). Compare by verdict/ids only.
6. **Predicate clauses no line enforces.** C3 f5 is vacuous for S074 (PIN-1) and digest-free for
   8 of 23 rows (C3G-9); the killRule's recheck-note condition is measured by no counter (CS-16).
   Under the round's own rule ("a counter not run is a claim not verified"), these clauses are
   unverified at any REV — report as trades, never admit.

## 4. What w2 must still close (mapped from w1 findings)

- C3: independent re-fetch records for all 23 rows (w2 Refetch seats — in flight; the only gap
  between the tip and C3 verification). After they land: re-run the frozen counter, expect
  `unresolved=0`, and record provenance per flag 1.
- C1: rerun/attack seats should run the CritC1Vacuity M-table (esp. the M01+M17 pairing rule and
  the length-preserving fixture), the X1/X2 constructs, and compare receipts by verdict/ids only
  (CP-2). Any C1 gate edit (fixture-date pinning, new falsifier cases, receipt pin) re-cuts
  `selftest-l1.txt`/`mutation.{txt,diff}` in one commit and re-checks the C2 coupling (SCORECARD
  :1438/:1439 oracles move).
- C2: attack fixtures S1-S9 (omnibus sweep, accidental LOG clear, "correctly" marker,
  before-value quote, fenced receipt quote, wrapped correction, same-line two-tallies,
  multi-script line) are built and receipted in `w1/CritC2Matcher/` — w2 mutation seats can rerun
  them unchanged against the frozen counter (all currently survive → report as calibration
  trades; the counter itself is frozen).
- C3 counter amendments (f4 coverage from anchor, exact-path f2, population id-set, digest
  spelling, 404 two-seat status binding, superseder verification, refetch honesty) are designed
  in CritC3Gaming §6 + CritSemanticDrift §5 + RevC3Code M1/M2 — all route to round 30 as a
  frozen-counter amendment; do not attempt inside w2.
- Hygiene: `/tmp/code.154.0.8037.97` / `/tmp/code.156.0.8078.47` attribution (SIB-2) belongs to
  Main/kasegi, not the lane.

## 5. Commands run (this seat, all in `/fast/scratch/hyaku/tabi-r29/ConnW1Synthesis`)

```
git clone --shared -q /home/vgpnk/Projects/shokunin/tabi-shokunin $S/clone   # exit 0; rev-parse = e1e3a15…; status --porcelain empty
git -C $S/clone show HEAD:scripts/check-selfassessment.mjs | sha256sum      # 72812800…60c4  exit 0 (frozen match)
git -C $S/clone show HEAD:scripts/check-release-pins.mjs | sha256sum        # 56763720…3770  exit 0 (frozen match)
node $S/clone/scripts/check-s106-evidence.mjs --selftest                    # verdict=clean cases=7 passed=7  exit 0
node $S/clone/scripts/check-s106-evidence.mjs --rev HEAD --json             # valid=true  exit 0
node $S/clone/scripts/check-selfassessment.mjs --rev HEAD --json            # mismatches=0 clean=true  exit 0
node $S/clone/scripts/check-release-pins.mjs --rev HEAD --stable 156.0.8078.47 --json
                                                                            # population=23 unresolved=23 (all f6-refetch)  exit 1
node $S/clone/scripts/check-gate-registry.mjs --rev HEAD --json             # nonconformant=0 clean=true  exit 0
grep -c 'GIT_AUTHOR_DATE\|GIT_COMMITTER_DATE\|SOURCE_DATE_EPOCH' $S/clone/scripts/check-s106-evidence.mjs
                                                                            # 0  exit 1 (F2 confirmed open)
jq '.mismatches' $S/clone/.ufo/waves/round-29/baseline/c2-before-frozen-counter-cleanbase.json.txt
                                                                            # jq exit 5 (D10 residual confirmed)
git -C $S/clone diff --stat 32008a4 e1e3a15                                  # w1 evidence + lesson + QUALITY + README only
```

Scratch clone removed after receipts were copied to `ConnW1Synthesis.measure/`.
No installs, no network fetches (read-only git only), no lane/sibling/fleet writes; lane git
read-only throughout.
