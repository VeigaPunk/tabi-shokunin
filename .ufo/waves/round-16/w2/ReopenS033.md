# Reopen S033 — Chromium 154 `model_context_supplement.idl`

Seat: `TabiR16.ReopenS033` (author-side re-open; **not** non-author certification).
Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`, snapshot
`b444ca8e024f386124418169e8e400221524bba3` (= `git rev-parse HEAD`; log:
`b444ca8 round-16: repair C2 counter fixture-path read; retain first failing measurement`,
`8f7feb3 round-16: measurement-binding gate, native WebMCP loopback capability, sources and wave-1 evidence`).
Accessed 2026-10-20. Read-only on the lane; all working files under `/tmp`. No tool installs.

**Verdict: HOLDS.** The row's `teaches` is grounded by lines 7–12 of the pinned blob; the sha256,
commit, line anchor, kind, tier, scope and status are all honest under CORPUS.md §SOURCES
contract v1. One adjacent contract artifact (the round-16 lesson's `## Gate`, rule 1) is absent
at this snapshot — reported separately as UNPROVEN, not charged to the row.

## 1. Attack item and command

Attack: does the S033 row at `corpus/SOURCES.md:47` survive a same-session re-open of its URL,
and do `kind` / `tier` / `scope` (plus `anchor`, `teaches`, `status`, `opened`, `recheck`,
`used-by`) stay honest per `/home/vgpnk/Projects/kimi-shokunin/skills/shokunin/protocol/CORPUS.md:64-155`?

Row bytes (read verbatim, `awk 'NR==47' corpus/SOURCES.md`):

```
| S033 | Chromium 154 model_context_supplement.idl — https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/script_tools/model_context_supplement.idl | code | A | Where Chromium 154 exposes the ModelContext attribute and how it is gated | tag 154.0.8037.97 (commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d), lines 7-12, sha256 50dd337d…6364 | The 154 build declares modelContext on Document, SecureContext, RuntimeEnabled=WebMCP; there is no Navigator partial | mined | 2026-10-20 | on-release | corpus/knowledge/webmcp-chromium-loopback-round-16.md |
```

Open exactly the row URL (Gitiles serves the blob base64 under `?format=TEXT`):

```sh
curl -sSL --max-time 60 "https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/script_tools/model_context_supplement.idl?format=TEXT" -o /tmp/s033.b64
base64 -d /tmp/s033.b64 > /tmp/s033.idl
sha256sum /tmp/s033.idl; wc -lc /tmp/s033.idl
```

Observed:

```
50dd337d33c38403c60084fa8c716c9d8e2c01ff26405e331408c122ef906364  /tmp/s033.idl
 13 389  /tmp/s033.idl
```

The row's elided digest `50dd337d…6364` = first 8 hex `50dd337d` + last 4 `6364` of that
digest — match. Exact row URL without `?format=TEXT` also resolves:
`row-URL http=200 bytes=12355` (HTML viewer); `plain-text http=200 bytes=520` (base64, the 389-byte file).

## 2. Quote (≤25 words) and location

Location: `model_context_supplement.idl`, tag `154.0.8037.97`, **lines 7–12** (attribute itself on
line 11), access 2026-10-20. Quote, 12 whitespace-separated tokens:

> `[RuntimeEnabled=WebMCP, ImplementedAs=ModelContextSupplement] partial interface Document { [SecureContext, SameObject] readonly attribute ModelContext modelContext;`

Decoded file, numbered (`cat -n /tmp/s033.idl`, lines 1–13; lines 7–12 verbatim):

```
     7  [
     8    RuntimeEnabled=WebMCP,
     9    ImplementedAs=ModelContextSupplement
    10  ] partial interface Document {
    11    [SecureContext, SameObject] readonly attribute ModelContext modelContext;
    12  };
```

This grounds the row's `teaches` sentence-for-sentence: `modelContext` is declared on a
`partial interface Document`; the interface block carries `RuntimeEnabled=WebMCP`; the attribute
carries `SecureContext` (plus `SameObject`, unmentioned but non-contradicting).

## 3. Revision anchor

