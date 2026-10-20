# RevFrontierStep — round-16 frontier-step plan vs §2b / SOURCES contract v1

Seat `TabiR16.RevFrontierStep-5` (reviewer, leaf, no dispatch). Date 2026-10-20.
Read-only: no file outside this Report written, no commits, no gate/selftest/counter/browser run
except the read-only source census and `git show`/`grep`/`sha256sum`. No tool installed or updated.

Inputs: `.ufo/waves/round-16/PLAN.md` (114 lines), `.ufo/prompts/tabi-round-16.md:42-76` (§2b),
`/home/vgpnk/Projects/shokunin/CORPUS.md:64-183` (SOURCES contract v1 + kaika rules),
`.ufo/waves/round-16/w1/spec.json` (84 items, for mitigation only), `corpus/SOURCES.md`,
`corpus/evidence/round-15/measurements.json`, `corpus/lessons/round-15.md` (precedent shape).

Verdict: **the PLAN covers 4 obligations fully, 4 partially, and omits 4 at plan level.**
One omission is load-bearing: the C1 counter predicate required for the mined-mistake fix is
internally contradicted by the real round-15 record and cannot reach count 1 as written (F1).

## Obligation matrix

| # | Obligation (authority) | PLAN anchor | Verdict | Why |
|---|---|---|---|---|
| O1 | Row written only after the source is opened **this round** (`tabi-round-16.md:49-50`; `CORPUS.md:112-115`) | `PLAN.md:94` | **MEETS** (precondition text) | "L1 writes, only after a seat opened the source this round". No raw-fetch receipt or second-seat re-open is required by the plan (see O13b). |
| O2 | Lesson `## Gate` records URL + access date + ≤25-word located quote **for every new row** (`prompt:50-51`; `CORPUS.md:112-115`) | — | **MISS** | PLAN has no `## Gate` obligation at all (`grep -n "## Gate" PLAN.md` → no match). The quote fields sit on the row-write bullet (`:94`), not on the lesson artifact. No checker backstops it: `scripts/check-sources.mjs` is registry-structure only (`:29-30`, required sections; no lesson read), and the only `## Gate` parser is pstack-scoped (`scripts/check-round-contract.mjs:266-273` selects `pstack-20261015-r\d{2}` ids only). |
| O3 | Rejections stay as rows with reason + flip (`prompt:51`; `CORPUS.md:101-102`) | `PLAN.md:96` | **MEETS** | "rejections kept with reason + flip". |
| O4 | Every `status` / `recheck` / `used-by` change logged **old→new in the lesson** (`prompt:51-52`; `CORPUS.md:116-118`) | `PLAN.md:95` names both mutations | **MISS** | S020 `queued→mined` and S002 `used-by add` are planned, but the old→new logging duty is absent. Worse, the plan does not state that `opened` (2026-10-19, `corpus/SOURCES.md:34`) and all other cells stay unchanged on a re-open; append-only (`CORPUS.md:116-117`) is not restated, so a seat can rewrite `opened=2026-10-20`. |
| O5 | Census before→after: same command at start and end, both outputs + exit codes, exit 0 at round end (`prompt:54-60`, command `:65`) | `PLAN.md:5` (start only) | **PARTIAL** | Start numbers are exact (verified below: `tabi ok`, exit 0, rows 29, A23/B4/C2, mined24/queued3/rejected2). But the plan records no command text, no output bytes, no receipt, and never requires the end run or its exit code. Round-15's own Gate carried the command + stdout + receipt (`corpus/lessons/round-15.md:38-46`). |
| O6 | One mined mistake in `corpus/lessons/round-16.md ## Mistakes`: class · evidence pointer · captured-by · fix; fix counts only when **shown able to fail** with committed observed failure (`prompt:68-72`; `CORPUS.md:171-178`, `:179-183`) | — | **MISS** at plan level; mechanism contradicted (F1) | No `## Mistakes` obligation in PLAN (only `corpus/lessons/round-16.md` write scope at `:112`). Defects 1/2 are routed into C1 (`:10-13`), and C1's legacy red-run (`:64-67`, `:76-77`) is the intended red-before — but its required reason set contradicts the real r15 record (F1). Defect 2 has no committed red receipt (F5). |
| O7 | At least one sourced claim: a claim rests on a row opened this round, and the entry/evidence cites that `S###` (`prompt:73-74`) | `PLAN.md:15,31,91-92,95` | **AT RISK** | The note must "open with `source: S0xx` lines", and C2 is declared "sourced". But S020 goes mined only "**if** it backs the note" (`:95`) — optional. If S020 diverges (a CG draft vs Chromium 154 behaviour, and the note explicitly records "observed vs spec divergence" `:92`), nothing forces any other row to `mined` + `used-by`; `:96` only says "new rows … actually opened". C2's counter predicate is unspecified (`:29` names only the command) against C1's fully-specified predicate (`:74-77`), so no count enforces the citation. |
| O8 | Expansion = admitted entry whose `source:` cites a **mined** row on uncovered coverage-map ground; no row quota (`CORPUS.md:123-125`) | `PLAN.md:32,92` | **PARTIAL** | No-quota rule stated (`:32` "no source-row inflation called expansion"). The note header is specified as "opened A/B rows" (`:92`), not `mined` rows, and coverage-map ground is not mentioned — if S020 stays `queued`, the entry would not satisfy the expansion definition. |
| O9 | Search-log entry (question/query, where, date, counts, exclusions, stop) (`CORPUS.md:126-128`, shape `:82`) | — | **MISS** in PLAN | Delegated only to seat `DraftSources` (spec item 22, "Also draft the Search log line for round 16"). The canonical plan does not require it. |
| O10 | No credential material / private URLs / `op://` (`CORPUS.md:129`) | — | **MISS** (low risk) | Not stated. Known hazard on record: S022 needs sign-in (`corpus/SOURCES.md:57`). No seat prompt forbids fetching it. |
| O11 | New knowledge entry opens with `source:`, `verified-at:`, `recheck:` (`CORPUS.md:163-167`) | `PLAN.md:91-92` | **PARTIAL** | Only `source:` lines are required. `verified-at:` and `recheck:` are unspecified. `scripts/check-freshness.mjs` targets fleet-round-1 pins only, and `grep -rln "verified-at" scripts/` → no output, so nothing enforces the trio. |
| O12 | Frontier step runs inside the 1–3 claim cap, not a fourth claim (`prompt:44-45`) | `PLAN.md:7,15,31,94-96` | **MEETS** | Two declared claims; sources folded into C2; no exploratory claim. |
| O13 | Follow contract v1, never redefine it; registry in contract shape (`prompt:44-46`; `CORPUS.md:76-108`) | whole PLAN | **MEETS** | Contract not restated or redefined; registry exists and validates (census exit 0 today). Tables unchanged. |
| O13b | Non-author re-opens a sample of new rows (`CORPUS.md:114-115`) | — | **MISS** (scheduling) | PLAN schedules no wave-2 re-open of new rows. Only `.ufo/waves/round-16/w1/` exists at review time, so the falsifier wave is not yet planned. |

