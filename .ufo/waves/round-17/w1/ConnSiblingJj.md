VERDICT: PASS

# ConnSiblingJj — sibling-overlap scan for C1 (jj-safe lane-tip anchoring)

Seat `TabiR17.ConnSiblingJj-2`. Read-only on LANE and all 20 siblings; only this report written.
Reads at 2026-10-20T12:48–12:51-03:00. No `jj`, no git write; no tool installed.

## Method

`git -C <lane> for-each-ref refs/heads` + `rev-parse HEAD refs/heads/<b> refs/remotes/origin/<b>`
(branch/HEAD census, 20 lanes); `grep -rn "refs/heads|symbolic-ref|show-ref|for-each-ref"` over
`*/scripts` + `*/tools` and `grep -rn "rev-parse HEAD|merge-base --is-ancestor.*HEAD"` (implementation
census); `git -C <lane> blame -L` and `log --since=2026-10-18` (policy provenance); routed audits
`JjAuditTabi.md`, `JjTrialTabi.md`, the six sibling jj audits, `JjAuditInlineSh/FleetCommit/
ClosurePrompt/GameDev3d.md`.

## Findings

### S1 — No sibling ships a lane-tip helper in lane tooling; the pattern is fleet-level

`grep -rl refs/heads <lane>/scripts <lane>/tools` → only `souji` (97 files, census/quarantine code),
`kotodama` (1 file), `tabi` (4 files, this round's in-flight C1 edits). No sibling has `laneTip`;
`symbolic-ref` appears in no sibling `scripts/`, only in souji's worktree-list parser
(`tools/souji-verify.impl-13.sh:140-150`). tabi is the first lane to put the anchor inside its own
gates — the novelty C1 prices; there is no sibling implementation to copy wholesale.

### S2 — The reusable resolver is `detect_branch`; one sibling is already citing it

- `scripts/hyaku/jj-lane.sh:53-65` `detect_branch`: `symbolic-ref -q --short HEAD` → else
  `symbolic-ref -q refs/remotes/origin/HEAD` → else `show-ref refs/heads/master` →
  `refs/heads/main` → first local branch. `:68-90` `print_state` reads `rev-parse --verify -q
  refs/heads/$branch` and `refs/remotes/origin/$branch`; `symbolic-ref -q HEAD` (`:77`) only labels
  `head=attached|detached`. This is the fleet's only lane-tip definition that already survives jj
  (`JjAuditInlineSh.md:38`; `JjAuditSouji.md` F8).
- `scripts/hyaku/inline.sh:37` `lane_tip() { st_field "$(jjl state "$1")" local; }` is the fleet's
  operational "lane tip"; consumed at `:129` (`lane tip <hash>`) and for closure `{{HEAD}}`
  (`HEADC=$(lane_tip …)`).
- **In-flight sibling convergence**: `tameshi-shokunin/SKILL.md:1027-1035` (`current` row `:1033`;
  blame "Not Committed Yet 2026-10-20" — a concurrent round-17 seat, not landed) adopts
  `tip=$(git rev-parse --verify --quiet --end-of-options "refs/heads/<branch>^{commit}")` with
  `<branch>` per `detect_branch` (`../scripts/hyaku/jj-lane.sh:53-65`), unresolvable → SETUP rc 2,
  and "never a jj working-copy `HEAD` (`@-`), which no remote has (round 17)". That is PLAN §C1's
  primitive verbatim, independently derived; the delta is that tameshi resolves `<branch>` while
  §C1 hardcodes `refs/heads/master` in the detached arm.

### S3 — Landed sibling counter-pattern: local tip = "committed", remote ref = "pushed"

`souji-shokunin/SKILL.md:35` (landed b5db5cf, 2026-10-18) defines `pushed` against the resolved
default ref (`refs/remotes/origin/HEAD`, else the single `refs/remotes/origin/*`, existing refs
only, never fetch) and explicitly says "NEVER a local ref such as `refs/heads/master`". Code:
`tools/souji-verify.impl-12.sh:138-158`, `impl-13.sh:153-176` `resolve_default_ref`, consumed with
`merge-base --is-ancestor "$intro" "$ref"` (`impl-12.sh:225`, `impl-13.sh:326`), unresolvable →
`pushed-unverifiable` (never SAFE). Together with S2 this is a **two-question split**, not a
disagreement: committed content → local branch tip; landed/pushed → remote default ref. §C1 asks
the first question, so `refs/heads/master` is the correct side; C3's `sibling_ref` asks the second
(S4).

### S4 — Conflict: §C1's literal `refs/heads/master` cannot be reused for sibling refs

Branch census (20 lanes): **13 `master`, 7 `main`-only** — audio, game-dev-2d, game-dev-3d,
kaidoku, kotodama, lore, revenger. In tabi:

```
$ git symbolic-ref -q HEAD                                              # rc=1, detached
$ git rev-parse --verify --end-of-options 'refs/heads/master^{commit}'  # 5859243183c4… rc=0
$ git rev-parse --verify --end-of-options 'refs/heads/main^{commit}'    # fatal: Needed a single revision, rc=128
```

For tabi's gates the hardcode is correct and fails loudly (exit 2 `could_not_evaluate`, anchor
named) — the shape PLAN specifies. But `scripts/check-adjacency.mjs` and
`.ufo/waves/round-17/measure-c3.mjs` resolve *sibling* tips via `sibling_ref =
<lane>-shokunin@<40-hex>:<path>:<line>`; with `master` hardcoded, 7 of 20 rows exit 2 or pin an
unintended ref. PLAN's C3 contract states no anchor rule for `sibling_ref` at all — the gap. Needed
rule: the `detect_branch` ladder over existing refs, then
`rev-parse --verify --end-of-options "refs/heads/<branch>^{commit}"`, else exit 2.

