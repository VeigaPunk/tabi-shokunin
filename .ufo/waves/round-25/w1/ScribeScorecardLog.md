# ScribeScorecardLog — round-25 W1 draft (SCORECARD / LOG / corpus README)

Seat `L1Tabi25.ScribeScorecardLog` (scribe, leaf). Report-only: no tracked file edited, no git write,
no build/lint/test run, no tool installed, no process launched. Every figure below carries the
command that produced it. Unmeasured values stay `<MEASURED>`; unknown commits/paths stay `<…>`.

## 0. State read

| Fact | Command → output |
|---|---|
| Lane HEAD at draft time | `git rev-parse HEAD` → `c8ef3084c6363f265b9d23285296ab3547654f57` (`round-25: freeze claims, controls, census-before, wave-1 spec`); baseline `9e13666` is its ancestor (`git merge-base --is-ancestor 9e1366… HEAD` → exit 0) |
| Tree at draft time | `git status --porcelain` → `?? .ufo/waves/round-25/assimilation/` (one untracked path — relevant to m3, §1 H2) |
| Round-25 evidence at baseline | `git ls-tree -r --name-only 9e13666759bcf30665abec84dec13adefc1fa86a -- corpus/evidence/round-25 \| wc -l` → `0` (matches C1/C2 `before: 0`) |
| New counters landed? | `git ls-tree -r --name-only HEAD -- scripts \| grep -E 'bfcache\|reopen' \| wc -l` → `0` (neither has landed yet → capability/registry drafts are conditional) |
| SOURCES rows | `grep -cE '^\| S[0-9]{3} ' corpus/SOURCES.md` → `105`; `grep -cE '^\| S106 ' corpus/SOURCES.md` → `0` (S106 not yet appended) |
| Knowledge notes | `ls corpus/knowledge/*.md \| wc -l` → `43` (= `git ls-tree --name-only HEAD corpus/knowledge/ \| grep -c '\.md$'` → `43`) |
| W1 seat count / mix | `node -e` over `.ufo/waves/round-25/w1-spec.json` `items` → 34 items; scout 9, executor 7, scribe 5, reviewer 4, critic 3, mutation-tester 2, connector 1, sentinel 1, simplifier 1, revenger 1 |
| Shape source | `SCORECARD.md:1208-1270` (round-24 claims, disposition, capability prose, waves/seats); `LOG.md:1749-1790` (round-24 entry); `corpus/README.md:578-585` (round-24 Frontier table); `SKILL.md:2455-2479` (canonical eight-column gate registry) |
| Census exit 0 at round start | **not observed by this seat**: `.ufo/waves/round-25/census-before.txt` (17 lines, `grep -c .`) records rows ending `tabi	ok	…/corpus/SOURCES.md` but no exit code; the exit-0 figure comes from the round Goal only |

## 1. Findings (gate hazards the drafts are shaped around)

- **H1 — m1 self-test tally (calibration counter).** `scripts/check-selfassessment.mjs:27-35,180-213`:
  any SCORECARD line in a `##` section that names a lane script and matches `/self-?test|case/` and
  carries `cases=N`, `N-case`, `N cases` or `` `--selftest` (N/N) `` is compared against that gate's
  OWN self-test output. Consequences for the round-25 text: (a) every tally must be the digits the
  new gate prints, filled after the gate lands — the drafts use `cases=<MEASURED>` (non-digit, so not
  parsed); (b) put the script path on the same line as its tally, else a two-script section makes
  the line `ambiguous script association` (could-not-evaluate); (c) never write a digit before the
  word "cases" for anything else (control counts, fixture counts) — the drafts spell control names,
  not counts. (d) The oracle needs the gate's self-test to print a tally (`/"?\bcases"?\s*[=:]\s*(\d+)/`
  or `N/N`, `:162`); a new counter whose `--selftest` prints neither is could-not-evaluate for every
  mention. Sibling shape: `SELFASSESSMENT_SELFTEST verdict=… cases=N passed=N` (`:566`).
- **H2 — m3 unlanded paths.** `:282-291`: once `## Round 25 — executed disposition` exists (exact
  heading, em dash), any non-empty `git status --porcelain --untracked-files=all` at measure time is a
  mismatch. At draft time the tree has one untracked path (`.ufo/waves/round-25/assimilation/`), so
  it must be committed or removed before the calibration gate runs. Round-24 routed observation
  (`corpus/lessons/round-24-verifier-spotcheck.md:81-83`): record the porcelain count inside the tip
  receipt itself.
- **H3 — gate-registry conformance.** `scripts/check-gate-registry.mjs:28-46,62`: the gate set is
  derived from `scripts/check-*.mjs` at the revision; each needs a latest eight-field row in
  `SKILL.md`. If `check-bfcache-receipt.mjs` and `check-source-reopen-receipt.mjs` land without
  rows, `nonconformant` goes 0 → 2 (`e1-missing-row` ×2) — a harm on the round-24 operability
  gate. [INFERENCE from the code comment and regex; not executed.] §2.3 drafts the two rows.
