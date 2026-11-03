# R61Sentinel — guard report (tabi round 61, wave w1)

Seat: `R61Sentinel` (leaf; no dispatch, no background services, no VCS mutation).
Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Fleet root read-only: `/home/vgpnk/Projects/shokunin`.
Frozen authority read first and in full: `.ufo/waves/round-61/claims.json`
(sha256 `d73f8a249d422749bdfcce16926394180b4e1fa75099cff6dcd7f11bd67a567e`; 99 lines).
Write scope used: `.ufo/waves/round-61/w1/R61Sentinel/` (this file + `evidence/`) and
`/fast/scratch/hyaku/tabi-r61/R61Sentinel` (removed at yield). Nothing else was written.

Final scan: 2026-11-03T20:18:10-03:00, after all 11 seat reports landed
(`w1/R61*.md` count 10 seat reports + this seat's, `w1/*/report.md` present per seat).
Window graded: `-newermt '2026-11-03 19:50'` (round window start fixed by the wave spec).
Harness: `guard.py` (python3, read-only) — full machine output retained at
`R61Sentinel/evidence/guard-scan.json`.

Authority posture: guards G1–G4 are graded exactly as the seat item states. Nothing below widens a
frozen predicate; the frozen snapshot and claims were **not** edited by this seat.

---

## G1 — fetch-guard compliance (receipts under `.ufo/waves/round-61/sources/`) — **PASS**

`sources/` holds 14 files: 3 receipt JSONs, 3 staged payloads, 3 response-header dumps,
3 quote-extract JSONs, 1 proposed row, 1 row-gate log.

Command: `ls -la .ufo/waves/round-61/sources/` → exit 0.
Field check: each receipt parsed as JSON and tested for `url`, `finalUrl`, `finalHost`,
`numRedirects`, `httpStatus`, `bytes`, `sha256`; staged payload re-hashed from disk.

```
s164-fetch-receipt.json   url=https://www.w3.org/TR/pointerevents/            finalHost=www.w3.org            numRedirects=0  httpStatus=200  bytes=948439   sha256=ed503a5e0a6becf0898c0156bec45f0491132dab75cbebb73a14552e9e3318b8
s153-reopen-receipt.json  url=https://raw.githubusercontent.com/.../browser_protocol.json  finalHost=raw.githubusercontent.com  numRedirects=0  httpStatus=200  bytes=1423170  sha256=d6737c31f268ed74e65dde393006dd9c590a713febd2361d734722eb059f31e7
s161-reopen-receipt.json  url=https://www.w3.org/TR/uievents/                finalHost=www.w3.org            numRedirects=0  httpStatus=200  bytes=920762   sha256=8ded5eaf4f190b13c59582d5e92b81d3585112dde963d71d65d8e5991212b918
```

- staged-payload byte counts and sha256 recomputed from disk: all three match their receipts
  (1,423,170 / 920,762 / 948,439 B; digests above). Response headers (`*.hdr`) show `HTTP/2 200`,
  no `3xx`; the S153 header carries `content-length: 1423170`.
- final host == cited host for all three (`hostMatches: true` in each receipt).
- **Beyond the guard**: all 30 verbatim quotes were re-verified against the staged bytes —
  19 (S164) + 8 (S153) + 3 (S161) quote objects; each quote's own `sha256` matches its `raw`
  text and each `raw` locates at its recorded `rawLine` (first line contained in the recorded
  line, following lines contiguous; 14 of 19 S164 quotes are full-line-exact). Machine receipt:
  `R61Sentinel/evidence/quote-audit.json` (`allQuotesVerified: true`). Zero fabricated quotes.
- re-open anchors: S153 `d6737c31…` equals the round-56/57 re-open digest already recorded in
  `corpus/SOURCES.md` (`1,423,170 B`); S161 `8ded5eaf…` equals the recorded round-55/60 digest
  (`920,762 B`). Both re-opens are byte-identical, matching the scout's verdict.
- S164 ground: staged page names `Pointer Events — Level 4`, `W3C Working Draft`, `08 October 2026`
  (`/TR/2026/WD-pointerevents4-20261008/`); `isTrusted` occurs exactly 3×, all as cross-references
  to `https://dom.spec.whatwg.org/#dom-event-istrusted` — an absence-of-definition finding the
  scout reports as such, not a failure.

No G1 flag.

## G2 — write-scope audit — **PASS on lane-tree paths; 2 outside-lane MAJOR flags (attributed)**

Command: `find /home/vgpnk/Projects/shokunin/tabi-shokunin -newermt '2026-11-03 19:50' -type f -not -path '*/.git/*' | sort` → exit 0; 294 files.

```
lane-tree files with mtime > 2026-11-03 19:50: 294
- inside .ufo/waves/round-61/** or the one runner scripts/chrome-cdp-loopback-round61.mjs: 258
- VCS internals (.jj/ — lane housekeeping; HEAD unchanged at 7032914): 36
- other lane-tree paths: 0
```

- 0 lane-tree paths outside `.ufo/waves/round-61/**` and the one named runner file.
  No corpus/, SCORECARD.md, LOG.md, MANIFEST.json, .ufo/state/, corpus/SOURCES.md,
  corpus/lessons/, corpus/knowledge/ write by any seat (`git status --porcelain` shows no such
  tracked file modified; all round-61 paths are untracked additions except the one file in G5).
- outside the lane repo, `find /home/vgpnk/Projects/shokunin -maxdepth 3 -newermt '2026-11-03 19:50'
  -type f -name '*tabi*'` → 2 paths, both **MAJOR FLAG** by the literal rule, both attributed to
  the orchestrator's round-open rather than to any seat:

```
2026-11-03 19:50:27  .ufo/prompts/tabi-round-61.md      (the L0 dispatch prompt; mtime = window start)
2026-11-03 19:50:27  .ufo/state/tabi.report-baseline    (orchestrator report baseline)
```

  Both predate w1 dispatch (`w1-dispatch.json` 20:02:18) by ~12 minutes and seat start (20:03);
  no seat could have produced them. They are orchestrator infrastructure, not seat writes —
  recorded here because the guard's rule is literal.
- sibling repos: `git -C <each>/ status --porcelain | grep -i tabi` over all 20 sibling lanes →
  no output (grep exit 1 per repo); `git -C /home/vgpnk/Projects/shokunin status --porcelain |
  grep -i tabi` → no output. **No sibling lane or fleet-root tracked file names tabi.**

## G3 — port / process hygiene — **PASS**

Commands: `ss -ltn` → exit 0; `ps -eo pid,ppid,etime,args | grep -F
'user-data-dir=/fast/scratch/hyaku/tabi-r61' | grep -v grep` → grep exit 1 (0 lines);
`ps -eo pid,args | grep -Ei 'chrom(e|ium)'` → exit 0.

```
listening TCP sockets: 35
- listeners in the round's ephemeral range (19xxx / 1808x): none
processes with --user-data-dir under /fast/scratch/hyaku/tabi-r61: 0
all chromium-named processes: 5 — earlyoom (PID 1368), 1Password crashpad (2854),
  Codex browser crashpad (12181, 12183), alma crashpad (3769671); none launched by this round
```

- no survivor whose profile dir names this round: **0**. No `pkill -f` was used anywhere by this
  seat; the round's runner kills by discovered PID (`process.kill(pid)` on PIDs whose
  `/proc/<pid>/cmdline` contains its own launch token / profile dir / crash-db path; verified by
  reading `scripts/chrome-cdp-loopback-round61.mjs` lines 113–131).
