# R88Sentinel — bounds & provenance audit, tabi round 88 wave `w1`

Seat: `R88Sentinel` (read-only; no commit, no push, no lane-record edit).
Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Audited HEAD at time of writing: `82d0c2b8` ("round-88: scored receipt + D6 freeze …").
Base `f16f992d`. Working tree clean except `?? .ufo/waves/round-88/census/end.txt` and
`?? .ufo/waves/round-88/w1/`.

**Tooling: no install, no upgrade, no host mutation was performed.** No `pacman`, no `uv tool
install`, nothing written to `~/.local/bin` or any PATH directory. Every command below used
tools already on the host (`git`, `jj`, `node v24.21.0`, `python3`, `sha256sum`).

---

## Headline

Six audit axes. **Four PASS, two FINDING.** The two findings are (a) a
record-vs-committed-bytes disagreement in the frozen C2 claim text and (b) a
claims-cited artifact that does not exist. Neither is a predicate/pin/prior/threshold/kill-rule
amendment proposal — the frozen gates, pins and thresholds are left exactly as they are, and
these findings are stated as *record defects*, not as changes to any gate.

| # | Axis | Verdict |
|---|------|---------|
| 1 | freeze.txt sha256 vs committed bytes | **PASS** |
| 2 | receipt identity (schema/lane/nonce/driver/fixture/ports/legs) | **PASS** |
| 3 | census start.txt + end.txt carry pasteable output and `exit=0` | **PASS** |
| 4 | no seat wrote outside the lane | **PASS** (with one noted exception, F-3) |
| 5 | do-nothing controls' exit codes and finding ids | **PASS** |
| 6 | lane records vs scored outputs | **FINDING** (2 items) |

---

## Axis 1 — freeze.txt sha256 vs committed bytes — **PASS**

`freeze.txt` at `HEAD` pins 8 files. Every pin was checked against the **committed blob** at
`HEAD`, not against the working tree:

```
$ cd /home/vgpnk/Projects/shokunin/tabi-shokunin
$ git cat-file blob HEAD:.ufo/waves/round-88/freeze.txt | while read -r h f; do \
    a=$(git cat-file blob "HEAD:$f" 2>/dev/null | sha256sum | cut -d' ' -f1); \
    [ "$h" = "$a" ] && echo "OK       $f" || echo "MISMATCH $f pin=$h committed=$a"; done
OK       scripts/chrome-cdp-showpicker-round88.mjs
OK       scripts/check-showpicker-round88.mjs
OK       scripts/negatives-showpicker-round88.mjs
OK       scripts/kill-power-round88.mjs
OK       scripts/selftest-r88-gates.mjs
OK       scripts/check-record-drift-r88.mjs
OK       .ufo/waves/round-88/controls/c1/probes/prior1.json
OK       .ufo/waves/round-88/controls/c1/probes/prior2.json
```

The working tree is byte-identical to `HEAD` for all 8 pinned paths, so the pins also hold
against the working bytes (independently re-verified: 8/8 OK).

**The freeze chain is internally consistent and reproducible.** I reconstructed the freeze
digest from the pinned byte-set and reproduced the committed digest exactly, then reproduced the
intermediate D-labels declared in `plans/round-88.md` §Re-freeze history:

```
D2 candidate (selftest=dde1b4c2, killpow=ed4ee813, drift=3953e340, priors 80a6ff9e/01162e75) → 138bb883992e
D4 candidate (selftest=ba672802, killpow=617c2c68, drift=3953e340, priors …)               → 77656d8a28a9
D6 candidate (selftest=49746191, killpow=617c2c68, drift=e4501c19, priors …)               → 4daf88175afe
D6 candidate == committed freeze.txt byte-for-byte: True
```

D6 (`4daf8817`) is the committed `HEAD` freeze; `claims.json` `digestsCommit` = `4daf8817`
and `frozenAt` = "freeze.txt sha256 4daf8817 (D6 …)" — consistent, and consistent with the
cross-round convention where `digestsCommit` equals the freeze digest prefix
(r84 `31fc14c29f84`, r85 `620623a43f74`, r86 `4bd89a80f439`, r87 `c858c91ec04d` — each equals
its own `freeze.txt` sha256 prefix).

