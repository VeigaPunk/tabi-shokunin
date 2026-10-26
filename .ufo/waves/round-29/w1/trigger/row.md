# S108 — Chromium Dash release trigger, drafted per-platform row (round 29, w1)

Draft only: this file is not the registry. The L1 applies it to `corpus/SOURCES.md`.
Target cell count: 11 (awk -F'|' on the row line = 13 fields), no `|` inside any cell.

```
| S108 | Chromium Dash release feed, Stable channel, Linux, Windows and Mac — https://chromiumdash.appspot.com/fetch_releases?channel=Stable&platform=Linux&num=3 and the same URL with platform=Windows and platform=Mac | dataset | A | current Chrome Stable version per platform, the trigger for re-opening on-release rows pinned to an older Chromium tag | responses fetched 2026-10-26T04:48:49Z, Linux re-fetched 2026-10-26T04:49:45Z byte-identical (cmp exit 0 against the fresh Linux bytes), sizes 1802 Linux / 1808 Windows / 1796 Mac bytes, sha256 90abf2c3efe7df7b3c48521ca754bb24191f7f05b3b60b93ebb735375fd7fe33 Linux, 5dd31c96b0dbb0df8968142c5a5667904e1885e50b148d25e724561c0992ecf4 Windows, a8d001bdd28cdd0c4bec7c4e0cfa04b871cee1d72eb730d38626c8eaefa1493a Mac; JSON array element 0 field paths version, previous_version, milestone, hashes.chromium, time; Gitiles refs/tags/156.0.8078.47 returns HTTP 200 JSON naming commit 1d17a2e2ee147bb7d6ae2ab6abdb3a2510c17775, equal to Linux element 0 hashes.chromium | One read-only GET per platform names the live Stable version and its exact Chromium commit, so an on-release row is re-opened at the tag the feed names instead of a guessed one; Linux element 0 reads 156.0.8078.47 while Windows element 0 already reads 157.0.8103.15, so the current version is a per-platform fact, not a global one | mined | 2026-10-26 | on-release | corpus/knowledge/chromium-156-release-pin-recheck.md |
```

## Located quote (<=25 words, from the saved response bytes)

`"previous_version":"155.0.8059.84","time":1792526230889,"version":"156.0.8078.47"`

Location: `chromiumdash-stable-linux.json`, byte-for-byte inside JSON array element 0, the
adjacent keys `previous_version`, `time` and `version` in that order (verified by substring test
on the raw bytes, `quote_present=True`). Word count: 1 token, 0 internal whitespace — no
paraphrase, the bytes are as served.

## Observed values (element 0 of each saved response)

| platform | version | previous_version | milestone | hashes.chromium | tag resolves to | time (UTC) |
|---|---|---|---|---|---|---|
| Linux | 156.0.8078.47 | 155.0.8059.84 | 156 | 1d17a2e2ee147bb7d6ae2ab6abdb3a2510c17775 | 1d17a2e2ee147bb7d6ae2ab6abdb3a2510c17775 (HTTP 200) | 2026-10-20T19:57:10.889Z |
| Windows | 157.0.8103.15 | 156.0.8078.49 | 157 | 1aa07b638799e59656559ae6c6649d4b197f555e | 1aa07b638799e59656559ae6c6649d4b197f555e (HTTP 200) | 2026-10-22T20:29:23.168Z |
| Mac | 156.0.8078.48 | 156.0.8078.47 | 156 | d0c02bfad08ec92a6ffcf989e53cd995e6381a4c | d0c02bfad08ec92a6ffcf989e53cd995e6381a4c (HTTP 200) | 2026-10-20T19:57:09.680Z |

Every element-0 `hashes.chromium` equals the commit that `refs/tags/<version>` names on Gitiles,
on all three platforms: the feed's own identity field is checkable against the tag it claims.

## Reconciliation with the committed registry (read-only finding)

`corpus/SOURCES.md:122` at HEAD `190052c9` already carries an S108 row, written at round-29
opening from the Linux leg only (scope "Which Chrome version is the current Stable release on
Linux"; anchor cites the 2026-10-26T04:12:21Z fetch, 1802 bytes, sha256 90abf2c3…fe33, committed
at `corpus/evidence/round-29/release-pins/chromiumdash-stable-linux.json`). That row is absent
at baseline `856fa9e1`. The fresh Linux response here is byte-identical to the committed baseline
copy (`cmp` exit 0, same sha256 90abf2c3efe7df7b3c48521ca754bb24191f7f05b3b60b93ebb735375fd7fe33),
so the trigger has not moved since the round opened and the baseline copy is reproducible.

Therefore this draft is a candidate replacement of that row's `source`, `scope`, `anchor` and
`teaches` cells, not a second S108 row: one id must map to one row. The `used-by`, `kind`,
`tier`, `status`, `opened` and `recheck` cells already agree with the committed row.

S108 carries no `refs/tags/<A.B.C.D>/` in its source cell, so it stays outside the
`check-release-pins.mjs` population (population = on-release rows with a tag older than
`--stable`); making it per-platform does not change the count of 23.

## Risk this draft records, not hides

The counter's `--stable` is a single version argument. Linux is at 156.0.8078.47 while Windows is
at 157.0.8103.15 and Mac at 156.0.8078.48, so a re-run with a different platform's current
version would move the population. The 23-row target stays scoped to the Linux trigger
(156.0.8078.47) as the claims fix it; the row now makes the divergence visible instead of
implying one global Stable version.
