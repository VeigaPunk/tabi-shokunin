# ScribeKnowledge — round 39, attempt 1 (seat leaf)

Axes: **depth**, **freshness**. Item: draft a candidate knowledge entry under this
seat directory describing only the session-bound TCP egress operation and its
measured limits; open the S145 source myself; cite S145 provisionally; carry the
source/verified-at/recheck provenance trio and a bounded claim; no UDP/QUIC coverage
claim, no external-site permission claim.

Deliverable: `.ufo/waves/round-39/w1/ScribeKnowledge/session-bound-tcp-egress-round-39.md`
(12.6 KB, written this seat, not `corpus/knowledge`).

## 1. Inputs read before acting

- `.ufo/waves/round-39/claims.json` — C1 predicate sentence, `frozenDigests`,
  `"source": "S145 (proc(5) man page, /proc socket observation) opened this round..."`.
- `.ufo/waves/round-39/counters/c1-egress-session-bound.mjs` (frozen; sha256
  `75e823e45bcaff817fb93d677df5dba714560b3be77e62103c73e1a0937c3b6e`, equal to
  `claims.json:frozenDigests`) — read the whole predicate and both receipt/control arms.
- `.ufo/waves/round-39/counters/c2-routed-defects-v2.mjs` — no relationship to S145
  observed (its source is the round-38 verifier spot-check).
- `scripts/playwright-firefox-egress-round39.mjs` (sha256
  `3fba8b680cb1a415517266d722640aebf38e280a929d3ae5335054a3f09a33fc`, equal to frozen).
- `corpus/evidence/round-39/playwright-egress/receipt.json` (sha256
  `e894f1d5950eeff25dbf98fb3f951ab2eea8484f2049b88b25252bf45ff8f493`), present at
  `HEAD` = `1ace2fdeca7b9f81b8e4cf48f1a0f88e308bc0e4` (`git cat-file -e` → PRESENT).
- Prior seat outputs: `.ufo/waves/round-39/w1/ScoutSourceS145.md` and
  `.ufo/waves/round-39/w1/RevSourcesRow/report.md`, plus
  `.ufo/waves/round-39/assimilation/S145-open.txt`.

Prior-seat tension, recorded verbatim: `ScoutSourceS145.md:6` states "this scouting
seat's available tools do not include an HTTP/browser reader route; no page request
was made" — i.e. the scout did **not** open S145. `RevSourcesRow/report.md:27` states
"VERDICT finding — S145 is not registered, and its candidate source title and URL
disagree; resolve and independently ground the source before writing a mined row."
This seat opened the source and resolved the identity (§2).

## 2. Source opened and identity resolved (freshness)

```
$ for u in proc.5 proc_pid_net.5 proc_net.5; do curl -sS -o "$u.html" \
    -w 'status=%{http_code} bytes=%{size_download} time=%{time_total}\n' \
    "https://man7.org/linux/man-pages/man5/$u.html"; sha256sum "$u.html"; done
== proc.5
status=200 bytes=31125 time=0.860608
b197c5fa64577269f992d50f60acfd5e0cc3df756644ddd8bd19a02591272a97  proc.5.html
== proc_pid_net.5
status=200 bytes=17119 time=0.859185
5e1700fff5cbaf4a1875387f6052cc0b2f35694fc25bc051c23b8f4de55f726f  proc_pid_net.5.html
== proc_net.5
status=200 bytes=17119 time=0.822848
5e1700fff5cbaf4a1875387f6052cc0b2f35694fc25bc051c23b8f4de55f726f  proc_net.5.html
accessed_utc=2026-10-27T17:36:24Z
```

Page metadata read from the rendered pages: `proc(5)` — "Linux man-pages 6.19",
page date `2026-02-08`; `proc_pid_net(5)` — same version/date; both HTML renderings
created `2026-09-09`. `proc_net.5.html` and `proc_pid_net.5.html` are byte-identical.

Host-side corroboration:

```
$ zcat /usr/share/man/man5/proc_net.5.gz | col -b | head -1
.so man5/proc_pid_net.5
$ zcat /usr/share/man/man5/proc_pid_net.5.gz | grep -n '^\.TH'
8:.TH proc_pid_net 5 2026-02-08 "Linux man-pages 6.19"
$ ls -l /proc/net; readlink -f /proc/net
lrwxrwxrwx 1 root root 8 Oct 27 14:33 /proc/net -> self/net
/proc/3047691/net
```