### Axis-1 note on the dispatch's `D 93500a4e`

The dispatch text names **`D 93500a4e (freeze.txt)`**. That label is **not** the committed
freeze digest. Per `plans/round-88.md` §Re-freeze history, `93500a4e` is **D3** — a *pre-scoring,
batched* intermediate freeze ("the selftest runner gained the `gate-selftest` gate"), which was
superseded by D4, D5 and finally D6 (`4daf8817`). The dispatch was written at D3 and the lane
correctly advanced past it. `93500a4e` corresponds to no commit in the lane's history
(`git cat-file -t 93500a4e` → `fatal: Not a valid object name`) because D3 was never a
commit — only D1 (`86f1dcec`), D2/D3-churn, D4, D5 and D6 are reconstructible from the D-label
chain, and D6 is the committed state. This is **not** a defect: the dispatch's `D` was a
point-in-time label, and every subsequent freeze is documented in the plan's re-freeze history
with its cause. Flagging it only so the integrator does not look for `93500a4e` as a live pin.

---

## Axis 2 — receipt identity — **PASS**

Read from the **committed** receipt
(`git ls-files corpus/evidence/round88` → `corpus/evidence/round88/chromium-showpicker/receipt.json`,
tracked at `HEAD`):

```
$ python3 -c "import json;d=json.load(open('corpus/evidence/round88/chromium-showpicker/receipt.json')); ..."
schema   = tabi-chrome-cdp-showpicker-r88
lane     = tabi-shokunin                     (basename matches the lane)
nonce    = tabi-r88-l1-86f1dcec              (== the scored nonce; == claims.json nonce)
driverSha256 = 8c015fa4ea541c25cf1e0c5ba35b28ee94c11dcb4aaa8bf1baf191ecbe49b9b4
fixture.sha256 = 8f93405128f1b0286549c470ff2e849e861af2a79b3d3cccea32dd9f27231a35
ports    = {http: 19740, cdp: 19741, child: 19742}   (3 distinct)
legs     = 37        failures = []
```

- **Driver pin equality — yes.** `receipt.driverSha256` equals the `freeze.txt` pin for
  `scripts/chrome-cdp-showpicker-round88.mjs`, equals the committed blob's sha256 (Axis 1), and
  equals `claims.json` `C1.pins` for the same path. Three-way equal.
- **Fixture pin** — `8f93405128f1b028…31a35`, matching the dispatch's `8f93405128f1…` prefix
  and the value the live counter compares against.
- **37 legs** confirmed; the three new r88 legs are present with the raw `accept` attributes read
  from the page (`fixtureInputs`): `ac` = `'IMAGE/PNG'`, `au` = `'audio/*,video/*'`,
  `amc` = `'image/png;q=0.9'` — and the ten token forms named in the law are all present
  (`k '.png'`, `aw 'image/*'`, `am 'image/png, .txt'`, `ap 'application/pdf'`, `aa 'audio/*'`,
  `av 'video/*'`, `a2 'image/png,application/pdf'`, `aws '  image/png ,  .txt  '`,
  `ac 'IMAGE/PNG'`, `au 'audio/*,video/*'`, `amc 'image/png;q=0.9'`).

**Live re-run of the committed counter against the committed receipt** (read-only; no lane write):

```
$ node scripts/check-showpicker-round88.mjs --lane <ABS lane> \
    --receipt corpus/evidence/round88/chromium-showpicker/receipt.json \
    --expect-driver-sha256 8c015fa4…b9b4 --expect-nonce tabi-r88-l1-86f1dcec \
    --expect-fixture-sha256 8f93405128f1b0286549c470ff2e849e861af2a79b3d3cccea32dd9f27231a35 \
    --prior-set .ufo/waves/round-88/controls/c1/prior-set.txt --json
verdict clean   checkCount 102   findings []   failed checks []
counter exit=0
```

Matches `scored/counter-a.json` (`verdict clean`, `checkCount 102`, `findings []`) and the
C1 predicate's `checkCount 102`.

---

## Axis 3 — census artifacts — **PASS**

