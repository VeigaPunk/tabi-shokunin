# ConnSiblingProc — sibling /proc-net observation refresh (kama, souji)

Seat: connector (leaf, no subagent dispatch). Round 42, attempt 1, policy-v2 wave 1.
Axes named: **adjacency** (round-42 `lowestAxis`, score 8), **coverage**, **freshness**, **calibration**.
Judged on adjacency. Every command below was run read-only against
`/home/vgpnk/Projects/shokunin` (fleet) and its lanes. No file in the fleet, the lanes, or the
production tree was written; no git/jj mutation in any lane; no network beyond loopback and the
local filesystem. Scratch: `/fast/scratch/hyaku/tabi-r42/ConnSiblingProc/` (deleted before yield).

Pins read at start (`ev-06-pins.txt`): tabi `0081bfd` (= `refs/heads/master`
`0081bfdb93b6bd1bf2853bb128996f1a976b7218`), kama `7ee8cbdf`, souji `131ea87`.
Frozen bytes hashed, unchanged:

```
ce7b56799cae7593d315330ffce460ac9236c1f343e40cf7212f334f7fd41d7a  .ufo/waves/round-42/claims.json
b1d05df17137bfcf4db9c6d2851108e1313cf2229167b8b521fee2aa1c76b4a8  .ufo/waves/round-42/counters/check-routed-defects-round42.mjs
fb279c74b82abe6202680c214fd087b45b1134a19c5e21b028abeae3549180a3  scripts/playwright-firefox-egress-round41.mjs
4563e5deccc9bcba8e75c72867c88b8f65de0241a4726c81659d9d82e9895c76  scripts/measure-c1-round41.mjs
cd71a59efa575fc260c4e487b7d52f69a9cd9f3b98bc6d4333abdb9a0cff126a  .ufo/waves/round-41/counters/c1-session-bound-v4.mjs
```

No tool was installed or upgraded (PACMAN guard respected; nothing was needed).

---

## 1. What is new since 2026-10-27 — accepting nothing on assumption

Method (as the ticket asks), newest first:

```
$ ls -t kama-shokunin/corpus/lessons | head -8
round-62-verifier-spotcheck.md  round-62.md  round-61-verifier-spotcheck.md  round-61.md
round-60-verifier-spotcheck.md  round-60.md  round-58-verifier-spotcheck.md  round-59-verifier-spotcheck.md
$ ls -t souji-shokunin/corpus/lessons | head -8
round-36.md  round-37.md  round-36-verifier-spotcheck.md  round-35-verifier-spotcheck.md
round-35.md  round-34-verifier-spotcheck.md  round-34.md  round-33-verifier-spotcheck.md
```

Corpus files newer than 2026-10-27 (`ev-01-sibling-scan.txt`): in kama, `round-5[89]/60/61/62`
lessons and their spot-checks, `knowledge/ollama-live-lifecycle.md` (10-28 03:19),
`ollama-live-amendment-r61.md` (10-28 03:14), `completion-request-plane.md` (10-28 09:32),
`battery-execution-evidence.md` (10-27 17:05), plus `SOURCES.md` / `QUALITY.md` / `README.md`.
In souji, `round-3[4-7]` lessons and spot-checks, `knowledge/fleet-prune-numerator-r35.md`.

**Nothing in either lane's corpus since 2026-10-27 parses `/proc/net/tcp` or claims socket
ownership.** The controlling kama entry is older than the window and byte-stable:

```
$ git -C kama-shokunin log -1 --date=iso --pretty='%h %ad %s' -- corpus/knowledge/loopback-listener-ownership.md
0c75c611 2026-10-21 01:58:02 -0300 round-18: close falsify privacy/impl-binding/counter seams, ...
$ git -C kama-shokunin log --since=2026-10-27 --pretty='%h %ad %s' -- tools/kama-llamacpp-live.py
(empty)
$ grep -n 'def _listen_inodes\|def port_owned_by\|def verify_live' tools/kama-llamacpp-live.py
619:def _listen_inodes(port):
641:def port_owned_by(pid, port):
1143:def verify_live(proc, port, label):
```

Same three line numbers round 40 read (`.ufo/waves/round-40/w1/ConnSiblingOverlap/report.md` §2
cited `_listen_inodes` 619, `port_owned_by` 641, `verify_live` 1143) — the mechanism has not moved.

