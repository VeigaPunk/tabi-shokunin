# ExecS125 — S125 `on-release` cadence landed with its four companion files (round-34 routed defect 5, second carry)

Seat `ExecS125` · tabi round 36 attempt 1, wave `w1` · milestone routed-defects · judged on **freshness**.
Freeze under test `2e7b7a8920bff47fae6f75c3d06e48e37767099e`; contract read first
(`.ufo/waves/round-36/claims.json`: both claims, predicates, kill rules, `feasibilityDisclosed`), then
`corpus/lessons/round-35.md ## Gate` (S125 paragraph) and `scripts/check-release-pins.mjs` (r1, f1–f6, s1).
No lane file, no sibling repo, no fleet-root file was written; every git mutation happened inside
`/fast/scratch/hyaku/tabi-r36/ExecS125/clone` (a `--shared` clone), asserted with
`git rev-parse --show-toplevel` before the first commit. Scratch was deleted before this report.

## Verdict

**Landed-ready: the registry cell `90d` → `on-release` with all four companions, one commit, gate green.**
The four files are in this seat dir at `release-pins/`, byte-complete, each at the path the gate expects;
the cell change is in `release-pins/SOURCES-cell-change.txt`. Proven in a scratch mirror of the lane:

| run | shape at `--rev HEAD` | gate reading | exit |
|---|---|---|---|
| baseline | lane HEAD `2e7b7a8920bff47fae6f75c3d06e48e37767099e`, untouched | population 23, resolved 23, unresolved 0, holds 16, drifted 7, clean | **0** |
| **A** | cell only (`release-pins/SOURCES-cell-change.txt`), no companions | population 24, resolved 23, unresolved 1; S125 `["r1-entry missing or no files"]` | **1** |
| **B** | cell + the four companions (the landing shape) | population 24, resolved **24**, unresolved 0, holds **17**, drifted 7, clean; S125 `{"resolved":true,"verdict":"holds","reasons":[]}` | **0** |

Command form: `node scripts/check-release-pins.mjs --repo <mirror> --rev HEAD --stable 156.0.8078.47 --json`.
Raw output: `gate/gate-lane-HEAD-2e7b7a8.json`, `gate/gate-A-cell-only.json`, `gate/gate-B-cell-plus-companions.json`.

## The four companions (byte-complete, ready for `corpus/evidence/round-29/release-pins/`)

| # | seat-dir file | bytes | sha256 | committed path |
|---|---|---|---|---|
| 1 | `release-pins/receipt-row.json` | 902 | `c65e7a8b93297142d1a02f7e5a09d90c47cb58e212e8dc47ccab5555ddc35975` | append the object into `receipt.json` → `rows[]` (after `S106`) |
| 2 | `release-pins/bytes/154.0.8037.97/chrome/test/chromedriver/session_commands.cc` | 68,207 | `7b40e94cefe1b1d319cd054ff433470aad3944067f5a344b932e6ec068b7abb5` | `corpus/evidence/round-29/release-pins/bytes/154.0.8037.97/chrome/test/chromedriver/session_commands.cc` |
| 3 | `release-pins/bytes/156.0.8078.47/chrome/test/chromedriver/session_commands.cc` | 69,523 | `1bb1537c89f579436479b72666547a46bb7369a11228982ae855c690b31fac06` | `corpus/evidence/round-29/release-pins/bytes/156.0.8078.47/chrome/test/chromedriver/session_commands.cc` |
| 4 | `release-pins/refetch/S125.json` | 286 | `1c9bf1b69716f79eb98e974172cbf167c01681c45c343223dbcfc09c01ad1704` | `corpus/evidence/round-29/release-pins/refetch/S125.json` |

Receipt row content: `id S125`, `fetched_by ScribeRoutedDefects`, `fetched_at 2026-10-26T18:25:11Z`,
`superseded_by null`, one file `chrome/test/chromedriver/session_commands.cc`, `old_tag 154.0.8037.97`,
`old_status/new_status 200`, `old_sha256/new_sha256` as above, `ranges [[287,289],[332,338],[378,378],
[407,410],[429,464],[510,510]]` — identical to the round-33 draft
(`.ufo/waves/round-33/w1/ScribeRoutedDefects/drafts/s125-receipt-entry.json`) whose fetch receipts record
both 90,944 B and 92,700 B `?format=TEXT` envelopes at that time.

Refetch record: `seat ExecS125` (≠ `fetched_by`, which is what `f6-refetch` reads), `fetched_at
2026-10-27T09:31:44Z`, one file at `tag 156.0.8078.47`, `status 200`, `sha256 1bb1537c…ac06`.

