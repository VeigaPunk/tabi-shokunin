# R86Scribe — round 86 / w1 — the r86 knowledge note, lesson sections, SKILL registry block

Seat: R86Scribe (scribe, axis `depth`). Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Base `57265864`; D `4bd89a80f439`; nonce `tabi-r86-l1-4bd89a80f439`.
Leaf member: **no subagent dispatch**. **No commit, no push, no mutating git/jj command of any kind**
(read-only `git status`/`git diff`/`git ls-tree`/`git rev-parse` only). **No package installed or
upgraded** (nothing needed; the pausable-pacman rule was not exercised — node v24.21.0 and
python3 3.14.8 were already present and were used as-is).

## Deliverables (drafts, NOT committed)

| path | purpose |
|---|---|
| `/fast/scratch/hyaku/tabi-r86/R86Scribe/note.md` (7,894 B) | draft of `corpus/knowledge/chromium-showpicker-runtime-round-86.md` in the house style of the r85 note |
| `/fast/scratch/hyaku/tabi-r86/R86Scribe/lesson.md` (11,998 B) | draft of the round-86 lesson's `## Gate` / `## Mistakes` / `## Corrections` sections, in the style of `corpus/lessons/round-85.md` |
| `/fast/scratch/hyaku/tabi-r86/R86Scribe/registry.md` (1,681 B) | draft of the `## Round 86 gate registry` block for `SKILL.md`, in the shape of the r85 block |

**The scratch tree is removed before this yield** (lane bound), so the three drafts are reproduced
**in full** in the *Draft contents* section below, byte-for-byte as measured, for the L1 to copy.
The lane already carries landed equivalents written by the L1/other seats while this seat was
measuring (`corpus/knowledge/chromium-showpicker-runtime-round-86.md` and `corpus/lessons/round-86.md`
at 05:44:33; `SKILL.md` §Round 86 gate registry at 05:40:21); those were **landed in commit
`9919aa52`** ("round-86: freeze (D 4bd89a80f439), generation r86 …") while this seat was measuring —
`git diff HEAD -- corpus/lessons/round-86.md corpus/knowledge/chromium-showpicker-runtime-round-86.md`
is empty, so the committed bytes are the ones this seat read. This seat's drafts are its **own
independent read of the same bytes**; the divergences are listed under *Divergences*. The L1 owns
integration.

## What this seat measured (every command read-only; scratch-only outputs)

All seven instrument pins were re-verified with `sha256sum` against
`.ufo/waves/round-86/freeze.txt` — **all seven match byte-for-byte** (driver `5a435da6…313d`,
counter `a41fab46…70a`, battery `b7ddaf7b…aec`, kill-power `ddc4102d…1d2`, selftest `b53423bf…0ba3`,
drift `2aecdf99…c1c3`, witnesses `5471404b…5dae9`).

1. **Counter (C1 leg a)** — `node scripts/check-showpicker-r86.mjs --lane <ABS lane> --receipt
   corpus/evidence/round86/chromium-showpicker/receipt.json --expect-driver-sha256
   5a435da6dae0d2eba1add83e51903ae954801fb67bca6186f2ad5787e94a313d --expect-nonce
   tabi-r86-l1-4bd89a80f439 --expect-fixture-sha256
   94421dc0cceba84082aa3e75d501e14876b7eac6942c809f98f7fef6b774a3a1 --prior-set
   .ufo/waves/round-86/controls/c1/prior-set.txt --json` → **exit 0, `verdict clean`, `checkCount 95`,
   `findings []`, 95/95 checks `true`**. The 95 decompose as 34 structural + 3 `leg-{order,records,
   marks}` + 30 per-leg + 28 `*-law` (measured: 33 ids start `leg-`, of which 3 are the meta ids; 28
   end `-law`). The two new law ids are present and `true`: `accept-grammar-law`,
   `same-origin-color-law`.
2. **Battery (C1 leg b)** — `node scripts/negatives-showpicker-r86.mjs --lane <ABS lane> --real
   corpus/evidence/round86/chromium-showpicker/receipt.json --expect-driver-sha256 5a435da6… --expect-nonce
   tabi-r86-l1-4bd89a80f439 --expect-fixture-sha256 94421dc0… --prior-set
   .ufo/waves/round-86/controls/c1/prior-set.txt --work <ABS scratch> --json` → **exit 0, 201 cases,
   0 failed, coverage declared 95 / covered 95, `uncovered []`, `unknown []`**.
3. **Kill power (C1 leg b)** — `node scripts/kill-power-r86.mjs --lane <ABS lane> --real
   corpus/evidence/round86/chromium-showpicker/receipt.json --expect-driver-sha256 5a435da6… --expect-nonce
   tabi-r86-l1-4bd89a80f439 --expect-fixture-sha256 94421dc0… --prior-set
   .ufo/waves/round-86/controls/c1/prior-set.txt --work <ABS scratch> --json` → **exit 0, 66 mutants,
   66 killed, 0 survived, 0 crashed, `survivorsList []`, `unapplied []`**.
4. **Family witnesses (C2)** — `node scripts/witness-families-r86.mjs --lane <ABS lane> --work
   <ABS scratch> --json` → **exit 0**. `before`: 12 families, **survivors = 3**
   (`narrow-tel-crossaccess`, `narrow-tel-childseq`, `narrow-tel-childact-before`), 9 killed, 0
   crashed, 0 unapplied. `after`: 12 families, **survivors = 0**, 12 killed, 0 crashed, 0
   unapplied. The three before-survivors each fail **0 of the r85 battery's 175 cases**; in the
   after-generation each is killed by exactly the matching new case (`cross-search-crossaccess-dropped`,
   `cross-search-childseq-dropped`, `cross-search-childact-before-dropped`, 2 failures each — the
   search and text witnesses both fire). The three already-killed narrowings fail first on
   `cross-origin-number-law` (message, 8 failures), `cross-origin-text-late` (childlate, 1) and
   `cross-origin-search-activation` (childact-after, 1); the six r85 control families stay killed in
   both generations. **C2: 3 of 12 survive the frozen r85 battery, 0 of 12 the frozen r86 battery.**
