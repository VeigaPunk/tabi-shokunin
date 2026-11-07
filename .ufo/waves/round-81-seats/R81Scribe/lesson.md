# tabi — round 81

L1 `TabiR81`. Base `c27e8406e6a2dc3cafcff030c9224cf8a14e3464`. Round 80 was admitted
(`round-80-verifier-spotcheck.md`); its ten routed defects are C2's spine and its named frontier legs
are C1's. Claims: C1 coverage — capability `chromium-showpicker-linux` generation r81; C2
calibration — the ten r80 routed defects plus the self-drift identity leg. Digests commit
**D = `a2183a93362259cb574ef3d03b565ee6d2c26599`**; scored nonce `tabi-r81-l1-a2183a933622`.

Census start: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` **exit 0**
(`.ufo/waves/round-81/census/start.txt`; 223 rows at base, W04 duplicate-URL warnings only). End: see
the report.

## Gate

### Sources — the four rows R81Scout opens (S222/S223 new; S219/S220 carried)

- **S219** WHATWG HTML, the input element's `showPicker()` steps —
  `https://html.spec.whatwg.org/multipage/input.html`. Opened 2026-11-07, HTTP 200, 687,515 B,
  sha256 `b0202de1c0b4…`. Located quote (the SecurityError step's type condition, lines 5835-5836):
  "this's type attribute is not in the File Upload state or Color state, then throw a
  "SecurityError" DOMException." (**18 words**). Tier A for the normative algorithm; the origin
  clause is 5832-5834 and the File/Color note 5838-5840.
- **S220** Chromium 155.0.8059.84 `html_input_element.cc` —
  `…/third_party/blink/renderer/core/html/forms/html_input_element.cc?format=TEXT`. Opened
  2026-11-07, HTTP 200, 135,428 B base64 → 2,818 lines, sha256 `405b52c70185…`. Located quote (lines
  2654-2655): "In cross-origin iframes it should throw a "SecurityError" DOMException except on file
  and color." (**14 words**). Tier A for the implementation at that tag; source order: origin
  2654-2663, `isMutable()` 2666, gesture 2673.
- **S222** CDP DOM domain (DOM.pdl) at the same tag — `DOM.setFileInputFiles`. Opened 2026-11-07,
  HTTP 200, 46,100 B base64 → 34,575 B, 1,022 lines, sha256 `50c460459e50…`. Located quote (line
  681): "Sets files for the given file input element." (**8 words**); the parameter block 683-691 is
  exactly `files`, `nodeId`, `backendNodeId`, `objectId` — no accept, no directory flag. Tier A for
  the answer command.
- **S223** WHATWG HTML, the file-upload state's `accept` attribute. Opened 2026-11-07 (same page
  fetch as S219), paragraph at lines 4067-4068. Located quote: "attribute may be specified to
  provide user agents with a hint of what file types will be accepted." (**18 words**). Tier A for
  the attribute's normative meaning.

Admitted: `corpus/knowledge/chromium-showpicker-runtime-round-81.md` (cites S219, S220, S222 and
S223; states the eight measured laws with their receipt field paths and what a receipt of this shape
cannot prove).

Rejected (with flip conditions):

- **"The receipt proves Chromium's check order."** Reject: the receipt proves the PAIR —
  `SecurityError` cross-origin and `InvalidStateError` same-origin for the same disabled `type=date`
  call. "The origin check ran first" is the only reading consistent with S220's source order plus
  that pair, but it is not an observation of the check. Flip: a probe that isolates the mutability
  check cross-origin (a cross-origin non-file input whose origin check is bypassed).
- **"`accept` is validated on a programmatic answer."** Reject: S223 calls it a hint and the measured
  answer accepts `.txt` into `accept=".png"` (law 4). Flip: a build that refuses a programmatic
  answer by `accept`.
- **"A directory answer needs `multiple`."** Reject: the directory leg's input is `multiple:false`,
  `webkitdirectory:true`, and the directory's two files arrive with `webkitRelativePath` set (law 3).
  Flip: a build that refuses a multi-file directory on a single-file input.
- **"The second chooser replaces the first."** Reject: two `Page.fileChooserOpened` events fire, both
  `selectSingle`, both the same `backendNodeId` (9 on probe2, 10 on the scored receipt — the id is
  browser-assigned). Flip: a build where the click closes the first chooser (one event, or a page
  `cancel`).
