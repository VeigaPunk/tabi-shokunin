# R57Sentinel — wave w1 seat report (round 57)

Seat: **R57Sentinel** — SECURITY review (read-only). Wave: round 57 **w1** (the only v1 wave).
Date: 2026-11-03. Lane: `tabi-shokunin`. Lane base rev `ef43ececde883cc0368c6c7cfbabe30ef937b717`.
Host: linux 7.2.11-arch1-1 x64, `/usr/bin/chromium` = Chromium 155.0.8059.84 (Arch launcher
wrapper), node v24.21.0, curl 8.23.0, python3 3.14.

## Files written (absolute paths)

1. `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-57/w1/R57Sentinel.md` — this report.
2. `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-57/sentinel/evidence/probe-log.md` —
   the raw probe output, sections **E1..E16** (every claim below cites an E-number).

No other file was created or modified. `claims.json` was READ ONLY; no predicate, control, kill
rule, expected finding or counter byte was touched. **No mutating git or jj command was run
anywhere** — only `read`, `grep`, `ls`, `git log/show/rev-parse/status/cat-file/diff/ls-tree`
(read-only), `node`, `curl`, `python3` and `ss`/`ps`. Nothing under `corpus/` was written.
The fleet root `/home/vgpnk/Projects/shokunin`, every sibling lane, `/home/vgpnk/Projects/shokuknow`
and the fleet's `templates/`+`scripts/` were read-only or untouched. No campaign tool of
shokuknow was run. No `Report:` path outside my seat's scope was written.

## Tooling

**No tool was installed or upgraded** (none was needed — every check used the host's existing
node 24.21.0, curl 8.23.0, python3 3.14 and Chromium 155.0.8059.84). **No pacman transaction was
run**; pacman is paused host-wide and this seat honours the pause.

## Verdict summary

| # | Item | Verdict | Finding |
|---|---|---|---|
| 1 | r57 runner contract (perimeter, argv, egress) | **PASS with 2 residuals** | R57-S1 (medium), R57-S2 (low) |
| 2 | quarantine fetch posture | **GAP — 1 high, 2 medium, 1 low** | R57-S3 (high), R57-S4 (medium), R57-S5 (medium), R57-S6 (low) |
| 3 | gate v2 path traversal | **PASS** | R57-S7 (low, reporting-only) |
| 4 | RULES.md / wave-context tooling rules | **PASS for the wave context; drift is in RULES.md and already filed** | R57-S8 (informational, operator-owned) |

Nothing here weakens a frozen predicate, control or expected finding, and nothing here is a
claim amendment. R57-S3 is the one finding that must not survive into the data pass unaddressed;
it is a *fetch* guard gap, not a claim gap.

---

## 1. The r57 runner contract

**Delivered artefact audited:**
`/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/chrome-cdp-loopback-round57.mjs`,
1355 lines, sha256 `ba5ba927d03f5d01406860ff8a0ec44164491b91ea6862bc65d141c9ee98f6ad`
— the exact digest the R57Runner report pins, and the digest the receipt's `driverSha256`
carries. The frozen r56 base `scripts/chrome-cdp-loopback-round56.mjs` is byte-unchanged
(sha256 `26da87bb…`).

### 1.1 Loopback-only perimeter — MET, measured

Every element of the contract was confirmed **in the delivered bytes and by a live run** (E7):

