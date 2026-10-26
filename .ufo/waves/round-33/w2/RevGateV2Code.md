# w2 RevGateV2Code — code review of `scripts/check-bidi-runtime.mjs` v2 (042d6d9) against v1 (b7d16fb)

**Verdict: holds.** The v2 gate at `042d6d9abf97d567d495652a85eabc851b81adc1` (sha256 `62453b55e5e5de331ee6e8fdb3fa8b8ddbf3b43a7b6da944a9544b3af8deac75`, byte-identical worktree↔blob) meets the frozen C2 predicate: the frozen battery (`51ace65fcece8e794b80afdb386638c755b3aa137297c33a34ffce7fb24e812b`) exits 0 with H0/H1/H2 accepted at population 17 / admitted 16 / failing 0, all eight forgeries refused with the construction-correct reasons (F1/F3/F4/F5/F6 `t1-receipt`, F2 `x3-duplicate-id`, F7 `x4-measured-cell` with the row retained, F8 `s1-source-row`), `digestLiterals []`, `--selftest` exit 0 at cases=44 passed=44; all 27 v1 behaviours are preserved (24 cases + 3 refusal cases retained with identical expectations; predicates R2–R17 byte-identical; CLI and exit classes 0/1/2 + selftest 0/3 unchanged, JSON fields added only); no honest-digest material appears in the source in any form (64-hex, 12-hex prefix, size, sequence length, or timestamp — verified by an independent prefix scan and by reading every constant in the file). Four low-severity defects are on record — none predicate-breaking, none silently dropping a row: (1) the Measured-cell rule admits `yes — <reason>` and case variants as a bare `yes`, contradicting the gate header and the SKILL registry rule-1 wording; (2) the driver import scan misses absolute-specifier gate imports, a gap narrower than the header's Limits bullet discloses; (3) the header claims exit 2 on "lessons absent", which the code cannot produce; (4) the SKILL registry's clean formula omits the `admitted >= 1` arm the code enforces. Three note-level items (doc precedence order, one dead import, two selftest coverage gaps) close the list.

## Findings by severity

### Low

**L1 — `MEASURED` accepts a decorated `yes` cell (and any letter case) as a bare `yes`.**
`v2.mjs:149` `const MEASURED = /^(yes|no)(?:\s*[—–-]\s*\S[\s\S]*)?$/i;` and `measuredVerdict` (`v2.mjs:368-375`) returns `verdict: m[1].toLowerCase()`, so the optional dash-reason tail applies to `yes` too and `/i` admits `YES`. This contradicts three stated surfaces: the gate header `v2.mjs:76-77` ("a bare `yes`, a bare `no`, or `no` followed by a dash-introduced reason"), SKILL rule 1 (`SKILL.md:2784-2786`: "a `Measured` cell that is not exactly `yes` or `no` is a row finding"), and the v2 note's scoped reading, which allows a reason suffix for `no`-prefixed cells only (`corpus/knowledge/bidi-runtime-gate-v2-round-33.md` §2, "a `no`-prefixed cell as a measured negative"). Evidence (my probes, `out/probes.json`): P1 cell `yes — live` on R2 → exit 0, admitted 16, row `{verdict: "yes", measured: true, admitted: true}`; P2 cell `YES` → same. Mitigation keeping this low: the F7 harm is closed regardless — a `yes — live` row stays in the population and must pass t1/t3/t2/l1 to be admitted, so nothing is silently dropped (the MutC1Entry mutant-A failure mode); P5 control `yes (live)` still reads `x4-measured-cell`, exit 1, admitted 15. No effect on F1–F8 or on any honest receipt.

**L2 — the driver import scan misses absolute-specifier gate imports, and the header's Limits line does not disclose this shape.**
`resolvesToGate` (`v2.mjs:432-437`) returns `false` for any spec starting with `/`. A driver blob beginning `import { PREDICATES } from "/abs/path/to/repo/scripts/check-bidi-runtime.mjs";` therefore passes t1 entirely. Evidence: probe P3 with exactly that line (targeting the clone's own gate) → exit 0, admitted 16, no t1 finding. The header discloses a narrower gap: `v2.mjs:56-58` limits non-detection to "a computed specifier or a multi-line import" — an absolute literal is a plain static single-line import. SKILL rule 3 (`SKILL.md:2797-2800`: the driver's source "neither re-exports the gate … nor imports a gate symbol outside the allow-list") is thus not enforced for this shape. Controls: P4 (resolving relative named import `../../scripts/check-bidi-runtime.mjs` from `corpus/evidence/`) → exit 1, `driver imports non-allow-listed gate symbol(s): PREDICATES`; P6 (allow-listed `serveFixture, FIXTURE_SHA256`) → exit 0, matching the round-32 driver's legal shape. F5/F6 (byte copy, re-export) remain refused, so the frozen predicate is unaffected; the miss only weakens the provenance claim "this driver is not a disguised gate" for one more disguise.

