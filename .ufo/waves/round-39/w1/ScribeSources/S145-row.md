# S145 candidate registry row — draft (seat dir only)

Item: draft the S145 candidate row only after opening the source; verify the current max S-id
from the committed registry; 11 columns, no pipes; tier/scope/anchor/teaches/status/opened/
recheck/used-by satisfy CORPUS.md §SOURCES contract v1.

## Source opened

- URL: https://man7.org/linux/man-pages/man5/proc_pid_net.5.html
- Opened: 2026-10-27T17:36:17Z (server `Date`), HTTP 200, 17119 B, no redirect
  (`curl -w '%{url_effective}'` = the same URL)
- `Last-Modified: Thu, 08 Oct 2026 17:39:35 GMT`; `ETag: "42df-65d57b70ec3c0"`;
  `Content-Length: 17119`
- sha256 `5e1700fff5cbaf4a1875387f6052cc0b2f35694fc25bc051c23b8f4de55f726f`; a second fetch
  returned the same 17119 B and the same sha256 (`cmp` IDENTICAL)
- Page identity: `Linux man-pages 6.19   2026-02-08   proc_pid_net(5)` (footline, HTML line 289);
  colophon says the page was obtained from the `man-pages-6.19.tar.gz` tarball (line 279)
- Second surface: installed `/usr/share/man/man5/proc_pid_net.5.gz` (`zcat` 8738 B) declares
  `.TH proc_pid_net 5 2026-02-08 "Linux man-pages 6.19"` and carries the same sentences at
  roff lines 13, 30-37 and 141-155

Why this page rather than `proc(5)`: man-pages 6.19 split the consolidated `proc(5)`; the
installed `/usr/share/man/man5/proc.5.gz` is now an 8761 B overview whose only net references
are cross-links, and the fetched `proc(5)` HTML (31125 B, 2026-10-27T17:35:52Z) likewise
cross-links `proc_pid_net(5)` at HTML lines 222 and 398. The `/proc` socket-table text the C1
knowledge entry cites lives on `proc_pid_net(5)`.

## Quote (≤25 words) with location

> these files and directories now expose information for the network namespace of which the
> process is a member

18 words. Location: `proc_pid_net(5)`, §DESCRIPTION, the `/proc/net/` paragraph, HTML lines
88-89 (sentence begins at line 87; `Thus, since Linux 2.6.25` at line 84); the same sentence at
installed roff lines 36-37. Whitespace-normalised occurrence count: 1 on the HTML surface, 1 on
the roff surface.

Supporting spans opened on the same fetch (not the quoted teaches anchor): `/proc/net/tcp`
entry at HTML lines 157-169, with `The "uid" field holds the effective UID of the creator of
the socket.` at lines 168-169 (the same sentence also ends the `/proc/net/raw` and
`/proc/net/udp` entries, so any row citing it must scope by entry heading), and
`The "rem_address" is the remote address and port number pair (if connected).` at lines 162-163.

## Draft row (exact line, for append under ## Registry)

```
| S145 | proc_pid_net(5) — network layer information: the `/proc/pid/net/` and `/proc/net/` socket tables — https://man7.org/linux/man-pages/man5/proc_pid_net.5.html | docs | A | what proc_pid_net(5) at Linux man-pages 6.19 states about the procfs network tables a socket observation reads: any per-pid view is the reading process's network namespace, a TCP row names its peer through the hex `rem_address` pair, and `uid` is the socket creator's effective UID, not a pid; not kernel source behaviour, not `ss` output, not another man-pages version | man-pages 6.19 dated 2026-02-08 as served by man7.org (footline, colophon says obtained from the man-pages-6.19.tar.gz tarball), §DESCRIPTION `/proc/pid/net/` lines 72-73 and the `/proc/net/` paragraph lines 82-89 (`Thus, since Linux 2.6.25` at line 84, quoted sentence at lines 88-89), `/proc/net/tcp` entry lines 157-169 with the `uid` sentence at lines 168-169; fetched 2026-10-27T17:36:17Z, HTTP 200, 17119 B, sha256 5e1700fff5cbaf4a1875387f6052cc0b2f35694fc25bc051c23b8f4de55f726f, byte-identical on a second fetch; the installed `/usr/share/man/man5/proc_pid_net.5.gz` is the same 6.19 text (8738 B, sha256 b5c5e9136f6f923b7e809e2538673866e95413569a3f75d8834f13553642804c, same sentences at roff lines 13, 30-37 and 141-155) and the man-pages-6.20 tarball released 2026-10-21 carries the same body with only the `.TH` version stamp changed (8746 B, sha256 3e46888a7e6df0b40e07a43c94780ae5a817766007d8d4ae144fefa4f4ac4335) | A procfs TCP row identifies a peer only by the hex-decoded `rem_address` pair and its creator only by effective UID inside a network-namespace-scoped dump, so attributing a socket to a process must come from the PID tree's `/proc/<pid>/fd` inodes and never from the table itself | mined | 2026-10-27 | on-release | corpus/knowledge/playwright-firefox-session-bound-tcp-round-39.md |
```

