# RevC1Battery — env-gate surface audit (round 42, C1 admission wave)

Seat: `RevC1Battery` (leaf). Scope: read-only audit of the frozen round-41 env gate used by the
C1 admission chain; findings only, no lane edits. All work products live under this seat dir and
`/fast/scratch/hyaku/tabi-r42/RevC1Battery/` (deleted before yield).

Audited bytes (working tree, digests equal the frozen pins in `.ufo/waves/round-41/claims.json`):

```
$ sha256sum scripts/measure-c1-round41.mjs scripts/playwright-firefox-egress-round41.mjs .ufo/waves/round-41/counters/c1-session-bound-v4.mjs
4563e5deccc9bcba8e75c72867c88b8f65de0241a4726c81659d9d82e9895c76  scripts/measure-c1-round41.mjs
fb279c74b82abe6202680c214fd087b45b1134a19c5e21b028abeae3549180a3  scripts/playwright-firefox-egress-round41.mjs
cd71a59efa575fc260c4e487b7d52f69a9cd9f3b98bc6d4333abdb9a0cff126a  .ufo/waves/round-41/counters/c1-session-bound-v4.mjs
```
(`frozenDigests` match all three; `producerPins.nodeSha256` = `7fde7b8a…46df4c` = the fnm v24.21.0 node used in every run below.)

## 1. What the gate actually is (line citations)

`scripts/measure-c1-round41.mjs`

- L41 `FORBIDDEN_ENV` — a **name** regex, 18 alternatives:
  `NODE_OPTIONS|NODE_PATH|NODE_EXTRA_CA_CERTS|NODE_PENDING_DEPRECATION|LD_.*|DYLD_.*|BUN_.*|PYTHONPATH|PYTHONHOME|PYTHONSTARTUP|RUBYOPT|RUBYLIB|PERL5OPT|PERL5LIB|JAVA_TOOL_OPTIONS|_JAVA_OPTIONS|JDK_JAVA_OPTIONS`.
- L42 `ENV_ALLOW` — a 25-name **allow-list**; no name in it matches `FORBIDDEN_ENV` (checked programmatically: empty intersection).
- L91-104 `selfEnvCheck()` — reads `/proc/self/environ` (kernel exec record) and `process.execArgv`.
- L69-83 `runGate()` — spawns `node --eval <GATE_SRC>` with `scrubEnv()`; the child reads its own and its
  **parent's** `/proc/<ppid>/environ`, so the wrapper's exec-time record is cross-checked by an
  independently spawned process.
