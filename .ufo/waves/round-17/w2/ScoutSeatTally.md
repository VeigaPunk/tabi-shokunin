VERDICT: ISSUES

# ScoutSeatTally — wave-1 seat/role/delivery re-count (round 17, wave 2)

Attacked: the wave-1 head-count claim resting on `.ufo/waves/round-17/w1/`:
86 assigned seats, the role mix, the dispatch refusal/retry record, delivery vs death, and
the three seats revived after the L1 parent-429 restart (C2Harness, C3Checker, C3Counter).
All numbers below are observed; inference is labelled.

## Tally (observed)

| measure | value | evidence |
|---|---|---|
| spec items | 86 | `spec.json.items` |
| assignments entries | 86 (ids unique) | `assignments.json` |
| registry members | 86, roles = spec roles, ids = assignments ids | `swarm-registry.json` |
| reports on disk | 86, one-to-one with seat names | `ls w1/*.md`, `comm` both empty |
| zero-byte reports | 0; smallest `DraftLog.md` 2157 B | `stat`/`wc -c` |
| dispatch attempts | 2: attempt 1 refused=86 spawnedText=false; attempt 2 refused=0 | `dispatch-attempts.json` |
| attempt-2 spawn ids | 86 unique = assignments set exactly (0 missing, 0 extra) | parse of `dispatch-result.json` text |
| validation bookkeeping | `{spawn:86, resume:0, total:86}`, compaction applied=false, resumeSends=[] | `validation.json` |
| first-line report verdicts | 53 PASS, 30 ISSUES, 3 header-only | `for f in *.md; do sed -n 1p "$f"; done` |

Evidence command (run at lane root; output quoted above):

```
cd .ufo/waves/round-17/w1 && python3 - <<'PY'
import json,os,collections
spec=json.load(open('spec.json')); items=spec['items']; a=json.load(open('assignments.json'))
mds={f[:-3] for f in os.listdir('.') if f.endswith('.md')}
print(len(items),len(a),len(mds),sorted(mds-set(a)),sorted(set(a)-mds))
print(dict(sorted(collections.Counter(i['role'] for i in items).items(),key=lambda kv:-kv[1])))
print(json.load(open('dispatch-attempts.json')))
print(json.load(open('validation.json'))['counts'])
PY
```

## Exact role mix (spec.json roles; registry agrees)

| role | n | seats |
|---|---|---|
| scout | 22 | AdjKagi, AdjKaidoku, AdjKake, AdjRevenger, AdjSweep1, AdjSweep2, ReconIdentityChain, ReconJjHelper, ReconL0, ReconMistakes, ReconReadmeFrontier, ReconRegistry, ReconReportR16, ReconWebmcpNote, SrcBlinkInvoke, SrcChromeDocsInvoke, SrcDevtoolsInvoke, SrcExplainerExec, SrcJjColocation, SrcPdlInvoke, SrcSpecExecute, SrcWebTests |
| executor | 19 | C1Counter, C1JjRealProbe, C1SiteInventory, C2Counter, C2Harness, C2ProbeConcurrency, C2ProbeControls, C2ProbeDeclarative, C2ProbeErrorPaths, C2ProbeFrames, C2ProbeLifecycle, C3Checker, C3Counter, GateBindAnchor, GateRoundAnchor, GateUserAnchor, HarmBaseline, RoutedHardened, RoutedLiar |
| reviewer | 12 | RevAuditSites, RevBindAtDefault, RevCensusStart, RevF3Repro, RevF6Repro, RevHarmPlan, RevKaidokuRuling, RevPlanC1, RevPlanC2, RevPlanC3, RevRouted12, RevSkillJjRule |
| scribe | 9 | DraftLesson, DraftLog, DraftNote, DraftProvince, DraftQuality, DraftReadme, DraftScorecard, DraftSkill, DraftSourcesLog |
| connector | 8 | ConnAdjAxis, ConnFleetBinding, ConnFrontierRows, ConnProvinceRuling, ConnQualityRouted, ConnSiblingJj, ConnSiblingWebmcp, ConnTrendsHarm |
| critic | 6 | CriticC1, CriticC2, CriticC3, CriticLowestAxis, CriticRoutedFix, CriticTrends |
| revenger | 4 | RevBinaryInvoke, RevDevtoolsPak, RevJjHead, RevR16Liar |
| sentinel | 2 | SentinelAnchor, SentinelBrowser |
| mutation-tester | 2 | MutBindSelftest, MutRoundSelftest |
| simplifier | 2 | SimplifyAnchor, SimplifyC2Reuse |
| **total** | **86** | |