**Resolution of the flagged conflict.** At man-pages 6.19, `proc(5)` is a hub page:
its opening sections contain no `/proc/net` prose; `/proc/net` appears only as one
entry in a list of other pages, pointing at `proc_net(5)`, which on this host is the
`.so` redirect to `proc_pid_net(5)`. All socket-table text — `/proc/net/tcp`,
`/proc/net/tcp6`, `/proc/net/udp` — is in `proc_pid_net(5)`. So the S145 label
"proc(5)" in `claims.json:29` names the right family and the wrong page, and the
quote the assimilation note anchors (`rem_address`) is in `proc_pid_net(5)`; verified
verbatim in both the remote page and the local 6.19-1 file:

> `The "rem_address" is the remote address and port number pair (if connected).`

The entry cites **S145 (provisional) — `proc_pid_net(5)`** and states the identity
correction in its header. Registry state measured twice: at the committed HEAD
`grep -n '^| S14' corpus/SOURCES.md | tail -4` → S141, S142, S143, S144, so the
committed registry ends at S144; in the working tree a concurrent seat added an
uncommitted S145 row (`git diff corpus/SOURCES.md` → 1 insertion, label
`proc_pid_net(5) — Linux man-pages — https://man7.org/linux/man-pages/man5/proc_pid_net.5.html`,
anchor `DESCRIPTION, /proc/net/tcp`, status `mined`, recheck `180d`). That row
independently reaches the same page, version and quote as this seat, so the
correction in §2 is corroborated rather than contradicted. The citation stays
provisional here because the row is uncommitted and this seat did not write it.

## 3. Measurements behind the entry's limits

Receipt aggregates (`jq` over the committed receipt):

```
$ jq -r '.runs[] | "\(.name) nodePid=\(.owned.nodePid) port=\(.serverPort) \
  first=\(.samples[0].t) last=\(.samples[-1].t) span=\(.samples[-1].t-.samples[0].t) \
  declaredCoverage=\(.coverageMs) ticksWithSsLines=\([.samples[]|select(.ss.lines>0)]|length) \
  ticksWithProcInodes=\([.samples[]|select(.proc.inodes>0)]|length)"' .../receipt.json
run1 nodePid=2430191 port=34321 first=1793120277811 last=1793120278610 span=799 declaredCoverage=1560 ticksWithSsLines=6 ticksWithProcInodes=6
run2 nodePid=2430191 port=39777 first=1793120280014 last=1793120280715 span=701 declaredCoverage=1461 ticksWithSsLines=6 ticksWithProcInodes=6
$ jq -r '.runs[] | [.name,.sampleCount,.coverageMs,.sockets.ss.observations,.sockets.proc.observations,.sockets.ss.nonLoopback,.sockets.proc.nonLoopback,.survivors,.portClosed,(.owned.tree|length),.browserVersion,.firstShotSha256]|@tsv'
run1 9 1560 6 6 0 0 0 true 5 157.0 ebfae99c33fa602d5e68bdaa0265e5bf29ad69e7c94f26c731dfc3976c56cbf0
run2 8 1461 6 6 0 0 0 true 5 157.0 ebfae99c33fa602d5e68bdaa0265e5bf29ad69e7c94f26c731dfc3976c56cbf0
sample deltas: run1 [100,100,100,100,100,100,99,100]  run2 [101,101,99,99,100,100,101]
```

Live socket-table probe, scratch only (loopback listener + one connected pair, then
`/proc/net/tcp` read against `/proc/self/fd`):

```
rows: 6413 token histogram: Counter({12: 6340, 17: 73})
r12 f[9] value set: Counter({'0': 6027})     r12 states: Counter({'06': 6027})
r17 states: Counter({'01': 46, '0A': 22})
row local=0100007F:82CD st=0A f[9]=1264677492
row local=0100007F:82CD st=01 f[9]=1264677494
row local=0100007F:DB2C st=01 f[9]=1264677493
live fds: {4: 'socket:[1264677493]', 5: 'socket:[1264677494]', 3: 'socket:[1264677492]'}
```

`ss` layout and post-close attributability (same scratch probe):

```
SS: ['ESTAB', '0', '0', '127.0.0.1:46813', '127.0.0.1:51864', 'users:(("python3",pid=406821,fd=5))']
   f[3]='127.0.0.1:46813' f[4]='127.0.0.1:51864'
--- after active close (client port 50958) ---
ss rows: ['FIN-WAIT-2 0 0 127.0.0.1:50958 127.0.0.1:49963', 'CLOSE-WAIT 1 0 127.0.0.1:49963 127.0.0.1:50958 users:(("python3",pid=500943,fd=5))']
proc row state=05 ntok=12 f[9]=0
```

## 4. Findings