- **H4 — receipt revision wording.** Round-24 routed observation (`round-24-verifier-spotcheck.md:77-80`):
  the measurement rev pinned in receipts differed from the commit the report cited. The disposition
  draft states one `<TIP>` used both in the receipts and in the prose.
- **H5 — no capability row for the harness drafted.** The assignment names only the two gates. A
  journey probe performing a real history step is arguably a runtime capability (`AXES.md`
  §Capabilities; round-13 precedent `SCORECARD.md:570-576`); whether to add a row is an L1 call, left
  out here.

## 2. Drafts

### 2.1 SCORECARD.md — append after `:1270`

```markdown
## Round 25 — declared claims (frozen before data), bfcache restore receipt and on-release source re-open

Baseline `9e13666759bcf30665abec84dec13adefc1fa86a`; claims frozen in
`.ufo/waves/round-25/claims.json` before either counter or receipt existed. Axes at round start:
depth 8, coverage 9, operability 8, freshness 8, calibration 9, adjacency 8. Lowest non-retired
axis: tie at 8 among **depth**, operability, **freshness** and adjacency; C1 works depth, C2 works
freshness. Saturation 8 / window 3 retained; the stagnation nudge is inactive (capabilities entered
at rounds 22–24). No axis retired; no scalar promotion is claimed.

| Claim | Axis / type | Before → after | Counting command (field) |
|---|---|---|---|
| C1 | depth — frontier-entry runtime admission (observation) | 0 → restores ≥ 1 with valid=true (receipt `corpus/evidence/round-25/bfcache/receipt.json`) | `node scripts/check-bfcache-receipt.mjs --rev <REV> --json` (`restores`, `valid`) |
| C2 | freshness — on-release source re-verification (S013, S015, S016, S020, S023, S024) | 0 → reopened=6, unresolved=0 (receipt `corpus/evidence/round-25/freshness/reopened.json`) | `node scripts/check-source-reopen-receipt.mjs --rev <REV> --json` (`reopened`, `unresolved`) |

Before-values: `git ls-tree -r --name-only 9e136667 -- corpus/evidence/round-25` is empty, and
round-24 entry U1 records that no committed probe performs a history step at all. Kill rules
(frozen): a receipt absent at the measured revision is could-not-evaluate, never 0; a C1 restore
counts only if it traces to a `Page.frameNavigated` event in the run's committed raw event log after
an executed `Page.goBack` with matching before/after targets, and a run launched with
`--disable-back-forward-cache` is invalid; a C2 row whose fetch fails at measure time is
could-not-evaluate for that row, and more than one such row misses the target honestly. Skip-work
controls (scored in wave 1 before claim data): the forged receipt
`.ufo/waves/round-25/control/fake-receipt-bfcache.json` must fail C1 validity and a run with no
history step must read restores=0; the stale-bytes receipt
`.ufo/waves/round-25/control/skipwork-freshness.json` must fail C2.

## Round 25 — executed disposition

Measured <DATE> against tip `<TIP>` — the same 40-hex revision is pinned inside both tip receipts
and cited here. Raw receipts in `corpus/evidence/round-25/` (`<C1-BASELINE>`, `<C1-TIP>`,
`<C2-BASELINE>`, `<C2-TIP>`, `<MEASUREMENTS>`); the tip receipt records the porcelain count at the
measurement instant (`<MEASURED>`).

| Claim / axis | Before → after | Verdict / bounds |
|---|---|---|
| C1 depth | 0 → restores=<MEASURED>, valid=<MEASURED> | **<met/missed/could-not-evaluate>**: run browser `<BUILD>` on loopback, launch flags recorded without `--disable-back-forward-cache`; history step `Page.goBack` A → B → A; `Page.frameNavigated.type` values `<MEASURED>`; `Page.backForwardCacheNotUsed` events `<MEASURED>`. Controls: forged receipt → valid=<MEASURED>, exit <MEASURED>; no-history run → restores=<MEASURED>. Loopback fixture only: no real-site, default-profile or other-build claim. Scalar depth 8→8 |
| C2 freshness | 0 → reopened=<MEASURED>, unresolved=<MEASURED> (resolved <MEASURED>, supersessions <MEASURED>, could-not-evaluate <MEASURED>) | **<met/missed/could-not-evaluate>**: each resolved row carries this round's fetch digest and a located held quote or a superseding row committed this round (`<NEW ROW IDS or none>`). Control: stale-bytes receipt → exit <MEASURED>, finding `<MEASURED>`. Scalar freshness 8→8 |
| coverage, operability, calibration, adjacency | unchanged | no additional credit claimed; `node scripts/check-gate-registry.mjs --rev <TIP> --json` → nonconformant=<MEASURED>; `node scripts/check-selfassessment.mjs --rev <TIP> --json` → mismatches=<MEASURED>; prior-round bytes are append-only (<MEASURED: diff sweep command → output>) |

**Capability rows (appended; earlier tables are historical snapshots and are not edited).** Enter
only for gates that landed at `<TIP>`.

bfcache restore receipt counter — reads a revision's committed bfcache receipt and its raw CDP event
log and reports `{receipt_present, restores, valid}`; a restore counts only when backed by a raw
`Page.frameNavigated` event after an executed history step with matching targets, and a run whose
flags include `--disable-back-forward-cache` is invalid. Evidence: `scripts/check-bfcache-receipt.mjs`,
`--selftest` (cases=<MEASURED>), `<C1 MEASUREMENTS PATH>`. First-working round: 25.

Source re-open receipt counter — reads a revision's re-open receipt and reports
`{reopened, resolved, unresolved, supersessions}`; a resolved row needs this round's fetch digest
plus a located held quote or a superseding row committed in the same round; a failed fetch is
could-not-evaluate for that row. Evidence: `scripts/check-source-reopen-receipt.mjs`,
`--selftest` (cases=<MEASURED>), `<C2 MEASUREMENTS PATH>`. First-working round: 25.

**Routed round-24 observations, disposition.** Receipt-rev vs report-rev alignment: <closed/open —
`<TIP>` pinned in both>. Porcelain count inside the tip receipt: <closed/open — field `<NAME>`>.
Carried open items (`LOG.md:1664` twelve-figure outside the m1 window; four round-19 self-tests
rewrite tracked receipts; five wave-local gates outside the derived universe; adjacency table
`Kind` column): <unchanged / disposition>.

## Round 25 — waves and seats

W1 (v1 band 32–64) 34 seats: 9 scout, 7 executor, 5 scribe, 4 reviewer, 3 critic, 2
mutation-tester, 1 connector, 1 sentinel, 1 simplifier, 1 revenger. <MEASURED> reports landed;
dead seats <MEASURED> (<names>, replaced/not replaced). W2 <MEASURED> seats, dispatched after W1
returned; <MEASURED> reports landed. Round total <MEASURED> ≤ <ROUND CAP>. <Planner seat held by the
L1 / other — state as recorded in the round report.>
```

