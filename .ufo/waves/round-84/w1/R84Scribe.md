# R84Scribe — round 84 w1 report

Seat: scribe, axes `[depth]`, lane `tabi-shokunin`. Milestone: draft the r84 knowledge note, the r83
note erratum and the r84 lesson sections. **Nothing was committed; no lane file was edited.** All
three drafts are new files under `.ufo/waves/round-84/w1/R84Scribe/`; the only other write in the
lane tree is this report.

Scratch: `$HYAKU_SCRATCH/tabi-r84/R84Scribe/` (default `/fast/scratch/hyaku`), removed before this
report was written. Every command that produced a number below was run with an explicit absolute
`--work`/`--lane`; no `/tmp` path is cited as evidence. No tool was installed or upgraded (no
install was needed; the round's instruments are Node scripts already in the lane).

## Deliverables (drafts for the L1 to integrate)

| path | content |
|---|---|
| `.ufo/waves/round-84/w1/R84Scribe/knowledge-note.md` | draft of `corpus/knowledge/chromium-showpicker-runtime-round-84.md` in the lane's house style: `source`/`verified-at`/`recheck` header, five measured laws with receipt field paths, `## What a receipt of this shape cannot prove`, `## Frontier (named, not held)` |
| `.ufo/waves/round-84/w1/R84Scribe/r83-erratum-append.md` | the append-only erratum block for `corpus/knowledge/chromium-showpicker-runtime-round-83.md`, covering law 3's accept token, the "real PNG" claim and the law-count sentence, citing `R83Scribe/knowledge-note.md:61-64` |
| `.ufo/waves/round-84/w1/R84Scribe/lesson.md` | the r84 lesson's `## Gate` (sources opened; one admit and one reject with flip conditions), `## Mistakes` (one mined mistake: class, evidence, captured-by, fix) and `## Corrections` (the eight r83 routed defects, each `stale → true`) |

## Measurements — every number below was measured by this seat

### The committed receipt

`corpus/evidence/round84/chromium-showpicker/receipt.json`, sha256
`29347958cfbc2c246af1e89cb2286b8a21fbdbde5d55fd78e69e1bca732cf59c`, nonce
`tabi-r84-l1-a5bdb15ec9a7`, `driverSha256 f436b229df3a9194f074d9489dbeed54a24081afaae3d3027ff46aad4198807e`,
`fixture.sha256 64817252bbb79267b6256a0b004b54ea899358d503b878608621be861ff7738a`,
`fixture.child.sha256 c34d33e581426e40bcb995cee55152b12b81a7ba260c4233923d445cb4a7d68b`, **18 legs**,
`failures []`.

The three new legs, measured with
`jq -r '.legs[12,13,14] | "leg=\(.name) target=\(.target) childResult=\(.childResult|tojson) fileChooserOpened=\([.cdpEventLog[]|select(.method=="Page.fileChooserOpened")]|length) pageEvents=\(.pageEvents|length) childLate=\(.childLate) pca=\(.parentCrossAccess|tojson) childEvents=\(.childEvents|length) childActAfter=\(.childActivationAfter|tojson) stateAfter.s=\(.stateAfter.s|tojson)"'`:

```
leg=sp84-cross-origin-tel     target=te childResult={"ok":false,"name":"SecurityError","message":"Failed to execute 'showPicker' on 'HTMLInputElement': showPicker() called from cross-origin iframe."} fileChooserOpened=0 pageEvents=0 childLate=0 pca={"contentDocument":null,"windowDocument":"SecurityError"} childEvents=5 childActAfter={"isActive":true,"hasBeenActive":true} stateAfter.s=[]
leg=sp84-cross-origin-search  target=se childResult={"ok":false,"name":"SecurityError","message":"Failed to execute 'showPicker' on 'HTMLInputElement': showPicker() called from cross-origin iframe."} fileChooserOpened=0 pageEvents=0 childLate=0 pca={"contentDocument":null,"windowDocument":"SecurityError"} childEvents=5 childActAfter={"isActive":true,"hasBeenActive":true} stateAfter.s=[]
leg=sp84-cross-origin-text    target=tx childResult={"ok":false,"name":"SecurityError","message":"Failed to execute 'showPicker' on 'HTMLInputElement': showPicker() called from cross-origin iframe."} fileChooserOpened=0 pageEvents=0 childLate=0 pca={"contentDocument":null,"windowDocument":"SecurityError"} childEvents=5 childActAfter={"isActive":true,"hasBeenActive":true} stateAfter.s=[]
```

Child event sequences (the counter's own `CHILD_EVENT_SHAPE`): `legs[12]` `pointerdown@go12 …
click@go12`, `legs[13]` `…@go13`, `legs[14]` `…@go14`, five entries each, every one `isTrusted:true`
and `act:true`. `childState` on all three: `teValue:''`, `seValue:''`, `txValue:''`.

### Every r83 leg carried

Diffing the two committed receipts leg-for-leg (a Python/`jq` comparison of
`corpus/evidence/round83/chromium-showpicker/receipt.json` and
`corpus/evidence/round84/chromium-showpicker/receipt.json`): all fifteen r83 legs are present in
r84, in the same relative order, with identical `childResult`, identical `Page.fileChooserOpened`
counts, identical `read` `ret` hex and identical child value fields. The only differences are the
run-prefixed byte strings:

```
sp84-webkitdirectory-answer d  r83: [["inner-a.txt",19,"text/plain","tabi-r83-dir/inner-a.txt"], …]   r84: [["inner-a.txt",19,"text/plain","tabi-r84-dir/inner-a.txt"], …]
sp84-accept-answer        k  r83: [["tabi-r83-a.txt",22,"text/plain",""]]        r84: [["tabi-r84-a.txt",22,"text/plain",""]]
sp84-multiple-mode        m  r83: [["tabi-r83-a.txt",22,"text/plain",""]]        r84: [["tabi-r84-a.txt",22,"text/plain",""]]
sp84-accept-mime-answer   k  r83: [["tabi-r83-b.png",21,"image/png",""]]        r84: [["tabi-r84-b.png",21,"image/png",""]]
sp84-second-chooser-answer s  r83: [["tabi-r83-second.txt",28,"text/plain",""]]  r84: [["tabi-r84-second.txt",28,"text/plain",""]]
sp84-second-chooser-answer sValue  r83: "C:\fakepath\tabi-r83-second.txt"       r84: "C:\fakepath\tabi-r84-second.txt"
```

The PNG payload is byte-identical across the two generations:
`legs[16].uploadPng.hex = 89504e470d0a1a0a746162692d7238332d706e670a`, `size 21`, sha256
`575d88a4154ed4f5cc7e9d1f6fe9a508c31f08c934a6c99f0b8596920e947050`; decoded it is the 8-byte PNG
signature `89 50 4e 47 0d 0a 1a 0a` plus the 13-byte ASCII marker `tabi-r83-png\n`. The marker still
names r83 because the driver's *content* strings are pinned to the r83 bytes; only the file *names*
are r84.

### The counter — 80 checks, clean, and its exact decomposition

```
node scripts/check-showpicker-r84.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --receipt corpus/evidence/round84/chromium-showpicker/receipt.json \
  --expect-driver-sha256 f436b229df3a9194f074d9489dbeed54a24081afaae3d3027ff46aad4198807e \
  --expect-nonce tabi-r84-l1-a5bdb15ec9a7 \
  --expect-fixture-sha256 64817252bbb79267b6256a0b004b54ea899358d503b878608621be861ff7738a \
  --prior-set .ufo/waves/round-84/controls/c1/prior-set.txt --json
→ COUNTER_EXIT=0   "verdict": "clean", "checkCount": 80, "findings": []
```

The 80 ids decompose as **34** structural/binding + **3** `leg-*` meta + **18** per-leg shape +
**25** `*-law`. The r83 counter's 74 decompose 34 + 3 + 15 + 22, so the growth is exactly the three
new legs. All eight r82-carried law ids (`gesture-law`, `activation-law`, `mode-law`,
`cross-origin-nonfile-law`, `order-law`, `webkitdirectory-answer-law`, `accept-answer-law`,
`click-while-open-law`) are present in the r84 counter — measured, not asserted.

Replay limit as printed by the counter: `ownEvents 61, ownGaps 8`; the single prior gives
`priorEvents 61, priorGaps 3, absMatched 0, gapMatched 0, absNeed 31, gapNeed 3, escapeEvents 31,
refused false`. The prior is `.ufo/waves/round-84/controls/c1/probes/prior1.json` (nonce
`tabi-r84-probe4`, a **different** nonce, 18 legs); the prior-set file's sha256 is
`968844b3b59d0188409ffbfe7ab755ead6bf72086459aededd0d90c738a8c326`.

### The battery — the finding that matters most

**At the freeze pin** (`828dfcb7b0d4c467341411f3fd211682add7294474d910d426f0aab415103cba`, i.e. the
bytes committed at `84ebfa95`), run against the committed receipt in scratch:

```
node scripts/negatives-showpicker-r84.mjs --lane <lane> --real <receipt> … --work $S/battery --json
→ EXIT=1
  "cases": 156, "failed": 3,
  "coverage": {"declared": 80, "covered": 74,
    "uncovered": ["leg-sp84-cross-origin-tel","leg-sp84-cross-origin-search","leg-sp84-cross-origin-text",
                  "sp84-cross-origin-tel-law","sp84-cross-origin-search-law","sp84-cross-origin-text-law"],
    "unknown": []}
  failed case detail: "exit 1 expected leg-sp84-cross-origin-tel got [\"leg-sp84-cross-origin-tel\",\"no-selection-law\"] extra [\"no-selection-law\"]"
```

The pinned battery has **no** case for the three new legs at all:
`grep -c 'sp84-cross-origin-tel' <pinned battery>` → **0**. So at the frozen pin the battery exits
**1** (not 0) and the six check ids the r84 counter newly declares — including the three new
`sp84-cross-origin-{tel,search,text}-law` ids — have **no refusal witness**.

**With the three leg mutators, three law cases and the `LEG_ALSO` entries added** (the current
working-tree bytes, sha256 `42fcfedc…`, **not** the freeze pin), the same run gives
`EXIT=0, "cases": 162, "failed": 0, coverage 80/80, uncovered []`.

Consequence, measured: the selftest's `pins-match-freeze` gate now fails on **two** files:

```
files differing from freeze.txt: ["scripts/negatives-showpicker-r84.mjs","scripts/check-record-drift-r84.mjs"]
```

(the drift counter was amended after the freeze too — `31a3b0f4…` → `25c9586c…`, adding the
`r83note` read, the `knowledgeCount` gate and the r83-family gate). The committed
`.ufo/waves/round-84/scored/selftest.out` records `clean:false` with `failed: ["pins-match-freeze",
"record-drift"]`; the `record-drift` half has since gone green (see below) but the pin half has not.

This is a **freeze-pin** condition, not a predicate condition. I am not proposing any pin, counter,
prior, threshold or kill-rule change — the round's own mechanism for this is an explicit freeze
amendment (as r83 did at `27d5451b`), and the amendment must be made before the scored artifacts are
re-run, not after.

### Kill power

50 mutants, **50 killed, 0 survived, 0 crashed, 0 unapplied**, at both the pinned battery and the
extended battery. One caveat measured from the per-mutant `failed` counts: at the pinned battery
every mutant reports `failed` 4–6 (the battery's own three baseline failures ride along in every
mutant run), against 1–3 at the extended battery — i.e. the pinned battery's kill-power verdict is
weaker evidence than the extended one, exactly as its coverage number shows.

### Record drift

```
node scripts/check-record-drift-r84.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin --json
→ "claims": 10, "mismatches": 0, "failed": []
```

with per-claim detail `extensionToken=true untargeted=true frontier=true`,
`signature=true byteAcceptance=true`, `ledger=false lesson=true`, `ledgerOrLesson=true witness=true`,
`noWork69/41=true skill153=true laws8=true`, `skillBattery153=true`, `start=true end=true`,
`finalD=a5bdb15ec9a7 nonce=tabi-r84-l1-a5bdb15ec9a7 cited=["a5bdb15ec9a7"] wrong=[]`,
`checks=80 battery=162/0 kp=50/50`.

### Identity and counts

- `.ufo/waves/round-84/freeze.txt` sha256
  `a5bdb15ec9a78b86035cce91bd5e61ec38360c1102b4c6d1ca9c5142536db0fe` — the 12-hex prefix
  `a5bdb15ec9a7` is `claims.json`'s `digestsCommit`, and `tabi-r84-l1-a5bdb15ec9a7` is the lane
  identity nonce. `git rev-parse a5bdb15ec9a7` → `fatal: ambiguous argument` — as in r83, this is a
  freeze-file digest prefix, **not** a git object id. Freeze commit `84ebfa95`, identity commit
  `d90b7f55`.
- Sources registry: `grep -cE '^\| S[0-9]+ ' corpus/SOURCES.md` → **223**; `git diff a5d6ffbf --
  corpus/SOURCES.md` is **empty** — no row added or changed this round.
- Knowledge entries: `git ls-tree -r --name-only a5d6ffbf -- corpus/knowledge/ | grep -c '\.md$'` →
  **96**; `ls corpus/knowledge/*.md | wc -l` → **97** after this round's note. (The r83 tip
  `030dfc29` also shows 96; the r83 freeze-era commits `4cdf4def`/`27d5451b` show 95, because the
  r83 note was added at `5d6c34f0` and re-added at `615c97a1`.)
- r83 family as scored (correction #8): `round-83/scored/counter-a.json` → 74 checks clean;
  `battery-a.json` → 153 cases / 0 failed; `killpower-a.json` → 50 killed / 0 survived; `selftest.out`
  → clean, 9 cases, no failures. `round-82/scored/counter-a.json` → 64 checks, confirming the r83
  report's "69 checks (41 findings) reverse" was impossible as written.

### The r83 citation I was asked to use

`.ufo/waves/round-83-seats/R83Scribe/knowledge-note.md:61-64` reads exactly:

```
61:    *Naming, measured:* this leg's input is `#k`, whose attribute is `accept=".png"` — an **extension**
62:    token. The fixture's `accept="image/png"` input (`#accept`) is targeted by no leg, so the "MIME"
63:    in the leg's name is the delivered file's media type (`image/png`), not a MIME token inside
64:    `accept`. The MIME-token and `image/*` branches of the grammar stay unmeasured.
```

(the file is 169 lines; the seat artifact lives under `round-83-seats/`, not `round-83/w1/` — the
r83 wave's seat directory is `.ufo/waves/round-83-seats/R83Scribe/`, and `round-83/w1/` holds only
the seat reports. The erratum cites the seat artifact by the short form the r83 spot-check used.)

## Findings — for the canonical judge, in the round's own terms

1. **The freeze pin no longer matches the battery the round scores with.** At the pinned bytes the
   battery exits 1 with coverage 74/80 and the three new legs have no case; at the working-tree
   bytes it exits 0 with 162 cases and coverage 80/80. The passing battery and the frozen pin are
   different bytes. `pins-match-freeze` fails on `scripts/negatives-showpicker-r84.mjs` **and** on
   `scripts/check-record-drift-r84.mjs` (amended after the freeze). The committed
   `scored/selftest.out` says `clean:false`. **Until a freeze amendment lands and the scored
   artifacts are re-run at the amended pin, C1 leg (b) and the selftest leg (c) are not satisfied by
   the frozen bytes.** I do not propose amending any pin, counter, prior, threshold or kill rule —
   the round's own freeze-amendment mechanism is the path, and the amendments must precede the
   scored re-run.
2. **The receipt carries no input-type evidence for the three new legs** (measured: `grep -c
   'type="tel"'` over the receipt → 0; `legs[12].fixtureInputs` lists only the seven page-side ids;
   the counter's `fixture-descriptors` compares that same page-side list; `fixture.child.sha256` is
   only regex-checked and no `--expect-child-fixture-sha256` flag exists). The law is therefore
   "the element the leg's target id pointed at threw the exact SecurityError and opened nothing";
   the *type* is the harness's wiring, not the instrument's measurement. My knowledge-note draft
   states this as an explicit reject with its flip condition (a type readback in `childState`).
   R84Review1 §4b measured the same gap independently; R84Critic §4 reads the coverage label as
   honest under that reading.
3. **The r84 note's header must quote a `recheck` command that reproduces.** The draft's recheck
   line is the claims' counting command with the receipt's own driver pin, nonce and fixture hash;
   re-running it exits 0 with 80 checks, as measured above.
4. **The record-drift counter's `record-counts` claim now gates on `knowledgeCount === 97`,** which
   is a *working-tree* count (`readdirSync` on `corpus/knowledge`), not a committed-tree count. It
   is currently 97 (the new r84 note is present in the working tree but not yet committed), and the
   committed tree at `a5d6ffbf` holds 96. The gate is satisfiable either way once the note is
   committed; worth naming so the L1 does not read it as a committed-tree fact.
5. **The eight routed defects, one row each** (`stale → true`), are in the `lesson.md` draft's
   `## Corrections` table, with the measured evidence for each: defect 5 → the committed
   `nowork-r82-under-r83.json` gives `checkCount 69 / findings 41 / checks==false 41`; defect 6 →
   the reverse receipt was never committed and the r82 counter has 64 checks; defect 7 → the
   measured counts (SKILL battery 84→153, the eight r82-carried law ids, knowledge 96→97, attack
   roles 3→4, "three routed defects"→four); defect 8 → the r83 family is unchanged as scored
   (74/74, 153/153, 50/50, 9/9).
6. **The r83 erratum is an append, and the frozen law text is not rewritten.** The draft erratum
   block is written to be appended after the r83 note's existing `## Frontier` section. Its
   §"law-count sentence" item corrects the r83 note's "seven laws" to the eight r82-carried check
   ids — measured as present in both the r83 and the r84 counter.

## Out of scope for this seat (deliberately not done)

- No file outside `.ufo/waves/round-84/w1/R84Scribe/` and this report was created or edited — the
  integration of the three drafts into `corpus/knowledge/`, `corpus/lessons/round-84.md` and the
  r83 note's `## Erratum` is the L1's call, and the L1 already has in-flight versions of all three
  (`corpus/knowledge/chromium-showpicker-runtime-round-84.md`,
  `corpus/lessons/round-84.md`, the r83 note's `## Erratum (round 84, …)` block). My drafts are
  written to be diffed against those, not to replace them silently.
- No commit, no push, no `git`/`jj` mutation of any kind; `git log`/`show`/`ls-tree`/`status`/
  `diff`/`rev-parse` only, all read-only.
- No predicate, counter, pin, prior, threshold or kill rule proposed for change.
- The freeze-pin drift (finding 1) was **not** repaired by me; the repair is the L1's freeze
  amendment, and it must precede the scored re-run.

## Commands run (all read-only against the lane; scratch under `$HYAKU_SCRATCH/tabi-r84/R84Scribe/`)

```
sha256sum .ufo/waves/round-84/freeze.txt corpus/evidence/round84/chromium-showpicker/receipt.json
git log --format='%H %an %ci %s' -8 ; git show 84ebfa95:<script> ; git ls-tree -r --name-only <rev> -- corpus/knowledge
git rev-parse 84ebfa95 d90b7f55 ; git rev-parse a5bdb15ec9a7   # → fatal: ambiguous argument
node scripts/check-showpicker-r84.mjs --lane <lane> --receipt <receipt> --expect-driver-sha256 f436b229… --expect-nonce tabi-r84-l1-a5bdb15ec9a7 --expect-fixture-sha256 64817252… --prior-set <prior-set> --json          # exit 0, 80 checks
node scripts/negatives-showpicker-r84.mjs --lane <lane> --real <receipt> … --work $S/battery --json     # PINNED bytes: exit 1, 156/3, 74/80
node scripts/negatives-showpicker-r84.mjs --lane <lane> --real <receipt> … --work $S/wt/battery --json  # WORKTREE bytes: exit 0, 162/0, 80/80
node scripts/kill-power-r84.mjs --lane <lane> --real <receipt> … --work $S/killpower --json            # 50/50 killed, 0 survived, 0 crashed
node scripts/kill-power-r84.mjs --lane <lane> --real <receipt> … --work $S/wt2/kp --json              # 50/50 killed at the extended battery too
node scripts/check-record-drift-r84.mjs --lane <lane> --json                                          # 10 claims, 0 mismatches
node -e '<sha256 of each of the six frozen scripts vs freeze.txt>'                                    # 2 files differ
```

Scratch removed (`rm -rf -- $S`) before this report was written; the JSON receipts quoted above are
re-derivable from the commands and the committed lane bytes.
