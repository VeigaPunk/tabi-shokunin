# ConnPlanAudit: tabi round 39 planning data-walk (w1, connector)

Scope: independent enumeration of each frozen claim's predicate clauses, counter checks, controls, and integration dependencies; flags for missing prerequisites before claim data; conflation check between frontier/quarantine work and claims. Read-only. No browser launched, no installs, no git/jj mutation (only `show`, `ls-tree`, `log`, `diff`, `cat-file`, `merge-base`, `grep`), counters run stdout-only, no pacman, no MCP, no spawn.

Refs: freeze commit `9c09ebb1e2ff594c70ce72093b5d4133c1734dca` (14:08:34 -0300); HEAD `1ace2fd` (14:30:32); round-start baseline `5bc56a81d196caeb8d24551928b883802697aabb`; C2 numstat window base `3f42a5c7cc19a544c879577e4bad7b7fd9d61a35` (ancestor of freeze, verified).

Evidence: `.ufo/waves/round-39/w1/ConnPlanAudit/evidence/` (outputs cited below as `E:<file>`).

## 0. Integrity of the frozen inputs (observed)

- Counter digests match `claims.json#frozenDigests` at HEAD: C1 `75e823e4…3b6e`, C2 `eefc8997…c7c6`, driver `3fba8b68…3a09`.
- Predicate text: `claims[0].predicate` == C1 `PREDICATE_SENTENCE`; `claims[1].predicate` == C2 `PREDICATE_SENTENCE` (both at freeze and HEAD; checked by byte compare, 477 and 709 chars).
- Claims file identity drifted without a predicate change:
  - committed at freeze `9c09ebb`: sha256 `40740f82…c009`, `frozenAt: "1f4260ae…"`;
  - HEAD (`dc695dc`, "finalize amended C2 freeze"): sha256 `ed88855a…9e7`, `frozenAt: "9c09ebb1…"`; the only diff is the `frozenAt` line.
  - The C2 mutant receipt records `frozenClaimsSha256 = 40740f82…`, which is no longer the on-disk claims file.
- History (`git log`): `1f4260a` 13:29 first freeze (C1 predicate, C2 original), `690b050` 13:58 C1 session-bound receipt committed (measuredAt 16:57:57Z), `11662da` 13:58 census-start receipts, `9c09ebb` 14:08 amended C2 predicate/target/killRule and C2 counter (digest `891c1e9d…` → `eefc8997…`), `3fdf16f`/`d3232d5` 14:11 mutant control, `25d4f53`/`03322e9`/`1ace2fd` later evidence.
  - The C1 predicate and C1 counter digest are unchanged from `1f4260a` through HEAD. The amendment touched only C2.
  - The amendment at `9c09ebb` landed after the C1 receipt and census-start receipts were committed. Its commit message says "pre-data"; that is true only for the C2 round-39 receipts, not for all round-39 data.

## 1. Missing prerequisites and blockers (flags before claim data)

**F1 (blocking, C2): D6 is unsatisfiable by construction under the frozen counter.**
- Counter lines 213–220: the receipt path is `numstat-at-${REV.slice(0,8)}.txt`, read with `blob(repo, REV, path)`, so it must exist in REV's own tree. Then `namesRev = text.includes(REV)` requires the full 40-hex REV inside that file.
- D6 is in the predicate (line 262: `out.d6.namesRev`).
- A commit's tree cannot contain its own full hash without a SHA-1 fixed-point search, so no REV that contains the receipt can pass D6. The 8-hex filename part alone could be ground, but the 40-hex body part cannot.
- Observed: `E:c2-at-freeze.txt` and `E:c2-probe2-HEAD.json` show `d6-file` absent at both freeze and HEAD (expected pre-receipt). The namesRev impossibility is code-derived plus the hash argument, which is [INFERENCE] from the code, not a run against a fixture.
- Consequence: the C2 predicate cannot be met by any honest integration REV under the frozen counter. Fixing it requires changing the counter, which is a new freeze, not an in-wave repair.