| Contract element | Delivered | Evidence |
|---|---|---|
| `--remote-debugging-address=127.0.0.1` | present | `:734`; receipt `host.argv` |
| `--remote-debugging-port=0` + port from the throwaway profile's `DevToolsActivePort` | present | `:733`, `:767` |
| DevTools socket asserted loopback (`/^127\.0\.0\.1:\d+$/`) | present | r56-inherited block |
| fixture server bound to `127.0.0.1` only | present | `listen(0, '127.0.0.1', …)`; live `fixture.origin http://127.0.0.1:44351` |
| throwaway `--user-data-dir` under the scratch, 0700, verified EMPTY, write-probed | present | r56-inherited; live receipt shows `<scratch>/profile-<token>` |
| throwaway `HOME` + `XDG_CONFIG_HOME` under the scratch | present | `:812` `env: { …, HOME: runHome, XDG_CONFIG_HOME: runXdgConfig, TMPDIR: scratchDir }` |
| `--disable-extensions` | present | `:743` |
| keyed PID-group kill, never `pkill -f` | present | `kill(-child.pid,'SIGKILL')` then a `/proc` sweep on `[launchToken, profileDir, runCrashDb]`; `grep pkill` → only the two comments that say "never pkill -f" |
| zero-survivor closure probes | present | `teardown.postKillSweepCount 0`, `survivors []`, plus `portProbes {fixture:'closed', devtools:'closed'}` — **stronger than r56**, which had no port probes |
| argv recorded shape-only | present | `:749` — the live receipt's argv carries **no** `/home/...` and no `~`; it does carry the scratch profile path (expected, shape not secret) |

**Live run, on the delivered bytes (E7):** exit 0, `predicate True`, `failures []`,
`preLaunch 0 / midRun 13 / postKill 0`, both ports closed, `field3Final ''`,
`chordLeg.booleansMatch true`, `shiftTrace.ridesPresent true`,
`legOrder [plain-trace, end, backspace, restore, tab, shift-trace, chord-leg, enter-submit]`.
An independent `/proc` sweep for the run token afterwards: **0 survivors**.
The frozen counter scores that live receipt GREEN
(`predicate true, findingCount 0, findings [], couldNotEvaluate []`) and REFUSES the r56 receipt
(`schema-wrong`, `nonce-shape`, `driver-sha-mismatch`, `shift-trace-missing`, `chord-missing`,
`field3-named`, `keylog-absent`) — the cross-refusal the C2 contract asks for.

### 1.2 New egress — NONE (E13)

A mechanical diff of the delivered runner against the frozen r56 base:

```
https_urls   r56: ['http://127.0.0.1', 'http://127.0.0.1:']   r57: IDENTICAL
fetch(       r56: 2                                          r57: 2
new WebSocket r56: 1                                         r57: 1
net.connect  r56: 0                                          r57: 1   <- the closure probes, host '127.0.0.1'
launch flags r56: (15)                                       r57: IDENTICAL set, no additions
```

The only new network primitive is `net.connect({port, host:'127.0.0.1'})` for the two closure
probes. No new URL, no new flag, no new fetch, no new page-side resource. **The modifier legs
introduce no new egress surface.**

### 1.3 The r2 GCM note — confirmed, and the throwaway HOME DOES contain it

The contract asks whether the browser may still attempt background services and whether the
throwaway HOME contains them. Measured (E8):

* GCM registration **is still attempted** despite `--disable-background-networking`:
  5 log lines, incl. `PHONE_REGISTRATION_ERROR` ×3 and
  `Error code: 401 … Authentication Failed: wrong_secret` /
  `Failed to log in to GCM, resetting connection.` **The r2 note holds for the r57 surface** —
  the flag does not stop GCM.
* Those artefacts land **inside the throwaway tree**:
  `<scratch>/home-<token>/.config/chromium/Crash Reports/settings.dat`, and
  `<scratch>/profile-<token>/Default/GCM Store/{LOG,MANIFEST-000001,CURRENT,000003.log}`.
* The **operator's** `~/.config/chromium` was NOT written by the launch
  (`realProfileTouched: []`).
* The operator's `~/.config/chromium-flags.conf` (212 B, containing
  `--load-extension=~/.local/share/omarchy/default/chromium/extensions/copy-url`) was **not**
  injected: the effective argv shows no `--ozone-platform=wayland` and no `--load-extension=~/…`.
  The one extension target present is
  `chrome-extension://nkeimhogjdpnpccoofpliimaahmaaome/background.html` — a **built-in Chromium
  component extension**, not the operator's Copy-URL extension
  (`baflhghklkoibehmofgdmfdfkgpmngkg`), which is absent.

So the r56 sentinel's RISK 1 / RISK 3 (the operator's flags.conf and the operator's crash
database) are both **closed** by the delivered runner.

