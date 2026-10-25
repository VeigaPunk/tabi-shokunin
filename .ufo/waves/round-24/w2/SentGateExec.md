# SentGateExec — security review of the two shipped gates

Scope: `scripts/check-gate-registry.mjs` (C1 counter) and
`scripts/check-selfassessment.mjs` (C2 counter) as committed at lane tip
`ad125e85c235e1c4ec6a08e398bd64da01f68a08`. Read-only review: every claim below
carries the command that produced it, run in scratch under
`/home/vgpnk/tmp-tabi24` (`TMPDIR` exported; `/tmp` is 100% full).

Disk-vs-commit check first: both files on disk are byte-identical to the
committed blobs.

    a=$(git show ad125e8:$f | sha256sum); b=$(sha256sum $f)
    check-gate-registry.mjs   committed=disk=5adf8358...  IDENTICAL
    check-selfassessment.mjs  committed=disk=1c40e938...  IDENTICAL

Line numbers below are into those committed bytes.

---

## Verdict map for the reader

- **Confirmed arbitrary-code execution** through two independent paths, both
  reachable only because `--repo` is an unvalidated arbitrary-repo selector
  (R1): (a) `check-selfassessment` spawns `<repo>/scripts/check-*.mjs
  --selftest` (R1a); (b) `git status` in m3 runs repo-local `core.fsmonitor`
  (R2).
- **Confirmed subprocess/oracle substitution**: `git` and `node` are
  PATH-resolved (R3); `GIT_DIR` and `NODE_OPTIONS` are inherited unscrubbed
  (R4).
- **Confirmed write-scope overstatement**: m3's `git status` rewrites
  `.git/index` when stat data is stale, contradicting the "stdout/stderr only"
  registry cell (R5).
- Everything else inspected **held**: no shell injection, no argv injection, no
  path traversal to the filesystem, no symlink follow on delete, no
  registry-row command execution, no unbounded buffers.

The two refusal-worthy guards: **(1)** pin `--repo` to the lane root (kill the
`--repo` selector in production), and **(2)** scrub the env passed to every
subprocess (PATH + `GIT_*`/`NODE_OPTIONS` + `TMPDIR`), which closes R2/R3/R4
without any caller cooperation.

---

## What each gate can execute / read / write

### Execution inventory (all `spawnSync`, `shell` never used)

`check-gate-registry.mjs`:
- `git -C <repo> rev-parse|show|ls-tree` — `git()` at **l.74** (env partially
  scrubbed, `maxBuffer` 64 MiB, **no timeout**).
- `git -C <root> init|config|add|commit|rev-parse` — fixture `run()` at
  **l.331**, self-test only.
- **Never** executes a registry-named command (`scriptsInRow` is a Set used as
  a map key only).

`check-selfassessment.mjs`:
- `git -C <repo> rev-parse|show|ls-tree|status` — `git()` at **l.83** (env
  partially scrubbed, `maxBuffer` 64 MiB, **no timeout**).
- `node <diskPath> <flag>` — `gateTally` at **l.152** (env **not** scrubbed,
  `TMPDIR/TMP/TEMP` overridden to a private tmp, `timeout` 180 s, `maxBuffer`
  32 MiB). `<flag>` is a literal `--selftest`/`--self-test` regex capture;
  `<diskPath>` is `<repo>/scripts/(check-…|round-evidence-audit).mjs`.
- `git -C <repo> cat-file -e|show <hex>:<path>` — m2 re-run at **l.249**
  (`maxBuffer` 8 MiB, **no timeout, env fully inherited**).
- `git -C <repo> status --porcelain --untracked-files=all` — m3 at **l.269**
  (`maxBuffer` 32 MiB, **no timeout, env fully inherited**).

### Read surface

- `readBlob(repo, rev, "SKILL.md")` / `"SCORECARD.md"` and the m2
  `ls-tree corpus/evidence` + per-`.json` `git show` are all **fixed literal
  paths**; nothing attacker-controlled reaches `git show`. `git()` at l.74 /
  l.83 is the only FS-adjacent read, and it reads **git objects**, not files.
- The only filesystem read of an attacker-influenced path is
  `readFileSync(diskPath)` at **l.145** (selfassessment), where `diskPath =
  join(repo, script)` and `script` is pre-filtered by the anchored
  `RUNNABLE_GATE` regex at **l.67**. Content-hashed only, never executed as
  data.

### Write surface

