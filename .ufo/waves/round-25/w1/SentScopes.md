# SentScopes — security and write-scope review: C1 harness, C1/C2 counters (round 25, wave 1)

Seat: L1Tabi25.SentScopes (sentinel, read-only reporter). Date 2026-10-25. Lane HEAD `c8ef3084` (claims-freeze commit; `git merge-base --is-ancestor 9e136667 HEAD` → ancestor).
Environment observed: node v24.21.0, Chromium 154.0.8037.97 Arch Linux (`/usr/bin/chromium --version`), Python 3.14.8.
Writes: this report plus throwaway fixtures under `.ufo/waves/round-25/scratch/SentScopes/` (gitignored: `git check-ignore -v` → `.gitignore:5:.ufo/waves/*/scratch/`). No installs. No external network. No lane or tracked edits. Every chromium/python I started was cleaned up, with proof in §2.

## Axes
The review covers five classes: (a) receipt field leading to command execution, (b) reading session or credential material, (c) writing outside the lane or scratch, (d) hanging on a hostile receipt, (e) orphan processes or ports. Two named checks follow: CDP loopback binding and kill-by-pid.

## Surface reviewed (actual prototypes; production scripts do not exist yet)
| Artifact | sha256 / size |
|---|---|
| C1 counter proto `scratch/ExecCounterC1Proto/check-bfcache-receipt.mjs` | `1e199ffa…2046` (`sha256sum`), 180 lines |
| C2 counter proto `scratch/ExecCounterC2Proto/check-source-reopen-receipt.mjs` | `26ead9dd…2a8f` (`sha256sum`), 177 lines |
| C1 harness proto `scratch/ExecHarnessC1/probe.mjs` | 357 lines at read time (`wc -l`) |
| Diagnostics probe `scratch/ExecBfcacheDiagnostics/run.sh` + `driver.mjs` | 34 + 89 lines |

## 0. The design premise is false as stated
The premise says the counters "re-run no external commands except node itself". It cannot hold for `--rev`. Both counters spawn `git`: the C1 proto at lines 26–31 (`spawnSync("git", ["-C", repo, …])`) and in its selftest at line 129 (`git init/rm/add/commit`); the C2 proto at lines 22–27 and 65. The harness spawns `python3`, `/usr/bin/chromium`, `pgrep`, `ss` and `curl` (probe.mjs lines 84, 97, 267, 278–282).

Every spawn uses an argv array and never a shell. That is correct, but the claim text should say "node + read-only git" for the counters. Otherwise it is a fabricated-readiness statement.

## 1. Findings

Severity scale: High = defeats claim integrity, or hangs/orphans in the default path. Medium = needs a plausible precondition. Low = operator-supplied input or hygiene.

### (a) Attacker-controlled command execution from a receipt field
**Sweep (negative result):** none of the four prototypes passes any receipt field to a process.
- The C1 counter's only spawns are git, with fixed verbs, the rev, and `${sha}:${RECEIPT_PATH}`.
- The C2 counter's spawns are git; `raw_path` reaches git only inside `${rev}:${p}`, after a `RAW_PREFIX` + no-`..` check (line 71).
- Harness argv is built from internal constants and `freePort()` values.

Evidence: `rg -n "execFileSync|execSync|spawnSync|spawn\(|exec\(" ` over the proto files.

Latent risks a production version must not introduce:
- **A1 (Medium, latent):** the draft C2 receipt carries 6 shell strings, `fetch_command: "curl … '<url>'"` (`rg -c fetch_command scratch/ExecFreshnessReceipt/reopened.json` → 6). The lane already has a "run a command string from committed JSON" pattern: `scripts/pstack-seat.mjs:34` and `scripts/user-seat.mjs:34` call `spawnSync('bash', ['-c', slice.command])`. Any "re-verify by replaying fetch_command" step would give shell injection through a URL containing `'`.
  - Guard: receipts are data; no counter or harness ever executes a receipt string, and `fetch_command` stays descriptive only.
