# Round 58 w1 — R58Reviewer attack report

Seat: R58Reviewer (read-only attack). Authority: `.ufo/waves/round-58/claims.json`, frozen at lane HEAD `484bde50`; never amended here.
Baseline: `051f433d`. Lane HEAD at review: `484bde50`.

## Snapshot state (the artifacts move; verdicts below are per snapshot)

| object | state at review | notes |
|---|---|---|
| `counters/c1-adjacency-host-v18.mjs` | sha256 `3afade4e…`, 39250 B | UNTRACKED at HEAD (no freeze commit yet) |
| `counters/v17-v18-meter.diff`, `adj/v18-line-audit.txt` | present | untracked |
| `adj/m4b-kill.json`, `adj/mG-kill.json` | present, parse | untracked |
| `counters/chromium-receipt-r58.mjs` | sha256 `7ff9846f…`, mtime 17:15:39 | untracked; changed twice during review |
| `scripts/chrome-cdp-loopback-round58.mjs` | sha256 `c984a9cc…`, mtime 17:16:29 | untracked; changed three times during review |

Every C2 verdict below is for the 17:16 snapshot. Re-run before freeze.

Git: only read-only subcommands were run (`rev-parse`, `cat-file`, `ls-tree`, `ls-files`, `status`, `show HEAD:…`). No mutating command. No tool installed. No browser launched. No live data pass. One `/tmp` file (under 1 KB) was written and removed during a `cmp` check.

## Bottom line

- **C1 mechanics hold.** The v18 diff has no logic change outside (a)/(b)/(c), `verify()` is byte-identical to v17, the selftest is 20/20, and both routed kill receipts reproduce byte-for-byte and fail on the named cases.
- **C1 predicate is weaker than its wording.** Two admission holes let a state go green with unscreened browser-ground content (A4, A5). The live check (against the committed r57 ledgers) finds three map-covered siblings with browser-ground lines that no screen examines. The harness guard also lacks a findings-mismatch row, so a findings-term drop survives and masks a real `verify()` regression (C-iv). Both are named for the next generation; neither is a reason to widen v18 now.
- **C2 is not operational.** The r58 counter crashes at runtime (`pickStr` used five times, never defined). Its selftest and its cross-refusal both exit 1 by uncaught exception with no JSON. Its frozen `FINDING_IDS` still hold the r57 43 ids, while it emits six new swallow ids that are not in the list. The runner's swallow fixture is correctly ordered and URL-free, but its URL-channel detector accepts `document.URL` (pre-freeze fix).

## A. Attacks on the frozen claims

Verdict key: **FB** = failed-to-break; **AS** = attack-succeeded.

