# ScribeSrcMozRelease — C2 install provenance sources (round 35, w1, milestone C2-sources)

**Verdict.** The three C2 install-provenance sources are opened, quoted and structurally validated, and nothing is a
duplicate. I drafted registry rows **S138** (`https://ftp.mozilla.org/pub/firefox/releases/158.0.1/` — SHA256SUMS,
SHA256SUMS.asc, KEY), **S139** (`https://github.com/mozilla/geckodriver/releases/tag/v0.37.1` — asset list and the
`.asc`) and **S140** (`https://www.mozilla.org/en-US/firefox/158.0.1/releasenotes/`) — the seat was allocated S138–S139,
the item names three sources, so S140 is flagged for the L1 to renumber. Every fetch has URL, UTC time, HTTP status,
byte count and sha256; every quote was located by grep in the fetched bytes and the grep is pasted. Re-running
`gpg --verify` myself with a fresh `GNUPGHOME` under scratch: the **Firefox `SHA256SUMS.asc` verifies Good, exit 0**,
signature made 2026-10-19T23:59:50Z by **subkey `827E658608679618CD349F93678E455D76767AA3`** under primary
**`14F26682D0916CDD81E37B6D61B7B526D98F0353`** — so the item's fingerprint is the primary key, not the signing key — and
the **geckodriver v0.37.1 `.asc` verifies Good, exit 0, but by subkey `09BEED63F3462A2DFFAB3B875ECB6497C1A20256`,
which Mozilla's own KEY marks revoked** (`sub:r`, reason 0x02, "We no longer trust this key.", revocation signed
2026-08-06T11:14:10Z, i.e. after the 2026-07-17 signature), with gpg printing `WARNING: This subkey has been revoked by
its owner!` / `reason for revocation: Key has been compromised`. The geckodriver *bytes* are still bound — the tarball's
sha256 equals GitHub's published digest and its member is byte-identical to the installed binary — but the C2 entry
must not describe that install as "Mozilla-signature-verified" without the revocation caveat. Structural validation in
my scratch clone: `sources-census.sh validate` exits **1 with exactly three E11 `path_missing` lines** while the
round-35 knowledge entry is absent and **0** (`file ok`, only the 20 pre-existing W04 warnings) with it present;
`scripts/check-sources.mjs` goes `verdict=failed findings=3` → `verdict=clean rows=136 findings=0`, i.e. the three rows
are structurally clean and only wait on the entry another seat drafts.

## Evidence

All in a `--shared` clone of the lane at the freeze; the lane checkout, its index and jj state were never touched.

```
$ git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone" && git -C "$S/clone" checkout -q --detach a4bfef0f75027c915e715649950b1d46dcb33d83
$ git -C "$S/clone" rev-parse HEAD
a4bfef0f75027c915e715649950b1d46dcb33d83
$ git -C "$S/clone" rev-parse --show-toplevel
/fast/scratch/hyaku/tabi-r35/ScribeSrcMozRelease/clone
```

**Duplicate check (CORPUS.md rule 2 / census E04), in the clone at the freeze** — 0 hits on every drafted host path,
and the registry's highest id is S133 (`rows.md:10-27` carries the greps):

```
ftp.mozilla.org/pub/firefox/releases/158.0.1 -> 0
github.com/mozilla/geckodriver/releases       -> 0
firefox/158.0.1/releasenotes                  -> 0
firefox.com                                   -> 0
highest id = 133
```

**Fetches** (`curl -q -sS --proto =https`, full table in `fetch-log.tsv`):

| source | UTC | HTTP | bytes | sha256 |
|---|---|---|---|---|
| 158.0.1 index | 2026-10-26T21:11:51Z | 200 | 7,927 | `bb07ee85…2c14563` |
| 158.0.1 SHA256SUMS | 2026-10-26T21:11:51Z | 200 | 551,210 | `6e1f529f…d8a94b38` |
| 158.0.1 SHA256SUMS.asc | 2026-10-26T21:11:51Z | 200 | 833 | `f1d73209…3420584b` |
| 158.0.1 KEY | 2026-10-26T21:11:51Z | 200 | 31,916 | `b0c538f0…55d75b798` |
| geckodriver v0.37.1 tag page | 2026-10-26T21:11:51Z | 200 | 200,220 | `419fc73f…a033d0fd2` |
| geckodriver expanded_assets | 2026-10-26T21:13:18Z | 200 | 40,876 | `df9c6eae…97ca72c73` |
| geckodriver linux64 `.asc` | 2026-10-26T21:11:52Z → 21:11:58Z | 302 → 200 | 0 → 833 | `ec49082e…bf4b6d7d49e3f` |
| geckodriver linux64 tarball | 2026-10-26T21:12:28Z | 200 | 2,348,355 | `e815130e…de21e09f7e` |
| 158.0.1 release notes | 2026-10-26T21:11:52Z → 21:11:58Z | 301 → 200 | 0 → 104,555 | `6a6b86ea…64b20023d5` |