- **A2 (Medium, latent):** receipt `run.flags` must never be replayed into a browser launch. This binary carries command-executing switches (`rg -a -c -F` on `/usr/lib/chromium/chromium`: `renderer-cmd-prefix` 1, `utility-cmd-prefix` 1, `gpu-launcher` 1, `browser-subprocess-path` 1).
  - Guard: harness flags are a frozen constant array in the script, never read from a receipt or config.
- **A3 (Medium, host-level, outside lane):** `/etc/chromium/policies/managed` is `drwxrwxrwx root:root` and owned by no package (`stat`; `pacman -Qo` → "No package owns"). Any local process can drop a managed policy (for example a force-installed extension, meaning JS running in the measurement browser) that every chromium loads, whatever the env scrubbing or argv. The current content is benign: `color.json` = `{"BrowserThemeColor": "#121212", "BrowserColorScheme": "device"}`.
  - Guard: the harness records a sha256 listing of `/etc/chromium/policies/**` in the receipt. Operator remediation is `chmod 755` (needs sudo, outside my scope, not done).

### (b) Reading session or credential material
- **B1 (Medium): the harness inherits the full environment and the real `HOME`.** probe.mjs:100 passes `env: { ...process.env, XDG_CONFIG_HOME: XDG }`. diagnostics run.sh:16 passes the shell env unchanged.
  - Observed with a scratch `HOME`: chromium created `.local/share/pki` and `.cache/dconf/user` under `HOME` (E7 listing, `find . -maxdepth 3` in `e7-loop1/home`).
  - The user's real NSS databases exist (`stat ~/.local/share/pki/nssdb` → mtime 2026-10-03; `~/.pki/nssdb` → 2026-10-16), so with real `HOME` the harness browser opens the user's cert/key DB. [INFERENCE: I did not run chromium against the real `HOME` to avoid touching it.]
  - The inherited env also carries any secrets and the session-bus address into chromium and python. [INFERENCE: not inspected, by contract.]
  - Guard: env allowlist `{PATH=/usr/bin, HOME=<mkdtemp>, XDG_CONFIG_HOME=<empty dir>, LANG=C.UTF-8}` plus `--password-store=basic`. This exact env ran cleanly in E7.
- **B2 (Medium): user flag injection through the Arch launcher.** `/usr/bin/chromium` is a 14 KB ELF launcher ("Chromium launcher v8") that reads `/etc/chromium-flags.conf` and `$XDG_CONFIG_HOME/chromium-flags.conf`. With inherited `HOME` it injects 5 user flags, including `--load-extension=~/.local/share/omarchy/default/chromium/extensions/copy-url` (`env -i PATH=/usr/bin HOME=$HOME /usr/bin/chromium --help`). That means the user's extension code runs in the measurement browser.
  - diagnostics run.sh launches via that launcher with real `HOME` and records only the intended argv (`argv.txt`), not the effective argv.
  - probe.mjs neutralizes this with an empty `XDG_CONFIG_HOME` and records `/proc/<pid>/cmdline` — correct. Verified: with an empty `XDG_CONFIG_HOME`, `--help` lists no user flags.
  - Guard: exec `/usr/lib/chromium/chromium` directly (E7 shows `exe=/usr/lib/chromium/chromium`), or use the empty XDG. The counter must judge `run.effectiveArgv`, never `run.flags`.
- **B3 (Low): receipt contents.** Sweep for secret-shaped strings (`rg -c -i 'cookie|authorization|bearer|token|password|/home/vgpnk/\.(ssh|config|local/share/pki)'`): 6 hits per `ExecHarnessC1/runs/*/events.jsonl`, 18 per `ExecBfcacheDiagnostics/runs/*/capture.json`, 0 in `reopened.json`. All hits are CDP schema field names (`Cookies`, `cookiePartitionKey`, `cookiePartitionKeyOpaque`, `CookieInOtherPartition`), not values (`rg -o … | sort | uniq -c`). No credential bytes were observed.
  - Guard: the production harness never reads `/proc/*/environ`, and the counter rejects receipts containing `$HOME`-rooted paths outside the lane.
