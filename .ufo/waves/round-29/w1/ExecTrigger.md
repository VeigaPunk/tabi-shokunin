# ExecTrigger — C3 release trigger (round 29, w1, attempt 1)

Seat: `ExecTrigger` (leaf executor). Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Milestone C3 — independently fetch the Chromium Dash Stable feed for three platforms, confirm the
Linux trigger and its Gitiles tag commit, and draft the S108 registry row.
Baseline `856fa9e1202179f5cfbd28c1f0efdd4eb1f426bb`, lane HEAD read-only `190052c923c6968a3d4a292eb1330938a7cb10b4`;
claims read first from `.ufo/waves/round-29/claims.json` (frozen at `97be89bc`, `frozenBeforeData: true`).

Nothing in the lane was edited. Output dir: `.ufo/waves/round-29/w1/trigger/`.

## Commands run (exact, with exit codes)

```
# 1. three platform feeds (read-only public GET, UA tabi-r29-exec-trigger/1.0)
curl -sS -A "$UA" -o .ufo/waves/round-29/w1/trigger/chromiumdash-stable-linux.json \
  -w '%{http_code}' 'https://chromiumdash.appspot.com/fetch_releases?channel=Stable&platform=Linux&num=3'
  -> 200 (1802 bytes)                                                      exit 0
curl ... platform=Windows ... -> 200 (1808 bytes)                          exit 0
curl ... platform=Mac     ... -> 200 (1796 bytes)                          exit 0

# 2. Linux re-fetch as a reproducibility check (scratch copy, then cmp)
curl ... platform=Linux ... -o $S/linux-refetch.json -w '%{http_code}'     -> 200
cmp $S/linux-refetch.json .ufo/waves/round-29/w1/trigger/chromiumdash-stable-linux.json
  -> identical, exit 0

# 3. Gitiles tag resolution (strip )]}' prefix, then parse commit)
for T in 156.0.8078.47 157.0.8103.15 156.0.8078.48; do
  curl -sS -A "$UA" -o .../gitiles-tag-$T.json.raw -w '%{http_code}' \
    "https://chromium.googlesource.com/chromium/src/+/refs/tags/$T?format=JSON"
  sed "1s/^)]}'//" ...raw > ...json
done
  -> 200 / 200 / 200                                                       exit 0

# 4. baseline comparison
sha256sum .ufo/waves/round-29/baseline/chromiumdash-stable-linux.json
  -> 90abf2c3efe7df7b3c48521ca754bb24191f7f05b3b60b93ebb735375fd7fe33
cmp baseline/chromiumdash-stable-linux.json w1/trigger/chromiumdash-stable-linux.json -> exit 0

# 5. row cell validation
ROW=$(grep -m1 '^| S108 |' row.md); printf '%s\n' "$ROW" | awk -F'|' '{print NF}'
  -> 13  (= 2 edge empties + 11 cells; no pipe inside any cell)
```

## Versions and identity (element 0 of each saved response, verified not paraphrased)

| platform | version (current Stable) | previous_version | milestone | hashes.chromium | Gitiles `refs/tags/<version>` | tag commit |
|---|---|---|---|---|---|---|
| Linux | 156.0.8078.47 | 155.0.8059.84 | 156 | 1d17a2e2ee147bb7d6ae2ab6abdb3a2510c17775 | HTTP 200 | 1d17a2e2ee147bb7d6ae2ab6abdb3a2510c17775 |
| Windows | 157.0.8103.15 | 156.0.8078.49 | 157 | 1aa07b638799e59656559ae6c6649d4b197f555e | HTTP 200 | 1aa07b638799e59656559ae6c6649d4b197f555e |
| Mac | 156.0.8078.48 | 156.0.8078.47 | 156 | d0c02bfad08ec92a6ffcf989e53cd995e6381a4c | HTTP 200 | d0c02bfad08ec92a6ffcf989e53cd995e6381a4c |

Tag `156.0.8078.47` resolves on Gitiles to commit
`1d17a2e2ee147bb7d6ae2ab6abdb3a2510c17775` (tree `f22c00b13ad284786f0a18c1bb1ebf27ed6afcc3`,
author Kevin Ellis `kevers@google.com`, Mon Oct 19 20:07:21 2026, subject `[M156] Use DynamicTo
when downcasting clip path operation to reference clip`) — identical to Linux element 0
`hashes.chromium`. The tag JSON was fetched with `?format=JSON` (HTTP 200), the `)]}'` first line
stripped into `gitiles-tag-156.0.8078.47.json`; the raw prefixed bytes are kept as `.raw`.

The claims' trigger fields are confirmed against fresh bytes: version `156.0.8078.47`,
`previous_version` `155.0.8059.84`, `time` 1792526230889 = 2026-10-20T19:57:10.889Z.

## Digests (all files in `.ufo/waves/round-29/w1/trigger/`, sha256; `sha256.txt` and `digests.txt`)

