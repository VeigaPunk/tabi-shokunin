# RefetchS062 — C3 independent re-fetch and attack of registry row S062

Seat: `RefetchS062` (leaf critic, wave tabi-r29-w2 = falsify). Milestone C3.
Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Tip measured: `32008a453737a27f69e9ab401d0b9775d2a944f7` (branch `master`); baseline `856fa9e1202179f5cfbd28c1f0efdd4eb1f426bb`; claims read first at `97be89bc66139eb45526a04af59a35dccc006eb9` (`.ufo/waves/round-29/claims.json`, `frozenBeforeData: true`).
Scratch: `/fast/scratch/hyaku/tabi-r29/RefetchS062` (one live clone per seat, `git clone --shared`; removed after receipts were copied out). No lane tracked file, index or jj state written.

Row S062: `corpus/SOURCES.md:76`, recheck `on-release`, pinned `154.0.8037.97`, used by `corpus/knowledge/harness-hardening-round-18.md`. Receipt entry `fetched_by: PinS062`, `superseded_by: null`.

## Verdict

**The wave-1 bytes are authentic and reproduce exactly; row S062 holds, verdicts agree.** My independent fetches at `156.0.8078.47` and `154.0.8037.97` are byte-identical to every committed byte file (8/8 `cmp` clean) and hash to every `old_sha256`/`new_sha256` in the receipt. Recomputing the counter's own rule over my own bytes gives `holds` for all four files, matching the receipt's computed verdict and the round-29 knowledge recheck mapping.

**But the integrated tip cannot satisfy C3 as frozen: there is no `refetch/` directory at all (finding A1).** `node scripts/check-release-pins.mjs --rev 32008a45… --stable 156.0.8078.47` exits 1 with `population=23 unresolved=23`; every row, S062 included, is blocked on `f6-refetch` alone. The C3 predicate requires an independent re-fetch record per row; wave 1 produced none (`git ls-tree` at the tip: 46 byte files, zero `refetch/*.json`), so wave 2's records are load-bearing for the claim, not optional corroboration. My `S062.json` is one of the 23 required.

## 1. Fetches (mine, not reused)

Per item 1, own Gitiles GETs, `?format=TEXT`, `base64 -d`, HTTP status kept:

```
curl -sS -w '%{http_code}' 'https://chromium.googlesource.com/chromium/src/+/refs/tags/<tag>/<path>?format=TEXT'   # -> base64 on 200
base64 -d < body > bytes/<tag>/<path> ; sha256sum
```

All 8 requests HTTP 200 (`RefetchS062.http-154.txt`, `RefetchS062.http-156.txt`). No 404, therefore no nonce normalisation was applied and raw sha256 = normalised sha256 for every file of this row (item 5 is not triggered — S062 has no absent file).

| # | path | 156 status | my sha256 (156) | receipt `new_sha256` | agree |
|---|---|---|---|---|---|
| 1 | `content/public/common/content_switches.cc` | 200 | `0262144447bae97b511b1f4e3cfcda4dcd58c5775c890b0b2ff517a3d1b4764e` | `02621444…b1b4764e` | yes |
| 2 | `content/browser/devtools/devtools_pipe_handler.cc` | 200 | `9ff89d7d46fdad7a94dbcca75adf9978aa6a7be1e3a18de785ddce712b5b5fb6` | `9ff89d7d…2b5b5fb6` | yes |
| 3 | `chrome/browser/devtools/remote_debugging_server.cc` | 200 | `9279d6f59241d780e02307975ee1fbfd2e95a8294547b32f73a926314d81d15d` | `9279d6f5…4d81d15d` | yes |
| 4 | `content/browser/devtools/devtools_http_handler.cc` | 200 | `c9b306d5c2aeac078d50c6ebbfb44727c301ae11e5309a87da6a596f7d105680` | `c9b306d5…7d105680` | yes |

| # | path | 154 status | my sha256 (154) | receipt `old_sha256` | agree |
|---|---|---|---|---|---|
| 1 | `content/public/common/content_switches.cc` | 200 | `02621444…b1b4764e` (same as 156) | `02621444…b1b4764e` | yes |
| 2 | `content/browser/devtools/devtools_pipe_handler.cc` | 200 | `30b772e6f7fc34d1e30b9e288fd2f23aaf2b36b481eeb7180e44f08716583264` | `30b772e6…16583264` | yes |
| 3 | `chrome/browser/devtools/remote_debugging_server.cc` | 200 | `9279d6f5…4d81d15d` (same as 156) | `9279d6f5…4d81d15d` | yes |
| 4 | `content/browser/devtools/devtools_http_handler.cc` | 200 | `9fa47f6bec780d8dc6a9c2eb2132af24e51eb03fe342d24d1094227754f0b011` | `9fa47f6b…54f0b011` | yes |

