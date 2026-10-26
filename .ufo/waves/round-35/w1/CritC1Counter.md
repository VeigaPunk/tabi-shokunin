# C1 attack — CritC1Counter (wave w1, round 35)

Frozen counter: `.ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs` (sha256 `5707a937…`, verified); adjacency gate `scripts/check-adjacency.mjs` (sha256 `4e2c2a64…`, verified). All scoring ran on scratch-clone commits of the freeze `a4bfef0f75027c915e715649950b1d46dcb33d83` with `--repo <scratch clone> --fleet /home/vgpnk/Projects/shokunin --json`.

## Verdict

The frozen C1 predicate is reachable by at least three constructions no more expensive than the disclosed J8 and strictly weaker in what they certify, and each clause of the counter has at least one demonstrable hole. (1) **E1 — the entire sweep can be screened `same-surface`**: all 381 non-mapped candidates pass with reason `same-surface`, 319 of them against surfaces that merely exist as baseline map-row labels for that sibling (no topical relation is checked; e.g. kaidoku's Go/Ghidra tool row `SKILL.md:652` is screened under `cdp-runtime-observation`, kake's CrUX/WebView data row `field-performance-cwv.md:134` under `musketeer-cdp-9222-profile-lease`), and the remaining 64 after adding six junk verified rows (one per lane with no baseline row: kotoba, mado, tsukuroi, mori, chousa, tameshi), each citing a PROVINCE.md line and an existing tabi quote. Predicate true, adjacency clean. (2) **E3 — n4's SIDE is a homograph trap**: split-declared new rows pass with sibling quotes whose "side word" states no side — `Report` as an imperative instruction (kake `SKILL.md:696`, quote "…Chromium audiences send no data). Report") and `never` as negation (kaidoku `2026-10-13-r2-skill-references-deep.md:79`, quote "…never broaden filesystem or CDP"). QUALITY 97's "the sibling itself states its side" is not tested. (3) **E2 — n1 accepts a declaration reused across rows**: two new rows whose tabi declarations are byte-identical text on two different lines (same new file) both pass n1 (the shared-tabi-ref guard compares ref strings, not text). Additional holes: BG omits a large browser-ground halo (≈606 broad-term sibling lines, incl. ≈307 with engine-flavoured vocabulary and concrete CDP/DevTools/Firefox/BiDi ground — the 383-candidate sweep answers only its own fixed set); n3's THIRD_LANE regex misses `census`/`audit`/`report`/`scan`/`inter-`/`cross-`/`other-lane` path families and over-blocks three of kagi's own-side enumeration lines; screen-ledger reasons are closed-vocabulary but semantically unvalidated and `screenFindings` are excluded from the predicate; and the claims' "minus the 67 round-34 candidates" is imprecise — the file holds 67 rows, only 22 intersect this round's pool (`priorCandidatesSkipped=22`). No construction is cheaper in row count than J8 (each of the 383 candidates needs exactly one account row, so 2 map + 381 screen rows is the minimum); the attacks degrade what the same count certifies.

Attacked: frozen C1 counter + its controls (J1–J8). Verdict: **defect** (line evidence below).

## Constructions scored (all with the frozen counter bytes; exit codes from `node <counter> --rev <rev> --repo <clone> --fleet /home/vgpnk/Projects/shokunin --json`)

| exp | rev (scratch clone) | exit | predicate | candidates | mapped | screened | unaccounted | newMapped | adjacency | refusals |
|---|---|---|---|---|---|---|---|---|---|---|
| E0 do-nothing (=J1 repro) | a4bfef0… | 1 | false | 383 | 0 | 0 | 383 | 0 | clean | [] |
| E1 screen-everything-same-surface | 518b22cde147d526bc947abe0129d82020eb05bb | 0 | **true** | 383 | 2 | 381 | 0 | 2 | clean | [] |
| E2 declaration-text-reuse | fa9231b5888a337d8726b46344fc1cd1c16e70e9 | 0 | **true** | 383 | 2 | 381 | 0 | 2 | clean | [] |
| E3 homograph-side | e6bf5066f0eafadfc80aa23ff0e403bf3dcdee90 | 0 | **true** | 383 | 2 | 381 | 0 | 2 | clean | [] |

Counter byte check: `sha256sum …/c1-adjacency-sweep-v3.mjs` → `5707a93742565c17d24dd4df37d2289e1a9dfe4646e313108357770909b436b9`.

