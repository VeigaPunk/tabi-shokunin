# Round 36 — verifier spot-check (tabi, 2026-10-27)

author: hyaku closure (non-author integrator, @m_opus)
round: 36 · lane: tabi · lane HEAD: `354eb330f1601913e3489da91f120907252a9159` · baseline: `11c64b96f357de106c30a71c5e21ca44a3eacdc0`

Dispatch/complete digest (from `.ufo/watchdog.log`, mutable — copied at closure):

- 2026-10-27T04:55:16-03:00 launch tabi round=36 pgid=3052598 driver=hyaku-inline attempt=1
- 2026-10-27T06:40:43-03:00 lane-dead-no-report tabi round=36; retry same round (hyaku-inline attempt=1: L1 hit the request budget mid-round (state committed bd688fc, L1-STATE.md handoff))
- 2026-10-27T06:40:45-03:00 launch tabi round=36 pgid=429279 driver=hyaku-inline attempt=2
- 2026-10-27T09:49:17-03:00 complete tabi round=36; hyaku-inline attempt=2

## Step-1 conformance

| Check | Result |
|---|---|
| Report committed by lane identity | `git log --format='%an %ae %H' -- .ufo/reports/round-36/tabi.md` → `tabi-shokunin tabi@shokunin.local 8f7da7c4d7c4254b697c300f8a09a3ab3a3bf6f5 round-36: tabi report` ✓ |
| `SHONEN` heading | `grep -c '^## SHONEN'` → 1; 4 `[~]` lines, one per `SHONEN.md` box (4 boxes: `grep -c '^- \[.\]' SHONEN.md` → 4) ✓ |
| Cited commits exist + ancestor of branch | all 14 commits from the report's Landed-changes table pass `git merge-base --is-ancestor <hash> master` ✓ (jj-colocated repo, HEAD detached — tested against branch ref) |
| Lane repo clean + pushed | `jj-lane.sh state` → `ahead=0 behind=0` at `354eb330…`; `git status --porcelain` empty ✓ |
| Prompt carries template contract | round-level items present (mission/axes binding §1; L2 floor §3 "at least 8 L2 subagents in ONE batched AgentSwarm call"; commit-then-push §4–5; push scope §5; L0 side channel §5) and all five child-lane items (report path §4; commit-before-report "the report lands last and cites the pushed lane hash"; SHONEN heading §4 + pre-commit grep duty; commit-hash citation §4 "every change tied to a LOG.md entry and to the commit hash"; lane write scope §3) ✓ |

Not a marker: the report names real committed work, evidence pointers per item, a `SHONEN` heading, trend verdicts, and a Sources & frontier section with both census outputs pasted.

## Claim re-checks

No lane gate or counter was executed (PROTOCOL §Gate standard, Closure consequence). C1 and C2 rest on the lane's frozen counters; I verified committed evidence — frozen-run verdicts, the revision measured, control receipts, digest binding — and re-measured every plain count over committed bytes myself.

### C1 — adjacency (evidence-verified; plain counts re-measured)