```
$ ls -la .ufo/waves/round-88/census/
-rw-r--r-- 1 vgpnk vgpnk 5190 Nov  8 08:28 start.txt
-rw-r--r-- 1 vgpnk vgpnk 5190 Nov  8 09:01 end.txt

$ tail -3 .ufo/waves/round-88/census/start.txt
tabi	W04	S223 duplicate url html.spec.whatwg.org/multipage/input.html across scopes
tabi	ok	/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md
exit:0

$ grep -c "^tabi" .ufo/waves/round-88/census/end.txt   → 38
$ grep -n "^exit" .ufo/waves/round-88/census/end.txt    → 39:exit:0
```

Both files carry pasteable `tabi …` output lines and terminate with `exit:0`
(`start.txt` is tracked at `HEAD`; `end.txt` was still untracked at the moment of the audit —
`?? .ufo/waves/round-88/census/end.txt` — and has since been produced by the census run).
**Honest note on timing:** `end.txt` did **not** exist for the first ~30 minutes of this audit
(census dir contained only `start.txt` until 09:01); I re-checked and it is now present, so the
finding is *not* "end is missing" but "end arrived during the audit". If the integrator's
integration point was before 09:01, the census pair was incomplete at that instant.

---

## Axis 4 — no seat wrote outside the lane — **PASS** (with F-3 noted)

```
$ git -C /home/vgpnk/Projects/shokunin status --porcelain
 A .scratch/closure-tabi-r83-entry.json
 M .scratch/goal-20261103-hyaku-run15.md
 M .scratch/run15-state.json
 A .scratch/run15-wrapup/misroot-cff0b4cb/versions.html
 A .scratch/run15-wrapup/misroot-cff0b4cb/w4lines.txt
 M .ufo/l0-questions.md
 A scripts/hyaku/__pycache__/prefile-falsification.cpython-314.pyc
?? .scratch/closure-kama-r96-entry.json
?? .scratch/closure-tabi-r87-entry.json
?? .ufo/reports/round-67/kagi.md
?? .ufo/reports/round-88/souji.md
?? .ufo/reports/round-91/chousa.md
?? .ufo/reports/round-97/kama.md
?? docs_placeholder
?? plans/
```

Grepping for `tabi|round-88` yields: `.scratch/closure-tabi-r83-entry.json` (r83 — prior round),
`.scratch/closure-tabi-r87-entry.json` (r87 — prior round), and `.ufo/reports/round-88/souji.md`.
**None of these is a tabi-r88 lane record.** `.ufo/reports/round-88/souji.md` belongs to the
**souji** lane (`Lane: souji-shokunin (lane repo …/souji-shokunin)`) — a different lane's
round-88 report in the shared fleet report directory, which is the fleet's normal arrangement
(`.ufo/reports/round-88/` holds 15 such per-lane files). The tabi lane's own round-88 records
all live inside the lane.

### F-3 (noted, low severity, not a tabi-r88 record defect)

Two untracked **fleet-root** files exist that are byte-wise copies of tabi-lane round-88
material:

```
$ sha256sum plans/round-88.md tabi-shokunin/plans/round-88.md
6590f6032b445e5796dcacdaefebfdd1e4c2f60c766451724b99af64a1e34e72  plans/round-88.md      (fleet root)
e8cd2424237b524bcb843c8b9f4a2750aac82382f89bd...                  tabi-shokunin/plans/round-88.md
$ head -3 docs_placeholder
# Round 88 — plan and narrowing amendments
Base `f16f992d` (lane clean; the round-87 verifier spot-check commit). …
```

