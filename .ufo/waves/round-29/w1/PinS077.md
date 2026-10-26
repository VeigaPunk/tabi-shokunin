# PinS077 — C3 re-open of registry row S077 at Chromium 156.0.8078.47

Seat: PinS077 (leaf executor, round-29 w1, C3 freshness)
Lane: /home/vgpnk/Projects/shokunin/tabi-shokunin — baseline 856fa9e1202179f5cfbd28c1f0efdd4eb1f426bb, claims frozen at 97be89bc66139eb45526a04af59a35dccc006eb9
Fetched: 2026-10-26T04:26:22Z
Output dir: .ufo/waves/round-29/w1/pins/S077/

## Verdict

**S077 holds at 156.0.8078.47 — no drift, no supersede row, no recheck notes required.**
The single file the row cites is byte-for-byte identical at the new stable tag (same sha256, same
1440 newline-terminated lines), so all four anchored ranges sit at their original line numbers.
`superseded_by` stays `null`.

## Files and ranges named by the row

Row `corpus/SOURCES.md:91`, 13 split cells, anchor cell verbatim:
`tag \`154.0.8037.97\`, commit \`b510e9d7cd3a2fbd78d0ddc42234103206c5f78d\`; \`form_mcp_schema.cc:49-111,208-490,930-1093,1238-1438\`; decoded SHA-256 \`904b75e7…02152f\``.

| chromium path | anchor line ranges |
|---|---|
| `third_party/blink/renderer/core/html/forms/form_mcp_schema.cc` | `49-111`, `208-490`, `930-1093`, `1238-1438` |

Exactly one Chromium file is cited: the source-cell URL path and the only basename in the anchor are
the same file. The used-by knowledge entry (`corpus/knowledge/webmcp-declarative-validation-round-19.md`)
names no second Chromium file for S077, so no Gitiles directory listing was needed to resolve a basename.

## Fetch results

| tag | HTTP | b64 bytes | decoded bytes | lines (split `\n`) | decoded sha256 |
|---|---|---|---|---|---|
| 154.0.8037.97 | 200 | 68940 | 51703 | 1441 | `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f` |
| 156.0.8078.47 | 200 | 68940 | 51703 | 1441 | `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f` |

Tag resolution (`?format=JSON`, HTTP 200 both): 154.0.8037.97 → `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`
(= the commit the row records); 156.0.8078.47 → `1d17a2e2ee147bb7d6ae2ab6abdb3a2510c17775`.
`cmp` between the two decoded files: identical.

**f5-digest:** the row's 64-hex digest is `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f`;
it equals the 154.0.8037.97 decoded sha256 exactly → **match** (and thereby also the 156 sha256).

## Per-range verdict (counter semantics: line trimmed, inner whitespace runs collapsed, contiguous block)

| range | lines | found in 156.0.8078.47 | verdict |
|---|---|---|---|
| 49-111 | 63 | `49-111` | holds (same line numbers, same bytes) |
| 208-490 | 283 | `208-490` | holds |
| 930-1093 | 164 | `930-1093` | holds |
| 1238-1438 | 201 | `1238-1438` | holds |

All ranges satisfy f4 (1 ≤ a ≤ b ≤ 1441 and the token appears in the anchor cell). No unified diff is
reported because no range drifted; the 154→156 file delta is empty.

## Commands run (read-only GETs)

```
curl -sS -w '%{http_code}' -o "$S/$T/$P.b64" \
  "https://chromium.googlesource.com/chromium/src/+/refs/tags/$T/$P?format=TEXT"
  P=third_party/blink/renderer/core/html/forms/form_mcp_schema.cc
  154.0.8037.97 -> status=200 size=68940, curl exit=0   (re-probe exit=0 http=200)
  156.0.8078.47 -> status=200 size=68940, curl exit=0   (re-probe exit=0 http=200)
base64 -d "$S/$T/$P.b64" > "$S/$T/$P"                    exit=0 both
sha256sum 154…/$P 156…/$P        -> both 904b75e7…2152f  exit=0
wc -l / cmp                     -> 1440 lines each; identical
containment check (python, counter normLine + blockIn semantics) -> 4/4 holds, exit=0
```

