# tabi — round 76

L1 `TabiR76`, attempt 1. Base `a69f9060cb9d239b3d6d4429e1b91177b792ebd3` (lane clean, `ahead=0 behind=0`;
no `lane-dead-no-report tabi round=76` line, nothing inherited).

Round 75 was admitted (spot-check `corpus/lessons/round-75-verifier-spotcheck.md`: C1 verifies; the
frozen limit sentence imprecise; claims item 2 omitted r74 F4/F5). The r73–r75 spot-checks (all
admitted) and the last rejections (r71, r72: honest stops) were read before the claim. Routed
defects of the r75 closure and what this round does with them:

1. *r74 F4/F5 (tolerance 0.05 → 0.045, grid 1e-4 → 0.02 survive the battery): apply as bracketing
   battery cases + semantic mutants.* Applied to this generation: the battery brackets every carried
   tolerance and threshold from both sides (pair tolerance 0.049/0.051 ms, grid 2e-5/5e-6 ms, abs 19/18
   of 37 events, gap 5/4 of 6 gaps), each case placed with an exact replica of the counter rule and
   failing if misplaced; kill power carries both directions (TOL 0.045/0.06, FRAC 0.55/0.45, GAP_FRAC
   0.85/0.6, grid 0.02/1e-5), all killed in the pre-freeze pass.
2. *Mistakes row 5 had `captured-by: none`: add a grounded QUALITY criterion.* QUALITY 143 (below);
   item 1 above is its first application.
3. *Counter generation: pin host version/product + headless argv, check the CDP error code, compare
   structurally, read priors from the committed file.* Applied: exact `Chromium 155.0.8059.84 Arch
   Linux` / `Chrome/155.0.8059.84` / protocol 1.3 and `--headless=new` at argv[1]; errors kept and
   compared as `{code, message}`; no `|`-joined views; `--prior-set <file>` required (usage exit 2
   otherwise) and the counter walks the round-76 trees for receipts outside it (`prior-set-complete`);
   every leg-record field read.
4. *Kill power: attribute each kill, classify crashes, minimum-mutant guard; fold R75Mut1's witnesses.*
   Applied: `killed` needs a named failed case; `killed-positive` needs the mutant counter's own
   finding ids on the honest receipt; anything else is `crashed`; the unmutated battery runs twice;
   guard force-true = declared checks (131) and semantic ≥ 40. R75Mut1's 26 witnesses are drag-counter
   mutants: carried, not claimed (no drag counter generation this round), with R74Mut1 (IME) and
   R73Mut1 (pinch).
5. *Frozen `limit` wording exact.* The counter header and `claims.json` state the 0.1 ms move and the
   19-of-37 events / 2-of-6 gaps escape exactly; R76Critic is asked to attack the exactness.

