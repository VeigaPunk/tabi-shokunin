# Round 36 — lesson (tabi, 2026-10-27) — DRAFT SKELETON

> Skeleton drafted in w1 by ScribeLesson. Cells marked `PENDING` belong to the L1 or the owning seat and are
> filled at integration. Every other sentence is read from the frozen contract (`.ufo/waves/round-36/claims.json`
> at `2e7b7a8920bff47fae6f75c3d06e48e37767099e`) or from a committed receipt; the read behind each number is
> named in the seat report (`.ufo/waves/round-36/w1/ScribeLesson/report.md`). **This seat ran no counter and no live
> session**, so nothing below is a measurement and no predicate verdict is asserted: the control tables are the
> committed receipts, and the claim verdicts stay un-evaluated until `measure.sh` runs.

Claims (frozen in `2e7b7a8920bff47fae6f75c3d06e48e37767099e` before data,
`.ufo/waves/round-36/claims.json`; round-start tip `11c64b96f357de106c30a71c5e21ca44a3eacdc0`; prior closure
round 35 `rejected-honest-stop`, `corpus/lessons/round-35-verifier-spotcheck.md`): **C1 adjacency** — the sibling
overlap map `corpus/adjacency.tsv` and the 383-line closed screen ledger `corpus/adjacency-screen-browser.tsv` stay
accounted, and a new drift-verification ledger `corpus/adjacency-screen-drift.tsv` re-audits every screen row citing
one of the 12 sibling lanes whose head moved after the round-35 pins, at that lane's frozen delta head
(`.ufo/waves/round-36/baseline/c1-delta-pins.json`): each status (`unchanged` / `moved` / `stale`) is re-derived by the
frozen counter from the sibling git objects, a `moved` note names a head line where the pin-cited text verifies
verbatim, and the delta leg maps or screens every browser-ground line a sibling added post-pin (307 drift rows — 304
unchanged, 3 moved, 0 stale; delta pool empty; the three kaidoku relocations `SKILL.md` 585→748, 621→784, 652→815);
**C2 operability** — the WebDriver-BiDi Firefox runtime evidence is re-admitted under the amended counter
`.ufo/waves/round-36/counters/c2-firefox-bidi-v2.mjs` (A1 TARGET 14→16, A2 sha256-pinned `--firefox`/`--geckodriver`,
A3 lstat-refused exclusive scratch writes, A4 whitespace-normalised self-sniff refusal, A5 live DNS-off session with
non-loopback egress sampling, A6 pairwise-disjoint browsing-context id sets).

Predicates as frozen (`claims.json`, the same sentence in each claim, in the counter header and as the counter's
`predicate` field):

- C1: `check-adjacency verdict clean at REV AND completeness.unaccounted == 0 AND drift.total >= 1 AND
  drift.auditCoverage == drift.total AND drift.auditFindings == 0 AND drift.staleFindings == 0 AND
  delta.unaccounted == 0 AND delta.screenFindings == 0`.
- C2: `no entry finding AND no receipt finding AND no binding finding AND failing == 0 AND admitted >= 16 AND
  live.egressNonLoopback == 0`.

Axis context at round start (`claims.json`, not a re-scoring): depth 9, coverage 9, operability 9, freshness 9,
calibration 9, adjacency 8 — adjacency is the unique lowest non-retired axis, so the lowest-axis obligation binds and
C1 works adjacency; the round-35 capability row `webdriver-bidi-runtime-firefox` restarts the operability window at
position 1, so the stagnation nudge is inactive this round.

## Gate

