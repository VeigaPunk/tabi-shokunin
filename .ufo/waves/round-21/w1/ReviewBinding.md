# ReviewBinding — round21 w1 binding falsification (TabiR21.ReviewBinding)

Read-only reviewer, leaf. No tests/builds/linters/browser/check executions; no installs (git/node/sha256sum preexisting; pacman paused, untouched). Node invoked only as a static JSON reader for observation; the counter and selftest were never executed. All paths relative to lane root. Observation window closed 2026-10-21T13:11:00Z.

## Axes

Falsifiable-defect count with exact failure shape; evidence precision (path/line/hash); binding-surface coverage (producer↔receipt↔execution-record↔registry↔revision); zero false passes; bounded runtime.

## Observed binding chain at window close (13:11:00Z)

| Artifact | sha256 (prefix) | mtime (local) |
|---|---|---|
| `scripts/webmcp-lifecycle-round21.mjs` | `5363d576` | 10:06:08 |
| `.ufo/waves/round-21/measure-c1.mjs` | `be01b1a9` (was `691fb85d` mid-review) | 10:06:39 |
| `.ufo/waves/round-21/selftest-c1.mjs` | `03167ee7` (was `d59e24a2`) | — |
| `corpus/evidence/round-21/runtime/receipt.json` | `323ccd59` (was `32a39dad`) | 10:07:14 |
| `.ufo/waves/round-21/runtime-execution-final.json` | — records `producerSha256 847d0467…`, argv `--out .ufo/waves/round-21/runtime-candidate`, exit 0, 12:53:34Z run | 09:53:45 |

Producer identity census across the window: `a273fe77` (two 12:39 runs: exit1 `node_version_mismatch` in `runtime-execution.json:stderr`; exit0 in `runtime-execution-pinned.json`), `123b9cac` (embedded producer bytes in `fixtures/positive.json` and `fixtures/positive-ordered.json`), `847d0467` (12:53 corpus generation, `runtime-execution-final.json`), `5363d576` (current producer, current receipt binding). The corpus was regenerated at least twice under review; the wave was actively converging.

## Findings

### F1 — MEDIUM (provenance, open): execution record does not describe the corpus-generation run
`corpus/knowledge/webmcp-nonautosubmit-round-21.md` header cites `.ufo/waves/round-21/runtime-execution-final.json` as producer/argv provenance, but that record binds `producerSha256 847d0467…` (`--out .ufo/waves/round-21/runtime-candidate`) while the receipt it purportedly provenances binds `5363d576…` and the counter never reads execution records (`INPUT_PATHS`, `measure-c1.mjs:24` as read at `691fb85d`). Failure shape: the committed receipt's only external execution witness testifies to a different producer build; the receipt's environment/flags/cleanup claims are self-asserted by the producer with no retained run record for `5363d576`. The output dir `runtime-candidate` no longer exists, and the execution record carries no receipt/evidence digests, so byte-identity between the executed run's output and the committed corpus is unverifiable for the `847d0467` run too. Minimum acceptance (fits L1's w2 binding-manifest checkpoint): one execution record with exit 0 whose `producerSha256` equals the committed producer blob and which records the receipt (ideally per-case) digests of the committed corpus; note header points at that record. No new audit run by me — this is the gap as observed at 13:11:00Z.

### F2 — LOW (counter hardening, as read at `691fb85d`; may differ in `be01b1a9`): pre-invoke responses are not rejected
`events` (frames `WebMCP.toolResponded` matching `invocationId`) are bounded above by `f.seq<post.seq` and counted in `responseCount` by `f.seq<pre.seq`, but carry no lower bound against the `WebMCP.toolInvoked`/sent frames. Failure shape: a fabricated receipt placing a `toolResponded` frame before `toolInvoked` in `seq` — a temporal impossibility (response precedes invoke) — passes every check, with `responseCount`/`after.responses` re-derived consistently around it. Minimum acceptance: require every matched event's `seq` > `invoked[0].seq` (stable finding id, e.g. `event_identity`).

### F3 — LOW-MED (context binding, as read at `691fb85d`): fresh-context claim unbound across cases
`context_cleanup` validates each case in isolation (`browserPidsBefore` nonempty positive ints, `browserPidsAfter===[]`, `contextClosed`). Failure shape: all 12 cases declaring the identical `browserPidsBefore` set (one reused browser, closed after each case) passes, contradicting "each case fresh context". Minimum acceptance: cross-case disjointness of `browserPidsBefore` (pairwise), reusing a stable finding id.

