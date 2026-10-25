# C1 selftest matrix — `scripts/round-evidence-audit.mjs`, 12 in-memory cases

Author L1Tabi23.ExecSelftestMatrix, baseline `a89f1935`. Every input is a lane-committed path at `--rev`;
fixture paths mirror the real round-22 record names so selftest and CLI share one extraction code path.

## Notation

`F` = `{path: bytes}` fixture root. `G` = `{sha: [paths]}` stub answering `git show --name-only --format=""`.
`--selftest` calls the same `derive(F,G,N)` the CLI calls with `F` loaded from the tree — no second branch.
Case line: `{"case":"<class>-<red|green>","findings":N,"classes":[…],"clean":bool,"cited":…,"derived":…}`;
selftest passes iff all 12 lines match exactly and each red's `classes` is exactly its own class (isolation).
Shared bytes: `RDY` = `.ufo/waves/round-22/`; `V(w,m)` = `RDY<w>-validation.json{"schema":"ufo-wave-validation-v1","wave":"<w>","policy":{"source":"config","maxLanes":m,"waveMinLanes":64,"waveMaxLanes":100,"declaredMaxLanes":m},"counts":{"spawn":m,"total":m}}`;
`R(w,i,at,seats)` = `RDY<w>-cap-refusal-<ii>.json{"attempt":i,"at":"<at>","acquire":"granted lane=tabi wave=<w>","result":{"text":"<seats>"},"spawnedSeats":0}`
where `<seats>` is `Name: Background job limit reached (100).` joined by `; `. Caps are the v1 band
(`waveMaxLanes 64`, round `128`, prompt §6); a wave's declared cap is `min(64, policy.waveMaxLanes)` (strictly tighter wins).
Era/precondition scopes keep the round-21 control at 0: c3 applies only when `corpus/lessons/round-<N>-verifier-spotcheck.md`
exists at `--rev`; c4 only when the round's LOG entry names ≥2 watchdog launches; c6 only hashes inside
"Repairs made"/"Landed changes" rows, never measurement sentences. Absent evidence = skip, never a finding.

## Fixtures (each ≤6 records; red and green differ in the bytes they show — derivation, not presence)

| # | Case | Red `F` (+`G`) | Green `F` (+`G`) |
|---|---|---|---|
| 1 | c1-refusal-arithmetic | `P`: `R(w2,1,16:00:00Z,"A-1: cap.; B-1: cap.")`, `R(w2b,1,16:05:00Z,"C-1: cap.")`, `corpus/lessons/round-22.md="# R22\n## Waves\n- W2: 1 whole-payload refusals\n"` | same two + `R(w2,2,16:10:00Z,"A-2: cap.; B-2: started")`, lesson `2 whole-payload` (partial file must not count) |
| 2 | c2-wave-caps | `V(w2,64)`, `V(w2b,65)` | `V(w2,64)`, `V(w2b,64)` |
| 3 | c3-gate-spotcheck | `corpus/lessons/round-22.md="# R22\n## Gate\ncounting exit 0\n"`, `corpus/lessons/round-22-verifier-spotcheck.md="# Spot-check\nagree\n"` | lesson `## Gate` adds `Spot-check: corpus/lessons/round-22-verifier-spotcheck.md — non-author, agree` (`owed to closure: <path>` equal alternative) |
| 4 | c4-stale-attempts | `LOG.md="…\nRound22 was dispatched three times (watchdog launches 2026-10-21, 2026-10-23, 2026-10-25).\n"` + `G={"c1":["a"],"c3":["b"]}` (window 21st→[c1], 23rd→[], 25th→[c3]) | same LOG line + `Stale-lane attempt 1: progressing c1\n` / `attempt 2: silent none\n` / `attempt 3: progressing c3\n` |
| 5 | c5-registry-identities | `RDYw2b/swarm-registry.json{"schema":"ufo-swarm-registry-v1","wave":"tabi-r22-w2b","members":{"RowA":{"kind":"spawn","agentId":null,"role":"scout","item":null}}}`, `RDYw2b-spawn-result.json{"attempt":12,"at":"16:00:00Z","spawnedSeats":0}`, `R(w2b,1,17:00:00Z,"RowA-1: cap.")` | member `"agentId":"L1Tabi22.RowA"`, spawn `attempt 12 @17:00`, `R(w2b,11,16:00:00Z,…)` |
| 6 | c6-landed-log-binding | `LOG.md="…\nRepairs made:\n2. Encoding revision cites 47bfb5f7ad3c87d0deb2629af6b7d7fe2076cf3e\n"`, `G={"47bfb5f…":["corpus/evidence/round-22/semantic-expectations.json"],"fbee618…":["LOG.md"]}` | row cites `fbee618b3ca313b6387192950083ef0ff47ee145`, or appends `LOG entry lands in fbee618` |

