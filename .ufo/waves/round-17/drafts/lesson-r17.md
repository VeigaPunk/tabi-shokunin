# Round 17 — WebMCP tool invocation over CDP, jj-safe gate anchoring, adjacency map (DRAFT, DraftLesson-2)

Draft for L1 integration into `corpus/lessons/round-17.md`. Not admitted. Every `[pending]` cell is
filled by the L1 from the named counter, receipt or source row; nothing here is a passed check.

Steered round 17, attempt 1, 2026-10-20 (hyaku phase 2). Baseline
`5859243183c4d7ac5429dfdb8a73ce0d9a43d583` (clean; `git rev-parse HEAD` = master per PLAN.md:4-5).
Measured revision `[pending: REV]`. Lane VCS is jj-colocated; git HEAD is jj-owned and detached
(PLAN.md:5, :9). C1 operability 8 (lowest tie): jj-safe lane-tip anchoring of the round gates,
`[pending: count]` entry points. C2 coverage 9 + capability `webmcp-cdp-invocation`, sourced:
held WebMCP-invocation entries 0→`[pending]` (PLAN.md:24-29). C3 adjacency 8: checked sibling-overlap
map, verified dispositions 0→`[pending: N]` (PLAN.md:30-34). Wave 1 = build plus first falsifiers.

## Gate

Author-side admission criteria (not a claim that an unrun check passed):

- admit C1 only if `node .ufo/waves/round-17/measure-c1.mjs REV` emits `c1_anchor_safe` equal to the
  declared entry-point count `[pending]` at REV, with every entry passing arms A/B/C of PLAN.md:95-99
  (poison-commit arm C differs from A), and the three gates' `--self-test` each gain a detached-HEAD
  case that fails against the baseline bytes (PLAN.md:77-81). Source: PLAN.md:87-106.
- admit C2 only if `corpus/evidence/round-17/webmcp-invoke/receipt.json` is the output of the committed
  harness (`producerSha256` = sha256 of `scripts/webmcp-invoke-round17.mjs`), every required case id
  in PLAN.md:118-122 either passes or is pruned with a recorded reason, each case carries the raw
  `WebMCP.invokeTool` / `toolInvoked` / `toolResponded` trail (PLAN.md:122-125), the flag-off control
  has a real browser pid/argv, the note cites only mined A rows opened this round with the note in
  used-by, and `measure-c2.mjs` returns `c2_invocation_held: 1` with its negative probes at 0
  (PLAN.md:131-134). Source: PLAN.md:108-134.
- admit C3 only if `node scripts/check-adjacency.mjs --at REV` exits 0, every row re-verified by
  `measure-c3.mjs` against its quoted sibling/tabi/ruling line at its commit, and the counter goes red on
  a counter-mutated row (PLAN.md:147-151). Source: PLAN.md:135-151.
- rejected / not claimed:
  - "`--witness HEAD` accepted by `check-freshness`" fixed in code: rejected, byte-frozen
    (PLAN.md:46-49; JjAudit F6 `/home/vgpnk/Projects/shokunin/.ufo/waves/hyaku/jj-w1/reports/JjAuditTabi.md:184-191`).
    Recorded as a why-not plus a SKILL invocation rule `--witness "$(git rev-parse --verify refs/heads/master)"`.
  - edits to admitted `corpus/knowledge/*.md`: rejected, sha-pinned (PLAN.md:49-51).
  - invocation claims beyond the harness's receipt scope (chromium 154, loopback, one build): rejected
    (scope as in round-16 `## Gate` `corpus/lessons/round-16.md:28-33`).
  - "unforgeable" for any finite probe set: rejected wording (see Mistakes row 1).
  - a jj/HEAD-anchored receipt presented as a branch-tip receipt: rejected (Mistakes row 4).

### Rows opened this round (access date 2026-10-20; quotes ≤25 words)