```sh
curl -sSL "https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97?format=JSON" | sed '1d'
```

Observed `commit: b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`, committer time
`Wed Sep 30 21:20:00 2026` — byte-identical to the row's commit. Git blob id at the tag is
`c954510d188abb6fb21542e7a60127608650d48c`, which matches the already-recorded lane evidence
`.ufo/waves/round-16/w1/SrcChromiumIdl.md:41` (blob + full sha256 both match).

## 4. Negative claim — "there is no Navigator partial"

The row asserts a build-wide negative. Tested statically over **every Blink renderer IDL at the
tag**, then corroborated at runtime from the lane's own committed receipt.

### 4a. Static sweep (Gitiles subtree archives at `refs/tags/154.0.8037.97`)

```sh
for d in core modules bindings controller extensions platform build; do
  curl -sSL -o /tmp/$d.tgz "https://chromium.googlesource.com/chromium/src/+archive/refs/tags/154.0.8037.97/third_party/blink/renderer/$d.tar.gz"
  mkdir -p /tmp/blink$d && tar xzf /tmp/$d.tgz -C /tmp/blink$d
done
find /tmp/blink{core,modules,bindings,controller,extensions,platform} -name '*.idl' | wc -l
grep -rniE "modelContext|ModelContext" --include='*.idl' /tmp/blink{core,modules,bindings,controller,extensions,platform}
grep -rlniE "modelContext" --include='*.idl' /tmp/blink{core,modules,bindings,controller,extensions,platform} \
  | xargs -r grep -lE "interface[[:space:]]+Navigator"
```

Observed:

```
IDL counts: core 890, modules 1345, build 0, remaining four subtrees 4 (total 2239)
modelContext hits: only /tmp/blinkcore/script_tools/{model_context.idl,model_context_supplement.idl,model_context_tool.idl}
files with modelContext that also declare interface Navigator: NONE
'partial interface Navigator' files present in tree: 46
```

No `Navigator` partial anywhere in Blink renderer IDL names `modelContext`; the only files that do
are the three `core/script_tools` IDLs. Grep was case-insensitive and hits the attribute name as
well as the type name, so a partial written as `readonly attribute any modelContext` would have
matched. `renderer/build` carries zero `.idl`.

### 4b. Runtime corroboration (lane receipt, same 154 build)

`corpus/evidence/round-16/webmcp/receipt.json` (runtime `Chrome/154.0.8037.97`), case
`model-context-location`, `status: pass`:

```json
"actual": {
 "documentModelContextType": "object",
 "documentOwnProperty": false,
 "navigatorHasModelContext": false,
 "navigatorModelContextType": "undefined",
 "isSecureContext": true
},
"detail": "document.modelContext=object (own=false); 'modelContext' in navigator=false; isSecureContext=true"
```

Static absence and measured absence agree; S038/S039's rejected `navigator.modelContext` premise is
consistently contradicted by this row, not supported.

## 5. Field-by-field contract check (CORPUS.md §SOURCES contract v1, lines 64–155)

| Field | Row value | Contract requirement | Verdict |
|---|---|---|---|
| `id` | `S033` | `S` + 3+ digits, never reused | HOLDS — first appears in `8f7feb3` (`git log -S "S033" -- corpus/SOURCES.md`), no prior id |
| `source` | title + canonical commit-pinned Gitiles URL | canonical URL, never bare homepage | HOLDS — deep blob path at `refs/tags/154.0.8037.97`, 200 |
| `kind` | `code` | enum includes `code` | HOLDS — IDL is Blink interface source |
| `tier` | `A` | A = primary/authoritative **for that scope**, explicitly including "source code" | HOLDS — not inflated; scope is exactly the declaration site |
| `scope` | "Where Chromium 154 exposes the ModelContext attribute and how it is gated" | scoped claim/topic the tier applies to | HOLDS for IDL-level exposure/gating (see F2) |
| `anchor` | tag + full commit + `lines 7-12` + `sha256 50dd337d…6364` | exact section/line **plus revision**, never a bare homepage | HOLDS — commit and digest reproduced above |
| `teaches` | Document / SecureContext / RuntimeEnabled=WebMCP / no Navigator partial | one grounded learner benefit | HOLDS — all four clauses reproduced in §2/§4 |
| `status` | `mined` | mined = cited by ≥1 path in `used-by` | HOLDS — `corpus/knowledge/webmcp-chromium-loopback-round-16.md` (`source: S033`, line 5; cites "S033 line 11" at line 77), present at HEAD |
| `opened` | `2026-10-20` | ISO date the row author opened it | HOLDS — matches today's session re-open |
| `recheck` | `on-release` | ISO date or cadence (`90d`, `180d`, `on-release`) | HOLDS — allowed cadence |
| `used-by` | `corpus/knowledge/webmcp-chromium-loopback-round-16.md` | repo-relative path(s) | HOLDS — `git cat-file -e HEAD:...` passes |
| shape | 11 columns | no `|` inside cells; NF==13 under `-F'|'` | HOLDS — census `malformed: 0`, no `|` in the row |

