# PinS097 — C3 re-open of registry row S097 at stable 156.0.8078.47

Seat: PinS097 (leaf executor, milestone C3). Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`,
baseline `856fa9e1202179f5cfbd28c1f0efdd4eb1f426bb`, claims commit `97be89bc66139eb45526a04af59a35dccc006eb9`.
Output dir: `.ufo/waves/round-29/w1/pins/S097/`. No tracked lane file, index, jj state, fleet repo or sibling
lane repo was written; only this report and the output dir.

## Verdict

**S097 holds at 156.0.8078.47 — no range drifted, so no superseding registry row was drafted**
(item step 6 is gated on drift). Entry carries `superseded_by: null`.

| item | result |
|---|---|
| files cited by the row | 1 (`third_party/blink/renderer/core/inspector/inspector_web_mcp_agent.cc`) |
| 154.0.8037.97 fetch | HTTP **200**, 8585 bytes, 245 lines |
| 156.0.8078.47 fetch | HTTP **200**, 8635 bytes, 246 lines |
| row's recorded digest | `1cc55ef978a63d4fb8f9678ade444756fdb90fb182e497680bae0aeedf968475` → **match** (equals 154 decoded sha256) |
| range `47-64` | **holds**, sits at 156 `47-64` (displacement 0) |
| range `208-243` | **holds**, sits at 156 `209-244` (displacement +1) |
| file / row verdict | holds / holds |
| supersede-row.md | not written (no drift) |

## Row extract (corpus/SOURCES.md line 111, 11 cells)

- id `S097`; kind `code`; tier `A`; status `mined`; opened `2026-10-21`; recheck `on-release`
- scope: `Build-scoped success/failure output conversion, not unconditional event delivery or JSON null payload`
- anchor: `tag 154.0.8037.97 commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d; inspector_web_mcp_agent.cc:47-64,208-243; decoded sha256 1cc55ef9…f968475`
- teaches: `supersedes S079 — success uses ParseJSON with string fallback and null-String empty-dictionary handling; failure supplies a null optional-output pointer (field omitted), forwards error.message and optionally wraps an exception; protocol declarations remain in S079`
- used-by: `corpus/knowledge/webmcp-declarative-validation-round-19.md`

Files named by the row: the source cell's URL path only. The anchor names one basename
(`inspector_web_mcp_agent.cc`), which resolves to the same path, so there is exactly one file. The
resolution is corroborated by earlier wave dossiers (`round-20/w1/SourceErrorMap.md:16` gives the full
`third_party/blink/renderer/core/inspector/inspector_web_mcp_agent.cc` against this same pin;
`round-20/w1/SourceLC09.md:70` cites the same basename for the CDP output path) and by the source cell's
own Gitiles path. Ranges exactly as spelled in the anchor: `47-64` and `208-243`; a Gitiles directory
listing was therefore not needed.

## Fetch provenance

Gitiles, read-only GET, `?format=TEXT`, base64-decoded:

- `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/inspector/inspector_web_mcp_agent.cc?format=TEXT` → **200**
- `https://chromium.googlesource.com/chromium/src/+/refs/tags/156.0.8078.47/third_party/blink/renderer/core/inspector/inspector_web_mcp_agent.cc?format=TEXT` → **200**

