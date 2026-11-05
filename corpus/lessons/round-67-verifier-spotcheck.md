# tabi — round 67 verifier spot-check

author: hyaku closure (non-author integrator, @m_zfl)
date: 2026-11-05. Judged tip: `cd88c53f5adee028d9cb6b79432d49f7a3b7561a`; base `5400136b233579f7b716ab83a70b8be24ed88b26`; claim freeze `e0fc04c2aab996325442b005944ce053832b9ce9`. Report: `.ufo/reports/round-67/tabi.md` (fleet `d48c87ef`). This is the outside discernment check `LEARNING.md` owes the round; the lane did not author it.

## Conformance (protocol step 1)

- Report committed in the fleet repo by the lane identity `tabi-shokunin <tabi@shokunin.local>` at fleet commit `d48c87ef` (2026-11-05T07:28:44-03:00), after the lane tip (`07:27:32`) and the L0 commit `85742eb9` (`07:27:52`) — landed last. `git merge-base --is-ancestor d48c87ef HEAD` holds on the fleet repo.
- `## SHONEN` heading at report line 124 with four `[~]` lines — one per `SHONEN.md` box.
- Cited lane commits `5400136b` (base), `b5ebbb0c`, `019efae0`, `e0fc04c2`, `cd88c53f` all exist and each passes `git merge-base --is-ancestor <hash> master`. `git ls-remote origin refs/heads/master` prints `cd88c53f…`, equal to the local master tip.
- `scripts/hyaku/jj-lane.sh state`: `local=cd88c53f… remote=cd88c53f… ahead=0 behind=0`; `git status --porcelain` in the lane repo is empty — no uncommitted round work.
- Watchdog digest (mutable log; digest is the pointer): line 2794 `2026-11-05T06:30:59-03:00 launch tabi round=67 pgid=1862454 driver=hyaku-inline attempt=1`; line 2808 `2026-11-05T07:31:04-03:00 complete tabi round=67; hyaku-inline attempt=1`. No `lane-dead-no-report tabi round=67` line.
- Prompt fidelity: `.ufo/prompts/tabi-round-67.md` is the canonical `templates/round-prompt.md` rendering (sections 1–5 byte-comparable modulo the `{{LANE}}`/`{{ROUND}}`/`{{FLEET_ROOT}}`/`{{AXES}}` substitutions) plus the hyaku addendum §6. It carries the round-level contract (mission/axes binding, L2 minimum, commit-then-push, push scope, L0 side channel) and all five child-lane items (report path, commit-before-report ordering, `SHONEN` heading, commit-hash citation, write scope). The quoted L2 floor "at least 8" matches `MISSION.md` §L2 concurrency.
- The four `SHONEN` boxes are `[~]` asserted with resolvable pointers; all four are checkable by a non-author without lane-internal context. Promotion review is operator-owned (noted for the operator; nothing here writes `[x]`).

## Per-claim re-check

Per PROTOCOL §Gate standard (Closure consequence) the lane's gates and selftests were **not executed**; each claim was re-derived over committed bytes (evidence-verified) or re-measured with plain commands (re-measured). Commands run at the judged tip unless noted.

### C2 — calibration (receipt-provenance gate v4 refuses repo-escaping relative matrix input): VERIFIED

Evidence-verified from the committed scored receipts at `cd88c53f`:

- `.ufo/waves/round-67/scored/c2-before-v3.json`: exit 0, `ok true`, `failures 0` — v3 accepted `../outside.mjs` (the red state).
- `.ufo/waves/round-67/scored/c2-after-v4.json`: exit 1, `byCheck.matrix-input: 1`, detail exactly `input escapes repo: ../outside.mjs`.
- `.ufo/waves/round-67/scored/c2-v4-selftest.json`: verdict `clean`, 17 of 17, exit 0.
- Mutants: `c2-mutant-M-E1-guard-removed-selftest.json` 15/17, `M-E2-startswith-only` 16/17, `M-E3-absolute-only` 15/17 — each exit 1 (red).
- Fixture and controls committed under `.ufo/waves/round-67/c2/` (fixture `X/repo`, `outside.mjs`, red/green control JSONs).

Axis verdict: **improved** (behavior moved from accepting an escaping relative matrix input to refusing it with the exact finding; score held 9).

### C3 — coverage (capability `chromium-hscroll-domain-linux`): VERIFIED

Re-measured over committed bytes:

- Before: `git ls-tree -r --name-only 5400136b -- corpus/evidence/round67/ | wc -l` → `0`.
- Pins re-hashed: `git show cd88c53f:scripts/chrome-cdp-loopback-round67.mjs | sha256sum` → `b7cd3b1d6cb3a51dfcfcaa683ec08818b894038da1ab5b6ab65d8df760306d22` = `claims.json.driverSha256`; counter `.ufo/waves/round-67/counters/chromium-hscroll-r67.mjs` → `cf97a68d9ac480dad20c0eb09f3498b4b58c3f6f86f7ce184fdf56e81e49bde2` = the `counterSha256` in the scored receipts; `corpus/evidence/round67/chromium-hscroll-scrollend/receipt.json` → `5254538d2d8ff113ddeb6fff299f8fb476b059f22e648eddced956eed666f9ff` = the input pin in both `c3-negatives.json` and `c3-mutants.json`.

Evidence-verified from the committed scored receipts:

- `c3-live-verifier.json`: exit 0, `predicate true`, `findings []`, two cold runs (run-a, run-b) each `counterExit 0`, `counterPredicate true`; `crossRun true`, `evidence true`; driver sha equals the pin.
- `c3-counter-on-evidence.json`: exit 0, `predicate true`, `findingCount 0`, `checks 35`.
- `c3-counter-selftest.json`: 37/37, exit 0. `c3-negatives.json`: 35 negatives, 35 refused, `forgedGreen 0`. `c3-mutants.json`: 13 applied, 13 live-accepted, 13 killed, `surviving []`.
- Degenerate controls: `c3-degenerate-summary.json` — `counterExit 1` each with 13 (M-A no wheel), 23 (M-B no scrollend), 6 (M-C3 page overflow hidden) findings; per-run verdicts in `c3-degenerate-*-counter.json`. (The `degenerate.exit: 2` fields inside `scored-summary.json` are the degenerate *driver* exits; the counter verdicts are the files above — consistent with the report table.)

Axis verdict: **improved** (no-work base 0 evidence files → committed evidence, a re-runnable live verifier, and a SCORECARD capability row; score held 9).

### C1 — adjacency (withdrawn before freeze): withdrawal VERIFIED as evidence-backed

`claims.json` records `withdrawn.C1` (axisDeclared adjacency, score 8, status WITHDRAWN before freeze) with four committed refuting reports. Re-measured the refutation myself over committed bytes:

- Ledger census: `git show cd88c53f:.ufo/waves/round-66/c1/adjudicated/adjacency-host-delta-r66.tsv` then `awk -F'\t' 'NR>1 && $1=="line"{print $8}' | sort | uniq -c` → `95 no-tabi-ground`, `49 contested-open`, `5 overlap-declared` (matches `R67Connector/report.md`).
- BG-word sweep: `BG_WORDS` extracted from `.ufo/waves/round-65/counters/c1-adjacency-host-v22.mjs` (`['cdp','devtools','remote-debugging','headless','webdriver','geckodriver','selenium','playwright','bidi','crawl','screenshot','record-har']`), then an awk sweep over the 95 `no-tabi-ground` rows → `zeroHit: 0`, `withHit: 95` — every legal row already carries a BG word, and the v22 meter admits only BG-hit rows (`delta-line-invented` otherwise). The proposed `no-tabi-ground requires 0 BG words` branch is unsatisfiable by construction.
- Independent v22 flip baseline: `R67MutTester2/report.md` — 298/298 flips accepted (the pre-withdrawal meter is vacuous); `R67Reviewer1/report.md` — "Verdict: unsound as proposed."

Verdict: the withdrawal is honest and correct — no predicate was frozen, nothing was scored, adjacency was not harmed. The lowest-axis obligation is therefore unmet and **the round is not admitted** (the lane self-reported exactly this).

## Axis verdicts (closure)

| Axis | Verdict | Evidence |
|---|---|---|
| adjacency | unchanged | C1 withdrawn before freeze on committed evidence; score held 8; the SCORECARD diff `5400136b→cd88c53f` touches only the appended round-67 block |
| calibration | improved | C2 verified (above) |
| coverage | improved | C3 verified (above) |
| depth | unchanged | no claim declared; no depth movement in the SCORECARD diff |
| operability | unchanged | no claim declared |
| freshness | unchanged | no claim declared |

## Spot-check table (LEARNING.md discernment; ≥1 admit and ≥1 reject sampled)