**L3 — the header claims exit 2 on "lessons absent"; the code cannot produce it.**
`v2.mjs:8`: "2 could-not-evaluate (usage, unresolvable revision, registry or lessons absent, …)". `gateRows` (`v2.mjs:511-517`) returns an empty map when `git ls-tree` fails, which surfaces as a missing witness → `out.entryFinding = "s1-source-row"` (`v2.mjs:737,753`) → exit 1, never exit 2. Doc-only (fail-closed direction); the SKILL registry's 2-class list (`SKILL.md:2812`) correctly omits it.

### Notes

**N1 — per-row precedence: header list order ≠ code order.** Header `v2.mjs:73-81` lists x1, x3, x4, x2 …; code checks x4 first (`v2.mjs:836-839`: `if (out.entryFinding) … else if (!mv.measured) x4 … else if (!Object.hasOwn(ROWS,id)) x1 …`). A decorated cell on an unknown or duplicated id reports `x4-measured-cell`, not `x1`/`x3`. Reason-string impact only; exit class identical.

**N2 — SKILL registry's clean formula omits `admitted >= 1`.** Registry verdict map: "0=clean (population>=1, every measured row admitted)" (`SKILL.md:2812`). Code: `out.clean = !out.entryFinding && out.population >= 1 && out.admitted >= 1 && out.failing === 0` (`v2.mjs:863`), matching the header's "at least one row admitted" (`v2.mjs:5`). An entry whose rows are all `no` is exit 1 in code but vacuously clean under the registry formula.

**N3 — dead import.** `readdirSync` (`v2.mjs:127`) has zero call sites in v2; its only v1 consumer was the caller-TMPDIR cleanup the S2 fix removed (`v1.mjs:404-406` deleted block). Import left behind.

**N4 — selftest coverage gaps (MutC1 survivor class).** No CASE pins `driverGateFinding`'s named-import refusal branch (`v2.mjs:439-449`) or the positive allow-list admission: the driver-related cases are driver-absent / driver-is-the-counter / v2-f5 (byte copy) / v2-f6 (re-export) / v2-m11 (sha differs) (`v2.mjs:995-1000,1005`), all `// fixture driver` or re-export text. P4 and P6 exercise the two missing shapes today; a future mutant deleting the named branch or inverting the allow-list passes 44/44 as the suite stands.

**N5 — Gate-heading match is exact-word.** `v2.mjs:522` `/^#{1,6}\s+Gate\s*$/` — a lesson heading like `## Gate (round 32)` would hide its rows and push honest s1 citations to `s1-source-row`. Fail-closed; currently satisfied (`corpus/lessons/round-32.md` Gate table, `round-33.md:24`).

## Regression audit — the 27 v1 behaviours

- All 24 v1 CASES + 3 refusal cases are present in v2 with identical ids and expected exit/admitted/reason (v1 `CASES` block vs `v2.mjs:966-1002,1093-1102`); expectations changed only by design: v2 adds `population` to m19, and golden sessions are now shape-valid so `golden-two-runs` still passes.
- `recordFromTranscript`, `ok/res/strVal/navBase/evalCmds/headerValue/decodeBytes/pngSize`, `parseTable`, `parseRegistry` (11-cell rule kept; v2 additionally retains `source` for the host check), `resolveRev`, `blob`, `splitRow`, `makeFixture`, CLI `parseArgs`/`main` verdict/exit plumbing: unchanged between versions (full-file diff read).
- Predicates R2–R17 byte-identical. R1's `webSocketUrl` check tightened: v1 `:250` accepted any loopback path (`/^ws:\/\/(127\.0\.0\.1|localhost):\d+\//`), v2 `:147` requires `/session/` (used at `:248`). Intentional v2 alignment with session provenance; unreachable in practice since `sessionOf` (t1, `v2.mjs:378-393`) rejects non-`/session/` urls first.
- Population semantics change is the mandated F7 fix: v1 counted only cells `=== "yes"` (`v1.mjs:570`), v2 counts every non-empty Measured cell (`v2.mjs:724`); R16's honest `no — no BiDi command` is now counted-unmeasured — visible as population 17 / unmeasured 1 / admitted 16 in H0, H1, H2 and in my live rerun. `admitted >= 1` added to clean; `failing` now counts rows-with-reason (equivalent on yes-only populations).
- t3-binding logic identical in both versions (cross-run first-screenshot equality, cross-run `chromedriverVersion` equality, live equality) — the v2 additions (run distinctness, session provenance) are purely new checks layered before it.