### 1.4 Residuals

**R57-S1 — MEDIUM — an external kill of the runner orphans the whole browser group.**
The runner installs **no** `SIGTERM`/`SIGINT` handler
(`grep -n 'SIGTERM\|SIGINT\|process.on('` → no match; the frozen r56 runner has none either).
When my first live run was killed by an external `timeout` (SIGTERM to the node process), the
runner's own teardown never ran and **13 processes survived** (E9): the browser, 2
`chrome_crashpad_handler`s (re-parented outside the process group), 3 zygotes, the GPU process,
2 utility processes and 3 renderers — every one carrying the run's profile path and crash-db
path. I reaped them by PID from the keyed path, never by name.

*Impact:* the zero-survivor guarantee holds on the runner's own exit path (E7: 0 survivors) but
not when the runner is terminated from outside — which is exactly what a watchdog, a CI timeout
or an operator Ctrl-C does. The crashpad handlers are the sharp end: re-parented to
`systemd --user`, outside the process group, they survive the group kill. This is a **process
hygiene** defect, not a claim defect: it cannot make a red claim green, and the frozen counter
still refuses a receipt whose `teardown.survivors` is non-empty.

*Smallest remediation:* install a `SIGTERM`/`SIGINT` handler in the runner that performs the
existing keyed teardown (group kill → sweep → `closeAllConnections()` → port probes) and then
exits non-zero. ~10 lines, no change to any predicate. **Pre-freeze is the right time** (after
the freeze commit the driver digest `ba5ba92…` changes and the frozen counter's
`--expect-driver-sha256` must be re-pinned — the R57Runner report already flags this as risk 1).

**R57-S2 — LOW — the receipt records the REQUESTED argv, not the effective one.**
`:749` sets `receipt.host.argv` from `childArgv` (what the runner asked for), not from the
browser's real `/proc/<pid>/cmdline`. The effective argv contains flags the runner never set
(`--ozone-platform=headless`, `--ozone-override-screen-size=800,600`,
`--use-angle=swiftshader-webgl`, `--noerrdialogs` — all injected by the Arch wrapper/Chromium).
This is the r56 sentinel's RISK 4, restated: the receipt cannot show what actually ran. The
r56 rule that mattered — no `/home/<user>` and no `~` in the receipt — **is** met (the requested
argv contains neither, and with the HOME/XDG redirect the flags.conf injection does not happen).
*Impact:* an argv receipt is evidence of intent, not of execution; a future flags.conf
regression would be invisible in the receipt.
*Smallest remediation:* read the browser's `/proc/<pid>/cmdline` once after launch, record it as
`host.effectiveArgv` with the same `/home/...`→`__USER_HOME__` redaction, and record the
effective CDP target list (which shows any extension target). Optional, not required for C2.

Neither residual touches a frozen predicate, control or expected finding.

---

## 2. The quarantine fetch posture (binding QuarA–D)

### 2.1 The guard set as specified vs as delivered

The contract's guard set: http/https only; refuse (never fetch) a URL whose host resolves to
loopback/private/link-local/metadata space; `--max-time 90`; `--max-filesize 25 MB`; GET only;
no credentials or cookies.

| Guard | Delivered | Where |
|---|---|---|
| http/https only | **MET** | QuarC `guard()`: `if parts.scheme not in ("http","https"): raise Refused`; QuarD `guard()`: same |
| refuse loopback/private/link-local/metadata **before fetch** | **MET (input host)** | QuarC: `ipaddress` classify `is_loopback/is_private/is_link_local/is_reserved/is_multicast/is_unspecified`, with the IPv4-mapped-IPv6 unwrap; QuarD: explicit `BLOCKED` nets incl. `100.64.0.0/10`, `fc00::/7`, `fe80::/10` |
| `--max-time 90` | **MET** | all three seats |
| `--max-filesize 25000000` | **MET but see R57-S4** | all three seats |
| GET only | **MET** | no `-d/--data/--upload-file/-X POST/-X PUT` anywhere; `curl` defaults to GET |
| no credentials/cookies | **MET by environment, not by command** | no `--user/--netrc/--oauth2/-b/--cookie`; **no `-q`**, so `~/.curlrc` WOULD be read — but no `~/.curlrc` and no `~/.netrc` exist on this host |

