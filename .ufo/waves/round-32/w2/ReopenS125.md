# ReopenS125 — registry row S125 re-opened independently

**Verdict.** Every substantive cell of S125 (`corpus/SOURCES.md:139`) and the lesson Gate row for it (`corpus/lessons/round-32.md:10`) **holds** on re-fetch: both raw blobs reproduce byte-identically against the row's two recorded decoded digests, every anchored line span resolves to the claim it is cited for, `teaches` is grounded sentence-by-sentence in those bytes, and `kind=code` / `tier=A` / `scope` are honest. **But the row's `recheck: on-release` cell carries one high-severity integration defect**: an `on-release` row pinned to Chromium tag `154.0.8037.97` enters the frozen freshness population of `scripts/check-release-pins.mjs:178`, and wave-1 filed no receipt entry, so at the attacked revision the frozen gate **fails** — `population=24 resolved=23 unresolved=1 UNRESOLVED id=S125 reasons=r1-entry missing or no files`, exit 1 — where the same command at baseline `d805d1d` is clean (`population=23 resolved=23`, exit 0). Three low nits (anchor `capabilities.cc:1362` labels a comment as the boolean parse; the anchor's two digests are unlabelled; the Gate row's "12 tokens" counter does not reproduce) and one informational id-spelling collision with the round-26..28 staged candidates are reported below. Nothing was repaired; the lane was read-only and my only commit is a scratch-clone fixture, since reset.

## What I attacked

1. Every cell of S125 at the attacked revision: anchor resolution, `teaches` grounding, tier/kind/scope honesty, recheck validity, used-by pointing at files that actually cite S125.
2. The lesson Gate row for S125: quote ≤25 words, verbatim, located where it says.
3. The strongest local counterexample to "recheck valid": the frozen freshness gate that consumes the `on-release` token.

## Evidence (commands and exit codes)

Clone (one live clone, detached at the attacked revision); worktree bytes verified identical to it first:

```
git clone -q --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"
git -C "$S/clone" checkout -q --detach b234a58920134424e0d104f137311ff54a16d26b   # HEAD = b234a58…
diff <(git -C "$S/clone" show HEAD:corpus/SOURCES.md)  …/corpus/SOURCES.md         # exit 0
diff <(git -C "$S/clone" show HEAD:corpus/lessons/round-32.md) …/round-32.md       # exit 0
```

Fetch + decode (all `curl -q -sS --proto =https`, exit 0; full receipt table in `ReopenS125/fetch-receipts.md`):

```
curl …/154.0.8037.97/chrome/test/chromedriver/session_commands.cc?format=TEXT   # HTTP 200, 90944 B
sha256sum session_commands.cc   → 7b40e94cefe1b1d319cd054ff433470aad3944067f5a344b932e6ec068b7abb5
curl …/154.0.8037.97/chrome/test/chromedriver/capabilities.cc?format=TEXT       # HTTP 200, 72612 B
sha256sum capabilities.cc       → 597c1a33092582cad0433ce0bd6cc9565b94804bbc2cf51d3fda1e0301427ba7
# second independent fetch of each: identical raw and decoded digests
curl '…/refs/tags/154.0.8037.97?format=JSON'  # commit b510e9d7…, tree e096b08… — both match the anchor cell
```

Anchor spans (each read verbatim from the decoded bytes):

| anchor span | bytes found | resolves to |
|---|---|---|
| `session_commands.cc:287-289` | 287 `if (session->web_socket_url) {`; 288-289 `caps.Set("webSocketUrl",` / `"ws://" + session->host + "/session/" + session->id);` | the returned capability |
| `:332-338` | `if (session->web_socket_url) {` … `BidiTracker* bidi_tracker = new BidiTracker();` … `devtools_event_listeners.emplace_back(bidi_tracker);` | BiDi channel wiring |
| `:378` | `if (session->web_socket_url) {` (block closes at 464) | the mapper block's guard |
| `:407-410` | 407 `// Create a hidden target for running  BiDi-CDP mapper in it.`; 408-410 `session->chrome->NewHiddenTarget(… &session->bidi_mapper_web_view_id);` | the mapper target |
| `:429-464` | 429 mapper path switch, 446 `StartBidiServer`, 452-457 `bidi_cmd.Set("method", "session.new")`, 459 `SendBidiCommand`, 464 block close | mapper start + `session.new` |
| `:510` | `session->web_socket_url = capabilities->web_socket_url;` (in `InitSessionHelper`, opened at 295) | the flag's only source in this path |
| `capabilities.cc:1375-1376` | `parser_map["webSocketUrl"] = base::BindRepeating(&ParseBoolean, &web_socket_url);` | the boolean parse |
| `capabilities.cc:1362` | `// W3C defined capabilities.` | **a section comment, not the boolean parse** (nit 1) |