Byte authenticity against the committed blobs at the tip (my bytes vs `git show <tip>:corpus/evidence/round-29/release-pins/bytes/<tag>/<path>`), `cmp -s` in a clean clone (porcelain empty, `HEAD=32008a45…`): `SAME` for all 8 — so the committed receipt bytes are exactly what these tags serve, not a wave-1 transcription.

Deliverable: `.ufo/waves/round-29/w2/refetch/S062.json`, schema-checked (`jq -e` true), values from these fetches, `fetched_at: 2026-10-26T05:10:52Z` (last decoded byte's mtime, `date -u -d @$epoch`).

## 2. Counter verdict recomputed by hand

Reimplemented the counter's rule (`scripts/check-release-pins.mjs`: `normLine = trim + collapse inner whitespace`, `blockIn` = contiguous substring search anywhere) over my own 154/156 bytes; script kept as `RefetchS062.block-check.mjs`:

```
content/public/common/content_switches.cc        range=596-603 oldlines=991  blockAtNewLine=596  holds
content/browser/devtools/devtools_pipe_handler.cc range=135-200 oldlines=479 blockAtNewLine=135  holds
chrome/browser/devtools/remote_debugging_server.cc range=353-400 oldlines=425 blockAtNewLine=353 holds
content/browser/devtools/devtools_http_handler.cc range=297-306 oldlines=1063 blockAtNewLine=308 holds
```

(`oldlines` is the counter's `split("\n")` length; physical `wc -l` is one less: 990 / 478 / 424 / 1062. Every `b` is inside the bound.)

- Row verdict: **holds** (all four files hold). No drift ⇒ no superseding row is due; `superseded_by: null` is correct and `s1-drift-unsuperseded` must not fire.
- Agreement with the round-29 knowledge recheck (`corpus/knowledge/chromium-156-release-pin-recheck.md:30`): "596-603→596-603 … 135-200→135-200 … 353-400→353-400 … 297-306→308-317" — identical to my independently located block positions, including the `+11` shift on `devtools_http_handler.cc` (insertions of +1 at 156 line 28, +1 at 61, +8 at 92-99, and +1 from the CHECK split at 285-286 give 297→308; the block itself is unchanged text).
- Agreement with the receipt: the counter computes verdicts rather than reading them, so I recomputed rather than compared. My `holds` ×4 matches what the receipt's content implies.

**Counter at the tip** (`RefetchS062.counter-at-tip.json`): `exit=1`, `population=23`, `unresolved=23`, and for S062 `verdict: null` with `reasons: ["f6-refetch …" ×4]` — the row's verdict is unknowable at the tip because the refetch binding is absent.

**With my record** (fixture repo under scratch, `git init` in `$S`, toplevel verified equal before first commit; copy of `SOURCES.md`, the receipt and S062's 8 byte files, plus my `refetch/S062.json`): `rows[S062] = {resolved: true, verdict: "holds", reasons: []}`. The fixture's overall `exit=1 / unresolved=22` is an artifact of the other 22 rows' bytes not being copied in; only the S062 row result is meaningful there (`RefetchS062.fixture-with-refetch.json`).

## 3. ±25-line semantic window in the 156 bytes

Windows read: switches `571-628`, pipe `110-225`, rds `328-425`, http `283-342`. Every change between 154 and 156 for this row lies **outside** the anchored blocks (`diff -u`: pipe 2 hunks, http 14 hunks; kept as `RefetchS062.diff-pipe-154-156.txt`, `RefetchS062.diff-http-154-156.txt`). None alters what the teaches cell asserts ("Pipe mode uses stdio descriptors 3 and 4; the port switch separately opens HTTP and its handler writes DevToolsActivePort; dropping the port is necessary even when the pipe is present"):

| change in 156 | line(s) | effect on the teaches cell |
|---|---|---|
| `PipeWriterCBOR::WriteIntoPipe`: `DCHECK(IsCBORMessage)` → `CHECK(…, base::NotFatalUntil::M159)` | pipe `305-306` | none — message framing check; not transport selection |
| `DevToolsPipeHandler::OnDisconnect`: `DCHECK(browser_target_)` → `CHECK(…, NotFatalUntil::M159)` | pipe `436` | none — teardown invariant |
| `Start` pre-block: `DCHECK(thread->task_runner()->BelongsToCurrentThread())` → `CHECK(…, M159)` | http `285-286` (**inside ±25 of the block, outside it**) | none — thread assertion only; the block's `DevToolsActivePort` write is untouched (`http 308-317`, still `kDevToolsActivePortFileName` at `:312`) |
| `DCHECK`→`CHECK(…, M159)` conversions | http `246, 264, 347, 353, 361-362, 378-379, 388` | none |
| `kNativeFilePathStyle` ("windows"/"posix") + `version.Set("File-Path-Style", …)` | http `93-99`, `631` | none for the teaches cell — additive field on `/json/version`; the assertions that the port handler writes `DevToolsActivePort` are unaffected |
| `AllowInspectingTarget` gate → 403 "Target is not inspectable" | http `711-718`, `902-908` | none — inspectability policy, not transport opening |
| same-origin allowance for the `Origin` header | http `837-846` | none for this row's teaches; **note for whoever owns S064** (`remote-allow-origins`): a request whose `Origin` equals `http://<server ip>` is now admitted without `--remote-allow-origins`. That is a real semantic change, but it is not what S062 asserts and it does not move S062's verdict. |

`content_switches.cc` and `remote_debugging_server.cc` are byte-identical between the tags (equal sha256), so no window risk exists there; the block `remote_debugging_server.cc:353-400` still contains both the pipe-only start (`:355-361`) and the unconditional port block (`:363-397`), which is what "separately opens HTTP" rests on.

## 4. Filing completeness (wave-1 attack: the counter accepts subset filing)

Anchor cell of `SOURCES.md:76` cites exactly four (file, range) pairs; the receipt filed exactly the same four, no more, no fewer:

| cited by anchor | filed by receipt | ranges equal |
|---|---|---|
| `content_switches.cc:596-603` | `content/public/common/content_switches.cc` `[596,603]` | yes |
| `devtools_pipe_handler.cc:135-200` | `content/browser/devtools/devtools_pipe_handler.cc` `[135,200]` | yes |
| `remote_debugging_server.cc:353-400` | `chrome/browser/devtools/remote_debugging_server.cc` `[353,400]` | yes |
| `devtools_http_handler.cc:297-306` | `content/browser/devtools/devtools_http_handler.cc` `[297,306]` | yes |

No cited file or range is missing; no filed range is uncited. **For S062 the subset-filing hole is latent, not exercised** — but it is real, and it is exploitable in precisely the direction that hides drift:

- **A2 (demonstrated, high).** Deleting the two files that actually changed — `devtools_pipe_handler.cc` and `devtools_http_handler.cc` — from the entry leaves `{resolved: true, verdict: "holds", reasons: []}` (`RefetchS062.fixture-file-omission.json`). The counter iterates `entry.files` and never asks whether every anchor-cited `(basename, range)` pair has a filed file, so the only files that could drift are the ones an entry may omit. A row can pass while its two non-identical files are unexamined. Smallest safe correction: invert the loop — for each anchor-cited `basename:range` token, require one filed file whose `basename` matches and whose `ranges` cover that interval (and keep `f4` rejecting tokens the anchor does not spell).
- **A3 (tested, closed).** Filing `devtools_pipe_handler.cc` as `[135,136]` is rejected: `f4-ranges … [135,136]`, because `anchorHasRange` requires the literal token `135-136` in the anchor. No correction needed — but note it is the token, not coverage, that closes it, which is why A2 (whole files dropped) survives.

## 5. Findings against C3's stated predicate

- **A1 (blocker, freshness).** At `32008a45…` the C3 target `unresolved = 0` is **not met**: `exit=1`, `unresolved=23`, and the sole reason per row is `f6-refetch`. `corpus/evidence/round-29/release-pins/` at the tip contains `bytes/` (46 files), `chromiumdash-stable-linux.json`, `receipt.json` — and no `refetch/` (verified with `git ls-tree -r --name-only <tip>`). The claim's own controls show `f6` working (`copiedOldAsNewJunk` → `unresolved=1`), so this is not a counter defect: the records simply were never produced in wave 1, and the C3 predicate binds the claim to them. Smallest safe correction: commit the 23 `refetch/<id>.json` records (mine: S062), then re-run the counting command; no receipt field, byte file or registry row needs to change. Until then C3 reads as unverified at the tip, whatever the per-row verdicts say.
- **A4 (evidence strength, pre-existing at 154 — not a drift).** The "descriptors 3 and 4" clause is anchored only by a *comment* inside `content_switches.cc:596-597` (`// Enables remote debug over stdio pipes [in=3, out=4]`); `devtools_pipe_handler.cc:135-200` shows the descriptor being *injected* (`PipeReaderBase(…, int read_fd)`, ctor `:397-402` takes `read_fd`/`write_fd`), not that the numbers are 3 and 4. This is unchanged 154→156, so it is not a freshness defect and does not block C3; it is a weakness of the row's evidence, and the correction (adding the launch site that passes 3/4 as an anchor) belongs to a depth/coverage claim, not to this seat.
- **A5 (quality clause).** S062 holds, so no recheck note is required; one exists anyway (`chromium-156-release-pin-recheck.md:30`, plus the append-only note at `harness-hardening-round-18.md:91-93` for the drifted rows). The `killed` clause "drifted row whose citing knowledge entries carry no round-29 recheck note" is not triggered for S062.
- **A6 (consistency of the citing knowledge).** `harness-hardening-round-18.md:26` cites `remote_debugging_server.cc:353-361` (pipe switch starts no HTTP listener) and `:397-400` (guard comment names both flags) — both inside the anchored `353-400`, both still true in the 156 bytes. `:4` records the round-18 commit `b510e9d7…` for the 154 fetch; my 154 bytes reproduce that row's recorded decoded sha (`02621444…b1b4764e`, `corpus/lessons/round-18.md:43`), so the 154 provenance still chains.

## 6. Commands and exit codes

| command | exit |
|---|---|
| 4 × `curl -sS -w '%{http_code}' …156.0.8078.47…?format=TEXT` + `base64 -d` + `sha256sum` | 0 (all HTTP 200) |
| 4 × same at `154.0.8037.97` | 0 (all HTTP 200) |
| `git clone -q --shared <lane> clone`; `git -C clone checkout 32008a45…`; `git -C clone status --porcelain` (empty) | 0 |
| 8 × `cmp -s <committed bytes> <my bytes>` | 0 (8 × `SAME`) |
| `node scripts/check-release-pins.mjs --rev 32008a45… --stable 156.0.8078.47 --json` (clean clone) | **1** (`population=23 unresolved=23`, S062 reasons `f6-refetch` ×4) |
| `node block.mjs` (independent `normLine`/`blockIn` recompute) | 0 (4 × `holds`) |
| fixture repo: `mktemp -d -p $S`, `git -C $D init -q`, toplevel check, copy `SOURCES.md` + receipt + S062 bytes + `refetch/S062.json`, commit in `$D` only | 0 |
| `node scripts/check-release-pins.mjs --repo $D --rev HEAD --stable 156.0.8078.47 --json` | 1 overall (22 other rows' bytes absent by construction); S062 `{resolved: true, verdict: "holds"}` |
| same with S062's two changed files deleted from the entry | 1 overall; S062 `{resolved: true, verdict: "holds"}` → **A2** |
| same with `devtools_pipe_handler.cc` ranges `[[135,136]]` | 1 overall; S062 `unresolved`, `f4-ranges … [135,136]` → **A3 closed** |
| `jq -e` schema check of the deliverable | 0 |

Tooling: nothing installed or upgraded this seat (no `pacman`, no `uv`, no release binaries); no format/build/lint of the lane; no network beyond the 8 read-only Gitiles GETs.

## 7. Residual risks I did not close

- I did not verify the other 22 rows (out of seat scope); A1 is a per-row-blind structural fact (the directory is absent), so it applies to all of them.
- `f6-refetch` checks only that a differently-named seat reported the same `(path, tag, status, sha256)`; it cannot detect a seat that copies the receipt's 156 bytes and calls them its own fetch. My record is a genuine re-fetch (own GETs, own decode, own digests, own bytes preserved under scratch `bytes/156.0.8078.47/`), but the field itself is not tamper-evident.
- I did not read the 154→156 history (Gitiles log/diff between tags) to explain *why* `devtools_http_handler.cc` gained 11 lines; the block-level and window-level evidence above is direct from the two byte sets, which is what the counter rule uses.
