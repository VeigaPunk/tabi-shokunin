VERDICT: PASS

Row S057 (status `rejected`) re-opened against its live listing and rechecked. Receipt written by the
shared producer, `quoteFound=true`, `teachesVerdict=held`. No drift draft, therefore no competing
superseding row (S058 stays owned by C3/D4).

## Row under recheck (at lane tip B = 2bff864fdfee684ddbcd066cc8e735adaba2735c)

- `corpus/SOURCES.md:71` — `| S057 | WebMCP - Model Context Tool Inspector — Chrome Web Store — <url> | tool | C |`
  - `scope`: "The inspector extension's own stated prerequisites and manual invocation workflow, as corroboration only"
  - `anchor`: "listing fetched 2026-10-20, Offered by François Beaufort (individual publisher), summary paragraph and Prerequisites paragraph; fetched body 649153 B, sha256 085c40b7…8a4c"
  - `teaches`: "supersedes S053 — REJECTED: the listing (developer Google Ireland, Ltd.; offered by François Beaufort) restates a manual inspect-and-execute workflow and a Chrome 150.0.7861.0 floor but adds no invocation contract beyond S048 and S041; flip: the listing or the extension source publishes an invocation API contract"
  - `status | opened | recheck | used-by`: `rejected | 2026-10-20 | on-release | —`
- Not in PLAN §C1's superseded-at-B set (S004, S039, S047, S049, S050, S053), so it is in scope for C1.
- Original gate quote location: `corpus/lessons/round-17.md:65` — the §Gate "Sources opened this round"
  row recording this same listing under the predecessor id S053 (10 words); S057 supersedes S053 on the
  same URL (`corpus/lessons/round-17.md:78`). The quote is therefore still the listing's own summary line.

## Fetch

Producer invocation (exactly as run):

```
node .ufo/waves/round-18/recheck-fetch.mjs --row S057 \
  --row-url 'https://chromewebstore.google.com/detail/webmcp-model-context-tool/gbpdfapgefenggkahomfgkhfehlcenpd' \
  --decode html-text \
  --quote 'Inspect, monitor, and execute WebMCP tools manually or with Gemini' \
  --quote-source 'corpus/lessons/round-17.md:65' --verdict held --seat Recheck26 \
  --outdir corpus/evidence/round-18/source-recheck
```

Producer output: `RECHECK row=S057 http=200 bytes=695881 sha256=361a9a0f2ec2ebb424c9263eb18d29f10c08e6a83ab1ed6d80bc109b2a18ac2c quoteFound=true verdict=held` (exit 0).
Its effective argv (recorded in the receipt): `curl -sSL --compressed --max-time 90 -A Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18 -o <tmp>/body -w %{http_code} '<url>'`.

- **http**: 200 (no redirect; `url_effective` equals the row URL on a separate Chromium-UA probe)
- **bytes**: 695881
- **sha256**: `361a9a0f2ec2ebb424c9263eb18d29f10c08e6a83ab1ed6d80bc109b2a18ac2c`
- **quote**: "Inspect, monitor, and execute WebMCP tools manually or with Gemini" (10 words, `quoteOffset` 394)
- **excerpt sha256**: `2e730a9a453d7ae1b3ed68c38b9c3e15f50123e9fd6cf9e5b33b592ca09e52ae` (1068 B)
- **anchor observed**: `Updated October 5, 2026; version 1.9.19; manifest minimum_chrome_version
  150.0.7861.0; rating 4.9 (11 ratings); 20,000 users`

Body is per-request dynamic (as round 17 recorded for this source): three fetches today gave three
digests — 649142 B `5d5b3a888509cfdf44967f17632d20467bc2ba9bd5abc299e9e49b4055692931` (Chromium 154 UA),
109625 B `8f97492f1c60155b6428693fc3d4763d562578d32fe623099bd7e713107e9b68` (producer UA, manual probe),
695881 B `361a9a0f…18ac2c` (the producer's own fetch, the one the receipt binds). All three normalise to
the same listing copy (`normalizedLength` 5997 twice measured; quote at the same normalised offset 394),
so the digest binds one snapshot while the quote is stable. The row's recorded 649153 B / `085c40b7…8a4c`
is not reproducible on any re-fetch — unchanged, already documented in round 17 (`ReopenS053.md`, Gate
note 1).

## Teaches judgement — held

The body still supports every clause of the `teaches` cell at the anchor:

1. "developer Google Ireland, Ltd.; offered by François Beaufort" — both fields present in the Details
   block of the fetched body: `Offered by` → `François Beaufort`; `Developer` → `Google Ireland, Ltd`
   (with `fbeaufort@google.com`). Observed, not inferred.
2. "restates a manual inspect-and-execute workflow and a Chrome 150.0.7861.0 floor" — Overview paragraph
   "Inspect, monitor, and execute WebMCP tools manually or with Gemini" plus "⚠️ Prerequisites: You must
   enable the \"WebMCP for testing\" flag in chrome://flags to turn it on in Chrome 150.0.7861.0 or
   higher."; the embedded item manifest repeats `"version": "1.9.19", "minimum_chrome_version":
   "150.0.7861.0", "permissions": ["sidePanel","activeTab","scripting","webNavigation","offscreen"]`.
3. "adds no invocation contract beyond S048 and S041" — the whole visible description is three blocks
   (summary, Prerequisites, security warning); no tool-invocation API, transport or agent-side format is
   stated anywhere in the listing copy. The rejection premise and its `flip` therefore stand unmet.

## Independent contract check (recomputed, not taken from the producer's own print)

Parsed the receipt and re-derived every §C1 clause: `schema=tabi-source-recheck-v1`; `rowUrl` occurs
verbatim in the `S057` source cell (`true`); `sha256` 64-hex; `quoteWords` 10 = 10 actual;
`normalize(quote)` occurs in `normalize(excerpt)`; `excerptSha256` = sha256 of the excerpt file bytes;
`quoteFound` true; `httpStatus` 200; `fetchedAt` `2026-10-20T19:06:33.265Z`; `teachesVerdict` `held`;
`producerSha256` `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360` = sha256 of
`.ufo/waves/round-18/recheck-fetch.mjs` at B (recomputed).

## Carried observations (not mine to fix; already routed)

- `anchor` cell's "(individual publisher)" is false against the body, which names `Developer Google
  Ireland, Ltd.` This is PLAN §C3 D4's defect, fixed by the new row S058 (`supersedes S057 —`, no
  "individual publisher"). S058 does not exist at B (`grep -n S058 corpus/SOURCES.md` → no hit), so my
  `held` verdict deliberately does not depend on it.
- `scope` wording "manual invocation workflow" is looser than the copy — the listing states manual
  *execution*, not a workflow with steps; round 17's own non-author re-open said the same
  (`corpus/lessons/round-17.md` §Corrections, `.ufo/waves/round-17/w2/ReopenS053.md` "Scope: replace
  'manual invocation workflow' with 'manual-execution claim'"). This sits in `scope`, not `teaches`, so
  it does not move the verdict; it should ride along with S058 if that row is written.

## Tooling

Nothing installed or upgraded; host `curl` and `node v24.21.0` only. No pacman transaction, no browser
launch, no git write in the lane; probe bodies lived under `/tmp/rc26` and were removed.

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S057.json
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S057.excerpt.txt
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/Recheck26.md
