# R83Scribe — round 83 seat report (axis: depth)

Seat: scribe (leaf, read-only on the walked trees). Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Lane base `518f6b84`; wave dispatch point `4cdf4def`; final freeze pin set `b6496e6f5d4f…`.
Every claim below was measured by this seat against committed or working-tree bytes; anything I did not
measure is labelled as another seat's report.

## Deliverables (drafted, NOT landed — the L1 lands them)

| file | lands as | validated? |
|---|---|---|
| `.ufo/waves/round-83-seats/R83Scribe/knowledge-note.md` | `corpus/knowledge/chromium-showpicker-runtime-round-83.md` | every law's receipt field path re-read from the live receipt; the run-invariant claims separated from per-run values |
| `.ufo/waves/round-83-seats/R83Scribe/sources-rows.md` | five rows S224-S228 + `used-by` appends on S219-S223 | the five paste-ready rows were inserted into a scratch copy of the registry and measured through both instruments (below) |
| `.ufo/waves/round-83-seats/R83Scribe/lesson.md` | `corpus/lessons/round-83.md` | run through the frozen C2 counter on a scratch mirror: **exit 0, 7 claims, 0 mismatches**, and only `tabi-r83-l1-b6496e6f5d4f` appears in it |

The lesson draft is a full replacement: it keeps the round's substance, replaces the earlier "no new
source rows" Gate with the measured 19/19/5/14 record, and adds the eight evidence-backed rows the round
was missing.

## 1. The things the L1 must know before landing

**(a) The live lane is RED on C2 right now, and the cause is the lesson's own prose.** Running the frozen
counter against the live tree:

```
node scripts/check-record-drift-r83.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin --json
→ {"claims":7,"mismatches":1,"failed":["r83-identity"],
   "detail":"… cit=«b6496e6f5d4f, c016710129da» wrong=[c016710129da]"}
```

`grep -n 'tabi-r83-l1-c016710129da' SCORECARD.md LOG.md SKILL.md corpus/lessons/round-83.md` returns
exactly one line: `corpus/lessons/round-83.md:133`, the sentence that honestly records the superseded
first-freeze nonce — written with its `tabi-r83-l1-` prefix, which the identity leg's whole-file regex
reads as a wrong citation. My draft writes the superseded value as the bare 12-hex `c016710129da` and the
counter returns 0. **The fix is prose, not a predicate change.** `.ufo/waves/round-83/lesson-proof/
c2-after.json` in the working tree still records `mismatches: 1`; regenerate it after landing the lesson.

**(b) The scored receipt was re-run at the identity nonce; both runs are law-identical.** The in-tree
receipt is now the re-run (`sha256 7b465a0b…`, nonce `tabi-r83-l1-b6496e6f5d4f`, ports 19440-19442,
`fixture.sha256 7784c9de…`), while HEAD's blob is the first-freeze run (`3f9bbb60…`, nonce minted under
`4cdf4def`, ports 19340-19342, `fixture.sha256 e86ceb42…`). I projected 15 legs × 17 law-relevant fields
(child result, showPicker result, states, chooser modes, chooser-id equality, read `ret`s, upload shas,
activation transitions, child event shape, cross-access, closure) and the projections are **identical**;
the only differences are per-run values (ports, fixture and child document hashes, `backendNodeId`
assignment — the multiple leg's id is 13 in the re-run and 12 in the first run, the click-while-open
pair 12/12 versus 13/13). The note states this so a later reader does not treat a per-run id as law.

**(c) A scored artifact was observed truncated inside the walked tree.** `.ufo/waves/round-83/scored/
killpower-a.json` read **0 bytes** at 02:41 (empty-string sha256 `e3b0c442…`) and **5,327 bytes** with
`{mutants:50, killed:50, survived:0, crashed:0}` at 02:44. Any C2 counter run inside that window fails
`r83-numbers` with `kp=null`. Nothing is wrong with the final file; the hazard is real for a concurrent
scoring pass. Fix is mechanical: write scored artifacts to a temp file and rename.

## 2. The digest lineage (this round's 12-hex confusion, resolved)

`claims.json` `digestsCommit` is **the sha256 of `freeze.txt`**, not a git object id (`git cat-file -t
b6496e6f…` → `fatal: Not a valid object name`). Each freeze amendment moves it:

| commit | purpose | `sha256(freeze.txt)` | driver pin | counter pin |
|---|---|---|---|---|
| `4cdf4def` | digests + first freeze | `c016710129da…` | `70b522cc…` | `a89c2dbe…` |
| `27d5451b` | freeze amendment | `6ff35c28…` | `70b522cc…` | `7b9f9ec4…` |
| `5d6c34f0` | generation + calibration, scored | `9d90392aca79…` | `70b522cc…` | `7b9f9ec4…` |
| `615c97a1` | witnesses imported, final pins | `b6496e6f…` | `70b522cc…` | `7b9f9ec4…` |

