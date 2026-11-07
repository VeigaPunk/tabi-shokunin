# tabi — round 80

L1 `TabiR80`. Base `e2e12ca58fe2cdbed4aa97af47793b6cfb5a9350` (lane clean, `local=remote`,
`ahead=0 behind=0`). Round 79 was admitted (`round-79-verifier-spotcheck.md`); its routed defects 1–4
are C2's spine and its named frontier legs are C1's. Claims: C1 coverage — capability
`chromium-showpicker-linux` generation r80; C2 calibration — record drift plus the self-drift leg.

Census start: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` **exit 0**
(`.ufo/waves/round-80/census/start.txt`; 218 rows at base). End: 221 rows, exit 0
(`.ufo/waves/round-80/census/end.txt`).

## Gate

### Sources — new rows (opened this round by the L1; the R80Scout seat re-opens them independently)

- **S219** WHATWG HTML, the input element's `showPicker()` steps —
  `https://html.spec.whatwg.org/multipage/input.html#dom-input-showpicker`. Opened 2026-11-07, http 200,
  687,515 B, sha256 `b0202de1c0b4…`. Located quote (the SecurityError step): "File and Color inputs are
  exempted from this check for historical reason" (12 words). Tier A for the normative algorithm.
- **S220** Chromium 155.0.8059.84 `html_input_element.cc` —
  `…/third_party/blink/renderer/core/html/forms/html_input_element.cc?format=TEXT`. Opened 2026-11-07,
  http 200, 135,428 B base64 → 2,818 lines, sha256 `405b52c70185…`. Located quote (lines 2654-2656):
  "In cross-origin iframes it should throw a "SecurityError" DOMException except on file and color."
  (17 words). Tier A for the implementation at that tag.
- **S221** CDP Page domain at the same tag — `…/devtools_protocol/domains/Page.pdl?format=TEXT`.
  Opened 2026-11-07, http 200, 82,548 B base64, sha256 `e944a3b19fa2…`. Located quote (line 1281):
  "Instead, a protocol event `Page.fileChooserOpened` is emitted." (9 words). Tier A for the
  interception contract.

Admitted: `corpus/knowledge/chromium-showpicker-runtime-round-80.md` (cites S219–S221; states the eight
measured laws with their receipt field paths and what a receipt of this shape cannot prove).

Rejected (with flip conditions):

- **"The cross-origin SecurityError is unreachable from page script"** — reject: the child origin's own
  script reaches it on a NON-file input (`type=text` → SecurityError "showPicker() called from
  cross-origin iframe.", R80Scout's measurement). The r80 file-input leg exercises the File/Color
  EXEMPTION, not the error. Flip: a committed non-file cross-origin leg in the receipt.
- **Admitted from the same probe (not a capability leg): the order law.** A cross-origin DISABLED
  `type=text` throws `SecurityError` while the same call same-origin throws `InvalidStateError` —
  Chromium checks cross-origin before mutability, the spec orders mutability first. Evidence
  `.ufo/waves/round-80-seats/R80Scout/probes/discriminating-orders.json` (cases A–E, each expected vs
  observed). The note's law 6b carries it.
- **"The disabled cross-origin input discriminates Chromium's order from the spec's"** — reject as
  built: the child's disabled input is `type=file`, so the exemption skips the cross-origin branch and
  Chromium falls to mutability → `InvalidStateError`, exactly the spec's order. Only a NON-file
  disabled input discriminates (same-origin → InvalidStateError, cross-origin → SecurityError). Flip:
  a non-file disabled leg in the fixture.
- **"A real click on an input whose picker is already open"** — not measured (R80Exec3's probe covers
  the programmatic double-open only). Flip: a click leg while a chooser is pending.

Assimilation: none (`merge/tabi/` adoption stays closed pending the open L0 `tabi | round-57`).
`considerthese/`: no such directory in this lane.

### Admitted / rejected claims

C1 admitted as the round's coverage move (capability generation r80; see `claims.json` / `SCORECARD.md`
for the frozen predicate, counter, pins and kill rule). C2 admitted as the calibration move
(`scripts/check-record-drift-r80.mjs`; before state `lesson-proof/c2-before.json`, 17 mismatches).

## Mistakes

