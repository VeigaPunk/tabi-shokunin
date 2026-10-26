# ConnCounterLeaks — round-30 w2: cross-claim root — self-test affordances reachable in the lane's gates

Seat `ConnCounterLeaks` (connector, attack). Attack target: the cross-claim pattern — both round-30 counters
leaked a test-convenience path into production (C1: mutant identity visible through the run directory +
inherited environment; C2: `file://` and redirect-follow in `--live`). I looked for the common root across every
`scripts/check-*.mjs` gate at `072af95fe2822f0785a6ff88a578e2142dd258e5` (clean shared clone, porcelain empty),
asking: which other gates carry self-test-only affordances reachable from their production invocation (env vars,
`--repo` defaults, `file://` handling, path joins, child-process environment/cwd)? Receipts:
`.ufo/waves/round-30/w2/ConnCounterLeaks/RECEIPTS.md`.

## Verdict

**Defect (cross-cutting, holds against the two named counters and extends to three more gates).** The two round-30
leaks are the same defect in two colours: each counter's *production measurement path* reuses an affordance that
exists to make its own testing convenient, and nothing separates the two surfaces. C1's counter names every child's
run directory `mutant-<i>`/`pristine-<n>`, spawns it with `cwd` equal to that directory and the **entire parent
environment**, so the code under test is told it is a mutant and which one, and inherits the runner's session
(`scripts/check-gate-mutants.mjs:142,147-152,203,215`). C2's live fetch admits `file://` URLs (added so the
self-test's `live-file-url-located` case can run without network) and follows `-L` redirects off-origin down to
cleartext, honouring ambient `~/.curlrc`/`~/.netrc` (`scripts/check-frontier-admission.mjs:174-180,340-342`).
A gate-level review that asked "is this affordance reachable by the production command, and does it read anything
outside the measured repo at the pinned revision?" would have red-flagged both before the freeze. Three more gates
share the family: `check-selfassessment.mjs` re-runs every gate's own self-test as a child with the full parent env
and `cwd` = repo (line 161-167); `check-freshness.mjs` reads **three absolute host files outside the repo**
(`/home/vgpnk/.kimi-code/plugins/managed/kimi-webbridge/…`) in production and even in `--witness` mode
(line 107; measured live, exit 0, `public=3`); `check-user-round-contract.mjs` spawns an external validator at a
hard-coded absolute `cwd` with an inherited env (`line 547-551`, `VALIDATOR` at line 61). The negative examples are
in-repo: `check-measurement-binding.mjs`, `check-round-contract.mjs`, `check-adjacency.mjs` and the two receipt
gates spawn children under a scrubbed environment and read repo blobs only. No repair was made (attack seat).

## Evidence (commands, exit codes)

Measured in `/fast/scratch/hyaku/tabi-r30/ConnCounterLeaks/clone` (clean shared clone at
`072af95fe2822f0785a6ff88a578e2142dd258e5`, `git status --porcelain` = 0). Full transcript: `RECEIPTS.md`.

```
$ git -C clone rev-parse HEAD
072af95fe2822f0785a6ff88a578e2142dd258e5                 exit 0
$ git -C clone status --porcelain | wc -l
0

# check-freshness production (worktree mode) — reads host files outside the repo:
$ cd clone && node scripts/check-freshness.mjs --worktree; echo "EXIT=$?"
PIN_MATCH target=/home/vgpnk/.kimi-code/plugins/managed/kimi-webbridge/kimi.plugin.json sha256=e70aff5c… newlines=24
PIN_MATCH target=/home/vgpnk/.kimi-code/plugins/managed/kimi-webbridge/skills/kimi-webbridge/SKILL.md sha256=84a8e69d… newlines=158
PIN_MATCH target=/home/vgpnk/.kimi-code/plugins/managed/kimi-webbridge/skills/kimi-webbridge/references/operations.md sha256=b811d9c2… newlines=34
FRESHNESS_GATE verdict=clean finding=freshness_worktree matched=34 unique=34 lane=31 public=3 revision=worktree profile=production
EXIT=0

# same gate, --witness HEAD — host files are still read live (not from the witness):
$ node scripts/check-freshness.mjs --witness HEAD; echo "EXIT=$?"
FRESHNESS_GATE verdict=clean finding=freshness_witness matched=34 lane=31 public=3 profile=production
EXIT=0

# host-coupled paths exist on this machine:
$ ls -la /home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs
-rwxr-xr-x 1 vgpnk vgpnk 107309 Oct 24 21:55 …   (exists)
$ [ -f /home/vgpnk/.kimi-code/plugins/managed/kimi-webbridge/kimi.plugin.json ] && echo EXISTS   → EXISTS (×3 files)
```

