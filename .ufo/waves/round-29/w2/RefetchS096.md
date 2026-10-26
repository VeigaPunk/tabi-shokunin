# RefetchS096 — C3 independent re-fetch and attack of row S096

Seat: `RefetchS096` (leaf, no dispatch). Round 29, wave w2, claim C3 (freshness).
Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`; measured in a clean `git clone --shared`
of `32008a453737a27f69e9ab401d0b9775d2a944f7` in `$HYAKU_SCRATCH/tabi-r29/RefetchS096/lane`
(`git status --porcelain` = 0 lines). All fetches are mine; no byte, digest or verdict below is
copied from `PinS096`'s w1 output. Outputs:

- `.ufo/waves/round-29/w2/refetch/S096.json` — refetch record (schema as instructed).
- `.ufo/waves/round-29/w2/refetch/RefetchS096.{counter,probeA,probeB,probeC,probeD}.json` and
  `RefetchS096.digests.txt` — tip counter run, probes, digests.

## 1. Independent fetch (156.0.8078.47)

```
cd $S/fetch156 && P='third_party/blink/renderer/core/html/forms/html_form_element.cc'
curl -sS -o body.b64 -w '%{http_code}' \
  "https://chromium.googlesource.com/chromium/src/+/refs/tags/156.0.8078.47/$P?format=TEXT"
# -> 200   (b64 92716 bytes)
base64 -d body.b64 > body.cc && sha256sum body.cc
# -> 2a96a97bfb4246b7a23895be7548533ce7adc32286f10df36831e370f8f86102   body.cc (1761 lines)
```

Fetched twice (independent connections, `fetch156/`, `fetch156b/`); both decoded to the same
sha256, `cmp` identical. Exit codes: curl 0 (HTTP 200), `base64 -d` 0, `sha256sum` 0.

| file | tag | my status | my sha256 | receipt `new_status` / `new_sha256` | agree? |
|---|---|---|---|---|---|
| `third_party/blink/renderer/core/html/forms/html_form_element.cc` | 156.0.8078.47 | 200 | `2a96a97b…f8f86102` | 200 / `2a96a97b…f8f86102` | **agree** |

`git hash-object` of my decoded 156 bytes = `b3611221ba58efc420f5fa627aa30b14a75b4a77`; the S114
anchor's `blob b3611221` is therefore a true blob id of these bytes, computed by me, not read from
the row. Gitiles tag resolution (`/+/refs/tags/156.0.8078.47?format=JSON`, HTTP 200) returns
`commit: 1d17a2e2ee147bb7d6ae2ab6abdb3a2510c17775`, matching S114's commit claim.

## 2. Old-tag authenticity (154.0.8037.97)

```
cd $S/fetch154 && curl -sS -o body.b64 -w '%{http_code}' \
  "https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/$P?format=TEXT"
# -> 200 (b64 91040 bytes); base64 -d | sha256sum
# -> 8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916  (1740 lines)
```

Receipt `old_sha256` = `8c8d6796…b8c36916`, `old_status` = 200 → **agree**. `git hash-object` =
`cd7efa45834bfce0697b06c7092f16d084c4eb55`. Gitiles tag 154.0.8037.97 resolves to
`b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`, matching S096's own anchor text.

Committed evidence is byte-exact to my fetches, not merely sha-equal:

```
git show 32008a45:corpus/evidence/round-29/release-pins/bytes/156.0.8078.47/<P> > committed-156.cc
git show 32008a45:corpus/evidence/round-29/release-pins/bytes/154.0.8037.97/<P> > committed-154.cc
cmp fetch154/body.cc committed-154.cc && echo identical     # identical
cmp fetch156/body.cc committed-156.cc && echo identical     # identical
```

No 404 normalisation applied: both fetches were HTTP 200, so the S094 `request_id` rule is inert
for this row (raw sha256 = normalised sha256 above).

## 3. Verdict recomputed from my own bytes

Rule taken from `scripts/check-release-pins.mjs:157` (`normLine` = trim + collapse inner
whitespace), `:159-171` (`blockIn`, contiguous anywhere), `:232-242`.

```
python3: for a,b in [(174,328),(729,758),(818,842)]:
  seg = normLine(old[a-1:b]); blockIn(seg, normLine(new))
