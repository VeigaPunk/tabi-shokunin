# ReopenS130 — wave-2 reopen of registry row S130 (round 34, commit 04f9623)

**Verdict: HOLDS** (two cosmetic/low observations, no defect that changes any claim the entry or lesson rest on). I re-fetched token.cc, unguessable_token.h, render_frame_devtools_agent_host.cc and the tag JSON; every cited line, hash and byte count matches the row byte-for-byte. The row parses as 11 cells with no `|` inside a cell, kind `code` and tier `A` are valid, `used-by` (corpus/knowledge/bidi-gate-selftest-round-34.md) cites S130 (line 1 and line 64), `check-sources.mjs` on a clone at 04f9623 exits 0 with `verdict=clean rows=133 findings=0`. The entry's claim (page-target DevTools id = `base::Token` printed `PRIX64`, `FromString` rejects lower case, 32 upper-case hex; scope page targets 154.0.8037.97, tab targets not read) is what the bytes say.

## Fetches (curl -q -sS --proto =https; Gitiles ?format=TEXT, base64 -d; all HTTP 200)
Base: https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/
| path | UTC | raw B | raw sha256 | decoded B | decoded sha256 |
|---|---|---|---|---|---|
| base/token.cc | 2026-10-26T20:12:36Z | 2992 | 36deab71f228db91f847d23f5c8b87aab50ed6b8bd0ed87e1989cd3090d9b889 | 2243 | 6ef1fc2bddf044f5ae49fc827d46917d5d4edfdbc46d37ac2bf4b9289112628f |
| base/unguessable_token.h | 20:12:37Z | 7816 | d23ef5706cc70618f8f69386b4b339b36052c891870246e0706d974a871346c9 | 5860 | 8480a87fd7ad7856d2799890a7ba03f470b80746ee6e66a2a170fab2773b14fb |
| content/browser/devtools/render_frame_devtools_agent_host.cc | 20:12:42Z | 61064 | 2a1945ee5329ba6611916746e223844ecdcc847858815064e4a07dc58f4d5699 | 45797 | 4e2f2ec2ee2ba845091d95556e25a0eb0e2fa8e50203511cc1fb68fa5d29b26b |
| tag JSON `refs/tags/154.0.8037.97?format=JSON` | 20:12:48Z | 2334 | 02dbdcc41ba2173756c2728a232765ca9165f14e7ad922bf9535f881111cb264 | - | commit b510e9d7…, tree e096b085… |
Extra (not cited by the row, to test the chain): content/browser/renderer_host/render_frame_host_impl.h (20:13:02Z, 367376 B raw, sha256 801e1f30…ed454e; decoded 275532 B 8c4edf07…675786), content/browser/devtools/devtools_agent_host_impl.cc (20:13:09Z, 28256 B, 9da2afef…a77336; decoded 21192 B 108ffb6c…02bc), content/browser/devtools/protocol/target_handler.cc (20:13:23Z, 85456 B, 171b8ae6…819c7).
Row's four hashes/sizes (raw 2,992 / sha 36deab71…; decoded sha 6ef1fc2b…; tag 2,334 B sha 02dbdcc4…; commit/tree) all EQUAL my fetch. The lesson's receipt (2,992 B, decoded 2,243 B, `36deab71…9b889`, `6ef1fc2b…2628f`) also equal.

## Anchors located
- token.cc:34-36 `std::string Token::ToString() const { return StringPrintf("%016" PRIX64 "%016" PRIX64, words_[0], words_[1]); }` — line 35 is exactly the lesson Gate quote.
- token.cc:46-47 comment "intentionally strict about case, accepting 'A' but rejecting 'a'"; 50-53 `'0'..'9'` and `'A'..'F'` branches only, else `return std::nullopt` (:54-55); :40 size must be 32. => "FromString rejects lower case" true.
- unguessable_token.h:105 `std::string ToString() const { return token_.ToString(); }`; :52 `class BASE_EXPORT UnguessableToken`; :135 `base::Token token_;`.
- render_frame_devtools_agent_host.cc:339 `: DevToolsAgentHostImpl(frame_host->devtools_frame_token().ToString()),` (inside the ctor taking `frame_tree_node, frame_host`).
- Uncited but confirming the "CDP targetId" step: devtools_agent_host_impl.cc:255-256 `DevToolsAgentHostImpl(const std::string& id) : id_(id)`, :387-388 `GetId() { return id_; }`; target_handler.cc:101 `.SetTargetId(host->GetId())`; render_frame_host_impl.h:3186-3187 `const base::UnguessableToken& devtools_frame_token() const`, :5606 `const base::UnguessableToken devtools_frame_token_;`.
- Round-32 transcripts (corpus/evidence/round-32/bidi/run{1,2}/transcript.jsonl): the `"context"` field is 36 times `31B8FE9C25C36020CBB175F250715903` (run1) and 36 times `0E62B928C3D82E935056B338D5E0FBF4` (run2): both 32 upper-case hex, one value per run => "two distinct values" true.

## Row structure
`awk -F'|' 'NF'` on SOURCES.md:144 gives 13 fields (11 cells + the two edge empties); no `|` inside a cell; id unique (`grep -c '^| S130 '` = 1; at 15dfaccb S120-S129 present, S130 absent). `node scripts/check-sources.mjs --root <clone> --file corpus/SOURCES.md` => exit 0, `SOURCES_GATE verdict=clean rows=133 tiers=A:118,B:6,C:9 status=queued:15,mined:109,rejected:9 findings=0`.

## Observations (none a defect against a claim)
1. (low) Chain link uncited: the row's anchor stops at `DevToolsAgentHostImpl(token.ToString())` (rfdah.cc:339); that this string is the CDP `targetId` rests on devtools_agent_host_impl.cc:255-256/387 and target_handler.cc:101, which are not in the anchor. I confirmed them true at the same tag, so the claim holds; adding them to the anchor would make it self-contained.
2. (low/cosmetic) The row's "(the round-32 transcripts show 32 such, two distinct values)" is ambiguous: each transcript carries 36 `"context"` occurrences (72 total), not 32; "32" reads as the id length. Also the transcripts contain other upper-case 32-hex values (e.g. run1 00E15387…, 9CD19D28…, DDF778C6…) so "two distinct" holds only for the `context` field. No gate logic depends on the count.
3. (info) Id S130 was earlier used as a staged, refused quarantine row (round-22 quarantine-verdicts.tsv:15; round-27 lesson) while CORPUS.md:89 says ids are "never reused". Precedent: S126 (also quarantine-refused) was later a registry row; the staged ids were never registry rows (S130 absent at 15dfaccb), and check-sources does not flag it. Not a defect of this row.
4. (info) Token lifetime: rfh.h:5601-5605 says the token is stable for the RFH lifetime and "allowed to change across MPArch activations like prerendering". The row states shape, not stability, so no overreach; the entry's scope sentence (page targets, tab targets unread) is consistent.

## Commands (all exit 0)
curl -q -sS --proto =https (x7, HTTP 200 each); base64 -d; sha256sum; awk -F'|' on SOURCES.md:144; grep of lesson/entry; `node clone/scripts/check-sources.mjs --root $S/clone --file corpus/SOURCES.md` (clone `git clone --shared` + `checkout --detach 04f9623…`, scratch removed on exit).

## Deliverables
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-34/w2/ReopenS130.md (this report)
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-34/w2/ReopenS130/token.cc.decoded.txt (decoded token.cc, sha256 6ef1fc2b…628f)
