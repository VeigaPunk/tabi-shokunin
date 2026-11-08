# R87Scribe — round 87 / w1 — independent record drafts (knowledge note, lesson Gate rows, SCORECARD + move-log rows, Mistakes candidates)

Seat: R87Scribe (scribe, axes `coverage` + `calibration`). Lane:
`/home/vgpnk/Projects/shokunin/tabi-shokunin`. Base `24765dd9`. Scored-receipt D `3dd4b0802d67`,
nonce `tabi-r87-l1-3dd4b0802d67`; instrument freeze observed at D6 `6d4a63d29e0c` (the lane moved
D3 → D4 → D5 → D6 while this seat was measuring — every digest below is stated with the freeze
generation it was read at).
Leaf member: **no subagent dispatch**. **No commit, no push, no mutating git/jj command** (read-only
`git log`/`git show`/`git diff`/`git status`/`git ls-tree` only). **No lane record was edited** —
`corpus/`, `SKILL.md`, `SCORECARD.md`, `LOG.md`, `plans/`, `scripts/` were read only. The only write
this seat made in the lane is this report. Nothing was written into `corpus/evidence/round87`.

**This seat's drafts were written under `/fast/scratch/hyaku/tabi-r87/R87Scribe/` (four files,
24,055 B total) and that scratch tree was removed before this yield** (lane bound). The four drafts
are therefore reproduced **in full** in §Drafts below, byte-for-byte as written, for the L1 to copy.

## What this seat measured (every command read-only against the lane; scratch-only outputs)

1. **The scored receipt** `corpus/evidence/round87/chromium-showpicker/receipt.json` — read
   directly. `schema tabi-chrome-cdp-showpicker-r87`, `lane tabi-shokunin`,
   `nonce tabi-r87-l1-3dd4b0802d67`, `driverSha256 7c54e786…e5f`,
   `fixture.sha256 10e444f7…d94c4`, `child.sha256 bbb22189…f671`, ports 48320/48321/48322,
   Chromium `155.0.8059.84` / CDP `Chrome/155.0.8059.84` / protocol 1.3 / node `v24.21.0`,
   **34 legs, `failures: []`**.
2. **The four new legs, field by field** (from the receipt's own `fixtureInputs` +
   `stateAfter` + `pageEvents` + `cdpEventLog`) — measured, not read off the plan:

   | leg | input | raw `accept` (page) | delivered (page file list) | trusted input+change | page-read hex | chooser |
   |---|---|---|---|---|---|---|
   | `sp87-accept-audio-png` | `aa` | `audio/*` | `tabi-r87-b.png`, 21 B, `image/png` | yes / yes | `89504e470d0a1a0a746162692d7238332d706e670a` | 1 × `selectSingle` |
   | `sp87-accept-video-text` | `av` | `video/*` | `tabi-r87-a.txt`, 22 B, `text/plain` | yes / yes | `746162692d7238332d616e737765722d616c7068610a` | 1 × `selectSingle` |
   | `sp87-accept-multimime-text` | `a2` | `image/png,application/pdf` | `tabi-r87-a.txt`, 22 B, `text/plain` | yes / yes | `746162692d7238332d616e737765722d616c7068610a` | 1 × `selectSingle` |
   | `sp87-accept-whitespace-png` | `aws` | `  image/png ,  .txt  ` | `tabi-r87-b.png`, 21 B, `image/png` | yes / yes | `89504e470d0a1a0a746162692d7238332d706e670a` | 1 × `selectSingle` |

   All four: `showPicker {ok:true, ret:'undefined'}`; `activationBefore {isActive:true,
   hasBeenActive:true}` → `activationAfter {isActive:false, hasBeenActive:true}`; exactly one
   `Page.fileChooserOpened`; one trusted `input` + one trusted `change` carrying
   `[name, size, type, ""]`; one `read` event whose `ret` is the delivered bytes' hex;
   `stateAfter[target]` = `[[name, size, type, ""]]`, unchanged after the chooser is dismissed. The
   whitespace variant's raw string is exactly `"  image/png ,  .txt  "` — two leading spaces, one
   before the comma, two after it, two trailing (whitespace included, as the page returns it).
3. **Distinct raw `accept` strings in the fixture — 8, not 7.** The receipt's `fixtureInputs` carry
   eight distinct non-null attribute strings: `.png`, `image/*`, `image/png, .txt`,
   `application/pdf`, `audio/*`, `video/*`, `image/png,application/pdf`, `  image/png ,  .txt  `.
   The counter's `accept-grammar-law` matrix (`scripts/check-showpicker-r87.mjs:685-695`) covers
   **seven** of them — the `.png` extension control on input `k` is enforced by the separate
   `accept-answer-law` / `accept-mime-answer-law` checks, **outside** the matrix. The claim's phrase
   "over seven token forms" is therefore true of the matrix and is one short of the fixture's
   distinct-string census. (R87Critic C1-6 recorded the same scope note; this seat re-derived the
   census from the receipt itself.) **Not proposed for amendment — the claim is frozen.** It is
   stated in the note draft as a scope sentence so the reader is not misled.
4. **Counter (C1 leg a), re-run by this seat against the frozen pins** —
   `node scripts/check-showpicker-r87.mjs --lane <lane> --receipt corpus/evidence/round87/chromium-showpicker/receipt.json --expect-driver-sha256 7c54e786…e5f --expect-nonce tabi-r87-l1-3dd4b0802d67 --expect-fixture-sha256 10e444f7…d94c4 --prior-set .ufo/waves/round-87/controls/c1/prior-set.txt --json`
   → **exit 0, `verdict clean`, `checkCount 99`, `findings []`**. The 99 decompose as 37 `leg-*`
   (34 per-leg + `leg-order`/`leg-records`/`leg-marks`) + 28 `*-law` + 34 structural. The
   `accept-grammar-law` id is present and true.
