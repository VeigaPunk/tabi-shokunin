# ExecNoNetwork — C1 perimeter probe: is the BiDi live leg loopback-only? (round 32, w1)

**Verdict (one paragraph).** The frozen counter's live leg is *loopback-sufficient* but not, as launched, *loopback-only in effect*. Running the frozen `liveRecord()` (sha256 `2f25af5a…`, byte-identical to `claims.json` `frozenDigests`) inside a rootless network namespace whose only interface is `lo`, with empty IPv4/IPv6 route tables and a DNS stub that cannot be reached, all **16 admittable predicates hold and R16 fails with its own `no-bidi-counterpart`** (two independent runs, `netns.json` and `netns2.txt`): the transport needs nothing beyond `127.0.0.1`. On the ordinary networked host, however, the same unchanged session makes **8 real TCP connections to six Google endpoints** (component updater, autofill metadata, account consistency, network time, first-party-sets, component payload host) and exchanges **17,821 bytes out / 41,057 bytes in** (`netlog-default.json`, `trace-default.out`), plus 24 zero-byte UDP `connect()` address probes. The background traffic comes from Chromium's defaults because the counter passes exactly five launch flags (`--headless=new --no-sandbox --no-first-run --disable-gpu --user-data-dir=…`, `scripts/check-bidi-runtime.mjs:401`); one added switch — `--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1` — measurably takes external TCP from 8 attempts/17.8 kB out to **0 attempts / 0 bytes** while every predicate still holds, and the background-networking flag set removes the request generators themselves (autofill, component updater). Nothing about the admitted/`failing` verdicts changes: the measured predicates are against the loopback fixture and are unaffected by the leaked background requests.

## Provenance

| Item | Value |
|---|---|
| checkout | `git clone --shared …/tabi-shokunin "$S/clone"`; `git -C … checkout --detach 4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6` (exit 0) |
| tree state | `git -C "$S/clone" status --porcelain` → 0 lines |
| counter bytes | sha256 `2f25af5a3c6326b9295f7fb191c3b76334dbb23a3403d39755d9e9ee3516c393` = `claims.json` frozen digest |
| browser | `/usr/bin/chromium` → Chromium 154.0.8037.97 Arch Linux; `/usr/bin/chromedriver` → ChromeDriver 154.0.8037.97 (both exit 0) |
| harness | `probe.mjs` imports `liveRecord`/`PREDICATES`/`ROWS` from the frozen counter and prints every row's predicate result; `variant.mjs` is that same file with one added spread of `$EXTRA_ARGS` into `goog:chromeOptions.args` (scratch copy for the flag experiment only) |
| navigation | only `http://127.0.0.1:<ephemeral>` served by the counter's own `serveFixture()`; no external navigation, no logins, no session material read |

## 1. Loopback-only namespace: every predicate holds

```
unshare -rn sh -c 'ip link set lo up; ip -brief link; ip route; ip -6 route; \
                   TMPDIR=$S XDG_RUNTIME_DIR=/run/user/1000 node probe.mjs netns-loopback-only-2'
```
exit 0. Namespace topology (`netns2.txt`): `lo UNKNOWN 00:00:00:00:00:00 <LOOPBACK,UP,LOWER_UP>` is the **only** interface; `ip route` and `ip -6 route` print nothing; `/etc/resolv.conf` still names `127.0.0.53`, a stub that does not exist in that namespace.

| Row | Surface | predicate in netns | failure text |
|---|---|---|---|
| R1 | Browser identity at launch | holds | — |
| R2 | Target inventory | holds | — |
| R3 | Navigate | holds | — |
| R4 | Screenshot | holds | — |
| R5 | DOM shape/state | holds | — |
| R6 | Wait predicates / volatile readouts | holds | — |
| R7 | Viewport pin | holds | — |
| R8 | Click input | holds | — |
| R9 | Text fill | holds | — |
| R10 | Network client events | holds | — |
| R11 | Wire truth (raw status/headers) | holds | — |
| R12 | Byte truth | holds | — |
| R13 | Pre-settle hold | holds | — |
| R14 | Navigation history witness | holds | — |
| R15 | Cookies | holds | — |
| R16 | Stop loading / nav-cancel | **fails** | `no-bidi-counterpart` (has no BiDi command; expected) |
| R17 | User prompts / dialogs | holds | — |