Consequences: the brief's `D = 9d90392aca79…` is the `5d6c34f0` state; the brief's nonce
`…9d90392aca79` is carried only by a probe receipt (`.ufo/waves/round-83-seats/R83Exec2/
receipt-probe-firstbytes.json`), never by a scored run; the first scored receipt's nonce embeds
`c016710129da…` because it was minted at the first freeze. The frozen claims' "72 checks" is the
pre-amendment counter — verified by extracting `scripts/check-showpicker-r83.mjs` at `4cdf4def`
(sha256 `a89c2dbe…`) and scoring the same receipt with it: **72/72 clean**. So no record in this round is
lying about 72; the number is a snapshot, and the supersession 72 → 74 belongs in the lesson.

## 3. Controls I ran (all on scratch copies; the lane's C2 bytes untouched)

Reversed-correction and identity controls, C2 counter on a scratch mirror of HEAD bytes (baseline 0
mismatches):

| # | mutation | exit | failed ids |
|---|---|---|---|
| C1 | lesson arrow reversed (`23 -> 20` → `20 -> 23` only) | 1 | `direction-bound` |
| C2 | both arrows present (reversed arrow added beside the correct one) | **0** | — (co-existence tolerated) |
| C3 | the correction's named truth `mismatches: 4` → `mismatches: 99` | **0** | — (`truthNamed` is computed, never gated) |
| C4 | `c2-controls.json` `"refused": false` | 1 | `direction-bound` |
| C5 | one of the several `74 checks` statements deleted from SCORECARD | **0** | — (presence `>=1`) |
| C6 | baseline restored | 0 | — |
| C7/C10 | arrow present **only outside** the corrections table | **0** | — (anchor is file-wide, not cell-scoped) |
| C8 | frozen r82 lesson's `7 mismatches` → `4 mismatches` | 1 | `lesson-7-to-4` |
| C9 | restore | 0 | — |
| C11 | arrow removed entirely | 1 | `direction-bound` |

`grep -c child_process scripts/check-record-drift-r83.mjs` → **0**; no `spawn`/`exec`/`fork`. The header's
"re-executes the reversed control on a scratch mirror" is the drift seat's external act, not the
counter's, exactly as `R83Drift` §"Control 1" says.

Crash reproduction: deleting `clickAt: [160, 670]` from both click legs of a scratch copy of the frozen
C1 counter and scoring the real receipt gives `TypeError: Cannot read properties of undefined (reading
'0')` at line 389, exit 1 — the recorded pre-freeze crash, reproduced.

## 4. Receipt forgeries against the frozen C1 counter (scratch receipts, real pins)

| forgery | exit | failed ids | reading |
|---|---|---|---|
| `multiple-mode` page `read.ret` → `hex:00` | **0**, 74/74 | — | **false green**: the leg binds mode, file list, state and upload sha, not the delivered bytes |
| `accept-mime-answer` read `ret` → `hex:00` | 1 | `accept-mime-answer-law` | byte-bound |
| `second-chooser-answer` read `ret` → `hex:00` | 1 | `second-chooser-answer-law` | byte-bound |
| second-chooser id relabel (events + answer only) | 1 | `plan-calls` | the send log binds the id to the call |
| second-chooser id relabel to `999` at **all four** sites | **0**, 74/74 | — | inside the frozen limit by design (claims say so) |

Wrong-nonce control on the live receipt: `--expect-nonce` set to the brief's value → exit 1, 74 checks,
`nonce-expected` the only false check.

## 5. Sources: what the scout opened, and what I minted

19 candidates (14 × HTTP 200, 5 × 404), every staged file re-hashed against the pin of the row it would
collide with. Seven fetched files are byte-identical to an existing pin (WHATWG page `b0202de1c0b4…`,
`html_input_element.cc` `405b52c70185…`, `Page.pdl` `e944a3b19fa2…`, `DOM.pdl` `50c460459e50…`,
`file_input_type.cc` `f96265db986a…`, `inspector_dom_agent.cc` `e7c983b4b00f…`,
`inspector_page_agent.cc` `1dd744b58227…`); two more (`file_chooser.h` `1c24816c…`,
`identifiers_factory.cc` `8d8ee04e…`) are unregistered and carry nothing a law needs. Five carry ground
no existing row scopes:

| row | source | why not a re-open |
|---|---|---|
| S224 | WHATWG §4.10.5.3.5 `multiple` (same page, 22-word quote at raw line 4989-4991) | not in S219's (exception steps) or S223's (`accept`) scope |
| S225 | `file_input_type.cc` lines 62-70 `CollectAcceptTypes` (8 words) | outside S210's declared mined lines |
| S226 | `file_chooser.mojom` lines 14-59 (`Mode` enum, `accept_types`) — 9-word quote line 20 | URL absent from the registry |
| S227 | `inspector_dom_agent.cc` lines 636-658 `AssertNode` (3-word quote line 646) | outside S209's lines 1795-1817 |
| S228 | `dom_node_ids.h` lines 29-30 (+ `.cc` 22-38 in the anchor) — 13-word quote | URL absent from the registry |

Measured cost of inserting all five into a scratch registry: census `validate` **exit 0**, 223 → 228 rows,
37 → **40** `W04` lines (S224/S225/S227 are same-URL second scopes, the `S206`/`S212` precedent);
`check-sources.mjs` 15 → **18** `duplicate_url` in a gate that is already red at base with the same 15;
S226/S228 add nothing. The laws do not depend on S224/S225/S227, so they are droppable at zero claim cost.