## Revision cross-check (freshness)

- `https://mirrors.edge.kernel.org/pub/linux/docs/man-pages/` (HTTP 200, 10625 B, fetched
  2026-10-27) lists `man-pages-6.19.tar.gz` (25-Aug-2026) and `man-pages-6.20.tar.gz`
  (21-Oct-2026), so 6.20 is published and man7.org's `/man5/proc_pid_net.5.html` still serves
  the 6.19 text (its `Last-Modified` 2026-10-08 predates the 6.20 release).
- `man-pages-6.20.tar.xz` fetched (HTTP 200, 1914692 B, sha256
  `180f0d16a2142dd9671760ac0afeadcc25e861f695eb420293e1206a87ca083f`); `man/man5/proc_pid_net.5`
  extracted. `diff -u` against the installed 6.19 page → one changed line only:
  `.TH proc_pid_net 5 2026-02-08 "Linux man-pages 6.19"` vs `… "Linux man-pages (unreleased)"`.
  Page body identical (8738 B vs 8746 B), and the quoted sentence still occurs exactly once.
- Consequence for the row: the anchor names the served revision (6.19, 2026-02-08), records the
  6.20 equivalence, and keeps `on-release` as the recheck cadence — man7.org's regeneration for
  6.20 is the next recheck trigger, and the text is not stale in content.

## Column map (11 columns)

| # | cell | value |
|---|---|---|
| 1 | id | `S145` — next unused; committed registry has S001-S144 contiguous (144 ids, no gaps), so max+1 = S145 |
| 2 | source | title — canonical URL (`https://man7.org/linux/man-pages/man5/proc_pid_net.5.html`); no prior row carries a man7.org URL (`grep -c 'man7.org' corpus/SOURCES.md` = 0), so no duplicate-URL finding |
| 3 | kind | `docs` (page is documentation, in the vocabulary set) |
| 4 | tier | `A` — the man-pages project's own page, primary for the `/proc` interface it documents, scoped by column 5; `docs` is not `community`, so no tier-inflation rule applies |
| 5 | scope | the procfs network-table statements a socket observation reads at man-pages 6.19; explicitly excludes kernel source behaviour, `ss` output, other versions |
| 6 | anchor | §DESCRIPTION + exact HTML line ranges + revision (6.19, 2026-02-08), not a bare homepage |
| 7 | teaches | one grounded learner benefit: peer and creator are not process identity, and the view is namespace-scoped, so attribution needs the fd-inode join |
| 8 | status | `mined` — `used-by` names one path that exists and cites S145 |
| 9 | opened | `2026-10-27` (ISO date, the date this seat opened the page) |
| 10 | recheck | `on-release` (man-pages release cadence; accepted cadence token) |
| 11 | used-by | `corpus/knowledge/playwright-firefox-session-bound-tcp-round-39.md` — repo-relative, inside root, file exists and line 1 reads `source: S145 — proc_pid_net(5), Linux man-pages, …` |

Pipe check: the line contains no `|` inside any cell; `awk -F'|' … NF!=13` prints 0 on the
fixture registry that carries this row (12 delimiters = 11 cells + 2 empty edges).

## Binding conditions and limits