`plans/round-88.md` at the fleet root is a **stale earlier revision** of the tabi lane's
`plans/round-88.md` (it differs: "plus the D2–D4 routed defects" vs the lane's "plus the
round-87 spot-check's routed defects D1–D4"), and `docs_placeholder` is a truncated copy of the
same header. The fleet repo has **never** tracked a root `plans/` directory
(`git log --all --oneline -- plans` → empty; every other lane keeps `plans/` inside its own
lane repo, e.g. `chousa-shokunin/plans`, `kama-shokunin/plans`). mtime 08:37:53 — i.e. during
the r88 wave, at the same minute the tabi lane's `controls/c2/` was created (08:37).

This looks like a **scratch/copy artifact of the tabi lane's own work** that landed at the
fleet root instead of in the lane, rather than a foreign lane writing here. It is untracked and
does not touch any tracked fleet file. It is *not* a tabi **record** (the authoritative
`plans/round-88.md` inside the lane is correct and committed), so it does not falsify any
claim. **Smallest remediation:** delete the two untracked fleet-root files
(`plans/round-88.md`, `docs_placeholder`) — they are stale duplicates; the lane copy is
authoritative. I have **not** deleted them (out of my read-only bounds and they are not mine).

---

## Axis 5 — do-nothing controls — **PASS**

Both control artifacts exist and reproduce their claimed exit codes and finding ids, verified
by re-running the frozen counter read-only:

**`controls/c1/nowork-r87-under-r88.json`** (r87 scored receipt under the r88 counter):

```
$ node scripts/check-showpicker-round88.mjs --lane <ABS lane> \
    --receipt corpus/evidence/round87/chromium-showpicker/receipt.json … --json >/dev/null
nowork exit=1
```

Committed artifact: `verdict "findings"`, `checkCount 99`, finding ids =
`["schema","nonce-shape","nonce-expected","driver-pin","fixture-hash","plan-frozen","leg-order",
"leg-records","plan-calls", …]` — **`schema` and `plan-frozen` both present**, exactly as the
claims and LOG name them.

**`controls/c1/noreceipt.txt`** (unreadable receipt):

```
$ node scripts/check-showpicker-round88.mjs --lane <ABS lane> --receipt <absent.json> … --json >/dev/null
noreceipt exit=2
```

Committed artifact: `verdict "unreadable"`, finding id `receipt-unreadable`,
detail `ENOENT: … open '…/controls/c1/absent.json'`.

Both match `claims.json` `C1.doNothingControl` verbatim: *"exit 1, findings incl. `schema` and
`plan-frozen`; controls/c1/noreceipt.txt is the exit-2 unreadable control"*. Note the
`nowork` artifact's `checkCount 99` is the **r87 receipt's** count under the r88 counter — it is
correctly a *control*, not the scored count (102); no record conflates the two.

---

## Axis 6 — lane records vs scored outputs — **FINDING**

I read the SCORECARD round-88 section, the LOG round-88 entry, the SKILL round-88 registry and
the knowledge note, and compared each against the committed scored outputs
(`scored/counter-a.json`, `battery-a.json`, `killpower-a.json`, `selftest.json`).

### What the committed scored outputs actually say

```
counter-a.json : verdict clean, checkCount 102, findings []
battery-a.json : cases 215, failed 0, coverage {declared 102, covered 102, uncovered [], unknown []}
killpower-a.json: mutants 69, killed 69, survived 0, crashed 0, unapplied []
selftest.json  : clean true, cases 11, failed []   (10 gates + the gate-selftest fan-out)
```

### Records that agree (PASS)

- **SCORECARD** (r88 section, line 4261): "Scored (r88): 102 checks, battery 215/215, kill
  power 69/69, selftest 10/10, record drift 4 → 0." — 102 ✔, 215/215 ✔, 69/69 ✔, 10/10 ✔.
- **SCORECARD** (line 4262): "Digests: D 4daf8817, nonce tabi-r88-l1-86f1dcec. 102 checks,
  battery 215 cases, kill power 69 mutants." — D matches the committed freeze digest ✔, nonce ✔,
  102 ✔, 215 ✔, 69 ✔.
- **LOG** (r88 entry): "37 legs / 102 checks … `negatives-showpicker-round88.mjs` (215 cases,
  coverage 102/102), `kill-power-round88.mjs` (69 mutants, 69/69), `selftest-r88-gates.mjs`
  (10 gates), `check-record-drift-r88.mjs` (4 statements)" — all ✔. (Verified independently:
  the committed selftest runner has exactly 10 `gate(...)` calls, and the drift gate has 4
  statements.)
