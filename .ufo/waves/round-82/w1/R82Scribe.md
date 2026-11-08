# R82Scribe — round 82 seat report

Seat: scribe (axes: depth). Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`, base
`4937252df252790420d3c8df956c96f865dac30a`. Read-only seat: no commit, no push, no mutating git/jj
command, no write into the walked trees. Everything below was measured against the committed bytes.

## Deliverables (drafted, NOT landed — the L1 lands them)

Three drafts under `.ufo/waves/round-82-seats/R82Scribe/`:

| file | lands as | notes |
|---|---|---|
| `knowledge-note.md` | `corpus/knowledge/chromium-showpicker-runtime-round-82.md` | r80 house style: title, `source:`/`verified-at:`/`recheck:` trio, `## Provenance`, `## The laws, as measured`, `## Limits`, `## Frontier` |
| `sources-rows.md` | four `corpus/SOURCES.md` rows (S219–S223), contract v1 shape | **re-opens, not new rows** — see below |
| `lesson.md` | `corpus/lessons/round-82.md` (`## Gate`, `## Mistakes`, `## Corrections`) | validated green against the live C2 counter, exit 0 / 0 mismatches |

**Verification of the lesson draft.** Copied the draft over `corpus/lessons/round-82.md` in a scratch
copy of the lane and ran the real counter:
`node scripts/check-record-drift-r82.mjs --lane <scratch copy> --json` → `claims 8, mismatches 0,
failed []`, exit 0. All eight legs green (`quote-count-propagation`, `wave-files-committed`,
`dead-seats-named`, `report-lands-last`, `r81-verdicts-preserved`, `direction-bound`, `r82-identity`,
`r82-numbers`). The lane tree was not modified.

## What the round actually is (the seat brief's numbers are stale)

The brief's C1/C2 text is the r81 shape; the committed r82 claim is different. Measured from
`claims.json`, `freeze.txt`, `.ufo/waves/round-82/scored/` and the committed receipt:

- 10 legs (not 6), 64 counter checks (not 56), battery 70/70 with coverage 64/64, kill power
  46/46, selftest 9/9.
