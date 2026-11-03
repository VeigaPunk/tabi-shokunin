# R57Sentinel — raw probe log (round 57, wave w1)

Seat: R57Sentinel (security; read-only). Date 2026-11-03. Lane `tabi-shokunin`,
lane base rev `ef43ececde883cc0368c6c7cfbabe30ef937b717`. Host: linux 7.2.11-arch1-1 x64,
`/usr/bin/chromium` = Chromium 155.0.8059.84 (Arch launcher wrapper), node v24.21.0,
curl 8.23.0, python3 3.14.

Every artefact referenced here lives under
`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-57/sentinel/evidence/`
or the seat scratch `/fast/scratch/hyaku/tabi-r57/R57Sentinel/` (deleted at exit).
Nothing under `corpus/` was written; no mutating git/jj command was run anywhere.

---

## E1 — `curl -L` FOLLOWS A REDIRECT ONTO A REFUSED HOST (loopback)

Probe server `probe/redir_server.py` (127.0.0.1:39101) answers
`/r-to-loopback` with `302 Location: http://127.0.0.1:39101/landed`;
`/landed` returns `LANDED-MARKER-127.0.0.1`.

The EXACT curl shape named in the R57QuarA item text:

```
$ curl -sL --max-time 90 --max-filesize 25000000 -o a.bin \
       -w '%{http_code} %{size_download} %{content_type}\n' \
       'http://127.0.0.1:39101/r-to-loopback'
200 24 text/plain
exit=0
$ cat a.bin
LANDED-MARKER-127.0.0.1
```

The bytes came from the redirect TARGET. With `%{url_effective}` added the
final host is visible:

```
$ curl -sL --max-time 90 --max-filesize 25000000 -o a2.bin \
       -w '%{http_code} %{size_download} %{content_type} %{url_effective}\n' \
       'http://127.0.0.1:39101/r-to-loopback'
200 24 text/plain http://127.0.0.1:39101/landed
```

**Consequence:** a guard that resolves and classifies only the URL's OWN host
cannot prevent the fetch from landing on a refused host. The guard is a
pre-flight check on the wrong string.

## E2 — redirect onto the cloud-metadata IP is ATTEMPTED

```
$ curl -sL --max-time 90 --max-filesize 25000000 -o b.bin \
       -w '%{http_code} %{size_download} %{content_type} %{url_effective}\n' \
       'http://127.0.0.1:39101/r-to-metadata'
302 0  http://169.254.169.254/latest/meta-data/
exit=28        (timeout — the metadata IP is unreachable from this host)
```

curl did not refuse the redirect: it issued the request to `169.254.169.254`.
On a host with a reachable metadata service this becomes a credential read.

## E3 — `--max-filesize` does NOT bound a chunked body

`probe/chunked_server.py` (127.0.0.1:39102) answers `/chunk-big` with
`Transfer-Encoding: chunked`, no `Content-Length`, 60 MB of `A`.

```
$ curl -sL --max-time 90 --max-filesize 25000000 -o d.bin \
       -w '%{http_code} %{size_download} %{content_type}\n' \
       'http://127.0.0.1:39102/chunk-big'
200 25000000 text/plain
exit=63        (CURLE_FILESIZE_EXCEEDED)
$ ls -l d.bin
-rw-r--r-- 1 vgpnk vgpnk 25000000 d.bin
```

The cap DOES bite (exit 63, truncated at exactly 25,000,000). It is a
truncation, not a refusal: the receipt would report `http_code 200` and
`size_download 25000000` for a body that was cut in half.

## E4 — gzip decompression bomb: 30 KB on disk → 31 MB expanded

`/gzip-nolen` sends `Content-Encoding: gzip`, chunked, no `Content-Length`
(gzip of 30 MB of `0`):

```
$ curl -sL --max-time 90 --max-filesize 25000000 -o e.bin \
       -w '%{http_code} %{size_download} %{content_type}\n' \
       'http://127.0.0.1:39102/gzip-nolen'
200 30605 application/octet-stream
exit=0
$ python3 -c "import gzip;print(len(gzip.decompress(open('e.bin','rb').read())))"
31457280          # ratio 1027.8
```