- **"A `webkitdirectory` input opens `selectMultiple`."** Reject (carried from r77): the mode follows
  `multiple` only; the directory leg's chooser is `selectSingle` (law 6). Flip: a tag that maps
  upload-folder to `selectMultiple`.
- **"The cross-origin SecurityError is unreachable from page script."** This was the r80 reject; r81
  FLIPS it — the child origin's own script reaches the step on a non-file input (law 1). The r80
  file-input leg exercised the exemption, not the error.

### Admitted / rejected claims

C1 admitted as the round's coverage move (capability generation r81; see `claims.json` /
`SCORECARD.md` for the frozen predicate, counter, pins and kill rule). C2 admitted as the calibration
move (`scripts/check-record-drift-r81.mjs`; before state `lesson-proof/c2-before.json`, **12**
mismatches). The r80 battery's 102/102 and kill power's 80/80 are re-derived from the committed r80
scored outputs, not from the correction text.

## Mistakes

| class | evidence | captured-by | fix |
|---|---|---|---|
| `crash` — the fixture's `fl()` helper read `t.files` unguarded; the r81 fixture calls it on `#disd`, a `type=date` input whose `files` is `null`, so `Array.from(null, …)` throws `TypeError: object null is not iterable` and the leg's `__state()` never returns (`#dis` is a file input, whose `files` is an empty FileList, so it does not crash) | `scripts/chrome-cdp-filechooser-round78.mjs:172` (the template's `fl`) versus the r81 driver's asserted patch pair `PATCH_FL_FROM`/`PATCH_FL_TO` (`t.files ? … : []`) and `PATCH_STATE_TO`, which adds `dis: fl(g('dis'))`/`disd: fl(g('disd'))`; the failure mode reproduces as `node -e 'Array.from(null, x=>x)'` → `TypeError: object null is not iterable` | the driver's own patch assertion (`if (!PATCHED.includes(needle)) usage(...)`) — the guard must be present or the driver refuses to start | `fl()` guards on `t.files`; the date leg's `__state()` returns `disd` as an empty list |
| `no-op case` — the battery's click-while-open leg case mutated page event index 7's `buttons`, but the counter's per-leg shape did not bind `buttons`, so the case expected `leg-sp81-click-while-open` and the counter stayed clean (a case that cannot refuse) | pre-freeze battery pass 1 (`.ufo/waves/round-81-seats/R81Scribe/battery-pass1.json`; copy to `.ufo/waves/round-81/lesson-proof/battery-pass1.json` before landing), case `leg-sp81-click-while-open`, `ok:false`, detail `exit 0 expected leg-sp81-click-while-open got []`; the frozen case is `scripts/negatives-showpicker-r81.mjs:141` | the battery's own coverage rule (a case that cannot refuse is a failure) | the leg shape's `xy` cell is `[x, y, buttons]` (`check-showpicker-r81.mjs`, `legSummary`), so the same mutation now refuses |
| `interface` — the prior set is a newline-delimited PATH LIST, not a receipt; reading it as JSON makes the counter refuse its own committed prior set | observed on the frozen counter: a JSON document at the `--prior-set` path exits 2 `prior-unreadable` with `detail: "…/{: ENOENT"`; the loader reads text lines (`check-showpicker-r81.mjs`, the prior-set block) and each `--prior` is the JSON receipt. The first pass read the set as JSON (L1-reported; no committed artifact records that run) | the counter's `prior-unreadable` fatal (exit 2) — it names the path and the parse error instead of silently using one receipt as the list | read the set as paths, each `--prior` as JSON; the battery reads it the same way (`negatives-showpicker-r81.mjs`, the prior-set walk) |
| `wrong-id` — the `prior-set-unparsable` case's first form left the mirror lane's stray receipt in place, so the refusal also carried `prior-set-complete` (a case that fails for an id it does not name) | pre-freeze battery pass 2 (`.ufo/waves/round-81-seats/R81Scribe/battery-pass2.json`; copy to `.ufo/waves/round-81/lesson-proof/battery-pass2.json` before landing), case `prior-set-unparsable`, `extra ["prior-set-complete"]` | the battery's `alsoAllowed` rule (a refusal case must fail for the id it names and no other) | the case removes the stray receipt before writing the unparsable one (`negatives-showpicker-r81.mjs`, the prior-set walk), and the collateral id is named in `alsoAllowed` where it is legitimate |

Sweep for further mistakes: `ls .ufo/waves/round-81/controls/c1/` (the no-work and forgery controls,
the prior set, probes 1-2) and `ls .ufo/waves/round-81-seats/R81Scribe/` (the two battery passes
above); the committed scored outputs are `.ufo/waves/round-81/scored/`.

## Corrections

**Correction — the ten r80 routed defects.** The round-80 non-author spot-check
(`round-80-verifier-spotcheck.md` §6) found the lane's records stale against the committed bytes.
Records are append-only, so every stale statement stays where it is and this table names the
correction; `scripts/check-record-drift-r81.mjs` counts the mismatches (before: 12; after: 0).

| # | record | stale statement (verbatim) | correction (the truth) |
|---|---|---|---|
| 1 | `corpus/lessons/round-80.md` line 9 and the filed report | "End: 221 rows, exit 0" / "end **exit 0**" | `.ufo/waves/round-80/census/end.txt` says `census exit=1` (E11 S219/S220/S221 missing used-by). The green re-run is committed as `.ufo/waves/round-80/census/end-green.txt`, which says `census exit=0`; the note landed after the red census. |
| 2 | the scorecard (`SCORECARD.md:3950,3957`), the log (`LOG.md:3853-3854`), the skill registry (`SKILL.md:3250`) and the knowledge note (`chromium-showpicker-runtime-round-80.md:9,20`) | "D = `211962dccb618982638a74865ea616c6ca33e986`", "`--expect-nonce tabi-r80-l1-211962dccb61`" | The final r80 digests commit is D10 `93172ba92d6372563f9419b3aaf81f4b6398365b` and the final r80 nonce is `tabi-r80-l1-93172ba92d63`; the receipt and the filed report already carry them. |
| 3 | the filed report and the scorecard | "`lesson-proof/c1-nowork.json`" (a pointer to a file never committed) | The no-work control is committed at `.ufo/waves/round-80/lesson-proof/c1-nowork.json`: the r80 receipt under the r81 counter exits 1 with **34** findings including `schema` (the frozen r80 claims say 30; the committed file carries 34 — the count is read from the file, not the claim). |
| 4 | `.ufo/waves/round-80/claims.json` leg (b) | "listed in `scored/cold-runs.txt` (at least 4)" | The index is committed at `.ufo/waves/round-80/scored/cold-runs.txt`; every listed path exists (the four cold runs under `.ufo/waves/round-80-seats/`). |
| 5 | `corpus/lessons/round-80.md` lines 22-27 | "(lines 2654-2656)", "(17 words)", "(9 words)" | S220 is **14 words** at lines **2654-2655**; S221 is **7 words**. The counts are checked with `wc -w` before filing (QUALITY criterion added this round). |
| 6 | `.ufo/waves/round-80/claims.json` C2 leg (c) | "(battery 81/81, kill power 82/82, 57 checks)" | The committed r80 scored outputs carry battery **102/102** and kill power **80/80** at 57 checks; the frozen predicate is not edited. |
| 7 | `SCORECARD.md:3964` | "ANSWERED with `DOM.setInputFiles` on the event's `backendNodeId`" | The command is `DOM.setFileInputFiles` — the driver, the receipt's `answer.setParams` and the note all use it. |
| 8 | the filed report (R80Drift row) | "truth-moved → the five self claims" | The control's delta is **six** claims: `sc-80-numbers`, `log-80-numbers`, `skill-80-numbers`, `lesson-80-numbers`, `report-80-numbers`, `claims-80-numbers`. |
| 9 | the r80 filed report's landed-changes table | D10 `93172ba9` is named in the intro but absent from the landed-changes table | D10 `93172ba9` is **landed** (the digests commit) and is named in this round's landed ledger. |
| 10 | `.ufo/waves/round-80/scored/battery-a.json` | committed at D9, carries no `receipt` field, so 102/102 is not bound to the final receipt | `.ufo/waves/round-80/scored/battery-bound-a.json` carries `receipt.sha256` = the final r80 receipt's sha256, 102 cases, 0 failed. |

**Correction — the r81 self-drift identity leg.** Every r81 record cites the final nonce
`tabi-r81-l1-a2183a933622` and D `a2183a93…`; a record still carrying a superseded
`tabi-r81-l1-<hex>` is corrected here to the final nonce. The numbers leg reads the committed scored
outputs (`.ufo/waves/round-81/scored/counter-a.json`, `battery-a.json`, `killpower-a.json`), not this
text.

Scored (r81): battery 62/62, kill power 46/46, 56 checks.