**F2 (blocking for D5): census receipt format does not match the counter's parser.**
- Counter D5 (lines 193–195) parses `rows\s*[:=]\s*(\d+)`, `tier[s]?\s*[:=]…`, and `status\s*[:=]…`, then `([A-Za-z]+)\s*[:=]\s*(\d+)` pairs.
- The existing `measure/census-start-counts.txt` uses `tier. A =128` and `status. mined =120` form.
- Observed: its `rows=144` parses, but tier and status lines parse to `null`. A census-end receipt written the same way would fail `d5-tier` and `d5-status` even with correct counts.
- Counter-style parse of `corpus/SOURCES.md` at freeze: rows 144; tier A128 B7 C9; status mined120 queued15 rejected9 (agrees with census-start numbers, so only the format is wrong).

**F3 (blocking for C2 receipts): D5 and D6 receipts absent at freeze and HEAD.**
- `measure/census-end.txt` and `measure/numstat-at-<REV8>.txt` are absent at `9c09ebb` and at `1ace2fd` (`E:c2-at-freeze.txt`, `E:c2-probe2-HEAD.json`).
- Both must be produced at the integration REV; D6 additionally hits F1.

**F4 (C1 source, conflation): S145 is not a landed source.**
- `corpus/SOURCES.md` at freeze has 0 rows `| S145 |`.
- `assimilation/quarantine-slice`, committed inside the claims freeze commit `9c09ebb` (commit subject "...and quarantine slices"), lists `S145 payload-absent`.
- The S145 id is also used by a different document in round-22/23 quarantine (`HEAD:.ufo/waves/round-22/assimilation/quarantine-verdicts.tsv:13`: `S145 round3 absent-refused payload-absent … rfc6265bis-13`). The id collides with the round-39 proc_pid_net(5) draft.
- `assimilation/S145-open.txt` (14:13) and `assimilation/S145-row-draft.md` (14:36, after freeze) are untracked drafts.
- The knowledge entry the claim cites, `corpus/knowledge/playwright-firefox-session-bound-tcp-round-39.md`, is absent at HEAD; it exists only under `assimilation/validate/` staging.
- The claim text says "proc(5) man page"; the draft says `proc_pid_net(5)`.
- Conclusion: the C1 `source` field depends on frontier/quarantine material that is not admitted to the register. Source provenance is not a prerequisite the counter checks.

**F5 (C1 reproducibility): host-global prerequisites, no lane lockfile.**
- The driver imports Playwright from `/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/lib/node_modules/playwright/index.mjs` (package version 1.64.0, observed by `require`).
- It launches Firefox from `/home/vgpnk/.cache/ms-playwright/firefox-1555/firefox/firefox` (exists).
- The lane has no `package.json` or lockfile (`ls`, `git grep` at HEAD).
- The C1 counter does not check `playwrightVersion`; it hard-codes `browserVersion === '157.0'`.
- No re-measurement is possible from a clean clone without these host paths. The counter itself does not need them, since it never re-runs the browser.
- `claims.json` `toolInstalls: []`. I installed nothing; `ss` (`/usr/bin/ss`), `ps`, and node v24.21.0 are pre-existing.

**F6 (claim identity drift): see §0.** Any artifact that embeds the claims sha (the C2 mutant receipt) now refers to a file that is not on disk at HEAD. The counter does not check the sha, so it does not fail; it is a traceability defect.

**F7 (target not in predicate, C1): "capability row enters SCORECARD.md" is a stated target with no counter clause.** No line in `c1-egress-session-bound.mjs` reads SCORECARD. This is a target-vs-predicate gap to flag in the planner's acceptance, not a counter failure.

**F8 (baseline label ambiguity): two baselines in one claims file.**
- `claims.baseline = 5bc56a81…` (round-start).
- C2 D6 window base `3f42a5c7cc19…` (round-38 start, hard-coded constant `BASELINE`).
- Both are commits and 3f42 is an ancestor of freeze. The numstat window is correct per the frozen predicate, but nothing in claims labels it.

**F9 (planning text inside frozen claims): `stagnationNudge` and `lowestAxis: adjacency`.**
- The nudge waives the lowest-axis obligation for this round. It is a planning waiver, not a claim predicate.
- No claim addresses adjacency, so the waiver is an unclaimed item sitting in claim data.

## 2. Predicate clause enumeration