With `--compressed` (curl auto-decompresses) the cap applies to the
DECOMPRESSED stream and does bite:

```
$ curl -sL --compressed --max-time 90 --max-filesize 25000000 -o f.bin ...
exit=63
-rw-r--r-- 1 vgpnk vgpnk 24983796 f.bin
```

So a body can be 30 KB on disk and 31 MB in memory, and `--max-filesize`
alone does not bound the expanded form. Neither the seat tooling nor the
ladder decodes gzip (verified: no `gzip`/`zlib`/`decompress` in any
`R57Quar*` file), so a gzipped response would be laddered as raw bytes and
would produce a FALSE `absent-confirmed`.

## E5 — redirect to a NON-HTTP scheme is refused by curl 8.23 itself

```
$ curl -sL --max-time 15 -o /dev/null -w 'code=%{http_code} final=%{url_effective}\n' \
       'http://127.0.0.1:39103/r-to-file'
code=302 final=file:///etc/hostname
rc=1
$ curl -sL --max-time 15 -o /dev/null 'http://127.0.0.1:39103/r-to-gopher'
rc=1        (final=gopher://127.0.0.1:39101/_landed, not fetched)
$ curl -sL --max-time 15 -o /dev/null 'http://127.0.0.1:39103/r-to-dict'
rc=1        (final=dict://127.0.0.1:39101/d:landed, not fetched)
```

curl 8.23 refuses to follow a redirect to `file:`, `gopher:` or `dict:`
under the bare `-L` shape (protocols list excludes them by default for
redirects). This closes the non-HTTP-scheme-after-redirect bypass **on this
host's curl** — it is an environment property, not a property of the
command the seats wrote. `--proto-redir '=http,https'` (R57QuarC's shape)
makes it explicit rather than inherited.

## E6 — alternative IP encodings all resolve to loopback

```
socket.getaddrinfo:
  127.0.0.1          -> ['127.0.0.1']
  127.1              -> ['127.0.0.1']
  2130706433         -> ['127.0.0.1']
  0x7f000001         -> ['127.0.0.1']
  017700000001       -> ['127.0.0.1']
  0177.0.0.1         -> ['127.0.0.1']
  localhost          -> ['127.0.0.1', '::1']
  169.254.169.254    -> ['169.254.169.254']
  0                  -> ['0.0.0.0']
```

A guard that pattern-matches the HOST STRING (`127.`, `localhost`) instead of
resolving and classifying the ADDRESSES misses every integer/hex/octal form.
R57QuarC and R57QuarD both resolve and classify with `ipaddress`; that part
is right. (`:1` `::1` — IPv6 loopback — is in both blocked lists.)

## E7 — the r57 runner's live perimeter, measured

Live run of the DELIVERED runner (digest
`ba5ba927d03f5d01406860ff8a0ec44164491b91ea6862bc65d141c9ee98f6ad`, the digest
the R57Runner report pins):

```
$ node scripts/chrome-cdp-loopback-round57.mjs --scratch <scratch> --out <scratch>/receipt.json
exit 0; predicate True; failures []
sweeps {preLaunch: 0, midRun: 13, postKill: 0}
portProbes {fixture: 'closed', devtools: 'closed'}
```

Receipt facts: `schema tabi-chrome-cdp-r57`, `driverSha256` matches the file,
`field3Final ''`, `chordLeg.booleansMatch true`, `shiftTrace.ridesPresent true`,
`legOrder [plain-trace, end, backspace, restore, tab, shift-trace, chord-leg, enter-submit]`,
`fixture.origin http://127.0.0.1:44351`.

argv recorded in the receipt (shape-only; no `/home/...`, no `~`):

```
/usr/bin/chromium --headless=new --remote-debugging-port=0
--remote-debugging-address=127.0.0.1 --user-data-dir=<scratch>/profile-<token>
--no-first-run --no-default-browser-check --disable-background-networking
--disable-component-update --disable-sync --disable-search-engine-choice-screen
--disable-dev-shm-usage --disable-extensions --window-size=1280,900 about:blank
```

Post-run `/proc` sweep for the run token: **0 survivors**.
The operator's `~/.config/chromium` was **not** written by the launch
(`realProfileTouched: []` in the equivalent controlled probe, E8).

The frozen counter scores the live receipt GREEN:
`node .ufo/waves/round-57/counters/chromium-receipt-r57.mjs <receipt> --driver scripts/chrome-cdp-loopback-round57.mjs --expect-driver-sha256 ba5ba92… --json`
→ `predicate true, findingCount 0, findings [], couldNotEvaluate []`.

The counter REFUSES the r56 receipt (do-nothing / cross-refusal):
`schema-wrong` (tabi-chrome-cdp-r56), `nonce-shape` (tabi-r56-…), 
`driver-sha-mismatch`, `shift-trace-missing`, `chord-missing`,
`field3-named`, `keylog-absent`; `couldNotEvaluate` reports
`modifier-domain-derivation: nonce-unusable`.

## E8 — controlled launch: where the browser's background artefacts land

`probe/egress_probe.mjs` launches Chromium with the contract's exact flag
shape, HOME and XDG_CONFIG_HOME redirected under a throwaway dir.

* Effective argv observed: `/usr/lib/chromium/chromium --headless=new …`
  — NO `--ozone-platform=wayland`, NO `--load-extension=~/…`, i.e. the
  operator's `~/.config/chromium-flags.conf` (212 B, containing
  `--load-extension=~/.local/share/omarchy/default/chromium/extensions/copy-url`)
  was NOT injected. The HOME/XDG redirect closes r56-sentinel RISK 1.