- Production path: **no `fs` writes at all** except the m3 `git status` (see
  R5). All `writeFileSync`/`mkdirSync`/`rmSync` sites sit inside
  `makeFixture`/`runSelftest` (registry l.342-346; selfassessment l.167,
  l.435-436) and write only under `mkdtempSync(join(tmpdir(),…))`.

---

## Findings

### R1 — HIGH — `--repo` is an unvalidated arbitrary-repo selector (read escape + code exec)

`parseArgs` stores `opts.repo = argv[++i]` with **no validation, no realpath,
no "must equal `LANE`" check** — registry **l.414**, selfassessment **l.412**
(same shape). `evaluate(opts.repo, opts.rev)` then runs `git -C <repo>` over
whatever was named. `LANE` (l.60/l.69) is only a default; it is never enforced.

Consequences, demonstrated:

**R1a — arbitrary code execution** (`check-selfassessment`). A hostile repo at
`/home/vgpnk/tmp-tabi24/evilrepo` containing
`scripts/check-evil.mjs` (which appends a line to a marker) plus a
`SCORECARD.md` naming it:

    node scripts/check-selfassessment.mjs --repo /home/vgpnk/tmp-tabi24/evilrepo \
      --rev 3d919673de611af658f1177b5fca682ee180a9e6
    # FINDING class=m1-selftest-tally ... claimed=1 observed=1
    # SELFASSESSMENT verdict=clean rev=3d919673... mismatches=0
    # exit=0
    # cat /home/vgpnk/tmp-tabi24/EXEC-MARKER.txt
    #   arbitrary code ran as uid 1000 cwd=/home/vgpnk/tmp-tabi24/evilrepo

The blob-equals-disk rule (l.145, sha256(disk) === sha256(blob)) is **not** a
containment or authenticity guard — it is only an anti-drift check. When the
repo is attacker-controlled, *both* sides of the equality come from the
attacker, so it is satisfied trivially while the gate still executes.

**R1b — read outside the lane** (both gates). The same `--repo` flag makes
either gate read a foreign repo's `SKILL.md`/`SCORECARD.md` and attest it:

    node scripts/check-gate-registry.mjs --repo /home/vgpnk/tmp-tabi24/evilrepo --rev 3d919673
    # GATE name=check-evil script=scripts/check-evil.mjs ... conformant
    # GATE name=round-evidence-audit ... NONCONFORMANT
    # GATE_REGISTRY verdict=failed rows=1 gates=2 nonconformant=1

It correctly did **not** execute `check-evil.mjs` (no marker) — confirming the
"never executes a registry-named command" property — but it *did* evaluate a
repo outside the lane and printed a verdict over its bytes. For the
`check-selfassessment` gate, `--repo` is strictly more dangerous because
`git status` (m3) and the `node` spawn (m1) run there too.

Guard present: none on `opts.repo`.
Guard missing: containment `realpath(opts.repo) === realpath(LANE)` in
production, or `--repo` gated to the selftest path only.
**This is the guard I would refuse to ship without** (see §Refusal).

### R2 — HIGH — repo-local `core.fsmonitor` executes an arbitrary binary via `git status` (m3)

`git()` scrubs only `GIT_CONFIG_GLOBAL`/`GIT_CONFIG_SYSTEM` (l.86,
selfassessment; l.77, registry). Repo-local `.git/config` is **never**
scrubbed, and `git status` consults `core.fsmonitor`. Setting it in the hostile
repo:

    git -C /home/vgpnk/tmp-tabi24/evilrepo config core.fsmonitor \
      /home/vgpnk/tmp-tabi24/fmon.sh
    git -C /home/vgpnk/tmp-tabi24/evilrepo config core.fsmonitorHookVersion 2
    node scripts/check-selfassessment.mjs --repo /home/vgpnk/tmp-tabi24/evilrepo --rev 3d919673
    # SELFASSESSMENT verdict=clean ...
    # cat /home/vgpnk/tmp-tabi24/FSMON-MARKER.txt
    #   fsmonitor hook executed: 2 1792918395623650670

This is a **second** exec vector independent of the `scripts/` tree and of
`RUNNABLE_GATE` — it needs only `--repo <dir>` (or a writable lane
`.git/config`; the lane's own `.git/config` is untracked and outside the gate's
blob provenance). `check-gate-registry` is unaffected here (it never runs
`git status`), but the vector is present in `check-selfassessment`.

