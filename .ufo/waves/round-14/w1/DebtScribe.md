# tabi round-14 w1 — DebtScribe (read-only report)

Author-side advisory. Not non-author verification. No gate, self-test, witness, census, browser, build, lint or smoke was executed. Only this file was written. No SHONEN, lesson, SCORECARD, LOG, script or evidence file was touched.

Scope: previous verifier routed debts (`corpus/lessons/round-13-verifier-spotcheck.md`, `corpus/lessons/round-12-verifier-spotcheck.md`), SHONEN, USER fixture-count wording, outstanding operator question, stale-lane and tool state.

## 1. SHONEN checklist (four boxes, all `[~]`)

Current `SHONEN.md` holds exactly these four lines, all `[~]`, no `[x]`:

- [~] SKILL.md contains real decision tables, error patterns, checklists, cited sources
  - Pointers: `SKILL.md:697` = `## Approval table — finalized` (verified). `SKILL.md:1598` = `## Errata — kaika fleet round-1` header (verified); the `:1598-1617` decision-row range was not line-re-measured here.
- [~] At least one end-to-end domain task executed and logged in LOG.md
  - Pointers: `corpus/knowledge/multi-step-journey.md` exists (sections §1–§7 present, verified); `LOG.md:76` = round 3 entry (verified).
- [~] Instructions executable by an agent without oral context
  - Pointer: `corpus/knowledge/executor-test-sufficiency.md` exists; §0 and §4 headers present (verified).
- [~] No cross-domain bleed (PROVINCE.md still accurate)
  - Pointers: `PROVINCE.md:3-21` (verified); `corpus/evidence/user-20261015-r02/boundary/refusal-receipt.txt` exists (verified).

Status: no promotion. The round-13 closure (`corpus/lessons/round-13-verifier-spotcheck.md:167`) states "not all four boxes are certified"; the round-12 closure (`corpus/lessons/round-12-verifier-spotcheck.md:225-226`) states the same. Keep `[~]`; the historical `[x]` marks remain withdrawn (`LOG.md:519-525`, as cited by round-12).

## 2. Routed debt disposition

### 2a. Round-13 verifier, routed items (`corpus/lessons/round-13-verifier-spotcheck.md:156-165`)

| # | Routed item | State in lane now | Owner / round | Pointer |
|---|---|---|---|---|
| 1 | Cleanup summary: `listeningAfter` aggregate stores "all workers not listening" (aggregate true, per-worker false) | Still open. Defect present: `scripts/aria-loopback-round13.mjs:605` builds `listeningAfter` from `every(... === false)`; `corpus/evidence/round-13/aria/receipt.json:2521` aggregate `true`, `:2529` per-worker `false`. Original receipt must stay byte-identical. | C2 sidecar (round-14) | verifier `:158` |
| 2 | Node metadata: observed 26.12.0 vs recorded 24.21.0, minimumMajor 20 | Still open. `corpus/evidence/round-13/aria/runtime-pin.json` `node.recorded = "24.21.0"`, `minimumMajor = 20`; `receipt.json` records `"node": "26.12.0"`. Host state differs by shell (see §4). | C2 sidecar (round-14) | verifier `:159` |
| 3 | USER registry precision: document `--witness REV`; explicit repaired-code binding; USER20+alias=21 disaggregation | Still open. `SKILL.md:1678` (`historical-user-contract` row) lists only `--self-test` and isolated fixtures; `--witness` is absent for USER (it appears only on the ROUND row, `SKILL.md:1677`). Count wording still "USER21" (see §3). | Lane (round-14 append) | verifier `:160` |
| 4 | Inherited broader gate debt: lane-authored SCORECARD shell execution, r07 survivor replay, user-record freezing, IPv6 origin, unpinned external validator | Still open and uncredited. Shell execution: `scripts/check-round-contract.mjs:292-295` and `scripts/check-user-round-contract.mjs:310-313` (`spawnSync('bash', ['-c', command])`). C1 round-14 wave targets the first two. | C1 (round-14) for shell; others retained | verifier `:161`; `SKILL.md` registry trust-boundary note |
| 5 | Closure conformance: no frozen step-1/step-4 closure-checker run | Still open. Operator/protocol-owned. | Operator / protocol | verifier `:162` |
| 6 | Numerical erratum: quote at round-12 verifier `:153` is 14 words, not 16 | Resolved by the round-13 verifier's own append (`:163`). No lane action. | none | verifier `:163` |

### 2b. Round-12 verifier, routed items (`corpus/lessons/round-12-verifier-spotcheck.md:199-219`) — status carried forward