### F4 — LOW (selftest oracle gaps, as read at `d59e24a2`/expected 33): several counter branches have no falsification case
Verified 33 expected names ↔ 33 `mutate` switch cases (drift I observed in an earlier revision — expected 30 vs 25 cases, which would have crashed `mutate` at `default:throw` — is fixed in the current canonical pair). Still untested branches: the seq-ordering chain `answered.seq<pre.seq<action.seq<completed.seq<post.seq`; observation-marker mirror equality (`pre.seq/at/value` vs marker frame); `action[0].phase` values; `action-complete` presence; `input.q` mismatch (`before-action-order` perturbs only `at`, so the at-branch is exercised but the seq branches are not). Failure shape: a counter regression deleting any of those conjunction terms still passes `--selftest` exit0 — false pass of the oracle itself. Minimum acceptance: persisted mutations per branch (delete `action-complete`; set `phase:'dispatch-started'` on `na-pending`; bump answered frame's seq to end; desync `preMarkers[0].value`) with expected finding ids.

### F5 — INFO/LOW (fixture identity): selftest never exercises the committed producer bytes
`fixtures/positive-ordered.json` embeds producer draft `123b9cac` (self-consistent, 4 canonical flags; mirror CLEAN under `691fb85d` logic), so selftest validates counter logic only, on a different producer build than the corpus's `5363d576`. A producer-side regression that changes recorded shapes would pass selftest and fail only at the real measurement. Minimum acceptance (optional): selftest asserts `sha(embedded producer) === receipt.producer.sha256 === sha(canonical scripts/webmcp-lifecycle-round21.mjs)` at start, or regenerates the fixture from the final producer run.

## Verified clean (no finding)

- Counter↔corpus re-derivation: full static mirror of `evaluate` logic as read at `691fb85d` over the then-current corpus (`32a39dad` receipt) — zero violations, all 12 cases; same for `positive-ordered.json`. This is observation, not the counter; see gaps.
- Revision binding in `filesAt`: full-40-hex regex, `rev-parse --verify --end-of-options rev^{commit}` with resolved-equals-input, blob-only (`100644|100755`), `entry_not_regular`→exit2, `-z` pathspec list over `INPUT_PATHS` incl. trailing-slash PREFIX; deterministic git env (`GIT_CONFIG_NOSYSTEM`, global `/dev/null`). Lane root is git-colocated (`.git` present) so default `ROOT` git binding works.
- Baseline: at `e7cf11a810003d4a65cc85bd265f2c17dd65b738` both `PREFIX+receipt.json` and NOTE are round21-new → early return `metric 0, exit 0`; partial states (one of two present) → `partial_state` exit1; shape/git failures → exit2 catch-all.
- Source binding: stored body `.ufo/waves/round-21/sources/html_form_element.cc` sha256 `8c8d6796…` equals counter const, `source-opening.json.decodedSha256`, and `corpus/SOURCES.md:114` cell; S100 row unique, 13 cells, URL cell, `mined`, backlink to the note; S101 own-work row (`SOURCES.md:115`) satisfies `own-work`/`A`/`mined`/receipt-path/backlink cell checks. SKILL.md contains the note filename; note starts `source:` and carries S100/S101 and all 12 backticked case ids.
- Environment: current counter pins exact 4-flag equality including `--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1` and `--disable-extensions` (the earlier one-substring weakness is gone); receipt matches.
- Two mid-review corpus mismatches I pinpointed against the older counter (`na-native-submit` `after.submits:null` vs derived `[]`; `na-reset` `responseCount 0` vs a `toolResponded` at `pre.at` with `at`-based counting) are resolved by the current logic (`Array.isArray(...)?...:null` coercion; `seq`-based counting) — historical, recorded for the falsification trail, receipt.json:215-era.

## Residual risk and verification gaps (honest)

1. All CLEAN results are a static mirror against counter `691fb85d` + receipt `32a39dad`; both were superseded (`be01b1a9`, `323ccd59`) minutes later. The current pair has NOT been re-derived by me, per the bounded-stop instruction.
2. No check execution was permitted or performed: `node .ufo/waves/round-21/measure-c1.mjs REV` (baseline → 0/exit0; measured REV → 12/exit0) and `--selftest` remain L1's to run at the committed checkpoint.
3. The measured-revision binding manifest intentionally does not exist yet (L1, post-w2): nothing currently proves the future measured commit contains exactly the reviewed bytes, nor an execution record for the `5363d576` generation (F1). Both must close at the checkpoint.
4. F2–F4 statements are tied to the revisions I read in full (`691fb85d`, `d59e24a2`); the `be01b1a9`/`03167ee7` revisions may already address them — re-check before treating them as open.

Report ends. Findings are recommendations; canonical assignment remains the sole instruction source.
