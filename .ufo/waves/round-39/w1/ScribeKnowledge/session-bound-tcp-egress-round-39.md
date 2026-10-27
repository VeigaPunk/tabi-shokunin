source: S145 (PROVISIONAL — no *committed* registry row: at HEAD 1ace2fdeca7b9f81b8e4cf48f1a0f88e308bc0e4 `corpus/SOURCES.md` ends at S144; an uncommitted S145 row was present in the working tree from a concurrent seat, labelling the same page `proc_pid_net(5)` with the same URL, version and quote as this note) — Linux man-pages `proc_pid_net(5)`, https://man7.org/linux/man-pages/man5/proc_pid_net.5.html, fetched 2026-10-27T17:36:24Z, HTTP 200, 17,119 B, sha256 5e1700fff5cbaf4a1875387f6052cc0b2f35694fc25bc051c23b8f4de55f726f; page identity = man-pages 6.19, page date 2026-02-08, HTML rendering 2026-09-09. Page-identity note: `.ufo/waves/round-39/claims.json:29` names "proc(5)"; at man-pages 6.19 `proc(5)` is a hub page that contains no `/proc/net` text (https://man7.org/linux/man-pages/man5/proc.5.html, HTTP 200, 31,125 B, sha256 b197c5fa64577269f992d50f60acfd5e0cc3df756644ddd8bd19a02591272a97, links `proc_net(5)`), and this host's `/usr/share/man/man5/proc_net.5.gz` is exactly `.so man5/proc_pid_net.5` (man-pages 6.19-1). The `/proc/net` socket-table text lives in `proc_pid_net(5)` only.
verified-at: round 39, 2026-10-27; receipt `corpus/evidence/round-39/playwright-egress/receipt.json` sha256 e894f1d5950eeff25dbf98fb3f951ab2eea8484f2049b88b25252bf45ff8f493, committed at lane 1ace2fdeca7b9f81b8e4cf48f1a0f88e308bc0e4; driver `scripts/playwright-firefox-egress-round39.mjs` sha256 3fba8b680cb1a415517266d722640aebf38e280a929d3ae5335054a3f09a33fc (= claims.json frozenDigests); Playwright 1.64.0, Firefox 157.0 (`/home/vgpnk/.cache/ms-playwright/firefox-1555/firefox/firefox`), Linux 7.2.11-arch1-1 x64
recheck: on any kernel /proc column-layout change, man-pages bump, or Playwright/Firefox pin move — (a) `zcat /usr/share/man/man5/proc_pid_net.5.gz | col -b | grep -A10 '/proc/net/tcp'`; (b) with one live loopback socket, confirm `/proc/net/tcp` row `f[9]` equals `/proc/<pid>/fd` `socket:[N]` and that TIME_WAIT rows still carry `f[9]=0`; (c) `node scripts/playwright-firefox-egress-round39.mjs --out <scratch>/receipt.json --runs 2` and compare sample count, first-to-last sample span, both surfaces' non-loopback counts, survivors and port state

# Session-bound TCP egress observation — Playwright Firefox, round 39

**Bounded claim.** On this host on 2026-10-27, one Playwright 1.64.0 / Firefox 157.0
session launched by `scripts/playwright-firefox-egress-round39.mjs` against a
127.0.0.1 fixture recorded **zero non-loopback TCP sockets on both the `ss` and
`/proc/net/tcp{,6}` surfaces** for the driver's launch-time owned process tree —
8 and 9 samples at a ~100 ms cadence over two runs, zero survivors, fixture port
closed, and one identical first-shot sha256 across both runs. The scope is TCP
sockets attributable to that tree inside that session's network namespace. It is
**not** a statement about UDP/QUIC, about sockets opened and closed between ticks,
about processes outside the launch snapshot, about a browser in another network
namespace, and it carries **no permission to load external sites**.

## What the operation does

The driver binds an owned process set, then observes that set's sockets on two
independent surfaces every 100 ms, then performs one post-close sweep.

1. **Owned set.** Playwright 1.64 no longer exposes `browser.process()`, so the
   root is bound as the *direct children of the driver node process whose argv
   names the `ms-playwright/firefox` binary*, 400 ms after launch; descendants are
   taken from one `ps -eo pid=,ppid=` ppid walk. Empty roots or an empty tree
   aborts the run (fail-closed); `browser.close()` still runs.
2. **Surface 1 — `ss -Htnp`.** Rows are kept when they match `pid=<tree>[,)]`;
   the peer field is `f[4]` and is classified loopback only for `127.`,
   `[::1]`, `[0:0:0:0:0:0:0:1]`, `[::ffff:127.`. Anything else counts non-loopback.
   Measured layout on this host: `['ESTAB','0','0','127.0.0.1:46813','127.0.0.1:51864','users:(("python3",pid=406821,fd=5))']` — `f[3]` local, `f[4]` peer, pid regex matches `pid=406821,`.
