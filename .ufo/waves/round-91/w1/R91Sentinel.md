# R91Sentinel — bounds and provenance audit (tabi r91, wave w1)

Seat `R91Sentinel` (sentinel, leaf). Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`, base
`b1d8f07b`, audited tip `249b7d0cf0fa13d09cf8da6a724608e9d8b099d1`, scored receipt nonce
`tabi-r91-l1-1d073adc0b8d`. Audit window 2026-11-08 13:16–13:23 local (16:16–16:23Z); the wave was
live throughout, so every hash below is stamped with the moment it was read.

Tooling: none installed, none upgraded, no pacman/uv/npx, nothing written to `~/.local/bin` or any
PATH directory, no host sysctl/service touched. Used only preinstalled `bash`, `git`, `node`
v24.21.0, `gawk`, `sha256sum`, `jq`. Scratch root `/fast/scratch/hyaku/tabi-r91/R91Sentinel/`,
deleted before yield; the six evidence files copied under `w1/` are named at the end.

Read-only throughout: the only executions were the two frozen counters (`--json`, no `--selftest`),
the fleet census in `validate` mode (writes stdout only), and pure `sha256sum`/`git show`/`jq`.
No mutation was made in the lane or the fleet root. This report is the only file I wrote there.

Artifacts as read (sha256):

| artifact | sha256 |
|---|---|
| `.ufo/waves/round-91/freeze.txt` | `f0807df5c1c78970cddb717dcdd0db3a96799f8051f4a7b6a104cc8dbbde7928` |
| `corpus/evidence/round91/chromium-showpicker-proxy/receipt.json` | `15e2167ea64b638e28fd8d8b3bba3170bd4d48becc2dc27c54039885c39d35c8` |
| `.ufo/waves/round-91/census-start.txt` | `231e9bd738a8ced5fc63367da2fdc740c8f41bac1b963eb6a840b24579904c1a` |
| `.ufo/waves/round-91/census-end.txt` | `c3db7057f243bffcab6dc4836a9bada414d368703265b9cc04dbb3de9baf16f7` |
| `.ufo/waves/round-91/scored/selftest.json` | `78d1e5aa1c3db73aac7d733dc30d0bcefc46c07ab04e368a5d1e6e9bd538dc0c` |
| `.ufo/waves/round-91/scored/drift-before.json` | `ec87802b36a06c0afce6635def6efdfcb1922f392720d4c1638c1e2e5723c3c7` |
| `.ufo/waves/round-91/claims.json` **at HEAD (pre-amendment)** | `f55a48866e66d07ce2bdc4106280d6c92232e572c57eb7623a9b43c8ecc1237b` |
| `.ufo/waves/round-91/claims.json` **worktree at 13:19:45** | `9e204225a456b8b1fcebfef29826ca99ff3141dd97d60587a9b01d08e40c1d00` |

## Verdict table

| # | item | verdict | note |
|---|---|---|---|
| 1 | freeze.txt pins vs committed bytes | **PASS** (9/9) | freeze.txt is the D3 freeze, not D1 — see F3 |
| 2 | receipt identity | **PASS** | all 8 identity properties hold; fixture pins independently recomputed |
| 3 | census artifacts | **PASS** | both re-derived byte-identically, exit 0, rows 224/226 |
| 4 | no out-of-lane write | **PASS** (time-stamped) | no r91/tabi path outside the lane |
| 5 | six r90 §8 corrections append-only | **PASS where required, 3 sanctioned in-place rewrites** | strict append-only is false for §8 items 1–2; see F5 note |
| 6 | no cookie/token/session material; proxy origin | **PASS** | code-verified allowlist; declared limit stands |
| 7 | prior receipts independent | **PASS** | disjoint nonces/ports/tokens/devtools ids |

Four findings follow (F1 high, F2 medium, F3 medium, F4 medium, F5 low). None of them proposes
amending a predicate, counter, pin, prior, threshold or kill rule; each is a provenance or
gate-strength observation about bytes that exist.

---

## 1. freeze.txt sha256 vs committed bytes — PASS (9/9), with a freeze-identity defect (F3)

Command (pins compared against both the worktree and the HEAD blob, twice: 13:16 and again at
16:22:34Z):

```
cd tabi-shokunin
for f in $(head -9 .ufo/waves/round-91/freeze.txt | awk '{print $2}'); do
  w=$(sha256sum "$f"|cut -d' ' -f1); c=$(git show HEAD:"$f"|sha256sum|cut -d' ' -f1)
  p=$(awk -v p="$f" '$2==p{print $1}' .ufo/waves/round-91/freeze.txt); ...