`holdCount 16 / 17`, `verdict all-16-admittable-hold` — identical in both namespace runs (`netns.json`, `netns2.txt`), with `webSocketUrl ws://127.0.0.1:<port>/session/<id>`, `browserVersion 154.0.8037.97`, 28 commands / 14 events in the transcript.

## 2. Outside the namespace: outbound attempts during one session

Command (session 1, payload-capable trace):
`strace -f -e trace=connect,sendto,sendmsg -s 200 -o trace.out node probe.mjs outside-host-strace` → exit 0, 16/16 hold. 115 `connect(` calls: 11 loopback, 40 non-loopback. **6,379 `sendto/sendmsg/sendmmsg` lines, 0 with a non-loopback inet address** (the only sends are AF_NETLINK and loopback).

Command (session 2, socket-type + netlog): `strace -f -e trace=connect,socket … node probe-variant.mjs default-flags-netlog` → exit 0, 16/16 hold, `--log-net-log=…/netlog-default.json`.

Every non-loopback destination attempted, named from the netlog's own `HTTP_STREAM_JOB.destination` / `URL_REQUEST.url` records (no DNS lookups used for naming):

| Endpoint (netlog) | Address:port | Kind | Bytes sent / received |
|---|---|---|---|
| `http://clients2.google.com` (network time `time/1/current`) | `2800:3f0:4004:814::200e:80` | TCP | 410 / 1,157 |
| `https://accounts.google.com` (`ListAccounts`) | `2800:3f0:4003:c02::54:443` | TCP | 4,495 / 6,502 |
| `https://www.google.com` (`/async/folae`) | `2001:4860:482b:7700:::443` | TCP | 4,501 / 5,991 |
| `https://update.googleapis.com` (`service/update2/json`, component updater) | `2800:3f0:4004:812::200e:443` | TCP | 5,439 / 6,958 |
| `https://content-autofill.googleapis.com` (autofill metadata) | `2001:4860:4844:400::443` | TCP | 2,634 / 5,496 |
| `http://edgedl.me.gvt1.com` (`diffgen-puffin` component payload) | `2600:1900:4110:86f:::80` | TCP | 342 / 14,953 |
| IPv6 reachability probe (`HOST_RESOLVER_MANAGER_IPV6_REACHABILITY_CHECK` in the netlog) | `2001:4860:4860::8888:443` | UDP connect | 0 / 0 |
| address probes (port 0) | 24 distinct Google-range v4/v6 addresses | UDP connect | 0 / 0 |

