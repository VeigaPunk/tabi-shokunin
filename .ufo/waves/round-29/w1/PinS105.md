# PinS105 — C3 re-open of registry row S105 at Chromium 156.0.8078.47

Seat: PinS105 (leaf executor, milestone C3). Lane rev read: `97be89bc66139eb45526a04af59a35dccc006eb9`
(baseline `856fa9e1202179f5cfbd28c1f0efdd4eb1f426bb`). Date 2026-10-26 UTC.
Trigger (given, not re-fetched by me): `.ufo/waves/round-29/baseline/chromiumdash-stable-linux.json`
sha256 `90abf2c3efe7df7b3c48521ca754bb24191f7f05b3b60b93ebb735375fd7fe33` → Stable/Linux
`156.0.8078.47` (previous `155.0.8059.84`), chromium commit `1d17a2e2ee147bb7d6ae2ab6abdb3a2510c17775`.

**Verdict: S105 holds — no drift, no supersede row. Both anchored single lines survive at 156.**

## 1. Row and file enumeration

`corpus/SOURCES.md:119` (11 cells; source, anchor, teaches, used-by):

- source cell: one Chromium Gitiles URL — `third_party/blink/public/devtools_protocol/domains/Page.pdl`
  at `refs/tags/154.0.8037.97`.
- anchor cell names **no basenames**: its identifiers (`NavigationType`,
  `Page.frameNavigated.type`, `Page.backForwardCacheNotUsed`, `notRestoredExplanations`) are all
  in-file PDL symbols, so there is nothing to resolve against knowledge entries or a directory
  listing. The only files the used-by entries mention are the same `Page.pdl`
  (`corpus/knowledge/navigation-history-bfcache-evidence.md:4,39-44`;
  `corpus/knowledge/bfcache-runtime-observed-round-25.md:68`).
- Chromium source files for this row: **1** — `third_party/blink/public/devtools_protocol/domains/Page.pdl`.
- Anchor line numbers, as spelled: `decoded line 1345` (single line) and `decoded line 1706`
  (single line). Registry ranges used: `[[1345,1345],[1706,1706]]`.

## 2. Fetches (read-only Gitiles `?format=TEXT`, base64 → `base64 -d`)

```
$ P=third_party/blink/public/devtools_protocol/domains/Page.pdl
$ curl -sS -o "$S/$T.b64" -w '%{http_code}' \
    "https://chromium.googlesource.com/chromium/src/+/refs/tags/$T/$P?format=TEXT"
tag=154.0.8037.97 http=200 b64bytes=82548
decoded=61911 sha256=e944a3b19fa2c87b4ed0a84cca85b16b127618725394496ba046a2dfdf9405be
tag=156.0.8078.47 http=200 b64bytes=83876
decoded=62905 sha256=9eb79e1b6747b462e908d54758474854064d42b8362097542708d11e8c407a11
exit=0
```

| file | old status | new status | old bytes | new bytes |
|---|---|---|---|---|
| `third_party/blink/public/devtools_protocol/domains/Page.pdl` | 200 | 200 | 61911 | 62905 |

Saved (decoded, exact chromium path): `bytes/154.0.8037.97/…/Page.pdl` (61911 B, `e944a3b1…05be`)
and `bytes/156.0.8078.47/…/Page.pdl` (62905 B, `9eb79e1b…7a11`) under this output dir.

## 3. Digest binding — MATCH

The row's source+anchor carry the full 64-hex `e944a3b19fa2c87b4ed0a84cca85b16b127618725394496ba046a2dfdf9405be`.
The 154.0.8037.97 decoded sha256 reproduces it exactly (and the anchor's own counts, 61911 decoded
from a 82548-byte transfer, also reproduce). f5-digest satisfied.

## 4. Range verdicts (154 → 156)

Independent re-implementation of the frozen counter's normalisation (`trim`, collapse inner
whitespace) plus a contiguous-block search — `blockcheck.txt`, exit 0:

| range | 154.0.8037.97 line | 156.0.8078.47 position | verdict |
|---|---|---|---|
| `1345` | `BackForwardCacheRestore` | **1373** | holds |
| `1706` | `experimental event backForwardCacheNotUsed` | **1734** | holds |

Line counts: 154 = 1795 by `wc -l` / 1796 by `split("\n")` (trailing newline; the counter's bound
is this 1796); 156 = 1823 / 1824. Delta +28 lines before the first anchor. No 404 file in this
row, so the absence rule is unused. **No range drifted → no `supersede-row.md`** (item step 6 not
triggered).

