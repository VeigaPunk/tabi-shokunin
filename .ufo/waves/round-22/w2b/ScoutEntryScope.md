# ScoutEntryScope — round-22 knowledge/evidence entries vs PROVINCE.md

Revision reviewed: `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` (committed, pushed).
Method: static, read-only, `git show REV:PATH` only. No lane script executed, no browser,
no install. Confidence is high on every path/line quoted below; the only judgement call is
severity, stated per finding.

## Verdict

1. **F1 (real defect, adjacency/quality):** the round introduces a kumitate-adjacent surface
   (seat wake/broadcast/first-terminal classification) that `corpus/QUALITY.md:134-139`
   criterion 32 requires be dispositioned in a committed `corpus/adjacency.tsv` row. No such
   row exists at `e3cf4e0` (10 rows, `base..tip` diff empty), and the round's own W1 seats
   routed the issue (`ConnProvince.md:116-124,142-145`, `CriticScope.md:88-98`). A clean
   `check-adjacency` (`rows=10 verified=10`) certifies the present rows only; criterion 32 says
   so in its own closing sentence.
2. **F2 (real defect, calibration/adjacency):** `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md:64-104`
   absorbs fleet wake/routing/capacity facts into the domain knowledge corpus, against
   `PROVINCE.md:20` “Out of province → report, never absorb.” The section is duplicative of
   `.ufo/waves/round-22/w1/WakeHistory.md:11-21` and `round21-closure.json`
   (`wave_conformance_debt`), so removing it loses nothing.
3. **F3 (real defect, claim accuracy):** `LOG.md:1542-1543` says the classifier “is a local
   browser-evidence guard only” and `SKILL.md:2422` presents a generic wake rule, while
   `check-review-chronology.mjs:24-28,146-151` emits `peer_revival_after_failure`,
   `routing_broadcast`, `late_failure` from a free-standing supplied event array. The
   artifact's own `:210` `scope_limit` already disclaims wake authority; the description does
   not match the artifact.
4. **C1 (clean negative): no CDP-lease bleed.** Zero `\blease\b`, `9222`, `musketeer` in
   either round-22 corpus entry; the note explicitly refuses default-profile claims
   (`:108-112`). The contested lease rows (`adjacency.tsv:7-8`) and 9222 census row (`:11`)
   are untouched.

## Entries in scope (the whole round-22 corpus delta)

- `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md` (new, 115 lines,
  sha256 `6f6439558531d7f51bc7c47fa90e38f5133db9ee94473a3c05ed27181893116e`).
- `corpus/evidence/round-22/semantic-expectations.json` (new, 189 lines,
  sha256 `4a693dce44b1161df5ced71fd2739ff4a1a4147d893b83dfc780d92cc5b60e1e`).
- No `corpus/lessons/round-22.md` exists at the revision (`git cat-file -t` → fatal, 128);
  `run-checks.py:84` merely allowed it.
- Claim carriers that make the entries citable, hence reviewed with them: `SKILL.md:2408-2441`,
  `LOG.md:1499,1542-1543`, `SCORECARD.md:1043-1069`, `corpus/README.md:501-505`,
  `corpus/SOURCES.md:115,155`.

## F1 — new kumitate-adjacent surface is not dispositioned (blocking for “conformance repair”)

Observed facts:

- `PROVINCE.md:6-13` owns CDP/browser interaction; `:15-19` refuses forensics/publishing/secrets;
  `:20` is the operative rule: `**Out of province → report, never absorb.**`
- Kumitate at its lane tip `2fa28e5761220ee5b1c625bbb81ed5677c4522d6`:
  `PROVINCE.md:3` “**Domain:** orchestration & tooling — scopes OMP task/hub, ufo-fsd scripts &
  runtime”; `:6` “report cross-domain evidence back to the orchestrator rather than absorbing
  it”. (`git -C kumitate-shokunin rev-parse master` → `2fa28e5…`, exit 0.)
