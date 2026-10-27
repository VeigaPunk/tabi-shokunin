# ConnSourcePattern — S145 `/proc/net/tcp` scoping and frozen C1 citation

Seat: ConnSourcePattern (connector, leaf). Round 40, tabi lane. Read-only on production tree; no SOURCES/knowledge edits; no commits; no git mutation; no tool installed (`toolInstalls: []` unchanged; curl already present).

Question: (a) is S145's `/proc/net/tcp` field correctly scoped to remote address/port, and (b) does the frozen C1 source citation support only that claim?

## 1. Frozen citation under test

`.ufo/waves/round-40/claims.json` C1 `source`:
> "S145 (proc_pid_net(5), reopened 2026-10-27; DESCRIPTION /proc/net/tcp), cited by the round-40 receipt and lesson Gate."

Frozen digests re-checked (`sha256sum`), all match `claims.json` `frozenDigests`:
```
1f8a15f00a85c7a88214a768dbf89e4bc54a01893cd9158ecb0ac6396994545b  scripts/playwright-firefox-egress-round39.mjs
a0e564c7d18bf75d709a6105119a7849a6f78d3364b24f12a3d26981d4ca0735  scripts/measure-c1-round40.mjs
5a0b702d90c37628ff03168112ab585c8a60e6981cc22f6fcbb6a52313995d82  scripts/selftest-measure-c1-round40.mjs
0b452eac242803532d81cc2c01025b08ce3b704c74129f8912e7ad2002ef253c  .ufo/waves/round-40/counters/c1-sample-span-v3.mjs
```

## 2. Source reopened

Fresh fetch (one HTTP GET, read-only, to a scratch dir that has since been removed):
```
curl -sS -L --max-time 60 -o <scratch>/proc_pid_net.fresh.html -w 'HTTP %{http_code} bytes %{size_download}' https://man7.org/linux/man-pages/man5/proc_pid_net.5.html
HTTP 200 bytes 17119
5e1700fff5cbaf4a1875387f6052cc0b2f35694fc25bc051c23b8f4de55f726f  <scratch>/proc_pid_net.fresh.html
5e1700fff5cbaf4a1875387f6052cc0b2f35694fc25bc051c23b8f4de55f726f  .ufo/waves/round-40/sources/proc_pid_net.html
```
Fresh bytes are identical to the retained copy (sha256 `5e1700ff…f726f`, 17,119 bytes), which matches `S145-open.txt`. Man-pages version stated in page footer: 6.19, 2026-02-08.

## 3. Verbatim quote check (tag-stripped, whitespace-normalised text)

| candidate string | hits | words |
|---|---|---|
| `"rem_address" is the remote address and port number pair (if connected)` (SOURCES row form) | **2** | 11 |
| `The "rem_address" is the remote address and port number pair (if connected).` | 2 | 12 |
| `the ‘rem_address’ is the remote address and port number pair (if connected)` (form in `sources/S145-open.txt` line 4) | **0** | 12 |
| `the 'rem_address' is the remote address and port number pair (if connected)` | 0 | 12 |

