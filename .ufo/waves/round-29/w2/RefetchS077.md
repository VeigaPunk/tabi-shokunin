# RefetchS077 — C3 independent re-fetch and attack of row S077

- Seat: RefetchS077 (leaf, no dispatch). Round 29 / attempt 1 / w2 falsify.
- Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`, measured revision `32008a453737a27f69e9ab401d0b9775d2a944f7` (counter run) in a clean `git clone --shared` under `$S=/fast/scratch/hyaku/tabi-r29/RefetchS077`; `git status --porcelain` empty before the run. Note the lane branch tip is now `e1e3a15` (wave-1 evidence commit added after the integrated tip); the receipt blob and counter are unchanged between them (`git log --oneline -3 -- corpus/evidence/round-29/release-pins/receipt.json` → `32008a4` newest).
- Wave-1 bytes were not reused: every byte string below comes from my own Gitiles GET issued in this seat.

## 1. Per-file fetch (item 1) — agree on all fields

| path | tag | my status | my sha256 | receipt field | agree |
|---|---|---|---|---|---|
| `third_party/blink/renderer/core/html/forms/form_mcp_schema.cc` | 156.0.8078.47 | 200 | `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f` | `new_status=200`, `new_sha256=904b75e7…152f` | agree |
| same | 154.0.8037.97 | 200 | `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f` | `old_status=200`, `old_sha256=904b75e7…152f` | agree |

Decoded sizes: 51 703 bytes / 1 440 lines at both tags. `cmp` of each committed blob against my own decode: identical for both tags (exit 0). Refetch record written to `.ufo/waves/round-29/w2/refetch/S077.json` from my fetch (status int 200, sha as above, `fetched_at` = `2026-10-26T05:13:41Z`, seat `RefetchS077` ≠ receipt `fetched_by` `PinS077`).

404 rule: not applicable — both statuses are 200, no `request_id` nonce, no normalisation field involved.

## 2. Commands and exit codes

```
# fetch (scratch), Gitiles ?format=TEXT, base64 -d
curl -sS -o raw_156.b64 -w '%{http_code}' 'https://chromium.googlesource.com/chromium/src/+/refs/tags/156.0.8078.47/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT'   # 200
curl -sS -o raw_154.b64 -w '%{http_code}' 'https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/…/form_mcp_schema.cc?format=TEXT'                                  # 200
base64 -d raw_156.b64 > dec_156.cc && sha256sum dec_156.cc      # exit 0, 904b75e7…
base64 -d raw_154.b64 > dec_154.cc && sha256sum dec_154.cc      # exit 0, 904b75e7…
cmp committed_154 dec_154.cc ; cmp committed_156 dec_156.cc      # exit 0, exit 0
node recompute.mjs <committed 154> <my 156> > recompute.json     # exit 0, fileVerdict=holds
node scripts/check-release-pins.mjs --rev 32008a45… --stable 156.0.8078.47 --json   # exit 1
diff -u dec_154.cc dec_156.cc                                    # exit 0 (no output)
# fixture runs (mktemp -d -p "$S", git init, toplevel verified == $D)
node scripts/check-release-pins.mjs --repo "$D" --rev c380f6c… --stable 156.0.8078.47 --json   # exit 0
node scripts/check-release-pins.mjs --repo "$D" --rev b67e7e4… --stable 156.0.8078.47 --json   # exit 0  (subset filing)
node scripts/check-release-pins.mjs --repo "$D" --rev 800f53a… --stable 156.0.8078.47 --json   # exit 1  (extra range)
```

## 3. Verdict recomputed from bytes (item 3) — agrees: holds

Counter rule implemented verbatim (`normLine = trim + collapse inner whitespace`, `blockIn` contiguous anywhere in the new file):

| range | old lines | contiguous block in my 156 bytes | new start line |
|---|---|---|---|
| 49-111 | 63 | yes | 49 |
| 208-490 | 283 | yes | 208 |
| 930-1093 | 164 | yes | 930 |
| 1238-1438 | 201 | yes | 1238 |

→ my file verdict `holds` (all four blocks found, none drifted).

Counter verdict at `32008a45`: `{"id":"S077","resolved":false,"verdict":null,"reasons":["f6-refetch third_party/blink/renderer/core/html/forms/form_mcp_schema.cc"]}` — `population=23 unresolved=23 exit=1`. So at the measured revision the counter cannot yet emit a row verdict for S077: the only failing gate is the missing independent re-fetch record (`corpus/evidence/round-29/release-pins/refetch/` does not exist at that rev). No digest, path, range, status or digest-binding reason fires. With my record placed at that path in a faithful fixture (real S077 row line, real receipt entry, real committed bytes), the counter returns `resolved=1, verdict=holds, exit=0`. **Verdict agreement: yes** — my recompute and the counter agree on `holds`; the tip disagreement is the unfed f6 gate, not a bytes or verdict disagreement.

±25 lines around each anchored block (committed 154 vs my 156): 0 differing lines in every window (24-136, 183-515, 905-1118, 1213-1441), 0 outside the block. The whole file is byte-identical, so nothing outside the blocks changes what the teaches cell asserts.

## 4. Filing completeness (item 4)

Anchor cell of S077 (`corpus/SOURCES.md:91`) cites exactly one file and four ranges: `` `form_mcp_schema.cc:49-111,208-490,930-1093,1238-1438` ``, plus tag `154.0.8037.97`, commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`, and decoded SHA-256 `904b75e7…152f`.