| # | Item | Status | Pointer |
|---|---|---|---|
| 1 | Carried legacy gate repair (SHONEN canonical four-box regeneration vs historical baselines; fixtures) | Addressed for the SHONEN/census interaction by the round-13 compatibility policy (`corpus/lessons/round-13.md:10`, `SKILL.md:1665-1686`). USER `round_count 6/10` remains red by design. | `corpus/lessons/round-13.md` Gate |
| 2 | Collector-before-response-creation timing precision (BiDi) | Resolved by append at `corpus/knowledge/webdriver-bidi-capability-matrix.md:130-166` (per `corpus/lessons/round-13.md:58`). | matrix `:130-166` |
| 3 | FreshRetry byte-label correction (wire vs decoded bytes) | Resolved by dated append to `.ufo/waves/round-12/w1/FreshRetry.txt` (`:156-231`); old receipt untouched. | `corpus/lessons/round-13.md:59` |
| 4 | Citation precision (`accessible note:70` default-partial; `Report:16` dossier range) | Resolved by append to `corpus/knowledge/playwright-accessible-locators-and-snapshots.md` (`corpus/lessons/round-13.md:60`). Old fleet report not edited. | `corpus/lessons/round-13.md:60` |
| 5 | Operator/protocol closure conformance | Open; operator-owned. | `corpus/lessons/round-13.md:61` |

## 3. USER fixture-count correction (20 + alias = 21)

Exact counts, re-read from source by inspection (no execution):

- `scripts/check-user-round-contract.mjs:668-741`: the `cases` array has **20** fixture entries (clean, short_swarm, missing_gate, consequential_action, future_lesson_allowed, future_lesson_mutated_after_commit, historical_lesson_changed, future_lesson_rename_from_pinned, canonical_shonen, shonen_x_any_text, shonen_unresolvable_pointer, shonen_tree_pointer, shonen_blank_box_prose, shonen_wrong_title, shonen_extra_box, shonen_crlf, shonen_double_newline, pstack_evidence_tamper, round_script_tamper, round_script_cutover). Grep for `{ name: '` in the file also returns 20.
- `scripts/check-user-round-contract.mjs:766-776`: one separate `production_alias_refused` CLI control.
- `scripts/check-user-round-contract.mjs:778`: prints `USER_ROUND_CONTRACT_SELFTEST verdict=clean cases=${cases.length + 1}` → `cases=21` = 20 fixture cases + 1 alias control.
- Passing SELFTEST records expected: 21 (20 `SELFTEST name=...` lines plus the alias line).

Corrected wording to use going forward: **"USER: 20 fixture cases + 1 production-alias control = 21 CLI controls."** Not "USER21 cases."

Same disaggregation for ROUND (for reference): `scripts/check-round-contract.mjs` has 26 `{ name: '` entries and prints `ROUND_CONTRACT_SELFTEST verdict=clean cases=${cases.length} alias_checks=1` (`:698`) → 26 fixture + 1 alias = 27 SELFTEST records. The existing wording "ROUND self-test26 cases plus alias control" is already correct.

Historical text that uses the ambiguous "USER21 cases" and needs a dated append-only erratum (do not edit the historical bytes):

- `SCORECARD.md:554` ("USER21 cases, clean")
- `LOG.md:637` ("USER's21 fixtures") and `LOG.md:655` ("USER21 cases clean")
- `corpus/lessons/round-13.md:11` ("USER21 cases")

## 4. Outstanding approval question (operator-owned)

