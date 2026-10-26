# RevLesson — round-32 lesson `## Mistakes` red-state audit (w2 falsify)

Item: `corpus/lessons/round-32.md` at `b234a58920134424e0d104f137311ff54a16d26b` (lane HEAD == REV; the
worktree lesson file is clean against HEAD — `git status --porcelain -- corpus/lessons/round-32.md` empty)
against `/home/vgpnk/Projects/shokunin/CORPUS.md` §"Rules added from the kaika campaign": one row per
mistake, `class · evidence pointer · captured-by · fix` (CORPUS.md:170-176), and "A fix is shown able to
fail before it counts. A claimed repair ships one red-before state in which the same command exits
non-clean for the named reason, with the fix as the only delta; the observed failure text is committed."
(CORPUS.md:177-179).

## Verdict

The lesson's `## Mistakes` table is complete for M1–M5 — every class (`stale-premise`, `survivor`,
`attribution`, `number-drift`, `provider`) is in the kaika vocabulary, and every row carries evidence
pointer, captured-by and fix — and four of the five fixes have committed red states that I reproduced
failing for exactly the named reason from committed bytes in a clean clone of REV; all four gate-row
fetch digests also reproduce byte-identical today. M1's red (`baseline/c2-J1-do-nothing.json`) counts
18 mismatches = 15 `m1-selftest-tally` + 3 `m4-nudge-state` at `SCORECARD.md:1473/1515/1576` (claimed
`inactive`, derived `active`), exit 1 per its provenance, and the green side passes at REV (mismatches
0, exit 0) with the landed corrections stating "the nudge was active". M2's red
(`measure/c1-distinct-red-green.txt`) reproduced value-for-value: exit 0 on the lane receipt, exit 1 on
the v2 duplicate-row, v3 same-transcript-path and v1 re-export-driver forgeries, each for its named
reason. M5's red (`measure/c1-socket-path-red-green.txt`) reproduced live: the pre-fix counter
(`2f8535c5`) fails `session not created: Chrome instance exited…` under a 77-byte TMPDIR while the
fixed counter (`5ad1fcbf` bytes = frozen digest) records 28 commands, and the two-commit diff touches
only `liveRecord`'s chromium TMPDIR choice. M4 has no red state for its named reason — its cited
receipt (`ExecC2Apply/counter-after.json`, mismatches 0) demonstrates the frozen counter *passes* the
defective draft — and the row discloses exactly that ("captured-by: none (instrument limit)"), so the
lesson is honest but the CORPUS red-state clause is met only by disclosure for M4's number-drift arm.
M3 has no red state because the misattributed item text never landed in a lane file; its committed
evidence (ScribeSrcClassic.md finding 2: 0 case-insensitive `websocket` matches in the dated classic
WD, re-verified against today's byte-identical fetch) supports the row. Gate rows S123–S126 are
complete (URL, access date, quote with location). Verdict: **holds**, with two minor evidence-chain
findings and three nits, none falsifying a claim.

## Evidence — commands and exit codes

Setup (one live clone per seat, in scratch):

```
$ git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse HEAD
b234a58920134424e0d104f137311ff54a16d26b                      # == REV
$ S=/fast/scratch/hyaku/tabi-r32/RevLesson
$ git clone -q --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"
$ git -C "$S/clone" checkout -q --detach b234a58920134424e0d104f137311ff54a16d26b
$ git -C "$S/clone" rev-parse --show-toplevel                 # == $S/clone ; status --porcelain → 0 lines
```

Counter bytes at REV equal `claims.json` `frozenDigests` (my own digests):

```
$ git -C lane show HEAD:scripts/check-bidi-runtime.mjs  | sha256sum → 2f25af5a3c63…16c393  (== frozen)
$ git -C lane show HEAD:scripts/check-selfassessment.mjs | sha256sum → 77b5c8ed503b…d4c6a9  (== frozen)
```

### M1 — stale-premise; fix = criterion 83 + class `m4-nudge-state` (v3)

Opened `baseline/c2-J1-do-nothing.json` (committed, tracked):

```
$ jq -c '[.counted[] | .class] | group_by(.) | map({k:.[0],n:length})' .ufo/waves/round-32/baseline/c2-J1-do-nothing.json
[{"k":"m1-selftest-tally","n":15},{"k":"m4-nudge-state","n":3}]          # 18 total, as the lesson states
$ jq -c '[.counted[] | select((.class//"")|startswith("m4"))] | map({doc,line,claimed,observed})' …
[{"doc":"SCORECARD.md","line":1473,"claimed":"inactive","observed":"active"},
 {"doc":"SCORECARD.md","line":1515,"claimed":"inactive","observed":"active"},
 {"doc":"SCORECARD.md","line":1576,"claimed":"inactive","observed":"active"}]
$ cat .ufo/waves/round-32/baseline/c2-J1-do-nothing.provenance
control=c2-J1-do-nothing / freeze=5ad1fcbf… / clone_head=5ad1fcbf… / clone_tree=ffd7ce56… / exit=1
```

Red fails for the named reason: the three counted m4 findings are exactly the lesson's cited lines
(`SCORECARD.md:1473`, `:1515`, `:1576`), claimed `inactive`, derived `active`; exit 1. (Precision note:
line 1473 ends "…Saturation 8 / window 3; nudge" and `inactive` wraps onto 1474; the counter attributes
the finding to 1473, and the lesson's pointer matches the counter's attribution.)

Green side at REV, same command (run in my clone, `TMPDIR` under my scratch):

```
$ cd "$S/clone" && node scripts/check-selfassessment.mjs --rev HEAD --json ; echo exit=$?
exit=0  {"rev":"b234a589…","mismatches":0,"clean":true,"couldNotEvaluate":106,"superseded":39}
```

Captured-by claim verified: `git show 4181fff…:corpus/QUALITY.md | grep -c -i -e nudge -e stagnation`
→ `0`, grep exit 1 (no nudge criterion existed at the freeze). Fix landed as described:
`grep -n 'nudge was active' SCORECARD.md` → lines 1612, 1618, 1622, each superseding 1473/1515/1576 and
citing that round's own axes line (1472 / 1514 / 1574-1575, which I read: depth 8 … adjacency 8).

**M1: holds.** Red committed, fails for the named reason, green at REV.

### M2 — survivor; fix = criterion 86 + plain distinct counts (`measure/c1-distinct.mjs`)

Opened `measure/c1-distinct-red-green.txt` (committed, tracked): green lane receipt (`ok: true`,
exit 0) + three red legs (v2 `distinctRowIds 1, duplicateListings 15`; v3 `distinctTranscriptPaths 1,
distinctTranscriptDigests 0`; v1 `driverReexports true, driverSha256 89c452ef…`), each exit 1. I re-ran
all four legs in my clone from the committed inputs (forgery blobs are tracked at
`w1/CritC1Forgery/blobs/`):

```
$ node .ufo/waves/round-32/measure/c1-distinct.mjs "$C" "$C/corpus/knowledge/webdriver-bidi-runtime-round-32.md" "$C/corpus/evidence/round-32/bidi/receipt.json"
→ green block identical to the committed one (16 distinct ids, 2 distinct transcript digests,
  driverSha 55dbef88… ≠ gate, imports only FIXTURE_SHA256/VIEWPORT/serveFixture, ok true)   exit=0
$ node … "$B/v2-entry-duplicates.md" + lane receipt   → distinctRowIds 1, duplicateListings 15   exit=1
$ node … lane entry + "$B/v3-receipt-same-path.json"  → distinctTranscriptPaths 1, digests 0     exit=1
$ node … lane entry + v1-receipt.json (driver field → "$B/v1-driver-reexport.mjs")
                                                      → driverReexports true, sha 89c452ef…     exit=1
```

Every number matches the committed file (my rerun outputs are copied to my output dir as
`c1-distinct-rerun-*.json`; in my v1 leg the driver path string is absolute where the committed block
shows the lane-relative path — same digest `89c452ef…`, same verdict). Criterion 86's red-state
pointer (`w1/CritC1Forgery.md`, four constructions reaching admitted 16 under the frozen gate) is
committed and matches the lesson's M2 narrative.

**M2: holds.** Red committed and reproduced for the named reasons. (Coverage note → finding 2.)

### M3 — attribution; fix = S126 scoped to the classic prompt handler, `webSocketUrl` grounded in S124 §4.1

No red state exists and none is possible-before: the misattributed w1 item text ("W3C WebDriver
classic: the `webSocketUrl` capability …") never landed in a lane file, so there is no command whose
red-before could be committed; the row records capture by the CORPUS quote rule before any row was
written. Evidence opened: `w1/ScribeSrcClassic.md` (tracked) — finding 2 records the measured absence
(0 case-insensitive `websocket` occurrences in the dated classic WD bytes, 0 `websocketurl` in the
editor's draft, with fetch receipts: 1,882,653 B / `929f2f0b…`, 1,882,259 B / `d49b731e…`). I
re-verified the absence against today's byte-identical S126 fetch: `grep -c -i 'websocket'` → 0
(grep exit 1). The landed S126 row (SOURCES.md:139-140) scopes classic to `unhandledPromptBehavior`
and the §7 additional-capability slot; the lesson's Gate table grounds `webSocketUrl` in S124 §4.1.

**M3: holds** (no red state; none applicable — pre-landing catch, honestly recorded).

### M4 — number-drift; fix = landed corrections citing each round's own axes line; criterion 83 names inputs

Opened `w1/ExecC2Apply/counter-after.json` (committed, tracked): `{"rev":"363be55bb36cb77e0dce644c807804e1de1aeb40",
"mismatches":0,"clean":true,…}` — the frozen counter scores the *draft* corrections clean even though
the draft gives rounds 29–31 the round-32 axis inputs (all 9 but adjacency 8; the draft is committed at
`w1/ExecC2Apply/scorecard-block.md`, and the lane's true inputs at `SCORECARD.md:1472/1514/1574-1575`
read depth 8 …). I verified the counter bytes used were the frozen ones
(`ExecC2Apply/verify.txt:66,68` == `frozenDigests`). So for M4's named reason (axis-input drift) the
same command does **not** exit non-clean — there is no red state, and the cited receipt proves the
instrument cannot produce one. The M4 row says exactly this ("The frozen counter scores the draft
clean …: m4 supersession checks the citation and the state word, not the inputs"; captured-by "none
(instrument limit)"), so nothing is fabricated — but per CORPUS.md:177 the fix is shown able to fail
only by disclosure, not by a committed red. The landed corrections themselves (SCORECARD.md:1612-1622)
cite each round's own axes line as the fix describes, and their red-before is M1's J1 receipt.

**M4: holds-by-disclosure; finding 1 below on the receipt chain.**

### M5 — provider; fix = `5ad1fcbf` hands chromium a short TMPDIR

Opened `measure/c1-socket-path-red-green.txt` (committed, tracked): 70-byte TMPDIR; `2f8535c5` →
`ERR new session failed: "session not created: Chrome instance exited. …"`; `5ad1fcbf` → `ok cmds=28`.
Fix-as-only-delta verified at source level:

```
$ git diff --stat 2f8535c5… 5ad1fcbf…
 scripts/check-bidi-runtime.mjs | 22 ++++++++++++++++++----     # 1 file; only liveRecord's chromium
                                                                # TMPDIR choice + readdirSync import + error suffix
```

Live reproduction in my clone (runner `run-live.mjs` copied to my output dir; full transcript
`m5-socket-path-repro.txt`):

```
$ export TMPDIR=<77-byte dir under my scratch>
$ node run-live.mjs <2f8535c5 bytes>            # red
ERR new session failed: "session not created: Chrome instance exited. Examine ChromeDriver verbose log to determine the cause."
$ node run-live.mjs <HEAD bytes, sha 2f25af5a…> # green
ok cmds=28 events=14
```

The red text is byte-identical to the committed receipt and the named reason (chromium's singleton
socket under TMPDIR overflowing the 108-byte unix-socket limit) is stated in the fixed counter's own
comment. `pgrep -fa 'chromedriver|chromium' | grep -v earlyoom` after both runs: no lines.

**M5: holds.** Red committed, reproduced live for the named reason, fix is the only delta.

## Gate rows — completeness and byte-identity

All four rows carry URL, access date and a located quote (CORPUS.md:42 "A quote names its location");
word counts are within the table's ≤25-words promise. I re-fetched all four today (log:
`w2/RevLesson/fetch-log.md`; raw small fetches copied as `fetch-rfc9309.txt`,
`fetch-session_commands.cc`):

| row | my fetch (UTC, status, bytes) | sha256 vs row | quote location check |
|---|---|---|---|
| S123 | 2026-10-26T17:22:51Z, 200, 25265 B | `f633915d…` **identical** | line 6 "Request for Comments: 9309"; line 11 "September 2022"; `June 2022` only at 554/559 ✓ |
| S124 | 2026-10-26T17:25:08Z, 200, 4235856 B | `dc1077db…` **identical** | Abstract sentence exact match (1); §4.1 sentence at HTML line 2216 (wrapped); revision `f922e6af…` present ✓ |
| S125 | 2026-10-26T17:25:08Z, 200, 90944 B b64 (decoded 68207) | `7b40e94…` **identical** | lines 287-289 = `if (session->web_socket_url) { caps.Set("webSocketUrl", "ws://" + session->host + "/session/" + session->id);` ✓ |
| S126 | 2026-10-26T17:25:08Z, 200, 1882653 B | `929f2f0…` **identical** | lines 11306-11307 `ignore` / "All simple dialogs…"; lines 1976-1980 `unhandledPromptBehavior` / `Defaults to "dismiss and notify"`; `websocket` count 0 ✓ |

Gate rows: **complete** (S124's date-only access cell → nit 3).

## Findings (severity-ordered)

1. **minor — M4's receipt chain is not reproducible from the lane.** `ExecC2Apply/counter-after.json`
   records `rev 363be55bb36cb77e0dce644c807804e1de1aeb40`, a scratch-clone commit that does not exist
   in the lane repo (`git cat-file -t 363be55…` → "Not a valid commit name"; `merge-base --is-ancestor`
   fails). `ExecC2Apply/verify.txt:2-4` records the clone path and rev but no tree digest, while the
   round's own routed-defect-5 fix pattern (`claims.json` priorClosure; `baseline/*.provenance`) records
   commit AND tree digest. The counter bytes are pinned (verify.txt:66,68 == frozenDigests; I verified
   the HEAD digests myself), so the instrument-limit claim stands, but the mismatches-0 reading cannot
   be re-run against a reproducible tree. Smallest append-only fix: record the draft tree's digest
   beside the rev in a round-report note or next-round erratum (the draft content itself is committed
   in `scorecard-block.md`/`corrections.patch`).
2. **minor — M2's committed red-green covers 3 of the 4 named constructions.**
   `measure/c1-distinct-red-green.txt` has legs for v2 (duplicate rows), v3 (same path twice) and v1
   (re-export driver); the fourth construction named in the lesson and in CritC1Forgery.md (one real
   run cited as two byte-identical copies, v4) is red by the same distinct-digests rule
   (`distinctTranscriptDigests 1 ≠ transcripts 2`) but has no committed leg in the file. The lesson's
   sentence claims only "red on the v1/v2/v3 forgeries" — accurate as written. Smallest append-only
   fix: append a v4 leg to the red-green file at its next touch.
3. **nit — S124's gate-row access cell is date-only** ("2026-10-26", no time-of-day) while S123/S125/
   S126 carry UTC timestamps. The binding rule (quote names its location) is met and the digest
   reproduces byte-identical; cosmetic.
4. **nit — M3's evidence pointer "F2" is positional.** `ScribeSrcClassic.md` numbers its findings
   "1." / "2." with no "F" prefix; finding 2 is the `webSocketUrl` misattribution with the 0-match
   measurements. The pointer resolves by position, not by label.
5. **nit — red-green v1 block's parenthetical.** The committed block header says "lane transcripts
   substituted for path resolution", but the block's numbers (`distinctTranscriptDigests 0`) show the
   v1 transcript paths were left unresolved; my no-substitution rerun reproduces every number including
   driver digest `89c452ef…`. Wording inside a committed raw output; the lesson does not repeat it.

## Residual risk / verification gaps

- I did not re-run the full C1 counting command with `--live` against the lane receipt (the L1's
  after-measurement owns that); my M5 legs exercised the same `liveRecord` path and my C2 green at REV
  passed, so the browser path is independently exercised.
- `c2-J1-do-nothing.json`'s junk tree is not reproducible from the lane (by design, routed defect 5);
  I verified its internal consistency (counted histogram 15+3, provenance `exit=1`, clone tree
  `ffd7ce56…` recorded) and the green side at REV.
- I did not rebuild ExecC2Apply's draft tree from `corrections.patch` to re-run counter-after (finding
  1 covers the gap).

## Honesty / bounds

- Every command above was run by me and its output/exit pasted; nothing inferred.
- Network: 4 read-only HTTPS GETs of public spec/doc pages (rfc-editor.org, chromium.googlesource.com,
  w3.org ×2), logged with URL/UTC/status/bytes/sha256 in `fetch-log.md`. No logins, cookies,
  credentials, API calls or session material; browsers navigated loopback URLs served by the counter's
  own `serveFixture()` only.
- Browser: 2 `liveRecord` runs (red + green) via the counter's own spawn/finally cleanup; post-run
  `pgrep -fa 'chromedriver|chromium'` shows no process of mine (only `earlyoom`, whose argv mentions
  chromium in a `--prefer` regex).
- Tooling: nothing installed or upgraded.
- Writes: this report, my output dir `w2/RevLesson/` (9 receipt files), scratch under
  `/fast/scratch/hyaku/tabi-r32/RevLesson` (deleted before yield). No lane tracked file, lane git
  index, jj state, fleet repo or sibling lane touched; no commits anywhere (all reruns read committed
  bytes).