5. **The claims.json C1 counting command, verbatim** — with the nonce the frozen `claims.json`
   carried at the time this seat first read it (`tabi-r87-l1-42a489b9d4be`, D2) the run **exits 1**
   with the single finding `nonce-expected`; with the D3 nonce it exits 0 clean 99. The frozen
   command string was corrected in the lane during this seat's run (the `claims.json` `countingCommand`
   now reads the D3 nonce) — the correction is the L1's and was verified by R87Critic/R87Review1/
   R87Exec3 independently. This seat only re-measured the effect.
6. **Record-drift gate (C2)**, run twice by this seat: against the lane → **exit 0, `claims 5`,
   `mismatches 0`, `failed []`** (all five details positive: `skill=true plan86=true quality161=true`;
   `rows=2 stalePointer=false repointed=true note=true beforeSurvivors=3`; `round86-entry=true`;
   `scribeRow=true pointer=true ledgerItem=true`; `count=true sources=true`). The lane's committed
   BEFORE control `scored/drift-before.json` reads **claims 5, mismatches 5**, all five failed, with
   the per-statement details (`skill=false plan86=false quality161=false`;
   `rows=2 stalePointer=true repointed=false note=false beforeSurvivors=3`;
   `round86-entry=false`; `scribeRow=true pointer=false ledgerItem=false`; `count=false sources=false`).
7. **Selftest**, re-run by this seat at the D6 pin → **exit 0, `clean: true`, 10 cases, 0 failed**:
   `pins-match-freeze`, `counter-clean` (exit 0, clean, 99, `findings []`), `battery` (exit 0, 209
   cases, 0 failed, coverage declared 99 / covered 99, `uncovered []`, `unknown []`), `kill-power`
   (exit 0, 66 mutants, 66 killed, 0 survived, 0 crashed), `nowork-control` (exit 1),
   `noreceipt-control` (exit 2, `receipt-unreadable`), `tree-exempt-path-refused` (exit 2),
   `tree-exempt-unmatched-refused` (exit 1, `prior-set-unmatched-exempt`), `record-drift` (exit 0,
   5/0), `capability-status` (exit 0, 22 rows, 21 claimed, 1 provisional, 0 mismatches).
8. **Pins** — all six instruments' live sha256 match `.ufo/waves/round-87/freeze.txt` byte-for-byte
   at the freeze generation read (driver `7c54e786…e5f`, counter `6a2bb03b…81`, battery
   `9883807a…185`, kill-power `c95b5305…2c4`, selftest, drift gate).
9. **The sources** — the round's staged copy `.ufo/waves/round-87/sources/whatwg-input.html` is
   **687,515 B, sha256 `b0202de1c0b422d94d7aa23b4f1b0e3126d9d044bf7076394b6e00451f0fcd16`**, and is
   **byte-identical** to the round-86 and round-81 staging of the same digest (same file, same size).
   Both quotes this seat's Gate rows use were located in the tag-stripped, whitespace-collapsed page
   text and word-counted with `printf '%s' … | wc -w`:
   - **S223** — "The accept attribute may be specified to provide user agents with a hint of what file
     types will be accepted." → **20 words**, staged lines **4066–4068** (4066 ends `The accept`, 4067
     carries `attribute may be specified to provide user agents with a hint of what file types will
     be`, 4068 `accepted.`). The r86 Gate's 18-word fragment ("attribute may be specified …") is a
     verbatim substring of the same sentence at the same locator — verified.
   - **S219** — 'Throws a "SecurityError" DOMException if input is inside a cross-origin iframe, unless
     input is in the File Upload or Color states.' → **21 words**, staged lines **5608–5610**. The
     page's quotation marks are **straight double quotes** (U+0022) around `SecurityError`; the r86
     lesson renders the same sentence with **single** quotes, so the r86 rendering is *not* a
     byte-verbatim substring of the page (verified: the single-quote form is absent, the
     double-quote form present). Word count is 21 either way. My Gate row uses the page's own
     double-quote form and states 21 words.
   Also located in the same staged bytes and verified verbatim, for the limits the note cites: the
   picker-UI sentence "Shows any applicable picker UI for input, so that the user can select a
   value." (15 words, line 5597) and "If input does not support a picker, this method does nothing."
   (11 words, lines 5599–5600).
10. **Corpus counts** — knowledge notes **99 → 100** (`git ls-tree -r --name-only 24765dd9 --
    corpus/knowledge/ | grep -c '\.md$'` → 99; `ls corpus/knowledge/*.md | wc -l` → 100); SOURCES
    registry **223** rows, unchanged (`grep -cE '^\|\s*S[0-9]{3,}\s*\|' corpus/SOURCES.md`); the
    census artifacts `.ufo/waves/round-87/census/start.txt` and `end.txt` both end `exit=0` with
    223 rows and the `tabi ok` line.
11. **The r87 SKILL registry block** (`SKILL.md` §Round 87 gate registry) registers the six
    instruments; the selftest is described there as **9 gates** in the block read at first pass and
    the SCORECARD/LOG as 9 — the **tenth** gate (`noreceipt-control`) landed with D6 during this
    seat's run, and the SCORECARD/LOG blocks now say 10. See *Divergence 4*.
12. **The `## Mistakes` candidate set** — mined from the wave's own reports
    (`w1/R87Critic.md`, `w1/R87Review1.md`, `w1/R87Review2.md`, `w1/R87Mut1.md`, `w1/R87Exec1.md`,
    `w1/R87Exec2.md`, `w1/R87Exec3.md`, `w1/R87Sentinel.md`) and from the freeze history in
    `plans/round-87.md` §Re-freeze history. Every candidate row carries a committed evidence
    pointer; **none proposes amending a predicate, counter, pin, prior, threshold or kill rule.**