* The operator's Copy-URL extension is NOT loaded. The one extension target
  present is `chrome-extension://nkeimhogjdpnpccoofpliimaahmaaome/background.html`
  — a **built-in Chromium component extension** (also present in
  `Default/Preferences` of the throwaway profile), not the operator's
  `baflhghklkoibehmofgdmfdfkgpmngkg`.
* GCM background egress still happens (the r2 note): 5 lines, incl.
  `PHONE_REGISTRATION_ERROR` ×3 and `Error code: 401 … Authentication Failed:
  wrong_secret`, `Failed to log in to GCM, resetting connection.` — despite
  `--disable-background-networking`. The r2 GCM note is CONFIRMED for the r57
  surface: the flag does not stop GCM registration.
* Those artefacts land INSIDE the throwaway tree:
  `<scratch>/home-<token>/.config/chromium/Crash Reports/settings.dat`, and
  `<scratch>/profile-<token>/Default/GCM Store/{LOG,MANIFEST-000001,CURRENT,000003.log}`.
  The operator's profile was not written (`realProfileTouched: []`).
* `survivorsAfterGroupKill: []`, `survivorsAfterPidSweep: []`.

**Correction (hygiene, recorded at exit).** The probe harness's own FIRST invocation died on a
Node bug (`child.stdout.on` on a `stdio:['ignore','ignore','pipe']` child — stdout was null)
*after* it had already spawned the browser, so that run's browser group (token
`b1b2296270f6`, 12 processes) was orphaned by my harness rather than by the runner under audit.
It was found by the exit sweep and reaped by PID. The second (successful) invocation
(token `95eb4bfc3153`) tore down cleanly. This is a defect in my probe harness, not in the
runner: the runner under audit was verified separately (E7: 0 survivors on its own teardown).

## E9 — an external kill of the runner ORPHANS the whole browser group

The runner installs NO `SIGTERM`/`SIGINT` handler
(`grep -n 'SIGTERM\|SIGINT\|process.on(' scripts/chrome-cdp-loopback-round57.mjs`
→ no match; the same is true of the frozen r56 runner).