## Assertions — red must print, green must print, and the one field an existence test loses

| Class | Red must print | Green must print | False-green field (existence test) |
|---|---|---|---|
| c1-refusal-arithmetic | `findings=1`, `cited=1`, `derived=2`, evidence names both files and seat counts 2+1 | `findings=0`, `derived=2` | `derived` = count of files whose every seat token is followed by the cap message; a glob/existence test sees 2 files and clears the red, and a raw file count returns 3 on green |
| c2-wave-caps | `findings=2`: `{cited:64,derived:65}` and `{cited:128,derived:129}` | `findings=0`, `derived={maxLanes:64,seats:128}` | `policy.maxLanes` compared to `min(64,policy.waveMaxLanes)` and `Σ maxLanes` to 128; spec existence is always true |
| c3-gate-spotcheck | `findings=1`, `cited="Gate:0 rows"`, `derived="1 required"` | `findings=0` | Gate-section text scan; the spotcheck *file* exists at `a89f1935`, so a file-existence test clears the red round-22 Gate |
| c4-stale-attempts | `findings=3`, per launch `{cited:"0 graded",derived:"progressing|silent"}`, attempt 2 = `silent` | `findings=0`, `derived=3 graded` | per-launch join of grade line ↔ commit window; `LOG.md` already carries `Stale-lane` at :583/:785 for other rounds, so a token search clears the red |
| c5-registry-identities | `findings=2`: ids `{cited:0,derived:1}`, order `{cited:"1<12",derived:"at 17:00>16:00"}` | `findings=0` | `agentId !== null` per member + `at`↔`attempt` monotonicity; the real registry parses and has 65 members, so schema/file existence clears it |
| c6-landed-log-binding | `findings=1`, `cited="47bfb5f…",derived="LOG.md absent"` | `findings=0`, `derived="LOG.md present"` | membership of `LOG.md` in `gitShow(h)`'s file list; `47bfb5f` resolves fine, so 40-hex resolvability clears the red |

## Composite clean fixture (CLI control, not a 13th selftest case)

Union of the six green `F` with two merged docs: lesson = `# R22\n## Gate\nW2: 2 whole-payload refusals\nSpot-check: corpus/lessons/round-22-verifier-spotcheck.md — non-author, agree\n`;
LOG = the launches line + three graded `Stale-lane attempt k:` lines + repairs row citing `fbee618`. Must print
`findings=[]`, `classes=6`, `clean=true`, exit 0. Real anchors the fixtures compress: 13+11=24 refusal files
(`ls .ufo/waves/round-22/w2{,b}-cap-refusal-*.json | wc -l`), 64/65 seat lines per file, `maxLanes` 64 vs 65
(`jq .policy.maxLanes` on both validations), 65/65 `agentId:null` members, `git show --name-only 47bfb5f | grep -c '^LOG.md$'` → 0
vs `fbee618` → 1, `LOG.md:1581` three launches vs 0 `Stale-lane` lines in the round-22 entry, and
`corpus/lessons/round-22.md:13` `## Gate` with no spot-check row while the verifier file is committed.
Round-21 control: 64+64=128 caps, 0 refusal files, 1 launch, 0 null ids, no verifier file → 0 findings.
