# ExecFirefoxDelta — C2 build: what the second engine shows that Chromium does not (round 35, w1)

**Verdict.** Firefox 158.0.1 through geckodriver 0.37.1 executed the lane's entire 28-command BiDi
recipe headless over the gate's loopback fixture with **0 error responses**, and its record — parsed
by the gate's own `recordFromTranscript` and graded by the gate's own frozen `PREDICATES` — satisfies
**all 16 rows that have a BiDi command (R1–R15, R17); R16 is `no-bidi-counterpart` by construction**,
exactly as the Chromium record does. The two engines nevertheless differ on **11 of 17 rows**: the
differences are identity grammars (session/context/realm/sharedId/request-id), the capability
namespace (`moz:*` + `userAgent` vs `goog:*`/`chrome`/`webauthn:*`, and Chromium publishes no driver
version at all), key sets that add `userContext` on every Firefox event and `goog:resource*` inside
every Chromium request, screenshot bytes (same 640x480 PNG, 6626 B vs 9451 B, distinct sha256),
Firefox's automatic `/favicon.ico` traffic, Chromium's duplicated request headers and proxy-ordered
response headers, different meanings for `bodySize`/`content.size`/`mimeType`, cookie `sameSite:
"none"` vs `"default"` plus `goog:` cookie fields and `partitionKey` `{"userContext":"default"}` vs
`{}`. Two rows that matter for C2 come out **identical**: `network.getData` returns
`bytes:{type:"string",value:"tabi-bidi-body-0123456789\n"}` on both (so no base64 path is needed on
Firefox 158), and screenshot dimensions are the pinned 640x480 on both — but cross-engine screenshot
byte-equality is impossible, so the counter's binding must stay within-engine. Both executions of the
recipe (this seat ran it twice end to end) produced byte-identical screenshots per engine, which is
the within-engine determinism the C2 receipt relies on.

**Scope honesty.** This is a delta measurement, not the C2 verdict: the C2 claim still needs two
*committed* Firefox runs, the receipt with driver/transcript digests, the entry, the `## Gate` rows
and the counter's own live leg. What is measured here is one Chromium and one Firefox session per
execution, twice, on this host build.

## Evidence — commands, exit codes

| # | command | exit |
|---|---|---|
| 1 | `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"` ; `git -C "$S/clone" checkout -q --detach a4bfef0f75027c915e715649950b1d46dcb33d83` ; `git rev-parse --show-toplevel` → `$S/clone` ; `git rev-parse HEAD` → `a4bfef0f…3d83` | 0 |
| 2 | `sha256sum scripts/check-bidi-runtime.mjs` → `370e8e95417e16dd3535f2dd5015a0b820655934200d489434fb642db7d86c87` = the counter's frozen `GATE_SHA256`; counter → `7cc7f17f…954e` | 0 |
| 3 | `CLONE=$S/clone OUT=<out> TMPDIR=/fast/r35d XDG_RUNTIME_DIR=/fast/r35d node $S/delta.mjs` (execution 1) → `chromium ok ms=1104 cmds=28 events=14`, `firefox ok ms=2312 cmds=28 events=20` | 0 |
| 4 | same, execution 2 (archived) → `chromium ok ms=1054 cmds=28 events=14`, `firefox ok ms=2332 cmds=28 events=20`, `11/17 rows differ` | 0 |
| 5 | gate-only round-trip: `node -e` importing the clone's gate, `recordFromTranscript(<raw jsonl>)` then every `PREDICATES[id]` → Chromium 28/14, Firefox 28/20, each `R1–R15,R17 holds`, `R16 no-bidi-counterpart` | 0 |
| 6 | `/usr/lib/chromium/chromium --version`, `chromedriver --version`, `/home/vgpnk/.local/opt/firefox-158.0.1/firefox --version`, `/home/vgpnk/.local/bin/geckodriver --version`, `node --version` | 0 each |
| 7 | `/home/vgpnk/.local/bin/geckodriver --help` | 0 |
| 8 | cleanup probe: `ps -eo pid,cmd \| grep -E 'geckodriver\|chromedriver\|firefox-158'` → only PID 3620392+ (sibling seat `SentinelFirefoxEgress`, scratch `/fast/scratch/hyaku/tabi-r35/SentinelFirefoxEgress/…`); `grep -E '/fast/r35d\|ExecFirefoxDelta\|tabi-bidi-live\|tabi-r35-c2-live'` → none; `ss -ltnp \| grep :9222` → nothing listening | — |

