# Fetch receipts — S123 independent re-open (seat ReopenS123, round-32 w2)

Tool: curl 8.x, `curl -q -sS --proto =https`, TMPDIR=/fast/scratch/hyaku/tabi-r32/ReopenS123/tmp, host www.rfc-editor.org only.

## F1 primary source (the row's URL)

```
$ cd $S && curl -q -sS --proto =https -o rfc9309.txt -w ... https://www.rfc-editor.org/rfc/rfc9309.txt
URL=https://www.rfc-editor.org/rfc/rfc9309.txt (no redirect; url_effective identical)
HTTP=200
BYTES=25265
UTC=2026-10-26T17:05:18Z
EXIT=0
sha256=f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207  rfc9309.txt
```

Byte-identical to the committed receipts:

```
$ sha256sum .ufo/waves/round-32/w1/ScribeS119/bytes/rfc9309.txt
f633915d…b207  (cmp with my fetch: IDENTICAL)
$ sha256sum corpus/evidence/round-31/decision-table/bytes/S119.txt
f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207  corpus/evidence/round-31/decision-table/bytes/S119.txt
```

So three fetches nine hours apart (round-31 08:36:13Z, round-32 w1 16:02:28Z, this seat 17:05:18Z) returned the same 25,265 B.

## F2 corroboration of the publication month (RFC Editor info page, same host)

```
$ curl -q -sS --proto =https -D - -o /dev/null https://www.rfc-editor.org/info/rfc9309
HTTP/2 301   location: /info/rfc9309/
$ curl -q -sSL --proto =https -o rfc9309-info2.html -w ... https://www.rfc-editor.org/info/rfc9309/
HTTP=200 BYTES=322426 EFF=https://www.rfc-editor.org/info/rfc9309/
UTC=2026-10-26T17:09:39Z
EXIT=0
sha256=d44881fa803fafb292f5ff26cf31399976fbaeae6dab191c48d8da4946e37445  rfc9309-info2.html
```

The page's own metadata states the date independently of the .txt header:

```html
<dt class="font-bold mt-2">Date published</dt><dd>September 2022</dd>
<meta property="article:modified_time" content="2022-09-09">
```