| class | evidence | captured-by | fix |
|---|---|---|---|
| `ordering` — the deferred leg's arm expression ran AFTER the prior click, so the timer was never registered and the leg measured nothing (`deferredResult null`, no chooser) | pre-freeze probe1 `.ufo/waves/round-80/controls/c1/probes/tabi-r80-probe1.json` leg `sp80-deferred-timer` | the pre-freeze probe itself (a leg whose expected result is absent) | the arm block moved before the prior-click block; probe2 shows `{ok:true}` and one chooser |
| `ordering` — the chooser baseline was captured after the prior click, so the deferred leg's chooser (opened during the click) was counted as pre-existing and the dismiss never fired | probe2 leg `sp80-deferred-timer` `dismissSendId null`; `plan-calls` finding | the counter's `plan-calls` (the expected dismiss sequence) | the baseline moved before the intercept/click block; probe3 matches the plan |
| `scope` — the battery's runCounter did not exempt the committed scored receipt by content, so every case inherited `prior-set-complete` (77/81 failed) | `scored/battery-a.json` run 1: `failed 77` | the battery's own coverage rule (a case that cannot run is a failure) | `--tree-exempt-sha256 <real receipt sha>` on every real-lane run |
| `unsound-rule` — the replay rule's gap side refused an HONEST run: this driver's fixed waits reproduce gap durations across runs (an honest receipt matched a prior's single gap within 0.05 ms), and a uniform shift changes gap durations by ±0.1 ms through grid rounding | `scored/counter-a.json` at D5: `replay-event-timeline`, `gapMatched 1/1`; R80Critic's gap trilemma | the honest scored run itself (a refusal on a receipt no one forged) | the gap side is REPORTED, not a refusal; the rule is pair-based and the limit sentence states the escape; the battery's gap cases and the gap mutant were removed |
| `scope` — the unparsable-receipt walk flagged seat PROSE that quoted the schema (two seat reports), refusing the scored run | `scored/counter-a.json` at D6: `prior-set-unparsable` on `w1/R80Exec3.md` and `w1/R80Exec3/report.md` | the scored run (a refusal naming non-JSON files) | an unparsable receipt must be a `.json` file or start with `{`; prose is not a receipt |

Sweep for further mistakes: `ls .ufo/waves/round-80/lesson-proof/` (the red states above);
`node .ufo/waves/round-80/controls/c1/prefreeze-summary.json` re-reads the pre-freeze gates.

## Corrections (round-79 routed defects 1–4 — C2's subject)

**Correction — round 79 record drift.** The round-79 non-author spot-check
(`round-79-verifier-spotcheck.md` §6) found the lane's records stale against the committed bytes.
Records are append-only, so every stale statement stays where it is and this entry names the
correction; `scripts/check-record-drift-r80.mjs` counts the mismatches (before: 17; after: 0).

1. **SCORECARD r79 C1 row.** `battery 88/88` → `battery 90/90`; `kill power KILLPOWERNUM` →
   `kill power 64/64`. The committed r79 battery is 90 cases (`c1-negatives-a.json`) and the
   committed kill power is 64/64 (`selftest-r79-gates.out`).
2. **LOG r79 entry.** `88 cases` → `90 cases`; `66 semantic mutants` → `64 semantic mutants`.
3. **SKILL r79 registry.** `66 semantic mutants` → `64 semantic mutants`.
4. **The r79 report.** Its dead scored pointer `c1-killpower-a.json` → `selftest-r79-gates.out`; its
   dead short hash `f154beee` → `f154beeff14e349b84fa0d236461132295b7c017` (the full hash resolves).
5. **The r79 lesson.** `88 cases` → `90 cases`; the dead red-state pointer
   `lesson-proof/kp-run1.json` → `withdrawn`; the Gate quote counts `(12 words)` → `(10 words)`,
   `(19 words)` → `(15 words)`, `(23 words)` → `(11 words)`.

**Correction — the r80 limit sentence (R80Scout's HIGH flag).** The frozen claims' C1 limit said the
cross-origin legs "do NOT prove the spec's SecurityError step is reachable, because page script cannot
construct it". That is false: the child origin's own script reaches the step on a NON-file input
(`type=text` → SecurityError), and S219/S220 both exempt File/Color inputs, which is why the r80
file-input leg succeeds. The measured law is the EXEMPTION; the SecurityError is the r81 frontier's
first leg (a non-file cross-origin input). The frozen claims.json is not edited.

## Wave w1 findings (integrated)

- **R80Exec1 (F1/F2).** The counter changed under the seat mid-round (the gap-rule repair) and the
  scored receipt's nonce moved with D; both are recorded as routed instrument defects with the seat's
  evidence. Its leg (b): cold1 + cold2 driver exit 0, 7/7 legs, zero honest refusals, clean 57/57
  under both counter versions.
- **R80Critic (1–4).** The frozen nonce, the gap trilemma, the C2 self-drift weaknesses (counts only,
  no verdicts; the wrong-correction clause unenforced) and the capability-row wording are all
  integrated: the self-drift leg now reads the scored verdicts, every correction pair of a shape must
  name the true value, and the row states first-working round 79 with generation r80 in its
  description.
- **R80Scout (HIGH).** The SecurityError reachability refutation above; two locator corrections
  (`core/html/forms/` and `devtools_protocol/domains/` at this tag).

Scored (r80): battery 102/102, kill power 80/80, 57 checks.
