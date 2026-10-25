# Scout02 — S106 exact source citation/receipt inspection and round-Gate located-quote proposal

Seat `Scout02` (scout, leaf; item 62). Lane root
`/home/vgpnk/Projects/shokunin/tabi-shokunin`. Read-only seat: **no tracked file was
edited, no git/jj write was run, no network fetch was performed** (the round's
`notClaimed` forbids real-site interaction, and the S106 bytes are already committed in
the lane, so a fresh fetch is neither needed nor permitted here). Every number below
is reproduced from committed blobs at the frozen baseline
`eb23c0b84668afc48ebab8bd7e4a8a4457407cc4` unless stated otherwise.

Frozen claims read for this seat:
`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-28/claims.json`
(`baseline eb23c0b84668afc48ebab8bd7e4a8a4457407cc4`, `frozenBeforeData: true`,
C1 = depth / S106 evidence-gate revision binding, C2 = calibration / m1 supersession).
Prior independent defect evidence read:
`corpus/lessons/round-27-verifier-spotcheck.md:15-17,46-47`.

---

## 1. Verdict summary

| Question | Answer | Confidence |
|---|---|---|
| What exactly does the S106 row cite? | Chromium tag `154.0.8037.97` `content/public/common/content_features.cc` via `?format=TEXT` (base64 transfer), anchor at **decoded line 187** (comment line 186) | observation (byte-level) |
| Is the receipt byte-consistent with the committed bytes? | Yes — sha256, byte count, anchor line and anchor uniqueness all match | observation |
| Does the receipt bind a **measurement revision**? | **No.** The receipt has no revision/commit/measurement field at all | observation |
| Does the gate check the receipt *at a named revision*? | It reads receipt and bytes at the same `--rev` argument, but the receipt names no revision, so nothing pins *which* revision the measurement was taken at | observation + inference (marked) |
| Is the registry row's anchor cell byte-exact with the source line? | **No** — the cell drops the trailing `;` that line 187 carries | observation |
| Are the committed bytes fetch-provenance-verifiable? | Yes — the base64 transfer itself is committed (`.ufo/waves/round-26/s106-encoded.bin`) and decodes byte-identically to the committed decoded file | observation |

---

## 2. The exact source citation (S106)

Registry row `corpus/SOURCES.md:120` (blob `03dd2fc9a37506d830b163ba91a9075173458831`
at baseline; 107 registry rows at baseline by
`git show <baseline>:corpus/SOURCES.md | grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|'`).

Parsed cells of that row (verified by splitting on `|`, index 0-based):

```
0  S106
1  Chromium 154 content_features.cc — BackForwardCache feature — https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/content/public/common/content_features.cc?format=TEXT
2  code
3  A
4  The shipped default enablement of the BackForwardCache feature at Chromium tag 154.0.8037.97 only
5  tag 154.0.8037.97; decoded text lines 186-187 carry `BASE_FEATURE(kBackForwardCache, base::FEATURE_ENABLED_BY_DEFAULT)` with the comment `// Enable using the BackForwardCache.`
6  BackForwardCache ships as an enabled-by-default feature at this tag, so a clean launch without --disable-back-forward-cache exercises it; no runtime claim follows from a source alone
7  mined
8  2026-10-25
9  on-release
10 corpus/knowledge/bfcache-runtime-observed-round-25.md
```

**Citation-defect (new, minor, byte-level).** Cell 5's quoted feature text is
`BASE_FEATURE(kBackForwardCache, base::FEATURE_ENABLED_BY_DEFAULT)` — **without** the
trailing `;` — while the source line 187 ends with `);`:

```
$ python3 -c "<split cell 5 of the S106 row>"
'...FEATURE_ENABLED_BY_DEFAULT)'  in cell  -> True
'...FEATURE_ENABLED_BY_DEFAULT);' in cell  -> False
```

The committed receipt's `anchor.text` **is** byte-exact including the `;`. So a Gate
quote copied out of the registry row would not be byte-exact with the source line. This
is a cell-level citation-precision defect, not a scope defect; it is the same class the
round-27 spot-check caught on S107's registry quote (`round-27-verifier-spotcheck.md:44`).

---

## 3. The receipt — `corpus/evidence/round-26/sources/s106.json`

Blob `e2cc93298c4df00cbac614b6d8ebebff705ddbfb` at baseline, **unchanged** since it was
first committed in `0c666adc217685e1ece2af8596b732b303a3b15c` (round-26 landing) —
`git log --oneline -- corpus/evidence/round-26/sources/s106.json` lists exactly one
commit, and `git rev-parse <rev>:…/s106.json` is the same blob id at `0c666ad`,
`5577d1b6fe2dc298486e354b5416d38acafeffaa` and baseline `eb23c0b`.

Top-level keys (measured, `json.load` key list):

```
['schema', 'row', 'url', 'fetched_at', 'transfer', 'encoded_bytes', 'encoded_sha256',
 'bytes_path', 'decoded_bytes', 'decoded_lines', 'decoded_sha256', 'anchor',
 'verification', 'status']