Source rows opened this round (every row re-fetched by its seat; quotes located by grep in the fetched bytes; seat
receipts under `.ufo/waves/round-36/w1/ScribeSrc*/`). Decision: **PENDING** — the admit/refuse call is the L1's at
integration (round-35 shape: admit, registered `mined`, used-by the claim's method entry).

| id | url | accessed (UTC) | status | bytes | sha256 | quote (<= 25 words) | location |
|---|---|---|---|---|---|---|---|
| S142 | https://git-scm.com/docs/git-show | 2026-10-27T09:29:57Z | 200 | 246,608 | 0a95cbcd8868054d851eedb192864798092c597592851989f5d1bb392730168a | Shows one or more objects (blobs, trees, tags and commits). | §DESCRIPTION, first paragraph, `git-show.html`:3272 |

Additional located quote:
- S142 — "Shows the contents of the file Documentation/README as they were current in the 10th last commit of the
  branch next." (20 words) — §EXAMPLES, `git-show.html`:5566-5571, cited **whitespace-normalised and
  markup-stripped** (the source hard-wraps the paragraph across 5568-5571); the seat flags this as its one template
  deviation and offers the DESCRIPTION line alone as the strictly-verbatim alternative.

Row cells are ScribeSrcGitDocs's (`w1/ScribeSrcGitDocs/S142-row.md`, `fetch-receipts.md`): id `S142` (next free — the
registry ends at S141, 141 data rows), kind `docs`, proposed registry status `mined`, recheck `180d`, used-by
`corpus/knowledge/adjacency-drift-audit-r36.md`. Provenance boundary: both quotes above are **transcribed from that
seat's receipt**; this seat did not re-fetch the page, so the row's bytes/quote/location stay the seat's evidence and
the re-fetch is the L1's (or wave 2's) check. Its own limits, recorded verbatim in the receipt: the page is a
*living* unversioned manual, so the digest pins what the seat read rather than a stable artifact; the general
`<rev>:<path>` grammar lives in `gitrevisions(7)`, **not opened** this round, so the EXAMPLES form is demonstrated but
the syntax table is unverified; and the row grounds the addressing primitive only — it is not evidence for any drift
ledger status.