- closure proof present in the one live browser receipt this round produced
  (`w1/R61Exec2/smoke/receipt.json`, sha256 `3ad62723…`):
  `teardown = {postKillSweepCount: 0, survivors: [], portProbes: {fixture: closed, devtools: closed},
  postKillCurl: {fixture: 7, devtools: 7}}`; runner `argv` binds
  `--remote-debugging-address=127.0.0.1` with a throwaway `--user-data-dir` under scratch and
  `HOME`/`XDG_CONFIG_HOME` redirected; both ports are bind-prechecked on `127.0.0.1` before launch
  and the fixture server is closed before the probes.
- scratch root still holds other seats' directories at scan time (their cleanup is their item);
  this seat removed its own scratch.

No G3 flag.

## G4 — high-guard rule (r57): no web fetch without a receipt — **PASS (0 receiptless fetch claims); 6 literal-rule matches disclosed**

Method: every external URL string in every seat doc (`w1/*.md`, `w1/*/report.md`, `w1/*/*.md`,
excluding this seat's files) compared against the receipt set (`url`/`finalUrl`, host-level
fallback), then each unmatched occurrence classified by context (fenced quote block / `href=`
markup / prose).

```
docs scanned: 23
receipt-covered citations: R61Scout.md 8/12, R61Scout/report.md 8/12, R61Scribe.md 1/2,
  R61Scribe/{knowledge,lesson,s164}-draft 1/2 each
uncovered, quoted-markup only (no receipt needed): infra.spec.whatwg.org/#user-agent (fenced,
  L199+L255), webidl.spec.whatwg.org/#idl-DOMString (fenced, L95), webidl.spec.whatwg.org/#idl-long
  (fenced, L173)  [all inside quoted S164 bytes]
uncovered, prose mention: https://dom.spec.whatwg.org/#dom-event-istrusted — 9 line occurrences in 6 documents
  (R61Scout.md L266/L276, R61Scout/report.md L266/L276, R61Scribe.md L44,
   knowledge-draft.md L16, lesson-draft.md L24/L39, s164-row.md L26)
```

Context of the single uncovered URL string (quoted from the scout report):

