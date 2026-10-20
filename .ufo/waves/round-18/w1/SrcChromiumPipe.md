VERDICT: PASS

Seat `TabiR18.SrcChromiumPipe` (leaf, no dispatch). Opened source for C2 harness hardening:
Chromium 154 `--remote-debugging-pipe` versus `--remote-debugging-port`. Full dossier:
`.ufo/waves/round-18/sources/SrcChromiumPipe.md`.

## Opened (observed)

Canonical URL: https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/content/public/common/content_switches.cc
Fetched 2026-10-20 as `?format=TEXT` (base64), curl HTTP 200, 60,504 B.
Revision: tag `154.0.8037.97` → commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d` (gitiles
`+refs/tags/154.0.8037.97?format=JSON`, committer date 2026-09-30; the same commit S033/S041 record).
Git blob `2ad794823dc328d4ce7253c931eac3c8d3373460`.

- raw-fetch sha256 (base64 bytes as served): `7b5618f52b80dd54b394ad2aa18408ef138a87959b87f29f651094e1df23d47e`
- decoded file sha256 (45,378 B, 990 lines): `0262144447bae97b511b1f4e3cfcda4dcd58c5775c890b0b2ff517a3d1b4764e`
- second GET returned identical bytes (`cmp` → IDENTICAL), so the raw digest is stable at this tag.
- Anchor: `content_switches.cc:596-600` (pipe switch comment + definition), `:602-603` (port switch).

Supporting files at the same tag (all HTTP 200; raw → decoded sha256):

| file | raw sha256 | decoded sha256 (bytes / lines) |
|---|---|---|
| `chrome/browser/devtools/remote_debugging_server.cc` | `ab99943f21a0fd206369cb426a6c370565edcc7c1e3fcf59f4e64f1384bc43bd` | `9279d6f59241d780e02307975ee1fbfd2e95a8294547b32f73a926314d81d15d` (14,979 / 424) |
| `content/browser/devtools/devtools_pipe_handler.cc` | `dcc960242fe5646c99021331c76b2921f386f1156ef7e0f5ebd9f69857533c8a` | `30b772e6f7fc34d1e30b9e288fd2f23aaf2b36b481eeb7180e44f08716583264` (15,028 / 478) |
| `content/browser/devtools/devtools_http_handler.cc` | `5e5d1db48feb77015ecea277d4302a412630143d809fd3ab70cc765a648bbc39` | `9fa47f6bec780d8dc6a9c2eb2132af24e51eb03fe342d24d1094227754f0b011` (40,069 / 1,062) |
| `content/public/common/content_constants.cc` | `6a7d0551d9f3f78d8e29ab825e894825e8f6a15048f10f98976b76cb16860829` | `681271cbc9b603b43191fc2df3e3633e5e5e75c487344c692385a1b5b4d04e84` (2,425 / 72) |
| `content/public/browser/devtools_agent_host.h` | `3218e499504e8c3782436292315fbe4cded0a5270ff33bd8f473bab032f7acbc` | `83db13503dabd20ac879cd9ef1a990fa0855a5de094f4f9ab95bc6eb93013409` (10,058 / 268) |
| `content/browser/devtools/devtools_agent_host_impl.cc` | `9da2afef05a9de35b8435c3314c1dd4a5b4d62ba5291df70e1ca3119afa77336` | `108ffb6c3660072d42ef10d1fa6a7d16edc623cbf083bde8d8f4a45c2e4602bc` (21,192 / 659) |

**The assignment's path `chrome/browser/devtools/devtools_pipe_handler.cc` does not exist at this
tag**: HTTP 404, 233 B, body `NOT_FOUND: Requested entity was not found` + `google.rpc.RequestInfo`
with a per-request id (digest therefore not reproducible). The handler is
`content/browser/devtools/devtools_pipe_handler.cc` (git blob `2a75e6f85e2abd607d55a82d267550c7932989d9`,
confirmed by the `content/browser/devtools/?format=JSON` tree listing and the file's own listing JSON).

## What each opens (each claim line-anchored)

- Pipe: `kRemoteDebuggingPipe` comment `content_switches.cc:596-598`; `kReadFD = 3` / `kWriteFD = 4`
  at `content/public/browser/devtools_agent_host.h:73-74`; `StartRemoteDebuggingPipeHandler` passes
  those constants to `DevToolsPipeHandler` at `content/browser/devtools/devtools_agent_host_impl.cc:220-235`.
- The pipe handler reads with `read(read_fd_, …)` (`devtools_pipe_handler.cc:179-181`) and writes with
  `write(write_fd_, …)` (`:267`); the only socket call is `shutdown(fd, SHUT_RDWR)` on close (`:164`,
  `:248`). No `socket`/`bind`/`listen`/`accept` anywhere in the file; the browser target is created
  with a default (empty) `CreateServerSocketCallback` (`:402-403`). **No TCP listener on the pipe path.**
- `--remote-debugging-port` is documented as "remote debug over HTTP on the specified port"
  (`content_switches.cc:602-603`); the port branch calls `StartHttpServer(TCPServerSocketFactory(port), …)`
  (`chrome/browser/devtools/remote_debugging_server.cc:363-395`).
- `--remote-debugging-pipe` and `--remote-debugging-port` take precedence over the approval-mode HTTP
  server (`remote_debugging_server.cc:397-400`; the pipe branch at `:353-361` sets
  `debugging_server_started = true`, so the `kDevToolsAcceptDebuggingConnections` listener is skipped).
- Pipe mode is also gated by `IsRemoteDebuggingAllowed(is_default_user_data_dir, …)`
  (`remote_debugging_server.cc:353-358`, definition `:162-188`), so the isolated `--user-data-dir`
  rule applies to pipe launches too.
- `DevToolsActivePort` is written only by the HTTP handler
  (`content/browser/devtools/devtools_http_handler.cc:297-306`), guarded by
  `if (!output_directory.empty())`, with content `"%d\n%s"` = port + newline + browser GUID. The output
  dir is populated only for an ephemeral port (`*port == 0`, `remote_debugging_server.cc:366-373`);
  the filename constant is `content/public/common/content_constants.cc:69-70`; the port is read back
  from its first line at `remote_debugging_server.cc:194-211`.

## Quote, check and JSON

Gate quote (content_switches.cc:596-597, comment text, 19 words):

> Enables remote debug over stdio pipes [in=3, out=4] or over the remote pipes // specified in the 'remote-debugging-io-pipes' switch.

(`//` is the source's own comment marker on the second line; the normalizer joins lines with one space,
so this is the verbatim normalized span.)