Counter mechanics check in a scratch fixture repo (not evidence, labelled as such):

```
D=$(mktemp -d -p "$S" -t fx.XXXX); git -C "$D" init -q
git -C "$D" rev-parse --show-toplevel  -> $D   (verified before first commit)
A: node scripts/check-release-pins.mjs --repo "$D" --rev 3d5557a2… --stable 156.0.8078.47 --json
   exit=1  population=1 unresolved=1  S077 reasons=['f6-refetch …'] verdict=null
B: (plus synthetic refetch label "MechanicsProbe", fixture-only, NOT a real re-fetch)
   exit=0  population=1 unresolved=0 holds=1 drifted=0  S077 reasons=[] verdict="holds"
```

A already passes f1-old-tag, f2-path-bound, f3-bytes (paths + shas), f4-ranges and f5-digest; only
f6-refetch is missing. B shows the same entry resolves and reads `holds` once that record exists, so
`entry.json` needs no further change.

Spot-check of the used-by entry's finer S077 citations against the 156 bytes: `:289-291` = the
custom-element early `return true;`, `:1241` = `IsDisabledOrReadOnly()`, `:1270` =
`FormMCPSchema::IsText(`. All still at the cited numbers.

## Produced files

- `pins/S077/entry.json` — the receipt row (schema as specified; `superseded_by: null`).
- `pins/S077/bytes/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc`
- `pins/S077/bytes/156.0.8078.47/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc`
- `pins/S077/meta/<tag>.form_mcp_schema.cc.b64` — raw Gitiles base64 payloads as received.
- `pins/S077/fetch-log.txt` — commands, statuses, sizes, hashes, containment output.
- `pins/S077/fixture-counter-out.json` — A/B counter output from the scratch fixture.

No `supersede-row.md`: step 6 is conditional on drift and nothing drifted. No recheck note is owed by
the kill rule either (`any drifted row whose citing knowledge entries carry no round-29 recheck note`
is the harm condition; there is no drifted row).

## Outstanding input (not mine to fabricate)

`f6-refetch` still needs `.ufo/waves/round-29/w1/pins/…`-staged then committed
`corpus/evidence/round-29/release-pins/refetch/S077.json` from a **seat other than PinS077**:

```
{"id":"S077","seat":"<other seat>","fetched_at":"<ISO Z>","files":[
 {"path":"third_party/blink/renderer/core/html/forms/form_mcp_schema.cc",
  "tag":"156.0.8078.47","status":200,
  "sha256":"904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f"}]}
```

Also required before the counter can resolve S077: the two byte files must be committed at
`corpus/evidence/round-29/release-pins/bytes/{154.0.8037.97,156.0.8078.47}/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc`
and this entry merged into `corpus/evidence/round-29/release-pins/receipt.json` (currently absent at
baseline; `corpus/evidence/round-29/` does not exist in the tree). I do not write the lane index, so
that commit is a committer seat's step.

## Risks

- Both tags returning the same sha256 is genuine, not a cache artefact: two independent fetches
  (initial + exit-code probe) returned HTTP 200 with 68940-byte payloads, and the 154 sha matches the
  row's independently recorded digest; the fixture run confirms the counter reads the 156 bytes as
  different-from-old only when they are. If a reviewer still suspects staleness, the check is
  `cmp` on the two committed evidence files plus the 156 Gitiles payload hash `1d17a2e2…` tag commit.
- Assuming the row cites one file only; if the L1 intended `html_form_element.cc` or
  `model_context.cc` under S077, those belong to S071's row, not this one.
- No tool installs were needed this seat, so no tool/version/channel record is required.

Scratch `$HYAKU_SCRATCH/tabi-r29/PinS077` left in place only until this report lands; the fixture
repo is under `/fast/scratch/hyaku/tabi-r29/PinS077/fx.JbrW` and contains no lane state.
