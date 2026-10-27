# W1-40 — Executor40

Axes: **calibration**, **coverage**. Attack focus #4: one bounded executable verification of the
Playwright Firefox driver and the frozen C1 counter — syntax/runtime, receipt shape, counter
consistency, source/census/numstat.

All commands run from the lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin` (REV
`a8e7d50c04254bb19f9de08b31ca2aa811fbe7fc`) or from scratch
`/fast/scratch/hyaku/tabi-r38/Executor40/`. No lane production file was edited, no git state was
mutated, no tool was installed.

## 0. Frozen instrument identity — matches

```text
$ sha256sum .ufo/waves/round-38/counters/*.mjs scripts/playwright-firefox-loopback-round38.mjs
704da8068783b6c1debcefcf31a46cf503438e8974a27ebde73ade5053a890bb  c1-adjacency-sweep-v6.mjs
209d86a0cc6fd35f9f87d0e74a769df8666d952a5e9fdec8a75df60b149d57f7  c1-routed-defects.mjs
6d7a925b563cdb1dcf30828087f9600d0b0f9deb98df21deb54d2a7cf91e503c  c2-battery-mutants.mjs
6a14d8ca9200270e1fbd8537ddd74b986c181112eb97a9cfbc98dbb64047fecf  c2-firefox-bidi-v4.mjs
4cf3a8499ad30158dd03d0b518ce8a79967bd0afafd2ea0f8b5730b0b02e75c1  playwright-firefox-loopback-round38.mjs
```

All five equal `claims.json.frozenDigests`. Runtime substrate verified:
`firefox --version` → `Mozilla Firefox 157.0`; `playwright/package.json.version` → `1.64.0`;
`~/.cache/ms-playwright/firefox-1555/` present with `INSTALLATION_COMPLETE`.

---

## F1 (calibration, C1) — D1's `seats == 34` term is unreachable at any REV: its input file is untracked

`c1-routed-defects.mjs:100` reads `.ufo/waves/round-37/w1-results.json` through `blob(repo, REV, …)`,
i.e. from git objects. At REV that path does not exist in git:

```text
$ git cat-file -t a8e7d50:.ufo/waves/round-37/w1-results.json
fatal: path '.ufo/waves/round-37/w1-results.json' exists on disk, but not in 'a8e7d50'
$ ls -la .ufo/waves/round-37/w1-results.json
-rw-r--r-- 1 vgpnk vgpnk 165064 Oct 27 11:41 .ufo/waves/round-37/w1-results.json   # untracked
$ git status --porcelain | grep w1-results
?? .ufo/waves/round-37/w1-results.json
```

The file on disk carries `{"lane":"tabi","round":37,"wave":"w1","seats":34,…}`, so the number the
claim needs is real — but it is not *committed*. The lane's own convention is that this artifact
lands (rounds 27–36 all have a tracked copy):

```text
$ git ls-tree -r --name-only a8e7d50 | grep "w1-results" | head
.ufo/waves/round-27/w1-results.json
…
.ufo/waves/round-36/w1-results.json          # 36 is the last; round 37 is absent
```

Consequence: C1's predicate term `D1 … re-derived seats == 34` (`c1-routed-defects.mjs:229`,
`out.d1.seats === 34`) is false at every commit, and `d1.seats` is not even emitted by the counter
(`d1` output keys at REV: `stalePresent`, `supersedingCorrection`, `w2Absent` only). The D1
correction described in `claims.json:24-27` is a *SCORECARD append*; it cannot satisfy D1 on its own,
because satisfying D1 additionally requires landing a 165 KB round-37 wave artifact that no claim text
mentions.

**Falsifier / smallest correction:** commit `.ufo/waves/round-37/w1-results.json` (matching the
round-27..36 convention) and re-run; `d1.seats` must appear and equal 34. If that commit is
deliberately out of scope, D1's re-derivation term must be re-sourced to a path that exists at REV
(e.g. the committed `.ufo/waves/round-37/w1/` seat reports), not left unattainable.

## F2 (calibration, C1) — `claims.json` names a commit that does not contain its own bytes

`claims.json:5-6` states `"frozenAt": "98239d0…"` and `"baseline": "98239d0…"`. The file does not
exist at that commit; it is *added* at REV:

```text
$ git show 98239d0:.ufo/waves/round-38/claims.json
fatal: path '.ufo/waves/round-38/claims.json' exists on disk, but not in '98239d0'
$ git diff --stat 98239d0 a8e7d50
 .ufo/waves/round-38/claims.json | 59 +++++++++++++++++++++++++++++++++++++++++
 1 file changed, 59 insertions(+)
```

This is the exact defect class C1 is chartered to repair — a receipt stating a hash its evidence does
not reproduce — committed inside the frozen claim file itself. **Falsifier:** `git show
98239d0:.ufo/waves/round-38/claims.json` must succeed with bytes equal to the REV copy. **Correction:**
set `frozenAt` to `a8e7d50…`.

## F3 (calibration, C1) — two different frozen baselines; D6 accepts only the one `claims.json` does not name

`c1-routed-defects.mjs:26` hardcodes `BASELINE = '3f42a5c7…'` (round-37 verifier spot-check = last
round-37 commit = round-start). `claims.json:6` declares `"baseline": "98239d0…"` (a round-38 commit).
D6 (`c1-routed-defects.mjs:224-230`) requires the numstat receipt to name `BASELINE.slice(0,40)`:

```text
$ git log --format='%h %p %s' -4 a8e7d50
a8e7d50 98239d0 round-38: freeze calibration and Firefox capability claims
98239d0 3f42a5c round-38: add frozen-instrument candidates and Firefox driver
3f42a5c bf8ecd5 round-37 verifier spot-check (integrator, hyaku): non-author admit/reject
```

A seat that follows `claims.json` and writes a `98239d0..REV` window fails D6; a seat that satisfies
D6 writes a `3f42a5c…` window that contradicts `claims.json`. Note the two windows are materially
different: `98239d0..a8e7d50` contains *only* the 59-line claims freeze, so the claims-declared
baseline would exclude the round's own driver and counters from the round's numstat. **Falsifier:**
generate both windows and confirm only one passes D6. **Correction:** one baseline, named once.

## F4 (calibration, C1) — D6's required receipt shape has no precedent in the lane and is unspecified

D6 requires the numstat file to *name both endpoints* (`namesBaseline`, `namesRev`). The lane's
round-37 precedent is a bare numstat body with no header:

```text
$ git show a8e7d50:.ufo/waves/round-37/measure/numstat-at-34ed508.txt | head -3
46	0	LOG.md
97	0	SCORECARD.md
18	0	corpus/README.md
```

Running D6's own predicate against that precedent:

```text
namesBaseline false
namesRev false
lines 11
```

So a seat that reuses the lane's committed format fails D6, and `claims.json` never specifies the
header grammar (`baseline…rev`? which separator? 40-hex or 8-hex? — the counter accepts any 8-hex
`REV.slice(0,8)` anywhere in the file, which also admits a coincidental match). **Falsifier:** produce
the round-38 numstat in the round-37 format and observe `FINDING d6-window`. **Correction:** state
the header grammar in the claim, and carry the same grammar into the round-37 precedent's successor.

## F5 (calibration, C1) — D5's required census counts block has no producer anywhere in the lane

`claims.json:32-33` requires `.ufo/waves/round-38/measure/census-end.txt` to carry a counts block
(`rows`, tier histogram, status histogram) equal to the counter's parse of `corpus/SOURCES.md`.
Nothing in the repo emits that shape:

```text
$ grep -rln "census-end" --include=*.sh --include=*.mjs --include=*.py . | grep -v node_modules
./.ufo/waves/round-38/counters/c1-routed-defects.mjs
$ git show a8e7d50:.ufo/waves/round-37/measure/census-end.txt | head -2
tabi	W04	S058 duplicate url chromewebstore.google.com/detail/webmcp-model-context-tool/… across scopes
tabi	W04	S065 duplicate url git-scm.com/docs/git-rev-parse across scopes
$ git show a8e7d50:.ufo/waves/round-37/measure/census-end.txt | tail -1
tabi	ok	/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md
```

The only prior `census-end.txt` is an ad-hoc duplicate-URL warning list terminating in `tabi ok <path>`;
it contains no `rows:`/`tier:`/`status:` block. The round-38 receipt must therefore be hand-authored.

The counter's parse is correct and I reproduce it independently at REV (it is the number any D5 receipt
must carry):

```text
counterRows 143
tier {"A":127,"B":7,"C":9}
status {"mined":119,"queued":15,"rejected":9}
header: "| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |"
```

Column indices used by the counter (`c[4]`=tier, `c[8]`=status, `c.length >= 10`) align with that
header, and 143 matches the round-37 integration commit message (`f485cce … exit 0, tabi ok, 143 rows`).
**Falsifier:** a hand-written census receipt whose `rows` ≠ 143 is refused by `FINDING d5-rows` — the
check is sound; the gap is that the shape is undocumented and unproduced.

## F6 (calibration, C1) — D2/D3 silently misread a missing round-38 LOG section instead of refusing

`c1-routed-defects.mjs:117` and `:150` compute `log.slice(log.indexOf('## Round 38'))`. At REV there is
no such heading, so `indexOf` = -1 and `slice(-1)` yields the final character of the file:

```text
$ git show a8e7d50:LOG.md | grep -c "^## Round 38"
0
$ git show a8e7d50:LOG.md | tail -c 4 | od -c
…  .  \n
```

D2/D3 therefore evaluate a one-character string (`"\n"`) rather than refusing "round-38 section
absent". Today it fails closed (`d2.stated:null`, all six D3 hashes `present=false`), but the instrument
cannot distinguish *no section* from *section present without the tally*, and any future edit that
appends a matching phrase after the last heading would be measured against a truncated slice.
**Falsifier:** `git show <rev>:LOG.md | grep -c '^## Round 38'` → 0 while `d2.stated` is reported as
`null` rather than a refusal. **Correction:** `if (i < 0) F('d2-entry','no ## Round 38 section')`.

## F7 (calibration, C1) — frozen instruments cover an undeclared claim (C2b)

`claims[]` declares exactly C1 and C2. `frozenDigests` additionally freezes two instruments whose own
headers name a third claim:

```text
$ sed -n '2,3p' .ufo/waves/round-38/counters/c2-firefox-bidi-v4.mjs
// c2-firefox-bidi-v4.mjs — tabi round 38, claim C2b (operability: survivor-term control
// of the round-37 frozen v3 BiDi-runtime counter; the admitted-evidence semantics and the
```

Both execute clean, so this is a declaration gap rather than an unsound instrument:

```text
$ node .ufo/waves/round-38/counters/c2-firefox-bidi-v4.mjs --battery
{"schema":"tabi-r38-c2-battery-v1","h1Admits":true,"p1Refused":true,"…","clean":true}   EXIT=0

$ node .ufo/waves/round-38/counters/c2-battery-mutants.mjs
{"sha256Before":"6a14d8ca…fecf","sha256After":"6a14d8ca…fecf",
 "mutants":{"m5":{"status":1,"clean":false,"p1Refused":false},
            "m5b":{"status":1,"clean":false,"p1Refused":false},
            "m3":{"status":0,"clean":true,"p1Refused":true},
            "decoy":{"status":0,"clean":true,"p1Refused":true}},
 "expectations":{"m5_killed":true,"m5b_killed":true,"m3_classified":true,"decoy_clean":true,"restored":true},
 "verdict":"pass"}                                                                        EXIT=0
```

Red controls behave as designed (m5/m5b killed, m3 classified live-leg-only, decoy clean, digest
restored). **Falsifier:** a claims file that omits a frozen instrument's claim from `claims[]` is
internally inconsistent — the frozen bytes measure something the claim set does not assert.

## F8 (coverage, C2) — driver runs, and the two-run binding holds across processes

Two independent invocations, each `--runs 2`, four runs total:

```text
$ HYAKU_SCRATCH=/fast/scratch/hyaku/tabi-r38/Executor40 node scripts/playwright-firefox-loopback-round38.mjs --out receipt.json  --runs 2
{"wrote":"receipt.json","runs":2,"binding":true,"egress":0,"survivors":0,
 "firstShot":["3e0c070a75f041986f63792a036addf08f0915b79713fd655499c601ec56378c",
              "3e0c070a75f041986f63792a036addf08f0915b79713fd655499c601ec56378c"]}      EXIT=0
$ … --out receipt2.json --runs 2
{"runs":2,"binding":true,"egress":0,"survivors":0,"firstShot":["3e0c070a…","3e0c070a…"]} EXIT=0
```

Per-run step evidence is complete and non-trivial (identical in both runs):

```text
1 navigate.hydrated      {"url":"http://127.0.0.1:34535/a.html","ms":205}
3 shape                  {"staticText":"static paragraph never mutated","status":"hydrated","items":0}
4 screenshot.first       {"sha256":"3e0c070a…","bytes":20626}
5 click.effect           {"count":"1","items":1,"confirm":"confirmed 1"}
6 screenshot.after-click {"sha256":"072ae136…","bytes":22924,"differsFromFirst":true}
7 evaluate               {"innerWidth":800,"items":1}
8 history.traverse       {"pathname":"/a.html","title":"TABI-R38 fixture"}
9 history-reset-and-click{"countBefore":"0","countAfter":"1","status":"booting"}
11 console.quiet         {"errors":0}
httpLog: request/response ×6, every URL http://127.0.0.1:<port>/{a,b}.html
```

Independent survivor check after the runs: `ps -eo pid,args | grep -c 'firefox-1555/firefox/firefox'`
→ `0`. Click, navigation, evaluation and screenshot-difference evidence are real.

## F9 (coverage, C2) — `binding: true` is vacuous at `--runs 1`; the driver has no predicate and always exits 0

`c1…`-style guard is absent: `main()` parses `--runs` with no minimum (`:148-151`) and computes
`binding = new Set(firstShotSha256).size === 1` (`:163`), which is true for any single-element set.

```text
$ node scripts/playwright-firefox-loopback-round38.mjs --out receipt-runs1.json --runs 1
{"runs":1,"binding":true,"egress":0,"survivors":0,"firstShot":["3e0c070a…"]}              EXIT=0
```

The driver also has no predicate: the only exit paths are `process.exit(64)` on missing `--out`
(`:153`) and `process.exit(1)` on an uncaught exception (`:169`). A receipt with `binding:false`,
non-loopback egress or survivors would still exit 0. **Falsifier:** `--runs 1` printing `binding:true`
is a direct counterexample to "two cold runs … same first screenshot SHA" being *enforced* by the
counting command. **Correction:** refuse `runs < 2`, and make the predicate an exit-code term.

## F10 (coverage, C2) — egress sampling is 2 samples per run and starts after launch

Receipt: `egress {"samples":2,"nonLoopback":0,"lines":1}` per run. Two independent causes:

1. `:73` `await firefox.launch(...)` completes **before** `:76` starts the `setInterval(…, 400)`, so the
   launch window — where a browser would phone home — is never sampled.
2. `sh()` is `spawnSync` (`:58`), which blocks the event loop, starving the interval.

The detectors themselves are live and non-vacuous — I ran positive controls for each:

```text
# port-closure detector ( :141  ss -ltn | grep -c ":$port " )
listener on 127.0.0.1:39209 → grep -c ":39209 " = 1 ; grep -c ":1 " (closed) = 0

# egress detector ( :77-83  ss -tnp | grep -E 'pid=(…),'  then -vE '127\.0\.0\.1|::1' )
node connecting to 1.1.1.1:80, pid 645102 →
ESTAB … 192.168.0.253:60948  1.1.1.1:80  users:(("MainThread",pid=645102,fd=23))
driver's non-loopback filter on that pid → 1

# survivor detector ( :138 )
during a run it captured 3 firefox pids; after the run → 0
```

I then re-ran the egress question with a 100 ms external sampler that covers launch, page, and close
(no event-loop starvation):

```text
total sampled firefox socket lines: 123
non-loopback lines: 0
unique peers: 127.0.0.1:54412 (×90, the Juggler control socket), 127.0.0.1:39115, :38029, :36735, :41013, :40023, :34819
```

So the claim's "zero observed non-loopback sockets" **survives** a ~60× denser, launch-inclusive
sample on this host — but the driver's own receipt supports it with 2 samples and a blind launch
window. **Correction:** start sampling before `launch()`, use async `exec` (or a separate sampler
process), and record per-sample counts rather than `max(lines)`.

## F11 (coverage, C2) — receipt-shape defects: dead `firefoxVersion`, unused per-run profile, uncomputed loopback term

- `:157` initializes `firefoxVersion: null`; no assignment exists anywhere, so the field is permanently
  null. Version evidence survives only via `browserVersion` (`"157.0"`, from the extra probe launch at
  `:158`). `grep -n firefoxVersion` returns exactly one line — the initializer.
- `:72` `const profile = mkdtempSync(join(profileRoot, 'profile-'))` is never passed to `launch()`
  (`:73` is `firefox.launch({ headless: true })`, no `userDataDir`), so the per-run profile dirs stay
  empty and "cold run" isolation is Playwright's internal temp profile, not the driver's recorded
  artifact. `runOnce({ out, … })`'s `out` parameter is likewise unused.
- The driver records request URLs but computes no `loopbackOnly` boolean; the predicate term
  "loopback-only requests" must be eyeballed from `httpLog`. I verified it by inspection (all six
  events are `http://127.0.0.1:<port>/…`), but the receipt carries no such assertion.

**Falsifier for the shape claims:** `node -e` over the receipt shows `firefoxVersion === null` and
`Object.keys(run)` contains no per-run profile path.

## F12 (coverage, C2 source row) — S144 does not exist at REV, and opening it moves D5's census number

`claims.json:29` scopes S144 to C2; `claims.json:41` requires "a cited newly opened source row".

```text
$ git show a8e7d50:corpus/SOURCES.md | grep -E '^\| S14[34] ' | cut -c1-120
| S143 | git-replace manual — https://git-scm.com/docs/git-replace | docs | A | …
$ git show a8e7d50:corpus/SOURCES.md | grep -oE '^\| S[0-9]+' | tail -1
| S143
```

S144 is absent (last id S143), so C2's target is integration work, as expected. The coupling worth
recording: opening S144 changes the SOURCES.md row count 143 → 144, which is exactly the number D5's
census receipt must carry (F5). C1's D5 and C2's source row are therefore not independent — a seat that
lands S144 without regenerating the census receipt produces `FINDING d5-rows`, and vice versa.
`corpus/knowledge/playwright-firefox-loopback-round-38.md` is likewise absent at REV (tracked knowledge
rows matching playwright/firefox: `playwright-accessible-locators-and-snapshots.md`,
`webdriver-bidi-firefox-runtime-round-35.md`).

---

## C1 counter execution summary

```text
$ node .ufo/waves/round-38/counters/c1-routed-defects.mjs --rev a8e7d50… --repo . --json
EXIT=1   predicate=false   findings=14
d1 {"stalePresent":true,"supersedingCorrection":false,"w2Absent":true}          # no seats key
d2 {"stated":null,"recomputed":{"ok":23,"finding":11,"error":0,"none":0,"reports":34}}
d3 {6 hashes: presentInR38Section=false, isCommit=true, ancestorOfRev=true; freezeLandingStated=false}
d4 {}   d5 {}   d6 {}
```

Syntax and runtime are sound; the predicate is false at the frozen REV as expected for uncommitted
wave work. D2's recompute is internally consistent (I recounted `bySeat`: 34 entries, exactly
`{"ok":23,"finding":11}`, no third class) and equals the tally the claim states. The defects that are
*not* explained by "work not yet committed" are F1 (unattainable input), F2 (self-description),
F3/F4/F5 (unspecified or unprecedented receipt shapes) and F6 (silent misread) — each is a property of
the frozen instrument, not of the missing corrections.

## Net assessment

C2's runtime capability is real and reproducible on this host (4/4 runs, cross-process first-shot
binding, zero survivors, zero non-loopback sockets under a denser independent sample), but its
counting command enforces nothing (F9) and its egress evidence is thin and launch-blind (F10).
C1's counter is executable and its D2/D5 parses reproduce exactly, yet its predicate is currently
unattainable (F1) and three of its receipt requirements are shapes the lane has never produced
(F3–F5) — so "predicate true at measured REV" cannot be reached by the described corrections alone.
Calibration is harmed more than coverage: the frozen claim file itself names the wrong freeze commit
(F2) and the wrong baseline (F3).

No tools installed (Playwright 1.64.0 and Firefox 157.0 were already present; no pacman transaction).
Scratch `/fast/scratch/hyaku/tabi-r38/Executor40/` removed after writing this report.

VERDICT finding

Report: .ufo/waves/round-38/w1/Executor40.md
