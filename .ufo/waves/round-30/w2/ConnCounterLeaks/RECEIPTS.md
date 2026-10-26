# ConnCounterLeaks — round-30 w2 receipts (commands, exit codes)

## Clone
S=/fast/scratch/hyaku/tabi-r30/ConnCounterLeaks && mkdir -p "$S" && git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone" && git -C "$S/clone" checkout -q 072af95fe2822f0785a6ff88a578e2142dd258e5 && git -C "$S/clone" rev-parse HEAD && git -C "$S/clone" status --porcelain | wc -l
-> 072af95fe2822f0785a6ff88a578e2142dd258e5, porcelain 0, exit 0

## Production run: check-freshness.mjs --worktree (clone cwd)
cd "$S/clone" && node scripts/check-freshness.mjs --worktree; echo "EXIT=$?"
-> exit 0; tail line: FRESHNESS_GATE verdict=clean finding=freshness_worktree matched=34 unique=34 lane=31 public=3 revision=worktree profile=production
-> public=3 target lines read live from absolute host paths (PIN_MATCH target=/home/vgpnk/.kimi-code/...):
   kimi.plugin.json sha256=e70aff5c40fffdeaa8a7c1e50087dd908bfc5fd91febe3c7c09f61417403695d newlines=24
   SKILL.md sha256=84a8e69d04c5b810e69695dec8d8e16c1cd9735b96ba81c39433b0c0451bea4b newlines=158
   operations.md sha256=b811d9c23dfdafa0b751b23acef25b02a324490a3389efdd5c17319a646734fc newlines=34

## Production run: check-freshness.mjs --witness HEAD (clone cwd)
cd "$S/clone" && node scripts/check-freshness.mjs --witness HEAD; echo "EXIT=$?"
-> exit 0; FRESHNESS_GATE verdict=clean finding=freshness_witness matched=34 lane=31 public=3 profile=production (host files still read live in witness mode)

## Host-coupled paths existence
ls -la /home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs
-> -rwxr-xr-x 1 vgpnk vgpnk 107309 Oct 24 21:55 ... (exists)
for f in /home/vgpnk/.kimi-code/plugins/managed/kimi-webbridge/{kimi.plugin.json,skills/kimi-webbridge/SKILL.md,skills/kimi-webbridge/references/operations.md}; do [ -f "$f" ] && echo "EXISTS $f" || echo "MISSING $f"; done
-> all three EXISTS

## Selfassessment child env forwarding (static evidence + probe attempts)
- check-selfassessment.mjs:161-167 spawns each gate's own self-test: spawnSync("node", [diskPath, flag], { cwd: repo, env: { ...process.env, TMPDIR: tmp, TMP: tmp, TEMP: tmp } })
- probe: dummy gate committed to scratch clone; direct invocation 'node scripts/check-dummy.mjs --selftest --json' -> exit 0, stdout 'SELFTEST dummy cases=1 passed=1' (TALLY_MATCH cases=1)
- live m1 oracle invocation of the same dummy via check-selfassessment.mjs --rev HEAD --json reported finding couldNotEvaluate="self-test printed no tally" without a marker hit; discrepancy noted, so env-forward is evidenced by code, not by the probe run

## C1/C2 leak line references (from wave-1 CritC1Counter / SentinelFetchScope, re-verified at tip)
- check-gate-mutants.mjs:142 join(work, runId); :147-152 spawn { cwd: dir, env: {...process.env, TMPDIR...} }; :203 runId 'pristine-${gates.length}'; :215 runId 'mutant-'
- check-frontier-admission.mjs:174 admits ^(https://|file://); :175 curl -sS -L --max-time 60 ... (no -q/--no-netrc/--proto-redir/--max-redirs, no address filter); :180 accepts curl code 000 for file://
