# CritErrataDispositions — the lesson's carried-errata disposition table, its count, and the four landed limit texts

**Verdict.** The disposition table in `corpus/lessons/round-32.md:88-98` agrees with the three wave-1 erratum files on
every one of E1–E27: each erratum appears exactly once, in the bucket its own scribe's file gives it, and no carried
draft was silently landed — I re-checked the four documents and `corpus/lessons/round-31.md` for the draft text and
found none (`git diff --numstat 4181fff b234a58 -- corpus/lessons/round-31.md` is empty; the only knowledge-entry
addition is the S123/recheck errata, not errata-A's E3 limit record). "Carried at round end: 16 of 27" is
arithmetically right (27 − 4 closed − 3 refused − 4 landed = 16, with E19's open arm counted once), and the four
landed limit texts' **line anchors are exact at `b234a58`** — the two counters are byte-identical to `frozenDigests`
and every cited document line sits below an append-only insertion (0 deleted lines in all six documents), so no anchor
drifted. What does not hold is content inside two of those landed texts: the E24 bullet's enumeration sums to 189, not
the 195 findings it names, and its closing instruction pairs a revision's zero with a different revision's residual
(the zero exists only where the reading is 202 findings / 106 refused); the E27 bullet's self-description ("state the
oracle tally once") is false of the corrections it describes; and E15/E16/E23 are filed under a row headed "closed"
while they are refusals whose defects remain live at `b234a58` — a label defect only, since the carried count already
excludes them. Nothing here needs a counter change: every fix is an append-only sentence.

## What I attacked

`.ufo/waves/round-32/w1/ScribeErrata{A,B,C}.md` and their `errata-*.md`, against the lesson table at the integrated
revision `b234a58920134424e0d104f137311ff54a16d26b`, plus the frozen reading every one of those texts quotes
(`.ufo/waves/round-32/baseline/c2-J1-do-nothing.json`) and a clean-counter reading at REV. Lane files were read only;
the only clone is my own, at REV, `git status --porcelain` empty.

## Evidence — commands and exit codes

All lane scripts ran in `/fast/scratch/hyaku/tabi-r32/CritErrataDispositions/clone`
(`git rev-parse --show-toplevel` = the clone, detached at `b234a58`), `TMPDIR` under that scratch, counter JSON
redirected to a file (errata E42: a pipe truncates this counter's output).

| # | command | exit | result |
|---|---|---|---|
| 1 | `git -C …/clone rev-parse HEAD` | 0 | `b234a58920134424e0d104f137311ff54a16d26b` |
| 2 | `git -C …/clone status --porcelain \| wc -l` | 0 | `0` |
| 3 | `sha256sum clone/scripts/check-selfassessment.mjs clone/scripts/check-bidi-runtime.mjs` | 0 | `77b5c8ed…c6a9`, `2f25af5a…c393` — equal to `claims.json` `.frozenDigests` |
| 4 | `git diff --numstat 4181fff b234a58 -- SKILL.md corpus/README.md SCORECARD.md LOG.md corpus/QUALITY.md corpus/lessons/round-32.md` | 0 | `135/0`, `41/0`, `62/0`, `106/0`, `37/0`, `136/0` — insertions only, **0 deletions** |
| 5 | `git diff --name-only 4181fff b234a58 -- scripts/` | 0 | only `scripts/bidi-loopback-round32.mjs` (new file) |
| 6 | `git diff --numstat 4181fff b234a58 -- corpus/knowledge/rate-signal-decision-table.md` | 0 | `20/0`; added lines are §Errata round 32 (S123 + the `180d`→`365d` reading), not errata-A's E3 limit record |
| 7 | `git diff --numstat 4181fff b234a58 -- corpus/lessons/round-31.md` | 0 | empty — E1/E5/E17 drafts not landed |
| 8 | `jq` over `.ufo/waves/round-32/baseline/c2-J1-do-nothing.json` | 0 | findings 195; refused 104; superseded 21; agreeing 52; counted 18; mismatches 18 |
| 9 | same, per class | 0 | m1 109 = 27 refused + 21 superseded + 15 counted + 46 agreeing; m2 77 = 76 refused + 1 agreeing; m4 9 = 1 refused + 3 counted + 5 agreeing |
| 10 | `python3 -c "print(104+46+21+15+3)"` | 0 | `189` (lesson `:112-116` enumeration; 195 named at `:112`) |
| 11 | `node scripts/check-selfassessment.mjs --rev b234a58 --json > c2-at-rev.json` | **0** | `mismatches 0`, `counted 0`, findings **202**, refused **106**, superseded **39**, agreeing **57**; m1 115 (29 refused) |
| 12 | `sed -n` on `scripts/check-selfassessment.mjs` at `:5-7,:79,:88,:104,:130,:216,:246,:264-271,:322,:399,:419,:528,:1063` | 0 | every line is the code E21/E24/E26/E27 name — **no drift** |
| 13 | `grep -o statSync scripts/check-selfassessment.mjs \| wc -l`; same for `TALLY_PATTERNS` | 0 | `1`; `1` (definition/import only) |
| 14 | `sed -n` on `SCORECARD.md:1136-1140`, `SKILL.md:2025-2030`, `LOG.md:970-974`, `corpus/QUALITY.md:459-466`, `SKILL.md:2608-2612`, `corpus/README.md:697-705` | 0 | cited lines unchanged at REV (`:1138` "12-case in-memory matrix"; `:2027` freshness-witness; `:2028` "real12-case"; `:972` selftest-measurement-binding; E2 clause at `463-464`; E22 at `2610`; E25 at `699-703`) |
| 15 | `jq` on the frozen reading for those three `(doc,line)` pairs | 0 | `SCORECARD.md:1138` round-evidence-audit claimed 12 / **observed 13 / superseded true**; `SKILL.md:2027`,`:2028` refused "script outside the runnable gate set" (claimed 8, 12) |
| 16 | `jq` on my REV reading for E23's seven `(doc,line)` pairs (`SKILL.md:1559,1988,2030-2032,2474`; `corpus/README.md:591`) | 0 | **0 findings** — the seven lines still produce no claim at REV |
| 17 | `git diff … \| grep '^+' \| grep -- '-case'` over SKILL/SCORECARD/LOG/README | **1** | no added line carries an `N-case` count |
| 18 | python re-implementation of the five `statedTallyNumbers` shapes over the landed correction bullets | 0 | `SCORECARD.md:1610` states 41 as `(41/41)` **and** as `cases=41 passed=41`; `SKILL.md:2760` and `corpus/README.md:744` state it once as `(41/41)` |
| 19 | python normalised-substring test, errata-C's four drafted bullets vs the lesson bullets | 0 | `Counter hygiene residual` True, `Oracle coverage residual` True, `Receipt counts read as tallies` True, `Supersession accepts any stated number` True — "landed verbatim" holds |
| 20 | `sed -n '286,290p' clone/scripts/check-decision-table.mjs` | 0 | live cache key `` `${g.url}\u0000${quote}` `` at `:288` — E15's premise still true |
| 21 | `grep -n` lane docs for the carried drafts' text (`no entry maps an observed signal`, `predates v3`, `RangeError`, `could_not_evaluate=1`, `lower-case modal`, `attests only that this host`) | 1 (no hits) | carried corrections not landed in this round's bytes |
| 22 | `pgrep -fa 'chromedriver\|chromium'` (minus `earlyoom`) | 1 | no browser or driver of mine (none started) |
| — | external HTTPS GETs / tool installs | — | **0 / none** (no fetch receipt owed; nothing installed or upgraded) |

## The four landed limit texts at `b234a58`

| text | line anchors cited | state at REV |
|---|---|---|
| E21 counter hygiene (`corpus/lessons/round-32.md:102-109`) | `check-selfassessment.mjs:104,399,419,130,79,1063,5-7,528` | **holds, all eight exact** (command 12/13); the four defects are live in the frozen bytes |
| E24 oracle coverage (`:111-119`) | `check-selfassessment.mjs:88`; `LOG.md:972`; `SKILL.md:2027,2028` | anchors exact and the individual counts true (27 m1 = 24 + 3; 76 m2; 1 m4; 46 m1 matching; 21 superseded; 15 m1 + 3 m4 counted) — but **defect D1 and D2 below** |
| E26 receipt counts (`:121-128`) | `check-selfassessment.mjs:216,322,88`; `SCORECARD.md:1138`; `SKILL.md:2028` | **holds** at REV (command 15/17): both live instances unchanged, and no round-32 correction carries an `N-case` |
| E27 supersession (`:130-136`) | `check-selfassessment.mjs:264-271,270,268,267,246` | anchors exact; substantive half holds (no *different* accepted number sits in a paragraph that cites a stale line; the only multi-number paragraph is the `SCORECARD.md:1628-1635` disclosure, whose "round-24/25" yields 24/25 and cites no tally line) — but **defect D3 below** |

## Defects (append-only fixes only; no counter change)

### D1 — `corpus/lessons/round-32.md:112-116`: the E24 enumeration sums to 189 of the 195 findings it names (severity: low)

The bullet says "The frozen reading carries 195 findings: 104 refused … plus 46 m1 matched and 21 m1 cleared …; 15 m1
and 3 m4 were counted." The frozen reading's own composition (command 8/9) is **18 counted + 104 refused + 21
superseded + 52 agreeing = 195**; the bullet names the 46 matching m1 findings but not the other six agreeing findings
(**5 m4 matching + 1 m2 matching**), so its components sum to 189. Every figure it does state is true; the enumeration
just does not close — the same "coverage boundary quoted with an un-reconciled residual" class the erratum attacks.
Note that the *unlanded* errata-B Draft C does state it correctly ("18 mismatches, 104 refused comparisons, 21
superseded and 52 agreeing, and those four figures sum to the 195 findings"), so the accurate accounting exists in the
wave evidence but not in the landed text.

Smallest safe correction — append after `:119` (append-only, no line above edited):

```markdown
  Corners of the arithmetic above: the 195 is 18 counted + 104 refused + 21 superseded + 52 agreeing, and the 52 are
  46 m1 and 6 others (5 m4, 1 m2). The bullet's own component list names only the 46. (w2 CritErrataDispositions D1)
```

### D2 — same bullet, `:118`: "Quote the zero with these numbers" pairs one revision's zero with another revision's residual (severity: medium)

The zero the sentence is about is `SELFASSESSMENT verdict=clean mismatches=0`, which exists only after the corrections
land. At REV (`b234a58`) the same frozen counter reads **mismatches 0, counted 0, refused 106, superseded 39,
agreeing 57 over 202 findings, m1 115 of which 29 refused** (command 11). The numbers the bullet attaches to the zero
(195 findings / 104 refused / 27 m1 / 21 cleared) belong to the pre-correction reading, which has **18 mismatches**
(command 8). A reader following the instruction quotes a reading that exists at no revision: the corrections that clear
the 18 also add the claims they state, so the finding population grows monotonically from 195 to 202 while the
mismatch count falls to 0 [INFERENCE from the two measured endpoints plus the correction text of command 19; the
monotone step is visible in m1 109→115 and m4 9→10]. The understatement is small (2 refusals, 2 m1, 20 findings) but it
is stated as the companion of the round's own zero, which is the one place it must not be wrong.

Smallest safe correction — append after `:119`:

```markdown
  Two readings, not one: the 195/104/27/21 figures above are the freeze reading, which carries 18 mismatches. The zero
  is read at the integrated revision: there the same counter reads 0 counted, 106 refused, 39 superseded, 57 agreeing
  over 202 findings (m1 115, 29 refused). Quote the zero with the second set and the first set only as the freeze
  reading's residual. (w2 CritErrataDispositions D2)
```

### D3 — `corpus/lessons/round-32.md:135-136`: "state the oracle tally once" is false of the corrections it describes (severity: low)

The E27 bullet ends "Round-32 corrections state the oracle tally once, in a parsed shape, and carry no second number
that could equal it." The landed `SCORECARD.md:1610` correction states 41 in **two** parsed shapes in one paragraph —
`(41/41)` and `cases=41 passed=41` (command 18); `SKILL.md:2760` and `corpus/README.md:744` state it once each. The
risk the erratum describes is a *different* number that can do the clearing, and that half holds (command 18: no
correction paragraph carries a second distinct accepted number that could equal a stale line's oracle). Repeating the
same tally is harmless — which is exactly why the sentence should say that instead of "once".

Smallest safe correction — append after `:136`:

```markdown
  "Once" is the wrong word for what the corrections do: `SCORECARD.md:1610` states 41 as `(41/41)` and again as
  `cases=41 passed=41`, and repeating the same tally cannot clear a different line. Read the rule as: no accepted
  number *other than the oracle tally* in a correction paragraph, repeats of the tally itself are harmless. (w2
  CritErrataDispositions D3)
```

### D4 — `corpus/lessons/round-32.md:92`: E15, E16 and E23 are filed under a row headed "closed" (severity: low; count unaffected)

Each of the three is a **refusal** in its own scribe's file (errata-B: E15, E16 refusals; errata-C: E23 refusal), and
each defect is live at `b234a58`: E15's false sentence is still in the frozen script header
(`scripts/check-decision-table.mjs:19-20` "it makes one read-only HTTPS GET per cited row url" against the
`(url, quote)` cache key at `:288`, command 20); E23's seven lines still produce no finding at REV (command 16); E16 is
a false-negative-only gap no document asserts. A row headed "closed — refused with reason and flip condition"
(`:92`) tells a reader these three are closed. Under the four-bucket taxonomy (closed / refused / carried / landed)
they are **refused**, not closed, and "down from 27" then reads as eleven discharged when eight were repaired or
already stood and three were refused unrepaired. The count itself is right: 4 closed (E2, E11, E22, E25) + 3 refused +
4 landed + 16 carried = 27, and E15/E16/E23 are correctly **not** in the carried 16.

Smallest safe correction — append after `:98`:

```markdown
  Bucket note: E15, E16 and E23 are **refusals**, not closures — their defects remain live at the integrated revision
  (E15's sentence at `scripts/check-decision-table.mjs:19-20`; E23's seven lines produce no finding). Closed this round
  is four errata (E2, E11, E22, E25); landed is four; refused is three; the 16 above are the carried set. (w2
  CritErrataDispositions D4)
```

## Per-erratum placement audit (lesson rows at `:90-98` vs the w1 files)

| errata | lesson bucket | w1 file's own disposition | verdict |
|---|---|---|---|
| E1 | carried (`:96`) | errata-A: not durable, lesson correction drafted | holds |
| E2 | closed (`:90`) | errata-A: closed, landed `QUALITY.md:463-464` | holds (clause present at REV) |
| E3 | carried (`:93`) | errata-A: refuse counter change, limit record drafted | holds (record not landed; command 6) |
| E4 | carried (`:96`) | errata-A: partly expired, criterion + entry drafted | holds |
| E5 | carried (`:96`) | errata-A: not durable and widened, lesson correction drafted | holds |
| E6, E7, E8, E9 | carried (`:93`) | errata-A: refuse sensor, criterion 84 drafted | holds (QUALITY has no such criterion) |
| E10 | carried (`:96`) | errata-B: correction, Draft A bullet 4 (`SKILL.md`) | holds |
| E11 | closed (`:91`) | errata-B: no action; `-q` is argv[1] (`check-decision-table.mjs:195`) | holds |
| E12, E13, E14 | carried (`:96`) | errata-B: correction, Draft A bullets 1-3 (`SKILL.md`) | holds (no `SKILL.md` addition carries them) |
| E15, E16 | "closed — refused" (`:92`) | errata-B: refusals, defects live | bucket label defect **D4** |
| E17 | carried (`:96`) | errata-B: correction, Draft B (`round-31.md`) | holds (file unchanged, command 7) |
| E18 | carried (`:96`) | errata-B: correction, Draft C (`SCORECARD.md`) | holds (no such text in `SCORECARD.md`) |
| E19 | half-closed (`:95`) + `passed=` arm carried (`:98`) | errata-C: exit/verdict arm closed in v3, two arms open | holds — **note**: only the `passed=` arm is named, while errata-C lists a second open arm (summary-less fallback); criterion 85 (`corpus/QUALITY.md:514-521`) records that arm as a limit, so no bucket or count changes |
| E20 | carried (`:96`) | errata-C: clause drafted with E19, not landed | holds (criterion 85 omits the claim-grammar clause) |
| E21 | landed (`:94`, text `:102-109`) | errata-C: lesson bullet, landed verbatim | holds |
| E22 | closed (`:90`) | errata-C: already corrected at `SKILL.md:2610` | holds (verified at REV) |
| E23 | "closed — refused" (`:92`) | errata-C: refusal, coverage gap live | bucket label defect **D4** |
| E24 | landed (`:94`, text `:111-119`) | errata-C: lesson bullet, landed verbatim; counts re-measured | **D1, D2** |
| E25 | closed (`:90`) | errata-C: already corrected at `corpus/README.md:699-703` | holds (verified at REV) |
| E26 | landed (`:94`, text `:121-128`) | errata-C: lesson bullet, landed verbatim | holds |
| E27 | landed (`:94`, text `:130-136`) | errata-C: lesson bullet, landed verbatim | **D3** |

Count check, independently: 27 rows, E1–E27 each exactly once; carried list at `:98` enumerates 16 distinct errata
(E1, E3–E10, E12–E14, E17, E18, E19, E20); 27 − (E2, E11, E15, E16, E21–E27) = 16; `down from 27` matches
`corpus/lessons/round-31.md:335` ("27 carried to round 32"). **Holds.**

## Notes that are not defects (checked, to keep the record honest)

- "landed verbatim" is literally true for all four bullets (command 19) — the defects are in the drafts' content, not
  in the landing.
- E19's criterion reference is right: `corpus/QUALITY.md:514` is criterion 85 and carries the v3 exit/verdict arm plus
  the two proving case names.
- No carried correction was quietly landed: `round-31.md` is byte-unchanged between the freeze and REV, and the four
  scanned documents' additions contain none of the draft fingerprints (command 21). The `20` added lines in
  `rate-signal-decision-table.md` are the round's own routed-defect-3/S123 errata, a different item.
- Both counters are byte-identical to `frozenDigests` at REV (command 3), and `scripts/` gained only the new
  `bidi-loopback-round32.mjs` (command 5), so no anchor in any of the four landed texts could have drifted by a script
  edit, and none did by document insertion (0 deletions, command 4).

## Hygiene

- Scratch `/fast/scratch/hyaku/tabi-r32/CritErrataDispositions/` — clone and the counter JSON — deleted before this
  report; the counter output is copied to
  `.ufo/waves/round-32/w2/CritErrataDispositions/c2-clean-at-b234a58.json`.
- No browser or driver started (`pgrep -fa 'chromedriver|chromium'` minus `earlyoom`: nothing, command 22); no network
  fetch; nothing installed, upgraded or pacman-touched.
- No lane tracked file, lane index, jj state, fleet repo or sibling lane was written; the only files I wrote are this
  report and my seat output directory.