- D = `5204a0581de5ef1a9eae08d156646dcb3e6ed25f`; nonce `tabi-r82-l1-5204a0581de5`.
- The driver pin in `freeze.txt` is `2085c2a7…` for all six instrument files — all six verified
  byte-identical to the committed files. (The brief's `e35e63c1…` is the **r81** driver pin.)
- The r82 receipt's own nonce is `tabi-r82-scored1`, distinct from the L1 identity nonce.
- `c2-before.json` records **4** mismatches of 8 claims, not 12.

The committed `corpus/lessons/round-82.md` and `corpus/knowledge/chromium-showpicker-runtime-round-82.md`
already exist and are green. My drafts are refinements, not first drafts.

## Findings

### 1. The C2 counter's "direction-bound" leg does not bind direction (false green)

`check-record-drift-r82.mjs`'s `quote-count-propagation` claim requires a `directional` match of
`/23.*→.*20|23-word.*20|superseded.*20/i`. The second alternative is satisfied by the STALE
quotation's own text on the corrections row ("23-word quote" … "20 words"), so the arrow's direction
is not what is tested. Measured on a scratch copy of the lane (lane tree untouched):

- Reversing the lesson's direction to `20 → 23` (with `20 words` still present): **exit 0,
  mismatches 0, `directional=true`**.
- Removing both arrows entirely (stale text retained): **exit 0, mismatches 0, `directional=true`**.
- Rewriting `lesson-proof/c2-controls.json` to assert `"refused": false`: **exit 0, mismatches 0** —
  the `direction-bound` leg only greps the controls file for the word `reversed`; it never re-executes
  the control.
- The sibling seat's own `R82Drift/control-1-reversed-correction.json` records **0 mismatches**
  (i.e. the reversed correction was NOT refused), while the committed
  `lesson-proof/c2-controls.json` asserts `"refused": true, "finding": "quote-count-propagation"`.
  The two committed records disagree.

The committed lesson's sentence — "the quote-count claim requires the lesson to carry the
`23 → 20` direction (not merely both numbers) … the directional check refuses it" — is false as
written. The refusal that does happen comes from the `20 words` token check, not from direction.

**Not amended by me.** The counter is frozen and out of my seat's scope to change; the drafts state
the measured truth and route the false green forward. The reproduction is fully specified in
`lesson.md`'s Mistakes row 7 and Corrections row 11 so the next round can attack it.

### 2. The committed lesson's before-state number is wrong

`corpus/lessons/round-82.md` says "before: 7 mismatches" (twice, lines 46 and 63). The committed
`.ufo/waves/round-82/lesson-proof/c2-before.json` records **4** mismatches of 8 claims
(`failed: ["quote-count-propagation","direction-bound","r82-identity","r82-numbers"]`), and
`SCORECARD.md`'s r82 row says **4** as well. The drift counter does not catch this: its
`r81-verdicts-preserved` leg reads r81's `c2-before.json`/`c2-after.json`, never r82's own. My draft
lesson corrects it directionally and the SCORECARD numbers.

### 3. QUALITY 160's red-state pointer is dead

`corpus/QUALITY.md:1050` cites `.ufo/waves/round-82/controls/c1/probes/probe8.json` as the red
state. That file does not exist — the probes directory holds only `prior1.json`. The lesson's own
Mistakes row 1 says probes 1–9 were "not retained". A dead pointer is the r80 defect-3 class
recurring; my draft lesson adds it as a Mistakes row.

### 4. The r82 lesson's census line cites no artifact

The committed lesson claims "Census start: exit 1 (W04 only — see below); end: exit 0" with a
"see below" pointer to a section that does not exist, and no `.ufo/waves/round-82/census/` directory
(r81 committed `census/{start,mid,end}.txt`). Measured now: `sources-census.sh validate tabi` exits
**0** with 37 W04 lines and 223 rows. My draft states the measured exit and row count.

### 5. `used-by` reciprocity is broken for the committed r82 note (QUALITY 75)

The committed r82 note's `source:` line names S219 and S220, but **no** SOURCES row lists
`corpus/knowledge/chromium-showpicker-runtime-round-82.md` in `used-by`
(`grep -c chromium-showpicker-runtime-round-82.md corpus/SOURCES.md` → 0). S221's `used-by` names
only the round-80 note. QUALITY 75 requires the reciprocal direction. My `sources-rows.md` supplies
the four `used-by` appends (S219, S220, S221, S222, S223 → the r82 note path), each as an
old→new in-place append per SOURCES contract rule 2.

### 6. The four sources are re-opens, not new rows — and every re-open is byte-identical

The R82Scout seat's `FETCH.txt` and staged bytes show all four sources came back HTTP 200 and
**byte-identical to their committed pins**: WHATWG `input.html` `b0202de1c0b4…` (S219/S223),
`html_input_element.cc` `405b52c70185…` (S220), `DOM.pdl` `50c460459e50…` (S222), `Page.pdl`
`e944a3b19fa2…` (S221). I re-fetched all four independently and got the same digests. Because the
URLs and bytes are unchanged, new rows would be E04 `duplicate_url` violations
(`check-sources.mjs` already reports 15, all pre-existing at base) and would double-count unchanged
sources — so the drafts propose in-place `recheck`/`used-by` appends, contract rule 2, with each
change logged old→new.

Note the committed r82 lesson's Gate says only "S219/S220 re-opened" and "no new rows"; the seat
actually opened four sources (plus the accept paragraph from the same page). `sources-rows.md`
records all five.

### 7. Two `.b64` staged files were briefly error bodies (resolved)

When I first read the scout's staged sources, `html_input_element.cc.b64` and `dom.pdl.b64` held
gitiles "Object is not found" payloads, not source. By the time I finished, the scout had re-fetched
them and both decode to the pinned digests. No action needed; recorded so the L1 knows the staged
bytes are only trustworthy after the re-fetch.

### 8. The three r81 instrument mistakes are closed in the r82 bytes

The brief asked the Mistakes table to mine the `fl()` non-file crash, the click-while-open event
index no-op, and the prior-set-read-as-JSON mistake from this round's instrument history. In the
r82 instruments all three are **fixed**, and each fix is load-bearing:

- `fl()` on the `type=date` input: r82's `PATCH_FL_TO` guards `t.files ? … : []`
  (`chrome-cdp-showpicker-round82.mjs:132`) while `PATCH_STATE_TO` still calls `fl(g('disd'))` on the
  date input (`:136`) — the r81 crash site is live and the guard is what survives it. The receipt
  shows `legs[*].stateAfter.dis`/`disd` = `[]` and `failures: []`.
- click-while-open battery case: mutates index 7 (`pointerup@s`, buttons 0 → 1), not r81's no-op
  index 6 (`negatives-showpicker-r82.mjs:141`).
- prior-set read: the battery reads the prior-set file's first line and parses **that** file
  (`negatives-showpicker-r82.mjs:228-230`), not the prior-set file as JSON.

My draft records these as a `reference-drift` row so a later rename cannot silently drop them.

### 9. The counter's replay limit, as measured

From the scored counter output: 32 prior events, `absNeed 16`, `escapeEvents 17`, 32 own events,
1 own gap. The limit sentence and the gap-is-reported-not-refused clause are carried into the note's
Limits section verbatim from the committed `limit` block.

## Out of scope (not touched)

- The predicate, counter, battery, kill-power script, pins, prior set and kill rule — frozen, not
  proposed for amendment. Finding 1 attacks the counter's *reading* and is routed, not patched.
- Nothing was written into `.ufo/waves/round-82/` or `corpus/evidence/round81/` except this seat's
  own report path, which the brief assigns to `.ufo/waves/round-82/w1/R82Scribe/`. No JSON,
  receipt, or receipt-schema string was written anywhere (the seat-output rule).
- No git/jj mutation, no commit, no push. Scratch under
  `/fast/scratch/hyaku/tabi-r82/R82Scribe/` was deleted after the receipts were copied into the
  seat dir.

## Tooling

No installs were needed. The one external fetch used `curl` (present) against
`chromium.googlesource.com` and `html.spec.whatwg.org`; that host intermittently returns HTTP 503 and
needs retry — the scout's `FETCH.txt` records the same. No pacman transaction was attempted (the
host's pacman guard is paused).

## What the L1 must do

1. Land `knowledge-note.md` as the r82 note (it adds the four-source provenance, the `S221`/`S222`
   citations, the activation/answer byte-level detail and the r83 frontier).
2. Land `sources-rows.md`'s five `used-by` appends and `recheck` refreshes in `corpus/SOURCES.md` —
   each as an in-place append logged old→new, plus the search-log entry.
3. Land `lesson.md` (validated green against the live counter) — it fixes the 7-vs-4 before-state,
   the census line, the dead QUALITY pointer, the reciprocity gap, and states the direction-bound
   false green as measured.
4. Decide on finding 1: it is a counter-level false green with a committed-record contradiction
   (`c2-controls.json` vs `R82Drift/control-1-reversed-correction.json`). The counter is frozen, so
   this is a routing decision for the next round, not a same-round edit.
