# MutGateV2 — round 33 w2 mutation probe: gate v2 receipt leg (C2)

**Verdict: holds.** 20 valid single-point mutants of `scripts/check-bidi-runtime.mjs` at `042d6d9abf97d567d495652a85eabc851b81adc1` (gate sha256 `62453b55e5e5de331ee6e8fdb3fa8b8ddbf3b43a7b6da944a9544b3af8deac75`) were each run against both frozen detectors: gate `--selftest` (44 cases) and the freeze-commit-bytes battery `.ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs` (sha256 `51ace65fcece8e794b80afdb386638c755b3aa137297c33a34ffce7fb24e812b`, byte-identical to blob `e6b0a90:…`). 9 mutants are killed (8 by both detectors, 1 battery-only — M10); **11 survive both detectors** — reported below as coverage limits, not contract changes. No survivor lets any of the battery's 8 forgeries through while honest receipts stay admitted: every surviving mutant leaves the battery predicate `met` (`forgeriesAccepted=0/8`, H0/H1/H2 `honest=true`), i.e. the frozen C2 predicate itself is stable under all 20 mutants; what survives is detector coverage, concentrated in shape rules that no frozen construction exercises. The gate's own Limits header (check-bidi-runtime.mjs:86-96) already declares the deepest of these (shaped-synthesis receipts are not proven executed).

## Baseline (pristine, both detectors green)

```
S=/fast/scratch/hyaku/tabi-r33/MutGateV2
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"   # exit 0
git -C "$S/clone" checkout -q --detach 042d6d9abf97d567d495652a85eabc851b81adc1   # HEAD=042d6d9
sha256sum "$S/clone/scripts/check-bidi-runtime.mjs"          # 62453b55e5e5… (pristine)
sha256sum …/c2-bidi-forgery-battery.mjs                       # 51ace65fcece8…
git show e6b0a907…:.ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs | sha256sum   # 51ace65fcece8… == working tree
TMPDIR=$S/tmp node clone/scripts/check-bidi-runtime.mjs --selftest | tail -3; echo SELFTEST_EXIT=$?
  → BIDI_RUNTIME_SELFTEST verdict=clean cases=44 passed=44   SELFTEST_EXIT=0
TMPDIR=$S/tmp node …/c2-bidi-forgery-battery.mjs --repo "$S/clone" --rev 042d6d9abf97d567d495652a85eabc851b81adc1
  → BATTERY_EXIT=0; C2_FORGERY_BATTERY predicate=met … honestH0=true honestH1=true honestH2=true
    forgeriesAccepted=0/8 selftestExit=0 digestLiterals=0   (out/baseline-battery.txt)
```

## Method

Per mutant (harness `out/harness-mutate.mjs`, committed copy at `MutGateV2/harness-mutate.mjs`):
1. `git -C clone checkout -q --force --detach 042d6d9a…` + `clean -qfdx`; assert `rev-parse --show-toplevel` == clone; assert gate sha == pristine.
2. Apply exactly one string replacement (assert find occurs exactly once) to `scripts/check-bidi-runtime.mjs` in the scratch clone; commit as `MutGateV2 <MutGateV2@scratch.local>`; mutant rev recorded (40-hex).
3. Detector A: `node clone/scripts/check-bidi-runtime.mjs --selftest` (exit 0 = not killed; 3 = case failure; 1 = crash).
4. Detector B: `node .ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs --repo "$S/clone" --rev <mutant-rev>` with TMPDIR under scratch (battery runs its own clone/variants from `--rev`; its embedded selftest also runs on the mutant).
5. Reset to `042d6d9a…`; re-verify gate sha == pristine (`restored=true` for all 20; final HEAD `042d6d9`, `status --porcelain` empty, sha `62453b55…`).
The lane checkout was never executed or modified; the battery ran from lane bytes (read-only) against the scratch clone.

Protocol note: the first M04 attempt replaced an `if` that heads an `if/else-if` chain with `;`, orphaning the `else if` at line 794 → SyntaxError, gate never loaded; that "kill" was spurious and was discarded. M04 was redone as `if (false) …` (chain preserved); the valid M04 survives.

## Results (all 20; full find/replace + per-variant data in `MutGateV2/mutants.jsonl`, raw detector output in `MutGateV2/out/*.txt`)