Command (run from LANE) and output:

```
node .ufo/waves/round-18/recheck-fetch.mjs --normalize-only --decode base64 --body /tmp/tabi-r18-pipe/content_switches.cc.b64 --quote "Enables remote debug over stdio pipes [in=3, out=4] or over the remote pipes // specified in the 'remote-debugging-io-pipes' switch."
```
```json
{"found":true,"offset":26205,"normalizedLength":44208,"window":"ase 4 of User-Agent reduction: // https://blog.chromium.org/2021/09/user-agent-reduction-origin-trial-and-dates.html. const char kReduceUserAgentMinorVersion[] = \"reduce-user-agent-minor-version\"; // Enables remote debug over stdio pipes [in=3, out=4] or over the remote pipes // specified in the 'remote-debugging-io-pipes' switch. // Optionally, specifies the format for the protocol messages, can be either // \"JSON\" (the default) or \"CBOR\". const char kRemoteDebuggingPipe[] = \"remote-debugging-pipe\"; // Enables remote debug ov"}
```

Supporting quote (devtools_http_handler.cc:297-298, 21 words) and its check:

```
node .ufo/waves/round-18/recheck-fetch.mjs --normalize-only --decode base64 --body /tmp/tabi-r18-pipe/devtools_http_handler.cc.b64 --quote "// Write this port to a well-known file in the profile directory // so Telemetry, ChromeDriver, etc. can pick it up."
```
```json
{"found":true,"offset":10328,"normalizedLength":34120,"window":"ress) { std::string message = base::StringPrintf( \"\\nDevTools listening on ws://%s%s\\n\", ip_address->ToString().c_str(), browser_guid.c_str()); fprintf(stderr, \"%s\", message.c_str()); fflush(stderr); // Write this port to a well-known file in the profile directory // so Telemetry, ChromeDriver, etc. can pick it up. if (!output_directory.empty()) { base::FilePath path = output_directory.Append(kDevToolsActivePortFileName); std::string port_target_string = base::StringPrintf( \"%d\\n%s\", ip_address->port(), browser"}
```

Two further spans verified true in the same probe run (precedence at remote_debugging_server.cc:397-398;
fd constants at devtools_agent_host.h:73-74):

```json
{"found":true,"offset":12696,"normalizedLength":13756,"window":"server_started = true; server->StartHttpServer( std::make_unique<TCPServerSocketFactory>(*port), output_dir, debug_frontend_dir, content::DevToolsAgentHost::RemoteDebuggingServerMode::kDefault); } // `--remote-debugging-port` and `--remote-debugging-pipe` // take precedence over the new mode. #if !BUILDFLAG(IS_ANDROID) if (!debugging_server_started && base::FeatureList::IsEnabled( ::features::kDevToolsAcceptDebuggingConnections)) { // In approval mode, each incoming connection needs to be"}
```
```json
{"found":true,"offset":2182,"normalizedLength":9546,"window":"nWorklet[]; static const char kTypeAssistiveTechnology[]; static const char kTypeBrowserUI[]; // File descriptor used by DevTools remote debugging pipe handler // to read and write protocol messages. static constexpr int kReadFD = 3; static constexpr int kWriteFD = 4; // Latest DevTools protocol version supported. static std::string_view GetProtocolVersion(); // Returns whether particular version of DevTools protocol is supported. static bool IsSupportedProtocolVe"}
```