### C1 (coverage, capability-acquisition) — counter `c1-egress-session-bound.mjs`

| # | Clause | Counter check (line) | What is verified | Observed at freeze/HEAD |
|---|---|---|---|---|
| 1 | schema v2 | L90 `schema === v2` | self-reported string | pass |
| 2 | two unrefused runs | L93 runs==2; L97 `run.refused` | self-reported flags | pass (both `refused:false`) |
| 3 | identical first-shot sha256 | L98 hex64; L123 set size 1 AND self-reported `binding===true` | sha shape + set equality; binding is a receipt boolean | pass; both runs `ebfae99c…bf` |
| 4 | per-run owned tree nonempty, rooted at child of driver node | L100–109; `source` regex `children of this node process` | structure only; no live pid check | pass; run1 nodePid 2430191, roots [2430211], tree 5 pids |
| 5 | ≥8 socket samples per run over ≥1000 ms | L110–111 | self-reported counters | run1 9/1560 ms; run2 8/1461 ms |
| 6 | zero non-loopback on ss and /proc incl. post-close sweep | L112–118 (fail-closed on undefined) | self-reported `nonLoopback` integers | pass |
| 7 | zero survivors | L119, L126 | self-reported | pass |
| 8 | fixture port closed | L120 `portClosed===true` | self-reported | pass |
| 9 | firefox version bound from live session | L127–130 `browserVersion==='157.0'`, UA regex, binary regex | constant match, not a derivation; playwrightVersion unchecked | pass (constant) |
| 10 | round-38 v1 receipt refused | L55–77 control | refused by schema, missing owned tree, sampleCount undefined, run count | refused (`E:c1-at-freeze.json` control.refused true) |

- The C1 counter at freeze exits 0 with `predicate: true` (`E:c1-at-freeze.json`). At HEAD `1ace2fd` it also reports `predicate=met controlRefused=true`.
- The C1 receipt was committed at `690b050` (after freeze `1f4260a`, before amendment `9c09ebb`), so the claim's "integration REV" target is already met by a pre-amendment commit.
- Calibration gap: the counter validates receipt self-consistency. It never compares receipt numbers to driver output, never re-runs the browser, and the version clause is a hard-coded constant. The predicate can be met by any receipt that passes these shape checks.

### C2 (calibration, instrument-repair) — counter `c2-routed-defects-v2.mjs`

| # | Clause | Counter check (line) | Observed at freeze | Status |
|---|---|---|---|---|
| D1 | stale 68-seat line present; append-only correction; seats==34; w2 absent | L79–94 | stalePresent true, correction true, seats 34, w2Absent true | pass |
| D2 | LOG states "23 ok / 11 finding"; recomputed tally 23/11 over 34 reports | L104–131 | recomputed 23 ok / 11 finding, reports 34 | pass |
| D3 | 6 round-37 hashes present in round-38 LOG section, are commits, ancestors of REV; freeze landing stated at 34ed508c | L140–147 | all pass | pass |
| D4 | lesson round-38 Mistakes section + captured-by M3 row; mutant receipt exit≠0, sentence differs, sha pair differs | L156–175 | mutantExit 1, sentenceDiffers true, shaPair true, refused true | pass |
| D5 | census-end receipt counts equal counter parse | L181–207 | `census-end.txt` absent; format mismatch (F2) | **fail** |
| D6 | numstat receipt names 3f42 and REV; body == git diff --numstat 3f42..REV excl. itself | L213–228 | file absent; namesRev unsatisfiable (F1) | **fail / unsatisfiable** |
| D7 | claims[1].predicate byte-identical to counter sentence | L247–250 | sentenceMatch true | pass |

- Predicate (L256–263) is the conjunction of all D1–D7 clauses; the counter exits 1 at freeze and HEAD on D5/D6 alone.
- Red control reproduced: `node c2-routed-defects-v2.mjs --rev 9c09ebb… --repo . --claims baseline/c2-mutant-claims.json` exits 1 and prints `d7-sentence-mismatch` (`E:c2-mutant-run.txt`). The receipt's `observedExit: 1` and `mutantClaimsSha256 a2ba6eea…` match the run; the control is honest.
- Frozen claims run with `--claims` also exits 1 only on D5/D6 (`E:c2-frozen-claims-run.txt`).
- D2 is observed correct: `seats=34 tally=23/11`.