| id | v2 rule (pristine anchor line) | mutation | selftest (44 cases) | battery | verdict |
|----|------|----------|--------------------|---------|---------|
| M01 | x3 duplicate-id — :839 `(idCounts.get(id) \|\| 0) > 1` | threshold `>1`→`>2` | 0, 44/44 | 0, predicate=met, 0/8 | **SURVIVED** |
| M01b | x3 duplicate-id — :839 | check → `else if (false)` | 3, 43/44, fail `v2-f2-duplicate-ids` | 1, not-met, **F2 accepted (1/8)** | killed |
| M02 | x4 measured cell — :149 `MEASURED` | regex also accepts `yes (live)` | 3, 43/44, fail `v2-f7-decorated-measured` | 1, not-met, **F7 accepted (1/8)** | killed |
| M03 | x4 verdict case — :373 `m[1].toLowerCase()` | drop lowercasing | 0, 44/44 | 0, met, 0/8 | **SURVIVED** |
| M04 | transcript path distinctness — :793 | check → `if (false)` | 0, 44/44 | 0, met, 0/8 | **SURVIVED** |
| M05 | transcript sha256 distinctness — :794 | `else if` branch → `;` | 0, 44/44 | 0, met, 0/8 | **SURVIVED** |
| M06 | sessionId regex — :145 | `[0-9a-f]`→`[0-9a-fA-F]` | 0, 44/44 | 0, met, 0/8 | **SURVIVED** |
| M07 | webSocketUrl↔sessionId binding — :388 | `if (m[1] !== sid)` removed | 0, 44/44 | 0, met, 0/8 | **SURVIVED** |
| M08 | context-id regex — :146 | `[0-9A-F]`→`[0-9a-fA-F]` | 0, 44/44 | 0, met, 0/8 | **SURVIVED** |
| M09 | DRIVER_ALLOW — :144 | add `"ROWS"` | 0, 44/44 | 0, met, 0/8 | **SURVIVED** |
| M10 | DRIVER_ALLOW — :144 | remove `"serveFixture"` | 0, 44/44 (selftest driver has no imports) | 1, not-met, honestH0/H1/H2=false | killed (battery only) |
| M11 | re-export detection — :434 `=== GATE_PATH` | invert to `!==` | 3, 43/44, fail `v2-f6-driver-reexports-gate` | 1, not-met, **F6 accepted (1/8)** | killed |
| M12 | re-export detection — :447 non-named `return` | → `continue` (kind skipped) | 3, 43/44, fail `v2-f6-driver-reexports-gate` | 1, not-met, **F6 accepted (1/8)** | killed |
| M13 | gate-sha byte-copy — :774 `===` | invert to `!==` | 3, 43/44, fail `v2-f5-driver-is-gate-copy` (only case committing a gate blob) | 1, not-met, honestH0/H1/H2=false, **F5 accepted (1/8)** | killed |
| M14 | s1 Gate-row witness — :753 `if (!witness)` | finding removed | 3, 43/44, fail `v2-f8-junk-source-row` | 1, not-met, **F8 accepted (1/8)** | killed |
| M15 | host equality — :749 `regHost !== gateHost` | invert to `===` | 3, 7/44 (37 fail, first `golden-two-runs`) | 1, not-met, honestH0=false | killed |
| M16 | s1 Gate-row sha256 — :746 `&& HEX64.test(x.text)` | requirement dropped | 0, 44/44 | 0, met, 0/8 | **SURVIVED** |
| M17 | admitted/unmeasured arithmetic — :856 `row.verdict === "yes"` | conjunct dropped (`no` rows admitted) | 3, 43/44, fail `v2-m19-unmeasured-row-counted` | 1, not-met, honestH0=false (admitted 17≠16) | killed |
| M18 | clean guard — :863 `out.admitted >= 1` | → `>= 0` | 0, 44/44 | 0, met, 0/8 | **SURVIVED** |
| M19 | sessionId pairwise distinct — :807 | check removed | 0, 44/44 | 0, met, 0/8 | **SURVIVED** |

Mutant revs/gate digests are in `mutants.jsonl` (`rev`, `gateSha256`, `restored`, `restoredSha` per line). Every gate the battery executed was asserted by the battery itself byte-identical to the mutant rev's blob (`variant N changed the gate bytes` never fired).

## Survivors = coverage limits (findings, not changes)

