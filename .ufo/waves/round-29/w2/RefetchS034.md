# RefetchS034 — C3 independent re-fetch + attack, row S034

- Seat: `RefetchS034` (leaf, attack seat; no production repair, no subagent dispatch)
- Milestone: C3 (freshness). Wave w2 (falsify).
- Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`
- Measured revision: `32008a453737a27f69e9ab401d0b9775d2a944f7` (clean `git clone --shared` in scratch, `git status --porcelain` empty)
- Baseline: `856fa9e1202179f5cfbd28c1f0efdd4eb1f426bb`
- Claims read first: `.ufo/waves/round-29/claims.json` (C3 predicate/killRule/controls)
- Scratch: `$HYAKU_SCRATCH/tabi-r29/RefetchS034` with `HYAKU_SCRATCH=/fast/scratch/hyaku`

Row under test — `corpus/SOURCES.md:48`:

```
| S034 | Chromium 154 runtime_enabled_features.json5 — https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/platform/runtime_enabled_features.json5 | code | A | Which Blink runtime features gate WebMCP in Chromium 154 and how they imply each other | tag 154.0.8037.97, lines 7023-7050, sha256 99b92e67…1d2b | WebMCP is experimental and implied by WebMCPTesting at 154; no DeclarativeWebmcp feature exists there, so that flag token is inert | mined | 2026-10-20 | on-release | corpus/knowledge/webmcp-chromium-loopback-round-16.md |
```

Receipt entry `corpus/evidence/round-29/release-pins/receipt.json` → `rows[id=S034]`: `fetched_by: PinS034`, one file `third_party/blink/renderer/platform/runtime_enabled_features.json5`, `old_tag 154.0.8037.97`, `old_status 200`, `new_status 200`, `ranges [[7023,7050]]`, `superseded_by: null`.

## 1. My own fetch (no wave-1 bytes reused)

```
P='third_party/blink/renderer/platform/runtime_enabled_features.json5'
for t in 156.0.8078.47 154.0.8037.97; do
  code=$(curl -sS -o "fetch/$t.b64" -w '%{http_code}' \
    "https://chromium.googlesource.com/chromium/src/+/refs/tags/$t/$P?format=TEXT")
  base64 -d < "fetch/$t.b64" > "fetch/$t.raw"
