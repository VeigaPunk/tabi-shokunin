# kengaku-shokunin — Province

**Domain:** LLM/model research & evaluation — scopes ~/Projects/webzites/repos/llm-wiki, route telemetry

**Owns:** the domain knowledge, playbooks, error patterns, and checklists above.
**Refuses:** anything outside this domain; report cross-domain evidence back to the orchestrator rather than absorbing it.

## Surfaces (re-verified round 14, 2026-09-29; route telemetry absent; benchmark battery relocated — see rows)

| Surface | Path / endpoint | What this lane does with it |
|---|---|---|
| Research notes (SSOT for eval craft) | `~/Projects/webzites/repos/llm-wiki` — `wiki/ai/agents-and-engineering/`, `wiki/karpathy/`, `wiki/ai/{foundations,alignment-and-training,books,scaling-and-forecasting}/`, `Home.md`, `raw/` | digest into `corpus/knowledge/eval-*` entries; the `~/wikillm/llm-wiki` path does **not** exist here (`test -e` → absent) **ABSENT 2026-10-20** (round 25: first local path fails `test -e`; superseded by §Province map) | **ABSENT 2026-10-28** — `~/Projects/webzites/repos/llm-wiki` does not resolve; no relocation under `~/Projects` or `~/archive` (round 51: probe + receipt `corpus/evidence/round51/surfaces/paths.txt`) |
| Local benchmark battery | `~/archive/bench-arena/` — was relocated from `~/bench-arena/` during round 14; `tasks/`, `grade.sh`, `loop.sh`, `report-grok45.csv`, `report-qwenlocal*.csv`, `telemetry-qwenlocal-v2.csv` were all present at the archive path then (SUPERSEDED 2026-11-04: the resolver answers this row absent — the present-tense claim had stood since round 14) | authored runs, status-flip and truncation taxonomy; content no-drift (0 files newer than 2026-09-28), but historical commands using the old path are frozen evidence **ABSENT 2026-10-20** (round 25: first local path fails `test -e`; superseded by §Province map) | **ABSENT 2026-10-28** — `~/archive/bench-arena` and `~/bench-arena` both fail `test -e`; no relocation found (round 51: probe + receipt `corpus/evidence/round51/surfaces/paths.txt`) |
| Served local model | `http://127.0.0.1:34113` — `/v1/models`, `/health`, `/v1/chat/completions` (Qwen3-Coder-30B-A3B-Instruct **UD-IQ2_XXS**, `owned_by=llamacpp`, `n_ctx=16384`). **Process-level pin (round 10, first time from cmdline not behaviour):** `llama-server` pid 1299, `/proc/1299/cmdline` == `~/.config/systemd/user/qwen-coder.service` ExecStart (41 tokens, EXACT_MATCH): `--parallel 2` (no literal `-np`), `--cont-batching`, `--ctx-size 16384`, `--kv-unified`, `--cache-type-k/v q4_0` (**4-bit KV cache — unstated premise of every r8/r9 number**), `--flash-attn on`, `--no-context-shift`, `--n-gpu-layers 999`, `--jinja --chat-template-file ~/.config/llama/qwen-coder-godspeed.jinja` (custom non-upstream template). Evidence: `corpus/evidence/round10-fleet/r10-scout-endpoint.md` + raw captures `models-34113.json`, `props.json`, `slots.json`; its identity was probed via `/v1/models` + `/health` 200 each round through round 25 (SUPERSEDED 2026-11-04: both answer 000) | every probe in `corpus/evidence/`; identity checked each round through round 25; hermetic gates pin committed bytes, never `/proc` **ABSENT 2026-10-20** (round 25: first local path fails `test -e`; superseded by §Province map) | **ABSENT 2026-10-28** — `/health` returns 000 and no socket listens on :34113; the live successor is the next row (round 51: probe + receipt `corpus/evidence/round51/surfaces/paths.txt`) |
| Served local model (round 51 successor) | `http://127.0.0.1:45669` (direct llama.cpp server) and `http://127.0.0.1:1234` (router, `lfm3-server.service`) — `/v1/models`, `/health`, `/props`; model id `LFM3-1.7B`, `owned_by=llamacpp`, n_ctx 32768, slots 4, build `b1-39ebd2`, alias `LFM3-1.7B`, `--model /home/vgpnk/models/lfm3/LFM3-1.7B/LFM3-1.7B-Q8_0.gguf`, pid 242776, 16 argv tokens | capability interpretation only; flag authority is kama's (serving plane). Capture-time pin 2026-10-28 (`corpus/evidence/round51/surfaces/endpoints.txt`), not a capability claim. **ABSENT 2026-11-04** — the round-76 resolver's live probe returns 000 for `:45669`; only the `:1234` router answers 200 (`corpus/evidence/round76/c1-after.txt`) |
| Route telemetry | `~/Projects/bounties/ledger/telemetry.jsonl` — **ABSENT 2026-10-28**, reconfirmed round 14 (last resolved round 11 at 7,226 lines; no relocation under `~/Projects`, `~/archive`, or Trash) | model×lane and reroute-chain **historical inference about model service** only; never treat the path as live |
| Client CLI telemetry | `~/.bailian/telemetry.jsonl`, `~/.bailian/wiki-sync-state.json` | quota-vs-auth failure split, poll-verb rule **ABSENT 2026-10-20** (round 25: first local path fails `test -e`; superseded by §Province map) |
| Model catalogs | `~/.bailian/skills/bailian-docs-llm-wiki/models/{index.md,models.jsonl}`, `https://huggingface.co/api/models`, `https://openrouter.ai/api/v1/models` | selection fields, open-weight twins **ABSENT 2026-10-20** (round 25: first local path fails `test -e`; superseded by §Province map) |
| Own probe artifacts | `corpus/evidence/round8-horizon/`, `round9-replication/`, `round9-fleet/`, `round10-fleet/`, `round11-power/`, `round11-fleet/`, `round12-ladder/`, `round12-fleet/`, `round13-ack-state/`, `round14-fleet/` | durable run bytes + analyses + L2 fleet artifacts; nothing headline-bearing cited from `/tmp` or session-only storage |
| In-repo gate | `grader.py` (repo root; `python3 grader.py` → exit 0/1/2; `--selftest` S0–S7) | hermetic offline replay of **four** probe trees (r8/r9/r11/r12); 733 checks after the round-14 analysis-byte pin, including three r12 md5 pins; round-14 mutation test killed 4/4 fresh corruptions |
| Corpus index | `corpus/README.md` — `python3 plans/round75_c1_index_parity.py --lane .` (three universes enumerated from disk: `corpus/knowledge/*.md`, `corpus/lessons/*.md`, `corpus/evidence/*/`) | index parity in both directions: every described surface has a row and every row names a file on disk; the gate is the resolution check (round 75) |
| Public literature | arXiv / ACL Anthology / ICLR proceedings / vLLM docs / GitHub issues (URLs in `corpus/knowledge/eval-prior-art-calibration.md`) | novelty pricing of local findings |

## Refusals and reported-out scope (round 9, `corpus/evidence/round9-fleet/sibling-overlap.md`)

- **Not owned:** the model-serving plane (llama-server flags, slot/batch
  config) — no lane owns it; escalate to the integrator instead of remediating.
- **kagi:** Janitor consumer-side endpoint/credential config.
- **kumitate:** OMP route resolution, fallback policy, operational failure
  taxonomy.
- **kasegi:** bounty ledger mission-state / dispatcher semantics.
- **kotoba:** prompt- and skill-craft rules, render/trigger behaviour — this
  lane keeps the *measured* effect of prompt format on capability and hands the
  reusable craft implication out.
- **kake:** web properties; the shared word "probe" carries no scope.

Reported out this round (evidence sent, not absorbed): (1) kotoba — keep an
explicit output-contract system prompt whenever tool affordances are exposed,
else a benchmark records `finish=tool_calls` instead of capability
(`corpus/knowledge/bench-arena-round7-scaffold-ablation.md`); (2) kasegi +
kumitate — the ledger split recorded in the round-3 aggregator ruling stays
explicit; (3) kagi — any Janitor consumer-endpoint discrepancy, with the
unowned serving plane escalated.

Round-10 report-outs (evidence sent, not absorbed): (1) **integrator / unowned
serving plane** — the process-level pin above is capability-*interpretation*
evidence this lane keeps, but flag-change authority (KV quantization level,
`--parallel`, context-shift policy) stays unowned; the q4_0 KV cache and
`--kv-unified` semantics are material to any cross-model comparison drawn from
:34113 and were unstated until round 10. (2) **kumitate (informational)** — the
bench-arena `loop.sh` field-count bug (5 emitted fields read into 6 vars ⇒
`telemetry_source=journal` unconditionally; `corpus/knowledge/bench-arena-fresh-run.md`
§Errata round 10) sits in this lane's measurement harness and its fix is
in-lane backlog, but the resulting telemetry-source semantics touch the
operational failure taxonomy kumitate owns — recorded so the taxonomy does not
treat `source=journal` rows as scraper outages. (3) Operator rule re-confirmed
mid-round: domain source repos (webzites/llm-wiki, bounties, ufo-fsd-alpha) are
read-only for this lane; upstream-bound findings travel in the round report.