3. **Surface 2 — `/proc` fd join.** For each owned pid, `/proc/<pid>/fd` symlinks
   of the form `socket:[N]` are collected, then joined against
   `/proc/net/tcp` and `/proc/net/tcp6` rows on `f[9]`; rows with `st == '0A'`
   (LISTEN) and wildcard remotes are skipped; the remote is decoded from
   little-endian 32-bit words and classified loopback for 127/8, `::1`, and
   `::ffff:127/8`.
4. **Post-close sweep.** After `browser.close()`, one more sample of the same
   tree, plus `survivorPids` = tree pids still present under `/proc`, plus
   `portClosed` = `ss -ltn | grep -c ':<port> '` equal to 0.

## What the receipt records

| field | run1 | run2 |
|---|---|---|
| samples | 9 | 8 |
| declared `coverageMs` | 1560 | 1461 |
| first→last **sample** span | 799 ms | 701 ms |
| sample cadence (min–max delta) | 99–100 ms | 99–101 ms |
| ticks with a socket on `ss` / `proc` | 6 / 6 | 6 / 6 |
| `ss` observations (Σ lines) | 6 | 6 |
| `proc` observations (Σ inodes) | 6 | 6 |
| non-loopback `ss` / `proc` | 0 / 0 | 0 / 0 |
| post-close final sweep | 0 lines, 0 inodes | 0 lines, 0 inodes |
| survivors | 0 | 0 |
| `portClosed` | true | true |
| owned tree | 5 pids (root 2430211) | 5 pids (root 2430482) |
| first-shot sha256 / bytes | `ebfae99c33fa602d5e68bdaa0265e5bf29ad69e7c94f26c731dfc3976c56cbf0` / 25382 | same |

Both runs were launched by the same node process (`owned.nodePid = 2430191`), each
with its own `mkdtemp` profile and its own ephemeral fixture port (34321, 39777);
`measuredAt` 2026-10-27T16:57:57.018Z. The after-click shot differs
(`fc410f43a5d4…`, 28151 B), so the identical first shot is a first-paint
determinism fact, not a frozen-page artifact.

## Measured limits

- **L1 — TCP only, on both surfaces.** `/proc/net/tcp` + `/proc/net/tcp6` are the
  only tables read, and `ss -t` selects TCP. `/proc/net/udp{,6}` — a separate table
  in the source — is never opened. UDP or QUIC traffic by the owned tree would
  score zero non-loopback on both surfaces; the "zero" is a TCP statement.
- **L2 — the ≥1000 ms test measures session wall clock, not the sampled window.**
  `coverageMs` is `Date.now() - t0` from before `newPage()` to after sampling stops;
  the actual first-to-last sample span is 799 ms (run1) and 701 ms (run2). The
  contiguous observation window is under one second in both runs.
- **L3 — 100 ms aliasing.** A connection whose lifetime is shorter than one tick can
  be missed entirely on both surfaces. The fixture's own load shows it: the first 2
  ticks of each run recorded 0 lines and 0 inodes before the loopback connection
  appeared, and the last tick recorded 0 again after close.
- **L4 — observations are tick-instances, not sockets.** `sockets.ss.observations`
  and `sockets.proc.observations` are sums over samples, so `6` means one socket
  seen on six ticks, not six sockets.
- **L5 — the owned set is a launch snapshot** [code-path observation]. `ownedTree()`
  is called once (line 246) and the sampler reuses `rec.owned.tree`; the file header
  comment at lines 9–10 says the tree is enumerated "once per sample tick", which is
  not what the code does. Both runs recorded 5 pids and `tree.size` reported 5. A
  descendant forked after the 400 ms binding is not in the owned set, so its sockets
  are never attributed — the run still passes.
- **L6 — namespace scope.** The source states that "since Linux 2.6.25, /proc/net is
  a symbolic link to the directory /proc/self/net" and that these files expose the
  namespace "of which the process is a member"; on this host
  `ls -l /proc/net` → `net -> self/net`. The driver reads `/proc/net`, i.e. the
  *reader's* namespace, and never `/proc/<pid>/net/tcp`, so a browser in a different
  network namespace would be invisible to the `/proc` surface. The receipt records
  no namespace of any kind.