### S5 — Detached-HEAD state of the sibling set is latent today

```
kaidoku  main    HEAD=9011581d8 tip=9011581d8 origin=9011581d8 HEAD<=tip:yes
kama     master  HEAD=cff9e62f0 tip=cff9e62f0 origin=cff9e62f0 HEAD<=tip:yes
mado     master  HEAD=d3a00003e tip=d3a00003e origin=d3a00003e HEAD<=tip:yes
souji    master  HEAD=5fa6017dd tip=5fa6017dd origin=5fa6017dd HEAD<=tip:yes
tabi     master  HEAD=585924318 tip=585924318 origin=585924318 HEAD<=tip:yes
tameshi  master  HEAD=98bea7da5 tip=98bea7da5 origin=98bea7da5 HEAD<=tip:yes
tsukuroi master  HEAD=6923fe0bd tip=6923fe0bd origin=6923fe0bd HEAD<=tip:yes
```

All seven are detached **and** exactly on the branch/remote tip, so no lane shows the divergence
class live; arm B is what exposes it. Two facts the counter must respect: tabi carries seven
`refs/jj/keep/*` refs including `…/keep/5859243183c4…`, and keep-reachability is not branch
reachability (`JjAuditSouji.md` F3), so arm C must use `refs/heads/master` ancestry, never
`--all`/`for-each-ref`; and tabi's production `symbolic-ref` is rc=1, so arm A is the only arm
exercising the attached path.

### S6 — Residual sibling HEAD reads (context, not conflicts)

`kumitate/scripts/round-gate.mjs:373,1089,1112,1334`, `cite-check.mjs:1678,1866`; `kake/
scripts/freshness-sweep.mjs:701,703,854,856` (pairs `rev-parse HEAD` with `ls-remote origin main` +
`rev-list --count origin/main..HEAD` — no-fetch remote tip, the best landedness primitive seen);
`game-dev-3d/…/gate/run_gate.sh:98,210,229` (`LANE_HEAD`; its audit `JjAuditGameDev3d.md:52-56,186`
already recommends `refs/heads/main`, not applied). None is colocated → unadopted convention, no
collision with tabi.

### S7 — Routing note inside LANE (observed mid-wave, not a sibling overlap)

At 12:49–12:51 all four C1 gate files were dirty (` M check-round-contract.mjs,
check-user-round-contract.mjs, check-measurement-binding.mjs, selftest-measurement-binding.mjs`);
their `laneTip` bodies match §C1 (`check-measurement-binding.mjs:253-278`: name regex
`^refs/heads/…$`, `rev-parse --verify --end-of-options`, exit-2 refusals).

- `check-round-contract.mjs:597` and `check-measurement-binding.mjs:876` resolve once and thread.
  `check-user-round-contract.mjs` re-resolves at `:188`, `:251`, `:273`, `:285`; `:188` sits in
  `committedBlob`, which `pointerResolves` (`:196`) calls per backticked candidate on every SHONEN
  line (`:235`; 9 candidates today). That contradicts PLAN's "resolve ONCE per process" — two extra
  git spawns per candidate, and two possible tips inside one run if the branch moves.
- The name guard must stay: jj's `ref: refs/jj/root` state (`JjAuditInlineSh.md` F8) then exits 2
  instead of anchoring.

## Proposed move (one, bounded)

Make the anchor a **two-tier rule in the cross-repo resolvers only**: `scripts/check-adjacency.mjs`
and `.ufo/waves/round-17/measure-c3.mjs` resolve each sibling's branch with the `detect_branch`
ladder over existing refs, pin the **local** tip, and record the origin tip as a separate field
without requiring equality. Tabi's three C1 gates keep `refs/heads/master` as frozen.

- Axes: C3 improves (sibling rows verifiable for the 7 `main` lanes, no fail-open); C1 unchanged
  (same primitive/arms, lane-local literal untouched); C2 untouched.
- Why non-obvious: siblings already run two different anchors for two different questions (S2
  local, S3 remote); hardcoding either into a cross-repo resolver is wrong for half the set, and
  C3 states no anchor.
- Risks: origin equality would red on concurrent legitimate sibling work → record-only; the
  "first local branch" fallback can pick a `wt-*` ref (audio, game-dev-2d carry several) → restrict
  to master/main and exit 2 rather than guess; a sibling mid-`jj commit` yields its previous
  landing, the same safe direction as tabi's gates.
- Verification: counter probes must show a `main`-only sibling resolving (kaidoku/revenger), a
  `wt-*`-only repo not resolving to it, a missing branch exiting 2, and arms A/B/C unchanged.

## Verification performed

Every command above was executed; outputs are quoted inline. No sibling gate, no LANE gate and no
selftest was run. Untested: [INFERENCE] that `detect_branch` resolves identically under jj 0.45.1
when `refs/remotes/origin/HEAD` is unset and the only local branches are per-round `wt-*` — that
fallback order is read from source, not measured.

Files written:
- .ufo/waves/round-17/w1/ConnSiblingJj.md