## Findings (severity order)

### F1 — CRITICAL: C1's red-before predicate is unsatisfiable as written
`PLAN.md:76-77` makes C1 count 1 only if committed `legacy-r15.json` "has exit 1 with
`counter_digest_unrecorded` for **both** r15 claims". The real record disagrees:
- `corpus/evidence/round-15/measurements.json:65` — C1: `counterCodeRevision 27dfd98`, **no** `counterSha256`.
- `corpus/evidence/round-15/measurements.json:131-132` — C2: `counterCodeRevision 9fd8bca`, **`counterSha256 dd9c8675…`**.
- `measurements.json:4` — `measuredRevision b7cf044`.

`git show 27dfd98:.ufo/waves/round-15/measure.mjs | sha256sum` → `3ee59de0…e384`;
`git show b7cf044:… | sha256sum` → `3ee59de0…e384` (same blob);
`git show 36240c7:… | sha256sum` → `dd9c8675…1251`.

So for C2 a digest **is** recorded and does not match the blob at `measuredRevision` — exactly
`PLAN.md:55`'s `counter_digest_mismatch` ("blob at measuredRevision ≠ sha256"). `PLAN.md:64-67`
never lists `counter_digest_mismatch` in the legacy vocabulary, and `:76-77` demands
`counter_digest_unrecorded` for C2 anyway. An honest adapter reports C2 as mismatch → C1 counts 0;
an adapter that reports "unrecorded" for a recorded digest is lying about cause and violates the
spirit of `CORPUS.md:179-183`. Either way the round's mined-mistake fix (defect 1) cannot produce an
honest red-before receipt matching the plan's own count predicate.
Independent corroboration: `.ufo/waves/round-16/w1/DraftLesson.md` Finding 1.
Fix: require C1 `counter_digest_unrecorded` + C2 `counter_digest_mismatch` in `legacy-r15.json`;
add `counter_digest_mismatch` to the legacy-mode vocabulary; pin both expected reasons in the C1
counter predicate; keep `gateSha256`.