- Frozen before data at `2e7b7a8920bff47fae6f75c3d06e48e37767099e` (`claims.json` `frozenBeforeData: true`).
- Before — do-nothing control `baseline/c1-J1-do-nothing.json`: `predicate: false`, `drift.auditCoverage: 0`, `drift.auditMissing: 307` (list length 307), `delta.total: 0`. Matches the report.
- After — committed receipt `measure/c1-at-20a69e0.json` (measured rev `20a69e0ae33292a71504e40be326f1513cd5a81b`): `predicate: true`; `adjacency {verdict: clean, rows: 16, verified: 16, findings: 0}`; completeness `candidates: 383, screened: 383, unaccounted: 0`; `drift.total: 307, auditCoverage: 307, auditFindings: [], staleFindings: [], observed {unchanged: 304, moved: 3, stale: 0}`; `delta.total: 0`. Matches the report exactly.
- Ledger: `wc -l corpus/adjacency-screen-drift.tsv` → 308 (307 rows + header) ✓.
- Digest binding: `sha256sum` over `git show 20a69e0:…` and `git show 354eb330:…` for both counters, `controls.mjs`, `measure.sh`, `c1-drift-audit-build.mjs`, `c1-delta-pins.json`, `check-adjacency.mjs`, `check-bidi-runtime.mjs` — all eight equal `claims.json frozenDigests` at the measured rev and unchanged at final HEAD. `measure/pins-binding-at-20a69e0.txt` reads `all-eight-bound=true`; `measure/measured-inputs-diff.txt` is empty.
- Seat corroboration (spot-read): `AdjDrift01` (20/20, 3 moved re-verified verbatim), `AdjDrift08` (20/20, 0 mismatches), `AdjDrift16` (7/7), `ConnDeltaScan` (12/12 drifted lanes, 441 commits / 8,640 added lines scanned, 0 hits = counter's 0-line delta pool). 16 chunk seats + connector scan + counter all report 307/307, 0 findings.
- SCORECARD: adjacency 8 → 8 held, with the stated reason (metric moved; no rubric authorizes an automatic scalar bump). The falsifiable before→after (0/307 → 307/307 audited, 0 findings) is committed and re-derived.

### C2 — operability (evidence-verified; plain counts re-measured)

- Before — `baseline/c2-J0-baseline-absent.json`: "v2 absent at round-start tip (expected: amendment instrument is new this round)". The prior instrument is the round-35 v1 counter.
- After — committed receipt `measure/c2-at-20a69e0.json`: `predicate: true`; `population: 17, admitted: 16, failing: 0, unmeasured: 1, binding: null, entryFinding: null, receiptFinding: null`; provenance runs on Firefox 158.0.1 / geckodriver 0.37.1; 0 non-loopback sockets. Matches the report.
- `measure/provenance-20a69e0.txt`: `porcelain=0`; counter/gate digests equal frozen pins; `c1 exit=0`, `c2 exit=0`, `selfassessment exit=0`; both binaries pinned with sha256 (`firefox … sha256 46e2c204…`, `geckodriver … sha256 f831b7e6…`).
- SCORECARD: operability 9 → 9 held (axis at recorded ceiling; no new capability row — the round remeasures the existing `webdriver-bidi-runtime-firefox` evidence).

### No-harm (evidence-verified + one command re-run)

- `measure/noharm-at-20a69e0.txt`: 29 commands, 27 exit 0, including all 18 gate self-tests (ADJACENCY_SELFTEST cases=57; BIDI_RUNTIME_SELFTEST 56/56; the full tally is in the receipt). Two nonzero: `check-frontier-admission` exit 1 and `check-freshness --worktree --rev HEAD` exit 2.
- `measure/noharm-baseline-compare.txt` reproduces both at the round-start baseline (`frontier-exit=1`, `freshness-exit=2`) — pre-existing, not introduced by this round.
- Re-run by me: `node scripts/check-selfassessment.mjs --rev 354eb330… --json` → `mismatches: 0` (superseded 48).
- `diff 11c64b96..354eb330 -- SCORECARD.md` shows only appended Round-36 sections; no owned axis row was edited in place; no axis harmed.

### Round-35 routed defects — disposition

1. **D11 0-byte evidence pointer** — FIXED. At `f2f3f145…` the entry's Corrections block cites `.ufo/waves/round-35/w2/SentinelDriverEgress/evidence/sockets-summary.txt`; `git cat-file -s` at that rev → 1,765 bytes. W2 `RevD11`'s "broken replacement path" allegation is itself a false finding (the entry never points at `corpus/evidence/…`).
2. **C2 amendments (M1 16-row threshold, M3 live egress leg, M4 caller-named binaries, whitespace-twin self-sniff)** — landed as counter v2; measured at `20a69e0`.
3. **S125 `on-release` + four companions** — landed `f2f3f145…`; only existing registry cell changed (`90d` → `on-release`, verified old→new), plus two decoded tag blobs, refetch file and release-pins receipt.
4. **C1 fixed-quota meter** — replaced by the completeness/drift/delta split meter; claimed and measured as C1.

## Discernment spot-check (non-author, this file)

The round's `## Gate` admitted one source row and rejected none; the rejection-class decisions of the round are the 38 quarantine refusals (re-derived by w1, not re-fetched). Sampled 1 admit + 2 rejects; every source re-opened by me at closure.

| Item | Decision | Re-opened source | Agree? | Reason |
|---|---|---|---|---|
| S142 (git-show manual) — **admit** | tier A, mined | `curl https://git-scm.com/docs/git-show` → 200, 246,608 B, sha256 `0a95cbcd…168a` — byte-identical to the row/lesson digest (also re-confirmed by w2 `RevS142` at 11:44:56Z) | **agree** | Located quote "Shows one or more objects (blobs, trees, tags and commits)." present at line 3272 exactly as claimed (§DESCRIPTION); 10 words ≤ 25 |
| S106 (quarantine, `payload-absent`) — **reject** | absent-refused | `curl https://www.rfc-editor.org/rfc/rfc9309.txt` → 200, 25,265 B; grepped both needles | **agree** | `使用 WebMCP 時，請注意下列事項` and `確認 WebMCP 工具曝光度` both absent (`grep -c` → 0); a robots.txt RFC cannot ground WebMCP UI claims — refusal correct |
| S149 (quarantine, `payload-absent`) — **reject** | absent-refused | `curl https://en.wikipedia.org/robots.txt` → 200, 28,275 B; grepped both needles | **agree** | "The daemon" and "/status JSON fields" both absent (`grep -c` → 0); refusal correct |

Census re-run by me: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` → exit 0, the same 20 pre-existing W04 warnings, `tabi ok`. Row counts re-measured: 141 rows at baseline `11c64b96…`, 142 at final HEAD; tier A 125 → 126, B 7, C 9; mined 117 → 118, queued 15, rejected 9. The new S142 row's `teaches` cell plus the lesson's located quote together satisfy the ≤25-word rule (the ≤25-word located quote lives in the lesson `## Gate`, per contract rule 1).

## Trend verdicts

- **expansion: improved** — one new sourced method entry on previously unheld sibling-drift audit ground, `source: S142` (mined), indexed in `corpus/README.md:852`.
- **quality: improved** — the entry's post-freeze overclaim was corrected by an appended, w2-evidence-backed `## Correction` (red state: 3 `audit-moved-wrong-relocation` live-pin findings); the D11 weak pointer was repaired.
- **discernment: improved** — the lane honestly filed `unchanged` (no outside check existed at filing); this outside spot-check now agrees with the gate on the sampled admit and both rejects, which is the `improved` condition in `LEARNING.md`.

## Verdicts

| Axis | Verdict |
|---|---|
| adjacency | improved (C1 predicate false → true; 0/307 → 307/307 audited, 0 findings; score held 8 → 8 per the lane's rubric note) |
| operability | improved (C2 v2 landed and measured; 16 admitted / 0 failing / 0 non-loopback; score held 9 → 9 at the recorded ceiling) |
| coverage / depth / freshness / calibration | unchanged — no harm observed (`diff 11c64b96..354eb330 -- SCORECARD.md` is append-only) |

Claims verify; no axis is harmed. **Admitted.**

## Routed defects and notes for round 37 (lane-owned)

1. **C1 counter does not digest-bind `c1-delta-pins.json`** (w1 `CritC1` T8 / w2 `ExecDeltaLive` F1): a substituted pins file returns predicate true with three mis-audited moved rows. The out-of-band receipt binds only this measurement. Fix in a round-37 counter amendment before data, with T8/T6 as red controls.
2. **Frozen build tool's kama pin is 39 characters** (missing `d`; w2 `CritBuildTool`/`ExecDeltaLive`): inert on this round's pin set, but a future kama re-pin makes tool and counter disagree. Repair round 37.
3. **Moved-note parser takes the first `:<digits>` token** (w2 `CritC1b`): a truthful note with an earlier decoy token can be refused. Current generator emits `verbatim at :N` first, so the committed ledger is unaffected. Amend round 37.
4. **Frozen C1 predicate sentence ≠ counter header text** (w2 `RevFrozenDigests`): the counter enforces more than the declared sentence (stale redisposition, delta accounting, resolvable frozen heads). All declared terms are independently present in the committed JSON; no silent amendment after data. Align wording in the round-37 freeze.
5. **Measurement harness `numstat` path bug + invalid `check-freshness` invocation** (`measure.sh` line 61; `noharm` freshness exit 2): harness intentionally not amended after data; the exact numstat was re-run and retained at `measure/numstat-at-20a69e0.txt`. Fix the harness for round 37.
6. **W1 dispatch Godspeed directive not byte-identical** to `skill://godspeed/directive.md` (ASCII hyphen + paraphrased immediate-stop sentence; self-reported in `LOG.md`). Prompt-fidelity defect; w2 used exact bytes. Do not rewrite w1 after data.
7. **4 incomplete w2 seats** (`RevF1`, `RevC2b`, `MutC2b`, `ExecEgressLive`) — no verification credit, honestly disclosed in the report and `w2-results.json`.
8. C2 hardening carried to round 37: `GIT_NO_REPLACE_OBJECTS`/replace-ref evidence for `git show` reads (w2 `SentinelScope2`, no replace refs in the canonical measured clone), abnormal-SIGTERM browser cleanup, and binding (or explicitly scoping as display-only) receipt `observed` fields (w2 `CritC2b`).

SHONEN note for the operator: all four boxes remain `[~]` lane-asserted with resolvable pointers; this closure did not write `[x]` (promotion review is operator-owned). Nothing in this round is a promotion request.