Static line evidence (re-read at tip, `read` selectors): `check-selfassessment.mjs:161-167` spawns
`spawnSync("node", [diskPath, flag], { cwd: repo, env: { ...process.env, TMPDIR: tmp, TMP: tmp, TEMP: tmp } })`;
`check-freshness.mjs:57-58,105-107` (`const fixture = root !== defaultRoot;` → production branch reads
`publicTargets[publicIndex]`, the absolute host paths, via `regularBytes` with symlink refusal);
`check-user-round-contract.mjs:61` `VALIDATOR = '/home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs'`;
`:547-551` `spawnSync(process.execPath, [VALIDATOR, 'plan', …], { cwd: '/home/vgpnk/Projects/ufo-fsd-alpha', … })`
(no `env` restriction → full inheritance). Probe of the selfassessment child (scratch clone): a committed dummy gate
prints `SELFTEST dummy cases=1 passed=1` and exits 0 when invoked directly (`node scripts/check-dummy.mjs
--selftest --json` → exit 0); the live `m1` oracle invocation recorded `couldNotEvaluate="self-test printed no
tally"` for the same dummy, so the env-forward claim rests on the code at line 166, not on the probe run
(discrepancy recorded in receipts; not used as evidence).

## Table — gate → affordance → reachable in production? → risk

| gate (`scripts/check-*.mjs` @ 072af95) | affordance | reachable in production? | risk |
|---|---|---|---|
| `check-gate-mutants.mjs` (C1) | run-directory identity (`mutant-<i>`, `pristine-<n>`) + `cwd` = that dir; child env = `{...process.env, TMPDIR…}` (:142,147-152,203,215) | **YES** — every production verification run | High — the code under test learns it is mutant #i and inherits the runner's session; enables non-behavioural kills (wave-1 Z/B2/C5) |
| `check-frontier-admission.mjs` (C2) | `file://` scheme admitted by the live fetch; `-L` follows off-origin/cleartext redirects; no `-q --no-netrc` → ambient `~/.curlrc`/`~/.netrc` honoured; no address filter (:174-180) | **YES** — whenever `--live` is used, i.e. the claimed C2 command | High — `--live` satisfiable with zero network; local-file reads; credential transmission; off-origin chain certified as "live" (wave-1 F1-F5) |
| `check-selfassessment.mjs` | production oracle runs each gate's own `--selftest`/`--self-test` as a child with full parent env + `cwd` = repo (:161-167) | **YES** — this is its production function | Medium — every gate's self-test runs with runner env (secrets, `HYAKU_SCRATCH`, agent sockets) and the repo as cwd; any gate with a leaky/backdoored self-test gets them |
| `check-freshness.mjs` | production (and `--witness`) reads 3 absolute host files outside the repo at fixed paths (:57-58,105-107) | **YES** — measured live both modes, exit 0 | Medium — verdict depends on the operator's machine state (plugin absent/drifted → red regardless of repo); non-portable, non-hermetic production |
| `check-user-round-contract.mjs` | production spawns external validator at hard-coded absolute `cwd` with inherited env (:61,547-551) | **YES** — spec validation path | Medium — machine-coupled: gate red if `/home/vgpnk/Projects/ufo-fsd-alpha` absent; out-of-repo child gets full env |
| `check-measurement-binding.mjs` | production re-runs manifest counter argv (data-driven execution) | YES — but under `minimalEnv()` (PATH/HOME only), `cwd`=repo, `timeout` wrapper (:535-540) | Low — safe pattern; the family's counterexample |
| `check-round-contract.mjs` / `check-user-round-contract.mjs` (fixture modes) | `--repo` alias/`/proc/self/cwd` refused by resolved-path identity; git children scrubbed (`minimalEnv` + `GIT_CEILING_DIRECTORIES`) | No test affordance in production | Low — holds; the gates already guard this class |
| `check-s106-evidence.mjs` / `check-release-pins.mjs` | git children get `GIT_CONFIG_GLOBAL/SYSTEM=/dev/null`; rest of env inherited; offline blob-only reads | No test affordance | Low |
| `check-bfcache-receipt.mjs` / `check-source-reopen-receipt.mjs` | git children strip all `GIT_*` env keys; offline blob-only reads | No test affordance | Low (good hygiene) |
| `check-gate-registry.mjs` | never executes commands named in the registry; reads SKILL.md blobs; no children | No | Low |
| `check-adjacency.mjs` | `--fleet` defaults to `dirname(lane)`; children `minimalEnv`; production reads fleet/sibling repo blobs | No test affordance | Low |
| `check-aria-metadata.mjs` | `spawnChecker` children get scrubbed env `{PATH, HOME, TZ}`; `spawnChecker` used only by `--self-test`/mirror cases | No (self-test only) | Low |
| `check-sources.mjs` | self-test children spawned with full env, but only under `--self-test` | No (self-test only) | Low |

