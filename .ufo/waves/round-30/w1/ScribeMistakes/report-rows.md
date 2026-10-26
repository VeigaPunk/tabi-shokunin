
## Mistakes

Mined from this round's own build and from round-29's routed defects 1 and 2 (`corpus/lessons/round-29-verifier-spotcheck.md:118`):
one row per mistake, in the `CORPUS.md` §5 vocabulary (`vacuous`, `survivor`, `stale-premise`, `reference-drift`,
`number-drift`, `scope`, `attribution`, `landing`, `provider`). Each fix names a red state that a stored command turns on;
the receipts (commands, exit codes, bytes and live-fetch records) are under `.ufo/waves/round-30/w1/ScribeMistakes/`.

| # | class | evidence pointer | captured by | fix |
|---|---|---|---|---|
| M1 | `attribution` | `corpus/lessons/round-29.md:20` (S114 Gate quote is S111's, the detached-document comment) — routed at `corpus/lessons/round-29-verifier-spotcheck.md:118` | `none` | round-30.md §"Re-grounded Gate quotes for S110, S114, S115" gives S114 its own span (`html_form_element.cc:867`); the frozen frontier counter's `g5-quote-located` requires a receipt quote to be a substring of **that row's** committed bytes |
| M2 | `stale-premise` | `/home/vgpnk/Projects/shokuknow/merge/tabi/knowledge/corpus/knowledge/host-rate-limit-signal-classes-r14.md:6` (sha256 `844ef05f…9c42a`): "`-10` and later currently return 404" | `none` | lane row S116 re-pins the draft at `-11` with `recheck: 180d` and drops the ceiling claim; `ScribeMistakes/anchor-ceiling-probe.mjs` fails on any ceiling a fetched revision contradicts |
| M3 | `survivor` | `.ufo/waves/round-29/w1/MutC3.md` mutant row 8 and survivor note 5 (f4-anchor-token survived: the case failed through the drift path, and the self-test asserted only exit + unresolved count) | `none` | round-30's `check-release-pins.mjs` self-test pins `reasons` per case (and `check-s106-evidence.mjs` pins `field`/`fieldValue`), so a case cannot be satisfied by a neighbouring failure path |
| M4 | `attribution` | `corpus/lessons/round-29-verifier-spotcheck.md:118` (routed defect 1): `corpus/knowledge/chromium-156-release-pin-recheck.md:3` cites 23 rows whose `used-by` omit the entry | `none` | the 23 in-place `used-by` appends logged old→new in round-30.md §"`used-by` changes"; the frontier counter's `r3-used-by` rejects a row whose `used-by` omits the citing entry |

### M1 — a row's Gate quote was another row's quote

- **Class:** `attribution`.
- **Evidence:** `corpus/lessons/round-29.md:20` records S114's located quote as "`:201-202` same comment as S111 (same blob,
  different scope: navigation sentinel)" — a pointer, not a quote; the span it points at is S111's, and S114's scope is the
  navigation sentinel (`html_form_element.cc:767-796,856-880`). Routed at `corpus/lessons/round-29-verifier-spotcheck.md:118`
  (defect 2).
- **Captured by:** `none` — no criterion in force at round 29 required a Gate quote to be locatable in the row's own bytes.
- **Fix:** round-30.md §"Re-grounded Gate quotes for S110, S114, S115" replaces the cell with
  `executing_tool->CallDoneCallback(base::ok(String()));` at `html_form_element.cc:867`
  (`corpus/evidence/round-29/release-pins/bytes/156.0.8078.47/…/html_form_element.cc`), and the frozen frontier counter's
  `g5-quote-located` rejects a receipt quote that is not a substring of the normalised bytes of that receipt's own
  `bytes_path`.
- **Able to fail** (`ScribeMistakes/a-demo.out`; frozen counter `cadef57e…9eca`, fixtures under scratch):
  - the round-29 Gate cell text as the receipt quote → `reasons: ["g5-quote-located S114"]`, exit 1;
  - S111's 17-word quote as S114's receipt quote → **also** `g5-quote-located`, exit 1: the quote is not contiguous in the
    156 bytes either, because line 202 re-opens with `//` ("…events, // whose handlers…"); the first line alone is present;
  - S114's own-scope quote (`If this form already made a request to navigate another frame which is`, line 857) → exit 0,
    admitted 1, so the fixture is not failing for an unrelated reason.

### M2 — a package anchor asserted a draft revision ceiling the archive contradicts

