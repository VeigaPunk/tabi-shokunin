# SOURCES rows — C2 install provenance (seat ScribeSrcMozRelease, round 35 w1)

Allocated ids: **S138 and S139** (the seat's pair). The item names three sources — the Firefox release directory,
the geckodriver release page, and the Firefox 158.0.1 release notes — so this seat drafted **S140** as the third row
and leaves the renumbering to the L1. At the freeze `a4bfef0f75027c915e715649950b1d46dcb33d83` the registry's
highest id is **S133** (`grep -o -E '^\| S[0-9]+' corpus/SOURCES.md | grep -o -E '[0-9]+' | sort -n | tail -1` → `133`),
and w1's own dispatch gives S134–S135 (geckodriver usage docs) and S136–S137 (Firefox BiDi docs) to sibling seats,
so S138–S140 collide with no committed row.

Duplicate check (CORPUS.md rule 2, census E04) — every drafted URL grepped against the registry at the freeze:

```
$ cd /fast/scratch/hyaku/tabi-r35/ScribeSrcMozRelease/clone && git rev-parse HEAD
a4bfef0f75027c915e715649950b1d46dcb33d83
$ for u in 'ftp.mozilla.org/pub/firefox/releases/158.0.1' 'github.com/mozilla/geckodriver/releases' 'firefox/158.0.1/releasenotes' 'firefox.com'; do printf '%s -> ' "$u"; grep -c "$u" corpus/SOURCES.md; done
ftp.mozilla.org/pub/firefox/releases/158.0.1 -> 0
github.com/mozilla/geckodriver/releases -> 0
firefox/158.0.1/releasenotes -> 0
firefox.com -> 0
$ grep -n -i 'mozilla' corpus/SOURCES.md | cut -c1-60
20:| S006 | WebDriver BiDi modules — MDN — https://developer.mozilla.org/...
21:| S007 | Create a WebDriver BiDi connection — MDN — https://developer.mozilla...
```

`developer.mozilla.org` rows (S006, S007) are a different host and a different scope; no `ftp.mozilla.org`,
`github.com/mozilla/geckodriver`, `www.mozilla.org` or `www.firefox.com` row exists. Three new rows, no supersedes.

## Registry rows (11 columns, `|` never appears inside a cell)

| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |
|---|---|---|---|---|---|---|---|---|---|---|
| S138 | Firefox 158.0.1 release directory — published SHA256SUMS, its detached signature and the release KEY — https://ftp.mozilla.org/pub/firefox/releases/158.0.1/ | docs | A | the published sha256 of linux-x86_64/en-US/firefox-158.0.1.tar.xz and whether that digest carries a Good detached signature under Mozilla's release key; not the build's runtime behaviour, not the installed tree's bytes, no claim about other platforms or locales | release directory fetched 2026-10-26T21:11:51Z (index 7,927 B, sha256 bb07ee85635b5743f1c5a619de44059ef3a3e71ad34cb2324597bb4602c14563); index.html:113,140,149 link KEY, SHA256SUMS and SHA256SUMS.asc; SHA256SUMS 551,210 B sha256 6e1f529f499ece5fb4c0762a3b7e3cf146f977aa83a23586e482c8a3d8a94b38 with 4,921 lines; SHA256SUMS.asc 833 B sha256 f1d7320988b6c825d091b0a5932ab3dd1601232536f4b458987d7a173420584b; gpg 2.4.9 verify exit 0 | The linux-x86_64 en-US 158.0.1 tarball digest is a signed Mozilla fact: SHA256SUMS.asc verifies Good, signature made 2026-10-19T23:59:50Z, under primary key 14F26682D0916CDD81E37B6D61B7B526D98F0353, so an install can be digest-bound to a Mozilla-published release without trusting the download path | mined | 2026-10-26 | on-release | corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md |
| S139 | geckodriver v0.37.1 release assets, published digests and detached signature — https://github.com/mozilla/geckodriver/releases/tag/v0.37.1 | tool | A | which assets the geckodriver v0.37.1 release publishes and their published digests, plus the trust status as of 2026-10-26 of the subkey that signed the linux64 tarball; not geckodriver flags or capabilities (S134–S137) and not a support statement for any Firefox version | release page fetched 2026-10-26T21:11:51Z (200, 200,220 B, sha256 419fc73f6e687d87795426aaaf0fba6f812a020cb5070e6e1a45e0ba033d0fd2) with 11 assets at line 735 and the text 0.37.1 (2026-07-20, 300705c65d1b) at lines 164,170,175; asset list fetched 2026-10-26T21:13:18Z (200, 40,876 B, sha256 df9c6eae063a0bcb5bcac5d99b0d4e1e614e37e5a3c1899c63e59a597ca72c73) lines 64-65, 73, 91-92, 100; linux64 tarball 2,348,355 B sha256 e815130ea95983e162ae91843b48d3a3ce991735635fce83a647afde21e09f7e and its .asc 833 B sha256 ec49082e51f38f71d4df8b6fb826aa339c1c39d94088f2941e9bf4b6d7d49e3f, both equal GitHub's published digests | The .asc verifies Good but by subkey 09BEED63F3462A2DFFAB3B875ECB6497C1A20256, which the release KEY marks revoked (reason 0x02, We no longer trust this key., revocation signed 2026-08-06T11:14:10Z), so geckodriver provenance is digest-bound while the signature carries no current trust | mined | 2026-10-26 | on-release | corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md |
| S140 | Firefox 158.0.1 Release Notes — https://www.mozilla.org/en-US/firefox/158.0.1/releasenotes/ | docs | A | the release's channel, first-offer date and the fixes it lists; not protocol or automation coverage and not the build's behaviour | requested URL answers 301 to https://www.firefox.com/en-US/firefox/158.0.1/releasenotes/?redirect_source=mozilla-org, fetched 2026-10-26T21:11:58Z (200, 104,555 B, sha256 6a6b86ea147a8da7af13b47492d94be3d3f35491f51be715d38cc264b20023d5); line 2287 carries the first-offer sentence, line 46 the page title, the Fixed heading sits at line 2327 and its first item at line 2340 | 158.0.1 is a Release-channel point release first offered 2026-10-20, so the C2 engine pin names a dated public release; its notes ground release identity, never a BiDi or automation coverage claim | mined | 2026-10-26 | on-release | corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md |

## Row notes

- **S138 `kind`.** The release directory is distribution metadata (an index, a checksum manifest, a detached
  signature and a public key), not source and not a document about the browser; `docs` is the nearest of the contract's
  ten kinds and the `scope` cell keeps the tier from spreading to runtime claims.
- **S139 `kind`.** A release page with binaries is the tool's own distribution record; `tool` is used for S053 in this
  registry and is the closest fit. Tier A is scoped to *which assets and digests this release publishes*, never to the
  binary's behaviour.
- **`recheck on-release` is safe here.** `scripts/check-release-pins.mjs:178` builds its population from rows whose
  `recheck` is `on-release` **and** whose source cell carries Chromium Gitiles version tags (`r.tags.some(...)`); none
  of S138–S140 carries a Chromium tag, so no release-pin row is added. Re-opening on the next Firefox release (or the
  next geckodriver release) is the right cadence for a pinned download directory.
- **`used-by` is a forward reference.** `corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md` is the C2 entry
  another w1 seat drafts this round; `scripts/check-sources.mjs` therefore reports `used_by_missing` (E11) until the L1
  lands both files in one revision. Both states are measured in `census-check.txt`.
- **Not established by these rows.** No row here says anything about Firefox's BiDi coverage, geckodriver's flags, or
  the bytes of the installed Firefox tree. The Firefox tarball itself was **not** re-downloaded (89 MB class, and no
  copy survives on the host — `find /home/vgpnk/.local/opt/dl /home/vgpnk/Downloads -iname '*firefox*'` is empty), so
  the installed 158.0.1 tree is tied to S138 only by version and build id
  (`application.ini: Version=158.0.1, BuildID=20261019185856`), which is a coincidence of metadata, not a digest check.
