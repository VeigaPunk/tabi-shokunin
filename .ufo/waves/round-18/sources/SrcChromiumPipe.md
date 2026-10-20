# SrcChromiumPipe — Chromium 154 pipe vs port and the DevToolsActivePort write (source open, round 18)

VERDICT: PASS

Seat `TabiR18.SrcChromiumPipe` (leaf, no dispatch). Opened 2026-10-20 for C2 (operability,
harness hardening): the transport facts H3 asserts — `--remote-debugging-pipe` carries CDP on
inherited stdio fds, the pipe path starts no HTTP/TCP listener, and only the HTTP handler writes
`DevToolsActivePort`.

## Opened source

| Field | Value |
|---|---|
| canonical URL | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/content/public/common/content_switches.cc |
| fetch URL (raw bytes, base64) | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/content/public/common/content_switches.cc?format=TEXT |
| revision | tag `154.0.8037.97` → commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d` (gitiles `+refs/tags/154.0.8037.97?format=JSON`; same commit S033 and S041 record), git blob `2ad794823dc328d4ce7253c931eac3c8d3373460` |
| access date | 2026-10-20 |
| raw-fetch sha256 (base64 as served, 60,504 B) | `7b5618f52b80dd54b394ad2aa18408ef138a87959b87f29f651094e1df23d47e` |
| decoded file sha256 (45,378 B, 990 lines) | `0262144447bae97b511b1f4e3cfcda4dcd58c5775c890b0b2ff517a3d1b4764e` |
| anchor | `content_switches.cc:596-600` (pipe switch comment + definition), `:602-603` (port switch); supporting files listed in §Fetch sweep |
| kind | `code` |
| tier | **A**, scoped to: the transport behaviour of `--remote-debugging-pipe` versus `--remote-debugging-port` in the 154.0.8037.97 build, and the write site of `DevToolsActivePort` |
| recheck cadence | `on-release` (Chromium tag) |

**VERBATIM quote** (content_switches.cc:596-597, comment text; decoded file sha256 `02621444…764e`):

> `Enables remote debug over stdio pipes [in=3, out=4] or over the remote pipes // specified in the 'remote-debugging-io-pipes' switch.`

19 words. The `//` is the source's own line-comment marker on the second line: the normalizer joins
lines with one space, so the verbatim normalized span carries it. Checked with the lane normalizer
(`--normalize-only --decode base64`), `found:true`, offset 26205 — JSON pasted in §Normalizer probe.

**What it teaches the lane, one line:** pipe mode carries CDP on inherited stdio fds 3 and 4 and
starts no HTTP listener, so a pipe-only launch opens no DevTools TCP port and leaves no
`DevToolsActivePort` file.

## Fetch sweep — every URL reachable except the assignment's pipe path

