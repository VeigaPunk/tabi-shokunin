HOLDS

# R74Scribe — independent re-derivation of the round-74 note and lesson Gate

Seat: R74Scribe (scribe/reviewer), round 74 w1, lane `tabi-shokunin`. Scope: re-derive the note's
measured claims from the receipts, check every quoted line and line number in
`corpus/knowledge/chromium-ime-composition-runtime-round-74.md` and `corpus/lessons/round-74.md`
against the staged sources, and review the lesson's Gate decisions. No product file was edited; no
instrument, predicate, pin or kill rule was changed or proposed to be changed.

**Verdict: the note's measured table and the lesson Gate hold.** All 10 rows of the measured table
and all 9 quoted strings reproduce. I found ten citation-precision items in the note
(`note-review.md` §5, F1-F10) and six in the Gate (`gate-review.md` §5, G1-G6); none is a false
statement and none changes a conclusion.

## Behavior — what was executed

| command | exit | result |
|---|---|---|
| `node derive.mjs` (re-derives every leg from the raw `events` of the 9 smoke receipts + the scored receipt, then compares with `legShape` and `stateAfter`) | 0 | 10 receipts × 16 legs × 6 fields: **0 mismatches**; all 10 shapes JSON-identical; 40 events, `keyEvents 0`, untrusted types `["compositionend"]`, `firstFocusin compose-a`, IME calls 11, `predicate true`, `failures []`, `lateAfterClose 0` (`derive.out`, `derived.json`) |
| `node pairs.mjs` | 0 | 36 smoke pairs: min max-diff 1.0 ms (s6-s7), 0 pairs < 0.05 ms; scored receipt is 17.9-33.3 ms from every smoke (`pairs.out`) |
| `node scripts/check-imecompose-r74.mjs --receipt <byte-identical copy of the scored receipt> --expect-driver-sha256 afacee1b…dc2dc --expect-nonce tabi-r74-l1-ca30e1a3b7b2 --prior ×12` | 0 | `verdict clean`, `checkCount 148`, `findings []` (`counter-a.json`) — predicate (a)'s counter leg as stated |
| `node gate.mjs` | 0 | 9 quotes: 8 occur on the stated single line; S193's occurs only across 1772-1773 after whitespace normalization; all ≤ 25 words (max 10) (`gate.out`) |
| `node w04.mjs` (replicates the census W04 rule from `scripts/sources-census.sh:643-645`) | 0 | 25 W04 at `8c081aa3`, 27 at HEAD; the two new are exactly S187 and S188 (`w04.out`) |
| `sha256sum` of the 4 instruments, 7 staged sources, and the S173/S174 prior copies; `wc -l` of the sources | 0 | all pins match `freeze.txt`; S187/S188 byte-identical to the round-68/round-69 copies; line counts 336/2343/2163/1175/496/99/1999 (`digests.out`) |
| read-only `git -C tabi-shokunin show/log/rev-parse/diff/merge-base` | 0 | 186 rows pre-append, 7 additive rows, base `c72235d` is an ancestor of `db59ed42`, QUALITY 139 added in `b70e0a27` |

Measurements were checked against the committed receipts; **no new Chromium run was made**, and
the battery and kill-power instruments were read, not re-executed (`pf-smoke1.battery.json`
239/239 gap 0; `pf-smoke1.killpower.json` 148/148 + 26/26, `holds true`).

## Gates — what holds

- The note's measured table, row by row (compose-a/b, commit, plain, compose-c, replace-half,
  cancel, ce-compose/ce-commit, nofocus-compose, nofocus-insert): every event sequence, `data`
  (code points checked: U+304B, U+304B U+306A, U+0061 U+0062 → U+0078, U+0065 U+0301 →
  U+00E9), `isComposing`, `isTrusted` and state-after equals the raw log — `note-review.md` §3.
- The trust law: 3 untrusted events per receipt, all `compositionend`; every other event trusted;
  sourced by `event_target.cc:868` + `event_dispatcher.cc:88-93` + `scoped_event_queue.cc:75-79`
  + the absence of any `SetTrusted` in the queued path (`note-review.md` N15, F6).
- Every note line citation falls inside the staged file and names what it claims
  (`note-review.md` §4): `Input.pdl:141-162`, `input_handler.cc:1281-1359`/`1345`,
  `input_method_controller.cc:1009-1095`/`1032-1034`/`1084`/`694-705`/`700`/`704`/`924-932`/`393`/`1004`/`409`,
  `event_target.cc:868`, `event_dispatcher.cc:88-93`/`175-176`, `scoped_event_queue.cc:76-79`,
  `editing_utilities.cc:1772-1773`.
