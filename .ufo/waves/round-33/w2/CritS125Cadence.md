# CritS125Cadence — C1-adjacent curation attack: keeping S125 `recheck` at `90d`

Attacked: the round-33 decision to keep S125 at `90d` and record a reason instead of landing w1 ScribeRoutedDefects
draft-3 (`corpus/lessons/round-33.md:144-151`), read against draft-3
(`.ufo/waves/round-33/w1/ScribeRoutedDefects/drafts/draft-3-s125.md`) and round-32 routed defect 3
(`corpus/lessons/round-32-verifier-spotcheck.md:150`). Revision attacked: `042d6d9abf97d567d495652a85eabc851b81adc1`.

**Verdict: defect, moderate.** The decision not to land draft-3 *this round* holds and is honestly grounded, but the
recorded reason does not do the work routed defect 3 asked for, and it is not consistent with the 30 other tag-pinned
rows. Under CORPUS contract v1 the value itself is legal — `90d` is in the enumerated cadence vocabulary
(`CORPUS.md:105-106`) and no rule-2 change was made this round (`CORPUS.md:116-118`; lesson `:139-142`), so nothing is
violated lexically. Substantively the reason is non-discriminating: it rests on tag immutability, a property every one
of the 30 `on-release` tag-pinned rows shares, so it cannot distinguish S125 from them; the only fact that does
distinguish S125 — that the receipt entry needed to stay `on-release` cannot be honestly produced — is written as a
blocker on the alternative rather than as a reason for `90d`; and the "build-bound re-run duty lives in the runtime
entry's own `recheck`" clause points at a recheck that no instrument in this lane schedules, while
`scripts/check-release-pins.mjs` (the only mechanism that has ever acted on this class of row: 23 rows re-opened at
156 in round 29) reads `on-release` rows only. Net effect, measured: with S125 at `90d` the release-pins gate is clean
at population 23; flipping that one cell to `on-release` without a receipt makes it red (population 24, unresolved 1,
`r1-entry missing`, exit 1). So `90d` is not a cadence judgement about the source; it is the switch that keeps the drift
detector off for the row that grounds the lane's central runtime claim, and the routed defect is closed on a formal
reading while its own reopen condition ("until a second seat fetches the 156 blob") is unobservable to the gate that
would have to observe it. The exception also grew this round from one member to three with two different recorded
justifications in the same section.

## What holds (credit, so the correction is aimed at the right thing)

- **Not landing draft-3 was right.** draft-3 discloses that both fetch role names came from one process
  (`drafts/draft-3-s125.md:78`, §Honest limits), and `f6-refetch` compares a `seat` *string*
  (`scripts/check-release-pins.mjs:40-46`). Committing that entry would have put a false independence record into a
  committed receipt. The L1's stated blocker (`corpus/lessons/round-33.md:149-151`) is accurate.
- **The misattribution draft-3 flagged was repaired.** The lesson now attributes "re-run on a new ChromeDriver build" to
  the runtime entry's recheck (`corpus/knowledge/webdriver-bidi-runtime-round-32.md:7`; lesson `:146-147`), not to
  S125's registry cell, which has always carried a bare `90d` (`corpus/SOURCES.md:139`).
- **The alternative really works, and I reproduced it.** Building draft-3's state in my own clone from my own two GETs
  (a receipt entry plus `refetch/S125.json`, S125 → `on-release`) gives population 24, resolved 24, holds 17, drifted 7,
  `S125 {resolved: true, verdict: "holds"}`, clean true, exit 0 — exactly draft-3's numbers. So the discarded option is
  neither speculative nor expensive.
- **The lesson's freshness facts are true.** S125's decoded digest re-fetched this round equals the row's anchor
  (`7b40e94c…abb5`), confirmed a third time by my own GET.

## Findings

### F1 (moderate) — the recorded reason is not a cadence reason and does not discriminate

Lesson `:144-147` justifies `90d` with "S125 pins immutable bytes at a tag … the build-bound re-run duty lives in the
runtime entry's own `recheck`". Immutability is not a distinguishing property:

- Measured distribution of tag-pinned rows at `042d6d9` (all carry `refs/tags/<A.B.C.D>/` in the `source` cell):

      awk -F'|' '/^\| S[0-9]{3} /{...}' corpus/SOURCES.md | sort | uniq -c
      3  90d          154.0.8037.97     (S125 :139, S127 :141, S129 :143)
      23 on-release   154.0.8037.97
      7  on-release   156.0.8078.47

  All 30 `on-release` rows pin immutable tag bytes too. The property the lesson cites as its reason is therefore not
  evidence for `90d`; if anything it is evidence that a *date* recheck can only re-read identical bytes — I verified
  that: my GET of the 154 tag returns decoded sha256 `7b40e94c…abb5`, byte-identical to the row's own anchor, so a
  90-day recheck of this row is structurally information-free (the lane's own `vacuous` class, cf. `round-33.md:169`).
- The practice semantics of `on-release` in this lane are "compare the old tag against the new release", not "re-read
  the old tag": round 29 re-opened 23 `on-release` rows at stable 156 and got 16 holds / 7 drifted
  (`corpus/SOURCES.md` search log, 2026-10-26 round-29 entry; `corpus/knowledge/chromium-156-release-pin-recheck.md`).
  That comparison is the only thing a `90d` date sweep cannot do.
- Contract v1 defines no semantics beyond the vocabulary (`CORPUS.md:105-106`), so this is not a contract breach; it is
  a justification that does not reach the question routed defect 3 asked ("why `90d` is the right cadence",
  `round-32-verifier-spotcheck.md:150`).

### F2 (moderate) — the relocated duty is scheduled by nothing; `90d` is the switch that disables the drift detector

The lesson says a new build "triggers work" in the runtime entry's recheck. Nothing in the lane schedules a knowledge
entry's `recheck`:

    grep -rn "recheck" scripts/*.mjs
    -> presence/vocabulary checks only: check-frontier-admission.mjs:244 (`hasRecheck`), check-sources.mjs:315-322
       (vocabulary), check-release-pins.mjs:127,178 (registry rows), check-decision-table.mjs:126-127
    grep -rn "'90d'|\"90d\"" scripts/*.mjs
    -> check-release-pins.mjs:319,414 and check-sources.mjs:395 — fixtures and vocabulary only
    grep -n 'S013\|S015\|S016\|S020\|S023\|S024' scripts/check-source-reopen-receipt.mjs
    -> :53 const EXPECTED_IDS = ["S013","S015","S016","S020","S023","S024"]

The reopen-receipt gate is a fixed six-id receipt; `check-release-pins.mjs:178` filters
`r.recheck === "on-release" && tags below stable`. So no gate is ever due on a `90d` registry row, and the runtime
note's recheck is a command someone must choose to run. The measured consequence at the attacked revision:

    node scripts/check-release-pins.mjs --repo $S/clone --rev 042d6d9… --stable 156.0.8078.47 --json
    -> population 23, resolved 23, unresolved 0, holds 16, drifted 7, clean true, EXIT 0
    (same clone, only S125 recheck 90d -> on-release, commit 00e1328…)
    -> population 24, resolved 23, unresolved 1, clean false, S125 reasons ["r1-entry missing or no files"], EXIT 1

One cell, one flip, one red gate. That is what keeping `90d` buys.

### F3 (low) — the carry condition is unobservable by the gate it defers to

The lesson carries the item "until a second seat fetches the 156 blob" (`:149-151`). Because `f6` compares a name
string, any seat can satisfy it alone — I did, in one commit: my process wrote both the 156 bytes (`1bb1537c…fac06`,
from my own GET) and `refetch/S125.json` with `seat: "CritS125Cadence"`, and the gate returned clean/exit 0
(`gate-alternative.json`). The carry therefore has no expiry that any instrument can see; it expires only if a human
re-reads the lesson paragraph.

### F4 (low) — two justifications for one value in one section, and the growing divergence is not counted

`corpus/lessons/round-33.md:26-27` justifies S127–S129's `90d` by gate-population avoidance ("not `on-release`, which
would put a Chromium tag pin into `scripts/check-release-pins.mjs`'s population, round-32 M10"); `:144-147` justifies
S125's `90d` by immutability. Each reason would cover the other's rows, so the stated causes are not the operative
ones, and neither paragraph states the resulting count (30 `on-release` / 3 `90d`) — a reader cannot see the exception
grow from 1/31 (`drafts/draft-3-s125.md:8-9`) to 3/33, nor find a rule for the next tag-pinned row.

### F5 (low) — the routing table reads as closure

`LOG.md:2324` and `SCORECARD.md:1766` record "3 → curation (S125 recheck cadence)", and `round-33.md:156` records
"3 → above". Under F1-F3 the item is deferred, not dispositioned; the routed-defect ledger and the lesson should not
both read as closed while the reopen condition is unmet and unobservable. Relatedly, the round's freshness duty is
discharged by re-opening the immutable tag and reporting digest equality (`LOG.md:2336-2337`) — the same vacuous shape the
lesson's own M1/M5 criticise.

## Smallest safe correction (for the next round; this seat edits no lane file)

1. **Do not flip S125 to `on-release` today** — that turns `check-release-pins` red (F2's second run) without an honest
   receipt. Append (append-only) to round-33 §Status, in place of the immutability clause: the operative reason is
   "the receipt entry cannot be honestly produced this round: both fetch role names came from one process and f6's
   independence is name-based"; add the measured counts — 30 tag-pinned rows `on-release` / 3 at `90d`; population 23
   with S125 excluded; 24 / unresolved 1 / `r1-entry missing` if it is flipped alone.
2. **Route routed defect 3 as open, not closed**, with a trigger the gate can actually see: the landing seat must be a
   seat that did not write the receipt entry, its report names the fetch command and the digest, and the receipt's
   `fetched_by` must be that seat — then the entry is appended and `on-release` restored. Name it in round-34's routed
   list so it cannot expire silently (F3).
3. **State one rule for tag-pinned rows** in the lesson Gate: `on-release` is the default; leaving it requires a named
   reopen condition and the round reports the count (F4). This also keeps S127/S129 honest about why they are `90d`.
4. Optional, cheap: a QUALITY criterion ("a cadence is chosen by what can change about the source; for a tag-pinned row
   the mutable thing is the release stream, so leaving `on-release` names the gate-population consequence and the
   reopen condition") whose red state is this round's §Status paragraph.

## Evidence — commands and exit codes

Environment: `HYAKU_SCRATCH=/fast/scratch/hyaku`, `S=/fast/scratch/hyaku/tabi-r33/CritS125Cadence`, `TMPDIR=$S/tmp`.
No package installed or upgraded; no browser launched by this seat.

    1  git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"
       git -C "$S/clone" checkout -q --detach 042d6d9abf97d567d495652a85eabc851b81adc1
       -> HEAD 042d6d9abf97d567d495652a85eabc851b81adc1; rev-parse --show-toplevel = $S/clone; exit 0
    2  awk -F'|' tag-pinned recheck histogram over corpus/SOURCES.md          -> 3 90d / 23+7 on-release; exit 0
    3  node scripts/check-release-pins.mjs --repo "$S/clone" --rev 042d6d9… --stable 156.0.8078.47 --json
                                                                              -> population 23, unresolved 0, EXIT 0
    4  counterfactual A (S125 -> on-release only, commit 00e1328…)
       node scripts/check-release-pins.mjs … --rev 00e1328…                  -> population 24, unresolved 1,
                                                                                 r1-entry missing, EXIT 1
    5  counterfactual B (draft-3 alternative rebuilt by this seat, commit 717fe56…)
       node scripts/check-release-pins.mjs … --rev 717fe56…                   -> population 24, resolved 24,
                                                                                 holds 17, S125 holds, EXIT 0
    6  curl 154 tag ?format=TEXT  200, 90,944 B raw sha256 c5d66f5a…4876e; decoded 68,207 B sha256
       7b40e94cefe1b1d319cd054ff433470aad3944067f5a344b932e6ec068b7abb5 (= S125's anchor)   2026-10-26T18:50:07Z
    7  curl 156 tag ?format=TEXT  200, 92,700 B raw sha256 9948d10e…dc6b59; decoded 69,523 B sha256
       1bb1537c89f579436479b72666547a46bb7369a11228982ae855c690b31fac06 (= draft-3 refetch)  2026-10-26T18:50:52Z
    8  grep -rn "recheck" scripts/*.mjs; grep -rn "'90d'|\"90d\"" scripts/*.mjs;
       grep -n 'S013|S015|S016|S020|S023|S024' scripts/check-source-reopen-receipt.mjs
                                                                              -> no gate due-dates a 90d row; exit 0
    9  pgrep -fa 'chromedriver|chromium'
       -> one host service (earlyoom, its pattern text) and one other seat's node process; none mine

Line citations used: `corpus/SOURCES.md:139` (S125 `90d`), `:141` (S127), `:143` (S129); `CORPUS.md:105-106`
(cadence vocabulary), `:116-118` (rule 2); `corpus/lessons/round-33.md:26-27`, `:139-142`, `:144-151`, `:153-156`;
`corpus/lessons/round-32-verifier-spotcheck.md:150`; `corpus/lessons/round-32.md:146`, `:176-177`;
`corpus/knowledge/webdriver-bidi-runtime-round-32.md:7`; `scripts/check-release-pins.mjs:19-22,40-46,178`;
`scripts/check-source-reopen-receipt.mjs:16-18,53`; `LOG.md:2324`, `:2336-2337`; `SCORECARD.md:1766`;
`drafts/draft-3-s125.md:3,8-9,46,78`.

## Deliverable paths

- Report: `.ufo/waves/round-33/w2/CritS125Cadence.md` (this file)
- Receipts: `.ufo/waves/round-33/w2/CritS125Cadence/gate-integrated.json`,
  `gate-s125-on-release.json`, `gate-alternative.json`, `fetch-record.txt`,
  `alternative-replicate-commits.txt`, `alternative-replicate-diff-stat.txt`