### F2 — HIGH: no end census, command, or exit-code duty
`PLAN.md:5` is the only census line. §2b (`prompt:54-60`) requires the literal command at start and
end, both outputs, both exit codes, exit 0 at end for conformance, and a recorded defect path. The
plan has none, and the ownership table (`:100-112`) assigns no census artifact. Fix: add a census
block to PLAN with the exact `sources-census.sh validate --root … tabi` command, the before pair
(already accurate), and a mandatory after pair; a non-zero end exit is a named conformance defect.

### F3 — HIGH: no `## Gate` artifact, and no checker backstops it
No plan line requires `corpus/lessons/round-16.md ## Gate` or its per-row URL/date/≤25-word located
quote. The row bullet (`:94`) carries the quote fields but not the lesson artifact. `check-sources.mjs`
validates registry sections/rows only (`:29-30`); `check-round-contract.mjs` parses Gate only for
`pstack-20261015-rNN` lessons (`:266-273`). Round-15's Gate (`corpus/lessons/round-15.md:5,27-36`)
shows the expected shape. Fix: add the Gate requirement and name it as the row-opening record that
non-author re-open (O13b) verifies.

### F4 — HIGH: the sourced claim is conditional and unenforced
`PLAN.md:95` "queued→mined **if** it backs the note" makes §2b item 4 optional in the only place it
is decided. With S020 a CG draft and the claim about Chromium 154 behaviour, divergence is likely
by the plan's own design (`:92`). No fallback row is required to reach `mined`+`used-by`, and C2's
count predicate is undefined (`:29`) where C1's is exact (`:74-77`). Fix: designate one row that
must end `mined` with `used-by = corpus/knowledge/webmcp-chromium-loopback-round-16.md`, and give
C2 a checkable predicate (note exists, opens with `source:` citing that row, row status `mined`,
receipt schema/summary valid, cases pass).

### F5 — HIGH: `## Mistakes` and "fix shown able to fail" are absent from the plan
§2b item 3 (`prompt:68-72`) and `CORPUS.md:171-183` require the lesson table plus one red-before
state where the same command exits non-clean for the named reason, observed text committed. PLAN
never mentions `## Mistakes`. Substance exists only in seat prompts (spec item 20 drafts four rows;
its fixes are marked "planned and unrun"). Defect 2 (`round-15-verifier-spotcheck.md:121`) has no
real-data red-before: its class does not even fire on the r15 record (`b7cf044` **is** an ancestor of
`36240c7`), so `measured_revision_not_ancestor` cannot be the witness; the observable is
`counter_changed_since_measurement`/`counted_input_changed` (counter blob `3ee59de0`→`dd9c8675`
across `b7cf044→36240c7`). Fix: require the four-row table in PLAN and, per row, the exact
command + expected non-clean reason + committed receipt path; use the counter-path diff for defect 2.