- Fleet L0 file `/home/vgpnk/Projects/shokunin/.ufo/l0-questions.md:25`: `tabi | round-5 | Operator approval requested — filed: tabi-shokunin/corpus/handoffs/operator-approval-request.md sha256 94dc63f5…0ac0aa (121 lines …)`. Verified: packet exists, sha256 `94dc63f5fb9e3d9818008663fe46a4d08776ff7d79a7a1a821903b2d0f1ac0aa`, 121 lines. No answer line exists for `tabi` after `:25`; this is the only tabi approval line.
- Asks, per packet §2: R1 (C3 third-party read-only, one named public URL, 1 cold run, ≤20 requests / ≤60 s, robots-first, observation only); R2 (C2 operator's own property, same terms); R3 (C6 budget). C4 never; C5 and A5 deferred to a separate packet.
- State: unanswered. The loopback-only anti-claim holds; no external site may be contacted. The lane may not self-assign a budget (`corpus/handoffs/operator-approval-request.md`; `interaction-approval-table.md` C-classes).
- Second outstanding tabi L0 line: `/home/vgpnk/Projects/shokunin/.ufo/l0-questions.md:34` (`tabi | round-1 | Reconcile the relaunched round namespace and craft dispatch wording`). Unanswered; the run proceeds without an answer.
- Decision needed from operator: answer R1/R2/R3 in place in `.ufo/l0-questions.md`, or record silence. Not a lane action.

## 5. Stale-lane and tool state

Lane: `git status --porcelain` shows only `?? .ufo/waves/round-14/` (this wave). HEAD `bebe2ef` (protocol-shokunin verifier append), `rev-list --count @{u}..HEAD` = 0. No round-14 LOG/SCORECARD/SHONEN entries exist yet. Round-13 is the last committed lane round (`c702286`, `b6d67c1`).

Fleet root (not lane): `.ufo/watchdog.log` modified; `.ufo/state/tabi.report-baseline` and other `*.report-baseline` untracked. Not lane-owned; not touched.

Runtime / tools observed (read-only version queries only):

| Item | Observed | Notes |
|---|---|---|
| `node` on PATH | v24.21.0 (fnm multishell) | matches `runtime-pin.json` recorded 24.21.0 |
| mise node | `~/.local/share/mise/installs/node/latest/bin/node` → v26.12.0 (26.12 and 26.12.0 also installed) | matches the Node recorded in the ARIA receipt |
| pacman `nodejs`/`npm` | not installed via pacman | Node comes from fnm/mise, not pacman |
| Playwright | pinned `@playwright/test@1.64.0` / `playwright-core 1.64.0` in `corpus/evidence/round-13/aria/` with `node_modules` (git-ignored) | Chromium recorded: 156.0.8078.4, rev 1248 (`runtime-pin.json`); executable presence not checked |
| uv | `/home/vgpnk/.local/bin/uv` present | not used here |

Tool installs/updates by this seat: **none.** Reason: the scope is read-only reporting; no missing tool blocks any listed item. Under the operator tooling directive, the stale Node pin is a metadata reconciliation (routed item 2), not a missing tool. Any install would need to follow the update-safety channel order and be recorded by the owning seat.

## 6. Out-of-list shell execution noticed (for C1 scope awareness; not a routed item)

- `scripts/user-seat.mjs:34` and `scripts/pstack-seat.mjs:34`: `spawnSync('bash', ['-c', slice.command])` in seat runners (slice-supplied commands). Not the legacy gates; not in round-13 routed items. Round-14 C1 scope is only the two gates; the seat runners are unmentioned in debt.
- `scripts/check-sources.mjs:467`: `spawnSync('awk', ['-F|', program, path])`, fixed program, not a SCORECARD command. Not in routed debt.
- `scripts/check-round-contract.mjs:292-295` and `scripts/check-user-round-contract.mjs:310-313`: the two gates the C1 wave targets.

## 7. Commands L1 should run after all seats land (described, NOT run by this seat)

1. `cd /home/vgpnk/Projects/shokunin/tabi-shokunin && node scripts/check-user-round-contract.mjs --self-test` — expect 21 `SELFTEST ... result=PASS` lines (20 fixture + alias) and final `USER_ROUND_CONTRACT_SELFTEST verdict=clean cases=21`, exit 0.
2. `node scripts/check-round-contract.mjs --self-test` — expect 26 fixture PASS lines, alias check, `ROUND_CONTRACT_SELFTEST verdict=clean cases=26 alias_checks=1`, exit 0.
3. `node scripts/check-round-contract.mjs` — expect exit 0, 10 `ROUND` lines clean (production).
4. `node scripts/check-user-round-contract.mjs --expect 10` (production) — expect exit 1 `round_count`, "Found 6 user rounds, expected 10" (known red; must not be relaxed).
5. USER witness: `node scripts/check-user-round-contract.mjs --witness <legacy-rev>` using the rev recorded in `corpus/evidence/round-13/gates.json` — expect old exit 1 `history_rewritten` and new exit 0 `clean`; the printed `USER_ROUND_CONTRACT_WITNESS` line must show `result=PASS`.
6. Byte checks: `git -C . show <before>:SHONEN.md | sha256sum` vs HEAD; `corpus/evidence/round-13/aria/receipt.json`, `runtime-pin.json`, and `corpus/evidence/round-13/gates.json` must be byte-identical to their committed blobs (sidecar must not overwrite them).
7. Confirm SHONEN.md contains exactly four `- [~]` lines and zero `- [x]`.
8. `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` — expect `tabi	ok	…/corpus/SOURCES.md` exit 0.

## 8. Handoff

- Writes: this file only.
- Not touched: SHONEN, lessons, LOG, SCORECARD, SKILL, scripts, evidence, `~/.omp/agent` (read `RULES.md` only), fleet MANIFEST or sibling state.
- Blockers: none for this report. The R1/R2/R3 approval and the round-1 namespace question remain operator-owned.
- Findings above are status-neutral; they do not change scalars, SHONEN marks, or any gate verdict.
