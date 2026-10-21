# tabi round 19 — L1 plan (canonical planner seat = L1 TabiR19)

LANE = `/home/vgpnk/Projects/shokunin/tabi-shokunin`; FLEET = `/home/vgpnk/Projects/shokunin`. Paths are
LANE-relative unless absolute. Baseline B = `66251bfc1aef393e4aec599e950a8deb867736bb` (clean; `jj-lane.sh
state` → local=remote=B, ahead=0, head=detached, tracked=0 untracked=0). Date 2026-10-21. Host: Chromium
154.0.8037.97 (`/usr/bin/chromium`), Node v24.21.0, Playwright 1.64.0 (global, fnm Node 24.21.0), jj 0.45.1.
Start census `sources-census.sh validate --root FLEET tabi` → `tabi ok`, exit 0, ten W04 duplicate-URL
warnings (S058 S065 S066 S068 S069 S070 S073 S074 S075 S076); `node scripts/check-sources.mjs` → rows 76,
A64/B4/C8, mined60/queued8/rejected8, findings 0. No `lane-dead-no-report tabi round=19` in the watchdog log
(only `launch tabi round=19 … attempt=1` at 2026-10-21T02:22:25-03:00): nothing inherited.

Scalars at B (SCORECARD round 18): depth 8, coverage 9, operability 8, freshness 8, calibration 9,
adjacency 8. Lowest non-retired tie: depth/operability/freshness/adjacency at 8. Depth has not been claimed
since user-round 5; round 18 planned it first. Window position 2 after the round-17 capability; no waiver.

## Claims (declared; causally separable; distinct axes)

- **C1 — depth 8 (lowest tie). Runtime-verified declarative-WebMCP input-validation decision rows: 0 → N
  (target ≥ 12).** Round 18 left `SKILL.md:1994-1997` "source-level evidence, not a new runtime validation
  probe". A row counts iff (a) it sits in the new `SKILL.md` table under the heading
  `### Declarative WebMCP input-validation decision table (round 19)`, (b) it names ≥1 case id whose entry in
  the committed receipt `corpus/evidence/round-19/validation/receipt.json` has `pass: true` with observed
  CDP status/error text, (c) it cites a `S###` row whose `opened` is 2026-10-21 and whose source is a
  Chromium 154.0.8037.97-tag file (or other primary source) with line anchor, and (d) the receipt's
  producer sha256 equals the blob of `scripts/webmcp-validation-round19.mjs` at REV and runtime identity is
  Chromium 154.0.8037.97 / Playwright 1.64.0 / Node 24.21.0. Counter:
  `node .ufo/waves/round-19/measure-c1.mjs REV` → `c1_validation_rows`. At B: heading absent → 0.
  This is the round's **sourced claim** (new rows S077+).
- **C2 — operability 8 (lowest tie). Round-18 hazard predicates made red-capable on the routed mutant
  shapes: 0 → 3.** Spot-check routed 3 (`corpus/lessons/round-18-verifier-spotcheck.md`, "Routed defects" 3).
  Gap G-H4: the download predicate must reject (i) a Playwright `<uuid>` artifact under
  `processTmpDir/playwright-artifacts-*` (any new file, not only the suggested filename) and (ii) a pasted
  download record (record bound to a fresh per-run nonce the counter itself generates or the browser
  observably produced). Gap G-H1: SIGINT and SIGHUP each → exit 2 `run_aborted`, no pass/fail receipt, no
  surviving run-owned Chromium pid (a pid set observed non-empty before the signal). Gap G-F6: the
  freshness witness refuses `@`, `master`, a 7–12-hex short hash, an off-branch full hash and `HEAD`, each
  with its declared refusal reason (not only exit code). A gap is closed iff every sub-shape is red under the
  round-18 counter/artifact (it credits the mutant or never tests the shape) and green under the round-19
  counter on the round-19 artifact, with the mutant rejected. New files only:
  `scripts/webmcp-invoke-round19.mjs` (successor; round-18 harness byte-frozen) and, only if G-F6 needs
  code, `scripts/freshness-witness-round19.mjs`. Counter: `node .ufo/waves/round-19/measure-c2.mjs REV` →
  `c2_gaps_closed`. At B → 0 (round-19 files absent).