### E1 (screen-everything-same-surface) — construction and evidence
- 6 junk helper rows added (split-declared, ruling_ref `-`), one per lane lacking a baseline row, each citing that lane's `PROVINCE.md` line at its pin and quoting the existing tabi `PROVINCE.md:9` line ("CDP session discipline (endpoints, targets, screenshot/DOM evidence"). Verified by the gate (adjacency clean, rows 24, verified 24).
- 381 screen rows, all `same-surface`; surfaces used: `cdp-runtime-observation` 136, `musketeer-cdp-9222-profile-lease` 106, `kimi-webbridge-plugin-internals` 66, `cdp-live-target-census` 9, `crit-helper-{kotoba,mado,tsukuroi,mori,chousa,tameshi}-0` 64.
- Topically mismatched screens (verified, zero screenFindings): `kaidoku-shokunin@49096c7e…:SKILL.md:652` → same-surface `cdp-runtime-observation` (the row is a Go/Ghidra `swiss-misread` tool description); `kake-shokunin@044048597d…:corpus/knowledge/field-performance-cwv.md:134` → `musketeer-cdp-9222-profile-lease` (the line is CrUX/WebView data reporting). The counter's same-surface check (counter lines 243-245) only requires a verified row with that folded (surface, sibling) — it never checks the candidate line belongs to that surface.

### E2 (declaration-text-reuse) — construction and evidence
- Two new rows on kake candidates `SKILL.md:696` and `corpus/knowledge/ops-automation.md:79`; tabi declarations are two lines with byte-identical text in new file `corpus/knowledge/w1-crit-attack.md` (line 1 and line 2), each naming both sibling paths.
- n1 accepts both: `isNew` (counter lines 258-267) compares trimmed text per file (both absent at baseline), and `n1-shared-tabi-ref` (line 285) compares the tabi_ref *strings* (`…w1-crit-attack.md:1` vs `:2`), not the declaration text. No clause compares declaration text across rows; the same sentence added to a second file is automatically "new" there.

