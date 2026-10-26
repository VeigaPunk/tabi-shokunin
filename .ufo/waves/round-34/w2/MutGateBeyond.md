# MutGateBeyond — round 34 w2 mutation probe beyond the frozen 20 (C2)

**Verdict: holds.** 31 new single-point mutants of `scripts/check-bidi-runtime.mjs` rule lines that the frozen round-33 w2 MutGateV2 set of 20 does not touch were each applied exactly once to the gate at the wave-1 integration commit `04f9623dde8ad35d470cecf766e421eafbcb47fa` (gate sha256 `370e8e95417e16dd3535f2dd5015a0b820655934200d489434fb642db7d86c87`, 1233 lines), parse-checked with `node --check`, and run through the gate's own `--selftest` (56 cases) inside the seat's scratch clone. **16 killed** (selftest exit 3 with ≥ 1 `CASE … FAIL` line — the frozen counter's kill rule), **15 survived**, **0 invalid-syntax** (no SyntaxError kill), and every clone reset was byte-verified back to the pristine sha. The survivors do not weaken the C2 claim — that claim is scoped to the 20 frozen mutants, and all 20 frozen find texts still occur exactly once at `04f9623` on lines disjoint from every site probed here — they are **recorded limits for entry §5** (`corpus/knowledge/bidi-gate-selftest-round-34.md`): beyond the frozen set, the self-test's kill coverage is thin on receipt-shape presence checks, aggregate arithmetic it never asserts, and predicate conjuncts for which no refusal case exists.

## Baseline (pristine, green)

```
S=/fast/scratch/hyaku/tabi-r34/MutGateBeyond
mkdir -p "$S/tmp" "$S/out"                                                    # exit 0
git clone --shared -q /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"   # exit 0
git -C "$S/clone" checkout -q --detach 04f9623dde8ad35d470cecf766e421eafbcb47fa
  → HEAD=04f9623dde8ad35d470cecf766e421eafbcb47fa; rev-parse --show-toplevel == "$S/clone"
wc -l  → 1233 lines; sha256sum → 370e8e95417e16dd3535f2dd5015a0b820655934200d489434fb642db7d86c87
node --version → v24.21.0
node harness.mjs check     → pristineParse=0; all 31 find texts occur exactly once in the pristine gate
node harness.mjs baseline  → exit 0; "BIDI_RUNTIME_SELFTEST verdict=clean cases=56 passed=56"
```

## Method

Harness `harness-mutate.mjs` (committed copy in the evidence dir; round-33 MutGateV2 protocol, battery leg dropped — this seat's detector is the self-test alone). Per mutant:

1. `git checkout -q --force --detach 04f9623…` + `clean -qfdx`; assert `rev-parse --show-toplevel` == clone; assert gate sha == pristine.
2. Assert the find text occurs **exactly once**; apply the single replacement to `scripts/check-bidi-runtime.mjs` in the scratch clone working tree (no commit needed — the self-test runs from the working tree).
3. Parse gate: `node --check <gate>` — a SyntaxError is recorded `invalid-syntax` and is **never** a kill.
4. Detector: `TMPDIR=$S/tmp node <clone>/scripts/check-bidi-runtime.mjs --selftest` (cwd = clone). **Killed iff exit 3 AND ≥ 1 line matching ` CASE … FAIL$`** (adopted verbatim from the frozen counter: "a crash, a timeout or any other exit is NOT a kill"). Exit 0 = survived.
5. Reset to `04f9623…`; re-verify gate sha == pristine (`restored=true`).

Site disjointness (measured, not asserted): the 20 frozen find texts extracted from `.ufo/waves/round-34/counters/c2-gate-mutants.mjs` each occur **exactly once** at `04f9623` on lines {144, 145, 146, 149, 373, 388, 434, 447, 750, 753, 757, 778, 797, 798, 811, 843, 860, 867}; the 31 new sites are on lines {147, 148, 282, 292, 301, 307, 334, 339, 356, 357, 361, 495, 527, 732, 738, 740 (×2), 769, 770, 771, 773, 777, 786, 791, 825, 826, 828, 829, 863, 864, 865} — **zero line overlap**. B27 and B28 are two distinct tokens of the same newRows-filter line (740), each applied separately.

## Results (31 mutants; full find/replace + per-mutant data in `out/mutants-final.jsonl`, raw self-test output in `out/B*-selftest.txt`)

| id | site (line) | rule mutated | mutation | verdict | exit | killing / first failing case |
|----|------|----------|---------|---------|------|---------|
| B01 | :769 | receipt schema check | check → `if (false)` | **SURVIVED** | 0 | — |
| B02 | :770 | receipt fixtureSha256 == FIXTURE's | check → `else if (false)` | killed | 3 | `fixture-sha-differs` |
| B03 | :771 | receipt browserVersion presence | check → `else if (false)` | **SURVIVED** | 0 | — |
| B04 | :773 | driver path != gate path | check → `else if (false)` | **SURVIVED** | 0 | — |
| B05 | :777 | driver sha256 == declared | check → `else if (false)` | killed | 3 | `v2-m11-driver-sha-differs` |
| B06 | :786 | runs ≥ 2 | `< 2` → `< 1` | killed | 3 | `one-run-only` |
| B07 | :791 | per-transcript sha256 == declared | check → `if (false)` | killed | 3 | `transcript-tampered` |
| B08 | :825 | binding: first screenshots equal | check → `if (false)` | killed | 3 | `run-screenshots-differ` |
| B09 | :826 | binding: chromedriverVersion equal | check → `else if (false)` | killed | 3 | `v2-m04-runs-chromedriver-differ` |
| B10 | :828 | live binding: screenshot | check → `if (false)` | killed | 3 | `live-screenshot-differs` |
| B11 | :829 | live binding: chromedriverVersion | check → `else if (false)` | killed | 3 | `live-chromedriver-differs` |
| B12 | :148 | WS_SESSION segment shape | `{32}` → `{8}` hex | killed | 3 | `golden-two-runs` (+25 more) |
| B13 | :147 | WS_LOOPBACK host requirement | regex → `/^ws:\/\//` | killed | 3 | `v2-m17-ws-url-off-loopback` (only killer) |
| B14 | :864 | failing arithmetic | `out.failing = 0;` | killed | 3 | `v2-f7-decorated-measured` |
| B15 | :863 | admitted arithmetic | counts all rows | killed | 3 | `old-source-row` (+47 more) |
| B16 | :732 | population arithmetic | counts table rows, not non-empty Measured cells | **SURVIVED** | 0 | — |
| B17 | :865 | unmeasured arithmetic | `out.unmeasured = 0;` | **SURVIVED** | 0 | — |
| B18 | :282 | R1's own ws-loopback row check | check → `if (false)` | **SURVIVED** | 0 | — |
| B19 | :292 | R3 browsingContext.load conjunct | check → `if (false)` | **SURVIVED** | 0 | — |
| B20 | :357 | R16 predicate | `() => null` | **SURVIVED** | 0 | — |
| B21 | :301 | R5 locateNodes localName | `h1` → `h2` | killed | 3 | `golden-two-runs` (+3 more) |
| B22 | :307 | R7 innerWidth-after-setViewport ordering | `c.i > vp.i` → `c.i > -1` | **SURVIVED** | 0 | — |
| B23 | :334 | R11 fixture-header conjunct | conjunct dropped (replace empty) | **SURVIVED** | 0 | — |
| B24 | :339 | R12 getData-after-collector ordering | `c.i > col.i` → `c.i > -1` | **SURVIVED** | 0 | — |
| B25 | :356 | R15 cookie value == "1" | value check dropped | **SURVIVED** | 0 | — |
| B26 | :361 | R17 handleUserPrompt-after-prompt ordering | `c.i > e.i` → `c.i > -1` | **SURVIVED** | 0 | — |
| B27 | :740 | s1 usedBy-names-entry | `includes(entry)` → `includes("corpus/knowledge/never.md")` | killed | 3 | `golden-two-runs` (+47 more) |
| B28 | :740 | s1 row-new-at-this-rev | `&& !regThen.has(id)` → `&& true` | **SURVIVED** | 0 | — |
| B29 | :495 | parseTable header-match | inverted | **SURVIVED** | 0 | — |
| B30 | :527 | gateRows S-id shape | `{3,}` → `{4,}` digits | killed | 3 | `golden-two-runs` (+47 more) |
| B31 | :738 | entry source-line regex | `/^source:/i` → `/^sourcex:/i` | killed | 3 | `golden-two-runs` (+47 more) |

All 31 `parseOk=true`; every mutant gate sha is in `out/mutants-final.jsonl` (`mutGateSha256`). Pre-run predictions were kept as calibration only (`expect` field); two were wrong (B23, B29) — the recorded verdicts above are the measured ones.

## Survivors = recorded limits for entry §5 (findings, not claim changes)

1. **B01** — no self-test fixture writes a receipt schema other than `RECEIPT_SCHEMA`; a foreign-schema receipt passes the mutant gate.
2. **B03** — no fixture omits `browserVersion`; the presence rule's own refusal is never observed (a receipt without it only surfaces indirectly, as a `t2-run` on cited R1 rows via `ctx.browserVersion = undefined`).
3. **B04** — `driver-is-the-counter` is refused by the byte-copy rule (:778, frozen M13's line) instead: the fixture writes the driver bytes *at* the gate path, so `sha256(drv) == sha256(gateBuf)` fires. The path rule is redundant cover in every constructible fixture (`CASE id=driver-is-the-counter … reason=t1-receipt PASS` under the mutant).
4. **B16** — no fixture has an empty Measured cell, so counting table rows equals counting non-empty cells in every case; the population rule's non-empty filter is unpinned.
5. **B17** — the self-test asserts exit/admitted/population/reason/detail but **never `unmeasured` (nor `distinct`)**; the aggregate is unobserved output.
6. **B18** — R1's own `WS_LOOPBACK` row check is shadowed: `sessionOf` (:381 area) checks the same constant against the same URL on the receipt leg first, so any URL failing R1's check already fails as `t1-receipt` and the row predicate is unreachable (`v2-m17-ws-url-off-loopback … reason=t1-receipt PASS` under the mutant).
7. **B19** — no fixture drops `browsingContext.load` while keeping a successful navigate; R3's load-event conjunct is unpinned.
8. **B20** — `PREDICATES.R16` is dead in the runnable path: R16+`yes` is refused by `x2-no-counterpart` earlier in the else-if chain, R16+`no` is unmeasured and never predicated (`stop-loading-marked … reason=x2-no-counterpart PASS` under the mutant).
9. **B22 / B24 / B26** — the after-action ordering conjuncts of R7 (innerWidth after setViewport), R12 (getData after addDataCollector) and R17 (handleUserPrompt after userPromptOpened) have no refusal case; the round-32/33 ordering cases pin only R8, R9 and R14.
10. **B23** — no fixture alters the `x-tabi-fixture` header value; R11's header requirement is unpinned. (Harness label said "inverted"; the as-run replacement was a drop — corrected here and in the final ledger.)
11. **B25** — no fixture carries `tabi_fixture` with a wrong value (`live-row-disagrees` removes `storage.getCookies` entirely); the value half of R15 is unpinned.
12. **B28** — no fixture cites a baseline-present registry id that also has a `## Gate` row (`old-source-row` cites S001, which has no Gate row, so the witness fallback refuses anyway); the "row must be new at this rev" conjunct is unpinned in the positive direction.
13. **B29** — the inverted header check is unobservable: entryDoc's 5-cell separator line `|---|---|---|---|---|` fails the header match and becomes the anchor under the inversion, collecting the identical data rows (verified by unit-running the mutated `parseTable`: 16 rows, first R1). Header-anchored and separator-anchored parsing are indistinguishable on every well-formed fixture the self-test builds.

Kill-side observations: B13 (`WS_LOOPBACK` weakened) is killed by exactly one case (`v2-m17`) — the loopback constant is load-bearing only through that single refusal case, since R1's own check is shadowed (B18). B12 (`WS_SESSION` shape) is the opposite: 26 cases fail, the strongest kill in the set.

## Restoration evidence

- Per mutant: reset to `04f9623…` before and after; `restored=true` and `restoredSha=370e8e95…` on all 31 `out/mutants-final.jsonl` lines.
- End state: `git -C clone rev-parse HEAD` → `04f9623dde8ad35d470cecf766e421eafbcb47fa`; `status --porcelain` → 0 lines; gate sha256 → `370e8e95417e16dd3535f2dd5015a0b820655934200d489434fb642db7d86c87` (== pristine).

## Housekeeping / honesty

- Commands and exit codes are pasted above; nothing left unrun that this report claims. The self-test outputs are the recorded detector outputs (no re-run needed; the first FAIL-line extraction used a trailing-space-sensitive pattern and was re-derived from the saved outputs with `/ FAIL$/` — the raw `out/mutants.jsonl` keeps the as-run extraction, `out/mutants-final.jsonl` the corrected one).
- No network fetches; no tools installed or upgraded (node v24.21.0, git as present); no browser processes started (the self-test's live leg is a synthetic `liveRunner`; `--live` was never passed).
- No lane tracked file, lane git index, lane jj state, sibling repo, or fleet-root file written. Writes: this report, the evidence dir `.ufo/waves/round-34/w2/MutGateBeyond/`, scratch `/fast/scratch/hyaku/tabi-r34/MutGateBeyond/` (deleted after receipts were copied).
- Seats report findings only; nothing was repaired and no lane file was changed.

Report: .ufo/waves/round-34/w2/MutGateBeyond.md
Evidence: .ufo/waves/round-34/w2/MutGateBeyond/harness-mutate.mjs · .ufo/waves/round-34/w2/MutGateBeyond/out/mutants-final.jsonl · .ufo/waves/round-34/w2/MutGateBeyond/out/mutants.jsonl · .ufo/waves/round-34/w2/MutGateBeyond/out/baseline-selftest.txt · .ufo/waves/round-34/w2/MutGateBeyond/out/B01..B31-selftest.txt