Shape notes: the claims heading appends the round's subject after the frozen prefix exactly as
round 24 did (`SCORECARD.md:1208`); the disposition heading is kept bare because m3 matches
`^##\s+Round\s+(\d+)\s+—\s+executed disposition` (H2). Each `cases=<MEASURED>` line names its own
script (H1b). The W1 role list is the spec, not the landed set — re-count against the registry
before filling.

### 2.2 Capability-table note

The lane's live capability record since round 22 is the prose block inside the executed-disposition
section (`SCORECARD.md:1238-1249`), not a pipe table; §2.1 follows that. Drop either paragraph if
its gate did not land.

### 2.3 SKILL.md — conditional registry rows (H3), append as a new block after `:2479`

Only if the gates land; the bracketed cells must be copied from the landed scripts, not from here.

```markdown
## Round 25 — gate registry additions (2026-10-25; append-only; never edit above)

| Name | Kind | Entry command | Verdict map | Self-test | Pinned-value path | Write scope | Owner |
|---|---|---|---|---|---|---|---|
| bfcache-receipt-counter | gate | `node scripts/check-bfcache-receipt.mjs --rev REV [--json]` | <from script: 0=clean; 1=failed; 2=could-not-evaluate; 3=self-test disagreement> | `node scripts/check-bfcache-receipt.mjs --selftest` (cases=<MEASURED>, passed=<MEASURED>) | `scripts/check-bfcache-receipt.mjs` CASES table; `corpus/evidence/round-25/bfcache/receipt.json` | <from script> | tabi L1 |
| source-reopen-counter | gate | `node scripts/check-source-reopen-receipt.mjs --rev REV [--json]` | <from script> | `node scripts/check-source-reopen-receipt.mjs --selftest` (cases=<MEASURED>, passed=<MEASURED>) | `scripts/check-source-reopen-receipt.mjs` CASES table; `corpus/evidence/round-25/freshness/reopened.json` | <from script> | tabi L1 |
```

### 2.4 LOG.md — append after `:1790`

