# Gate — new registry rows S138, S139, S140 (seat ScribeSrcMozRelease, round 35 w1)

Fragment for `corpus/lessons/round-35.md` §Gate. Every row below was opened by this seat's own read-only HTTPS GET
in this round (2026-10-26), with the fetch recorded by URL, UTC time, HTTP status, byte count and sha256, and one
≤25-word verbatim quote located in the fetched bytes by grep (the grep output is pasted under each row). `patterns`
are not rows; no login, cookie, token or API call was used, and every request was loopback-independent public GET.

Registry state at the freeze `a4bfef0f75027c915e715649950b1d46dcb33d83`: 133 rows, highest id S133. S134–S137 are
w1's sibling seats (geckodriver usage docs; Firefox BiDi docs). This seat was allocated S138–S139; the item lists a
third source (the 158.0.1 release notes), so **S140 is drafted here and left for the L1 to renumber** if the wave
allocates that id elsewhere.

| row | URL | accessed (UTC) | status | bytes | sha256 | ≤25-word located quote | location |
|---|---|---|---|---|---|---|---|
| S138 | https://ftp.mozilla.org/pub/firefox/releases/158.0.1/ | 2026-10-26T21:11:51Z | HTTP 200 | 7,927 | bb07ee85635b5743f1c5a619de44059ef3a3e71ad34cb2324597bb4602c14563 | `dce45470139242cf294eb6ada3d192a9bb334696842b02b71ade448a139eb41a  linux-x86_64/en-US/firefox-158.0.1.tar.xz` | SHA256SUMS:235 of 4,921 lines (sibling fetches: SHA256SUMS 551,210 B sha256 6e1f529f…a94b38; SHA256SUMS.asc 833 B sha256 f1d73209…20584b; KEY 31,916 B sha256 b0c538f0…5b798) |
| S139 | https://github.com/mozilla/geckodriver/releases/tag/v0.37.1 | 2026-10-26T21:11:51Z | HTTP 200 | 200,220 | 419fc73f6e687d87795426aaaf0fba6f812a020cb5070e6e1a45e0ba033d0fd2 | `<span class="text-bold">geckodriver-v0.37.1-linux64.tar.gz.asc</span>` | expanded_assets/v0.37.1:92 (its tarball sibling at :65); the tag page states the release line at :164 |
| S140 | https://www.mozilla.org/en-US/firefox/158.0.1/releasenotes/ | 2026-10-26T21:11:58Z | HTTP 200 | 104,555 | 6a6b86ea147a8da7af13b47492d94be3d3f35491f51be715d38cc264b20023d5 | `Version 158.0.1, first offered to Release channel users on October 20, 2026` | releasenotes.html:2287 (page title at :46; Fixed heading at :2327) |

## Per-row evidence

### S138 — Firefox 158.0.1 release directory

Fetches (all HTTP 200, `curl -q -sS --proto =https`):

```
2026-10-26T21:11:51Z  .../158.0.1/SHA256SUMS      200  551210  sha256 6e1f529f499ece5fb4c0762a3b7e3cf146f977aa83a23586e482c8a3d8a94b38
2026-10-26T21:11:51Z  .../158.0.1/SHA256SUMS.asc  200     833  sha256 f1d7320988b6c825d091b0a5932ab3dd1601232536f4b458987d7a173420584b
2026-10-26T21:11:51Z  .../158.0.1/KEY             200   31916  sha256 b0c538f0f145fa902ac55455d92d4e9a627c2c6865d79c81b280bcb55d75b798
2026-10-26T21:11:51Z  .../158.0.1/  (index)       200    7927  sha256 bb07ee85635b5743f1c5a619de44059ef3a3e71ad34cb2324597bb4602c14563
```

Quoted line, located by grep in the fetched bytes:

```
$ grep -n 'linux-x86_64/en-US/firefox-158.0.1.tar.xz' SHA256SUMS
235:dce45470139242cf294eb6ada3d192a9bb334696842b02b71ade448a139eb41a  linux-x86_64/en-US/firefox-158.0.1.tar.xz
$ wc -l SHA256SUMS
4921 SHA256SUMS
$ grep -nE 'SHA256SUMS|>KEY<' index.html
113:  <td><a href="/pub/firefox/releases/158.0.1/KEY">KEY</a></td>
140:  <td><a href="/pub/firefox/releases/158.0.1/SHA256SUMS">SHA256SUMS</a></td>
149:  <td><a href="/pub/firefox/releases/158.0.1/SHA256SUMS.asc">SHA256SUMS.asc</a></td>
```

**Signature verification, re-run by this seat** with a fresh `GNUPGHOME` under scratch (`verify-gpg.txt`):

```
$ gpg --batch --import KEY
gpg: key 61B7B526D98F0353: 24 signatures not checked due to missing keys
gpg: key 61B7B526D98F0353: public key "Mozilla Software Releases <release@mozilla.com>" imported
$ gpg --batch --verify SHA256SUMS.asc SHA256SUMS
gpg: Signature made Mon 19 Oct 2026 08:59:50 PM -03
gpg:                using RSA key 827E658608679618CD349F93678E455D76767AA3
gpg: Good signature from "Mozilla Software Releases <release@mozilla.com>" [unknown]
gpg: WARNING: This key is not certified with a trusted signature!
Primary key fingerprint: 14F2 6682 D091 6CDD 81E3  7B6D 61B7 B526 D98F 0353
     Subkey fingerprint: 827E 6586 0867 9618 CD34  9F93 678E 455D 7676 7AA3
exit=0
```

So the fingerprint the item names — **14F26682D0916CDD81E37B6D61B7B526D98F0353** — is the *primary* key of
"Mozilla Software Releases <release@mozilla.com>"; the signature itself was made at 2026-10-19T23:59:50Z by its
**subkey** 827E658608679618CD349F93678E455D76767AA3 (RSA-4096, created 2026-08-06, expires 2028-08-05, `sub:-` = valid
in `--with-colons`). A `Good signature … [unknown]` verdict is a cryptographic result, not a trust-path result: the
fresh keyring holds no certification chain, and gpg says so.

### S139 — geckodriver v0.37.1 release

The release page is a shell whose asset list is an `include-fragment` (`:739`
`src="https://github.com/mozilla/geckodriver/releases/expanded_assets/v0.37.1"`), so the asset evidence needs a second
fetch:

```
2026-10-26T21:11:51Z  /mozilla/geckodriver/releases/tag/v0.37.1                    200  200220  sha256 419fc73f6e687d87795426aaaf0fba6f812a020cb5070e6e1a45e0ba033d0fd2
2026-10-26T21:13:18Z  /mozilla/geckodriver/releases/expanded_assets/v0.37.1       200   40876  sha256 df9c6eae063a0bcb5bcac5d99b0d4e1e614e37e5a3c1899c63e59a597ca72c73
2026-10-26T21:11:52Z  .../download/v0.37.1/geckodriver-v0.37.1-linux64.tar.gz.asc  302       0  (redirect, no body)
2026-10-26T21:11:58Z  → release-assets.githubusercontent.com signed URL           200     833  sha256 ec49082e51f38f71d4df8b6fb826aa339c1c39d94088f2941e9bf4b6d7d49e3f
2026-10-26T21:12:28Z  .../download/v0.37.1/geckodriver-v0.37.1-linux64.tar.gz       200 2348355  sha256 e815130ea95983e162ae91843b48d3a3ce991735635fce83a647afde21e09f7e
```

The `302` is recorded by status and byte count, not by sha (QUALITY 93); its target is a short-lived signed URL with
ephemeral query material, so only the host and asset id are recorded here. Two later refetches of the `.asc`
(2026-10-26T21:13:59Z, twice) returned 200 / 833 B / `ec49082e…d49e3f` again, so the asset is stable.

Quoted lines, located by grep:

```
$ grep -n 'geckodriver-v0.37.1-linux64.tar.gz' geckodriver-assets.html
64: <a href="/mozilla/geckodriver/releases/download/v0.37.1/geckodriver-v0.37.1-linux64.tar.gz" ...>
65:   <span class="text-bold">geckodriver-v0.37.1-linux64.tar.gz</span>
73: <clipboard-copy ... value="sha256:e815130ea95983e162ae91843b48d3a3ce991735635fce83a647afde21e09f7e" ...>
91: <a href="/mozilla/geckodriver/releases/download/v0.37.1/geckodriver-v0.37.1-linux64.tar.gz.asc" ...>
92:   <span class="text-bold">geckodriver-v0.37.1-linux64.tar.gz.asc</span>
100:<clipboard-copy ... value="sha256:ec49082e51f38f71d4df8b6fb826aa339c1c39d94088f2941e9bf4b6d7d49e3f" ...>
$ grep -n -o '0\.37\.1 (2026-07-20, 300705c65d1b)' geckodriver-release.html
164:0.37.1 (2026-07-20, 300705c65d1b)
$ sed -n '735,736p' geckodriver-release.html
      <span data-view-component="true" class="f3 text-bold ml-2 tmp-ml-2 mr-2 tmp-mr-2">Assets</span>
      <span title="11" data-view-component="true" class="Counter">11</span>
```

Both my downloaded digests equal the digests GitHub publishes for those assets (tarball `e815130e…e09f7e`,
`.asc` `ec49082e…d49e3f`), and the tarball's single member matches the installed binary byte for byte:

```
$ sha256sum geckodriver-v0.37.1-linux64.tar.gz extract/geckodriver /home/vgpnk/.local/bin/geckodriver
e815130ea95983e162ae91843b48d3a3ce991735635fce83a647afde21e09f7e  geckodriver-v0.37.1-linux64.tar.gz
f831b7e61454804e8a307edd951bf8a5f373efe3f718e75454a6485a51f6e39f  extract/geckodriver
f831b7e61454804e8a307edd951bf8a5f373efe3f718e75454a6485a51f6e39f  /home/vgpnk/.local/bin/geckodriver
$ cmp extract/geckodriver /home/vgpnk/.local/bin/geckodriver ; echo $?
0
$ /home/vgpnk/.local/bin/geckodriver --version | head -1
geckodriver 0.37.1 (300705c65d1b 2026-07-17 09:25 +0000)
```

**The signing subkey is revoked — the finding the L1 asked for.** `gpg --list-packets` on the `.asc` names the
signature's issuer, and the same issuer exists in Mozilla's `KEY` marked revoked:

```
$ gpg --batch --list-packets geckodriver-linux64.tar.gz.asc
:signature packet: algo 1, keyid 5ECB6497C1A20256
	version 4, created 1784280978, md5len 0, sigclass 0x00        # 2026-07-17T09:36:18Z
	hashed subpkt 33 len 21 (issuer fpr v4 09BEED63F3462A2DFFAB3B875ECB6497C1A20256)
$ gpg --batch --with-colons --list-keys | grep '^sub:r'
sub:r:4096:1:5ECB6497C1A20256:1741852797:1804924797:::::s::::::23:
$ gpg --batch --list-packets KEY | sed -n '325,340p'
	subpkt 32 len 563 (signature: v4, class 0x19, algo 1, digest algo 10)
	data: [4096 bits]
# off=22293 ctb=89 tag=2 hlen=3 plen=594
:signature packet: algo 1, keyid 61B7B526D98F0353
	version 4, created 1786014850, md5len 0, sigclass 0x28
	digest algo 10, begin of digest 5d 47
	hashed subpkt 33 len 21 (issuer fpr v4 14F26682D0916CDD81E37B6D61B7B526D98F0353)
	hashed subpkt 2 len 4 (sig created 2026-08-06)
	hashed subpkt 29 len 29 (revocation reason 0x02 (We no longer trust this key.))
	subpkt 16 len 8 (issuer key ID 61B7B526D98F0353)
	data: [4096 bits]
```