- `status=mined` depends on `corpus/knowledge/playwright-firefox-session-bound-tcp-round-39.md`
  surviving integration with an `S145` mention. At draft time it is untracked in the worktree
  (`git status --porcelain` → `?? …`). If the integrator renames the entry, CORPUS.md rule 2
  permits an in-place `used-by` edit logged old→new in the round lesson; a silently dangling
  `used-by` fails `scripts/check-sources.mjs` with `used_by_missing`.
- The page documents the interface, not observed runtime behaviour: the row claims nothing about
  what any particular browser's sockets look like.
- Row draft only: no production file under `corpus/` was edited by this seat.

## Production conflict (observed, not authored here)

At 14:35 local the worktree registry was unmodified (`git status --porcelain corpus/SOURCES.md`
printed nothing). At 14:40:16 it was `M`, carrying an S145 row this seat did not write, plus a
`## Paths` entry (`session-bound-tcp-observation — S145: …`) and a Search-log entry that says
"L1 opened S145". Verbatim worktree row (`corpus/SOURCES.md:159`, uncommitted at HEAD
`dfec88a7603de1ce9b5b84bf36deabbc5f4d8a0e`):

```
| S145 | proc_pid_net(5) — Linux man-pages — https://man7.org/linux/man-pages/man5/proc_pid_net.5.html | docs | A | Linux `/proc/net/tcp` remote endpoint field for a host-scoped socket observation; not UDP or packet-level egress | proc_pid_net(5), DESCRIPTION, `/proc/net/tcp`; man-pages 6.19 (2026-02-08), opened 2026-10-27 | “rem_address” is the remote address and port number pair (if connected) | mined | 2026-10-27 | 180d | corpus/knowledge/playwright-firefox-session-bound-tcp-round-39.md |
```

Deltas against this draft, on the contract's own axes:

| cell | landed (L1, worktree) | this draft | note |
|---|---|---|---|
| kind/tier/opened/status/used-by | docs / A / 2026-10-27 / mined / same knowledge entry | identical | agree exactly |
| scope | "`/proc/net/tcp` remote endpoint field for a host-scoped socket observation; not UDP or packet-level egress" | adds the two facts the knowledge entry's §Limits relies on: the per-pid view is the reader's network namespace, and `uid` is the creator's effective UID, not a pid | landed scope does not scope the namespace limit |
| anchor | section + version (6.19, 2026-02-08) + opened date; no line, no access time, no bytes/sha256 | exact HTML line spans, fetch timestamp, HTTP status, byte count, sha256, second-fetch identity, 6.19↔6.20 body equivalence | contract asks "exact section / heading / page / line plus revision"; the landed cell satisfies section+revision, this draft adds line and revision-of-record |
| teaches | a quotation of the `rem_address` field sentence | one grounded learner benefit: peer and creator are not process identity inside a namespace-scoped dump, so attribution needs the `/proc/<pid>/fd` inode join | contract: teaches is "one grounded learner benefit"; a quoted field description is source text |
| recheck | `180d` | `on-release` | both legal; 6.20 shipped 2026-10-21 while man7.org still serves 6.19, so `on-release` fires at the site's next regeneration, `180d` defers to about 2027-04-25 |
| quote location | none in the row (the quote sits in teaches) | location in the anchor and in this file: lines 88-89 / roff 36-37 | rule 1 puts the ≤25-word quote **with location** in the round lesson's Gate |

Reconciliation: the draft cannot be appended — the id is taken in the worktree and appending
both rows would fail `duplicate_id` (E03). Either (a) while the landed row is still uncommitted,
replace its `scope`/`anchor`/`teaches` cells with this draft's (no supersede needed, nothing is
in a commit yet), or (b) if it is committed as-is, append S146 whose `teaches` opens
`supersedes S145 —` — which is also what `check-sources.mjs` requires on a repeated URL
(`duplicate_url` is suppressed only when teaches matches `^supersedes S\d{3,}`). The round-39
lesson did not exist at 14:41 (`ls corpus/lessons/round-39*` → no such file), so the rule-1 Gate
record for S145 is still owed by whoever lands the row.

