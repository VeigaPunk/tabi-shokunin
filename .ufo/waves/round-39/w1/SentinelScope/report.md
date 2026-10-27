# SentinelScope — round 39 w1: read-only security/scope review of driver + counters

Milestone: scope-review. Surface: the three frozen artifacts of round 39 (C1 driver, C1 counter, C2 counter).
Nothing was executed from the production lane except read-only `git` plumbing and the frozen counters pointed at
throwaway repos in my own scratch. No lane file was created, modified or deleted; no commit; no spawn.

## Review targets and identity check (frozen digests match claims.json)

```
$ sha256sum scripts/playwright-firefox-egress-round39.mjs \
    .ufo/waves/round-39/counters/c1-egress-session-bound.mjs \
    .ufo/waves/round-39/counters/c2-routed-defects-v2.mjs
3fba8b680cb1a415517266d722640aebf38e280a929d3ae5335054a3f09a33fc  scripts/playwright-firefox-egress-round39.mjs
75e823e45bcaff817fb93d677df5dba714560b3be77e62103c73e1a0937c3b6e  .ufo/waves/round-39/counters/c1-egress-session-bound.mjs
eefc8997f9952a4f2fe9cdef0da3929cb46d14b54bc5d98b379826aa32058c7c  .ufo/waves/round-39/counters/c2-routed-defects-v2.mjs
```
All three equal `claims.json:frozenDigests`, so every finding below is about the *frozen* instrument, not a drifted copy.

## Checklist (pass/fail against the assigned scope)

| Scope item | Result | Evidence |
|---|---|---|
| loopback-only navigation | PASS | `server.listen(0,'127.0.0.1')` driver:237; the only navigations are driver:286 and :303, both `http://127.0.0.1:${port}`; no other `http(s)://` literal in the file; fixture HTML (driver:47-66) carries no external `src`/`href`. |
| no secret reads | PASS | Driver reads exactly two paths: `playwright/package.json` (driver:35) and `/proc/net/tcp{,6}` (driver:156). No `HOME`, token, cookie, or dotfile reads; `process.env` is used once, `HYAKU_SCRATCH` (driver:352). Counters import only `readFileSync`/`existsSync` and run git plumbing. |
| no external writes (counters) | PASS | C1 counter imports `readFileSync, existsSync` (c1:25); C2 imports `readFileSync` (c2:38); both state "Write scope: stdout/stderr only" and behave so. |
| no external writes (driver) | PARTIAL | Driver writes only scratch (driver:352-354) and `--out` (driver:379) — but `--out` is unvalidated, see F6. |
| no pacman / no sudo | PASS | zero matches for `pacman|sudo` in all three files (`grep -n -E "pacman|sudo|curl|wget"` → no hits). |
| no fleet/sibling mutation | PASS with caveat | No path constructed from receipt or argv into the lane; counter paths are constants (c1:34-35, c2:47-50). Caveat folded into F6 (`--out`). |
| no global process kills | PASS | No `pkill|killall|process.kill|SIGKILL|SIGTERM`; cleanup is `browser.close()` + `server.close()` (driver:317-321). `--out`/`--repo`/`--rev` are the only argv inputs. |
| shell injection | PASS (none) | Single shell entry point `sh()` = `spawnSync('/bin/bash',['-c',c])` (driver:73); all three call sites are constant except the port, which is `server.address().port`, a Node integer (driver:332). Owned pids interpolated into a `RegExp` (driver:119) are `^\d+$`-filtered (driver:86). No `$( )`, quoting, or ref from data reaches a shell. |
| path traversal | PASS (none from untrusted data) | Counter receipt paths are constants; C2's D6 filename is `NUMSTAT_PREFIX + REV.slice(0,8)` where REV is git's resolved object name. The only arbitrary-path inputs are operator-supplied (`--repo`, `--claims`, `--out`), see F6/F7. |
| scratch cleanup | FAIL (F5) | `process.on('exit')` only; SIGTERM/SIGINT skip it; fallback root is `tmpdir()`. |

## Findings