- The lesson Gate: all seven rows are tier A / kind code / status mined / recheck on-release /
  used-by note+lesson; every located quote occurs (S193 as a range); all ≤ 25 words; digests and
  line counts match `FETCH.txt`; the pre-append grep count is 0 at `8c081aa3`; the append is
  additive (`7 0`); W04 25 → 27; MANIFEST index 1469 is tabi round 73 admitted; the watchdog shows
  one round-74 launch, attempt 1; m1/m2/m3's proof numbers reproduce (my independent pair
  recomputation matches m3 exactly).
- One admit and one reject decision are spot-checkable without the author: the admitted note's
  trust law (3 `SetTrusted` hits, 3 untrusted `compositionend` of 40) and the rejected
  `Input.imeCommitComposition` hypothesis (`grep` → one comment at `Input.pdl:149`, no
  declaration) — `gate-review.md` §2-§3.
- Instrument pins: driver `afacee1b193ea2ba7ccab945956cee912eeed18cc5aa2fcacf5d65dc261dc2dc`,
  counter `5901d895ced1305f27935b93b409363c5822c7a730a6d2c7d00446ed7d33d251`, battery
  `8c0dd93a61177eb02691bee7f3a6d3762eb51cdf9d51599e7e23867ffe91fb26`, kill-power
  `dcc8308bea91639daf9cd412ec01d5b7acc72754eb48be68c03e4ca5c4967c69` — all four equal to
  `freeze.txt` (`digests.out`, exit 0).

## Touched surfaces

Writes (all inside this seat's directory, plus the report path this seat names):
`.ufo/waves/round-74/w1/R74Scribe/{note-review.md, gate-review.md, report.md, derive.mjs,
pairs.mjs, w04.mjs, gate.mjs, derived.json, derive.out, pairs.out, w04.out, gate.out, digests.out,
perleg-a.md, counter-a.json}` and the trailer copy `.ufo/waves/round-74/w1/R74Scribe.md`.
No product code, lane root, fleet file or sibling seat file was written; no git/jj state changed;
the scratch `/fast/scratch/hyaku/tabi-r74/R74Scribe/` was removed on exit (receipts copied first).

## Out of scope (not done)

- No Chromium execution, no new receipt, no re-run of the battery or kill power. I did not attack
  the predicate, counter, pins or kill rule beyond reviewing the note and Gate claims.
- The note's "recheck" recipe was verified against the two usage blocks, not executed.
- The lesson's history statements that leave no artifact were marked, not judged: the first
  pre-freeze pass's 12 exit codes (G3) and the second pass's 9 refusals (G4).

## Findings (detail in the two review files)

Note (precision): F1 `-32602` is a measured CDP code, not text in S188; F2 the focused-widget
redirect is conditional for `InsertText` (`input_handler.cc:1290`); F3 `1009-1095` / `694-705` are
mined scopes, not function extents (functions end at 1192 / 717); F4 `SetComposition` does layout
and `SelectComposition` before the no-focus return; F5 the `input` half of the composition pair is
queued, not sent by `InsertTextDuringCompositionWithEvents`; F6 the trust/`other callers` claims
rest on absence and should say so; F7 `insertText` is not new ground (measured in round 51), the
composition command is. Additions: F8 the queued `input` can carry a `ts` one quantum earlier than
the preceding `textInput` (4/10 receipts); F9 the note predates the scored receipt, which
reproduces it; F10 the nine runs are nine independent launches (distinct tokens/ids/ports).

Gate (citation/boundary): G1 S193's quote is a two-line whitespace-normalized quote and the Gate
should state the match rule; G2 "186 rows" is not printed in the cited `census/start.txt` (true by
`git show 8c081aa3:… | grep -c`); G3/G4 the "12 runs" and "second pass 9/9" are narratives without
a committed run log (the rule effects do reproduce); G5 "the 1e-12 escape is closed" should be
scoped to sub-quantum perturbation, a ≥ 0.1 ms on-grid shift being the declared limit and a
must-accept battery case; G6 m3's 1 ms refusal depends on a `<=` comparison, the pair sitting
exactly at 1.0 ms (frozen tolerance is 20× below the nearest honest pair).

## Artifact paths

- `.ufo/waves/round-74/w1/R74Scribe/note-review.md` — statement-by-statement review, per-leg
  derivation, F1-F10 with proposed wording.
- `.ufo/waves/round-74/w1/R74Scribe/gate-review.md` — quote/line/word table, admit and reject
  spot-checks, G1-G6.
- `.ufo/waves/round-74/w1/R74Scribe/{derived.json,derive.out,pairs.out,w04.out,gate.out,digests.out,perleg-a.md,counter-a.json}`
  — receipts for every number above; the four scripts that produced them are beside them.

## Tooling

No installs or upgrades were made (no pacman, no uv/npm, nothing added to any PATH directory).
`node`, `sha256sum`, `wc`, `grep`, `git` (read-only) were already present.
