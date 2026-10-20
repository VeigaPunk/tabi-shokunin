# tabi round 18 — L1 plan (canonical planner seat = L1 TabiR18)

LANE = `/home/vgpnk/Projects/shokunin/tabi-shokunin`; FLEET = `/home/vgpnk/Projects/shokunin`. Paths below are
LANE-relative unless absolute. Baseline B = `2bff864fdfee684ddbcd066cc8e735adaba2735c` (clean;
`jj-lane.sh state` → local=remote=B, ahead=0, head=detached). Date 2026-10-20. Host: Chromium
154.0.8037.97, Node v24.21.0, jj 0.45.1. Start census `sources-census.sh validate … tabi` → `tabi ok`, exit 0
(rows 57, A46/B4/C7, mined42/queued8/rejected7).

Scalars at B (SCORECARD round 17): depth 8, coverage 9, operability 8, freshness 8, calibration 9,
adjacency 8. Lowest non-retired tie: depth/operability/freshness/adjacency at 8. Round 18 = window
position 1 after the round-17 capability; no waiver.

## Claims (declared; causally separable; distinct axes)

- **C1 — freshness 8 (lowest tie). Source rows re-verified against their live source with a committed
  recheck receipt: 0 → N (target 51 = every row not superseded at B).** Superseded at B (not
  rechecked; their successors are): S004→S028, S039→S040, S047→S054, S049→S055, S050→S056,
  S053→S057. Receipt = `corpus/evidence/round-18/source-recheck/S###.json` + `S###.excerpt.txt`,
  produced ONLY by `node .ufo/waves/round-18/recheck-fetch.mjs` (schema `tabi-source-recheck-v1`; one
  normalizer). A drifted row gets a superseding SOURCES row (new, opened this round). Counter:
  `node .ufo/waves/round-18/measure-c1.mjs REV [--live]` → `c1_rows_rechecked`.
- **C2 — operability 8 (lowest tie). Harness/witness hazards closed in code, each red on the B
  artifact and green on REV by a counter-owned behavioural probe: 0 → 6.** Hazards (round-17
  `w2/SentinelHarnessAfter.md` H1–H4, S1; spot-check open item F6):
  H1 SIGTERM/SIGINT/SIGHUP → exit 2 `run_aborted`, never a `fail` receipt; H2 every exit path removes
  the run's temp tree incl. Chromium `org.chromium.Chromium.*` (browser `TMPDIR` inside the run dir);
  H3 no TCP DevTools port (`--remote-debugging-port` absent; CDP over Playwright's pipe via
  `context.newCDPSession(page)`); H4 downloads refused (`acceptDownloads:false`) and recorded, held by a
  new fixture case `invoke-download-refused`; S1 exactly one `--enable-features=` and at most one
  `--disable-features=` token in every launched browser's effective argv, union of intended features
  preserved; F6 `scripts/freshness-witness.mjs` resolves the lane tip (same anchor rule as QUALITY 29)
  and refuses `HEAD`/symbolic/non-40-hex revisions before invoking the byte-frozen
  `scripts/check-freshness.mjs --witness <40-hex>`. New files only: `scripts/webmcp-invoke-round18.mjs`
  (the round-17 harness stays byte-frozen as a round-17 counted input), `scripts/freshness-witness.mjs`.
  Sourced by new rows S059+ (Playwright launch/context/CDPSession docs, Node signal docs, Chromium
  switch source). Counter: `node .ufo/waves/round-18/measure-c2.mjs REV` → `c2_hazards_closed`.
- **C3 — calibration 9. Round-17 outside-check routed defects closed with committed, red-before
  receipts: 0 → 5.** D1 sibling-count correction (6, not 7) in `corpus/lessons/round-18.md`
  `## Corrections`; D2 full 20-gate harm-set receipt at the round-17 measured revision
  `93bfead1f5f25f584353df3152a60209bbd89a2e` (`corpus/evidence/round-18/routed/harm-at-93bfead.json`);
  D3 `check-adjacency.mjs --self-test` receipt (`corpus/evidence/round-18/routed/adjacency-selftest.json`,
  producer sha256 = blob at 93bfead); D4 SOURCES row S058 `supersedes S057 —` whose cells carry no
  "individual publisher" (listing re-opened this round); D5 seven reruns of the round-17 harness with
  full 64-hex digests and per-run receipts (`corpus/evidence/round-18/routed/harness-reruns/`). Counter:
  `node .ufo/waves/round-18/measure-c3.mjs REV` → `c3_routed_closed`.

Separability: C1 touches only `corpus/evidence/round-18/source-recheck/**` (+ superseding rows for
drift); C2 only the two new scripts + its sources/note; C3 only `routed/**`, S058, lesson
corrections. Each counter reads only its own inputs. No exploratory claim.

