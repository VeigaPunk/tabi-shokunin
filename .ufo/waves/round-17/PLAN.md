# tabi round 17 — L1 plan (canonical planner seat = L1 TabiR17)

Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin` (LANE below). Every path in this file is
relative to LANE unless absolute. Baseline `5859243183c4d7ac5429dfdb8a73ce0d9a43d583` (clean;
`jj-lane.sh state` → `local=remote=5859243… ahead=0 behind=0 head=detached`; `git rev-parse HEAD`
= master). Round date 2026-10-20. Host: Chromium 154.0.8037.97 (`/usr/bin/chromium`), Node
v24.21.0, jj 0.45.1. Start census (fleet validator) exit 0: rows 40, A31/B4/C5, mined33/queued2/rejected5.

Lane VCS is jj-colocated: git HEAD is jj-owned and detached. Seats NEVER run `jj` or any git write
(add/commit/stash/checkout/switch/reset/rebase/pull/push/update-ref/tag/branch) in LANE. Anything that
needs git writes runs in a sandbox clone under `/tmp/tabi-r17-<seat>-XXXX` (`git clone --no-hardlinks
LANE <sandbox>`), deleted afterwards unless a cited failure needs it.

## Claims (declared)

- **C1 — operability 8 (lowest non-retired tie: depth/operability/freshness/adjacency at 8).**
  jj-safe revision anchoring of the lane's round gates. Routed evidence:
  `/home/vgpnk/Projects/shokunin/.ufo/waves/hyaku/jj-w1/reports/JjAuditTabi.md` (12 live reads consume
  git HEAD; 4 `git rev-parse HEAD` code_revision diagnostics; `check-freshness --witness` accepts literal
  `HEAD`) and `JjTrialTabi.md`. Under jj, HEAD may name an unlanded/empty commit (`jj new`) or
  snapshot-only content, so a gate that reads HEAD can certify bytes that are on no branch.
  Count: **jj-anchor-safe gate entry points** (counter-owned fixed list; definition below), before at
  5859243 → after at the measured revision. `node .ufo/waves/round-17/measure-c1.mjs REV`.
- **C2 — coverage 9 (lane axis) + capability `webmcp-cdp-invocation`; sourced.**
  Frontier row "tool invocation as committed evidence" (`corpus/README.md:308-309`, round-16 note
  `corpus/knowledge/webmcp-chromium-loopback-round-16.md:127` "No tool is invoked in the receipt").
  Integrator ruling (round-16 spot-check `:138-142`): tabi owns live browser/CDP page observation
  including the WebMCP page-tool surface. Count: held WebMCP-invocation entries 0→1.
  `node .ufo/waves/round-17/measure-c2.mjs REV`. Rests on SOURCES rows opened THIS round (S041+).
- **C3 — adjacency 8 (lowest tie).** A checked sibling-overlap map `corpus/adjacency.tsv` + checker
  `scripts/check-adjacency.mjs`, recording the integrator CDP ruling (routed defect 5) and every
  other real overlap with a sibling lane (kaidoku CDP, kagi/kake the-musketeer CDP profile lease,
  kake crawler discipline, revenger browser-runtime evidence, others found by sweep) with a
  disposition. Count: verified adjacency dispositions 0→N. `node .ufo/waves/round-17/measure-c3.mjs REV`.

Causal separability: C1 touches only `scripts/check-round-contract.mjs`,
`scripts/check-user-round-contract.mjs`, `scripts/check-measurement-binding.mjs`,
`scripts/selftest-measurement-binding.mjs`; C2 only the new harness/fixtures/receipt/note/source rows;
C3 only `corpus/adjacency.tsv`, `scripts/check-adjacency.mjs`, the PROVINCE append. Each counter reads
only its own inputs. No exploratory claim.

## Byte-frozen surfaces (NEVER modify — would harm the round gates)

- `scripts/check-freshness.mjs` and `.ufo/rounds/fleet-round-1-interactive-20261015/**`:
  `protectedPath` in `scripts/check-round-contract.mjs:94-103` and
  `scripts/check-user-round-contract.mjs:144-153` freeze them at the hard baseline. So the
  `--witness HEAD` acceptance (JjAudit F6) is NOT fixed in code: it is recorded as a why-not plus a
  SKILL registry invocation rule (`--witness "$(git rev-parse --verify refs/heads/master)"`).
- `corpus/knowledge/*.md` admitted notes are sha-pinned in
  `corpus/evidence/fleet-round-1-freshness/pins.tsv` (e.g. browser-surface-census.md row 7): never
  edit them. Routed defect 4 (census U3 pointer) lands as a `corpus/README.md` append index row.
- `LOG.md SCORECARD.md SKILL.md PROVINCE.md corpus/QUALITY.md corpus/README.md` are append-only
  (`check-round-contract.mjs:25`); `corpus/lessons/round-<N>.md` existing at baseline are protected.
- round-16 evidence, `scripts/webmcp-loopback-round16.mjs` (r16 counted input) — never edit.

## C1 interface contract — lane-tip anchor

Add to each of the three gates (self-contained, same semantics, no shared module):

```js
// jj-colocated lanes detach git HEAD (it may name an unlanded or empty commit),
// so gates certify the lane branch tip, never HEAD. Attached HEAD (plain git,
// fixtures) resolves to its own branch; detached HEAD resolves refs/heads/master.
function laneTip(root) {
  const sym = git(root, ['symbolic-ref', '-q', 'HEAD']);
  const ref = sym.status === 0 ? sym.stdout.trim() : 'refs/heads/master';
  // must be a refs/heads/ name; resolve with rev-parse --verify --end-of-options `${ref}^{commit}`;
  // failure → could_not_evaluate (exit 2) with a reason naming the anchor (gate's own vocabulary).
}
```

Resolve ONCE per process and thread the 40-hex through every former `'HEAD'` read (`show`, `blob`,
`ls-tree`, `log <pin>..<tip>`, `merge-base --is-ancestor <x> <tip>`); every printed
`code_revision=`/`codeRevision=`/`measuredRevision=` field prints that 40-hex. The user-contract witness
`committed` flag compares the worktree blob with the lane-tip blob (JjAudit F3), not HEAD's.
`check-measurement-binding.mjs --at` default becomes the lane tip (explicit `--at REV` unchanged).
Fixture/self-test code that `rev-parse HEAD`s a freshly committed fixture repo stays unchanged
(attached HEAD, correct). Output on a plain attached checkout must be byte-identical to baseline
except where a field previously printed a non-tip value. Each gate's own `--self-test` gains at least
one case that builds a fixture with HEAD detached at an off-branch commit and asserts the gate reads
the branch tip (must FAIL against the baseline bytes — prove it in your report).

Identity chain: `scripts/check-user-round-contract.mjs` pins `scripts/check-round-contract.mjs` bytes
(`ROUND_SCRIPT_CURRENT_SHA256` `:31`, accepted/archived sets `:32-40`). The L1 updates that constant
pair at integration (old current → archived, new sha → current). Executors do NOT edit those constants.

### C1 count definition (counter `.ufo/waves/round-17/measure-c1.mjs`, owner C1Counter)

`node .ufo/waves/round-17/measure-c1.mjs REV` → one JSON line `{"c1_anchor_safe": N, "entries": [...], ...}`.
Sandbox: `git clone --no-hardlinks LANE S`; in S: `git checkout -q --detach REV`,
`git update-ref refs/heads/master REV`, `git symbolic-ref HEAD refs/heads/master` (arm A, attached),
worktree = REV. Poison commit P = child of REV whose tree changes inputs the gates read (e.g. drop a
pstack lesson, append to `scripts/check-round-contract.mjs`, alter a round-16 counted input, alter
SHONEN.md); created with plumbing (`commit-tree`) so the worktree stays REV.
- Arm A: HEAD attached at master=REV. Arm B: `git update-ref --no-deref HEAD P` (jj-like detached
  HEAD, worktree unchanged). Arm C (sensitivity, QUALITY 25): master moved to P, HEAD attached.
- Entry point passes iff exit and normalized stdout (volatile tokens such as timings/tmp paths
  normalized by a counter-owned rule) are equal in A and B, every printed 40-hex code/measured
  revision field equals REV in B, AND arm C differs from arm A (the gate reads committed state).
- Entry list (fixed in the counter, every live HEAD-reading mode at baseline): `check-round-contract`
  production; `check-user-round-contract` production; `check-round-contract --count-witness <rev>`;
  `check-user-round-contract --witness <rev>`, `--count-witness <rev>`, `--diagnostic-witness` (the
  canonical argv from the SKILL.md registry rows); `check-measurement-binding --check
  corpus/evidence/round-16/measurement-binding.json` without `--at`. The executor may drop an entry
  only with a reported reason (e.g. runtime > 10 min); check-freshness is excluded (byte-frozen).
- Exit 0 counted; exit 2 could-not-evaluate. Counter never touches LANE (clone only).

## C2 interface contract — WebMCP invocation as committed evidence

- Harness `scripts/webmcp-invoke-round17.mjs` (new; NEVER edit the r16 harness; you may import its
  exports if it exports any, else copy minimal code). `node scripts/webmcp-invoke-round17.mjs --out
  <receipt.json>`; loopback `http://127.0.0.1:<ephemeral>` only, temp `--user-data-dir`, `/usr/bin/chromium`
  headless, flags exactly as r16's flagged run unless a case is a control. Receipt schema mirrors r16
  `corpus/evidence/round-16/webmcp/receipt.json` (`summary{cases,passed,failed,missing,caseSetOk}`,
  `verdict`, `producerSha256` = sha256 of the harness file, `runs[]` with real pid, argv, `gone`,
  `runtime.observed.chromium.realExecutableSha256`, `loopback.externalRequestCount`).
- Fixtures under `corpus/evidence/round-17/webmcp-invoke/fixtures/`.
- Required case ids (counter-owned; L1 may prune an unobservable one with a recorded reason):
  `invoke-imperative-success`, `invoke-imperative-throws`, `invoke-imperative-rejects`,
  `invoke-unknown-tool`, `invoke-input-schema-mismatch`, `invoke-declarative-form`,
  `invoke-after-unregister`, `invoke-concurrent-ids`, `invoke-flags-off-control`,
  `invoke-iframe-frameid`, `invoke-navigation-pending`. Each case records the raw CDP
  request/response/events (`WebMCP.invokeTool` → `invocationId`, `WebMCP.toolInvoked`,
  `WebMCP.toolResponded`) and the page-side observation (what `execute` received), with a
  predicate fixed in code before the run.
- Final receipt `corpus/evidence/round-17/webmcp-invoke/receipt.json` (+ `.stdout.txt`); keep any
  failing earlier receipt as `receipt-first-run-failed.json` (never delete failing history).
- Note `corpus/knowledge/webmcp-invocation-round-17.md` (L1 integrates from the scribe draft): header
  `source:` S041+ rows (mined, tier A), `verified-at`, `recheck:`; decision table "what an invocation
  claim may assert from which evidence"; limits.
- Counter `.ufo/waves/round-17/measure-c2.mjs REV` → `{"c2_invocation_held": 0|1, ...}`; reads
  only git blobs at REV; counter-owned negative probes (tampered producer sha, missing required case,
  cited row not mined) must each yield 0.

## C3 interface contract — checked adjacency map

`corpus/adjacency.tsv` (new), header line then one row per overlap, 9 TAB-separated columns:
`surface  sibling  sibling_ref  sibling_quote  tabi_ref  tabi_quote  disposition  ruling_ref  ruling_quote`
- `sibling_ref` = `<lane>-shokunin@<40-hex>:<path>:<line>`; `sibling_quote` is a verbatim substring
  (≤25 words, no TAB) of that line at that commit (`git -C /home/vgpnk/Projects/shokunin/<lane>-shokunin show <commit>:<path>`).
- `tabi_ref` = `<lane-relative path>`; `tabi_quote` verbatim substring of that file at the evaluated rev.
- `disposition` ∈ `ruled` | `contested-open` | `split-declared` | `refused-route`.
  `ruled`: `ruling_ref` = `<repo>@<40-hex>:<path>:<line>` (repo `fleet` = /home/vgpnk/Projects/shokunin or
  `<lane>-shokunin`) + verbatim `ruling_quote`. `contested-open`: ruling_ref = `fleet@<40-hex>:.ufo/l0-questions.md:<line>`
  of a `tabi | round-17 |` (or earlier tabi) line. `split-declared` / `refused-route`: ruling_ref `-`,
  both quotes must state the split.
- Checker `scripts/check-adjacency.mjs [--at REV] [--self-test] [--json]` (lane-tip anchored per C1
  semantics; never HEAD), exit 0 clean / 1 findings / 2 could-not-evaluate, closed reason vocabulary,
  no shell, minimal Git env (copy the pattern from `scripts/check-measurement-binding.mjs`).
- Counter `.ufo/waves/round-17/measure-c3.mjs REV` re-verifies every row itself (not trusting the
  checker), plus probes: checker must go red on a counter-mutated row. `{"c3_adjacency_verified": N}`.
- Row fragments: each adjacency scout writes `.ufo/waves/round-17/adjacency/<sibling>.tsv` (rows only,
  no header); L1 concatenates.

## Routed defects (round-16 spot-check `corpus/lessons/round-16-verifier-spotcheck.md:146-157`)

1. Unrooted liar probe → `corpus/evidence/round-17/routed/liar/`: a generator script that rebuilds
   the three liar revisions in a sandbox clone from committed liar blobs, the liar blobs, their
   digests, and a fresh run receipt (owner RoutedLiar).
2. Pre-hardening receipts → `corpus/evidence/round-17/routed/binding-hardened/`: `--self-test` and
   `--legacy corpus/evidence/round-15/measurements.json --at 36240c7…` receipts produced by the
   registered gate blob at 3254740 (sha256 `1f84fb54…`) run from a sandbox checkout of 3254740;
   README/LOG labels the r16 ones as history (owner RoutedHardened).
3. Delivered-HEAD receipt → same dir: `--check corpus/evidence/round-16/measurement-binding.json
   --at 1205d261776a349af99a5a205c7c2467fbabae16 --reproduce` receipt (owner RoutedHardened); r17's
   own delivered-tip receipt lands at round end (L1). QUALITY criterion drafted (DraftQuality).
4. Census U3 pointer → README append index row (owner L1 from DraftReadme).
5. Integrator ruling → C3 row + PROVINCE append (L1 from DraftProvince).
Also: the r16 report word "unforgeable" overstated finite liar probes → QUALITY criterion + lesson mistake.

## Ownership (wave 1) — write ONLY your row's paths plus your Report

| Seat | Owns (LANE-relative) |
|---|---|
| GateRoundAnchor | scripts/check-round-contract.mjs |
| GateUserAnchor | scripts/check-user-round-contract.mjs (except the ROUND_SCRIPT_* identity constants) |
| GateBindAnchor | scripts/check-measurement-binding.mjs, scripts/selftest-measurement-binding.mjs |
| C1Counter | .ufo/waves/round-17/measure-c1.mjs |
| C1JjRealProbe | .ufo/waves/round-17/probes/jj-real-probe.mjs |
| C1SiteInventory | .ufo/waves/round-17/c1-sites.json |
| HarmBaseline | .ufo/waves/round-17/harm-baseline.json |
| C2Harness | scripts/webmcp-invoke-round17.mjs, corpus/evidence/round-17/webmcp-invoke/** |
| C2Probe* | .ufo/waves/round-17/probes/invoke-<topic>.mjs (own topic file only) |
| C2Counter | .ufo/waves/round-17/measure-c2.mjs |
| C3Checker | scripts/check-adjacency.mjs |
| C3Counter | .ufo/waves/round-17/measure-c3.mjs |
| Adj<Sibling> scouts | .ufo/waves/round-17/adjacency/<sibling>.tsv |
| Src<Topic> scouts | .ufo/waves/round-17/sources/<Topic>.md |
| RoutedLiar | corpus/evidence/round-17/routed/liar/** |
| RoutedHardened | corpus/evidence/round-17/routed/binding-hardened/** |
| Draft* scribes | .ufo/waves/round-17/drafts/<name>.md |
| everyone else | read-only; Report only |

L1 alone writes: LOG.md, SCORECARD.md, SKILL.md, PROVINCE.md, corpus/QUALITY.md, corpus/README.md,
corpus/SOURCES.md, corpus/adjacency.tsv, corpus/knowledge/*, corpus/lessons/round-17.md,
corpus/evidence/round-17/measurement-binding.json and measurements.json, the ROUND_SCRIPT identity
constants, and every commit (via `/home/vgpnk/Projects/shokunin/scripts/hyaku/jj-lane.sh` only).

## L1 amendments after wave 1 (append-only)

- `PROVINCE.md` is census-frozen (`corpus/evidence/pstack-20261015/baseline-census.tsv:24`;
  `check-round-contract.mjs` census loop) — an append turns the round gate red
  (`w1/RevHarmPlan.md` H1, `w1/ConnProvinceRuling.md`). The integrator ruling is recorded in
  `corpus/adjacency.tsv` (row `cdp-runtime-observation`), the README and SKILL appends instead.
- C1 count definition v2 (`w1/C1Counter.md`, after CriticC1/RevPlanC1/ConnFleetBinding): 8 entries,
  per-entry poison, arm B2 (`checkout -f --detach P`), arm C judged on verdict/finding with revision
  labels normalized, static HEAD residue from `c1-sites.json` at REV; label-only entries are
  reported and NOT credited. Count = behavior-bearing entries passing.
- C1 gates also gained hardened git env (no inherited GIT_*, replace/graft off, ceiling dir,
  toplevel check, strict symbolic-ref status classes, symref-anchor refusal) per SentinelAnchor.
- C3 rules tightened (CriticC3/RevPlanC3/SentinelAnchor F7–F12): `tabi_ref` is `<path>:<line>`, quotes
  4–25 words and ≥20 non-space chars, sibling pin reachable from the sibling's master→main tip,
  ruled venue = fleet or a non-tabi-authored spot-check line whose quote names the sibling,
  contested-open = fleet l0 `tabi |` line naming the sibling (filed: fleet `ebeb396`, line 62).
- C2 receipt adds a `invoke-cancel` supplementary control (`Canceled` observed) and three more
  controls; required case set unchanged.
- Sources S049–S052 (jj/git) stay `queued` this round (the lesson that cites them lands after the
  measured revision; used-by cannot point at it earlier).