Guard present: none (config scrub is global/system only).
Guard missing: a sanitized env for the `git` child — at minimum
`GIT_CONFIG_GLOBAL=/dev/null`, `GIT_CONFIG_SYSTEM=/dev/null`, **and** something
that defeats repo-local hook config. There is no env var to disable
`core.fsmonitor`, so the durable fix is R1 (pin the repo) — a repo-local
`core.fsmonitor` inside the *lane* `.git` would still be a hazard, but that
requires write access to `.git`, which is already game over for the gate's
evidence anyway.

### R3 — HIGH — every subprocess is PATH-resolved; the oracle is substitutable

`git` is spawned bare in both gates (l.74, l.83); `node` is spawned bare in
`gateTally` (l.152); `git` is spawned bare in fixture `run()` (l.331). None
resolve to an absolute path, and none scrub `PATH`. A fake `node` placed first
on `PATH` receives every gate's `--selftest` invocation and reports whatever
tally it likes — the counter records `observed=13` for all gates:

    PATH=/home/vgpnk/tmp-tabi24/fakebin:$PATH node scripts/check-selfassessment.mjs --rev ad125e8
    # FINDING m1-selftest-tally line=197 claimed=12 observed=13
    # FINDING m1-selftest-tally line=410 claimed=25 observed=13
    # hijack log:
    #   fake-node invoked: .../scripts/check-freshness.mjs --self-test
    #   fake-node invoked: .../scripts/check-sources.mjs --self-test
    #   fake-node invoked: .../scripts/round-evidence-audit.mjs --selftest

This defeats the C2 claim that "the oracle is the gate binary itself, never a
committed receipt" — the binary that runs is whatever `node` resolves to, so a
stale `12/12` can be made to look clean (or a correct tally made to look
stale). The same applies to `git`: a fake `git` on `PATH` can fabricate
`ls-tree`/`show`/`status` output, forging the *entire* verdict without touching
disk. m1/m2/m3 all trust `r.stdout`/`r.status` from a PATH-resolved binary.

Guard present: none.
Guard missing: absolute-path the binaries (e.g. `process.execPath` for `node`,
a pinned/verified `git`), and scrub `PATH` in the spawned env.

### R4 — HIGH — env scrubbing is partial; `GIT_DIR`/`NODE_OPTIONS` are inherited

`git()` sets `env: { ...process.env, GIT_CONFIG_GLOBAL:"/dev/null",
GIT_CONFIG_SYSTEM:"/dev/null" }` — it **adds** two overrides onto the full
inherited env (l.77, l.86). `gateTally` sets `env: { ...process.env, TMPDIR,
TMP, TEMP }` (l.157). `m2` and `m3` spawns inherit the env wholesale. Nothing
removes `GIT_DIR`, `GIT_OBJECT_DIRECTORY`, `GIT_ALTERNATE_OBJECT_DIRECTORIES`,
`GIT_CONFIG_COUNT`/`GIT_CONFIG_KEY_*`, `NODE_OPTIONS`, `GIT_DIR`, `GIT_WORK_TREE`.

**R4a — provenance substitution** (both gates). `GIT_DIR` takes precedence over
`git -C`. With `GIT_DIR` pointed at a foreign repo, `rev-parse` resolves that
repo's objects, and the gate attests the wrong object store:

    GIT_DIR=/home/vgpnk/tmp-tabi24/evilrepo/.git \
      node scripts/check-gate-registry.mjs --rev 3d919673
    # GATE name=check-evil ... conformant
    # GATE_REGISTRY verdict=failed rev=3d919673 rows=1 gates=2 nonconformant=1
    # (control, same rev, no GIT_DIR -> "revision does not resolve")

So a caller's env can silently redirect "the committed bytes at `<rev>`" to a
different repository — the C1 "reads a revision's committed bytes" property
breaks under a poisoned environment.

**R4b — `NODE_OPTIONS` code injection** (`check-selfassessment` m1). The child
`node` inherits the caller's env; `NODE_OPTIONS=--require` runs an arbitrary
module in every gate the counter spawns:

    NODE_OPTIONS="--require /home/vgpnk/tmp-tabi24/inject.cjs" \
      node scripts/check-selfassessment.mjs --rev ad125e8
    # NODEOPT-LOG.txt lists: check-adjacency, check-freshness,
    #   check-measurement-binding, check-round-contract, check-selfassessment,
    #   check-sources, check-user-round-contract, round-evidence-audit,
    #   ufo-swarm-wave (orchestrator), and several /var/tmp witness gates.

Nine lane gate processes plus the orchestrator's own node loaded `inject.cjs`.
`TMPDIR`/`TMP`/`TEMP` **are** redirected to a private dir (good), but nothing
else is. This also gives the spawned gate full access to whatever else is in
`process.env` (credentials, socket paths) — the file's "Never reads credentials
or session material" claim (header l.16) is true of the *script's* code but
false of the *child surface* it launches.

