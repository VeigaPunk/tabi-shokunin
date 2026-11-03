# R56Sentinel — wave w1 seat report (round 56)

Seat: R56Sentinel — SECURITY review of the round-56 wave-w1 plan (read-only).
Date: 2026-11-03. Lane: `tabi-shokunin`. Lane base rev `faee4cb27982388b18e9a45f292cdfb9dfd1ebc8`.

## Files written (absolute paths)

1. `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-56/sentinel/review.md` — the review (5 numbered items + summary table).
2. `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-56/sentinel/evidence/probe-log.md` — verbatim raw probe outputs E1..E19.
3. `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-56/w1/R56Sentinel.md` — this report.

No other file was created or modified. `claims.json` was read only; no predicate, control, kill rule or expected
finding was touched. No mutating git/jj command was run anywhere (only `grep`, `sed -n`, `cat`, `read`, `ls`).
No sibling `*-shokunin` repo was written. `/home/vgpnk/Projects/shokunin` (fleet root) was not written.

## Commands run and exit codes

| command (abbreviated) | exit |
|---|---|
| `read` claims.json, RULES.md, round46/r16/r55 scripts, w1-spec.json | n/a |
| `grep` over `scripts/`, `.ufo/waves/round-{54,55,56}/`, `corpus/SOURCES.md` | 0 |
| `/usr/bin/chromium --version` | 0 (`Chromium 155.0.8059.84 Arch Linux`) |
| `curl --version` | 0 (8.23.0) |
| `man curl` (netrc/proto-redir/-q) | 0 |
| `python3` probe harness (22 probe dirs, `$HYAKU_SCRATCH/tabi-r56/R56Sentinel/`) | 0 each |
| `node /tmp/listen_probe*.mjs` (node default vs explicit bind) | 0 |
| `ss -ltn` / `ss -ltnp` bind checks | 0 |
| `ls -d ~/.config/chromium ~/.config/chromium-flags.conf ~/.netrc ~/.curlrc` | 2 (`.netrc`/`.curlrc` absent) |
| `/home/vgpnk/Projects/shokunin/scripts/hyaku/disk-guard.sh status` | 0 (411G free on /fast) |

## Counts

- 5 numbered review items, **6 risks** (item 2 carries two), 1 item part ok (1a/1b precedent itself), 5 closing rules.
- 19 evidence sections, 22 probe directories, 0 tools installed (none needed).
- 6 Chromium launches for argv/bind probes; 2 explicit `--load-extension` attribution launches; 1 curlrc capture;
  1 redirector capture; 1 node bind probe.

## Verdict

The **precedent** (`scripts/chrome-cdp-loopback-round46.mjs`) is clean on the two questions asked: it never reads
`/home/vgpnk/.config/chromium` or any default profile (profile dir is always `<scratch>/<launchToken>`), and it binds
loopback-only. But the **contract** that ports it onto this host's Arch Chromium launcher is not clean, because
`/usr/bin/chromium` here is a wrapper that reads the user's `~/.config/chromium-flags.conf`. Six risks, each closed by
one rule; see `review.md`.

## Risks VERBATIM (each with its closing rule)

**RISK 1 — the Arch launcher injects the user's flags.conf, so the user's own extension is LIVE inside the C2 fixture
browser and the effective argv leaks a home path.** `/usr/bin/chromium` is a launcher wrapper that prepends
`/home/vgpnk/.config/chromium-flags.conf` (which exists, 212 B: `--ozone-platform=wayland`,
`--ozone-platform-hint=wayland`, `--enable-features=TouchpadOverscrollHistoryNavigation`,
`--load-extension=~/.local/share/omarchy/default/chromium/extensions/copy-url`, `--disable-features=Vulkan`) to the
effective argv. The user's Copy URL extension (permissions `activeTab`, `scripting`, `notifications`;
`background.js` calls `chrome.scripting.executeScript` + `navigator.clipboard.writeText`) is loaded and running:
`GET /json/list` returns service_worker `chrome-extension://baflhghklkoibehmofgdmfdfkgpmngkg/background.js`. The r56
receipt's `host.argv` therefore contains `--load-extension=~/.local/share/omarchy/default/chromium/extensions/copy-url`.
→ **Closing rule:** launch the browser with `HOME` and `XDG_CONFIG_HOME` pointed at a throwaway dir under `--scratch`,
exactly as `scripts/webmcp-loopback-round16.mjs:234-235` already does, and add `--disable-extensions` to the r56 flag
list.