```

Observed: `OK` for all nine at both times — `chrome-cdp-showpicker-proxy-round91.mjs`
`343eb0f2…e33015`, `check-showpicker-proxy-round91.mjs` `f2f052f2…b03e`,
`negatives-showpicker-proxy-round91.mjs` `6475f056…78cb`, `kill-power-proxy-round91.mjs`
`570cffbf…5910`, `selftest-r91-gates.mjs` `988c18e5…7bc26`, `check-record-drift-round91.mjs`
`e2e51c6b…ffda3`, `probe4.json` `12b5ae6f…2fce`, `probe5.json` `2d76b87d…4d69a`,
`prior-set.txt` `78ffc632…2701`; worktree = HEAD blob for every one (`git diff --stat HEAD --
scripts/ .ufo/waves/round-91/controls/` touches only the two unpinned `nowork-*.json`, see F4/F5).
The instrument bytes did not move during the wave: the same nine `OK` at 16:22:34Z.

The freeze file's own digest line also recomputes: `head -6 freeze.txt | sha256sum | cut -c1-12` →
`12cbe8a0267f`, matching the comment. But see F3 for what that comment claims.

## 2. Receipt identity — PASS

```
jq -r '{schema,lane,nonce,driverSha256,startedAt,finishedAt}' corpus/evidence/round91/chromium-showpicker-proxy/receipt.json
jq -c '.fixture,.ports' <receipt>
jq -r '"legs=\(.legs|length) failures=\(.failures|length)"' <receipt>
```

Observed: `schema=tabi-chrome-cdp-showpicker-proxy-r91`; `lane=tabi-shokunin` (equals the lane
directory basename); `nonce=tabi-r91-l1-1d073adc0b8d` (equals the ticket nonce);
`driverSha256=343eb0f2…e33015` (equals the freeze pin); fixture `parent.sha256=a6ecf367…8bf0`,
`same.sha256=01380a98…fe36`, `child.sha256=01380a98…fe36` (all three equal the ticket pins; same and
child are byte-identical documents served from `127.0.0.1:19961/same.html` and
`127.0.0.1:19963/child.html`, exactly as the design says); ports `{http:19961, cdp:19962,
child:19963}` (three distinct integers, all three used in `argv`/origins); `legs=15`,
`failures=[]`; every leg's `errors` is empty and the leg order equals the frozen plan (counter
`leg-order`).

Fixture pins are **not** merely self-asserted: I recomputed them from the frozen driver bytes plus
the scored nonce and ports (extract `const childHtml = (parentOrigin) => \`…\`` and
`const PARENT_HTML = \`…\`` from the pinned driver, substitute `__RUN__` → nonce, hash):

```
recomputed parent a6ecf367adcfd31e3e54e82794db09e2f9845b8d910eb465ab47ca022b778bf0
recomputed same   01380a98976c3fd8963a907a70f1f14d4d84a7b0eb94d088995919331775fe36
recomputed child  01380a98976c3fd8963a907a70f1f14d4d84a7b0eb94d088995919331775fe36
match receipt    true true true
```

Script and output: `w1/R91Sentinel-refixture.mjs`, `w1/R91Sentinel-fixture-recompute.txt`.

The frozen counting command scores clean, exit 0, `checkCount 30`, `findings []`, all 30 checks
true (run from scratch with the absolute lane, `--json`):

```
node tabi-shokunin/scripts/check-showpicker-proxy-round91.mjs --lane <ABS> --receipt corpus/evidence/round91/chromium-showpicker-proxy/receipt.json \
  --expect-driver-sha256 343eb0f2… --expect-nonce tabi-r91-l1-1d073adc0b8d \
  --expect-parent-sha256 a6ecf367… --expect-same-sha256 01380a98… --expect-child-sha256 01380a98… \
  --prior-set .ufo/waves/round-91/controls/c1/prior-set.txt --json
→ {"verdict":"clean","checkCount":30,"findings":[]}  EXIT=0
```