| URL (tag `154.0.8037.97`) | HTTP | raw bytes | raw sha256 (as served, base64) | decoded B / lines | decoded sha256 |
|---|---|---|---|---|---|
| `content/public/common/content_switches.cc?format=TEXT` | 200 | 60,504 | `7b5618f52b80dd54b394ad2aa18408ef138a87959b87f29f651094e1df23d47e` | 45,378 / 990 | `0262144447bae97b511b1f4e3cfcda4dcd58c5775c890b0b2ff517a3d1b4764e` |
| `chrome/browser/devtools/remote_debugging_server.cc?format=TEXT` | 200 | 19,972 | `ab99943f21a0fd206369cb426a6c370565edcc7c1e3fcf59f4e64f1384bc43bd` | 14,979 / 424 | `9279d6f59241d780e02307975ee1fbfd2e95a8294547b32f73a926314d81d15d` |
| `content/browser/devtools/devtools_pipe_handler.cc?format=TEXT` | 200 | 20,040 | `dcc960242fe5646c99021331c76b2921f386f1156ef7e0f5ebd9f69857533c8a` | 15,028 / 478 | `30b772e6f7fc34d1e30b9e288fd2f23aaf2b36b481eeb7180e44f08716583264` |
| `content/browser/devtools/devtools_pipe_handler.h?format=TEXT` | 200 | 2,596 | `c486d998408d13f6a043181985b48dbc39ea55f92526e947d51227ad35e0fc17` | 1,946 / 64 | `c11394f294ba735a81f4a92706e67bdfda7851fe8d3826e56545a75e323e0129` |
| `content/browser/devtools/devtools_http_handler.cc?format=TEXT` | 200 | 53,428 | `5e5d1db48feb77015ecea277d4302a412630143d809fd3ab70cc765a648bbc39` | 40,069 / 1,062 | `9fa47f6bec780d8dc6a9c2eb2132af24e51eb03fe342d24d1094227754f0b011` |
| `content/public/common/content_constants.cc?format=TEXT` | 200 | 3,236 | `6a7d0551d9f3f78d8e29ab825e894825e8f6a15048f10f98976b76cb16860829` | 2,425 / 72 | `681271cbc9b603b43191fc2df3e3633e5e5e75c487344c692385a1b5b4d04e84` |
| `content/public/browser/devtools_agent_host.h?format=TEXT` | 200 | 13,412 | `3218e499504e8c3782436292315fbe4cded0a5270ff33bd8f473bab032f7acbc` | 10,058 / 268 | `83db13503dabd20ac879cd9ef1a990fa0855a5de094f4f9ab95bc6eb93013409` |
| `content/browser/devtools/devtools_agent_host_impl.cc?format=TEXT` | 200 | 28,256 | `9da2afef05a9de35b8435c3314c1dd4a5b4d62ba5291df70e1ca3119afa77336` | 21,192 / 659 | `108ffb6c3660072d42ef10d1fa6a7d16edc623cbf083bde8d8f4a45c2e4602bc` |
| `chrome/browser/devtools/devtools_pipe_handler.cc?format=TEXT` (the assignment's path) | **404** | 233 | not recorded: the body carries a per-request id, so its digest is not reproducible | — | no such file at this tag; the handler lives under `content/browser/devtools/` |

Observed, not inferred: the 404 body is ASCII `NOT_FOUND: Requested entity was not found` followed by
a `google.rpc.LocalizedMessage` (`locale: "en-US"`) and a `google.rpc.RequestInfo` whose
`request_id` changes per fetch — that is why no 404 digest is claimed as stable. The blob id `2a75e6f85e2abd607d55a82d267550c7932989d9` from the
`content/browser/devtools/?format=JSON` tree listing matches the fetched `devtools_pipe_handler.cc`,
and the file listing JSON reports the same blob for the fetched bytes.

Tag object: `+refs/tags/154.0.8037.97?format=JSON` → `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`,
committer date `Wed Sep 30 21:20:00 2026` (gitiles tag object). File blob ids: content_switches.cc
`2ad79482…3460`, remote_debugging_server.cc `d348e869…0525`, devtools_http_handler.cc
`d14be48b…5e9c`, devtools_pipe_handler.cc `2a75e6f8…89d9`.

Reproducibility check: a second GET of the content_switches.cc fetch URL returned the identical
60,504 bytes, sha256 `7b5618f5…d47e` (`cmp` → IDENTICAL), so the recorded raw digest is stable
across fetches at this tag, unlike the 404 body's per-request id.

## Facts, each with a line anchor

| Fact (tag `154.0.8037.97`) | Line anchor | What a C2 claim may assert |
|---|---|---|
| `kRemoteDebuggingPipe` = `remote-debugging-pipe`, documented as "remote debug over stdio pipes [in=3, out=4]" or the `remote-debugging-io-pipes` handles; optional value `JSON` (default) or `CBOR` | content_switches.cc:596-600 | Pipe mode is an inherited-fd transport, not a network transport |
| `kRemoteDebuggingPort` = `remote-debugging-port`, documented as "remote debug over HTTP on the specified port" | content_switches.cc:602-603 | Only the port switch is documented as HTTP |
| `kReadFD = 3`, `kWriteFD = 4` on `DevToolsAgentHost` | content/public/browser/devtools_agent_host.h:73-74 | The browser reads commands on fd 3 and writes protocol messages on fd 4 |
| `StartRemoteDebuggingPipeHandler` takes those constants and constructs `DevToolsPipeHandler(read_fd, write_fd, …)`; only on Windows does `remote-debugging-io-pipes` replace them via `AdoptPipes` | content/browser/devtools/devtools_agent_host_impl.cc:220-235 | On Linux the pipe is exactly fds 3/4; no pipe-name or socket switch is consulted |
| `PipeReaderBase` holds an `int read_fd` and calls `read(read_fd_, …)`; `PipeWriterBase` calls `write(write_fd_, …)`; the only socket call is `shutdown(fd, SHUT_RDWR)` on close | content/browser/devtools/devtools_pipe_handler.cc:135-181, 223-282 | The pipe handler never creates, binds, listens on, or accepts a socket |
| `DevToolsPipeHandler` builds the browser target with a default (empty) `CreateServerSocketCallback` | content/browser/devtools/devtools_pipe_handler.cc:402-405; devtools_agent_host.h:115-122 | No server-socket factory is supplied on the pipe path |
| The pipe branch of `RemoteDebuggingServer::GetInstance` calls `StartPipeHandler()` only; it sets `debugging_server_started = true` | chrome/browser/devtools/remote_debugging_server.cc:353-361 | Pipe mode starts no HTTP server from this entry point |
| Comment: "`--remote-debugging-port` and `--remote-debugging-pipe` take precedence over the new mode", guarding the `kDevToolsAcceptDebuggingConnections` approval-mode HTTP server behind `!debugging_server_started` | chrome/browser/devtools/remote_debugging_server.cc:397-400 | A pipe launch suppresses the approval-mode TCP fallback even when that feature is enabled |
| Pipe mode passes through the same `IsRemoteDebuggingAllowed(is_default_user_data_dir, …)` refusal before starting | chrome/browser/devtools/remote_debugging_server.cc:353-358, 162-188 | The isolated `--user-data-dir` requirement applies to pipe launches too |
| `output_dir` is populated with `chrome::DIR_USER_DATA` only when `*port == 0` (ephemeral) | chrome/browser/devtools/remote_debugging_server.cc:363-373 | A fixed port produces an **empty** active-port output directory |
| HTTP handler comment: "Write this port to a well-known file in the profile directory so Telemetry, ChromeDriver, etc. can pick it up"; guarded by `if (!output_directory.empty())`; content is `"%d\n%s"` = port newline browser GUID | content/browser/devtools/devtools_http_handler.cc:297-306 | `DevToolsActivePort` is written by the HTTP server path, and only when the caller passed a non-empty output directory |
| The filename constant is `FILE_PATH_LITERAL("DevToolsActivePort")` | content/public/common/content_constants.cc:69-70 | The probe greps the right name |
| `GetPortFromUserDataDir` reads the first line of `DevToolsActivePort` back as the port | chrome/browser/devtools/remote_debugging_server.cc:194-211 | The file is the port-bootstrap channel, confirming it belongs to the HTTP transport |

## Consequence for C2 H3 (PLAN §C2) — no contradiction, two precision limits

The design's H3 (`--remote-debugging-port` absent; CDP over Playwright's pipe) and the counter's h3
(argv carries no `--remote-debugging-port`; no `DevToolsActivePort` under the run's profile dirs) are
**consistent** with this source. Where the counter must not over-read:

1. **Absence of `DevToolsActivePort` is necessary, not sufficient, as a no-listener witness.** A
   fixed `--remote-debugging-port=N` launch passes an empty `output_dir`
   (chrome/browser/devtools/remote_debugging_server.cc:366-373) and the HTTP handler then skips the
   write (`if (!output_directory.empty())`, devtools_http_handler.cc:299). Only an ephemeral (`0`)
   port leaves the file. The argv clause is the witness that covers a fixed port; the file check
   alone would miss it. PLAN §C2 counter h3 is sound **because both clauses are conjoined** — keep
   them conjoined.
2. **Presence of the file does prove an HTTP server ran**, under this tag: across the eight files
   fetched here, `kDevToolsActivePortFileName` occurs only at devtools_http_handler.cc:301/304 (the
   single write), remote_debugging_server.cc:198 (read-back of the first line) and
   content_constants.cc:69 (the filename). That sweep is scoped to the files fetched — it is not a
   whole-tree absence claim. The approval-mode server also writes it from `DIR_USER_DATA`
   (remote_debugging_server.cc:267-278), but a pipe launch suppresses that path (397-400).
3. Playwright's side — that `context.newCDPSession(page)` rides the existing pipe and the launch
   argv Playwright generates — is **not** established by this source; it is S059/S060 territory
   (SrcPwCdpSession / SrcPwLaunch seats).

No statement in PLAN §C2's H3 or counter h3 is contradicted by these files; the above only bounds
what the file-absence clause proves on its own.

## Supporting quote, verified separately (not the Gate quote)

content/browser/devtools/devtools_http_handler.cc:297-298, decoded sha256 `9fa47f6b…b011`:

> `// Write this port to a well-known file in the profile directory // so Telemetry, ChromeDriver, etc. can pick it up.`

Normalizer: `found:true`, offset 10328. Grounds where `DevToolsActivePort` is written and why.

## Normalizer probe (`node .ufo/waves/round-18/recheck-fetch.mjs --normalize-only`, run from LANE)

Gate quote, `--decode base64 --body content_switches.cc.b64`:

```json
{"found":true,"offset":26205,"normalizedLength":44208,"window":"ase 4 of User-Agent reduction: // https://blog.chromium.org/2021/09/user-agent-reduction-origin-trial-and-dates.html. const char kReduceUserAgentMinorVersion[] = \"reduce-user-agent-minor-version\"; // Enables remote debug over stdio pipes [in=3, out=4] or over the remote pipes // specified in the 'remote-debugging-io-pipes' switch. // Optionally, specifies the format for the protocol messages, can be either // \"JSON\" (the default) or \"CBOR\". const char kRemoteDebuggingPipe[] = \"remote-debugging-pipe\"; // Enables remote debug ov"}
```

Supporting quote, `--decode base64 --body devtools_http_handler.cc.b64`:

```json
{"found":true,"offset":10328,"normalizedLength":34120,"window":"ress) { std::string message = base::StringPrintf( \"\\nDevTools listening on ws://%s%s\\n\", ip_address->ToString().c_str(), browser_guid.c_str()); fprintf(stderr, \"%s\", message.c_str()); fflush(stderr); // Write this port to a well-known file in the profile directory // so Telemetry, ChromeDriver, etc. can pick it up. if (!output_directory.empty()) { base::FilePath path = output_directory.Append(kDevToolsActivePortFileName); std::string port_target_string = base::StringPrintf( \"%d\\n%s\", ip_address->port(), browser"}
```

Two further spans checked in the same probe run (not quoted in the row):

```json
{"found":true,"offset":12696,"normalizedLength":13756,"window":"server_started = true; server->StartHttpServer( std::make_unique<TCPServerSocketFactory>(*port), output_dir, debug_frontend_dir, content::DevToolsAgentHost::RemoteDebuggingServerMode::kDefault); } // `--remote-debugging-port` and `--remote-debugging-pipe` // take precedence over the new mode. #if !BUILDFLAG(IS_ANDROID) if (!debugging_server_started && base::FeatureList::IsEnabled( ::features::kDevToolsAcceptDebuggingConnections)) { // In approval mode, each incoming connection needs to be"}
```
```json
{"found":true,"offset":2182,"normalizedLength":9546,"window":"nWorklet[]; static const char kTypeAssistiveTechnology[]; static const char kTypeBrowserUI[]; // File descriptor used by DevTools remote debugging pipe handler // to read and write protocol messages. static constexpr int kReadFD = 3; static constexpr int kWriteFD = 4; // Latest DevTools protocol version supported. static std::string_view GetProtocolVersion(); // Returns whether particular version of DevTools protocol is supported. static bool IsSupportedProtocolVe"}
```

## Relationship to existing rows and notes

- **Not a duplicate**: S004/S028 cover the branded default-data-dir refusal in the same file
  (`remote_debugging_server.cc`); this row covers the pipe-vs-port transport and the
  `DevToolsActivePort` write site. It only records, in passing, that the refusal also gates the pipe
  branch (353-358), which is a line-level fact S028 does not state.
- **Consistent with S001/S002/S028**: the harness must still pass a dedicated `--user-data-dir`, and
  CDP remains an unversioned surface.
- **C1-adjacent anchoring**: tag → commit resolves to `b510e9d7…f78d`, the same commit S033/S041
  record, and every file carries a blob id plus a content digest, so a citation here survives a
  `main` HEAD move.
- No contradiction with any registry row, `corpus/knowledge/chrome-remote-debugging-profile-boundary.md`,
  or PLAN §C2 as stated.

## Draft registry row (11 cells, no pipe inside a cell; L1 assigns the id)

| S0?? | Chromium 154 remote debugging pipe versus port — https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/content/public/common/content_switches.cc | code | A | Transport boundary of --remote-debugging-pipe versus --remote-debugging-port at tag 154.0.8037.97: stdio fds 3 and 4 versus an HTTP listener, and the only DevToolsActivePort write site | tag 154.0.8037.97, commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d, content_switches.cc:596-603, content/browser/devtools/devtools_pipe_handler.cc:135-200, chrome/browser/devtools/remote_debugging_server.cc:353-400, content/browser/devtools/devtools_http_handler.cc:297-306, decoded sha256 0262144447bae97b511b1f4e3cfcda4dcd58c5775c890b0b2ff517a3d1b4764e | Pipe mode carries CDP on inherited stdio fds 3 and 4 and starts no HTTP listener, so a pipe-only launch opens no DevTools TCP port and leaves no DevToolsActivePort file | queued | 2026-10-20 | on-release | — |

Cell audit: 11 cells; no cell contains a pipe character; `kind=code` and `tier=A` are enum-legal;
`status=queued` with `used-by=—` is the round-17 two-step-safe variant (apply when the round-18
lesson cites the row: `mined` plus that lesson path).

Structural proof, run on a sandbox copy (LANE untouched; root `/tmp/tabi-r18-pipe/checkroot`, the row
inserted with the id placeholder `S599`, since the checker's row regex requires three digits):

```
$ node scripts/check-sources.mjs --root /tmp/tabi-r18-pipe/checkroot --file corpus/SOURCES.md
SOURCES_GATE verdict=clean rows=58 tiers=A:47,B:4,C:7 status=queued:9,mined:42,rejected:7 findings=0 file=corpus/SOURCES.md
exit=0
```

Frozen census awks on the same copy: rows 58; malformed 0; duplicate ids none; enum violations none;
the inserted row splits into 13 pipe fields (11 cells). Baseline control on an unmodified copy
(`/tmp/tabi-r18-pipe/checkroot0`, same command):

```
SOURCES_GATE verdict=clean rows=57 tiers=A:46,B:4,C:7 status=queued:8,mined:42,rejected:7 findings=0 file=corpus/SOURCES.md
exit=0
```

so the delta is exactly +1 row, A+1, queued+1.

## Gate entry (for `corpus/lessons/round-18.md` §Gate)

| S0?? | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/content/public/common/content_switches.cc | "Enables remote debug over stdio pipes [in=3, out=4] or over the remote pipes // specified in the 'remote-debugging-io-pipes' switch." | lines 596-597; tag 154.0.8037.97, commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d; decoded sha256 `0262144447bae97b511b1f4e3cfcda4dcd58c5775c890b0b2ff517a3d1b4764e`; raw base64 fetch sha256 `7b5618f52b80dd54b394ad2aa18408ef138a87959b87f29f651094e1df23d47e` |

## Integration notes

1. `S0??` is the ticket's placeholder. At open time the registry's last id is S057; PLAN §C3 D4
   allocates S058 to the S057 supersession, and PLAN §C2 allots S059+ to the six C2 source rows.
   The L1 fills the actual id.
2. The row is `queued` with `used-by=—` because no committed knowledge entry or lesson cites it yet;
   flip to `mined` with `corpus/lessons/round-18.md` once that lesson lands (append-only, logged
   old→new).
3. `corpus/knowledge/**` is L1-owned; no knowledge note was written here.
4. Tooling: no installs or upgrades. `curl`, `sha256sum`, `node` v24.21.0 and the lane's own
   `recheck-fetch.mjs --normalize-only` were used as provided. Scratch fetch dir `/tmp/tabi-r18-pipe`
   is deleted after this dossier (see the seat report).

## Files written

- `.ufo/waves/round-18/sources/SrcChromiumPipe.md` (this file)
- `.ufo/waves/round-18/w1/SrcChromiumPipe.md` (seat report)
