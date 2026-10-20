# ReviewRoleMix — wave-1 seat-role mix, dispatch attempt history, job-cap refusals

Reviewer seat `TabiR16.ReviewRoleMix` (wave 2, falsify). Read-only on the lane; this file is the only write.
Measured snapshot: `b444ca8e024f386124418169e8e400221524bba3` (HEAD). Commit A `8f7feb3ff7a0c0ceef220a362581e325a95d6f3a`.

**Verdict: HOLDS for the seat-role mix and for every attempt/refusal count. UNPROVEN for the word
"job-cap" as an *in-lane observed* cause** — the lane artifact records refusals but no refusal text
or reason, so the 100-job-cap attribution is inference from fleet precedent, not lane evidence.

## Attack item

> "Compute wave-1 counts from `.ufo/waves/round-16/w1/spec.json` (84 items; role histogram) and
> `dispatch-attempts.json` (refusals/deferrals), and report the exact seat-role mix, dispatch attempt
> history and job-cap refusals for the report."

Three clauses, attacked separately:

| # | Clause | Verdict | Basis |
|---|---|---|---|
| A1 | Exact seat-role mix is computable and is 84 seats / 9 roles | **HOLDS** | Five independent fields across four artifacts agree pairwise, name-for-name |
| A2 | Dispatch attempt history is 5 attempts: 4 whole-batch refusals of 84, spawn on the 5th; 336 seat-attempt refusals, 84 distinct seats, 0 partial admission | **HOLDS** | `dispatch-attempts.json` + all 84 job ids suffixed `-5` in `dispatch-result.json` |
| A3 | Those refusals are **job-cap** refusals | **UNPROVEN** (attribution only) | No `refusal_text_observed_by_L1`/`reason`/`error` field anywhere in the lane record; sibling lanes preserve the literal cap text, tabi does not |

## Commands and observed output

All commands run from `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-16/w1`.

### A1 — exact mix

```
$ jq -r '.items|length' spec.json
84
$ jq -r '.items[].role' spec.json | sort | uniq -c | sort -rn
     21 scout
     19 executor
     14 reviewer
     10 scribe
      8 connector
      5 critic
      4 revenger
      2 sentinel
      1 simplifier
$ jq -c '.counts' validation.json
{"spawn":84,"resume":0,"total":84}
$ jq -r '.taskCall.tasks[].agent' validation.json | sort | uniq -c | sort -rn
     21 scout
     19 executor
     14 reviewer
     10 scribe
      8 connector
      5 critic
      4 revenger
      2 sentinel
      1 simplifier
```

Name-for-name identity across the four role-bearing sources (empty diff = identical 84 pairs):

```
$ jq -r '.items[]|"\(.name)\t\(.role)"' spec.json | sort > /tmp/rm_spec.tsv
$ jq -r '.taskCall.tasks[]|"\(.name)\t\(.agent)"' validation.json | sort > /tmp/rm_val.tsv
$ jq -r '.members|to_entries[]|"\(.key)\t\(.value.role)"' swarm-registry.json | sort > /tmp/rm_reg.tsv
$ jq -r '.details.progress[]|"\(.id|sub("^TabiR16\\."; "")|sub("-5$";""))\t\(.agent)"' dispatch-result.json | sort > /tmp/rm_disp.tsv
$ wc -l /tmp/rm_spec.tsv /tmp/rm_val.tsv
  84 /tmp/rm_spec.tsv
  84 /tmp/rm_val.tsv
 168 total
$ diff /tmp/rm_spec.tsv /tmp/rm_val.tsv && echo DIFF_EMPTY_OK
DIFF_EMPTY_OK
$ diff /tmp/rm_spec.tsv /tmp/rm_reg.tsv && echo REG_DIFF_EMPTY_OK
REG_DIFF_EMPTY_OK
$ diff /tmp/rm_spec.tsv /tmp/rm_disp.tsv && echo DISP_DIFF_EMPTY_OK
DISP_DIFF_EMPTY_OK
```

Model-role routing is uniform per role and totals to 84:

```
$ jq -r '.details.progress[]|"\(.agent)|\(.modelRole)"' dispatch-result.json | sort -u
connector|m_flash
critic|m_opus
executor|m_swe
revenger|m_flash
reviewer|m_flash
scout|m_flash
scribe|m_haiku
sentinel|m_opus
simplifier|m_flash
$ jq -r '.details.progress[].modelRole' dispatch-result.json | sort | uniq -c | sort -rn
     48 m_flash
     19 m_swe
     10 m_haiku
      7 m_opus
```