### F1 — HIGH (counter admission ≠ claim sentence): the C1 counter admits receipts with *zero* socket observations, and cannot distinguish "observed zero non-loopback" from "never observed"
Claim sentence (claims.json C1, counter c1:31) requires "zero non-loopback socket *observations* on both the ss
and /proc surfaces including the post-close final sweep". The counter checks only the `nonLoopback` counters
(c1:112-117) and never requires that either surface produced an observation; per-surface `unavailable` inside
`finalSweep` is only checked at the whole-sweep level (c1:116 tests `fs.unavailable`, not `fs.ss.unavailable`).

Exploit path (no forgery needed, just a degraded measurement host): if `ss -Htnp` yields nothing — `ss` not
installed, `2>/dev/null` eating the error, or a PATH without `ss` — driver:117 returns `null`, `sampleSockets`
degrades that half to `{unavailable:true,nonLoopback:0}` as long as `/proc/net/tcp` is readable, so every sample is
proc-only, `sockets.ss.observations` stays 0, and the counter emits no finding. Same on the final sweep.

Probe (scratch repo, synthetic receipt identical in shape to the driver's, `ss`/`proc` observations 0/0 and both
`finalSweep` surfaces `unavailable:true`):

```
$ node .ufo/waves/round-39/counters/c1-egress-session-bound.mjs --repo "$PWD" --rev HEAD
C1_EGRESS_SESSION_BOUND predicate=met rev=18f6247824b067ca6ce0b3c217e1d3fda96af26a findings=0 controlRefused=true
exit=0
```

Impact: the frozen predicate is strictly weaker than the frozen sentence — the exact defect class (predicate vs
claim divergence) that C2 was created to close on its own axis. "Dual-surface agreement" can be satisfied by one
surface. *Not* active in the landed receipt: `corpus/evidence/round-39/playwright-egress/receipt.json` shows
`ss.observations = proc.observations = 6` per run and live `finalSweep` on both surfaces, so the landed measurement
is materially fine — the gap is in what the counter would have refused.

Smallest remediation: one condition per run —
`(r.sockets.ss.observations > 0 && r.sockets.proc.observations > 0)` and
`!(fs.ss.unavailable || fs.proc.unavailable)` — plus the same for the sweep; 4 lines in `evaluate`.

### F2 — HIGH (fabricated cleanup assertion): `portClosed` fails OPEN when the check cannot run
driver:332 `rec.portClosed = (sh(\`ss -ltn 2>/dev/null | grep -c ':${port} '\`) || '0') === '0'`.
`sh()` returns `''` whenever the pipeline cannot run (driver:73 returns `(r.stdout||'').trim()` and ignores
`r.error`/status). `'' || '0'` → `'0'` → `portClosed === true`. The counter then accepts `r.portClosed === true`
(c1:121) as cleanup proof.

Reproduced with the exact expression and an unresolvable PATH:

```
$ env -i PATH=/nonexistent /bin/bash -c 'ss -ltn 2>/dev/null | grep -c ":1234 "'
stdout=[] stderr=[]            # both ss and grep unresolvable
$ node -e '...same expression...'
sh()= ""  -> portClosed= true
```

Impact: on a host without `ss`/`grep`, or with a broken PATH component, the receipt asserts "fixture port closed"
with no observation at all, and the counter's "fixture port closed" clause is satisfied. Every other unusable-input
path in this driver is fail-closed (empty pid set aborts, both-surfaces-unavailable aborts); this one is the
exception, and it is the one the claim cites as cleanup proof.

Smallest remediation: require positive evidence —
`const closedTxt = sh(...); rec.portClosed = /^0$/.test(closedTxt); rec.portClosedObserved = closedTxt !== '';`
and refuse the run when `!rec.portClosedObserved`.

### F3 — MEDIUM (evidence channel is hijackable): `ps`/`ss`/`grep` are resolved through PATH with an inherited environment
driver:73 runs `/bin/bash -c 'ps -eo pid=,ppid=,args= --no-headers'` (82), `'ss -Htnp 2>/dev/null'` (117) and the
`ss|grep` pipeline (332) with no absolute paths and no scrubbed env.

Exploit path: any writable directory ahead of `/usr/bin` on PATH (a seat's own scratch dir, or a repo-local `bin`
someone prepends) supplies a `ps` that prints a photo-finish-clean process table and an `ss` that prints only
loopback peers. Both halves of the ss surface, the owned-root discovery, and `portClosed` are then forged together;
`/proc` is the only surface left unforged, and F1 shows the counter will accept a receipt where `/proc` alone carries
the run. Demonstrated resolution order in scratch (`PATH="$S/bin:$PATH"`, fake `ss` exiting 127, fake `grep`
printing `0`):