- **C3 — calibration 9. Round-18 outside-check non-code routed defects closed with checkable records:
  0 → 4.** d1 LOG correction: a new LOG.md round-19 entry names `LOG.md:1059`, supersedes "QUALITY33–38"
  with "QUALITY 33–39 (seven)", and the counter re-derives 7 from `corpus/QUALITY.md` at REV
  (criteria numbered 33..39 citing `round-18.md`). d2 assertion-delta correction: a SCORECARD round-19
  correction line names `SCORECARD.md:830`, says "IDs and pass status retained", and lists the six case
  ids whose round-18 predicates replaced numeric CDP codes with message substrings; the counter re-derives
  the six from `git show B:scripts/webmcp-invoke-round17.mjs` vs `…round18.mjs`. d3 registry labels: every
  round-19 `swarm-registry.json` carries `wave` equal to its spec's `wave`, and
  `.ufo/waves/round-19/corrections/r18-registry-wave-null.md` names both round-18 null registries and the
  cause (dispatch output's embedded `registry` object carries no `wave`; the file written by `run` does).
  d4 writer isolation: `.ufo/waves/round-19/isolation/ledger.json` lists every wave-1 production writer
  with clone path, branch, base = B, commit and changed paths ⊆ its assigned paths, plus lane
  `git status --porcelain` snapshots before/after the wave equal (only seat report files under
  `.ufo/waves/round-19/`). Counter: `node .ufo/waves/round-19/measure-c3.mjs REV` → `c3_routed_closed`.

Separability: C1 reads only the validation harness/cases/fixtures/receipt, its SKILL table and S077+ rows;
C2 reads only the round-19 invoke successor, optional witness successor and its counter/mutants; C3 reads
LOG/SCORECARD correction lines, registries/correction note, isolation ledger and QUALITY. Removing any one
claim's inputs zeroes only that counter. No exploratory claim.

## Byte-frozen (NEVER modify)

`SHONEN.md`, `PROVINCE.md`, every `corpus/lessons/round-<N>.md` and spot-check existing at B, all
`corpus/knowledge/*.md` existing at B, every `scripts/*.mjs` existing at B (incl. `webmcp-invoke-round17/18.mjs`,
`freshness-witness.mjs`, `check-*.mjs`), all round ≤ 18 evidence and wave files. Append-only: `LOG.md
SCORECARD.md SKILL.md corpus/QUALITY.md corpus/README.md corpus/SOURCES.md` (SOURCES: only
status/recheck/used-by change in place, logged old→new). Only the L1 edits these shared files.

## Writer isolation (routed defect 2 — binding for every seat that produces a production file)

Production file = anything the L1 will land outside `.ufo/waves/round-19/<wave>/<SeatName>.md` (scripts,
cases, fixtures, evidence, counters, drafts that are files). Such a seat works ONLY in its own clone:

    base=66251bfc1aef393e4aec599e950a8deb867736bb
    clone=/fast/scratch/tabi-r19/<SeatName>
    git clone --no-hardlinks --quiet /home/vgpnk/Projects/shokunin/tabi-shokunin "$clone"
    git -C "$clone" switch --quiet -c r19/<SeatName> "$base"
    # write ONLY the assigned paths inside $clone; then
    git -C "$clone" add -- <assigned paths> && git -C "$clone" -c user.name=tabi-r19-<SeatName> \
      -c user.email=tabi@shokunin.local commit --quiet -m "r19 <SeatName>"
    git -C "$clone" rev-parse HEAD; git -C "$clone" diff --name-only "$base" HEAD

The report MUST end with an `## Isolation` block: clone path, branch, base, commit (40-hex), changed paths.
The L1 imports with `git -C <clone> show <commit>:<path>`. Never write production files in LANE; never run
jj or any git write in LANE (git HEAD there is jj-owned and detached; lane tip =
`git -C LANE rev-parse --verify refs/heads/master`). Report files are the only direct LANE writes.

## C1 — validation case contract (`tabi-webmcp-validation-cases-v1`)

Directory `corpus/evidence/round-19/validation/`: `cases/<family>.json`, `fixtures/<family>.html`,
`probes/<family>.json` (the family seat's own throwaway probe output: raw toolsAdded schema, invokeTool
reply, toolResponded params, form state). Case file:

    { "schema": "tabi-webmcp-validation-cases-v1", "family": "<slug>", "fixture": "<slug>.html",
      "author": "<SeatName>",
      "cases": [ { "id": "decl-<slug>-<nn>", "tool": "<toolname>", "input": <JSON sent as invokeTool input>,
        "expect": { "status": "<toolResponded.status or 'no-response'>", "errorTextIncludes": <string|null>,
                    "submitCount": <0|1>, "fields": { "<name>": <expected post-invoke value or null> } | null,
                    "schema": { "<dot.path in toolsAdded inputSchema>": <expected JSON value> } | null },
        "source": { "file": "<chromium path at tag 154.0.8037.97>", "lines": "<a-b>", "url": "<gitiles URL>" },
        "question": "<decision question>", "answer": "<one-line answer as observed>" } ] }

Fixture rules: loopback-only, no external URL, one `<form toolname=… tooldescription=… toolautosubmit>` per
tool, a submit listener that records `{agentInvoked,isTrusted, fields}` into `window.__obs.calls`, calls
`event.preventDefault()` then `event.respondWith(Promise.resolve({ok:true, fields:Object.fromEntries(new
FormData(event.target))}))` (pattern: `corpus/evidence/round-17/webmcp-invoke/fixtures/invoke-declarative.html`).
Expectations are what Chromium 154 actually did in the family seat's probe, never what the seat hoped.

Harness `scripts/webmcp-validation-round19.mjs` (one writer): reuse the round-18 harness's guarded launch
(pinned Playwright 1.64.0 + `/usr/bin/chromium`, WebMCP flags merged with Playwright defaults, pipe CDP via
`context.newCDPSession(page)`, no TCP DevTools port, host-resolver deny except 127.0.0.1, private TMPDIR/
HOME, `acceptDownloads:false`, signal abort exit 2, full cleanup); loopback static server over the fixtures
dir; per case: fresh context/page, `WebMCP.enable`, wait `toolsAdded` for the tool, record its inputSchema,
`WebMCP.invokeTool`, wait `toolResponded` ≤ 8 s, read `window.__obs` and the tool form's post-invoke element
states, compare with `expect`. CLI `--out <path outside LANE>` `[--cases DIR]`; receipt schema
`tabi-webmcp-validation-receipt-v1` with runtime identity, producer sha256, cases-file sha256 map, per case
`{id, family, input, expected, observed, pass}`. Exit 0 all pass, 1 any case failed, 2 could not evaluate.

## C2 — counter contract (behavioural; sandbox clones at B and REV)

Under test: newest `scripts/webmcp-invoke-round*.mjs` at the revision and the freshness witness (successor if
present, else `scripts/freshness-witness.mjs`). g-h4: a normal run's receipt has `invoke-download-refused`
passed AND the download record carries the counter-supplied nonce (`TABI_RUN_NONCE` env or `--nonce`) as
echoed by the page; the counter plants a uuid-named file under the run's `playwright-artifacts-*` dir via a
mutant probe and requires the harness's own scan to flag it; a pasted record (prior receipt with real browsers
replayed) is rejected because its nonce ≠ this run's. g-h1: SIGINT and SIGHUP separately, each after the
first case line, with the run-owned Chromium pid set observed non-empty before the signal → exit 2, no
pass/fail receipt, pid set empty after. g-f6: witness refusal for `HEAD`, `@`, `master`, short hash and an
off-branch full hash, each exit 2 with the reason token declared in its header (`symbolic_rev`, `short_rev`,
`off_branch`, …), observed in stderr/stdout. Mutants live in `.ufo/waves/round-19/c2-mutants/`.