range 174-328 oldlines=155 holds=False newloc=None
range 729-758 oldlines=30  holds=True  newloc=(767, 796)
range 818-842 oldlines=25  holds=True  newloc=(856, 880)
```

→ one range drifted ⇒ **row verdict = drifted**, which is exactly what the row needs a supersession
for. Root cause of the drift, from my bytes:

```
sed -n '174,328p' fetch154/body.cc > old-range.txt ; sed -n '175,339p' fetch156/body.cc > new-range.txt
diff -u old-range.txt new-range.txt   # exactly one hunk, @@ -24,6 +24,16 @@, 10 added lines, 0 removed
```

The inserted block sits at `156:201-210` (comment 201-202, `if (!form_->GetDocument().IsActive())`
203, `return … kToolInvocationFailed` 204-208, `}` 209, blank 210); `155 + 10 = 165 = 339-175+1`, so
S114's range `175-339` is the 154 range plus that guard and nothing else.

### Verdict agreement with the counter

| measurement point | counter output | my recomputation |
|---|---|---|
| lane tip `32008a45` (clean clone), `node scripts/check-release-pins.mjs --rev 32008a45… --stable 156.0.8078.47 --json` — exit **1** | `population=23 resolved=0 unresolved=23 holds=0 drifted=0`; S096: `{resolved:false, verdict:null, reasons:["f6-refetch …/html_form_element.cc"]}` | drifted |
| scratch probe A: same tip + my `refetch/S096.json` committed in the probe clone, same command — exit **1** | S096: `{resolved:true, verdict:"drifted", reasons:[]}` | drifted — **agree** |

So at the tip there is **no row verdict for S096 at all**: the counter stops at `f6-refetch`
(`check-release-pins.mjs:217-220`), because `corpus/evidence/round-29/release-pins/refetch/` does
not exist at `32008a45` (`git ls-tree -r --name-only 32008a45 -- corpus/evidence/round-29/release-pins/`
lists `bytes/**`, `chromiumdash-stable-linux.json`, `receipt.json` and nothing else). With my record
in place the counter agrees with my independent computation. Every one of the 23 rows fails f6 at
the tip, so C3's `unresolved=0` target is currently unreached by construction, not by drift.

## 4. S114 truth check (the superseding row must be true of the 156 bytes)

With the 156 bytes I fetched:

- ranges: `175-339` = `154:174-328` + the 10-line guard (diff above); `767-796` and `856-880` are the
  exact relocated blocks (`newloc` above, line-for-line after `normLine`). **True.**
- digest: `2a96a97b…f8f86102` equals my fetch's sha256. **True.**
- `commit 1d17a2e2…` and `blob b3611221`: both independently reproduced (tag JSON, `git hash-object`). **True.**
- teaches cell: "new guard after the `FillFormControls` success path returns `kToolInvocationFailed`
  with the text … when the document is no longer active" — `156:201-210`, message split across
  `156:207-208`, matches. "a fill whose `input` or `change` handler detached the document no longer
  reaches the focus or `PrepareForSubmission` branches" — `156:211` ("Success. Now we can either
  submit the form or focus the submit button."), `submit_button->Focus()` at `156:226`,
  `form_->PrepareForSubmission(/*event*/ nullptr, submit_button)` at `156:231`, all below the guard.
  "shifted by +1 above line 197 and +11 at or below 200" — the +1 comes from `is_connected_nested_form_(false),`
  inserted at `156:126` (absent from `154:120-129`), verified; `154:197 → 156:198`, `154:200 → 156:211`. **True.**
- located quote: `supersede-row.md` records it at `156:201-202`; verbatim in my bytes:
  `// Filling out the form controls dispatches \`input\` and \`change\` events,` /
  `// whose handlers may have detached the document.` (20 words ≤ 25). **True.**
  Supporting statement at `156:207-208` (`"The document was detached while filling out "` /
  `"the form"`) also verbatim.

No false statement found in S114 on this row's evidence.

## 5. Filing completeness (both directions)

S096's anchor cell cites exactly one file and three ranges: `html_form_element.cc:174-328,729-758,818-842`.
The receipt entry files exactly that one path with exactly `[[174,328],[729,758],[818,842]]`
(`old_tag 154.0.8037.97`, `old_bytes`/`new_bytes` at the prescribed `bytes/<tag>/<path>` layout).

- cited file missing from receipt: **none**
- cited range missing from receipt: **none**
- receipt range not cited by the anchor: **none**

That is correct *for this row*, but see attack 1: the counter only enforces the second direction.

## 6. Attacks

### Attack 1 — subset filing is accepted (confirmed, real gap)

`check-release-pins.mjs:232` iterates `for (const r of ranges)` over the **receipt's** ranges only;
`:234` checks each filed range appears as a token in the anchor, but nothing iterates the anchor's
tokens to require that each cited range was filed. Probe B (scratch probe clone, my refetch record
present, receipt ranges reduced to the two ranges that genuinely hold, `superseded_by` removed):

