# R56Sentinel — security review of the round-56 wave-w1 plan

Seat: R56Sentinel (security; read-only). Round 56, wave w1 (the single v1 wave), lane `tabi-shokunin`.
Review date 2026-11-03. Host: linux 7.2.11-arch1-1 x64, `/usr/bin/chromium` = Chromium 155.0.8059.84 (Arch
launcher wrapper), node v24.21.0, curl 8.23.0.

Scope note. This review covers the **contract text** of the new runner and the source re-opens plus the **existing
precedent**; no code under `scripts/chrome-cdp-loopback-round56.mjs` or the new counter existed at review time.
Every risk below is derived from a probe executed on this host against the same launcher the contract names; the
verbatim raw outputs are in `.ufo/waves/round-56/sentinel/evidence/probe-log.md` (cited below as E1..E19).
Nothing in `.ufo/waves/round-56/claims.json` was read as mutable, and nothing was edited.

---

## 1. The precedent `scripts/chrome-cdp-loopback-round46.mjs` — default profile and bind address

**Verdict: risk** (the precedent is clean on the two questions asked; the *contract* that copies it onto this host's
Linux launcher is not).

**(1a) Does the precedent ever read `/home/vgpnk/.config/chromium` or any default profile? — NO.**
`profileDir` is always `path.join(scratch, launchToken)` (`chrome-cdp-loopback-round46.mjs:170-172`), the browser is
always launched with `--user-data-dir=${profileDir}` (`:199`), and the only file read out of it is
`profileDir/DevToolsActivePort` (`:231`). `grep -n 'HOME|APPDATA|USERPROFILE|XDG|process.env'` over the precedent
returns **no match**; `grep -n '.config/chromium|Cookies'` returns **no match**. The receipt it writes
(`:295`, `:381`) carries `profileDir` and `flags` but no cookie, token or default-profile path. (E13)
So the precedent itself satisfies the "never read the user's default profile" rule **as written for Windows**.

**(1b) Does it bind non-loopback? — NO.** The fixture server binds explicitly:
`server.listen(0, '127.0.0.1', …)` (`:191`); the DevTools endpoint is admitted only after
`/^127\.0\.0\.1:\d+$/.test(wsHost)` (`:251`). Verified on this host for the r56 flag shape: the DevTools socket
appears in `ss -ltn` as `127.0.0.1:<port>` and a connect from the host's LAN address `192.168.0.253` is
**refused** (E8). `--remote-debugging-address 127.0.0.1` is therefore defence in depth, not the sole control.

**(1c) The risk the precedent does NOT cover — the Arch launcher reads the user's `chromium-flags.conf`.**
`/usr/bin/chromium` on this host is a **launcher wrapper** (ELF; its strings contain `chromium-flags.conf`,
`XDG_CONFIG_HOME`, `.config`). It prepends the user's flag file to the effective argv. `/home/vgpnk/.config/chromium-flags.conf`
exists (212 B) and contains `--ozone-platform=wayland`, `--enable-features=TouchpadOverscrollHistoryNavigation`,
`--load-extension=~/.local/share/omarchy/default/chromium/extensions/copy-url`, `--disable-features=Vulkan`.
Measured effective argv of a contract-shaped launch (E1):

```
/usr/lib/chromium/chromium --ozone-platform=wayland --ozone-platform-hint=wayland \
  --enable-features=TouchpadOverscrollHistoryNavigation \
  --load-extension=~/.local/share/omarchy/default/chromium/extensions/copy-url \
  --disable-features=Vulkan --headless=new --remote-debugging-port=0 \
  --remote-debugging-address=127.0.0.1 --user-data-dir=<scratch>/profile-<tok> … about:blank
```

The five flags.conf flags are **prepended**, before the runner's own flags. Consequences:

* The user's own **Copy URL** extension (`manifest.json` permissions `activeTab`, `scripting`, `notifications`;
  `background.js` calls `chrome.scripting.executeScript` + `navigator.clipboard.writeText`) is **loaded and live**
  in the fixture browser: `GET /json/list` returns a `service_worker` target
  `chrome-extension://baflhghklkoibehmofgdmfdfkgpmngkg/background.js`. Control: launching with an explicit
  `--load-extension=<that dir>` yields the **same** extension id, so the attribution is confirmed. With
  `--disable-extensions` (r46's own flag list, `:201`) the service_worker target is **gone**; with `HOME`/`XDG_CONFIG_HOME`
  redirected it is **gone** (E2). The r56 contract's flag list does not include `--disable-extensions` and its
  receipt does not mention it. An extension with `scripting` + `activeTab` running inside the very browser whose
  page-side DOM witnesses constitute C2's evidence is a live confound on the claim's own instrument.
* The effective argv that the r56 receipt is contract-bound to record as `host.argv` therefore contains
  `--load-extension=~/.local/share/omarchy/default/chromium/extensions/copy-url` — a **path into the user's home
  directory**, i.e. a profile-surface disclosure committed to the repo (E1).

**Closing rule (single):** *launch the browser with `HOME` and `XDG_CONFIG_HOME` pointed at a throwaway dir under
`--scratch`, exactly as the lane precedent `scripts/webmcp-loopback-round16.mjs:234-235` already does
(`HOME: homeDir, XDG_CONFIG_HOME: join(homeDir,'.config')`, described at `:1605` as
"isolates Arch chromium-flags.conf"), and add `--disable-extensions` to the r56 flag list.*
Measured effect: the injected flags disappear from the effective argv, the extension is not loaded, and the crashpad
handler's `--database` moves off the user's default profile (E3).

---

## 2. Process kill by pattern — could a sweep kill an unrelated Chromium?

**Verdict: risk** (one risk is closed by the precedent's token rule; a second is NOT closed by it).

**(2a) The token rule that prevents killing the user's own browser — stated and verified.**
The precedent never matches on an image name. The launch token is
`` `${profilePrefix}${crypto.randomBytes(6).toString('hex')}` `` (`:163`) — fresh randomness inside the
**profile directory basename**, and the sweep matches that token as a substring of the whole command line
(`:121`, `CommandLine LIKE '%${token}%'`). Because the token is a fresh random basename that only this launch's
`--user-data-dir` carries, it cannot match the operator's browser. The r46 rule is: **the sweep key is a
per-run random token embedded in the unique profile path, never the image name and never a path prefix.**
This matters concretely on this host: a naive image-name sweep (`pkill -f chromium`) matches **31** processes,
including the operator's live session Chromium `pid 1162567` (no `--user-data-dir`, no `--type=`), its two
crashpad handlers `1162596`/`1162598`, and `earlyoom` `pid 1368` (whose `--prefer` regex merely mentions
`chromium`) — killing those would end the user's own browser session (E6). A fresh-token sweep matches **0**
before launch. r46's pre-launch freshness assertion (count must be 0, else refuse to start) is the guard that
makes the token trustworthy.

The r56 contract's token rule must be the same, and must additionally be resistant to the **cross-lane** collision:
this host was concurrently running sibling-seat browsers under
`/fast/scratch/hyaku/tabi-r56/R56Scout/tabi-r56-dry-a2c6b5e6caf5` and
`/fast/scratch/hyaku/tabi-r56/R56LabProbe/runs/H1-run1/profile` (E7). A sweep key that is an **ancestor directory of
the scratch root** (`tabi-r56`, `hyaku/tabi-r56`) would sweep a sibling seat's browser, not just this run's.

**Closing rule (single):** *the sweep key is the fresh random per-run token embedded in the unique
`--user-data-dir=<scratch>/profile-<token>` path (never an image name, never an ancestor directory of the scratch
root), the pre-launch sweep must count 0 before spawning, and the post-kill sweep must count 0 — with the token
matched as a whole path element, not as a prefix.*

**(2b) The risk the token rule does NOT close: the crashpad handler is outside the keyed group.**
The launch's `chrome_crashpad_handler` does **not** carry the launch token: its command line is
`/usr/lib/chromium/chrome_crashpad_handler --monitor-self … --database=<profile>/Crash Reports` — it names the
**crash database path**, never `--user-data-dir=<token>`. Measured with a per-run unique HOME so the handler is
uniquely attributable (E5):

```
pid=4136518 ppid=1487 token_in_cl=False db=['--database=…/probe17/uh/.config/chromium/Crash Reports']
pid=4136522 ppid=1487 token_in_cl=False db=['--database=…/probe17/uh/.config/chromium/Crash Reports']
```

So a token-keyed sweep reports `postKillSweepCount 0` while a process this launch spawned is still alive and
**re-parented to `systemd --user` (ppid 1487)**, i.e. outside the runner's process group and outside the kill
set. With the default HOME that handler's `--database` is the **user's default profile**
(`/home/vgpnk/.config/chromium/Crash Reports`), and the launch **writes** there: `settings.dat` in the user's
default profile has its mtime changed by a throwaway-profile run (E4, and the A/B control below). Whether the
handler outlives the browser is timing-dependent — in the attributed runs it exited with the browser (E16), but the
contract's "zero survivors" guarantee must not rest on that.

**Closing rule (single):** *the post-kill closure proof must count survivors by **profile-path** identity, not by
token alone — i.e. assert that no live process's command line contains the run's profile path **or** its crash
database path — and the launch must set `HOME`/`XDG_CONFIG_HOME` to the run's own throwaway home so that
crash-database path is unique to this run (then `findProcessesUsing(tmpBase)`-style closure, as
`scripts/webmcp-loopback-round16.mjs:1508,1520` already does, applies unchanged).*

---

## 3. Credential material — would a receipt carry cookies, tokens, or a secret-bearing profile path?

**Verdict: risk** (cookies/tokens: no; profile paths: yes).

**(3a) Cookies and tokens: NO, provided the r56 receipt follows the r46 shape.** The lane rule is
`PROVINCE.md`: *"Refuses: … secrets (→ kagi — session material is shape-only, never content-read)."* The r56
receipt schema is fixed by the runner contract: `schema, nonce, driverSha256, host{chromium,argv,launchToken},
fixture{formSha256,origin}, plainTrace, controlDomain, keylog, serverLog, field3Value, steps`. None of these is a
cookie jar, a `Set-Cookie` value, an `Authorization` header or a token. The `keylog` entries carry
`key/code/keyCode/ctrlKey/altKey/metaKey/shiftKey/targetId` for keys the driver typed itself into its own loopback
fixture — the values typed are the nonce, so `plainTrace`/`keylog` are driver-generated, not user session material.
**The lane already has a precedent for getting this wrong** and it must not be copied:
`scripts/bidi-loopback-round32.mjs:215-216` and `scripts/bidi-firefox-loopback-round35.mjs:319-320` print cookie
values (`${c.name}=${c.value}`); those are fixture-cookie-only, but the r56 receipt has no need for any cookie read
at all, so it must not add one. Note also the r16 lesson on posture inconsistency: `.ufo/waves/round-21/w1/ReviewFreshContext.md:35`
records that r21 embedded a host path in one field while a sibling field stripped the same token — the r56 receipt
must be **uniformly** shape-only.

**(3b) Profile paths that reveal the user's host: YES.** Two leaks are reachable in the receipt as specified:

* `host.argv` — the contract binds the receipt to the **effective child argv**. Under the default HOME that argv
  contains `--load-extension=~/.local/share/omarchy/default/chromium/extensions/copy-url` (E1): a path into the
  operator's home and a disclosure of an installed extension. The r46 precedent records `flags` and `profileDir`
  too, but on Windows the flags file is not injected, so the leak does not exist there — copying r46's receipt
  fields onto the Arch launcher inherits the leak without inheriting r46's Windows assumption.
* `host.launchToken` / the profile path — these point into the scratch dir and are fine.

The mado/kagi rule is satisfied by keeping **shape** (a path, a flag name, a count) and dropping **content** (a
cookie value, a token value, a live default-profile path).

**Closing rule (single):** *the receipt carries host state as **shape only** — the launch token, the profile path
relative to the scratch root, and the argv with any path under the user's home (`/home/vgpnk`, `~/`) replaced by a
fixed placeholder — and the receipt contains no cookie value, no `Set-Cookie`, no `Authorization` header and no
token value from any source (fixture included).* A receipt whose `host.argv` contains `/home/vgpnk` or `~/` is a
finding, not a receipt.

---

## 4. The scribe's `curl` re-opens of the three public spec URLs

**Verdict: risk** (two distinct header/cookie risks in the command as specified).

The R56Scribe item specifies `curl -sL --max-time 120 -o <file> <URL>`. That shape has two reachable problems on a
developer host, both reproduced here:

**(4a) `curl` reads `$HOME/.curlrc` by default, and it can carry a `Cookie:` header to a third-party host.**
With `HOME` pointed at a directory containing a `.curlrc` holding
`header = "Cookie: SESSION=SECRET-TOKEN-123"`, the **server** received (E10):

```
GET /x HTTP/1.1
Host: 127.0.0.1:39012
User-Agent: curl/8.23.0
Accept: */*
Cookie: SESSION=SECRET-TOKEN-123
```

With `-q` as the **first** argument the `Cookie:` header is absent. `-q` is `--disable`: it must be the first
argument to curl to suppress the config file. The lane already has the correct shape in
`scripts/check-decision-table.mjs:195`: `["-q","-sS","--proto","=https","--proto-redir","=https","-L","--max-redirs","5", …]`.
`curl` also honours `~/.netrc` for credentials when a URL carries one — no `~/.netrc` exists on this host today, so
that particular vector is closed by the environment, not by the command.

**(4b) `-L` with no protocol restriction follows a cross-host redirect.** `curl -sL` against a redirector that
answers `302 Location: http://localhost:39002/landed` **followed** it: the effective URL changed host
(127.0.0.1 → localhost) and the request went to the other host (E11). A public spec host that redirects (or is
compromised) therefore silently moves the fetched bytes off the registered origin, and the receipt would record a
`sha256` of bytes from somewhere else. `file://` in a redirect is refused by curl 8.23's defaults
(`Protocol "file" is disabled (in redirect)`), and `--proto '=https' --proto-redir '=https'` refuses an `http://`
target outright (`Protocol "http" is disabled`) — but neither is in the specified command.

The lane precedent closes both: `scripts/check-decision-table.mjs:210-213` re-checks the **effective host**
(`hostOf(res.effective) !== hostOf(url) → false`) after fetching, so a cross-host redirect is a refusal, not a
silent substitution.

**Closing rule (single):** *the re-open command is exactly the lane precedent's shape —
`curl -q` as the first argument, then `-sS --proto '=https' --proto-redir '=https' -L --max-redirs 5 --max-time 120`,
plus `--proto-redir '=https'` so no scheme downgrade and no foreign host — and the recorded receipt must carry the
**effective** URL whose host equals the registered SOURCES.md host, or the re-open is recorded as unresolved
rather than as a hash of whatever came back.*

---

## 5. The fixture server — path traversal and public bind

**Verdict: risk** (one bind risk, one reflection risk; the traversal question is closed for the specified shape).

**(5a) Public bind — real, and the node default is the dangerous one.** `server.listen(port)` with **no host
argument** binds the wildcard: node reports `{"address":"::","family":"IPv6"}` (E9) and `ss -ltn` shows the socket on
`0.0.0.0:*` / `[::]:*` — i.e. reachable from the LAN address `192.168.0.253`, not just loopback. Only
`server.listen(0, '127.0.0.1', …)` yields `{"address":"127.0.0.1","family":"IPv4"}`. The r46 precedent does this
correctly (`chrome-cdp-loopback-round46.mjs:191`), so the risk is that the r56 runner drops the host argument
while keeping the port-0 shape. A wildcard-bound fixture also serves the form to anything on the network and makes
the fixture's `nonce` publicly guessable by a scanner.

**(5b) Path traversal — closed for the contract's specified shape, but only because the shape has no file-serving
route.** The R56Runner contract's fixture serves `GET /form` and `GET /echo?field=…&field2=…` — two **fixed
routes**, no path parameter. Measured against a contract-shaped implementation (E17):
`GET /../../etc/passwd` → **404**, `GET /%2e%2e/%2e%2e/etc/passwd` → **404**, `GET /etc/passwd` → **404**. There is
no filesystem read to traverse, so traversal is not reachable. The risk is a **later** change that adds a
static-file route (as `scripts/webmcp-loopback-round16.mjs:279-345` does, with its hardened
realpath + prefix + no-symlink + is-file checks). If the r56 fixture is ever given a file-serving route, the
hardened resolver from that precedent must come with it.

**(5c) Unescaped reflection in `/echo` — a witness-integrity risk, not a traversal risk.** The contract says the
echo page reflects the field values. A naive implementation returns them unescaped: measured,
`GET /echo?field=<script>alert(1)</script>` → `200 field=<script>alert(1)</script>` (E17). The values are the
driver's own nonce, so this is not attacker-controlled today; but the echo page is the surface C2's Enter leg
witnesses, and unescaped reflection means the *server log* and the *page DOM* can disagree about what was
submitted. HTML-escaping the reflected values keeps the witness honest and costs nothing.

**Closing rule (single):** *the fixture server binds with the host argument explicit —
`server.listen(0, '127.0.0.1', …)` — and the runner asserts `server.address().address === '127.0.0.1'` before
launching the browser (and refuses otherwise); the fixture serves only the two fixed routes with no
path-derived filesystem read (any future file route inherits the r16 hardened resolver); and every reflected
query value is HTML-escaped in the response.*

---

## Summary

| # | Item | Verdict | The single rule that closes it |
|---|---|---|---|
| 1 | precedent r46: default profile / non-loopback | risk | launch with `HOME`+`XDG_CONFIG_HOME` under `--scratch` (r16 `:234-235`) **and** add `--disable-extensions` |
| 2a | sweep could kill the user's browser | risk | sweep key = fresh random per-run token in the unique `--user-data-dir` path; never an image name, never a scratch ancestor |
| 2b | crashpad is outside the keyed group | risk | closure proof counts survivors by profile/crash-db **path** identity, with a run-unique HOME |
| 3 | credential material in the receipt | risk | shape only: argv paths under the user's home replaced by a placeholder; no cookie/token value anywhere |
| 4 | the scribe's `curl` | risk | `curl -q` first, `--proto '=https' --proto-redir '=https' -L --max-redirs 5`, and require effective host == registered host |
| 5 | fixture server | risk | bind explicitly `127.0.0.1` and assert it; fixed routes only; HTML-escape reflected values |

Six risks, each closed by one rule. Three of them (1, 2a, 5a) are **not** newly invented here — they are the
distinction between the Windows precedent and this host's Arch launcher, between a token sweep and an image-name
sweep, and between `listen(0)` and `listen(0,'127.0.0.1')`. Items 2b, 3 and 4 are the findings that the precedent
cannot supply, because the precedent never ran on Linux and never fetched a URL.

Nothing here weakens a frozen predicate, control or expected finding; `claims.json` was read only.

---

## Appendix — as-built status against these rules (added at review close, 15:30)

The runner (`scripts/chrome-cdp-loopback-round56.mjs`, mtime 15:12) and the scribe's artefacts
(`.ufo/waves/round-56/sources/`, `reopen-receipt-round-56.json`, mtime 15:04–15:22) landed **while this review was
running**. This appendix records only whether each closing rule is present in the artefact as it now stands, so the
L1 knows which rules still need action before the freeze. It is a presence check on named constructs, not a code
review.

| Rule | Present in the as-built artefact? | Evidence |
|---|---|---|
| 1 — HOME/XDG redirect + `--disable-extensions` | **NO** | `grep -E 'XDG_CONFIG_HOME\|disable-extensions\|env:\|HOME'` over the runner → no match. The launch flags are `:390-401` and contain **neither** `--disable-extensions` nor a redirected env; the spawn at `:403-406` passes no `env:` option, so the child inherits `HOME=/home/vgpnk` and the launcher reads the user's `chromium-flags.conf`. The user's Copy URL extension is therefore live in the fixture browser (E2) and `receipt.host.argv` records the **caller's** argv (`:402`), not the effective argv — so the injected `--load-extension=~/...` does not even appear in the receipt, which means the receipt **understates** what ran. |
| 2a — sweep key = fresh token in a unique profile path | **YES** | `:262` `launchToken = crypto.randomBytes(6).toString('hex')`; `:263` `profileDir = <scratch>/profile-<token>`; `:279-291` the sweep matches the **token** against `/proc/<pid>/cmdline`, never an image name; `:305-309` the pre-launch count must be 0 or the run refuses. This is the r46 token rule, correctly ported. |
| 2b — closure counted by profile/crash-db path identity | **NO** | `:294-303` `sweepToZero` counts only `sweepOnce(launchToken)`; the crashpad handler carries no launch token (E5) and is therefore invisible to it. `receipt.teardown.postKillSweepCount === 0` can be true with a launch-spawned crashpad still alive (E16) — and with the inherited `HOME`, that handler's `--database` is the **user's default profile** (E4/E5). |
| 3 — receipt carries host state as shape only | **PARTIAL** | `host.argv` is set from `childArgv` (`:402`), i.e. the **requested** argv, not the effective argv read back from `/proc/<pid>/cmdline`. No cookie/Set-Cookie/Authorization/token value appears anywhere in the receipt schema — that half holds. But because the effective argv is never read back, the receipt cannot show the flags.conf injection, and a receipt whose `host.argv` shows no `--load-extension` is not evidence that none ran. |
| 4 — the scribe's curl shape | **NO** | `.ufo/waves/round-56/scribe/source-gate.md:4` states the fetches were `curl -sL --max-time 120 -o <file> <URL>` — no `-q`, no `--proto '=https'`, no `--proto-redir '=https'`, no effective-URL record. `reopen-receipt-round-56.json` records `id, url, fetched_at, bytes, sha256` and **no** `http_code` and **no** effective URL (`grep -c "http_code\|effective"` → 0). The three fetched files are internally consistent with the receipt (`sha256sum` of each staged file equals the receipt's `sha256`), and the three hosts are the registered ones — so the **bytes** are sound; what is missing is the proof that they came from the registered origin, which is exactly what `-q` + `--proto-redir '=https'` + an effective-host check would give. |
| 5 — fixture bind + fixed routes + escaped reflection | **PARTIAL** | The bind is correct: `:355` `fixtureServer.listen(0, '127.0.0.1', resolve)` (RULE 5a satisfied). The routes are fixed (`/form`, `/echo`, else 404 at `:352`) so there is no traversal surface (RULE 5b satisfied). The reflection is **not** escaped: `:350` interpolates `${field}`/`${field2}` raw into the echoed page — the C2 witness page. |

**Net:** of the six rules, **one is fully met** (2a), **two are partially met** (3, 5), and **three are not met**
(1, 2b, 4). Rules 1, 2b and 4 are the ones that change what the claim's instrument is and where its bytes come
from; the L1 should decide whether they are folded into the freeze commit or recorded as declared residuals before
the data pass. None of them touches a frozen predicate, control or expected finding, so folding them in is not a
claim amendment.