Do-nothing controls, re-run against the **committed** control receipts (extracted with `git show
HEAD:` into scratch, so the result does not depend on the in-flight worktree rewrites of F5):

```
committed nowork-proxy-flip.json     → EXIT 1, findings [nonce-expected, fixture-pins, law, proxy-law, prior-set, replay-identity]
committed nowork-post-removed.json   → EXIT 1, findings [nonce-expected, fixture-pins, send-log-allowlist, plan-calls, prior-set, replay-identity]
nonexistent receipt                  → EXIT 2, verdict "unreadable", findings [receipt-unreadable]
r90 receipt under the r91 counter    → EXIT 1, findings start with [schema, nonce-shape, nonce-expected, receipt-fields, driver-pin, fixture-pins, …]
```

The claimed control ids (`law`/`proxy-law`; `send-log-allowlist`/`plan-calls`; exit 2; `schema`)
are each present. Calibration note: the control reds are broad (six ids each) because the control
receipts carry their own nonce/ports, so a control proves "red", not "red for exactly the intended
law". The named ids are among them, which is what the claims assert.

## 3. Census artifacts — PASS

The census is produced by the fleet script `scripts/sources-census.sh` in `validate` mode. Both
artifacts were re-derived and diffed against the lane copies (summary lines `rows=`/`census-exit=`
stripped; the end-run's scratch prefix normalised):

```
bash scripts/sources-census.sh validate --root /fast/scratch/hyaku/tabi-r91/census-root --today 2026-11-08 tabi  → EXIT 0, 38 lines, diff EMPTY
bash scripts/sources-census.sh validate --today 2026-11-08 tabi                                                     → EXIT 0, 38 lines, diff EMPTY
```

So both artifacts carry pasteable output (37 `W04` duplicate-URL lines + the `tabi ok <path>` line),
a row count (`rows=224`, `rows=226`) and an exit code (`census-exit=0`), and both reproduce
byte-for-byte at those exits. The row counts are independently correct: `grep -c '^| S[0-9]'
corpus/SOURCES.md` is 224 at `b1d8f07b` and 226 at the tip. The `census-start` input mirror is
genuinely the base bytes: `sha256sum /fast/scratch/…/census-root/tabi-shokunin/corpus/SOURCES.md`
= `a6b13064…793b11` = `git show b1d8f07b:corpus/SOURCES.md | sha256sum`.

Calibration gap (minor, folded into F5): the artifacts do not embed the command line or the input
digest, and the `census-start` input is a scratch mirror that dies with the wave — a non-author
must know the fleet script to re-derive `rows=`.

## 4. No out-of-lane write — PASS (time-stamped)

```
git -C /home/vgpnk/Projects/shokunin status --porcelain | grep -iE 'tabi|round-91'   → NONE for round-91
git -C /home/vgpnk/Projects/shokunin log --oneline -40 | grep -i 'round-91|tabi'
```

Observed: the only `tabi`-named paths in the fleet-root status are `.scratch/closure-tabi-r83-entry.json`
(mtime 03:22:08) and `.scratch/closure-tabi-r87-entry.json` (mtime 08:04:51) — both r83/r87 closure
entries written hours before this wave existed (wave dir 12:38, dispatch 13:15); neither names
round-91. No `round-91` path outside the lane at any point in the audit. The two round-91 fleet
commits are the orchestrator's dispatch evidence (`17c82307`, `87b897b9`), not seat writes; the
fleet root is concurrently being written by another lane's round-94 work (`?? .ufo/reports/round-94/chousa.md`
appeared at 13:17:52 and was committed as `1f883f43`), which is not r91 and not this lane.

## 5. The six r90 §8 corrections — PASS where §8 required append-only; three sanctioned in-place rewrites