The two 302/301 rows are recorded by status and byte count with no digest (QUALITY 93). The release-notes URL the item
names redirects to `www.firefox.com/en-US/firefox/158.0.1/releasenotes/?redirect_source=mozilla-org`; the registered URL
stays the mozilla.org one and the anchor records the redirect and the effective URL instead of pretending mozilla.org
served the body. The `.asc` was refetched twice at 2026-10-26T21:13:59Z with the same 833 B / `ec49082e…` result.

**Quotes, each located by grep in the fetched bytes** (`gate.md:15-17` table, greps at `:21-66`, `:67-166`, `:167-185`):

- S138 — `SHA256SUMS:235` (of 4,921 lines): `dce45470139242cf294eb6ada3d192a9bb334696842b02b71ade448a139eb41a  linux-x86_64/en-US/firefox-158.0.1.tar.xz`
- S139 — `expanded_assets/v0.37.1:92`: `<span class="text-bold">geckodriver-v0.37.1-linux64.tar.gz.asc</span>` (the
  tarball sibling at `:65`; the tag page's own release line at `:164`: `0.37.1 (2026-07-20, 300705c65d1b`), 11 assets
  declared at `:735-736`)
- S140 — `releasenotes.html:2287`: `Version 158.0.1, first offered to Release channel users on October 20, 2026`

**Signature verification, re-run by this seat** (`verify-gpg.txt`, gpg 2.4.9, fresh `GNUPGHOME` under my scratch):

```
$ gpg --batch --import KEY                     # exit 0, key 61B7B526D98F0353 "Mozilla Software Releases <release@mozilla.com>"
$ gpg --batch --verify SHA256SUMS.asc SHA256SUMS
gpg: Good signature from "Mozilla Software Releases <release@mozilla.com>" [unknown]
Primary key fingerprint: 14F2 6682 D091 6CDD 81E3  7B6D 61B7 B526 D98F 0353
     Subkey fingerprint: 827E 6586 0867 9618 CD34  9F93 678E 455D 7676 7AA3
exit=0
$ gpg --batch --verify geckodriver-linux64.tar.gz.asc geckodriver-v0.37.1-linux64.tar.gz
gpg: Good signature from "Mozilla Software Releases <release@mozilla.com>" [unknown]
gpg: WARNING: This subkey has been revoked by its owner!
gpg: reason for revocation: Key has been compromised
gpg: revocation comment: We no longer trust this key.
     Subkey fingerprint: 09BE ED63 F346 2A2D FFAB  3B87 5ECB 6497 C1A2 0256
exit=0
$ gpg --batch --with-colons --list-keys | grep '^sub:r'
sub:r:4096:1:5ECB6497C1A20256:1741852797:1804924797:::::s::::::23:
$ sha256sum geckodriver-v0.37.1-linux64.tar.gz extract/geckodriver /home/vgpnk/.local/bin/geckodriver
e815130ea95983e162ae91843b48d3a3ce991735635fce83a647afde21e09f7e  geckodriver-v0.37.1-linux64.tar.gz   # = GitHub's published digest
f831b7e61454804e8a307edd951bf8a5f373efe3f718e75454a6485a51f6e39f  extract/geckodriver
f831b7e61454804e8a307edd951bf8a5f373efe3f718e75454a6485a51f6e39f  /home/vgpnk/.local/bin/geckodriver
$ cmp extract/geckodriver /home/vgpnk/.local/bin/geckodriver ; echo $?
0
$ /home/vgpnk/.local/bin/geckodriver --version | head -1
geckodriver 0.37.1 (300705c65d1b 2026-07-17 09:25 +0000)
```