done
```

```
156.0.8078.47 http=200 b64=321936 decoded=241452 sha256=5314547c7c6a45a76286713423567efac7163de7b7d7b17018960ee3b7fe14b4
154.0.8037.97 http=200 b64=310220 decoded=232665 sha256=99b92e6776a5305543ab196a64128a11e2d4e86667e72e48787b05d45bcb1d2b
```

| file | tag | my status | my sha256 | receipt sha256 | agree |
|---|---|---|---|---|---|
| `third_party/blink/renderer/platform/runtime_enabled_features.json5` | 156.0.8078.47 | 200 | `5314547c…7fe14b4` | `new_sha256 5314547c…7fe14b4` | **agree** |
| same | 154.0.8037.97 | 200 | `99b92e67…5bcb1d2b` | `old_sha256 99b92e67…5bcb1d2b` | **agree** |

Bytes authenticity (item 4, first half) — committed bytes vs my independent decode:

```
cmp fetch/154.0.8037.97.raw <lane>/corpus/evidence/round-29/release-pins/bytes/154.0.8037.97/$P  -> identical
cmp fetch/156.0.8078.47.raw <lane>/corpus/evidence/round-29/release-pins/bytes/156.0.8078.47/$P  -> identical
```

Both exit 0. The committed blobs at the tip are byte-for-byte what Gitiles served me at each tag; the tag endpoint discriminates (154 ≠ 156 digests), so the 200s are not a fallback body.

## 2. Refetch record written

`.ufo/waves/round-29/w2/refetch/S034.json` (sha256 `cf2b7aec9908c4c92820ae223d378bb814a52f161da74c8e0b5105e53dc72503`):

```json
{"id":"S034","seat":"RefetchS034","fetched_at":"2026-10-26T05:09:00Z","files":[{"path":"third_party/blink/renderer/platform/runtime_enabled_features.json5","tag":"156.0.8078.47","status":200,"sha256":"5314547c7c6a45a76286713423567efac7163de7b7d7b17018960ee3b7fe14b4"}]}
```

All values come from my fetch; `seat` differs from `entry.fetched_by` (`PinS034`), which is what `f6-refetch` requires.

## 3. Verdict recomputed from the committed 154 bytes + my 156 bytes

Counter rule (`scripts/check-release-pins.mjs`: `normLine` = trim + collapse inner whitespace; `blockIn` = contiguous anywhere in the new lines; `f4-ranges` binds each range token to the row's own anchor cell).

Independent implementation over my two fetches:

```
node -e '… normLine/blockIn over old[7022..7049] …'
blocklen 28 match at new line 7204
old sha 99b92e67…5bcb1d2b
new sha 5314547c…7fe14b4
```

- Old lines 7023-7050 (28 lines, `name: "WebMCP"` … `WebMCPTesting`/`status: "experimental"`/`},`) normalise-match **contiguously** at new lines **7204-7231**.
- Normalised diff of old 7023-7050 vs new 7204-7231: **IDENTICAL**.
- `f4`: token `7023-7050` is present in the anchor cell (`lines 7023-7050`), `b = 7050 <= 7428` old lines. OK.
- `f5`: anchor digest `99b92e67…1d2b` matches `old_sha256`. OK.
- `f6`: satisfied only by a record at the counter's path — see F1.

**My verdict: `holds`.** Counter verdict at the tip:

```
$ git -C clone checkout 32008a45… ; node scripts/check-release-pins.mjs --rev 32008a45… --stable 156.0.8078.47 --json
exit=1
{"population":23,"unresolved":23,"holds":0,"drifted":0}
S034: {"resolved":false,"verdict":null,"reasons":["f6-refetch third_party/blink/renderer/platform/runtime_enabled_features.json5"]}
```

The tip cannot report `holds` for S034 (or any row) because **no refetch record is committed at all** — `git ls-tree -r 32008a45 corpus/evidence/round-29/release-pins/refetch/` returns 0 files; every one of the 23 rows carries exactly one reason, `f6-refetch`. With my record supplied in a fixture repo the counter returns the verdict I computed independently:

```
node scripts/check-release-pins.mjs --repo "$D" --rev HEAD --stable 156.0.8078.47 --json   (fixture = control)
exit=0  {"population":1,"unresolved":0,"holds":1,"drifted":0,"rows":[{"id":"S034","resolved":true,"verdict":"holds","reasons":[]}]}
```

So verdict agreement is confirmed, conditional on F1 being integrated.

### Changes outside the anchored block (±25 lines, new 7179-7256) vs the row's teaches cell

teaches asserts three things: (a) WebMCP `status: "experimental"`, (b) `implied_by` includes `WebMCPTesting`, (c) no `DeclarativeWebmcp` feature exists in this file. At 156:

- (a) line 7216 `status: "experimental"` — unchanged; (b) line 7214 `"WebMCPTesting"` inside `implied_by` — unchanged; the whole 28-line block is identical.
- (c) whole-file check: `grep -c 'name: "DeclarativeWebmcp"' 156.raw` → **0** (154 also 0; the only `Declarative*` names are `DeclarativeCSSModules`, `DeclarativeCSSModulesStyleTag`, `DeclarativeFragment`, `DeclarativePerformanceObserver`, `DeclarativeSkeletons`, plus `WebMCPDeclarativeFileInput`).
- The two changes inside the ±25 window are unrelated to WebMCP: `WebIdentityDigitalCredentialsCreation` lost `origin_trial_feature_name`/`origin_trial_allows_third_party` and moved `experimental → stable` (old 7010-7016 vs new 7193-7197), and the `WebHIDOnServiceWorkers` block boundary entered the window after the +181-line shift. **No change outside the block alters what the teaches cell asserts.** 822 normalised line pairs differ file-wide (7428 → 7634 lines), none of them WebMCP.

## 4. Filing completeness

Cited by the row (anchor cell): one file — `third_party/blink/renderer/platform/runtime_enabled_features.json5` (named in the source cell, no other path), one line range — `7023-7050`, one digest — `99b92e67…1d2b`.
Filed in the receipt: the same single file, `ranges [[7023,7050]]`, `old_sha256 99b92e67…`.

- cited file missing from the receipt: **none**
- cited range missing from the receipt: **none**
- receipt range not cited by the anchor: **none**
- cited digest unmatched: **none** (`f5` passes)

Filing is 1:1 for the anchor cell — but the teaches cell claims more than the filed range binds (F2).

## Findings

**F1 (integration requirement, not a row defect) — `f6` has no committed record at the tip; the gate reads `corpus/evidence/round-29/release-pins/refetch/<id>.json`, not the w2 path.**
Evidence: `git ls-tree -r 32008a45 corpus/evidence/round-29/release-pins/refetch/ | wc -l` → `0`; counter at tip → `unresolved=23`, each row's only reason `f6-refetch`. My record is at `.ufo/waves/round-29/w2/refetch/S034.json` per this seat's item; C3's `unresolved=0` is reachable only if the w2 records are committed (verbatim) at `corpus/evidence/round-29/release-pins/refetch/S034.json`. Smallest safe correction: L1 copies each `w2/refetch/<id>.json` to the counter's path in the integration commit; no counter change needed.

**F2 (gate hole — subset filing; counterexample proven) — the counter certifies S034's whole-file absence claim from a 28-line range.**
The teaches cell's third clause ("no DeclarativeWebmcp feature exists there") is a property of the entire file, but the only filed range is 7023-7050, and `f4`/`blockIn` bind nothing outside it. Fixture proof (fixture repos under my scratch, `git -C "$D" rev-parse --show-toplevel` verified equal to `$D` before the first commit):

```
control          : DeclarativeWebmcp absent, real 156 bytes     -> exit=0 holds=1  verdict=holds
tampered-absence : '{ name: "DeclarativeWebmcp", status: "experimental" },' inserted at new line 7239,
                   anchored block still intact at 7204           -> exit=0 holds=1  verdict=holds   <-- teaches falsified, gate green