```
90abf2c3efe7df7b3c48521ca754bb24191f7f05b3b60b93ebb735375fd7fe33  chromiumdash-stable-linux.json
5dd31c96b0dbb0df8968142c5a5667904e1885e50b148d25e724561c0992ecf4  chromiumdash-stable-windows.json
a8d001bdd28cdd0c4bec7c4e0cfa04b871cee1d72eb730d38626c8eaefa1493a  chromiumdash-stable-mac.json
b3fb545f5e0becc64cea5f13ac37b429ad91d9366512f6545fe282b1c7ed35dd  gitiles-tag-156.0.8078.47.json.raw
9c3098a2c55305568359ea1e27e65ab9cc91bc1fad7cabbe7b8a9d7cb08ab6c8  gitiles-tag-156.0.8078.47.json
edb46feac5570c617e88318322f28a9fcf3fb7855795e4d814f36b95cc7e5cc9  gitiles-tag-157.0.8103.15.json.raw
c871ef5e88b0ec59449171ef634d33d1106cd537ed14a44002470b84ec70f458  gitiles-tag-156.0.8078.48.json.raw
```

Access date recorded: `fetched-at.txt` = `2026-10-26T04:48:49Z`; Linux re-fetch at
`2026-10-26T04:49:45Z` (`statuses.txt`). HTTP statuses for every GET are in `statuses.txt`
(all 200). The fresh Linux bytes equal the L1 baseline copy
`.ufo/waves/round-29/baseline/chromiumdash-stable-linux.json` byte for byte (`cmp` exit 0, same
sha256 `90abf2c3…fe33`), so the trigger has not moved between the round opening (04:12:21Z) and
this independent fetch, and the baseline response is reproducible rather than a one-off.

## Drafted row

`w1/trigger/row.md` holds one 11-cell row (id S108, kind dataset, tier A, scope `current Chrome
Stable version per platform, the trigger for re-opening on-release rows pinned to an older
Chromium tag`, anchor naming the JSON field paths `version`/`previous_version`/`milestone`/
`hashes.chromium`/`time` plus the access date 2026-10-26, status mined, opened 2026-10-26,
recheck on-release, used-by `corpus/knowledge/chromium-156-release-pin-recheck.md`). Cell count
verified with awk (13 fields = 11 cells, delimiter pipes only).

Located quote (≤25 words, byte-exact from `chromiumdash-stable-linux.json` at offset 518,
element 0):

> `"previous_version":"155.0.8059.84","time":1792526230889,"version":"156.0.8078.47"`

## Findings the L1 must reconcile (reported, not repaired)

1. **S108 already exists in the tracked registry.** `corpus/SOURCES.md:122` at HEAD carries an
   S108 row written at round-29 opening from the Linux leg only (scope "Which Chrome version is
   the current Stable release on Linux"; anchor 2026-10-26T04:12:21Z, 1802 bytes, sha256
   `90abf2c3…fe33`). It is absent at baseline `856fa9e1`. My draft is therefore a candidate
   replacement of that row's `source`/`scope`/`anchor`/`teaches` cells, not an additional S108
   row; the remaining seven cells already agree. S108 carries no `refs/tags/<A.B.C.D>/` in its
   source cell, so it stays outside the `check-release-pins.mjs` population either way and the
   population stays 23.
2. **The current Stable version is per platform, and the platforms have diverged.** Linux
   element 0 is `156.0.8078.47`, but Windows element 0 is already `157.0.8103.15` (previous
   `156.0.8078.49`) and Mac element 0 is `156.0.8078.48` (previous `156.0.8078.47`). Each of the
   three element-0 `hashes.chromium` values equals the commit its `refs/tags/<version>` names, so
   all three feed rows are internally checkable. The counter's `--stable` takes one version, so
   C3's target remains correctly scoped to the Linux trigger `156.0.8078.47` as the claims fix
   it — but a later re-run with a Windows/Mac current version would move the population. This is
   a scope fact, not a failure, and the drafted row makes it visible instead of asserting one
   global Stable version.
3. Nothing here tested the C3 counter itself: `check-release-pins.mjs` was only read
   (`scripts/check-release-pins.mjs`, sha256 `567637200b05eaf6c4ca750294b6ddc30ce64417c336fe135ab625f8c6fc3770`
   per `baseline/frozen-counter-sha256.txt`), never run — that measurement belongs to the L1 at
   REV.

## Tools / scratch

No installs, no upgrades, no pacman/uv/npx transactions. Scratch `/fast/scratch/hyaku/tabi-r29/ExecTrigger`
held only the Linux re-fetch copy; its digest was recorded and the directory was removed. Only the
three `curl` round-trips above touched the network (read-only GETs of public sources, no
credentials, no cookies, no session material). No tracked lane file, lane index, jj state or
sibling repo was written; git use was read-only (`rev-parse`, `show`).

## Risks

- The Windows 157.0.8103.15 entry is recorded as the feed reports it; the feed is a dataset, not
  a statement about rollout completeness. If the L1 wants the trigger to mean "the tag the
  whole fleet ships", per-platform rows in the feed should be read together, which the drafted
  row's teaches cell now says.
- The Mac/Windows 156 patch tags (`156.0.8078.48`, `156.0.8078.49`) are newer than the tag the 23
  rows are re-opened at; that is inside the claims' stated scope (Linux trigger) and is not a
  defect of this seat.

## Blockers

None.