## Freshness evidence — fetched today, not copied from round 35

Three read-only HTTPS GETs of `chromium.googlesource.com` (Gitiles `?format=TEXT`, decoded with
`base64 -d`), full ledger in `gate/fetch-receipts.tsv`; no browser, no pacman, no network tool installed:

| url | UTC | HTTP | envelope B | decoded B | sha256 |
|---|---|---|---|---|---|
| `…/refs/tags/154.0.8037.97/chrome/test/chromedriver/session_commands.cc?format=TEXT` | 2026-10-27T09:30:53Z | 200 | 90,944 | 68,207 | `7b40e94c…abb5` |
| `…/refs/tags/156.0.8078.47/…/session_commands.cc?format=TEXT` | 2026-10-27T09:30:54Z | 200 | 92,700 | 69,523 | `1bb1537c…ac06` |
| same 156 URL (the recorded refetch) | 2026-10-27T09:31:44Z | 200 | 92,700 | 69,523 | `1bb1537c…ac06` |

The 154 digest **equals the digest the row's own anchor cell cites** (`7b40e94c…abb5`), so the committed
old bytes are the bytes the registry claims, not bytes of convenience; the 156 digest equals the value
rounds 33 and 35 recorded — three rounds, four independent fetches, one digest. Today's fetches are the
freshness proof that the landed pair is current at the stable tag the receipt pins.

## The claim still holds at the stable tag (verdict computed, not asserted)

`gate/range-verification.txt`, gate `blockIn` semantics (lines trimmed, inner whitespace collapsed),
154 file 1,878 lines vs 156 file 1,905 lines:

| 154 range | occurrence in 156 | shift |
|---|---|---|
| 287-289 | 287 | 0 |
| 332-338 | 332 | 0 |
| 378 | 287, 332, 378, 843, 944 | 0 (and 4 false friends — non-discriminating) |
| 407-410 | 411 | +4 |
| 429-464 | 440 | +11 |
| 510 | 521 | +11 |

Located quotes at 156: `378   if (session->web_socket_url) {`; `412     status =
session->chrome->NewHiddenTarget(`; `457     status = bidi_mapper_web_view->StartBidiServer(`; `468
bidi_cmd.Set("method", "session.new");`; `521   session->web_socket_url = capabilities->web_socket_url;`.
At 154: `452     // Execute session.new for the newly-created mapper instance.` and `457
bidi_cmd.Set("method", "session.new");`. All six ranges hold, so `verdict: holds` and no
`superseded_by` is needed — the enabling path is unchanged across the release, which is why the cadence
is the only thing this round moves.

## Falsifiers — each half of the landing is load-bearing

| control (all in the scratch mirror, each a detached worktree of B) | reading | exit |
|---|---|---|
| **cell reverted to `90d`, companions present** | population 23, S125 absent from the population, clean | 0 — companions alone buy nothing; the cadence cell is what wires the row into the meter |
| **refetch `seat` set to `ScribeRoutedDefects` (= `entry.fetched_by`)** | population 24; S125 `["f6-refetch chrome/test/chromedriver/session_commands.cc"]` | 1 |
| **old-tag bytes copied in as the stable-tag bytes** (receipt/refetch digests unchanged) | population 24; S125 `["f3-bytes sha …","f5-digest"]` | 1 |

Raw output: `gate/ctl-cell-reverted.json`, `gate/ctl-refetch-seat-twin.json`,
`gate/ctl-old-bytes-as-new.json`. Together with A and B this closes the loop the round-35 lesson left
open: red without the files, red with a copied-as-new blob, red with a twin-seat refetch, green only
with the honest cell + four companions.

Also run at B: `node scripts/check-sources.mjs --root <mirror>` → exit 0,
`SOURCES_GATE verdict=clean rows=141 tiers=A:125,B:7,C:9 status=queued:15,mined:117,rejected:9
findings=0` (`gate/check-sources-B.txt`) — `on-release` passes the real table's grammar, not just the
release-pin gate.

## Integration instructions (one commit; the L1 lands it)

1. `corpus/SOURCES.md:139`, `recheck` cell only: `90d` → `on-release` (exact old/new line in
   `release-pins/SOURCES-cell-change.txt`; `1 1` numstat, nothing else on the row).
2. Append `release-pins/receipt-row.json` into `corpus/evidence/round-29/release-pins/receipt.json`
   `rows[]`. Format check done: `json.dumps(committed, indent=1)` round-trips the committed file
   byte-for-byte (`True`), and the append is `+44/−0` lines, new entry after `S106`.
