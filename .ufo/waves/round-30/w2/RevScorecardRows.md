# RevScorecardRows — round-30 w2 self-assessment calibration at `072af95fe2822f0785a6ff88a578e2142dd258e5`

**Verdict: holds.** I attacked the lane's round-30 self-assessment numbers: every tally and reading in the SCORECARD.md round-30 corrections block (`SCORECARD.md:1503-1508`) and the SKILL.md round-30 registry section (`SKILL.md:2547-2561`), the three `claims.json` frozenDigests against the bytes at the rev, the frozen counter predicates (C1 `fault_total 27 / survivors 0 / benign_total 13 / benign_killed 0`; C2 `population 2 / admitted 2` with `--live`), all five claims.json no-harm counter readings, and the frontier row counts (S116/S117/S118 appended, 23 used-by changes, QUALITY criteria 74–79). Every stated number equals an independent observation in a clean shared clone at the rev (porcelain empty); the lane's own `check-selfassessment.mjs` independently reports `mismatches = 0` and its findings list matches my reading line-for-line. **Zero numeric mismatches.** Three wording traps for the L1's round-30 SCORECARD disposition are listed below (lines it must not repeat); they are precision traps, not defects — the lane already discloses each one.

All measurement ran only in `/fast/scratch/hyaku/tabi-r30/RevScorecardRows/clone` (`git clone --shared` + `checkout -q 072af95fe…`, `git status --porcelain` = 0 lines). The lane checkout was never written; git in the lane was read-only. No tools installed or updated (node v24.21.0 and curl pre-existing; no pacman transaction).

## 1. claims.json frozenDigests = bytes at the rev — 3/3 match

`sha256sum` in the clone at `072af95fe…`:

| file | claims.json frozenDigest | observed | |
|---|---|---|---|
| `scripts/check-gate-mutants.mjs` | `02945f882ea9…cec3a55` | `02945f882ea9c62a3f42934f13b4dc52887ebd93a5a69dd6526d20f01cec3a55` | match |
| `scripts/gate-mutants.json` | `cd1c27a2a971…53833` | `cd1c27a2a971f8a4d4208fd53efe3adbc776efacb7072201af8bb55b93853833` | match |
| `scripts/check-frontier-admission.mjs` | `cadef57e8d96…09eca` | `cadef57e8d9627a02d7e8c5404689225cf5b4de361e816f62c4127b28a509eca` | match |

The C1 counter's own output confirms `counter_sha256_at_rev == counter_sha256_running == frozen`. Also verified the lane's `.ufo/waves/round-30/claims.json` (the file read first) is byte-identical to the rev blob: sha256 `515ac2c3b90c0a8e9d08a442100d071eb7e9abe5b05ea3b2c39268486f1f157e` both as working-tree file and `git show 072af95fe…:.ufo/waves/round-30/claims.json`.

## 2. Self-test tallies stated vs observed (all four gates, clean clone)

Command: `node scripts/<gate>.mjs --selftest` (TMPDIR under scratch), per gate; exit codes in §6.

| Stated at | Stated | Observed | |
|---|---|---|---|
| `SCORECARD.md:1507` | s106 `--selftest` (10/10) | `S106_SELFTEST verdict=clean cases=10 passed=10`, exit 0 | match |
| `SCORECARD.md:1508` | release-pins `--selftest` (29/29) | `RELEASE_PINS_SELFTEST verdict=clean cases=29 passed=29`, exit 0 | match |
| `SKILL.md:2558` | gate-mutants `cases=12, passed=12` | `GATE_MUTANTS_SELFTEST verdict=clean cases=12 passed=12`, exit 0 | match |
| `SKILL.md:2559` | frontier-admission `cases=24, passed=24` | `FRONTIER_ADMISSION_SELFTEST verdict=clean cases=24 passed=24`, exit 0 | match |
| `SKILL.md:2560` | s106 row `cases=10, passed=10` | same run as :1507 | match |
| `SKILL.md:2561` | release-pins row `cases=29, passed=29`; "nine round-30 cases assert their reason id" | same run as :1508; exactly 9 cases print `expected_reasons=` (f1-old-tag, f2-dotdot, f3-old-bytes, f4-range-past-last, f4-anchor-lacks-range-token, drift-superseder-teaches-without-prefix, drift-superseder-not-at-stable-tag, absence-404-present-with-marker, absence-404-body-lacks-marker) | match |
| `SCORECARD.md:1507` | "added three cases: same-length tamper, duplicate anchor, receipt byte-count mismatch" | case ids `same-length-tamper-invalid`, `duplicate-anchor-invalid`, `receipt-byte-count-mismatch-invalid` present; 7 round-29 cases + 3 = 10 | match |
| `SCORECARD.md:1508` | "added nine reason-pinned cases" | 20 pre-existing cases + 9 reason-pinned = 29 | match |