## v2 rules — each verified against its construction (frozen battery, clone at REV)

| Rule | Refuses | Observed reason (battery.json) |
|---|---|---|
| 1 row table | F2, F7 | `x3-duplicate-id` / `x4-measured-cell` (admitted 15, row retained in population 17) |
| 2 session provenance (`v2.mjs:145-148,378-408,796-807`) | F1, F3, F4 | `t1-receipt` (shape/pairwise-distinct sid; path set; sha set; context ids forced 32-uppercase-hex) |
| 3 driver provenance (`v2.mjs:144,409-449,759,766-775`) | F5, F6 | `t1-receipt` (byte-copy-of-gate; re-export/allow-list scan) |
| 4 Gate-row witness (`v2.mjs:511-556,727-753`) | F8 | `s1-source-row` (no Gate row for S990; host equality enforced) |
| 5 no honest digest literal | J3 family | `digestLiterals []`; my independent scan of all five honest 64-hex digests and their 12-hex prefixes in the v2 source: clean |
| 6 live leg | not in predicate | code review: real binary default `v2.mjs:576`, no `--no-sandbox` in args `:612`, `sandboxStatus` guard `:561-573`, throwaway HOME/XDG `:594-601`, short-socket-dir logic refuses instead of v1's caller-TMPDIR fallback + foreign-dir deletion (`v1.mjs:404-406` removed). Behavioral: my `--live` rerun exit 0, population 17 / admitted 16 / unmeasured 1 / distinct 16, binding null, provenance shows the two honest run session ids (`10abbb47…`, `6b30c703…`) with distinct 32-uppercase-hex contexts |

## Commands run (all in the scratch clone `/fast/scratch/hyaku/tabi-r33/RevGateV2Code/clone`, detached at 042d6d9; lane untouched)

```
git clone --shared …/tabi-shokunin "$S/clone" && git -C "$S/clone" checkout -q --detach 042d6d9…   # toplevel verified = clone
sha256sum "$S/counter.mjs                     # 51ace65fcece8e794b80afdb386638c755b3aa137297c33a34ffce7fb24e812b (frozen digest match)
TMPDIR=$S/tmp node "$S/counter.mjs" --repo "$S/clone" --rev 042d6d9… --json   # exit 0, 6.8 s → out/battery.json (stderr 0 B)
node scripts/check-bidi-runtime.mjs --selftest                              # exit 0, cases=44 passed=44 → out/selftest.txt
python3 prefix-scan of v2 source vs the battery's five HONEST_DIGESTS       # no full digest, no 12-hex prefix
node probe.mjs (5 fixture-repo probes, git identity RevGateV2Code@scratch.local)  # exit 0 → out/probes.json
node scripts/check-bidi-runtime.mjs --rev 042d6d9… --baseline d805d1d6… --entry corpus/knowledge/webdriver-bidi-runtime-round-32.md --live --json   # exit 0 → out/live.json (stderr 0 B)
pgrep -fa 'chromedriver|chromium'   # only the host earlyoom monitor line; nothing owned by this seat
```

Honesty: every reading above was executed this session; nothing inferred from w1 receipts alone. No tools installed or upgraded; no network fetches; the single browser session was the gate's own live leg (loopback fixture, throwaway HOME/XDG/profile, gate-cleaned). Scratch tree deleted after receipts were copied.

## Residual risk / verification gaps

- The header's disclosed limits stand: shape ≠ execution — a synthesised transcript with real-shaped ids, distinct bases and a real spliced screenshot is still admissible offline (note §5b); v2's checks are exactly the frozen eight constructions plus the nine M-survivors, no more.
- L2's class has untested siblings the Limits line only partially covers: chained re-export files and non-literal specifiers; the battery cannot see them.
- I did not empirically test the N1 precedence collision (unknown-id + decorated cell in one row) — code-reading only.
- Live-leg sandbox/flags behaviour on other hosts (no userns sysctl, setuid helper present, flags-file content) is ExecLiveLeg's measured territory; I verified the code paths and one clean run on this host only.

## Deliverables

- Report: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-33/w2/RevGateV2Code.md`
- Receipts: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-33/w2/RevGateV2Code/` — `battery.json` (frozen counter, exit 0), `selftest.txt` (44/44), `probes.json` (P1–P6), `live.json` (live rerun), `commands.txt`
- Reviewed sources (scratch, deleted): v1 `2f25af5a3c6326b9295f7fb191c3b76334dbb23a3403d39755d9e9ee3516c393`, v2 `62453b55e5e5de331ee6e8fdb3fa8b8ddbf3b43a7b6da944a9544b3af8deac75` = `git show 042d6d9:scripts/check-bidi-runtime.mjs`