Rejected (kept as decisions, not rows):
- `https://git-scm.com/docs/git-diff` (support fetch, 2026-10-27T09:29:57Z, 200, 229,155 B, sha256
  `5ae80d1deee5dc2c1acafff5491c5ba019629b9a785e6781a3e8a411cf9e22ed`) — not registered: it says *what* a diff
  compares and does not state the `<rev>:<path>` blob-read the audit calls (the seat's stated reason). Flip: a claim
  that rests on diff semantics rather than on object addressing.

Registry log (contract: every status / recheck / used-by change old→new):
- S142: new row, status `mined`, recheck `180d`, used-by `corpus/knowledge/adjacency-drift-audit-r36.md` —
  **PENDING** on the L1 (the row and the entry are drafts in the seat dir; `corpus/SOURCES.md` was not edited by the
  seat).

Assimilation: **PENDING** (w1 ScoutAssimilation).

Freeze bytes: the six frozen files and both gate scripts at the freeze equal `claims.json` `frozenDigests` — 8/8,
checked read-only while drafting (`c1-adjacency-sweep-v4.mjs` `8a223faf…`, `c2-firefox-bidi-v2.mjs` `15910c59…`,
`baseline/controls.mjs` `27dba3ea…`, `measure.sh` `6a652aca…`, `baseline/c1-drift-audit-build.mjs` `c8153a5a…`,
`baseline/c1-delta-pins.json` `81019362…`, `scripts/check-adjacency.mjs` `4e2c2a64…`,
`scripts/check-bidi-runtime.mjs` `370e8e95…`).

## C1 gate decisions — wave 1

Frozen controls (`claims.json` `controls`, receipts `.ufo/waves/round-36/baseline/c1-J*`):

| control | exit | predicate | reading |
|---|---|---|---|
| c1-J0-absent-instrument | 2 | — | delta pins absent at the round-start tip (`11c64b9`), so the instrument cannot read the tip |
| c1-J1-do-nothing | 1 | false | `auditCoverage` 0/307, `auditMissing` 307, `deltaTotal` 0 |
| c1-J2-all-unchanged | 1 | false | `auditFindings` 3, `auditMissing` 3 — the three kaidoku moved rows |
| c1-J3-wrong-relocation | 1 | false | `auditFindings` 3, `auditMissing` 3 — moved notes naming the wrong head line |
| c1-J4-delta-screen-junk | 1 | false | `deltaScreenFindings` 1 with `deltaTotal` 0 |
| c1-J5-honest-floor | 0 | true | 307/307 audited, `auditFindings` 0, `staleFindings` 0 |

- Chunk seat read (PENDING): 16 chunk seats `AdjDrift01`–`AdjDrift16` disposition all 307 drift rows
  (`w1-chunks/AdjDrift*.tsv`, 307 rows; seat receipts `w1/AdjDrift*/receipt.tsv`, column `agree|MISMATCH`).
  Disagreement total and every correction: **PENDING**.
- Delta leg (PENDING): `baseline/c1-delta-candidates.tsv` is a single newline, i.e. the post-pin pool is empty; the
  wave-1 confirmation that it is empty by git diff rather than by construction: **PENDING**. The counter's delta screen
  ledger path (`corpus/adjacency-screen-delta.tsv`, `c1-adjacency-sweep-v4.mjs:83`) is **absent at the freeze** — with
  `delta.total` 0 it has no row to carry, and `c1-J5` passes without it, but the freeze ships no file there and
  `claims.json`'s surface sentence does not name it; recorded for the judge rather than resolved here.
- Moved rows: the three kaidoku relocations verify verbatim at the delta head `1ed29de2…` (reads performed while
  drafting); the wave-1 by-hand re-read of every status class: **PENDING**.

## C2 gate decisions — wave 1

Frozen controls (`claims.json` `controls`, receipts `.ufo/waves/round-36/baseline/c2-J*`):

| control | exit | predicate | reading |
|---|---|---|---|
| c2-J0-baseline-absent | 0 | — | v2 absent at the round-start tip (expected: the amendment is new this round) |
| c2-J1-regression | 0 | true | admitted 16, target 16, failing 0, unmeasured 1, `binding` null, egress 0, live `firefox 158.0.1 cmds=28` |
| c2-J2-wrong-binary | 2 | — | unregistered caller-named binary refused before any run |
| c2-J3-boundary-15 | 1 | false | admitted 15, failing 0, unmeasured 2 — the one-short boundary |
| c2-J4-wsnorm-clone | 1 | false | admitted 0, failing 16, receipt finding: driver is a whitespace-normalised copy of the counter (A4) |
| c2-J5-duplicate-run | 1 | false | admitted 0, failing 16, receipt finding: transcript sha256 repeated across runs |
| c2-J6-egress-instrument | 1 | false | 8 non-loopback sockets across 3 samples with the DNS-off prefs dropped (A5 is an observation, not a decoration) |

- Wave-1 live re-measurement, binary `--version`/sha256 against the round-35 install receipts, and the fresh Firefox
  session's egress reading: **PENDING**.
- Recorded limit carried from round 35 (rewritten-id transcript clones; A6 refuses identical-id clones only):
  **PENDING** as to whether it still stands at the w1 integration.

## Mistakes

- **M1 — hand-copied constant (class `hand-copied-constant`).** Evidence: pre-freeze, the L1 transcribed the kama
  round-35 pin into the C1 v4 counter by hand, and the 39-character constant failed `resolveCommit` at control time
  (`c1-adjacency-sweep-v4.mjs:126-131`: the `^[0-9a-f]{40}$` guard, then `rev-parse --verify --quiet`).
  Captured-by: **none** — no instrument in the frozen set reads the `PINS` block until the controls run, so nothing
  sat between the transcription and the first control; the failing bytes are not committed anywhere (that file's only
  commit is the freeze `2e7b7a89`, whose `PINS` block is 20 keys, all 40 hex, and all 20 resolve at their lanes —
  re-resolved read-only while drafting). Note for the judge: `git rev-parse --verify -q` accepts a 39-hex *prefix* and
  prints the full sha (exit 0, probed read-only this round), so the length guard, not the object lookup, is what
  refuses a truncated constant; without the guard the truncation would have resolved to the intended commit silently
  and the class would have stayed invisible. Fix: constants extracted programmatically — the round-35 pins file
  (`.ufo/waves/round-35/baseline/c1-pins.json`, 20 lanes) became the single source, and the counter was re-verified by
  re-running the derivation. Artifact limit, reported as-is: the frozen counter still carries a literal
  `const PINS = Object.freeze({…})`; its 20 values are key-for-key identical to that pins file (compared while
  drafting), so the extraction step is not visible in the frozen bytes — what the bytes do show is 20/20 well-formed,
  resolving constants.
- Further wave-1/2 mistakes: **PENDING** (one line per mistake, with label, evidence path, captured-by and fix;
  round-35 shape M1–M5).

## Errata intake (round-35 closure routed defects)

Dispositions are the L1's; the items are the ones `claims.json` `priorClosure` carries:

1. Entry D11 cites a 0-byte evidence file → a correction lands this round; **not a claim**. Disposition: **PENDING**.
2. C2 counter amendment — M1 (threshold), M3 (non-loopback live leg), M4 (caller-named binaries), w2 MutDriverReceipt
   whitespace-twin self-sniff → claimed this round as C2. Disposition: **PENDING**.
3. S125 `on-release` cadence with its four companion files → lands this round; **not a claim**. Disposition:
   **PENDING**.
4. C1 meter — a fixed `newMapped` quota on a closed, fully screened pool cannot be met honestly; the planned split
   (completeness vs delta discovery) is the lane's own next step → claimed this round as C1. Disposition:
   **PENDING**.