## Ownership — one writer per path; drafts integrated by the L1

Seats write only their assigned clone paths plus their own report. The L1 integrates shared files from
scribe drafts.

## Wave-1 findings → contract revision (2026-10-21, before first measurement)

The 15 C1 families above remain the frozen eligible population (no family added); 27 distinct decisions
were extracted from their observed behaviour and declared in `validation/decisions.json` before counting.
C1 metric is now `c1_validation_decisions` (not `c1_validation_rows`): unique probe ids, in-family success
control, source-body hash/token/line binding, fixture and case digest binding, fresh harness reproduction.
This supersedes C1 (a)-(d)'s weaker row predicate (CriticC1Depth, ReviewC1Contract). The decisions were not
chosen before the probes; the family population was.

C2's claimed metric is `c2_h4_properties` (0→2), not `c2_gaps_closed`: artifact-root any-new-file detection
and per-run nonce/replay rejection. H1 and F6 are informational coverage at B and REV, not new runtime
operability credit (the baseline already passed). F6 checks the generic `witness_revision_refused` token
PLUS the shape-specific detail; no witness successor is needed.

C3 d2 now re-derives the 5 substring + 1 nonempty-message split; d3 includes null post-record agentIds and
all four r18 files (w1/w2 record.json and swarm-registry.json); d4 lane-status-after is RECONSTRUCTED
from mtimes, not a direct wave-return snapshot (L1 omission named in the lesson). Wave 2 will take an
actual `git status --porcelain=v1 -uall` snapshot before integration.
