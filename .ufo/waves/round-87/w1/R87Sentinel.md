# R87Sentinel — adversarial bounds/provenance audit of tabi round 87 (wave `w1`)

**Seat:** R87Sentinel (sentinel, read-only). **Lane:** `/home/vgpnk/Projects/shokunin/tabi-shokunin`
**Base:** `24765dd9` **Scored-receipt digest:** D3 `3dd4b0802d67` **Nonce:** `tabi-r87-l1-3dd4b0802d67`
**Audit window:** 2026-11-08 07:16 → 07:34 local (−0300) / 10:16 → 10:34 UTC.
**Method:** every claim re-derived from the bytes on disk; nothing accepted from a seat report. The lane was
**moving during the audit** (D4 re-freeze 07:16:23, census `end.txt` 07:19:44, D5 re-freeze 07:25:53,
`claims.json` 07:25:59); every finding below is stated against the **final D5 snapshot taken at
10:33:54 UTC**, and the mid-audit movement is recorded in F4.

**Tooling:** no install, no upgrade, no package mutation. Tools used, all pre-existing:
`git 2.56.0` (read-only: `status/log/ls-tree/rev-list/ls-remote/archieve`, no mutating subcommand),
`jj 0.45.1-7c41cdeb` (`log/status/file show/file list` only), `node v24.21.0`, `python3 3.14.8`,
`coreutils sha256sum 0.8.0`, `bash scripts/sources-census.sh` (read-only mode). Reason: the audit needs
only hashing, JSON reading and one lane-local counter re-run. **No pacman transaction, no PATH write, no
host service touched** (pacman is PAUSED host-wide).

---

## Verdict summary