Also measured, and recorded as a correction: **the SOURCES reciprocity is one-way for this whole family**
— `grep -c 'chromium-showpicker-runtime-round-8[23].md' corpus/SOURCES.md` → `0`, i.e. neither the r82 nor
the r83 note is named by any row's `used-by`, even though both cite S219-S228.

## 6. Knowledge-note facts I had to correct before drafting

- `fixture.sha256` **and** `fixture.child.sha256` are both per-run (nonce and child port are substituted
  into both documents: `e86ceb42…`/`f2b5b8a1…` in the first-freeze run, `7784c9de…`/`4f6d73dab664…` in
  the re-run). The only run-invariant identity in the receipt is the driver pin. The note says so.
- The counter's 74 checks decompose exactly as 53 literal `check('…')` ids + 1 template
  `check('leg-' + name)` × 15 legs + 6 loop-built cross-origin `*-law` ids.
- The carried set is **eight** law checks, not seven: `gesture`, `activation`, `mode`,
  `cross-origin-nonfile`, `order`, `webkitdirectory-answer`, `accept-answer`, `click-while-open`. The
  claims' phrase "r82 seven laws" matches neither the counter (8) nor the r82 note (5 numbered).
- The "accept-MIME" leg's input is `#k` with `accept=".png"` — an **extension** token; the fixture's
  `accept="image/png"` input (`#accept`) is targeted by no leg. The MIME-token branch is unmeasured and
  the leg's name describes the delivered file's media type.
- The delivered "PNG" is an 8-byte PNG signature plus the 13-byte ASCII marker; the counter checks bytes
  and sha256, never decodability.

## 7. Instrument disagreement, measured both ways

`scripts/check-sources.mjs` exits **1** with 15 `duplicate_url` findings at base `4cdf4def` and at HEAD
(same 15 rows); `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` exits **0**
and scores the same rows as `W04` warnings. "The registry is clean" is true of one instrument and false of
the other; the lesson and note now name the instrument. `check-capability-status.mjs` exits 0 (16 rows,
15 claimed, 1 provisional, 0 mismatches).

## 8. What the L1 should run

```bash
# 1. C1 on the live (final-nonce) receipt — expect exit 0, 74 checks, 0 findings
node scripts/check-showpicker-r83.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --receipt corpus/evidence/round83/chromium-showpicker/receipt.json \
  --expect-driver-sha256 70b522cc896f4a9b89320d58313b56519499566256cb0b7dd0b3a8aac1944fce \
  --expect-nonce tabi-r83-l1-b6496e6f5d4f \
  --expect-fixture-sha256 7784c9dece0f5c7ad1911733281a8bd7337a8a5588799cbda9acc02f9a9e55fa \
  --prior-set .ufo/waves/round-83/controls/c1/prior-set.txt --json

# 2. C2 after landing the lesson draft — expect exit 0, 7 claims, 0 mismatches
node scripts/check-record-drift-r83.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin --json

# 3. regenerate the proof file the working tree still records as mismatches: 1
node scripts/check-record-drift-r83.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin --json \
  > .ufo/waves/round-83/lesson-proof/c2-after.json

# 4. after projecting the lesson into the phase, the clean context
node scripts/selftest-r83-gates.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin --json
```

Landing order that keeps the counter green: **lesson first** (clears `r83-identity`), then c2-after, then
the SOURCES rows, then the note (which must cite S224-S228 or the census will refuse the rows as
`E11`-uncited at the structural gate).

## 9. Tooling, hygiene, scope

- **Tooling: none installed or upgraded.** Used the host's `node v24.21.0`, `python3`, `jq`, `sha256sum`,
  `grep`. No pacman transaction was attempted (host-wide PACMAN GUARD respected), so no L0 question was
  needed.
- **Writes:** only `.ufo/waves/round-83-seats/R83Scribe/` (three drafts + this report) and
  `.ufo/waves/round-83/w1/R83Scribe.md` (the assignment's Report trailer, alongside the sibling
  reports already there). No write to `claims.json`, `freeze.txt`, `controls/`, `scored/`, `census/`,
  `corpus/evidence/round83/`, `corpus/SOURCES.md`, `SCORECARD.md`, `LOG.md`, `SKILL.md` or any script.
- **Scratch:** `/fast/scratch/hyaku/tabi-r83/R83Scribe/` (mirrors, forged receipts, base registry copies)
  — deleted before yield; nothing was copied out of it because every finding is reproducible from the
  committed bytes with the commands above.
- **No commit, push, or mutating git/jj command** was run in the lane. The only git commands used were
  `git show`/`git log`/`git diff --stat` (read-only) and `git status`.
- **Limits of this report.** I did not execute the frozen driver (read-only seat); the re-run receipt and
  the cold-run receipts are other seats' artifacts, and I say so where I rely on them. The replay/
  translation limit, the four 404 probes and the sibling adjacency scan are other seats' measurements,
  cited as such.

Report: .ufo/waves/round-83/w1/R83Scribe.md