Lane census (read-only, from `corpus/SOURCES.md`): `rows: 39`, `malformed: 0`, `dups:` none,
enum/tier violations: none. Lane checker: `node scripts/check-sources.mjs` →
`SOURCES_GATE verdict=clean rows=39 tiers=A:31,B:4,C:4 status=queued:3,mined:32,rejected:4 findings=0`, exit 0.
(`scripts/sources-census.sh` does not exist in this lane; the frozen manual census commands were run instead.)

## 6. Findings

**F1 (minor, not a break) — digest elision in the anchor.** The row stores `sha256 50dd337d…6364`,
not the full digest; the full value (`50dd337d33c38403c60084fa8c716c9d8e2c01ff26405e331408c122ef906364`)
lives only in wave evidence (`.ufo/waves/round-16/w1/SrcChromiumIdl.md:41`). Contract requires a
line/section anchor plus revision, not a digest, so this is extra strength stored incompletely, not
dishonesty. It reproduces exactly as written.

**F2 (precision note) — "how it is gated" is IDL-surface gating only.** The file shows two gates:
`RuntimeEnabled=WebMCP` on the interface extension and `SecureContext` on the attribute. A third
gate the build actually enforces — the `tools` permissions policy, rejected with
`NotAllowedError: ... permissions policy` — lives in implementation, not this IDL:
`/tmp/blinkcore/script_tools/model_context.cc:72` (message), `:369`, `:816`, `:990`, `:1092`
(`PermissionsPolicyFeature::kTools`). The row's `teaches` enumerates only what the file says and
does not claim exhaustiveness, and the knowledge note sources the policy observation to the receipt,
not to S033. Reading the row as "IDL-visible gating" is accurate; a reader who takes "how it is
gated" as the complete gate set would be reading past the row's own sentence.

**F3 (adjacent contract state, UNPROVEN not BREAKS) — rule-1 `## Gate` record absent at this snapshot.**
Rule 1 requires the round lesson's `## Gate` to record, per new row, URL + access date + ≤25-word
located quote. At `b444ca8` there is no `corpus/lessons/round-16.md`:
`git ls-tree -r --name-only HEAD corpus/ | grep -iE "round-16|round16"` returns only evidence and
knowledge files, and `ls corpus/lessons/ | grep round-16` → exit 1. The in-round evidence trail does
exist in wave 1 (`SrcChromiumIdl.md:41` full sha256 + blob; `CriticSourced.md:82` located `:7-11`
quote), so the material fact is recorded; only the final lesson artifact is missing. This is
UNPROVEN for the Gate artifact and cannot count for or against the S033 row; if round 16 integrates
without emitting that Gate entry, rule 1's record is unmet for this row.

**No tier inflation.** `kind=code` + `tier=A` is expressly A-eligible ("source code") and
`community` is not involved, so the `tier-inflation` check is not triggered; the census confirms.

## 7. Remaining unknowns

- Chromium `main` drift beyond the pinned tag is out of scope; the row claims 154 only.
- The `## Gate` artifact (F3) can only be judged after round-16 integration writes the lesson.
- `recheck: on-release` is unsatisfiable in this session (no Chromium release occurred); cadence
  validity was checked against the contract enum only.