When my first live run was killed by an external `timeout 180` (SIGTERM to
the node process), the runner's teardown never ran and **13 processes
survived**: the browser, 2 `chrome_crashpad_handler`s (re-parented outside
the process group), 3 zygotes, the GPU process, 2 utility processes and 3
renderers — every one carrying the run's profile path and crash-db path.
I reaped them by PID (never by name) from the keyed path.

The keyed sweep DOES carry the crash-db path as a needle
(`SWEEP_NEEDLES = [launchToken, profileDir, runCrashDb]`), so a run that
reaches its own teardown closes the crashpad handlers too (E7: 0 survivors).
The gap is only in the **external-kill** path.

## E10 — the gate v2 traversal behaviour, on a hostile fixture

Fixture repo `probe/fixture-repo` (a throwaway git repo, never the lane):
`.ufo/waves/round-57/measure/present.json`, `.ufo/waves/round-57/counters/present.json`,
and DECOYS OUTSIDE the round dir: `SECRET-OUTSIDE-ROUND.json` (repo root) and
`.ufo/waves/round-56/SECRET-OTHER-ROUND.json` (another round).

```
$ node scripts/check-cited-receipts-v2.mjs --repo <fixture> --round 57 \
       --doc <rev>:doc.md --json
exit 1
id=relative-citation-missing   path=measure/missing.json        resolved=.ufo/waves/round-57/measure/missing.json
id=relative-citation-traversal path=measure/../../../SECRET-OUTSIDE-ROUND.json  resolved=None
id=relative-citation-traversal path=counters/../../../../SECRET-OUTSIDE-ROUND.json resolved=None
id=relative-citation-traversal path=measure/../measure/present.json             resolved=None
id=relative-citation-missing   path=counters//etc/passwd       resolved=.ufo/waves/round-57/counters//etc/passwd
id=relative-citation-missing   path=gate-fixtures/x.json       resolved=.ufo/waves/round-57/gate-fixtures/x.json
id=relative-citation-missing   path=gate/x.json                resolved=.ufo/waves/round-57/gate/x.json
```

* Every `..`-bearing token → `relative-citation-traversal`, `resolved: null`,
  NEVER resolved. **P1 PASS.**
* No resolved path lies outside `.ufo/waves/round-57/`. **P2 PASS.**
* The OUTSIDE decoy is never resolved by any token. **P3 PASS.**
* Differential vs v1 on the same doc: identical full-prefix finding sets.
  **P4 PASS** (v1 findings `[]`; v2 full-prefix findings `[]`).

Second hostile doc (`doc2.md`), edge spellings:

```
id=relative-citation-traversal path=measure/../                      resolved=None
id=relative-citation-traversal path=counters/../measure/present.json resolved=None
id=relative-citation-traversal path=measure/....//present.json        resolved=None
id=relative-citation-traversal path=measure/a..b/x.json              resolved=None
id=relative-citation-traversal path=gate-fixtures/../../x.json        resolved=None
id=relative-citation-traversal path=mutant/../sentinel/x.json        resolved=None
SILENT: measure/..            (see the finding below)
SILENT: measure/%2e%2e/x.json (the `%` is not in the token class -> not a citation at all)
SILENT: measure/..;x          (the `;` terminates the token class)
```

`measure/..` is silent because the frozen token class `[A-Za-z0-9._/-]+`
requires at least one path character after the slash, and the trailing-punct
strip removes the final `.`; the token `measure/.` then carries no `..`.
This is a **no-op, not an escape**: git itself refuses every `..` tree path
(`git cat-file -e HEAD:.ufo/waves/round-57/../../../etc/passwd` →
`fatal: path … does not exist in 'HEAD'`; and a path outside the repo →
`fatal: … is outside repository at …`), so no such token can ever resolve to
a file. `measure/..` is the only spelling that gets no finding at all; the
impact is a missed REPORT, not a traversal.

## E11 — git's own backstop on the full-prefix branch

The full-prefix branch (v1 semantics, unchanged by v2) does NOT itself check
for `..`. It does not need to: `git cat-file -e <rev>:<path>` resolves the
path inside the COMMIT's tree and refuses `..`:

```
git cat-file -e HEAD:.ufo/waves/round-57/../../../etc/passwd
  -> fatal: path '…' does not exist in 'HEAD'
git cat-file -e HEAD:.ufo/waves/round-57/measure/../../round-56/SECRET-OTHER-ROUND.json
  -> fatal: path '…' exists on disk, but not in 'HEAD'
git cat-file -e HEAD:../../../../../../etc/passwd
  -> fatal: '…' is outside repository at '<repo>'
```

Note the second message: git DOES distinguish "exists on disk" from
"does not exist" for a `..` path. The gate does not surface that
distinction — every one of those tokens produced the SAME
`full-prefix-citation-missing` finding (probe `doc4.md`: three `..` tokens,
three identical findings) — so the gate's OUTPUT is not a filesystem
existence oracle. The gate reads committed bytes only, never the worktree.

## E12 — gate v2 red-before, independent of the gate seat

```
$ node scripts/check-cited-receipts-v2.mjs --repo <lane> --round 55 \
    --doc 545b251d…:corpus/lessons/round-55.md --doc 545b251d…:SCORECARD.md --json
checked 12   relativeChecked 105   otherRoundTokens 234
by id: {relative-citation-missing: 77, full-prefix-citation-missing: 6}
traversal findings: []
predicate False

$ node scripts/check-cited-receipts.mjs  (v1, same docs, same rev)
checked 12   findings 6   distinct 5
```

v2 is STRICTLY MORE findings than v1 (83 vs 6) and the two historically
invisible relative forms are both caught
(`.ufo/waves/round-55/measure/d54-1-landing-note-r55.txt` and
`…/c1-meter-green-at-correction1.json`). The gate's own `--selftest`:
`selftest cases=6 passed=6 failed=0`.

## E13 — the r57 runner introduces NO new egress surface

Mechanical diff of the delivered runner against the frozen r56 runner:

```
https_urls   r56: ['http://127.0.0.1', 'http://127.0.0.1:']   r57: (identical)
fetch(       r56: 2                                          r57: 2
new WebSocket r56: 1                                         r57: 1
net.connect  r56: 0                                          r57: 1   (the port probes, host '127.0.0.1')
launch flags r56: (15)                                       r57: (identical set, no additions)
```

The only new network primitive is `net.connect({port, host:'127.0.0.1'})`
for the two closure probes. No new URL, no new flag, no new fetch.

## E14 — the fetch guard implementations, as delivered

R57QuarC (`.ufo/waves/round-57/quarantine/R57QuarC/quarantine-check.py`):

```python
def guard(url):
    parts = urlsplit(url)
    if parts.scheme not in ("http", "https"):
        raise Refused(f"scheme {parts.scheme!r} not http(s)")
    ...
    for a in addrs:
        ip = ipaddress.ip_address(a)
        if ip.version == 6 and ip.ipv4_mapped is not None:
            ip = ip.ipv4_mapped
        if (ip.is_loopback or ip.is_private or ip.is_link_local or ip.is_reserved
                or ip.is_multicast or ip.is_unspecified):
            raise Refused(f"host {host} resolves to non-public {a}")
    return addrs

cmd = ["curl", "-sL", "--max-time", "90", "--max-filesize", "25000000",
       "--proto", "=http,https", "--proto-redir", "=http,https",
       "-o", binpath, "-w", "%{http_code} %{size_download} %{content_type}\t%{url_effective}", url]
```

`guard(` call sites: `def guard(url):` and `rec["resolved"] = guard(url)` —
**one** call site, on the INPUT url. The effective URL is RECORDED
(`rec["urlEffective"]`) but never re-guarded.

R57QuarD (`R57QuarD/qd-fetch.py`): `BLOCKED` covers 127/8, 10/8, 172.16/12,
192.168/16, 169.254/16, ::1/128, fc00::/7, fe80::/10, 0.0.0.0/8, 100.64/10 —
broader than the contract's list — and records `urlEffective`; the guard is
again applied to the INPUT url only.