The resolve-and-classify approach is the right one: a string-prefix guard on the host would miss
`127.1`, `2130706433`, `0x7f000001`, `017700000001` and `0177.0.0.1`, all of which resolve to
`127.0.0.1` (E6). Both R57QuarC and R57QuarD resolve; neither pattern-matches.

### 2.2 R57-S3 — HIGH — the FINAL host after a redirect is never re-checked

**This is the finding the item asked for.**

All three seats' guards run on the **input** URL. `curl -L` then follows the redirect chain and
the bytes come from the **final** host, which no seat re-classifies.

* R57QuarC `quarantine-check.py`: the only call site is
  `rec["resolved"] = guard(url)` — one call, on the input url. The effective URL is RECORDED
  (`rec["urlEffective"]`) but never re-guarded.
* R57QuarD `qd-fetch.py`: `ok, info = guard(url)` before the fetch; `meta["urlEffective"]` is
  recorded but never re-checked.
* R57QuarA `fetch.sh`: contains **no guard call at all** (guard count 0). `guard.json` records a
  per-URL resolution + `allowed` verdict for 17 URLs, but that file is a pre-produced record, not
  an enforcement path — the script that fetches does not consult it.

**Exploit path (measured, E1/E2).** With the EXACT curl shape the R57QuarA item names:

```
$ curl -sL --max-time 90 --max-filesize 25000000 -o a.bin \
       -w '%{http_code} %{size_download} %{content_type}\n' \
       'http://127.0.0.1:39101/r-to-loopback'
200 24 text/plain        exit=0
$ cat a.bin
LANDED-MARKER-127.0.0.1        <- bytes from the REDIRECT TARGET
```

and with the redirect aimed at the cloud-metadata IP:

```
$ curl -sL --max-time 90 --max-filesize 25000000 -o b.bin \
       -w '%{http_code} %{size_download} %{content_type} %{url_effective}\n' \
       'http://127.0.0.1:39101/r-to-metadata'
302 0  http://169.254.169.254/latest/meta-data/
exit=28        <- timeout here, but the REQUEST TO THE METADATA IP WAS ISSUED
```

curl did not refuse the redirect. A host that answers `302 Location: http://169.254.169.254/…`
makes the seat's fetch reach the metadata service, and a host that answers
`302 Location: http://127.0.0.1:…/` makes it read a loopback service. Because the register is an
operator-side artifact whose URLs are attacker-influenceable content (a compromised or hostile
cited host), the redirect target is exactly the part an attacker controls and the part the guard
does not look at.

**Impact:** the fetched bytes that the ladder then searches — and the `absent-confirmed` /
`quote-located` verdict derived from them — can come from a host that the guard refused. This is
a **verdict-integrity** failure for the fabrication class (a row can be declared
`absent-confirmed` — "the row is refused" — on the strength of bytes that did not come from the
cited source), and on a host with a reachable metadata service it is a credential read.

**Measured blast radius today: ZERO.** Of 24 fetches across the three seats, exactly ONE moved
host — `https://www.zapstudio.dev/webmcp/errors` →
`https://www.zapstudio.dev/docs/webmcp/errors` (same host, same operator). Every other fetch had
`num_redirects 0` (E14). No committed verdict is currently affected. The gap is in the GUARD,
not in this round's data.

**Smallest remediation (one line per seat, plus one check):** re-run the SAME `guard()` on the
`urlEffective` value after the fetch and treat a refusal as a refusal. Concretely, for
R57QuarC in `fetch()`:

```python
eff = fields[1] if len(fields) > 1 else url
guard(eff)          # raises Refused on a refused FINAL host
rec.update(..., urlEffective=eff)
```