```
python3: S096 files[0].ranges = [[729,758],[818,842]]
node scripts/check-release-pins.mjs --rev HEAD --stable 156.0.8078.47 --json   # exit 1 (other rows)
S096 -> {"resolved":true,"verdict":"holds","reasons":[]}
```

The drifted `174-328` is never compared, the row reports **holds**, and no supersession is demanded —
`unresolved` drops for a row whose anchored content provably changed. The committed filing does not
do this (all three cited ranges are filed), so the landed state is honest; the gate, however, would
not have caught the omission.

Smallest safe correction: after `:242`, also require that every range token the anchor cell cites
for this file is present in `f.ranges` (parse the anchor with the same `rangeToken`/digit-boundary
regex already used by `anchorHasRange`, ignore tokens past `oldLines.length` that belong to another
file in a multi-file row, and emit a new reason such as `f4-filing anchor range <a-b> unfiled`).
Add a self-test case: cited range drifted but unfiled → still unresolved.

### Attack 2 — the supersession gate is content-blind (confirmed, real gap)

`:252` accepts a superseder on two string facts only: `teaches` starts with `supersedes <id> —` and
`source` contains `refs/tags/<stable>/`. Probe D (committed receipt intact, my refetch present,
S114's anchor replaced by `html_form_element.cc:9000-9001` and an all-zero digest):

```
S096 -> {"resolved":true,"verdict":"drifted","reasons":[]}
```

A repair row that cites content which does not exist at the stable tag satisfies the gate. In the
landed tree S114 is true (section 4), so this is a latent gap, not a landed falsehood — but "C3
resolved" currently rests on one manual review of each superseding row, not on the counter.

Smallest safe correction: when the s1 branch is taken, bind the superseder to the same bytes already
in hand — require at least one anchor range that holds within `nb` under `blockIn`, and if the
superseder's anchor carries a digest, require `digestMatches(d, f.new_sha256)`. Add a self-test case:
bogus superseder ranges/digest → `s1-drift-unsuperseded`.

### Attack 3 — f6 is testimonial (inherent, no action)

`:217-220` accepts a refetch record on `seat != fetched_by` plus a matching sha/status. It cannot
prove the second seat went to the network; it does prove the claimed bytes equal the committed ones
(f3 hashes the same blob). The value is the forced second-actor statement, and my record is exactly
that. No correction needed; do not count f6 as independent corroboration of the network response
beyond what it is.

### Attack 4 — saturation/verification pressure (observation for the L1)

C3's target `unresolved=0` requires 23 refetch records; at the tip `resolved=0`, `unresolved=23`.
Any statement that C3 passes before all 23 records are committed would be false regardless of the
receipt quality. My record resolves S096 only (`probeA`: `resolved=1` overall).

## 7. Disclosure

- A stray-shell incident: one parallel command's `cd` into a not-yet-created scratch directory
  failed and a fetch wrote `body.b64` and `body.cc` (7 800 / 5 849 bytes) into the fleet root
  `/home/vgpnk/Projects/shokunin/`. They were removed immediately in the next command
  (`rm -f body.b64 body.cc`, exit 0, verified absent); nothing else in the fleet root was written by
  this seat and no byte from that misdirected fetch is used anywhere in this report. The 154 fetch was
  redone in scratch and is the one reported (`8c8d6796…`).
- No lane tracked file, lane index, jj state, fleet repo or sibling lane was touched. The only
  scratches written outside `.ufo/waves/round-29/w2/` are under `$HYAKU_SCRATCH/tabi-r29/RefetchS096/`.
- No tools installed or upgraded.
- Unrun checks: none claimed. All commands above were run; exit codes stated inline.

## 8. Findings summary

| item | result |
|---|---|
| S096 file @156 status/sha vs receipt | agree (200, `2a96a97b…f8f86102`) |
| S096 file @154 status/sha vs receipt | agree (200, `8c8d6796…b8c36916`) |
| committed bytes vs my fetch | byte-identical both tags |
| my recomputed verdict | drifted (only `174-328`) |
| counter verdict at tip | none (`f6-refetch`; refetch dir absent) → C3 unverified |
| counter verdict with my refetch (probe A) | drifted, resolved via S114 — agree |
| S114 ranges/digest/commit/blob/teaches/quote | all true of my 156 bytes |
| filing completeness for S096 | complete both directions |
| attack 1 subset filing | **confirmed gap** (drifted row reports holds) |
| attack 2 content-blind supersession | **confirmed gap** (bogus superseder accepted) |
| attack 3 f6 testimonial | noted, inherent, no action |