## Byte-frozen (NEVER modify)

`scripts/check-freshness.mjs`, `SHONEN.md`, `PROVINCE.md` (census), every `corpus/lessons/round-<N>.md`
existing at B, `.ufo/rounds/fleet-round-1-interactive-20261015/**`, `corpus/evidence/fleet-round-1-freshness/**`,
all `corpus/knowledge/*.md` existing at B (sha-pinned), `scripts/webmcp-invoke-round17.mjs`,
`scripts/webmcp-loopback-round16.mjs`, all round-≤17 evidence and wave files, every `scripts/check-*.mjs`.
Append-only: `LOG.md SCORECARD.md SKILL.md corpus/QUALITY.md corpus/README.md corpus/SOURCES.md`
(SOURCES: only status/recheck/used-by change in place, logged old→new).

## Lane VCS rules for seats

The lane is jj-colocated; git HEAD is jj-owned and detached. Seats NEVER run `jj` or any git write
(add/commit/stash/checkout/switch/reset/rebase/pull/push/update-ref/tag/branch) in LANE. Anything needing
git writes runs in a sandbox `git clone --no-hardlinks LANE /tmp/tabi-r18-<seat>-XXXX`, deleted after.
Lane tip = `git -C LANE rev-parse --verify refs/heads/master`, never bare HEAD.

## C1 receipt contract (counter rules)

A receipt counts iff: JSON parses with schema `tabi-source-recheck-v1`; `row` is a row id present in
`corpus/SOURCES.md` at REV and not in the superseded set above; `rowUrl` occurs verbatim in that row's
`source` cell at REV (S029: the repo path); `sha256` is 64-hex; `quoteWords` ≤ 25 and equals the word
count of `quote`; `normalize(quote)` occurs in `normalize(excerpt file)`; `excerptSha256` = sha256 of the
excerpt file bytes; `quoteFound` true; `fetchedAt` on 2026-10-20; `teachesVerdict` = `held`, or `drift`
AND a row at REV whose `teaches` starts `supersedes <row> —`; `httpStatus` 200 for HTTP sources;
`producerSha256` = sha256 of `.ufo/waves/round-18/recheck-fetch.mjs` at REV. One receipt per row.
`--live` re-fetches `url` with the same curl argv, decodes and checks the quote again (reports
`live_held` separately; does not change the count).

## C2 counter (behavioural; sandbox clone at REV and at B)

Artifact under test: newest `scripts/webmcp-invoke-round*.mjs` at the revision (B: round17, REV:
round18) and `scripts/freshness-witness.mjs` (absent at B → red). Probes, each with a fresh `TMPDIR`:
h1 SIGTERM at the first `case` stdout line (or 6 s) → exit 2 and no `verdict=fail`/`pass` receipt and no
surviving browser pid; h2 after that run and after a normal run TMPDIR is empty; h3 during a normal
run no browser argv carries `--remote-debugging-port` and no `DevToolsActivePort` file appears in the
run's profile dirs; h4 normal-run receipt has case `invoke-download-refused` passed and no downloaded
bytes anywhere under TMPDIR; s1 every launch's effective argv has exactly one `--enable-features=` and
≤1 `--disable-features=`; f6 wrapper refuses `--rev HEAD` (exit 2) and `--dry-run` prints the
`refs/heads/master` 40-hex while HEAD is detached on a poison commit in the sandbox.

## C3 counter

d1 lesson `corpus/lessons/round-18.md` at REV has a `## Corrections` line citing
`corpus/lessons/round-17.md:116` whose sibling number equals the counter's own distinct-`sibling` count
of `corpus/adjacency.tsv` at 93bfead (6); d2 harm receipt `revision` = 93bfead full hex, gate names =
the 20 in `.ufo/waves/round-17/harm-baseline.json`, every entry has exit + 64-hex stdout/stderr sha256;
gateScriptsSha256 independently matches each gate blob at 93bfead. The new orchestration runner's
producer path/digest matches its blob at REV, not at 93bfead (it did not exist then). d3 adjacency
self-test receipt exit 0, stdout has `cases=57`, producer
sha256 = `git show 93bfead:scripts/check-adjacency.mjs | sha256sum`; d4 S058 exists, teaches starts
`supersedes S057 —`, no S058 cell contains `individual publisher`; d5 ≥7 rerun receipts, each with
producer sha256 `de62820dd35e5cf7804b656ef3fe1678da8a15bdf4248c8b7fa737f878b052d7`, full 64-hex receipt
sha256 matching the committed receipt bytes, verdict recorded. All absent at B → 0.

## Ownership (wave 1) — one writer per path

Each seat writes ONLY the paths its item names plus its own report. Shared registries (SOURCES, LOG,
SCORECARD, SKILL, QUALITY, README, lesson) are integrated by the L1 from scribe drafts.
