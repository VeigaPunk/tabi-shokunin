# Commands run — seat ScribeSrcFirefoxRemote (round 35, w1)

Every command below ran with the fleet root as cwd only for `read` greps; all writes went to
`/fast/scratch/hyaku/tabi-r35/ScribeSrcFirefoxRemote` (`$S`, TMPDIR) and this output dir.

## Scratch clone (freeze a4bfef0f)

```console
$ mkdir -p /fast/scratch/hyaku/tabi-r35/ScribeSrcFirefoxRemote && cd $S
$ git clone -q --shared /home/vgpnk/Projects/shokunin/tabi-shokunin clone      # exit 0
$ git -C clone checkout -q --detach a4bfef0f75027c915e715649950b1d46dcb33d83   # exit 0
$ git -C clone rev-parse HEAD            -> a4bfef0f75027c915e715649950b1d46dcb33d83
$ git -C clone rev-parse --show-toplevel -> /fast/scratch/hyaku/tabi-r35/ScribeSrcFirefoxRemote/clone
```

## Fetches (canonical receipts)

```console
$ ts=$(date -u +%Y-%m-%dT%H:%M:%SZ); curl -q -sS --proto =https -o receipt/<f> -w '%{http_code} %{size_download}' <URL>; sha256sum receipt/<f>
2026-10-26T21:13:03Z https://firefox-source-docs.mozilla.org/remote/Prefs.html -> 200 31971 72cd6162cb1e81f44293e71cc67d6b4002a08bdf1c80471250c8c6a4ff9644f1
2026-10-26T21:13:04Z https://developer.mozilla.org/en-US/docs/Web/WebDriver/Reference/BiDi/Modules/browsingContext/locateNodes -> 200 186783 721e6f0c1dd68c019915076285ceb733ccfe6bdc972920b5c8891c65cd45af48
```

Probe fetches (status/bytes only; bodies not cited): see `gate.md` §"Fetches recorded but not
registered". Three of them 404 (RemoteAgent.html 358 B, WebDriverBidi.html 360 B,
SupportedClients.html 363 B) and MDN `…/network/addDataCollector` 404 (88,379 B).

Re-fetch stability:

```console
$ sha256sum fetches/…_Prefs.html receipt/…_Prefs.html
72cd6162…44f1  (both files)
$ curl … locateNodes -> refetch1 200 186783; refetch2 200 186783
721e6f0c…af48  each, equal to the receipt
```

## Quote location and duplicate checks

```console
$ grep -n 'of the CDP support, WebDriver BiDi is the only available protocol' fetches/Prefs.html
297:of the CDP support, WebDriver BiDi is the only available protocol, and the          # exit 0
$ grep -n 'finds the nodes in a' fetches/mdn-browsingContext.locateNodes.html
1506:    <p>The <code>browsingContext.locateNodes</code> … finds the nodes in a <a …>context</a> that match a locator, which specifies the search criteria.</p>  # exit 0
$ grep -n 'firefox-source-docs.mozilla.org' /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md   # no match, exit 1
$ grep -n 'Modules/browsingContext/locateNodes' …/corpus/SOURCES.md                                        # no match, exit 1
$ grep -c 'developer.mozilla.org' …/corpus/SOURCES.md -> 2   (S006 line 20, S007 line 21)
$ grep -c '^| S[0-9]' …/corpus/SOURCES.md -> 133 before the append
```

## Clone edit and validation

```console
$ # edit: append S136, S137 rows after S133, before "## Paths"
$ awk -F'|' 'NR==148||NR==149{print NR": NF="NF}' clone/corpus/SOURCES.md
148: NF=13
149: NF=13                                    # 11 cells after the leading/trailing pipes
$ /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file $S/clone/corpus/SOURCES.md
file	E11	S136 missing used-by corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md
file	E11	S137 missing used-by corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md
file	ok	/fast/…/clone/corpus/SOURCES.md
$ echo $? -> 1                              # 21 pre-existing W04 warnings, 2 E11, no other code
$ : > clone/corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md   # clone-only stub
$ sources-census.sh validate --file $S/clone/corpus/SOURCES.md ; echo $? -> 0   # zero E-codes
$ rm clone/corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md
$ node scripts/check-sources.mjs            # in clone
FINDING id=used_by_missing fleet=E11 row=S136 detail=path_missing
FINDING id=used_by_missing fleet=E11 row=S137 detail=path_missing
SOURCES_GATE verdict=failed rows=135 tiers=A:119,B:7,C:9 status=queued:15,mined:111,rejected:9 findings=2
$ echo $? -> 1                              # rows 133 -> 135, only the pending used-by paths
$ git -C clone status --porcelain -> " M corpus/SOURCES.md"
```

Raw outputs: `census-check.txt`.

## Tools installed or upgraded

None. No browser, no driver, no session was started by this seat.