- **Class:** `stale-premise`.
- **Evidence:** `host-rate-limit-signal-classes-r14.md:6` (package file sha256 `844ef05f5d2531b2cf96958a0fa305b86d30e92c4cecab48d5c17fef7ea9c42a`)
  states "recheck: 180d — the draft revision moves; -10 and later currently return 404 (not run in this round)". Live on
  2026-10-26T07:06:06Z: `-09` 200 (67,876 B), `-10` 200 (67,803 B), `-11` 200 (67,097 B), `-12` 404 (77,297 B);
  receipts under `ScribeMistakes/receipts/draft-*.json`. The `-11` live bytes are byte-identical to the lane's committed
  S116 bytes (`d6016dd0…d412`).
- **Captured by:** `none` — no criterion required a staged anchor's negative ("N and later return 404") to be run, and the
  package row itself marks it "not run in this round".
- **Fix:** lane row S116 pins `-11` and states `recheck: 180d`; the ceiling claim is dropped
  (round-30.md §Gate, "Transform notes"). `ScribeMistakes/anchor-ceiling-probe.mjs` re-checks a `-N and later … 404`
  claim against live-fetch receipts.
- **Able to fail** (`ScribeMistakes/b-demo.out`):
  - staged line 6 → `CEILING_CLAIM contradicted: … -10 returned 200 (67803 bytes), -11 returned 200 (67097 bytes)`, exit 1;
  - the lane's corrected recheck text → `CEILING_CLAIM none`, exit 0;
  - control `-12 and later currently return 404` → `holds`, exit 0; control `-09 and later …` → `contradicted`, exit 1
    (the probe reads statuses, it does not always fail).

### M3 — a self-test that asserted exit + count let a mutant pass through the wrong path

- **Class:** `survivor`.
- **Evidence:** `.ufo/waves/round-29/w1/MutC3.md` mutant row 8 (`f4-anchor-token`, SURVIVED) and survivor note 5: the only
  anchor-token case was still unresolved through the drift path, and "the self-test asserts only exit + unresolved count,
  not the reason".
- **Captured by:** `none` — round-29's self-test format had no per-case expectation of the failure path.
- **Fix:** round-30's `scripts/check-release-pins.mjs` self-test carries `reasons: [...]` per case and the runner compares
  them (`reasonsOk`); `scripts/check-s106-evidence.mjs` gains `field`/`fieldValue` cases (`same-length-tamper-invalid`,
  `duplicate-anchor-invalid`, `receipt-byte-count-mismatch-invalid`). New case
  `f4-anchor-lacks-range-token-unresolved` (ranges `[[4,5]]`, anchor without a range token) makes the bypass change the
  verdict, not only the reason.
- **Able to fail** (`ScribeMistakes/e-demo.out`, `ScribeMistakes/c-demo.out`; catalogue mutant `pins-f4-anchor-token`,
  find string occurs exactly once):
  - frozen round-29 self-test bytes (`061e620:scripts/check-release-pins.mjs`, sha256 `56763720…3770`) + mutant →
    `verdict=clean cases=20 passed=20`, exit 0 — the survivor reproduces;
  - the same bytes with `reasons: ["f4-ranges"]` on `range-not-in-anchor-unresolved` and the reason comparison → pristine
    clean, mutant `verdict=failed`: the row is `exit 1 unresolved 1 expected_reasons ["f4-ranges"] rowReasons
    ["s1-drift-unsuperseded"]`, i.e. the reason is the only discriminator and the pin catches it;
  - round-30 bytes (`38891ca:scripts/check-release-pins.mjs`) + mutant → exit 3, case
    `f4-anchor-lacks-range-token-unresolved` FAIL.

### M4 — a citing entry's rows did not name it back

- **Class:** `attribution`.
- **Evidence:** `corpus/lessons/round-29-verifier-spotcheck.md:118` (routed defect 1): `corpus/knowledge/chromium-156-release-pin-recheck.md:3`
  cites 23 re-opened rows in `source:`, but their `used-by` cells omit the entry (e.g. `SOURCES.md:47` S033, `:59` S045).
- **Captured by:** `none` — `r3-used-by` was enforced only for frontier-tagged entries, and none of the 23 rows was on a
  frontier surface at round 29.
- **Fix:** 23 in-place `used-by` appends, logged old→new in round-30.md §"`used-by` changes"; `corpus/SOURCES.md` at the
  lane tip names the entry in 31 cells. The frontier counter's `r3-used-by` rejects a row whose `used-by` omits the citing
  entry path.
- **Able to fail** (`ScribeMistakes/a-demo.out`, case `a4-used-by-omits-entry`): a registry row whose `used-by` is
  `corpus/knowledge/other.md` while the tagged entry is `corpus/knowledge/fx-entry.md` → `reasons: ["r3-used-by S114"]`,
  exit 1, population 1, admitted 0.
- **Scope limit:** `r3-used-by` runs only on entries carrying a `frontier:` tag, so reciprocity between a non-frontier
  entry and its rows is still unchecked; the round-30 fix for those 23 rows is the curation edit, not a gate.