Guard present: `GIT_CONFIG_GLOBAL`/`GIT_CONFIG_SYSTEM`/`TMPDIR` overrides.
Guard missing: a minimal allowlist env (`PATH` to a pinned dir,
`HOME`/`USER`, `TMPDIR`) for every subprocess — `spawnSync` supports a fixed
`env`, it is simply not used.

### R5 — MEDIUM — "Write scope: stdout/stderr only" is false; m3 `git status` rewrites `.git/index`

The registry row pins `stdout/stderr only` for `check-selfassessment`
(SKILL.md l.2479). But `git status` refreshes and **rewrites** `.git/index`
when the stat cache is stale. In a fixture repo with a touched tracked file:

    touch -d '2020-01-01' SCORECARD.md
    b=$(sha256sum .git/index | cut -d' ' -f1)
    node scripts/check-selfassessment.mjs --repo /home/vgpnk/tmp-tabi24/guardfx --rev $REV
    a=$(sha256sum .git/index | cut -d' ' -f1)
    # before=73154e24...  after=9e29b3f3...  INDEX REWRITTEN (gate caused a .git write)

(Control: on the lane's clean index the same run left `.git/index` byte-identical
— the write is conditional on stale stat data, not on every run.) The write is
git-internal and benign, but it is a write caused by the gate into the target
repo's `.git`, so the pinned write-scope cell overstates the guarantee. A
`git status` can also be made to invoke `core.fsmonitor` (R2) — compounding the
"read-only" claim.

Guard present: none needed for correctness of the verdict.
Guard missing: none for the *claim* — either pin `--no-optional-locks`/readonly
status, or correct the row to "stdout/stderr + git-internal `.git` index
refresh".

### R6 — LOW — no `timeout` on any `git` subprocess; hangs are unbounded

`git()` (l.74, l.83), the m2 re-run (l.249), and the m3 `git status` (l.269)
all omit `timeout`. A blocked `git` (network object-store, lock, fsmonitor
that stalls, a slow `include.path`) hangs the gate forever — there is no
kill/deadline anywhere except the m1 `node` child (`timeout: 180000`, l.155).
`maxBuffer` is set everywhere (64/32/8 MiB) and overflows degrade to
`could-not-evaluate`, but a hanging spawn is unbounded. For a fail-closed gate
this means "could-not-evaluate" can also mean "never returns".

Guard present: `timeout` on the m1 `node` child only.
Guard missing: a bounded `timeout` (and `killSignal`) on every `git` spawn.

---

## Adjacent (non-security) observations worth logging

- **Stale docstrings**: `check-gate-registry.mjs` header (l.7) claims "**15**
  isolated cases" but `--selftest` prints `cases=22 passed=22`;
  `check-selfassessment.mjs` header (l.8-9) claims "**10** isolated cases" but
  prints `cases=13 passed=13`. The SKILL.md rows (l.2478/2479) pin `22`/`13`
  correctly — the file headers are stale. Ironically, an `m1` counter keyed on
  "cases=N" inside a gate's own file would flag exactly this.
- `git status` is environment-sensitive: the lane tip run reported `m3
  observed=5` because the W2 dispatch files sit untracked in the worktree, so
  `verdict=failed` even though the committed claim is `after: 0`. Not a defect,
  but the m3 signal is not reproducible across concurrent work.
- `statSync` is imported (l.61) but never used — dead import.

---

## Guards confirmed PRESENT (do not weaken)

