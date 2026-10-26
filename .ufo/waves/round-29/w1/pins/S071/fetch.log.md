# S071 fetch log — commands, HTTP statuses, exit codes

Seat PinS071, 2026-10-26. Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Registry row read at baseline `856fa9e` (also lane tip content; `corpus/SOURCES.md:85`).
No credentials, cookies or logins; read-only public HTTPS GETs only.

## 1. Byte fetch (Chromium Gitiles `?format=TEXT`, base64 carrier)

```
$ cd .ufo/waves/round-29/w1/pins/S071
$ for tag in 154.0.8037.97 156.0.8078.47; do
    for p in third_party/blink/renderer/core/html/forms/form_mcp_schema.cc \
             third_party/blink/renderer/core/html/forms/html_form_element.cc \
             third_party/blink/renderer/core/script_tools/model_context.cc; do
      code=$(curl -sS -o "meta/$tag.$(basename "$p").b64" -w '%{http_code}' \
        "https://chromium.googlesource.com/chromium/src/+/refs/tags/$tag/$p?format=TEXT")
      [ "$code" = 200 ] && base64 -d "meta/$tag.$(basename "$p").b64" > "bytes/$tag/$p"
    done
  done
```

Loop exit `0`. Per-file results (curl exit 0 each; `base64 -d` exit 0 each):

| tag | file | http | carrier B | decoded B | decoded sha256 | git blob |
|---|---|---|---|---|---|---|
| 154.0.8037.97 | third_party/blink/renderer/core/html/forms/form_mcp_schema.cc | 200 | 68940 | 51703 | 904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f | 9c546c66839da38bde273f5dd43042ff9785ce76 |
| 154.0.8037.97 | third_party/blink/renderer/core/html/forms/html_form_element.cc | 200 | 91040 | 68278 | 8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916 | cd7efa45834bfce0697b06c7092f16d084c4eb55 |
| 154.0.8037.97 | third_party/blink/renderer/core/script_tools/model_context.cc | 200 | 66824 | 50117 | 474083d6c455f31071fd5356d4ebcaeae4f173ee647009e452228350d6c18823 | c5ef637f8e676ecc56050982a07f1c8e9056218c |
| 156.0.8078.47 | third_party/blink/renderer/core/html/forms/form_mcp_schema.cc | 200 | 68940 | 51703 | 904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f | 9c546c66839da38bde273f5dd43042ff9785ce76 |
| 156.0.8078.47 | third_party/blink/renderer/core/html/forms/html_form_element.cc | 200 | 92716 | 69536 | 2a96a97bfb4246b7a23895be7548533ce7adc32286f10df36831e370f8f86102 | b3611221ba58efc420f5fa627aa30b14a75b4a77 |
| 156.0.8078.47 | third_party/blink/renderer/core/script_tools/model_context.cc | 200 | 68152 | 51112 | 94d0863626e1e8b5fbba616e0b01c11f48cb4d530e09ff2073ea172cd3238aa3 | 0ed6a007777b5d285e6cb5f38082c4ebe5024472 |

Carrier (base64 as served) sha256, for the same order:
`290b093eb67d181161dac25aac727747d382c28ba621cbff95e21a008884aa94`,
`ff55d51149ec4d3f320f43c2ea6a9a4d78798360f71e78d1f1df00c6ea6519ed`,
`039e24a0a9548ae615c9defd65fc57b83beea14c9211205712d832172365d24d`,
`290b093eb67d181161dac25aac727747d382c28ba621cbff95e21a008884aa94`,
`b7a3fae87d610da26729b4d011bcacc7a3015dda74369b6a44e7cbf082686886`,
`c183ba74553eb95031d85615f14f08010eff3c35da3f089d992a06f77b3adb10`.

`git hash-object` of every decoded body (`$? = 0` each) equals the blob id the Gitiles tree
lists for that path at that tag, so the saved bytes are the exact tree objects.