5. **Self-test (C1 leg c)** — `node scripts/selftest-r86-gates.mjs --lane <ABS lane> --work
   <ABS scratch> --json` → **exit 0, `clean: true`, 10 cases, 0 failed**, every gate `ok`:
   `pins-match-freeze` (no file differs from `freeze.txt`), `counter-clean` (exit 0, clean, 95,
   `findings []`), `battery` (exit 0, 201/0, coverage 95/95), `kill-power` (exit 0, 66/66/0/0),
   `nowork-control` (exit 1, findings incl. `schema` and `plan-frozen`), `tree-exempt-path-refused`
   (exit 2), `tree-exempt-unmatched-refused` (exit 1, `prior-set-unmatched-exempt`), `record-drift`
   (exit 0, 8 claims, 0 mismatches), `witness-families` (exit 0, before 3 / after 0),
   `capability-status` (exit 0, 21 rows, 20 claimed, 1 provisional, 0 mismatches).
6. **Record drift** — `node scripts/check-record-drift-r86.mjs --lane <ABS lane> --json` → **exit 0,
   8 claims, 0 mismatches**, all eight ids `ok`: `family-witnesses`,
   `accept-grammar-measured`, `same-origin-contrast`, `limit-constant-offset`, `r86-numbers`,
   `census-artifacts`, `r86-identity`, `witness-instrument`.
7. **Do-nothing controls** — the r85 scored receipt under the r86 counter → **exit 1, `verdict
   findings`, `checkCount 89`, 39 findings** (ids incl. `schema`, `plan-frozen`), byte-identical id
   set to the frozen `controls/c1/nowork-r85-under-r86.json` **when the round's own scored receipt is
   exempted**; see *Finding 2* below for the exemption dependency. The no-receipt control
   (`.../nope.json`) → **exit 2**, `verdict unreadable`, single finding `receipt-unreadable`, matching
   `controls/c1/noreceipt.txt`.
8. **The six new legs, field by field** (scored receipt, `legs[24..29]`) — `sp86-accept-wildcard-text`
   (target `aw`, `accept "image/*"`, delivered `tabi-r86-a.txt` / `text/plain` / 22 B),
   `sp86-accept-wildcard-png` (same input, delivered `tabi-r86-b.png` / `image/png` / 21 B),
   `sp86-accept-mixed-text` and `sp86-accept-mixed-png` (target `am`, `accept "image/png, .txt"`,
   answered with both), `sp86-accept-pdf-token-png` (target `ap`, `accept "application/pdf"`,
   answered with the PNG). Every one: `showPicker {ok:true, ret:'undefined'}`,
   `activationBefore {isActive:true, hasBeenActive:true}` → `activationAfter {isActive:false,
   hasBeenActive:true}`, **one** `Page.fileChooserOpened` with `mode "selectSingle"` and
   `backendNodeId 18`, trusted `input`+`change` (`isTrusted: true`) carrying the file tuple, a
   `read` event with `ret` = the delivered bytes' hex, and `stateAfter[target]` =
   `[[name, size, type, ""]]`. `sp86-same-origin-color-activated` (target `cos`, `type=color`):
   `showPicker {ok:true, ret:'undefined'}`, activation consumed, **zero** `Page.fileChooserOpened`,
   `stateAfter.cos []`, and **no** `input`/`change` in `pageEvents` (only the five trusted `#pad`
   pointer/mouse events). The `accept` attributes are read back from the page:
   `fixtureInputs` → `aw "image/*"`, `am "image/png, .txt"`, `ap "application/pdf"`.
9. **The carried laws, re-derived on the r86 receipt** — `sp84-cross-origin-color` `childResult`
   `{ok:true, ret:'undefined'}` with 0 choosers (the cross-origin colour exemption); the eight other
   cross-origin legs record `{ok:false, name:'SecurityError'}`;
   `sp84-cross-origin-nonfile-disabled` `InvalidStateError` against the same-disabled-input
   `SecurityError` sibling (origin before mutability); `sp85-same-origin-{tel,search,text}` arms
   `NotAllowedError`; the three `sp85-same-origin-*-activated` arms `undefined` with 0 choosers;
   `sp84-webkitdirectory-answer` carries `webkitRelativePath`; `sp84-accept-answer` accepts a `.txt`
   into `accept=".png"`; `sp84-multiple-mode` opens with `mode selectMultiple`;
   `sp84-accept-mime-answer` delivers the PNG bytes into `accept=".png"`;
   `sp84-second-chooser-answer` opens two choosers with the same `backendNodeId` (18/18).
10. **Provenance counts re-derived** — knowledge notes **98 → 99**
    (`git ls-tree -r --name-only 57265864 -- corpus/knowledge/ | grep -c '\.md$'` → 98;
    `ls corpus/knowledge/*.md | wc -l` → 99); SOURCES registry rows **223**
    (`grep -cE '^\|\s*S[0-9]{3,}\s*\|' corpus/SOURCES.md`), with `git diff --name-only 57265864 --
    corpus/SOURCES.md` **empty** (no new rows, no registry edit); census `start.txt` and `end.txt`
    both end `exit=0` with the `tabi ok` line.