- The landed classifier implements the routed-away half:
  `.ufo/waves/round-22/check-review-chronology.mjs` (369 lines, sha256 `9e3f976c…8cc3`)
  `:113` `function eventHistory`, `:132-136` `firstTerminalIndex`/`first_terminal`,
  `:146` `peerRevival`, `:148` `routingBroadcast`, `:150` `lateFailure`,
  `:151` finding emission, `:160` per-seat field, `:24-28` `FINDING_ORDER` containing
  `peer_revival_after_failure`, `routing_broadcast`, `late_failure`.
  `.ufo/waves/round-22/debt-expectations.json` (935 lines) pins 17 cases, including those
  three at `:58`, `:132`, `:192`.
  `SKILL.md:2436` registers it as `Owner tabi`, kind `gate`.
- `corpus/adjacency.tsv` at the revision: 10 rows; row 10 is the precedent for this sibling
  (`kimi-webbridge-plugin-internals`, kumitate, `split-declared`). No row names
  review chronology / wake / seat status. `git diff 5f58577..e3cf4e0 -- corpus/adjacency.tsv`
  is empty (no add this round).
- The lane's own W1 seats already routed it: `.ufo/waves/round-22/w1/ConnProvince.md:118-124`
  (“any output asserting wake completeness, first-terminal vs latest status, revival, broadcast
  routing or dispatch correctness is routed to kumitate; tabi asserts only ‘the declared input
  says X’”), `:142-145` (proposes a row it says does not exist), `:180-181` (risk: absorbing
  orchestration); `.ufo/waves/round-22/w1/CriticScope.md:88-98` F6 (“Route to kumitate … not
  implement: per-seat event ordering, wake/broadcast classification, and first-terminal versus
  latest status across fleet seats”).
- `corpus/QUALITY.md:134-139` criterion 32 is the checkable rule: “A scope overlap with a
  sibling lane is dispositioned in a committed `corpus/adjacency.tsv` row … A clean checker
  certifies citations and venues, not bilateral agreement.”
- Worktree receipt `.ufo/waves/round-22/checks-at-e3cf4e0.json` (exists on disk, **not** in the
  revision; `??` in `git status`) records `check-adjacency-production` exit 0 with
  `ADJACENCY verdict=clean rows=10 verified=10`. That is exactly the incomplete signal
  criterion 32 warns about.

Smallest counterexample with preserving positive: adjacency row 10 shows a kumitate-adjacent
surface *is* normally dispositioned (`split-declared`, quotes on both sides); the new
review-chronology surface is the same class and has no row. The positive control proves this is
not a map-wide convention change, only one missing disposition.

Axis: adjacency (absorbing sibling ground), operability (a new general tool claimed as a tabi
gate). Not a browser-semantics request.

Smallest fix — one row, valid under `scripts/check-adjacency.mjs:77` (only
`ruled|contested-open|split-declared|refused-route`; ConnProvince's proposed token
`retained-input-only` would be `disposition_unknown`, so do not land it verbatim):

```
review-chronology-vs-orchestration-status	kumitate	kumitate-shokunin@2fa28e5761220ee5b1c625bbb81ed5677c4522d6:PROVINCE.md:6	report cross-domain evidence back to the orchestrator rather than absorbing it	PROVINCE.md:20	Out of province → report, never absorb.	split-declared	-	Out of province → report, never absorb.
```