- L84-89 `scrubEnv()` — the *only* env constructor for every child spawn site.
- L161-176 `measureMain()` Stage 0 (comment L169-170: "refuse any loader/injection vector **before any
  child is spawned**"); refusal = `environment-loader-contamination`, exit 2.
- Spawn sites: L46 `execFileSync('getconf')` at module load (**inherits the full, unscrubbed env**);
  L72 gate child (`scrubEnv`); L140 witness (`scrubEnv` + `TABI_WITNESS_*`, `TABI_RUN_NONCE`);
  L202 driver (`scrubEnv` + fresh nonce/scratch); L223 counter (`scrubEnv`); L265 battery bash
  (`scrubEnv`); L272 clean probe (`scrubEnv`).

`scripts/playwright-firefox-egress-round41.mjs` (driver)

- L41 `LOADER_ENV_RE` — same 18 names, tested as `name=`;
- L404-417 driver-side self-check runs inside `main()`, **after** module import;
- L40 `execFileSync('getconf')` runs at module import, i.e. before that check;
- L99 `spawnSync('ps')`, L161/L376 `spawnSync('ss')` — see F2;
- L279 `firefox.launch({ headless: true, ... })` — **no `env` option**, and playwright's bundled
  `launchProcess` passes `env: options.env` (`env === undefined` ⇒ `child_process.spawn` inherits the
  driver's `process.env`). So the browser child receives exactly the driver's (scrubbed) environment.

Inside the wrapper's `WITNESS_SRC`: L112 `getconf` and L118 `ps` — also bare-name PATH lookups.

So the gate has three channels: **(a)** forbidden env names in the wrapper's exec-time environ,
**(b)** a non-empty `process.execArgv`, **(c)** a child cross-check of the parent's environ; and one
containment rule: **children get only `ENV_ALLOW`**. Everything below is measured against that model.

## 2. Method (reproducible)

`evidence/harness-audit.mjs` drives the **real frozen wrapper**, no copies:

1. **Probe layer** — `node <wrapper> --battery-probe` with env `PATH/HOME/LANG/TMPDIR + ONE vector`
   ⇒ gate decision (exit 2 + `contaminated:true`, or exit 0 + `contaminated:false`).
2. **Measure layer (refused path)** — `node <wrapper> --out <fresh scratch dir>/receipt.json
   --scratch <regular file>`:
   - a refusal path prints its `environment-loader-contamination` JSON (the out dir is creatable);
   - an admitted vector reaches the **stage-2 scratch `mkdir`** and dies with
     `wrapper-exception EEXIST` — *after* Stage 0 and the digest stage, and *before*
     `spawnWitness` L200 / the driver L202, so **no browser can launch**.
   Both outcomes exit 2; the distinguishing field is `finding`.
3. **PATH layer** — a shim `getconf` that logs its caller.
4. **Bash layer** — `--battery` under `BASH_ENV`/`ENV` markers.
5. **Preload layer** — `logenv.c`/`logenv.so`, an `LD_PRELOAD` constructor that records its own
   `/proc/self/exe`, ppid and the presence of eight names.
6. **Coverage layer** — `NODE_V8_COVERAGE=<dir>` through the probe; inspect the files' `url` lists.

Aggregate invariants over the 63-vector matrix (`evidence/matrix.json`):
all 21 controls refused on **both** layers; all 42 candidates passed Stage 0 on **both** layers;
baseline (no vector) `--battery-probe` exit 0 / contaminated false, measure layer `wrapper-exception
EEXIST …/scratchstop`.

## 3. Vector matrix (63 vectors, one run each, both layers)

| vector | env name | in ENV_ALLOW | gate decision | reach | class |
|---|---|---|---|---|---|
| ctl NODE_OPTIONS --require (lane fixture) | NODE_OPTIONS | no | refused (probe exit 2, measure path exit 2 env-contamination) | none (process cannot start/refused) | loader code-load (refused) |
| ctl NODE_OPTIONS --experimental-loader (lane fixture) | NODE_OPTIONS | no | refused (probe exit 2, measure path exit 2 env-contamination) | none (process cannot start/refused) | loader code-load (refused) |
| ctl NODE_OPTIONS empty value | NODE_OPTIONS | no | refused (probe exit 2, measure path exit 2 env-contamination) | none (process cannot start/refused) | loader code-load (refused) |
| ctl NODE_PATH | NODE_PATH | no | refused (probe exit 2, measure path exit 2 env-contamination) | none (refused) | module-resolution code-load (refused) |
| ctl NODE_EXTRA_CA_CERTS | NODE_EXTRA_CA_CERTS | no | refused (probe exit 2, measure path exit 2 env-contamination) | none (refused) | trust-store injection (refused) |
| ctl NODE_PENDING_DEPRECATION | NODE_PENDING_DEPRECATION | no | refused (probe exit 2, measure path exit 2 env-contamination) | none (refused) | process-wide flag (refused) |
| ctl LD_PRELOAD | LD_PRELOAD | no | refused (probe exit 2, measure path exit 2 env-contamination) | wrapper + pre-gate getconf child (refused afterwards) | shared-object code-load; runs in wrapper AND getconf child before refusal |
| ctl LD_LIBRARY_PATH | LD_LIBRARY_PATH | no | refused (probe exit 2, measure path exit 2 env-contamination) | none (refused) | linker search-path code-load (refused) |
| ctl LD_AUDIT | LD_AUDIT | no | refused (probe exit 2, measure path exit 2 env-contamination) | none (refused) | audit-library code-load (refused) |
| ctl DYLD_INSERT_LIBRARIES | DYLD_INSERT_LIBRARIES | no | refused (probe exit 2, measure path exit 2 env-contamination) | none (refused) | macOS code-load (refused, not applicable) |
| ctl BUN_INSPECT | BUN_INSPECT | no | refused (probe exit 2, measure path exit 2 env-contamination) | none (refused) | foreign-runtime debug (refused) |
| ctl PYTHONPATH | PYTHONPATH | no | refused (probe exit 2, measure path exit 2 env-contamination) | none (refused) | foreign-runtime import (refused) |
| ctl PYTHONHOME | PYTHONHOME | no | refused (probe exit 2, measure path exit 2 env-contamination) | none (refused) | foreign-runtime (refused) |
| ctl PYTHONSTARTUP | PYTHONSTARTUP | no | refused (probe exit 2, measure path exit 2 env-contamination) | none (refused) | foreign-runtime exec (refused) |
| ctl RUBYOPT | RUBYOPT | no | refused (probe exit 2, measure path exit 2 env-contamination) | none (refused) | foreign-runtime require (refused) |
| ctl RUBYLIB | RUBYLIB | no | refused (probe exit 2, measure path exit 2 env-contamination) | none (refused) | foreign-runtime load-path (refused) |
| ctl PERL5OPT | PERL5OPT | no | refused (probe exit 2, measure path exit 2 env-contamination) | none (refused) | foreign-runtime load (refused) |
| ctl PERL5LIB | PERL5LIB | no | refused (probe exit 2, measure path exit 2 env-contamination) | none (refused) | foreign-runtime load-path (refused) |
| ctl JAVA_TOOL_OPTIONS | JAVA_TOOL_OPTIONS | no | refused (probe exit 2, measure path exit 2 env-contamination) | none (refused) | JVM agent code-load (refused) |
| ctl _JAVA_OPTIONS | _JAVA_OPTIONS | no | refused (probe exit 2, measure path exit 2 env-contamination) | none (refused) | JVM option (refused) |
| ctl JDK_JAVA_OPTIONS | JDK_JAVA_OPTIONS | no | refused (probe exit 2, measure path exit 2 env-contamination) | none (refused) | JVM option (refused) |
| cand BASH_ENV | BASH_ENV | no | passes (probe exit 0, measure path proceeds to stage-2 scratch mkdir) | none (scrubbed for every bash child) | shell startup code-exec; no bash child receives it |
| cand ENV | ENV | no | passes (probe exit 0, measure path proceeds to stage-2 scratch mkdir) | none (scrubbed) | shell startup code-exec; no bash child receives it |
| cand SHELLOPTS | SHELLOPTS | no | passes (probe exit 0, measure path proceeds to stage-2 scratch mkdir) | none (scrubbed; bash does not take it from env anyway) | shell option channel; no bash child receives it |
| cand BASHOPTS | BASHOPTS | no | passes (probe exit 0, measure path proceeds to stage-2 scratch mkdir) | none (scrubbed; not env-readable) | shell option channel; no bash child receives it |
| cand GEM_HOME | GEM_HOME | no | passes (probe exit 0, measure path proceeds to stage-2 scratch mkdir) | none (not ruby) | ruby gem path; unreachable |
| cand GEM_PATH | GEM_PATH | no | passes (probe exit 0, measure path proceeds to stage-2 scratch mkdir) | none (not ruby) | ruby gem path; unreachable |
| cand BUNDLE_BIN | BUNDLE_BIN | no | passes (probe exit 0, measure path proceeds to stage-2 scratch mkdir) | none (not ruby) | bundler path; unreachable |
| cand BUNDLE_GEMFILE | BUNDLE_GEMFILE | no | passes (probe exit 0, measure path proceeds to stage-2 scratch mkdir) | none (not ruby) | bundler manifest; unreachable |
| cand NODE_COMPILE_CACHE | NODE_COMPILE_CACHE | no | passes (probe exit 0, measure path proceeds to stage-2 scratch mkdir) | wrapper only (no propagation) | write primitive into a caller-chosen directory (wrapper) |
| cand NODE_V8_COVERAGE | NODE_V8_COVERAGE | no | passes (probe exit 0, measure path proceeds to stage-2 scratch mkdir) | wrapper + gate child + witness + driver + counter (Node re-propagation) | write primitive into a caller-chosen directory, propagated by Node past scrubEnv() |
| cand PYTHONINSPECT | PYTHONINSPECT | no | passes (probe exit 0, measure path proceeds to stage-2 scratch mkdir) | none (not python) | python REPL; unreachable |
| cand PYTHONWARNINGS | PYTHONWARNINGS | no | passes (probe exit 0, measure path proceeds to stage-2 scratch mkdir) | none (not python) | python; unreachable |
| cand LC_ALL overload | LC_ALL | yes | passes (probe exit 0, measure path proceeds to stage-2 scratch mkdir) | wrapper + gate child + witness + driver + browser (locale only) | locale only; no code-load observed (invalid value accepted, exit 0) |
| cand LOCPATH | LOCPATH | no | passes (probe exit 0, measure path proceeds to stage-2 scratch mkdir) | none (scrubbed; glibc wants the env name) | locale search path; scrubbed |
| cand NLSPATH | NLSPATH | no | passes (probe exit 0, measure path proceeds to stage-2 scratch mkdir) | none (scrubbed) | message catalogue path; scrubbed |
| cand OPENSSL_CONF | OPENSSL_CONF | no | passes (probe exit 0, measure path proceeds to stage-2 scratch mkdir) | none (node ignores env OPENSSL_CONF; scrubbed for children) | would be an OpenSSL provider/module load, but node ignores the env var (positive control: --openssl-config is parsed) |
| cand OPENSSL_MODULES | OPENSSL_MODULES | no | passes (probe exit 0, measure path proceeds to stage-2 scratch mkdir) | none (scrubbed) | OpenSSL provider dir; node ignores env, scrubbed |
| cand OPENSSL_ENGINES | OPENSSL_ENGINES | no | passes (probe exit 0, measure path proceeds to stage-2 scratch mkdir) | none (scrubbed) | OpenSSL engine dir; node ignores env, scrubbed |
| cand GLIBC_TUNABLES | GLIBC_TUNABLES | no | passes (probe exit 0, measure path proceeds to stage-2 scratch mkdir) | wrapper only (ld.so reads at exec; scrubbed for children) | ld.so tunables; wrapper at exec only, no effect observed |
| cand NODE_TLS_REJECT_UNAUTHORIZED | NODE_TLS_REJECT_UNAUTHORIZED | no | passes (probe exit 0, measure path proceeds to stage-2 scratch mkdir) | wrapper only (no TLS in the chain) | TLS verification off (wrapper); chain performs no TLS |
| cand NODE_DEBUG | NODE_DEBUG | no | passes (probe exit 0, measure path proceeds to stage-2 scratch mkdir) | wrapper only (diagnostics) | diagnostics to stderr (wrapper) |
| cand NODE_NO_WARNINGS | NODE_NO_WARNINGS | no | passes (probe exit 0, measure path proceeds to stage-2 scratch mkdir) | wrapper only (diagnostics) | diagnostics suppression (wrapper) |
| cand MOZ_LOG | MOZ_LOG | no | passes (probe exit 0, measure path proceeds to stage-2 scratch mkdir) | none (scrubbed; browser never receives) | browser logging; unreachable |
| cand MOZ_LOG_FILE | MOZ_LOG_FILE | no | passes (probe exit 0, measure path proceeds to stage-2 scratch mkdir) | none (scrubbed) | browser logging file; unreachable |
| cand MOZ_DISABLE_CONTENT_SANDBOX | MOZ_DISABLE_CONTENT_SANDBOX | no | passes (probe exit 0, measure path proceeds to stage-2 scratch mkdir) | none (scrubbed) | browser sandbox weakening; unreachable |
| cand MOZ_CRASHREPORTER | MOZ_CRASHREPORTER | no | passes (probe exit 0, measure path proceeds to stage-2 scratch mkdir) | none (scrubbed) | browser crash handler; unreachable |
| cand HTTP_PROXY | HTTP_PROXY | no | passes (probe exit 0, measure path proceeds to stage-2 scratch mkdir) | none (scrubbed; egress cannot be proxied) | egress proxying; unreachable |
| cand HTTPS_PROXY | HTTPS_PROXY | no | passes (probe exit 0, measure path proceeds to stage-2 scratch mkdir) | none (scrubbed) | egress proxying; unreachable |
| cand DEBUG (playwright) | DEBUG | no | passes (probe exit 0, measure path proceeds to stage-2 scratch mkdir) | none (scrubbed; playwright debug never reaches the driver) | playwright debug; unreachable |
| cand PLAYWRIGHT_BROWSERS_PATH | PLAYWRIGHT_BROWSERS_PATH | no | passes (probe exit 0, measure path proceeds to stage-2 scratch mkdir) | none (scrubbed; driver pins the browser path) | browser binary path; unreachable |
| cand SSH_AUTH_SOCK | SSH_AUTH_SOCK | yes | passes (probe exit 0, measure path proceeds to stage-2 scratch mkdir) | wrapper + gate child + witness + driver + browser | host ssh-agent socket handed to the browser process |
| cand DBUS_SESSION_BUS_ADDRESS | DBUS_SESSION_BUS_ADDRESS | yes | passes (probe exit 0, measure path proceeds to stage-2 scratch mkdir) | wrapper + gate child + witness + driver + browser | host session bus handed to the browser process |
| cand FONTCONFIG_FILE | FONTCONFIG_FILE | yes | passes (probe exit 0, measure path proceeds to stage-2 scratch mkdir) | wrapper + gate child + witness + driver + browser (config file parsed by fontconfig) | attacker-controlled fontconfig config parsed in the browser process |
| cand FONTCONFIG_PATH | FONTCONFIG_PATH | yes | passes (probe exit 0, measure path proceeds to stage-2 scratch mkdir) | wrapper + gate child + witness + driver + browser | attacker-controlled fontconfig config dir |
| cand XDG_CONFIG_HOME | XDG_CONFIG_HOME | yes | passes (probe exit 0, measure path proceeds to stage-2 scratch mkdir) | wrapper + gate child + witness + driver + browser | config dir into the browser/driver |
| cand TMPDIR | TMPDIR | yes | passes (probe exit 0, measure path proceeds to stage-2 scratch mkdir) | wrapper + gate child + witness + driver + browser (profile/tmp base) | tmp/profile base |
| cand DISPLAY | DISPLAY | yes | passes (probe exit 0, measure path proceeds to stage-2 scratch mkdir) | wrapper + gate child + witness + driver + browser | X11 session capability handed to the browser |
| cand WAYLAND_DISPLAY | WAYLAND_DISPLAY | yes | passes (probe exit 0, measure path proceeds to stage-2 scratch mkdir) | wrapper + gate child + witness + driver + browser | Wayland session capability handed to the browser |
| cand XAUTHORITY | XAUTHORITY | yes | passes (probe exit 0, measure path proceeds to stage-2 scratch mkdir) | wrapper + gate child + witness + driver + browser | X11 auth cookie path handed to the browser |
| cand TABI_RUN_NONCE | TABI_RUN_NONCE | yes | passes (probe exit 0, measure path proceeds to stage-2 scratch mkdir) | forwarded but overwritten by the fresh nonce at both spawn sites | measurement input; overwritten |
| cand HYAKU_SCRATCH | HYAKU_SCRATCH | yes | passes (probe exit 0, measure path proceeds to stage-2 scratch mkdir) | forwarded but overwritten with the resolved scratch path | measurement input; overwritten |
| cand SHELL | SHELL | yes | passes (probe exit 0, measure path proceeds to stage-2 scratch mkdir) | wrapper + gate child + witness + driver + browser (unused) | unused by the chain |

## 4. Findings

### F1 (high) — `NODE_V8_COVERAGE`: gate passes **and** reaches children the scrub was meant to protect

- Gate verdict for the name: `--battery-probe` **exit 0, contaminated false**; the measure layer proceeds
  past Stage 0 (matrix row `cand NODE_V8_COVERAGE`).
- The name is **not** in `ENV_ALLOW`, so `scrubEnv()` removes it from the env object it hands to the gate
  child, witness, driver and counter — and yet the gate child **wrote a coverage file**:
  ```
  $ NODE_V8_COVERAGE=<dir> node scripts/measure-c1-round41.mjs --battery-probe
  exit 0
  files: coverage-2223737-…-0.json  urls: file:///…/scripts/measure-c1-round41.mjs
         coverage-2223801-…-0.json  urls: [eval], [eval]-wrapper      <-- the gate child
  ```
- Cause is documented in the lane's **own pinned source S148**
  (`.ufo/waves/round-41/sources/node-cli-v24.21.0.html`): *"NODE_V8_COVERAGE will automatically
  propagate to subprocesses … can be set to an empty string, to prevent propagation."* Confirmed in
  isolation: a child spawned with `env: {PATH}` still sees the parent's value.
- Reach: wrapper → gate child → witness → driver → counter (every node process in the chain).
  Class: **write primitive into a caller-chosen directory**, plus script/function inventory of the
  producer bytes. Not a code-load, but it is a write path the env boundary explicitly claims to close,
  and it can point at the read-only production tree or another seat's evidence dir.
- `NODE_V8_COVERAGE=""` suppresses propagation (tested: no coverage dir created), so a one-line gate
  fix exists; I am not proposing amendments (bytes are frozen) — routing as a finding.

### F2 (high) — `PATH` is allow-listed and forwarded verbatim, and the producers resolve binaries by bare name

- `PATH` is in `ENV_ALLOW` (L42) and therefore reaches the gate child, witness, driver, counter and the
  browser. The producers then resolve helpers **through PATH**:
  wrapper L46 `execFileSync('getconf')`; driver import-time L40 `getconf`, L99 `ps`, L161/L376 `ss`;
  witness L112 `getconf`, L118 `ps`.
- Demonstrated live, no browser:
  ```
  $ PATH=<shim>:/usr/local/bin:/usr/bin:/bin node scripts/measure-c1-round41.mjs --battery-probe
  exit 0                                        # gate passes
  shim-log: caller=MainThread pid=2222530 ppid=… args=CLK_TCK
  $ PATH=<shim>:… node scripts/playwright-firefox-egress-round41.mjs      # no args
  usage: --out <fresh receipt.json> …
  exit=64
  shim-log: caller=MainThread pid=2222745 ppid=… args=CLK_TCK
  ```
  i.e. arbitrary code from a caller-supplied directory executes inside the wrapper **and** inside the
  driver *before* each process's own env check (wrapper L46 < L171; driver L40 < L404).
- Consequence beyond code-exec: the driver's egress observation is built on `ss` (L161, L376) and its
  owned-tree on `ps` (L99). A PATH-substituted `ss`/`ps` forges those observations; only the second
  surface (`/proc/<pid>/fd` × `/proc/net/tcp*`, read directly) is not PATH-substitutable.
- Class: **binary-resolution code execution inside the producer processes**; the gate cannot see it
  because the name is allow-listed by design and the check is name-only (no value inspection).

### F3 (medium) — "refuse before any child is spawned" is false: L46 spawns an unscrubbed child first

- L46 `uptimeTicks` runs `execFileSync('getconf', …)` at module load, i.e. before Stage 0 (L171).
  `execFileSync` without `env` inherits the full parent environment — it is the **one** spawn site not
  passed through `scrubEnv()`.
- Evidence (`evidence/preload-log.txt`, `LD_PRELOAD=logenv.so`):
  ```
  probe exit 2 finding environment-loader-contamination constructor invocations 2
  pid=2223614 ppid=… exe=…/bin/node  LD_PRELOAD=SET … PATH=SET
  pid=2223636 ppid=2223614 exe=/usr/bin/getconf LD_PRELOAD=SET … PATH=SET
  ```
  The second line is the L46 child: a **forbidden vector reached a child and executed code there**
  before the gate refused. The gate child, witness, driver and counter did **not** load the preload
  (no `/usr/bin/node … --eval` lines), confirming `scrubEnv()` works at those four sites.
- Consequence: for `LD_PRELOAD`-class vectors the refusal is honest for the verdict but not for the
  tree — attacker code already ran in the measurement's own descendant tree.

### F4 (medium) — refusal is detection-after-execution, and exit 2 does not mean "nothing ran"

- `NODE_OPTIONS=--require <lane forger>`, `LD_PRELOAD`, `NODE_PATH` all take effect at **exec** of the
  wrapper, before `selfEnvCheck()` (L171) can look. The controls do refuse (exit 2 —
  `environment-loader-contamination`, matrix) but only after the injected code ran; F3 shows a child
  executing it too.
- Therefore: for the kill rule's "do-nothing reach" analysis, an exit-2 refusal is evidence the gate
  *saw* a vector, not evidence that no attacker code executed in the process tree; and the same exit
  code `2` is used by refusals and by late exceptions (F8).

### F5 (low) — `NODE_COMPILE_CACHE`: gate passes, wrapper-only, caller-chosen write

- Probe: exit 0, contaminated false. The wrapper's own node honours it — the cache directory is created
  at the caller-supplied path (`ncc/v24.21.0-x64-964aae3f-1000/`).
- Not propagated: a child spawned with a stripped env sees `NODE_COMPILE_CACHE=null`, so reach is the
  wrapper process only. I did **not** demonstrate that a poisoned cache entry yields code execution, so
  no code-load claim is made; the demonstrated effect is a directory/file write outside the intended
  scratch tree from the producer process, before Stage 0.

### F6 (low) — host-capability names reach the measured browser

Driver L279 launches Firefox with no `env` option; playwright's bundled `launchProcess` does
`env: options.env`, so `undefined` ⇒ the browser inherits the driver's env, i.e. exactly `ENV_ALLOW`.
That allow-list contains `DISPLAY`, `WAYLAND_DISPLAY`, `XAUTHORITY`, `DBUS_SESSION_BUS_ADDRESS`,
`SSH_AUTH_SOCK`, `HOME`, `XDG_CONFIG_HOME`, `TMPDIR`, `FONTCONFIG_FILE`, `FONTCONFIG_PATH`.
Live proof that an attacker-chosen `FONTCONFIG_FILE` is parsed (fontconfig, the library Firefox uses):

```
$ FONTCONFIG_FILE=<attacker>/fonts.conf fc-match
Fontconfig error: Cannot load config file "<attacker>/included-by-attacker.conf": File not found
Fontconfig error: Cannot load config file from "<attacker>/fonts.conf"
LiberationSans-Regular.ttf: "Liberation Sans" "Regular"
```
(`evidence/fontconfig-fc-match.txt`.) So the "loader-clean" boundary is not "host-capability-clean":
the measured browser process is handed a session bus, an ssh-agent socket, an X/Wayland session and an
attacker-selected fontconfig config. Whether any of these can flip an egress observation is not
demonstrated here; they are disclosed as reach-capable inputs to the measured process.

### F7 (informational) — gate misses it, and it genuinely cannot reach (scrubbed everywhere)

`BASH_ENV`, `ENV`, `SHELLOPTS`, `BASHOPTS`, `GEM_HOME/GEM_PATH`, `BUNDLE_BIN/BUNDLE_GEMFILE`,
`PYTHONINSPECT`, `PYTHONWARNINGS`, `LOCPATH`, `NLSPATH`, `OPENSSL_CONF/_MODULES/_ENGINES`,
`MOZ_LOG/_FILE`, `MOZ_DISABLE_CONTENT_SANDBOX`, `MOZ_CRASHREPORTER`, `HTTP_PROXY/HTTPS_PROXY`, `DEBUG`,
`PLAYWRIGHT_BROWSERS_PATH` — all probe exit 0, all stripped by `scrubEnv()` at every scrub site.
Live negative for the shell class: `--battery` under `BASH_ENV=<marker>` **and** `ENV=<marker>` returned
`allPass:true` with **no marker file** (`bashEnvBattery.markerExists=false`) — the battery's
`/bin/bash` children (L265) receive `scrubEnv()`.

`OPENSSL_CONF` deserves its own line: node **ignores** the env var (positive control:
`node --openssl-config <bad.cnf>` fails with `OpenSSL configuration error: … missing equal sign`,
`evidence/bad.cnf`), so the provider-module path is real at the OpenSSL level but not reachable through
the environment by node; and it is scrubbed for children anyway.

`GLIBC_TUNABLES` (not in the brief's list) is also missed and reaches the wrapper's exec only
(ld.so parses it before node), with no observable effect
(`GLIBC_TUNABLES=glibc.malloc.nonexistent=999 node -e …` → normal exit 0).

### F8 (informational) — the argv channel is covered, but diagnostics are ambiguous

`node --require|--experimental-loader|--import|--inspect|--env-file <wrapper> --battery-probe` each
report `contaminated:true`, `finding:environment-loader-contamination`, exit 2, with
`execArgvClean:false` (`evidence/argv-channel.txt`) — the gate's second channel works, including for
Node 24's `--import` and `--env-file`, which the env battery does not exercise.

Separately: **exit code 2 is overloaded**. Refusal uses 2 (`refuse()` L154-158) and so does the generic
`wrapper-exception` catch (L283). Because `refuse()` calls `mkdirSync(dirname(outPath))` *before*
printing, an uncreatable out dir turns an env refusal into `wrapper-exception EEXIST` with the same
exit 2 and no gate report (observed while building the harness). A caller checking only the exit code
cannot tell "gate refused" from "gate passed, later stage failed"; the `finding` field must be read.

### F9 (informational) — neither overridable input is actually overridable

`TABI_RUN_NONCE` and `HYAKU_SCRATCH` are allow-listed but the wrapper supplies its own values at both
relevant spawn sites (L202-203 and the witness env at L139), so a caller-set value is overwritten;
no freshness or scratch-location consequence was found.

## 5. Residual risk

1. `PATH` (F2) and `NODE_V8_COVERAGE` (F1) are the two admitted vectors with real reach; both are
   caller-controlled at invocation time, and the counting command in the claim is run from a shell
   whose environment the caller chooses. F2 additionally touches the observation surface (`ss`/`ps`),
   so "the receipt says zero non-loopback egress" is only as trustworthy as the invocation PATH (the
   `/proc` surface remains independent).
2. F3/F4 mean the gate is an **attribution** control, not a **containment** control, for everything that
   acts at exec time.
3. F6 broadens the measured process's inputs (session bus, ssh-agent, fontconfig) without any check.

## 6. Verification gaps (what I did not run)

- No live browser run was used for the reach claims; the driver's `ps`/`ss` substitution is established
  from code (L99/L161/L376) plus the demonstrated import-time `getconf` execution, not from a live
  session.
- `NODE_COMPILE_CACHE` poisoning was not turned into a code-execution proof (not claimed).
- The counter (`c1-session-bound-v4.mjs`) was not run under vectors; it is spawned with `scrubEnv()`
  (L223) and therefore only inherits the F1 propagation.
- I did not attempt to forge a receipt through F2 — that is a lane attack, out of this seat's bounds.

## 7. Limitations & disclosures

- **One unintended full chain run.** My first stop design put the out dir inside a *nonexistent* path;
  the wrapper created it and the full loopback chain ran once (`elapsedMs 5522`, driver exit 0, counter
  exit 0, `predicate:true`, `findings:[]`). All artifacts stayed inside `/fast/scratch/hyaku/tabi-r42/
  RevC1Battery/` and were deleted with the scratch tree; nothing was written to the production tree,
  the fleet repo, sibling repos or another seat. It is a control observation only — not a C1 measurement
  (no receipt was committed).
- A second stop design (`--out` inside an existing regular file) exposed a Node behaviour worth knowing:
  `fs.mkdirSync(path, {recursive:true})` on `/proc/<missing>` retries `mkdir("/proc")` in a tight
  ENOENT loop (observed with strace); it burned one call's 600 s budget before I replaced the stop with
  the scratch-path-is-a-file design. Unrelated to the gate, but it is why the harness looks the way it
  does.
- No files under `tabi-shokunin`, the fleet repo, sibling `*-shokunin` repos or `shokuknow` were
  modified; the only writes are this seat dir and the deleted scratch tree. No commits, pushes or
  agents.
- Tooling: **nothing installed or upgraded.** Used existing `/usr/bin/gcc` 16.2.1 to build the
  1-constructor `LD_PRELOAD` logger (`evidence/logenv.c`) in scratch; node v24.21.0 (fnm, pinned
  digest), `ss`, `ps`, `getconf`, `fc-match` from the host.

## 8. Artifacts

- `evidence/matrix.json` — full 63-vector matrix plus the six supplementary experiments.
- `evidence/harness-audit.mjs` — the harness that produced it (runs the frozen wrapper only).
- `evidence/preload-log.txt`, `evidence/path-shim.txt`, `evidence/v8-coverage-propagation.txt`,
  `evidence/fontconfig-fc-match.txt`, `evidence/argv-channel.txt`, `evidence/logenv.c`,
  `evidence/ossl-conf.cnf`, `evidence/bad.cnf`.

VERDICT finding — the gate is sound for its 18 named vectors on both entry points (21/21 controls refused; argv channel covered), but it admits `NODE_V8_COVERAGE` (F1: Node re-propagates it into every scrubbed child → caller-chosen writes) and `PATH` (F2: bare-name `getconf`/`ps`/`ss` resolution → code execution inside wrapper and driver before their own checks), and its Stage-0 comment overstates containment (F3: L46 spawns an unscrubbed `getconf` child before the gate; F4: refusal is detection-after-execution).