```
L266: Each occurrence is an `<a>` whose href is `https://dom.spec.whatwg.org/#dom-event-istrusted`, wrapping ...
L273 (fenced): <a data-link-type="attribute" href="https://dom.spec.whatwg.org/#dom-event-istrusted"><code>isTrusted</code></a>
L276: Note: isTrusted appears only as a cross-reference to https://dom.spec.whatwg.org/#dom-event-istrusted; this spec does not define it
```

Verdict: this is a **cross-reference target inside the receipted S164 bytes** (the DOM Standard link
the Pointer Events page itself carries), reported by the scout precisely to record that the pointer
spec does not define `isTrusted`. It is not a fetch claim and no seat obtained evidence from it;
no DOM Standard bytes were fetched (no such staged file exists). Under the literal r57 wording it is
counted as a flag in the list below (class: quoted cross-reference, non-fetch). **0 receipts are
missing for anything a seat fetched.** No URL in any seat report names a source the round fetched
outside `.ufo/waves/round-61/sources/`.

## G5 — frozen-input byte integrity (sentinel extension, not one of the four named guards) — **MAJOR FLAG**

The frozen snapshot is a tracked file at the claims-freeze commit. Its worktree bytes were changed
during the wave; the committed bytes are the claims pin. Commands and outputs:

```
$ git show HEAD:.ufo/waves/round-61/c1/snapshot-r61.tsv | sha256sum
8b175b27ca00e212b9e4cd776542c132d812f2e9e193bfb3083f14cc251efc27  -        # 1153 bytes, header "lane<TAB>"
$ sha256sum .ufo/waves/round-61/c1/snapshot-r61.tsv
c41599788d7a917d6a6760842c19202d36e7c9229e51ae292eb1f22282aa6a7c            # 1157 bytes, header "lane<TAB>head"
$ stat -c '%y %s' .ufo/waves/round-61/c1/snapshot-r61.tsv
2026-11-03 20:11:12.254416009 -0300 1157
$ git status --porcelain
 M .ufo/waves/round-61/c1/snapshot-r61.tsv
$ diff <(git show HEAD:...snapshot-r61.tsv) .ufo/waves/round-61/c1/snapshot-r61.tsv
1c1
< lane
---
> lane	head
```

- Independent reconstruction (replace `lane\thead` with `lane\t` in the worktree file) reproduces
  sha256 `8b175b27…` exactly, 1153 bytes — so the **only** change is the header's second cell;
  all 20 lane rows are byte-identical. Evidence copies: `R61Sentinel/evidence/
  snapshot-r61-committed-7032914.tsv` (sha `8b175b27…`, `cmp`-identical to the reconstruction).
- Consequence, measured (`node .ufo/waves/round-60/counters/c1-wide-screen-r60.mjs --scope wide
  --snapshot <file> --json`):
  - on the **frozen committed bytes** → exit **2**, `bad snapshot header ... "lane\t" (expected "lane\thead")`;
  - on the **current worktree bytes** → exit **0**, `predicate true`, `roster 20`, `enumeratedMd
    = screenedMd = 85775`, `unscreenedMd 0`, `unresolvableHead 0`, `rowMismatch 0`,
    `snapshotSha256 c4159978…`.
  So frozen claim C1(d) is **unsatisfiable on the frozen bytes** and becomes satisfiable only on
  post-freeze bytes (this is the same defect the critic and reviewer reported independently).
- Attribution: the lane bytes are identical to `R61Critic`'s scratch artifact
  `/fast/scratch/hyaku/tabi-r61/R61Critic/snapshot-r61-headerfix.tsv` (created 20:04:24, sha
  `c4159978…`); the lane write is 20:11:12. `R61MutC1` independently observed the same transition
  at the same mtime (its finding I6) and did not write the file. **The writer is not provable from
  mtimes**; what is provable is that a frozen, sha-pinned, tracked control was edited mid-wave and
  that `claims.json` carries `preDataCorrections: []`.
- Smallest remediation: the integration owner either (a) restores the committed blob
  (`git checkout -- .ufo/waves/round-61/c1/snapshot-r61.tsv`) and re-declares C1(d) (frozen bytes →
  K4 fires; the clause is false as frozen), or (b) records an explicit pre-data correction in
  `claims.preDataCorrections` (old sha `8b175b27…` → new sha `c4159978…`, one header cell, all rows
  identical, wide-screen re-run exit 0) before the data pass, so the control pin and the measured
  bytes agree. Until one of those is done, the round's control pin is false.

---

## Flag list

| # | guard | class | item | attribution / note |
|---|---|---|---|---|
| 1 | G2 | MAJOR (literal) | `/home/vgpnk/Projects/shokunin/.ufo/prompts/tabi-round-61.md` written 19:50:27 | orchestrator round-open, 12 min before w1 dispatch; not a seat |
| 2 | G2 | MAJOR (literal) | `/home/vgpnk/Projects/shokunin/.ufo/state/tabi.report-baseline` written 19:50:27 | orchestrator round-open; not a seat |
| 3 | G4 | FLAG (literal) | `https://dom.spec.whatwg.org/#dom-event-istrusted` cited in 6 seat docs with no receipt | quoted cross-reference inside the receipted S164 bytes; non-fetch; no DOM bytes were fetched |
| 4 | G5 | MAJOR | frozen control `.ufo/waves/round-61/c1/snapshot-r61.tsv` modified at 20:11:12 (`8b175b27…` → `c4159978…`, header cell only); `claims.preDataCorrections` empty | writer unproven; lane bytes == R61Critic headerfix scratch copy; C1(d) unsatisfiable on frozen bytes (measured) |

G1: 0 flags. G3: 0 flags. No other flag was found.