The two hits of the SOURCES form are the `/proc/net/tcp` paragraph and the `/proc/net/udp` paragraph (same sentence in both). The `/proc/net/tcp` occurrence is the one the citation anchors to (retained-view lines 157-163; tcp block starts at source line 157). So the **SOURCES row quote is verbatim and correctly located**; the **retained `S145-open.txt` quote string is not verbatim** (lowercase "the", curly single quotes, not the page's `"rem_address"` double-quote form). Recorded as a finding (F1 below); not edited, per scope.

Source text of the anchored paragraph (verbatim, `/proc/net/tcp`):
> "The "rem_address" is the remote address and port number pair (if connected)."

## 4. What S145 actually supports for `/proc/net/tcp`

Verbatim, the only tcp-specific semantic in the cited paragraph: `rem_address` is the remote address and port pair, "(if connected)". Also present: `local_address` is the local pair; `St` is internal status; `tx_queue`/`rx_queue` are queues. The page gives **no** column layout for the tcp block; the only column example is the udp block.

Scoping verdict for the field itself: **correct and as narrow as the driver uses it** — the driver reads the remote column as the peer (`scripts/playwright-firefox-egress-round39.mjs` `parseProcNet`: `rem: f[2]`) and skips the all-zero remote (`row.rem === '00000000:0000'`), which the "(if connected)" qualifier supports (unconnected/listening rows have no remote endpoint).

## 5. What the driver/counter reads that S145 does NOT support

Checked against the full fetched text (`grep` on `tcp6`, `hex`, `byte order`, `endian`, `little`, `inode`, `listen`, `connected`, `namespace`):

| driver/counter reading | in S145? | evidence |
|---|---|---|
| remote column = field index 2 (`f[2]`) | Partly: meaning yes, index not stated for tcp | tcp block has no format; udp example only |
| socket inode = field index 9 (`f[9]`), matched to `/proc/<pid>/fd` `socket:[N]` | **No** | page's only `Inode` mention is for `/proc/net/unix` (line ~216); tcp block lists sl/local/rem/St/queues/tr/tm->when/rexmits/uid — no inode |
| LISTEN filter `st === '0A'` | **No** | page gives no state codes; "St is the internal status" only |
| `/proc/net/tcp6` surface and 32-hex IPv6 decode | **No** | `tcp6` occurs 0 times in the page |
| little-endian 32-bit word decoding of the address (`0100007F:8AEF` → 127.0.0.1) | **No** | no byte-order statement anywhere in the page |
| table = reader's network namespace (`/proc/net` → `/proc/self/net`, "network namespace of which the process is a member") | Yes, but in the **`/proc/net/` paragraph**, not the `/proc/net/tcp` anchor the claim cites | "Thus, since Linux 2.6.25, /proc/net is a symbolic link to the directory /proc/self/net…" |

Consequences:
- The claim's citation (`DESCRIPTION /proc/net/tcp`) supports exactly one clause: the remote-field meaning (plus, weakly, the "if connected" zero-remote skip). It does **not** support the tcp6 surface, the inode join, the LISTEN code, or the byte-order rule.
- The namespace limit the knowledge note states ("`/proc/net` is viewed from the driver process's namespace") *is* supported by S145, but by a different paragraph than the one cited in the claim. The claim's source line should carry the `/proc/net/` paragraph if the namespace limit is relied on.

## 6. Mis-attribution found in the lane

- `corpus/QUALITY.md` criterion 102 (line 715) says the `/proc/net/tcp{,6}` loopback classifier "decodes Linux's little-endian 32-bit words" and lists `(source: corpus/lessons/round-39.md M1; S145)`. The endianness fact is grounded by round-39 **measurement** (`proc-endian-before.json` / `-after.json`), not by S145; S145 is silent on byte order and on tcp6. The lesson M1 attribution is correct; the added "S145" attribution in criterion 102 overreaches.
- `corpus/knowledge/playwright-firefox-session-bound-tcp-round-39.md` cites S145 for "the procfs TCP peer field" and says it "does not establish that every browser network channel is covered" — that scoping is accurate. Its Observations section describes the `/proc` tcp6 surface and little-endian correction, which are observation-grounded and not S145-grounded; the note does not attribute them to S145 directly, so no defect there beyond the general point above.

## 7. Scoping conclusion

- The narrow claim "`rem_address` is the remote address and port pair (if connected) on `/proc/net/tcp`" is correctly scoped and verbatim-supported by S145 (11-word quote, SOURCES row form).
- The frozen C1 citation supports **only** that clause. Everything else the predicate's `nonLoopback`, `ss`/`proc` surfaces and owned-tree join depend on (inode column, LISTEN code, tcp6, byte order) rests on the driver's own measured/kernel-format behaviour and on the round-39 measurements, not on S145.
- The claim-level text should not be read as S145 grounding the whole `/proc` classifier; the source line is adequate only for the remote-field meaning.

## 8. Findings

- **F1 (minor, citation text)**: `.ufo/waves/round-40/sources/S145-open.txt` line 4 quote (`the ‘rem_address’ is …`) is not a verbatim span of the fetched page (0 hits). The SOURCES row form (`"rem_address" is the remote address and port number pair (if connected)`, 2 hits) is the correct span. Fix belongs to the owner of `S145-open.txt`; not edited here.
- **F2 (moderate, over-attribution)**: `corpus/QUALITY.md:715` (criterion 102) cites S145 for little-endian `/proc` decoding; S145 does not support byte order or tcp6. Fix: keep the lesson/measurement as the source for that clause.
- **F3 (minor, anchor coverage)**: the namespace limit relied on in the round-39 knowledge note is in the `/proc/net/` paragraph; the frozen claim's source line cites only `DESCRIPTION /proc/net/tcp`. Not a predicate defect; a citation-completeness gap.
- **F4 (scope note, not a defect)**: the tcp inode column (index 9) and the `st=0A` LISTEN filter are load-bearing for the owned-socket join and have no S145 support. The frozen predicate does not name them, so this is a limitation of the source, recorded here so it is not silently attributed to S145.

## 9. Limitations

- Single source (S145) only; no `ss(8)`, `tcp(7)` or kernel `net/ipv4/tcp_ipv4.c` opened, since the assignment scoped to S145 and the cited source. The inode/state/byte-order statements above are therefore "not in S145", not "wrong".
- Quote check is a whitespace-normalised, tag-stripped substring test on the fresh fetch; no byte-level diff against the HTML source beyond the sha256 match.
- Frozen `scripts/` and counter bytes were hashed, not executed. No driver or counter run was performed (not in scope; the claim's live invocation is main-agent work).

## 10. Evidence paths

- Fresh fetch sha256 and retained copy: `.ufo/waves/round-40/sources/proc_pid_net.html` (sha256 `5e1700fff5cbaf4a1875387f6052cc0b2f35694fc25bc051c23b8f4de55f726f`)
- Quote-open note: `.ufo/waves/round-40/sources/S145-open.txt`
- SOURCES row: `corpus/SOURCES.md` line 159 (S145)
- Driver field reads: `scripts/playwright-firefox-egress-round39.mjs` lines ~163-223 (`parseProcNet`, `isLoopbackHexRem`, `observeProc`)
- QUALITY 102: `corpus/QUALITY.md` line 715
- Knowledge note: `corpus/knowledge/playwright-firefox-session-bound-tcp-round-39.md`

## 11. Tooling

No install, upgrade or PATH change. `toolInstalls` remains `[]` for this seat. Scratch dir `/fast/scratch/hyaku/tabi-r40/ConnSourcePattern/` created and removed before yield. No pacman invoked.

VERDICT finding — S145 correctly scopes the `/proc/net/tcp` remote-address/port field (verbatim 11-word quote, "if connected"), but the frozen C1 citation supports only that clause: inode join, LISTEN code, tcp6 and little-endian decoding are not in S145 (F2 over-attribution in QUALITY 102; F1 misquote in S145-open.txt; F3 namespace paragraph not cited).