- Cited file missing from the receipt entry: **none** (receipt lists that one file).
- Cited range missing from the receipt entry: **none** — receipt ranges are exactly `[[49,111],[208,490],[930,1093],[1238,1438]]`.
- Receipt range not cited by the anchor: **none**.
- Anchor commit/tag: my Gitiles ref fetch returns `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d` for `refs/tags/154.0.8037.97` (committer time Wed Sep 30 21:20:00 2026) — matches the anchor. `refs/tags/156.0.8078.47` resolves to `1d17a2e2ee147bb7d6ae2ab6abdb3a2510c17775` (Mon Oct 19 20:07:21 2026).
- Anchor digest: `904b75e7…` matches `old_sha256` (f5 satisfied).
- Assertion coverage: every element of the teaches cell sits inside a filed range — unknown-key / rejected-value error templates at 216-230 (`kInvalidInputArguments`, `"Input contains a parameter … but there is no such parameter for the tool"`, `"Invalid value … for parameter"`), type-specific dispatch 254-300, custom-element bypass 289-292 (`return true;` with the TODO), `FillParameterData` dispatch 451-490, `Fill*` setters 933-1093 (`FillCustomElementData` 1056-1062), `ProcessForm` 1238-1260 and the `Is*` predicates through 1438 (range ends exactly on the closing brace of `IsFile`, no mid-function cut).

Uncited spans: 112-207 (ctor/`ComputeJSON`/`ReportParameterIssueIfNeeded`), 491-929 (schema construction — filed by S098 as 491-928), 1095-1237 (`AddDescription`/`AddPattern`/`ComputeDescription`/`LabelText`), 1439-1440. None of them carries the S077 teaches assertion, so this row's provenance is not false; see A1 for the counter-level hole this leaves.

## 5. Attack findings

**A1 — subset filing is accepted (defect, live in the counter, not live in this row).** Fixture with the real S077 row/receipt/bytes/refetch, receipt ranges reduced to `[[49,111]]` only: counter `exit=0 resolved=1 verdict=holds` (`RefetchS077.fx-subset-filing.json`, rev `b67e7e4`). The full-filing fixture also gives `exit=0 resolved=1` (`RefetchS077.fx-full-filing.json`, rev `c380f6c`). So three of the four anchor-cited ranges can be dropped with no verdict change: `f4-ranges` iterates the receipt's ranges and checks each against the anchor, never the converse. Control that the opposite direction does work: adding receipt range `[1,2]` (not in the anchor) yields `exit=1`, reason `f4-ranges … [1,2]` (`RefetchS077.fx-extra-range.json`, rev `800f53a`). Smallest safe correction: after the per-range loop, require every range token the anchor cites for `basename(path)` to be present in `f.ranges` (parse `basename\((\d+)(?:-(\d+))?\)` out of the anchor cell), so a partial filing fails instead of passing.

**A2 — this row's hold is vacuous (trade, not a defect).** `old_sha256 == new_sha256`: the file is byte-identical at 154.0.8037.97 and 156.0.8078.47 (`diff -u` empty, `RefetchS077.diff-154-156.txt`). Three independent signals rule out a tag-routing artefact rather than a genuine no-change: (a) the two tag commits differ (`b510e9d7…` vs `1d17a2e2…`); (b) the probe file `html_form_element.cc` fetched by the same method differs across the tags (`8c8d6796…` at 154, `2a96a97b…6102` at 156 — the latter matching S110's cited abbreviation); (c) my 154 fetch reproduces `old_sha256` exactly. Consequence: S077 contributes **zero** freshness signal — its "on-release re-verification" cannot detect drift by construction, so the C3 claim's population count of 23 includes at least this row whose resolution is a tautology. It is honest (the row's teaches cell is still true at 156), but the recheck note should say "unchanged at 156" rather than imply a re-read that could have drifted.