3. Copy the two byte files to `corpus/evidence/round-29/release-pins/bytes/<tag>/chrome/test/chromedriver/session_commands.cc`
   and the refetch record to `corpus/evidence/round-29/release-pins/refetch/S125.json`.
4. **Do not land the intermediate A state** — it is a scratch red reading, not a proposal.
5. Post-landing check: `node scripts/check-release-pins.mjs --rev HEAD --stable 156.0.8078.47` → expect
   `verdict=clean population=24 resolved=24 unresolved=0 holds=17 drifted=7`, exit 0.

Diff shape of the landing commit (scratch B vs lane HEAD, `git diff --numstat`): `corpus/SOURCES.md 1 1`,
`receipt.json 44 0`, `refetch/S125.json 13 0`, two byte files added (1,877 and 1,904 lines), zero
deletions anywhere.

## For the L1's `## Gate` section (round 36)

```
Registry log: S125 recheck `90d` → `on-release` (round-34 routed defect 5, second carry, discharged).
Landed with receipt row S125 (fetched_by ScribeRoutedDefects 2026-10-26T18:25:11Z), both decoded tag
blobs (154.0.8037.97 68,207 B `7b40e94c…abb5`; 156.0.8078.47 69,523 B `1bb1537c…ac06`) and
refetch/S125.json (seat ExecS125, 2026-10-27T09:31:44Z, same 156 digest). Gate in a scratch mirror:
baseline 0 (pop 23), cell alone 1 (`r1-entry missing or no files`), cell+companions 0
(pop 24, resolved 24, holds 17, S125 `verdict: holds`). Controls: cell reverted → pop 23 (row leaves the
meter); refetch seat twin → `f6-refetch`; old bytes as new → `f3-bytes sha`+`f5-digest`. At stable
156.0.8078.47 the six cited 154 ranges still occur (407-410→411-414, 429-464→440-475, 510→521 shifted),
so nothing supersedes S125; the release is the only event that can turn it red.
Evidence: `.ufo/waves/round-36/w1/ExecS125/`.
```

## Limits (recorded, not remediated)

- **`--stable 156.0.8078.47` is taken from the receipt's trigger** (S108, Chromium Dash record
  2026-10-26T04:12:21Z), not re-derived: Chromium Dash is outside this seat's allowed host list. If
  Stable has moved, the receipt needs a new trigger row, not an edit to S125.
- **`capabilities.cc` stays uncovered by the tripwire.** The row's anchor also cites `capabilities.cc:1362`
  and `1375-1376` and its digest `597c1a33…7ba7`; adding it as a second receipt file (ranges
  `[[1362,1362],[1375,1376]]`, two more 54,458 B blobs, `f2` satisfied via the anchor's basename) is a
  design change beyond this routed defect and was declined in round 35 as well. Flip: a round that plans
  the boolean-parse leg explicitly.
- **`f6` independence is name-based**, by the gate's own header: `ExecS125` is a different process, time
  and round from `ScribeRoutedDefects`, but a different string would also pass. The twin-seat control
  above shows the check is not vacuous; it does not make the name a cryptographic identity.
- **Range `378` cannot discriminate** — the normalised line `if (session->web_socket_url) {` occurs five
  times at 156. The other five ranges carry the location.
- **Content is not behaviour**: identical source at 154 and 156 does not prove shipped ChromeDriver
  binaries behave identically.
- **Tools**: none installed this wave (no pacman transaction was run; `pacman` guard respected);
  `curl`, `python3`, `git`, `node` were already present.

## Files in this seat

`release-pins/receipt-row.json`, `release-pins/bytes/154.0.8037.97/chrome/test/chromedriver/session_commands.cc`,
`release-pins/bytes/156.0.8078.47/chrome/test/chromedriver/session_commands.cc`,
`release-pins/refetch/S125.json`, `release-pins/SOURCES-cell-change.txt`, `gate/` (six gate/control JSONs,
`check-sources-B.txt`, `range-verification.txt`, `fetch-receipts.tsv`), `report.md`.

VERDICT ok — S125 `90d` → `on-release` is gate-green only with the four companions, which are produced
byte-complete here: scratch mirror exit 0 at cell+companions (population 24, resolved 24, holds 17,
S125 `holds`), exit 1 at cell alone (`r1-entry missing or no files`), and red under three controls
(cell reverted → row leaves the population; refetch seat twin → `f6-refetch`; old bytes as new →
`f3-bytes sha`+`f5-digest`); both tag blobs re-fetched fresh 2026-10-27T09:30:5xZ and the stable-tag
refetch at 09:31:44Z, digests equal to the row's cited `7b40e94c…abb5` and to rounds 33/35's
`1bb1537c…ac06`.