Line-level evidence (transcript = the archived JSONL, one wire frame per line):

- session id and caps: `chromium-raw.jsonl:1` (`0393b1f74e694563191cc4dc795d0d03`, `goog:*`/`chrome`/`webauthn:*`, no driver-version capability) vs `firefox-raw.jsonl:1` (`561d933b-a79d-4fac-8368-e4ffaf0b32c5`, `moz:geckodriverVersion 0.37.1`, `moz:profile`, `moz:headless`, `userAgent`).
- context id / clientWindow: `chromium-raw.jsonl:5` (`9941EDA1CAC951169DB976699136A439`, `"670821243"`) vs `firefox-raw.jsonl:5` (`3a6aef5e-1ea9-4477-aa64-70a0a193cf02`, UUID clientWindow); same eight getTree keys on both.
- realm: `chromium-raw.jsonl:16` `"-1657667056582648833.-557790419596291681"` (new pair at `:18`) vs `firefox-raw.jsonl:16` `64f43ffb-5042-44cd-ba75-91bf138cc439`.
- sharedId: `chromium-raw.jsonl:22` `f.<CTX>.d.<hex32>.e.4` (context id in clear) vs `firefox-raw.jsonl:24` opaque UUID; node `value` key set identical on both.
- screenshot: `chromium-raw.jsonl:20` 8836 b64 chars / 6626 B / sha256 `ee0ede…eca5` vs `firefox-raw.jsonl:22` 12604 / 9451 B / sha256 `7a3ae6…fd02`; IHDR 640x480 both; identical per-engine hashes in both executions.
- network key sets: `chromium-raw.jsonl:12` (no `userContext`; request carries `goog:resourceType`/`goog:resourceInitiator`) vs `firefox-raw.jsonl:12` (`userContext:"default"`, no `goog:` request fields).
- favicon: `firefox-raw.jsonl:17-18`, `:62-63`, `:69-70` (3 auto requests; the traversal re-fetch interleaves between `traverseHistory` at `:64` and the pathname probe at `:71`); Chromium has none (5 BRS / 5 RC vs 8 / 8).
- request headers: `chromium-raw.jsonl:12` 19 entries, 14 unique names, five names duplicated verbatim; `firefox-raw.jsonl:12` 11 unique, `Host` first; value encoding `{"type":"string","value":…}` on both.
- response semantics: `chromium-raw.jsonl:13` `bodySize:703 content:{size:474} headersSize:198 mimeType:"text/html"`, proxy-ordered headers vs `firefox-raw.jsonl:13` `bodySize:474 content:{size:0} headersSize:217 mimeType:"text/html;charset=utf-8"`, server order; `bytesReceived:703` and `x-tabi-fixture: r32` on both, so R11's predicate holds on both.
- cookies: `chromium-raw.jsonl:44` (`sameSite:"none"` + `goog:priority/goog:session/goog:sourcePort/goog:sourceScheme`, `partitionKey:{"userContext":"default"}`) vs `firefox-raw.jsonl:46` (`sameSite:"default"`, no `goog:` fields, `partitionKey:{}`).
- getData: `chromium-raw.jsonl:42` and `firefox-raw.jsonl:44` — `bytes:{type:"string",value:"tabi-bidi-body-0123456789\n"}`, byte-identical to `DATA_TEXT` on both.
- prompt: `chromium-raw.jsonl:69` `{context,handler:"ignore",message:"tabi-alert",type:"alert"}` vs `firefox-raw.jsonl:75` same plus `userContext:"default"`.
- request id: `chromium-raw.jsonl:12` `BD28158C69CE68AE137D56D77EE8F90A` (32 uppercase hex) vs `firefox-raw.jsonl:12` `7-24915bfc-…` (`<int>-<uuid>`); `navigation` is a UUID on both (`:11`).

