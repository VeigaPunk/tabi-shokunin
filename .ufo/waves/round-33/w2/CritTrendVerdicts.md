# CritTrendVerdicts — pre-judged trend verdicts at `042d6d9a` (tabi round 33, w2)

**Verdict.** At `042d6d9abf97d567d495652a85eabc851b81adc1` the round reads **expansion: improved (holds)**, **quality:
improved in substance, one defect (low, flips to harmed if left unmarked)**, **discernment: unprovable-but-better** (the
outside spot-check is owed to the closure and is not recorded). No axis is harmed: adjacency shows no absorbed ground
and both frozen predicates are true under my own runs; calibration reads `mismatches 0`; operability regresses nowhere
that I can reach (28/28 no-harm commands exit 0 at REV with the baseline's exit codes, and the live leg admits 16/16 at
REV). The quality defect is evidential, not numeric: the new admitted entry
`corpus/knowledge/bidi-runtime-gate-v2-round-33.md:301-302` cites `w1/ExecLiveLeg/sandbox-probe.txt` for two facts that
file does not contain (I grepped it myself), and `:298-302` states an integrated live reading no committed receipt
carries. Both were found by w2 `CritV2Note` F1/F2 and are **unmarked in the corpus at REV**; LEARNING's `quality:
harmed` clause is "an entry is found false or stale and left unmarked", so the closure must land an append-only
correction (or the round's errata intake) for F2 and either a receipt or a de-claimed wording for F1, or quality is
reported harmed, not improved. One closure constraint follows from the same reading: C2 is a routed defect on an axis
already at 9, so the executed disposition must read "improved in substance, scalar held" (precedent
`SCORECARD.md:1400`); a 9→10 claim would be premature saturation.

## Evidence

Scratch: `/fast/scratch/hyaku/tabi-r33/CritTrendVerdicts/`, one `--shared` clone, `git -C "$S/clone" rev-parse
--show-toplevel` = that dir, detached at `042d6d9a`, `status --porcelain` 0. Every script ran in the clone, `TMPDIR`
under the scratch dir; the lane was read only. No subagents, no lane writes, no sibling writes.

### Both frozen claim predicates at REV (frozen counter bytes, my runs)

```
$ node .ufo/waves/round-33/counters/c1-adjacency-sweep.mjs --rev 042d6d9a --repo "$PWD" --fleet /home/vgpnk/Projects/shokunin --json
{"predicate":true,"candidates":52,"mapped":9,"screened":43,"unaccounted":0,"newMapped":4,
 "adjacency":{"verdict":"clean","rows":14,"verified":14,"findings":0}}            # exit 0
$ node .ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs --rev 042d6d9a --repo "$PWD" --json
{"predicate":true,"honest":{"H0":true,"H1":true,"H2":true},"forgeriesAccepted":0,
 "acceptedForgeries":[],"selftest":{"exit":0,"last":"BIDI_RUNTIME_SELFTEST verdict=clean cases=44 passed=44"},
 "digestLiterals":[]}                                                              # exit 0