```

### 3.1 The revision-binding gap (this is C1's subject, stated as evidence)

**Observation.** There is **no** key matching `rev|commit|measur` in the receipt —
`python3 -c "…[k for k in d if 'rev' in k.lower()]"` → `[]`; a plain grep of the receipt
for `rev|commit|measur` returns only prose inside `verification.result` and `status`.
The receipt's own `status` field says so in its own words:

> "this receipt is evidence-of-record, not a claim receipt."

**Observation.** `scripts/check-s106-evidence.mjs` (blob
`45138be8395d837c2338b21911de7c47689144ba`, sha256
`ef12a6fbe27068bf6d1171910dd54d9ccedef51e9e075c902005bc49a955e91d` at baseline) reads
both artifacts at the *same* `--rev`:

```js
const receiptText = readBlob(repo, rev, RECEIPT_PATH);   // scripts/check-s106-evidence.mjs:109
const bytesText   = readBlob(repo, rev, receipt.bytes_path); // :114
```

`parseReceipt` (:89-101) requires only `url`, `decoded_sha256`, `bytes_path`,
`decoded_bytes`, `anchor.line`, `anchor.text` — **no revision field is required or
checked**.

**[INFERENCE]** Consequently the current gate answers "are the committed bytes
consistent with the committed receipt?" but not "were these bytes measured at the
revision the receipt names?". A receipt authored at one revision and re-used at a later
revision with identical bytes is indistinguishable from one measured at the later
revision, because the bytes blob id is constant across the whole history (see §4).

**Feasibility, measured (for the executor seat, not a repair by this seat).** A
revision-binding check is mechanically implementable with what is already committed:
the decoded bytes blob id `1ec86eaac948e8c295def4a70273bd7e75e01446` is **identical** at
`0c666ad`, `5577d1b` and baseline `eb23c0b`, and

```
$ for r in 0c666ad… 5577d1b… eb23c0b…; do git show $r:corpus/evidence/round-26/sources/content-features-154.0.8037.97.cc | sha256sum; done
9b93fe64843ecf81…   (all three, identical)
```

so a receipt field naming a measurement revision can be verified by re-reading the bytes
at *that* revision and re-hashing them — a real red/green fixture pair. The
`missing-source` path stays could-not-evaluate: `corpus/evidence/round-26/sources/…`
does not exist before `0c666ad` (`git cat-file -e 0c666ad^:<path>` → "exists on disk, but
not in …").

### 3.2 Fields the gate does *not* check (adjacent, worth naming)

`encoded_bytes` (98604) and `encoded_sha256`
(`f17347b21887a56f643cd52356b3a8f7664516c8563f8950a07172f7385a9b03`) are recorded but
`parseReceipt` never validates them, and `verification.command` says
`base64 -d s106-encoded.bin > content-features-154.0.8037.97.cc` — a relative name that
resolves only if run from `.ufo/waves/round-26/`. This is where a *fetch-provenance*
binding would live, and it is currently unproven by the gate (though it is provable by
hand — see §5).

---

## 4. The committed bytes — `corpus/evidence/round-26/sources/content-features-154.0.8037.97.cc`

Blob `1ec86eaac948e8c295def4a70273bd7e75e01446`, introduced in `0c666ad` and unchanged
thereafter (`git log --oneline --all -- <path>` shows only `0c666ad` on
`refs/heads/master`; the two other refs are jj `keep/` snapshots of the same commit).

Measured from the committed blob (`git show <baseline>:<path>`):

| Property | Value | Command |
|---|---|---|
| bytes | 73952 | `git show … \| wc -c` |
| lines | 1624 (1625 split segments; file ends with `\n`) | `wc -l` / `split('\n')` |
| sha256 | `9b93fe64843ecf819202fa6de9833597203b3f53f6572c144b76f247424e6c44` | `sha256sum` |
| anchor line 187 | `BASE_FEATURE(kBackForwardCache, base::FEATURE_ENABLED_BY_DEFAULT);` | `sed -n '187p'` |
| comment line 186 | `// Enable using the BackForwardCache.` | `sed -n '186p'` |
| anchor occurrences (exact trimmed line) | **1** | `grep -c` |
| `BASE_FEATURE(kBackForwardCache,` occurrences | 1 (line 187) | `grep -n` |
| `kBackForwardCache` substring occurrences | **4** (lines 187, 191, 203, 215) | `grep -n` |