- **SKILL** `## Round 88 gate registry`: "check-showpicker-round88 (102 checks)", "Driver …
  (37 legs …)", "Battery … (215 cases, coverage 102/102)", "Kill power … (69 mutants, 69 killed,
  0 survivors, 0 crashed)", "Record drift … (3 → 0 mismatches)", "Self-test … (10 gates, plus
  the four isolated `--selftest` modes as gate `gate-selftest`)" — 102 ✔, 37 ✔, 215 ✔, 69/69 ✔,
  10 gates ✔, 4 statements ✔, 3→0 ✔ (measured: `claims 4, mismatches 0`).
- **Knowledge note** `corpus/knowledge/chromium-showpicker-runtime-round-88.md`: the ten-token-form
  law, the three new r88 legs with their raw page-read `accept` attributes, the "accept is not a
  validator on a programmatic answer" framing, the r86/r87 carried arms, and the declared limits
  ("Seven token forms" is used in the *limits* section as the r87 baseline the note supersedes —
  the measured count in the laws section is ten; both statements are individually accurate in
  their own scope).

### F-1 — FINDING (medium): the frozen `claims.json` C2 leg (b) contradicts the committed
### measurement and the same file's own kill rule

`claims.json` at `HEAD` is internally inconsistent about the C2 BEFORE control:

```
C2.legs.b : "the BEFORE control … exits 1 with mismatches 3 (scorecard-tallies,
             selftest-wording, quality161-sweep; gate-selftest is structural and already holds)"
C2.killRule: "after mismatches != 0 or before mismatches != 4 -> NOT verified
             (before amended from 3 to the measured 4; see frozenAmendments)"
```

The `frozenAmendments` entry says the *measured* value is **4**, with `failed` =
`["scorecard-tallies","selftest-wording","gate-selftest","quality161-sweep"]` — i.e. `gate-selftest`
is **red** at base, not "structural and already holds". The **leg (b) prose was never updated**
to match; only the kill rule and the amendment ledger were. `R88Exec3.md` (lane's own exec
report) records the same contradiction explicitly: *"Claims leg b … and the spec's
`(expect 3 mismatches at base)` are both **contradicted** by this run: the frozen gate yields 4
at base."*

**Why 4 and not 3 is right:** the `gate-selftest` statement reads
`scripts/check-record-drift-r88.mjs`, `scripts/selftest-r88-gates.mjs`,
`scripts/check-showpicker-round88.mjs`, `scripts/negatives-showpicker-round88.mjs` and
`scripts/kill-power-round88.mjs` **from the `--lane` path**. Base `f16f992d` predates every r88
script, so all five sub-conjuncts are false there — the statement cannot be green on a bare base
worktree by construction. The gate bytes are unchanged across D1/D2/HEAD (`3953e34`), so this is
a property of the base, not of a gate edit.

**Impact.** The frozen kill rule says `before mismatches != 4 → NOT verified`, and the measured
value is 4 — so the *kill rule* is satisfied and the round is not killed. But a reader who takes
leg (b) at face value would expect 3 and would look for a `gate-selftest`-green base, which no
construction in the lane produces. Leg (b) is a **record statement about a measured control**,
not a predicate, pin, prior, threshold or kill rule — amending it to match its own file's
kill rule and the measured control is a record correction, not a change to any gate.

**Smallest remediation:** in `claims.json`, update `claims.C2.legs.b` to name the measured
value and the measured `failed` set (4; `scorecard-tallies`, `selftest-wording`,
`gate-selftest`, `quality161-sweep`), and record the edit as an additional
`frozenAmendments` entry referencing the existing one. The kill rule, the gate bytes and the
thresholds stay untouched.

### F-2 — FINDING (low): two cited scored artifacts do not exist for r88

`SCORECARD.md` (r88 C2 row) and `LOG.md` (r88 entry) both cite
**`scored/drift-before.json`** and **`scored/drift-a.json`** as the r88 drift evidence:

```
SCORECARD.md:4238  … before (base `f16f992d` worktree): **4 mismatches** (…) — `scored/drift-before.json`); after: **0** of 4 (`scored/drift-a.json`)
LOG.md:4040        … the C2 before control is the same frozen gate on a base `f16f992d` worktree (4 mismatches, `scored/drift-before.json`, measured by R88Exec3).
```

