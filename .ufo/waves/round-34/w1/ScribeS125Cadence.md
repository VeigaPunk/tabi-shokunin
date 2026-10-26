# ScribeS125Cadence — frontier: S125 recheck cadence (round-33 routed defect 6)

**Verdict: the enabling path is identical at the current stable tag, the cited line positions are not — and the
`90d` cell can become `on-release` because that cadence is the only one a gate computes.** I fetched
`chrome/test/chromedriver/session_commands.cc` at `154.0.8037.97` and at `156.0.8078.47` (Gitiles `?format=TEXT`,
decoded; 154 sha256 `7b40e94c…abb5` = the digest S125's own anchor cites, 156 `1bb1537c…ac06` = the digest round 33's
draft recorded) and compared the six ranges the row anchors under the gate's own `f4` rule (trimmed, inner whitespace
collapsed, contiguous block): `287-289`, `332-338`, `378` are identical **in place**; `407-410`→`411-414`,
`429-464`→`440-475`, `510`→`521` are identical **content shifted** by the inserted web-view-lifetime hunks; the paired
`capabilities.cc` (`1362`, `1375-1376`) is byte-identical at both tags (`597c1a33…7ba7`). The 154→156 delta is 52
insertions / 28 deletions in five hunks, every one a `std::unique_ptr<WebViewHolder>` lifetime lock or an added
`status.IsError()` check — nothing touches the `web_socket_url` branch, the `ws://…/session/<id>` capability, the
hidden mapper target, `StartBidiServer` or `session.new`. So the row `holds` at 156 and needs no supersession; the draft
moves the cell `90d` → `on-release` with the receipt row, both decoded byte files and **this seat's independent refetch
record**, and I verified the whole construction in a scratch clone: the cell alone is red (`S125 r1-entry missing`,
exit 1), with the companions it is green (`population 24, resolved 24, S125 holds`, exit 0), a same-seat refetch record
still fails `f6-refetch` (exit 1), stale 156 bytes fail `f3-bytes sha` (exit 1), and deleting the mapper's
`session.new` line from the 156 bytes reads `drifted / s1-drift-unsuperseded` (exit 1).

## Evidence

### Fetches (read-only HTTPS GET, `?format=TEXT`, base64-decoded)

| URL | completed UTC | HTTP | envelope B | decoded B | decoded sha256 |
|---|---|---|---|---|---|
| `…/refs/tags/154.0.8037.97/chrome/test/chromedriver/session_commands.cc?format=TEXT` | 2026-10-26T19:47:46Z | 200 | 90,944 | 68,207 | `7b40e94cefe1b1d319cd054ff433470aad3944067f5a344b932e6ec068b7abb5` |
| `…/refs/tags/154.0.8037.97/chrome/test/chromedriver/capabilities.cc?format=TEXT` | 19:47:49Z | **503** | 1,459 | — | body sha `aa3a9d3d…3ddc` (body text not retained; overwritten by retry) |
| `…/refs/tags/156.0.8078.47/chrome/test/chromedriver/session_commands.cc?format=TEXT` | 19:47:50Z | 200 | 92,700 | 69,523 | `1bb1537c89f579436479b72666547a46bb7369a11228982ae855c690b31fac06` |
| `…/refs/tags/156.0.8078.47/chrome/test/chromedriver/capabilities.cc?format=TEXT` | 19:47:53Z | 200 | 72,612 | 54,458 | `597c1a33092582cad0433ce0bd6cc9565b94804bbc2cf51d3fda1e0301427ba7` |
| `…/refs/tags/154.0.8037.97/chrome/test/chromedriver/capabilities.cc?format=TEXT` (retry) | 19:48:08Z | 200 | 72,612 | 54,458 | `597c1a33092582cad0433ce0bd6cc9565b94804bbc2cf51d3fda1e0301427ba7` |

Envelope digests: 154 session_commands `c5d66f5a…876e`, 156 `9948d10e…6b59`, capabilities `3833f0e2…3eda7` (identical
at both tags, consistent with the decoded equality).

### Range comparison (gate's `f4` rule, applied independently)

`range-map.txt` — 1878 old lines vs 1905 new: `287-289`→287, `332-338`→332 (unique, in place); `378`→ occurs 5×
(287, 332, 378, 843, 944) so it is presence-only evidence; `407-410`→411, `429-464`→440, `510`→521 (each a unique
contiguous block, shifted +4/+11/+11). Line evidence quoted in `s125.md` §3, full diff in
`diff-154-vs-156-session_commands.cc.patch` (5 hunks at old `:387`, `:413`, `:781`, `:835`, `:1147`).

### Gate runs (scratch clone of the lane at the freeze; lane checkout untouched)

Clone `/fast/scratch/hyaku/tabi-r34/ScribeS125Cadence/clone`, `checkout --detach 59f1b47aae277e1670e4a824173da8cde7e388ee`.
`node scripts/check-release-pins.mjs --repo <clone> --rev <rev> --stable 156.0.8078.47 --json`:

| rev | commit | exit | read |
|---|---|---|---|
| `59f1b47` | freeze | 0 | population 23, resolved 23, holds 16, drifted 7, clean |
| `1ad5564` | cell only (`90d`→`on-release`) | **1** | population 24, unresolved 1, `S125 reasons=["r1-entry missing or no files"]` |
| `b939cfb` | + receipt row + both decoded bytes + refetch record (**draft**) | **0** | population 24, resolved 24, holds 17, drifted 7; `S125 {"resolved":true,"verdict":"holds","reasons":[]}` |
| `2aa6787` | refetch `seat` = `fetched_by` | 1 | `S125 reasons=["f6-refetch …"]` |
| `dd9657c` | 156 bytes replaced by 154 bytes | 1 | `S125 reasons=["f3-bytes sha …","f5-digest"]` |
| `3b16add` | 156 bytes minus the `session.new` line | 1 | `S125 reasons=["f6-refetch …"]` (refetch still true) |
| `e9440a1` | same, refetch digest follows the drift | 1 | `S125 {"verdict":"drifted","reasons":["s1-drift-unsuperseded"]}` |

Census at the draft: `node scripts/check-sources.mjs --root <clone>` → exit 0,
`rows=129 … findings=0` (`census-B.txt`). Diff shape: `corpus/SOURCES.md` **1 insertion / 1 deletion**, append-only
elsewhere (`git diff --numstat 59f1b47 b939cfb`).

Every shell command and its exit code is tabulated in `s125.md` §9. No lane script left the scratch clone; no browser
was launched; no tool was installed or upgraded.

## Gates and findings

- **Gate entry drafted** (`s125.md` §6, paste-ready): URL, access date, decoded digest, ≤25-word verbatim quote at
  156.0.8078.47 `session_commands.cc:465-468`, the range verdict, and the cadence reason with its red state.
- **Census grammar allows the change**: `CORPUS.md:105` lists `on-release`; `scripts/check-sources.mjs:322` accepts it;
  the real table stays clean (129 rows, 0 findings).
- **The cadence argument is discriminating, not conventional**: `scripts/check-release-pins.mjs:19-20,178` builds its
  population from `on-release` cells and `:319` proves a `90d` row is not counted; no gate anywhere computes a day
  cadence (`grep -rn '90d|180d|365d' scripts/*.mjs scripts/*.sh` finds only fixtures). The freeze census is 33
  tag-pinned rows / 30 `on-release` / 3 `90d` (S125, S127, S129), so round 33's "30 of 31" convention argument no
  longer distinguishes S125 — noted as a finding against the carried draft.
- **Found − 1 (low, `number-drift`, about the carried draft, not the lane)**: `draft-3-s125.md` records 90,944 B and
  92,700 B as "body bytes"/committed sizes; those are the base64 envelope sizes. The decoded blobs are 68,207 B and
  69,523 B, and `f3-bytes` hashes the committed file, so only the decoded bytes may be committed.
- **Found − 2 (low, anchor precision)**: at 156 three cited ranges moved (+4/+11/+11). The anchor cell names tag
  `154.0.8037.97`, so it is correct as written; a reader re-deriving at 156 must apply the shift. No supersession
  proposed.
- **f6 independence gap from round 33 is closed**: my 156 fetch is a different seat, process and time, with the same
  digest, and control C1 shows the gate still fails a same-seat record — the pass is not vacuous.

## Out of scope / limits

- The `156.0.8078.47` stable value is taken from the receipt's own trigger (S108 Chromium Dash record, 04:12:21Z); I
  did not re-fetch Chromium Dash.
- `f6` independence remains name-based in the gate; identical code text across tags is not a behavioural guarantee for
  shipped binaries.
- S127/S129 cadences are untouched and unclaimed. I drafted; I did not land — the L1 integrates `s125.md` §5–§6.

## Paths

- Deliverable: `tabi-shokunin/.ufo/waves/round-34/w1/ScribeS125Cadence/s125.md`
- Output dir `tabi-shokunin/.ufo/waves/round-34/w1/ScribeS125Cadence/`: `fetch-receipts.tsv`, `range-map.txt`,
  `diff-154-vs-156-session_commands.cc.patch`, `gate-baseline.json`, `gate-A-red.json`, `gate-B-green.json`,
  `gate-C1-same-seat.json`, `gate-C2-stale-bytes.json`, `gate-C3-drifted.json`, `gate-C3b-drifted-f4.json`,
  `census-B.txt`, `proposed-receipt-row.json`, `proposed-refetch-S125.json`, `proposed-sources-cell.txt`.
- This report: `tabi-shokunin/.ufo/waves/round-34/w1/ScribeS125Cadence.md`
- Scratch `/fast/scratch/hyaku/tabi-r34/ScribeS125Cadence` deleted after the copies (receipts first).