## Contradiction check against PLAN §C2 H3

No statement in PLAN §C2 H3 or its counter `h3` is contradicted. Two precision limits, stated so the
counter is not over-read:

1. PLAN §C2 counter item `h3` conjoins "no browser argv carries `--remote-debugging-port`" with "no
   `DevToolsActivePort` file appears in the run's profile dirs". The file clause alone is **necessary,
   not sufficient**: a fixed `--remote-debugging-port=N` (N≠0) leaves `output_dir` empty
   (`remote_debugging_server.cc:366-373`) and the HTTP handler skips the write
   (`devtools_http_handler.cc:299`), so no file appears. The argv clause is what covers a fixed port;
   keep both conjoined. Presence of the file, by contrast, does indicate an HTTP server ran (single
   write site in the fetched set; approval mode also writes it from `DIR_USER_DATA` at
   `remote_debugging_server.cc:267-278`, but is skipped when pipe is present, `:397-400`).
2. Whether Playwright's `context.newCDPSession(page)` rides that pipe and what argv Playwright emits is
   not this source's scope — S059/S060 seats (SrcPwCdpSession / SrcPwLaunch).

## Draft registry row (11 cells, no pipe inside a cell; L1 replaces `S0??`)

| S0?? | Chromium 154 remote debugging pipe versus port — https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/content/public/common/content_switches.cc | code | A | Transport boundary of --remote-debugging-pipe versus --remote-debugging-port at tag 154.0.8037.97: stdio fds 3 and 4 versus an HTTP listener, and the only DevToolsActivePort write site | tag 154.0.8037.97, commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d, content_switches.cc:596-603, content/browser/devtools/devtools_pipe_handler.cc:135-200, chrome/browser/devtools/remote_debugging_server.cc:353-400, content/browser/devtools/devtools_http_handler.cc:297-306, decoded sha256 0262144447bae97b511b1f4e3cfcda4dcd58c5775c890b0b2ff517a3d1b4764e | Pipe mode carries CDP on inherited stdio fds 3 and 4 and starts no HTTP listener, so a pipe-only launch opens no DevTools TCP port and leaves no DevToolsActivePort file | queued | 2026-10-20 | on-release | — |

Structural proof on a sandbox copy (LANE untouched, `/tmp/tabi-r18-pipe/checkroot`, row inserted as
`S599` because the checker requires three digits):

```
$ node scripts/check-sources.mjs --root /tmp/tabi-r18-pipe/checkroot --file corpus/SOURCES.md
SOURCES_GATE verdict=clean rows=58 tiers=A:47,B:4,C:7 status=queued:9,mined:42,rejected:7 findings=0 file=corpus/SOURCES.md
exit=0
```
Baseline control, unmodified copy: `verdict=clean rows=57 tiers=A:46,B:4,C:7 status=queued:8,mined:42,rejected:7 findings=0`, exit 0. Frozen awks: malformed 0, duplicate ids none, enum violations none, row splits 13 pipe fields.

## Gate entry (for `corpus/lessons/round-18.md` §Gate)

| S0?? | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/content/public/common/content_switches.cc | "Enables remote debug over stdio pipes [in=3, out=4] or over the remote pipes // specified in the 'remote-debugging-io-pipes' switch." | lines 596-597; tag 154.0.8037.97, commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d; decoded sha256 0262144447bae97b511b1f4e3cfcda4dcd58c5775c890b0b2ff517a3d1b4764e; raw base64 fetch sha256 7b5618f52b80dd54b394ad2aa18408ef138a87959b87f29f651094e1df23d47e |

## Notes

- Tier A is scoped to the 154.0.8037.97 build's transport behaviour and the `DevToolsActivePort`
  write site; kind `code`; cadence `on-release`.
- `status=queued` + `used-by=—` because no committed knowledge entry or lesson cites the row yet;
  flip to `mined` with `corpus/lessons/round-18.md` at integration (append-only, logged old→new).
- No tool installs or upgrades (no pacman, no uv/npx/cargo). Scratch `/tmp/tabi-r18-pipe` deleted
  after the checks; nothing was written under `corpus/`, `.ufo/state/`, or any frozen path.

## Files written

- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/sources/SrcChromiumPipe.md
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/SrcChromiumPipe.md