Stale-tally citations in the corrections all resolve to genuine stale tallies (read raw):

- `SCORECARD.md:1438` — round-28 C1 depth row: "…`--selftest`: 5 cases at baseline → … post-edit result not run" (stale s106 figure) ✓
- `SCORECARD.md:1466` — round-29 correction: "`check-s106-evidence.mjs` `--selftest` (7/7)" ✓
- `SCORECARD.md:1479` — round-29 disposition C1 row: "…`S106_SELFTEST verdict=clean cases=7 passed=7`…" ✓
- `SCORECARD.md:1485` — "The `scripts/check-release-pins.mjs` self-test runs `cases=20`" ✓

Cross-references also hold: SKILL.md round-29 rows say release-pins `cases=20` (:2543), s106 `cases=7` (:2544), selfassessment `cases=22` (:2545) — exactly what the round-30 corrections supersede.

## 3. Frozen counter readings at the rev (claims C1/C2 predicates)

- **C1**: `node scripts/check-gate-mutants.mjs --rev 072af95fe… --json` → exit 0, `fault_total 27, fault_killed 27, fault_survivors 0, survivors [], benign_total 13, benign_killed 0, benign_killed_ids [], clean true`; both gates `pristine_clean: true` (10/10, 29/29). Matches the goal's L1 reading "27/27 killed, 0 benign killed" and claims C1 predicate exactly. Mutant arithmetic checks out: 9 s106 fault + 18 pins fault = 27; 6 s106 benign + 7 pins benign = 13. All 14 `before`-named survivor ids (s106-sha-drop … pins-notfound-body) are `killed: true` at the tip, so a disposition restating "14 → 0" is grounded. Raw output: `w2/RevScorecardRows/c1.json` (sha256 `0392fc10…4122e2`).
- **C2**: `node scripts/check-frontier-admission.mjs --rev 072af95fe… --frontier rate-tos-signal --since 2026-10-26 --live --json` → exit 0, `population 2, admitted 2, failing 0, clean true, live true`; entries `corpus/knowledge/host-published-rate-limit-headers.md` (ids `[S117]`) and `corpus/knowledge/rate-limit-policy-fields.md` (ids `[S116]`). Matches "population 2 / admitted 2". Reproduced twice (07:49:39Z and 07:56:58Z UTC, identical result). Raw outputs: `w2/RevScorecardRows/c2.json`, `c2-rerun.json` (sha256 `b904ad99…fb4c` both).

## 4. No-harm counters (claims.json noHarmChecks) — 5/5 as claimed

| command (clean clone, REV = 072af95fe…) | claimed | observed | exit |
|---|---|---|---|
| `node scripts/check-selfassessment.mjs --rev $R --json` | mismatches = 0 | `mismatches: 0, clean: true` (92 couldNotEvaluate by design, 15 superseded) | 0 |
| `node scripts/check-selfassessment.mjs --selftest` | (tally restated at `SCORECARD.md:1486` = 22) | `cases=22 passed=22` | 0 |
| `node scripts/check-gate-registry.mjs --rev $R` | nonconformant = 0 | `rows=36 gates=20 nonconformant=0 findings=0`; both new gates conformant (gate-mutants row=2558, frontier-admission row=2559) | 0 |
| `node scripts/check-s106-evidence.mjs --rev $R` | valid = true | `verdict=valid … valid=true` | 0 |
| `node scripts/check-release-pins.mjs --rev $R --stable 156.0.8078.47` | unresolved = 0 | `population=23 resolved=23 unresolved=0 holds=16 drifted=7` — also matches the round-29 SCORECARD C3 row's "population 23 … holds 16, drifted 7" | 0 |
| `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` | exit 0 | terminal line `ok …/corpus/SOURCES.md` — **but 19 `W04 duplicate url across scopes` warnings printed first, including S118 (same URL as S068, the disclosed same-URL twin, lesson round-30.md:39)** | 0 |