| # | claim / clause | verdict | evidence |
|---|---|---|---|
| A1 | C1 before: v17 at baseline red at round open | FB | `controls/c1-meter-v17-at-round-open.json` parses; `predicate false`, `findingCount 1`, `lane-screen-head-mismatch kengaku-shokunin`, `counts.roster 20`. Matches the claim. |
| A2 | C1 U1: every map row has exactly one audit row | FB | `verify()` P1 iterates every map row; duplicate audit keys are flagged (`audit-duplicate`). Residual, not claimed: audit rows keyed by no map row are not flagged (N7). |
| A3 | C1 U2: every sibling lane dir at `--fleet` is covered | AS (minor) | `rosterScan` keeps only directories where `laneExists` (`.git` or `HEAD`) holds (`rosterScan`, `laneExists`). A fleet directory that lost its git metadata drops out of the universal with no finding. Code evidence only; not exercised live. |
| A4 | C1 U3: every browser-ground hit line in a screened province has a line row | **AS (major)** | The universal enumerates only provinces named by a delta lane row. A lane covered by any ruled map row skips the screen (`mapSibs.has(lane)` short-circuits, `verify()` P2/P3). Probe H1 (`holes-cur.txt`): a map-only lane with BG-word hits in `PROVINCE.md` and no delta row gives `predicate=true`, `ids=[]`. **Live check** (`liveh1-cur.txt`, read-only scan of lane HEADs against the committed `corpus/adjacency.tsv` and r57 delta at `484bde50`): three roster lanes have no delta row and BG-word lines in map-referenced files: kagi `PROVINCE.md` 3 hits; kake `PROVINCE.md` 45 hits and `SKILL.md` 19 hits (6 map refs); kama `corpus/knowledge/listener-census.md` 5 hits. The frozen sentence admits all three. Caveat: the r58 ledgers are not committed yet, so the L1 may add lane rows that change this list. The admission itself does not depend on them. |
| A5 | C1 stray line rows | AS (minor) | Probe H2 (`holes-cur.txt`): a line row whose lane has no lane row is never examined, and the state is green. Probe H3b (`h3b-cur.txt`): a line row `OTHER-UNSCREENED.md:2` (a number equal to a hit line, a file never screened) is accepted; the `delta-line-invented` check is keyed by line number only and ignores `relPath`. The predicate sentence does not say "no invented rows", so this is a gap between code and intent. |
| A6 | C1 "one command over committed bytes re-derives it" | AS (wording) | Map, audit and delta are read at `--rev` (committed). The sibling side is read from live fleet `HEAD`s at run time (`headSnapshots`, `makeSibRefGit`). The same command re-run after a sibling moves can flip red; the round-open control is exactly that. The receipt's `headSnapshot` is the only anchor. Claim wording should say point-in-time. |
| A7 | C1 do-nothing control | FB | v17 at baseline is red as recorded; the do-nothing path cannot select v18 bytes. |
| A8 | C1 kill rule and 2-cycle correction budget | pending | `adj/rebind-snapshot.json` absent; the L1 rebind has not run. |
| A9 | C2 before: `ls-tree 051f433 … round58 \| wc -l` = 0 | FB | Observed 0. |
| A10 | C2 after: "exactly the per-step PNGs the driver emits" | AS | The count is "recorded concretely in the round report from the live run", so the frozen text names no number. The universal cannot be falsified from `claims.json` until the L1 records one. |
| A11 | C2 after: "one command over committed bytes" | AS | The counter reads the driver from the working tree (`fs.readFileSync(driverPath)`) and each PNG from the working tree (`checkStepPng`). The after-command's `--driver scripts/…` and `--shot corpus/evidence/…` are working-tree paths, so a dirty tree can flip the verdict. |
| A12 | C2 after: `--expect-driver-sha256 <pinned-at-freeze>` | AS | No pin value appears in `claims.json` or any committed file. The shape of the frozen check is a placeholder. |
| A13 | C2 cross-refusal: r58 counter on committed r57 receipt "exits 1 (schema-wrong first)" | AS | The r58 counter exits 1 with empty stdout and `ReferenceError: pickStr is not defined` (`r58-counter-on-committed-r57-receipt.stderr.txt`). Exit 1 is Node's uncaught-exception exit. The schema-wrong verdict is never produced. The claim's test is satisfied by a crash. The r57 counter on the same receipt is green (`predicate true`, 0 findings), so the baseline is sound. |
| A14 | C2 do-nothing: counter on absent receipt "exits 1 with a could-not-evaluate class" | AS (wording) | Observed: exit 1, `findings ["receipt-missing"]`, `couldNotEvaluate []` (`r58-counter-absent-receipt.json`). The class the claim names is not what the counter emits. |
| A15 | C2 kill rules: cancelable/defaultPrevented per keystroke; >1 form submission; synthetic-green | pending | The counter has no check for these yet (D1, D2). |
| A16 | C2 knowledge note `corpus/knowledge/chromium-preventdefault-swallow-round-58.md` | pending | File absent at review time. |
| A17 | C2 "(k1)–(k5)" finding labels | AS (anchor) | The labels are not in `claims.json`; they appear only in `.ufo/waves/round-58/w1-spec.json` and `w1-plan.json`. The seat's requested mapping has no frozen anchor. |

## B. v18 diff review and kill receipts

- **Diff discipline — FB.** Comment-stripped logic diff of v17 against the current v18 (`cur/` in scratch) has exactly these changes:
  - (a) `AUDIT_REL`/`DELTA_REL` → r58; `die` schema string; selftest schema string; usage line; predicate sentence.
  - (b) `refMalformed` const (`…:PROVINCE.md:12x`); `map-ref-unparseable` case with an audit row for that ref.
  - (c) `caseOk()` extracted from the run loop; `harness-guard` case.
  - `verify()` is byte-identical to v17 (81 lines). `parseRef` is unchanged in the committed v18: the regex is still `/^\d+$/`.