| Guard | Where | Verified by |
|---|---|---|
| argv-array spawn, no `shell:` | all `spawnSync` | code; no `";`/metachar path exists |
| rev validated `^[A-Za-z0-9][A-Za-z0-9._/-]*$` + `rev-parse --verify` | `resolveRev` l.96/l.98 | `--rev '../etc/passwd'`, `'a/../../etc'`, `'HEAD^{commit}'`, `'--all'` all → exit 2 |
| resolved-hex only reaches `git show` | l.239-240, l.279-280 | only `resolveRev` output is reused |
| read paths are fixed literals | `readBlob(...,"SKILL.md"/"SCORECARD.md")` | no `join(repo, <untrusted>)` to `git show` |
| m2 closed grammar `git cat-file -e\|show <hex>:<path>` | `SAFE_GIT` l.222 | `curl … \| sh`, `git -C /x`, `…; rm -rf` all rejected → could-not-evaluate; `-C` group parsed but ignored so `-C /etc` cannot redirect the re-run |
| `RUNNABLE_GATE` anchored containment on the executed script | l.67 | `../`, `scripts/../../x.mjs` can't satisfy `^scripts/(check-…\|round-evidence-audit)\.mjs$` |
| `flag` is a literal `--selftest`/`--self-test` capture | l.148-152 | no arbitrary string reaches the child argv |
| blob-equals-disk anti-substitution | l.145 | overwrite after commit → could-not-evaluate, marker NOT written |
| `rmSync` does not follow symlinks | selftest + m1 cleanup | symlink to an external dir survived `rmSync({recursive:true})` |
| `mkdtempSync` in OS temp, selftests confined | `tmpdir()` + `mkdtemp` | temp trees unique; `TMPDIR` override honored |
| `maxBuffer` everywhere | l.74-76, l.155-156, l.251, l.269 | ENOBUFS → `could-not-evaluate`, not a crash |
| `LANE` from `import.meta.url`, not `cwd` | l.60, l.69 | gate targets the lane regardless of invocation cwd |

No `fs` write exists in the production path of either gate outside the
selftest/fixture builders.

---

## Refusal — the guards I would not ship without

1. **Pin `--repo` to the lane root** (or restrict it to the selftest code
   path). As shipped, `--repo` is a single flag that defeats every other guard:
   it turns `check-selfassessment` into an arbitrary-code executor (R1a + R2)
   and both gates into attesters of foreign bytes (R1b). Everything else —
   containment regexes, blob-equals-disk, closed m2 grammar — assumes the repo
   is the lane, and nothing enforces that assumption. One `realpath` compare
   (`realpath(opts.repo) === realpath(LANE)` → `Refusal`) collapses R1 and R2
   to "the caller already controls the lane", which is the correct threat
   boundary for a self-attesting gate.
2. **Scrub the subprocess env.** Spawn with a fixed env (`PATH` to a pinned
   dir, `HOME`/`USER`, `TMPDIR` to the private tmp, and *not* the full
   `process.env`), and absolute-path `node` (`process.execPath`) and `git`.
   This closes R3 and R4 in one place: no PATH-resolved binary, no
   `GIT_DIR`/`GIT_OBJECT_DIRECTORY` repo redirect, no `NODE_OPTIONS` injection,
   no credential inheritance into the gate's children.

Severity framing: neither defect is a remote-exploitable bug in the common
case — the lane's own L1 invokes these gates and controls argv/env. The real
risk is **provenance**: the whole point of a fail-closed gate is that its
receipt means "the committed bytes at `<rev>` satisfy the check". `--repo`,
`GIT_DIR`, `NODE_OPTIONS`, and PATH-resolution all let a caller (or a hostile
repo a caller points at) make that receipt say something the lane's bytes do
not. Ship-blocking for a gate whose output is consumed as evidence.

---

## Commands reproduced

Every number above is reproducible:

    # baseline
    git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse HEAD   # ad125e8...
    # fixtures (all under /home/vgpnk/tmp-tabi24):
    #   evilrepo/    -- scripts/check-evil.mjs writes EXEC-MARKER.txt; SKILL.md + SCORECARD.md
    #   guardfx/     -- scripts/check-good.mjs prints cases=13; SCORECARD.md
    #   fakebin/node -- PATH hijack shim; inject.cjs; fmon.sh
    node scripts/check-selfassessment.mjs --repo /home/vgpnk/tmp-tabi24/evilrepo --rev 3d919673
    node scripts/check-gate-registry.mjs   --repo /home/vgpnk/tmp-tabi24/evilrepo --rev 3d919673
    GIT_DIR=/home/vgpnk/tmp-tabi24/evilrepo/.git node scripts/check-gate-registry.mjs --rev 3d919673
    NODE_OPTIONS="--require /home/vgpnk/tmp-tabi24/inject.cjs" node scripts/check-selfassessment.mjs --rev ad125e8
    PATH=/home/vgpnk/tmp-tabi24/fakebin:$PATH node scripts/check-selfassessment.mjs --rev ad125e8
    # index-write control vs fixture
    node scripts/check-gate-registry.mjs   --selftest   # cases=22 passed=22
    node scripts/check-selfassessment.mjs  --selftest   # cases=13 passed=13

No tracked repo file was modified; no git write was performed on the lane
(read-only `git` only). All fixture trees live under `/home/vgpnk/tmp-tabi24`
and `.ufo/waves/round-24/scratch/SentGateExec/` (scratch is gitignored).