`teaches` re-checked at 156 (not required by the counter, done to catch silent semantic drift):
the `NavigationType` enum is still exactly `Navigation` + `BackForwardCacheRestore` (single
`BackForwardCacheRestore` occurrence in the 156 bytes), `frameNavigated` still takes
`experimental NavigationType type`, and `backForwardCacheNotUsed` still requires
`notRestoredExplanations` (no `optional` prefix) at 156:1741 plus optional
`notRestoredExplanationsTree` at 1743. The whole 154→156 diff is four hunks, all outside the
bfcache surface: a `private-state-token` permissions-policy token, a
`Page.frameDetached`-side `optional Network.MonotonicTime monotonicTimestamp`, and
`getAppId`/`getSubApps`/`getSiblingSubApps` with a new `SubApp` type. The row's teaching is
unchanged, so nothing in the citing knowledge entries is wrong at 156 — their line citations
(1345, 1706) are correct for the tag they pin.

## 5. Counter mechanics exercised on a scratch fixture (this row's real entry + real bytes)

Fixture: `D=$(mktemp -d -p "$S") && git -C "$D" init -q`; `git -C "$D" rev-parse --show-toplevel`
verified equal to `$D`; every git call names `-C "$D"`; commits only there. The fixture held the
lane's own S105 registry line, my `entry.json` wrapped as
`{schema:"tabi-release-pins-v1",stable:"156.0.8078.47",rows:[entry]}` at
`corpus/evidence/round-29/release-pins/receipt.json`, and my bytes at the counter's expected
`corpus/evidence/round-29/release-pins/bytes/<tag>/<path>`.

| case (commit) | command | exit | result |
|---|---|---|---|
| no refetch record | `node scripts/check-release-pins.mjs --repo "$D" --rev <R1> --stable 156.0.8078.47 --json` | 1 | `population=1 unresolved=1`, reason `f6-refetch` — r1/f1–f5 all pass |
| refetch by `PinS105` (same seat) | … `--rev <R2>` … | 1 | `unresolved=1`, `f6-refetch` — independence is enforced |
| refetch by another seat (`FixtureRefetch`) | … `--rev <R3>` … | 0 | `population=1 unresolved=0 holds=1 drifted=0 clean=true` |
| old bytes copied in as the 156 bytes, self-consistent sha, genuine refetch | … `--rev <R4>` … | 1 | `unresolved=1`, `f6-refetch` — the cheap copy is caught |
| 156 line 1373 mutated (`BackForwardCacheRestore` → `MutatedRestore`) | … `--rev <R5>` … | 1 | `verdict="drifted"`, `s1-drift-unsuperseded` — the block check is non-vacuous on this row |
| + a `supersedes S105 —` row pinned at `refs/tags/156.0.8078.47` and `superseded_by` set | … `--rev <R6>` … | 0 | `unresolved=0 drifted=1 clean=true` — the fallback path is live if a future tag drifts |

Raw outputs: `receipts/fx-norefetch.json`, `fx-sameseat.json`, `fx-indep.json`, `fx-copyold.json`,
`fx-drift.json`, `fx-superseded.json`. The `FixtureRefetch` record is a mechanical fixture, **not**
the independent re-fetch the claim requires.

## 6. Artifacts written (all under `.ufo/waves/round-29/w1/pins/S105/`)

`entry.json` (`id S105`, `fetched_by PinS105`, `fetched_at 2026-10-26T04:27:27Z`, `superseded_by
null`, one file, ranges `[[1345,1345],[1706,1706]]`), `fetch-log.txt`, `blockcheck.txt`,
`bytes/154.0.8037.97/…/Page.pdl`, `bytes/156.0.8078.47/…/Page.pdl`, `receipts/fx-*.json`.

## Risks / open items for the wave

1. **f6 dependency:** S105 cannot resolve until a seat other than `PinS105` commits
   `corpus/evidence/round-29/release-pins/refetch/S105.json` listing
   `third_party/blink/public/devtools_protocol/domains/Page.pdl` at `156.0.8078.47`, status 200,
   sha256 `9eb79e1b6747b462e908d54758474854064d42b8362097542708d11e8c407a11`. My fixture proves the
   counter stays red without it.
2. **Byte provenance:** the capture seat must copy these exact decoded bytes (no re-encoding, no
   gzip, no trailing newline cropping) or f3-bytes sha fails; sizes are 61911 / 62905.
3. **Knowledge entries:** neither citing entry needs a recheck note (no drift). Both pin the 154
   tag, where their line numbers 1345/1706 remain literally correct; at 156 the same lines sit at
   1373/1734.
4. Tool installs: none (no tool was needed; nothing installed, nothing upgraded).
