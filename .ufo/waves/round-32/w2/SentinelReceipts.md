# SentinelReceipts — secret/PII sweep of everything round 32 committed

**Verdict.** Across all 517 files wave 1 added in `b234a58920134424e0d104f137311ff54a16d26b`
(335,972 added lines, 0 deleted, 22.3 MB), the hard secret classes **hold**: there is no
operator credential, no `op://` reference, no private key, no real site's cookie or token,
no `Authorization` value beyond the fixture's empty `Basic Og==`, no environment dump, and
no license violation — the 4.2 MB W3C Working Draft copy is inside the W3C Software and
Document License grant because the copy retains the copyright paragraph and license link
(`webdriver-bidi-20261008.html:693`), the two `developer.chrome.com` page copies retain
their CC BY 4.0 notice, and the Chromium source copies retain their BSD headers. What does
**not** hold is evidence hygiene: the `Everything`-mode netlogs committed under
`ExecNoNetwork/` carry **10 distinct Google API keys, 43 occurrences** (25 of them the
Chromium content-autofill key, repeated verbatim in five netlogs; 18 publisher-side key
strings in the two scraped doc pages), plus decrypted Google service responses and the
host's browser `command_line`/kernel/RAM fingerprint — and the wave-1 report's cleanliness
claim covers only "the profile contains only the fixture cookie"
(`.ufo/waves/round-32/w1/ExecNoNetwork.md:97`), so none of that material is disclosed. The
keys are third-party public keys, not secrets of ours (the autofill key is compiled into
`/usr/lib/chromium/chromium` — verified), so this is **Low** severity, but it is credential
material in committed bytes, and no lane gate scans `.ufo/` evidence for it.

Attacked: the wave-1 evidence bytes as a trust boundary — what a committed netlog, strace
trace, driver transcript or scraped page surrenders about the operator, the host, and third
parties, and whether the licensing of copied bytes is sound. Read-only; this seat edited no
lane file.

## Findings

### F1 — Low — Third-party API keys and decrypted Google service bodies committed in the netlogs, undisclosed

| where | lines | count |
|---|---|---|
| `.ufo/waves/round-32/w1/ExecNoNetwork/netlog-default.json` | 904, 956, 1427, 1428, 1873, 1890 | 6 |
| `.ufo/waves/round-32/w1/ExecNoNetwork/netlog-suppress-min.json` | 1088, 1140, 1449, 1450, 1897, 1914, 2065 | 7 |
| `.ufo/waves/round-32/w1/ExecNoNetwork/netlog-resolver-pin.json` | 474, 558, 1163, 1227 | 4 |
| `.ufo/waves/round-32/w1/ExecNoNetwork/netlog-resolver-pin-ipv6off.json` | 475, 559, 1164, 1228 | 4 |
| `.ufo/waves/round-32/w1/ExecNoNetwork/netlog-resolver-pin-noquic.json` | 429, 498, 1088, 1138 | 4 |

Each hit is a plaintext `x-goog-api-key: AIzaSyDw…In_FM` header on Chromium's
`https://content-autofill.googleapis.com/v1/pages/ChRDaHJvbWUv…` request, captured in
`--net-log-capture-mode=Everything`. The key is **not operator-owned**: `strings -a
/usr/lib/chromium/chromium | grep -cF <key>` → `1`, i.e. it is the public key compiled into
the browser. The `:path` token decodes (protobuf) to `Chrome/154.0.8037.97` plus 44 opaque
signature bytes — no URL, account, or identifier recoverable (receipt:
`SentinelReceipts/netlog-decoded.txt`).

The same `Everything` mode also wrote **decrypted service bodies** into the netlogs:

- `netlog-default.json:622` and `netlog-suppress-min.json:652` — Chrome update-check request
  JSON with `"physmemory":30`, `"os":{"version":"7.2.11-arch1-1"}`, CPU-feature flags,
  `"prodchannel":"Arch Linux"`, and per-request `requestid`/`sessionid` GUIDs (no persistent
  `clientid`).