and in R57QuarA's `fetch.sh`, add the check on the `-w '%{url_effective}'` field before the
bytes are accepted (and move the guard INTO the script so it cannot be bypassed). For R57QuarD,
the same on `meta["urlEffective"]`. Recording `-w '%{url_effective}'` per fetch is already done by
R57QuarC and R57QuarD — **the field is there; the check is missing.** R57QuarA's `fetch.sh`
already writes `%{url_effective}` to stdout but does not persist it into any receipt
(`http-meta.json` carries only `file/httpCode/bytes/contentType/sha256`), so its receipts cannot
even be audited after the fact.

**Additional note on the redirect-protocol question (asked explicitly):** a redirect to a
NON-HTTP scheme is refused **by curl 8.23 itself** — `file://`, `gopher://` and `dict://`
redirect targets all fail with exit 1 and are not fetched (E5). That is an environment property,
not a property of the seats' command; R57QuarC's `--proto '=http,https' --proto-redir
'=http,https'` makes it explicit and is the shape to copy. Note the HTTP→HTTP case is NOT
covered by either: `--proto-redir` restricts the SCHEME, never the HOST.

### 2.3 R57-S4 — MEDIUM — `--max-filesize` does not bound the expanded body, and truncation is reported as success

Two measured facts (E3/E4):

* A **chunked** response with no `Content-Length` is truncated at exactly the cap
  (`exit=63`, `size_download 25000000`, `d.bin` = 25,000,000 bytes) — the cap bites, but the
  receipt would record `http_code 200` and a `size_download` equal to the cap for a body that
  was cut in half. **No seat checks curl's exit code as a pass/fail condition:**
  R57QuarC's `ok=` predicate is `200 <= code < 300 and len(raw) > 0` (a truncated 200 passes),
  R57QuarD records `curl_rc` but never branches on it, and R57QuarA's `fetch.sh` has no exit-code
  handling at all. A half-fetched PDF would then be laddered and could yield a false
  `absent-confirmed`.
* A **gzip-encoded** body is bounded only in its COMPRESSED form: 30,605 bytes on disk
  (`exit=0`, cap not reached) expanding to **31,457,280 bytes** (ratio **1027.8**). With
  `--compressed` curl's cap applies to the DECOMPRESSED stream and does bite (`exit=63`).
  Neither seat records `Content-Encoding` (verified: `grep content-encoding` over all
  `R57Quar*` → no match) and neither seat's ladder decodes gzip (no `gzip`/`zlib`/`decompress`
  anywhere) — so a gzipped response is laddered as raw bytes and **produces a false
  `absent-confirmed`** (the fabrication class) on a source whose text is present.

**Smallest remediation:** record `Content-Encoding` per fetch (add `-D headers.txt` or
`%{content_type}`+`%{size_download}` alongside a header dump), and treat any response whose
`Content-Encoding` is not `identity` as `extraction-unavailable` (the verdict vocabulary already
has that word) unless the ladder decodes it. Independently, a fetch whose `size_download` equals
the cap exactly should be treated as truncated, not clean.

### 2.4 R57-S5 — MEDIUM — R57QuarA's guard is a RECORD, not an ENFORCEMENT, and its output path is RELATIVE

* `R57QuarA/fetch.sh` contains **no guard call** (`grep -c guard fetch.sh` → 0). The guard lives
  only in `guard.json`, a pre-produced file. Nothing in the fetch path consults it, so the
  "refuse before fetch" rule is a human procedure, not a control. R57QuarC and R57QuarD DO
  enforce it in code (`guard()` raises `Refused` before the subprocess is spawned) — the two
  shapes should be unified.
* `fetch.sh` writes `-o "$1.bin"` — a **relative** path, resolved against the shell's CWD.
  Every other seat writes under an explicit output directory. If the script is ever run from the
  lane root, the fetched bytes land inside the repo. (Nothing stray is present today: no `.bin`
  under `.ufo/waves/round-57/quarantine/` and none in the lane root — E15 — so the CWD used was
  scratch. But the script does not enforce that.)
* R57QuarA's receipts do not persist the effective URL (`http-meta.json` has no `urlEffective`
  field), so its fetches cannot be audited for a host change after the fact. R57QuarC and
  R57QuarD both record it.