Round-11 report-outs (evidence sent, not absorbed): (1) **protocol** — the
preregistration standard (hashed predictions + filed power analysis + Brier
scoring + ordering proof + hermetic replay gate) has no sibling owner per
`corpus/evidence/round11-fleet/r11-connector.md`; a fleet-wide *standard*
would belong to protocol/integrator — referred, not imposed. (2) **kotoba** —
ack compliance under checkpoint schedules is 49–65% (the model emits
unrequested full states on ack turns; the r9-verbatim post-checkpoint
spillover ask inflates this by design): prompt-craft evidence for benchmark
authors who treat "Reply 'ok'" turns as free
(`corpus/knowledge/bench-arena-round11-power.md`). (3) **integrator / unowned
serving plane** — the r11 `descriptors` record re-pins the same stack as
round 10 (pid 1299, 41-token argv, q4_0 KV, `--kv-unified`); ScoutPrereg
fetched public evidence that q4_0-KV measurably perturbs outputs (llama.cpp
PR #21038 tables), making the KV-quantization level material to ANY
cross-model number drawn from :34113 — flag-change authority remains unowned.

Round-11 report-out addition: (4) **kasegi** — the bounty-ledger tree
`~/Projects/bounties/` (their namesake surface, incl. `ledger/telemetry.jsonl`)
went absent from this host mid-round-11; last observed resolving 23:32Z
(`corpus/lessons/round-8-aggregator-box3-coldrun.md` command 3, live count
7,226). `find ~ -maxdepth 4 -name 'telemetry.jsonl' -path '*ledger*'` → 0
hits; `~/Projects/the-bounty-hunter/` exists but carries no
`ledger/telemetry.jsonl`. Cause is operator-side host state, not lane state;
this lane marks its surface ABSENT and keeps its historical citations.

Round-12/14 report-outs (evidence sent, not absorbed): (1) **kotoba** — prompt
intent must be derived from the runner, not from a `-ack` storage suffix:
r11 CKPT710 is 85.9% prefix / 84.4% bare `ok` over 384 true ack-only turns,
not 64.5% over 512 mixed-label rows; state fidelity and contract compliance are
separate. (2) **aggregator/protocol** — rounds 12 and 13 both stopped with
artifacts uncommitted and unindexed; a closeout carry-over gate should require
commit + LOG + SCORECARD + index parity before a lane report closes.
Respawn as the cause is `[INFERENCE]`, not established. (3) **No new serving
plane report-out** — endpoint id, pid 1299, 41-token argv, q4_0 KV,
`--kv-unified`, and `--parallel 2` remain exact matches. Evidence:
`corpus/evidence/round14-fleet/{r14-connector,r14-scout-surfaces}.md`.

Round-75 report-out (evidence sent, not absorbed; seat `SiblingR75`): the fleet already
carries primitives this round rebuilt. **kumitate** `scripts/readme-map.mjs:189-202` compares path
identities in both directions (a *duplicate* of R75-C1's knowledge/lessons leg) and
`scripts/receipt-evidence.mjs:185-194` replays recorded argv with output digests (a *new* mechanism
relative to R75-C2). **kotodama** `tools/check-evidence-coupling.py:1559-1568` compares
`(expected_exit, sorted(finding_ids))` (a *duplicate* of R75-C2's attribution primitive);
**tabi** `scripts/check-measurement-binding.mjs:575-613` and **kama**
`tools/round72-receipt-tip-binding.py:60-68` share the ancestor check and add intervening-drift
classification; **mori** `tools/mori-retention-reconcile.py:169-177` binds resolved full revision
plus input equality. Nothing was absorbed into this lane; a fleet-level index/registry standard
belongs to protocol/integrator. Evidence: `.ufo/waves/round-75/w1/SiblingR75.md`.

Surface correction (round 75, 2026-11-04, seat `SourcesHostR75`): `~/archive/bench-arena` is
**ABSENT** (`test -d` rc 1) — the row above it still reads "relocated intact from `~/bench-arena/`
during round 14", which was true at capture time (2026-09-29) and is not true now. Also re-measured
in the same sweep: `:34113/health` → `000` (curl rc 7), `llama-server` alive on `127.0.0.1:1234`
(the round-51 successor row), `~/Projects/bounties` absent, `~/Projects/webzites/repos/llm-wiki`
absent, `~/Projects/ufo-fsd-alpha` present. Two of the four trees earlier rounds treated as surfaces
are gone; the coverage cap for declared-but-unresolvable surfaces widens by one.

## Province map — round 24 (2026-10-19)

*Correction note (appended, append-only): the header's "re-verified round 14,
2026-09-29" on `## Surfaces` is superseded by this section — several rows there
no longer resolve. The old table is retained verbatim as the historical record;
the current state is below.*

### Core

Surfaces that resolve today, each with the check actually run and its result:

| Surface | Check run today | Result |
|---|---|---|
| In-repo verdict gate | `test -e grader.py && sha256sum grader.py` | present; `90c87c88…ae941f` (replay tree r8/r9/r11/r12; `python3 grader.py` is the offline entry point) |
| Own probe artifacts | `for d in round8-horizon round9-replication round9-fleet round10-fleet round11-power round11-fleet round12-ladder round12-fleet round13-ack-state round13-coverage round14-fleet round18-kimi-routing; do test -d corpus/evidence/$d || echo missing $d; done` (prints nothing) | all present; plus 28 root receipt logs indexed in `corpus/README.md` |
| Attribution instrument + frozen tables | `test -e plans/attrib_probe.py && sha256sum plans/attrib_probe.py`; `test -e plans/attrib-r21-frozen.md` / `-r22-` / `-r23-` | all present; probe sha256 today `489f938a…16e06b` (floats between trials and landing per the r21 lesson — frozen anchors live in the `-frozen.md` files) |
| Corpus gate docs | `test -e corpus/QUALITY.md` | present (admission bar Q1–Q8 + round-closure criteria, created round 24) |
| Public-literature registry | `test -e corpus/SOURCES.md` | present; **244 rows at the round-76 census 2026-11-04** (round 75 re-count: 197 rows (round 57 re-count 2026-11-01: `grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md` → 197, incl. S203/S204; the round-56 re-count wrote 195 — that round's BEFORE count — while the cell already described the tree holding S203/S204, so the number was stale on arrival; corrected in place, dated; superseded by the round-76 census 244) per the round-56 non-author closure's R56-V2; 171 at round 51, 170 at the round-51 base tip plus S178), contract-v1 census clean (`corpus/evidence/round24-census/after.txt`; round-56 census receipt under `.ufo/waves/round-56/integrate/`); receipts `corpus/evidence/round24-sources/gate.md` |
| ds-flash-shim source (read-only) | `sha256sum ~/.local/share/ds-flash-shim/shim.py` | present; `42d86d99…15a386` — identical to the disclosed pin in `evidence/attrib-r22-*.log` / `attrib-r23-stream.log` |
| Live probe endpoint | `ss -ltn 'sport = :8791'` | LISTEN on `127.0.0.1:8791` (ds-flash-shim, read-only shim; `:8793` not probed this round) |
| Public literature | URLs cited in `knowledge/eval-prior-art-calibration.md`, `attrib-prior-art-r21.md`, and the ART dossier | reachable-by-citation only — documentation reads only this round, no live model/endpoint traffic |
| Interval re-verdict instrument (round 25) | `python3 plans/attrib_calibration.py --summary` and `--selftest` | exit 0 / exit 0; P1 receipts sha256-pinned; 4 unique samples, 92/92 correct, transitions FAIL>UNTESTED 2, PASS>INDETERMINATE 1 |
| State-assertion check (round 25) | `python3 plans/state_check.py --summary` and `--selftest` | exit 0 / exit 0 on the landed tree (base `6180e4f`: exit 1, 10 mismatches) |

*Round-25 correction (appended 2026-10-20): the "Public-literature registry" row above says 25 rows; the registry held 26 at base (S026, `e21f9ea`) and holds 37 after round 25 (`grep -cE '^\| *S[0-9]{3,} *\|' corpus/SOURCES.md`). Five `## Surfaces` rows now carry dated `ABSENT` markers (QUALITY R4).*

### Frontier

The ground named in `corpus/README.md` §Frontier: agentic benchmark task-spec
audits (Terminal-Bench 2.0 / Toolathlon / SWE-bench Pro primary specs —
unopened leads), contamination transparency cards, judge calibration applied
to this lane's own grader/attribution outputs, an identity-verified endpoint
for novelty probes, and non-karpathy wiki topics (source absent).

### Adjacent

Owner lanes and what is routed to them (grounded in existing PROVINCE/lesson
text, not renegotiated this round):

| Owner | What is routed |
|---|---|
| **kama** | serving plane + endpoint identity — `SKILL.md` and `lessons/round-16-recensus.md` record that kama is rostered and owns serving-plane health/detection and endpoint identity; kengaku keeps *interpretation* evidence and never remediates flags (`--kv-unified`, q4_0 KV, `--parallel`) — flag-change authority is unowned/integrator |
| **chousa** | research method — `corpus/QUALITY.md` and the SOURCES contract both state the question → source-hierarchy → citation-chain → claim-vs-source method stays chousa's (`chousa-shokunin/SKILL.md`); this lane holds neither method nor duplicates it |
| **kotoba** | prompt- and skill-craft rules — measured capability effects of prompt format stay here; reusable craft implications route out (r7 tools-without-system, r11/r12 ack-intent findings) |
| **protocol / aggregator** | fleet process — a fleet-wide preregistration/replay-gate standard and closeout carry-over gates were referred round 11/12–14, not imposed; `SOURCES.md` contract-v1 is fleet-frozen |
| **kagi** | Janitor consumer-side endpoint/credential config (round-9 routing) |
| **kumitate** | OMP route resolution, fallback policy, operational failure taxonomy (`loop.sh` telemetry-source semantics, informational) |
| **kasegi** | bounty-ledger mission-state / dispatcher semantics — plus the round-11 report that `~/Projects/bounties/` went absent operator-side |
| **kake** | web properties; the shared word "probe" carries no scope |

### Historical — absent, not governed

Every path in the `## Surfaces` table that does not resolve today. `test -e`
was run on each; the port was checked with `ss` only (no HTTP traffic):

| Surface | Check | Result today | Last resolved |
|---|---|---|---|
| `~/Projects/webzites/repos/llm-wiki` | `test -e` | absent | wiki reads recorded rounds 8–12 (2026-09-28/29); absent since round-13 coverage receipt |
| `~/wikillm/llm-wiki` | `test -e` | absent | never existed on this host (noted in the table itself) |
| `~/archive/bench-arena` | `test -e` | absent | round 14 (2026-09-29, relocated from `~/bench-arena`); absent per round-13 receipt |
| `~/bench-arena` | `test -e` | absent | round 13; superseded by the archive path, now also absent |
| `http://127.0.0.1:34113` | `ss -ltn 'sport = :34113'` | no listener | endpoint 200 + identity re-probed through round 14 (2026-09-29); refusal recorded at the round-13 re-dispatch (2026-10-15) |
| `/proc/1299/cmdline`, `~/.config/systemd/user/qwen-coder.service`, `~/.config/llama/qwen-coder-godspeed.jinja` | `test -e` | absent | process-level pin rounds 10–14 (pid 1299, 41-token argv EXACT_MATCH) |
| `~/Projects/bounties/ledger/telemetry.jsonl` | `test -e` (whole `~/Projects/bounties` tree absent) | absent | round 11 at 7,226 lines, live count 23:32Z 2026-09-29; went absent mid-round-11 |
| `~/Projects/the-bounty-hunter` | `test -e` | absent | recorded round 11 as existing-but-no-telemetry.jsonl; the tree itself is now gone |
| `~/.bailian/telemetry.jsonl`, `~/.bailian/wiki-sync-state.json` | `test -e` (whole `~/.bailian` absent) | absent | profiled 2026-09-28 (4,274-record digest) |
| `~/.bailian/skills/bailian-docs-llm-wiki/models/{index.md,models.jsonl}` | `test -e` (whole `~/.bailian` absent) | absent | read 2026-09-28 (Bailian model index digest) |
| `/tmp/bench-r{4,5,6,7,7-l2-executor}` run trees | `test -e` | absent (ephemeral by design) | graded runs of 2026-09-28; durable numbers are pasted in-entry per the evidence standard |
| HF + OpenRouter catalog endpoints | not probed this round (docs-reads-only policy) | unverified | probed 2026-09-28 (`knowledge/open-model-catalogs.md`) |

Nothing in this section is governed: these are historical sources whose
digests and receipts are retained in `corpus/`, not current dependencies.

Round-25 report-outs (evidence sent, not absorbed): (1) **kumitate** — the round-25 interval re-verdict
(`corpus/knowledge/attribution-interval-calibration.md`) bounds attribution accuracy on the shim's upstream
cascade legs over forced and natural P1 samples; its leg-share bounds are within-sample shares, never natural
fallback rates or OMP route-resolution facts, which stay kumitate's (`falsify/ConnKumitateReportOut.md`).
(2) **every citer of the r22 "hyper validated" reading** — that verdict is INDETERMINATE under the exact CP95 rule on
the registered population (`corpus/knowledge/attrib-r21.md` §Erratum round 25).

*Round-26 correction R26-E3 (appended 2026-10-21; supersedes the round-25 correction at `:119` "holds 37 after round 25"):
the registry holds **42** rows after round 25 — S001–S042; the `:119` sentence was written before S038–S042 landed
(`grep -cE '^\| *S[0-9]{3,} *\|' corpus/SOURCES.md` → 42 at `f11bffbf`; closure `corpus/lessons/round-25-verifier-spotcheck.md:103-104`).
The `:112` "25 rows" cell stays superseded by `:119` and this line.*

- **R26-E3a (2026-10-21)** supersedes `P3b.province.public-literature-registry.rows` — now `rows=42` (S001–S042 frozen round-25 population; count `SOURCES.md` ids ≤42, not future additions).
- **R26-E3b (2026-10-21)** supersedes `P3b.province.round25-correction.rows` — now `rows=42` (same dated population; `git show f11bffbf:corpus/SOURCES.md`).

Parser-format addendum: E3b's extra inline command is not a value token. The v3 exact-token restatement is:
- **R26-E7 (2026-10-21)** supersedes `P3b.province.round25-correction.rows` — now `rows=42`
- **R26-E8 (2026-10-21)** supersedes `P3b.province.public-literature-registry.rows` — now `rows=42`

Exact-ID-set addendum (2026-10-21): Amendment 1's census also verifies the complete S001–S042 identity set.
E7/E8's count-only restatements omit that new token; FxP3BInstruments caught the omission before entry admission.
- **R26-E9 (2026-10-21)** supersedes `P3b.province.round25-correction.rows` — now `rows=42` `id_set=exact`
- **R26-E10 (2026-10-21)** supersedes `P3b.province.public-literature-registry.rows` — now `rows=42` `id_set=exact`

## Round28 partial frontier admission (2026-10-21)

**Core addition:** pinned WebArena task-spec/scorer observability, via
`plans/benchmark_spec_audit.py` and `corpus/knowledge/webarena-task-spec-audit.md`.
This owns static LLM-evaluation interpretation, not the benchmark's web properties or runtime services.
**Calibration addition:** `plans/registry_check.py`, a bounded frozen13-row/35-path literal-reference
diagnostic, not semantic source truth or a whole-current-tree assertion census.

The task-spec frontier is only partly advanced: named Terminal-Bench/Toolathlon/SWE-bench Pro specs,
generated configs, runtime task validity, hosted judges and contamination remain open. Serving-plane
restoration stays operator/kama-owned. Existing historical absent surfaces are not restored or re-scored.

## Round29 partial frontier admission (2026-10-21)

**Core addition:** an offline, source-faithful projection of the pinned WebArena generator
(`scripts/generate_test_data.py` at dce04686) over the 812 raw tasks × 3 synthetic `*.invalid` profiles,
via `plans/config_projection.py` and `corpus/knowledge/webarena-config-projection.md`. This owns static
interpretation of how generated eval configs are derived, not the benchmark's sites, env_config values or
any deployment. Actual env_config-derived/deployment configs, runtime task validity, hosted judges and
contamination remain open. The round28 gap line above stays as written; this paragraph narrows it.

## Round29 attempt-2 partial frontier admission (2026-10-25)

**Core addition:** the published task-validity instruments a benchmark maintainer runs on its own
tasks, read from primary documents at pinned revisions, via
`corpus/knowledge/benchmark-task-validity-checklist.md` (S077–S080, S090). This owns reading
published maintainer artefacts; it does not run a benchmark, certify a task, or own deployment
configuration, runtime task validity, hosted judges, contamination measurement or any benchmark's
web properties. The attempt-1 paragraph above stays as written; this paragraph narrows only the
"unopened leads" phrase for Terminal-Bench 2.0, SWE-bench Pro V2 and Toolathlon-Verified, which are
now opened.

**Operability addition:** `plans/sources_adopt.py` — a pre-append gate for registry adoption (id
collisions under the census's own 0–3-space anchor, staged-row schema, prose-`recheck`
normalization, `used-by` projection) with a ten-case selftest — and `plans/adoption_check.py`, the
one-command counter for an adoption round. Both are lane-local and compose with the fleet census,
which remains the registry's authority; neither replaces it.

## Round35 partial frontier admission (2026-10-25)

**Core addition:** static interpretation and offline synthetic-fixture execution of one pinned
Terminal-Bench 2.0 grader function — `protein-assembly/tests/test_outputs.py::test_gblock` at
terminal-bench-2 `2fd12b88` — via `corpus/knowledge/tb2-protein-assembly-grader.md` (S105–S107) and
`plans/tb2_grader_probe.py`. This records how the captured function responds to lane-authored inputs
only; it does not run Terminal-Bench or the task image, validate or certify the task or any real
submission, establish biological correctness or the literals' correctness, or measure model
performance. Runtime task validity, hosted judges, contamination and the other 88 TB2 tasks' scoring
code stay open. The round29 attempt-2 paragraph above stays as written; this paragraph narrows only
the Terminal-Bench 2.0 scoring-code clause for this one task.

## Round36 partial frontier admission (2026-10-25)

**Core addition:** offline execution of one more pinned Terminal-Bench 2.0 grader —
`regex-log/tests/test_outputs.py::test_regex_matches_dates` at terminal-bench-2 `2fd12b88` — over 24
frozen `/app/regex.txt` candidates, via `corpus/knowledge/tb2-regex-log-grader.md` (S108–S110),
`plans/regex_log_probe.py` and receipt `corpus/evidence/round36/regex-log-probe.txt` (`cases=24
observed_pass=8 observed_fail=16 mismatches=0`); the graded artefact is an agent-authored regex file,
run against the grader's fixed 25-line log. It records how that captured grader answers synthetic
patterns only: it does not run Terminal-Bench, the task image or a real submission, validate or
certify a task, establish which pattern the instruction demands, measure model or agent performance,
observe hidden or held-out tests, or speak for any other TB2 task. Adjacent: verification-fixture
craft (tameshi), research method (chousa), prompt craft (kotoba) and seat arrangement (kumitate) stay
theirs; pattern text is data. The round35 paragraph above stays as written; this paragraph narrows
only its "other 88 TB2 tasks" clause for this one task.
*Round-37 correction R37-P1 (appended 2026-10-26; supersedes three clauses of the round36 paragraph above):
the 24 candidates were lane-authored patterns, not agent outputs; the paragraph establishes no regex or
log-parsing correctness and no contamination measurement (the in-test log and its literal dates are the
grader's own fixture); and with three TB2 graders now read, its "other 88 TB2 tasks" reads `86 of TB2's 89
task graders` (`corpus/knowledge/benchmark-verifier-execution-model.md:93`).*

**Reported out:** nothing absorbed — `plans/pkg_gate.py` stays this lane's own gate (tameshi owns the reusable fixture/mutation method and never edits a sibling's gate, `tameshi-shokunin/PROVINCE.md:3,14-17,44-45`); capture and citation method stay chousa's (`chousa-shokunin/PROVINCE.md:5-7,10-11`); prompt/skill wording stays kotoba's (`kotoba-shokunin/PROVINCE.md:61`); seat arrangement, not evaluation, stays kumitate's (`kumitate-shokunin/PROVINCE.md:23,28`).

## Round37 partial frontier admission (2026-10-26)

**Core addition:** offline execution of one more pinned Terminal-Bench 2.0 grader —
`configure-git-webserver/tests/test_outputs.py` and its helper `tests/verify.sh` at terminal-bench-2
`2fd12b88` — over 22 frozen synthetic service states, via `corpus/knowledge/tb2-git-webserver-grader.md`
(S111–S113), `plans/git_webserver_probe.py` and receipt `corpus/evidence/round37/git-webserver-probe.txt`
(`cases=22 observed_pass=9 observed_fail=13 mismatches=0`). Each case runs the captured test function and
helper in a per-case bubblewrap sandbox: private network namespace, no root, scratch `HOME` and `/tmp`,
`/tests` read-only, `PATH` scoped to the named tools. The graded state is two HTTP responses from a
service the probe starts. It records how that captured grader answers those synthetic states only: it
does not run Terminal-Bench, the task image or a harness, or a real submission; it does not validate or
certify a task, measure difficulty or gameability, judge the assertion's correctness, measure
contamination, or speak for the remaining 86 TB2 task graders (89 carry `tests/test.sh`; 3 are read).
Any observation from a real-image run is a separate, routed observation and is not part of this
admission. Adjacent: web properties (kake), serving plane (kama), deployment configuration and runtime
task validity (refused). The round35/36 paragraphs above stay as written; this paragraph narrows only
their "other TB2 tasks" clause for this one task.

**Reported out (round 37):** mutation testing of a lane's own gate is a fleet-wide pattern, not kengaku ground —
tameshi's `tools/mutate-and-run.sh` and kumitate's `gate-mutants.mjs` are the precedents
(`.ufo/waves/round-37/build/R37ConnSibling.md` §S4); the round-37 harness is scoped to `plans/pkg_gate.py`.
The real-image run of the task (`.ufo/waves/round-37/build/R37DockerOracle.md`) is routed, not absorbed.

## Round38 partial frontier admission (2026-10-26)

**Core addition:** offline execution of one more pinned Terminal-Bench 2.0 grader —
`build-pmars/tests/test_outputs.py` at terminal-bench-2 `2fd12b88` — over 22 frozen synthetic build states,
via `corpus/knowledge/tb2-build-pmars-grader.md` (S115, S116), `plans/build_pmars_probe.py` and receipt
`corpus/evidence/round38/build-pmars-probe.txt` (`cases=22 observed_pass=7 observed_fail=15 mismatches=0`;
the first recorded run `e95cf55` and a second run are byte-equal). The graded state is a class new to this
lane: a built executable plus a source tree, scored by file presence, a string scan of `ldd` stdout,
directory shape and a regex over program stdout — nothing is rebuilt. Each case runs the captured module's
four test functions directly in a per-case bubblewrap sandbox: private network/pid/ipc namespaces,
case-owned `/app` and `/usr/local/bin` + `/usr/local/sbin`, `/tests/test_outputs.py` bound read-only, a fixed
`PATH`; the canned artefacts are compiled on the host with `gcc`. `tests/test.sh` is read, not run: its
`uvx`/pytest path and its `/logs/verifier/reward.txt` write are outside the probe. It records how that
captured grader answers those synthetic states only: it does not run Terminal-Bench, the task image or the
oracle (`solve.sh` is captured and not executed), does not validate or certify the task, measure difficulty,
gameability or contamination, judge whether the grader's `Results:` and debugger address patterns are the
right ones, or speak for the remaining 85 TB2 task graders (89 carry `tests/test.sh`; 4 are read). Host bash
stands in for the image's shell, and host glibc and host `ldd` for the image's. Disclosed ordering: a
control-time gate rerun had already executed the probe once before the freeze and its output was discarded
unread (`plans/round-38-claims.md` §Disclosure); the receipt is the first recorded run. Adjacent: build and
package craft (tameshi), capture and citation method (chousa), deployment configuration and runtime task
validity (refused). The round35/36/37 paragraphs above stay as written; this paragraph narrows only their
"remaining TB2 tasks" clause for this one task.

**Reported out (round 38) — sandboxed-probe prior art (round-37 closure D6; drafted by wave-1 seat R38SiblingCite, `.ufo/waves/round-38/build/R38SiblingCite.md`).**

Sandboxed execution of a graded or mutated child is fleet prior art, not kengaku ground. The
instruments, with pointers:

| Lane | Instrument | Pointer |
|---|---|---|
| **tameshi** | defect-probes — pristine selftest vs guard-removal mutant, children under a read-only bwrap envelope | `.ufo/evidence/round-18/defect-probes.py:4-5,192` (envelope); registry row `SKILL.md:1929` |
| **tameshi** | `env-diff.py` — nine-pin env differential, command run under bwrap, `EXEC_UNAVAILABLE` when bwrap is missing | `tools/env-diff.py:57-70`; registry `SKILL.md:1975` |
| **tameshi** | `mutate-and-run.sh` — fleet exit-graded mutation runner; **`env -i` isolation, not bwrap** | `tools/mutate-and-run.sh:1418,1423,1428` |
| **kumitate** | `cap-run.mjs` — the fleet's bounded runner: `systemd-run` scope + `env -i` + `bwrap --ro-bind / / --unshare-pid --die-with-parent --new-session --clearenv`, tmpfs `/tmp`/`/run`, cwd bound rw, caller `--bind` refuses `/`,`/tmp`,`/proc`,`/sys`,`/dev`,`/run` | `scripts/cap-run.mjs:30-38,189-196`; registry `SKILL.md:618` |
| **kumitate** | `cap-spawn.mjs` — `spawnSync`-shaped wrapper that builds the `cap-run` argv | `scripts/cap-spawn.mjs:2-3,26`; `SKILL.md:623` |
| **kumitate** | `bind-oracle.mjs` — proves requested binds from *inside* a `cap-run` child; selftest builds runner mutants from `cap-run.mjs` source | `scripts/bind-oracle.mjs:5,150-160`; `SKILL.md:622` |
| **kumitate** | `gate-mutants.mjs` — 43-mutant gate battery; per-mutant `prlimit` process group, **no bwrap** | `SKILL.md:616` |
| **mado** | `c1-r40-live-v2.py` — C1 counter; every tool and selftest run under `bwrap --unshare-all --cap-drop ALL`, fresh `/proc`//`dev`, tmpfs `/tmp`, `/usr` ro; no bwrap → `SETUP` exit 2, never a silent downgrade | `quality/counters/c1-r40-live-v2.py:19-23,479-484` |
| **mado** | `c1-r41-globals.py` — same sandbox arm, fresh `/proc`//`dev`, tmpfs `/tmp` | `quality/counters/c1-r41-globals.py:8-10,195-200` |
| **kake** | `sealed_count_v2.py` — sealed-key counter; the tool runs in bwrap with its own PID namespace, `/usr` ro, tmpfs `/tmp`, no `/home`, no network; refuses when bwrap is absent | `.ufo/waves/round-36/sealed_count_v2.py:158-163,192-193` |
| **kake** | `c42_count.py` — 31k-value differential under `/usr/bin/bwrap --unshare-all --die-with-parent --clearenv`, RLIMIT_FSIZE 256 MiB, 4 GiB AS, 600 s | `.ufo/waves/round-42/c42_count.py:35-40,63` |
| **kake** | `c57_idresolver_gate.py` — C2 counter; the tool under test runs under `bwrap --unshare-net --unshare-pid --die-with-parent --ro-bind / /` with only its scratch tree bound rw | `.ufo/waves/round-57/c57_idresolver_gate.py:120-121` |
| **mori** | `count-c2-a1.py` — C2 counter; `timeout 120 bwrap --ro-bind / / --tmpfs /home --tmpfs /fast`, `env -i`, twice | `.ufo/waves/round-31/count-c2-a1.py:75-77` |
| **kotodama** | isolation-replay protocol — Tier A bwrap mount-namespace replay of a filed runner in a disposable clone; Tier B no-bwrap fallback; invariants I1–I7 (never run a filed runner in the live tree, TMPDIR inside the sandbox) | `reports/round-39/calib/isolation-replay-protocol.md:33-45` |
| **kaidoku** | `carrier-guard.py` — executes *copies* of a binary to observe mode/content changes; records that bwrap exists but **is not used** (loader-mapped, copy+exec, memfd, same-owner chmod named as bypasses) | `SKILL.md:606` |
| **kaidoku** | native ELF ground — Ghidra/REA ELF analysis, `.node` shared objects, `nm -D`/`DT_NEEDED`-class linkage reading; **owner of binary-linkage interpretation** | `PROVINCE.md:4,48,57` |

**The split.**

- **kumitate** owns the *runner* — the bounded, env-cleared, PID-namespaced child and its
  verdict line. kengaku's per-case sandbox is a consumer pattern of the same class and cites it;
  kengaku does not re-specify caps, scopes or bind policy.
- **tameshi** owns the *method* — pristine-vs-mutant calibration, fail-closed arms, verdict-line
  discipline, and the rule that a sibling's gate is probed read-only and never edited
  (`tameshi-shokunin/PROVINCE.md:14-17`). kengaku's C1 attributed-kill battery is an application
  of that method to its own `plans/pkg_gate.py`, not a new method.
- **mado, kake, mori, kotodama** each hold a *sandboxed-counter implementation* on their own
  ground; they are cited as precedent for the pattern (tool-under-sandbox, no-silent-downgrade),
  never as authorities over kengaku's probe.
- **kaidoku** owns what a *binary actually links or loads* (ELF reading). kengaku's build-pmars
  finding stops at "the grader's `ldd` string scan answers a string question" — kengaku grades the
  grader's assertion, and any claim about real `DT_NEEDED`/`dlopen` linkage routes to kaidoku's
  ELF ground rather than being made here.
- **kengaku** keeps: which TB2 grader is captured, how it is called offline, what its verdict
  answers, and the C1/C2 counters over `plans/pkg_gate.py`. Verified that no sibling reads,
  scores or claims TB2 grader execution: `grep -rl 'terminal-bench\|terminal_bench' */` outside
  `kengaku-shokunin/` returns only `kumitate-shokunin/corpus/knowledge/multi-agent-coordinator-topologies.md`
  and `kumitate-shokunin/corpus/lessons/round-63.md` — both coordinator-topology data citations
  already ruled as such in round 37.
- **Not prior art, do not cite as sandboxes:** `mado-shokunin/SKILL.md:610` (`.ufo/waves/round-20/isolate.sh`
  "is not a sandbox — the environment and the compositor/session sockets stay reachable") and
  `kotodama-shokunin/SKILL.md:254` ("Determinism is not isolation"). Both are the lanes' own
  disclaimers and belong in any kengaku text that reaches for them.
- **No sibling owns ldd-in-a-gate.** `grep -rn -E '\bldd\b' */ --include=*.py --include=*.mjs
  --include=*.sh`, excluding `.ufo/waves/` and `corpus/`, returns nothing outside kengaku; mado's
  `ldd` hits are one-off host observations in evidence (`mado-shokunin/corpus/lessons/round-15.md:39`),
  not an acceptance check.

**Nothing absorbed.** No sibling instrument is copied into `plans/`; the lane's harness stays
scoped to `plans/pkg_gate.py` and the round's probe.

## Round39 partial frontier admission (2026-10-26)


**Core addition:** offline execution of one more pinned Terminal-Bench 2.0 grader —
`git-leak-recovery/tests/test_outputs.py` at terminal-bench-2 `2fd12b88` — over 25 frozen synthetic end states,
via `corpus/knowledge/tb2-git-leak-recovery-grader.md` (S117 `tests/test_outputs.py`, S118 `instruction.md`),
`plans/git_leak_probe.py` and receipt `corpus/evidence/round39/git-leak-probe.txt` (`cases=25 observed_pass=13
observed_fail=12 mismatches=0`; a second run is byte-equal). The graded state is a class new to this lane: a git
repository's object store and refs plus one flag file, scored by five assertions — a `strip()`ed literal equality
read of `/app/secret.txt`, two `git log --all` greps (commit messages with `--grep`, then added/removed content
with `-p -S`), a `git log --oneline --all` substring on the init message, a `git fsck --lost-found` sweep that
`cat-file -p`s every `dangling` line, and a work-tree `sha256sum` that skips dot paths
(`test_outputs.py:11-113`). Each case first runs the task's own `challenge-setup.sh` (the state the Dockerfile
builds at image time, `Dockerfile:12-15`), then a frozen recipe under `bash -euo pipefail`, in a per-case
bubblewrap sandbox: private network/pid/ipc namespaces, `/usr` and `/etc` read-only, private `/tmp`, a fresh
`/app`, `/cap` holding only the three executed captures, `GIT_CONFIG_NOSYSTEM=1` and
`GIT_CONFIG_GLOBAL=/dev/null`; it then imports the captured module and calls its five test functions in file
order (`plans/git_leak_probe.py:1-35`). Observed: the untouched initial repository fails only the flag test
(`untouched`, receipt:6); writing the literal alone passes 5/5 while the secret commit stays in the
reflog/object store (`echo-only`, receipt:8), and so do `echo-gc-only` and `echo-reflog-expire`
(receipt:10,9); a non-branch ref pinning the secret blob, an annotated tag message, a stash, a dot file in the
work tree and the secret in
`.git/config` all pass 5/5 (receipt:15,16,19,20,22); a dangling blob or an unreferenced commit whose message
carries the secret fails exactly test 4 (receipt:12,13); a rewritten tip message and a rebuilt one-commit
history pass (receipt:24,25). It records how that captured grader answers those synthetic states only: it does
not run Terminal-Bench or the task image (the image is never pulled; `tests/test.sh`'s `uvx`/pytest path and its
`/logs/verifier/reward.txt` write are read, not run), does not validate or certify the task, measure difficulty,
gameability or contamination, judge whether these five assertions are the right ones, or speak for the remaining
84 TB2 task graders (89 carry `tests/test.sh`; 5 are read). The task's own `solve.sh` is executed as one case
(`oracle-solve-sh`, receipt:7) and observed 5/5; host git 2.56.0 and host bash stand in for the image's Ubuntu
24.04 git and dash (the checksum runs `sh -c`), the setup runs unprivileged, and commit object ids differ per run
and are never printed. Disclosed ordering: before the freeze the probe ran only `--dry` and `--stage-check`
(`stagecheck cases=25 failed=0`, the grader never imported in stage mode); the receipt is the first recorded run.
Adjacent: sandboxed child execution stays fleet prior art (the round-38 prior-art block above — kumitate's
runner, tameshi's method); capture and citation method stay chousa's; prompt and skill wording stays kotoba's;
deployment configuration and runtime task validity are refused. What git actually stores, and how a given
history was rewritten, is read here only through this grader's assertions — no claim is made about git's storage
semantics or about any real repository or agent, and any such finding routes rather than being absorbed. The
round35/36/37/38 paragraphs above stay as written; this paragraph narrows only their "remaining TB2 tasks"
clause for this one task.

**Reported out (round 39):** nothing absorbed — `plans/pkg_gate.py` stays this lane's own gate, the C1 harness's
scope stays `plans/pkg_gate.py` and `plans/battery39/`, and the round-38 sandboxed-probe split (runner → kumitate,
method → tameshi) is cited, not renegotiated.
Secret-removal procedure is deferred: how to purge a secret from git history (and rotate it) belongs to
kagi's doctrine and souji's routing to kagi and the operator (`.ufo/waves/round-39/build/R39ConnSibling.md` §1);
this lane records only what one benchmark grader checks, never a removal procedure. Kasegi's
`corpus/knowledge/repo-git-state.md` is cited as the sibling precedent for git-history-state checks used by the
round's order gate (`R39ConnSibling.md` §5).

## Round40 partial frontier admission (2026-10-26)

**Core addition:** offline execution of one more pinned Terminal-Bench 2.0 grader —
`db-wal-recovery/tests/test_outputs.py` at terminal-bench-2 `2fd12b88` — over 28 frozen synthetic end states,
via `corpus/knowledge/tb2-db-wal-recovery-grader.md` (S119, S120), `plans/db_wal_probe.py` and receipt
`corpus/evidence/round40/db-wal-probe.txt` (`cases=28 observed_pass=8 observed_fail=20 mismatches=0`;
`regrade cases=28 differ=0`, a same-process second call of the seven functions, not re-run stability). The graded state is a class new to this lane: one JSON
export at `/app/recovered.json` whose source of truth is a binary database file pair — `main.db` plus an
XOR-encrypted write-ahead log — so the instruction's repair step ("Fix the WAL file so SQLite can read it",
`instruction.md:7`) is reachable only through that export, and the whole score is seven pytest functions over it
(`test_outputs.py:7-107`). Each case seeds `/app` as the task Dockerfile does (`Dockerfile:14-15`), runs a frozen
recipe under `bash -euo pipefail`, then imports the captured module and calls its seven test functions in file
order in a per-case bubblewrap sandbox: private network/pid/ipc namespaces, `/usr` and `/etc` read-only, private
`/tmp`, a fresh `/app`, `/cap` holding only the two executed captures, `HOME=/tmp`
(`plans/db_wal_probe.py:10-20`). Observed: the untouched initial state scores 0 of 7 (`untouched`, receipt:7) and
the task's own `solve.sh` 7 of 7 (`oracle-solve-sh`, receipt:8); hand-typed JSON that never opens the database
also scores 7 of 7 (`literals-never-open-db`, receipt:15), because the grader pins only 22 of the 33
id/name/value cells — the eleven ids, the values of ids 1-2 and the names of ids 3-11 (`test_outputs.py:53-80`) —
and reads neither `main.db` nor `main.db-wal`; a wrong-key XOR followed by a read-write extraction leaves the 5 base rows (confounded with the destructive read,
entry finding 6) and fails exactly the completeness and WAL tests (`xor-wrong-key`, receipt:11, `PPPPFPF`), the same 2-of-7 shape a plain read-write open
produces, after which the task's own oracle fails them too (`plain-read-then-solve`, receipt:10); a genuinely
repaired WAL with no export scores 0 of 7 (`decrypt-in-place-no-json`, receipt:14). It records how that captured
grader answers those synthetic states only: it does not run Terminal-Bench, the task image (`task.toml:29` names
`alexgshaw/db-wal-recovery:20251031`; the image is never pulled) or a harness (`tests/test.sh`'s `uvx`/pytest path
and its `/logs/verifier/reward.txt` write are read, not run, `test.sh:18-29`), does not validate or certify the
task, measure difficulty, gameability or contamination, judge whether these seven assertions are the right ones,
or speak for the remaining 83 TB2 task graders (89 carry `tests/test.sh`; 6 are read). Limits: host sqlite3 3.54.0,
python3 and xxd stand in for the image's Ubuntu 24.04 packages; recipes run unprivileged rather than as root; each
case stages its own `/app`, so no case observes the image's tree; the ground-truth table is computed from the two
captured files (XOR key 0x42), not from the grader; the destructive-read behaviour is published in the oracle's
own comment (`solve.sh:8`, "read-only to avoid WAL interaction") and in the benchmark's own repository (S121,
Terminal-Bench 2.1 PR #3, open), and the entry claims a probed instance of it, not
a discovery. Disclosed ordering: before the freeze the probe ran only `--dry` and `--stage-check`
(`stagecheck cases=28 failed=0`, `.ufo/waves/round-40/claims/c2-stage-check.txt`; the grader is never imported in
stage mode); the receipt is the first recorded run. Adjacent: sandboxed child execution stays fleet prior art (the
round-38 prior-art block above); capture and citation method stay chousa's; prompt and skill wording stays
kotoba's; how to repair or purge a SQLite database deployed in WAL mode belongs to the sibling lanes that own
storage operations, not to this one; deployment configuration and runtime task validity are refused. What SQLite
actually stores in a WAL, and what a given open mode does to it, is read here only through this grader's assertions
— any such finding routes rather than being absorbed. The round35/36/37/38/39 paragraphs above stay as written;
this paragraph narrows only their "remaining TB2 tasks" clause for this one task.

Round-40 C1 adjacency (`R40ConnSibling` §4-§5): the mutation test of the lane's own tripwire tools
(`plans/round40_c1_verify.py`, `plans/battery40/`) is kengaku's instrument for its own self-assessment, not the
mutation-testing method, which stays tameshi's (`tameshi-shokunin/PROVINCE.md:1-17`; its
`tools/mutate-and-run.sh` carries no kengaku leg). The counter's pid-namespace build children follow the fleet
sandbox precedents already inventoried above; kumitate's `cap-run.mjs` (`--ro-bind / /`) is the cited stronger
form a round-41 counter would need to close the writable-host-fs limit (`R40SentinelCounter` F1/F2). SQLite WAL
semantics as host behaviour stay kagi's and kaidoku's ground (`kagi-shokunin/corpus/knowledge/surface-census.md`,
`kaidoku-shokunin/tools/round-31/sqlite_oracle.py`); this lane cites them, it does not absorb them.

## Round41 partial frontier admission (2026-10-26)

**Core addition:** offline execution of one more pinned Terminal-Bench 2.0 grader —
`constraints-scheduling/tests/test_outputs.py` at terminal-bench-2 `2fd12b88` — over 25 frozen end states, via
`corpus/knowledge/tb2-constraints-scheduling-grader.md` (S122, S123), `plans/constraints_probe.py` and receipt
`corpus/evidence/round41/constraints-probe.txt` (`cases=25 observed_pass=6 observed_fail=19 mismatches=2`;
`regrade cases=25 differ=0`, a same-process second grading of each un-rebuilt end state, not a second run). The
graded state is a class new to this lane: an artefact at `/app/meeting_scheduled.ics` whose verdict is *computed*
by a scheduling model embedded in the test file — `_hard_ok` (`test_outputs.py:58-83`), `_overlap` (`:46-55`) and
a minute-granularity earliest-slot scan (`:158-167`) — over three sha256-pinned input calendars (digests in the
receipt header, `:2-4`); the ICS itself is read with regexes (`:40-43`), never with an ICS parser. Each case seeds
`/app` as the task Dockerfile does (`Dockerfile:14`), runs a frozen recipe under `bash -euo pipefail` (only the
oracle case has a non-empty recipe), then imports the captured module and calls its three test functions in file
order in a per-case bubblewrap sandbox: private network/pid/ipc namespaces, `/usr` and `/etc` read-only, private
`/tmp`, a fresh `/app`, `/cap` holding only the two executed captures, `HOME=/tmp`
(`plans/constraints_probe.py:10-21`). The grader is bound at `/cap/test_outputs.py`, so the
`Path(__file__).resolve().parent.parent / "inputs"` the integrity check looks for is absent and the sha256 branch
runs, as in the task image. Observed: the untouched/no-output state fails all three tests (`nop`, receipt:7) and
the task's own `solve.sh` passes 3 of 3 (`oracle-solve-sh`, receipt:8); a hand-typed Wednesday 11:00 file passes 3
of 3 without reading any calendar (`literal-correct-slot`, receipt:9), so the calendars are not load-bearing; a
first `VEVENT` decoy at Wednesday 11:00 with the attendee meeting at Friday 15:00 passes 3 of 3
(`decoy-first-vevent`, receipt:14), because tests 2 and 3 take the first `DTSTART:` of the whole file
(`:135`, `:151`) while only test 1 locates the meeting block (`:106-118`); the earliest test passes slots that are
themselves invalid when no valid slot precedes them (`bob-start-0900-wed` and `wed-1059-overlaps-alice`, both
`PFP`, receipt:13,23); rewriting all three input calendars with CRLF line ends passes 3 of 3
(`input-crlf-rewrite`, receipt:31) although `instruction.md:17-18` states "Any modification will cause the tests to
fail", because the integrity check compares decoded text (universal newlines, `:88-96`) and hashes that text on the
sha256 branch; `DTEND` is read only by the structure test, so a 90-minute meeting fails only test 1 (`FPP`,
receipt:15); and three RFC 5545-valid output forms fail — a folded `ATTENDEE` line (`FPP`, receipt:25), an explicit
`DTSTART;VALUE=DATE-TIME:` (`FFF`, receipt:26) and lowercase property names (`FPP`, receipt:30) — while a CRLF
output passes 3 of 3 (receipt:24). Two pilot prediction mismatches are carried verbatim and not corrected
(`later-valid-wed-1105`, receipt:10; `seconds-30`, receipt:18); 16 of the 25 cases are the round-40 planning seat's
pilot, disclosed at freeze (`plans/round-41-claims.md` §C2). It records how that captured grader answers those
synthetic states only: it does not run Terminal-Bench, the task image (`task.toml:30` names
`alexgshaw/constraints-scheduling:20251031`; `allow_internet = true` at `:35`; the image is never pulled) or a
harness (`tests/test.sh`'s `uvx -p 3.13`/pytest path and its `/logs/verifier/reward.txt` write are read, not run,
`test.sh:18-22,25-29`), does not validate or certify the task, measure difficulty, gameability or contamination,
judge whether these three assertions are the right ones, or speak for the remaining 82 TB2 task graders (89 carry
`tests/test.sh`; 7 are read). Limits: host python3 stands in for the image's `uvx -p 3.13` pytest, the image is
never pulled, recipes run unprivileged rather than as root, and each case stages its own `/app`, so no case observes
the image's tree; the ground-truth valid-slot table is hand-read from the three captured calendars, not from the
grader (`plans/constraints_probe.py:27-31`: the only valid starts are Wed 11:00 and Thu 11:00, earliest Wed 11:00).
Disclosed ordering: before the freeze the probe ran only `--dry` and `--stage-check` (`stagecheck cases=25 failed=0`,
`.ufo/waves/round-41/claims/c2-stage-check.txt`; the grader module is never imported in stage mode); the receipt is
the first recorded run. Adjacent: sandboxed child execution stays fleet prior art (the round-38 block above);
capture and citation method stay chousa's; prompt and skill wording stays kotoba's; the task's own `solve.sh` stays
the benchmark's, executed as one case and observed pass. The round35/36/37/38/39/40 paragraphs above stay as
written; this paragraph narrows only their "remaining TB2 tasks" clause for this one task.

Round-41 routing (`R41PkgProse` draft; L1 confirms). This lane owns what the captured grader checks and what passes
it — nothing else. **What a correct 1-hour slot is under these constraints, and RFC 5545 / iCalendar conformance,
are unowned.** Named check, 2026-10-26 15:41: `grep -rln "RFC 5545\|iCalendar\|calendar scheduling\|ICS file"
--include=PROVINCE.md --include=SKILL.md --include=*.md /home/vgpnk/Projects/shokunin` returns no lane but this one,
and the only sibling hits for `cron|scheduling|calendar` in a PROVINCE are `kaidoku-shokunin/PROVINCE.md:259` (a
"shared calendar date" used to date supersessions) and `lore-shokunin/PROVINCE.md:28`, which routes invented
calendar/era design to kotodama (`kotodama-shokunin/corpus/knowledge/culture-material/calendar-festival-systems.md`)
and recorded dates to lore — fictional calendars, not meeting scheduling or ICS conformance. So any finding of that
kind routes to the orchestrator rather than being absorbed here, and no sibling is credited with owning it.
Terminal-Bench's own task, image and oracle stay the benchmark's; the destructive-integrity finding above is about
this lane's captured grader only.

Round-41 wave-2 correction (appended; `F41CritOverclaim` O1/O2): in the paragraph above, "three RFC 5545-valid output
forms fail" should read "three RFC 5545 output forms fail" — the receipt's witnesses are LF files (CRLF-conformant variants
fail alike, `R41CritProbe` §5) — and "lowercase property names" should read "a lowercase `SUMMARY` property name": the
`ATTENDEE` match is case-insensitive.


## Round42 partial frontier admission (2026-10-26)

**Core addition:** offline execution of one more pinned Terminal-Bench 2.0 grader — `circuit-fibsqrt/tests/test_outputs.py` with `tests/sim.c` at terminal-bench-2 `2fd12b88` — over 16 frozen end states, via `corpus/knowledge/tb2-circuit-fibsqrt-grader.md` (S125, S126, S127; S128 prior art), `plans/fibsqrt_probe.py` and receipt `corpus/evidence/round42/fibsqrt-probe.txt` (`cases=16 observed_pass=7 observed_fail=9 mismatches=0`; `regrade cases=16 differ=0`).

The graded state is a class new to this lane: not an assertion over a fixed file, and not a model computed inside
the test, but a **data artefact executed by a simulator the grader owns** — `/app/gates.txt`, a gate list in the
instruction's `outX = …` format, which the grader compiles from `/tests/sim.c` at grading time (`gcc -O3 /tests/sim.c
-o sim` in the cwd, `test_outputs.py:65-67`) and runs as `/app/sim N` on 28 fixed inputs (largest 48401 = 220²+1,
`:73-102`), comparing stdout with `fib(isqrt(N)) % 2**32`. The whole score is three pytest functions: existence, a
line count below 32000 and those 28 outputs. The interpreter is the surface: `sim.c` opens `gates.txt` relative to
its cwd, skips lines whose first scan fails, keeps a scanned line whose operator matches no form as a constant-0 gate
(wave-1 `R42CritProbe` D1), sets signals 0-31 from `argv[1]` (`instruction.md:8` says stdin), runs exactly 32000
steps and prints the 32 highest-indexed signals (`instruction.md:9` says "the last 32 lines"). Observed: a 1195-line
lookup table covering exactly the 28 graded inputs passes 3 of 3 (`lookup-28`) although it prints 0 for the
instruction's own examples 208 and 20000; blank padding to 31999 lines passes and 32000 fails only the size test;
comment lines, reversed line order and CRLF pass; one trailing space per line fails; a planted executable `/app/sim`
is overwritten by the grader's compile (the verifier's cwd is the image `WorkingDir=/app`, `R42ScoutHarborCwd`); a
directory named `gates.txt` passes existence only. It records how that captured grader answers those synthetic states
only: it does not run Terminal-Bench, the task image (never pulled) or a harness, does not validate or certify the
task, measure difficulty, gameability or contamination, or speak for the remaining 81 TB2 task graders (8 of 89 read).
Limits: host python3 and host gcc stand in for the image's; recipes run unprivileged. Disclosed ordering: before the
freeze the probe ran only `--dry` and `--stage-check`; three cases re-observe shapes `R41PlanNext` graded before the
freeze, the other 13 were never graded before it.

Round-42 routing (from the `R42PkgProse` draft, confirmed by the L1). This lane owns what the captured grader checks
and what passes it — nothing else. **Whether a gate list is a correct digital-logic implementation of
`fib(isqrt(N))`, and the C simulator's own semantics beyond what decides this grader's verdict, are unowned**: a
fleet-wide grep of every lane's PROVINCE.md/SKILL.md for digital logic, logic gate, gate-level, circuit, C simulator
or compiler semantics (2026-10-26 17:23, the seat's command) returned one unrelated sibling hit (`mado-shokunin/SKILL.md:1656`,
"short-circuit"), so such findings route to the orchestrator, not to a sibling. Terminal-Bench's task, image and
oracle stay the benchmark's; the round35-41 paragraphs above stay as written, and this paragraph narrows only their
"remaining TB2 tasks" clause for this one task.

## Round43 partial frontier admission (2026-10-26)

**Core addition:** offline execution of one more pinned Terminal-Bench 2.0 grader — `feal-differential-cryptanalysis/tests/test_outputs.py` with `tests/feal_module.c`, `tests/feal.c` and `tests/test.sh` at terminal-bench-2 `2fd12b88` — over 12 frozen end states, via `corpus/knowledge/tb2-feal-differential-cryptanalysis-grader.md` (S129, S130, S131, S132, S133, S134), `plans/feal_probe.py` and receipt `corpus/evidence/round43/feal-probe.txt` (`cases=12 observed_pass=8 observed_fail=4 mismatches=0`; `regrade cases=12 differ=0`).

The graded state is a class new to this lane: not a fixed artefact read by an assertion, not a model computed inside
the test, and not a program in a data format executed by a grader-compiled interpreter, but an **agent-authored
Python module the grader imports into its own interpreter and calls**. One test function does everything
(`test_outputs.py:7-30`): it builds the task's C extension in `/tests` through a shell (`python setup.py
build_ext --inplace`, `:20`, output printed and never asserted), appends `/app` and then `/tests` to `sys.path`
(`:22-23`), imports the agent's `attack` and then the reference `feal_in_c` (`:24-25`), seeds the C keys
(`:27 create_random_keys()`), hands the C `encrypt` to the module (`:29 stolen = attack.attack(feal_in_c.encrypt)`)
and compares the answer with `feal_in_c.get_keys()[5]` (`:30`). `tests/test.sh:17-25` runs that one test under
`uvx -p 3.13` with pytest 8.4.1 and writes `/logs/verifier/reward.txt` from pytest's exit status, so an exit before
the assertion is a pass. The extension exports `get_keys()` as a six-element list of the live `uint32_t key[6]`
(`feal_module.c:25-43`, `:51`), `create_random_keys()` seeds libc once per process (`srand(time(NULL))`, a static
`seeded` flag) and derives each key as `(rand() & 0xFFFF) * 1234567` (`feal.c:56-67`) — a 16-bit seed per round key,
which `instruction.md:4-6` states as a hint and which is also a clock read an attack can replay through libc.

Observed on the 12 frozen cases: eight pass and four fail, with no prediction mismatch (`cases=12
observed_pass=8 observed_fail=4 mismatches=0`, receipt:23) and a second grading of each end state by a fresh harness process
agreeing case by case (`regrade cases=12 differ=0`, receipt:22). The four failures are the shapes that return nothing
or the wrong value: no `/app/attack.py` at all (`nop`, a `ModuleNotFoundError` at `test_outputs.py:24`, receipt:10),
`attack()` returning 0 (`wrong-key`, receipt:12), the reference attack's result plus one (`oracle-off-by-one`,
receipt:13) and that result returned as a decimal string (`return-str`, receipt:14). The eight passes split into the
task's own oracle (`oracle-solve-sh`, the `solve.sh` differential attack, receipt:11) and **six passes that involve no
cryptanalysis**: returning `feal_in_c.get_keys()[5]` (`cheat-import-get_keys`, receipt:15), returning an object whose
`__eq__` is always True (`cheat-always-equal`, receipt:16 — `int.__eq__` returns `NotImplemented` for a non-int and
the reflected comparison decides the assert), installing a fake `feal_in_c` in `sys.modules` at import time
(`cheat-sysmodules-shadow`, receipt:17), rebinding `feal_in_c.get_keys` before the assert reads it
(`cheat-patch-get_keys`, receipt:18), `os._exit(0)` inside `attack()` before the assertion ever runs
(`cheat-exit-zero`, `exit=no-verdict-line`, receipt:19), and replaying the C key schedule from the current time
through libc and checking candidates against the passed `encrypt` (`cheat-clock-seed`, `host=libc-rand`,
receipt:20) — plus a ninth pass that is the reference attack followed by a 45 s sleep (`slow-oracle-45s`, receipt:21).
Nothing measures that sleep: `instruction.md:3` asks for under 30 s and `README.md:35` says the test "Confirms the
attack completes within the time limit", but `test_outputs.py:29` does not time the call and the only time bound in
the capture is `task.toml:22`'s 1800 s verifier timeout. It records how that captured grader answers those synthetic
states only: it does not run Terminal-Bench, the task image (`task.toml:29` names
`alexgshaw/feal-differential-cryptanalysis:20251031`; `allow_internet = true` at `:34`; the image is never pulled) or a
harness (`tests/test.sh`'s `uvx -p 3.13`/pytest path and its `/logs/verifier/reward.txt` write are read, not run),
does not validate or certify the task, measure difficulty, gameability or contamination, and does not speak for the
remaining 80 TB2 task graders (89 carry `tests/test.sh`; 9 are read). Limits: host python3 3.14, host gcc and host
setuptools stand in for the image's python 3.13 under `uvx`, Debian gcc and setuptools 80.9.0; pytest is not run — the
harness maps the one test function onto pytest's exit status, so a pytest-parity check is an open item; recipes run
unprivileged rather than as root; each case stages its own `/app` and `/tests`, so no case observes the image's tree;
the cases are constructed modules, not agents. Disclosed ordering: before the freeze the probe ran only `--dry` and
`--stage-check` (`stagecheck cases=12 failed=0`, `.ufo/waves/round-43/claims/c2-stage-check.txt`), and round-42 wave-1
seat `R42PlanNext` had graded seven shapes on this host with an unfrozen in-process harness
(`.ufo/waves/round-42/build/R42PlanNext/feal/feal_run1.txt`); six of these twelve cases re-observe those shapes (`nop`,
`oracle-solve-sh`, `wrong-key`, `cheat-import-get_keys`, `cheat-clock-seed`, `slow-oracle-45s`) and
`oracle-off-by-one`, `return-str`, `cheat-always-equal`, `cheat-sysmodules-shadow`, `cheat-patch-get_keys` and
`cheat-exit-zero` were never graded before the freeze (`plans/round-43-claims.md` §C2).

Round-43 routing (drafted by `R43PkgProse`, confirmed by the L1 against `R43ConnSibling`). This lane owns what the captured grader checks and what
passes it — nothing else. **Two findings are unowned: whether a differential attack on this FEAL-like variant is
correct or strong enough to recover `key[5]` inside 30 seconds (cryptanalysis technique), and Python import-system
semantics as a subject — `sys.path` search order, `sys.modules` substitution, the reflected-comparison fallback of
`int.__eq__`, extension-module shadowing — beyond the single verdict they decide here.** Named sweeps, 2026-10-26 from
`/home/vgpnk/Projects/shokunin`: `for pat in "cryptanalys" "cipher" "differential cryptanalysis" "sys.modules" "import
system" "importlib" "python semantics" "interpreter semantics"; do grep -ril "$pat" --include=PROVINCE.md
*/PROVINCE.md; done` returns **0 files for every pattern**, and `grep -rin "cryptanalys\|block cipher\|differential
cryptanalysis" --include=SKILL.md */SKILL.md` and `grep -rin "sys.modules\|import system\|import machinery"
--include=SKILL.md */SKILL.md` both return **no hits**; the only near-misses are `kotodama-shokunin/SKILL.md:24` ("a
cipher of English", a conlang sense), `kaidoku-shokunin/SKILL.md:893` (pcap encryption hiding layers) and
`chousa-shokunin/SKILL.md:116` (`importlib` leaving `__pycache__` beside a harness's candidate — a side note about its
own tool, not a domain declaration). So any finding of that kind routes to the orchestrator rather than being absorbed
here, and no sibling is credited with owning it. Advising an agent how to attack this cipher, and prior-art pricing of
differential cryptanalysis on FEAL, are likewise not this lane's: the task's own `solve.sh` is executed as one case
and observed pass, nothing more. Terminal-Bench's task, image and oracle stay the benchmark's; the round35-42
paragraphs above stay as written, and this paragraph narrows only their "remaining TB2 tasks" clause for this one task.

Erratum (round 43, L1 self-review): the round-43 paragraph's "plus a ninth pass that is the reference attack followed by a
45 s sleep" miscounts — `slow-oracle-45s` is the eighth pass (oracle 1 + six cheats + slow oracle = 8,
`corpus/evidence/round43/feal-probe.txt:23` `observed_pass=8`).

**Round 44 (2026-10-26).** `knowledge/tb2-feal-linear-cryptanalysis-grader.md` reads and executes a tenth Terminal-Bench 2.0 task's scoring code — `feal-linear-cryptanalysis/tests/test_outputs.py` @ `2fd12b88` with `tests/test.sh`, `instruction.md`, `environment/task-deps/gen.py`, `environment/task-deps/decrypt.c`, `environment/Dockerfile`, `README.md`, `solution/solve.sh` and `task.toml` (S138-S146) — over 14 frozen end states (`cases=14 observed_pass=8 observed_fail=6 mismatches=0`, `regrade cases=14 differ=0`). The graded artefact is an agent-written text file checked by 100 embedded decimal constants as substrings: one function, one bit of reward. Advising an agent how to attack this cipher, and prior-art pricing of linear cryptanalysis on FEAL, are not this lane's.

**Round 45 (2026-10-26).** `knowledge/tb2-password-recovery-grader.md` reads and executes an eleventh Terminal-Bench 2.0 task's scoring code — `password-recovery/tests/test_outputs.py` @ `2fd12b88` with `tests/test.sh`, `instruction.md`, `environment/setup.sh`, `environment/Dockerfile`, `README.md`, `solution/solve.sh` and `task.toml` (S149-S156) — over 16 frozen end states (`cases=16 observed_pass=5 observed_fail=11 mismatches=0`, `regrade cases=16 differ=0`), run under the `bwrap` envelope. The graded artefact is an agent-written guesses file: the second measured F1 constant-compare exemplar after feal-linear. The password itself, and how an agent should recover it, stay the task's and the authors' business — not this lane's.

**Round 46 (2026-10-27).** `knowledge/tb2-polyglot-c-py-grader.md` reads and executes a twelfth Terminal-Bench 2.0 task's scoring code — `polyglot-c-py/tests/test_outputs.py` @ `2fd12b88` with `tests/test.sh`, `instruction.md`, `environment/Dockerfile`, `README.md`, `solution/solve.sh`, `task.toml` and `.gitignore` (S166, S167, S168, S169, S170, S171, S172) — over 18 frozen end states (`cases=18 observed_pass=7 observed_fail=11 mismatches=0`, `regrade cases=18 differ=7`), each case run in its own `bwrap` sandbox. The graded artefact is one polyglot source file that must run as a Python script and compile as C, each printing the same literal at three fixed inputs, after an exact-directory listing the grader's own compile then invalidates: the first dual-runtime exemplar in this lane. Polyglot construction as a technique, and how an agent should build the file, stay the task's and the authors' business — not this lane's.

## Round55 partial frontier admission (2026-10-30)

**Core addition:** static interpretation and offline synthetic-fixture execution of one more pinned
Terminal-Bench 2.0 grader — `chess-best-move/tests/test_outputs.py` at terminal-bench-2 `2fd12b88`
(capture sha256 `a540714e…b8f286`, byte-identical to upstream at the pin; rows S201 grader and S202
instruction opened this round, with runner semantics citing held S109 — the chess `tests/test.sh` is
byte-identical to the regex-log runner, so no third row is opened per Amendment A1) — over 12 frozen
synthetic `move.txt` artefacts, via `corpus/knowledge/tb2-chess-best-move-grader.md`,
`plans/round55_c3_chess_probe.py` and receipt `corpus/evidence/round55/chess-best-move-probe.txt`
(`cases=12 observed_pass=5 observed_fail=7 mismatches=0`, `PREDICATE R55-C3 pass`). The graded artefact is a class
distinct from round 45's line-split membership: an agent-written move-token file judged by
order-insensitive FULL-MULTISET equality over whitespace-split tokens, so partial answers fail, order
is free, duplicates break equality, and no case or unicode normalization exists — the instruction's own
example literal `h1h8` would fail. What it owns: reading and executing the captured scoring code against
its `instruction.md` with predictions written before the first run. What it refuses: the task image, the
harness (`tests/test.sh`'s runner path is read via the held S109 identity, not executed here), real
submissions, runtime task validity, contamination, model behaviour, and the remaining 76 unread TB2 task
graders. This narrows the "remaining TB2 tasks" clause of the round35–46 paragraphs for this one task
only: 13 of 89 read. The earlier paragraphs stay as written.

**Reported out (round 55):** none absorbed.

## Round56 completion: the thirteenth grader's maintainer oracle, and the host move (2026-10-31)

**Core completion.** The thirteenth read TB2 task grader — `chess-best-move` — gains its
maintainer oracle, closing the round-55 spot-check's defect 3: rows **S203** (the task's
machine-readable definition, `task.toml`, tier A spec) and **S204** (the maintainer reference
solution, `solution/solve.sh`, tier A code) were opened 2026-10-31 at the same pin `2fd12b88`
and mapped to the grader in `corpus/evidence/round56/chess-oracle.md`; the oracle enumerates
**every immediate mating move** and writes them all, so the entry
`corpus/knowledge/tb2-chess-best-move-grader.md` carries a dated round-56 addendum grounding
the expected-answer reading in a second primary source. Still 13 of 89 TB2 task graders read —
this round adds the oracle, not a fourteenth task. What it refuses is unchanged: the task
image, the harness, real submissions, runtime task validity, contamination, model behaviour,
and the remaining 76 unread TB2 task graders.

**Host correction (dated 2026-10-31).** The lane's measurement host moved again: the old Linux
host is gone and this lane now runs on a Windows host, with instrument executions inside its
WSL2 Ubuntu-24.04 (provisioned: bubblewrap 0.9.0, gcc, sqlite3, zip, strace,
python-is-python3, libx11-dev, biopython 1.85, git 2.56 via ppa — recorded in
`plans/round-56-claims.md` amendments). Surface truth on this host: `~/Projects/webzites/repos/llm-wiki`
stays absent (marked 2026-10-28); three more probed surfaces present on the round-51 host do
not resolve here — SF15 `~/.local/share/ds-flash-shim/shim.py` (missing file), SF16 (local
service, connection refused), SF20 `http://127.0.0.1:1234/health` (connection refused) — so
`plans/round51_surfaces.py` measures `RESOLVE observed_present=11 floor=13 verdict=violated`
on this host and the finding ledger rows that ride those surfaces are re-declared red with
measured fragments (`plans/round54-entrytruth.json` round-56 corrections). The SF14 row's
registry count is corrected in place above (171 → 195, dated). Reported out: none absorbed.

## Round 57: the fourteenth grader read and executed — the corpus's first performance gate (2026-11-01)

**Coverage ground.** The fourteenth read TB2 task grader — `largest-eigenval` — is read and
executed offline at the same pin `2fd12b88` (full sha in the SOURCES rows and the oracle
note — the r50 pointer audit resolves 40-hex tokens in this file against lane objects
only): rows **S205**
(the task's machine-readable definition, tier A spec), **S206** (the grader, tier A code),
**S207** (the maintainer reference solution, tier A code — the oracle: the same eigensolve
behind an `eigenpy` C++ binding), **S208** (the agent-facing instruction, tier A docs) opened
2026-11-01; capture bytes committed at `corpus/evidence/round57/tb2-eigenval/`
(push-protection-clean; the r52 GH013 lesson does not apply to these files); oracle note
`corpus/evidence/round57/eigen-oracle.md`. The graded property is new to the corpus: three
pytest legs whose decisive one is a **wall-clock median speedup assert** against
`np.linalg.eig` itself — a mathematically exact but slower answer fails, a maximally-wrong
answer wins the speed leg, and a correctness-identical answer's timing verdict flips between
runs. The lane's offline probe (`plans/round57_c2_eigen_probe.py`, frozen with
`plans/round-57-claims.md` at `c0e7e100`) executed the captured grader against 24 frozen
lane-written candidates: `cases=24 observed_pass=15 observed_fail=9 mismatches=0 setup=0`,
`PREDICATE R57-C2 pass` (receipt `corpus/evidence/round57/eigen-probe.txt`, sha256-pinned in
the oracle note). **14 of 89** TB2 task graders read — the frontier count moves 13 → 14.
What it refuses is unchanged: the task image, the harness, real submissions, runtime task
validity, contamination, model behaviour, and the remaining 75 unread TB2 task graders.

**Carried round-56 closure work (status-neutral, landed this round before the freeze):**
R56-V1's head-tip registry regression repaired (the landcheck's registry row + its
entry-truth ledger row landed, and the second laundering root cause the round-56 close
carried — the R56-F2 findings row's `source` field off the strict `<path>:<line>` shape —
corrected to `corpus/lessons/round-56.md:60`); both counters green at the round's tips
(receipts `.ufo/waves/round-57/`). R56-V2: the SF14 row's registry count re-counted and
dated (197; the round-56 cell's 195 was that round's before-count). R56-V3: the round-56
SCORECARD section carries the dated 14-flips + 2-refreshes + 1-argv-redeclaration
decomposition. R56-V4: this round's ledger/registry writers are byte-stable over existing
rows (text insertion, no JSON re-encoding). Reported out: none absorbed.

## Round 58: the fifteenth grader read and executed — the corpus's first tolerance-band gate; the R56-F1 gate repair; the r50 pin root-caused and re-pinned (2026-11-01)

**Coverage ground.** The fifteenth read TB2 task grader — `distribution-search` — is read and
executed offline at the same pin `2fd12b88` (full sha in the SOURCES rows and the oracle
note): rows **S209** (the task's machine-readable definition, tier A spec), **S210** (the
grader, tier A code), **S211** (the maintainer reference solution — the oracle: a
three-level count-scan Newton over integer atom counts, tier A code), **S212** (the
agent-facing instruction, tier A docs — the task is in the lane's home domain: LLM
confidence metrics via KL divergence) opened 2026-11-01; capture bytes committed at
`corpus/evidence/round58/tb2-distribution-search/`. The graded property is new to the
executed corpus: the decisive leg asserts **|KL(P||U) − 10.0| ≤ 1e-3 AND |KL(U||P) − 10.0|
≤ 1e-3** — a numeric tolerance band on two aggregated functionals, not an exact comparison;
the corpus's executed graders previously decided exact predicates only. The offline probe
(`plans/round58_c2_kl_probe.py`, frozen with `plans/round-58-claims.md` at d6bc6027 before
the first capture run) executed the captured grader against 12 lane-written candidates:
`cases=12 legs=48 mismatches=0 setup=0 predicted_u=0`, `PREDICATE R58-C3 pass` (receipt
`corpus/evidence/round58/kl-probe.txt`, sha256 `3c93e06a…53c1f`) — deterministic, zero U
marks, 48/48 predictions confirmed on the first run. Oracle note
`corpus/evidence/round58/kl-oracle.md`. **15 of 89** TB2 task graders read — the frontier
count moves 14 → 15. What it refuses is unchanged: the task image, the harness, real
submissions, runtime task validity, contamination, model behaviour, and the remaining 74
unread TB2 task graders.

**Gate repair (R56-F1, routed twice, discharged).** The r46 anchor checker's QUOTE_RE was
escape-blind: S201's byte-true escaped-quote anchor false-positived as a live `line` defect
(`live=1`, exit 1 at base). Repaired under the frozen claim `plans/round-58-claims.md` with
three escaped-quote falsifier fixtures (the false positive, the retained true positive, and
the miscounted-words class the old parse hid); the repair exposed real anchor defects —
S201's `(6 words)` cell miscounts its quote (5) and S140's anchor quoted an ELIDED text
that never was a substring — repaired by Q34 supersessions **S213–S217** (same sources and
captures, corrected anchors). The checker's anchor coverage is fully restored:
`ANCHORLINE rows=210 cited=64 captured=57 live=0`, exit 0; `round46_c2_verify` →
`PREDICATE C2 pass`, exit 0 (PINS + registry + ledger honestly refreshed, dated).

**The r50 population pin root-caused and re-pinned.** The round-50 cross-host population
pin froze git-plumbing store bytes: 125/126 fixtures drift deterministically under this
host's rebuild, the sole matcher (`n10-empty-repo`) is the one fixture whose build runs no
git plumbing beyond `git init`, and a full double-build discriminator shows 0 unstable
fixtures on this host — the re-pin is sound and landed (pin `f41db91b`, dated header, rows
byte-preserved): `PREDICATE R50-C1 pass`, exit 0. The carried `round50-c1` root cause is
CLOSED with measurements; findings R56-F1 (repaired), R58-F1 (the exposed words miscount)
and R58-F2 (the unescaped/elided anchor class) are closed with the supersessions.

What it refuses is unchanged: the task image, the harness, real submissions, runtime task
validity, contamination, model behaviour, and the surfaces refused in earlier rounds.

## Round 59: the sixteenth grader read and executed — the corpus's first cryptographic-credential + filesystem-metadata gate; the receipt self-consistency gate (2026-11-02)

**Coverage ground.** The sixteenth read TB2 task grader — `openssl-selfsigned-cert` — is read
and executed offline at the same pin `2fd12b88` (full sha in the SOURCES rows and the oracle
note): rows **S218** (the task's machine-readable definition, tier A spec), **S219** (the
grader, tier A code — byte-identical to the r52 population capture of the same path, two
independent fetches), **S220** (the maintainer reference solution — the oracle: genrsa 2048 →
chmod 600 → one req -x509 -days 365 → concatenated PEM → openssl-written verification.txt → a
load_cert_chain-backed check_cert.py, tier A code), **S221** (the agent-facing instruction,
tier A docs) opened 2026-11-02; capture bytes committed at
`corpus/evidence/round59/tb2-openssl-selfsigned-cert/` (no key material, certificate bytes or
generated artifacts committed anywhere — the r52 GH013 lesson; the probe's builder generates
inside the sandbox). The graded property is new to the executed corpus: six legs whose
decisive ones read the credential through the openssl CLI (`openssl rsa -text` size,
`openssl x509 -text/-dates` subject + exactly-365-day window), assert POSIX permission bits
(`st_mode & 0o777 <= 0o600`), and price a child-process contract on `python
/app/check_cert.py`. The offline probe (`plans/round59_c1_openssl_probe.py`, frozen with
`plans/round-59-claims.md` at 002cde8e before the first capture run) executed the captured
grader against 12 lane-built candidates: `cases=12 legs=72 mismatches=2 setup=0
predicted_u=0` — 70/72 legs confirmed; the 2 misses are the author's transcription (first two
legs swapped on perm-loose/key-1024; the freeze's own annotations name the true failing legs),
dated-corrected in `plans/round-59-claims.md`, `PREDICATE R59-C1 fail` honestly carried, mined
in `corpus/lessons/round-59.md`. **16 of 89** TB2 task graders read — the frontier count moves
15 → 16. What it refuses is unchanged: the task image, the harness, real submissions, runtime
task validity, contamination, model behaviour, and the remaining 73 unread TB2 task graders.

**Operability ground.** The receipt self-consistency gate (`plans/receipt_consistency_check.py`,
frozen and then amended once in the Q25 window before any receipt of record — the
unanchored-label tooth removed with both digests named) closes the round-58 closure's finding
(b) class mechanically: red-before `defects=2 errata=0` (both the r58 finding-(b) labels,
receipt `.ufo/waves/round-59/recon/c2-red-before.txt` — measured at `e0512854`, first landed at `85ef87e5` (round-60 precision fix, the r59 closure's routed defect 2)), the R1-form erratum
appended to the r58 receipt naming the wrong labels, the right values and the reason, green
after `defects=0 errata=2` (receipt `corpus/evidence/round59/receipt-consistency.txt` — measured at
`85ef87e5`, first landed at `22ffccc7` (round-60 precision fix)), `PREDICATE R59-C2 pass`.

Reported out: none absorbed. Carried L0 questions unchanged (`kengaku | round-25/33/51`
coverage cap; `kengaku | round-56` L2 surface + ledger host column — nothing assumed
answered).

## Round59 completion (2026-11-02): the sixteenth grader's corrected zero-U re-freeze completes its admission — still 16 of 89 read

The round-59 closure carried R59-C1 honestly red (two author-transcription misses in the
frozen 72-leg table; Q25 forbade re-freezing to the observation). Round 60 lands the
sanctioned completion as a NEW claim (`plans/round-60-claims.md`, freeze `9e37311f`): the
probe's predictions are no longer stored at all — `predict_legs()` derives every leg at run
time from the case definitions (each predicate grounded in the capture's own assertions,
anchors verified against the committed capture bytes), the generated table is embedded
verbatim in the freeze, `--check-frozen-table` proves the correction is EXACTLY the r59
transposition (10 rows byte-identical, 2 rows differing exactly at dir/key), and
`--check-receipt` records the output-side 12/12 agreement with the r59 receipt of record
(which stays byte-identical — the observed run is not re-scored). One clean scored run at
the freeze tip on a clean WSL clone: `cases=12 legs=72 mismatches=0 setup=0 predicted_u=0`,
`PREDICATE R59-C1 pass`, exit 0 (receipt `corpus/evidence/round60/openssl-probe-refreeze.txt`,
measured at `9e37311f`, first lands with the round-60 corrections landing). **16 of 89**
TB2 task graders read — unchanged from round 59; this paragraph completes the sixteenth's
admission, it opens no seventeenth ground. What it refuses is unchanged: the task image,
the harness, real submissions, runtime task validity, contamination, model behaviour, and
the remaining 73 unread TB2 task graders.

Also landed this round (status-neutral, from the r59 closure's four routed defects): the
in-lane citation precision fixes above; the counting-command reproduction gate
(`plans/correction_command_check.py`, the r59 routed defect 3 closed red→green — the
wrapped-phrase correction command in `plans/round-59-claims.md` now prices clean under its
dated erratum, S223 grounds the mechanism); the SCORECARD round-59 cell's SOURCES 210→214
stale-by-S222 touch-up; and the fleet-root round-58 report erratum append (still uncommitted
in the fleet working tree — this lane may not mutate the fleet root) mirrored byte-for-byte
to `.ufo/waves/round-60/r58-report-corrections-mirror.md` with the fleet-root landing routed
to the orchestrator in the round report.
## Round 61: the seventeenth grader read and executed — the corpus's first signal-propagated cancellation-semantics gate; the round-60 mirror byte-fidelity correction (2026-11-02)

**Coverage ground.** The seventeenth read TB2 task grader — `cancel-async-tasks` — is read
and executed at TB2 pin `2fd12b88` (S224, opened live and byte-compared to the round-52
population capture, sha256 `d6f510b5…60ee7`). Its decisive legs spawn the candidate as a
child process, deliver SIGINT mid-flight (capture :93/:126/:162) and price the cleanup
discipline in captured stdout (:102-103/:135-136/:171-172) — a signal-propagated
cancellation-semantics gate no executed grader touches (the only `send_signal` grader in
the 184-capture population). The probe (`plans/round61_c1_cancel_probe.py`, the r58/r59
sandbox pattern) ran 12 cases x 6 legs twice: the first scored run FAILED on four author
defects (receipt of record `.ufo/waves/round-61/recon/c1-first-run-FAIL.txt` — the
simulator never read the declared `handler` property, `premature_start` double-printed,
one freeze-table row was hand-transcribed wrong, and the model's asyncio else-branch
never checked `handler`); the corrected re-freeze (`plans/round-61-claims.md` Amendment 1,
instrument `92facdc7…fe7f87`) ran `cases=12 legs=72 mismatches=0 setup=0 predicted_u=0`,
`PREDICATE R61-C1 pass`, exit 0 (receipt `corpus/evidence/round61/cancel-async-probe.txt`).
The entry carries three class observations: the capture's own ThreadPoolExecutor warning is
only visible at above-max (an uncancelled pool passes the n=2 cancel legs), a SIG_IGN
candidate is indistinguishable from success while the work fits the communicate window,
and threads-vs-asyncio show different no-handler signatures (uncancelled completion vs
loop-death with zero cleanups). **17 of 89** TB2 task graders read — the frontier count
moves 16 -> 17.

**The round-60 mirror byte-fidelity correction (the round-60 closure's routed D1,
status-neutral, claimed as R61-C2).** The round-60 claim that
`.ufo/waves/round-60/r58-report-corrections-mirror.md` mirrored the fleet working-tree
append "byte-for-byte" was false at the byte level: measured against the authoritative
append (26 lines, 2141 bytes, sha256 `2a2f952c…af2a21`, still uncommitted in the fleet
working tree at measurement — the orchestrator owns the landing), the round-60 block
carried 9 cp1252-double-encoded characters (5 em-dash-class + 4 arrow-class — 27 mojibake
characters; S225's windows-1252 index pins the byte mapping) and one surplus trailing
blank line; cmp differs at byte 39, line 2. The correction lands the byte-true mirror
`.ufo/waves/round-61/r58-report-corrections-append-byte-true.md` (headerless — the file IS
the append, cmp exit 0 in the fidelity receipt, so byte verification needs no
marker-stripping step) and appends the dated ERRATUM to the round-60 mirror naming the
defect and downgrading it to the content-mirror of record (the byte-mirror of record is
the round-61 file). Receipt: `.ufo/waves/round-61/mirror-fidelity-receipt.txt`.

What it refuses stays refused: the task's reference `test.py` simulator is not in the
capture population (the r52 program captured `test_outputs.py` + `test.sh` per task), so
the probe's candidate surfaces are lane-authored reconstructions declared per case — the
grader's predicates, not the task's full semantics, are what the receipt executes. The L0
questions `kengaku | round-25/33/51` (coverage cap) and `kengaku | round-56` (L2 surface;
ledger host column) remain open — routed around, nothing assumed answered; the coverage
score is HELD at 7 by that standing cap.
## Round 62: the population's first grader-class census — every committed grader classified over a frozen 16-detector table; the round-61 closure's three findings land as dated corrections (2026-11-02)

**Coverage ground.** The planned round-62 precondition is landed: the survey pass over the
89-task population exists as a mechanized instrument and a receipt. `plans/round62_c1_class_survey.py`
(stdlib-only, deterministic, a built-in determinism leg) byte-verifies all 183 committed
captures against the pinned SHA256SUMS (184 rows; the one pinned-but-absent row is exactly the
push-protection-excluded capture), grounds the roster against the LIVE-opened pin tree (S226,
the git-trees API capture: 89 task dirs == the round-52 `all_tasks.lst` roster, priced
`roster==tree=True`), and classifies every committed `test_outputs.py` grader (93 files) over a
frozen 16-detector table: `PREDICATE R62-C1 pass`, exit 0, receipt of record
`corpus/evidence/round62/class-survey.txt` (measured at the amendment tip `968f6ae7` on a fresh
clean WSL-native-fs clone; determinism leg green). Census: file-artifact 76, subprocess-exec
45, stdout-inspection 29, crypto-credential 12, numeric-band 10, filesystem-metadata 10,
serialization-schema 10, timing-wall 9, network-service 8, shell-exec 6, candidate-import 6,
process-environment 3, git-plumbing 3, db-state 2, signal-delivery 1, container-image 0 —
unclassified 0. The sentinel holds mechanically: `signal-delivery count=1 member=cancel-async-tasks`
(the r59/r61 prose negatives are now a frozen invariant). `EXECUTED-COVERAGE executed=17
classified=17 classes-covered=12 classes-uncovered=network-service,process-environment,
db-state,container-image` — the eighteenth-grader gate's survey input: the only uncovered
classes with members are network-service (8 graders), process-environment (3) and db-state (2).
**Still 17 of 89 TB2 task graders read and executed** — the frontier count does not move this
round; the census is a new surface (the population's mechanism-class structure), not an
eighteenth read. The instrument's own pre-freeze catch is part of the record: take 1 of the
dry run priced the first detector table RED (the executed `feal-differential-cryptanalysis`
grader unclassified — its mechanism is grader-imports-candidate + an `os.popen` build step;
`candidate-import` and `shell-exec` were added before the freeze; both takes kept in
`.ufo/waves/round-62/recon/census-dryrun-worktree.txt`). The first SCORED run at the freeze tip
priced SETUP exit 2 (the five population bookkeeping files — the round-52 capture program's
`all_tasks.lst`/`executed17.lst`/`missing.lst`/`unexec.lst`/`unexec72.lst` — had sat untracked
for ten rounds; receipt `.ufo/waves/round-62/recon/scored-run-SETUP.txt` committed AS-IS;
amendment `968f6ae7` commits them byte-as-is; nothing re-scored). The L0 questions
`kengaku | round-25/33/51` (coverage cap) and `kengaku | round-56` (L2 surface; ledger host
column) remain open — routed around, nothing assumed answered; the coverage score is HELD at 7
by that standing cap.

The census of record, quoted verbatim from the receipt's first line:

```
CLASS-CENSUS roster=89 tree-dirs=89 sha256sums-rows=184 captures-committed=183 captures-unpinned=0 sha-mismatch=0 absent-pinned=1 graders-classified=93 unclassified=0 classes=16
```

**The round-61 closure's three findings land as dated corrections (status-neutral, claimed as
R62-C2).** R61-D1: the round-61 amendment prose and lesson undercounted the table-identity
receipt's diff — THREE differing lines (the separator row 8-vs-9 cells, sequential-sync,
no-max-enforcement; both data rows already wrong at the freeze; no scored run affected) — the
dated-correction section in `plans/round-61-claims.md` re-derives the corrected count from the
receipt's own hunk lines (priced green by the correction gate at the pre-freeze check, the
measurements tip and the close receipt), with a dated erratum appended to
`corpus/lessons/round-61.md` (rows byte-identical, R1). R61-D3: the EOL counts were idealized —
measured from the git objects (receipt `.ufo/waves/round-62/recon/carryin-facts.txt`): base
272 lines / 0 CR; freeze 274 lines / 274 CR; numstat +274/−272 = 546 changed lines (the
lesson's "546" matches the numstat total; its "273-line" idealized 272→274); repair pure LF,
net +2/−0; landed in the same two dated appends (the spot-check's "+274/−237 = 511" variant
could not be re-derived and is superseded by the measured numbers). R61-D2: the S225 gloss
swapped pointer and byte for the 0xE2 mapping — corrected by the superseding registry row S227
(teaches opens `supersedes S225 —`, per Q34; S225's own cells byte-identical), adopted through
the gate with a live re-open (sha256 `2c5fa192…60795` byte-identical to the S225 capture; the
re-open capture committed at
`corpus/evidence/round62/whatwg-windows1252-reopen/index-windows-1252.txt`); index :105 is
pointer 98 (cp1252 byte 0xE2 = 0x80 + 98 → U+00E2).

## Round64 partial frontier admission (2026-11-03)

**Core addition:** offline execution of one more pinned Terminal-Bench 2.0 grader — `kv-store-grpc/tests/test_outputs.py`
at `2fd12b88`, the second network-service-class grader — via `corpus/knowledge/tb2-kv-store-grpc-offline.md` (S230, S231),
`plans/round64_c1_kvstore_probe.py` and the receipt `corpus/evidence/round64/kvstore-probe.txt` (`PREDICATE R64-C1 pass`):
the grader's seven legs run in bwrap against a lane-built gRPC server (proto compiled by grpcio-tools in a probe venv) on
127.0.0.1:5328, over five frozen cases. It records how that captured grader answers those synthetic candidates only: it does
not run Terminal-Bench, the task image or a harness; it does not validate or certify the task, measure model or agent
behaviour, or speak for the other TB2 graders. `pypi-server` stays unexecuted-as-counted (R63-C1). The round-63 paragraph
above stays as written; this paragraph narrows only the network-service clause for this one task.

**Operability addition:** the depth gate prices receipt-pointer paths inside the lane root only (`plans/round63_gate_checks.py`,
R64-C2). **Freshness addition:** the 29 trio-red knowledge entries carry dated round-64 addenda whose re-verification commands
and observed results are priced by `plans/round64_trio_sweep.py` (R64-C3); the openings stay as written.

**Reported out:** `headless-terminal` (the other network-service member) is blocked on this host by absent `vim` and the
tmux-based terminal harness; that work stays kengaku ground if the binaries land. `nginx-request-logging` is no longer blocked:
round 69 replayed it under a lane-written nginx shim (R69-C1 MISS on leg coverage) and round 70's re-frozen table passed
(R70-C1, `LEG-COVERAGE seen_p=8 seen_f=8`). The gRPC-inside-sandbox pattern does not overlap kama's serving plane
(`.ufo/waves/round-64/w1/SiblingOverlap/sibling-overlap.md`).

## Round 76: the `## Surfaces` declaration becomes a gate (2026-11-04)

The table above is no longer re-checked by hand. `plans/round76_c1_surface_resolver.py` (round 76,
capability `province-surface-resolver-table-anchored`) parses every row, resolves the row's first declared `~/…`
path or localhost endpoint live, and requires the row's dated `ABSENT YYYY-MM-DD` marker to agree
with the live verdict — no marker on an absent row, no marker on a present one, and no present-tense
prose on an absent row. One line per row: `python3 plans/round76_c1_surface_resolver.py --lane .`
→ `SURFACES total=11 present=4 absent=7 prose=0`, `AGREE agree=11 disagree=0`,
`PREDICATE R76-C1 pass` (receipt `corpus/evidence/round76/c1-after.txt`).

Two rows were repaired from the gate's own output this round, as dated supersessions inside the row
(the table stays the historical record): row 2 (`~/archive/bench-arena`) dropped its present-tense
"relocated intact" claim, and row 4 (`:45669`) gained the dated `ABSENT 2026-11-04` marker its live
000 required. The gate's count is 11 surfaces; a row added to the table raises that count by design.

## Declared surfaces — canonical, machine-checked (round 77, 2026-11-04)

*This is the lane's authoritative surface inventory. Every row is resolved live by
`python3 plans/round77_c1_declared_surfaces.py --lane .`; the `Supersedes` cell names the older
declaration the row replaces, and any row of the three superseded tables below that no canonical
row carries is an `UNLISTED-SURFACE` defect. Kinds: `path` (`test -e`), `http` (loopback status),
`tcp` (connect), `hash` (recomputed sha256 pin), `count` (recomputed row count), `exec` (committed
run receipt), `cmd` (every path in the declared check), `remote` (no egress: dated marker only).
An absent row must carry `ABSENT YYYY-MM-DD`; a remote row `REMOTE YYYY-MM-DD`; no other row may.*

| Surface | Kind | Anchor | Verdict | Supersedes |
|---|---|---|---|---|
| Research notes (SSOT for eval craft) | path | `~/Projects/webzites/repos/llm-wiki` | absent **ABSENT 2026-11-04** — round-51 probe found it gone; no relocation under `~/Projects` or `~/archive` | Surfaces:Research notes (SSOT for eval craft); Historical row 174 |
| Research notes (former wikillm path) | path | `~/wikillm/llm-wiki` | absent **ABSENT 2026-11-04** — never existed on this host | Historical row 175 |
| Local benchmark battery | path | `~/archive/bench-arena` | absent **ABSENT 2026-11-04** — round-14 relocation itself gone; frozen digests remain in `corpus/` | Surfaces:Local benchmark battery; Historical row 176 |
| Local benchmark battery (former path) | path | `~/bench-arena` | absent **ABSENT 2026-11-04** — superseded by the archive path, itself absent | Historical row 177 |
| Served local model (:34113) | http | `http://127.0.0.1:34113` | absent **ABSENT 2026-11-04** — process-level pins from rounds 10-14 stay historical capture-time facts | Surfaces:Served local model; Historical row 178 |
| Served local model (:45669) | http | `http://127.0.0.1:45669` | absent **ABSENT 2026-11-04** — round-76 resolver answered 000 | Surfaces:Served local model (round 51 successor) |
| Served local router (:1234) | http | `http://127.0.0.1:1234` | present — llama.cpp router, `lfm3-server.service` | Surfaces:Served local model (round 51 successor) |
| Route telemetry | path | `~/Projects/bounties/ledger/telemetry.jsonl` | absent **ABSENT 2026-11-04** — whole `~/Projects/bounties` tree gone since round 11 | Surfaces:Route telemetry; Historical row 180 |
| Bounty-hunter tree | path | `~/Projects/the-bounty-hunter` | absent **ABSENT 2026-11-04** — tree gone | Historical row 181 |
| Client CLI telemetry | path | `~/.bailian/telemetry.jsonl` | absent **ABSENT 2026-11-04** — whole `~/.bailian` gone | Surfaces:Client CLI telemetry; Historical row 182 |
| Client CLI sync state | path | `~/.bailian/wiki-sync-state.json` | absent **ABSENT 2026-11-04** — whole `~/.bailian` gone | Surfaces:Client CLI telemetry; Historical row 183 |
| Model catalogs (local index) | path | `~/.bailian/skills/bailian-docs-llm-wiki/models/` | absent **ABSENT 2026-11-04** — whole `~/.bailian` gone | Surfaces:Model catalogs; Historical row 182 |
| Model catalogs (remote APIs) | remote | `https://huggingface.co/api/models` `https://openrouter.ai/api/v1/models` | remote **REMOTE 2026-11-04** — both answered 200 on 2026-11-04, but the gate keeps no egress: the dated marker is the declaration | Surfaces:Model catalogs; Historical row 185 |
| Own probe artifacts | path | `corpus/evidence/` | present — durable run bytes, analyses and fleet artifacts, indexed in `corpus/README.md` | Surfaces:Own probe artifacts; Core:Own probe artifacts |
| In-repo verdict gate | hash | `grader.py` | present sha256=90c87c88…ae941f — hermetic offline replay of four probe trees, 733 checks | Surfaces:In-repo gate; Core:In-repo verdict gate |
| Attribution instrument | hash | `plans/attrib_probe.py` | present sha256=489f938a…16e06b — floating probe code; frozen anchors live in the `-frozen.md` tables | Core:Attribution instrument + frozen tables |
| Attribution frozen tables | path | `plans/attrib-r21-frozen.md` | present — plus the r22 and r23 frozen tables beside it | Core:Attribution instrument + frozen tables |
| Corpus gate docs | path | `corpus/QUALITY.md` | present — admission bar plus the round-closure criteria | Core:Corpus gate docs |
| Public-literature registry | count | `corpus/SOURCES.md` | present rows=253 — contract-v1 census clean (245 superseded 2026-11-04 by round 79's S256/S257, round 80's S258 and round 81's S259-S261 appends; frozen count `grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|'` = 249 at `dce7c275`, 250 at `507d249b`, 253 after round 81, receipt `corpus/evidence/round81/census-rows.txt`) | Core:Public-literature registry |
| ds-flash-shim source (read-only) | hash | `~/.local/share/ds-flash-shim/shim.py` | present sha256=42d86d99…15a386 — identical to the disclosed pin in the attribution logs | Core:ds-flash-shim source (read-only) |
| Live probe endpoint | tcp | `127.0.0.1:8791` | present — ds-flash-shim listener, read-only shim | Core:Live probe endpoint |
| Public literature (cite anchor) | path | `corpus/knowledge/eval-prior-art-calibration.md` | present — the novelty-pricing anchor; the URLs it cites are not probed by the gate | Surfaces:Public literature; Core:Public literature |
| Open-model catalog digest | path | `corpus/knowledge/open-model-catalogs.md` | present — the round-33 re-probe record behind the remote rows | Historical row 185 |
| Interval re-verdict instrument | exec | `plans/attrib_calibration.py` | exec exit=0 receipt=corpus/evidence/round77/exec-attrib-calibration.txt — `--summary` and `--selftest` both exit 0 on the landed tree | Core:Interval re-verdict instrument (round 25) |
| State-assertion check | exec | `plans/state_check.py` | exec exit=0 receipt=corpus/evidence/round77/exec-state-check.txt — `--summary` and `--selftest` both exit 0 on the landed tree | Core:State-assertion check (round 25) |
| Serving-stack process pin (rounds 10-14) | cmd | `test -e /proc/1299/cmdline ~/.config/systemd/user/qwen-coder.service ~/.config/llama/qwen-coder-godspeed.jinja` | absent **ABSENT 2026-11-04** — pid 1299, the unit and the chat template are all gone with the serving plane | Historical row 179 |
| Ephemeral probe trees (rounds 4-7) | path | `/tmp/bench-r{4,5,6,7,7-l2-executor}` | absent **ABSENT 2026-11-04** — ephemeral by design; durable numbers are pasted in-entry | Historical row 184 |
| Corpus index | path | `corpus/README.md` | present — parity gate `plans/round75_c1_index_parity.py` | Surfaces:Corpus index; Core:Corpus index |

The three tables below are **superseded** by this inventory as of round 77: they are retained
verbatim as the historical record (append-only), and any row they declare that no canonical row
carries is a gate defect. `## Surfaces` keeps its own gate (`plans/round76_c1_surface_resolver.py`,
registered); the canonical inventory is the wider universe.


## Round 77 admission (2026-11-04): the declaration inventory becomes one machine-checked table

**Core addition:** `## Declared surfaces — canonical, machine-checked` (28 rows) is the lane's
authoritative surface inventory: every row is resolved live by `plans/round77_c1_declared_surfaces.py`
under one typed rule, its `Supersedes` cell names the older declaration it replaces, and any row of the
three superseded tables (`## Surfaces`, `### Core`, `### Historical`) that no canonical row carries is an
`UNLISTED-SURFACE` defect. The three older tables stay verbatim as history; their gates
(`plans/round76_c1_surface_resolver.py`, `plans/round51_surfaces.py`) keep their own universes and are
green at this tip. Capability: `canonical-declared-surface-inventory`.

**Evidence:** `corpus/evidence/round77/c1-after.txt` (`SURFACES total=28 … UNLISTED n=0 … agree=28
disagree=0`, `PREDICATE R77-C1 pass`), `c1-selftest.txt`, `c1-mutants.txt`, `c1-control-declared.txt`;
`corpus/lessons/round-77.md`; `corpus/QUALITY.md` Q56.

**Not this lane's scope (unchanged):** the serving plane, benchmark runtime services, and route
resolution stay with kama / the benchmark images / kumitate. The `remote` rows are declared, never
probed: the gate keeps no egress.

## Round 78 admission (2026-11-04): the three partially-executed grader classes become a member ledger

**Admitted.** The 12 distinct members of `network-service` (8), `process-environment` (3) and
`db-state` (2) are accounted once each in `plans/grader-selected-members.json`: seven `executed` rows
resolve a tracked receipt whose bytes carry the passing verdict (`kv-store-grpc` R64-C1,
`sqlite-with-gcov` R65-C1, `torch-tensor-parallelism` R66-C1, `torch-pipeline-parallelism` R67-C1,
`pypi-server` R68-C1, `nginx-request-logging` R70-C1, `hf-model-inference` R71-C1) and five
`unexecuted` rows name a typed reason whose frozen detector fires on that task's stored grader bytes
(`filter-js-from-html` browser-required, `git-multibranch` network-install-required,
`headless-terminal` candidate-library-required, `install-windows-3.11` vm-required,
`query-optimize` external-db-required). Gate `plans/round78_c1_class_member_ledger.py`; receipts
`corpus/evidence/round78/c1-before.txt` / `c1-after.txt`; lesson `corpus/lessons/round-78.md`.

**Also admitted (calibration).** Every verdict-bearing receipt under `corpus/evidence/round77|78/` is
now self-locating at its own stamp (gate `plans/round78_c2_stamp_location.py`; repair driver
`plans/round78_restamp.py`), closing the round-77 closure's D1/D2/D5 and correcting D3/D4.

**New sources.** S254 Git `git-status` documentation (untracked-file semantics); S255 the lane's own
round-62 class census receipt (`own-work`).

**Ceilings unchanged.** Coverage stays at its L0 cap (route telemetry and the `:34113`/`:45669`
serving planes remain declared-but-unresolvable). No new surface is declared by this round: the
ledger resolves members of classes the SKILL table already declared.

**Not this lane's scope (unchanged):** the serving plane, benchmark runtime services, and route
resolution stay with kama / the benchmark images / kumitate. No member's replay is claimed without a
receipt.

## Round 82 (2026-11-04) — the registry's unmeasured direction, and a sweep over the executed population

**Coverage surfaces touched (held at the L0 cap).** The lane's instrument index is now audited in the
direction no gate had priced: every `plans/**/*.py` that exists at `4e833e9f`'s successor
`a3a03ac3`, outside `plans/fixtures/`, and referenced as a literal path by `SCORECARD.md`, `LOG.md`
or `corpus/README.md` at that revision either carries a row in `SKILL.md`'s
`## Gate/probe registry` or is declared in `plans/round82-exclusions.json` with a reason the counter
verifies from the file's own bytes. Six such scripts existed; four are CLI instruments (rows landed)
and two are support modules (exclusions landed). Gate `plans/round82_c1_plans_registry.py`; base
receipt `missing=4 unclassified=2`, tip receipt `missing=0 unclassified=0 excluded=2 rows=143
entry_missing=0`.

**New capability (freshness instrument, no score move).** `plans/round82_c3_sweep.py` re-runs every
`executed` member's own replay instrument at one measured tip and classifies it against the receipt
that instrument once produced: 18 `reproduced`, 7 `diverged`, 1 `unrunnable` over the 26-member
population, from a clean clone at `c804dd41` (`corpus/evidence/round82/sweep.txt`). The seven
divergences are named per member, not smoothed; the projection is round 80's A2 rule, unchanged.

**New sources.** S262/S263 the pinned Terminal-Bench 2.0 per-task grading entries (`tests/test.sh`);
S264 a rejected locator (`pyproject.toml`, HTTP 404 at the pin); S265/S266 supersede rows correcting
the round-81 receipt anchors and quote counts, because Q34 forbids an in-place fix of a registry cell.

**Ceilings unchanged.** Route telemetry and the serving planes remain declared-but-unresolvable, so
coverage stays at its L0 cap. Nothing here re-declares a surface as resolving.

**Not this lane's scope (unchanged):** the serving plane, benchmark runtime services and route
resolution stay with kama / the benchmark images / kumitate.