| Item | Decision | Re-opened source | Agree/disagree | Reason |
|---|---|---|---|---|
| S172 CSSOM View §3.1 Scrolling + §13.3 Event summary (tier A, `spec`) | Admit | Live `https://drafts.csswg.org/cssom-view/` fetched 2026-11-05 hashes **byte-identical** to the staged file: `sha256 e8f4fbda9555bea51b7e161b3195fec033430e6118f669d3091681b35a71f4a6`; quote 1 verbatim at staged line 2016 (`id="scroll-completed"`); quote 2 verbatim at staged lines 4736–4737 (markup-split) | agree | Both quotes locate and match; tier A is correct for the scope "scrollend firing and scroll completion"; the row's `teaches` is grounded by the located text. Minor: quote 2 is 13 words, recorded as 14 — the ≤25-word contract is met either way; count drift only. |
| Withdrawn C1 BG-word disposition rule (v23) | Reject as source and as predicate | Re-derived over committed bytes (95/95 `no-tabi-ground` rows carry ≥1 BG word, zeroHit 0; meter admits only BG-hit rows) | agree | The rule cannot be satisfied by any row the meter can legally hold; disposition is semantic adjudication, not a counting predicate. The pre-freeze withdrawal is the honest stop. |
| CSSOM View `scroll-completed` definition as a timing source | Reject for timing | Same live source (byte-identical snapshot); §3.1 defines the completion state, no time bound | agree | Defines completion, not latency; correctly rejected for a timing scope. |

## Trend verdicts (closure)

- **expansion: improved.** Knowledge 79→80 with `corpus/knowledge/chromium-hscroll-scrollend-round-67.md` (provenance trio intact; `source:` cites S172, opened this round); registry 171→172 (re-counted with the census row pattern); capability `chromium-hscroll-domain-linux` enters the SCORECARD capabilities table with a re-runnable demonstration.
- **quality: unchanged.** No admitted corpus entry was re-verified, superseded, or found false this round; the C2 gate repair and counter isolation are instrument quality, reported under calibration.
- **discernment: improved.** The round's Gate decisions (one admit, two rejects) all verify under this non-author spot-check (table above), and the lane's own pre-freeze withdrawal of C1 is confirmed sound by independent re-derivation. Per `LEARNING.md`, outside agreement with the gate on admits and rejects grades the trend; the closure owed this check and it is now on record.

## Routed defects (the lane fixes these next round; status-neutral)

1. **Gate registry stale at the registry home.** `SKILL.md`'s instrument table lists only the r64 generation (`chrome-cdp-loopback-round64`, `chromium-wheel-r64`, `verify-live-r64`, `scripts/check-receipt-provenance.mjs`). The round-67 instruments — `chrome-cdp-loopback-round67.mjs`, `chromium-hscroll-r67.mjs` (+ `make-negatives-r67.mjs`/`mutate-r67.mjs`), `verify-live-r67.mjs`, and the provenance gate `check-receipt-provenance-v4.mjs` — have no registry row (entry command, verdict map, self-test spelling, pinned-value path, write scope, owner). Gate standard delivery: closure grades no gate conformant until its registry row exists at `SKILL.md`. Register the r67 rows or supersede the r64 rows.
2. **`claims.json.frozenAt` reads `"pending-commit"`** at the freeze commit `e0fc04c2` (same pattern as r66; disclosed in the lesson's errata). The freeze hash is correctly recorded in the lesson and SCORECARD block — accepted — but a future freeze should name its commit in the file.
3. **Quote word-count drift:** the S172 §13.3 quote is 13 words, recorded as 14 in the report, lesson Gate, and SOURCES row anchor cell. ≤25-word contract met; no rewrite of filed bytes — this spot-check is the correction record.
4. **Pre-fix survivor evidence lives only in a seat report** (`R67Executor3/report.md`; the `controls/c3` battery was rebuilt after the isolation fix). Disclosed by the lane. When a counter change depends on isolation evidence, commit the survivor receipts when they are produced.

## Operator notes

- All four `SHONEN` boxes carry resolvable `[~]` pointers (SKILL.md §Approval table; round-67 receipt + LOG; the knowledge note's `recheck:` command; `PROVINCE.md:3-19`). A non-author could check them today; promotion is operator-owned and nothing in this round bars it on conformance grounds.
- Round verdict: **not admitted** (C1 withdrawn before freeze; lowest-axis obligation unmet) — an honest stop, correctly self-reported by the lane. C2 and C3 verify; no axis is harmed; the corpus and capability deltas stand on their own evidence.