## Delivered vs died

No permanently dead seat: all 86 seat names have a report, and the attempt-2 spawn list covers
the assignment set exactly. Nine reports landed after 13:05 (the L1 restart window); six of those
seats were live (four answered L1 repair messages — `history://TabiR17:233-247` async-results for
RoutedHardened, GateBindAnchor, GateUserAnchor, C1Counter; GateRoundAnchor and SimplifyAnchor
completed on their own), and three were revived.

Revived (observed act, report mtime):
- C2Harness — 13:50:38; C3Checker — 13:53:42; C3Counter — 14:05:48 (latest of all 86).

Revival evidence (`history://` row numbers are transcript rows from `read history://...`):
- `history://TabiR17:231` — `[irc] Main → me: Orchestrator recovery steer: your r17 session
  exited on Anthropic 429 with retry-after-ms=820000; preserve this identit…` (L1 death/recovery).
- `history://TabiR17:262` — `read(proc://TabiR17.C2Harness-2)` → `error … Background job or
  service not found`.
- `history://TabiR17:266-268` — `agent://C2Harness-2` 1 line, `agent://C3Checker-2` 0 lines,
  `agent://C3Counter-2` 0 lines (unpublished).
- `history://TabiR17:278-280` — the L1 writes to exactly these three seats; each then writes its
  report (13:50/13:53/14:05).
- `history://TabiR17.C2Harness-2:11` — verbatim `[irc] TabiR17 → me: L1 (after a parent 429
  restart): resume and finish your C2Harness item where you left off (harness 13:04, fixtures 12:5…`.
- `history://TabiR17.C3Checker-2:19` — verbatim `[irc] TabiR17 → me: L1 (after a parent 429
  restart): resume and finish scripts/check-adjacency.mjs with the tightened rules I sent …`.
- C3Counter: no `parent 429` line survives in its transcript; `history://TabiR17.C3Counter-2:3`
  is `[compaction] Resume prior conversation…`, and it received the L1 revive write in the same
  block. Cause attribution to the 429 is [INFERENCE]; the revive act and later delivery are
  observed.

## Issues

1. **The dispatch artifacts cannot reproduce the death/revival fact.** `validation.json` records
   `resume:0`, `resumeSends: []`, and `counts.spawn:86`; `dispatch-attempts.json` records only the
   two batch attempts. The three revivals exist only in L1/seat transcripts, so "dead-seat list"
   is not machine-checkable from `w1/*.json`.
2. **`validation.json` is a pre-dispatch snapshot**: its embedded `registry.members[*].agentId`
   are all `null`, so it proves plan shape, not delivery. The resolved map is
   `swarm-registry.json`/`record.json` (ids = assignments).
3. **Attempt-1 refusal reason unrecorded**: only `refused:86, spawnedText:false`; retry is
   identical except its timestamp, so why the whole batch was refused is unrecoverable.
4. **Report-shape drift**: 3 of 86 reports start with `#` headers instead of `VERDICT:`
   (`ReconMistakes.md`, `RevDevtoolsPak.md`, `SrcDevtoolsInvoke.md`). Delivery holds; the verdict
   is just not machine-tallied.
5. **C3Counter's "429" attribution** lacks a verbatim steer line (see above).

Repair: append a `revivals: [{seat, agentId, cause, evidence, revivedAt, report}]` array and the
attempt-1 refusal reason to the w1 dispatch record (or a wave ticket under `w1/`); emit
`validation.json` after id resolution so `agentId` is non-null; make the report contract require a
first-line `VERDICT:`. If the tally is to be cited later, cite `swarm-registry.json` for the map,
`ls w1/*.md` for delivery, and the transcript rows above for revivals.

## Files written

- `.ufo/waves/round-17/w2/ScoutSeatTally.md` (this report)

No tools installed; no git/jj writes; read-only on lane and fleet.
