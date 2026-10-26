# CritEntryClaims — C2 entry citation audit (round 35, wave w2)

Item: attack the factual sentences of `corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md` that cite S134–S141, S007 or S124; flag uncited factual sentences and load-bearing `unregistered page` citations.

## Verdict: HOLDS (low severity)

Every registry-cited factual sentence in the entry was re-checked against re-fetched bytes: all ten cited pages
(S134–S141, S007, S124) fetched fresh at 2026-10-26T21:40:45Z–21:41:20Z, all HTTP 200, and all digests match the
round's registry/Gate hashes **except** the geckodriver GitHub release page (living page: 200,212 B /
`9664d556…` now vs 200,220 B / `419fc73f…` at registration; its load-bearing substance — release line and the
linux64 tarball + `.asc` in the expanded_assets fragment — survives). Every quoted clause was re-located verbatim at
the claimed line (Flags.html:385/418/474/480/496/498/316-317, Capabilities.html:293/300, capabilities.rs:510-513/522-523,
marionette.rs:767, Prefs.html:296-298/310-311, locateNodes:1506/1596/1637, ftp index:113/140/149 + SHA256SUMS:235,
S007:1475/1520-1521, WD §4.1 and §7.3.3, src/build.rs:38-41). The two load-bearing `unregistered page` citations
(remote/index.html, MDN firefoxOptions, Support.html) were also re-fetched and verify true. Two minor citation-precision
notes (severity low): (1) S007 is cited twice for the identity claim that Firefox's BiDi socket is "the browser's own
remote agent" — S007's bytes contain no "remote agent" string; the identity is grounded in S138/remote index.html, so the
sentence is true but the attribution overreaches S007. (2) The registry row S135's `moz:firefoxOptions` 1 sweep count is
imprecise (the page contains only the literal path `Capabilities/firefoxOptions` inside the MDN link href, not
`moz:firefoxOptions`); this affects only the registry row, not any entry sentence. No unsupported factual sentence was
found; the entry's honest scoping (9222 host fact, egress claim, n=1 wall times, R16) holds.

## Evidence

Commands (all run in scratch `/fast/scratch/hyaku/tabi-r35/CritEntryClaims`; clone at 083c5c6, the w1 integration):

```
$ git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"
$ git -C "$S/clone" checkout -q --detach 083c5c643be7aa5965a5de3458a32ed0d289ead3   # rc=0
$ for u in <13 URLs>; do curl -q -sS --proto =https -o "$S/fetch/$k.html" -w '%{http_code}' "$u"; done
   # rc=0 each; all HTTP 200; sha256sum per file — full log: fetch-log.tsv (copied to seat dir)
$ gpg --batch --import KEY; gpg --batch --verify SHA256SUMS.asc SHA256SUMS
   # import rc=0; verify rc=0 Good signature from "Mozilla Software Releases"; primary 14F26682…D98F0353
$ sed -n '<lines>p' <file>   # quote re-location; see verified-quotes.txt (copied to seat dir)
$ grep -n -E 'data-level="7\.3\.3' w3cwd.html | …   # §7.3.3 enumerates 15 commands, no navigation stop
$ grep -n -i -c 'remote agent' mdnbidi.html            # 0 — S007 has no "remote agent" text
```

Key file:line evidence, verdicts:

| Entry line | Claim | Cited | Verdict | Evidence |
|---|---|---|---|---|
| 5 | `--websocket-port PORT` "Port to use … Defaults to 9222.", Flags.html:496; `--profile-root`, `--port` | S134 | supported | re-fetch digest 2b023afe… = gate; quotes at :496, :480, :474, :418, :385 |
| 5 | "Most of these are documented on MDN."; `webSocketUrl`/`moz:geckodriverVersion` absent | S135 | supported | :293; sweep 0/0; `firefoxOptions` 1 = MDN href only (registry-cell imprecision, not entry) |
| 5 | `webSocketUrl` read at :510-513 sets `use_websocket` at :522-523 | S136 | supported | capsrs re-fetch d3e65953… = gate; :510-523 verbatim |
| 5 | `moz:geckodriverVersion` inserted into New Session capabilities at :767 | S137 | supported | marrs 757e3955… = gate; :767 insert inside NewSession arm; src/build.rs:38-41 yields version() only |
| 5 | "With the end of the CDP support, WebDriver BiDi is the only available protocol, and the preference was removed in Firefox 141." | S138 | supported | prefs 72cd6162… = gate; :296-298 under h3 :292-293 |
| 5 | locator `type`/`value`; `css` takes a selector string | S139 | supported | locate 721e6f0c… = gate; :1596, :1637 |
| 5 | SHA256SUMS line for firefox-158.0.1.tar.xz; Good signature by Mozilla key 14F26682…D98F0353 | S140 | supported | index :113/140/149; SHA256SUMS:235 dce45470…; gpg Good rc=0, primary fingerprint 14F26682…D98F0353 |
| 5 | linux64 asset and its .asc | S141 | supported (page digest drifted) | tag page now 200212 B/9664d556… vs registered 200220/419fc73f…; release line :164/170/175 intact; assets fragment 40876 B/df9c6eae… = registered, tarball :65, .asc :92 |
| 13-14 | geckodriver drives Firefox through Marionette for HTTP WebDriver | unregistered remote/index.html | supported, load-bearing unregistered | 4b009a43…; :322-323 verbatim; page not registered (lesson §Gate decision) |
| 15/311 | "the BiDi socket Firefox exposes is the browser's own remote agent" | S007 | **overreach (minor)** | S007 bytes contain zero "remote agent" strings; S007 supports direct socket exposure (:1520-1521) only; identity grounded in S138/remote index.html |
| 29-30 | "Firefox exposes the BiDi WebSocket directly at: ws://127.0.0.1:PORT/session" | S007 | supported | :1520-1521 verbatim (p + pre) |
| 62-72 | server defaults (127.0.0.1/4444), BiDi default 9222, bind-to-0 trick, profile-root system-temp + RW access | S134 | supported | :418, :474, :496, :498, :480 |
| 74-79 | `--binary` names the Firefox binary; headless args "must include the leading dash" | S134 + unregistered MDN firefoxOptions | supported | :385; mdnffo c36e3c5a… :1596-1597 verbatim |
| 80-83 | Origin header rejected "to protect against malicious websites…" | S134 | supported | :316-317 |
| 86-87 | `webSocketUrl` opt-in from classic `POST /session`; BiDi frames on that socket | S007 + S124 §4.1 | supported | S007 :1475/1520-1521; WD §4.1 "Establishing a Connection" :2215-2257 (opt-in algorithm) |
| 120/307-308 | no navigation stop in draft `browsingContext` command list; only `stopScreencast` | S124 §7.3.3 | supported | §7.3.3 enumerates 15 commands (:4401-6357); no stop-navigation; stopScreencast at :6304 |
| 281 | Support table lists 0.37.1 as requiring Firefox "115 ESR" or newer, no maximum | unregistered Support.html | supported, load-bearing unregistered | 48dfddea…; header min/max :304-308; row 0.37.1 / ≥3.11 / 115 ESR / n/a |
| 9-27, 44-57, 155-273, 277-299 | Chromium mapper, standing evidence, D1-D11, Limits | round-32 entry / transcripts / gate / sentinel artifacts | supported | lane artifacts, not registry sources; citations consistent with those files |

Uncited factual sentences flagged: none found making a fresh world-claim without an internal or registry citation; the only
external-information sentence without a registry citation is the host fact that `127.0.0.1:9222` is the operator's
musketeer lease port, which the entry itself discloses as "a host fact recorded in this round's seat contract, not a
fetched source" (:64-65) — honest, not a defect.

## Report of deliverables

- `.ufo/waves/round-35/w2/CritEntryClaims.md` — this report.
- `.ufo/waves/round-35/w2/CritEntryClaims/fetch-log.tsv` — 13 re-fetch records (key, URL, UTC, HTTP, bytes, sha256; all 200).
- `.ufo/waves/round-35/w2/CritEntryClaims/verified-quotes.txt` — quote re-location digest + gpg outcome.