souji holds **no `/proc/net` material at all**. Its whole corpus has one `/proc`-socket hit, and it
is older than the window:

```
$ grep -rn -E 'proc/net|/proc/<pid>/fd|socket inode|socket:\[' souji-shokunin/corpus
souji-shokunin/corpus/lessons/round-33.md:22: | `S225` proc_pid_fd(5), Linux man-pages 6.19 | ADMIT ... "A readlink(2) call on this file returns a string in the format: type:[inode]" ...
$ git -C souji-shokunin log -1 --date=iso --pretty='%h %ad %s' -- corpus/knowledge/process-residue-observations.md
4eb2fda 2026-10-21 10:18:04 -0300 round-21: complete claims, independent oracle and scoped falsification evidence
```

Rounds 34-37 (all landed 2026-10-27/28) are file/repo residue census, a repo-drift tool, a git
child-env whitelist and `O_NOFOLLOW` writes; `grep -n '/proc\|pid\|process' corpus/lessons/round-3[5-7].md`
returns only "the child git process gets a whitelisted environment". No network surface.

### What *is* new and adjacent — but on a different join

- **kama rounds 50-56** (2026-10-27/28) bind a *replay's running image*, not a socket:
  `/proc/<pid>/maps` dev:inode (S496), `/proc/<pid>/exe` opened-fd dev:inode + hash (S499), memfd
  `F_SEAL_*` (S500/S501), then `code_mappings`. This is **process-image identity**.
- **kama round 62, `E12KillSwitch`, measured 2026-10-28** — the one genuinely new *process-tree*
  fact in the window, quoted verbatim from
  `.ufo/waves/round-62/w1/out/E12KillSwitch/process-tree-run9.txt`:

  ```
  ## AFTER (first non-alive sample of the child, /proc/<pid>/stat)
  {"final_stat": {"comm": "llama-server", "exit_code": 9, "exit_signal": 9, "pgrp": 1208120,
                  "pid": 1208123, "ppid": 1494, "sid": 1208120, "state": "Z"}, ...}
  ## AFTER (port state ~0.2 s later)
  listen_inodes = [] ; port_owned_by_child = None ; bind = [True, None]
  ```

  Three measured facts: a child's **ppid is unstable** (reparented to systemd `1494`); a zombie
  still carries `exit_signal`; and ownership degrades to **`None`, never `False`**, once the fd is
  gone. tabi's frozen round-41 driver already binds identity by `startTicks` (field 22) + `exe` +
  `cmdline` instead of ppid —

  ```
  scripts/playwright-firefox-egress-round41.mjs:95-97
  // startTicks (/proc/<pid>/stat field 22, HZ jiffies since boot) and exe
  // (/proc/<pid>/exe readlink) so a stale or reused pid is provably outside the run window
  ```

  — so kama's new evidence **converges** on tabi's shape; it exposes no defect in tabi.

---

## 2. Do the two parsers agree? Ran, not asserted

Both lanes' decoders were extracted from their **frozen bytes at the pinned revisions** and driven
over the same vectors (`ev-03-tabi-decoder.mjs|.out`, `ev-04-kama-predicate.py|.out`; kama's
`_tcp6_is_loopback` by `exec` of the function text only — no top-level tool code ran).

```
tabi source_sha256 fb279c74b82abe6202680c214fd087b45b1134a19c5e21b028abeae3549180a3
127.0.0.1 (v4 LE word)   hex=0100007F                         loopback=true
192.168.1.1 (v4 LE word) hex=0101A8C0                         loopback=false
::1                      hex=00000000000000000000000001000000 loopback=true
::ffff:127.0.0.1         hex=0000000000000000FFFF00000100007F loopback=true
:: (wildcard)            hex=00000000000000000000000000000000 loopback=false
2001:db8::1              hex=B80D0120000000000000000001000000 loopback=false
fe80::1                  hex=000080FE000000000000000001000000 loopback=false

kama source_sha256 98d2e6bb48a90e60797df0d2bee895eac4a6cdd9859af2dc47b64bdb4a36fbe9
127.0.0.1 ... agree=True   192.168.1.1 ... agree=True   ::1 ... agree=True
::ffff:127.0.0.1 agree=True   :: ... agree=True   2001:db8::1 agree=True   fe80::1 agree=True
```