```markdown
## Round 25 — 2026-10-25 (hyaku run 6) — bfcache restore receipt, on-release source re-open

**Claims (frozen before data, `.ufo/waves/round-25/claims.json`, baseline `9e13666`).** C1 depth:
a loopback journey probe steps A → B → A with CDP `Page.goBack`, without
`--disable-back-forward-cache`, records `Page.frameNavigated`, and commits
`corpus/evidence/round-25/bfcache/receipt.json`; `scripts/check-bfcache-receipt.mjs` counts backed
restores — 0 → restores ≥ 1 with valid=true. C2 freshness: S013, S015, S016, S020, S023 and S024 are
re-fetched this round and each held quote is located in today's bytes or superseded by a new row;
`scripts/check-source-reopen-receipt.mjs` reads `corpus/evidence/round-25/freshness/reopened.json`
— 0 → reopened=6, unresolved=0.

**Outcome.** C1 <met/missed/could-not-evaluate> (restores=<MEASURED>, valid=<MEASURED>). C2
<met/missed/could-not-evaluate> (reopened=<MEASURED>, unresolved=<MEASURED>). Scalars unchanged.

**Landed changes (each with its commit).**
- `c8ef308` — claims frozen, controls (`control/fake-receipt-bfcache.json`,
  `control/skipwork-freshness.json`), `census-before.txt`, wave-1 spec and dispatch.
- `<COMMIT>` — `scripts/check-bfcache-receipt.mjs`, the journey probe `<PATH>`, the fixture
  `<PATH>`, `corpus/evidence/round-25/bfcache/` (receipt + raw event log).
- `<COMMIT>` — `scripts/check-source-reopen-receipt.mjs`, `corpus/evidence/round-25/freshness/`
  (fetched bytes, digests, `reopened.json`), superseding SOURCES rows `<IDS or none>`.
- `<COMMIT>` — knowledge entry `<PATH>` citing S104/S105 (re-opened) and S106 (opened), SOURCES
  row S106, `corpus/lessons/round-25.md`, SKILL.md registry rows, SCORECARD/README appends.
- `<COMMIT>` — final measurement receipts at `<TIP>`.

**Frontier step.** Census before: recorded at round start (`.ufo/waves/round-25/census-before.txt`;
exit as recorded there); after: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi`
→ exit <MEASURED>. Mined mistake: `<one line, pointer corpus/lessons/round-25.md §…>`. Sourced
claim: C1's entry cites S106 opened this round. Assimilation:
`<adopted <theme> for webmcp-devtools-agent-surface-r25 — re-grounding/id-collision/quarantine verdicts at <path>> | Assimilation: none — <reason>`.
Rows appended only where an admitted entry cites them.

**Routed round-24 observations.** Receipt/report rev alignment <…>; porcelain count in the tip
receipt <…>; carried items <unchanged/…>.

**Falsifiable next-iterations.** (a) <…> (b) <…> (c) <…>
```

### 2.5 corpus/README.md — append after `:585`

```markdown
## Frontier — round 25 (2026-10-25)

Append-only; the round-24 table at `:578-585` keeps its bytes.

| Frontier item | Status | Pointer |
|---|---|---|
| Navigation-history evidence across a bfcache restore | <runtime-held for Chromium <BUILD> on a loopback fixture: restores=<MEASURED> backed by raw `Page.frameNavigated` (`type = BackForwardCacheRestore`) after a real `Page.goBack`, launched without `--disable-back-forward-cache`> **or** <runtime still open: <reason, e.g. `Page.backForwardCacheNotUsed` explanations `<MEASURED>`>>. No real-site, default-profile or cross-build claim. | `<ENTRY PATH>`; `corpus/evidence/round-25/bfcache/receipt.json`; `scripts/check-bfcache-receipt.mjs`; rows S104/S105 (re-opened), S106 (opened) |
| On-release source freshness (S013, S015, S016, S020, S023, S024) | <re-verified 2026-10-25: reopened=<MEASURED>, unresolved=<MEASURED>, superseded by `<IDS or none>`> | `corpus/evidence/round-25/freshness/reopened.json`; `scripts/check-source-reopen-receipt.mjs` |

Counting commands (<DATE>): `ls corpus/knowledge/*.md | wc -l` → <MEASURED> (43 before this round);
`grep -cE '^\| S[0-9]{3} ' corpus/SOURCES.md` → <MEASURED> (105 before this round).
```

The "before" figures 43 and 105 are this seat's measurements at `c8ef308` (§0); re-measure at the tip.

## 3. Out of scope / not done

- No receipt, counter, entry, lesson or SOURCES row read or validated (none had landed at `c8ef308`).
- Assimilation contents (`.ufo/waves/round-25/assimilation/`) not judged; only noted as untracked (H2).
- No tool installed or upgraded; no process launched; pacman not touched.

## 4. Checks for the L1 after integration

`node scripts/check-selfassessment.mjs --rev <TIP> --json` (H1/H2), `node scripts/check-gate-registry.mjs --rev <TIP> --json` (H3),
both new counters with `--rev <TIP> --json` and `--selftest`, and the census `validate` command.
