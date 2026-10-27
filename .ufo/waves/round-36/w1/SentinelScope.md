# SentinelScope — tabi round 36 / w1 — security review of the two frozen counters

- **Round / wave**: tabi 36, attempt 1, w1 (build + first falsifiers). Lane repo
  `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
- **Freeze**: `2e7b7a8920bff47fae6f75c3d06e48e37767099e`; contract read first:
  `.ufo/waves/round-36/claims.json` (both claims, predicates, kill rules, `feasibilityDisclosed`,
  `frozenDigests`).
- **Scope of this seat** (read-only): `.ufo/waves/round-36/counters/*.mjs`,
  `.ufo/waves/round-36/baseline/{controls.mjs,c1-drift-audit-build.mjs}`; the C1 gate child
  `scripts/check-adjacency.mjs` and the C2-imported `scripts/check-bidi-runtime.mjs` only as far
  as the counters reach them; `measure.sh` as the invocation harness.
- **What I did not run**: neither counter end-to-end (other seats own the numbers), no live Firefox
  leg, no exploitation against any real system, no mutating git anywhere. Every probe below is a
  throwaway fixture under my scratch root and is reproduced by `probes/` in this seat dir.
- **Method**: line-by-line read of 618 + 632 + 96 + 166 + 62 lines, plus four executed probes.

## Summary

| # | Avenue | Verdict | Severity |
|---|---|---|---|
| A1 | `--repo` / `--fleet` / `--rev` path traversal | **clean** (one defense-in-depth gap) | info |
| A2 | C2 live leg spawn surface (argv, env isolation) | **clean**, 2 notes | info/low |
| A3 | `safeWrite` lstat chain vs a symlinked TMPDIR | **clean** (fail-closed), 2 residual notes | info |
| A4 | Shell injection | **clean** in all four tools; one harness string-exec | info |
| A5 | `/proc` socket sampler "own tree only" | **clean with corrections**, 2 findings | low |
| A6 | Fleet write scope (outside `$TMPDIR` + lane) | **clean**; 2 unhardened write sites | low |
| A7 | Untrusted records / git object substitution | **finding** (C2 lacks `GIT_NO_REPLACE_OBJECTS`) | low |
| A8 | Process cleanup (geckodriver / firefox / scratch) | **finding** | low |

Nothing found blocks the honest reachability of either predicate; nothing gives a forger a new
way past the frozen kill rules. The findings are hardening gaps and two places where the
instruments can read less than the claim's prose declares.

---

## A1 — `--repo` / `--fleet` / `--rev` path traversal · clean

**Evidence**
- `c1-adjacency-sweep-v4.mjs:582-583` — `o.repo` defaults to the counter's own lane,
  `o.fleet = resolve(o.fleet || join(resolve(o.repo), '..'))`, `lane = resolve(o.repo)`. No
  containment assertion: any absolute path is accepted.
- `c1-adjacency-sweep-v4.mjs:128-131`, `c2-firefox-bidi-v2.mjs:101-105` — `--rev` is forced to
  `^[0-9a-f]{40}$` before any git call.
- Every sibling repo path comes from `join(fleet, \`${sib}-shokunin\`)` where `sib` is either the
  frozen `PINS` keys or a key validated against `PINS`
  (`c1-adjacency-sweep-v4.mjs:376-377`); `[a-z0-9-]` only, so no `..`/`/` can enter the join.
- Sibling paths read from ledgers go through `refRe` (`^([a-z0-9-]+)-shokunin@([0-9a-f]{40}):(.+):([1-9][0-9]*)$`),
  i.e. the lane token is still `[a-z0-9-]+`; only the *path* field is free-form.

**Exploit path attempted (fixture, `probes/probe-replace-refs.sh`)** — a ref path of the form
`<40-hex>:../../etc/passwd`, `<40-hex>:/etc/passwd`, `<40-hex>:a/../../etc/passwd`:

```
show eb6423a:../../etc/passwd     -> fatal: '../../etc/passwd' is outside repository
show eb6423a:/etc/passwd          -> fatal: path '/etc/passwd' exists on disk, but not in 'eb6423a…'
show eb6423a:a/../../etc/passwd   -> fatal: path 'a/../../etc/passwd' does not exist in 'eb6423a…'
```

Git resolves `rev:path` strictly inside the tree (absolute paths and `..` escapes are refused;
a symlink *stored in the tree* returns the link blob, never the target). So the free-form path
field is not a file-read escape in C1, in the build tool, or in C2.

**Impact**: none beyond "a mistyped `--repo`/`--fleet` reads another repo's git objects" —
read-only, and `--rev` still has to be a 40-hex commit resolvable there.

**Defense-in-depth gap (info)**: `c1-adjacency-sweep-v4.mjs:132-138` `blob()` has **no** `..`/
absolute-path guard, while the v2 C2 counter added one (`c2-firefox-bidi-v2.mjs:108`:
`path.includes('..') || path.startsWith('/')` → `null`). `c1-drift-audit-build.mjs:75-81` has
neither. Git carries the actual protection today, so a future move off `git show` (or a git
version that resolves harder) would silently reopen it.

**Smallest remediation**: copy the two-line guard from `c2-firefox-bidi-v2.mjs:108` into C1's
`blob()` and into the build tool before the `${pin}:${path}` call. (Post-freeze this is a
next-round item; the counters are frozen at `2e7b7a8` and their bytes must equal `frozenDigests`.)

---

## A2 — C2 live leg spawn surface · clean, two notes

**argv construction** — `c2-firefox-bidi-v2.mjs:202`:

```js
spawn(geckodriver, ['--port', String(port), '--websocket-port', String(wsPort),
  '--binary', firefox, '--profile-root', join(scratch, 'profiles')], { stdio: 'ignore', env })
```

- Array argv, no `shell`, no interpolation into a command string; `port`/`wsPort` are numbers
  from `freePort()` (`:184-186`) which binds `127.0.0.1:0` and closes.
- `firefox` / `geckodriver` are refuse-unless-pinned before anything runs:
  `verifyBinaries()` (`:449`, `:461-472`) requires the *exact* path **and** sha256 from
  `PINNED_BINARIES` (`:82-86`); `evaluate()` calls it first (`:452`), before `loadGate` and
  before the live leg. I re-hashed the three installed binaries today: `firefox`
  `a1947294…0789`, `firefox-bin` `46e2c204…7294`, `geckodriver` `f831b7e6…e39f` — all three equal
  the constants, so A2 is operative on this host (a drift would make the counter exit 2, not
  silently accept).
- `geckodriver` is launched **without** `--host`; the binary's own help states
  `--host <HOST> … [default: 127.0.0.1]`, so the WebDriver server is loopback-bound.
- The fixture server the session drives binds loopback explicitly:
  `check-bidi-runtime.mjs:198` `server.listen(0, "127.0.0.1", …)`.

**Env isolation — answers the assigned question exactly.** `c2-firefox-bidi-v2.mjs:201`:

```js
const env = { PATH: process.env.PATH, HOME: home, TMPDIR: join(scratch, 'tmp'),
  XDG_CONFIG_HOME: join(home, '.config'), XDG_CACHE_HOME: join(home, '.cache'),
  XDG_DATA_HOME: join(home, '.local/share'), XDG_STATE_HOME: join(home, '.local/state'),
  MOZ_HEADLESS: '1', LC_ALL: 'C.UTF-8' };
```

- The child env is a **fresh literal**, not `{...process.env, …}`: the *only* inherited value is
  `PATH`. `HOME`, `TMPDIR` and all four `XDG_*` dirs point inside `mkdtempSync(SCRATCH_BASE,
  'tabi-r36-c2-live-')` and are pre-created (`:195-197`); `XDG_RUNTIME_DIR`, `DISPLAY`,
  `WAYLAND_DISPLAY`, `http_proxy`/`https_proxy`/`NODE_OPTIONS`/`SSL_CERT_FILE` are *dropped*
  (they cannot leak from the operator's session into Firefox).
- Cleanup of the scratch tree is `rmSync(scratch, {recursive:true, force:true})` (`:311`) after a
  `SIGTERM` + 500 ms — see A8.

**Note 1 (info) — the runnability probe is the one child that inherits everything.** `:194`:

```js
for (const b of [firefox, geckodriver]) if (spawnSync(b, ['--version'], { encoding: 'utf8' }).status !== 0) …
```

`spawnSync` without `env` inherits the full parent environment (real `HOME`, `XDG_*`, proxies) —
i.e. exactly what `:201` is careful about. Impact ≈ 0 (the digest-pinned binary only prints its
version), but it contradicts the counter's header sentence about the live leg's environment and is
the kind of hole that grows: pass `env` here too.

**Note 2 (info) — the WebDriver endpoint is unauthenticated for the session's lifetime.** No
`--allow-hosts` / `--allow-origins` is passed, so any local process that learns the ephemeral
port can drive the session (the fixture origin cannot, since geckodriver's Host check rejects it).
Random ephemeral port + seconds-long window + single-user host ⇒ low; if the lane ever runs this
on a shared host, pass `--allow-hosts 127.0.0.1,localhost`.

**Related (info)** — `evaluate({ …, liveRunner = liveRecordFirefox })`
(`c2-firefox-bidi-v2.mjs:449`) is an in-process seam: a *wrapper module* that imports the counter
and passes a fake `liveRunner` gets `predicate: true` with no live session. The CLI (`main()`)
never sets it, so the guarantee holds only because the measurement runs the frozen bytes as a
program. Worth stating in the header, since wave-2 cannot distinguish a wrapper's output from the
counter's by looking at JSON alone.

---

## A3 — `safeWrite` lstat chain · clean (fail-closed) + two residual notes

`c1-adjacency-sweep-v4.mjs:230-249` and the identical `c2-firefox-bidi-v2.mjs:344-363`:

1. target = `join(dir, name)`;
2. every ancestor from `dir` up to `/` is `lstat`ed and **any symlink refuses the write**;
3. the target itself is `lstat`ed; if it exists at all (symlink or regular) → refuse;
4. `openSync(target, 'wx')` (`O_CREAT|O_EXCL`, which also refuses a symlink that appears in the
   window), `fstat` must be a regular file, then `writeSync`.

**Verified by execution** (`probes/probe-safewrite.mjs`, which extracts the function *verbatim*
from the frozen counter and runs it against real symlinks):

```
symlinked ancestor component:                     REFUSED refusing to write through symlink component: …/link
symlinked target file (-> /etc/passwd):           REFUSED refusing to overwrite existing scratch file: …/d2/gate.mjs
plain dir (control):                              WROTE …/d3/gate.mjs
dir created by mkdtemp under a symlinked TMPDIR:  REFUSED refusing to write through symlink component: …/tmplink
```

So the r34 F1 family **cannot** bypass the gate-file write: a pre-existing symlinked `TMPDIR`
component is refused, and a pre-planted symlink at the target name is refused twice over.

**Residual 1 (info) — `mkdtempSync` runs before the guard.** `c1-adjacency-sweep-v4.mjs:256` /
`c2-firefox-bidi-v2.mjs:442` create the directory *through* whatever `TMPDIR` resolves to; only
the subsequent file write is guarded (the probe's fourth line is exactly that: the dir was created
inside the link target, then the write refused). The `finally { rmSync(dir, …) }` then removes it
through the same link. Net effect: a transient empty-directory create+delete inside the link
target, no content. If you want the guard to cover directory *creation*, `lstat` the chain before
`mkdtempSync` — i.e. factor the chain check out of `safeWrite` and call it on `ENV.TMPDIR` first.

**Residual 2 (info) — TOCTOU between the chain check and `open`.** A same-uid writer could swap a
component to a symlink after step 2. The *file* is still safe (`O_EXCL`), so the exposure is "the
gate script lands in a different directory than the audited one", not "an attacker-chosen file is
overwritten". Same-uid threat model ⇒ informational.

---

## A4 — Shell injection · clean

Scanned all four frozen tools for `shell:`, `execSync`, `execFile`, `spawn(…'sh'|'bash')`,
`eval(`/`new Function` — **no child process anywhere takes a command string**:

- C1: `spawnSync('git', ['-C', repo, '-c', 'core.commitGraph=false', ...args])` (`:122`);
  `spawnSync(process.execPath, [file, '--at', rev, '--repo', lane, '--fleet', fleet, '--json'])`
  (`:258`); `spawnSync('cat', [join(lane, DELTA_PINS_PATH)])` (`:589`) — argv arrays.
- C2: `spawnSync('git', ['-C', repo, ...args])` (`:99`); `spawn(geckodriver, [...])` (`:202`).
- build tool: `spawnSync('git', ['-C', repo, ...args])` (`:41`).
- controls: `spawnSync(cmd, args, …)` with array args only (`:27`).

Lane/surface names from ledgers never reach an argv element unvalidated (see A1's `refRe`), and no
tool interpolates repo *content* into a command. The only `.exec(` hits are `RegExp.prototype.exec`.

**Harness note (info, outside the four files).** `measure.sh:43-54` builds `c` as a *string* with
`"$full"`, `"$FLEET"` and `"$d"` interpolated, then executes it via `out=$($c 2>&1)` — a shell
re-parse of a string assembled from `$HYAKU_SCRATCH`-derived paths (`S=${HYAKU_SCRATCH:-…}/…`,
`d=$S/c`). Nothing untrusted-from-content flows in, but a hostile/typo'd `HYAKU_SCRATCH` containing
`;` or `$(…)` would be executed. Smallest remediation: make it a bash array
(`cmds=("node scripts/…" …); for c in "${cmds[@]}"; do out=$("${!c}" …)` — or simply call each gate
directly), eliminating the string-parse entirely. The rest of `measure.sh` quotes correctly
(`"$LANE"`, `"$d"`, `"$full"`, `rm -rf -- "$S"`).

---

## A5 — `/proc` socket sampler · clean with corrections, two findings

`c2-firefox-bidi-v2.mjs:205-217` (`setInterval` 400 ms) → `treePids` (`:384-401`) →
`socketInodesOf` (`:402-417`) → `nonLoopbackEstablished` (`:418-435`).

**"Reads only `/proc/<pid>` of its own tree" — correction, then clean.** Two different reads:

- `/proc/<pid>/stat` is read for **every** pid on the host, once per level of the BFS, purely to
  extract the `ppid` field (`:395-398`). No `cmdline`, no `environ`, no `comm` is used or kept.
- `/proc/<pid>/fd` is read **only** for pids in the set rooted at `gd.pid` (`:405-414`) — the
  counter's own geckodriver subtree; node's own pid is the *parent*, so the sampler can never
  adopt the counter's or the operator shell's sockets.
- `/proc/net/tcp{,6}` are process-global, but rows are filtered to sockets whose inode is in the
  owned set (`:422`, `:426`). Column index `f[9]` is the inode field; state `f[3] === '01'` is
  ESTABLISHED. I confirmed the index by matching `socket:[inode]` from `/proc/self/fd` against
  `/proc/net/tcp6` rows in `probes/probe-tcp6-loopback.py`.

Verdict: no cross-tree content read, no other-user reads, no writes; the only "global" surface is
a single integer per pid.

**Finding A5-1 (low) — the IPv6 loopback constant is wrong, in the safe direction.**
`:429-430` treats `'0000000000000001'` and `'0100000000000000'` as loopback. `/proc/net/tcp6`
renders `::1` as `00000000000000000000000001000000` (probe output); neither constant ever matches,
so an IPv6 *loopback* ESTABLISHED socket in the Firefox tree would be counted as non-loopback.
Direction is conservative (it can only push `egressNonLoopback` up and fail the predicate), so it
cannot be used to fake egress-free evidence — but it can produce an unexplainable red reading.
Fix next round: compare the parsed address to the real `::1` form (or check `addr` against both
`127.0.0.1`-equivalent and the 32-hex `::1` form).

**Finding A5-2 (low, claim-strength) — the sampler sees TCP-ESTABLISHED only.**
`nonLoopbackEstablished` reads `/proc/net/tcp{,6}` and requires state `01`. Consequences:
(a) **UDP is entirely unsampled** — QUIC/HTTP3, WebRTC/STUN and any UDP egress read as 0;
(b) a connect to a *filtered* destination stays in `SYN_SENT` (`02`) and is invisible, so on a
host with dropped egress (this benchmark host's normal posture) an actual egress attempt can read
`0` where an *accepted* one reads `8` (as `c2-J6` measured). The counter header says "ESTABLISHED
non-loopback **TCP** sockets" (`:25`, `:50`), so this is honest about itself; the claim's A5 sentence
("samples the firefox process tree's ESTABLISHED non-loopback sockets", `claims.json`) and the
predicate's `live.egressNonLoopback == 0` read stronger than the instrument. Smallest remediation:
also parse `/proc/net/udp{,6}` and count states `01`/`07`, and count `02` (SYN_SENT) for TCP as a
separate `egressAttempts` field that the wave-2 discussion can read without changing the predicate.

**Note (info) — PID reuse.** `treePids` seeds `new Set([gd.pid])` (`:385`); if geckodriver has
already exited and its pid is reused, the sampler adopts a stranger's subtree and may report that
stranger's egress. Again conservative (it can only fail the predicate), self-limiting once
`clearInterval` runs in `finally` (`:305`).

---

## A6 — Fleet write scope · clean; two unhardened write sites

**Does any tool write outside `$TMPDIR` and the lane? No.**

- C1 counter: writes only `mkdtempSync(join(ENV.TMPDIR, 'tabi-r36-c1-'))` + `safeWrite`
  (`:256-257`) and removes it (`:264`). All other fs calls are `spawnSync git show/ls-tree/
  rev-parse` (read-only) and `lstat`/`fstat`. The gate child it spawns writes only scalar
  fixture paths under `os.tmpdir()` (`scripts/check-adjacency.mjs:1298`, `:1494`, `:1500`,
  `:1213`, cleanup `:1668-1669`); no code path in that gate writes into a fleet repo.
- C2 counter: `writeFileSync` is imported (`:61`) but **never called**; the only writes are
  `mkdirSync` of the scratch `home` tree (`:196-197`) and `safeWrite` of the gate (`:443`), both
  under `$TMPDIR`, both removed (`:441`, `:311`).
- `c1-drift-audit-build.mjs`: writes **exactly one** file, `--out` (default
  `join(repo,'corpus','adjacency-screen-drift.tsv')`, `:58`, `:91`) — by design the ledger lands in
  the lane, which is what the claim requires. It writes nowhere else.
- `controls.mjs`: writes the receipt triplets beside itself in the lane
  (`:37-40`, `:69`, `:101-102`, `:157-159`, `:162`), the control commits inside its own scratch
  clone, and `dir` under `$TMPDIR`. No sibling repo, no fleet root file.
- No tool ever opens a path built from `fleet` for writing; `join(fleet, …)` appears only in
  read helpers (`candidates`, `pinLines`, `deltaCandidates`, `citedLineText`, `observed`).

**Finding A6-1 (low) — the r34 F1 hardening was applied to the counters but not to the two
tools beside them.** `controls.mjs:37-40,69,101-102,157-159,162` and
`c1-drift-audit-build.mjs:91` use bare `writeFileSync`, which **follows a pre-existing symlink**.
A symlink planted at, say, `.ufo/waves/round-36/baseline/c1-J5-honest-floor.json` (or at
`corpus/adjacency-screen-drift.tsv`, the build tool's default target) redirects the write to an
arbitrary path outside the lane. The counters refuse exactly this shape (`safeWrite`), so the
harness and the build tool are the soft spot in an otherwise consistent fence. Exploit
preconditions: write access to the lane worktree, which a lane seat has — i.e. this is an
insider/self-tamper shape, not a remote one. Impact: overwrite of an arbitrary same-uid-writable
file, plus fabricated receipts. Remediation: route both through the same lstat-refused writer
(`open 'wx'` + `fstat`), or write to a fresh `mkdtemp` and `rename` into place.

**Finding A6-2 (low) — `controls.mjs:22-23`'s containment guard is defeated by `..`.**
`if (!TMP || !TMP.startsWith('/fast/scratch/hyaku/tabi-r36/')) throw` is a *string* prefix check;
`probes/probe-tmp-guard.mjs` shows `/fast/scratch/hyaku/tabi-r36/../../../../home/vgpnk/evil`
passes it and resolves to `/home/vgpnk/evil`. Everything controls.mjs then does (`mkdtemp`,
`git clone`, `put`, the J6 instrument at `:152`) happens there, and the `finally` at `:165`
`rmSync(dir, {recursive:true, force:true})` deletes it. Requires the operator/L1 to pass a
hostile `TMPDIR`, so severity is low — but the guard exists precisely to bound the blast radius.
Remediation: `if (!TMP || !resolve(TMP).startsWith('/fast/scratch/hyaku/tabi-r36/')) throw`, and
`measure.sh` has **no** such assertion at all (`S=${HYAKU_SCRATCH:-/fast/scratch/hyaku}/tabi-r36/L1/m`
then `rm -rf -- "$S"`) — add the same normalized check there before the `rm -rf`.

---

## A7 — Untrusted records / git object substitution · FINDING

**Finding A7-1 (low) — C2's `git()` omits `GIT_NO_REPLACE_OBJECTS`, C1's sets it.**

- `c1-adjacency-sweep-v4.mjs:122` — `env: { ...ENV, GIT_NO_REPLACE_OBJECTS: '1' }` (plus
  `-c core.commitGraph=false`).
- `c2-firefox-bidi-v2.mjs:98-100` — `env: { PATH, GIT_CONFIG_NOSYSTEM, GIT_CONFIG_GLOBAL, LC_ALL }`:
  no `GIT_NO_REPLACE_OBJECTS`, no `GIT_GRAFT_FILE`, no `-c core.commitGraph=false`.

**Exploit path (fixture, `probes/probe-replace-refs.sh`)** — commit two versions of a file, then
`git replace <R1> <R2>`:

```
C2 env   show f3d0ab1:a.txt -> FORGED content
C1 env   show f3d0ab1:a.txt -> real content
clone --shared refs/replace: 0 ref(s)
```

So: on a repo that carries `refs/replace/<measured REV>`, every `blob(repo, REV, …)` read in C2 —
entry, `SOURCES.md`, the receipt, the driver, the transcripts (`:456`, `:496-514`) — returns the
**substituted** bytes, while the C1 counter reading the same REV returns the true ones. A reviewer
comparing the two counters' views of one commit would see a discrepancy but no cause; a w2 seat
auditing C2's evidence would read forged content. `refs/replace/*` is a normal ref namespace that a
lane can commit/push/fetch like any other.

**Reachability, honestly**: `git clone --shared` (the measurement's clone, `measure.sh:11`,
`controls.mjs:54`) does **not** copy `refs/replace` — the probe shows 0 refs after cloning — so the
official `measure.sh` path is *not* reachable this way today. It **is** reachable whenever `--repo`
points at a worktree (C1's own `c1-J0` control runs `--repo LANE`, and any manual run can), and it
becomes reachable if the clone ever fetches all refs / is `--mirror`. Severity therefore **low**,
not medium: the avenue is real, the adversarial precondition (control of the repo the counter reads)
is the same one that lets you write the repo honestly anyway — but the *asymmetry between the two
counters* is the part that matters, because it makes C2's evidence unverifiable-by-comparison.

**Smallest remediation (next round)**: give C2 the same three settings C1 has
(`GIT_NO_REPLACE_OBJECTS=1`, `GIT_GRAFT_FILE=/dev/null`, `-c core.commitGraph=false`) — better,
factor one shared `git()` helper into both counters so the env can't drift again — and have
`measure.sh` record `git -C "$d" for-each-ref refs/replace` (must be empty) in the provenance file.

**Clean on the other untrusted-record paths** (verified, worth stating because they are the
strong pattern in this round):
- The gate is digest-pinned *inside* the counter (`GATE_SHA256`, `c2:…:441` and
  `c1:ADJ_GATE_SHA256` at `:254-255`) before it is written and executed/imported — an attacker who
  controls REV cannot substitute the gate. `check-adjacency.mjs` is spawned with a minimal env
  (`ENV`, no `NODE_OPTIONS`), so the parent env cannot inject a loader into the child.
- Receipt paths (`receipt.driver`, `run.transcript`) are untrusted repo content used only through
  `blob()` (guarded, A1) and only compared; refusal order is `schema → fixtureSha256 →
  browserVersion → driver path/sha → byte-copy → wsNorm copy → import allow-list → ≥2 runs →
  transcript sha → sessionId shape`. `Object.hasOwn(gate.ROWS, id)` + duplicate-id refusal bound
  the population, so the entry table cannot be padded past the gate's frozen row set.
- C1's `newRowOk` path applies `baseKeys`/`mappedRowNos`/`n1..n4` checks before a row can count;
  no string from a ledger is ever `eval`'d or used as a path component beyond the regex-constrained
  lane token.

**Observation (info, claim-strength, not a counter defect) — C1's drift surface is self-referential.**
`c1-adjacency-sweep-v4.mjs:369-380` reads the delta heads from `.ufo/waves/round-36/baseline/c1-delta-pins.json`
*at REV*, validates only "40-hex, known lane, resolvable", and derives `drifted` from that file.
The frozen predicate (`:558-568`) requires `drift.total >= 1` and `coverage == total` — it does not
require the 12 lanes / 307 rows the claim's `surface` prose names. A pin set that under-declares
drifted lanes therefore shrinks the audited pool (down to 1 row) and still passes. The counter is
**faithful to the frozen predicate**, so this is not a defect of the instrument; the guard is
`frozenDigests` in `claims.json` — but `measure.sh:29-32` records sha256 only for the two counters
and the gates, **not** for `c1-delta-pins.json`, so a w2 seat must recompute that digest by hand.
Recommendation: `measure.sh` print `sha256` of every file listed in `frozenDigests`, and the w2
attack list explicitly include "pins file declares fewer drifted lanes".

---

## A8 — Process cleanup · FINDING

`c2-firefox-bidi-v2.mjs:303-312` (finally block):

```js
if (sessionId) { try { await fetch(`http://127.0.0.1:${port}/session/${sessionId}`, {method:'DELETE'}); } catch {} }
gd.kill('SIGTERM');
await fx.close();
await sleep(500);
rmSync(scratch, { recursive: true, force: true });
```

**Finding A8-1 (low)** — there is **no wait for `gd` to exit and no SIGKILL escalation**. The
scratch tree (Firefox profile, `home`) is deleted 500 ms after `SIGTERM` regardless of whether
geckodriver has torn the browser down. Consequences: (a) a geckodriver/firefox that ignores or
delays `SIGTERM` survives the counter as an orphan (and, being spawned `stdio:'ignore'`, exits into
nobody's log); (b) the "removed on exit" claim in the header (`:56-59`) is enforced only by a
sleep — a still-live browser can recreate files under `scratch/` *after* the `rmSync` and leave
residue under `/fast/scratch/…` for the rest of the round [INFERENCE: re-creation not observed; the
missing exit wait is the observable fact]. It also means `egressNonLoopback` can be read as 0 while
a browser is still alive for a few hundred ms past the sampled window — the sampler is stopped one
line earlier (`:305`).

**Smallest remediation**: `const exited = once(gd, 'exit')`; after `kill('SIGTERM')`
`await Promise.race([exited, sleep(3000)])`; then `gd.kill('SIGKILL')`, `await exited`; move
`rmSync` after that, and stop the sampler *after* the last exit (or keep sampling until exit so the
reading covers the whole session). Add `scratch` removal to a `process.on('exit')` guard for the
hard-kill case.

**Note (info)** — `controls.mjs` has the same "delete on the way out" shape but its children are
`spawnSync` (waited), so no orphan window there; `measure.sh` has a real `trap 'rm -rf -- "$S"'
EXIT` (`:10`) which is the pattern A8 recommends.

---

## Operability verdict for my axis

Instruments are operable as written: pinned binaries still match their install receipts on this
host; `geckodriver` binds loopback by default and is invoked without `--host`; the fixture server
binds `127.0.0.1`; both counters refuse by `Refusal → exit 2` on every check I exercised the code
path of; no child process is built from a shell string; the symlink-refused writer works exactly as
the amendment claims (A3 verified by execution, not by reading alone); and no tool writes outside
`$TMPDIR` and the lane. The findings above are low-severity hardening gaps plus two
instrument-scope limits (TCP-ESTABLISHED-only egress sampling; drift surface derived from a
lane-committed pins file), none of which lets a fixture be admitted or a fabricated ledger pass.

## Reproducers (this seat dir)

- `probes/probe-safewrite.mjs` — extracts `safeWrite` verbatim from the frozen C1 counter; four
  symlink cases (A3).
- `probes/probe-replace-refs.sh` — replace-ref substitution under C2's vs C1's git env; `rev:path`
  traversal refusals; `clone --shared` replace-ref count (A1, A7).
- `probes/probe-tcp6-loopback.py` — `::1` rendering in `/proc/net/tcp6` vs the counter's loopback
  constants, with inode-column confirmation (A5).
- `probes/probe-tmp-guard.mjs` — the `..` bypass of `controls.mjs`'s TMPDIR prefix guard (A6-2).

No tool installation was needed for this seat; nothing was upgraded.

VERDICT finding — no avenue gives a forger or a fixture a way past the frozen kill rules; eight
low/informational items, the two that should be routed next round being C2's missing
`GIT_NO_REPLACE_OBJECTS` (A7-1, breaks counter-to-counter comparability of one REV) and the
geckodriver teardown without an exit wait (A8-1); A5-2 (TCP-ESTABLISHED-only egress sampling) is a
claim-strength limit wave 2 should probe.