- **F1 (source identity).** S145 as cited is page-imprecise: `proc(5)` in man-pages
  6.19 carries no `/proc/net` text; the quoted `rem_address` sentence is in
  `proc_pid_net(5)`, and `proc_net(5)` is a `.so` redirect to it on this host and
  byte-identical on man7.org. Resolution recorded in the entry header; registry row
  still absent, so the citation is marked provisional.
- **F2 (driver comment vs implementation).** `scripts/playwright-firefox-egress-round39.mjs:9-10`
  says the descendant tree is enumerated "once per sample tick"; `ownedTree()` has a
  single call site (line 246) and the sampler reuses `rec.owned.tree`. The owned set
  is a launch snapshot (5 pids in both runs). A descendant forked after the 400 ms
  binding is never attributed, and the run still passes. The frozen counter does not
  test re-enumeration.
- **F3 (post-close sweep is structurally blind).** `ss -Htnp` prints no `users:`
  field for a socket without an open fd (measured `FIN-WAIT-2` row), and `/proc`
  TIME_WAIT rows carry `f[9]=0`; the driver filters `ss` by `pid=<tree>` and joins
  `/proc` on inode. So `finalSweep {lines: 0, inodes: 0}` is the instrument's
  guaranteed output after close, not evidence that no residue existed. The frozen
  predicate only requires zero non-loopback there, so it passes vacuously.
- **F4 (coverage accounting).** The counter's `coverageMs >= 1000` reads a declared
  field that is session wall clock (1560/1461 ms); the contiguous first-to-last
  sample span is 799/701 ms. The observation window is under one second in both runs,
  and sample count/coverage are taken from declared fields, not recomputed from
  `samples[].t`.
- **F5 (undocumented join key).** The source documents `/proc/net/tcp` fields only
  through `uid` and gives no TCP format block, and no `inode` field. On this kernel
  data rows are 17 tokens (ESTABLISHED/LISTEN) or 12 tokens (TIME_WAIT), with the
  inode at `f[9]` — verified against three live fds. A column reorder would make the
  join match nothing and report `inodes=0, nonLoopback=0`: a silent zero, not a
  refusal.
- **F6 (namespace scope).** `/proc/net` is `/proc/self/net` on this host, matching the
  source's "since Linux 2.6.25, /proc/net is a symbolic link to the directory
  /proc/self/net". The driver never reads `/proc/<pid>/net/tcp`, so a browser in
  another network namespace would be invisible on the `/proc` surface; the receipt
  records no namespace.
- **F7 (inherited hole, not re-run).** `CritC1ProcParse.md` reports malformed 8-hex
  `/proc` remotes classifying as loopback; recorded in the entry as a known limit
  with attribution, since it bounds the "zero non-loopback" claim.

## 5. Out of scope / not done

- Did not run the frozen C1 or C2 counters (judge seats own that); no verdict on the
  predicate is asserted here.
- Did not edit `corpus/knowledge`, `corpus/SOURCES.md`, `SCORECARD.md`, any counter,
  driver or evidence file; no commits; no git/jj mutation; no browser launch; no
  subagents; no `agent://all`.
- **Concurrent sibling writes observed, not this seat's.** `git status` at write time
  shows `M corpus/SOURCES.md`, `M .ufo/waves/round-39/assimilation/validate/corpus/SOURCES.md`
  and untracked `corpus/knowledge/playwright-firefox-session-bound-tcp-round-39.md`
  (mtime 14:36, before this seat wrote). This seat wrote only
  `.ufo/waves/round-39/w1/ScribeKnowledge*` (three paths). The corpus/knowledge file
  is a sibling draft on the same subject; it is not cited as this seat's output and
  was not modified.
- No tool installs (none needed). No pacman invocation of any kind by this seat.
- Scratch `/fast/scratch/hyaku/tabi-r39/ScribeKnowledge/` removed before yield
  (`ls` after `rm -rf` → "No such file or directory").

## 6. Evidence paths

- Candidate entry: `.ufo/waves/round-39/w1/ScribeKnowledge/session-bound-tcp-egress-round-39.md`
- This report: `.ufo/waves/round-39/w1/ScribeKnowledge/report.md`,
  `.ufo/waves/round-39/w1/ScribeKnowledge.md`
- Source bytes/digests are recorded in the entry header and §2; the HTML captures
  were scratch-only and are gone with the scratch directory, so the recheck command
  re-fetches rather than trusting a local copy.

VERDICT finding — the candidate entry is drafted and source-grounded, but the operation's own prose overstates two things: the post-close final sweep cannot observe closed-socket residue on either surface (ss drops the pid, /proc rows carry inode 0), and the owned process set is a launch snapshot despite the driver's per-tick comment; the declared ≥1000 ms coverage is session clock, not sampled span.