- **B4 (Low): `--file` mode in the C2 proto** follows symlinked *intermediate* directories (`O_NOFOLLOW` covers only the last component, line 30). Impact is an oracle only (digest/quote match, no echo), and the path is operator-supplied.

### (c) Writing outside the lane or escaping scratch
- **C1 (Medium, observed): the selftest writes into a foreign repo's index through hook-exported `GIT_INDEX_FILE`.**
  - Setup (E1): in a scratch repo, the pre-commit hook env under `git commit -a` contains an absolute `GIT_INDEX_FILE=/…/SentScopes/e1/.git/index.lock`. A plain `git commit` gives a relative `.git/index`.
  - Exploit (E2): the hook runs the C1 proto `--selftest`. Its temp-repo `git rm -rq corpus` and `git add corpus/evidence/round-25/bfcache/receipt.json` (lines 129–133, inherited env, no `env:` option) mutated the victim's `index.lock`.
  - Result: the outer commit failed with `error: invalid object 100644 03615a86… for 'corpus/evidence/round-25/bfcache/receipt.json'` / `Error building trees` (exit 1). The selftest itself crashed with an uncaught `Error`, exit 1.
  - Impact: a lane commit DoS plus a cross-repo index write. It failed closed only because the objects were missing.
  - The C2 proto's git calls also inherit env (line 23), and so does the C1 `evaluate` path (line 30, `...process.env`).
  - Guard: scrub every `GIT_*` variable; pass `GIT_CONFIG_NOSYSTEM=1`, `GIT_CONFIG_GLOBAL=/dev/null`, and `GIT_CEILING_DIRECTORIES`. The existing lane pattern `scripts/check-measurement-binding.mjs` `minimalEnv()` + `GIT_PREFIX` does this.
- **C2 (Low): `run.sh:6` runs `rm -rf "$D"` with `D=$S/runs/$NAME` and `$1` unvalidated.** `NAME=../..` deletes scratch-parent directories. probe.mjs is safe here: `OUT` is derived from a fixed mode enum (lines 10–20).
  - Guard: name regex `^[a-z0-9-]+$` plus a realpath containment check before any `rm`.
- **C3 (Medium, production path): profile placement.** The proto profile is `runs/<mode>/profile` inside scratch (gitignored). A production harness writing to `corpus/evidence/round-25/bfcache/` must keep the profile out of that tree, or a `git add` of the evidence dir commits `Local State`, `Default/Cookies`, and similar files.
  - Guard: profile in an `mkdtemp` outside the lane (round-21 pattern, `scripts/webmcp-lifecycle-round21.mjs:128`), output dir created exclusively (`existsSync → output_exists`, line 127), and writes with `flag:'wx'`.
