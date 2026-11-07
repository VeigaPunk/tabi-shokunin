FINDINGS

# R77Critic — attack on `.ufo/waves/round-77/claims.json` C1 (round 77, w1)

Scope: the frozen claim at `dcdf582a` (D), base `1320d428`, instruments
`scripts/chrome-cdp-filechooser-round77.mjs` (9954db07…58a6),
`scripts/check-filechooser-r77.mjs` (ac17ff8d…aeb, 183 checks),
`scripts/negatives-filechooser-r77.mjs` (3925fe2a…03ff) and
`.ufo/waves/round-77/controls/c1/kill-power-r77.mjs` (795b2eda…37aa);
prior set `.ufo/waves/round-77/controls/c1/prior-set.txt` (374d5b40…1697, 19 lines).
All receipts/JSON I produced are under
`.ufo/waves/round-77-seats/R77Critic/`. No lane byte was changed. The
prior-tamper experiments used scratch mirror lanes under
`/fast/scratch/hyaku/tabi-r77/R77Critic/` (removed after the runs), as the
battery itself does (`negatives-filechooser-r77.mjs:24`); the tampered prior
and the 18-line set are copied into the seat dir.

Axes attacked: **coverage** (claim), **calibration** (limit boundary),
**operability** (prior-set provenance), **depth** (sourced laws),
**freshness** (novelty).

## 1. Do-nothing reach: legs (a)-(c) without running the driver