Diff basis `git diff b1d8f07b HEAD` (committed bytes; the worktree's only additional r90-file change
is none — `LOG.md`'s worktree delta is the pure-addition r91 entry, 35/0):

| §8 item | target | observed | verdict |
|---|---|---|---|
| 1 | note `chromium-showpicker-runtime-round-90.md`, `LOG.md:4079`, `QUALITY.md:1060` (163) | 3 files rewritten **in place** (`note 5+/4-`, `LOG 3+/3-`, `QUALITY 5+/1-`); each new sentence names the correction: note "(`send-log-allowlist`, not `plan-calls` — the r90 spot-check's routed defect 1 corrected here)", QUALITY 163 "(r90 spot-check defect 1 corrected here)"; the LOG line is corrected but carries no marker | as routed ("mark **or rewrite** each copy") |
| 2 | `LOG.md`, `plans/round-90.md` | LOG now "226 cases at the final D6 freeze … the preflight run was 225"; plan "battery 225 cases … at the preflight (226 cases at the D2/final freeze …)"; the stale `(225 cases, coverage` string is gone from both | as routed ("record the delta **or** correct the numeral") |
| 3 | `corpus/lessons/round-89.md:75`, `QUALITY.md:1054` (161) | lesson **append-only**: `23 insertions(+), 0 deletions`, block "the round-89 records above are not rewritten", names the `frozen-control-numeral` row and "extended in place"; criterion 161 byte-unchanged (`git diff … | grep -c '161\.'` → 0); new row 164 appended, "**Supersedes 161's green-state citation**, which was rewritten in place" | PASS |
| 5 | after-run revision | `corpus/lessons/round-90.md` +21/−0 block names "the **D4 worktree**" and "`3e6cf40f980ea011a400eec7ce1c5db58773141a`" | prose PASS; artifact defect open — F4 |
| 7 | dangling pointer | `plans/round-90.md` `## Re-freeze history` now opens with a "Pointer (round 91, the r90 spot-check's routed defect 7) … D3–D6 entries live under §Wave corrections" block | PASS |
| 8 | S224 Gate quote | `corpus/lessons/round-89.md` +23/−0 block marks the original "**31 words**", "over-length", and names the "**17-word** replacement" | PASS |

So: strict append-only ("the original lines still present") is **false for the three copies §8 item 1
itself told the lane to "mark or rewrite"** (note, LOG, QUALITY 163), and **true for everything §8
item 3 bound to append-only** (round-89 lesson, QUALITY 161). No r90 lesson body was rewritten.
This is reported as calibration, not as a violation of the routed instruction.

## 6. No cookie/token/session material; child proxy origin — PASS

```
for p in cookie Set-Cookie localStorage sessionStorage Authorization Bearer password credential; do grep -o -i "$p" receipt.json | wc -l; done
→ 0 0 0 0 0 0 0 0
grep -ci 'cookie|authorization|bearer|password|credential|sessionid|localstorage|api[_-]?key|secret' receipt.json → 4
grep -c -i 'cookie|authorization|…|secret' corpus/knowledge/chromium-showpicker-proxy-runtime-round-91.md → 0
```

The four hits are the same Chromium GCM stderr string repeated in `stderrHead`:
`Error code: 401  Error message: Authentication Failed: wrong_secret` — a browser log line, no
credential value. The CDP surface actually exercised is ten methods
(`Browser.getVersion, DOM.setFileInputFiles, Emulation.setDeviceMetricsOverride,
Input.dispatchMouseEvent, Page.enable, Page.getFrameTree, Page.navigate,
Page.setInterceptFileChooserDialog, Runtime.enable, Runtime.evaluate`) — no `Network.*`, no
`Storage.*`, no cookie API. The receipt's only loopback handles are the devtools ws URL on the
pinned CDP port and the scratch profile path `/fast/scratch/hyaku/tabi-r91/scored/leg-01/profile`
(not `/tmp`).

Proxy origin enforcement is real in the frozen driver bytes
(`scripts/chrome-cdp-showpicker-proxy-round91.mjs:115`):

```js
if (d.cmd !== 'showpicker' || e.origin !== ${JSON.stringify(parentOrigin)}) return;
```

and both child documents are the *same* template with the parent origin baked in (lines 281–282),
which is why `same.sha256 === child.sha256`. Receipt-side, every proxy leg logs exactly one message
whose origin is the parent origin and receives exactly one reply from the frame's own origin, e.g.
`sp91-xo-proxy-file-childact`:

```
proxyLog [{"origin":"http://127.0.0.1:19961","cmd":"showpicker","target":"s",…}]
replies  [{"origin":"http://127.0.0.1:19963","data":{"cmd":"result","result":{"ok":true,"ret":"undefined","target":"s","origin":"http://127.0.0.1:19961"}}}]
```

Calibration: because the proxy logs *before* the origin guard, a foreign-origin message would have
to appear in `proxyLog` and the counter's `log.length !== 1` test would fail — but no leg ever posts
from a third origin, so "accepts only" is code-verified, not receipt-measured. That is exactly the
declared limit ("the proxy is the lane fixture origin check"), so the claim is honest.

## 7. Prior receipts independent of the scored receipt — PASS

```
nonces  tabi-r91-l1-1d073adc0b8d | tabi-r91-probe4-probe0004 | tabi-r91-probe5-probe0005   (3 distinct)
ports   {19961,19962,19963} | {19931,19932,19933} | {19941,19942,19943}   (3+3+3 distinct, cross-overlap [])
tokens  s∩p4 [], s∩p5 [], p4∩p5 []   (15 unique per receipt, zero overlap)
devtools s∩p4 [], s∩p5 [], p4∩p5 []   (zero overlap)
legs 15/15/15, failures 0/0/0, leg-name list identical across the three
driverSha256 identical across the three (343eb0f2…)
```

The priors' `parent/same/child` fixture pins differ from the scored receipt's — expected and
consistent, because the served child documents embed the parent origin, which embeds the port
(19931/19941 vs 19961); same-origin and cross-origin children still hash equal to each other within
each receipt. The scored receipt is therefore not a copy of either prior, and neither prior carries
the scored nonce or a scored launch token.

---

## Findings

### F1 — HIGH (provenance): the frozen claims artifact was amended mid-wave, after dispatch

`claims.json` changed under the seats. Committed bytes (`git show HEAD:`)
`f55a48866e66d07ce2bdc4106280d6c92232e572c57eb7623a9b43c8ecc1237b`; worktree at 13:19:45
`9e204225a456b8b1fcebfef29826ca99ff3141dd97d60587a9b01d08e40c1d00` (`M` in `git status`), diff
23+/8−. The wave was dispatched at 13:15 (`w1.ready`), the first seat artifacts landed 13:17:51
(`w1/r91exec3-*`, `R91Exec3.md` 13:18:31), the amendment landed 13:19:45. Four changes:

1. `C1.type` item (2) rewritten (see F2);
2. `C1.legs.c` "six gates" → "five gates" (the runner's `scored/selftest.json` carries exactly
   five gates: counter-selftest, counter, battery, killpower, drift-selftest — `jq '.gates|length'`
   → 5);
3. `C2.legs.c` "10 causal cases" → "8 causal cases" (`selftest.json` `drift-selftest.checkCount`
   has 8 injected ids);
4. both `pins` blocks: `selftest-r91-gates.mjs` `e151c99a…` → `988c18e5…`,
   `check-record-drift-round91.mjs` `466496e1…` → `e2e51c6b…` (the D3 bytes).

The mechanism is the lane's own: `frozenAmendments` exists in r88/r89/r90 `claims.json` and each
entry states old/new/why. Here the entries are present and honest. But the practical consequence is
that "the frozen claims" is read-time dependent: a seat that read at dispatch audited the old
sentences and old pins (I did; `R91Exec3` audited the old pins and reported them as an observation),
while later seats audit the new ones. My own report above is therefore stamped with both hashes.

Impact: replay ambiguity on the artifact the whole wave is scored against; a verifier cannot tell
from the file alone which text a given seat saw. Exploit path (read-only): quote the pre-amendment
`C2.legs.c` "10 causal cases" against `selftest.json`'s 8 and call the claim false — true of the
committed artifact, false of the worktree one.

Smallest remediation: none proposed against the claims themselves — the entries already disclose
old/new/why. Commit the amended file with the wave, and have the wave ledger record the claims
sha256 each seat read (the dispatch JSON already names the path; add the digest).

### F2 — MEDIUM (fabricated readiness at freeze): the pre-amendment C1 text asserted a proxy call no leg measures

Committed `C1.type` item (2) read: "a real click in the PARENT document -> the same-origin child is
active (**its direct and proxy calls return undefined and open exactly one chooser owned by that
frame**)". The frozen 15-leg plan contains no same-origin proxy leg under a parent click. The
receipt's activation matrix (`jq` over `legs[] .name/.frame/.mode/.parentPad/.childPad`) is:

```
sp91-so-direct-parentact   so direct parentPad          choosers 1
sp91-so-proxy-childact     so proxy         childPad    proxy.ok true
sp91-xo-proxy-file-parentact xo proxy parentPad         proxy.ok false  NotAllowedError
```

Every same-origin proxy leg (`so-proxy-noact`, `so-proxy-childact`, `so-proxy-date-*`) has
`childPad` and none has `parentPad`; only the *direct* leg is measured under a parent click, and only
the *cross-origin* proxy leg is measured under a parent click (where it correctly fails). The
amendment's own `why` concedes this ("the frozen 15-leg plan has no so-proxy-parentact leg; the
sentence claimed a proxy call the receipt does not carry").

Impact: at freeze time the claim was stronger than the instrument could support — the sentinel class
of defect this seat exists to catch. It is now corrected in the worktree and the correction is
faithful to the receipt; the frozen (committed) text remains overstated until that file is committed.
Smallest remediation: commit the amendment (F1) and keep the leg matrix in the report as the ground
truth for item (2).

### F3 — MEDIUM (freeze artifact misstates the scored nonce; the "D1 freeze" no longer exists as bytes)

`freeze.txt` line 10 reads:

```
# digest 12cbe8a0267f (sha256 of the six instrument pin lines, first 12 hex; the scored nonce is tabi-r91-l1-12cbe8a0267f)
```

The scored receipt, `claims.json` (`digest`/`nonce` and all three `freezeHistory` entries) and
`expectations.json` all say the scored nonce is `tabi-r91-l1-1d073adc0b8d`. The digest itself is
correct for the bytes present (`head -6 freeze.txt | sha256sum` → `12cbe8a0267f…`), so the line is a
fossil of re-running `freeze.sh` (which truncates with `>` and always re-derives
`nonce=tabi-r91-l1-<digest>`) at the D3 re-freeze. `freeze.sh`'s own header still says "Round-91 D1
freeze". Consequently:

- the file the ticket calls "instrument freeze D1" is the D3 freeze (`12cbe8a0267f`, matching
  `claims.freezeHistory.D3` and `plans/round-91.md` §Re-freeze history D3). No D1/D2 freeze artifact
  exists to compare against: `find .ufo/waves/round-91 -name '*freeze*'` → `freeze.sh`,
  `freeze.txt` only, and the lane's single r91 commit `249b7d0c` carries only the final instrument
  bytes, so the D1 (`1d073adc0b8d`) and D2 (`2d825d85aab7`) bytes survive nowhere as bytes — only
  their digests in prose (and the D1 digests of the two re-frozen instruments quoted in
  `w1/R91Exec3.md`) — because each re-freeze overwrote `freeze.txt`;
- the one artifact that names `tabi-r91-l1-12cbe8a0267f` as "the scored nonce" is a committed file
  (`f0807df5…`), and the statement is false.

Impact: a non-author following the ticket premise ("D1 pins in freeze.txt") replays the wrong
instrument set; a grep-driven auditor can flag the lane for a nonce it never used. Exploit path:
`grep 'scored nonce' freeze.txt` → a nonce with no receipt. Nothing in the wave is harmed — the
receipt, claims, expectations, plan, LOG and knowledge note all agree on `1d073adc0b8d`, and the
counter never reads freeze.txt.

Smallest remediation: stop the nonce line from being regenerated — make `freeze.sh` take the scored
nonce as an input (or refuse to emit the nonce line once a receipt exists), and write
`freeze-<digest>.txt` per freeze instead of truncating one file.

### F4 — MEDIUM (gate strength / calibration): C2's `r90-after-revision` is green while the artifact defect it names is still in the committed bytes, and one scored artifact is only correct in the uncommitted worktree

```
git show HEAD:.ufo/waves/round-91/scored/drift-a.json | jq -c '{verdict,checkCount,revision,findings:(.findings|length)}'
→ {"verdict":"clean","checkCount":8,"revision":"working-tree","findings":0}
jq -c '{verdict,checkCount,revision,findings:(.findings|length)}' .ufo/waves/round-91/scored/drift-a.json
→ {"verdict":"clean","checkCount":8,"revision":"249b7d0cf0fa13d09cf8da6a724608e9d8b099d1","findings":0}
```

§8 item 5's complaint was precisely that `scored/drift-a.json` "does not state the revision it was
measured at". The committed scored artifact still says `working-tree`; the revision appears only in
(a) the appended r90-lesson prose and (b) an **uncommitted** edit of `drift-a.json` (mtime 13:15:18,
during the wave). The gate's statement 4 reads only the lesson block
(`block.includes('D4') && block.includes('3e6cf40f') && block.includes('revision')`), so it passes on
prose and cannot see the artifact. The same weakness applies to statement 3 (append-only: it checks
that a correction *block exists*, not that nothing was rewritten — the rewrite would be invisible),
statement 5 (pointer: string presence), and statement 6 (quote mark: string presence). I verified the
underlying facts independently, so the claim holds on state; the *count* of 8 "statements" overstates
what the gate can catch.

Impact: "C2 clean at 8/8" is a statement about eight text probes, four of which are presence-only;
and the C2 after-run's green artifact is not the committed one. Exploit path: check out HEAD and run
`jq .revision` on `scored/drift-a.json` — the §8 item 5 defect is still visible at the committed tip.

Smallest remediation: commit `drift-a.json` with the revision field (re-run at the committed tip and
commit both), and extend statement 4 to assert `JSON.parse(drift-a.json).revision` is a 40-hex
revision, not a prose string in the lesson.

### F5 — LOW (control/artifact hygiene; in-flight, attribution unknown)

During the wave the worktree diverged from the committed scored artifacts:
`controls/c1/nowork-proxy-flip.json` and `nowork-post-removed.json` were rewritten at 13:16:22
(+841/+843 lines vs committed; worktree `372cda30…`/`ffd8a35b…` vs committed
`d04876a0…`/`b7cd0db5…`), `scored/drift-a.json` at 13:15:18, `claims.json` at 13:19:45, and the
`scored/control-*.json` outputs are untracked. None of these is in `freeze.txt`, so no freeze rule
is broken; I re-ran the **committed** controls (results in §2) so my verdict does not depend on the
churn. Also: the census artifacts do not carry their command or input digest (§3).

Impact: a verifier replaying "the controls" gets whatever bytes exist at read time; the census row
counts need the fleet script to re-derive. Smallest remediation: pin the two control receipts in
`freeze.txt` (or record their sha256 inside the scored control JSON), and append the command plus
input sha256 to `census-start.txt`/`census-end.txt`.

---

## Calibration statement

Seven of seven audited surfaces produced evidence, and six are clean on the bytes that matter (pins,
receipt identity, fixture recomputation, census reproduction, out-of-lane writes, prior
independence, secret/origin hygiene). The four findings are about the *record*, not the measurement:
a frozen claims file that moved mid-wave (F1) and whose pre-amendment text over-claimed one arm (F2),
a freeze artifact that names the wrong scored nonce and lost the D1 bytes (F3), a gate whose green
depends on an uncommitted artifact and whose statements are presence-only (F4), and unpinned control
churn (F5). No predicate, counter, pin, prior, threshold or kill rule is challenged; no seat in this
wave should treat any of the above as permission to amend the frozen claims.

Evidence files copied under `.ufo/waves/round-91/w1/` (scratch deleted after copying):
`R91Sentinel-refixture.mjs`, `R91Sentinel-fixture-recompute.txt`,
`R91Sentinel-census-start-repro.txt`, `R91Sentinel-census-start-lane.txt`,
`R91Sentinel-census-end-repro.txt`, `R91Sentinel-census-end-lane.txt`.