Neither file exists in the lane:

```
$ ls .ufo/waves/round-88/scored/drift-before.json .ufo/waves/round-88/scored/drift-a.json
ls: cannot access '.ufo/waves/round-88/scored/drift-before.json': No such file or directory
ls: cannot access '.ufo/waves/round-88/scored/drift-a.json': No such file or directory
$ ls .ufo/waves/round-88/scored/
battery-a.json  counter-a.json  killpower-a.json  selftest.json
$ ls .ufo/waves/round-87/scored/
battery-a.json  counter-a.json  drift-a.json  drift-before.json  killpower-a.json  selftest.json
```

The r87 round kept both; r88 kept neither. The *values* the records cite are correct and
independently re-verified by me (before = 4, after = 0 — the after value is reproduced live:
`node scripts/check-record-drift-r88.mjs --lane <ABS lane> --json` → `claims 4, mismatches 0`,
`failed []`, exit 0; and `scored/selftest.json` gate `record-drift` → `exit 0 {"claims":4,
"mismatches":0,"failed":[]}`). The defect is that the **cited receipt artifact is absent**, so
the two record lines point at a file a reader cannot open. The before-control was measured in a
throwaway `git worktree add --detach … f16f992d` under
`/fast/scratch/hyaku/tabi-r88/R88Exec3/base`, which was removed before that seat yielded
(`R88Exec3.md`), so the "before" number currently has no committed artifact either — only the
prose in the record and the exec report.