Constraint on landing it this wave: `corpus/adjacency.tsv` is in
`.ufo/waves/round-22/preservation-baseline.json` `files` (frozen blob) and is **not** in
`mutableDocs` (`['LOG.md','SCORECARD.md','SKILL.md','corpus/QUALITY.md','corpus/README.md','corpus/SOURCES.md']`),
and `run-checks.py:82-87` rejects any `M` outside `mutableDocs`. So the row needs a declared
mutable-doc/re-pin plus the 35-check cohort, **or** it is owed debt and the scope-creating claim
must not land (that is F2/F3's fix). Either way the row text above is the complete remedy.

## F2 — corpus knowledge note absorbs fleet wake/routing semantics

Observed facts (`corpus/knowledge/webmcp-lifecycle-oracle-round-22.md`):

- `:64` “## Review chronology and wake-history correction”; section body `:64-104`.
- `:66` cites fleet `MANIFEST.json rounds[417]` closure as superseding lane reporting.
- `:69-72` “a Main routing broadcast reached55 W1 seats, including23 already failed;24 failed
  seats showed post-broadcast activity, and20 later failure notices appeared. Three
  initially Zai-failed seats later exhausted Codex capacity … Only two productive writer
  revivals had been disclosed”.
- `:78-81` “55 broadcast deliveries/23 retry-exhausted recipients,46 peer messages on8 seats,9
  peer deliveries to terminal seats, and3 post-dispose peer deliveries on2 seats (BuildSelftest
  twice, BuildCounter once). Hub “woken” is not a terminal-state classification.”
- `:84-87` causal/status reading of “peers revived BuildRuntime/BuildCounter”.
- `:99-104` restates the classifier's scheduler epistemics (“absent history is unavailable, not
  an empty event list proving no wakes”).
- Mitigation credited and preserved: `:99` “not a scheduler or actor-authentication system”,
  `:104` “Broader host orchestration belongs to its existing owner”; `:106-115` limits; `:2`
  “not a new browser execution”.

Why this is absorption rather than report: a definition (“hub ‘woken’ is not a terminal-state
classification”), reconciled count sets, and a causal attribution are new domain facts now
carried by `corpus/knowledge/`, the lane's citable knowledge surface
(`corpus/README.md:505` indexes the note as an oracle note only — the indexed description does
not include this material, so it is unreferenced extra scope). The same facts already exist in
`.ufo/waves/round-22/w1/WakeHistory.md:11-21` and `round21-closure.json`
(`wave_conformance_debt`), which the note itself cites (`:78`, `:66`).

Smallest counterexample with preserving positive: the canonical prior note
`corpus/knowledge/webmcp-nonautosubmit-round-21.md` contains **zero** occurrences of
`wake|broadcast|seat|scheduler|revival`, yet supported the round-21 canonical claim; an
in-province note needs none of this. (The note's own in-province parts — case table `:29-53`,
limits `:106-115` — are unaffected by removing `:64-104`.)

Smallest fix: replace `:64-104` with 3–4 lines: name only the review-scope defect (W2's report
certified bounded bytes, not the finalized bytes), state that wake/routing history is
kumitate-owned and retained as debt, and point to `round21-closure.json` +
`w1/WakeHistory.md`; keep no counts, no status definitions, no causal attribution. The note is
new at this revision and its body is not gate-pinned (the digest `6f64395…` appears only in
`.ufo/waves/round-22/review-snapshot.json:218`, a wave review artifact with no consumer found by
grep; the pinned digest is `semantic-expectations.json` `4a693dce…` at `measure-c1.mjs:22`), so
this edit is possible in-round; header `:1-3` stays untouched.

F2b (minor, same axis): `SCORECARD.md:1053-1055` says the “Historical W1 wake-history … defects
are corrected append-only this round”, but the note's own `:75` says the broader surface is
“retained as debt”, and the lane cannot correct host wake history. Word it as “recorded and
routed to kumitate; debt retained” in a new appended entry (SCORECARD is append-only via
`mutableDocs` prefix checks).

## F3 — LOG/SKILL description contradicts the classifier's actual scope

Observed facts:

- `LOG.md:1542-1543`: “Generic scheduler semantics stay sibling-owned; this round's classifier
  is a local browser-evidence guard only.”
- `SKILL.md:2422`: “| Failed seat later receives IRC/broadcast | Retain first-terminal failure,
  wake/activity and later failures separately | Final-status-only history, treating unavailable
  history as no wakes, or all-actor settlement from a task-return barrier |”.
- `SKILL.md:2436` registers “finite review-chronology/history classifier | gate … | tabi”.
- The artifact: `check-review-chronology.mjs:24-28,113-167` classifies seat `first_terminal`,
  `latest_observed_status`, `peer_revival_after_failure`, `routing_broadcast`, `late_failure`
  with no dependence on the browser acquisition block; its honest bounds are `:207`
  `basis: 'copied from supplied records; not independently authenticated'` and `:210`
  `scope_limit` (“… wake/dispatch authority … not assessed”).