### F6 — MEDIUM: `opened`/append-only semantics unspecified on re-open
`PLAN.md:94-95` says "re-open" without stating which cells may change. `CORPUS.md:116-118` allows
only `status`, `recheck`, `used-by`. A seat can plausibly rewrite `opened` to 2026-10-20 and destroy
the row's provenance date (`corpus/SOURCES.md:34`). Fix: state the exact old→new transitions and
"`opened` and all other cells unchanged".

### F7 — MEDIUM: provenance trio incomplete
`PLAN.md:91-92` requires only `source:`; `verified-at:` and `recheck:` (`CORPUS.md:163-167`) are
missing, and no script enforces them (`grep -rln "verified-at" scripts/` → empty;
`scripts/check-freshness.mjs` is fleet-round-1 pin-scoped). Fix: require all three lines; S020
`recheck: on-release` (row already says so), new Chromium-source rows `on-release` or `90d`.

### F8 — MEDIUM: expansion wording vs the mined-row requirement
`PLAN.md:92` says "opened A/B rows"; `CORPUS.md:123-124` counts entries whose `source:` cites a
**mined** row on uncovered coverage-map ground. Under F4's conditional, the entry could cite a
`queued` row and still be called expansion. Fix: say `mined` explicitly and name the coverage-map
ground the entry covers (or state it is an incremental entry on covered ground and not counted as
expansion).

### F9 — LOW: search log and credential rule omitted from PLAN
`CORPUS.md:126-128` and `:129` are not in the plan; only a seat prompt drafts the search-log line,
and nothing forbids the known sign-in source S022 (`corpus/SOURCES.md:57`). Fix: one line each.

### F10 — LOW: no planned non-author re-open of new rows
`CORPUS.md:114-115` ("Non-author verification re-opens a sample") has no slot in PLAN, and only
wave 1 is planned at review time. Fix: name the wave-2 seat/duty.

## What the plan gets right (keep as-is)
- Two causal-separable claims, no fourth claim, no exploratory claim (`PLAN.md:7,31,32`).
- Row-before-opening precondition with URL/date/≤25-word quote fields (`:94`) — the substance of rule 1.
- Rejections kept with reason + flip (`:96`).
- Start census numbers are exact (verified below) and match the registry today.
- C1 interface is otherwise precise (minimal Git env, no shell, exact reason vocabulary, exit
  semantics, injection-inert selftest case) — only F1 breaks it.
- The frontier anchor is real: `corpus/README.md:35` "Native WebMCP in chromium 152 — unprobed
  (census U3)", table `:181`, sources line `:194`; the stale-premise mistake is live.

## Verification performed (commands and observed output)
1. `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi`
   → `tabi<TAB>ok<TAB>/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md`, exit 0.
2. Frozen manual census from `CORPUS.md:135-143`:
   `ROWS=29`; `MALFORMED=0`; tier `A=23 B=4 C=2`; status `mined=24 queued=3 rejected=2`.
3. `git show 27dfd98:.ufo/waves/round-15/measure.mjs | sha256sum` → `3ee59de095750e08fc719ed19eb5baea02caf443df05479d24897783240fe384`.
4. `git show b7cf044:.ufo/waves/round-15/measure.mjs | sha256sum` → same `3ee59de0…e384`.
5. `git show 36240c7:.ufo/waves/round-15/measure.mjs | sha256sum` → `dd9c8675ab9bbc91c20f501a90f898197d046d2586f12d2389a564385281251d`.
6. `grep -n "measuredRevision|counterCodeRevision|counterSha256" corpus/evidence/round-15/measurements.json`
   → `:4 b7cf044…`; `:65 27dfd98…` (C1, no digest); `:131 9fd8bca…`; `:132 dd9c8675…` (C2).
7. `grep -n "Mistakes|## Gate|census|used-by|25-word|recheck" .ufo/waves/round-16/PLAN.md`
   → only `:5` (census) and `:94-95` (rows/used-by); no Gate, no Mistakes, no old→new.
8. `node -e` over `w1/spec.json` → 84 items; frontier keywords appear only in seat prompts
   (SourcesStaging 16, DraftLesson 20, DraftSources 22, RevAccessDates 61, RevFrontierStep 56).