Exact seat-role mix (for the report):

| role | seats | modelRole | modelRole seats |
|---|---:|---|---:|
| scout | 21 | m_flash | 48 (scout+reviewer+connector+revenger+simplifier) |
| executor | 19 | m_swe | 19 |
| reviewer | 14 | m_flash | — |
| scribe | 10 | m_haiku | 10 |
| connector | 8 | m_flash | — |
| critic | 5 | m_opus | 7 (critic+sentinel) |
| revenger | 4 | m_flash | — |
| sentinel | 2 | m_opus | — |
| simplifier | 1 | m_flash | — |
| **total** | **84** | | **84** |

Supporting counts: `assignments.json` has 84 keys; 84 item names are unique (0 duplicates);
`swarm-registry.json` has 84 members, all `kind:"spawn"`, all `agentId` non-null; `resumeSends` is `[]`
and `counts.resume` is 0, so there are no same-handle continuations counted as extra seats.

### A2 — attempt history

```
$ node -e 'const fs=require("fs");const a=JSON.parse(fs.readFileSync("dispatch-attempts.json","utf8"));
const t=a.map(r=>Date.parse(r.at));
console.log("records",a.length,"parsed",t.filter(Number.isFinite).length);
console.log("monotonic",t.every((v,i)=>i===0||v>t[i-1]));
console.log("gaps_s",t.slice(1).map((v,i)=>((v-t[i])/1000).toFixed(3)).join(","));
const att=a.filter(r=>"attempt" in r);
console.log("attempt_records",att.length,"attempts",att.map(r=>r.attempt).join(","));
console.log("refused_values",att.map(r=>r.refused).join(","),"sum",att.reduce((s,r)=>s+(r.refused||0),0));
console.log("spawned_key_present",att.map(r=>("spawned" in r)).join(","),"spawnedText_present",att.map(r=>("spawnedText" in r)).join(","));
console.log("deferred_records",a.filter(r=>r.deferred===true).length,"running_values",a.filter(r=>"running" in r).map(r=>r.running).join(","));'
records 11 parsed 11
monotonic true
gaps_s 201.194,180.102,180.102,180.103,180.103,180.099,12.476,180.111,180.109,180.119
attempt_records 5 attempts 1,2,3,4,5
refused_values 84,84,84,84,0 sum 336
spawned_key_present false,true,true,true,true spawnedText_present true,false,false,false,false
deferred_records 6 running_values 65,32,84,139,115,98
```

| attempt | at (-03:00) | refused | outcome |
|---|---|---:|---|
| 1 | 2026-10-20T11:01:09.649623 | 84 | refused; key `spawnedText:false` |
| poll | 11:04:30.843711 | — | `running:65 deferred:true` |
| poll | 11:07:30.945922 | — | `running:32 deferred:true` |
| poll | 11:10:31.047620 | — | `running:84 deferred:true` |
| poll | 11:13:31.150773 | — | `running:139 deferred:true` |
| poll | 11:16:31.253210 | — | `running:115 deferred:true` |
| poll | 11:19:31.352546 | — | `running:98 deferred:true` |
| 2 | 11:19:43.828333 | 84 | `spawned:false` |
| 3 | 11:22:43.939515 | 84 | `spawned:false` |
| 4 | 11:25:44.048555 | 84 | `spawned:false` |
| 5 | 11:28:44.167332 | 0 | `spawned:true` |

Aggregates: 5 attempts, 4 refusal events, `refused` sum 336 **seat-attempt refusals**, but only **84
distinct seats** (the same validated batch each time), 0 partial admission, 0 seats lost. Retry cadence
~180.1 s; attempt 2 fired 12.5 s after the last recorded poll. The six `deferred:true` records are the
polling loop, not refusals: they carry no `attempt`, no outcome, and must not be summed with `refused`.

The live dispatch is attempt 5; the job-id suffix corroborates it (the `-5` generation suffix and
w2's attempt-1 seats carrying no numeric suffix make "suffix = attempt generation" the consistent
reading, but it is `[INFERENCE]`, not an independent proof):