### 2.5 R57-S6 — LOW — no `curlrc`/netrc disable anywhere

None of the three seats passes `-q` (the `--disable` flag that must be curl's FIRST argument) and
none passes `--netrc-file /dev/null`. On this host there is no `~/.curlrc` and no `~/.netrc`, so
the vector is closed by the environment, not by the command: a `~/.curlrc` containing
`header = "Cookie: SESSION=…"` would silently attach that header to every quarantine fetch,
including the third-party hosts. The lane precedent already has the correct shape
(`scripts/check-decision-table.mjs:195`: `["-q","-sS","--proto","=https","--proto-redir","=https","-L","--max-redirs","5", …]`).
**Smallest remediation:** add `-q` as the first curl argument in all three seats.

### 2.6 Where fetched bytes may be written — CLEAN (E15)

* **No `.bin` file is committed** anywhere under `.ufo/waves/round-57/quarantine/`.
  The only `.bin` under the wave dir is
  `.ufo/waves/round-57/counters/chromium-receipt-r57-fixtures/receipts/notpng.bin`, a deliberate
  counter fixture, not a fetched source.
* R57QuarC writes to `<--out>/docs/<id>.bin`; R57QuarD to `<outdir>/<id>.bin`; both were pointed
  at scratch. R57QuarA's relative `-o` is the exception (R57-S5 above).
* The lane's `git status` shows only the expected untracked paths
  (`.ufo/waves/round-57/`, `scripts/check-cited-receipts-v2.mjs`,
  `scripts/chrome-cdp-loopback-round57.mjs`) — **no fetched source bytes are staged for the
  L1's freeze commit.**
* `corpus/` was not written by any quarantine seat.

---

## 3. The gate v2 — path traversal: PASS

**Delivered artefact:**
`/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-cited-receipts-v2.mjs`
(22778 B, new file). The frozen v1 `scripts/check-cited-receipts.mjs` is untouched.
The gate's own `--selftest` is **6/6 PASS**.

### 3.1 The relative rule refuses `..` outright — CONFIRMED

The code does exactly what the contract says (`isTraversal(token) → token.includes('..')` →
emit `relative-citation-traversal` with `resolved: null` and `continue` — the token is never
resolved), plus a belt-and-braces `resolved.startsWith(roundDir(round))` assertion.

I built a hostile throwaway git repo (never the lane) with decoys OUTSIDE the round dir
(`SECRET-OUTSIDE-ROUND.json` at the repo root, `.ufo/waves/round-56/SECRET-OTHER-ROUND.json` in
another round) and ran the delivered gate against it (E10):

```
id=relative-citation-traversal path=measure/../../../SECRET-OUTSIDE-ROUND.json  resolved=None
id=relative-citation-traversal path=counters/../../../../SECRET-OUTSIDE-ROUND.json resolved=None
id=relative-citation-traversal path=measure/../measure/present.json             resolved=None
```

* **P1 PASS** — every `..`-bearing token is reported as `relative-citation-traversal` with
  `resolved: null` and is NEVER resolved.
* **P2 PASS** — no resolved path lies outside `.ufo/waves/round-<N>/`.
* **P3 PASS** — the OUTSIDE decoy is never resolved by any token.
* **P4 PASS** — the differential vs v1 on the same doc gives identical full-prefix finding
  sets (the widening adds relative findings only; it does not change full-prefix semantics).
* Edge spellings all refused: `measure/../`, `counters/../measure/present.json`,
  `measure/....//present.json`, `measure/a..b/x.json`, `gate-fixtures/../../x.json`,
  `mutant/../sentinel/x.json`.
* The prose negatives hold (`measure the count`, `see controls below`, `in mutant/` never match),
  the cross-round full-prefix token is untouched by the relative rule, and `gate-fixtures/x.json`
  resolves as the `gate-fixtures` component (longest-first ordering is correct).

### 3.2 Git's own backstop on the full-prefix branch (E11)

The full-prefix branch (v1 semantics, unchanged by v2) does **not** itself check for `..` — it
does not need to. `git cat-file -e <rev>:<path>` resolves the path inside the COMMIT's tree and
refuses `..`:

```
git cat-file -e HEAD:.ufo/waves/round-57/../../../etc/passwd
  -> fatal: path '…' does not exist in 'HEAD'
git cat-file -e HEAD:../../../../../../etc/passwd
  -> fatal: '…' is outside repository at '<repo>'
```

Git's error text *does* distinguish "exists on disk" from "does not exist" for a `..` path, so I
checked whether the gate's OUTPUT is a filesystem existence oracle: it is not. Three `..` tokens
pointing at an existing on-disk file, a non-existent file and an in-HEAD file produced **three
identical `full-prefix-citation-missing` findings** — the gate reads committed bytes only and
never the worktree.

### 3.3 R57-S7 — LOW (reporting only) — `measure/..` produces NO finding at all

The token class `[A-Za-z0-9._/-]+` requires at least one path character after the slash, and the
frozen trailing-punctuation strip removes the final `.`, so the token `measure/..` reduces to
`measure/.` — no `..` survives, and the token is dropped before the traversal check. The
spellings `measure/../`, `measure/..;x` and `measure/%2e%2e/x.json` behave the same way (the
first is caught, the latter two are dropped).

**This is NOT an escape.** Every one of those tokens would resolve to a path inside
`.ufo/waves/round-<N>/` at worst, and git refuses every `..` tree path outright (E11), so no
file outside the round dir can be reached. The impact is a **missed REPORT**, not a traversal: a
citation spelled `measure/..` is invisible to the gate — the very "invisible citation" class the
gate exists to close (r56 lesson R56Gate-F1).

*Smallest remediation:* in `extractRelative`, test `isTraversal()` on the RAW match (before the
trailing-punctuation strip) and, additionally, treat a token whose stripped form ends at the
component boundary as a traversal candidate. ~3 lines.

### 3.4 Red-before, measured independently of the gate seat (E12)

```
v2 at 545b251d over corpus/lessons/round-55.md + SCORECARD.md:
  checked 12   relativeChecked 105   otherRoundTokens 234   predicate False
  by id: {relative-citation-missing: 77, full-prefix-citation-missing: 6}
  traversal findings: []
  both historically-invisible relative forms caught:
    .ufo/waves/round-55/measure/d54-1-landing-note-r55.txt
    .ufo/waves/round-55/measure/c1-meter-green-at-correction1.json
v1 on the same two docs at the same rev:
  checked 12   findings 6   distinct 5
```

v2 is **strictly more findings** than v1 (83 vs 6) — the red-before requirement is met.
`traversal findings: []` on real lane content is the expected result (no lane document contains a
`..` token).

---

## 4. The wave's tooling-authorization and pacman-pause statements (E16)

`/home/vgpnk/.omp/agent/RULES.md` (the block the host task tool appends to every seat task):

> - Channel order: `sudo pacman -S --needed --noconfirm <pkg>` → `uv tool install <pkg>` → …
> - Full-system upgrades (`pacman -Syu`) go through tsukuroi-shokunin's update-safety gate first …
> - Never run a partial upgrade (`pacman -Sy <pkg>`). …

It carries **no** pacman pause. The wave context
(`.ufo/waves/round-57/w1-spec.json:5`) says:

> Tooling authorization (operator, 2026-10-19): you may install or upgrade tools that help your item - read /home/vgpnk/.omp/agent/RULES.md first (official channels only; record tool/version/channel/reason in your report). **PACMAN IS PAUSED HOST-WIDE: never run any pacman transaction, never -Sy/-Syu/-U/-R**; if a tool exists only in pacman, name the need in your report instead.

**The wave context is CORRECT and COMPLETE on both points**, and the dispatch carries the same
text (`w1-dispatch.json` contains `PACMAN IS PAUSED` ×1,
`read /home/vgpnk/.omp/agent/RULES.md first` ×1,
`record tool/version/channel/reason` ×1, `never -Sy/-Syu/-U/-R` ×1). Nothing needs fixing in
this wave's context.

**R57-S8 — INFORMATIONAL, operator-owned.** The drift is in **RULES.md itself**: its channel
order still names `sudo pacman -S` FIRST with no pause, so a seat that follows RULES.md alone
would run a paused transaction. This is a KNOWN, already-filed fleet question —
`/home/vgpnk/Projects/shokunin/.ufo/l0-questions.md:111` (tsukuroi | round-27) records exactly
this ("The host task tool appends the whole `~/.omp/agent/RULES.md` block (its channel order
starts with `sudo pacman -S`) … The orchestrator pacman pause (2026-10-20) forbids pacman …
Which text binds seats, and should RULES.md carry the pause, or should wave contexts embed the
RULES.md bytes before validation?"). It is operator-owned, still open, and it is the reason this
wave's context must carry the pause itself — which it does. **No action for the L1**; this seat
records the need in this report rather than in pacman.

---

## 5. Hygiene

* **No process of this seat survives.** The one live run I killed externally left 13 orphans
  (R57-S1); I reaped them **by PID** from the keyed profile path, never by image name. A final
  sweep found a second orphan group (12 processes, token `b1b2296270f6`) from my own
  `egress_probe.mjs` — the probe's group kill had missed it because the probe spawns the
  browser with `detached: true` and the group id differs from the browser pid in that harness;
  I reaped it by PID too. Both probe servers (ports 39101/39102/39103) were stopped.
  **Final `/proc` sweep for every token this seat minted: 0 processes referencing
  `/fast/scratch/hyaku/tabi-r57/R57Sentinel/`.** The completed live runner's own teardown ended
  at **0 survivors** (E7).
* The operator's `~/.config/chromium` was not written by any launch I made
  (`realProfileTouched: []`); the operator's live browser (pid 1162567, ~23 h uptime) was never
  touched, never swept, never killed.
* **Scratch** `/fast/scratch/hyaku/tabi-r57/R57Sentinel/` is deleted at exit; every artefact
  that the report cites is copied into
  `.ufo/waves/round-57/sentinel/evidence/` first. `/tmp` holds nothing from this seat.
* The lane's `git status` shows only the three expected untracked paths; **no fetched source
  bytes and no stray `.bin` are staged for the L1's freeze commit**.
* No tool was installed; no pacman transaction was run.

## 6. Recommended action, in order

1. **R57-S3 (high) — before the L1's data pass.** Re-guard the FINAL host: run the same
   `guard()` on `%{url_effective}` after every fetch, in all three seats; move R57QuarA's guard
   INTO `fetch.sh`; persist `urlEffective` in R57QuarA's receipts. One line per seat plus a
   field. Without this, a fetch can land on a refused host and the `absent-confirmed`
   (fabrication) verdict can be derived from bytes that did not come from the cited source.
   *This is a guard change, not a claim change: it can only turn verdicts into `unreachable`,
   never the reverse.*
2. **R57-S1 (medium) — before the freeze commit.** Add a `SIGTERM`/`SIGINT` handler that runs
   the existing keyed teardown, so an externally-killed runner cannot orphan 13 processes.
   Pre-freeze, because it changes the driver digest and the frozen counter's
   `--expect-driver-sha256` pin.
3. **R57-S5 (medium) — before the data pass.** Make R57QuarA's guard an enforcement path, and
   give `fetch.sh` an absolute output directory argument instead of the relative `-o "$1.bin"`.
4. **R57-S4 (medium) — before the data pass.** Record `Content-Encoding`; treat a non-identity
   encoding as `extraction-unavailable`; treat a `size_download` equal to the cap, or a non-zero
   curl exit code with a 2xx `http_code`, as truncated.
5. **R57-S6 (low) — before the data pass.** Add `-q` as curl's first argument in all three seats.
6. **R57-S7 (low) — optional, before the freeze commit.** Test `isTraversal()` on the raw
   relative match so `measure/..` is reported rather than dropped.
7. **R57-S2 (low) — optional.** Record the browser's effective argv and CDP target list alongside
   the requested argv.
8. **R57-S8 — no action for the L1**; the pacman-pause drift is operator-owned and already filed
   at `.ufo/l0-questions.md:111`.