11. **The sources** — the round's only staged source is `.ufo/waves/round-86/sources/whatwg-input.html`,
    **687,515 B, sha256 `b0202de1c0b422d94d7aa23b4f1b0e3126d9d044bf7076394b6e00451f0fcd16`** (re-derived
    by `sha256sum`/`wc -c`; the fetch itself is R86Scout's, HTTP 200). The two quotes this seat's
    drafts use were located in that file and word-counted with `printf '%s' … | wc -w`:
    the `accept` sentence at **local lines 4066–4068** (**18 words**: "attribute may be specified to
    provide user agents with a hint of what file types will be accepted.") and the cross-origin
    exemption at **local lines 5608–5610** (**21 words**: "Throws a 'SecurityError' DOMException if
    input is inside a cross-origin iframe, unless input is in the File Upload or Color states."); the
    picker-UI sentences are at **5597** and **5599–5600** (15 and 11 words).

## Findings this seat measured and did not see recorded elsewhere in the lane

- **Finding 1 — `record-identity-drift` (a real drift the round's own gate caught; fixed in the
  landed bytes before this seat's re-run).** This seat's **first** run of the frozen drift counter
  against the lane returned **exit 1, 8 claims, 1 mismatch**: `failed ["r86-identity"]`, detail
  `nonce=tabi-r86-l1-4bd89a80f439 cited=["4bd89a80f439","0e7bb7e08cac"] wrong=["0e7bb7e08cac"]`. The
  cause: `plans/round-86.md` §Re-freeze history restated the superseded D1 nonce in the exact
  `tabi-r86-l1-<12 hex>` form the counter's `r86-identity` claim scans for, so the D1 identifier read
  as a wrong nonce. The plan line was then re-worded (the worktree copy I read at 05:54 already reads
  "at D1's own (superseded) nonce identifier", and commit `9919aa52` carries that wording), and the
  same command now exits **0 with 8 claims, 0 mismatches** — re-measured after the commit. This was a
  **record-prose** edit: the drift counter, its claim, the pins, the prior set and the threshold are
  untouched (the counter's sha256 is still `2aecdf99…c1c3`, and `git show
  HEAD:.ufo/waves/round-86/freeze.txt` matches the seven pins). The landed lesson carries no row for
  this drift; this seat's lesson draft adds it under `## Corrections — record drift caught by the
  round's own wave`, and it is the one lesson row this seat did **not** see land.
- **Finding 2 — `control-reproducibility` (the frozen do-nothing control is byte-reproducible only
  with one extra argument).** `controls/c1/nowork-r85-under-r86.json` records **39** findings and
  `treeExemptSha256: []`. A re-run of the same command with the r85 pins yields **40** findings — the
  extra id is `prior-set-complete`, because the round's own scored receipt sits inside the walked
  tree (`.ufo/waves/round-86`) and is neither the receipt under test nor a listed prior. Adding
  `--tree-exempt-sha256 035ac3f03e3e3f039b98ac7086a4e8160571db59c4a36cc453fbca119492b64d` (the r86
  receipt's file digest) reproduces the frozen artifact **exactly**: 39 findings, identical id set,
  `checkCount 89`, exit 1. This is the counter's own walk binding the test to the current tree
  contents — not a defect, and not something this seat may amend. It is recorded in the lesson draft
  as a re-runner caveat so a future reader does not read the +1 finding as drift.
- **Finding 3 — `source-accounting` (the Gate's source split overstates what was re-opened).** The
  landed lesson's `## Gate` says "Identified 2 / screened 2 / included 0 / excluded 2 for NEW rows"
  and then lists five carried rows as re-opened, among them **S221** and **S222** — whose rows
  (`corpus/SOURCES.md:236–237`) anchor `chromium.googlesource.com` `.pdl` files. Round 86 staged and
  fetched **only** the WHATWG page (`ls .ufo/waves/round-86/sources/` → one file), so no `.pdl` was
  re-opened here. This seat's draft states the split it measured (S219 and S223 located; S216 anchors
  the same page; S221/S222 carried, not re-opened).
- **Finding 4 — the delivered byte markers still name r83, not r86.** The r86 driver's upload bytes
  are `tabi-r83-answer-alpha\n` and the PNG signature + `tabi-r83-png\n`
  (`scripts/chrome-cdp-showpicker-round86.mjs:290,292`), under the *file* names `tabi-r86-a.txt` /
  `tabi-r86-b.png`. The page-read hex values the note quotes are therefore
  `hex:746162692d7238332d616e737765722d616c7068610a` and
  `hex:89504e470d0a1a0a746162692d7238332d706e670a`. Not a defect (the same carry-over exists in
  r84/r85 and the bytes are pinned by sha256), but the note states it so a reader does not read
  "r83" as a wrong-generation artifact.
- **Finding 5 — the `accept` headline is wider than the receipt.** The landed note's law 1 reads
  "`accept` is not a validator on a programmatic answer — for every token form measured" (this seat's
  draft wording) / "a **dialog filter**, never a validator" (the landed `claims.json` C1 `type`).
  The receipt cannot distinguish "Chromium filters `accept` in the dialog" from "Chromium filters
  `accept` nowhere": `DOM.setFileInputFiles` bypasses the dialog, and no leg ever lets a dialog
  appear, so both worlds produce byte-identical receipts (R86Critic reached the same conclusion).
  This seat's draft keeps the measured law at the acceptance level and states the indistinguishability
  explicitly in the "cannot prove" section, with the spec's own hint sentence cited as the
  normative ground (S223) rather than as a measurement.
- **Finding 6 — the colour arm's zero-open is a FILE-chooser metric, and the receipt cannot even
  show a colour popup.** `Page.fileChooserOpened` is the only chooser-shaped event the driver logs,
  and the spec's own picker-support note lists **Color** among the states implementations show picker
  UI for (R86Scout's §3). The measured zero is therefore evidence about *file* choosers only. The
  landed note, the landed claim and the counter's own check message all carry the qualifier; this
  seat's draft repeats it and adds that the zero is equally consistent with "popup shown, not picked".
- **Finding 7 — the note should name the exposed object, the build, the flags and the origin's
  secure-context state.** The receipt records no `isSecureContext` field (grep → 0 hits), so the
  page's secure-context state is **not** a measured value in this bundle. This seat's draft names the
  exposed objects (`HTMLInputElement.showPicker()`, `Page.setInterceptFileChooserDialog`,
  `Page.fileChooserOpened`, `DOM.setFileInputFiles`), the build (Chromium 155.0.8059.84), the flag
  (`--headless=new`) and the origin (`http://127.0.0.1:19730`), and marks the secure-context state
  UNKNOWN with the reason.
- **Finding 8 — the SKILL registry block is already landed and byte-identical to this seat's
  independent draft.** `diff <(sed -n '3319,3328p' SKILL.md) registry.md` → no differences: the
  landed block already names all seven instruments with their commands and the measured numbers
  (95 checks / 201 cases, coverage 95/95 / 66 mutants / 10 gates / 12 families / 3 → 0). This seat's
  draft is offered as the independent check, not as a change.
- **Finding 9 — the lesson's `## Mistakes` table carries four rows whose evidence is the FIRST witness
  run, but the scored `witness-a.json` in the lane holds the FINAL run.** The landed lesson cites
  `.ufo/waves/round-86/scored/witness-a.json` "first two runs" for the `witness-polarity` and
  `guard-inversion` rows; the committed artifact now reads `before.survivors = [narrow-tel-crossaccess,
  narrow-tel-childseq, narrow-tel-childact-before]` — i.e. the corrected state. The pre-freeze runs
  are not committed anywhere I could find. Not amendable from this seat (the artifacts are the L1's);
  named so the row is not read as a pointer to a file that shows the opposite.
- **Finding 10 — the round's own census/SOURCES scope is unchanged and re-derivable.** Registry 223
  rows, `corpus/SOURCES.md` byte-identical to the base, census start/end both `exit=0` with 223 rows
  — the SCORECARD's "Registry 223 (no new rows)" and "Knowledge 98 → 99" re-derive cleanly from the
  commands above.

## Divergences from the lane's landed texts (L1's call)

- **Sources section.** Landed: "Identified 2 / screened 2 / included 0 / excluded 2 … (carried rows
  S223, S219, S216, S221, S222 re-opened)". This seat's draft: S219 and S223 located on one fetch;
  S216 noted as anchoring the same page; **S221/S222 recorded as carried, not re-opened** (no `.pdl`
  was fetched or staged). Both are `included 0 / excluded 2`; the difference is the re-opened list.
- **The accept law's wording.** Landed note law 1 headline: "`accept` is a dialog filter, never a
  validator — for every token form." This seat's draft: "**`accept` is not a validator on a programmatic
  answer** — for every token form measured", with the dialog reading explicitly marked as not
  measurable from this receipt (Finding 5).
- **A sixth "cannot prove" item.** This seat's draft adds the counter-reads-a-receipt boundary and
  the counter's own printed `limit` escape (a constant-offset shift of every page event), which the
  landed note does not carry in that section.
- **A "what the receipt cannot prove" item on the secure-context state** — added (Finding 7).
- **The delivered byte markers** — stated explicitly (Finding 4).
- **Two new `## Mistakes` rows** — `control-reproducibility` (Finding 2) and `source-accounting`
  (Finding 3) — and **two new `## Corrections` rows** — the `record-identity-drift` row (Finding 1)
  and the corrected source split (Finding 3).
- **Everything else** — the three laws, the frontier, the counters, the instrument list and the
  registry block's shape and numbers agree with the landed texts.

## Rating each draft against `corpus/QUALITY.md` (criteria that FAIL, named)

- **`note.md`** — **passes** 1 (falsifiable laws with field paths), 2 (every claim anchored to a
  receipt field / command / digest), 3 (observation, inference and unknown are separated: the
  colour-popup reading is marked as not measurable, the secure-context state is marked UNKNOWN),
  12/15 (the cited sources S223/S219/S216/S221/S222 are tier A rows in `corpus/SOURCES.md`),
  14 (distillation keeps the source class — spec sentences are cited as normative ground, receipt
  fields as observation), 23 (the exposed object, build, flags and origin are named; no API name is
  called a divergence), 26/30 (the `recheck:` line is a runnable command with the producer digest and
  the exit code), 28 (every path is a lane path inside this lane, not a `/tmp` root), 31 (a correction
  to a pinned note would name that path and line — this draft corrects no pinned line), 34/43 (the
  prose counts carry their counting commands), 159 (the Gate quotes carry `wc -w` counts).
  **Fails none.** The one criterion it cannot satisfy on its own is **11** (the coverage/index map
  must list every current note or state the open row-count gap in the same commit) — the note is a
  new file and `corpus/README.md` has **no** index row for the r83/r84/r85 notes either
  (`grep -c "chromium-showpicker-runtime-round-8[3456]" corpus/README.md` → 0), so the gap is
  pre-existing and belongs to the README, not to the note. **Noted, not fixed by this seat.**
- **`lesson.md`** — **passes** 1, 2, 3, 4 (the two `## Corrections` tables are append-only blocks;
  no prior row is edited), 5 (the three rejects are kept with their flip conditions), 12/15 (S219 and
  S223 are tier A), 13 (the draft is a new-file draft; it appends to no protected path — the lane's
  protected set is `corpus/lessons/round-<N>.md` and the round's own file is a NEW file, never an
  append to a protected one), 26/30 (the counts are bound to the frozen instruments and the receipt),
  34/43 (the counts carry their commands in the Admitted-claims section and the SCORECARD/LOG rows),
  44 (the registry block it references carries `wave: w1`), 159 (both located quotes carry a
  `wc -w` count and a local line range). **Fails none.**
  **One caveat it inherits and cannot fix from this seat:** criterion **37** wants a self-test claim
  to cite a committed receipt with argv, exit, stdout and producer identity. The round's
  `.ufo/waves/round-86/scored/selftest.json` **is** committed (2,990 B in commit `9919aa52`) and
  carries the full ten-gate verdict (`clean true`, 10 cases, 0 failed) — but it records the gate
  names and `ok`/detail, **not** the argv, the exit code or the producer digest, and it lives under
  `.ufo/waves/round-86/scored/` rather than under `corpus/evidence/`. This seat measured the same ten
  gates independently (exit 0, `clean: true`, 10 cases, 0 failed) and the committed artifact agrees
  gate-for-gate. The r85 equivalent has the same shape, so this is the lane's house pattern rather
  than an r86 regression; it is named, not fixed.
- **`registry.md`** — **passes** 2, 26 (each row's command and verdict map), 27 (each instrument is
  described by the shapes it defeats, via its case count and survivor count, and the block ends with
  the shapes left untested — the accept-token frontier is named in the note, not here), 34/43 (every
  count is the measured one). **Fails none.** The block is **byte-identical** to the landed
  `SKILL.md` §Round 86 gate registry (Finding 8), so it introduces no new claim.

## Out of scope (not done by this seat)

- No product code, counter, battery, kill-power, selftest, drift counter, witness runner or plan was
  edited. **No predicate, pin, prior, threshold or kill rule was amended**, and none is proposed for
  amendment.
- No commit, push, publish or deploy; no `git add`/`commit`/`checkout`/`reset`/`push`, no `jj`
  mutation. The only git calls were read-only.
- Nothing was written outside the lane tree, this seat's scratch dir, and this seat's report path.
  The three drafts live in scratch (removed at yield) and are reproduced in full below.
- No fleet repo, no sibling lane, no `.ufo/state`, no `.scratch/` was touched.
- The scored receipt, the five scored artifacts, `corpus/lessons/round-86.md`, the note and
  `plans/round-86.md` were **read**; the only write this seat made in the lane is this report.

## Checks the main agent should run after integrating

The drafts' numbers were all measured by this seat against the lane **as it stands**; the drift
counter and the selftest both read `corpus/lessons/round-86.md`, `plans/round-86.md`, `SKILL.md` and
`SCORECARD.md`, so both must be **re-run after** the L1 integrates this seat's lesson/note text:

- `node scripts/check-record-drift-r86.mjs --lane <ABS lane> --json` → expect exit 0, 8 claims, 0
  mismatches (measured: exit 0, 8/0). If the L1 adopts this seat's `## Gate` source wording, the
  `accept-grammar-measured` claim's regex (`/never a programmatic answer|not enforced on a
  programmatic answer/i` over plan+lesson) must still match — the draft's plan/lesson wording keeps
  "a programmatic answer", but check it.
- `node scripts/selftest-r86-gates.mjs --lane <ABS lane> --work <ABS scratch> --json` → expect exit 0,
  10/10 green (measured: exit 0, `clean: true`, 10 cases, 0 failed).
- Re-derive the two prose counts the records assert, in the same commit that changes them:
  `ls corpus/knowledge/*.md | wc -l` → 99 and
  `grep -cE '^\|\s*S[0-9]{3,}\s*\|' corpus/SOURCES.md` → 223 (both measured).
- Consider writing this seat's independent selftest/witness/kill-power JSON into
  `.ufo/waves/round-86/scored/selftest.json` (currently 0 bytes) — the L1's file, not this seat's.

## Draft contents (verbatim, for the L1 to copy)

### `/fast/scratch/hyaku/tabi-r86/R86Scribe/note.md`

#### draft of `corpus/knowledge/chromium-showpicker-runtime-round-86.md`

```markdown
---
source: S223 (WHATWG HTML — the file-upload state's `accept` attribute as a hint), S219 (WHATWG HTML `showPicker()` steps — the SecurityError and its File/Color exemption, the "Shows any applicable picker UI" sentence), S216 (the normative algorithm and exception order), S221 (CDP Page domain), S222 (CDP DOM domain); receipt `corpus/evidence/round86/chromium-showpicker/receipt.json` (driver `scripts/chrome-cdp-showpicker-round86.mjs`, pin in `.ufo/waves/round-86/freeze.txt`)
verified-at: 2026-11-08 (round 86, Linux host, Chromium 155.0.8059.84 `--headless=new`)
recheck: `node scripts/check-showpicker-r86.mjs --lane <ABS lane> --receipt corpus/evidence/round86/chromium-showpicker/receipt.json --expect-driver-sha256 5a435da6dae0d2eba1add83e51903ae954801fb67bca6186f2ad5787e94a313d --expect-nonce tabi-r86-l1-4bd89a80f439 --expect-fixture-sha256 94421dc0cceba84082aa3e75d501e14876b7eac6942c809f98f7fef6b774a3a1 --prior-set .ufo/waves/round-86/controls/c1/prior-set.txt --json` → exit 0, 95 checks
---

# Programmatic picker generation r86 — the `accept` token grammar and the same-origin colour arm

Generation r86 of the held capability `chromium-showpicker-linux` (SCORECARD). Thirty legs, one fresh
browser per leg (`python3 -c "import json;print(len(json.load(open('corpus/evidence/round86/chromium-showpicker/receipt.json'))['legs']))"`
→ 30; the counter's 95 checks are 34 structural + 3 `leg-{order,records,marks}` + 30 per-leg + 28
`*-law`). The r85 note ended with three named frontier items; two are measured here (the third — a
same-element origin comparison — is not constructible in the current loopback fixture and stays
frontier).

The exposed objects are `HTMLInputElement.showPicker()` and the CDP commands
`Page.setInterceptFileChooserDialog`, `Page.fileChooserOpened` (S221) and `DOM.setFileInputFiles`
(S222). The build is Chromium 155.0.8059.84 on Linux under `--headless=new`; the origin of every leg
is the loopback page `http://127.0.0.1:19730` (receipt field `fixture.origin`). The receipt records
no `isSecureContext` field, so the page's secure-context state is **not** a measured value in this
bundle (loopback is a potentially trustworthy origin by the spec — a source-level inference, not a
receipt reading).

## The measured laws

1. **`accept` is not a validator on a programmatic answer — for every token form measured.** Five legs
   answer the chooser programmatically through `DOM.setFileInputFiles` on three page inputs whose
   `accept` attributes are read back from the page (`fixtureInputs` ids `aw`/`am`/`ap`):
   `accept="image/*"` answered with `text/plain` bytes (`sp86-accept-wildcard-text`) and with
   `image/png` bytes (`sp86-accept-wildcard-png`); `accept="image/png, .txt"` (mixed list) answered
   with both (`sp86-accept-mixed-text`, `sp86-accept-mixed-png`); and `accept="application/pdf"` — a
   MIME token matching neither delivered byte — answered with `image/png` (`sp86-accept-pdf-token-png`).
   In every case the delivered file lands in the input's `files` list with its bytes
   (`stateAfter[target]` = `[[name, size, type, ""]]`), fires trusted `input` + `change`
   (`pageEvents[].isTrusted === true`), and the page reads the bytes back (`read` event `ret:
   'hex:…'` — `hex:746162692d7238332d616e737765722d616c7068610a` = `tabi-r83-answer-alpha\n` for the
   text answer, `hex:89504e470d0a1a0a746162692d7238332d706e670a` = the 8-byte PNG signature plus
   `tabi-r83-png\n` for the PNG answer — the FILE names are `tabi-r86-a.txt`/`tabi-r86-b.png` but
   the delivered byte MARKERS still name r83, as in r84/r85); each leg opens exactly one
   `Page.fileChooserOpened` with
   `mode: "selectSingle"`. The r84 extension-token law (`.txt` into `accept=".png"`, input `#k`) is
   the control. Gated by `accept-grammar-law`. The spec agrees about the attribute's nature — it
   "may be specified to provide user agents with a hint of what file types will be accepted" (S223) —
   and the CDP answer command carries no accept parameter (S222), so the programmatic path has no
   accept input to filter on.
2. **A same-origin `type=color` `showPicker()` with transient activation returns `undefined`, consumes
   the activation, fires no `input`/`change`, and opens zero FILE choosers**
   (`sp86-same-origin-color-activated`: `showPicker` `{ok:true, ret:'undefined'}`,
   `activationBefore` `{isActive:true, hasBeenActive:true}` → `activationAfter`
   `{isActive:false, hasBeenActive:true}`, `Page.fileChooserOpened` count 0, `stateAfter.cos` = `[]`,
   no `input`/`change` in `pageEvents`). The spec's sentence for this type is "Throws a
   'SecurityError' DOMException if input is inside a cross-origin iframe, unless input is in the File
   Upload or Color states" — colour is exempt from the cross-origin refusal, and the r84 cross-origin
   colour leg (`childResult` `{ok:true, ret:'undefined'}`, zero choosers) is its counterpart. The
   zero-open is a FILE-chooser metric: whether Chromium opened a colour popup is not recorded.
   Gated by `same-origin-color-law`.
3. **Carried unchanged from r85** — the same-origin `tel`/`search`/`text` arms (`NotAllowedError`
   without activation; `undefined` with zero file choosers with it), the cross-origin
   `date`/`month`/`week`/`time`/`number`/`range`/`tel`/`search`/`text` `SecurityError`, the
   origin-before-mutability order discriminator, the directory answer with `webkitRelativePath`, the
   extension-token accept answer, `multiple` → `selectMultiple`, the MIME byte answer, and the
   second-chooser payload answer with its non-discriminating shared `backendNodeId`. The r86 counter
   re-derives all of them (95 checks).

## What a receipt of this shape cannot prove

- **Acceptance is not filtering.** `DOM.setFileInputFiles` answers a chooser programmatically and
  bypasses the dialog; the law says `accept` does not filter THAT path. What a user's dialog would
  offer or reject is not measured — headless opens no real dialog — and is not claimed. The receipt
  cannot distinguish "Chromium filters `accept` in the dialog" from "Chromium filters `accept`
  nowhere": both worlds produce byte-identical receipts, because no leg ever lets a dialog appear.
  The measured law is the acceptance law ("the answer was not filtered"), not the dialog law.
- **The colour arm is bounded to the file-chooser metric.** Zero `Page.fileChooserOpened` events do
  not show whether a colour popup appeared; the spec's "Shows any applicable picker UI … If input does
  not support a picker, this method does nothing" makes "no FILE chooser" the safe reading, and
  nothing stronger is claimed. The zero-open is equally consistent with "popup shown, not picked".
- **Three token forms, not the whole grammar.** `audio/*`, `video/*`, multiple MIME tokens and
  whitespace variants are unmeasured; the extension/MIME distinction is measured only for `.png`,
  `image/*`, `application/pdf` and the `image/png, .txt` list.
- **The witness set is six conjunct-scoped mutants**, not every leg-scoped narrowing a mutation
  tester can write.
- **The counter reads a receipt.** Every field above is a receipt field; a forger who sets them
  consistently passes. The counter's own `limit` block names the replay escape it does not close (a
  forger who shifts EVERY page event by a constant offset escapes the pair-based replay rule).

## Frontier (named, not held)

- A same-element origin comparison (an input reachable from both origins via a `postMessage` proxy) —
  not constructible in the current loopback fixture.
- The remaining `accept` token forms (`audio/*`, `video/*`, multi-MIME lists, whitespace variants)
  answered one leg per form.
- What a `type=color` same-origin call does to the colour popup itself (not a CDP file-chooser
  event) — needs a UI-side probe or a source-side reading of the colour chooser path.
```


### `/fast/scratch/hyaku/tabi-r86/R86Scribe/lesson.md`

#### draft of the round-86 lesson's `## Gate` / `## Mistakes` / `## Corrections` sections

```markdown
# tabi — round 86

L1 `TabiR86`. Base `57265864` (lane clean). Round 85's non-author spot-check admitted both claims and
routed five defects to r86; three touch this round's claims: the kill-power reach of the new-leg laws
(its independent 73-mutant sweep left 31 case-level survivors), the tel-only witness gap, and the
`accept` token grammar. Claims: C1 coverage — capability `chromium-showpicker-linux` generation r86
(the `accept` token grammar matrix and the same-origin `type=color` arm); C2 operability — the tel-only
conjunct narrowings.

D `4bd89a80f439`, nonce `tabi-r86-l1-4bd89a80f439`. Freeze commit recorded in LOG.

Census start: exit 0, 223 rows (`.ufo/waves/round-86/census/start.txt`); end: exit 0, 223 rows
(`.ufo/waves/round-86/census/end.txt`).

## Gate

### Sources — opened this round

One fetch opened the round's sources: the living WHATWG `input` page, **HTTP 200, 687,515 bytes,
sha256 `b0202de1c0b422d94d7aa23b4f1b0e3126d9d044bf7076394b6e00451f0fcd16`**, staged at
`.ufo/waves/round-86/sources/whatwg-input.html` (the staged copy's digest and size were re-derived
by this seat: `sha256sum` and `wc -c` → the two values above). The fetch is R86Scout's
(`.ufo/waves/round-86/w1/R86Scout.md`), which also machine-checked each quote as an exact substring
of the tag-stripped page.

- **S223** — the `accept` attribute's own sentence, in the File Upload state (local lines
  4066–4068). Located quote (18 words, `printf '%s' … | wc -w`): "attribute may be specified to
  provide user agents with a hint of what file types will be accepted." This is the normative ground
  for the measured law that `accept` is a hint (a dialog filter), not a validator.
- **S219** — the `showPicker()` IDL description's cross-origin step, exempting File Upload and Color
  (local lines 5608–5610). Located quote (21 words): "Throws a 'SecurityError' DOMException if input
  is inside a cross-origin iframe, unless input is in the File Upload or Color states." The same
  block's "Shows any applicable picker UI … If input does not support a picker, this method does
  nothing" (local lines 5597 and 5599–5600) bounds the colour law to "no FILE chooser".

Identified 2 / screened 2 / included 0 / excluded 2 for NEW rows: the two rows this round located
quotes in are **S219 and S223**, both anchoring the same living URL, and neither is a new registry
row (the round adds measured laws, not sources). **S216** anchors the same page and is carried along
with the fetch. **S221 (CDP Page domain) and S222 (CDP DOM domain) are carried citations, not
re-opened this round**: their rows anchor `chromium.googlesource.com` `.pdl` files, and no `.pdl` was
fetched or staged in round 86 (the round's only staged source is the WHATWG page — `ls
.ufo/waves/round-86/sources/` → one file). The r86 note's `source:` line cites S221/S222 for the CDP
commands the driver uses; that is a citation of the carried rows, not a claim they were re-opened
here.

Admitted: `corpus/knowledge/chromium-showpicker-runtime-round-86.md` (cites S223, S219, S216, S221,
S222).

Rejected (with flip conditions):

- **"The same-origin colour arm proves no colour popup opened"** — the receipt records zero
  `Page.fileChooserOpened` events, a FILE-chooser metric; the colour popup is not a CDP file-chooser
  event. Flip: a UI-side probe or a source-side reading of the colour chooser path.
- **"`accept` filters what the user's dialog offers"** — five programmatic answers are measured;
  the dialog itself is not (headless opens no real dialog). The measured law is narrower: `accept` is
  never a programmatic answer's validator — the answer is not filtered; what a user's dialog would
  offer or reject is unmeasured. Flip: an interactive-dialog harness.
- **"The accept grammar is fully enumerated"** — three token forms are measured (`image/*`, a mixed
  list, `application/pdf`). Flip: one leg per remaining form (`audio/*`, `video/*`, multi-MIME,
  whitespace variants).

Assimilation: none (`merge/tabi/` adoption stays closed pending the open L0 `tabi | round-57`).
`considerthese/`: no such directory in this lane.

### Admitted / rejected claims

C1 and C2 are frozen in `.ufo/waves/round-86/claims.json` (nonce `tabi-r86-l1-4bd89a80f439`, D
`4bd89a80f439`). Scored: counter clean **95** checks; battery **201** cases / 0 failed / coverage
95/95; kill power **66** mutants / 66 killed / 0 survivors / 0 crashed / 0 unapplied; witness families
before **3** survivors / after **0** (12 families).

## Mistakes

| class | evidence | captured-by | fix |
|---|---|---|---|
| `witness-polarity` — the first tel-only narrowing families were written as "skip the WHOLE law for search/text", and both generations killed them: the r85 battery already has `cross-origin-search-law`/`cross-origin-text-law` childResult cases, and dropping the whole law makes the tel cases vacuous | `.ufo/waves/round-86/scored/witness-a.json` first two runs: all 12 families killed in both generations | the witness runner's own before/after split, read before the freeze | families rewritten conjunct-scoped (`extra !== 'sp84-cross-origin-tel' || <conjunct>`); after the fix before = 3 survivors, matching R85Mut1's routed finding |
| `guard-inversion` — the first conjunct-scoped families used `extra === 'sp84-cross-origin-tel' || <conjunct>`, which drops the conjunct FOR tel and keeps it for search/text — the opposite of the narrowing | second witness run: `narrow-tel-*` killed in both generations by their own tel cases (`firstFailure: cross-tel-*`) | the same before/after split | operator flipped to `!==`; before 3 / after 0 |
| `kill-power-reach` — the first frozen-mutant list left three survivors (`accept-grammar-state-dropped`, `color-law-activation-dropped`, `color-law-no-input-dropped`): the battery had no case mutating the accept-law state, the colour activation transition, or adding an input event to the colour leg | kill-power run on the probe receipt: 66 mutants, 3 survivors | the kill-power summary's `survivorsList` | three battery cases added (`accept-grammar-law-state`, `color-law-activation-after`, `color-law-input-event`); 66/66 killed |
| `prior-set-hygiene` — a byte-identical second copy of the first probe (`probes/probe1.json`) sat beside `prior1.json` and the counter refused every case with `prior-set-complete` | battery run: every case `extra ["prior-set-complete"]` | the counter's prior-set-complete finding, read before the freeze | deleted the duplicate; the mirror-lane build now copies only the prior-set's own files instead of the whole `controls/c1` tree (which had also copied the receipt under test) |
| `record-identity-drift` — the re-freeze history in `plans/round-86.md` named the superseded D1 nonce in the `tabi-r86-l1-<12 hex>` form the record-drift counter scans for, so the drift gate's `r86-identity` claim read the superseded identifier as a wrong nonce (exit 1, 8 claims, 1 mismatch, `wrong=["0e7bb7e08cac"]`) while every other claim passed | `node scripts/check-record-drift-r86.mjs --lane <ABS lane> --json` before the fix: `failed ["r86-identity"]` | the drift counter's own `r86-identity` claim, re-run against the lane | the plan's D1 line now names D1 without restating the identifier; the same command exits 0 with `mismatches 0` — a record-prose edit; the counter, its claim, the pins, the prior set and the threshold are untouched |
| `control-reproducibility` — the frozen do-nothing control `controls/c1/nowork-r85-under-r86.json` records 39 findings and `treeExemptSha256: []`, but a re-run of the r85 receipt under the r86 counter yields **40** findings: the extra id is `prior-set-complete`, because the round's own scored receipt sits in the walked tree (`.ufo/waves/round-86`) and is neither the receipt under test nor a listed prior. Passing `--tree-exempt-sha256 035ac3f0…` (the r86 receipt's file digest) reproduces the frozen file exactly: 39 findings, identical id set, `checkCount 89`, exit 1 | this seat's two runs of the frozen command (`--expect-driver-sha256 1690c63d…` / `--expect-nonce tabi-r85-l1-620623a43f74` / `--expect-fixture-sha256 0b012937…d252a`): 40 findings without the exemption, 39 with it; the frozen file's id set equals the exempted run's id set | the counter's own `prior-set-complete` finding (the walk binds the test to the current tree contents) | recorded here as a re-runner caveat: the frozen control is byte-reproducible only with that one `--tree-exempt-sha256` argument. No predicate, pin, prior, threshold or kill rule changed; the frozen file is not edited |
| `source-accounting` — the round's own Gate prose counted the re-opened source rows as "2" while listing five, and listed S221/S222 (the Chromium `.pdl` files) among the rows re-opened, although round 86 staged and fetched only the WHATWG page | this seat's re-derivation: `.ufo/waves/round-86/sources/` holds exactly one file (`whatwg-input.html`, sha256 `b0202de1c0b4…`); `corpus/SOURCES.md:236–237` shows S221 and S222 anchor `chromium.googlesource.com` `.pdl` URLs | this seat's staged-source listing against the SOURCES rows | the Gate row above states the split this seat measured: 3 rows re-opened by one fetch (S216, S219, S223 — the same living URL), S221/S222 carried and not re-opened |

Sweep for further mistakes: the battery's 201 cases, kill power's 66 mutants, 12 witness families over
two generations, and the counter's 95 checks agree with the frozen law tables; the selftest's 10 gates
run them in order; no other class found.

## Corrections — the r85 spot-check's routed defects (append-only)

| # | routed defect | state at r86 close |
|---|---|---|
| 1 | report prose 21-vs-22 findings inconsistency | not repeated this round; every control number in the report is read from the committed JSON |
| 2 | kill-power reach (31 case-level survivors) | the frozen 66-mutant list kills every mutant it declares (66/66); the surviving families were folded into the battery as three state/activation/input cases, and the leg-narrowings into the witness runner |
| 3 | tel-only witnesses | closed: 12 search/text battery cases + six conjunct-scoped narrowing families; before 3 survivors → after 0 |
| 4 | zero-chooser = FILE-chooser metric only | carried into the r86 note and the colour law's wording ("no FILE chooser") |
| 5 | `accept` token grammar matrix | measured: `image/*`, mixed list, non-matching MIME token |

## Corrections — record drift caught by the round's own wave (append-only)

| # | record | stale statement | correction |
|---|---|---|---|
| 1 | `plans/round-86.md` §C2 | the first draft declared three whole-law narrowing families and a before-value of 3 | rewritten to six conjunct-scoped families; the mechanism and both measured values are recorded above |
| 2 | `.ufo/waves/round-86/claims.json` C2 `legs.a` | names the three survivors by family id | they are `narrow-tel-crossaccess`, `narrow-tel-childseq`, `narrow-tel-childact-before` — exactly R85Mut1's three |
| 3 | `.ufo/waves/round-86/freeze.txt` + every record's nonce | D1 `0e7bb7e08cac` was frozen with a `check-record-drift-r86.mjs` that could not parse (`SyntaxError: Unexpected identifier`, its new `accept-grammar-measured` claim) | repaired counter re-frozen as **D2 `4bd89a80f439`**; the scored run and every gate re-run at D2's nonce; the file and the records cite D2, and `plans/round-86.md §Re-freeze history` keeps D1 named |
| 4 | `plans/round-86.md` §Re-freeze history | the D1 line restated the superseded nonce identifier in the `tabi-r86-l1-<12 hex>` form the record-drift counter scans for, so `r86-identity` read it as a wrong nonce (drift exit 1, 8 claims, 1 mismatch) | the line now names D1 without restating the identifier; the same command exits 0 with `mismatches 0` — a record-prose edit; no counter, claim, pin, prior or threshold touched |
| 5 | this lesson's `## Gate` §Sources | "Identified 2 / screened 2 / included 0 / excluded 2" while listing five carried rows as re-opened, two of them (S221, S222) anchored to `.pdl` files this round never fetched | the split this seat measured: identified 2 / screened 2 / included 0 / excluded 2 (S219 and S223 — the two rows this round located quotes in, one living URL); S216 noted as anchoring the same page; S221/S222 recorded as carried, not re-opened |
```


### `/fast/scratch/hyaku/tabi-r86/R86Scribe/registry.md`

#### draft of the `## Round 86 gate registry` block for `SKILL.md`

```markdown
## Round 86 gate registry

- `check-showpicker-r86` (95 checks): `node scripts/check-showpicker-r86.mjs --lane <ABS lane> --receipt <receipt.json> --expect-driver-sha256 <hex> --expect-nonce <tabi-r86-...> --expect-fixture-sha256 <hex> --prior-set <file> --json`; exit 0 = clean, 1 = findings, 2 = usage/unreadable. Six new legs `sp86-accept-{wildcard-text,wildcard-png,mixed-text,mixed-png,pdf-token-png}` and `sp86-same-origin-color-activated`; new laws `accept-grammar-law` (accept is a dialog hint, never a validator: wildcard, mixed list and non-matching MIME token all accept a programmatic answer) and `same-origin-color-law` (undefined, activation consumed, no input/change, zero FILE choosers).
- Driver: `scripts/chrome-cdp-showpicker-round86.mjs` (30 legs; new parent inputs `#aw` `accept="image/*"`, `#am` `accept="image/png, .txt"`, `#ap` `accept="application/pdf"`, `#cos` `type=color`).
- Battery: `node scripts/negatives-showpicker-r86.mjs ... --work <scratch> --json` (201 cases, coverage 95/95; 12 search/text conjunct witnesses `cross-{search,text}-*`).
- Kill power: `node scripts/kill-power-r86.mjs ... --work <scratch> --json` (66 mutants, 66 killed, 0 survivors, 0 crashed).
- Family witnesses: `node scripts/witness-families-r86.mjs --lane <ABS lane> --work <scratch> --json` (12 families; before 3 survivors on the r85 battery — `narrow-tel-crossaccess`, `narrow-tel-childseq`, `narrow-tel-childact-before` — after 0 on the r86 battery).
- Self-test: `node scripts/selftest-r86-gates.mjs --lane <ABS lane> --work <scratch> --json` (10 gates).
- Record drift: `node scripts/check-record-drift-r86.mjs --lane <ABS lane> --json` (8 claims, 0 mismatches).
```


## Artifacts

- Drafts (scratch, removed at yield): `/fast/scratch/hyaku/tabi-r86/R86Scribe/{note.md,lesson.md,registry.md}`
  — contents preserved above.
- This report: `.ufo/waves/round-86/w1/R86Scribe.md`
- Tools: node v24.21.0, python3 3.14.8, chromium 155.0.8059.84 — **all pre-installed, none installed
  or upgraded by this seat**.