```
$ PATH="$S/bin:$PATH" bash -c 'ss -ltn 2>/dev/null | grep -c ":1234 " || true'
0
```

Impact: measured evidence whose provenance is the operator's PATH is not reproducible evidence; the receipt records
no binary paths or `ss` version to make the substitution visible.

Smallest remediation: absolute invocations `/usr/bin/ps`, `/usr/bin/ss`, `/usr/bin/grep` (fail-closed on ENOENT by
returning `null`), and record `ss --version` first line in the receipt.

### F4 — MEDIUM (process-ownership under-approximation): owned set is snapshotted once, so late-spawned and reparented descendants are invisible to sampling, survivors and the final sweep
`ownedRoots`/`ownedTree` are computed once after a fixed 400 ms sleep (driver:246-247), frozen into
`rec.owned.tree` (257), and every subsequent consumer uses that stale array: the sampler (268-272), the final sweep
(329) and the survivor check (330: `rec.owned.tree.filter(p => existsSync('/proc/'+p))`).

Consequences: (a) any Firefox child spawned after the snapshot — content/utility processes are created *on
navigation*, i.e. after the snapshot — is never sampled by either surface, so its egress is structurally invisible
and its survival is structurally unreported; (b) a descendant whose parent dies is reparented to pid 1, leaves the
ppid walk permanently, and escapes both `survivors` and the sweep; (c) `pidPpidTable()` is re-run per sample but only
for the fixed pid set (observeSockets is called with `rec.owned.tree`), so the re-read costs are paid without
re-discovering children.

Impact: "owned tree nonempty" and "zero survivors" are true of an under-approximation of the session, not of the
session. The claim's kill rule ("survivors") cannot catch the most likely survivor.

Smallest remediation: in the sampler and the final sweep, recompute `ownedTree(ownedRoots(process.pid))` and keep
a monotonic union (`seen ||= new pids`); use that union for survivors. Recomputing roots per tick also closes the
reparenting escape for anything still naming the Playwright binary.

### F5 — MEDIUM-LOW (cleanup/scope hygiene): scratch cleanup is `exit`-only and falls back to `tmpdir()`
driver:352 `mkdtempSync(join(process.env.HYAKU_SCRATCH || tmpdir(), 'tabi-r39-pwegress-'))`, driver:354
`process.on('exit', () => rmSync(S, …))`. Node's `exit` handler does not run on SIGTERM/SIGINT/SIGKILL.

```
$ node sig.mjs & kill -TERM $!; wait
after-SIGTERM status=143
(no EXIT_HANDLER_RAN line = handler skipped)
```

Two consequences: (1) a killed or OOM'd run leaves a full Firefox profile tree behind; (2) when `HYAKU_SCRATCH` is
unset (the seat spec forbids relying on inherited TMPDIR) the browser profile — tens of MB — is written under
`/tmp`, against the scratch policy. Deletion itself is contained: `mkdtemp` guarantees a fresh child, and
`HYAKU_SCRATCH=/` would only create/remove `/tabi-r39-XXXXXX`; there is no over-deletion risk. Also driver:241
creates an unused `profile-*` dir per run (the context is non-persistent) — dead weight, and extra residue.

Smallest remediation: `for (const sig of ['SIGINT','SIGTERM','SIGHUP']) process.on(sig, () => { rmSync(S,{recursive:true,force:true}); process.exit(130); });`
drop `|| tmpdir()` in favour of a required `HYAKU_SCRATCH`, and delete the unused `profile` mkdtemp.

### F6 — LOW (unrestricted output path): `--out` writes anywhere the seat can write
driver:379 `writeFileSync(out, …)` with `out` taken verbatim from argv (driver:349). `--out SCORECARD.md` or
`--out ../../SCORECARD.md` truncates a fleet-root tracked file; the driver also creates no parent dir, so a wrong
path silently fails after a full browser run. No untrusted data reaches this path (no traversal from receipt
contents), so this is an operator-misuse guard, not an injection.

Smallest remediation: resolve `out` and require it to stay under the seat's evidence dir (or under `$HYAKU_SCRATCH`);
`mkdirSync(dirname(out), {recursive:true})` before writing.