- **Self-test — FB.** `node c1-adjacency-host-v18.mjs --selftest` → exit 0, `allPass true`, 20/20 (`v18-current-selftest.json`).
- **Mid-review change.** The committed v18 changed at 17:11, after my first copy. The first version's malformed-ref fixture had no audit row. The current version adds `[refMalformed,'unchanged','-']`. All my results below are re-run on the current bytes.
- **Kill receipts — FB.**
  - `adj/m4b-kill.json`: exit 1, `allPass false`, 19/20, failing `map-ref-unparseable` only. Hunk `/^\d+$/ -> /^\d+/`. Mutant sha256 `24a42f3a…`. I rebuilt the mutant from the committed v18 with the one-line change and got sha256 `24a42f3a…`, byte-identical.
  - `adj/mG-kill.json`: exit 1, `allPass false`, 19/20, failing `harness-guard` only. Hunk `return okFindings && okPredicate && okCount;` → `return okFindings;`. Mutant sha256 `333d4725…`. Rebuilt independently: byte-identical.
  - Note: the mG hunk drops both the predicate and the count terms, not only the predicate. It is still the routed assertion-drop class.

## C. Weaker-mutant sweep (current committed v18 bytes)

| mutant (one line unless noted) | selftest result | verdict |
|---|---|---|
| m4b: parseRef `/^\d+$/` → `/^\d+/` | 19/20, fails `map-ref-unparseable` | killed (routed) |
| mG: `return okFindings;` (predicate and count dropped) | 19/20, fails `harness-guard` | killed (routed) |
| (i) caseOk drops only count: `okFindings && okPredicate` | 19/20, fails `harness-guard` | killed by the guard's count row |
| (ii-a) m4b + malformed fixture suffix `x` (alpha only) | 20/20 | **survives** (see N2) |
| (ii-b) m4b + malformed fixture suffix empty | 20/20 | **survives** (see N2) |
| (ii-c) m4b with `2x`, `12x`, `2.5`, `2 ` | killed | killed |
| (ii-d) m4b with `-1`, no `@`, no second colon | 20/20 | survives (N2) |
| (iii) harness-guard reduced to the all-match row, plus mG | 20/20 | **survives**: the guard's mismatch rows are load-bearing. v18 has them, so FB for v18 as written. |
| (iv) caseOk drops only the findings term: `okPredicate && okCount` | 20/20 | **survives** (see N1) |
| (iv) + a `verify()` regression (`audit-missing` no longer emitted) | 20/20 | **survives**: the regression alone is caught (19/20, `audit-missing`); with the findings drop the selftest is green. |

Survivors are named for the next generation (N1, N2). None is a reason to widen v18 now.

## D. r58 counter and runner (17:15–17:16 snapshot)

### D1. Counter (`counters/chromium-receipt-r58.mjs`) — not operational

- `SCHEMA = 'tabi-chrome-cdp-r58'` and `NONCE_RE = /^tabi-r58-…/` are in place.
- `pickStr` is called five times and never defined (0 definitions). `--selftest` exits 1 with a `ReferenceError` and no JSON (`final-counter-selftest.err`, receipt `r58-counter-selftest-final.stderr.txt`). The counter cannot emit any verdict on a receipt that reaches the shift-trace block.
- Cross-refusal: the counter on the committed r57 receipt crashes the same way (A13). Its absent-receipt path works (A14).

### D2. Finding ids — 1:1 mapping FAILS; no r57 id lost

- `FINDING_IDS` is still the frozen r57 list of 43 ids (carried 29 + new 14).
- Literal `add('…')` ids in the counter: 49. Six are NOT in `FINDING_IDS`: `swallow-recorder-fields-missing`, `swallow-plan-mismatch`, `swallow-control-inserted-wrong`, `swallow-defaultprevented-missing`, `swallow-value-changed`, `swallow-enter-chord-leak`.
- Every frozen id is still emitted (`frozen but never emitted: []`), so no r57 check lost its id.
- The selftest asserts every `FINDING_IDS` entry is exercised, so the six unfrozen ids are not covered by it.
- Against (k1)–(k5): there is no frozen anchor (A17). The six new ids do not correspond one-to-one to five labels.

### D3. Runner (`scripts/chrome-cdp-loopback-round58.mjs`) — swallow fixture correct; URL detector incomplete

- The fixture's swallower is a `document` **capture** listener (`…}, true)`), registered before both recorders. The recorders read `cancelable` and `defaultPrevented` at record time, after the swallower has run. Ordering matches the claim.
- The gate is reached only through `window.__setSwallow`. The fixture JS reads no `location`, `search`, `hash`, cookie or `window.name`. Swallow cannot be toggled by URL in the current fixture.
- `--path-selftest` on the unmodified file: **19/19**, including `swallow-url-toggle-refused` (`r58-runner-path-selftest-unmodified.json`).
- **Attack succeeded (pre-freeze):** the contract's URL-channel list is `location, URLSearchParams, document.cookie, window.name, localStorage, sessionStorage`. A scratch copy with `var bypass = document.URL;` added to the fixture still gives **19/19**. `document.URL` carries the query string and is not named. Also missing from the list: `document.documentURI`, `document.baseURI`, `document.referrer`, `history.state`, `window.opener`. This runner is authored in this wave and the freeze has not happened, so the list can be closed before the freeze.