1. **M01** — x3 threshold untested between 2 and 16: both detectors only construct 16 duplicates (selftest `v2-f2`, battery F2). A gate that flags only triples would pass both.
2. **M03** — `MEASURED` is case-insensitive (:149 `/i`) but admission requires lowercase `verdict === "yes"` (:856); an all-uppercase `YES` entry parses as measured, admits nothing, and yields no row finding. No detector uses uppercase cells, so the inconsistency is unpinned.
3. **M04 + M05** — path and sha256 distinctness (:793/:794) are mutually redundant against every constructible receipt: at one rev one path is one blob, so same-path ⇒ same-bytes ⇒ same-sha; battery F3 and selftest `v2-f3` violate all three of path/bytes/sessionId at once, and F4/`v2-f4` violate bytes+sessionId. Dropping either single check changes no detector outcome; only the sessionId check (:807) is independently load-bearing for F4.
4. **M06** — sessionId shape accepts uppercase hex (:145), which ChromeDriver 154 never emits; detectors only use lowercase synthesized ids. The shape rule is weaker than its comment claims and the weakness is unobserved.
5. **M07** — the webSocketUrl↔sessionId binding (:388) is never the deciding check: every golden transcript binds url to sid, and every refusal case (e.g. `v2-m17`, off-loopback) fails on `WS_LOOPBACK`/`SESSION_ID` before the binding comparison. A loopback receipt whose ws url names a *different* valid session id passes both detectors.
6. **M08** — context-id shape accepts lowercase hex (:146); the v1 generator's `X`/`C1` constants are refused, but a lowercase-hex synthetic context is indistinguishable to both detectors.
7. **M09** — the negative direction of DRIVER_ALLOW (:144) is never exercised: the selftest driver is import-free (`// fixture driver`) and the battery's honest driver imports only allowed symbols, while F5/F6 are refused by *kind*, not by the list. A driver importing any non-allow-listed gate symbol would pass both detectors.
8. **M16** — the 64-hex-sha256-in-Gate-row requirement (:746) is never deciding: `lessonsDoc` always embeds a sha and battery F8 provides no Gate row at all. A Gate row with an https URL but no sha satisfies the mutant gate.
9. **M18** — "at least one admitted row" (:863) is untested: every refusal case carries a finding, so `admitted >= 0` changes nothing; an entry whose rows are all `no` (all unmeasured, no findings) would be `verdict=clean` under the mutant.
10. **M19** — sessionId pairwise-distinctness (:807) is shadowed in F3/`v2-f3` by the path+sha checks; no detector constructs two runs with distinct paths, distinct bytes and one shared well-shaped sessionId — i.e. re-emitting one genuine transcript twice with cosmetic byte perturbation passes both detectors (consistent with the gate's declared Limits header, :87-89).

Battery-only kill (M10) is the one axis where the frozen battery is strictly stronger than `--selftest`: the synthetic selftest driver has no imports, so the allow-list is only load-bearing against the real round-32 driver corpus.

## Restoration evidence

- Per-mutant: harness reset to `042d6d9a…` before and after; `restored=true` and `restoredSha=62453b55…` on all 20 jsonl lines (mutants committed only inside the scratch clone, identity `MutGateV2 <MutGateV2@scratch.local>`, `--no-verify`).
- End state: `git -C clone log -1` → `042d6d9abf97d567d495652a85eabc851b81adc1`; `status --porcelain` → 0 lines; `sha256sum` gate → `62453b55e5e5de331ee6e8fdb3fa8b8ddbf3b43a7b6da944a9544b3af8deac75` (== pristine).

## Housekeeping / honesty

- Detectors run: pristine selftest exit 0 (cases=44 passed=44); pristine battery exit 0 (predicate=met); 20 mutants × (selftest + battery) — every exit code listed in `mutants.jsonl`; nothing left unrun that this report claims.
- No `--live` leg was ever invoked; `pgrep -fa 'chromedriver|chromium'` after all runs matches only `/usr/bin/earlyoom … --prefer (^|/)(java|node|chromium|python3?)$` (pattern text, not a browser). Zero browser processes started by this seat.
- No network fetches; no tools installed/upgraded (node v24.21.0, git as present); no lane tracked file, lane index, sibling repo, or fleet-root file written. Writes: this report, `MutGateV2/` evidence dir, scratch `/fast/scratch/hyaku/tabi-r33/MutGateV2/` (deleted after evidence copy).
- Scratch `S=/fast/scratch/hyaku/tabi-r33/MutGateV2` (clone, harness, tmp, out) removed at yield; receipts copied to the evidence dir first.

Report: .ufo/waves/round-33/w2/MutGateV2.md
Evidence: .ufo/waves/round-33/w2/MutGateV2/mutants.jsonl · .ufo/waves/round-33/w2/MutGateV2/harness-mutate.mjs · .ufo/waves/round-33/w2/MutGateV2/out/{baseline-battery.txt, M*-selftest.txt, M*-battery.txt}