**A3 — the digest gate binds only the old bytes (defect class, closed here by f6).** `f5-digest` compares the row's cited sha256 against `old_sha256` only; `f3-bytes` self-hashes whatever is committed. A receipt that committed fabricated "new" bytes with a self-consistent `new_sha256` would pass f3 and f5; only `f6-refetch` (different seat, receipt's `new_status`/`new_sha256`) defends. For S077 that defence is real: my independent GET returns 200 and exactly the receipt's `new_sha256`, so the committed 156 bytes are authentic.

**A4 — no outside-block change.** Since the file is identical, the ±25-line windows around all four blocks contain 0 differing lines; nothing outside a block alters the teaches cell. No attack lands on the semantic claim.

**A5 — anchor/teaches decoupling is unmeasured.** 711 of 1 440 lines (49%) are cited; the uncited spans listed in §4 are invisible to the counter. A future row could cite ranges that do not contain the lines its teaches cell asserts and still resolve. Same correction surface as A1: bind the filed ranges to the anchor, and (stronger, optional) require the teaches cell to name the ranges it rests on.

## 6. Contract incident — disclosed in full

While setting up the fixture I ran a command whose `D=$(cat …)` read a path file I had mistakenly written to the fleet root instead of my scratch dir; `D` was empty, `cd "$D"` failed, and the following `git -C "$D" … add -A && commit -qm A` ran **in the fleet repo** `/home/vgpnk/Projects/shokunin`. That created commit `c16a334f` ("A") on the fleet repo and staged the fleet working tree (including gitlink entries for every sibling lane; no sibling repo's own `.git` was touched, no working-tree file was modified).

Repair performed, in this order:
1. `git reset --mixed 9b84562b9cb50f0d67934437c56a163b000d14bd` (first attempt aborted on `.git/index.lock` held by another process; retried after the lock cleared) → `HEAD=9b84562b`, `git diff --cached --stat` empty, `HEAD^{tree} == 9b84562b^{tree}`.
2. The fleet's own exporter had in the meantime written `master` to my commit (`git reflog show master` → `c16a334f master@{0}: export from jj`); I restored it with `git update-ref refs/heads/master 9b84562b…`. Now `main=master=9b84562b`, `HEAD` detached at `9b84562b` (the pre-incident shape), and the fleet working tree is byte-for-byte as before (my commands only ever wrote `.git` objects/index/refs).
3. Removed the stray `fixture_path.txt` I had created in the fleet root (`rm -f`; verified absent).

Residual risk I cannot fix within my bounds: the exporter's reflog entry shows jj imported the commit, so the fleet's jj op log may still carry a change whose description is "A"; abandoning it is the fleet owner's call. Commit `c16a334f` is now unreachable from `main`/`master` but still present in the object database (I did not run `gc`). Fleet HEAD/tree/refs otherwise match the pre-incident state.

## 7. Classification

- Row S077: **agrees / holds**, bytes authentic at both tags, filing complete, no outside-block semantic change → nothing for the canonical Rust judge to reject on this row.
- Live counter defect: **A1** (subset filing accepted; reproduced with the real S077 data) — fixable, smallest correction given above.
- Trade, report-only: **A2** (vacuous hold for a byte-identical file), **A3** (digest binds old bytes only; f6 is the sole defence, and it holds here), **A5** (anchor/teaches decoupling unmeasured).

## 8. Tooling

No installs, no upgrades, no pacman transactions. Tools used: `curl`, `base64`, `sha256sum`, `diff`, `python3`, `node` (all pre-existing).

## 9. Evidence files in this output dir

`S077.json` (my refetch record), `RefetchS077.fetch.txt`, `RefetchS077.recompute.json`, `RefetchS077.counter-at-tip.json`, `RefetchS077.fx-full-filing.json`, `RefetchS077.fx-subset-filing.json`, `RefetchS077.fx-extra-range.json`, `RefetchS077.probes.txt`, `RefetchS077.diff-154-156.txt`. Decoded bytes stayed in scratch (`$S/dec_*.cc`).