**RISK 2 — a sweep could kill an unrelated Chromium (the operator's own live browser).** On this host a naive
image-name sweep (`pkill -f chromium`) matches **31** processes including the operator's live session Chromium
`pid 1162567` (no `--user-data-dir`, no `--type=`), its crashpad handlers `1162596`/`1162598`, and `earlyoom`
`pid 1368` (matched only because its `--prefer` regex mentions `chromium`). Sibling seats' browsers were also live
under `/fast/scratch/hyaku/tabi-r56/R56Scout/...` and `/fast/scratch/hyaku/tabi-r56/R56LabProbe/...`, so a sweep key
that is an ancestor of the scratch root would sweep another seat's browser.
→ **Closing rule:** the sweep key is the fresh random per-run token embedded in the unique
`--user-data-dir=<scratch>/profile-<token>` path (never an image name, never an ancestor directory of the scratch
root); the pre-launch sweep must count 0 before spawning and the post-kill sweep must count 0, with the token
matched as a whole path element.

**RISK 3 — the crashpad handler is outside the token-keyed group, so "zero survivors" is not proven by it.** The
launch's `chrome_crashpad_handler` does not carry the launch token: measured
`pid=4136518 ppid=1487 token_in_cl=False db=['--database=…/uh/.config/chromium/Crash Reports']`. It is re-parented to
`systemd --user`, outside the runner's process group; with the default HOME its `--database` is the user's default
profile and the launch **writes** there (`/home/vgpnk/.config/chromium/Crash Reports/settings.dat` mtime changed; A/B
control: HOME-redirected → no change). A token-keyed sweep reports `postKillSweepCount 0` while that process lives.
→ **Closing rule:** the post-kill closure proof must count survivors by **profile-path** identity, not by token alone
— assert no live process's command line contains the run's profile path **or** its crash database path — and the
launch must set `HOME`/`XDG_CONFIG_HOME` to the run's own throwaway home so that crash-database path is unique to
this run (then `findProcessesUsing(tmpBase)`-style closure, as `scripts/webmcp-loopback-round16.mjs:1508,1520` does,
applies unchanged).

**RISK 4 — the receipt would carry a host path into the user's home (mado/kagi shape-only).** `host.argv` is
contract-bound to the effective child argv, which under the default HOME contains
`--load-extension=~/.local/share/omarchy/default/chromium/extensions/copy-url`. Cookies/tokens themselves are **not**
at risk (the r56 receipt schema has no cookie jar, no `Set-Cookie`, no `Authorization`; the `keylog`/`plainTrace`
values are the driver-generated nonce) — but the lane precedent that prints cookie values
(`scripts/bidi-loopback-round32.mjs:215-216`, `scripts/bidi-firefox-loopback-round35.mjs:319-320`) must not be copied.
→ **Closing rule:** the receipt carries host state as **shape only** — launch token, profile path relative to the
scratch root, and argv with any path under the user's home (`/home/vgpnk`, `~/`) replaced by a fixed placeholder — and
contains no cookie value, `Set-Cookie`, `Authorization` header or token value from any source. A receipt whose
`host.argv` contains `/home/vgpnk` or `~/` is a finding, not a receipt.

**RISK 5 — the scribe's `curl` can carry a cookie to a third-party host and can silently follow a cross-host
redirect.** With `HOME` pointing at a dir containing `.curlrc` (`header = "Cookie: SESSION=SECRET-TOKEN-123"`), the
server received `Cookie: SESSION=SECRET-TOKEN-123`; with `-q` as the first argument the header is absent. `curl -sL`
against a `302 Location: http://localhost:39002/landed` **followed** the redirect (host changed 127.0.0.1 → localhost),
so the fetched bytes (and the recorded sha256) can come from a host other than the registered SOURCES.md host.
→ **Closing rule:** the re-open command is exactly the lane precedent's shape — `curl -q` as the first argument, then
`-sS --proto '=https' --proto-redir '=https' -L --max-redirs 5 --max-time 120` — and the recorded receipt must carry
the **effective** URL whose host equals the registered SOURCES.md host, or the re-open is recorded as unresolved rather
than as a hash of whatever came back (`scripts/check-decision-table.mjs:194-196,210-213`).

**RISK 6 — the fixture server: node's default bind is the wildcard, and `/echo` reflects unescaped.** `server.listen(port)`
with no host argument binds `{"address":"::","family":"IPv6"}` (reachable from the LAN address `192.168.0.253`);
`server.listen(0,'127.0.0.1')` gives `{"address":"127.0.0.1","family":"IPv4"}`. Path traversal is **not** reachable for
the contract's fixed-route shape (`/../../etc/passwd`, `/%2e%2e/%2e%2e/etc/passwd`, `/etc/passwd` → 404), but
`GET /echo?field=<script>alert(1)</script>` → `200 field=<script>alert(1)</script>` — unescaped reflection on the very
page C2's Enter leg witnesses.
→ **Closing rule:** bind explicitly `server.listen(0, '127.0.0.1', …)` and assert `server.address().address ===
'127.0.0.1'` before launching the browser (refuse otherwise); the fixture serves only the two fixed routes with no
path-derived filesystem read (any future file route inherits the r16 hardened resolver,
`scripts/webmcp-loopback-round16.mjs:279-345`); and every reflected query value is HTML-escaped.

## As-built status at review close (15:30) — appendix

The runner (`scripts/chrome-cdp-loopback-round56.mjs`, mtime 15:12) and the scribe's artefacts (15:04–15:22) landed
**while this review was running**. Presence check on named constructs only (not a code review), recorded in
`sentinel/review.md` § "As-built status":

- **Rule 1 (HOME/XDG + `--disable-extensions`): NOT MET.** `grep -E 'XDG_CONFIG_HOME|disable-extensions|env:|HOME'`
  over the runner → no match; the spawn at `:403-406` passes no `env:` option, so the child inherits `HOME=/home/vgpnk`
  and the launcher reads the user's `chromium-flags.conf` — the user's Copy URL extension is live in the fixture
  browser (E2). `receipt.host.argv = childArgv` (`:402`) records the **requested** argv, not the effective one.
- **Rule 2a (token sweep key): MET.** `:262-263`, `:279-291`, `:305-309` — fresh 12-hex token in a unique
  `<scratch>/profile-<token>` path, swept against `/proc/<pid>/cmdline`, pre-launch count must be 0.
- **Rule 2b (closure by profile/crash-db path): NOT MET.** `:294-303` counts only the token; the crashpad handler
  carries no launch token (E5) and, with the inherited HOME, its `--database` is the user's default profile (E4).
- **Rule 3 (shape-only receipt): PARTIAL.** No cookie/Set-Cookie/Authorization/token value anywhere in the receipt
  schema — that half holds; but `host.argv` is the requested argv, so the receipt cannot show the flags.conf
  injection that did occur.
- **Rule 4 (scribe curl shape): NOT MET.** `scribe/source-gate.md:4` — `curl -sL --max-time 120 -o <file> <URL>`;
  `reopen-receipt-round-56.json` records no `http_code` and no effective URL (`grep -c` → 0). The three staged files
  **are** internally consistent with the receipt (`sha256sum` of each equals the receipt's `sha256`) and come from the
  registered hosts — the bytes are sound; what is missing is the proof they came from the registered origin.
- **Rule 5 (fixture bind/routes/escaping): PARTIAL.** Bind correct (`:355` `listen(0, '127.0.0.1', …)`), routes fixed
  (`/form`, `/echo`, else 404) so no traversal surface — but `:350` interpolates `${field}`/`${field2}` raw into the
  C2 witness page.

Net: **one rule fully met (2a), two partial (3, 5), three not met (1, 2b, 4).** None touches a frozen predicate,
control or expected finding.

## Hygiene

No Chromium process launched by this seat survives: the token-keyed sweep after each kill returned 0, and the
crashpad handlers this seat spawned were reaped (verified `alive=[]` at t+3s in the attributed run). Scratch
`$HYAKU_SCRATCH/tabi-r56/R56Sentinel/` is removed on exit; `/tmp` holds no artefact from this seat
(`listen_probe*.mjs`, `curlrc_probe`, `cr2` all deleted). Free space seen on `/fast`: 411 G available (49% used).
No tool was installed or upgraded (none needed).