- `netlog-suppress-min.json:1977` — `Autofill API has not been used in project 413772536636
  before or it is disabled …` (Google's own project number; public).

Eighteen further `AIza…` strings sit in the publisher's page JavaScript:
`ScribeSrcChromeDriver/raw/developer.chrome.com_docs_chromedriver_capabilities.html:3771`
and `…_downloads.html:5586` (nine distinct values total across the two pages; the tenth
distinct value is the autofill key above).

Why it is only Low: all ten values are public (browser binary / public page config), not
credentials of the operator, and no authority follows from them. Why it is a finding at
all: the lane's own seat contract says evidence carries "no credentials, cookies, tokens";
the wave-1 cleanliness claim (`ExecNoNetwork.md:97`) is narrower than the bytes; and the
credential gate cannot see it (see F5).

*Smallest append-only fix:* append one dated disclosure paragraph to the round's wave-2
report/lesson — the five netlog files contain the Chromium content-autofill key and
decrypted Google service bodies, the key is the browser's compiled-in public key, no
operator material is present — so the record matches the bytes. Do not rewrite the frozen
scripts or the wave-1 report body.

### F2 — Low — Host fingerprint in the netlog header (`command_line`, `os_type`)

`netlog-{default,suppress-min,resolver-pin,resolver-pin-ipv6off,resolver-pin-noquic,suppress-all}.json:1`
carry `"command_line"` and `"os_type":"Linux: 7.2.11-arch1-1 (x86_64)"`. The command line is
not chromedriver's argument list: it is the host's own launcher flags, inherited from
`~/.config/chromium-flags.conf` (verified: that file holds exactly the first five flags seen,
`--ozone-platform=wayland … --load-extension=~/.local/share/omarchy/default/chromium/extensions/copy-url`).
So the committed bytes disclose the desktop stack (Omarchy/Hyprland, Wayland), a
home-relative extension path, `--password-store=basic`, the exact kernel release, 30 GB RAM
and the CPU feature set — host-identifying material attached to an experiment whose subject
was network egress, and not mentioned in its report.

*Smallest append-only fix:* same disclosure paragraph as F1, naming these two fields; for
future rounds, redact `command_line`/`os_type` and the updater blob when a netlog is
committed (a note, not a rewrite).

### F3 — Low — Host account name in 398 absolute paths

`/home/vgpnk` appears **398 times on 205 lines in 58 files** of the wave-1 commit. Densest:
`.ufo/waves/round-32/w1-dispatch.json:289` (100), `.ufo/waves/round-32/w1-spec.json:5`
(100), `.ufo/waves/round-32/measure.sh:6`. Also pre-existing lane text this commit touched:
`SKILL.md:1928`, `LOG.md:1182`, `corpus/QUALITY.md:38`. Related: `/run/user/1000` in 17
files (uid).

Why it is Low: the lane contract itself mandates absolute lane paths, so this is the
contract's own residue, not a leak of anything consequential; the username is already the
owner of the checkout. It is reported because the sweep asked for host usernames/paths
beyond scratch paths, and this is one.

*Smallest append-only fix:* none required for the internal record; if any of these trees is
ever published, a single mechanical pass replacing `/home/vgpnk` with `$LANE` (and
`/run/user/1000` with `$XDG_RUNTIME_DIR`) is sufficient.

### F4 — Info — Dead chromedriver session ids in transcripts

27 distinct `"sessionId":"<32 hex>"` values (e.g.
`.ufo/waves/round-32/w1/ExecCollectorTiming/runs/out/classic-new-session.json:36`) and 38
distinct `session/<32 hex>` links (e.g.
`.ufo/waves/round-32/w1/CritC1Predicates/live-transcript.jsonl:1`, `ws://127.0.0.1:45709/session/…`).
Every one belongs to a chromedriver process that is gone; the endpoints are loopback and
ephemeral. No authority survives.

*Smallest append-only fix:* none. The lane already records the shape-only rule
(`SKILL.md:563`, `:662`); redacting ids in frozen transcripts would break the t2/t3 bindings
they exist to prove.

### F5 — Info (systemic) — No gate scans `.ufo/` evidence for credential shapes

`scripts/check-sources.mjs:344-351` implements the lane's whole credential scan —
`op://`, `BEGIN…PRIVATE KEY`, `ghp_`, `AKIA`, `xox[baprs]-` — and applies it to the registry
text it is pointed at (`scripts/check-sources.mjs:24`, default `corpus/SOURCES.md`) only;
`check-sources.mjs` is not among the scripts that read `.ufo/` at all. A gate-pattern run over all 517 committed files returns **0
files**, so the gate would have passed this commit even if F1's keys had been operator
secrets. The hole was already on record (`.ufo/waves/round-15/w1/ToolsSafety.md:51`); round
32 is the first round to exercise it with multi-megabyte `Everything`-mode captures.

*Smallest append-only fix:* route to the L1 as a known coverage hole for a future counter
change (extend the credential scan to `.ufo/waves/<round>/` with an `AIza`/`x-goog-api-key`
pattern and an allowlist for the Chromium key). Not a this-round edit: counters are frozen
after `4181fff`.

## Checks that came back clean

| class | result | evidence |
|---|---|---|
| `op://` / 1Password / vault refs | 0 in the wave-1 commit (only older waves' reports mention the word) | `grep -rlF 'op://' <517 files>` → none |
| private keys, `ghp_`, `AKIA`, `xox[baprs]-` | 0 files | `sweep.sh` §1 |
| `op://`-class gate patterns | 0 | same |
| credential-bearing file types (`.env`, `.npmrc`, `.netrc`, `id_rsa`, `*.pem`, `*.key`, `*.p12`, `*.kdbx`) | 0 committed | `sweep.sh` §10 |
| real site cookies | none. Every committed cookie object is `domain 127.0.0.1`, `name tabi_fixture`, `value "1"`; the only `COOKIE_STORED` events in the netlogs are those two; `netlog-*.json:128/106/93` `{"domain":"google.com"}` are cookie-*lookup* events with no name or value | `sweep.sh` §4; pattern search over `"cookies"` arrays (805) |
| real site tokens / `Set-Cookie` from a real host | none; `accounts.google.com` traffic survives only as TLS records (`\x16\x03\x01…`), 14 such blobs, not plaintext | `sweep.sh` §9 |
| `Authorization` material | only `Basic Og==` (= empty user + empty password) from the loopback fixture's challenge, already disclosed at `ExecInterceptPhases.md:82-83`; 2 occurrences in frames | pattern search |
| environment dumps | none. All seven strace files trace only `connect`/`socket`/`sendto`/`sendmsg`; **no `execve`, no `environ`**; netlog has no `"environment"` key; `chromedriver.stderr.txt` is 0 bytes | `sweep.sh` §7 |
| private/internal URLs | none. Hosts are public documentation, Chromium/Gitiles, Google public services, loopback `127.0.0.1`, and synthetic `.local` names; `file://` URLs point only at scratch clone paths | host frequency table; `sweep.sh` §7 |
| unverified external fetch provenances | spec copy sha256 `dc1077db…a1d24d4` (4,235,856 B) matches `ScribeSrcBidiSpec/fetch.json` | `digests.txt` |

**Licensing (as asked).** W3C: `webdriver-bidi-20261008.html` is a byte-identical copy of
`https://www.w3.org/TR/2026/WD-webdriver-bidi-20261008/` (4,235,856 B, sha256
`dc1077db50fe784435fd57f2fa7005607937b5ee4293f6f12d8731bd6a1d24d4`, recorded with URL, UTC,
HTTP 200 and byte count in `fetch.json`). Line 693 carries `Copyright © 2026 World Wide Web
Consortium` with the `rel="license"` link to the W3C Software and Document License, whose
2023 text grants "Permission to copy … without fee or royalty … provided that you include
the following on ALL copies" — so a verbatim copy is inside the grant; only a derivative
re-used *as a technical specification* is prohibited, which this is not. Chrome docs: both
saved pages carry "Except as otherwise noted, the content of this page is licensed under the
Creative Commons Attribution 4.0 License" inline. Chromium: `capabilities.cc` and
`session_commands.cc` retain `// Copyright 2013 The Chromium Authors … BSD-style license`.
No license-restricted bytes are being redistributed outside their terms.

## Method and receipts

Clean clone at `b234a58920134424e0d104f137311ff54a16d26b` in scratch
(`git clone --shared …; git checkout --detach …`; `git status --porcelain` empty), then read
only. One reproducible script, run against that clone:

```
$ sh .ufo/waves/round-32/w2/SentinelReceipts/sweep.sh "$S/clone" > SentinelReceipts/sweep-run.txt 2>&1
EXIT=0
```

Every number in this report is printed by that script (§1–§10) and stored in
`SentinelReceipts/sweep-run.txt`. Supporting artefacts in the same directory:
`digests.txt` (sha256 of the ten files carrying material), `netlog-decoded.txt` (decoded
netlog bodies; key values redacted there, cited by path:line instead), `detect-secrets.json`
(independent scanner output), `fetch-receipts.md` (licence fetches), `sweep.sh`.

Independent corroboration: `detect-secrets 1.5.0` (installed with `uv tool install
detect-secrets` — official PyPI, no pacman transaction; reason: second opinion on shapes I
might have missed) over the same 517 files: 1,232 findings = 864 `Hex High Entropy String` +
367 `Base64 High Entropy String` (screenshot digests, PNG bytes, TLS records) + **1 `AWS
Access Key` at `netlog-suppress-min.json:484`**, which I checked and rejected: line 484 is a
TLS ClientHello blob and contains no AWS prefix (`A3T|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA`
+ 16 uppercase → no match). No finding beyond F1's keys is real.

Other commands and exits: `git diff --name-only 4181fff b234a58` (517 files, exit 0);
`git diff --numstat …` (`files=517 added=335972 deleted=0`, exit 0); `sha256sum` of the ten
material files (exit 0); `strings -a /usr/lib/chromium/chromium | grep -cF <autofill key>` →
`1` (exit 0); `pgrep -fa 'chromedriver|chromium'` (exit 0 — see hygiene).

## Hygiene

- No browser was started by this seat: **no chromedriver/chromium process is mine**. The
  live `chromedriver --port=43843` and the `--user-data-dir=/fast/scratch/hyaku/tabi-r32/CritForgeryRecheck/…`
  chromium tree in `pgrep -fa` belong to that peer seat; untouched.
- Scratch (`/fast/scratch/hyaku/tabi-r32/SentinelReceipts`, incl. the shared clone, the uv
  tool dir and the fetch bodies) deleted after copying receipts into this directory.
- Read-only git only; no commit, no index touch, nothing written outside this report's
  directory.
- Tools: `detect-secrets 1.5.0`, channel `uv tool` (PyPI), reason: independent secret scan.
  Nothing else installed or upgraded.