The selfassessment findings list independently confirms my stale-tally reading: 1438 (5→10, superseded), 1466 (7→10, superseded), 1479 (7→10, superseded), 1485 (20→29, superseded), 1507 (10→10 current), 1508 (29→29 current) — i.e. the lane's own calibration gate and this seat's reading agree line-for-line.

## 5. Row counts

- **S116/S117/S118 appended**: `corpus/SOURCES.md:130-132`, after S115; lesson round-30.md:11 records the renumber map (staged S159 → S116, staged S182 → S117) ✓.
- **23 used-by changes**: `git diff f7c0317e…..072af95fe… --numstat -- corpus/SOURCES.md` = `26 23` (3 appended rows + 23 modified rows); the changed-id list is exactly 23 modified ids (S033, S034, S041, S042, S045, S062, S064, S071, S074, S077, S078, S079, S080, S081, S093, S094, S096, S097, S098, S099, S100, S105, S106) + 3 appended. Lesson round-30.md §"`used-by` changes" (:75-102) lists old→new for exactly the same 23 ids ✓ (criterion 75 reciprocity ledger).
- **QUALITY criteria 74–79 exist**: `corpus/QUALITY.md:400` (74 Gate-quote contiguity), `:411` (75 used-by reciprocity), `:421` (76 self-test case names its check), `:430` (77 numbered-mistake table+subsection), `:437` (78 correction cites document+line), `:446` (79 counted population states its selection rule) ✓.
- **Lesson history consistent**: `git show 38891ca0:corpus/lessons/round-30.md | wc -l` = 111 (the Gate section, created in 38891ca0 whose stat shows `corpus/lessons/round-30.md | 111 ++`); at the tip the file is 241 lines, so 072af95fe appended 130 (mistakes M1–M6, population rule, addenda). No document states these counts; recorded for provenance only.
- **Receipts structure**: `corpus/evidence/round-30/frontier/` = S116.json, S117.json, `bytes/S116.txt`, `bytes/S117.html`, `refetch/{S116,S117}.json` + `refetch/bytes/` — the two-entry × (receipt + bytes + independent refetch) shape the C2 predicate requires ✓.

## 6. Commands and exit codes (all run in the scratch clone)

```
git clone --shared …/tabi-shokunin $S/clone && git -C $S/clone checkout -q 072af95fe…   # ok; status --porcelain → 0 lines
sha256sum scripts/check-gate-mutants.mjs scripts/gate-mutants.json scripts/check-frontier-admission.mjs   # exit 0
for g in check-s106-evidence check-release-pins check-gate-mutants check-frontier-admission; do node scripts/$g.mjs --selftest; echo exit=$?; done   # 0,0,0,0
node scripts/check-gate-mutants.mjs --rev 072af95fe… --json          # exit 0 (26.5 s)
node scripts/check-frontier-admission.mjs --rev 072af95fe… --frontier rate-tos-signal --since 2026-10-26 --live --json   # exit 0 (×2 runs)
node scripts/check-selfassessment.mjs --rev 072af95fe… --json        # exit 0
node scripts/check-selfassessment.mjs --selftest                     # exit 0
node scripts/check-gate-registry.mjs --rev 072af95fe…                # exit 0
node scripts/check-s106-evidence.mjs --rev 072af95fe…                # exit 0
node scripts/check-release-pins.mjs --rev 072af95fe… --stable 156.0.8078.47   # exit 0
/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi   # exit 0
git diff f7c0317e…..072af95fe… --numstat -- corpus/SOURCES.md        # 26 23
node -e "<vm-extract normalise(); compare my live bytes to committed>"   # first attempt exit 1 (regex miss), fixed → S117 normalised_equal=true; S116 normalised_equal=true raw_equal=true
```

