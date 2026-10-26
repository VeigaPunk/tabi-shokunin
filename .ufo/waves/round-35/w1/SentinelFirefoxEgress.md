# C2 safety review — Firefox live leg: loopback, home, automation prefs, listeners

Seat: SentinelFirefoxEgress (leaf). Freeze: `a4bfef0f75027c915e715649950b1d46dcb33d83`. Scope: the live leg of the
frozen C2 counter (`.ufo/waves/round-35/counters/c2-firefox-bidi.mjs`, `liveRecordFirefox`, lines 186-306), run from a
scratch clone against the gate module `scripts/check-bidi-runtime.mjs` (sha256 `370e8e95…d86c87` = the counter's
`GATE_SHA256`, verified before import). Findings only; **no lane file was edited** (lane `HEAD` still
`a4bfef0…`; `git status --porcelain` shows only other seats' untracked wave dirs).

## Verdict

**Home containment HOLDS; the "loopback FIXTURE only" claim is a DEFECT (medium severity, confirmed twice).** The live
leg keeps `HOME`, `TMPDIR` and all four `XDG_*` variables inside its scratch (`c2-firefox-bidi.mjs:194`), writes nothing
outside it, publishes no listener beyond `127.0.0.1` (never `0.0.0.0`) and never touches `127.0.0.1:9222` — but it does
not stay on loopback: within the ≈2.0 s life of every run the Firefox parent process opens **three outbound TLS
connections to Mozilla CDN infrastructure** — `firefox.settings.services.mozilla.com` and
`firefox-settings-attachments.cdn.mozilla.net` (Fastly `2a04:4e42:3b::347` / `151.101.249.91`) and
`content-signature-2.cdn.mozilla.net` (Google `2600:1901:0:8d82::` / `34.149.226.178`) — while the counter header claims
the leg is "loopback FIXTURE only" (`c2-firefox-bidi.mjs:57-58`), contradicting the round's loopback rule. geckodriver's
recommended automation prefs disable telemetry, push, captive-portal, safe-browsing, Normandy, GMP and extension updates
and swap the remote-settings *bucket* server to a `data:` URL, but leave the real attachments/CDN base URL and the newtab
trainhop addon URL live — exactly the services observed. Five measured pref-level fence variants (service URLs, loopback
redirect of the settings server, manual proxy, safe-browsing/CRLite off, and the two combined) all left the egress
intact; the only fence that held is one pref, `network.dns.disabled=true` (0 non-loopback connects on any port, 0 Mozilla
lookups, fixture and BiDi session unaffected) — proposed below, not applied.

## Commands run (exact, with exit codes)

Scratch `S=/fast/scratch/hyaku/tabi-r35/SentinelFirefoxEgress`, `TMPDIR=$S/tmp` on every browser run.

| # | command | exit |
|---|---|---|
| 1 | `git clone --shared …/tabi-shokunin "$S/clone"` then `git -C "$S/clone" checkout -q --detach a4bfef0f…` | 0 |
| 2 | `sha256sum "$S/clone/.ufo/waves/round-35/counters/c2-firefox-bidi.mjs" "$S/clone/scripts/check-bidi-runtime.mjs"` → `7cc7f17f…954e`, `370e8e95…6c87` | 0 |
| 3 | run 1: `node "$S/obs/obs.mjs" "$S/clone" "$S/obs/obs.json"` — imports `liveRecordFirefox` + the gate from the clone, calls it once; PID-scoped `ss` sampling + live profile capture in parallel (`obs/monitor.sh`; 0.2 s sleep loop, ≈0.38 s effective cadence, 33 samples/run, of which 2 in run 1 and 4 in run 2 fell inside the live browser window) | 0 (2065 ms) |
| 4 | run 2: same call under `strace -f -qq -y -s 256 -e trace=connect,sendto,sendmmsg -o obs/strace.log node …` | 0 (3983 ms) |
| 5 | probes, each `strace -f -e trace=connect,sendto node obs/probe.mjs "$S/clone" <label> <prefs>`: `control`,`ctl2` (none), `fixA`…`fixF` (pref fences) | 0 ×8 |
| 6 | `find ~/.mozilla ~/.cache/mozilla ~/.config/mozilla -type f -printf '%T@ %s %p\n' \| sort` before/after each run; `diff` | 0 (identical) |
| 7 | `pgrep -a -f -- "--profile-root $S/tmp"` after every run | 1 (none) |

`c2-firefox-bidi.mjs:evaluate` cannot be used to reach the live leg at this freeze (it returns before the live call when
the entry/receipt are absent: `:342-343`, live call gated at `:418`), so the leg was driven through its exported symbol
(`:492 export { liveRecordFirefox, … }`) with the gate module imported from the clone. Same code, same defaults
(`FIREFOX`, `GECKODRIVER`).

## Check 1 — outbound connections: **DEFECT (non-loopback egress)**

`ss -tan(p)` sampled on a 0.2 s sleep loop (≈0.38 s effective cadence) during both runs, filtered to *my* geckodriver
tree by PID (a peer seat was running its own Firefox; unfiltered name matching would have contaminated the evidence).

Live run 1 (2.0 s, session `cf511b80-2624-4cab-b0e7-fc875bc22d63`, `browserVersion 158.0.1`, `moz:geckodriverVersion 0.37.1`):

```
TCP ESTAB 0 0 [2804:14d:5c56:36ef:2ed8:aeff:0:2c0]:42098 [2a04:4e42:3b::347]:443 users:(("firefox-bin",pid=3236768,fd=86))
TCP ESTAB 0 0 [2804:14d:5c56:36ef:2ed8:aeff:0:2c0]:50478 [2a04:4e42:3b::347]:443 users:(("firefox-bin",pid=3236768,fd=45))
TCP ESTAB 0 0 [2804:14d:5c56:36ef:2ed8:aeff:0:2c0]:57346 [2600:1901:0:8d82::]:443   users:(("firefox-bin",pid=3236768,fd=85))
```
(`evidence/sockets-run1.log`)

Live run 2 under strace (session `d69cbd8d-…`, same `firstShotSha256 7a3ae6a9…cbfd02`, same recipe) reproduces it and
gives the syscall truth (`evidence/strace-live-run2.log`):

```
3398388 connect(41<socket:[521323267]>, {sa_family=AF_INET6, sin6_port=htons(443), … "2a04:4e42:3b::347" …}) = -1 EINPROGRESS
3398388 connect(73<socket:[521344065]>, {sa_family=AF_INET6, sin6_port=htons(443), … "2a04:4e42:3b::347" …}) = -1 EINPROGRESS
3398388 connect(87<socket:[521334629]>, {sa_family=AF_INET6, sin6_port=htons(443), … "2600:1901:0:8d82::" …}) = -1 EINPROGRESS
```
plus address-family probes (`connect(… sin6_port=htons(0) …)` to the same peers and `sin_port=htons(0)` to
`151.101.249.91`), and resolver traffic that stays local: three `connect(… sin_port=htons(53), inet_addr("127.0.0.53"))`,
i.e. the systemd-resolved stub only — no direct DNS to the internet. Real DNS names come from the resolver's varlink
calls in the same trace:

| requested name | pid | class |
|---|---|---|
| `firefox.settings.services.mozilla.com` | 3400498 | Fastly `151.101.249.91` / `2a04:4e42:2a::347` |
| `firefox-settings-attachments.cdn.mozilla.net` | 3400497 | Fastly, same pair |
| `content-signature-2.cdn.mozilla.net` | 3400497 | Google `34.149.226.178` / `2600:1901:0:8d82::` |

(host↔address mapping confirmed locally with `getent ahosts`.) Two Fastly sockets + one Google socket = the three
observed `:443` connections. Every `HTTPS/TCP` port observed in the whole trace: `0`, `53`→`127.0.0.53`, `443` (the three
above), `36207/40949/43101/44571` (driver/WebSocket/Marionette loopback), `65535`→`127.0.0.1` and `::1` (geckodriver's
loopback availability probe). `htons(9222)` appears **nowhere**; the only "9222" substring in the trace is inside a decimal
timestamp payload (`strace-live-run2.log:230`), not a port.

A longer-lived session (probe `control`, 5 s linger instead of 2 s) adds a **fourth** outbound connection to Fastly
`2a04:4e42:2a::787`, which is `archive.mozilla.org` — resolved for
`browser.newtabpage.trainhopAddon.xpiBaseURL` (`browser/omni.ja` → `defaults/preferences/firefox.js:829`, recorded in
`evidence/defaults-cites.txt`). So a slower CI host can carry a fourth peer.

Two loopback-only resolver lookups are noise, not egress: `plazir27` (this host's hostname) and the literal name
`tabi_fixture` (the fixture's cookie name, `check-bidi-runtime.mjs:174`); neither produced a socket. Cause of the
`tabi_fixture` lookup is not established and needs nothing.

## Check 2 — writes outside the scratch: **HOLDS**

Pre-run inventory (`evidence/home-before.txt`, `home-files-before.txt`): `~/.mozilla` 1 file, `~/.cache/mozilla` 0,
`~/.config/mozilla` 1, `~/.local/share/mozilla` absent. After both runs the `%T@ %s %p` metadata sets are **byte-identical**
(`diff` exit 0; `home-files-after.txt` and `home-files-after2.txt` both sha256 `cdcf36f8…229e`), and
`find … -newer before.stamp` returns nothing. The throwaway profile really is inside the scratch: the monitor captured
`prefs.js`/`user.js` from `$S/tmp/tabi-r35-c2-live-*/profiles/rust_mozprofile*/` while the session was live
(`evidence/profiles-live-run1`, `profiles-live-run2`), and both runs' Firefox trees were children of a geckodriver whose
`--profile-root` was under `$S/tmp` (`c2-firefox-bidi.mjs:195`). Env redirection is `c2-firefox-bidi.mjs:194`
(`HOME`, `TMPDIR`, `XDG_CONFIG_HOME`, `XDG_CACHE_HOME`, `XDG_DATA_HOME`, `XDG_STATE_HOME`, `MOZ_HEADLESS=1`). Scratch was
emptied after each run by the counter's own `finally` (`:284-293`); `find "$S/tmp" -mindepth 1` was empty immediately after
each observed run. One probe deliberately retained its live profile for inspection (`PROBE_KEEP`); that directory was
deleted with the rest of the scratch before yield.

## Check 3 — geckodriver's recommended prefs vs the observed egress: **PARTIAL**

`remote.prefs.recommended.applied=true` (`profiles-live-run1/…prefs.js:180`). The recommended set (`…user.js`, 53 lines)
already kills telemetry (`datareporting.policy.dataSubmissionEnabled false :99`, `toolkit.telemetry.server
https://%(server)s/telemetry-dummy/ :207`), push (`dom.push.connection.enabled false :117`), captive portal
(`network.captive-portal-service.enabled false :162`), safe browsing (`browser.safebrowsing.malware.enabled false :62`),
GMP/extension updates, Normandy (`app.normandy.api_url ""`) and app update (`app.update.disabledForTesting`).

It does **not** cover the services that actually fire: `services.settings.base_attachments_url` keeps the real pair
`https://firefox.settings.services.mozilla.com/v2|https://firefox-settings-attachments.cdn.mozilla.net/`
(`…prefs.js:186`; the key is absent from `…user.js` — 0 matches), while only the bucket *server* is redirected
(`services.settings.server data:,#remote-settings-dummy/v1 :188`). The newtab trainhop URL above is likewise untouched.
That matches the observed names exactly: the bucket server is inert, the attachments/signature/newtab-addon fetches are not.

Measured fences against it (all with the fixture verified working, `text="tabi bidi fixture"`):

| variant | prefs | landed? | non-loopback `:443` connects (5 s linger) |
|---|---|---|---|
| `control` | — | — | 4 (2×Fastly + Google + archive) |
| `ctl2` | — (DNS names traced) | — | 4 |
| `fixA` | `services.settings.base_attachments_url=data:`, CRLite/intermediates off | not re-read | 4 |
| `fixD` | `services.settings.server=http://127.0.0.1:9/v1`, attachments→`127.0.0.1:9` | server landed; **attachments reverted to the real CDN pair at runtime** | 4 |
| `fixF` | 9 targeted prefs (trainhop `""`, attachments→loopback, CRLite/intermediates/safe-browsing off, `network.trr.mode=5`) | trr/CRLite/intermediates landed; attachments reverted | 3 |
| `fixB` | manual proxy `network.proxy.type=1`, http/ssl/socks → `127.0.0.1:1` | yes | 3 (proxy honoured — 126 CONNECT attempts to `127.0.0.1:1` — yet 3 service channels still went direct to the CDN peers) |
| `fixC` | `fixD` + the proxy fence | yes | 3 |
| **`fixE`/`fixE2`** | **`network.dns.disabled=true`** (E2 alone) | **yes** (`…prefs.js` "network.dns.disabled", true) | **0** — and 0 non-loopback connects on *any* port, 0 Mozilla lookups |

So the app-level URL prefs are not a fence (Firefox re-asserts the attachments base), the Gecko proxy service does not
cover these channels, and the only pref-layer lever that held is name resolution: with DNS disabled the services cannot
address anything off-host, while the fixture is addressed as an IP literal (`check-bidi-runtime.mjs:198`
`base: http://127.0.0.1:${port}`) and needs no lookup — BiDi navigate/evaluate/cookies all still worked.

## Check 4 — listeners: **HOLDS**

Every `ss -tlnp` sample for my tree, both runs, is loopback-bound — nothing on `0.0.0.0` or `*:`:
geckodriver `127.0.0.1:39911` (run 1) / `…:36207` (run 2), Firefox WebSocket/remote-debugging `127.0.0.1:44615` / `…:43101`,
Firefox Marionette endpoint `127.0.0.1:35681` / `…:44571`. Ports are the counter's own `freePort()` allocations
(`c2-firefox-bidi.mjs:195`, `--port`/`--websocket-port`), never 4444 or 9222. No process of mine had any socket on 9222.

## Remediation (proposed, not applied)

Smallest change that makes the claim true, for the round-35 driver (`scripts/bidi-firefox-loopback-round35.mjs`) and, if
L1 wants the counter's header to become accurate, the counter's capabilities object (`c2-firefox-bidi.mjs:204-205`), whose
`moz:firefoxOptions` currently carries only `args: ['-headless']`:

```
'moz:firefoxOptions': {
  args: ['-headless'],
  prefs: { 'network.dns.disabled': true, 'network.trr.mode': 5 },   // measured: 0 non-loopback sockets
}
```

- One operative pref. Keep `network.trr.mode=5` so a future non-default DoH configuration cannot resolve around it.
- Safe only while every navigated URL is an IP literal — true today (`serveFixture` base, and the driver must not add
  `localhost`/DNS fixture hosts).
- Do **not** rely on `services.settings.*`, safe-browsing/CRLite prefs or a manual proxy; all were measured and all leak
  (table above). If a run ever needs hostname resolution, the remaining lever is process-level isolation (`unshare -n`
  with loopback up), not a pref.
- Contract-wise: any receipt that asserts "loopback only" must be backed by the socket observation, not by the env
  redirection alone (env redirection is about writes, and that part holds).

## Findings

| # | severity | finding | evidence |
|---|---|---|---|
| 1 | medium | live leg makes 3 non-loopback TLS connections per run to Mozilla CDN/service endpoints, contradicting "loopback FIXTURE only" | `sockets-run1.log`, `sockets.log`, `strace-live-run2.log`, counter `:57-58`, `:194-205` |
| 2 | low | longer sessions add a 4th peer (`archive.mozilla.org`, newtab trainhop addon) | `trace-probe-control.log`, `defaults-cites.txt` |
| 3 | low (informational) | geckodriver's recommended prefs leave the remote-settings attachments/signature base URL and newtab addon URL live | `profiles-live-run1/…prefs.js:186`, `…user.js` (key absent) |
| 4 | none | home writes: clean; listeners: loopback-only; 9222 untouched; no leftover processes; scratch emptied | `home-files-after*.txt` diff, `sockets*.log`, `pgrep` exit 1 |

## Deliverables / integrity

Output dir `.ufo/waves/round-35/w1/SentinelFirefoxEgress/`, `manifest.tsv` = sha256+bytes of the 42 evidence files
(it excludes itself; all 42 digests re-verified with `sha256sum -c`, all OK). Key digests:

```
f33ba61ef76dbcee8ecae6c8129ce19e9a94785853de471e7ec4e6d63d3f7bb1  14009  evidence/profiles-live-run1/rust_mozprofileTjJJKe.prefs.js
9b934502b95748a883adc192d2e3bc0d7c87d49066b120677a79438259a00c29   3125  evidence/profiles-live-run1/rust_mozprofileTjJJKe.user.js
44c3416f694c71b911b4c48d96a3c60142f35131cc19f0ae68fa4e2a0d2e0a4f  53611  evidence/strace-live-run2.log
6be033e0eba6b98fcfa3da6d709d5405fa3a455f84ce4b7ba5e83cbead6ffe40   3727  evidence/obs.json   (live run 1)
1eec58352e8e8f31c857826a5fa70d9a2c435769a1722704630f3c263fde9c1b   3727  evidence/obs2.json  (live run 2, traced)
5b7b2ec033712f41a2643aa48069bf2615b22d8a8ef8228713ea583c510d79b6   1411  evidence/egress.tsv
```

- `evidence/obs.json`, `obs2.json` — the leg's own record (session id, capabilities, `firstShotSha256 7a3ae6a9…cbfd02` in both runs, 28 commands, request URLs all `http://127.0.0.1:<port>/…`, `nonLoopbackUrls: []` at the BiDi layer — i.e. the egress is *below* BiDi's network events, which is why only socket/strace observation shows it).
- `evidence/sockets-run1.log`, `sockets.log`, `proctree*.log` — PID-scoped `ss` samples; `monitor.sh` shows the filter.
- `evidence/strace-live-run2.log` (+ `trace-probe-*.log`) — connect/sendto/sendmmsg.
- `evidence/profiles-live-run{1,2}/` — `prefs.js`/`user.js` captured live (geckodriver deletes the profile at session end).
- `evidence/probe.mjs`, `obs.mjs` — the drivers I used; `evidence/egress.tsv`, `defaults-cites.txt`, `home-*`.

Tooling: nothing installed or upgraded (no pacman/uv/npm). Used: node v24.21.0, strace 7.2, Firefox 158.0.1
(`/home/vgpnk/.local/opt/firefox-158.0.1/firefox`), geckodriver 0.37.1 (`/home/vgpnk/.local/bin/geckodriver`). No public
HTTPS fetch was needed; all source claims are grounded in the clone and the installed Firefox's own files. All browser and
driver processes I started were killed (`pgrep … → exit 1`), scratch removed.