Seat plan: `.ufo/waves/round-17/w1/spec.json` names the scouts SrcSpecExecute, SrcBlinkInvoke,
SrcDevtoolsInvoke, SrcWebTests, SrcExplainerExec, SrcChromeDocsInvoke, SrcJjColocation
(spec.json entries around `:134-170`). Each scout's open-row output is not yet in the repo.

| Row | URL | Located quote | Location / identity |
|---|---|---|---|
| S041 `[pending]` | `[pending]` | `[pending: ≤25 words, verbatim]` | `[pending: line; sha256 of raw fetch]` |
| S042 `[pending]` | `[pending]` | `[pending]` | `[pending]` |
| (one row per scout output; include only rows that a claim cites) | | | |

Per-seat fetch commands and raw digests: `.ufo/waves/round-17/sources/<Topic>.md` (PLAN.md:188).

### Registry transitions (old→new, in-place cells only)

Start: `corpus/SOURCES.md` last row S040 (`corpus/SOURCES.md:54`); next id S041 (PLAN.md:129).
Census start (lane `census`): rows 40, A31/B4/C5, mined33/queued2/rejected5
(`corpus/lessons/round-16-verifier-spotcheck.md:109`).

- `[pending: Sxxx queued→mined, used-by —→<note path>; anchor/opened/recheck unchanged]`
- `[pending: any superseded row, appended not rewritten]`

### Census

Start: `[pending: sources-census.sh validate … tabi → exit + line]`.
End (after integration): `[pending]`. Knowledge notes `[pending: 33→N]`.

## Mistakes

| Class | Evidence pointer | Captured-by | Fix / shown able to fail |
|---|---|---|---|
| overstated probe strength — "unforgeable" for three tested liar shapes | `corpus/lessons/round-16-verifier-spotcheck.md:76` ("The author summary's word 'unforgeable' overstates this: the probes defeat the three tested liar shapes"). Committed-bytes check: `grep -rl unforgeable` over `/home/vgpnk/Projects/shokunin/.ufo/reports`, `tabi-shokunin/reports`, `.ufo/waves/round-16`, `corpus`, `LOG.md`, `SCORECARD.md` returns only the spot-check line (rc=0). The word is therefore not in committed round-16 bytes; the "author summary" that carried it is not located in the repo. | none (QUALITY 25 `corpus/QUALITY.md:97-100` covers counter trust, not prose strength) | `[pending: QUALITY criterion (b)]` — probe strength is stated as the finite set of shapes defeated. Falsifier: a committed lesson/report/QUALITY line calling a finite probe set "unforgeable" or "cannot be forged". |
| run claim without a committed receipt — "re-run at 1205d26" | `/home/vgpnk/Projects/shokunin/.ufo/reports/round-16/tabi.md:69` ("…`binding/check.json`) and again at `1205d26`"); spot-check `corpus/lessons/round-16-verifier-spotcheck.md:150` (routed 3); the only committed `binding/check.json` argv names `--at 6c8e0ff…` (spot-check `:70`). The 1205d26 result was confirmed only by an empty counter/counted-input diff (`:50-61`), not by a receipt. | none (QUALITY 22 `corpus/QUALITY.md:78-80` binds the manifest check; QUALITY 23 `:85-89` is scoped to browser-API observations) | `[pending: QUALITY criterion (a)]` — a run claim needs a committed receipt at the cited revision, or says "holds by drift diff". Falsifier: a report/lesson line "re-run at X" with no receipt file at X. Current evidence: `measurements.json` / `binding/check.json` at 6c8e0ff; r17 delivered-tip receipt lands at round end (PLAN.md:163-166). |
| evidence rooted only in /tmp — pointer does not resolve from a fresh clone | `corpus/evidence/round-16/measure/c1-liar-probes.json:3` (`"clone": "/tmp/tabi-r16-c1liar-93NO/repo"`); `.ufo/waves/round-16/w2/AttackC1Liar.md:19` (`mktemp -d /tmp/tabi-r16-c1liar-XXXX`); liar commits `9ecfcc9`/`0754e44`/`7b497d1` are not repo objects (spot-check `:73`, `:148`). | none (no QUALITY criterion names evidence roots; `grep -n /tmp corpus/QUALITY.md` → no match) | `[pending: routed 1 → corpus/evidence/round-17/routed/liar/**: generator + committed liar blobs + digests + fresh receipt]` (PLAN.md:157-160). Falsifier: any evidence pointer in round-17 that fails to resolve in `git clone --no-hardlinks` of the lane. Proposed QUALITY criterion (c) `[pending: DraftQuality]`. |
| gates anchored on git HEAD under jj colocation — HEAD may name an unlanded/empty commit, so a gate certifies bytes on no branch | JjAuditTabi (fleet `.ufo/waves/hyaku/jj-w1/reports/JjAuditTabi.md`): F1 `:44-67` (after `jj new`, HEAD `68d0582` on no branch; `ROUND_CONTRACT` and `FRESHNESS_GATE` both clean); F2 `:69-93` (after `jj commit`, `@{u}` dies, porcelain-clean status hides divergence); F3 `:95-130` (unlanded SHONEN bytes parsed as committed; `committed` witness false-positive). Gate sites at baseline: `scripts/check-round-contract.mjs:119`, `:231-232`, `:504` (`rev-parse HEAD`, `merge-base … HEAD`); `scripts/check-user-round-contract.mjs:167`, `:308`, `:794-795` (`headBlob = blob(defaultRoot, 'HEAD', …)`). `corpus/QUALITY.md` has no HEAD/jj criterion (`grep -n -i 'jj\|HEAD'` → only `:79-80`, a `--at <delivered HEAD>` mention). | none | C1 lane-tip anchoring (PLAN.md:56-81, count PLAN.md:87-106) + `[pending: QUALITY criterion (d)]` — a gate certifies the lane branch tip, never git HEAD. Shown able to fail: `measure-c1.mjs` arm B (detached HEAD at poison commit P) must read REV, and arm C must differ from arm A. |