R57QuarA (`R57QuarA/fetch.sh`): the bare contract shape
`curl -sL --max-time 90 --max-filesize 25000000 -A '…' -o "$1.bin" -w '… %{url_effective}\n' "$2"`.
`guard.json` records a per-URL resolution + `allowed` verdict for 17 URLs,
but `fetch.sh` itself contains NO guard call — the refusal is not enforced
by the script that fetches; it is a separate, pre-produced record.
No `-q` (curlrc disable) in either R57QuarA's `fetch.sh` or R57QuarC's
`quarantine-check.py`. (No `~/.curlrc` and no `~/.netrc` exist on this host
today, so the vector is closed by the environment, not by the command.)

Measured redirect facts for the seats' actual URLs (E1/E2 shape): of 24
fetches across the three seats, exactly ONE moved host —
`https://www.zapstudio.dev/webmcp/errors` → `https://www.zapstudio.dev/docs/webmcp/errors`
(same host). Every other fetch had `num_redirects 0`. So no seat's committed
verdict is currently affected by the redirect gap.

## E15 — where fetched bytes went

* `find <lane> -name '*.bin'` finds NO `.bin` under
  `.ufo/waves/round-57/quarantine/` — the fetched bytes were NOT committed.
* R57QuarC's `fetch` writes to `<--out>/docs/<id>.bin` (absolute when
  `--out` is absolute); the seats' `--out` pointed at scratch.
* R57QuarD's writes to `<outdir>/<id>.bin`; R57QuarA's `fetch.sh` uses the
  RELATIVE `-o "$1.bin"`, i.e. the bytes land in the shell's CWD. Nothing
  under the lane root shows a stray `.bin`, so the CWD used was scratch.
* The only `.bin` under the wave dir is
  `.ufo/waves/round-57/counters/chromium-receipt-r57-fixtures/receipts/notpng.bin`,
  a deliberate counter fixture, not a fetched source.

## E16 — RULES.md / wave-context drift (item 4)

`/home/vgpnk/.omp/agent/RULES.md` (the block the host task tool appends to
every seat task) says:

> - Channel order: `sudo pacman -S --needed --noconfirm <pkg>` → `uv tool install <pkg>` → …
> - Full-system upgrades (`pacman -Syu`) go through tsukuroi-shokunin's update-safety gate first …
> - Never run a partial upgrade (`pacman -Sy <pkg>`). …

It carries **no** pacman pause. The wave context (`.ufo/waves/round-57/w1-spec.json`
line 5, `context`) says:

> Tooling authorization (operator, 2026-10-19): you may install or upgrade tools that help your item - read /home/vgpnk/.omp/agent/RULES.md first (official channels only; record tool/version/channel/reason in your report). **PACMAN IS PAUSED HOST-WIDE: never run any pacman transaction, never -Sy/-Syu/-U/-R**; if a tool exists only in pacman, name the need in your report instead.

The wave context is CORRECT and complete on both points (tooling
authorization + recording; and the host-wide pacman pause with its explicit
`-Sy/-Syu/-U/-R` list). The dispatch carries the same text
(`w1-dispatch.json` contains `PACMAN IS PAUSED` ×1,
`read /home/vgpnk/.omp/agent/RULES.md first` ×1,
`record tool/version/channel/reason` ×1,
`never -Sy/-Syu/-U/-R` ×1).

The drift is in RULES.md itself, not in this wave: RULES.md's channel order
still names `sudo pacman -S` FIRST, with no pause, so a seat that follows
RULES.md alone would run a paused transaction. This is a KNOWN, already-filed
fleet question — `/home/vgpnk/Projects/shokunin/.ufo/l0-questions.md:111`
(tsukuroi | round-27) records exactly this ("the host task tool appends the
whole `~/.omp/agent/RULES.md` block (its channel order starts with
`sudo pacman -S`) … The orchestrator pacman pause (2026-10-20) forbids
pacman … Which text binds seats, and should RULES.md carry the pause, or
should wave contexts embed the RULES.md bytes before validation?"). It is
operator-owned and still open; this wave's context does not need fixing.