`teaches` grounding, clause by clause: (a) capability is set only under the flag, in `CreateCapabilities` (`session_commands.cc:171`), whose comment (168-170) says it is "the capabilities, for returning to the client app as the result of New Session command" — "answers a classic request … with a session-scoped `ws://<host>/session/<id>` capability" ✓; (b) block 378-464 is inside `InitSessionHelper` and there is no other `NewHiddenTarget`/`StartBidiServer`/`session.new` site in the file — "only under that flag does it start the BiDi-CDP mapper in a hidden target and send it `session.new`" ✓; (c) tag-scoped: `?format=JSON` at the tag returns commit `b510e9d7…` / tree `e096b08…`, so "being source at one tag it fixes 154" ✓; (d) "shows no default-on BiDi": `capabilities.h:205` and `session.h:112` both declare `bool web_socket_url = false;`, `capabilities.cc` touches `WebSocketUrl` only at 1375-1376, and the capability/mapper paths are all flag-gated — ✓.

Structural gate (lane script run only in the scratch clone):

```
node scripts/check-sources.mjs --root "$S/clone" --file corpus/SOURCES.md
SOURCES_GATE verdict=clean rows=126 tiers=A:111,B:6,C:9 status=queued:15,mined:102,rejected:9 findings=0   # exit 0
```

## The defect (high) — `on-release` on a 154-pinned row with no release-pin receipt

```
node scripts/check-release-pins.mjs --rev HEAD --stable 156.0.8078.47
UNRESOLVED id=S125 reasons=r1-entry missing or no files
RELEASE_PINS verdict=failed rev=b234a58… stable=156.0.8078.47 population=24 resolved=23 unresolved=1 holds=16 drifted=7
exit=1
node scripts/check-release-pins.mjs --rev d805d1d6132430118b206a848b85753ab35d1014 --stable 156.0.8078.47
RELEASE_PINS verdict=clean rev=d805d1d… stable=156.0.8078.47 population=23 resolved=23 unresolved=0 holds=16 drifted=7
baseline_exit=0
```

Path:line — the population rule is `scripts/check-release-pins.mjs:178` (`recheck === "on-release"` **and** a tag in the source cell below `--stable`); the receipt it demands is `scripts/check-release-pins.mjs:70` `corpus/evidence/round-29/release-pins/receipt.json` (23 rows, ids `S033…S106`, no `S125`), with the independent refetch record at `:72` `corpus/evidence/round-29/release-pins/refetch/<id>.json`. Carrier cell: `corpus/SOURCES.md:139` (`recheck = on-release`, source cell carries `refs/tags/154.0.8037.97/`). Consequence: the corpus's own freshness line `corpus/README.md:629` ("held at 156.0.8078.47 for the 23 tag-pinned rows") and `SCORECARD.md:1481` (population 23) no longer describe the registry, and a frozen lane gate fails at the revision every item attacks. Siblings S123 (RFC text), S124 and S126 (W3C pages) carry no Chromium tag and are correctly outside the population — S125 is the sole new entrant.

**Smallest safe append-only fix** (verified, not merely proposed): append one row to `corpus/evidence/round-29/release-pins/receipt.json` plus one refetch record — no existing entry touched, no registry cell edited:

- receipt row `S125`: one file `chrome/test/chromedriver/session_commands.cc`, `old_tag 154.0.8037.97`, `old_status/new_status 200`, `old_sha256 7b40e94c…bb5`, `new_sha256 1bb1537c89f579436479b72666547a46bb7369a11228982ae855c690b31fac06`, `ranges [[287,289],[332,338],[378,378],[407,410],[429,464],[510,510]]` (all six tokens already appear in S125's anchor cell, so `f4-ranges` passes), bytes filed at `…/bytes/154.0.8037.97/` and `…/bytes/156.0.8078.47/` (156 bytes fetched this seat: HTTP 200, 92,700 B, decoded `1bb1537c…`);
- `…/refetch/S125.json` with a seat differing from the receipt row's `fetched_by` (same path at 156, status 200, `1bb1537c…`).

At 156 every anchored block still occurs as a contiguous block — hits at lines 287, 332, 378, 411, 440, 521 — so the entry evaluates **holds**, not drifted. Fixture check inside my own scratch clone (commit `c067cd7`, then reset):

```
node scripts/check-release-pins.mjs --rev HEAD --stable 156.0.8078.47
RELEASE_PINS verdict=clean … population=24 resolved=24 unresolved=0 holds=17 drifted=7   # exit 0
```

The alternative — changing S125's `recheck` to a date so the row leaves the population — also restores exit 0 but edits a claim cell and drops the release trigger the row is genuinely exposed to; I recommend the receipt append.

## Cell-by-cell verdicts (`corpus/SOURCES.md:139`)

| cell | verdict |
|---|---|
| `id` S125 | holds — unique in the registry (`git log -S'| S125 |' -- corpus/SOURCES.md` returns only `b234a58`; baseline `d805d1d` has no such row), so no id overwrite |
| `source` URL | holds — the bare Gitiles URL as written answers HTTP 200 (823,015 B HTML); the `?format=TEXT` form answers 200 (90,944 B) |
| `kind` code | holds — it is upstream source at a pinned tag |
| `tier` A | holds — primary upstream source for its scope; `check-sources` reports no `tier_inflation` |
| `scope` | holds — "returned endpoint" (288-289), "mapper target" (378, 407-410), "mapper's `session.new`" (452-460) all present; "not a support promise and not documentation prose" is exactly what the bytes support |
| `anchor` | holds with two nits (below): tag/commit/tree reproduce, all six line spans resolve, both decoded digests reproduce twice |
| `teaches` | holds — four clauses, each grounded above; no clause exceeds the file |
| `status` mined | holds — opened and probed this round |
| `opened` 2026-10-26 | holds — matches the w1 seat receipt `…/w1/ScribeSrcChromeDriver/gitiles-log.tsv:4` (`16:06:48Z 200 90944 c5d66f5a…`) and the committed decoded copies (`sha256.txt:2` = `7b40e94c…`) |
| `recheck` on-release | **defect (high), above** — legal token (`check-sources.mjs:322`), consistent with sibling tag-pinned code rows, but unresolved in the frozen freshness receipt |
| `used-by` | holds — `corpus/knowledge/webdriver-bidi-runtime-round-32.md:5` cites S125 with aligned locators (`:288-289`, guard at `:287`), and that entry is the file that consumes it (`scripts/bidi-loopback-round32.mjs:90,103,108` sends `webSocketUrl: true` and dials `caps.webSocketUrl`); `check-sources` reports no `used_by_uncited` |

## Lesson Gate row (`corpus/lessons/round-32.md:10`, inside `## Gate` at line 9)

- **Location claim** "`session_commands.cc:288-289`, inside `if (session->web_socket_url)` at 287" — holds: 287 is the guard, 288-289 the statement.
- **Quote, verbatim, ≤25 words** — 8 words, at exactly that location: `caps.Set("webSocketUrl", "ws://" + session->host + "/session/" + session->id);` (whitespace-normalised equality with bytes 288-289: `diff` of the normalised forms is empty; the source splits the statement at `"webSocketUrl",` and indents the continuation, which the table cell necessarily joins).
- **Receipt** "2026-10-26T16:06:48Z … HTTP 200, 90,944 B raw `?format=TEXT`, decoded sha256 `7b40e94c…`" — holds: reproduces exactly, including the w1 seat log line.
- **Nit 3 (low)**: the parenthetical "(12 tokens)" does not reproduce — 8 whitespace words, 19 identifier/operator tokens. The ≤25-word discipline is met either way; the counter is the only unreproducible character in the row.

## Other nits (low, report-only)

1. `anchor`, `capabilities.cc:1362` is cited "for the boolean parse" but the bytes at 1362 are `// W3C defined capabilities.`; the parse is entirely at 1375-1376. Smallest append-only fix: extend the anchor to read "capabilities.cc:1362 (W3C capability-map block marker) and 1375-1376 (`webSocketUrl` → `ParseBoolean`)".
2. `anchor` lists two decoded digests without saying which blob each belongs to — verified `7b40e94c…` = `session_commands.cc`, `597c1a33…` = `capabilities.cc`. Smallest fix: label them by basename in the same cell (or in the lesson Gate row).
3. **Informational identity hazard**: the spellings `S124/S125/S126` were also staged-candidate ids in rounds 26-28 — `corpus/lessons/round-27.md:32` lists "absent/refuse: … S124, S125, S126" and `corpus/lessons/round-28.md:8` records "S125 reopened this round (reject)" for `draft-ietf-httpbis-rfc6265bis-13.txt`. Registry ids are unique (`git log -S` shows a single row introduction), so no cell is false, but a reader grepping "S125" in lessons meets a refused cookie draft and a mined driver file. Smallest fix: one errata line in the round-32 Gate note or `SOURCES.md` §Search log saying those staged-candidate ids are not registry rows.

## Not measured here (stated so it is not read as passed)

No browser run, no C1 gate run, no C2 gate run, no frontier-admission run — outside this item. Neighbouring gates I did run at `b234a58` for blast radius: `check-source-reopen-receipt.mjs --rev HEAD` → `reopened 6, resolved 6, clean true` (exit 0); `check-gate-registry.mjs --rev HEAD` → `rows=40 gates=22 nonconformant=0` (exit 0); `check-freshness.mjs --witness HEAD` → `clean, matched=34 unique=34` (exit 0).