### F7 — LOW (hardening only, no exploit found): `--rev` is interpolated into `git rev-parse` as a bare argument
c1:45-47 / c2:69-72: `spawnSync('git', ['-C', repo, 'rev-parse','--verify', \`${rev}^{commit}\`])`. A `--opt=value`
`--rev` is parsed by git as an option rather than a revision, but the mandatory `^{commit}` suffix corrupts the
value, so it dies instead of redirecting:

```
$ git -C <lane> rev-parse --verify '--git-dir=/tmp/zzz^{commit}'
fatal: Needed a single revision
exit=128
```

exit 128 → `Refusal` → counter exit 2 `could-not-evaluate` (c1:161-164) — fail-closed. All later calls use the
resolved object name (c1:41). `--repo` is likewise arbitrary but the counters only run read-only plumbing
(`show`, `ls-tree`, `cat-file -t`, `diff --numstat`, `merge-base --is-ancestor`) — no mutation surface.

Smallest remediation: `if (!/^[0-9a-f]{7,40}$/.test(rev)) throw new Refusal(...)`, or pass `--end-of-options` before
the revision.

### F8 — INFORMATIONAL (provenance statement ≠ behavior): both counter headers claim the receipts are read "at --repo's worktree"
c1:29-30 / c2:33-34 say `--repo`'s worktree; the code reads `git show REV:path` (c1:39-42 blob, c2:71-74) for
`RECEIPT`, `SCORECARD.md`, `LOG.md`, the census and numstat receipts. Reading at REV is the safer direction
(worktree edits are invisible), but the stated provenance is wrong and a reviewer reading the header will audit the
wrong artifact. One-line comment fix.

### F9 — part of F1 family, called out separately because it defeats "session-bound" by construction
The counter's ownership checks (c1:104-108) accept three self-declared fields — `owned.nodePid`,
`owned.roots[].pid`, `owned.source` (matched by `/children of this node process/`, a string the driver itself
writes at driver:257). Nothing in the receipt lets a verifier re-derive "roots are children of nodePid", and the
tree-membership check only compares roots against the tree the same receipt declares. Likewise `survivors: 0` is a
number the counter trusts while ignoring the cross-checkable `survivorPids` array the driver already emits
(driver:330).

```
# nodePid=1, roots=[1] (init; not a child of any driver), survivorPids=[1], survivors=0
C1_EGRESS_SESSION_BOUND predicate=met ... findings=0 exit=0
# survivors=0 but survivorPids=[200,201]
C1_EGRESS_SESSION_BOUND predicate=met ... findings=0 exit=0
```

Smallest remediation: require `Array.isArray(r.survivorPids) && r.survivorPids.length === r.survivors && r.survivors === 0`,
and require the receipt to carry the `ps` rows it derived roots from (`{pid, ppid, argv0}`) so `ppid === nodePid` is
checkable presentational evidence rather than a restated constant.

## What this review does NOT establish
No verdict on whether C1/C2 reach their predicates at the integration REV, whether the round-38 control is refused
in the real run, or whether the round-38 routed residuals D1-D6 hold — those are the drivers' and counters'
measurements on the team's clone, and are other seats' milestones. This report is only about safety, provenance and
process ownership of the instruments.

## Tooling / hygiene
No installs, no upgrades, no pacman, no network. Scratch root
`/fast/scratch/hyaku/tabi-r39/SentinelScope/` created with `mkdir -p`, used explicitly, removed by
`trap 'rm -rf -- "$S"' EXIT` on every probe shell; verified gone. Probe repos left no git config or objects outside
that scratch. The only lane writes are the two report files named by the seat spec.

VERDICT finding — frozen C1 counter admits receipts with zero socket observations and unobserved per-surface final sweeps (F1, probe: predicate=met, findings=0), and independently admits `owned.nodePid=1` / `survivors=0` against `survivorPids=[200,201]` (F9); driver `portClosed` fails open when `ss|grep` cannot run (F2, reproduced: stdout `[]` → `portClosed=true`); plus PATH-resolved `ps`/`ss` evidence channel (F3), one-shot owned-set snapshot missing late-spawned and reparented descendants (F4), exit-only scratch cleanup with a `tmpdir()` fallback (F5). Loopback-only navigation, no secret reads, no external writes, no pacman, no fleet/sibling mutation, no global process kills, and no shell or path injection found.