### E3 (homograph-side) — construction and evidence
- Row `crit-new3-0` (kake, `SKILL.md:696`), sibling_quote `Chromium audiences send no data). Report` — BG via `Chromium`, SIDE via `Report`, where "Report" is an imperative addressed to the sibling's own verifier; the sibling states no side.
- Row `crit-new3-1` (kaidoku, `2026-10-13-r2-skill-references-deep.md:79`), sibling_quote `report path/digest disagreement as a mismatch and preserve ambiguity. Explicit path mappings are inference inputs and never broaden filesystem or CDP` — BG via `CDP`, SIDE via `never` (negation of the sibling's own rule); no side stated.
- Both declarations in new file `corpus/knowledge/w1-crit-attack.md` (a non-SKILL tabi file — n1 does not require SKILL.md). Both rows verified; same clean; predicate true.

## Clause holes (counter line evidence)

- **n1** (lines 258-267, 280-286): declaration may be any new line in any tabi file (E1/E3 use a new `corpus/knowledge/` file); the declaration need state nothing about an overlap — it only must contain the sibling lane token (line 280 `sibTok`) and the cited sibling file path as a **substring** (line 283 `decl.text.includes(c.path)`, so `corpus/knowledge/foo.md.bak` or a longer path containing `corpus/knowledge/foo.md` also passes); identical declaration text reused via distinct refs passes (E2); `isNew` is per-file trimmed-text absence, so a sentence that exists at baseline in file A is "new" in file B.
- **n2** (lines 268-272, 286): near-vacuous as disclosed — no baseline row cites a candidate line (`baseCited` empty for all 383). The prior-candidate exclusion (lines 134-141) trims both sides before comparing, so a line differing only in trailing whitespace from a round-34 candidate is dropped (treated as identical). Claims surface text "minus the 67 round-34 candidates" vs frozen output `priorCandidatesSkipped=22`: the round-34 file holds 67 rows, 22 intersect this round's pool (raw pool 426 − 22 = 383).
- **n3** (line 84, applied at 287): `THIRD_LANE = /(?:sibling|overlap|adjacen|fleet-skill-audit|description-rewrites)/i` matches exactly 25 of the 383 candidates (kagi `adjacency-breadth.md` 3, `adjacency-scope.md` 14, kotoba `sibling-description-rewrites-round8.md` 8). **Misses** the `census`/`audit`/`report`/`scan`/`review`/`inter-`/`cross-`/`other-lane` families: a third-lane record at e.g. `corpus/knowledge/lane-census.md`, `interlane-audit.md`, `other-lanes-report.md` or `cross-lane-scan.md` would pass n3. **Over-blocks** kagi's own-side enumeration lines `adjacency-breadth.md:23/75/76` (filesystem breadth facts: `$HOME/.local/share/…`), which then can never be mapped.
- **n4** (line 289): SIDE is a vocabulary regex, not a side-stating test. Homographs among the 383 candidates: `never` (5 lines — e.g. chousa `archived-export-intake.md:141` "a resolved hop is never opened…", kaidoku `SKILL.md:585` "never cite the mapper line", tsukuroi `oom-event-plane.md:332`), `report`/`reports` (7 — kake `SKILL.md:696`, kaidoku `r2-skill-references-deep.md:79`, kama `consumer-registry.md:332`), `shared`/`share` (15 — including false positives from the filesystem path `$HOME/.local/share` in kagi `adjacency-breadth.md:23/75/76`, kagi `cdp-bridge-1password.md:20/27`, tameshi `gates-survey-kagi.md:287`), `stays` (2 — "Chromium sandbox stays on"), `stay` (1 — "stay lock-free"), `lease` (7, ambiguous noun/verb). BG and SIDE are independent regexes over the same quote window (line 289), so neither constrains the other semantically.
- **BG** (line 82): missing plain `Chrome`, `Firefox`, `browser`, `DevTools`, `headless` (alone), `Electron`, `gecko`/`marionette`, `BiDi`, `w3c`, `user-agent`, `WebView`. Scan of the 21 pins (SKILL.md + `corpus/knowledge/**/*.md`, tabi-naming lines excluded): 606 sibling lines match at least one broad browser term but not BG — by term electron 215, browser 171, headless 133, chrome 58, useragent 20, w3c 19, webview 9, firefox 6, devtools 6, bidi 3, gecko 1; by lane kaidoku 297, game-dev-3d 70, kake 62, kotodama 24, kagi 22, kumitate 20, mado 15, tsukuroi 14, kengaku 13, revenger 12, game-dev-2d 11, chousa 9, audio 7, kama 6, kasegi 4, lore 2, tameshi 1. Strictly engine-flavoured subset (chrome/firefox/devtools/electron/bidi/gecko/marionette/useragent/webview): 307. Concrete browser-ground lines the frozen candidate set omits: kama `listener-census.md:242` ("curl … ws://127.0.0.1:9222/devtools/browser/…" — CDP ground), kaidoku `2026-10-13-r2-frontier-prereqs.md:46` ("DevTools listening on"), kake `field-performance-cwv.md:152` ("Running lab tools such as Lighthouse or DevTools is browser work" — arguably the split itself), kagi `adjacency-breadth.md:128` ("Chrome `SingletonSocket`…"), kumitate `jj-workspace-seat-containment.md:2/75/80/167` (Firefox Source Docs). Estimate: the sweep omits between ~30 (conservative true browser ground) and 307 (strict vocabulary) sibling lines.
- **Screen ledger** (lines 224-250): reasons are closed-vocabulary but never validated against the line (`not-browser-sense`/`third-lane-report`/`no-claim-declared` carry no check at all; `same-surface` only checks row existence). `screenFindings` (bad header/columns/reason/quote/non-candidate/duplicate) are excluded from the predicate (line 307: `gate.verdict === 'clean' && unaccounted === 0 && newMapped >= 2`), so an invalid ledger never fails the predicate by itself — each defect only surfaces as an unaccounted candidate.

## Bars
- QUALITY 87: met textually by E1 (every candidate mapped or screened under a closed reason), while the reasons carry no semantic content — "no single count is the answer" still holds, but the ledger's reasons are not evidence.
- QUALITY 88 / 97: violated by E3 (and by E1/E2's declarations): naming is lexical, and a split-declared row need not cite a sibling line that states a side ("…the sibling itself states its side" is untested).
- QUALITY 90: J8 remains the cheapest *row-count* construction (383 accounts minimum; each candidate needs exactly one account, and no row maps more than one candidate — duplicate (lane,path,text) groups = 0). E1/E3 show the same minimum row count certifying strictly less.
- QUALITY 91: n2's rename route remains invisible on this set; nothing in the counter can see a same-surface fact of an existing row.

## Commands (exit codes)
```
$ git -C <scratch>/clone checkout -q --detach a4bfef0f75027c915e715649950b1d46dcb33d83   # exit 0
$ node .ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs --rev a4bfef0… --repo <scratch>/clone --fleet /home/vgpnk/Projects/shokunin --json   # E0: exit 1
$ TMPDIR=<scratch> node <scratch>/build.mjs   # E1 exit 0, E2 exit 0, E3 exit 0 (see table)
$ node <scratch>/scan.mjs ; node <scratch>/scan2.mjs   # BG blind-spot scan, exit 0
$ git -C <scratch>/clone show 518b22c…:corpus/adjacency.tsv | …   # E1 rows 18-25
$ git -C <scratch>/clone show 518b22c…:corpus/adjacency-screen-browser.tsv | …   # 381 same-surface rows
$ git -C <scratch>/clone show fa9231b…:corpus/knowledge/w1-crit-attack.md | cat -A   # identical declaration lines
```

## Deliverables
- This report: `.ufo/waves/round-35/w1/CritC1Counter.md`
- Output dir `.ufo/waves/round-35/w1/CritC1Counter/`:
  - `E0-freeze-nothing.json`, `E1-screen-all-same-surface.json`, `E2-declaration-text-reuse.json`, `E3-homograph-side.json` (raw counter JSON receipts)
  - `cand-meta.json` (all 383 candidates with side-word/third-lane metadata), `cand-dups.json`, `bg-blindspots.json`, `bg-blindspots-full.json` (606 omitted lines)
  - `build.mjs`, `scan.mjs`, `scan2.mjs` (scoring/scans; scratch clone removed per lane contract)