## Findings to close before the freeze commit (in this wave's scope)

1. **Counter:** define `pickStr` (or remove the calls). Make the cross-refusal a real `schema-wrong` verdict, not a crash. Add the six swallow ids to `FINDING_IDS`, or rename them to the frozen set, and make the selftest exercise each id.
2. **Counter:** read the driver and PNGs at a committed blob (or pin each by sha in the receipt and check against committed bytes) so the after-command is one committed-bytes command.
3. **Runner:** close the URL-channel list (add `document.URL`, `document.documentURI`, `document.baseURI`, `document.referrer`, `history.state`, `window.opener`), and refuse any read of them.
4. **Claims (pre-freeze text):** record the expected per-step PNG count and the driver sha pin in the freeze commit. Align the do-nothing wording with what the counter emits (`receipt-missing`, not "could-not-evaluate"), and make the cross-refusal wording name the schema verdict.

## Next generation (named, not widened into v18)

- **N1 — harness guard lacks a findings-mismatch row.** The guard's truth table covers only findings-match rows. A findings-term drop survives and masks a real `verify()` regression (C, last two rows). Add: findings-mismatch + predicate-match → false; findings-mismatch + count-match → false.
- **N2 — m4b kill is shape-specific.** Only digit-led malformed suffixes (`12x`, `2x`, `2.5`, `2 `) kill the weakened regex. Alpha-only (`x`), empty, signed, no-`@` and no-colon shapes evade it. Next generation: keep the digit-led fixture and add a second shape, or assert the parsed line is a finite integer.
- **N3 — browser-ground screening is scoped by the ledger's own rows (A4).** Map-covered lanes are never screened. Live at the committed r57 ledgers: kagi (3), kake (45 + 19), kama (5) carry BG-word lines in map-referenced files with no delta row. Next generation: require a screen for every roster lane whose map refs point at a province, or enumerate BG hits in every referenced file.
- **N4 — stray line rows are accepted (A5).** Orphan line rows and cross-file line rows with a hit number pass. `lineRows` is filtered by lane but not by `relPath`. Next generation: filter by `relPath`, flag orphan lanes, and state "no invented rows" in the predicate.
- **N5 — git-less fleet directories drop out silently (A3).** Next generation: record every directory considered in the receipt.
- **N6 — the sibling side is live (A6).** Next generation: describe the meter as point-in-time, or pin sibling heads into the receipt and re-check them.
- **N7 — orphan audit rows are not flagged (A2).** Next generation: flag any audit row keyed by no map row.

## Verification gaps (not run, or run only partially)

- No live data pass, no browser, no rebind snapshot. Kill rule A8 and the C1 after-receipt are pending.
- `adj/v18-line-audit.txt` was read for its header and closing claim only. My own logic diff is the authority for B.
- C2 verdicts are for the 17:15–17:16 snapshot. Both files changed several times during review. Re-run at freeze.
- The H1 live scan uses the committed r57 ledgers, not the r58 ledgers.
- The knowledge note and the frozen driver sha pin do not exist, so A12 and A16 are open.

## Receipts (copied into `reviewer/receipts/` before scratch cleanup)

- `v18-current-selftest.json` (20/20); `v18-current-mutant-*.json` (m4b, mG, icount, ivfind, fixx, fixempty, m4b-fixx, m4b-fixempty, guardweak, regress, ivfind-regress); `v18-current-ivfind-plus-regress.json`.
- `v17-proto-mutant-*.json`: earlier v17-harness results. Context only.
- `fx-cur.txt` (m4b shape evasion on current bytes); `holes-cur.txt` (H1, H2, H3, C0); `h3b-cur.txt`; `liveh1-cur.txt` (live map-only lanes with BG hits).
- `r57-counter-on-committed-r57-receipt.json` (green baseline); `r58-counter-absent-receipt.json`; `r58-counter-on-committed-r57-receipt.stderr.txt` (crash); `r58-counter-selftest-final.stderr.txt` (crash); `r58-counter-selftest.stdout.txt` (empty).
- `r58-runner-path-selftest-unmodified.json` (19/19); `r58-runner-path-selftest-final.json`; `r58-runner-urlprobe-documentURL.json` (19/19 with `document.URL` read).