Two further facts worth carrying into the C2 entry, both measured: gpg's `Good signature … [unknown]` is a
cryptographic result with no certification path in a fresh keyring (the import itself reports `24 signatures not
checked due to missing keys`), and the **release date and build date differ** — the release page says 2026-07-20 while
the binary's build stamp is 2026-07-17 09:25 +0000, one day after the signing date 2026-07-17T09:36:18Z.

**Structural validation** (`census-check.txt`, clone at the freeze; validator
`/home/vgpnk/Projects/shokunin/scripts/sources-census.sh` sha256 `3fb72615…9d4a64e30`):

```
state 1  pristine 133 rows                     : validate exit=0 (20 pre-existing W04 only, `file ok`)
                                                check-sources verdict=clean rows=133 findings=0 exit=0
state 2  3 rows spliced after S133, no entry    : validate exit=1, exactly three lines
            file E11 S138 missing used-by corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md
            file E11 S139 missing used-by corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md
            file E11 S140 missing used-by corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md
                                                check-sources verdict=failed rows=136 findings=3 exit=1
state 3  + stub knowledge entry (scratch only)  : validate exit=0, `file ok` (W04 unchanged)
                                                check-sources verdict=clean rows=136 findings=0 exit=0
```

No new E or W code beyond the three expected E11s appears in state 2, so the rows are individually well-formed; the
spliced lines were verified byte-identical to the ones in `rows.md` (`diff` empty). Recheck is `on-release`, which is
safe: `scripts/check-release-pins.mjs:178` only takes rows whose recheck is `on-release` **and** whose source cell
carries Chromium Gitiles version tags, and none of S138–S140 does.

## Touched surfaces

Written (report + own output dir only): this file and
`.ufo/waves/round-35/w1/ScribeSrcMozRelease/{rows.md,gate.md,fetch-log.tsv,verify-gpg.txt,census-check.txt,fetches/*}`.
Read-only elsewhere: the lane checkout, the freeze clone (my scratch), `~/.local/bin/geckodriver --version`,
`~/.local/opt/firefox-158.0.1/{application.ini,platform.ini}`. No lane tracked file, lane index, fleet file,
`~/.local/bin` entry, sibling repo or `/home/vgpnk/Projects/shokuknow` was modified; no browser, driver or pacman
transaction was started; scratch `/fast/scratch/hyaku/tabi-r35/ScribeSrcMozRelease` was deleted after the receipts
were copied.

## Out of scope / limits

- **The installed Firefox tree is not digest-verified.** I did not re-download `firefox-158.0.1.tar.xz` (89 MB class)
  and no copy survives on this host, so S138 binds the *published* tarball, while the installed tree is tied to it only
  by `application.ini: Version=158.0.1, BuildID=20261019185856` — metadata coincidence, not a hash check. Stated in
  `rows.md` row note.
- **The geckodriver revocations are a trust finding, not a bytes finding.** Digest equality is intact; the signature's
  subkey is revoked for compromise. Whether the C2 receipt may say "signature-verified" is the L1's call; my evidence
  says it must carry the caveat.
- **Id allocation.** S138–S140 collide with nothing at the freeze, but w1 gave sibling seats S134–S137; if the wave
  hands 140 elsewhere the L1 renumbers as the item allows.
- Not mine to do: the knowledge entry itself (`corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md`), the gate
  rows splice into `corpus/lessons/round-35.md`, and any runtime claim about Firefox — no browser was launched by this
  seat, so nothing here is runtime evidence.

## Deliverables

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/ScribeSrcMozRelease.md` — this report
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/ScribeSrcMozRelease/rows.md` — the 11-column
  registry rows (`:32-34`), duplicate-check greps, row notes
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/ScribeSrcMozRelease/gate.md` — `## Gate` fragment:
  8-column table (`:15-17`), per-row greps and the gpg transcript quotes (`:21-185`)
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/ScribeSrcMozRelease/fetch-log.tsv` — every fetch,
  UTC/status/bytes/sha256, including the two digest-less redirects
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/ScribeSrcMozRelease/verify-gpg.txt` — gpg 2.4.9
  transcript (import, both verifies, packet dumps, digests, `cmp`)
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/ScribeSrcMozRelease/census-check.txt` —
  `sources-census.sh validate` and `check-sources.mjs` in all three states
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/ScribeSrcMozRelease/fetches/` — the nine fetched
  objects (SHA256SUMS, SHA256SUMS.asc, KEY, index.html, geckodriver tag page, expanded_assets, the `.asc`, the linux64
  tarball, the release-notes body); digests re-checked after copying