Tag resolution (same host, `refs/tags/<tag>?format=JSON`): 154.0.8037.97 → commit
`b510e9d7cd3a2fbd78d0ddc42234103206c5f78d` (matches the row's commit exactly);
156.0.8078.47 → commit `1d17a2e2ee147bb7d6ae2ab6abdb3a2510c17775`.

Decoded bytes stored at the exact chromium path under both tag dirs:

```
.ufo/waves/round-29/w1/pins/S097/bytes/154.0.8037.97/third_party/blink/renderer/core/inspector/inspector_web_mcp_agent.cc
  sha256 1cc55ef978a63d4fb8f9678ade444756fdb90fb182e497680bae0aeedf968475  8585 bytes  245 lines
.ufo/waves/round-29/w1/pins/S097/bytes/156.0.8078.47/third_party/blink/renderer/core/inspector/inspector_web_mcp_agent.cc
  sha256 2477d201dffd775be70fcd8fd286fc20755d1b020a4e8de2a84452a5b6ec2c53  8635 bytes  246 lines
```

## Range check

Method: each anchored 154 block (lines trimmed, inner whitespace collapsed) searched as one contiguous
block over the whole 156 line array — the counter's own `f4`/`blockIn` semantics — and independently
confirmed with a byte-exact `diff` of the two line windows.

- `47-64` (18 lines: `ParseJSON`, incl. `if (!value) return protocol::DictionaryValue::create();` and the
  `protocol::StringValue::create(value)` fallback): holds, only occurrence at 156 `47-64`.
- `208-243` (36 lines: `WebMCPToolResponded` with `ParseJSON(result)` at `Completed`, `WebMCPToolFailed`
  with the `nullptr` optional-output argument): holds, only occurrence at 156 `209-244`.
  Byte-exact: `diff <(sed -n '208,243p' 154…) <(sed -n '209,244p' 156…)` exit 0.

Whole-file difference between the two tags is a **single one-line insertion**, out of anchor:

```diff
@@ -72,6 +72,7 @@
     builder.setReadOnly(annotations->read_only);
     builder.setUntrustedContent(annotations->untrusted_content);
     builder.setConsequential(annotations->consequential);
+    builder.setDebugging(annotations->debugging);
     has_annotations = true;
   }
```

It lands at 156 line 75, inside `BuildAnnotations` and after both anchored ranges' content; it adds
propagation of a new `debugging` annotation field to the CDP `Annotation`, which touches neither the
success `ParseJSON` conversion nor the failure optional-output path that S097 teaches. Located quote from
the 156 bytes (line 218): `protocol::WebMCP::InvocationStatusEnum::Completed, ParseJSON(result));` — the
success-conversion token the row turns on, unchanged. This insertion is recorded as an out-of-anchor
change only; it is not a drift under the frozen counter and does not need a superseding row.

## Counter readiness (check-release-pins.mjs, frozen)

- `r1-entry` — one entry, one file ✔
- `f1-old-tag` — `old_tag` equals the tag the source cell carries ✔
- `f2-path-bound` — the source cell contains `refs/tags/154.0.8037.97/<path>`; the anchor also names the basename ✔
- `f3-bytes` — paths recorded as `corpus/evidence/round-29/release-pins/bytes/<tag>/<path>`; **the integrator must commit the bytes from this output dir at those paths**, sha256 as above ✔ after copy
- `f4-ranges` — `[[47,64],[208,243]]`; both within 245 old lines; both tokens present in the anchor cell ✔
- `f5-digest` — `old_sha256` equals the anchor's full 64-hex digest ✔
- `f6-refetch` — **PENDING, not mine to supply**: needs
  `corpus/evidence/round-29/release-pins/refetch/S097.json` written by a seat other than `PinS097`, with
  `{"id":"S097","seat":"<other>","fetched_at":"<ISO Z>","files":[{"path":"third_party/blink/renderer/core/inspector/inspector_web_mcp_agent.cc","tag":"156.0.8078.47","status":200,"sha256":"2477d201dffd775be70fcd8fd286fc20755d1b020a4e8de2a84452a5b6ec2c53"}]}`
- `s1-drift-unsuperseded` — not applicable (row holds)

## Citing knowledge entry

Only `corpus/knowledge/webmcp-declarative-validation-round-19.md` cites S097 (line 132, bullet 132-135,
used-by cell). Because the row holds, the wave's recheck-note requirement for drifted rows does not fire.
Substance check against the 156 bytes: the bullet's two claims sit in unchanged blocks — "success parses
JSON or falls back to a string" (156 `47-64`, fallback at 63) and "failure passes a null optional-output
pointer, so the output field is omitted" (156 `243`: `nullptr, error.message,`). The bullet's pin
("Chromium 154") and digest remain accurate for 154; at 156 the file body changed only by the
`setDebugging` insertion, which the bullet does not contradict and does not cover. Nothing in the citing
entry is made wrong by the 156 bytes.

## Commands run (exit codes verbatim)

```
grep -n "^| S097" corpus/SOURCES.md                                             -> 0 (line 111)
curl -sS -w '%{http_code}' …/refs/tags/154.0.8037.97/<path>?format=TEXT          -> 200
curl -sS -w '%{http_code}' …/refs/tags/156.0.8078.47/<path>?format=TEXT          -> 200
base64 -d <fetch>.b64 > <tag>.cc  (154: 8585 bytes/245 lines; 156: 8635/246)    -> 0
sha256sum <both decoded>                                                        -> 0 (1cc55ef9…f968475, 2477d201…ec2c53)
diff -u <154>.cc <156>.cc                                                       -> 1 (single +line hunk, as expected)
python blockIn-equivalent over normalized lines, ranges 47-64 / 208-243         -> 0 (holds @47, holds @209)
diff <(sed -n '47,64p' 154) <(sed -n '47,64p' 156)                              -> 0 (identical)
diff <(sed -n '208,243p' 154) <(sed -n '209,244p' 156)                          -> 0 (identical)
sed -n '54p' <both> (len 80 each)                                               -> 0 (identical)
curl …/refs/tags/154.0.8037.97?format=JSON                                      -> 200 (commit b510e9d7…)
curl …/refs/tags/156.0.8078.47?format=JSON                                      -> 200 (commit 1d17a2e2…)
wc -c -l <both decoded>                                                         -> 0
```

No tool installed or upgraded (nothing was needed). Nothing under `/tmp` used beyond scratch; scratch was
`/fast/scratch/hyaku/tabi-r29/PinS097` and is removed after copying the receipts.

## Risks / handoff

1. `f6-refetch` is the only unmet counter input for S097 and must come from a second seat; my fetch cannot
   satisfy it by construction (self-refetch would be a copied-old-as-new hole).
2. Byte paths in `entry.json` are the counter's required `corpus/evidence/round-29/release-pins/bytes/...`
   paths; the files currently exist only in this output dir, so the integrator must commit them there.
3. The 156 file's `setDebugging(annotations->debugging)` insertion (line 75) is unmined in the registry.
   It is out of S097's anchored scope; flagged for a later row, not claimed now.

## Artifacts

```
.ufo/waves/round-29/w1/pins/S097/entry.json      (item step 5 shape)
.ufo/waves/round-29/w1/pins/S097/ranges.json     (machine-checkable per-range verdict + predicates)
.ufo/waves/round-29/w1/pins/S097/status.log      (fetch + tag-resolve statuses)
.ufo/waves/round-29/w1/pins/S097/file-154-vs-156.diff
.ufo/waves/round-29/w1/pins/S097/refs/tag-154.0.8037.97.json  sha256 02dbdcc41ba2173756c2728a232765ca9165f14e7ad922bf9535f881111cb264
.ufo/waves/round-29/w1/pins/S097/refs/tag-156.0.8078.47.json  sha256 b3fb545f5e0becc64cea5f13ac37b429ad91d9366512f6545fe282b1c7ed35dd
.ufo/waves/round-29/w1/pins/S097/bytes/154.0.8037.97/third_party/blink/renderer/core/inspector/inspector_web_mcp_agent.cc
.ufo/waves/round-29/w1/pins/S097/bytes/156.0.8078.47/third_party/blink/renderer/core/inspector/inspector_web_mcp_agent.cc
```