Operational record (not a lane-content mistake): `[pending: any dead seats/rate-limit records from this round's wave logs]`.

## Routed defect disposition (round-16 spot-check `corpus/lessons/round-16-verifier-spotcheck.md:146-157`)

1. Unrooted liar probe → `corpus/evidence/round-17/routed/liar/` (RoutedLiar). `[pending: receipt]`
2. Pre-hardening receipts → `corpus/evidence/round-17/routed/binding-hardened/` (`--self-test` and
   `--legacy` at gate blob `1f84fb54…`, commit 3254740). `[pending]`
3. Delivered-HEAD run claim → `binding-hardened/` receipt for `--check … --at 1205d26 --reproduce`;
   r17's own delivered-tip receipt at round end. `[pending]`
4. Census U3 pointer (`corpus/knowledge/browser-surface-census.md:188`) → README append index row
   pointing to `corpus/README.md:295-317`. `[pending: L1 from DraftReadme]`
5. Integrator ruling (tabi owns live browser/CDP page observation incl. WebMCP page-tool surface;
   kaidoku keeps CDP as REA provider surface, `corpus/lessons/round-16-verifier-spotcheck.md:141-142`)
   → `corpus/adjacency.tsv` row + PROVINCE append. `[pending: L1 from DraftProvince]`
6. Carried, unchanged: USER 6/10 red; protocol/operator closure-checker debt
   (`corpus/lessons/round-16-verifier-spotcheck.md:153`); round-16 disclosed limits `:156`.

## Adjacency

`[pending: one-line summary of corpus/adjacency.tsv rows, verified count, and contested-open rows]`.
Round-16 precedent: kaidoku Core "Runtime observation (CDP)" overlap, reported not absorbed
(`corpus/lessons/round-16.md:113-116`).