9. `grep -n "parseLesson" scripts/check-round-contract.mjs` → `:266-267` pstack-id filter, `:588` call.
10. `grep -rln "verified-at" scripts/` → no output; `scripts/check-sources.mjs:29-30` required
    sections only.

## Residual risk / not checked
- I did not run any wave-1 seat's output as evidence beyond quoting `DraftLesson.md` Finding 1; the
  plan review stands on PLAN + contract + the committed round-15 record.
- Wave-2 spec does not exist yet; O13b/F10 are judged on PLAN only.
- Whether S020 actually backs the note is undecided by design (F4); I did not fetch the spec this
  seat (not my slice), so I do not assert either way.
- Claim admission, SCORECARD capability-table recording, and the trend verdicts are outside this
  review's frontier-step scope.

## Checks for L1 after integration
1. `grep -n "## Gate" corpus/lessons/round-16.md` and confirm one URL+date+≤25-word located quote
   per row added this round.
2. Run the census command (above) and paste both outputs; require exit 0.
3. `node scripts/check-measurement-binding.mjs --legacy corpus/evidence/round-15/measurements.json`
   → expect exit 1, C1 `counter_digest_unrecorded`, C2 `counter_digest_mismatch` (F1). If the plan is
   not amended, C1's counter cannot reach 1.
4. `grep -n "opened" corpus/SOURCES.md` → S020/S002 `opened` still 2026-10-19.
5. `grep -n "source:\|verified-at:\|recheck:" corpus/knowledge/webmcp-chromium-loopback-round-16.md`
   → trio present, `S0xx` cited.
6. Confirm the lesson logs old→new for S020 status and S002 used-by, and that the `## Mistakes`
   rows each name a committed red-before receipt with the observed non-clean output.

## Addendum — sibling claim checked (`ConnFrontierRows`, 2026-10-20)

Reviewed `w1/ConnFrontierRows.md` at its author's request and reproduced the load-bearing facts
read-only:

- `/var/cache/pacman/pkg/chromium-152.0.7977.82-1-x86_64.pkg.tar.zst` sha256 `2598ad3e…`;
  `pacman -Qp` → `chromium 152.0.7977.82-1`; installed `pacman -Q chromium` → `154.0.8037.97-1`.
- WebMCP feature constants and `WebMCP.toolsAdded` are embedded **identically** in the cached 152
  binary and `/usr/lib/chromium/chromium` (152: `kWebMCP`, `kWebMCPTesting`, `kDeclarativeWebmcp`,
  `kDevToolsWebMCPSupport`, `kWebMCPDeclarativeFileInput`, `kWebMCPFormAssociatedCustomElements`,
  `ModelContextRegisterToolOptions`×3; 154 histogram equal).
- `corpus/evidence/round-16/webmcp/protocol-domain.json` sha256 `f7cb1e8c…`; all five comparison
  fields true (`webmcpDomainPresentNoFlags`, `webmcpDomainIdentical`, …).
- `grep -ci webmcp ~/.config/chromium-flags.conf` → `0`.

Consequences for this review:
1. **F8 is strengthened**: the plan's C2 unit is a held entry (`PLAN.md:29`), and no frontier row is
   a counted input. A frontier-row advance must therefore be argued from the note's `source:`
   citation, not from the count. `measure.mjs` does not yet exist, so "the counter counts" is still
   a plan statement, not an observed predicate (F4).
2. `corpus/README.md:181`'s clause "no flag carries it" is **not** a safe anchor as-is: it is
   refuted at code-presence level for the census build (152) and at runtime for 154 by the
   pre-probe (`PLAN.md:18-23`). Any frontier restatement must say code-presence / CDP-domain /
   flag-gated loopback runtime / default-profile as separate graded claims, and must not edit
   `:181` in place (`corpus/README.md:173-176` append convention). This is also a live
   stale-premise class for the `## Mistakes` table (F5).
3. The CDP-domain layer rests on a producer receipt (`WebmcpProtocol`); I verified its committed
   bytes, not a live `/json/protocol` response.