7/7 agreement, including the trap kama documents ("A suffix test for `01000000` alone is
insufficient: it also accepts `2001:db8::1` and `fe80::1`", `loopback-listener-ownership.md:29`):
both reject both. Host tables parse structurally the same way (`ev-03-tabi-decoder.out`):
`/proc/net/tcp rows=155 localHexLen={"8":155} states={"0A":30,"06":90,"01":35} numericField9=155`,
`/proc/net/tcp6 rows=108 localHexLen={"32":108} states={"0A":6,"01":92,"06":10} numericField9=108`.

## 3. Provinces remain distinct — at field and question level, not just by label

| | kama | tabi |
|---|---|---|
| table read | `/proc/net/tcp{,6}` `parts[1]` = **local_address** (`_proc_listener_inode`, state `0A`, port match) | `/proc/net/tcp{,6}` `f[2]` = **rem_address** (`parseProcNet`, state `!= 0A`, wildcard rem skipped) |
| inode | split-field index `9` | split-field index `9` |
| question | *is a loopback listener on my port admissible, and does my child's fd hold it?* — fail-closed, wildcard **refused** | *where did a socket my owned PID holds point?* — peer classification over rows already joined to an owned inode |
| scope | own served child, one port; plus a **host-wide** registry/census surface (`listener-census.md`, `consumer-registry.md`) | own launched Firefox tree, kernel-chosen loopback fixture port only |

tabi's scope statement is in its own corpus and in the frozen claim, not an inference:

```
corpus/knowledge/playwright-firefox-session-bound-tcp-round-39.md:20
- This method observes TCP tables only; UDP, QUIC, Unix-domain sockets, packet-level traffic, and other
  network namespaces are not covered. ... Do not generalize the receipt to “no egress.”
.ufo/waves/round-42/claims.json:34
... `playwright-firefox-loopback-tcp - observe a loopback browser session's TCP sockets from both ss and
  /proc/net/tcp ...`
```

**Confirmed: provinces distinct.** tabi makes no host-egress claim; kama's host-wide census surface
is the one that would collide if tabi ever widened, and tabi has not. One wording tension to route
(not amend): the `S145` scope cell reads "for a **host-scoped** socket observation"
(`corpus/SOURCES.md:159`) while the claim is session-scoped. The *table* is host-scoped; the *join*
is process-scoped. Read as the claim's scope, that cell would license exactly the host-wide claim
the knowledge entry forbids.

## 4. Should the S145-scoped observation cite the siblings? **No.**

1. `S145` is a located-quote man7 row (`proc_pid_net(5)`, `rem_address`). A sibling corpus path is
   not a lane source and cannot take a `mined` status cell; `used-by` correctly names only
   `corpus/knowledge/playwright-firefox-session-bound-tcp-round-39.md, corpus/lessons/round-40.md`.
   Citing kama/souji corpora would be a cross-province citation.
2. The claim is already narrower than either sibling's surface, so there is nothing to acquire.

**But the refresh surfaces a real coverage gap, in tabi's own registry.** The round-42 `C1`
`restsOn` is `S145` + `S148` only. tabi holds **no source row** for three mechanisms its own frozen
driver relies on:

```
$ grep -n -E 'proc_pid_fd|tcp_ipv6|proc_net_tcp|/proc/<pid>/fd|readlink' corpus/SOURCES.md   → exit 1 (none)
$ grep -n -E 'proc_pid_stat|starttime|startTicks|field 22' corpus/SOURCES.md                → exit 1 (none)
```

| mechanism tabi uses | page that grounds it | who already holds a located-quote row |
|---|---|---|
| `/proc/<pid>/fd` readlink yields `socket:[inode]` (`socketInodesOfPid`) | `proc_pid_fd(5)` | souji `S225` (`SOURCES.md:172`): "pipes and sockets yield `type:[inode]`" |
| `/proc/<pid>/stat` field 22 starttime (`pidIdentity`) | `proc_pid_stat(5)` | nobody in the fleet (kama uses it in tools, unsourced as a row) |
| tcp6 = four host-endian words (`decodeProcIp` 32-hex arm) | `net/ipv6/tcp_ipv6.c` `get_tcp6_sock` | kama `S048` (+ `S049` `proc_net_tcp.rst`, `S050` RFC 4291) |

The cheap in-lane move is to **open those pages in tabi's own registry** in a later round — not to
cite a sibling. This is a routed finding; no counter/claims byte is touched.

## 5. The one non-obvious move (adjacency)

**Finding the front line: the boundary the round-40 connector found never landed anywhere in the
corpus, and the lane's own quality rule requires it to.**

```
$ wc -l corpus/adjacency.tsv                                   → 17   (header + 16 rows)
$ grep -n -E 'kama|souji' corpus/adjacency.tsv
11:cdp-live-target-census  kama  kama-shokunin@54a29268...:corpus/knowledge/listener-census.md:355
    `127.0.0.1:9222` — Chrome DevTools protocol, 21 live targets ...  contested-open ...
$ grep -n -E 'kama|souji' corpus/lessons/round-40.md           → exit 1 (source: never named in corpus)
corpus/QUALITY.md:134 (rule 32)
32. A scope overlap with a sibling lane is dispositioned in a committed `corpus/adjacency.tsv` row
    whose quotes resolve on pinned lines (`scripts/check-adjacency.mjs`); ... A clean checker certifies
    citations and venues, not bilateral agreement: a `split-declared` or `refused-route` row records
    tabi's reading and says so.
```

The only kama row points at a **round-17** commit (`54a29268`) and the **wrong surface** (CDP 9222
targets, not socket ownership); there is **no souji row at all**; the last growth of the ledger was
round 34 (`LOG.md:2418`). The round-40 connector marked both overlaps "**No.**" in its §3 table —
and that finding died in wave scratch, because `.ufo/` can never be a `ruling_ref`/`tabi_ref`
(`check-adjacency.mjs:78-90`, `:830`). `adjacency` is the lowest axis at 8 and rule 32 is
unmet for two live overlaps. That is the move.

**Proposed move (one, bounded).** Add two `split-declared` rows to `corpus/adjacency.tsv`, shaped
after the round-34 precedent (a SKILL.md "sibling-overlap declarations" bullet per row, append-only,
`SKILL.md:2917`). Rows, exactly as gate-verified (`ev-09-candidate-rows.tsv`):

| surface | sibling_ref | sibling_quote | tabi_ref | tabi_quote | disposition | ruling_ref | ruling_quote |
|---|---|---|---|---|---|---|---|
| `loopback-listener-ownership` | `kama-shokunin@0c75c611474cfc9f3c549e056fb0b736b20b854f:corpus/knowledge/loopback-listener-ownership.md:36` | `The loopback bind address does not identify the process.` | `corpus/knowledge/playwright-firefox-session-bound-tcp-round-39.md:20` | `This method observes TCP tables only` | `split-declared` | `-` | `other network namespaces are not covered.` |
| `proc-residue-observation` | `souji-shokunin@4d9bf0256f6f61a49ebfec55a524556090015f60:corpus/SOURCES.md:172` | ``pipes and sockets yield `type:[inode]` `` | `corpus/knowledge/playwright-firefox-session-bound-tcp-round-39.md:11` | ``correlates socket inodes from those PIDs' `/proc/<pid>/fd` links`` | `split-declared` | `-` | `other network namespaces are not covered.` |

`split-declared`, never `ruled`: a `ruled` venue must be the fleet repo outside `.ufo/` or a
**non-tabi-authored** `*-verifier-spotcheck.md` line that *names the sibling*
(`check-adjacency.mjs:78-96`); no such ruling names kama or souji today, and a lane cannot rule on
itself. Nothing else changes: no `SOURCES.md` row, no claim, no counter, no citation.

**Verification — already run, on a scratch clone (tabi objects hardlinked read-only; the lane's own
gate script executed unmodified; sibling refs resolved against the live fleet).**

```
$ git clone --no-checkout tabi-shokunin $S/tabic ; # commit cand = f953c7f2 (parent 0081bfdb) via
  hash-object/read-tree/update-index/write-tree/commit-tree — no worktree, nothing touched in the lane
$ node <lane>/scripts/check-adjacency.mjs --repo $S/tabic --fleet /home/vgpnk/Projects/shokunin --at 0081bfdb
  → exit 0   verdict clean   rows 16   verified 16   findings []   selfRulings [2]
$ ... --at f953c7f2      (the two rows appended, all else identical)
  → exit 0   verdict clean   rows 18   verified 18   findings []   selfRulings [2]
```

Delta is exactly `+2` verified rows, `0` findings; `selfRulings [2]` is pre-existing (the row-16
integrator ruling at `corpus/lessons/round-16-verifier-spotcheck.md:138-142`), present in both runs.
Artifacts: `ev-07-gate-control.json`, `ev-08-gate-candidate.json`, `ev-10-candidate-commit.txt`.

**Risks.**
- `corpus/adjacency.tsv` + `SKILL.md` are shared surfaces: the integrator must own the landing, and
  the round-34 precedent's SKILL.md bullet is the better `tabi_ref` shape but **cannot be
  pre-verified** here (the line does not exist at `0081bfdb`). The table above is the variant
  verified clean *today with zero other edits*; swapping `tabi_ref` to a new SKILL.md line is a
  one-field change that re-runs the same gate.
- A `ruled` disposition would fail the gate; a row claiming kama "owns host egress" would create a
  new contested claim. Keep both rows to the mechanism split in §3.
- Log/bookkeeping: `LOG.md:1020` and `LOG.md:2273` both state "10 rows" as round-17 history (16
  today; round 34 added rows 15-18, `LOG.md:2418`); rule 31 wants an append-only correction line
  only if a current cell is quoted, which these are not.

**Affected axes.** adjacency 8 → improves, on the axis's own counter: the adjacency counter *is*
the ledger size (`LOG.md:1020`, round 17: "`corpus/adjacency.tsv` (10 rows) + `scripts/check-adjacency.mjs`; counter 0 → 10"), so this is `16 → 18` with two live overlaps dispositioned under rule 32 and the round-40 finding corpus-landed with pinned quotes; coverage — neutral, and the §4 gap is routed rather than absorbed; freshness — improves (a 2026-10-28 kama fact is now citable rather than lost); calibration — neutral (no claim, counter or verdict touched). No axis is harmed: nothing is
added to `SOURCES.md`, the S145 row, `claims.json` or any frozen byte.

---

## Limitations

- Read-only seat: I did not edit `corpus/adjacency.tsv`, `SKILL.md`, `SOURCES.md` or any lane file;
  the move above is a proposal with a pre-run gate, not a landing.
- The gate test used a clone whose commit I authored (`f953c7f2`); it certifies citation/venue
  resolvability, not bilateral agreement — which is precisely what `split-declared` claims.
- Both lanes churned during the seat (souji `d30476d → bb98c60 → 6024a76 → 131ea876`; kama
  `83c1c4a5` at round 40 → `7ee8cbdf`). Pins here are the values read at the moment shown in
  `ev-06-pins.txt`; the cited sibling commits are ancestors of the observed `refs/heads/master`, so
  later landings cannot invalidate the reachability leg.
- No quarantine seat duty, no URL fetch, no browser run, no measured C1 command: the frozen C1
  chain was read and hashed, never executed.
- The `/proc/net/tcp{,6}` row counts in §2 are a structural parse check of this host at one moment,
  not an observation of any session and not a claim of any kind.

VERDICT ok — nothing new in kama/souji since 2026-10-27 touches /proc/net parsing, socket ownership or process-tree identity (kama's ownership entry is byte-stable at 0c75c611/2026-10-21; souji holds no /proc/net material; the only new adjacent fact, kama's 2026-10-28 E12KillSwitch ppid-reparenting + `port_owned_by_child=None` evidence, converges on tabi's startTicks/exe binding); the S145-scoped observation must not cite a sibling — instead tabi's registry lacks rows for proc_pid_fd, proc_pid_stat and the tcp6 printer, routed as a coverage gap; provinces remain distinct (kama reads `local_address` as an admissibility gate on its own port plus a host-wide census, tabi reads `rem_address` for a session-scoped peer classification, verified byte-identical decoders 7/7); and the landable adjacency move — two `split-declared` rows for the kama ownership and souji fd-readlink/residue overlaps, missing while `QUALITY.md` rule 32 requires them — passes `check-adjacency.mjs` clean (16→18 verified rows, 0 findings) on a scratch clone.