## 3. Controls

- C1 do-nothing control: round-38 v1 receipt refused (`E:c1-at-freeze.json`). The refusal reasons are schema mismatch, missing owned tree, and undefined sampleCount. Any non-v2 receipt would be refused by these same clauses, so the control is weak but does meet the claim's wording.
- C2 red control: reproduced exit 1 and d7 finding (above). Honest.
- Not run: the round-38 v1 C2 counter (`.ufo/waves/round-38/counters/c1-routed-defects.mjs`) to confirm its "predicate=not-met" baseline. Not required for this item.

## 4. Integration dependencies (ordered, as the counters read them)

1. C1: `corpus/evidence/round-39/playwright-egress/receipt.json` present at REV (present at freeze and HEAD). Counter run: `node .ufo/waves/round-39/counters/c1-egress-session-bound.mjs --rev <REV> --repo <clean clone> --json`.
2. C2 D5: `measure/census-end.txt` in counter format at REV (F2).
3. C2 D6: `measure/numstat-at-<REV8>.txt` at REV; body must equal `git diff --numstat 3f42a5c7cc19..REV` excluding itself; namesRev unsatisfiable (F1).
4. C2 D1–D4, D7: already satisfied at freeze; must stay satisfied at REV (SCORECARD correction, LOG round-38 section, lesson M3 row, mutant receipt).
5. Not checked by any counter but named in claims: SCORECARD capability row (F7), S145 register admission and knowledge entry (F4).

## 5. Frontier / quarantine conflation flags

- The freeze commit `9c09ebb` bundles "quarantine slices" with the claim freeze: `assimilation/quarantine-slice` (38 lines, S145 `payload-absent`) is committed in the same commit as the claims and counters. The claims freeze therefore includes quarantine register data.
- The C1 `source` field names S145, a quarantined and not-admitted id (F4).
- The `assimilation/validate/` tree holds staged copies of `corpus/SOURCES.md`, a knowledge entry, and a lessons file. These are staging, not lane truth.
- The `stagnationNudge` (planning waiver) lives in `claims.json` (F9).
- `S145-open.txt` and `S145-row-draft.md` are frontier drafts. They are not counted by any predicate, which is correct.

## 6. Verdict on this item

Findings (observed unless marked):
- F1 C2 D6 unsatisfiable under the frozen counter (code-derived; hash argument is [INFERENCE]).
- F2 census-end format mismatch (observed).
- F3 D5/D6 receipts absent at freeze and HEAD (observed).
- F4 C1 source S145 not admitted; id collides with round-22 quarantine id; cited knowledge entry not landed (observed).
- F5 host-global Playwright/Firefox paths, no lockfile, counter does not check playwrightVersion (observed).
- F6 claims identity drift; mutant receipt sha refers to a superseded file (observed).
- F7 C1 SCORECARD target not in predicate (observed by grep of counter).
- F8 two baselines unlabelled (observed).
- F9 planning waiver text in claims (observed).
- C1 predicate already met at freeze and HEAD by a self-consistent receipt; counter does not re-derive observations (observed).

Commands run (all read-only): `git log/show/ls-tree/cat-file/merge-base/diff/grep`; `sha256sum`; `node` on the two frozen counters with `--rev 9c09ebb…`, `--rev HEAD`, `--claims` fixtures (stdout only); `node -e` predicate byte compare; ES-module `evaluate` import of the C2 counter into a scratch probe. Scratch: `/fast/scratch/hyaku/tabi-r39/ConnPlanAudit/` (removed on exit).

Installs: none. Browser: none launched.

Not evaluated: any live Playwright run, any C2 integration REV, SCORECARD landing (not present at HEAD for C1 row check).

VERDICT finding — C2 predicate is unsatisfiable under the frozen counter (D6 requires REV's full hash inside a receipt in REV's own tree; D5 census-end format does not match the counter parser; D5/D6 receipts absent); C1 source S145 is an unadmitted quarantine id and the C1 predicate is already met by a self-consistent pre-amendment receipt with self-reported observations; claims identity drifted (frozenAt/sha) after freeze.
