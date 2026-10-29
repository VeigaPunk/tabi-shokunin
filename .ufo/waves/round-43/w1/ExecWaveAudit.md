# ExecWaveAudit — dispatch audit (r41 defect class)

Seat: `ExecWaveAudit` · Wave: tabi round-43 w1 · Lane: `tabi` · Role: executor · Judged axis: **operability**
Milestone: dispatch audit (r41 defect class) · Lane repo: `/home/vgpnk/Projects/shokunin/tabi-shokunin` (read-only)
Scratch: `/fast/scratch/hyaku/tabi-r43/ExecWaveAudit/` (created, used, removed before yield).
Date: 2026-10-29. No tool was installed or updated (no pacman/uv/npm/cargo transaction; host pacman remains paused).

## Scope of the audit

The r41 defect class is a **dispatch-operability** defect: in round 41 the L1 wrote
`.ufo/waves/round-41/w1.ready` pointing at `w1-spec.json` — a file with **no `taskCall`** — the swarm
compile was skipped, and the dispatcher died with `KeyError(taskCall)`, so the wave never ran.
`round-41/w1.ready.dispatched` records that verbatim:

```
never-dispatched: ready pointed at w1-spec.json (no taskCall; swarm compile skipped); dispatcher KeyError(taskCall) 08:53+; L1 filed report 9fa5ad61 with queued-wave disposition (orchestrator 2026-10-28)
```

So the audit is: does round-43's ready → dispatch → taskCall chain carry a well-formed 64-seat
wave, and would the dispatcher have consumed it? (The wave had already been dispatched when this
seat ran — `w1.ready.dispatched` exists with 64 seat ids — so the audit is against the **committed
bytes**, which are identical to the worktree bytes; see C5.)

## Result summary

| # | Check (seat item) | Result |
|---|---|---|
| 1 | `taskCall` present in the dispatch file | **PASS** — key present, non-null, 64 tasks |
| 2 | `tasks` length 64 | **PASS** — 64 |
| 3 | names unique | **PASS** — 64 distinct, set == spec set, order == spec order |
| 4 | roles match `w1-spec.json` | **PASS** — 0 mismatches; role histograms identical |
| 5 | every task prompt BEGINS with the exact godspeed block | **PASS** — 64/64 byte-identical prefix |
| 6 | context names absolute paths under the lane repo | **PASS** — all lane-repo paths absolute under `…/tabi-shokunin`; the three out-of-lane absolute paths are the declared read-only prohibitions / tooling rules |
| 7 | `w1.ready` parses with lane/round/wave/dispatch/l1=TabiR43 | **PASS** — all five fields correct, dispatch path absolute and existing |
| 8 | r41 defect absent (ready target carries `taskCall`) | **PASS** — target parses and has `taskCall`; dispatcher consumed it (64/64 seat ids in the marker) |

**The r41 defect class is absent.** Two low-severity defects and one cross-seat misattribution were
found in the dispatch text and are reported below (F1, F2, O1). Neither F1 nor F2 blocked the seats
concerned: both seats delivered their milestones.

## Exact commands and observed output

All commands below were run from the lane repo `/home/vgpnk/Projects/shokunin/tabi-shokunin`
or with absolute paths. Full transcript: `evidence/checks.txt`; machine-readable results:
`evidence/audit.json`; the audit script: `evidence/audit.py`.

### C1 — ready file (the r41 defect locus)

```
$ cat .ufo/waves/round-43/w1.ready
{"lane":"tabi","round":43,"wave":"w1","dispatch":"/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/w1-dispatch.json","l1":"TabiR43"}
```

Parsed fields: `lane=tabi`, `round=43`, `wave=w1`, `l1=TabiR43` — all four match the required
values; `dispatch` is an absolute path under the lane repo, and the file it names exists.
The JSON parses (no trailing garbage, no BOM).

### C2 — the dispatch file carries a `taskCall` (the r41 `KeyError(taskCall)` guard)

