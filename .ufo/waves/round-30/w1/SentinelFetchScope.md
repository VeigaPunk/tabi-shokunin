# SentinelFetchScope — round-30 w1 security/scope review of the network + counter surface

**Verdict.** The C2 live surface is *not* limited to public network fetches, and the counter's own
header claim that it "never reads credentials or session material" (`scripts/check-frontier-admission.mjs:22`)
does not hold in general. I proved, against the frozen counter bytes
(`sha256 cadef57e8d9627a02d7e8c5404689225cf5b4de361e816f62c4127b28a509eca`, `--repo` mode, exit
codes pasted below) that a committed receipt can (a) make `--live` read an **arbitrary local file**
via a `file://` URL and reach `admitted: 1` **with no network involvement at all** — which voids the
round's own defence of `--live` against self-quoting receipts — (b) embed **basic-auth credentials**
in the receipt URL that curl then transmits, (c) reach **loopback/internal addresses** (no address
filtering exists) and **follow `-L` redirects off the origin and down to cleartext `http`**, with the
final body silently accepted as the "live source", and (d) inherit ambient `~/.curlrc`/`~/.netrc`, so
the verdict depends on the operator's dotfiles and can transmit netrc credentials. Two surfaces held
clean: `bytes_path` cannot escape the repo (the counter rejects `..`/absolute paths at :110 and git
refuses the show at exit 128), and curl on a redirect refuses `file://` (exit 1, "Protocol file is
disabled (in redirect)"). Scope: the C2 fetch targets (IETF archive, `docs.discord.com`) are public
read-only documentation; both of my GETs returned 200 with no `Set-Cookie`, and my IETF bytes hash
identically to the FetchS159 receipt, so the C2 sourcing is observation-only and inside `PROVINCE.md`.
No W1 instruction calls the Discord or GitHub API; one instruction asks for a fetch of the
`discord.com` **apex** host, which lies outside this wave's named host allowlist. Nothing here was
repaired: the counter is frozen, so these become known limits / next-round amendments (F1–F7).

## Scope, bounds, method

- Read-only. Lane checkout never touched; work in `$HYAKU_SCRATCH/tabi-r30/SentinelFetchScope/`
  (`/fast/scratch/hyaku/tabi-r30/SentinelFetchScope`), one `git clone --shared` checked out at the freeze rev:

```
$ git -C clone rev-parse HEAD
061e62024c0523d3c6c7e819506a773ff2cd7d75                          exit 0
$ sha256sum clone/scripts/check-frontier-admission.mjs clone/scripts/check-gate-mutants.mjs clone/scripts/gate-mutants.json
cadef57e8d9627a02d7e8c5404689225cf5b4de361e816f62c4127b28a509eca  check-frontier-admission.mjs
02945f882ea9c62a3f42934f13b4dc52887ebd93a5a69dd6526d20f01cec3a55  check-gate-mutants.mjs
cd1c27a2a971f8a4d4208fd53efe3adbc776efacb7072201af8bb55b93853833  gate-mutants.json
```

  All three match `claims.json.frozenDigests`; every reading below is from those bytes.
- Fixtures: my own git repos under `$S/fx/<case>` (one entry, one S116 row, receipt + refetch +
  committed bytes + lesson, so `e1`–`g7` all pass) driven through the **unmodified** counter:

```
node clone/scripts/check-frontier-admission.mjs --repo $S/fx/<case> --rev HEAD \
     --frontier rate-tos-signal --since 2026-10-26 [--live] --json
```

- Loopback only for the transport probes (a python TLS server on 127.0.0.1 with a self-signed cert,
  and a plain-http second port); `file://` probes used `/etc/hostname` and `/etc/machine-id`, which are
  non-secret. I did not read secret files and did not probe cloud metadata endpoints.
- External network: three GETs, all on the wave's allowed hosts, recorded in
  `SentinelFetchScope/fetch/meta.json` (URL, UTC start, HTTP status, bytes, sha256).
- Tool installs: **none** (no pacman, no uv/npx). No builds, no linters, no formatters.

## Q1 — what a committed receipt can make `--live` do

### F1 · High (provenance defeat) / Medium (arbitrary local read) — `file://` receipts are admissible, so `--live` needs no network

- Code: `scripts/check-frontier-admission.mjs:174` admits `^(https://|file://)`; `:180` accepts curl
  code `000` for `file://`; `:221` then treats the file's contents as the live bytes. The counter's own
  self-test *codifies* this: `live-file-url-located` expects `exit 0, admitted 1` (:340).
- Evidence (fixture `fx/file-exact`, receipt `url = file:///etc/hostname`, committed bytes = the same
  file, quote = its single word):

```
$ node … --repo $S/fx/file-exact --rev HEAD --frontier rate-tos-signal --since 2026-10-26 --json --live
  "exit": 0, "population": 1, "admitted": 1, "clean": true, "reasons": [ [] ]
$ node … --repo $S/fx/file-mismatch … --json --live      # receipt url=file:///etc/machine-id,
  "exit": 1, "admitted": 0, "reasons": [["l3-live-bytes S116"]]   # committed bytes deliberately differ
$ node clone/scripts/check-frontier-admission.mjs --selftest
  … CASE id=live-file-url-located … admitted=1 reason=- PASS
  FRONTIER_ADMISSION_SELFTEST verdict=clean cases=24 passed=24       exit 0
```

- Exploit path: a claimant commits receipt bytes **and** a receipt whose `url` is a `file://` path
  (to those same bytes, or to any readable file), plus a `SOURCES.md` cell containing that URL
  (`g2` is satisfied by a `file://` string). `l1` and `l3` then compare the committed bytes with a
  local file: they pass trivially when the path is the committed copy. `claims.json` C2 says
  "Measured with `--live`; the offline reading alone does not verify (see selfQuoteJunk)" and its
  `selfQuoteJunk` control is defeated precisely because `l3` can be satisfied locally.
- Impact: the round's live-grounding predicate is satisfiable with zero bytes fetched from the
  cited document — a provenance defect, not merely a hardening gap. Secondary: an arbitrary-file read
  primitive in the counter process (any path the runner can read), plus a 1-bit-per-run oracle
  (`l1-live` = "quote absent", `l3-live-bytes` = "present but unequal"), since `g5` lets the claimant
  choose the quote; the body is never echoed, so the channel is narrow and useless to any seat that
  can already read files — it matters only if the counter's committed JSON is the only observer an
  outside party has.
- Ameliorant: the `file://` string sits in the `SOURCES.md` source cell and the receipt, so the defect
  is visible in the diff. It survives review exactly when the reviewer trusts the counter's verdict
  instead of reading the row's source cell.
- Smallest remediation (proposal only; not applied): one-line tighten at :174 —
  `if (!/^https:\/\//.test(url)) return null;` — and drop the `file://`/`000` arm at :180, converting
  the three `live-*file*` self-tests to `https` fixtures (or keeping them behind an explicit
  `--allow-file-url` used only by `--selftest`). Next-round amendment, since the counter is frozen.

### F2 · Medium — `-L` follows redirects off the origin and downgrades to cleartext; the effective URL is never recorded or checked

- Code: `:175` passes `-L` with no `--proto-redir`, no `--max-redirs`, and `-w "\n%{http_code}"` only —
  the effective URL never reaches the report or a receipt field.
- Evidence (receipt `url = https://127.0.0.1:<TLS>/start`, which 302s to `http://127.0.0.1:<plain>/doc.txt`;
  committed bytes = the final body):

```
$ node … --repo $S/fx/redirect … --json --live        # CURL_CA_BUNDLE=<local CA>
  "exit": 0, "admitted": 1, "clean": true
server hits: {"scheme":"https","path":"/start"}, {"scheme":"http","port":<other>,"path":"/doc.txt"}
$ curl -sS -L -o - -w '\n%{http_code}' https://127.0.0.1:<TLS>/redir-file
  exit 1, stderr: curl: (1) Protocol "file" is disabled (in redirect)      # good: no file:// hop
$ curl … https://127.0.0.1:<TLS>/redir-ftp
  exit 7, stderr: curl: (7) Failed to connect to 127.0.0.1:1               # ftp hop was attempted
$ curl … https://127.0.0.1:<TLS>/redir-cross
  exit 0, body + \n200                                                     # cross-origin hop accepted
```

- Impact: a receipt can name a benign, reviewable URL that redirects to a mirror, a different host or
  a cleartext leg; `l1`/`l3` certify whatever the chain ends at, and nothing in the receipt or the
  counter output shows the chain. `l3`'s "committed bytes equal the real source" is therefore weaker
  than the claim states: it equals *some* final 200 body.
- Smallest remediation: `--proto-redir =https --max-redirs 3`, and a receipt field
  `url_effective` (from `-w %{url_effective}`) that `g2`/`l1` require to match the cited URL's host.

### F3 · Medium — credentials: userinfo in the URL is transmitted; ambient `~/.curlrc`/`~/.netrc` are honoured

- Code: no `-q`/`--disable` (`:175`), so curl reads `$CURL_HOME/.curlrc`; the scheme test does not
  reject `user:pass@` userinfo; `spawnSync` inherits `process.env`.
- Evidence:

```
$ node … --repo $S/fx/userinfo … --json --live        # url = https://seat:notarealsecret@127.0.0.1:<TLS>/body
  "exit": 0, "admitted": 1
server hit: {"scheme":"https","path":"/body","authorization":"Basic c2VhdDpub3RhcmVhbHNlY3JldA=="}
  (c2VhdDpub3RhcmVhbHNlY3JldA== = seat:notarealsecret)
$ node … --repo $S/fx/redirect … --json --live        # HOME=<fakehome with .curlrc: "insecure"
  "exit": 0, "admitted": 1                            # self-signed cert accepted via dotfile
$ curl [counter argv] https://127.0.0.1:<TLS>/doc     # HOME=<fakehome2: .curlrc "netrc", .netrc machine 127.0.0.1 …>
  exit 0; server hit authorization: Basic bmV0cmN1c2VyOm5ldHJjcGFzcw==  (netrcuser:netrcpass)
$ curl [counter argv] … with an empty HOME
  exit 60, stderr: SSL certificate OpenSSL verify result: self-signed certificate
```

- Impact: a receipt can carry a live credential into a committed JSON file (and into curl's request);
  and where the operator's dotfiles say `netrc`/`insecure`, `l1`/`l3` are no longer hermetic — the
  verdict can differ between seats and can ship netrc material to whichever host the receipt names.
  This directly contradicts `:22` ("never reads credentials or session material").
- Smallest remediation: pass `-q` as the first curl argument, add `--no-netrc`, and reject receipts
  whose URL contains `@` (`g2-url`).

### F4 · Medium (bookkeeping truth) — a `file://` receipt must claim `http_status: 200` although no HTTP request happened

- `g3` requires `rc.http_status === 200` (:206) while the live fetch of a `file://` URL yields code
  `000` (:180 accepts it). So the committed receipt records a status that never existed and the
  counter tolerates the strict mismatch. Smallest remediation: folded into F1 (drop `file://`); if the
  scheme is kept, require `http_status: null` and a `scheme` field, and reject the mismatch.

### F5 · Low-to-Medium (reachability-conditional) — no address filtering: loopback/private/link-local https targets are admitted

- Code: the only URL check is the scheme prefix (:174); nothing rejects `127.0.0.1`, `[::1]`,
  RFC1918 or `169.254.0.0/16` literals, or single-label hosts.
- Evidence: F2/C and F3/B both reach `https://127.0.0.1:<port>/…` and are admitted (exit 0). TLS
  verification fails closed by default (the exit-60 probe above), so plain self-signed internal
  services are *not* reachable without a trusted cert — but internal services with a cert the runner
  trusts (internal CA, corporate TLS-inspection root), or any config where `~/.curlrc` says `insecure`
  (proven), are reachable with the runner's network position. I deliberately did not probe cloud
  metadata endpoints.
- Smallest remediation: host allowlist for production receipts (the wave's doc/spec hosts) or an
  explicit reject of private/loopback IP literals and non-dotted hosts.

### F6 · Low — resource bounds are implicit

No `--max-filesize`; each fetch is buffered up to `maxBuffer` 64 MB with `--max-time 60`
(`:175`), and `normalise()`'s HTML path runs lazy `<script>…</script>`/`<style>…</style>` sweeps that
degrade on adversarial bodies. Bound: one fetch, ≤64 MB, ≤60 s, per rule. Not privilege-relevant.

### F7 · Informational — failure opacity is a *feature* here

`r.stderr` is captured and discarded; failures surface only as `l1-live`. Nothing echoes the URL,
headers, or response text, so a live failure leaks nothing — but it also makes a genuine vendor change
indistinguishable from a DNS/TLS failure without re-running curl by hand.

### What held (negative findings, all verified)

- `bytes_path` cannot read outside the repo: `blob()` rejects `..` and absolute paths (`:110`) and the
  underlying `git show` refuses too — `git -C fx show 'HEAD:corpus/../corpus/knowledge/fx-entry.md'`
  → `exit 128, fatal: path … exists on disk, but not in 'HEAD'`. The URL is the only read primitive.
- No shell: `spawnSync("curl", [argv])` — the scheme-prefix test also makes `-`-leading argument
  injection impossible; the test is case-sensitive, so `HTTPS://` is refused (conservative).
- TLS verification is on by default (exit 60 above) and http is refused as an *initial* scheme.
- curl refuses `file://` on a redirect (exit 1) — so a redirect cannot turn an https receipt into a
  local-file read; the local read needs the receipt's own scheme to be `file://`.
- The counter writes nothing and fetches nothing without `--live` (the baseline run at this rev has no
  receipts, so the default C2 reading performs zero network I/O).
- Out of scope but noted for C1's owners: `check-gate-mutants.mjs` performs no network I/O, but it
  `node`-executes catalogue-derived source (`:212-215`, env inherited) — the catalogue is
  code-executing input whose integrity rests on the freeze digest in `claims.json`, not on a guard in
  the counter; the output's `counter_sha256_running` is self-reported, not enforced. CritC1Counter /
  MutC1Counter own the rest of that surface.

## Q2 — are the C2 fetches read-only public documentation, inside PROVINCE.md?

**Yes, with one l3 fragility.** `PROVINCE.md` claims rate/rights discipline and refuses consequential
actions and secret material; a `GET` of a published spec or vendor docs page is observation only.
Evidence (my own three GETs, `SentinelFetchScope/fetch/meta.json`):

```
2026-10-26T06:43:54Z GET https://docs.discord.com/developers/topics/rate-limits
  exit 0, write_out "200 https://docs.discord.com/developers/topics/rate-limits 408912"
  bytes 408912  sha256 99e2b4b688152aff78f337d772670e674d9222a86ddd384e9beda895ac30aa11
  headers: HTTP/2 200, content-type text/html, <title>Rate Limits - Documentation - Discord</title>,
           no set-cookie (grep -c set-cookie = 0), no auth required, direct 200 (no redirect)
2026-10-26T06:43:54Z GET https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-11.txt
  exit 0, "200 … 67097", bytes 67097
  sha256 d6016dd0db5a33ba3f1e6b6f4c84e9b5ecc00986822d5212bab831f6c2d1d412
2026-10-26T06:43:54Z GET https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/
  exit 0, "200 … 114084", bytes 114084, sha256 5c44b1a784a93c11c52211fddd997977080eb58e15df094e0ffeec9fc2704110
```

My IETF sha256 equals the sha256 in the FetchS159 receipt `w1/FetchS159/S116.json` — an independent
refetch of the same bytes (the C2 `g7`/`l3` discipline holds for the static `.txt`). No cookies were
sent or received, no credentials, no session material, no consequential action; every request is a
plain `GET`. Two cautions for the entry that lands:

1. **The vendor page is not byte-stable.** Its response headers are `cf-cache-status: DYNAMIC`,
   `age: 44426`, `x-vercel-cache: HIT`, `x-nextjs-stale-time: 60`,
   `vary: rsc, accept-encoding, Accept, User-Agent`. `l3-live-bytes` requires the live bytes,
   whitespace-normalised, to *equal* the committed bytes: a CDN/UA/AB flip inside the round makes C2
   red for a reason that is not a lane defect. Known limit; if it bites, the fix is a stable artifact
   (a versioned doc or an `llms-full.txt` snapshot) or an explicit same-round re-snapshot rule.
2. The page advertises machine surfaces (`link: … rel="api-catalog"`, `.well-known/api-catalog`,
   `.well-known/mcp-server-card.json`, `/llms.txt`, `/llms-full.txt`, `/llms.txt`). None may be
   followed — they are the API-ish/agent surfaces `PROVINCE.md` keeps out of scope. State this as a
   Limits row in the entry so a later round does not drift there.

## Q3 — does any W1 instruction risk calling the Discord or GitHub API?

**No instruction calls the Discord or GitHub API**, and the wave already refuses the one case where it
would be needed. Evidence: I extracted every URL and every API-ish keyword from all 32 item prompts in
`.ufo/waves/round-30/w1-spec.json`:

```
urls: https://chromium.googlesource.com/devtools/devtools-frontend/+/<commit>/<path>?format=TEXT,
      https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/,
      https://discord.com/developers/docs/topics/rate-limits,
      https://docs.discord.com/developers/topics/rate-limits,
      https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-NN.txt
keyword hits for (api.github|discord.com/api|/api/v\d|Authorization|Bearer|login|POST|PUT|DELETE):
      only "PUT " as the word "output", and "token" in anchor-token / "never tokens/auth"
```

- Zero `api.github.com`, `discord.com/api`, `/api/v10`, `Authorization`, `Bearer` in any instruction.
  `ScribeEntryDiscordHeaders` explicitly says "this lane never calls the Discord API" — consistent with
  `PROVINCE.md`.
- The wave's own gate against that risk already fired: `.ufo/waves/round-30/w1/ScoutPackageTheme.md:26`
  rejects package row S187 because "live re-measure needs an api.github.com call (rate-limited service,
  forbidden in this wave)". Good.
- Gitiles `?format=TEXT` is a public source-browse endpoint (no auth, no token), and the contract names
  it explicitly, so it is not an API call in the credentialed sense.
- **One scope defect (Low):** `FetchS182` instructs `curl -sSL https://discord.com/developers/docs/topics/rate-limits`
  "and record where it lands". `discord.com` (apex) is **not** in this wave's host allowlist
  (`www.ietf.org, www.rfc-editor.org, datatracker.ietf.org, docs.discord.com, docs.github.com,
  chromium.googlesource.com, github raw`), and `-L` there has no landing-host guard. Either add the
  apex host to the allowlist for one docs GET or drop the probe; as written a seat following
  instructions is out of bounds and following the redirect is unpinned. I did not fetch it.
- No W1 instruction risks a GitHub API call: the only GitHub-shaped activity is local `git` in the
  seat's own clone, and the contract's "github raw" entry is unused by every item.

## Known limits / next-round amendments (no repairs made this round)

| id | sev | one-line amendment |
|---|---|---|
| F1 | High | `check-frontier-admission.mjs:174` → `https://` only; drop the `file://`/`000` arm at :180; migrate the three `live-*file*` self-tests |
| F2 | Medium | add `--proto-redir =https --max-redirs 3` and require a receipt `url_effective` (`%{url_effective}`) matching the cited host |
| F3 | Medium | pass `-q --no-netrc`; reject `@` userinfo in `g2-url` |
| F4 | Medium | with F1 fixed, this disappears; else require `http_status: null` for non-http schemes |
| F5 | Low-Med | host allowlist, or reject loopback/private/link-local IP literals |
| F6 | Low | add `--max-filesize 8M` and cap `normalise()` input |
| F7 | Info | keep the quiet failure, but record `%{http_code}/%{url_effective}` in the measure JSON for diagnosis |
| — | Low | either allowlist `discord.com` for the apex docs probe or drop it from `FetchS182` |

Reviewers should read F1 as *intended-but-wrong*: the counter's self-test asserts `file://` admission,
so no implementer slipped — the frozen predicate itself accepts offline receipts.

## Receipts

All under `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-30/w1/SentinelFetchScope/`
(`RECEIPT-SHA256.txt` lists the digests):

| file | what |
|---|---|
| `exp.py` | fixture builder + loopback TLS/plain servers + the six `--repo … --live` runs (A1, A2, B, C, D, E) and the git-traversal probe (G) |
| `experiments.json` | those runs' exit codes, population/admitted, reason ids |
| `server-hits.json` | the loopback server log: the `Basic` authorization line, the `https → http` redirect hop |
| `exp2.py`, `curl-probe.json` | counter-argv curl probes: `file://` direct (000), redirect→file (refused), redirect→ftp (attempted), cross-origin accepted, `.netrc` injection, no-ambient-config TLS failure |
| `fetch/meta.json`, `fetch/*.hdr` | the three allowed external GETs (URL, UTC, status, bytes, sha256) and their response headers |

Commands that produced the readings, with exit codes: `node … --selftest` → 0 (24/24);
`--repo fx/file-exact … --live` → 0 (admitted 1); `--repo fx/file-mismatch … --live` → 1
(`l3-live-bytes`); `--repo fx/userinfo … --live` → 0 (admitted 1); `--repo fx/redirect … --live`
→ 0 (admitted 1); same without `CURL_CA_BUNDLE` → 1 (`l1-live`); same with `.curlrc insecure` → 0;
`git show HEAD:…/../…` → 128; the three `curl … -o file -w '%{http_code}'` GETs → 0/0/0.