## Divergences between this seat's drafts and the lane's landed r87 texts (L1's call)

1. **The knowledge note body.** The lane's `corpus/knowledge/chromium-showpicker-runtime-round-87.md`
   (untracked, written during this wave) and this seat's independent draft agree on the law, the
   four new legs and their accept strings, the two rejected claims and the frontier. They differ in
   four places, all in the "cannot prove" section and one added section — **every difference is an
   addition of a limit or a measured fact, never a widening of the claim**:
   - **A new section `## The four new legs, field by field`** (the table in §2 above plus the
     per-leg field facts). The landed note states the four legs in prose inside law 1; the table
     makes the raw-attribute strings, the delivered tuples and the page-read hexes checkable
     line-by-line, which is what QUALITY 159's "locator is the range the quote occupies" spirit
     asks of a note.
   - **The seventh-form sentence now states what the seven are.** The landed note says "Seven token
     forms, not the whole grammar" without saying that the fixture carries an **eighth** distinct
     raw string (`.png`, the r84 extension control) enforced outside the matrix. Measured (§3 above).
     The draft adds that sentence; it narrows nothing the claim asserts.
   - **Three limits added** that the wave established but the landed note does not carry:
     the pins are **declaration-level** (the counter compares receipt fields to the CLI pins and
     never opens the instrument bytes; the fixture sha embeds the run's child-origin port);
     the **per-leg attribute copies are not separately witnessed** (the accept fact binds through
     the top-level `fixtureInputs` snapshot; the honest receipt has 0/34 divergent copies, but a
     per-leg copy can disagree with no finding); and the **comma/whitespace normalization rules are
     not on the staged page at all** (they live on two linked pages), so the whitespace leg measures
     the raw attribute string and nothing about a user agent's tokenisation.
   - **The delivered bytes still carry an r83 marker** — the PNG body is `89504e47…` +
     `tabi-r83-png\n` and the text body is `tabi-r83-answer-alpha\n`, under the r87 file names
     `tabi-r87-b.png` / `tabi-r87-a.txt`. The landed note quotes no hex, so the marker is invisible
     there; the draft states it so a reader does not read "r83" as a wrong-generation artifact
     (the same finding R86Scribe raised for r86).
2. **The lesson `## Gate` source rows.** The landed lesson's S219 row carries **no quote and no
   word count** ("carried from r86 as the ground of the colour arm"); the S223 row carries the quote
   but no count. My draft gives both quotes with `wc -w` counts and line locators, per QUALITY 159,
   and states the source-accounting split explicitly (S223/S219 re-opened on one fetch; S216 anchors
   the same page; **S221/S222 carried, not re-opened** — no `.pdl` was fetched this round).
   **The landed lesson's S219 rendering uses single quotes; the page uses straight double quotes.**
   Verified: the single-quote sentence is not a substring of the rendered page, the double-quote one
   is. The word count (21) is unaffected. The draft uses the page's own form.
3. **The SCORECARD capability row and the r87 move-log row.** The lane's landed `## Round 87`
   SCORECARD block and its LOG round block are **byte-equal** to my drafted capability row, `Scored
   (r87)` / `- Digests:` rows and LOG round block (checked by diffing my draft text against the
   working-tree files). The one difference is the **D-digest paragraph**: the landed block names
   **D4 `b1d06cf8db57`** (selftest path fix) and **D5 `c921658c6046`** (drift gate), and
   `plans/round-87.md` §Re-freeze history now also carries **D6 `6d4a63d29e0c`** (the selftest's
   tenth `noreceipt-control` gate). The landed SCORECARD r87 paragraph names D4/D5 but not D6 —
   **this seat did not amend it** (lane records are the L1's); flagging it here so the filed
   digest list covers the freeze the gates were last run at.
4. **Gate count wording.** The lesson's `## Admitted / rejected claims` line and the SKILL registry
   block as first read said **selftest 9/9**; the selftest now runs **10** gates (D6 added
   `noreceipt-control`) and the SCORECARD/LOG already say 10. The lesson line and the SKILL block
   still say 9 — a **record drift in two lane records**, not in any instrument. Flagged, not fixed.
5. **`claims.json` `digestsCommit`** holds `b1d06cf8db57` — a freeze-*content* digest (D4), not a
   commit id, and one generation behind the current freeze file (D6 `6d4a63d29e0c`). The `frozenAt`
   prose names the current digest correctly, so the file contradicts itself inside one JSON
   document. Also recorded by R87Sentinel F1 (the pinned bytes are in no commit). **Not amended
   here** — the claims file is frozen and the field's remediation is the L1's.

## What this seat did NOT get to (explicit)

- **No fresh measurement of the r88 plan, the r87 fleet report (`/home/vgpnk/Projects/shokunin/.ufo/…`),
  or the lane's `SHONEN.md` boxes.** This seat's scope was the four record drafts.
- **No drafting of the round-87 `## Corrections` table** (the lane's landed lesson already carries
  8 rows there, written from the wave's findings) and **no drafting of the SKILL `## Round 87 gate
  registry` block** (the lane's landed block registers all six instruments; this seat checked it
  against the six live pins and it matches).
- **No second-source re-opening**: this seat did not fetch the living WHATWG page itself — it used
  the staged bytes and verified the quotes and counts in them. The staged bytes are byte-identical
  to the round-86/round-81 staging of the same digest, and R87Scout's live fetch (HTTP 200, same
  digest) is the independent confirmation.
- **No verdict, no scoring, no gate-filing.** This seat measured and drafted; the L1 owns
  integration, the verdict and the filing.
- **The scratch tree was removed before this yield**, so the four drafts live only in §Drafts below.

## Out of scope (not done by this seat)

- No product code, counter, battery, kill-power, selftest, drift counter, driver or plan was
  edited. **No predicate, counter, pin, prior, threshold or kill rule was amended**, and none is
  proposed for amendment.
- No commit, push, publish or deploy; no `git add`/`commit`/`checkout`/`reset`/`push`, no `jj`
  mutation. Only read-only git calls.
- Nothing was written outside the lane tree (this report only), this seat's scratch dir, and a
  transient copy under `/tmp` taken while drafting. The fleet repo, the sibling lanes and
  `.ufo/state` were not touched. Nothing was written into `corpus/evidence/round87`.
- No tool was installed or upgraded: node v24.21.0, git and coreutils were already present (channel:
  existing host binaries; no pacman transaction, no `~/.local/bin` change, no PATH directory
  touched).

## Checks the main agent should run after integrating this seat's drafts

- `node scripts/check-record-drift-r87.mjs --lane <ABS lane> --json` → expect exit 0, `claims 5`,
  `mismatches 0` (measured at the D5/D6 gate: exit 0, 5/0). Re-run after any lesson edit — the
  `report-corrections` statement is a directional regex over `corpus/lessons/round-87.md`, so the
  lesson's wording must keep `says "39 findings"` and `committed control has **40**` in that order
  within 120 characters.
- `node scripts/selftest-r87-gates.mjs --lane <ABS lane> --work <ABS scratch> --json` → expect exit 0,
  `clean: true`, **10** cases (measured: exit 0, clean, 10/0 at the D6 pin).
- `node scripts/check-showpicker-r87.mjs --lane <ABS lane> --receipt corpus/evidence/round87/chromium-showpicker/receipt.json --expect-driver-sha256 7c54e786…e5f --expect-nonce tabi-r87-l1-3dd4b0802d67 --expect-fixture-sha256 10e444f7…d94c4 --prior-set .ufo/waves/round-87/controls/c1/prior-set.txt --json`
  → expect exit 0, `clean`, **99** checks (measured: exit 0, clean, 99, `findings []`).
- Re-derive the two prose counts the records assert in the same commit that changes them:
  `ls corpus/knowledge/*.md | wc -l` → 100 and
  `grep -cE '^\|\s*S[0-9]{3,}\s*\|' corpus/SOURCES.md` → 223 (both measured).
- If the L1 adopts the lesson's Gate rows: confirm `printf '%s' "<quote>" | wc -w` gives **20** for
  the S223 sentence and **21** for the S219 sentence, and that the S219 row renders
  `"SecurityError"` with straight double quotes (the page's own bytes) — the single-quote rendering
  in the landed r86 lesson is not verbatim.
- If the L1 adopts the note's four-legs table: the four raw `accept` strings must match the
  receipt's `fixtureInputs` exactly, whitespace included (`"  image/png ,  .txt  "`), and the four
  hex values must match `receipt.legs[*].pageEvents[read].ret`.

---

# Drafts (verbatim, for the L1 to copy)

## Draft 1 — `corpus/knowledge/chromium-showpicker-runtime-round-87.md` (body)

```markdown
---
source: S223 (WHATWG HTML — the file-upload state's `accept` attribute as a hint), S219 (WHATWG HTML `showPicker()` steps — the SecurityError and its File/Color exemption), S216 (the normative algorithm), S221/S222 (CDP Page/DOM domain, carried); receipt `corpus/evidence/round87/chromium-showpicker/receipt.json` (driver `scripts/chrome-cdp-showpicker-round87.mjs`, pin in `.ufo/waves/round-87/freeze.txt`)
verified-at: 2026-11-08 (round 87, Linux host, Chromium 155.0.8059.84 `--headless=new`)
recheck: `node scripts/check-showpicker-r87.mjs --lane <ABS lane> --receipt corpus/evidence/round87/chromium-showpicker/receipt.json --expect-driver-sha256 7c54e786d78d455b955e822deb4bf0419b85c4859c5287c27380d6b568389e5f --expect-nonce tabi-r87-l1-3dd4b0802d67 --expect-fixture-sha256 10e444f7fb840b6e132b4570794d3a0ed6f5db0781ca490a986685505e8d94c4 --prior-set .ufo/waves/round-87/controls/c1/prior-set.txt --json` → exit 0, 99 checks
---

# Programmatic picker generation r87 — the remaining `accept` token forms

Generation r87 of the held capability `chromium-showpicker-linux` (SCORECARD). Thirty-four legs, one
fresh browser per leg, `failures: []`. Round 86 measured three token forms and named the rest of the
grammar as frontier; this generation measures four more, one page input each.

## The measured laws

1. **`accept` is not a validator on a programmatic answer — now over seven token forms.** Every leg
   delivers a file through `DOM.setFileInputFiles` to an input whose raw `accept` attribute is read
   back from the page (`fixtureInputs`), and in every case the delivered file lands in the input's
   `files` list with its bytes, fires trusted `input`+`change`, and the page reads the bytes back
   (`read` event `ret: 'hex:…'`); `Page.fileChooserOpened` carries `selectSingle`. The new legs
   (this generation):
   - `accept="audio/*"` answered with `image/png` bytes — `sp87-accept-audio-png` (input `aa`);
   - `accept="video/*"` answered with `text/plain` bytes — `sp87-accept-video-text` (`av`);
   - `accept="image/png,application/pdf"` (multi-MIME, no space after the comma) answered with
     `text/plain` — `sp87-accept-multimime-text` (`a2`);
   - `accept="  image/png ,  .txt  "` (whitespace variant) answered with `image/png` —
     `sp87-accept-whitespace-png` (`aws`).
   The r86 forms (`image/*`, `image/png, .txt`, `application/pdf`) and the r84 extension-token law
   (`.txt` into `accept=".png"`) are the controls; the whole matrix is gated by
   `accept-grammar-law`. The spec's own word for the attribute is "hint": it "may be specified to
   provide user agents with a hint of what file types will be accepted". What a user's DIALOG would
   offer or refuse is not measured by this receipt.
2. **Carried unchanged from r86** — the same-origin `tel`/`search`/`text` arms, the cross-origin
   `date`/`month`/`week`/`time`/`number`/`range`/`tel`/`search`/`text` `SecurityError`, the
   origin-before-mutability order discriminator, the directory answer with `webkitRelativePath`,
   `multiple` → `selectMultiple`, the second-chooser payload answer, and the same-origin
   `type=color` activated arm (`undefined`, activation consumed, no input/change, zero file
   choosers). The r87 counter re-derives all of them (99 checks).

## The four new legs, field by field

| leg | input | raw `accept` (page) | delivered (page file list) | trusted `input`+`change` | page-read hex |
|---|---|---|---|---|---|
| `sp87-accept-audio-png` | `aa` | `audio/*` | `tabi-r87-b.png`, 21 B, `image/png` | yes / yes | `89504e470d0a1a0a746162692d7238332d706e670a` |
| `sp87-accept-video-text` | `av` | `video/*` | `tabi-r87-a.txt`, 22 B, `text/plain` | yes / yes | `746162692d7238332d616e737765722d616c7068610a` |
| `sp87-accept-multimime-text` | `a2` | `image/png,application/pdf` | `tabi-r87-a.txt`, 22 B, `text/plain` | yes / yes | `746162692d7238332d616e737765722d616c7068610a` |
| `sp87-accept-whitespace-png` | `aws` | `  image/png ,  .txt  ` | `tabi-r87-b.png`, 21 B, `image/png` | yes / yes | `89504e470d0a1a0a746162692d7238332d706e670a` |

Every one of the four: `showPicker {ok: true, ret: 'undefined'}`;
`activationBefore {isActive: true, hasBeenActive: true}` → `activationAfter {isActive: false,
hasBeenActive: true}`; exactly one `Page.fileChooserOpened` with `mode "selectSingle"`; a trusted
`input` and a trusted `change` on the target carrying the file tuple `[name, size, type, ""]`; one
`read` event whose `ret` is the delivered bytes' hex; `stateAfter[target]` =
`[[name, size, type, ""]]` and the same list after the chooser is dismissed. The raw attribute
strings are the bytes the page returned, whitespace included — the whitespace variant is
`"  image/png ,  .txt  "` with its two leading and two trailing spaces, one space before the comma
and two after it.

## What a receipt of this shape cannot prove

- **Acceptance is not filtering.** `DOM.setFileInputFiles` answers a chooser programmatically; the
  law says `accept` does not filter THAT path. What a user's dialog offers or rejects is not
  measured — headless opens no real dialog — and is not claimed.
- **Seven token forms, not the whole grammar.** The seven are the grammar matrix's seven distinct
  raw attribute strings. An eighth distinct raw string is present in the same fixture — the r84
  extension control `accept=".png"` on input `k` — and it is enforced by the separate
  `accept-answer-law` / `accept-mime-answer-law` checks, outside the grammar matrix. MIME
  parameters (`image/png;q=0.9`), case variants (`IMAGE/PNG`), combined `audio/*,video/*` lists and
  the full WHATWG "unique security error" ordering for every type stay unmeasured.
- **The whitespace leg measures the raw attribute string**, not a parsed token list: the counter
  compares the page's `accept` string exactly, so parser normalization is not inferred from it. The
  comma/whitespace normalization rules are not on the staged page at all (they live on two linked
  pages), so nothing here is a claim about how a user agent would split the value.
- **The counter reads a receipt.** Its printed `limit` names the escape: a forger who shifts every
  page event by a constant offset passes the replay rule. Provenance is bound by the driver pin, the
  fixture sha and the nonce; the browser's own execution is not re-derived, and the pins are
  declaration-level (the counter compares receipt fields to the CLI pins; it never opens the
  driver or the fixture template).
- **The per-leg attribute copies are not separately witnessed.** The accept fact is bound through
  the receipt's top-level `fixtureInputs` snapshot; each leg's own copy is present and, in the
  scored receipt, identical, but it is not independently checked.
- **The colour arm is bounded to the file-chooser metric.** Zero `Page.fileChooserOpened` events do
  not show whether a colour popup appeared; nothing stronger is claimed.
- **Secure-context state is not recorded.** The fixture is `http://127.0.0.1:<port>` (a
  potentially-trustworthy origin); nothing here measures a non-secure-context page.
- **The delivered bytes still carry an r83 marker.** The PNG body is
  `89504e47…` + `tabi-r83-png\n` and the text body is `tabi-r83-answer-alpha\n` under the r87 file
  names `tabi-r87-b.png` / `tabi-r87-a.txt`; the hex values quoted above are therefore r83 bytes
  under r87 names.

## Frontier (named, not held)

- `accept` MIME parameters and case variants (`IMAGE/PNG`, `image/png;q=0.9`).
- Combined media-type lists (`audio/*,video/*`) and the parser's whitespace/comma normalization
  read from the DOM rather than the raw string.
- A same-element origin comparison (an input reachable from both origins via a `postMessage` proxy)
  — not constructible in the current loopback fixture.
- What a `type=color` same-origin call does to the colour popup itself (not a CDP file-chooser
  event) — needs a UI-side probe or a source-side reading of the colour chooser path.
```

## Draft 2 — `corpus/lessons/round-87.md` §Gate → Sources

```markdown
### Sources — opened this round

The L1 re-opened the living WHATWG input page on 2026-11-08 (HTTP 200, 687,515 bytes, sha256
`b0202de1c0b422d94d7aa23b4f1b0e3126d9d044bf7076394b6e00451f0fcd16`, staged at
`.ufo/waves/round-87/sources/whatwg-input.html`; byte-identical to the round-86 and round-81
staging of the same digest).

- **S223** — the `accept` attribute's own sentence, in the File Upload state (§4.10.5.1.17).
  Located quote (**20 words**, `printf '%s' "<quote>" | wc -w`): "The accept attribute may be
  specified to provide user agents with a hint of what file types will be accepted." Locator:
  staged lines **4066–4068** (4066 ends `The accept`, 4067 carries `attribute may be specified to
  provide user agents with a hint of what file types will be`, 4068 `accepted.`). This is the
  normative ground for the seven-form acceptance law — a hint, not a validator on a programmatic
  answer. The 18-word fragment the r86 Gate quoted ("attribute may be specified …") is a verbatim
  substring of the same sentence at the same locator.
- **S219** — the `showPicker()` cross-origin refusal and its File/Color exemption. Located quote
  (**21 words**): 'Throws a "SecurityError" DOMException if input is inside a cross-origin iframe,
  unless input is in the File Upload or Color states.' Locator: staged lines **5608–5610** (5608
  opens the `Throws a "SecurityError" DOMException` step, 5609 the cross-origin-iframe clause,
  5610 the `File Upload` or `Color` states exemption). This bounds the colour arm to "no FILE
  chooser" and is the ground the carried colour law rests on.

Identified 2 / screened 2 / included 0 / excluded 2 for NEW rows; no registry change (S223 and
S219 were re-opened in place, not superseded). Carried, NOT re-opened: S216 (same page, same
fetch), S221/S222 (the CDP Page/DOM `.pdl` files — no `.pdl` was fetched this round). The registry
search-log entry for the round-86 bounded re-opening (routed defect 5) is the entry added at
`corpus/SOURCES.md` §Search log; this round adds no registry row and no new search-log entry.

Admitted: `corpus/knowledge/chromium-showpicker-runtime-round-87.md` (cites S223, S219, S216 and the
carried S221/S222 rows).

Rejected (with flip conditions):

- **"The accept grammar is fully enumerated"** — seven token forms are measured; MIME parameters,
  case variants and combined `audio/*,video/*` lists stay frontier. Flip: one leg per remaining form.
- **"The dialog filters what the user sees"** — the receipt answers programmatically; the dialog is
  unmeasured. Flip: an interactive-dialog harness.

Note on the whitespace leg: the comma/whitespace normalization rules are **not on the staged page**
(they live on two linked pages the source seat opened and excluded as registry rows), so the
whitespace leg measures the raw attribute string only and no parsing claim is made from it.
```

## Draft 3 — SCORECARD capability row + r87 move-log row

```markdown
| Capability | What it can now do | Evidence pointer | First-working round |
|---|---|---|---|
| `chromium-showpicker-linux` (generation r87) | As r86, and now: the `accept` acceptance law holds over seven token forms — `audio/*` ← png, `video/*` ← txt, a multi-MIME list `image/png,application/pdf` ← txt, and the whitespace variant `"  image/png ,  .txt  "` ← png all accept a programmatic answer with trusted input+change and page-read bytes, each raw attribute read from the page (34 legs, 99 checks) | `corpus/evidence/round87/chromium-showpicker/receipt.json`; `corpus/knowledge/chromium-showpicker-runtime-round-87.md` | 79 |

Scored (r87): 99 checks, battery 209/209, kill power 66/66, selftest 10/10, record drift 5 → 0.
- Digests: D 3dd4b0802d67, nonce tabi-r87-l1-3dd4b0802d67. 99 checks, battery 209 cases, kill power 66 mutants.
```

```markdown
## Round 87 — 2026-11-08 (attempt 1, Linux host)

L1 `TabiR87`. Base `24765dd9` (the round-86 verifier spot-check commit); D `3dd4b0802d67` (D1
`efbee055d6b4`, D2 `42a489b9d4be` superseded pre-report, `plans/round-87.md` §Re-freeze history);
nonce `tabi-r87-l1-3dd4b0802d67`. Claims: C1 coverage — capability `chromium-showpicker-linux`
generation r87, the four remaining `accept` token forms (`audio/*`, `video/*`, a multi-MIME list,
the whitespace variant), 34 legs / 99 checks; C2 calibration — the five lane-owned record defects of
the round-86 non-author spot-check, `check-record-drift-r87` 5 → 0.

Instruments (pins in `.ufo/waves/round-87/freeze.txt`): `chrome-cdp-showpicker-round87.mjs` (34
legs), `check-showpicker-r87.mjs` (99 checks), `negatives-showpicker-r87.mjs` (209 cases, coverage
99/99), `kill-power-r87.mjs` (66 mutants, 66/66), `selftest-r87-gates.mjs` (10 gates),
`check-record-drift-r87.mjs` (5 statements). Scored receipt
`corpus/evidence/round87/chromium-showpicker/receipt.json` (fixture `10e444f7…`, driver `7c54e786…`,
0 failures). Do-nothing controls: `controls/c1/nowork-r86-under-r87.json` (exit 1, 95 checks,
`schema`/`plan-frozen` among the findings) and `controls/c1/noreceipt.txt` (exit 2); the C2 before
control is the same frozen gate on a base `24765dd9` worktree (5 mismatches,
`scored/drift-before.json`).

Records: `corpus/knowledge/chromium-showpicker-runtime-round-87.md` (knowledge 99 → 100);
`corpus/lessons/round-87.md`; `plans/round-87.md`; SCORECARD round-87 section + capability row;
SKILL.md `## Round 87 gate registry`; QUALITY 161 (a narrowing sweeps every distilled copy); the
round-86 spot-check's record defects 3/4/5/7 closed and defects 1–2 carried into this round's
records; SOURCES §Search log round-86 entry; `.ufo/waves/round-86/lesson-proof/README.md`.
```

## Draft 4 — `corpus/lessons/round-87.md` §Mistakes (candidate rows)

```markdown
| class | evidence | captured-by | fix |
|---|---|---|---|
| `stale-nonce-pointer` — the frozen C1 counting command named the superseded D2 nonce, so the claim's own printed command exits 1 | `.ufo/waves/round-87/claims.json` (C1 `countingCommand`, `--expect-nonce tabi-r87-l1-42a489b9d4be`) against the receipt's `nonce tabi-r87-l1-3dd4b0802d67`; run reproduces exit 1, findings `["nonce-expected"]`, every other pin matching | R87Critic C1-2, R87Review1 F4, R87Exec3 §5 | pointer corrected to `tabi-r87-l1-3dd4b0802d67` after the freeze; a record fix, no predicate/pin change (`plans/round-87.md` §Narrowings item 3) |
| `stale-path-in-the-harness` — the selftest runner's lane-relative receipt path still named the round-86 receipt, so "selftest green" was false at the dispatched pin | the D3 `selftest-r87-gates.mjs` sha256 `3e41bd2e…` ran `counter-clean`/`battery` against the round-86 receipt (95 checks, 205 cases all failed) | R87Critic C1-3 | re-frozen as **D4 `b1d06cf8db57`** — path fix only; the selftest at D4/D5/D6 scores the D3 receipt 10/10; the record states the leg is measured at D4+, not at the D3 pin |
| `directionless-assertion` — a record-drift statement was a token test with no direction, so an inverted record scored 0/5 | the pre-D5 `report-corrections` check was `/39/` ∧ `/40/` ∧ `/control/`; an inverted record (says 40, control has 39) satisfies it | R87Critic C2-4 | the check is now a directional regex (`says "39 findings"` … `committed control has **40**`), re-frozen at **D5 `c921658c6046`** |
| `wrong-item-pointer` — the round-86 ledger's `falsifies-wording` Scribe row named `plans/round-86.md §Narrowings item 1`, which is the receipt-level narrowing, while the headline narrowing is item 9 | `.ufo/waves/round-86/claim-falsification.tsv:3` vs `plans/round-86.md` §Narrowings (item 9 carries the accept headline) | R87Critic C2-3 | the row was repointed to `§Narrowings item 9` and the drift gate now requires `item 9`; the row's claim/verdict/note are unchanged |
| `stale-empty-state-key-list` — the counter's `empty` predicate still named the ten pre-r87 inputs, so every leg's `state` shape read as non-empty and the counter refused honestly | `scripts/check-showpicker-r87.mjs` `EMPTY_STATE` / the `empty` key list; the D1 scored run's refusal on `no-selection-law` | this round's own freeze history (`plans/round-87.md` §Re-freeze history, D1→D2) | the key list was extended with `aa`/`av`/`a2`/`aws` and re-frozen as **D2 `42a489b9d4be`**; the scored run was repeated at D2's nonce. No predicate or threshold changed |
| `battery-leg-case-map-gap` — the battery's per-leg case map lacked the four new legs, so their generic state mutation tripped `no-selection-law` as an unlisted extra | `scripts/negatives-showpicker-r87.mjs` per-leg map (r87 entries for the four `sp87-*` legs) vs the four `accept-grammar-law-r87-*` cases | this round's own freeze history (D2→D3) | the four per-leg cases and the retargeted `no-selection-empty-dropped` mutant's `from` string were added and re-frozen as **D3 `3dd4b0802d67`**; the scored run was repeated at D3's nonce |
| `declaration-vs-execution` — the driver/fixture pins are receipt-field echoes: the counter compares receipt fields to the CLI pins and never opens the instrument bytes; the fixture sha is run-specific (it embeds the child-origin port) | `scripts/check-showpicker-r87.mjs` `driver-pin` / `fixture-hash`; the reviewer's rebuild of the served HTML reproduces `10e444f7…` exactly, and a garbage driver in a scratch lane still scores clean 99/0 | R87Review1 F1, R87Sentinel F6 | narrowing 9: leg (a)'s sentence narrows to "the receipt **declares** the pinned strings"; provenance rests on the driver's own `driverSha256` and the reviewer's independent rebuild, not on the counter |
| `page-read-is-optional` — the "read from the page" clause is receipt-level: the counter does not require the `window.__inputs()` call, and never reads `fixture.patch.*`, so the pinned fixture sha is not recomputable from the receipt | the page-read call is required by no check; `fixture.patch.body` / `.style` / `.inputs` can be rewritten or emptied and the receipt still scores clean 99/0 | R87Review2 F1, F2 | narrowing 6: the sentence narrows to "the scored receipt records the attribute read"; the act itself and the served-DOM source rest on the driver pin, the fixture sha and the reviewer's check |
| `per-leg-descriptor-not-witnessed` — each leg's own `fixtureInputs` copy is dead data; the accept fact is bound only through the top-level snapshot, so a leg's own copy can disagree without a finding | the honest receipt has 0/34 divergent per-leg copies, but mutating a per-leg copy to a bogus accept string exits 0 clean 99 | R87Review1 F2, R87Review2 F3 | narrowing 10: the fact is bound at the top level; the per-leg location is unwitnessed and the gap is recorded, not claimed away |
| `answer-echoes-unbound` — the grammar law binds the delivered name/size/type, the read hex and the event tuples, but not every answer field: `setParams.backendNodeId`, full `answer.files` equality (only `length === 1`), `setResult`/`setError`, and an extra `read` event survive the frozen battery | four whole-counter escapes in the mutation sweep (`setParams.backendNodeId` echo, `answer.files` echo, `setResult`/`setError` drop, read-count weakening) — battery green, counter clean | R87Mut1 S07/S08/S12/S11 | narrowing 14: the four echos are named as unbound and routed to the next generation; the law's bound conjuncts are unchanged |
| `cold-run-declaration-gap` — a cold run under a fresh nonce is refused only by the declaration `prior-set-complete`, because the in-tree scored receipt is neither the receipt under test nor a declared prior | two independent cold runs: 98/99 checks true, the single finding names `corpus/evidence/round87/chromium-showpicker/receipt.json`; no law check failed | R87Exec1 | narrowing 2: cold-run reproduction is 98/99, not 99/99; the scored receipt is clean because it is the receipt under test. A declaration decision (prior or content exemption) is the L1's, not an instrument repair |
| `non-reproducible-artifact-bytes` — `scored/killpower-a.json` is not byte-reproducible: the same 66 mutants and the same per-mutant outcomes re-run in a different `results` order (8 concurrent workers push on completion) | re-run of the frozen `kill-power-r87.mjs`; the k/s/c/unapplied totals and every mutant's outcome match, the array order does not | R87Exec2 F1 | narrowing 5: compare the per-mutant map, not the raw bytes; the instrument is frozen and is not amended |
| `unpinned-gate-instrument` — one selftest gate runs an instrument outside the freeze pin table: `capability-status` executes `scripts/check-capability-status.mjs`, which the selftest does not hash-assert and `freeze.txt` does not pin | the six pinned files vs the gate list; the instrument's bytes are fixed only by HEAD `24765dd9` | R87Exec2 F3, R87Sentinel F6 | narrowing 12: "selftest green" is ten gates, nine of which run pinned instruments; recorded as a coverage limit |
| `frozen-bytes-in-no-commit` — the six pinned instruments, `freeze.txt` and the scored receipt are in no commit; `digestsCommit` holds a freeze-content digest (`b1d06cf8db57`), not a commit id, and is one generation behind the current freeze file | `git rev-list --all -- <path>` → ABSENT for every pinned artifact; `git rev-parse HEAD` = `24765dd9` (the frozen base); the field value `b1d06cf8db57` vs the current freeze digest | R87Sentinel F1 | integration owner's call: land the r87 artifacts in one commit so the pins have a committed referent, and set (or rename) `digestsCommit` to the digest the `frozenAt` prose already names. No gate changes |
| `control-ordering-claim-unsupported` — the plan's "controls committed before any score" wording is not supported by the artifact timestamps: both controls were frozen before the wave but re-captured after the scored run | mtimes: `controls/c1/nowork-r86-under-r87.json` and `noreceipt.txt` 07:13:17 vs `corpus/evidence/round87/…/receipt.json` 07:11:39 | R87Exec3 §5 | narrowing 4: the wording is corrected; each control is a construction that cannot pass, so the ordering is not load-bearing |
| `exit-2-control-not-re-executed` — the exit-2 do-nothing control was a static file, not re-executed by any gate | the selftest's gate list at the D3–D5 pins had no `noreceipt` gate; only `nowork-control` (exit 1) was re-run | R87Sentinel F3 | re-frozen as **D6 `6d4a63d29e0c`**: the selftest gained a tenth gate `noreceipt-control`, which runs the counter against an absent receipt and asserts exit 2 with `receipt-unreadable`; the selftest at D6 is 10/10 |
```

## Divergences between this seat's drafts and the **committed r86 note's scope** (the r86 → r87 delta)

The committed r86 note (`corpus/knowledge/chromium-showpicker-runtime-round-86.md`, sha256
`a0ca941280969d4faf0c4e4a51ee30027268ba3a7c3345d94dbd0599149b3390`, byte-identical at base
`24765dd9` and in the worktree) covers **three** token forms (`image/*`, `image/png, .txt`,
`application/pdf`), the same-origin colour arm, the r84 extension-token control (`.txt` into
`accept=".png"`), and a frontier that named **`audio/*`, `video/*`, multi-MIME lists and whitespace
variants** as unmeasured. This seat's r87 draft:

1. **Closes exactly that frontier item** and adds four legs, one per named form — the r86 note's
   frontier sentence ("The remaining `accept` token forms (`audio/*`, `video/*`, multi-MIME lists,
   whitespace variants) answered one leg per form") is discharged by
   `sp87-accept-audio-png`, `sp87-accept-video-text`, `sp87-accept-multimime-text`,
   `sp87-accept-whitespace-png`.
2. **Moves the scope sentence from three forms to seven**, and states what the seven are (the
   grammar matrix's seven distinct raw strings) plus the eighth raw string the fixture carries
   outside that matrix — a scope sentence the r86 note did not need and this draft does.
3. **Carries the r86 colour arm and every r86 law unchanged** into law 2, and keeps r86's
   "dialog unmeasured", "colour arm is a FILE-chooser metric", "counter reads a receipt" and
   "secure-context not recorded" limits verbatim in substance. **The r86 note's witness-set limit
   ("six conjunct-scoped mutants") is not carried**: r87 has no witness runner — C2 is the
   record-drift counter — so that limit would be false here.
4. **Adds four limits the r86 note did not carry**, all established by this wave: the pins are
   declaration-level; the per-leg attribute copies are not separately witnessed; the
   comma/whitespace normalization rules are not on the staged page; and the delivered bytes carry
   an r83 marker under r87 file names.
5. **Adds the four-legs field table**, which the r86 note does not have (r86 stated its five accept
   legs in prose inside law 1).
6. **Carries the r86 `recheck:` discipline** — the r86 note's recheck line named
   `check-showpicker-r86.mjs` with the r86 pins and 95 checks; this draft names
   `check-showpicker-r87.mjs` with the r87 pins (driver `7c54e786…e5f`, nonce
   `tabi-r87-l1-3dd4b0802d67`, fixture `10e444f7…d94c4`) and 99 checks, re-measured at exit 0.