(The other signing subkey in the same key, `sub:-:4096:1:678E455D76767AA3:…` — the one that signed S138's
`SHA256SUMS.asc` — lists as valid, not revoked; the distinction is per subkey, not per key.)

and the full verification of the tarball, exit **0** with the caveat printed:

```
$ gpg --batch --verify geckodriver-linux64.tar.gz.asc geckodriver-v0.37.1-linux64.tar.gz
gpg: Signature made Fri 17 Jul 2026 06:36:18 AM -03
gpg:                using RSA key 09BEED63F3462A2DFFAB3B875ECB6497C1A20256
gpg: Good signature from "Mozilla Software Releases <release@mozilla.com>" [unknown]
gpg: WARNING: This subkey has been revoked by its owner!
gpg: reason for revocation: Key has been compromised
gpg: revocation comment: We no longer trust this key.
Primary key fingerprint: 14F2 6682 D091 6CDD 81E3  7B6D 61B7 B526 D98F 0353
     Subkey fingerprint: 09BE ED63 F346 2A2D FFAB  3B87 5ECB 6497 C1A2 0256
exit=0
```

What this row does and does not license, stated for the C2 entry: the **bytes** are bound (published digest = my
download = the installed binary). The **signature** was made by a genuine Mozilla release subkey that Mozilla has
since revoked for compromise (`0x02`, comment "We no longer trust this key.", revocation signature 2026-08-06T11:14:10Z,
i.e. *after* this 2026-07-17 signature). gpg's exit 0 is not evidence of current trust; a receipt must not describe
the geckodriver install as "signature-verified by Mozilla" without that caveat. Subkey 09BEED63… was created
2025-03-13T07:59:57Z and its self-signature claimed a two-year expiry. Separately, the release page dates the release
**2026-07-20** while the binary's own build stamp is **2026-07-17 09:25 +0000** — release date and build date are
different facts and the row states both.

### S140 — Firefox 158.0.1 release notes

```
2026-10-26T21:11:52Z  https://www.mozilla.org/en-US/firefox/158.0.1/releasenotes/   301       0  (redirect, no body)
2026-10-26T21:11:58Z  → https://www.firefox.com/en-US/firefox/158.0.1/releasenotes/?redirect_source=mozilla-org
                                                                                   200  104555  sha256 6a6b86ea147a8da7af13b47492d94be3d3f35491f51be715d38cc264b20023d5
$ grep -n 'Version 158.0.1, first offered' releasenotes.html
2287:                    <div class="c-release-first-title fl-heading fl-heading-xs fl-u-font-semibold">Version 158.0.1, first offered to Release channel users on October 20, 2026</div>
$ grep -n '<title>' releasenotes.html
46:    <title>Firefox  158.0.1, See All New Features, Updates and Fixes</title>
$ grep -n 'Fixed' releasenotes.html | head -2
2327:                            Fixed
2353:      <p>Fixed an issue where pages would unexpectedly scroll back to the top when selecting text. ...
```

The registered URL is the `www.mozilla.org` one the item names; the bytes and digest above are the redirected body
at `www.firefox.com`, which is why the row's URL cell and anchor both record the 301 and the effective URL rather than
pretending the mozilla.org URL served the content.

## Certificate of the drafts

- Rows drafted: 3 (S138 docs/A, S139 tool/A, S140 docs/A), all `mined`, opened 2026-10-26, recheck `on-release`,
  used-by `corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md`.
- Duplicate check: greps and outputs in `rows.md` §Duplicate check — 0 hits for all three host paths, 0 hits for
  `firefox.com`; highest id at the freeze is S133.
- Structural validation: `sources-census.sh validate` and the lane's own `scripts/check-sources.mjs`, both states
  (used-by path absent / present), are in `census-check.txt`.
- Nothing in this fragment was obtained from a browser session: all three rows are static public-GET evidence, and
  no C2 runtime claim rests on them.