One failed intermediate: the first `normalise` extraction exited 1 (`extract_failed`) because the ENTITIES regex required a newline before `};`; fixed and rerun successfully. No other non-zero exits.

## 7. Network fetch record (read-only HTTPS GETs, public docs/spec pages only)

Counter `--live` runs (its own curl fetches of the two receipt urls): 2026-10-26T07:49:39Z and 07:56:58Z, both admitted (HTTP 200 implied by l1 passing).

Independent refetches by this seat (curl, 2026-10-26T07:55:01Z):

| URL | HTTP | bytes | sha256 | vs committed |
|---|---|---|---|---|
| `https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-11.txt` | 200 | 67,097 | `d6016dd0db5a33ba3f1e6b6f4c84e9b5ecc00986822d5212bab831f6c2d1d412` | **byte-identical** to `bytes/S116.txt` (and to receipt sha256) |
| `https://docs.discord.com/developers/topics/rate-limits` | 200 | 408,912 | `f9ba1d6e37516812a891cef68069ea5b65443cd58a63ecbf3182fe54bd1a0e95` | **differs raw** from `bytes/S117.html` (`b73dc7d190db10ff53213ff30e288a6d1ddbd8febf5756664fa5a8cb9f0583c3`, fetched 06:40:02Z); **normalised text equal** (counter's own `normalise()` applied to both); receipt quote present in both (2 occurrences each) |

The S117 raw drift is disclosed, not hidden: lesson round-30.md:26 "S117 raw bytes differ per response, normalised text identical"; the counter's l3 comment (:52-53) and code (:223) compare normalised bytes; claims C2 predicate says "the live source **at measurement time** still containing the quote with **normalised text equal** to the committed bytes". My independent refetch confirms normalised equality holds outside the counter's own fetch too.

## 8. Lines the L1 must not repeat in the round-30 SCORECARD disposition (wording traps, not defects)

1. **Do not write "live refetch byte-identical" for S117.** Raw bytes differ per response (lesson round-30.md:26); the correct phrasing is "normalised text equal" (l3, script :52-53/:223). S116 alone is raw-identical (`d6016dd0…d412` both). A disposition claiming raw byte-identity for both would be false the moment anyone re-fetches Discord.
2. **Do not write census validate "no findings".** It exits 0 but prints 19 `W04 duplicate url across scopes` warnings, including S118 itself (same URL as S068 — the disclosed same-URL twin, lesson round-30.md:39). Correct phrasing: "exit 0; 19 W04 duplicate-url warnings, S118/S068 expected twin".
3. **Do not restate the C1 counter as environment-leak-free.** Lesson M5 (round-30.md:143) discloses the wave-1 finding that a `process.cwd()`-reading self-test case kills every fault mutant vacuously; the compensating check is wave-2's kill-attribution audit (another seat's item), and counter v2 is next-round planned. The disposition may claim "27/27 killed with every killing case attributed by reading" only after that audit lands.
4. **Do not restate C2 `--live` as a network-mandatory guarantee.** Lesson M6 (:144) discloses that `fetchLive` accepts `file://`, follows off-host redirects, and inherits `~/.curlrc`/`~/.netrc`; compensating checks (https-only receipt urls; network-namespace re-read) are wave-2 seats' items. Phrase the live reading as "l1 + l3 at measurement time", not "proves live-network provenance".
5. The four stale-tally citations (`SCORECARD.md:1438`, `:1466`, `:1479`, `:1485`) all resolve to genuine stale tallies — safe to restate the corrections block as written; no line-number drift.

## 9. Residual risk / verification gaps

- The claims' **baseline "before" readings** (`fault_survivors = 14`, `population = 0`) were not re-measured by this seat — they are frozen-before-data control artifacts under `.ufo/waves/round-30/baseline/`; control re-verification belongs to the w2 control seats.
- Round-28/29 seat-count numbers in the SCORECARD tail (64/44/39/83 seats, 62.5% m_flash) are process records in `.ufo/waves/*`, not byte-observable at the rev; outside this item's calibration scope.
- Receipts for this seat: `w2/RevScorecardRows/{c1.json, c2.json, c2-rerun.json, live/S116.txt, live/S117.html}` (sha256s in §3/§7; copies verified in the lane output dir).