```
$ python3 -c "import json;d=json.load(open('.ufo/waves/round-43/w1-dispatch.json'));print(list(d.keys()));print(type(d['taskCall']), len(d['taskCall']['tasks']))"
['schema', 'wave', 'policy', 'counts', 'registry', 'compaction', 'taskCall', 'resumeSends', 'note']
<class 'dict'> 64
```

`schema` = `ufo-swarm-wave-dispatch-v1`; `wave` = `tabi-r43-w1`; `counts` = `{spawn: 64, resume: 0, total: 64}`;
`resumeSends` = `[]` (one batched task call, no resume entries — matching the file's own `note`);
`policy.waveMinLanes/waveMaxLanes` = 64/128, so 64 seats is inside the lane band.

### C3 — the dispatcher actually consumed this wave

```
$ head -2 .ufo/waves/round-43/w1.ready.dispatched | cut -c1-120
2026-10-29T17:52:19
{"CritPredC1": "CritPredC1", "CritPredC2": "CritPredC2", "CritC1ReachDirect": "CritC1ReachDirect", …

$ python3 -c "... len(ids) and set(ids)==set(task names) ..."
marker seats 64 names match True
```

The `.dispatched` marker was written at `2026-10-29T17:52:19` with **64 seat ids whose names are
exactly the 64 `taskCall.tasks[].name` values**. Per `scripts/hyaku/inline-dispatcher.py:266-274`
the marker is written only after every seat in `taskCall.tasks[]` has been spawned and the
`<wave>.ready.partial` marker is removed — and no `w1.ready.partial` remains in the wave dir.
That is the strongest available evidence that the r41 failure mode did not recur: the dispatcher
read this `taskCall` and spawned the wave.

### C4 — names, roles, godspeed block

```
names unique: True | count 64 | set==spec True | order==spec True
role mismatches vs spec: 0
role hist dispatch: {'connector': 4, 'critic': 16, 'executor': 16, 'mutation-tester': 8, 'revenger': 1, 'reviewer': 6, 'scout': 5, 'scribe': 5, 'sentinel': 2, 'simplifier': 1}
role hist spec    : {'connector': 4, 'critic': 16, 'executor': 16, 'mutation-tester': 8, 'revenger': 1, 'reviewer': 6, 'scout': 5, 'scribe': 5, 'sentinel': 2, 'simplifier': 1}
tasks not beginning with the godspeed block: []
spec items not beginning with the godspeed block: []
godspeed skill body sha256: db88963cbdf5a0db22b460b284bf6f1d1f4abac9eaadb28bdb5e9bffe27be3bb
dispatch task == spec prompt + trailer for all 64: True
```

The exact block was taken from the installed skill, not from memory:
`/home/vgpnk/.agents/skills/godspeed/SKILL.md` → body after the YAML frontmatter →
prefix `"/skill:godspeed\n\n" + body + "\n"` (445 bytes). All 64 `taskCall.tasks[].task` and all
64 `w1-spec.json` `items[].prompt` begin with that exact byte sequence; there is **one** distinct
prompt prefix across the wave, so no seat was given a variant block.

Role parity is exact: every `tasks[].agent` equals the corresponding spec `items[].role`, the
role histograms agree, the dispatch registry (`registry.members`, 64 entries) agrees with the spec
on name/role/axes/milestone for all 64, and the live registry
`.ufo/waves/round-43/w1/swarm-registry.json` (64 members) agrees with the dispatch on role for all
64 with zero seat-dir orphans. Every role used is routable in the live host table
`~/.omp/agent/config.yml` (connector, critic, executor, mutation-tester, revenger, reviewer, scout,
scribe, sentinel, simplifier — all MAPPED).

Structural parity: each dispatch task is exactly the spec prompt plus the standard trailer
(`Lane bounds / Judged on / Milestone / Report:`); no task body is a duplicate of another's
(64 distinct bodies, 64 distinct milestone strings).

### C5 — committed bytes == worktree bytes

```
dispatch_worktree_sha256  == dispatch_committed_HEAD_sha256  -> True
spec_worktree_sha256      == spec_committed_HEAD_sha256      -> True
ready_worktree_sha256     == ready_committed_HEAD_sha256     -> True

$ git -C <lane> rev-parse b77e84a0:<path> vs HEAD:<path>
.ufo/waves/round-43/w1-dispatch.json b77e84a0=9d09aa6c… HEAD=9d09aa6c… same=YES
.ufo/waves/round-43/w1-spec.json     b77e84a0=f3a9e84b… HEAD=f3a9e84b… same=YES
.ufo/waves/round-43/w1.ready         b77e84a0=11486acd… HEAD=11486acd… same=YES
```

The wave files were committed in `b77e84a0` ("round-43: w1 spec (64 seats, attack 30/64) +
validated dispatch (taskCall) + ready handoff") and are unchanged at HEAD `ba433c94`. The audited
bytes are therefore the committed bytes, as required for an already-dispatched wave. The frozen
claim inputs are also unchanged between the freeze commit `7ca6f018…` and HEAD
(`claims.json`, `counters/c1-signature-bound-v5.mjs`, `counters/check-routed-defects-round43.mjs`,
`scripts/measure-c1-round43.mjs`: same blob ids at both revs).

### C6 — context paths

```
under lane repo:
  /home/vgpnk/Projects/shokunin/tabi-shokunin
  /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/claims.json
  /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/w1/<YourSeatName>/
outside lane repo (read-only prohibitions / tooling rules):
  /home/vgpnk/.omp/agent/RULES.md            exists=True
  /home/vgpnk/Projects/shokunin              exists=True
  /home/vgpnk/Projects/shokuknow             exists=True
```

Every lane-repo path in the context is absolute and under
`/home/vgpnk/Projects/shokunin/tabi-shokunin`. The three out-of-lane absolute paths appear only in
the two sentences that declare them READ-ONLY (fleet repo + `shokuknow`, and the operator's tooling
rules file) — i.e. the r39 `shokuknow` incident is named in the very context the seats received, and
no out-of-lane path is presented as a write target. The context also states the report-path rule
("Every `Report:` trailer path is relative to … write it at …/<that path>") and the scratch rule.

### C7 — per-seat report trailers

```
missing: [] | multi: [] | all under .ufo/waves/round-43/w1/: True | unique: True | count 64
```

All 64 tasks end with a well-formed trailer `Report: write your scoped findings to
.ufo/waves/round-43/w1/<Seat>.md`, one per seat, unique, all inside the wave dir, and the path
equals the seat's own name in every case.

## Findings

### F1 — two seat prompts name a path that does not exist (colon for slash) — LOW, non-blocking

Two of the 64 task texts carry a malformed absolute path, where a colon replaces the slash between
the repo root and the relative path:

| Seat | Malformed path as written | Intended target (exists) |
|---|---|---|
| `RevEvidenceR42` | `/home/vgpnk/Projects/shokunin/tabi-shokunin:corpus/evidence/round41/playwright-egress/receipt.json` | `…/tabi-shokunin/corpus/evidence/round41/playwright-egress/receipt.json` (1167198 bytes) |
| `ExecTsvBlobs` | `/home/vgpnk/Projects/shokunin/tabi-shokunin:.ufo/waves/round-42/quarantine/re-adjudication.tsv` | `…/tabi-shokunin/.ufo/waves/round-42/quarantine/re-adjudication.tsv` (2455 bytes) |

```
$ grep -o '[^ ]*tabi-shokunin:[^ ]*' .ufo/waves/round-43/w1-dispatch.json | sort -u
/home/vgpnk/Projects/shokunin/tabi-shokunin:corpus/evidence/round41/playwright-egress/receipt.json
/home/vgpnk/Projects/shokunin/tabi-shokunin:.ufo/waves/round-42/quarantine/re-adjudication.tsv;
```

Both literal paths are unopenable; a seat that copies one verbatim gets ENOENT and has to
re-derive the path. **Both seats nevertheless completed their milestone**: `ExecTsvBlobs` reports
"38 / 38 PASS — zero failing rows" reading the intended TSV, and `RevEvidenceR42` produced six
evidence files (`01-rev-parse-five-revs.txt` … `06-freeze-hash-typo.txt`) against the intended
receipt. So the defect is in the dispatch text, not in the wave's outcome. Severity: low — it costs
two seats a re-derivation step; it does not misdirect an attack or admit a claim.

**Routing (frozen bytes must not be amended).** The dispatch file is frozen at
`7ca6f018…`/`b77e84a0`; the fix belongs to the next round's spec generator, not to this wave. The
narrow shape to fix: a path is composed as `<repo-root>:<relpath>` instead of `<repo-root>/<relpath>`
in two task strings. A cheap guard for the next round: after the spec is written, resolve every
absolute path token in every prompt and refuse to dispatch if any does not exist (this audit's
`task_missing_refs` check does exactly that and reports the two seats by name).

### F2 — the r41-closure hash pointer is only a short hash in the cited evidence — LOW, non-blocking

`RevEvidenceR42` and `ExecPinProbe` are both told to obtain the full hash of the r41 closure from
the r42 wave evidence:

```
$ grep -o '123e55c[0-9a-f]*' .ufo/waves/round-42/w1/CritC2Ledger/report.md | sort -u
123e55c
$ git rev-parse 123e55c
123e55c77bb101be008db4cbf8ffca626423335a
```

The cited r42 evidence contains **only the abbreviated** `123e55c`, never the 40-hex form, so the
instruction "find the full hash from the r42 wave evidence" is not satisfiable from the named
source. It is satisfiable another way — the abbreviation is unique in the repo and
`git rev-parse 123e55c` resolves it — and both seats did resolve it (both have since written
evidence containing the full hash). The pointer is therefore imprecise, not broken. Same shape for
the next round's generator: cite a source that actually contains the string.

### O1 — cross-seat observation: a peer note misattributes a hash typo to the dispatch bytes

Not a defect in the dispatch — a note about another seat's receipt. `w1/RevEvidenceR42/06-freeze-hash-typo.txt`
states:

```
NOTE — one-nibble typo in seat/dispatch text for the freeze commit full hash.
Seat text and w1-dispatch say: 7ca6f018280b08dcc6c519e11ecc2c1ccbfc62bc
Repo object (git log, unique prefix): 7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc
```

That claim does not reproduce against the committed bytes. The dispatch file contains the **real**
freeze hash `7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc` **21 times** and the claimed mistyped
variant **0 times**; `git rev-parse 7ca6f018` returns exactly the hash the dispatch carries, and
the token extracted from the context by regex compares equal to it with zero differing positions.
The RevEvidenceR42 task text likewise contains the real hash twice and the variant zero times.

```
$ python3 -c "... count both variants in the dispatch bytes ..."
7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc occurrences in dispatch: 21
7ca6f018280b08dcc6c519e11ecc2c1ccbfc62bc occurrences in dispatch: 0
$ git rev-parse --disambiguate=7ca6f018
7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc
```

So the "typo" is a transcription artifact inside that seat's own note, not a property of the
dispatch. Recording it because it is exactly the kind of claim that, if accepted at integration,
would route a defect against frozen dispatch bytes that do not contain it. Every other 40-hex token
in the dispatch resolves: `15b75a73…`, `7ca6f018…`, `9b6de3a1…`, `ab592825…` are commits,
`8ff64d69…` is the pinned measure **blob** (as intended).

## Additional observations (not defects)

- **O2 — report-path convention is inherited, not a defect.** The wave context says report and
  evidence files go only under `…/w1/<YourSeatName>/`, while each seat's `Report:` trailer points
  at the flat `…/w1/<Seat>.md`. Round 42 has the identical shape and produced both forms
  (`round-42/w1/ConnSelfOverlap.md` plus `round-42/w1/ConnSelfOverlap/report.md` and evidence
  files). This seat therefore writes the report at the trailer path
  `.ufo/waves/round-43/w1/ExecWaveAudit.md` **and** an identical copy plus evidence under
  `.ufo/waves/round-43/w1/ExecWaveAudit/`, which is the r42 precedent.
- **O3 — no seat is asked to commit, push, or mutate git/jj.** A scan of all 64 task bodies for
  commit/push/`jj-lane`/`fleet-commit` instructions returns only two hits, both about git *object
  types* inside fixture repos (`CritC2Blob`, `ExecFixtureRepro`). No prompt asks a seat to write
  outside the wave dir; the only production-tree paths named in write-position are
  `corpus/knowledge/committed-bytes-verification-round-42.md` and `SCORECARD.md`, and both of
  those seats are explicitly told to draft **into the seat dir, NOT the production tree**
  (`ScribeEntryAuth`: "Draft (into your seat dir, NOT the production tree)").
- **O4 — egress surface is inside the declared envelope.** Only two prompts name an external URL:
  `RevS150` → `https://nodejs.org/docs/latest-v24.x/api/crypto.html` and `RevS151` →
  `https://git-scm.com/docs/git-cat-file` — both named-source re-opens (read-only HTTP GET), which
  the wave contract permits. Both URLs are already staged locally under
  `.ufo/waves/round-43/sources/` (`crypto.html`, `git-cat-file.html`), so the seats need not fetch
  at all.
- **O5 — one prompt depends on reaper-eligible scratch.** `SentEgressAudit` is pointed at
  `/fast/scratch/hyaku/tabi-r43/L1-measure/failed-run-1/`, which exists now but is scratch. The
  prompt already tells the seat to copy what it cites into its seat dir; the risk is that the L1
  integrates before the seat has done so. Not a dispatch defect.

## Limitations

- The audit is a **static** read of the committed dispatch/spec/ready bytes plus the dispatcher's
  own consumption record. It does not re-run the dispatcher; the evidence that the dispatcher
  consumed the wave is the `.dispatched` marker (64 seat ids, names equal to the task names) and the
  absence of `.ready.partial`.
- Seat *outcomes* are out of scope: at audit time 27 of 64 seat dirs and 11 flat reports existed;
  this report says nothing about any seat's verdict, only about the dispatch text.
- The frozen commit `7ca6f018…` and the counter/claims/checker bytes were read only. No amendment
  is proposed; F1/F2 are routed as next-round generator defects.
- `~/.omp/agent/config.yml` was read to confirm role routability; the routing table is
  operator-owned and was not modified.
- The god-speed block was compared against the *installed* skill file. If the operator's canonical
  block changes later, this comparison must be redone against the new file.

## Evidence paths

- `.ufo/waves/round-43/w1/ExecWaveAudit/report.md` (this file)
- `.ufo/waves/round-43/w1/ExecWaveAudit.md` (identical copy at the `Report:` trailer path)
- `.ufo/waves/round-43/w1/ExecWaveAudit/evidence/checks.txt` — the command/output transcript quoted above
- `.ufo/waves/round-43/w1/ExecWaveAudit/evidence/audit.json` — machine-readable check results
- `.ufo/waves/round-43/w1/ExecWaveAudit/evidence/audit.py` — the audit script (re-runnable read-only)

Scratch `/fast/scratch/hyaku/tabi-r43/ExecWaveAudit/` was removed on yield. No file outside
`.ufo/waves/round-43/w1/ExecWaveAudit*` was written; no commit, push, fetch, or git/jj mutation was
performed anywhere.

VERDICT finding r41 defect class absent (ready→dispatch with taskCall, 64 unique seats, roles match spec, all 64 prompts begin with the exact godspeed block, ready parses lane/round/wave/dispatch/l1=TabiR43, dispatcher consumed the wave); two LOW non-blocking dispatch-text defects found — F1 two seat prompts name an unopenable colon-instead-of-slash path (RevEvidenceR42, ExecTsvBlobs; both seats still delivered), F2 two prompts point at a full hash the cited r42 evidence does not contain (abbreviation only; both seats resolved it) — plus O1, a peer note misattributing a freeze-hash typo to the dispatch bytes that are clean.