- **L7 — the join key is undocumented by the source.** The `/proc/net/tcp`
  paragraph names fields only through `uid` and gives no format block for TCP (the
  nearest block sits under `/proc/net/udp`, and `/proc/net/unix` has one too); no
  `inode` field is documented. Measured on this kernel: the header line carries 12 names ending
  `uid timeout inode`, while data rows come in two shapes — 17 tokens for
  ESTABLISHED/LISTEN rows and 12 tokens for TIME_WAIT rows, whose `f[9]` is `0`.
  `f[9]` was confirmed as the socket inode against three live fds in one sample
  (`socket:[1264677492/3/4]` ↔ the three rows' `f[9]`). If a kernel ever reorders
  that column, the join matches nothing, `inodes` stays 0, `nonLoopback` stays 0,
  and the run still passes: the `/proc` surface degrades to a silent zero, not a
  refusal.
- **L8 — the post-close sweep cannot see residue on either surface** [measured].
  After an active close, the client socket appeared in `ss -Htnp` as
  `FIN-WAIT-2 0 0 127.0.0.1:50958 127.0.0.1:49963` with **no `users:` field**, and in
  `/proc/net/tcp` as a 12-token row with `f[9]=0`. Since `ss` rows are filtered by
  `pid=<tree>` and the `/proc` join is on inode, both surfaces structurally drop
  half-closed/TIME_WAIT sockets. The receipt's `finalSweep: {lines: 0, inodes: 0}`
  is therefore what the instrument always prints after close; it must not be read as
  "no residue existed".
- **L9 — the claim is attribution, not prevention.** "Zero non-loopback sockets on
  the owned set" is not "the browser made no external request". A loopback-bound
  relay outside the owned tree would carry the egress and be invisible. The launch
  sets only `network.dns.disablePrefetch: true`, which suppresses prefetch, not
  resolution.
- **L10 — port check is a string match.** `portClosed` greps `ss -ltn` for
  `':<port> '`; it verifies the fixture's own port, not a general port audit.
- **L11 — survivor check inherits L5.** `survivorPids` filters the launch tree by
  `/proc/<pid>` existence, so pid reuse can false-positive and later-forked
  descendants are never checked.
- **L12 — determinism scope.** The shared first-shot sha256 holds for 800×600,
  headless, this fixture, fresh profile and fresh port, within one node process. It
  is not evidence for other viewports, headed mode, or other browser builds.

Known hole in the decode, reported by a sibling seat and not re-run here:
`.ufo/waves/round-39/w1/CritC1ProcParse.md` records that width-only validation makes
malformed 8-hex input (`GG00007F`, `0100ZZ7F`) decode and classify as loopback, so a
malformed `/proc` remote is counted as loopback rather than non-loopback; its verdict
line reads `VERDICT finding — malformed proc hex is treated as loopback, a parser
false positive that weakens /proc surface egress accounting.` That hole is on the
`/proc` path only; `ss` is a separate parser.

## Source spans

- `proc_pid_net(5)`, DESCRIPTION, `/proc/net/tcp`: "The \"rem_address\" is the remote
  address and port number pair (if connected)." — grounds reading the peer endpoint
  out of field 2 of a socket-table row.
- `proc_pid_net(5)`, DESCRIPTION, `/proc/net/`: "since Linux 2.6.25, /proc/net is a
  symbolic link to the directory /proc/self/net" — grounds L6.
- `proc_pid_net(5)`, DESCRIPTION, `/proc/net/`: "This directory contains various
  files and subdirectories containing information about the networking layer." —
  grounds that the sockets are exposed as ASCII tables rather than as per-process
  events.
- Absences that matter: the page documents `/proc/net/udp` as a distinct table (so
  TCP coverage says nothing about UDP), names no `inode` column for TCP, and above
  all says nothing about **when** a row exists — every timing property in the limits
  above is measured, not documented.

## What this does not claim

- No UDP or QUIC coverage; no claim that a QUIC-only egress would be caught.
- No external-site navigation, no real-site interaction, no host or network
  permission beyond the loopback fixture.
- No claim about browsers launched by anything but this driver, or about Firefox
  builds other than `firefox-1555` / 157.0.
- No claim that the frozen C1 predicate is met: that is the counter's verdict
  (`.ufo/waves/round-39/counters/c1-egress-session-bound.mjs`), not this note's.

## Unknowns

- Behaviour under a browser confined to its own network namespace (L6) is unprobed;
  the fix would be reading `/proc/<pid>/net/tcp`, which the source documents — for
  `/proc/pid/net/` — since Linux 2.6.25.
- Whether any real Firefox content process forks after the 400 ms binding on a
  heavier page: unmeasured, and L5 says it would be invisible.
- The shortest connection lifetime this instrument can catch is bounded only by the
  99–101 ms cadence; no sweep of lifetimes was run.
- Column-layout drift (L7) is untested across kernels; only 7.2.11 is observed.