The counter is receipt-only (`check-filechooser-r77.mjs:44-54`: "The counter
reads a receipt; it is not an execution oracle"). The page-side event record,
the CDP send log, the CDP event log, the server log, the host string, the
devtools URL, the upload hashes and the driver sha are all fields of the JSON
the producer writes; every check is an internal-consistency check. So a
producer that never starts Chromium can meet (a)-(c) if it writes a receipt
that is internally consistent. I built and scored five classes; the frozen
leg-(b) command was used for every run that is not the L1 run under test:

Baseline (the L1 run under test, frozen leg (a) arguments):
`node scripts/check-filechooser-r77.mjs --lane <lane> --receipt corpus/evidence/round77/chromium-file-chooser/receipt.json --expect-driver-sha256 9954db07…58a6 --expect-nonce tabi-r77-l1-dcdf582add58 --prior-set .ufo/waves/round-77/controls/c1/prior-set.txt --json`
→ **exit 0**, clean, 183 checks; `priorSetFile.lines` 19,
`priorSetFile.sha256` 374d5b40…1697; limit block 16 honest priors at
N=79/G=11 (`absNeed` 40, `gapNeed` 9) and the 3 degenerate priors at
37/11, 35/11 and 79/11 (`absNeed` 19, 18 and 40). Seat artefact:
`.ufo/waves/round-77-seats/R77Critic/baseline.json`.
(The committed scored output `c1-counter-a.json` shows the same block and the
per-prior sha list.)

Every forgery below starts from a PRE receipt (smoke1, a prior with
N=79, G=11) and relabels identity only: nonce → `tabi-r77-exec1-dcdf582add58`,
launch token → a fresh 12-hex token, browser id → a fresh uuid, profile/upload
paths rewritten, the `Page.navigate`/`frameNavigated`/server-log URLs
rewritten, and `fixture.sha256` recomputed from the pinned driver's
`CHOOSER-FIXTURE-BEGIN/END` template with the new nonce. The driver bytes,
`driverSha256`, the send log, event log, leg records, state and teardown are
copied. This relabel alone (0 events retimed) is **refused**:
`relabel.counter.json` exit 1, sole finding `replay-event-timeline`,
smoke1 `absMatched=79/40`, `gapMatched=11/9`.

| Forgery | Counter exit | Result | smoke1 abs/gap | Seat file |
|---|---|---|---|---|
| relabel, 0 retimes | 1 | `replay-event-timeline` | 79/40, 11/9 | `relabel.counter.json` |
| 39 events retimed, 3 gaps broken | 1 | `replay-event-timeline` | 40/40, 8/9 | `retime39.counter.json` |
| **40 events retimed, 3 gaps broken** | **0** | **clean, 183 checks** | **39/40, 8/9** | `retime40.counter.json` |
| 40 events retimed, 2 gaps broken | 1 | `replay-event-timeline` | 39/40, 9/9 | `retime40-gap2.counter.json` |
| synthetic page timeline, 79 events | 0 | clean, 183 checks | 0/40, 0/9 | `synthetic.counter.json` |
| +2 own gaps (ownGaps 13) | 0 | clean, 183 checks | 37/40, 7/9 | `addgaps.counter.json` |

The 40-event/3-gap forgery is the cheapest **seat-only** forgery: it selects
the 40 non-read events (39 by sequence plus seq 67), adds 7.3 ms to `ts`
(rounded to the 0.1 ms grid), adds 0.1 ms to the `at` of the isolated
script-click event (seq 67, which sits between two counted gaps) and
subtracts 0.1 ms from the first pick-multiple event (seq 9, breaking the
pick-single→pick-multiple gap). That breaks exactly three of the prior's
eleven ≥50 ms gaps and forty of its event pairs; the counter's `limit` block
prints `absMatched 39 / absNeed 40` and `gapMatched 8 / gapNeed 9`, exactly
the declared condition. It is **inside the declared limit** (claim
`limit`, claims.json:36; counter header 44-54).

The synthetic run invents every page time (marks at 1000, 1010, then +400 per
leg; each leg's events 0.1 ms apart inside its window) and leaves the static
logs copied from smoke1. It is clean with `absMatched 0 / gapMatched 0` and
is **inside the declared "receipt fabricated from nothing" clause**.
The 2-gap and 39-event rows are **outside** (the counter refuses them).

Look-alike producers presented honestly are refused: the pinned driver's
`--degenerate page-stub`, `eval-trigger` and `swap-files` receipts, scored
with `--expect-nonce tabi-r77-deg-<name>`, each exit 1 with
`scored-run-not-degenerate`, `leg-records`, `replay-*` and shape findings
(`degenerate-page-stub.counter.json`, `degenerate-eval-trigger.counter.json`,
`degenerate-swap-files.counter.json`). Their **rewritten** form is the
synthetic run above (clean); the counter has no witness that the page events
were delivered by the browser rather than written by the producer.

Modified driver with the pin field rewritten: `driver-pin` compares
`r.driverSha256 === pin` (check-filechooser-r77.mjs:205), and the only other
driver tie is the fixture template hash recomputed from the driver file
beside the counter (lines 209-217). A modified driver that serves the same
template and writes the pinned sha in its receipt is indistinguishable to
the counter; this is **inside the declared receipt-reader limit**.

### The undeclared escape: the priors are not pinned at counting time

The limit's 40/9 bar is a property of *the prior files the counter reads*.
The counter reads the working-tree priors by path; it does not compare their
bytes to the committed blobs, and `freeze.txt` names only the three
degenerate receipts among the priors (the 16 honest priors are not in
`freeze.txt`). The counter prints each prior's `sha256` in its `priorSet`
output but never compares it to an expected value
(check-filechooser-r77.mjs:155-165, 280-281, 543).

In a scratch mirror lane I set `smoke1.receipt.json`'s `events` to `[]`
(schema and nonce kept; the file is still a prior path, so the
`prior-set-complete` walk excludes it) and scored the **0-retime relabel**
above:

`node scripts/check-filechooser-r77.mjs --lane /fast/scratch/hyaku/tabi-r77/R77Critic/lane --receipt .ufo/waves/round-77-seats/R77Critic/relabel.receipt.json --expect-driver-sha256 9954db07…58a6 --expect-nonce tabi-r77-exec1-dcdf582add58 --prior-set <scratch lane>/.ufo/waves/round-77/controls/c1/prior-set.txt --prior corpus/evidence/round77/chromium-file-chooser/receipt.json --json`
→ **exit 0, clean, 183 checks**; `limit` block `smoke1: priorEvents 0,
priorGaps 0, abs 0/0, gap 0/0` (seat `lane.counter.json`; the tampered prior
is `tampered-prior-smoke1.json`). The same 0-retime relabel is refused against
the intact prior (`relabel.counter.json`, exit 1), so the edit is what
removed the bar.

Dropping smoke1 from the prior set *and deleting its file* (18-line set, no
orphan for the walk to find) is also clean with the same 0-retime relabel:
`lane2.counter.json` exit 0, `priorSetFile.lines 18`, no smoke1 prior
(`lane2-prior-set.txt`). The claim says "the committed 19-line prior set"
(claims.json:34), but the counter only requires a nonempty set
(`psLines.length === 0` at line 159); the set's sha is printed but not
checked.

These two escapes are **outside the declared limit**: the limit enumerates
(a) a forgery made from a prior p whose *N_p events* are the prior's, (b) a
receipt fabricated from nothing, (c) a receipt outside the prior set and the
two walked trees (claims.json:36). It does not enumerate a prior whose
`events` were emptied or a prior deleted from the set; the qualifier "for
every honest r77 prior" does the work, but the counting command cannot tell
an honest prior from an edited one. A compliant wave seat cannot write the
lane (seat-output rule), so the seat-only reach is the declared 40/3 class;
the L1 (the only lane writer) can take the 0-retime class. The claim's
"same-user forger" (limit) is exactly that user.

Legs (a)-(c) carry no execution assurance: (c) is the battery/kill power,
both receipt readers (their headers; `kill-power-r77.mjs:6-22`), and (a)/(b)
are the same counter on two receipts. The driver exit/out files in
`.ufo/waves/round-77/scored/` (`c1-driver-a.exit` 0, `c1-driver-a.out`) are
also producer-written and not part of the predicate.

## 2. Is the limit sentence exact?

The sentence (claims.json:36) and the printed block agree for the honest
priors: each has N=79, G=11 → `absNeed = ceil(0.5*79) = 40`,
`gapNeed = ceil(0.75*11) = 9` (baseline limit block; counter 246-251).
The degenerate priors are also in the block with N=37/35/79 → `absNeed`
19/18/40; the sentence's "for every honest r77 prior" is load-bearing — a
forger who replays the 37/35-event degenerate receipts faces a 19/18 bar,
but must also add 42/44 events to satisfy the 79-event shape (the swap-files
degenerate already has 79), so the cheapest clean route remains an honest
prior at 40.

Boundary by construction and by the counter itself (all against smoke1):

- 39 events retimed, 3 gaps broken → `absMatched 40/40` → **refused**
  (`retime39.counter.json`, exit 1).
- 40 events retimed, 2 gaps broken → `gapMatched 9/9` → **refused**
  (`retime40-gap2.counter.json`, exit 1).
- 40 events retimed, 3 gaps broken → `abs 39/40`, `gap 8/9` → **clean**
  (`retime40.counter.json`, exit 0).

So the minimum is **40 events and 3 gaps**, and the sentence's numbers are
the exact boundary for this prior. **Can fewer escape?** Not against a fixed
honest prior: 39 events is refused; the duplicate `(ts,at)` pairs in every
prior (the scored receipt has 22 duplicate pairs; the priors 15-21) do not
create a shadowing discount, because `pairMatch` is one-to-one and a changed
event that lands on a prior twin is itself a match (net zero); the 39-event
test is the empirical check. Fewer *do* escape by editing the prior itself
(0 retimed events, section 1) — outside the declared class.

**Do added events/gaps change the bar?** No. The needs are computed from the
prior (`timelineSim`, 246-251); the receipt's own counts only enter the
`ownGaps >= 11` floor (check line 255). The `addgaps` run has `ownGaps 13` and still
prints `absNeed 40 / gapNeed 9`; it is clean because it also changed more
events (`abs 37`, `gap 7`), not because of its own denominator. This matches
the R76Critic A2 control (`replay-timeline-gaps-added-own-denominator` in the
battery) and the kill-power mutant `M-timeline-gap-denominator-own`.

Exactness caveat: the sentence is a sufficient condition ("not refused once
fewer than…"), not an iff. The counter's refusal is `M >= 40` where M is the
one-to-one matched count; the sentence's S counts prior events with some
forgery event within tolerance. `M <= S`, so S<40 implies no refusal; the
converse can differ only through duplicate-pair collisions, and the 39-event
run shows no verdict difference at this boundary. The per-prior numbers in
the block are exact; the sentence's "honest" qualifier is the unstated
premise that the prior files are the committed ones.

## 3. Are the enforced laws the ones S208-S212 state?

The staged sources are in `.ufo/waves/round-77/sources/` (DOM.pdl,
inspector_dom_agent.cc, file_input_type.cc, inspector_page_agent.cc,
Page.pdl). Mapping:

- `activation-law` (counter:460) ← S210 file_input_type.cc:181-188
  (`HasTransientUserActivation`; no chooser without it); measured by
  `script-click` (no event) and `forward-click`.
- `mode-law` (467) ← S211 inspector_page_agent.cc:1899-1913
  (`input.Multiple()` at S210:203-204; selectMultiple only when multiple);
  measured by `pick-multiple` vs `dir-mode`.
- `selection-law` (504) ← S210:533-556 (single input keeps `files[0]`,
  552-554; missing path accepted, 536-537) and S210:465-481 (input+change
  when the list changed); measured by `pick-first-only`, `pick-missing`.
- `cancel-law` (508) ← S210:465-481 (otherwise `DispatchCancelEvent`),
  S210:455-456 (`SetFiles(nullptr)` returns false, so the suppressed+cancel
  path at 200-210 cancels without input/change), S211:1953; measured by
  `pick-same`, `intercept-cancel`, `intercept-off`.
- `empty-list-law` (512) ← S210:536-537; measured by `pick-empty`.
- `read-law` (517) ← S210:533-556 + File API; measured by the reads.
- `not-file-input-law` (520) ← S209 inspector_dom_agent.cc:1806-1810
  (ServerError "Node is not a file input element"); measured by the
  `not-file-input` leg.
- `intercept-law` (524) ← S212 Page.pdl:1279-1288 (suppression; the event is
  emitted when interception is enabled) and S211:1949-1956 (suppression;
  cancel only if enabled); measured by `intercept-cancel` (event + cancel)
  and `intercept-off` (no event).
- `frame-binding` (393) ← S212:1294-1304 (the event's `frameId`, mode,
  backendNodeId); measured.
- `node-binding-law` (478): the event's backendNodeId is sourced
  (S211:1910-1911), but the concrete ids 5/7/14/18 are a fixture property —
  the note says so; they are not a protocol constant.
- `coordinate-law` (528) and `trust-law` (445) are driver/page consistency
  (commanded coordinates; `isTrusted`), not S208-S212 laws; they are measured.

Mismatches:

1. **Sourced but not measured**: S211:1949-1956 says "Cancel file chooser
   only if interception is enabled" (comment at 1953). No leg sends
   `{enabled:false, cancel:true}`; the plan has `intercept-off` with
   `{enabled:false}` only and `intercept-cancel` with
   `{enabled:true,cancel:true}`. The note states the gating as sourced
   (note:30) and the counter does not enforce it. This is a sourced law the
   round did not measure.
2. **Measured but stated as sourced**: the `intercept-off` headless
   cancel-at-once (one `cancel`, no event) is measured (note:74-75, 95), not
   stated by S208-S212; no staged source says the headless native chooser
   cancels. The claim's `surface` (claims.json:25) states it in the same
   sentence as the sourced interception behavior, and the note's `source:`
   line attributes the Page.pdl interception declarations to S208-S212.
   The `-32000` code is likewise not in S209 (which gives the message only);
   it is the CDP `ServerError` code and the measured wire value. The concrete
   backendNodeIds are measured (the note says they are not protocol
   constants). The `trust-law`/`coordinate-law` are measured, not sourced.
3. **`accept` over-generalisation**: S210:533-556 (`SetFilesFromPaths`) has
   no `accept` check on the CDP path, so the measured `accept-ignored` leg is
   sound for `DOM.setFileInputFiles`. But S210:222-224 sets
   `params.accept_types = CollectAcceptTypes(input)` for the native chooser
   (and 525-532 for the directory path), so `accept` is a picker filter
   there. The note correctly scopes it ("on this path", note:70; "over CDP",
   note:93), but the claim's `surface` and the counter header (line 42) state
   "`accept` is not enforced" unqualified, inside the setFileInputFiles
   sentence. Read outside the CDP path it is over-generalised beyond
   `setFileInputFiles`.

No law is enforced that the sources contradict. The `intercept-cancel` path
is sourced correctly: S210:200-210 calls `SetFilesAndDispatchEvents(nullptr)`
and S210:455-456 returns false for null, so the observed cancel with the
selection kept is the source behavior, not an inference.

## 4. Is the novelty sentence true?

At base `1320d428`:

- `git grep -liE 'file ?chooser|setFileInputFiles|fileChooserOpened|setInterceptFileChooserDialog|webkitdirectory|showPicker' 1320d428 -- corpus/knowledge | wc -l` → 0.
- `git grep -lE 'setFileInputFiles|fileChooserOpened' 1320d428 -- corpus/knowledge | wc -l` → 0.
- `git show 1320d428:SCORECARD.md | grep -c '^| \`chromium-file-chooser-linux\` |'` → 0.

So the sentence's own grep is true. A wider concept grep is not empty:

- `webdriver-bidi-capability-matrix.md:68` names `input.setFiles` "for file
  inputs only" (a different protocol's file-input setter, unmeasured here).
- `webmcp-declarative-validation-round-19.md:20` names file inputs under a
  runtime flag.
- `chromium-drag-intercept-runtime-round-75.md:11` names script `DataTransfer`
  fakes (the closest prior art for the page-stub forgery).
- `webbridge-plugin-anatomy.md:85` names an `upload` verb (the claim's one
  acknowledged wider hit).

None covers the chooser interception/event/mode/cancel surface, so the
novelty of the *chooser* capability holds; the blanket "no knowledge note
covers a file chooser" is overbroad if "file input" setting counts, and the
claim should say what its wider grep was (the note's QUALITY 147 paragraph
does cite the six-term grep and the one `upload` hit, not the BiDi
`input.setFiles` mention).

Current working tree: `SCORECARD.md` has exactly one row
(`grep -c '^| \`chromium-file-chooser-linux\` |' SCORECARD.md` → 1, line
3796/3814, uncommitted ` M SCORECARD.md`), and
`git grep -lE 'setFileInputFiles|fileChooserOpened' -- corpus/knowledge | wc -l`
→ 1 (the note is committed at HEAD and modified in the working tree). The
claim's leg (d) note exists. Two provenance wrinkles in the working tree:

- The note's source line (note:1) now reads "S208, S209, S210, S211, S212,
  S213" and puts S213 inside the "Chromium 155.0.8059.84 …" parenthetical;
  S213 is Puppeteer v25.16.0 (Chrome 156, client side), not a S208-S212
  source, and is not in the claim's `sourced` field (claims.json:26). The
  note body correctly labels S213 client-side; the source line's grouping is
  a false provenance. `corpus/SOURCES.md:227` has the S213 row, but
  `git show HEAD:corpus/SOURCES.md | grep -c S213` → 0 (the row is an
  uncommitted working-tree addition).
- The claim's `priorSet` (claims.json:20) cites
  `lesson-proof/prior-set-enumeration.txt`; the file does not exist
  (`git show b51afa7f:.ufo/waves/round-77/lesson-proof/prior-set-enumeration.txt`
  → fatal: path does not exist). The enumeration fact is reproducible:
  `node .ufo/waves/round-77/controls/c1/enumerate-prior-set.mjs b51afa7f`
  → exit 0, "receipts by parse 19; prior-set.txt lines 19; unparsable
  JSON-looking 0; equal to prior-set.txt: true". The claim cites a missing
  artefact; the committed script/output is the right citation.

## Impacted axes and smallest safe correction

Impacted: **coverage** (the claim's counter is receipt-only; the do-nothing
reach is real and mostly declared), **calibration** (the 40/3 boundary is
exact for honest priors; the prior-integrity premise is unstated),
**operability** (the 16 honest priors are not in `freeze.txt`, and the
counter prints but does not check their sha; the prior-set file's
sha/lines are printed but not checked; the cited enumeration file is
absent), **depth** (S211:1953 sourced-not-measured; intercept-off and
`-32000` measured-not-sourced; `accept` wording), **freshness** (the
six-term novelty grep is true; wider file-input prior art and the S213
source-line grouping are not named).

Smallest safe correction that does not touch the frozen instruments:

- For the main verifier of this claim: compare the `priorSet[].sha256`
  values printed by the leg-(a) and leg-(b) runs (they are in
  `baseline.json`/`lane.counter.json`) against each other and against the
  committed priors; run `git diff --quiet -- <the 19 prior paths>` before
  accepting (a)-(c). This catches the prior-tamper and prior-deletion
  escapes without changing the counter. Use
  `controls/c1/enumerate-prior-set.mjs <freeze-parent>` (exit 0) for the
  completeness fact; do not cite the absent `prior-set-enumeration.txt`.
- For the next generation (r78, not this claim): pass the committed
  prior-set sha and per-prior digests as expected values to the counting
  command (or read priors with `git show D:<path>`); scope the `accept`
  sentence to `DOM.setFileInputFiles`/CDP; state the headless
  interception-off cancel as measured, not sourced; add a
  `{enabled:false,cancel:true}` leg for S211:1953; fix the note's S213
  grouping. Record and route; do not amend this claim (`killRule`).

## Reproduce (commands and exit codes)

All counter runs used the pinned counter and driver; the scratch lane runs
copied all 19 priors and the prior-set into the mirror. The frozen leg-(b)
arguments:

```
node scripts/check-filechooser-r77.mjs --lane <lane> --receipt <seat>/<receipt>.json \
  --expect-driver-sha256 9954db0703e03aed157c4be9b13f678b1bc1a6240b4bf88491d0e1f5286558a6 \
  --expect-nonce tabi-r77-exec1-dcdf582add58 \
  --prior-set <lane>/.ufo/waves/round-77/controls/c1/prior-set.txt \
  --prior corpus/evidence/round77/chromium-file-chooser/receipt.json --json
```

- L1 run under test: exit 0, 183 checks, `baseline.json` (nonce
  `tabi-r77-l1-dcdf582add58`, no `--prior`).
- `relabel`: exit 1, `replay-event-timeline`, smoke1 79/40, 11/9.
- `retime39`: exit 1, `replay-event-timeline`, 40/40, 8/9.
- `retime40`: exit 0, clean, 39/40, 8/9.
- `retime40-gap2`: exit 1, `replay-event-timeline`, 39/40, 9/9.
- `addgaps`: exit 0, clean, ownGaps 13, 37/40, 7/9.
- `synthetic`: exit 0, clean, 0/40, 0/9.
- degenerate page-stub / eval-trigger / swap-files: exit 1 each,
  `scored-run-not-degenerate`, `leg-records`, `replay-*`
  (`degenerate-*.counter.json`).
- prior-tamper mirror lane (`smoke1.events = []`): exit 0, clean,
  smoke1 0/0, `lane.counter.json`; tampered prior
  `tampered-prior-smoke1.json`.
- prior-set deletion mirror lane (18 lines, smoke1 file absent): exit 0,
  clean, `lane2.counter.json`, set `lane2-prior-set.txt`.
- `node .ufo/waves/round-77/controls/c1/enumerate-prior-set.mjs b51afa7f`:
  exit 0, 19 receipts equal to prior-set.txt.
- `git show b51afa7f:.ufo/waves/round-77/lesson-proof/prior-set-enumeration.txt`:
  fatal, path does not exist (the claim's cited artefact).
- Base novelty/row greps: 0/0/0 (commands in section 4); working tree row 1.