**Locator-precision note.** A Gate quote must be the **full line 187**, not the token
`kBackForwardCache`: the bare substring matches four lines in the file
(`kBackForwardCache`, `kBackForwardCacheEntryTimeout` :191, `kBackForwardCacheMemoryControls`
:203, `kBackForwardCacheCCNSIgnoreUnchangedCookies` :215), while the full line with its
trailing `;` is unique.

---

## 5. Fetch provenance is provable from committed bytes (observation)

The base64 transfer is itself committed at `.ufo/waves/round-26/s106-encoded.bin`
(blob size 98604 at HEAD; sha256
`f17347b21887a56f643cd52356b3a8f7664516c8563f8950a07172f7385a9b03`, matching the
receipt's `encoded_sha256`), and

```
$ base64 -d .ufo/waves/round-26/s106-encoded.bin | cmp - corpus/evidence/round-26/sources/content-features-154.0.8037.97.cc
→ identical (cmp exits 0)
$ base64 -d .ufo/waves/round-26/s106-encoded.bin | sha256sum
9b93fe64843ecf819202fa6de9833597203b3f53f6572c144b76f247424e6c44   (== receipt decoded_sha256)
```

So the receipt's whole chain (encoded digest → decoded digest → anchor line) is
reproducible from committed bytes alone, with no network. The gate does not currently
assert the encoded leg (§3.2).

---

## 6. Gate state at the frozen baseline (measured, not claimed)

```
$ node scripts/check-s106-evidence.mjs --rev eb23c0b84668afc48ebab8bd7e4a8a4457407cc4 --json
present=true  sha_match=true  anchor_located=true  anchor_unique=true
byte_count_match=true  valid=true            exit 0

$ node scripts/check-s106-evidence.mjs --selftest --json
cases=5 passed=5 ok=true   exit 0
  clean-fixture-valid                   exit 0  valid=true
  sha-mismatch-invalid                  exit 1  valid=false
  anchor-off-by-one-invalid             exit 1  valid=false
  missing-bytes-could-not-evaluate      exit 2
  missing-receipt-could-not-evaluate    exit 2
```

This confirms C1's frozen `before` ("5 cases at baseline …") and its `before` gate
verdict. The two could-not-evaluate cases are the fetch/absence path the frozen claim
requires to be preserved ("Missing source fetch remains could-not-evaluate").

---

## 7. Proposed located quote(s) for the round-28 `## Gate`

Round 28's frozen claims admit **no new source row** (`notClaimed`: "no sourced claim
this round unless an already-open source is explicitly reopened and cited"), so the
Gate's job here is to carry the source the round's C1 actually rests on — S106 — with
your own located quote, per `tabi-round-28.md` §2b.1 ("the lesson's `## Gate` records
the URL, access date, and a ≤25-word located quote for every new row") and the
re-grounding rule ("your Gate block carries YOUR access date and ≤25-word located quote").

All three candidates below are located in the **committed** bytes
`corpus/evidence/round-26/sources/content-features-154.0.8037.97.cc` (blob
`1ec86eaac948e8c295def4a70273bd7e75e01446`, sha256 `9b93fe64…`, 73952 B), verified
line-by-line above. Word counts are whitespace-token counts, ≤25 as required.

### Q1 — PRIMARY (7 words), lines 186–187

> `// Enable using the BackForwardCache. BASE_FEATURE(kBackForwardCache, base::FEATURE_ENABLED_BY_DEFAULT);`

Located: `corpus/evidence/round-26/sources/content-features-154.0.8037.97.cc:186-187`.
Byte-exact against the file, including the trailing `;` that the registry row omits.
URL: `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/content/public/common/content_features.cc?format=TEXT`.
This is the same anchor the committed receipt names (`anchor.line=187`,
`anchor.comment_line=186`), so the Gate quote and the receipt agree byte-for-byte.

### Q2 — SCOPE CAVEAT, memory (19 words), lines 193–194

> `// BackForwardCache is disabled on low memory devices. The threshold is defined via a field trial param: "memory_threshold_for_back_forward_cache_in_mb"`

Located: same file, `:193-194`. Recommended **in addition to Q1** if the Gate carries a
scope sentence, because S106's `teaches` cell says the feature "ships as an
enabled-by-default feature", and the source itself bounds that: the feature is disabled
on low-memory devices. The round-25 critic already raised exactly this reading
(`.ufo/waves/round-25/w1/CritNoHarm.md`: "kBackForwardCache is ENABLED_BY_DEFAULT, but
memory controls disable it on low-memory Android — the row and entry must not say
'always enabled'"). S106's current scope cell does say "only", so the row is not
over-claiming; the Gate quote is what makes the bound *visible in the lesson*.

### Q3 — SCOPE CAVEAT, platform (19 words), lines 201–202

> `// BackForwardCacheMemoryControls is enabled only on Android to disable BackForwardCache for lower memory devices due to memory limitations.`

Located: same file, `:201-202`. Use this instead of Q2 if the Gate wants the platform
bound specifically (the control feature is `FEATURE_ENABLED_BY_DEFAULT` only under
`#if BUILDFLAG(IS_ANDROID)` — lines 203-209).

**Recommendation to the L1:** cite **Q1** as the located quote for S106 (it is the
anchor the receipt binds and the only one that is unique in the file), and add **Q2** as
the scope-bounding quote if the Gate says anything about "enabled by default". Do not
carry the registry row's semicolon-stripped variant as the quote.

**Honesty caveat for the Gate writer.** This seat did **not** re-open the source over the
network (round forbids real-site interaction). The quote is located in the lane's
**committed** decoded bytes, whose sha256 matches the receipt and whose base64 source
transfer is also committed and decodes byte-identically (§5). If the Gate block must
carry a *fresh* access date for the S106 URL, that re-open has to be done by a seat
with network authority and its own access date; this seat's evidence supports the
byte-exact location and the anchor, not a 2026-10-25 network access. Round-26's Gate
already records that same re-open with its own date (`corpus/lessons/round-26.md:30`).

---

## 8. Adjacent context the L1 should not have to re-derive

- **Gate taxonomy is already right for C1's kill rule.** Missing receipt → exit 2
  could-not-evaluate; missing bytes → exit 2; content disagreement → exit 1 invalid.
  The C1 revision binding must not turn any of these into exit 1.
- **The round-27 verifier's C2 verdict for depth was "unprovable"** because
  "the S106 receipt has no revision field" (`corpus/lessons/round-27-verifier-spotcheck.md:17`).
  §3.1 confirms that field is still absent at baseline — this is the exact defect C1
  names, verified independently here.
- **C2's target is live at baseline.** `node scripts/check-selfassessment.mjs --rev
  eb23c0b… --json` → `mismatches=1 clean=false superseded=10`; the finding list shows
  `m1-selftest-tally` at **LOG.md:221** with `claimed=8 observed=12 superseded=true`
  (script `scripts/check-freshness.mjs`), and `node scripts/check-freshness.mjs
  --self-test` currently reports `cases=12`. So LOG.md:221 is at baseline a
  **false-clear** (an 8-tally marked superseded by a paragraph that does not cite
  `:221`), with the true 12-tally sitting unsuperseded at LOG.md:254. This is
  corroboration for C2, not this seat's claim to fix.
- **Census at baseline is green**: `scripts/sources-census.sh validate --root
  /home/vgpnk/Projects/shokunin tabi` → `tabi ok …` exit 0 (16 W04 duplicate-URL
  warnings, all pre-existing and outside S106).
- **Round-28 lesson does not yet exist**: `corpus/lessons/round-28.md` is absent at
  baseline. `scripts/round-evidence-audit.mjs` requires the lesson's `## Gate` to
  record a spot-check result or name it owed (`gateRecordsSpotCheck`,
  `scripts/round-evidence-audit.mjs:221-226`).

## 9. Tooling

No tool was installed or upgraded by this seat (read-only inspection; `node`, `git`,
`python3`, `sha256sum`, `base64`, `grep`, `sed` were all already present). Nothing to
record under `/home/vgpnk/.omp/agent/RULES.md`; no pacman transaction was attempted
(pacman remains PAUSED host-wide).

## 10. Unknowns / limits of this seat

- No network re-open of the S106 URL → the Gate's *access date* for S106 is not
  established by this seat (§7 honesty caveat).
- Whether the round-28 `## Gate` will name S106 at all is the L1's call; round 28's
  frozen claims admit no new row, so Q1/Q2/Q3 are offered as the located quote if the
  Gate carries the source C1 rests on, and are not a demand for a new registry row.
- The proposed revision-binding *mechanism* (§3.1) is feasibility evidence measured
  here; the implementation and its ≥7-case selftest belong to the executor seat, and
  this seat did not repair any production code.