| # | Surface | Verdict |
|---|---|---|
| 1 | freeze.txt sha256 vs pinned bytes | **PASS** (6/6 match live bytes) — but see F1 |
| 2 | receipt identity (schema, lane, nonce, driver pin, fixture pin, ports) | **PASS** (all six fields verified, fixture hash re-derived independently) |
| 3 | census `start.txt` / `end.txt` | **PASS** (both present, pasteable, `exit=0`, re-runnable byte-identical) — but see F4 for the window |
| 4 | no seat wrote outside the lane | **PASS** (one fleet-root artifact, and it is the fleet's own convention) — see F5 |
| 5 | do-nothing controls' exit codes + finding ids | **PASS** (exit 1 / 47 findings and exit 2 / `receipt-unreadable`, both reproduced) — but see F3 and F6 |

**Three findings that must be settled before the round is filed** (F1, F2, F3) and three lower-severity
observations (F4, F5, F6). None of them requires amending a predicate, counter, pin, prior, threshold or
kill rule; they are provenance and wiring defects, and they are stated as defects to be fixed by the
integration owner, not as proposals to change what a gate measures.

---

## (1) freeze.txt sha256 vs bytes — PASS, with F1

`freeze.txt` (D5) pins six instruments. Each pin was recomputed from the bytes on disk:

```
$ python3 - <<'EOF'   # freeze.txt sha256, per-pin live hash, claims-pin comparison
freeze.txt sha256        = c921658c6046cb59937b9c8a2b146efb1d00050d1d740a4728eb543215568bc4
claims.digestsCommit     = b1d06cf8db57  | equals freeze prefix? False
claims.nonce              = tabi-r87-l1-3dd4b0802d67
  pin OK  scripts/chrome-cdp-showpicker-round87.mjs 7c54e786d78d455b live 7c54e786d78d455b claims 7c54e786d78d455b
  pin OK  scripts/check-showpicker-r87.mjs           6a2bb03b63feb483 live 6a2bb03b63feb483 claims 6a2bb03b63feb483
  pin OK  scripts/negatives-showpicker-r87.mjs       9883807a5a60e20f live 9883807a5a60e20f claims 9883807a5a60e20f
  pin OK  scripts/kill-power-r87.mjs                 c95b5305645e20e3 live c95b5305645e20e3 claims c95b5305645e20e3
  pin OK  scripts/selftest-r87-gates.mjs            4346700a85fef7cb live 4346700a85fef7cb claims 4346700a85fef7cb
  pin OK  scripts/check-record-drift-r87.mjs         eea04278daf02e94 live eea04278daf02e94 claims eea04278daf02e94
EOF
```

**PASS**: 6/6 pins match the live bytes, and `claims.json` `C1.pins ∪ C2.pins` equals the freeze set
exactly (no pin in one place and not the other; no seventh pin).

**The digest chain itself is sound and content-addressed** — I verified it by reconstruction rather than by
reading it out of a report. Brute force over all 720 line permutations of the pre-D4 freeze text finds
**exactly one** ordering whose sha256 starts with `3dd4b0802d67`, and it is the actual file order:

```
$ python3 - <<'EOF'   # permutation search over the pre-D4 freeze lines
permutations reproducing D3 prefix 3dd4b0802d67: 1
   ('driver','counter','battery','killpower','selftestD3','drift') 3dd4b0802d678454ad5706b56a59a4aa350568764d3b7a6cfe6ba4fd5f650005
no-trailing-newline hits: 0
EOF
```

D4 (`b1d06cf8db57`) reconstructs the same way (revert only the drift line → exact match), and D5
(`c921658c6046`) is the current file. So `D1→D2→D3→D4→D5` are **freeze-content digests**, and the nonce
suffix `3dd4b0802d67` is the D3 freeze digest — the scored receipt is D3 while the wave record is D5, which
`plans/round-87.md` §Re-freeze history states explicitly. I confirmed the reconstruction of D3 rather
than trusting that prose.

### F1 — FINDING (medium): the pinned bytes are in **no commit**; `digestsCommit` names a digest, not a commit

```
$ git rev-list --all -- <path>            # for each pinned artifact
scripts/chrome-cdp-showpicker-round87.mjs -> ABSENT-FROM-ALL-COMMITS
scripts/check-showpicker-r87.mjs           -> ABSENT-FROM-ALL-COMMITS
scripts/negatives-showpicker-r87.mjs       -> ABSENT-FROM-ALL-COMMITS
scripts/kill-power-r87.mjs                 -> ABSENT-FROM-ALL-COMMITS
scripts/selftest-r87-gates.mjs            -> ABSENT-FROM-ALL-COMMITS
scripts/check-record-drift-r87.mjs         -> ABSENT-FROM-ALL-COMMITS
.ufo/waves/round-87/freeze.txt             -> ABSENT-FROM-ALL-COMMITS
corpus/evidence/round87/chromium-showpicker/receipt.json -> ABSENT-FROM-ALL-COMMITS

$ jj file show -r @ scripts/check-showpicker-r87.mjs   -> NOT-IN-JJ-@
$ jj file show -r @ .ufo/waves/round-87/freeze.txt      -> NOT-IN-JJ-@
$ jj file show -r @ corpus/evidence/round87/chromium-showpicker/receipt.json -> NOT-IN-JJ-@
$ git rev-parse HEAD                     -> 24765dd9…   (== the frozen base; no r87 commit exists)
$ git ls-remote origin refs/heads/master -> 24765dd95b5ef01ffc24a19ae5f293315216f4e5
```

**Impact.** The freeze currently binds *working-tree bytes* only. A later `git checkout`/clean, or any
edit, can move the bytes under the pins with no commit to compare against; the D digest protects the
freeze **file's** content, not the instrument files the freeze names. The only committed echo of the r87
identity today is prose in `LOG.md` inside the jj working-copy commit `3906bb4f` (reachable only as
`refs/jj/keep/3906bb4f…`), which names the fixture/driver hashes but not the six instrument hashes.
Separately, the field named **`digestsCommit`** holds `b1d06cf8db57` — a freeze-**content** digest
(D4), not a commit id, and one generation behind the current freeze file (D5 `c921658c6046`). The
`frozenAt` prose names D5 correctly, so the file contradicts itself inside one JSON document.
**Smallest remediation** (integration owner's call, no gate changes): land the r87 artifacts in one commit
so the pins have a committed referent, and set `digestsCommit` to the freeze digest the `frozenAt` prose
already names, or rename the field so it stops reading as a commit id.

---

## (2) Receipt identity — PASS

Read from the **committed bytes of the receipt file** (`corpus/evidence/round87/chromium-showpicker/receipt.json`):

```
schema      = tabi-chrome-cdp-showpicker-r87      (== the counter's SCHEMA constant)
lane        = tabi-shokunin                       (== basename of the lane dir)
nonce       = tabi-r87-l1-3dd4b0802d67            (== claims.nonce, == the assignment's nonce)
driverSha256= 7c54e786d78d455b955e822deb4bf0419b85c4859c5287c27380d6b568389e5f
              (== freeze.txt pin for scripts/chrome-cdp-showpicker-round87.mjs, == live driver bytes)
fixture.sha256 = 10e444f7fb840b6e132b4570794d3a0ed6f5db0781ca490a986685505e8d94c4
              (== the assignment's fixture pin)
ports       = {http: 48320, cdp: 48321, child: 48322}   (3 distinct)
fixture.origin  = http://127.0.0.1:48320  (== ports.http)
fixture.child.origin = http://127.0.0.1:48322 (== ports.child)
legs = 34, failures = []
```

**The fixture pin is not self-reported.** I re-derived `10e444f7…` from the driver's own patch constants
plus the round-78 fixture template the driver extracts, substituting the receipt's nonce and child port:

```
recomputed fixture sha256: 10e444f7fb840b6e132b4570794d3a0ed6f5db0781ca490a986685505e8d94c4
receipt    fixture sha256: 10e444f7fb840b6e132b4570794d3a0ed6f5db0781ca490a986685505e8d94c4
FIXTURE MATCH true
recomputed child sha256: bbb2218920c629c789056562d2558c74be26081b335c724ddadeec4d79c9f671
receipt child sha256  : bbb2218920c629c789056562d2558c74be26081b335c724ddadeec4d79c9f671
CHILD MATCH true
```

The seven accept token forms the receipt actually carries, read from the page (`window.__inputs()`),
match the claim's grammar exactly, including the whitespace variant's raw string:

```
'.png' (k) | 'image/*' (aw) | 'image/png, .txt' (am) | 'application/pdf' (ap)
'audio/*' (aa) | 'video/*' (av) | 'image/png,application/pdf' (a2) | '  image/png ,  .txt  ' (aws)
```

Ports are free now (no leaked listener, no stray Chromium):

```
$ ss -ltnp | grep -E '4832[0-2]'   -> none listening
$ for p in 48320 48321 48322; do ... done  -> 48320 free / 48321 free / 48322 free
```

**The counter run reproduces byte-identically** under the frozen pins (D3 nonce, D3 driver, D3 fixture,
D5 prior-set):

```
$ node scripts/check-showpicker-r87.mjs --lane <lane> --receipt corpus/evidence/round87/chromium-showpicker/receipt.json \
    --expect-driver-sha256 7c54e786… --expect-nonce tabi-r87-l1-3dd4b0802d67 \
    --expect-fixture-sha256 10e444f7… --prior-set .ufo/waves/round-87/controls/c1/prior-set.txt --json
exit=0   verdict clean   checkCount 99   findings 0
```

and its JSON is **equal to the stored `scored/counter-a.json` byte-for-byte** (`json equal(limit included) True`,
`checks equal True`, `findings equal True`). The stored battery artifact likewise re-reproduces exactly:

```
scored battery-a.json : cases 209  failed 0  coverage {declared 99, covered 99, uncovered [], unknown []}
live   battery run     : cases 209  failed 0  coverage {declared 99, covered 99, uncovered [], unknown []}
equal True
```

---

## (3) Census artifacts — PASS (window note in F4)

```
$ ls -la .ufo/waves/round-87/census/
-rw-r--r-- 5190 2026-11-08 06:50:51 start.txt
-rw-r--r-- 5190 2026-11-08 07:19:44 end.txt
$ sha256sum .ufo/waves/round-87/census/*.txt
636b7ca2605dd30fa8ca47b28bb48165d9ec4e0fa29c7bd7d80a8416b3d5cf36  end.txt
636b7ca2605dd30fa8ca47b28bb48165d9ec4e0fa29c7bd7d80a8416b3d5cf36  start.txt
```

Both files are pasteable TSV (one finding per line, tab-separated) and end with the exit trailer:

```
tabi	W04	S058 duplicate url chromewebstore.google.com/detail/webmcp-… across scopes
…
tabi	W04	S223 duplicate url html.spec.whatwg.org/multipage/input.html across scopes
tabi	ok	/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md
exit=0
```

`exit=0` is present in both (not merely implied). Both are **reproducible**: re-running the fleet census
read-only in validate mode with the lane id yields byte-identical content modulo the `exit=` trailer:

```
$ bash scripts/sources-census.sh validate --today 2026-11-08 tabi    # rc=0
$ diff <(grep -v '^exit=' .ufo/waves/round-87/census/start.txt) <live>  -> identical
$ diff <(grep -v '^exit=' .ufo/waves/round-87/census/end.txt)   <live>  -> identical
```

The output is warning-grade only (`W04` same-URL-across-scopes) plus the lane `ok` line, which is why
`exit=0` is the correct exit for this lane. The round-86 pair is identical to each other in the same way,
so this is the lane's established convention.

---

## (4) No seat wrote outside the lane — PASS (F5 notes the one fleet-root artifact)

```
$ git -C /home/vgpnk/Projects/shokunin status --porcelain
 A .scratch/closure-tabi-r83-entry.json
 M .scratch/goal-20261103-hyaku-run15.md
 M .scratch/run15-state.json
 A .scratch/run15-wrapup/misroot-cff0b4cb/versions.html
 A .scratch/run15-wrapup/misroot-cff0b4cb/w4lines.txt
 M .ufo/l0-questions.md
 A scripts/hyaku/__pycache__/prefile-falsification.cpython-314.pyc
?? .ufo/reports/round-87/tabi.md
```

Files naming tabi/round-87, and their provenance:

* `.ufo/reports/round-87/tabi.md` — the lane's own report at the fleet's report path. **This is the fleet
  convention**: 15 sibling lane reports for round-87 are already tracked at
  `.ufo/reports/round-87/<lane>.md` (`git ls-files .ufo/reports/round-87` → 15 files). Not a stray write.
* `.scratch/closure-tabi-r83-entry.json` — a **round-83** closure artifact, staged in the fleet index,
  mtime 03:22, i.e. **before** the r87 wave dispatch (06:47 `l1 TabiR87` in `.ufo/state/inline-dispatcher.log`).
  Not produced by this wave.
* `.scratch/run15-state.json` — orchestrator state (`"tabi": {… "label": "TabiR87" …}`), updated by the
  fleet runner, not by a tabi seat; it also carries the fleet's own counters for other lanes.

No tabi r87 artifact appears in any sibling lane, and no tabi r87 nonce or instrument name appears in the
fleet outside the lane:

```
$ grep -rl 'tabi-r87-l1-3dd4b0802d67' . --exclude-dir=.git --exclude-dir=tabi-shokunin
./.ufo/reports/round-87/tabi.md
$ grep -rl 'chrome-cdp-showpicker-round87|check-record-drift-r87' . --exclude-dir=.git --exclude-dir=tabi-shokunin
./.ufo/reports/round-87/tabi.md
$ for l in */; do find "$l" -name '*tabi-r87*'; done   # sibling lanes
--- end ---   (no hits)
```

Inside the lane, no stray scratch/`.err` residue and no r87 evidence outside the two named trees:

```
$ find .ufo/waves/round-87 -name '*.err' -o -name 'scratch' -type d   -> (none)
$ find corpus/evidence/round87 -type f
corpus/evidence/round87/chromium-showpicker/receipt.json     (single file)
```

### F5 — OBSERVATION (low): the lane report at the fleet root is still a draft with 12 unfilled placeholders

```
$ grep -c 'TBD' /home/vgpnk/Projects/shokunin/.ufo/reports/round-87/tabi.md   -> 12
**Freeze commit:** `TBD-FREEZE`; **lane tip:** `TBD-LANEHASH`
(pushed; `ls-remote origin refs/heads/master` prints it).
… `TBD-DEAD` … `TBD-SEATS` … commit `TBD-FREEZE` … measured at `TBD-FREEZE`.
```

Two of these are not cosmetic:

* The parenthetical **"(pushed; `ls-remote origin refs/heads/master` prints it)"** asserts a push that has
  not happened — `git ls-remote origin refs/heads/master` prints `24765dd9…`, the *base*, and no r87 commit
  exists (F1). As written, the report claims a lane tip that is not on the remote.
* The artifact table claims `.ufo/waves/round-87/w1-results.json` and
  `.ufo/waves/round-87/claim-falsification.tsv`. Both are **MISSING** on disk; rounds 82–86 each carry a
  `claim-falsification.tsv`, so its absence at r87 is a lane-convention break, not an optional file.

**Impact:** a reader of the fleet report would take the round's provenance as closed (pushed tip, landed
artifacts, complete seat ledger) when none of it is yet true. **Smallest remediation:** fill the
placeholders from the artifacts that will exist at filing time, or delete the claims that are not yet
true; do not leave "pushed" attached to a placeholder hash.

---

## (5) Do-nothing controls — PASS (F3, F6)

**Control A — r86 scored receipt under the r87 counter** (`controls/c1/nowork-r86-under-r87.json`):

```
stored: schema tabi-chrome-cdp-showpicker-r87-counter, verdict "findings", checkCount 95, 47 findings
ids include: schema, nonce-shape, nonce-expected, driver-pin, plan-frozen, leg-order, leg-records,
             plan-calls, leg-sp84-*, leg-sp85-*, leg-sp86-*, leg-sp87-* (one per leg)
```

Reproduced live under the r87 driver pin + r87 nonce + the r86 receipt's own fixture hash → **byte-identical
JSON** (`ids equal True`, `json equal True`, 47 findings, exit 1):

```
$ node scripts/check-showpicker-r87.mjs --lane <lane> --receipt corpus/evidence/round86/chromium-showpicker/receipt.json \
    --expect-driver-sha256 7c54e786… --expect-nonce tabi-r87-l1-3dd4b0802d67 \
    --expect-fixture-sha256 94421dc0… --prior-set .ufo/waves/round-87/controls/c1/prior-set.txt --json
exit=1 ; findings 47 ; has schema True ; has plan-frozen True
```

Under the claim's own counting-command fixture pin (`10e444f7…`, the scored r87 fixture) the same control
exits 1 with **48** findings — the extra id is `fixture-hash`. Both variants contain `schema` and
`plan-frozen`, which is what the claim asserts, so the claim holds either way; the difference is only that
the stored control was captured with the r86 receipt's own fixture hash, so its `checks.fixture-hash` reads
`true` while the claim-pinned variant reads `false`.

**Control B — unreadable receipt** (`controls/c1/noreceipt.txt`): a recorded pasteable transcript ending
`exit=2`, with finding id `receipt-unreadable` and detail `ENOENT: … open '/fast/scratch/hyaku/tabi-r87/l1/absent.json'`.
Reproduced live with my own absent path → **exit 2, id `receipt-unreadable`**, same shape.

### F3 — FINDING (medium): the exit-2 do-nothing control is not reproduced by any gate

The claim's C2 leg (c) states that **"the two do-nothing C1 controls reproduce their exits (1 and 2)"**.
Only the exit-1 control is reproduced by machine. The selftest's nine gates are:

```
gate('pins-match-freeze') gate('counter-clean') gate('battery') gate('kill-power')
gate('nowork-control') gate('tree-exempt-path-refused') gate('tree-exempt-unmatched-refused')
gate('record-drift') gate('capability-status')
```

`nowork-control` re-runs the r86 receipt and asserts `exit 1` + `schema` — that is control A. **No gate
produces `exit 2` for an unreadable/absent receipt**: `tree-exempt-path-refused` also exits 2, but it is the
*usage* refusal, a different code path (`verdict: "usage"`, id `usage`), not the
`verdict: "unreadable"`, id `receipt-unreadable` path that control B records. The exit-2 control therefore
lives only as a static text file under `controls/c1/`; nothing re-executes it, so a regression that made
the counter exit 1 (or 0) instead of 2 on an unreadable receipt would leave every green gate green.
**Impact:** half of the do-nothing pair is unexercised, and the C2 leg (c) is therefore not satisfied by
the selftest as wired. **Smallest remediation:** add one gate that runs the counter against an absent
receipt path and asserts exit 2 + finding id `receipt-unreadable`. This adds a check; it changes no
predicate, threshold, pin, prior or kill rule.

### F6 — OBSERVATION (low): the selftest's counter gate takes its expected identity **from the receipt it grades**

```
scripts/selftest-r87-gates.mjs:42
const expect = { driver: rec && rec.driverSha256, fixture: rec && rec.fixture && rec.fixture.sha256,
                 nonce: rec && rec.nonce };
```

The selftest reads the *scored receipt* and then runs the counter with that receipt's own driver/nonce/
fixture as the "expected" values, so `driver-pin`, `nonce-expected` and `fixture-hash` are satisfied by
construction inside the selftest. A receipt whose identity fields had been rewritten to match itself
would still pass `counter-clean` in the selftest. The selftest's `pins-match-freeze` gate does independently
hash the six instrument files against `freeze.txt`, and the **stand-alone** scored run
(`scored/counter-a.json`) uses the explicit frozen pins and scores clean at checkCount 99 — so the round's
*identity* is in fact bound, by the frozen pins in `claims.json`/`freeze.txt` plus the explicit-pins run.
The weakness is confined to the selftest harness being self-referential, which matters because the report
cites "selftest 9/9" as evidence. **Smallest remediation:** have the selftest take its expected
driver/nonce/fixture from `freeze.txt` + `claims.json` instead of from the receipt under test. The gate
would then be strictly stronger and no measurement would change.

---

## Additional verification the lane can cite

**Selftest green on the final D5 bytes, and the D4 defect that D4 fixed are both reproducible.**
The D3 selftest (`3e41bd2e…`) pointed `receiptRel` at the r86 receipt; the stored `scored/selftest.json`
from that generation shows the selftest catching itself:

```
scored/selftest.json (07:15:56, D3 bytes):  clean False  cases 9  failed ['counter-clean','battery']
  counter-clean False exit 1 {"verdict":"findings","checks":95,"findings":["schema","nonce-shape","plan-frozen",…]}
  battery      False exit 1 {"cases":205,"failed":205,…}
```

On the D5 bytes the same selftest is green — I ran it twice (once `--skip-killpower`, once complete) and
both are 9/9, and the complete run matches the stored D5 artifact gate-for-gate:

```
$ node scripts/selftest-r87-gates.mjs --lane <lane> --work <scratch> --json
exit=0  clean True  cases 9  failed []
  pins-match-freeze True   counter-clean True (exit 0, checks 99, findings [])
  battery True (209 cases, 0 failed, coverage 99/99)   kill-power True (66 mutants, 66 killed, 0 survived, 0 crashed)
  nowork-control True (exit 1)   tree-exempt-path-refused True (exit 2)
  tree-exempt-unmatched-refused True (exit 1)   record-drift True (exit 0, 5 claims, 0 mismatches)
  capability-status True (rows 22, claimed 21, provisional 1, mismatches 0)
```

**C2 before/after reproduces exactly on the D5 gate**, with the base tree exported read-only via
`git archive 24765dd9` (no checkout, no mutating git call):

```
BEFORE (base 24765dd9 tree):  exit 1  claims 5  mismatches 5
  failed [accept-headline, mistake-evidence, sources-searchlog, ledger-pointer, report-corrections]
AFTER  (live lane):            exit 0  claims 5  mismatches 0  failed []
```

The D5 drift gate is strictly stronger than D4 on two of the five statements — `ledger-pointer` now requires
the repointed `§Narrowings item 9`, and `report-corrections` became directional
(`/says "39 findings"[^.]{0,120}committed control has\s+\*\*40\*\*/i`) — and the before-value stays 5/5 and
the after-value stays 0/0, so the strengthening changed no verdict.

---

## F4 — OBSERVATION (informational): the audited tree moved twice under the audit

```
07:16:23  .ufo/waves/round-87/freeze.txt        D3 → D4 (selftest runner only: 3e41bd2e… → 4346700a…)
07:19:44  .ufo/waves/round-87/census/end.txt     created (start.txt was 06:50:51)
07:25:34  scripts/check-record-drift-r87.mjs     rewritten (603fb587… → eea04278…)
07:25:53  .ufo/waves/round-87/freeze.txt        D4 → D5 (drift gate only)
07:25:59  .ufo/waves/round-87/claims.json       rewritten (frozenAt prose → D5)
```

Two consequences for whoever reads this audit:

1. **`census/end.txt` did not exist when the wave was dispatched.** At 07:16:23 the census directory held
   only `start.txt`; `end.txt` appeared at 07:19:44. The pair is now complete and identical, so the
   requirement is met — but a census-end artifact that materialises after the wave closes its census is
   worth a glance at the next round.
2. **The frozen claims file was edited after the freeze it declares.** `claims.json` was rewritten at
   07:19:44 and again at 07:25:59, and between 07:10 and 07:19:44 its C1 `countingCommand` carried the
   **D2** nonce `tabi-r87-l1-42a489b9d4be` while the scored receipt is D3. I measured that the D2 nonce
   against the scored receipt: **exit 1, finding `nonce-expected`** — i.e. the frozen counting command as
   it stood at 07:10 could not score the round's own receipt clean. It now names the D3 nonce and exits 0
   clean at 99. The current file is self-consistent (`frozenAt` names D5, `digestsCommit` names D4 — see F1).

## Bound compliance of this seat

Read-only throughout: no commit, no push, no mutating git or jj command anywhere (`git status/log/ls-tree/
rev-list/ls-remote/archive` and `jj log/status/file show/file list` only); nothing written into
`corpus/evidence/round87`; no lane record edited; the fleet repo and sibling lanes read only; no
`agent://all` broadcast; no scratch tree left behind (`/fast/scratch/hyaku/tabi-r87/R87Sentinel` removed
on yield). The only file this seat wrote is this report, at the path the seat spec names.