tampered-block   : one in-block status line changed               -> exit=1 drifted, reason s1-drift-unsuperseded
```

So the gate discriminates in-block edits but accepts an out-of-block addition that falsifies the row's teaches. Impacted axis: freshness (a "holds" verdict is weaker than the row's teaches text). Smallest safe correction: either file the absence claim as a whole-file binding (a receipt `whole_file: true` / `ranges: []` entry with `old_sha256 != new_sha256` disallowed) or narrow S034's teaches to the block ("within the WebMCP block, no DeclarativeWebmcp declaration appears"), leaving whole-file absence to S074. Attack seat: reported only, not repaired.

**F3 (stale anchor range at the new tag) — `lines 7023-7050` no longer points at WebMCP at 156.**
The WebMCP block moved 7023 → 7204 (+181). At tag 156.0.8078.47, lines 7023-7050 are `WebAuthenticationRemoteDesktopSupport` (7025), `WebAutocorrectByDefault` (7034), `WebBluetooth` (7041) — verified by `sed -n '7023,7050p' 156.raw | grep -n 'name:'`. The receipt records no `new_ranges`, and the counter never reports the move, so a reader who re-applies the row's anchor range to the 156 tag reads unrelated features while the gate says `holds`. Smallest safe correction: record the observed new range (`[[7204,7231]]`) on the receipt file entry and have the counter surface it when it differs from the old range (informational, non-blocking).

**F4 (duplicate authority / false provenance risk) — S034's unqualified "so that flag token is inert" is re-blessed by `holds` although S074 already supersedes it.**
`corpus/SOURCES.md:88` S074 teaches `supersedes S034 — … Absence from this file alone does not prove a command-line token inert at runtime`, and files the same file (`ranges [[7023,7050],[7035,7035]]`, same digests, `fetched_by PinS074`). Because S034 *holds* (not drifted), the counter never consults `superseded_by` for it, so C3's green state leaves two live registry rows teaching the same file at different strength, with the weaker-qualified one (S034) still reading as certified. The S074 row is in the population and resolves identically, so the qualifier is not lost — this is a quality trade, not a hard failure of the C3 predicate; it should be reported as a trade, never admitted as a win. Smallest safe correction: append `superseded by S074` to S034's teaches (or set its recheck cell) so the certification cannot be read without the qualifier.

## 404 normalisation rule

N/A for S034 (both statuses 200; no body normalisation applied). Sanity check that the rule's shape still holds on this endpoint:

```
curl '…/156.0.8078.47/third_party/blink/renderer/platform/runtime_enabled_features.json5x?format=TEXT'
http=404 body=233 bytes  NOT_FOUND: Requested entity was not found … request_id: "a7dfc0b874664ed09c53555090a6cec0"
```

The `request_id: "<32 hex>"` pattern is present, so S094's normalisation premise is intact; nothing here needed it.

## Tooling

No tool installed, upgraded or reconfigured for this seat (nothing was needed: `curl`, `base64`, `git`, `node`, `jq`, `sha256sum` all present). No pacman transaction attempted.

## Commands run (exit codes)

```
git clone --shared -q . $S/clone && git -C $S/clone checkout -q 32008a45…      -> 0   (porcelain empty)
curl …156.0.8078.47…?format=TEXT                                                -> 0   (http 200)
curl …154.0.8037.97…?format=TEXT                                                -> 0   (http 200)
cmp committed-vs-fetched (both tags)                                            -> 0 / 0
node -e blockIn(old[7023..7050], newNorm)                                       -> 0   (match at 7204)
node scripts/check-release-pins.mjs --rev 32008a45… --stable 156.0.8078.47 --json -> 1 (unresolved=23, f6-refetch)
node scripts/check-release-pins.mjs --repo fx-control --rev HEAD --stable …      -> 0   (S034 holds)
node scripts/check-release-pins.mjs --repo fx-tampered-absence --rev HEAD …      -> 0   (S034 holds — hole)
node scripts/check-release-pins.mjs --repo fx-tampered-block --rev HEAD …        -> 1   (drifted, s1-drift-unsuperseded)
grep -c 'name: "DeclarativeWebmcp"' 156.raw                                      -> 1   (count 0)
```

Scratch tree (`/fast/scratch/hyaku/tabi-r29/RefetchS034`) held the clone, the two raw fetches, the three fixture repos and the counter JSON outputs; it is removed after this report. The only artefact kept is `.ufo/waves/round-29/w2/refetch/S034.json`.