## geckodriver default recorded verbatim

`/home/vgpnk/.local/bin/geckodriver --help`:

```
      --websocket-port <PORT>
          Port to use to connect to WebDriver BiDi [default: 9222]
```

9222 is the operator's musketeer CDP lease port. Both recorders pass an ephemeral `--websocket-port`
(counter line 195); I passed `--port`/`--websocket-port` from `freePort()` and never bound, connected
to or probed 9222 (`ss -ltnp` shows no listener before or after).

## Risks handed forward (not repaired here)

1. **`moz:profile` in a committed transcript**: geckodriver reports an absolute profile path in
   capabilities (`firefox-raw.jsonl:1`). Under the counter it lives in throwaway scratch, but a
   committed run's transcript will carry a host path — the C2 seat should state its redaction policy
   or accept publishing that path.
2. **Strict key-set validators**: `userContext` (Firefox events) and `goog:resource*` (Chromium
   requests) mean per-method key-set equality is engine-specific; R3/R10/R13/R17 will fail such a
   validator on one engine. The frozen predicates read values by name and are unaffected.
3. **Count/order heuristics**: Firefox's `/favicon.ico` fetches (3 per run) and Chromium's
   duplicated request headers make header/event counting engine-specific; URL-keyed and
   first-match lookups are safe on both.
4. **No cross-engine pixel binding**: same viewport, different bytes (D4). Any receipt that records
   a screenshot sha256 must bind it to its own engine only.
5. **Transcript provenance**: these JSONL files are re-serialised from the recorders' returned
   `{newSession, cmds, events}` (the objects the predicates consume), not a driver-emitted log, so
   they prove shape and predicate satisfaction, not geckodriver's internal framing. The C2 seat's
   independent driver must emit its own transcripts.
6. **`sameSite`**: Chromium reads the fixture's attribute-less cookie as `"none"`, Firefox as
   `"default"`; an entry that quotes one engine's value as the cookie's policy would be wrong for the
   other.

## Files (relative to the lane root)

- `.ufo/waves/round-35/w1/ExecFirefoxDelta/delta.tsv` — R1..R17 × method × chromium × firefox × differs
- `.ufo/waves/round-35/w1/ExecFirefoxDelta/delta.md` — D1–D10 with transcript line citations + reproduce steps
- `.ufo/waves/round-35/w1/ExecFirefoxDelta/chromium-raw.jsonl` (71 lines) / `firefox-raw.jsonl` (77 lines)
- `.ufo/waves/round-35/w1/ExecFirefoxDelta/shapes.json` — per-row signatures, per-method status/error inventories, round-trip predicate table
- `.ufo/waves/round-35/w1/ExecFirefoxDelta/versions.txt`, `geckodriver-help.txt`
- `.ufo/waves/round-35/w1/ExecFirefoxDelta/delta-driver.mjs` — the exact driver that produced them (sha256 `56ebbb33…1014`)

Artifact sha256: `chromium-raw.jsonl eef2acc7…c46f`, `firefox-raw.jsonl 902d96bf…2996`,
`delta.tsv 58953f93…dfb3`, `delta.md e62b6d09…50c6`, `shapes.json 6149d510…6ea1`,
`versions.txt 2dc2d54e…6239`, `geckodriver-help.txt f7b93142…04bc`.

## Tooling and cleanup

- Installs this seat: **none** (pacman untouched — host-wide pause respected; nothing written to
  `~/.local/bin`). Firefox 158.0.1 and geckodriver 0.37.1 were already installed by this round.
- Scratch (`/fast/scratch/hyaku/tabi-r35/ExecFirefoxDelta`, plus the short-`TMPDIR` symlink
  `/fast/r35d` created because the gate needs `TMPDIR` ≤38 bytes for chromium's singleton socket)
  deleted after the artifacts were copied out; the recorders removed their own mkdtemp trees, and no
  geckodriver/chromedriver/firefox/chromium process owned by this seat survives.
- Lane, lane git index, fleet repo and sibling lanes: not written. Read-only `git` only inside the
  scratch clone.