- The round's own retained input exercises none of it:
  `.ufo/waves/round-22/historical-chronology-input.json:233` — “Event history deliberately
  absent: broader history is retained separately in w1/WakeHistory.md, never fabricated into
  this review record”; the worktree receipt row `historical-review-scope-red` reports
  `findings=["review_scope_gap",…,"event_history_unavailable"]`.
- `SKILL.md:2438-2441` does disclaim complete wake history and general scheduler quiescence
  (preserving positive: the distilled limits are correct; only `:2422`/`:2436` overstate scope).

Impact: a reader of LOG/SKILL would conclude the gate does not classify seat wake events, while
the finding vocabulary and fixture cases do exactly that; and the round's claim “no generic
scheduler takeover” (the wave's own attack framing) is not true at the documentation surface.

Smallest fix (two mutable docs, no code change): (a) append one correction line to `LOG.md`
(“the classifier's event half is as-supplied only; wake/dispatch authority routes to kumitate;
adjacency row owed”); (b) reword `SKILL.md:2422` first column to “Supplied event record shows a
failed seat then a message/activity”, Required evidence “caller-supplied ordered record;
classification is as-supplied, never wake completeness”, keeping `:2438-2441`. If code edits are
allowed instead, deleting the `eventHistory` branch (`:113-167`) removes both F2's subject and
F3 in one move; the actual receipt stays `review_scope_gap` with `event_history_unavailable`,
so nothing observed depends on it. w2b is review-only, so the doc fix is the in-wave remedy.

## C1 — CDP leases and other out-of-province surface: clean

- `grep -c` on both entries at the revision: note `\blease\b` 0, `9222` 0, `musketeer` 0;
  `semantic-expectations.json` `\blease\b` 0, `9222` 0, `musketeer`/`scheduler`/`wake`/
  `broadcast`/`seat`/`orchestr` 0.
- The note's limits `:108-112` explicitly do not establish “default profile” behaviour; its
  cases `:35-48` are fixture-local (no shared endpoint, transport or lease claim). The
  expectations' `environment.flags` `:23-28` are the same requested flags as round 21, not an
  effective-argv or transport attestation.
- `corpus/adjacency.tsv` lease/census rows `:7-8` (musketeer lease, `contested-open`) and `:11`
  (live 9222 census, `contested-open`) are byte-unchanged (diff empty), matching the round-21
  `ConnectProvince.md:15,41-42` boundary that these stay open and untouched.
- `semantic-expectations.json` is in province end-to-end: 12 finite browser cases, exact
  diagnostic strings, fixture/producer digest pins; no scheduler or lease field.

No claim of malicious-author authenticity, general browser semantics or a new feature is made
here, and none is treated as a finding. The report does not assert that the wake counts are
wrong (they are host-owned); it asserts only that tabi is not their venue.

## Unrun checks and limits

Not run (deliberately): any `.ufo/waves/round-22/*.mjs`/`.py` (measure-c1, check-review-chronology,
selftests, run-checks), `scripts/check-adjacency.mjs`, any browser/CDP, any install, any VCS
write. The 35/35 cohort is quoted only from the worktree receipt
`checks-at-e3cf4e0.json` (untracked), not re-executed; `checks-pre-w2-0f24164.json` was not read
in full. Exercised (all read-only): `git rev-parse HEAD` (0), `git show REV:PATH` (0, many),
`git diff --stat 5f58577..e3cf4e0 -- corpus/adjacency.tsv` (0, empty), `git cat-file -t
e3cf4e0:corpus/lessons/round-22.md` (128, absent), `git -C kumitate-shokunin rev-parse master`
(0 → `2fa28e5…`), `sha256sum` over `git show` output (0), `grep`/`python3` JSON reads (0). One
mixed call `git -C kumitate-shokunin rev-parse master main` exited 128 (unknown `main`); re-run
per-ref above. No files written except this report.

Report: .ufo/waves/round-22/w2b/ScoutEntryScope.md