Totals: **8 TCP attempts → 17,821 B out / 41,057 B in**, 25 zero-byte UDP `connect()` probes. These are Chromium background services, not lane navigation: the only page navigations in the session are `127.0.0.1` fixture URLs (plus the fixture's own `/favicon.ico` 404). No credentials, cookies or session material are involved; the throwaway profile's only cookie is the fixture constant `tabi_fixture=1`.

## 3. Which launch flags suppress it (measured, 16/16 predicates hold in every row)

`suppress-min` = `--disable-background-networking --disable-component-update`; `suppress-all` = that plus `--disable-domain-reliability --disable-sync --no-pings --disable-client-side-phishing-detection --safebrowsing-disable-auto-update --metrics-recording-only --disable-default-apps --disable-breakpad --disable-features=OptimizationHints,OptimizationGuideModelDownloading,AutofillServerCommunication,Translate,MediaRouter,InterestFeedContentSuggestions --host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1`.

| Flag set | external TCP (port ≠ 0) | external bytes out / in | requested hosts (URL_REQUEST; resolution outcome) | predicates |
|---|---|---|---|---|
| frozen args as-is | **8** | **17,821 / 41,057** | 6 hosts, connections completed | 16/16 |
| `suppress-min` | 9 | 18,050 / 46,305 | 6 hosts incl. autofill + edgedl | 16/16 |
| `resolver-pin` only | **0** | **0 / 0** | 5 hosts, all `ERR_NAME_NOT_RESOLVED` (−105) | 16/16 |
| `resolver-pin --disable-ipv6 --disable-features=AsyncDns,DnsOverHttps` | **0** | **0 / 0** | same, −105 | 16/16 |
| `resolver-pin --disable-quic` | **0** | **0 / 0** | same, −105 | 16/16 |
| `suppress-all` | **0** | **0 / 0** | 4 hosts only (no autofill, no edgedl), −105 | 16/16 |

Reading of the matrix: the two `--disable-background-*` flags alone barely move the counter (9 attempts, slightly more bytes) — they do not stop the time service, account consistency, first-party sets or the component download. The operative switch is the **resolver pin**: it fails every non-loopback name at resolution, so no TCP socket is even created. The background flags are still worth including because they shrink the *attempted* set (autofill and the `diffgen-puffin` payload host disappear from `suppress-all`'s URL_REQUEST list). Residual after every tested flag set: one **zero-byte UDP `connect()`** to `[2001:4860:4860::8888]:443` (the IPv6 reachability probe — it survives `--disable-ipv6`, so it is not gated by that switch) and a `UDP_LOCAL_ADDRESS` event; both carry no bytes and transmit nothing. A namespace with only `lo` (section 1) is the only boundary that removes even those attempts.

## 4. What this does and does not establish

- Establishes: the C1 live measurement has **no external dependency** — it produced 16/16 in a namespace with no route and no reachable resolver. A CI or runner that wraps the counter in `unshare -rn` (or a firewall that denies non-loopback egress) cannot make it pass spuriously.
- Establishes: with the frozen five args on a networked host the session **does** put real bytes on the wire to Google endpoints (17.8 kB out, 41.1 kB in, measured per socket from the netlog, matching the strace connects of the same process tree). If C1's "loopback fixture only" is read as "no external traffic", the claim needs either that caveat or the resolver-pin flag.
- Does not establish: any effect on admission. Every predicate is evaluated against committed transcripts and the counter's own session; the leaked requests do not appear in any predicate (`R10`/`R11`/`R12`/`R13` filter on the loopback base URL). No claim bytes were changed by this seat.
- Measurement caveat: in one trace (`suppress-min`) one UDP port-0 probe was mis-attributed to `SOCK_STREAM` by my fd table (fd reuse); the corrected counts in `traffic-matrix.json` exclude port 0 from TCP counts, and `suppress-min` reads 9 TCP attempts to 6 endpoints.

## 5. Hygiene, tooling, leftovers

- Scratch at `/fast/scratch/hyaku/tabi-r32/ExecNoNetwork` used as `TMPDIR`; receipts copied here first, then `rm -rf` (verified absent before yield).
- `pgrep -fa 'user-data-dir=/fast/scratch/hyaku/tabi-r32/ExecNoNetwork'` and `pgrep -fa 'tabi-bidi-live'`: no output; `ls -d /run/user/1000/tabi-bidi-*`: none (the counter removed its profile and socket dirs). Every chromedriver/chromium this seat started is gone.
- One foreign `/usr/bin/chromedriver --port=33721` (pid 2395456, `TMPDIR=/run/user/1000/tabi-ar-EO9ArE`, ppid 2394381) was running on the host during my runs — another seat's; identified, not touched, not mine.
- No tool installs or upgrades (nothing was needed); no pacman transaction was attempted.
- Concurrent lane activity observed at yield (not mine, not touched): `SCORECARD.md`, `SKILL.md`, `corpus/README.md`, `corpus/SOURCES.md`, `corpus/knowledge/rate-signal-decision-table.md`, `corpus/knowledge/webdriver-bidi-capability-matrix.md` are modified in the lane working tree (`git -C <lane> status --porcelain --untracked-files=no` → 6 lines). Every measurement here ran in my own clone pinned at `4181fffb…`, never against that working tree.
- Browser runs used throwaway `--user-data-dir` under my scratch, headless, loopback URLs only; netlog captured in `Everything` mode but the profile contains only the fixture cookie.

## 6. Retained evidence (`$OUT`, 4.8 MB, digests in `SHA256SUMS.txt`)

`netns.json`, `netns2.txt` (namespace topology + two predicate runs) · `trace-default.out`, `netlog-default.json`, `netlog-run.json` (default-flag session) · `trace-default-with-sendto.out`, `run-outside-host-strace.json` (payload-capable trace, 0 external sends) · `run-suppress-all.json`, `run-suppress-min.json`, `run-resolver-pin.json`, `run-resolver-pin-ipv6off.json`, `run-resolver-pin-noquic.json` + their `trace-*.out` / `netlog-*.json` · `traffic-matrix.json` (per-variant counts, endpoints, byte totals) · `probe.mjs`, `probe-variant.mjs`, `variant.mjs`, `run-variant.sh`, `commands.txt`.
