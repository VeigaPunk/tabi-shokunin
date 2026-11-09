# tabi — round 93

L1 `TabiR93`. Base `192535d7` (lane tip at round start; round 92 closed `ok admitted=true`). ONE
claim — C1 coverage, the new capability `chromium-oopif-backendnode-scope-linux` (r92 declared
limit 5: what a chooser's `backendNodeId` names on the OTHER session) — worded as the conjunction
of its counter's checks, frozen with its controls in commit `7a7f39f3` (20:48:00 -03:00;
`claims.json.frozenAt` 20:47:56) before the scored run (`bf0bd622`) and before the wave `.ready`
was written (20:50:35).

## Gate

### Sources — opened this round

The L1 fetched both on 2026-11-08 at 20:42 -03:00 (gitiles `?format=TEXT`, base64-decoded) and
staged the bytes in the freeze commit under `.ufo/waves/round-93/sources/` (`sha256.txt`).

- **S231** — Blink `third_party/blink/renderer/core/inspector/inspector_dom_agent.cc` at tag
  155.0.8059.84 (170,680 B base64 → 128,010 B, sha256 `e7c983b4b00f`). Lines 645-648, in
  `InspectorDOMAgent::AssertNode`: "node = DOMNodeIds::NodeForId(backend_node_id.value()); return
  !node ? protocol::Response::ServerError( "No node found for given backend id")" (14 words by
  `wc -w`); lines 1806-1809, in `setFileInputFiles`: "html_input_element->FormControlType() !=
  FormControlType::kInputFile) { return protocol::Response::ServerError("Node is not a file input
  element");" (12 words).
- **S232** — Blink `third_party/blink/renderer/core/dom/dom_node_ids.cc` at tag 155.0.8059.84
  (2,776 B base64 → 2,081 B, sha256 `33f40333b67f`). Line 18 "DOMNodeId g_last_id = 0;" and line 30
  "DEFINE_STATIC_LOCAL(Persistent<RefType>, map_instance," — one process-static counter and one
  process-static id→node map (8 words for the two lines together).

What they teach together: a `backendNodeId` is resolved by `NodeForId` in the map of the renderer
process that receives the command. It is not scoped to a target or a session. The id an OOPIF's
renderer mints means nothing in the parent's renderer — or it means whatever node the parent's own
counter gave the same number. The measured case is the second one: R93Critic3 showed the
page-session root `#document` has `backendNodeId` 2 = B in 3/3 X legs.

## Mistakes

1. **Class: a LOG entry claims record sections that were never committed (self-assessment ≠ repo
   state).** Evidence: the round-90 LOG entry names README `## Round 90 coverage` and the round-92
   entry names README `## Round 92 coverage` (`LOG.md:4105`, `LOG.md:4229`). Neither heading exists in
   `corpus/README.md` at base `192535d7`: README was last changed in round 82 (`4c762eff`). The
   round-91 entry names "README round-91 coverage" in prose, which is also absent. Captured-by: none.
   No gate read the LOG's record claims, and the r92 non-author spot-check did not test that README
   heading either. Fix: `scripts/check-log-section-claims-round93.mjs` (L1). For round N it extracts
   every `<FILE> \`## <heading>\`` claim in the LOG entry and requires that heading in the named file
   at the same revision.
   **Shown able to fail:** `--rev 192535d7 --rounds 83..92` → exit 1, two `section-absent` (r90 and r92
   README) (`.ufo/waves/round-93/mined/log-claims-base.json`); selftest 3/3 (present clean, absent
   README section, missing round → setup) (`log-claims-selftest.json`). Repair: README gains appended
   late sections `## Round 90 coverage`, `## Round 91 coverage`, `## Round 92 coverage` and an r83–89
   index, all marked as landed late by round 93. The gate at the round tip is in §Gate runs.
   Limit: prose mentions are not extracted. The gate lists them as `unparsed` lines and does not judge
   them.
2. **Class: future-dated freeze stamp** (r92 spot-check §8 item 1). Evidence: r92 `claims.json.frozenAt`
   is `2026-11-08T20:05:00-03:00`, but the commit that added it (`2bac1048`) was committed at 20:02:04.
   Captured-by: none (PROTOCOL §Evidence standard forbids future-dated evidence, but no gate checked
   it). Fix: `scripts/check-freeze-stamp-round93.mjs` (wave seat R93Exec3), which compares `frozenAt`
   with the committer time of the commit that added `claims.json`. **Shown able to fail:** r92 → exit 1
   `future-frozenAt`. r90 and r91 → exit 1 `frozenAt-unparseable` (their `frozenAt` is free text).
   r93 → exit 0 (20:47:56 ≤ 20:48:00). Selftest 3/3. Outputs: `.ufo/waves/round-93/w1/R93Exec3-*.json`.
   Residual (R93Reviewer F4): jj records an author time taken when the working-copy change began
   (20:39:05 for `7a7f39f3`). The gate binds the committer time, which is when the bytes landed.

## Corrections carried by round 93 (r92 spot-check §8; append-only)

- Item 4: the r92 ledger note for R92Reviewer says "F1-F7", but the artifact lists F1–F8
  (`grep -o '^F[0-9]*' .ufo/waves/round-92/w1/R92Reviewer.md`). The ledger is frozen evidence and
  is not edited.
- Item 5: the r92 lesson gives S227's quote as 21 words. `wc -w` gives 23. It gives S229's quote as
  14 words. `wc -w` gives 13. Both quotes stay ≤25 words. From this round on, word counts come from
  `wc -w` (the counts above).
- Item 3: SCORECARD gains an appended note naming W6 (the r92 SCORECARD section cites W1-W5 only).
- Item 2: `SKILL.md` `## Round 93 gate registry` has complete rows and supersedes the two r92 rows.
- Item 6 (r91 items 3/5): still carried. The r91 instruments are frozen history.
- Item 7: the r93 battery carries the routed classes as cases: `x-two-iframes`, `reps-identity`,
  `answer-identity`, `parent-url-other-leg`, `leg-order-swapped`, `non-object-leg`,
  `browser-version-leg`, `browser-reused`. The r93 driver kills its chromium process group, and the
  counter maps a driver exit-2 refusal to `setup` exit 2 (`controls/counter-setup-busyport.json`).
  The r92 instruments are not edited.

## Inherited state (attempt 2)

Attempt 1 (`TabiR93`) landed the freeze (`7a7f39f3`), the scored run (`bf0bd622`) and the records
commit (`9fac89c3`), wrote `w1.ready`, and ended when the orchestrator session was SIGTERM-killed
(`.ufo/watchdog.log` `lane-dead-no-report tabi round=93` 21:09:28). Attempt 2 (`TabiR93a2`) inherited,
uncommitted: this lesson file, `.ufo/waves/round-93/w1/` (12 seats' artifacts), `w1-results.json`
(orchestrator-finalized, every `output: null`) and `w1.ready.dispatched`. All were re-read and adopted;
nothing was discarded. The wave was not re-dispatched.

## Wave w1 (12 seats; artifacts read from the wave dir)

- R93Exec1: two cold `--live` runs clean, 101 checks each; battery 65/65 on run1's receipt.
- R93Exec2: three `--live` runs clean (101) and one `--reps 10` run clean (311); 38 legs identical in
  every predicate field.
- R93Exec3: `scripts/check-freeze-stamp-round93.mjs` (mined mistake 2), selftest 3/3.
- R93Critic1: 26-clause wording-vs-counter table; 10 receipt-mode forgeries, all rc 0, all inside
  declared limits 3-6 (`--live` with the pinned driver is the counting command).
- R93Critic2: four procedure variants (DOM.enable first, `pushNodesByBackendIdsToFrontend` nodeId,
  reversed answer order, extra parent elements): `#document` and the exact error hold 15/15 X legs;
  only `filesAfterCross` under reversed order is unreadable (limit 4).
- R93Critic3 (outside the claim, limit 3): the page-session node for B is the parent's own `#document`
  root (backendNodeId 2 = B, `documentURL` = parent URL) 3/3 X legs — the S232 explanation measured.
- R93Mut: 39/53 distinct counter mutants killed; 14 survivors are battery gaps (conditions the
  pinned driver cannot produce, or live-only paths exercised by the setup control).
- R93Reviewer: freeze precedes scoring (committer time); F1-F6 notes, none above "note". F1: the plan's
  no-work control row lists the 10 unique finding ids of 35 findings — read as a set, not a count.
- R93Sentinel: independent clean `--live` run; defects S4 (a signalled driver is scored `findings`
  exit 1, not `setup`) and S5 (killing the counter orphans driver + chromium) — routed to r94.
- R93Connector: 0 sibling hits on the claim's terms.
- R93Scribe: knowledge note draft (integrated by attempt 1 in `9fac89c3`); upstream sha256 of both
  sources equal to the staged copies.
- R93Scout: re-fetched source bytes only (`w1/R93Scout-sources/sha256.txt`; S231/S232 at 155.0.8059.84
  byte-identical to the staged copies); its narrative report and final output were lost with the
  orchestrator kill. Recorded as missing, not reconstructed.

Every seat's C1 verdict is `neutral` (`.ufo/waves/round-93/claim-falsification.tsv`).

## Gate runs at the round tip (`c46317ab`)

- C1 counting command re-run at the tip: exit 0, `clean`, 101 checks, 0 findings, revision `c46317ab`,
  nonce `tabi-r93-live-5a0efa9cd6e5` (`.ufo/waves/round-93/scored/c1-live-final.json`); instrument
  sha256 3/3 OK against `controls/instrument-sha256.txt` (`sha256sum -c` from the lane root).
- Freeze stamp: `node scripts/check-freeze-stamp-round93.mjs --lane <ABS lane> --round 93 --json` → exit 0,
  `clean`, frozenAt 20:47:56 ≤ committed 20:48:00 (`scored/freeze-stamp-r93.json`).
- LOG section claims (mined mistake 1 at the tip): `node scripts/check-log-section-claims-round93.mjs
  --lane <ABS lane> --rev master --rounds 83,…,93 --json` → exit 0, `clean`, 0 findings
  (`scored/log-claims-tip.json`); at base `192535d7` the same gate exits 1 (`mined/log-claims-base.json`).
- Append-only, `192535d7..master`: LOG.md, SCORECARD.md, corpus/README.md, SKILL.md `ok`; corpus/SOURCES.md
  `rewritten` at line 246 → exit 1 (`scored/append-only-r93.json`). Cause: S231/S232 are inserted as rows
  inside the Registry table, above the file's trailing `## Paths` section, so base bytes are no longer a
  byte prefix of tip bytes. `git diff --numstat 192535d7 master -- corpus/SOURCES.md` → `2 0` (two lines
  added, none deleted or changed). The byte-prefix gate does not model a mid-file table insert; the
  registry is append-only by row (CORPUS.md rule 2), which the numstat shows. Disclosed, not re-scoped.
- Census end: `scripts/sources-census.sh validate --root <fleet> tabi` → exit 0, `tabi ok`, 232 rows
  (`.ufo/waves/round-93/census-end.txt`; W04 cross-scope duplicate-URL warnings only).
- No chromium left on this round's ports (`pgrep -f remote-debugging-port=1956` empty).
- Pre-file ledger: `prefile-falsification.py --lane tabi --round 93` → `pass claims=1 rows=15 attack_seats=7 findings=0`, exit 0 (`scored/prefile.txt`).