```

Receipts: `.ufo/waves/round-33/w2/CritTrendVerdicts/c1-counter-at-042d6d9.json`, `c2-counter-at-042d6d9.json`,
`counter-exits.txt`.

### Expansion — improved

- One new admitted knowledge entry: `git diff --name-status b7d16fb 042d6d9 -- corpus/knowledge` → `A
  corpus/knowledge/bidi-runtime-gate-v2-round-33.md`; knowledge count 51 → 52
  (`git ls-tree --name-only <rev> corpus/knowledge/ | grep -c '\.md$'`).
- The ground is not on the coverage map: no prior knowledge file names forgery (`grep -rln 'forgery\|forgeries'
  corpus/knowledge/` → only this entry); `corpus/README.md:716` and the round-32 frontier row hold capability rows and
  `runtime-held`, and `corpus/README.md:765-771` is where gate-refusal semantics and live-leg launch rules enter the
  map, with a new frontier row "BiDi receipt provenance".
- Each source is a mined row opened this round: `check-sources` at REV → `SOURCES_GATE verdict=clean rows=129
  tiers=A:114,B:6,C:9 status=queued:15,mined:105,rejected:9 findings=0`, exit 0; S127–S129 name the entry
  (`grep -nE '^\| S12[789] ' corpus/SOURCES.md` → rows at `:141-143`, each carrying
  `bidi-runtime-gate-v2-round-33.md`).
- Claims I re-derived rather than read: honest run 1's `sessionId 10abbb479bdcc37a405098c5ea778bf0` (32 lowercase hex)
  and `context 31B8FE9C25C36020CBB175F250715903` (32 uppercase hex); `XDG_CONFIG_HOME` set on this host;
  `~/.config/chromium-flags.conf` 5 lines / 0 `--no-sandbox` / 1 `--load-extension`; `/usr/bin/chromium` 14,424 B
  `eaed39c3…`; v1's yes-filter at `scripts/check-bidi-runtime.mjs:508`; `DRIVER_ALLOW` six names at v2 `:144`.
- Caveat: the entry's live-leg bullet is under-anchored (quality F1 below), so one slice of the new ground rests on
  prose; the facts themselves reproduce (see operability).

### Quality — improved in substance, defect (low; harmful only if left unmarked)

- Errata landed and supersessions marked, append-only: 10 correction bullets in
  `corpus/knowledge/webdriver-bidi-runtime-round-32.md:213`+ (e.g. "four constructions" → five at the §8 bullet),
  round-32 lesson/README/LOG corrections, `SCORECARD.md:1657` 27→44 superseded by the round-33 correction lines,
  `SKILL.md:2626` likewise; `corpus/QUALITY.md` append (`git diff --numstat b7d16fb 042d6d9 -- corpus/QUALITY.md` →
  `55 0`).
- Re-verification: S125's tag bytes re-fetched and equal, kept `90d` with the reason recorded (`corpus/lessons/
  round-33.md` §Routed defects 3); `check-selfassessment` at REV → `mismatches=0 could_not_evaluate=115 superseded=41`,
  exit 0 (the `bf48b81` reading of 1, `.ufo/waves/round-33/measure/selfassessment-at-bf48b81.json`, was cleared by the
  one-line append-only correction in `042d6d9a`).
- **Defect F2 (low; false citation in an admitted entry, unmarked at REV).** `corpus/knowledge/
  bidi-runtime-gate-v2-round-33.md:301-302` attributes "setuid `chrome-sandbox` and
  `kernel.unprivileged_userns_clone=1`" to `.ufo/waves/round-33/w1/ExecLiveLeg/sandbox-probe.txt`; that file is 20
  lines and `grep -n 'chrome-sandbox\|userns\|setuid'` → **no match, exit 1** (my run). The facts are true and sit at
  `.ufo/waves/round-33/w1/ExecLiveLeg.md:105-106`. Found in w2 (`w2/CritV2Note.md` F2), not marked at REV.
- **Defect F1 (low).** `:298-302` states an integrated live reading (`live=true`, population 17 / admitted 16 /
  unmeasured 1 / distinct 16) with no committed receipt: every committed receipt with those counted fields says
  `live=false` (`measure/noharm-at-bf48b81.txt:7`, `w2/RerunNoHarm/noharm-at-042d6d9.txt:7`), and the reading is
  reproduced only by the w2 seat's `.ufo/waves/round-33/w2/RerunLiveV2/A1.json` (`live:true`, `clean:true`,
  `binding:null`, rev `042d6d9a`) — i.e. true, but not the entry's own anchor.
- w2 also found low false-provenance in round-33 prose outside the entry: `SKILL.md:2887` pins the canonical-selection
  cession to `kake PROVINCE.md:60-61` which does not state it (`w2/CritAdjacencyHarm.md` D1; the text is at
  `kake:355-358`), and `corpus/README.md:766` says "Every browser-domain line" where the frozen regex bounds the
  population (D2). Both are precision defects of the class the lane routes to errata; neither makes a number false.

### Discernment — unprovable-but-better (outside spot-check owed)

- Criteria 87–90 appended at `corpus/QUALITY.md:532,545,558,570`, each citing a lesson (87 §Gate; 88 §Mistakes; 89
  §Gate; 90 M1/M5) — no criterion without a lesson; independently reviewed `holds` with five low precision findings
  (`w2/RevQuality87.md`).
- Gate decisions are available for the closure's sample: C1 four admits (`corpus/adjacency.tsv:12-15`) plus 43 screens
  with closed reasons (36 `same-surface`, 4 `no-claim-declared`, 2 `not-browser-sense`, 1 `third-lane-report`) and
  verbatim quotes the frozen counter verifies; SOURCES three admits plus three named rejections with flips
  (`corpus/lessons/round-33.md` §Gate); C2 eight refusals with reason ids and H0/H1/H2 admits (§7).
- A w1 falsifier disagreement did become a grounded lesson/criterion (CritC1Counter/CritC1Axis → lesson M5, criteria
  88/90), but LEARNING's `improved` condition is the non-author spot-check, and `corpus/lessons/round-33.md:130` says
  it is owed to the closure. Hence unprovable-but-better, not improved.

### Axis harm

- **Adjacency — no absorption, no mis-screen found.** `PROVINCE.md` and the ten baseline map rows are byte-identical
  at `b7d16fb` and `042d6d9`; the four new rows are `split-declared` and each names the other side (row 12's sibling
  quote carries "tabi"; row 13's sibling quote carries "tabi"; rows 14/15 carry "kake" in the tabi quote —
  `corpus/adjacency.tsv:12-15`); `SKILL.md:2885-2890` states "none absorbs kake ground". I sampled the riskiest
  screens at the pinned sibling commits — `kake:338/340/352/358/362/394/431`, `kotoba:73`, `tsukuroi:150`,
  `kengaku:54`, `kake:72` — each states kake's own publisher-side scope (a boundary line, a section heading, or a
  limits/no-claim sentence), none a real overlap screened away. Low defects
  exist (CritAdjacencyHarm D1/D2/O1) but none is a wrong disposition of a real overlap.
- **Calibration — not harmed.** `SELFASSESSMENT verdict=clean … mismatches=0`, exit 0 at REV; the one mismatch
  introduced at `bf48b81` was superseded append-only, not deleted.
- **Operability — no regression reachable.** My runs: gate `--selftest` 44/44 exit 0; offline evaluation
  `population=17 admitted=16 failing=0 unmeasured=1 distinct=16 live=false` exit 0; `RELEASE_PINS` clean population 23
  (no M10 recurrence); gate-registry/adjacency/sources clean. The w2 no-harm sweep reproduces 28/28 commands exit 0
  with the baseline's exit codes (`w2/RerunNoHarm/noharm-compare.txt`, `noharm-at-042d6d9.txt`), and the live leg at
  REV admits 16/16 (`w2/RerunLiveV2/A1.json`, `B.json`, `binding:null`).
- **Freshness/depth/coverage — no claim, no harm.** S125/S127–S129 `90d`; the capability window is at position 1
  (`SCORECARD.md:1694`), so the stagnation nudge is inactive and no capability row enters (`:1713`).
- **Premature saturation — none claimed, one constraint.** C2 moves an axis already at 9 (routed defect, not a
  capability); the executed disposition must hold the scalar.

### Dangling anchor noted for the closure (not a trend)

`SCORECARD.md:1777` reads "Round-33 disposition: the `## Round 33 — executed disposition` section below", and that
section does not exist at REV (`grep -n 'executed disposition' SCORECARD.md` → only `:1777`; round 30/32 sections
exist, round 33's does not). The closure must land it, or the pointer stays false as written.

## Commands and exit codes

`.ufo/waves/round-33/w2/CritTrendVerdicts/gates-at-042d6d9.txt` (full lines + exit codes): selfassessment 0, sources
0, gate-registry 0, release-pins 0, bidi `--selftest` 0, bidi offline 0, adjacency `--at 042d6d9a --fleet …` 0.
Counters: `counter-exits.txt` → c1 exit 0, c2 exit 0. Sample-line reads used `git -C <sibling> show <pin>:PROVINCE.md`
(read-only). No browser was started by this seat: `pgrep -fa 'chromedriver|chromium'` shows only the host's
`earlyoom` line, no chromedriver/chromium process of mine.

## Deliverable paths

- Report: `.ufo/waves/round-33/w2/CritTrendVerdicts.md` (this file).
- Receipts: `.ufo/waves/round-33/w2/CritTrendVerdicts/{c1-counter-at-042d6d9.json,c1-counter-at-042d6d9.stderr,
  c2-counter-at-042d6d9.json,c2-counter-at-042d6d9.stderr,counter-exits.txt,gates-at-042d6d9.txt}`.