```
$ jq -r '.details.progress[]|"\(.id)"' dispatch-result.json | sed 's/.*-//' | sort | uniq -c
     84 5
$ jq -r '.details.progress|length' dispatch-result.json
84
$ jq -c '{n:(.details.progress|length), idx_min:([.details.progress[].index]|min), idx_max:([.details.progress[].index]|max), idx_unique:([.details.progress[].index]|unique|length), id_unique:([.details.progress[].id]|unique|length)}' dispatch-result.json
{"n":84,"idx_min":0,"idx_max":83,"idx_unique":84,"id_unique":84}
$ jq -r '.text' dispatch-result.json | grep -c '^- `TabiR16\.'
84
```

All 84 job ids end `-5`; the spawn text is "Spawned 84 background agents using executor, scribe, scout,
reviewer, connector, revenger, critic, sentinel, simplifier."; `details.progress[].status` is `pending`
for all 84 (snapshot at spawn) while `details.async.state` is `running`.

Provenance: `dispatch-attempts.json` is tracked and byte-identical at commit A and HEAD:

```
$ sha256sum spec.json dispatch-attempts.json
a7b82b82d0dedc07ad32ef0b513bd735d754dad13807c7c17dc2aedb2e47a6b2  spec.json
a9ddaa3bff1a0380f3d93be152d644889a81518fbc44d884040a7e2b6ec42fa3  dispatch-attempts.json
$ git show 8f7feb3:.ufo/waves/round-16/w1/dispatch-attempts.json | sha256sum
a9ddaa3bff1a0380f3d93be152d644889a81518fbc44d884040a7e2b6ec42fa3  -
$ git log -1 --format='%H %cI %s' 8f7feb3
8f7feb3ff7a0c0ceef220a362581e325a95d6f3a 2026-10-20T11:54:43-03:00 round-16: measurement-binding gate, native WebMCP loopback capability, sources and wave-1 evidence
```

Commit A is 26 minutes after the successful attempt, so the whole history predates the measured
snapshot and is not a post-hoc reconstruction.

### A3 — job-cap attribution

`dispatch-attempts.json` has three record shapes and no reason field:

```
$ jq -c '[.[]|keys|join("+")]' dispatch-attempts.json
["at+attempt+refused+spawnedText","at+deferred+running","at+deferred+running","at+deferred+running","at+deferred+running","at+deferred+running","at+deferred+running","at+attempt+refused+spawned","at+attempt+refused+spawned","at+attempt+refused+spawned","at+attempt+refused+spawned"]
$ jq -c '[.[]|select(has("refusal_text_observed_by_L1") or has("text") or has("error") or has("reason"))]|length' dispatch-attempts.json
0
```

The lane's policy does carry a 100 lane ceiling, but that governs wave size, not admission:

```
$ jq -c '.policy' validation.json
{"source":"config","maxLanes":100,"minLanes":16,"waveMinLanes":64,"waveMaxLanes":100,"declaredMaxLanes":100,"hardCeiling":100,"rampBatchSize":5,"rampIntervalMs":700,"globalRunnerCeiling":1056}
```

The 84-item wave is inside `waveMinLanes 64 … waveMaxLanes 100`, so policy permitted the batch; a policy
refusal would have failed validation, not the spawn. The `running` series is therefore not the wave lane
count (its max 139 exceeds 100), and it is not defined anywhere in the artifact.

Fleet precedent that the whole-batch refusal *mechanism* exists and reads exactly like this (read-only,
other-lane/fleet reports — not tabi's lane record):

- `/home/vgpnk/Projects/shokunin/kaidoku-shokunin/.ufo/waves/round-17/wave1-dispatch-attempts.json`:
  `{try, at, refused:78, refusal_text_observed_by_L1:"Background job limit reached (100). Wait for
  running jobs to finish or cancel one."}` twice, then `refused:0`; that lane's report says "spawned on
  the third identical payload; nothing was split."
- `/home/vgpnk/Projects/shokunin/kama-shokunin/.ufo/waves/round-15/build/spawn-result.json`: "Failed to
  start background task jobs: … Background job limit reached (100)."
- `/home/vgpnk/Projects/shokunin/.ufo/reports/round-16/tameshi.md:103` (fleet-root report, separate
  lane): "The session job cap (100) refused that last seat once before it dispatched."
- Lane-local `.ufo/waves/round-16/w2/dispatch-attempts.json` (this wave, post-fix recorder shape):
  single record `{at, attempt:1, refused:0, spawned:true}`.

So the refusal count is proven and matches the fleet's documented whole-batch cap behaviour; the
**label** "job-cap" is `[INFERENCE]` supported by precedent, not an observation in tabi's lane record.

## Findings

**F1 — Medium. The attempt record cannot prove its own refusal cause.** Attempt 1 stores status under
`spawnedText`, attempts 2–5 under `spawned`, and no record stores any refusal text. Cross-lane canonical
records the literal tool text. Consequence for the report: it may say "refused whole ×4, spawned on the
5th"; it may not say "job-cap refusals" as an observed fact without naming the inference. Fix for future
waves: one schema `{try, at, refused, spawned, refusal_text_observed_by_L1}` (kaidoku r17 shape).

**F2 — Medium. Naive aggregation undercounts refusals.** Two independent traps, both reproduced:

```
$ jq -c '[.[]|select(.spawned==false)]|length' dispatch-attempts.json
3
$ jq -c '[.[]|select(has("attempt"))|if has("spawned") then .spawned else .spawnedText end]' dispatch-attempts.json
[false,false,false,false,true]
$ jq -c '[.[]|select(has("attempt"))|(.spawned // .spawnedText)]' dispatch-attempts.json
[false,null,null,null,true]
```

The correct refusal count is 4 (the `.refused` field is reliable: 84,84,84,84,0 → 336); keying on
`.spawned` gives 3, and jq's `//` alternative turns the literal `false` of attempts 2–4 into `null`
because `false // x` yields `x`. Any report writer must use explicit `has()`.

**F3 — Low. `running` is undefined and cannot be used as the cap's accounting counter.** Recorded
values 65,32,84,139,115,98; 139 > `maxLanes:100`, so it is not the per-wave lane count. There is no
sample between 11:19:31 and the 11:28:44 success, so capacity recovery that allowed attempt 5 is
unobserved. Do not cite the series as evidence of the 100 cap.

**F4 — Info. `DraftReport.md:15` understates the sources.** "The dispatch list does not carry the agent
type per seat" is true of `dispatch-result.json.text` only; `details.progress[].agent` and
`details.progress[].modelRole` carry it and agree name-for-name with `taskCall.tasks[].agent`. The
prescribed source is correct, just not the only one.

**F5 — Info. Refused attempts do not split the wave, but retry identity is asserted, not sealed.** Five
task calls were issued (four whole refusals, one spawn); fleet precedent counts only the successful call
as the wave dispatch ("refused attempts are not counted as extra seats", `kama` r15 report). No
per-attempt payload digest exists, so "retried unchanged" is supported by identical `refused:84` each
time and a single committed `spec.json`, not by a hash chain.

## Report line (exact, paste-ready)

> Wave 1: 84 seats spawned, 0 resumed, 0 dead at dispatch. Roles: scout 21, executor 19, reviewer 14,
> scribe 10, connector 8, critic 5, revenger 4, sentinel 2, simplifier 1 — model roles m_flash 48,
> m_swe 19, m_haiku 10, m_opus 7. Dispatch: 5 attempts of the same 84-seat batch; attempts 1–4 refused
> whole (84 each; 336 seat-attempt refusals, 84 distinct seats, no partial admission), attempt 5 spawned
> 84 (`TabiR16.*-5`). Refusal text was not captured in-lane, so "100-job cap" is an inference from fleet
> precedent, not an observed cause.

## Residual risk and verification gaps

- No in-lane refusal text → A3 stays UNPROVEN by construction; only a re-dispatch with the recorder
  capturing the tool text could close it (not reproducible after the fact).
- `details.progress[].status` is a spawn-time snapshot (`pending`), so wave-1 *completion* cannot be
  read from `dispatch-result.json`; the 84 job ids are the join key if the L1 needs dead-seat accounting.
- The wave-1 `spec.json` is `a7b82b82…`; the attempts record stores no spec digest, so the exact bytes
  of each refused retry are not independently provable.
- Out of scope here: per-item `Report:` trailer paths and the wave-1 prompt/ownership checks belong to
  the misroot/census seats, not this item.

Tool installs: none — no package manager, `uv`, `npm`, or binary install was needed or run.