## 2. Path resolution for bare basenames (`?format=JSON` tree listings)

```
$ for d in third_party/blink/renderer/core/script_tools third_party/blink/renderer/core/html/forms; do
    for tag in 154.0.8037.97 156.0.8078.47; do
      curl -sS -o "meta/listing.$tag.$(basename $d).json" -w '%{http_code}' \
        "https://chromium.googlesource.com/chromium/src/+/refs/tags/$tag/$d/?format=JSON"
    done
  done
```

All four: `http=200`, curl exit 0. Blob ids read out of the listings (`$? = 0`):

- `script_tools/` 154: `model_context.cc` = `c5ef637f8e676ecc56050982a07f1c8e9056218c`; 156: `0ed6a007777b5d285e6cb5f38082c4ebe5024472`
- `html/forms/` 154: `html_form_element.cc` = `cd7efa45834bfce0697b06c7092f16d084c4eb55`, `form_mcp_schema.cc` = `9c546c66839da38bde273f5dd43042ff9785ce76`
- `html/forms/` 156: `html_form_element.cc` = `b3611221ba58efc420f5fa627aa30b14a75b4a77`, `form_mcp_schema.cc` = `9c546c66839da38bde273f5dd43042ff9785ce76`

`model_context.cc` also resolves through the lane's own records: 932 path hits for
`third_party/blink/renderer/core/script_tools/model_context.cc`, and SOURCES S042 records the same
154 blob `c5ef637f` and the same abbreviated digest `474083d6…8823`.

## 3. Range analysis

`python3 checkranges.py` (scratch, `$? = 0`): per anchored block, old lines trimmed and
inner-whitespace-collapsed, searched for a contiguous occurrence in the new file. Output saved as
`ranges.json`.

Aligned region diffs:

```
$ diff -u <(sed -n '192,258p'  154.../html_form_element.cc) <(sed -n '193,269p' 156.../html_form_element.cc)   # exit 1 (differences), 1 hunk, 10 lines added
$ diff -u <(sed -n '752,811p'  154.../model_context.cc)    <(sed -n '748,807p' 156.../model_context.cc)        # exit 1 (differences), 1 hunk, 1 line changed
```

Saved as `diffs/html_form_element.cc.192-258.diff` and `diffs/model_context.cc.752-811.diff`.

## 4. Counter wiring proof (fixture only — not the required independent re-fetch)

```
$ D=$(mktemp -d -p "$S" fixture.XXXXXX); git -C "$D" init -q
$ test "$(git -C "$D" rev-parse --show-toplevel)" = "$D"   # -> toplevel_ok, exit 0
$ git -C "$L" show 856fa9e:corpus/SOURCES.md > "$D/corpus/SOURCES.md"    # exit 0, 90387 B
$ cp bytes/<tag>/<path> "$D/corpus/evidence/round-29/release-pins/bytes/<tag>/<path>"   # exit 0 x6
$ # fixture receipt = entry.json with superseded_by S900; fixture refetch seat "FixtureRefetch"; draft row appended
$ node scripts/check-release-pins.mjs --repo "$D" --rev HEAD --stable 156.0.8078.47 --json
```

Result (`$? = 1`, expected: the other 22 population rows have no receipt):

```
{"population":23,"unresolved":22,"holds":0,"drifted":1,
 "S071":{"id":"S071","resolved":true,"verdict":"drifted","reasons":[]}}
```

Full output: `wiring-proof-counter.json`. First fixture run used the literal placeholder `S1NN`
and produced `S071 ... "reasons":["s1-drift-unsuperseded"]`, because the registry row regex
`^ {0,3}\|\s*S\d{3,}\s*\|` accepts digits only — the allocated id must be numeric.

That fixture's `refetch/S071.json` was written by this seat, so it satisfies f6's shape check and
nothing else. The real `corpus/evidence/round-29/release-pins/refetch/S071.json` must be written
by a different seat; nothing from the fixture may be landed.