- **C4 (Low): python `http.server` follows symlinks inside `--directory`.** [INFERENCE from CPython's `SimpleHTTPRequestHandler`; not tested.]
  - Guard: the fixture dir holds exactly the two regular files `a.html` and `b.html`, or use a node in-process server with a fixed route map (round-21 pattern, lines 132–144).

### (d) Hanging on a hostile receipt
- **D1 (High, observed): quadratic regexes in the C2 counter over committed raw bytes.** `text()` (C2 proto line 40) runs `/<[^>]+>/g` and `/<(script|style)\b[\s\S]*?<\/\1>/gi` on `raw_path` bytes. A seat can commit those bytes, and the code runs before any digest decision (line 106).
  - Timing on the exact regex source (node v24.21.0, E8):
    - bare `<`: 40 KB → 430 ms, 80 KB → 1 650 ms, 160 KB → 7 524 ms, 320 KB → 32 581 ms (×4 per doubling).
    - unclosed `<script>`: 320 KB → 821 ms.
  - Extrapolated [INFERENCE]: 1 MB ≈ 5 min, 4 MB ≈ 85 min. The git `maxBuffer` is 256 MiB (line 23) and there is no spawn timeout or process-level watchdog.
  - Guard: `/<[^<>]*>/g` is linear (8 MB → 20.6 ms, E8b), plus a linear `indexOf` script/style strip, a raw-size cap (≤ 2 MiB), and a wall-clock watchdog that returns could-not-evaluate (exit 2).
- **D2 (Medium, observed): tiny receipts crash the C1 counter.**
  - A 207-byte receipt with `run.flags:[{"toString":1}]` gives `TypeError: Cannot convert object to primitive value` (line 60, `String(f)`), exit 1, 0 stdout lines under `--json`.
  - A 400 116-byte receipt with 200 000 nested arrays inside `events` gives `RangeError: Maximum call stack size exceeded` (`digestOf` → `JSON.stringify`, line 48), exit 1, 0 stdout lines.
  - Neither hangs, but both conflate "crashed" with the registry's `1 = failed` and emit no verdict JSON.
  - Guard: top-level catch mapping non-Refusal errors to exit 2, `typeof f === 'string'` checks, and depth/size caps before `JSON.parse`.
- **D3 (Low, observed): output amplification in the C1 counter.** A 12.9 MB receipt with 1 000 000 non-raw events took 623 ms but wrote 151 889 208 bytes / 4 000 015 lines under `--json`, and 1 000 002 lines in text mode (E6).
  - Guard: cap findings per id (for example the first 20 plus a count), and cap events (≤ 10 000) before validation.
- **D4 (Medium): no timeout on any counter git spawn.** C1 lines 27–31 and C2 line 23. A hostile `objects/info/alternates`, or a slow filesystem, blocks forever. [INFERENCE: not exercised.]
  - Guard: `spawnSync(..., {timeout, maxBuffer: 8 MiB})`.
- **D5 (High, observed in a sibling run): the harness has unbounded CDP waits.**
  - probe.mjs `send()` (line 159) and driver.mjs `send` (line 34) await responses with no timeout; only `waitEvent` and `waitHttp` are bounded.
  - Sibling evidence: `scratch/ExecHarnessC1/runs/positive-attempt0-harness-hang/cleanup-manual.txt` records "hung after the journey … so the in-probe cleanup never ran", wall time 81.53 s, and chromium pid 1184215 plus python pid 1184214 still listening on `127.0.0.1:36227` / `:42245` until a manual kill by pid.
  - Guard: wrap every `send` in a bounded race, add a global watchdog, and run cleanup in `finally` plus SIGINT/SIGTERM/SIGHUP handlers (round-21 pattern, lines 33–40 and 150–152).

### (e) Orphan processes and ports
- **E1 (High): `detached: true` on both children** (probe.mjs:84 python, :99 chromium) puts them in new process groups, outside the harness's group.
  - An outer `timeout -s KILL` (the lane's `check-measurement-binding.mjs:536` pattern) or a Ctrl-C kills node and leaves chromium and python orphaned with ports open. This is exactly the D5 incident shape.
  - Observed in E7: chromium never re-groups its children. All 11 owned processes shared the spawner's pgid/sid (`ps -o pid,ppid,pgid,sid` → pgid 1344381 for every one, matching the shell's pgid). Non-detached spawns are therefore reaped by an outer group kill.
  - Guard: do not detach. Use in-process signal handlers plus `finally` cleanup, with the outer `timeout` group kill as a backstop.
- **E2 (Medium): port selection is a time-of-check/time-of-use race and is not owner-verified.** `freePort()` (probe.mjs:44–53) binds and closes port 0, then hands the number to chromium and python later. With dozens of concurrent seats, a sibling can take the port in that window.
  - If that happens, chromium fails to bind its debug port. `waitHttp(127.0.0.1:<dbg>/json/version)` then attaches to the sibling's browser and drives it. The `a.html` fixture check also passes against the diagnostics seat's identical fixture, and the receipt records foreign events.
  - run.sh uses operator-fixed ports with an `ss` pre-check, which has the same race.
  - Guard, demonstrated race-free in E7:
    - `--remote-debugging-port=0`, then read `<profile>/DevToolsActivePort` (it gave `33457` plus the ws path).
    - Python with port `0` prints its bound port ("Serving HTTP on 127.0.0.1 port 32777").
    - Before connecting, assert the `ss -Hltnp` owner pid equals the spawned pid (`127.0.0.1:33457 users:(("chromium",pid=1344479…))`).
- **E3 (Medium): stray cleanup uses pattern kill, not pid kill.** probe.mjs:267–271 runs `pgrep -f -- PROFILE` and SIGKILLs every match with no start-time identity check. The pattern is an ERE over the full argv of all user processes, so a sibling's `rg …/runs/positive/profile` or `tail -f` gets SIGKILLed.
  - run.sh:23 has the same shape: a substring grep of cmdline, so `profile2` also matches.
  - Guard: exact argv-token match `--user-data-dir=<PROFILE>` plus a descendant walk, recording `(pid, /proc/pid/stat field 22 starttime)` at launch, and killing only identities that still match. The round-21 `processTree` + `startTicks` code (lines 52–71) already does this.
  - The identity check must treat an empty or missing start time as "gone". My own E7 check showed a false "survivor" [1344684] for a pid that exited between listing and stat, because two empty strings compare equal.

## 2. Named verifications
**CDP loopback binding: holds, but the browser enforces it, not the flag.**
- E7 run "loop1" (scrubbed env, `--remote-debugging-port=0 --remote-debugging-address=127.0.0.1`): `ss -Hltnp` showed `127.0.0.1:33457 users:(("chromium",pid=1344479,fd=74))` and python `127.0.0.1:32777 users:(("python3",pid=1344385,fd=3))`.
- E7 run "loop2" with `--remote-debugging-address=127.0.0.2` (still loopback, chosen so no non-loopback port was ever opened): stderr `DevTools listening on ws://127.0.0.1:32781/…`, and `ss` showed `127.0.0.1:32781`. The address flag is ignored by this build in `--headless=new`.
- So loopback-only is the browser default and the flag is decorative. [INFERENCE: `0.0.0.0` is likewise ignored; not tested, by the loopback-only rule.]
- Guard: the receipt asserts the binding from `ss` owner-pid output, never from the flag.
- Hostile-fixture isolation, via raw upgrade requests with node `http` (E7):
  - no Origin → `101 upgraded`
  - `Origin: http://127.0.0.1:<fixture port>` → `403 Rejected an incoming WebSocket connection from the http://127.0.0.1:32777 origin…`
  - `Origin: https://evil.example` → connection reset
  - `GET /json/version` with `Host: evil.example` → `500 Host header is specified and is not an IP address or localhost.`
  - So a fixture page cannot drive CDP. Guard: never pass `--remote-allow-origins` (present in the binary: `rg -a -c` → 2).
- Python bind: both prototypes pass `--bind 127.0.0.1`, which is required. `python3 -m http.server --help` says `-b … (default: all interfaces)`.

**Kill-by-pid discipline: works when done by recorded identity; the prototypes partly violate it.**
- E7: `kill -TERM <spawn pid>` alone reaped all 11 owned chromium processes within ≤ 5 s. Profile-owned pids afterwards: `[]`.
- Post-cleanup proof: `ss -Hltn` on both ports → 0 lines; `curl` http exit=7, cdp exit=7; `/proc/<pid>` absent for chromium and python. loop2 gave the same result (curl 7/7, owned pids `[]`).
- My own leftovers sweep: a `/proc/*/cmdline` scan for `SentScopes` found no processes.
- Live sibling sweep at 12:22Z: no chromium or http.server processes under `round-25/scratch` (same scan).
- Violations: the `pgrep -f` + SIGKILL path in probe.mjs (E3), the unbounded-wait path that skips cleanup entirely (D5), and `detached` (E1).

## 3. Guard I would refuse to ship without
**A hardened `--rev` reader in both counters.**

Requirements:
- Full 40-hex rev only.
- Git env reduced to an allowlist, with every `GIT_*` dropped.
- `GIT_NO_REPLACE_OBJECTS=1` (or `git --no-replace-objects`).
- `ls-tree` mode `100644` check, then `cat-file blob <oid>`.
- `spawnSync` timeout and `maxBuffer` ≤ 8 MiB.

**Exploit it closes (E4, observed).** In a scratch repo whose committed receipt has no restore, one replace object (`git replace <receipt-blob> <forged-blob>`, no new commit, HEAD unchanged `33d719b0`) flips the C1 proto at the same revision from `{"restores":0,"valid":true}` to `{"restores":1,"valid":true}`. With `GIT_NO_REPLACE_OBJECTS=1` it is back to `{"restores":0,"valid":true}`. Plain `git cat-file blob <oid>` is fooled the same way (`summary.restores=1` vs `0`).

**Why it ranks first.** The forged receipt is internally digest-consistent, so the counter's digest check cannot see it. That makes it a fabricated C1 result with no commit trace, and the C2 counter reads at `--rev` the same way (line 69). The same guard also closes C1 (hook env cross-repo write) and D4 (git hang).

Textconv is not a live vector: plain `git show <rev>:<path>` did not run a repo-local textconv driver; only `--textconv` did (E3, `PWNED_TEXTCONV` marker).

## 4. Other ship-blocking items, by severity
| # | Risk class | Guard | Severity |
|---|---|---|---|
| D1 | (d) C2 quadratic tag strip | `/<[^<>]*>/g` + linear script strip + raw cap + watchdog | High |
| D5/E1 | (d)(e) harness hang / orphans | bounded `send`, global watchdog, `finally` + signal handlers, no `detached` | High |
| F-out | integrity | text-mode lines must `JSON.stringify` receipt strings. Observed spoofs: C1 `--file` with a newline in a goBack URL printed `BFCACHE_RECEIPT verdict=clean … restores=9 … valid=true` as line 2, before the real `verdict=failed` line; C2 with a newline in `verdict` printed `SOURCE_REOPEN verdict=clean … unresolved=0 … revision=forged` as line 2 (E5, E8) | Medium |
| E2 | (e) port race / foreign browser | port 0 + `DevToolsActivePort` + `ss` owner-pid assert | Medium |
| E3 | (e) pattern kill | identity kill by `(pid, starttime)` | Medium |
| B1/B2 | (b) env/HOME/launcher | env allowlist, temp `HOME`, empty XDG or direct `/usr/lib/chromium/chromium`, judge `effectiveArgv` | Medium |
| C1 | (c) selftest hook env | covered by §3's env allowlist | Medium |
| D2 | (d) crash → exit 1 | top-level catch → exit 2, type checks, depth/size caps | Medium |

Integration note (not security): both protos' `--json` output is pretty-printed: 15 lines for C1 (E5) and 62 for C2 (E8). `scripts/check-measurement-binding.mjs` `reproduceArm` rejects "stdout is not a single JSON line" (line 553), so the counting command would fail binding reproduction. Use `JSON.stringify(out)`.

Kill-rule note for the C1 critics: the proto's bfcache-disabled check is a prefix match on `--disable-back-forward-cache` over `run.flags` (line 60). `--disable-features=BackForwardCache` disables it too, and only `effectiveArgv` reflects launcher injection. This cannot inflate restores, but it can mislabel the "disabled" control.

## 5. Experiment index (all under `scratch/SentScopes/`, throwaway)
| Experiment | What it tests | Evidence |
|---|---|---|
| E1/E2 | hook env, selftest cross-repo write | `e1/`, `hookenv-*.txt`, `selftest-in-hook-dasha2.txt` |
| E3/E4 | textconv, replace-ref forgery | `e3/`, `forged.json` |
| E5 | C1 text injection | `inject.json` |
| E6 | hostile size/nesting | `e6/deep.json`, `e6/proto.json` |
| E7 | CDP binding, Origin/Host, process tree, kill-by-pid | `e7.sh`, `e7-loop1.txt`, `e7-loop2.txt` |
| E8 | C2 ReDoS, C2 text injection | `e8/` |

Commands are reproduced inline above. Installs: none. External GETs: none.