Census start: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` exit 0
(`.ufo/waves/round-76/census/start.txt`; the file records the warnings and `tabi ok`, not a row count — the
registry held 201 rows at base: `git show a69f9060:corpus/SOURCES.md | grep -cE '^ {0,3}\| S[0-9]{3,} '`).

Claim: C1 coverage — capability `chromium-js-dialog-linux` (CDP `Page.handleJavaScriptDialog` and the
`Page.javascriptDialogOpening` / `javascriptDialogClosed` events on Chromium 155 `--headless=new`,
dialogs opened by real mouse clicks, plus beforeunload under `Page.navigate`), sourced: S202–S206, new
this round. One claim only.

## Gate

### Sources — new rows

All fetched by the L1 on 2026-11-07 between 03:56:02 and 03:56:08 -03:00 from
`https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/<path>?format=TEXT`
(base64 decoded; decoded copies, line counts and sha256 in `.ufo/waves/round-76/sources/FETCH.txt`).
Each row: tier A, kind `code`, status `mined`, recheck `on-release`, used-by the round-76 note and this
lesson. Before the append, `grep -c 'page_handler.cc\|local_dom_window.cc\|web_contents_impl.cc'
corpus/SOURCES.md` was 0; `Page.pdl` (S105) and `chrome_client_impl.cc` (S186) were held at other
tags/scopes.

- **S202** `third_party/blink/public/devtools_protocol/domains/Page.pdl` (1,795 lines, sha256
  `e944a3b1…05be`). Located quote (lines 1487-1488): "calling alert while Page domain is engaged will
  stall the page execution. Execution can be resumed via calling Page.handleJavaScriptDialog."
- **S203** `content/browser/devtools/protocol/page_handler.cc` (2,781 lines, sha256 `768a47e8…d4ac`).
  Located quotes (line 1733): "return Response::InvalidParams("No dialog is showing");" and (line
  1740): "std::move(pending_dialog_).Run(accept, prompt_override);"
- **S204** `content/browser/web_contents/web_contents_impl.cc` (13,314 lines, sha256 `adc65d86…be75`).
  Located quotes (line 9603): "bool suppress_this_message = should_suppress || !has_handlers;" and
  (line 11679): "rfh->frame_tree_node()->BeforeUnloadCanceled();"
- **S205** `third_party/blink/renderer/core/frame/local_dom_window.cc` (2,943 lines, sha256
  `a1b04978…117f`). Located quote (lines 1619-1621): "if (page->GetChromeClient().OpenJavaScriptPrompt(
  GetFrame(), message, default_value, return_value)) { return return_value;"
- **S206** `third_party/blink/renderer/core/page/chrome_client_impl.cc` (1,602 lines, sha256
  `dadba314…eee`; a second scope of the file S186 holds, W04). Located quote (lines 576-577): "//
  Synchronous mojo call. frame->GetLocalFrameHostRemote().RunModalPromptDialog("
- No status, recheck or used-by cell of an existing row changed.

### Admitted

- `corpus/knowledge/chromium-js-dialog-runtime-round-76.md` (cites S202–S206): what a page and a CDP
  client see when CDP answers alert/confirm/prompt/beforeunload on this build, sourced step by step
  (prompt accepted without promptText returns "", dismissed returns null while the closing event echoes
  the text; no dialog open → -32602; a dismissed beforeunload aborts the navigation; the page blocks in
  the dialog), measured identically on 13/13 pre-freeze runs (4 probes + 9 smokes).

### Rejected (with flip conditions)

- **"Accepting a prompt without `promptText` returns its default value"** — reject: S203 1736-1740
  passes an empty `prompt_override`; measured `""` 13/13. Flip: a tag whose handler passes the default
  when `promptText` is absent, or a run that returns it.
- **"`javascriptDialogClosed.userInput` is what the page received"** — reject: dismissed prompt returns
  `null` to the page (S205 1619-1628) while the event carries `"tabi-ignored"` (S204 11690/11695 pass the
  same `user_input` to both); 13/13. Flip: a tag that clears `user_input` on cancel.
- **"Answering with no dialog open is a harmless no-op"** — reject: `{code: -32602, message: "No dialog is
  showing"}` (S203 1733), 13/13. Flip: a tag that returns success.

Assimilation: none (`merge/tabi/` adoption stays closed pending the register-correction L0
`tabi | round-57`). `considerthese/`: no such directory in this lane.

## Mistakes

| class | evidence | captured-by | fix |
|---|---|---|---|
| a look-alike filter carried from the previous driver matched the surface's own vocabulary: the r76 driver's look-alike regex `\balert\b\|\bconfirm\b\|\bprompt\b` matched the leg-name expressions `window.__setLeg("confirm-accept")` …, so the producer verdict was REFUTED on the one honest probe run with the first build (the only build-1 receipt) although every leg shape matched | `.ufo/waves/round-76/lesson-proof/probe-build1-p1-refuted.receipt.json` (`dialogHypothesis REFUTED`, `failures []`, 6 look-alike hits, all `__setLeg`); kept as the 17th PRE receipt | QUALITY 139 (carried rules evaluated on honest pre-freeze receipts) — the first probe run failed on it, so it could fail and did | the filter now matches only replacement, script clicks, dispatch and record writes (`window.(alert\|confirm\|prompt) =`, `.click(`, `dispatchEvent`, `__events.push`); all 13 honest runs CONFIRMED |
| a NEW counter rule tied to a timer was given its nominal value as the floor: `leg-records` required `elapsedMs >= 300` for a 300 ms settle wait, but Date.now() differences read 299 on 3 of 13 honest receipts (p3, p4, smoke4) | pre-freeze pass 1: `lesson-proof/prefreeze-pass1/pf-smoke4.counter.json` (`leg-records: start:elapsedMs`), `lesson-proof/prefreeze-pass1/prefreeze-summary.json` `allOk false`; probes p3/p4 were outside pass 1 | the repetition pass of QUALITY 135/137 (smokes only) caught smoke4; nothing required probes or new rules — QUALITY 144 (new) | floor 290 with the 13-receipt measurement in the counter comment; the pass now runs the counter over p1-p4 too (`prefreeze-summary.json` probes 4/4) |
| a battery placement guard over-constrained the unbracketed side: the bracket cases required the other fraction to be exactly 0, but an alternating ±0.049/±0.051 shift leaves 1-2 of 6 gaps unchanged and a broken gap can land within 0.05 ms of another honest gap, so the cases errored ("bracket misplaced") on 7 of 9 smokes | `lesson-proof/prefreeze-pass1/pf-smoke3.battery.json` (3 bracket cases `bracket misplaced`) | the battery's own `placed()` guard, built to fail when a case is not where it claims — it failed | the other side must stay strictly below its threshold; `breakGaps` tries five shift sizes and takes the first that yields exactly the wanted count; 9/9 smokes 251/251 |
| a control's expected finding ids written from belief (the r75 row-1 class again): `forge-error-code` changed the no-dialog error code in the leg record but left the producer's `legShape` stale, so `legshape-consistency` co-fired | `lesson-proof/controls-first-pass-error-code-expectation.json` (`forge-error-code` ids include `legshape-consistency`, allOk false) | QUALITY 131 (expected exit AND ids, mechanically) — it caught it before the freeze | the forgery edits `legShape` too (a stronger forger); exact ids `leg-no-dialog-error`, `no-dialog-law` |
| semantic survivors in the pre-freeze kill-power trial: 5 of 56 (`M-argv-headless-dropped`, `M-legrec-handleparams-dropped`, `M-event-log-open`, `M-block-click-order-dropped`, `M-beforeunload-next-count-loose`) — four conjuncts whose failure another check also caught, so no case attributed it to the law, and one truly redundant conjunct | `lesson-proof/killpower-trial-smoke1-survivors.json` (`holds false`) | QUALITY 142 — it caught all five before the freeze | four cases that expect the law's own id with the co-firing check allowed (`host-argv-reordered`, `leg-records-handleparams-and-send`, `blocking-click-before-return-at`, `beforeunload-next-twice`); the redundant `eventLog.length === 18` conjunct removed and its mutant replaced (`M-event-log-keys-open`); 9/9 smokes hold 56/56 |
| (from round 75, row 5) a routed defect filed by the surface it was found on instead of re-derived against the new instrument bytes: r74 F4/F5 tolerance weakenings were filed as IME-only while the r75 drag counter carried both tolerances | `.ufo/waves/round-75/w1/R75Revenger/mutant-tol-0.045.battery.json`, `mutant-grid-0.02.battery.json` (exit 0, 254/254) | none in r75 — QUALITY 143 (new) | r76 carries both directions of every tolerance/threshold as mutants and both sides as cases; each mutant killed by exactly its bracket case on 9/9 smokes (`controls/c1/pf/pf-smoke*.killpower.json`) — the red state above shows the check can fail |
| a completeness check whose answer depends on files other agents write at the same time: the counter's `prior-set-complete` walk would have refused one seat's leg-(b) run as soon as another seat wrote a receipt into the wave tree | found while building the wave spec, before dispatch (design; no run failed) | none | seat receipts are kept as `*.receipt.txt` (JSON content), which the walk does not read; the rule and its consequence are stated in `claims.json` `priorSet` before data. Not shown able to fail in-round: the fix is a convention, not a check — routed. |
| a limit sentence computed against a fixed denominator the counter does not use (the r75 routed defect 5 class, again): the frozen limit says 19 of 37 events and 2 of 6 gaps, but the gap fraction divides by the receipt's OWN gap count, so a forgery that adds a seventh gap escapes with one changed gap | `.ufo/waves/round-76/w1/R76Critic/F2c-one-gap.counter.json` (exit 0 clean 131), report §A2 | none — the limit witness control (`limit-nonuniform-retime`) moves every event and never probes the minimum; QUALITY 136/138 bound replay refusal, not the stated escape minimum | marked in SCORECARD `## Round 76` Correction 1 and the note's Limits; routed to r77: derive the sentence from the counter's own denominators and add a battery case that adds one gap and changes one. Not fixed in-round (the counter is frozen). |
| a wave convention stated in the context but not enforced: two seats (R76Critic first, then R76Review1) saved crafted receipts as `.json` inside the walked tree, and the frozen counting command turned red (`prior-set-complete`) on the scored receipt until the files were renamed | R76Scribe report row "re-run at 05:11 … one finding prior-set-complete" (`w1/R76Scribe/report.md`); orchestrator notice; `w1/R76Review1/RENAMED-BY-L1.txt` (34 files renamed at integration) | row 7 above (`captured-by: none`) — now shown to fail in practice twice | renamed at integration (content byte-identical, sha256 recorded); after renaming the frozen counting command is clean 131 at the tip and the selftest is 13/13. Routed: the next generation's walk should be fed an explicit allow-list of non-prior paths, or seats should write receipts only under scratch. |
| a novelty sentence checked with a grep narrower than the sentence: "no capability row or knowledge note covered a dialog" was tested only for the two CDP command names; the r32/r35 WebDriver BiDi notes had measured one `alert` | R76Scribe finding 1 (`webdriver-bidi-runtime-round-32.md:83,108`) | none — no criterion asks a novelty sentence's grep to cover the sentence's own words | sentence corrected in the note and marked in SCORECARD Correction 2; the frozen before-commands (what the predicate counts) are unaffected. |

## Sources — opened after the freeze (frontier, not the claim's grounding)

- **S207** `chrome/browser/ui/browser_web_contents_delegate/browser_web_contents_delegate.cc` (1,508 lines,
  sha256 `9fd4aa8d…1355`), located by R76Scout (`w1/R76Scout/report.md` §4) and re-opened by the L1 on
  2026-11-07 05:39:15 -03:00 (`sources/FETCH.txt`; `cmp` with the seat's copy: identical). Located quote
  (lines 1118): "return javascript_dialogs::TabModalDialogManager::FromWebContents(source);" — the dialog
  manager whose presence makes `hasBrowserHandler` true and keeps a Page-disabled dialog blocked
  (R76Exec3, 3/3 runs).
- In-round corrections to rows opened this round (old → new, R76Scout §3 / R76Scribe 3-6 / R76Critic A3):
  S202 scope `392-397` → `392-398` and anchor `decoded lines 392-397` → `392-398 (… beforeunload at 398)`;
  S204 scope `11656-11712` → `11656-11701` and anchor `9601-9603 (suppressed …)` → `… answered as
  cancelled at 9631-9634`. Status/recheck/used-by cells unchanged.

## Attack findings (wave w1, 12 seats, 0 dead) — not amended; instruments stay as frozen

Legs re-measured by seats: (b) R76Exec1 cold run, counter exit 0 clean 131 with the 17 priors + the
scored receipt; (c) battery 251/251 on the scored receipt and on R76Exec1's, kill power holds 131/131 +
56/56, 0 crashed. R76Exec2: 3 more cold runs clean 131 and 251/251 each; 12 runs × 131 checks and × 251
cases, 0 red; honest replay margin unchanged (max abs 0, max gap 2 of 6 against thresholds 19 / 5).
R76Review3: ordering, pins, nonce, prior set, before→after PASS; QUALITY 144 FAIL (probe batteries).
R76Scout: S202–S206 re-fetched byte-identical (`cmp` 5/5). R76Revenger: 16 of 18 root failures / routed
items closed, 1 not repeatable, 1 open (r62 R3, no adjacency instrument this round); the r74 F4/F5 and
r62 M5 mutants are killed by this generation; SHONEN/SCORECARD 0 contradicted statements.
R76Connector: overlap none on CDP dialog ground; adjacent (kotoba CLI string inventory, kake
accessibility handoff); 0 contested.

Findings routed (none falsifies a leg as frozen):

1. **R76Critic A2 (limit).** Minimum escape 19 events and 1 gap (own-gap denominator); Mistakes row 8.
   A3: the -32602 code was asserted inside a sourced bullet (now labelled measured); the S202 range.
2. **R76Review1 F1–F5 (counter false greens).** The walk misses symlinks, `.JSON`, escaped-schema JSON,
   unparsable/BOM/UTF-16 files, unreadable files and FIFOs; event-log order and `afterSendId` bounds,
   dialog frame ids, urls beyond their path, and navigate frame/loader ids are unbound.
3. **R76Review2.** `GAP_MIN` has no bracket and no mutant (100/200/290 survive); thresholds are
   bracketed only to the receipt's granularity (`TOL 0.0495`, `FRAC 0.51`, `GAP_FRAC 0.67`, grid
   `1.5e-4` survive — equivalent at 37 events / 6 gaps); the two-run flake guard misses a
   work-dir-keyed flake (injected adversary, not an observed flake).
4. **R76Review3 F1/F2.** Probe batteries unrun (p2 misplaces two brackets via a `keepExact` self-
   collision; p1's `prior-set-complete-omitted` is non-diagnostic because the dropped prior shares
   p1's nonce); the enumeration file is committed in the freeze commit.
5. **R76Mut1.** 60 further semantic mutants: 16 killed, 21 killed-positive, 23 survived (7 with an
   acceptance witness, 11 equivalent, 5 stricter-only).
6. **R76Scribe.** Novelty sentence, the 20 ms attribution (driver poll; event-driven block 1.1–3.4 ms),
   S202/S204 ranges, `9631-9634`, `9605-9628`, the -32602 provenance, "touch" wording, the release-
   ordering claim — all corrected in the note; lesson pointers corrected.
7. **R76Exec3 (frontier, CONFIRMED).** With the Page domain never enabled, a click-opened `confirm()`
   is neither suppressed nor auto-dismissed: the page stays blocked (~74 s until killed), no late
   opening on `Page.enable`, and `handleJavaScriptDialog` fails -32602. Added to the note as measured
   after the freeze, with S207.

## Routed to r77

A dialog counter generation that (i) states its limit from its own denominators and holds a battery
case that adds one gap and changes one; (ii) walks receipts robustly (symlinks, case-insensitive
`.json`, schema by parse not bytes, unparsable or unreadable schema-bearing files refused) or takes an
explicit allow-list; (iii) binds event-log order, `afterSendId` ≤ the last send, the dialog frame id to
the main frame, full urls and navigate frame/loader ids; (iv) brackets `GAP_MIN` and places every
bracket collision-free on every honest receipt including probes (QUALITY 144 as written); (v) folds
R76Mut1's 7 acceptance witnesses into the battery; (vi) a flake guard that re-runs each killing case on
the unmutated counter. Also carried: R75Mut1 (drag), R74Mut1 (IME), R73Mut1 (pinch).

## Census

Start: exit 0, 29 W04 (`.ufo/waves/round-76/census/start.txt`; 201 rows at base). End: exit 0, 207
rows (S202–S206 before the freeze, S207 after), 30 W04 — S206 shares its URL with S186 across scopes
(`.ufo/waves/round-76/census/end.txt`).