**Smallest remediation:** commit the two r88 drift artifacts under
`.ufo/waves/round-88/scored/` (`drift-before.json` = the base-`f16f992d` run's JSON, `drift-a.json`
= the after run's JSON) so the two cited paths resolve — mirroring r87's layout. This adds
evidence only; it changes no gate, pin, threshold or kill rule. If the integrator prefers not to
add files, the alternative smallest fix is to re-cite the two records to the artifact that does
exist (`scored/selftest.json`, gate `record-drift`) — but that file carries only the *after*
value, so committing `drift-before.json` is the better remedy.

---

## Additional provenance observations (not findings against the round)

1. **The freeze churn D2→D6 was real and is documented.** Between `86f1dcec` (D1) and `82d0c2b8`
   (D6) the lane re-froze five times. Each cause is recorded in `plans/round-88.md`
   §Re-freeze history and in `corpus/lessons/round-88.md`:
   - **D2** (`138bb883`): the selftest runner still asserted the r87 check count 99 → re-pinned
     after 102 was measured; the prior set replaced (the r87-derived priors had 34 legs and made
     the battery's `replay-event-timeline` forgery fail `plan-frozen` before reaching the replay
     rule) — the two genuine 37-leg r88 probes.
   - **D3** (`93500a4e`): the runner gained the `gate-selftest` gate.
   - **D4** (`77656d8a`): the kill-power mutant `no-selection-empty-dropped` still named the
     pre-r88 empty-state key list, so it was **unapplied** on the frozen counter — **68/69
     killed, 0 survived**. I confirmed this independently and deterministically:
     ```
     pinned kill-power (ed4ee813) from-string occurrences in COMMITTED counter = 0
     WORKING kill-power (617c2c68) from-string occurrences in working counter    = 1
     ```
     The D4 from-string now carries `ac`/`au`/`amc`; the committed `killpower-a.json` shows
     `69 killed, 0 survived, 0 crashed, 0 unapplied` — the fix landed and was re-run.
   - **D5** (`c3fa144b`): the runner's `gate-selftest` read `r.stdout` from a helper that
     already returns parsed JSON, so every mode looked red; it now reads the parsed object and
     passes `--lane` to the drift mode.
   - **D6** (`4daf8817`, committed): critic-driven tally/selftest strengthening.
   The lesson file mines this as a `mid-wave-re-freeze-churn` mistake. **This is churn, not
   predicate drift** — the plan states "Predicate, counter, battery, kill-power list, thresholds
   and kill rules unchanged" for D2, and I verified the counter's check count went 99→102 as a
   *record* of the new legs, with the counter's own `leg-order`/`plan-frozen` checks green.

2. **The D4 kill-power defect is the round's most interesting near-miss**, and it is worth
   recording why it was caught: the pinned kill-power list was **unapplied** rather than
   **survived** — the runner distinguishes the two, and the unapplied mutant is reported in the
   `unapplied` array. Had the runner folded "unapplied" into "survived", the kill-power gate
   would have gone red; instead it went red *loudly* via `crashed`/`unapplied` counters. Note
   that `kill-power-round88.mjs`'s own exit contract treats a non-empty `unapplied` as exit 1
   (`survivors === 0 && crashed === 0 && summary.unapplied.length === 0 ? 0 : 1`) — so the
   D4 state would have failed the gate, and the D6 `killpower-a.json` proves it was re-run.

3. **The knowledge note's `recheck:` front-matter line points at the r87 counter.** The
   committed note's front-matter `recheck:` is
   `node scripts/check-showpicker-r87.mjs … --expect-nonce tabi-r87-l1-3dd4b0802d67 … → exit 0,
   99 checks` — i.e. it still names the **r87** script, the **r87** nonce and the **r87**
   prior set, while pointing at the **r88** receipt path. I ran exactly that command:

   ```
   note-recheck exit=1
   correct-r88-counter exit=0
   ```
   with `verdict "findings"`, `checkCount 102`, and failing checks `schema`, `nonce-shape`,
   `nonce-expected`, `driver-pin`, `fixture-hash`, `plan-frozen`, `leg-order`, … — the r87
   counter rejects the r88 receipt, as it must. So the note's recheck line, as written, does not
   reproduce the "exit 0, 99 checks" it claims. The note body likewise says "The r88 counter
   re-derives all of them (**99 checks**)" — the r88 counter measures **102**.

   This is a **stale front-matter/prose artifact carried from the r87 note**, not a claim about
   the r88 gate. I am reporting it rather than filing it as a finding because it is a
   re-checkability defect in a *recheck recipe* (not a predicate/pin/threshold/kill rule), and
   the authoritative C1 numbers in SCORECARD/LOG/SKILL/claims are all correct at 102. **Smallest
   remediation:** repoint the note's `recheck:` line at `scripts/check-showpicker-round88.mjs`
   with the r88 driver pin, r88 nonce, r88 fixture sha and r88 prior set, and correct "99
   checks" → "102 checks" in the note body. The correct command and its `exit 0 / 102 checks`
   are already proven above (Axis 2).

---

## Bounds attestation

- No commit, push, or mutating git/jj command was run anywhere. All git calls were read-only
  (`log`, `show`, `cat-file`, `ls-files`, `status`, `diff`, `rev-parse`, `ls-tree`).
- No lane record was edited: `SKILL.md`, `SCORECARD.md`, `LOG.md`, `plans/`, `corpus/**`,
  `scripts/**` are untouched. The single file written is this report,
  `.ufo/waves/round-88/w1/R88Sentinel.md` (my seat's specified path).
- Nothing was written into `corpus/evidence/round88/` or `.ufo/waves/round-88/scored/`.
- No fixture repo was created (no commit was needed); the `git worktree add` used by
  `R88Exec3` was that seat's and was removed before it yielded — I did not create one.
- The fleet repo was not written to. I read `git status` there only. The two untracked
  fleet-root duplicates (F-3) were left in place.
- Scratch: `/fast/scratch/hyaku/tabi-r88/R88Sentinel/` was created for read-only re-runs of the
  frozen gates (no file was written into it). **Removed before this report was written.**
- No host sysctl, service, or PATH directory was touched. No package was installed or upgraded.

## Reconciliation of the two findings with the "never amend" rule

Neither F-1 nor F-2 proposes changing a predicate, counter, pin, prior, threshold or kill rule.
F-1 asks for a *record sentence* inside the already-frozen `claims.json` to be brought in line
with the **same file's own** kill rule and with the measured control value (the value the ledger
already declares), and to be logged in the file's existing `frozenAmendments` ledger. F-2 asks
for **evidence files to be committed** at the paths two records already cite, or for the two
citations to be repointed at an artifact that exists. The frozen gate bytes, the pins, the
prior set, the thresholds and the kill rules are, in both cases, to remain exactly as they are.