## Common root

Every listed affordance is the same shape: **an execution substrate built for the harness's own convenience is
left connected to the production measurement surface.** C1's run-directory naming and env forwarding exist so the
counter can isolate and identify mutant runs; C2's `file://` acceptance exists so its self-test can exercise the
live path offline; selfassessment's env forward is the harness's own mechanism; freshness's absolute host paths are
the "public" fixture analogue taken into production; user-round-contract's validator `cwd` is a host fixture baked
into the gate. None of them is gated behind an explicit test-only switch, and none of them is visible to the
frozen predicates. The lane's own secure pattern already exists (`minimalEnv`, `GIT_CEILING_DIRECTORIES`, alias
refusal, blob-only reads) — the gap is that nothing *requires* the pattern, so each new counter re-decides it.

## One QUALITY criterion draft (would have caught both round-30 leaks before freeze)

**80. A gate's production measurement surface is hermetic: every affordance whose purpose is test or harness
convenience — a local-file URL scheme, a run-directory or process-identity naming scheme, ambient shell/curl
configuration, absolute host paths, or an inherited environment — is unreachable from the production invocation,
or is explicitly gated behind a flag no production command uses. The code under test cannot observe that it is
under test, which case it is, or the runner's environment, and the verdict cannot depend on any state outside the
measured repo at the pinned revision (no host files, no dotfiles, no env). The review checks each counter's
evaluate path for child-process env forward, cwd/run-name identity, scheme admission, and absolute external paths;
a counter whose self-test needs a non-hermetic affordance must switch it off in production. (source: round-30
C1/C2 leaks, defect-derived; `scripts/check-gate-mutants.mjs:142,147-152`, `scripts/check-frontier-admission.mjs:174-180`;
the safe pattern exists in `check-measurement-binding.mjs`, `check-round-contract.mjs`.)**

## Risks / limits

- `check-freshness`'s host reads are allowlist-pinned and symlink-guarded (that part is sound); the risk is
  environmental determinism, not arbitrary-file read.
- `check-user-round-contract`'s validator child receives the parent env; it is an out-of-repo script whose bytes
  the gate never pins — a supply-chain-shaped dependency in production.
- I did not run the C1/C2 counters again (wave-1 measured them; frozen digests unchanged at tip); my line evidence
  for those two is from the tip sources and the wave-1 reports.
- Selfassessment's live child probe hit an oracle-parsing discrepancy (dummy passes directly, m1 reported no
  tally); the env-forward claim is therefore code-evidenced (line 166), not run-evidenced.
